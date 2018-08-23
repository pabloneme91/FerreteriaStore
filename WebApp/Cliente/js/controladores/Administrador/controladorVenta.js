adminMiApp.controller('controlVenta',function($rootScope,$scope,$state,$http,$servicioProductos,$modalService,$alertService,$errorService){

    $scope.lineas = [];
    $scope.total = 0;
    $scope.estilo = "#dddddd";
    $scope.btnDeshabilitado = true;
    $scope.vista = $state.current.name;

	var traerProductos = function() {
        $scope.cargando = 'Cargando';
        $servicioProductos.traerProductosConVentas()
        .then(productos => {
            $scope.cargando = false;
            $scope.productos = productos.data    
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
    };    

    var traerClientes = function() {
        $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes') 
        .then(clientes => {
            $scope.clientes = clientes.data
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
    }; 

	$scope.changeCantidad = function() {
        if($scope.selectProductos)
        $scope.precio = parseFloat(($scope.selectProductos.Precio * $scope.cantidad).toFixed(2));
    };
    
    $scope.changeProducto = function() {
        if($scope.selectProductos.Stock != undefined) {
            $scope.cantidad = 1;
            $scope.precio = $scope.selectProductos.Precio * $scope.cantidad;
            verificarEstilo();
        }
        else{
            $scope.estilo = "#dddddd";
            $scope.precio = 0;
            $scope.cantidad = 0;
        }
    };

    $scope.agregarLinea = function() {
        if($scope.cantidad > 0 && $scope.precio > 0) {
            if($scope.cantidad <= $scope.selectProductos.Stock) {
                for (index = 0; index < $scope.lineas.length; index++) {
                    if($scope.lineas[index].idProducto === $scope.selectProductos.idProductos) {
                        $scope.lineas[index].Cantidad +=  parseInt($scope.cantidad);
                        $scope.lineas[index].Total +=  $scope.precio;
                        $scope.total += $scope.precio;
                        $scope.selectProductos.Stock -= $scope.cantidad;
                        limpiarCampos();
                        return;
                    }
                }

                var linea = {
                    idProducto : $scope.selectProductos.idProductos,
                    Nombre : $scope.selectProductos.Nombre,
                    PrecioProducto : $scope.selectProductos.Precio,
                    Total : $scope.precio,
                    Cantidad : parseInt($scope.cantidad),
                    indiceProducto : $scope.productos.indexOf($scope.selectProductos)
                }

                $scope.lineas.push(linea);
                $scope.selectProductos.Stock -= $scope.cantidad;
                $scope.total = $scope.total +  $scope.precio;
                limpiarCampos();
            }
            else $alertService.showAlert('danger','La cantidad ingresada no puede ser mayor al stock',5,$scope)
        }
        else $alertService.showAlert("danger", 'La cantidad debe ser mayor que cero',3,$scope);    
    };

    $scope.borrar = function(lineas, index){
        $scope.total -= $scope.lineas[index].Total;
        $scope.productos[$scope.lineas[index].indiceProducto].Stock += $scope.lineas[index].Cantidad;
        lineas.splice(index, 1);
        verificarEstilo();
    }	

    $scope.realizarVenta = function() {
        var _detalle = [],
            index,
            _factura = {
                idCliente : null
            }
        
        for (index = 0; index < $scope.lineas.length; index++) {
            _detalle[index] = {
                Cantidad : $scope.lineas[index].Cantidad,
                producto : {
                    idProductos : $scope.lineas[index].idProducto,
                }
            }
        }

        var objeto = {
            factura : _factura,
            detalle : _detalle
        }

        if(!($scope.selectClientes === undefined || $scope.selectClientes === null)){
            _factura.idCliente = $scope.selectClientes.idClientes;
            _factura.Estado = 'CC';
        }

        $scope.cargando = 'Enviando';
        $http.post('http://ferreteriadelvalle.hopstop.net/admin/facturas',objeto)
        .then(facturaNueva => {
            $scope.cargando = false;
            $alertService.showAlert("success", 'La Venta se registro exitosamente',3,$scope);
            $scope.lineas = [];       
            $scope.total = 0;                     
            limpiarCampos();
        },
        err =>{
            $errorService.mostrarError(err,$scope);
        })
    };    

    $scope.verVentasAsociadas = function(estilo) {
        if(estilo === 'yellow') {
            var objReq = {
                params : {
                    idProducto : $scope.selectProductos.idProductos    
                }
            }
            $http.get('http://ferreteriadelvalle.hopstop.net/admin/carrito/idProducto',objReq) 
            .then(facturas => {
                facturas.data.ProductoPendiente = $scope.selectProductos.Nombre;    
                $scope.facturas = facturas.data
                mostrarModalCarritosEnProceso();
            },
            err =>{
                $errorService.mostrarError(err,$scope);
            })
        }
    }


    var mostrarModalCarritosEnProceso = function() {
        var template = 'templateCarritosEnProceso.html';
        $modalService.mostrar(template,$scope)
    }

    
    /*FUNCIONES templateCarritosEnProceso*/

    $scope.verDetalle = function(_idCarrito,index) {
        objReq = {
          params: {
            idCarrito : _idCarrito,
          }
        }

        $scope.cargando = 'Cargando'
        $http.get('http://ferreteriadelvalle.hopstop.net/admin/carrito/idLineaCarrito',objReq)
        .then(detalleCarrito =>{
          $scope.cargando = false
          $scope.detalleCarrito = detalleCarrito.data
          $scope.indexFactura = index;
          mostrarModalVentaPendiente();
        },
        err =>{
          $errorService.mostrarError(err,$scope);
        })
    }

    $scope.irAVenta = function(_idCarrito) {
        $state.go('ventasPendientes',{codigo : _idCarrito})
    } 

    var mostrarModalVentaPendiente = function() {
        var template = 'templateVentaPendiente.html';
        $modalService.mostrar(template,$scope);
    }

    /*FUNCIONES templateCarritosEnProceso*/


    /*FUNCIONES templateVentaPendiente*/

    $scope.borrarProducto = function(_idLineaCarrito,_idCarrito,cantidad) {
        var objReq = {
          params : {
            idCarrito : _idCarrito,
            idLineaCarrito : _idLineaCarrito
          } 
        }
        
        $scope.cargando = 'Borrando'
        $http.delete('http://ferreteriadelvalle.hopstop.net/admin/carrito/idLineaCarrito',objReq)
        .then(()=>{
          $scope.cargando = false
          actualizarVista(cantidad);
        },
        err =>{
          $errorService.mostrarError(err,$scope)      
        })
      }  

      var actualizarVista = function(cantidad) {
        $scope.selectProductos.Stock += cantidad;
        $scope.facturas.splice($scope.indexFactura,1);
        $scope.cantidad = 1;
        $scope.btnDeshabilitado = false;
        $rootScope.cerrarModal();
        if($scope.facturas.length === 0){
            $scope.selectProductos.VentaAsociada = null;
            $scope.estilo = "#dddddd";
            $rootScope.cerrarModal();
        }
      }


    /*FUNCIONES templateVentaPendiente*/

    /*FUNCIONES AUXILIARES*/

    var limpiarCampos = function () {
        $scope.btnDeshabilitado = true;
    	$scope.selectProductos = undefined;
        $scope.cantidad = '';
        $scope.precio = 0;
        $scope.selectClientes = $scope.opcion;
        $scope.estilo = '#dddddd';
        angular.element('#selectId').focus();
    }

    var verificarEstilo = function() {
        if($scope.selectProductos) {
            ventaAsociada = $scope.selectProductos.VentaAsociada
            if(ventaAsociada) {
                $scope.estilo = "yellow"
                if($scope.selectProductos.Stock <= 0) 
                    $scope.btnDeshabilitado = true;
                else
                    $scope.btnDeshabilitado = false;
            }
            else {
                if($scope.selectProductos.Stock <= 0){
                    $scope.estilo = "red";
                    $scope.btnDeshabilitado = true;
                }
                else {
                    $scope.estilo = "#dddddd";
                    $scope.btnDeshabilitado = false;
                }
            }
        }
    }
    
    /*FUNCIONES AUXILIARES*/

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
    traerClientes();

});