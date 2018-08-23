var pagosProveedores = require('../Modelos/pagosProveedores');
var compras = require('../Modelos/compras');
var middleware = require('../servicios/middleware');


module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	app.get('/admin/pagos/idCompras', middleware.autenticacionAdmin,function (req, res) {
		pagosProveedores.buscarPorCompra(req.query.idCompras)
		.then(pagos =>{
			res.send(pagos);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
	  	});
	});	

	app.get('/admin/pagos/idProveedores', middleware.autenticacionAdmin,function (req, res) {
		pagosProveedores.buscarPorProveedor(req.query.idProveedores,req.query.offset)
		.then(pagos =>{
			res.send(JSON.stringify(pagos));
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/lineaPagosProveedores/idPagosProveedores',middleware.autenticacionAdmin, function (req, res) {
		compras.buscarLineaPagosProveedores(req.query.idPagosProveedores)
		.then(detallePago =>{
			res.send(detallePago);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.delete('/admin/pagos/idPagosProveedores',middleware.autenticacionAdmin, function (req, res) {
		compras.borrarPagosProveedores(req.query.idPagosProveedores)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

}
