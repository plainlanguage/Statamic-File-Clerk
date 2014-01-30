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

	function render() {
		self::$field_settings = $this->field_config;

		// Set attributes as array
		$attributes = array(
			'name'		=> $this->fieldname,
			'id'		=> $this->field_id,
			'tabindex'	=> $this->tabindex,
			'value'		=> $this->field_data,
			'action'	=> Config::getSiteRoot() . 'TRIGGER/s3files/ajaxupload' // this is the file the AJAX needs to hit on POST. Created in hooks -> function s3files__ajaxupload
		);

		$html = "<div class='s3files file-field-container'>";
			if ($this->field_data)
			{
			$html .= "<div class='result'>";
				$html .= "<p><span class='filename-display'>".basename($attributes['value'])."</span></p>";
				$html .= "<a class='btn btn-small btn-remove-s3file' href='#'>Remove</a>";
				$html .= "<input class='successful-upload' name='{$attributes['name']}' type='text' value='{$attributes['value']}'>";
			$html .= "</div>";
			}
			else
			{
			$html .= "<input class='postUrl' name='postUrl' type='hidden' value='{$attributes['action']}'>";
			$html .= "<div class='fileinput'>";
				$html .= "<p><input class='fileupload' type='file' name='files' tabindex='{$this->tabindex}'></p>";
				$html .= "<button class='do-upload btn btn-small is-hidden'>Upload</button>";
			$html .= "</div>";
			$html .= "<div class='progress is-hidden'>";
				$html .= "<div class='progress-filename clearfix'>";
					$html .= "<p>Uploading&hellip;</p>";
				$html .= "</div>";
				$html .= "<div class='progress-bar clearfix'>";
					$html .= "<progress class='uploading' value='0' min='0' max='100'></progress>";
					$html .= "<div class='prc'></div>";
				$html .= "</div>";
			$html .= "</div>";
			$html .= "<div class='result'>";
				$html .= "<input class='successful-upload' id='{$attributes['name']}' name='{$attributes['name']}' type='text' value=''>";
			$html .= "</div>";
			}
		$html .= "</div>";

		return $html;
	}

	public static function get_field_settings() {
		return self::$field_settings;
	}

	function process() {
		return trim($this->field_data);
	}
}