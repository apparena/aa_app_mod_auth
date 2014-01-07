define([
    'underscore',
    'ViewExtend',
    'ModelExtend',
    'CollectionExtend'
], function (_, View, Model, Collection) {
    'use strict';

    return function () {

        // clear and destroy all models and views and local storage
        localStorage.clear();
        sessionStorage.clear();

        // models
        _.each(_.singleton.model, function (func, key) {
            Model.namespace = 'key';
            Model.remove();
        });

        // collections
        _.each(_.singleton.collection, function (func, key) {
            Collection.namespace = 'key';
            Collection.remove();
        });

        // views
        _.each(_.singleton.view, function (func, key) {
            View.namespace = 'key';
            View.remove();
        });

        // handle navigation bar
        $('.navbar-nav').find('#nav-login').removeClass('hide').end().find('.nav-logout').addClass('hide').end().find('#nav-admin').addClass('hide');
        $('.nav-profile').addClass('hide');
        $('.modal').remove();
        $('.modal-backdrop').remove();

        // redirect to home
        _.router.navigate('', {trigger: true});
    };
});