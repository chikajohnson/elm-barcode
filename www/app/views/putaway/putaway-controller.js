(function () {
  "use strict";
  angular.module("app").controller("putawayListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.putaways = [];
    vm.startedDocs = [];
    vm.location = "";

    let job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      vm.startedDocs = job.startedDocs;
    }

    if ($rootScope.userJob === null || $rootScope.userJob === undefined || $rootScope.userJob === '') {
      $state.go('index.dashboard');
    }

    if ($rootScope.userJob != null) {
      vm.putaways = $rootScope.userJob.PutawayModel;
    }

    vm.startJob = function (putaway) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + putaway.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        let savedPutaway = sharedSvc.getStorage("UserJob");
        if (savedPutaway === null || savedPutaway === undefined) { // there's no putaway
          sharedSvc.createStorageParam("UserJob", { startedDocs: [putaway.DocumentNo], currentDoc: putaway.DocumentNo });
        }
        else if (savedPutaway.startedDocs) {
          let exists = savedPutaway.startedDocs.includes(putaway.DocumentNo);
          if (!exists) {
            savedPutaway.startedDocs.push(putaway.DocumentNo);
          }
          savedPutaway.currentDoc = putaway.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedPutaway);
        }
        else {
          sharedSvc.createStorageParam("UserJob", { startedDocs: [putaway.DocumentNo], currentDoc: putaway.DocumentNo });
        }

        $rootScope.putaway = putaway;
        $state.go('main.putaway-new');
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);

  angular.module("app").controller("putawayViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

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
        $state.go('main.putaways');
      }
    }
    else {
      $state.go('main.putaways');
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

        toastr.success("Job ended successfully")
        $state.go('main.putaways')
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        toastr.error("Failed to end job.")
      })
    }

  }]);

  angular.module("app").controller("putawayNewCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr", "barcodeService", function (sharedSvc, $state, $scope, $rootScope, toastr, barcodeService) {
    var vm = this;
    vm.formData = {};
    vm.products = [];
    vm.batches = [];
    vm.productMeasures = [];
    vm.stockStates = [];
    vm.browserMode = true;
    vm.mobilePlatform = false;
    vm.putaway = $rootScope.putaway;
    vm.savedTasks = {};
    vm.currentDoc = null;
    vm.showDetail = false;

    let clientId = sharedSvc.getStorage('theclient');
    let depotCode = sharedSvc.getStorage('thedepot');
    var stockStateRepository = sharedSvc.initialize('api/stockstates/' + clientId + "/" + depotCode);

    if (vm.putaway === null || vm.putaway === undefined) {
      $state.go('main.putaways');
    }

    stockStateRepository.get(function (response) {
      vm.stockStates = response.result;
    });


    if (window.cordova) {
      barcodeService.loadBarcodeScanner();
      vm.mobilePlatform = true;
      vm.browserMode = false;
    } else {
      // alert("No cordova loaded");
    }

    $rootScope.$on('BarcodeCaptured', function (evt, data) {
      $scope.$watch("vm.formData.PalletteCode", function (newVal, oldVal) {
        if (newVal !== oldVal) {
          vm.formData.PalletteCode = "";
        }
        vm.formData.PalletteCode = data;
      });

      $scope.$watch("vm.formData.CellCode", function (newVal, oldVal) {
        if (newVal !== oldVal) {
          vm.formData.CellCode = "";
        }
        vm.formData.CellCode = data;
      });
      $scope.$apply();
    });


    const savesJob = sharedSvc.getStorage('UserJob');
    vm.currentDoc = savesJob.currentDoc;

    if (savesJob && savesJob.jobs) {
      let item = savesJob.jobs.find(x => x.documentNo === vm.currentDoc);
      if (item !== undefined) {
        vm.savedTasks = item.tasks;
      }
    }

    vm.toggleDetail = function () {
      vm.showDetail = !vm.showDetail;
    }


    vm.save = function (data) {
      let task = sharedSvc.getStorage('UserJob');

      if (Object.keys(vm.formData).length === 0) {
        toastr.error("You cannot save an empty task.");
        return;
      }

      //get  putaway note detail from which the pallet comes from
      let putawayDetail = vm.putaway.StockPutAwayDetails.find((x) => {
        return x.location === vm.formData.location && x.CellCode === vm.formData.CellCode
      })

      vm.formData = {
        ...vm.formData,
        documentNo: vm.putaway.DocumentNo,
        detailID: putawayDetail.ID,
        parentID: putawayDetail.StockPutAwayID,
        status: "Pending",
        location: vm.formData.location,
        cellCode: vm.formData.cellCode,
        palletteNo: vm.formData.lotNo,
        donorID: putawayDetail.DonoID,
        serialNoEnd: putawayDetail.SerialNoEnd,
        serialNoStart: putawayDetail.SerialNoStart,
        userID: sharedSvc.getStorage("UserID")
      };

      if (task === null || task === undefined) { // user does not have a task already
        let job = {
          tasks: [vm.formData],
          documentNo: vm.putaway.DocumentNo,
          status: "pending",
          type: "putaway",
          userID: sharedSvc.getStorage("UserID")
        };
        task.jobs = [];
        task.jobs.push(job);
      } else {
        if (task.jobs === undefined || task.jobs === null) {  // there's no job already
          let job = {
            tasks: [vm.formData],
            documentNo: vm.putaway.DocumentNo,
            status: "pending",
            type: "putaway",
            userID: sharedSvc.getStorage("UserID")
          };
          task.jobs = [];
          task.jobs.push(job);
        }
        else if (task.jobs && task.jobs.length > 0) {
          let currentJob = task.jobs.find(x => x.type === 'putaway' && x.documentNo == vm.putaway.DocumentNo);
          if (currentJob === undefined) {  // this particular document is not among the documents started
            let job = {
              tasks: [vm.formData],
              documentNo: vm.putaway.DocumentNo,
              status: "pending",
              type: "putaway",
              userID: sharedSvc.getStorage("UserID")
            };
            task.jobs.push(job);
          }
          else {   // this particular document is among the documents already started
            let currentIndex = task.jobs.findIndex(x => x.type === 'putaway' && x.documentNo == vm.putaway.DocumentNo);
            if (currentIndex !== -1) {
              let oldTaskList = currentJob.tasks;

              let lotIndex = oldTaskList.findIndex(x => x.lotNo === vm.formData.lotNo);
              if (lotIndex !== -1) {
                oldTaskList[lotIndex] = { ...oldTaskList[lotIndex], ...vm.formData };
                currentJob.tasks = [...oldTaskList]
              }
              else {
                currentJob.tasks = [...oldTaskList, vm.formData]
              }
              task.jobs[currentIndex] = currentJob;
            }
          }
        }
      }

      sharedSvc.createStorageParam('UserJob', task);
      $state.go("main.putaway-view");
      toastr.success("save successfully")
    };
  }]);
})()