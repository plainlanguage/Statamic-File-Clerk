<?php

/**
 * Plugin_s3files
 * Display infomration about a file on Amazon S3 servers
 *
 * @author  Chad Clark <chad@chadjclark.com>
 *
 * @copyright  2014
 * @link       Coming Soon
 * @license    Coming Soon
 */

class Plugin_s3files extends Plugin
{

	public function index()
	{

		/*
		|--------------------------------------------------------------------------
		| Get the URL
		|--------------------------------------------------------------------------
		|
		| Tag ex: {{ s3files url="{fieldname}" }}
		|
		*/

		$s3_url = $this->fetchParam('url', null, false, false, false);

		/*
		|--------------------------------------------------------------------------
		| Check for URL
		|--------------------------------------------------------------------------
		|
		|
		*/

		// Check to make sure the string is a URL and also if it exists. If it's not, log it.
		if( ! Url::isValid($s3_url) || $this->curlGetFileSize($s3_url) <= "1" ) {

			Log::error("Could not find the requested URL: " . $s3_url, "core", "S3 Files");

			return;
		}

		/*
		|--------------------------------------------------------------------------
		| Assemble Array
		|--------------------------------------------------------------------------
		|
		| Make that array, son.
		|
		*/

		$size = $this->curlGetFileSize($s3_url);

		$return_array = array(
			'extension' => pathinfo($s3_url, PATHINFO_EXTENSION),
			'filename' => basename($s3_url),
			'size' => File::getHumanSize($size),
			'size_kilobytes' => number_format($size / 1024, 2),
			'size_megabytes' => number_format($size / 1048576, 2),
			'size_gigabytes' => number_format($size / 1073741824, 2),
		);

		/*
		|--------------------------------------------------------------------------
		| Return
		|--------------------------------------------------------------------------
		|
		|
		*/

		//return $return_array;
		return Parse::template($this->content, $return_array);
		//return Parse::tagLoop($this->content, $return_array);

	}

	/*
	|--------------------------------------------------------------------------
	| Check Filesize w cURL
	|--------------------------------------------------------------------------
	|
	| http://stackoverflow.com/a/8159439
	|
	*/

	private function curlGetFileSize( $url )
	{
		$ch = curl_init($url);

		curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
		curl_setopt($ch, CURLOPT_HEADER, TRUE);
		curl_setopt($ch, CURLOPT_NOBODY, TRUE);

		$data = curl_exec($ch);
		$size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);

		curl_close($ch);
		return $size;
	}


}