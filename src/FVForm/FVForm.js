fieldval_ui_extend(FVForm, FVObjectField);

function FVForm(fields){
	var form = this;

	FVForm.superConstructor.call(this);

	var children = form.element.children();

	form.element.remove();
	form.element = $("<form />").addClass("fv_form").append(children);

	form.element.on("submit",function(event){
        event.preventDefault();
        form.submit();
        return false;
	});

	form.fields_element = form.element;

	form.submit_callbacks = [];
}
FVForm.button_event = 'click';
FVForm.is_mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|nokia|series40|x11|opera mini/i.test(navigator.userAgent.toLowerCase());
if($.tap){
	FVForm.button_event = 'tap';
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

	return compiled;
}