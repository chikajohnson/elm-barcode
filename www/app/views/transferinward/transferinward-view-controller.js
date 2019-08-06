(function () {
  "use strict";
  angular.module("app").controller("transferInwardViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    // alert("inside TRF View");
    var vm = this;
    vm.currentDoc = null;
    vm.task = {};
    var userTaskRepository = sharedSvc.initialize('api/userjob/' + sharedSvc.getStorage("UserID"));
    vm.job = sharedSvc.getStorage('UserJob');
    vm.errorPallettes = [];
    vm.invalidPallettes = [];
    vm.countedPallettes = [];
    vm.isBusy = false;
    vm.isBusy2 = false;

    if (vm.job && vm.job.jobs) {
      // alert("filtered jobs");
      vm.currentDoc = vm.job.currentDoc;
      var results = vm.job.jobs.filter(function (x) {
        return x.documentNo === vm.currentDoc;
      })

      if (results.length > 0) {
        vm.task = results[0];
      }
    }
    else {
      $state.go('main.transferinwards');
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
        vm.isBusy = true;
        submitTasks();
      }, function () {
        vm.isBusy = false;
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
        vm.isBusy2 = true;
        endJob(doc);
      }, function () {
        vm.isBusy2 = false;
        return;
      });
    };

    vm.deleteTask = function (lotNo) {
      swal({
        type: 'error',
        html: 'Are you sure you want to delete this task with lot number ' + lotNo,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Delete',
        confirmButtonColor: 'red',
        // cancelButtonColor: '#FF7518',
        closeOnConfirm: true,
        closeOnCancel: true
      }).then(function () {
        if (lotNo !== undefined || lotNo !== null) {
          var tasks = vm.task.tasks.filter(function (x) {
            return x.lotNo !== lotNo
          });

          vm.job.jobs.forEach(function (elem) {
            if (elem.documentNo === vm.currentDoc) {
              elem.tasks = tasks
            }
          });

          sharedSvc.createStorageParam("UserJob", vm.job);
          toastr.success("Task deleted successfully");
        }

        return;
      }, function () {
        return;
      });
    };

    vm.editTask = function (lotNo) {
      vm.job.currentTask = lotNo;
      sharedSvc.createStorageParam("UserJob", vm.job);
      $state.go('main.transferinward-edit');
    }


    function submitTasks() {
      var job = sharedSvc.getStorage("UserJob");
      var userJob = null;
      if (job && job.jobs) {
        userJob = job.jobs.filter(function (x) {
          return x.documentNo === vm.currentDoc;
        });
      }


      var taskModel = null;
      taskModel = userJob[0];
      taskModel.PalletDetailModel = taskModel.tasks;

      //attach serial no to tasks
      taskModel.PalletDetailModel.forEach(function (item, i) {
        item.SN = i + 1;
      });

      //filter out unsubmitted task
      taskModel.PalletDetailModel = taskModel.PalletDetailModel.filter(function (task) {
        return task.submitted === false;
      })

      if (taskModel.PalletDetailModel.length <= 0) {
        toastr.error("You have already submitted all your tasks. Consider ending this job");
        vm.isBusy = false;
        return;
      }

      userTaskRepository.save({}, taskModel, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        updateSubmittedTaskStatus();
        sharedSvc.createStorageParam("UserJob", vm.job);
        toastr.success("Task  ubmitted successfully");
        $state.reload();

      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        extractErrorPalletes(error.data);
      })
    }

    function updateSubmittedTaskStatus() {
      vm.job.jobs.forEach(function (job) {
        if (job.documentNo === vm.job.currentDoc) {
          job.tasks.forEach(function (task) {
            if (vm.errorPallettes.indexOf(task.lotNo) === -1) {
              task.submitted = true;
            }
          });
        }
      });
    }


    function extractErrorPalletes(data) {
      vm.invalidPallettes = []; vm.countedPallettes = []; vm.errorPallettes = [];
      if (data && data.result) {
        data.result.forEach(function (item) {
          if (item.Status === 'invalid') {
            vm.invalidPallettes.push(item.PalletDetailModel.PalletteNo);
          }
          else if (item.Status === 'counted') {
            vm.countedPallettes.push(item.PalletDetailModel.PalletteNo);
          }
          vm.errorPallettes.push(item.PalletDetailModel.PalletteNo);
        });
      }

      if(vm.invalidPallettes.length > 0){
        var pallettes = vm.invalidPallettes.join(", ");
        toastr.error("Invalid pallete(s) " + pallettes );
      }
      
      if(vm.countedPallettes.length > 0){
        var pallettes = vm.invalidPallettes.join(", ");
        toastr.error(" Pallete(s) " + pallettes  + " have been counted");
      }
    }


    function endJob(docNo) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/endjob/' + sharedSvc.getStorage("UserID") + "/" + docNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        var remainingJobs = vm.job.jobs.filter(function (x) {
          return x.documentNo !== docNo
        });
        if (remainingJobs.length <= 0) {
          var currentStartedDocs = vm.job.startedDocs.filter(function (x) {
            return x !== docNo;
          });

          if (currentStartedDocs.length === 0) {
            delete vm.job.startedDocs;
            delete vm.job.currentDoc;
            delete vm.job.currentTask;
          }
          if (remainingJobs.length === 0) {
            delete vm.job.jobs;
          }
          sharedSvc.createStorageParam("UserJob", vm.job);
        }

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