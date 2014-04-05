<?php

require_once 'config.php';

// AJAX Response Codes
define('S3FILES_FILE_UPLOAD_SUCCESS', 100);
define('S3FILES_FILE_UPLOAD_FAILED', 200);
define('S3FILES_ERROR_FILE_EXISTS', 300);
define('S3FILES_ERROR_FILE_EXISTS_MSG', 'File exists.');


use Aws\S3\S3Client;
use Aws\S3\StreamWrapper;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Size;
use Aws\Common\Exception\MultipartUploadException;
use Aws\S3\Model\MultipartUpload\UploadBuilder;
use Symfony\Component\Finder\Finder;

class Hooks_s3files extends Hooks
{

	protected $client;

	/**
	 * Add CSS to Header
	 *
	 */
	public function control_panel__add_to_head()
	{
		if (URL::getCurrent(false) == '/publish') {
			return $this->css->link('s3files.min.css');
		}
	}

	/**
	 * Add JS to footer
	 *
	 */
	public function control_panel__add_to_foot()
	{
		// Get the necessary support .js
		if (URL::getCurrent(false) == '/publish') {
			$html = $this->js->link(array(
				's3files.min.js'
			));
			return $html;
		}
	}

	private function load_s3()
	{

		// S3 credentials
		$this->client = S3Client::factory(array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key']
		));

