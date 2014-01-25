<?php

class Hooks_s3files extends Hooks {

	// Add CSS to head
	public function control_panel__add_to_head()
	{
		if (URL::getCurrent(false) == '/publish') {
			return $this->css->link('s3files.css');
		}
	}

	// Load JS in footer
	public function control_panel__add_to_foot() {
		// Get the necessary support .js
		if (URL::getCurrent(false) == '/publish') {
			$html = $this->js->link(array(
				's3files.js'
			));
			return $html;
		}
	}
}