(function () {
  "use strict";
  angular.module("app").controller("dashboardCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", "authService", function (sharedSvc, $state, $rootScope, toastr, authService) {

    var vm = this;
    vm.job = {};
    $rootScope.userJob = {};

    const user = sharedSvc.getStorage('UserID');
    var userTaskRepository = sharedSvc.initialize('api/userjob/' + user);
    userTaskRepository.get(function (response) {
      console.log(response);
      vm.job = response;
      $rootScope.userJob = response;
    });


    vm.navigateTo = function(path, count){
      if (count <= 0) {
        toastr.warning("This job has not been assigned to you yet!")
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