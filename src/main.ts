import { Plugin } from "obsidian";
import { SageSettings, DEFAULT_SETTINGS, SageSettingTab } from "./settings";
import { explainSelection } from "./explainSelection";

export default class SagePlugin extends Plugin {
    settings!: SageSettings;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SageSettingTab(this.app, this));

        this.registerEvent(
            this.app.workspace.on("editor-menu", (menu, editor) => {
                if (!editor.getSelection()) return;
                menu.addItem((item) =>
                    item.setTitle("Explain selection")
                        .setIcon("leaf")
                        .onClick(() => explainSelection(this, editor))
                );
            })
        );

        this.addCommand({
            id: "explain-selection",
            name: "Explain selection",
            icon: "leaf",
            editorCheckCallback: (checking, editor) => {
                if (!editor.getSelection()) return false;
                if (!checking) void explainSelection(this, editor);
                return true;
            },
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as SageSettings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
