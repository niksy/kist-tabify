var Tabify = require('./constructor');

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
