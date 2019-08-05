(function () {
  "use strict";
  angular.module("app").controller("goodRecieptEditCtrl", ["sharedSvc", "$state", '$scope', '$rootScope', "toastr", function (sharedSvc, $state, $scope, $rootScope, toastr) {
    var vm = this;
    // alert("enterd GR edit");
    vm.job = {};
    vm.formData = {};
    vm.products = [];
    vm.batches = [];
    vm.productMeasures = [];
    vm.stockStates = [];
    vm.browserMode = true;
    vm.mobilePlatform = false;
    vm.goodReceipts = [];
    vm.savedTasks = [];
    vm.currentDoc = null;
    vm.product = "";


    
    // alert("about to read load from storage");
    var allUserJob = sharedSvc.getStorage("AllUserJob");
    if (allUserJob === null || allUserJob === undefined || allUserJob === '') {
      $state.go('index.dashboard');
    }

    // alert("about to select bar code elements ")
    var element = document.getElementById("barcode");
    // alert("selected bar code elements ")

    element.addEventListener("click", function (event) {
      // alert("about scan");
      // scanBarCode(event.target);

    })
  


    function scanBarCode(source) {
      // alert("ready  to scan")
      cordova.plugins.barcodeScanner.scan(
          function (result) {
              if (!result.cancelled) {
                // alert("scanned successfully");
                  $rootScope.$emit('BarcodeCaptured', result.text);
                 vm.formData.lotNo = result.text;
              }
          },
          function (error) {
              // alert("Scanning failed: " + error);
          },
          {
              preferFrontCamera: false, // iOS and Android
              showFlipCameraButton: true, // iOS and Android
              showTorchButton: true, // iOS and Android
              torchOn: false, // Android, launch with the torch switched on (if available)
              saveHistory: false, // Android, save scan history (default false)
              prompt: "Place a barcode inside the scan area", // Android
              resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
              // formats : "QR_CODE,PDF_417", // default: all but PDF_417  and RSS_EXPANDED
              // orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
              disableAnimations: true, // iOS
              disableSuccessBeep: false // iOS and Android
          }
      );
  }

  var userJob = sharedSvc.getStorage("UserJob");
  if (userJob && userJob.currentDoc) {
    // alert("there is currentDoc " + userJob.currentDoc);
    vm.currentDoc = userJob.currentDoc;
  }
  else {
    // alert("there is no currentDoc");
  }


  // alert("about to load  GR");
  if (allUserJob && allUserJob.ReceiptModel) {
    // alert(allUserJob.ReceiptModel.DocCount);
    vm.goodReceipts = allUserJob.ReceiptModel.GoodReceiveNotes.filter(function (item) {
      return item.DocumentNo === vm.currentDoc;
    });

    if (vm.goodReceipts.length > 0) {
      // alert("theres is a receipt of docNo " + vm.goodReceipts[0].DocumentNo);
    }
    else {
      // alert("theres is no receipt ");
    }
  } else {
    // alert("theres no to load  GR");
  }


  var clientId = sharedSvc.getStorage('theclient');
  var depotCode = sharedSvc.getStorage('thedepot');
  // alert("about to load stockstates");
  var stockStateRepository = sharedSvc.initialize('api/stockstates/' + clientId + "/" + depotCode);
  // alert("about to load stock state");
  stockStateRepository.get(function (response) {
    // alert("loaded stock state");
    vm.stockStates = response.result;
  });

  if (vm.goodReceipts[0]) {
    // alert("good receipt has value " + vm.goodReceipts[0].DocumentNo);
  }


  if (window.cordova) {
    // alert("cordova supported");
    //  barcodeService.loadBarcodeScanner();
    vm.mobilePlatform = true;
    vm.browserMode = false;
  } else {
    // alert("No cordova loaded");
  }

  getProductInfo(vm.goodReceipts[0]);
  loadReceipt();

  $rootScope.$on('BarcodeCaptured', function (evt, data) {
    $scope.$watch("vm.formData.lotNo", function (newVal, oldVal) {
      if (newVal !== oldVal) {
        vm.formData.lotNo = "";
      }
      vm.formData.lotNo = data;
    })
    $scope.$apply();
  });


  var savesJob = sharedSvc.getStorage('UserJob');
  vm.currentDoc = savesJob.currentDoc;

  if (savesJob && savesJob.jobs) {
    var item = savesJob.jobs.filter(function (x) {
      return x.documentNo === vm.currentDoc;
    });

    // alert("about to load previous task")
    if (item.length > 0 && item[0].tasks.length > 0) {
      vm.savedTasks = item[0].tasks;
    }
  }

    //extract produts, measures and batches from transfer
    function getProductInfo(recpt) {
      // alert("about to extract poduct info");
      if (recpt === undefined || recpt === null || recpt === '') {
        $state.go('index.dashboard');
      } else {
        var product, batch, measure = {}
        // alert("about to iterate TRF details");
        recpt.GoodReceiveNoteDetails.forEach(function (prod) {
          // alert("iterating detail");
          product = {
            ID: prod.ID,
            ProductID: prod.ProductID,
            ProductName: prod.ProductName,
            ProductUniqueID: prod.ProductUniqueID
          }
          vm.products.push(product);

          // alert("extrating batches");
          var existingBatches = vm.batches.filter(function (x) {
            return x.BatchID == prod.BatchID;
          });
          if (existingBatches.length <= 0) {
            batch = {
              BatchID: prod.BatchID,
              BatchManufaturingDate: prod.BatchManufaturingDate,
              BatchExpiringDate: prod.BatchExpiringDate,
              ProductID: prod.ProductID
            }
            vm.batches.push(batch);
          }

          // alert("extracting measures")
          var existingMeasures = vm.productMeasures.filter(function (x) {
            return x.ReceivedQtyMeasurementUnit == prod.ReceivedQtyMeasurementUnit;
          });
          if (existingMeasures <= 0) {
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

        // alert("done iterating details");
      }

      // alert("done getting products");
    }
    vm.setSelectedProduct = function (item) {
      // alert("setting product");
      vm.batch = null; vm.receivedQtyMeasure = null;
      vm.batches = []; vm.productMeasures = [];

      if (item) {
        var products = vm.products.filter(function (prod) {
          return prod.ProductID === item;
        })

        vm.formData.productID = products[0].ProductID;
        vm.formData.productName = products[0].ProductName;
        vm.formData.productUniqueID = products[0].ProductUniqueID;

        vm.goodReceipts[0].GoodReceiveNoteDetails.forEach(function(prod) {
          if(prod.ProductID === item){
           var existingBatches = vm.batches.filter(function (x) {
             return x.BatchID == prod.BatchID;
           });
           if (existingBatches.length <= 0) {
             var batch = {
               BatchID: prod.BatchID,
               BatchManufaturingDate: prod.BatchManufaturingDate,
               BatchExpiringDate: prod.BatchExpiringDate,
               ProductID: prod.ProductID
             }
             vm.batches.push(batch);
           }

           var existingMeasures = vm.productMeasures.filter(function (x) {
             return x.ReceivedQtyMeasurementUnit == prod.ReceivedQtyMeasurementUnit;
           });
           if (existingMeasures <= 0) {
             var measure = {
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
          }
        });       
      }
    };

    vm.setSelectedStockState = function (item) {
    // alert("selecting stock state");
    if (item !== undefined || item !== null) {
     var states =  vm.stockStates.filter(function(state){
        return state.StockState === item;
      });

      vm.formData.stockStateName = states[0].StockStateCode;
      vm.formData.stockStateID = states[0].ID;
      vm.formData.stockState = states[0].ID;
    }
  };

  vm.setSelectedBatch = function (item) {
    //  alert("selecting batch");
    if (item !== undefined || item !== null) {

      var batches =  vm.batches.filter(function(batch){
        return batch.batchID === item;
      });

      vm.formData.batchID = batches[0].BatchID;
      vm.formData.batchExpiringDate = batches[0].BatchExpiringDate;
      vm.formData.batchManufaturingDate = batches[0].BatchManufaturingDate;
    }
  }

  vm.setSelectedMeasure = function (item) {
    if (item !== undefined || item !== null) {
      // alert("selecting measures");

      var measures =  vm.productMeasures.filter(function(measure){
        return batch.measurementID === item;
      });

      vm.formData.measurementID = measures[0].MeasurementID;
      vm.formData.measurementName = measures[0].MeasurementID;
      vm.formData.receivedQtyMeasurementUnit = measures[0].ReceivedQtyMeasurementUnit;
      vm.formData.receivedQtyMeasurementDescription = measures[0].ReceivedQtyMeasurementDescription;
    }
  }

  vm.save = function () {
    // alert("inside save");
    var task = sharedSvc.getStorage('UserJob');

    if (Object.keys(vm.formData).length === 0) {
      toastr.error("You cannot save an empty task.");
      return;
    }

    // alert("filter  GR details");
    var noteDetails = vm.goodReceipts[0].GoodReceiveNoteDetails.filter(function (x) {
      return x.ProductID === vm.formData.productID && x.BatchID === vm.formData.batchID
        && x.ReceivedQtyMeasurementUnit === vm.formData.receivedQtyMeasurementUnit
    });

    // alert("populating formdata");
    vm.formData = {
      documentNo: vm.goodReceipts[0].DocumentNo,
      detailID: noteDetails[0].ID,
      parentID: noteDetails[0].GoodReceiveNoteID,
      status: "Pending",
      palletteNo: vm.formData.lotNo,
      donorID: noteDetails[0].DonoID,
      serialNoEnd: parseInt(noteDetails[0].SerialNoEnd),
      serialNoStart: parseInt( noteDetails[0].SerialNoStart),
      userID: sharedSvc.getStorage("UserID"),
      lotNo: vm.formData.lotNo,
      quantity: vm.formData.quantity,
      productID: vm.formData.productID,
      productName: vm.formData.productName,
      productUniqueID: vm.formData.productUniqueID,
      measurementID: vm.formData.measurementID,
      measurementName: vm.formData.measurementName,
      receivedQtyMeasurementUnit: vm.formData.receivedQtyMeasurementUnit,
      receivedQtyMeasurementDescription: vm.formData.receivedQtyMeasurementDescription,
      batchID: vm.formData.batchID,
      batchExpiringDate: vm.formData.batchExpiringDate,
      batchManufaturingDate: vm.formData.batchManufaturingDate,
      stockStateName: vm.formData.stockStateName,
      stockStateID: vm.formData.stockStateID,
      stockState: vm.formData.stockState
    };

    vm.job.jobs.forEach(function(job){
          if(job.documentNo === vm.currentDoc){
            job.tasks.forEach(function(task) {
              if(task.lotNo !== vm.job.currentTask){
                task.quanity = vm.formData.quanity;
                task.lotNo  = vm.formData.lotNo;
                task.palletteNo = vm.formData.lotNo;
                task.stockStateID = vm.formData.stockStateID;
                task.stockStateName = vm.formData.stockStateName;
                task.batchID = vm.formData.batchID;
                task.batchExpiringDate = vm.formData.batchExpiringDate;
                task.batchManufaturingDate = vm.formData.batchManufaturingDate;
                task.receivedQtyMeasurementUnit = vm.formData.receivedQtyMeasurementUnit;
                task.receivedQtyMeasurementDescription = vm.formData.receivedQtyMeasurementDescription;
                task.MeasurementID = vm.formData.measurementID;
                task.productID = vm.formData.productID;
                task.productName = vm.formData.productName;
              }
            })
          }
    });

    vm.job.currentTask   =  vm.formData.lotNo;
    sharedSvc.createStorageParam('UserJob', vm.job);
    $state.go('main.goodreciept-view');
    toastr.success("save successfully")
  };

  function loadReceipt(){
    vm.job = sharedSvc.getStorage('UserJob');
    if (vm.job && vm.job.jobs) {
      // alert("filtered jobs");
      vm.currentDoc = vm.job.currentDoc;
      var results = vm.job.jobs.filter(function (x) {
        return x.documentNo === vm.currentDoc;
      })

      if (results.length > 0) {
        vm.task = results[0];

        if (vm.job.currentTask !== undefined || vm.job.currentJob !== null) {
          var tasks = vm.task.tasks.filter(function (x) {
            return x.lotNo === vm.job.currentTask;
          });

          vm.formData = tasks[0];
          vm.product = tasks[0].productID;
          vm.batch = tasks[0].batchID;
          vm.receivedQtyMeasure = tasks[0].measurementID;
          vm.stockState = tasks[0].stockStateName;
        }
      }
      else {
        toastr.warning("You have not saved any task for doccument:  " + vm.currentDoc);
        $state.go('main.goodreciepts');
      }
    }
  }

}]);

}) ()