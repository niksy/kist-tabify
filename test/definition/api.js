// Tabs
$('.container').tabify({
	initial: 1,
	initial: 'foo',
	initial: function () {
		return 1;
	},
	tab: '.tab',
	pane: '.pane',
	namespace: 'Foo',
	select: function ( tab, pane ) {

	},
	deselect: function ( tab, pane ) {

	},
	create: function () {

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
$('.container').tabify('move', 1);
$('.container').tabify('move', 'tabName');
