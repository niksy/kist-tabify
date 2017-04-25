/*! kist-tabify 0.3.1 - Simple tabs and accordion interface. | Author: Ivan Nikolić <niksy5@gmail.com> (http://ivannikolic.com/), 2017 | License: MIT */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g=(g.jQuery||(g.jQuery = {}));g=(g.fn||(g.fn = {}));g.tabify = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Tabify = require(3);
var meta = require(12);
var emit = require(5)(meta.name);

var Accordion = module.exports = Tabify.extend({

	toggleItem: function ( item, state, type ) {
		Accordion._super.toggleItem.apply(this, arguments);

		if ( type === 'pane' ) {
			item
				.attr({
					'aria-expanded': state
				});
		}

	},

	select: function ( index ) {
		Accordion._super.select.apply(this, arguments);

		var isAlreadyActive   = this.isAlreadyActive;
		var multiSelectMethod = this.options.multiSelect ? 'not' : 'filter';

		this.toggleItem(this.$tab[multiSelectMethod](this.$activeTab), false, 'tab');
		this.toggleItem(this.$pane[multiSelectMethod](this.$activePane), false, 'pane');

		this.toggleItem(this.$newTab, !isAlreadyActive, 'tab');
		this.toggleItem(this.$newPane, !isAlreadyActive, 'pane');

		this.triggerAction(index);
	},

	triggerAction: function () {
		Accordion._super.triggerAction.apply(this, arguments);

		if ( !this.setupDone ) {
			return;
		}

		if ( this.isAlreadyActive ) {
			emit(this, 'deselect', [this.$newTab, this.$newPane]);
		}
	}

});

},{"12":12,"3":3,"5":5}],2:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var meta = require(12);
var htmlClasses = require(8);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"12":12,"8":8}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Klass = require(14);
var meta = require(12);
var dom = require(4);
var events = require(6);
var instance = require(10);
var htmlClasses = require(8);
var getClassSelector = require(7);
var emit = require(5)(meta.name);

var hasPushState = (('Modernizr' in window) && window.Modernizr.history);

/**
 * @this {Tabify}
 *
 * @param  {String} direction
 */
function mover ( direction ) {
	var position = 0;
	if ( direction === 'next' ) {
		if ( this.current === this.$tab.length-1 || typeof(this.current) !== 'number' ) {
			position = 0;
		} else {
			position = this.current+1;
		}
	}
	if ( direction === 'prev' ) {
		if ( this.current === 0 || typeof(this.current) !== 'number' ) {
			position = this.$tab.length-1;
		} else {
			position = this.current-1;
		}
	}
	this.select(position);
}

/**
 * @this {Tabify#dom.[tab|pane]}
 *
 * @param  {Integer} index
 * @param  {Element} element
 *
 * @return {Boolean}
 */
function filterPane ( placement, index, element ) {
	var el = $(element);
	return el.attr('id') === placement || el.data('tab-id') === placement;
}

/**
 * @this {Tabify#dom.tab}
 *
 * @param  {Integer} index
 * @param  {Element} element
 *
 * @return {Boolean}
 */
function filterTab ( placement, index, element ) {
	var el = $(element);
	return filterPane.apply(null, arguments) || el.attr('href') === '#' + placement;
}

/**
 * @param  {String} id
 *
 * @return {String}
 */
