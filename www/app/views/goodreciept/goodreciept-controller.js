(function () {
  "use strict";
  angular.module("app").controller("goodRecieptListCtrl", ["sharedSvc", "$state", "toastr", function (sharedSvc, $state, toastr) {

    // alert("entered GR");
    var vm = this;
    vm.goodReceipts = [];
    vm.startedDocs = [];
    vm.isBusy = false;

    // alert("initializing good receipt");
    var job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      // alert("job exists");
      vm.startedDocs = job.startedDocs;
    }

    // alert("about t0 read load from storage");
    var allUserJob = sharedSvc.getStorage("AllUserJob");
    if (allUserJob === null || allUserJob=== undefined || allUserJob === '') {
      $state.go('index.dashboard');
    }

    // alert("about to bing GR");
    if (allUserJob != null) {
      // alert(allUserJob.ReceiptModel.DocCount);
      vm.goodReceipts = allUserJob.ReceiptModel;
    }

    // vm.starded = vm.startedDocs.includes(item.DocumentNo) 

    vm.startJob = function (receipt) {
      // alert("about to start job");
      // vm.isBusy = true;
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + receipt.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        // alert("updated to statrted");
        var savedReceipt = sharedSvc.getStorage("UserJob");
        if (savedReceipt === null || savedReceipt === undefined) { // there's no receipt
        // alert("about to log receipt if new");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [receipt.DocumentNo], currentDoc: receipt.DocumentNo });
          // alert("successfully logged receipt if new");
        }
        else if (savedReceipt.startedDocs) {
          // alert("about to log receipt existing existing");
          var docs = savedReceipt.startedDocs.filter(function (doc) {
            return doc === receipt.DocumentNo;
          });
          if (docs.length === 0) {
            savedReceipt.startedDocs.push(receipt.DocumentNo);
          }
          savedReceipt.currentDoc = receipt.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedReceipt);
          // alert("successfully logged receipt if existing");
        }
        else {
          // alert("about to log receipt if finally");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [receipt.DocumentNo], currentDoc: receipt.DocumentNo });
          // alert("successfully logged receipt in finally");

        }

        // alert("about to route");
        toastr.success(response.message);
        $state.go('main.goodreciept-new');
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);
})()