<?php

require_once 'config.php';

use Symfony\Component\Finder\Finder;

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
	/**
	*/

	public function index()
	{

		/*
		|--------------------------------------------------------------------------
		| Paramers
		|--------------------------------------------------------------------------
		|
		| Match overrides Extension. Exclusion applies in both cases.
		|
		*/
		$extension  = $this->fetchParam(array('extension', 'type'), false);
		$file_size  = $this->fetchParam('file_size', false);
		$file_date  = $this->fetchParam('file_date', false);

		if ($file_size) {
			$file_size = Helper::explodeOptions($file_size);
		}

		if ($extension) {
			$extension = Helper::explodeOptions($extension);
		}

		/*
		|--------------------------------------------------------------------------
		| Finder
		|--------------------------------------------------------------------------
		|
		| Get_Files implements most of the Symfony Finder component as a clean
		| tag wrapper mapped to matched filenames.
		|
		*/

		$this->finder = new Finder();

		/*
		|--------------------------------------------------------------------------
		| Check for URL
		|--------------------------------------------------------------------------
		|
		|
		*/

		// Get the URL ex: {{ s3files url="{fieldname}" }}
		$s3_url = $this->fetchParam('url', null, false, false, false);

		// Check to make sure the string is a URL. If it's not, log it.
		if( ! Url::isValid($s3_url) ) {

			Log::error("Could not find the requested URL: " . $s3_url, "core", "S3 Files");

			return;
		}

		return File::getHumanSize($this->curlGetFileSize($s3_url));
		//$s3_file = $this->finder->files()->name($s3_url);
		//return $s3_file;

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
		//curl_setopt( $curl, CURLOPT_USERAGENT, get_user_agent_string() );

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