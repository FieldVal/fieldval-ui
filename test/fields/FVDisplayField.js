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

	@import("./common/common.js")
	@import("./common/text_field_common.js")

})