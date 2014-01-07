define([
    'ModelExtend',
    'underscore',
    'backbone',
    'localstorage'
], function (Model,_, Backbone) {
    'use strict';

    Model.namespace = 'authLogin';

    Model.code = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.aa_inst_id + '_UserLogin'),

        defaults:   {
            uid:        '0',
            gid:        '0',
            sid:        null,
            user_type:  '',
            login_type: 'appuser',
            session:    '',
            action:     'login',
            module:     'auth',
            avatar:     'https://secure.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=mm',
            email:      ''
        },
        initialize: function () {
        }
    });

    return Model;
});