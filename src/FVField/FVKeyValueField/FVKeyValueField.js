fieldval_ui_extend(FVKeyValueField, FVField);
function FVKeyValueField(name, options) {
    var field = this;

    FVKeyValueField.superConstructor.call(this, name, options);

    field.fields = [];
    field.keys = {};

    field.add_button_text = field.options.add_button_text!==undefined ? field.options.add_button_text : "+";
    field.add_field_buttons = [];

    field.element.addClass("fv_key_value_field");
    field.input_holder.append(
        field.fields_element = $("<div />").addClass("fv_key_value_fields"),
        field.create_add_field_button()
    )
}

FVKeyValueField.prototype.create_add_field_button = function(){
    var field = this;

    var add_field_button = $("<button />",{type:"button"}).addClass("fv_add_field_button").text(field.add_button_text).on(FVForm.button_event,function(event){
        event.preventDefault();
        field.add_field_clicked();
    });

    field.add_field_buttons.push(add_field_button);

    return add_field_button;
}

FVKeyValueField.prototype.add_field_clicked = function() {
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
}

FVKeyValueField.prototype.new_field = function(){
    var field = this;
    throw new Error("FVKeyValueField.new_field must be overriden to create fields");
}

FVKeyValueField.prototype.add_field = function(inner_field){
    var field = this;

    if(arguments.length===2){
        //Unused "name" as first parameter
        inner_field = arguments[1];//Use the field in the second argument
    }

    inner_field.in_key_value(field,function(key_name){
        field.remove_field(inner_field, key_name);
    });
    inner_field.element.appendTo(field.fields_element);
    field.fields.push(inner_field);
    inner_field.parent = field;

    inner_field.name_val("");

    if(field.is_disabled){
        inner_field.disable();
    }
}

FVKeyValueField.prototype.change_key_name = function(old_name,new_name,inner_field){
    var field = this;

    if(old_name!==undefined){
        var old_field = field.keys[old_name];
        if(old_field===inner_field){
            delete field.keys[old_name];
        } else {
            throw new Error("Old key name does not match this field ",old_name);
        }
    }

    if(new_name===null){
        new_name = "";
    }
    var final_name_val = new_name;
    var incr = 2;
    while(field.keys[final_name_val]!==undefined){
        final_name_val = new_name + "_" + incr++;
    }
    field.keys[final_name_val] = inner_field;

    return final_name_val;
}

FVKeyValueField.prototype.remove_field = function(target){
    var field = this;

    var inner_field;
    var index;
    if(typeof target === "string"){
        for(var i = 0; i < field.fields.length; i++){
            if(field.fields[i].name_val()===target){
                inner_field = field.fields[i];
                index = i;
                break;
            }
        }
    } else if(target instanceof FVField){
        for(var i = 0; i < field.fields.length; i++){
            if(field.fields.hasOwnProperty(i)){
                if(field.fields[i]===target){
                    inner_field = field.fields[i];
                    index = i;
                    break;
                }
            }
        }
    } else {
        throw new Error("FVKeyValueField.remove_field only accepts strings or FVField instances");
    }

    if(inner_field){
        inner_field.remove(true);
        field.fields.splice(index, 1);
        delete field.keys[inner_field.key_name];
    }
}

FVKeyValueField.prototype.error = function(error){
    var field = this;

    FVKeyValueField.superClass.error.call(this,error);
}

FVKeyValueField.prototype.fields_error = function(error){
    var field = this;

    //.missing and .unrecognized are unused as of FieldVal 0.4.0

    if(error){
        var invalid_fields = error.invalid || {};
        var missing_fields = error.missing || {};
        var unrecognized_fields = error.unrecognized || {};
        
        for(var i in field.keys){
            if(field.keys.hasOwnProperty(i)){
                var inner_field = field.keys[i];

                var field_error = invalid_fields[i] || missing_fields[i] || unrecognized_fields[i] || null;
                inner_field.error(field_error);
            }
        }

    } else {
        for(var i in field.keys){
            if(field.keys.hasOwnProperty(i)){
                var inner_field = field.keys[i];
                inner_field.error(null);
            }
        }
    }
}


FVKeyValueField.prototype.clear_errors = function(){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.clear_errors();
    }    
}

FVKeyValueField.prototype.disable = function(){
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

FVKeyValueField.prototype.enable = function(){
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

FVKeyValueField.prototype.error = function(error) {
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

FVKeyValueField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {};

    if (arguments.length===0) {
    	var compiled = {};
    	for(var i in field.keys){
            if(field.keys.hasOwnProperty(i)){
                var inner_field = field.keys[i];
                if(inner_field.output_flag!==false){
                    var value = inner_field.val();
                    compiled[i] = value;
                }
            }
        }
        return compiled;
    } else {
        options.ignore_parent_change = true;
        if(set_val){
            for(var i in field.keys){
                if(field.keys.hasOwnProperty(i)){
                    if(set_val[i]===undefined){
                        var inner_field = field.keys[i];
                        field.remove_field(inner_field);
                    }
                }
            }
            for(var i in set_val){
            	if(set_val.hasOwnProperty(i)){
	        		var inner_field = field.keys[i];
	                if(!inner_field){
	                    inner_field = field.new_field(i);
                        
                        /* Allow the new_field function to just return a field - 
                         * this will add the field if it wasn't added in the new_field 
                         * callback. */
                         if(inner_field){
                             if(field.fields.indexOf(inner_field)===-1){
                                 field.add_field(inner_field);
                             }
                         }
	                }
	                inner_field.val(set_val[i], options);
	                inner_field.name_val(i);
				}
        	}
        }

        if (!options.ignore_change) {
            field.did_change(options);
        }
        return field;
    }
}