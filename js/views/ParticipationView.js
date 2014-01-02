define([
    'jquery',
    'underscore',
    'backbone',
    'text!modules/auth/templates/userdata.html',
    'modules/terminal/js/views/TerminalView',
    'modules/auth/js/models/LoginModel',
    'modules/auth/js/models/UserDataModel',
    'modules/optivo/js/views/OptivoView',
    'modules/auth/js/collections/ParticipationCollection',
    'modules/notification/js/views/NotificationView'
], function ($, _, Backbone, UserdataTemplate, TerminalView, LoginModel, UserDataModel, OptivoView, ParticipationCollection, NotificationView) {

    'use strict';

    var namespace = 'authParticipation',
        View, Init, Remove, Instance;

    View = Backbone.View.extend({
        tagName: 'div',

        className: 'participate-container',

        events: {
            'click .back':   'render',
            'click .submit': 'submit',
            'keyup :input':  'checkKeypress'
        },

        initialize: function () {
            _.bindAll(this, 'userInformation', 'submit', 'showTerminal', 'allUserDataStored', 'checkKeypress');
            //this.user_data_model = new UserDataModel({id: 1});
            if (_.isUndefined(_.singleton.model.userdata)) {
                _.singleton.model.userdata = new UserDataModel({id: 1});
            }
            this.user_data_model = _.singleton.model.userdata;

            this.enableReturn = false;
        },

        userInformation: function () {
            //_.debug.log('show userInformation', this.user_data_model.attributes);

            if (this.allUserDataStored() && this.user_data_model.get('login_type') === 'appuser') {
                this.log('action', 'user_participate_data_already_exists', {
                    auth_uid:      _.uid,
                    auth_uid_temp: _.uid_temp,
                    code:          1009,
                    data_obj:      {}
                });
                this.showTerminal();
                return false;
            }

            // sign-up-modal

            this.goTo('call/participate-userdata');
            this.enableReturn = true;

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
                'email': email
            };
            compiledTemplate = _.template(UserdataTemplate, data);
            this.$el.html(compiledTemplate);

            $('.modal').on('hidden.bs.modal', function () {
                _.singleton.view['doorModal' + _.current_door_id].closeDoor();
            });
            return this;
        },

        submit: function () {
            //_.debug.log('submit form and load');

            var form = $('#form-participate'),
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

            //_.debug.log(data, this.user_data_model);

            this.log('action', 'user_participate_data_submit', {
                auth_uid:      _.uid,
                auth_uid_temp: _.uid_temp,
                code:          1007,
                data_obj:      {
                    user_data: user_data
                }
            });

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
            this.enableReturn = false;

            // set user_type from new to exist
            this.model.set('user_type', 'exist');
            this.model.save();

            return this;
        },

        showTerminal: function () {
            //_.debug.log('showTerminal');
            var that = this,
                terminalView,
                doorviewModel,
                customContent;

            this.ajax({
                module:  'participate',
                action:  'participate',
                uid:     _.uid,
                door_id: _.current_door_id
            }, false, function (resp) {
                // callback
                if (resp.type === 'success') {
                    // store resp.data.participations in a collaction
                    if (_.isUndefined(_.singleton.collection.participation)) {
                        _.singleton.collection.participation = new ParticipationCollection();
                    }
                    _.each(resp.data.participations, function (value, key) {
                        //_.debug.log('value', value, 'key', key);
                        _.singleton.collection.participation.create({
                            id:             key,
                            participations: value
                        });
                    });

                    if (_.aa.fb.request_id > 0) {
                        that.log('action', 'user_facebook_friends_return_participation', {
                            auth_uid:      _.uid,
                            auth_uid_temp: _.uid_temp,
                            code:          5003,
                            data_obj:      {
                                'request_id':       _.aa.fb.request_id,
                                'invited_by':       _.aa.fb.invited_by,
                                'invited_for_door': _.aa.fb.invited_for_door,
                                'current_door':     _.current_door_id
                            }
                        });
                    }

                    if (resp.data.code === 200) {

                        that.log('action', 'user_participated', {
                            auth_uid:      _.uid,
                            auth_uid_temp: _.uid_temp,
                            code:          1008,
                            data_obj:      {
                                door:  _.current_door_id,
                                admin: {
                                    user_participated: ''
                                }
                            }
                        });

                        /*that.log('admin', 'user_participated', {
                         log: {
                                user_participated: ''
                            }
                         });*/
                    } else if (resp.data.code === 403) {
                        if (_.isUndefined(_.singleton.view.notification)) {
                            _.singleton.view.notification = new NotificationView();
                        }
                        /*_.singleton.view.notification.setOptions({
                         title:       _.t('msg_participation_title_forbidden'),
                         description: _.t('msg_participation_desc_forbidden'),
                         type:        'error'
                         }, true).show();*/

                        _.singleton.view.facebook.getScrollPosition(function (position) {
                            var options = {
                                title:       _.t('msg_participation_title_forbidden'),
                                description: _.t('msg_participation_desc_forbidden'),
                                type:        'error'
                            };

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
                        });

                        that.log('action', 'user_participated_forbidden', {
                            auth_uid:      _.uid,
                            auth_uid_temp: _.uid_temp,
                            code:          1010,
                            data_obj:      {
                                door: _.current_door_id
                            }
                        });
                    } else {
                        _.debug.warn('Error on participation', resp.data);
                    }
                } else {
                    _.debug.warn('Error on participation', resp.data);
                }
            });

            //if (_.isUndefined(_.singleton.view.terminal)) {
            _.singleton.view.terminal = new TerminalView();
            //}
            terminalView = _.singleton.view.terminal;
            doorviewModel = _.singleton.view['doorModal' + _.current_door_id].model;
            customContent = doorviewModel.get('type_' + doorviewModel.get('type_name') + '_target_type_custom');
            terminalView.setCustomContent(customContent).render();
            // show new template
            this.$el.html(terminalView.el);
        },

        checkKeypress: function (event) {
            var key = event.keyCode || event.which;
            //_.debug.log(key);
            if (key === 13 && this.enableReturn === true) {
                this.submit();
            }
        },

        allUserDataStored: function () {
            //_.debug.log('anforderungscheck');
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
            //console.log(required);
            //_.debug.group('form requirement checks');

            _.each(required, function (value) {
                //console.log(value);
                //_.debug.info('check', value, typeof that.user_data_model.get(value), that.user_data_model.get(value));
                if (_(that.user_data_model.get(value)).isBlank() || that.user_data_model.get(value) === 'false') {
                    //_.debug.warn(value + ' is empty', typeof that.user_data_model.get(value), that.user_data_model.get(value));
                    that.return_value = false;
                }
            });
            //_.debug.log(this.return_value);
            //_.debug.groupEnd();
            return this.return_value;
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