var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Proveedores = require("./proveedores");

var Productos = require("./productos");

var LineaCompras = require("./LineaCompras");

var LineaCarrito = require("./lineaCarrito");

var PagosProveedores = require("./pagosProveedores");

var LineaPagosProveedores = require("./lineaPagosProveedores");

var Promesa = require('bluebird');

var moment = require('moment');

var Compras = conexion.define('compras', {

 idCompras: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Fecha: {
    type : conexion.Sequelize.DATEONLY,
    allowNull : false
  },
  
  Estado: {
    type : conexion.Sequelize.CHAR(2),
  },

  },
  
  {
  timestamps : false
  });

  Compras.belongsTo(Proveedores,{foreignKey : 'idProveedores'});
  Compras.hasMany(LineaCompras,{foreignKey : 'idCompras'});
  Compras.hasMany(LineaPagosProveedores,{foreignKey : 'idCompras'}); //revisar


  Compras.crear = function (compra,t) {
    compra.Fecha = moment().format('YYYY-MM-DD HH:MM');
    return Compras.create(compra,{transaction : t});
  }

  Compras.agregarCompra = function(obj) { 
    return conexion.transaction(t =>{
      return Compras.crear(obj.compra,t)
      .then(compraNueva =>{
        return Compras.agregarLinea(obj.detalle,compraNueva.idCompras,t)
      })
    })
    .then(resultado =>{
      return armarResultado(resultado)
    })
  }

  Compras.agregarLinea = function (detalleCompra,idCompra,t) {
    return Promesa.map(detalleCompra,function(lineaCompra){
      return Productos.devolverStock(lineaCompra.Cantidad,lineaCompra.idProductos,t)
      .then(function(){
        return Productos.actualizarPrecioCosto(lineaCompra.idProductos,lineaCompra.PrecioCosto,t)
        .then(producto =>{
          return LineaCompras.crear(lineaCompra,idCompra,t)
        })
      })
    })
  }

      
  var armarResultado = function(detalleCompras) {
    var objetoFinal = [];
    return Promesa.each(detalleCompras,lineaCompra =>{
      return obtenerDatosProductos(lineaCompra)
      .then(producto =>{
        var objeto = {};
        objeto.Nombre = producto.Nombre;
        objeto.Precio = producto.PrecioCosto;
        objeto.Stock = producto.Stock;
        objeto.Cantidad = lineaCompra.Cantidad;
        objeto.Total = lineaCompra.Precio;
        objetoFinal.push(objeto)
      })
    })
    .then(function(){
      return objetoFinal;
    })
  }

  var obtenerDatosProductos = function(lineaCompra) {
    return Productos.obtenerPorId(lineaCompra.idProductos)
  }

  Compras.pagarProveedor = function(montoAbonado,_idProveedor) {
    return Proveedores.buscarPorId(_idProveedor)
    .then(_proveedor =>{
      return conexion.transaction(t =>{
        return controlSaldoAnterior(_proveedor,montoAbonado,t)
        .then(resControl => {
          return Compras.buscarPorProveedor(_idProveedor,'I')
          .then(compras => {
            return Compras.actualizarEstadoYSaldo(compras,_idProveedor,resControl.nuevoMontoAbonado,t)//nuevoMontoAbonado = montoAbonado - Saldo
            .then(resultado => {
              return PagosProveedores.registrarPago(_proveedor,resultado.comprasPagadas,montoAbonado,t)
              .then(()=> {
                return resultado
              })
            })
          })
        })    
      })
    })
  }

  Compras.actualizarEstadoYSaldo = function(compras,_idProveedor,nuevoMontoAbonado,t) {
    var comprasPagadas = [];
    return Promesa.each(compras,compra =>{ //Break en else
      if(nuevoMontoAbonado > 0 ){
        return Compras.modificarEstado(compra.idCompras,'P',t)
        .then(() =>{
          nuevoMontoAbonado -= compra.get('Total');
          comprasPagadas.push(compra)
        })
      }
    })
    .then(()=> {
      return controlNuevoSaldo(_idProveedor,nuevoMontoAbonado,t) 
      .then(resControl =>{
        var objeto  = {
          comprasPagadas : comprasPagadas,
          nuevoSaldo : resControl.saldo
        }
        return objeto;
      })
    })
  }
   
  Compras.buscarPorFecha = function(fechaInicio,fechaFin,_offset) {
  fechaFin = fechaFin + ' 23:59:59'
   return  Compras.findAndCountAll({
      include : [
      {       
        model : LineaCompras,
        required : true,
        attributes : ['idLineaCompras','Cantidad','Precio'],
      },
      {
        model : Proveedores,
        required : true,
        attributes : ['Nombre']
      }
      ],
      attributes : ['idCompras',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    [conexion.fn('SUM', conexion.literal('lineacompras.Precio * lineacompras.Cantidad')), 'Total'],'Estado'],
      where : {
        Fecha : {between : [fechaInicio,fechaFin]}
      },
      subQuery : false,
      order : 'compras.idCompras Desc',
      group : ['compras.idCompras'],
      offset : parseInt(_offset),
      limit : 5,
    })
    .then(resultado =>{
      var compras = {
        rows : resultado.rows,
        count : resultado.count.length
      }
      return compras
    })
  }


  Compras.buscarLineaCompras = function(_idCompras) {
    return LineaCompras.buscarPorCompra(_idCompras);
  }

  Compras.borrar = function(_idCompras,t) {
    return Compras.destroy({
      where : {
        idCompras : _idCompras
      },
      transaction : t
    })
  }

  Compras.borrarCompra = function(_idCompras) {
    return conexion.transaction(t =>{
      return LineaCompras.buscarPorCompra(_idCompras,t)
      .then(lineacompras=> {
        return Promesa.map(lineacompras,linea =>{
          return LineaCompras.borrar(linea.idLineaCompras,t)
        })
        .then(()=>{
          return Compras.borrar(_idCompras,t)  
        })
      })
    }) 
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar la compra ya que esta asociada a un Pago')
      else return err
    })
  }

  Compras.borrarLineaCompras = function(compra) {
    return conexion.transaction(t =>{
      return LineaCompras.borrar(compra.idLineaCompras,t)
      .then(() =>{
        return LineaCompras.buscarPorCompra(compra.idCompras,t)
        .then(lineaCompras =>{
          if(lineaCompras.length === 0)
            return Compras.borrar(compra.idCompras,t)
        })
      })
    })
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar la compra ya que esta asociada a un Pago')
      else return err
    })
  }


  Compras.buscarPorId = function(_idCompras) {
   return  Compras.find({
    include : [
    {       
      model : LineaCompras,
      required : true,
      attributes : ['idLineaCompras','Cantidad','Precio'],
    },
    {
      model : Proveedores,
      required : true,
      attributes : ['Nombre'],
    }
    ],
    attributes : ['idCompras',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                  [conexion.fn('SUM', conexion.literal('lineacompras.Precio * lineacompras.Cantidad')), 'Total'],'Estado'],
    where : {
      idCompras : _idCompras,
    },
    order : 'idCompras',
    group : 'idCompras'
    })  
  }

    /*CAMBIAR EL TOTAL DE COMPRAS COMO EL DE FACTURAS*/


  Compras.buscarPorProveedor = function(_idProveedor,_estado) {
   return  Compras.findAll({
    include : [
    {       
      model : LineaCompras,
      required : true,
      attributes : ['idLineaCompras','Cantidad','Precio'],
    }],
    attributes : ['idCompras',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                [conexion.fn('SUM', conexion.literal('lineacompras.Precio * lineacompras.Cantidad')), 'Total'],'Estado'],
                
    where : {
      idProveedores : _idProveedor,
      Estado : {
        $like : "%" + _estado + "%"
      }
    },
    order : 'idCompras',
    group : 'idCompras'
    })  
  }

  Compras.traerCuenta = function(_idProveedores,_estado,_offset,_limit) {
    var tipoOrden = 'ASC'
    if(_limit) {
      _limit = parseInt(_limit);
      tipoOrden = 'DESC';
    }

    return  Compras.findAndCountAll({
      include : [
      {       
        model : LineaCompras,
        required : true,
        attributes : ['idLineaCompras','Cantidad','Precio'],
      }],
      attributes : ['idCompras',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    [conexion.fn('SUM', conexion.literal("lineacompras.Precio * lineacompras.Cantidad")), 'Total'],'Estado'],                            
      where : {
        idProveedores : _idProveedores,
        Estado : {
          $like : "%" + _estado + "%"
        }
      },
      subQuery : false,
      order : 'compras.idCompras ' + tipoOrden,
      group : 'compras.idCompras',
      offset : parseInt(_offset),
      limit : _limit,
      //limit : 2,
      })
    .then(result => {
      return compras = {
        rows : result.rows,
        count : result.count.length
      }
    })
  }  

  /*CAMBIAR EL TOTAL DE COMPRAS COMO EL DE FACTURAS*/

  Compras.buscarPorProducto = function(_idProductos) {
   return  Compras.findAll({
    include : [
    {       
      model : LineaCompras,
      required : true,
      attributes : [],
    },

    {
      model : Proveedores,
      required : false,
      attributes : ['Nombre']
    }
    ],
    attributes : ['idCompras',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha']],                            
    subQuery :false,
    order : 'idCompras DESC',
    limit : 10,
    where : conexion.literal('lineacompras.idProductos = ' + _idProductos)
    })
  }  

  Compras.buscarLineaCompras = function(_idCompras) {
    return LineaCompras.buscarPorCompra(_idCompras);
  }

  
  /*Por restriccion de Sequelize uso el Modelo facturas para llamar a funciones del Modelo PagosProveedores*/

  Compras.buscarLineaPagosProveedores = function(_idPagosProveedores) { 
    return PagosProveedores.buscarLineaPagosProveedores(_idPagosProveedores,Compras)
  }

  Compras.borrarPagosProveedores = function(_idPagosProveedores) {
    return PagosProveedores.borrarPago(_idPagosProveedores,Compras)
  }

  /*Por restriccion de Sequelize uso el Modelo facturas para llamar a funciones del Modelo PagosProveedores*/

  /*FUNCIONES AUXILIARES*/

  var controlSaldoAnterior = function(proveedor,montoAbonado,t) {
    var respuesta,
        promesaAux;

    respuesta = {
      nuevoMontoAbonado : montoAbonado-proveedor.Saldo,
    }
    promesaAux = new Promise(function(resolve,reject){
      resolve(respuesta);
      reject('Error Control Saldo Anterior');
    })
    return promesaAux;
  }

  Compras.modificarEstado = function(_idCompra,_estado,t) {
    return Compras.update({
      Estado : _estado
      },
      {
        where : {idCompras : _idCompra}
        ,transaction : t
    })
  }

  var controlNuevoSaldo = function(_idProveedor,montoRestante,t) { //montoRestante = nuevoMontoAbonado - (Total de Facturas Pagadas)
    var respuesta,
    nuevoSaldo;

    if(montoRestante < 0) 
      nuevoSaldo = -(montoRestante);
    else 
      nuevoSaldo = 0;

    return Proveedores.actualizarSaldo(nuevoSaldo,_idProveedor,t)
    .then(() =>{
      respuesta = {
        saldo : parseFloat(nuevoSaldo.toFixed(2))
      }
      return respuesta;
    })
  }
  
  module.exports = Compras;