		// Register Stream Wrapper
		$this->client->registerStreamWrapper();
	}

	/**
	 * Upload File
	 *
	 */
	public function upload_file()
	{

		//$this->load_s3(); // Load S3

		$error = false;
		$data  = array();

		// Merge configs before we proceed
		$this->config = self::merge_configs(Request::get('destination'));

		foreach($_FILES as $file)
		{
			$filename	= $file['name'];
			$filetype	= $file['type'];
			$tmp_name	= $file['tmp_name'];
			$filesize	= $file['size'];

			// Check if the filetype is allowed in config
			if( ! in_array($filetype, array_get($this->config, 'content_types')) )
			{
				// @todo Return proper JSON.
				// return false;
			}

			$handle   = $tmp_name; // Set the full path of the uploaded file to use in setSource
			$filename = File::cleanFilename($filename); // Clean Filename

			// Add-on settings
			$bucket			= $this->config['bucket'];
			$directory		= $this->config['directory'];
			$custom_domain	= $this->config['custom_domain'];
			$set_acl		= $this->config['permissions'];

			// Is a custom domain set in the config?
			if ($custom_domain)
			{
				$fullPath = URL::tidy('http://'.$custom_domain.'/'.$directory.'/'.$filename);
			}
			else
			{
				$fullPath = URL::tidy('http://'.$bucket.'.s3.amazonaws.com'.'/'.$directory.'/'.$filename);
			}

			$s3_path = Url::tidy( 's3://' . join('/', array($bucket, $directory)) );

			// Check for file existence
			if( self::file_exists( $s3_path, $filename ) )
			{
				$overwrite = Request::get('overwrite');

				if( is_null($overwrite) )
				{
					echo json_encode( array(
						'error'   => TRUE,
						'type'    => 'dialog',
						'code'    => S3FILES_ERROR_FILE_EXISTS,
						'message' => S3FILES_ERROR_FILE_EXISTS_MSG,
					));
					exit;
				}
				elseif( $overwrite == 'false' || ! $overwrite || $overwrite == 0 )
				{
					$filename = self::increment_filename_unix($filename);
				}
			}

			$uploader = UploadBuilder::newInstance()
				->setClient($this->client)
				->setSource($handle)
				->setBucket($bucket)
				->setKey(URL::tidy('/'.$directory.'/'.$filename))
				->setOption('CacheControl', 'max-age=3600')
				->setOption('ACL', $set_acl ? $set_acl : CannedAcl::PUBLIC_READ)
				->setOption('ContentType', $filetype)
				->setConcurrency(3)
				->build();

			// Do it.
			try
			{
				$uploader->upload();
			}
			catch (MultipartUploadException $e)
			{
				$uploader->abort();
				$error = true;
			}
		}

		// Return Results
		$data = ($error) ?
		array(
			'error' 	=> 'Nope',
		) :
		array(
			'success'	=> 'Aww yeah! '.$filename.' was uploaded successfully.',
			'filename'	=> $filename,
			'filetype'	=> $filetype,
			'filesize'	=> $filesize,
			'fullpath'	=> $fullPath,
		);

		// JSONify it
		echo json_encode($data);

	}


	/*
	|--------------------------------------------------------------------------
	| TRIGGER AJAX methods here.
	|--------------------------------------------------------------------------
	| These are accessed by the `/TRIGGER/s3files/{method}` convention.
	| Return from these methods will be JSON.
	|
	*/

	/**
	 * AJAX - Run upload_file
	 *
	 */
	public function s3files__ajaxupload() //This can be accessed as a URL via /TRIGGER/s3files/ajaxupload
	{

		if(Request::isAjax()) // Make sure request is AJAX
		{
			ob_start();
			$object = new Hooks_s3files();
			$object->upload_file();
			header('Content-Type: application/json');
			ob_flush();
			return true;
			Log::info('Boom');
		}
		else
		{
			echo 'AJAX only, son.';
		}
	}

	/**
	 * `TRIGGER: Choose files
	 * @uri /TRIGGER/s3files/choosefile?uri=/path/to/dir/to/get
	 * @return none
	 */
	public function s3files__choosefile()
	{
		self::s3files__list( Request::get('uri') );
	}

	/**
	 * Select S3 File
	 * @return [array]
	 * @todo Need to make sure that when we get a file or dir, we return a fully-qualified URL to save in the field.
	 */
	public function s3files__list()
	{
		// @todo Ensure AJAX requests only!
		// if( Request::isAjax() );

		// Merge configs before we proceed
		$this->config = self::merge_configs(Request::get('destination'));

		// Set default error to false
		$error = false;

		// Do some werk to setup paths
		$bucket    = $this->config['bucket'];
		$directory = $this->config['directory'];
		$uri       = Request::get('uri');
		$url       = Url::tidy( 's3://' . join('/', array($bucket, $directory,$uri)) );

		/*
		|--------------------------------------------------------------------------
		| Finder
		|--------------------------------------------------------------------------
		|
		| Get_Files implements most of the Symfony Finder component
		|
		*/

		// Let's make sure we  have a valid URL before movin' on
		if( Url::isValid( $url ) )
		{
			$finder = new Finder();

			try
			{
				$finder
					->ignoreUnreadableDirs()
					->ignoreDotFiles(true)
					->in($url)
					->depth('== 0') // Do not allow access above the starting directory
					->sortByName()
				;
			}
			catch(Exception $e)
			{
				$error = $e->getMessage();
			}

			/*
			|--------------------------------------------------------------------------
			| Assemble File Array
			|--------------------------------------------------------------------------
			|
			| Select the important bits of data on the list of files.
			|
			*/

			$data = array(
				'crumbs'      => explode('/', $uri), // Array of the currently requested URI.
				'files'       => array(), // Files array
				'directories' => array(), // Directories array
				'list'        => array(), // Files and dirs mixed
			);

			/**
			 * Let's make sure we've got somethin' up in this mutha.
			 */
			if( ! $error && $finder->count() > 0 )
			{
				foreach ($finder as $file)
				{
					// File / directory attributes
					$file_data = array(
						'filename'      => $file->getFilename(),
						'file'          => $file->getPathname(),
						'extension'     => $file->getExtension(),
						'url'           => Url::tidy( self::get_url_prefix($uri) . '/' . $file->getFilename() ),
						'size'          => $file->isDir() ? '--' : File::getHumanSize($file->getSize()),
						'last_modified' => $file->isDir() ? '--' :$file->getMTime(),
						'is_file'       => $file->isFile(),
						'is_directory'  => $file->isDir(),
					);

					/**
					 * Decide where to shove $file_data
					 */
					if( $file->isFile() ) // Push to files array
					{
						$file_data['uri'] = null;
						array_push( $data['files'], $file_data );
					}
					elseif( $file->isDir() ) // Push to directories array
					{
						if( is_null($uri) )
						{
							$newuri = Url::tidy( '/' . join('/', array($file_data['filename'])) );
						}
						else
						{
							$newuri = Url::tidy( '/' . join('/', array($uri,$file_data['filename'])) );
						}

						$file_data['uri'] = $newuri;

						array_push( $data['directories'], $file_data );
					}
					else // Keep on movin' on.
					{
						continue;
					}
					array_push($data['list'], $file_data);
					unset( $file_data );
				}
			}
			else
			{
				/**
				 * Return an error of type dialog that should show a message to the user
				 * that there are is nothing to see her. Doh!
				 * @return [array] JSON
				 * @todo See `self::set_json_return`.
				 */
				echo json_encode( array(
					'error'   => true,
					'message' => $error,
					'code'    => 100,
					'type'    => 'message',
					'data'    => array(
						'text' => 'There are no files nor directories here.',
						'html' => '',
					),
				));
			}
		}

		// Prepare breadcrumbs
		foreach ($data['crumbs'] as $key => $value) {
			$path = explode('/', $uri, ($key + 1) - (count($data['crumbs'])));
			$path = implode('/', $path);
			$data['crumbs'][$key] = array(
				'name' => $value,
				'path' => $path
			);
		}

		// Build breadcrumb
		$breadcrumb = Parse::template( self::get_view('_list-breadcrumb'), $data );

		// We're basically parsing template partials here to build out the larger view.
		$parsed_data = array(
			'list'        => Parse::template( self::get_view('_list'), $data ),
			'files'       => Parse::template( self::get_view('_list-file'), $data ),
			'directories' => Parse::template( self::get_view('_list-directories'), $data ),
		);

		// Put it all together
		$ft_template = File::get( __DIR__ . '/views/list.html');

		// Output the final parsed HTML
		//echo Parse::template($ft_template, $parsed_data);
		header('Content-Type: application/json');
		echo self::build_response_json(true, false, 200, '', '', $data, $breadcrumb, Parse::template($ft_template, $parsed_data));
		exit;
	}


	/**
	 * AJAX - run select_s3_file
	 *
	 */
	public function s3files__view() //This can be accessed as a URL via /TRIGGER/s3files/view
	{

		ob_start();
		$object = new Hooks_s3files();
		$object->select_s3_file();
		ob_flush();
		return true;
	}


	/*
	|--------------------------------------------------------------------------
	| Private methods down here.
	|--------------------------------------------------------------------------
	*/

	/**
	 * Listing of files and directories for a given path.
	 */
	public function get_list()
	{
		// Merge configs before we proceed
		$this->config = self::merge_configs(Request::get('destination'));

		// Set default error to false
		$error = false;

		// Do some werk to setup paths
		$bucket    = $this->config['bucket'];
		$directory = $this->config['directory'];
		$uri       = Request::get('uri');
		$url       = Url::tidy( 's3://' . join('/', array($bucket, $directory,$uri)) );

		/*
		|--------------------------------------------------------------------------
		| Finder
		|--------------------------------------------------------------------------
		|
		| Get_Files implements most of the Symfony Finder component
		|
		*/

		// Let's make sure we  have a valid URL before movin' on
		if( Url::isValid( $url ) )
		{
			$finder = new Finder();

			try
			{
				$finder
					->ignoreUnreadableDirs()
					->ignoreDotFiles(true)
					->sortByName()
					->in($url)
					->depth('< 0') // Do not allow access above the starting directory
				;
			}
			catch(Exception $e)
			{
				$error = $e->getMessage();
			}

			/*
			|--------------------------------------------------------------------------
			| Assemble File Array
			|--------------------------------------------------------------------------
			|
			| Select the important bits of data on the list of files.
			|
			*/

			$data = array(
				//'crumbs'      => explode('/', $uri), // Array of the currently request URI.
				'files'       => array(), // Files array
				'directories' => array(), // Directories array
			);

			/**
			 * Let's make sure we've got somethin' up in this mutha.
			 */
			if( ! $error && $finder->count() > 0 )
			{
				foreach ($finder as $file)
				{
					// File / directory attributes
					$file_data = array(
						'filename'      => $file->getFilename(),
						'file'          => $file->getPathname(),
						'extension'     => $file->getExtension(),
						'url'           => Url::tidy( self::get_url_prefix($uri) . '/' . $file->getFilename() ),
						'size'          => File::getHumanSize($file->getSize()),
						'last_modified' => $file->getMTime(),
						'is_file'       => $file->isFile(),
						'is_directory'  => $file->isDir(),
					);

					/**
					 * Decide where to shove $file_data
					 */
					if( $file->isFile() ) // Push to files array
					{
						$file_data['uri'] = null;
						array_push( $data['files'], $file_data );
					}
					elseif( $file->isDir() ) // Push to directories array
					{
						if( is_null($uri) )
						{
							$newuri = Url::tidy( '/' . join('/', array($bucket,$directory,$file_data['filename'])) );
						}
						else
						{
							$newuri = Url::tidy( '/' . join('/', array($bucket,$directory,$uri,$file_data['filename'])) );
						}
						$file_data['uri'] = $newuri;
						array_push( $data['directories'], $file_data );
					}
					else // Keep on movin' on.
					{
						continue;
					}
					unset( $file_data );
				}
			}
			else
			{
				// Error
			}
		}

		asort($data['files']);
		asort($data['directories']);

		return $data;

		// We're basically parsing template partials here to build out the larger view.
		$parsed_data = array(
			'files'       => Parse::template( self::get_view('_list-file'), $data ),
			'directories' => Parse::template( self::get_view('_list-directories'), $data ),
		);

		// PUt it all together
		$ft_template = File::get( __DIR__ . '/views/list.html');

		// Output the final parsed HTML
		header('Content-type: application/json');
		echo self::build_response_json(true, false, 200, '', '', $data, Parse::template($ft_template, $parsed_data));
		//echo Parse::template($ft_template, $parsed_data);

	}

	/**
	 * Merge all configs
	 *
	 * @param string  $destination Paramter for destination YAML file to attempt to load.
	 * @return array
	 */
	private function merge_configs( $destination = null )
	{
		// Create our S3 client
		self::load_s3();

		// A complete list of all possible config variables
		$config = array(
			'aws_access_key' => null,
			'aws_secret_key' => null,
			'custom_domain'  => null,
			'bucket'         => null,
			'directory'      => null,
			'permissions'    => 'public-read',
			'content_types'  => array('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc'),
		);

		// Destination config array
		$destination_config = array();

		// Destination config values that even if null should override master config.
		$allow_override = array(
			'custom_domain',
			'directory',
			'content_types',
		);

		// Check that the destination config file exists
		if( ! is_null($destination) )
		{
			// Set the full path for the destination file
			$destination_file = S3FILES_DESTINATION_PATH . ltrim($destination) . '.yaml';

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

		return $config;
	}

	/**
	 * Check to see if file exits
	 *
	 * @param
	 * @return boolean
	 */
	private function file_exists( $path, $filename )
	{
		$finder = new Finder();

		$count = $finder
					->files()
					->in($path)
					->name($filename)
					->count()
		;

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
	 * Private function to build appropriate JSON messages for AJAX.
	 * @return [array] JSON.
	 * @todo Establish set error codes.
	 * @todo Establish parameters for function.
	 */
	private function return_json()
	{
		$data = array();

		return $data;
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

		if( $custom_domain )
		{
			return URL::tidy( 'http://'. $custom_domain .'/' . $uri . '/' . $directory . '/' );
		}
		else
		{
			return URL::tidy( 'http://'. $bucket . '.s3.amazonaws.com' . '/' . $uri . '/' . $directory );
		}
	}

	private function get_view( $viewname = null )
	{
		if( is_null($viewname) ) return false;

		$filepath = __DIR__ . '/views/' . $viewname . '.html';

		return File::get( $filepath );
	}

	private function build_response_json( $success = false, $error = true, $code =null, $message = null, $type = null, $data = null, $breadcrumb = null, $html = null )
	{
		return json_encode( array(
			'success'   => $success,
			'error'     => $error,
			'code'      => (int) $code,
			'message'   => $message,
			'type'      => $type,
			'data'      => $data,
			'breadcrumb' => $breadcrumb,
			'html'      => $html,
		) );
	}

	/**
	 * Test method for testing merge_configs()
	 * @return (array)
	 */
	public function s3files__config_dump()
	{
		$destination = Request::get('destination');
		dd(self::merge_configs($destination));
	}

}
// END hooks.s3files.php
