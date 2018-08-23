var conexion = require("../config/conexionBD");

var Promesa = require('bluebird');

var LineaPagosProveedores = conexion.define('lineapagosproveedores', {

  idLineaPagosProveedores: {
  type : conexion.Sequelize.BIGINT(11),
  primaryKey : true,
  allowNull : false,
  autoIncrement : true
  },

  },

  {
  timestamps : false
  });

  LineaPagosProveedores.crear = function(lineaPagosProveedores,t) {
     return LineaPagosProveedores.create(lineaPagosProveedores,{transaction : t})
  }

  LineaPagosProveedores.agregarLineas = function(_idPagosProveedores,saldo,compras,t) {
    return Promesa.each(compras,compra =>{ 
      var obj = {
       idPagosProveedores : _idPagosProveedores,
       idCompras : compra.idCompras
      }
      return LineaPagosProveedores.crear(obj,t)
    })
    .then(()=>{
      if(saldo > 0) {
        obj = {
          idPagosProveedores : _idPagosProveedores
        }
        return LineaPagosProveedores.crear(obj,t)
      }
    })
  }

  LineaPagosProveedores.buscarPorPagoProveedor = function(_idPagosProveedores) {
    return LineaPagosProveedores.findAll({
      where : {
        idPagosProveedores : _idPagosProveedores
      },
      order : 'idLineaPagosProveedores'
    })
  }

  LineaPagosProveedores.buscarPorCompra = function(_idCompras) {
    return LineaPagosProveedores.find({
      where : {
        idCompras : _idCompras
      },
    })
  }

  module.exports = LineaPagosProveedores;