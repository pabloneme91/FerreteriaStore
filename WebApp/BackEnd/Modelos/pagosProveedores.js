var conexion = require("../config/conexionBD");

var Proveedores = require("./proveedores");

var LineaPagosProveedores = require("./lineaPagosProveedores");

var Promesa = require('bluebird');

var moment = require('moment');


var PagosProveedores = conexion.define('pagosproveedores', {

 idPagosProveedores: {
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

  },
  
  {
  timestamps : false
  });

  PagosProveedores.belongsTo(Proveedores,{foreignKey : 'idProveedores'});
  PagosProveedores.hasMany(LineaPagosProveedores,{foreignKey : 'idPagosProveedores'});


  PagosProveedores.crear = function(cliente,_monto,t) {
    var objPago = {
      Monto : _monto,
      Fecha : moment().format('YYYY-MM-DD HH:MM'),
      idProveedores : cliente.idProveedores,
      SaldoAnterior : cliente.Saldo
    }
    return PagosProveedores.create(objPago,{transaction : t})
  }

  PagosProveedores.borrar = function(_idPagosProveedores,t) {
    return PagosProveedores.destroy({
      where : {
        idPagosProveedores : _idPagosProveedores
      },
      transaction : t
    })
  }

  PagosProveedores.buscarPorId = function(_idPagosProveedores) {
    return PagosProveedores.find({
      where : {
        idPagosProveedores : _idPagosProveedores
      }
    })
  }

  PagosProveedores.buscarPorCompra = function(_idCompra) {
    return LineaPagosProveedores.buscarPorCompra(_idCompra)
    .then(lineaPagoProveedores =>{
      if(!lineaPagoProveedores)
        throw new Error('La compra buscada aun no fue abonada o no existe')
      return PagosProveedores.buscarPorId(lineaPagoProveedores.idPagosProveedores)  
    })
  }

  PagosProveedores.borrarPago = function(_idPagosProveedores,modelCompra) {
    return PagosProveedores.buscarLineaPagosProveedores(_idPagosProveedores,modelCompra)
    .then(pago =>{
      return conexion.transaction(t=>{
        return Promesa.each(pago.detalle, lineaPago =>{
          if(!(lineaPago.idCompras === "Saldo")) //La funcion PagosProveedores.buscarLineaPagosProveedores devuelve "Saldo" si es null idCompra
            return modelCompra.modificarEstado(lineaPago.idCompras,'I',t)  
        })
        .then(() =>{
          return calcularNuevoSaldo(pago.sumaTotalCompras,_idPagosProveedores)
          .then(datosProveedor =>{
            return Proveedores.actualizarSaldo(datosProveedor.nuevoSaldo,datosProveedor.idProveedores,t)
            .then(()=> {
              return PagosProveedores.borrar(_idPagosProveedores,t)    
            })  
          })
        })
      })
    })
  }

  PagosProveedores.buscarPorProveedor = function(_idProveedores,_offset) {
    return PagosProveedores.findAndCountAll({
      attributes : ['idPagosProveedores',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    'Monto','idProveedores','SaldoAnterior'],                          
      where : {
        idProveedores : _idProveedores
      },
      order : 'idPagosProveedores DESC',
      offset : parseInt(_offset),
      limit : 2
    })
  }

  PagosProveedores.buscarLineaPagosProveedores = function(_idPagosProveedores,modelCompra) {
    var arrayComprasPagadas = [];
    var sumTotalCompras = 0;
    return LineaPagosProveedores.buscarPorPagoProveedor(_idPagosProveedores)
    .then(detallePago => {
      return Promesa.each(detallePago,lineaPago =>{
        var obj = {};
        if(!(lineaPago.idCompras === null)) {
          return modelCompra.buscarPorId(lineaPago.idCompras)  
          .then(compra =>{
            obj.idCompras = compra.idCompras;
            obj.Fecha = compra.Fecha;
            obj.Total = compra.get('Total'); 
            sumTotalCompras += compra.get('Total'); 
            arrayComprasPagadas.push(obj);
          })
        }
        else {
          obj.idCompras = 'Saldo';
          obj.Fecha = null;
          obj.Total = null;
          arrayComprasPagadas.push(obj);
        }
      })
      .then(() =>{
        var resultado = {
          sumaTotalCompras : sumTotalCompras,
          detalle : arrayComprasPagadas
        }
        return resultado
      })
    })
  }

  PagosProveedores.registrarPago = function(proveedor,compras,monto,t) {
    return PagosProveedores.crear(proveedor,monto,t)
    .then(pagoProveedor =>{
      return LineaPagosProveedores.agregarLineas(pagoProveedor.idPagosProveedores,proveedor.Saldo,compras,t)
    })
  }

  module.exports = PagosProveedores;


  var calcularNuevoSaldo = function(sumaTotalCompras,_idPagosProveedores) {
    promesaAux = new Promise(function(resolve,reject){
      return PagosProveedores.buscarPorId(_idPagosProveedores)
      .then(pagoProveedor =>{
        var datosProveedor = {};
        return Proveedores.buscarPorId(pagoProveedor.idProveedores)  
        .then(proveedor =>{
          datosProveedor.nuevoSaldo = proveedor.Saldo + pagoProveedor.Monto - sumaTotalCompras
          datosProveedor.idProveedores = pagoProveedor.idProveedores;
          resolve(datosProveedor);
        })
      })
      reject('Error calculando el nuevo saldo');
    })
    return promesaAux;
  }