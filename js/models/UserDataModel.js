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
            localStorage: new Backbone.LocalStorage('AppArenaTippspielApp_' + _.aa.instance.i_id + '_UserData'),

            updateFromDatabase: true,

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
                module:         'aa_app_mod_auth'
            },

            initialize: function () {
                this.on('change', this.disableUpdateFromDatabase, this);
                this.fetch();
            },

            disableUpdateFromDatabase: function(){
                this.updateFromDatabase = false;
            }

        });

        return Model;
    }
});