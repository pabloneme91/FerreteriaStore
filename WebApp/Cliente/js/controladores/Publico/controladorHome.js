miapp.controller('controlHome', function($rootScope,$scope,$http,$window,$state,$alertService,$errorService){


    //BUSCAR OFERTAS Y DESTACADOS

    var traerOfertas = function() {
      $http.get('http://ferreteriadelvalle.hopstop.net/productos/ofertas')
      .then(ofertas=>{
        $scope.ofertas = ofertas.data;
      },
      err =>{
        $scope.cargando = false;
      })
    };

    var traerDestacados = function() {
      $http.get('http://ferreteriadelvalle.hopstop.net/productos/destacados')
      .then(destacados=>{
        $scope.destacados = destacados.data;
      },
      err =>{
        $scope.cargando = false;
      })
    };    

    $scope.agregarCarrito = function (index,cantidad) {
      var carrito = {
        idProductos : $scope.destacados[index].idProductos,
        Cantidad : cantidad,
      }

      var mensaje = "Se agrego al Carrito " + cantidad + " " + JSON.stringify($scope.destacados[index].Nombre) + "(s)";
      $scope.cargando = 'Agregando';
      $http.post('http://ferreteriadelvalle.hopstop.net/carrito/idProducto',carrito)
      .then(producto =>{
        $scope.cargando = false;
        $alertService.showAlert("success",mensaje,5,$scope)
      },
      err =>{
        $errorService.mostrarError(err,$scope)
      })
      .finally(() =>{
        $scope.destacados[index].cantidad = undefined;
      })
    }

    traerDestacados();
    traerOfertas()

});



