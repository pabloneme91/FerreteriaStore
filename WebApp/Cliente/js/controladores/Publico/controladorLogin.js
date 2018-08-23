miapp.controller('controlLogin',function($scope,$rootScope,$http,$window,$state,$cookies,$errorService,$alertService){
		
	$scope.loginCliente = function () {
		$scope.cargando = 'Iniciando';
		$http.post('http://ferreteriadelvalle.hopstop.net/login',$scope.usuario)
		.then(datos =>{
			$scope.cargando = false;
			$state.go('miapp.home');
			var now = new $window.Date();
			$cookies.put('session', datos.data.token,{
				'expires' : new $window.Date(now.getFullYear(), now.getMonth()+6, now.getDate())
			});
			$cookies.put('datosCliente', JSON.stringify(datos.data.cliente),{
				'expires' : new $window.Date(now.getFullYear(), now.getMonth()+6, now.getDate())
			});
			$rootScope.$broadcast('user.login', datos.data);
			$window.scrollTo(0, 0);
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		});
	};

	$scope.recuperarContrasenia = function() {
		var objReq = {
			Documento : $scope.txtDocumento,
			captcha : grecaptcha.getResponse()
		}
		$scope.cargando = 'Enviando';
		$http.post('http://ferreteriadelvalle.hopstop.net/clientes/contrasenia',objReq)
		.then((mail) =>{
			$alertService.showAlert("info", 'La constraseña se envio al mail : ' + mail.data.Mail,0,$scope)
			grecaptcha.reset();
			$scope.txtDocumento = undefined;
			$scope.cargando = false;
		},
		err =>{
			grecaptcha.reset();
			$errorService.mostrarError(err,$scope)
		})
	}

});
 