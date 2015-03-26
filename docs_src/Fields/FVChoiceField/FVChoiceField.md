FVChoiceField is a custom text field that provides a dropdown list of pre-defined values that match the current input.

Second argument of the constructor is an object with several keys:

* ```choices``` is a list of values to choose form. Values can also be an array containing two elements: the value that should be returned and its display text as shown in the second example.
* ```allow_empty``` is an optional boolean that specifies whether a FVChoiceField should allow choosing an ```empty``` value that returns null.
* ```empty_text``` specifies the display text for the ```empty``` value

```.val()``` returns a chosen value, specified in ```choices``` array.