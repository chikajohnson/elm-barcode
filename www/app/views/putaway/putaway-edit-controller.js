(function () {
  "use strict";

  angular.module("app").controller("putawayEditCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr", function (sharedSvc, $state, $scope, $rootScope, toastr) {
    var vm = this;
    // alert("enterd GR new");
    vm.formData = {};
    vm.products = [];
    vm.batches = [];
    vm.productMeasures = [];
    vm.stockStates = [];
    vm.browserMode = true;
    vm.mobilePlatform = false;
    vm.putaways = [];
    vm.putawayDetails = [];
    vm.savedTasks = [];
    vm.currentDoc = null;
    vm.locationType = "";

    // alert("about to read load  SPA from storage");
    var allUserJob = sharedSvc.getStorage("AllUserJob");
    if (allUserJob === null || allUserJob === undefined || allUserJob === '') {
      $state.go('index.dashboard');
    }

    // alert("about to select barcode elements ")
    var elements = document.getElementsByClassName("barcode");
    //alert("selected barcode elements ");

    for (var index = 0; index < elements.length; index++) {
      elements[index].addEventListener("click", function (event) {
        //alert("about scan");
        scanBarCode(event.target);
      })
    }

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


    // alert("about to load  SPA");
    if (allUserJob && allUserJob.PutawayModel) {
      // alert(allUserJob.PutawayModel.DocCount);
      vm.putaways = allUserJob.PutawayModel.StockPutAways.filter(function (item) {
        return item.DocumentNo === vm.currentDoc;
      });

      if (vm.putaways.length > 0) {
        // alert("theres is a putaway of docNo " + vm.putaways[0].DocumentNo);
      }
      else {
        // alert("theres is no putaway ");
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

    if (vm.putaways[0]) {
      // alert("stock putaway has value " + vm.putaways[0].DocumentNo);
    }


    if (window.cordova) {
      // alert("cordova supported");
      //  barcodeService.loadBarcodeScanner();
      vm.mobilePlatform = true;
      vm.browserMode = false;
    } else {
      // alert("No cordova loaded");
    }

    //  getProductInfo(vm.putaways[0].StockPutAwayDetails);

    loadPutaway();
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

    $rootScope.$on('BarcodeCaptured', function (evt, data) {
      $scope.$watch("vm.formData.palletteCode", function (newVal, oldVal) {
        if (newVal !== oldVal) {
          vm.formData.palletteCode = "";
        }
        vm.formData.palletteCode = data;
      });

      $scope.$watch("vm.formData.location", function (newVal, oldVal) {
        // alert("location changed");
        if (newVal !== oldVal) {
          vm.formData.location = "";
        }
        vm.formData.location = data;
      });
      $scope.$apply();
    });


    $scope.$watch("vm.formData.location", function (newVal, oldVal) {
      vm.products = [];
      // alert("location changed");
      if (newVal !== oldVal) {
        vm.formData.location = "";
        vm.formData.palletteCode = null;
        vm.formData.palletteNo = null;
      }
      vm.formData.location = newVal;

      vm.putawayDetails = vm.putaways[0].StockPutAwayDetails.filter(function (item) {
        if (item.CellCode.trim() !== "" && item.CellCode.trim() != null) {
          vm.locationType = 'cell';
          return item.CellCode.trim() === vm.formData.location;
        } else if (item.PalletteCode.trim() !== "" && item.PalletteCode.trim() != null) {
          vm.locationType = 'pallette';
          return item.PalletteCode.trim() === vm.formData.location;
        } else if (item.StorageAreaCode.trim() !== "" && item.StorageAreaCode.trim() != null) {
          vm.locationType = 'storageArea';
          return item.StorageAreaCode.trim() === vm.formData.location;
        }
      });

      if (vm.putawayDetails.length <= 0 && newVal !== undefined && newVal !== '') {
        toastr.error("Location " + vm.formData.location + " does not exist in the current document.")
        return;
      } else {
        getProductInfo(vm.putawayDetails);
      }
    });


    //extract produts from putaway
    function getProductInfo(putawayDetails) {
      if (putawayDetails === undefined || putawayDetails === null || putawayDetails === '') {
        $state.go('index.dashboard');
      } else {
        var product = {}

        putawayDetails.forEach(function (prod) {
          product = {
            ID: prod.ID,
            ProductID: prod.ProductID,
            ProductName: prod.ProductName,
            ProductUniqueID: prod.ProductUniqueID,
            MeasurementID: prod.MeasurementID,
            MeasurementName: prod.MeasurementName,
            QtyReceived: prod.QtyReceived,
            BatchID: prod.BatchID,
            StockStateName: prod.StockStateName,
            StockStateID: prod.StockStateID,
            StockState: prod.StockState,
            Quantity: prod.QtyReceived,
            PutawayQty: prod.QtyReceived
          }
          vm.products.push(product);
        })
      }
    }
    vm.setSelectedProduct = function (item) {
      if (item !== undefined || item !== null) {
        vm.formData.productID = item.ProductID;
        vm.formData.productName = item.ProductName;
        vm.formData.productUniqueID = item.ProductUniqueID;
        vm.formData.measurementID = item.MeasurementID;
        vm.formData.measurementName = item.MeasurementName;
        vm.formData.batchID = item.BatchID;
        vm.formData.stockStateName = item.StockStateName;
        vm.formData.stockStateID = item.StockStateID;
        vm.formData.stockState = item.StockState;
        vm.formData.quantity = item.Quantity;
      }
    }



    vm.save = function () {
      // alert("inside save");
      // var task = sharedSvc.getStorage('UserJob');

      if (Object.keys(vm.formData).length === 0) {
        toastr.error("You cannot save an empty task.");
        return;
      }

      // alert("filter  SPA details");
      var noteDetails = vm.putaways[0].StockPutAwayDetails.filter(function (x) {
        return x.ProductID === vm.formData.productID && x.BatchID === vm.formData.batchID
          && x.MeasurementID === vm.formData.measurementID
      });

      // alert("populating formdata");
      vm.formData = {
        documentNo: vm.putaways[0].DocumentNo,
        detailID: noteDetails[0].ID,
        parentID: noteDetails[0].StockPutAwayID,
        status: "Pending",
        palletteNo: vm.formData.lotNo,
        donorID: noteDetails[0].DonoID,
        serialNoEnd: noteDetails[0].SerialNoEnd,
        serialNoStart: noteDetails[0].SerialNoStart,
        cellID: noteDetails[0].CellID,
        cellCode: noteDetails[0].CellCode,
        cellName: noteDetails[0].CellName,
        partitionCode: noteDetails[0].PartitionCode,
        partitionID: noteDetails[0].PartitionID,
        partitionName: noteDetails[0].PartitionName,
        putAwayStrategy: noteDetails[0].PartitionName,
        rackCode: noteDetails[0].RackCode,
        rackID: noteDetails[0].RackID,
        rackName: noteDetails[0].RackName,
        storageAreaCode: noteDetails[0].StorageAreaCode,
        storageAreaID: noteDetails[0].StorageAreaID,
        storageAreaName: noteDetails[0].StorageAreaName,
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
        stockState: vm.formData.stockState,
        location: vm.formData.location
      };

      vm.job.jobs.forEach(function (job) {
        if (job.documentNo === vm.currentDoc) {
          job.tasks.forEach(function (task) {
            if (task.lotNo === vm.job.currentTask) {
              task.quanity = vm.formData.quanity;
              task.lotNo = vm.formData.lotNo;
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
              task.location = vm.formData.location;
            }
          })
        }
      });

      sharedSvc.createStorageParam('UserJob', vm.job);
      $state.go('main.putaway-view');
      toastr.success("save successfully")
    };

    function loadPutaway() {
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
              return x.location === vm.job.currentTask;
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
          $state.go('main.putaways');
        }
      }
    }
  }]);
})()