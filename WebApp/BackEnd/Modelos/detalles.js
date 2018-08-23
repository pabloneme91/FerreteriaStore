var conexion = require("../config/conexionBD");

var funciones = require("../BackEnd/Controladores/funciones");

var Productos = require("./productos");

var Clientes = require("./clientes");

var Detalles = conexion.define('detalles', {

 idDetalles: {
   type : conexion.Sequelize.BIGINT(11),
   primaryKey : true,
   allowNull : false,
   autoIncrement : true
 },

 Cantidad: {
    type : conexion.Sequelize.INTEGER,
    allowNull : false,
    validate  : {
      isNegative : function(value){
        if(value < 1)
          throw new Error("La cantidad ingresada debe ser mayor a 0");
      }    
    }
  },

 Precio: {
    type : conexion.Sequelize.DECIMAL(10,2),
    allowNull : false,
    validate  : {
      isNegative : function(value){
        if(value < 0.01)
          throw new Error("El precio debe ingresado debe ser mayor a 0");
      }    
    }
  },
  
  },
  
  {
  timestamps : false
  });

  
  Detalles.belongsTo(Productos,{foreignKey : 'idProductos'});


  Detalles.crearDetalle = function(lineaDetalle,idFactura,_precio,t) {
    return Detalles.create({
      idFactura : idFactura,
      idProductos : lineaDetalle.producto.idProductos,
      Cantidad : lineaDetalle.Cantidad,
      Precio : _precio
      },{transaction : t})
  }


  Detalles.buscarPorId = function(_idDetalles,t) {
    return Detalles.find({
      where : {
        idDetalles : _idDetalles
      },
      transaction : t
    })
  }

  Detalles.borrar = function(_idDetalles,t) {
    return Detalles.buscarPorId(_idDetalles,t)
    .then(detalle=>{
      return Detalles.destroy({
        where : {
          idDetalles : _idDetalles
        },
        transaction : t
      })
      .then(()=>{
        return Productos.devolverStock(detalle.Cantidad,detalle.idProductos,t)
      })
    })
  }

  Detalles.buscarPorFactura = function(_idFactura,t) {
    return Detalles.findAll({
      include : [
      {
        model : Productos,
        required: true,
        attributes : ['Nombre']
      }
      ],
      attributes : ['idDetalles','Cantidad','Precio','idFactura',
      [conexion.fn('ABS',conexion.literal("detalles.Precio * detalles.Cantidad")),'Total']],
      where : {
        idFactura : _idFactura
      },
      transaction : t,
      order : 'Nombre'
    })
  }

  module.exports = Detalles
