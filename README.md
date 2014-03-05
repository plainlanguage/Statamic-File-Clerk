# S3 Files
A simple Amazon S3 add-on for Statamic

## Requirements
- [Statamic 1.7+](http://statamic.com/ "Statamic")

## Installing
1. Unzip the `s3files` add-on zip file
2. In the unzipped folder, drag the following folders into your site's Statamic installation:

- `_add-ons/s3files` goes into your installation's `_add-ons` folder
- `_config/add-ons/s3files` goes into your installation's `_config/add-ons` folder

## Configuration

**PHP Post Limits**

The S3 File fieldtype uses the (AWS SDK for PHP)[https://github.com/aws/aws-sdk-php "AWS SDK for PHP"] and AJAX to handle file uploads.

Although the SDK allows for large file uploads, the AJAX call is still using a `POST` request to initiate the upload.

If you plan to upload large files, you will want to increase the values of:

- `upload_max_filesize`
- `post_max_size`
- `memory_limit`

The easiest way to change these settins is in your `.htaccess` file.

##Example:##

```
php_value upload_max_filesize 200M
php_value post_max_size 200M
php_value memory_limit 128M
```

