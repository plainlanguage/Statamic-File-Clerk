<?php

require_once 'config.php';

// AJAX Response Codes
define('FILECLERK_FILE_UPLOAD_SUCCESS', 100);
define('FILECLERK_FILE_UPLOAD_FAILED', 200);
define('FILECLERK_ERROR_FILE_EXISTS', 300);
define('FILECLERK_ERROR_FILE_EXISTS_MSG', 'File exists.');
define('FILECLERK_LIST_SUCCESS', 400);
define('FILECLERK_LIST_NO_RESULTS', 500);
define('FILECLERK_LIST_ERROR', 600);
define('FILECLERK_DISALLOWED_FILETYPE', 700);
define('FILECLERK_FILE_DOES_NOT_EXIST', 800);
define('FILECLERK_AJAX_WARNING', 'AJAX only, son.');
define('FILECLERK_S3_ERROR', 900);

use Aws\S3\S3Client;
use Aws\S3\StreamWrapper;
use Aws\S3\Enum\CannedAcl;
use Aws\S3\Exception\Parser\S3ExceptionParser;
use Aws\S3\Exception\S3Exception;
use Aws\Common\Enum\Size;
use Aws\Common\Exception\MultipartUploadException;
use Aws\S3\Model\MultipartUpload\UploadBuilder;
use Symfony\Component\Finder\Finder;

class Hooks_fileclerk extends Hooks
{

	private   $client;
	protected $config;
	private   $data;
	private   $error;
	protected $env;

	/**
	 * Add CSS to Header
	 *
	 */
	public function control_panel__add_to_head()
	{
		if (URL::getCurrent(false) == '/publish')
		{
			return $this->css->link('fileclerk.min.css');
		}
	}

	/**
	 * Add JS to footer
	 *
	 */
	public function control_panel__add_to_foot()
	{
		// Get the necessary support .js
		if (URL::getCurrent(false) == '/publish')
		{
			if( FILECLERK_ENV === 'dev' )
			{
				$html = $this->js->link(array(
					'plugins.combined.js',
					'fileclerk.js',
				));
			}
			else
			{
				$html = $this->js->link(array(
					'build/fileclerk.plugins.min.js',
					'build/fileclerk.min.js',
				));
			}
			return $html;
		}
	}

