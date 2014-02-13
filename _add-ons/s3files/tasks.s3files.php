<?php

require_once 'config.php';

class Tasks_s3files extends Tasks
{

	// -------------------------------------------------------------------------------
	// Amazon S3 Authorization
	// -------------------------------------------------------------------------------

	function s3Auth()
	{

		$s3config = array(
			'key'		=> $this->config['aws_access_key'],
			'secret'	=> $this->config['aws_secret_key']
		);

		return $s3config;
	}

	// -------------------------------------------------------------------------------
	// Response for AJAX upload
	// -------------------------------------------------------------------------------

	function ajaxUpload()
	{

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

	// -------------------------------------------------------------------------------
	// S3 View
	// -------------------------------------------------------------------------------

	function s3View()
	{
		$instance = new Hooks_s3files();
		$instance->selectS3File();
		return true;
	}

}