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
    field.key_value_parent = null;
    field.is_in_key_value = false;
    field.is_disabled = false;

    field.on_change_callbacks = [];
    field.on_focus_callbacks = [];
    field.on_blur_callbacks = [];

    if(field.options.use_form){
        field.element = $("<form />",{
            "novalidate": "novalidate"//Disable browser-based validation
        })
        .addClass("fv_field fv_form")
        .data("field",field)
        
        var submit_function = function(event){
            event.preventDefault();
            field.submit();
            return false;
        };

        var field_dom_element = field.element[0];
        if (field_dom_element.addEventListener) {// For all major browsers, except IE 8 and earlier
            field_dom_element.addEventListener("submit", submit_function);
        } else if (field_dom_element.attachEvent) {// For IE 8 and earlier versions
            field_dom_element.attachEvent("submit", submit_function);
        }

        field.on_submit_callbacks = [];
    } else {
        field.element = $("<div />").addClass("fv_field").data("field",field);
    }
    field.title = $("<div />").addClass("fv_field_title").text(field.name?field.name:"")
    if(!field.name){
        //Field name is empty
        field.title.hide();
    }
    if(field.options.description){
        field.description_label = $("<div />").addClass("fv_field_description").text(field.options.description)
    }
    field.input_holder = $("<div />").addClass("fv_input_holder");
    field.error_message = $("<div />").addClass("fv_error_message").hide()
    field.layout();
}

FVField.prototype.clear_errors = function(){
    var field = this;

    field.error(null);

    return field;
}

FVField.prototype.on_submit = function(callback){
    var field = this;

    field.on_submit_callbacks.push(callback);

    return field;
}

FVField.prototype.submit = function(){
    var field = this;

    var compiled = field.val();
    for(var i = 0; i < field.on_submit_callbacks.length; i++){
        var callback = field.on_submit_callbacks[i];
        callback(compiled);
    }

    return compiled;
}

FVField.prototype.in_array = function(parent, remove_callback){
    var field = this;

    field.array_parent = parent;
    field.is_in_array = true;
    field.array_remove_callback = remove_callback;

    field.element.addClass("fv_in_array");

    if(field.array_parent.sortable){
        field.element.append(
            field.move_handle = $("<div />")
            .addClass("fv_field_move_handle")
        );
    }

    if (!field.array_parent.hide_remove_button) {
        field.element.addClass("with_remove_button").append(
            field.remove_button = $("<button />",{type:"button"})
            .addClass("fv_field_remove_button")
            .html("&#10006;").on(FVForm.button_event,function(event){
                event.preventDefault();
                field.array_remove_callback(field.key_name);
                remove_callback();
                field.remove();
            })
        )
    }

    return field;
}

FVField.prototype.in_key_value = function(parent, remove_callback){
    var field = this;

    field.key_value_parent = parent;
    field.is_in_key_value = true;
    field.key_value_remove_callback = remove_callback;

    field.name_input = new FVTextField("Key").on_change(function(name_val){
        field.key_name = field.key_value_parent.change_key_name(field.key_name, name_val, field);
    });
    field.name_input.element.addClass("fv_key_value_name_input")
    field.title.replaceWith(field.name_input.element);

    field.element.addClass("fv_in_key_value")
    .append(
        field.remove_button = $("<button />",{type:"button"})
        .addClass("fv_field_remove_button")
        .html("&#10006;").on(FVForm.button_event,function(event){
            event.preventDefault();
            field.key_value_remove_callback(field.key_name);
            field.remove();
        })
    );

    return field;
}

FVField.prototype.init = function(){
    var field = this;
    return field;
}

FVField.prototype.remove = function(from_parent){
    var field = this;

    field.element.remove();
    if(field.parent && !from_parent){//from_parent prevents cycling
        field.parent.remove_field(field);
        field.parent = null;
    }

    return field;
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

    return field;
}

FVField.prototype.on_change = function(callback){
    var field = this;

    field.on_change_callbacks.push(callback);

    return field;
}

FVField.prototype.on_focus = function(callback){
    var field = this;

    field.on_focus_callbacks.push(callback);

    return field;
}

FVField.prototype.on_blur = function(callback){
    var field = this;

    field.on_blur_callbacks.push(callback);

    return field;
}

FVField.prototype.output = function(do_output){
    var field = this;
    field.output_flag = do_output;
    return field;
}

