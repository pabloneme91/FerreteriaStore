adminMiApp.controller('controlVerVenta',function($rootScope,$scope,$http,$state,$filter,$modalService,$alertService,
  $errorService,$scrollService,$infoModalService){

  $scope.vista = $state.current.name; //El templateVerVentas muestra o no el boton "borrar"

  /*Configuracion Fecha DatePicker*/

  $scope.opcionesDesde = {
    maxDate: new Date(),
    showWeeks : false,
  };

  $scope.opcionesHasta = {
    maxDate: new Date(),
    showWeeks : false,
  };

  $scope.desde = {
    opened: false
  };

  $scope.hasta = {
    opened: false
  };

  $scope.fechaHasta = new Date();
  $scope.fechaDesde = new Date();

  $scope.mostrarCalendarioDesde = function() {
    $scope.desde.opened = true;
  };

  $scope.mostrarCalendarioHasta = function() {
    $scope.hasta.opened = true;
  };

  /*Configuracion Fecha DatePicker*/

  $scope.btnTraerFacturas = function() {
    $scope.facturas = []; //Inicializo el array de facturas de la tabla para poder usar la propiedad .length en traerFacturas();
    traerFacturas();
  }

  $scope.btnTraerFacturaPorId = function() {
    $scope.facturas = []; //Inicializo el array de facturas de la tabla para poder usar la propiedad .length en traerFacturas();
    $scope.limite = 0
    traerFacturaPorId(); 
  }

  var traerFacturaPorId = function() {
    var objReq = {
      params : {
        idFactura : $scope.codigo
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/facturas/idFactura',objReq)
    .then(factura =>{
      $scope.cargando = false;
      if(factura.data) {
        $scope.facturas.push(factura.data);
        $scrollService.scroll('scrollTabla');
      }
      else
        $alertService.showAlert("danger","No existen facturas con ese N° de codigo",3,$scope)
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }

  var traerFacturas = function() {
    var obj = {
      fechaInicio : $filter('date')($scope.fechaDesde,'yyyy-MM-dd'), //Filtro para formatear Fecha
      fechaFin : $filter('date')($scope.fechaHasta,'yyyy-MM-dd'),
      offset : $scope.facturas.length
    }

    var objReq = {
      params : obj
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/facturas/fecha',objReq)
    .then(facturas =>{
      $scope.cargando = false;
      if ($scope.facturas.length === 0 && facturas.data.count >0){
        $scrollService.scroll('scrollTabla')
      }
      $scope.limite = facturas.data.count;
      $scope.facturas = $scope.facturas.concat(facturas.data.rows);
      if($scope.facturas.length === 0) 
        $alertService.showAlert("danger","No existen facturas entre las fechas ingresadas",3,$scope)
    },  
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  
  $scope.ver = function(_idFactura,index) {
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
      mostrarModalVentas();
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
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
      $scope.limite -= 1;
      $scope.cargando = false;
      $scope.facturas.splice(index,1);
    },
    err =>{
      $errorService.mostrarError(err,$scope) 
    })
  }    

  
  var mostrarModalVentas = function() {
    var template = 'templateVerVenta.html';
    $modalService.mostrar(template,$scope);
  }

  //FUNCION DEL TEMPLATE 'VerVenta'
  $scope.borrarProducto = function(_idDetalle,_idFactura,indexDetalle) {
    var objReq = {
      params : {
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
      $errorService.mostrarError(err,$scope) 
    })
  }

  var actualizarVista = function(indexDetalle) {
    $scope.facturas[$scope.indexFactura].Total -= $scope.auxDetalles[indexDetalle].Total
    $scope.facturas[$scope.indexFactura].Total = ($scope.facturas[$scope.indexFactura].Total).toFixed(2);
    $scope.auxDetalles.splice(indexDetalle, 1); //Indice del detalle borrado para evitar traer desde el servidor  
    if($scope.auxDetalles.length === 0) {
      $scope.limite -= 1;
      $scope.facturas.splice($scope.indexFactura,1);
      $rootScope.cerrarModal();
    }
  }

  
  //FUNCION DEL TEMPLATE 'VerVenta'


   $scope.sumarFacturas = function() {
    var totalFacturas = 0;
    angular.forEach($scope.filtroFacturas,factura =>{
      totalFacturas += factura.Total;
    });
    return totalFacturas;
  }

  $scope.cargarMas = function() {
    if(!($scope.facturas === undefined)){
      //limpiarFiltros();
      traerFacturas();
    }
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
    $scope.inputTotal = undefined;
  }

  $scope.modalInfo = function() {
    var pantalla = 'Cuenta de Cliente'
    var mensaje = 'La venta esta asociada a un cliente. Por razones de seguridad debe borrarla ' + 
    'desde la pantalla de ' + pantalla + '.';
    var rutaDestino = 'cuentaCliente'
    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
  }

});    