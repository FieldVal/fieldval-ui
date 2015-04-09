FVTextField is a standard text input field.

Constructor takes optional ```"type"``` parameter, which accepts any input tag attribute values (e.g. "text", "password" or "textarea").

When using the "textarea" type, the field will observe the ```"consume_tabs"``` option flag and will insert tabs on tab key presses, but therefore prevents the use of the tab key to shift the focus from the field.

```.val()``` returns a string.