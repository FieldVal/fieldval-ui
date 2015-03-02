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