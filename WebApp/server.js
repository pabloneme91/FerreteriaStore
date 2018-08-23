var express = require ('express');
var app = express();
var port = process.env.PORT || 80;

var bodyParser = require('body-parser');

var rutas = require('./rutas');

//middleware : puente entre cliete y servidor. Cualquier transaccion pasa por aca primero

//app.use(morgan('dev')); // Morgan es el middleware en este caso, en ambiente desarrollo. app.use son para usar los distinton middlewares
//app.use(cookieParser());

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(bodyParser.json());

app.use(express.static('Cliente'));
app.use(express.static('Cliente/vistas/Publico'));
app.use(express.static('Cliente/vistas'));
app.use(express.static('Cliente/vistas/imagenes'));
app.use(express.static('Cliente/vistas/imagenes/consulta'));
app.use('/admin',express.static('Cliente/vistas/Administrador'));
app.use('/admin',express.static('Cliente'));


app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        
  next();
 });

app.use(rutas);





app.listen(port);
console.log('server runnin o ' + port); 