define([
    'jquery',
    'underscore',
    'backbone',
    'text!modules/auth/templates/passwordLost.html',
    'modules/optivo/js/views/OptivoView',
    'modules/auth/js/models/PasswordLostModel'
], function ($, _, Backbone, PasswordLostTemplate, OptivoView, PasswordLostModel) {
    'use strict';

    var namespace = 'authPasswordLost',
        View, Init, Remove, Instance;

    View = Backbone.View.extend({
        el: $('.content-wrapper'),

        events: {
            'click #submit-pwlost': 'submit'
        },

        initialize: function () {
            _.bindAll(this, 'render', 'submit');
            //this.render();
        },

        render: function () {
            var that = this,
                compiledTemplate = _.template(PasswordLostTemplate, {});
            this.$el.html(compiledTemplate);

            _.delay(function () {
                that.goTo('page/participate/password');
            }, 500);
        },

        submit: function (btn) {
            //_.debug.log('submit form', btn, btn.target.id);

            this.btn_obj = $('#' + btn.target.id);
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

                if (_.isUndefined(_.singleton.view.optivo)) {
                    _.singleton.view.optivo = new OptivoView();
                }
                _.singleton.view.optivo.sendTransactionMail(mailSettings, function (resp) {
                    that.callbackHandler(resp);
                    var passwordLostModel = new PasswordLostModel({id: 1});
                    passwordLostModel.set('email', form_data.email);
                    passwordLostModel.save();
                });
            }
        },

        callbackHandler: function (resp) {
            //_.debug.log('mail versandt, nun alles resetten');
            var that = this;

            _.singleton.view.facebook.getScrollPosition(function (position) {
                var options = {
                    title:       _.t('msg_mail_pwlost_title_error'),
                    description: _.t('msg_mail_pwlost_desc_error'),
                    type:        'error'
                };

                if (resp.data.status === 'success') {
                    options = {
                        title:       _.t('msg_mail_pwlost_title_success'),
                        description: _.t('msg_mail_pwlost_desc_success'),
                        type:        'success'
                    };
                }

                if (position !== false) {
                    options.before_open = function (pnotify) {
                        pnotify.css({
                            'top':  position.top,
                            'left': 810 - pnotify.width()
                        });
                    };
                    options.position = '';
                }

                _.singleton.view.notification.setOptions(options, true).show();

                // reset form and button
                that.btn_obj.button('reset');
                that.form.find('fieldset').prop('disabled', false);
            });
        }
    });

    Remove = function () {
        if (!_.isUndefined(_.singleton.view[namespace])) {
            _.singleton.view[namespace].stopListening().undelegateEvents().remove();
            delete _.singleton.view[namespace];
        }
    };

    Init = function (init) {

        if (_.isUndefined(_.singleton.view[namespace])) {
            _.singleton.view[namespace] = new View();
        } else {
            if (!_.isUndefined(init) && init === true) {
                Remove();
                _.singleton.view[namespace] = new View();
            }
        }

        return _.singleton.view[namespace];
    };

    Instance = function () {
        return _.singleton.view[namespace];
    };

    return {
        init:        Init,
        view:        View,
        remove:      Remove,
        namespace:   namespace,
        getInstance: Instance
    };
});