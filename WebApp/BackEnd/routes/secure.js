var middleware = require('../servicios/middleware');

module.exports = function(router) {

router.get('/admin/*',middleware.ensureAdminLogin,function(req,res){
	res.sendFile('../../Cliente/vistas/Administrador/admin.html');
});

router.get('/', function(req, res) {
	res.sendFile('../../Cliente/vistas/Publico/main.html');
});



}