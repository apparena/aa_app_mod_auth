define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    'use strict';

    var namespace = 'authParticipations',
        Model, Init, Remove, Instance;

    Model = Backbone.Model.extend({

        defaults: {
            door_id:        null,
            participations: 0
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