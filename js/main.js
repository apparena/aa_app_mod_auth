define([
    'modules/auth/js/views/LoginView'
], function (LoginView) {
    'use strict';

    return function () {
        LoginView().init().render().renderPage();
    };
});