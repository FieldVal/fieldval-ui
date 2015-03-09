describe("FieldVal UI", function() {
	
	describe("FVField", function() {

	beforeEach(function() {
		field = new FVField("field");
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})


})
	
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

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})

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

})

	describe("FVTextField", function() {

	beforeEach(function() {
		field = new FVTextField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})
it("should call on_change when input value has changed", function(done) {
	var old_val = field.val();
	field.on_change(function(val) {
		assert.equal(val, old_val + "a");
		done();
	})

	field.input.val(old_val + "a");
	field.input.trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
})

})
	
	describe("FVPasswordField", function() {

	beforeEach(function() {
		field = new FVPasswordField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})
it("should call on_change when input value has changed", function(done) {
	var old_val = field.val();
	field.on_change(function(val) {
		assert.equal(val, old_val + "a");
		done();
	})

	field.input.val(old_val + "a");
	field.input.trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
})

})
	describe("FVChoiceField", function() {

	beforeEach(function() {
		field = new FVChoiceField("choice_field", {
			choices: ["new_value", "two", "three"]
		});
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})

})
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

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})

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
	describe("FVDisplayField", function() {

	beforeEach(function() {
		field = new FVDisplayField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})

})

	describe("FVArrayField", function() {

	beforeEach(function() {
		field = new FVArrayField();
		field.new_field = function() {
			return new FVTextField();
		}
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

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
	var value = ["one", "two", "three"];
	field.val(value);
	assert.deepEqual(field.val(), value);
})

it("should call on_change once when val was called", function(done) {
	field.new_field = function() {
		return new FVTextField();
	}

	var new_value = ["first_value", "second_value"]
	
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

	field.val(["first_value", "second_value"]);

	field.on_change(function(val) {
		assert.deepEqual(val, ["new_value", "second_value"]);
		done();
	})

	field.fields[0].val("new_value");
})

})
	describe("FVObjectField", function() {

	beforeEach(function() {
		field = new FVObjectField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

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
})
	describe("FVKeyValueField", function() {

	beforeEach(function() {
		field = new FVKeyValueField();
		field.new_field = function() {
			return new FVTextField();
		}
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

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

})

	describe("FVProxyField", function() {
	
	beforeEach(function() {
		field = new FVProxyField();
		replace_callback_count = 0;
		field.on_replace(function(){
			replace_callback_count++;
		})
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(replace_callback_count, 1);
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	describe("replaced by a FVTextField", function() {
		beforeEach(function() {
			field.replace(new FVTextField());
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})
it("should call on_change when input value has changed", function(done) {
	var old_val = field.val();
	field.on_change(function(val) {
		assert.equal(val, old_val + "a");
		done();
	})

	field.input.val(old_val + "a");
	field.input.trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
})

	})

	describe("replaced by a FVPasswordField", function() {
		beforeEach(function() {
			field.replace(new FVPasswordField());
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})
it("should call on_change when input value has changed", function(done) {
	var old_val = field.val();
	field.on_change(function(val) {
		assert.equal(val, old_val + "a");
		done();
	})

	field.input.val(old_val + "a");
	field.input.trigger({ type: 'keyup', keyCode: 65, which: 65, charcCode:65});
})

	})

	describe("replaced by a FVDisplayField", function() {
		beforeEach(function() {
			field.replace(new FVDisplayField());
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})

	})

	describe("replaced by a FVDateField", function() {
		beforeEach(function() {
			field.replace(new FVDateField());
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})

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

	describe("replaced by a FVBooleanField", function() {
		beforeEach(function() {
			field.replace(new FVBooleanField());
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})

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

	})

	describe("replaced by a FVChoiceField", function() {
		beforeEach(function() {
			field.replace(new FVChoiceField("choice_field", {
				choices: ["new_value", "two", "three"]
			}));
		})

		it("should display an error", function() {
	field.error({
		error: 9999,
		error_message: "test error"
	})
	field.show_error();

	var error_element = field.error_message.eq(0).children().eq(0);
	assert.equal(error_element.text(), "test error");
	assert.equal(error_element.css("display"), "inline");
})
it("should call on_change when val was called", function(done) {
	var new_value = "new_value";
	field.on_change(function(val) {
		assert.equal(val, new_value);
		done();
	})
	field.val(new_value);
})

	})

	describe("replaced by FVArrayField", function() {

		beforeEach(function() {
			var array_field = new FVArrayField();
			array_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(array_field);
		})

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
	var value = ["one", "two", "three"];
	field.val(value);
	assert.deepEqual(field.val(), value);
})

it("should call on_change once when val was called", function(done) {
	field.new_field = function() {
		return new FVTextField();
	}

	var new_value = ["first_value", "second_value"]
	
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

	field.val(["first_value", "second_value"]);

	field.on_change(function(val) {
		assert.deepEqual(val, ["new_value", "second_value"]);
		done();
	})

	field.fields[0].val("new_value");
})

	})

	describe("replaced by FVObjectField", function() {

		beforeEach(function() {
			var object_field = new FVObjectField();
			field.replace(object_field);
		})

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

	})

	describe("replaced by FVKeyValueField", function() {
		
		beforeEach(function() {
			var key_value_field = new FVKeyValueField();
			key_value_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(key_value_field);
		})

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

	})


})

})
