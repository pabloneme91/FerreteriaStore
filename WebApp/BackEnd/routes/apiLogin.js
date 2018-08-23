var clientes = require('../Modelos/clientes');
var empleados = require('../Modelos/empleados');
var middleware = require('../servicios/middleware');
var service = require('../servicios/service');

module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	app.post('/login', function(req, res) {
	 	clientes.verificarLogin(req.body.Documento,req.body.Contrasenia)
	 	.then(objLogin =>{
	 		res.send(objLogin);
	 	})
	 	.catch(err =>{
			res.status(406)
			.send({message:err.message});
	 	})
	});

	app.post('/login/empleado', function(req, res) {
	 	empleados.verificarLogin(req.body)
	 	.then(objLogin =>{
			res.send(objLogin);
	 	})
	 	.catch(err =>{
			res.status(406)
			.send({message:err.message});
	 	}) 	
	});

	app.post('/login/renovarToken',[middleware.verificarTokenValido], function(req, res) {
	 	clientes.renovarToken(req.body)
	 	.then(objLogin =>{
			res.send(objLogin);
	 	})
	 	.catch(err =>{
			res.status(406)
			.send({message:err.message});
	 	}) 	
	});	
}
		
