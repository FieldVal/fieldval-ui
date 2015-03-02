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