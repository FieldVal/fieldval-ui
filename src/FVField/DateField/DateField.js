fieldval_ui_extend(DateField, FVField);

function DateField(name, options) {//format is currently unused
    var field = this;

    if(typeof DateVal === 'undefined'){
        console.error("DateField requires fieldval-dateval-js");
        return;
    }

    DateField.superConstructor.call(this, name, options);

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

DateField.prototype.add_element_from_component = function(component, component_value){
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
        .on("keyup",function(){
            field.did_change()
        })

        input.blur(function(){
            var input_val = input.val();
            var padded = DateVal.pad_to_valid(input_val, component_value);
            input.val(padded);
        })

        field.inputs.push(input);
        field.input_holder.append(input)
    }
}

DateField.prototype.icon = function(params) {
    var field = this;

    return field;
}

DateField.prototype.change_name = function(name) {
    var field = this;

    DateField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

DateField.prototype.disable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", "disabled");
        }
    }
    return Field.prototype.disable.call(this);
}

DateField.prototype.enable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", null);
        }
    }
    return Field.prototype.enable.call(this);
}

DateField.prototype.focus = function() {
    var field = this;
    
    var input = field.inputs[0];
    if(input){
        input.blur();
    }

    return field;
}

DateField.prototype.blur = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.blur();
        }
    }
    return field;
}

DateField.prototype.val = function(set_val) {
    var field = this;

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
                console.error("Invalid format passed to .val of DateField");
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
        }

        return field;
    }
}