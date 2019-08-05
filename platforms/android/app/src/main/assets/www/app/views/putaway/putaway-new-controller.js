(function () {
  "use strict";

  angular.module("app").controller("putawayNewCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr", function (sharedSvc, $state, $scope, $rootScope, toastr) {
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
      vm.formData.palletteCode = null;
      vm.formData.palletteNo = null
      // alert("location changed");
      if (newVal !== oldVal) {
        vm.formData.location = "";
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



    vm.save = function (data) {
      var task = sharedSvc.getStorage('UserJob');

      if (Object.keys(vm.formData).length === 0) {
        toastr.error("You cannot save an empty task.");
        return;
      }

      var putawayDetails = vm.putaways[0].StockPutAwayDetails.filter(function (item) {
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


      if (putawayDetails.length <= 0) {
        toastr.error("Location " + vm.formData.location + " does not exist in the current document.")
        return;
      }

      vm.formData = {
        documentNo: vm.putaways[0].DocumentNo,
        detailID: putawayDetails[0].ID,
        parentID: putawayDetails[0].StockPutAwayID,
        status: "Pending",
        palletteNo: vm.formData.palletteCode,
        donorID: putawayDetails[0].DonoID,
        serialNoEnd: putawayDetails[0].SerialNoEnd,
        serialNoStart: putawayDetails[0].SerialNoStart,
        cellID: putawayDetails[0].CellID,
        cellCode: putawayDetails[0].CellCode,
        cellName: putawayDetails[0].CellName,
        partitionCode: putawayDetails[0].PartitionCode,
        partitionID: putawayDetails[0].PartitionID,
        partitionName: putawayDetails[0].PartitionName,
        putAwayStrategy: putawayDetails[0].PartitionName,
        rackCode: putawayDetails[0].RackCode,
        rackID: putawayDetails[0].RackID,
        rackName: putawayDetails[0].RackName,
        storageAreaCode: putawayDetails[0].StorageAreaCode,
        storageAreaID: putawayDetails[0].StorageAreaID,
        storageAreaName: putawayDetails[0].StorageAreaName,
        userID: sharedSvc.getStorage("UserID"),
        lotNo: vm.formData.lotNo,
        location: vm.formData.location,
        quantity: vm.formData.quantity,
        productID: vm.formData.productID,
        productName: vm.formData.productName,
        productUniqueID: vm.formData.productUniqueID,
        measurementID: vm.formData.measurementID,
        measurementName: vm.formData.measurementName,
        batchID: vm.formData.batchID,
        stockStateName: vm.formData.stockStateName,
        stockStateID: vm.formData.stockStateID,
        stockState: vm.formData.stockState,
        quanitity: vm.formData.putawayQty,
        location: vm.formData.location,
        palletteCode: vm.formData.palletteCode,
        submitted: false
      };

      if (task === null || task === undefined) { // user does not have a task already
        var job = {
          tasks: [vm.formData],
          documentNo: vm.putaways[0].DocumentNo,
          status: "pending",
          type: "putaway",
          userID: sharedSvc.getStorage("UserID")
        };
        task.jobs = [];
        task.jobs.push(job);
      } else {
        if (task.jobs === undefined || task.jobs === null) {  // there's no job already
          var job = {
            tasks: [vm.formData],
            documentNo: vm.putaways[0].DocumentNo,
            status: "pending",
            type: "putaway",
            userID: sharedSvc.getStorage("UserID")
          };
          task.jobs = [];
          task.jobs.push(job);
        }
        else if (task.jobs && task.jobs.length > 0) {
          var currentJobs = task.jobs.filter(function (x) {
            return x.type === 'putaway' && x.documentNo == vm.putaways[0].DocumentNo;
          })
          if (currentJobs.length <= 0) {  // this particular document is not among the documents started
            var job = {
              tasks: [vm.formData],
              documentNo: vm.putaways[0].DocumentNo,
              status: "pending",
              type: "putaway",
              userID: sharedSvc.getStorage("UserID")
            };
            task.jobs.push(job);
          }
          else {   // this particular document is among the documents already started
            var currentIndex = -1;
            for (var i = 0; i < task.jobs.length; i += 1) {
              if (task.jobs[i].type === "putaway" && task.jobs[i].documentNo === vm.putaways[0].DocumentNo) {
                currentIndex = i;
                break;
              }
            }

            if (currentIndex !== -1) {  // old document
              var oldTaskList = currentJobs[0].tasks;

              var lotIndex = -1;
              for (var i = 0; i < oldTaskList.length; i += 1) {
                if (oldTaskList[i].lotNo === vm.formData.lotNo) {
                  lotIndex = i;
                  break;
                }
              }

              if (lotIndex !== -1) {
                toastr.error("location number " + vm.formData.location + " has already been captured.");
                return;
              }
              else {
                currentJobs[0].tasks.push(vm.formData);
              }
              task.jobs[currentIndex] = currentJobs[0];
            }
          }
        }
      }


      function assignLocation(data) {
        switch (vm.locationType) {
          case "cell":
            vm.formData.CellCode = data.CellCode;
            vm.formData.CellID = data.CellID;
            break;
          case "pallette":
            vm.formData.palletteNo = data.palletteNo;
            vm.formData.CellID = data.CellID;
            break;

          default:
            break;
        }
      }


      sharedSvc.createStorageParam('UserJob', task);
      $state.reload();
      toastr.success("putaway save successfully")
    };
  }]);
})()