(function () {
  "use strict";
  angular.module("app").controller("goodRecieptListCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;
    vm.showDetail = function () {
      $state.go('main.goodreciept-new');
    }

  }]);

  angular.module("app").controller("goodRecieptViewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {

    var vm = this;

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
        $state.go('main.success')
      }, function () {
        //$state.go('index.dashboard') 
      });
    };

    vm.endJob = function () {
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
        toastr.success("Job ended successfully")
        $state.go('main.goodreciepts')
      }, function () {
        return;
      });
    };

    vm.deleteTask = function () {
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
        toastr.success("Task deleted successfully")
        return;
      }, function () {
        return;
      });
    };


  }]);

  angular.module("app").controller("goodRecieptNewCtrl", ["sharedSvc", "$state", '$scope', "$rootScope", "toastr","barcodeService", function (sharedSvc, $state, $scope,$rootScope, toastr, barcodeService) {
    var vm = this;
    vm.formData = {};

    vm.browserMode = true;
    vm.mobilePlatform = false;

    if (window.cordova) {
      barcodeService.loadBarcodeScanner();
      vm.mobilePlatform = true;
      vm.browserMode = false;
    }
    else{
      alert("No cordova loaded");
    }

      $rootScope.$on('BarcodeCaptured', function (evt, data) {
      $scope.$watch("vm.formData.lotNo", function (newVal, oldVal) {
        alert(data);
        if (newVal !== oldVal) {
          vm.formData.lotNo = "";
        }
        vm.formData.lotNo = data;
      })
      $scope.$apply();
    });

    vm.save = function(){
      $state.go("main.goodreciept-view");
      toastr.success("save successfully")
    };

  }]);
})()