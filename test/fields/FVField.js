describe("FVField", function() {

	beforeEach(function() {
		field = new FVField("field");
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("./common/common.js")


})