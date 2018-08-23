adminMiApp.controller('controlLogin',function($scope,$rootScope,$http,$location,$window,$state,$cookies){
		
	$scope.loginEmpleado = function () {
		$scope.cargando = 'Ingresando'
		$http.post('http://ferreteriadelvalle.hopstop.net/login/empleado',$scope.empleado)
		.then(datos =>{
			$scope.cargando = false;
			$cookies.put('tokenAdminSession', datos.data.token);
			$cookies.put('dataAdminSession', datos.data.Empleado);
			$window.location.reload();
		},
		err =>{
			$scope.empleado.Contrasenia = undefined;
			$scope.cargando = false;
			if(err.status === -1)
        		$window.alert('Hubo inconvenientes al realizar el pedido. Verifique su conexion a Internet e intentelo nuevamente');
        	else
				$window.alert(JSON.stringify(err.data.message));
			
		});
	};

});
 