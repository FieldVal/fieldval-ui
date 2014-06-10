fieldval_ui_extend(BooleanField, Field);

function BooleanField(name, properties) {
    var field = this;

    BooleanField.superConstructor.call(this, name, properties);

    field.element.addClass("choice_field");

    field.input = $("<input type='checkbox' />")
    .addClass("boolean_input")
    .on("change",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

BooleanField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return field;
}

BooleanField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return field;
}

BooleanField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

BooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

BooleanField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.is(":checked")
    } else {
       	field.input.prop('checked', set_val);
        return field;
    }
}