var conexion = require("../config/conexionBD");
var funciones = require("../Controladores/funciones");
var Rubro = require("./rubros");

var multer = require('multer');

var Productos = conexion.define('productos', {

 idProductos: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Nombre: {
    type : conexion.Sequelize.STRING(30),
    validate : {
      controlUnique : function(value) {
        return Productos.find({where : {Nombre : value}})
        .then(producto =>{
          if(producto && (!(producto.idProductos === this.idProductos)))
            throw new Error('Ya existe un producto con ese nombre')
        })
      }
    }
  },


 Precio: {
    type : conexion.Sequelize.DECIMAL(10,2),
  },


 PrecioCosto: {
    type : conexion.Sequelize.DECIMAL(10,2),
  },
  
  Stock: {
    type : conexion.Sequelize.BIGINT(15),
    validate : {
    	isInt : {
    	args : true,
    	msg : 'Ingresar Solo Numeros'
    	},
      isNegative : function(value){
        if(value < 0 ) 
          throw new Error("La cantidad en Stock del producto \"" + this.Nombre + "\" es menor a la solicitada. Puede reducir la cantidad del mismo"
            + " o esperar a que ingrese en stock. Ante cualquier duda comunicarse con el local");
  	 }
    }
  },

  Foto: {
   	type : conexion.Sequelize.STRING(120),
  },

  Descripcion : {
  	type : conexion.Sequelize.TEXT(),
  },

  Destacado : {
    type : conexion.Sequelize.BOOLEAN(),
  },

  Oferta : {
    type : conexion.Sequelize.BOOLEAN(),
  },

  },
  
  {
  timestamps : false,
  validate : {
    controlNull : function() {
      if(this.idProductos === null) {
        if(this.Nombre == null || this.Precio == null
          || this.idRubro == null || this.PrecioCosto == null) 
          throw new Error('Rellene todos los campos que tienen *')
      }
    }
  }
});

  Productos.belongsTo(Rubro,{foreignKey : 'idRubro'});


  Productos.obtenerIdPorNombre = function(_nombre) {
    return Productos.find({
      attributes : ['idProductos'],
      where : {
        Nombre : _nombre
      },
    })
  }


  Productos.buscarPorNombre = function (_nombre) {
    return Productos.findAll({
      where : {
        Nombre : {
          $like : "%" + _nombre + "%"
        }
      },
      include : [
      {
       model : Rubro,
       required : false,
       attributes : ['Nombre'], 
      }],
      order : ['Nombre'],
      raw : true,
      limit : 10
    })
  }

  Productos.buscarPorNombrePaginado = function (obj) {

    switch(obj.Tipo) {
      case '0' : obj.Tipo = 'productos.Precio ASC'
      break;
      case '1' : obj.Tipo = 'productos.Precio DESC' 
      break;
      case '2' : obj.Tipo = 'productos.Nombre ASC'
      break;
      default : obj.Tipo = "null";

    }

    return Productos.findAndCountAll({
      where : {
        Nombre : {
          $like : "%" + obj.Nombre + "%"
        }
      },
      include : [
      {
       model : Rubro,
       required : false,
       attributes : ['Nombre'], 
      }
      ],
        order : obj.Tipo,  
        offset : (obj.pagina - 1) * 4,
        limit : 4,
        raw : true
    })
  }

  Productos.buscarOfertas = function (obj) {
    return Productos.findAll({
      where : {
        Oferta : 1
      }
    });
  }

  Productos.buscarDestacados = function (obj) {
    return Productos.findAll({
      where : {
        Destacado : 1
      }
    });
  }

  Productos.buscarConVentas = function() {
    return conexion.query('CALL traerProductosConVentasPendientes();')
  }

  Productos.buscarPorRubro = function (obj) {
    switch(obj.Tipo) {
      case '0' : obj.Tipo = 'productos.Precio ASC'
      break;
      case '1' : obj.Tipo = 'productos.Precio DESC'
      break;
      case '2' : obj.Tipo = 'productos.Nombre ASC'
      break;
      default : obj.Tipo = "null";

    }

    return Productos.findAndCountAll({
      where : {
        idRubro : obj.idRubro
      },
      order : obj.Tipo,  
      offset : (obj.pagina - 1) * 4,
      limit : 4,
      raw : true
    })
  }
  
  Productos.crear = function(_producto) {
   return Productos.create(_producto)
  }

  Productos.modificar = function(_producto) {
    return Productos.update({
        idProductos : _producto.idProductos,
        Nombre : _producto.Nombre,
        Precio : _producto.Precio,
        PrecioCosto : _producto.PrecioCosto,
        Stock : _producto.Stock || 0,
        Descripcion : _producto.Descripcion,
        Destacado : _producto.Destacado,
        Oferta : _producto.Oferta
      },
      {
      where : {
        idProductos : _producto.idProductos
      }
    })
  }

  Productos.agregarRutaFoto = function(_idProductos,_ruta) {
    return Productos.update({
      idProductos : _idProductos,
      Foto : _ruta
      },
      {
      where : {idProductos : _idProductos}
    })
  }  

  Productos.guardarFoto = function(req,res) {
    Productos.buscarUltimoAgregado()
    .then(producto =>{
      req.producto = producto;
      upload(req,res,function(err){
        if(err){
          Productos.borrar(producto.idProductos)
          .then(()=>{
            if(err.code === 'LIMIT_FILE_SIZE') 
              err.message = 'La imagen no debe superar los 5MB.'
            res.status(406)
              .send({message:'Error al enviar la imagen: ' + err.message + '. Intente nuevamente'});  
          })
        }
        else if (req.file){
          Productos.agregarRutaFoto(producto.idProductos,'../imagenes/productos/' + req.file.filename)
          .then(() =>{
            res.status(200).end();  
          })
        }
      })
    })
  }  

  Productos.modificarFoto = function(req,res) {
    upload(req,res,function(err){
      if(err){
        if(err.code === 'LIMIT_FILE_SIZE') 
          err.message = 'La imagen no debe superar los 5MB.'
        res.status(406)
          .send({message:'Error al enviar la imagen: ' + err.message + '. Intente nuevamente'});  
      }
      else if (req.file){
        var idProductos = (String(req.file.filename)).split('.')[0]
        Productos.agregarRutaFoto(idProductos,'../imagenes/productos/' + req.file.filename)
        .then(() =>{
          res.sendStatus(200);  
        })
      }
    })
  } 

  Productos.borrar = function(_idProducto) {
    return Productos.destroy({
      where : {
        idProductos : _idProducto
      }
    })
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar el producto ya que esta asociada a una venta o compra')
      else return err
    })
  }

  Productos.buscarUltimoAgregado = function() {
    return Productos.find({
      order : 'idProductos DESC'
    })    
  }

  Productos.descontarStock = function(cantidad,_idProductos,t) {
    return Productos.obtenerStock(_idProductos,t)
    .then(producto =>{
      return Productos.update({
        idProductos : _idProductos,
        Nombre : producto.Nombre,
        Stock : producto.Stock - parseInt(cantidad)
        },
        {
          where : {idProductos : _idProductos},
          transaction : t})
      })
  }


  Productos.devolverStock = function(cantidad,_idProductos,t) {
    return Productos.obtenerStock(_idProductos,t)
    .then(producto =>{
      return Productos.update({
        idProductos : _idProductos,
        Nombre : producto.Nombre,
        Stock : producto.Stock + parseInt(cantidad)
        },
        {
          where : {idProductos : _idProductos},
          transaction : t})
      })
  }

  Productos.actualizarPrecioCosto = function(_idProductos,_precioCosto,t) {
    return Productos.update({
      idProductos : _idProductos,
      PrecioCosto : _precioCosto
      },
      {
      where : {idProductos : _idProductos},
      transaction : t})
  }

