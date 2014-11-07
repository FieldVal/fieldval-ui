fieldval_ui_extend(DisplayField, Field);

function DisplayField(name, options) {
    var field = this;

    DisplayField.superConstructor.call(this, name, options);

    field.element.addClass("fv_display_field");

    field.input = $("<div />")
    .appendTo(field.input_holder);

    field.output_flag = false;//Don't output the field
}

DisplayField.prototype.icon = function(params) {
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

DisplayField.replace_line_breaks = function(string){
    if(typeof string !== 'string'){
        return string;
    }
    var htmls = [];
    var lines = string.split(/\n/);
    var tmpDiv = jQuery(document.createElement('div'));
    for (var i = 0 ; i < lines.length ; i++) {
        htmls.push(tmpDiv.text(lines[i]).html());
    }
    return htmls.join("<br>");
}

DisplayField.prototype.val = function(set_val) {
    var field = this;

    if (arguments.length===0) {
        return field.input.text();
    } else {
        field.input.html(DisplayField.replace_line_breaks(set_val));
        return field;
    }
}