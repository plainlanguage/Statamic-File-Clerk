<?php

require_once 'config.php';

class Fieldtype_fileclerk extends Fieldtype {

	var $meta = array(
		'name'			=> FILECLERK_NAME,
		'version'		=> FILECLERK_VERSION,
		'author'		=> FILECLERK_AUTHOR,
		'author_url'	=> FILECLERK_AUTHOR_URL
	);

	static $field_settings;

	function render()
	{

		// Get the field settings
		self::$field_settings = $this->field_config;

		$field_settings = Fieldtype_fileclerk::get_field_settings();
		$field_config   = array_get($field_settings, 'field_config', $field_settings);
		$destination    = isset( $field_settings['destination'] ) ? $field_settings['destination'] : false;

		// Field data
		$data = array(
			'action'         => Config::getSiteRoot() . 'TRIGGER/fileclerk/ajaxupload', // this is the file the AJAX needs to hit on POST. Created in hooks -> function fileclerk__ajaxupload
			'basename_value' => null,
			'destination'    => $destination,
			'extension'      => null,
			'field_data'     => $this->field_data,
			'filename'       => null,
			'id'             => $this->field_id,
			'name'           => $this->fieldname,
			'size'           => null,
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
			$data['size']           = $field_data['size'];
			$data['url']            = $field_data['url'];
		}

		/**
		 * If there is a destination parameter set in the field,
		 * let's append it to the action and choose_file
		 */
		if( $destination )
		{
			$query_data = array(
				'destination' => $destination,
			);

		}
		else
		{
			$query_data = array(
				'destination' => false,
			);
		}

		// Set the action attribute
		$data['action'] .= '?' . http_build_query($query_data);


		// Get the view file
		$ft_template = File::get( __DIR__ . '/views/ft.fileclerk.html');

		// Parse the template with data
		return Parse::template($ft_template, $data);

	}

	public static function get_field_settings() {
		return self::$field_settings;
	}

	/**
	 * Process the field data
	 * @return void
	 */
	function process() {

		if( is_array($this->field_data) )
		{
			foreach( $this->field_data as $key => $value )
			{
				if( $value == 'filename' )
				{
					trim( $this->field_data->$column );
				}
			}
		}

		$data = array( $this->field_data );
		$this->field_data = $data;
		Log::info( json_encode($this->field_data), 'File Clerk' );

		return $this->field_data;
	}

}

// END ft.fileclerk.php