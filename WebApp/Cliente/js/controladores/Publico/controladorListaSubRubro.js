miapp.controller('controlSubRubro',function($scope,$http,$state,$errorService){
		
	var listarSubRubros = function() {
		var objReq = {
			params : {
				idRubro : $state.params.objRubro.idRubro
			}
		}
        $http.get('http://ferreteriadelvalle.hopstop.net/subRubros/idRubro',objReq)
        .then(subRubros =>{
        	
          $scope.subRubros = subRubros.data;
      	},
      	err =>{
          $errorService.mostrar(err,$scope)
      	})
	}

	$scope.traerProductosPorSubRubro = function(subRubro) {
        $state.go('miapp.productosPorSubRubro',{obj : {
            idSubRubro : subRubro.idSubRubro,
            nombre : subRubro.Nombre
            }
        });
    }

	if($state.params.objRubro){
		listarSubRubros();
		$scope.rubro = $state.params.objRubro.Nombre
	}

});
 