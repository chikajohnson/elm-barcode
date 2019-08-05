(function () {
  "use strict";
  angular.module("app").controller("supTransferInwardListCtrl", ["sharedSvc", "$state", "toastr", function (sharedSvc, $state, toastr) {

    var vm = this;
    vm.transferInwards = []; 
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");    

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.TransferInwardModel) {
      vm.transferInwards = supervisorJob.TransferInwardModel;
    }
  }]);
})()