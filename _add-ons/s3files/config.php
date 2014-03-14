<?php

/**
 * Constants
 */
define('S3FILES_NAME', 'S3 Files');
define('S3FILES_VERSION', '1.1.0');
define('S3FILES_AUTHOR', 'Chad Clark, Brandon Haslip, Michael Reiner');
define('S3FILES_AUTHOR_URL', 'http://chadjclark.com/');
define('S3FILES_CONFIG_PATH', BASE_PATH . '/_config/add-ons/s3files');
define('S3FILES_DESTINATION_PATH', S3FILES_CONFIG_PATH . '/destinations/');

/**
 * Autoload
 */
require_once __DIR__.'/vendor/autoload.php';

// END config.php