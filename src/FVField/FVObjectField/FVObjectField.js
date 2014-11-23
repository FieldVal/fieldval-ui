fieldval_ui_extend(FVObjectField, FVField);

function FVObjectField(name, options) {
    var field = this;

    FVObjectField.superConstructor.call(this, name, options);

    field.element.addClass("fv_object_field");

    field.fields_element = field.input_holder;

    field.fields = {};
}

FVObjectField.prototype.init = function(){
    var field = this;

    for(var i in field.fields){
        var inner_field = field.fields[i];
        inner_field.init();
    }
}

FVObjectField.prototype.remove = function(){
    var field = this;

    for(var i in field.fields){
        var inner_field = field.fields[i];
        inner_field.remove();
    }

    FVField.prototype.remove.call(this);
}

FVObjectField.prototype.add_field = function(name, inner_field){
    var field = this;

    inner_field.element.appendTo(field.fields_element);
    field.fields[name] = inner_field;

    return field;
}

FVObjectField.prototype.remove_field = function(name){
    var field = this;

    var inner_field = field.fields[name];
    if(inner_field){
        inner_field.remove();//Field class will perform inner_field.element.remove()
        delete field.fields[name];
    }
}

FVObjectField.prototype.change_name = function(name) {
    var field = this;
    FVObjectField.superClass.change_name.call(this,name);
    return field;
}

FVObjectField.prototype.disable = function() {
    var field = this;
    
    for(var i in field.fields){
        var inner_field = field.fields[i];
        inner_field.disable();
    }

    return FVField.prototype.disable.call(this);
}

FVObjectField.prototype.enable = function() {
    var field = this;
    
    for(var i in field.fields){
        var inner_field = field.fields[i];
        inner_field.enable();
    }

    return FVField.prototype.enable.call(this);
}

FVObjectField.prototype.focus = function() {
    var field = this;
    return field;
}

FVObjectField.prototype.blur = function() {
    var field = this;

    for(var i in field.fields){
        var inner_field = field.fields[i];
        inner_field.blur();
    }

    return field;
}

FVObjectField.prototype.error = function(error){
    var field = this;

    FVObjectField.superClass.error.call(this,error);

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

FVObjectField.prototype.fields_error = function(error){
    var field = this;

    if(error){
        var invalid_fields = error.invalid || {};
        var missing_fields = error.missing || {};
        var unrecognized_fields = error.unrecognized || {};
        
        for(var i in field.fields){
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


FVObjectField.prototype.clear_errors = function(){
	var field = this;

	field.error(null);
}

FVObjectField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
    	var compiled = {};
    	for(var i in field.fields){
    		var inner_field = field.fields[i];
            if(inner_field.output_flag!==false){
        		compiled[i] = inner_field.val();
            }
    	}
        return compiled;
    } else {
    	for(var i in set_val){
    		var inner_field = field.fields[i];
            if(inner_field){
        		inner_field.val(set_val[i]);
            }
    	}
        return field;
    }
}