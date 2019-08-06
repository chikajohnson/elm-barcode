(function () {
  "use strict";
  angular.module("app").controller("supGoodRecieptViewCtrl", ["sharedSvc", "$state", "toastr", function (sharedSvc, $state, toastr) {

    var vm = this;
    vm.currentDocNo = null;
    vm.tasks = [];
    vm.receipt = null;
    vm.isBusy = false;
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.ReceiptModel) {
      // alert("receipt model exists");
      vm.receipt = supervisorJob.ReceiptModel;
      if ((vm.receipt !== undefined || vm.receipt !== null) && vm.receipt.GoodsReceiveNoteDetailTask !== undefined) {
        vm.tasks = vm.receipt.GoodsReceiveNoteDetailTask;
        if (vm.tasks.length > 0) {
          var receipts = vm.receipt.GoodReceiveNotes.filter(function (item) {
            return item.ID === vm.tasks[0].GoodReceiveNoteID;
          })

          if (receipts.length > 0) {
            vm.currentDocNo = receipts[0].DocumentNo;
          }
        } 
        else{
          toastr.error("This document has no tasks attached");
          $state.go('supervisor.goodreciepts');
        }
        
      }
    }

    vm.confirm = function (doc) {
      // alert("rabout to confirm");
      swal({
        type: 'warning',
        text: 'Are you sure you want to confirm this document?',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#0f9e8f',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        vm.isBusy = true;
        confirm(doc);
      }, function () {
        //$state.go('index.dashboard') 
      });
    };

    vm.RejectJob = function (doc) {
      swal({
        type: 'warning',
        text: 'Are you sure you want to reject this job?',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Reject Job',
        confirmButtonColor: '#0f9e8f',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        rejectJob(doc);
      }, function () {
        return;
      });
    };


    function confirm(docNo) {
      var confirmTaskRepository = sharedSvc.initialize('api/userjob/confirm/' + sharedSvc.getStorage("UserID") + "/" + docNo);
      // alert("confirming");
      confirmTaskRepository.update({}, {}, function (response) {
        // alert("confirmed");
       
        vm.formData = {};
        $state.go('supervisor.dashboard');
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        if (error.data) {
          toastr.error(error.data.Message);
        }
        else{
          toastr.error("Failed to submit document, try again later");
        }
      })
    }

    function rejectJob(docNo) {
      var supervisorTaskRepository = sharedSvc.initialize('api/userjob/endjob/' + sharedSvc.getStorage("UserID") + "/" + docNo);
      supervisorTaskRepository.update({}, {}, function (response) {

        toastr.success("Job rejected successfully")
        $state.go('index.dashboard')
      }, function (error) {
        toastr.error("Failed to reject job.")
      })
    }
  }]);

})()