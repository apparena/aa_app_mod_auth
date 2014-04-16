<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

try
{
    if (empty($_POST['user_data']) || empty($_POST['user_data']['auth_uid']))
    {
        throw new \Exception('uid not exist in ' . __FILE__);
    }
    $uid = $_POST['user_data']['auth_uid'];

    if (empty($_POST['user_data']['login_type']))
    {
        throw new \Exception('login_type was not sent by request in ' . __FILE__);
    }
    $login_type = $_POST['user_data']['login_type'];

    if ($login_type === 'appuser')
    {
        if (empty($_POST['password']))
        {
            throw new \Exception('password was not sent by request in ' . __FILE__);
        }
        $password = $_POST['password'];

        // get password class
        $pw = new \Apparena\Users\Password(APP_SECRET);

        // check database for existing user and passwort
        $sql = "SELECT
                token,
                user
            FROM
                mod_auth_user
            WHERE
                i_id = :i_id
            AND uid = :uid
            LIMIT 1
            ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':i_id', $i_id, PDO::PARAM_INT);
        $stmt->bindParam(':uid', $uid, PDO::PARAM_INT);
        $stmt->execute();
        $user = $stmt->fetchObject();

        if ($pw->check($password, $user->user, $user->token) === false)
        {
            throw new Exception('User not exist or wrong password', 203);
        }
    }
    else
    {
        if (empty($_POST['user_data']['login_sid']))
        {
            throw new \Exception('login_sid was not sent by request in ' . __FILE__);
        }
        $sid = $_POST['user_data']['login_sid'];

        $sql = "SELECT
                    uid
                FROM
                    mod_auth_user
                WHERE
                    i_id = :i_id
                AND uid = :uid
                AND (
                    fb_id = :sid
                OR  tw_id = :sid
                OR  gp_id = :sid
                )
                LIMIT 1
                ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':i_id', $i_id, PDO::PARAM_INT);
        $stmt->bindParam(':uid', $uid, PDO::PARAM_INT);
        $stmt->bindParam(':sid', $sid, PDO::PARAM_STR);
        $stmt->execute();

        if($stmt->rowCount() === 0)
        {
            throw new Exception('User not exist or wrong password', 203);
        }
    }

    include_once(ROOT_PATH . '/modules/aa_app_mod_auth/libs/data.php');
}
catch (Exception $e)
{
    // prepare return data
    $return['code']    = $e->getCode();
    $return['status']  = 'error';
    $return['message'] = $e->getMessage();
    $return['trace']   = $e->getTrace();
}