define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'modules/aa_app_mod_auth/js/models/StatsModel',
    'text!modules/aa_app_mod_auth/templates/statistics.html'
], function (View, $, _, Backbone, StatsModel, StatsTemplate) {
    'use strict';

    return function () {
        View.namespace = 'statsView';

        View.code = Backbone.View.extend({

            el: '#statsBox',

            events: {
                'click #stats-button': 'showMyStats'
            },

            initialize: function () {
                _.bindAll(this, 'render', 'showMyStats');
                this.statsModel = StatsModel().init();
                this.statsModel.clear();
                this.statsModel.fetch({
                    url: 'api/rest/index.php/' + _.aa.instance.i_id + '/users/' + _.uid + '/score/' + _.currentDay
                });

                if ( !this.statsModel.attributes.length ) {
                    this.statsModel.fetch({
                        url: 'api/rest/index.php/' + _.aa.instance.i_id + '/users/' + _.uid + '/score/' + _.prevMatch
                    });
                }

                this.listenTo(this.statsModel, 'change', this.render);

            },

            render: function(){
                var compiledTemplate = _.template(StatsTemplate, this.statsModel.attributes);
                if ( $('#statistics').length != 1 ) {
                    this.$el.append(compiledTemplate);
                } else {
                    this.$el.append(compiledTemplate);
                    $('#statistics').detach();
                }
                $('#sign-in').hide();
                $('body #statistics').find('img').attr('src', _.avatar);
                return this;
            },

            showMyStats: function(){
                var $btn = $('#stats-button');
                $btn.button('loading');
                    window.location = '#page/profile';
                setTimeout(function () {
                    $btn.button('reset');
                }, 2000);
            }


        });

        return View;
    }
});