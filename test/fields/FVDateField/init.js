describe("FVDateField", function() {

	beforeEach(function() {
		field = new FVDateField("date_field", {format: "yyyy-MM-dd"});
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVDateField.js");

})