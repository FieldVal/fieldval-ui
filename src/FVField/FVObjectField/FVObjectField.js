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
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.init();
        }
    }
}

FVObjectField.prototype.remove = function(from_parent){
    var field = this;

    for(var i in field.fields){
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.remove();
        }
    }

    FVField.prototype.remove.call(this, from_parent);
}

FVObjectField.prototype.add_field = function(name, inner_field){
    var field = this;

    inner_field.element.appendTo(field.fields_element);
    field.fields[name] = inner_field;
    inner_field.parent = field;

    return field;
}

FVObjectField.prototype.remove_field = function(target){
    var field = this;

    var inner_field,key;
    if(typeof target === "string"){
        inner_field = field.fields[target];
        key = target;
    } else if(target instanceof FVField){
        for(var i in field.fields){
            if(field.fields.hasOwnProperty(i)){
                if(field.fields[i]===target){
                    inner_field = field.fields[i];
                    key = i;
                }
            }
        }
    } else {
        throw new Error("FVObjectField.remove_field only accepts strings or FVField instances");
    }
    if(inner_field){
        inner_field.remove(true);//Field class will perform inner_field.element.remove()
        delete field.fields[key];
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
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.disable();
        }
    }

    return FVField.prototype.disable.call(this);
}

FVObjectField.prototype.enable = function() {
    var field = this;
    
    for(var i in field.fields){
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.enable();
        }
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
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.blur();
        }
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

FVObjectField.prototype.fields_error = function(error){
    var field = this;

    //.missing and .unrecognized are unused as of FieldVal 0.4.0

    if(error){
        var invalid_fields = error.invalid || {};
        var missing_fields = error.missing || {};
        var unrecognized_fields = error.unrecognized || {};
        
        for(var i in field.fields){
            if(field.fields.hasOwnProperty(i)){
                var inner_field = field.fields[i];

                var field_error = invalid_fields[i] || missing_fields[i] || unrecognized_fields[i] || null;
                inner_field.error(field_error);
            }
        }

    } else {
        for(var i in field.fields){
            if(field.fields.hasOwnProperty(i)){
                var inner_field = field.fields[i];
                inner_field.error(null);
            }
        }
    }
}

FVObjectField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {}

    if (arguments.length===0) {
    	var compiled = {};
    	for(var i in field.fields){
            if(field.fields.hasOwnProperty(i)){
        		var inner_field = field.fields[i];
                if(inner_field.output_flag!==false){
                    var value = inner_field.val();
                    if(value!=null){
                		compiled[i] = value;
                    }
                }
            }
    	}
        return compiled;
    } else {
        options.ignore_parent_change = true;
    	for(var i in set_val){
    		var inner_field = field.fields[i];
            if(inner_field){
        		inner_field.val(set_val[i], options);
            }
    	}
        if (!options.ignore_change) {
            field.did_change(options);
        }
        return field;
    }
}