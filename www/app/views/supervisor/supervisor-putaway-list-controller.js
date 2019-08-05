(function () {
  "use strict";
  angular.module("app").controller("supPutawayListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.putaways = [];
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.PutawayModel) {
      vm.putaways = supervisorJob.PutawayModel;
    }
  }]);
})()