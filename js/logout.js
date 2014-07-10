define([
    'underscore',
    'ViewExtend',
    'ModelExtend',
    'CollectionExtend',
    'modules/aa_app_mod_facebook/js/views/FacebookView'
], function (_, View, Model, Collection, FacebookView) {
    'use strict';

    return function () {

        // facebook logout
        //FacebookView().init().logout();

        // clear and destroy all models and views and local storage
        localStorage.clear();
        sessionStorage.clear();

        // handle navigation bar
        $('.navbar-nav').find('.nav-login').removeClass('hide').end().find('.nav-logout').addClass('hide').end().find('.nav-admin').addClass('hide');
        $('.nav-profile').addClass('hide');
        $('.modal').remove();
        $('.modal-backdrop').remove();

        // reset basic variables
        _.uid = 0;
        _.uid_temp = 0;
        _.gid = 0;
        _.fangate = null;

        // models
        _.each(_.singleton.model, function (func, key) {
            Model.namespace = key;
            Model.remove();
        });

        // collections
        _.each(_.singleton.collection, function (func, key) {
            Collection.namespace = key;
            Collection.remove();
        });

        // views
        _.each(_.singleton.view, function (func, key) {
            View.namespace = key;
        });

        // redirect to home
        _.router.navigate('', {trigger: true});
    };
});