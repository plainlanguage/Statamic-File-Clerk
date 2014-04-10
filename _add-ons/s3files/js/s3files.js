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
			$('body').on( 'doubletap', '.is-directory', this.loadExisting );

			// Breadcrumb
			$('body').on( 'click', '.breadcrumb a', this.loadExisting );

			// Highlight Row
			$('body').on( 'tap', '.view-list td', this.highlightRow );

			// File Exists Options
			//$('body').on( 'click', '.error-exists a', this.fileExists );
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
				uploadSuccess = $this.closest('.s3files').find('.result .filename-display a'),
				successfullUpload = $this.closest('.s3files').find('.result input.successful-upload'),
				result_wrapper = $this.closest('.s3files').find('.result'),
				add_file = $this.closest('.s3files').find('.s3-add-file'),
				uploadError = $this.closest('.s3files').find('.upload-error')
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
							fileWrapper.removeClass('is-visible').addClass('is-hidden animated fadeOut'); // Hide file inputs
							progressWrapper.toggleClass('is-hidden is-visible').addClass('animated fadeIn'); // Show progress
						},
						success: function(data, textStatus, jqXHR)
						{
							// Upload was successful
							if ( data.code === 100 )
							{
								// Success, so call function to process the form
								console.log(data.success);
								console.log('URL: ' + data.data.fullpath);
								progressWrapper.addClass('is-hidden'); // Hide progress bar when a file is succesfully uploaded.
								uploadSuccess.append(data.data.filename); // Show filename on successful upload
								successfullUpload.val(data.data .fullpath); // Add full file path to hidden input
								uploadSuccess.attr('href', data.data.fullpath);
								add_file.toggleClass('is-visible is-hidden');
								result_wrapper.toggleClass('is-hidden is-visible').addClass('animated fadeIn');
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
								uploadError.toggleClass('is-hidden is-visible').addClass('animated fadeInUp').html(data.html); // Add is-visible class and show JSON html
								progressWrapper.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide Progress Bar since there is an error

								$this.closest('.s3files').find('.upload-error .error-exists a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');

									// Clicked Replace
									if (actionAttr === 'replace') {
										console.log('Replace');
										tryUpload(true);
										uploadError.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide error holder
									}
									// Clicked Keep Both
									if (actionAttr === 'keep-both') {
										console.log('Keep Both');
										tryUpload(false);
										uploadError.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide error holder
									}
									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide error holder
										fileWrapper.toggleClass('is-hidden is-visible').addClass('animated fadeIn'); // Bring back the upload buttton
									}

									event.preventDefault();
								});
							}
							// Disallowed Filetype
							else if ( data.code === 700 ) {
								console.log(data.message);
								uploadError.toggleClass('is-hidden is-visible').addClass('animated fadeInUp').html(data.html); // Add is-visible class and show JSON html
								progressWrapper.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide Progress Bar since there is an error

								$this.closest('.s3files').find('.upload-error .error-not-allowed a').on('click', function(event) {

									var actionAttr = $(this).attr('data-action');

									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										//errorExists.remove(); // Remove error
										uploadError.toggleClass('is-visible is-hidden').addClass('animated fadeOut'); // Hide error holder
										fileWrapper.toggleClass('is-hidden is-visible').addClass('animated fadeIn'); // Bring back the upload buttton
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

				// Call the AJAX
				tryUpload();

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
				filename_display = $this.closest('.s3files').find('.result .filename-display a'),
				fileWrapper = $this.closest('.s3files').find('.file-wrapper')
			;

			event.preventDefault();
			successful_upload.val(''); // Empty out hidden field w/ url
			filename_display.html(''); // Empty display filename
			result_wrapper.toggleClass('is-visible is-hidden').addClass('animated fadeOut');
			setTimeout(function() {
				add_file.toggleClass('is-hidden is-visible').addClass('animated fadeIn');
				fileWrapper.removeClass('is-hidden').addClass('is-visible animated fadeIn'); // Show the upload button again
			}, 300);
		},

		// Choose Existing
		loadExisting: function( event ) {

			event.preventDefault();

			var $this = $(this),
				listURL = '/TRIGGER/s3files/list' + ($(this).data('uri') ? '?uri=' + $(this).data('uri') : '') + ($(this).data('uri') ? '&' : '?') + ($(this).data('destination') ? 'destination=' + $(this).data('destination') : ''),
				viewList = $this.closest('.s3-add-file').find('.view-remote .view-list tbody'),
				breadcrumb = $this.closest('.s3-add-file').find('.view-remote .breadcrumb'),
				ajaxSpinner = $this.closest('.s3-add-file').find('.view-remote .view-list .ajax-spinner'),
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
					// List returned
					if( data.code === 400 || data.error === false )
					{
						console.log(data.success);
						breadcrumb.html(data.breadcrumb);
						viewList.html(data.html);
						ajaxSpinner.spin(false); // Stop spinner
						ajaxOverlay.toggleClass('is-visible is-hidden');
					}
					// No results
					else if( data.code === 500 )
					{

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
				selectBtn = $this.closest('.view-remote').find('button[data-action="select_file"]');

			siblings.removeClass(highlight);
			parent.toggleClass(highlight);

			if (rows.hasClass(highlight) && !parent.hasClass('directory')) {
				selectBtn.prop( "disabled", false );
			} else {
				selectBtn.prop( "disabled", true );
			}

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
