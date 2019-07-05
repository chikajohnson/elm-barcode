 (function () {
    "use strict";
    angular.module("app").controller("dashboardCtrl", ["sharedSvc", "$state", "$rootScope", "toastr","authService", function (sharedSvc, $state, $rootScope, toastr, authService) {
 
      var vm = this;

      vm.logOut  =  function(){
         authService.logOut();
         $state.go('access.login');
      }    
    }]);     
  })()