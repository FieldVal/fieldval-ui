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

    return choice_option;
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

    return choice_option;
}

FVChoiceOption.prototype.remove_highlight = function(){
    var choice_option = this;
    choice_option.element.removeClass("fv_highlighted");

    return choice_option;
}

FVChoiceOption.prototype.add_selected = function(){
    var choice_option = this;
    choice_option.element.addClass("fv_selected");

    return choice_option;
}

FVChoiceOption.prototype.remove_selected = function(){
    var choice_option = this;
    choice_option.element.removeClass("fv_selected");

    return choice_option;
}

FVChoiceOption.prototype.hide = function(){
    var choice_option = this;
    choice_option.element.hide();

    return choice_option;
}

FVChoiceOption.prototype.show = function(){
    var choice_option = this;
    choice_option.element.show();

    return choice_option;
}

FVChoiceOption.prototype.get_display = function(){
    var choice_option = this;

    return $("<div />").text(choice_option.choice_text);
}
