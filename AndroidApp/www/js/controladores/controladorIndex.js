miapp.controller('controlIndex',function($rootScope,$scope,$http,$state,$window,$ionicHistory,$productService, $ionicTabsDelegate,$timeout){

  $scope.sesion = $window.localStorage.getItem('session');

  $scope.traerProductos = function (query, isInitializing) {
    return $productService.traerProductos(query,$scope);
  } 

  $scope.buscarProductosPorNombre = function(callback) {
    $state.go('productosPorNombre',{obj : callback.item.Nombre}); 
  }

  $scope.volver = function() {
    $ionicHistory.goBack();
  };

  $scope.clickPestania = function(estado,index) {
    cambiarEstado(estado,index);
  }

  var cambiarEstado = function(estado,index) {
    $ionicTabsDelegate.$getByHandle('pestanias').select(index);
    $state.go(estado)
  }
  
  $scope.$on('cambiarEstado', function (event, data) {
    cambiarEstado(data.estado,data.index);
  });

  $scope.$on('user.login', function (event, data) {
    $scope.sesion = data.token;
  });

  var renovarToken = function() {
    var objReq = {
      Token : $window.localStorage.getItem('session')
    }
    $http.post('http://ferreteriadv.hopto.org/login/renovarToken',objReq)
    .then(datos =>{
      datos.data.token = 'session=' + datos.data.token;
      $window.localStorage.setItem('session',datos.data.token)
    })
  }

  if($scope.sesion)
    renovarToken()
}); 