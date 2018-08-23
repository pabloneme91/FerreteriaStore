
var conexion = require("../config/conexionBD");

var funciones = require("../Controladores/funciones");

var Promesa = require('bluebird');

var Rubros = conexion.define('rubros', {

 idSubRubro: {
   type : conexion.Sequelize.BIGINT(11),
   primaryKey : true,
   allowNull : false,
   autoIncrement : true
 },

 Nombre: {
    type : conexion.Sequelize.STRING(25),
    allowNull : false,
    validate : {
      controlUnique : function(value) {
        return Rubros.find({where : {Nombre : value}})
        .then(rubro =>{
          if(rubro && (rubro.idRubro === this.idRubro))
            throw new Error('Rubro: Ya existe un subrubro con ese nombre para el rubro elegido')
        })
      }
    }    
  },

  },

  {
  timestamps : false
  });

  Rubros.belongsTo(Rubros,{foreignKey : 'idRubro'});


  Rubros.crear = function (rubro) {
    return Rubros.create(rubro)
  }

  Rubros.borrar = function (_idRubro) {
    return Rubros.destroy({
      where : {
        idSubRubro : _idRubro
      }
    })
    .catch(err=>{
      if(err.parent.errno === 1451)
        throw new Error('No se puede borrar el subrubro ya que hay productos que pertenecen al mismo')
      else return err
    })    
  }


  Rubros.buscarRubrosConSubRubros = function() {
    return Rubros.buscarRubros()
    .then(rubros =>{
      return buscarSubRubrosTest(rubros)
    })
  }
  
  Rubros.buscarRubros = function() {
    return Rubros.findAll({
      attributes : ['idSubRubro','Nombre'],
      where : {
        idRubro : null
      },
      order : 'Nombre',
    })
  };

  
  Rubros.buscarSubRubros = function(_idRubro) {
    return Rubros.findAll(
    {
      where : {
        idRubro : _idRubro
      }
    })
  };

  Rubros.modificar = function(objeto) {
    return Rubros.update(
      {
        Nombre : objeto.Nombre,
        idRubro : objeto.idRubro
      }, 
      {where : {
        idSubRubro : objeto.idSubRubro
      }
    })
  }

  var buscarSubRubrosTest = function(rubros) {
    var resultado = [];
    return Promesa.each(rubros,function(rubro){
      return Rubros.buscarSubRubros(rubro.idSubRubro)
      .then(subRubros =>{
        var objeto = {};
        objeto.Rubro = rubro.Nombre;
        objeto.subRubros = subRubros;
        resultado.push(objeto);
      })
    })
    .then(()=>{
      return resultado;
    })
  }

  module.exports = Rubros