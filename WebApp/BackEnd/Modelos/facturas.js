var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Clientes = require("./clientes");

var Empleados = require("./empleados");

var Detalles = require("./detalles");

var Productos = require("./productos");

var LineaCarrito = require("./lineaCarrito");

var Carrito = require("./carrito");

var LineaPagosClientes = require("./lineaPagosClientes");

var PagosClientes = require("./pagosClientes");

var moment = require('moment');

var Promesa = require('bluebird');

var Facturas = conexion.define('facturas', {

 idFactura: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true 
 },

 Fecha: {
    type : conexion.Sequelize.DATE(6),
    allowNull : false
  },

 Estado: {
    type : conexion.Sequelize.CHAR(2),
  },

 Tipo: {
    type : conexion.Sequelize.CHAR(2),
  },

  
  },
  
  {
  timestamps : false
  });

  Facturas.belongsTo(Clientes,{foreignKey : 'idCliente'});
  Facturas.belongsTo(Empleados,{foreignKey : 'idEmpleados'});
  Facturas.hasMany(Detalles,{foreignKey : 'idFactura'});
  Facturas.hasMany(LineaPagosClientes,{foreignKey : 'idFactura'});

 
  Facturas.crear = function (factura,t) {
    factura.Fecha = moment().format('YYYY-MM-DD HH:mm');
    return Facturas.create(factura,{transaction : t});
  }

  Facturas.borrar = function(_idFactura,t) {
    return Facturas.destroy({
      where : {
        idFactura : _idFactura
      },
      transaction : t
    })
  }


  Facturas.borrarFactura = function(_idFactura) {
    return conexion.transaction(t =>{
      return Detalles.buscarPorFactura(_idFactura,t)
      .then(detalles=> {
        return Promesa.map(detalles,function(lineaDetalle){
          return Detalles.borrar(lineaDetalle.idDetalles,t)
        })
        .then(()=>{
          return Facturas.borrar(_idFactura,t)  
        })
      })
    }) 
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar la factura ya que esta asociada a un Pago')
      else return err
    })
  }

  Facturas.borrarDetalle = function(_idDetalles,_idFactura) {
    return conexion.transaction(t =>{
      return Detalles.borrar(_idDetalles,t)
      .then(()=>{
        return Detalles.buscarPorFactura(_idFactura,t)
        .then(detalles =>{
          if(detalles.length === 0)
            return Facturas.borrar(_idFactura,t)
        })
      })
    })
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar la factura ya que esta asociada a un Pago')
      else return err
    })
  }

  Facturas.agregarFactura = function(obj) { 
    return conexion.transaction(t =>{
      return Facturas.crear(obj.factura,t)
      .then(facturaNueva =>{
        return Facturas.agregarDetalle(obj.detalle,facturaNueva.idFactura,t)
      })
    })
    .then(resultado =>{
      return armarResultado(resultado)
    })
  }

  Facturas.agregarDetalle = function (detalles,idFactura,t) {
    return Promesa.map(detalles,function(lineaDetalle){
      return Productos.descontarStock(lineaDetalle.Cantidad,lineaDetalle.producto.idProductos,t)
      .then(function(){
        return Productos.obtenerPrecio(lineaDetalle.producto.idProductos)
        .then(function(producto){
          return Detalles.crearDetalle(lineaDetalle,idFactura,producto.Precio,t)
        })
      })
    })
  }

  var armarResultado = function(detalle) {
    var objetoFinal = [];
    return Promesa.each(detalle,lineaDetalle =>{
      return obtenerDatosProductos(lineaDetalle)
      .then(producto =>{
        var objeto = {};
        objeto.Nombre = producto.Nombre;
        objeto.Precio = producto.Precio;
        objeto.Stock = producto.Stock
        objeto.Cantidad = lineaDetalle.Cantidad;
        objeto.Total = lineaDetalle.Precio;
        objetoFinal.push(objeto)
      })
    })
    .then(function(){
      return objetoFinal;
    })
  }

  var obtenerDatosProductos = function(detalle) {
    return Productos.obtenerPorId(detalle.idProductos)
  }

  Facturas.entregarProductosCarrito = function(obj) {
    return conexion.transaction(t=>{
      return LineaCarrito.buscarPorCarritoEncargado(obj.idCarrito,t)
      .then(detalle =>{
        return Facturas.agregarFacturaDesdeCarrito(obj.factura,detalle,t)
        .then(facturaNueva =>{
          return Carrito.borrarCarrito(obj.idCarrito,t)
          .then(() =>{
            if(obj.factura.Estado === 'P') {
              return Clientes.buscarPorId(obj.factura.idCliente)
              .then(cliente =>{
                cliente.Saldo = 0;
                return PagosClientes.registrarPago(cliente,facturaNueva,obj.factura.Total,'D',t)  
              })
            }
          })
        }) 
      })
    })
  }

  Facturas.agregarFacturaDesdeCarrito = function(factura,detalle,t) { 
    return Facturas.crear(factura,t)
    .then(facturaNueva =>{
      return Facturas.agregarDetalleDesdeCarrito(detalle,facturaNueva.idFactura,t)
      .then(() =>{
        var arrayFacturas = [];
        arrayFacturas.push(facturaNueva);
        return arrayFacturas;
      })
    })
  }

  Facturas.agregarDetalleDesdeCarrito = function (detalle,idFactura,t) {
    return Promesa.map(detalle, lineaDetalle =>{
      return Detalles.crearDetalle(lineaDetalle,idFactura,lineaDetalle.PrecioProducto,t)
    })
  }  

  Facturas.buscarPorFecha = function(fechaInicio,fechaFin,_offset) {
    fechaFin = fechaFin + ' 23:59:59'
    return  Facturas.findAndCountAll({
      include : [
      {       
        model : Detalles,
        required : true,
        attributes : ['idDetalles','Cantidad','Precio'],
      },

      {
        model : Clientes,
        required : false,
        attributes : [[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre']]
      }
      ],
      
      attributes : ['idFactura',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %h:%i:%s'), 'Fecha'],
                    'Tipo',[conexion.fn('SUM', conexion.literal("detalles.Precio * detalles.Cantidad")), 'Total'],'Estado'],                          
      where : {
        Fecha : {between : [fechaInicio,fechaFin]}
      },
      subQuery : false,
      order : 'facturas.idFactura DESC',
      group : ['facturas.idFactura'],
      offset : parseInt(_offset),
      limit : 10,
    })
    .then(resultado =>{
      var facturas = {
        rows : resultado.rows,
        count : resultado.count.length
      }
      return facturas
    })
  }

  
  Facturas.buscarPorId = function(_idFactura) {
   return  Facturas.find({
    include : [
    {       
      model : Detalles,
      required : true,
      attributes : ['idDetalles','Cantidad','Precio'],
    },

    {
      model : Clientes,
      required : false,
      attributes : [[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre']]
    }
    ],

    attributes : ['idFactura',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                  'Tipo',[conexion.fn('SUM', conexion.literal("detalles.Precio * detalles.Cantidad")), 'Total'],'Estado'],                            
    where : {
      idFactura : _idFactura,
    },
    order : 'idFactura',
    group : 'idFactura'
    })
  }  

  Facturas.buscarPorProducto = function(_idProductos) {
   return  Facturas.findAll({
    include : [
    {       
      model : Detalles,
      required : true,
      attributes : [],
    },

    {
      model : Clientes,
      required : false,
      attributes : [[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre']]
    }
    ],
    attributes : ['idFactura',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],'Estado'],                            
    subQuery :false,
    order : 'idFactura DESC',
    limit : 10,
    where : conexion.literal('detalles.idProductos = ' + _idProductos)
    })
  }  

  
  Facturas.buscarDetalles = function(_idFactura) {
    return Detalles.buscarPorFactura(_idFactura)
  }

  Facturas.traerCuenta = function(_idCliente,_estado,_offset,_limit) {
    var tipoOrden = 'ASC'
    if(_limit) {
      _limit = parseInt(_limit)
      tipoOrden = 'DESC'
    }

    return  Facturas.findAndCountAll({
      include : [
      {       
        model : Detalles,
        required : true,
        attributes : ['idDetalles','Cantidad','Precio'],
      }],
      attributes : ['idFactura',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    'Tipo',[conexion.fn('SUM', conexion.literal("detalles.Precio * detalles.Cantidad")), 'Total'],'Estado'],                            
      where : {
        idCliente : _idCliente,
        Estado : {
          $like : "%" + _estado + "%"
        }
      },
      subQuery : false,
      order : 'facturas.idFactura ' + tipoOrden,
      group : 'facturas.idFactura',
      offset : parseInt(_offset),
      limit : _limit,
      })
    .then(result => {
      return facturas = {
        rows : result.rows,
        count : result.count.length
      }
    })
  }  

  Facturas.cobrarCuenta = function(montoAbonado,_idCliente) {
    return Clientes.buscarPorId(_idCliente)
    .then(_cliente =>{
      return conexion.transaction(t =>{
        return controlSaldoAnterior(_cliente,montoAbonado,t)
        .then(resControl => {
          return Facturas.traerCuenta(_idCliente,'CC',0,null)
          .then(facturas => {
            return Facturas.actualizarEstadoYSaldo(facturas.rows,_idCliente,resControl.nuevoMontoAbonado,t)//nuevoMontoAbonado = montoAbonado - Saldo
            .then(resultado =>{
              return PagosClientes.registrarPago(_cliente,resultado.facturasPagadas,montoAbonado,'CC',t)
              .then(()=>{
                return resultado
              })
            })
          })
        })    
      })
    })  
  }

  Facturas.actualizarEstadoYSaldo = function(facturas,_idCliente,nuevoMontoAbonado,t) {
    var facturasPagadas = [];
    return Promesa.each(facturas,factura =>{ 
      if(nuevoMontoAbonado > 0 ){
        return Facturas.modificarEstado(factura.idFactura,'P',t)
        .then(() =>{
          nuevoMontoAbonado -= factura.get('Total');
          //nuevoMontoAbonado -= factura.Total;
          facturasPagadas.push(factura)
        })
      }
    })
    .then(()=> {
      return controlNuevoSaldo(_idCliente,nuevoMontoAbonado,t) 
      .then(resControl =>{
        var objeto  = {
          facturasPagadas : facturasPagadas,
          nuevoSaldo : resControl.saldo
        }
        return objeto;
      })
    })
  }

 Facturas.modificarEstado = function(_idFactura,_estado,t) {
    return Facturas.update({
      Estado : _estado
      },
      {
        where : {idFactura : _idFactura}
      ,transaction : t
    })
  }

  /*Por restriccion de Sequelize uso el Modelo facturas para llamar a funciones del Modelo PagosClientes*/

  Facturas.buscarLineaPagosClientes = function(_idPagosClientes) { 
    return PagosClientes.buscarLineaPagosClientes(_idPagosClientes,Facturas)
  }

  Facturas.borrarPagosClientes = function(_idPagosClientes) {
    return PagosClientes.borrarPago(_idPagosClientes,Facturas);
  }

  /*Por restriccion de Sequelize uso el Modelo facturas para llamar a funciones del Modelo PagosClientes*/

module.exports = Facturas;

var carritoVacio = function(_idCliente) {
  return Facturas.findAll({
      raw : true,
      attributes : ['idFactura'],
      where : {
        idCliente :_idCliente,
        Estado : 'CR'
      }
    })
}

var controlFacturaVacia = function(_idFactura) {
    return Detalles.find({
      where : {
        idFactura : _idFactura
      }
    })
    .then(function(detalle){
      if(detalle === null) {
        return Facturas.borrarFactura(_idFactura);
      }
      else {
        return
      }
    })
  }

  var controlSaldoAnterior = function(cliente,montoAbonado,t) {
    var respuesta,
        promesaAux;

    respuesta = {
      nuevoMontoAbonado : montoAbonado-cliente.Saldo,
    }
    promesaAux = new Promise(function(resolve,reject){
      resolve(respuesta);
      reject('Error Control Saldo Anterior');
    })
    return promesaAux;
  }

  var controlNuevoSaldo = function(_idCliente,montoRestante,t) { //montoRestante = nuevoMontoAbonado - (Total de Facturas Pagadas)
    var respuesta,
    nuevoSaldo;

    if(montoRestante < 0) 
      nuevoSaldo = -(montoRestante);
    else 
      nuevoSaldo = 0;

    return Clientes.actualizarSaldo(nuevoSaldo,_idCliente,t)
    .then(() =>{
      respuesta = {
        saldo : parseFloat(nuevoSaldo.toFixed(2))
      }
      return respuesta;
    })
  }

 