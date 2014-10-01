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

    field.element.addClass("fv_view_mode")
}

TextField.prototype.edit_mode = function(){
    var field = this;

    field.input.prop({
        "readonly": null,
        "disabled": null
    })

    field.element.removeClass("fv_view_mode")
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