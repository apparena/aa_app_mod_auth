define([
    'ModelExtend',
    'underscore',
    'backbone'
], function (Model, _, Backbone) {
    'use strict';

    return function () {
        Model.namespace = 'userStats';

        Model.code = Backbone.Model.extend({

            defaults: {

            },

            url: 'api/rest/index.php/' + _.aa.instance.i_id + '/users/' + _.uid + '/score/' + _.prevMatch

        });
        return Model;
    }
});
