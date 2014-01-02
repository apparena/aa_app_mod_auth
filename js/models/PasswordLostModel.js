define([
    'underscore',
    'backbone',
    'localstorage'
], function (_, Backbone) {
    'use strict';

    var namespace = 'authPasswordLost',
        Model, Init, Remove, Instance;

    Model = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.aa_inst_id + '_PasswordLost'),

        defaults: {
            email: ''
        },

        initialize: function () {
            this.fetch();
        }
    });

    Remove = function () {
        _.singleton.model[namespace].unbind().remove();
        delete _.singleton.model[namespace];
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