adminMiApp.controller('controlCuentaCliente',function($rootScope,$locale,$scope,$http,$state,$modalService,
  $servicioClientes,$errorService,$infoModalService,$alertService,$q){

    $scope.vista = $state.current.name; //El templateVerVentas muestra o no el boton "borrar"

    $scope.verCuentaCompleta = function() {
      $scope.cuenta = 'Cuenta Completa'
      $scope.facturas = [];
      traerCuenta('',$scope.facturas.length,10);
    }

    $scope.verDeuda = function() {
      $scope.search = undefined;
      $scope.cuenta = 'Deuda';
      auxPromesa()
      .then(facturasDeuda => {
        $scope.facturas = facturasDeuda;
        sumarDeudaFacturas();
      })  
    }

    var auxPromesa = function() {
      $scope.facturas = [];
      return $q((resolve, reject) => {
        traerCuenta('CC',0,null)  
        .then(facturasDeuda =>{
          resolve(facturasDeuda);  
        })
        .catch(err=>{
          reject(err);  
        })
      });
    }

    $scope.changeCliente = function() {
      $scope.verDeuda();
    }

    var traerCuenta = function(_estado,_offset,_limite) {
      var objReq = {
        params : {
          idCliente : $scope.selectClientes.idClientes,
          Estado : _estado,
          offset : _offset,
          limite : _limite, 
        }
      }

      $scope.cargando = 'Cargando';
      return $http.get('http://ferreteriadelvalle.hopstop.net/admin/facturas/cliente/estado',objReq)
      .then(facturas =>{
        $scope.cargando = false;
        $scope.limite = facturas.data.count
        $scope.facturas = $scope.facturas.concat(facturas.data.rows);
        return $scope.facturas;
      },
      err =>{
        return $errorService.mostrarError(err,$scope);
      })
    }

    var traerClientes = function() {
      $scope.cargando = 'Cargando';
      $servicioClientes.traerClientes()
      .then(clientes => {
        $scope.cargando = false;
        $scope.clientes = clientes.data;
        if($state.params.cliente)
          seleccionarCliente();
      },
      err =>{
        $errorService.mostrarError(err,$scope);
      })
    }

    $scope.ver = function(_idFactura,index) {
      objReq = {
        params :{
          idFactura : _idFactura  
        }
      }

      $scope.cargando = 'Cargando';
      $http.get('http://ferreteriadelvalle.hopstop.net/admin/detalle/idFactura',objReq)
      .then(detalles =>{
        $scope.cargando = false;
        $scope.indexFactura = index;
        $scope.auxDetalles = detalles.data;
        var template = 'templateVerVenta.html';
        mostrarModal(template);
      },
      err =>{
        $errorService.mostrarError(err,$scope);
      })
    }

    $scope.borrarFactura = function(_idFactura,index) {
      var objReq = {
        params : {
          idFactura : _idFactura
        }
      }
      $scope.cargando = 'Borrando';
      $http.delete('http://ferreteriadelvalle.hopstop.net/admin/facturas/idFactura',objReq)
      .then(() =>{
        $scope.cargando = false;
        $scope.totalFacturas -= $scope.facturas[index].Total;
        $scope.facturas.splice(index,1);
        $scope.limite -= 1;
      },
      err =>{
        $errorService.mostrarError(err,$scope)
      })
    }    

    $scope.cobrar = function() {
      $scope.facturasACobrar = [];
      $scope.montoAbonado = undefined;
      $scope.cargando = 'Cargando';
      auxPromesa()
      .then(facturasDeuda =>{
        $scope.cargando = false;
        $scope.facturasACobrar = facturasDeuda;        
        var template = 'templateFacturasImpagas.html';
        mostrarModal(template);
      })
      .catch(err =>{
        $errorService.mostrarError(err,$scope);
      })
    }

    $scope.cargarMas = function() {
      if(!($scope.facturas === undefined)) {
        limpiarFiltros();        
        traerCuenta('',$scope.facturas.length,10);
      }
    }

    var limpiarFiltros = function() {
      $scope.search = undefined;
    }

    //FUNCION DEL TEMPLATE VerVenta
    
    $scope.borrarProducto = function(_idDetalle,_idFactura,indexDetalle) {
      var objReq = {
        params: {
          idFactura : _idFactura,
          idDetalles : _idDetalle  
        }
      }
      $scope.cargando = 'Borrando';
      $http.delete('http://ferreteriadelvalle.hopstop.net/admin/detalle/idDetalle',objReq)
      .then(() =>{
        $scope.cargando = false;
        actualizarVista(indexDetalle);
      },
      err => {
        $errorService.mostrarError(err,$scope);
      })
    }  

    var actualizarVista = function(indexDetalle) {
      $scope.facturas[$scope.indexFactura].Total -= $scope.auxDetalles[indexDetalle].Total 
      $scope.facturas[$scope.indexFactura].Total =  parseFloat(($scope.facturas[$scope.indexFactura].Total).toFixed(2));
      $scope.totalFacturas -= $scope.auxDetalles[indexDetalle].Total 
      $scope.totalFacturas = parseFloat(($scope.totalFacturas).toFixed(2));
      $scope.auxDetalles.splice(indexDetalle, 1); //Indice del detalle borrado para evitar traer desde el servidor  
      if($scope.auxDetalles.length === 0) {
        $scope.facturas.splice($scope.indexFactura,1);
        $scope.limite -= 1;
        $rootScope.cerrarModal();
      }
    }

    $scope.confirmarPago = function(montoAbonado) {
      objReq = {
          idClientes : $scope.selectClientes.idClientes,
          monto : montoAbonado,
      }

      $scope.cargando = 'Enviando';
      $http.put('http://ferreteriadelvalle.hopstop.net/admin/facturas/estado',objReq)
      .then(informacionCobro =>{
        $scope.cargando = false;
        $rootScope.cerrarModal();
        mostrarModalCobroConfirmado(informacionCobro);
        $scope.verDeuda();
      },
      function(err){
        $errorService.mostrarError(err,$scope)
      })
    }

    var mostrarModalCobroConfirmado = function(informacionCobro) {
      $scope.objetoCobroConfirmado = informacionCobro.data
      $scope.saldoAnterior = $scope.selectClientes.Saldo;
      $scope.selectClientes.Saldo = informacionCobro.data.nuevoSaldo
      $scope.montoAbonado = objReq.monto;
      var template = 'templateCobroConfirmado.html';
      mostrarModal(template);
    }

    //FUNCION DEL TEMPLATE VerVenta

    //FUNCIONES AUXILIARES
      
    var sumarDeudaFacturas = function(){
      $scope.totalFacturas = 0;
      angular.forEach($scope.facturas,factura =>{
        $scope.totalFacturas += factura.Total;
      });
    }

    var mostrarModal = function(template) {
      $modalService.mostrar(template,$scope);
    }

    
    var seleccionarCliente = function() {
      angular.forEach($scope.clientes,(cliente,index) =>{
        if(cliente.idClientes === $state.params.cliente.idClientes) {
          $scope.selectClientes = $scope.clientes[index];    
          $scope.verDeuda();
        }
      })
    }

    $scope.sumarFacturasTabla = function() {
      var totalFacturasTabla = 0;
      angular.forEach($scope.filtroFacturas,factura =>{
        totalFacturasTabla += factura.Total;
      });  
      return totalFacturasTabla;
    }

    $scope.modalInfo = function() {
      var pantalla = 'Pagos de Cliente'
      var mensaje = 'La venta ya fue abonada. Por razones de seguridad,para poder borrarla, debe borrar previamente ' + 
      'el pago realizado desde la pantalla de ' + pantalla + '.';
      var rutaDestino = 'verPagosClientes'
      $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
    }

    //FUNCIONES AUXILIARES

    traerClientes();

});



    
