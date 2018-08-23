var facturas = require('../Modelos/facturas');
var middleware = require('../servicios/middleware');


module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());

	/*RUTAS PUBLICO*/

	app.get('/facturas/cliente', [middleware.clienteMobile,middleware.ensureAuthenticated],function (req, res) {
	  facturas.traerCuenta(req.body.idCliente,req.query.Estado,req.query.offset,req.query.limite)
	  .then(facturas =>{
	    res.send(facturas);
	  })
	  .catch(err=>{
	    res.status(406)
			.send({message:err.message});
	  });  
	});

	app.get('/detalle/idFactura',[middleware.clienteMobile,middleware.ensureAuthenticated], function (req, res) {
		facturas.buscarDetalles(req.query.idFactura)
		.then(detalles =>{
			res.send(JSON.stringify(detalles));
			
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	/*RUTAS ADMINISTRADOR*/


	app.put('/admin/facturas/estado',middleware.autenticacionAdmin,function (req, res) {
	  facturas.cobrarCuenta(req.body.monto,req.body.idClientes)
	  .then(informacionCobro =>{
	    res.send(JSON.stringify(informacionCobro));
	  })
	  .catch(err=>{
	    res.status(406)
		.send({message:err.message});
	  });
	});

	app.get('/admin/facturas/cliente/estado', middleware.autenticacionAdmin,function (req, res) {
	  facturas.traerCuenta(req.query.idCliente,req.query.Estado,req.query.offset,req.query.limite)
	  .then(facturas =>{
	    res.send(facturas);
	  })
	  .catch(err=>{
	    res.status(406)
			.send({message:err.message});
	  });  
	});


	app.post('/admin/facturas',middleware.autenticacionAdmin, function (req, res) {
	  	facturas.agregarFactura(req.body)
		.then(facturaNueva =>{
			res.send(facturaNueva);
		})
		.catch(err=>{
			res.status(406)
			.send({message:err.message});
	  	})
	});

	app.delete('/admin/facturas/idFactura',middleware.autenticacionAdmin,function(req,res){
		facturas.borrarFactura(req.query.idFactura)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	})

	app.get('/admin/detalle/idFactura',middleware.autenticacionAdmin, function (req, res) {
		facturas.buscarDetalles(req.query.idFactura)
		.then(detalles =>{
			res.send(JSON.stringify(detalles));
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.delete('/admin/detalle/idDetalle', middleware.autenticacionAdmin,function (req, res) {
		facturas.borrarDetalle(req.query.idDetalles,req.query.idFactura)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res.status(422)
			.send({message:err.message});
		})
	})

	app.post('/admin/facturas/idCarrito',middleware.autenticacionAdmin, function (req, res) {
		req.body.factura.idEmpleados = req.body.idEmpleados; 
	  	facturas.entregarProductosCarrito(req.body)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err=>{
			res.status(406)
			.send({message:err.message});
		})
	});

	app.get('/admin/facturas/idFactura',middleware.autenticacionAdmin,function(req,res){
		facturas.buscarPorId(req.query.idFactura)
		.then((factura) =>{
			res.send(factura);
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})
	})

	app.get('/admin/facturas/fecha',middleware.autenticacionAdmin,function (req, res) {
		facturas.buscarPorFecha(req.query.fechaInicio,req.query.fechaFin,req.query.offset)
		.then(facturas =>{
			res.send(JSON.stringify(facturas));
		})
		.catch(err=>{
			res.status(406)
			.send({message:err.message});
		})
	}); 

	app.get('/admin/facturas/producto',middleware.autenticacionAdmin,function (req, res) {
		facturas.buscarPorProducto(req.query.idProductos)
		.then(facturas =>{
			res.send(facturas);
		})
		.catch(err=>{
			res.status(406)
			.send({message:err.message});
		})
	}); 

}
