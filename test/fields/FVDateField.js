describe("FVDateField", function() {

	beforeEach(function() {
		field = new FVDateField("date_field", {format: "yyyy-MM-dd"});
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	@import("./common/common.js")

	it("should call on_change when value has changed", function(done) {
		var new_value = "2015-12-12";
		field.on_change(function(val) {
			assert.equal(val, new_value);
			done();
		})
		field.val(new_value);
	})

	it("should call on_change when input value has changed", function(done) {
		var old_val = field.val();
		field.on_change(function(val) {
			done();
		})

		field.inputs[0].val(old_val + "a");
		field.inputs[0].trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
	})

})