describe("FVKeyValueField", function() {

	beforeEach(function() {
		field = new FVKeyValueField();
		field.new_field = function() {
			return new FVTextField();
		}
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVKeyValueField.js");

})