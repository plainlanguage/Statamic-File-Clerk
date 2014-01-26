<?php

require_once '_add-ons/s3files/hooks.s3files.php';

ob_start();
header('Content-Type: application/json');
$instance = new Hooks_s3files();
$instance->uploadFile();
ob_flush();