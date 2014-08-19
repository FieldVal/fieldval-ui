//Used to subclass Javascript classes
function fieldval_ui_extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	sub.prototype = new emptyclass();
	sub.prototype.constructor = sub;
	sub.superConstructor = sup;
	sub.superClass = sup.prototype;
}
function FVForm(fields){
	var form = this;

	form.element = $("<form />").addClass("fv_form").append(
		form.error_message = $("<div />").addClass("fv_error_message").hide()
	).on("submit",function(event){
        event.preventDefault();
        form.submit();
	});

	form.fields = fields || {};

	//Used because ObjectField uses some FVForm.prototype functions
	form.fields_element = form.element;

	form.submit_callbacks = [];
}
FVForm.button_event = 'click';

FVForm.prototype.init = function(){
	var form = this;

	for(var i in form.fields){
        var inner_field = form.fields[i];
        inner_field.init();
    }
}

FVForm.prototype.remove = function(){
	var form = this;

	for(var i in form.fields){
        var inner_field = form.fields[i];
        inner_field.remove();
    }
}

FVForm.prototype.blur = function() {
    var form = this;

    for(var i in form.fields){
        var inner_field = form.fields[i];
        inner_field.blur();
    }

    return form;
}

FVForm.prototype.edit_mode = function(callback){
	var form = this;

	for(var i in form.fields){
		form.fields[i].edit_mode();
	}

	return form;
}

FVForm.prototype.view_mode = function(callback){
	var form = this;

	for(var i in form.fields){
		form.fields[i].view_mode();
	}

	return form;
}

FVForm.prototype.on_submit = function(callback){
	var form = this;

	form.submit_callbacks.push(callback);

	return form;
}

FVForm.prototype.submit = function(){
	var form = this;

	var compiled = form.val();

	for(var i = 0; i < form.submit_callbacks.length; i++){
		var callback = form.submit_callbacks[i];

		callback(compiled);
	}

	//returns compiled as well as invoking callback
	return compiled;
}

FVForm.prototype.add_field = function(name, field){
	var form = this;

    field.container.appendTo(form.fields_element);
    form.fields[name] = field;

    return form;
}

FVForm.prototype.remove_field = function(name){
	var form = this;

    var field = form.fields[name];
    if(field){
    	field.remove();//Field class will perform field.container.remove()
    	delete form.fields[name];
    }
}

//Same as FVForm.error(null)
FVForm.prototype.clear_errors = function(){
	var form = this;
	form.error(null);
}

FVForm.prototype.fields_error = function(error){
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

FVForm.prototype.show_error = function(){
    var form = this;
    form.error_message.show();
}

FVForm.prototype.hide_error = function(){
    var form = this;
    form.error_message.hide();
}

FVForm.prototype.error = function(error) {
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

FVForm.prototype.disable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.disable();
	}
}

FVForm.prototype.enable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.enable();
	}	
}

