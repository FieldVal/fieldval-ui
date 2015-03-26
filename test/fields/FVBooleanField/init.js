describe("FVBooleanField", function() {

	beforeEach(function() {
		field = new FVBooleanField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVBooleanField.js");

})