	/**
	 * Multi-part upload
	 * @return (json)
	 */
	public function upload_file()
	{
		// Initialize variables
		$this->error  = false;
		$this->data   = $this->tasks->get_file_data_array();
		$this->config = self::merge_configs(Request::get('destination'));

		foreach ( $_FILES as $file )
		{
			// Set all file data here
			$this->data               = $this->tasks->get_file_data_array();
			$this->data['filename']   = File::cleanFilename( $file['name'] );
			$this->data['filetype']   = $file['type'];
			$this->data['mime_type']  = $file['type'];
			$this->data['size_bytes'] = $file['size'];
			$this->data['extension']  = File::getExtension($this->data['filename']);
			$this->data['is_image']   = self::is_image($this->data['extension']);

			$tmp_name  = $file['tmp_name'];

			// Check if file is an image and set as bool flag.
			// $mime_type_parts = explode('/', $this->data['mime_type']);
			// $this->data['is_image']  = strtolower(reset($mime_type_parts)) === 'image' ? true : false;

			// Check if the filetype is allowed in config
			$allowed_content_types = array_get($this->config, 'allowed_content_types');

			// Check the that file mime type is allowed
			// Need an array of content types to proceed
			if( is_array($allowed_content_types) )
			{
				// Only return JSON if the mime type is not allowed for upload
				if( ! in_array($this->data['extension'], $allowed_content_types) )
				{
					// Get the html template
					$file_not_allowed_template = File::get( __DIR__ . '/views/error-not-allowed.html');

					//echo self::build_response_json(false, true, FILECLERK_DISALLOWED_FILETYPE, 'Files of type ' . $mime_type . ' not allowed.');
					echo json_encode( array(
						'error'	=> TRUE,
						'type'	=> 'dialog',
						'code'	=> FILECLERK_DISALLOWED_FILETYPE,
						'html'	=> Parse::template( $file_not_allowed_template, array(
							'mime_type' => $this->data['mime_type'],
						)),
					));
					exit;
				}
			}

			// Not sure why we're doing this here?
			//$handle   = $tmp_name; // Set the full path of the uploaded file to use in setSource
			//$this->data['filename'] = File::cleanFilename($this->data['filename']); // Clean Filename

			// Add-on settings
			// Do we need this?
			//$bucket        = $this->config['bucket'];
			//$directory     = $this->config['directory'];
			$key           = Url::tidy( '/' . $this->config['directory'] . '/' . $this->data['filename'] );
			//$custom_domain = $this->config['custom_domain'];
			//$set_acl       = $this->config['permissions'];

			// Set the full S3 path to the bucket/key
			$s3_path = Url::tidy( 's3://' . join('/', array($this->config['bucket'], $this->config['directory'])) );

			// Check if the file already exists
			if( self::file_exists( $s3_path, $this->data['filename'] ) )
			{
				$overwrite = Request::get('overwrite');
				$file_exists_template = File::get( __DIR__ . '/views/file-exists.html');

				if( is_null($overwrite) )
				{
					echo json_encode( array(
						'error'		=> TRUE,
						'type'		=> 'dialog',
						'code'		=> FILECLERK_ERROR_FILE_EXISTS,
						'message'	=> FILECLERK_ERROR_FILE_EXISTS_MSG,
						'html'		=> Parse::template( $file_exists_template, array(
							'filename' => $this->data['filename'],
						)),
					));
					exit;
				}
				elseif( $overwrite === 'false' || ! $overwrite || $overwrite === 0 )
				{
					$this->data['filename'] = self::increment_filename_unix($this->data['filename']);
				}
			}

			// Set the full path for the file.
			//$fullPath = Url::tidy( self::get_url_prefix() . '/' . $this->data['filename'] );
			$this->data['fullpath'] = Url::tidy( self::get_url_prefix() . '/' . $this->data['filename'] );

			// Build up the upload object
			$uploader = UploadBuilder::newInstance()
				->setClient($this->client)
				->setSource($tmp_name)
				->setBucket($this->config['bucket'])
				->setKey($key)
				->setOption('CacheControl', 'max-age=3600')
				->setOption('ACL', $this->config['permissions'] ? $this->config['permissions'] : CannedAcl::PUBLIC_READ)
				->setOption('ContentType', $this->data['filetype'])
				->setConcurrency(3)
				->build();

			// Do it.
			try
			{
				// Try the upload
				$uploader->upload();
			}
			catch (MultipartUploadException $e)
			{
				$uploader->abort();
				$this->error = true;
				$error_message = $e->getMessage();

				$errors = array(
					'error' => $e->getMessage(),
				);

				// Set the template here
				// $template = File::get( __DIR__ . '/views/list.html');
				// $html = Parse::template($template, $errors);

				echo self::build_response_json(false, true, FILECLERK_S3_ERROR, $e->getMessage(), 'error', $errors, null, null);
				exit;

			}
		}

		// Setup the return
		if( $this->error )
		{
			header('Content-Type: application/json');
			echo self::build_response_json(false, true, FILECLERK_FILE_UPLOAD_FAILED, $error_message);
			exit;
		}
		else
		{
			// Set data needed for view and field data
			$this->data['size']           = File::getHumanSize($this->data['size_bytes']);
			$this->data['size_kilobytes'] = number_format($this->data['size_bytes'] / 1024, 2);
			$this->data['size_megabytes'] = number_format($this->data['size_bytes'] / 1048576, 2);
			$this->data['size_gigabytes'] = number_format($this->data['size_bytes'] / 1073741824, 2);

			// Response
			header('Content-Type: application/json');
			echo self::build_response_json(true, false, FILECLERK_FILE_UPLOAD_SUCCESS, 'File ' . $this->data['filename'] . 'uploaded successfully!', null, $this->data, null, null);
			exit;
		}
	}


	public function ajax_preview()
	{
		$externalUrl = urldecode( Request::get('url') );
		echo json_encode( array(
			'error'	=> TRUE,
			'type'	=> 'file',
			'code'	=> 200,
			'url'	=> $externalUrl,
		));
		header('Content-Type: application/json');
		exit;
	}

