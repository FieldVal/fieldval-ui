//Used to subclass Javascript classes
function fieldval_ui_extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	sub.prototype = new emptyclass();
	sub.prototype.constructor = sub;
	sub.superConstructor = sup;
	sub.superClass = sup.prototype;
}
function Form(fields){
	var form = this;

	form.element = $("<form />").addClass("fieldval_ui_form").append(
		form.error_message = $("<div />").addClass("error_message").hide()
	).on("submit",function(event){
        event.preventDefault();
        form.submit();
	});

	form.fields = fields || {};

	//Used because ObjectField uses some Form.prototype functions
	form.fields_element = form.element;

	form.submit_callbacks = [];
}

Form.prototype.on_submit = function(callback){
	var form = this;

	form.submit_callbacks.push(callback);

	return form;
}

Form.prototype.submit = function(){
	var form = this;

	var compiled = form.val();

	for(var i = 0; i < form.submit_callbacks.length; i++){
		var callback = form.submit_callbacks[i];

		callback(compiled);
	}

	//returns compiled as well as invoking callback
	return compiled;
}

Form.prototype.add_field = function(name, field){
	var form = this;

    field.container.appendTo(form.fields_element);
    form.fields[name] = field;
}

//Same as Form.error(null)
Form.prototype.clear_errors = function(){
	var form = this;
	form.error(null);
}

Form.prototype.fields_error = function(error){
	var form = this;

	if(error){
	    var invalid_fields = error.invalid || {};
	    var missing_fields = error.missing || {};
	    var unrecognized_fields = error.unrecognized || {};
	    
	    for(var i in form.fields){
	    	var field = form.fields[i];

	    	var field_error = invalid_fields[i] || missing_fields[i] || unrecognized_fields[i] || null;
    		field.error(field_error);
	    }

	} else {
		for(var i in form.fields){
			var field = form.fields[i];
			field.error(null);
		}
	}
}

Form.prototype.show_error = function(){
    var form = this;
    form.error_message.show();
}

Form.prototype.hide_error = function(){
    var form = this;
    form.error_message.hide();
}

Form.prototype.error = function(error) {
    var form = this;

    form.error_message.empty();

    if(error){

    	if(error.error===undefined){
    		console.error("No error provided");
    		return;
    	}

    	if(error.error===0){
        	form.fields_error(error);
        	form.hide_error();
        } else {
        	if(error.error===4){
	            var error_list = $("<ul />");
	            for(var i = 0; i < error.errors.length; i++){
	                var sub_error = error.errors[i];
	                if(sub_error.error===0){
	                	form.fields_error(sub_error);
	                } else {
		                error_list.append(
		                    $("<li />").text(sub_error.error_message)
		                )
		            }
	            }
	            form.error_message.append(
	                error_list
	            );
	        } else {
	        	form.error_message.append(
	                $("<span />").text(error.error_message)
	            )
	        }
	        form.show_error();
		}
    } else {
    	//Clear error
    	form.fields_error(null);
    	form.hide_error();
    }
}

Form.prototype.disable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.disable();
	}
}

Form.prototype.enable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.enable();
	}	
}

Form.prototype.val = function(set_val){
    var form = this;

    if (arguments.length===0) {
        var output = {};
		for(var i in form.fields){
			var field = form.fields[i];
			if(field.show_on_form_flag){
				output[i] = field.val();
			}
		}
		return output;
    } else {
    	for(var i in form.fields){
    		var field = form.fields[i];
    		field.val(set_val[i]);
    	}
        return form;
    }
}
function Field(name) {
    var field = this;

    field.name = name;

    field.show_on_form_flag = true;

    field.on_change_callbacks = [];

    field.container = $("<div />").addClass("field_container");
    field.element = $("<div />").addClass("field");
    field.title = $("<div />").addClass("field_title").text(field.name)
    field.input_holder = $("<div />").addClass("input_holder")
    field.error_message = $("<div />").addClass("error_message").hide()

    field.layout();
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
            field.container.addClass("field_error");
        }
        field.show_error();
    } else {
        field.hide_error();
        if(field.container){
            field.container.removeClass("field_error");
        }
    }
}
fieldval_ui_extend(TextField, Field);

function TextField(name, input_type) {
    var field = this;

    field.input_type = input_type || "text";

    TextField.superConstructor.call(this, name);

    field.element.addClass("text_field");

    if(input_type==='textarea'){
        field.input = $("<textarea />")
    } else if(input_type==='text' || input_type==='number' || !input_type) {
        field.input = $("<input type='text' />")
    } else {
        field.input = $("<input type='"+input_type+"' />")
    }
    
    field.input.addClass("text_input")
    .attr("placeholder", name)
    .on("keyup",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

TextField.prototype.icon = function(params) {
    var field = this;

    var css_props = {
        'background-image': "url(" + params.background + ")",
        'background-position': params.position,
        'background-repeat': "no-repeat",
        'padding-left': params.width + "px"
    }

    field.input.css(css_props);
    return field;
}

TextField.prototype.change_name = function(name) {
    var field = this;

    TextField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

TextField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return field;
}

TextField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return field;
}

TextField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

TextField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

TextField.numeric_regex = /^\d+(?:\.\d+)$/;

TextField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        var value = field.input.val();
        if(field.input_type==="number" && TextField.numeric_regex.test(value)){
            return parseFloat(value);
        }
        if(value.length===0){
            return null;
        }
        return value;
    } else {
        field.input.val(set_val);
        return field;
    }
}

