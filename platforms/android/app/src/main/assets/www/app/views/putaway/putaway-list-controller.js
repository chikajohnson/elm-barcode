(function () {
  "use strict";
  angular.module("app").controller("putawayListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.putaways = [];
    vm.startedDocs = [];
    vm.location = {};
    vm.isBusy = false;

    var job = sharedSvc.getStorage("UserJob");
    if (job && job.startedDocs && job.startedDocs.length > 0) {
      vm.startedDocs = job.startedDocs;
    }

    var allUserJob = sharedSvc.getStorage("AllUserJob");
    if (allUserJob === null || allUserJob=== undefined || allUserJob === '') {
      $state.go('index.dashboard');
    }

    // alert("about to load SPA");
    if (allUserJob != null) {
      // alert(allUserJob.PutawayModel.DocCount);
      vm.putaways = allUserJob.PutawayModel;
    }

    vm.startJob = function (putaway) {
      // vm.isBusy = true;
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + putaway.DocumentNo);
      // alert("about to start SPA task");
      userTaskRepository.update({}, {}, function (response) {
        // alert("started SPA task");
        vm.formData = {};

        var savedPutaway = sharedSvc.getStorage("UserJob");
        if (savedPutaway === null || savedPutaway === undefined) { // there's no putaway
          sharedSvc.createStorageParam("UserJob", { startedDocs: [putaway.DocumentNo], currentDoc: putaway.DocumentNo });
        }
        else if (savedPutaway.startedDocs) {
          var docs = savedPutaway.startedDocs.filter(function (item) {
            return item === putaway.DocumentNo;
          });
          if (docs.length <= 0) {
            savedPutaway.startedDocs.push(putaway.DocumentNo);
          }
          savedPutaway.currentDoc = putaway.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedPutaway);
        }
        else {
          sharedSvc.createStorageParam("UserJob", { startedDocs: [putaway.DocumentNo], currentDoc: putaway.DocumentNo });
        }

        // alert("logged SPA to local storage")
        $rootScope.putaway = putaway;
        $state.go('main.putaway-new');
        toastr.success(response.message);
        // alert("routing to new SPA")
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);

  })()