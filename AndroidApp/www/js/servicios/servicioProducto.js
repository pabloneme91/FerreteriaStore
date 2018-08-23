miapp.factory('$productService', function ($http,$errorService) {
  return {
    traerProductos : function (query) {
      if(!(query === '')){
        var parametros = {
          params : {
            Nombre : query,
          }
        }
        return $http.get('http://ferreteriadv.hopto.org/productos/nombre', parametros)
        .then(productos =>{
          return productos.data
        },
        err =>{
          return {
            Nombre : 'Sin conexion'
          }
        })
      }
    }
  }  
});