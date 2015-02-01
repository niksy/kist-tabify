var $ = require('jquery');
var getClassSelector = require('./get-class-selector');

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
