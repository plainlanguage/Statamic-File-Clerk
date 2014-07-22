<?php 

/**
 * File Clerk tasks file.
 * 
 * @author Chad Clark
 * @author Brandon Haslip
 * @author Michael Reiner
 * 
 * @copyright 2014 Plain Language (http://plainlanguage.co)
 * @link
 * @license
 * 
 */

// use Aws\S3\S3Client;
// use Aws\S3\StreamWrapper;
// use Aws\S3\Enum\CannedAcl;
// use Aws\Common\Enum\Size;
// use Aws\Common\Exception\MultipartUploadException;
// use Aws\S3\Model\MultipartUpload\UploadBuilder;
// use Symfony\Component\Finder\Finder;

class Tasks_fileclerk extends Tasks
{

	// Define method is required
	public function define()
	{
		$this->log->info('Defining our tasks class.');
	}

	public function templates()
	{
		return array();
	}

	/**
	 * Empty array for holding file data
	 * @return (array)
	 */
	public function get_file_data_array()
	{
		return array(
			'extension'      => null,
			'filename'       => null,
			'filetype'       => null,
			'filesize'       => null,
			'fullpath'       => null,
			'is_image'       => null,
			'key'            => null, // S3 object key
			//'mime_type'      => null,
			's3_path'        => null,
			'size'           => null,
			'size_bytes'     => null,
			'size_kilobytes' => null,
			'size_megabytes' => null,
			'size_gigabytes' => null,
			'tmp_name'       => null,
		);
	}

	public function get_mime_type( $file )
	{
		$info = new finfo(FILEINFO_MIME_TYPE);
		return $info->file($file);
	}

	public function get_size_kilobytes( $value )
	{
		return number_format( $value / 1024, 2 );
	}

	public function get_size_megabytes( $value )
	{
		return number_format( $value / 1048576, 2 );
	}

	public function get_size_gigabytes( $value )
	{
		return number_format( $value / 1073741824, 2 );
	}

	/**
	 * Merge all configs
	 * @param string  $destination Paramter for destination YAML file to attempt to load.
	 * @param string  $return_type Set the return type
	 * @return array
	 */
	public function merge_configs( $destination = null, $respons_type = 'json' )
	{
		// Set environment
		$this->env = $env = FILECLERK_ENV;

		// Error(s) holder
		$errors = false;

		// Check for a destination config
		$destination = is_null( $destination ) ? Request::get('destination') : $destination;

		// A complete list of all possible config variables
		$config = array(
			'aws_access_key' => null,
			'aws_secret_key' => null,
			'custom_domain'  => null,
			'bucket'         => null,
			'directory'      => null,
			'permissions'    => 'public-read',
			'content_types'  => false,
		);

		// Requried config values
		$required_config = array(
			'aws_access_key',
			'aws_secret_key',
		);

		// Destination config values that even if null should override master config.
		$allow_override = array(
			'custom_domain',
			'directory',
			'content_types',
		);

		// Destination config array
		$destination_config = array();

		// Check that the destination config file exists
		if( ! is_null($destination) || $destination !== 0 || $destination )
		{
			// Set the full path for the destination file
			$destination_file = FILECLERK_DESTINATION_PATH . ltrim($destination) . '.yaml';

			if ( File::exists($destination_file) ) {
				$destination_config = YAML::parseFile($destination_file);

				foreach( $destination_config as $key => $value )
				{
					if( ! in_array($key, $allow_override) && (empty($value) || is_null($value)) )
					{
						unset( $destination_config[$key]);
					}
				}
			} else {
				$this->log->error("Could not use destination `" . $destination . "`, YAML file does not exist.");
			}
		}

		// load global config
		$addon_config = Helper::pick($this->getConfig(), array());

		// merge config variables in order
		$config = array_merge($config, $addon_config, $destination_config);

		// Handle content types
		// If it's a string, need to cast to an array
		if ( is_string($config['content_types']) ) {
			switch( $config['content_types'] )
			{
				// If empty string, set to false
				case '':
				case null:
					$config['content_types'] = false;
					break;
				// If there is a value, push to an array
				default:
					$config['content_types'] = array($config['content_types']);
					break;
			}
		}

		// Check that required configs are set
		foreach( $required_config as $key )
		{
			if( ! isset($config[$key]) || $config[$key] == '' )
			{
				$errors[] = array( 'error' => "<pre>{$key}</pre> is a required File Clerk config value." );
			}
		}

		// If errors, set in config for checking later
		if( $errors )
		{
			$config['errors'] = $errors;
		}

		// Create our S3 client
		//self::load_s3();

		return $config;
	}

}
// END file tasks.fileclerk.php