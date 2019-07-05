'use strict';
angular.module('common.services')
.factory('authService', ['$http', '$q', 'sharedSvc', 'appSettings', function ($http, $q, sharedSvc, appSettings) {

    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: ""
    };

   
    var _login = function (loginData) {

        // var data = "grant_type=password&username=" + loginData.email + "&password=" + loginData.password;
        var data = encodeURIComponent('grant_type') + '=' + encodeURIComponent('password') + '&' + encodeURIComponent('userName') + '=' + encodeURIComponent(loginData.userName) + '&' + encodeURIComponent('password') + '=' + encodeURIComponent(loginData.password);

        var deferred = $q.defer();

        $http.post(appSettings.serverPath + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded'  }})
        .then(function (response) {
            sharedSvc.createStorageParam('authorizationData', { token: response.data.access_token, userName: loginData.userName });
            sharedSvc.createStorageParam('userDetails', {userGroup: response.data.roles, userId: response.data.userId})

            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;

            deferred.resolve(response);

        }, function (err, status) {
            _logOut();
            deferred.reject(err);
        })

        return deferred.promise;

    };

    var _logOut = function () {

        sharedSvc.clearStorageParam('authorizationData');
        sharedSvc.clearStorageParam('userGroup');
        sharedSvc.resetStorageParam();

        _authentication.isAuth = false;
        _authentication.userName = "";

    };

    var _fillAuthData = function () {

        var authData = sharedSvc.getStorage('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
        }

    }

    authServiceFactory.login = _login;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;

    return authServiceFactory;
}]);