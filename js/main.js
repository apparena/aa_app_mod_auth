define([
    'underscore',
    'modules/auth/js/views/LoginView'
], function (_, LoginView) {
    'use strict';

    return function () {
        LoginView().init().render().renderPage();
    };
});