function Field(name) {
    var field = this;

    field.name = name;

    field.show_on_form_flag = true;
    field.is_in_array = false;

    field.on_change_callbacks = [];

    field.container = $("<div />").addClass("fv_field_container");
    field.element = $("<div />").addClass("fv_field");
    field.title = $("<div />").addClass("fv_field_title").text(field.name)
    field.input_holder = $("<div />").addClass("fv_input_holder")
    field.error_message = $("<div />").addClass("fv_error_message").hide()

    field.layout();
}

Field.prototype.in_array = function(remove_callback){
    var field = this;

    field.is_in_array = true;

    field.element.addClass("fv_nested")
    .append(
        $("<button />")
        .addClass("fv_field_remove_button")
        .text("X").on(FVForm.button_event,function(event){
            event.preventDefault();
            remove_callback();
            field.remove();
        })
    )
}

Field.prototype.init = function(){
    var field = this;
}

Field.prototype.remove = function(){
    var field = this;

    field.container.remove();
}

Field.prototype.view_mode = function(){
    var field = this;    
}

Field.prototype.edit_mode = function(){
    var field = this;    
}

Field.prototype.change_name = function(name) {
    var field = this;
    field.name = name;
    return field;
}

Field.prototype.layout = function(){
    var field = this;

    field.container.append(
        field.title,
        field.element.append(
            field.input_holder,
            field.error_message
        )
    )
}

Field.prototype.on_change = function(callback){
    var field = this;

    field.on_change_callbacks.push(callback);

    return field;
}

Field.prototype.hide_on_form = function(){
    var field = this;
    field.show_on_form_flag = false;
    return field;
}

Field.prototype.show_on_form = function(){
    var field = this;
    field.show_on_form_flag = true;
    return field;
}

Field.prototype.did_change = function(){
    var field = this;

    var val = field.val();

    for(var i = 0; i < field.on_change_callbacks.length; i++){
        var callback = field.on_change_callbacks[i];

        callback(val);
    }
    return field;
}

Field.prototype.icon = function(params) {
    var field = this;
}

Field.prototype.val = function(set_val) {
    console.error("Did not override Field.val()")
}

Field.prototype.disable = function() {
    var field = this;
}

Field.prototype.enable = function() {
    var field = this;
}

Field.prototype.blur = function() {
    var field = this;
}

Field.prototype.focus = function() {
    var field = this;
}

Field.prototype.show_error = function(){
    var field = this;
    field.error_message.show();
}

Field.prototype.hide_error = function(){
    var field = this;
    field.error_message.hide();
}

Field.prototype.error = function(error) {
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
        if(field.container){
            field.container.addClass("fv_field_error");
        }
        field.show_error();
    } else {
        field.hide_error();
        if(field.container){
            field.container.removeClass("fv_field_error");
        }
    }
}