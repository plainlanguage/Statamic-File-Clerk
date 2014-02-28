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

	private function getS3Directories()
	{

	}

	// -------------------------------------------------------------------------------
	// Function - uploadFile
	// -------------------------------------------------------------------------------
	public function uploadFile()
	{

		// -------------------------------------------------------------------------------
		// Set S3 Credentials
		// -------------------------------------------------------------------------------

		$this->client = S3Client::factory(array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key']
		));

		$this->client->registerStreamWrapper();

		$error = false;
		$data = array();

		foreach($_FILES as $file)
		{
			$filename	= $file['name'];
			$filetype	= $file['type'];
			$tmp_name	= $file['tmp_name'];
			$filesize	= $file['size'];
			$fileError	= $file['error'];

			$handle = $tmp_name; // Set the full path of the uploaded file to use in setSource
			$filename = File::cleanFilename($filename); // Clean Filename

			// Add-on settings
			$bucket = $this->config['bucket'];
			$directory = $this->config['folder'];
			$customDomain = $this->config['custom_domain'];
			$setAcl = $this->config['permissions'];

			// Is a custom domain set in the config?
			if($customDomain)
			{
				$fullPath = URL::tidy('http://'.$customDomain.'/'.$directory.'/'.$filename);
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
				->setOption('ACL', $setAcl ? $setAcl : CannedAcl::PUBLIC_READ)
				->setOption('ContentType', $filetype)
				->setConcurrency(3)
				->build();

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

	// -------------------------------------------------------------------------------
	// Function - s3files Ajax Upload
	// -------------------------------------------------------------------------------
	public function s3files__ajaxupload() //This can be accessed as a URL via /TRIGGER/s3files/ajaxupload
	{
		$this->tasks->ajaxUpload();
	}

	// -------------------------------------------------------------------------------
	// Function - selectS3File
	// -------------------------------------------------------------------------------
	public function selectS3File()
	{

		// -------------------------------------------------------------------------------
		// Set S3 Credentials
		// -------------------------------------------------------------------------------

		$this->client = S3Client::factory(array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key']
		));

		$this->client->registerStreamWrapper();

		$bucket = $this->config['bucket'];
		$directory = $this->config['folder'];

		/*
		$finder = new Finder();

		//$finder->in(url::Tidy('s3://' . $bucket));
		$finder->in('s3://s3filesdev/');

		// Get info about files/directories
		$data_files = array();
		$data_dir = array();
		foreach ($finder as $file) {

			// File(s)
			if ($file->isFile()) {
				$data_files[] = array(
					'filename'		=> $file->getFilename(),
					'size'			=> $file->getSize(),
					'extension'		=> $file->getExtension(),
					'lastmodified'	=> $file->getMTime(),
					'path'			=> $file->getPath(),
				);
			// Directory(ies)
			} elseif ($file->isDir()) {
				$data_dir[] = array(
					'directory'		=> $file->getFilename(),
					'path'			=> $file->getPath(),
				);
			}
		}

		print_r($data_files);
		//print_r($data_dir);

		$data = $data_files;

		echo json_encode($data);
		*/

		// Using Iterator class -- http://docs.aws.amazon.com/aws-sdk-php/latest/namespace-Aws.S3.Iterator.html
		$iterator = $this->client->getIterator('ListObjects', array(
			'Bucket' => $bucket,
			'Prefix' => $directory,
		));

		foreach ($iterator as $object) {
		    echo $object['Key'] . "\n";
		}
	}


	// -------------------------------------------------------------------------------
	// Function - s3files Directory View
	// -------------------------------------------------------------------------------
	public function s3files__view() //This can be accessed as a URL via /TRIGGER/s3files/view
	{
		$this->tasks->s3View();
	}

}