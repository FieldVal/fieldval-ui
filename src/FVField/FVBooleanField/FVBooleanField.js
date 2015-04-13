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
    .on("focus",function(){
        field.did_focus();
    })
    .on("blur",function(){
        field.did_blur();
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
    return FVField.prototype.focus.call(this);
}

FVBooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return FVField.prototype.blur.call(this);
}

FVBooleanField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {}

    if (arguments.length===0) {
        return field.input.is(":checked")
    } else {
        if(set_val==="true"){
            set_val = true;
        } else if(set_val==="false"){
            set_val = false;
        }
       	field.input.prop('checked', set_val);
        
        if (!options.ignore_change) {
            field.did_change(options);
        }

        return field;
    }
}