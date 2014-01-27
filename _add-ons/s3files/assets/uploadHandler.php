<?php

require 'aws/aws-autoloader.php';

use Aws\S3\S3Client;
use Aws\S3\StreamWrapper;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Size;
use Aws\Common\Exception\MultipartUploadException;
use Aws\S3\Model\MultipartUpload\UploadBuilder;
use Symfony\Component\Finder\Finder;

class S3StreamWrapper
{

	// Set Key and Secret as variables
	private $key	= '';
	private $secret	= '';

	// Pass the key, secret and retister the S3 Stream Wrapper
	public function __construct()
	{
		// -------------------------------------------------------------------------------
		// Set S3 Credentials
		// -------------------------------------------------------------------------------

		$this->client = S3Client::factory(array(
			'key'		=> $this->key, // Hard-coded for now
			'secret'	=> $this->secret // Hard-coded for now
		));

		// -------------------------------------------------------------------------------
		// Register Stream Wrapper
		// -------------------------------------------------------------------------------

		$this->client->registerStreamWrapper();

		// -------------------------------------------------------------------------------
		// Sanitize Filename
		// Ref: http://www.house6.com/blog/?p=83
		// -------------------------------------------------------------------------------

		function sanitizeFilename($f) {
			// a combination of various methods
			// we don't want to convert html entities, or do any url encoding
			// we want to retain the "essence" of the original file name, if possible
			// char replace table found at:
			// http://www.php.net/manual/en/function.strtr.php#98669
			$replace_chars = array(
				'Š'=>'S', 'š'=>'s', 'Ð'=>'Dj','Ž'=>'Z', 'ž'=>'z', 'À'=>'A', 'Á'=>'A', 'Â'=>'A', 'Ã'=>'A', 'Ä'=>'A',
				'Å'=>'A', 'Æ'=>'A', 'Ç'=>'C', 'È'=>'E', 'É'=>'E', 'Ê'=>'E', 'Ë'=>'E', 'Ì'=>'I', 'Í'=>'I', 'Î'=>'I',
				'Ï'=>'I', 'Ñ'=>'N', 'Ò'=>'O', 'Ó'=>'O', 'Ô'=>'O', 'Õ'=>'O', 'Ö'=>'O', 'Ø'=>'O', 'Ù'=>'U', 'Ú'=>'U',
				'Û'=>'U', 'Ü'=>'U', 'Ý'=>'Y', 'Þ'=>'B', 'ß'=>'Ss','à'=>'a', 'á'=>'a', 'â'=>'a', 'ã'=>'a', 'ä'=>'a',
				'å'=>'a', 'æ'=>'a', 'ç'=>'c', 'è'=>'e', 'é'=>'e', 'ê'=>'e', 'ë'=>'e', 'ì'=>'i', 'í'=>'i', 'î'=>'i',
				'ï'=>'i', 'ð'=>'o', 'ñ'=>'n', 'ò'=>'o', 'ó'=>'o', 'ô'=>'o', 'õ'=>'o', 'ö'=>'o', 'ø'=>'o', 'ù'=>'u',
				'ú'=>'u', 'û'=>'u', 'ý'=>'y', 'ý'=>'y', 'þ'=>'b', 'ÿ'=>'y', 'ƒ'=>'f'
			);
			$f = strtr($f, $replace_chars);
			// convert & to "and", @ to "at", and # to "number"
			$f = preg_replace(array('/[\&]/', '/[\@]/', '/[\#]/'), array('-and-', '-at-', '-number-'), $f);
			$f = preg_replace('/[^(\x20-\x7F)]*/','', $f); // removes any special chars we missed
			$f = str_replace(' ', '-', $f); // convert space to hyphen
			$f = str_replace('\'', '', $f); // removes apostrophes
			$f = preg_replace('/[^\w\-\.]+/', '', $f); // remove non-word chars (leaving hyphens and periods)
			$f = preg_replace('/[\-]+/', '-', $f); // converts groups of hyphens into one
			return strtolower($f);
		}
	}

	public function listBucket()
	{
		// -------------------------------------------------------------------------------
		// Listing Contents of a Bucket
		// -------------------------------------------------------------------------------

		// Create Symfony Finder instance
		$finder = new Finder();

		// S3 Directory
		$dir = "s3://s3filesdev/"; // Hard-coded for now

		// Have Finder look in the defined directory
		$results = $finder->in($dir);

		// Get a list of files in directory

		$items = array();
		foreach ($results as $file) {
			$items[] = array(
				'getFileName' 		=> $file->getFileName(),
				'fileType' 			=> $file->getType(),
				'fileTime' 			=> $file->getATime(),
				'isDir'				=> $file->isDir(),
				'getType'			=> $file->getType(),
				'getExtension'		=> $file->getExtension(),
				'getRealPath'		=> $file->getRealPath()
			);
		}

		var_dump($items);

		//return $items[1]['pathName'];

	}

	// Thank you, http://abandon.ie/notebook/simple-file-uploads-using-jquery-ajax
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
			$filename = sanitizeFilename($filename);

			$bucket = "";
			$directory = "";

			$fullPath = 'http://'.$bucket.'.s3.amazonaws.com'.$directory.$filename;

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