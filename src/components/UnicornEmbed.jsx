import { useEffect, useRef } from "react";

// Unicorn's own embed runtime, pinned to the version the scenes are exported
// at. That version matters: 2.2.x reads a scene's `layers`, while the 1.4.x
// build reads `history` — point the old runtime at these scenes and it mounts
// without complaint and never draws a frame.
const RUNTIME_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.2.13/dist/unicornStudio.umd.js";

// One tag and one promise for the page, however many scenes mount. The
// runtime is a single global that keeps every scene in one list, so a second
// copy of it would fight the first over window.UnicornStudio.
let runtime = null;

// Which effect instance currently owns each host element. StrictMode mounts
// an effect, tears it down, and mounts it again — so the first instance's
// init() can resolve *after* the second has already built the scene, and its
// cleanup would then destroy a scene it does not own. The scene would vanish
// in development and be fine in production, which is exactly the kind of bug
// a build-only check misses. The token is what tells the two apart.
const owners = new WeakMap();
let nextOwner = 0;

function loadRuntime() {
  if (runtime) return runtime;
  runtime = new Promise((resolve, reject) => {
    if (window.UnicornStudio?.init) {
      resolve(window.UnicornStudio);
      return;
    }
    const script = document.createElement("script");
    script.src = RUNTIME_SRC;
    script.async = true;
    script.onload = () =>
      window.UnicornStudio?.init
        ? resolve(window.UnicornStudio)
        : reject(new Error("UnicornStudio did not attach to window"));
    script.onerror = () => reject(new Error(`Could not load ${RUNTIME_SRC}`));
    document.head.append(script);
  }).catch((error) => {
    // Let a later mount try again rather than caching the failure forever.
    runtime = null;
    throw error;
  });
  return runtime;
}

// A scene is only ever built against a host that has a box. The audience
// switch keeps both pages mounted and hides one with display: none (see
// App.jsx), which is the case this has to survive: a host inside the hidden
// page measures 0x0, and a scene built at 0x0 stays that size — the runtime
// marks the host initialised, never revisits it, and the box reads as an
// empty black panel once its page is the one showing. Waiting for a real
// size, and tearing the scene back down when the box goes away, is what
// keeps a scene and its host the same size as each other.
//
// Holding the project id back until then is the other half of it: init()
// is global — it walks every [data-us-project] on the page that is not yet
// marked initialised — so any other embed's init() would otherwise mount
// this hidden host as a side effect, whatever this instance does.
const MIN_BOX = 1;

function UnicornEmbed({ projectId, className, width, height, scale, dpi }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let building = false;
    const owner = ++nextOwner;
    owners.set(host, owner);

    // Only this element's scene, never the runtime's own destroy(), which
    // tears down every scene on the page.
    const teardown = () => {
      window.UnicornStudio?.scenes
        ?.filter((scene) => scene?.element === host)
        .forEach((scene) => scene.destroy?.());
      host.removeAttribute("data-us-initialized");
      host.removeAttribute("data-us-project");
    };

    const hasBox = () => {
      const box = host.getBoundingClientRect();
      return box.width >= MIN_BOX && box.height >= MIN_BOX;
    };

    const build = () => {
      if (cancelled || building) return;
      if (host.hasAttribute("data-us-project")) return;

      building = true;
      host.setAttribute("data-us-project", projectId);

      loadRuntime()
        .then((studio) => studio.init())
        .then(() => {
          building = false;
          // Torn down or hidden before init resolved. Clean up only if no
          // later instance has claimed this host in the meantime —
          // otherwise this would destroy that instance's scene.
          if (owners.get(host) !== owner) return;
          if (cancelled || !hasBox()) teardown();
        })
        .catch((error) => {
          building = false;
          host.removeAttribute("data-us-project");
          // A blocked CDN or a missing WebGL2 context must not take the page
          // with it: the panel keeps the flat colour underneath instead.
          console.error("UnicornEmbed:", error);
        });
    };

    // Fires with a zero box when the page this sits on is hidden, and with a
    // real one when it comes back — which is exactly the pair of moments a
    // scene has to be torn down and rebuilt on.
    const sync = () => {
      if (hasBox()) build();
      else if (!building) teardown();
    };

    const observer = new ResizeObserver(sync);
    observer.observe(host);
    sync();

    return () => {
      cancelled = true;
      observer.disconnect();
      teardown();
    };
  }, [projectId]);

  return (
    <div
      className={className}
      ref={hostRef}
      data-us-scale={scale}
      data-us-dpi={dpi}
      style={{ width, height }}
    />
  );
}

export default UnicornEmbed;
