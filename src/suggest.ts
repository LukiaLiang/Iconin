import {
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
} from "obsidian";
import { createIcon, searchIcons } from "./icon-registry";
import { findSuggestionTrigger } from "./suggestion-trigger";

export class IconSuggest extends EditorSuggest<string> {
  constructor(app: App) {
    super(app);
  }

  onTrigger(
    cursor: EditorPosition,
    editor: Editor,
  ): EditorSuggestTriggerInfo | null {
    const trigger = findSuggestionTrigger(
      editor.getLine(cursor.line).slice(0, cursor.ch),
    );
    if (!trigger) return null;

    return {
      start: { line: cursor.line, ch: trigger.start },
      end: { line: cursor.line, ch: trigger.end },
      query: trigger.query,
    };
  }

  getSuggestions(context: EditorSuggestContext): string[] {
    return searchIcons(context.query);
  }

  renderSuggestion(name: string, element: HTMLElement): void {
    element.classList.add("iconin-suggestion");
    const icon = createIcon(name);
    if (icon) element.append(icon);

    const label = document.createElement("span");
    label.className = "iconin-suggestion-name";
    label.textContent = name;
    element.append(label);
  }

  selectSuggestion(name: string): void {
    const context = this.context;
    if (!context) return;

    context.editor.replaceRange(
      `::${name}::`,
      context.start,
      context.end,
    );
  }
}
