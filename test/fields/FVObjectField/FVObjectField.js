describe("FVObjectField", function() {

	beforeEach(function() {
		field = new FVObjectField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVObjectField_methods.js");

})