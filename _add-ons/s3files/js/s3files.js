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
		btnRemove: $('.btn-removal'),

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

			var input = $(this).closest('.s3files').find('.file-upload');
			var postUrl = $(this).closest('.s3files').find('.postUrl').val();

			// Create a formdata object and add the file
			var data = new FormData(files);

			s3upload.resetFormElement(input);

			console.log( 'Uploading...' + input.attr('id') );
		},

		// Progress Handling
		progressHandling: function( event ) {

			if(event.lengthComputable) {
				var progress = parseInt(event.loaded / event.total * 100, 10);
				console.log(progress + '%');
				$('progress').attr({value:event.loaded,max:event.total});
				$('.prc').html(progress + '%');
			}
		},

		// Reset File Input
		resetFormElement: function( element ) {

			element.wrap('<form>').parent('form').trigger('reset');
			element.unwrap();
		},

		// Remove File Reference
		removeFileReference: function( event ) {

			event.preventDefault();


		}
	}

	// Run it
	s3upload.init();

});