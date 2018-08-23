adminMiApp.controller('controlVerCompras',function($rootScope,$scope,$state,$http,$filter,$modalService,$alertService,
  $errorService,$scrollService,$infoModalService){

  $scope.vista = $state.current.name; //El templateVerCompras muestra o no el boton "borrar"

  /*Configuracion Fecha DatePicker*/

  $scope.opcionesDesde = {
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

  $scope.btnTraerCompraPorId = function() {
    $scope.compras = []; //Inicializo el array de facturas de la tabla para poder usar la propiedad .length en traerFacturas();
    $scope.limite = 0
    traerCompraPorId(); 
  }


  $scope.btnTraerCompras = function() {
    $scope.compras = [];
    traerCompras();
  }

  var traerCompraPorId = function() {
    var objReq = {
      params : {
        idCompras : $scope.codigo
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/compras/idCompras',objReq)
    .then(compra =>{
      $scope.cargando = false;
      if(compra.data){
        $scope.compras.push(compra.data);
        $scrollService.scroll('scrollTabla');
      }
      else
        $alertService.showAlert("danger","No existe una compra con ese N° de codigo",3,$scope)
      
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }


  var traerCompras = function(objFecha) {
    var obj = {
      fechaInicio : $filter('date')($scope.fechaDesde,'yyyy-MM-dd'), //Filtro para formatear Fecha
      fechaFin : $filter('date')($scope.fechaHasta,'yyyy-MM-dd'),
      offset : $scope.compras.length
    }

    var objReq = {
      params : obj
    }

    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/compras/fecha',objReq)
    .then(compras =>{
      $scope.cargando = false;
      if ($scope.compras.length === 0 && compras.data.count >0){
        $scrollService.scroll('scrollTabla')
      }
      $scope.limite = compras.data.count;
      $scope.compras = $scope.compras.concat(compras.data.rows);
      if($scope.compras.length === 0) 
        $alertService.showAlert("danger","No existen compras entre las fechas ingresadas",3,$scope)
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.ver = function(_idCompras,index) {
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
      mostrarModalCompras();
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
      $scope.limite -= 1;
      $scope.compras.splice(index,1);
    },
    err =>{
      $errorService.mostrarError(err,$scope) 
    })
  }    

  
  var mostrarModalCompras = function () {
    var template = 'templateVerCompra.html';
    $modalService.mostrar(template,$scope);
  }

  //FUNCION DEL TEMPLATE 'VerCompras'

  $scope.borrarProducto = function(_idLineaCompras,_idCompras,indexLineaCompra) {
    var objReq = {
      params : {
        idCompras : _idCompras,
        idLineaCompras : _idLineaCompras  
      }
    }
       
    $scope.cargando = 'Borrando'    
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/lineaCompras/idLineaCompras',objReq)
    .then(detalle =>{
      $scope.cargando = false    
      actualizarVista(indexLineaCompra);
    },
    err =>{
      $errorService.mostrarError(err,$scope) 
    })
  }  

  var actualizarVista = function(indexLineaCompra) {
    $scope.compras[$scope.indexCompra].Total -= $scope.auxLineaCompras[indexLineaCompra].Total
    $scope.compras[$scope.indexCompra].Total = ($scope.compras[$scope.indexCompra].Total).toFixed(2);
    $scope.auxLineaCompras.splice(indexLineaCompra, 1); //Indice del detalle borrado para evitar traer desde el servidor  
    if($scope.auxLineaCompras.length === 0) {
      $scope.limite -= 1;
      $scope.compras.splice($scope.indexCompra,1);
      $rootScope.cerrarModal();
    }
  }

  //FUNCION DEL TEMPLATE 'VerCompras'

  $scope.cargarMas = function() {
    if(!($scope.compras === undefined)){
      limpiarFiltros();
      traerCompras();
    }
  }

  $scope.sumarCompras = function() {
    var totalCompras = 0;
    angular.forEach($scope.filtroCompras,compra =>{
      totalCompras += compra.Total;
    });
    return totalCompras;
  }

  var limpiarFiltros = function() {
    $scope.search = undefined;
    $scope.inputTotal = undefined;
  }

  $scope.modalInfo = function() {
    var pantalla = 'Cuenta de Proveedores'
    var mensaje = 'La compra esta asociada a un proveedor. Por razones de seguridad debe borrarla ' + 
    'desde la pantalla de ' + pantalla + '.';
    var rutaDestino = 'cuentaProveedor'
    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
  }


});
