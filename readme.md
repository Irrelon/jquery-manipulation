# Manipulation
#### jQuery DOM Change Tracker
Detects changes made using jQuery to the DOM and fires the change() method for the changes elements.

## Usage
    // Enable the plugin by instantiating it
    new Manipulation();
  
On elements you wish to receive change events on:

    <div id="test" data-track="attr"></div>

Then when you use the jQuery attr() method to change an attribute on that element, the plugin will fire the change event:

    // Hook the change event
    $('#test').on('change', function () {
        console.log('changed!');
    });

    // Add a new attribute to the #test div which will fire the change event
    $('#test').attr('data-some-attribute', 'hello');
  
    // Call it again with the same value which will NOT fire the change event
    $('#test').attr('data-some-attribute', 'hello');
  
    // Call a third time and change the value again which will fire the change event
    $('#test').attr('data-some-attribute', 'goodbye');

You can track changes for other jQuery method calls by a comma-separated list of methods to track changes for:

    <div id="test" data-track="attr,html"></div>

Then see the change occur when calling html()

    // Update the innerHTML of the element
    $('#test').html('Some new HTML!');
