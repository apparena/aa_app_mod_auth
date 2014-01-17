define([
    'modules/aa_app_mod_auth/js/views/LoginView'
], function (LoginView) {
    'use strict';

    return function () {
        var loginView = LoginView().init(),
            el = loginView.$el;
        loginView.render().renderModal();
        // hide comment box to disable problems in IE
        $('#comment-box').hide();
        // set eventlistener to modal hide
        el.on('hidden.bs.modal', function () {
            el.off('hidden.bs.modal');
            $('#comment-box').show();
            LoginView().remove();
        });
    };
});