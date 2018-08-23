miapp.controller('controlCliente', function($scope,$http,$state,$infoService,$alertService,$filter){

	/*Configuracion Fecha DatePicker*/
	$scope.cliente = {};
	$scope.opcionesFecha = {
		maxDate: new Date(),
		showWeeks : false,
	}

	$scope.fecha = {
	opened: false
	};

	$scope.mostrarCalendario = function() {
		$scope.fecha.opened = true;
	};

	/*Configuracion Fecha DatePicker*/

	$scope.recargarCaptcha = function() {
		grecaptcha.reset();
	}

	$scope.registrarse = function() {
		$alertService.cerrarAlert($scope);
		$scope.cliente.FechaNacimiento = $filter('date')($scope.fecha,'yyyy-MM-dd') || null;

		var objReq = {
			cliente : $scope.cliente,
			captcha : grecaptcha.getResponse()
		}

		$scope.cargando = 'Enviando';
		$http.post('http://ferreteriadelvalle.hopstop.net/clientes',objReq)
		.then(() => {
			$scope.cargando = false;
			$infoService.mostrarInfo('El usuario fue creado correctamente. En breve se comunicara por Email cuando sea dado de alta.',$scope);
		},
		err =>{
			grecaptcha.reset();
			$errorService.mostrarError(err,$scope)
		})
	};
	
});