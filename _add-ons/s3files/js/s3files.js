// The jQuery
$(function () {

	//  $$\   $$\           $$\                           $$\
	//  $$ |  $$ |          $$ |                          $$ |
	//  $$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$\   $$$$$$$ |
	//  $$ |  $$ |$$  __$$\ $$ |$$  __$$\  \____$$\ $$  __$$ |
	//  $$ |  $$ |$$ /  $$ |$$ |$$ /  $$ | $$$$$$$ |$$ /  $$ |
	//  $$ |  $$ |$$ |  $$ |$$ |$$ |  $$ |$$  __$$ |$$ |  $$ |
	//  \$$$$$$  |$$$$$$$  |$$ |\$$$$$$  |\$$$$$$$ |\$$$$$$$ |
	//   \______/ $$  ____/ \__| \______/  \_______| \_______|
	//            $$ |
	//            $$ |
	//            \__|

	var s3upload = {

		// Initialize
		init: function() {

			this.bindUIActions();
		},

		// Bind UI Actions
		bindUIActions: function() {

			// Upload new file
			$('body').on( 'change', '.file-upload', this.uploadFiles );

			// Remove file reference on click
			$('body').on( 'click', '.btn-remove', this.removeFileReference );
		},

		// Prepare Upload
		prepareUpload: function( event ) {

			var files = event.target.files,
				btnUpload = $(this).closest('.s3files').find('.btn-upload');

			btnUpload.removeClass('is-hidden');

			console.log(files);
		},

		// Upload Files
		uploadFiles: function( event ) {

			// event.stopPropagation(); // Stop stuff from happening
			// event.preventDefault(); // Really make sure stuff isn't happening

			var $this = $(this),
				fullPath = $this.val(),
				pathArray = fullPath.split('\\'),
				filename = pathArray[pathArray.length-1],
				uploadTab = $this.closest('.view-upload'),
				postUrl = uploadTab.find('.postUrl').val(),
				fileWrapper = uploadTab.find('.file-wrapper'),
				progressWrapper = uploadTab.find('.progress-bar'),
				progressBar = progressWrapper.find('progress'),
				progressPrc = progressWrapper.find('.prc'),
				uploadSuccess = $this.closest('.s3files').find('.result .filename-display'),
				successfullUpload = $this.closest('.s3files').find('.result input.successful-upload'),
				result_wrapper = $this.closest('.s3files').find('.result'),
				add_file = $this.closest('.s3files').find('.s3-add-file');

			// Do we have a file to work with?
			if( filename !== '' ) {

				// Create a formdata object and add the file
				var data = new FormData();

				$.each($this[0].files, function(i, file) {
					data.append('file-'+i, file);
				});

				// Try to upload file
				$.ajax({
					url: postUrl,
					type: 'POST',
					data: data,
					cache: false,
					dataType: 'JSON',
					// This is screwing things up. Need to figure this jimmy-jam out.
					xhr: function() {
						var myXhr = $.ajaxSettings.xhr();
						if(myXhr.upload) { // Check if upload property exists
							console.log('Xhr');
							myXhr.upload.addEventListener('progress', function(event) {
								if(event.lengthComputable) {
									var progress = parseInt(event.loaded / event.total * 100, 10);
									console.log(progress + '%');
									progressBar.attr({value:event.loaded,max:event.total});
									progressPrc.html(progress + '%');
								}
							}, false); // For handling the progress of the upload
						}
						return myXhr;
					},
					processData: false, // Don't process the files
					contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
					beforeSend: function(data) {
						fileWrapper.addClass('is-hidden'); // Hide file inputs
						progressWrapper.removeClass('is-hidden'); // Show progress
					},
					success: function(data, textStatus, jqXHR)
					{
						if (typeof data.error === 'undefined')
						{
							// Success, so call function to process the form
							console.log(data.success);
							console.log('URL: ' + data.fullpath);
							progressWrapper.addClass('is-hidden'); // Hide progress bar when a file is succesfully uploaded.
							uploadSuccess.append(data.filename); // Show filename on successful upload
							successfullUpload.val(data.fullpath); // Add full file path to hidden input
							add_file.toggleClass('is-visible is-hidden');
							setTimeout(function() {
								result_wrapper.toggleClass('is-hidden is-visible');
							}, 300);
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

				s3upload.resetFormElement($this);

				console.log( 'Uploading... ' + filename );

			}
		},

		// Reset File Input
		resetFormElement: function( element ) {

			element.wrap('<form>').parent('form').trigger('reset');
			element.unwrap();
		},

		// Remove File Reference
		removeFileReference: function( event ) {

			var $this = $(this),
				result_wrapper = $this.closest('.s3files').find('.result'),
				add_file = $this.closest('.s3files').find('.s3-add-file'),
				successful_upload = $this.closest('.s3files').find('.result input.successful-upload'),
				filename_display = $this.closest('.s3files').find('.result .filename-display');

			event.preventDefault();
			successful_upload.val(''); // Empty out hidden field w/ url
			filename_display.html(''); // Empty display filename
			result_wrapper.toggleClass('is-visible is-hidden');
			setTimeout(function() {
				add_file.toggleClass('is-hidden is-visible');
			}, 300);
		}
	};

	// Run it
	s3upload.init();

});
