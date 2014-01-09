define(function () {
    'use strict';

    return function (type) {
        var action = type || 'login';
        if (action === 'login') {
            require(['modules/auth/js/views/LoginView'], function (LoginView) {
                LoginView().init().render().renderPage('page/auth/demo-register/userdata');
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
                if(userDataView.status === 'needUserdata') {
                    userDataView.render();
                } else {
                    _.navigate('');
                }
            });
        }
    };
});