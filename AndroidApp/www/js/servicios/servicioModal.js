miapp.factory('$modalService', function ($ionicModal,$rootScope,$q) {
  $rootScope.contador = -1;
  $rootScope.modal = [];

  $rootScope.cerrarModal = function () {
    $rootScope.modal[$rootScope.contador].hide();
    $rootScope.contador --;
  };

  return {
    mostrar : function (template,scopeController) {
      $rootScope.contador ++; 
      $ionicModal.fromTemplateUrl(template, {
        scope: scopeController
      }).then(modal =>{
        $rootScope.modal[$rootScope.contador] = modal;
        $rootScope.modal[$rootScope.contador].show();
      });
    },
    cerrarModal : function() {
      return $rootScope.modal[$rootScope.contador].hide();
    }
  }  

});