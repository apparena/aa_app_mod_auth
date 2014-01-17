<?php
defined('_VALID_CALL') or die('Direct Access is not allowed.');

define('TBL_MAIN', 'mod_log_user');

define('ROW_AUTH_UID', 'auth_uid');
define('ROW_SCOPE', 'scope');
define('ROW_DATA', 'data');
define('ROW_CODE', 'code');

try
{
    if (empty($_POST['uid']))
    {
        throw new \Exception('UID was not sent by request in ' . __FILE__);
    }
    $uid = (int)$_POST['uid'];

    $return['doors'] = null;

    // check database for existing user
    $sql = "SELECT
                " . ROW_DATA . ",
                " . ROW_CODE . "
            FROM
                " . TBL_MAIN . "
            WHERE
                i_id = :i_id
            AND " . ROW_AUTH_UID . " = :" . ROW_AUTH_UID . "
            AND (
                " . ROW_CODE . " = :" . ROW_CODE . "_participated
                OR " . ROW_CODE . " = :" . ROW_CODE . "_selected_friends
                )
            ORDER BY
                " . ROW_CODE . " ASC
            ";

    $code_participated     = 1008;
    $code_selected_friends = 5001;

    $stmt = $db->prepare($sql);
    $stmt->bindParam(':i_id', $i_id, PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_AUTH_UID, $uid, PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_CODE . '_participated', $code_participated, PDO::PARAM_INT);
    $stmt->bindParam(':' . ROW_CODE . '_selected_friends', $code_selected_friends, PDO::PARAM_INT);
    $stmt->execute();

    // user not exist, create new entry
    if ($stmt->rowCount() > 0)
    {
        $doors = $stmt->fetchAll();
        foreach ($doors as $key => $data)
        {
            $data->data = json_decode($data->data);

            // first create door arrays
            if ($data->code === '1008') // participated
            {
                $return['doors'][$data->data->door] = array(
                    'id' => $data->data->door
                );
            }

            // now fill it with informations
            if ($data->code === '5001') // selected FB friends
            {
                if (!empty($data->data->door_id) && isset($return['doors'][$data->data->door_id]))
                {
                    if (empty($return['doors'][$data->data->door_id]['selected_friends']))
                    {
                        $return['doors'][$data->data->door_id]['selected_friends'] = 0;
                    }
                    $return['doors'][$data->data->door_id]['selected_friends'] += $data->data->amount;
                }
            }
        }
        // prepare return data
        $return['code']    = 200;
        $return['message'] = '';
        $return['status']  = 'success';
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