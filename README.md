# kist-tabify

Simple tabs and accordion interface.

## Installation

```sh
npm install kist-tabify --save

bower install kist-tabify --save
```

## API

### `$Element.tabify([options], [placement])`

Returns: `jQuery`

Element is container for tabs and corresponding panes. If panes can’t be found inside element, plugin will search for them outside container, beginning with `body` element.

#### options

Type: `Object|String`

##### Options defined as `Object`

###### type

Type: `String`  
Default: `tab`

Type of tabbing interface. It can be either `tab` or `accordion`.

###### initial

See [placement](#placement).

###### multiSelect

Type: `Boolean`  
Default: `false`

If it’s accordion interface, determines if multi tab selection is allowed.

###### tab

Type: `String`  
Default: `> ul > li > a, > ul > li > button`

Selector used to collect all tab toggler elements.

###### pane

Type: `String`  
Default: `> div > div`

Selector used to collect all tab pane elements.

###### changeURL

Type: `Boolean`  
Default: `false`

If tab toggler elements are anchor elements, determines if URL should be update with `href` value.

###### select

Type: `Function`  
Arguments: [Tab], [Pane]
Event: `tabifyselect`

Callback to run on tab selection.

###### deselect

Type: `Function`  
Arguments: [Tab], [Pane]
Event: `tabifydeselect`

Callback to run on tab deselection.

###### create

Type: `Function`  
Arguments: [Tab], [Pane]
Event: `tabifycreate`

Callback to run on tab instance creation.

##### Options defined as `String`

Type: `String`

###### destroy

Destroy plugin instance.

###### next

Move to next tab element.

###### prev

Move to previous tab element.

###### move

Move to tab element determined by second argument. Second argument accepts values like [options → initial](#initial).

#### placement

Type: `Integer|String|Function`  
Default: `1`

Initial element to select.

If defined as:

* Integer, it’s index of tab element to activate.
* String, it’s value of `id` attribute, `data-tab-id` attribute or `href` attribute value of tab element to activate.
* Function, it should return either index or string which correspond to integer and string values for this property.

## Examples

Default structure for tab interface.

```html
<div class="Tab">
	<ul class="Tab-items">
		<li class="Tab-item"><a href="#tab1" class="Tab-toggler">Tab 1</a></li>
		<li class="Tab-item"><a href="#tab2" class="Tab-toggler">Tab 2</a></li>
		<li class="Tab-item"><a href="#tab3" class="Tab-toggler">Tab 3</a></li>
	</ul>
	<div class="Tab-panes">
		<div class="Tab-pane Tab-pane--1" id="tab1">
			<p>Pane 1</p>
		</div>
		<div class="Tab-pane Tab-pane--2" id="tab2">
			<p>Pane 2</p>
		</div>
		<div class="Tab-pane Tab-pane--3" id="tab3">
			<p>Pane 3</p>
		</div>
	</div>
</div>
```

Setup tab instance.

```js
$('.Tab').tabify({
	type: 'tab',
	initial: 1,
	// initial: 'foo',
	// initial: function () { return 1; }
	tab: '.tab',
	pane: '.pane',
	namespace: 'Foobar',
	select: function ( tab, pane ) {
		// Do something on select.
	},
	deselect: function ( tab, pane ) {
		// Do something on deselect.
	},
	create: function ( tab, pane ) {
		// Do something on create.
	}
});
```

Move to next/previous tab.

```js
$('.Tab').tabify('prev');
$('.Tab').tabify('next');
```

Move to arbitrary tab.

```js
$('.Tab').tabify('move', 1);
$('.Tab').tabify('move', 'foo');
```

Destroy plugin instance.

```js
$('.Tab').tabify('destroy');
```

## Browser support

Tested in IE8+ and all modern browsers.

## License

MIT © [Ivan Nikolić](http://ivannikolic.com)
