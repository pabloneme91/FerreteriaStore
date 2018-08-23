var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Productos = require("./productos");

var LineaCarrito = conexion.define('lineaCarritos', {

  idLineaCarrito: {
    type : conexion.Sequelize.BIGINT(11),
    primaryKey : true,
    allowNull : false,
    autoIncrement : true
  },

  Cantidad: {
    type : conexion.Sequelize.INTEGER(11).UNSIGNED,
    validate  : {
      isNegative : function(value){
        if(value < 1 || value > 5) {
          throw new Error("La cantidad minima a pedir es 1 y la maxima es 5");
        }
      }    
    }
   },

  PrecioProducto: {
    type : conexion.Sequelize.DECIMAL(10,2),
    allowNull : true
  },

  },
  
  {
  timestamps : false,
  validate : {
    controlNull : function() {
      if(this.PrecioProducto === undefined) {
        if(!this.Cantidad)
          throw new Error('Cantidad : debe rellenar el campo')
      }
    }
  }
  });


  LineaCarrito.belongsTo(Productos,{foreignKey : 'idProducto'});

  LineaCarrito.buscarPorId = function(_idLineaCarrito,t) {
    return LineaCarrito.find({
      where : {
        idLineaCarrito : _idLineaCarrito,
      },
      transaction : t
    })
  }

  LineaCarrito.crear = function(_idCarrito,_idProductos,_cantidad,t) {
    return LineaCarrito.create({
      idCarrito : _idCarrito,
      idProducto : _idProductos,
      Cantidad : _cantidad
    },{transaction : t})
  }

  LineaCarrito.actualizarCantidad = function(cantidadActual,cantidadCarrito,_idLineaCarrito,t) {
    return LineaCarrito.update({
      Cantidad : parseInt(cantidadActual) + parseInt(cantidadCarrito)
    },
    {
      where : {idLineaCarrito : _idLineaCarrito},
      transaction : t
    })
  }

  LineaCarrito.actualizarPrecioProducto = function(lineaCarrito,t) {
    return LineaCarrito.update({
      PrecioProducto : lineaCarrito.producto.Precio
    },
    {
      where : {idLineaCarrito : lineaCarrito.idLineaCarrito},
      transaction : t
    })
  }    

  LineaCarrito.buscarLinea = function(_idCarrito,_idProductos,t)  {
    return LineaCarrito.find({
      where : {
        idCarrito : _idCarrito,
        idProducto : _idProductos
      }
    },{transaction : t})
  }

  LineaCarrito.buscarPorCarrito = function(_idCarrito,t) {
    return LineaCarrito.findAll({
      include : [
      {       
        model : Productos,
        required : false,
        attributes : ['idProductos','Nombre','Precio','Descripcion','Foto'],
      }
      ],
      attributes : ['idLineaCarrito','idCarrito','Cantidad',[conexion.fn('ABS',conexion.literal('Cantidad * producto.Precio')),'Total']],
      where : {
        idCarrito : _idCarrito
      },
     transaction : t 
    })
  }

  LineaCarrito.buscarPorCarritoEncargado = function(_idCarrito,t) {
    return LineaCarrito.findAll({
      include : [
      {       
        model : Productos,
        required : false,
        attributes : ['idProductos','Nombre','Descripcion','Foto'],
      }
      ],
      attributes : ['idLineaCarrito','idCarrito','Cantidad','PrecioProducto',[conexion.fn('ABS',conexion.literal('Cantidad * PrecioProducto')),'Total']],
      where : {
        idCarrito : _idCarrito
      },
     transaction : t 
    })
  }

  LineaCarrito.borrar = function(_idLineaCarrito,t) {
    return LineaCarrito.destroy({
      where : {
        idLineaCarrito : _idLineaCarrito
      },
      transaction : t
    })
  }

  LineaCarrito.verificarLineaCarritoPorCarrito = function(_idLineaCarrito,_idCarrito) {
    return LineaCarrito.buscarPorIdYCarrito(_idLineaCarrito,_idCarrito)
    .then(function(lineaCarrito){
      if(lineaCarrito === null) 
        throw new Error('No corresponde el Producto eliminado con el Cliente')
      else {
        return lineaCarrito
      }
    })
  }

  LineaCarrito.buscarPorIdYCarrito = function(_idLineaCarrito,_idCarrito) {
    return LineaCarrito.find({
      where : {
        idLineaCarrito : _idLineaCarrito,
        idCarrito : _idCarrito
      }
    })
  }

  module.exports = LineaCarrito;

  
  