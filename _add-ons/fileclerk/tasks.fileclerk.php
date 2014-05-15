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
			'mime_type'      => null,
			'size'           => null,
			'size_bytes'     => null,
			'size_kilobytes' => null,
			'size_megabytes' => null,
			'size_gigabytes' => null,
		);
	}

}
// END file tasks.fileclerk.php