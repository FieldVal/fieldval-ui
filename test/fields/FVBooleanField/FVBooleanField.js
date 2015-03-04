@import("../common/common.js")

it("should call on_change when val was called", function(done) {
	var new_value = false
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})

it("should call on_change when input value has changed", function(done) {
	field.on_change(function(val) {
		done();
	})
	field.input.trigger({ type: 'change' });
})