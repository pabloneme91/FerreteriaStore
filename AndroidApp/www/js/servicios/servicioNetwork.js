miapp.factory('httpInterceptor',function ($q,$rootScope) {
  var canceller = $q.defer();
  return {
    'request': function(config) {
      config.timeout = 12000;
      return config;
    },
  };
});