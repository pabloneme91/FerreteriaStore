var conexion = require("../config/conexionBD");

//var Facturas = require("./facturas");

var Promesa = require('bluebird');

var LineaPagosClientes = conexion.define('lineapagosclientes', {

  idLineaPagosClientes: {
  type : conexion.Sequelize.BIGINT(11),
  primaryKey : true,
  allowNull : false,
  autoIncrement : true
  },

  },

  {
  timestamps : false
  });

  LineaPagosClientes.crear = function(lineaPagosClientes,t) {
     return LineaPagosClientes.create(lineaPagosClientes,{transaction : t})
  }

  LineaPagosClientes.agregarLineas = function(_idPagosClientes,saldo,facturas,t) {
    return Promesa.each(facturas,factura =>{ 
      var obj = {
       idPagosClientes : _idPagosClientes,
       idFactura : factura.idFactura
      }
      return LineaPagosClientes.crear(obj,t)
    })
    .then(()=>{
      if(saldo > 0) {
        obj = {
          idPagosClientes : _idPagosClientes
        }
        return LineaPagosClientes.crear(obj,t)
      }
    })
  }

  LineaPagosClientes.buscarPorPagoCliente = function(_idPagosClientes) {
    return LineaPagosClientes.findAll({
      where : {
        idPagosClientes : _idPagosClientes
      },
      order : 'idLineaPagosClientes'
    })
  }

  LineaPagosClientes.buscarPorFactura = function(_idFactura) {
    return LineaPagosClientes.find({
      where : {
        idFactura : _idFactura
      },
    })
  }

module.exports = LineaPagosClientes;