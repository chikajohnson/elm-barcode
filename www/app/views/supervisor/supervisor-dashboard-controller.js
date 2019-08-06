(function () {
  "use strict";
  angular.module("app").controller("supDashboardCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", "authService", function (sharedSvc, $state, $rootScope, toastr, authService) {

    var vm = this;
    vm.job = {};

    // alert(" sup dashboard");
    const user = sharedSvc.getStorage('UserID');
    var userTaskRepository = sharedSvc.initialize('api/userjob/supervisor/' + user);
    userTaskRepository.get(function (response) {
      vm.job = response;
      console.log(vm.job);
      sharedSvc.createStorageParam('SupervisorJob', response);
    });


    vm.navigateTo = function(path, count){
      if ( count === undefined || count <= 0) {
        toastr.warning("There are no completed jobs of this type.")
        return;
      }
      $state.go(path);
    }

    vm.logOut = function () {
      authService.logOut();
      $state.go('access.login');
    }

  }]);
})()