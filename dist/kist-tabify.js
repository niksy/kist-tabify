/*! kist-tabify 0.0.0 - Simple tabs and accordion interface. | Author: Ivan Nikolić, 2014 | License: MIT */
;(function ( $, window, document, undefined ) {

	var plugin = {
		name: 'tabify',
		ns: {
			css: 'kist-Tabify',
			event: '.kist.tabify'
		},
		error: function ( message ) {
			throw new Error(plugin.name + ': ' + message);
		},
		constructClasses: function () {

			// Prepare CSS classes
			this.options.classes = {};
			this.options.classesNs = {};

			$.each(plugin.classes, $.proxy(function ( name, value ) {

				var ns        = $.trim(this.options.namespace);
				var pluginNs  = plugin.ns.css;
				var className = pluginNs + value;
				var classNameNs = className;

				if ( /^is[A-Z]/.test(name) ) {
					className = classNameNs = value;
				} else if ( ns !== pluginNs && ns !== '' ) {
					classNameNs = ns + value;
					className = pluginNs + value + ' ' + classNameNs;
				}

				this.options.classesNs[name] = classNameNs;
				this.options.classes[name] = className;

			}, this));

		}
	};
	plugin.classes = {
		wrapper: '',
		tab: '-tab',
		pane: '-pane',
		isActive: 'is-active'
	};
	plugin.publicMethods = ['destroy','prev','next','move'];

	var dom = {
		setup: function () {

			var generateAriaTab  = generateAriaAttrs.call(this, 'tab');
			var generateAriaPane = generateAriaAttrs.call(this, 'pane');

			this.dom      = this.dom || {};
			this.dom.el   = $(this.element);
			this.dom.tab = this.dom.el.find(this.options.tab);
			this.dom.pane = this.dom.el.find(this.options.pane);

			this.dom.el
				.addClass(this.options.classes.wrapper);

			this.dom.tab
				.addClass(this.options.classes.tab)
				.attr({
					'role': 'tab',
					'aria-selected': false
				})
				.closest('li')
					.attr({
						'role': 'presentation'
					})
				.closest('ul')
					.attr({
						'role': 'tablist'
					})
				.end().end()
				.each(generateAriaTab);

			this.dom.pane
				.addClass(this.options.classes.pane)
				.attr({
					'role': 'tabpanel',
					'aria-hidden': true
				})
				.each(generateAriaPane);

			if ( this.options.type === 'accordion' ) {
				this.dom.pane
					.attr({
						'aria-expanded': false
					});

				if ( this.options.multiSelect ) {
					this.dom.el
						.attr({
							'aria-multiselectable': true
						});
				}
			}

			this.options.create.call(this.element);

		},
		destroy: function () {

			this.dom.el
				.removeClass(this.options.classes.wrapper)
				.removeAttr('aria-multiselectable');

			this.dom.tab
				.removeClass(this.options.classes.tab)
				.removeAttr('role aria-selected aria-controls')
				.closest('li')
					.removeAttr('role')
				.closest('ul')
					.removeAttr('role');

			this.dom.pane
				.removeClass(this.options.classes.pane)
				.removeAttr('role aria-hidden aria-labelledby aria-expanded');

			this.dom.tab.add(this.dom.pane)
				.each(function ( index, element ) {
					var el = $(this);
					if ( /^kist-/.test(el.attr('id')) ) {
						el.removeAttr('id');
					}
				});

		}
	};

	var events = {
		setup: function () {

			this.dom.el.on('click' + this.instance.ens, '.' + this.options.classesNs.tab, $.proxy(function ( e ) {

				e.preventDefault();
				this.select(this.dom.tab.index($(e.currentTarget)));

			}, this));

		},
		destroy: function () {
			this.dom.el.off(this.instance.ens);
		}
	};

	var instance = {
		id: 0,
		setup: function () {
			this.instance     = this.instance || {};
			this.instance.id  = instance.id++;
			this.instance.ens = plugin.ns.event + '.' + this.instance.id;
		},
		destroy: function () {
			delete $.data(this.element)[plugin.name];
		}
	};

	var hasPushState = ('Modernizr' in window && Modernizr.history);

	/**
	 * @param  {Object} options
	 *
	 * @return {String}
	 */
	function generateAriaIds ( options ) {
		if ( options.href && options.ns === '-pane' ) {
			options.id = options.href.replace(/^#/, '');
		}
		return options.id ? options.id : plugin.ns.css + options.ns + '-' + options.instanceId + '-' + options.index;
	}

	/**
	 * @this {Tabify}
	 *
	 * @param  {String} type
	 *
	 * @return {Function}
	 */
	function generateAriaAttrs ( type ) {

		var instanceId = this.instance.id;
		var ariaAttr;

		if ( type === 'tab' ) {
			ariaAttr = ['aria-controls','pane'];
		} else {
			ariaAttr = ['aria-labelledby', 'tab'];
		}

		/**
		 * @this {Tabify#dom.[tab|pane]}
		 *
		 * @param  {Integer} index
		 * @param  {Element} element
		 *
		 * @return {}
		 */
		return function ( index, element ) {

			var el = $(this);
			var id = el.attr('id');
			var href = el.attr('href');
			var options = {
				id: id,
				href: href,
				instanceId: instanceId,
				index: index
			};
			var elId;
			var ariaId;

			elId   = generateAriaIds($.extend({}, options, { ns: plugin.classes[type] }));
			ariaId = generateAriaIds($.extend({}, options, { ns: plugin.classes[ariaAttr[1]] }));

			el.attr('id', elId);
			el.attr(ariaAttr[0], ariaId);

		};
	}

	/**
	 * @this {Tabify}
	 *
	 * @param  {String} direction
	 *
	 * @return {}
	 */
	function mover ( direction ) {

		var position = 0;

		if ( direction === 'next' ) {
			if ( this.current === this.dom.tab.length-1 || typeof(this.current) !== 'number' ) {
				position = 0;
			} else {
				position = this.current+1;
			}
		}

		if ( direction === 'prev' ) {
			if ( this.current === 0 || typeof(this.current) !== 'number' ) {
				position = this.dom.tab.length-1;
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

	function isAlreadyActiveState ( tab, pane ) {
		if (
			tab.hasClass(this.options.classes.isActive) ||
			pane.hasClass(this.options.classes.isActive)
		) {
			return true;
		}
		return false;
	}

	/**
	 * @class
	 *
	 * @param {Element} element
	 * @param {Object} options
	 */
	function Tabify ( element, options ) {

		this.element = element;
		this.options = $.extend({}, this.defaults, options);

		plugin.constructClasses.call(this);

		instance.setup.call(this);
		dom.setup.call(this);
		events.setup.call(this);

		if ( !this.dom.tab.is('a, button') ) {
			this.destroy();
			plugin.error('Tab items should only be anchors or button elements.');
		}

		this.move(this.options.initial);

	}

	$.extend(Tabify.prototype, {

		/**
		 * Toggle item state
		 *
		 * @this {Tabify}
		 *
		 * @param  {jQuery} item
		 * @param  {Boolean} state
		 * @param  {String} type
		 *
		 * @return {}
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
		 *
		 * @return {}
		 */
		select: function ( index ) {

			this.newTab  = this.dom.tab.eq(index);
			this.newPane = this.dom.pane.eq(index);

		},

		prev: function () {
			mover.call(this, 'prev');
		},

		next: function () {
			mover.call(this, 'next');
		},

		/**
		 * @param  {String} placement
		 *
		 * @return {}
		 */
		move: function ( placement ) {

			var tab;
			var pane;

			if ( typeof(placement) === 'number' ) {
				this.select(placement-1);
			}

			if ( typeof(placement) === 'string' ) {

				tab = this.dom.tab.filter($.proxy(filterTab, null, placement));
				pane = this.dom.pane.filter($.proxy(filterPane, null, placement));

				if ( tab.length ) {
					this.select(this.dom.tab.index(tab[0]));
				} else if ( pane.length ) {
					this.select(this.dom.pane.index(pane[0]));
				}

			}

		},

		destroy: function () {
			dom.destroy.call(this);
			events.destroy.call(this);
			instance.destroy.call(this);
		},

		current: null,

		defaults: {
			type: 'tab',
			initial: 1,
			multiSelect: false,
			tab: '> ul > li > a, > ul > li > button',
			pane: '> div > div',
			changeURL: false,
			select: function () {},
			create: function () {},
			namespace: plugin.ns.css
		}

	});

	/**
	 * @class
	 * @extends {Tabify}
	 */
	function Tabs () {
		Tabs._super.constructor.apply(this, arguments);

	}
	function TabsTemp () {}
	TabsTemp.prototype = Tabify.prototype;
	Tabs.prototype = new TabsTemp();
	Tabs.prototype.constructor = Tabs;
	Tabs._super = Tabify.prototype;

	$.extend(Tabs.prototype, {

		select: function ( index ) {
			Tabs._super.select.apply(this, arguments);

			var isAlreadyActive = isAlreadyActiveState.call(this, this.newTab, this.newPane);

			this.toggleItem(this.dom.tab, false, 'tab');
			this.toggleItem(this.dom.pane, false, 'pane');

			if ( this.options.changeURL && this.newTab.is('a') && hasPushState ) {
				history.pushState({}, '', this.newTab.attr('href'));
			}

			this.toggleItem(this.newTab, true, 'tab');
			this.toggleItem(this.newPane, true, 'pane');

			if ( !isAlreadyActive ) {
				this.options.select.call(this.element, this.newTab, this.newPane);
				this.current = index;
			}
		}

	});

	/**
	 * @class
	 * @extends {Tabify}
	 */
	function Accordion () {
		Accordion._super.constructor.apply(this, arguments);
	}
	function AccordionTemp () {}
	AccordionTemp.prototype = Tabify.prototype;
	Accordion.prototype = new AccordionTemp();
	Accordion.prototype.constructor = Accordion;
	Accordion._super = Tabify.prototype;

	$.extend(Accordion.prototype, {

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

			this.activeTab = this.dom.tab.filter('.' + this.options.classes.isActive);
			this.activePane = this.dom.pane.filter('.' + this.options.classes.isActive);

			var isAlreadyActive   = isAlreadyActiveState.call(this, this.newTab, this.newPane);
			var multiSelectMethod = this.options.multiSelect ? 'not' : 'filter';

			this.toggleItem(this.dom.tab[multiSelectMethod](this.activeTab), false, 'tab');
			this.toggleItem(this.dom.pane[multiSelectMethod](this.activePane), false, 'pane');

			if ( this.options.changeURL && this.newTab.is('a') && hasPushState ) {
				history.pushState({}, '', isAlreadyActive ? '' : this.newTab.attr('href'));
			}

			this.toggleItem(this.newTab, !isAlreadyActive, 'tab');
			this.toggleItem(this.newPane, !isAlreadyActive, 'pane');

			this.options.select.call(this.element, this.newTab, this.newPane, !isAlreadyActive);
			this.current = index;
		}

	});

	/**
	 * @param  {Mixed} options
	 *
	 * @return {Object}
	 */
	function constructOptions ( options ) {
		return typeof(options) === 'object' ? options : {};
	}

	/**
	 * @param  {Object} options
	 *
	 * @return {Function}
	 */
	function constructMethod ( options ) {
		if ( options.type === 'accordion' ) {
			return Accordion;
		}
		return Tabs;
	}

	$.kist = $.kist || {};

	$.kist[plugin.name] = {
		defaults: Tabify.prototype.defaults
	};

	$.fn[plugin.name] = function ( options, placement ) {

		if ( typeof(options) === 'string' && $.inArray(options, plugin.publicMethods) !== -1 ) {
			return this.each(function () {
				var pluginInstance = $.data(this, plugin.name);
				if ( pluginInstance ) {
					pluginInstance[options](options === 'move' ? placement : undefined);
				}
			});
		}

		options = constructOptions(options);
		var Method = constructMethod(options);

		return this.each(function () {
			if (!$.data(this, plugin.name)) {
				$.data(this, plugin.name, new Method(this, options));
			}
		});

	};

})( jQuery, window, document );
