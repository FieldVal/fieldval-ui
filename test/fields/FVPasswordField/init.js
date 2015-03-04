describe("FVPasswordField", function() {

	beforeEach(function() {
		field = new FVPasswordField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVPasswordField.js");

})