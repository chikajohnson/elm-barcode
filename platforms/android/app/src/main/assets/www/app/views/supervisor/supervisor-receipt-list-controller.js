(function () {
  "use strict";
  angular.module("app").controller("supGoodRecieptListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.goodReceipts = []; 
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");    

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.ReceiptModel) {
      vm.goodReceipts = supervisorJob.ReceiptModel;
    }
  }]);
})()