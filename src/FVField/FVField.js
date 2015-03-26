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

    if(field.options.use_form){
        field.element = $("<form />",{
            "novalidate": "novalidate"//Disable browser-based validation
        })
        .addClass("fv_field fv_form")
        .data("field",field)
        .on("submit",function(event){
            event.preventDefault();
            field.submit();
            return false;
        });
        field.on_submit_callbacks = [];
    } else {
        field.element = $("<div />").addClass("fv_field").data("field",field);
    }
    field.title = $("<div />").addClass("fv_field_title").text(field.name?field.name:"")
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

FVField.prototype.clear_errors = function(){
    var field = this;

    field.error(null);
}

FVField.prototype.on_submit = function(callback){
    var field = this;

    field.on_submit_callbacks.push(callback);

    return field;
}

FVField.prototype.submit = function(){
    var field = this;

    var compiled = field.val();
    for(var i = 0; i < field.on_submit_callbacks.length; i++){
        var callback = field.on_submit_callbacks[i];
        callback(compiled);
    }

    return compiled;
}

FVField.prototype.in_array = function(parent, remove_callback){
    var field = this;

    field.array_parent = parent;
    field.is_in_array = true;
    field.array_remove_callback = remove_callback;

    field.element.addClass("fv_in_array");

    if(field.array_parent.sortable){
        field.element.append(
            field.move_handle = $("<div />")
            .addClass("fv_field_move_handle")
        );
    }

    field.element.append(
        field.remove_button = $("<button />",{type:"button"})
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            field.array_remove_callback(field.key_name);
            remove_callback();
            field.remove();
        })
    )
}

FVField.prototype.in_key_value = function(parent, remove_callback){
    var field = this;

    field.key_value_parent = parent;
    field.is_in_key_value = true;
    field.key_value_remove_callback = remove_callback;

    field.name_input = new FVTextField("Key").on_change(function(name_val){
        field.key_name = field.key_value_parent.change_key_name(field.key_name, name_val, field);
    });
    field.name_input.element.addClass("fv_key_value_name_input")
    field.title.replaceWith(field.name_input.element);

    field.element.addClass("fv_in_key_value")
    .append(
        field.remove_button = $("<button />",{type:"button"})
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            field.key_value_remove_callback(field.key_name);
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

FVField.prototype.did_change = function(options){
    var field = this;

    if (options === undefined) {
        options = {}
    }   

    var val = field.val();

    for(var i = 0; i < field.on_change_callbacks.length; i++){
        var callback = field.on_change_callbacks[i];

        callback(val);
    }

    if (field.parent && !options.ignore_parent_change) {
        field.parent.did_change();
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

    if(field.name_input){
        field.name_input.disable();
    }

    if(field.move_handle){
        field.move_handle.hide();
    }

    if(field.remove_button){
        field.remove_button.hide();
    }

    return field;
}

FVField.prototype.enable = function() {
    var field = this;
    field.is_disabled = false;
    field.element.removeClass("fv_disabled");

    if(field.name_input){
        field.name_input.enable();
    }

    if(field.move_handle){
        field.move_handle.show();
    }

    if(field.remove_button){
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