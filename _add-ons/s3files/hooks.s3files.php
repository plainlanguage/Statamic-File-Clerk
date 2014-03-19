<?php

require_once 'config.php';

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
			return $this->css->link('s3files.css');
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

		$this->load_s3(); // Load S3

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

			// If the file doesn't already exist, upload
			if (!$this->file_exists($bucket . URL::tidy('/'.$directory.'/'.$filename))) {

			}
			// If the file does already exist, something omething
			else {

			}

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
	 * @uri /TRIGGER/s3files/choosefile
	 * @return none
	 */
	public function s3files__choosefile()
	{
		$this->select_s3_file();
	}

	/**
	 * Select S3 File
	 *
	 */
	private function select_s3_file()
	{

		$this->load_s3(); // Load S3

		// Merge configs before we proceed
		$this->config = self::merge_configs(Request::get('destination'));

		$bucket    = $this->config['bucket'];
		$directory = $this->config['folder'];

		/*
		|--------------------------------------------------------------------------
		| Finder
		|--------------------------------------------------------------------------
		|
		| Get_Files implements most of the Symfony Finder component
		|
		*/

		$finder = new Finder();
		$finder
			->ignoreUnreadableDirs()
			->in('s3://' . URL::tidy($bucket . '/' . $directory . '/'))
			->depth('< 0'); // Do not allow access above the starting directory

		/*
		|--------------------------------------------------------------------------
		| Assemble File Array
		|--------------------------------------------------------------------------
		|
		| Select the important bits of data on the list of files.
		|
		*/
	
		$data = array(
			'files'       => array(), // Files array
			'directories' => array(), // Directories array
		);

		/**
		 * Let's make sure we've got somethin' up in this mutha.
		 */
		if( $finder->count() > 0 )
		{
			foreach ($finder as $file)
			{
				// File / directory attributes
				$file_data = array(
					'filename'      => $file->getFilename(),
					'file'          => $file->getPathname(),
					'extension'     => $file->getExtension(),
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
					array_push( $data['files'], $file_data );
				}
				elseif( $file->isDir() ) // Push to directories array
				{
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
			/**
			 * Return an error of type dialog that should show a message to the user
			 * that there are is nothing to see her. Doh!
			 * @return [array] JSON
			 * @todo See `self::set_json_return`.
			 */
			return json_encode( array(
				'error' => true,
				'code'  => 100,
				'type'  => 'message',
				'data'  => array(
					'text' => 'There are no files nor directories here.',
					'html' => '',
				),
			));
		}

		dd( $data ); // Just dumping everything to screen and killing the app for now.
		//echo json_encode($data_files);

		/*
		// Using Iterator class -- http://docs.aws.amazon.com/aws-sdk-php/latest/namespace-Aws.S3.Iterator.html
		$iterator = $this->client->getIterator(
			'ListObjects',
			array(
				'Bucket' => $bucket,
				'Prefix' => $directory,
			),
			array(
				'return_prefixes' => true,
			)
		);

		// Convert iterator to an array
		$objects = $iterator->toArray();

		$data = array();
		foreach ($objects as $object) {
			$data[] = array(
				'key' => $object['Key'],
				'last_modified' => $object['LastModified'],
				'size' => File::getHumanSize($object['Size']),
			);
		}

		echo json_encode($data);
		//print_r($objects);
		*/
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

	/**
	 * Merge all configs
	 *
	 * @param string  $destination Paramter for destination YAML file to attempt to load.
	 * @return array
	 */
	private function merge_configs( $destination = null )
	{

		// A complete list of all possible config variables
		$config = array(
			'aws_access_key' => null,
			'aws_secret_key' => null,
			'custom_domain'  => null,
			'bucket'         => null,
			'folder'         => null,
			'permissions'    => 'public-read',
			'content_types'  => array('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc'),
		);

		// Destination config array
		$destination_config = array();

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
					if( empty($value) || is_null($value) )
					{
						unset($destination_config[$key]);
						continue;
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
	private function file_exists( $url )
	{
		if (file_exists($url)) {
			return true;
		}
		
	}

	/**
	 * Private function to build appropriate JSON messages for AJAX.
	 * @return [array] JSON.
	 * @todo Establish set error codes.
	 * @todo Establish parameters for function.
	 */
	private function set_json_return()
	{
		$data = array();

		return $data;
	}

}

// END hooks.s3files.php