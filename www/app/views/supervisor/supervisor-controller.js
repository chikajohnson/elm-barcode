(function () {
  "use strict";
  angular.module("app").controller("supDashboardCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", "authService", function (sharedSvc, $state, $rootScope, toastr, authService) {

    var vm = this;
    vm.job = {};
    $rootScope.userJob = {};

    // alert("dashboard");
    const user = sharedSvc.getStorage('UserID');
    var userTaskRepository = sharedSvc.initialize('api/userjob/' + user);
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

    // vm.startJob = function (receipt) {
    //   var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + receipt.DocumentNo);
    //   userTaskRepository.update({}, {}, function (response) {
    //     vm.isBusy = false;
    //     vm.isBusy2 = false;
    //     vm.formData = {};

    //     let savedReceipt = sharedSvc.getStorage("UserJob");
    //     if (savedReceipt === null || savedReceipt === undefined) { // there's no receipt
    //       sharedSvc.createStorageParam("UserJob", { startedDocs: [receipt.DocumentNo], currentDoc: receipt.DocumentNo });
    //     }
    //     else if (savedReceipt.startedDocs) {
    //       let exists = savedReceipt.startedDocs.includes(receipt.DocumentNo);
    //       if (!exists) {
    //         savedReceipt.startedDocs.push(receipt.DocumentNo);
    //       }
    //       savedReceipt.currentDoc = receipt.DocumentNo;
    //       sharedSvc.createStorageParam("UserJob", savedReceipt);
    //     }

    //     $rootScope.goodReceipt = receipt;
    //     $state.go('main.goodreciept-new');
    //     toastr.success(response.message);
    //   }, function (error) {
    //     vm.isBusy = false;
    //     vm.isBusy2 = false;
    //   })

    // }

  }]);
  angular.module("app").controller("supGoodRecieptViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.currentDoc = null;
    vm.task = {};
    var userTaskRepository = sharedSvc.initialize('api/userjob/' + sharedSvc.getStorage("UserID"));
    vm.job = sharedSvc.getStorage('UserJob');

    if (vm.job && vm.job.jobs) {
      vm.currentDoc = vm.job.currentDoc;
      let result = vm.job.jobs.find(x => x.documentNo === vm.currentDoc);
      if (result !== undefined) {
        vm.task = result;
      }
      else {
        toastr.warning("You have not saved any task for doccument:  " + vm.currentDoc);
        $state.go('main.goodreciepts');
      }
    }
    else {
      $state.go('main.goodreciepts');
    }

    vm.submit = function () {
      swal({
        type: 'warning',
        text: 'Are you sure you want to submit this document?',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Submit',
        confirmButtonColor: '#0f9e8f',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        submitTasks();
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



    function submitTasks() {
      let job = sharedSvc.getStorage("UserJob");
      let userJob = null;
      if (job && job.jobs) {
        userJob = job.jobs.find(x => x.documentNo === vm.currentDoc);
      }
      userJob.PalletDetailModel = userJob.tasks;
      userTaskRepository.save({}, userJob, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};
        $state.go('main.success')
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        toastr.error("failed to submit job");
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