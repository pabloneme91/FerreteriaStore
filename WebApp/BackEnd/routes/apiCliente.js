var clientes = require('../Modelos/clientes');
var consulta = require('../Modelos/consultas');
var bodyParser = require('body-parser');
var middleware = require('../servicios/middleware');

module.exports = function(app) {

  app.use(bodyParser.json());


  //FUNCIONES PUBLICO
  app.post('/clientes',middleware.ensureCaptcha,function (req, res) {
    clientes.registrar(req.body.cliente)
    .then(() =>{
      res.sendStatus(200);
    })
    .catch(err =>{
      res.status(422)
      .send({message:err.message});
    })
  });

  app.post('/clientes/contrasenia',middleware.ensureCaptcha,function (req, res) {
    clientes.recuperarContrasenia(req.body.Documento)
    .then((mail) =>{
      res.send(mail);
    })
    .catch(err =>{
      res.status(422)
      .send({message:err.message});
    })
  });

  app.get('/clientes/idClientes',[middleware.clienteMobile,middleware.ensureAuthenticated], function (req, res) {
    clientes.buscarPorId(req.body.idCliente)
    .then(clientes=> {
      res.send(clientes);
    })
    .catch(err=> {
      res.status(422)
      .send({message:err.message});
    });  
  });
  
  
  app.put('/clientes', [middleware.clienteMobile,middleware.ensureAuthenticated], function (req, res) {
    clientes.modificarCliente(req.body)
    .then(() =>{
      res.sendStatus(200);
    })
    .catch(err=> {
      res.status(422)
      .send({message:err.message});
    });  
  });

  /*RUTAS ADMINISTRADOR*/

  app.get('/admin/clientes',middleware.autenticacionAdmin, function (req, res) {
    clientes.traerTodos()
    .then(clientes=> {
      res.send(JSON.stringify(clientes,null,2));
    })
    .catch(err=> {
      res.status(406)
      .send({message:err.message});
    });  
  });

  app.get('/admin/clientes/estado',middleware.autenticacionAdmin, function (req, res) {
    clientes.buscarPorEstado(req.query.Estado)
    .then(clientes =>{
      res.send(clientes);
    })
    .catch(err=> {
      res.status(406)
      .send({message:err.message});
    });  
  });

  app.get('/admin/clientes/facturas/estado', middleware.autenticacionAdmin,function (req, res) {
    clientes.buscarDeudores()
    .then(clientes =>{
      res.send(clientes);
    })
    .catch(err=> {
      res.status(406)
      .send({message:err.message});
    });  
  });

  app.put('/admin/clientes/idCliente', middleware.autenticacionAdmin, function (req, res) {
    clientes.cambiarEstado(req.body.idClientes, req.body.Saldo,req.body.Estado)
    .then(() =>{
      res.sendStatus(200);
    })
    .catch(err=> {
      res.status(422)
      .send({message:err.message});
    });  
  });

  app.delete('/admin/clientes/idCliente', middleware.autenticacionAdmin, function (req, res) {
    clientes.borrar(req.query.idClientes)
    .then(() =>{
      res.sendStatus(200);
    })
    .catch(err=> {
      res.status(422)
      .send({message:err.message});
    });  
  });

  app.get('/admin/clientes/consulta',middleware.autenticacionAdmin, function (req, res) {
    consulta.buscarClientesConConsulta()
    .then(clientes =>{
      res.send(clientes);
    })
    .catch(err=> {
      res.status(422)
      .send({message:err.message});
    });  
  });


}

