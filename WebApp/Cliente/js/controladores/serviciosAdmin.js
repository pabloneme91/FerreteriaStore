adminMiApp.factory('$modalService', function ($uibModal,$rootScope) {
  $rootScope.contador = -1;
  $rootScope.modalInstance = [];

  $rootScope.cerrarModal = function () {
    $rootScope.modalInstance[$rootScope.contador].close();
    $rootScope.contador --;
  };

  return {
    mostrar : function (template,scopeController) {
      $rootScope.contador ++; 
      $rootScope.animationsEnabled = true;
      return $rootScope.modalInstance[$rootScope.contador] = $uibModal.open({
        animation: $rootScope.animationsEnabled,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: template,
        scope : scopeController,
        backdrop : 'static',
        keyboard  : false,
      });
    },
  }
});

adminMiApp.factory('$infoModalService', function($rootScope,$modalService) {
  return {
    mostrar : function(_vista,_mensaje,_rutaDestino,scope) {
      scope.infoVista = _vista
      scope.infoMensaje = _mensaje
      scope.infoRutaDestino = _rutaDestino
      template = 'templateInformacion.html';
      $modalService.mostrar(template,scope);
    },
  }
});

adminMiApp.factory('$alertService', function() {
  return {
    showAlert : function(tipo,texto,tiempo,scope) {
      scope.alertMessage =
       {
        type: tipo,
        text: texto,
        closable: true,
        delay: tiempo
      }
    },
    cerrarAlert : function(scope) {
      scope.alertMessage = null
    }
  };
}); 

adminMiApp.factory('$errorService', function($alertService) {
  return {
    mostrarError : function(err,scope) {
      scope.cargando = false;
      if(err.status === -1)
        $alertService.showAlert("danger",'Hubo inconvenientes al realizar el pedido. Verifique su conexion a Internet e intentelo nuevamente',0,scope);
      else  
        $alertService.showAlert("danger",'Error: ' + err.data.message,6,scope);
    }
  };
}); 

adminMiApp.factory('$servicioProductos', function ($http) {
  return {
    traerProductos : function() {
      return $http.get('http://ferreteriadelvalle.hopstop.net/admin/productos')
    },
    traerProductosConVentas : function() {
      return $http.get('http://ferreteriadelvalle.hopstop.net/admin/productos/ventas')
    },
    traerRubrosConSubRubros : function() {
      return $http.get('http://ferreteriadelvalle.hopstop.net/admin/rubros/subRubros')
    },
  }
});


adminMiApp.factory('$servicioClientes', function ($http) {
  return {
    traerClientes : function() {
      return $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes')
    }
  }
});

adminMiApp.factory('$scrollService', function ($location,$anchorScroll) {
  return {
    scroll : function(elemento) {
      $location.hash(elemento);
      $anchorScroll();
    }
  }
});




