define([
    'underscore',
    'modules/aa_app_mod_auth/js/views/LoginView'
], function (_, LoginView) {
    'use strict';

    return function () {
        LoginView().init();
        // handle only the navigation on first app call
        LoginView().init().handleNavigation();
        //loginView.goTo('', false);
        _.router.navigate('', {trigger: true});
    };
});