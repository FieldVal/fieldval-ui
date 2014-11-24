//Used to subclass Javascript classes
function fieldval_ui_extend(sub, sup) {
	function emptyclass() {}
	emptyclass.prototype = sup.prototype;
	sub.prototype = new emptyclass();
	sub.prototype.constructor = sub;
	sub.superConstructor = sup;
	sub.superClass = sup.prototype;
}
function FVField(name, options) {
    var field = this;

    field.name = name;
    field.options = options || {};

    field.output_flag = true;
    field.is_in_array = false;
    field.is_disabled = false;

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

FVField.prototype.in_array = function(remove_callback){
    var field = this;

    field.is_in_array = true;

    field.element.addClass("fv_nested")
    .append(
        field.move_handle = $("<div />")
        .addClass("fv_field_move_handle")
    ,
        field.remove_button = $("<button />")
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            remove_callback();
            field.remove();
        })
    )
}

FVField.prototype.init = function(){
    var field = this;
}

FVField.prototype.remove = function(){
    var field = this;

    field.element.remove();
}

FVField.prototype.change_name = function(name) {
    var field = this;
    field.name = name;
    return field;
}

FVField.prototype.layout = function(){
    var field = this;

    field.element.append(
        field.title,
        field.description_label,
        field.input_holder,
        field.error_message
    )
}

FVField.prototype.on_change = function(callback){
    var field = this;

    field.on_change_callbacks.push(callback);

    return field;
}

FVField.prototype.output = function(do_output){
    var field = this;
    field.output_flag = do_output;
    return field;
}

FVField.prototype.did_change = function(){
    var field = this;

    var val = field.val();

    for(var i = 0; i < field.on_change_callbacks.length; i++){
        var callback = field.on_change_callbacks[i];

        callback(val);
    }
    return field;
}

FVField.prototype.icon = function(params) {
    var field = this;
}

FVField.prototype.val = function(set_val) {
    console.error("Did not override FVField.val()")
}

FVField.prototype.disable = function() {
    var field = this;
    field.is_disabled = true;
    field.element.addClass("fv_disabled");

    if(field.is_in_array){
        field.move_handle.hide();
        field.remove_button.hide();
    }

    return field;
}

FVField.prototype.enable = function() {
    var field = this;
    field.is_disabled = false;
    field.element.removeClass("fv_disabled");

    if(field.is_in_array){
        field.move_handle.show();
        field.remove_button.show();
    }

    return field;
}

FVField.prototype.blur = function() {
    var field = this;
}

FVField.prototype.focus = function() {
    var field = this;
}

FVField.prototype.show_error = function(){
    var field = this;
    field.error_message.show();
}

FVField.prototype.hide_error = function(){
    var field = this;
    field.error_message.hide();
}

