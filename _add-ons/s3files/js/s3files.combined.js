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

// Place any jQuery/helper plugins in here.
/* ========================================================================
 * Bootstrap: tab.js v3.1.1
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(jQuery);

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

			// Prepare upload on file input change event
			$('body').on( 'change', '.file-upload', this.prepareUpload );

			// Upload file on click
			$('body').on( 'click', '.btn-upload', this.uploadFiles );

			// Remove file reference on click
			$('body').on( 'click', '.btn-remove', this.removeFileReference );
		},

		// Prepare Upload
		prepareUpload: function( event ) {

			var files = event.target.files;
			var btnUpload = $(this).closest('.s3files').find('.btn-upload');

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
			var progressUploading = $(this).closest('.s3files').find('.progress-bar progress.uploading');
			var progressPrc = $(this).closest('.s3files').find('.progress-bar .prc');
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
						console.log('Xhr');
						myXhr.upload.addEventListener('progress', function(event) {
							if(event.lengthComputable) {
								var progress = parseInt(event.loaded / event.total * 100, 10);
								console.log(progress + '%');
								progressUploading.attr({value:event.loaded,max:event.total});
								progressPrc.html(progress + '%');
							}
						}, false); // for handling the progress of the upload
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
						progressFilename.html('<div class="success"><strong>' + data.filename +'</strong><a class="remove" href="#">Remove</a></div>'); // Change uploading text to success
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
	};

	// Run it
	s3upload.init();


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

	// Bootstrap Tabs. I know.

});