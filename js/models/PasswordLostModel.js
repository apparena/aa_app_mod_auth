define([
    'ModelExtend',
    'underscore',
    'backbone',
    'localstorage'
], function (Model, _, Backbone) {
    'use strict';

    return function () {
        Model.namespace = 'authPasswordLost';

        Model.code = Backbone.Model.extend({
            localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.i_id + '_PasswordLost'),

            defaults: {
                email: ''
            },

            initialize: function () {
                this.fetch();
            }
        });

        return Model;
    }
});