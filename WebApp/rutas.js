var express = require('express');
var router = express.Router();// Paginas relacionadas al loggin

require('./BackEnd/routes/apiProducto.js')(router);

require('./BackEnd/routes/apiCliente.js')(router);
router.use('/clientes',router); //Todo lo que pida /auth que lo resuelva el auth.js

require('./BackEnd/routes/apiVentaLocal.js')(router);

require('./BackEnd/routes/apiCarrito.js')(router);

require('./BackEnd/routes/apiProveedor.js')(router);

require('./BackEnd/routes/apiCompra.js')(router);

require('./BackEnd/routes/apiLogin.js')(router);

require('./BackEnd/routes/apiConsulta.js')(router);

require('./BackEnd/routes/apiEmpleado.js')(router);

require('./BackEnd/routes/apiPagosClientes.js')(router);

require('./BackEnd/routes/apiPagosProveedores.js')(router);

require('./BackEnd/routes/secure.js')(router);

require('./BackEnd/servicios/nodemailer.js');

module.exports = router;