    adminMiApp.controller('controlCompra',function($scope,$http,$servicioProductos,$alertService,$errorService){
        
    $scope.lineas = [];
    $scope.total = 0;

    var traerProductos = function() {
        $scope.cargando = true;
        $servicioProductos.traerProductos()
        .then(productos => {
            $scope.cargando = false;
            $scope.productos = productos.data    
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
    };    

    var traerProveerdores = function() {
        $http.get('http://ferreteriadelvalle.hopstop.net/admin/proveedores') 
        .then(proveedores => {
            $scope.proveedores = proveedores.data;
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
    }

    $scope.changeProducto = function() {
        $scope.cantidad = 1;
        $scope.precio = $scope.selectProductos.PrecioCosto * $scope.cantidad;
    };

    $scope.agregarLinea = function() {
        if($scope.cantidad > 0 && $scope.precio > 0) {
            for (index = 0; index < $scope.lineas.length; index++) { //En caso que el producto ya fue agregado a las lineas de venta.  
                if($scope.lineas[index].idProducto === $scope.selectProductos.idProductos) {
                    $scope.lineas[index].Cantidad +=  parseInt($scope.cantidad);
                    $scope.lineas[index].Total +=  $scope.lineas[index].PrecioCosto * $scope.cantidad;
                    $scope.total += $scope.lineas[index].PrecioCosto * $scope.cantidad;
                    $scope.selectProductos.Stock += parseInt($scope.cantidad);
                    limpiarCamposProducto();
                return;
                }
            }

            var linea = {
                idProducto : $scope.selectProductos.idProductos,
                Nombre : $scope.selectProductos.Nombre,
                PrecioCosto : $scope.precio,
                Total : $scope.precio * $scope.cantidad,
                Cantidad : parseInt($scope.cantidad),
                indiceProducto : $scope.productos.indexOf($scope.selectProductos)
            }

            $scope.lineas.push(linea);
            $scope.total += $scope.precio * $scope.cantidad;
            $scope.selectProductos.Stock += parseInt($scope.cantidad);
            $scope.selectProductos.PrecioCosto = $scope.precio
            limpiarCamposProducto();
        }
        else $alertService.showAlert("danger", 'La cantidad y el precio deben ser mayores que cero. ' + 
            'Ademas el precio debe tener a lo sumo dos decimales',3,$scope);
    };

    $scope.borrar = function(lineas, index){
        $scope.total -= $scope.lineas[index].Total;
        $scope.productos[$scope.lineas[index].indiceProducto].Stock -= $scope.lineas[index].Cantidad;
        lineas.splice(index, 1);
    }	

    $scope.registrarCompra = function() {
            var _detalle = [],
            index,
            objReq,
            _compra = {
                idProveedores : $scope.selectProveedores.idProveedores,
            }

            angular.forEach($scope.lineas,(linea,key) =>{
                _detalle[key] = {
                    Cantidad : linea.Cantidad,
                    idProductos : linea.idProducto,
                    PrecioCosto : linea.PrecioCosto
                }
            });

            objReq = {
                detalle : _detalle,
                compra : _compra
            }

            $scope.cargando = true;
            $http.post('http://ferreteriadelvalle.hopstop.net/admin/compras',objReq)
            .then(compraNueva =>{
                $scope.cargando = false;
                $alertService.showAlert("success", 'La compra se registro exitosamente',3,$scope);
                $scope.lineas = [];       
                $scope.total = 0;                     
                limpiarCampos();
            },
            err =>{
                $scope.enviando = false;
                $errorService.mostrarError(err,$scope);
            });
        
    };    

    var limpiarCampos = function () {
        limpiarCamposProducto();
    	$scope.selectProveedores = undefined;
    }

    var limpiarCamposProducto = function () {
        $scope.selectProductos = undefined;
        $scope.cantidad = '';
        $scope.precio = '';
        angular.element('#selectId').focus();
    }

    $scope.actualizarProductos = function() {
        if($scope.lineas.length === 0){
            limpiarCampos();
            traerProductos();
        }
        else
            $alertService.showAlert('danger','No debe haber productos agregados en la tabla '
                + 'para poder actualizar la lista',5,$scope)
    }

	traerProductos();
    traerProveerdores();

});



    
