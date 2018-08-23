miapp.controller('controlHome',function($scope,$http,$state,$window,$popupService,$spinnerService,$errorService){

  var traerSubRubro = function() {
    $http.get('http://ferreteriadv.hopto.org/rubros/subRubros')
    .then(subRubros =>{
      $scope.rubros = subRubros.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  var traerOfertas = function() {
    $http.get('http://ferreteriadv.hopto.org/productos/ofertas')
    .then(productosEnOferta=>{
      $scope.productos = productosEnOferta.data;
    })
  };

  $scope.buscarProducto = function(producto) {
    $state.go('productosPorNombre',{obj : producto.Nombre}); 
  }

  $scope.estadoListarSubRubro = function(rubro) {
    $state.go('subRubros',{objRubro : rubro});
  }

  $scope.agregarCarrito = function (index,cantidad) {
    var carrito = {
      idProductos : $scope.productos[index].idProductos,
      Cantidad : cantidad,
      Token : $window.localStorage.getItem('session')
    }

    var mensaje; 
    $spinnerService.mostrar('Agregando...');
    $http.post('http://ferreteriadv.hopto.org/carrito/idProducto',carrito)
    .then(producto =>{
      $spinnerService.esconder();
      mensaje = "Se agrego al Carrito " + producto.data.Cantidad + " " + producto.data.Nombre + "(s)";
      mostrarPopup(mensaje);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
    .finally(()=>{
      $scope.productos[index].cantidad = undefined;
    })
  }    

  var mostrarPopup = function(_mensaje) {
    var titulo = 'Producto agregado';
    var mensaje = _mensaje;
    var botones = [{ 
      text: 'Cerrar',
      type : 'button-balanced'
    }];
    $popupService.alertaAutoClose(titulo,mensaje,botones,$scope);
  }

  traerOfertas();
  traerSubRubro()
  
}); 