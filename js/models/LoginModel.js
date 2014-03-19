define([
    'ModelExtend',
    'underscore',
    'backbone',
    'localstorage'
], function (Model, _, Backbone) {
    'use strict';

    return function () {
        Model.namespace = 'authLogin';

        Model.code = Backbone.Model.extend({
            localStorage: new Backbone.LocalStorage('AppArenaTippspielApp_' + _.aa.instance.i_id + '_UserLogin'),

            defaults: {
                uid:        '0',
                gid:        '0',
                sid:        null,
                user_type:  '',
                login_type: 'appuser',
                session:    '',
                action:     'login',
                module:     'aa_app_mod_auth',
                avatar:     'https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=128&d=mm',
                email:      '',
                logintime:  ''
            }
        });

        return Model;
    }
});