define([
    'ModelExtend',
    'underscore',
    'backbone',
    'localstorage'
], function (Model, _, Backbone) {
    'use strict';

    return function () {
        Model.namespace = 'authUserData';

        Model.code = Backbone.Model.extend({
            localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.i_id + '_UserData'),

            defaults: {
                email:          '',
                gender:         '',
                firstname:      '',
                lastname:       '',
                birthday:       '',
                street:         '',
                zip:            '',
                city:           '',
                field1:         '',
                field2:         '',
                field3:         '',
                optin_nl:       '0',
                optin_reminder: '0',
                terms:          'false',
                newsletter:     'false',
                reminder:       'false',
                action:         'data',
                module:         'auth'
            },

            initialize: function () {
                this.fetch();
            }
        });

        return Model;
    }
});