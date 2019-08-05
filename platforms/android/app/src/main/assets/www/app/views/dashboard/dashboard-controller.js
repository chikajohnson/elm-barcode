(function () {
  "use strict";
  angular.module("app").controller("dashboardCtrl", ["sharedSvc", "$state", "toastr", "authService", function (sharedSvc, $state, toastr, authService) {

    // alert("entered dashboard")

    var vm = this;
    vm.job = {};
    vm.isBusy = true;
    //$rootScope.userJob = {};

    const user = sharedSvc.getStorage('UserID');
    var userTaskRepository = sharedSvc.initialize('api/userjob/' + user);
    userTaskRepository.get(function (response) {
      // alert("read user task")
      console.log(response);
      vm.job = response;
      // $rootScope.userJob = response;
      sharedSvc.createStorageParam("AllUserJob", response);
      vm.isBusy = false;
      // alert("stored user jobs in LS");
    });


    vm.navigateTo = function (path, count) {
      if (count === undefined || count <= 0) {
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