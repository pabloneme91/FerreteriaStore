var compras = require('../Modelos/compras');
var middleware = require('../servicios/middleware');


module.exports = function (app) {

var bodyParser = require('body-parser');

app.use(bodyParser.json());


app.post('/admin/compras',middleware.autenticacionAdmin, function (req, res) {
	compras.agregarCompra(req.body)
	.then(compraNueva =>{
  		res.send(compraNueva);
	})
	.catch(err =>{
		res.status(406)
		.send({message : err.message});
	})
});

app.get('/admin/compras/idCompras',middleware.autenticacionAdmin,function(req,res){
	compras.buscarPorId(req.query.idCompras)
	.then(compra =>{
		res.send(compra);
	})
	.catch(err =>{
		res.status(406)
		.send({message:err.message});
	})
})


app.get('/admin/compras/fecha', middleware.autenticacionAdmin,function (req, res) {
	compras.buscarPorFecha(req.query.fechaInicio,req.query.fechaFin,req.query.offset)
	.then(compras =>{
		res.send(compras);
	})
	.catch(err =>{
		res.status(406)
		.send({message:err.message});
	})
}); 


app.delete('/admin/compras/idCompras',middleware.autenticacionAdmin,function(req,res){
	compras.borrarCompra(req.query.idCompras)
	.then(compraBorrada =>{
		res.sendStatus(200);
	})
	.catch(err =>{
		res.status(406)
		.send({message : err.message});
	})
})
   
app.get('/admin/lineaCompras/idCompras', middleware.autenticacionAdmin, function(req, res) {
	compras.buscarLineaCompras(req.query.idCompras)
	.then(detalleCompra =>{
		res.send(detalleCompra);
	})
	.catch(err =>{
		res.status(406)
		.send({message : err.message});
	})
});

app.delete('/admin/lineaCompras/idLineaCompras', middleware.autenticacionAdmin,function (req, res) {
	compras.borrarLineaCompras(req.query)
	.then(objeto =>{
		res.sendStatus(200);
	})
	.catch(err =>{
		res.status(406)
		.send({message : err.message});
	})
})

app.get('/admin/compras/idProveedores',middleware.autenticacionAdmin, function (req, res) {
  compras.buscarPorProveedor(req.query.idProveedores,req.query.Estado)
  .then(compras =>{
    res.send(JSON.stringify(compras,null,2));
  })
  .catch(err =>{
    res.status(406)
	.send({message:err.message});
  });  
});

app.get('/admin/lineaCompras/idCompras', middleware.autenticacionAdmin,function (req, res) {
  compras.buscarLineaCompras(req.query.idCompras)
  .then(compras =>{
    res.send(compras);
  })
  .catch(err =>{
    res.status(406)
	.send({message:err.message});
  });  
});

app.put('/admin/compras/estado',middleware.autenticacionAdmin, function (req, res) {
  compras.pagarProveedor(req.body.monto,req.body.idProveedores)
  .then(informacionCobro =>{
    res.send(informacionCobro);
  })
  .catch(err=>{
  	res.status(406)
	.send({message : err.message});
  });
});

app.get('/admin/compras/producto',middleware.autenticacionAdmin,function (req, res) {
	compras.buscarPorProducto(req.query.idProductos)
	.then(compras =>{
		res.send(compras);
	})
	.catch(err=>{
		res.status(406)
		.send({message:err.message});
	})
}); 

app.get('/admin/compras/proveedor/estado', middleware.autenticacionAdmin,function (req, res) {
	  compras.traerCuenta(req.query.idProveedores,req.query.Estado,req.query.offset,req.query.limite)
	  .then(compras =>{
	    res.send(compras);
	  })
	  .catch(err=>{
	    res.status(406)
		.send({message:err.message});
	  });  
	});



}
