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

	this._manipulationCopies = {};
	this._manipulationMethods = {
		'addClass': {

		},
		'after': {

		},
		'append': {

		},
		'appendTo': {

		},
		'attr': {
			setOn: 1,
			setViaObj: true
		},
		'before': {

		},
		'css': {
			setOn: 1,
			setViaObj: true
		},
		'detach': {

		},
		'empty': {

		},
		'height': {

		},
		'html': {
			setOn: 0
		},
		'insertAfter': {

		},
		'insertBefore': {

		},
		'offset': {

		},
		'prepend': {

		},
		'prop': {
			setOn: 1,
			setViaObj: true
		},
		'remove': {

		},
		'removeAttr': {

		},
		'removeClass': {

		},
		'removeProp': {

		},
		'replaceAll': {

		},
		'replaceWith': {

		},
		'text': {
			setOn: 0
		},
		'toggleClass': {

		},
		'unwrap': {

		},
		'val': {
			setOn: 0
		},
		'wrap': {

		},
		'wrapAll': {

		},
		'wrapInner': {

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

/**
 * Private method that handles the call to the jquery method, checks for changes and
 * fires events to listeners.
 * @param context
 * @param method
 * @param args
 * @returns {*}
 * @private
 */
Manipulation.prototype._manipulate = function (context, method, args) {
	var rootElem = $(context),
		methodOps,
		getterArgs,
		currentVal,
		resultVal,
		newVal,
		currentValObj,
		newValObj,
		elemTrackText,
		elemTrack,
		elemTrackOptionsText,
		optionsArr,
		options,
		changed,
		objKey,
		objChange = false,
		setter = false,
		process = false,
		i;

	elemTrackText = this._manipulationCopies.attr.apply(rootElem, ['data-track']);
	if (elemTrackText) {
		elemTrack = elemTrackText.split(',');

		// Check that this element should be tracked
		if (elemTrack.length) {
			// Get the method options data
			methodOps = this._manipulationMethods[method];

			// Check if the method is one we should track
			if (elemTrack.indexOf('all') > -1 || elemTrack.indexOf(method) > -1) {
				process = true;
				changed = [];

				// Check for tracking options
				elemTrackOptionsText = this._manipulationCopies.attr.apply(rootElem, ['data-track-options']);
				if (elemTrackOptionsText) {
					options = {};
					optionsArr = elemTrackOptionsText.split(',');

					for (i = 0; i < optionsArr.length; i++) {
						options[optionsArr[i]] = true;
					}
				} else {
					options = {};
				}
			}
		}
	}

	if (process) {
		// Check if a setter argument was passed
		if (methodOps.setOn !== undefined) {
			if (args[methodOps.setOn]) {
				setter = true;

				// Setter argument passed
				getterArgs = Array.prototype.slice.call(args, 0, methodOps.setOn);
				currentVal = this._manipulationCopies[method].apply(context, getterArgs);

				// Now call the setter
				resultVal = this._manipulationCopies[method].apply(context, args);

				// Now call the getter again and record the new value
				newVal = this._manipulationCopies[method].apply(context, getterArgs);

				if (currentVal !== newVal) {
					if (options['diff']) {
						if (methodOps.setOn === 0) {
							// The setter for this method is on argument zero so pass the method name as the
							// item that has changes e.g. "html" for the .html('<div>Moo</div>') call
							changed.push({
								method: method,
								oldContent: currentVal,
								newContent: newVal
							});
						} else {
							// Add the argument value as the change
							changed.push({
								method: method,
								param: args[methodOps.setOn],
								oldContent: currentVal,
								newContent: newVal
							});
						}
					}

					objChange = true;
				}
			} else {
				// Check if the method supports object-based setting
				if (methodOps.setViaObj) {
					// Check if args[0] exists and is an object
					if (args[0] && typeof args[0] === 'object') {
						setter = true;

						// A setter object was passed so loop it
						currentValObj = {};
						newValObj = {};

						// Get the existing values
						for (objKey in args[0]) {
							if (args[0].hasOwnProperty(objKey)) {
								currentValObj[objKey] = this._manipulationCopies[method].apply(context, [objKey]);
							}
						}

						// Now call the setter
						resultVal = this._manipulationCopies[method].apply(context, args);

						// Now get the new values
						for (objKey in args[0]) {
							if (args[0].hasOwnProperty(objKey)) {
								newValObj[objKey] = this._manipulationCopies[method].apply(context, [objKey]);
								if (newValObj[objKey] !== currentValObj[objKey]) {
									if (options['diff']) {
										changed.push({
											method: method,
											param: objKey,
											oldContent: currentValObj[objKey],
											newContent: newValObj[objKey]
										});
									}

									objChange = true;
								}
							}
						}
					}
				}
			}

			// Check if we have a value change
			if (objChange) {
				// Loop the inform listeners to see if any of their selectors are a parent of the affected element
				rootElem.trigger('change', [changed]);
			}
		}
	}

	// If we aren't setting anything, just pass through straight to jQuery
	if (!process || !setter) {
		return this._manipulationCopies[method].apply(context, args);
	}

	return resultVal;
};
