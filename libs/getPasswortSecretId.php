<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_pwlost');

define('ROW_UID', 'auth_uid');
define('ROW_SECRET', 'secret');

try
{
    if (empty($_POST['secret']))
    {
        throw new \Exception('secret key was not sent by request in ' . __FILE__);
    }
    $secret = $_POST['secret'];

    // ToDo[maXus]: add later a timecheck for more secure (ex. 24h) - 02.09.13
    // check secret in database
    $select = "SELECT
                    " . ROW_SECRET . "
                FROM
                    " . TBL_MAIN . "
                WHERE
                    " . ROW_SECRET . " = :" . ROW_SECRET . "
                LIMIT 1
                ";

    $stmt = $db->prepare($select);
    $stmt->bindParam(':' . ROW_SECRET, $secret, PDO::PARAM_STR);
    $stmt->execute();

    $return['code']    = '404';
    $return['message'] = 'Secret not found in DB. ' . $secret;
    $return['status']  = 'success';

    if ($stmt->rowCount() === 1)
    {
        $secret = $stmt->fetchColumn(0);
        // prepare return data
        $return['code']    = '200';
        $return['message'] = $secret;
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