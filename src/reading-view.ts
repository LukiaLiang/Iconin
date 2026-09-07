import {
  createIcon,
  createShortcodeRegex,
  hasIcon,
} from "./icon-registry";

function eligibleTextNodes(root: HTMLElement): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!node.nodeValue?.includes("::") || !parent) {
        return NodeFilter.FILTER_REJECT;
      }
      if (parent.closest("code, pre, script, style, .iconin-icon")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current: Node | null;
  while ((current = walker.nextNode())) nodes.push(current as Text);
  return nodes;
}

export function processShortcodes(root: HTMLElement): void {
  for (const textNode of eligibleTextNodes(root)) {
    const text = textNode.nodeValue ?? "";
    const regex = createShortcodeRegex();
    let match: RegExpExecArray | null;
    let cursor = 0;
    let changed = false;
    const fragment = document.createDocumentFragment();

    while ((match = regex.exec(text))) {
      const name = match[1];
      if (!hasIcon(name)) continue;
      const icon = createIcon(name);
      if (!icon) continue;

      fragment.append(text.slice(cursor, match.index), icon);
      cursor = match.index + match[0].length;
      changed = true;
    }

    if (changed) {
      fragment.append(text.slice(cursor));
      textNode.replaceWith(fragment);
    }
  }
}
