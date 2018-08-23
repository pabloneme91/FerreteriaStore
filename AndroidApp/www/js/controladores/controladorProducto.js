miapp.controller('controlProductos',function($rootScope,$scope,$http,$state,$window,$ionicHistory,
    $popupService,$spinnerService,$errorService){

    $scope.rubro = $state.params.obj;
	var offset = 0; //Para saber el ultimo Producto que se trajo.
	var tipoOrden = 2;
    var limite;
	$scope.productos = [];

	var traerProductosPorNombre = function() {
    	var objReq = 
        {
            params : {
                Nombre : $scope.rubro,
            } 
        }
        $spinnerService.cargandoVista();
        $http.get('http://ferreteriadv.hopto.org/productos/nombreExacto',objReq)
        .then(productos =>{
            $spinnerService.esconder();
            $scope.productos = productos.data
        },
        err =>{
        	$errorService.mostrarError(err,$scope);
        })
    }

    var traerProductosPorSubRubro = function(_pagina) {
        var objReq = {
            params : {
                pagina : _pagina || 1,
                idRubro : $scope.rubro.idSubRubro,
                Tipo : tipoOrden
            } 
        }      

        $spinnerService.cargandoVista();
        $http.get('http://ferreteriadv.hopto.org/productos/subRubro',objReq)
        .then(productos =>{
            $spinnerService.esconder();
            limite = productos.data.count;
            angular.forEach(productos.data.rows,function(producto){
                $scope.productos.push(producto);    
            })
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }    

    $scope.buscarProducto = function(producto) {
      $state.go('productosPorNombre',{obj : producto.Nombre}); 
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
        $scope.productos[index].cantidad = undefined;
        mostrarPopup(mensaje);
      },
      err =>{
        $errorService.mostrarError(err,$scope);
      })
      .finally(()=>{
        $scope.productos[index].cantidad = undefined;
      })
    }    

    $scope.ordenar = function(_tipoOrden) {
        offset = 0;
        tipoOrden = _tipoOrden;
        $scope.productos = [];
        $scope.cargarNuevosProductos();
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

    $scope.cargarNuevosProductos = function() {
        offset += 1
        if (!(limite === $scope.productos.length)) {
            traerProductosPorSubRubro(offset);
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }    

    if($state.current.name === 'productosPorNombre') {
        $ionicHistory.backView().stateParams = $rootScope.parametrosProductoPorNombre;
        traerProductosPorNombre();
    }
    else {
        $rootScope.parametrosProductoPorNombre = $state.params;
        $ionicHistory.backView().stateParams = $rootScope.parametrosListaSubRubros; //Soluciona el paso de parametros al regresar al estado anterior
    }


}); 
