miapp.controller('controlProducto', function($scope,$http,$window){

	var traerProducto = function() {
		$http.get('http://ferreteriadelvalle.hopstop.net/productos')
		.then(productos => {
			$scope.productos = productos;
		})
	};

	$scope.traerRubros =  function() {
		$http.get('http://ferreteriadelvalle.hopstop.net/rubros')
		.then(rubros =>{
			$scope.rubros = rubros.data;
		})	
	}

	$scope.traerSubRubros =  function() {
		var parametros = 
		{
			params : {idRubro : $scope.selectRubros.idSubRubro}	
		};
		$http.get('http://ferreteriadelvalle.hopstop.net/subRubros',parametros)
		.then(subRubros =>{
			$scope.subRubros = subRubros.data;
		})	
	}
 
	$scope.change = function(_idSubRubro) {
        $scope.traerSubRubros();
    };

    var limpiarCampos = function () {
    	$scope.producto.Nombre = '';
		$scope.producto.Precio = '';
		$scope.producto.Stock = '';
		$scope.producto.Descripcion = '';
    }

    if(document.title === 'Principal') {
    	$scope.traerProducto();
	}
	else
		$scope.traerRubros();

});