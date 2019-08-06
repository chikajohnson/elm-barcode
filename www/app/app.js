'use strict';
var app = angular.module('app', ['ui.router', 'common.services', 'LocalStorageModule', 'ui.bootstrap', 'toastr', 'sweetalert', 'ngMessages'])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
    $stateProvider

      .state('index', { url: '/index', abstract: true, templateUrl: 'app/common/masterPage.html' })
      .state('access', { url: '/access', abstract: true, templateUrl: 'app/common/loginMaster.html' })
      .state('main', { url: '/main', abstract: true, templateUrl: 'app/common/masterPage.html' })
      .state('supervisor', { url: '/supervisor', abstract: true, templateUrl: 'app/common/supMasterPage.html' })

      

      .state('index.dashboard', { url: '/dashboard', views: { 'mainContent': { templateUrl: 'app/views/dashboard/dashboard.html', controller: 'dashboardCtrl as vm' } } })

      // /// Auth Module
      .state('access.login', { url: '/login', views: { 'loginContent': { templateUrl: 'app/views/access/login.html', controller: 'loginCtrl as vm' } } })

      // Modules
      .state("main.goodreciepts", { url: "/goodreciepts", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipts.html", controller: "goodRecieptListCtrl as vm" } } })
      .state("main.goodreciept-view", { url: "/goodreciept-view", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipt-view.html", controller: "goodRecieptViewCtrl as vm" } } })
      .state("main.goodreciept-new", { url: "/goodreciept-new", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipt-new.html", controller: "goodRecieptNewCtrl as vm" } } })
      .state("main.goodreciept-edit", { url: "/goodreciept-edit", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipt-edit.html", controller: "goodRecieptEditCtrl as vm" } } })

      .state("main.transferinwards", { url: "/transferinwards", views: { mainContent: { templateUrl: "app/views/transferinward/transferinwards.html", controller: "transferInwardListCtrl as vm" } } })
      .state("main.transferinward-view", { url: "/transferinward-view", views: { mainContent: { templateUrl: "app/views/transferinward/transferinward-view.html", controller: "transferInwardViewCtrl as vm" } } })
      .state("main.transferinward-new", { url: "/transferinward-new", views: { mainContent: { templateUrl: "app/views/transferinward/transferinward-new.html", controller: "transferInwardNewCtrl as vm" } } })
      .state("main.transferinward-edit", { url: "/transferinward-edit", views: { mainContent: { templateUrl: "app/views/transferinward/transferinward-edit.html", controller: "transferInwardEditCtrl as vm" } } })

      .state("main.picklist", { url: "/picklist", views: { mainContent: { templateUrl: "app/views/picklist/picklist.html", controller: "pickListCtrl as vm" } } })
      .state("main.picklist-view", { url: "/picklist-view", views: { mainContent: { templateUrl: "app/views/picklist/picklist-view.html", controller: "pickListViewCtrl as vm" } } })
      .state("main.picklist-new", { url: "/picklist-new", views: { mainContent: { templateUrl: "app/views/picklist/picklist-new.html", controller: "pickListNewCtrl as vm" } } })
      .state("main.picklist-edit", { url: "/picklist-edit", views: { mainContent: { templateUrl: "app/views/picklist/picklist-edit.html", controller: "pickListEditCtrl as vm" } } })

      .state("main.putaways", { url: "/putaways", views: { mainContent: { templateUrl: "app/views/putaway/putaways.html", controller: "putawayListCtrl as vm" } } })
      .state("main.putaway-view", { url: "/putaway-view", views: { mainContent: { templateUrl: "app/views/putaway/putaway-view.html", controller: "putawayViewCtrl as vm" } } })
      .state("main.putaway-new", { url: "/putaway-new", views: { mainContent: { templateUrl: "app/views/putaway/putaway-new.html", controller: "putawayNewCtrl as vm" } } })
      .state("main.putaway-edit", { url: "/putaway-edit", views: { mainContent: { templateUrl: "app/views/putaway/putaway-edit.html", controller: "putawayEditCtrl as vm" } } })

       .state("main.success", { url: "/success", views: { mainContent: { templateUrl: "app/views/util/success.html", controller: "utilCtrl as vm" } } })

      //Supervisor
      .state('supervisor.dashboard', { url: '/dashboard', views: { 'supervisorContent': { templateUrl: 'app/views/supervisor/dashboard.html', controller: 'supDashboardCtrl as vm' } } })

      .state("supervisor.goodreciepts", { url: "/goodreciepts", views: { supervisorContent: { templateUrl: "app/views/supervisor/goodreceipts.html", controller: "supGoodRecieptListCtrl as vm" } } })
      .state("supervisor.goodreciept-view", { url: "/goodreciept-view", views: { supervisorContent: { templateUrl: "app/views/supervisor/goodreceipt-view.html", controller: "supGoodRecieptViewCtrl as vm" } } })

      .state("supervisor.transferinwards", { url: "/transferinwards", views: { supervisorContent: { templateUrl: "app/views/supervisor/transferinwards.html", controller: "supTransferInwardListCtrl as vm" } } })
      .state("supervisor.transferinward-view", { url: "/transferinward-view", views: { supervisorContent: { templateUrl: "app/views/supervisor/transferinward-view.html", controller: "supTransferInwardViewCtrl as vm" } } })

      .state("supervisor.picklist", { url: "/picklist", views: { supervisorContent: { templateUrl: "app/views/supervisor/picklist.html", controller: "supPickListCtrl as vm" } } })
      .state("supervisor.picklist-view", { url: "/picklist-view", views: { supervisorContent: { templateUrl: "app/views/supervisor/picklist-view.html", controller: "supPickListViewCtrl as vm" } } })

      .state("supervisor.putaways", { url: "/putaways", views: { supervisorContent: { templateUrl: "app/views/supervisor/putaways.html", controller: "supPutawayListCtrl as vm" } } })
      .state("supervisor.putaway-view", { url: "/putaway-view", views: { supervisorContent: { templateUrl: "app/views/supervisor/putaway-view.html", controller: "supPutawayViewCtrl as vm" } } })





    $urlRouterProvider.otherwise('/access/login');
    $httpProvider.interceptors.push('authInterceptorService');
  })

app.config(["toastrConfig", function (toastrConfig) {
  const options = {
    "positionClass": "toast-bottom-center",
    "timeOut": 8000,
  }
  angular.extend(toastrConfig, options);
}]);

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.timeout = 5000;
}]);

app.run(function ($rootScope, authService, appSettings, localStorageService, $state, sharedSvc) {
  // setup loggedIn username
  var isloggedIn = sharedSvc.getStorage("authorizationData");
  const group = sharedSvc.getStorage('groupName');

  $rootScope.username = "login";
  $rootScope.notification = [];
  if (isloggedIn != null) {
    // $rootScope.username = sharedSvc.getStorage("authorizationData").userName;
    // $rootScope.userrole = sharedSvc.getStorage("authorizationData").role;
    // $rootScope.showMenu = isloggedIn.initialLogin.toLowerCase() === 'false' ? true : false;
    // $rootScope.ownerID = sharedSvc.getStorage("authorizationData").id;
  }


  $rootScope.logout = function () {
    sharedSvc.resetStorageParam();
    $state.go("access.login");
  };

  $rootScope.refresh = function () {
    $state.reload();
  }

  authService.fillAuthData();
  $rootScope.baseUrl = appSettings.serverPath;
  $rootScope.baseImageUrl = appSettings.imagePath;
  $rootScope.showAdminMenu = false;
  $rootScope.copyrightDate = new Date();
  $rootScope.nonSupervisorRoles = ["counter", "dispatcher", "checker", "picker"];

  $rootScope.Refresh = function () {
    $state.reload();
  };


  $rootScope.$on('$stateChangeStart', function (event, next, current) {
      // alert('About to change Route')
    if (next.name === "access.login") {
      return;
    } else if (sharedSvc.getStorage("authorizationData") === null) {
      event.preventDefault();
      return $state.go("access.login");
    } 
   })

  // function isSupervisorRole(){
  //   var currentRole = sharedSvc.getStorage('groupName');
  //   if (currentRole) {
  //     var exists = $rootScope.nonSupervisorRoles.indexOf(currentRole.toLowerCase()) === -1;
  //     return exists;
  //   }
  //   return false;
  // }
});



var cordovaApp = {
  // Application Constructor
  initialize: function() {
      document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  onDeviceReady: function() {
      this.receivedEvent('deviceready');
  },

  // Update DOM on a Received Event
  receivedEvent: function() {
  }
};

cordovaApp.initialize();
