@import("../../../bower_components/nestable/jquery.nestable.js");

fieldval_ui_extend(FVArrayField, FVField);
function FVArrayField(name, options) {
    var field = this;

    FVArrayField.superConstructor.call(this, name, options);

    field.fields = [];

    field.add_button_text = field.options.add_button_text!==undefined ? field.options.add_button_text : "+";
    field.add_field_buttons = [];

    field.element.addClass("fv_array_field");
    field.input_holder.append(
        field.fields_element = $("<div />").addClass("fv_array_fields"),
        field.create_add_field_button()
    )

    field.sortable = field.options.sortable===undefined || field.options.sortable!==false;
    
    if(field.sortable){
        field.element.addClass("fv_array_field_sortable");
        field.fields_element.nestable({
            rootClass: 'fv_array_fields',
            itemClass: 'fv_field',
            handleClass: 'fv_field_move_handle',
            itemNodeName: 'div.fv_field',
            listNodeName: 'div',
            threshold: 40
        }).on('change', function(e){
            field.reorder();
        });
    }
}

FVArrayField.prototype.reorder = function(){
    var field = this;

    field.fields = [];

    var children = field.fields_element.children();
    for(var i = 0; i < children.length; i++){
        var child = $(children[i]);
        var child_field = child.data("field");
        field.fields.push(child_field);
    }
}

FVArrayField.prototype.create_add_field_button = function(){
    var field = this;

    var add_field_button = $("<button/>",{type:"button"}).addClass("fv_add_field_button").text(field.add_button_text).on(FVForm.button_event,function(event){
        event.preventDefault();
        field.new_field(field.fields.length);
    });

    field.add_field_buttons.push(add_field_button);

    return add_field_button;
}

FVArrayField.prototype.new_field = function(index){
    var field = this;
    throw new Error("FVArrayField.new_field must be overriden to create fields");
}

FVArrayField.prototype.add_field = function(inner_field){
    var field = this;

    if(arguments.length===2){
        //Unused "name" as first parameter
        inner_field = arguments[1];//Use the field in the second argument
    }

    inner_field.in_array(field, function(){
        field.remove_field(inner_field);
    });
    inner_field.element.appendTo(field.fields_element);
    field.fields.push(inner_field);
    inner_field.parent = field;

    field.input_holder.nestable('init');

    if(field.is_disabled){
        inner_field.disable();
    }
}

FVArrayField.prototype.remove_field = function(target){
    var field = this;

    var inner_field,index;
    if(typeof target === "number" && (target%1)===0 && target>=0){
        index = target;
        inner_field = field.fields[target];
    } else if(target instanceof FVField){
        for(var i in field.fields){
            if(field.fields.hasOwnProperty(i)){
                if(field.fields[i]===target){
                    index = i;
                    inner_field = field.fields[i];
                    break;
                }
            }
        }
    } else {
        throw new Error("FVArrayField.remove_field only accepts non-negative integers or FVField instances");
    }

    if(inner_field){
        inner_field.remove(true);
        field.fields.splice(index, 1);
    }
}

FVArrayField.prototype.error = function(error){
    var field = this;

    FVArrayField.superClass.error.call(this,error);
}

FVArrayField.prototype.fields_error = function(error){
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


FVArrayField.prototype.clear_errors = function(){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.clear_errors();
    }    
}

FVArrayField.prototype.disable = function(){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.disable();
    }    
    for(var i=0; i<field.add_field_buttons.length; i++){
        var add_field_button = field.add_field_buttons[i];
        add_field_button.hide();
    }
    return FVField.prototype.disable.call(this);
}

FVArrayField.prototype.enable = function(){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.enable();
    }
    for(var i=0; i<field.add_field_buttons.length; i++){
        var add_field_button = field.add_field_buttons[i];
        add_field_button.show();
    }
    return FVField.prototype.enable.call(this);
}

FVArrayField.prototype.error = function(error) {
    var field = this;

    field.error_message.empty();

    if(error){

        if(error.error===undefined){
            console.error("No error provided");
            return;
        }

        if(error.error===5){
            field.fields_error(error);
            field.hide_error();
        } else {
            if(error.error===4){
                var error_list = $("<ul />");
                for(var i = 0; i < error.errors.length; i++){
                    var sub_error = error.errors[i];
                    if(sub_error.error===5){
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

FVArrayField.prototype.val = function(set_val) {
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
                if(!inner_field){//A field wasn't returned by the new_field function
                    inner_field = field.fields[i];
                }
                inner_field.val(set_val[i]);
        	}
        }
        return field;
    }
}