FVField.prototype.error = function(error) {
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
fieldval_ui_extend(FVTextField, FVField);

function FVTextField(name, options) {
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

    FVTextField.superConstructor.call(this, name, options);

    field.element.addClass("fv_text_field");

    if(field.input_type==='textarea'){
        field.input = $("<textarea />")
    } else if(field.input_type==='text' || field.input_type==='number' || !field.input_type) {
        field.input = $("<input type='text' />")
    } else {
        field.input = $("<input type='"+field.input_type+"' />")
    }
    
    field.enter_callbacks = [];

    field.previous_value = {};//Object to ensure invalid initial comparison
    
    field.input.addClass("fv_text_input")
    .attr("placeholder", name)
    .on("keydown",function(e){
        if(e.keyCode===13){
            for(var i = 0; i < field.enter_callbacks.length; i++){
                field.enter_callbacks[i](e);
            }
        }
    })
    .on("keyup paste cut",function(){
        setTimeout(function(){
            field.check_changed();
        },0);
    })
    .appendTo(field.input_holder);
}

FVTextField.prototype.check_changed = function(){
    var field = this;

    var this_value = field.val();
    if(this_value!==field.previous_value){
        field.previous_value = this_value;
        field.did_change()
    }
}

FVTextField.prototype.on_enter = function(callback){
    var field = this;

    field.enter_callbacks.push(callback);
    
    return field;
}

FVTextField.prototype.icon = function(params) {
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

FVTextField.prototype.change_name = function(name) {
    var field = this;

    FVTextField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

FVTextField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return FVField.prototype.disable.call(this);
}

FVTextField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return FVField.prototype.enable.call(this);
}

FVTextField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

FVTextField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

FVTextField.numeric_regex = /^\d+(\.\d+)?$/;

FVTextField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        var value = field.input.val();
        if(field.input_type==="number" && FVTextField.numeric_regex.test(value)){
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
fieldval_ui_extend(FVPasswordField, FVTextField);

function FVPasswordField(name) {
    var field = this;

    FVPasswordField.superConstructor.call(this, name, {
        type: "password"
    });
}
fieldval_ui_extend(FVDisplayField, FVField);

function FVDisplayField(name, options) {
    var field = this;

    FVDisplayField.superConstructor.call(this, name, options);

    field.element.addClass("fv_display_field");

    field.input = $("<div />")
    .appendTo(field.input_holder);

    field.output_flag = false;//Don't output the field
}

FVDisplayField.prototype.icon = function(params) {
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

FVDisplayField.replace_line_breaks = function(string){
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

FVDisplayField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.text();
    } else {
        field.input.html(FVDisplayField.replace_line_breaks(set_val));
        return field;
    }
}
fieldval_ui_extend(FVChoiceField, FVField);

function FVChoiceField(name, options) {
    var field = this;

    FVChoiceField.superConstructor.call(this, name, options);

    field.choices = field.options.choices || [];
    field.allow_empty = field.options.allow_empty || false;
    field.empty_text = field.options.empty_text || "";

    field.choice_values = [];
    field.choice_texts = [];
    field.selected_value = null;

    if(field.allow_empty){
        field.choice_values.push(null);
        field.choice_texts.push(field.empty_text);
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
        field.choice_texts.push(choice_text);
    }

    field.element.addClass("fv_choice_field");

    field.select = $("<div/>").append(
        field.filter_input = $("<input type='text' />")
        .attr("placeholder", name)
        .addClass("filter_input")
    ,
        field.current_display = $("<div />").addClass("fv_choice_display fv_choice_placeholder").on(FVForm.button_event,function(e){
            field.focus();
        }).text(field.name)
    ,
        field.choice_list = $("<div />").addClass("fv_choice_list")
        .bind('mousewheel DOMMouseScroll', function(e) {
            var scrollTo = null;

            if (e.type == 'mousewheel') {
                scrollTo = (e.originalEvent.wheelDelta * -0.5);
            }
            else if (e.type == 'DOMMouseScroll') {
                scrollTo =40 * e.originalEvent.detail;
            }

            if (scrollTo) {
                e.preventDefault();
                $(this).scrollTop(scrollTo + $(this).scrollTop());
            }
        })
    )
    .addClass("fv_choice_input")
    .appendTo(field.input_holder);

    field.filter_input.hide().on('keydown',function(e){
        if(e.keyCode===38 || e.keyCode===40 || e.keyCode===13){
            e.preventDefault();
        }
    }).on('keyup',function(e){
        if(e.keyCode===40){
            //Move down
            field.move_down();
            e.preventDefault();
            return;
        } else if(e.keyCode===38){
            //Move up
            field.move_up();
            e.preventDefault();
            return;
        } else if(e.keyCode===13){
            //Enter press
            field.select_highlighted();
            e.preventDefault();
            return;
        } else if(e.keyCode===27){
            //Esc
            field.hide_list();
            e.preventDefault();
        }
        field.filter(field.filter_input.val());
    })

    $('html').on(FVForm.button_event, function(e){
        if(field.filter_input.is(":visible")){
            if (!$(e.target).closest(field.filter_input).length){
                field.hide_list();
            }
        }
    });

    field.filter("");
}

FVChoiceField.prototype.show_list = function(){
    var field = this;

    if(!field.is_disabled){

        field.input_holder.css("min-height", field.current_display.outerHeight()+"px");

        field.filter_input.show();
        field.current_display.hide();
        if(!FVForm.is_mobile){
            field.filter_input.focus();
        }
        field.choice_list.show();
        field.current_highlight = null;
        field.filter("", true);
    }
}

FVChoiceField.prototype.hide_list = function(){
    var field = this;

    field.input_holder.css("min-height","");

    field.filter_input.hide();
    field.current_display.show();
    field.choice_list.hide();
}

FVChoiceField.prototype.filter = function(text, initial){
    var field = this;

    var text_lower = text.toLowerCase();

    field.choice_list.empty();

    for(var i = 0; i < field.choice_values.length; i++){
        var choice_value = field.choice_values[i];
        var choice_text = field.choice_texts[i];

        if(
            choice_text==="" && text_lower===""
            ||
            choice_text.toLowerCase().indexOf(text_lower)==0
        ){
            field.add_option(choice_value, choice_text, initial);
        }
    }

    if(!initial || !field.current_highlight){
        field.current_highlight = $(field.choice_list.children()[0]);
    }
    if(field.current_highlight){
        field.current_highlight.addClass("highlighted");
    }
}

FVChoiceField.prototype.value_to_text = function(value){
    var field = this;

    for(var i = 0; i < field.choice_values.length; i++){
        var this_value = field.choice_values[i];

        if(this_value===value){
            return field.choice_texts[i];
        }
    }

    return null;
}

FVChoiceField.prototype.select_option = function(value, ignore_change){
    var field = this;

    field.selected_value = value;
    var text = field.value_to_text(value);
    field.current_display.removeClass("fv_choice_placeholder").text(text);
    field.hide_list();
    
    field.filter_input.blur().hide().val("");
    
    if(!ignore_change){
        field.did_change();
    }
}

FVChoiceField.prototype.move_up = function(){
    var field = this;

    if(field.current_highlight){
        field.current_highlight.removeClass("highlighted");
        var previous = field.current_highlight.prev();
        if(previous[0]){
            field.current_highlight = previous;
            field.current_highlight.addClass("highlighted");
            field.move_into_view();
        } else {
            field.current_highlight = null;
        }
    }
}

FVChoiceField.prototype.move_down = function(){
    var field = this;

    if(!field.current_highlight){
        field.current_highlight = $(field.choice_list.children()[0]);
        if(field.current_highlight){
            field.current_highlight.addClass("highlighted");
        }
    } else {
        var next = field.current_highlight.next();
        if(next[0]){
            field.current_highlight.removeClass("highlighted");
            field.current_highlight = next;
            field.current_highlight.addClass("highlighted");
            field.move_into_view();
        }
    }
}

FVChoiceField.prototype.move_into_view = function(target){
    var field = this;

    if(target===undefined){
        target = field.current_highlight;
    }
    setTimeout(function(){
        var offset = target.offset().top;

        field.choice_list.scrollTop(
            field.choice_list.scrollTop() - 
            field.choice_list.offset().top + 
            offset - 50
        );
    },1);
}

FVChoiceField.prototype.add_option = function(choice_value, display_name, initial){
    var field = this;

    var option_element = $("<div />").addClass("fv_choice_option").data("value",choice_value).text(display_name).on(FVForm.button_event,function(e){
        field.default_click(e, choice_value);
    })

    field.finalize_option(option_element, choice_value, initial);
}

FVChoiceField.prototype.default_click = function(e, value){
    var field = this;

    e.preventDefault();
    e.stopPropagation();
    if(e.originalEvent){
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
    }
    field.select_option(value);
}

FVChoiceField.prototype.finalize_option = function(option_element, choice_value, initial){
    var field = this;

    if(field.selected_value===choice_value){
        option_element.addClass("selected");
        field.move_into_view(option_element);

        if(initial){
            field.current_highlight = option_element;
        }
    }

    option_element.appendTo(field.choice_list)
}

FVChoiceField.prototype.select_highlighted = function(){
    var field = this;

    if(field.current_highlight && field.current_highlight[0]){
        field.select_option(field.current_highlight.data("value"));
    }
}

FVChoiceField.prototype.focus = function() {
    var field = this;
    
    field.filter_input.val("");
    setTimeout(function(){
        field.show_list();
    },1);

    return field;
}

FVChoiceField.prototype.blur = function() {
    var field = this;
    
    field.hide_list();

    return field;
}

FVChoiceField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.selected_value;
    } else {
        if(set_val!==undefined){
            field.select_option(set_val,true);
        }
        return field;
    }
}
fieldval_ui_extend(FVDateField, FVField);

