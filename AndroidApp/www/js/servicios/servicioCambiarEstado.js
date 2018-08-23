miapp.factory('$changeStateService', function ($rootScope,$state,$ionicTabsDelegate) {
  return {
    cambiarVista : function (_estado,_indexTab) {
      var datos = {
        estado : _estado,
        index : _indexTab
      }
      $rootScope.$broadcast('cambiarEstado', datos);
    },
  }  
});