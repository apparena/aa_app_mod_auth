define([
    'underscore',
    'modules/auth/js/views/LoginView'
], function (_, LoginView) {
    'use strict';

    return function () {
        var loginView = LoginView().init(),
            el = loginView.$el;
        loginView.render().renderModal();
        $('#comment-box').hide();
        el.on('hidden.bs.modal', function () {
            el.off('hidden.bs.modal');
            $('#comment-box').show();
            LoginView().remove();
        });
    };
});