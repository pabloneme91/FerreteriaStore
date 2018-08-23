var productos = require('../Modelos/productos');
var rubros = require('../Modelos/rubros');
var middleware = require('../servicios/middleware');

module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	
	/*RUTAS PUBLICO*/

	app.get('/productos/nombre', function (req, res) {
		productos.buscarPorNombre(req.query.Nombre)
		.then(function(producto){
	  		res.send(JSON.stringify(producto,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/productos/nombre/pagina', function (req, res) {
		productos.buscarPorNombrePaginado(req.query)
		.then(function(producto){
	  		res.send(JSON.stringify(producto,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/productos/ofertas', function (req, res) {
		productos.buscarOfertas()
		.then(function(productos){
	  		res.send(productos);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/productos/destacados', function (req, res) {
		productos.buscarDestacados()
		.then(function(productos){
	  		res.send(productos);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});		

	app.get('/rubros',function(req,res){
		rubros.buscarRubros()
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/productos/subRubro',function(req,res){
		productos.buscarPorRubro(req.query)
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/rubros/subRubros',function(req,res){
		rubros.buscarRubrosConSubRubros()
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/subRubros/idRubro',function(req,res){
		rubros.buscarSubRubros(req.query.idRubro)
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	/*RUTAS ADMINISTRADOR*/

	app.get('/admin/productos/nombre',middleware.autenticacionAdmin, function (req, res) {
		productos.buscarPorNombre(req.query.Nombre)
		.then(function(producto){
	  		res.send(producto);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/productos',middleware.autenticacionAdmin, function (req, res) {
		productos.buscarPorNombre('')
		.then(function(producto){
	  		res.send(producto);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/productos/ventas',middleware.autenticacionAdmin, function (req, res) {
		productos.buscarConVentas()
		.then(function(producto){
	  		res.send(JSON.stringify(producto,null,2));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.post('/admin/productos',middleware.autenticacionAdmin,function(req,res){
		productos.crear(req.body)
		.then(function(producto){
			res.send(producto);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.post('/admin/productos/foto',middleware.autenticacionAdmin,function (req, res) { 
		productos.guardarFoto(req,res)
	});

	app.put('/admin/productos/foto',middleware.autenticacionAdmin,function (req, res) { 
		productos.modificarFoto(req,res)
	});	

	app.put('/admin/productos/',middleware.autenticacionAdmin,function(req,res){ 
		productos.modificar(req.body)
		.then(function(producto){
			res.sendStatus(200);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.delete('/admin/productos',middleware.autenticacionAdmin,function(req,res){ 
		productos.borrar(req.query.idProductos)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			 res
	 		.status(406)
	 		.send({message: err.message});
		})
	});

	app.post('/admin/rubros',middleware.autenticacionAdmin,function(req,res){
		rubros.crear(req.body)
		.then(function(rubro){
			res.send(rubro);
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	
	app.put('/admin/rubros',middleware.autenticacionAdmin,function(req,res){
		rubros.modificar(req.body)
		.then(rubros =>{
			res.send(JSON.stringify(rubros));
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/subRubros',function(req,res){
		rubros.buscarSubRubros(req.query.idRubro)
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	app.delete('/admin/subRubros',middleware.autenticacionAdmin,function(req,res){
		rubros.borrar(req.query.idSubRubro)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			 res.status(406)
	 		.send({message: err.message});
		})
	});

	app.get('/admin/rubros/subRubros',middleware.autenticacionAdmin,function(req,res){
		rubros.buscarRubrosConSubRubros()
		.then(function(rubros){
			res.send(JSON.stringify(rubros));
		})
		.catch(function(err){
			res.status(406)
			.send({message:err.message});
		})
	});

	
}



