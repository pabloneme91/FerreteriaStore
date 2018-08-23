miapp.controller('controlSubRubro',function($rootScope,$scope,$http,$state,$ionicHistory){

	$rootScope.parametrosListaSubRubros = $state.params; //Guardo parametros recibidos para cuando quiera volver a este estado

	var listarSubRubros = function() {
		var objReq = {
			params : {
				idRubro : $state.params.objRubro.subRubros[0].idRubro
			}
		}
    $http.get('http://ferreteriadv.hopto.org/subRubros/idRubro',objReq)
    .then(subRubros =>{
      $scope.subRubros = subRubros.data;
  	})
	}

	$scope.estadoProductosPorSubRubro = function(subRubro) {
    $state.go('productosPorSubRubro',{obj : {
        idSubRubro : subRubro.idSubRubro,
        nombre : subRubro.Nombre
        }
    });
  }

	listarSubRubros();
	$scope.rubro = $state.params.objRubro.Rubro
});
 