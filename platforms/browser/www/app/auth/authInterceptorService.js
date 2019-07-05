"use strict";
angular.module("app").factory("authInterceptorService", ["$q","$injector","$location", "$window",
  function($q, $injector, $location, $window) {
    var authInterceptorServiceFactory = {};

    var _request = function(config) {
      var storage = $injector.get('sharedSvc');

      config.headers = config.headers || {};
      var authData = storage.getStorage("authorizationData");
      if(authData === null){
        $window.location.href = "#/access/login";
      }

      if (authData) {
        config.headers.Authorization = "Bearer " + authData.token;
      }
      return config;
    };

    var _responseError = function(rejection) {
      if(rejection.status === -1){
        throw new Error('No network connection, try again later.');
       }
      else if (rejection.status === 401) {
        //$location.path('/login');
        $window.location.href = "#/access/login";
      }
      else if(rejection.status === 409){
        $window.location.href = "#/error/403";
      }
      return $q.reject(rejection);
    };

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
  }
]);