FVField.prototype.did_change = function(options){
    var field = this;

    if (options === undefined) {
        options = {}
    }   

    var val = field.val();

    for(var i = 0; i < field.on_change_callbacks.length; i++){
        var callback = field.on_change_callbacks[i];

        callback(val);
    }

    if (field.parent && !options.ignore_parent_change) {
        field.parent.did_change();
    }

    return field;
}

FVField.prototype.did_focus = function(){
    var field = this;

    for(var i = 0; i < field.on_focus_callbacks.length; i++){
        var callback = field.on_focus_callbacks[i];

        callback();
    }

    if(field.parent){
        field.parent.did_focus();
    }

    return field;
}

FVField.prototype.did_blur = function(){
    var field = this;

    if(field.suppress_blur){
        return field;
    }

    for(var i = 0; i < field.on_blur_callbacks.length; i++){
        var callback = field.on_blur_callbacks[i];

        callback();
    }

    if(field.parent){
        field.parent.did_blur();
    }

    return field;
}

FVField.prototype.icon = function(params) {
    var field = this;
    return field;
}

FVField.prototype.val = function(set_val) {
    console.error("Did not override FVField.val()")
}

FVField.prototype.disable = function() {
    var field = this;
    field.is_disabled = true;
    field.element.addClass("fv_disabled");

    if(field.name_input){
        field.name_input.disable();
    }

    if(field.move_handle){
        field.move_handle.hide();
    }

    if(field.remove_button){
        field.remove_button.hide();
    }

    return field;
}

FVField.prototype.enable = function() {
    var field = this;
    field.is_disabled = false;
    field.element.removeClass("fv_disabled");

    if(field.name_input){
        field.name_input.enable();
    }

    if(field.move_handle){
        field.move_handle.show();
    }

    if(field.remove_button){
        field.remove_button.show();
    }

    return field;
}

FVField.prototype.blur = function() {
    var field = this;

    if(field.name_input){
        field.name_input.blur();
    }

    return field;
}

FVField.prototype.focus = function() {
    var field = this;

    return field;
}

FVField.prototype.show_error = function(){
    var field = this;
    field.error_message.show();
    return field;
}

FVField.prototype.hide_error = function(){
    var field = this;
    field.error_message.hide();
    return field;
}

//Used in key_value fields
FVField.prototype.name_val = function(){
    var field = this;

    var response = field.name_input.val.apply(field.name_input,arguments);
    field.key_name = field.key_value_parent.change_key_name(field.key_name, field.name_input.val(), field);
    return response;
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
        field.consume_tabs = options.consume_tabs || false;
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

            if(field.input_type==="textarea" && (event.metaKey || event.ctrlKey)){
                var form = field.element.closest("form");
                if(form){
                    form.data("field").submit();
                }
            }
        }

        if(field.input_type==="textarea" && field.consume_tabs && e.keyCode===9) {
            e.preventDefault();
            document.execCommand("insertText", false, "\t");
        }
    })
    .on("keyup paste cut",function(){
        setTimeout(function(){
            field.check_changed();
        },0);
    })
    .on("focus",function(){
        field.did_focus();
    })
    .on("blur",function(){
        field.did_blur();
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

    return FVField.prototype.focus.call(this);
}

FVTextField.prototype.blur = function() {
    var field = this;
    
    field.input.blur();

    return FVField.prototype.blur.call(this);
}

FVTextField.numeric_regex = /^[-+]?\d*\.?\d+$/;

FVTextField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {}

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
        
        if (!options.ignore_change) {
            field.did_change(options);
        }

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

FVDisplayField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {}

    if (arguments.length===0) {
        return field.input.text();
    } else {
        field.input.html(FVDisplayField.replace_line_breaks(set_val));
        if (!options.ignore_change) {
            field.did_change(options);
        }
        return field;
    }
}
function FVChoiceOption(choice, parent){
    var choice_option = this;

    choice_option.parent = parent;

    if(choice===null){
        choice_option.choice_text = parent.empty_text;
        choice_option.choice_value = null;
    } else if((typeof choice)==="object"){
        choice_option.choice_value = choice[0];
        choice_option.choice_text = choice[1].toString();
    } else {
        choice_option.choice_value = choice;
        choice_option.choice_text = choice.toString();
    }

    choice_option.element = $("<div />").addClass("fv_choice_option")
    .text(choice_option.choice_text)

    choice_option.add_mouse_events();
}

