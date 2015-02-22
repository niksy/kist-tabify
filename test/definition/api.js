// Tabs
$('.container').tabify({
	initial: 0,
	initial: 'foo',
	initial: function () {
		return 0;
	},
	tab: '.tab',
	pane: '.pane',
	namespace: 'Foo',
	select: function ( tab, pane ) {

	},
	deselect: function ( tab, pane ) {

	},
	create: function ( tab, pane ) {

	}
});

// Accordion
$('.container').tabify({
	type: 'accordion',
	tab: '.tab',
	pane: '.pane',
	namespace: 'Foo',
	select: function ( tab, pane ) {

	},
	deselect: function ( tab, pane ) {

	},
	create: function ( tab, pane ) {

	}
});

// Destroy
$('.container').tabify('destroy');

// Prev, next
$('.container').tabify('prev');
$('.container').tabify('next');

// Move
$('.container').tabify('move', 0);
$('.container').tabify('move', 'tabName');
