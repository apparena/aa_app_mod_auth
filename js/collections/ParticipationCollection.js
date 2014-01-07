define([
    'underscore',
    'backbone',
    'modules/auth/js/models/ParticipationModel',
    'localstorage'
], function (_, Backbone, ParticipateModel) {

    'use strict';

    var namespace = 'authParticipation',
        Collection, Init, Remove, Instance;

    Collection = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.aa_inst_id + '_Participations'),

        model: ParticipateModel,

        initialize: function () {
            this.fetch();
        }
    });

    Remove = function () {
        if (!_.isUndefined(_.singleton.collection[namespace])) {
            _.singleton.collection[namespace].stopListening().undelegateEvents().reset();
            delete _.singleton.collection[namespace];
        }
    };

    Init = function (init) {

        if (_.isUndefined(_.singleton.collection[namespace])) {
            _.singleton.collection[namespace] = new Collection();
        } else {
            if (!_.isUndefined(init) && init === true) {
                Remove();
                _.singleton.collection[namespace] = new Collection();
            }
        }

        return _.singleton.collection[namespace];
    };

    Instance = function () {
        return _.singleton.collection[namespace];
    };

    return {
        init:        Init,
        collection:  Collection,
        remove:      Remove,
        namespace:   namespace,
        getInstance: Instance
    };
});