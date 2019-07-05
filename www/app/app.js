'use strict';
var app = angular.module('app', ['ui.router', 'common.services', 'LocalStorageModule', 'ui.bootstrap', 'toastr', 'sweetalert', 'ngMessages'])
  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
    $stateProvider

      .state('index', { url: '/index', abstract: true, templateUrl: 'app/common/masterPage.html' })
      .state('access', { url: '/access', abstract: true, templateUrl: 'app/common/loginMaster.html' })
      .state('main', { url: '/main', abstract: true, templateUrl: 'app/common/masterPage.html' })

      .state('index.dashboard', { url: '/dashboard', views: { 'mainContent': { templateUrl: 'app/views/dashboard/dashboard.html', controller: 'dashboardCtrl as vm' } } })

      /// Auth Module
      .state('access.login', { url: '/login', views: { 'loginContent': { templateUrl: 'app/views/access/login.html', controller: 'loginCtrl as vm' } } })

      // Modules
      .state("main.goodreciepts", { url: "/goodreciepts", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipts.html", controller: "goodRecieptListCtrl as vm" } } })
      .state("main.goodreciept-view", { url: "/goodreciept-view", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipt-view.html", controller: "goodRecieptViewCtrl as vm" } } })
      .state("main.goodreciept-new", { url: "/goodreciept-new", views: { mainContent: { templateUrl: "app/views/goodreciept/goodreceipt-new.html", controller: "goodRecieptNewCtrl as vm" } } })

      .state("main.picklist", { url: "/picklist", views: { mainContent: { templateUrl: "app/views/picklist/picklist.html", controller: "picklistCtrl as vm" } } })
      .state("main.picklist-new", { url: "/picklist-new", views: { mainContent: { templateUrl: "app/views/picklist/picklist-new.html", controller: "picklistNewCtrl as vm" } } })

      .state("main.putaways", { url: "/putaways", views: { mainContent: { templateUrl: "app/views/putaway/putaways.html", controller: "putawayListCtrl as vm" } } })
      .state("main.putaway-new", { url: "/putaway-new", views: { mainContent: { templateUrl: "app/views/putaway/putaway-new.html", controller: "putawayNewCtrl as vm" } } })

      .state("main.success", { url: "/success", views: { mainContent: { templateUrl: "app/views/util/success.html", controller: "utilCtrl as vm" } } })


    $urlRouterProvider.otherwise('/access/login');
    $httpProvider.interceptors.push('authInterceptorService');
  })

app.config(["toastrConfig", function (toastrConfig) {
  const options = {
    "positionClass": "toast-bottom-center",
    "timeOut": 3000,
  }
  angular.extend(toastrConfig, options);
}]);

app.run(function ($rootScope, authService, appSettings, localStorageService, $state, sharedSvc) {
  // setup loggedIn username
  var isloggedIn = sharedSvc.getStorage("authorizationData");
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

  $rootScope.Refresh = function () {
    $state.reload();
  };

  $rootScope.$on('$stateChangeStart', function (event, next) {
    if (next.name === "access.login") {
      return;
    } else if (sharedSvc.getStorage("authorizationData") === null) {
      event.preventDefault();
      return $state.go("access.login");
    }
  })

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
