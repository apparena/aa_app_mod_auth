<?php
/**
 * Auth
 *
 * CLASSDESCRIPTION
 *
 * @category    CATEGORY NAME
 * @package     PACKAGE NAME
 * @subpackage  PACKAGE NAME
 *
 * @author      "Marcus Merchel" <kontakt@marcusmerchel.de>
 * @copyright   Copyright (c) 2009-2014 Marcus Merchel (http://www.marcusmerchel.de/)
 * @link        http://www.marcusmerchel.de/
 * @license     http://www.marcusmerchel.de/licence/
 * @version     1.0.0 (20.03.14 - 18:00)
 */
namespace Apparena\Modules\Auth;

// ToDo: optimize code, combine sql statements and bindings in global class properties

defined('_VALID_CALL') or die('Direct Access is not allowed.');

class Auth
{
    const TBL_MAIN   = 'mod_auth_user';
    const TBL_DATA   = 'mod_auth_user_data';
    const TBL_AVATAR = 'mod_auth_user_avatar';
    // auth user
    const ROW_UID   = 'uid';
    const ROW_TOKEN = 'token';
    const ROW_USER  = 'user';
    const ROW_FB_ID = 'fb_id';
    const ROW_TW_ID = 'tw_id';
    const ROW_GP_ID = 'gp_id';
    const ROW_IP    = 'ip';
    // user data
    const ROW_AUTH_UID         = 'auth_uid';
    const ROW_ADDITIONAL       = 'additional';
    const ROW_OPTIN_NEWSLETTER = 'optin_nl';
    const ROW_OPTIN_REMINDER   = 'optin_reminder';
    // additional for avatar
    const ROW_AVATAR_DEFAULT = 'selected';
    const ROW_AVATARS        = 'avatars';
    const ROW_AVATAR_UPLOAD  = 'upload';
    protected $_slim;
    protected $_pw;
    protected $_uid;
    protected $_gid;
    protected $_type;
    protected $_login_type;
    protected $_user_type;
    public $user_email;
    public $user_password;
    public $i_id;
    public $user = null;
    public $return = array();

    public function __construct(\Slim\Slim $slim)
    {
        if (empty($_POST['login_type']))
        {
            throw new \Exception('Login-Type was not sent by request in ' . __FILE__);
        }
        $this->_login_type = $_POST['login_type'];

        if (empty($_POST['type']) || ($_POST['type'] !== 'register' && $_POST['type'] !== 'login' && $_POST['type'] !== 'social'))
        {
            throw new \Exception('Request type was not sent or is wrong, in ' . __FILE__);
        }
        $this->_type = $_POST['type'];

        if (empty($_POST['email']))
        {
            throw new \Exception('E-Mail address was not sent by request in ' . __FILE__);
        }
        $this->user_email = $_POST['email'];

        if ($_POST['login_type'] === 'appuser')
        {
            if (empty($_POST['password']))
            {
                throw new \Exception('Password was not sent by request in ' . __FILE__);
            }
            $this->user_password = $_POST['password'];
        }
        else
        {
            // set randome password, this is a social login
            $this->user_password = md5(time() . $this->user_email . uniqid());
        }

        // define instance id
        $this->i_id = $_POST['i_id'];
        // get password class
        $this->_pw = new \Apparena\Users\Password(APP_SECRET);
        // set basic return values
        $this->return['user_data'] = array(
            'additional'     => '',
            'optin_nl'       => '',
            'optin_reminder' => ''
        );
        $this->return['debug']     = array();

        // define slim instance
        $this->_slim = $slim;

        // try to get user information from database
        $this->getUserByEmail();

        array_push($this->return['debug'], '_type: ' . $this->_type);
        array_push($this->return['debug'], '_login_type: ' . $this->_login_type);

        if ($this->_type === 'register' && $this->_login_type === 'appuser')
        {
            // register normal app user
            $this->register();
        }
        elseif ($this->_type === 'login' && $this->_login_type === 'appuser')
        {
            // login normal app user
            $this->login();
        }
        elseif ($this->_login_type !== 'appuser' && $this->_type === 'social')
        {
            // register or login social connect user
            $this->overSocial();
        }
    }

    protected function defineSocialVariables()
    {
        array_push($this->return['debug'], 'defineSocialVariables');

        $return = array(
            'fb_id' => null,
            'tw_id' => null,
            'gp_id' => null,
        );

        if ($this->_login_type === 'fbuser')
        {
            $return['fb_id'] = $_POST['sid'];
        }
        if ($this->_login_type === 'twuser')
        {
            $return['tw_id'] = $_POST['sid'];
        }
        if ($this->_login_type === 'gpuser')
        {
            $return['gp_id'] = $_POST['sid'];
        }

        array_push($this->return['debug'], $return);

        return $return;
    }