	/*
	|--------------------------------------------------------------------------
	| TRIGGER AJAX methods here.
	|--------------------------------------------------------------------------
	| These are accessed by the `/TRIGGER/fileclerk/{method}` convention.
	| Return from these methods will be JSON.
	|
	*/

	public function fileclerk__filecheck()
	{
		$destination = Request::get('destination');
		$filename    = Request::get('filename');
		$filename    = File::cleanFilename($filename);

		//self::merge_configs( $destination );
		$this->config = self::merge_configs( $destination );

		$s3_path = self::build_s3_path();

		if( self::file_exists( $s3_path, $filename ) )
		{
			$overwrite            = Request::get('overwrite');
			$file_exists_template = File::get( __DIR__ . '/views/file-exists.html');

			if( is_null($overwrite) )
			{
				echo self::build_response_json(false, true, FILECLERK_ERROR_FILE_EXISTS, FILECLERK_ERROR_FILE_EXISTS_MSG, 'dialog', null, null, Parse::template($file_exists_template, array('filename' => $filename)));
				exit;
			}
			elseif( $overwrite === 'false' || ! $overwrite || $overwrite === 0 )
			{
				$filename = self::increment_filename_unix($filename);
			}
		}
		else
		{
			echo self::build_response_json(true, false, FILECLERK_FILE_DOES_NOT_EXIST, 'File is clean!', null, null, null, null);
			exit;
		}
	}

	/**
	 * AJAX - Run upload_file
	 *
	 */
	public function fileclerk__ajaxupload() //This can be accessed as a URL via /TRIGGER/fileclerk/ajaxupload
	{
		if( Request::isAjax() ) // Make sure request is AJAX
		{
			ob_start();
				$object = new Hooks_fileclerk();
				$object->upload_file();
				Log::info('File uploaded.');
				header('Content-Type: application/json');
				return true;
			ob_flush();
		}
		else
		{
			echo FILECLERK_AJAX_WARNING;
			exit;
		}
	}

	/**
	 * AJAX - Image Preview
	 *
	 */
	public function fileclerk__ajaxpreview()
	{
		if( Request::isAjax() ) // Make sure request is AJAX
		{
			ob_start();
				$object = new Hooks_fileclerk();
				$object->ajax_preview();
				return true;
			ob_flush();
		}
		else
		{
			echo FILECLERK_AJAX_WARNING;
			exit;
		}
	}

