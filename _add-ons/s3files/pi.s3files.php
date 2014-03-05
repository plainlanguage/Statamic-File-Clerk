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

		return $return_array;

	}

	/*
	|--------------------------------------------------------------------------
	| Check Filesize w cURL
	|--------------------------------------------------------------------------
	|
	| http://stackoverflow.com/questions/2602612/php-remote-file-size-without-downloading-file
	|
	*/

	private function curlGetFileSize( $url )
	{
		// Assume failure. Always assume failure.
		$result = -1;

		$curl = curl_init( $url );

	  // Issue a HEAD request and follow any redirects.
		curl_setopt( $curl, CURLOPT_NOBODY, true );
		curl_setopt( $curl, CURLOPT_HEADER, true );
		curl_setopt( $curl, CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $curl, CURLOPT_FOLLOWLOCATION, true );
		curl_setopt( $curl, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT'] );

		$data = curl_exec( $curl );
		curl_close( $curl );

		if( $data ) {
			$content_length = "unknown";
			$status = "unknown";

			if( preg_match( "/^HTTP\/1\.[01] (\d\d\d)/", $data, $matches ) ) {
				$status = (int)$matches[1];
			}

			if( preg_match( "/Content-Length: (\d+)/", $data, $matches ) ) {
				$content_length = (int)$matches[1];
			}

			// http://en.wikipedia.org/wiki/List_of_HTTP_status_codes
			if( $status == 200 || ($status > 300 && $status <= 308) ) {
				$result = $content_length;
			}
		}

		return $result;
	}


}