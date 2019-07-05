
(function () {
    'use strict'
    angular.module('app')
        .controller('loginCtrl', ['$state', 'sharedSvc', 'toastr', '$rootScope', '$scope', '$anchorScroll', 'authService', 
        function ($state, sharedSvc, toastr, $rootScope, $scope, $anchorScroll, authService) {

            var vm = this;
            vm.loginData = {};
            // declare a form Data to use as model for form values collection
            vm.formData = {};
            // use to toogle UI busy icon
            vm.isBusy = false;
            // instantiate your repository resource object


            //Logged in users cannot access this controller
            if (sharedSvc.getStorage('authorizationData') !== null) {
                $state.go('index.dashboard');
            }

            vm.message = "";

            vm.login = function (data) {
                vm.isBusy = true;
                authService.login(data).then(function (response) {
                    vm.authentication = authService.authentication; //set authentication parameters
                    _loadUserDetails(); //get other user details apart from token
                    // setAutoBizDay();
                },
                    function (response) {
                        vm.isBusy = false;
                        if (response.data) {
                            toastr.error(response.data.error_description);
                        }
                        else if(response.message){
                            toastr.error(response.message);
                        }
                    });
            };

            var _loadUserDetails = function (userName) {
                var accountDetailRepository = sharedSvc.initialize('api/account/GetUserDetails');
                accountDetailRepository.get(function (response) {
                    //set the item into local storage since it is a global variable
                    sharedSvc.createStorageParam('fullName', response.FullName);
        
                    //check if localstorage has this item already before setting it
                    if(!sharedSvc.getStorage('thedepot')){
                      sharedSvc.createStorageParam('thedepot', response.DefaultDepotID);
                    }
                    if(!sharedSvc.getStorage('theclient')){
                      sharedSvc.createStorageParam('theclient', response.DefaultClientID);
                    }
                    sharedSvc.createStorageParam('thegroup', response.DefaultGroupID);
                    sharedSvc.createStorageParam('changePassword', response.ChangePassword);
                    sharedSvc.createStorageParam('groupName', response.UserGroup);
                    sharedSvc.createStorageParam('dashboardName', response.DashboardName);
                    sharedSvc.createStorageParam('UserID', response.Id);
        
        
                    //we have to reload the page as the index.html page misbehaves without page reload
                    //@TODO: Let's fix this
                    toastr.success("login successful")
                   $state.go('index.dashboard');
        
                })
        
                //return deferred.promise;
            };


        }])
}())