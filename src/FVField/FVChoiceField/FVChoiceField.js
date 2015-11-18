@import("FVChoiceOption.js");

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
            var closest = $(e.target).closest(field.element);
            if (!closest.length){
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
    return field;
}
FVChoiceField.prototype.mouseup = function(){
    var field = this;
    field.is_mousedown = false;
    return field;
}

FVChoiceField.prototype.filter_enter_up = function() {
    var field = this;
    field.select_highlighted();
    return field;
}

FVChoiceField.prototype.filter_esc_up = function() {
    var field = this;
    field.hide_list();
    return field;
}

FVChoiceField.prototype.filter_key_up = function(e) {
    var field = this;

    if(e.keyCode===9){
        //Tab
        e.preventDefault();
        return field;
    } else if(e.keyCode===40){
        //Move down
        field.move_down();
        e.preventDefault();
        return field;
    } else if(e.keyCode===38){
        //Move up
        field.move_up();
        e.preventDefault();
        return field;
    } else if(e.keyCode===13){
        //Enter press
        field.filter_enter_up();
        e.preventDefault();
        return field;
    } else if(e.keyCode===27){
        //Esc
        field.filter_esc_up();
        e.preventDefault();
    }

    field.filter(field.filter_input.val());
    return field;
}

FVChoiceField.prototype.filter_key_down = function(e) {
    var field = this;
    if(e.keyCode===38 || e.keyCode===40 || e.keyCode===13){
        e.preventDefault();
    }
    return field;
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

    return field;
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

    return field;
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

    return field;
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

    return field;
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

    return field;
}

FVChoiceField.prototype.add_option = function(choice_option, initial){
    var field = this;

    field.option_array.push(choice_option);
    field.choice_list.append(choice_option.element);

    return field;
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

    return field;
}

FVChoiceField.prototype.finalize_option = function(option_element, initial){
    var field = this;

    option_element.appendTo(field.choice_list)

    return field;
}

FVChoiceField.prototype.select_highlighted = function(){
    var field = this;

    if(field.current_highlight){
        field.select_option(field.current_highlight);
    }

    return field;
}

FVChoiceField.prototype.input_focus = function(){
    var field = this;

    if(field.clear_filter_on_focus){
        field.filter_input.val("");
    }

    field.show_list();

    field.did_focus();

    return field;
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
                if(choice_option.matches_value(set_val)){
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
