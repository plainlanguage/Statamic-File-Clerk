<?php

/**
 * Plugin_fileclerk
 * Displays infomration about a file on Amazon S3 servers
 *
 * @author  Chad Clark <chad@chadjclark.com>
 * @author  Brandon Haslip <bhaslip@gmail.com>
 * @author  Michael Reiner <mreiner77@gmail.com>
 *
 * @copyright  2014
 * @link       Coming Soon
 * @license    Coming Soon
 */

class Plugin_fileclerk extends Plugin
{

	protected $field;
	protected $fieldname;

	public function index()
	{
		self::get_field();

		return array(
			'url'            => self::get('url'),
			'filename'       => self::get('filename'),
			'extension'      => self::get('extension'),
			'size'           => self::get('size'),
			'size_bytes'     => self::get('size_bytes'),
			'size_kilobytes' => self::get('size_kilobytes'),
			'size_megabytes' => self::get('size_megabytes'),
			'size_gigabytes' => self::get('size_gigabytes'),
			'is_image'       => self::get('is_image'),
			'mime_type'      => self::get('mime_type')
		);
	}

	public function url()
	{
		self::get_field();
		return trim( self::get('url') );
	}

	/**
	 * Return the flename.
	 * Single tag:
	 * {{ fileclerk:filename field="" }}
	 * @return (string)
	 */
	public function filename()
	{
		self::get_field();
		return self::get('filename');
	}

	/**
	 * Return the file extension.
	 * Single tag:
	 * {{ fileclerk:extension field="" }}
	 * @return (string)
	 */
	public function extension()
	{
		self::get_field();
		return self::get('extension');
	}

	/**
	 * Return the filesize.
	 * Single tag:
	 * {{ fileclerk:size field="" }}
	 * @return (string)
	 */
	public function size()
	{
		self::get_field();
		return self::get('size');
	}

	/**
	 * Return the filesize in bytes.
	 * Single tag:
	 * {{ fileclerk:size_bytes field="" }}
	 * @return (string)
	 */
	public function size_bytes()
	{
		self::get_field();
		return self::get('size_bytes');
	}

	/**
	 * Return the filesize in kilobytes.
	 * Single tag:
	 * {{ fileclerk:size_kilobytes field="" }}
	 * @return (string)
	 */
	public function size_kilobytes()
	{
		self::get_field();
		return self::get('size_kilobytes');
	}

	/**
	 * Return the filesize in megabytes.
	 * Single tag:
	 * {{ fileclerk:size_megabytes field="" }}
	 * @return (string)
	 */
	public function size_megabytes()
	{
		self::get_field();
		return self::get('size_megabytes');
	}

	/**
	 * Return the filesize in gigabytes.
	 * Single tag:
	 * {{ fileclerk:size_gigabytes field="" }}
	 * @return (string)
	 */
	public function size_gigabytes()
	{
		self::get_field();
		return self::get('size_gigabytes');
	}

	/**
	 * Return whether or not the file is an image.
	 * Single tag:
	 * {{ fileclerk:is_image field="" }}
	 * @return (string)
	 */
	public function is_image()
	{
		self::get_field();
		return self::get('is_image');
	}

	/**
	 * Return the MIME type.
	 * Single tag:
	 * {{ fileclerk:mime_type field="" }}
	 * @return (string)
	 */
	public function mime_type()
	{
		self::get_field();
		return self::get('mime_type');
	}

	/**
	 * Get the appropriate return based on the parameter.
	 * @param  (string) $key
	 * @return (string)
	 */
	private function get( $key = null )
	{
		if( is_null($key) )
		{
			return false;
		}

		if( ! is_null($this->field) )
		{
			switch( $key )
			{
				case 'url':
				case 'extension':
				case 'filename':
				case 'mime_type':
				case 'size':
				case 'size_kilobytes':
				case 'size_megabytes':
				case 'size_gigabytes':
					return array_get($this->field, $key );
					break;
				case 'is_image':
					$is_image = array_get($this->field, $key );
					return (boolean) $is_image;
					break;
				default:
					return false;
			}
		}

		return false;

	}

	/*
	|--------------------------------------------------------------------------
	| Check Filesize w cURL
	|--------------------------------------------------------------------------
	|
	| http://stackoverflow.com/a/8159439
	|
	*/

	/**
	 * Get filesize via cURL
	 * @param  (string) $url Absolute URL for file.
	 * @return (int)      Filezize
	 */
	private function curl_get_file_size( $url )
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

	/**
	 * Attempt to fetch the field
	 * @return (array) Field data.
	 */
	public function get_field( $field = null )
	{

		$this->field = null;

		$this->fieldname = is_null($field) ? $this->fetchParam('field', null, null, false, true) : $field;

		if( is_null($this->fieldname) )
		{
			Log::error('The field parameter must be set.', 'File Clerk');
			return false;
		}

		// Fetch the field data
		$data = array_get($this->context, $this->fieldname);

		// Make sure it's an array and we have 1.
		if( is_array($data) && count($data === 1) )
		{
			$this->field = reset( $data );
		}
	}

}