function FVDateField(name, options) {//format is currently unused
    var field = this;

    if(typeof DateVal === 'undefined'){
        console.error("FVDateField requires fieldval-dateval-js");
        return;
    }

    FVDateField.superConstructor.call(this, name, options);

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

FVDateField.prototype.add_element_from_component = function(component, component_value){
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

FVDateField.prototype.icon = function(params) {
    var field = this;

    return field;
}

FVDateField.prototype.change_name = function(name) {
    var field = this;

    FVDateField.superClass.change_name.call(this,name);

    field.input.attr("placeholder", name);
    return field;
}

FVDateField.prototype.disable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", "disabled");
        }
    }
    return FVField.prototype.disable.call(this);
}

FVDateField.prototype.enable = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.attr("disabled", null);
        }
    }
    return FVField.prototype.enable.call(this);
}

FVDateField.prototype.focus = function() {
    var field = this;
    
    var input = field.inputs[0];
    if(input){
        input.blur();
    }

    return field;
}

FVDateField.prototype.blur = function() {
    var field = this;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.blur();
        }
    }
    return field;
}

FVDateField.prototype.val = function(set_val) {
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
                console.error("Invalid format passed to .val of FVDateField");
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
fieldval_ui_extend(FVBooleanField, FVField);

function FVBooleanField(name, options) {
    var field = this;

    FVBooleanField.superConstructor.call(this, name, options);

    field.element.addClass("fv_boolean_field");

    field.input = $("<input type='checkbox' />")
    .addClass("fv_boolean_input")
    .on("change",function(){
        field.did_change()
    })
    .appendTo(field.input_holder);
}

FVBooleanField.prototype.disable = function() {
    var field = this;
    field.input.attr("disabled", "disabled");
    return FVField.prototype.disable.call(this);
}

FVBooleanField.prototype.enable = function() {
    var field = this;
    field.input.attr("disabled", null);
    return FVField.prototype.enable.call(this);
}

FVBooleanField.prototype.focus = function() {
    var field = this;
    field.input.focus();
    return field;
}

FVBooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return field;
}

