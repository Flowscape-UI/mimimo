export interface Area {
  left: number;
  top: number;
  width: number;
  height: number;
}
export function viewport(): Area {
  return {
    left: 0,
    top: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
export function containerArea(container: HTMLElement): Area {
  const rect = container.getBoundingClientRect();
  return {
    left: rect.left + container.clientLeft,
    top: rect.top + container.clientTop,
    width: container.clientWidth,
    height: container.clientHeight,
  };
}
function intersect(a: Area, b: Area, x = true, y = true): Area {
  const left = x ? Math.max(a.left, b.left) : a.left;
  const top = y ? Math.max(a.top, b.top) : a.top;
  return {
    left,
    top,
    width: Math.max(
      0,
      (x ? Math.min(a.left + a.width, b.left + b.width) : a.left + a.width) -
        left,
    ),
    height: Math.max(
      0,
      (y ? Math.min(a.top + a.height, b.top + b.height) : a.top + a.height) -
        top,
    ),
  };
}
export function visibleArea(container: HTMLElement, area: Area): Area {
  let visible = intersect(area, viewport());
  for (
    let parent = container.parentElement;
    parent && parent !== document.body;
    parent = parent.parentElement
  ) {
    const style = getComputedStyle(parent);
    const x = /(hidden|clip|auto|scroll)/.test(style.overflowX);
    const y = /(hidden|clip|auto|scroll)/.test(style.overflowY);
    if (x || y) visible = intersect(visible, containerArea(parent), x, y);
  }
  if (!container.isConnected || !container.getClientRects().length)
    return { ...visible, width: 0, height: 0 };
  return visible;
}