    protected function defineAvatars()
    {
        global $db;

        $avatars = array();

        // define social login avatar only for social connects
        if ($this->_login_type === 'fbuser' && !empty($_POST['avatar']))
        {
            $avatars['facebook'] = $_POST['avatar'];
        }
        elseif ($this->_login_type === 'twuser' && !empty($_POST['avatar']))
        {
            $avatars['twitter'] = $_POST['avatar'];
        }
        elseif ($this->_login_type === 'gpuser' && !empty($_POST['avatar']))
        {
            $avatars['google'] = $_POST['avatar'];
        }

        // define basic avatar
        $avatars['gravatar'] = 'https://secure.gravatar.com/avatar/' . md5(strtolower($this->user_email)) . '?d=mm';

        $sql = "INSERT INTO
                    " . self::TBL_AVATAR . "
                SET
                    " . self::ROW_AUTH_UID . " = :" . self::ROW_AUTH_UID . ",
                    " . self::ROW_AVATAR_DEFAULT . " = :" . self::ROW_AVATAR_DEFAULT . ",
                    " . self::ROW_AVATARS . " = :" . self::ROW_AVATARS . ",
                    " . self::ROW_AVATAR_UPLOAD . " = :" . self::ROW_AVATAR_UPLOAD . "
                ";

        $default = key($avatars);
        $avatars = json_encode($avatars);
        $upload  = '';

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':' . self::ROW_AUTH_UID, $this->user->uid, \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_AVATAR_DEFAULT, $default, \PDO::PARAM_STR);
        $stmt->bindParam(':' . self::ROW_AVATARS, $avatars, \PDO::PARAM_STR);
        $stmt->bindParam(':' . self::ROW_AVATAR_UPLOAD, $upload, \PDO::PARAM_STR);
        $stmt->execute();

