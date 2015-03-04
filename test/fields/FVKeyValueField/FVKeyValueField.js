it("should add a field", function() {
	field.add_field_clicked();
	assert.equal(field.fields.length, 1);
})

it("should remove a field", function() {
	field.add_field_clicked();
	field.remove_field(field.fields[0]);
	assert.equal(field.fields.length, 0);
})

it("should set value", function() {
	var value = {
		one: "first_value",
		two: "second_value",
		three: "third_value"
	}
	field.val(value);
	assert.deepEqual(field.val(), value);
})

it("should call on_change once when val was called", function(done) {
	field.new_field = function() {
		return new FVTextField();
	}

	var new_value = {
		"one": "first_value",
		"two": "second_value"
	}
	
	field.on_change(function(val) {
		assert.deepEqual(val, new_value);
		done();
	})

	field.val(new_value);
})

it ("should call on_change when its child has changed", function(done) {
	field.new_field = function() {
		return new FVTextField();
	}

	field.val({
		"one": "first_value",
		"two": "second_value"
	});

	field.on_change(function(val) {
		assert.deepEqual(val, {
			"one": "new_value",
			"two": "second_value"
		});
		done();
	})

	field.fields[0].val("new_value");
})