var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Proveedores = conexion.define('proveedor', {

 idProveedores: {
 type : conexion.Sequelize.BIGINT(11),
 primaryKey : true,
 allowNull : false,
 autoIncrement : true
 },

 Nombre: {
    type : conexion.Sequelize.STRING(30),
    allowNull : false,
  },

 Saldo: {
    type : conexion.Sequelize.DECIMAL(10,2),
    validate : {
    	isFloat: {
    	args : true,
    	msg : 'Ingresar Solo Numeros'
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
   	type : conexion.Sequelize.STRING(30),
   	validate : {
   		isEmail: {
   			args: true,
   			msg : "Formato incorrecto de Email"
   		}
   	}
  },

  },
  
  {
  timestamps : false,
  freezeTableName: true,
  tableName: 'proveedores'
  });


  Proveedores.crear = function(_proveedor) {
    return Proveedores.create(_proveedor)
  }

  Proveedores.modificar = function(_proveedor) {
    return Proveedores.update({
      Nombre : _proveedor.Nombre,
      Telefono : _proveedor.Telefono,
      Mail : _proveedor.Mail,
      Saldo : _proveedor.Saldo
      },
      {
        where : {
          idProveedores : _proveedor.idProveedores
        }
    })
  }

  Proveedores.borrar = function(objProveedor) {
    return  conexion.transaction(t=>{
      if(objProveedor.Saldo > 0)
         throw new Error('No se puede borrar el proveedor ya que tiene un saldo pendiente') 
      else {
        return Proveedores.destroy({
          where : {
            idProveedores : objProveedor.idProveedores
          }
        })
        .catch(err=>{
          if(err.parent.errno === 1451)
            throw new Error('No se puede borrar el proveedor ya que hay compras realizadas con al mismo')
          else return err
        })        
      }
    })
  }


  Proveedores.traerTodos = function() {
    return Proveedores.findAll()
  }

  Proveedores.traerConDeuda = function() {
    return conexion.query('CALL buscarProveedorConDeuda();')
  }

  Proveedores.buscarPorId = function (_id) {
    return Proveedores.find({
      where : {
        idProveedores : _id
      }  
    });
  };

  Proveedores.actualizarSaldo = function(nuevoSaldo,_idProveedores,t) {
    return Proveedores.update({
      Saldo : nuevoSaldo
      },
      {
      where : {idProveedores : _idProveedores}
      ,transaction : t})
  }

  module.exports = Proveedores