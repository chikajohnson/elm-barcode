(function () {
  "use strict";
  angular.module("app").controller("supDashboardCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", "authService", function (sharedSvc, $state, $rootScope, toastr, authService) {

    var vm = this;
    vm.job = {};
    $rootScope.userJob = {};

    // alert("dashboard");
    const user = sharedSvc.getStorage('UserID');
    var userTaskRepository = sharedSvc.initialize('api/userjob/supervisor/' + user);
    userTaskRepository.get(function (response) {
      console.log(response);
      vm.job = response;
      $rootScope.userJob = response;
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
  angular.module("app").controller("supGoodRecieptListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.goodReceipts = [];
    vm.startedDocs = [];

    let job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      vm.startedDocs = job.startedDocs;
    }

    if ($rootScope.userJob === null || $rootScope.userJob === undefined || $rootScope.userJob === '') {
      $state.go('supervisor.dashboard');
    }

    if ($rootScope.userJob != null) {
      vm.goodReceipts = $rootScope.userJob.ReceiptModel;
    }

    // vm.showDetail = function(item){
    //   console.log($rootScope.userJob);
    // }

  }]);
  angular.module("app").controller("supGoodRecieptViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.currentDocNo = null;
    vm.tasks = [];
    
    if ($rootScope.userJob === null || $rootScope.userJob === undefined || $rootScope.userJob === '') {
      $state.go('supervisor.dashboard');
    }

    if ($rootScope.userJob != null) {
      vm.receipt = $rootScope.userJob.ReceiptModel;
      
      if((vm.receipt !== undefined || vm.receipt !== null) && vm.receipt.GoodsReceiveNoteDetailTask !== undefined){
        vm.tasks = vm.receipt.GoodsReceiveNoteDetailTask;
        let receipt = vm.receipt.GoodReceiveNotes.find(c => c.ID === vm.tasks[0].GoodReceiveNoteID)
        vm.currentDocNo = receipt.DocumentNo;
      }


    }

    vm.confirm = function (doc) {
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

    vm.endJob = function (doc) {
      swal({
        type: 'warning',
        text: 'Are you sure you want to end this job?',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'End Job',
        confirmButtonColor: '#0f9e8f',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        endJob(doc);
      }, function () {
        return;
      });
    };

    vm.deleteTask = function (lotNo) {
      swal({
        type: 'error',
        html: `<span>Are you sure you want to delete this task with lot number 
        <span class="text-dark font-weight-bolder bg-light">( ${lotNo})</span>?
        </span>`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete',
        confirmButtonColor: 'red',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        if (lotNo !== undefined || lotNo !== null) {
          let tasks = vm.task.tasks.filter((x) => x.lotNo !== lotNo);

          vm.job.jobs.map(x => {
            if (x.documentNo === vm.currentDoc) {
              x.tasks = tasks
            }
          })
          sharedSvc.createStorageParam("UserJob", vm.job);
          toastr.success("Task deleted successfully");
        }

        return;
      }, function () {
        return;
      });
    };



    function confirm(docNo) {
      let job = sharedSvc.getStorage("UserJob");
      let confirmTaskRepository = sharedSvc.initialize('api/userjob/confirm/' + sharedSvc.getStorage("UserID") + "/" + docNo);
      
      confirmTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};
        $state.go('supervisor.dahsboard');
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        if (error.data) {
          toastr.error(error.data.Message);
        }
      })
    }

    function endJob(docNo) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/endjob/' + sharedSvc.getStorage("UserID") + "/" + docNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        let remainingJobs = vm.job.jobs.filter(x => x.documentNo !== docNo);
        if (remainingJobs !== null || remainingJobs !== undefined) {
          let currentStartedDocs = vm.job.startedDocs.filter(x => x !== docNo);
          if (currentStartedDocs.length === 0) {
            delete vm.job.startedDocs;
          }
          if (remainingJobs.length === 0) {
              delete vm.job.jobs;
          }
          sharedSvc.createStorageParam("UserJob", vm.job);
        }

        // $rootScope.userJob.ReceiptModel.GoodReceiveNotes = $rootScope.userJob.ReceiptModel.GoodReceiveNotes.filter(x => x.DocumentNo !== docNo);
        toastr.success("Job ended successfully")
        $state.go('index.dashboard')
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        toastr.error("Failed to end job.")
      })
    }

  }]);

})()