FVChoiceOption.prototype.add_mouse_events = function(){
    var choice_option = this;

    var parent = choice_option.parent;

    choice_option.element.on("mousedown",function(e){
        parent.mousedown();
        e.preventDefault();
    })
    .on("mouseup",function(e){
        parent.mouseup();
        e.preventDefault();
    })
    .on(FVForm.button_event,function(e){
        parent.default_click(e, choice_option);
        e.preventDefault();
    })
}

FVChoiceOption.prototype.matches_filter = function(filter){
    var choice_option = this;

    if(choice_option.choice_value===null){
        if(filter.length===0){
            return true;
        }
    } else if(choice_option.choice_text.toLowerCase().indexOf(filter.toLowerCase())===0) {
        return true;
    }
}

FVChoiceOption.prototype.get_value = function(){
    var choice_option = this;

    return choice_option.choice_value;
}

FVChoiceOption.prototype.add_highlight = function(){
    var choice_option = this;
    choice_option.element.addClass("fv_highlighted");
}

FVChoiceOption.prototype.remove_highlight = function(){
    var choice_option = this;
    choice_option.element.removeClass("fv_highlighted");
}

FVChoiceOption.prototype.add_selected = function(){
    var choice_option = this;
    choice_option.element.addClass("fv_selected");
}

FVChoiceOption.prototype.remove_selected = function(){
    var choice_option = this;
    choice_option.element.removeClass("fv_selected");
}

FVChoiceOption.prototype.hide = function(){
    var choice_option = this;
    choice_option.element.hide();
}

FVChoiceOption.prototype.show = function(){
    var choice_option = this;
    choice_option.element.show()
}

FVChoiceOption.prototype.get_display = function(){
    var choice_option = this;

    return $("<div />").text(choice_option.choice_text);
}

fieldval_ui_extend(FVChoiceField, FVField);

