(function () {
  "use strict";
  angular.module("app").controller("goodRecieptListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.goodReceipts = [];
    vm.startedDocs = [];

    let job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      vm.startedDocs = job.startedDocs;
    }

    if ($rootScope.userJob === null || $rootScope.userJob === undefined || $rootScope.userJob === '') {
      $state.go('index.dashboard');
    }

    if ($rootScope.userJob != null) {
      vm.goodReceipts = $rootScope.userJob.ReceiptModel;
    }

    vm.startJob = function (receipt) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + receipt.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        let savedReceipt = sharedSvc.getStorage("UserJob");
        if (savedReceipt === null || savedReceipt === undefined) { // there's no receipt
          sharedSvc.createStorageParam("UserJob", { startedDocs: [receipt.DocumentNo], currentDoc: receipt.DocumentNo });
        }
        else if (savedReceipt.startedDocs) {
          let exists = savedReceipt.startedDocs.includes(receipt.DocumentNo);
          if (!exists) {
            savedReceipt.startedDocs.push(receipt.DocumentNo);
          }
          savedReceipt.currentDoc = receipt.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedReceipt);
        }

        $rootScope.goodReceipt = receipt;
        $state.go('main.goodreciept-new');
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);

  angular.module("app").controller("goodRecieptViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

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

  angular.module("app").controller("goodRecieptNewCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr", "barcodeService", function (sharedSvc, $state, $scope, $rootScope, toastr, barcodeService) {
    var vm = this;
    vm.formData = {};
    vm.products = [];
    vm.batches = [];
    vm.productMeasures = [];
    vm.stockStates = [];
    vm.browserMode = true;
    vm.mobilePlatform = false;
    vm.goodReceipt = $rootScope.goodReceipt;
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

    getProductInfo(vm.goodReceipt);

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

      //get goood receipt note detail from which the pallet comes from
      let noteDetail = vm.goodReceipt.GoodReceiveNoteDetails.find((x) => {
        return x.ProductID === vm.formData.productID && x.BatchID === vm.formData.batchID
          && x.ReceivedQtyMeasurementUnit === vm.formData.receivedQtyMeasurementUnit
      })

      vm.formData = {
        ...vm.formData,
        documentNo: vm.goodReceipt.DocumentNo,
        detailID: noteDetail.ID,
        parentID: noteDetail.GoodReceiveNoteID,
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
          documentNo: vm.goodReceipt.DocumentNo,
          status: "pending",
          type: "receipt",
          userID: sharedSvc.getStorage("UserID")
        };
        task.jobs = [];
        task.jobs.push(job);
      } else {
        if (task.jobs === undefined || task.jobs === null) {  // there's no job already
          let job = {
            tasks: [vm.formData],
            documentNo: vm.goodReceipt.DocumentNo,
            status: "pending",
            type: "receipt",
            userID: sharedSvc.getStorage("UserID")
          };
          task.jobs = [];
          task.jobs.push(job);
        }
        else if (task.jobs && task.jobs.length > 0) {
          let currentJob = task.jobs.find(x => x.type === 'receipt' && x.documentNo == vm.goodReceipt.DocumentNo);
          if (currentJob === undefined) {  // this particular document is not among the documents started
            let job = {
              tasks: [vm.formData],
              documentNo: vm.goodReceipt.DocumentNo,
              status: "pending",
              type: "receipt",
              userID: sharedSvc.getStorage("UserID")
            };
            task.jobs.push(job);
          }
          else {   // this particular document is among the documents already started
            let currentIndex = task.jobs.findIndex(x => x.type === 'receipt' && x.documentNo == vm.goodReceipt.DocumentNo);
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
      $state.go("main.goodreciept-view");
      toastr.success("save successfully")
    };

    //extract produts, measures and batches from receipt
    function getProductInfo(receipt) {
      if (receipt === undefined || receipt === null || receipt === '') {
        $state.go('index.dashboard');
      } else {
        let product, batch, measure = {}
        receipt.GoodReceiveNoteDetails.map((prod) => {
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
              BatchExpiringDate: prod.BatchExpiringDate
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
            }
            vm.productMeasures.push(measure);
          }
        })
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

    vm.setSelectedProduct = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.productID = item.ProductID;
        vm.formData.productName = item.ProductName;
        vm.formData.productUniqueID = item.ProductUniqueID;
      }
    }

  }]);
})()