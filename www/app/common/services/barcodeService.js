(function () {
    'use strict';
    angular.module('app').factory('barcodeService', ['$rootScope', function ($rootScope) {

            alert("entering  barcode service");
            var barcode = {};
            barcode.loadBarcodeScanner = loadBarcodeScanner;
            return barcode;

            // Barcode Implementation
            function loadBarcodeScanner() {
                alert("loading scanner");
                var elements = document.querySelectorAll(".barcode");
                elements.forEach(element => {
                    if (element !== undefined) {
                        element.addEventListener("click", function (event) {
                            scanBarCode(event.target);
                        })
                    }
                    alert('Event attached to DOM successfully');
                    // console.log(element);
                });

            }

            function scanBarCode(source) {
                // console.log(cordova.plugins);
                alert("about to scan")
                cordova.plugins.barcodeScanner.scan(
                    function (result) {
                        if (!result.cancelled) {
                            $rootScope.$emit('BarcodeCaptured', result.text);
                            source.value = result.text;
                        }
                    },
                    function (error) {
                        alert("Scanning failed: " + error);
                    },
                    {
                        preferFrontCamera: false, // iOS and Android
                        showFlipCameraButton: true, // iOS and Android
                        showTorchButton: true, // iOS and Android
                        torchOn: false, // Android, launch with the torch switched on (if available)
                        saveHistory: false, // Android, save scan history (default false)
                        prompt: "Place a barcode inside the scan area", // Android
                        resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                        // formats : "QR_CODE,PDF_417", // default: all but PDF_417  and RSS_EXPANDED
                        // orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                        disableAnimations: true, // iOS
                        disableSuccessBeep: false // iOS and Android
                    }
                );
            }
        }]);
})();
