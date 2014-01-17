define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'text!modules/auth/templates/passwordLost.html',
    'jquery.validator_config',
    'jquery.serialize_object'
], function (View, $, _, Backbone, PasswordLostTemplate) {
    'use strict';

    return function () {
        View.namespace = 'authPasswordLost';

        View.code = Backbone.View.extend({
            el: $('.content-wrapper'),

            events: {
                'click #submit-pwlost': 'submit'
            },

            initialize: function () {
                _.bindAll(this, 'render', 'submit', 'callbackHandler');
            },

            render: function () {
                var compiledTemplate = _.template(PasswordLostTemplate, {});
                this.$el.html(compiledTemplate);
            },

            submit: function (btn) {
                this.btn_obj = this.$('#' + btn.target.id);
                this.form = this.btn_obj.closest('form');

                var that = this,
                    form_data = (this.form) ? this.form.serializeObject() : {},
                    mailSettings = {
                        'recipient': form_data.email,
                        'mailtype':  'pwlost'
                    };

                this.form.validate({
                    rules:    {
                        email: {
                            required: true,
                            email:    true
                        }
                    },
                    messages: {
                        email: {
                            required: _.t('msg_require_mail'),
                            email:    _.t('msg_require_mail_format')
                        }
                    }
                });

                if (this.form.valid()) {
                    this.btn_obj.button('loading');
                    this.form.find('fieldset').prop('disabled', true);

                    require([
                        'modules/optivo/js/views/OptivoView',
                        'modules/auth/js/models/PasswordLostModel'
                    ], function (OptivoView, PasswordLostModel) {
                        var optivo = OptivoView().init(),
                            passwordLostModel;

                        optivo.sendTransactionMail(mailSettings, function (resp) {
                            that.callbackHandler(resp);
                            passwordLostModel = PasswordLostModel().init();
                            passwordLostModel.set('email', form_data.email);
                            passwordLostModel.save();
                        });
                    });
                }
            },

            callbackHandler: function (resp) {
                var that = this;
                require([
                    'modules/facebook/js/views/FacebookView',
                    'modules/notification/js/views/NotificationView'
                ], function (FacebookView, NotificationView) {
                    var facebook = FacebookView().init();

                    // define notification position in facebook tabs. works also on normal pages
                    facebook.getScrollPosition(function (position) {
                        // define default notification message
                        var options = {
                            title:       _.t('msg_mail_pwlost_title_error'),
                            description: _.t('msg_mail_pwlost_desc_error'),
                            type:        'error'
                        };

                        // overwrite message, if status is success
                        if (resp.data.status === 'success') {
                            options = {
                                title:       _.t('msg_mail_pwlost_title_success'),
                                description: _.t('msg_mail_pwlost_desc_success'),
                                type:        'success'
                            };
                        }

                        // define notification position
                        if (position !== false) {
                            options.before_open = function (pnotify) {
                                pnotify.css({
                                    'top':  position.top,
                                    'left': 810 - pnotify.width()
                                });
                            };
                            options.position = '';
                        }

                        // show notification
                        NotificationView().init().setOptions(options, true).show();

                        // reset form and button
                        that.btn_obj.button('reset');
                        that.form.find('fieldset').prop('disabled', false);
                    });
                });
            }
        });

        return View;
    }
});