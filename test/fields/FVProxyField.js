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

	describe("be replaced by FVArrayField", function() {

		beforeEach(function() {
			var array_field = new FVArrayField();
			array_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(array_field);
		})

		@import("FVArrayField/FVArrayField_methods.js");
		

	})

	describe("be replaced by FVObjectField", function() {

		beforeEach(function() {
			var object_field = new FVObjectField();
			field.replace(object_field);
		})

		@import("FVObjectField/FVObjectField_methods.js");

	})

	describe("be replaced by FVKeyValueField", function() {
		
		beforeEach(function() {
			var key_value_field = new FVKeyValueField();
			key_value_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(key_value_field);
		})

		@import("FVKeyValueField/FVKeyValueField_methods.js");

	})


})