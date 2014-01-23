<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_user');
define('TBL_DATA', 'mod_auth_user_data');

define('ROW_UID', 'uid');
define('ROW_AUTH_UID', 'auth_uid');
define('ROW_ADDITIONAL', 'additional');

try
{
    if (empty($_POST['data'][ROW_AUTH_UID]) || !is_numeric($_POST['data'][ROW_AUTH_UID]))
    {
        throw new \Exception('uid id is not sent by request ' . __FILE__);
    }
    $uid = $_POST['data'][ROW_AUTH_UID];

    // prepare sql statement
    $sql = "SELECT
                " . TBL_DATA . '.' . ROW_ADDITIONAL . "
            FROM
                " . TBL_MAIN . "
            LEFT JOIN
                " . TBL_DATA . "
                on " . TBL_DATA . '.' . ROW_AUTH_UID . " = " . TBL_MAIN . '.' . ROW_UID . "
            WHERE
                i_id = :i_id
            AND " . TBL_MAIN . '.' . ROW_UID . " = :" . ROW_UID . "
            LIMIT 1
            ";

    // prepare timestamp
    $timestamp = $current_date->getTimestamp();

    // prepare db statement and bind data
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':' . ROW_UID, $uid, PDO::PARAM_INT);
    $stmt->bindParam(':i_id', $i_id, PDO::PARAM_INT);
    $stmt->execute();

    $return['status']     = 'success';
    $return['message']    = 'userdata not exist';
    $return['additional'] = null;

    if ($stmt->rowCount() > 0)
    {
        $user                 = $stmt->fetchObject();
        $return['code']       = 200;
        $return['status']     = 'success';
        $return['message']    = '';
        $return['additional'] = $user->additional;
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