var $ = require('jquery');
var Ctor = require('./constructor');
var Tabs = require('./tabs');
var Accordion = require('./accordion');
var meta = require('./meta');
var isPublicMethod = require('kist-toolbox/lib/is-public-method')(meta.publicMethods);
var appendClass = require('kist-toolbox/lib/append-class')(Ctor.prototype.defaults.classes);
var appendNamespacedClasses = require('kist-toolbox/lib/append-namespaced-classes')(Ctor.prototype.defaults.classes, meta.ns.htmlClass);

/**
 * @param  {Object|String} options
 * @param  {Mixed} placement
 *
 * @return {jQuery}
 */
var plugin = module.exports = function ( options, placement ) {

	options = options || {};

	return this.each(function () {

		var instance = $.data(this, meta.name);

		if ( isPublicMethod(options) && instance ) {
			instance[options](options === 'move' ? placement : undefined);
		} else if ( typeof(options) === 'object' && !instance ) {
			var Method = options.type === 'accordion' ? Accordion : Tabs;
			$.data(this, meta.name, new Method(this, options));
		}

	});

};
plugin.defaults = Ctor.prototype.defaults;
plugin.appendClass = appendClass;
plugin.appendNamespacedClasses = appendNamespacedClasses;
