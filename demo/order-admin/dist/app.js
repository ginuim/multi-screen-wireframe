/* GENERATED FILE. EDIT src/, THEN RUN BUILD. */
(() => {
  // starter/framework/lib/core/PrototypeContext.jsx
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

  // starter/framework/lib/board/navigation.js
  function clampScale(scale) {
    return Math.min(2, Math.max(0.2, scale));
  }
  function fitDemoScale(containerWidth, containerHeight, contentWidth, contentHeight) {
    if (containerWidth <= 0 || containerHeight <= 0 || contentWidth <= 0 || contentHeight <= 0) {
      return 1;
    }
    return clampScale(Math.min(containerWidth / contentWidth, containerHeight / contentHeight));
  }
  function isDemoBlankExitTarget(target) {
    if (!target || typeof target.closest !== "function") return true;
    return !target.closest(".wf-screen-chrome");
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
  function beginContentDragScroll(event, rootEl, { locked = false, scale = 1 } = {}) {
    if (locked) return null;
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
  function shouldZoomOnWheel(event, { locked = false } = {}) {
    if (locked) return true;
    return !!(event.ctrlKey || event.metaKey);
  }

  // starter/framework/lib/core/ErrorBoundary.jsx
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

  // starter/framework/lib/core/ScreenIdentity.jsx
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

  // starter/framework/lib/ui/flow-target.js
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

  // starter/framework/lib/board/review.js
  var TYPE_LABELS = {
    comment: "\u4FEE\u6539\u5EFA\u8BAE",
    text: "\u4FEE\u6539\u6587\u5B57",
    order: "\u8C03\u6574\u987A\u5E8F",
    remove: "\u5220\u9664\u8282\u70B9"
  };
  function escapeSelectorToken(value) {
    var _a;
    if ((_a = globalThis.CSS) == null ? void 0 : _a.escape) return globalThis.CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
  }
  function escapeAttributeValue(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
  function classesOf(element) {
    if (!(element == null ? void 0 : element.classList)) return [];
    return Array.from(element.classList).filter(Boolean);
  }
  function isBusinessClassName(name) {
    return !!name && !name.startsWith("wf-") && !name.startsWith("is-");
  }
  function selectorScope(screenId) {
    return `[data-screen-id="${escapeAttributeValue(screenId)}"]`;
  }
  function selectorIsUnique(screenRoot, selector) {
    try {
      return screenRoot.querySelectorAll(selector).length === 1;
    } catch (e) {
      return false;
    }
  }
  function elementSegment(element) {
    var _a;
    const tag = (element.tagName || "div").toLowerCase();
    const classes = classesOf(element);
    const business = classes.filter(isBusinessClassName);
    const usable = business.length > 0 ? business : classes.filter((name) => !name.startsWith("is-"));
    const classPart = usable.slice(0, 2).map((name) => `.${escapeSelectorToken(name)}`).join("");
    const key = (_a = element.getAttribute) == null ? void 0 : _a.call(element, "data-wf-key");
    const keyPart = key ? `[data-wf-key="${escapeAttributeValue(key)}"]` : "";
    return `${tag}${classPart}${keyPart}`;
  }
  function buildReviewSelector(element, contentRoot, screenId) {
    var _a;
    if (!element || !contentRoot || !screenId) return "";
    if (element.id) return `#${escapeSelectorToken(element.id)}`;
    const scope = selectorScope(screenId);
    const key = (_a = element.getAttribute) == null ? void 0 : _a.call(element, "data-wf-key");
    const keyPart = key ? `[data-wf-key="${escapeAttributeValue(key)}"]` : "";
    const business = classesOf(element).filter(isBusinessClassName);
    for (const name of business) {
      const local = `.${escapeSelectorToken(name)}${keyPart}`;
      if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`;
    }
    if (business.length > 1) {
      const local = business.map((name) => `.${escapeSelectorToken(name)}`).join("") + keyPart;
      if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`;
    }
    const segments = [];
    let current = element;
    while (current && current !== contentRoot) {
      if (current.id) {
        segments.unshift(`#${escapeSelectorToken(current.id)}`);
        break;
      }
      let segment = elementSegment(current);
      const parent = current.parentElement;
      if (parent && parent !== contentRoot) {
        const peers = Array.from(parent.children || []).filter(
          (item) => item.tagName === current.tagName && elementSegment(item) === segment
        );
        if (peers.length > 1) segment += `:nth-of-type(${peers.indexOf(current) + 1})`;
      }
      segments.unshift(segment);
      const local = segments.join(" > ");
      if (selectorIsUnique(contentRoot, local)) return `${scope} ${local}`;
      current = parent;
    }
    return `${scope} ${segments.join(" > ") || elementSegment(element)}`;
  }
  function displayLabel(element) {
    if (element.id) return `#${element.id}`;
    const classes = classesOf(element);
    const semantic = classes.find(isBusinessClassName) || classes.find((name) => !name.startsWith("is-"));
    return semantic ? `.${semantic}` : (element.tagName || "node").toLowerCase();
  }
  function readText(element) {
    const value = "value" in element && typeof element.value === "string" ? element.value : element.textContent || "";
    const normalized = value.replace(/\s+/g, " ").trim();
    return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
  }
  function findReviewTarget(target, contentRoot) {
    let current = (target == null ? void 0 : target.nodeType) === 1 ? target : target == null ? void 0 : target.parentElement;
    while (current && current !== contentRoot) {
      if (current.id || classesOf(current).length > 0) return current;
      current = current.parentElement;
    }
    return null;
  }
  function describeReviewElement(element, contentRoot, screen) {
    if (!element || !contentRoot || !screen) return null;
    const ancestors = [];
    let current = element;
    while (current && current !== contentRoot) {
      ancestors.unshift({
        element: current,
        label: displayLabel(current),
        selector: buildReviewSelector(current, contentRoot, screen.id)
      });
      current = current.parentElement;
    }
    return {
      element,
      contentRoot,
      screenId: screen.id,
      screenTitle: screen.title,
      sourceHint: `src/screens/${screen.id}.jsx`,
      selector: buildReviewSelector(element, contentRoot, screen.id),
      tagName: (element.tagName || "").toLowerCase(),
      classNames: classesOf(element),
      currentText: readText(element),
      ancestors
    };
  }
  function itemRequest(item) {
    if (item.type === "text") return `\u4FEE\u6539\u4E3A\uFF1A${item.instruction}`;
    if (item.type === "order") return `\u987A\u5E8F\u8981\u6C42\uFF1A${item.instruction}`;
    if (item.type === "remove") return `\u5220\u9664\u8981\u6C42\uFF1A${item.instruction || "\u5220\u9664\u8BE5\u8282\u70B9\uFF0C\u5E76\u540C\u6B65\u6E05\u7406\u65E0\u7528\u4EE3\u7801\u3002"}`;
    return item.instruction;
  }
  function reviewTargets(item) {
    if (Array.isArray(item == null ? void 0 : item.targets) && item.targets.length > 0) return item.targets;
    if (!(item == null ? void 0 : item.selector)) return [];
    return [{
      screenId: item.screenId,
      screenTitle: item.screenTitle,
      sourceHint: item.sourceHint,
      selector: item.selector,
      currentText: item.currentText
    }];
  }
  function buildReviewPrompt(project2, items) {
    const projectName = (project2 == null ? void 0 : project2.name) || "\u672A\u547D\u540D\u7EBF\u6846\u539F\u578B";
    const lines = [
      `\u8BF7\u4FEE\u6539\u7EBF\u6846\u539F\u578B\u300C${projectName}\u300D\u3002`,
      "",
      "\u4FEE\u6539\u7EA6\u675F\uFF1A",
      "- \u53EA\u4FEE\u6539\u4E1A\u52A1 src/\uFF1B\u4E0D\u8981\u4FEE\u6539 framework/ \u6216 dist/app.js\u3002",
      "- \u901A\u8FC7 DOM \u9009\u62E9\u5668\u5728 JSX \u4E2D\u641C\u7D22\u5BF9\u5E94\u7684 id\u3001className \u6216 data-wf-key\u3002",
      "- \u4FDD\u7559\u6240\u6709\u8BED\u4E49 class\u3001\u5173\u952E\u8282\u70B9 id \u548C\u91CD\u590D\u6570\u636E\u8282\u70B9\u7684 data-wf-key\uFF1B\u65B0\u589E\u8282\u70B9\u4E5F\u9075\u5B88\u540C\u4E00\u547D\u540D\u89C4\u5219\u3002",
      "- \u4FEE\u6539 screens/layouts \u65F6\u4FDD\u7559\u300C\u521B\u5EFA\u57FA\u4E8E\u300D\uFF0C\u5E76\u628A\u300C\u4FEE\u6539\u57FA\u4E8E\u300D\u53CA @wireframe-skill \u66F4\u65B0\u4E3A\u5F53\u524D skill \u7248\u672C\u3002",
      "- \u4FDD\u6301 project.links \u4E3A\u9875\u9762\u6D41\u7684\u552F\u4E00\u8FB9\u6570\u636E\uFF1B\u5B8C\u6210\u540E\u91CD\u65B0\u6784\u5EFA\u5E76\u9A8C\u8BC1\u753B\u677F\u3001\u6F14\u793A\u548C\u5BA1\u9605\u6A21\u5F0F\u3002"
    ];
    if (!(items == null ? void 0 : items.length)) {
      lines.push("", "\u5F53\u524D\u6CA1\u6709\u5BA1\u9605\u610F\u89C1\u3002");
      return lines.join("\n");
    }
    items.forEach((item, itemIndex) => {
      const targets = reviewTargets(item);
      lines.push("", `## \u4FEE\u6539 ${itemIndex + 1}\uFF1A${TYPE_LABELS[item.type] || TYPE_LABELS.comment}`);
      targets.forEach((target, targetIndex) => {
        const screenId = target.screenId || item.screenId;
        lines.push(
          "",
          `\u76EE\u6807 ${targetIndex + 1}\uFF1A${target.screenTitle || item.screenTitle || screenId || "\u672A\u547D\u540D\u9875\u9762"}`,
          `\u9875\u9762 ID\uFF1A${screenId || "\u672A\u77E5"}`,
          `\u6E90\u7801\u63D0\u793A\uFF1A${target.sourceHint || item.sourceHint || (screenId ? `src/screens/${screenId}.jsx` : "\u8BF7\u641C\u7D22\u9009\u62E9\u5668")}`,
          "DOM \u9009\u62E9\u5668\uFF1A",
          `\`${target.selector}\``
        );
        if (target.currentText) lines.push("", "\u5F53\u524D\u5185\u5BB9\uFF1A", target.currentText);
      });
      lines.push("", "\u4FEE\u6539\u8981\u6C42\uFF1A", itemRequest(item));
    });
    lines.push(
      "",
      "## \u5B8C\u6210\u6807\u51C6",
      "- \u9010\u9879\u5B8C\u6210\u4EE5\u4E0A\u4FEE\u6539\uFF1B\u82E5\u9009\u62E9\u5668\u5BF9\u5E94\u5171\u4EAB layout\uFF0C\u8BF7\u4FEE\u6539\u771F\u5B9E\u5B9A\u4E49\u4F4D\u7F6E\uFF0C\u4E0D\u8981\u5728 screen \u4E2D\u590D\u5236\u5B9E\u73B0\u3002",
      "- \u4E0D\u7528 DOM \u5C42\u7EA7\u6216 nth-child \u66FF\u4EE3\u5DF2\u6709\u7684\u7A33\u5B9A\u4E1A\u52A1\u9009\u62E9\u5668\u3002",
      "- \u6784\u5EFA\u6210\u529F\u540E\u68C0\u67E5\u53D7\u5F71\u54CD\u9875\u9762\u53CA\u5176\u4E0A\u4E0B\u6E38\u8DF3\u8F6C\u3002"
    );
    return lines.join("\n");
  }
  var REVIEW_TYPE_LABELS = TYPE_LABELS;

  // starter/framework/lib/board/expand.js
  var STYLE_KEYS = [
    "width",
    "height",
    "minWidth",
    "minHeight",
    "overflow",
    "overflowX",
    "overflowY",
    "maxWidth",
    "maxHeight"
  ];
  function isExpandableOverflowNode(el) {
    if (!el || el.nodeType !== 1) return false;
    const style = window.getComputedStyle(el);
    const canY = isScrollableOverflow(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
    const canX = isScrollableOverflow(style.overflowX) && el.scrollWidth > el.clientWidth + 1;
    return canY || canX;
  }
  function depthFrom(rootEl, el) {
    let depth = 0;
    let node = el;
    while (node && node !== rootEl) {
      depth += 1;
      node = node.parentElement;
    }
    return depth;
  }
  function listExpandableNodes(rootEl) {
    if (!rootEl) return [];
    const scrollables = [];
    const visit = (node) => {
      const children = node.children ? Array.from(node.children) : [];
      for (const child of children) visit(child);
      if (node === rootEl || isExpandableOverflowNode(node)) scrollables.push(node);
    };
    visit(rootEl);
    const set = new Set(scrollables);
    for (const el of scrollables) {
      if (el === rootEl) continue;
      let node = el.parentElement;
      while (node) {
        set.add(node);
        if (node === rootEl) break;
        node = node.parentElement;
      }
    }
    return [...set].sort((a, b) => depthFrom(rootEl, b) - depthFrom(rootEl, a));
  }
  function snapshotInlineBox(el) {
    const out = {};
    for (const key of STYLE_KEYS) out[key] = el.style[key] || "";
    return out;
  }
  function restoreInlineBox(el, snapshot) {
    for (const key of STYLE_KEYS) {
      el.style[key] = snapshot[key] || "";
    }
  }
  function childStartWithin(el, child, axis) {
    const offsetKey = axis === "x" ? "offsetLeft" : "offsetTop";
    const rectStart = axis === "x" ? "left" : "top";
    const rectSize = axis === "x" ? "width" : "height";
    const layoutSize = axis === "x" ? "offsetWidth" : "offsetHeight";
    const scrollKey = axis === "x" ? "scrollLeft" : "scrollTop";
    const childOffset = child[offsetKey] || 0;
    if (child.offsetParent === el) return childOffset;
    if (child.offsetParent && child.offsetParent === el.offsetParent) {
      return childOffset - (el[offsetKey] || 0);
    }
    if (typeof el.getBoundingClientRect === "function" && typeof child.getBoundingClientRect === "function") {
      const parentRect = el.getBoundingClientRect();
      const childRect = child.getBoundingClientRect();
      const renderedSize = parentRect[rectSize];
      const scale = el[layoutSize] > 0 && renderedSize > 0 ? renderedSize / el[layoutSize] : 1;
      const start = (childRect[rectStart] - parentRect[rectStart]) / scale + (el[scrollKey] || 0);
      if (Number.isFinite(start)) return start;
    }
    return childOffset;
  }
  function measureIntrinsicBox(el) {
    let width = Math.max(el.scrollWidth || 0, el.offsetWidth || 0);
    let height = Math.max(el.scrollHeight || 0, el.offsetHeight || 0);
    const children = el.children ? Array.from(el.children) : [];
    for (const child of children) {
      width = Math.max(width, childStartWithin(el, child, "x") + (child.offsetWidth || 0));
      height = Math.max(height, childStartWithin(el, child, "y") + (child.offsetHeight || 0));
    }
    return { width, height };
  }
  function applyExpandedBox(el) {
    el.style.maxWidth = "none";
    el.style.maxHeight = "none";
    el.style.overflow = "visible";
    el.style.overflowX = "visible";
    el.style.overflowY = "visible";
    const { width, height } = measureIntrinsicBox(el);
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.minWidth = `${width}px`;
    el.style.minHeight = `${height}px`;
  }
  function expandScreenContent(rootEl) {
    const nodes = listExpandableNodes(rootEl);
    const snapshots = nodes.map((el) => ({ el, style: snapshotInlineBox(el) }));
    for (const { el } of snapshots) applyExpandedBox(el);
    applyExpandedBox(rootEl);
    return snapshots;
  }
  function collapseScreenContent(snapshots) {
    if (!Array.isArray(snapshots)) return;
    for (const { el, style } of snapshots) restoreInlineBox(el, style);
  }
  function measureContentBox(rootEl) {
    return measureIntrinsicBox(rootEl);
  }
  function resolveExpandTargets(selectedIds, allIds) {
    if (selectedIds instanceof Set) {
      if (selectedIds.size > 0) return [...selectedIds];
    } else if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      return [...selectedIds];
    }
    return [...allIds];
  }

  // starter/framework/lib/board/ScreenFrame.jsx
  function ScreenFrame({
    screen,
    viewport,
    mode,
    index = 0,
    focused = false,
    onExport,
    expanded = false,
    onToggleExpand,
    canvasLocked = false,
    scale = 1,
    reviewEnabled = false,
    onReviewSelect
  }) {
    const { navigate } = usePrototype();
    const contentRef = React.useRef(null);
    const dragRef = React.useRef(null);
    const expandSnapshotRef = React.useRef(null);
    const hoverReviewElementRef = React.useRef(null);
    const [dragScrolling, setDragScrolling] = React.useState(false);
    const [expandedBox, setExpandedBox] = React.useState(null);
    React.useLayoutEffect(() => {
      const root = contentRef.current;
      if (!root || !screen) return void 0;
      if (expandSnapshotRef.current) {
        collapseScreenContent(expandSnapshotRef.current);
        expandSnapshotRef.current = null;
      }
      if (!expanded) {
        setExpandedBox(null);
        return void 0;
      }
      expandSnapshotRef.current = expandScreenContent(root);
      setExpandedBox(measureContentBox(root));
      return () => {
        if (expandSnapshotRef.current) {
          collapseScreenContent(expandSnapshotRef.current);
          expandSnapshotRef.current = null;
        }
      };
    }, [expanded, screen == null ? void 0 : screen.id, viewport.width, viewport.height]);
    React.useEffect(() => {
      var _a;
      if (!reviewEnabled) {
        (_a = hoverReviewElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
        hoverReviewElementRef.current = null;
      }
      return () => {
        var _a2;
        (_a2 = hoverReviewElementRef.current) == null ? void 0 : _a2.classList.remove("is-review-hovered");
        hoverReviewElementRef.current = null;
      };
    }, [reviewEnabled, screen == null ? void 0 : screen.id]);
    if (!screen) return null;
    const Component = screen.component;
    const frameClass = [
      "wf-screen-chrome",
      mode === "canvas" && focused ? "is-focused" : "",
      expanded ? "is-expanded" : "",
      `wf-screen-${mode}`
    ].filter(Boolean).join(" ");
    const onPointerDown = (event) => {
      if (reviewEnabled) return;
      if (canvasLocked) {
        event.preventDefault();
        return;
      }
      if (expanded) return;
      const state = beginContentDragScroll(event, contentRef.current, { locked: canvasLocked, scale });
      if (!state) return;
      dragRef.current = state;
      setDragScrolling(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
      var _a;
      if (reviewEnabled) {
        const target = findReviewTarget(event.target, contentRef.current);
        if (target === hoverReviewElementRef.current) return;
        (_a = hoverReviewElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
        target == null ? void 0 : target.classList.add("is-review-hovered");
        hoverReviewElementRef.current = target;
        return;
      }
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
      if (reviewEnabled) return;
      handleDelegatedFlowClick(event, contentRef.current, navigate);
    };
    const onReviewClick = (event) => {
      if (!reviewEnabled) return;
      const target = findReviewTarget(event.target, contentRef.current);
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      onReviewSelect == null ? void 0 : onReviewSelect(target, screen, contentRef.current, {
        additive: event.shiftKey || event.metaKey || event.ctrlKey
      });
    };
    const clearReviewHover = () => {
      var _a;
      (_a = hoverReviewElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
      hoverReviewElementRef.current = null;
    };
    const contentStyle = expanded && expandedBox ? { width: expandedBox.width, height: expandedBox.height, overflow: "visible" } : { width: viewport.width, height: viewport.height };
    const frameWidth = expanded && expandedBox ? expandedBox.width : viewport.width;
    return /* @__PURE__ */ React.createElement(
      "section",
      {
        className: frameClass,
        "data-screen-id": screen.id,
        "data-expanded": expanded ? "true" : "false",
        style: { width: frameWidth }
      },
      /* @__PURE__ */ React.createElement("div", { className: "wf-screen-chrome-label" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-title" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-index-num" }, index + 1), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-screen-title" }, screen.title), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-file" }, screen.id, ".jsx")), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-actions" }, onToggleExpand ? /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-expand-one",
          onClick: (event) => {
            event.stopPropagation();
            onToggleExpand();
          }
        },
        expanded ? "\u6536\u8D77" : "\u5C55\u5F00"
      ) : null, mode === "canvas" && onExport ? /* @__PURE__ */ React.createElement(
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
      ) : null)),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: contentRef,
          className: `wf-screen-content${dragScrolling ? " is-drag-scrolling" : ""}${expanded ? " is-expanded" : ""}${reviewEnabled ? " is-reviewing" : ""}`,
          style: contentStyle,
          onPointerDown,
          onPointerMove,
          onPointerUp: onPointerEnd,
          onPointerCancel: onPointerEnd,
          onPointerLeave: clearReviewHover,
          onClickCapture: onReviewClick,
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

  // starter/framework/lib/board/useWheelZoom.js
  function bindWheelZoom(el, getScale, setScale, getLocked = () => false) {
    if (!el) return () => {
    };
    const onWheel = (event) => {
      if (!shouldZoomOnWheel(event, { locked: getLocked() })) return;
      event.preventDefault();
      setScale(clampScale(getScale() * (event.deltaY > 0 ? 0.9 : 1.1)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }
  function useWheelZoom(elementRef, scale, setScale, locked = false) {
    const scaleRef = React.useRef(scale);
    const lockedRef = React.useRef(locked);
    scaleRef.current = scale;
    lockedRef.current = locked;
    React.useEffect(
      () => bindWheelZoom(
        elementRef.current,
        () => scaleRef.current,
        setScale,
        () => lockedRef.current
      ),
      [elementRef, setScale]
    );
  }

  // starter/framework/lib/board/validation.js
  function canUseDemo(screens) {
    return Array.isArray(screens) && screens.some((screen) => screen.entry === true);
  }

  // starter/framework/lib/board/CanvasMode.jsx
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
    canvasLocked,
    selectedIds,
    setSelectedIds,
    expandedIds = /* @__PURE__ */ new Set(),
    onToggleExpand,
    onExportIds,
    reviewEnabled = false,
    onReviewSelect
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
    useWheelZoom(canvasRef, scale, setScale, canvasLocked);
    const startPan = (event) => {
      if (!canvasLocked) return;
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
      if (!demoAvailable || canvasLocked) return;
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
    ))), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tips", "aria-label": "\u64CD\u4F5C\u63D0\u793A" }, /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("span", null, "\u4E0D\u53EF\u4EA4\u4E92\uFF1A\u62D6\u62FD\u5E73\u79FB / \u6EDA\u8F6E\u7F29\u653E")), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("span", null, "\u53EF\u4EA4\u4E92\uFF1A\u7A7A\u683C\u62D6\u62FD / Ctrl+\u6EDA\u8F6E")))), /* @__PURE__ */ React.createElement(
      "main",
      {
        ref: canvasRef,
        className: `wf-canvas${dragging ? " is-dragging" : ""}${canvasLocked ? " is-locked" : ""}`,
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
                if (event.target.closest(".wf-export-one, .wf-expand-one, .wf-screen-meta-copy")) return;
                navigate(screen.id);
              },
              onDoubleClick: (event) => {
                if (event.target.closest(".wf-export-one, .wf-expand-one, .wf-screen-meta-copy")) return;
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
                expanded: expandedIds.has(screen.id),
                onToggleExpand: () => onToggleExpand(screen.id),
                onExport: () => onExportIds([screen.id]),
                canvasLocked,
                scale: view.scale,
                reviewEnabled,
                onReviewSelect
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

  // starter/framework/lib/board/DemoMode.jsx
  var BLANK_EXIT_HINT = "\u53CC\u51FB\u7A7A\u767D\u5904\u9000\u51FA\u6F14\u793A";
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
    canvasLocked,
    scale,
    setScale,
    viewResetKey,
    expandedIds = /* @__PURE__ */ new Set(),
    onToggleExpand,
    reviewEnabled = false,
    onReviewSelect
  }) {
    const { currentScreenId, viewport, viewportKey, setMode } = usePrototype();
    const screenIndex = project2.screens.findIndex((item) => item.id === currentScreenId);
    const screen = screenIndex >= 0 ? project2.screens[screenIndex] : null;
    const currentExpanded = !!(screen && expandedIds.has(screen.id));
    const [view, setView] = React.useState(() => ({ ...resetCanvasViewport(), scale }));
    const [dragging, setDragging] = React.useState(false);
    const drag = React.useRef(null);
    const viewportRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const exitOnBlankDoubleClick = (event) => {
      if (!isDemoBlankExitTarget(event.target)) return;
      setMode("canvas");
    };
    const syncBlankExitHint = (event) => {
      const el = viewportRef.current;
      if (!el) return;
      const next = isDemoBlankExitTarget(event.target) ? BLANK_EXIT_HINT : "";
      if ((el.getAttribute("title") || "") === next) return;
      if (next) el.setAttribute("title", next);
      else el.removeAttribute("title");
    };
    const clearBlankExitHint = () => {
      var _a;
      (_a = viewportRef.current) == null ? void 0 : _a.removeAttribute("title");
    };
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
      const stage = stageRef.current;
      if (!container || typeof ResizeObserver !== "function") {
        applyFit();
        return void 0;
      }
      const observer = new ResizeObserver(() => applyFit());
      observer.observe(container);
      if (stage) observer.observe(stage);
      applyFit();
      return () => observer.disconnect();
    }, [applyFit, viewport, viewportKey, currentScreenId, viewResetKey, currentExpanded]);
    useWheelZoom(viewportRef, scale, setScale, canvasLocked);
    const startPan = (event) => {
      if (!canvasLocked) return;
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
        className: `wf-demo-viewport${dragging ? " is-dragging" : ""}${canvasLocked ? " is-locked" : ""}`,
        onPointerDown: startPan,
        onPointerMove: movePan,
        onPointerUp: endPan,
        onPointerCancel: endPan,
        onMouseMove: syncBlankExitHint,
        onMouseLeave: clearBlankExitHint,
        onDoubleClick: exitOnBlankDoubleClick
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
            expanded: currentExpanded,
            onToggleExpand: screen && onToggleExpand ? () => onToggleExpand(screen.id) : void 0,
            canvasLocked,
            scale: view.scale,
            reviewEnabled,
            onReviewSelect
          }
        )
      )
    ), /* @__PURE__ */ React.createElement("p", { className: "wf-demo-hint" }, "\u70B9\u51FB\u9875\u9762\u5185\u6309\u94AE / \u94FE\u63A5\u8DF3\u8F6C\uFF1B\u53EF\u5728\u5DE5\u5177\u680F\u5F00\u5173\u70ED\u533A\u9AD8\u4EAE\uFF1B\u6807\u9898\u680F\u53EF\u4E34\u65F6\u5C55\u5F00\u770B\u5168\u8C8C"));
  }

  // starter/framework/lib/board/export.js
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
  async function captureScreen(screenElement, viewport, { expanded = false } = {}) {
    if (!screenElement) throw new Error("\u627E\u4E0D\u5230\u8981\u5BFC\u51FA\u7684 screen \u5143\u7D20");
    await loadExportLibraries();
    const sandbox = document.createElement("div");
    sandbox.className = "wf-export-sandbox";
    const clone = screenElement.cloneNode(true);
    sandbox.appendChild(clone);
    document.body.appendChild(sandbox);
    let width = viewport.width;
    let height = viewport.height;
    try {
      if (expanded) {
        expandScreenContent(clone);
        const box = measureContentBox(clone);
        width = box.width;
        height = box.height;
      }
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      sandbox.style.width = `${width}px`;
      sandbox.style.height = `${height}px`;
      const canvas = await window.html2canvas(clone, {
        backgroundColor: "#ffffff",
        width,
        height,
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
        blob: await captureScreen(screen.element, screen.viewport, {
          expanded: !!screen.expanded
        })
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

  // starter/framework/lib/board/ReviewPanel.jsx
  function copyText2(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
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
  function ReviewPanel({
    project: project2,
    selections,
    multiSelect,
    items,
    onToggleMultiSelect,
    onSelectElement,
    onRemoveSelection,
    onClearSelection,
    onAddItem,
    onRemoveItem,
    onClose
  }) {
    const selected = selections[selections.length - 1] || null;
    const generatedPrompt = React.useMemo(() => buildReviewPrompt(project2, items), [project2, items]);
    const [type, setType] = React.useState("comment");
    const [instruction, setInstruction] = React.useState("");
    const [prompt, setPrompt] = React.useState(generatedPrompt);
    const [promptDirty, setPromptDirty] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const copyTimer = React.useRef(null);
    React.useEffect(() => {
      if (!promptDirty) setPrompt(generatedPrompt);
    }, [generatedPrompt, promptDirty]);
    React.useEffect(() => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    }, []);
    const addItem = () => {
      if (selections.length === 0) return;
      const normalized = instruction.trim();
      if (!normalized && type !== "remove") return;
      onAddItem({
        type,
        targets: selections.map((selection) => ({
          screenId: selection.screenId,
          screenTitle: selection.screenTitle,
          sourceHint: selection.sourceHint,
          selector: selection.selector,
          currentText: selection.currentText
        })),
        instruction: normalized
      });
      setInstruction("");
    };
    const regenerate = () => {
      setPrompt(generatedPrompt);
      setPromptDirty(false);
    };
    const copyPrompt = () => {
      copyText2(prompt).then(() => {
        setCopied(true);
        if (copyTimer.current) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 1400);
      });
    };
    const instructionLabel = type === "text" ? "\u65B0\u6587\u5B57" : type === "order" ? "\u987A\u5E8F\u8981\u6C42" : type === "remove" ? "\u5220\u9664\u8BF4\u660E\uFF08\u53EF\u9009\uFF09" : "\u7ED9 AI \u7684\u4FEE\u6539\u5EFA\u8BAE";
    return /* @__PURE__ */ React.createElement("aside", { className: "wf-review-panel", "aria-label": "\u539F\u578B\u5BA1\u9605" }, /* @__PURE__ */ React.createElement("header", { className: "wf-review-panel-header" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-heading" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-panel-title" }, "\u5BA1\u9605\u539F\u578B"), /* @__PURE__ */ React.createElement("span", { className: "wf-review-panel-count" }, items.length, " \u6761\u4FEE\u6539")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-close", onClick: onClose }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-body" }, /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-heading" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u5DF2\u9009\u8282\u70B9 (", selections.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-actions" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: multiSelect ? "wf-review-multi-select is-active" : "wf-review-multi-select",
        "aria-pressed": multiSelect,
        onClick: onToggleMultiSelect
      },
      "\u591A\u9009 ",
      multiSelect ? "ON" : "OFF"
    ), selections.length > 0 ? /* @__PURE__ */ React.createElement("button", { className: "wf-review-clear-selection", type: "button", onClick: onClearSelection }, "\u6E05\u7A7A") : null)), /* @__PURE__ */ React.createElement("p", { className: "wf-review-selection-hint" }, "\u591A\u9009\u5F00\u542F\u540E\u70B9\u51FB\u8282\u70B9\u53EF\u52A0\u5165\u6216\u79FB\u9664\uFF1B\u4E5F\u53EF\u6309\u4F4F Shift / Command / Ctrl \u70B9\u51FB\u3002"), selections.length > 0 ? /* @__PURE__ */ React.createElement("ol", { className: "wf-review-selections" }, selections.map((selection, index) => /* @__PURE__ */ React.createElement("li", { className: selection === selected ? "wf-review-selection is-active" : "wf-review-selection", key: `${selection.screenId}:${selection.selector}` }, /* @__PURE__ */ React.createElement("code", { className: "wf-review-selection-selector" }, index + 1, ". ", selection.selector), /* @__PURE__ */ React.createElement("button", { className: "wf-review-selection-remove", type: "button", onClick: () => onRemoveSelection(selection.element) }, "\u79FB\u9664")))) : null, selected ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wf-review-screen-name" }, selected.screenTitle, " \xB7 ", selected.screenId), /* @__PURE__ */ React.createElement("div", { className: "wf-review-breadcrumbs", "aria-label": "\u8282\u70B9\u5C42\u7EA7" }, selected.ancestors.map((ancestor) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "wf-review-breadcrumb",
        type: "button",
        key: ancestor.selector,
        title: ancestor.selector,
        onClick: () => onSelectElement(ancestor.element)
      },
      ancestor.label
    ))), /* @__PURE__ */ React.createElement("code", { className: "wf-review-selector" }, selected.selector), selected.currentText ? /* @__PURE__ */ React.createElement("p", { className: "wf-review-current-text" }, "\u5F53\u524D\uFF1A", selected.currentText) : null, /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, "\u4FEE\u6539\u7C7B\u578B"), /* @__PURE__ */ React.createElement("select", { className: "wf-review-type-select", value: type, onChange: (event) => setType(event.target.value) }, Object.entries(REVIEW_TYPE_LABELS).map(([value, label]) => /* @__PURE__ */ React.createElement("option", { className: "wf-review-type-option", value, key: value }, label)))), /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, instructionLabel), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "wf-review-instruction",
        value: instruction,
        placeholder: type === "order" ? "\u4F8B\u5982\uFF1A\u79FB\u52A8\u5230\u8BA2\u5355\u6458\u8981\u4E4B\u540E" : "\u63CF\u8FF0\u5E0C\u671B AI \u5982\u4F55\u4FEE\u6539",
        onChange: (event) => setInstruction(event.target.value)
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "wf-review-add",
        disabled: !instruction.trim() && type !== "remove",
        onClick: addItem
      },
      "\u52A0\u5165\u4FEE\u6539\u6E05\u5355\uFF08",
      selections.length,
      " \u4E2A\u8282\u70B9\uFF09"
    )) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u70B9\u51FB\u9875\u9762\u4E2D\u7684\u8282\u70B9\u5F00\u59CB\u8BC4\u8BBA\u3002\u70B9\u51FB\u9762\u5305\u5C51\u53EF\u5207\u6362\u5230\u7236\u7EA7\u7EC4\u4EF6\u3002")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u4FEE\u6539\u6E05\u5355"), items.length > 0 ? /* @__PURE__ */ React.createElement("ol", { className: "wf-review-items" }, items.map((item, index) => /* @__PURE__ */ React.createElement("li", { className: "wf-review-item", key: item.id }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-item-content" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-item-title" }, index + 1, ". ", REVIEW_TYPE_LABELS[item.type]), /* @__PURE__ */ React.createElement("code", { className: "wf-review-item-selector" }, reviewTargets(item).map((target) => target.selector).join("\u3001")), /* @__PURE__ */ React.createElement("p", { className: "wf-review-item-instruction" }, item.instruction || "\u5220\u9664\u8BE5\u8282\u70B9\uFF0C\u5E76\u540C\u6B65\u6E05\u7406\u65E0\u7528\u4EE3\u7801\u3002")), /* @__PURE__ */ React.createElement("button", { className: "wf-review-item-delete", type: "button", onClick: () => onRemoveItem(item.id) }, "\u5220\u9664")))) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u8FD8\u6CA1\u6709\u4FEE\u6539\u610F\u89C1\u3002")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section wf-review-prompt-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-section-title" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u6700\u7EC8 Prompt"), /* @__PURE__ */ React.createElement("button", { className: "wf-review-regenerate", type: "button", onClick: regenerate }, "\u91CD\u65B0\u751F\u6210")), promptDirty ? /* @__PURE__ */ React.createElement("p", { className: "wf-review-manual" }, "Prompt \u5DF2\u624B\u52A8\u4FEE\u6539\uFF1B\u91CD\u65B0\u751F\u6210\u4F1A\u8986\u76D6\u624B\u52A8\u5185\u5BB9\u3002") : null, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "wf-review-prompt",
        value: prompt,
        onChange: (event) => {
          setPrompt(event.target.value);
          setPromptDirty(true);
        }
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-copy", onClick: copyPrompt }, copied ? "\u5DF2\u590D\u5236" : "\u590D\u5236 Prompt"))));
  }

  // starter/framework/lib/board/ReviewMarkers.jsx
  function samePositions(left, right) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => {
      const other = right[index];
      return item.key === other.key && item.item === other.item && item.itemIndex === other.itemIndex && item.left === other.left && item.top === other.top;
    });
  }
  function intersectRect(rect, clip) {
    const left = Math.max(rect.left, clip.left);
    const right = Math.min(rect.right, clip.right);
    const top = Math.max(rect.top, clip.top);
    const bottom = Math.min(rect.bottom, clip.bottom);
    if (right <= left || bottom <= top) return null;
    return { left, right, top, bottom };
  }
  function resolvePositions(board, items) {
    if (!board) return [];
    const boardRect = board.getBoundingClientRect();
    const positions = [];
    items.forEach((item, itemIndex) => {
      reviewTargets(item).forEach((target, targetIndex) => {
        let element = null;
        try {
          element = board.querySelector(target.selector);
        } catch (e) {
          return;
        }
        if (!(element == null ? void 0 : element.isConnected)) return;
        const screenContent = element.closest(".wf-screen-content");
        if (!screenContent) return;
        const visible = intersectRect(element.getBoundingClientRect(), screenContent.getBoundingClientRect());
        if (!visible) return;
        const baseLeft = Math.round(visible.right - boardRect.left);
        const baseTop = Math.round(visible.top - boardRect.top);
        const overlapCount = positions.filter(
          (position) => Math.abs(position.baseLeft - baseLeft) < 2 && Math.abs(position.baseTop - baseTop) < 2
        ).length;
        positions.push({
          key: `${item.id}:${targetIndex}`,
          item,
          itemIndex,
          targetIndex,
          baseLeft,
          baseTop,
          left: baseLeft + overlapCount * 15,
          top: baseTop
        });
      });
    });
    return positions;
  }
  function ReviewMarkers({ boardRef, items }) {
    var _a, _b;
    const [positions, setPositions] = React.useState([]);
    const [activeKey, setActiveKey] = React.useState(null);
    const frameRef = React.useRef(null);
    const refresh = React.useCallback(() => {
      const next = resolvePositions(boardRef.current, items);
      setPositions((current) => samePositions(current, next) ? current : next);
    }, [boardRef, items]);
    const scheduleRefresh = React.useCallback(() => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        refresh();
      });
    }, [refresh]);
    React.useLayoutEffect(scheduleRefresh);
    React.useEffect(() => {
      const options = { capture: true, passive: true };
      window.addEventListener("resize", scheduleRefresh);
      window.addEventListener("scroll", scheduleRefresh, options);
      window.addEventListener("pointermove", scheduleRefresh, options);
      window.addEventListener("wheel", scheduleRefresh, options);
      window.addEventListener("click", scheduleRefresh, true);
      return () => {
        window.removeEventListener("resize", scheduleRefresh);
        window.removeEventListener("scroll", scheduleRefresh, options);
        window.removeEventListener("pointermove", scheduleRefresh, options);
        window.removeEventListener("wheel", scheduleRefresh, options);
        window.removeEventListener("click", scheduleRefresh, true);
        if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      };
    }, [scheduleRefresh]);
    React.useEffect(() => {
      if (activeKey && !positions.some((position) => position.key === activeKey)) setActiveKey(null);
    }, [activeKey, positions]);
    const active = positions.find((position) => position.key === activeKey);
    const boardWidth = ((_a = boardRef.current) == null ? void 0 : _a.clientWidth) || 0;
    const boardHeight = ((_b = boardRef.current) == null ? void 0 : _b.clientHeight) || 0;
    const bubbleLeft = active ? Math.max(12, Math.min(active.left + 16, boardWidth - 336)) : 0;
    const bubbleTop = active ? Math.max(12, Math.min(active.top + 24, boardHeight - 180)) : 0;
    return /* @__PURE__ */ React.createElement("div", { className: "wf-review-markers", "aria-label": "\u5BA1\u9605\u6807\u8BB0" }, positions.map((position) => /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: activeKey === position.key ? "wf-review-marker is-active" : "wf-review-marker",
        key: position.key,
        "aria-label": `\u4FEE\u6539 ${position.itemIndex + 1}\uFF1A${REVIEW_TYPE_LABELS[position.item.type]}`,
        style: { left: position.left, top: position.top },
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveKey((current) => current === position.key ? null : position.key);
        }
      },
      position.itemIndex + 1
    )), active ? /* @__PURE__ */ React.createElement(
      "aside",
      {
        className: "wf-review-marker-popover",
        style: { left: bubbleLeft, top: bubbleTop },
        "aria-label": `\u4FEE\u6539 ${active.itemIndex + 1}`
      },
      /* @__PURE__ */ React.createElement("header", { className: "wf-review-marker-popover-header" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-marker-popover-title" }, active.itemIndex + 1, ". ", REVIEW_TYPE_LABELS[active.item.type]), /* @__PURE__ */ React.createElement("button", { className: "wf-review-marker-popover-close", type: "button", onClick: () => setActiveKey(null) }, "\u5173\u95ED")),
      /* @__PURE__ */ React.createElement("p", { className: "wf-review-marker-popover-instruction" }, active.item.instruction || "\u5220\u9664\u8BE5\u8282\u70B9\uFF0C\u5E76\u540C\u6B65\u6E05\u7406\u65E0\u7528\u4EE3\u7801\u3002"),
      /* @__PURE__ */ React.createElement("div", { className: "wf-review-marker-popover-targets" }, reviewTargets(active.item).map((target) => /* @__PURE__ */ React.createElement("code", { className: "wf-review-marker-popover-selector", key: target.selector }, target.selector)))
    ) : null);
  }

  // starter/framework/lib/board/Board.jsx
  var VIEWPORT_LABELS = {
    mobile: "\u624B\u673A",
    desktop: "\u684C\u9762"
  };
  function ZoomControls({ scale, setScale, onReset }) {
    return /* @__PURE__ */ React.createElement("div", { className: "wf-zoom-controls" }, /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u7F29\u5C0F", onClick: () => setScale((value) => clampScale(value - 0.1)) }, "-"), /* @__PURE__ */ React.createElement("span", { className: "wf-zoom-value" }, Math.round(scale * 100), "%"), /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u653E\u5927", onClick: () => setScale((value) => clampScale(value + 0.1)) }, "+"), /* @__PURE__ */ React.createElement("button", { type: "button", title: "\u91CD\u7F6E\u7F29\u653E", onClick: onReset }, "\u590D\u4F4D"));
  }
  function ToolbarIcon({ name }) {
    const paths = {
      review: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1" }), /* @__PURE__ */ React.createElement("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }), /* @__PURE__ */ React.createElement("path", { d: "m9 14 2 2 4-4" })),
      fullscreen: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }), /* @__PURE__ */ React.createElement("path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }), /* @__PURE__ */ React.createElement("path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }), /* @__PURE__ */ React.createElement("path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" })),
      expand: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m17 11-5-5-5 5" }), /* @__PURE__ */ React.createElement("path", { d: "m17 18-5-5-5 5" })),
      collapse: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m7 13 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "m7 6 5 5 5-5" })),
      download: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 3v12" }), /* @__PURE__ */ React.createElement("path", { d: "m7 10 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 21h14" }))
    };
    return /* @__PURE__ */ React.createElement("svg", { className: "wf-toolbar-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, paths[name]);
  }
  function LockIcon({ open }) {
    return /* @__PURE__ */ React.createElement("svg", { className: "wf-lock-icon", viewBox: "0 0 14 14", width: "14", height: "14", "aria-hidden": "true" }, open ? (
      // 开锁：梁从左侧立起后向右上悬空，右脚不扣回锁体
      /* @__PURE__ */ React.createElement(
        "path",
        {
          d: "M4.25 6.75V4.35a2.75 2.75 0 0 1 5.35-.2",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round"
        }
      )
    ) : /* @__PURE__ */ React.createElement(
      "path",
      {
        d: "M4.25 6.75V4.5a2.75 2.75 0 0 1 5.5 0v2.25",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round"
      }
    ), /* @__PURE__ */ React.createElement("rect", { x: "2.75", y: "6.75", width: "8.5", height: "5.5", rx: "1.25", fill: "currentColor" }));
  }
  function InteractionLock({ interactive, onToggle }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: interactive ? "wf-interaction-lock" : "wf-interaction-lock is-locked",
        onClick: onToggle,
        "aria-pressed": !interactive,
        title: interactive ? "\u5F53\u524D\u53EF\u4EA4\u4E92\u9875\u9762\u3002\u70B9\u51FB\u9501\u4F4F\u540E\uFF1A\u62D6\u62FD\u5E73\u79FB\u753B\u5E03\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF1B\u4E5F\u53EF\u6309\u4F4F\u7A7A\u683C\u4E34\u65F6\u9501\u4F4F" : "\u5F53\u524D\u5DF2\u9501\u4F4F\u3002\u62D6\u62FD\u5E73\u79FB\u3001\u6EDA\u8F6E\u7F29\u653E\uFF1B\u9875\u9762\u5185\u70B9\u51FB\u4E0E\u6EDA\u52A8\u5DF2\u7981\u7528\u3002\u70B9\u51FB\u6062\u590D\u53EF\u4EA4\u4E92"
      },
      /* @__PURE__ */ React.createElement(LockIcon, { open: interactive }),
      /* @__PURE__ */ React.createElement("span", null, interactive ? "\u53EF\u4EA4\u4E92" : "\u4E0D\u53EF\u4EA4\u4E92")
    );
  }
  function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function requestBoardFullscreen(el) {
    const request = el && (el.requestFullscreen || el.webkitRequestFullscreen);
    if (!request) return Promise.resolve();
    return Promise.resolve(request.call(el)).catch(() => {
    });
  }
  function exitBoardFullscreen() {
    if (!getFullscreenElement()) return Promise.resolve();
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit) return Promise.resolve();
    return Promise.resolve(exit.call(document)).catch(() => {
    });
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
    const [interactive, setInteractive] = React.useState(true);
    const [spaceHeld, setSpaceHeld] = React.useState(false);
    const [hotspotsVisible, setHotspotsVisible] = React.useState(false);
    const [exportError, setExportError] = React.useState(null);
    const [exporting, setExporting] = React.useState(false);
    const [expandedIds, setExpandedIds] = React.useState(() => /* @__PURE__ */ new Set());
    const [immersive, setImmersive] = React.useState(false);
    const [browserFullscreen, setBrowserFullscreen] = React.useState(false);
    const [reviewEnabled, setReviewEnabled] = React.useState(false);
    const [reviewSelections, setReviewSelections] = React.useState([]);
    const [reviewMultiSelect, setReviewMultiSelect] = React.useState(false);
    const [reviewItems, setReviewItems] = React.useState([]);
    const boardRef = React.useRef(null);
    const selectedReviewElementsRef = React.useRef(/* @__PURE__ */ new Set());
    const canvasLocked = reviewEnabled ? spaceHeld : !interactive || spaceHeld;
    const allScreenIds = project2.screens.map((screen) => screen.id);
    const isDemo = mode === "demo" && demoAvailable;
    const activeScale = isDemo ? demoScale : canvasScale;
    const setActiveScale = isDemo ? setDemoScale : setCanvasScale;
    const clearReviewSelection = React.useCallback(() => {
      for (const element of selectedReviewElementsRef.current) {
        element.classList.remove("is-review-selected");
      }
      selectedReviewElementsRef.current.clear();
      setReviewSelections([]);
    }, []);
    const selectReviewElement = React.useCallback((element, screen, contentRoot, options = {}) => {
      const primary = reviewSelections[reviewSelections.length - 1];
      const activeScreen = screen || project2.screens.find((item) => item.id === (primary == null ? void 0 : primary.screenId));
      const activeRoot = contentRoot || (primary == null ? void 0 : primary.contentRoot);
      if (!element || !activeScreen || !activeRoot) return;
      const nextSelection = describeReviewElement(element, activeRoot, activeScreen);
      const additive = reviewMultiSelect || options.additive;
      setReviewSelections((current) => {
        if (options.replaceElement) {
          options.replaceElement.classList.remove("is-review-selected");
          selectedReviewElementsRef.current.delete(options.replaceElement);
          if (current.some((item) => item.element === element && item.element !== options.replaceElement)) {
            return current.filter((item) => item.element !== options.replaceElement);
          }
          element.classList.add("is-review-selected");
          selectedReviewElementsRef.current.add(element);
          return current.map((item) => item.element === options.replaceElement ? nextSelection : item);
        }
        const alreadySelected = current.some((item) => item.element === element);
        if (!additive) {
          for (const selectedElement of selectedReviewElementsRef.current) {
            selectedElement.classList.remove("is-review-selected");
          }
          selectedReviewElementsRef.current.clear();
        } else if (alreadySelected) {
          element.classList.remove("is-review-selected");
          selectedReviewElementsRef.current.delete(element);
          return current.filter((item) => item.element !== element);
        }
        element.classList.add("is-review-selected");
        selectedReviewElementsRef.current.add(element);
        return additive ? [...current, nextSelection] : [nextSelection];
      });
    }, [project2.screens, reviewMultiSelect, reviewSelections]);
    const removeReviewSelection = React.useCallback((element) => {
      element == null ? void 0 : element.classList.remove("is-review-selected");
      selectedReviewElementsRef.current.delete(element);
      setReviewSelections((current) => current.filter((item) => item.element !== element));
    }, []);
    const closeReview = React.useCallback(() => {
      setReviewEnabled(false);
      clearReviewSelection();
    }, [clearReviewSelection]);
    const toggleReview = () => {
      if (reviewEnabled) {
        closeReview();
        return;
      }
      setInteractive(true);
      setReviewEnabled(true);
    };
    const addReviewItem = (item) => {
      setReviewItems((current) => [
        ...current,
        { ...item, id: `review-${Date.now()}-${current.length + 1}` }
      ]);
    };
    const removeReviewItem = (id) => {
      setReviewItems((current) => current.filter((item) => item.id !== id));
    };
    React.useEffect(() => () => {
      for (const element of selectedReviewElementsRef.current) {
        element.classList.remove("is-review-selected");
      }
    }, []);
    React.useEffect(() => {
      if (reviewEnabled) clearReviewSelection();
    }, [clearReviewSelection, mode, reviewEnabled, viewportKey]);
    const exitImmersive = React.useCallback(() => {
      setImmersive(false);
      exitBoardFullscreen();
    }, []);
    const toggleBrowserFullscreen = () => {
      if (getFullscreenElement()) {
        exitBoardFullscreen();
        return;
      }
      requestBoardFullscreen(boardRef.current);
    };
    React.useEffect(() => {
      setExpandedIds(/* @__PURE__ */ new Set());
    }, [viewportKey]);
    const toggleExpand = (id) => {
      setExpandedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };
    const expandTargets = (shouldExpand) => {
      const targets = resolveExpandTargets(selectedIds, allScreenIds);
      setExpandedIds((current) => {
        const next = new Set(current);
        for (const id of targets) {
          if (shouldExpand) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    };
    React.useEffect(() => {
      const down = (event) => {
        if (event.code !== "Space" || event.repeat) return;
        const tag = event.target && event.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable) {
          return;
        }
        event.preventDefault();
        setSpaceHeld(true);
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
    React.useEffect(() => {
      const sync = () => setBrowserFullscreen(!!getFullscreenElement());
      document.addEventListener("fullscreenchange", sync);
      document.addEventListener("webkitfullscreenchange", sync);
      return () => {
        document.removeEventListener("fullscreenchange", sync);
        document.removeEventListener("webkitfullscreenchange", sync);
      };
    }, []);
    React.useEffect(() => {
      if (!immersive) return void 0;
      const onKey = (event) => {
        if (event.key !== "Escape") return;
        if (getFullscreenElement()) return;
        event.preventDefault();
        setImmersive(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [immersive]);
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
            expanded: expandedIds.has(id),
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
    const resetActiveView = isDemo ? resetDemoView : () => setCanvasScale(1);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: boardRef,
        className: `wf-board${immersive ? " is-immersive" : ""}${reviewEnabled ? " is-reviewing" : ""}`
      },
      /* @__PURE__ */ React.createElement("header", { className: "wf-board-toolbar" }, /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-left" }, /* @__PURE__ */ React.createElement("h1", { className: "wf-project-name" }, project2.name), /* @__PURE__ */ React.createElement("span", { className: "wf-project-meta" }, project2.screens.length, " \u9875")), /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-center" }, demoAvailable ? /* @__PURE__ */ React.createElement("div", { className: "wf-mode-switcher", role: "group", "aria-label": "\u6A21\u5F0F" }, /* @__PURE__ */ React.createElement(
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
      ), /* @__PURE__ */ React.createElement(
        InteractionLock,
        {
          interactive,
          onToggle: () => setInteractive((value) => !value)
        }
      )) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        ZoomControls,
        {
          scale: demoScale,
          setScale: setDemoScale,
          onReset: resetDemoView
        }
      ), /* @__PURE__ */ React.createElement(
        InteractionLock,
        {
          interactive,
          onToggle: () => setInteractive((value) => !value)
        }
      ), /* @__PURE__ */ React.createElement(
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
          className: reviewEnabled ? "wf-toolbar-icon-button is-active" : "wf-toolbar-icon-button",
          "aria-pressed": reviewEnabled,
          "aria-label": reviewEnabled ? `\u5BA1\u9605\u4E2D\uFF08${reviewItems.length} \u6761\u610F\u89C1\uFF09` : `\u5BA1\u9605\uFF08${reviewItems.length} \u6761\u610F\u89C1\uFF09`,
          title: "\u5BA1\u9605\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt",
          onClick: toggleReview
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "review" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-toolbar-icon-count" }, reviewItems.length),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u5BA1\u9605")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-toolbar-icon-button",
          "aria-label": "\u8FDB\u5165\u6C89\u6D78\u6A21\u5F0F",
          title: "\u8FDB\u5165\u6C89\u6D78\uFF1A\u9690\u85CF\u9876\u680F\u4E0E\u4FA7\u680F",
          onClick: () => {
            closeReview();
            setImmersive(true);
          }
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "fullscreen" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u5168\u5C4F")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-toolbar-icon-button",
          "aria-label": selectedIds.size > 0 ? "\u5C55\u5F00\u5DF2\u52FE\u9009\u7684\u5C4F" : "\u5C55\u5F00\u5168\u90E8\u5C4F",
          title: selectedIds.size > 0 ? "\u5C55\u5F00\u5DF2\u52FE\u9009\u7684\u5C4F\uFF1B\u65E0\u52FE\u9009\u65F6\u5C55\u5F00\u5168\u90E8" : "\u5C55\u5F00\u5168\u90E8\u5C4F",
          onClick: () => expandTargets(true)
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "expand" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u5168\u90E8\u5C55\u5F00")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-toolbar-icon-button",
          "aria-label": selectedIds.size > 0 ? "\u6536\u8D77\u5DF2\u52FE\u9009\u7684\u5C4F" : "\u6536\u8D77\u5168\u90E8\u5C4F",
          title: selectedIds.size > 0 ? "\u6536\u8D77\u5DF2\u52FE\u9009\u7684\u5C4F\uFF1B\u65E0\u52FE\u9009\u65F6\u6536\u8D77\u5168\u90E8" : "\u6536\u8D77\u5168\u90E8\u5C4F",
          onClick: () => expandTargets(false)
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "collapse" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u5168\u90E8\u6536\u8D77")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-toolbar-icon-button wf-toolbar-icon-button--primary",
          disabled: exporting || selectedIds.size === 0 || mode === "demo",
          "aria-label": exporting ? "\u6B63\u5728\u5BFC\u51FA" : `\u6253\u5305\u4E0B\u8F7D\uFF08${selectedIds.size} \u4E2A\u5C4F\u5E55\uFF09`,
          title: exporting ? "\u5BFC\u51FA\u4E2D\u2026" : `\u6253\u5305\u4E0B\u8F7D ${selectedIds.size} \u4E2A\u5C4F\u5E55`,
          onClick: () => exportIds([...selectedIds])
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "download" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-toolbar-icon-count" }, exporting ? "\u2026" : selectedIds.size),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u6253\u5305\u4E0B\u8F7D")
      ))),
      exportError ? /* @__PURE__ */ React.createElement("div", { className: "wf-toolbar-error", role: "alert" }, exportError) : null,
      immersive ? /* @__PURE__ */ React.createElement("div", { className: "wf-immersive-chrome", role: "toolbar", "aria-label": "\u6C89\u6D78\u63A7\u4EF6" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-board-button",
          title: "\u9000\u51FA\u6C89\u6D78\uFF08Esc\uFF09",
          onClick: exitImmersive
        },
        "\u9000\u51FA"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: browserFullscreen ? "wf-board-button is-active" : "wf-board-button",
          title: browserFullscreen ? "\u9000\u51FA\u6D4F\u89C8\u5668\u5168\u5C4F" : "\u6D4F\u89C8\u5668\u5168\u5C4F",
          onClick: toggleBrowserFullscreen
        },
        browserFullscreen ? "\u6D4F\u89C8\u5668\u5168\u5C4F ON" : "\u6D4F\u89C8\u5668\u5168\u5C4F"
      ), /* @__PURE__ */ React.createElement(
        ZoomControls,
        {
          scale: activeScale,
          setScale: setActiveScale,
          onReset: resetActiveView
        }
      ), /* @__PURE__ */ React.createElement(
        InteractionLock,
        {
          interactive,
          onToggle: () => setInteractive((value) => !value)
        }
      ), isDemo ? /* @__PURE__ */ React.createElement(React.Fragment, null, canGoBack ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-board-button", onClick: goBack }, "\u8FD4\u56DE") : null, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: hotspotsVisible ? "wf-board-button is-active" : "wf-board-button",
          onClick: () => setHotspotsVisible((value) => !value)
        },
        hotspotsVisible ? "\u70ED\u533A ON" : "\u70ED\u533A OFF"
      )) : null) : null,
      mode === "canvas" ? /* @__PURE__ */ React.createElement(
        CanvasMode,
        {
          project: project2,
          scale: canvasScale,
          setScale: setCanvasScale,
          canvasLocked,
          selectedIds,
          setSelectedIds,
          expandedIds,
          onToggleExpand: toggleExpand,
          onExportIds: exportIds,
          reviewEnabled,
          onReviewSelect: selectReviewElement
        }
      ) : /* @__PURE__ */ React.createElement(
        DemoMode,
        {
          project: project2,
          hotspotsVisible,
          canvasLocked,
          scale: demoScale,
          setScale: setDemoScale,
          viewResetKey: demoViewResetKey,
          expandedIds,
          onToggleExpand: toggleExpand,
          reviewEnabled,
          onReviewSelect: selectReviewElement
        }
      ),
      reviewEnabled ? /* @__PURE__ */ React.createElement(ReviewMarkers, { boardRef, items: reviewItems }) : null,
      reviewEnabled ? /* @__PURE__ */ React.createElement(
        ReviewPanel,
        {
          project: project2,
          selections: reviewSelections,
          multiSelect: reviewMultiSelect,
          items: reviewItems,
          onToggleMultiSelect: () => setReviewMultiSelect((value) => !value),
          onSelectElement: (element) => {
            var _a;
            return selectReviewElement(element, null, null, {
              replaceElement: (_a = reviewSelections[reviewSelections.length - 1]) == null ? void 0 : _a.element
            });
          },
          onRemoveSelection: removeReviewSelection,
          onClearSelection: clearReviewSelection,
          onAddItem: addReviewItem,
          onRemoveItem: removeReviewItem,
          onClose: closeReview
        }
      ) : null
    );
  }

  // starter/framework/lib/core/validateProject.js
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

  // starter/framework/lib/ui/flow.js
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

  // starter/framework/lib/ui/layout.jsx
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

  // starter/framework/lib/ui/content.jsx
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

  // starter/framework/lib/ui/forms.jsx
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
    return /* @__PURE__ */ React.createElement("div", { className: `wf-form-field ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("label", { className: "wf-field-label", htmlFor }, label), children, hint && !error ? /* @__PURE__ */ React.createElement("span", { className: "wf-field-hint" }, hint) : null, error ? /* @__PURE__ */ React.createElement("span", { className: "wf-field-error", role: "alert" }, error) : null);
  }

  // starter/framework/lib/ui/navigation.jsx
  function PageHeader({ title, titleId, subtitle, subtitleId, actions, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("header", { className: `wf-page-header ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("div", { className: "wf-page-header-copy" }, /* @__PURE__ */ React.createElement("h1", { id: titleId, className: "wf-page-title" }, title), subtitle ? /* @__PURE__ */ React.createElement("p", { id: subtitleId, className: "wf-page-subtitle" }, subtitle) : null), actions ? /* @__PURE__ */ React.createElement("div", { className: "wf-page-actions" }, actions) : null);
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
        /* @__PURE__ */ React.createElement("span", { className: "wf-nav-label" }, item.label)
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

  // starter/framework/lib/ui/data.jsx
  function DataTable({ columns: columns2 = [], rows: rows2 = [], getRowKey, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-table-wrap ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("table", { className: "wf-table" }, /* @__PURE__ */ React.createElement("thead", { className: "wf-table-head" }, /* @__PURE__ */ React.createElement("tr", { className: "wf-table-header-row" }, columns2.map((column) => /* @__PURE__ */ React.createElement("th", { className: "wf-table-heading", "data-wf-key": column.key, key: column.key }, column.label)))), /* @__PURE__ */ React.createElement("tbody", { className: "wf-table-body" }, rows2.map((row, index) => {
      const rowKey = getRowKey ? getRowKey(row) : row.id || index;
      return /* @__PURE__ */ React.createElement("tr", { className: "wf-table-row", "data-wf-key": rowKey, key: rowKey }, columns2.map((column) => /* @__PURE__ */ React.createElement("td", { className: "wf-table-cell", "data-wf-key": column.key, key: column.key }, column.render ? column.render(row[column.key], row) : row[column.key])));
    }))));
  }

  // starter/framework/lib/ui/feedback.jsx
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
    return /* @__PURE__ */ React.createElement(ScreenPortal, null, /* @__PURE__ */ React.createElement("div", { className: `wf-overlay wf-modal-overlay ${className}`.trim(), role: "presentation", ...rest }, /* @__PURE__ */ React.createElement("section", { className: "wf-modal", role: "dialog", "aria-modal": "true", "aria-label": title }, /* @__PURE__ */ React.createElement("header", { className: "wf-modal-header" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-modal-title" }, title), onClose ? /* @__PURE__ */ React.createElement(Button, { onClick: onClose }, "\u5173\u95ED") : null), /* @__PURE__ */ React.createElement("div", { className: "wf-modal-body" }, children), actions ? /* @__PURE__ */ React.createElement("footer", { className: "wf-modal-footer" }, actions) : null)));
  }
  function ConfirmDialog({
    open,
    title = "\u786E\u8BA4\u64CD\u4F5C",
    message,
    confirmLabel = "\u786E\u8BA4",
    cancelLabel = "\u53D6\u6D88",
    onConfirm,
    onCancel,
    className = "",
    ...rest
  }) {
    return /* @__PURE__ */ React.createElement(
      Modal,
      {
        open,
        title,
        className,
        onClose: onCancel,
        ...rest,
        actions: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Button, { onClick: onCancel }, cancelLabel), /* @__PURE__ */ React.createElement(Button, { variant: "primary", onClick: onConfirm }, confirmLabel))
      },
      /* @__PURE__ */ React.createElement("p", { className: "wf-confirm-message" }, message)
    );
  }

  // demo/order-admin/src/screens/login.jsx
  function LoginScreen() {
    return /* @__PURE__ */ React.createElement("div", { id: "order-login-page", className: "order-login order-login__page" }, /* @__PURE__ */ React.createElement(Card, { id: "order-login-card", className: "order-login-card order-login__card" }, /* @__PURE__ */ React.createElement(Column, { className: "order-login__form", gap: 16 }, /* @__PURE__ */ React.createElement(Heading, { id: "order-login-title", className: "order-login__title", level: 1 }, "\u8BA2\u5355\u7BA1\u7406\u540E\u53F0"), /* @__PURE__ */ React.createElement(Text, { className: "order-login__description" }, "\u4F7F\u7528\u6F14\u793A\u8D26\u53F7\u8FDB\u5165\u7CFB\u7EDF\u3002"), /* @__PURE__ */ React.createElement(FormField, { className: "order-login__account-field", label: "\u8D26\u53F7", htmlFor: "order-login-account" }, /* @__PURE__ */ React.createElement(TextInput, { id: "order-login-account", className: "order-login__account-input", placeholder: "\u8BF7\u8F93\u5165\u7528\u6237\u540D" })), /* @__PURE__ */ React.createElement(FormField, { className: "order-login__password-field", label: "\u5BC6\u7801", htmlFor: "order-login-password" }, /* @__PURE__ */ React.createElement(TextInput, { id: "order-login-password", className: "order-login__password-input", type: "password", placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801" })), /* @__PURE__ */ React.createElement(Button, { id: "order-login-submit", className: "order-login__submit", variant: "primary", to: "order-list" }, "\u767B\u5F55"))));
  }

  // demo/order-admin/src/layouts/AdminLayout.jsx
  function AdminLayout({ children }) {
    const screenId = useScreenId();
    return /* @__PURE__ */ React.createElement("div", { className: "order-shell" }, /* @__PURE__ */ React.createElement("aside", { className: "order-shell__sidebar" }, /* @__PURE__ */ React.createElement("strong", { className: "order-shell__brand" }, "\u8BA2\u5355\u7BA1\u7406"), /* @__PURE__ */ React.createElement(
      SideNav,
      {
        className: "order-shell__navigation",
        activeId: screenId,
        items: [{ label: "\u8BA2\u5355\u5217\u8868", to: "order-list" }]
      }
    )), /* @__PURE__ */ React.createElement(Column, { gap: 16, className: "order-main order-shell__main" }, children));
  }

  // demo/order-admin/src/screens/order-cancel.jsx
  function OrderCancelScreen() {
    const [open, setOpen] = React.useState(false);
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "order-cancel-page", className: "order-cancel__page", gap: 16 }, /* @__PURE__ */ React.createElement(PageHeader, { id: "order-cancel-header", titleId: "order-cancel-title", className: "order-cancel__header", title: "\u53D6\u6D88\u8BA2\u5355", subtitle: "\u8BA2\u5355 SO-1001" }), /* @__PURE__ */ React.createElement(Card, { id: "order-cancel-form-card", className: "order-cancel__form-card" }, /* @__PURE__ */ React.createElement(Column, { className: "order-cancel__form", gap: 16 }, /* @__PURE__ */ React.createElement(FormField, { className: "order-cancel__reason-field", label: "\u53D6\u6D88\u539F\u56E0", htmlFor: "order-cancel-reason" }, /* @__PURE__ */ React.createElement(Select, { id: "order-cancel-reason", className: "order-cancel__reason-select", defaultValue: "customer" }, /* @__PURE__ */ React.createElement("option", { className: "order-cancel__reason-option", value: "customer" }, "\u5BA2\u6237\u7533\u8BF7"), /* @__PURE__ */ React.createElement("option", { className: "order-cancel__reason-option", value: "inventory" }, "\u5E93\u5B58\u4E0D\u8DB3"))), /* @__PURE__ */ React.createElement(FormField, { className: "order-cancel__note-field", label: "\u5907\u6CE8", htmlFor: "order-cancel-note" }, /* @__PURE__ */ React.createElement(TextArea, { id: "order-cancel-note", className: "order-cancel__note-input", placeholder: "\u586B\u5199\u8865\u5145\u8BF4\u660E" })), /* @__PURE__ */ React.createElement(Button, { id: "order-cancel-submit", className: "order-cancel__submit", variant: "primary", onClick: () => setOpen(true) }, "\u63D0\u4EA4\u53D6\u6D88"))), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        id: "order-cancel-confirm-dialog",
        className: "order-cancel__confirm-dialog",
        open,
        title: "\u786E\u8BA4\u53D6\u6D88\u8BA2\u5355",
        message: "\u6B64\u64CD\u4F5C\u5C06\u66F4\u65B0\u8BA2\u5355\u72B6\u6001\u3002",
        onCancel: () => setOpen(false),
        onConfirm: () => setOpen(false)
      }
    )));
  }

  // demo/order-admin/src/screens/order-detail.jsx
  function OrderDetailScreen() {
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "order-detail-page", className: "order-detail__page", gap: 16 }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "order-detail-header",
        titleId: "order-detail-title",
        className: "order-detail__header",
        title: "\u8BA2\u5355 SO-1001",
        subtitle: "\u521B\u5EFA\u4E8E 2026-08-04",
        actions: /* @__PURE__ */ React.createElement(Button, { id: "order-detail-cancel-action", className: "order-detail__cancel-action", to: "order-cancel" }, "\u53D6\u6D88\u8BA2\u5355")
      }
    ), /* @__PURE__ */ React.createElement(Grid, { id: "order-detail-summary", className: "order-detail__summary", columns: 2, gap: 16 }, /* @__PURE__ */ React.createElement(Card, { id: "order-detail-customer-card", className: "order-detail__customer-card" }, /* @__PURE__ */ React.createElement(Column, { className: "order-detail__customer-content", gap: 8 }, /* @__PURE__ */ React.createElement("strong", { className: "order-detail__section-title" }, "\u5BA2\u6237\u4FE1\u606F"), /* @__PURE__ */ React.createElement(Text, { className: "order-detail__customer-name" }, "\u793A\u4F8B\u5BA2\u6237\u7532"), /* @__PURE__ */ React.createElement(Text, { className: "order-detail__customer-type" }, "\u4F01\u4E1A\u5BA2\u6237"))), /* @__PURE__ */ React.createElement(Card, { id: "order-detail-amount-card", className: "order-detail__amount-card" }, /* @__PURE__ */ React.createElement(Column, { className: "order-detail__amount-content", gap: 8 }, /* @__PURE__ */ React.createElement("strong", { className: "order-detail__section-title" }, "\u8BA2\u5355\u91D1\u989D"), /* @__PURE__ */ React.createElement(Text, { className: "order-detail__amount-value" }, "1,280.00"), /* @__PURE__ */ React.createElement(Text, { className: "order-detail__payment-status" }, "\u5F85\u652F\u4ED8"))))));
  }

  // demo/order-admin/src/screens/order-list.jsx
  var rows = [
    {
      id: "SO-1001",
      customer: "\u793A\u4F8B\u5BA2\u6237\u7532\uFF08\u534E\u4E1C\u533A\u65D7\u8230\u95E8\u5E97\uFF09",
      channel: "\u7EBF\u4E0B\u95E8\u5E97 / \u4E0A\u6D77\u9759\u5B89",
      sku: "WF-DESK-PRO-1200",
      warehouse: "\u534E\u4E1C\u4E00\u53F7\u4ED3-A12",
      amount: "1,280.00",
      paid: "0.00",
      logistics: "\u672A\u53D1\u8D27 \xB7 \u5F85\u8C03\u5EA6",
      owner: "\u5F20\u4E09\uFF08\u5BA2\u670D\u4E00\u7EC4\uFF09",
      createdAt: "2026-08-04 09:12:33",
      updatedAt: "2026-08-04 11:08:01",
      remark: "\u5BA2\u6237\u8981\u6C42\u5DE5\u4F5C\u65E5\u4E0A\u5348\u914D\u9001\uFF0C\u9700\u5F00\u589E\u503C\u7A0E\u4E13\u7528\u53D1\u7968",
      status: "\u5F85\u5904\u7406"
    },
    {
      id: "SO-1002",
      customer: "\u793A\u4F8B\u5BA2\u6237\u4E59\uFF08\u534E\u5357\u7ECF\u9500\u5546\uFF09",
      channel: "\u7ECF\u9500\u5546\u95E8\u6237",
      sku: "WF-CHAIR-STD-01",
      warehouse: "\u534E\u5357\u4E2D\u8F6C\u4ED3-B03",
      amount: "860.00",
      paid: "860.00",
      logistics: "\u8FD0\u8F93\u4E2D \xB7 SF1234567890CN",
      owner: "\u674E\u56DB\uFF08\u5BA2\u670D\u4E8C\u7EC4\uFF09",
      createdAt: "2026-08-03 14:22:10",
      updatedAt: "2026-08-05 08:41:55",
      remark: "\u5DF2\u4ED8\u6B3E\uFF0C\u6536\u4EF6\u4EBA\u624B\u673A\u5C3E\u53F7 8899",
      status: "\u5904\u7406\u4E2D"
    },
    {
      id: "SO-1003",
      customer: "\u793A\u4F8B\u5BA2\u6237\u4E19\uFF08\u534E\u5317\u4F01\u4E1A\u91C7\u8D2D\uFF09",
      channel: "\u4F01\u4E1A\u91C7\u8D2D / \u62DB\u6807\u6279\u6B21 #88",
      sku: "WF-CABINET-XL-04",
      warehouse: "\u534E\u5317\u4E2D\u592E\u4ED3-C21",
      amount: "2,400.00",
      paid: "2,400.00",
      logistics: "\u5DF2\u7B7E\u6536 \xB7 2026-08-02",
      owner: "\u738B\u4E94\uFF08\u5927\u5BA2\u6237\u7EC4\uFF09",
      createdAt: "2026-07-28 16:05:44",
      updatedAt: "2026-08-02 17:30:12",
      remark: "\u5408\u540C\u53F7 CN-2026-0728-004\uFF0C\u9A8C\u6536\u5408\u683C",
      status: "\u5DF2\u5B8C\u6210"
    }
  ];
  var columns = [
    { key: "id", label: "\u8BA2\u5355\u53F7" },
    { key: "channel", label: "\u4E0B\u5355\u6E20\u9053" },
    { key: "customer", label: "\u5BA2\u6237\u540D\u79F0" },
    { key: "sku", label: "\u4E3B SKU" },
    { key: "warehouse", label: "\u53D1\u8D27\u4ED3" },
    { key: "amount", label: "\u8BA2\u5355\u91D1\u989D" },
    { key: "paid", label: "\u5DF2\u4ED8\u91D1\u989D" },
    { key: "logistics", label: "\u7269\u6D41\u72B6\u6001" },
    { key: "owner", label: "\u8D1F\u8D23\u4EBA" },
    { key: "createdAt", label: "\u521B\u5EFA\u65F6\u95F4" },
    { key: "updatedAt", label: "\u66F4\u65B0\u65F6\u95F4" },
    { key: "remark", label: "\u5907\u6CE8" },
    { key: "status", label: "\u72B6\u6001", render: (value) => /* @__PURE__ */ React.createElement(Badge, { className: "order-list__status" }, value) }
  ];
  function OrderListScreen() {
    return /* @__PURE__ */ React.createElement(AdminLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "order-list-page", className: "order-list__page", gap: 16 }, /* @__PURE__ */ React.createElement(PageHeader, { id: "order-list-header", titleId: "order-list-title", className: "order-list__header", title: "\u8BA2\u5355\u5217\u8868", subtitle: "\u5171 3 \u6761\u6F14\u793A\u6570\u636E \xB7 \u5BBD\u8868\u6A2A\u5411\u6EDA\u52A8" }), /* @__PURE__ */ React.createElement(Card, { id: "order-list-featured-order", className: "order-list__featured-order", to: "order-detail" }, /* @__PURE__ */ React.createElement(Heading, { className: "order-list__featured-title", level: 3 }, "\u5F85\u5904\u7406\u8BA2\u5355"), /* @__PURE__ */ React.createElement(Text, { className: "order-list__featured-description" }, "\u6253\u5F00 SO-1001 \u8BE6\u60C5")), /* @__PURE__ */ React.createElement(DataTable, { id: "order-list-table", className: "demo-wide-table order-list__table", columns, rows })));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9DYW52YXNNb2RlLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvRGVtb01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBvcnQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld1BhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TWFya2Vycy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvbGF5b3V0cy9BZG1pbkxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvb3JkZXItY2FuY2VsLmpzeCIsICIuLi9zcmMvc2NyZWVucy9vcmRlci1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL29yZGVyLWxpc3QuanN4IiwgIi4uL3NyYy9wcm9qZWN0LmpzIiwgIi4uL3NyYy9hcHAuanN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBQcm90b3R5cGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdCkge1xuICByZXR1cm4gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgcHJvamVjdC5zY3JlZW5zWzBdLmlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcm90b3R5cGVQcm92aWRlcih7IHByb2plY3QsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgaW5pdGlhbFNjcmVlbklkID0gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIG1vZGU6ICdjYW52YXMnLFxuICAgIHZpZXdwb3J0S2V5OiBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCxcbiAgICBlbnRyeUlkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgaGlzdG9yeTogW10sXG4gIH0pXG5cbiAgY29uc3QgbmF2aWdhdGUgPSBSZWFjdC51c2VDYWxsYmFjaygoaWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtpZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZClcbiAgICAgICAgaWYgKCFzY3JlZW4ubGlua3MuaW5jbHVkZXMoaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke2N1cnJlbnQuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHtpZH1cImApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogaWQsXG4gICAgICAgIGhpc3Rvcnk6XG4gICAgICAgICAgY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkXG4gICAgICAgICAgICA/IFsuLi5jdXJyZW50Lmhpc3RvcnksIGN1cnJlbnQuY3VycmVudFNjcmVlbklkXVxuICAgICAgICAgICAgOiBjdXJyZW50Lmhpc3RvcnksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNlbGVjdEVudHJ5ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVudHJ5SWQpID0+IHtcbiAgICBjb25zdCBlbnRyeSA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBlbnRyeUlkLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBnb0JhY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50Lmhpc3RvcnlbY3VycmVudC5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgICAgICBoaXN0b3J5OiBjdXJyZW50Lmhpc3Rvcnkuc2xpY2UoMCwgLTEpLFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHJlc2V0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5lbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtpbml0aWFsU2NyZWVuSWRdKVxuXG4gIGNvbnN0IHNldE1vZGUgPSBSZWFjdC51c2VDYWxsYmFjaygobW9kZSkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnY2FudmFzJyAmJiBtb2RlICE9PSAnZGVtbycpIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtb2RlIFwiJHttb2RlfVwiYClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtdKVxuXG4gIC8qKiBcdTc1M0JcdTY3N0ZcdTUzQ0NcdTUxRkJcdTY3RDBcdTk4NzVcdUZGMUFcdThGREJcdTUxNjVcdTZGMTRcdTc5M0FcdTVFNzZcdTg0M0RcdTU3MjhcdThCRTVcdTk4NzUgKi9cbiAgY29uc3QgZW50ZXJEZW1vID0gUmVhY3QudXNlQ2FsbGJhY2soKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHNjcmVlbklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7c2NyZWVuSWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlOiAnZGVtbycsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IHNjcmVlbklkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZXRWaWV3cG9ydEtleSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aWV3cG9ydEtleSkgPT4ge1xuICAgIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgdmlld3BvcnRLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdmlld3BvcnQgXCIke3ZpZXdwb3J0S2V5fVwiYClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHZpZXdwb3J0S2V5IH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgdmFsdWUgPSBSZWFjdC51c2VNZW1vKCgpID0+ICh7XG4gICAgbW9kZTogc3RhdGUubW9kZSxcbiAgICB2aWV3cG9ydEtleTogc3RhdGUudmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQ6IHByb2plY3Qudmlld3BvcnRzW3N0YXRlLnZpZXdwb3J0S2V5XSxcbiAgICBlbnRyeUlkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuY3VycmVudFNjcmVlbklkLFxuICAgIG5hdmlnYXRlLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBzZXRNb2RlLFxuICAgIGVudGVyRGVtbyxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICBjYW5Hb0JhY2s6IHN0YXRlLmhpc3RvcnkubGVuZ3RoID4gMCxcbiAgfSksIFtlbnRlckRlbW8sIGdvQmFjaywgbmF2aWdhdGUsIHByb2plY3QsIHJlc2V0LCBzZWxlY3RFbnRyeSwgc2V0TW9kZSwgc2V0Vmlld3BvcnRLZXksIHN0YXRlXSlcblxuICByZXR1cm4gPFByb3RvdHlwZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT57Y2hpbGRyZW59PC9Qcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvdG90eXBlKCkge1xuICBjb25zdCBjb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChQcm90b3R5cGVDb250ZXh0KVxuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcigndXNlUHJvdG90eXBlIG11c3QgYmUgdXNlZCBpbnNpZGUgUHJvdG90eXBlUHJvdmlkZXInKVxuICByZXR1cm4gY29udGV4dFxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjbGFtcFNjYWxlKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLm1pbigyLCBNYXRoLm1heCgwLjIsIHNjYWxlKSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMUFcdTYzMDlcdTVCQjlcdTU2NjhcdTUxODVcdTVCQjlcdTUzM0FcdTYyOEFcdTY1NzRcdTk4NzVcdTdGMjlcdTY1M0VcdTUyMzBcdTVCOENcdTY1NzRcdTUzRUZcdTg5QzFcdTMwMDJcbiAqIGNvbnRhaW5lciogXHU0RTNBXHU1M0JCXHU2Mzg5IHBhZGRpbmcgXHU1NDBFXHU3Njg0XHU1M0VGXHU3NTI4XHU1QzNBXHU1QkY4XHVGRjFCY29udGVudCogXHU0RTNBXHU2NzJBXHU3RjI5XHU2NTNFXHU3Njg0IHN0YWdlIFx1NUJCRFx1OUFEOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0RGVtb1NjYWxlKGNvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHQsIGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCkge1xuICBpZiAoY29udGFpbmVyV2lkdGggPD0gMCB8fCBjb250YWluZXJIZWlnaHQgPD0gMCB8fCBjb250ZW50V2lkdGggPD0gMCB8fCBjb250ZW50SGVpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiBjbGFtcFNjYWxlKE1hdGgubWluKGNvbnRhaW5lcldpZHRoIC8gY29udGVudFdpZHRoLCBjb250YWluZXJIZWlnaHQgLyBjb250ZW50SGVpZ2h0KSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTg5QzZcdTUzRTNcdTUzQ0NcdTUxRkJcdTc2RUVcdTY4MDdcdTY2MkZcdTU0MjZcdTRFM0FcdTVDNEZcdTU5MTZcdTdBN0FcdTc2N0RcdTMwMDJcbiAqIFx1NzBCOVx1NTcyOCAud2Ytc2NyZWVuLWNocm9tZVx1RkYwOFx1NjgwN1x1OTg5OFx1NjgwRiAvIFx1NTE4NVx1NUJCOVx1RkYwOVx1NTE4NVx1NEUwRFx1N0I5N1x1N0E3QVx1NzY3RFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1OTAwMFx1NTFGQVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiB0cnVlXG4gIHJldHVybiAhdGFyZ2V0LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY2hyb21lJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q2FudmFzVmlld3BvcnQoKSB7XG4gIHJldHVybiB7IHNjYWxlOiAxLCBwYW5YOiAwLCBwYW5ZOiAwIH1cbn1cblxuY29uc3QgRk9DVVNfUEFERElORyA9IDQwXG5cbi8qKlxuICogXHU3NTNCXHU2NzdGIGZvY3VzXHVGRjFBXHU2MjhBXHU2NTc0XHU1NzU3IHNjcmVlblx1RkYwOFx1NTQyQiBtZXRhXHVGRjA5XHU3OUZCXHU1MjMwXHU1QkI5XHU1NjY4XHU0RTJEXHU1RkMzXHUzMDAyXG4gKiBcdTRFQzVcdTVGNTNcdTVGNTNcdTUyNEQgc2NhbGUgXHU2NTNFXHU0RTBEXHU0RTBCXHU2NUY2XHU3RjI5XHU1QzBGXHVGRjFCXHU0RTBEXHU2NTNFXHU1OTI3XHUzMDAyXHU1QzNBXHU1QkY4XHU5NzVFXHU2Q0Q1XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgY29udGFpbmVyV2lkdGgsXG4gIGNvbnRhaW5lckhlaWdodCxcbiAgc2NyZWVuTGVmdCxcbiAgc2NyZWVuVG9wLFxuICBzY3JlZW5XaWR0aCxcbiAgc2NyZWVuSGVpZ2h0LFxuICBjdXJyZW50U2NhbGUsXG4gIHBhZGRpbmcgPSBGT0NVU19QQURESU5HLFxufSkge1xuICBpZiAoXG4gICAgY29udGFpbmVyV2lkdGggPD0gMFxuICAgIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwXG4gICAgfHwgc2NyZWVuV2lkdGggPD0gMFxuICAgIHx8IHNjcmVlbkhlaWdodCA8PSAwXG4gICAgfHwgIU51bWJlci5pc0Zpbml0ZShjdXJyZW50U2NhbGUpXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBhdmFpbFdpZHRoID0gY29udGFpbmVyV2lkdGggLSBwYWRkaW5nICogMlxuICBjb25zdCBhdmFpbEhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHBhZGRpbmcgKiAyXG4gIGlmIChhdmFpbFdpZHRoIDw9IDAgfHwgYXZhaWxIZWlnaHQgPD0gMCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBmaXRTY2FsZSA9IE1hdGgubWluKGF2YWlsV2lkdGggLyBzY3JlZW5XaWR0aCwgYXZhaWxIZWlnaHQgLyBzY3JlZW5IZWlnaHQpXG4gIGNvbnN0IHNjYWxlID0gY2xhbXBTY2FsZShNYXRoLm1pbihjdXJyZW50U2NhbGUsIGZpdFNjYWxlKSlcbiAgcmV0dXJuIHtcbiAgICBzY2FsZSxcbiAgICBwYW5YOiBjb250YWluZXJXaWR0aCAvIDIgLSAoc2NyZWVuTGVmdCArIHNjcmVlbldpZHRoIC8gMikgKiBzY2FsZSxcbiAgICBwYW5ZOiBjb250YWluZXJIZWlnaHQgLyAyIC0gKHNjcmVlblRvcCArIHNjcmVlbkhlaWdodCAvIDIpICogc2NhbGUsXG4gIH1cbn1cblxuLyoqXG4gKiBcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdUZGMUFcdTUzRUFcdTc1MjhcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTUyNERcdTYyMkFcdTgzQjdcdTc2ODQgc25hcHNob3RcdUZGMENcdTc5ODFcdTZCNjJcdTU3Mjggc2V0U3RhdGUgdXBkYXRlciBcdTkxQ0NcdThCRkIgZHJhZyByZWZcdTMwMDJcbiAqIFJlYWN0IDE4IFx1NEYxQVx1NTcyOCBlbmRQYW4gXHU2RTA1XHU3QTdBIHJlZiBcdTU0MEVcdTkxQ0RcdTY1M0UgdXBkYXRlclx1RkYxQlx1OEJGQiBudWxsLnBhblggXHU1MzczIEJvYXJkIFx1NjJBNVx1OTUxOVx1NjgzOVx1NTZFMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFuRnJvbURyYWdTbmFwc2hvdCh2aWV3LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gdmlld1xuICByZXR1cm4ge1xuICAgIC4uLnZpZXcsXG4gICAgcGFuWDogc25hcHNob3QucGFuWCArIGNsaWVudFggLSBzbmFwc2hvdC54LFxuICAgIHBhblk6IHNuYXBzaG90LnBhblkgKyBjbGllbnRZIC0gc25hcHNob3QueSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTY3JvbGxhYmxlT3ZlcmZsb3codmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSAnYXV0bycgfHwgdmFsdWUgPT09ICdzY3JvbGwnIHx8IHZhbHVlID09PSAnb3ZlcmxheSdcbn1cblxuLyoqIFx1NTcyOCByb290IFx1NTE4NVx1NTQxMVx1NEUwQVx1NjI3RVx1NTNFRlx1NkVEQVx1NTJBOFx1Nzk1Nlx1NTE0OFx1RkYwOFx1NTQyQiByb290IFx1ODFFQVx1OEVBQlx1RkYwQ1x1NTk4Mlx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1NTMzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlQW5jZXN0b3Ioc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGxldCBub2RlID0gc3RhcnRFbCAmJiBzdGFydEVsLm5vZGVUeXBlID09PSAzID8gc3RhcnRFbC5wYXJlbnRFbGVtZW50IDogc3RhcnRFbFxuICB3aGlsZSAobm9kZSkge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpXG4gICAgICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBub2RlLnNjcm9sbEhlaWdodCA+IG5vZGUuY2xpZW50SGVpZ2h0ICsgMVxuICAgICAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgbm9kZS5zY3JvbGxXaWR0aCA+IG5vZGUuY2xpZW50V2lkdGggKyAxXG4gICAgICBpZiAoY2FuWSB8fCBjYW5YKSByZXR1cm4gbm9kZVxuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBDT05URU5UX0RSQUdfVEhSRVNIT0xEID0gM1xuXG5mdW5jdGlvbiBpc0VkaXRhYmxlVGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxuICByZXR1cm4gISF0YXJnZXQuY2xvc2VzdCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJylcbn1cblxuLyoqXG4gKiBcdTU3MjhcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUxODVcdTYzMDlcdTRGNEZcdTYyRDZcdTYyRkQgXHUyMTkyIFx1NkVEQVx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHVGRjA4XHU1M0VGXHU0RUE0XHU0RTkyXHU1MTczXHU5NUVEIC8gXHU3QTdBXHU2ODNDXHVGRjA5XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdUZGMENcdTRFQTRcdTdFRDlcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcdTMwMDJcbiAqIFx1OEZENFx1NTZERSBudWxsIFx1ODg2OFx1NzkzQVx1NEUwRFx1NUU5NFx1NjNBNVx1N0JBMVx1OEJFNVx1NkIyMSBwb2ludGVyZG93blx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgcm9vdEVsLCB7IGxvY2tlZCA9IGZhbHNlLCBzY2FsZSA9IDEgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiBudWxsXG4gIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVybiBudWxsXG4gIGlmICghcm9vdEVsIHx8ICFyb290RWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgaWYgKGlzRWRpdGFibGVUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgY29uc3Qgc2Nyb2xsYWJsZSA9IGZpbmRTY3JvbGxhYmxlQW5jZXN0b3IoZXZlbnQudGFyZ2V0LCByb290RWwpXG4gIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHtcbiAgICBlbDogc2Nyb2xsYWJsZSxcbiAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgIHNjcm9sbExlZnQ6IHNjcm9sbGFibGUuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IHNjcm9sbGFibGUuc2Nyb2xsVG9wLFxuICAgIHNjYWxlOiBzY2FsZSA+IDAgPyBzY2FsZSA6IDEsXG4gICAgbW92ZWQ6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KSB7XG4gIGlmICghc3RhdGUgfHwgc3RhdGUucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVybiBzdGF0ZVxuICBjb25zdCBkeCA9IChldmVudC5jbGllbnRYIC0gc3RhdGUuc3RhcnRYKSAvIHN0YXRlLnNjYWxlXG4gIGNvbnN0IGR5ID0gKGV2ZW50LmNsaWVudFkgLSBzdGF0ZS5zdGFydFkpIC8gc3RhdGUuc2NhbGVcbiAgaWYgKCFzdGF0ZS5tb3ZlZCAmJiAoTWF0aC5hYnMoZHgpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCB8fCBNYXRoLmFicyhkeSkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEKSkge1xuICAgIHN0YXRlLm1vdmVkID0gdHJ1ZVxuICB9XG4gIHN0YXRlLmVsLnNjcm9sbExlZnQgPSBzdGF0ZS5zY3JvbGxMZWZ0IC0gZHhcbiAgc3RhdGUuZWwuc2Nyb2xsVG9wID0gc3RhdGUuc2Nyb2xsVG9wIC0gZHlcbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8qKiBcdTYyRDZcdTYyRkRcdThEODVcdThGQzdcdTk2MDhcdTUwM0NcdTU0MEVcdTU0MUVcdTYzODlcdTk2OEZcdTU0MEVcdTc2ODQgY2xpY2tcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTg5RTZcdThERjNcdThGNkMgKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgcm9vdEVsKSB7XG4gIGlmICghc3RhdGUgfHwgIXN0YXRlLm1vdmVkIHx8ICFyb290RWwpIHJldHVyblxuICBjb25zdCBwcmV2ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByb290RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG4gIH1cbiAgcm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxufVxuXG4vKiogXHU4QkU1XHU2NUI5XHU1NDExXHU2NjJGXHU1NDI2XHU4RkQ4XHU4MEZEXHU3RUU3XHU3RUVEXHU2RURBICovXG5leHBvcnQgZnVuY3Rpb24gY2FuU2Nyb2xsSW5EaXJlY3Rpb24oZWwsIGRlbHRhWCwgZGVsdGFZKSB7XG4gIGNvbnN0IGVwcyA9IDFcbiAgaWYgKGRlbHRhWSkge1xuICAgIGNvbnN0IG1heFkgPSBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHRcbiAgICBpZiAobWF4WSA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWSA8IDAgJiYgZWwuc2Nyb2xsVG9wID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWSA+IDAgJiYgZWwuc2Nyb2xsVG9wIDwgbWF4WSAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgaWYgKGRlbHRhWCkge1xuICAgIGNvbnN0IG1heFggPSBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoXG4gICAgaWYgKG1heFggPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVggPCAwICYmIGVsLnNjcm9sbExlZnQgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFYID4gMCAmJiBlbC5zY3JvbGxMZWZ0IDwgbWF4WCAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUZCXHU2MTBGXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUM1IEN0cmwvTWV0YSArIFx1NkVEQVx1OEY2RVxuICpcdUZGMDhcdTg5RTZcdTYzQTdcdTY3N0YgcGluY2ggXHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4XHU5MUNDXHU5MDFBXHU1RTM4XHU1RTI2IGN0cmxLZXlcdUZGMDlcdTMwMDJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTY2NkVcdTkwMUFcdTZFREFcdThGNkVcdTc1NTlcdTdFRDlcdTVDNEZcdTUxODVcdTZFREFcdTUyQThcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gISEoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJFbnRyeUlkKHNjcmVlbnMpIHtcbiAgcmV0dXJuIHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZW1vU3RhdGUoc2NyZWVucykge1xuICBjb25zdCBlbnRyeUlkID0gaW5mZXJFbnRyeUlkKHNjcmVlbnMpXG4gIGlmICghZW50cnlJZCkgdGhyb3cgbmV3IEVycm9yKCdEZW1vIG1vZGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGVudHJ5IHNjcmVlbicpXG4gIHJldHVybiB7XG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGVEZW1vKHN0YXRlLCB0YXJnZXRJZCwgc2NyZWVucykge1xuICBpZiAoIXNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3RhcmdldElkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgfVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKVxuICBpZiAoIWN1cnJlbnRTY3JlZW4ubGlua3MuaW5jbHVkZXModGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke3N0YXRlLmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7dGFyZ2V0SWR9XCJgKVxuICB9XG4gIGlmICh0YXJnZXRJZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKSByZXR1cm4gc3RhdGVcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHRhcmdldElkLFxuICAgIGhpc3Rvcnk6IFsuLi5zdGF0ZS5oaXN0b3J5LCBzdGF0ZS5jdXJyZW50U2NyZWVuSWRdLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3REZW1vRW50cnkoc3RhdGUsIGVudHJ5SWQsIHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnkgPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnb0JhY2tEZW1vKHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGhpc3RvcnkgPSBzdGF0ZS5oaXN0b3J5LnNsaWNlKDAsIC0xKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuaGlzdG9yeVtzdGF0ZS5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgIGhpc3RvcnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGVtbyhzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7IGVycm9yOiBudWxsIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9XG4gIH1cblxuICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgaW5mbykge1xuICAgIGNvbnNvbGUuZXJyb3IoYFt3aXJlZnJhbWU6JHt0aGlzLnByb3BzLnNjb3BlIHx8ICd1bmtub3duJ31dYCwgZXJyb3IsIGluZm8pXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICYmIHByZXZpb3VzUHJvcHMucmVzZXRLZXkgIT09IHRoaXMucHJvcHMucmVzZXRLZXkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZXJyb3IpIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgY29uc3QgeyBzY3JlZW5JZCwgc291cmNlLCBzY29wZSB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWVycm9yLWNhcmRcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgPHN0cm9uZz57c2NvcGUgPT09ICdzY3JlZW4nID8gYFNjcmVlbjogJHtzY3JlZW5JZH1gIDogJ0JvYXJkIGVycm9yJ308L3N0cm9uZz5cbiAgICAgICAge3NvdXJjZSA/IDxzcGFuPlNvdXJjZToge3NvdXJjZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPHNwYW4+TWVzc2FnZToge3RoaXMuc3RhdGUuZXJyb3IubWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDxwcmU+e3RoaXMuc3RhdGUuZXJyb3Iuc3RhY2t9PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsICJjb25zdCBTY3JlZW5JZGVudGl0eUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5JZGVudGl0eVByb3ZpZGVyKHsgc2NyZWVuSWQsIGNoaWxkcmVuIH0pIHtcbiAgaWYgKCFzY3JlZW5JZCkgdGhyb3cgbmV3IEVycm9yKCdTY3JlZW5JZGVudGl0eVByb3ZpZGVyIHJlcXVpcmVzIHNjcmVlbklkJylcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzY3JlZW5JZH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9TY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNjcmVlbklkKCkge1xuICBjb25zdCBzY3JlZW5JZCA9IFJlYWN0LnVzZUNvbnRleHQoU2NyZWVuSWRlbnRpdHlDb250ZXh0KVxuICBpZiAoIXNjcmVlbklkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VTY3JlZW5JZCBtdXN0IGJlIHVzZWQgaW5zaWRlIGEgcmVuZGVyZWQgc2NyZWVuJylcbiAgfVxuICByZXR1cm4gc2NyZWVuSWRcbn1cbiIsICIvKipcbiAqIFx1NzBFRFx1NTMzQVx1NEUwRVx1OERGM1x1OEY2Q1x1NzY4NFx1NTUyRlx1NEUwMFx1NTk1MVx1N0VBNlx1RkYxQVx1NTE0M1x1N0QyMFx1NUUyNiBkYXRhLWZsb3ctdG8gXHU1MzczXHU1M0VGXHU1QkZDXHU4MjJBXHUzMDAyXG4gKiBTY3JlZW5GcmFtZSBcdTU5RDRcdTYyNThcdTcwQjlcdTUxRkJcdTUxNUNcdTVFOTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMUFcdTUyQTFcdTUxOTlcdTYyMTBcdTg4Rjggc3Bhbi9kaXYgXHU1M0VBXHU2NzA5XHU1QzVFXHU2MDI3XHUzMDAxXHU2Q0ExXHU2NzA5IG9uQ2xpY2tcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGbG93VGFyZ2V0SWQoc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGlmICghc3RhcnRFbCB8fCB0eXBlb2Ygc3RhcnRFbC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbFxuICBjb25zdCBlbCA9IHN0YXJ0RWwuY2xvc2VzdCgnW2RhdGEtZmxvdy10b10nKVxuICBpZiAoIWVsKSByZXR1cm4gbnVsbFxuICBpZiAocm9vdEVsICYmIHR5cGVvZiByb290RWwuY29udGFpbnMgPT09ICdmdW5jdGlvbicgJiYgIXJvb3RFbC5jb250YWlucyhlbCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHRvID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZsb3ctdG8nKVxuICByZXR1cm4gdG8gfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCByb290RWwsIG5hdmlnYXRlKSB7XG4gIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChldmVudD8udGFyZ2V0LCByb290RWwpXG4gIGlmICghdG8pIHJldHVybiBmYWxzZVxuICBldmVudC5wcmV2ZW50RGVmYXVsdD8uKClcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICBuYXZpZ2F0ZSh0bylcbiAgcmV0dXJuIHRydWVcbn1cbiIsICJjb25zdCBUWVBFX0xBQkVMUyA9IHtcbiAgY29tbWVudDogJ1x1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXG4gIHRleHQ6ICdcdTRGRUVcdTY1MzlcdTY1ODdcdTVCNTcnLFxuICBvcmRlcjogJ1x1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RicsXG4gIHJlbW92ZTogJ1x1NTIyMFx1OTY2NFx1ODI4Mlx1NzBCOScsXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVNlbGVjdG9yVG9rZW4odmFsdWUpIHtcbiAgaWYgKGdsb2JhbFRoaXMuQ1NTPy5lc2NhcGUpIHJldHVybiBnbG9iYWxUaGlzLkNTUy5lc2NhcGUoU3RyaW5nKHZhbHVlKSlcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvW15hLXpBLVowLTlfLV0vZywgKGNoYXIpID0+IGBcXFxcJHtjaGFyfWApXG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHJpYnV0ZVZhbHVlKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG59XG5cbmZ1bmN0aW9uIGNsYXNzZXNPZihlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudD8uY2xhc3NMaXN0KSByZXR1cm4gW11cbiAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jbGFzc0xpc3QpLmZpbHRlcihCb29sZWFuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCdXNpbmVzc0NsYXNzTmFtZShuYW1lKSB7XG4gIHJldHVybiAhIW5hbWUgJiYgIW5hbWUuc3RhcnRzV2l0aCgnd2YtJykgJiYgIW5hbWUuc3RhcnRzV2l0aCgnaXMtJylcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JTY29wZShzY3JlZW5JZCkge1xuICByZXR1cm4gYFtkYXRhLXNjcmVlbi1pZD1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoc2NyZWVuSWQpfVwiXWBcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JJc1VuaXF1ZShzY3JlZW5Sb290LCBzZWxlY3Rvcikge1xuICB0cnkge1xuICAgIHJldHVybiBzY3JlZW5Sb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmxlbmd0aCA9PT0gMVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBlbGVtZW50U2VnbWVudChlbGVtZW50KSB7XG4gIGNvbnN0IHRhZyA9IChlbGVtZW50LnRhZ05hbWUgfHwgJ2RpdicpLnRvTG93ZXJDYXNlKClcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXMuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG4gIGNvbnN0IHVzYWJsZSA9IGJ1c2luZXNzLmxlbmd0aCA+IDAgPyBidXNpbmVzcyA6IGNsYXNzZXMuZmlsdGVyKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgY29uc3QgY2xhc3NQYXJ0ID0gdXNhYmxlLnNsaWNlKDAsIDIpLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJylcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgcmV0dXJuIGAke3RhZ30ke2NsYXNzUGFydH0ke2tleVBhcnR9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuSWQpIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuSWQpIHJldHVybiAnJ1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGVsZW1lbnQuaWQpfWBcblxuICBjb25zdCBzY29wZSA9IHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlc09mKGVsZW1lbnQpLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuXG4gIGZvciAoY29uc3QgbmFtZSBvZiBidXNpbmVzcykge1xuICAgIGNvbnN0IGxvY2FsID0gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9JHtrZXlQYXJ0fWBcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgaWYgKGJ1c2luZXNzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zdCBsb2NhbCA9IGJ1c2luZXNzLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJykgKyBrZXlQYXJ0XG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGNvbnN0IHNlZ21lbnRzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQpIHtcbiAgICAgIHNlZ21lbnRzLnVuc2hpZnQoYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oY3VycmVudC5pZCl9YClcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGxldCBzZWdtZW50ID0gZWxlbWVudFNlZ21lbnQoY3VycmVudClcbiAgICBjb25zdCBwYXJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgICBpZiAocGFyZW50ICYmIHBhcmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICAgIGNvbnN0IHBlZXJzID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4gfHwgW10pLmZpbHRlcihcbiAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGFnTmFtZSA9PT0gY3VycmVudC50YWdOYW1lICYmIGVsZW1lbnRTZWdtZW50KGl0ZW0pID09PSBzZWdtZW50LFxuICAgICAgKVxuICAgICAgaWYgKHBlZXJzLmxlbmd0aCA+IDEpIHNlZ21lbnQgKz0gYDpudGgtb2YtdHlwZSgke3BlZXJzLmluZGV4T2YoY3VycmVudCkgKyAxfSlgXG4gICAgfVxuICAgIHNlZ21lbnRzLnVuc2hpZnQoc2VnbWVudClcbiAgICBjb25zdCBsb2NhbCA9IHNlZ21lbnRzLmpvaW4oJyA+ICcpXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgICBjdXJyZW50ID0gcGFyZW50XG4gIH1cblxuICByZXR1cm4gYCR7c2NvcGV9ICR7c2VnbWVudHMuam9pbignID4gJykgfHwgZWxlbWVudFNlZ21lbnQoZWxlbWVudCl9YFxufVxuXG5mdW5jdGlvbiBkaXNwbGF5TGFiZWwoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlbGVtZW50LmlkfWBcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBzZW1hbnRpYyA9IGNsYXNzZXMuZmluZChpc0J1c2luZXNzQ2xhc3NOYW1lKSB8fCBjbGFzc2VzLmZpbmQoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICByZXR1cm4gc2VtYW50aWMgPyBgLiR7c2VtYW50aWN9YCA6IChlbGVtZW50LnRhZ05hbWUgfHwgJ25vZGUnKS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIHJlYWRUZXh0KGVsZW1lbnQpIHtcbiAgY29uc3QgdmFsdWUgPSAndmFsdWUnIGluIGVsZW1lbnQgJiYgdHlwZW9mIGVsZW1lbnQudmFsdWUgPT09ICdzdHJpbmcnXG4gICAgPyBlbGVtZW50LnZhbHVlXG4gICAgOiBlbGVtZW50LnRleHRDb250ZW50IHx8ICcnXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG4gIHJldHVybiBub3JtYWxpemVkLmxlbmd0aCA+IDI0MCA/IGAke25vcm1hbGl6ZWQuc2xpY2UoMCwgMjM3KX0uLi5gIDogbm9ybWFsaXplZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFJldmlld1RhcmdldCh0YXJnZXQsIGNvbnRlbnRSb290KSB7XG4gIGxldCBjdXJyZW50ID0gdGFyZ2V0Py5ub2RlVHlwZSA9PT0gMSA/IHRhcmdldCA6IHRhcmdldD8ucGFyZW50RWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkIHx8IGNsYXNzZXNPZihjdXJyZW50KS5sZW5ndGggPiAwKSByZXR1cm4gY3VycmVudFxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4pIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuKSByZXR1cm4gbnVsbFxuICBjb25zdCBhbmNlc3RvcnMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBhbmNlc3RvcnMudW5zaGlmdCh7XG4gICAgICBlbGVtZW50OiBjdXJyZW50LFxuICAgICAgbGFiZWw6IGRpc3BsYXlMYWJlbChjdXJyZW50KSxcbiAgICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGN1cnJlbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIH0pXG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50LFxuICAgIGNvbnRlbnRSb290LFxuICAgIHNjcmVlbklkOiBzY3JlZW4uaWQsXG4gICAgc2NyZWVuVGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICBzb3VyY2VIaW50OiBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGAsXG4gICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgdGFnTmFtZTogKGVsZW1lbnQudGFnTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSxcbiAgICBjbGFzc05hbWVzOiBjbGFzc2VzT2YoZWxlbWVudCksXG4gICAgY3VycmVudFRleHQ6IHJlYWRUZXh0KGVsZW1lbnQpLFxuICAgIGFuY2VzdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpdGVtUmVxdWVzdChpdGVtKSB7XG4gIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0JykgcmV0dXJuIGBcdTRGRUVcdTY1MzlcdTRFM0FcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAnb3JkZXInKSByZXR1cm4gYFx1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdyZW1vdmUnKSByZXR1cm4gYFx1NTIyMFx1OTY2NFx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31gXG4gIHJldHVybiBpdGVtLmluc3RydWN0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZpZXdUYXJnZXRzKGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbT8udGFyZ2V0cykgJiYgaXRlbS50YXJnZXRzLmxlbmd0aCA+IDApIHJldHVybiBpdGVtLnRhcmdldHNcbiAgaWYgKCFpdGVtPy5zZWxlY3RvcikgcmV0dXJuIFtdXG4gIHJldHVybiBbe1xuICAgIHNjcmVlbklkOiBpdGVtLnNjcmVlbklkLFxuICAgIHNjcmVlblRpdGxlOiBpdGVtLnNjcmVlblRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGl0ZW0uc291cmNlSGludCxcbiAgICBzZWxlY3RvcjogaXRlbS5zZWxlY3RvcixcbiAgICBjdXJyZW50VGV4dDogaXRlbS5jdXJyZW50VGV4dCxcbiAgfV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcHJvamVjdD8ubmFtZSB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCJ1xuXG4gIGNvbnN0IGxpbmVzID0gW1xuICAgIGBcdThCRjdcdTRGRUVcdTY1MzlcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEJcdTMwMEMke3Byb2plY3ROYW1lfVx1MzAwRFx1MzAwMmAsXG4gICAgJycsXG4gICAgJ1x1NEZFRVx1NjUzOVx1N0VBNlx1Njc1Rlx1RkYxQScsXG4gICAgJy0gXHU1M0VBXHU0RkVFXHU2NTM5XHU0RTFBXHU1MkExIHNyYy9cdUZGMUJcdTRFMERcdTg5ODFcdTRGRUVcdTY1MzkgZnJhbWV3b3JrLyBcdTYyMTYgZGlzdC9hcHAuanNcdTMwMDInLFxuICAgICctIFx1OTAxQVx1OEZDNyBET00gXHU5MDA5XHU2MkU5XHU1NjY4XHU1NzI4IEpTWCBcdTRFMkRcdTY0MUNcdTdEMjJcdTVCRjlcdTVFOTRcdTc2ODQgaWRcdTMwMDFjbGFzc05hbWUgXHU2MjE2IGRhdGEtd2Yta2V5XHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTc1NTlcdTYyNDBcdTY3MDlcdThCRURcdTRFNDkgY2xhc3NcdTMwMDFcdTUxNzNcdTk1MkVcdTgyODJcdTcwQjkgaWQgXHU1NDhDXHU5MUNEXHU1OTBEXHU2NTcwXHU2MzZFXHU4MjgyXHU3MEI5XHU3Njg0IGRhdGEtd2Yta2V5XHVGRjFCXHU2NUIwXHU1ODlFXHU4MjgyXHU3MEI5XHU0RTVGXHU5MDc1XHU1Qjg4XHU1NDBDXHU0RTAwXHU1NDdEXHU1NDBEXHU4OUM0XHU1MjE5XHUzMDAyJyxcbiAgICAnLSBcdTRGRUVcdTY1Mzkgc2NyZWVucy9sYXlvdXRzIFx1NjVGNlx1NEZERFx1NzU1OVx1MzAwQ1x1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RVx1MzAwRFx1RkYwQ1x1NUU3Nlx1NjI4QVx1MzAwQ1x1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RVx1MzAwRFx1NTNDQSBAd2lyZWZyYW1lLXNraWxsIFx1NjZGNFx1NjVCMFx1NEUzQVx1NUY1M1x1NTI0RCBza2lsbCBcdTcyNDhcdTY3MkNcdTMwMDInLFxuICAgICctIFx1NEZERFx1NjMwMSBwcm9qZWN0LmxpbmtzIFx1NEUzQVx1OTg3NVx1OTc2Mlx1NkQ0MVx1NzY4NFx1NTUyRlx1NEUwMFx1OEZCOVx1NjU3MFx1NjM2RVx1RkYxQlx1NUI4Q1x1NjIxMFx1NTQwRVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NUU3Nlx1OUE4Q1x1OEJDMVx1NzUzQlx1Njc3Rlx1MzAwMVx1NkYxNFx1NzkzQVx1NTQ4Q1x1NUJBMVx1OTYwNVx1NkEyMVx1NUYwRlx1MzAwMicsXG4gIF1cblxuICBpZiAoIWl0ZW1zPy5sZW5ndGgpIHtcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU2Q0ExXHU2NzA5XHU1QkExXHU5NjA1XHU2MTBGXHU4OUMxXHUzMDAyJylcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXZpZXdUYXJnZXRzKGl0ZW0pXG4gICAgbGluZXMucHVzaCgnJywgYCMjIFx1NEZFRVx1NjUzOSAke2l0ZW1JbmRleCArIDF9XHVGRjFBJHtUWVBFX0xBQkVMU1tpdGVtLnR5cGVdIHx8IFRZUEVfTEFCRUxTLmNvbW1lbnR9YClcbiAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHNjcmVlbklkID0gdGFyZ2V0LnNjcmVlbklkIHx8IGl0ZW0uc2NyZWVuSWRcbiAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICcnLFxuICAgICAgICBgXHU3NkVFXHU2ODA3ICR7dGFyZ2V0SW5kZXggKyAxfVx1RkYxQSR7dGFyZ2V0LnNjcmVlblRpdGxlIHx8IGl0ZW0uc2NyZWVuVGl0bGUgfHwgc2NyZWVuSWQgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1OTg3NVx1OTc2Mid9YCxcbiAgICAgICAgYFx1OTg3NVx1OTc2MiBJRFx1RkYxQSR7c2NyZWVuSWQgfHwgJ1x1NjcyQVx1NzdFNSd9YCxcbiAgICAgICAgYFx1NkU5MFx1NzgwMVx1NjNEMFx1NzkzQVx1RkYxQSR7dGFyZ2V0LnNvdXJjZUhpbnQgfHwgaXRlbS5zb3VyY2VIaW50IHx8IChzY3JlZW5JZCA/IGBzcmMvc2NyZWVucy8ke3NjcmVlbklkfS5qc3hgIDogJ1x1OEJGN1x1NjQxQ1x1N0QyMlx1OTAwOVx1NjJFOVx1NTY2OCcpfWAsXG4gICAgICAgICdET00gXHU5MDA5XHU2MkU5XHU1NjY4XHVGRjFBJyxcbiAgICAgICAgYFxcYCR7dGFyZ2V0LnNlbGVjdG9yfVxcYGAsXG4gICAgICApXG4gICAgICBpZiAodGFyZ2V0LmN1cnJlbnRUZXh0KSBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5XHVGRjFBJywgdGFyZ2V0LmN1cnJlbnRUZXh0KVxuICAgIH0pXG4gICAgbGluZXMucHVzaCgnJywgJ1x1NEZFRVx1NjUzOVx1ODk4MVx1NkM0Mlx1RkYxQScsIGl0ZW1SZXF1ZXN0KGl0ZW0pKVxuICB9KVxuXG4gIGxpbmVzLnB1c2goXG4gICAgJycsXG4gICAgJyMjIFx1NUI4Q1x1NjIxMFx1NjgwN1x1NTFDNicsXG4gICAgJy0gXHU5MDEwXHU5ODc5XHU1QjhDXHU2MjEwXHU0RUU1XHU0RTBBXHU0RkVFXHU2NTM5XHVGRjFCXHU4MkU1XHU5MDA5XHU2MkU5XHU1NjY4XHU1QkY5XHU1RTk0XHU1MTcxXHU0RUFCIGxheW91dFx1RkYwQ1x1OEJGN1x1NEZFRVx1NjUzOVx1NzcxRlx1NUI5RVx1NUI5QVx1NEU0OVx1NEY0RFx1N0Y2RVx1RkYwQ1x1NEUwRFx1ODk4MVx1NTcyOCBzY3JlZW4gXHU0RTJEXHU1OTBEXHU1MjM2XHU1QjlFXHU3M0IwXHUzMDAyJyxcbiAgICAnLSBcdTRFMERcdTc1MjggRE9NIFx1NUM0Mlx1N0VBN1x1NjIxNiBudGgtY2hpbGQgXHU2NkZGXHU0RUUzXHU1REYyXHU2NzA5XHU3Njg0XHU3QTMzXHU1QjlBXHU0RTFBXHU1MkExXHU5MDA5XHU2MkU5XHU1NjY4XHUzMDAyJyxcbiAgICAnLSBcdTY3ODRcdTVFRkFcdTYyMTBcdTUyOUZcdTU0MEVcdTY4QzBcdTY3RTVcdTUzRDdcdTVGNzFcdTU0Q0RcdTk4NzVcdTk3NjJcdTUzQ0FcdTUxNzZcdTRFMEFcdTRFMEJcdTZFMzhcdThERjNcdThGNkNcdTMwMDInLFxuICApXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxufVxuXG5leHBvcnQgY29uc3QgUkVWSUVXX1RZUEVfTEFCRUxTID0gVFlQRV9MQUJFTFNcbiIsICJpbXBvcnQgeyBpc1Njcm9sbGFibGVPdmVyZmxvdyB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuY29uc3QgU1RZTEVfS0VZUyA9IFtcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdtaW5XaWR0aCcsXG4gICdtaW5IZWlnaHQnLFxuICAnb3ZlcmZsb3cnLFxuICAnb3ZlcmZsb3dYJyxcbiAgJ292ZXJmbG93WScsXG4gICdtYXhXaWR0aCcsXG4gICdtYXhIZWlnaHQnLFxuXVxuXG4vKiogXHU4MjgyXHU3MEI5XHU1RjUzXHU1MjREXHU2NjJGXHU1NDI2XHU1NkUwIG92ZXJmbG93IFx1NEVBN1x1NzUxRlx1NTNFRlx1NkVEQVx1NTJBOFx1NkVBMlx1NTFGQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShlbCkge1xuICBpZiAoIWVsIHx8IGVsLm5vZGVUeXBlICE9PSAxKSByZXR1cm4gZmFsc2VcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0ICsgMVxuICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBlbC5zY3JvbGxXaWR0aCA+IGVsLmNsaWVudFdpZHRoICsgMVxuICByZXR1cm4gY2FuWSB8fCBjYW5YXG59XG5cbmZ1bmN0aW9uIGRlcHRoRnJvbShyb290RWwsIGVsKSB7XG4gIGxldCBkZXB0aCA9IDBcbiAgbGV0IG5vZGUgPSBlbFxuICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByb290RWwpIHtcbiAgICBkZXB0aCArPSAxXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBkZXB0aFxufVxuXG4vKipcbiAqIFx1NjUzNlx1OTZDNlx1OTcwMFx1NjQ5MVx1NUYwMFx1NzY4NFx1ODI4Mlx1NzBCOVx1RkYxQVx1NTNFRlx1NkVEQVx1NTJBOFx1ODI4Mlx1NzBCOSArIFx1NEUwQVx1NkVBRlx1NTIzMCByb290IFx1NzY4NFx1Nzk1Nlx1NTE0OFx1MzAwMlxuICogXHU2REYxXHU4MjgyXHU3MEI5XHU1NzI4XHU1MjREXHVGRjBDXHU1MTQ4XHU2NDkxXHU1MTg1XHU1QzQyXHU1MThEXHU2NDkxXHU1OTE2XHU1OEYzXHVGRjA4XHU5MDdGXHU1MTREIGdyaWQgLyB3aWR0aDoxMDAlIFx1NjI4QVx1NTkxNlx1Njg0Nlx1NTM2MVx1NkI3Qlx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpIHtcbiAgaWYgKCFyb290RWwpIHJldHVybiBbXVxuICBjb25zdCBzY3JvbGxhYmxlcyA9IFtdXG4gIGNvbnN0IHZpc2l0ID0gKG5vZGUpID0+IHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gPyBBcnJheS5mcm9tKG5vZGUuY2hpbGRyZW4pIDogW11cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB2aXNpdChjaGlsZClcbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsIHx8IGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShub2RlKSkgc2Nyb2xsYWJsZXMucHVzaChub2RlKVxuICB9XG4gIHZpc2l0KHJvb3RFbClcblxuICBjb25zdCBzZXQgPSBuZXcgU2V0KHNjcm9sbGFibGVzKVxuICBmb3IgKGNvbnN0IGVsIG9mIHNjcm9sbGFibGVzKSB7XG4gICAgLy8gcm9vdCBcdTY3MkNcdThFQUJcdTVERjJcdTU3MjhcdTk2QzZcdTU0MDhcdTRFMkRcdUZGMUJcdTRFQ0VcdTVCODNcdTc2ODRcdTcyMzZcdTgyODJcdTcwQjlcdTdFRTdcdTdFRURcdTRFMEFcdTZFQUZcdTRGMUFcdThEOEFcdThGQzcgc2NyZWVuIFx1OEZCOVx1NzU0Q1x1RkYwQ1xuICAgIC8vIFx1NjI4QSBTY3JlZW5GcmFtZVx1MzAwMWNhbnZhc1x1MzAwMWJvYXJkIFx1NzUxQVx1ODFGMyBib2R5L2h0bWwgXHU0RTAwXHU1RTc2XHU2NTM5XHU1MTk5XHUzMDAyXG4gICAgaWYgKGVsID09PSByb290RWwpIGNvbnRpbnVlXG4gICAgbGV0IG5vZGUgPSBlbC5wYXJlbnRFbGVtZW50XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIHNldC5hZGQobm9kZSlcbiAgICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi5zZXRdLnNvcnQoKGEsIGIpID0+IGRlcHRoRnJvbShyb290RWwsIGIpIC0gZGVwdGhGcm9tKHJvb3RFbCwgYSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbmFwc2hvdElubGluZUJveChlbCkge1xuICBjb25zdCBvdXQgPSB7fVxuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSBvdXRba2V5XSA9IGVsLnN0eWxlW2tleV0gfHwgJydcbiAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUlubGluZUJveChlbCwgc25hcHNob3QpIHtcbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykge1xuICAgIGVsLnN0eWxlW2tleV0gPSBzbmFwc2hvdFtrZXldIHx8ICcnXG4gIH1cbn1cblxuLyoqXG4gKiBvZmZzZXRUb3AgLyBvZmZzZXRMZWZ0IFx1NzZGOFx1NUJGOSBvZmZzZXRQYXJlbnRcdUZGMENcdTgwMENcdTRFMERcdTRFMDBcdTVCOUFcdTc2RjhcdTVCRjlcdTc2RjRcdTYzQTVcdTcyMzZcdTgyODJcdTcwQjlcdTMwMDJcbiAqIFx1NTQwRVx1NTNGMFx1OTg3NVx1OTFDQ1x1OEZERVx1N0VFRFx1NzY4NCBzdGF0aWMgXHU1QkI5XHU1NjY4XHU5MDFBXHU1RTM4XHU1MTcxXHU0RUFCIHNjcmVlbiByb290IFx1NEY1Q1x1NEUzQSBvZmZzZXRQYXJlbnRcdUZGMENcbiAqIFx1NTZFMFx1NkI2NFx1OTcwMFx1ODk4MVx1NTE0OFx1NjM2Mlx1N0I5N1x1NTIzMFx1NUY1M1x1NTI0RFx1NzIzNlx1ODI4Mlx1NzBCOVx1NTc1MFx1NjgwN1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OTAxMFx1NUM0Mlx1OTFDRFx1NTkwRFx1N0QyRlx1NTJBMFx1NTQwQ1x1NEUwMFx1NkJCNVx1NTA0Rlx1NzlGQlx1MzAwMlxuICovXG5mdW5jdGlvbiBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgYXhpcykge1xuICBjb25zdCBvZmZzZXRLZXkgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0TGVmdCcgOiAnb2Zmc2V0VG9wJ1xuICBjb25zdCByZWN0U3RhcnQgPSBheGlzID09PSAneCcgPyAnbGVmdCcgOiAndG9wJ1xuICBjb25zdCByZWN0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICBjb25zdCBsYXlvdXRTaXplID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG4gIGNvbnN0IHNjcm9sbEtleSA9IGF4aXMgPT09ICd4JyA/ICdzY3JvbGxMZWZ0JyA6ICdzY3JvbGxUb3AnXG4gIGNvbnN0IGNoaWxkT2Zmc2V0ID0gY2hpbGRbb2Zmc2V0S2V5XSB8fCAwXG5cbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwpIHJldHVybiBjaGlsZE9mZnNldFxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ICYmIGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwub2Zmc2V0UGFyZW50KSB7XG4gICAgcmV0dXJuIGNoaWxkT2Zmc2V0IC0gKGVsW29mZnNldEtleV0gfHwgMClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IHBhcmVudFJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNoaWxkUmVjdCA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgcmVuZGVyZWRTaXplID0gcGFyZW50UmVjdFtyZWN0U2l6ZV1cbiAgICBjb25zdCBzY2FsZSA9IGVsW2xheW91dFNpemVdID4gMCAmJiByZW5kZXJlZFNpemUgPiAwXG4gICAgICA/IHJlbmRlcmVkU2l6ZSAvIGVsW2xheW91dFNpemVdXG4gICAgICA6IDFcbiAgICBjb25zdCBzdGFydCA9IChjaGlsZFJlY3RbcmVjdFN0YXJ0XSAtIHBhcmVudFJlY3RbcmVjdFN0YXJ0XSkgLyBzY2FsZVxuICAgICAgKyAoZWxbc2Nyb2xsS2V5XSB8fCAwKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoc3RhcnQpKSByZXR1cm4gc3RhcnRcbiAgfVxuXG4gIHJldHVybiBjaGlsZE9mZnNldFxufVxuXG4vKipcbiAqIG92ZXJmbG93OnZpc2libGUgXHU2NUY2XHU5MEU4XHU1MjA2XHU2RDRGXHU4OUM4XHU1NjY4IHNjcm9sbFdpZHRoIFx1MjI0OCBjbGllbnRXaWR0aFx1RkYwQ1xuICogXHU2MjQwXHU0RUU1XHU1MThEXHU2MjZCXHU1QjUwXHU4MjgyXHU3MEI5IG9mZnNldCBcdThGQjlcdTc1NENcdUZGMENcdTkwN0ZcdTUxNERcdTVCQkRcdTg4NjhcdTY0OTFcdTRFMERcdTVGMDBcdTU5MTZcdTY4NDZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpIHtcbiAgbGV0IHdpZHRoID0gTWF0aC5tYXgoZWwuc2Nyb2xsV2lkdGggfHwgMCwgZWwub2Zmc2V0V2lkdGggfHwgMClcbiAgbGV0IGhlaWdodCA9IE1hdGgubWF4KGVsLnNjcm9sbEhlaWdodCB8fCAwLCBlbC5vZmZzZXRIZWlnaHQgfHwgMClcbiAgY29uc3QgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbiA/IEFycmF5LmZyb20oZWwuY2hpbGRyZW4pIDogW11cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneCcpICsgKGNoaWxkLm9mZnNldFdpZHRoIHx8IDApKVxuICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd5JykgKyAoY2hpbGQub2Zmc2V0SGVpZ2h0IHx8IDApKVxuICB9XG4gIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlFeHBhbmRlZEJveChlbCkge1xuICBlbC5zdHlsZS5tYXhXaWR0aCA9ICdub25lJ1xuICBlbC5zdHlsZS5tYXhIZWlnaHQgPSAnbm9uZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3cgPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dYID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WSA9ICd2aXNpYmxlJ1xuICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpXG4gIGVsLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgZWwuc3R5bGUubWluV2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUubWluSGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxufVxuXG4vKiogXHU2NDkxXHU1RjAwIHJvb3QgXHU1MTg1XHU2MjQwXHU2NzA5XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1M0NBXHU1MTc2XHU3OTU2XHU1MTQ4XHVGRjFCXHU4RkQ0XHU1NkRFXHU3NTI4XHU0RThFXHU2NTM2XHU4RDc3XHU3Njg0XHU1RkVCXHU3MTY3XHU1MjE3XHU4ODY4ICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kU2NyZWVuQ29udGVudChyb290RWwpIHtcbiAgY29uc3Qgbm9kZXMgPSBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbClcbiAgY29uc3Qgc25hcHNob3RzID0gbm9kZXMubWFwKChlbCkgPT4gKHsgZWwsIHN0eWxlOiBzbmFwc2hvdElubGluZUJveChlbCkgfSkpXG4gIGZvciAoY29uc3QgeyBlbCB9IG9mIHNuYXBzaG90cykgYXBwbHlFeHBhbmRlZEJveChlbClcbiAgLy8gXHU1QjUwXHU3RUE3XHU2NDkxXHU1RjAwXHU1NDBFXHVGRjBDXHU2ODM5XHU1MThEXHU5MUNGXHU0RTAwXHU2QjIxXHVGRjBDXHU1NDAzXHU2Mzg5XHU2QjhCXHU0RjU5XHU2RUEyXHU1MUZBXG4gIGFwcGx5RXhwYW5kZWRCb3gocm9vdEVsKVxuICByZXR1cm4gc25hcHNob3RzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoc25hcHNob3RzKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzbmFwc2hvdHMpKSByZXR1cm5cbiAgZm9yIChjb25zdCB7IGVsLCBzdHlsZSB9IG9mIHNuYXBzaG90cykgcmVzdG9yZUlubGluZUJveChlbCwgc3R5bGUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlQ29udGVudEJveChyb290RWwpIHtcbiAgcmV0dXJuIG1lYXN1cmVJbnRyaW5zaWNCb3gocm9vdEVsKVxufVxuXG4vKipcbiAqIFx1NURFNVx1NTE3N1x1NjgwRlx1NUM1NVx1NUYwMC9cdTY1MzZcdThENzdcdTc2RUVcdTY4MDdcdUZGMUFcbiAqIFx1NjcwOVx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MkZFXHU5MDA5XHU5NkM2XHU1NDA4XHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUxNjhcdTkwRThcdTVDNEZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxJZHMpIHtcbiAgaWYgKHNlbGVjdGVkSWRzIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgaWYgKHNlbGVjdGVkSWRzLnNpemUgPiAwKSByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0ZWRJZHMpICYmIHNlbGVjdGVkSWRzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9XG4gIHJldHVybiBbLi4uYWxsSWRzXVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFNjcmVlbklkZW50aXR5UHJvdmlkZXIgfSBmcm9tICcuLi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcbmltcG9ydCB7IGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4uL3VpL2Zsb3ctdGFyZ2V0LmpzJ1xuaW1wb3J0IHsgZmluZFJldmlld1RhcmdldCB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuaW1wb3J0IHtcbiAgY29sbGFwc2VTY3JlZW5Db250ZW50LFxuICBleHBhbmRTY3JlZW5Db250ZW50LFxuICBtZWFzdXJlQ29udGVudEJveCxcbn0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQge1xuICBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsLFxuICBlbmRDb250ZW50RHJhZ1Njcm9sbCxcbiAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsLFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5GcmFtZSh7XG4gIHNjcmVlbixcbiAgdmlld3BvcnQsXG4gIG1vZGUsXG4gIGluZGV4ID0gMCxcbiAgZm9jdXNlZCA9IGZhbHNlLFxuICBvbkV4cG9ydCxcbiAgZXhwYW5kZWQgPSBmYWxzZSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIGNhbnZhc0xvY2tlZCA9IGZhbHNlLFxuICBzY2FsZSA9IDEsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG59KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGNvbnRlbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBleHBhbmRTbmFwc2hvdFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBob3ZlclJldmlld0VsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2RyYWdTY3JvbGxpbmcsIHNldERyYWdTY3JvbGxpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZEJveCwgc2V0RXhwYW5kZWRCb3hdID0gUmVhY3QudXNlU3RhdGUobnVsbClcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBjb250ZW50UmVmLmN1cnJlbnRcbiAgICBpZiAoIXJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgaWYgKGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAoIWV4cGFuZGVkKSB7XG4gICAgICBzZXRFeHBhbmRlZEJveChudWxsKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBleHBhbmRTY3JlZW5Db250ZW50KHJvb3QpXG4gICAgc2V0RXhwYW5kZWRCb3gobWVhc3VyZUNvbnRlbnRCb3gocm9vdCkpXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9LCBbZXhwYW5kZWQsIHNjcmVlbj8uaWQsIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHRdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbcmV2aWV3RW5hYmxlZCwgc2NyZWVuPy5pZF0pXG5cbiAgaWYgKCFzY3JlZW4pIHJldHVybiBudWxsXG5cbiAgY29uc3QgQ29tcG9uZW50ID0gc2NyZWVuLmNvbXBvbmVudFxuICBjb25zdCBmcmFtZUNsYXNzID0gW1xuICAgICd3Zi1zY3JlZW4tY2hyb21lJyxcbiAgICBtb2RlID09PSAnY2FudmFzJyAmJiBmb2N1c2VkID8gJ2lzLWZvY3VzZWQnIDogJycsXG4gICAgZXhwYW5kZWQgPyAnaXMtZXhwYW5kZWQnIDogJycsXG4gICAgYHdmLXNjcmVlbi0ke21vZGV9YCxcbiAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpXG5cbiAgY29uc3Qgb25Qb2ludGVyRG93biA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFMERcdTYzQTVcdTdCQTFcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMENcdThCQTlcdTRFOEJcdTRFRjZcdTg0M0RcdTUyMzBcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcbiAgICBpZiAoY2FudmFzTG9ja2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1REYyXHU1QzU1XHU1RjAwXHU2NUUwXHU1M0VGXHU2RURBXHU1MzNBXHU1N0RGXHVGRjBDXHU0RTBEXHU2MkEyXHU2MzA3XHU5NDg4XG4gICAgaWYgKGV4cGFuZGVkKSByZXR1cm5cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBsb2NrZWQ6IGNhbnZhc0xvY2tlZCwgc2NhbGUgfSlcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBzdGF0ZVxuICAgIHNldERyYWdTY3JvbGxpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlck1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICAgIGlmICh0YXJnZXQgPT09IGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50KSByZXR1cm5cbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICB0YXJnZXQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gdGFyZ2V0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIG5hdmlnYXRlKVxuICB9XG5cbiAgY29uc3Qgb25SZXZpZXdDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgb25SZXZpZXdTZWxlY3Q/Lih0YXJnZXQsIHNjcmVlbiwgY29udGVudFJlZi5jdXJyZW50LCB7XG4gICAgICBhZGRpdGl2ZTogZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5LFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjbGVhclJldmlld0hvdmVyID0gKCkgPT4ge1xuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gIH1cblxuICBjb25zdCBjb250ZW50U3R5bGUgPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveFxuICAgID8geyB3aWR0aDogZXhwYW5kZWRCb3gud2lkdGgsIGhlaWdodDogZXhwYW5kZWRCb3guaGVpZ2h0LCBvdmVyZmxvdzogJ3Zpc2libGUnIH1cbiAgICA6IHsgd2lkdGg6IHZpZXdwb3J0LndpZHRoLCBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodCB9XG5cbiAgY29uc3QgZnJhbWVXaWR0aCA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94ID8gZXhwYW5kZWRCb3gud2lkdGggOiB2aWV3cG9ydC53aWR0aFxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb25cbiAgICAgIGNsYXNzTmFtZT17ZnJhbWVDbGFzc31cbiAgICAgIGRhdGEtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICBkYXRhLWV4cGFuZGVkPXtleHBhbmRlZCA/ICd0cnVlJyA6ICdmYWxzZSd9XG4gICAgICBzdHlsZT17eyB3aWR0aDogZnJhbWVXaWR0aCB9fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1sYWJlbFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXRpdGxlXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWZpbGVcIj57c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1hY3Rpb25zXCI+XG4gICAgICAgICAge29uVG9nZ2xlRXhwYW5kID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtZXhwYW5kLW9uZVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3JyA6ICdcdTVDNTVcdTVGMDAnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnICYmIG9uRXhwb3J0ID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtZXhwb3J0LW9uZVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgb25FeHBvcnQoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBcdTVCRkNcdTUxRkEgUE5HXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17Y29udGVudFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLWNvbnRlbnQke2RyYWdTY3JvbGxpbmcgPyAnIGlzLWRyYWctc2Nyb2xsaW5nJyA6ICcnfSR7ZXhwYW5kZWQgPyAnIGlzLWV4cGFuZGVkJyA6ICcnfSR7cmV2aWV3RW5hYmxlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXtjb250ZW50U3R5bGV9XG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e29uUG9pbnRlck1vdmV9XG4gICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJMZWF2ZT17Y2xlYXJSZXZpZXdIb3Zlcn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e29uUmV2aWV3Q2xpY2t9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShlbCwgZ2V0U2NhbGUsIHNldFNjYWxlLCBnZXRMb2NrZWQgPSAoKSA9PiBmYWxzZSkge1xuICBpZiAoIWVsKSByZXR1cm4gKCkgPT4ge31cbiAgY29uc3Qgb25XaGVlbCA9IChldmVudCkgPT4ge1xuICAgIGlmICghc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkOiBnZXRMb2NrZWQoKSB9KSkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldFNjYWxlKGNsYW1wU2NhbGUoZ2V0U2NhbGUoKSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSkge1xuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgbG9ja2VkUmVmID0gUmVhY3QudXNlUmVmKGxvY2tlZClcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGxvY2tlZFJlZi5jdXJyZW50ID0gbG9ja2VkXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayh0YXNrLCBzZXRFcnJvcikge1xuICBzZXRFcnJvcihudWxsKVxuICB0cnkge1xuICAgIGF3YWl0IHRhc2soKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcbiAgICBzZXRFcnJvcihgXHU1QkZDXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjFBJHttZXNzYWdlfWApXG4gIH1cbn1cblxuLyoqIGZpbGU6Ly8gXHU0RTBEXHU2NjJGIHNlY3VyZSBjb250ZXh0XHVGRjBDY2xpcGJvYXJkIEFQSSBcdTVFMzhcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENleGVjQ29tbWFuZCBcdTUxNUNcdTVFOTUgKi9cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkge1xuICAgIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICB9XG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc01vZGUoe1xuICBwcm9qZWN0LFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2VsZWN0ZWRJZHMsXG4gIHNldFNlbGVjdGVkSWRzLFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIG9uRXhwb3J0SWRzLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkS2V5LCBzZXRDb3BpZWRLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2NvcHlUb2FzdCwgc2V0Q29weVRvYXN0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY2FudmFzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNvcGllZFRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBkcmFnZ2luZ1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBzY2FsZVJlZi5jdXJyZW50ID0gc2NhbGVcbiAgZHJhZ2dpbmdSZWYuY3VycmVudCA9IGRyYWdnaW5nXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBjdXJyZW50LnNjYWxlIH0pKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmdSZWYuY3VycmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgYXBwbHkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgICBpZiAoIWNhbnZhcyB8fCAhc3RhZ2UpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc2NyZWVuRWwgPSBzdGFnZS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYW52YXMtc2NyZWVuLWlkPVwiJHtjdXJyZW50U2NyZWVuSWR9XCJdYClcbiAgICAgIGlmICghc2NyZWVuRWwpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3QgY3VycmVudFNjYWxlID0gc2NhbGVSZWYuY3VycmVudFxuICAgICAgaWYgKGN1cnJlbnRTY2FsZSA8PSAwKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHN0YWdlQm94ID0gc3RhZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNjcmVlbkJveCA9IHNjcmVlbkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBuZXh0ID0gZm9jdXNDYW52YXNTY3JlZW4oe1xuICAgICAgICBjb250YWluZXJXaWR0aDogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQsXG4gICAgICAgIHNjcmVlbkxlZnQ6IChzY3JlZW5Cb3gubGVmdCAtIHN0YWdlQm94LmxlZnQpIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5Ub3A6IChzY3JlZW5Cb3gudG9wIC0gc3RhZ2VCb3gudG9wKSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbkJveC53aWR0aCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW5Cb3guaGVpZ2h0IC8gY3VycmVudFNjYWxlLFxuICAgICAgICBjdXJyZW50U2NhbGUsXG4gICAgICB9KVxuICAgICAgaWYgKCFuZXh0KSByZXR1cm4gZmFsc2VcbiAgICAgIHNldFNjYWxlKG5leHQuc2NhbGUpXG4gICAgICBzZXRWaWV3KG5leHQpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChhcHBseSgpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgZnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGFwcGx5KClcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpXG4gIH0sIFtjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0S2V5LCBzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICB1c2VXaGVlbFpvb20oY2FudmFzUmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBlbnRlckRlbW8gPSAoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIWRlbW9BdmFpbGFibGUgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBlbnRlckRlbW9Nb2RlKHNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY29weU1ldGEgPSAoa2V5LCB0ZXh0LCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvcHlUZXh0KHRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkS2V5KGtleSlcbiAgICAgIHNldENvcHlUb2FzdCgnXHU1REYyXHU1OTBEXHU1MjM2JylcbiAgICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3BpZWRUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWRLZXkobnVsbClcbiAgICAgICAgc2V0Q29weVRvYXN0KG51bGwpXG4gICAgICB9LCAxMjAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVTZWxlY3RlZCA9IChpZCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlQWxsID0gKCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpXG4gICAgICByZXR1cm4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tc2lkZWJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItaGVhZGVyXCI+XG4gICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGggJiYgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA+IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0b2dnbGVBbGx9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgXHU1MTY4XHU5MDA5XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwc1wiIGFyaWEtbGFiZWw9XCJcdTY0Q0RcdTRGNUNcdTYzRDBcdTc5M0FcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkIgLyBcdTZFREFcdThGNkVcdTdGMjlcdTY1M0U8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU3QTdBXHU2ODNDXHU2MkQ2XHU2MkZEIC8gQ3RybCtcdTZFREFcdThGNkU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hc2lkZT5cbiAgICAgIDxtYWluXG4gICAgICAgIHJlZj17Y2FudmFzUmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1jYW52YXMke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gXG4gICAgICAgICAgICBjb25zdCBmaWxlVGV4dCA9IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgY29uc3QgdGl0bGVLZXkgPSBgJHtzY3JlZW4uaWR9OnRpdGxlYFxuICAgICAgICAgICAgY29uc3QgZmlsZUtleSA9IGAke3NjcmVlbi5pZH06ZmlsZWBcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1zY3JlZW4gaXMtZm9jdXNlZCcgOiAnd2YtY2FudmFzLXNjcmVlbid9XG4gICAgICAgICAgICAgICAgZGF0YS1jYW52YXMtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tbWV0YS10aXRsZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKHRpdGxlS2V5LCB0aXRsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RpdGxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3NjcmVlbi5kZXNjcmlwdGlvbiA/IDxkaXY+e3NjcmVlbi5kZXNjcmlwdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1tZXRhLWxpbmUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEoZmlsZUtleSwgZmlsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5cdTY1ODdcdTRFRjZcdUZGMUE8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgICAgICAgIG1vZGU9XCJjYW52YXNcIlxuICAgICAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgZm9jdXNlZD17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgICAgICBleHBhbmRlZD17ZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17KCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uRXhwb3J0PXsoKSA9PiBvbkV4cG9ydElkcyhbc2NyZWVuLmlkXSl9XG4gICAgICAgICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4XCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWxhYmVsXCI+XHU3RDIyXHU1RjE1PC9zcGFuPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWxpc3RcIj5cbiAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2Ake2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXAtZmlsZVwiPnNyYy9zY3JlZW5zL3tzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9tYWluPlxuICAgICAge2NvcHlUb2FzdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b2FzdFwiIHJvbGU9XCJzdGF0dXNcIj57Y29weVRvYXN0fTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHtcbiAgZml0RGVtb1NjYWxlLFxuICBpc0RlbW9CbGFua0V4aXRUYXJnZXQsXG4gIHBhbkZyb21EcmFnU25hcHNob3QsXG4gIHJlc2V0Q2FudmFzVmlld3BvcnQsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcblxuY29uc3QgQkxBTktfRVhJVF9ISU5UID0gJ1x1NTNDQ1x1NTFGQlx1N0E3QVx1NzY3RFx1NTkwNFx1OTAwMFx1NTFGQVx1NkYxNFx1NzkzQSdcblxuZnVuY3Rpb24gcmVhZENvbnRlbnRCb3goZWwpIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgcGFkWCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nUmlnaHQpXG4gIGNvbnN0IHBhZFkgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKVxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBNYXRoLm1heCgwLCBlbC5jbGllbnRXaWR0aCAtIHBhZFgpLFxuICAgIGhlaWdodDogTWF0aC5tYXgoMCwgZWwuY2xpZW50SGVpZ2h0IC0gcGFkWSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbW9Nb2RlKHtcbiAgcHJvamVjdCxcbiAgaG90c3BvdHNWaXNpYmxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgdmlld1Jlc2V0S2V5LFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIHNldE1vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHNjcmVlbkluZGV4ID0gcHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzY3JlZW4gPSBzY3JlZW5JbmRleCA+PSAwID8gcHJvamVjdC5zY3JlZW5zW3NjcmVlbkluZGV4XSA6IG51bGxcbiAgY29uc3QgY3VycmVudEV4cGFuZGVkID0gISEoc2NyZWVuICYmIGV4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHZpZXdwb3J0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgZXhpdE9uQmxhbmtEb3VibGVDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgIHNldE1vZGUoJ2NhbnZhcycpXG4gIH1cblxuICAvLyB0aXRsZSBcdTYzMDJcdTU3MjhcdTg5QzZcdTUzRTNcdTRFMEFcdTRGMUFcdTg0M0RcdTUyMzBcdTVDNEZcdTUxODVcdTVCNTBcdTgyODJcdTcwQjlcdUZGMENcdTVFNzJcdTYyNzBcdTY0Q0RcdTRGNUNcdUZGMUJcdTUzRUFcdTU3MjhcdTdBN0FcdTc2N0RcdTU5MDRcdTYwQUNcdTUwNUNcdTY1RjZcdTYzMDJcdTRFMEFcdTMwMDJcbiAgY29uc3Qgc3luY0JsYW5rRXhpdEhpbnQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBlbCA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBpZiAoIWVsKSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkgPyBCTEFOS19FWElUX0hJTlQgOiAnJ1xuICAgIGlmICgoZWwuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8ICcnKSA9PT0gbmV4dCkgcmV0dXJuXG4gICAgaWYgKG5leHQpIGVsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBuZXh0KVxuICAgIGVsc2UgZWwucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBjbGVhckJsYW5rRXhpdEhpbnQgPSAoKSA9PiB7XG4gICAgdmlld3BvcnRSZWYuY3VycmVudD8ucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBhcHBseUZpdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgIXN0YWdlKSByZXR1cm5cbiAgICBjb25zdCBib3ggPSByZWFkQ29udGVudEJveChjb250YWluZXIpXG4gICAgY29uc3QgbmV4dCA9IGZpdERlbW9TY2FsZShib3gud2lkdGgsIGJveC5oZWlnaHQsIHN0YWdlLm9mZnNldFdpZHRoLCBzdGFnZS5vZmZzZXRIZWlnaHQpXG4gICAgc2V0U2NhbGUobmV4dClcbiAgICBzZXRWaWV3KHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogbmV4dCB9KVxuICB9LCBbc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgdHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcHBseUZpdCgpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IGFwcGx5Rml0KCkpXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXIpXG4gICAgaWYgKHN0YWdlKSBvYnNlcnZlci5vYnNlcnZlKHN0YWdlKVxuICAgIGFwcGx5Rml0KClcbiAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gIH0sIFthcHBseUZpdCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBjdXJyZW50U2NyZWVuSWQsIHZpZXdSZXNldEtleSwgY3VycmVudEV4cGFuZGVkXSlcblxuICB1c2VXaGVlbFpvb20odmlld3BvcnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1kZW1vIGlzLXNob3dpbmctaG90c3BvdHMnIDogJ3dmLWRlbW8nfT5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXt2aWV3cG9ydFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtZGVtby12aWV3cG9ydCR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgICBvbk1vdXNlTW92ZT17c3luY0JsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17Y2xlYXJCbGFua0V4aXRIaW50fVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXtleGl0T25CbGFua0RvdWJsZUNsaWNrfVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1kZW1vLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICBtb2RlPVwiZGVtb1wiXG4gICAgICAgICAgICBpbmRleD17c2NyZWVuSW5kZXh9XG4gICAgICAgICAgICBleHBhbmRlZD17Y3VycmVudEV4cGFuZGVkfVxuICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3NjcmVlbiAmJiBvblRvZ2dsZUV4cGFuZCA/ICgpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtZGVtby1oaW50XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU1MTg1XHU2MzA5XHU5NEFFIC8gXHU5NEZFXHU2M0E1XHU4REYzXHU4RjZDXHVGRjFCXHU1M0VGXHU1NzI4XHU1REU1XHU1MTc3XHU2ODBGXHU1RjAwXHU1MTczXHU3MEVEXHU1MzNBXHU5QUQ4XHU0RUFFXHVGRjFCXHU2ODA3XHU5ODk4XHU2ODBGXHU1M0VGXHU0RTM0XHU2NUY2XHU1QzU1XHU1RjAwXHU3NzBCXHU1MTY4XHU4QzhDPC9wPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgZXhwYW5kU2NyZWVuQ29udGVudCwgbWVhc3VyZUNvbnRlbnRCb3ggfSBmcm9tICcuL2V4cGFuZC5qcydcblxubGV0IGV4cG9ydExpYnJhcmllc1Byb21pc2VcblxuY29uc3QgbGlicmFyaWVzID0gW1xuICB7IGZpbGU6ICdodG1sMmNhbnZhcy5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5odG1sMmNhbnZhcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdqc3ppcC5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5KU1ppcCA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdGaWxlU2F2ZXIubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuc2F2ZUFzID09PSAnZnVuY3Rpb24nIH0sXG5dXG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQoZmlsZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBleGlzdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXdpcmVmcmFtZS1leHBvcnQ9XCIke2ZpbGV9XCJdYClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID09PSAnbG9hZGVkJykge1xuICAgICAgICBleGlzdGluZy5yZW1vdmUoKVxuICAgICAgICBleGlzdGluZyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVzb2x2ZSwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlamVjdCwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdmVuZG9yQmFzZSA9IHdpbmRvdy5XSVJFRlJBTUVfVkVORE9SX0JBU0VcbiAgICBpZiAoIXZlbmRvckJhc2UpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1x1NjcyQVx1OTE0RFx1N0Y2RVx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5M1x1OERFRlx1NUY4NCBXSVJFRlJBTUVfVkVORE9SX0JBU0UnKSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgIHNjcmlwdC5zcmMgPSBuZXcgVVJMKGZpbGUsIHZlbmRvckJhc2UpLmhyZWZcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnQgPSBmaWxlXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGluZydcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGVkJ1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LnJlbW92ZSgpXG4gICAgICByZWplY3QobmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTUyQTBcdThGN0RcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTMgJHtmaWxlfWApKVxuICAgIH1cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFeHBvcnRMaWJyYXJpZXMoKSB7XG4gIGlmICghZXhwb3J0TGlicmFyaWVzUHJvbWlzZSkge1xuICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSBsaWJyYXJpZXMucmVkdWNlKFxuICAgICAgKGNoYWluLCBsaWJyYXJ5KSA9PiBjaGFpbi50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIGF3YWl0IGxvYWRTY3JpcHQobGlicmFyeS5maWxlKVxuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgdGhyb3cgbmV3IEVycm9yKGBcdTVCRkNcdTUxRkFcdTVFOTNcdTUyMURcdTU5Q0JcdTUzMTZcdTU5MzFcdThEMjU6ICR7bGlicmFyeS5maWxlfWApXG4gICAgICB9KSxcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLFxuICAgICkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gdW5kZWZpbmVkXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGV4cG9ydExpYnJhcmllc1Byb21pc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVTY3JlZW4oc2NyZWVuRWxlbWVudCwgdmlld3BvcnQsIHsgZXhwYW5kZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKCFzY3JlZW5FbGVtZW50KSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjI3RVx1NEUwRFx1NTIzMFx1ODk4MVx1NUJGQ1x1NTFGQVx1NzY4NCBzY3JlZW4gXHU1MTQzXHU3RDIwJylcbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG5cbiAgY29uc3Qgc2FuZGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNhbmRib3guY2xhc3NOYW1lID0gJ3dmLWV4cG9ydC1zYW5kYm94J1xuICBjb25zdCBjbG9uZSA9IHNjcmVlbkVsZW1lbnQuY2xvbmVOb2RlKHRydWUpXG4gIHNhbmRib3guYXBwZW5kQ2hpbGQoY2xvbmUpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2FuZGJveClcblxuICBsZXQgd2lkdGggPSB2aWV3cG9ydC53aWR0aFxuICBsZXQgaGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0XG4gIHRyeSB7XG4gICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICBleHBhbmRTY3JlZW5Db250ZW50KGNsb25lKVxuICAgICAgY29uc3QgYm94ID0gbWVhc3VyZUNvbnRlbnRCb3goY2xvbmUpXG4gICAgICB3aWR0aCA9IGJveC53aWR0aFxuICAgICAgaGVpZ2h0ID0gYm94LmhlaWdodFxuICAgIH1cbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgICBzYW5kYm94LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgc2FuZGJveC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG5cbiAgICBjb25zdCBjYW52YXMgPSBhd2FpdCB3aW5kb3cuaHRtbDJjYW52YXMoY2xvbmUsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBzY2FsZTogMixcbiAgICAgIHVzZUNPUlM6IGZhbHNlLFxuICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgKGJsb2IpID0+IGJsb2IgPyByZXNvbHZlKGJsb2IpIDogcmVqZWN0KG5ldyBFcnJvcignUE5HIFx1N0YxNlx1NzgwMVx1NTkzMVx1OEQyNScpKSxcbiAgICAgICAgJ2ltYWdlL3BuZycsXG4gICAgICApXG4gICAgfSlcbiAgfSBmaW5hbGx5IHtcbiAgICBzYW5kYm94LnJlbW92ZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbnMpIHx8IHNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTgxRjNcdTVDMTFcdTkwMDlcdTYyRTlcdTRFMDBcdTRFMkEgc2NyZWVuJylcbiAgfVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcbiAgY29uc3QgY2FwdHVyZWQgPSBbXVxuICBmb3IgKGNvbnN0IHNjcmVlbiBvZiBzY3JlZW5zKSB7XG4gICAgY2FwdHVyZWQucHVzaCh7XG4gICAgICBuYW1lOiBgJHtzbHVnKHNjcmVlbi5pZCl9LnBuZ2AsXG4gICAgICBibG9iOiBhd2FpdCBjYXB0dXJlU2NyZWVuKHNjcmVlbi5lbGVtZW50LCBzY3JlZW4udmlld3BvcnQsIHtcbiAgICAgICAgZXhwYW5kZWQ6ICEhc2NyZWVuLmV4cGFuZGVkLFxuICAgICAgfSksXG4gICAgfSlcbiAgfVxuXG4gIGlmIChjYXB0dXJlZC5sZW5ndGggPT09IDEpIHtcbiAgICB3aW5kb3cuc2F2ZUFzKGNhcHR1cmVkWzBdLmJsb2IsIGNhcHR1cmVkWzBdLm5hbWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB6aXAgPSBuZXcgd2luZG93LkpTWmlwKClcbiAgY2FwdHVyZWQuZm9yRWFjaCgoaXRlbSkgPT4gemlwLmZpbGUoaXRlbS5uYW1lLCBpdGVtLmJsb2IpKVxuICBjb25zdCBibG9iID0gYXdhaXQgemlwLmdlbmVyYXRlQXN5bmMoeyB0eXBlOiAnYmxvYicgfSlcbiAgd2luZG93LnNhdmVBcyhibG9iLCBgJHtzbHVnKHNjcmVlbnNbMF0ucHJvamVjdE5hbWUpfS56aXBgKVxufVxuIiwgImltcG9ydCB7IGJ1aWxkUmV2aWV3UHJvbXB0LCByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3UGFuZWwoe1xuICBwcm9qZWN0LFxuICBzZWxlY3Rpb25zLFxuICBtdWx0aVNlbGVjdCxcbiAgaXRlbXMsXG4gIG9uVG9nZ2xlTXVsdGlTZWxlY3QsXG4gIG9uU2VsZWN0RWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NTM5Rlx1NTc4Qlx1NUJBMVx1OTYwNVwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NUJBMVx1OTYwNVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IpID0+IChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2FuY2VzdG9yLnNlbGVjdG9yfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHthbmNlc3Rvci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdG9yXCI+e3NlbGVjdGVkLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAge3NlbGVjdGVkLmN1cnJlbnRUZXh0ID8gKFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1jdXJyZW50LXRleHRcIj5cdTVGNTNcdTUyNERcdUZGMUF7c2VsZWN0ZWQuY3VycmVudFRleHR9PC9wPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NEZFRVx1NjUzOVx1N0M3Qlx1NTc4Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLXNlbGVjdFwiIHZhbHVlPXt0eXBlfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRUeXBlKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKFJFVklFV19UWVBFX0xBQkVMUykubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLW9wdGlvblwiIHZhbHVlPXt2YWx1ZX0ga2V5PXt2YWx1ZX0+e2xhYmVsfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj57aW5zdHJ1Y3Rpb25MYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaW5zdHJ1Y3Rpb25cIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2luc3RydWN0aW9ufVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3R5cGUgPT09ICdvcmRlcicgPyAnXHU0RjhCXHU1OTgyXHVGRjFBXHU3OUZCXHU1MkE4XHU1MjMwXHU4QkEyXHU1MzU1XHU2NDU4XHU4OTgxXHU0RTRCXHU1NDBFJyA6ICdcdTYzQ0ZcdThGRjBcdTVFMENcdTY3MUIgQUkgXHU1OTgyXHU0RjU1XHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEluc3RydWN0aW9uKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaW5zdHJ1Y3Rpb24udHJpbSgpICYmIHR5cGUgIT09ICdyZW1vdmUnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FkZEl0ZW19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTUyQTBcdTUxNjVcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMDh7c2VsZWN0aW9ucy5sZW5ndGh9IFx1NEUyQVx1ODI4Mlx1NzBCOVx1RkYwOVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTRFMkRcdTc2ODRcdTgyODJcdTcwQjlcdTVGMDBcdTU5Q0JcdThCQzRcdThCQkFcdTMwMDJcdTcwQjlcdTUxRkJcdTk3NjJcdTUzMDVcdTVDNTFcdTUzRUZcdTUyMDdcdTYzNjJcdTUyMzBcdTcyMzZcdTdFQTdcdTdFQzRcdTRFRjZcdTMwMDI8L3A+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTU8L2gyPlxuICAgICAgICAgIHtpdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtc1wiPlxuICAgICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbVwiIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS10aXRsZVwiPntpbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2l0ZW0udHlwZV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Jldmlld1RhcmdldHMoaXRlbSkubWFwKCh0YXJnZXQpID0+IHRhcmdldC5zZWxlY3Rvcikuam9pbignXHUzMDAxJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0taW5zdHJ1Y3Rpb25cIj57aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ308L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tZGVsZXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlSXRlbShpdGVtLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDhcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24gd2YtcmV2aWV3LXByb21wdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTY3MDBcdTdFQzggUHJvbXB0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cmVnZW5lcmF0ZX0+XHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb21wdERpcnR5ID8gPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hbnVhbFwiPlByb21wdCBcdTVERjJcdTYyNEJcdTUyQThcdTRGRUVcdTY1MzlcdUZGMUJcdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTBcdTRGMUFcdTg5ODZcdTc2RDZcdTYyNEJcdTUyQThcdTUxODVcdTVCQjlcdTMwMDI8L3A+IDogbnVsbH1cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1wcm9tcHRcIlxuICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0UHJvbXB0KGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9e2NvcHlQcm9tcHR9PlxuICAgICAgICAgICAge2NvcGllZCA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NTkwRFx1NTIzNiBQcm9tcHQnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiaW1wb3J0IHsgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLml0ZW0gPT09IG90aGVyLml0ZW1cbiAgICAgICYmIGl0ZW0uaXRlbUluZGV4ID09PSBvdGhlci5pdGVtSW5kZXhcbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICB9KVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBpdGVtcykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgcG9zaXRpb25zID0gW11cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICByZXZpZXdUYXJnZXRzKGl0ZW0pLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0LnNlbGVjdG9yKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50Py5pc0Nvbm5lY3RlZCkgcmV0dXJuXG4gICAgICBjb25zdCBzY3JlZW5Db250ZW50ID0gZWxlbWVudC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKVxuICAgICAgaWYgKCFzY3JlZW5Db250ZW50KSByZXR1cm5cbiAgICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHNjcmVlbkNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgICBpZiAoIXZpc2libGUpIHJldHVyblxuICAgICAgY29uc3QgYmFzZUxlZnQgPSBNYXRoLnJvdW5kKHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdClcbiAgICAgIGNvbnN0IGJhc2VUb3AgPSBNYXRoLnJvdW5kKHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcClcbiAgICAgIGNvbnN0IG92ZXJsYXBDb3VudCA9IHBvc2l0aW9ucy5maWx0ZXIoXG4gICAgICAgIChwb3NpdGlvbikgPT4gTWF0aC5hYnMocG9zaXRpb24uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAyICYmIE1hdGguYWJzKHBvc2l0aW9uLmJhc2VUb3AgLSBiYXNlVG9wKSA8IDIsXG4gICAgICApLmxlbmd0aFxuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBrZXk6IGAke2l0ZW0uaWR9OiR7dGFyZ2V0SW5kZXh9YCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXRlbUluZGV4LFxuICAgICAgICB0YXJnZXRJbmRleCxcbiAgICAgICAgYmFzZUxlZnQsXG4gICAgICAgIGJhc2VUb3AsXG4gICAgICAgIGxlZnQ6IGJhc2VMZWZ0ICsgb3ZlcmxhcENvdW50ICogMTUsXG4gICAgICAgIHRvcDogYmFzZVRvcCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdNYXJrZXJzKHsgYm9hcmRSZWYsIGl0ZW1zIH0pIHtcbiAgY29uc3QgW3Bvc2l0aW9ucywgc2V0UG9zaXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbYWN0aXZlS2V5LCBzZXRBY3RpdmVLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZnJhbWVSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCByZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSByZXNvbHZlUG9zaXRpb25zKGJvYXJkUmVmLmN1cnJlbnQsIGl0ZW1zKVxuICAgIHNldFBvc2l0aW9ucygoY3VycmVudCkgPT4gc2FtZVBvc2l0aW9ucyhjdXJyZW50LCBuZXh0KSA/IGN1cnJlbnQgOiBuZXh0KVxuICB9LCBbYm9hcmRSZWYsIGl0ZW1zXSlcblxuICBjb25zdCBzY2hlZHVsZVJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIGZyYW1lUmVmLmN1cnJlbnQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGZyYW1lUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICByZWZyZXNoKClcbiAgICB9KVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KHNjaGVkdWxlUmVmcmVzaClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbc2NoZWR1bGVSZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmVLZXkgJiYgIXBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpKSBzZXRBY3RpdmVLZXkobnVsbClcbiAgfSwgW2FjdGl2ZUtleSwgcG9zaXRpb25zXSlcblxuICBjb25zdCBhY3RpdmUgPSBwb3NpdGlvbnMuZmluZCgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KVxuICBjb25zdCBib2FyZFdpZHRoID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50V2lkdGggfHwgMFxuICBjb25zdCBib2FyZEhlaWdodCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudEhlaWdodCB8fCAwXG4gIGNvbnN0IGJ1YmJsZUxlZnQgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLmxlZnQgKyAxNiwgYm9hcmRXaWR0aCAtIDMzNikpIDogMFxuICBjb25zdCBidWJibGVUb3AgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLnRvcCArIDI0LCBib2FyZEhlaWdodCAtIDE4MCkpIDogMFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTVCQTFcdTk2MDVcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbikgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICd3Zi1yZXZpZXctbWFya2VyIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW1hcmtlcid9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XHVGRjFBJHtSRVZJRVdfVFlQRV9MQUJFTFNbcG9zaXRpb24uaXRlbS50eXBlXX1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICAgIHthY3RpdmUgPyAoXG4gICAgICAgIDxhc2lkZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7YWN0aXZlLml0ZW1JbmRleCArIDF9YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGl0bGVcIj5cbiAgICAgICAgICAgICAge2FjdGl2ZS5pdGVtSW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1thY3RpdmUuaXRlbS50eXBlXX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaW5zdHJ1Y3Rpb25cIj5cbiAgICAgICAgICAgIHthY3RpdmUuaXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGFyZ2V0c1wiPlxuICAgICAgICAgICAge3Jldmlld1RhcmdldHMoYWN0aXZlLml0ZW0pLm1hcCgodGFyZ2V0KSA9PiAoXG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1zZWxlY3RvclwiIGtleT17dGFyZ2V0LnNlbGVjdG9yfT57dGFyZ2V0LnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgQ2FudmFzTW9kZSwgcnVuRXhwb3J0V2l0aEZlZWRiYWNrIH0gZnJvbSAnLi9DYW52YXNNb2RlLmpzeCdcbmltcG9ydCB7IERlbW9Nb2RlIH0gZnJvbSAnLi9EZW1vTW9kZS5qc3gnXG5pbXBvcnQgeyByZXNvbHZlRXhwYW5kVGFyZ2V0cyB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHsgZXhwb3J0U2VsZWN0ZWQgfSBmcm9tICcuL2V4cG9ydC5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5pbXBvcnQgeyBjbGFtcFNjYWxlIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgUmV2aWV3UGFuZWwgfSBmcm9tICcuL1Jldmlld1BhbmVsLmpzeCdcbmltcG9ydCB7IFJldmlld01hcmtlcnMgfSBmcm9tICcuL1Jldmlld01hcmtlcnMuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgcmV2aWV3OiA8PjxyZWN0IHg9XCI4XCIgeT1cIjJcIiB3aWR0aD1cIjhcIiBoZWlnaHQ9XCI0XCIgcng9XCIxXCIgLz48cGF0aCBkPVwiTTE2IDRoMmEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgyXCIgLz48cGF0aCBkPVwibTkgMTQgMiAyIDQtNFwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm0xNyAxMS01LTUtNSA1XCIgLz48cGF0aCBkPVwibTE3IDE4LTUtNS01IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMTMgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDYgNSA1IDUtNVwiIC8+PC8+LFxuICAgIGRvd25sb2FkOiA8PjxwYXRoIGQ9XCJNMTIgM3YxMlwiIC8+PHBhdGggZD1cIm03IDEwIDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJNNSAyMWgxNFwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gJ1x1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0Rlx1N0E3QVx1NjgzQ1x1NEUzNFx1NjVGNlx1OTUwMVx1NEY0RidcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU5ODc1XHU5NzYyXHU1MTg1XHU3MEI5XHU1MUZCXHU0RTBFXHU2RURBXHU1MkE4XHU1REYyXHU3OTgxXHU3NTI4XHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyJ31cbiAgICA+XG4gICAgICA8TG9ja0ljb24gb3Blbj17aW50ZXJhY3RpdmV9IC8+XG4gICAgICA8c3Bhbj57aW50ZXJhY3RpdmUgPyAnXHU1M0VGXHU0RUE0XHU0RTkyJyA6ICdcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInfTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihlbCkge1xuICBjb25zdCByZXF1ZXN0ID0gZWwgJiYgKGVsLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGVsLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKVxuICBpZiAoIXJlcXVlc3QpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcXVlc3QuY2FsbChlbCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5mdW5jdGlvbiBleGl0Qm9hcmRGdWxsc2NyZWVuKCkge1xuICBpZiAoIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICBjb25zdCBleGl0ID0gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW5cbiAgaWYgKCFleGl0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShleGl0LmNhbGwoZG9jdW1lbnQpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcblxuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKSxcbiAgKVxuICBjb25zdCBbY2FudmFzU2NhbGUsIHNldENhbnZhc1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vU2NhbGUsIHNldERlbW9TY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1ZpZXdSZXNldEtleSwgc2V0RGVtb1ZpZXdSZXNldEtleV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBbaW50ZXJhY3RpdmUsIHNldEludGVyYWN0aXZlXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtzcGFjZUhlbGQsIHNldFNwYWNlSGVsZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hvdHNwb3RzVmlzaWJsZSwgc2V0SG90c3BvdHNWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwb3J0RXJyb3IsIHNldEV4cG9ydEVycm9yXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkSWRzLCBzZXRFeHBhbmRlZElkc10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IFtpbW1lcnNpdmUsIHNldEltbWVyc2l2ZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdTZWxlY3Rpb25zLCBzZXRSZXZpZXdTZWxlY3Rpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbcmV2aWV3TXVsdGlTZWxlY3QsIHNldFJldmlld011bHRpU2VsZWN0XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3SXRlbXMsIHNldFJldmlld0l0ZW1zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBib2FyZFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmID0gUmVhY3QudXNlUmVmKG5ldyBTZXQoKSlcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSByZXZpZXdFbmFibGVkID8gc3BhY2VIZWxkIDogIWludGVyYWN0aXZlIHx8IHNwYWNlSGVsZFxuICBjb25zdCBhbGxTY3JlZW5JZHMgPSBwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZClcbiAgY29uc3QgaXNEZW1vID0gbW9kZSA9PT0gJ2RlbW8nICYmIGRlbW9BdmFpbGFibGVcbiAgY29uc3QgYWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBkZW1vU2NhbGUgOiBjYW52YXNTY2FsZVxuICBjb25zdCBzZXRBY3RpdmVTY2FsZSA9IGlzRGVtbyA/IHNldERlbW9TY2FsZSA6IHNldENhbnZhc1NjYWxlXG5cbiAgY29uc3QgY2xlYXJSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoW10pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHNlbGVjdFJldmlld0VsZW1lbnQgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCwgc2NyZWVuLCBjb250ZW50Um9vdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgcHJpbWFyeSA9IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IGFjdGl2ZVNjcmVlbiA9IHNjcmVlbiB8fCBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gcHJpbWFyeT8uc2NyZWVuSWQpXG4gICAgY29uc3QgYWN0aXZlUm9vdCA9IGNvbnRlbnRSb290IHx8IHByaW1hcnk/LmNvbnRlbnRSb290XG4gICAgaWYgKCFlbGVtZW50IHx8ICFhY3RpdmVTY3JlZW4gfHwgIWFjdGl2ZVJvb3QpIHJldHVyblxuICAgIGNvbnN0IG5leHRTZWxlY3Rpb24gPSBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgYWN0aXZlUm9vdCwgYWN0aXZlU2NyZWVuKVxuICAgIGNvbnN0IGFkZGl0aXZlID0gcmV2aWV3TXVsdGlTZWxlY3QgfHwgb3B0aW9ucy5hZGRpdGl2ZVxuXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpIHtcbiAgICAgICAgb3B0aW9ucy5yZXBsYWNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIGlmIChjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudCAmJiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50Lm1hcCgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50ID8gbmV4dFNlbGVjdGlvbiA6IGl0ZW0pXG4gICAgICB9XG4gICAgICBjb25zdCBhbHJlYWR5U2VsZWN0ZWQgPSBjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudClcbiAgICAgIGlmICghYWRkaXRpdmUpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RlZEVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudClcbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgcmV0dXJuIGFkZGl0aXZlID8gWy4uLmN1cnJlbnQsIG5leHRTZWxlY3Rpb25dIDogW25leHRTZWxlY3Rpb25dXG4gICAgfSlcbiAgfSwgW3Byb2plY3Quc2NyZWVucywgcmV2aWV3TXVsdGlTZWxlY3QsIHJldmlld1NlbGVjdGlvbnNdKVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudCkpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNsb3NlUmV2aWV3ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld0VuYWJsZWQoZmFsc2UpXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9ICgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICB9XG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uLCBtb2RlLCByZXZpZXdFbmFibGVkLCB2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgZXhpdEltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRJbW1lcnNpdmUoZmFsc2UpXG4gICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuID0gKCkgPT4ge1xuICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKG5ldyBTZXQoKSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBjb25zdCB0b2dnbGVFeHBhbmQgPSAoaWQpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGV4cGFuZFRhcmdldHMgPSAoc2hvdWxkRXhwYW5kKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxTY3JlZW5JZHMpXG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIHRhcmdldHMpIHtcbiAgICAgICAgaWYgKHNob3VsZEV4cGFuZCkgbmV4dC5hZGQoaWQpXG4gICAgICAgIGVsc2UgbmV4dC5kZWxldGUoaWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlICE9PSAnU3BhY2UnIHx8IGV2ZW50LnJlcGVhdCkgcmV0dXJuXG4gICAgICBjb25zdCB0YWcgPSBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LnRhZ05hbWVcbiAgICAgIGlmICh0YWcgPT09ICdJTlBVVCcgfHwgdGFnID09PSAnVEVYVEFSRUEnIHx8IHRhZyA9PT0gJ1NFTEVDVCcgfHwgZXZlbnQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgc2V0U3BhY2VIZWxkKHRydWUpXG4gICAgfVxuICAgIGNvbnN0IHVwID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJykgc2V0U3BhY2VIZWxkKGZhbHNlKVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2RlbW8nKSBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH0sIFttb2RlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN5bmMgPSAoKSA9PiBzZXRCcm93c2VyRnVsbHNjcmVlbighIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgfVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaW1tZXJzaXZlKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnKSByZXR1cm5cbiAgICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHNldEltbWVyc2l2ZShmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW2ltbWVyc2l2ZV0pXG5cbiAgY29uc3QgZXhwb3J0SWRzID0gKGlkcykgPT4gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKGFzeW5jICgpID0+IHtcbiAgICBzZXRFeHBvcnRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NyZWVucyA9IGlkcy5tYXAoKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpZClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICB0aXRsZTogc2NyZWVuLnRpdGxlLFxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNjcmVlbi1pZD1cIiR7aWR9XCJdIC53Zi1zY3JlZW4tY29udGVudGApLFxuICAgICAgICAgIHZpZXdwb3J0LFxuICAgICAgICAgIGV4cGFuZGVkOiBleHBhbmRlZElkcy5oYXMoaWQpLFxuICAgICAgICAgIHByb2plY3ROYW1lOiBwcm9qZWN0Lm5hbWUsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBhd2FpdCBleHBvcnRTZWxlY3RlZChzY3JlZW5zKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRFeHBvcnRpbmcoZmFsc2UpXG4gICAgfVxuICB9LCBzZXRFeHBvcnRFcnJvcilcblxuICBjb25zdCByZXNldERlbW8gPSAoKSA9PiB7XG4gICAgcmVzZXQoKVxuICAgIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0RGVtb1ZpZXcgPSAoKSA9PiB7XG4gICAgc2V0RGVtb1ZpZXdSZXNldEtleSgodmFsdWUpID0+IHZhbHVlICsgMSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0QWN0aXZlVmlldyA9IGlzRGVtbyA/IHJlc2V0RGVtb1ZpZXcgOiAoKSA9PiBzZXRDYW52YXNTY2FsZSgxKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtib2FyZFJlZn1cbiAgICAgIGNsYXNzTmFtZT17YHdmLWJvYXJkJHtpbW1lcnNpdmUgPyAnIGlzLWltbWVyc2l2ZScgOiAnJ30ke3Jldmlld0VuYWJsZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgID5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW5hbWVcIj57cHJvamVjdC5uYW1lfTwvaDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcHJvamVjdC1tZXRhXCI+e3Byb2plY3Quc2NyZWVucy5sZW5ndGh9IFx1OTg3NTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHtkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RlLXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1NkEyMVx1NUYwRlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnY2FudmFzJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnY2FudmFzJyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1kZW1vLWVudHJ5XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ3Zi1kZW1vLWVudHJ5XCI+XHU1MTY1XHU1M0UzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIndmLWRlbW8tZW50cnlcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2VudHJ5SWR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZWxlY3RFbnRyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDlcdTYyRTlcdTZGMTRcdTc5M0FcdTUxNjVcdTUzRTNcdTk4NzVcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtzY3JlZW4uaWR9IHZhbHVlPXtzY3JlZW4uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCArIDF9LiB7c2NyZWVuLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17cmVzZXREZW1vfT5cdTkxQ0RcdTdGNkU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZGVtby1wYWdlLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgXHU1RjUzXHU1MjREXHVGRjFBXG4gICAgICAgICAgICAgICAge2N1cnJlbnRTY3JlZW5cbiAgICAgICAgICAgICAgICAgID8gYCR7cHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW4uaWQpICsgMX0uICR7Y3VycmVudFNjcmVlbi50aXRsZX0gXHUwMEI3ICR7Y3VycmVudFNjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgICAgICAgOiBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtyZXZpZXdFbmFibGVkID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3Jldmlld0VuYWJsZWQgPyBgXHU1QkExXHU5NjA1XHU0RTJEXHVGRjA4JHtyZXZpZXdJdGVtcy5sZW5ndGh9IFx1Njc2MVx1NjEwRlx1ODlDMVx1RkYwOWAgOiBgXHU1QkExXHU5NjA1XHVGRjA4JHtyZXZpZXdJdGVtcy5sZW5ndGh9IFx1Njc2MVx1NjEwRlx1ODlDMVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NUJBMVx1OTYwNVx1RkYxQVx1NzBCOVx1OTAwOVx1OTg3NVx1OTc2Mlx1ODI4Mlx1NzBCOVx1NUU3Nlx1NjU3NFx1NzQwNlx1NjIxMFx1NTNFRlx1N0YxNlx1OEY5MVx1NzY4NCBBSSBcdTRGRUVcdTY1MzkgUHJvbXB0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVJldmlld31cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cInJldmlld1wiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj57cmV2aWV3SXRlbXMubGVuZ3RofTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NUJBMVx1OTYwNTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1RkYxQVx1OTY5MFx1ODVDRlx1OTg3Nlx1NjgwRlx1NEUwRVx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgICAgICAgICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWltbWVyc2l2ZS1jaHJvbWVcIiByb2xlPVwidG9vbGJhclwiIGFyaWEtbGFiZWw9XCJcdTZDODlcdTZENzhcdTYzQTdcdTRFRjZcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1RkYwOEVzY1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXtleGl0SW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1OTAwMFx1NTFGQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXticm93c2VyRnVsbHNjcmVlbiA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1OTAwMFx1NTFGQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHticm93c2VyRnVsbHNjcmVlbiA/ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYgT04nIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgc2NhbGU9e2FjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgb25SZXNldD17cmVzZXRBY3RpdmVWaWV3fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHtpc0RlbW8gPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgPyAoXG4gICAgICAgIDxDYW52YXNNb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNlbGVjdGVkSWRzPXtzZWxlY3RlZElkc31cbiAgICAgICAgICBzZXRTZWxlY3RlZElkcz17c2V0U2VsZWN0ZWRJZHN9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgb25FeHBvcnRJZHM9e2V4cG9ydElkc31cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPERlbW9Nb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBob3RzcG90c1Zpc2libGU9e2hvdHNwb3RzVmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3Jldmlld0VuYWJsZWQgPyAoXG4gICAgICAgIDxSZXZpZXdNYXJrZXJzIGJvYXJkUmVmPXtib2FyZFJlZn0gaXRlbXM9e3Jldmlld0l0ZW1zfSAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7cmV2aWV3RW5hYmxlZCA/IChcbiAgICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICAgIG11bHRpU2VsZWN0PXtyZXZpZXdNdWx0aVNlbGVjdH1cbiAgICAgICAgICBpdGVtcz17cmV2aWV3SXRlbXN9XG4gICAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgIG9uU2VsZWN0RWxlbWVudD17KGVsZW1lbnQpID0+IHNlbGVjdFJldmlld0VsZW1lbnQoZWxlbWVudCwgbnVsbCwgbnVsbCwge1xuICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXT8uZWxlbWVudCxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBvblJlbW92ZVNlbGVjdGlvbj17cmVtb3ZlUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQ2xlYXJTZWxlY3Rpb249e2NsZWFyUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgICBvblJlbW92ZUl0ZW09e3JlbW92ZVJldmlld0l0ZW19XG4gICAgICAgICAgb25DbG9zZT17Y2xvc2VSZXZpZXd9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIndmLWNob2ljZS1pbnB1dFwiIHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2hvaWNlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtZmllbGQtbGFiZWxcIiBodG1sRm9yPXtodG1sRm9yfT57bGFiZWx9PC9sYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICAgIHtoaW50ICYmICFlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2Vycm9yfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGNyZWF0ZUZsb3dQcm9wcyB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VIZWFkZXIoeyB0aXRsZSwgdGl0bGVJZCwgc3VidGl0bGUsIHN1YnRpdGxlSWQsIGFjdGlvbnMsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyIGNsYXNzTmFtZT17YHdmLXBhZ2UtaGVhZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtaGVhZGVyLWNvcHlcIj5cbiAgICAgICAgPGgxIGlkPXt0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXRpdGxlXCI+e3RpdGxlfTwvaDE+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxwIGlkPXtzdWJ0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvcD4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7YWN0aW9ucyA/IDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1hY3Rpb25zXCI+e2FjdGlvbnN9PC9kaXY+IDogbnVsbH1cbiAgICA8L2hlYWRlcj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOYXZpZ2F0aW9uTGlzdCh7IGFzLCBpdGVtcywgYWN0aXZlSWQsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGFzLFxuICAgIHsgY2xhc3NOYW1lLCAuLi5yZXN0IH0sXG4gICAgaXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtbmF2LWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi1uYXYtaXRlbSd9XG4gICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZGVOYXYoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxOYXZpZ2F0aW9uTGlzdFxuICAgICAgYXM9XCJuYXZcIlxuICAgICAgaXRlbXM9e2l0ZW1zfVxuICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUlkfVxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc2lkZS1uYXYgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJCYXIoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtdGFiLWJhciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtdGFiLWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi10YWItaXRlbSd9XG4gICAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyZWFkY3J1bWJzKHsgaXRlbXMgPSBbXSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtYnJlYWRjcnVtYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IGFyaWEtbGFiZWw9XCJCcmVhZGNydW1ic1wiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Ake2l0ZW0ubGFiZWx9LSR7aW5kZXh9YH0+XG4gICAgICAgICAge2luZGV4ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItZGl2aWRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXRlbS50byA/IChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1saW5rXCIgdHlwZT1cImJ1dHRvblwiIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9PlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWN1cnJlbnRcIj57aXRlbS5sYWJlbH08L3NwYW4+fVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuLyoqIFx1NzlGQlx1NTJBOFx1N0FFRlx1NjU3NFx1NUM0Rlx1NThGM1x1RkYxQVx1NTE4NVx1NUJCOVx1NTMzQVx1NTNFRlx1NkVEQVx1RkYwQ1RhYkJhciBcdThEMzRcdTVFOTVcdTMwMDJ0YWJzIC8gYWN0aXZlSWQgXHU0RTBFIFRhYkJhciBcdTc2RjhcdTU0MENcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVTaGVsbCh7IGNoaWxkcmVuLCB0YWJzID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tb2JpbGUtc2hlbGwgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIndmLW1vYmlsZS1zaGVsbC1ib2R5XCI+e2NoaWxkcmVufTwvbWFpbj5cbiAgICAgIHt0YWJzLmxlbmd0aCA+IDAgPyA8VGFiQmFyIGl0ZW1zPXt0YWJzfSBhY3RpdmVJZD17YWN0aXZlSWR9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBDZWxsKHsgdG8sIG9uQ2xpY2ssIHRpdGxlLCBzdWJ0aXRsZSwgdmFsdWUsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNlbGwgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jZWxsLW1haW5cIj5cbiAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1jZWxsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICB7c3VidGl0bGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkXCI+XG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkaW5nXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+e2NvbHVtbi5sYWJlbH08L3RoPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cIndmLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0tleSA9IGdldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtcm93XCIgZGF0YS13Zi1rZXk9e3Jvd0tleX0ga2V5PXtyb3dLZXl9PlxuICAgICAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2YtdGFibGUtY2VsbFwiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9PlxuICAgICAgICAgICAgICAgICAgICB7Y29sdW1uLnJlbmRlciA/IGNvbHVtbi5yZW5kZXIocm93W2NvbHVtbi5rZXldLCByb3cpIDogcm93W2NvbHVtbi5rZXldfVxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgb25DaGFuZ2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJ0YWJsaXN0XCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtdGFiLWNvbnRyb2xcIlxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2l0ZW0uaWQgPT09IGFjdGl2ZUlkfVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZT8uKGl0ZW0uaWQpfVxuICAgICAgICA+XG4gICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBzKHtcbiAgaXRlbXMgPSBbXSxcbiAgY3VycmVudCA9IDAsXG4gIGRpcmVjdGlvbiA9ICdob3Jpem9udGFsJyxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgdmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCdcbiAgcmV0dXJuIChcbiAgICA8b2xcbiAgICAgIGNsYXNzTmFtZT17YHdmLXN0ZXBzICR7dmVydGljYWwgPyAnd2Ytc3RlcHMtdmVydGljYWwnIDogJ3dmLXN0ZXBzLWhvcml6b250YWwnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGluZGV4IDwgY3VycmVudCA/ICdkb25lJyA6IGluZGV4ID09PSBjdXJyZW50ID8gJ2N1cnJlbnQnIDogJ3RvZG8nXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17YHdmLXN0ZXBzLWl0ZW0gd2Ytc3RlcHMtaXRlbS0ke3N0YXR1c31gfSBrZXk9e2l0ZW0uaWQgfHwgaXRlbS5sYWJlbCB8fCBpbmRleH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwLW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzID09PSAnZG9uZScgPyBudWxsIDogaW5kZXggKyAxfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHtpbmRleCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1saW5lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIHtpdGVtLmRlc2NyaXB0aW9uID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtZGVzY1wiPntpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfSl9XG4gICAgPC9vbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRW1wdHlTdGF0ZSh7IHRpdGxlLCBkZXNjcmlwdGlvbiwgYWN0aW9uLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1lbXB0eS1zdGF0ZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZW1wdHktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7dGl0bGUgPyA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWVtcHR5LXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICB7ZGVzY3JpcHRpb24gPyA8cCBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1kZXNjXCI+e2Rlc2NyaXB0aW9ufTwvcD4gOiBudWxsfVxuICAgICAge2FjdGlvbiA/IDxkaXYgY2xhc3NOYW1lPVwid2YtZW1wdHktYWN0aW9uXCI+e2FjdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi9mb3Jtcy5qc3gnXG5cbmZ1bmN0aW9uIFNjcmVlblBvcnRhbCh7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgYW5jaG9yID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtob3N0LCBzZXRIb3N0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBzZXRIb3N0KGFuY2hvci5jdXJyZW50Py5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKSB8fCBudWxsKVxuICB9LCBbXSlcblxuICBpZiAoIWhvc3QpIHJldHVybiA8c3BhbiByZWY9e2FuY2hvcn0gY2xhc3NOYW1lPVwid2Ytb3ZlcmxheS1hbmNob3JcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICByZXR1cm4gUmVhY3RET00uY3JlYXRlUG9ydGFsKGNoaWxkcmVuLCBob3N0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTW9kYWwoeyBvcGVuLCB0aXRsZSwgY2hpbGRyZW4sIGFjdGlvbnMsIG9uQ2xvc2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtbW9kYWwtb3ZlcmxheSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInByZXNlbnRhdGlvblwiIHsuLi5yZXN0fT5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtbW9kYWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsPXt0aXRsZX0+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtbW9kYWwtdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgICB7b25DbG9zZSA/IDxCdXR0b24gb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9CdXR0b24+IDogbnVsbH1cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLW1vZGFsLWJvZHlcIj57Y2hpbGRyZW59PC9kaXY+XG4gICAgICAgICAge2FjdGlvbnMgPyA8Zm9vdGVyIGNsYXNzTmFtZT1cIndmLW1vZGFsLWZvb3RlclwiPnthY3Rpb25zfTwvZm9vdGVyPiA6IG51bGx9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb25maXJtRGlhbG9nKHtcbiAgb3BlbixcbiAgdGl0bGUgPSAnXHU3ODZFXHU4QkE0XHU2NENEXHU0RjVDJyxcbiAgbWVzc2FnZSxcbiAgY29uZmlybUxhYmVsID0gJ1x1Nzg2RVx1OEJBNCcsXG4gIGNhbmNlbExhYmVsID0gJ1x1NTNENlx1NkQ4OCcsXG4gIG9uQ29uZmlybSxcbiAgb25DYW5jZWwsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIHJldHVybiAoXG4gICAgPE1vZGFsXG4gICAgICBvcGVuPXtvcGVufVxuICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICBvbkNsb3NlPXtvbkNhbmNlbH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgYWN0aW9ucz17KFxuICAgICAgICA8PlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17b25DYW5jZWx9PntjYW5jZWxMYWJlbH08L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17b25Db25maXJtfT57Y29uZmlybUxhYmVsfTwvQnV0dG9uPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtY29uZmlybS1tZXNzYWdlXCI+e21lc3NhZ2V9PC9wPlxuICAgIDwvTW9kYWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRvYXN0KHsgb3BlbiwgY2hpbGRyZW4sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtdG9hc3QgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJzdGF0dXNcIiB7Li4ucmVzdH0+e2NoaWxkcmVufTwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2FkaW5nT3ZlcmxheSh7IG9wZW4sIGxhYmVsID0gJ1x1NTJBMFx1OEY3RFx1NEUyRCcsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtbG9hZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInN0YXR1c1wiIHsuLi5yZXN0fT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbG9hZGluZy1zaGFwZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWxvYWRpbmctbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjMuMFxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBIZWFkaW5nLFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIExvZ2luU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgaWQ9XCJvcmRlci1sb2dpbi1wYWdlXCIgY2xhc3NOYW1lPVwib3JkZXItbG9naW4gb3JkZXItbG9naW5fX3BhZ2VcIj5cbiAgICAgIDxDYXJkIGlkPVwib3JkZXItbG9naW4tY2FyZFwiIGNsYXNzTmFtZT1cIm9yZGVyLWxvZ2luLWNhcmQgb3JkZXItbG9naW5fX2NhcmRcIj5cbiAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJvcmRlci1sb2dpbl9fZm9ybVwiIGdhcD17MTZ9PlxuICAgICAgICAgIDxIZWFkaW5nIGlkPVwib3JkZXItbG9naW4tdGl0bGVcIiBjbGFzc05hbWU9XCJvcmRlci1sb2dpbl9fdGl0bGVcIiBsZXZlbD17MX0+XHU4QkEyXHU1MzU1XHU3QkExXHU3NDA2XHU1NDBFXHU1M0YwPC9IZWFkaW5nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIm9yZGVyLWxvZ2luX19kZXNjcmlwdGlvblwiPlx1NEY3Rlx1NzUyOFx1NkYxNFx1NzkzQVx1OEQyNlx1NTNGN1x1OEZEQlx1NTE2NVx1N0NGQlx1N0VERlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cIm9yZGVyLWxvZ2luX19hY2NvdW50LWZpZWxkXCIgbGFiZWw9XCJcdThEMjZcdTUzRjdcIiBodG1sRm9yPVwib3JkZXItbG9naW4tYWNjb3VudFwiPlxuICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cIm9yZGVyLWxvZ2luLWFjY291bnRcIiBjbGFzc05hbWU9XCJvcmRlci1sb2dpbl9fYWNjb3VudC1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiXHU4QkY3XHU4RjkzXHU1MTY1XHU3NTI4XHU2MjM3XHU1NDBEXCIgLz5cbiAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cIm9yZGVyLWxvZ2luX19wYXNzd29yZC1maWVsZFwiIGxhYmVsPVwiXHU1QkM2XHU3ODAxXCIgaHRtbEZvcj1cIm9yZGVyLWxvZ2luLXBhc3N3b3JkXCI+XG4gICAgICAgICAgICA8VGV4dElucHV0IGlkPVwib3JkZXItbG9naW4tcGFzc3dvcmRcIiBjbGFzc05hbWU9XCJvcmRlci1sb2dpbl9fcGFzc3dvcmQtaW5wdXRcIiB0eXBlPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1NUJDNlx1NzgwMVwiIC8+XG4gICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgPEJ1dHRvbiBpZD1cIm9yZGVyLWxvZ2luLXN1Ym1pdFwiIGNsYXNzTmFtZT1cIm9yZGVyLWxvZ2luX19zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwib3JkZXItbGlzdFwiPlx1NzY3Qlx1NUY1NTwvQnV0dG9uPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ2FyZD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7IENvbHVtbiwgU2lkZU5hdiB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IHVzZVNjcmVlbklkIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gQWRtaW5MYXlvdXQoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwib3JkZXItc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9XCJvcmRlci1zaGVsbF9fc2lkZWJhclwiPlxuICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIm9yZGVyLXNoZWxsX19icmFuZFwiPlx1OEJBMlx1NTM1NVx1N0JBMVx1NzQwNjwvc3Ryb25nPlxuICAgICAgICA8U2lkZU5hdlxuICAgICAgICAgIGNsYXNzTmFtZT1cIm9yZGVyLXNoZWxsX19uYXZpZ2F0aW9uXCJcbiAgICAgICAgICBhY3RpdmVJZD17c2NyZWVuSWR9XG4gICAgICAgICAgaXRlbXM9e1t7IGxhYmVsOiAnXHU4QkEyXHU1MzU1XHU1MjE3XHU4ODY4JywgdG86ICdvcmRlci1saXN0JyB9XX1cbiAgICAgICAgLz5cbiAgICAgIDwvYXNpZGU+XG4gICAgICA8Q29sdW1uIGdhcD17MTZ9IGNsYXNzTmFtZT1cIm9yZGVyLW1haW4gb3JkZXItc2hlbGxfX21haW5cIj57Y2hpbGRyZW59PC9Db2x1bW4+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjMuMFxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgQ29uZmlybURpYWxvZyxcbiAgRm9ybUZpZWxkLFxuICBQYWdlSGVhZGVyLFxuICBTZWxlY3QsXG4gIFRleHRBcmVhLFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBZG1pbkxheW91dCB9IGZyb20gJy4uL2xheW91dHMvQWRtaW5MYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gT3JkZXJDYW5jZWxTY3JlZW4oKSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxBZG1pbkxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJvcmRlci1jYW5jZWwtcGFnZVwiIGNsYXNzTmFtZT1cIm9yZGVyLWNhbmNlbF9fcGFnZVwiIGdhcD17MTZ9PlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cIm9yZGVyLWNhbmNlbC1oZWFkZXJcIiB0aXRsZUlkPVwib3JkZXItY2FuY2VsLXRpdGxlXCIgY2xhc3NOYW1lPVwib3JkZXItY2FuY2VsX19oZWFkZXJcIiB0aXRsZT1cIlx1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NVwiIHN1YnRpdGxlPVwiXHU4QkEyXHU1MzU1IFNPLTEwMDFcIiAvPlxuICAgICAgICA8Q2FyZCBpZD1cIm9yZGVyLWNhbmNlbC1mb3JtLWNhcmRcIiBjbGFzc05hbWU9XCJvcmRlci1jYW5jZWxfX2Zvcm0tY2FyZFwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwib3JkZXItY2FuY2VsX19mb3JtXCIgZ2FwPXsxNn0+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cIm9yZGVyLWNhbmNlbF9fcmVhc29uLWZpZWxkXCIgbGFiZWw9XCJcdTUzRDZcdTZEODhcdTUzOUZcdTU2RTBcIiBodG1sRm9yPVwib3JkZXItY2FuY2VsLXJlYXNvblwiPlxuICAgICAgICAgICAgICA8U2VsZWN0IGlkPVwib3JkZXItY2FuY2VsLXJlYXNvblwiIGNsYXNzTmFtZT1cIm9yZGVyLWNhbmNlbF9fcmVhc29uLXNlbGVjdFwiIGRlZmF1bHRWYWx1ZT1cImN1c3RvbWVyXCI+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJvcmRlci1jYW5jZWxfX3JlYXNvbi1vcHRpb25cIiB2YWx1ZT1cImN1c3RvbWVyXCI+XHU1QkEyXHU2MjM3XHU3NTMzXHU4QkY3PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJvcmRlci1jYW5jZWxfX3JlYXNvbi1vcHRpb25cIiB2YWx1ZT1cImludmVudG9yeVwiPlx1NUU5M1x1NUI1OFx1NEUwRFx1OERCMzwvb3B0aW9uPlxuICAgICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJvcmRlci1jYW5jZWxfX25vdGUtZmllbGRcIiBsYWJlbD1cIlx1NTkwN1x1NkNFOFwiIGh0bWxGb3I9XCJvcmRlci1jYW5jZWwtbm90ZVwiPlxuICAgICAgICAgICAgICA8VGV4dEFyZWEgaWQ9XCJvcmRlci1jYW5jZWwtbm90ZVwiIGNsYXNzTmFtZT1cIm9yZGVyLWNhbmNlbF9fbm90ZS1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiXHU1ODZCXHU1MTk5XHU4ODY1XHU1MTQ1XHU4QkY0XHU2NjBFXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgICAgPEJ1dHRvbiBpZD1cIm9yZGVyLWNhbmNlbC1zdWJtaXRcIiBjbGFzc05hbWU9XCJvcmRlci1jYW5jZWxfX3N1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17KCkgPT4gc2V0T3Blbih0cnVlKX0+XHU2M0QwXHU0RUE0XHU1M0Q2XHU2RDg4PC9CdXR0b24+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPENvbmZpcm1EaWFsb2dcbiAgICAgICAgICBpZD1cIm9yZGVyLWNhbmNlbC1jb25maXJtLWRpYWxvZ1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwib3JkZXItY2FuY2VsX19jb25maXJtLWRpYWxvZ1wiXG4gICAgICAgICAgb3Blbj17b3Blbn1cbiAgICAgICAgICB0aXRsZT1cIlx1Nzg2RVx1OEJBNFx1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NVwiXG4gICAgICAgICAgbWVzc2FnZT1cIlx1NkI2NFx1NjRDRFx1NEY1Q1x1NUMwNlx1NjZGNFx1NjVCMFx1OEJBMlx1NTM1NVx1NzJCNlx1NjAwMVx1MzAwMlwiXG4gICAgICAgICAgb25DYW5jZWw9eygpID0+IHNldE9wZW4oZmFsc2UpfVxuICAgICAgICAgIG9uQ29uZmlybT17KCkgPT4gc2V0T3BlbihmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FkbWluTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS4zLjBcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEdyaWQsXG4gIFBhZ2VIZWFkZXIsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFkbWluTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9BZG1pbkxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBPcmRlckRldGFpbFNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QWRtaW5MYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwib3JkZXItZGV0YWlsLXBhZ2VcIiBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX3BhZ2VcIiBnYXA9ezE2fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cIm9yZGVyLWRldGFpbC1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJvcmRlci1kZXRhaWwtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIm9yZGVyLWRldGFpbF9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEJBMlx1NTM1NSBTTy0xMDAxXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTIxQlx1NUVGQVx1NEU4RSAyMDI2LTA4LTA0XCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGlkPVwib3JkZXItZGV0YWlsLWNhbmNlbC1hY3Rpb25cIiBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX2NhbmNlbC1hY3Rpb25cIiB0bz1cIm9yZGVyLWNhbmNlbFwiPlx1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NTwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPEdyaWQgaWQ9XCJvcmRlci1kZXRhaWwtc3VtbWFyeVwiIGNsYXNzTmFtZT1cIm9yZGVyLWRldGFpbF9fc3VtbWFyeVwiIGNvbHVtbnM9ezJ9IGdhcD17MTZ9PlxuICAgICAgICAgIDxDYXJkIGlkPVwib3JkZXItZGV0YWlsLWN1c3RvbWVyLWNhcmRcIiBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX2N1c3RvbWVyLWNhcmRcIj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwib3JkZXItZGV0YWlsX19jdXN0b21lci1jb250ZW50XCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX3NlY3Rpb24tdGl0bGVcIj5cdTVCQTJcdTYyMzdcdTRGRTFcdTYwNkY8L3N0cm9uZz5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwib3JkZXItZGV0YWlsX19jdXN0b21lci1uYW1lXCI+XHU3OTNBXHU0RjhCXHU1QkEyXHU2MjM3XHU3NTMyPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX2N1c3RvbWVyLXR5cGVcIj5cdTRGMDFcdTRFMUFcdTVCQTJcdTYyMzc8L1RleHQ+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPENhcmQgaWQ9XCJvcmRlci1kZXRhaWwtYW1vdW50LWNhcmRcIiBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX2Ftb3VudC1jYXJkXCI+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIm9yZGVyLWRldGFpbF9fYW1vdW50LWNvbnRlbnRcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIm9yZGVyLWRldGFpbF9fc2VjdGlvbi10aXRsZVwiPlx1OEJBMlx1NTM1NVx1OTFEMVx1OTg5RDwvc3Ryb25nPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX2Ftb3VudC12YWx1ZVwiPjEsMjgwLjAwPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJvcmRlci1kZXRhaWxfX3BheW1lbnQtc3RhdHVzXCI+XHU1Rjg1XHU2NTJGXHU0RUQ4PC9UZXh0PlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FkbWluTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS4zLjBcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBZG1pbkxheW91dCB9IGZyb20gJy4uL2xheW91dHMvQWRtaW5MYXlvdXQuanN4J1xuXG5jb25zdCByb3dzID0gW1xuICB7XG4gICAgaWQ6ICdTTy0xMDAxJyxcbiAgICBjdXN0b21lcjogJ1x1NzkzQVx1NEY4Qlx1NUJBMlx1NjIzN1x1NzUzMlx1RkYwOFx1NTM0RVx1NEUxQ1x1NTMzQVx1NjVEN1x1ODIzMFx1OTVFOFx1NUU5N1x1RkYwOScsXG4gICAgY2hhbm5lbDogJ1x1N0VCRlx1NEUwQlx1OTVFOFx1NUU5NyAvIFx1NEUwQVx1NkQ3N1x1OTc1OVx1NUI4OScsXG4gICAgc2t1OiAnV0YtREVTSy1QUk8tMTIwMCcsXG4gICAgd2FyZWhvdXNlOiAnXHU1MzRFXHU0RTFDXHU0RTAwXHU1M0Y3XHU0RUQzLUExMicsXG4gICAgYW1vdW50OiAnMSwyODAuMDAnLFxuICAgIHBhaWQ6ICcwLjAwJyxcbiAgICBsb2dpc3RpY3M6ICdcdTY3MkFcdTUzRDFcdThEMjcgXHUwMEI3IFx1NUY4NVx1OEMwM1x1NUVBNicsXG4gICAgb3duZXI6ICdcdTVGMjBcdTRFMDlcdUZGMDhcdTVCQTJcdTY3MERcdTRFMDBcdTdFQzRcdUZGMDknLFxuICAgIGNyZWF0ZWRBdDogJzIwMjYtMDgtMDQgMDk6MTI6MzMnLFxuICAgIHVwZGF0ZWRBdDogJzIwMjYtMDgtMDQgMTE6MDg6MDEnLFxuICAgIHJlbWFyazogJ1x1NUJBMlx1NjIzN1x1ODk4MVx1NkM0Mlx1NURFNVx1NEY1Q1x1NjVFNVx1NEUwQVx1NTM0OFx1OTE0RFx1OTAwMVx1RkYwQ1x1OTcwMFx1NUYwMFx1NTg5RVx1NTAzQ1x1N0EwRVx1NEUxM1x1NzUyOFx1NTNEMVx1Nzk2OCcsXG4gICAgc3RhdHVzOiAnXHU1Rjg1XHU1OTA0XHU3NDA2JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnU08tMTAwMicsXG4gICAgY3VzdG9tZXI6ICdcdTc5M0FcdTRGOEJcdTVCQTJcdTYyMzdcdTRFNTlcdUZGMDhcdTUzNEVcdTUzNTdcdTdFQ0ZcdTk1MDBcdTU1NDZcdUZGMDknLFxuICAgIGNoYW5uZWw6ICdcdTdFQ0ZcdTk1MDBcdTU1NDZcdTk1RThcdTYyMzcnLFxuICAgIHNrdTogJ1dGLUNIQUlSLVNURC0wMScsXG4gICAgd2FyZWhvdXNlOiAnXHU1MzRFXHU1MzU3XHU0RTJEXHU4RjZDXHU0RUQzLUIwMycsXG4gICAgYW1vdW50OiAnODYwLjAwJyxcbiAgICBwYWlkOiAnODYwLjAwJyxcbiAgICBsb2dpc3RpY3M6ICdcdThGRDBcdThGOTNcdTRFMkQgXHUwMEI3IFNGMTIzNDU2Nzg5MENOJyxcbiAgICBvd25lcjogJ1x1Njc0RVx1NTZEQlx1RkYwOFx1NUJBMlx1NjcwRFx1NEU4Q1x1N0VDNFx1RkYwOScsXG4gICAgY3JlYXRlZEF0OiAnMjAyNi0wOC0wMyAxNDoyMjoxMCcsXG4gICAgdXBkYXRlZEF0OiAnMjAyNi0wOC0wNSAwODo0MTo1NScsXG4gICAgcmVtYXJrOiAnXHU1REYyXHU0RUQ4XHU2QjNFXHVGRjBDXHU2NTM2XHU0RUY2XHU0RUJBXHU2MjRCXHU2NzNBXHU1QzNFXHU1M0Y3IDg4OTknLFxuICAgIHN0YXR1czogJ1x1NTkwNFx1NzQwNlx1NEUyRCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ1NPLTEwMDMnLFxuICAgIGN1c3RvbWVyOiAnXHU3OTNBXHU0RjhCXHU1QkEyXHU2MjM3XHU0RTE5XHVGRjA4XHU1MzRFXHU1MzE3XHU0RjAxXHU0RTFBXHU5MUM3XHU4RDJEXHVGRjA5JyxcbiAgICBjaGFubmVsOiAnXHU0RjAxXHU0RTFBXHU5MUM3XHU4RDJEIC8gXHU2MkRCXHU2ODA3XHU2Mjc5XHU2QjIxICM4OCcsXG4gICAgc2t1OiAnV0YtQ0FCSU5FVC1YTC0wNCcsXG4gICAgd2FyZWhvdXNlOiAnXHU1MzRFXHU1MzE3XHU0RTJEXHU1OTJFXHU0RUQzLUMyMScsXG4gICAgYW1vdW50OiAnMiw0MDAuMDAnLFxuICAgIHBhaWQ6ICcyLDQwMC4wMCcsXG4gICAgbG9naXN0aWNzOiAnXHU1REYyXHU3QjdFXHU2NTM2IFx1MDBCNyAyMDI2LTA4LTAyJyxcbiAgICBvd25lcjogJ1x1NzM4Qlx1NEU5NFx1RkYwOFx1NTkyN1x1NUJBMlx1NjIzN1x1N0VDNFx1RkYwOScsXG4gICAgY3JlYXRlZEF0OiAnMjAyNi0wNy0yOCAxNjowNTo0NCcsXG4gICAgdXBkYXRlZEF0OiAnMjAyNi0wOC0wMiAxNzozMDoxMicsXG4gICAgcmVtYXJrOiAnXHU1NDA4XHU1NDBDXHU1M0Y3IENOLTIwMjYtMDcyOC0wMDRcdUZGMENcdTlBOENcdTY1MzZcdTU0MDhcdTY4M0MnLFxuICAgIHN0YXR1czogJ1x1NURGMlx1NUI4Q1x1NjIxMCcsXG4gIH0sXG5dXG5cbmNvbnN0IGNvbHVtbnMgPSBbXG4gIHsga2V5OiAnaWQnLCBsYWJlbDogJ1x1OEJBMlx1NTM1NVx1NTNGNycgfSxcbiAgeyBrZXk6ICdjaGFubmVsJywgbGFiZWw6ICdcdTRFMEJcdTUzNTVcdTZFMjBcdTkwNTMnIH0sXG4gIHsga2V5OiAnY3VzdG9tZXInLCBsYWJlbDogJ1x1NUJBMlx1NjIzN1x1NTQwRFx1NzlGMCcgfSxcbiAgeyBrZXk6ICdza3UnLCBsYWJlbDogJ1x1NEUzQiBTS1UnIH0sXG4gIHsga2V5OiAnd2FyZWhvdXNlJywgbGFiZWw6ICdcdTUzRDFcdThEMjdcdTRFRDMnIH0sXG4gIHsga2V5OiAnYW1vdW50JywgbGFiZWw6ICdcdThCQTJcdTUzNTVcdTkxRDFcdTk4OUQnIH0sXG4gIHsga2V5OiAncGFpZCcsIGxhYmVsOiAnXHU1REYyXHU0RUQ4XHU5MUQxXHU5ODlEJyB9LFxuICB7IGtleTogJ2xvZ2lzdGljcycsIGxhYmVsOiAnXHU3MjY5XHU2RDQxXHU3MkI2XHU2MDAxJyB9LFxuICB7IGtleTogJ293bmVyJywgbGFiZWw6ICdcdThEMUZcdThEMjNcdTRFQkEnIH0sXG4gIHsga2V5OiAnY3JlYXRlZEF0JywgbGFiZWw6ICdcdTUyMUJcdTVFRkFcdTY1RjZcdTk1RjQnIH0sXG4gIHsga2V5OiAndXBkYXRlZEF0JywgbGFiZWw6ICdcdTY2RjRcdTY1QjBcdTY1RjZcdTk1RjQnIH0sXG4gIHsga2V5OiAncmVtYXJrJywgbGFiZWw6ICdcdTU5MDdcdTZDRTgnIH0sXG4gIHsga2V5OiAnc3RhdHVzJywgbGFiZWw6ICdcdTcyQjZcdTYwMDEnLCByZW5kZXI6ICh2YWx1ZSkgPT4gPEJhZGdlIGNsYXNzTmFtZT1cIm9yZGVyLWxpc3RfX3N0YXR1c1wiPnt2YWx1ZX08L0JhZGdlPiB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gT3JkZXJMaXN0U2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBZG1pbkxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJvcmRlci1saXN0LXBhZ2VcIiBjbGFzc05hbWU9XCJvcmRlci1saXN0X19wYWdlXCIgZ2FwPXsxNn0+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwib3JkZXItbGlzdC1oZWFkZXJcIiB0aXRsZUlkPVwib3JkZXItbGlzdC10aXRsZVwiIGNsYXNzTmFtZT1cIm9yZGVyLWxpc3RfX2hlYWRlclwiIHRpdGxlPVwiXHU4QkEyXHU1MzU1XHU1MjE3XHU4ODY4XCIgc3VidGl0bGU9XCJcdTUxNzEgMyBcdTY3NjFcdTZGMTRcdTc5M0FcdTY1NzBcdTYzNkUgXHUwMEI3IFx1NUJCRFx1ODg2OFx1NkEyQVx1NTQxMVx1NkVEQVx1NTJBOFwiIC8+XG4gICAgICAgIDxDYXJkIGlkPVwib3JkZXItbGlzdC1mZWF0dXJlZC1vcmRlclwiIGNsYXNzTmFtZT1cIm9yZGVyLWxpc3RfX2ZlYXR1cmVkLW9yZGVyXCIgdG89XCJvcmRlci1kZXRhaWxcIj5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJvcmRlci1saXN0X19mZWF0dXJlZC10aXRsZVwiIGxldmVsPXszfT5cdTVGODVcdTU5MDRcdTc0MDZcdThCQTJcdTUzNTU8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwib3JkZXItbGlzdF9fZmVhdHVyZWQtZGVzY3JpcHRpb25cIj5cdTYyNTNcdTVGMDAgU08tMTAwMSBcdThCRTZcdTYwQzU8L1RleHQ+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPERhdGFUYWJsZSBpZD1cIm9yZGVyLWxpc3QtdGFibGVcIiBjbGFzc05hbWU9XCJkZW1vLXdpZGUtdGFibGUgb3JkZXItbGlzdF9fdGFibGVcIiBjb2x1bW5zPXtjb2x1bW5zfSByb3dzPXtyb3dzfSAvPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BZG1pbkxheW91dD5cbiAgKVxufVxuIiwgImltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2xvZ2luLmpzeCdcbmltcG9ydCB7IE9yZGVyQ2FuY2VsU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL29yZGVyLWNhbmNlbC5qc3gnXG5pbXBvcnQgeyBPcmRlckRldGFpbFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9vcmRlci1kZXRhaWwuanN4J1xuaW1wb3J0IHsgT3JkZXJMaXN0U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL29yZGVyLWxpc3QuanN4J1xuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ1x1OEJBMlx1NTM1NVx1N0JBMVx1NzQwNlx1NTQwRVx1NTNGMCcsXG4gIHZpZXdwb3J0czoge1xuICAgIGRlc2t0b3A6IHsgd2lkdGg6IDEyODAsIGhlaWdodDogODAwIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ2Rlc2t0b3AnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICdsb2dpbicsXG4gICAgICB0aXRsZTogJ1x1NzY3Qlx1NUY1NScsXG4gICAgICBjb21wb25lbnQ6IExvZ2luU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWydvcmRlci1saXN0J10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdvcmRlci1saXN0JyxcbiAgICAgIHRpdGxlOiAnXHU4QkEyXHU1MzU1XHU1MjE3XHU4ODY4JyxcbiAgICAgIGNvbXBvbmVudDogT3JkZXJMaXN0U2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCcsICdvcmRlci1kZXRhaWwnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ29yZGVyLWRldGFpbCcsXG4gICAgICB0aXRsZTogJ1x1OEJBMlx1NTM1NVx1OEJFNlx1NjBDNScsXG4gICAgICBjb21wb25lbnQ6IE9yZGVyRGV0YWlsU2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCcsICdvcmRlci1jYW5jZWwnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ29yZGVyLWNhbmNlbCcsXG4gICAgICB0aXRsZTogJ1x1NTNENlx1NkQ4OFx1OEJBMlx1NTM1NScsXG4gICAgICBjb21wb25lbnQ6IE9yZGVyQ2FuY2VsU2NyZWVuLFxuICAgICAgbGlua3M6IFsnb3JkZXItbGlzdCddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMnXG5pbXBvcnQgeyBwcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJ1xuXG52YWxpZGF0ZVByb2plY3QocHJvamVjdClcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxFcnJvckJvdW5kYXJ5IHNjb3BlPVwiYm9hcmRcIj5cbiAgICA8UHJvdG90eXBlUHJvdmlkZXIgcHJvamVjdD17cHJvamVjdH0+XG4gICAgICA8Qm9hcmQgcHJvamVjdD17cHJvamVjdH0gLz5cbiAgICA8L1Byb3RvdHlwZVByb3ZpZGVyPlxuICA8L0Vycm9yQm91bmRhcnk+LFxuKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQUEsTUFBTSxtQkFBbUIsTUFBTSxjQUFjLElBQUk7QUFFakQsV0FBUyxtQkFBbUJBLFVBQVM7QUFGckM7QUFHRSxhQUFPLEtBQUFBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLEtBQUssTUFBN0MsbUJBQWdELE9BQU1BLFNBQVEsUUFBUSxDQUFDLEVBQUU7QUFBQSxFQUNsRjtBQUVPLFdBQVMsa0JBQWtCLEVBQUUsU0FBQUEsVUFBUyxTQUFTLEdBQUc7QUFDdkQsVUFBTSxrQkFBa0IsbUJBQW1CQSxRQUFPO0FBQ2xELFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUN2QyxNQUFNO0FBQUEsTUFDTixhQUFhQSxTQUFRO0FBQUEsTUFDckIsU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDO0FBQUEsSUFDWixDQUFDO0FBRUQsVUFBTSxXQUFXLE1BQU0sWUFBWSxDQUFDLE9BQU87QUFDekMsVUFBSSxDQUFDQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxPQUFPLEVBQUUsR0FBRztBQUN2RCxjQUFNLElBQUksTUFBTSxzQkFBc0IsRUFBRSxrQkFBa0I7QUFBQSxNQUM1RDtBQUNBLGVBQVMsQ0FBQyxZQUFZO0FBQ3BCLFlBQUksUUFBUSxTQUFTLFVBQVUsT0FBTyxRQUFRLGlCQUFpQjtBQUM3RCxnQkFBTSxTQUFTQSxTQUFRLFFBQVEsS0FBSyxD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QUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsTUFDVCxTQUFTLEVBQUUsT0FBTyxNQUFNLFFBQVEsSUFBSTtBQUFBLElBQ3RDO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsT0FBTyxDQUFDLFlBQVk7QUFBQSxRQUNwQixXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLGNBQWMsY0FBYztBQUFBLFFBQ3BDLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsY0FBYyxjQUFjO0FBQUEsUUFDcEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZO0FBQUEsUUFDcEIsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUNwQ0Esa0JBQWdCLE9BQU87QUFFdkIsV0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ25ELG9DQUFDLGlCQUFjLE9BQU0sV0FDbkIsb0NBQUMscUJBQWtCLFdBQ2pCLG9DQUFDLFNBQU0sU0FBa0IsQ0FDM0IsQ0FDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInByb2plY3QiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29sdW1ucyIsICJjb2x1bW5zIiwgImNvbHVtbnMiLCAicm93cyJdCn0K
