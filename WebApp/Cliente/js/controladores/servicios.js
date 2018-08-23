miapp.factory('$typeaheadService', function($http,$errorService) {
  return {
    traerProductos : function(_nombre,scope) {
      var parametros = {
        params : {
          Nombre : _nombre
        }
      }

      return $http.get('http://ferreteriadelvalle.hopstop.net/productos/nombre', parametros)
      .then(productos =>{
        if(productos.data.length === 0)
          scope.sinResultados = true;
        return productos.data
      },
      err =>{
        $errorService.mostrarError(err,scope);
      });
    }
  }
}); 

miapp.factory('$logService', function($rootScope,$cookies,$state) {
  return {
    logOut : function() {
      $cookies.remove('session');
      $cookies.remove('datosCliente');
      $rootScope.$broadcast('user.login', {cliente : null});  
    }
  }
}); 

miapp.factory('$modalService', function ($uibModal,$rootScope) {
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

miapp.factory('$alertService', function() {
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

miapp.factory('$errorService',function($logService,$modalService,$state,$alertService) {
  return {
    mostrarError : function(err,scope) {
      scope.cargando = false;
      if(err.status === -1)  {
        $alertService.showAlert("danger",'Hubo inconvenientes al realizar el pedido.' + 
         ' Verifique su conexion a Internet e intentelo nuevamente',0,scope);
        return
      }
      else if(err.status === 401) {
        scope.error = err.data.message || null;
        var modal = $modalService.mostrar('templateError.html',scope)
        modal.result.then(() =>{
          $logService.logOut();
          $state.go('miapp.login');
        })
      }
      else {
        scope.error = err.data.message || null;
        var modal = $modalService.mostrar('templateError.html',scope)
      }
    }
  }
})



miapp.factory('$infoService',function($logService,$modalService,$state) {
  return {
    mostrarInfo : function(mensaje,scope) {
      scope.cargando = false;
      scope.mensaje = mensaje;
      var modal = $modalService.mostrar('templateInformacion.html',scope)
      modal.result.then(() =>{
          $state.go('miapp.home')
      })
    }
  }
})

miapp.factory('$scrollService', function ($location,$anchorScroll) {
  return {
    scroll : function(elemento) {
      $location.hash(elemento);
      $anchorScroll();
    }
  }
});
