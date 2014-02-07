/*
 The MIT License (MIT)

 Copyright (c) 2014 Irrelon Software Limited
 http://www.irrelon.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice, url and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 Source: https://github.com/coolbloke1324/jquery-manipulation

 Changelog:
	 Version 1.0.0:
		First commit
 */
var Manipulation = function () {
	var self = this,
		arrIndex,
		arrItem;

	this._inform = [];
	this._manipulationCopies = {};
	this._manipulationMethods = [
		'addClass',
		'after',
		'append',
		'appendTo',
		'attr',
		'before',
		'css',
		'detach',
		'empty',
		'height',
		'html',
		'insertAfter',
		'insertBefore',
		'offset',
		'prepend',
		'prop',
		'remove',
		'removeAttr',
		'removeClass',
		'removeProp',
		'replaceAll',
		'replaceWith',
		'text',
		'toggleClass',
		'unwrap',
		'val',
		'wrap',
		'wrapAll',
		'wrapInner'
	];

	// Store existing manipulation methods so we can fire events
	// when parts of the DOM are changed
	for (arrIndex = 0; arrIndex < this._manipulationMethods.length; arrIndex++) {
		arrItem = this._manipulationMethods[arrIndex];

		// Store copy of original method
		this._manipulationCopies[arrItem] = $.fn[arrItem];

		// Now override the existing method with our own
		$.fn[arrItem] = function (methodName) {
			return function () {
				return self._manipulate(this, methodName, arguments);
			};
		}(arrItem);
	}
};

Manipulation.prototype._manipulate = function (context, method, args) {
	var result = this._manipulationCopies[method].apply(context, args),
		rootElem = $(context),
		informIndex,
		inform;

	// Check for at least one argument since you have to pass SOMETHING in order
	// to change a value from one thing to another
	if (args.length) {
		for (informIndex = 0; informIndex < this._inform.length; informIndex++) {
			inform = this._inform[informIndex];

			if (rootElem.parents(inform).length) {
				console.log('CHANGED');
			}
		}
	}

	return result;
};

Manipulation.prototype.escapeSelector = function (selector) {
	return selector.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
};

Manipulation.prototype.inform = function (selectorString) {
	this._inform.push(this.escapeSelector(selectorString));
};