miapp.controller('controlVerDatosCliente',function($scope,$http,$state,$window,$modalService,$errorService,$alertService){
  
  var traerCliente = function() {
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/clientes/idClientes')
    .then(cliente => {
      $scope.cargando = false;
      $scope.cliente = cliente.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope)      

    })
  }

  $scope.guardar = function() {
    $alertService.cerrarAlert($scope);
    var objReq = {
      Telefono : $scope.cliente.Telefono,
      Mail : $scope.cliente.Mail,
      Contrasenia : $scope.contrasenia
    }

    $scope.cargando = 'Enviando';
    $http.put('http://ferreteriadelvalle.hopstop.net/clientes',objReq)
    .then(cliente => {
      $scope.cargando = false;
      $alertService.showAlert('success','Se modificaron correctamente los datos',4,$scope)
      traerCliente();
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
      
    })
  }

  $scope.verDeuda = function() {
    var objReq = {
      params : {
        Estado : 'CC',
        offset : 0,
        limite : null, 
      }
    }

    $scope.cargando = 'Cargando';
    return $http.get('http://ferreteriadelvalle.hopstop.net/facturas/cliente',objReq)
    .then(facturas =>{
      $scope.cargando = false;
      $scope.facturas = facturas.data.rows;
      sumarDeudaFacturas();
      var template = 'templateDeuda.html';
      mostrarModal(template);
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
      
    })
  }


  /*Funciones del Template Deuda*/
  $scope.verDetalle = function(_idFactura,index) {
    objReq = {
      params :{
        idFactura : _idFactura  
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/detalle/idFactura',objReq)
    .then(detalles =>{
      $scope.cargando = false;
      $scope.indexFactura = index;
      $scope.auxDetalles = detalles.data;
      var template = 'templateVerVenta.html';
      mostrarModal(template);
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
      
    })
  }

  var sumarDeudaFacturas = function(){
    $scope.totalFacturas = 0;
    angular.forEach($scope.facturas,factura =>{
      $scope.totalFacturas += factura.Total;
    });
  }
  /*Funciones del Template Deuda*/

  var mostrarModal = function(template) {
    $modalService.mostrar(template,$scope);
  }

  traerCliente();

});



    
