adminMiApp.controller('controlProducto', function($scope,$http,$state,$servicioProductos,$modalService,$errorService,
	$alertService,$scrollService,$infoModalService){

	$scope.vista = $state.current.name
	var fotoNueva;

    var traerProductos = function() {
    	$scope.cargando = 'Cargando';
    	$servicioProductos.traerProductos()
		.then(productos =>{
			$scope.cargando = false;
			$scope.productos = productos.data;
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    $scope.changeProducto = function() {
    	$scope.auxProducto = JSON.stringify($scope.selectProducto);
    	$scope.auxProducto = JSON.parse($scope.auxProducto);
    }

	$scope.crearProducto = function(rubro) {
		$scope.cargando = 'Enviando';
        postDatos(rubro)
        .then((productoNuevo) =>{
            if($scope.producto.Foto) {
                postFoto()
                .then(()=>{
                    $scrollService.scroll('scrollTop');
					$scope.cargando = false;
					$alertService.showAlert('success','Se creo correctamente el producto : ' + productoNuevo.data.Nombre,3,$scope);      
					limpiarCampos();
                },
                err =>{
                	$errorService.mostrarError(err,$scope)
                })
            }
            else {
            	$scrollService.scroll('scrollTop');
				$scope.cargando = false;
				$alertService.showAlert('success','Se creo correctamente el producto : ' + productoNuevo.data.Nombre,3,$scope);      
				limpiarCampos();
            }
        },
    	err =>{
    		$errorService.mostrarError(err,$scope)
    	})
    }

    var postDatos = function(rubro) {
		var objReq = 
		{
			Nombre : $scope.producto.Nombre,
			Precio : $scope.producto.Precio,
			PrecioCosto : $scope.producto.PrecioCosto,
			Stock : $scope.producto.Stock,
			Descripcion : $scope.producto.Descripcion,
			idRubro : rubro.idSubRubro,
			Destacado : $scope.producto.Destacado,
			Oferta : $scope.producto.Oferta,
		};
		return $http.post('http://ferreteriadelvalle.hopstop.net/admin/productos',objReq)
    }


    var postFoto = function() {
        var file = $scope.producto.Foto;   
        var fd = new FormData();
        fd.append('file', file);
        return $http.post('http://ferreteriadelvalle.hopstop.net/admin/productos/foto',fd,{
            headers: {'Content-Type': undefined},
            transformRequest : angular.identity
        })
    }

    $scope.modificarProducto = function(productoModificado) {
    	$scope.cargando = 'Enviando';
    	modificarDatos()
    	.then(() =>{
	    	if($scope.auxProducto.Foto.name){
		    	modificarFoto()
		    	.then(() =>{
					actualizarDatos(productoModificado);    	
					actualizarVista(productoModificado);
				},
				err =>{
					$errorService.mostrarError(err,$scope)
				})	
	    	}
	    	else {
	    		actualizarDatos(productoModificado);    	
				actualizarVista(productoModificado);
	    	}
	    },
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

    var modificarDatos = function() {
    	var objReq = {
    		Nombre : $scope.auxProducto.Nombre,
			Precio : $scope.auxProducto.Precio,
			PrecioCosto : $scope.auxProducto.PrecioCosto,
			Stock : $scope.auxProducto.Stock,
			Descripcion : $scope.auxProducto.Descripcion,
			Destacado : $scope.auxProducto.Destacado,
			Oferta : $scope.auxProducto.Oferta,    		
    	}
    	return $http.put('http://ferreteriadelvalle.hopstop.net/admin/productos',$scope.auxProducto)
    }

    var modificarFoto = function() {
        var file = fotoNueva;  
        var fd = new FormData();
        fd.append('file', file);
        return $http.put('http://ferreteriadelvalle.hopstop.net/admin/productos/foto',fd,{
            headers: {'Content-Type': undefined},
            transformRequest : angular.identity
        })
    }    

    $scope.onFileSelect =function(file){
	    filename = $scope.auxProducto.idProductos + "." + file.name.split(".")[1];
	    var imgFile = new File([file], filename, {type:file.type});
	    fotoNueva = imgFile;
	};



    var actualizarDatos = function(productoModificado) {
		productoModificado.Nombre = $scope.auxProducto.Nombre
		productoModificado.Precio = $scope.auxProducto.Precio
		productoModificado.PrecioCosto = $scope.auxProducto.PrecioCosto
		productoModificado.Stock = $scope.auxProducto.Stock
		productoModificado.Descripcion = $scope.auxProducto.Descripcion
		productoModificado.Destacado = $scope.auxProducto.Destacado
		productoModificado.Oferta = $scope.auxProducto.Oferta
		
    }

    var actualizarVista = function(productoModificado) {
		$scope.cargando = false;	
		$scrollService.scroll('scrollTop');
		$alertService.showAlert('success','El producto \"' + productoModificado.Nombre + 
			'\" fue modificado correctamente',3,$scope);      
		limpiarCampos();    	
		
    }


    $scope.borrarProducto = function(index) {
    	objReq = {
    		params : {
    			idProductos : $scope.selectProducto.idProductos
    		}
    	} 
    	$scope.cargando = 'Borrando';
    	$http.delete('http://ferreteriadelvalle.hopstop.net/admin/productos',objReq)
		.then(() =>{
			$scope.cargando = false;
			$scrollService.scroll('scrollTop')
			$scope.productos.splice(index,1);
			$alertService.showAlert('success','Se borro el producto \"' + $scope.selectProducto.Nombre+'\"',3,$scope);      
			limpiarCampos();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }

	$scope.verUltimasVentas = function(producto) {
		var objReq = {
			params : {
				idProductos : producto.idProductos
			}
		}
    	$scope.cargando = 'Cargando';
    	$http.get('http://ferreteriadelvalle.hopstop.net/admin/facturas/producto',objReq)
		.then(facturas =>{
			$scope.cargando = false;
			$scope.transaccion = 'Ventas';
			$scope.facturas = facturas.data;
			mostrarModalUlitmasTransacciones();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }    

    /*Terminar Ultimas Compras*/

    $scope.verUltimasCompras = function(producto) {
		var objReq = {
			params : {
				idProductos : producto.idProductos
			}
		}
    	$scope.cargando = 'Cargando';
    	$http.get('http://ferreteriadelvalle.hopstop.net/admin/compras/producto',objReq)
		.then(compras =>{
			$scope.cargando = false;
			$scope.transaccion = 'Compras';
			$scope.facturas = compras.data;
			mostrarModalUlitmasTransacciones();
		},
		err =>{
			$errorService.mostrarError(err,$scope)
		})	
    }    

    var limpiarCampos = function () {
    	if($state.current.name === "verProductos") {
    		$scope.selectProducto = undefined;
	    	$scope.auxProducto = undefined;
    	}
    	else {
			$scope.selectProducto = undefined;
			$scope.producto = undefined;
			$scope.selectRubros = undefined;	
			$scope.selectSubRubros = undefined;	
    	}
    	
    }

    var mostrarModalUlitmasTransacciones = function() {
    	var template = 'templateUltimasTransacciones.html';
        $modalService.mostrar(template,$scope)
    }

    var mostrarModalVentas = function() {
    	var template = 'templateVerVenta.html';
    	$modalService.mostrar(template,$scope);
  	}

  	var mostrarModalCompras = function() {
    	var template = 'templateVerCompra.html';
    	$modalService.mostrar(template,$scope);
  	}

    //Funcion del Template UltimasVentas

    $scope.verDetalle = function(_idFactura,index) {
	    objReq = {
	      params : {
	        idFactura : _idFactura  
	      }
	    }
	    $scope.cargando = 'Cargando';
	    $http.get('http://ferreteriadelvalle.hopstop.net/admin/detalle/idFactura',objReq)
	    .then(detalles =>{
	      $scope.cargando = false;
	      $scope.indexFactura = index; //El template tira error si no esta esta variable declarada
	      $scope.auxDetalles = detalles.data;
	      mostrarModalVentas();
	    },
	    err =>{
	      $errorService.mostrarError(err,$scope)      
	    })
  	}

  	$scope.verLineasCompras = function(_idCompras,index) {
	    objReq = {
	      params : {
	        idCompras : _idCompras  
	      }
	    }
	    $scope.cargando = 'Cargando';
	    $http.get('http://ferreteriadelvalle.hopstop.net/admin/lineaCompras/idCompras',objReq)
	    .then(lineaCompras =>{
	      $scope.cargando = false;
	      $scope.indexCompras = index; //El template tira error si no esta esta variable declarada
	      $scope.auxLineaCompras = lineaCompras.data;
	      mostrarModalCompras();
	    },
	    err =>{
	      $errorService.mostrarError(err,$scope)      
	    })
  	}

  //Funcion del Template UltimasVentas

  	$scope.modalInfo = function() {
	    var pantalla = null
	    var mensaje = 'Si desea borrar el producto de esta factura debe hacerlo desde la pantalla \"Ver Ventas\", o en ' +
	    'caso de que la factura este asociada a un cliente desde la pantalla \"Cuenta de Clientes\"' ;
	    var rutaDestino = null
	    $infoModalService.mostrar(pantalla,mensaje,rutaDestino,$scope);
	}

	$scope.actualizarProductos = function() {
	    limpiarCampos();
	    traerProductos();
	}

    if($state.current.name === "verProductos") 
    	traerProductos();

});