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

/* ========================================================================
 * Bootstrap: transition.js v3.1.1
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition'    : 'transitionend',
      'OTransition'      : 'oTransitionEnd otransitionend',
      'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
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

			// Upload new file
			$('body').on( 'change', '.file-upload', this.uploadFiles );

			// Remove file reference on click
			$('body').on( 'click', '.btn-remove', this.removeFileReference );

			// Choose existing file
			$('body').on( 'click', '.load_existing', this.loadExisting );
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

			var $this = $(this),
				listURL = $this.data('list'),
				viewList = $this.closest('.s3-add-file').find('.view-remote .view-list tbody');

			// Load Existing files
			$.ajax({
				url: listURL,
				type: 'GET',
				cache: false,
				dataType: 'json',
				processData: false, // Don't process the files
				contentType: false, // Set content type to false as jQuery will tell the server it's a query string request
				beforeSend: function(data) {
					// Do stuff before sending. Loading Gif? (Chad, that's a soft `G`!)
				},
				success: function(data, textStatus, jqXHR)
				{
					if (data.error === false)
					{
						console.log(data.success);
						viewList.html(data.html);
					}
				},
				error: function(jqXHR, textStatus, errorThrown)
				{
					// Handle Errors here
					console.log('ERRORS: ' + textStatus);
				}
			});

		}

	};

	// Run it
	s3upload.init();

});
