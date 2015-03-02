describe("FVTextField", function() {

	beforeEach(function() {
		field = new FVTextField("text_field");
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("./common/common.js")

	it("should call on_change when value has changed", function(done) {
		field.on_change(function() {
			done();		
		})
		field.val("new_value");
		field.check_changed();
	})

})