;(function () {
    miapp.factory('$popupService', function ($ionicPopup,$spinnerService,$timeout) {

        var alertaAutoClose = function (titulo,mensaje,botones,scopeControlador) {
          popupAlertaAutoClose = $ionicPopup.show({
            title: titulo,
            template : mensaje,
            buttons: botones,
            scope : scopeControlador
          });
          $timeout(() => {
            popupAlertaAutoClose.close();
          }, 1250);
        }

      return {

        alertaAutoClose : alertaAutoClose,

        confirmacion : function (mensaje) {
    	 	return popupConfirmacion = $ionicPopup.confirm({
    		    title: 'Confirmacion',
    		    template: mensaje,
    		    cancelText : 'Cancelar',
    		    cancelType : 'button-assertive',
    		    okText : 'Comprar',
    	    });
        },
        alerta : function (titulo,template,templateUrl,botones,scopeControlador) {
    	  return scopeControlador.popupAlerta = $ionicPopup.show({
            title: titulo,
            template : template,
            templateUrl : templateUrl,
            buttons: botones,
            scope : scopeControlador
          });
        },
        error : function (scopeControlador) {
    	  return scopeControlador.popupAlerta = $ionicPopup.alert({
            title: 'Error',
            cssClass : 'error-popup',
            templateUrl : 'vistas/templateError.html',
            okText : 'Cerrar',
            okType : 'button-assertive',
            scope : scopeControlador
          });
        },    
        cerrar : function(scopeControlador) {
            scopeControlador.popupAlerta.close();
        }
      }  
    });

}());