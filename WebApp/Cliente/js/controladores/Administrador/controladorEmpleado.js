adminMiApp.controller('controlEmpleado', function($scope,$http,$state,$alertService,$errorService,$scrollService){

    var traerEmpleados = function() {
    	$scope.cargando = 'Cargando';
    	$http.get('http://ferreteriadelvalle.hopstop.net/admin/empleados')
		.then(empleados =>{
			$scope.cargando = false;
			$scope.empleados = empleados.data;

		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    var traerEmpleadoPorId = function() {
    	$scope.cargando = 'Cargando';
    	$http.get('http://ferreteriadelvalle.hopstop.net/admin/empleados/idEmpleados')
		.then(empleado =>{
			$scope.cargando = false;
			if(empleado.data.Rol === 'E')
				empleado.data.Rol = 'Empleado'	
			else 
				empleado.data.Rol = 'Administrador'		
			$scope.empleado = empleado.data;
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    $scope.changeEmpleado = function() {
    	$scope.auxEmpleado = JSON.stringify($scope.selectEmpleado);
    	$scope.auxEmpleado = JSON.parse($scope.auxEmpleado);
    	if($scope.auxEmpleado.Rol === "A")
    		$scope.auxEmpleado.Rol = "Administrador"
    	else $scope.auxEmpleado.Rol = "Empleado"
    }

    $scope.crearEmpleado = function() {
    	if($scope.empleadoNuevo.Rol === "Administrador")
    		$scope.empleadoNuevo.Rol = "A"
    	else $scope.empleadoNuevo.Rol = "E"

		var objReq = 
		{
			Empleado : $scope.empleadoNuevo
		};

		$scope.cargando = 'Enviando';
		$http.post('http://ferreteriadelvalle.hopstop.net/admin/empleados',objReq)
		.then(empleadoNuevo =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El empleado : " + empleadoNuevo.data.Apellido + ", " 
				+ empleadoNuevo.data.Nombre + " fue creado exitosamente",3,$scope);
			limpiarCampos();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})

	};

    $scope.modificarEmpleado = function() {
    	var objReq = {
    		Telefono : $scope.empleado.Telefono,
    		Mail : $scope.empleado.Mail,
    	}

    	$scope.cargando = 'Enviando';
    	$http.put('http://ferreteriadelvalle.hopstop.net/admin/empleados',objReq)
		.then(() =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El empleado fue modificado correctamente",3,$scope);
			limpiarCampos();
			traerEmpleadoPorId();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    $scope.borrarEmpleado = function(_idEmpleados) {
    	objReq = {
    		params : {
    			idEmpleados : _idEmpleados
    		}
    	} 
    	$scope.cargando = 'Borrando';
    	$http.delete('http://ferreteriadelvalle.hopstop.net/admin/empleados',objReq)
		.then(() =>{
			$scope.cargando = false;
			$alertService.showAlert("success","El empleado fue elimindo correctamente",3,$scope);
			traerEmpleados();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    $scope.cambiarEstado = function(_estado,_idEmpleados) {
    	var estado;

    	if(_estado === 'Activo' ) 
    		estado = 'Baja'
    	else 
    		estado = 'Activo'

    	objReq = {
    		idEmpleado : _idEmpleados,
    		Estado : estado
    	}

    	$scope.cargando = 'Enviando';
    	$http.put('http://ferreteriadelvalle.hopstop.net/admin/empleados/estado',objReq)
		.then(() =>{
			$scope.cargando = false;
			if(_estado === 'Activo' ) 
    			estado = 'baja'
		   	else 
    			estado = 'Alta'
			$alertService.showAlert("success","El empleado fue dado de " + estado,3,$scope);
			traerEmpleados();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    var limpiarCampos = function () {
    	$scrollService.scroll('scrollTop');
    	$scope.empleadoNuevo = undefined;
    }

    $scope.elegirRol = function(rol) {
    	if(rol === 'A')
    		return 'Administrador'
    	else
    		return 'Empleado'
    }

    if($state.current.name === "verEmpleados") {
    	traerEmpleados();
    }
    else {
    	traerEmpleadoPorId();	
    }



});