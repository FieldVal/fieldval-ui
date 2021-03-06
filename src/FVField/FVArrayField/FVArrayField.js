@import("../../../node_modules/nestable/jquery.nestable.js");

fieldval_ui_extend(FVArrayField, FVField);
function FVArrayField(name, options) {
    var field = this;

    FVArrayField.superConstructor.call(this, name, options);

    field.hide_add_button = field.options.hide_add_button || false;
    field.hide_remove_button = field.options.hide_remove_button || false;
    field.sortable = field.options.sortable || false;

    field.fields = [];

    field.add_button_text = field.options.add_button_text!==undefined ? field.options.add_button_text : "+";
    field.add_field_buttons = [];

    field.element.addClass("fv_array_field");
    field.input_holder.append(
        field.fields_element = $("<div />").addClass("fv_array_fields")
    )

    if (!field.hide_add_button) {
        field.input_holder.append(
            field.create_add_field_button()
        )
    }

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

    return field;
}

FVArrayField.prototype.create_add_field_button = function(){
    var field = this;

    var add_field_button = $("<button/>",{type:"button"}).addClass("fv_add_field_button").text(field.add_button_text).on(FVForm.button_event,function(event){
        event.preventDefault();
        field.add_field_clicked();
    });

    field.add_field_buttons.push(add_field_button);

    return add_field_button;
}

FVArrayField.prototype.add_field_clicked = function() {
    var field = this;
    var returned_field = field.new_field(field.fields.length);

    /* Allow the new_field function to just return a field -
     * this will add the field if it wasn't added in the new_field
     * callback. */
    if(returned_field){
        if(field.fields.indexOf(returned_field)===-1){
            field.add_field(returned_field);
        }
    }

    return field;
}

FVArrayField.prototype.new_field = function(index){
    var field = this;
    throw new Error("FVArrayField.new_field must be overriden to create fields");
}

FVArrayField.prototype.add_field = function(inner_field, suppress_change){
    var field = this;

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

    if(!suppress_change){
        field.did_change();
    }

    return field;
}

FVArrayField.prototype.remove = function(from_parent){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.remove(false,{ignore_change:true});
    }

    FVField.prototype.remove.call(this, from_parent);
}

FVArrayField.prototype.remove_field = function(target, options){
    var field = this;

    options = options || {};

    var inner_field,index;
    if(typeof target === "number" && (target%1)===0 && target>=0){
        index = target;
        inner_field = field.fields[target];
    } else if(target instanceof FVField){
        for(var i=0; i<field.fields.length; i++){
            if(field.fields[i]===target){
                index = i;
                inner_field = field.fields[i];
                break;
            }
        }
    } else {
        throw new Error("FVArrayField.remove_field only accepts non-negative integers or FVField instances");
    }

    if(inner_field){
        inner_field.remove(true);
        field.fields.splice(index, 1);

        if(!options.ignore_change){
            field.did_change();
        }

        return inner_field;
    }
}

FVArrayField.prototype.error = function(error){
    var field = this;

    FVArrayField.superClass.error.call(this,error);
}

FVArrayField.prototype.fields_error = function(error){
    var field = this;

    //.missing and .unrecognized are unused as of FieldVal 0.4.0

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
        for(var i=0; i<field.fields.length; i++){
            var inner_field = field.fields[i];
            inner_field.error(null);
        }
    }

    return field;
}


FVArrayField.prototype.clear_errors = function(){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.clear_errors();
    }

    return field;
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

FVArrayField.prototype.focus = function() {
    var field = this;

    for(var i = 0; i < field.fields.length; i++){
        var inner_field = field.fields[i];
        if(inner_field){
            inner_field.focus();
            return field;
        }
    }

    return FVField.prototype.focus.call(this);
}

FVArrayField.prototype.blur = function() {
    var field = this;

    field.suppress_blur = true;
    for(var i = 0; i < field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.blur();
    }
    field.suppress_blur = false;

    field.did_blur();

    return FVField.prototype.blur.call(this);
}

FVArrayField.prototype.error = function(error) {
    var field = this;

    field.error_message.empty();

    if(error){

        if(error.error===undefined){
            console.error("No error provided");
            return field;
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

    return field;
}

FVArrayField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {};

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
            options.ignore_parent_change = true;
            for(var i=0; i<set_val.length; i++){
        		var inner_field = field.fields[i];
                if(!inner_field){
                    inner_field = field.new_field(i);

                    /* Allow the new_field function to just return a field -
                     * this will add the field if it wasn't added in the new_field
                     * callback. */
                     if(inner_field){
                         if(field.fields.indexOf(inner_field)===-1){
                             field.add_field(inner_field,true);
                         }
                     }
                }
                if(!inner_field){//A field wasn't returned by the new_field function
                    inner_field = field.fields[i];
                }
                inner_field.val(set_val[i], options);
        	}
            if(set_val.length<field.fields.length){
                var to_remove = [];
                for(var i = set_val.length; i < field.fields.length; i++){
                    to_remove.push(field.fields[i]);
                }

                for(var i = 0; i < to_remove.length; i++){
                    var inner_field = to_remove[i];
                    inner_field.remove(false,{
                        ignore_change: true
                    });
                }
            }

            if (!options.ignore_change) {
                field.did_change(options);
            }
        }
        return field;
    }
}
