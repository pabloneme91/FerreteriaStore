var conexion = require("../config/conexionBD");
var mailService = require('../servicios/nodemailer')
var funciones = require("../Controladores/funciones");

var multer = require('multer');

var Clientes = require("./clientes");
var Productos = require("./productos");

var Consultas = conexion.define('consultas', {

  idConsultas: {
    type : conexion.Sequelize.BIGINT(11),
    primaryKey : true,
    allowNull : false,
    autoIncrement : true
  },

  Contenido: {
    type : conexion.Sequelize.TEXT,
  },

  Foto: {
   	type : conexion.Sequelize.STRING(120)
  },

},

  {
  timestamps : false
  });


  Consultas.belongsTo(Clientes,{foreignKey : 'idClientes'});
  Consultas.belongsTo(Productos,{foreignKey : 'idProductos'});

  Consultas.borrar = function(_idConsultas,t) {
    return Consultas.destroy({
      where : {
        idConsultas : _idConsultas
      },
      transaction : t
    })
  }

  Consultas.buscarPorCliente = function(_idClientes) {
    return Consultas.findAll({
      include : [
      {
        model : Productos,
        required : false,
        attributes : ['Nombre'],
      }],
      where : {
        idClientes : _idClientes
      }
    })
  }

  Consultas.buscarUltimaPorCliente = function(_idClientes) {
    return Consultas.find({
      where : {
        idClientes : _idClientes
      },
      order : 'idConsultas DESC'
    })
  }

  Consultas.buscarClientesConConsulta = function() {
    return Consultas.findAll({
      include : [{
        model : Clientes,
        required : true,
        attributes : ['Nombre','Apellido','idClientes']
      }
      ],
      attributes : [],
      group : ['cliente.idClientes']
    })
  }    

  Consultas.crear = function(consulta) {
    var _consulta = {
      idClientes : consulta.idCliente,
      idProductos : consulta.idProductos,
      Contenido : consulta.Contenido
    }
    return Consultas.create(_consulta);  
  }

  Consultas.agregarRutaFoto = function(_idConsultas,_ruta,t) {
    return Consultas.update({
      Foto : _ruta
      },
      {
      where : {idConsultas : _idConsultas}
      ,transaction : t
    })
  }

  Consultas.guardarFoto = function(req,res) {
    Consultas.buscarUltimaPorCliente(req.body.idCliente)
    .then(consulta =>{
      req.consulta = consulta;
      upload(req,res,function(err){
        if(err){
          Consultas.borrar(consulta.idConsultas)
          .then(()=>{
            if(err.code === 'LIMIT_FILE_SIZE') 
              err.message = 'La imagen no debe superar los 5MB.'
            res.status(406)
              .send({message:'Error al enviar la imagen: ' + err.message + '. Intente nuevamente'});  
          })
        }
        else if(req.file){
          Consultas.agregarRutaFoto(consulta.idConsultas,'img/consulta/' + req.file.filename)
          .then(() =>{
            res.send('Consulta enviada Exitosamente');
          })
        }
      })
    })
  }

  Consultas.crearConsulta = function(req,res) {
    return conexion.transaction(t =>{
      var _idClientes = req.body.idCliente
      return promesaAux = new Promise((resolve,reject) =>{
        return upload(req,res,function(err){
          if(err){
            if(err.code === 'LIMIT_FILE_SIZE') {
              err.message = 'La imagen no debe superar los 5MB.'
              reject(err)
            }
            else {
              mensaje = err.message
              reject(mensaje)
            }
          }
          else if(req.file){
            req.body.idClientes = _idClientes;
            return Consultas.create(req.body,t)
            .then(consultaCreada =>{
              var filename = consultaCreada.idConsultas +  '.' + req.file.filename.split('.')[req.file.filename.split('.').length -1]
              return Consultas.agregarRutaFoto(consultaCreada.idConsultas,'img/consulta/' + filename,t)
              .then(() =>{
                resolve('Consulta enviada Exitosamente')
              })  
            })
          }
        })
        return promesaAux
      })  
    })
  }

  Consultas.responder = function(objConsulta) {
    return Clientes.buscarPorId(objConsulta.consulta.idClientes)
    .then(cliente =>{
      var producto = objConsulta.consulta.producto ? objConsulta.consulta.producto.Nombre : 'Sin Nombre';
      return armarMail(objConsulta,cliente,producto)
      .then(mailInfo=>{
        return mailService.enviarMail(mailInfo)
        .then(()=>{
          return Consultas.borrar(objConsulta.consulta.idConsultas)
        })
      })
    })
  }

  var armarMail = function(objConsulta,cliente,producto) {
    promesaAux = new Promise((resolve,reject) =>{
      if(objConsulta.consulta.Foto) {
        var nombre = (objConsulta.consulta.Foto).split('/')[(objConsulta.consulta.Foto).split('/').length -1];
        Foto = {
          Nombre : nombre,
          Ruta : getGenericPath() + nombre
        }
      }
      else {
        Foto = null
      }    
      var mailInfo = {
        direccion : cliente.Mail,
        Asunto : 'Respuesta a la Consulta realizada',
        Mensaje : 'Producto : ' + producto + '\n\n'  
          + 'Descripcion: ' + objConsulta.consulta.Contenido + '\n\n'
          + 'Respuesta : ' + objConsulta.Respuesta,
        Archivo : Foto
      } 
      resolve(mailInfo);
      reject('Error al armar el mail');
    })
    return promesaAux
  }    
     
  module.exports = Consultas


  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, 'Cliente/img/consulta/')
    },
    filename: function (req, file, cb) {
      if(req.consulta)
        return cb(null, req.consulta.idConsultas +  '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
      else 
        return cb(null, 'filename' +  '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    },

  });

  var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
      var ext = (file.originalname.split('.')[file.originalname.split('.').length -1]).toLowerCase();
      if(ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') {
          return callback(new Error('El archivo enviado debe ser una imagen'))
      }
      return callback(null, true)
    },
    limits:{
      fileSize: 5242880
    } 
  }).single('file');