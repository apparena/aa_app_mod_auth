define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'text!modules/aa_app_mod_auth/templates/passwordGetNew.html',
    'modules/aa_app_mod_auth/js/models/PasswordLostModel',
    'jquery.validator_config',
    'jquery.serialize_object'
], function (View, $, _, Backbone, PasswordGetNewTemplate, PasswordLostModel) {
    'use strict';

    return function () {
        View.namespace = 'authGetNewPassword';

        View.code = Backbone.View.extend({
            el: $('.content-wrapper'),

            events: {
                'click #submit-getnewpw': 'submit'
            },

            moduleName: 'auth',

            initialize: function (settings) {
                _.bindAll(this, 'render', 'redirectToPwLost', 'submit', 'callbackHandler');

                this.secret = settings.secret || '';

                if (_.isEmpty(this.secret)) {
                    this.redirectToPwLost();
                    return false;
                }
                return this;
            },

            render: function () {
                var secret_id = this.ajax({
                    module: this.moduleName,
                    action: 'getPasswortSecretId',
                    secret: this.secret
                });

                this.passwordLostModel = PasswordLostModel().init();

                if (secret_id.data.message !== this.secret) {
                    this.redirectToPwLost();
                }

                this.template = _.template(PasswordGetNewTemplate, {
                    'secret_id': this.secret,
                    'email':     this.passwordLostModel.get('email')
                });
                this.$el.html(this.template);

                // redirect to get the same body class like the password call page
                this.goTo('call/auth-password');
            },

            redirectToPwLost: function () {
                this.goTo('page/auth/password');
                return false;
            },

            submit: function () {
                this.form = this.$('form');
                this.btn_obj = this.form.find('button');

                var that = this,
                    form_data = (this.form) ? this.form.serializeObject() : {};

                // add new validation method
                $.validator.addMethod('password_must_same', function (value, element) {
                    return that.form.find('#password').val() === value;
                }, 'Passwords are not the same');

                // define validation requirements
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

                // validate and start ajax call on success
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
                var that = this;

                require([
                    'modules/aa_app_mod_facebook/js/views/FacebookView',
                    'modules/aa_app_mod_notification/js/views/NotificationView'
                ], function (FacebookView, NotificationView) {
                    var facebook = FacebookView().init();

                    // define notification position in facebook tabs. works also on normal pages
                    facebook.getScrollPosition(function (position) {
                        // define default notification message
                        var options = {
                            title:       _.t('msg_mail_pwgetnew_title_error'),
                            description: _.t('msg_mail_pwgetnew_desc_error'),
                            type:        'error'
                        };

                        // overwrite message, if status is success
                        if (resp.data.status === 'success') {
                            options = {
                                title:       _.t('msg_mail_pwgetnew_title_success'),
                                description: _.t('msg_mail_pwgetnew_desc_success'),
                                type:        'success'
                            };
                            that.passwordLostModel.unset('email');
                            that.passwordLostModel.save();
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

                        if (resp.data.status === 'success') {
                            that.goTo('');
                            return that;
                        }

                        // reset form and button
                        that.btn_obj.button('reset');
                        that.form.find('fieldset').prop('disabled', false);
                        return that;
                    });
                });
            }
        });

        return View;
    }
});