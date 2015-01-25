fieldval_ui_extend(FVChoiceField, FVField);

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
    .on("mousedown",function(e){
        parent.mousedown();
    })
    .on("mouseup",function(e){
        parent.mouseup();
    })
    .on(FVForm.button_event,function(e){
        parent.default_click(e, choice_option);
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

function FVChoiceField(name, options) {
    var field = this;

    FVChoiceField.superConstructor.call(this, name, options);
    field.element.addClass("fv_choice_field");

    field.choices = field.options.choices || [];
    field.allow_empty = field.options.allow_empty || false;
    field.empty_text = field.options.empty_text || "";

    field.option_array = [];
    field.selected_value = null;

    field.option_class = options.option_class || FVChoiceOption;

    field.select = $("<div/>")
    .addClass("fv_choice_input")
    .append(
        field.filter_input = $("<input type='text' />")
        .on('focus',function(e){
            field.focus();
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
        field.option_array.push(choice_option);
        field.add_option(choice_option);
    }

    for(var i = 0; i < field.choices.length; i++){
        var choice = field.choices[i];

        var choice_option = new field.option_class(choice, field);
        field.option_array.push(choice_option);
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

        field.input_holder.css("min-height", field.current_display.outerHeight()+"px");

        field.filter_input.removeClass("fv_filter_hidden");
        field.current_display.hide();
        if(!FVForm.is_mobile){
            if(!field.filter_input.is(":focus")){
                field.filter_input.focus();
            }
        }
        field.choice_list.show();
        field.current_highlight = field.selected_value;
        field.filter(field.filter_input.val(), true);
    }
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

FVChoiceField.prototype.select_option = function(choice_option, ignore_change){
    var field = this;

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
    
    field.filter_input.blur().val("");
    
    if(!ignore_change){
        field.did_change();
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

FVChoiceField.prototype.add_option = function(option_element, initial){
    var field = this;

    field.choice_list.append(option_element.element);
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
        if(field.selected_value){
            return field.selected_value.get_value();
        }
        return null;
    } else {
        if(set_val!==undefined){
            for(var i = 0; i < field.option_array.length; i++){
                var choice_option = field.option_array[i];
                if(set_val === choice_option.get_value()){
                    field.select_option(choice_option,true);
                    break;
                }
            }
        }
        return field;
    }
}