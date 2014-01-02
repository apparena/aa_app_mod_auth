<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_auth_user_data');

define('ROW_AMOUNT', 8);

define('ROW_AUTH_UID', 'auth_uid');
define('ROW_FIRSTNAME', 'firstname');
define('ROW_LASTNAME', 'lastname');
define('ROW_BIRTHDAY', 'birthday');
define('ROW_MAIL', 'email');
define('ROW_NEWSLETTER', 'newsletter');
define('ROW_REMINDER', 'reminder');
define('ROW_OPTIN_REMINDER', 'optin_reminder');
define('ROW_TERMS', 'terms');
define('ROW_ADDITIONAL', 'additional');
define('ROW_LAST_UPDATE', 'last_update');
define('ROW_DATE_ADDED', 'date_added');

try
{
    if (empty($_POST['user_data']) && count($_POST['user_data']) >= ROW_AMOUNT)
    {
        throw new \Exception('user_data was not sent by request or the amount is to low in ' . __FILE__);
    }
    $data = $_POST['user_data'];

    // modify and prepare data
    if (!empty($data[ROW_NEWSLETTER]) && ($data[ROW_NEWSLETTER] === 'true' || $data[ROW_NEWSLETTER] === '1'))
    {
        $data[ROW_NEWSLETTER] = 1;
    }
    else
    {
        $data[ROW_NEWSLETTER] = 0;
    }

    if (!empty($data[ROW_OPTIN_REMINDER]) && $data[ROW_OPTIN_REMINDER] === '1')
    {
        $data[ROW_OPTIN_REMINDER] = 1;
    }
    else
    {
        $data[ROW_OPTIN_REMINDER] = 0;
    }

    if (!empty($data[ROW_TERMS]) && $data[ROW_TERMS] === 'true')
    {
        $data[ROW_TERMS] = 1;
    }
    else
    {
        $data[ROW_TERMS] = 0;
    }

    if (!empty($data[ROW_BIRTHDAY]))
    {
        $time               = strtotime($data[ROW_BIRTHDAY]);
        $time               = date('Y-m-d', $time);
        $birthday           = new DateTime($time, new DateTimeZone($aa_default_timezone));
        $data[ROW_BIRTHDAY] = $birthday->getTimestamp();
    }

    $data[ROW_ADDITIONAL] = json_encode($data);

    // prepare sql statement
    $sql = "INSERT INTO
                " . TBL_MAIN . "
            SET
                " . ROW_AUTH_UID . " = :" . ROW_AUTH_UID . ",
                " . ROW_FIRSTNAME . " = :" . ROW_FIRSTNAME . ",
                " . ROW_LASTNAME . " = :" . ROW_LASTNAME . ",
                " . ROW_BIRTHDAY . " = FROM_UNIXTIME(:" . ROW_BIRTHDAY . "),
                " . ROW_MAIL . " = :" . ROW_MAIL . ",
                " . ROW_NEWSLETTER . " = :" . ROW_NEWSLETTER . ",
                " . ROW_REMINDER . " = :" . ROW_REMINDER . ",
                " . ROW_TERMS . " = :" . ROW_TERMS . ",
                " . ROW_ADDITIONAL . " = :" . ROW_ADDITIONAL . ",
                " . ROW_LAST_UPDATE . " = FROM_UNIXTIME(:" . ROW_DATE_ADDED . "),
                " . ROW_DATE_ADDED . " = FROM_UNIXTIME(:" . ROW_DATE_ADDED . ")
            ON DUPLICATE KEY UPDATE
                " . ROW_AUTH_UID . " = :" . ROW_AUTH_UID . ",
                " . ROW_FIRSTNAME . " = :" . ROW_FIRSTNAME . ",
                " . ROW_LASTNAME . " = :" . ROW_LASTNAME . ",
                " . ROW_BIRTHDAY . " = FROM_UNIXTIME(:" . ROW_BIRTHDAY . "),
                " . ROW_MAIL . " = :" . ROW_MAIL . ",
                " . ROW_NEWSLETTER . " = :" . ROW_NEWSLETTER . ",
                " . ROW_REMINDER . " = :" . ROW_REMINDER . ",
                " . ROW_OPTIN_REMINDER . " = :" . ROW_OPTIN_REMINDER . ",
                " . ROW_TERMS . " = :" . ROW_TERMS . ",
                " . ROW_ADDITIONAL . " = :" . ROW_ADDITIONAL . ",
                " . ROW_LAST_UPDATE . " = FROM_UNIXTIME(:" . ROW_DATE_ADDED . ")
            ";

    // prepare timestamp
    $timestamp = $current_date->getTimestamp();

    // prepare db statement and bind data
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':' . ROW_AUTH_UID, $data[ROW_AUTH_UID], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_FIRSTNAME, $data[ROW_FIRSTNAME], PDO::PARAM_STR);
    $stmt->bindParam(':' . ROW_LASTNAME, $data[ROW_LASTNAME], PDO::PARAM_STR);
    $stmt->bindParam(':' . ROW_BIRTHDAY, $data[ROW_BIRTHDAY], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_MAIL, $data[ROW_MAIL], PDO::PARAM_STR);
    $stmt->bindParam(':' . ROW_NEWSLETTER, $data[ROW_NEWSLETTER], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_REMINDER, $data[ROW_REMINDER], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_OPTIN_REMINDER, $data[ROW_OPTIN_REMINDER], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_TERMS, $data[ROW_TERMS], PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_ADDITIONAL, $data[ROW_ADDITIONAL], PDO::PARAM_STR);
    $stmt->bindParam(':' . ROW_DATE_ADDED, $timestamp, PDO::PARAM_INT);

    if ($stmt->execute())
    {
        $return['code']    = 200;
        $return['status']  = 'success';
        $return['message'] = 'data successfully stored';
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