FVForm.prototype.val = function(set_val){
    var form = this;

    if (arguments.length===0) {
        var output = {};
		for(var i in form.fields){
			var field = form.fields[i];
			if(field.show_on_form_flag!==false){
				var value = field.val();
				if(value!=null){
					output[i] = value;
				}
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
function Field(name, options) {
    var field = this;

    field.name = name;
    field.options = options || {};
    console.log(field.options);

    field.show_on_form_flag = true;
    field.is_in_array = false;

    field.on_change_callbacks = [];

    field.container = $("<div />").addClass("fv_field_container");
    field.element = $("<div />").addClass("fv_field");
    field.title = $("<div />").addClass("fv_field_title").text(field.name)
    if(field.options.description){
        field.description_label = $("<div />").addClass("fv_field_description").text(field.options.description)
    }
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
        field.description_label,
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
fieldval_ui_extend(TextField, Field);

function TextField(name, options) {
    var field = this;

    var options_type = typeof options;

    if(options_type === "string"){
        field.input_type = options;
        options = {};
    } else if(options_type === "object"){
        field.input_type = options.type || "text";
    } else {
        options = {};
    }

    TextField.superConstructor.call(this, name, options);

    field.element.addClass("fv_text_field");

    if(field.input_type==='textarea'){
        field.input = $("<textarea />")
    } else if(field.input_type==='text' || field.input_type==='number' || !field.input_type) {
        field.input = $("<input type='text' />")
    } else {
        field.input = $("<input type='"+field.input_type+"' />")
    }
    
    field.input.addClass("fv_text_input")
    .attr("placeholder", name)
    .on("keyup",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

TextField.prototype.view_mode = function(){
    var field = this;

    field.input.prop({
        "readonly": "readonly",
        "disabled": "disabled"
    })

    field.element.addClass("fv_view_mode")
}

TextField.prototype.edit_mode = function(){
    var field = this;

    field.input.prop({
        "readonly": null,
        "disabled": null
    })

    field.element.removeClass("fv_view_mode")
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

TextField.numeric_regex = /^\d+(\.\d+)?$/;

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

function DisplayField(name, options) {
    var field = this;

    DisplayField.superConstructor.call(this, name, options);

    field.element.addClass("fv_display_field");

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

DisplayField.replace_line_breaks = function(string){
    if(typeof string !== 'string'){
        return string;
    }
    var htmls = [];
    var lines = string.split(/\n/);
    var tmpDiv = jQuery(document.createElement('div'));
    for (var i = 0 ; i < lines.length ; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
    }
    return htmls.join("<br>");
}

DisplayField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.text();
    } else {
        field.input.html(DisplayField.replace_line_breaks(set_val));
        return field;
    }
}
fieldval_ui_extend(ChoiceField, Field);

function ChoiceField(name, options) {
    var field = this;

    ChoiceField.superConstructor.call(this, name, options);

    field.choices = field.options.choices || [];
    field.allow_empty = field.options.allow_empty || false;

    field.element.addClass("fv_choice_field");

    field.select = $("<select/>")
    .addClass("fv_choice_input")
    .appendTo(field.input_holder);

    setTimeout(function(){
        field.select.on("change",function(){
            field.did_change()
        })
    },100)

    field.choice_values = [];

    if(field.allow_empty){
        field.empty_option = $("<option />").attr({
            "value": null
        }).text(field.options.empty_message || "")

        field.select.append(field.empty_option);
    }

    for(var i = 0; i < field.choices.length; i++){
        var choice = field.choices[i];

        var choice_value,choice_text;
        if((typeof choice)=="object"){
            choice_value = choice[0];
            choice_text = choice[1];
        } else {
            choice_value = choice_text = choice;
        }

        field.choice_values.push(choice_value);

        var option = $("<option />")
        .attr("value",choice_value)
        .text(choice_text)

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
        var selected = field.select.find(":selected");
        var index = selected.index() - (field.allow_empty ? 1 : 0);
        if(field.allow_empty && index===-1){
            return null;
        }
        return field.choice_values[index];
    } else {
        if(set_val!=null){
            field.select.val(set_val);
        } else {
            if(field.allow_empty){
                field.select.val(field.empty_option);
            } else {
                field.select.val(field.choice_values[0]);
            }
        }
        return field;
    }
}
fieldval_ui_extend(DateField, Field);

function DateField(name, options) {//format is currently unused
    var field = this;

    DateField.superConstructor.call(this, name, options);

    field.element.addClass("fv_date_field");

    field.input_holder.append(
        field.day_input = $("<input type='number' />")
        .addClass("fv_day_input fv_date_input")
        .attr("placeholder", "DD")
        .on("keyup",function(){
            field.did_change()
        }),

        field.month_input = $("<input type='number' />")
        .addClass("fv_month_input fv_date_input")
        .attr("placeholder", "MM")
        .on("keyup",function(){
            field.did_change()
        }),
        
        field.year_input = $("<input type='number' />")
        .addClass("fv_year_input fv_date_input")
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
fieldval_ui_extend(BooleanField, Field);

function BooleanField(name, options) {
    var field = this;

    BooleanField.superConstructor.call(this, name, options);

    field.element.addClass("fv_boolean_field");

    field.input = $("<input type='checkbox' />")
    .addClass("fv_boolean_input")
    .on("change",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

BooleanField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return field;
}

BooleanField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return field;
}

BooleanField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

BooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

BooleanField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.is(":checked")
    } else {
       	field.input.prop('checked', set_val);
        return field;
    }
}
fieldval_ui_extend(ObjectField, Field);

function ObjectField(name, options) {
    var field = this;

    ObjectField.superConstructor.call(this, name, options);

    field.element.addClass("fv_object_field");

    field.fields_element = field.input_holder;

    field.fields = {};
}

ObjectField.prototype.init = function(){
    FVForm.prototype.init.call(this);
}

ObjectField.prototype.remove = function(){
    FVForm.prototype.remove.call(this);

    Field.prototype.remove.call(this);
}

ObjectField.prototype.add_field = function(name, field){
    FVForm.prototype.add_field.call(this,name,field);
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

    FVForm.prototype.blur.call(this);
}

ObjectField.prototype.error = function(error){
    var field = this;

    ObjectField.superClass.error.call(this,error);

    FVForm.prototype.error.call(this,error);
}

ObjectField.prototype.fields_error = function(error){
    var field = this;

    FVForm.prototype.fields_error.call(this,error);
}


ObjectField.prototype.clear_errors = function(){
	var field = this;

	FVForm.prototype.clear_errors.call(this);
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
            if(inner_field){
        		inner_field.val(set_val[i]);
            }
    	}
        return field;
    }
}
fieldval_ui_extend(ArrayField, Field);

function ArrayField(name, options) {
    var field = this;

    ArrayField.superConstructor.call(this, name, options);

    field.element.addClass("fv_array_field");

    field.input_holder.append(
        field.fields_element = $("<div />").addClass("fv_nested_fields"),
        field.create_add_field_button()
    )

    field.fields = [];

    console.log(field.input_holder);
}

ArrayField.prototype.create_add_field_button = function(){
    var field = this;

    return $("<button />").addClass("fv_add_field_button").text("+").on(FVForm.button_event,function(event){
        event.preventDefault();
        field.new_field(field.fields.length);
    })
}

ArrayField.prototype.new_field = function(index){
    var field = this;
    console.error("ArrayField.new_field must be overriden to create fields");
}

ArrayField.prototype.add_field = function(name, inner_field){
    var field = this;

    inner_field.in_array(function(){
        field.remove_field(inner_field);
    });
    inner_field.container.appendTo(field.fields_element);
    field.fields.push(inner_field);
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
}

ArrayField.prototype.edit_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].edit_mode();
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