import type { PetDefinition } from '@flowscape-ui/mimimo';

// Original lightweight vector artwork by Flowscape. No remote assets are fetched.
function frame(
  expression: 'idle' | 'blink' | 'happy' | 'sleep' | 'thinking',
  offset = 0,
): string {
  const eyes =
    expression === 'blink' || expression === 'sleep'
      ? '<path d="M43 64h9m24 0h9" stroke="#aaf4df" stroke-width="4" stroke-linecap="round"/>'
      : expression === 'happy'
        ? '<path d="M43 67q5-10 10 0m22 0q5-10 10 0" fill="none" stroke="#aaf4df" stroke-width="4" stroke-linecap="round"/>'
        : '<ellipse cx="48" cy="63" rx="3" ry="5" fill="#aaf4df"/><ellipse cx="80" cy="63" rx="3" ry="5" fill="#aaf4df"/>';
  const extra =
    expression === 'thinking'
      ? '<circle cx="109" cy="19" r="12" fill="#fdf1b6"/><text x="109" y="24" text-anchor="middle" font-size="16" fill="#58365b">?</text>'
      : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g transform="translate(0 ${offset})"><ellipse cx="64" cy="110" rx="38" ry="5" fill="#132d47" opacity=".2"/><path d="M64 30V17" stroke="#51cbbf" stroke-width="4"/><circle cx="64" cy="14" r="6" fill="#e8ff9d"/><rect x="18" y="30" width="92" height="74" rx="27" fill="#79e0d1" stroke="#254855" stroke-width="3"/><rect x="30" y="44" width="68" height="43" rx="16" fill="#173b4a"/><path d="M39 104V111M89 104V111" stroke="#254855" stroke-width="7" stroke-linecap="round"/>${eyes}<path d="M59 77q5 5 10 0" fill="none" stroke="#aaf4df" stroke-width="2.5" stroke-linecap="round"/></g>${extra}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
export const byte = {
  id: 'byte',
  name: 'Byte',
  width: 128,
  height: 128,
  animations: {
    idle: {
      frames: [frame('idle'), frame('idle', -2), frame('idle'), frame('blink')],
      fps: 2,
    },
    happy: {
      frames: [
        frame('happy'),
        frame('happy', -8),
        frame('happy'),
        frame('happy', -5),
      ],
      fps: 6,
      loop: false,
    },
    thinking: { frames: [frame('thinking'), frame('thinking', -2)], fps: 2 },
    sleep: { frames: [frame('sleep'), frame('sleep', 2)], fps: 1 },
  },
} as const satisfies PetDefinition;
