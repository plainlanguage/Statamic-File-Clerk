<?php

require_once 'config.php';

class Fieldtype_fileclerk extends Fieldtype {

	var $meta = array(
		'name'			=> FILECLERK_NAME,
		'version'		=> FILECLERK_VERSION,
		'author'		=> FILECLERK_AUTHOR,
		'author_url'	=> FILECLERK_AUTHOR_URL
	);

	static $env;
	static $field_settings;
	static $errors;

	function render()
	{

		// Get the field settings
		self::$field_settings = $this->field_config;

		// Get the field settings
		$field_settings = Fieldtype_fileclerk::get_field_settings();

		// Set the destination
		$destination    = isset( $field_settings['destination'] ) ? $field_settings['destination'] : false;

		// Get merged configs from tasks
		$field_config   = $this->tasks->merge_configs($destination, 'html');

		/**
		 * If we have errors in the config, no (sur)render.
		 */
		if( isset($field_config['errors']) )
		{
			// Get the errors view file
			$template = File::get( __DIR__ . '/views/error-no-render.html');

			// Parse the errors template with error data
			return Parse::template($template, array('errors' => $field_config['errors']));
		}

		// Field data
		$data = array(
			'action'         => Config::getSiteRoot() . 'TRIGGER/fileclerk/ajaxupload', // this is the file the AJAX needs to hit on POST. Created in hooks -> function fileclerk__ajaxupload
			'basename_value' => null,
			'destination'    => $destination,
			'extension'      => null,
			'field_data'     => $this->field_data,
			'filename'       => null,
			'id'             => Helper::getRandomString(), // $this->field_id,
			'is_image'       => null,
			'mime_type'      => null,
			'name'           => $this->fieldname,
			'size'           => null,
			'size_bytes'     => null,
			'size_kilobytes' => null,
			'size_megabytes' => null,
			'size_gigabytes' => null,
			'tabindex'       => $this->tabindex,
			'value'          => $this->field_data,
			'url'            => null,
		);

		// If field data is an array, it means we have an existing file
		if( is_array($this->field_data) && isset($this->field_data[0]) )
		{
			$field_data = reset($this->field_data);

			$data['basename_value'] = $field_data['filename'];
			$data['extension']      = $field_data['extension'];
			$data['filename']       = $field_data['filename'];
			$data['is_image']       = $field_data['is_image'] ? 'true' : 'false';
			//$data['mime_type']      = $field_data['mime_type'];
			$data['size']           = $field_data['size'];
			$data['size_bytes']     = $field_data['size_bytes'];
			$data['size_kilobytes'] = $field_data['size_kilobytes'];
			$data['size_megabytes'] = $field_data['size_megabytes'];
			$data['size_gigabytes'] = $field_data['size_gigabytes'];
			$data['url']            = $field_data['url'];
		}

		/**
		 * If there is a destination parameter set in the field,
		 * let's append it to the action and choose_file
		 */
		$query_data = $destination ? array('destination' => $destination) : array('destination' => false);

		// Set the action attribute
		$data['action'] .= '?' . http_build_query($query_data);

		// Get the fieldtype view file
		$ft_template = File::get( __DIR__ . '/views/ft.fileclerk.html');

		// Parse the template with data
		return Parse::template($ft_template, $data);

	}

	public static function get_field_settings() {
		return self::$field_settings;
	}

	/**
	 * Process the field data
	 * @return (array) Field data.
	 */
	function process() {

		// Only do stuff if field data is an array (assumes an entry submission is happening)
		if( is_array($this->field_data) )
		{
			foreach( $this->field_data as $key => $value )
			{
				switch( $key )
				{
					case 'filename':
						trim($this->field_data['filename']);
						break;
					case 'is_image':
						$this->field_data['is_image'] = ( $value === 'true' || $value === '1' ) ? true : false;
						break;
					case 'size_bytes':
							$this->field_data[$key] = (int) $value;
							break;
					default:
						(string) $value;
						break;
				}
			}
		}

		// Field data needs to be a zero-index array
		$this->field_data = array( $this->field_data );

		return $this->field_data;

	}

}
// END ft.fileclerk.php