adminMiApp.controller('controlProveedor', function($scope,$http,$window,$state,$alertService,$errorService,$scrollService){

    $scope.traerProveedores = function() {
    	$scope.cargando = 'Cargando';
    	$http.get('http://ferreteriadelvalle.hopstop.net/admin/proveedores')
		.then(proveedores =>{
			$scope.estado = 'Todos'
			$scope.cargando = false;
			$scope.proveedores = proveedores.data;
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    
    $scope.traerProveedoresConDeuda = function() {
    	$scope.cargando = 'Cargando';
	    $http.get('http://ferreteriadelvalle.hopstop.net/admin/proveedores/deuda')
	    .then((proveedores) => {
	      $scope.estado = 'Proveedores con deuda'
	      $scope.cargando = false;
	      $scope.proveedores = proveedores.data;      
	    },
	    err =>{
	      $errorService.mostrarError(err,$scope)
	    })
  	}

  	$scope.changeProveedor = function() {
    	$scope.auxProveedor = JSON.stringify($scope.selectProveedor);
    	$scope.auxProveedor = JSON.parse($scope.auxProveedor);
    }

    $scope.crearProveedor = function() {

    	var objReq = 
		{
			Proveedor : $scope.proveedor
		};
		$scope.cargando = 'Enviando';
		$http.post('http://ferreteriadelvalle.hopstop.net/admin/proveedores',objReq)
		.then(proveedorNuevo =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El proveedor : " + proveedorNuevo.data.Nombre + " fue creado exitosamente",3,$scope);
			limpiarCampos();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})

	};

    $scope.modificarProveedor = function() {
    	$scope.cargando = 'Enviando';
    	$http.put('http://ferreteriadelvalle.hopstop.net/admin/proveedores',$scope.auxProveedor)
		.then(() =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El proveedor fue modificado correctamente",3,$scope);
			limpiarCampos();
			$scope.traerProveedores();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    $scope.borrarProveedor = function(index) {
    	objReq = {
    		params : {
    			idProveedores : $scope.selectProveedor.idProveedores,
    			Saldo : $scope.selectProveedor.Saldo
    		}
    	} 
    	$scope.cargando = 'Borrando';
    	$http.delete('http://ferreteriadelvalle.hopstop.net/admin/proveedores',objReq)
		.then(() =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El proveedor fue elimindo correctamente",3,$scope);
			limpiarCampos();
			$scope.traerProveedores();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

   	$scope.verDeuda = function() {
    	$state.go('cuentaProveedor',{proveedor : $scope.selectProveedor});
  	}

    var limpiarCampos = function () {
    	$scrollService.scroll('scrollTop')
    	if($state.current.name === "verProveedores") {
    		$scope.selectProveedor = undefined;
	    	$scope.auxProveedor = undefined;
    	}
    	else {
    		$scope.proveedor = undefined;
    	}
    }

    if($state.current.name === "verProveedores") {
    	$scope.traerProveedores();
    }



});