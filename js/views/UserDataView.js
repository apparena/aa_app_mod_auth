define([
    'ViewExtend',
    'jquery',
    'underscore',
    'backbone',
    'modules/auth/js/models/LoginModel',
    'modules/auth/js/models/UserDataModel',
    /*'modules/optivo/js/views/OptivoView',*/
    'modules/auth/js/collections/ParticipationCollection',
    'modules/notification/js/views/NotificationView'
], function (View, $, _, Backbone, LoginModel, UserDataModel, /*OptivoView,*/ ParticipationCollection, NotificationView) {
    'use strict';

    return function () {
        View.namespace = 'authParticipation';

        View.code = Backbone.View.extend({
            tagName: 'div',

            className: 'participate-container',

            enableKeypress: false,

            events: {
                'click .back':   'render',
                'click .submit': 'submit',
                'keyup :input':  'checkKeypress'
            },

            initialize: function () {
                _.bindAll(this, 'render', 'userInformation', 'modifyElement', 'submit', 'allUserDataStored', 'checkKeypress');

                this.user_data_model = UserDataModel().init();
            },

            render: function () {
                var that = this;
                require(['text!modules/auth/templates/userdata_page.html'], function () {
                    that.$el.html(that.template);
                });
                this.enableKeypress = true;
            },

            modifyElement: function (element) {
                if (_.isObject(element)) {
                    this.setElement(element);
                }
                return this;
            },

            userInformation: function (redirection) {
                var that = this;

                // todo check if login process is done

                // if userdata allready exist, cancel call
                if (this.allUserDataStored() && this.user_data_model.get('login_type') === 'appuser') {
                    this.log('action', 'user_participate_data_already_exists', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1009,
                        data_obj:      {}
                    });
                    this.status = 'userdataAlreadyExist';
                    return false;
                }

                this.redirection = redirection || '';
                this.goTo('call/auth-userdata');

                // define form requirements
                var required_selection = _.c('mod_participate_userdata_requirements'),
                    compiledTemplate, data, email;

                this.required = {
                    name:     false,
                    birthday: false,
                    address:  false,
                    field1:   false,
                    field2:   false,
                    field3:   false
                };

                if (required_selection.indexOf('name') !== -1) {
                    this.required.name = true;
                }
                if (required_selection.indexOf('birthday') !== -1) {
                    this.required.birthday = true;
                }
                if (required_selection.indexOf('address') !== -1) {
                    this.required.address = true;
                }
                if (required_selection.indexOf('field1') !== -1) {
                    this.required.field1 = true;
                }
                if (required_selection.indexOf('field2') !== -1) {
                    this.required.field2 = true;
                }
                if (required_selection.indexOf('field3') !== -1) {
                    this.required.field3 = true;
                }

                email = this.model.get('email');

                if (this.model.get('login_type') === 'twuser' || this.model.get('login_type') === 'gpuser') {
                    email = '';
                }

                data = {
                    'required':  this.required,
                    'user_data': this.user_data_model.attributes,
                    'email':     email
                };

                // render template and save it global
                require(['text!modules/auth/templates/userdata_page.html'], function (UserdataTemplate) {
                    that.template = _.template(UserdataTemplate, data);
                });

                // set status
                this.status = 'needUserdata';

                return this;
            },

            submit: function () {
                var form = this.$('#form-participate'),
                    data = (form) ? form.serializeObject() : {},
                    user_data;

                form.validate({
                    debug: true,
                    rules: {
                        email:     {
                            required: true,
                            email:    true
                        },
                        firstname: {
                            required: this.required.name
                        },
                        lastname:  {
                            required: this.required.name
                        },
                        birthday:  {
                            required: this.required.birthday
                        },
                        street:    {
                            required: this.required.address
                        },
                        zip:       {
                            required: this.required.address
                        },
                        city:      {
                            required: this.required.address
                        },
                        field1:    {
                            required: this.required.field1
                        },
                        field2:    {
                            required: this.required.field2
                        },
                        field3:    {
                            required: this.required.field3
                        },
                        terms:     {
                            required: true
                        }
                    },

                    messages: {
                        email:     {
                            required: _.t('msg_require_mail'),
                            email:    _.t('msg_require_mail_format')
                        },
                        firstname: _.t('msg_require_firstname'),
                        lastname:  _.t('msg_require_lastname'),
                        birthday:  _.t('msg_require_birthday'),
                        street:    _.t('msg_require_street'),
                        zip:       _.t('msg_require_zip'),
                        city:      _.t('msg_require_city'),
                        field1:    _.t('msg_require_field1'),
                        field2:    _.t('msg_require_field2'),
                        field3:    _.t('msg_require_field3'),
                        terms:     _.t('msg_require_terms')
                    }
                });

                if (!form.valid()) {
                    this.log('action', 'user_participate_data_validation', {
                        auth_uid:      _.uid,
                        auth_uid_temp: _.uid_temp,
                        code:          1006,
                        data_obj:      {
                            message: 'empty fields'
                        }
                    });
                    return false;
                }

                // implement data into model
                this.user_data_model.set(data);
                this.user_data_model.save();

                // save userdate to database
                user_data = this.user_data_model.attributes;
                //user_data.email = this.model.get('email');
                user_data.auth_uid = this.model.get('uid');
                data = {
                    user_data: user_data,
                    module:    this.user_data_model.get('module'),
                    action:    this.user_data_model.get('action')
                };
                this.ajax(data, true);

                this.log('action', 'user_participate_data_submit', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1007,
                    data_obj:      {
                        user_data: user_data
                    }
                });
                /*
                 // send opt-in mail if newsletter was accepted
                 if (_.isUndefined(_.singleton.view.optivo)) {
                 _.singleton.view.optivo = new OptivoView();
                 }
                 if (this.user_data_model.get('newsletter') !== 'false' && this.user_data_model.get('optin_nl') === '0') {
                 _.singleton.view.optivo.sendTransactionMail({
                 'recipient': user_data.email,
                 'mailtype':  'nl_optin',
                 'uid':       _.uid
                 });
                 }

                 // send welcome mail if activated
                 if (_.c('mail_activated') === '1' && _.singleton.model.login.get('user_type') === 'new') {
                 _.singleton.view.optivo.sendTransactionMail({
                 'recipient': user_data.email,
                 'mailtype':  'welcome'
                 });
                 }

                 this.showTerminal();
                 */

                // set user_type from new to exist
                this.model.set('user_type', 'exist');
                this.model.save();
                this.goTo(this.redirection);
                return this;
            },

            checkKeypress: function (event) {
                var key = event.keyCode || event.which;
                if (key === 13 && this.enableKeypress === true) {
                    this.submit();
                }
            },

            allUserDataStored: function () {
                var that = this,
                    userdata = _.c('mod_participate_userdata').split(','),
                    requirements = _.c('mod_participate_userdata_requirements').split(','),
                    required = _.intersection(userdata, requirements);

                this.return_value = true;

                // add terms and email as required - thats allways required and can't turned off
                required.push('terms');
                required.push('email');

                // is name required?
                if ($.inArray('name', required) !== -1) {
                    // remove old item from array
                    required.splice($.inArray('name', required), 1);
                    // add new items
                    required.push('gender');
                    required.push('firstname');
                    required.push('lastname');
                }

                // is address required?
                if ($.inArray('address', required) !== -1) {
                    // remove old item from array
                    required.splice($.inArray('address', required), 1);
                    // add new items
                    required.push('street');
                    required.push('zip');
                    required.push('city');
                }

                _.each(required, function (value) {
                    if (_.isEmpty(that.user_data_model.get(value)) || that.user_data_model.get(value) === 'false') {
                        that.return_value = false;
                    }
                });
                return this.return_value;
            }
        });

        return View;
    }
});