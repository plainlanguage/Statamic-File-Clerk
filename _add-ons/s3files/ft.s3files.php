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
			'name'			=> $this->fieldname,
			'id'			=> $this->field_id,
			'tabindex'		=> $this->tabindex,
			'value'			=> $this->field_data,
			'action'		=> Config::getSiteRoot() . 'TRIGGER/s3files/ajaxupload' // this is the file the AJAX needs to hit on POST. Created in hooks -> function s3files__ajaxupload
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

			$attributes['action'] .= '?' . http_build_query($query_data);
		}

		// print_r($attributes);

		/**
		 * @todo Use a parsed template to render field HTML.
		 */
		$data = array(
			'field_data'     => $this->field_data,
			'action'         => $attributes['action'],
			'basename_value' => basename($attributes['value']),
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


		// $html = "<div class='s3files file-field-container'>";
		// 	$html .= "<input class='postUrl' name='postUrl' type='hidden' value='{$attributes['action']}'>";
		// 	if ($this->field_data)
		// 	{
		// 	$html .= "<div class='result is-visible'>";
		// 		$html .= "<p><span class='filename-display'>".basename($attributes['value'])."</span></p>";
		// 		$html .= "<a class='btn btn-small btn-remove' href='#'>Remove</a>";
		// 		$html .= "<input class='successful-upload' name='{$attributes['name']}' type='hidden' value='{$attributes['value']}'>";
		// 	$html .= "</div>";
		// 	}
		// 	else
		// 	{
		// 	$html .= "<div class='fileinput'>";
		// 		$html .= "<p><input class='file-upload' id='s3files-upload-{$attributes['id']}' type='file' name='files' tabindex='{$this->tabindex}'></p>";
		// 		$html .= "<button class='btn-upload btn btn-small is-hidden'>Upload</button>";
		// 	$html .= "</div>";
		// 	$html .= "<div class='progress is-hidden'>";
		// 		$html .= "<div class='progress-filename clearfix'>";
		// 			$html .= "<p>Uploading&hellip;</p>";
		// 		$html .= "</div>";
		// 		$html .= "<div class='progress-bar clearfix'>";
		// 			$html .= "<progress class='uploading' value='0' min='0' max='100'></progress>";
		// 			$html .= "<div class='prc'></div>";
		// 		$html .= "</div>";
		// 	$html .= "</div>";
		// 	$html .= "<div class='result'>";
		// 		$html .= "<input type='hidden' class='successful-upload' id='{$attributes['name']}' name='{$attributes['name']}' type='text' value=''>";
		// 	$html .= "</div>";
		// 	}

		// $html .= "</div>";

		// return $html;

	}

	public static function get_field_settings() {
		return self::$field_settings;
	}

	function process() {
		return trim($this->field_data);
	}

}

// END ft.s3files.php
