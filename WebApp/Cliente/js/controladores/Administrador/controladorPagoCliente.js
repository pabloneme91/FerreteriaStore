adminMiApp.controller('controlPagosClientes',function($rootScope,$scope,$state,$http,$modalService,$servicioClientes,
  $errorService,$alertService,$scrollService,$infoModalService){

  $scope.vista = $state.current.name; 

  $scope.changeCliente = function() {
    $scope.pagos = [];
    traerPagoCliente()
  }

  $scope.btnTraerPagoPorFactura = function() {
    $scope.pagos = [];
    traerPagoPorFactura();
  }

  var traerPagoPorFactura = function() {
    var objReq = {
      params : {
        idFactura : $scope.codigo
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/pagos/idFactura',objReq)
    .then(pago =>{
      $scope.cargando = false;
      $scope.pagos.push(pago.data);
      $scrollService.scroll('scrollTabla');
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }

  var traerPagoCliente = function() {
    var objReq = {
      params : {
        idCliente : $scope.selectClientes.idClientes,
        offset : $scope.pagos.length
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/pagos/idCliente',objReq)
    .then(pagos =>{
      $scope.cargando = false;
      $scope.limite = pagos.data.count
      $scope.pagos = $scope.pagos.concat(pagos.data.rows);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.ver = function(_idPagosClientes,index) {
    objReq = {
      params : {
        idPagosClientes : _idPagosClientes,
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/lineaPagosClientes/idPagosClientes',objReq)
    .then(detallePago =>{
      $scope.cargando = false;
      $scope.detallePago = detallePago.data
      $scope.nuevoSaldo = parseFloat(($scope.pagos[index].SaldoAnterior + detallePago.data.sumaTotalFacturas - $scope.pagos[index].Monto).toFixed(2))
      $scope.indexPago = index;
      mostrarModalPagoCliente();
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }


  $scope.borrarPago = function(_idPagosClientes,index) {
    var objReq = {
      params : {
        idPagosClientes : _idPagosClientes
      }
    }

    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/pagos/idPagosClientes',objReq)
    .then(() =>{
      $scope.cargando = false;
      $scope.pagos.splice(index,1)
      $scope.limite -= 1;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }    


  var traerClientes = function() {
    $scope.cargando = 'Cargando';
    $servicioClientes.traerClientes()  
    .then(clientes => {
      $scope.cargando = false;
      $scope.clientes = clientes.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }

  var mostrarModalPagoCliente= function() {
    var template = 'templateVerPagoCliente.html';
    $modalService.mostrar(template,$scope);
  }

  /*Funciones del Template VerPagoCliente*/
  $scope.saldoAbonado = function(totalFacturas) {
    if(!(totalFacturas === null)) 
      return $scope.pagos[$scope.indexPago].SaldoAnterior
    else 
      return $scope.pagos[$scope.indexPago].Monto
  }

  $scope.totalLineaPago = function(factura) { //Si la linea de Pago es Saldo, su total depende si hay facturas pagadas o no.
    if(factura.idFactura === 'Saldo' && $scope.detallePago.detalle.length > 1 ) 
      return $scope.pagos[$scope.indexPago].SaldoAnterior //Si hay facturas se abono el Saldo completo(saldo del cliente al momento del Pago)
    else if(factura.idFactura === 'Saldo' && $scope.detallePago.detalle.length === 1)
      return  $scope.pagos[$scope.indexPago].Monto //Si no hay facturas se abono del Saldo el Monto que se pago.
    else return factura.Total
  }

  $scope.verFactura = function(_idFactura,index) {
    objReq = {
      params : {
        idFactura : _idFactura  
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/detalle/idFactura',objReq)
    .then(detalles =>{ 
      $scope.cargando = false;
      $scope.indexFactura = index;
      $scope.auxDetalles = detalles.data;
      $scope.facturas = $scope.detallePago.detalle
      mostrarModalVentas();
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }

  var mostrarModalVentas= function() {
    var template = 'templateVerVenta.html';
    $modalService.mostrar(template,$scope);
  }

  /*Funciones del Template VerPagoCliente*/

  $scope.cargarMas = function() {
    if(!($scope.pagos === undefined)) {
      limpiarFiltros();
      traerPagoCliente();
    }
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
  }

  $scope.modalInfo = function() {
    var pantalla = null
    var mensaje = 'La venta esta asociada a un pago. Para poder borrarla se debe borrar el pago completo desde la pantalla anterior.';
    var rutaDestino = null
    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
  }

  traerClientes(); 

});



    
