You can extend any of the field types and override necessary methods.

In order to start from scratch, subclass [FVField](https://github.com/FieldVal/fieldval-ui/blob/master/src/FVField/FVField.js), which is a base class that all fields extend.

Create necessary visual elements in the constructor and append them to the ```input_holder``` variable of the field.

Override following methods:

```
disable()
```
Disables field the input.

<br>


```
enable()
```
Enables field input.

<br>

```
focus()
```
Focuses the field.

<br>

```
blur()
```
Removes the focus from the field.

<br>

```
val(set_val)
```
Sets field's value if set_val is specified. Otherwise returns field's current value.

<br>

[FVBooleanField](https://github.com/FieldVal/fieldval-ui/blob/master/src/FVField/FVBooleanField/FVBooleanField.js) is a good example of a simple field.