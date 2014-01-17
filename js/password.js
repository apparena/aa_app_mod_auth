define([
    'underscore'
], function (_) {

    'use strict';

    return function (id) {
        /*$('.modal').modal('hide');
         $('.modal-backdrop').remove();*/

        if (_.isUndefined(id)) {
            require(['modules/aa_app_mod_auth/js/views/PasswordLostView'], function (PasswordLostView) {
                PasswordLostView().init().render();
            });
        } else {
            /*if (_.isUndefined(_.singleton.view['passwordGetNew' + id])) {
             _.singleton.view['passwordGetNew' + id] = new PasswordGetNewView({'id': id});
             }
             _.singleton.view['passwordGetNew' + id].render();*/

            require(['modules/aa_app_mod_auth/js/views/PasswordGetNewView'], function (PasswordGetNewView) {
                PasswordGetNewView().init({
                    'attributes': {
                        secret: id
                    }
                }).render();
            });
        }
    };
});