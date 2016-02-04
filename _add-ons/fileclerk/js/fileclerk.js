$.fn.toggleAttr = function(attr, bool) {
	if (bool) {
		return this.attr(attr, attr);
	}
	if (typeof bool !== 'undefined') {
		return this.removeAttr(attr);
	}
	return this.each(function() {
		var $e = $(this);
		if (typeof $e.attr(attr) === 'undefined') {
			$e.attr(attr, attr);
		} else {
			$e.removeAttr(attr);
		}
	});
};

// The jQuery
$(function () {

	//   $$$$$$\            $$\                                    $$$$$$\             $$\     $$\
	//  $$  __$$\           \__|                                  $$  __$$\            $$ |    \__|
	//  $$ /  \__| $$$$$$\  $$\ $$$$$$$\      $$\  $$$$$$$\       $$ /  $$ | $$$$$$\ $$$$$$\   $$\  $$$$$$\  $$$$$$$\   $$$$$$$\
	//  \$$$$$$\  $$  __$$\ $$ |$$  __$$\     \__|$$  _____|      $$ |  $$ |$$  __$$\\_$$  _|  $$ |$$  __$$\ $$  __$$\ $$  _____|
	//   \____$$\ $$ /  $$ |$$ |$$ |  $$ |    $$\ \$$$$$$\        $$ |  $$ |$$ /  $$ | $$ |    $$ |$$ /  $$ |$$ |  $$ |\$$$$$$\
	//  $$\   $$ |$$ |  $$ |$$ |$$ |  $$ |    $$ | \____$$\       $$ |  $$ |$$ |  $$ | $$ |$$\ $$ |$$ |  $$ |$$ |  $$ | \____$$\
	//  \$$$$$$  |$$$$$$$  |$$ |$$ |  $$ |$$\ $$ |$$$$$$$  |       $$$$$$  |$$$$$$$  | \$$$$  |$$ |\$$$$$$  |$$ |  $$ |$$$$$$$  |
	//   \______/ $$  ____/ \__|\__|  \__|\__|$$ |\_______/        \______/ $$  ____/   \____/ \__| \______/ \__|  \__|\_______/
	//            $$ |                  $$\   $$ |                          $$ |
	//            $$ |                  \$$$$$$  |                          $$ |
	//            \__|                   \______/                           \__|

	var spinJsOpts = {
		lines: 13,
		length: 6,
		width: 2,
		radius: 6,
		corners: 1,
		hwaccel: true
	}

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

			// Open directory
			$('body').on( 'doubletap', '.is-directory', this.loadExisting );

			// Breadcrumb
			$('body').on( 'click', '.breadcrumb a, .error-no-results a[data-uri]', this.loadExisting );

			// Highlight Row
			$('body').on( 'tap', '.view-list td', this.highlightRow );

			// Prevent Highlight Row if preview link is clicked
			$('body').on( 'tap', '.view-list td a', this.preventHighlightRow );

			// Select file
			$('body').on( 'click', '[data-action="select_file"]', this.selectFile );

			// Switch back to Upload New tab
			$('body').on( 'click', '[data-action="go-back"]', this.goBack );

			// File Exists Options
			//$('body').on( 'click', '.error-exists a', this.fileExists );
		},

		// Prepare Upload
		prepareUpload: function( event ) {

			var files = event.target.files,
				btnUpload = $(this).closest('.fileclerk').find('.btn-upload');

			btnUpload.removeClass('is-hidden');

			console.log(files);
		},

		fileCheck: function( destination, filename ) {

			$.ajax({
				url: _site_root + 'TRIGGER/fileclerk/filecheck',
				type: 'GET',
				data: {'destination': destination, 'filename': filename},
				cache: false,
				dataType: 'JSON',
				processData: true,
				contentType: false,
				success: function( data, textStatus, jqXHR )
				{
					if( data.code === 700 )
					{

					}
					else if( data.code === 300 )
					{
						console.log(data);
						return data.error;
					}
				},
				error: function( data, textStatus, errorThrown )
				{
					return false;
				}
			});

		},

		// Upload Files
		uploadFiles: function( event ) {

			event.preventDefault();

			var $this = $(this),
				fileclerk 			= $this.closest('.fileclerk'),
				fullPath            = $this.val(),
				pathArray           = fullPath.split('\\'),
				filename            = pathArray[pathArray.length-1],
				uploadTab           = $this.closest('.view-upload'),
				postUrl             = uploadTab.find('.postUrl').val(),
				destination         = uploadTab.find('.postUrl').data('destination'),
				fileWrapper         = uploadTab.find('.file-wrapper'),
				progressWrapper     = uploadTab.find('.progress-bar'),
				progressBar         = progressWrapper.find('progress'),
				progressPrc         = progressWrapper.find('.prc'),
				uploadSuccess       = fileclerk.find('.result .filename-display .filename'),
				successfullUpload   = fileclerk.find('.result input.successful-upload'),
				result_wrapper      = fileclerk.find('.result'),
				addFile             = fileclerk.find('.add-file'),
				chooseExistingTab   = addFile.find('.nav-tabs li:nth-child(2) a'),
				uploadError         = fileclerk.find('.upload-error'),
				uploadPreview		= fileclerk.find('.preview'),
				uploadPreviewImg	= fileclerk.find('.inline-preview .load img'),
				// Set some hidden inputs up in this thang.
				hiddenUrl           = fileclerk.find('.result input.hidden-url'),
				hiddenFilename      = fileclerk.find('.result input.hidden-filename'),
				hiddenExtension     = fileclerk.find('.result input.hidden-extension'),
				hiddenSize          = fileclerk.find('.result input.hidden-size'),
				hiddenSizeBytes     = fileclerk.find('.result input.hidden-size-bytes'),
				hiddenSizeKilobytes = fileclerk.find('.result input.hidden-size-kilobytes'),
				hiddenSizeMegabytes = fileclerk.find('.result input.hidden-size-megabytes'),
				hiddenSizeGigabytes = fileclerk.find('.result input.hidden-size-gigabytes'),
				//hiddenMimeType      = fileclerk.find('.result input.hidden-mime-type'),
				hiddenIsImage       = fileclerk.find('.result input.hidden-is-image')
			;

			// Do we have a file to work with?
			if( filename !== '' ) {

				// Create a formdata object and add the file
				var data = new FormData();

				$.each($this[0].files, function(i, file) {
					data.append('file-'+i, file);
				});

				// Try to upload file
				 var tryUpload = function( overwrite )
				 {
				 	if( typeof overwrite !== 'undefined' )
				 	{
				 		postUrl = postUrl + '&overwrite=' + overwrite;
				 	}

					 $.ajax({
						url: postUrl,
						type: 'POST',
						data: data,
						cache: false,
						dataType: 'JSON',
						xhr: function() {
							// get the native XmlHttpRequest object
							var xhr = $.ajaxSettings.xhr() ;
							// set the onprogress event handler
							xhr.upload.onprogress = function(event){
								var progress = parseInt(event.loaded / event.total * 100);
								console.log('Uploading: ', event.loaded/event.total*100 + '%')
								progressBar.attr({value:event.loaded,max:event.total});
								progressPrc.html(progress + '%');
							};
							// set the onload event handler
							xhr.upload.onload = function(){
								console.log('DONE!')
							};
							// return the customized object
							return xhr ;
						},
						processData: false, // Don't process the files
						contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
						beforeSend: function(data) {
							fileWrapper.removeClass('is-visible').addClass('is-hidden'); // Hide file inputs
							progressWrapper.toggleClass('is-hidden is-visible'); // Show progress
						},
						success: function(data, textStatus, jqXHR)
						{
							// Upload was successful
							if ( data.code === 100 )
							{
								// Success, so call function to process the form
								console.log(data.success);
								console.log('URL: ' + data.data.fullpath);
								progressWrapper.toggleClass('is-visible is-hidden'); // Hide progress bar when a file is succesfully uploaded.
								uploadSuccess.append(data.data.filename); // Show filename on successful upload
								successfullUpload.val(data.data .fullpath); // Add full file path to hidden input
								uploadSuccess.attr('href', data.data.fullpath);
								addFile.toggleClass('is-visible is-hidden'); // Hide Add File
								result_wrapper.toggleClass('is-hidden is-visible');
								fileclerk.addClass('yay'); // Add a 'yay' class to .filewrapper
								uploadPreview.removeClass('is-hidden').addClass('is-visible'); // Show 'preview' icon

								// Populate hidden fields, which stores field data
								hiddenUrl.val(data.data.fullpath);
								hiddenFilename.val(data.data.filename);
								hiddenExtension.val(data.data.extension);
								hiddenSize.val(data.data.size);
								hiddenSizeBytes.val(data.data.size_bytes);
								hiddenSizeKilobytes.val(data.data.size_kilobytes);
								hiddenSizeMegabytes.val(data.data.size_megabytes);
								hiddenSizeGigabytes.val(data.data.size_gigabytes);
								hiddenIsImage.val(data.data.is_image);
								//hiddenMimeType.val(data.data.mime_type);

								// Update Live Preview URL and Rel
								uploadPreview.attr('href', data.data.fullpath); // Update URL
								uploadPreviewImg.attr('src', ''); // Empty img src tag if content already exists

								if( hiddenIsImage.val() === 'true' || hiddenIsImage.val() === '1' )
								{
									uploadPreview.unbind();
									uploadPreview.attr('rel', 'inline'); // rel='inline' if mime type is image
								}
								else
								{
									uploadPreview.unbind();
									uploadPreview.attr('rel', 'external'); // rel='external' if mime type is not image
								}
							}
							// Upload failed
							else if ( data.code === 200 )
							{
								// data.message contains the error message returned by AWS.
							}
							// File name already exists
							else if ( data.code === 300 )
							{
								console.log(data.message);
								uploadError.toggleClass('is-hidden is-visible').html(data.html); // Add is-visible class and show JSON html
								progressWrapper.toggleClass('is-visible is-hidden'); // Hide Progress Bar since there is an error

								$this.closest('.fileclerk').find('.upload-error .error-exists a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');

									// Clicked Replace
									if (actionAttr === 'replace') {
										console.log('Replace');
										tryUpload(true);
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
									}
									// Clicked Keep Both
									if (actionAttr === 'keep-both') {
										console.log('Keep Both');
										tryUpload(false);
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
									}
									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
										fileWrapper.removeClass('is-hidden').addClass('is-visible'); // Bring back the upload buttton
									}

									event.preventDefault();
								});
							}
							// Disallowed Filetype
							else if ( data.code === 700 )
							{

								console.log(data.message);
								uploadError.toggleClass('is-hidden is-visible').html(data.html); // Add is-visible class and show JSON html
								progressWrapper.toggleClass('is-visible is-hidden'); // Hide Progress Bar since there is an error

								$this.closest('.fileclerk').find('.upload-error .error-not-allowed a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');

									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
										fileWrapper.toggleClass('is-hidden is-visible'); // Bring back the upload buttton
									}

									event.preventDefault();
								});
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
				}

				var doFileCheck = function() {
					$.ajax({
						url: _site_root + 'TRIGGER/fileclerk/filecheck',
						type: 'GET',
						data: {'destination': destination, 'filename': filename},
						cache: false,
						dataType: 'JSON',
						processData: true,
						contentType: false,
						async: false,
						beforeSend: function(data) {

						},
						success: function( data, textStatus, jqXHR )
						{
							if( data.code === 300 )
							{
								event.preventDefault();

								console.log(data);
								console.log(data.message);

								fileWrapper.toggleClass('is-visible is-hidden');
								uploadError.toggleClass('is-hidden is-visible').html(data.html); // Add is-visible class and show JSON html
								chooseExistingTab.removeAttr('data-toggle').addClass('disabled'); // Disable Choose Existing tab

								$this.closest('.fileclerk').find('.upload-error .error-exists a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');
									console.log(actionAttr);

									// Clicked Replace
									if (actionAttr === 'replace') {
										console.log('Replace');
										tryUpload(true);
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
									}
									// Clicked Keep Both
									if (actionAttr === 'keep-both') {
										console.log('Keep Both');
										tryUpload(false);
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
									}
									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
										fileWrapper.toggleClass('is-hidden is-visible'); // Bring back the upload buttton
									}

									chooseExistingTab.attr('data-toggle', 'tab').removeClass('disabled'); // Enable Choose Existing tab

									event.preventDefault();
								});
							}
							else if( data.code === 700 )
							{
								console.log(data.message);
								fileWrapper.removeClass('is-visible').addClass('is-hidden'); // Hide file inputs
								uploadError.toggleClass('is-hidden is-visible').html(data.html); // Add is-visible class and show JSON html

								$this.closest('.fileclerk').find('.upload-error .error-not-allowed a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');

									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden'); // Hide error holder
										fileWrapper.toggleClass('is-hidden is-visible'); // Bring back the upload buttton
									}

									event.preventDefault();
								});
							}
							else if( data.code === 800 ) // File is clean!
							{
								tryUpload(false);
							}
						},
						error: function( data, textStatus, errorThrown )
						{
							console.log(errorThrown.stack);
							return false;
						}
					});
				}

				// Check for file existence first
				doFileCheck();

				// Probably don't need this any longer.
				// Try the upload
				//tryUpload();

				// Form reset
				s3upload.resetFormElement($this);

				// Probably move this elsewhere.
				//console.log( 'Uploading... ' + filename );
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
				fileClerkWrapper = $this.closest('.fileclerk'),
				result_wrapper = $this.closest('.fileclerk').find('.result'),
				addFile = $this.closest('.fileclerk').find('.add-file'),
				successful_upload = $this.closest('.fileclerk').find('.result input.successful-upload'),
				hiddenValues = $this.closest('.fileclerk').find('.result input[type="hidden"]'),
				filename_display = $this.closest('.fileclerk').find('.result .filename-display .filename'),
				fileWrapper = $this.closest('.fileclerk').find('.file-wrapper')
			;

			event.preventDefault();
			successful_upload.val(''); // Empty out hidden field w/ url
			hiddenValues.val(''); // Empty out hidden field w/ url
			filename_display.html(''); // Empty display filename
			result_wrapper.toggleClass('is-visible is-hidden');
			setTimeout(function() {
				addFile.toggleClass('is-hidden is-visible');
				fileWrapper.removeClass('is-hidden').addClass('is-visible'); // Show the upload button again
				fileClerkWrapper.removeClass('yay'); // Remove the 'yay' class
			}, 300);
		},

		// Choose Existing
		loadExisting: function( event ) {

			event.preventDefault();

			var $this = $(this),
				listURL = _site_root + 'TRIGGER/fileclerk/list' + ($(this).data('uri') ? '?uri=' + $(this).data('uri') : '') + ($(this).data('uri') ? '&' : '?') + ($(this).data('destination') ? 'destination=' + $(this).data('destination') : ''),
				viewList = $this.closest('.add-file').find('.view-remote .view-list'),
				viewListTable = viewList.find('table'),
				viewListTableBody = viewList.find('tbody'),
				errorNoResults = viewList.find('.error-no-results'),
				breadcrumb = $this.closest('.add-file').find('.view-remote .breadcrumb'),
				ajaxSpinner = $this.closest('.add-file').find('.view-remote .ajax-spinner'),
				ajaxOverlay = $this.closest('.add-file').find('.view-remote .ajax-overlay')
			;

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
					ajaxSpinner.spin(spinJsOpts); // Start spinner
					ajaxOverlay.toggleClass('is-hidden is-visible');
				},
				success: function(data, textStatus, jqXHR)
				{
					// List returned
					if( data.code === 400 || data.error === false )
					{
						console.log(data.success);
						errorNoResults.remove();
						breadcrumb.html(data.breadcrumb);
						viewListTable.removeClass('is-hidden');
						viewListTableBody.html(data.html);
						ajaxSpinner.spin(false); // Stop spinner
						ajaxOverlay.toggleClass('is-visible is-hidden');
					}
					// No results
					else if( data.code === 500 )
					{
						breadcrumb.html(data.breadcrumb);
						errorNoResults.remove();
						$(data.html).prependTo(viewList);
						viewListTable.addClass('is-hidden');
						viewListTableBody.empty(); // Empty out tbody cause the height will get cray
						ajaxSpinner.spin(false); // Stop spinner
						ajaxOverlay.toggleClass('is-visible is-hidden');
					}
					// List error
					else if( data.code === 600 )
					{

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
				highlight = 'is-highlighted',
				siblings = $this.closest('tr').siblings(),
				parent = $this.parent('tr'),
				rows = $this.closest('tbody').find('tr'),
				selectBtn = $this.closest('.view-remote').find('button[data-action="select_file"]')
			;

			siblings.removeClass(highlight);
			parent.toggleClass(highlight);

			if (rows.hasClass(highlight) && !parent.hasClass('directory')) {
				selectBtn.prop( "disabled", false );
			} else {
				selectBtn.prop( "disabled", true );
			}

		},

		preventHighlightRow: function(event) {
			event.stopPropagation();
		},

		selectFile: function( event ) {

			event.preventDefault();

			var $this = $(this),
				fileclerk           = $this.closest('.fileclerk'),
				viewremote          = $this.closest('.view-remote'),
				fullPath            = viewremote.find('.view-list table tr.file.is-highlighted').data('file'),
				filename            = viewremote.find('.view-list table tr.file.is-highlighted td.is-file .filename').html(),
				extension           = viewremote.find('.view-list table tr.file.is-highlighted').data('extension'),
				isImage             = viewremote.find('.view-list table tr.file.is-highlighted').data('is-image'),
				//mimeType            = viewremote.find('.view-list table tr.file.is-highlighted').data('mime-type'),
				size                = viewremote.find('.view-list table tr.file.is-highlighted').data('size'),
				sizeBytes           = viewremote.find('.view-list table tr.file.is-highlighted').data('size-bytes'),
				sizeKilobytes       = viewremote.find('.view-list table tr.file.is-highlighted').data('size-kilobytes'),
				sizeMegabytes       = viewremote.find('.view-list table tr.file.is-highlighted').data('size-megabytes'),
				sizeGigabytes       = viewremote.find('.view-list table tr.file.is-highlighted').data('size-gigabytes'),
				uploadSuccess       = fileclerk.find('.result .filename-display .filename'),
				successfullUpload   = fileclerk.find('.result input.successful-upload'),
				result_wrapper      = fileclerk.find('.result'),
				addFile             = fileclerk.find('.add-file'),
				uploadPreview       = fileclerk.find('.preview'),
				uploadPreviewImg	= fileclerk.find('.inline-preview .load img'),
				//uploadError       = fileclerk.find('.upload-error'),
				hiddenUrl           = fileclerk.find('.result input.hidden-url'),
				hiddenFilename      = fileclerk.find('.result input.hidden-filename'),
				hiddenExtension     = fileclerk.find('.result input.hidden-extension'),
				hiddenSize          = fileclerk.find('.result input.hidden-size'),
				hiddenSizeBytes     = fileclerk.find('.result input.hidden-size-bytes'),
				hiddenSizeKilobytes = fileclerk.find('.result input.hidden-size-kilobytes'),
				hiddenSizeMegabytes = fileclerk.find('.result input.hidden-size-megabytes'),
				hiddenSizeGigabytes = fileclerk.find('.result input.hidden-size-gigabytes'),
				//hiddenMimeType      = fileclerk.find('.result input.hidden-mime-type'),
				hiddenIsImage       = fileclerk.find('.result input.hidden-is-image')
			;

			uploadSuccess.append(filename); // Show filename on successful upload
			successfullUpload.val(fullPath); // Add full file path to hidden input
			hiddenUrl.val(fullPath);
			hiddenFilename.val(filename);
			hiddenExtension.val(extension);
			hiddenIsImage.val(isImage);
			//hiddenMimeType.val(mimeType);
			hiddenSize.val(size);
			hiddenSizeBytes.val(sizeBytes);
			hiddenSizeKilobytes.val(sizeKilobytes);
			hiddenSizeMegabytes.val(sizeMegabytes);
			hiddenSizeGigabytes.val(sizeGigabytes);
			uploadSuccess.attr('href', fullPath);
			uploadPreview.removeClass('is-hidden').addClass('is-visible');
			addFile.toggleClass('is-visible is-hidden');
			result_wrapper.toggleClass('is-hidden is-visible');
			fileclerk.addClass('yay'); // Add a 'yay' class to .filewrapper

			// Update Live Preview URL and Rel
			uploadPreview.attr('href', fullPath); // Update URL
			uploadPreviewImg.attr('src', ''); // Empty img src tag if content already exists

			if( hiddenIsImage.val() === 'true' || hiddenIsImage.val() === '1' )
			{
				uploadPreview.unbind();
				uploadPreview.attr('rel', 'inline'); // rel='inline' if mime type is image
			}
			else
			{
				uploadPreview.unbind();
				uploadPreview.attr('rel', 'external'); // rel='external' if mime type is not image
			}

			console.log(filename + ' selected');

		},

		fileExists: function( event ) {

			var $this = $(this),
				actionAttr = $this.attr('data-action'),
				uploadError = $this.closest('.fileclerk').find('.upload-error'),
				errorExists = $this.closest('.fileclerk').find('.upload-error .error-exists'),
				fileWrapper = $this.closest('.fileclerk').find('.file-wrapper')
			;

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
		},

		goBack: function( event ) {

			var $this = $(this),
				errorNoResults = $this.closest('.error-no-results'),
				uploadNewTab = $this.closest('.fileclerk').find('.nav-tabs li:nth-child(1) a').attr('href')
			;

			$('a[href="' + uploadNewTab + '"]').tab('show');
			errorNoResults.remove();

			event.preventDefault();
		}

	};

	// Run it
	s3upload.init();


	// $$$$$$$$\        $$\       $$\                  $$$$$$\                       $$\
	// \__$$  __|       $$ |      $$ |                $$  __$$\                      $$ |
	//    $$ | $$$$$$\  $$$$$$$\  $$ | $$$$$$\        $$ /  \__| $$$$$$\   $$$$$$\ $$$$$$\    $$$$$$\   $$$$$$\
	//    $$ | \____$$\ $$  __$$\ $$ |$$  __$$\       \$$$$$$\  $$  __$$\ $$  __$$\\_$$  _|  $$  __$$\ $$  __$$\
	//    $$ | $$$$$$$ |$$ |  $$ |$$ |$$$$$$$$ |       \____$$\ $$ /  $$ |$$ |  \__| $$ |    $$$$$$$$ |$$ |  \__|
	//    $$ |$$  __$$ |$$ |  $$ |$$ |$$   ____|      $$\   $$ |$$ |  $$ |$$ |       $$ |$$\ $$   ____|$$ |
	//    $$ |\$$$$$$$ |$$$$$$$  |$$ |\$$$$$$$\       \$$$$$$  |\$$$$$$  |$$ |       \$$$$  |\$$$$$$$\ $$ |
	//    \__| \_______|\_______/ \__| \_______|       \______/  \______/ \__|        \____/  \_______|\__|

	var dateFromString = function(str){
		var pattern = "^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{2,4})\\s*(\\d{1,2}):(\\d{1,2})\\s*(am|pm|AM|PM|Am|Pm)$";
		var re = new RegExp(pattern);

		if (re.test(str)) {
			var dateParts = re.exec(str).slice(1);
			var month = dateParts[0];
			var day = dateParts[1];
			var year = dateParts[2];
			var hour = dateParts[3];
			var minutes = dateParts[4];
			var ampm = dateParts[5];
			var dateString = month + ' ' + day + ' ' + year + ' ' + hour + ':' + minutes + ':' + '00 ' + ampm;
			return new Date(dateString);
		} else {
			return false;
		}
	}

	var fileSize = function (str) {
		var parts = str.split(" "),
			size = parts[0].replace(/,/g, ""),
			unit = parts[1],
			x_unit = 8;

		if (unit === "KB") {
			x_unit = 1024;
		} else if (unit === "MB") {
			x_unit = 1048576;
		} else if (unit === "GB") {
			x_unit = 1073741824;
		}

		return parseInt( size * x_unit, 10 );
	}

	$(".tablesort").stupidtable({
		"date":function(a,b){
			var aDate = dateFromString(a);
			var bDate = dateFromString(b);

			return aDate - bDate;
		},
		"size":function(a,b){
			var aSize = fileSize(a);
			var bSize = fileSize(b);

			return aSize - bSize;
		}
	});

	//  $$$$$$\           $$\ $$\                           $$$$$$$\                                $$\
	//  \_$$  _|          $$ |\__|                          $$  __$$\                               \__|
	//    $$ |  $$$$$$$\  $$ |$$\ $$$$$$$\   $$$$$$\        $$ |  $$ | $$$$$$\   $$$$$$\ $$\    $$\ $$\  $$$$$$\  $$\  $$\  $$\
	//    $$ |  $$  __$$\ $$ |$$ |$$  __$$\ $$  __$$\       $$$$$$$  |$$  __$$\ $$  __$$\\$$\  $$  |$$ |$$  __$$\ $$ | $$ | $$ |
	//    $$ |  $$ |  $$ |$$ |$$ |$$ |  $$ |$$$$$$$$ |      $$  ____/ $$ |  \__|$$$$$$$$ |\$$\$$  / $$ |$$$$$$$$ |$$ | $$ | $$ |
	//    $$ |  $$ |  $$ |$$ |$$ |$$ |  $$ |$$   ____|      $$ |      $$ |      $$   ____| \$$$  /  $$ |$$   ____|$$ | $$ | $$ |
	//  $$$$$$\ $$ |  $$ |$$ |$$ |$$ |  $$ |\$$$$$$$\       $$ |      $$ |      \$$$$$$$\   \$  /   $$ |\$$$$$$$\ \$$$$$\$$$$  |
	//  \______|\__|  \__|\__|\__|\__|  \__| \_______|      \__|      \__|       \_______|   \_/    \__| \_______| \_____\____/
	//
	//
	//
	// For the inline, "tooltip" image previews

	var inlinePreview = {

		// Initialize
		init: function() {

			this.bindUIActions();
		},

		bindUIActions: function() {

			// Show Modal
			$('body').on( 'click', '.fileclerk a.preview[rel="inline"]', this.showInlinePreview );

			// Hide Modal
			$('body').on( 'click', '.fileclerk .inline-preview .modal-close', this.hideInlinePreview );

			// Hide modal on esc key hit
			$(document).keyup( function(event) {
				if(event.keyCode === 27)
				{
					var all_modals = $('.fileclerk .inline-preview');
					var preview_button = $('.fileclerk .preview');
					var ajaxOverlay = $('.fileclerk .view-remote .ajax-overlay.is-visible');
					var modalImg = $('.fileclerk').find('.inline-preview.is-visible .load'); // The preview modal image

					all_modals.removeClass('is-visible').addClass('is-hidden');
					preview_button.removeClass('active');
					ajaxOverlay.toggleClass('is-visible is-hidden');
					modalImg.html(''); // Empty image
				}
			});

			// Hide inline previews when clicking outside of modal
			$(document).on('click', function(event) {
				if(!$(event.target).closest('.fileclerk .inline-preview').length)
				{
					var all_modals = $('.fileclerk .inline-preview');
					var preview_button = $('.fileclerk .preview');
					var ajaxOverlay = $(event.target).closest('.fileclerk .view-remote .ajax-overlay.is-visible');
					var modalImg = $('.fileclerk').find('.inline-preview.is-visible .load'); // The preview modal image

					all_modals.removeClass('is-visible').addClass('is-hidden');
					preview_button.removeClass('active');
					ajaxOverlay.toggleClass('is-visible is-hidden');
					modalImg.html(''); // Empty image
				}
			});
		},

		showInlinePreview: function(event) {

			var $this = $(this),
				externalUrl               = $this.attr('href'),
				all_modals                = $('.fileclerk .inline-preview'),
				all_preview_buttons       = $('.fileclerk .result .preview'),
				page                      = $('html, body'),
				// Is Selected modal stuff
				isSelectedFileClerk       = $this.closest('.fileclerk'),
				isSelectedLoadAJAX        = isSelectedFileClerk.find('.inline-preview .load'),
				isSelectedModal           = isSelectedFileClerk.find('.result .inline-preview'),
				isSelectedAjaxSpinner     = isSelectedFileClerk.find('.inline-preview .load .ajax-spinner'),
				// Choose Existing modal stuff
				chooseExistingFileClerk   = $this.closest('tr.file'),
				chooseExistingLoadAJAX    = $('.fileclerk').find('.view-remote .inline-preview .load'),
				chooseExistingModal       = $('.fileclerk').find('.view-remote .inline-preview'),
				chooseExistingAjaxSpinner = chooseExistingFileClerk.find('.inline-preview .load .ajax-spinner'),
				chooseExistingContainer   = $this.closest('.fileclerk').find('table.tablesort'),
				chooseExistingAjaxOverlay = $this.closest('.fileclerk').find('.view-remote .ajax-overlay')
			;

			all_modals.removeClass('is-visible').addClass('is-hidden'); // Hide all open modals if you open a new one
			all_preview_buttons.removeClass('active');

			// -----------------------------------------------------------------------
			// Is Selected
			// Preview for a selected file
			// -----------------------------------------------------------------------

			if ($this.hasClass('preview--is-selected')) {

				isSelectedModal.toggleClass('is-hidden is-visible'); // Show Modal
				$this.addClass('active');
				page.animate({
					scrollTop: isSelectedModal.offset().top - 20
				}, 500);

				// Get external image
				$.ajax({
					url: _site_root + 'TRIGGER/fileclerk/ajaxpreview?url=' + externalUrl,
					cache: false,
					dataType: 'JSON', // JSON
					beforeSend: function(data) {
						isSelectedAjaxSpinner.spin(spinJsOpts); // Start spinner
					},
					success: function(data) {
						isSelectedLoadAJAX.html('<img src="' + data.url + '">');
						console.log(data);
						isSelectedAjaxSpinner.spin(false); // Stop spinner
					}
				});
			}

			// -----------------------------------------------------------------------
			// Choose Existing
			// Preview for the Choose Existing view
			// -----------------------------------------------------------------------

			if ($this.hasClass('preview--choose-existing')) {

				chooseExistingModal.toggleClass('is-hidden is-visible'); // Show Modal
				$this.addClass('active');
				chooseExistingContainer.animate({
					scrollTop: chooseExistingModal.offset().top - 20
				}, 500);

				// Get external image
				$.ajax({
					url: _site_root + 'TRIGGER/fileclerk/ajaxpreview?url=' + externalUrl,
					cache: false,
					dataType: 'JSON', // JSON
					beforeSend: function(data) {
						chooseExistingAjaxSpinner.spin(spinJsOpts); // Start spinner
						chooseExistingAjaxOverlay.toggleClass('is-hidden is-visible'); // Show overlay
					},
					success: function(data) {
						chooseExistingLoadAJAX.html('<img src="' + data.url + '">');
						console.log(data);
						chooseExistingAjaxSpinner.spin(false); // Stop spinner
					}
				});
			}

			event.preventDefault();
			event.stopPropagation();
		},

		hideInlinePreview: function(event) {
			var $this = $(this),
				fileclerk = $this.closest('.fileclerk'),
				modal = fileclerk.find('.inline-preview.is-visible'), // Find the modal that is visible
				modalImg = fileclerk.find('.inline-preview.is-visible .load'), // The preview modal image
				previewButton = fileclerk.find('.preview.active'),
				ajaxOverlay = fileclerk.find('.view-remote .ajax-overlay')
			;

			modal.toggleClass('is-visible is-hidden'); // Hide Modal
			modalImg.html(''); // Empty image src
			previewButton.removeClass('active');
			ajaxOverlay.toggleClass('is-visible is-hidden');

			event.preventDefault();
			event.stopPropagation();
		}
	}

	inlinePreview.init();

	//  $$$$$$$$\             $$\                                             $$\       $$$$$$$\                                $$\
	//  $$  _____|            $$ |                                            $$ |      $$  __$$\                               \__|
	//  $$ |      $$\   $$\ $$$$$$\    $$$$$$\   $$$$$$\  $$$$$$$\   $$$$$$\  $$ |      $$ |  $$ | $$$$$$\   $$$$$$\ $$\    $$\ $$\  $$$$$$\  $$\  $$\  $$\
	//  $$$$$\    \$$\ $$  |\_$$  _|  $$  __$$\ $$  __$$\ $$  __$$\  \____$$\ $$ |      $$$$$$$  |$$  __$$\ $$  __$$\\$$\  $$  |$$ |$$  __$$\ $$ | $$ | $$ |
	//  $$  __|    \$$$$  /   $$ |    $$$$$$$$ |$$ |  \__|$$ |  $$ | $$$$$$$ |$$ |      $$  ____/ $$ |  \__|$$$$$$$$ |\$$\$$  / $$ |$$$$$$$$ |$$ | $$ | $$ |
	//  $$ |       $$  $$<    $$ |$$\ $$   ____|$$ |      $$ |  $$ |$$  __$$ |$$ |      $$ |      $$ |      $$   ____| \$$$  /  $$ |$$   ____|$$ | $$ | $$ |
	//  $$$$$$$$\ $$  /\$$\   \$$$$  |\$$$$$$$\ $$ |      $$ |  $$ |\$$$$$$$ |$$ |      $$ |      $$ |      \$$$$$$$\   \$  /   $$ |\$$$$$$$\ \$$$$$\$$$$  |
	//  \________|\__/  \__|   \____/  \_______|\__|      \__|  \__| \_______|\__|      \__|      \__|       \_______|   \_/    \__| \_______| \_____\____/
	//
	//
	//

	var externalPreview = {

		// Initialize
		init: function() {

			this.bindUIActions();
		},

		bindUIActions: function() {

			// External Preview
			$('body').on('click', '.fileclerk a[rel="external"]', this.previewExternal );
		},

		// Open non-image links in new tab
		previewExternal: function( event ) {

			event.preventDefault();
			event.stopPropagation();
			window.open(this.href, '_blank');
		}
	}

	externalPreview.init();

	//  $$$$$$$$\        $$\
	//  \__$$  __|       $$ |
	//     $$ | $$$$$$\  $$$$$$$\   $$$$$$$\
	//     $$ | \____$$\ $$  __$$\ $$  _____|
	//     $$ | $$$$$$$ |$$ |  $$ |\$$$$$$\
	//     $$ |$$  __$$ |$$ |  $$ | \____$$\
	//     $$ |\$$$$$$$ |$$$$$$$  |$$$$$$$  |
	//     \__| \_______|\_______/ \_______/
	//
	//
	//
	// Rolling our own tabs because that's how we party.

	var tabs = {

		// Initialize
		init: function() {

			this.bindUIActions();
		},

		bindUIActions: function() {

			// Show Upload Container
			$('body').on('click', '.fileclerk .nav-tabs a[data-tab="nav-upload"]', this.showUploadContainer );

			// Show Choose Container
			$('body').on('click', '.fileclerk .nav-tabs a[data-tab="nav-choose"]', this.showChooseContainer );
		},

		// Show Upload Container
		showUploadContainer: function( event ) {
			var $this = $(this),
				fileclerk = $this.closest('.fileclerk'),
				tabNav = fileclerk.find('.nav-tabs li'),
				activeNav = $this.parent('li'),
				tabPane = fileclerk.find('.tab-pane'),
				uploadContainer = fileclerk.find('.tab-pane.view-upload')
			;

			// Remove active class on all tab nav
			tabNav.removeClass('active');
			// Add active class to clicked nav
			activeNav.addClass('active');
			// Remove active class on all tab panes
			tabPane.removeClass('active');
			// Add active class to the upload pane
			uploadContainer.addClass('active fade in');

			event.preventDefault();
			event.stopPropagation();
		},

		// Show Choose Container
		showChooseContainer: function( event ) {
			var $this = $(this),
				fileclerk = $this.closest('.fileclerk'),
				tabNav = fileclerk.find('.nav-tabs li'),
				activeNav = $this.parent('li'),
				tabPane = fileclerk.find('.tab-pane'),
				chooseContainer = fileclerk.find('.tab-pane.view-remote')
			;

			// Remove active class on all tab nav
			tabNav.removeClass('active');
			// Add active class to clicked nav
			activeNav.addClass('active');
			// Remove active class on all tab panes
			tabPane.removeClass('active');
			// Add active class to the upload pane
			chooseContainer.addClass('active fade in');

			event.preventDefault();
			event.stopPropagation();
		}
	}

	tabs.init();
});
