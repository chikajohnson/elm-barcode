
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
                vm.formData.userName = "ifeanyi.eze@netopng.com";
                vm.formData.password = "!pass4sure"
                //Logged in users cannot access this controller
                if (sharedSvc.getStorage('authorizationData') !== null) {
                    var group = sharedSvc.getStorage('groupName');
                    var groups = $rootScope.nonSupervisorRoles.filter(function(item){
                        
                        return item ===  group.toLowerCase();
                    });

                    if (group !== null &&  groups.length > 0) {
                        $state.go('index.dashboard');
                    }
                    else {
                        $state.go('supervisor.dashboard');
                    }
                }

                vm.message = "";

                vm.login = function (data) {
                    vm.isBusy = true;

                    //alert("about to route");
                  //  $state.go('index.dashboard');
                    authService.login(data).then(function (response) {
                        //alert("logged in");
                        vm.authentication = authService.authentication; //set authentication parameters
                        _loadUserDetails(); //get other user details apart from token
                        // setAutoBizDay();
                    },
                        function (response) {
                            //alert("failed to login");
                            vm.isBusy = false;
                            if (response.data) {
                                toastr.error(response.data.error_description);
                            }
                            else if (response.message) {
                                toastr.error(response.message);
                            }
                        });
                };

                function _loadUserDetails(userName) {
                   // alert("gettting user detail");
                    var accountDetailRepository = sharedSvc.initialize('api/account/GetUserDetails');
                    accountDetailRepository.get(function (response) {
                        //alert("got user detail");
                        //set the item into local storage since it is a global variable
                        sharedSvc.createStorageParam('fullName', response.FullName);

                        //check if localstorage has this item already before setting it
                        if (!sharedSvc.getStorage('thedepot')) {
                            sharedSvc.createStorageParam('thedepot', response.DefaultDepotID);
                        }
                        if (!sharedSvc.getStorage('theclient')) {
                            sharedSvc.createStorageParam('theclient', response.DefaultClientID);
                        }
                        sharedSvc.createStorageParam('thegroup', response.DefaultGroupID);
                        sharedSvc.createStorageParam('changePassword', response.ChangePassword);
                        sharedSvc.createStorageParam('groupName', response.UserGroup);
                        sharedSvc.createStorageParam('dashboardName', response.DashboardName);
                        sharedSvc.createStorageParam('UserID', response.Id);


                        //we have to reload the page as the index.html page misbehaves without page reload
                        //@TODO: Let's fix this
                       // alert("logged to local storage");
                        var group = sharedSvc.getStorage('groupName');
                        var groups = $rootScope.nonSupervisorRoles.filter(function(item){
                            return item ===  group.toLowerCase();
                        });
    
                        if (groups.length <= 0) {
                            $state.go('supervisor.dashboard');
                        }
                        else {
                            $state.go('index.dashboard');
                        }
                        toastr.success("login successful")

                    },
                        function (error) {
                            //alert("failed to get user detail");
                        })

                    //return deferred.promise;
                };


            }])
}())