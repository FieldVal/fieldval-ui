FVKeyValueField is a custom field that implements an object field with dynamic key values.

Click on the add button calls ```new_field``` method, which has to be implemented by the developer. The method should create any FieldVal UI compatible field, pass it to the ```add_field``` method of the FVKeyValueField object and then return the field.

```.val()``` returns an object.