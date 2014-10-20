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
        return false;
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

    field.element.appendTo(form.fields_element);
    form.fields[name] = field;

    return form;
}

FVForm.prototype.remove_field = function(name){
	var form = this;

    var field = form.fields[name];
    if(field){
    	field.remove();//Field class will perform field.element.remove()
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
    	if(set_val){
	    	for(var i in form.fields){
	    		var field = form.fields[i];
	    		field.val(set_val[i]);
	    	}
	    }
        return form;
    }
}
function Field(name, options) {
    var field = this;

    field.name = name;
    field.options = options || {};

    field.show_on_form_flag = true;
    field.is_in_array = false;

    field.on_change_callbacks = [];

    field.element = $("<div />").addClass("fv_field").data("field",field);
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
        field.move_handle = $("<div />")
        .addClass("fv_field_move_handle")
        .html("&#8645;")
    ,
        field.remove_button = $("<button />")
        .addClass("fv_field_remove_button")
        .html("&#10060;").on(FVForm.button_event,function(event){
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

    field.element.remove();
}

Field.prototype.view_mode = function(){
    var field = this;

    if(field.is_in_array){
        field.remove_button.hide();
        field.move_handle.hide();
    }

    field.element.addClass("fv_view_mode")
    field.element.removeClass("fv_edit_mode")

    console.log("view_mode ",field);
}

Field.prototype.edit_mode = function(){
    var field = this;    

    if(field.is_in_array){
        field.remove_button.show();
        field.move_handle.show();
    }

    field.element.addClass("fv_edit_mode")
    field.element.removeClass("fv_view_mode")

    console.log("edit_mode ",field);
}

Field.prototype.change_name = function(name) {
    var field = this;
    field.name = name;
    return field;
}

Field.prototype.layout = function(){
    var field = this;

    field.element.append(
        field.title,
        field.description_label,
        field.input_holder,
        field.error_message
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
        if(field.element){
            field.element.addClass("fv_field_error");
        }
        field.show_error();
    } else {
        field.hide_error();
        if(field.element){
            field.element.removeClass("fv_field_error");
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
    
    field.enter_callbacks = [];

    field.input.addClass("fv_text_input")
    .attr("placeholder", name)
    .on("keydown",function(e){
        if(e.keyCode===13){
            for(var i = 0; i < field.enter_callbacks.length; i++){
                field.enter_callbacks[i](e);
            }
        }
    })
    .on("keyup",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

TextField.prototype.on_enter = function(callback){
    var field = this;

    field.enter_callbacks.push(callback);
    
    return field;
}

TextField.prototype.view_mode = function(){
    var field = this;

    field.input.prop({
        "readonly": "readonly",
        "disabled": "disabled"
    })

    Field.prototype.view_mode.call(this);
}

TextField.prototype.edit_mode = function(){
    var field = this;

    field.input.prop({
        "readonly": null,
        "disabled": null
    })

    Field.prototype.edit_mode.call(this);
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
        if(set_val!==undefined){
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

    if(typeof DateVal === 'undefined'){
        console.error("DateField requires fieldval-dateval-js");
        return;
    }

    DateField.superConstructor.call(this, name, options);

    field.element.addClass("fv_date_field");

    field.format_string = field.options.format || "yyyy-MM-dd";

    var format_error = DateVal.date_format().check(field.format_string, function(emit_format_array){
        field.format_array = emit_format_array;
    })
    
    if(format_error){
        console.error(format_error.error_message);
        return;
    }

    field.inputs = [];

    for(var i = 0; i < field.format_array.length; i++){

        var component = field.format_array[i];
        var component_value = DateVal.date_components[component];

        field.add_element_from_component(component, component_value);
    }
}

DateField.prototype.add_element_from_component = function(component, component_value){
    var field = this;

    if(component_value===0){
        var component_string = component;
        field.inputs.push(null);
        field.input_holder.append(
            $("<div />").addClass("fv_date_separator").text(component_string)
        )
    } else {
        var component_max_length = component_value[component_value.length-1];
        var input = $("<input />").attr({
            "placeholder": component,
            "size": component_max_length,
            "maxlength": component_max_length
        })
        .addClass("fv_date_input")
        .on("keyup",function(){
            field.did_change()
        })

        input.blur(function(){
            var input_val = input.val();
            var padded = DateVal.pad_to_valid(input_val, component_value);
            input.val(padded);
        })

        field.inputs.push(input);
        field.input_holder.append(input)
    }
}

DateField.prototype.icon = function(params) {
    var field = this;

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
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            $(input).attr("disabled", "disabled");
        }
    }
    return field;
}

DateField.prototype.enable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", null);
        }
    }
    return field;
}

DateField.prototype.focus = function() {
    var field = this;
    
    var input = field.inputs[0];
    if(input){
        input.blur();
    }

    return field;
}

DateField.prototype.blur = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.blur();
        }
    }
    return field;
}

