<?php
/**
 * AbstractParticipation
 *
 * Abstract method vor participation class with all setter and getter mothods
 *
 * @category    modules
 * @package     participate
 * @subpackage  participation
 *
 * @author      "Marcus Merchel" <m.merchel@iconsultants.eu/>
 * @link        http://www.iconsultants.eu/
 * @version     1.0.0 (17.10.13 - 12:05)
 */
namespace com\apparena\modules\participate\abstracts;

abstract class Participation
{
    /**
     * @return int|null
     */
    public function getDoor()
    {
        return $this->_door;
    }

    /**
     * @param $door
     *
     * @return $this
     */
    public function setDoor($door)
    {
        if (is_numeric($door))
        {
            $this->_door = $door;
        }
        return $this;
    }

    /**
     * @return int|null
     */
    public function getUid()
    {
        return $this->_uid;
    }

    /**
     * @param $uid
     *
     * @return $this
     */
    public function setUid($uid)
    {
        if (is_numeric($uid))
        {
            $this->_uid = $uid;
        }
        return $this;
    }

    /**
     * @return array
     */
    public function getDoorsParticipations()
    {
        return $this->_doors_participations;
    }

    /**
     * @param $door int doornumber
     *
     * @return $this
     */
    public function setDoorsParticipations($door)
    {
        if (is_numeric($door))
        {
            $door_participations = $this->getDoorsParticipations();
            if (empty($door_participations[$door]))
            {
                $door_participations[$door] = 1;
            }
            else
            {
                $door_participations[$door]++;
            }
            $this->_doors_participations = $door_participations;
        }
        return $this;
    }

    /**
     * @return int
     */
    public function getMaxParticiption()
    {
        return $this->_max_particiption;
    }

    /**
     * @param $max_particiption
     *
     * @return $this
     */
    public function setMaxParticiption($max_particiption)
    {
        if (is_numeric($max_particiption))
        {
            $this->_max_particiption = $max_particiption;
        }
        return $this;
    }

    /**
     * @return int|null
     */
    public function getAaInstanceId()
    {
        return $this->_aa_instance_id;
    }

    /**
     * @param $aa_instance_id
     *
     * @return $this
     */
    public function setAaInstanceId($aa_instance_id)
    {
        if (is_numeric($aa_instance_id))
        {
            $this->_aa_instance_id = $aa_instance_id;
        }
        return $this;
    }

    /**
     * @return int
     */
    public function getNumberOfParticipating()
    {
        return $this->_number_of_participating;
    }

    /**
     * @param $number_of_participating
     *
     * @return $this
     */
    public function setNumberOfParticipating($number_of_participating)
    {
        if (is_numeric($number_of_participating))
        {
            $this->_number_of_participating = $number_of_participating;
        }
        return $this;
    }

    /**
     * @param boolean $participate
     */
    public function setParticipate($participate)
    {
        $this->_participate = $participate;
    }

    /**
     * @return bool
     */
    public function getParticipate()
    {
        if ($this->_participate === true)
        {
            return true;
        }
        return false;
    }
}