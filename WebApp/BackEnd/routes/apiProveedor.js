var proveedor = require('../Modelos/proveedores');
var bodyParser = require('body-parser');
var middleware = require('../servicios/middleware');
//var app = express();

module.exports = function(app) {

app.use(bodyParser.json());

app.get('/admin/proveedores',middleware.autenticacionAdmin, function (req, res) {
  proveedor.traerTodos()
  .then(proveedores =>{
    res.send(proveedores);
  })
  .catch(err =>{ 
    res
    .status(406)
    .send({message: err.message});
  });  
});

app.post('/admin/proveedores',middleware.autenticacionAdmin, function (req, res) {
  proveedor.crear(req.body.Proveedor)
  .then(proveedores =>{
    res.send(proveedores);
  })
  .catch(err =>{ 
    res
    .status(406)
    .send({message: err.message});
  });  
});

app.put('/admin/proveedores',middleware.autenticacionAdmin, function (req, res) {
  proveedor.modificar(req.body)
  .then((prov) =>{
    res.sendStatus(200);
  })
  .catch(err =>{ 
  	res
    .status(406)
    .send({message: err.message});
  })
});

app.delete('/admin/proveedores', middleware.autenticacionAdmin,function (req, res) {
  proveedor.borrar(req.query)
  .then(() =>{
	res.sendStatus(200);
  })
  .catch(err =>{
    res
    .status(406)
    .send({message: err.message});
  })
});

app.get('/admin/proveedores/deuda',middleware.autenticacionAdmin, function (req, res) {
  proveedor.traerConDeuda()
  .then(proveedores =>{
    res.send(JSON.stringify(proveedores,null,2));
  })
  .catch(err =>{ 
    res.status(406)
    .send({message:err.message});
  });  
});

}

