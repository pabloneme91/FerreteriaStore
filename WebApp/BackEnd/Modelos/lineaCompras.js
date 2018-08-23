
var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Productos = require("./productos");

var LineaCompras = conexion.define('lineacompras', {

 idLineaCompras: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Cantidad: {
    type : conexion.Sequelize.INTEGER,
    allowNull : false
  },

 Precio: {
    type : conexion.Sequelize.DECIMAL(10,2),
    allowNull : false
  },
  
  },
  
  {
  timestamps : false
  });

  LineaCompras.belongsTo(Productos,{foreignKey : 'idProductos'});


  LineaCompras.crear = function(lineaCompra,_idCompras,t) {
    return LineaCompras.create({
      idCompras : _idCompras,
      idProductos : lineaCompra.idProductos,
      Cantidad : lineaCompra.Cantidad,
      Precio : lineaCompra.PrecioCosto
      },{transaction : t})
  }

  LineaCompras.buscarPorCompra = function(_idCompras,t) {
  return LineaCompras.findAll({
    include : [{
      model : Productos,
      required: true,
      attributes : ['Nombre']
    }],
    attributes : ['idLineaCompras','Cantidad','Precio','idCompras',[conexion.fn('ABS',conexion.literal("lineacompras.Precio * lineacompras.Cantidad")),'Total']],
      where : {
        idCompras : _idCompras
      },
    order : 'Nombre'
    ,transaction : t})
  }

  LineaCompras.buscarPorId = function(_idLineaCompras,t) {
    return LineaCompras.find({
      where : {
        idLineaCompras : _idLineaCompras
      },
      transaction : t
    })
  }


  LineaCompras.borrar = function(_idLineaCompras,t) {
    return LineaCompras.buscarPorId(_idLineaCompras)
    .then(lineaCompra => {
      return LineaCompras.destroy({
        where : {
          idLineaCompras : _idLineaCompras
        },
        transaction : t
      })
      .then(()=>{
        return Productos.descontarStock(lineaCompra.Cantidad,lineaCompra.idProductos,t)
      })  
    })
  }

  module.exports = LineaCompras
