
var conexion = require("../config/conexionBD");

var Clientes = require("./clientes");

var LineaPagosClientes = require("./lineaPagosClientes");

var Promesa = require('bluebird');

var moment = require('moment');


var PagosClientes = conexion.define('pagosclientes', {

     idPagosClientes: {
     type : conexion.Sequelize.BIGINT(11),
     primaryKey : true,
     allowNull : false,
     autoIncrement : true
     },

     Fecha: {
        type : conexion.Sequelize.DATE(6),
        allowNull : false
      },

     Monto: {
        type : conexion.Sequelize.DECIMAL(10,2),
        allowNull : false
      },

      SaldoAnterior: {
        type : conexion.Sequelize.FLOAT,
        allowNull : false
      },

      Tipo: {
        type : conexion.Sequelize.CHAR(2),
      },

    },
    
    {
      timestamps : false
    }

);

  PagosClientes.belongsTo(Clientes,{foreignKey : 'idClientes'});
  PagosClientes.hasMany(LineaPagosClientes,{foreignKey : 'idPagosClientes'});


  PagosClientes.crear = function(cliente,_monto,_tipo,t) {
    var objPago = {
      Monto : _monto,
      Fecha : moment().format('YYYY-MM-DD HH:mm'),
      idClientes : cliente.idClientes,
      SaldoAnterior : cliente.Saldo,
      Tipo : _tipo
    }
    return PagosClientes.create(objPago,{transaction : t})
  }

  PagosClientes.borrar = function(_idPagosClientes,t) {
    return PagosClientes.destroy({
      where : {
        idPagosClientes : _idPagosClientes
      },
      transaction : t
    })
  }

  PagosClientes.buscarPorId = function(_idPagosClientes) {
    return PagosClientes.find({
      where : {
        idPagosClientes : _idPagosClientes
      }
    })
  }

  PagosClientes.buscarPorFactura = function(_idFactura) {
    return LineaPagosClientes.buscarPorFactura(_idFactura)
    .then(lineaPagoCliente =>{
      if(!lineaPagoCliente)
        throw new Error('La factura buscada aun no fue abonada o no existe')
      return PagosClientes.buscarPorId(lineaPagoCliente.idPagosClientes)  
    })
  }

  PagosClientes.borrarPago = function(_idPagosClientes,modelFactura) {
    return PagosClientes.buscarLineaPagosClientes(_idPagosClientes,modelFactura)
    .then(pago =>{
      return conexion.transaction(t=>{
        return Promesa.each(pago.detalle, lineaPago =>{
          if(!(lineaPago.idFactura === "Saldo")) //La funcion PagosClientes.buscarLineaPagosClientes devuelve "Saldo" si es null idFactura
            return modelFactura.modificarEstado(lineaPago.idFactura,'CC',t)  
        })
        .then(() =>{
          return calcularNuevoSaldo(pago.sumaTotalFacturas,_idPagosClientes)
          .then(datosCliente =>{
            return Clientes.actualizarSaldo(datosCliente.nuevoSaldo,datosCliente.idClientes,t)
            .then(()=> {
              return PagosClientes.borrar(_idPagosClientes,t)      
            })  
          })
        })
      })
    })
  }

  PagosClientes.buscarPorCliente = function(_idClientes,_offset) {
    return PagosClientes.findAndCountAll({
      attributes : ['idPagosClientes',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    'Monto','idClientes','SaldoAnterior','Tipo'],                          
      where : {
        idClientes : _idClientes
      },
      order : 'idPagosClientes DESC',
      offset : parseInt(_offset),
      limit : 2
    })
  }

  PagosClientes.buscarLineaPagosClientes = function(_idPagosClientes,modelFactura) {
    var arrayFacturasPagadas = [];
    var sumTotalFacturas = 0;
    return LineaPagosClientes.buscarPorPagoCliente(_idPagosClientes)
    .then(detallePago => {
      return Promesa.each(detallePago,lineaPago =>{
        var obj = {};
        if(!(lineaPago.idFactura === null)) {
          return modelFactura.buscarPorId(lineaPago.idFactura)  
          .then(factura =>{
            obj.idFactura = factura.idFactura;
            obj.Fecha = factura.Fecha;
            obj.Total = factura.get('Total'); 
            sumTotalFacturas += factura.get('Total'); 
            arrayFacturasPagadas.push(obj);
          })
        }
        else {
          obj.idFactura = 'Saldo';
          obj.Fecha = null
          obj.Total = null;
          arrayFacturasPagadas.push(obj);
        }
      })
      .then(() =>{
        var resultado = {
          sumaTotalFacturas : sumTotalFacturas,
          detalle : arrayFacturasPagadas
        }
        return resultado
      })
    })
  }

  PagosClientes.registrarPago = function(cliente,facturas,monto,tipoPago,t) {
    return PagosClientes.crear(cliente,monto,tipoPago,t)
    .then(pagoCliente =>{
      return LineaPagosClientes.agregarLineas(pagoCliente.idPagosClientes,cliente.Saldo,facturas,t)
    })
  }

  module.exports = PagosClientes;


  var calcularNuevoSaldo = function(sumaTotalFacturas,_idPagosClientes) {
    promesaAux = new Promise(function(resolve,reject){
      return PagosClientes.buscarPorId(_idPagosClientes)
      .then(pagoCliente =>{
        var datosCliente = {};
        return Clientes.buscarPorId(pagoCliente.idClientes)  
        .then(cliente =>{
          datosCliente.nuevoSaldo = cliente.Saldo + pagoCliente.Monto - sumaTotalFacturas;
          datosCliente.idClientes = pagoCliente.idClientes;
          resolve(datosCliente);
        })
      })
      reject('Error calculando el nuevo saldo');
    })
    return promesaAux;
  }
