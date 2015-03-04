describe("FVChoiceField", function() {

	beforeEach(function() {
		field = new FVChoiceField("choice_field", {
			choices: ["new_value", "two", "three"]
		});
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("FVChoiceField.js");

})