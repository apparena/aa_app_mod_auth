define([
    'underscore'
], function (_) {

    'use strict';

    return function (id) {
        if (_.isUndefined(id)) {
            require(['modules/aa_app_mod_auth/js/views/PasswordLostView'], function (PasswordLostView) {
                PasswordLostView().init({'init': true}).render();
            });
        } else {
            require(['modules/aa_app_mod_auth/js/views/PasswordGetNewView'], function (PasswordGetNewView) {
                PasswordGetNewView().init({
                    'init': true,

                    'attributes': {
                        secret: id
                    }
                }).render();
            });
        }
    };
});