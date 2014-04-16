CREATE TABLE `mod_auth_pwlost` (
    `auth_uid`   BIGINT(20) UNSIGNED NOT NULL,
    `secret`     VARCHAR(32)         NOT NULL,
    `date_added` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX `auth_uid` (`auth_uid`)
)
    COLLATE ='latin1_swedish_ci'
    ENGINE =InnoDB;

CREATE TABLE `mod_auth_user` (
    `uid`   BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `gid`   INT(11) UNSIGNED    NOT NULL DEFAULT '0',
    `i_id`  INT(11) UNSIGNED    NOT NULL,
    `user`  VARCHAR(255)        NOT NULL,
    `token` VARCHAR(60)         NOT NULL,
    `fb_id` BIGINT(20)          NULL DEFAULT NULL,
    `tw_id` VARCHAR(50)         NULL DEFAULT NULL,
    `gp_id` VARCHAR(50)         NULL DEFAULT NULL,
    `ip`    INT(11) UNSIGNED    NULL DEFAULT NULL,
    PRIMARY KEY (`uid`),
    UNIQUE INDEX `i_id_user` (`user`, `i_id`)
)
    COLLATE ='utf8_general_ci'
    ENGINE =InnoDB;

CREATE TABLE `mod_auth_user_avatar` (
    `id`       BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
    `auth_uid` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
    `selected` VARCHAR(20)         NULL DEFAULT 'gravatar',
    `avatars`  TEXT                NULL,
    `upload`   LONGBLOB            NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `auth_uid` (`auth_uid`),
    CONSTRAINT `FK_mod_auth_user_avatar_mod_auth_user` FOREIGN KEY (`auth_uid`) REFERENCES `mod_auth_user` (`uid`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    COLLATE ='utf8_general_ci'
    ENGINE =InnoDB;

CREATE TABLE `mod_auth_user_data` (
    `id`             INT(11) UNSIGNED    NOT NULL AUTO_INCREMENT,
    `auth_uid`       BIGINT(20) UNSIGNED NOT NULL,
    `firstname`      VARCHAR(60)         NULL DEFAULT NULL,
    `lastname`       VARCHAR(60)         NULL DEFAULT NULL,
    `birthday`       TIMESTAMP           NULL DEFAULT NULL,
    `email`          VARCHAR(255)        NOT NULL,
    `newsletter`     TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `reminder`       TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `terms`          TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `optin_nl`       TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `optin_reminder` TINYINT(1) UNSIGNED NOT NULL DEFAULT '0',
    `additional`     TEXT                NULL,
    `date_added`     TIMESTAMP           NULL DEFAULT NULL,
    `last_update`    TIMESTAMP           NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `auth_uid` (`auth_uid`),
    CONSTRAINT `mod_auth_user_data_ibfk_1` FOREIGN KEY (`auth_uid`) REFERENCES `mod_auth_user` (`uid`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    COLLATE ='utf8_general_ci'
    ENGINE =InnoDB;