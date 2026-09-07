// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { useKeyboardInset } from "../hooks/useKeyboardInset";

interface FakeViewport extends EventTarget {
  height: number;
  offsetTop: number;
}

function installViewport(height: number, offsetTop = 0): FakeViewport {
  const vv = new EventTarget() as FakeViewport;
  vv.height = height;
  vv.offsetTop = offsetTop;
  Object.defineProperty(window, "visualViewport", {
    configurable: true,
    value: vv,
  });
  return vv;
}

describe("useKeyboardInset", () => {
  const originalScrollTo = window.scrollTo;
  let scrollY = 0;

  beforeEach(() => {
    scrollY = 0;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });
    window.scrollTo = vi.fn((...args: unknown[]) => {
      const y = typeof args[0] === "object" ? 0 : (args[1] as number);
      scrollY = y;
    }) as typeof window.scrollTo;
  });

  afterEach(() => {
    window.scrollTo = originalScrollTo;
    Reflect.deleteProperty(window, "visualViewport");
    document.documentElement.style.removeProperty("--keyboard-inset-bottom");
  });

  it("exposes the keyboard height as a CSS variable", () => {
    const vv = installViewport(800);
    renderHook(() => useKeyboardInset());

    vv.height = 500;
    vv.dispatchEvent(new Event("resize"));

    expect(
      document.documentElement.style.getPropertyValue("--keyboard-inset-bottom"),
    ).toBe("300px");
  });

  it("pins the shell when iOS pans the visual viewport under the keyboard", () => {
    const vv = installViewport(800);
    renderHook(() => useKeyboardInset());
    expect(window.scrollTo).not.toHaveBeenCalled();

    // Keyboard opens and the user drags the header: the visual viewport
    // slides down within the layout viewport instead of the content scrolling.
    vv.height = 500;
    vv.offsetTop = 120;
    scrollY = 120;
    vv.dispatchEvent(new Event("scroll"));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("pins the shell when the layout viewport itself gets scrolled", () => {
    installViewport(800);
    renderHook(() => useKeyboardInset());

    scrollY = 60;
    window.dispatchEvent(new Event("scroll"));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("does not scroll when nothing is panned", () => {
    const vv = installViewport(800);
    renderHook(() => useKeyboardInset());

    vv.height = 500;
    vv.dispatchEvent(new Event("resize"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
