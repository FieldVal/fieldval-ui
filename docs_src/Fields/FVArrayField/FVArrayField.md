FVArrayField is a custom field that implements a list of elements of any type.

Optional second parameter of the constructor is an object with options.
Available options: ```add_button_text``` that modifies text of array field's "add" button.

Click on the add button calls ```new_field``` method, which has to be implemented by the developer. The method should create any FieldVal UI compatible field and pass it to the ```add_field``` method of the FVArrayField object.

```.val()``` returns a list of values.