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
	this._manipulationMethods = {
		'addClass': {
			active: false
		},
		'after': {
			active: false
		},
		'append': {
			active: false
		},
		'appendTo': {
			active: false
		},
		'attr': {
			active: false,
			setOn: 1,
			setViaObj: true
		},
		'before': {
			active: false
		},
		'css': {
			active: false,
			setOn: 1,
			setViaObj: true
		},
		'detach': {
			active: false
		},
		'empty': {
			active: false
		},
		'height': {
			active: false
		},
		'html': {
			active: false,
			setOn: 0
		},
		'insertAfter': {
			active: false
		},
		'insertBefore': {
			active: false
		},
		'offset': {
			active: false
		},
		'prepend': {
			active: false
		},
		'prop': {
			active: false,
			setOn: 1,
			setViaObj: true
		},
		'remove': {
			active: false
		},
		'removeAttr': {
			active: false
		},
		'removeClass': {
			active: false
		},
		'removeProp': {
			active: false
		},
		'replaceAll': {
			active: false
		},
		'replaceWith': {
			active: false
		},
		'text': {
			active: false,
			setOn: 0
		},
		'toggleClass': {
			active: false
		},
		'unwrap': {
			active: false
		},
		'val': {
			active: false,
			setOn: 0
		},
		'wrap': {
			active: false
		},
		'wrapAll': {
			active: false
		},
		'wrapInner': {
			active: false
		}
	};

	// Store existing manipulation methods so we can fire events
	// when parts of the DOM are changed
	for (arrIndex in this._manipulationMethods) {
		if (this._manipulationMethods.hasOwnProperty(arrIndex)) {
			arrItem = this._manipulationMethods[arrIndex];

			// Store copy of original method
			this._manipulationCopies[arrIndex] = $.fn[arrIndex];

			// Now override the existing method with our own
			if (typeof(this['_' + arrIndex]) === 'function ') {
				$.fn[arrIndex] = function (methodName) {
					return function () {
						return self['_' + methodName](this, methodName, arguments);
					};
				}(arrIndex);
			} else {
				// Use the generic manipulate method
				$.fn[arrIndex] = function (methodName) {
					return function () {
						return self._manipulate(this, methodName, arguments);
					};
				}(arrIndex);
			}
		}
	}
};

Manipulation.prototype._manipulate = function (context, method, args) {
	var methodOps = this._manipulationMethods[method],
		getterArgs,
		currentVal,
		resultVal,
		newVal,
		rootElem = $(context),
		informIndex,
		inform;

	// Check if a setter argument was passed
	if (methodOps.setOn !== undefined) {
		if (args[methodOps.setOn]) {
			// Setter argument passed
			getterArgs = Array.prototype.slice.call(args, 0, methodOps.setOn);
			currentVal = this._manipulationCopies[method].apply(context, getterArgs);

			// Now call the setter
			resultVal = this._manipulationCopies[method].apply(context, args);

			// Now call the getter again and record the new value
			newVal = this._manipulationCopies[method].apply(context, getterArgs);
		} else {
			// Check if the method supports object-based setting
			if (methodOps.setViaObj) {
				// Check if args[0] exists and is an object
				if (args[0] && typeof args[0] === 'object') {
					// A setter object was passed so loop it

				}
			} else {
				// No set via obj support, this call is a getter
				return this._manipulationCopies[method].apply(context, args);
			}
		}

		// Check if we have a value change
		if (currentVal !== newVal) {
			// Loop the inform listeners to see if any of their selectors are a parent of the affected element
			for (informIndex = 0; informIndex < this._inform.length; informIndex++) {
				inform = this._inform[informIndex];

				if (rootElem.parents(inform).length) {
					console.log('CHANGED via ' + method, getterArgs, currentVal, newVal);
				}
			}
		}
	} else {
		return this._manipulationCopies[method].apply(context, args);
	}

	return resultVal;
};

Manipulation.prototype.escapeSelector = function (selector) {
	return selector.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|\/@])/g, '\\$1');
};

Manipulation.prototype.inform = function (selectorString, types) {
	this._inform.push(selectorString);
};