fieldval_ui_extend(PasswordField, TextField);

function PasswordField(name) {
    var field = this;

    PasswordField.superConstructor.call(this, name, "password");
}
fieldval_ui_extend(DisplayField, Field);

function DisplayField(name, input_type) {
    var field = this;

    DisplayField.superConstructor.call(this, name);

    field.element.addClass("display_field");

    field.input = $("<div />")
    .appendTo(field.input_holder);

    field.hide_on_form();
}

DisplayField.prototype.icon = function(params) {
    var field = this;

    var css_props = {
        'background-image': "url(" + params.background + ")",
        'background-position': params.position,
        'background-repeat': "no-repeat",
        'padding-left': params.width + "px"
    }

    field.input.css(css_props);
    return field;
}

DisplayField.prototype.change_name = function(name) {
    var field = this;

    DisplayField.superClass.change_name.call(this,name);

    return field;
}

DisplayField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.text();
    } else {
        field.input.text(set_val);
        return field;
    }
}
fieldval_ui_extend(ChoiceField, Field);

function ChoiceField(name, choices) {
    var field = this;

    ChoiceField.superConstructor.call(this, name);

    field.element.addClass("choice_field");

    field.select = $("<select/>")
    .addClass("choice_input")
    .on("change",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);

    field.choice_values = [];

    for(var i = 0; i < choices.length; i++){
        var choice = choices[i];

        var choice_value,choice_text;
        if((typeof choice)=="object"){
            choice_value = choice[0];
            choice_text = choice[1];
        } else {
            choice_value = choice_text = choice;
        }

        field.choice_values.push(choice_value);

        var option = $("<option />").attr("value",choice_value).text(choice_text)
        field.select.append(option);
    }
}

ChoiceField.prototype.disable = function() {
    var field = this;
    field.select.attr("disabled", "disabled");
    return field;
}

ChoiceField.prototype.enable = function() {
    var field = this;
    field.select.attr("disabled", null);
    return field;
}

ChoiceField.prototype.focus = function() {
    var field = this;
    field.select.focus();
    return field;
}

ChoiceField.prototype.blur = function() {
    var field = this;
    field.select.blur();
    return field;
}

ChoiceField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.select.find(":selected").attr("value")
    } else {
        if(set_val!=null){
            field.select.val(set_val);
        } else {
            console.log(set_val);
            field.select.val(field.choice_values[0]);
        }
        return field;
    }
}
fieldval_ui_extend(DateField, Field);

function DateField(name, format) {//format is currently unused
    var field = this;

    field.format = format;

    DateField.superConstructor.call(this, name);

    field.element.addClass("date_field");

    field.input_holder.append(
        field.day_input = $("<input type='number' />")
        .addClass("day_input date_input")
        .attr("placeholder", "DD")
        .on("keyup",function(){
            field.did_change()
        }),

        field.month_input = $("<input type='number' />")
        .addClass("month_input date_input")
        .attr("placeholder", "MM")
        .on("keyup",function(){
            field.did_change()
        }),
        
        field.year_input = $("<input type='number' />")
        .addClass("year_input date_input")
        .attr("placeholder", "YYYY")
        .on("keyup",function(){
            field.did_change()
        })
    )

}

DateField.prototype.icon = function(params) {
    var field = this;

    // var css_props = {
    //     'background-image': "url(" + params.background + ")",
    //     'background-position': params.position,
    //     'background-repeat': "no-repeat",
    //     'padding-left': params.width + "px"
    // }

    // field.input.css(css_props);
    return field;
}

DateField.prototype.change_name = function(name) {
    var field = this;

    DateField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

DateField.prototype.disable = function() {
    var field = this;
    field.day_input.attr("disabled", "disabled");
    field.month_input.attr("disabled", "disabled");
    field.year_input.attr("disabled", "disabled");
    return field;
}

DateField.prototype.enable = function() {
    var field = this;
    field.day_input.attr("disabled", null);
    field.month_input.attr("disabled", null);
    field.year_input.attr("disabled", null);
    return field;
}

DateField.prototype.focus = function() {
    var field = this;
    field.day_input.focus();
    return field;
}

DateField.prototype.blur = function() {
    var field = this;
    field.day_input.blur();
    field.month_input.blur();
    field.year_input.blur();
    return field;
}

DateField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {

        var day = field.day_input.val();
        var month = field.month_input.val();
        var year = field.year_input.val();

        //TODO Use field.format here
        var date_string = year+"-"+month+"-"+day;

        return date_string;
    } else {

        if(set_val!=null){

            //TODO Use field.format here
            var day = set_val.substring(8,10);
            var month = set_val.substring(5,7);
            var year = set_val.substring(0,4);

            field.day_input.val(day);
            field.month_input.val(month);
            field.year_input.val(year);
        }

        return field;
    }
}
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