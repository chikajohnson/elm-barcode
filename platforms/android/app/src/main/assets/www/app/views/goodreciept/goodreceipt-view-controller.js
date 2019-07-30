  (function(){
    "use strict";
    angular.module("app").controller("goodRecieptViewCtrl", ["sharedSvc", "$state", "toastr", function (sharedSvc, $state, toastr) {

      // alert("inside GR View");
      var vm = this;
      vm.currentDoc = null;
      vm.task = {};
      var userTaskRepository = sharedSvc.initialize('api/userjob/' + sharedSvc.getStorage("UserID"));
      vm.job = sharedSvc.getStorage('UserJob');
  
      if (vm.job && vm.job.jobs) {
        // alert("filtered jobs");
        vm.currentDoc = vm.job.currentDoc;
        var results = vm.job.jobs.filter(function (x) {
          return x.documentNo === vm.currentDoc;
        })
  
        if (results.length > 0) {
          vm.task = results[0];
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
          html: 'Are you sure you want to delete this task with lot number ' +   lotNo ,
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
        taskModel.PalletDetailModel.forEach(function(item, i){
          item.SN = i + 1;
        });
        
        userTaskRepository.save({}, taskModel, function (response) {
          vm.isBusy = false;
          vm.isBusy2 = false;
          vm.formData = {};
  
          var remainingJobs = vm.job.jobs.filter(function(x) {
            return x.documentNo !== vm.currentDoc;
          });
  
          if (remainingJobs.length <= 0) {
            var currentStartedDocs = vm.job.startedDocs.filter(function(x) {
              return x !== vm.currentDoc;
            })
  
            // if (currentStartedDocs.length === 0) {
            //   // delete vm.job.startedDocs;
            //   // delete vm.job.currentDoc;
            // }
            // if (remainingJobs.length === 0) {
            //   // delete vm.job.jobs;
            // }
            sharedSvc.createStorageParam("UserJob", vm.job);
          }
  
          // $state.go('index.dashboard')
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
  
          var remainingJobs = vm.job.jobs.filter(function(x){
            return  x.documentNo !== docNo
          });
          if (remainingJobs.length <= 0) {
            var currentStartedDocs = vm.job.startedDocs.filter(function(x){
              return   x !== docNo;
            });
  
            if (currentStartedDocs.length === 0) {
              delete vm.job.startedDocs;
              delete vm.job.currentDoc;
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