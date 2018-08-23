    var miapp = angular.module('rutasApp', ['ui.router','ui.bootstrap', 'ngCookies','ngFileUpload']);

    miapp.run(function ($rootScope,$state,$location,$anchorScroll) {
    	$rootScope.$on('$stateChangeSuccess', function() {
    		if(!($state.current.name === 'miapp.home')){
	    		$location.hash('scrollM');
	    		$anchorScroll();

	    		$location.hash('scrollD'); 
	    		$anchorScroll();
    		}
		});
    });

    miapp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/home");

	$stateProvider

		.state('miapp', {
        	views: {
          		'header': {
	            	templateUrl:'header.html',
	            	controller:'controlHeader'
          		},
          		'content': {
            		template:'<div ui-view autoscroll = "false"></div>'
          		},
          		'footer': {
            		templateUrl:'footer.html'
          		}
       		}
   		})		
		.state('miapp.como-comprar', {
			url : '/como-comprar',
			templateUrl : 'como-comprar.html'
		})
		.state('miapp.login', {
			url : '/login',
			templateUrl : 'login.html',
			controller : 'controlLogin'
		})
		.state('miapp.contacto', {
			url : '/contacto',
			templateUrl : 'contacto.html'
		})
		.state('miapp.registro', {
			url : '/registro',
			templateUrl : 'registro.html',
			controller : 'controlCliente'
		})
		.state('miapp.verDatosCliente', {
			url : '/usuario',
			templateUrl : 'verDatosCliente.html',
			controller : 'controlVerDatosCliente'
		})
		.state('miapp.consultas', {
			url : '/consulta',
			templateUrl : 'consultas.html',
			controller : 'controlConsulta'
		})
		.state('miapp.carrito', {
			url : '/carrito',
			templateUrl : 'carrito.html',
			controller : 'controlCarrito'
		})
		.state('miapp.subRubros', {
			url : '/listaSubRubro',
			params : {
				objRubro : null
			},
			templateUrl : 'listaSubRubros.html',
			controller : 'controlSubRubro'
		})
		.state('miapp.productosPorSubRubro', {
			url : '/subRubro',
			params : {
				obj : null
			},
			templateUrl : 'productosPorSubRubro.html',
			controller : 'controlBusquedaProductos'
		})
		.state('miapp.productosPorNombre', {
			url : '/productos',
			params : {
				obj : null
			},
			templateUrl : 'productosPorNombre.html',
			controller : 'controlBusquedaProductos'
		})
		.state('miapp.productoUnico', {
			url : '/producto/id',
			params : {
				obj : null
			},
			templateUrl : 'productoUnico.html',
			controller : 'controlBusquedaProductos'
		})		
		.state('miapp.home', {
			url : '/home',
			templateUrl : 'home.html',
			controller : 'controlHome'
		})

    });

miapp.directive('fileModel', ['$parse', function ($parse) {
return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
    }
};
}]);