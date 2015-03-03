it("should call on_change when value has changed", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})