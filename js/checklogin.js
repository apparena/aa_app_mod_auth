define([
    'underscore',
    'modules/aa_app_mod_auth/js/views/LoginView'
], function (_, LoginView) {
//test
    'use strict';

    return function () {
        var loginView = LoginView.init();
        // handle only the navigation on first app call
        loginView.handleNavigation();
        //loginView.goTo('', false);
        _.router.goToPreviewsPage(false);
        loginView.remove();
    };
});