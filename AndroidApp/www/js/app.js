var miapp = angular.module('starter', ['ionic','ion-autocomplete','ngCordova']);

miapp.run(function ($rootScope,$state) {
  $rootScope.$on('$stateChangeSuccess', function() {
    if($state.current.name === 'productosPorSubRubro' || $state.current.name === 'productosPorNombre')
      $rootScope.botonVolver = true;
    else 
      $rootScope.botonVolver = false;
  });
});  


miapp.run(function ($cordovaNetwork, $rootScope,$ionicPlatform,$state,$changeStateService) {
  $rootScope.network = 'wifi';
  $ionicPlatform.ready(() => {

    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      $rootScope.network = $cordovaNetwork.getNetwork();
        $changeStateService.cambiarVista('home',0)
    })

    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      $rootScope.network = $cordovaNetwork.getNetwork();
    })
  });
}) 

miapp.config(function ($httpProvider) {
  $httpProvider.interceptors.push('httpInterceptor');
});

miapp.config(function($stateProvider, $urlRouterProvider,$ionicConfigProvider) {

  $ionicConfigProvider.views.maxCache(0);

  $urlRouterProvider.otherwise("/home");
  $ionicConfigProvider.tabs.position('bottom');

  $stateProvider.state('home', {
    url : '/home',
    templateUrl : 'vistas/home.html',
    controller : 'controlHome'
  });   
  $stateProvider.state('consulta', {
    url : '/consulta',
    templateUrl : 'vistas/consultas.html',
  });
  $stateProvider.state('productosPorNombre', {
    url : '/productosPorNombre',
    templateUrl : 'vistas/productosPorNombre.html',
    params : {
      obj : null
    },
    controller : 'controlProductos'
  });
  $stateProvider.state('usuario', {
    url : '/usuario',
    templateUrl : 'vistas/usuario.html',
  });   
  $stateProvider.state('subRubros', {
    url : '/listaSubRubros',
    params : {
      objRubro : null
    },
    templateUrl : 'vistas/listaSubRubros.html',
    controller : 'controlSubRubro'
  });
  $stateProvider.state('productosPorSubRubro', {
    url : '/productosPorSubRubro',
    params : {
      obj : null
    },
    templateUrl : 'vistas/productosPorSubRubro.html',
    controller : 'controlProductos'
  });
  $stateProvider.state('carrito', {
    url : '/carrito',
    templateUrl : 'vistas/carrito.html',
    controller : 'controlCarrito'
  });    
  
});

miapp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})



