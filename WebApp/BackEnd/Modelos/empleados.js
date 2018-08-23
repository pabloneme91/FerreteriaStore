var conexion = require("../config/conexionBD");
var service = require('../servicios/service');
var funciones = require("../Controladores/funciones");

var Empleados = conexion.define('empleados', {

 idEmpleados: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Nombre: {
    type : conexion.Sequelize.STRING(30),
    allowNull : false,
    validate : {
      is: {
      args : ["^[a-z]+$",'i'],
      msg : 'Ingresar Letras'
      }
    }
  },

 Apellido: {
    type : conexion.Sequelize.STRING(30),
    allowNull : false,
    validate : {
    	is: {
    	args : ["^[a-z]+$",'i'],
    	msg : 'Ingresar Letras'
    	}
    }
  },
  
  Telefono: {
    type : conexion.Sequelize.BIGINT(15),
    validate : {
    	isInt : {
    	args : true,
    	msg : 'Ingresar Solo Numeros'
    	}
  	}
  },

  Mail: {
   	type : conexion.Sequelize.STRING(60),
    allowNull : false,
   	validate : {
   		isEmail: {
   			args: true,
   			msg : "Formato incorrecto de Email"
   		}
   	}
  },

  Documento : {
  	type : conexion.Sequelize.BIGINT(11),
  	allowNull: false,
  	validate : {
  		isInt : {
    	args : true,
    	msg : 'Ingresar Solo Numeros'
  		},
      validate : {
        controlUnique : function(value) {
          return Empleados.find({where : {Documento : value}})
          .then(empleado =>{
            if(empleado && (!(empleado.idEmpleados === this.idEmpleados)))
              throw new Error('Ya existe un empleado con ese documento')
          })
        }
      }     
  	}
  },

  Contrasenia : {
    type : conexion.Sequelize.STRING(30),
    allowNull: false,
  },

  Rol : {
    type : conexion.Sequelize.CHAR(1),
    allowNull: false,
  },

  Estado : {
    type : conexion.Sequelize.STRING(10),
  }

  },
  
  {
  timestamps : false
  });

  
  Empleados.crear = function(_empleado) {
    return Empleados.create(_empleado)
  }

  Empleados.borrar = function(_idEmpleados) {
    return Empleados.destroy({
      where : {
        idEmpleados : _idEmpleados
      }
    })
  }

  Empleados.modificar = function(_empleado) {
    return Empleados.update({
      Telefono : _empleado.Telefono,
      Mail : _empleado.Mail,
      },
      {
      where : {
        idEmpleados : _empleado.idEmpleados
      }
    })
  }

  Empleados.modificarEstado = function(obj) {
    return Empleados.update({
      Estado : obj.Estado,
      },
      {
      where : {
        idEmpleados : obj.idEmpleado
      }
    })
  }
  
  Empleados.traerTodos = function() {
    return Empleados.findAll({
      attributes : ['idEmpleados',[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre'],
        'Documento', 'Telefono','Mail','Rol','Estado'],
    })
  }

  Empleados.buscarPorId = function (_id) {
    return Empleados.find({
      attributes : ['idEmpleados',[conexion.fn('COALESCE', (conexion.fn('concat', conexion.col('Apellido'), ', ',conexion.col('Nombre')))),'Nombre'],
       'Documento', 'Telefono','Mail','Rol'],
      where : {
        idEmpleados : _id
      }  
    })
  };


  Empleados.verificarLogin = function(_empleado) {
    return Empleados.find({
      where : {
        Documento : _empleado.Documento,
        Contrasenia : _empleado.Contrasenia
      }
    })
    .then(empleado =>{
      if(!empleado)
        throw new Error('Los datos ingresados son incorrectos');
      else {
        var objToken =  {
          token : service.crearAdminToken(empleado),
          Empleado : empleado.Apellido + ", " + empleado.Nombre,        
        }
      }
      return objToken;
    })
  }
  
  module.exports = Empleados
