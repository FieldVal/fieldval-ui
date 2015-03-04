it("should add a field", function() {
	field.add_field("test", new FVField());
	assert.equal(Object.keys(field.fields).length, 1)
})

it("should remove a field", function() {
	field.add_field("test", new FVField());
	field.remove_field("test");
	assert.equal(Object.keys(field.fields).length, 0)
})

it("should set value", function() {
	field.add_field("one", new FVTextField());
	
	var object_field = new FVObjectField();
	object_field.add_field("two", new FVTextField());
	object_field.add_field("three", new FVTextField());

	field.add_field("object", object_field);

	var value = {
		one: "first_value",
		object: {
			two: "second_value",
			three: "third_value"
		}
	}

	field.val(value);

	assert.deepEqual(field.val(), value);

})

it("should call on_change once when val was called", function(done) {
	field.add_field("text", new FVTextField());
	field.add_field("bool", new FVBooleanField());
	
	var new_value = {
		text: "new_value",
		bool: false
	}
	
	field.on_change(function(val) {
		assert.deepEqual(val, new_value);
		done();
	})

	field.val(new_value);
})

it ("should call on_change when its child has changed", function(done) {
	var text_field = new FVTextField();
	field.add_field("text", text_field);
	
	field.on_change(function(val) {
		assert.deepEqual(val, {"text": "new_value"});
		done();
	})

	text_field.val("new_value");
})