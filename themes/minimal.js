//Change the layout function for ObjectFields to place the error at the top
var layout_function = FVField.prototype.layout;
FVField.prototype.layout = function(){
    var field = this;

    if(field instanceof FVObjectField){
    	field.element.append(
	        field.title,field.error_message,
            field.input_holder
	    )
    } else {
	    layout_function.call(field);
	}
}