var facturas = require('../Modelos/facturas');
var carrito = require('../Modelos/carrito');
var middleware = require('../servicios/middleware');
var fs = require('fs')

module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	/*RUTAS PUBLICO*/

	app.post('/carrito/idProducto',[middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) { 
		carrito.agregarProducto(req.body)
		.then(function(producto){
	  		res.send(producto);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.post('/carrito/idCliente',[middleware.clienteMobile,middleware.ensureAuthenticated],function(req,res){
		carrito.comprar(req.body.idCliente)
		.then(carritoComprado =>{
			res.send(carritoComprado);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	})


	app.get('/carrito/idCliente',[middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) { 
		carrito.traerPorCliente(req.body.idCliente)
		.then(function(carrito){
	  		res.send(JSON.stringify(carrito,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});




	app.get('/carrito/download',[middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) { 
		carrito.traerUltimoComprado(req.body.idCliente)
		.then(idCarrito =>{
			var file = getGenericPath() + idCarrito + '.pdf';
	   		res.download(file)	
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	 
	app.get('/carrito/idLineaCarrito', function (req, res) {
		carrito.traerLineaCarrito(req.query.idCarrito)
		.then(detalleCarrito =>{
			res.send(JSON.stringify(detalleCarrito));
		})
		.catch(err =>{ 
			res.status(406)
			.send({message:err.message});
		})
	});
	 


	app.delete('/carrito/idLineaCarrito',[middleware.clienteMobile,middleware.ensureAuthenticated,middleware.verificarCarritoPorCliente],function (req, res) {
		carrito.borrarLineaCarrito(req.query.idLineaCarrito,req.query.idCarrito)
		.then(carrito =>{
	  		res.send(JSON.stringify(carrito,null,2));
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	});

	/*RUTAS ADMINISTRADOR*/

	app.delete('/admin/carrito/idLineaCarrito',middleware.autenticacionAdmin,function (req, res) { 
		carrito.borrarLineaCarritoEncargado(req.query.idLineaCarrito,req.query.idCarrito)
		.then(() =>{
	  		res.sendStatus(200);
		})
		.catch(err =>{
			res.sendStatus(406);
		})
	});

	app.delete('/admin/carrito/idCarrito',middleware.autenticacionAdmin,function(req,res){
		carrito.borrarCarritoEncargado(req.query.idCarrito)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	})

	app.get('/admin/carrito/idCarrito',middleware.autenticacionAdmin,function (req, res) { 
		carrito.traerPorId(req.query.idCarrito)
		.then(function(carrito){
	  		res.send(carrito);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/carrito/idCliente',middleware.autenticacionAdmin,function (req, res) {
		carrito.traerVentasPendientes(req.query)
		.then(function(carrito){
	  		res.send(JSON.stringify(carrito,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/carrito/idProducto',middleware.autenticacionAdmin,function (req, res) {
		carrito.traerVentasPendientesPorProducto(req.query.idProducto)
		.then(function(carrito){
	  		res.send(JSON.stringify(carrito,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/carrito/idLineaCarrito',middleware.autenticacionAdmin, function (req, res) {
		carrito.traerLineaCarritoEncargado(req.query.idCarrito)
		.then(detalleCarrito =>{
			res.send(JSON.stringify(detalleCarrito));
		})
		.catch(err =>{ 
			res.status(406)
			.send({message:err.message});
		})
	});


	app.get('/admin/clientes/carrito/estado',middleware.autenticacionAdmin, function (req, res) {
		carrito.traerClienteConCarritoPendiente()
		.then(clientes =>{
			res.send(clientes);
		})
		.catch(err =>{ 
			res.status(406)
			.send({message:err.message});
		})
	});

	



}
