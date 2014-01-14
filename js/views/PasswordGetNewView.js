define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'text!modules/auth/templates/passwordGetNew.html',
    'modules/notification/js/views/NotificationView',
    'modules/auth/js/models/PasswordLostModel'
], function (View, $, _, Backbone, PasswordGetNewTemplate, NotificationView, PasswordLostModel) {
    'use strict';

    return function () {
        View.namespace = 'authGetNewPassword';

        View.code = Backbone.View.extend({
            el: $('.content-wrapper'),

            events: {
                'click #submit-getnewpw': 'submit'
            },

            moduleName: 'auth',

            initialize: function () {
                _.bindAll(this, 'render', 'redirectToPwLost', 'submit', 'callbackHandler');

                if (_.isUndefined(this.id) || this.id === '') {
                    this.redirectToPwLost();
                }
            },

            render: function () {
                var that = this,
                    secret_id = this.ajax({
                        module: this.moduleName,
                        action: 'getPasswortSecretId',
                        secret: this.id
                    });
                this.passwordLostModel = new PasswordLostModel({id: 1});

                if (secret_id.data.message !== this.id) {
                    this.redirectToPwLost();
                }

                this.template = _.template(PasswordGetNewTemplate, {
                    'secret_id': this.id,
                    'email':     this.passwordLostModel.get('email')
                });
                this.$el.html(this.template);

                _.delay(function () {
                    that.goTo('call/auth-password');
                }, 500);
            },

            redirectToPwLost: function () {
                this.goTo('page/auth/password');
                return false;
            },

            submit: function () {
                this.form = this.$el.find('form');
                this.btn_obj = this.form.find('button');

                var that = this,
                    form_data = (this.form) ? this.form.serializeObject() : {};

                // add new validation method
                $.validator.addMethod('password_must_same', function (value, element) {
                    return that.form.find('#password').val() === value;
                }, 'Passwords are not the same');

                this.form.validate({
                    debug: true,
                    rules: {
                        email: {
                            required: true,
                            email:    true
                        },

                        password: {
                            required:  true,
                            minlength: 3
                        },

                        password2: {
                            password_must_same: true
                        }
                    },

                    messages: {
                        email: {
                            required: _.t('msg_require_mail'),
                            email:    _.t('msg_require_mail_format')
                        },

                        password:  {
                            required:  _.t('msg_require_password'),
                            minlength: jQuery.format(_.t('msg_require_password_format'))
                        },
                        password2: _.t('msg_require_password_again')
                    }
                });

                if (this.form.valid()) {
                    this.btn_obj.button('loading');
                    this.form.find('fieldset').prop('disabled', true);

                    this.ajax({
                        module: this.moduleName,
                        action: 'setNewPassword',
                        data:   form_data
                    }, false, function (resp) {
                        that.callbackHandler(resp);
                    });
                }
            },

            callbackHandler: function (resp) {
                //_.debug.log('mail versandt, nun alles resetten');
                var that = this;

                if (_.isUndefined(_.singleton.view.notification)) {
                    _.singleton.view.notification = new NotificationView();
                }

                _.singleton.view.facebook.getScrollPosition(function (position) {
                    var options = {
                        title:       _.t('msg_mail_pwgetnew_title_error'),
                        description: _.t('msg_mail_pwgetnew_desc_error'),
                        type:        'error'
                    };

                    if (resp.data.status === 'success') {
                        options = {
                            title:       _.t('msg_mail_pwgetnew_title_success'),
                            description: _.t('msg_mail_pwgetnew_desc_success'),
                            type:        'success'
                        };
                        that.passwordLostModel.unset('email');
                        that.passwordLostModel.save();
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

                    if (resp.data.status === 'success') {
                        that.goTo('');
                        return that;
                    }

                    // reset form and button
                    this.btn_obj.button('reset');
                    this.form.find('fieldset').prop('disabled', false);

                    return that;
                });
                return this;
            }
        });

        return View;
    }
});