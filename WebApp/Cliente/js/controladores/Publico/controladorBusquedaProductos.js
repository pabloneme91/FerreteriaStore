miapp.controller('controlBusquedaProductos', function($scope,$http,$alertService,$state,$errorService,$scrollService){
    
    $scope.busqueda = $state.params.obj;
    var tipoOrden = 2;

    /*VER ERROR EN $scope.pageChangedProductos */

    $scope.pageChangedProductos = function(_pagina) {
        if(!($state.params.obj === null)) {
            $scope.busqueda = $state.params.obj.nombre;

            var objReq = 
            {
                params : {
                    pagina : _pagina || 1,
                    Nombre : $state.params.obj.nombre,
                    Tipo : tipoOrden
                } 
            }
            $scope.cargando = 'Cargando';
            $http.get('http://ferreteriadelvalle.hopstop.net/productos/nombre/pagina',objReq)
            .then(productos =>{
                $scope.cargando = false;
                $scope.total = productos.data.count;
                $scope.productos = productos.data.rows;
            },
            err =>{
                $errorService.mostrarError(err,$scope)      
            })
        }
    }

    $scope.pageChangedSubRubro = function(_pagina) {
        if(!($state.params.obj === null)) {
            $scope.busqueda = $state.params.obj.nombre;

            var objReq = {
                params : {
                    pagina : _pagina || 1,
                    idRubro : $state.params.obj.idSubRubro,
                    Tipo : tipoOrden
                } 
            }           
            $scope.cargando = 'Cargando';
            $http.get('http://ferreteriadelvalle.hopstop.net/productos/subRubro',objReq)
            .then(productos =>{
                $scope.cargando = false;
                $scope.total = productos.data.count;
                $scope.productos = productos.data.rows;
            },
            err =>{
                $errorService.mostrarError(err,$scope)      
            })
        }
    }
 
    $scope.ordenar = function(tipo,pagina) {
        tipoOrden = tipo; 
        if($state.current.name === 'miapp.productosPorNombre')
            $scope.pageChangedProductos(pagina);
        else $scope.pageChangedSubRubro(pagina);
    }

    $scope.agregarCarrito = function (index,cantidad) {
        var carrito = {
            idProductos : $scope.productos[index].idProductos,
            Cantidad : cantidad,
        }

        var mensaje = "Se agrego al Carrito " + cantidad + " " + JSON.stringify($scope.productos[index].Nombre) + "(s)";
        $scope.cargando = 'Agregando';
        $http.post('http://ferreteriadelvalle.hopstop.net/carrito/idProducto',carrito)
        .then((a) =>{
            $scope.cargando = false;
            $alertService.showAlert("success",mensaje,5,$scope)
        },
        err =>{
            $errorService.mostrarError(err,$scope)
        })
        .finally(() =>{
            $scope.productos[index].cantidad = undefined;
        })
    }

    if($state.current.name === 'miapp.productosPorNombre') 
        $scope.pageChangedProductos();
    else if($state.current.name === 'miapp.productosPorSubRubro')
        $scope.pageChangedSubRubro();
    else {
        $scope.productos = []
        $scope.productos.push($state.params.obj);
    }
});

