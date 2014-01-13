define(['underscore'], function (_) {
    'use strict';

    return function (type) {
        var action = type || 'login';
        if (action === 'login') {
            require(['modules/auth/js/views/LoginView'], function (LoginView) {
                var loginView = LoginView().init(),
                    el = loginView.$el;
                loginView.render().addRedirection('page/auth/demo-register-modal/userdata').renderModal();
                // hide comment box to disable problems in IE
                $('#comment-box').hide();
                // set eventlistener to modal hide
                el.on('hidden.bs.modal', function () {
                    el.off('hidden.bs.modal');
                    $('#comment-box').show();
                    LoginView().remove();
                });
            });
        } else {
            require([
                'modules/auth/js/views/UserDataView',
                'modules/auth/js/views/LoginView'
            ], function (UserDataView, LoginView) {
                var element,
                    loginView = LoginView().init(),
                    userDataView = UserDataView().init({
                        attributes: {
                            model: loginView.loginModel
                        }
                    }).userInformation();
                if (userDataView.status === 'needUserdata') {
                    // show userdata modal
                    userDataView.renderModal();
                    element = userDataView.$el;
                    element.on('hidden.bs.modal', function () {
                        element.off('hidden.bs.modal');
                        UserDataView().remove();
                    });
                } else {
                    // all userdata exist, redirect to startpage
                    _.navigate('');
                }
            });
        }
    };
});