var consulta = require('../Modelos/consultas');
var middleware = require('../servicios/middleware');
var multer = require('multer');

module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	app.use(bodyParser.urlencoded({extended : true}));

	//FUNCION PUBLICO

	/*Consulta Ionic*/
	app.post('/consulta/mobile/foto',[middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) { 
		consulta.crearConsulta(req,res)
		.then(() =>{
	  		res.send('Consulta enviada Exitosamente');
		})
		.catch(err =>{
			res.status(422)
			.send(err.message)
		})
	});	

	app.post('/consulta/mobile',[middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) { 
		consulta.crear(req.body)
		.then(() =>{
	  		res.send('Consulta enviada Exitosamente');
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	});
	/*Consulta Ionic*/

	app.post('/consulta',[middleware.ensureCaptcha,middleware.ensureAuthenticated],function (req, res) { 
		consulta.crear(req.body)
		.then(() =>{
	  		res.send('Consulta enviada Exitosamente');
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	});

	app.post('/consulta/foto',middleware.ensureAuthenticated,function (req, res) { 
		consulta.guardarFoto(req,res)
	});

	//FUNCION ADMINISTRADOR

	app.get('/admin/consulta/cliente',middleware.autenticacionAdmin,function (req, res) { 
		consulta.buscarPorCliente(req.query.idClientes)
		.then(consultas =>{
	  		res.send(consultas);
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	});

	app.post('/admin/consulta/respuesta',middleware.autenticacionAdmin,function(req,res) {
		consulta.responder(req.body)
		.then(() =>{
	  		res.sendStatus(200);
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	})


}


