/* GENERATED FILE. EDIT src/, THEN RUN BUILD. */
(() => {
  // starter/lib/core/PrototypeContext.jsx
  var PrototypeContext = React.createContext(null);
  function getInitialScreenId(project2) {
    var _a;
    return ((_a = project2.screens.find((screen) => screen.entry)) == null ? void 0 : _a.id) || project2.screens[0].id;
  }
  function PrototypeProvider({ project: project2, children }) {
    const initialScreenId = getInitialScreenId(project2);
    const [state, setState] = React.useState({
      mode: "canvas",
      viewportKey: project2.defaultViewport,
      entryId: initialScreenId,
      currentScreenId: initialScreenId,
      history: []
    });
    const navigate = React.useCallback((id) => {
      if (!project2.screens.some((screen) => screen.id === id)) {
        throw new Error(`Navigation target "${id}" does not exist`);
      }
      setState((current) => {
        if (current.mode === "demo" && id !== current.currentScreenId) {
          const screen = project2.screens.find((item) => item.id === current.currentScreenId);
          if (!screen.links.includes(id)) {
            throw new Error(`Screen "${current.currentScreenId}" links do not include "${id}"`);
          }
        }
        return {
          ...current,
          currentScreenId: id,
          history: current.mode === "demo" && id !== current.currentScreenId ? [...current.history, current.currentScreenId] : current.history
        };
      });
    }, [project2]);
    const selectEntry = React.useCallback((entryId) => {
      const entry = project2.screens.find((screen) => screen.id === entryId);
      if (!entry) throw new Error(`Navigation target "${entryId}" does not exist`);
      setState((current) => ({
        ...current,
        entryId,
        currentScreenId: entryId,
        history: []
      }));
    }, [project2]);
    const goBack = React.useCallback(() => {
      setState((current) => {
        if (current.history.length === 0) return current;
        return {
          ...current,
          currentScreenId: current.history[current.history.length - 1],
          history: current.history.slice(0, -1)
        };
      });
    }, []);
    const reset = React.useCallback(() => {
      setState((current) => ({
        ...current,
        currentScreenId: current.entryId,
        history: []
      }));
    }, [initialScreenId]);
    const setMode = React.useCallback((mode) => {
      if (mode !== "canvas" && mode !== "demo") throw new Error(`Unknown mode "${mode}"`);
      setState((current) => ({
        ...current,
        mode,
        history: []
      }));
    }, []);
    const enterDemo = React.useCallback((screenId) => {
      if (!project2.screens.some((screen) => screen.id === screenId)) {
        throw new Error(`Navigation target "${screenId}" does not exist`);
      }
      setState((current) => ({
        ...current,
        mode: "demo",
        currentScreenId: screenId,
        history: []
      }));
    }, [project2]);
    const setViewportKey = React.useCallback((viewportKey) => {
      if (!Object.hasOwn(project2.viewports, viewportKey)) {
        throw new Error(`Unknown viewport "${viewportKey}"`);
      }
      setState((current) => ({ ...current, viewportKey }));
    }, [project2]);
    const value = React.useMemo(() => ({
      mode: state.mode,
      viewportKey: state.viewportKey,
      viewport: project2.viewports[state.viewportKey],
      entryId: state.entryId,
      currentScreenId: state.currentScreenId,
      navigate,
      goBack,
      reset,
      selectEntry,
      setMode,
      enterDemo,
      setViewportKey,
      canGoBack: state.history.length > 0
    }), [enterDemo, goBack, navigate, project2, reset, selectEntry, setMode, setViewportKey, state]);
    return /* @__PURE__ */ React.createElement(PrototypeContext.Provider, { value }, children);
  }
  function usePrototype() {
    const context = React.useContext(PrototypeContext);
    if (!context) throw new Error("usePrototype must be used inside PrototypeProvider");
    return context;
  }

  // starter/lib/board/navigation.js
  function clampScale(scale) {
    return Math.min(2, Math.max(0.2, scale));
  }
  function fitDemoScale(containerWidth, containerHeight, contentWidth, contentHeight) {
    if (containerWidth <= 0 || containerHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
      return 1;
    }
    return clampScale(Math.min(containerWidth / contentWidth, containerHeight / contentHeight));
  }
  function resetCanvasViewport() {
    return { scale: 1, panX: 0, panY: 0 };
  }
  var FOCUS_PADDING = 40;
  function focusCanvasScreen({
    containerWidth,
    containerHeight,
    screenLeft,
    screenTop,
    screenWidth,
    screenHeight,
    currentScale,
    padding = FOCUS_PADDING
  }) {
    if (containerWidth <= 0 || containerHeight <= 0 || screenWidth <= 0 || screenHeight <= 0 || !Number.isFinite(currentScale)) {
      return null;
    }
    const availWidth = containerWidth - padding * 2;
    const availHeight = containerHeight - padding * 2;
    if (availWidth <= 0 || availHeight <= 0) return null;
    const fitScale = Math.min(availWidth / screenWidth, availHeight / screenHeight);
    const scale = clampScale(Math.min(currentScale, fitScale));
    return {
      scale,
      panX: containerWidth / 2 - (screenLeft + screenWidth / 2) * scale,
      panY: containerHeight / 2 - (screenTop + screenHeight / 2) * scale
    };
  }
  function panFromDragSnapshot(view, snapshot, clientX, clientY) {
    if (!snapshot) return view;
    return {
      ...view,
      panX: snapshot.panX + clientX - snapshot.x,
      panY: snapshot.panY + clientY - snapshot.y
    };
  }
  function isScrollableOverflow(value) {
    return value === "auto" || value === "scroll" || value === "overlay";
  }
  function findScrollableAncestor(startEl, rootEl) {
    let node = startEl && startEl.nodeType === 3 ? startEl.parentElement : startEl;
    while (node) {
      if (node.nodeType === 1) {
        const style = window.getComputedStyle(node);
        const canY = isScrollableOverflow(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
        const canX = isScrollableOverflow(style.overflowX) && node.scrollWidth > node.clientWidth + 1;
        if (canY || canX) return node;
      }
      if (node === rootEl) break;
      node = node.parentElement;
    }
    return null;
  }
  var CONTENT_DRAG_THRESHOLD = 3;
  function isEditableTarget(target) {
    if (!target || typeof target.closest !== "function") return false;
    return !!target.closest('input, textarea, select, [contenteditable="true"]');
  }
  function beginContentDragScroll(event, rootEl, { spaceHeld = false, scale = 1 } = {}) {
    if (spaceHeld) return null;
    if (event.button != null && event.button !== 0) return null;
    if (!rootEl || !rootEl.contains(event.target)) return null;
    if (isEditableTarget(event.target)) return null;
    const scrollable = findScrollableAncestor(event.target, rootEl);
    if (!scrollable) return null;
    return {
      el: scrollable,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scrollable.scrollLeft,
      scrollTop: scrollable.scrollTop,
      scale: scale > 0 ? scale : 1,
      moved: false
    };
  }
  function moveContentDragScroll(state, event) {
    if (!state || state.pointerId !== event.pointerId) return state;
    const dx = (event.clientX - state.startX) / state.scale;
    const dy = (event.clientY - state.startY) / state.scale;
    if (!state.moved && (Math.abs(dx) > CONTENT_DRAG_THRESHOLD || Math.abs(dy) > CONTENT_DRAG_THRESHOLD)) {
      state.moved = true;
    }
    state.el.scrollLeft = state.scrollLeft - dx;
    state.el.scrollTop = state.scrollTop - dy;
    return state;
  }
  function endContentDragScroll(state, rootEl) {
    if (!state || !state.moved || !rootEl) return;
    const preventClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      rootEl.removeEventListener("click", preventClick, true);
    };
    rootEl.addEventListener("click", preventClick, true);
  }
  function shouldZoomOnWheel(event) {
    return !!(event.ctrlKey || event.metaKey);
  }

  // starter/lib/core/ErrorBoundary.jsx
  var ErrorBoundary = class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
      return { error };
    }
    componentDidCatch(error, info) {
      console.error(`[wireframe:${this.props.scope || "unknown"}]`, error, info);
    }
    componentDidUpdate(previousProps) {
      if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
        this.setState({ error: null });
      }
    }
    render() {
      if (!this.state.error) return this.props.children;
      const { screenId, source, scope } = this.props;
      return /* @__PURE__ */ React.createElement("div", { className: "wf-error-card", role: "alert" }, /* @__PURE__ */ React.createElement("strong", null, scope === "screen" ? `Screen: ${screenId}` : "Board error"), source ? /* @__PURE__ */ React.createElement("span", null, "Source: ", source) : null, /* @__PURE__ */ React.createElement("span", null, "Message: ", this.state.error.message), /* @__PURE__ */ React.createElement("pre", null, this.state.error.stack));
    }
  };

  // starter/lib/core/ScreenIdentity.jsx
  var ScreenIdentityContext = React.createContext(null);
  function ScreenIdentityProvider({ screenId, children }) {
    if (!screenId) throw new Error("ScreenIdentityProvider requires screenId");
    return /* @__PURE__ */ React.createElement(ScreenIdentityContext.Provider, { value: screenId }, children);
  }
  function useScreenId() {
    const screenId = React.useContext(ScreenIdentityContext);
    if (!screenId) {
      throw new Error("useScreenId must be used inside a rendered screen");
    }
    return screenId;
  }

  // starter/lib/ui/flow-target.js
  function findFlowTargetId(startEl, rootEl) {
    if (!startEl || typeof startEl.closest !== "function") return null;
    const el = startEl.closest("[data-flow-to]");
    if (!el) return null;
    if (rootEl && typeof rootEl.contains === "function" && !rootEl.contains(el)) return null;
    const to = el.getAttribute("data-flow-to");
    return to || null;
  }
  function handleDelegatedFlowClick(event, rootEl, navigate) {
    var _a, _b;
    const to = findFlowTargetId(event == null ? void 0 : event.target, rootEl);
    if (!to) return false;
    (_a = event.preventDefault) == null ? void 0 : _a.call(event);
    (_b = event.stopPropagation) == null ? void 0 : _b.call(event);
    navigate(to);
    return true;
  }

  // starter/lib/board/ScreenFrame.jsx
  function ScreenFrame({
    screen,
    viewport,
    mode,
    index = 0,
    focused = false,
    onExport,
    spaceHeld = false,
    scale = 1
  }) {
    const { navigate } = usePrototype();
    const contentRef = React.useRef(null);
    const dragRef = React.useRef(null);
    const [dragScrolling, setDragScrolling] = React.useState(false);
    if (!screen) return null;
    const Component = screen.component;
    const frameClass = [
      "wf-screen-chrome",
      mode === "canvas" && focused ? "is-focused" : "",
      `wf-screen-${mode}`
    ].filter(Boolean).join(" ");
    const onPointerDown = (event) => {
      if (spaceHeld) {
        event.preventDefault();
        return;
      }
      const state = beginContentDragScroll(event, contentRef.current, { spaceHeld, scale });
      if (!state) return;
      dragRef.current = state;
      setDragScrolling(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      const state = dragRef.current;
      if (!state) return;
      moveContentDragScroll(state, event);
    };
    const onPointerEnd = (event) => {
      const state = dragRef.current;
      if (!state || state.pointerId !== event.pointerId) return;
      endContentDragScroll(state, contentRef.current);
      dragRef.current = null;
      setDragScrolling(false);
    };
    const onContentClick = (event) => {
      handleDelegatedFlowClick(event, contentRef.current, navigate);
    };
    return /* @__PURE__ */ React.createElement(
      "section",
      {
        className: frameClass,
        "data-screen-id": screen.id,
        style: { width: viewport.width }
      },
      /* @__PURE__ */ React.createElement("div", { className: "wf-screen-chrome-label" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-title" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-index-num" }, index + 1), /* @__PURE__ */ React.createElement("span", null, screen.title), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-file" }, screen.id, ".jsx")), mode === "canvas" && onExport ? /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-export-one",
          onClick: (event) => {
            event.stopPropagation();
            onExport();
          }
        },
        "\u5BFC\u51FA PNG"
      ) : null),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: contentRef,
          className: `wf-screen-content${dragScrolling ? " is-drag-scrolling" : ""}`,
          style: { width: viewport.width, height: viewport.height },
          onPointerDown,
          onPointerMove,
          onPointerUp: onPointerEnd,
          onPointerCancel: onPointerEnd,
          onClick: onContentClick
        },
        /* @__PURE__ */ React.createElement(
          ErrorBoundary,
          {
            scope: "screen",
            resetKey: screen.id,
            screenId: screen.id,
            source: `src/screens/${screen.id}.jsx`
          },
          /* @__PURE__ */ React.createElement(ScreenIdentityProvider, { screenId: screen.id }, /* @__PURE__ */ React.createElement(Component, null))
        )
      )
    );
  }

  // starter/lib/board/useWheelZoom.js
  function bindWheelZoom(el, getScale, setScale) {
    if (!el) return () => {
    };
    const onWheel = (event) => {
      if (!shouldZoomOnWheel(event)) return;
      event.preventDefault();
      setScale(clampScale(getScale() * (event.deltaY > 0 ? 0.9 : 1.1)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }
  function useWheelZoom(elementRef, scale, setScale) {
    const scaleRef = React.useRef(scale);
    scaleRef.current = scale;
    React.useEffect(
      () => bindWheelZoom(
        elementRef.current,
        () => scaleRef.current,
        setScale
      ),
      [elementRef, setScale]
    );
  }

  // starter/lib/board/validation.js
  function canUseDemo(screens) {
    return Array.isArray(screens) && screens.some((screen) => screen.entry === true);
  }

  // starter/lib/board/CanvasMode.jsx
  async function runExportWithFeedback(task, setError) {
    setError(null);
    try {
      await task();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(`\u5BFC\u51FA\u5931\u8D25\uFF1A${message}`);
    }
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(area);
    }
    return Promise.resolve();
  }
  function CanvasMode({
    project: project2,
    scale,
    setScale,
    spaceHeld,
    selectedIds,
    setSelectedIds,
    onExportIds
  }) {
    const { currentScreenId, navigate, viewport, viewportKey, enterDemo: enterDemoMode } = usePrototype();
    const [view, setView] = React.useState(() => ({ ...resetCanvasViewport(), scale }));
    const [dragging, setDragging] = React.useState(false);
    const [copiedKey, setCopiedKey] = React.useState(null);
    const [copyToast, setCopyToast] = React.useState(null);
    const drag = React.useRef(null);
    const canvasRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const copiedTimer = React.useRef(null);
    const scaleRef = React.useRef(scale);
    const draggingRef = React.useRef(false);
    const demoAvailable = canUseDemo(project2.screens);
    scaleRef.current = scale;
    draggingRef.current = dragging;
    React.useEffect(() => {
      setView((current) => ({ ...resetCanvasViewport(), scale: current.scale }));
    }, [viewportKey]);
    React.useEffect(() => {
      setView((current) => ({ ...current, scale }));
    }, [scale]);
    React.useEffect(() => {
      if (draggingRef.current) return void 0;
      const apply = () => {
        const canvas = canvasRef.current;
        const stage = stageRef.current;
        if (!canvas || !stage) return false;
        const screenEl = stage.querySelector(`[data-canvas-screen-id="${currentScreenId}"]`);
        if (!screenEl) return false;
        const currentScale = scaleRef.current;
        if (currentScale <= 0) return false;
        const stageBox = stage.getBoundingClientRect();
        const screenBox = screenEl.getBoundingClientRect();
        const next = focusCanvasScreen({
          containerWidth: canvas.clientWidth,
          containerHeight: canvas.clientHeight,
          screenLeft: (screenBox.left - stageBox.left) / currentScale,
          screenTop: (screenBox.top - stageBox.top) / currentScale,
          screenWidth: screenBox.width / currentScale,
          screenHeight: screenBox.height / currentScale,
          currentScale
        });
        if (!next) return false;
        setScale(next.scale);
        setView(next);
        return true;
      };
      if (apply()) return void 0;
      const frame = window.requestAnimationFrame(() => {
        apply();
      });
      return () => window.cancelAnimationFrame(frame);
    }, [currentScreenId, viewportKey, setScale]);
    React.useEffect(() => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    }, []);
    useWheelZoom(canvasRef, scale, setScale);
    const startPan = (event) => {
      if (!spaceHeld) return;
      if (event.button != null && event.button !== 0) return;
      drag.current = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const movePan = (event) => {
      const snapshot = drag.current;
      if (!snapshot) return;
      const { clientX, clientY } = event;
      setView((current) => panFromDragSnapshot(current, snapshot, clientX, clientY));
    };
    const endPan = () => {
      drag.current = null;
      setDragging(false);
    };
    const enterDemo = (screenId) => {
      if (!demoAvailable || spaceHeld) return;
      enterDemoMode(screenId);
    };
    const copyMeta = (key, text, event) => {
      event.stopPropagation();
      event.preventDefault();
      copyText(text).then(() => {
        setCopiedKey(key);
        setCopyToast("\u5DF2\u590D\u5236");
        if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
        copiedTimer.current = window.setTimeout(() => {
          setCopiedKey(null);
          setCopyToast(null);
        }, 1200);
      });
    };
    const toggleSelected = (id) => {
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const toggleAll = () => {
      setSelectedIds((current) => {
        if (current.size === project2.screens.length) return /* @__PURE__ */ new Set();
        return new Set(project2.screens.map((screen) => screen.id));
      });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "wf-canvas-shell" }, /* @__PURE__ */ React.createElement("aside", { className: "wf-screen-sidebar" }, /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-header" }, /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: selectedIds.size === project2.screens.length && project2.screens.length > 0,
        onChange: toggleAll
      }
    ), "\u5168\u9009")), /* @__PURE__ */ React.createElement("ul", { className: "wf-screen-list" }, project2.screens.map((screen, index) => /* @__PURE__ */ React.createElement(
      "li",
      {
        className: screen.id === currentScreenId ? "is-active" : "",
        key: screen.id,
        onClick: () => navigate(screen.id),
        onDoubleClick: () => enterDemo(screen.id),
        title: demoAvailable ? "\u53CC\u51FB\u8FDB\u5165\u6F14\u793A" : void 0
      },
      /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "checkbox",
          checked: selectedIds.has(screen.id),
          onChange: (event) => {
            event.stopPropagation();
            toggleSelected(screen.id);
          },
          onClick: (event) => event.stopPropagation(),
          "aria-label": `\u9009\u62E9 ${screen.title}`
        }
      ),
      /* @__PURE__ */ React.createElement("span", { className: "wf-screen-index-num" }, index + 1),
      /* @__PURE__ */ React.createElement("span", { className: "wf-screen-title" }, screen.title)
    ))), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tips", "aria-label": "\u64CD\u4F5C\u63D0\u793A" }, /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("kbd", null, "Ctrl"), /* @__PURE__ */ React.createElement("span", null, "+ \u6EDA\u8F6E\u7F29\u653E")), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("kbd", null, "\u7A7A\u683C"), /* @__PURE__ */ React.createElement("span", null, "+ \u62D6\u62FD\u79FB\u52A8\u753B\u5E03")))), /* @__PURE__ */ React.createElement(
      "main",
      {
        ref: canvasRef,
        className: `wf-canvas${dragging ? " is-dragging" : ""}${spaceHeld ? " is-locked" : ""}`,
        onPointerDown: startPan,
        onPointerMove: movePan,
        onPointerUp: endPan,
        onPointerCancel: endPan
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: stageRef,
          className: "wf-canvas-stage",
          style: { transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})` }
        },
        project2.screens.map((screen, index) => {
          const titleText = `${index + 1}. ${screen.title}`;
          const fileText = `src/screens/${screen.id}.jsx`;
          const titleKey = `${screen.id}:title`;
          const fileKey = `${screen.id}:file`;
          return /* @__PURE__ */ React.createElement(
            "div",
            {
              className: screen.id === currentScreenId ? "wf-canvas-screen is-focused" : "wf-canvas-screen",
              "data-canvas-screen-id": screen.id,
              key: screen.id,
              title: demoAvailable ? "\u53CC\u51FB\u8FDB\u5165\u6F14\u793A" : void 0,
              onClick: (event) => {
                if (event.target.closest(".wf-export-one, .wf-screen-meta-copy")) return;
                navigate(screen.id);
              },
              onDoubleClick: (event) => {
                if (event.target.closest(".wf-export-one, .wf-screen-meta-copy")) return;
                event.preventDefault();
                enterDemo(screen.id);
              }
            },
            /* @__PURE__ */ React.createElement("div", { className: "wf-screen-meta" }, /* @__PURE__ */ React.createElement(
              "div",
              {
                className: `wf-screen-meta-title wf-screen-meta-copy${copiedKey === titleKey ? " is-copied" : ""}`,
                title: copiedKey === titleKey ? "\u5DF2\u590D\u5236" : "\u70B9\u51FB\u590D\u5236",
                onClick: (event) => copyMeta(titleKey, titleText, event)
              },
              titleText
            ), screen.description ? /* @__PURE__ */ React.createElement("div", null, screen.description) : null, /* @__PURE__ */ React.createElement(
              "div",
              {
                className: `wf-meta-line wf-screen-meta-copy${copiedKey === fileKey ? " is-copied" : ""}`,
                title: copiedKey === fileKey ? "\u5DF2\u590D\u5236" : "\u70B9\u51FB\u590D\u5236",
                onClick: (event) => copyMeta(fileKey, fileText, event)
              },
              /* @__PURE__ */ React.createElement("strong", null, "\u6587\u4EF6\uFF1A"),
              fileText
            )),
            /* @__PURE__ */ React.createElement(
              ScreenFrame,
              {
                screen,
                viewport,
                mode: "canvas",
                index,
                focused: screen.id === currentScreenId,
                onExport: () => onExportIds([screen.id]),
                spaceHeld,
                scale: view.scale
              }
            )
          );
        })
      ),
      /* @__PURE__ */ React.createElement("div", { className: "wf-canvas-index" }, /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-label" }, "\u7D22\u5F15"), /* @__PURE__ */ React.createElement("div", { className: "wf-canvas-index-list" }, project2.screens.map((screen, index) => /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          key: screen.id,
          className: screen.id === currentScreenId ? "wf-canvas-index-dot is-active" : "wf-canvas-index-dot",
          onClick: () => navigate(screen.id),
          onDoubleClick: () => enterDemo(screen.id),
          "aria-label": `${index + 1}. ${screen.title}`,
          title: demoAvailable ? "\u53CC\u51FB\u8FDB\u5165\u6F14\u793A" : void 0
        },
        /* @__PURE__ */ React.createElement("span", null, index + 1),
        /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip-title" }, screen.title), /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip-file" }, "src/screens/", screen.id, ".jsx"))
      ))))
    ), copyToast ? /* @__PURE__ */ React.createElement("div", { className: "wf-board-toast", role: "status" }, copyToast) : null);
  }

  // starter/lib/board/DemoMode.jsx
  function readContentBox(el) {
    const style = window.getComputedStyle(el);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    return {
      width: Math.max(0, el.clientWidth - padX),
      height: Math.max(0, el.clientHeight - padY)
    };
  }
  function DemoMode({
    project: project2,
    hotspotsVisible,
    spaceHeld,
    scale,
    setScale,
    viewResetKey
  }) {
    const { currentScreenId, viewport, viewportKey } = usePrototype();
    const screenIndex = project2.screens.findIndex((item) => item.id === currentScreenId);
    const screen = screenIndex >= 0 ? project2.screens[screenIndex] : null;
    const [view, setView] = React.useState(() => ({ ...resetCanvasViewport(), scale }));
    const [dragging, setDragging] = React.useState(false);
    const drag = React.useRef(null);
    const viewportRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const applyFit = React.useCallback(() => {
      const container = viewportRef.current;
      const stage = stageRef.current;
      if (!container || !stage) return;
      const box = readContentBox(container);
      const next = fitDemoScale(box.width, box.height, stage.offsetWidth, stage.offsetHeight);
      setScale(next);
      setView({ ...resetCanvasViewport(), scale: next });
    }, [setScale]);
    React.useEffect(() => {
      setView((current) => ({ ...current, scale }));
    }, [scale]);
    React.useEffect(() => {
      const container = viewportRef.current;
      if (!container || typeof ResizeObserver !== "function") {
        applyFit();
        return void 0;
      }
      const observer = new ResizeObserver(() => applyFit());
      observer.observe(container);
      applyFit();
      return () => observer.disconnect();
    }, [applyFit, viewport, viewportKey, currentScreenId, viewResetKey]);
    useWheelZoom(viewportRef, scale, setScale);
    const startPan = (event) => {
      if (!spaceHeld) return;
      if (event.button != null && event.button !== 0) return;
      drag.current = { x: event.clientX, y: event.clientY, panX: view.panX, panY: view.panY };
      setDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const movePan = (event) => {
      const snapshot = drag.current;
      if (!snapshot) return;
      const { clientX, clientY } = event;
      setView((current) => panFromDragSnapshot(current, snapshot, clientX, clientY));
    };
    const endPan = () => {
      drag.current = null;
      setDragging(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: hotspotsVisible ? "wf-demo is-showing-hotspots" : "wf-demo" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: viewportRef,
        className: `wf-demo-viewport${dragging ? " is-dragging" : ""}${spaceHeld ? " is-locked" : ""}`,
        onPointerDown: startPan,
        onPointerMove: movePan,
        onPointerUp: endPan,
        onPointerCancel: endPan
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: stageRef,
          className: "wf-demo-stage",
          style: { transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.scale})` }
        },
        /* @__PURE__ */ React.createElement(
          ScreenFrame,
          {
            screen,
            viewport,
            mode: "demo",
            index: screenIndex,
            spaceHeld,
            scale: view.scale
          }
        )
      )
    ), /* @__PURE__ */ React.createElement("p", { className: "wf-demo-hint" }, "\u70B9\u51FB\u9875\u9762\u5185\u6309\u94AE / \u94FE\u63A5\u8DF3\u8F6C\uFF1B\u53EF\u5728\u5DE5\u5177\u680F\u5F00\u5173\u70ED\u533A\u9AD8\u4EAE"));
  }

  // starter/lib/board/export.js
  var exportLibrariesPromise;
  var libraries = [
    { file: "html2canvas.min.js", ready: () => typeof window.html2canvas === "function" },
    { file: "jszip.min.js", ready: () => typeof window.JSZip === "function" },
    { file: "FileSaver.min.js", ready: () => typeof window.saveAs === "function" }
  ];
  function loadScript(file) {
    return new Promise((resolve, reject) => {
      let existing = document.querySelector(`script[data-wireframe-export="${file}"]`);
      if (existing) {
        if (existing.dataset.wireframeExportState === "loaded") {
          existing.remove();
          existing = null;
        }
      }
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const vendorBase = window.WIREFRAME_VENDOR_BASE;
      if (!vendorBase) {
        reject(new Error("\u672A\u914D\u7F6E\u672C\u5730\u5BFC\u51FA\u5E93\u8DEF\u5F84 WIREFRAME_VENDOR_BASE"));
        return;
      }
      const script = document.createElement("script");
      script.src = new URL(file, vendorBase).href;
      script.dataset.wireframeExport = file;
      script.dataset.wireframeExportState = "loading";
      script.onload = () => {
        script.dataset.wireframeExportState = "loaded";
        resolve();
      };
      script.onerror = () => {
        script.remove();
        reject(new Error(`\u65E0\u6CD5\u52A0\u8F7D\u672C\u5730\u5BFC\u51FA\u5E93 ${file}`));
      };
      document.head.appendChild(script);
    });
  }
  function loadExportLibraries() {
    if (!exportLibrariesPromise) {
      exportLibrariesPromise = libraries.reduce(
        (chain, library) => chain.then(async () => {
          if (!library.ready()) await loadScript(library.file);
          if (!library.ready()) throw new Error(`\u5BFC\u51FA\u5E93\u521D\u59CB\u5316\u5931\u8D25: ${library.file}`);
        }),
        Promise.resolve()
      ).catch((error) => {
        exportLibrariesPromise = void 0;
        throw error;
      });
    }
    return exportLibrariesPromise;
  }
  async function captureScreen(screenElement, viewport) {
    if (!screenElement) throw new Error("\u627E\u4E0D\u5230\u8981\u5BFC\u51FA\u7684 screen \u5143\u7D20");
    await loadExportLibraries();
    const sandbox = document.createElement("div");
    sandbox.className = "wf-export-sandbox";
    sandbox.style.width = `${viewport.width}px`;
    sandbox.style.height = `${viewport.height}px`;
    const clone = screenElement.cloneNode(true);
    clone.style.width = `${viewport.width}px`;
    clone.style.height = `${viewport.height}px`;
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);
    try {
      const canvas = await window.html2canvas(clone, {
        backgroundColor: "#ffffff",
        width: viewport.width,
        height: viewport.height,
        scale: 2,
        useCORS: false,
        logging: false
      });
      return await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error("PNG \u7F16\u7801\u5931\u8D25")),
          "image/png"
        );
      });
    } finally {
      sandbox.remove();
    }
  }
  function slug(value) {
    return String(value || "wireframe").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "wireframe";
  }
  async function exportSelected(screens) {
    if (!Array.isArray(screens) || screens.length === 0) {
      throw new Error("\u81F3\u5C11\u9009\u62E9\u4E00\u4E2A screen");
    }
    await loadExportLibraries();
    const captured = [];
    for (const screen of screens) {
      captured.push({
        name: `${slug(screen.id)}.png`,
        blob: await captureScreen(screen.element, screen.viewport)
      });
    }
    if (captured.length === 1) {
      window.saveAs(captured[0].blob, captured[0].name);
      return;
    }
    const zip = new window.JSZip();
    captured.forEach((item) => zip.file(item.name, item.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    window.saveAs(blob, `${slug(screens[0].projectName)}.zip`);
  }

  // starter/lib/board/Board.jsx
  var VIEWPORT_LABELS = {
    mobile: "\u624B\u673A",
    desktop: "\u684C\u9762"
  };
  function ZoomControls({ scale, setScale, onReset }) {
    return /* @__PURE__ */ React.createElement("div", { className: "wf-zoom-controls" }, /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u7F29\u5C0F", onClick: () => setScale((value) => clampScale(value - 0.1)) }, "-"), /* @__PURE__ */ React.createElement("span", { className: "wf-zoom-value" }, Math.round(scale * 100), "%"), /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u653E\u5927", onClick: () => setScale((value) => clampScale(value + 0.1)) }, "+"), /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u91CD\u7F6E\u7F29\u653E", onClick: onReset }, "\u590D\u4F4D"));
  }
  function PanHint({ spaceHeld }) {
    return /* @__PURE__ */ React.createElement("span", { className: spaceHeld ? "wf-pan-hint is-active" : "wf-pan-hint", title: "\u6309\u4F4F\u7A7A\u683C\u952E\u540E\u62D6\u62FD\uFF0C\u53EF\u5728\u4EFB\u610F\u4F4D\u7F6E\u79FB\u52A8\u753B\u5E03" }, /* @__PURE__ */ React.createElement("kbd", null, "\u7A7A\u683C"), " + \u62D6\u62FD\u79FB\u52A8\u753B\u5E03");
  }
  function Board({ project: project2 }) {
    const {
      mode,
      setMode,
      setViewportKey,
      viewportKey,
      viewport,
      entryId,
      selectEntry,
      currentScreenId,
      canGoBack,
      goBack,
      reset
    } = usePrototype();
    const demoAvailable = canUseDemo(project2.screens);
    const viewportOptions = Object.keys(project2.viewports);
    const currentScreen = project2.screens.find((screen) => screen.id === currentScreenId);
    const [selectedIds, setSelectedIds] = React.useState(
      () => new Set(project2.screens.map((screen) => screen.id))
    );
    const [canvasScale, setCanvasScale] = React.useState(1);
    const [demoScale, setDemoScale] = React.useState(1);
    const [demoViewResetKey, setDemoViewResetKey] = React.useState(0);
    const [spaceHeld, setSpaceHeld] = React.useState(false);
    const [hotspotsVisible, setHotspotsVisible] = React.useState(false);
    const [exportError, setExportError] = React.useState(null);
    const [exporting, setExporting] = React.useState(false);
    React.useEffect(() => {
      const down = (event) => {
        if (event.code === "Space" && !event.repeat) setSpaceHeld(true);
      };
      const up = (event) => {
        if (event.code === "Space") setSpaceHeld(false);
      };
      window.addEventListener("keydown", down);
      window.addEventListener("keyup", up);
      return () => {
        window.removeEventListener("keydown", down);
        window.removeEventListener("keyup", up);
      };
    }, []);
    React.useEffect(() => {
      if (mode !== "demo") setHotspotsVisible(false);
    }, [mode]);
    const exportIds = (ids) => runExportWithFeedback(async () => {
      setExporting(true);
      try {
        const screens = ids.map((id) => {
          const screen = project2.screens.find((item) => item.id === id);
          return {
            id,
            title: screen.title,
            element: document.querySelector(`[data-screen-id="${id}"] .wf-screen-content`),
            viewport,
            projectName: project2.name
          };
        });
        await exportSelected(screens);
      } finally {
        setExporting(false);
      }
    }, setExportError);
    const resetDemo = () => {
      reset();
      setHotspotsVisible(false);
    };
    const resetDemoView = () => {
      setDemoViewResetKey((value) => value + 1);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "wf-board" }, /* @__PURE__ */ React.createElement("header", { className: "wf-board-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-left" }, /* @__PURE__ */ React.createElement("h1", { className: "wf-project-name" }, project2.name), /* @__PURE__ */ React.createElement("span", { className: "wf-project-meta" }, project2.screens.length, " \u9875")), /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-center" }, demoAvailable ? /* @__PURE__ */ React.createElement("div", { className: "wf-mode-switcher", role: "group", "aria-label": "\u6A21\u5F0F" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: mode === "canvas" ? "is-active" : "",
        onClick: () => setMode("canvas")
      },
      "\u753B\u677F"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: mode === "demo" ? "is-active" : "",
        onClick: () => setMode("demo")
      },
      "\u6F14\u793A"
    )) : null, viewportOptions.length > 1 ? /* @__PURE__ */ React.createElement("div", { className: "wf-viewport-switcher", role: "group", "aria-label": "\u89C6\u53E3" }, viewportOptions.map((key) => /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        key,
        className: viewportKey === key ? "is-active" : "",
        onClick: () => setViewportKey(key)
      },
      VIEWPORT_LABELS[key] || key
    ))) : null, mode === "canvas" || !demoAvailable ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      ZoomControls,
      {
        scale: canvasScale,
        setScale: setCanvasScale,
        onReset: () => setCanvasScale(1)
      }
    ), /* @__PURE__ */ React.createElement(PanHint, { spaceHeld })) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      ZoomControls,
      {
        scale: demoScale,
        setScale: setDemoScale,
        onReset: resetDemoView
      }
    ), /* @__PURE__ */ React.createElement(PanHint, { spaceHeld }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: hotspotsVisible ? "wf-board-button is-active" : "wf-board-button",
        onClick: () => setHotspotsVisible((value) => !value)
      },
      hotspotsVisible ? "\u70ED\u533A ON" : "\u70ED\u533A OFF"
    ), /* @__PURE__ */ React.createElement("div", { className: "wf-demo-entry" }, /* @__PURE__ */ React.createElement("label", { htmlFor: "wf-demo-entry" }, "\u5165\u53E3"), /* @__PURE__ */ React.createElement(
      "select",
      {
        id: "wf-demo-entry",
        value: entryId,
        onChange: (event) => selectEntry(event.target.value),
        title: "\u9009\u62E9\u6F14\u793A\u5165\u53E3\u9875"
      },
      project2.screens.map((screen, index) => /* @__PURE__ */ React.createElement("option", { key: screen.id, value: screen.id }, index + 1, ". ", screen.title))
    )), canGoBack ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-board-button", onClick: goBack }, "\u8FD4\u56DE") : null, /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-board-button", onClick: resetDemo }, "\u91CD\u7F6E"), /* @__PURE__ */ React.createElement("span", { className: "wf-demo-page-label" }, "\u5F53\u524D\uFF1A", currentScreen ? `${project2.screens.findIndex((screen) => screen.id === currentScreen.id) + 1}. ${currentScreen.title} \xB7 ${currentScreen.id}.jsx` : currentScreenId))), /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-right" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "wf-board-primary",
        disabled: exporting || selectedIds.size === 0 || mode === "demo",
        onClick: () => exportIds([...selectedIds])
      },
      exporting ? "\u5BFC\u51FA\u4E2D\u2026" : `\u6253\u5305\u4E0B\u8F7D (${selectedIds.size})`
    ))), exportError ? /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-error", role: "alert" }, exportError) : null, mode === "canvas" ? /* @__PURE__ */ React.createElement(
      CanvasMode,
      {
        project: project2,
        scale: canvasScale,
        setScale: setCanvasScale,
        spaceHeld,
        selectedIds,
        setSelectedIds,
        onExportIds: exportIds
      }
    ) : /* @__PURE__ */ React.createElement(
      DemoMode,
      {
        project: project2,
        hotspotsVisible,
        spaceHeld,
        scale: demoScale,
        setScale: setDemoScale,
        viewResetKey: demoViewResetKey
      }
    ));
  }

  // starter/lib/core/validateProject.js
  function fail(path, message) {
    throw new Error(`${path} ${message}`);
  }
  function validateProject(project2) {
    if (!project2 || typeof project2 !== "object") fail("project", "must be an object");
    if (!project2.viewports || typeof project2.viewports !== "object") {
      fail("project.viewports", "must be an object");
    }
    const viewportEntries = Object.entries(project2.viewports);
    if (viewportEntries.length === 0) fail("project.viewports", "must contain at least one viewport");
    for (const [key, viewport] of viewportEntries) {
      if (!viewport || typeof viewport !== "object") fail(`project.viewports.${key}`, "must be an object");
      for (const dimension of ["width", "height"]) {
        if (!Number.isFinite(viewport[dimension]) || viewport[dimension] <= 0) {
          fail(`project.viewports.${key}.${dimension}`, "must be a positive number");
        }
      }
    }
    if (!Object.hasOwn(project2.viewports, project2.defaultViewport)) {
      fail("project.defaultViewport", `references missing viewport "${project2.defaultViewport}"`);
    }
    if (!Array.isArray(project2.screens) || project2.screens.length === 0) {
      fail("project.screens", "must contain at least one screen");
    }
    const ids = /* @__PURE__ */ new Set();
    project2.screens.forEach((screen, index) => {
      const path = `project.screens[${index}]`;
      if (!screen || typeof screen !== "object") fail(path, "must be an object");
      if (typeof screen.id !== "string" || !/^[a-z0-9-]+$/.test(screen.id)) {
        fail(`${path}.id`, "must match /^[a-z0-9-]+$/");
      }
      if (ids.has(screen.id)) fail(`${path}.id`, `is duplicate "${screen.id}"`);
      ids.add(screen.id);
      if (typeof screen.component !== "function") fail(`${path}.component`, "must be a function");
      if (!Array.isArray(screen.links)) {
        fail(`${path}.links`, "must be an array");
      }
    });
    project2.screens.forEach((screen, screenIndex) => {
      screen.links.forEach((target, linkIndex) => {
        if (!ids.has(target)) {
          fail(
            `project.screens[${screenIndex}].links[${linkIndex}]`,
            `references missing screen "${target}"`
          );
        }
      });
    });
  }

  // starter/lib/ui/flow.js
  function createFlowProps(to, onClick, navigate) {
    return {
      "data-flow-to": to || void 0,
      onClick: (event) => {
        var _a;
        if (to) (_a = event.stopPropagation) == null ? void 0 : _a.call(event);
        if (onClick) onClick(event);
        if (!event.defaultPrevented && to) navigate(to);
      }
    };
  }
  function useFlowTarget(to, onClick) {
    const { navigate } = usePrototype();
    return createFlowProps(to, onClick, navigate);
  }

  // starter/lib/ui/layout.jsx
  function joinClass(base, extra) {
    return extra ? `${base} ${extra}` : base;
  }
  function resolveColumns(columns2, viewportKey) {
    const value = columns2 && typeof columns2 === "object" && !Array.isArray(columns2) ? columns2[viewportKey] : columns2;
    if (Number.isInteger(value) && value > 0) return `repeat(${value}, minmax(0, 1fr))`;
    if (typeof value === "string" && value.trim()) return value;
    throw new Error("Grid columns must resolve to a positive integer or non-empty CSS string");
  }
  function useLayoutFlow(to, onClick, rest) {
    const flow = useFlowTarget(to, onClick);
    return {
      classNameSuffix: to ? " wf-interactive" : "",
      role: to ? "link" : rest.role,
      tabIndex: to && rest.tabIndex === void 0 ? 0 : rest.tabIndex,
      flow
    };
  }
  function Column({
    className,
    style,
    children,
    gap = 0,
    alignItems = "stretch",
    justifyContent = "flex-start",
    to,
    onClick,
    ...rest
  }) {
    const { classNameSuffix, role, tabIndex, flow } = useLayoutFlow(to, onClick, rest);
    const mergedStyle = {
      display: "flex",
      flexDirection: "column",
      gap,
      alignItems,
      justifyContent,
      ...style
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: joinClass(`wf-column${classNameSuffix}`, className),
        role,
        tabIndex,
        style: mergedStyle,
        ...rest,
        ...flow
      },
      children
    );
  }
  function Grid({ className, style, children, columns: columns2 = 1, gap = 0, to, onClick, ...rest }) {
    const { viewportKey } = usePrototype();
    const { classNameSuffix, role, tabIndex, flow } = useLayoutFlow(to, onClick, rest);
    const mergedStyle = {
      display: "grid",
      gridTemplateColumns: resolveColumns(columns2, viewportKey),
      gap,
      ...style
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: joinClass(`wf-grid${classNameSuffix}`, className),
        role,
        tabIndex,
        style: mergedStyle,
        ...rest,
        ...flow
      },
      children
    );
  }

  // starter/lib/ui/content.jsx
  function Heading({ level = 2, className = "", children, ...rest }) {
    const tag = `h${Math.min(6, Math.max(1, level))}`;
    return React.createElement(tag, { className: `wf-heading ${className}`.trim(), ...rest }, children);
  }
  function Text({ as = "p", className = "", children, ...rest }) {
    return React.createElement(as, { className: `wf-text ${className}`.trim(), ...rest }, children);
  }
  function Card({ to, onClick, className = "", children, ...rest }) {
    const flow = useFlowTarget(to, onClick);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `wf-card ${to ? "wf-interactive" : ""} ${className}`.trim(),
        role: to ? "link" : rest.role,
        tabIndex: to && rest.tabIndex === void 0 ? 0 : rest.tabIndex,
        ...rest,
        ...flow
      },
      children
    );
  }
  function Badge({ className = "", children, ...rest }) {
    return /* @__PURE__ */ React.createElement("span", { className: `wf-badge ${className}`.trim(), ...rest }, children);
  }

  // starter/lib/ui/forms.jsx
  function Button({ to, onClick, variant = "default", className = "", children, ...rest }) {
    const flow = useFlowTarget(to, onClick);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `wf-button wf-button-${variant} ${className}`.trim(),
        ...rest,
        ...flow
      },
      children
    );
  }
  function TextInput({ className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("input", { className: `wf-input ${className}`.trim(), type: "text", ...rest });
  }
  function TextArea({ className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("textarea", { className: `wf-input wf-textarea ${className}`.trim(), ...rest });
  }
  function Select({ className = "", children, ...rest }) {
    return /* @__PURE__ */ React.createElement("select", { className: `wf-input wf-select ${className}`.trim(), ...rest }, children);
  }
  function FormField({ label, htmlFor, hint, error, className = "", children, ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-form-field ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("label", { htmlFor }, label), children, hint && !error ? /* @__PURE__ */ React.createElement("span", { className: "wf-field-hint" }, hint) : null, error ? /* @__PURE__ */ React.createElement("span", { className: "wf-field-error", role: "alert" }, error) : null);
  }

  // starter/lib/ui/navigation.jsx
  function PageHeader({ title, subtitle, actions, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("header", { className: `wf-page-header ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, title), subtitle ? /* @__PURE__ */ React.createElement("p", null, subtitle) : null), actions ? /* @__PURE__ */ React.createElement("div", { className: "wf-page-actions" }, actions) : null);
  }
  function NavigationList({ as, items, activeId, className, ...rest }) {
    const { navigate } = usePrototype();
    return React.createElement(
      as,
      { className, ...rest },
      items.map((item) => /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          key: item.to,
          className: item.to === activeId ? "wf-nav-item is-active" : "wf-nav-item",
          ...createFlowProps(item.to, item.onClick, navigate)
        },
        /* @__PURE__ */ React.createElement("span", { className: "wf-nav-mark", "aria-hidden": "true" }),
        /* @__PURE__ */ React.createElement("span", null, item.label)
      ))
    );
  }
  function SideNav({ items = [], activeId, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement(
      NavigationList,
      {
        as: "nav",
        items,
        activeId,
        className: `wf-side-nav ${className}`.trim(),
        ...rest
      }
    );
  }

  // starter/lib/ui/data.jsx
  function DataTable({ columns: columns2 = [], rows: rows2 = [], getRowKey, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-table-wrap ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("table", { className: "wf-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, columns2.map((column) => /* @__PURE__ */ React.createElement("th", { key: column.key }, column.label)))), /* @__PURE__ */ React.createElement("tbody", null, rows2.map((row, index) => /* @__PURE__ */ React.createElement("tr", { key: getRowKey ? getRowKey(row) : row.id || index }, columns2.map((column) => /* @__PURE__ */ React.createElement("td", { key: column.key }, column.render ? column.render(row[column.key], row) : row[column.key])))))));
  }

  // starter/lib/ui/feedback.jsx
  function ScreenPortal({ children }) {
    const anchor = React.useRef(null);
    const [host, setHost] = React.useState(null);
    React.useLayoutEffect(() => {
      var _a;
      setHost(((_a = anchor.current) == null ? void 0 : _a.closest(".wf-screen-content")) || null);
    }, []);
    if (!host) return /* @__PURE__ */ React.createElement("span", { ref: anchor, className: "wf-overlay-anchor", "aria-hidden": "true" });
    return ReactDOM.createPortal(children, host);
  }
  function Modal({ open, title, children, actions, onClose, className = "", ...rest }) {
    if (!open) return null;
    return /* @__PURE__ */ React.createElement(ScreenPortal, null, /* @__PURE__ */ React.createElement("div", { className: `wf-overlay wf-modal-overlay ${className}`.trim(), role: "presentation", ...rest }, /* @__PURE__ */ React.createElement("section", { className: "wf-modal", role: "dialog", "aria-modal": "true", "aria-label": title }, /* @__PURE__ */ React.createElement("header", null, /* @__PURE__ */ React.createElement("strong", null, title), onClose ? /* @__PURE__ */ React.createElement(Button, { onClick: onClose }, "\u5173\u95ED") : null), /* @__PURE__ */ React.createElement("div", { className: "wf-modal-body" }, children), actions ? /* @__PURE__ */ React.createElement("footer", null, actions) : null)));
  }
  function ConfirmDialog({
    open,
    title = "\u786E\u8BA4\u64CD\u4F5C",
    message,
    confirmLabel = "\u786E\u8BA4",
    cancelLabel = "\u53D6\u6D88",
    onConfirm,
    onCancel
  }) {
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open,
        title,
        onClose: onCancel,
        actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: onCancel }, cancelLabel), /* @__PURE__ */ React.createElement(Button, { variant: "primary", onClick: onConfirm }, confirmLabel))
      },
      /* @__PURE__ */ React.createElement("p", null, message)
    );
  }

  // demo/order-admin/src/screens/login.jsx
  function LoginScreen() {
    return /* @__PURE__ */ React.createElement("div", { className: "order-login" }, /* @__PURE__ */ React.createElement(Card, { className: "order-login-card" }, /* @__PURE__ */ React.createElement(Column, { gap: 16 }, /* @__PURE__ */ React.createElement(Heading, { level: 1 }, "\u8BA2\u5355\u7BA1\u7406\u540E\u53F0"), /* @__PURE__ */ React.createElement(Text, null, "\u4F7F\u7528\u6F14\u793A\u8D26\u53F7\u8FDB\u5165\u7CFB\u7EDF\u3002"), /* @__PURE__ */ React.createElement(FormField, { label: "\u8D26\u53F7", htmlFor: "account" }, /* @__PURE__ */ React.createElement(TextInput, { id: "account", placeholder: "\u8BF7\u8F93\u5165\u8D26\u53F7" })), /* @__PURE__ */ React.createElement(FormField, { label: "\u5BC6\u7801", htmlFor: "password" }, /* @__PURE__ */ React.createElement(TextInput, { id: "password", type: "password", placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801" })), /* @__PURE__ */ React.createElement(Button, { variant: "primary", to: "order-list" }, "\u767B\u5F55"))));
  }

  // demo/order-admin/src/layouts/AdminLayout.jsx
  function AdminLayout({ children }) {
    const screenId = useScreenId();
    return /* @__PURE__ */ React.createElement("div", { className: "order-shell" }, /* @__PURE__ */ React.createElement("aside", null, /* @__PURE__ */ React.createElement("strong", null, "\u8BA2\u5355\u7BA1\u7406"), /* @__PURE__ */ React.createElement(
      SideNav,
      {
        activeId: screenId,
        items: [{ label: "\u8BA2\u5355\u5217\u8868", to: "order-list" }]
      }
    )), /* @__PURE__ */ React.createElement(Column, { gap: 16, className: "order-main" }, children));
  }

  // demo/order-admin/src/screens/order-cancel.jsx
  function OrderCancelScreen() {
    const [open, setOpen] = React.useState(false);
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(PageHeader, { title: "\u53D6\u6D88\u8BA2\u5355", subtitle: "\u8BA2\u5355 SO-1001" }), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Column, { gap: 16 }, /* @__PURE__ */ React.createElement(FormField, { label: "\u53D6\u6D88\u539F\u56E0", htmlFor: "reason" }, /* @__PURE__ */ React.createElement(Select, { id: "reason", defaultValue: "customer" }, /* @__PURE__ */ React.createElement("option", { value: "customer" }, "\u5BA2\u6237\u7533\u8BF7"), /* @__PURE__ */ React.createElement("option", { value: "inventory" }, "\u5E93\u5B58\u4E0D\u8DB3"))), /* @__PURE__ */ React.createElement(FormField, { label: "\u5907\u6CE8", htmlFor: "note" }, /* @__PURE__ */ React.createElement(TextArea, { id: "note", placeholder: "\u586B\u5199\u8865\u5145\u8BF4\u660E" })), /* @__PURE__ */ React.createElement(Button, { variant: "primary", onClick: () => setOpen(true) }, "\u63D0\u4EA4\u53D6\u6D88"))), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        open,
        title: "\u786E\u8BA4\u53D6\u6D88\u8BA2\u5355",
        message: "\u6B64\u64CD\u4F5C\u5C06\u66F4\u65B0\u8BA2\u5355\u72B6\u6001\u3002",
        onCancel: () => setOpen(false),
        onConfirm: () => setOpen(false)
      }
    ));
  }

  // demo/order-admin/src/screens/order-detail.jsx
  function OrderDetailScreen() {
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        title: "\u8BA2\u5355 SO-1001",
        subtitle: "\u521B\u5EFA\u4E8E 2026-08-04",
        actions: /* @__PURE__ */ React.createElement(Button, { to: "order-cancel" }, "\u53D6\u6D88\u8BA2\u5355")
      }
    ), /* @__PURE__ */ React.createElement(Grid, { columns: 2, gap: 16 }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Column, { gap: 8 }, /* @__PURE__ */ React.createElement("strong", null, "\u5BA2\u6237\u4FE1\u606F"), /* @__PURE__ */ React.createElement(Text, null, "\u793A\u4F8B\u5BA2\u6237\u7532"), /* @__PURE__ */ React.createElement(Text, null, "\u4F01\u4E1A\u5BA2\u6237"))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Column, { gap: 8 }, /* @__PURE__ */ React.createElement("strong", null, "\u8BA2\u5355\u91D1\u989D"), /* @__PURE__ */ React.createElement(Text, null, "1,280.00"), /* @__PURE__ */ React.createElement(Text, null, "\u5F85\u652F\u4ED8")))));
  }

  // demo/order-admin/src/screens/order-list.jsx
  var rows = [
    { id: "SO-1001", customer: "\u793A\u4F8B\u5BA2\u6237\u7532", amount: "1,280.00", status: "\u5F85\u5904\u7406" },
    { id: "SO-1002", customer: "\u793A\u4F8B\u5BA2\u6237\u4E59", amount: "860.00", status: "\u5904\u7406\u4E2D" },
    { id: "SO-1003", customer: "\u793A\u4F8B\u5BA2\u6237\u4E19", amount: "2,400.00", status: "\u5DF2\u5B8C\u6210" }
  ];
  var columns = [
    { key: "id", label: "\u8BA2\u5355\u53F7" },
    { key: "customer", label: "\u5BA2\u6237" },
    { key: "amount", label: "\u91D1\u989D" },
    { key: "status", label: "\u72B6\u6001", render: (value) => /* @__PURE__ */ React.createElement(Badge, null, value) }
  ];
  function OrderListScreen() {
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(PageHeader, { title: "\u8BA2\u5355\u5217\u8868", subtitle: "\u5171 3 \u6761\u6F14\u793A\u6570\u636E" }), /* @__PURE__ */ React.createElement(Card, { to: "order-detail" }, /* @__PURE__ */ React.createElement(Heading, { level: 3 }, "\u5F85\u5904\u7406\u8BA2\u5355"), /* @__PURE__ */ React.createElement(Text, null, "\u6253\u5F00 SO-1001 \u8BE6\u60C5")), /* @__PURE__ */ React.createElement(DataTable, { columns, rows }));
  }

  // demo/order-admin/src/project.js
  var project = {
    name: "\u8BA2\u5355\u7BA1\u7406\u540E\u53F0",
    viewports: {
      desktop: { width: 1280, height: 800 }
    },
    defaultViewport: "desktop",
    screens: [
      {
        id: "login",
        title: "\u767B\u5F55",
        component: LoginScreen,
        entry: true,
        links: ["order-list"],
        edgeCases: []
      },
      {
        id: "order-list",
        title: "\u8BA2\u5355\u5217\u8868",
        component: OrderListScreen,
        links: ["order-list", "order-detail"],
        edgeCases: []
      },
      {
        id: "order-detail",
        title: "\u8BA2\u5355\u8BE6\u60C5",
        component: OrderDetailScreen,
        links: ["order-list", "order-cancel"],
        edgeCases: []
      },
      {
        id: "order-cancel",
        title: "\u53D6\u6D88\u8BA2\u5355",
        component: OrderCancelScreen,
        links: ["order-list"],
        edgeCases: []
      }
    ]
  };

  // demo/order-admin/src/app.jsx
  validateProject(project);
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(ErrorBoundary, { scope: "board" }, /* @__PURE__ */ React.createElement(PrototypeProvider, { project }, /* @__PURE__ */ React.createElement(Board, { project })))
  );
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9saWIvY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2xpYi9ib2FyZC9uYXZpZ2F0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvY29yZS9TY3JlZW5JZGVudGl0eS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvZmxvdy10YXJnZXQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvYm9hcmQvU2NyZWVuRnJhbWUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL2JvYXJkL3VzZVdoZWVsWm9vbS5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL2JvYXJkL0RlbW9Nb2RlLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2xpYi9ib2FyZC9leHBvcnQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvYm9hcmQvQm9hcmQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL2NvcmUvdmFsaWRhdGVQcm9qZWN0LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvbGF5b3V0LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2xpYi91aS9jb250ZW50LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvbmF2aWdhdGlvbi5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvZGF0YS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvbGF5b3V0cy9BZG1pbkxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvb3JkZXItY2FuY2VsLmpzeCIsICIuLi9zcmMvc2NyZWVucy9vcmRlci1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL29yZGVyLWxpc3QuanN4IiwgIi4uL3NyYy9wcm9qZWN0LmpzIiwgIi4uL3NyYy9hcHAuanN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBQcm90b3R5cGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdCkge1xuICByZXR1cm4gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgcHJvamVjdC5zY3JlZW5zWzBdLmlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcm90b3R5cGVQcm92aWRlcih7IHByb2plY3QsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgaW5pdGlhbFNjcmVlbklkID0gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIG1vZGU6ICdjYW52YXMnLFxuICAgIHZpZXdwb3J0S2V5OiBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCxcbiAgICBlbnRyeUlkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgaGlzdG9yeTogW10sXG4gIH0pXG5cbiAgY29uc3QgbmF2aWdhdGUgPSBSZWFjdC51c2VDYWxsYmFjaygoaWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtpZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZClcbiAgICAgICAgaWYgKCFzY3JlZW4ubGlua3MuaW5jbHVkZXMoaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke2N1cnJlbnQuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHtpZH1cImApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogaWQsXG4gICAgICAgIGhpc3Rvcnk6XG4gICAgICAgICAgY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkXG4gICAgICAgICAgICA/IFsuLi5jdXJyZW50Lmhpc3RvcnksIGN1cnJlbnQuY3VycmVudFNjcmVlbklkXVxuICAgICAgICAgICAgOiBjdXJyZW50Lmhpc3RvcnksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNlbGVjdEVudHJ5ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVudHJ5SWQpID0+IHtcbiAgICBjb25zdCBlbnRyeSA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBlbnRyeUlkLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBnb0JhY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50Lmhpc3RvcnlbY3VycmVudC5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgICAgICBoaXN0b3J5OiBjdXJyZW50Lmhpc3Rvcnkuc2xpY2UoMCwgLTEpLFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHJlc2V0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5lbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtpbml0aWFsU2NyZWVuSWRdKVxuXG4gIGNvbnN0IHNldE1vZGUgPSBSZWFjdC51c2VDYWxsYmFjaygobW9kZSkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnY2FudmFzJyAmJiBtb2RlICE9PSAnZGVtbycpIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtb2RlIFwiJHttb2RlfVwiYClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtdKVxuXG4gIC8qKiBcdTc1M0JcdTY3N0ZcdTUzQ0NcdTUxRkJcdTY3RDBcdTk4NzVcdUZGMUFcdThGREJcdTUxNjVcdTZGMTRcdTc5M0FcdTVFNzZcdTg0M0RcdTU3MjhcdThCRTVcdTk4NzUgKi9cbiAgY29uc3QgZW50ZXJEZW1vID0gUmVhY3QudXNlQ2FsbGJhY2soKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHNjcmVlbklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7c2NyZWVuSWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlOiAnZGVtbycsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IHNjcmVlbklkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZXRWaWV3cG9ydEtleSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aWV3cG9ydEtleSkgPT4ge1xuICAgIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgdmlld3BvcnRLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdmlld3BvcnQgXCIke3ZpZXdwb3J0S2V5fVwiYClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHZpZXdwb3J0S2V5IH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgdmFsdWUgPSBSZWFjdC51c2VNZW1vKCgpID0+ICh7XG4gICAgbW9kZTogc3RhdGUubW9kZSxcbiAgICB2aWV3cG9ydEtleTogc3RhdGUudmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQ6IHByb2plY3Qudmlld3BvcnRzW3N0YXRlLnZpZXdwb3J0S2V5XSxcbiAgICBlbnRyeUlkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuY3VycmVudFNjcmVlbklkLFxuICAgIG5hdmlnYXRlLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBzZXRNb2RlLFxuICAgIGVudGVyRGVtbyxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICBjYW5Hb0JhY2s6IHN0YXRlLmhpc3RvcnkubGVuZ3RoID4gMCxcbiAgfSksIFtlbnRlckRlbW8sIGdvQmFjaywgbmF2aWdhdGUsIHByb2plY3QsIHJlc2V0LCBzZWxlY3RFbnRyeSwgc2V0TW9kZSwgc2V0Vmlld3BvcnRLZXksIHN0YXRlXSlcblxuICByZXR1cm4gPFByb3RvdHlwZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT57Y2hpbGRyZW59PC9Qcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvdG90eXBlKCkge1xuICBjb25zdCBjb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChQcm90b3R5cGVDb250ZXh0KVxuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcigndXNlUHJvdG90eXBlIG11c3QgYmUgdXNlZCBpbnNpZGUgUHJvdG90eXBlUHJvdmlkZXInKVxuICByZXR1cm4gY29udGV4dFxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjbGFtcFNjYWxlKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLm1pbigyLCBNYXRoLm1heCgwLjIsIHNjYWxlKSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMUFcdTYzMDlcdTVCQjlcdTU2NjhcdTUxODVcdTVCQjlcdTUzM0FcdTYyOEFcdTY1NzRcdTk4NzVcdTdGMjlcdTY1M0VcdTUyMzBcdTVCOENcdTY1NzRcdTUzRUZcdTg5QzFcdTMwMDJcbiAqIGNvbnRhaW5lciogXHU0RTNBXHU1M0JCXHU2Mzg5IHBhZGRpbmcgXHU1NDBFXHU3Njg0XHU1M0VGXHU3NTI4XHU1QzNBXHU1QkY4XHVGRjFCY29udGVudCogXHU0RTNBXHU2NzJBXHU3RjI5XHU2NTNFXHU3Njg0IHN0YWdlIFx1NUJCRFx1OUFEOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0RGVtb1NjYWxlKGNvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHQsIGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCkge1xuICBpZiAoY29udGFpbmVyV2lkdGggPD0gMCB8fCBjb250YWluZXJIZWlnaHQgPD0gMCB8fCBjb250ZW50V2lkdGggPD0gMCB8fCBjb250ZW50SGVpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiBjbGFtcFNjYWxlKE1hdGgubWluKGNvbnRhaW5lcldpZHRoIC8gY29udGVudFdpZHRoLCBjb250YWluZXJIZWlnaHQgLyBjb250ZW50SGVpZ2h0KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q2FudmFzVmlld3BvcnQoKSB7XG4gIHJldHVybiB7IHNjYWxlOiAxLCBwYW5YOiAwLCBwYW5ZOiAwIH1cbn1cblxuY29uc3QgRk9DVVNfUEFERElORyA9IDQwXG5cbi8qKlxuICogXHU3NTNCXHU2NzdGIGZvY3VzXHVGRjFBXHU2MjhBXHU2NTc0XHU1NzU3IHNjcmVlblx1RkYwOFx1NTQyQiBtZXRhXHVGRjA5XHU3OUZCXHU1MjMwXHU1QkI5XHU1NjY4XHU0RTJEXHU1RkMzXHUzMDAyXG4gKiBcdTRFQzVcdTVGNTNcdTVGNTNcdTUyNEQgc2NhbGUgXHU2NTNFXHU0RTBEXHU0RTBCXHU2NUY2XHU3RjI5XHU1QzBGXHVGRjFCXHU0RTBEXHU2NTNFXHU1OTI3XHUzMDAyXHU1QzNBXHU1QkY4XHU5NzVFXHU2Q0Q1XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgY29udGFpbmVyV2lkdGgsXG4gIGNvbnRhaW5lckhlaWdodCxcbiAgc2NyZWVuTGVmdCxcbiAgc2NyZWVuVG9wLFxuICBzY3JlZW5XaWR0aCxcbiAgc2NyZWVuSGVpZ2h0LFxuICBjdXJyZW50U2NhbGUsXG4gIHBhZGRpbmcgPSBGT0NVU19QQURESU5HLFxufSkge1xuICBpZiAoXG4gICAgY29udGFpbmVyV2lkdGggPD0gMFxuICAgIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwXG4gICAgfHwgc2NyZWVuV2lkdGggPD0gMFxuICAgIHx8IHNjcmVlbkhlaWdodCA8PSAwXG4gICAgfHwgIU51bWJlci5pc0Zpbml0ZShjdXJyZW50U2NhbGUpXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBhdmFpbFdpZHRoID0gY29udGFpbmVyV2lkdGggLSBwYWRkaW5nICogMlxuICBjb25zdCBhdmFpbEhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHBhZGRpbmcgKiAyXG4gIGlmIChhdmFpbFdpZHRoIDw9IDAgfHwgYXZhaWxIZWlnaHQgPD0gMCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBmaXRTY2FsZSA9IE1hdGgubWluKGF2YWlsV2lkdGggLyBzY3JlZW5XaWR0aCwgYXZhaWxIZWlnaHQgLyBzY3JlZW5IZWlnaHQpXG4gIGNvbnN0IHNjYWxlID0gY2xhbXBTY2FsZShNYXRoLm1pbihjdXJyZW50U2NhbGUsIGZpdFNjYWxlKSlcbiAgcmV0dXJuIHtcbiAgICBzY2FsZSxcbiAgICBwYW5YOiBjb250YWluZXJXaWR0aCAvIDIgLSAoc2NyZWVuTGVmdCArIHNjcmVlbldpZHRoIC8gMikgKiBzY2FsZSxcbiAgICBwYW5ZOiBjb250YWluZXJIZWlnaHQgLyAyIC0gKHNjcmVlblRvcCArIHNjcmVlbkhlaWdodCAvIDIpICogc2NhbGUsXG4gIH1cbn1cblxuLyoqXG4gKiBcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdUZGMUFcdTUzRUFcdTc1MjhcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTUyNERcdTYyMkFcdTgzQjdcdTc2ODQgc25hcHNob3RcdUZGMENcdTc5ODFcdTZCNjJcdTU3Mjggc2V0U3RhdGUgdXBkYXRlciBcdTkxQ0NcdThCRkIgZHJhZyByZWZcdTMwMDJcbiAqIFJlYWN0IDE4IFx1NEYxQVx1NTcyOCBlbmRQYW4gXHU2RTA1XHU3QTdBIHJlZiBcdTU0MEVcdTkxQ0RcdTY1M0UgdXBkYXRlclx1RkYxQlx1OEJGQiBudWxsLnBhblggXHU1MzczIEJvYXJkIFx1NjJBNVx1OTUxOVx1NjgzOVx1NTZFMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFuRnJvbURyYWdTbmFwc2hvdCh2aWV3LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gdmlld1xuICByZXR1cm4ge1xuICAgIC4uLnZpZXcsXG4gICAgcGFuWDogc25hcHNob3QucGFuWCArIGNsaWVudFggLSBzbmFwc2hvdC54LFxuICAgIHBhblk6IHNuYXBzaG90LnBhblkgKyBjbGllbnRZIC0gc25hcHNob3QueSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTY3JvbGxhYmxlT3ZlcmZsb3codmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSAnYXV0bycgfHwgdmFsdWUgPT09ICdzY3JvbGwnIHx8IHZhbHVlID09PSAnb3ZlcmxheSdcbn1cblxuLyoqIFx1NTcyOCByb290IFx1NTE4NVx1NTQxMVx1NEUwQVx1NjI3RVx1NTNFRlx1NkVEQVx1NTJBOFx1Nzk1Nlx1NTE0OFx1RkYwOFx1NTQyQiByb290IFx1ODFFQVx1OEVBQlx1RkYwQ1x1NTk4Mlx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1NTMzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlQW5jZXN0b3Ioc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGxldCBub2RlID0gc3RhcnRFbCAmJiBzdGFydEVsLm5vZGVUeXBlID09PSAzID8gc3RhcnRFbC5wYXJlbnRFbGVtZW50IDogc3RhcnRFbFxuICB3aGlsZSAobm9kZSkge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpXG4gICAgICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBub2RlLnNjcm9sbEhlaWdodCA+IG5vZGUuY2xpZW50SGVpZ2h0ICsgMVxuICAgICAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgbm9kZS5zY3JvbGxXaWR0aCA+IG5vZGUuY2xpZW50V2lkdGggKyAxXG4gICAgICBpZiAoY2FuWSB8fCBjYW5YKSByZXR1cm4gbm9kZVxuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBDT05URU5UX0RSQUdfVEhSRVNIT0xEID0gM1xuXG5mdW5jdGlvbiBpc0VkaXRhYmxlVGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxuICByZXR1cm4gISF0YXJnZXQuY2xvc2VzdCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJylcbn1cblxuLyoqXG4gKiBcdTU3MjhcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUxODVcdTYzMDlcdTRGNEZcdTYyRDZcdTYyRkQgXHUyMTkyIFx1NkVEQVx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMlxuICogXHU2MzA5XHU0RjRGXHU3QTdBXHU2ODNDXHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdUZGMDhcdTRFQTRcdTdFRDlcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcdUZGMENcdTc5ODFcdTZCNjJcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMDlcdTMwMDJcbiAqIFx1OEZENFx1NTZERSBudWxsIFx1ODg2OFx1NzkzQVx1NEUwRFx1NUU5NFx1NjNBNVx1N0JBMVx1OEJFNVx1NkIyMSBwb2ludGVyZG93blx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgcm9vdEVsLCB7IHNwYWNlSGVsZCA9IGZhbHNlLCBzY2FsZSA9IDEgfSA9IHt9KSB7XG4gIGlmIChzcGFjZUhlbGQpIHJldHVybiBudWxsXG4gIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVybiBudWxsXG4gIGlmICghcm9vdEVsIHx8ICFyb290RWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgaWYgKGlzRWRpdGFibGVUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgY29uc3Qgc2Nyb2xsYWJsZSA9IGZpbmRTY3JvbGxhYmxlQW5jZXN0b3IoZXZlbnQudGFyZ2V0LCByb290RWwpXG4gIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHtcbiAgICBlbDogc2Nyb2xsYWJsZSxcbiAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgIHNjcm9sbExlZnQ6IHNjcm9sbGFibGUuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IHNjcm9sbGFibGUuc2Nyb2xsVG9wLFxuICAgIHNjYWxlOiBzY2FsZSA+IDAgPyBzY2FsZSA6IDEsXG4gICAgbW92ZWQ6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KSB7XG4gIGlmICghc3RhdGUgfHwgc3RhdGUucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVybiBzdGF0ZVxuICBjb25zdCBkeCA9IChldmVudC5jbGllbnRYIC0gc3RhdGUuc3RhcnRYKSAvIHN0YXRlLnNjYWxlXG4gIGNvbnN0IGR5ID0gKGV2ZW50LmNsaWVudFkgLSBzdGF0ZS5zdGFydFkpIC8gc3RhdGUuc2NhbGVcbiAgaWYgKCFzdGF0ZS5tb3ZlZCAmJiAoTWF0aC5hYnMoZHgpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCB8fCBNYXRoLmFicyhkeSkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEKSkge1xuICAgIHN0YXRlLm1vdmVkID0gdHJ1ZVxuICB9XG4gIHN0YXRlLmVsLnNjcm9sbExlZnQgPSBzdGF0ZS5zY3JvbGxMZWZ0IC0gZHhcbiAgc3RhdGUuZWwuc2Nyb2xsVG9wID0gc3RhdGUuc2Nyb2xsVG9wIC0gZHlcbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8qKiBcdTYyRDZcdTYyRkRcdThEODVcdThGQzdcdTk2MDhcdTUwM0NcdTU0MEVcdTU0MUVcdTYzODlcdTk2OEZcdTU0MEVcdTc2ODQgY2xpY2tcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTg5RTZcdThERjNcdThGNkMgKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgcm9vdEVsKSB7XG4gIGlmICghc3RhdGUgfHwgIXN0YXRlLm1vdmVkIHx8ICFyb290RWwpIHJldHVyblxuICBjb25zdCBwcmV2ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByb290RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG4gIH1cbiAgcm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxufVxuXG4vKiogXHU4QkU1XHU2NUI5XHU1NDExXHU2NjJGXHU1NDI2XHU4RkQ4XHU4MEZEXHU3RUU3XHU3RUVEXHU2RURBICovXG5leHBvcnQgZnVuY3Rpb24gY2FuU2Nyb2xsSW5EaXJlY3Rpb24oZWwsIGRlbHRhWCwgZGVsdGFZKSB7XG4gIGNvbnN0IGVwcyA9IDFcbiAgaWYgKGRlbHRhWSkge1xuICAgIGNvbnN0IG1heFkgPSBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHRcbiAgICBpZiAobWF4WSA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWSA8IDAgJiYgZWwuc2Nyb2xsVG9wID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWSA+IDAgJiYgZWwuc2Nyb2xsVG9wIDwgbWF4WSAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgaWYgKGRlbHRhWCkge1xuICAgIGNvbnN0IG1heFggPSBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoXG4gICAgaWYgKG1heFggPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVggPCAwICYmIGVsLnNjcm9sbExlZnQgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFYID4gMCAmJiBlbC5zY3JvbGxMZWZ0IDwgbWF4WCAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogXHU0RUM1IEN0cmwvTWV0YSArIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYwOFx1ODlFNlx1NjNBN1x1Njc3RiBwaW5jaCBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTkxQ0NcdTkwMUFcdTVFMzhcdTVFMjYgY3RybEtleVx1RkYwOVx1MzAwMlxuICogXHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU0RTBEXHU3RjI5XHU2NTNFXHVGRjBDXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU1MzlGXHU3NTFGXHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCkge1xuICByZXR1cm4gISEoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJFbnRyeUlkKHNjcmVlbnMpIHtcbiAgcmV0dXJuIHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZW1vU3RhdGUoc2NyZWVucykge1xuICBjb25zdCBlbnRyeUlkID0gaW5mZXJFbnRyeUlkKHNjcmVlbnMpXG4gIGlmICghZW50cnlJZCkgdGhyb3cgbmV3IEVycm9yKCdEZW1vIG1vZGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGVudHJ5IHNjcmVlbicpXG4gIHJldHVybiB7XG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGVEZW1vKHN0YXRlLCB0YXJnZXRJZCwgc2NyZWVucykge1xuICBpZiAoIXNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3RhcmdldElkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgfVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKVxuICBpZiAoIWN1cnJlbnRTY3JlZW4ubGlua3MuaW5jbHVkZXModGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke3N0YXRlLmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7dGFyZ2V0SWR9XCJgKVxuICB9XG4gIGlmICh0YXJnZXRJZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKSByZXR1cm4gc3RhdGVcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHRhcmdldElkLFxuICAgIGhpc3Rvcnk6IFsuLi5zdGF0ZS5oaXN0b3J5LCBzdGF0ZS5jdXJyZW50U2NyZWVuSWRdLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3REZW1vRW50cnkoc3RhdGUsIGVudHJ5SWQsIHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnkgPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnb0JhY2tEZW1vKHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGhpc3RvcnkgPSBzdGF0ZS5oaXN0b3J5LnNsaWNlKDAsIC0xKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuaGlzdG9yeVtzdGF0ZS5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgIGhpc3RvcnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGVtbyhzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7IGVycm9yOiBudWxsIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9XG4gIH1cblxuICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgaW5mbykge1xuICAgIGNvbnNvbGUuZXJyb3IoYFt3aXJlZnJhbWU6JHt0aGlzLnByb3BzLnNjb3BlIHx8ICd1bmtub3duJ31dYCwgZXJyb3IsIGluZm8pXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICYmIHByZXZpb3VzUHJvcHMucmVzZXRLZXkgIT09IHRoaXMucHJvcHMucmVzZXRLZXkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZXJyb3IpIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgY29uc3QgeyBzY3JlZW5JZCwgc291cmNlLCBzY29wZSB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWVycm9yLWNhcmRcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgPHN0cm9uZz57c2NvcGUgPT09ICdzY3JlZW4nID8gYFNjcmVlbjogJHtzY3JlZW5JZH1gIDogJ0JvYXJkIGVycm9yJ308L3N0cm9uZz5cbiAgICAgICAge3NvdXJjZSA/IDxzcGFuPlNvdXJjZToge3NvdXJjZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPHNwYW4+TWVzc2FnZToge3RoaXMuc3RhdGUuZXJyb3IubWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDxwcmU+e3RoaXMuc3RhdGUuZXJyb3Iuc3RhY2t9PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsICJjb25zdCBTY3JlZW5JZGVudGl0eUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5JZGVudGl0eVByb3ZpZGVyKHsgc2NyZWVuSWQsIGNoaWxkcmVuIH0pIHtcbiAgaWYgKCFzY3JlZW5JZCkgdGhyb3cgbmV3IEVycm9yKCdTY3JlZW5JZGVudGl0eVByb3ZpZGVyIHJlcXVpcmVzIHNjcmVlbklkJylcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzY3JlZW5JZH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9TY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNjcmVlbklkKCkge1xuICBjb25zdCBzY3JlZW5JZCA9IFJlYWN0LnVzZUNvbnRleHQoU2NyZWVuSWRlbnRpdHlDb250ZXh0KVxuICBpZiAoIXNjcmVlbklkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VTY3JlZW5JZCBtdXN0IGJlIHVzZWQgaW5zaWRlIGEgcmVuZGVyZWQgc2NyZWVuJylcbiAgfVxuICByZXR1cm4gc2NyZWVuSWRcbn1cbiIsICIvKipcbiAqIFx1NzBFRFx1NTMzQVx1NEUwRVx1OERGM1x1OEY2Q1x1NzY4NFx1NTUyRlx1NEUwMFx1NTk1MVx1N0VBNlx1RkYxQVx1NTE0M1x1N0QyMFx1NUUyNiBkYXRhLWZsb3ctdG8gXHU1MzczXHU1M0VGXHU1QkZDXHU4MjJBXHUzMDAyXG4gKiBTY3JlZW5GcmFtZSBcdTU5RDRcdTYyNThcdTcwQjlcdTUxRkJcdTUxNUNcdTVFOTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMUFcdTUyQTFcdTUxOTlcdTYyMTBcdTg4Rjggc3Bhbi9kaXYgXHU1M0VBXHU2NzA5XHU1QzVFXHU2MDI3XHUzMDAxXHU2Q0ExXHU2NzA5IG9uQ2xpY2tcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGbG93VGFyZ2V0SWQoc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGlmICghc3RhcnRFbCB8fCB0eXBlb2Ygc3RhcnRFbC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbFxuICBjb25zdCBlbCA9IHN0YXJ0RWwuY2xvc2VzdCgnW2RhdGEtZmxvdy10b10nKVxuICBpZiAoIWVsKSByZXR1cm4gbnVsbFxuICBpZiAocm9vdEVsICYmIHR5cGVvZiByb290RWwuY29udGFpbnMgPT09ICdmdW5jdGlvbicgJiYgIXJvb3RFbC5jb250YWlucyhlbCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHRvID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZsb3ctdG8nKVxuICByZXR1cm4gdG8gfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCByb290RWwsIG5hdmlnYXRlKSB7XG4gIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChldmVudD8udGFyZ2V0LCByb290RWwpXG4gIGlmICghdG8pIHJldHVybiBmYWxzZVxuICBldmVudC5wcmV2ZW50RGVmYXVsdD8uKClcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICBuYXZpZ2F0ZSh0bylcbiAgcmV0dXJuIHRydWVcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuLi91aS9mbG93LXRhcmdldC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBzcGFjZUhlbGQgPSBmYWxzZSxcbiAgc2NhbGUgPSAxLFxufSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBjb250ZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2RyYWdTY3JvbGxpbmcsIHNldERyYWdTY3JvbGxpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgaWYgKCFzY3JlZW4pIHJldHVybiBudWxsXG5cbiAgY29uc3QgQ29tcG9uZW50ID0gc2NyZWVuLmNvbXBvbmVudFxuICBjb25zdCBmcmFtZUNsYXNzID0gW1xuICAgICd3Zi1zY3JlZW4tY2hyb21lJyxcbiAgICBtb2RlID09PSAnY2FudmFzJyAmJiBmb2N1c2VkID8gJ2lzLWZvY3VzZWQnIDogJycsXG4gICAgYHdmLXNjcmVlbi0ke21vZGV9YCxcbiAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpXG5cbiAgY29uc3Qgb25Qb2ludGVyRG93biA9IChldmVudCkgPT4ge1xuICAgIC8vIFx1N0E3QVx1NjgzQ1x1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1NTE5Mlx1NkNFMVx1N0VEOVx1NzUzQlx1NUUwM1xuICAgIGlmIChzcGFjZUhlbGQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBzcGFjZUhlbGQsIHNjYWxlIH0pXG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gc3RhdGVcbiAgICBzZXREcmFnU2Nyb2xsaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgbmF2aWdhdGUpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uXG4gICAgICBjbGFzc05hbWU9e2ZyYW1lQ2xhc3N9XG4gICAgICBkYXRhLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHZpZXdwb3J0LndpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWZpbGVcIj57c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAge21vZGUgPT09ICdjYW52YXMnICYmIG9uRXhwb3J0ID8gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtZXhwb3J0LW9uZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgb25FeHBvcnQoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTVCRkNcdTUxRkEgUE5HXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17Y29udGVudFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLWNvbnRlbnQke2RyYWdTY3JvbGxpbmcgPyAnIGlzLWRyYWctc2Nyb2xsaW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiB2aWV3cG9ydC53aWR0aCwgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQgfX1cbiAgICAgICAgb25Qb2ludGVyRG93bj17b25Qb2ludGVyRG93bn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17b25Qb2ludGVyTW92ZX1cbiAgICAgICAgb25Qb2ludGVyVXA9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShlbCwgZ2V0U2NhbGUsIHNldFNjYWxlKSB7XG4gIGlmICghZWwpIHJldHVybiAoKSA9PiB7fVxuICBjb25zdCBvbldoZWVsID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFzaG91bGRab29tT25XaGVlbChldmVudCkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSkge1xuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBmb2N1c0NhbnZhc1NjcmVlbiwgcmVzZXRDYW52YXNWaWV3cG9ydCwgcGFuRnJvbURyYWdTbmFwc2hvdCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeHBvcnRXaXRoRmVlZGJhY2sodGFzaywgc2V0RXJyb3IpIHtcbiAgc2V0RXJyb3IobnVsbClcbiAgdHJ5IHtcbiAgICBhd2FpdCB0YXNrKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgc2V0RXJyb3IoYFx1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYxQSR7bWVzc2FnZX1gKVxuICB9XG59XG5cbi8qKiBmaWxlOi8vIFx1NEUwRFx1NjYyRiBzZWN1cmUgY29udGV4dFx1RkYwQ2NsaXBib2FyZCBBUEkgXHU1RTM4XHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDZXhlY0NvbW1hbmQgXHU1MTVDXHU1RTk1ICovXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgfVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNNb2RlKHtcbiAgcHJvamVjdCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICBzcGFjZUhlbGQsXG4gIHNlbGVjdGVkSWRzLFxuICBzZXRTZWxlY3RlZElkcyxcbiAgb25FeHBvcnRJZHMsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCBuYXZpZ2F0ZSwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBlbnRlckRlbW86IGVudGVyRGVtb01vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWRLZXksIHNldENvcGllZEtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbY29weVRvYXN0LCBzZXRDb3B5VG9hc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjYW52YXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY29waWVkVGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGRyYWdnaW5nUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBkcmFnZ2luZ1JlZi5jdXJyZW50ID0gZHJhZ2dpbmdcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IGN1cnJlbnQuc2NhbGUgfSkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcmFnZ2luZ1JlZi5jdXJyZW50KSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcHBseSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICAgIGlmICghY2FudmFzIHx8ICFzdGFnZSkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzY3JlZW5FbCA9IHN0YWdlLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhbnZhcy1zY3JlZW4taWQ9XCIke2N1cnJlbnRTY3JlZW5JZH1cIl1gKVxuICAgICAgaWYgKCFzY3JlZW5FbCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBjdXJyZW50U2NhbGUgPSBzY2FsZVJlZi5jdXJyZW50XG4gICAgICBpZiAoY3VycmVudFNjYWxlIDw9IDApIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc3RhZ2VCb3ggPSBzdGFnZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc2NyZWVuQm94ID0gc2NyZWVuRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IG5leHQgPSBmb2N1c0NhbnZhc1NjcmVlbih7XG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsXG4gICAgICAgIGNvbnRhaW5lckhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCxcbiAgICAgICAgc2NyZWVuTGVmdDogKHNjcmVlbkJveC5sZWZ0IC0gc3RhZ2VCb3gubGVmdCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlblRvcDogKHNjcmVlbkJveC50b3AgLSBzdGFnZUJveC50b3ApIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5XaWR0aDogc2NyZWVuQm94LndpZHRoIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5IZWlnaHQ6IHNjcmVlbkJveC5oZWlnaHQgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIGN1cnJlbnRTY2FsZSxcbiAgICAgIH0pXG4gICAgICBpZiAoIW5leHQpIHJldHVybiBmYWxzZVxuICAgICAgc2V0U2NhbGUobmV4dC5zY2FsZSlcbiAgICAgIHNldFZpZXcobmV4dClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KCkpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgYXBwbHkoKVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSlcbiAgfSwgW2N1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnRLZXksIHNldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIHVzZVdoZWVsWm9vbShjYW52YXNSZWYsIHNjYWxlLCBzZXRTY2FsZSlcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghc3BhY2VIZWxkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBlbnRlckRlbW8gPSAoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIWRlbW9BdmFpbGFibGUgfHwgc3BhY2VIZWxkKSByZXR1cm5cbiAgICBlbnRlckRlbW9Nb2RlKHNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY29weU1ldGEgPSAoa2V5LCB0ZXh0LCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvcHlUZXh0KHRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkS2V5KGtleSlcbiAgICAgIHNldENvcHlUb2FzdCgnXHU1REYyXHU1OTBEXHU1MjM2JylcbiAgICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3BpZWRUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWRLZXkobnVsbClcbiAgICAgICAgc2V0Q29weVRvYXN0KG51bGwpXG4gICAgICB9LCAxMjAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVTZWxlY3RlZCA9IChpZCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlQWxsID0gKCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpXG4gICAgICByZXR1cm4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tc2lkZWJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItaGVhZGVyXCI+XG4gICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGggJiYgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA+IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0b2dnbGVBbGx9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgXHU1MTY4XHU5MDA5XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwc1wiIGFyaWEtbGFiZWw9XCJcdTY0Q0RcdTRGNUNcdTYzRDBcdTc5M0FcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8a2JkPkN0cmw8L2tiZD5cbiAgICAgICAgICAgIDxzcGFuPisgXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxrYmQ+XHU3QTdBXHU2ODNDPC9rYmQ+XG4gICAgICAgICAgICA8c3Bhbj4rIFx1NjJENlx1NjJGRFx1NzlGQlx1NTJBOFx1NzUzQlx1NUUwMzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAgPG1haW5cbiAgICAgICAgcmVmPXtjYW52YXNSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWNhbnZhcyR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7c3BhY2VIZWxkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVGV4dCA9IGAke2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICBjb25zdCB0aXRsZUtleSA9IGAke3NjcmVlbi5pZH06dGl0bGVgXG4gICAgICAgICAgICBjb25zdCBmaWxlS2V5ID0gYCR7c2NyZWVuLmlkfTpmaWxlYFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLXNjcmVlbiBpcy1mb2N1c2VkJyA6ICd3Zi1jYW52YXMtc2NyZWVuJ31cbiAgICAgICAgICAgICAgICBkYXRhLWNhbnZhcy1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tbWV0YS10aXRsZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKHRpdGxlS2V5LCB0aXRsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RpdGxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3NjcmVlbi5kZXNjcmlwdGlvbiA/IDxkaXY+e3NjcmVlbi5kZXNjcmlwdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1tZXRhLWxpbmUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEoZmlsZUtleSwgZmlsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5cdTY1ODdcdTRFRjZcdUZGMUE8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgICAgICAgIG1vZGU9XCJjYW52YXNcIlxuICAgICAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgZm9jdXNlZD17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgc3BhY2VIZWxkPXtzcGFjZUhlbGR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWxhYmVsXCI+XHU3RDIyXHU1RjE1PC9zcGFuPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWxpc3RcIj5cbiAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2Ake2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXAtZmlsZVwiPnNyYy9zY3JlZW5zL3tzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgICAge2NvcHlUb2FzdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b2FzdFwiIHJvbGU9XCJzdGF0dXNcIj57Y29weVRvYXN0fTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZml0RGVtb1NjYWxlLCBwYW5Gcm9tRHJhZ1NuYXBzaG90LCByZXNldENhbnZhc1ZpZXdwb3J0IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuXG5mdW5jdGlvbiByZWFkQ29udGVudEJveChlbCkge1xuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBwYWRYID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodClcbiAgY29uc3QgcGFkWSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IE1hdGgubWF4KDAsIGVsLmNsaWVudFdpZHRoIC0gcGFkWCksXG4gICAgaGVpZ2h0OiBNYXRoLm1heCgwLCBlbC5jbGllbnRIZWlnaHQgLSBwYWRZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVtb01vZGUoe1xuICBwcm9qZWN0LFxuICBob3RzcG90c1Zpc2libGUsXG4gIHNwYWNlSGVsZCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICB2aWV3UmVzZXRLZXksXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydCwgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHNjcmVlbkluZGV4ID0gcHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzY3JlZW4gPSBzY3JlZW5JbmRleCA+PSAwID8gcHJvamVjdC5zY3JlZW5zW3NjcmVlbkluZGV4XSA6IG51bGxcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGFwcGx5Rml0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCAhc3RhZ2UpIHJldHVyblxuICAgIGNvbnN0IGJveCA9IHJlYWRDb250ZW50Qm94KGNvbnRhaW5lcilcbiAgICBjb25zdCBuZXh0ID0gZml0RGVtb1NjYWxlKGJveC53aWR0aCwgYm94LmhlaWdodCwgc3RhZ2Uub2Zmc2V0V2lkdGgsIHN0YWdlLm9mZnNldEhlaWdodClcbiAgICBzZXRTY2FsZShuZXh0KVxuICAgIHNldFZpZXcoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBuZXh0IH0pXG4gIH0sIFtzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCB0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFwcGx5Rml0KClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gYXBwbHlGaXQoKSlcbiAgICBvYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lcilcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXldKVxuXG4gIHVzZVdoZWVsWm9vbSh2aWV3cG9ydFJlZiwgc2NhbGUsIHNldFNjYWxlKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFzcGFjZUhlbGQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1kZW1vIGlzLXNob3dpbmctaG90c3BvdHMnIDogJ3dmLWRlbW8nfT5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXt2aWV3cG9ydFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtZGVtby12aWV3cG9ydCR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7c3BhY2VIZWxkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1kZW1vLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICBtb2RlPVwiZGVtb1wiXG4gICAgICAgICAgICBpbmRleD17c2NyZWVuSW5kZXh9XG4gICAgICAgICAgICBzcGFjZUhlbGQ9e3NwYWNlSGVsZH1cbiAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1kZW1vLWhpbnRcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTUxODVcdTYzMDlcdTk0QUUgLyBcdTk0RkVcdTYzQTVcdThERjNcdThGNkNcdUZGMUJcdTUzRUZcdTU3MjhcdTVERTVcdTUxNzdcdTY4MEZcdTVGMDBcdTUxNzNcdTcwRURcdTUzM0FcdTlBRDhcdTRFQUU8L3A+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJsZXQgZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxuXG5jb25zdCBsaWJyYXJpZXMgPSBbXG4gIHsgZmlsZTogJ2h0bWwyY2FudmFzLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93Lmh0bWwyY2FudmFzID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ2pzemlwLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LkpTWmlwID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ0ZpbGVTYXZlci5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5zYXZlQXMgPT09ICdmdW5jdGlvbicgfSxcbl1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdChmaWxlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtd2lyZWZyYW1lLWV4cG9ydD1cIiR7ZmlsZX1cIl1gKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPT09ICdsb2FkZWQnKSB7XG4gICAgICAgIGV4aXN0aW5nLnJlbW92ZSgpXG4gICAgICAgIGV4aXN0aW5nID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXNvbHZlLCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0LCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB2ZW5kb3JCYXNlID0gd2luZG93LldJUkVGUkFNRV9WRU5ET1JfQkFTRVxuICAgIGlmICghdmVuZG9yQmFzZSkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignXHU2NzJBXHU5MTREXHU3RjZFXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzXHU4REVGXHU1Rjg0IFdJUkVGUkFNRV9WRU5ET1JfQkFTRScpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgc2NyaXB0LnNyYyA9IG5ldyBVUkwoZmlsZSwgdmVuZG9yQmFzZSkuaHJlZlxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydCA9IGZpbGVcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkaW5nJ1xuICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkZWQnXG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQucmVtb3ZlKClcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1NTJBMFx1OEY3RFx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5MyAke2ZpbGV9YCkpXG4gICAgfVxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEV4cG9ydExpYnJhcmllcygpIHtcbiAgaWYgKCFleHBvcnRMaWJyYXJpZXNQcm9taXNlKSB7XG4gICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IGxpYnJhcmllcy5yZWR1Y2UoXG4gICAgICAoY2hhaW4sIGxpYnJhcnkpID0+IGNoYWluLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgYXdhaXQgbG9hZFNjcmlwdChsaWJyYXJ5LmZpbGUpXG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSB0aHJvdyBuZXcgRXJyb3IoYFx1NUJGQ1x1NTFGQVx1NUU5M1x1NTIxRFx1NTlDQlx1NTMxNlx1NTkzMVx1OEQyNTogJHtsaWJyYXJ5LmZpbGV9YClcbiAgICAgIH0pLFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKCksXG4gICAgKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSB1bmRlZmluZWRcbiAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbiAgfVxuICByZXR1cm4gZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVNjcmVlbihzY3JlZW5FbGVtZW50LCB2aWV3cG9ydCkge1xuICBpZiAoIXNjcmVlbkVsZW1lbnQpIHRocm93IG5ldyBFcnJvcignXHU2MjdFXHU0RTBEXHU1MjMwXHU4OTgxXHU1QkZDXHU1MUZBXHU3Njg0IHNjcmVlbiBcdTUxNDNcdTdEMjAnKVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcblxuICBjb25zdCBzYW5kYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc2FuZGJveC5jbGFzc05hbWUgPSAnd2YtZXhwb3J0LXNhbmRib3gnXG4gIHNhbmRib3guc3R5bGUud2lkdGggPSBgJHt2aWV3cG9ydC53aWR0aH1weGBcbiAgc2FuZGJveC5zdHlsZS5oZWlnaHQgPSBgJHt2aWV3cG9ydC5oZWlnaHR9cHhgXG4gIGNvbnN0IGNsb25lID0gc2NyZWVuRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSlcbiAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt2aWV3cG9ydC53aWR0aH1weGBcbiAgY2xvbmUuc3R5bGUuaGVpZ2h0ID0gYCR7dmlld3BvcnQuaGVpZ2h0fXB4YFxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjYW52YXMgPSBhd2FpdCB3aW5kb3cuaHRtbDJjYW52YXMoY2xvbmUsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgd2lkdGg6IHZpZXdwb3J0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQsXG4gICAgICBzY2FsZTogMixcbiAgICAgIHVzZUNPUlM6IGZhbHNlLFxuICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgKGJsb2IpID0+IGJsb2IgPyByZXNvbHZlKGJsb2IpIDogcmVqZWN0KG5ldyBFcnJvcignUE5HIFx1N0YxNlx1NzgwMVx1NTkzMVx1OEQyNScpKSxcbiAgICAgICAgJ2ltYWdlL3BuZycsXG4gICAgICApXG4gICAgfSlcbiAgfSBmaW5hbGx5IHtcbiAgICBzYW5kYm94LnJlbW92ZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbnMpIHx8IHNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTgxRjNcdTVDMTFcdTkwMDlcdTYyRTlcdTRFMDBcdTRFMkEgc2NyZWVuJylcbiAgfVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcbiAgY29uc3QgY2FwdHVyZWQgPSBbXVxuICBmb3IgKGNvbnN0IHNjcmVlbiBvZiBzY3JlZW5zKSB7XG4gICAgY2FwdHVyZWQucHVzaCh7XG4gICAgICBuYW1lOiBgJHtzbHVnKHNjcmVlbi5pZCl9LnBuZ2AsXG4gICAgICBibG9iOiBhd2FpdCBjYXB0dXJlU2NyZWVuKHNjcmVlbi5lbGVtZW50LCBzY3JlZW4udmlld3BvcnQpLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgQ2FudmFzTW9kZSwgcnVuRXhwb3J0V2l0aEZlZWRiYWNrIH0gZnJvbSAnLi9DYW52YXNNb2RlLmpzeCdcbmltcG9ydCB7IERlbW9Nb2RlIH0gZnJvbSAnLi9EZW1vTW9kZS5qc3gnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFBhbkhpbnQoeyBzcGFjZUhlbGQgfSkge1xuICByZXR1cm4gKFxuICAgIDxzcGFuIGNsYXNzTmFtZT17c3BhY2VIZWxkID8gJ3dmLXBhbi1oaW50IGlzLWFjdGl2ZScgOiAnd2YtcGFuLWhpbnQnfSB0aXRsZT1cIlx1NjMwOVx1NEY0Rlx1N0E3QVx1NjgzQ1x1OTUyRVx1NTQwRVx1NjJENlx1NjJGRFx1RkYwQ1x1NTNFRlx1NTcyOFx1NEVGQlx1NjEwRlx1NEY0RFx1N0Y2RVx1NzlGQlx1NTJBOFx1NzUzQlx1NUUwM1wiPlxuICAgICAgPGtiZD5cdTdBN0FcdTY4M0M8L2tiZD5cbiAgICAgIHsnICsgXHU2MkQ2XHU2MkZEXHU3OUZCXHU1MkE4XHU3NTNCXHU1RTAzJ31cbiAgICA8L3NwYW4+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcblxuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKSxcbiAgKVxuICBjb25zdCBbY2FudmFzU2NhbGUsIHNldENhbnZhc1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vU2NhbGUsIHNldERlbW9TY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1ZpZXdSZXNldEtleSwgc2V0RGVtb1ZpZXdSZXNldEtleV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJyAmJiAhZXZlbnQucmVwZWF0KSBzZXRTcGFjZUhlbGQodHJ1ZSlcbiAgICB9XG4gICAgY29uc3QgdXAgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnKSBzZXRTcGFjZUhlbGQoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgfVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnZGVtbycpIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfSwgW21vZGVdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmRcIj5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW5hbWVcIj57cHJvamVjdC5uYW1lfTwvaDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcHJvamVjdC1tZXRhXCI+e3Byb2plY3Quc2NyZWVucy5sZW5ndGh9IFx1OTg3NTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHtkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RlLXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1NkEyMVx1NUYwRlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnY2FudmFzJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnY2FudmFzJyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPFBhbkhpbnQgc3BhY2VIZWxkPXtzcGFjZUhlbGR9IC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXtyZXNldERlbW9WaWV3fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8UGFuSGludCBzcGFjZUhlbGQ9e3NwYWNlSGVsZH0gLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLXByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2V4cG9ydGluZyB8fCBzZWxlY3RlZElkcy5zaXplID09PSAwIHx8IG1vZGUgPT09ICdkZW1vJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICgke3NlbGVjdGVkSWRzLnNpemV9KWB9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIHtleHBvcnRFcnJvciA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2V4cG9ydEVycm9yfTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgc3BhY2VIZWxkPXtzcGFjZUhlbGR9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPERlbW9Nb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBob3RzcG90c1Zpc2libGU9e2hvdHNwb3RzVmlzaWJsZX1cbiAgICAgICAgICBzcGFjZUhlbGQ9e3NwYWNlSGVsZH1cbiAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBjcmVhdGVGbG93UHJvcHMgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBQYWdlSGVhZGVyKHsgdGl0bGUsIHN1YnRpdGxlLCBhY3Rpb25zLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGhlYWRlciBjbGFzc05hbWU9e2B3Zi1wYWdlLWhlYWRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPnt0aXRsZX08L2gxPlxuICAgICAgICB7c3VidGl0bGUgPyA8cD57c3VidGl0bGV9PC9wPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHthY3Rpb25zID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWFjdGlvbnNcIj57YWN0aW9uc308L2Rpdj4gOiBudWxsfVxuICAgIDwvaGVhZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIE5hdmlnYXRpb25MaXN0KHsgYXMsIGl0ZW1zLCBhY3RpdmVJZCwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgYXMsXG4gICAgeyBjbGFzc05hbWUsIC4uLnJlc3QgfSxcbiAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi1uYXYtaXRlbSBpcy1hY3RpdmUnIDogJ3dmLW5hdi1pdGVtJ31cbiAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3Bhbj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICApKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2lkZU5hdih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPE5hdmlnYXRpb25MaXN0XG4gICAgICBhcz1cIm5hdlwiXG4gICAgICBpdGVtcz17aXRlbXN9XG4gICAgICBhY3RpdmVJZD17YWN0aXZlSWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1zaWRlLW5hdiAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYkJhcih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi10YWItYmFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi10YWItaXRlbSBpcy1hY3RpdmUnIDogJ3dmLXRhYi1pdGVtJ31cbiAgICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQnJlYWRjcnVtYnMoeyBpdGVtcyA9IFtdLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi1icmVhZGNydW1icyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gYXJpYS1sYWJlbD1cIkJyZWFkY3J1bWJzXCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YCR7aXRlbS5sYWJlbH0tJHtpbmRleH1gfT5cbiAgICAgICAgICB7aW5kZXggPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1kaXZpZGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtpdGVtLnRvID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX0+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IDxzcGFuPntpdGVtLmxhYmVsfTwvc3Bhbj59XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG4vKiogXHU3OUZCXHU1MkE4XHU3QUVGXHU2NTc0XHU1QzRGXHU1OEYzXHVGRjFBXHU1MTg1XHU1QkI5XHU1MzNBXHU1M0VGXHU2RURBXHVGRjBDVGFiQmFyIFx1OEQzNFx1NUU5NVx1MzAwMnRhYnMgLyBhY3RpdmVJZCBcdTRFMEUgVGFiQmFyIFx1NzZGOFx1NTQwQ1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZVNoZWxsKHsgY2hpbGRyZW4sIHRhYnMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1vYmlsZS1zaGVsbCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwid2YtbW9iaWxlLXNoZWxsLWJvZHlcIj57Y2hpbGRyZW59PC9tYWluPlxuICAgICAge3RhYnMubGVuZ3RoID4gMCA/IDxUYWJCYXIgaXRlbXM9e3RhYnN9IGFjdGl2ZUlkPXthY3RpdmVJZH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIENlbGwoeyB0bywgb25DbGljaywgdGl0bGUsIHN1YnRpdGxlLCB2YWx1ZSwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2VsbCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNlbGwtbWFpblwiPlxuICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAge3N1YnRpdGxlID8gPHNwYW4+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZD5cbiAgICAgICAgICA8dHI+e2NvbHVtbnMubWFwKChjb2x1bW4pID0+IDx0aCBrZXk9e2NvbHVtbi5rZXl9Pntjb2x1bW4ubGFiZWx9PC90aD4pfTwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDx0ciBrZXk9e2dldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4fT5cbiAgICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgICA8dGQga2V5PXtjb2x1bW4ua2V5fT5cbiAgICAgICAgICAgICAgICAgIHtjb2x1bW4ucmVuZGVyID8gY29sdW1uLnJlbmRlcihyb3dbY29sdW1uLmtleV0sIHJvdykgOiByb3dbY29sdW1uLmtleV19XG4gICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFicyh7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBvbkNoYW5nZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFicyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInRhYmxpc3RcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpdGVtLmlkID09PSBhY3RpdmVJZH1cbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2U/LihpdGVtLmlkKX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGVwcyh7XG4gIGl0ZW1zID0gW10sXG4gIGN1cnJlbnQgPSAwLFxuICBkaXJlY3Rpb24gPSAnaG9yaXpvbnRhbCcsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHZlcnRpY2FsID0gZGlyZWN0aW9uID09PSAndmVydGljYWwnXG4gIHJldHVybiAoXG4gICAgPG9sXG4gICAgICBjbGFzc05hbWU9e2B3Zi1zdGVwcyAke3ZlcnRpY2FsID8gJ3dmLXN0ZXBzLXZlcnRpY2FsJyA6ICd3Zi1zdGVwcy1ob3Jpem9udGFsJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBpbmRleCA8IGN1cnJlbnQgPyAnZG9uZScgOiBpbmRleCA9PT0gY3VycmVudCA/ICdjdXJyZW50JyA6ICd0b2RvJ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2B3Zi1zdGVwcy1pdGVtIHdmLXN0ZXBzLWl0ZW0tJHtzdGF0dXN9YH0ga2V5PXtpdGVtLmlkIHx8IGl0ZW0ubGFiZWwgfHwgaW5kZXh9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcC1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAge3N0YXR1cyA9PT0gJ2RvbmUnID8gbnVsbCA6IGluZGV4ICsgMX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7aW5kZXggPCBpdGVtcy5sZW5ndGggLSAxID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGluZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICB7aXRlbS5kZXNjcmlwdGlvbiA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWRlc2NcIj57aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvb2w+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVtcHR5U3RhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGFjdGlvbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZW1wdHktc3RhdGUgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWVtcHR5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge3RpdGxlID8gPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1lbXB0eS10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz4gOiBudWxsfVxuICAgICAge2Rlc2NyaXB0aW9uID8gPHAgY2xhc3NOYW1lPVwid2YtZW1wdHktZGVzY1wiPntkZXNjcmlwdGlvbn08L3A+IDogbnVsbH1cbiAgICAgIHthY3Rpb24gPyA8ZGl2IGNsYXNzTmFtZT1cIndmLWVtcHR5LWFjdGlvblwiPnthY3Rpb259PC9kaXY+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vZm9ybXMuanN4J1xuXG5mdW5jdGlvbiBTY3JlZW5Qb3J0YWwoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGFuY2hvciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbaG9zdCwgc2V0SG9zdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SG9zdChhbmNob3IuY3VycmVudD8uY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JykgfHwgbnVsbClcbiAgfSwgW10pXG5cbiAgaWYgKCFob3N0KSByZXR1cm4gPHNwYW4gcmVmPXthbmNob3J9IGNsYXNzTmFtZT1cIndmLW92ZXJsYXktYW5jaG9yXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbChjaGlsZHJlbiwgaG9zdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vZGFsKHsgb3BlbiwgdGl0bGUsIGNoaWxkcmVuLCBhY3Rpb25zLCBvbkNsb3NlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLW1vZGFsLW92ZXJsYXkgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJwcmVzZW50YXRpb25cIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLW1vZGFsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17dGl0bGV9PlxuICAgICAgICAgIDxoZWFkZXI+XG4gICAgICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICAgIHtvbkNsb3NlID8gPEJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L0J1dHRvbj4gOiBudWxsfVxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kYWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgICAgICB7YWN0aW9ucyA/IDxmb290ZXI+e2FjdGlvbnN9PC9mb290ZXI+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbmZpcm1EaWFsb2coe1xuICBvcGVuLFxuICB0aXRsZSA9ICdcdTc4NkVcdThCQTRcdTY0Q0RcdTRGNUMnLFxuICBtZXNzYWdlLFxuICBjb25maXJtTGFiZWwgPSAnXHU3ODZFXHU4QkE0JyxcbiAgY2FuY2VsTGFiZWwgPSAnXHU1M0Q2XHU2RDg4JyxcbiAgb25Db25maXJtLFxuICBvbkNhbmNlbCxcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8TW9kYWxcbiAgICAgIG9wZW49e29wZW59XG4gICAgICB0aXRsZT17dGl0bGV9XG4gICAgICBvbkNsb3NlPXtvbkNhbmNlbH1cbiAgICAgIGFjdGlvbnM9eyhcbiAgICAgICAgPD5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e29uQ2FuY2VsfT57Y2FuY2VsTGFiZWx9PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9e29uQ29uZmlybX0+e2NvbmZpcm1MYWJlbH08L0J1dHRvbj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgID5cbiAgICAgIDxwPnttZXNzYWdlfTwvcD5cbiAgICA8L01vZGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2FzdCh7IG9wZW4sIGNoaWxkcmVuLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLXRvYXN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwic3RhdHVzXCIgey4uLnJlc3R9PntjaGlsZHJlbn08L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9hZGluZ092ZXJsYXkoeyBvcGVuLCBsYWJlbCA9ICdcdTUyQTBcdThGN0RcdTRFMkQnLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLWxvYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJzdGF0dXNcIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWxvYWRpbmctc2hhcGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3Bhbj57bGFiZWx9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cbiIsICJpbXBvcnQge1xuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBIZWFkaW5nLFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvbGliL3VpL2luZGV4LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gTG9naW5TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJvcmRlci1sb2dpblwiPlxuICAgICAgPENhcmQgY2xhc3NOYW1lPVwib3JkZXItbG9naW4tY2FyZFwiPlxuICAgICAgICA8Q29sdW1uIGdhcD17MTZ9PlxuICAgICAgICAgIDxIZWFkaW5nIGxldmVsPXsxfT5cdThCQTJcdTUzNTVcdTdCQTFcdTc0MDZcdTU0MEVcdTUzRjA8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQ+XHU0RjdGXHU3NTI4XHU2RjE0XHU3OTNBXHU4RDI2XHU1M0Y3XHU4RkRCXHU1MTY1XHU3Q0ZCXHU3RURGXHUzMDAyPC9UZXh0PlxuICAgICAgICAgIDxGb3JtRmllbGQgbGFiZWw9XCJcdThEMjZcdTUzRjdcIiBodG1sRm9yPVwiYWNjb3VudFwiPlxuICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cImFjY291bnRcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1OEQyNlx1NTNGN1wiIC8+XG4gICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgPEZvcm1GaWVsZCBsYWJlbD1cIlx1NUJDNlx1NzgwMVwiIGh0bWxGb3I9XCJwYXNzd29yZFwiPlxuICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cInBhc3N3b3JkXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTVCQzZcdTc4MDFcIiAvPlxuICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiB0bz1cIm9yZGVyLWxpc3RcIj5cdTc2N0JcdTVGNTU8L0J1dHRvbj5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NhcmQ+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBDb2x1bW4sIFNpZGVOYXYgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IHVzZVNjcmVlbklkIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9saWIvY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBBZG1pbkxheW91dCh7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSB1c2VTY3JlZW5JZCgpXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJvcmRlci1zaGVsbFwiPlxuICAgICAgPGFzaWRlPlxuICAgICAgICA8c3Ryb25nPlx1OEJBMlx1NTM1NVx1N0JBMVx1NzQwNjwvc3Ryb25nPlxuICAgICAgICA8U2lkZU5hdlxuICAgICAgICAgIGFjdGl2ZUlkPXtzY3JlZW5JZH1cbiAgICAgICAgICBpdGVtcz17W3sgbGFiZWw6ICdcdThCQTJcdTUzNTVcdTUyMTdcdTg4NjgnLCB0bzogJ29yZGVyLWxpc3QnIH1dfVxuICAgICAgICAvPlxuICAgICAgPC9hc2lkZT5cbiAgICAgIDxDb2x1bW4gZ2FwPXsxNn0gY2xhc3NOYW1lPVwib3JkZXItbWFpblwiPntjaGlsZHJlbn08L0NvbHVtbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBDb25maXJtRGlhbG9nLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFNlbGVjdCxcbiAgVGV4dEFyZWEsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQWRtaW5MYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL0FkbWluTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIE9yZGVyQ2FuY2VsU2NyZWVuKCkge1xuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8QWRtaW5MYXlvdXQ+XG4gICAgICA8UGFnZUhlYWRlciB0aXRsZT1cIlx1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NVwiIHN1YnRpdGxlPVwiXHU4QkEyXHU1MzU1IFNPLTEwMDFcIiAvPlxuICAgICAgPENhcmQ+XG4gICAgICAgIDxDb2x1bW4gZ2FwPXsxNn0+XG4gICAgICAgICAgPEZvcm1GaWVsZCBsYWJlbD1cIlx1NTNENlx1NkQ4OFx1NTM5Rlx1NTZFMFwiIGh0bWxGb3I9XCJyZWFzb25cIj5cbiAgICAgICAgICAgIDxTZWxlY3QgaWQ9XCJyZWFzb25cIiBkZWZhdWx0VmFsdWU9XCJjdXN0b21lclwiPlxuICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiY3VzdG9tZXJcIj5cdTVCQTJcdTYyMzdcdTc1MzNcdThCRjc8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImludmVudG9yeVwiPlx1NUU5M1x1NUI1OFx1NEUwRFx1OERCMzwvb3B0aW9uPlxuICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgPEZvcm1GaWVsZCBsYWJlbD1cIlx1NTkwN1x1NkNFOFwiIGh0bWxGb3I9XCJub3RlXCI+XG4gICAgICAgICAgICA8VGV4dEFyZWEgaWQ9XCJub3RlXCIgcGxhY2Vob2xkZXI9XCJcdTU4NkJcdTUxOTlcdTg4NjVcdTUxNDVcdThCRjRcdTY2MEVcIiAvPlxuICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKHRydWUpfT5cdTYzRDBcdTRFQTRcdTUzRDZcdTZEODg8L0J1dHRvbj5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NhcmQ+XG4gICAgICA8Q29uZmlybURpYWxvZ1xuICAgICAgICBvcGVuPXtvcGVufVxuICAgICAgICB0aXRsZT1cIlx1Nzg2RVx1OEJBNFx1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NVwiXG4gICAgICAgIG1lc3NhZ2U9XCJcdTZCNjRcdTY0Q0RcdTRGNUNcdTVDMDZcdTY2RjRcdTY1QjBcdThCQTJcdTUzNTVcdTcyQjZcdTYwMDFcdTMwMDJcIlxuICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0T3BlbihmYWxzZSl9XG4gICAgICAgIG9uQ29uZmlybT17KCkgPT4gc2V0T3BlbihmYWxzZSl9XG4gICAgICAvPlxuICAgIDwvQWRtaW5MYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQge1xuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgR3JpZCxcbiAgUGFnZUhlYWRlcixcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBZG1pbkxheW91dCB9IGZyb20gJy4uL2xheW91dHMvQWRtaW5MYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gT3JkZXJEZXRhaWxTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFkbWluTGF5b3V0PlxuICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgdGl0bGU9XCJcdThCQTJcdTUzNTUgU08tMTAwMVwiXG4gICAgICAgIHN1YnRpdGxlPVwiXHU1MjFCXHU1RUZBXHU0RThFIDIwMjYtMDgtMDRcIlxuICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIHRvPVwib3JkZXItY2FuY2VsXCI+XHU1M0Q2XHU2RDg4XHU4QkEyXHU1MzU1PC9CdXR0b24+fVxuICAgICAgLz5cbiAgICAgIDxHcmlkIGNvbHVtbnM9ezJ9IGdhcD17MTZ9PlxuICAgICAgICA8Q2FyZD5cbiAgICAgICAgICA8Q29sdW1uIGdhcD17OH0+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NUJBMlx1NjIzN1x1NEZFMVx1NjA2Rjwvc3Ryb25nPlxuICAgICAgICAgICAgPFRleHQ+XHU3OTNBXHU0RjhCXHU1QkEyXHU2MjM3XHU3NTMyPC9UZXh0PlxuICAgICAgICAgICAgPFRleHQ+XHU0RjAxXHU0RTFBXHU1QkEyXHU2MjM3PC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDYXJkPlxuICAgICAgICAgIDxDb2x1bW4gZ2FwPXs4fT5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU4QkEyXHU1MzU1XHU5MUQxXHU5ODlEPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dD4xLDI4MC4wMDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0Plx1NUY4NVx1NjUyRlx1NEVEODwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgPC9HcmlkPlxuICAgIDwvQWRtaW5MYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQge1xuICBCYWRnZSxcbiAgQ2FyZCxcbiAgRGF0YVRhYmxlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFkbWluTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9BZG1pbkxheW91dC5qc3gnXG5cbmNvbnN0IHJvd3MgPSBbXG4gIHsgaWQ6ICdTTy0xMDAxJywgY3VzdG9tZXI6ICdcdTc5M0FcdTRGOEJcdTVCQTJcdTYyMzdcdTc1MzInLCBhbW91bnQ6ICcxLDI4MC4wMCcsIHN0YXR1czogJ1x1NUY4NVx1NTkwNFx1NzQwNicgfSxcbiAgeyBpZDogJ1NPLTEwMDInLCBjdXN0b21lcjogJ1x1NzkzQVx1NEY4Qlx1NUJBMlx1NjIzN1x1NEU1OScsIGFtb3VudDogJzg2MC4wMCcsIHN0YXR1czogJ1x1NTkwNFx1NzQwNlx1NEUyRCcgfSxcbiAgeyBpZDogJ1NPLTEwMDMnLCBjdXN0b21lcjogJ1x1NzkzQVx1NEY4Qlx1NUJBMlx1NjIzN1x1NEUxOScsIGFtb3VudDogJzIsNDAwLjAwJywgc3RhdHVzOiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9LFxuXVxuXG5jb25zdCBjb2x1bW5zID0gW1xuICB7IGtleTogJ2lkJywgbGFiZWw6ICdcdThCQTJcdTUzNTVcdTUzRjcnIH0sXG4gIHsga2V5OiAnY3VzdG9tZXInLCBsYWJlbDogJ1x1NUJBMlx1NjIzNycgfSxcbiAgeyBrZXk6ICdhbW91bnQnLCBsYWJlbDogJ1x1OTFEMVx1OTg5RCcgfSxcbiAgeyBrZXk6ICdzdGF0dXMnLCBsYWJlbDogJ1x1NzJCNlx1NjAwMScsIHJlbmRlcjogKHZhbHVlKSA9PiA8QmFkZ2U+e3ZhbHVlfTwvQmFkZ2U+IH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBPcmRlckxpc3RTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFkbWluTGF5b3V0PlxuICAgICAgPFBhZ2VIZWFkZXIgdGl0bGU9XCJcdThCQTJcdTUzNTVcdTUyMTdcdTg4NjhcIiBzdWJ0aXRsZT1cIlx1NTE3MSAzIFx1Njc2MVx1NkYxNFx1NzkzQVx1NjU3MFx1NjM2RVwiIC8+XG4gICAgICA8Q2FyZCB0bz1cIm9yZGVyLWRldGFpbFwiPlxuICAgICAgICA8SGVhZGluZyBsZXZlbD17M30+XHU1Rjg1XHU1OTA0XHU3NDA2XHU4QkEyXHU1MzU1PC9IZWFkaW5nPlxuICAgICAgICA8VGV4dD5cdTYyNTNcdTVGMDAgU08tMTAwMSBcdThCRTZcdTYwQzU8L1RleHQ+XG4gICAgICA8L0NhcmQ+XG4gICAgICA8RGF0YVRhYmxlIGNvbHVtbnM9e2NvbHVtbnN9IHJvd3M9e3Jvd3N9IC8+XG4gICAgPC9BZG1pbkxheW91dD5cbiAgKVxufVxuIiwgImltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2xvZ2luLmpzeCdcbmltcG9ydCB7IE9yZGVyQ2FuY2VsU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL29yZGVyLWNhbmNlbC5qc3gnXG5pbXBvcnQgeyBPcmRlckRldGFpbFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9vcmRlci1kZXRhaWwuanN4J1xuaW1wb3J0IHsgT3JkZXJMaXN0U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL29yZGVyLWxpc3QuanN4J1xuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ1x1OEJBMlx1NTM1NVx1N0JBMVx1NzQwNlx1NTQwRVx1NTNGMCcsXG4gIHZpZXdwb3J0czoge1xuICAgIGRlc2t0b3A6IHsgd2lkdGg6IDEyODAsIGhlaWdodDogODAwIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ2Rlc2t0b3AnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICdsb2dpbicsXG4gICAgICB0aXRsZTogJ1x1NzY3Qlx1NUY1NScsXG4gICAgICBjb21wb25lbnQ6IExvZ2luU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWydvcmRlci1saXN0J10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdvcmRlci1saXN0JyxcbiAgICAgIHRpdGxlOiAnXHU4QkEyXHU1MzU1XHU1MjE3XHU4ODY4JyxcbiAgICAgIGNvbXBvbmVudDogT3JkZXJMaXN0U2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCcsICdvcmRlci1kZXRhaWwnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ29yZGVyLWRldGFpbCcsXG4gICAgICB0aXRsZTogJ1x1OEJBMlx1NTM1NVx1OEJFNlx1NjBDNScsXG4gICAgICBjb21wb25lbnQ6IE9yZGVyRGV0YWlsU2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCcsICdvcmRlci1jYW5jZWwnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ29yZGVyLWNhbmNlbCcsXG4gICAgICB0aXRsZTogJ1x1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NScsXG4gICAgICBjb21wb25lbnQ6IE9yZGVyQ2FuY2VsU2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBQcm90b3R5cGVQcm92aWRlciB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3ZDLE1BQU07QUFBQSxNQUNOLGFBQWFBLFNBQVE7QUFBQSxNQUNyQixTQUFTO0FBQUEsTUFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLENBQUM7QUFBQSxJQUNaLENBQUM7QUFFRCxVQUFNLFdBQVcsTUFBTSxZQUFZLENBQUMsT0FBTztBQUN6QyxVQUFJLENBQUNBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLE9BQU8sRUFBRSxHQUFHO0FBQ3ZELGNBQU0sSUFBSSxNQUFNLHNCQUFzQixFQUFFLGtCQUFrQjtB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
