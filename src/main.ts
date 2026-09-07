import { Plugin } from "obsidian";
import { livePreviewExtension } from "./live-preview";
import { processShortcodes } from "./reading-view";
import { IconSuggest } from "./suggest";

export default class IconinPlugin extends Plugin {
  onload(): void {
    this.registerEditorSuggest(new IconSuggest(this.app));
    this.registerEditorExtension(livePreviewExtension());
    this.registerMarkdownPostProcessor(processShortcodes);
  }
}
