adminMiApp.controller('controlRubro', function($scope,$http,$window,$state,$servicioProductos,$alertService,$errorService){

	$scope.crearRubro = function(rubro) {
		var objReq = {
    		Nombre : $scope.txtRubro.Nombre,
    		idRubro : $scope.selectRubro.subRubros[0].idRubro
		}
        
        $scope.cargando = 'Enviando';
		$http.post('http://ferreteriadelvalle.hopstop.net/admin/rubros',objReq) 
		.then(() =>{
            $scope.cargando = false;
			$alertService.showAlert('success','Se creo el subRubro \"' + $scope.txtRubro.Nombre,3,$scope);      
			limpiarCampos();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})
	};

	$scope.change = function(subRubros) {
		$scope.subRubros = subRubros;
    };

    $scope.changeRubro = function() {
    	$scope.auxRubro = JSON.stringify($scope.selectRubros);
    	$scope.auxRubro = JSON.parse($scope.auxRubro);
    }

    var traerRubrosConSubRubros = function() {
        $scope.cargando = 'Cargando';
        $servicioProductos.traerRubrosConSubRubros()
        .then(subRubros =>{
          $scope.cargando = false;
          $scope.rubros = subRubros.data;
      	},
      	err =>{
          $errorService.mostrarError(err,$scope)
      	})
    }

    var listaRubrosConSubRubros = function() {
    	$scope.rubros = [];
        $scope.cargando = 'Cargando';
    	$servicioProductos.traerRubrosConSubRubros()
        .then(rubros =>{
          $scope.cargando = false;
          console.log(rubros.data)
          armarLista(rubros.data);
      	},
      	err =>{
          $errorService.mostrarError(err,$scope)
      	})	
    }

    var armarLista = function(rubros) {
    	for (indexRubro = 0; indexRubro < rubros.length; indexRubro++) {
    		var objRubro = {
    			Nombre : rubros[indexRubro].Rubro,
    			idSubRubro : rubros[indexRubro].subRubros[0].idRubro,
    			idRubro : null
    		}
    		$scope.rubros.push(objRubro)
    		for (indexSubRubro = 0; indexSubRubro < rubros[indexRubro].subRubros.length; indexSubRubro++) {
    			objRubro = {
	    			Nombre : rubros[indexRubro].subRubros[indexSubRubro].Nombre,
	    			idSubRubro : rubros[indexRubro].subRubros[indexSubRubro].idSubRubro,
	    			idRubro : rubros[indexRubro].subRubros[indexSubRubro].idRubro
    			}
    			$scope.rubros.push(objRubro)	
    		}
    	}
    }

    $scope.modificarRubro = function() {
        $scope.cargando = 'Enviando';
    	$http.put('http://ferreteriadelvalle.hopstop.net/admin/rubros',$scope.auxRubro)
		.then(() =>{
            $scope.cargando = false;
			$scope.selectRubros.Nombre = $scope.auxRubro.Nombre
			$alertService.showAlert('success','Se modifico correctamente el Rubro:  \"' + $scope.auxRubro.Nombre,3,$scope);      
			limpiarCampos();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})		
    }

    $scope.borrarRubro = function(index) {
    	if($scope.rubros[index].idRubro === null) {
            $alertService.showAlert('danger','Solamente se pueden borrar subrubros',3,$scope);      
    	}
    	else {
    		objReq = {
	    		params : {
	    			idSubRubro : $scope.rubros[index].idSubRubro
	    		}
    	   } 
           $scope.cargando = 'Borrando';
	       $http.delete('http://ferreteriadelvalle.hopstop.net/admin/subRubros',objReq)
    	   .then(() =>{
              $scope.cargando = false;
    		  $scope.rubros.splice(index,1);
    		  $alertService.showAlert('success','Se elimino correctamente el Rubro',3,$scope);      
    		  limpiarCampos();
    		},
    		err =>{
              $errorService.mostrarError(err,$scope)
    		})
    	}
    }

    var limpiarCampos = function () {
		if($state.current.name === 'verRubros'){
			$scope.selectRubros = undefined;
			$scope.auxRubro = undefined;	    		
		}    	
    	else{
			$scope.txtRubro.Nombre = '';	    		
			$scope.selectRubro = undefined;
    		$scope.selectSubRubro = undefined;
    	}
    }

    if($state.current.name === 'verRubros')
    	listaRubrosConSubRubros();
    else traerRubrosConSubRubros();
		


});