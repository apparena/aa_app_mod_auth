define([
    'jquery',
    'underscore',
    'backbone',
    'modules/auth/js/models/LoginModel',
    'text!modules/auth/templates/login.html',
    'text!modules/auth/templates/modal.html',
    'modules/notification/js/views/NotificationView',
    'modules/facebook/js/views/FacebookView',
    'modules/twitter/js/views/TwitterView',
    'modules/google/js/views/GoogleView',
    'text!modules/auth/templates/social_connect.html',
    'text!modules/auth/templates/mail_connect.html'
], function ($, _, Backbone, LoginModel, LoginTemplate, ModalTemplate, NotificationView, Facebook, Twitter, Google, SocialConnectTemplate, MailConnectTemplate) {

    'use strict';

    var namespace = 'authLogin',
        View, Init, Remove, Instance;

    View = Backbone.View.extend({
        el: $('body'),

        events: {
            'click #sign-in': 'mailLogin',
            'keyup :input':   'checkKeypress'
        },

        tmpUserData: null,

        initialize: function () {
            _.bindAll(this, 'render', 'loginProcess', 'mailLogin', 'fbLoginDone', 'twLoginDone', 'gpLoginDone');

            this.loginModel = LoginModel.init({
                id: 1
            });
            this.loginModel.on('change:uid', this.handleNavigation, this);

            this.notification = NotificationView.init();

            this.data = {
                'modal_id':   'sign-up-modal',
                'headline':   _.t('login_headline'),
                'show_close': true,
                'buttons':    {
                    /*'cancel': {
                     'btn_class': 'back pull-left',
                     'btn_id':    'cancel-login',
                     'btn_text':  _.t('back'),
                     'btn_type':  'link',
                     'data':      'data-dismiss=modal'
                     },*/
                    'next': {
                        'btn_class': 'btn-primary sign-in',
                        'btn_id':    'sign-in',
                        'btn_text':  _.t('login'),
                        'btn_type':  'button',
                        'data':      'data-loading-text="' + _.t('loading') + ' ' + _.escape('<i class="icon-spinner icon-spin"></i>') + '"'
                    }
                }
            };
        },

        render: function () {
            var compiledModalTemplate = _.template(ModalTemplate, this.data),
                compiledMailConnectTemplate = _.template(MailConnectTemplate, {}),
                compiledSocialConnectTemplate = _.template(SocialConnectTemplate, {}),
                compiledFormTemplate, showSocialConnect = '', showMailConnect = '';

            if (_.c('login_social_networks').indexOf('gplus') !== -1 ||
                _.c('login_social_networks').indexOf('twitter') !== -1 ||
                _.c('login_social_networks').indexOf('fb') !== -1
                ) {
                showSocialConnect = compiledSocialConnectTemplate;
            }

            if (_.c('login_social_networks').indexOf('email_password') !== -1) {
                showMailConnect = compiledMailConnectTemplate;
            }

            compiledFormTemplate = _.template(LoginTemplate, {
                showMailConnect:   showMailConnect,
                showSocialConnect: showSocialConnect
            });

            this.setDoorModalObject();
            if (typeof this.modal_obj === 'undefined' || this.modal_obj.length === 0) {
                this.$el.append(compiledModalTemplate);
                this.$el.find('#' + this.data.modal_id).find('.modal-body-wrapper').append(compiledFormTemplate);
                this.setDoorModalObject();
            }
            return this;
        },

        setDoorModalObject: function () {
            this.modal_obj = $('#' + this.data.modal_id);
        },

        openModal: function () {
            var that = this;
            this.modal_obj.on('shown.bs.modal', function () {
                that.modal_obj.find('input').first().focus();
                $('#comment-box').hide();
            });

            this.modal_obj.modal('show');

            this.facebook = Facebook.init();
            this.facebook.addClickEventListener();
            _.singleton.model.fbLogin.on('change', this.fbLoginDone, this);

            this.twitter = Twitter.init();
            this.twitter.addClickEventListener();
            _.singleton.model.twLogin.on('change', this.twLoginDone, this);

            this.google = Google.init();
            this.google.addClickEventListener();
            _.singleton.model.gpLogin.on('change', this.gpLoginDone, this);

            this.goTo('call/login');
        },

        fbLoginDone: function () {
            // store some fb data in login model
            this.loginModel.set({
                login_type: _.singleton.model.fbLogin.get('login_type'),
                sid:        _.singleton.model.fbLogin.get('fbid'),
                email:      _.singleton.model.fbLogin.get('email'),
                password:   '',
                avatar:     'https://graph.facebook.com/' + _.singleton.model.fbLogin.get('fbid') + '/picture?width=40&height=40'
            });

            this.loginProcess();
            return this;
        },

        twLoginDone: function () {
            // store some tw data in login model
            this.loginModel.set({
                login_type: _.singleton.model.twLogin.get('login_type'),
                sid:        _.singleton.model.twLogin.get('twid'),
                email:      _.singleton.model.twLogin.get('email'),
                //email:      '',
                password:   '',
                avatar:     _.singleton.model.twLogin.get('avatar')
            });

            this.loginProcess();
            return this;
        },

        gpLoginDone: function () {
            // store some gp data in login model
            this.loginModel.set({
                login_type: _.singleton.model.gpLogin.get('login_type'),
                sid:        _.singleton.model.gpLogin.get('gpid'),
                //email:      _.singleton.model.gpLogin.get('email'),
                email:      '',
                password:   '',
                avatar:     _.singleton.model.gpLogin.get('avatar')
            });

            this.loginProcess();
            return this;
        },

        mailLogin: function (element) {
            // get form data
            var form = $('#form-sign-up'),
                data = (form) ? form.serializeObject() : {};

            this.btn = $(element.currentTarget);

            form.validate({
                //debug: true,
                rules: {
                    mail: {
                        required: true,
                        email:    true
                    },

                    password: {
                        required:  true,
                        minlength: 3
                    }
                },

                messages: {
                    mail: {
                        required: _.t('msg_require_mail'),
                        email:    _.t('msg_require_mail_format')
                    },

                    password: {
                        required:  _.t('msg_require_password'),
                        minlength: jQuery.format(_.t('msg_require_password_format'))
                    }
                }
            });

            // return if is_valid is false
            if (!form.valid()) {
                this.log('action', 'user_participate_login_validation', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1001,
                    data_obj:      {
                        message: 'empty fields'
                    }
                });
                return false;
            }

            // set button to loading state
            this.btn.button('loading');

            /**
             * ok all is right, now check login data in database
             */
            this.loginModel.set({
                email:    data.mail,
                password: data.password
            });

            this.loginProcess();
            return this;
        },

        loginProcess: function () {
            var that = this;

            // start login process and handle data
            this.ajax(this.loginModel.attributes, true, function (return_data) {
                // remove important data from model attributes
                that.loginModel.unset('password');

                // reset login button
                if (typeof that.btn !== 'undefined') {
                    that.btn.button('reset');
                }

                if (return_data.type === 'success') {
                    that.successOnCheck(return_data.data);
                } else {
                    _.debug.error('error, code 100', 'login error in loginProcess');
                    that.log('action', 'user_participated_error', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1011,
                        data_obj:      {
                            error_code: '100'
                        }
                    });
                }
            });
        },

        successOnCheck: function (data) {
            var that = this,
                user_type = 'exist';
            this.setDoorModalObject();

            // refresh global user id
            _.uid = parseInt(data.message, 10);

            if (data.code === '200' || data.code === '201') {
                if (data.code === '201') {
                    user_type = 'new';
                }

                this.tmpUserData = data.user_data;
                this.tmpUserData.additional = JSON.parse(this.tmpUserData.additional);

                // save user login information into local storage
                this.loginModel.set({
                    uid:       _.uid,
                    avatar:    data.avatar,
                    gid:       0,
                    user_type: user_type,
                    tmp:       this.tmpUserData
                });
                this.loginModel.save();

                this.log('action', 'user_participate_login_successfully', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1002,
                    data_obj:      {
                        code:    data.code,
                        message: data.message
                    }
                });

                // close login modal
                $('#comment-box').show();
                this.modal_obj.on('hidden.bs.modal', function () {
                    that.modal_obj.remove();
                });
                this.modal_obj.modal('hide');
            } else if (data.code === '203') {
                // wrong password
                this.log('action', 'user_participate_login_wrong', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1004,
                    data_obj:      {
                        code:    data.code,
                        message: data.message
                    }
                });
                this.notice_prperties = {
                    title:       _.t('msg_login_wrongdata_title'),
                    description: _.t('msg_login_wrongdata_description'),
                    type:        'notice'
                };
                this.notification.setOptions(this.notice_prperties).show();
            } else {
                // critical other error
                this.log('action', 'user_participate_login_error', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1005,
                    data_obj:      {
                        code:    0,
                        message: 'some went wrong, but I don\'t know what exactly - ' + data.message
                    }
                });
                /*this.notice_prperties = {
                 title:       _.t('msg_login_error_title') + ' - Code 200',
                 description: _.t('msg_login_error_description'),
                 type:        'error'
                 };
                 this.notification.setOptions(this.notice_prperties).show();*/

                _.debug.error('error, code 200');
                this.log('action', 'user_participated_error', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1011,
                    data_obj:      {
                        error_code: '200'
                    }
                });
            }
        },

        handleNavigation: function () {
            //_.debug.log('handleNavigation');
            this.loginModel.fetch();
            var nav = $('.navbar-nav'),
                admins = ',' + _.c('admin_mails').replace(/ /g, '') + ',',
                uid = this.loginModel.get('uid'),
                login_type = this.loginModel.get('login_type');

            // save uid global
            _.uid = parseInt(uid, 10);

            if (_(uid).isBlank() === false && (uid > 0 || login_type === 'fbuser')) {
                nav.find('#nav-login').addClass('hide').end().find('.nav-logout').removeClass('hide');
                $('.nav-profile').removeClass('hide').find('img').attr('src', this.loginModel.get('avatar'));

                // if admin, show adminpanel button
                if (admins.indexOf(',' + this.loginModel.get('email') + ',') !== -1) {
                    nav.find('#nav-admin').removeClass('hide');
                    _.gid = 1;
                    $('.admin-fb-info').hide();
                }
            } else {
                // change status to loged out
                nav.find('#nav-login').removeClass('hide').end().find('#nav-admin').addClass('hide').end().find('.nav-logout').addClass('hide');
                $('.nav-profile').addClass('hide');
            }
            return this;
        },

        checkKeypress: function (event) {
            var key = event.keyCode || event.which,
                btn;
            //_.debug.log(key);
            if (key === 13) {
                btn = $('.modal').find('button#sign-in');
                this.mailLogin(btn);
            }
        }
    });

    Remove = function () {
        _.singleton.view[namespace].unbind().remove();
        delete _.singleton.view[namespace];
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