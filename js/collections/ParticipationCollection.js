define([
    'CollectionExtend',
    'underscore',
    'backbone',
    'modules/aa_app_mod_auth/js/models/ParticipationModel',
    'localstorage'
], function (Collection, _, Backbone, ParticipateModel) {
    'use strict';

    return function () {
        Collection.namespace = 'authParticipation';

        Collection.code = Backbone.Collection.extend({
            localStorage: new Backbone.LocalStorage('aa_app_mod_auth_' + _.aa.instance.i_id + '_Participations'),

            model: ParticipateModel().code,

            initialize: function () {
                this.fetch();
            }
        });

        return Collection;
    }
});