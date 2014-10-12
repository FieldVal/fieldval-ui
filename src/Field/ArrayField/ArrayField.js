@import("../../../bower_components/nestable/jquery.nestable.js");

fieldval_ui_extend(ArrayField, Field);
function ArrayField(name, options) {
    var field = this;

    ArrayField.superConstructor.call(this, name, options);

    field.fields = [];

    field.add_field_buttons = [];

    field.element.addClass("fv_array_field");
    field.input_holder.append(
        field.fields_element = $("<div />").addClass("fv_nested_fields"),
        field.create_add_field_button()
    )

    field.input_holder.nestable({
        rootClass: 'fv_input_holder',
        itemClass: 'fv_field',
        handleClass: 'fv_field_move_handle',
        itemNodeName: 'div.fv_field',
        listNodeName: 'div.fv_nested_fields',
        collapseBtnHTML: '',
        expandBtnHTML: '',
        maxDepth: 1
    }).on('change', function(e){
        field.reorder();
    });
}

ArrayField.prototype.reorder = function(){
    var field = this;

    field.fields = [];

    var children = field.fields_element.children();
    for(var i = 0; i < children.length; i++){
        var child = $(children[i]);
        var child_field = child.data("field");
        field.fields.push(child_field);
    }
}

ArrayField.prototype.create_add_field_button = function(){
    var field = this;

    var add_field_button = $("<button />").addClass("fv_add_field_button").text("+").on(FVForm.button_event,function(event){
        event.preventDefault();
        field.new_field(field.fields.length);
    });

    field.add_field_buttons.push(add_field_button);

    return add_field_button;
}

ArrayField.prototype.new_field = function(index){
    var field = this;
    throw new Error("ArrayField.new_field must be overriden to create fields");
}

ArrayField.prototype.add_field = function(name, inner_field){
    var field = this;

    inner_field.in_array(function(){
        field.remove_field(inner_field);
    });
    inner_field.element.appendTo(field.fields_element);
    field.fields.push(inner_field);

    field.input_holder.nestable('init');
}

ArrayField.prototype.remove_field = function(inner_field){
    var field = this;

    for(var i = 0; i < field.fields.length; i++){
        if(field.fields[i]===inner_field){
            field.fields.splice(i,1);
        }
    }
}

ArrayField.prototype.view_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].view_mode();
    }

    for(var i = 0; i < field.add_field_buttons.length; i++){
        var add_field_button = field.add_field_buttons[i];
        add_field_button.hide()
    }
}

ArrayField.prototype.edit_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].edit_mode();
    }

    for(var i = 0; i < field.add_field_buttons.length; i++){
        var add_field_button = field.add_field_buttons[i];
        add_field_button.show()
    }
}

ArrayField.prototype.error = function(error){
    var field = this;

    ArrayField.superClass.error.call(this,error);
}

ArrayField.prototype.fields_error = function(error){
    var field = this;

    if(error){
        var invalid_fields = error.invalid || {};
        var missing_fields = error.missing || {};
        var unrecognized_fields = error.unrecognized || {};
        
        for(var i = 0; i < field.fields.length; i++){
            var inner_field = field.fields[i];

            var field_error = invalid_fields[i] || missing_fields[i] || unrecognized_fields[i] || null;
            inner_field.error(field_error);
        }

    } else {
        for(var i in field.fields){
            var inner_field = field.fields[i];
            inner_field.error(null);
        }
    }
}


ArrayField.prototype.clear_errors = function(){
	var field = this;


}

ArrayField.prototype.error = function(error) {
    var field = this;

    field.error_message.empty();

    if(error){

        if(error.error===undefined){
            console.error("No error provided");
            return;
        }

        if(error.error===0){
            field.fields_error(error);
            field.hide_error();
        } else {
            if(error.error===4){
                var error_list = $("<ul />");
                for(var i = 0; i < error.errors.length; i++){
                    var sub_error = error.errors[i];
                    if(sub_error.error===0){
                        field.fields_error(sub_error);
                    } else {
                        error_list.append(
                            $("<li />").text(sub_error.error_message)
                        )
                    }
                }
                field.error_message.append(
                    error_list
                );
            } else {
                field.error_message.append(
                    $("<span />").text(error.error_message)
                )
            }
            field.show_error();
        }
    } else {
        //Clear error
        field.fields_error(null);
        field.hide_error();
    }
}

ArrayField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
    	var compiled = [];
    	for(var i=0; i<field.fields.length; i++){
    		var inner_field = field.fields[i];
            var value = inner_field.val();
    		compiled.push(value);
    	}
        return compiled;
    } else {
        if(set_val){
            for(var i=0; i<set_val.length; i++){
        		var inner_field = field.fields[i];
                if(!inner_field){
                    inner_field = field.new_field(i);
                }
                inner_field.val(set_val[i]);
        	}
        }
        return field;
    }
}