DateField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {

        var date_string = "";
        for(var i = 0; i < field.format_array.length; i++){
            var component = field.format_array[i];
            var component_value = DateVal.date_components[component];
            if(component_value===0){
                date_string+=component;
            } else {
                var input = field.inputs[i];
                var input_val = input.val().toString();

                date_string += DateVal.pad_to_valid(input_val, component_value);
            }
        }

        return date_string;
    } else {

        if(set_val!=null){

            if(typeof set_val === 'number'){
                //Allows using a timestamp as an input value
                set_val = DateVal.date_with_format_array(new Date(set_val), field.format_array);
            } else if(set_val instanceof Date){
                //Allows using a Date as an input value
                set_val = DateVal.date_with_format_array(set_val, field.format_array);
            }

            var validation = DateVal.date(field.format_string, {
                "emit": DateVal.EMIT_COMPONENT_ARRAY
            }).check(set_val, function(emitted){
                as_components = emitted;
            })

            if(validation){
                console.error("Invalid format passed to .val of DateField");
                return;
            }

            for(var i = 0; i < field.format_array.length; i++){
                var component = field.format_array[i];
                var component_value = DateVal.date_components[component];
                if(component_value===0){
                    date_string+=component;
                } else {
                    var input = field.inputs[i];
                    input.val(as_components[i]);
                }
            }
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
        if(set_val==="true"){
            set_val = true;
        } else if(set_val==="false"){
            set_val = false;
        }
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

    Field.prototype.view_mode.call(this);
}

ObjectField.prototype.edit_mode = function(){
    var field = this;

    for(var i in field.fields){
        field.fields[i].edit_mode();
    }

    Field.prototype.edit_mode.call(this);
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
/*!
 * Nestable jQuery Plugin - Copyright (c) 2012 David Bushell - http://dbushell.com/
 * Dual-licensed under the BSD or MIT licenses
 */
;(function($, window, document, undefined)
{
    var hasTouch = 'ontouchstart' in document;

    /**
     * Detect CSS pointer-events property
     * events are normally disabled on the dragging element to avoid conflicts
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
     */
    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

    var defaults = {
            listNodeName    : 'ol',
            itemNodeName    : 'li',
            rootClass       : 'dd',
            listClass       : 'dd-list',
            itemClass       : 'dd-item',
            dragClass       : 'dd-dragel',
            handleClass     : 'dd-handle',
            collapsedClass  : 'dd-collapsed',
            placeClass      : 'dd-placeholder',
            noDragClass     : 'dd-nodrag',
            emptyClass      : 'dd-empty',
            expandBtnHTML   : '<button data-action="expand" type="button">Expand</button>',
            collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
            group           : 0,
            maxDepth        : 5,
            threshold       : 20
        };

    function Plugin(element, options)
    {
        this.w  = $(document);
        this.el = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
    }

    Plugin.prototype = {

        init: function()
        {
            var list = this;

            list.reset();

            list.el.data('nestable-group', this.options.group);

            list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

            $.each(this.el.find(list.options.itemNodeName), function(k, el) {
                list.setParent($(el));
            });

            list.el.on('click', 'button', function(e) {
                if (list.dragEl) {
                    return;
                }
                var target = $(e.currentTarget),
                    action = target.data('action'),
                    item   = target.parent(list.options.itemNodeName);
                if (action === 'collapse') {
                    list.collapseItem(item);
                }
                if (action === 'expand') {
                    list.expandItem(item);
                }
            });

            var onStartEvent = function(e)
            {
                var handle = $(e.target);
                if (!handle.hasClass(list.options.handleClass)) {
                    if (handle.closest('.' + list.options.noDragClass).length) {
                        return;
                    }
                    handle = handle.closest('.' + list.options.handleClass);
                }

                if (!handle.length || list.dragEl) {
                    return;
                }

                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }

                e.preventDefault();
                list.dragStart(e.touches ? e.touches[0] : e);
            };

            var onMoveEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragMove(e.touches ? e.touches[0] : e);
                }
            };

            var onEndEvent = function(e)
            {
                if (list.dragEl) {
                    e.preventDefault();
                    list.dragStop(e.touches ? e.touches[0] : e);
                }
            };

            if (hasTouch) {
                list.el[0].addEventListener('touchstart', onStartEvent, false);
                window.addEventListener('touchmove', onMoveEvent, false);
                window.addEventListener('touchend', onEndEvent, false);
                window.addEventListener('touchcancel', onEndEvent, false);
            }

            list.el.on('mousedown', onStartEvent);
            list.w.on('mousemove', onMoveEvent);
            list.w.on('mouseup', onEndEvent);

        },

        serialize: function()
        {
            var data,
                depth = 0,
                list  = this;
                step  = function(level, depth)
                {
                    var array = [ ],
                        items = level.children(list.options.itemNodeName);
                    items.each(function()
                    {
                        var li   = $(this),
                            item = $.extend({}, li.data()),
                            sub  = li.children(list.options.listNodeName);
                        if (sub.length) {
                            item.children = step(sub, depth + 1);
                        }
                        array.push(item);
                    });
                    return array;
                };
            data = step(list.el.find(list.options.listNodeName).first(), depth);
            return data;
        },

        serialise: function()
        {
            return this.serialize();
        },

        reset: function()
        {
            this.mouse = {
                offsetX   : 0,
                offsetY   : 0,
                startX    : 0,
                startY    : 0,
                lastX     : 0,
                lastY     : 0,
                nowX      : 0,
                nowY      : 0,
                distX     : 0,
                distY     : 0,
                dirAx     : 0,
                dirX      : 0,
                dirY      : 0,
                lastDirX  : 0,
                lastDirY  : 0,
                distAxX   : 0,
                distAxY   : 0
            };
            this.isTouch    = false;
            this.moving     = false;
            this.dragEl     = null;
            this.dragRootEl = null;
            this.dragDepth  = 0;
            this.hasNewRoot = false;
            this.pointEl    = null;
        },

        expandItem: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action="expand"]').hide();
            li.children('[data-action="collapse"]').show();
            li.children(this.options.listNodeName).show();
        },

        collapseItem: function(li)
        {
            var lists = li.children(this.options.listNodeName);
            if (lists.length) {
                li.addClass(this.options.collapsedClass);
                li.children('[data-action="collapse"]').hide();
                li.children('[data-action="expand"]').show();
                li.children(this.options.listNodeName).hide();
            }
        },

        expandAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.expandItem($(this));
            });
        },

        collapseAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.collapseItem($(this));
            });
        },

        setParent: function(li)
        {
            if (li.children(this.options.listNodeName).length) {
                li.prepend($(this.options.expandBtnHTML));
                li.prepend($(this.options.collapseBtnHTML));
            }
            li.children('[data-action="expand"]').hide();
        },

        unsetParent: function(li)
        {
            li.removeClass(this.options.collapsedClass);
            li.children('[data-action]').remove();
            li.children(this.options.listNodeName).remove();
        },

        dragStart: function(e)
        {
            var mouse    = this.mouse,
                target   = $(e.target),
                dragItem = target.closest(this.options.itemNodeName);

            this.placeEl.css('height', dragItem.height());
            this.placeEl.css('width', dragItem.width());
            this.placeEl.css('display', dragItem.css("display"));

            mouse.offsetX = e.offsetX !== undefined ? e.offsetX : e.pageX - target.offset().left;
            mouse.offsetY = e.offsetY !== undefined ? e.offsetY : e.pageY - target.offset().top;
            mouse.startX = mouse.lastX = e.pageX;
            mouse.startY = mouse.lastY = e.pageY;

            this.dragRootEl = this.el;

            this.el_offset = this.el.offset();

            this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + ' ' + this.options.dragClass);
            this.dragEl.css('width', dragItem.width());

            dragItem.after(this.placeEl);
            dragItem[0].parentNode.removeChild(dragItem[0]);
            dragItem.appendTo(this.dragEl);

            $(this.el).append(this.dragEl);
            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX - this.el_offset.left,
                'top'  : e.pageY - mouse.offsetY - this.el_offset.top
            });
            // total depth of dragging item
            var i, depth,
                items = this.dragEl.find(this.options.itemNodeName);
            for (i = 0; i < items.length; i++) {
                depth = $(items[i]).parents(this.options.listNodeName).length;
                if (depth > this.dragDepth) {
                    this.dragDepth = depth;
                }
            }
        },

        dragStop: function(e)
        {
            var el = this.dragEl.children(this.options.itemNodeName).first();
            el[0].parentNode.removeChild(el[0]);
            this.placeEl.replaceWith(el);

            this.dragEl.remove();
            this.el.trigger('change');
            if (this.hasNewRoot) {
                this.dragRootEl.trigger('change');
            }
            this.reset();
        },

        dragMove: function(e)
        {
            var list, parent, prev, next, depth,
                opt   = this.options,
                mouse = this.mouse;

            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX - this.el_offset.left,
                'top'  : e.pageY - mouse.offsetY - this.el_offset.top
            });

            // mouse position last events
            mouse.lastX = mouse.nowX;
            mouse.lastY = mouse.nowY;
            // mouse position this events
            mouse.nowX  = e.pageX;
            mouse.nowY  = e.pageY;
            // distance mouse moved between events
            mouse.distX = mouse.nowX - mouse.lastX;
            mouse.distY = mouse.nowY - mouse.lastY;
            // direction mouse was moving
            mouse.lastDirX = mouse.dirX;
            mouse.lastDirY = mouse.dirY;
            // direction mouse is now moving (on both axis)
            mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
            mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;
            // axis mouse is now moving on
            var newAx   = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

            // do nothing on first move
            if (!mouse.moving) {
                mouse.dirAx  = newAx;
                mouse.moving = true;
                return;
            }

            // calc distance moved on this axis (and direction)
            if (mouse.dirAx !== newAx) {
                mouse.distAxX = 0;
                mouse.distAxY = 0;
            } else {
                mouse.distAxX += Math.abs(mouse.distX);
                if (mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) {
                    mouse.distAxX = 0;
                }
                mouse.distAxY += Math.abs(mouse.distY);
                if (mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) {
                    mouse.distAxY = 0;
                }
            }
            mouse.dirAx = newAx;

            /**
             * move horizontal
             */
            if (mouse.dirAx && mouse.distAxX >= opt.threshold) {
                // reset move distance on x-axis for new phase
                mouse.distAxX = 0;
                prev = this.placeEl.prev(opt.itemNodeName);
                // increase horizontal level if previous sibling exists and is not collapsed
                if (mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass)) {
                    // cannot increase level when item above is collapsed
                    list = prev.find(opt.listNodeName).last();
                    // check if depth limit has reached
                    depth = this.placeEl.parents(opt.listNodeName).length;
                    if (depth + this.dragDepth <= opt.maxDepth) {
                        // create new sub-level if one doesn't exist
                        if (!list.length) {
                            list = $('<' + opt.listNodeName + '/>').addClass(opt.listClass);
                            list.append(this.placeEl);
                            prev.append(list);
                            this.setParent(prev);
                        } else {
                            // else append to next level up
                            list = prev.children(opt.listNodeName).last();
                            list.append(this.placeEl);
                        }
                    }
                }
                // decrease horizontal level
                if (mouse.distX < 0) {
                    // we can't decrease a level if an item preceeds the current one
                    next = this.placeEl.next(opt.itemNodeName);
                    if (!next.length) {
                        parent = this.placeEl.parent();
                        this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
                        if (!parent.children().length) {
                            this.unsetParent(parent.parent());
                        }
                    }
                }
            }

            var isEmpty = false;

            // find list item under cursor
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'hidden';
            }
            this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'visible';
            }
            if (this.pointEl.hasClass(opt.handleClass)) {
                this.pointEl = this.pointEl.closest("."+opt.itemClass);
            }
            if (this.pointEl.hasClass(opt.emptyClass)) {
                isEmpty = true;
            }
            else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) {
                return;
            }

            // find parent list of item under cursor
            var pointElRoot = this.pointEl.closest('.' + opt.rootClass),
                isNewRoot   = this.dragRootEl.data('nestable-id') !== pointElRoot.data('nestable-id');

            /**
             * move vertical
             */
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                // check if groups match if dragging over new root
                if (isNewRoot && opt.group !== pointElRoot.data('nestable-group')) {
                    return;
                }
                // check depth limit
                depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName).length;
                if (depth > opt.maxDepth) {
                    return;
                }
                var before = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
                    parent = this.placeEl.parent();
                // if empty create new list to replace empty placeholder
                if (isEmpty) {
                    list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass);
                    list.append(this.placeEl);
                    this.pointEl.replaceWith(list);
                }
                else if (before) {
                    this.pointEl.before(this.placeEl);
                }
                else {
                    this.pointEl.after(this.placeEl);
                }
                if (!parent.children().length) {
                    this.unsetParent(parent.parent());
                }
                if (!this.dragRootEl.find(opt.itemNodeName).length) {
                    this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
                }
                // parent root list has changed
                if (isNewRoot) {
                    this.dragRootEl = pointElRoot;
                    this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
                }
            }
        }

    };

    $.fn.nestable = function(params)
    {
        var lists  = this,
            retval = this;

        lists.each(function()
        {
            var plugin = $(this).data("nestable");

            if (!plugin) {
                $(this).data("nestable", new Plugin(this, params));
                $(this).data("nestable-id", new Date().getTime());
            } else {
                if (typeof params === 'string' && typeof plugin[params] === 'function') {
                    retval = plugin[params]();
                }
            }
        });

        return retval || lists;
    };

})(window.jQuery || window.Zepto, window, document);


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