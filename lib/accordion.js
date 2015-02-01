var Tabify = require('./constructor');
var meta = require('./meta');
var emit = require('kist-toolbox/lib/event-emitter')(meta.name);

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
