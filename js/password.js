define([
    'underscore',
    'modules/auth/js/views/PasswordLostView',
    'modules/auth/js/views/PasswordGetNewView'
], function (_, PasswordLostView, PasswordGetNewView) {

    'use strict';

    return function (id) {
        //_.debug.log('show password lost, given ID: ', id);

        $('.modal').modal('hide');
        $('.modal-backdrop').remove();

        if (_.isUndefined(id)) {
            //passwordView = new PasswordLostView();
            if (_.isUndefined(_.singleton.view.passwordLost)) {
                _.singleton.view.passwordLost = new PasswordLostView();
            }
            _.singleton.view.passwordLost.render();
        } else {
            //_.debug.log(id);
            //passwordView = new PasswordGetNewView({'id': id});
            if (_.isUndefined(_.singleton.view['passwordGetNew' + id])) {
                _.singleton.view['passwordGetNew' + id] = new PasswordGetNewView({'id': id});
            }
            _.singleton.view['passwordGetNew' + id].render();
        }
    };
});