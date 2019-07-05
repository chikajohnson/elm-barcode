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


    vm.logOut = function () {
      authService.logOut();
      $state.go('access.login');
    }

  }]);
})()