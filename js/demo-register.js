define([
    'underscore'
], function (_) {
    'use strict';

    return function (type) {
        var action = type || 'login';
        if (action === 'login') {
            require(['modules/aa_app_mod_auth/js/views/LoginView'], function (LoginView) {
                LoginView().init().render().addRedirection('page/auth/demo-register/userdata').renderPage();
            });
        } else {
            require([
                'modules/aa_app_mod_auth/js/views/UserDataView',
                'modules/aa_app_mod_auth/js/views/LoginView'
            ], function (UserDataView, LoginView) {
                var loginView = LoginView().init(),
                    element = $('.content-wrapper'),
                    userDataView = UserDataView().init({
                        attributes: {
                            model: loginView.loginModel
                        }
                    });
                userDataView.modifyElement(element).defineUserInformation(function () {
                    if (userDataView.status === 'needUserdata') {
                        // show userdata page
                        userDataView.renderPage();
                    } else {
                        // all userdata exist, redirect to startpage
                        _.router.navigate('', {trigger: true});
                    }
                });
            });
        }
    };
});