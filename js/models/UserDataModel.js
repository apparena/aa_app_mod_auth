define([
    'underscore',
    'backbone',
    'localstorage'
], function (_, Backbone) {
    'use strict';

    var namespace = 'authUserData',
        Model, Init, Remove, Instance;

    Model = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.aa_inst_id + '_UserData'),

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

    Remove = function () {
        if (!_.isUndefined(_.singleton.model[namespace])) {
            _.singleton.model[namespace].stopListening().undelegateEvents().clear();
            delete _.singleton.model[namespace];
        }
    };

    Init = function (init) {

        if (_.isUndefined(_.singleton.model[namespace])) {
            _.singleton.model[namespace] = new Model();
        } else {
            if (!_.isUndefined(init) && init === true) {
                Remove();
                _.singleton.model[namespace] = new Model();
            }
        }

        return _.singleton.model[namespace];
    };

    Instance = function () {
        return _.singleton.model[namespace];
    };

    return {
        init:        Init,
        model:       Model,
        remove:      Remove,
        namespace:   namespace,
        getInstance: Instance
    };
});