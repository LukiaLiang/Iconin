import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { editorLivePreviewField } from "obsidian";
import {
  createIcon,
  createShortcodeRegex,
  hasIcon,
} from "./icon-registry";

class IconWidget extends WidgetType {
  constructor(private readonly name: string) {
    super();
  }

  eq(other: IconWidget): boolean {
    return other.name === this.name;
  }

  toDOM(): HTMLElement {
    return createIcon(this.name) ?? document.createElement("span");
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function selectionTouches(view: EditorView, from: number, to: number): boolean {
  return view.state.selection.ranges.some(
    (selection) => selection.from <= to && selection.to >= from,
  );
}

function isCode(state: EditorState, from: number, to: number): boolean {
  for (const position of [from, Math.max(from, to - 1)]) {
    const cursor = syntaxTree(state).cursorAt(position, 1);
    do {
      if (/code/i.test(cursor.name)) return true;
    } while (cursor.parent());
  }
  return false;
}

function buildDecorations(view: EditorView): DecorationSet {
  if (!view.state.field(editorLivePreviewField, false)) return Decoration.none;

  const ranges = [];
  for (const visible of view.visibleRanges) {
    const text = view.state.doc.sliceString(visible.from, visible.to);
    for (const match of text.matchAll(createShortcodeRegex())) {
      const name = match[1];
      const from = visible.from + (match.index ?? 0);
      const to = from + match[0].length;
      if (!hasIcon(name) || selectionTouches(view, from, to)) continue;
      if (isCode(view.state, from, to)) continue;

      ranges.push(
        Decoration.replace({ widget: new IconWidget(name) }).range(from, to),
      );
    }
  }
  return Decoration.set(ranges, true);
}

export function livePreviewExtension() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.selectionSet ||
          update.viewportChanged ||
          update.startState.field(editorLivePreviewField, false) !==
            update.state.field(editorLivePreviewField, false)
        ) {
          this.decorations = buildDecorations(update.view);
        }
      }
    },
    {
      decorations: (value) => value.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) =>
          view.plugin(plugin)?.decorations ?? Decoration.none,
        ),
    },
  );
}
