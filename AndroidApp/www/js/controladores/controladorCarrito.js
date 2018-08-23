miapp.controller('controlCarrito',function($rootScope,$scope,$http,$state,$window,$popupService,$spinnerService,$errorService,$changeStateService,
  $modalService,$q){

  $scope.sesion = $window.localStorage.getItem('session');
  $scope.productos = [];

  var traerCarrito = function() {  
    var objReq = {
      params : {
        Token : $window.localStorage.getItem('session')
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadv.hopto.org/carrito/idCliente',objReq) 
    .then(carrito =>{
        $scope.cargando = false;
        $scope.datosCarrito = carrito.data.datosCarrito;
        $scope.lineas = carrito.data.lineasCarrito;
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }
    

  $scope.borrar = function(index) {
    $scope.cargando = 'Borrando';
    objReq = {
        params : {
          idLineaCarrito : $scope.lineas[index].idLineaCarrito,
          idCarrito : $scope.lineas[index].idCarrito,    
          Token : $window.localStorage.getItem('session')
        }
    }
    $spinnerService.mostrar('Borrando...')
    $http.delete('http://ferreteriadv.hopto.org/carrito/idLineaCarrito',objReq)
    .then(()=>{
      $spinnerService.esconder();
      traerCarrito();
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }
  
  var comprar = function() {
    var objReq = {
        Token : $window.localStorage.getItem('session')
    }

    $spinnerService.mostrar('Enviando...')
    $http.post('http://ferreteriadv.hopto.org/carrito/idCliente',objReq)
    .then(carritoComprado =>{
      $spinnerService.esconder();
      $scope.datosCarrito = carritoComprado.data.datosCarrito;
      $scope.lineas = carritoComprado.data.lineasCarrito;
      mostrarModalCompraRealizada();
    },
    err =>{
        $errorService.mostrarError(err,$scope)
    })
  }

  $scope.mostrarModalConfirmacion = function() {
    $popupService.confirmacion('Desea confirmar su compra?')
    .then(res =>{
      if(res)
        comprar();
    })
  }

  var mostrarModalCompraRealizada = function() {
    var botones = [
      { 
        text: 'Cerrar',
        type : 'button-balanced',
      },
      { 
        text: 'Ver Compra',
        type : 'button-positive',
        onTap: function(e) {
          return true;
        }
      },
    ]
    var templateUrl = 'vistas/modalCompraRealizada.html';
    var template = null
    var titulo = 'Compra Realizada'
    $popupService.alerta(titulo,template,templateUrl,botones,$scope)
    .then(res =>{
      if(res){
        mostrarModalDetalleCompra();
      }
      else
        $changeStateService.cambiarVista('home',0);
    });
  }    

  var mostrarModalDetalleCompra = function() {
    template = 'vistas/templateDetalleCompra.html';
    $modalService.mostrar(template,$scope)
  } 
  
  $scope.cambiarEstado = function() {
    $changeStateService.cambiarVista('usuario',3);
  }

  $scope.buscarProducto = function(linea) {
    $state.go('productosPorNombre',{obj : linea.producto.Nombre}); 
  }

  var promesa = $q.resolve();
  $scope.cerrarModal = function() {
    promesa = $modalService.cerrarModal();
    promesa
    .then(()=>{
      mostrarModalCompraRealizada();
    })
  };

  if($scope.sesion)
    traerCarrito();   
  
}); 