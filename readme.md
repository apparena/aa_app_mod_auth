# App-Arena.com App Module: Auth
**Github:** https://github.com/apparena/aa_app_mod_auth

**Docs:** http://www.app-arena.com/docs/display/developer

This is a module of the [aa_app_template](https://github.com/apparena/aa_app_template)

**Required Template-Version:** >= 1.3.0

## Module job
Shows login and register page/modal, handle navigation view for logout/login/avatar/admin information and a password lost and request new function.
The login process can be used over mail and social networks.

### Functions
* **share** - Shares information from a button.

### Dependencies
* twitter
* facebook
* google
* logging
* notification

### Important functions in LoginView
* **addRedirection** - defines a redirection url that is called after successfully login (not required)
    * **redirection** - redirection url (default: '' for root)
* **renderPage** - shows a single content page with a login and register form
* **renderModal** - shows a modal with a login and register form
* **openModal** - Opened a rendered login modal. This is automatically called from renderModal
* **handleNavigation** - shows or hide login button and profile links, avatar and admin button

### Page urls
* /#/mod/static/auth
* /#/mod/static/auth/modal
* /#/mod/static/auth/demo-register
* /#/mod/static/auth/demo-register-modal
* /#/mod/auth/password
* /#/mod/auth/password/**[SECRET-ID]**

### Examples
#### login process on single page
```javascript
require(['modules/aa_app_mod_auth/js/views/LoginView'], function (LoginView) {
    LoginView().init().render().renderPage();
});
```

#### login process on modal
```javascript
require(['modules/aa_app_mod_auth/js/views/LoginView'], function (LoginView) {
    LoginView().init().render().renderModal();
});
```

#### register process on single page with login check
```javascript
require(['modules/aa_app_mod_auth/js/views/LoginView'], function (LoginView) {
    LoginView().init().render().addRedirection('page/auth/demo-register/userdata').renderPage();
});
```

#### register process on modal with login check
```javascript
require(['modules/aa_app_mod_auth/js/views/LoginView'], function (LoginView) {
    LoginView().init().render().addRedirection('page/auth/demo-register/userdata').renderModal();
});
```

#### userdata form
```javascript
require([
    'modules/aa_app_mod_auth/js/views/UserDataView',
    'modules/aa_app_mod_auth/js/views/LoginView'
], function (UserDataView, LoginView) {
    var loginView = LoginView().init(),
        element = $('.content-wrapper'),
        userDataView = UserDataView().init({
            attributes: {
                model: loginView.loginModel
            }
        });
    userDataView.modifyElement(element).defineUserInformation(function () {
        if (userDataView.status === 'needUserdata') {
            // show userdata page
            userDataView.renderPage();
        } else {
            // all userdata exist, redirect to startpage
            _.router.navigate('', {trigger: true});
        }
    });
});
```

#### password lost form
```javascript
require(['modules/aa_app_mod_auth/js/views/PasswordLostView'], function (PasswordLostView) {
    PasswordLostView().init({'init': true}).render();
});
```

#### set new password after password lost request
```javascript
// the secret ID was send by URL as parameter
id = id || 0;
require(['modules/aa_app_mod_auth/js/views/PasswordGetNewView'], function (PasswordGetNewView) {
    PasswordGetNewView().init({
        'init': true,

        'attributes': {
            secret: id
        }
    }).render();
});
```

### Load module with require
```javascript
// login
modules/aa_app_mod_auth/js/views/LoginView

// userdata
modules/aa_app_mod_auth/js/views/UserDataView

// password lost request
modules/aa_app_mod_auth/js/views/PasswordLostView

// set new password
modules/aa_app_mod_auth/js/views/PasswordGetNewView
```

#### App-Manager config values
| config | default | description |
|--------|--------|--------|
| login_social_networks | ["fb", "twitter", "gplus", "email_password" ] | multiselect to enable/disable login types |
| admin_mails | empty | admin e-mail addies (with commata) to set app admins |
| mod_participate_userdata | ["gender","name","birthday","address","field1","field2","field3"] | multiselect |
| mod_participate_userdata_requirements | ["name","birthday","address","field1","field2","field3"] | multiselect |
| mail_activated | checkbox | &nbsp; |

#### App-Manager locale values
| locale | value example |
|--------|--------|--------|
| login_headline | Sign up |
| msg_require_mail | An E-Mail address is required. |
| msg_require_mail_format | The E-Mail needs to be in the format of name@domain.co.uk |
| msg_require_password | A new password is required |
| msg_require_password_format | The password must be at least (0) characters long |
| msg_require_password_again | Needs to have the same content as the password |
| msg_login_wrongdata_title | Log in not possible |
| msg_login_wrongdata_description | Data does not match or the account does not exist. |
| msg_login_user_exists_title | Error |
| msg_login_user_exists_description | Account already exists |
| msg_mail_pwgetnew_title_error | Error |
| msg_mail_pwgetnew_desc_error | The password couldn't be changed. Please contact the admin. |
| msg_mail_pwgetnew_title_success | Congratulations |
| msg_mail_pwgetnew_desc_success | Password was saved successfully. |
| msg_mail_pwlost_title_success | Password sent. |
| msg_mail_pwlost_title_error | Error |
| msg_mail_pwlost_desc_error | A new password could't be sent |
| msg_mail_pwlost_desc_success | Please check your inbox |
| msg_require_firstname | Please enter your first name |
| msg_require_lastname | Please enter your last name |
| msg_require_birthday | Please fill in your date of birth |
| msg_require_street | Please fill in street name |
| msg_require_zip | Please enter your Zip code |
| msg_require_city | Please fill in your city |
| msg_require_field1 | Please fill in |
| msg_require_field2 | Please fill in |
| msg_require_field3 | Please fill in |
| msg_require_terms | Please accept the conditions of participation |