FVBooleanField.prototype.val = function(set_val) {
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
                var value = inner_field.val();
                if(value!=null){
            		compiled[i] = value;
                }
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


fieldval_ui_extend(FVArrayField, FVField);
function FVArrayField(name, options) {
    var field = this;

    FVArrayField.superConstructor.call(this, name, options);

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

    var add_field_button = $("<button />").addClass("fv_add_field_button").text("+").on(FVForm.button_event,function(event){
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

FVArrayField.prototype.add_field = function(name, inner_field){
    var field = this;

    inner_field.in_array(function(){
        field.remove_field(inner_field);
    });
    inner_field.element.appendTo(field.fields_element);
    field.fields.push(inner_field);

    field.input_holder.nestable('init');

    if(field.is_disabled){
        inner_field.disable();
    }
}

FVArrayField.prototype.remove_field = function(inner_field){
    var field = this;

    for(var i = 0; i < field.fields.length; i++){
        if(field.fields[i]===inner_field){
            field.fields.splice(i,1);
        }
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
                inner_field.val(set_val[i]);
        	}
        }
        return field;
    }
}
fieldval_ui_extend(FVForm, FVObjectField);

function FVForm(fields){
	var form = this;

	FVForm.superConstructor.call(this);

	var children = form.element.children();

	form.element.remove();
	form.element = $("<form />").addClass("fv_form").append(children);

	form.element.on("submit",function(event){
        event.preventDefault();
        form.submit();
        return false;
	});

	form.fields_element = form.element;

	form.submit_callbacks = [];
}
FVForm.button_event = 'click';
FVForm.is_mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|nokia|series40|x11|opera mini/i.test(navigator.userAgent.toLowerCase());
if($.tap){
	FVForm.button_event = 'tap';
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

	return compiled;
}