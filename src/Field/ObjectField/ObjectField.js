fieldval_ui_extend(ObjectField, Field);

function ObjectField(name) {
    var field = this;

    ObjectField.superConstructor.call(this, name);

    field.element.addClass("object_field");

    field.fields_element = field.input_holder;

    field.fields = {};
}

ObjectField.prototype.add_field = function(name, field){
	Form.prototype.add_field.call(this,name,field);
}

ObjectField.prototype.change_name = function(name) {
    var field = this;
    ObjectField.superClass.change_name.call(this,name);
    return field;
}

ObjectField.prototype.view_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].view_mode();
    }
}

ObjectField.prototype.edit_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].edit_mode();
    }
}

ObjectField.prototype.disable = function() {
    var field = this;
    return field;
}

ObjectField.prototype.enable = function() {
    var field = this;
    return field;
}

ObjectField.prototype.focus = function() {
    var field = this;
    return field;
}

ObjectField.prototype.blur = function() {
    var field = this;
    return field;
}

ObjectField.prototype.error = function(error){
	var field = this;

	ObjectField.superClass.error.call(this,error);

	Form.prototype.error.call(this,error);
}


ObjectField.prototype.clear_errors = function(){
	var field = this;

	Form.prototype.clear_errors.call(this);
}

ObjectField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
    	var compiled = {};
    	for(var i in field.fields){
    		var inner_field = field.fields[i];
    		compiled[i] = inner_field.val();
    	}
        return compiled;
    } else {
    	for(var i in set_val){
    		var inner_field = field.fields[i];
    		inner_field.val(set_val[i]);
    	}
        return field;
    }
}