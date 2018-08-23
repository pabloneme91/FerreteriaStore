miapp.controller('controlCarrito', function($scope,$http,$window,$modalService,$cookies,$state,$rootScope,$logService,$errorService){

    var traerCarrito = function() {  
        $scope.sesion = $cookies.get('session');
        if(!($scope.sesion === null)) {
            $scope.cargando = 'Cargando';
            $http.get('http://ferreteriadelvalle.hopstop.net/carrito/idCliente') 
            .then(carrito =>{
                $scope.cargando = false;
                $scope.datosCarrito = carrito.data.datosCarrito;
                $scope.lineas = carrito.data.lineasCarrito;
            },
            err =>{
                $errorService.mostrarError(err,$scope)
            })
        }
        else $scope.error = "Debe loggearse para ver su carrito";
    }

    $scope.borrar = function(index) {
        $scope.cargando = 'Borrando';
        objReq = {
            params : {
                idLineaCarrito : $scope.lineas[index].idLineaCarrito,
                idCarrito : $scope.lineas[index].idCarrito,    
            }
        }

        $http.delete('http://ferreteriadelvalle.hopstop.net/carrito/idLineaCarrito',objReq)
        .then(()=>{
            $scope.cargando = false;
            traerCarrito();
        },
        function(err){
            $errorService.mostrarError(err,$scope)
        })
    }
    
     $scope.comprar = function() {
        $scope.cargando = 'Enviando';
        $http.post('http://ferreteriadelvalle.hopstop.net/carrito/idCliente')
        .then(carritoComprado =>{
            $scope.cargando = false;
            $rootScope.cerrarModal();
            $scope.datosCarrito = carritoComprado.data.datosCarrito;
            $scope.lineas = carritoComprado.data.lineasCarrito;
            mostrarModalCompraRealizada();
        },
        err =>{
            $errorService.mostrarError(err,$scope)
        })
    }

    $scope.descargarPDF = function() {
        $scope.cargando = 'Descargando';
        $http.get('http://ferreteriadelvalle.hopstop.net/carrito/download',{responseType:'blob'})
        .then(response =>{
            var file = new Blob([(response.data)], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);
            saveAs(file,'Comprobante-Compra.pdf')
            $scope.cargando = false;
            $rootScope.cerrarModal();
            $state.go('miapp.home');
       },
        err =>{
            $errorService.mostrarError(err,$scope)
        })
    }

    var mostrarModalCompraRealizada = function() {
        var template = 'templateProductosComprados.html';
        var modal = $modalService.mostrar(template,$scope);
        modal.result.then(() =>{
            $window.scrollTo(0, 0);
            $state.go('miapp.home');
        })
    }

    $scope.mostrarModalCompra = function(_compraRealizada) {
        $scope.compraRealizada = _compraRealizada;
        var template = 'templateFacturaCarrito.html';
        $modalService.mostrar(template,$scope);
    }
    
    var tratarError = function(err) {
        $scope.error = err.data.message;
        mostrarModalError();
        if(err.status === 401) {
            $logService.logOut();
            $state.go('miapp.login')
        }
    }

    var mostrarModalError = function() {
        var template = 'templateError.html';
        var modal = $modalService.mostrar(template,$scope);
    }

    $scope.login = function() {
        $state.go('miapp.login')
    }

    traerCarrito();

});