/*HACER UNA SOLA FUNCION OBTENER POR ID*/

  Productos.obtenerPrecio = function(_idProducto,t) {
    return Productos.find({
      attributes : ['Precio'],
      where : {
        idProductos : _idProducto
      },
      raw : true
    },{transaction : t})
  }

  Productos.obtenerStock = function(_idProducto,t) {
    return Productos.find({
      attributes : ['idProductos','Nombre','Stock'],
      where : {
        idProductos : _idProducto
      },
    })
  }

  Productos.obtenerPorId = function(_idProducto) {
    return Productos.find({
      where : {
        idProductos : _idProducto
      }
    })
  }

  /*HACER UNA SOLA FUNCION OBTENER POR ID*/

  module.exports = Productos



  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'Cliente/vistas/imagenes/productos/')
    },
    filename: function (req, file, cb) {
      if(req.producto)
        cb(null, req.producto.idProductos +  '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
      else 
        cb(null, file.originalname);
    },
  });

  var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      file.originalname = (file.originalname).toLowerCase();
      var ext = (file.originalname.split('.')[file.originalname.split('.').length -1]).toLowerCase();
      if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
          return callback(new Error('El archivo enviado debe ser una imagen'))
      }
      callback(null, true)
    },
    limits:{
      fileSize: 5242880
    },

  }).single('file');    
  
