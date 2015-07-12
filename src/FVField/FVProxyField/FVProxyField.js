
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

    return field;
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

    return field;
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
