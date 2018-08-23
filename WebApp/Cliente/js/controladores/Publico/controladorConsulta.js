miapp.controller('controlConsulta', function($scope,$http,$cookies,$typeaheadService,$alertService,$errorService,$infoService){

    $scope.sesion = $cookies.get('session');

	$scope.traerProductos = function(_nombre) {
		return $typeaheadService.traerProductos(_nombre,$scope);
	}

    $scope.enviar = function() {
        $scope.cargando = 'Enviando';
        postDatos()
        .then(() =>{
            var mensaje = "La consulta se envio correctamente. La misma sera respondida a su mail a la brevedad";
            if($scope.foto) {
                postFoto()
                .then(()=>{
                    $infoService.mostrarInfo(mensaje,$scope);
                },
                err =>{
                    $errorService.mostrarError(err,$scope)
                })
            }
            else $infoService.mostrarInfo(mensaje,$scope);
        },
    	err =>{
    		$errorService.mostrarError(err,$scope)
    	})
    }

    var postDatos = function() {
        var _idProductos = null;
        if($scope.selectProducto) 
            _idProductos = $scope.selectProducto.idProductos
        
        var objReq = {
            idProductos : _idProductos,
            Contenido : $scope.descripcion,
            captcha : grecaptcha.getResponse(),
        }
        return $http.post('http://ferreteriadelvalle.hopstop.net/consulta',objReq)
    }


    var postFoto = function() {
        var file = $scope.foto;   
        var fd = new FormData();
        fd.append('file', file);
        return $http.post('http://ferreteriadelvalle.hopstop.net/consulta/foto',fd,{
            headers: {'Content-Type': undefined},
            transformRequest : angular.identity
        })
    }

    $scope.controlProducto = function() {
        if(!($scope.selectProducto && $scope.selectProducto.Nombre)) {
            $scope.selectProducto = undefined
        }
    }

    $scope.recargarCaptcha = function() {
        grecaptcha.reset();
    }    

})    


    

