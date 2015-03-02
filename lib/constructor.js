var $ = require('jquery');
var Klass = require('kist-klass');
var meta = require('./meta');
var dom = require('./dom');
var events = require('./events');
var instance = require('./instance');
var htmlClasses = require('./html-classes');
var getClassSelector = require('./get-class-selector');
var emit = require('kist-toolbox/lib/event-emitter')(meta.name);

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
