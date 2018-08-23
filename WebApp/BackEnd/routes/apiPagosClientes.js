var pagosClientes = require('../Modelos/pagosClientes');
var facturas = require('../Modelos/facturas');
var middleware = require('../servicios/middleware');


module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	app.get('/admin/pagos/idCliente',middleware.autenticacionAdmin, function (req, res) {
		pagosClientes.buscarPorCliente(req.query.idCliente,req.query.offset)
		.then(pagos =>{
			res.send(pagos);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
	  	});
	});

	app.get('/admin/pagos/idFactura',middleware.autenticacionAdmin, function (req, res) {
		pagosClientes.buscarPorFactura(req.query.idFactura)
		.then(pagos =>{
			res.send(pagos);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
	  	});
	});

	app.get('/admin/lineaPagosClientes/idPagosClientes',middleware.autenticacionAdmin, function (req, res) {
		facturas.buscarLineaPagosClientes(req.query.idPagosClientes)
		.then(detallePago =>{
			res.send(detallePago);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.delete('/admin/pagos/idPagosClientes',middleware.autenticacionAdmin, function (req, res) {
		facturas.borrarPagosClientes(req.query.idPagosClientes)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});
}
