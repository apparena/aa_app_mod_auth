define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'modules/aa_app_mod_auth/js/models/LoginModel',
    'text!modules/aa_app_mod_auth/templates/login.html',
    'text!modules/aa_app_mod_auth/templates/register.html',
    'jquery.validator_config',
    'jquery.serialize_object'
], function (View, $, _, Backbone, LoginModel, LoginTemplate, RegisterTemplate) {
    'use strict';

    return function () {
        View.namespace = 'authLogin';

        View.code = Backbone.View.extend({
            el: $('body'),

            enableKeypress: false,

            redirection: '',

            events: {
                'click #sign-in': 'mailLogin',
                'click #sign-up': 'mailLogin',
                'keyup :input':   'checkKeypress'
            },

            tmpUserData: null,

            initialize: function () {
                _.bindAll(this, 'render', 'setDoorModalObject', 'addRedirection', 'renderModal', 'openModal', 'renderPage', 'loginProcess', 'addSocialLogin', 'mailLogin', 'fbLoginDone', 'twLoginDone', 'gpLoginDone');

                this.loginModel = LoginModel().init({
                    id: 1
                });
                this.listenTo(this.loginModel, 'change:logintime', this.handleNavigation);

                this.data = {
                    'modal_id':   'sign-up-modal',
                    'headline':   _.t('login_headline'),
                    'show_close': true
                };
            },

            render: function () {
                // set/revert basic element
                this.setElement($('body'));
                var showSocialConnect = '',
                    showMailConnect = '',
                    showSocialRegister = '',
                    showMailRegister = '';

                this.dependencies = {};

                if (_.c('login_social_networks').indexOf('gplus') !== -1 ||
                    _.c('login_social_networks').indexOf('twitter') !== -1 ||
                    _.c('login_social_networks').indexOf('fb') !== -1
                    ) {
                    this.dependencies['showSocialConnect'] = 'text!modules/aa_app_mod_auth/templates/social_connect.html';
                    this.dependencies['showSocialRegister'] = 'text!modules/aa_app_mod_auth/templates/social_register.html';
                }

                if (_.c('login_social_networks').indexOf('email_password') !== -1) {
                    this.dependencies['showMailConnect'] = 'text!modules/aa_app_mod_auth/templates/mail_connect.html';
                    this.dependencies['showMailRegister'] = 'text!modules/aa_app_mod_auth/templates/mail_register.html';
                }

                this.setDoorModalObject();
                this.enableKeypress = true;
                return this;
            },

            setDoorModalObject: function () {
                this.modal_obj = $('#' + this.data.modal_id);
                return this;
            },

            addRedirection: function (redirection) {
                this.redirection = redirection || '';
                return this;
            },

            renderPage: function () {
                var that = this,
                    dependencies = [];

                // set page type
                this.pagetype = 'page';
                this.dependencies['PageTemplate'] = 'text!modules/aa_app_mod_auth/templates/login_content_page.html';

                // create dependencie array for require
                _.each(this.dependencies, function (value) {
                    dependencies.push(value);
                });

                require(dependencies, function () {
                    var compiledPageTemplate, compiledLoginTemplate, compiledRegisterTemplate, showMailConnect, showSocialConnect, showMailRegister, showSocialRegister, PageTemplate;

                    // handle function arguments
                    _.each(that.dependencies, function (value, key) {
                        if (key === 'PageTemplate') {
                            PageTemplate = require(value);
                        } else if (key === 'showSocialConnect') {
                            showSocialConnect = require(value);
                        } else if (key === 'showMailConnect') {
                            showMailConnect = require(value);
                        } else if (key === 'showSocialRegister') {
                            showSocialRegister = require(value);
                        } else if (key === 'showMailRegister') {
                            showMailRegister = require(value);
                        }
                    });

                    compiledPageTemplate = _.template(PageTemplate, that.data);
                    compiledLoginTemplate = _.template(LoginTemplate, {
                        showMailConnect:   _.template(showMailConnect, {}),
                        showSocialConnect: _.template(showSocialConnect, {})
                    });

                    compiledRegisterTemplate = _.template(RegisterTemplate, {
                        showMailRegister:   _.template(showMailRegister, {}),
                        showSocialRegister: _.template(showSocialRegister, {})
                    });

                    // add content and define new element
                    that.$('.content-wrapper').html(compiledPageTemplate);
                    that.setElement(that.$('.content-wrapper'));
                    that.$('.login-body').html(compiledLoginTemplate);
                    that.$('.register-body').html(compiledRegisterTemplate);
                    that.addSocialLogin();
                });
                return this;
            },

            renderModal: function () {
                var that = this,
                    dependencies = [];

                // set page type
                this.pagetype = 'modal';
                this.dependencies['ModalTemplate'] = 'text!modules/aa_app_mod_auth/templates/login_content_modal.html';

                // create dependencie array for require
                _.each(this.dependencies, function (value) {
                    dependencies.push(value);
                });

                require(dependencies, function () {
                    var compiledModalTemplate, compiledLoginTemplate, compiledRegisterTemplate, showMailConnect, showSocialConnect, showMailRegister, showSocialRegister, ModalTemplate;

                    // handle function arguments
                    _.each(that.dependencies, function (value, key) {
                        if (key === 'ModalTemplate') {
                            ModalTemplate = require(value);
                        } else if (key === 'showSocialConnect') {
                            showSocialConnect = require(value);
                        } else if (key === 'showMailConnect') {
                            showMailConnect = require(value);
                        } else if (key === 'showSocialRegister') {
                            showSocialRegister = require(value);
                        } else if (key === 'showMailRegister') {
                            showMailRegister = require(value);
                        }
                    });

                    compiledModalTemplate = _.template(ModalTemplate, that.data);

                    that.setDoorModalObject();
                    if (typeof that.modal_obj === 'undefined' || that.modal_obj.length === 0) {
                        compiledLoginTemplate = _.template(LoginTemplate, {
                            showMailConnect:   _.template(showSocialConnect, {}),
                            showSocialConnect: _.template(showMailConnect, {})
                        });
                        compiledRegisterTemplate = _.template(RegisterTemplate, {
                            showMailRegister:   _.template(showSocialRegister, {}),
                            showSocialRegister: _.template(showMailRegister, {})
                        });
                        // add content and define new element
                        that.$el.append(compiledModalTemplate);
                        that.setElement(that.$('#' + that.data.modal_id));
                        that.$('.login-body').html(compiledLoginTemplate);
                        that.$('.register-body').html(compiledRegisterTemplate);
                        that.setDoorModalObject();
                    }

                    that.openModal();
                });
                return this;
            },

            openModal: function () {
                var that = this;

                // set focus on first input field
                this.modal_obj.on('shown.bs.modal', function () {
                    that.modal_obj.find('input').first().focus();
                    //$('#comment-box').hide();
                });

                this.modal_obj.modal('show');
                this.addSocialLogin();

                this.goTo('call/login/modal');
            },

            addSocialLogin: function () {
                var that = this;

                if (_.c('login_social_networks').indexOf('fb') !== -1) {
                    require([
                        'modules/aa_app_mod_facebook/js/views/FacebookView',
                        'modules/aa_app_mod_facebook/js/models/LoginModel'
                    ], function (Facebook, LoginModel) {
                        that.facebook = Facebook().init();
                        that.facebook.addClickEventListener();
                        that.facebookLoginModel = LoginModel().init();
                        that.listenTo(that.facebookLoginModel, 'change:logintime', that.fbLoginDone);
                    });
                }
                if (_.c('login_social_networks').indexOf('twitter') !== -1) {
                    require([
                        'modules/aa_app_mod_twitter/js/views/TwitterView',
                        'modules/aa_app_mod_twitter/js/models/LoginModel'
                    ], function (Twitter, LoginModel) {
                        that.twitter = Twitter().init();
                        that.twitter.addClickEventListener();
                        that.twitterLoginModel = LoginModel().init();
                        that.listenTo(that.twitterLoginModel, 'change:logintime', that.twLoginDone);
                    });
                }
                if (_.c('login_social_networks').indexOf('gplus') !== -1) {
                    require([
                        'modules/aa_app_mod_google/js/views/GoogleView',
                        'modules/aa_app_mod_google/js/models/LoginModel'
                    ], function (Google, LoginModel) {
                        that.google = Google().init();
                        that.google.addClickEventListener();
                        that.googleLoginModel = LoginModel().init();
                        that.listenTo(that.googleLoginModel, 'change:logintime', that.gpLoginDone);
                    });
                }
            },

            fbLoginDone: function () {
                // store some fb data in login model
                this.loginModel.set({
                    login_type: this.facebookLoginModel.get('login_type'),
                    type:       'social',
                    sid:        this.facebookLoginModel.get('fbid'),
                    email:      this.facebookLoginModel.get('email'),
                    password:   '',
                    avatar:     'https://graph.facebook.com/' + this.facebookLoginModel.get('fbid') + '/picture?width=100&height=100'
                });

                this.loginProcess();
                return this;
            },

            twLoginDone: function () {
                // store some tw data in login model
                this.loginModel.set({
                    login_type: this.twitterLoginModel.get('login_type'),
                    type:       'social',
                    sid:        this.twitterLoginModel.get('twid'),
                    email:      this.twitterLoginModel.get('email'),
                    password:   '',
                    avatar:     this.twitterLoginModel.get('avatar')
                });

                this.loginProcess();
                return this;
            },

            gpLoginDone: function () {
                // store some gp data in login model
                this.loginModel.set({
                    login_type: this.googleLoginModel.get('login_type'),
                    type:       'social',
                    sid:        this.googleLoginModel.get('gpid'),
                    email:      this.googleLoginModel.get('email'),
                    password:   '',
                    avatar:     this.googleLoginModel.get('avatar')
                });

                this.loginProcess();
                return this;
            },

            mailLogin: function (element) {
                // get form data
                this.btn = $(element.currentTarget);

                var form = this.btn.closest('.form-auth'),
                    data = (form) ? form.serializeObject() : {};

                form.validate({
                    //debug: true,
                    errorPlacement: function(error, element) {
                        error.insertBefore(element.parent()).prev('label').hide();
                    },

                    success: function(label) {
                        label.parent().find('label').show();
                    },

                    errorElement: 'label',

                    rules: {
                        email: {
                            required: true,
                            email:    true
                        },

                        password: {
                            required:  true,
                            minlength: 3
                        }
                    },

                    messages: {
                        email: {
                            required: _.t('msg_require_mail'),
                            email:    _.t('msg_require_mail_format')
                        },

                        password: {
                            required:  _.t('msg_require_password'),
                            minlength: $.format(_.t('msg_require_password_format'))
                        }
                    }
                });

                // return if is_valid is false
                if (!form.valid()) {
                    this.log('action', 'user_auth_login_validation', {
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
                    email:    data.email,
                    password: data.password,
                    type:     data.type,
                    avatar:   data.email
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
                        that.log('action', 'user_auth_error', {
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
                var user_type = 'exist';
                this.setDoorModalObject();

                // refresh global user id
                _.uid = parseInt(data.message, 10);

                if (data.code === '200' || data.code === '201') {
                    if (data.code === '201') {
                        user_type = 'new';
                    }

                    this.tmpUserData = data.user_data;
                    this.tmpUserData.additional = $.parseJSON(this.tmpUserData.additional);

                    if(!_.isUndefined(data.avatar.avatars))
                    {
                        data.avatar.avatars = $.parseJSON(data.avatar.avatars);
                    }

                    // save user login information into local storage
                    this.loginModel.set({
                        uid:       _.uid,
                        avatar:    data.avatar,
                        gid:       0,
                        user_type: user_type,
                        tmp:       this.tmpUserData,
                        logintime: _.uniqueId()
                    });
                    this.loginModel.save();

                    this.log('action', 'user_auth_successfully', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1002,
                        data_obj:      {
                            code:    data.code,
                            message: data.message
                        }
                    });

                    if (this.pagetype === 'modal') {
                        // close login modal
                        this.modal_obj.modal('hide');
                        if (!_.isEmpty(this.redirection)) {
                            this.goTo(this.redirection);
                        }
                    } else {
                        this.goTo(this.redirection);
                    }
                    this.enableKeypress = false;
                } else if (data.code === '203') {
                    // wrong password
                    this.log('action', 'user_auth_wrong', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1004,
                        data_obj:      {
                            code:    data.code,
                            message: data.message
                        }
                    });

                    require([
                        'modules/aa_app_mod_facebook/js/views/FacebookView',
                        'modules/aa_app_mod_notification/js/views/NotificationView'
                    ], function (FacebookView, NotificationView) {
                        var facebook = FacebookView().init();

                        // define notification position in facebook tabs. works also on normal pages
                        facebook.getScrollPosition(function (position) {
                            // define notification options
                            var options = {
                                title:       _.t('msg_login_wrongdata_title'),
                                description: _.t('msg_login_wrongdata_description'),
                                type:        'notice'
                            };

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
                        });
                    });
                } else if (data.code === '404') {
                    // account not exists
                    require([
                        'modules/aa_app_mod_facebook/js/views/FacebookView',
                        'modules/aa_app_mod_notification/js/views/NotificationView'
                    ], function (FacebookView, NotificationView) {
                        var facebook = FacebookView().init();

                        // define notification position in facebook tabs. works also on normal pages
                        facebook.getScrollPosition(function (position) {
                            // define notification options
                            var options = {
                                title:       _.t('msg_login_wrongdata_title'),
                                description: _.t('msg_login_wrongdata_description'),
                                type:        'notice'
                            };

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
                        });
                    });
                } else if (data.code === '208') {
                    // wrong password
                    this.log('action', 'user_auth_allready_exists', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1012,
                        data_obj:      {
                            code:    data.code,
                            message: data.message
                        }
                    });

                    require([
                        'modules/aa_app_mod_facebook/js/views/FacebookView',
                        'modules/aa_app_mod_notification/js/views/NotificationView'
                    ], function (FacebookView, NotificationView) {
                        var facebook = FacebookView().init();

                        // define notification position in facebook tabs. works also on normal pages
                        facebook.getScrollPosition(function (position) {
                            // define notification options
                            var options = {
                                title:       _.t('msg_login_user_exists_title'),
                                description: _.t('msg_login_user_exists_description'),
                                type:        'notice'
                            };

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
                        });
                    });
                } else {
                    // critical other error
                    _.debug.error('code 200', 'critical error on login');
                    _.debug.log(data);

                    this.log('group', {
                        /*'user_auth_error': {
                         auth_uid:      _.uid,
                         auth_uid_temp: _.uid_temp,
                         code:          1005,
                         data_obj:      {
                         code:    0,
                         message: 'some went wrong, but I don\'t know what exactly - ' + data.message
                         }
                         },*/

                        'user_auth_error': {
                            auth_uid:      _.uid,
                            auth_uid_temp: _.uid_temp,
                            code:          1011,
                            data_obj:      {
                                error_code: '200',
                                message:    'some went wrong, but I don\'t know what exactly - ' + data.message
                            }
                        }
                    });
                }
            },

            handleNavigation: function () {
                this.loginModel.fetch();
                var nav = $('.navbar-nav'),
                    admins = ',' + _.c('admin_mails').replace(/ /g, '') + ',',
                    uid = this.loginModel.get('uid'),
                    login_type = this.loginModel.get('login_type'),
                    avatar;

                // save uid global
                _.uid = parseInt(uid, 10);
                if (_.isNumber(uid) && (uid > 0)) {
                    nav.find('.nav-login').addClass('hide').end().find('.nav-logout').removeClass('hide');
                    avatar = this.loginModel.get('avatar');

                    $('.nav-profile').removeClass('hide');

                    if(!_.isUndefined(avatar.avatars)) {
                        $('.nav-profile').find('img').attr('src', avatar.avatars[avatar.selected])
                    }

                    // if admin, show adminpanel button
                    if (admins.indexOf(',' + this.loginModel.get('email') + ',') !== -1) {
                        $('.nav-admin').removeClass('hide');
                        _.gid = 1;
                        $('.admin-fb-info').hide();
                    }
                } else {
                    // change status to loged out
                    nav.find('.nav-login').removeClass('hide').end().find('.nav-logout').addClass('hide');
                    $('.nav-admin').addClass('hide');
                    $('.nav-profile').addClass('hide');
                }
                return this;
            },

            checkKeypress: function (event) {
                var key = event.keyCode || event.which,
                    btn;
                if (key === 13 && this.enableKeypress === true) {
                    //btn = $('.modal').find('button#sign-in');
                    //this.mailLogin(btn);
                }
            }
        });

        return View;
    }
});