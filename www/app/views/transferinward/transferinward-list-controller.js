(function () {
  "use strict";
  angular.module("app").controller("transferInwardListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    // alert("entered GR");
    var vm = this;
    vm.stockTransfers = [];
    vm.startedDocs = [];

    // alert("initializing stock Transfer");
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
      alert(allUserJob.TransferInwardModel.DocCount);
      vm.stockTransfers = allUserJob.TransferInwardModel;
    }

    // vm.starded = vm.startedDocs.includes(item.DocumentNo) 

    vm.startJob = function (inward) {
      // alert("about to start job");
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + inward.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        // alert("updated to statrted");
        var savedinward = sharedSvc.getStorage("UserJob");
        if (savedinward === null || savedinward === undefined) { // there's no inward
        // alert("about to log inward if new");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [inward.DocumentNo], currentDoc: inward.DocumentNo });
          // alert("successfully logged inward if new");
        }
        else if (savedInward.startedDocs) {
          // alert("about to log inward existing existing");
          var docs = savedInward.startedDocs.filter(function (doc) {
            return doc === inward.DocumentNo;
          });

          if (docs.length === 0) {
            savedInward.startedDocs.push(inward.DocumentNo);
          }
          savedInward.currentDoc = inward.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedInward);
          // alert("successfully logged inward if existing");
        }
        else {
          // alert("about to log inward if finally");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [inward.DocumentNo], currentDoc: inward.DocumentNo });
          alert("successfully logged inward in finally");

        }

        alert("about to route");
        toastr.success(response.message);
        $state.go('main.goodreciept-new');
      }, function (error) {
        
      })

    }
  }]);
})()