fieldval_ui_extend(FVForm, FVObjectField);

function FVForm(fields){
	var form = this;

	FVForm.superConstructor.call(this,null,{
		use_form: true
	});

	form.element.addClass("fv_form");
}
FVForm.button_event = 'click';
FVForm.is_mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|nokia|series40|x11|opera mini/i.test(navigator.userAgent.toLowerCase());
if($.fn.tap || $.tap){
	FVForm.button_event = 'tap';
}