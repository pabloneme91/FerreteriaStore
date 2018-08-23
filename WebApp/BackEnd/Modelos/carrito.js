var Sequelize = require("sequelize");

var conexion = require("../config/conexionBD");

var Clientes = require("./clientes");

var Productos = require("./productos");

var LineaCarrito = require("./lineaCarrito");

var mailService = require('../servicios/nodemailer');

var pdfService = require('../servicios/crearPDF');

var moment = require('moment');

var Promesa = require('bluebird');

var Carrito = conexion.define('carrito', {

 idCarrito: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Estado : {
  type : conexion.Sequelize.CHAR(1),
  allowNull : false,
  defaultValue : 'C'
 },

 Fecha: {
    type : conexion.Sequelize.DATE(6),
    allowNull : true
 }, 

},

 {
 timestamps : false
 });

  Carrito.belongsTo(Clientes,{foreignKey : 'idCliente'});
  Carrito.hasMany(LineaCarrito,{foreignKey : 'idCarrito'});

   
  Carrito.agregarProducto = function (carrito) {
    return existeCarrito(carrito.idCliente)
    .then(carritoViejo =>{
      return conexion.transaction(t =>{
        if(carritoViejo === null ) 
          return agregarCarritoNuevo(carrito,t);
        else {
          return LineaCarrito.buscarLinea(carritoViejo.idCarrito,carrito.idProductos,t)
          .then(function(linea){
            if(linea === null) 
              return LineaCarrito.crear(carritoViejo.idCarrito,carrito.idProductos,carrito.Cantidad,t)
            else
              return LineaCarrito.actualizarCantidad(linea.Cantidad,carrito.Cantidad,linea.idLineaCarrito,t)
          })
        }
      })
      .then(() =>{
        return respuetaAgregarProducto(carrito)
      })
    })
  }

  Carrito.traerPorCliente = function (_idCliente,t) {
    var resultado = {};
    resultado.datosCarrito = {};
    resultado.lineasCarrito = [];
    return  Carrito.findAll({
      include : [{       
        model : LineaCarrito,
        required : true,
        attributes : [],

        include : [{       
          model : Productos,
          required : true,
          attributes : ['Precio'],
        }],
      }],
      attributes : ['idCarrito',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    [conexion.fn('SUM', conexion.literal('Cantidad * Precio')), 'Total']],
      where : {
        idCliente : _idCliente,
        Estado : 'C'
      },
      order : 'idCarrito',
      group : 'idCarrito',
      transaction : t
    })
    .then(carritoEncontrado => {
      if(carritoEncontrado.length === 0) 
        return resultado;
      else {
        resultado.datosCarrito = carritoEncontrado[0]; //SEQUELIZE DEVUELVE COMO ARREGLO PERO SIEMPRE ES UN ELEMENTO([0])
        return LineaCarrito.buscarPorCarrito(carritoEncontrado[0].idCarrito,t)
        .then(lineasCarrito =>{
          resultado.lineasCarrito = lineasCarrito;
          return resultado;
        })
      }
    })
  }

  Carrito.traerPorId = function(_idCarrito) {
   return  Carrito.find({
      include : [{       
        model : LineaCarrito,
        required : true,
        attributes : [],
      }],
      attributes : ['idCarrito',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    [conexion.fn('SUM', conexion.literal('Cantidad * PrecioProducto')), 'Total']],
      where : {
        idCarrito : _idCarrito,
      },
      order : 'idCarrito',
      group : 'idCarrito',
      })
  }  


  Carrito.traerVentasPendientes = function(obj) {
   return  Carrito.findAndCountAll({
      include : [{       
        model : LineaCarrito,
        required : true,
        attributes : [],
      }],
      attributes : ['idCarrito',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha'],
                    [conexion.fn('SUM', conexion.literal('lineaCarritos.Cantidad * lineaCarritos.PrecioProducto')), 'Total']],
      where : {
        idCliente : obj.idClientes,
        Estado : 'P'
      },
      subQuery : false,
      order : 'carrito.idCarrito DESC',
      group : 'carrito.idCarrito',
      offset : parseInt(obj.offset),
      limit : 10,
      raw :true
      })
  }  

  Carrito.traerVentasPendientesPorProducto = function(_idProducto) {
   return  Carrito.findAll({
      include : [{       
        model : LineaCarrito,
        required : true,
        attributes : [],
        where : {idProducto : _idProducto}
      }, {
        model : Clientes,
        required : true,
        attributes : [[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre']]
        }],
      attributes : ['idCarrito',[conexion.fn('date_format', conexion.col('Fecha'), '%d-%m-%Y %H:%i:%s'), 'Fecha']],
      where : {
        Estado : 'P'
      },
      order : 'idCarrito',
      group : 'idCarrito'
      })
  }  

  Carrito.comprar = function(_idCliente) {
    return controlCarrito(_idCliente)
    .then(carrito =>{
      return conexion.transaction(t =>{
        return Carrito.actualizarFecha(carrito.idCarrito,t)
        .then(() =>{
          return actualizarStockYPrecio(_idCliente,t)
          .then(datosCarrito =>{
            return Carrito.actualizarEstado(carrito.idCarrito,t)
            .then(()=>{
              return Clientes.buscarPorId(_idCliente)
              .then(cliente =>{
                datosCarrito.Cliente = {};
                datosCarrito.Cliente.Nombre = cliente.Apellido + ", " + cliente.Nombre;
                datosCarrito.Cliente.Mail = cliente.Mail;
                return pdfService.crearPDF(datosCarrito)
                .then(()=>{
                    return datosCarrito;  
                })
              })
            })
          })
        })
      })
      .then((datosCarrito) =>{
        return enviarMailCompra(datosCarrito)
        .then(()=>{
          return datosCarrito;  
        })
      })
    })
  }

  Carrito.actualizarEstado = function(_idCarrito,t) {
    return Carrito.update({
      Estado : 'P',
    },
    {
      where : {idCarrito : _idCarrito}
      ,transaction : t})
  }

  Carrito.actualizarFecha = function(_idCarrito,t) {
    return Carrito.update({
      Fecha : moment().format('YYYY-MM-DD HH:mm')
    },
    {
      where : {idCarrito : _idCarrito}
      ,transaction : t})
  }


  Carrito.borrarLineaCarrito = function(_idLineaCarrito,_idCarrito) {
    return conexion.transaction(t =>{
      return LineaCarrito.borrar(_idLineaCarrito,t)
      .then(function(){
        return LineaCarrito.buscarPorCarrito(_idCarrito,t)
        .then(lineaCarrito =>{
          if(lineaCarrito.length === 0)
            return Carrito.borrarCarrito(_idCarrito,t)
        })
      })
    })
  }

  Carrito.borrarCarrito = function(_idCarrito,t) {
    return Carrito.destroy({
      where : {
        idCarrito : _idCarrito
      },
      transaction : t
    })
  }

  Carrito.borrarCarritoEncargado = function(_idCarrito) {
    return conexion.transaction(t =>{
      return LineaCarrito.buscarPorCarrito(_idCarrito,t)
      .then((carrito) =>{
        return Promesa.map(carrito,function(lineaCarrito){
          return LineaCarrito.borrar(lineaCarrito.idLineaCarrito,t)
          .then(()=>{
            return Productos.devolverStock(lineaCarrito.Cantidad,lineaCarrito.producto.idProductos,t)
          })
        })
        .then(() =>{
          return Carrito.borrarCarrito(_idCarrito,t)  
        })
      })
    })
  }

  Carrito.borrarLineaCarritoEncargado = function(_idLineaCarrito,_idCarrito) {
    return conexion.transaction(t =>{
      return LineaCarrito.buscarPorId(_idLineaCarrito,t)
      .then((lineaCarrito) =>{
        return LineaCarrito.borrar(_idLineaCarrito,t)
        .then(function(){
          return Productos.devolverStock(lineaCarrito.Cantidad,lineaCarrito.idProducto,t)
          .then(()=>{
            return LineaCarrito.buscarPorCarritoEncargado(_idCarrito,t)
            .then(carrito =>{
              if(carrito.length === 0)
              return Carrito.borrarCarrito(_idCarrito,t)  
            })
          })
        })
      })
    })
  }

   
  Carrito.traerLineaCarrito = function (_idCarrito) {
    return LineaCarrito.buscarPorCarrito(_idCarrito);
  }

  Carrito.traerLineaCarritoEncargado = function (_idCarrito) {
    return LineaCarrito.buscarPorCarritoEncargado(_idCarrito);
  }

  Carrito.traerUltimoComprado = function(_idCliente) {
    return Carrito.find({
      raw : true,
      attributes : ['idCarrito'],
      where : {
        idCliente :_idCliente,
        Estado : 'P'
      },
      order : 'idCarrito DESC' 
    })
    .then(datosCarrito=>{
      return datosCarrito.idCarrito;
    })
  }

  Carrito.verificarCarritoPorCliente = function(_idCliente,_idCarrito,_idLineaCarrito) {
    return buscarPorIdYCliente(_idCliente,_idCarrito)
    .then(function(carrito){
      return LineaCarrito.verificarLineaCarritoPorCarrito(_idLineaCarrito,_idCarrito)
    })
  }

  Carrito.traerClienteConCarritoPendiente = function() {
    return Carrito.findAll({
      include : [{
      model : Clientes,
      required : true,
      attributes : ['idClientes',[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre']]
      }],
      attributes : [],
      group : 'idClientes',
      where : {
        Estado : 'P'
      }
    })
  }

  module.exports = Carrito;


/******FUNCION AUXILIAR******/

var controlCarrito = function(_idCliente) {
  return Carrito.find({
    raw : true,
    attributes : ['idCarrito'],
    where : {
      idCliente :_idCliente,
      Estado : 'C'
    }
  })
}


var existeCarrito = function(_idCliente) {
  return Carrito.find({
    raw : true,
    attributes : ['idCarrito'],
    where : {
      idCliente :_idCliente,
      Estado : 'C'
    }
  })
}

var agregarCarritoNuevo = function(carrito,t) {
  return Carrito.create({
    idCliente : carrito.idCliente}, {transaction : t} 
  )
  .then(function(carritoNuevo){
    return LineaCarrito.crear(carritoNuevo.idCarrito,carrito.idProductos,carrito.Cantidad,t)
  })
}

var buscarPorIdYCliente = function(_idCliente,_idCarrito) {
  return Carrito.find({
    where : {
      idCarrito : _idCarrito,
      idCliente : _idCliente,
      Estado : 'C'
    }
  })
  .then(function(carrito){
    if(carrito === null) 
      throw new Error('No Corresponde el usuario con el Carrito');
    else return carrito;
  })
}

var actualizarStockYPrecio = function(_idCliente,t) {
  return Carrito.traerPorCliente(_idCliente,t)
  .then(carrito => {
    return Promesa.each(carrito.lineasCarrito,linea =>{
      return LineaCarrito.actualizarPrecioProducto(linea,t)
      .then(()=>{
        return Productos.descontarStock(linea.Cantidad,linea.producto.idProductos,t)  
      })
    })
    .then(()=> {
      var fecha = moment().format('DD-MM-YYYY HH:mm:SS')
      carrito.datosCarrito.setDataValue('Fecha',fecha) 
      return carrito;
    })
  })
}

var enviarMailCompra = function(obj) {
  var mailInfo = {
    direccion : obj.Cliente.Mail,
    Asunto : 'Orden de Compra',
    Mensaje : 'Orden N°: ' + obj.datosCarrito.idCarrito + '\n\n'  
              + 'Fecha: ' + obj.datosCarrito.Fecha + '\n\n'
              + 'Total : ' + obj.datosCarrito.get('Total'),
    Archivo : {
      Nombre : obj.datosCarrito.idCarrito + '.pdf',
      Ruta : getGenericPath() + obj.datosCarrito.idCarrito + '.pdf'
    }
  }
  return mailService.enviarMail(mailInfo)
}

/******FUNCION AUXILIAR******/


/*RESPUESTAS DE TRANSACCIONES*/

var respuetaAgregarProducto = function(carrito) {
  return Productos.obtenerPorId(carrito.idProductos)
  .then(producto =>{
    var respuesta  = {
      Nombre : producto.Nombre,
      Cantidad : carrito.Cantidad  
    }
    return respuesta
  }) 
}