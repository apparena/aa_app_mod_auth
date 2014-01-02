<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_user');
define('TBL_PWLOST', 'mod_auth_pwlost');

define('ROW_AUTH_UID', 'uid');
define('ROW_PW_UID', 'auth_uid');
define('ROW_SECRET', 'secret');
define('ROW_MAIL', 'user');
define('ROW_PASSWORD', 'token');

try
{
    if (empty($_POST['data']['secret_id']))
    {
        throw new \Exception('secret key was not sent by request in ' . __FILE__);
    }
    $secret = $_POST['data']['secret_id'];

    if (empty($_POST['data']['email']))
    {
        throw new \Exception('E-Mail address was not sent by request in ' . __FILE__);
    }
    $email = $_POST['data']['email'];

    if (empty($_POST['data']['password']) || empty($_POST['data']['password2']))
    {
        throw new \Exception('Password was not sent by request in ' . __FILE__);
    }
    if ($_POST['data']['password'] !== $_POST['data']['password2'])
    {
        throw new \Exception('Password is not the same ' . __FILE__);
    }
    $password = $_POST['data']['password'];


    // ToDo[maXus]: add later a timecheck for more secure (ex. 24h) - 02.09.13
    // check secret in database
    $select = "SELECT
                    pwlost." . ROW_PW_UID . "
                FROM
                    " . TBL_PWLOST . " AS pwlost
                JOIN
                    " . TBL_MAIN . " AS user
                    ON user." . ROW_AUTH_UID . " = pwlost." . ROW_PW_UID . "
                WHERE
                    pwlost." . ROW_SECRET . " = :" . ROW_SECRET . "
                AND user." . ROW_MAIL . " = :" . ROW_MAIL . "
                LIMIT 1
                ";

    $stmt = $db->prepare($select);
    $stmt->bindParam(':' . ROW_MAIL, $email, PDO::PARAM_STR);
    $stmt->bindParam(':' . ROW_SECRET, $secret, PDO::PARAM_STR);
    $stmt->execute();

    // user not exist, create new entry
    $return['code'] = '404';
    $return['message'] = 'secret not found';

    if ($stmt->rowCount() === 1)
    {
        // get password class
        $file = ROOT_PATH . DS . 'libs' . DS . 'AppArena' . DS . 'Utils' . DS . 'User' . DS . 'Password' . DS . 'class.password.php';
        if (!file_exists($file))
        {
            throw new \Exception('File ' . $file . ' doesn\'t exist in ' . __FILE__);
        }
        include_once $file;
        $pw = new com\apparena\utils\user\password\Password($aa_app_secret);

        // save user data
        $user_id = $stmt->fetchColumn(0);
        $token = $pw->encode($password, $email)->getHash();

        // set new passwort
        $sql = "UPDATE
                    " . TBL_MAIN . "
                SET
                    " . ROW_PASSWORD . " = :" . ROW_PASSWORD . "
                WHERE
                    " . ROW_AUTH_UID . " = :" . ROW_AUTH_UID . "
                ";
        $update = $db->prepare($sql);
        $update->bindParam(':'. ROW_AUTH_UID, $user_id, PDO::PARAM_STR);
        $update->bindParam(':'. ROW_PASSWORD, $token, PDO::PARAM_STR);
        $update->execute();
        $update->rowCount();

        $last_id= $db->lastInsertId();

        $return['message'] = 'cannot update user table';
        if($update->rowCount() === 1)
        {
            // delete secret key
            $sql  = "DELETE FROM
                        " . TBL_PWLOST . "
                    WHERE
                        " . ROW_SECRET . " = :" . ROW_SECRET . "
                    ";
            $stmt = $db->prepare($sql);
            $stmt->bindParam(':' . ROW_SECRET, $secret, PDO::PARAM_STR);
            $stmt->execute();

            // prepare return data
            $return['code']    = '200';
            $return['message'] = 'user successfully updated';
            $return['status']  = 'success';
        }
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