(function () {
  "use strict";
  angular.module("app").controller("supPickListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.picklists = []; 
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");    

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.ReleaseModel) {
      vm.picklists = supervisorJob.ReleaseModel;
    }

  }]);
})()