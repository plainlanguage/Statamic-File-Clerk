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

			// Open directory
			$('body').on( 'doubletap', '.is-directory', this.loadExisting );

			// Breadcrumb
			$('body').on( 'click', '.breadcrumb a, .error-no-results a[data-uri]', this.loadExisting );

			// Highlight Row
			$('body').on( 'tap', '.view-list td', this.highlightRow );

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
				url: '/TRIGGER/fileclerk/filecheck',
				type: 'GET',
				data: {'destination': destination, 'filename': filename},
				cache: false,
				dataType: 'JSON',
				processData: true,
				contentType: false,
				beforeSend: function(data) {

				},
				success: function( data, textStatus, jqXHR )
				{
					console.log(data);
					return data.error;
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
				fullPath = $this.val(),
				pathArray = fullPath.split('\\'),
				filename = pathArray[pathArray.length-1],
				uploadTab = $this.closest('.view-upload'),
				postUrl = uploadTab.find('.postUrl').val(),
				fileWrapper = uploadTab.find('.file-wrapper'),
				progressWrapper = uploadTab.find('.progress-bar'),
				progressBar = progressWrapper.find('progress'),
				progressPrc = progressWrapper.find('.prc'),
				uploadSuccess = $this.closest('.fileclerk').find('.result .filename-display a'),
				successfullUpload = $this.closest('.fileclerk').find('.result input.successful-upload'),
				result_wrapper = $this.closest('.fileclerk').find('.result'),
				fileClerkWrapper = $this.closest('.fileclerk'),
				add_file = $this.closest('.fileclerk').find('.add-file'),
				uploadError = $this.closest('.fileclerk').find('.upload-error'),
				// Set some hidden inputs up in this thang.
				hiddenUrl = $this.closest('.fileclerk').find('.result input.hidden-url'),
				hiddenFilename = $this.closest('.fileclerk').find('.result input.hidden-filename'),
				hiddenExtension = $this.closest('.fileclerk').find('.result input.hidden-extension'),
				hiddenSize = $this.closest('.fileclerk').find('.result input.hidden-size')
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
							xhr.upload.onprogress = function(evt){
								var progress = parseInt(evt.loaded / evt.total * 100, 10);
								console.log('Uploading: ', evt.loaded/evt.total*100 + '%')
								progressBar.attr({value:evt.loaded,max:evt.total});
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
								add_file.toggleClass('is-visible is-hidden'); // Hide Add File
								result_wrapper.toggleClass('is-hidden is-visible');
								fileClerkWrapper.addClass('yay'); // Add a 'yay' class to .filewrapper

								hiddenUrl.val(data.data.fullpath);
								hiddenFilename.val(data.data.filename);
								hiddenExtension.val(data.data.filetype);
								hiddenSize.val(data.data.filesize);
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
							else if ( data.code === 700 ) {
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
						url: '/TRIGGER/fileclerk/filecheck',
						type: 'GET',
						data: {'destination': $this.data('destination'), 'filename': filename},
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
							console.log(errorThrown);
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
				add_file = $this.closest('.fileclerk').find('.add-file'),
				successful_upload = $this.closest('.fileclerk').find('.result input.successful-upload'),
				hiddenUrl = $this.closest('.fileclerk').find('.result input.hidden-url'),
				hiddenFilename = $this.closest('.fileclerk').find('.result input.hidden-filename'),
				hiddenExtension = $this.closest('.fileclerk').find('.result input.hidden-extension'),
				hiddenSize = $this.closest('.fileclerk').find('.result input.hidden-size'),
				filename_display = $this.closest('.fileclerk').find('.result .filename-display a'),
				fileWrapper = $this.closest('.fileclerk').find('.file-wrapper')
			;

			event.preventDefault();
			successful_upload.val(''); // Empty out hidden field w/ url
			hiddenUrl.val(''); // Empty out hidden field w/ url
			hiddenFilename.val(''); // Empty out hidden field w/ url
			hiddenExtension.val(''); // Empty out hidden field w/ url
			hiddenSize.val(''); // Empty out hidden field w/ url
			filename_display.html(''); // Empty display filename
			result_wrapper.toggleClass('is-visible is-hidden');
			setTimeout(function() {
				add_file.toggleClass('is-hidden is-visible');
				fileWrapper.removeClass('is-hidden').addClass('is-visible'); // Show the upload button again
				fileClerkWrapper.removeClass('yay'); // Remove the 'yay' class
			}, 300);
		},

		// Choose Existing
		loadExisting: function( event ) {

			event.preventDefault();

			var $this = $(this),
				listURL = '/TRIGGER/fileclerk/list' + ($(this).data('uri') ? '?uri=' + $(this).data('uri') : '') + ($(this).data('uri') ? '&' : '?') + ($(this).data('destination') ? 'destination=' + $(this).data('destination') : ''),
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

		selectFile: function( event ) {

			event.preventDefault();

			var $this = $(this),
				fileClerkWrapper = $this.closest('.fileclerk'),
				fullPath = $this.closest('.view-remote').find('.view-list table tr.file.is-highlighted').data('file'),
				filename = $this.closest('.view-remote').find('.view-list table tr.file.is-highlighted td.is-file').html(),
				extension = $this.closest('.view-remote').find('.view-list table tr.file.is-highlighted').data('extension'),
				size = $this.closest('.view-remote').find('.view-list table tr.file.is-highlighted').data('size'),
				uploadSuccess = $this.closest('.fileclerk').find('.result .filename-display a'),
				successfullUpload = $this.closest('.fileclerk').find('.result input.successful-upload'),
				result_wrapper = $this.closest('.fileclerk').find('.result'),
				addFile = $this.closest('.fileclerk').find('.add-file'),
				//uploadError = $this.closest('.fileclerk').find('.upload-error'),
				hiddenUrl = $this.closest('.fileclerk').find('.result input.hidden-url'),
				hiddenFilename = $this.closest('.fileclerk').find('.result input.hidden-filename'),
				hiddenExtension = $this.closest('.fileclerk').find('.result input.hidden-extension'),
				hiddenSize = $this.closest('.fileclerk').find('.result input.hidden-size')
			;

			uploadSuccess.append(filename); // Show filename on successful upload
			successfullUpload.val(fullPath); // Add full file path to hidden input
			hiddenUrl.val(fullPath);
			hiddenFilename.val(filename);
			hiddenExtension.val(extension);
			hiddenSize.val(size);
			uploadSuccess.attr('href', fullPath);
			addFile.toggleClass('is-visible is-hidden');
			result_wrapper.toggleClass('is-hidden is-visible');
			fileClerkWrapper.addClass('yay'); // Add a 'yay' class to .filewrapper

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

	//  $$$$$$$$\             $$\                                             $$\       $$\       $$\           $$\
	//  $$  _____|            $$ |                                            $$ |      $$ |      \__|          $$ |
	//  $$ |      $$\   $$\ $$$$$$\    $$$$$$\   $$$$$$\  $$$$$$$\   $$$$$$\  $$ |      $$ |      $$\ $$$$$$$\  $$ |  $$\  $$$$$$$\
	//  $$$$$\    \$$\ $$  |\_$$  _|  $$  __$$\ $$  __$$\ $$  __$$\  \____$$\ $$ |      $$ |      $$ |$$  __$$\ $$ | $$  |$$  _____|
	//  $$  __|    \$$$$  /   $$ |    $$$$$$$$ |$$ |  \__|$$ |  $$ | $$$$$$$ |$$ |      $$ |      $$ |$$ |  $$ |$$$$$$  / \$$$$$$\
	//  $$ |       $$  $$<    $$ |$$\ $$   ____|$$ |      $$ |  $$ |$$  __$$ |$$ |      $$ |      $$ |$$ |  $$ |$$  _$$<   \____$$\
	//  $$$$$$$$\ $$  /\$$\   \$$$$  |\$$$$$$$\ $$ |      $$ |  $$ |\$$$$$$$ |$$ |      $$$$$$$$\ $$ |$$ |  $$ |$$ | \$$\ $$$$$$$  |
	//  \________|\__/  \__|   \____/  \_______|\__|      \__|  \__| \_______|\__|      \________|\__|\__|  \__|\__|  \__|\_______/
	//
	//
	//

	var external_link = $('a[rel="external"]');

	external_link.on('click', function(event) {
		event.preventDefault();
		event.stopPropagation();
		window.open(this.href, '_blank');
	});

});
