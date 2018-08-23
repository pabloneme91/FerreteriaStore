adminMiApp.controller('controlPagosProveedores',function($rootScope,$scope,$state,$http,$modalService,$servicioClientes,$errorService,$alertService){

  $scope.vista = $state.current.name

  $scope.changeProveedor = function() {
    $scope.pagos = [];
    traerPagoProveedor();
  }

  $scope.btnTraerPagoPorCompra = function() {
    $scope.pagos = []; //Inicializo el array de facturas de la tabla para poder usar la propiedad .length en traerFacturas();
    traerPagoPorCompra(); 
  }

  var traerPagoPorCompra = function() {
    var objReq = {
      params : {
        idCompras : $scope.codigo
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/pagos/idCompras',objReq)
    .then(pago =>{
      $scope.cargando = false;
      $scope.pagos.push(pago.data);
      $scrollService.scroll('scrollTabla');
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }  

  var traerPagoProveedor = function() {
    var objReq = {
      params : {
        idProveedores : $scope.selectProveedores.idProveedores,
        offset : $scope.pagos.length
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/pagos/idProveedores',objReq)
    .then(pagos =>{
      $scope.cargando = false;
      $scope.limite = pagos.data.count
      $scope.pagos = $scope.pagos.concat(pagos.data.rows);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.ver = function(_idPagosProveedores,index) {
    objReq = {
      params : {
        idPagosProveedores : _idPagosProveedores,
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/lineaPagosProveedores/idPagosProveedores',objReq)
    .then(detallePago =>{
      $scope.cargando = false;
      $scope.detallePago = detallePago.data
      $scope.nuevoSaldo = parseFloat(($scope.pagos[index].SaldoAnterior + detallePago.data.sumaTotalCompras - $scope.pagos[index].Monto).toFixed(2))
      $scope.indexPago = index;
      mostrarModalPagoProveedor();
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }


  $scope.borrarPago = function(_idPagosProveedores,index) {
    var objReq = {
      params : {
        idPagosProveedores : _idPagosProveedores
      }
    }

    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/pagos/idPagosProveedores',objReq)
    .then(() =>{
      $scope.cargando = false;
      $scope.pagos.splice(index,1);
      $scope.limite -= 1;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }    


  var traerProveedores = function() {
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/proveedores')
    .then(proveedores => {
      $scope.cargando = false;
      $scope.proveedores = proveedores.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  var mostrarModalPagoProveedor= function() {
    var template = 'templateVerPagoProveedor.html';
    $modalService.mostrar(template,$scope);
  }

  /*Funciones del Template VerPagoProveedor*/
  $scope.saldoAbonado = function(totalCompras) {
    if(!(totalCompras === null)) 
      return $scope.pagos[$scope.indexPago].SaldoAnterior
    else 
      return $scope.pagos[$scope.indexPago].Monto
  }

  $scope.totalLineaPago = function(compra) { //Si la linea de Pago es Saldo, su total depende si hay compras pagadas o no.
    if(compra.idCompras === 'Saldo' && $scope.detallePago.detalle.length > 1 ) 
      return $scope.pagos[$scope.indexPago].SaldoAnterior //Si hay compras se abono el Saldo completo(saldo del proveedor al momento del Pago)
    else if(compra.idCompras === 'Saldo' && $scope.detallePago.detalle.length === 1)
      return  $scope.pagos[$scope.indexPago].Monto //Si no hay compras se abono del Saldo el Monto que se pago.
    else return compra.Total
  }

  $scope.verCompra = function(_idCompras,index) {
    objReq = {
      params : {
        idCompras : _idCompras
      }
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/lineaCompras/idCompras',objReq)
    .then(lineaCompras =>{
      $scope.cargando = false;
      $scope.indexCompra = index;
      $scope.auxLineaCompras = lineaCompras.data;
      $scope.compras = $scope.detallePago.detalle
      mostrarModalCompras();
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
    
  }

  var mostrarModalCompras= function() {
    var template = 'templateVerCompra.html';
    $modalService.mostrar(template,$scope);
  }

  /*Funciones del Template VerPagoCliente*/

  $scope.cargarMas = function() {
    if(!($scope.pagos === undefined))
    {
      limpiarFiltros();
      traerPagoProveedor();
    }
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
  }

  $scope.modalInfo = function() {
    var pantalla = null
    var mensaje = 'La compra esta asociada a un pago. Para poder borrarla se debe borrar el pago completo desde la pantalla anterior.';
    var rutaDestino = null
    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
  }  

  traerProveedores(); 

});



    
