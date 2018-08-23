adminMiApp.controller('controlCliente',function($scope,$http,$state,$window,$alertService,$errorService){

  
  $scope.traerClientesPorEstado = function(_estado) {
    var objReq = {
      params : {
        Estado : _estado
      }
    }
    $scope.Saldo = undefined; 
    cargarEstado(_estado);
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes/estado',objReq)
    .then(clientes => {
      $scope.cargando = false;
      $scope.clientes = clientes.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.changeCliente = function() {
    if($scope.selectClientes)
      $scope.Saldo = $scope.selectClientes.Saldo;
  }

  $scope.traerDeudores = function() {
    $scope.tipo = 'Deudores'
    $scope.cargando = 'Cargando';
    $http.get('http://ferreteriadelvalle.hopstop.net/admin/clientes/facturas/estado')
    .then(clientes => {
      $scope.cargando = false;
      $scope.clientes = clientes.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }
  
  $scope.cambiarEstado = function(_idClientes,_saldo,_estado) {
    objReq = {
      idClientes : _idClientes,
      Saldo : _saldo || 0,
      Estado : _estado 
    }

    $scope.cargando = 'Cargando';
    $http.put('http://ferreteriadelvalle.hopstop.net/admin/clientes/idCliente',objReq)
    .then(() => {
      $scope.cargando = false;
      if (_estado === 'A'){
        $alertService.showAlert('success','El cliente : ' + $scope.selectClientes.Apellido + ', ' + $scope.selectClientes.Nombre + " fue dado de alta",4,$scope);
        _estado = 'I'
      }
      else {
        $alertService.showAlert('success','El cliente : ' + $scope.selectClientes.Apellido + ', ' + $scope.selectClientes.Nombre + " fue dado de baja",4,$scope);
        _estado = 'A'
      }
      $scope.traerClientesPorEstado(_estado);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.borrar = function(_idClientes,_estado) {
    var objReq = {
      params : {
        idClientes : _idClientes,
      }
    }

    $scope.cargando = 'Borrando';
    $http.delete('http://ferreteriadelvalle.hopstop.net/admin/clientes/idCliente',objReq)
    .then(() =>{
      $scope.cargando = false;
      $alertService.showAlert('success','El cliente : ' + $scope.selectClientes.Apellido + ', ' + $scope.selectClientes.Nombre + 
        " fue eliminado",4,$scope);
      $scope.traerClientesPorEstado(_estado);
    },
    err =>{
      $errorService.mostrarError(err,$scope);
    })
  }

  $scope.traerTodos = function() {
    $scope.tipo = 'Activos'
    $scope.traerClientesPorEstado('A');
  }

  $scope.verDeuda = function() {
    $state.go('cuentaCliente',{cliente : $scope.selectClientes});
  }

  var cargarEstado = function(estado) {
    if(estado === 'A')
      $scope.estado = 'Activos'
    else $scope.estado = 'Inactivos'
  }

  if($state.current.name === "altaCliente")
    $scope.traerClientesPorEstado('I'); 
  else $scope.traerClientesPorEstado('A'); ;

  

});



    
