miapp.factory('$errorService', function ($spinnerService,$popupService) {
  return {
    mostrarError : function (err,scopeContraldor) {
      $spinnerService.esconder();
      if(err.status === -1){
        scopeContraldor.error = 'Hubo inconvenientes al realizar el pedido.' + 
         ' Verifique su conexion a Internet e intentelo nuevamente'
         $popupService.error(scopeContraldor)
      }
      else {
        scopeContraldor.error = err.data.message;
        $popupService.error(scopeContraldor)
      }
    },
  }  
});