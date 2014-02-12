<?php

require_once 'config.php';

class Tasks_s3files extends Tasks
{

	// -------------------------------------------------------------------------------
	// Response for AJAX upload
	// -------------------------------------------------------------------------------

	function ajaxUpload() {

		if(Request::isAjax())
		{
			ob_start();
			$instance = new Hooks_s3files();
			$instance->uploadFile();
			header('Content-Type: application/json');
			ob_flush();
			return true;
			Log::info('Boom');
		}
		else
		{
			echo 'AJAX only, son.';
		}
	}

}