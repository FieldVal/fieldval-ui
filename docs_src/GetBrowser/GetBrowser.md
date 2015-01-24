This simple example shows how to build a form that contains 3 fields and a submit button.

The form is an instance of the ```FVForm``` class.

Fields are individual instances of classes such as FVTextField, FVBooleanField (full list [here](/docs/fieldvalui/Fields)). The first argument in a field constructor is usually its display name.

Fields are added to the form using ```form.add_field()```. The first argument is the key for the field in the form; the second is the field instance.

```form.element``` is a jQuery element that should be appended to the parent container.

Because form.element is a ```<form>```, any button that is appended to it will act as a submit button and will result in ```form.on_submit``` being called.