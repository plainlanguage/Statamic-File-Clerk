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

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the absolute page-offset of the given element.
   */
  function pos(el) {
    var o = { x:el.offsetLeft, y:el.offsetTop }
    while((el = el.offsetParent))
      o.x+=el.offsetLeft, o.y+=el.offsetTop

    return o
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})
        , mid = o.radius+o.length+o.width

      if (target) {
        target.insertBefore(el, target.firstChild||null)
        css(el, {
          left: o.left,
          top: o.top
        })
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */

/*

Basic Usage:
============

$('#el').spin(); // Creates a default Spinner using the text color of #el.
$('#el').spin({ ... }); // Creates a Spinner using the provided options.

$('#el').spin(false); // Stops and removes the spinner.

Using Presets:
==============

$('#el').spin('small'); // Creates a 'small' Spinner using the text color of #el.
$('#el').spin('large', '#fff'); // Creates a 'large' white Spinner.

Adding a custom preset:
=======================

$.fn.spin.presets.flower = {
  lines: 9
  length: 10
  width: 20
  radius: 0
}

$('#el').spin('flower', 'red');

*/

(function(factory) {

  if (typeof exports == 'object') {
    // CommonJS
    factory(require('jquery'), require('spin'))
  }
  else if (typeof define == 'function' && define.amd) {
    // AMD, register as anonymous module
    define(['jquery', 'spin'], factory)
  }
  else {
    // Browser globals
    if (!window.Spinner) throw new Error('Spin.js not present')
    factory(window.jQuery, window.Spinner)
  }

}(function($, Spinner) {

  $.fn.spin = function(opts, color) {

    return this.each(function() {
      var $this = $(this),
        data = $this.data();

      if (data.spinner) {
        data.spinner.stop();
        delete data.spinner;
      }
      if (opts !== false) {
        opts = $.extend(
          { color: color || $this.css('color') },
          $.fn.spin.presets[opts] || opts
        )
        data.spinner = new Spinner(opts).spin(this)
      }
    })
  }

  $.fn.spin.presets = {
    tiny: { lines: 8, length: 2, width: 2, radius: 3 },
    small: { lines: 8, length: 4, width: 3, radius: 5 },
    large: { lines: 10, length: 8, width: 4, radius: 8 }
  }

}));

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
				uploadSuccess = $this.closest('.s3files').find('.result .filename-display'),
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
				 		postUrl = postUrl + '?overwrite=' + overwrite;
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
							fileWrapper.addClass('is-hidden'); // Hide file inputs
							progressWrapper.removeClass('is-hidden'); // Show progress
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
								add_file.toggleClass('is-visible is-hidden');
								setTimeout(function() {
									result_wrapper.toggleClass('is-hidden is-visible');
								}, 300);
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

								$this.closest('.s3files').find('.upload-error .error-exists a').on('click', function(event) {

									actionAttr = $(this).attr('data-action');

									// Clicked Replace
									if (actionAttr === 'replace') {
										console.log('Replace');
										tryUpload(true);
									}
									// Clicked Keep Both
									if (actionAttr === 'keep-both') {
										console.log('Keep Both');
										tryUpload(false);
									}
									// Clicked Cancel
									if (actionAttr === 'cancel') {
										console.log('Cancel');
										errorExists.remove(); // Remove error
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
