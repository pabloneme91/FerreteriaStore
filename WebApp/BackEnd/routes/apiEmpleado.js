var empleados = require('../Modelos/empleados');
var middleware = require('../servicios/middleware');

module.exports = function (app) {

	var bodyParser = require('body-parser');

	app.use(bodyParser.json());


	app.post('/admin/empleados',middleware.autenticacionAdmin,function(req,res){
		empleados.crear(req.body.Empleado)
		.then(empleado =>{
			res.send(empleado);
		})
		.catch(err =>{
			res
 			.status(406)
 			.send({message: err.message});
		})
	});

	app.get('/admin/empleados',middleware.autenticacionAdmin, function (req, res) {
		empleados.traerTodos()
		.then(empleados =>{
	  		res.send(JSON.stringify(empleados,null,2));
		})
		.catch(err =>{
			res.status(406)
			.send({message:err.message});
		})

	});

    app.get('/admin/empleados/idEmpleados',middleware.autenticacionAdmin, function (req, res) {
	    empleados.buscarPorId(req.body.idEmpleados)
	    .then(empleado=> {
	      res.send(empleado);
	    })
	    .catch(err=> {
	      res.status(422)
	      .send({message:err.message});
	    });  
  	});	

	app.put('/admin/empleados',middleware.autenticacionAdmin,function(req,res){ 
		empleados.modificar(req.body)
		.then((e) =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res
	 		.status(406)
	 		.send({message: err.message});
		})
	});

	app.put('/admin/empleados/estado',middleware.autenticacionAdmin,function(req,res){ 
		empleados.modificarEstado(req.body)
		.then((e) =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			res
	 		.status(406)
	 		.send({message: err.message});
		})
	});	

	app.delete('/admin/empleados',middleware.autenticacionAdmin,function(req,res){ 
		empleados.borrar(req.query.idEmpleados)
		.then(() =>{
			res.sendStatus(200);
		})
		.catch(err =>{
			 res
	 		.status(406)
	 		.send({message: 'No se puede borrar el empleado ya que hay transacciones realizadas con el mismo'});
		})
	});

}
