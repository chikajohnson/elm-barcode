(function () {
  "use strict";
  angular.module("app").controller("pickListCtrl", ["sharedSvc", "$state", "toastr", function (sharedSvc, $state, toastr) {

    // alert("entered PL");
    var vm = this;
    vm.picklists = [];
    vm.startedDocs = [];
    vm.isBusy = false;

    // alert("initializing picklist");
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

    // alert("about to bing PL");
    if (allUserJob != null) {
      // alert(allUserJob.ReleaseModel.DocCount);
      vm.picklists = allUserJob.ReleaseModel;
    }

    // vm.starded = vm.startedDocs.includes(item.DocumentNo) 

    vm.startJob = function (picklist) {
      // alert("about to start job");
      // vm.isBusy = true;
      var userTaskRepository = sharedSvc.initialize('api/userjob/startjob/' + sharedSvc.getStorage("UserID") + "/" + picklist.DocumentNo);
      userTaskRepository.update({}, {}, function (response) {
        vm.isBusy = false;
        // alert("updated to statrted");
        var savedPickList = sharedSvc.getStorage("UserJob");
        if (savedPickList === null || savedPickList === undefined) { // there's no picklist
        // alert("about to log picklist if new");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [picklist.DocumentNo], currentDoc: picklist.DocumentNo });
          // alert("successfully logged picklist if new");
        }
        else if (savedPickList.startedDocs) {
          // alert("about to log picklist existing existing");
          var docs = savedPickList.startedDocs.filter(function (doc) {
            return doc === picklist.DocumentNo;
          });
          if (docs.length === 0) {
            savedPickList.startedDocs.push(picklist.DocumentNo);
          }
          savedPickList.currentDoc = picklist.DocumentNo;
          sharedSvc.createStorageParam("UserJob", savedPickList);
          // alert("successfully logged picklist if existing");
        }
        else {
          // alert("about to log picklist if finally");
          sharedSvc.createStorageParam("UserJob", { startedDocs: [picklist.DocumentNo], currentDoc: picklist.DocumentNo });
          // alert("successfully logged picklist in finally");

        }

        // alert("about to route");
        toastr.success(response.message);
        $state.go('main.picklist-new');
      }, function (error) {
        vm.isBusy = false;
        vm.isBusy2 = false;
      })

    }

  }]);
})()