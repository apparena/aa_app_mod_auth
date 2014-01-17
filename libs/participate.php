<?php
/**
 * participate.php
 *
 * check user participation's and store new ones or get back a notice
 *
 * @category    modules
 * @package     participate
 * @subpackage  participation
 *
 * @author      "Marcus Merchel" <m.merchel@iconsultants.eu/>
 * @link        http://www.iconsultants.eu/
 * @version     1.0.0 (17.10.13 - 09:38)
 */

namespace com\apparena\modules\participate;

use \Exception;
use \PDO;

include_once('abstracts/Participation.php');

//defined('_VALID_CALL') or die('Direct Access is not allowed.');

/**
 * Class Participation
 *
 * @package com\apparena\modules\participate
 */
class Participation extends abstracts\Participation
{
    const TBL_LOG_USER           = 'mod_log_user';
    const ROW_AUTH_UID           = 'auth_uid';
    const ROW_CODE               = 'code';
    const ROW_DATA               = 'data';
    const ROW_INSTANCE_ID        = 'i_id';
    const PARTICIPATION_LOG_CODE = 1008;
    /**
     * user id
     *
     * @var null|int
     */
    protected $_uid = null;
    /**
     * app arena app instance id
     *
     * @var null|int
     */
    protected $_aa_instance_id = null;
    /**
     * store corrent door
     *
     * @var null|int
     */
    protected $_door = null;
    /**
     * current user participations on current door
     *
     * @var int
     */
    protected $_number_of_participating = 0;
    /**
     * maximal participation's for current door
     *
     * @var int
     */
    protected $_max_particiption = 0;
    /**
     * store participated doors (all doors) and amount for each door
     *
     * @var array
     */
    protected $_doors_participations = array();
    /**
     * participate status for current door
     *
     * @var bool
     */
    protected $_participate = false;

    /**
     * @param array $settings
     */
    public function __construct(array $settings)
    {
        if (!empty($settings['door']))
        {
            $this->setDoor($settings['door']);
        }

        if (!empty($settings['max_particiption']))
        {
            $this->setMaxParticiption($settings['max_particiption']);
        }
        if (!empty($settings['aa_instance_id']))
        {
            $this->setAaInstanceId($settings['aa_instance_id']);
        }
        if (!empty($settings['uid']))
        {
            $this->setUid($settings['uid']);
        }
    }

    /**
     * @return $this
     * @throws \Exception
     */
    public function getParticipations()
    {
        global $db;
        if ($this->getDoor() === null)
        {
            throw new Exception('please set a door number to handle participating in ' . __FILE__);
        }
        if ($this->getUid() === null || $this->getUid() === 0)
        {
            throw new Exception('set id to get participations in ' . __FILE__);
        }
        if ($this->getAaInstanceId() === null || $this->getAaInstanceId() === 0)
        {
            throw new Exception('set instance id to get participations in ' . __FILE__);
        }

        $uid        = $this->getUid();
        $code       = self::PARTICIPATION_LOG_CODE;
        $i_id = $this->getAaInstanceId();

        $sql = "SELECT
                    " . self::ROW_DATA . "
                FROM
                    " . self::TBL_LOG_USER . "
                WHERE
                    " . self::ROW_AUTH_UID . " = :" . self::ROW_AUTH_UID . "
                AND " . self::ROW_CODE . " = :" . self::ROW_CODE . "
                AND " . self::ROW_INSTANCE_ID . " = :" . self::ROW_INSTANCE_ID . "
                AND " . self::ROW_DATA . " != '[]'
                ";

        $stmt = $db->prepare($sql);
        $stmt->bindParam(':' . self::ROW_AUTH_UID, $uid, PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_CODE, $code, PDO::PARAM_INT);
        $stmt->bindParam(':' . self::ROW_INSTANCE_ID, $i_id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() > 0)
        {
            $this->_handleParticipationsResult($stmt->fetchAll())->_checkDoorParticipations();
        }
        else
        {
            $this->_checkDoorParticipations();
        }

        return $this;
    }

    /**
     *  set partipation status if participations lower then max participations from app manager config
     */
    protected function _checkDoorParticipations()
    {
        $current = $this->getNumberOfParticipating();
        $max     = $this->getMaxParticiption();
        if ($current <= $max)
        {
            $this->setParticipate(true);
        }
    }

    /**
     * @param $participations array
     *
     * @return $this
     */
    protected function _handleParticipationsResult($participations)
    {
        foreach ($participations AS $participating)
        {
            $participating = json_decode($participating->data);
            $this->setDoorsParticipations($participating->door);
        }
        $doors_participations = $this->getDoorsParticipations();
        if (!empty($doors_participations[$this->getDoor()]))
        {
            $this->setNumberOfParticipating($doors_participations[$this->getDoor()]);
        }
        else
        {
            $this->setNumberOfParticipating(1);
        }
        return $this;
    }
}

use com\apparena\modules\participate;

if ((empty($_POST['door_id']) || !is_numeric($_POST['door_id'])) && (!defined('ENV_MODE') || ENV_MODE !== 'dev'))
{
    throw new Exception('door id not given in ' . __FILE__);
}

if ((empty($_POST['uid']) || !is_numeric($_POST['uid'])) && (!defined('ENV_MODE') || ENV_MODE !== 'dev'))
{
    throw new Exception('uid not given in ' . __FILE__);
}

$settings = array(
    'door'             => $_REQUEST['door_id'],
    'aa_instance_id'   => $i_id,
    'max_particiption' => __c('max_particiption'),
    'uid'              => $_REQUEST['uid']
);

$participate = new Participation($settings);
$participate->getParticipations();

if ($participate->getParticipate() === true)
{
    $return['code']   = 200;
    $return['status'] = 'success';
}
else
{
    $return['code']   = 403;
    $return['status'] = 'forbidden';
}

// set current door 1 up. we save them in the callback of the ajax request
$participate->setDoorsParticipations($_REQUEST['door_id']);
$return['participations'] = $participate->getDoorsParticipations();
