//Change the layout function for ObjectFields to place the error at the top
var layout_function = Field.prototype.layout;
Field.prototype.layout = function(){
    var field = this;

    if(field instanceof ObjectField){
	    field.container.append(
	        field.title,
	        field.element.append(
	            field.error_message,
	            field.input_holder
	        )
	    )
    } else {
	    layout_function.call(field);
	}
}