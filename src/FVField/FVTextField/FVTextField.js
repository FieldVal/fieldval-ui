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