function FVChoiceField(name, options) {
    var field = this;

    FVChoiceField.superConstructor.call(this, name, options);
    field.element.addClass("fv_choice_field");

    field.choices = field.options.choices || [];
    field.allow_empty = field.options.allow_empty || false;
    field.empty_text = field.options.empty_text || "";
    field.clear_filter_on_select = field.options.clear_filter_on_select!=undefined ? field.options.clear_filter_on_select : true;
    field.clear_filter_on_focus = field.options.clear_filter_on_focus!=undefined ? field.options.clear_filter_on_focus : true;

    field.option_array = [];
    field.selected_value = null;

    field.option_class = options.option_class || FVChoiceOption;

    field.select = $("<div/>")
    .addClass("fv_choice_input")
    .append(
        field.filter_input = $("<input type='text' />")
        .on('focus',function(e){
            setTimeout(function(){
                field.input_focus();
            },1);
        })
        .attr("placeholder", name)
        .addClass("filter_input")
        .on('blur',function(e){
            if(!field.is_mousedown){
                field.blur();
            }
        })
    ,
        field.current_display = $("<div />")
        .addClass("fv_choice_display fv_choice_placeholder")
        .on(FVForm.button_event, function(e){
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
    .appendTo(field.input_holder);

    field.filter_input.addClass("fv_filter_hidden").on('keydown',function(e){
        field.filter_key_down(e);
    }).on('keyup',function(e){
        field.filter_key_up(e);
    })

    $('html').on(FVForm.button_event, function(e){
        if(field.filter_input.is(":visible")){
            if (!$(e.target).closest(field.filter_input).length){
                field.hide_list();
            }
        }
    });


    if(field.allow_empty){
        var choice_option = new field.option_class(null, field);
        field.add_option(choice_option);
    }

    for(var i = 0; i < field.choices.length; i++){
        var choice = field.choices[i];

        var choice_option = new field.option_class(choice, field);
        field.add_option(choice_option);
    }


    field.filter("");
}

FVChoiceField.prototype.mousedown = function(){
    var field = this;
    field.is_mousedown = true;
}
FVChoiceField.prototype.mouseup = function(){
    var field = this;
    field.is_mousedown = false;
}

FVChoiceField.prototype.filter_enter_up = function() {
    var field = this;
    field.select_highlighted();
}

FVChoiceField.prototype.filter_esc_up = function() {
    var field = this;
    field.hide_list();
}

FVChoiceField.prototype.filter_key_up = function(e) {
    var field = this;

    if(e.keyCode===9){
        //Tab
        e.preventDefault();
        return;
    }if(e.keyCode===40){
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
        field.filter_enter_up();
        e.preventDefault();
        return;
    } else if(e.keyCode===27){
        //Esc
        field.filter_esc_up();
        e.preventDefault();
    }

    field.filter(field.filter_input.val());
}

FVChoiceField.prototype.filter_key_down = function(e) {
    var field = this;
    if(e.keyCode===38 || e.keyCode===40 || e.keyCode===13){
        e.preventDefault();
    }
}

FVChoiceField.prototype.show_list = function(){
    var field = this;

    if(!field.is_disabled){

        if(field.list_open){
            return field;
        }

        field.input_holder.css("min-height", field.current_display.outerHeight()+"px");

        field.filter_input.removeClass("fv_filter_hidden");
        field.current_display.hide();
        field.choice_list.show();
        field.current_highlight = field.selected_value;
        field.filter(field.filter_input.val(), true);

        field.list_open = true;
    }

    return field;
}

FVChoiceField.prototype.hide_list = function(){
    var field = this;

    if(field.current_highlight){
        field.current_highlight.remove_highlight();
        field.current_highlight = null;
    }

    field.input_holder.css("min-height","");

    field.filter_input.addClass("fv_filter_hidden")
    field.current_display.show();
    field.choice_list.hide();

    field.list_open = false;

    return field;
}

FVChoiceField.prototype.filter = function(text, initial){
    var field = this;

    if(field.current_highlight){
        field.current_highlight.remove_highlight();
    }

    var first = null;
    for(var i = 0; i < field.option_array.length; i++){
        var choice_option = field.option_array[i];

        if(choice_option.matches_filter(text)){
            choice_option.show();
            if(!first){
                first = choice_option;
            }
        } else {
            choice_option.hide();
        }
    }

    if(!initial || !field.current_highlight){
        field.current_highlight = first;
    }
    if(field.current_highlight){
        field.current_highlight.add_highlight();
    }
}

FVChoiceField.prototype.value_to_text = function(value){
    var field = this;

    for(var i = 0; i < field.option_array.length; i++){
        var this_value = field.option_array[i];

        if(this_value===value){
            return field.choice_texts[i];
        }
    }

    return null;
}

FVChoiceField.prototype.select_option = function(choice_option, options){
    var field = this;

    options = options || {};

    if(field.selected_value){
        field.selected_value.remove_selected();
    }
    field.selected_value = choice_option;
    field.selected_value.add_selected();
    if(choice_option===null){
        field.current_display.addClass("fv_choice_placeholder").empty().text(field.name);
    } else {
        field.current_display.removeClass("fv_choice_placeholder").empty().append(
            choice_option.get_display()
        )
    }
    field.hide_list();

    if(!options.val_event){
        var next;
        if(field.filter_input.is(":focus")){
            var tabables = $("input[tabindex != '-1']:visible,textarea[tabindex != '-1']:visible,button[tabindex != '-1']:visible");
            if(tabables){
                var index = tabables.index(field.filter_input);
                if(index!==-1){
                    next = tabables[index + 1];
                }
            }
        }
        if(next){
            next.focus();
        } else {
            field.blur();
        }
    }

    if(field.clear_filter_on_select){
        field.filter_input.val("");
    }
    
    if(!options.ignore_change){
        field.did_change(options);
    }
}

FVChoiceField.prototype.move_up = function(){
    var field = this;

    if(field.current_highlight){
        field.current_highlight.remove_highlight();
        var index = field.option_array.indexOf(field.current_highlight);
        if(index>0){
            field.current_highlight = field.option_array[index-1];
            field.current_highlight.add_highlight();
            field.move_into_view();
        } else {
            field.current_highlight = null;
        }
    }
}

FVChoiceField.prototype.move_down = function(){
    var field = this;

    if(!field.current_highlight){
        field.current_highlight = field.option_array[0];
        if(field.current_highlight){
            field.current_highlight.add_highlight();
        }
    } else {
        var index = field.option_array.indexOf(field.current_highlight);
        if(index<field.option_array.length-1){
            
            field.current_highlight.remove_highlight();

            field.current_highlight = field.option_array[index+1];
            field.current_highlight.add_highlight();
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
        var offset;
        if(target){
            offset = target.element.offset().top;
        } else {
            offset = 0;
        }

        field.choice_list.scrollTop(
            field.choice_list.scrollTop() - 
            field.choice_list.offset().top + 
            offset - 50
        );
    },1);
}

FVChoiceField.prototype.add_option = function(choice_option, initial){
    var field = this;

    field.option_array.push(choice_option);
    field.choice_list.append(choice_option.element);
}

FVChoiceField.prototype.default_click = function(e, choice_option){
    var field = this;

    e.preventDefault();
    e.stopPropagation();
    if(e.originalEvent){
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
    }
    field.select_option(choice_option);
}

FVChoiceField.prototype.finalize_option = function(option_element, initial){
    var field = this;

    option_element.appendTo(field.choice_list)
}

FVChoiceField.prototype.select_highlighted = function(){
    var field = this;

    if(field.current_highlight){
        field.select_option(field.current_highlight);
    }
}

FVChoiceField.prototype.input_focus = function(){
    var field = this;

    if(field.clear_filter_on_focus){
        field.filter_input.val("");
    }

    field.show_list();

    field.did_focus();
}

FVChoiceField.prototype.focus = function(from_input) {
    var field = this;
    
    field.filter_input.focus();

    return FVField.prototype.focus.call(this);
}

FVChoiceField.prototype.blur = function() {
    var field = this;
    
    field.hide_list();

    field.did_blur();

    return FVField.prototype.blur.call(this);
}

FVChoiceField.prototype.val = function(set_val, options) {
    var field = this;

    if (arguments.length===0) {
        if(field.selected_value){
            return field.selected_value.get_value();
        }
        return null;
    } else {
        if(set_val!==undefined){
            for(var i = 0; i < field.option_array.length; i++){
                var choice_option = field.option_array[i];
                if(set_val === choice_option.get_value()){
                    options = options || {};
                    options.val_event = true;
                    field.select_option(choice_option, options);
                    break;
                }
            }
        }
        return field;
    }
}
fieldval_ui_extend(FVDateField, FVField);

function FVDateField(name, options) {//format is currently unused
    var field = this;

    if(typeof DateVal === 'undefined'){
        console.error("FVDateField requires the FieldVal package");
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

FVDateField.character_width = 14;
FVDateField.padding_width = 4;

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
        .css({
            "width": (component_max_length * FVDateField.character_width) + FVDateField.padding_width
        })
        .on("keyup",function(){
            field.did_change()
        })
        .on("focus",function(e){
            field.did_focus();
        })
        .on("blur",function(e){
            var input_val = input.val();
            var padded = DateVal.pad_to_valid(input_val, component_value);
            input.val(padded);

            field.did_blur();
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
        input.focus();
    }

    return FVField.prototype.focus.call(this);
}

FVDateField.prototype.blur = function() {
    var field = this;

    field.suppress_blur = true;
    for(var i = 0; i < field.inputs.length; i++){
        var input = field.inputs[i];
        if(input){
            input.blur();
        }
    }
    field.suppress_blur = false;

    field.did_blur();

    return FVField.prototype.blur.call(this);
}

FVDateField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {};

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

            if (!options.ignore_change) {
                field.did_change(options);
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
    .on("focus",function(){
        field.did_focus();
    })
    .on("blur",function(){
        field.did_blur();
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
    return FVField.prototype.focus.call(this);
}

FVBooleanField.prototype.blur = function() {
    var field = this;
    field.input.blur();
    return FVField.prototype.blur.call(this);
}

FVBooleanField.prototype.val = function(set_val, options) {
    var field = this;

    options = options || {}

    if (arguments.length===0) {
        return field.input.is(":checked")
    } else {
        if(set_val==="true"){
            set_val = true;
        } else if(set_val==="false"){
            set_val = false;
        }
       	field.input.prop('checked', set_val);
        
        if (!options.ignore_change) {
            field.did_change(options);
        }

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
    
    for(var i in field.fields){
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            if(inner_field){
                inner_field.focus();
                return field;
            }
        }    
    }

    return FVField.prototype.focus.call(this);
}

FVObjectField.prototype.blur = function() {
    var field = this;

    field.suppress_blur = true;
    for(var i in field.fields){
        if(field.fields.hasOwnProperty(i)){
            var inner_field = field.fields[i];
            inner_field.blur();
        }
    }
    field.suppress_blur = false;

    field.did_blur();

    return FVField.prototype.blur.call(this);
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
        itemClass       : 'dd-item',
        dragClass       : 'dd-dragel',
        handleClass     : 'dd-handle',
        placeClass      : 'dd-placeholder',
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

            list.placeEl = $('<div class="' + list.options.placeClass + '"/>');

            var onStartEvent = function(e)
            {
                var handle = $(e.target);
                if (!handle.hasClass(list.options.handleClass)) {
                    handle = handle.closest('.' + list.options.handleClass);
                }

                if (!handle.length || list.dragEl) {
                    return;
                }

                list.isTouch = /^touch/.test(e.type);
                if (list.isTouch && e.touches.length !== 1) {
                    return;
                }

                var dragEl = handle.closest('.' + list.options.itemClass);
                if(dragEl[0].parentNode===list.el[0]){
                    e.preventDefault();
                    list.dragStart(e.touches ? e.touches[0] : e);
                }
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
            this.hasNewRoot = false;
            this.pointEl    = null;
        },

        setParent: function(li)
        {
            li.data("fv_parent_list",this);
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

            this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.dragClass);
            this.dragEl.css('width', dragItem.width());

            dragItem.after(this.placeEl);
            dragItem[0].parentNode.removeChild(dragItem[0]);
            dragItem.appendTo(this.dragEl);

            $(this.el).append(this.dragEl);
            this.dragEl.css({
                'left' : e.pageX - mouse.offsetX - this.el_offset.left,
                'top'  : e.pageY - mouse.offsetY - this.el_offset.top
            });
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
            var list, parent, prev, next,
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

            var isEmpty = false;

            // find list item under cursor
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'hidden';
            }
            

            var pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
            if(!pointEl.hasClass(opt.itemClass)){
                pointEl = pointEl.closest('.' + opt.itemClass);
            }
            if (!hasPointerEvents) {
                this.dragEl[0].style.visibility = 'visible';
            }
            if (pointEl.hasClass(opt.handleClass)) {
                pointEl = pointEl.closest("."+opt.itemClass);
            }
            else if (!pointEl.length || !pointEl.hasClass(opt.itemClass)) {
                return;
            }

            // find parent list of item under cursor
            var pointElRoot = $(pointEl[0].parentNode)

            /**
             * move vertical
             */
            // check that this is the same list element
            // console.log(this.el[0], pointElRoot[0]);
            if (this.el[0] !== pointElRoot[0]) {
                return;
            }

            this.pointEl = pointEl;

            var diffY = e.pageY - this.pointEl.offset().top;
            var diffX = e.pageY - this.pointEl.offset().top;
            var beforeX = e.pageX < (this.pointEl.offset().left + this.pointEl.width() / 2);
            var beforeY = e.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);

            if(this.pointEl.css('display')==='block'){
                if (beforeY) {
                    this.pointEl.before(this.placeEl);
                } else {
                    this.pointEl.after(this.placeEl);
                }    
            } else {
                if (beforeY && beforeX) {
                    this.pointEl.before(this.placeEl);
                } else if (!beforeY && !beforeX) {
                    this.pointEl.after(this.placeEl);
                }
            }
        }

    };

    $.fn.nestable = function(params)
    {
        var lists  = this,
            retval = this;

        lists.each(function(){
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

FVArrayField.prototype.remove = function(from_parent){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.remove();
    }

    FVField.prototype.remove.call(this, from_parent);
}

FVArrayField.prototype.remove_field = function(target){
    var field = this;

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
                             field.add_field(inner_field);
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
                    inner_field.remove();
                }
            }
            
            if (!options.ignore_change) {
                field.did_change(options);
            }
        }
        return field;
    }
}
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

FVKeyValueField.prototype.focus = function() {
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

FVKeyValueField.prototype.blur = function() {
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

FVKeyValueField.prototype.remove = function(from_parent){
    var field = this;

    for(var i=0; i<field.fields.length; i++){
        var inner_field = field.fields[i];
        inner_field.remove();
    }

    FVField.prototype.remove.call(this, from_parent);
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

if ( typeof Object.getPrototypeOf !== "function" ) {
    if ( typeof "test".__proto__ === "object" ) {
        Object.getPrototypeOf = function(object){
            return object.__proto__;
        };
    } else {
        Object.getPrototypeOf = function(object){
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
        };
    }
}

fieldval_ui_extend(FVProxyField, FVField);

function FVProxyField(name, options) {
    var field = this;

    FVProxyField.superConstructor.call(this, name, options);

    field.element.addClass("fv_proxy_field");
    field.input_holder.append(
        $("<div />").addClass("loading_label").text("Loading...")
    );

    field.init_called = false;
    field.last_val = undefined;
    field.inner_field = null;

    field.on_replace_callbacks = [];
}
FVProxyField.prototype.init = function(){
    var field = this;

    field.init_called = true;

    if(field.inner_field){
        field.inner_field.init();
    }
}
FVProxyField.prototype.replace = function(inner_field, options){
    var field = this;

    options = options || {};

    field.inner_field = inner_field;
    if(field.init_called){
        field.inner_field.init();
    }

    //Carry any pre/appended elements into the new field
    var before = [];
    var after = [];
    var seen_title = false;
    field.element.children().each(function(index,dom_element){
        if(dom_element===field.title[0]){
            seen_title = true;
        } else {
            if(dom_element!==field.input_holder[0] && dom_element!==field.error_message[0]){
                if(!seen_title){
                    before.push(dom_element);
                } else {
                    after.push(dom_element);
                }
            }
        }
    });

    field.element.replaceWith(field.inner_field.element);

    field.element = field.inner_field.element;

    field.element.prepend(before);
    field.element.append(after);

    if(field.last_val!==undefined){
        field.inner_field.val(field.last_val);
    }

    var copy_keys = [
        "output_flag",
        "is_in_array",
        "key_value_parent",
        "is_in_key_value",
        "key_name",
        "is_disabled"
    ];
    for(var k=0; k<copy_keys.length; k++){
        inner_field[copy_keys[k]] = field[copy_keys[k]];
    }

    var on_change_callbacks = [];
    for(var n=0; n<field.on_change_callbacks.length; n++){
        on_change_callbacks.push(field.on_change_callbacks[n]);
    }
    var on_submit_callbacks = [];
    if(field.on_submit_callbacks!==undefined){
        for(var n=0; n<field.on_submit_callbacks.length; n++){
            on_submit_callbacks.push(field.on_submit_callbacks[n]);
        }
    }

    var proto = Object.getPrototypeOf(inner_field);

    for(var i in proto){
        if(proto.hasOwnProperty(i)){
            field[i] = proto[i];
        }
    }

    for(var i in inner_field){
        if(inner_field.hasOwnProperty(i)){
            field[i] = inner_field[i];
        }
    }

    for(var n=0; n<on_change_callbacks.length; n++){
        field.on_change_callbacks.push(on_change_callbacks[n]);
    }

    if(field.on_submit_callbacks!==undefined){
        for(var n=0; n<on_submit_callbacks.length; n++){
            field.on_submit_callbacks.push(on_submit_callbacks[n]);
        }
    }

    if(field.is_in_key_value){
        field.in_key_value(field.key_value_parent,field.key_value_remove_callback);
        field.name_input.val(field.key_name);
    }

    if(field.is_in_array){
        field.in_array(field.array_parent,field.array_remove_callback);
    }

    if(field.is_disabled){
        field.disable();
    }

    for(var i=0; i<field.on_replace_callbacks.length; i++){
        field.on_replace_callbacks[i]();
    }

    if (!options.ignore_change) {
        field.did_change(options);
    }
}

FVProxyField.prototype.on_replace = function(callback){
    var field = this;

    field.on_replace_callbacks.push(callback);

    return field;
}

//Captures calls to val
FVProxyField.prototype.val = function(set_val, options){
    var field = this;
    options = options || {}
    
    if(field.inner_field){
        return field.inner_field.val.apply(field.inner_field, arguments);
    } else {
        if (arguments.length!==0) {
            field.last_val = set_val;
            if (!options.ignore_change) {
                field.did_change(options);
            }
        }
    }
}
fieldval_ui_extend(FVForm, FVObjectField);

function FVForm(fields){
	var form = this;

	FVForm.superConstructor.call(this,null,{
		use_form: true
	});

	form.element.addClass("fv_form");
}
FVForm.button_event = 'click';
FVForm.is_mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|nokia|series40|x11|opera mini/i.test(navigator.userAgent.toLowerCase());
if($.fn.tap || $.tap){
	FVForm.button_event = 'tap';
}