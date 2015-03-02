describe("FVTextField", function() {

	beforeEach(function() {
		text_field = new FVTextField("text_field");
		$("body").append(text_field.element);
	})

	afterEach(function() {
		text_field.element.remove();
	})

	it("should display an error", function() {
		text_field.error({
			error: 9999,
			error_message: "test error"
		})
		text_field.show_error();

		var error_element = text_field.error_message.eq(0).children().eq(0);
		assert.equal(error_element.text(), "test error");
		assert.equal(error_element.css("display"), "inline");
	})

})