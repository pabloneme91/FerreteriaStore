var conexion = require("../config/conexionBD");


module.exports = { 

	buscarTodos : function (objeto) {
		return objeto.findAll();
	},

	buscarPorId : function (objeto,id) {
	return objeto.findById(id);

   },

	borrar : function (objeto,id) {
    objeto.findById(id).then(function(obj){
    	obj.destroy();
    });

  },

  crear : function(objeto,nuevo) {
  	objeto.create(nuevo)
  },

}