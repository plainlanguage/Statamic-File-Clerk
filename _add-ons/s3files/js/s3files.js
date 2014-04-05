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

			// Choose existing file
			$('body').on( 'click', '.load_existing', this.loadExisting );

			// Choose existing file
			$('body').on( 'dblclick', '.is-directory', this.loadExisting );

			// Breadcrumb
			$('body').on( 'click', '.breadcrumb a', this.loadExisting );

			// Highlight Row
			$('body').on( 'click', '.view-list td', this.highlightRow );

			// File Exists Options
			$('body').on( 'click', '.error-exists a', this.fileExists );
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
				add_file = $this.closest('.s3files').find('.s3-add-file'),
				uploadError = $this.closest('.s3files').find('.upload-error');

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
						// Upload was successful
						else if ( data.code === 100 )
						{

						}
						// Upload failed
						else if ( data.code === 200 )
						{

						}
						// File name already exists
						else if ( data.code === 300 )
						{
							console.log(data.message);
							uploadError.toggleClass('is-hidden is-visible').html(data.html); // Add is-visible class and show JSON html
							progressWrapper.toggleClass('is-visible is-hidden'); // Hide Progress Bar since there is an error
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
		},

		// Choose Existing
		loadExisting: function( event ) {

			event.preventDefault();

			var $this = $(this),
				listURL = '/TRIGGER/s3files/list' + ($(this).data('uri') ? '?uri=' + $(this).data('uri') : ''),
				viewList = $this.closest('.s3-add-file').find('.view-remote .view-list tbody'),
				breadcrumb = $this.closest('.s3-add-file').find('.view-remote .breadcrumb'),
				ajaxSpinner = $this.closest('.s3-add-file').find('.view-remote .view-list .ajax-spinner');
				ajaxOverlay = $this.closest('.s3-add-file').find('.view-remote .view-list .ajax-overlay');

			// Load Existing files
			$.ajax({
				url: listURL,
				type: 'GET',
				cache: false,
				dataType: 'json',
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
				beforeSend: function(data) {
					// Do stuff before sending. Loading Gif? (Chad, that's a soft `G`!) -- (Your mom is a soft 'G'. Love, Chad)
					ajaxSpinner.spin({
						lines: 10,
						length: 6,
						width: 2,
						radius: 6,
						corners: 0,
						hwaccel: true,
						top: '165px'
					}); // Start spinner
					ajaxOverlay.toggleClass('is-hidden is-visible');
				},
				success: function(data, textStatus, jqXHR)
				{
					if (data.error === false)
					{
						console.log(data.success);
						breadcrumb.html(data.breadcrumb);
						viewList.html(data.html);
						ajaxSpinner.spin(false); // Stop spinner
						ajaxOverlay.toggleClass('is-visible is-hidden');
					}
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					// Handle Errors here
					console.log('ERRORS: ' + textStatus);
				}
			});

		},

		highlightRow: function( event ) {

			var $this = $(this),
				highlight = 'is-highlighted';

			$this.closest('tr').siblings().removeClass(highlight);
			$this.parent('tr').toggleClass(highlight);

		},

		fileExists: function( event ) {

			var $this = $(this),
				actionAttr = $this.attr('data-action'),
				uploadError = $this.closest('.s3files').find('.upload-error'),
				errorExists = $this.closest('.s3files').find('.upload-error .error-exists'),
				fileWrapper = $this.closest('.s3files').find('.file-wrapper');

			// Clicked Replace
			if (actionAttr === 'replace') {
				console.log('Replace');
			}
			// Clicked Keep Both
			if (actionAttr === 'keep-both') {
				console.log('Keep Both');
			}
			// Clicked Cancel
			if (actionAttr === 'cancel') {
				console.log('Cancel');
				errorExists.remove(); // Remove error
				uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
				fileWrapper.toggleClass('is-hidden is-visible'); // Bring back the upload buttton
			}

			event.preventDefault();
		}

	};

	// Run it
	s3upload.init();

});
