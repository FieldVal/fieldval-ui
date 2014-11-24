fieldval_ui_extend(FVPasswordField, FVTextField);

function FVPasswordField(name) {
    var field = this;

    FVPasswordField.superConstructor.call(this, name, {
        type: "password"
    });
}