it("should call on_change when input value has changed", function(done) {
	var old_val = field.val();
	field.on_change(function(val) {
		assert.equal(val, old_val + "a");
		done();
	})

	field.input.val(old_val + "a");
	field.input.trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
})