        // refresh user information
        $this->getUserByEmail();
    }

    protected function getAvatar()
    {
        global $db;

        $sql = "SELECT
                    selected,
                    avatars
                FROM
                    " . self::TBL_AVATAR . "
                WHERE
                    " . self::ROW_AUTH_UID . " = :" . self::ROW_AUTH_UID . "
                ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':' . self::ROW_AUTH_UID, $this->user->uid, \PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0)
        {
            $return = $stmt->fetchObject();
            //$return['avatars'] =json_decode($return['avatars']);
            //pr($return);
        }
        else
        {
            $return = array(
                'selected'  => 'gravatar',
                'gravatar' => 'https://secure.gravatar.com/avatar/' . md5(strtolower($this->user_email)) . '?d=mm',
            );
        }

        return $return;
    }

    protected function register()
    {
        global $db;

        array_push($this->return['debug'], 'registration');

        if (!is_null($this->user))
        {
            $this->return['message'] = 'user already exist';
            $this->return['code']    = '208';
            $this->return['status']  = 'error';
            array_push($this->return['debug'], 'user already exist');

            return $this;
        }

        // prepare sql statement to create new user
        $sql = "INSERT INTO
                    " . self::TBL_MAIN . "
                SET
                    i_id = :i_id,
                    " . self::ROW_USER . " = :" . self::ROW_USER . ",
                    " . self::ROW_TOKEN . " = :" . self::ROW_TOKEN . ",
                    " . self::ROW_FB_ID . " = :" . self::ROW_FB_ID . ",
                    " . self::ROW_TW_ID . " = :" . self::ROW_TW_ID . ",
                    " . self::ROW_GP_ID . " = :" . self::ROW_GP_ID . ",
                    " . self::ROW_IP . " = INET_ATON(:" . self::ROW_IP . ")
                ";

        // prepare new statement variables
        $ip = $this->_slim->request->getIp();

        // create password hash
        $this->_pw->encode($this->user_password, $this->user_email);
        $token = $this->_pw->getHash();

        // set social variables
        $social = $this->defineSocialVariables();

        // prepare query elements
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':i_id', $this->i_id, \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_USER, $this->user_email, \PDO::PARAM_STR);
        $stmt->bindParam(':' . self::ROW_TOKEN, $token, \PDO::PARAM_STR, 60);
        $stmt->bindParam(':' . self::ROW_FB_ID, $social['fb_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_TW_ID, $social['tw_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_GP_ID, $social['gp_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_IP, $ip);

        // execute sql statement and register user
        $stmt->execute();
        // refresh user information
        $this->getUserByEmail();
        // define avatars
        $this->defineAvatars();

        // prepare return data
        $this->return['code']                        = '200';
        $this->return['message']                     = $this->user->uid;
        $this->return['user_data']['additional']     = $this->user->additional;
        $this->return['user_data']['optin_nl']       = $this->user->optin_nl;
        $this->return['user_data']['optin_reminder'] = $this->user->optin_reminder;
        $this->return['status']                      = 'success';

        return $this;
    }

    protected function login()
    {
        array_push($this->return['debug'], 'login');
        if (is_null($this->user) || empty($this->user))
        {
            $this->return['message'] = 'user not exist';
            $this->return['code']    = '404';
            $this->return['status']  = 'error';
            array_push($this->return['debug'], 'user not exist');

            return $this;
        }

        // prepare return data
        $this->return['code']                        = '200';
        $this->return['message']                     = $this->user->uid;
        $this->return['status']                      = 'success';
        $this->return['user_data']['additional']     = $this->user->additional;
        $this->return['user_data']['optin_nl']       = $this->user->optin_nl;
        $this->return['user_data']['optin_reminder'] = $this->user->optin_reminder;

        if ($this->_pw->check($this->user_password, $this->user_email, $this->user->token) === false)
        {
            $this->return['code']    = '203';
            $this->return['message'] = 'wrong login';
            $this->return['status']  = 'error';
            array_push($this->return['debug'], 'wrong login');

            return $this;
        }

        if ($this->return['status'] === 'success')
        {
            $this->return['user_type'] = 'user';
        }

        return $this;
    }

    protected function overSocial()
    {
        global $db;

        array_push($this->return['debug'], 'overSocial');

        if (is_null($this->user))
        {
            // user not exist, register them
            $this->register();

            return $this;
        }

        // user exists, update them
        // prepare sql statement to create new user
        $sql = "UPDATE
                " . self::TBL_MAIN . "
                SET
                    " . self::ROW_FB_ID . " = :" . self::ROW_FB_ID . ",
                    " . self::ROW_TW_ID . " = :" . self::ROW_TW_ID . ",
                    " . self::ROW_GP_ID . " = :" . self::ROW_GP_ID . ",
                    " . self::ROW_IP . " = INET_ATON(:" . self::ROW_IP . ")
                WHERE
                    i_id = :i_id
                AND " . self::ROW_USER . " = :" . self::ROW_USER . "
                AND " . self::ROW_TOKEN . " = :" . self::ROW_TOKEN . "
                ";

        // prepare new statement variables
        $ip = $this->_slim->request->getIp();

        // create password hash
        $this->_pw->encode($this->user_password, $this->user_email);
        $token = $this->_pw->getHash();

        // set social variables
        $social = $this->defineSocialVariables();

        // prepare query elements
        $stmt = $db->prepare($sql);
        $stmt->bindParam(':i_id', $this->i_id, \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_USER, $this->user_email, \PDO::PARAM_STR);
        $stmt->bindParam(':' . self::ROW_TOKEN, $token, \PDO::PARAM_STR, 60);
        $stmt->bindParam(':' . self::ROW_FB_ID, $social['fb_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_TW_ID, $social['tw_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_GP_ID, $social['gp_id'], \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_IP, $ip);

        // execute sql statement and register user
        $stmt->execute();
        // refresh user information
        $this->getUserByEmail();

        // prepare return data
        $this->return['code']                        = '200';
        $this->return['message']                     = $this->user->uid;
        $this->return['user_data']['additional']     = $this->user->additional;
        $this->return['user_data']['optin_nl']       = $this->user->optin_nl;
        $this->return['user_data']['optin_reminder'] = $this->user->optin_reminder;
        $this->return['status']                      = 'success';

        return $this;
    }

    public function getUserByEmail()
    {
        global $db;

        array_push($this->return['debug'], 'get user information by mail');

        $sql = "SELECT
                user.*,
                data.additional,
                data.optin_nl,
                data.optin_reminder
            FROM
                " . self::TBL_MAIN . " AS user
            LEFT JOIN
                " . self::TBL_DATA . " AS data
                ON data." . self::ROW_AUTH_UID . " = user." . self::ROW_UID . "
            WHERE
                i_id = :i_id
            AND " . self::ROW_USER . " = :" . self::ROW_USER . "
            LIMIT 1
            ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':i_id', $this->i_id, \PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_USER, $this->user_email, \PDO::PARAM_STR);
        $stmt->execute();

        array_push($this->return['debug'], str_replace(array(
            ':i_id',
            ':' . self::ROW_USER
        ), array(
            "'" . $this->i_id . "'",
            "'" . $this->user_email . "'"
        ), $stmt->queryString));

        array_push($this->return['debug'], 'User amount: ' . $stmt->rowCount());
        if ($stmt->rowCount() > 0)
        {
            $this->user = $stmt->fetchObject();
            array_push($this->return['debug'], $this->user);

            // define avatar
            $this->return['avatar'] = $this->getAvatar();
        }

        return $this;
    }

    public function getReturn()
    {
        if (!defined('ENV_MODE') || ENV_MODE !== 'dev')
        {
            unset($this->return['debug']);
        }

        return $this->return;
    }
}

$auth   = new \Apparena\Modules\Auth\Auth($this);
$return = array_merge($return, $auth->getReturn());