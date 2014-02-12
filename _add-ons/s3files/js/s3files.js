// Avoid `console` errors in browsers that lack a console.
(function() {
	var method;
	var noop = function () {};
	var methods = [
		'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
		'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
		'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
		'timeStamp', 'trace', 'warn'
	];
	var length = methods.length;
	var console = (window.console = window.console || {});

	while (length--) {
		method = methods[length];

		// Only stub undefined methods.
		if (!console[method]) {
			console[method] = noop;
		}
	}
}());

// The jQuery
$(function () {

	var s3upload = {

		// Variables
		fileInput: $('.file-upload'),
		btnUpload: $('.btn-upload'),
		btnRemove: $('.btn-remove'),

		// Initialize
		init: function() {

			this.bindUIActions();
		},

		// Bind UI Actions
		bindUIActions: function() {

			// Prepare upload on file input change event
			this.fileInput.on( 'change', this.prepareUpload );

			// Upload file on click
			this.btnUpload.on( 'click', this.uploadFiles );

			// Remove file reference on click
			this.btnRemove.on( 'click', this.removeFileReference );
		},

		// Prepare Upload
		prepareUpload: function( event ) {

			var files = event.target.files;
			btnUpload = $(this).closest('.s3files').find('.btn-upload');

			btnUpload.removeClass('is-hidden');

			console.log(files);
		},

		// Upload Files
		uploadFiles: function( event ) {

			event.stopPropagation(); // Stop stuff from happening
			event.preventDefault(); // Really make sure stuff isn't happening

			var postInput = $(this).closest('.s3files').find('.file-upload');
			var postUrl = $(this).closest('.s3files').find('.postUrl').val();
			var fileInput = $(this).closest('.s3files').find('.fileinput');
			var progress = $(this).closest('.s3files').find('.progress');
			var progressFilename = $(this).closest('.s3files').find('.progress-filename p');
			var progressBar = $(this).closest('.s3files').find('.progress-bar');
			var successfullUpload = $(this).closest('.s3files').find('.result input.successful-upload');

			// Create a formdata object and add the file
			var data = new FormData();
			$.each(postInput[0].files, function(i, file) {
				data.append('file-'+i, file);
			});

			$.ajax({
				url: postUrl,
				type: 'POST',
				data: data,
				cache: false,
				dataType: 'JSON',
				// This is screwing things up. Need to figure this jimmy-jam out.
				xhr: function() {
					var myXhr = $.ajaxSettings.xhr();

					if(myXhr.upload) { // check if upload property exists
						myXhr.upload.addEventListener('progress',this.progressHandling, false); // for handling the progress of the upload
					}

					return myXhr;
				},
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server its a query string request
				beforeSend: function(data) {
					fileInput.addClass('is-hidden'); // Hide file inputs
					progress.removeClass('is-hidden').addClass('is-visible'); // Show progress
				},
				success: function(data, textStatus, jqXHR)
				{
					if (typeof data.error === 'undefined')
					{
						// Success, so call function to process the form
						console.log(data.success);
						console.log('URL: ' + data.fullpath);
						progress.removeClass('uploading');
						progressFilename.html('Upload complete. <strong>' + data.filename +'</strong> was uploaded successfully.'); // Change uploading text to success
						progressBar.addClass('is-hidden'); //Hide progress bar when a file is succesfully uploaded.
						successfullUpload.val(data.fullpath);
					}
					else
					{
						// Handle errors here
						console.log('ERRORS: ' + data.error);
					}
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					// Handle Errors here
					console.log('ERRORS: ' + textStatus);
				}
			});

			s3upload.resetFormElement(postInput);

			console.log( 'Uploading...' + postInput.attr('id') );
		},

		// Progress Handling
		progressHandling: function( event ) {

			if(event.lengthComputable) {
				var progress = parseInt(event.loaded / event.total * 100, 10);
				console.log(progress + '%');
				$(this).closest('.s3files').find('progress').attr({value:event.loaded,max:event.total});
				$(this).closest('.s3files').find('.prc').html(progress + '%');
			}
		},

		// Reset File Input
		resetFormElement: function( element ) {

			element.wrap('<form>').parent('form').trigger('reset');
			element.unwrap();
		},

		// Remove File Reference
		removeFileReference: function( event ) {

			var successfullUpload = $(this).closest('.s3files').find('.result input.successful-upload');
			var filenameDisplay = $(this).closest('.s3files').find('.result .filename-display');

			event.preventDefault();
			successfullUpload.val(''); // Empty out hidden field w/ url
			filenameDisplay.html(''); // Empty display filename

		}
	}

	// Run it
	s3upload.init();

});