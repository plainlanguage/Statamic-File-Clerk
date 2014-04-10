<?php

require_once 'config.php';

class Fieldtype_s3files extends Fieldtype {

	var $meta = array(
		'name'			=> S3FILES_NAME,
		'version'		=> S3FILES_VERSION,
		'author'		=> S3FILES_AUTHOR,
		'author_url'	=> S3FILES_AUTHOR_URL
	);

	static $field_settings;

	function render()
	{

		self::$field_settings = $this->field_config;

		$field_settings = Fieldtype_s3files::get_field_settings();
		$field_config   = array_get($field_settings, 'field_config', $field_settings);
		$destination    = isset( $field_settings['destination'] ) ? $field_settings['destination'] : false;


		// Set attributes as array
		$attributes = array(
			'action'      => Config::getSiteRoot() . 'TRIGGER/s3files/ajaxupload', // this is the file the AJAX needs to hit on POST. Created in hooks -> function s3files__ajaxupload
			'destination' => $destination,
			'id'          => $this->field_id,
			'name'        => $this->fieldname,
			'tabindex'    => $this->tabindex,
			'value'       => $this->field_data,
		);

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
		$attributes['action'] .= '?' . http_build_query($query_data);

		// print_r($attributes);

		/**
		 * @todo Use a parsed template to render field HTML.
		 */
		$data = array(
			'action'         => $attributes['action'],
			'basename_value' => basename($attributes['value']),
			'destination'    => $destination,
			'field_data'     => $this->field_data,
			'id'             => $attributes['id'],
			'name'           => $attributes['name'],
			'tabindex'       => $this->tabindex,
			'value'          => $attributes['value'],
		);

		// Get a file listing for the field
		//$listing = Hooks_s3files::get_list();
		$listing = array();

		// Merge in with the existing data
		$data = array_merge($data, $listing);

		//dd($data);

		// Get the view file
		$ft_template = File::get( __DIR__ . '/views/ft.s3files.html');

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

		// Field needs to be stored as a zero-index array.
		// $field_data = array();
		// array_push($field_data, $this->field_data);
		// $this->field_data = $field_data;
		
		return $this->field_data;
	}

}

// END ft.s3files.php