	/**
	 * Get list of files from a bucket / directory.
	 * @return (array)
	 * @todo Pass in destination as querystring parameter
	 * @todo Figure out sorting, alpha natural sort
	 * @todo Breadcrumbs
	 */
	public function fileclerk__list()
	{
		// @todo Ensure AJAX requests only!
		if( ! Request::isAjax() && FILECLERK_ENV != 'dev' )
		{
			echo FILECLERK_AJAX_WARNING;
			exit;
		}

		// Destination config parameter
		$destination = Request::get('destination');
		$destination = is_null($destination) ? 0 : $destination;

		// Merge configs before we proceed
		$this->config = self::merge_configs( $destination );

		// Set default error to false
		$error = false;

		// Do some werk to setup paths
		$bucket    = $this->config['bucket'];
		$directory = $this->config['directory'];
		$uri       = Request::get('uri');
		$uri       = explode('?', $uri);
		$uri       = reset($uri);
		$s3_url    = Url::tidy( 's3://' . join('/', array($bucket, $directory, $uri)) );

		// Let's make sure we  have a valid URL before movin' on
		if( Url::isValid( $s3_url ) )
		{
			$finder = new Finder();

			try
			{
				$finder
					->ignoreUnreadableDirs()
					->ignoreDotFiles(true)
					->in($s3_url)
					->depth('== 0') // Do not allow access above the starting directory
				;

				$results = iterator_to_array($finder);
			}
			catch( Exception $e )
			{
				$error = $e->getMessage();

				header('Content-Type: application/json');
				echo self::build_response_json(false, true, FILECLERK_S3_ERROR, $error, 'error', null, null, null);
				exit;
			}

			// Data array for building out view
			$data = array(
				'crumbs' => explode('/', $uri), // Array of the currently request URI.
				'destination' => $destination, // Array of the currently request URI.
				'list'   => array(), // Files and dirs mixed
			);

			// Prepare breadcrumbs
			foreach ($data['crumbs'] as $key => $value) {
				$path = explode('/', $uri, ($key + 1) - (count($data['crumbs'])));
				$path = implode('/', $path);
				//$path = Url::tidy( $path . '/?' . $querystring );
				$path = Url::tidy( $path );
				$data['crumbs'][$key] = array(
					'name' => $value,
					'path' => $path
				);
			}

			// Build breadcrumb
			$breadcrumb = Parse::template( self::get_view('_list-breadcrumb'), $data );

			/**
			 * Let's make sure we've got somethin' up in this mutha.
			 */
			if( $finder->count() > 0 )
			{
				foreach ($finder as $file)
				{
					// Get the filename
					$filename = $file->getFilename();

					// Set the S3 key string for the objet
					$key = Url::tidy( join('/', array($directory, $uri, $filename)) );

					// File / directory attributes
					$this->data = $this->tasks->get_file_data_array();

					// Set some file data
					$file_data = array(
						'basename'       => $file->getBasename( '.' . $file->getExtension() ),
						'destination'    => $destination,
						'extension'      => $file->getExtension(),
						'file'           => $file->getPathname(),
						'filename'       => $file->getFilename(),
						'last_modified'  => $file->isDir() ? '--' :$file->getMTime(),
						'is_file'        => $file->isFile(),
						'is_directory'   => $file->isDir(),
						'size'           => $file->isDir() ? '--' : File::getHumanSize($file->getSize()),
						'size_bytes'     => $file->getSize(),
						'uri'            => $uri,
					);

					/**
					 * Need to set the uri value
					 */
					if( $file->isFile() ) // Push to files array
					{
						// Check if file is an iamge
						$this->data['is_image'] = self::is_image($file_data['extension']);

						// Set filesize data
						$file_data['size_kilobytes'] = $this->tasks->get_size_kilobytes($file_data['size_bytes']);
						$file_data['size_megabytes'] = $this->tasks->get_size_megabytes($file_data['size_bytes']);
						$file_data['size_gigabytes'] = $this->tasks->get_size_gigabytes($file_data['size_bytes']);
					}
					elseif( $file->isDir() ) // Push to directories array
					{
						if( is_null($uri) )
						{
							$file_data['uri'] = Url::tidy( '/' . join('/', array($file_data['filename'])) );
						}
						else
						{
							$file_data['uri'] = Url::tidy( '/' . join('/', array($uri,$file_data['filename'])) );
						}
					}
					else // Keep on movin' on.
					{
						continue;
					}

					// Set the URL
					$file_data['url'] = Url::tidy( self::get_url_prefix($uri) . '/' . $filename );

					// Push file data to a new array with the filename as the key for sorting.
					$data['list'][$filename] = $file_data;
					unset( $file_data );
				}
			}
			else // Nothing returned from Finder
			{
				/**
				 * Return an error of type dialog that should show a message to the user
				 * that there are is nothing to see her. Doh!
				 * @return [array] JSON
				 * @todo See `self::set_json_return`.
				 */
				// echo self::build_response_json(false, true, FILECLERK_LIST_NO_RESULTS, 'No results returned.');
				// exit;

				$no_results_template = File::get( __DIR__ . '/views/error-no-results.html');

				end($data['crumbs']);
				$previous_directory = prev($data['crumbs']);

				echo json_encode( array(
					'error'			=> TRUE,
					'type'			=> 'dialog',
					'code'			=> FILECLERK_LIST_NO_RESULTS,
					'breadcrumb'	=> $breadcrumb,
					'html'			=> Parse::template( $no_results_template, array('previous_directory' => $previous_directory['path']) ),
				));

				exit;

			}
		}

		// Need to pass in the destination for root requests.
		$data['destination'] = $destination;

		// Sort this fucking multi-dimensional array already.
		uksort( $data['list'], 'strcasecmp');
		//array_multisort( array_keys($data['list']), SORT_FLAG_CASE, $data['list'] );

		/**
		 * THIS ONLY WORKS IN PHP 5.4+. FUCK!
		 */
		// array_multisort( array_keys($data['list']), SORT_NATURAL | SORT_FLAG_CASE, $data['list'] );

		// Now we need to tweak the array for parsing.
		foreach( $data['list'] as $filename => $filedata )
		{
			$data['list'][] = $filedata;
			unset($data['list'][$filename]);
		}

		// We're basically parsing template partials here to build out the larger view.
		$parsed_data = array(
			'list' => Parse::template( self::get_view('_list'), $data ),
		);

		// Put it all together
		$ft_template = File::get( __DIR__ . '/views/list.html');

		// Return JASON
		header('Content-Type: application/json');
		echo self::build_response_json(true, false, FILECLERK_LIST_SUCCESS, null, null, $data, $breadcrumb, Parse::template($ft_template, $parsed_data));
		exit;
	}

