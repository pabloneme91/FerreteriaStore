adminMiApp.controller('controlCuentaProveedor',function($rootScope,$scope,$http,$state,$modalService,
  $errorService,$infoModalService,$alertService,$q){

  $scope.vista = $state.current.name; //El templateVerVentas muestra o no el boton "borrar"

  $scope.verCuentaCompleta = function() {
    $scope.cuenta = 'Cuenta Completa'
    $scope.compras = [];
    traerCompras('',$scope.compras.length,10);
  }

  $scope.verDeuda = function() {
    $scope.search = undefined;
    $scope.cuenta = 'Deuda'
    auxPromesa()
    .then(comprasDeuda => {
      $scope.compras = comprasDeuda;
      sumarDeudaCompras();
    })  
  }

  var auxPromesa = function() {
    $scope.compras = [];
    return $q((resolve, reject) => {
      traerCompras('I',0,null)  
      .then(comprasDeuda =>{
        resolve(comprasDeuda);  
      })
      .catch(err=>{
        reject(err);  
      })
    });
  }

  $scope.changeProveedor = function() {
    $scope.verDeuda();
  }

  var traerCompras = function(_estado,_offset,_limite) {
    var objReq = {
      params : {
        idProveedores : $scope.selectProveedores.idProveedores,
        Estado : _estado,
        offset : _offset,
        limite : _limite,   
      }
    }          

    $scope.cargando = 'Cargando';
    return $http.get('http://ferreteriadelvalle.hopstop.net/admin/compras/proveedor/estado',objReq)
    .then(compras =>{
      $scope.cargando = false;
      $scope.limite = compras.data.count
      $scope.compras = $scope.compras.concat(compras.data.rows);
      return $scope.compras;
    },
    err =>{
      return $errorService.mostrarError(err,$scope);
    })
  }

  var traerProveedores = function() {
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/proveedores')
    .then(proveedores =>{
      $scope.cargando = false;
      $scope.proveedores = proveedores.data;
      if($state.params.proveedor)
          seleccionarProveedor();
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.ver = function(_idCompras,index) {
    objReq = {
      params: {
        idCompras : _idCompras
      }
    } 
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/lineaCompras/idCompras',objReq)
    .then(lineaCompras =>{
      $scope.cargando = false;
      $scope.indexCompra = index;
      $scope.auxLineaCompras = lineaCompras.data;
      var template = 'templateVerCompra.html';
      mostrarModal(template);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.borrarCompra = function(_idCompras,index) {
    var objReq = {
      params : {
        idCompras : _idCompras
      }
    }

    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/compras/idCompras',objReq)
    .then(() =>{
      $scope.cargando = false;
      $scope.totalCompras -= $scope.compras[index].Total;
      $scope.compras.splice(index,1);
      $scope.limite -= 1;
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }    

  $scope.borrarProducto = function(_idLineaCompras,_idCompras,indexLineaCompra) {
    var objReq = {
      params : {
        idCompras : _idCompras,
        idLineaCompras : _idLineaCompras  
      }
    }

    $scope.cargando = 'Borrando';    
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/lineaCompras/idLineaCompras',objReq)
    .then(detalle =>{
      $scope.cargando = false;
      actualizarVista(indexLineaCompra);
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }  

  var actualizarVista = function(indexLineaCompra) {
    $scope.compras[$scope.indexCompra].Total -= $scope.auxLineaCompras[indexLineaCompra].Total
    $scope.compras[$scope.indexCompra].Total = parseFloat(($scope.compras[$scope.indexCompra].Total).toFixed(2));
    $scope.totalCompras -= $scope.auxLineaCompras[indexLineaCompra].Total 
    $scope.auxLineaCompras.splice(indexLineaCompra, 1); //Indice del detalle borrado para evitar traer desde el servidor  
    if($scope.auxLineaCompras.length === 0) {
      $scope.compras.splice($scope.indexCompra,1);
      $scope.limite -= 1;
      $rootScope.cerrarModal();
    }
  }

  $scope.pagar = function() {
    $scope.comprasAPagar = [];
    $scope.montoAbonado = undefined;
    $scope.cargando = 'Cargando';
    auxPromesa()
    .then(comprasDeuda => {
      $scope.cargando = false;
      $scope.comprasAPagar = comprasDeuda;
      var template = 'templateComprasImpagas.html';
      mostrarModal(template);
    })
    .catch(err => {
      $errorService.mostrarError(err,$scope);
    })
  }


  $scope.confirmarPago = function(montoAbonado) {
    objReq = {
        idProveedores : $scope.selectProveedores.idProveedores,
        monto : montoAbonado,
    }

    $scope.cargando = 'Enviando';
    $http.put('http://ferreteriadelvalle.hopstop.net/admin/compras/estado',objReq)
    .then(informacionPago =>{
      $scope.cargando = false;
      $rootScope.cerrarModal();
      mostrarModalPagoConfirmado(informacionPago);
      $scope.verDeuda();
    },
    function(err){
      $errorService.mostrarError(err,$scope);
    })
  }

  var mostrarModalPagoConfirmado = function(informacionPago) {
    $scope.objetoCobroConfirmado = informacionPago.data
    $scope.saldoAnterior = $scope.selectProveedores.Saldo;
    $scope.selectProveedores.Saldo = informacionPago.data.nuevoSaldo
    $scope.montoAbonado = objReq.monto;
    var template = 'templatePagoConfirmado.html';
    mostrarModal(template);
  }

  $scope.totalCompras = function(){
    var total = 0;
    angular.forEach($scope.compras,compra =>{
      if(compra.Estado === 'I')
      total += compra.Total;
    });
    return total;
  }

  var seleccionarProveedor = function() {
    angular.forEach($scope.proveedores,(proveedor,index) =>{
      if(proveedor.idProveedores === $state.params.proveedor.idProveedores) {
        $scope.selectProveedores = $scope.proveedores[index];    
        $scope.verDeuda();
      }
    })
  }

  var sumarDeudaCompras = function(){
    $scope.totalCompras = 0;
    angular.forEach($scope.compras,compra =>{
      $scope.totalCompras += compra.Total;
    });
  }

  $scope.sumarComprasTabla = function() {
    var totalComprasTabla = 0;
    angular.forEach($scope.filtroCompras,compra =>{
      totalComprasTabla += compra.Total;
    });  
    return totalComprasTabla;
  }

  var mostrarModal = function(template) {
    $modalService.mostrar(template,$scope);
  }

  $scope.modalInfo = function() {
    var pantalla = 'Pagos de Proveedores'
    var mensaje = 'La compra ya fue abonada. Por razones de seguridad,para poder borrarla, debe borrar previamente ' + 
    'el pago realizado desde la pantalla de ' + pantalla + '.';
    var rutaDestino = 'verPagosProveedores'
    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
  }

  $scope.cargarMas = function() {
    if(!($scope.compras === undefined)) {
      limpiarFiltros();
      traerCompras('',$scope.compras.length,10);
    }
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
  }

  traerProveedores(); 
  
});



    
