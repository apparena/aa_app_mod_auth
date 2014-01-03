define([
    'underscore',
    'modules/auth/js/views/LoginView'
], function (_, LoginView) {
//test
    'use strict';

    return function () {
        var loginView = LoginView.init();
        loginView.render().renderModal();
        $('#comment-box').hide();
        loginView.modal_obj.on('hidden.bs.modal', function () {
            $('#comment-box').show();
            loginView.destroy();
            delete _.singleton.view.login;
        });
    };
});