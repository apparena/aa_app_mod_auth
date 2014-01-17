<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_user_data');

define('ROW_AUTH_UID', 'auth_uid');
define('ROW_ADDITIONAL', 'additional');

try
{
    if (empty($data[ROW_AUTH_UID]) || !is_numeric($data[ROW_AUTH_UID]))
    {
        throw new \Exception('uid id is not given ' . __FILE__);
    }
    $uid = $_POST[ROW_AUTH_UID];

    // prepare sql statement
    $sql = "SELECT
                " . ROW_ADDITIONAL . "
            WHERE
                i_id = :i_id
            AND " . ROW_AUTH_UID . " = :" . ROW_AUTH_UID . "
            LIMIT 1
            ";

    // prepare timestamp
    $timestamp = $current_date->getTimestamp();

    // prepare db statement and bind data
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':' . ROW_AUTH_UID, $data[ROW_AUTH_UID], PDO::PARAM_INT);
    $stmt->bindParam(':i_id', $i_id, PDO::PARAM_INT);

    if ($stmt->execute())
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