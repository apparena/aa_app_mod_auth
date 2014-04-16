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
            localStorage: new Backbone.LocalStorage('aa_app_mod_auth_' + _.aa.instance.i_id + '_UserLogin'),

            defaults: {
                uid:        '0',
                gid:        '0',
                sid:        null,
                user_type:  '',
                login_type: 'appuser',
                type:       '',
                session:    '',
                action:     'Auth',
                module:     'aa_app_mod_auth',
                avatar:     {},
                email:      '',
                logintime:  ''
            }
        });

        return Model;
    }
});