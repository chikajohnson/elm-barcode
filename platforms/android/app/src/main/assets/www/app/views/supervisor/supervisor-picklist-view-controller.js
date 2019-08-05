(function () {
  "use strict";
  angular.module("app").controller("supPickListViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", "authService", function (sharedSvc, $state, $rootScope, toastr, authService) {

    var vm = this;
    vm.currentDocNo = null;
    vm.tasks = [];
    vm.picklist = null;
    var supervisorJob = sharedSvc.getStorage("SupervisorJob");

    if (!supervisorJob) {
      $state.go('supervisor.dashboard');
    }

    if (supervisorJob.ReleaseModel) {
      // alert("picklist model exists");
      vm.picklist = supervisorJob.ReleaseModel;
      if ((vm.picklist !== undefined || vm.picklist !== null) && vm.picklist.StockReleaseDetailTask !== undefined) {
        vm.tasks = vm.picklist.StockReleaseDetailTask;
        if (vm.tasks.length > 0) {
          var picklists = vm.picklist.StockReleases.filter(function (item) {
            return item.ID === vm.tasks[0].StockReleasesID;
          })

          if (picklists.length > 0) {
            vm.currentDocNo = picklists[0].DocumentNo;
          }
        } 
        else{
          toastr.error("This document has no tasks attached");
          $state.go('supervisor.picklists');
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
        if (error.data) {
          toastr.error(error.data.Message);
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