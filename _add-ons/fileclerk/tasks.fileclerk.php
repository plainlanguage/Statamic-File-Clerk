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

use Aws\S3\S3Client;
use Aws\S3\StreamWrapper;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Size;
use Aws\Common\Exception\MultipartUploadException;
use Aws\S3\Model\MultipartUpload\UploadBuilder;
use Symfony\Component\Finder\Finder;

class Tasks_fileclerk extends Tasks
{

	// Required method
	public function define()
	{

	}

}
// END file tasks.fileclerk.php