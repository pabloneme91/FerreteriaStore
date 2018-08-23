miapp.controller('controlConsulta',function($scope,$http,$state,$window,$productService,$popupService,
  $spinnerService,$errorService,$cordovaFileTransfer,$ionicPlatform,$camaraService,$changeStateService,
  $q){

  $scope.sesion = $window.localStorage.getItem('session');


  $scope.traerProductos = function(query) {
    return $productService.traerProductos(query);
  }

  $scope.enviar = function() {
    $spinnerService.mostrar('Enviando...');
    if($scope.imagen) {
      postConFoto()
    }
    else {
      postSinFoto()
      .then(result => {
        var mensaje = "La consulta se envio correctamente";
        mostrarPopup(mensaje)
      }, 
      err => { 
        var error = {};
        error.data = {};
        error.status = err.http_status || -1;
        error.data.message = err.body; 
        $errorService.mostrarError(error,$scope)
      })       
    }
  }


  var postConFoto = function() {
    $ionicPlatform.ready(() => {
      options = {
        fileKey: "file",
        fileName: $scope.imagen.fileName,
        chunkedMode: false,
        mimeType: "image/*",
      }

      _idProductos = $scope.selectProducto
      
      var headers ={'cookie': $window.localStorage.getItem('session')};
      var parametros = {};
      parametros.idProductos = _idProductos;
      parametros.Contenido = $scope.descripcion;

      options.headers = headers;
      options.params = parametros;

      console.log(JSON.stringify(options,null,2));
      console.log(JSON.stringify($scope.image,null,2));
      $cordovaFileTransfer.upload("http://ferreteriadv.hopto.org/consulta/mobile/foto", $scope.imagen, options)
      .then(result => {
        var mensaje = "La consulta se envio correctamente";
        mostrarPopup(mensaje)
      }, 
      err => { 
        $spinnerService.esconder();
        console.log('Error' + JSON.stringify(err,null,2));
        var error = {};
        error.data = {};
        error.status = err.http_status || -1;
        error.data.message = err.body; 
        $errorService.mostrarError(error,$scope)
      }) 
    })    
  }  


  var postSinFoto = function() {
    var objReq = {
        idProductos : $scope.selectProducto,
        Contenido : $scope.descripcion,
        Token : $window.localStorage.getItem('session')
    }
    return $http.post('http://ferreteriadv.hopto.org/consulta/mobile',objReq)
  }


  $scope.tomarFoto = function () {
    $scope.verificarPermisos()
    .then(info =>{
      console.log(info)
      var options = {
        quality : 75,
        targetWidth: 200,
        targetHeight: 200,
        sourceType: 1,
        allowEdit : true,
        correctOrientation : true
      }
      $camaraService.getPicture(options).
      then(imagenSacada => {
         $scope.imagen = imagenSacada;;
      }, 
      err => {
        console.log('Error camara ' + JSON.stringify(err,null,2))
        if(!(err === 'Camera cancelled.'))
          $errorService.mostrarError(err,$scope)
      });
    })
    .catch(err =>{
      console.log(err)
    })
  }

  $scope.verificarPermisos = function() {
    return $q((resolve,reject) =>{
      if (ionic.Platform.version() >= 6) {
        console.log('version')
        
      var permissions = cordova.plugins.permissions;
      /*permissions.checkPermission(permissions.Ccamera,status  =>{
        if ( status.hasPermission ) {
          console.log("Yes :D ");
        }
        else {
          console.warn("No :( ");
        }

      });*/
      var permisos = [
        permissions.CAMERA,
        permissions.READ_EXTERNAL_STORAGE
      ];

      for(i = 0;i < permisos.length; i++){
        permissions.requestPermission(permisos[i], success, error);
          function error() {
            reject('Error1');
            console.warn('Camera permission is not turned on');
          }
          function success( status ) {
            console.log(JSON.stringify(status,null,2));
            if( !status.hasPermission ) {
              error();
            }
            else {
              resolve('ok')  
            }
          }
        }
      }
      else 
        resolve('ok')
      })
    }

  $scope.elegirImagen = function () {
    var options = {
       quality : 75,
       targetWidth: 200,
       targetHeight: 200,
       sourceType: 0,
       allowEdit : true,
       correctOrientation : true
    };
    $camaraService.getPicture(options)
    .then(imagenElegida =>  {
       $scope.imagen = imagenElegida;;
    }, 
    err => {
      $errorService.mostrarError(err,$scope)
    });
  }

  var mostrarPopup = function(mensaje) {
    $spinnerService.esconder();
    var botones = [{ 
      text: 'Cerrar',
      type : 'button-balanced'
    }];
    var template = mensaje;
    var templateUrl = null
    var titulo = 'Consulta enviada';
    $popupService.alerta(titulo,template,templateUrl,botones,$scope)
    .then(res =>{
      $changeStateService.cambiarVista('home',0);
    });
  }    

  $scope.cambiarEstado = function() {
    $changeStateService.cambiarVista('usuario',3);
  }

});
 