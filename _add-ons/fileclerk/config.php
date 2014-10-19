<?php

/**
 * Constants
 */
define('FILECLERK_NAME', 'File Clerk');
define('FILECLERK_VERSION', '0.0.1');
define('FILECLERK_AUTHOR', 'Chad Clark, Brandon Haslip, Michael Reiner');
define('FILECLERK_AUTHOR_URL', 'http://plainlanguage.co/');
define('FILECLERK_CONFIG_PATH', BASE_PATH . '/_config/add-ons/fileclerk');
define('FILECLERK_DESTINATION_PATH', FILECLERK_CONFIG_PATH . '/destinations/');
define('FILECLERK_DEV_DEBUG', FALSE);

// Set a constant for current environment
// get is new 1.8, backward compatability
if( method_exists('Environment', 'get') ) {
	define('FILECLERK_ENV', Environment::get());
} else {
	define('FILECLERK_ENV', (string) Environment::detect( Config::getAll() ));
}


/**
 * Autoload
 */
require_once __DIR__.'/vendor/autoload.php';

// END config.php