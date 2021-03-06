fieldval_ui_extend(FVDateField, FVField);

function FVDateField(name, options) {//format is currently unused
    var field = this;

    if(typeof DateVal === 'undefined'){
        console.error("FVDateField requires the FieldVal package");
        return;
    }

    FVDateField.superConstructor.call(this, name, options);

    field.element.addClass("fv_date_field");

    field.format_string = field.options.format || "yyyy-MM-dd";

    var format_error = DateVal.date_format().check(field.format_string, function(emit_format_array){
        field.format_array = emit_format_array;
    })

    if(format_error){
        console.error(format_error.error_message);
        return;
    }

    field.inputs = [];

    for(var i = 0; i < field.format_array.length; i++){

        var component = field.format_array[i];
        var component_value = DateVal.date_components[component];

        field.add_element_from_component(component, component_value);
    }
}

FVDateField.character_width = 14;
FVDateField.padding_width = 4;

FVDateField.prototype.add_element_from_component = function(component, component_value){
    var field = this;

    if(component_value===0){
        var component_string = component;
        field.inputs.push(null);
        field.input_holder.append(
            $("<div />").addClass("fv_date_separator").text(component_string)
        )
    } else {
        var component_max_length = component_value[component_value.length-1];
        var input = $("<input />").attr({
            "placeholder": component,
            "size": component_max_length,
            "maxlength": component_max_length
        })
        .addClass("fv_date_input")
        .css({
            "width": (component_max_length * FVDateField.character_width) + FVDateField.padding_width
        })
        .on("keyup",function(){
            field.did_change()
        })
        .on("focus",function(e){
            field.did_focus();
        })
        .on("blur",function(e){
            var input_val = input.val();
            var padded = DateVal.pad_to_valid(input_val, component_value);
            input.val(padded);

            field.did_blur();
        })

        field.inputs.push(input);
        field.input_holder.append(input)
    }

    return field;
}

FVDateField.prototype.icon = function(params) {
    var field = this;

    return field;
}

FVDateField.prototype.change_name = function(name) {
    var field = this;

    FVDateField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

FVDateField.prototype.disable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", "disabled");
        }
    }
    return FVField.prototype.disable.call(this);
}

FVDateField.prototype.enable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", null);
        }
    }
    return FVField.prototype.enable.call(this);
}

FVDateField.prototype.focus = function() {
    var field = this;

    var input = field.inputs[0];
    if(input){
        input.focus();
    }

    return FVField.prototype.focus.call(this);
}

FVDateField.prototype.blur = function() {
    var field = this;

    field.suppress_blur = true;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.blur();
        }
    }
    field.suppress_blur = false;

    field.did_blur();

    return FVField.prototype.blur.call(this);
}

FVDateField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {};

    if (arguments.length===0) {

        var date_string = "";
        for(var i = 0; i < field.format_array.length; i++){
            var component = field.format_array[i];
            var component_value = DateVal.date_components[component];
            if(component_value===0){
                date_string+=component;
            } else {
                var input = field.inputs[i];
                var input_val = input.val().toString();

                date_string += DateVal.pad_to_valid(input_val, component_value);
            }
        }

        return date_string;
    } else {

        if(set_val!=null){

            if(typeof set_val === 'number'){
                //Allows using a timestamp as an input value
                set_val = DateVal.date_with_format_array(new Date(set_val), field.format_array);
            } else if(set_val instanceof Date){
                //Allows using a Date as an input value
                set_val = DateVal.date_with_format_array(set_val, field.format_array);
            }

            var validation = DateVal.date(field.format_string, {
                "emit": DateVal.EMIT_COMPONENT_ARRAY
            }).check(set_val, function(emitted){
                as_components = emitted;
            })

            if(validation){
                console.error("Invalid format passed to .val of FVDateField");
                return;
            }

            for(var i = 0; i < field.format_array.length; i++){
                var component = field.format_array[i];
                var component_value = DateVal.date_components[component];
                if(component_value===0){
                    date_string+=component;
                } else {
                    var input = field.inputs[i];
                    input.val(as_components[i]);
                }
            }

            if (!options.ignore_change) {
                field.did_change(options);
            }
        }

        return field;
    }
}
