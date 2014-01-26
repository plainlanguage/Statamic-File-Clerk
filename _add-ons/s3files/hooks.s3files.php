<?php

require_once 'config.php';

use Aws\S3\S3Client;
use Aws\S3\StreamWrapper;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Size;
use Aws\Common\Exception\MultipartUploadException;
use Aws\S3\Model\MultipartUpload\UploadBuilder;
use Symfony\Component\Finder\Finder;

class Hooks_s3files extends Hooks {

	// -------------------------------------------------------------------------------
	// Add CSS to head
	// -------------------------------------------------------------------------------
	public function control_panel__add_to_head()
	{
		if (URL::getCurrent(false) == '/publish') {
			return $this->css->link('s3files.css');
		}
	}

	// -------------------------------------------------------------------------------
	// Load JS in footer
	// -------------------------------------------------------------------------------
	public function control_panel__add_to_foot() {
		// Get the necessary support .js
		if (URL::getCurrent(false) == '/publish') {
			$html = $this->js->link(array(
				's3files.min.js'
			));
			return $html;
		}
	}

	// -------------------------------------------------------------------------------
	// S3 Stream Wrapper
	// -------------------------------------------------------------------------------
	public function __construct()
	{

		// -------------------------------------------------------------------------------
		// Set S3 Credentials
		// -------------------------------------------------------------------------------

		echo $this->config['aws_access_key'];

		$this->client = S3Client::factory(array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key']
		));

		// -------------------------------------------------------------------------------
		// Register Stream Wrapper
		// -------------------------------------------------------------------------------

		$this->client->registerStreamWrapper();

	}

	// -------------------------------------------------------------------------------
	// Function - uploadFile
	// -------------------------------------------------------------------------------
	public function uploadFile()
	{

		$error = false;
		$data = array();

		foreach($_FILES as $file)
		{
			$filename	= $file['name'];
			$filetype	= $file['type'];
			$tmp_name	= $file['tmp_name'];
			$filesize	= $file['size'];
			$fileError	= $file['error'];

			// Set the full path of the uploaded file to use in setSource
			$handle = $tmp_name;

			// Sanitize Filename
			$filename = $this->tasks->sanitizeFilename($filename);

			$bucket = $this->config['bucket'];
			$directory = $this->config['folder'];

			// Is a custom domain set in the config?
			if(config::get('custom_domain') != '')
			{
				$fullPath = 'http://'.$bucket.'.s3.amazonaws.com'.$directory.$filename;
			}
			else
			{
				$fullPath = 'http://'.$bucket.'.s3.amazonaws.com'.$directory.$filename;
			}

			$uploader = UploadBuilder::newInstance()
				->setClient($this->client)
				->setSource($handle)
				->setBucket($bucket)
				->setKey($directory.$filename)
				->setOption('CacheControl', 'max-age=3600')
				->setOption('ACL', CannedAcl::PUBLIC_READ)
				->setOption('ContentType', $filetype)
				->setConcurrency(3)
				->build();

			try
			{
				$uploader->upload();
				//fclose($handle);
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

}