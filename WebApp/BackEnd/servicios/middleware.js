var jwt = require('jwt-simple'); 
var moment = require('moment'); 
var config = require('../config/config');
var requestify = require('requestify'); 
var carrito = require('../Modelos/carrito');
var lineaCarrito = require('../Modelos/lineaCarrito');


module.exports = { 

clienteMobile : function(req,res,next) {
	if(req.query.Token)
		req.headers.cookie = req.query.Token
	else if(req.body.Token)
		req.headers.cookie = req.body.Token
	next();
},
 
ensureAuthenticated : function(req, res, next) { 

	token = controlCookiePublicToken(req.headers.cookie);

 	if(!token) {
 		return res
 		.status(403)
 		.send({message: "Debe Loggearse para utilizar esta funcion"});
 	}

 	var payload = jwt.decode(token, config.PUBLIC_TOKEN_SECRET);

	if(payload.exp <= moment().unix()) {
 		return res
 		.status(401)
 		.send({message: "Su sesion Expiro. Debe Loggearse de nuevo"});
 	}

 	req.body.idCliente = payload.idCliente;

 	next();
},

verificarTokenValido : function(req, res, next) { 

	token = controlCookiePublicToken(req.body.Token);

	console.log(token)

 	if(!token) {
 		return res
 		.status(403)
 		.send({message: "Debe Loggearse para utilizar esta funcion"});
 	}

 	var payload = jwt.decode(token, config.PUBLIC_TOKEN_SECRET);

 	req.body.idCliente = payload.idCliente;

 	next();
},

verificarCarritoPorCliente : function(req, res, next) { 
 	
 	carrito.verificarCarritoPorCliente(req.body.idCliente,req.query.idCarrito,req.query.idLineaCarrito)
 	.then(function(respuesta){
 		next();
 	})
 	.catch(function(err){
 		return res.
 		status(403)
 		.send({message : err.message})
 	})

},

ensureCaptcha : function(req,res,next) {
	requestify.get('https://www.google.com/recaptcha/api/siteverify?secret=6LfS8wcUAAAAAGQf5l840mJ6Hhw0jKEvucHOCdxr&response=' + req.body.captcha)
	.then(function(response) {
		if(response.getBody().success === false )
  			return res.status(405).send({message : "Resolver captcha correctamente"});
  		else next();
	});

},

ensureAdminLogin : function(req, res, next) { 
 	token = controlCookieAdminToken(req.headers.cookie);

 	if(!token) 
 		return res.sendFile('../../Cliente/vistas/Administrador/adminLog.html');

 	var payload = jwt.decode(token, config.ADMIN_TOKEN_SECRET);

 	req.body.idEmpleados = payload.idEmpleados;


 	next();
},

autenticacionAdmin : function(req, res, next) { 
 	token = controlCookieAdminToken(req.headers.cookie);

 	if(token === null) 
 		return res.redirect('/admin');

 	var payload = jwt.decode(token, config.ADMIN_TOKEN_SECRET);

 	req.body.idEmpleados = payload.idEmpleados;

 	next();
},

}

var controlCookiePublicToken = function(cookie)  {
	if(!cookie)
		return token = null
	var x = (cookie).split(";")
	var c = x[0].charAt(0);
	var index;

	for(index = 0; index < x.length ; index++ ){
		x[index] = x[index].trim();
		var c = x[index].charAt(0);
		if(c === 's') {
			x = x[index].split("=");
			return token = x[1];
		}
		if(index === x.lenth -1)
			return token = null
	}
}

var controlCookieAdminToken = function(cookie)  {
	if(!cookie)
		return token = null
	var x = (cookie).split(";")
	var c = x[0].charAt(0);
	var index;

	for(index = 0; index < x.length ; index++ ){
		x[index] = x[index].trim();
		var c = x[index].charAt(0);
		if(c === 't') {
			x = x[index].split("=");
			return token = x[1];
		}
		if(index === x.lenth -1)
			return token = null
	}
}