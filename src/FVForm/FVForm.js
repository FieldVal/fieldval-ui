function FVForm(fields){
	var form = this;

	form.element = $("<form />").addClass("fieldval_ui_form").append(
		form.error_message = $("<div />").addClass("error_message").hide()
	).on("submit",function(event){
        event.preventDefault();
        form.submit();
	});

	form.fields = fields || {};

	//Used because ObjectField uses some FVForm.prototype functions
	form.fields_element = form.element;

	form.submit_callbacks = [];
}

FVForm.prototype.edit_mode = function(callback){
	var form = this;

	for(var i in form.fields){
		form.fields[i].edit_mode();
	}

	return form;
}

FVForm.prototype.view_mode = function(callback){
	var form = this;

	for(var i in form.fields){
		form.fields[i].view_mode();
	}

	return form;
}

FVForm.prototype.on_submit = function(callback){
	var form = this;

	form.submit_callbacks.push(callback);

	return form;
}

FVForm.prototype.submit = function(){
	var form = this;

	var compiled = form.val();

	for(var i = 0; i < form.submit_callbacks.length; i++){
		var callback = form.submit_callbacks[i];

		callback(compiled);
	}

	//returns compiled as well as invoking callback
	return compiled;
}

FVForm.prototype.add_field = function(name, field){
	var form = this;

    field.container.appendTo(form.fields_element);
    form.fields[name] = field;

    return form;
}

//Same as FVForm.error(null)
FVForm.prototype.clear_errors = function(){
	var form = this;
	form.error(null);
}

FVForm.prototype.fields_error = function(error){
	var form = this;

	if(error){
	    var invalid_fields = error.invalid || {};
	    var missing_fields = error.missing || {};
	    var unrecognized_fields = error.unrecognized || {};
	    
	    for(var i in form.fields){
	    	var field = form.fields[i];

	    	var field_error = invalid_fields[i] || missing_fields[i] || unrecognized_fields[i] || null;
    		field.error(field_error);
	    }

	} else {
		for(var i in form.fields){
			var field = form.fields[i];
			field.error(null);
		}
	}
}

FVForm.prototype.show_error = function(){
    var form = this;
    form.error_message.show();
}

FVForm.prototype.hide_error = function(){
    var form = this;
    form.error_message.hide();
}

FVForm.prototype.error = function(error) {
    var form = this;

    form.error_message.empty();

    if(error){

    	if(error.error===undefined){
    		console.error("No error provided");
    		return;
    	}

    	if(error.error===0){
        	form.fields_error(error);
        	form.hide_error();
        } else {
        	if(error.error===4){
	            var error_list = $("<ul />");
	            for(var i = 0; i < error.errors.length; i++){
	                var sub_error = error.errors[i];
	                if(sub_error.error===0){
	                	form.fields_error(sub_error);
	                } else {
		                error_list.append(
		                    $("<li />").text(sub_error.error_message)
		                )
		            }
	            }
	            form.error_message.append(
	                error_list
	            );
	        } else {
	        	form.error_message.append(
	                $("<span />").text(error.error_message)
	            )
	        }
	        form.show_error();
		}
    } else {
    	//Clear error
    	form.fields_error(null);
    	form.hide_error();
    }
}

FVForm.prototype.disable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.disable();
	}
}

FVForm.prototype.enable = function(){
	var form = this;

	for(var i in form.fields){
		var field = form.fields[i];
		field.enable();
	}	
}

FVForm.prototype.val = function(set_val){
    var form = this;

    if (arguments.length===0) {
        var output = {};
		for(var i in form.fields){
			var field = form.fields[i];
			if(field.show_on_form_flag){
				output[i] = field.val();
			}
		}
		return output;
    } else {
    	for(var i in form.fields){
    		var field = form.fields[i];
    		field.val(set_val[i]);
    	}
        return form;
    }
}