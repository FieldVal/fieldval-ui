fieldval_ui_extend(FVBooleanField, FVField);

function FVBooleanField(name, options) {
    var field = this;

    FVBooleanField.superConstructor.call(this, name, options);

    field.element.addClass("fv_boolean_field");

    field.input = $("<input type='checkbox' />")
    .addClass("fv_boolean_input")
    .on("change",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

FVBooleanField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return FVField.prototype.disable.call(this);
}

FVBooleanField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return FVField.prototype.enable.call(this);
}

FVBooleanField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

FVBooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

FVBooleanField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.is(":checked")
    } else {
        if(set_val==="true"){
            set_val = true;
        } else if(set_val==="false"){
            set_val = false;
        }
       	field.input.prop('checked', set_val);
        field.did_change();
        return field;
    }
}