define([
    'CollectionExtend',
    'underscore',
    'backbone',
    'modules/auth/js/models/ParticipationModel',
    'localstorage'
], function (Collection, _, Backbone, ParticipateModel) {
    'use strict';

    Collection.namespace = 'authParticipation';

    Collection.code = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage('AppArenaAdventskalenderApp_' + _.aa.instance.aa_inst_id + '_Participations'),

        model: ParticipateModel,

        initialize: function () {
            this.fetch();
        }
    });

    return Collection;
});