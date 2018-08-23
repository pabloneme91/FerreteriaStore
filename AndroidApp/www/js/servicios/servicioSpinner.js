miapp.factory('$spinnerService', function ($rootScope,$ionicLoading) {
  return {
    mostrar : function (mensaje) {
	 	  $ionicLoading.show({
        template: '<p>' + mensaje +'</p><ion-spinner icon="android"></ion-spinner>'
      });
    },
    cargandoVista : function () {
      $ionicLoading.show({
        template: '<ion-spinner icon="android"></ion-spinner>',
        noBackdrop : true
      });
    },
    esconder : function (mensaje) {
      $ionicLoading.hide();
    },
  }  
});