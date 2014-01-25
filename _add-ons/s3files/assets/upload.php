<?php

require 'uploadHandler.php';

ob_start();
header('Content-Type: application/json');
$instance = new S3StreamWrapper();
$instance->uploadFile();
ob_flush();