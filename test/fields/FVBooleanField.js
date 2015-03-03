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

	@import("./common/common.js")

	it("should call on_change when value has changed", function(done) {
		var new_value = false
		field.on_change(function(val) {
			assert.equal(val, new_value);
			done();
		})
		field.val(new_value);
	})

})