adminMiApp.controller('controlVentasPendientes',function($rootScope,$scope,$state,$http,$window,$modalService,$alertService,$errorService){

  $scope.vista = $state.current.name;

  $scope.changeCliente = function() {
      $scope.facturas = [];
      traerFacturasPendientes();
    }

  $scope.btnTraerFacturaPendientePorId = function(idCarrito) {
    $scope.facturas = []; //Inicializo el array de facturas de la tabla para poder usar la propiedad .length en traerFacturas();
    $scope.limite = 0
    $scope.selectClientes = undefined;
    traerFacturaPendientePorId(idCarrito); 
  }

  var traerFacturaPendientePorId = function(_idCarrito) {
    var objReq = {
      params : {
        idCarrito : _idCarrito
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/carrito/idCarrito',objReq)
    .then(factura =>{
      $scope.cargando = false;
      if(factura.data)
        $scope.facturas.push(factura.data);
      else
        $alertService.showAlert("danger","No existen facturas con ese N° de codigo",3,$scope)
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }    

  var traerFacturasPendientes = function() {
    var objReq = {
      params : {
        idClientes : $scope.selectClientes.cliente.idClientes,
        offset : $scope.facturas.length
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/carrito/idCliente',objReq)
    .then(facturas =>{
      $scope.cargando = false;
      $scope.limite = facturas.data.count.length;
      $scope.facturas = $scope.facturas.concat(facturas.data.rows);
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }

  $scope.ver = function(_idCarrito,index) {
    objReq = {
      params: {
        idCarrito : _idCarrito,
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/carrito/idLineaCarrito',objReq)
    .then(detalleCarrito =>{
      $scope.cargando = false;
      $scope.detalleCarrito = detalleCarrito.data
      $scope.indexFactura = index;
      mostrarModalVentaPendiente();
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }

  $scope.borrarCarrito = function(_idCarrito) {
    var objReq = {
      params : {
        idCarrito : _idCarrito
      }
    }

    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/carrito/idCarrito',objReq)
    .then(() =>{
      $scope.cargando = false;
      $scope.facturas.splice($scope.indexFactura,1);
      $scope.limite -= 1;
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }    

  
  var actualizarVista = function(indexDetalle) {
    $scope.facturas[$scope.indexFactura].Total -= ($scope.detalleCarrito[indexDetalle].PrecioProducto * $scope.detalleCarrito[indexDetalle].Cantidad);
    $scope.facturas[$scope.indexFactura].Total = ($scope.facturas[$scope.indexFactura].Total).toFixed(2); //Redondea para evitar errores al calcular el Total
    $scope.detalleCarrito.splice(indexDetalle, 1); //Indice del detalle borrado para evitar traer desde el servidor  
    if($scope.detalleCarrito.length === 0) {
      $scope.facturas.splice($scope.indexFactura,1);
      $scope.limite -= 1;
      $rootScope.cerrarModal();
    }
  }

  //FUNCIONES DEL TEMPLATE//

  $scope.borrarProducto = function(_idLineaCarrito,_idCarrito,indexDetalle) {
    var objReq = {
      params : {
        idCarrito : _idCarrito,
        idLineaCarrito : _idLineaCarrito
      } 
    }
    
    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/carrito/idLineaCarrito',objReq)
    .then(()=>{
      $scope.cargando = false;
      actualizarVista(indexDetalle);
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }  


  $scope.entregarProducto = function(_estado,_idCarrito) {
    objReq = {
      idCarrito : _idCarrito,
      factura: {
        idCliente : $scope.selectClientes.cliente.idClientes,
        Estado : _estado,
        Total : $scope.facturas[$scope.indexFactura].Total,
        Tipo : 'O'
      }  
    }

    $scope.cargando = 'Cargando';
    $http.post('http://ferreteriadelvalle.hopstop.net/admin/facturas/idCarrito',objReq)
    .then(()=>{
      $scope.cargando = false
      $scope.facturas.splice($scope.indexFactura,1);
      $scope.limite -= 1;
      $rootScope.cerrarModal();
      $alertService.showAlert("success","La venta fue registrada correctamente",3,$scope)
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  //FUNCIONES DEL TEMPLATE//
  
  var mostrarModalVentaPendiente = function() {
    var template = 'templateVentaPendiente.html';
    $modalService.mostrar(template,$scope);
  }

  var traerClientes = function() {
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes/carrito/estado')
    .then(clientes => {
      $scope.cargando = false;
      $scope.clientes = clientes.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.cargarMas = function() {
    if(!($scope.facturas === undefined)) {
      limpiarFiltros();
      traerFacturasPendientes();
    }
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
  }


  //FUNCIONES AL INICIAR EL ESTADO

  traerClientes(); 

  if($state.params.codigo) {
    $scope.btnTraerFacturaPendientePorId($state.params.codigo)
  }

  //FUNCIONES AL INICIAR EL ESTADO

});



    
