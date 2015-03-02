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
		field.on_change(function() {
			done();		
		})
		field.val("new_value");
		field.check_changed();
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

})

	describe("FVProxyField", function() {
	
	beforeEach(function() {
		field = new FVProxyField();
		$("body").append(field.element);
	})

	afterEach(function() {
		field.remove();
		assert.equal(field.element.parent().length, 0);
		field = undefined;
	})

	it("should be replaced by a FVTextField", function() {
		var text_field = new FVTextField();
		text_field.val("text_field_value");
		
		field.replace(text_field);
		assert.equal(field.val(), text_field.val());
	})

	it("should retain classes and modifications after replacing", function() {
		field.element.addClass("test_class");
		field.title.empty().append(
	        $("<div/>").text("test element")
	    )

		var text_field = new FVTextField();
		field.replace(text_field);
		assert.notEqual(field.element.attr("class").indexOf("test_class"), -1);
		assert.equal(field.title.children().eq(0).text(), "test element");
	})

	describe("be replaced by FVArrayField", function() {

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
		

	})

	describe("be replaced by FVObjectField", function() {

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

	})

	describe("be replaced by FVKeyValueField", function() {
		
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

	})


})

})
