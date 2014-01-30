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

	// Ref: http://abandon.ie/notebook/simple-file-uploads-using-jquery-ajax

	// Variable to store files
	var files;

	$('.s3files .fileupload').on('change', prepareUpload);

	function prepareUpload(event)
	{
		files = event.target.files;
		console.log(files);
		$('.do-upload').removeClass('is-hidden');
	}

	// Run uploadFiles on click
	$('.s3files .do-upload').click(uploadFiles);

	// Function - uploadFiles
	function uploadFiles(event)
	{
		event.stopPropagation(); // Stop stuff from happening
		event.preventDefault(); // Totally stop stuff from happening

		// Create a formdata object and add the file
		//var data = new FormData(files);
		var data = new FormData();
		$.each(files, function(key, value)
		{
			data.append(key, value);
		});

		$.ajax({
			url: $('.s3files .postUrl').val(),
			type: 'POST',
			data: data,
			cache: false,
			dataType: 'JSON',
			xhr: function() {
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload) { // check if upload property exists
					myXhr.upload.addEventListener('progress',progressHandling, false); // for handling the progress of the upload
				}
				return myXhr;
			},
			processData: false, // Don't process the files
			contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			beforeSend: function(data) {
				console.log(data);
				$('.fileinput').addClass('is-hidden'); // Hide file inputs
				$('.progress').removeClass('is-hidden').addClass('is-visible'); // Show progress
			},
			success: function(data, textStatus, jqXHR)
			{
				if (typeof data.error === 'undefined')
				{
					// Success, so call function to process the form
					//submitForm(event, data);
					console.log(data.success);
					console.log('URL: ' + data.fullpath);
					resetFormElement( $('.fileupload') ); // run the reset_form_element function to empty out the initial file upload so it doesn't run again on the actual form submit
					$('progress').removeClass('uploading');
					$('.progress-filename p').html('Upload complete. <strong>' + data.filename +'</strong> was uploaded successfully.'); // Change uploading text to success
					$('.progress-bar').addClass('is-hidden'); //Hide progress bar when a file is succesfully uploaded.
					$('.result input.successful-upload').val(data.fullpath);
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
				// STOP LOADING SPINNER
			}
		});
	}

	// Function - progressHandling
	function progressHandling(event){
		if(event.lengthComputable){
			var progress = parseInt(event.loaded / event.total * 100, 10);
			console.log(progress + '%');
			$('progress').attr({value:event.loaded,max:event.total});
			$('.prc').html(progress + '%');
		}
	}

	// Funciton - resetFormElement
	function resetFormElement (event) {
		event.wrap('<form>').parent('form').trigger('reset');
		event.unwrap();
	}

	// Funciton - removeFileReference
	function removeFileReference (event) {
		event.preventDefault();
		$('#successful-upload').val(''); // Empty out hidden field w/ url
		$('.filename-display').html(''); // Empty display filename
	}

	$('.btn-remove-s3file').click(removeFileReference);

});