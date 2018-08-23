var conexion = require("../config/conexionBD");
var funciones = require("..//Controladores/funciones");
var mailService = require('..//servicios/nodemailer');
var service = require('../servicios/service');
var moment = require('moment');

var Clientes = conexion.define('clientes', {

  idClientes: {
  type : conexion.Sequelize.BIGINT(11),
  primaryKey : true,
  allowNull : false,
  autoIncrement : true
  },

  Nombre: {
    type : conexion.Sequelize.STRING(30),
    validate : {
      isAlpha: {
      msg : 'Nombre: solo puede contener caracteres alfabeticos'
      },
      len : {
        args: [3,30],
        msg : 'Nombre: debe contener entre 3 y 30 caracteres'
      },

    }
  },

  Apellido: {
    type : conexion.Sequelize.STRING(30),
    validate : {
      isAlpha: {
      msg : 'Apellido: solo puede contener caracteres alfabeticos'
      },
      len : {
        args: [3,30],
        msg : 'Apellido:  debe contener entre 3 y 30 caracteres'
      },
    }
  },
  
  Telefono: {
    type : conexion.Sequelize.BIGINT(15),
    validate : {
    	isInt : {
    	msg : 'Telefono : ingresar Solo Numeros'
    	},
  	}
  },

  FechaNacimiento: {
    type : conexion.Sequelize.DATEONLY,
    isDate : {
      msg : 'Fecha : fecha Invalida'
    },
  },

  Contrasenia: {
    type : conexion.Sequelize.STRING(30),
    validate : {
      len : {
        args: [3,30],
        msg : 'Contrasenia: el campo no puede estar vacio'
      },
    }
  },

  Mail: {
   	type : conexion.Sequelize.STRING(30),
    validate : {
   		isEmail: {
   			args: true,
   			msg : "Mail : formato incorrecto de Email"
   		},
      controlUnique : function(value) {
        return Clientes.find({where : {Mail : value}})
        .then(cliente =>{
          if(cliente && (!(cliente.idClientes === this.idClientes)))
            throw new Error('Mail: Ya existe un usuario con ese mail')
        })
      }
   	}
  },

  Documento : {
    type : conexion.Sequelize.BIGINT(11),
    validate : {
      isInt : {
      msg : 'Documento: Ingresar Solo Numeros'
      },
      len : {
        args: [1,11],
        msg : 'Documento:  supera el numero de digitos permitido'
      },
      controlUnique : function(value) {
        return Clientes.find({where : {Documento : value}})
        .then(cliente =>{
          if(cliente)
            throw new Error('Documento :Ya existe un usuario con ese Documento')
        })
      }
    }
  },

  Saldo: {
   	type : conexion.Sequelize.DECIMAL(10,2)
  },

  
  Estado : {
    type : conexion.Sequelize.CHAR(1),
  },  

},
  
{
  timestamps : false,
  validate : {
    controlNull : function() {
      if(this.idClientes === null) {
        if(this.Nombre == null || this.Apellido == null
          || (this.FechaNacimiento.opened === true ||
          this.FechaNacimiento.opened === false )  || this.Documento == null
          || this.Mail == null || this.Contrasenia == null) 
          throw new Error('Rellene los campos que tienen *')
      }
    }
  }
});

  

  Clientes.crear = function(objeto) {
   return Clientes.create({
    Nombre : objeto.Nombre,
    Apellido : objeto.Apellido,
    FechaNacimiento : objeto.FechaNacimiento,
    Documento : objeto.Documento,
    Contrasenia : objeto.Contrasenia,
    Mail : objeto.Mail,
    Telefono : objeto.Telefono
    });
  }

  Clientes.borrar = function(_idClientes) {
    return Clientes.destroy({
      where : {
        idClientes : _idClientes
      }
    })
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede eliminar el cliente ya que tiene facturas compradas')
      else return err
    })
  }


  Clientes.cambiarEstado = function(_idClientes,_saldo,_estado) {
    return Clientes.update({
      idClientes : _idClientes,
      Estado : _estado,
      Saldo: _saldo,
      Estado : _estado
    },
    {
      where : {
        idClientes : _idClientes
      }
    })
  }

  Clientes.registrar = function(objCliente) {
    return conexion.transaction(t =>{
      return Clientes.crear(objCliente)  
      .then(() =>{
        var mailInfo = {
          direccion : objCliente.Mail,
          Asunto : 'Registro de usuario',
          Mensaje : 'El usuario: ' + objCliente.Apellido + ', ' + objCliente.Nombre + ' desea registrarse'
        }
        return mailService.enviarMail(mailInfo)
      })  
    })
  }

  Clientes.traerTodos = function () {
    return Clientes.findAll({
      attributes : {exclude : ['Contrasenia','PreguntaSeguridad','RespuestaSeguridad']},
      order : ['Apellido']
    });
  }

  Clientes.buscarPorNombre = function (_nombre) {
    return Clientes.findAll({
      attributes : {exclude : ['Contrasenia','PreguntaSeguridad','RespuestaSeguridad']},
      where : {
        Nombre : {
          $like : "%" + _nombre + "%"
        }
      },
      order : ['Apellido']  
    });
  };


  Clientes.buscarPorId = function (_id) {
    return Clientes.find({
      attributes : ['idClientes','Nombre','Apellido', 'Documento', 'Telefono',
      [conexion.fn('date_format', conexion.col('FechaNacimiento'), '%d-%m-%Y'), 'FechaNacimiento'],'Mail','Saldo'],
      where : {
        idClientes : _id
      }  
    })
  };


  Clientes.buscarPorEstado = function(estado) {
    return Clientes.findAll({
      attributes : ['idClientes','Nombre','Apellido', 'Documento', 'Telefono',
       [conexion.fn('date_format', conexion.col('FechaNacimiento'), '%d-%m-%Y'), 'FechaNacimiento'],
        'Mail','Saldo','Estado'],
      where : {
          Estado : estado
        },
        order : ['Apellido']
    })
  }

  Clientes.recuperarContrasenia = function(_documento) {
    return Clientes.buscarPorDocumento(_documento)
    .then(cliente =>{
      if(cliente === null) 
        throw new Error('No existe un usuario con ese documento')
      else {
        var mailInfo = {
        direccion : cliente.Mail,
        Asunto : 'Recuperacion de contrasenia',
        Mensaje : 'Usuario: ' + cliente.Apellido + ', ' + cliente.Nombre + '\n' +
                  'Contrasenia : ' + cliente.Contrasenia
        }
        return mailService.enviarMail(mailInfo)
        .then(() =>{
          return {Mail : cliente.Mail}
        })
      }
    })  
  }


  Clientes.buscarPorDocumento = function(_documento) {
    return Clientes.find({
      where : {
        Documento : _documento
      }
    })
  }

  Clientes.buscarDeudores = function() {
    return conexion.query('CALL buscarDeudores();')
  }

  
  Clientes.actualizarSaldo = function(nuevoSaldo,_idClientes,t) {
    return Clientes.update({
      idClientes : _idClientes,
      Saldo : nuevoSaldo
      },
      {
      where : {idClientes : _idClientes}
      ,transaction : t})
  }

  Clientes.modificarCliente = function(objCliente) {
    return Clientes.update({
      idClientes : objCliente.idCliente,
      Telefono : objCliente.Telefono,
      Mail : objCliente.Mail,
      Contrasenia : objCliente.Contrasenia
      },
      {
      where : {idClientes : objCliente.idCliente}
      })
  }

  Clientes.verificarLogin = function(_documento,_contrasenia) {
    return Clientes.find({
      where : {
        Documento : _documento,
        Contrasenia : _contrasenia
      }
    })
    .then(usuario =>{
      if(!usuario)
        throw new Error('Los datos ingresados son incorrectos');
      else if (usuario.Estado === 'I' )
        throw new Error('El usuario se encuentra inactivo. Consulte al local ante cualquier duda');
      else {
        var objToken =  {
          token : service.crearPublicToken(usuario),
          cliente : {Nombre : usuario.Nombre,
          Apellido : usuario.Apellido}
        }
        return objToken;
      }
    })
  }

  Clientes.renovarToken = function(obj) {
    return Clientes.buscarPorId(obj.idCliente)
    .then(usuario =>{
      var objToken =  {
        token : service.crearPublicToken(usuario),
        cliente : {Nombre : usuario.Nombre,
        Apellido : usuario.Apellido}
      }
      return objToken;  
    })
  }
  
  module.exports = Clientes