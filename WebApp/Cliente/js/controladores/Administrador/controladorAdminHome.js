adminMiApp.controller('controlAdminHome',function($scope,$rootScope,$http,$location,$window,$state,$cookies){
		
	$scope.empleado = $cookies.get('dataAdminSession');

	$scope.logOut = function() {
		$cookies.remove('tokenAdminSession');
		$cookies.remove('dataAdminSession');
		$window.location.reload();
	}

    //Para cerrar el navBar//

    $(document).on('click', '.navbar-collapse a:not(.dropdown-toggle)', function() {
    	$(this).closest(".navbar-collapse").collapse('hide');
	});

	$(document).on('click', '.navbar-collapse button:not(.navbar-toggle)', function() {
    	$(this).closest(".navbar-collapse").collapse('hide');
	});

	//Para cerrar el navBar//

});
 