/** Pixels scrolled before a first visit counts as meaningful engagement. */
export const INSTALL_HINT_SCROLL_PX = 800;

/** Time on the page required together with that scroll. A flick of the page does not qualify. */
export const INSTALL_HINT_MIN_MS = 12_000;

export function installHintShouldShow(options: {
  standalone: boolean;
  iosSafari: boolean;
  dismissed: boolean;
  visitCount: number;
  engaged: boolean;
}) {
  if (options.standalone || !options.iosSafari || options.dismissed) return false;
  return options.visitCount >= 2 || options.engaged;
}

export function installHintEngaged(options: {
  elapsedMs: number;
  scrollY: number;
  activatedControl: boolean;
}) {
  if (options.activatedControl) return true;
  return options.elapsedMs >= INSTALL_HINT_MIN_MS && options.scrollY >= INSTALL_HINT_SCROLL_PX;
}