function constructId ( id ) {
	return id.replace(/^#/, '');
}

var Tabify = module.exports = Klass.extend({

	/**
	 * @param {Element} element
	 * @param {Object} options
	 */
	constructor: function ( element, options ) {

		this.element = element;
		this.options = $.extend(true, {}, this.defaults, options);

		instance.setup.call(this);
		dom.setup.call(this);
		events.setup.call(this);

		this.move(this.options.initial);
		this.setupDone = true;

	},

	isAlreadyActiveState: function ( tab, pane ) {
		if (
			tab.hasClass(this.options.classes.isActive) ||
			pane.hasClass(this.options.classes.isActive)
		) {
			return true;
		}
		return false;
	},

	/**
	 * @param  {jQuery} item
	 * @param  {Boolean} state
	 * @param  {String} type
	 */
	toggleItem: function ( item, state, type ) {

		var ariaAttr;
		var method;

		if ( type === 'tab' ) {
			ariaAttr = 'aria-selected';
		} else {
			ariaAttr = 'aria-hidden';
		}

		if ( state ) {
			method = 'addClass';
		} else {
			method = 'removeClass';
		}

		if ( type === 'pane' ) {
			state = !state;
		}

		item
			[method](this.options.classes.isActive)
			.attr(ariaAttr, state);

	},

	/**
	 * @param  {Integer} index
	 */
	select: function ( index ) {

		this.$activeTab = this.$tab.filter(getClassSelector(this.options.classes.isActive));
		this.$activePane = this.$pane.filter(getClassSelector(this.options.classes.isActive));

		this.$newTab  = this.$tab.eq(index);
		this.$newPane = this.$pane.eq(index);

		this.isAlreadyActive = this.isAlreadyActiveState(this.$newTab, this.$newPane);

		if ( this.options.changeURL && this.$newTab.is('a') && hasPushState && this.setupDone ) {
			history.pushState({}, '', this.$newTab.attr('href'));
		}

	},

	/**
	 * @param  {Integer} index
	 */
	triggerAction: function ( index ) {

		if ( !this.setupDone ) {
			emit(this, 'create', [this.$newTab, this.$newPane]);
			this.current = index;
			return;
		}

		if ( !this.isAlreadyActive ) {
			if ( (this.$activeTab.length || this.$activePane.length) && !this.isAlreadyActiveState(this.$activeTab, this.$activePane) ) {
				emit(this, 'deselect', [this.$activeTab, this.$activePane]);
			}
			emit(this, 'select', [this.$newTab, this.$newPane]);
			this.current = index;
		}

	},

	prev: function () {
		mover.call(this, 'prev');
	},

	next: function () {
		mover.call(this, 'next');
	},

	/**
	 * @param  {Function|Number|String} placement
	 */
	move: function ( placement ) {

		var tab;
		var pane;

		if ( typeof(placement) === 'function' ) {
			placement = placement.call(this.element);
		}

		if ( typeof(placement) === 'number' ) {
			this.select(placement);
		}

		if ( typeof(placement) === 'string' ) {

			placement = constructId(placement);

			tab = this.$tab.filter($.proxy(filterTab, null, placement));
			pane = this.$pane.filter($.proxy(filterPane, null, placement));

			if ( tab.length ) {
				this.select(this.$tab.index(tab[0]));
			} else if ( pane.length ) {
				this.select(this.$pane.index(pane[0]));
			}

		}

		if ( typeof(placement) === 'boolean' ) {
			if ( placement ) {
				this.select(0);
			} else {
				emit(this, 'create', [$(), $()]);
			}
		}

	},

	destroy: function () {
		dom.destroy.call(this);
		events.destroy.call(this);
		instance.destroy.call(this);
	},

	current: null,
	setupDone: false,

	defaults: {
		type: 'tab',
		initial: 0,
		multiSelect: false,
		tab: '> ul > li > a, > ul > li > button',
		pane: '> div > div',
		changeURL: false,
		select: $.noop,
		deselect: $.noop,
		create: $.noop,
		classes: htmlClasses
	}

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"10":10,"12":12,"14":14,"4":4,"5":5,"6":6,"7":7,"8":8}],4:[function(require,module,exports){
(function (global){
// jscs:disable requireCapitalizedComments
// jscs:disable disallowQuotedKeysInObjects

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var meta = require(12);
var htmlClasses = require(8);
var AriaGenerator = require(2);

var dom = module.exports = {
	$body: $('body'),
	setup: function () {

		var aria = new AriaGenerator(this);
		var generateAriaTab  = aria.generateAttrs('tab');
		var generateAriaPane = aria.generateAttrs('pane');

		dom.$body = dom.$body.length ? dom.$body : $('body');

		this.$el   = $(this.element);
		this.$tab  = this.$el.find(this.options.tab);
		this.$pane = this.$el.find(this.options.pane);
		this.$pane = this.$pane.length ? this.$pane : dom.$body.find(this.options.pane);

		this.$tabItem = this.$tab.closest('li');
		this.$tabItem = this.$el.find(this.$tabItem).length ? this.$tabItem : $();
		this.$tabList = this.$tab.closest('ul');
		this.$tabList = this.$el.find(this.$tabList).length ? this.$tabList : $();

		this.$el
			.addClass(this.options.classes.wrapper);

		this.$tab
			.addClass(this.options.classes.tab)
			.attr({
				'role': 'tab',
				'aria-selected': false
			})
			.each(generateAriaTab);

		this.$pane
			.addClass(this.options.classes.pane)
			.attr({
				'role': 'tabpanel',
				'aria-hidden': true
			})
			.each(generateAriaPane);

		this.$tabItem
			.attr({
				'role': 'presentation'
			});

		this.$tabList
			.attr({
				'role': 'tablist'
			});

		if ( this.options.type === 'accordion' ) {

			this.$pane
				.attr({
					'aria-expanded': false
				});

			if ( this.options.multiSelect ) {
				this.$el
					.attr({
						'aria-multiselectable': true
					});
			}

		}

	},
	destroy: function () {

		this.$el
			.removeClass(this.options.classes.wrapper)
			.removeAttr('aria-multiselectable');

		this.$tab
			.removeClass(this.options.classes.tab)
			.removeClass(this.options.classes.isActive)
			.removeAttr('role aria-selected aria-controls');

		this.$pane
			.removeClass(this.options.classes.pane)
			.removeClass(this.options.classes.isActive)
			.removeAttr('role aria-hidden aria-labelledby aria-expanded');

		this.$tabItem.add(this.$tabList)
			.removeAttr('role');

		this.$tab.add(this.$pane)
			.each(function ( index, element ) {
				var el = $(this);
				if ( /^kist-/.test(el.attr('id')) ) {
					el.removeAttr('id');
				}
			});

	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"12":12,"2":2,"8":8}],5:[function(require,module,exports){
(function (global){
/* jshint maxparams:false */

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

/**
 * @param  {String} name
 *
 * @return {Function}
 */
module.exports = function ( name ) {

	/**
	 * @param  {Object}   ctx
	 * @param  {String}   eventName
	 * @param  {Array}    data
	 * @param  {jQuery}   triggerEl
	 */
	return function ( ctx, eventName, data, triggerEl ) {
		var el = (ctx.dom && ctx.dom.el) || ctx.$el || $({});
		if ( ctx.options[eventName] ) {
			ctx.options[eventName].apply((el.length === 1 ? el[0] : el.toArray()), data);
		}
		(triggerEl || el).trigger(((name || '') + eventName).toLowerCase(), data);
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var getClassSelector = require(7);

module.exports = {
	setup: function () {

		this.$el.on('click' + this.ens, getClassSelector(this.options.classes.tab), $.proxy(function ( e ) {

			e.preventDefault();
			this.select(this.$tab.index($(e.currentTarget)));

		}, this));

	},
	destroy: function () {
		this.$el.off(this.ens);
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"7":7}],7:[function(require,module,exports){
/**
 * @param  {String} className
 *
 * @return {String}
 */
module.exports = function ( className ) {
	return '.' + className.split(' ').join('.');
};

},{}],8:[function(require,module,exports){
var meta = require(12);
var htmlClass = meta.ns.htmlClass;

module.exports = {
	wrapper: htmlClass,
	tab: htmlClass + '-tab',
	pane: htmlClass + '-pane',
	isActive: 'is-active'
};

},{"12":12}],9:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var Ctor = require(3);
var Tabs = require(13);
var Accordion = require(1);
var meta = require(12);
var isPublicMethod = require(11)(meta.publicMethods);

/**
 * @param  {Object|String} options
 * @param  {Mixed} placement
 *
 * @return {jQuery}
 */
 var plugin = $.fn[meta.name] = module.exports = function ( options, placement ) {

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"1":1,"11":11,"12":12,"13":13,"3":3}],10:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var meta = require(12);
var instance = 0;

module.exports = {
	setup: function () {
		this.uid = instance++;
		this.ens = meta.ns.event + '.' + this.uid;
	},
	destroy: function () {
		$.removeData(this.element, meta.name);
	}
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"12":12}],11:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

/**
 * @param  {Array} methods
 *
 * @return {Function}
 */
module.exports = function ( methods ) {

	/**
	 * @param  {String} name
	 *
	 * @return {Boolean}
	 */
	return function ( name ) {
		return typeof(name) === 'string' && $.inArray(name, methods || []) !== -1;
	};

};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
module.exports = {
	name: 'tabify',
	ns: {
		htmlClass: 'kist-Tabify',
		event: '.kist.tabify'
	},
	publicMethods: ['destroy','prev','next','move']
};

},{}],13:[function(require,module,exports){
var Tabify = require(3);

var Tabs = module.exports = Tabify.extend({

	select: function ( index ) {
		Tabs._super.select.apply(this, arguments);

		this.toggleItem(this.$tab, false, 'tab');
		this.toggleItem(this.$pane, false, 'pane');

		this.toggleItem(this.$newTab, true, 'tab');
		this.toggleItem(this.$newPane, true, 'pane');

		this.triggerAction(index);
	}

});

},{"3":3}],14:[function(require,module,exports){
var objExtend = require(15);

/**
 * @param  {Object} protoProps
 * @param  {Object} staticProps
 *
 * @return {Function}
 */
function extend ( protoProps, staticProps ) {

	var self = this;
	var Child;

	if ( protoProps && protoProps.hasOwnProperty('constructor') ) {
		Child = protoProps.constructor;
	} else {
		Child = function () {
			Child._super.constructor.apply(this, arguments);
		};
	}

	objExtend(Child, self, staticProps);

	function ChildTemp () {}
	ChildTemp.prototype = self.prototype;
	Child.prototype = new ChildTemp();
	Child.prototype.constructor = Child;
	Child._super = self.prototype;

	if ( protoProps ) {
		objExtend(Child.prototype, protoProps);
	}

	return Child;

}

var Klass = module.exports = function () {};
Klass.extend = extend;

},{"15":15}],15:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[9])(9)
});