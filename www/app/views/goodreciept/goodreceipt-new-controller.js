(function () {
  "use strict";
  angular.module("app").controller("goodRecieptNewCtrl", ["sharedSvc", "$state", '$scope', '$rootScope', "toastr", function (sharedSvc, $state, $scope, $rootScope, toastr) {
    var vm = this;
    // alert("enterd GR new");
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

    // alert("about to read load from storage");
    var allUserJob = sharedSvc.getStorage("AllUserJob");
    if (allUserJob === null || allUserJob === undefined || allUserJob === '') {
      $state.go('index.dashboard');
    }

    // alert("about to select bar code elements ")
    var element = document.getElementById("barcode");
    // alert("selected bar code elements ")

    // element.addEventListener("click", function (event) {
    //   // alert("about scan");
    //   scanBarCode(event.target);

    // })



    //   function scanBarCode(source) {
    //     // alert("ready  to scan")
    //     cordova.plugins.barcodeScanner.scan(
    //         function (result) {
    //             if (!result.cancelled) {
    //               // alert("scanned successfully");
    //                 $rootScope.$emit('BarcodeCaptured', result.text);
    //                vm.formData.lotNo = result.text;
    //             }
    //         },
    //         function (error) {
    //             // alert("Scanning failed: " + error);
    //         },
    //         {
    //             preferFrontCamera: false, // iOS and Android
    //             showFlipCameraButton: true, // iOS and Android
    //             showTorchButton: true, // iOS and Android
    //             torchOn: false, // Android, launch with the torch switched on (if available)
    //             saveHistory: false, // Android, save scan history (default false)
    //             prompt: "Place a barcode inside the scan area", // Android
    //             resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
    //             // formats : "QR_CODE,PDF_417", // default: all but PDF_417  and RSS_EXPANDED
    //             // orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
    //             disableAnimations: true, // iOS
    //             disableSuccessBeep: false // iOS and Android
    //         }
    //     );
    // }


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

    //extract produts, measures and batches from receipt
    function getProductInfo(recpt) {
      // alert("about to extract poduct info");
      if (recpt === undefined || recpt === null || recpt === '') {
        $state.go('index.dashboard');
      } else {
        var product, batch, measure = {}
        // alert("about to iterate GR details");
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
      if (item !== undefined || item !== null) {
        vm.formData.productID = item.ProductID;
        vm.formData.productName = item.ProductName;
        vm.formData.productUniqueID = item.ProductUniqueID;

        vm.batches = vm.batches.filter(function (x) {
          return x.ProductID === item.ProductID;
        });
        vm.productMeasures = vm.productMeasures.filter(function (x) {
          return x.ProductID === item.ProductID;
        })
      }
    }

    vm.setSelectedStockState = function (item) {
      // alert("selecting stock state");
      if (item !== undefined || item !== null) {
        vm.formData.stockStateName = item.StockStateCode;
        vm.formData.stockStateID = item.ID;
        vm.formData.stockState = item.ID;
      }
    }

    vm.setSelectedBatch = function (item) {
      // alert("selecting batch");
      if (item !== undefined || item !== null) {
        vm.formData.batchID = item.BatchID;
        vm.formData.batchExpiringDate = item.BatchExpiringDate;
        vm.formData.batchManufaturingDate = item.BatchManufaturingDate;
      }
    }

    vm.setSelectedMeasure = function (item) {
      if (item !== undefined || item !== null) {
        // alert("selecting measures");
        vm.formData.measurementID = item.MeasurementID;
        vm.formData.measurementName = item.MeasurementID;
        vm.formData.receivedQtyMeasurementUnit = item.ReceivedQtyMeasurementUnit;
        vm.formData.receivedQtyMeasurementDescription = item.ReceivedQtyMeasurementDescription;
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
      //get goood receipt note detail from which the pallet comes from
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
        serialNoEnd: noteDetails[0].SerialNoEnd,
        serialNoStart: noteDetails[0].SerialNoStart,
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
        submitted: false
      };


      if (task === null || task === undefined) { // user does not have a task already
        // alert("user has no task");
        var job = {
          tasks: [vm.formData],
          documentNo: vm.goodReceipts[0].DocumentNo,
          status: "pending",
          type: "receipt",
          userID: sharedSvc.getStorage("UserID")
        };
        task.jobs = [];
        task.jobs.push(job);
      } else {
        if (task.jobs === undefined || task.jobs === null) {  // user has task but  there's no job already
          // alert("user has task");
          var job = {
            tasks: [vm.formData],
            documentNo: vm.goodReceipts[0].DocumentNo,
            status: "pending",
            type: "receipt",
            userID: sharedSvc.getStorage("UserID")
          };
          task.jobs = [];
          task.jobs.push(job);
        }
        else if (task.jobs && task.jobs.length > 0) {  // user has task  &&  there's no job already
          // alert("user has jobs already");
          var currentJob = task.jobs.filter(function (x) {
            return x.type === 'receipt' && x.documentNo == vm.goodReceipts[0].DocumentNo
          });
          if (currentJob.length === 0) {  // this particular document is not among the documents started
            // alert("this doc has not been statrted already");
            var job = {
              tasks: [vm.formData],
              documentNo: vm.goodReceipts[0].DocumentNo,
              status: "pending",
              type: "receipt",
              userID: sharedSvc.getStorage("UserID")
            };
            task.jobs.push(job);
          }
          else {   // this particular document is among the documents already started
            // alert("this doc as been statrted already");
            var currentIndex = -1;
            for (var i = 0; i < task.jobs.length; i += 1) {
              if (task.jobs[i].type === "receipt" && task.jobs[i].documentNo === vm.goodReceipts[0].DocumentNo) {
                currentIndex = i;
                break;
              }
            }

            if (currentIndex !== -1) {  // old document
              var oldTaskList = currentJob[0].tasks;

              var lotIndex = -1;
              for (var i = 0; i < oldTaskList.length; i += 1) {
                if (oldTaskList[i].lotNo === vm.formData.lotNo) {
                  lotIndex = i;
                  break;
                }
              }

              if (lotIndex !== -1) {
                toastr.error("lot number " + vm.formData.lotNo + " has already been captured.");
                return;
              }
              else {
                currentJob[0].tasks.push(vm.formData);
              }
              task.jobs[currentIndex] = currentJob[0];
            }
          }
        }
      }



      sharedSvc.createStorageParam('UserJob', task);
      $state.reload();
      toastr.success("save successfully")
    };

  }]);

})()