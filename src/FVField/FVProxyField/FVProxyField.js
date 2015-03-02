fieldval_ui_extend(FVProxyField, FVField);

function FVProxyField(name, options) {
    var field = this;

    FVProxyField.superConstructor.call(this, name, options);

    field.element.addClass("fv_proxy_field").append(
        field.input_holder = $("<div />").addClass("fv_input_holder").append(
            $("<div />").addClass("loading_label").text("Loading...")
        )
    )

    field.init_called = false;
    field.last_val = undefined;
    field.inner_field = null;
}
FVProxyField.prototype.init = function(){
    var field = this;

    field.init_called = true;

    if(field.inner_field){
        field.inner_field.init();
    }
}
FVProxyField.prototype.replace = function(inner_field){
    var field = this;

    field.inner_field = inner_field;
    if(field.init_called){
        field.inner_field.init();
    }

    field.element.replaceWith(field.inner_field.element);

    field.element = field.inner_field.element;

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

    for(var i in inner_field){
        if(inner_field.hasOwnProperty(i)){
            field[i] = inner_field[i];
            inner_field[i] = field[i];
        }
    }

    for(var n=0; n<on_change_callbacks.length; n++){
        field.on_change_callbacks.push(on_change_callbacks[n]);
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
}

//Captures calls to val
FVProxyField.prototype.val = function(set_val){
    var field = this;
    if(field.inner_field){
        return field.inner_field.val.apply(field.inner_field, arguments);
    } else {
        if (arguments.length!==0) {
            field.last_val = set_val;
        }
    }
}