spimosimCore.modules.add("creator-module-templates", "SettingsPreprocessor", {
  labelText: "SettingsPreprocessor",
  description: `A SettingsPreprocessor processes settings before passing them
to the model. This is useful if different settings need to be combined in a
model independent way. Otherwise it is usually easier to extend the
updateSettings() function of the model.`,
  templates: {
    "SettingsPreprocessor": {
      object: 'MySettingsPreprocessor',
      template: `
function MySettingsPreprocessor() {
}
      `
    }
  }
});
