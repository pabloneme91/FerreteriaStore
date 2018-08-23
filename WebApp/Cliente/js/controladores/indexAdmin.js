var adminMiApp = angular.module('rutasAdminApp', ['ui.router','ui.bootstrap', 'ngCookies','ngFileUpload']);

adminMiApp.run($locale => {
    $locale.NUMBER_FORMATS.GROUP_SEP = '';
});

adminMiApp.config(($stateProvider, $urlRouterProvider) =>{

	$urlRouterProvider.otherwise("/home");
	
	$stateProvider
	.state('altaVenta', {
		url : '/altaVenta',
		templateUrl : 'altaVenta.html',
		controller : 'controlVenta'
	})
	.state('verVentas', {
		url : '/ventas',
		templateUrl : 'verVentas.html',
		controller : 'controlVerVenta'
	})
	.state('ventasPendientes', {
		url : '/ventasPendientes',
		params : {
			codigo : null //Para ver la factura desde el estado venta.
		},
		templateUrl : 'ventasPendientes.html',
		controller : 'controlVentasPendientes',
	})
	.state('altaCliente', {
		url : '/altaCliente',
		templateUrl : 'altaCliente.html',
		controller : 'controlCliente'
	})
	.state('verClientes', {
		url : '/clientes',
		templateUrl : 'verClientes.html',
		controller : 'controlCliente',
	})
	.state('cuentaCliente', {
		url : '/cuentaCliente',
		templateUrl : 'cuentaCliente.html',
		params : {
			cliente : null
		},
		controller : 'controlCuentaCliente'
	})
	.state('verPagosClientes', {
		url : '/pagosClientes',
		templateUrl : 'pagosClientes.html',
		controller : 'controlPagosClientes'
	})
	.state('altaProducto', {
		url : '/altaProducto',
		templateUrl : 'altaProducto.html',
		controller : 'controlProducto'
	})
	.state('verProductos', {
		url : '/productos',
		templateUrl : 'verProductos.html',
		controller : 'controlProducto',
	})
	.state('altaRubro', {
		url : '/altaRubro',
		templateUrl : 'altaRubro.html',
		controller : 'controlRubro'
	})
	.state('verRubros', {
		url : '/rubros',
		templateUrl : 'verRubros.html',
		controller : 'controlRubro'
	})
	.state('altaCompra', {
		url : '/altaCompra',
		templateUrl : 'altaCompra.html',
		controller : 'controlCompra'
	})
	.state('verCompras', {
		url : '/compras',
		templateUrl : 'verCompras.html',
		controller : 'controlVerCompras',
	})
	
	.state('verConsultas', {
		url : '/consultas',
		templateUrl : 'verConsultas.html',
		controller : 'controlConsulta'
	})
	.state('altaEmpleado', {
		url : '/altaEmpleado',
		templateUrl : 'altaEmpleado.html',
		controller : 'controlEmpleado'
	})
	.state('verEmpleados', {
		url : '/empleados',
		templateUrl : 'verEmpleados.html',
		controller : 'controlEmpleado'
	})
	.state('verDatosEmpleado', {
		url : '/usuario',
		templateUrl : 'verDatosEmpleado.html',
		controller : 'controlEmpleado'
	})
	.state('altaProveedor', {
		url : '/altaProveedor',
		templateUrl : 'altaProveedor.html',
		controller : 'controlProveedor'
	})
	.state('verProveedores', {
		url : '/proveedores',
		templateUrl : 'verProveedores.html',
		controller : 'controlProveedor',
	})
	.state('cuentaProveedor', {
		url : '/cuentaProveedor',
		templateUrl : 'cuentaProveedor.html',
		controller : 'controlCuentaProveedor',
		params : {
			proveedor : null
		},
	})
	.state('verPagosProveedores', {
		url : '/pagosProveedores',
		templateUrl : 'pagosProveedores.html',
		controller : 'controlPagosProveedores'
	})
	.state('home', {
		url : '/home',
		templateUrl : 'adminHome.html',
	})
		

	
});


/*Filtro para Columna Total. Coincidecia con la primera parte de la String*/

adminMiApp.filter('filtroTotal',function(){
  return function (transacciones, inputFiltro) {
    if(!(inputFiltro === undefined || transacciones === undefined)) {
    	var filtrados = [];
  		angular.forEach(transacciones,transaccion =>{
		    if (inputFiltro === String(transaccion.Total)) {
		    	filtrados.push(transaccion);
		    }
      	})
    return filtrados    
    }
    else return transacciones
  };
})

/*Filtro para Columna Total. Coincidecia con la primera parte de la String*/		
