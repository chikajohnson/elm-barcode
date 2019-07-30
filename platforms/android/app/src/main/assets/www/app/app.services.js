(function () {
    'use strict'
    angular.module('common.services', ['ngResource'])
		.constant("appSettings", {
		    // Dev Environment
           // serverPath: "http://40.67.200.13:8090/",
           // imagePath: "http://40.67.200.13:8090/uploads/"
          serverPath: "http://192.168.2.108/deployment/",
          // serverPath: "http://localhost:19072/",
          imagePath: "http://localhost:60364/uploads/"
		})
}());