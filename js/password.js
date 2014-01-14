define([
    'underscore'
], function (_) {

    'use strict';

    return function (id) {
        /*$('.modal').modal('hide');
         $('.modal-backdrop').remove();*/

        if (_.isUndefined(id)) {

            /*if (_.isUndefined(_.singleton.view.passwordLost)) {
             _.singleton.view.passwordLost = new PasswordLostView();
             }
             _.singleton.view.passwordLost.render();*/

            require(['modules/auth/js/views/PasswordLostView'], function (PasswordLostView) {
                PasswordLostView().init().render();
            });
        } else {
            /*if (_.isUndefined(_.singleton.view['passwordGetNew' + id])) {
             _.singleton.view['passwordGetNew' + id] = new PasswordGetNewView({'id': id});
             }
             _.singleton.view['passwordGetNew' + id].render();*/

            require(['modules/auth/js/views/PasswordGetNewView'], function (PasswordGetNewView) {
                PasswordGetNewView().init({'id': id}).render();
            });
        }
    };
});