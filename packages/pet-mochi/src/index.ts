import type { PetDefinition } from '@flowscape-ui/mimimo';

// Original lightweight vector artwork by Flowscape. No remote assets are fetched.
function frame(
  expression: 'idle' | 'blink' | 'happy' | 'sleep' | 'thinking',
  offset = 0,
): string {
  const eyes =
    expression === 'blink' || expression === 'sleep'
      ? '<path d="M43 64h9m24 0h9" stroke="#58365b" stroke-width="4" stroke-linecap="round"/>'
      : expression === 'happy'
        ? '<path d="M43 67q5-10 10 0m22 0q5-10 10 0" fill="none" stroke="#58365b" stroke-width="4" stroke-linecap="round"/>'
        : '<ellipse cx="48" cy="63" rx="3" ry="5" fill="#58365b"/><ellipse cx="80" cy="63" rx="3" ry="5" fill="#58365b"/>';
  const extra =
    expression === 'thinking'
      ? '<circle cx="109" cy="19" r="12" fill="#fdf1b6"/><text x="109" y="24" text-anchor="middle" font-size="16" fill="#58365b">?</text>'
      : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g transform="translate(0 ${offset})"><ellipse cx="64" cy="108" rx="37" ry="6" fill="#251738" opacity=".18"/><path d="M25 69Q23 32 64 29Q105 32 103 69L109 95Q111 111 89 106L75 101Q64 108 53 101L39 106Q17 111 19 95Z" fill="#f9c8e1" stroke="#58365b" stroke-width="3"/><ellipse cx="40" cy="77" rx="9" ry="5" fill="#ee82b2"/><ellipse cx="88" cy="77" rx="9" ry="5" fill="#ee82b2"/>${eyes}<path d="M59 77q5 5 10 0" fill="none" stroke="#58365b" stroke-width="2.5" stroke-linecap="round"/></g>${extra}</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
export const mochi = {
  id: 'mochi',
  name: 'Mochi',
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
