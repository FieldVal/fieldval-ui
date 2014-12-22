function FVField(name, options) {
    var field = this;

    field.name = name;
    field.options = options || {};

    field.output_flag = true;
    field.is_in_array = false;
    field.key_value_parent = null;
    field.is_in_key_value = false;
    field.is_disabled = false;

    field.on_change_callbacks = [];

    field.element = $("<div />").addClass("fv_field").data("field",field);
    field.title = $("<div />").addClass("fv_field_title").text(field.name)
    if(!field.name){
        //Field name is empty
        field.title.hide();
    }
    if(field.options.description){
        field.description_label = $("<div />").addClass("fv_field_description").text(field.options.description)
    }
    field.input_holder = $("<div />").addClass("fv_input_holder")
    field.error_message = $("<div />").addClass("fv_error_message").hide()

    field.layout();
}

FVField.prototype.in_array = function(remove_callback){
    var field = this;

    field.is_in_array = true;

    field.element.addClass("fv_in_array")
    .append(
        field.move_handle = $("<div />")
        .addClass("fv_field_move_handle")
    ,
        field.remove_button = $("<button />")
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            remove_callback();
            field.remove();
        })
    )
}

FVField.prototype.in_key_value = function(parent, remove_callback){
    var field = this;

    field.key_value_parent = parent;
    field.is_in_key_value = true;

    field.name_input = new FVTextField("Key").on_change(function(name_val){
        field.key_name = field.key_value_parent.change_key_name(field.key_name, name_val, field);
    });
    field.name_input.element.addClass("fv_key_value_name_input")
    field.title.replaceWith(field.name_input.element);

    field.element.addClass("fv_in_key_value")
    .append(
        field.remove_button = $("<button />")
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            remove_callback();
            field.remove();
        })
    )
}

FVField.prototype.init = function(){
    var field = this;
}

FVField.prototype.remove = function(from_parent){
    var field = this;

    field.element.remove();
    if(field.parent && !from_parent){//from_parent prevents cycling
        field.parent.remove_field(field);
        field.parent = null;
    }
}

FVField.prototype.change_name = function(name) {
    var field = this;
    field.name = name;
    return field;
}

FVField.prototype.layout = function(){
    var field = this;

    field.element.append(
        field.title,
        field.description_label,
        field.input_holder,
        field.error_message
    )
}

FVField.prototype.on_change = function(callback){
    var field = this;

    field.on_change_callbacks.push(callback);

    return field;
}

FVField.prototype.output = function(do_output){
    var field = this;
    field.output_flag = do_output;
    return field;
}

FVField.prototype.did_change = function(){
    var field = this;

    var val = field.val();

    for(var i = 0; i < field.on_change_callbacks.length; i++){
        var callback = field.on_change_callbacks[i];

        callback(val);
    }
    return field;
}

FVField.prototype.icon = function(params) {
    var field = this;
}

FVField.prototype.val = function(set_val) {
    console.error("Did not override FVField.val()")
}

FVField.prototype.disable = function() {
    var field = this;
    field.is_disabled = true;
    field.element.addClass("fv_disabled");

    if(field.is_in_array){
        field.move_handle.hide();
        field.remove_button.hide();
    }

    return field;
}

FVField.prototype.enable = function() {
    var field = this;
    field.is_disabled = false;
    field.element.removeClass("fv_disabled");

    if(field.is_in_array){
        field.move_handle.show();
        field.remove_button.show();
    }

    return field;
}

FVField.prototype.blur = function() {
    var field = this;
}

FVField.prototype.focus = function() {
    var field = this;
}

FVField.prototype.show_error = function(){
    var field = this;
    field.error_message.show();
}

FVField.prototype.hide_error = function(){
    var field = this;
    field.error_message.hide();
}

//Used in key_value fields
FVField.prototype.name_val = function(){
    var field = this;

    var response = field.name_input.val.apply(field.name_input,arguments);
    field.key_name = field.key_value_parent.change_key_name(field.key_name, field.name_input.val(), field);
    return response;
}

FVField.prototype.error = function(error) {
    var field = this;

    if (error) {
        field.error_message.empty();
        if(error.error===4){
            var error_list = $("<ul />");
            for(var i = 0; i < error.errors.length; i++){
                var sub_error = error.errors[i];
                error_list.append(
                    $("<li />").text(sub_error.error_message)
                )
            }
            field.error_message.append(
                error_list
            );
        } else {
            field.error_message.append(
                $("<span />").text(error.error_message)
            )
        }
        if(field.element){
            field.element.addClass("fv_field_error");
        }
        field.show_error();
    } else {
        field.hide_error();
        if(field.element){
            field.element.removeClass("fv_field_error");
        }
    }
}