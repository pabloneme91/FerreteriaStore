var jwt = require('jwt-simple');  
var moment = require('moment');  
var config = require('../config/config');

module.exports = {

  crearPublicToken : function(user) {  
    var payload = {
      idCliente: user.idClientes,
      iat: moment().unix(),
      exp: moment().add(10000, "minutes").unix(),
    };
    return jwt.encode(payload, config.PUBLIC_TOKEN_SECRET);
  },

  crearAdminToken : function(user) {  
    var payload = {
      idEmpleados: user.idEmpleados,
      iat: moment().unix(),
      exp: moment().add(10, "minutes").unix(),
      Rol : user.Rol
    }
    return jwt.encode(payload, config.ADMIN_TOKEN_SECRET);
  },

}

