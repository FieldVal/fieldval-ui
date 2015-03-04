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

	describe("replaced by a FVTextField", function() {
		beforeEach(function() {
			field.replace(new FVTextField());
		})

		@import("FVTextField/FVTextField.js");

	})

	describe("replaced by a FVPasswordField", function() {
		beforeEach(function() {
			field.replace(new FVPasswordField());
		})

		@import("FVPasswordField/FVPasswordField.js");

	})

	describe("replaced by a FVDisplayField", function() {
		beforeEach(function() {
			field.replace(new FVDisplayField());
		})

		@import("FVDisplayField/FVDisplayField.js");

	})

	describe("replaced by a FVDateField", function() {
		beforeEach(function() {
			field.replace(new FVDateField());
		})

		@import("FVDateField/FVDateField.js");

	})

	describe("replaced by a FVBooleanField", function() {
		beforeEach(function() {
			field.replace(new FVBooleanField());
		})

		@import("FVBooleanField/FVBooleanField.js");

	})

	describe("replaced by a FVChoiceField", function() {
		beforeEach(function() {
			field.replace(new FVChoiceField("choice_field", {
				choices: ["new_value", "two", "three"]
			}));
		})

		@import("FVChoiceField/FVChoiceField.js");

	})

	describe("replaced by FVArrayField", function() {

		beforeEach(function() {
			var array_field = new FVArrayField();
			array_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(array_field);
		})

		@import("FVArrayField/FVArrayField.js");

	})

	describe("replaced by FVObjectField", function() {

		beforeEach(function() {
			var object_field = new FVObjectField();
			field.replace(object_field);
		})

		@import("FVObjectField/FVObjectField.js");

	})

	describe("replaced by FVKeyValueField", function() {
		
		beforeEach(function() {
			var key_value_field = new FVKeyValueField();
			key_value_field.new_field = function() {
				return new FVTextField();
			}
			field.replace(key_value_field);
		})

		@import("FVKeyValueField/FVKeyValueField.js");

	})


})