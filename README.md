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
There are two places to define settings for S3 Files.

1. **Master Settings** - You will find this in `_config/add-ons/s3files/s3files.yaml`
2. **Destinations** - You can set different upload "destinations" by creating different YAML files in `_config/add-ons/s3files/destinations`

### Settings
These are the settings you can configure for S3 Files.

- `aws_access_key` - Required. Your AWS Access Key.
- `aws_secret_key` - Required. Your AWS Secret Key.
- `custom_domain` - If you are using a custom domain (CNAME) for yoru Amazon S3 account. Leave this blank unless you want to use a custom domain.
- `bucket` - Required. The AWS S3 bucket you want to use.
- `directory` - The directory path to upload to inside your bucket.
- `content_types` - An array of filetypes that can be uploaded.
- `permissions` - The permissions for the uploaded file. If left blank, all files will default to 'public-read'.

### Master Settings
The **Master Settings** in `_config/add-ons/s3files/s3files.yaml` will be, well, the Master configuration. If you only need one upload location, you only need to worry about this file.

### Destinations
"But I want multiple upload locations!" Hey, I hear you. Good news! You can set up different **Destinations**.

Destination files will override any parameters set in the **Master Settings** file.

For example, let's say you want an upload destination called "podcast".

1. Create `podcast.yaml` in the `_config/add-ons/s3files/destinations/` directory
2. Include any of the settings you want to override (in theory, you could upload to different S3 accounts/buckets as long as you have the proper credentials although it's probably most likely you will be changing thinks like `bucket`, `directory`, `content_types`, and `permissions` in these files).
3. In your fieldset, add `destination: podcast` as a parameter to your `s3files` field.

## Fieldtype Example
```
fields:
  s3upload:
    type: s3files
    display: File Upload
    destination: podcast
```

## Notes

### PHP Post Limits

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

