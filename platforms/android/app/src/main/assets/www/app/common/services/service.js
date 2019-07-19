(function () {
    'use strict'
    angular.module('common.services')
        .factory('sharedSvc', ['$resource', '$rootScope', '$q', '$state', 'localStorageService', '$uibModal', function ($resource, $rootScope, $q, $state, localStorageService, $uibModal) {
            var _initialize = function (uri, id) {
                if (id === '' || id === null || id === undefined) {
                    return $resource($rootScope.baseUrl + uri, {}, {
                        'update': { method: 'PUT' },
                        'selectmany': { method: 'GET', isArray: true },
                        'save': { method: 'POST', responseStatusCode: status },
                        'fileUpload': { method: 'POST', headers: { 'Content-Type': undefined, enctype: 'multipart/form-data' } }
                        //'getvalue':{method: 'GET', isArray: false}
                    })
                }
                return $resource($rootScope.baseUrl + uri, { id: '@id' }, {
                    'update': { method: 'PUT' },
                    'selectmany': { method: 'GET', isArray: true }
                })
            }

            var _createStorageParam = function (key, value) {
                localStorageService.set(key, value);
            }

            var _clearStorageParam = function (key) {
                if (key != null || key !== undefined || key !== '')
                    localStorageService.remove(key);
            }

            var _resetStorageParam = function () {
                localStorageService.clearAll();
            }
            var _getStorage = function (key) {
                return localStorageService.get(key);
            }

            var _reload = function () {
                $state.reload();
            }

            
            function _drawChart(config, data) {
                var datasource = {};
                datasource.chart = config;
                datasource.data = data;
                return datasource;
            }

            var _showModal = function (size, templateUrl, controller, parentScope) {
                var modalInstance = $uibModal.open({
                    //animation: $ctrl.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: templateUrl,
                    controller: controller,
                    controllerAs: '$ctrl',
                    size: 'lg',
                    resolve: {
                        data: function () {
                            return parentScope
                        }
                    },
                    backdrop: 'static',
                });
                return modalInstance;
            }

            var _selectPage = function (pageSize, page, url) {
                var deferred = $q.defer();
                var _repository = _initialize(url);
                _repository.get({ maxPageSize: pageSize, page: page }, function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                })
                return deferred.promise;
            }

            var _toggleCurrency = function (value) {
                return value = !value;
            }

            var _getowner = function () {
                var owner = _getStorage('authorizationData');
                return owner;
            }


            function _getCurrentLocation() {
                var location = {};
                location.locationCode = _getStorage('DefaultLocationCode');
                location.locationName = _getStorage('DefaultLocationName');
                location.locationID = _getStorage('DefaultLocationID');
                return location;
            }

            var _autoLoadDoc = function (url) {
                var loadSvc = _initialize(url)
                var deferred = $q.defer();
                loadSvc.query(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err)
                })

            };

            var _loadStockState = function (transactionType) {
                var deferred = $q.defer();
                var _stockStateRepository = _initialize("api/utility/stockstate");
                _stockStateRepository.query({ transactionType: transactionType }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(err)
                })
                return deferred.promise;
            };

            return {
                initialize: _initialize,
                createStorageParam: _createStorageParam,
                clearStorageParam: _clearStorageParam,
                getStorage: _getStorage,
                showModal: _showModal,
                resetStorageParam: _resetStorageParam,
                drawChart: _drawChart,
                reload: _reload,
                selectPage: _selectPage,
                toggleCurrency: _toggleCurrency,
                getowner: _getowner,
                autoLoadDoc: _autoLoadDoc,
                getCurrentLocation: _getCurrentLocation,
                loadStockState: _loadStockState

            }
        }])
}())