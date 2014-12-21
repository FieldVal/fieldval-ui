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

    field.filter("");
}

FVChoiceField.prototype.filter_enter_up = function() {
    var field = this;
    console.log("clicked enter first");
    field.select_highlighted();
}

FVChoiceField.prototype.filter_esc_up = function() {
    var field = this;
    field.hide_list();
}

FVChoiceField.prototype.filter_key_up = function(e) {
    var field = this;
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

        field.filter_input.show();
        field.current_display.hide();
        if(!FVForm.is_mobile){
            field.filter_input.focus();
        }
        field.choice_list.show();
        field.current_highlight = null;
        field.filter(field.filter_input.val(), true);
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
    if(value===null && text===null){
        field.current_display.addClass("fv_choice_placeholder").text(field.name);
    } else {
        field.current_display.removeClass("fv_choice_placeholder").text(text); 
    }
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