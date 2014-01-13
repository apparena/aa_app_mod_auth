define(function () {
    'use strict';

    return function (type) {
        var action = type || 'login';
        if (action === 'login') {
            require(['modules/auth/js/views/LoginView'], function (LoginView) {
                LoginView().init().render().addRedirection('page/auth/demo-register-modal/userdata').renderPage();
            });
        } else {
            require([
                'modules/auth/js/views/UserDataView',
                'modules/auth/js/views/LoginView'
            ], function (UserDataView, LoginView) {
                var loginView = LoginView().init(),
                    element = $('.content-wrapper'),
                    userDataView = UserDataView().init({
                        attributes: {
                            model: loginView.loginModel
                        }
                    });
                userDataView.modifyElement(element).userInformation();
                if (userDataView.status === 'needUserdata') {
                    // show userdata page
                    userDataView.renderPage();
                } else {
                    // all userdata exist, redirect to startpage
                    _.navigate('');
                }
            });
        }
    };
});