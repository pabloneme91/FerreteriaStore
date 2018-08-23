miapp.controller('controlUsuario',function($scope,$rootScope,$http,$state,$window,$modalService,$spinnerService,$errorService,$popupService,
  $changeStateService){
    
  $scope.sesion = $window.localStorage.getItem('session');

                                      /*Funciones vista datos de usuario*/

  var traerCliente = function() {
    var objReq = {
      params : {
        Token : $window.localStorage.getItem('session')
      }
    }
    $spinnerService.cargandoVista();
    $http.get('http://ferreteriadv.hopto.org/clientes/idClientes',objReq)
    .then(cliente => {
      $spinnerService.esconder();
      $scope.cliente = cliente.data;
    },
    err =>{
      $errorService.mostrarError(err,$scope)      
    })
  }  

  
  $scope.guardar = function() {
    var objReq = {
      Telefono : $scope.cliente.Telefono,
      Mail : $scope.cliente.Mail,
      Contrasenia : $scope.contrasenia,
      Token : $window.localStorage.getItem('session')
    }

    $spinnerService.mostrar('Enviando..');
    $http.put('http://ferreteriadv.hopto.org/clientes',objReq)
    .then(cliente => {
      $spinnerService.esconder();
      mensaje = "Se modificaron correctamente los datos";
      mostrarPopup(mensaje);
      traerCliente();
    },
    err =>{
      $errorService.mostrarError(err,$scope)  
    })
  }  

  $scope.verDeuda = function() {
    var objReq = {
      params : {
        Estado : 'CC',
        offset : 0,
        limite : null, 
        Token : $window.localStorage.getItem('session')
      }
    }

    $spinnerService.mostrar('Cargando..');
    $http.get('http://ferreteriadv.hopto.org/facturas/cliente',objReq)
    .then(facturas =>{
      $spinnerService.esconder();
      $scope.facturas = facturas.data.rows;
      sumarDeudaFacturas();
      mostrarModalDeuda();
    },
    err =>{
      $errorService.mostrarError(err,$scope)  
    })
  }

  var sumarDeudaFacturas = function(){
    $scope.totalFacturas = 0;
    angular.forEach($scope.facturas,factura =>{
      $scope.totalFacturas += factura.Total;
    });
  }

  $scope.verDetalle = function(_idFactura,index) {
    objReq = {
      params : {
        idFactura : _idFactura,
        Token : $window.localStorage.getItem('session')
      }
    }
    $spinnerService.cargandoVista();
    $http.get('http://ferreteriadv.hopto.org/detalle/idFactura',objReq)
    .then(detalles =>{
      $spinnerService.esconder();
      $scope.indexFactura = index;
      $scope.auxDetalles = detalles.data;
      mostrarModalDetalleFactura();
    },
    err =>{
      $errorService.mostrarError(err,$scope)  
    })
  }    

  mostrarModalDeuda = function() {
    template = 'vistas/templateDeuda.html';
    $modalService.mostrar(template,$scope)
  }

  mostrarModalDetalleFactura = function() {
    template = 'vistas/templateDetalleFactura.html';
    $modalService.mostrar(template,$scope)
  }

    
  $scope.logOut = function() {
    $window.localStorage.removeItem('session')
    var data = {};
    data.token = null;
    $rootScope.$broadcast('user.login', data);
    $changeStateService.cambiarVista('home',0)
  }

  var mostrarPopup = function(_mensaje) {
    var titulo = 'Usuario';
    var mensaje = _mensaje;
    var botones = [{ 
      text: 'Cerrar',
      type : 'button-balanced'
    }];
    $popupService.alertaAutoClose(titulo,mensaje,botones,$scope);
  }


                                        /*Fin funciones vista datos de usuario*/

                                        /*Funciones vista login*/

  $scope.login = function () {
    $spinnerService.mostrar('Iniciando..');
    $http.post('http://ferreteriadv.hopto.org/login',$scope.usuario)
    .then(datos =>{
      $spinnerService.esconder();
      datos.data.token = 'session=' + datos.data.token;
      $window.localStorage.setItem('session',datos.data.token)
      $rootScope.$broadcast('user.login', datos.data);
      $changeStateService.cambiarVista('home',0)
    },
    err =>{
      $errorService.mostrarError(err,$scope)  
    });
  };

                                        /*Fin funciones vista login*/
  if($scope.sesion)
    traerCliente();

});
 