(function () {
    "use strict";
    angular.module("app").controller("picklistCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {
 
      var vm = this;

    
    }]);   
    angular.module("app").controller("picklistNewCtrl", ["sharedSvc", "$state", "$rootScope", "toastr", function (sharedSvc, $state, $rootScope, toastr) {
 
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

    
    }]);     
  })()