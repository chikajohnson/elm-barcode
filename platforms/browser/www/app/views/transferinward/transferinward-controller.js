(function () {
  "use strict";
  angular.module("app").controller("transferInwardListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.transferInwards = [];
    vm.startedDocs = [];


    let job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      vm.startedDocs = job.startedDocs;
    }

    if ($rootScope.userJob === null || $rootScope.userJob === undefined || $rootScope.userJob === '') {
      $state.go('index.dashboard');
    }

    if ($rootScope.userJob != null) {
      vm.transferInwards = $rootScope.userJob.TransferInwardModel;
    }

    vm.startJob = function (inward) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + inward.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        let savedReceipt = sharedSvc.getStorage("UserJob");
        if (savedReceipt === null || savedReceipt === undefined) { // there's no inward
          sharedSvc.createStorageParam("UserJob", { startedDocs: [inward.DocumentNo], currentDoc: inward.DocumentNo });
        }
        else if (savedReceipt.startedDocs) {
          let exists = savedReceipt.startedDocs.includes(inward.DocumentNo);
          if (!exists) {
            savedReceipt.startedDocs.push(inward.DocumentNo);
          }
          savedReceipt.currentDoc = inward.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedReceipt);
        }
        else{
          sharedSvc.createStorageParam("UserJob", { startedDocs: [inward.DocumentNo], currentDoc: inward.DocumentNo });

        }

        $rootScope.tranferInward = inward;
        $state.go('main.transferinward-new');
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);

  angular.module("app").controller("transferInwardViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

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
        $state.go('main.transferinwards');
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
            delete vm.job.currentDoc;
          }
          if (remainingJobs.length === 0) {
              delete vm.job.jobs;
          }
          sharedSvc.createStorageParam("UserJob", vm.job);
        }

        // $rootScope.userJob.TransferInwardModel.GoodTransferInwards = $rootScope.userJob.TransferInwardModel.GoodTransferInwards.filter(x => x.DocumentNo !== docNo);
        toastr.success("Job ended successfully")
        $state.go('index.dashboard')
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        toastr.error("Failed to end job.")
      })
    }

  }]);

  angular.module("app").controller("transferInwardNewCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr", "barcodeService", function (sharedSvc, $state, $scope, $rootScope, toastr, barcodeService) {
    var vm = this;
    vm.formData = {};
    vm.products = [];
    vm.batches = [];
    vm.productMeasures = [];
    vm.stockStates = [];
    vm.browserMode = true;
    vm.mobilePlatform = false;
    vm.tranferInward = $rootScope.tranferInward;
    vm.savedTasks = {};
    vm.currentDoc = null;

    let clientId = sharedSvc.getStorage('theclient');
    let depotCode = sharedSvc.getStorage('thedepot');
    var stockStateRepository = sharedSvc.initialize('api/stockstates/' + clientId + "/" + depotCode);

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

    getProductInfo(vm.tranferInward);

    $rootScope.$on('BarcodeCaptured', function (evt, data) {
      $scope.$watch("vm.formData.lotNo", function (newVal, oldVal) {
        if (newVal !== oldVal) {
          vm.formData.lotNo = "";
        }
        vm.formData.lotNo = data;
      })
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


    vm.save = function (data) {
      let task = sharedSvc.getStorage('UserJob');

      if (Object.keys(vm.formData).length === 0) {
        toastr.error("You cannot save an empty task.");
        return;
      }

      //get good inward note detail from which the pallet comes from
      let noteDetail = vm.tranferInward.GoodTransferInwardDetails.find((x) => {
        return x.ProductID === vm.formData.productID && x.BatchID === vm.formData.batchID
          && x.ReceivedQtyMeasurementUnit === vm.formData.receivedQtyMeasurementUnit
      })

      vm.formData = {
        ...vm.formData,
        documentNo: vm.tranferInward.DocumentNo,
        detailID: noteDetail.ID,
        parentID: noteDetail.GoodTransferInwardID,
        status: "Pending",
        palletteNo: vm.formData.lotNo,
        donorID: noteDetail.DonoID,
        serialNoEnd: noteDetail.SerialNoEnd,
        serialNoStart: noteDetail.SerialNoStart,
        userID: sharedSvc.getStorage("UserID")
      };

      if (task === null || task === undefined) { // user does not have a task already
        let job = {
          tasks: [vm.formData],
          documentNo: vm.tranferInward.DocumentNo,
          status: "pending",
          type: "inward",
          userID: sharedSvc.getStorage("UserID")
        };
        task.jobs = [];
        task.jobs.push(job);
      } else {
        if (task.jobs === undefined || task.jobs === null) {  // there's no job already
          let job = {
            tasks: [vm.formData],
            documentNo: vm.tranferInward.DocumentNo,
            status: "pending",
            type: "inward",
            userID: sharedSvc.getStorage("UserID")
          };
          task.jobs = [];
          task.jobs.push(job);
        }
        else if (task.jobs && task.jobs.length > 0) {
          let currentJob = task.jobs.find(x => x.type === 'inward' && x.documentNo == vm.tranferInward.DocumentNo);
          if (currentJob === undefined) {  // this particular document is not among the documents started
            let job = {
              tasks: [vm.formData],
              documentNo: vm.tranferInward.DocumentNo,
              status: "pending",
              type: "inward",
              userID: sharedSvc.getStorage("UserID")
            };
            task.jobs.push(job);
          }
          else {   // this particular document is among the documents already started
            let currentIndex = task.jobs.findIndex(x => x.type === 'inward' && x.documentNo == vm.tranferInward.DocumentNo);
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
      // $state.go("main.transferinward-view");
      $state.reload();
      toastr.success("save successfully")
    };

    //extract produts, measures and batches from inward
    function getProductInfo(inward) {
      if (inward === undefined || inward === null || inward === '') {
        $state.go('index.dashboard');
      } else {
        let product, batch, measure = {}
        inward.GoodTransferInwardDetails.map((prod) => {
          product = {
            ProductID: prod.ProductID,
            ProductName: prod.ProductName,
            ProductUniqueID: prod.ProductUniqueID
          }
          vm.products.push(product);

          let batchExists = vm.batches.find(x => x.BatchID == prod.BatchID);
          if (batchExists === undefined) {
            batch = {
              BatchID: prod.BatchID,
              BatchManufaturingDate: prod.BatchManufaturingDate,
              BatchExpiringDate: prod.BatchExpiringDate,
              ProductID: prod.ProductID
            }
            vm.batches.push(batch);
          }

          let measureExists = vm.productMeasures.find(x => x.ReceivedQtyMeasurementUnit == prod.ReceivedQtyMeasurementUnit);
          if (measureExists === undefined) {
            measure = {
              MeasurementID: prod.ReceivedQtyMeasurementUnit,
              MeasurementName: prod.ReceivedQtyMeasurementUnit,
              BillQtyMeasurementUnit: prod.BillQtyMeasurementUnit,
              BillQtyMeasurementUnitDescription: prod.BillQtyMeasurementUnitDescription,
              ReceivedQuantity: prod.ReceivedQuantity,
              ReceivedQtyMeasurementUnit: prod.ReceivedQtyMeasurementUnit,
              ReceivedQtyMeasurementUnitDescription: prod.ReceivedQtyMeasurementUnitDescription,
              ProductID: prod.ProductID
            }
            vm.productMeasures.push(measure);
          }
        })
      }
    }
    vm.setSelectedProduct = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.productID = item.ProductID;
        vm.formData.productName = item.ProductName;
        vm.formData.productUniqueID = item.ProductUniqueID;

        vm.batches = vm.batches.filter(x => x.ProductID === item.ProductID);
        vm.productMeasures = vm.productMeasures.filter(x => x.ProductID === item.ProductID);
      }
    }

    vm.setSelectedStockState = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.stockStateName = item.StockStateCode;
        vm.formData.stockStateID = item.ID;
        vm.formData.stockState = item.ID;
      }
    }

    vm.setSelectedBatch = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.batchID = item.BatchID;
        vm.formData.batchExpiringDate = item.BatchExpiringDate;
        vm.formData.batchManufaturingDate = item.BatchManufaturingDate;
      }
    }

    vm.setSelectedMeasure = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.measurementID = item.MeasurementID;
        vm.formData.measurementName = item.MeasurementID;
        vm.formData.receivedQtyMeasurementUnit = item.ReceivedQtyMeasurementUnit;
        vm.formData.receivedQtyMeasurementDescription = item.ReceivedQtyMeasurementDescription;
      }
    }

    

  }]);
})()