	/*
	|--------------------------------------------------------------------------
	| Private methods down here.
	|--------------------------------------------------------------------------
	*/

	// Initialize S3 client.
	private function load_s3()
	{
		// S3 credentials
		$this->client = S3Client::factory(array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key'],
		));

		// Register Stream Wrapper
		try
		{
			$this->client->registerStreamWrapper();
		}
		catch( Exception $e )
		{
			$errors = array(
				'error' => $e->getMessage(),
			);

			// Set the template here
			$template = File::get( __DIR__ . '/views/error-no-render.html');

			// Parse the template
			$html = Parse::template($template, $errors);

			header('Content-Type: application/json');
			echo self::build_response_json(false, true, FILECLERK_S3_ERROR, $e->getMessage(), 'error', $errors, null, $html);
			exit;
		}
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
		$this->env = $env = Environment::detect( Config::getAll() );

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
			// @todo Should be removed. Possibly move to the main config as a default?
			'content_types'  => array('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc'),
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

			if( File::exists($destination_file) )
			{
				$destination_config = YAML::parseFile($destination_file);

				foreach( $destination_config as $key => $value )
				{
					if( ! in_array($key, $allow_override) && (empty($value) || is_null($value)) )
					{
						unset( $destination_config[$key]);
					}
				}
			}
			else
			{
				$this->log->error("Could not use destination `" . $destination . "`, YAML file does not exist.");
			}
		}

		// load global config
		$addon_config = Helper::pick($this->getConfig(), array());

		// merge config variables in order
		$config = array_merge($config, $addon_config, $destination_config);

		foreach( $required_config as $key )
		{
			if( ! isset($config[$key]) || $config[$key] == '' )
			{
				$errors[] = array( 'error' => "<pre>{$key}</pre> is a required File Clerk config value." );
			}
		}

		if( $errors )
		{
			$config['errors'] = $errors;
		}

		// Create our S3 client
		self::load_s3();

		return $config;
	}

	/**
	 * Check to see if file exits
	 * @param
	 * @return boolean
	 */
	private function file_exists( $path, $filename )
	{
		$finder = new Finder();

		try
		{
			$count = $finder
						->files()
						->in($path)
						->name($filename)
						->depth('== 0')
						->count()
			;
		}
		catch ( Exception $e )
		{
			$errors = array(
				'error' => $e->getMessage(),
			);

			// Set the template here
			$template = File::get( __DIR__ . '/views/error-no-render.html');

			$html = Parse::template($template, $errors);

			header('Content-Type: application/json');
			echo self::build_response_json(false, true, FILECLERK_S3_ERROR, $e->getMessage(), 'error', $errors, null, null);
			exit;
		}

		return $count === 1 ? TRUE : FALSE;
	}

	/**
	 * Increment a filename with unix timestamp
	 * @param (string) Filename.
	 * @return (mixed)
	 */
	private function increment_filename_unix( $filename = null )
	{
		if( is_null($filename) )
		{
			return false;
		}

		$extension = File::getExtension($filename);
		$file      = str_replace('.' . $extension, '', $filename);
		$now       = time();

		$fileparts = array( $file, '-', $now, '.', $extension, );

		return implode('', $fileparts);
	}

	/**
	 * Build out the proper URL prefix based on configs
	 * @param (string) $uri This is the URI passed in on AJAX calls.
	 * @return (string)
	 */
	private function get_url_prefix( $uri = null )
	{
		/**
		 * Get values from the config to build out the proper prefix.
		 */
		$custom_domain = array_get($this->config, 'custom_domain');
		$bucket        = array_get($this->config, 'bucket');
		$directory     = array_get($this->config, 'directory');

		if( $custom_domain != '' )
		{
			return URL::tidy( 'http://'. $custom_domain .'/' . $uri . '/' . $directory . '/' );
		}
		else
		{
			return URL::tidy( 'http://'. $bucket . '.s3.amazonaws.com' . '/' . $uri . '/' . $directory );
		}
	}

	/**
	 * Get a view file.
	 * @param  string $viewname
	 * @return string           File data.
	 */
	private function get_view( $viewname = null )
	{
		if( is_null($viewname) ) return false;

		$filepath = __DIR__ . '/views/' . $viewname . '.html';

		return File::get( $filepath );
	}

	/**
	 * Build out the AJAX JASON response.
	 * @param  boolean $success
	 * @param  boolean $error
	 * @param  int  $code       See constants for values.
	 * @param  string  $message
	 * @param  string  $type
	 * @param  array  $data
	 * @param  array  $breadcrumb
	 * @param  string  $html
	 * @return string              JASON data for AJAX response.
	 */
	private function build_response_json( $success = false, $error = true, $code =null, $message = null, $type = null, $data = null, $breadcrumb = null, $html = null )
	{
		return json_encode( array(
			'success'    => $success,
			'error'      => $error,
			'code'       => (int) $code,
			'message'    => $message,
			'type'       => $type,
			'data'       => $data,
			'breadcrumb' => $breadcrumb,
			'html'       => $html,
		) );
	}

	private function build_s3_path()
	{
		// Add-on settings
		$bucket			= $this->config['bucket'];
		$directory		= $this->config['directory'];
		$custom_domain	= $this->config['custom_domain'];
		$set_acl		= $this->config['permissions'];

		return Url::tidy( 's3://' . join('/', array($bucket, $directory)) );
	}

	/**
	 * Get the mime type
	 * @param  (string) $object_key The S3 objec key (Note: does not include bucket.)
	 * @return (string) mime type of S3 object.
	 * @todo Also use this method to see if $file['type'] is set, fallback to headObject request.
	 */
	private function get_mime_type( $object_key = null )
	{
		if ( is_null($object_key) ) return false;

		// Need to make a head request to get the object metadata.
		// Mime type not returned by Finder.
		$head = $this->client->headObject( array(
			'Bucket' => $this->data['bucket'],
			'Key'    => $object_key,
		));

		// Check for a valid response from the headObject request.
		if( $body = $head->toArray() )
		{
			return $body['ContentType'];
			// $file_data['mime_type'] = $body['ContentType'];
			// $mime_type_parts        = explode('/', $body['ContentType']);
			// $file_data['is_image']  = strtolower(reset($mime_type_parts)) === 'image' ? 'true' : 'false';
		}
		else
		{
			return null;
			// $mime_type             = null;
			// $file_data['is_image'] = false;
		}
	}

	/**
	 * Check whether file is an image or not based on mime type.
	 * @param  (string)  $mime_type
	 * @return boolean
	 */
	private function is_image( $extension = null, $mime_type = null )
	{
		if ( ! is_null($extension) )
		{
			$image_extensions = array(
				'jpg',
				'jpeg',
				'gif',
				'png',
				'bmp',
			);

			return in_array(strtolower($extension), $image_extensions) ? true : false;
		}
		else if ( ! is_null($mime_type) )
		{
			$mime_type_parts = explode('/', $body['ContentType']);
			return ( strtolower(reset($mime_type_parts)) === 'image' ) ? true : false;
		}

		return false;
	}

	/**
	 * Test method for testing merge_configs()
	 * @return (array)
	 */
	public function fileclerk__config_dump()
	{
		$destination = Request::get('destination');
		dd(self::merge_configs($destination));
	}

	/**
	 * Initialize
	 * @return none
	 */
	private function init()
	{
		self::load_s3();
		self::merge_configs( Request::get('destination') );
	}

}
// END hooks.fileclerk.php