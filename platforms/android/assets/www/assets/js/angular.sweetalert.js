/**
 * Angular SweetAlert Wrapper
 * Reguired sweetAlert 2 library
 * Emtick Project
 * Written by: reuben2crown (reuben2crown@gmail.com)
 **/

(function () {
    'use strict'
    angular.module('sweetalert', [])
        .factory('swal', SweetAlert);

    function SweetAlert() {
        return window.swal;
    };
}());
