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
