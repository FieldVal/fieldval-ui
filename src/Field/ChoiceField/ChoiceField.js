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