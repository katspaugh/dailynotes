import { useEffect } from "react";

/**
 * Keeps the app shell pinned to the visual viewport while the virtual
 * keyboard is open, and exposes the keyboard height as
 * `--keyboard-inset-bottom`.
 *
 * On iOS Safari, dvh/interactive-widget don't respond to the keyboard: the
 * layout viewport keeps its full height and only the visual viewport
 * shrinks. Safari then lets the user pan the visual viewport within the
 * layout viewport (and does so itself to reveal the focused field), which
 * looks like the whole shell — header included — scrolling. `overflow:
 * hidden` on the body cannot stop that, so whenever the viewport ends up
 * offset we scroll it back to the origin. Scrollable panes pad their bottom
 * with the inset instead, so the caret stays above the keyboard. Android
 * Chrome handles this natively via interactive-widget=resizes-content in the
 * viewport meta tag.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function pinViewport() {
      const vv = window.visualViewport;
      const offsetTop = vv ? vv.offsetTop : 0;
      if (window.scrollY > 0 || window.scrollX > 0 || offsetTop > 0) {
        window.scrollTo(0, 0);
      }
    }

    function sync() {
      const vv = window.visualViewport;
      if (!vv) return;
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty(
        "--keyboard-inset-bottom",
        `${kb}px`,
      );
      pinViewport();
    }

    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    window.addEventListener("scroll", pinViewport);

    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      window.removeEventListener("scroll", pinViewport);
      document.documentElement.style.removeProperty("--keyboard-inset-bottom");
    };
  }, []);
}
