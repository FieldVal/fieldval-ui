it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})