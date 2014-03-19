define([
    'ModelExtend',
    'underscore',
    'backbone'
], function (Model, _, Backbone) {
    'use strict';

    return function () {
        Model.namespace = 'userData';

        Model.code = Backbone.Model.extend({

            defaults: { },

            urlRoot: 'api/rest/index.php/' + _.aa.instance.i_id + '/users/' + _.uid

        });
        return Model;
    }
});
