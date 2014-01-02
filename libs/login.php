<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_user');
define('TBL_DATA', 'mod_auth_user_data');
// auth user
define('ROW_UID', 'uid');
define('ROW_TOKEN', 'token');
define('ROW_USER', 'user');
define('ROW_FB_ID', 'fb_id');
define('ROW_TW_ID', 'tw_id');
define('ROW_GP_ID', 'gp_id');
define('ROW_IP', 'ip');
// user data
define('ROW_AUTH_UID', 'auth_uid');
define('ROW_ADDITIONAL', 'additional');
define('ROW_OPTIN_NEWSLETTER', 'optin_nl');
define('ROW_OPTIN_REMINDER', 'optin_reminder');

try
{
    if (empty($_POST['login_type']))
    {
        throw new \Exception('Login-Type was not sent by request in ' . __FILE__);
    }

    if (empty($_POST['email']))
    {
        throw new \Exception('E-Mail address was not sent by request in ' . __FILE__);
    }
    $email = $_POST['email'];

    if ($_POST['login_type'] === 'appuser')
    {
        if (empty($_POST['password']))
        {
            throw new \Exception('Password was not sent by request in ' . __FILE__);
        }
        $password = $_POST['password'];
    }
    else
    {
        // set randome password, this is a social login
        $password = md5(time() . $email . uniqid() . $aa_inst_id);
    }

    $return['user_data'] = array(
        'additional'     => '',
        'optin_nl'       => '',
        'optin_reminder' => ''
    );

    // check database for existing user
    $sql = "SELECT
                user.*,
                data.additional,
                data.optin_nl,
                data.optin_reminder
            FROM
                " . TBL_MAIN . " AS user
            LEFT JOIN
                " . TBL_DATA . " AS data
                ON data." . ROW_AUTH_UID . " = user." . ROW_UID . "
            WHERE
                aa_inst_id = :aa_inst_id
            AND " . ROW_USER . " = :" . ROW_USER . "
            LIMIT 1
            ";

    $user = null;

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':aa_inst_id', $aa_inst_id, PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_USER, $email, PDO::PARAM_STR);
    $stmt->execute();

    // get password class
    $file = ROOT_PATH . DS . 'libs' . DS . 'AppArena' . DS . 'Utils' . DS . 'User' . DS . 'Password' . DS . 'class.password.php';
    if (!file_exists($file))
    {
        throw new \Exception('File ' . $file . ' doesn\'t exist in ' . __FILE__);
    }
    include_once $file;
    $pw = new com\apparena\utils\user\password\Password($aa_app_secret);

    // user not exist, create new entry
    if ($stmt->rowCount() === 0 || ($stmt->rowCount() > 0 && $_POST['login_type'] !== 'appuser'))
    {
        $return['debug'] = 'user not exists';
        $return['code']  = '201';

        if ($_POST['login_type'] !== 'appuser' && $stmt->rowCount() === 0)
        {
            $return['debug'] = 'user not exist - social connect';
        }
        if ($_POST['login_type'] !== 'appuser' && $stmt->rowCount() > 0)
        {
            $return['debug'] = 'user exist - social connect';
            $return['code']  = '200';
        }

        // prepare sql statement to create new user
        $sql = "INSERT INTO
                " . TBL_MAIN . "
                SET
                    aa_inst_id = :aa_inst_id,
                    " . ROW_USER . " = :" . ROW_USER . ",
                    " . ROW_TOKEN . " = :" . ROW_TOKEN . ",
                    " . ROW_FB_ID . " = :" . ROW_FB_ID . ",
                    " . ROW_TW_ID . " = :" . ROW_TW_ID . ",
                    " . ROW_GP_ID . " = :" . ROW_GP_ID . ",
                    " . ROW_IP . " = INET_ATON(:" . ROW_IP . ")
                ON DUPLICATE KEY UPDATE
                    " . ROW_FB_ID . " = :" . ROW_FB_ID . ",
                    " . ROW_TW_ID . " = :" . ROW_TW_ID . ",
                    " . ROW_GP_ID . " = :" . ROW_GP_ID . ",
                    " . ROW_IP . " = INET_ATON(:" . ROW_IP . ")
                ";

        // prepare query elements
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':aa_inst_id', $aa_inst_id, PDO::PARAM_INT);
        $stmt->bindParam(':' . ROW_USER, $email, PDO::PARAM_STR);
        $stmt->bindParam(':' . ROW_TOKEN, $token, PDO::PARAM_STR, 60);
        $stmt->bindParam(':' . ROW_FB_ID, $fb_id, PDO::PARAM_INT);
        $stmt->bindParam(':' . ROW_TW_ID, $tw_id, PDO::PARAM_INT);
        $stmt->bindParam(':' . ROW_GP_ID, $gp_id, PDO::PARAM_INT);
        $stmt->bindParam(':' . ROW_IP, $token, PDO::PARAM_STR, 60);
        $stmt->bindParam(':' . ROW_IP, $ip);

        $ip = get_client_ip();

        // create password hash
        $pw->encode($password, $email);
        $token = $pw->getHash();

        // set social variables
        $fb_id = null;
        $tw_id = null;
        $gp_id = null;
        if ($_POST['login_type'] === 'fbuser')
        {
            $fb_id = $_POST['sid'];
        }
        if ($_POST['login_type'] === 'twuser')
        {
            $tw_id = $_POST['sid'];
        }
        if ($_POST['login_type'] === 'gpuser')
        {
            $gp_id = $_POST['sid'];
        }
        $stmt->execute();

        // we need the user ID, get them. lastInsertId doesn't work in update
        $sql  = "SELECT
                    user.uid,
                    data.additional,
                    data.optin_nl,
                    data.optin_reminder
                FROM
                    " . TBL_MAIN . " AS user
                LEFT JOIN
                    " . TBL_DATA . " AS data
                    ON data." . ROW_AUTH_UID . " = user." . ROW_UID . "
                WHERE
                    aa_inst_id = :aa_inst_id
                AND " . ROW_USER . " = :" . ROW_USER . "
                LIMIT 1
               ";
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':aa_inst_id', $aa_inst_id, PDO::PARAM_INT);
        $stmt->bindParam(':' . ROW_USER, $email, PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetchObject();

        // prepare return data
        //$return['code']                        = '201';
        $return['message']                     = $user->uid;
        $return['user_data']['additional']     = $user->additional;
        $return['user_data']['optin_nl']       = $user->optin_nl;
        $return['user_data']['optin_reminder'] = $user->optin_reminder;
        $return['status']                      = 'success';
    }
    // user exists, check password, if not a social connect user
    else
    {
        $return['debug'] = 'user exists';

        $user = $stmt->fetchObject();

        // prepare return data
        $return['code']                        = '200';
        $return['message']                     = $user->uid;
        $return['status']                      = 'success';
        $return['user_data']['additional']     = $user->additional;
        $return['user_data']['optin_nl']       = $user->optin_nl;
        $return['user_data']['optin_reminder'] = $user->optin_reminder;

        // check password if user is app user
        /*if ($_POST['login_type'] === 'appuser')
        {*/
        if ($pw->check($password, $email, $user->token) === false)
        {
            $return['code']    = '203';
            $return['message'] = 'wrong login';
            $return['status']  = 'error';
        }
        /*}
        else
        {
            // social connect user, skip pw check and set stored fb id
            $user = (array)$user;

            $fb_id = $user[ROW_FB_ID];
            $tw_id = $user[ROW_TW_ID];
            $gp_id = $user[ROW_GP_ID];
        }*/
    }
    $return['avatar'] = 'https://secure.gravatar.com/avatar/' . md5(strtolower($email)) . '?s=40&d=mm';

    if ($_POST['login_type'] === 'fbuser' && !empty($_POST['avatar']))
    {
        //$return['avatar'] = 'http://graph.facebook.com/' . $fb_id . '/picture?width=40&height=40';
        $return['avatar'] = $_POST['avatar'];
    }
    if ($_POST['login_type'] === 'twuser' && !empty($_POST['avatar']))
    {
        $return['avatar'] = $_POST['avatar'];
    }
    if ($_POST['login_type'] === 'gpuser' && !empty($_POST['avatar']))
    {
        $return['avatar'] = $_POST['avatar'];
    }

    if ($return['status'] === 'success')
    {
        // safe admin status
        /*$session                 = array();
        $session['gid']          = 'user';
        $session['user']['mail'] = $email;
        $admins                  = ',' . __c('admin_mails') . ',';
        if (strpos($admins, $email) !== false)
        {
            $session['gid'] = 'admin';
        }
        $return['user_type']    = $session['gid'];*/
        $return['user_type'] = 'user';
        //$_SESSION['login'] = $session;
    }

    if (!defined('ENV_MODE') || ENV_MODE !== 'dev')
    {
        unset($return['debug']);
    }
}
catch (Exception $e)
{
    // prepare return data
    $return['code']    = $e->getCode();
    $return['status']  = 'error';
    $return['message'] = $e->getMessage();
    $return['trace']   = $e->getTrace();
}
catch (PDOException $e)
{
    // prepare return data for database errors
    $return['code']    = $e->getCode();
    $return['status']  = 'error';
    $return['message'] = $e->getMessage();
    $return['trace']   = $e->getTrace();
}