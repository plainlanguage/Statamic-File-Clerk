<?php

require_once 'config.php';

class Tasks_s3files extends Tasks
{

	// -------------------------------------------------------------------------------
	// Response for AJAX upload
	// -------------------------------------------------------------------------------

	function ajaxUpload()
	{

		if(Request::isAjax())
		{
			ob_start();
			$object = new Hooks_s3files();
			$object->uploadFile();
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

	// -------------------------------------------------------------------------------
	// S3 View
	// -------------------------------------------------------------------------------

	function s3View()
	{
		ob_start();
		$object = new Hooks_s3files();
		$object->selectS3File();
		ob_flush();
		return true;
	}

}