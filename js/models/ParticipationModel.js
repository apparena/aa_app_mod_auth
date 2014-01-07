define([
    'ModelExtend',
    'underscore',
    'backbone'
], function (Model,_, Backbone) {
    'use strict';

    Model.namespace = 'authParticipations';

    Model.code = Backbone.Model.extend({

        defaults: {
            door_id:        null,
            participations: 0
        }
    });

    return Model;
});