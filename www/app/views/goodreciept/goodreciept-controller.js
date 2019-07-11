(function () {
  "use strict";
  angular.module("app").controller("goodRecieptListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.goodReceipts = [];

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
    vm.task = sharedSvc.getStorage('UserTask');

    var userTaskRepository = sharedSvc.initialize('api/userjob/' + sharedSvc.getStorage("UserID"));

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
        $state.go('main.success')
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
        text: 'Are you sure you want to delete this task?',
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

          vm.task.tasks = tasks;
          sharedSvc.createStorageParam("UserTask", vm.task);
          toastr.success("Task deleted successfully");
        }

        return;
      }, function () {
        return;
      });
    };

    function submitTasks() {
      let data = sharedSvc.getStorage("UserTask")
      data.PalletDetailModel = data.tasks;

      userTaskRepository.save({}, data, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};
        toastr.success(response.message);
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })
    }

    function endJob(docNo) {
      var userTaskRepository = sharedSvc.initialize('api/userjob/endjob/' + sharedSvc.getStorage("UserID") + "/" + docNo);

      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        vm.isBusy2 = false;
        vm.formData = {};

        toastr.success("Job ended successfully")
        $state.go('main.goodreciepts')
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
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

    vm.save = function (data) {
      const task = sharedSvc.getStorage('UserTask');
      console.log("data", data);
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
        detailID: noteDetail.ID,
        parentID: noteDetail.GoodReceiveNoteID,
        status: "Pending",
        palletteNo: vm.formData.lotNo,
        donorID: noteDetail.DonoID,
        serialNoEnd: noteDetail.SerialNoEnd,
        serialNoStart: noteDetail.SerialNoStart
      };

      if (task === null || task === undefined) { // user does not have a task already
        sharedSvc.createStorageParam('UserTask', {
          tasks: [vm.formData],
          documentNo: vm.goodReceipt.DocumentNo,
          status: "pending",
          userID: sharedSvc.getStorage("UserID")
        });
      } else {
        if (task.tasks.length > 0) {
          let taskList = task.tasks.filter(x => x.lotNo !== vm.formData.lotNo);

          sharedSvc.createStorageParam('UserTask', {
            tasks: [...taskList, vm.formData],
            documentNo: vm.goodReceipt.DocumentNo,
            status: "pending",
            userID: sharedSvc.getStorage("UserID")
          });
        }
      }

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