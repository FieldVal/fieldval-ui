describe("FVDisplayField", function() {

	beforeEach(function() {
		field = new FVDisplayField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVDisplayField.js");

})