miapp.controller('controlHeader',function($scope,$http,$location,$window,$state,$typeaheadService, $cookies,$logService,$errorService){

	if($cookies.get('datosCliente'))
		$scope.varCliente = JSON.parse($cookies.get('datosCliente')) || {};
	$scope.producto = "";

	$scope.logOut = function() {
		$logService.logOut();
	}

	$scope.estadoProductosPorNombre = function() {
		if(!($scope.producto === "")) {
            inputProducto = $scope.producto.Nombre || $scope.producto
			$state.go('miapp.productosPorNombre',{obj : {nombre : inputProducto}});
			$scope.producto = "";
		}
	}

	$scope.traerProductos = function(_nombre) {
		return $typeaheadService.traerProductos(_nombre,$scope)
	}

	var traerSubRubro = function() {
        $http.get('http://ferreteriadelvalle.hopstop.net/rubros/subRubros')
        .then(subRubros =>{
          $scope.rubros = subRubros.data;
      	})
    }

    $scope.traerProductosPorSubRubro = function(subRubro) {
        $state.go('miapp.productosPorSubRubro',{obj : {
            idSubRubro : subRubro.idSubRubro,
            nombre : subRubro.Nombre
            }
        });
    }

    $scope.estadoListarSubRubro = function(rubro) {
    	$state.go('miapp.subRubros',{objRubro : rubro.subRubros[0]});
    }

    traerSubRubro();

    $scope.$on('user.login', function (event, data) {
    	$scope.varCliente = data.cliente;
    });

    //Para cerrar el navBar//

    $(document).on('click', '.navbar-collapse a:not(.dropdown-toggle)', function() {
    	$(this).closest(".navbar-collapse").collapse('hide');
	});

	$(document).on('click', '.navbar-collapse button:not(.navbar-toggle)', function() {
    	$(this).closest(".navbar-collapse").collapse('hide');
	});

	//Para cerrar el navBar//

});
