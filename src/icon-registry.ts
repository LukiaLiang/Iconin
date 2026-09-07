import { createElement, icons as lucideIcons } from "lucide";
import { generatedIconNames } from "./generated-icon-names";

type IconNode = Parameters<typeof createElement>[0];

export const SHORTCODE_PATTERN = /::([a-z0-9]+(?:-[a-z0-9]+)*)::/g;
export const MAX_SUGGESTIONS = 100;

function toPascalCase(name: string): string {
  return name.replace(/(^|-)([a-z0-9])/g, (_match, _dash, character: string) =>
    character.toUpperCase(),
  );
}

const registry = new Map<string, IconNode>();

for (const name of generatedIconNames) {
  const iconNode = lucideIcons[toPascalCase(name) as keyof typeof lucideIcons];
  if (iconNode) registry.set(name, iconNode);
}

export const iconNames = [...registry.keys()];

export function hasIcon(name: string): boolean {
  return registry.has(name);
}

export function searchIcons(query: string, limit = MAX_SUGGESTIONS): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return iconNames.slice(0, limit);

  return iconNames
    .filter((name) => name.includes(normalized))
    .sort((left, right) => {
      const score = (name: string): number => {
        if (name === normalized) return 0;
        if (name.startsWith(normalized)) return 1;
        if (name.split("-").some((part) => part.startsWith(normalized))) return 2;
        return 3;
      };

      return score(left) - score(right) || left.localeCompare(right);
    })
    .slice(0, limit);
}

export function createIcon(name: string): HTMLSpanElement | null {
  const iconNode = registry.get(name);
  if (!iconNode) return null;

  const wrapper = document.createElement("span");
  wrapper.className = "iconin-icon";
  wrapper.setAttribute("role", "img");
  wrapper.setAttribute("aria-label", name);

  const svg = createElement(iconNode, {
    width: "1em",
    height: "1em",
    "aria-hidden": "true",
    focusable: "false",
  });
  wrapper.append(svg);
  return wrapper;
}

export function createShortcodeRegex(): RegExp {
  return new RegExp(SHORTCODE_PATTERN.source, "g");
}
