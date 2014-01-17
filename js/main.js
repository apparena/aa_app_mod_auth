define([
    'modules/aa_app_mod_auth/js/views/LoginView'
], function (LoginView) {
    'use strict';

    return function () {
        LoginView().init().render().renderPage();
    };
});