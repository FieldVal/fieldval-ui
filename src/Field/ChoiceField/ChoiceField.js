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