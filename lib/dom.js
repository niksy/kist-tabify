// jscs:disable requireCapitalizedComments
// jscs:disable disallowQuotedKeysInObjects

var $ = require('jquery');
var meta = require('./meta');
var htmlClasses = require('./html-classes');
var AriaGenerator = require('./aria-generator');

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
