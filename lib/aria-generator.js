var $ = require('jquery');
var meta = require('./meta');
var htmlClasses = require('./html-classes');

/**
 * @param  {Object} options
 *
 * @return {String}
 */
function generateIds ( options ) {

	var self = options.self;

	if ( options.type === 'tab' && options.ns === '-pane' ) {
		options.id = self.$pane.eq(self.$tab.index(options.el)).attr('id');
	}

	if ( options.type === 'pane' && options.ns === '-tab' ) {
		options.id = self.$tab.eq(self.$pane.index(options.el)).attr('id');
	}

	return options.id ? options.id : options.ns + '-' + self.uid + '-' + options.index;
}

/**
 * @param  {Tabify} instance
 */
var AriaGenerator = module.exports = function ( instance ) {
	this.instance = instance;
};

/**
 * @param  {String} type
 *
 * @return {Function}
 */
AriaGenerator.prototype.generateAttrs = function ( type ) {

	var instance = this.instance;
	var ariaAttr;

	if ( type === 'tab' ) {
		ariaAttr = ['aria-controls','pane'];
	} else {
		ariaAttr = ['aria-labelledby','tab'];
	}

	/**
	 * @param  {Integer} index
	 * @param  {Element} element
	 */
	return function ( index, element ) {

		var el = $(element);
		var id = el.attr('id');
		var href = el.attr('href');
		var options = {
			el: el,
			id: id,
			href: href,
			self: instance,
			index: index,
			type: type
		};
		var elId;
		var ariaId;

		elId = generateIds($.extend({}, options, {
			ns: htmlClasses[type]
		}));
		ariaId = generateIds($.extend({}, options, {
			ns: htmlClasses[ariaAttr[1]]
		}));

		el.attr('id', elId);
		el.attr(ariaAttr[0], ariaId);

	};
};
