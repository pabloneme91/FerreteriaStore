adminMiApp.controller('controlConsulta',function($scope,$http,$modalService,$alertService,$errorService,$scrollService,$anchorScroll){

  $scope.changeCliente = function() {
    traerConsulta();
  }

  var traerClientesConConsulta = function() {
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes/consulta')
    .then(clientes => {
      $scope.cargando = false;
      $scope.clientes = clientes.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }

  var traerConsulta = function() {
    var objReq = {
      params : {
        idClientes : $scope.selectClientes.cliente.idClientes
      }
    }
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/consulta/cliente',objReq)
    .then(consultas => {
      $scope.cargando = false;
      $scope.consultas = consultas.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }

  $scope.enviar = function() {
    var objReq = {
      consulta : $scope.selectConsultas,
      Respuesta : $scope.respuesta
    }

    $scope.cargando = 'Enviando';
    $http.post('http://ferreteriadelvalle.hopstop.net/admin/consulta/respuesta',objReq)
    .then(() => {
      $scope.cargando = false;
      $scrollService.scroll('scrollTop');
      $anchorScroll();
      $alertService.showAlert("success","La consulta fue respondida via e-mail exitosamente",3,$scope)
      limpiarCampos();
    },
    err =>{
      $errorService.mostrarError(err,$scope)
    })
  }

  var limpiarCampos = function (argument) {
    if($scope.consultas.length === 1) {
      traerClientesConConsulta();
    }
    $scope.selectClientes = undefined;
    $scope.consultas = undefined;
    $scope.selectConsultas = undefined;
    $scope.respuesta = undefined;
  }

  traerClientesConConsulta(); 
    
});



    
