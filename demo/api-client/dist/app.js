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
      "- \u4FDD\u6301 project.links \u4E3A\u9875\u9762\u6D41\u7684\u552F\u4E00\u8FB9\u6570\u636E\uFF1B\u5B8C\u6210\u540E\u91CD\u65B0\u6784\u5EFA\u5E76\u9A8C\u8BC1\u753B\u677F\u3001\u6F14\u793A\u548C\u4FEE\u6539\u6A21\u5F0F\u3002"
    ];
    if (!(items == null ? void 0 : items.length)) {
      lines.push("", "\u5F53\u524D\u6CA1\u6709\u4FEE\u6539\u610F\u89C1\u3002");
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
    const pointerDownTargetRef = React.useRef(null);
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
      if (!reviewEnabled || canvasLocked) {
        (_a = hoverReviewElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
        hoverReviewElementRef.current = null;
      }
      return () => {
        var _a2;
        (_a2 = hoverReviewElementRef.current) == null ? void 0 : _a2.classList.remove("is-review-hovered");
        hoverReviewElementRef.current = null;
      };
    }, [canvasLocked, reviewEnabled, screen == null ? void 0 : screen.id]);
    if (!screen) return null;
    const Component = screen.component;
    const frameClass = [
      "wf-screen-chrome",
      mode === "canvas" && focused ? "is-focused" : "",
      expanded ? "is-expanded" : "",
      `wf-screen-${mode}`
    ].filter(Boolean).join(" ");
    const onPointerDown = (event) => {
      pointerDownTargetRef.current = event.target;
      if (reviewEnabled) return;
      if (canvasLocked) {
        event.preventDefault();
        return;
      }
      if (expanded) return;
      const state = beginContentDragScroll(event, contentRef.current, { locked: canvasLocked, scale });
      if (!state) return;
      dragRef.current = state;
    };
    const onPointerMove = (event) => {
      var _a;
      if (reviewEnabled && !canvasLocked) {
        const target = findReviewTarget(event.target, contentRef.current);
        if (target === hoverReviewElementRef.current) return;
        (_a = hoverReviewElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
        target == null ? void 0 : target.classList.add("is-review-hovered");
        hoverReviewElementRef.current = target;
        return;
      }
      const state = dragRef.current;
      if (!state) return;
      const wasMoved = state.moved;
      moveContentDragScroll(state, event);
      if (!wasMoved && state.moved) {
        setDragScrolling(true);
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch (e) {
        }
      }
    };
    const onPointerEnd = (event) => {
      const state = dragRef.current;
      if (!state || state.pointerId !== event.pointerId) return;
      endContentDragScroll(state, contentRef.current);
      dragRef.current = null;
      setDragScrolling(false);
    };
    const onContentClick = (event) => {
      var _a, _b;
      if (reviewEnabled) return;
      const root = contentRef.current;
      const downTarget = pointerDownTargetRef.current;
      pointerDownTargetRef.current = null;
      const startEl = downTarget && (root == null ? void 0 : root.contains(downTarget)) ? downTarget : event.target;
      const to = findFlowTargetId(startEl, root);
      if (!to) return;
      (_a = event.preventDefault) == null ? void 0 : _a.call(event);
      (_b = event.stopPropagation) == null ? void 0 : _b.call(event);
      navigate(to);
    };
    const onReviewClick = (event) => {
      if (!reviewEnabled || canvasLocked) return;
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
      /* @__PURE__ */ React.createElement("div", { className: "wf-screen-chrome-label" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-title" }, /* @__PURE__ */ React.createElement("span", { className: "wf-screen-index-num" }, index + 1), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-screen-title" }, screen.title)), /* @__PURE__ */ React.createElement("span", { className: "wf-screen-chrome-actions" }, onToggleExpand ? /* @__PURE__ */ React.createElement(
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
          className: `wf-screen-content${dragScrolling ? " is-drag-scrolling" : ""}${expanded ? " is-expanded" : ""}${reviewEnabled && !canvasLocked ? " is-reviewing" : ""}`,
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
  var TRACKPAD_ZOOM_RATE = 15e-4;
  function normalizedWheelDelta(event) {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * 100;
    return event.deltaY;
  }
  function nextWheelScale(scale, event, { trackpadMode = false, sensitivity = 0.6 } = {}) {
    if (!trackpadMode) return clampScale(scale * (event.deltaY > 0 ? 0.9 : 1.1));
    const delta = normalizedWheelDelta(event);
    if (!delta) return scale;
    return clampScale(scale * Math.exp(-delta * TRACKPAD_ZOOM_RATE * sensitivity));
  }
  function bindWheelZoom(el, getScale, setScale, getLocked = () => false, getOptions = () => ({})) {
    if (!el) return () => {
    };
    const onWheel = (event) => {
      if (!shouldZoomOnWheel(event, { locked: getLocked() })) return;
      event.preventDefault();
      setScale(nextWheelScale(getScale(), event, getOptions()));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }
  function useWheelZoom(elementRef, scale, setScale, locked = false, options = {}) {
    const scaleRef = React.useRef(scale);
    const lockedRef = React.useRef(locked);
    const optionsRef = React.useRef(options);
    scaleRef.current = scale;
    lockedRef.current = locked;
    optionsRef.current = options;
    React.useEffect(
      () => bindWheelZoom(
        elementRef.current,
        () => scaleRef.current,
        setScale,
        () => lockedRef.current,
        () => optionsRef.current
      ),
      [elementRef, setScale]
    );
  }

  // starter/framework/lib/board/validation.js
  function canUseDemo(screens) {
    return Array.isArray(screens) && screens.some((screen) => screen.entry === true);
  }

  // starter/framework/lib/board/canvas-index.js
  var CANVAS_INDEX_MARGIN = 16;
  function finite(value, fallback = 0) {
    return Number.isFinite(value) ? value : fallback;
  }
  function clampCanvasIndexPosition(position, container, item, margin = CANVAS_INDEX_MARGIN) {
    const containerWidth = Math.max(0, finite(container == null ? void 0 : container.width));
    const containerHeight = Math.max(0, finite(container == null ? void 0 : container.height));
    const itemWidth = Math.max(0, finite(item == null ? void 0 : item.width));
    const itemHeight = Math.max(0, finite(item == null ? void 0 : item.height));
    const maxX = Math.max(margin, containerWidth - itemWidth - margin);
    const maxY = Math.max(margin, containerHeight - itemHeight - margin);
    return {
      x: Math.min(Math.max(finite(position == null ? void 0 : position.x, margin), margin), maxX),
      y: Math.min(Math.max(finite(position == null ? void 0 : position.y, margin), margin), maxY)
    };
  }
  function defaultCanvasIndexPosition(container, item, margin = CANVAS_INDEX_MARGIN) {
    return clampCanvasIndexPosition({
      x: (finite(container == null ? void 0 : container.width) - finite(item == null ? void 0 : item.width)) / 2,
      y: finite(container == null ? void 0 : container.height) - finite(item == null ? void 0 : item.height) - margin
    }, container, item, margin);
  }
  function waitForCanvasIndexElements(getElements, onReady, scheduler) {
    let active = true;
    let frame = null;
    const attempt = () => {
      if (!active) return;
      const elements = getElements();
      if (!(elements == null ? void 0 : elements.container) || !(elements == null ? void 0 : elements.item)) {
        frame = scheduler.request(attempt);
        return;
      }
      frame = null;
      onReady(elements);
    };
    frame = scheduler.request(attempt);
    return () => {
      active = false;
      if (frame != null) scheduler.cancel(frame);
    };
  }

  // starter/framework/lib/board/CanvasMode.jsx
  var INDEX_DRAG_THRESHOLD = 4;
  function elementSize(element) {
    return { width: (element == null ? void 0 : element.offsetWidth) || 0, height: (element == null ? void 0 : element.offsetHeight) || 0 };
  }
  function CanvasIndex({
    canvasRef,
    project: project2,
    currentScreenId,
    demoAvailable,
    position,
    onPositionChange,
    onClose,
    navigate,
    enterDemo
  }) {
    const indexRef = React.useRef(null);
    const dragRef = React.useRef(null);
    const [dragging, setDragging] = React.useState(false);
    const constrain = React.useCallback((nextPosition, useDefault = false) => {
      const canvas = canvasRef.current;
      const index = indexRef.current;
      if (!canvas || !index) return nextPosition;
      const container = { width: canvas.clientWidth, height: canvas.clientHeight };
      const item = elementSize(index);
      return useDefault ? defaultCanvasIndexPosition(container, item) : clampCanvasIndexPosition(nextPosition, container, item);
    }, [canvasRef]);
    const needsDefaultPosition = position == null;
    React.useLayoutEffect(() => {
      let disconnectResize = () => {
      };
      const stopWaiting = waitForCanvasIndexElements(
        () => ({ container: canvasRef.current, item: indexRef.current }),
        ({ container: canvas, item: index }) => {
          const update = () => onPositionChange((current) => constrain(current, current == null));
          update();
          if (typeof ResizeObserver === "function") {
            const observer = new ResizeObserver(update);
            observer.observe(canvas);
            observer.observe(index);
            disconnectResize = () => observer.disconnect();
            return;
          }
          window.addEventListener("resize", update);
          disconnectResize = () => window.removeEventListener("resize", update);
        },
        {
          request: (callback) => window.requestAnimationFrame(callback),
          cancel: (frame) => window.cancelAnimationFrame(frame)
        }
      );
      return () => {
        stopWaiting();
        disconnectResize();
      };
    }, [canvasRef, constrain, needsDefaultPosition, onPositionChange]);
    const finishDrag = (event) => {
      var _a, _b;
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;
      setDragging(false);
      if ((_b = (_a = event.currentTarget).hasPointerCapture) == null ? void 0 : _b.call(_a, event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      event.stopPropagation();
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        ref: indexRef,
        className: dragging ? "wf-canvas-index is-dragging" : "wf-canvas-index",
        style: position ? { left: position.x, top: position.y } : { visibility: "hidden" }
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-canvas-index-handle",
          "aria-label": "\u62D6\u52A8\u753B\u677F\u7D22\u5F15",
          title: "\u62D6\u52A8\u753B\u677F\u7D22\u5F15",
          onPointerDown: (event) => {
            if (event.button !== 0) return;
            const origin = position || constrain(null, true);
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              origin,
              moved: false
            };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.preventDefault();
            event.stopPropagation();
          },
          onPointerMove: (event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            const deltaX = event.clientX - drag.startX;
            const deltaY = event.clientY - drag.startY;
            if (!drag.moved && Math.hypot(deltaX, deltaY) < INDEX_DRAG_THRESHOLD) return;
            drag.moved = true;
            setDragging(true);
            onPositionChange(constrain({ x: drag.origin.x + deltaX, y: drag.origin.y + deltaY }));
            event.preventDefault();
            event.stopPropagation();
          },
          onPointerUp: finishDrag,
          onPointerCancel: finishDrag
        },
        /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-grip", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null), /* @__PURE__ */ React.createElement("i", null)),
        /* @__PURE__ */ React.createElement("span", null, "\u7D22\u5F15")
      ),
      /* @__PURE__ */ React.createElement("div", { className: "wf-canvas-index-list" }, project2.screens.map((screen, index) => /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          key: screen.id,
          className: screen.id === currentScreenId ? "wf-canvas-index-dot is-active" : "wf-canvas-index-dot",
          onClick: (event) => {
            event.stopPropagation();
            navigate(screen.id);
          },
          onDoubleClick: (event) => {
            event.stopPropagation();
            enterDemo(screen.id);
          },
          "aria-label": `${index + 1}. ${screen.title}`,
          title: demoAvailable ? "\u53CC\u51FB\u8FDB\u5165\u6F14\u793A" : void 0
        },
        /* @__PURE__ */ React.createElement("span", null, index + 1),
        /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip-title" }, screen.title), /* @__PURE__ */ React.createElement("span", { className: "wf-canvas-index-tooltip-file" }, "src/screens/", screen.id, ".jsx"))
      ))),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-canvas-index-close",
          "aria-label": "\u5173\u95ED\u753B\u677F\u7D22\u5F15",
          title: "\u5173\u95ED\u753B\u677F\u7D22\u5F15",
          onClick: (event) => {
            event.stopPropagation();
            onClose();
          }
        },
        /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 16 16", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "m4 4 8 8M12 4l-8 8" }))
      )
    );
  }
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
    wheelZoomOptions,
    selectedIds,
    setSelectedIds,
    expandedIds = /* @__PURE__ */ new Set(),
    onToggleExpand,
    onExportIds,
    reviewEnabled = false,
    onReviewSelect,
    onCanvasClick,
    canvasIndexVisible = true,
    canvasIndexPosition,
    onCanvasIndexPositionChange,
    onCloseCanvasIndex
  }) {
    const { currentScreenId, navigate, viewport, viewportKey, enterDemo: enterDemoMode } = usePrototype();
    const [view, setView] = React.useState(() => ({ ...resetCanvasViewport(), scale }));
    const [dragging, setDragging] = React.useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
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
    useWheelZoom(canvasRef, scale, setScale, canvasLocked, wheelZoomOptions);
    const startPan = (event) => {
      var _a, _b;
      if (!canvasLocked) return;
      if (event.button != null && event.button !== 0) return;
      if ((_b = (_a = event.target).closest) == null ? void 0 : _b.call(_a, ".wf-canvas-index")) return;
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
      if (!demoAvailable) return;
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
    return /* @__PURE__ */ React.createElement("div", { className: "wf-canvas-shell" }, /* @__PURE__ */ React.createElement("aside", { className: `wf-screen-sidebar${sidebarCollapsed ? " is-collapsed" : ""}`, "aria-hidden": sidebarCollapsed }, /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-header" }, /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: selectedIds.size === project2.screens.length && project2.screens.length > 0,
        onChange: toggleAll,
        tabIndex: sidebarCollapsed ? -1 : void 0
      }
    ), "\u5168\u9009"), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "wf-sidebar-toggle",
        "aria-label": "\u6536\u8D77\u4FA7\u680F",
        title: "\u6536\u8D77\u4FA7\u680F",
        tabIndex: sidebarCollapsed ? -1 : void 0,
        onClick: () => setSidebarCollapsed(true)
      },
      /* @__PURE__ */ React.createElement("svg", { className: "wf-sidebar-toggle-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M9 3v18" }), /* @__PURE__ */ React.createElement("path", { d: "m16 15-3-3 3-3" }))
    )), /* @__PURE__ */ React.createElement("ul", { className: "wf-screen-list" }, project2.screens.map((screen, index) => /* @__PURE__ */ React.createElement(
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
          "aria-label": `\u9009\u62E9 ${screen.title}`,
          tabIndex: sidebarCollapsed ? -1 : void 0
        }
      ),
      /* @__PURE__ */ React.createElement("span", { className: "wf-screen-index-num" }, index + 1),
      /* @__PURE__ */ React.createElement("span", { className: "wf-screen-title" }, screen.title)
    ))), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tips", "aria-label": "\u64CD\u4F5C\u63D0\u793A" }, /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("span", null, "\u4E0D\u53EF\u4EA4\u4E92\uFF1A\u62D6\u62FD\u5E73\u79FB / \u6EDA\u8F6E\u7F29\u653E")), /* @__PURE__ */ React.createElement("div", { className: "wf-sidebar-tip" }, /* @__PURE__ */ React.createElement("span", null, "\u53EF\u4EA4\u4E92\uFF1A\u7A7A\u683C\u62D6\u62FD / Ctrl+\u6EDA\u8F6E")))), sidebarCollapsed ? /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: "wf-sidebar-expand",
        "aria-label": "\u5C55\u5F00\u4FA7\u680F",
        title: "\u5C55\u5F00\u4FA7\u680F",
        onClick: () => setSidebarCollapsed(false)
      },
      /* @__PURE__ */ React.createElement("svg", { className: "wf-sidebar-toggle-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M9 3v18" }), /* @__PURE__ */ React.createElement("path", { d: "m14 9 3 3-3 3" }))
    ) : null, /* @__PURE__ */ React.createElement(
      "main",
      {
        ref: canvasRef,
        className: `wf-canvas${dragging ? " is-dragging" : ""}${canvasLocked ? " is-locked" : ""}`,
        onPointerDown: startPan,
        onPointerMove: movePan,
        onPointerUp: endPan,
        onPointerCancel: endPan,
        onClick: onCanvasClick
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
      canvasIndexVisible ? /* @__PURE__ */ React.createElement(
        CanvasIndex,
        {
          canvasRef,
          project: project2,
          currentScreenId,
          demoAvailable,
          position: canvasIndexPosition,
          onPositionChange: onCanvasIndexPositionChange,
          onClose: onCloseCanvasIndex,
          navigate,
          enterDemo
        }
      ) : null
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
    wheelZoomOptions,
    scale,
    setScale,
    viewResetKey,
    expandedIds = /* @__PURE__ */ new Set(),
    onToggleExpand,
    reviewEnabled = false,
    onReviewSelect,
    onCanvasClick
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
    useWheelZoom(viewportRef, scale, setScale, canvasLocked, wheelZoomOptions);
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
        onClick: onCanvasClick,
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
    visible = true,
    selections,
    multiSelect,
    items,
    onToggleMultiSelect,
    onSelectElement,
    onHoverElement,
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
    return /* @__PURE__ */ React.createElement("aside", { className: "wf-review-panel", "aria-label": "\u4FEE\u6539\u539F\u578B", hidden: !visible }, /* @__PURE__ */ React.createElement("header", { className: "wf-review-panel-header" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-heading" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-panel-title" }, "\u4FEE\u6539\u539F\u578B"), /* @__PURE__ */ React.createElement("span", { className: "wf-review-panel-count" }, items.length, " \u6761\u4FEE\u6539")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-close", onClick: onClose }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-body" }, /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-heading" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u5DF2\u9009\u8282\u70B9 (", selections.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-actions" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: multiSelect ? "wf-review-multi-select is-active" : "wf-review-multi-select",
        "aria-pressed": multiSelect,
        onClick: onToggleMultiSelect
      },
      "\u591A\u9009 ",
      multiSelect ? "ON" : "OFF"
    ), selections.length > 0 ? /* @__PURE__ */ React.createElement("button", { className: "wf-review-clear-selection", type: "button", onClick: onClearSelection }, "\u6E05\u7A7A") : null)), /* @__PURE__ */ React.createElement("p", { className: "wf-review-selection-hint" }, "\u591A\u9009\u5F00\u542F\u540E\u70B9\u51FB\u8282\u70B9\u53EF\u52A0\u5165\u6216\u79FB\u9664\uFF1B\u4E5F\u53EF\u6309\u4F4F Shift / Command / Ctrl \u70B9\u51FB\u3002"), selections.length > 0 ? /* @__PURE__ */ React.createElement("ol", { className: "wf-review-selections" }, selections.map((selection, index) => /* @__PURE__ */ React.createElement("li", { className: selection === selected ? "wf-review-selection is-active" : "wf-review-selection", key: `${selection.screenId}:${selection.selector}` }, /* @__PURE__ */ React.createElement("code", { className: "wf-review-selection-selector" }, index + 1, ". ", selection.selector), /* @__PURE__ */ React.createElement("button", { className: "wf-review-selection-remove", type: "button", onClick: () => onRemoveSelection(selection.element) }, "\u79FB\u9664")))) : null, selected ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wf-review-screen-name" }, selected.screenTitle, " \xB7 ", selected.screenId), /* @__PURE__ */ React.createElement("div", { className: "wf-review-breadcrumbs", "aria-label": "\u8282\u70B9\u5C42\u7EA7" }, selected.ancestors.map((ancestor, index) => /* @__PURE__ */ React.createElement(React.Fragment, { key: ancestor.selector }, index > 0 ? /* @__PURE__ */ React.createElement("span", { className: "wf-review-breadcrumb-sep", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" }))) : null, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "wf-review-breadcrumb",
        type: "button",
        title: ancestor.selector,
        onMouseEnter: () => onHoverElement == null ? void 0 : onHoverElement(ancestor.element),
        onMouseLeave: () => onHoverElement == null ? void 0 : onHoverElement(null),
        onClick: () => onSelectElement(ancestor.element)
      },
      ancestor.label
    )))), /* @__PURE__ */ React.createElement("code", { className: "wf-review-selector" }, selected.selector), selected.currentText ? /* @__PURE__ */ React.createElement("p", { className: "wf-review-current-text" }, "\u5F53\u524D\uFF1A", selected.currentText) : null, /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, "\u4FEE\u6539\u7C7B\u578B"), /* @__PURE__ */ React.createElement("select", { className: "wf-review-type-select", value: type, onChange: (event) => setType(event.target.value) }, Object.entries(REVIEW_TYPE_LABELS).map(([value, label]) => /* @__PURE__ */ React.createElement("option", { className: "wf-review-type-option", value, key: value }, label)))), /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, instructionLabel), /* @__PURE__ */ React.createElement(
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
    )) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u70B9\u51FB\u9875\u9762\u4E2D\u7684\u8282\u70B9\u5F00\u59CB\u4FEE\u6539\u3002\u70B9\u51FB\u9762\u5305\u5C51\u53EF\u5207\u6362\u5230\u7236\u7EA7\u7EC4\u4EF6\u3002")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u4FEE\u6539\u6E05\u5355"), items.length > 0 ? /* @__PURE__ */ React.createElement("ol", { className: "wf-review-items" }, items.map((item, index) => /* @__PURE__ */ React.createElement("li", { className: "wf-review-item", key: item.id }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-item-content" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-item-title" }, index + 1, ". ", REVIEW_TYPE_LABELS[item.type]), /* @__PURE__ */ React.createElement("code", { className: "wf-review-item-selector" }, reviewTargets(item).map((target) => target.selector).join("\u3001")), /* @__PURE__ */ React.createElement("p", { className: "wf-review-item-instruction" }, item.instruction || "\u5220\u9664\u8BE5\u8282\u70B9\uFF0C\u5E76\u540C\u6B65\u6E05\u7406\u65E0\u7528\u4EE3\u7801\u3002")), /* @__PURE__ */ React.createElement("button", { className: "wf-review-item-delete", type: "button", onClick: () => onRemoveItem(item.id) }, "\u5220\u9664")))) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u8FD8\u6CA1\u6709\u4FEE\u6539\u610F\u89C1\u3002")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section wf-review-prompt-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-section-title" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u6700\u7EC8 Prompt"), /* @__PURE__ */ React.createElement("button", { className: "wf-review-regenerate", type: "button", onClick: regenerate }, "\u91CD\u65B0\u751F\u6210")), promptDirty ? /* @__PURE__ */ React.createElement("p", { className: "wf-review-manual" }, "Prompt \u5DF2\u624B\u52A8\u4FEE\u6539\uFF1B\u91CD\u65B0\u751F\u6210\u4F1A\u8986\u76D6\u624B\u52A8\u5185\u5BB9\u3002") : null, /* @__PURE__ */ React.createElement(
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
  function ReviewMarkers({ boardRef, items, onOpenPanel }) {
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
    React.useLayoutEffect(() => {
      refresh();
    }, [refresh]);
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
    return /* @__PURE__ */ React.createElement("div", { className: "wf-review-markers", "aria-label": "\u4FEE\u6539\u6807\u8BB0" }, positions.map((position) => /* @__PURE__ */ React.createElement(
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
      /* @__PURE__ */ React.createElement("div", { className: "wf-review-marker-popover-targets" }, reviewTargets(active.item).map((target) => /* @__PURE__ */ React.createElement("code", { className: "wf-review-marker-popover-selector", key: target.selector }, target.selector))),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "wf-review-marker-popover-more",
          type: "button",
          onClick: () => {
            setActiveKey(null);
            onOpenPanel == null ? void 0 : onOpenPanel();
          }
        },
        "\u67E5\u770B\u66F4\u591A"
      )
    ) : null);
  }

  // starter/framework/lib/board/ReviewLauncher.jsx
  var LAUNCHER_SIZE = 48;
  var LAUNCHER_MARGIN = 20;
  var DRAG_THRESHOLD = 4;
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), Math.max(min, max));
  }
  function clampPosition(board, position) {
    if (!board) return position;
    return {
      x: clamp(position.x, LAUNCHER_MARGIN, board.clientWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN),
      y: clamp(position.y, LAUNCHER_MARGIN, board.clientHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN)
    };
  }
  function defaultPosition(board) {
    return clampPosition(board, {
      x: board.clientWidth - LAUNCHER_SIZE - LAUNCHER_MARGIN,
      y: board.clientHeight - LAUNCHER_SIZE - LAUNCHER_MARGIN
    });
  }
  function readPosition(storageKey) {
    try {
      const value = JSON.parse(window.localStorage.getItem(storageKey));
      if (Number.isFinite(value == null ? void 0 : value.x) && Number.isFinite(value == null ? void 0 : value.y)) return value;
    } catch (e) {
    }
    return null;
  }
  function savePosition(storageKey, position) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(position));
    } catch (e) {
    }
  }
  function CommentIcon() {
    return /* @__PURE__ */ React.createElement("svg", { className: "wf-review-launcher-icon", viewBox: "0 0 24 24", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("path", { d: "M5 4.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" }), /* @__PURE__ */ React.createElement("path", { d: "M7.5 10.5h9" }));
  }
  function ReviewLauncher({ boardRef, count, projectName, onOpen }) {
    const storageKey = `wf-review-launcher-position:${projectName}`;
    const [position, setPosition] = React.useState(null);
    const [dragging, setDragging] = React.useState(false);
    const dragRef = React.useRef(null);
    const positionRef = React.useRef(null);
    const suppressClickRef = React.useRef(false);
    const updatePosition = React.useCallback((next) => {
      const clamped = clampPosition(boardRef.current, next);
      positionRef.current = clamped;
      setPosition(clamped);
      return clamped;
    }, [boardRef]);
    React.useLayoutEffect(() => {
      const board = boardRef.current;
      if (!board) return void 0;
      updatePosition(readPosition(storageKey) || defaultPosition(board));
      const handleResize = () => {
        const next = updatePosition(positionRef.current || defaultPosition(board));
        savePosition(storageKey, next);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [boardRef, storageKey, updatePosition]);
    const finishDrag = (event) => {
      var _a, _b;
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      suppressClickRef.current = drag.moved;
      dragRef.current = null;
      setDragging(false);
      if (positionRef.current) savePosition(storageKey, positionRef.current);
      if ((_b = (_a = event.currentTarget).hasPointerCapture) == null ? void 0 : _b.call(_a, event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    };
    if (count <= 0) return null;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: dragging ? "wf-review-launcher is-dragging" : "wf-review-launcher",
        style: position ? { left: position.x, top: position.y } : { right: LAUNCHER_MARGIN, bottom: LAUNCHER_MARGIN },
        "aria-label": `\u5C55\u5F00\u4FEE\u6539\u6E05\u5355\uFF0C\u5171 ${count} \u6761\u4FEE\u6539`,
        "data-tooltip": "\u5C55\u5F00\u4FEE\u6539\u6E05\u5355",
        onPointerDown: (event) => {
          if (event.button !== 0) return;
          const origin = positionRef.current || defaultPosition(boardRef.current);
          dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            origin,
            moved: false
          };
          suppressClickRef.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove: (event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const deltaX = event.clientX - drag.startX;
          const deltaY = event.clientY - drag.startY;
          if (!drag.moved && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;
          drag.moved = true;
          setDragging(true);
          updatePosition({ x: drag.origin.x + deltaX, y: drag.origin.y + deltaY });
        },
        onPointerUp: finishDrag,
        onPointerCancel: finishDrag,
        onClick: () => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          onOpen();
        }
      },
      /* @__PURE__ */ React.createElement(CommentIcon, null),
      /* @__PURE__ */ React.createElement("span", { className: "wf-review-launcher-count", "aria-hidden": "true" }, count)
    );
  }

  // starter/framework/lib/board/before-unload.js
  var UNSAVED_REVIEW_MESSAGE = "\u4FEE\u6539\u5185\u5BB9\u5C1A\u672A\u4FDD\u5B58\uFF0C\u79BB\u5F00\u9875\u9762\u540E\u4F1A\u4E22\u5931\u3002\u662F\u5426\u7EE7\u7EED\uFF1F";
  function preventUnsavedReviewExit(event) {
    event.preventDefault();
    event.returnValue = UNSAVED_REVIEW_MESSAGE;
    return UNSAVED_REVIEW_MESSAGE;
  }

  // starter/framework/lib/board/annotations.js
  var ANNOTATION_SCHEMA_VERSION = 1;
  var UNSAVED_ANNOTATION_MESSAGE = "\u6CE8\u91CA\u8349\u7A3F\u672A\u80FD\u4FDD\u5B58\u5728\u6D4F\u89C8\u5668\u4E2D\uFF0C\u79BB\u5F00\u9875\u9762\u540E\u4F1A\u4E22\u5931\u3002\u662F\u5426\u7EE7\u7EED\uFF1F";
  var STORAGE_PREFIX = "wf-annotations:v1:";
  function slug2(value) {
    return String(value || "wireframe").trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-+|-+$/g, "") || "wireframe";
  }
  function annotationProjectId(project2) {
    return String((project2 == null ? void 0 : project2.id) || slug2(project2 == null ? void 0 : project2.name));
  }
  function annotationBaseRevision(project2) {
    return String((project2 == null ? void 0 : project2.annotationsRevision) || "annotations-empty");
  }
  function annotationStorageKey(project2) {
    return `${STORAGE_PREFIX}${annotationProjectId(project2)}`;
  }
  function getAnnotationStorage() {
    try {
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  function preventUnsavedAnnotationExit(event) {
    event.preventDefault();
    event.returnValue = UNSAVED_ANNOTATION_MESSAGE;
    return UNSAVED_ANNOTATION_MESSAGE;
  }
  function normalizeAnchor(anchor) {
    if ((anchor == null ? void 0 : anchor.kind) === "node" && anchor.selector) {
      const fallback = anchor.fallbackPosition;
      return {
        kind: "node",
        selector: String(anchor.selector),
        ...fallback && Number.isFinite(fallback.x) && Number.isFinite(fallback.y) ? { fallbackPosition: {
          x: Math.max(0, Math.min(1, Number(fallback.x))),
          y: Math.max(0, Math.min(1, Number(fallback.y)))
        } } : {}
      };
    }
    return { kind: "screen" };
  }
  function normalizeAnnotation(annotation) {
    if (!(annotation == null ? void 0 : annotation.id) || !(annotation == null ? void 0 : annotation.screenId) || !String(annotation.content || "").trim()) return null;
    const createdAt = annotation.createdAt || (/* @__PURE__ */ new Date()).toISOString();
    return {
      id: String(annotation.id),
      screenId: String(annotation.screenId),
      screenTitle: String(annotation.screenTitle || annotation.screenId),
      anchor: normalizeAnchor(annotation.anchor),
      content: String(annotation.content).trim(),
      createdAt: String(createdAt),
      updatedAt: String(annotation.updatedAt || createdAt)
    };
  }
  function baseAnnotations(project2) {
    if (!Array.isArray(project2 == null ? void 0 : project2.annotations)) return [];
    return project2.annotations.map(normalizeAnnotation).filter(Boolean);
  }
  function annotationEqual(left, right) {
    return JSON.stringify(normalizeAnnotation(left)) === JSON.stringify(normalizeAnnotation(right));
  }
  function applyAnnotationOperations(base, operations) {
    const byId = new Map((base || []).map((item) => {
      const normalized = normalizeAnnotation(item);
      return normalized ? [normalized.id, normalized] : null;
    }).filter(Boolean));
    for (const operation of operations || []) {
      if ((operation == null ? void 0 : operation.op) === "delete" && operation.id) {
        byId.delete(String(operation.id));
        continue;
      }
      if ((operation == null ? void 0 : operation.op) === "upsert") {
        const annotation = normalizeAnnotation(operation.annotation);
        if (annotation) byId.set(annotation.id, annotation);
      }
    }
    return [...byId.values()].sort((left, right) => {
      const time = left.createdAt.localeCompare(right.createdAt);
      return time || left.id.localeCompare(right.id);
    });
  }
  function reconcileAnnotationOperations(base, operations) {
    const baseById = new Map((base || []).map((item) => [item.id, normalizeAnnotation(item)]));
    const latest = /* @__PURE__ */ new Map();
    for (const operation of operations || []) {
      if ((operation == null ? void 0 : operation.op) === "delete" && operation.id) {
        latest.set(String(operation.id), { op: "delete", id: String(operation.id) });
        continue;
      }
      if ((operation == null ? void 0 : operation.op) === "upsert") {
        const annotation = normalizeAnnotation(operation.annotation);
        if (annotation) latest.set(annotation.id, { op: "upsert", annotation });
      }
    }
    return [...latest.values()].filter((operation) => {
      const baseItem = baseById.get(operation.op === "delete" ? operation.id : operation.annotation.id);
      if (operation.op === "delete") return !!baseItem;
      return !baseItem || !annotationEqual(baseItem, operation.annotation);
    });
  }
  function upsertAnnotationOperation(base, operations, annotation) {
    const normalized = normalizeAnnotation(annotation);
    if (!normalized) return reconcileAnnotationOperations(base, operations);
    return reconcileAnnotationOperations(base, [
      ...(operations || []).filter((operation) => {
        var _a;
        const id = operation.op === "delete" ? operation.id : (_a = operation.annotation) == null ? void 0 : _a.id;
        return id !== normalized.id;
      }),
      { op: "upsert", annotation: normalized }
    ]);
  }
  function deleteAnnotationOperation(base, operations, id) {
    const normalizedId = String(id);
    const baseHasItem = (base || []).some((item) => item.id === normalizedId);
    const next = (operations || []).filter((operation) => {
      var _a;
      const operationId = operation.op === "delete" ? operation.id : (_a = operation.annotation) == null ? void 0 : _a.id;
      return operationId !== normalizedId;
    });
    if (baseHasItem) next.push({ op: "delete", id: normalizedId });
    return reconcileAnnotationOperations(base, next);
  }
  function readAnnotationDraft(storage, project2) {
    const empty = {
      schemaVersion: ANNOTATION_SCHEMA_VERSION,
      projectId: annotationProjectId(project2),
      baseRevision: annotationBaseRevision(project2),
      operations: []
    };
    if (!(storage == null ? void 0 : storage.getItem)) return empty;
    try {
      const parsed = JSON.parse(storage.getItem(annotationStorageKey(project2)) || "null");
      if (!parsed || parsed.schemaVersion !== ANNOTATION_SCHEMA_VERSION) return empty;
      if (parsed.projectId !== empty.projectId || !Array.isArray(parsed.operations)) return empty;
      return {
        ...empty,
        baseRevision: String(parsed.baseRevision || empty.baseRevision),
        operations: reconcileAnnotationOperations(baseAnnotations(project2), parsed.operations)
      };
    } catch (e) {
      return empty;
    }
  }
  function saveAnnotationDraft(storage, project2, operations) {
    if (!(storage == null ? void 0 : storage.setItem) || !(storage == null ? void 0 : storage.removeItem)) return false;
    const key = annotationStorageKey(project2);
    try {
      if (!(operations == null ? void 0 : operations.length)) {
        storage.removeItem(key);
        return true;
      }
      storage.setItem(key, JSON.stringify({
        schemaVersion: ANNOTATION_SCHEMA_VERSION,
        projectId: annotationProjectId(project2),
        baseRevision: annotationBaseRevision(project2),
        operations
      }));
      return true;
    } catch (e) {
      return false;
    }
  }
  function createAnnotationExport(project2, annotations2, operations = []) {
    return {
      schemaVersion: ANNOTATION_SCHEMA_VERSION,
      projectId: annotationProjectId(project2),
      projectName: (project2 == null ? void 0 : project2.name) || "\u672A\u547D\u540D\u7EBF\u6846\u539F\u578B",
      baseRevision: annotationBaseRevision(project2),
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      annotations: (annotations2 || []).map(normalizeAnnotation).filter(Boolean),
      operations: reconcileAnnotationOperations(baseAnnotations(project2), operations)
    };
  }
  function parseAnnotationImport(value, project2) {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (!parsed || parsed.schemaVersion !== ANNOTATION_SCHEMA_VERSION) {
      throw new Error("\u4E0D\u652F\u6301\u7684\u6CE8\u91CA JSON \u7248\u672C");
    }
    if (parsed.projectId !== annotationProjectId(project2)) {
      throw new Error(`\u6CE8\u91CA JSON \u5C5E\u4E8E\u5176\u4ED6\u9879\u76EE\uFF1A${parsed.projectName || parsed.projectId}`);
    }
    if (!Array.isArray(parsed.annotations)) throw new Error("\u6CE8\u91CA JSON \u7F3A\u5C11 annotations \u6570\u7EC4");
    const annotations2 = parsed.annotations.map(normalizeAnnotation).filter(Boolean);
    if (annotations2.length !== parsed.annotations.length) throw new Error("\u6CE8\u91CA JSON \u5305\u542B\u65E0\u6548\u6CE8\u91CA");
    const operations = reconcileAnnotationOperations(
      baseAnnotations(project2),
      Array.isArray(parsed.operations) ? parsed.operations : []
    );
    return { ...parsed, annotations: annotations2, operations };
  }
  function buildAnnotationSyncPrompt(project2, operations) {
    const projectName = (project2 == null ? void 0 : project2.name) || "\u672A\u547D\u540D\u7EBF\u6846\u539F\u578B";
    const normalized = reconcileAnnotationOperations(baseAnnotations(project2), operations);
    const payload = {
      schemaVersion: ANNOTATION_SCHEMA_VERSION,
      projectId: annotationProjectId(project2),
      baseRevision: annotationBaseRevision(project2),
      operations: normalized
    };
    return [
      `\u8BF7\u628A\u7EBF\u6846\u539F\u578B\u300C${projectName}\u300D\u7684\u672C\u673A\u6CE8\u91CA\u540C\u6B65\u5230\u4E1A\u52A1\u6E90\u7801\u3002`,
      "",
      "\u540C\u6B65\u7EA6\u675F\uFF1A",
      "- \u53EA\u4FEE\u6539\u4E1A\u52A1 src/\uFF1B\u4E0D\u8981\u4FEE\u6539 framework/ \u6216 dist/app.js\u3002",
      "- \u6CE8\u91CA\u7684\u6B63\u5F0F\u6570\u636E\u6587\u4EF6\u662F src/annotations.js\uFF1B\u82E5\u4E0D\u5B58\u5728\u5219\u521B\u5EFA\u3002",
      "- src/annotations.js \u5BFC\u51FA annotationsRevision \u4E0E annotations\uFF0C\u5E76\u7531 src/project.js \u5BFC\u5165\u540E\u6302\u5230\u540C\u540D\u5B57\u6BB5\u3002",
      "- \u6309\u6CE8\u91CA id \u5E42\u7B49\u5408\u5E76\uFF1Aupsert \u65B0\u589E\u6216\u66FF\u6362\u540C id \u6CE8\u91CA\uFF0Cdelete \u5220\u9664\u540C id \u6CE8\u91CA\uFF1B\u4FDD\u7559\u672A\u6D89\u53CA\u7684\u6CE8\u91CA\u3002",
      "- \u66F4\u65B0 annotationsRevision \u4E3A\u65B0\u7684\u552F\u4E00\u503C\u3002\u4E0D\u8981\u628A\u6CE8\u91CA\u6587\u5B57\u5199\u8FDB screens/layouts JSX\u3002",
      "- \u5B8C\u6210\u540E\u91CD\u65B0\u6784\u5EFA\uFF0C\u5E76\u9A8C\u8BC1\u6CE8\u91CA\u6807\u8BB0\u3001\u9875\u9762/\u6A21\u5757\u5B9A\u4F4D\u53CA\u4FEE\u6539\u6A21\u5F0F\u3002",
      "",
      "\u5F85\u540C\u6B65\u64CD\u4F5C\uFF1A",
      "```json",
      JSON.stringify(payload, null, 2),
      "```"
    ].join("\n");
  }

  // starter/framework/lib/board/AnnotationPanel.jsx
  function copyText3(text) {
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
  function makeAnnotationId() {
    var _a;
    if ((_a = globalThis.crypto) == null ? void 0 : _a.randomUUID) return `note-${globalThis.crypto.randomUUID()}`;
    return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  function fallbackPosition(selection) {
    var _a, _b, _c, _d;
    const elementRect = (_b = (_a = selection == null ? void 0 : selection.element) == null ? void 0 : _a.getBoundingClientRect) == null ? void 0 : _b.call(_a);
    const rootRect = (_d = (_c = selection == null ? void 0 : selection.contentRoot) == null ? void 0 : _c.getBoundingClientRect) == null ? void 0 : _d.call(_c);
    if (!elementRect || !rootRect || !rootRect.width || !rootRect.height) return void 0;
    return {
      x: Math.max(0, Math.min(1, (elementRect.right - rootRect.left) / rootRect.width)),
      y: Math.max(0, Math.min(1, (elementRect.top - rootRect.top) / rootRect.height))
    };
  }
  function downloadJson(filename, value) {
    const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function AnnotationItem({ annotation, pending, onUpsert, onDelete }) {
    const [editing, setEditing] = React.useState(false);
    const [content, setContent] = React.useState(annotation.content);
    React.useEffect(() => setContent(annotation.content), [annotation.content]);
    const commit = () => {
      const normalized = content.trim();
      if (!normalized) return;
      onUpsert({ ...annotation, content: normalized, updatedAt: (/* @__PURE__ */ new Date()).toISOString() });
      setEditing(false);
    };
    return /* @__PURE__ */ React.createElement("li", { className: "wf-annotation-item" }, /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-item-meta" }, /* @__PURE__ */ React.createElement("strong", null, annotation.screenTitle), /* @__PURE__ */ React.createElement("span", null, annotation.anchor.kind === "node" ? "\u6A21\u5757\u6CE8\u91CA" : "\u9875\u9762\u6CE8\u91CA"), pending ? /* @__PURE__ */ React.createElement("span", { className: "wf-annotation-pending" }, "\u5F85\u540C\u6B65") : /* @__PURE__ */ React.createElement("span", null, "\u539F\u578B\u5185\u7F6E")), annotation.anchor.kind === "node" ? /* @__PURE__ */ React.createElement("code", { className: "wf-annotation-selector" }, annotation.anchor.selector) : null, editing ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "wf-annotation-edit",
        value: content,
        onChange: (event) => setContent(event.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-item-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: commit, disabled: !content.trim() }, "\u4FDD\u5B58"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      setContent(annotation.content);
      setEditing(false);
    } }, "\u53D6\u6D88"))) : /* @__PURE__ */ React.createElement("p", { className: "wf-annotation-content" }, annotation.content), !editing ? /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-item-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setEditing(true) }, "\u7F16\u8F91"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => onDelete(annotation.id) }, "\u5220\u9664")) : null);
  }
  function AnnotationPanel({
    project: project2,
    visible = true,
    selection,
    currentScreenId,
    annotations: annotations2,
    operations,
    storageSaved,
    onAdd,
    onUpsert,
    onDelete,
    onImport,
    onClearDraft,
    onClearSelection,
    onClose
  }) {
    var _a;
    const selectedScreenId = (selection == null ? void 0 : selection.screenId) || currentScreenId || ((_a = project2.screens[0]) == null ? void 0 : _a.id);
    const [scope, setScope] = React.useState(selection ? "node" : "screen");
    const [screenId, setScreenId] = React.useState(selectedScreenId);
    const [content, setContent] = React.useState("");
    const [filter, setFilter] = React.useState("current");
    const [message, setMessage] = React.useState("");
    const generatedPrompt = React.useMemo(
      () => buildAnnotationSyncPrompt(project2, operations),
      [operations, project2]
    );
    const [prompt, setPrompt] = React.useState(generatedPrompt);
    const [promptDirty, setPromptDirty] = React.useState(false);
    const [clearArmed, setClearArmed] = React.useState(false);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
      setScreenId(selectedScreenId);
      if (selection) setScope("node");
    }, [selectedScreenId, selection]);
    React.useEffect(() => {
      if (!promptDirty) setPrompt(generatedPrompt);
    }, [generatedPrompt, promptDirty]);
    React.useEffect(() => {
      if (!clearArmed) return void 0;
      const timer = window.setTimeout(() => setClearArmed(false), 5e3);
      return () => window.clearTimeout(timer);
    }, [clearArmed]);
    const activeScreen = project2.screens.find((screen) => screen.id === screenId) || project2.screens[0];
    const pendingIds = new Set((operations || []).map((operation) => {
      var _a2;
      return operation.op === "delete" ? operation.id : (_a2 = operation.annotation) == null ? void 0 : _a2.id;
    }));
    const visibleAnnotations = annotations2.filter((annotation) => {
      if (filter === "current") return annotation.screenId === selectedScreenId;
      return true;
    });
    const add = () => {
      const normalized = content.trim();
      if (!normalized || !activeScreen) return;
      const useNode = scope === "node" && selection;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      onAdd({
        id: makeAnnotationId(),
        screenId: useNode ? selection.screenId : activeScreen.id,
        screenTitle: useNode ? selection.screenTitle : activeScreen.title,
        anchor: useNode ? {
          kind: "node",
          selector: selection.selector,
          fallbackPosition: fallbackPosition(selection)
        } : { kind: "screen" },
        content: normalized,
        createdAt: now,
        updatedAt: now
      });
      setContent("");
      setMessage("\u6CE8\u91CA\u5DF2\u4FDD\u5B58\u5728\u672C\u673A\uFF0C\u7B49\u5F85\u540C\u6B65\u5230\u539F\u578B\u3002");
    };
    const exportReview = () => {
      const file = createAnnotationExport(project2, annotations2, operations);
      downloadJson(`${annotationProjectId(project2)}.wireframe-annotations.json`, file);
      setMessage(`\u5DF2\u5BFC\u51FA ${annotations2.length} \u6761\u6CE8\u91CA\u3002`);
    };
    const importReview = async (file) => {
      if (!file) return;
      try {
        const parsed = parseAnnotationImport(await file.text(), project2);
        onImport(parsed.annotations, parsed.operations);
        setMessage(`\u5DF2\u5BFC\u5165\u5E76\u5408\u5E76 ${parsed.annotations.length} \u6761\u6CE8\u91CA\u3002`);
      } catch (error) {
        setMessage((error == null ? void 0 : error.message) || "\u5BFC\u5165\u5931\u8D25\u3002");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    };
    return /* @__PURE__ */ React.createElement("aside", { className: "wf-review-panel wf-annotation-panel", "aria-label": "\u539F\u578B\u6CE8\u91CA", hidden: !visible }, /* @__PURE__ */ React.createElement("header", { className: "wf-review-panel-header" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-heading" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-panel-title" }, "\u539F\u578B\u6CE8\u91CA"), /* @__PURE__ */ React.createElement("span", { className: "wf-review-panel-count" }, annotations2.length, " \u6761\u6CE8\u91CA")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-close", onClick: onClose }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-body" }, /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u6DFB\u52A0\u6CE8\u91CA"), /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-scope", role: "group", "aria-label": "\u6CE8\u91CA\u8303\u56F4" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: scope === "screen" ? "is-active" : "",
        onClick: () => setScope("screen")
      },
      "\u9875\u9762"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: scope === "node" ? "is-active" : "",
        disabled: !selection,
        onClick: () => setScope("node")
      },
      "\u6240\u9009\u6A21\u5757"
    )), scope === "node" && selection ? /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-target" }, /* @__PURE__ */ React.createElement("span", null, selection.screenTitle), /* @__PURE__ */ React.createElement("code", null, selection.selector), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: onClearSelection }, "\u53D6\u6D88\u9009\u62E9")) : /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, "\u9875\u9762"), /* @__PURE__ */ React.createElement("select", { value: screenId, onChange: (event) => setScreenId(event.target.value) }, project2.screens.map((screen) => /* @__PURE__ */ React.createElement("option", { value: screen.id, key: screen.id }, screen.title, " \xB7 ", screen.id)))), /* @__PURE__ */ React.createElement("label", { className: "wf-review-field" }, /* @__PURE__ */ React.createElement("span", { className: "wf-review-field-label" }, "\u6CE8\u91CA\u5185\u5BB9"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: content,
        placeholder: scope === "node" ? "\u8BF4\u660E\u3001\u63D0\u95EE\u6216\u8BB0\u5F55\u8FD9\u4E2A\u6A21\u5757\u7684\u8BBE\u8BA1\u51B3\u7B56" : "\u8BF4\u660E\u3001\u63D0\u95EE\u6216\u8BB0\u5F55\u6574\u4E2A\u9875\u9762\u7684\u8BBE\u8BA1\u51B3\u7B56",
        onChange: (event) => setContent(event.target.value)
      }
    )), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-add", disabled: !content.trim(), onClick: add }, "\u6DFB\u52A0\u5E76\u4FDD\u5B58\u5230\u672C\u673A"), /* @__PURE__ */ React.createElement("p", { className: `wf-annotation-save-state${storageSaved ? "" : " is-error"}` }, storageSaved ? `${operations.length} \u6761\u672C\u673A\u53D8\u66F4\u5F85\u540C\u6B65` : "\u6D4F\u89C8\u5668\u65E0\u6CD5\u4FDD\u5B58\u672C\u673A\u8349\u7A3F\uFF0C\u8BF7\u5148\u5BFC\u51FA\u6CE8\u91CA JSON")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-section-title" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u6CE8\u91CA\u5217\u8868"), /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-filters" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: filter === "current" ? "is-active" : "", onClick: () => setFilter("current") }, "\u5F53\u524D\u9875"), /* @__PURE__ */ React.createElement("button", { type: "button", className: filter === "all" ? "is-active" : "", onClick: () => setFilter("all") }, "\u5168\u90E8"))), visibleAnnotations.length ? /* @__PURE__ */ React.createElement("ol", { className: "wf-annotation-items" }, visibleAnnotations.map((annotation) => /* @__PURE__ */ React.createElement(
      AnnotationItem,
      {
        annotation,
        pending: pendingIds.has(annotation.id),
        key: annotation.id,
        onUpsert,
        onDelete
      }
    ))) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u8FD9\u4E2A\u8303\u56F4\u8FD8\u6CA1\u6709\u6CE8\u91CA\u3002")), /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-section-title" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u540C\u6B65\u4E0E\u4EA4\u6362"), operations.length ? /* @__PURE__ */ React.createElement("button", { className: "wf-review-regenerate", type: "button", onClick: () => {
      setPrompt(generatedPrompt);
      setPromptDirty(false);
    } }, "\u91CD\u65B0\u751F\u6210") : null), operations.length ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u590D\u5236 Prompt \u7ED9 LLM\uFF0C\u5373\u53EF\u628A\u672C\u673A\u53D8\u66F4\u6B63\u5F0F\u5199\u5165\u539F\u578B\u6E90\u7801\u3002"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "wf-review-prompt wf-annotation-prompt",
        value: prompt,
        onChange: (event) => {
          setPrompt(event.target.value);
          setPromptDirty(true);
        }
      }
    ), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-copy", onClick: () => {
      copyText3(prompt).then(() => setMessage("\u540C\u6B65 Prompt \u5DF2\u590D\u5236\u3002"));
    } }, "\u590D\u5236\u540C\u6B65 Prompt")) : /* @__PURE__ */ React.createElement("p", { className: "wf-review-empty" }, "\u6240\u6709\u672C\u673A\u53D8\u66F4\u90FD\u5DF2\u5305\u542B\u5728\u539F\u578B\u5185\u7F6E\u6570\u636E\u4E2D\u3002"), /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-file-actions" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: exportReview }, "\u5BFC\u51FA\u6CE8\u91CA JSON"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      var _a2;
      return (_a2 = inputRef.current) == null ? void 0 : _a2.click();
    } }, "\u5BFC\u5165\u6CE8\u91CA JSON"), operations.length ? /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
      if (!clearArmed) {
        setClearArmed(true);
        setMessage("\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u6E05\u9664\uFF1B\u539F\u578B\u5185\u7F6E\u6CE8\u91CA\u4E0D\u4F1A\u53D7\u5F71\u54CD\u3002");
        return;
      }
      onClearDraft();
      setClearArmed(false);
      setMessage("\u672C\u673A\u8349\u7A3F\u5DF2\u6E05\u9664\u3002");
    } }, clearArmed ? "\u786E\u8BA4\u6E05\u9664\u672C\u673A\u8349\u7A3F" : "\u6E05\u9664\u672C\u673A\u8349\u7A3F") : null), /* @__PURE__ */ React.createElement(
      "input",
      {
        ref: inputRef,
        className: "wf-annotation-file-input",
        type: "file",
        accept: "application/json,.json",
        onChange: (event) => {
          var _a2;
          return importReview((_a2 = event.target.files) == null ? void 0 : _a2[0]);
        }
      }
    ), message ? /* @__PURE__ */ React.createElement("p", { className: "wf-annotation-message", role: "status" }, message) : null)));
  }

  // starter/framework/lib/board/AnnotationMarkers.jsx
  function escapeAttribute(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }
  function intersectRect2(rect, clip) {
    const left = Math.max(rect.left, clip.left);
    const right = Math.min(rect.right, clip.right);
    const top = Math.max(rect.top, clip.top);
    const bottom = Math.min(rect.bottom, clip.bottom);
    if (right <= left || bottom <= top) return null;
    return { left, right, top, bottom };
  }
  function annotationPosition(board, annotation, previous) {
    var _a, _b, _c;
    const screen = board.querySelector(`[data-screen-id="${escapeAttribute(annotation.screenId)}"]`);
    const content = screen == null ? void 0 : screen.querySelector(".wf-screen-content");
    if (!content) return null;
    let element = content;
    if (((_a = annotation.anchor) == null ? void 0 : _a.kind) === "node") {
      try {
        element = board.querySelector(annotation.anchor.selector);
      } catch (e) {
        element = null;
      }
    }
    const boardRect = board.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();
    let baseLeft;
    let baseTop;
    let orphaned = false;
    if ((element == null ? void 0 : element.isConnected) && content.contains(element)) {
      const visible = intersectRect2(element.getBoundingClientRect(), contentRect);
      if (!visible) return null;
      baseLeft = visible.right - boardRect.left;
      baseTop = visible.top - boardRect.top;
    } else {
      const fallback = ((_b = annotation.anchor) == null ? void 0 : _b.fallbackPosition) || { x: 0.96, y: 0.04 };
      baseLeft = contentRect.left - boardRect.left + contentRect.width * fallback.x;
      baseTop = contentRect.top - boardRect.top + contentRect.height * fallback.y;
      orphaned = ((_c = annotation.anchor) == null ? void 0 : _c.kind) === "node";
    }
    const overlap = previous.filter(
      (item) => Math.abs(item.baseLeft - baseLeft) < 3 && Math.abs(item.baseTop - baseTop) < 3
    ).length;
    return {
      key: annotation.id,
      annotation,
      baseLeft: Math.round(baseLeft),
      baseTop: Math.round(baseTop),
      left: Math.round(baseLeft + overlap * 15),
      top: Math.round(baseTop),
      orphaned
    };
  }
  function resolvePositions2(board, annotations2) {
    if (!board) return [];
    const positions = [];
    for (const annotation of annotations2) {
      const position = annotationPosition(board, annotation, positions);
      if (position) positions.push(position);
    }
    return positions;
  }
  function samePositions2(left, right) {
    if (left.length !== right.length) return false;
    return left.every((item, index) => {
      const other = right[index];
      return item.key === other.key && item.annotation === other.annotation && item.left === other.left && item.top === other.top && item.orphaned === other.orphaned;
    });
  }
  function AnnotationMarkers({ boardRef, annotations: annotations2, onOpenPanel }) {
    var _a, _b;
    const [positions, setPositions] = React.useState([]);
    const [activeKey, setActiveKey] = React.useState(null);
    const frameRef = React.useRef(null);
    const refresh = React.useCallback(() => {
      const next = resolvePositions2(boardRef.current, annotations2);
      setPositions((current) => samePositions2(current, next) ? current : next);
    }, [annotations2, boardRef]);
    const scheduleRefresh = React.useCallback(() => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        refresh();
      });
    }, [refresh]);
    React.useLayoutEffect(() => {
      refresh();
    }, [refresh]);
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
    const bubbleTop = active ? Math.max(12, Math.min(active.top + 24, boardHeight - 196)) : 0;
    return /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-markers", "aria-label": "\u6CE8\u91CA\u6807\u8BB0" }, positions.map((position, index) => /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `wf-annotation-marker${activeKey === position.key ? " is-active" : ""}${position.orphaned ? " is-orphaned" : ""}`,
        key: position.key,
        "aria-label": `\u6CE8\u91CA ${index + 1}\uFF1A${position.annotation.content}`,
        style: { left: position.left, top: position.top },
        onClick: (event) => {
          event.preventDefault();
          event.stopPropagation();
          setActiveKey((current) => current === position.key ? null : position.key);
        }
      },
      index + 1
    )), active ? /* @__PURE__ */ React.createElement(
      "aside",
      {
        className: "wf-annotation-marker-popover",
        style: { left: bubbleLeft, top: bubbleTop },
        "aria-label": `\u6CE8\u91CA\uFF1A${active.annotation.screenTitle}`
      },
      /* @__PURE__ */ React.createElement("header", { className: "wf-review-marker-popover-header" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-marker-popover-title" }, active.annotation.screenTitle, " \xB7 ", active.annotation.anchor.kind === "node" ? "\u6A21\u5757" : "\u9875\u9762"), /* @__PURE__ */ React.createElement("button", { className: "wf-annotation-marker-close", type: "button", onClick: () => setActiveKey(null) }, "\u5173\u95ED")),
      active.orphaned ? /* @__PURE__ */ React.createElement("p", { className: "wf-annotation-orphaned" }, "\u539F\u5B9A\u4F4D\u5DF2\u5931\u6548\uFF0C\u5F53\u524D\u663E\u793A\u5907\u7528\u4F4D\u7F6E\u3002") : null,
      /* @__PURE__ */ React.createElement("p", { className: "wf-annotation-marker-content" }, active.annotation.content),
      /* @__PURE__ */ React.createElement("button", { className: "wf-annotation-marker-more", type: "button", onClick: () => {
        setActiveKey(null);
        onOpenPanel(active.annotation);
      } }, "\u67E5\u770B\u5168\u90E8")
    ) : null);
  }

  // starter/framework/lib/board/shortcuts.js
  var SHORTCUT_DEFINITIONS = [
    { id: "canvas", suffix: "1", label: "\u5207\u6362\u5230\u753B\u677F\u6A21\u5F0F" },
    { id: "demo", suffix: "2", label: "\u5207\u6362\u5230\u6F14\u793A\u6A21\u5F0F" },
    { id: "interaction", suffix: "I", label: "\u5207\u6362\u53EF\u4EA4\u4E92 / \u4E0D\u53EF\u4EA4\u4E92" },
    { id: "review", suffix: "M", label: "\u5F00\u542F\u6216\u5173\u95ED\u4FEE\u6539\u6A21\u5F0F" },
    { id: "immersive", suffix: "3", label: "\u5207\u6362\u6C89\u6D78\u6A21\u5F0F" },
    { id: "browser-fullscreen", suffix: "Shift+F", label: "\u5207\u6362\u6D4F\u89C8\u5668\u5168\u5C4F" },
    { id: "hotspots", suffix: "H", label: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A" },
    { id: "space", keys: "Space", label: "\u6309\u4F4F\u4E34\u65F6\u62D6\u52A8\u753B\u5E03" },
    { id: "escape", keys: "Esc", label: "\u5173\u95ED\u5F53\u524D\u9762\u677F\u6216\u9000\u51FA\u6A21\u5F0F" },
    { id: "help", keys: "?", label: "\u6253\u5F00\u6216\u5173\u95ED\u5E2E\u52A9 / \u5FEB\u6377\u952E" }
  ];
  function isMacPlatform() {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/i.test(`${navigator.platform || ""} ${navigator.userAgent || ""}`);
  }
  function shortcutModifierLabel(isMac = isMacPlatform()) {
    return isMac ? "Ctrl" : "Alt";
  }
  function getBoardShortcuts(isMac = isMacPlatform()) {
    const modifier = shortcutModifierLabel(isMac);
    return SHORTCUT_DEFINITIONS.map((shortcut) => shortcut.keys ? shortcut : { ...shortcut, keys: `${modifier}+${shortcut.suffix}` });
  }
  var BOARD_SHORTCUTS = getBoardShortcuts();
  function isEditableShortcutTarget(target) {
    var _a;
    if (!target) return false;
    const element = target.nodeType === 3 ? target.parentElement : target;
    if (!element) return false;
    const tag = element.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (element.isContentEditable) return true;
    return !!((_a = element.closest) == null ? void 0 : _a.call(element, '[contenteditable]:not([contenteditable="false"])'));
  }
  function shortcutIdForEvent(event, isMac = isMacPlatform()) {
    if (!event || event.repeat) return null;
    const key = String(event.key || "").toLowerCase();
    const modifier = isMac ? event.ctrlKey : event.altKey;
    if (!modifier) {
      if (!event.shiftKey && key === "escape") return "escape";
      if (event.key === "?") return "help";
      return null;
    }
    if (event.shiftKey) return key === "f" ? "browser-fullscreen" : null;
    if (key === "1") return "canvas";
    if (key === "2") return "demo";
    if (key === "i") return "interaction";
    if (key === "m") return "review";
    if (key === "3") return "immersive";
    if (key === "h") return "hotspots";
    return null;
  }

  // starter/framework/lib/board/BoardPanels.jsx
  function PanelShell({ id, title, ariaLabel, onClose, children }) {
    const closeRef = React.useRef(null);
    const returnFocusRef = React.useRef(null);
    React.useEffect(() => {
      var _a;
      returnFocusRef.current = document.activeElement;
      (_a = closeRef.current) == null ? void 0 : _a.focus();
      return () => {
        var _a2, _b;
        return (_b = (_a2 = returnFocusRef.current) == null ? void 0 : _a2.focus) == null ? void 0 : _b.call(_a2);
      };
    }, []);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "wf-board-panel-layer",
        onPointerDown: (event) => {
          if (event.target === event.currentTarget) onClose();
        }
      },
      /* @__PURE__ */ React.createElement("section", { id, className: "wf-board-panel", role: "dialog", "aria-modal": "true", "aria-label": ariaLabel }, /* @__PURE__ */ React.createElement("header", { className: "wf-board-panel-header" }, /* @__PURE__ */ React.createElement("strong", null, title), /* @__PURE__ */ React.createElement("button", { ref: closeRef, type: "button", className: "wf-board-panel-close", onClick: onClose, "aria-label": `\u5173\u95ED${title}` }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-board-panel-body" }, children))
    );
  }
  function ShortcutHelp({
    demoAvailable,
    showCanvasIndex,
    onShowCanvasIndexChange,
    showAnnotationMarkers,
    onShowAnnotationMarkersChange,
    trackpadZoom,
    onTrackpadZoomChange,
    zoomSensitivity,
    onZoomSensitivityChange,
    onClose
  }) {
    const shortcuts = getBoardShortcuts();
    return /* @__PURE__ */ React.createElement(PanelShell, { id: "wf-board-utility", title: "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E", ariaLabel: "\u5E2E\u52A9\u3001\u5FEB\u6377\u952E\u4E0E\u8BBE\u7F6E", onClose }, /* @__PURE__ */ React.createElement("dl", { className: "wf-shortcut-list" }, shortcuts.map((shortcut) => /* @__PURE__ */ React.createElement("div", { className: shortcut.id === "demo" && !demoAvailable ? "is-disabled" : "", key: shortcut.id }, /* @__PURE__ */ React.createElement("dt", null, /* @__PURE__ */ React.createElement("kbd", null, shortcut.keys)), /* @__PURE__ */ React.createElement("dd", null, shortcut.label, shortcut.id === "demo" && !demoAvailable ? "\uFF08\u5F53\u524D\u4E0D\u53EF\u7528\uFF09" : "")))), /* @__PURE__ */ React.createElement("p", { className: "wf-board-panel-note" }, "\u5728\u8F93\u5165\u6846\u3001\u6587\u672C\u57DF\u3001\u4E0B\u62C9\u6846\u548C\u53EF\u7F16\u8F91\u5185\u5BB9\u4E2D\u4E0D\u4F1A\u89E6\u53D1\u666E\u901A\u5FEB\u6377\u952E\u3002"), /* @__PURE__ */ React.createElement("section", { className: "wf-board-panel-section", "aria-labelledby": "wf-board-index-setting-title" }, /* @__PURE__ */ React.createElement("h2", { id: "wf-board-index-setting-title" }, "\u753B\u677F\u8BBE\u7F6E"), /* @__PURE__ */ React.createElement("label", { className: "wf-board-setting-row" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u663E\u793A\u753B\u677F\u7D22\u5F15"), /* @__PURE__ */ React.createElement("small", null, "\u5728\u753B\u677F\u4E0A\u663E\u793A\u53EF\u62D6\u62FD\u7684\u9875\u9762\u7D22\u5F15")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: showCanvasIndex,
        onChange: (event) => onShowCanvasIndexChange(event.target.checked)
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "wf-board-setting-row" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u9ED8\u8BA4\u663E\u793A\u6CE8\u91CA\u6807\u8BB0"), /* @__PURE__ */ React.createElement("small", null, "\u5173\u95ED\u540E\u4EC5\u5728\u8FDB\u5165\u6CE8\u91CA\u6A21\u5F0F\u65F6\u663E\u793A")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: showAnnotationMarkers,
        onChange: (event) => onShowAnnotationMarkersChange(event.target.checked)
      }
    )), /* @__PURE__ */ React.createElement("label", { className: "wf-board-setting-row" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u89E6\u6478\u677F\u7F29\u653E"), /* @__PURE__ */ React.createElement("small", null, "Mac \u9996\u6B21\u9ED8\u8BA4\u5F00\u542F\uFF1B\u6309\u53CC\u6307\u624B\u52BF\u5E45\u5EA6\u8FDE\u7EED\u7F29\u653E")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: trackpadZoom,
        onChange: (event) => onTrackpadZoomChange(event.target.checked)
      }
    )), /* @__PURE__ */ React.createElement("label", { className: `wf-board-setting-range${trackpadZoom ? "" : " is-disabled"}` }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u7F29\u653E\u7075\u654F\u5EA6"), /* @__PURE__ */ React.createElement("output", null, Math.round(zoomSensitivity * 100), "%")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "range",
        min: "0.25",
        max: "2",
        step: "0.05",
        value: zoomSensitivity,
        disabled: !trackpadZoom,
        onChange: (event) => onZoomSensitivityChange(Number(event.target.value)),
        "aria-label": "\u89E6\u6478\u677F\u7F29\u653E\u7075\u654F\u5EA6"
      }
    ), /* @__PURE__ */ React.createElement("small", null, /* @__PURE__ */ React.createElement("span", null, "\u66F4\u7EC6\u817B"), /* @__PURE__ */ React.createElement("span", null, "\u66F4\u7075\u654F")))));
  }

  // starter/framework/lib/board/board-settings.js
  var MIN_ZOOM_SENSITIVITY = 0.25;
  var MAX_ZOOM_SENSITIVITY = 2;
  var DEFAULT_ZOOM_SENSITIVITY = 0.6;
  function detectMacOS(navigatorLike = typeof navigator === "undefined" ? null : navigator) {
    var _a;
    const platform = ((_a = navigatorLike == null ? void 0 : navigatorLike.userAgentData) == null ? void 0 : _a.platform) || (navigatorLike == null ? void 0 : navigatorLike.platform) || "";
    if (/^mac/i.test(platform)) return true;
    return /Macintosh|Mac OS X/i.test((navigatorLike == null ? void 0 : navigatorLike.userAgent) || "");
  }
  function defaultSettings(navigatorLike) {
    return {
      showCanvasIndex: true,
      showAnnotationMarkers: true,
      trackpadZoom: detectMacOS(navigatorLike),
      zoomSensitivity: DEFAULT_ZOOM_SENSITIVITY
    };
  }
  function normalizeZoomSensitivity(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_ZOOM_SENSITIVITY;
    return Math.min(MAX_ZOOM_SENSITIVITY, Math.max(MIN_ZOOM_SENSITIVITY, number));
  }
  function getBoardStorage() {
    try {
      return typeof window === "undefined" ? null : window.localStorage;
    } catch (e) {
      return null;
    }
  }
  function boardSettingsStorageKey(projectName) {
    return `wf-board-settings:${projectName}`;
  }
  function readBoardSettings(storage, projectName, navigatorLike = typeof navigator === "undefined" ? null : navigator) {
    const defaults = defaultSettings(navigatorLike);
    try {
      const parsed = JSON.parse(storage == null ? void 0 : storage.getItem(boardSettingsStorageKey(projectName)));
      if (parsed && typeof parsed === "object") {
        return {
          showCanvasIndex: parsed.showCanvasIndex !== false,
          showAnnotationMarkers: parsed.showAnnotationMarkers !== false,
          trackpadZoom: typeof parsed.trackpadZoom === "boolean" ? parsed.trackpadZoom : defaults.trackpadZoom,
          zoomSensitivity: normalizeZoomSensitivity(parsed.zoomSensitivity)
        };
      }
    } catch (e) {
    }
    return defaults;
  }
  function saveBoardSettings(storage, projectName, settings) {
    const normalized = {
      showCanvasIndex: settings.showCanvasIndex !== false,
      showAnnotationMarkers: settings.showAnnotationMarkers !== false,
      trackpadZoom: settings.trackpadZoom === true,
      zoomSensitivity: normalizeZoomSensitivity(settings.zoomSensitivity)
    };
    try {
      storage == null ? void 0 : storage.setItem(boardSettingsStorageKey(projectName), JSON.stringify(normalized));
      return true;
    } catch (e) {
      return false;
    }
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
      edit: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 20h9" }), /* @__PURE__ */ React.createElement("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })),
      comment: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" }), /* @__PURE__ */ React.createElement("path", { d: "M8 9h8M8 13h5" })),
      fullscreen: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }), /* @__PURE__ */ React.createElement("path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }), /* @__PURE__ */ React.createElement("path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }), /* @__PURE__ */ React.createElement("path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" })),
      expand: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m7 15 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "m7 9 5-5 5 5" })),
      collapse: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "m7 20 5-5 5 5" }), /* @__PURE__ */ React.createElement("path", { d: "m7 4 5 5 5-5" })),
      toolbarExpand: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M5 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "m15 18-6-6 6-6" })),
      toolbarCollapse: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M19 5v14" }), /* @__PURE__ */ React.createElement("path", { d: "m9 18 6-6-6-6" })),
      download: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("path", { d: "M12 3v12" }), /* @__PURE__ */ React.createElement("path", { d: "m7 10 5 5 5-5" }), /* @__PURE__ */ React.createElement("path", { d: "M5 21h14" })),
      settings: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.37.52.7 1 .9.32.13.68.2 1.1.2h.09v4h-.09a1.7 1.7 0 0 0-2.1.9Z" })),
      help: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React.createElement("path", { d: "M9.7 9a2.4 2.4 0 1 1 3.7 2c-.9.6-1.4 1.1-1.4 2" }), /* @__PURE__ */ React.createElement("path", { d: "M12 17h.01" }))
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
    const shortcutModifier = shortcutModifierLabel();
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: interactive ? "wf-interaction-lock" : "wf-interaction-lock is-locked",
        onClick: onToggle,
        "aria-pressed": !interactive,
        title: interactive ? `\u5F53\u524D\u53EF\u4EA4\u4E92\u9875\u9762\u3002\u70B9\u51FB\u9501\u4F4F\u540E\uFF1A\u62D6\u62FD\u5E73\u79FB\u753B\u5E03\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF1B\u5FEB\u6377\u952E ${shortcutModifier}+I` : `\u5F53\u524D\u5DF2\u9501\u4F4F\u3002\u70B9\u51FB\u6062\u590D\u53EF\u4EA4\u4E92\uFF1B\u5FEB\u6377\u952E ${shortcutModifier}+I`
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
    const shortcutModifier = shortcutModifierLabel();
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
    const [immersiveToolbarExpanded, setImmersiveToolbarExpanded] = React.useState(true);
    const [browserFullscreen, setBrowserFullscreen] = React.useState(false);
    const [reviewEnabled, setReviewEnabled] = React.useState(false);
    const [reviewTool, setReviewTool] = React.useState("modify");
    const [reviewPanelVisible, setReviewPanelVisible] = React.useState(false);
    const [reviewSelections, setReviewSelections] = React.useState([]);
    const [reviewMultiSelect, setReviewMultiSelect] = React.useState(false);
    const [reviewItems, setReviewItems] = React.useState([]);
    const annotationBase = React.useMemo(() => baseAnnotations(project2), [project2]);
    const [annotationOperations, setAnnotationOperations] = React.useState(
      () => readAnnotationDraft(getAnnotationStorage(), project2).operations
    );
    const [annotationStorageSaved, setAnnotationStorageSaved] = React.useState(true);
    const [helpVisible, setHelpVisible] = React.useState(false);
    const [canvasIndexVisible, setCanvasIndexVisible] = React.useState(
      () => readBoardSettings(getBoardStorage(), project2.name).showCanvasIndex
    );
    const [showAnnotationMarkers, setShowAnnotationMarkers] = React.useState(
      () => readBoardSettings(getBoardStorage(), project2.name).showAnnotationMarkers
    );
    const [trackpadZoom, setTrackpadZoom] = React.useState(
      () => readBoardSettings(getBoardStorage(), project2.name).trackpadZoom
    );
    const [zoomSensitivity, setZoomSensitivity] = React.useState(
      () => readBoardSettings(getBoardStorage(), project2.name).zoomSensitivity
    );
    const [canvasIndexPosition, setCanvasIndexPosition] = React.useState(null);
    const boardRef = React.useRef(null);
    const selectedReviewElementsRef = React.useRef(/* @__PURE__ */ new Set());
    const breadcrumbHoverElementRef = React.useRef(null);
    const canvasLocked = !interactive || spaceHeld;
    const allScreenIds = project2.screens.map((screen) => screen.id);
    const isDemo = mode === "demo" && demoAvailable;
    const activeScale = isDemo ? demoScale : canvasScale;
    const setActiveScale = isDemo ? setDemoScale : setCanvasScale;
    const wheelZoomOptions = { trackpadMode: trackpadZoom, sensitivity: zoomSensitivity };
    const annotations2 = React.useMemo(
      () => applyAnnotationOperations(annotationBase, annotationOperations),
      [annotationBase, annotationOperations]
    );
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
      const additive = reviewTool === "modify" && (reviewMultiSelect || options.additive);
      setReviewPanelVisible(true);
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
    }, [project2.screens, reviewMultiSelect, reviewSelections, reviewTool]);
    const removeReviewSelection = React.useCallback((element) => {
      element == null ? void 0 : element.classList.remove("is-review-selected");
      selectedReviewElementsRef.current.delete(element);
      setReviewSelections((current) => current.filter((item) => item.element !== element));
    }, []);
    const closeReview = React.useCallback(() => {
      var _a;
      setReviewEnabled(false);
      setReviewPanelVisible(false);
      (_a = breadcrumbHoverElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
      breadcrumbHoverElementRef.current = null;
      clearReviewSelection();
    }, [clearReviewSelection]);
    const hoverReviewBreadcrumb = React.useCallback((element) => {
      var _a, _b;
      (_a = breadcrumbHoverElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
      breadcrumbHoverElementRef.current = element || null;
      (_b = breadcrumbHoverElementRef.current) == null ? void 0 : _b.classList.add("is-review-hovered");
    }, []);
    const toggleReview = React.useCallback((tool = "modify") => {
      if (reviewEnabled && reviewTool === tool) {
        closeReview();
        return;
      }
      setInteractive(true);
      setReviewMultiSelect(false);
      setReviewTool(tool);
      setReviewPanelVisible(tool === "annotation");
      setReviewEnabled(true);
    }, [closeReview, reviewEnabled, reviewTool]);
    const openReviewPanel = () => {
      setInteractive(true);
      setReviewTool("modify");
      setReviewEnabled(true);
      setReviewPanelVisible(true);
    };
    const openAnnotationPanel = (annotation) => {
      setInteractive(true);
      setReviewTool("annotation");
      setReviewEnabled(true);
      setReviewPanelVisible(true);
      if (annotation == null ? void 0 : annotation.screenId) selectEntry(annotation.screenId);
    };
    const closeReviewPanel = React.useCallback(() => {
      setReviewPanelVisible(false);
      hoverReviewBreadcrumb(null);
    }, [hoverReviewBreadcrumb]);
    const addReviewItem = (item) => {
      setReviewItems((current) => [
        ...current,
        { ...item, id: `review-${Date.now()}-${current.length + 1}` }
      ]);
    };
    const removeReviewItem = (id) => {
      setReviewItems((current) => current.filter((item) => item.id !== id));
    };
    const upsertAnnotation = React.useCallback((annotation) => {
      setAnnotationOperations((current) => upsertAnnotationOperation(annotationBase, current, annotation));
    }, [annotationBase]);
    const deleteAnnotation = React.useCallback((id) => {
      setAnnotationOperations((current) => deleteAnnotationOperation(annotationBase, current, id));
    }, [annotationBase]);
    const importAnnotations = React.useCallback((incoming, importedOperations = []) => {
      setAnnotationOperations((current) => {
        let next = incoming.reduce(
          (operations, annotation) => upsertAnnotationOperation(annotationBase, operations, annotation),
          current
        );
        for (const operation of importedOperations) {
          if (operation.op === "delete") {
            next = deleteAnnotationOperation(annotationBase, next, operation.id);
          } else if (operation.op === "upsert") {
            next = upsertAnnotationOperation(annotationBase, next, operation.annotation);
          }
        }
        return next;
      });
    }, [annotationBase]);
    const clearAnnotationDraft = React.useCallback(() => setAnnotationOperations([]), []);
    React.useEffect(() => () => {
      var _a;
      for (const element of selectedReviewElementsRef.current) {
        element.classList.remove("is-review-selected");
      }
      (_a = breadcrumbHoverElementRef.current) == null ? void 0 : _a.classList.remove("is-review-hovered");
    }, []);
    React.useEffect(() => {
      if (!reviewEnabled) return;
      clearReviewSelection();
      hoverReviewBreadcrumb(null);
      setReviewPanelVisible(false);
    }, [clearReviewSelection, hoverReviewBreadcrumb, mode, viewportKey]);
    React.useEffect(() => {
      if (reviewItems.length === 0) return void 0;
      window.addEventListener("beforeunload", preventUnsavedReviewExit);
      return () => window.removeEventListener("beforeunload", preventUnsavedReviewExit);
    }, [reviewItems.length]);
    React.useEffect(() => {
      const draft = readAnnotationDraft(getAnnotationStorage(), project2);
      setAnnotationOperations(draft.operations);
    }, [project2]);
    React.useEffect(() => {
      setAnnotationStorageSaved(saveAnnotationDraft(
        getAnnotationStorage(),
        project2,
        annotationOperations
      ));
    }, [annotationOperations, project2]);
    React.useEffect(() => {
      if (!annotationOperations.length || annotationStorageSaved) return void 0;
      window.addEventListener("beforeunload", preventUnsavedAnnotationExit);
      return () => window.removeEventListener("beforeunload", preventUnsavedAnnotationExit);
    }, [annotationOperations.length, annotationStorageSaved]);
    const exitImmersive = React.useCallback(() => {
      setImmersive(false);
      setImmersiveToolbarExpanded(true);
      exitBoardFullscreen();
    }, []);
    const enterImmersive = React.useCallback(() => {
      closeReview();
      setHelpVisible(false);
      setImmersiveToolbarExpanded(true);
      setImmersive(true);
    }, [closeReview]);
    const toggleImmersive = React.useCallback(() => {
      if (immersive) exitImmersive();
      else enterImmersive();
    }, [enterImmersive, exitImmersive, immersive]);
    const toggleBrowserFullscreen = React.useCallback(() => {
      if (getFullscreenElement()) {
        exitBoardFullscreen();
        return;
      }
      closeReview();
      setHelpVisible(false);
      setImmersiveToolbarExpanded(true);
      setImmersive(true);
      requestBoardFullscreen(boardRef.current);
    }, [closeReview]);
    const updateCanvasIndexVisible = React.useCallback((visible) => {
      setCanvasIndexVisible(visible);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: visible,
        showAnnotationMarkers,
        trackpadZoom,
        zoomSensitivity
      });
    }, [project2.name, showAnnotationMarkers, trackpadZoom, zoomSensitivity]);
    const updateShowAnnotationMarkers = React.useCallback((visible) => {
      setShowAnnotationMarkers(visible);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: canvasIndexVisible,
        showAnnotationMarkers: visible,
        trackpadZoom,
        zoomSensitivity
      });
    }, [canvasIndexVisible, project2.name, trackpadZoom, zoomSensitivity]);
    const updateTrackpadZoom = React.useCallback((enabled) => {
      setTrackpadZoom(enabled);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: canvasIndexVisible,
        showAnnotationMarkers,
        trackpadZoom: enabled,
        zoomSensitivity
      });
    }, [canvasIndexVisible, project2.name, showAnnotationMarkers, zoomSensitivity]);
    const updateZoomSensitivity = React.useCallback((value) => {
      const normalized = normalizeZoomSensitivity(value);
      setZoomSensitivity(normalized);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: canvasIndexVisible,
        showAnnotationMarkers,
        trackpadZoom,
        zoomSensitivity: normalized
      });
    }, [canvasIndexVisible, project2.name, showAnnotationMarkers, trackpadZoom]);
    const canvasIndexSettingsProjectRef = React.useRef(null);
    React.useEffect(() => {
      const settings = readBoardSettings(getBoardStorage(), project2.name);
      setCanvasIndexVisible(settings.showCanvasIndex);
      setShowAnnotationMarkers(settings.showAnnotationMarkers);
      setTrackpadZoom(settings.trackpadZoom);
      setZoomSensitivity(settings.zoomSensitivity);
      const previousName = canvasIndexSettingsProjectRef.current;
      canvasIndexSettingsProjectRef.current = project2.name;
      if (previousName != null && previousName !== project2.name) {
        setCanvasIndexPosition(null);
      }
    }, [project2.name]);
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
        if (event.code === "Space" && !event.repeat && !isEditableShortcutTarget(event.target)) {
          event.preventDefault();
          setSpaceHeld(true);
          return;
        }
        const shortcut = shortcutIdForEvent(event);
        if (!shortcut) return;
        if (shortcut !== "escape" && isEditableShortcutTarget(event.target)) return;
        if (shortcut === "demo" && !demoAvailable) return;
        if (shortcut === "hotspots" && !isDemo) return;
        if (shortcut === "escape" && getFullscreenElement()) return;
        event.preventDefault();
        if (shortcut === "canvas") setMode("canvas");
        if (shortcut === "demo") setMode("demo");
        if (shortcut === "interaction") setInteractive((value) => !value);
        if (shortcut === "review") toggleReview();
        if (shortcut === "immersive") toggleImmersive();
        if (shortcut === "browser-fullscreen") toggleBrowserFullscreen();
        if (shortcut === "hotspots") setHotspotsVisible((value) => !value);
        if (shortcut === "help") {
          setHelpVisible((value) => !value);
        }
        if (shortcut === "escape") {
          if (helpVisible) setHelpVisible(false);
          else if (reviewEnabled) closeReview();
          else if (immersive) exitImmersive();
        }
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
    }, [
      closeReview,
      demoAvailable,
      exitImmersive,
      helpVisible,
      immersive,
      isDemo,
      reviewEnabled,
      setMode,
      toggleBrowserFullscreen,
      toggleImmersive,
      toggleReview
    ]);
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
          onClick: () => setMode("canvas"),
          title: `\u753B\u677F\u6A21\u5F0F\uFF08${shortcutModifier}+1\uFF09`
        },
        "\u753B\u677F"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: mode === "demo" ? "is-active" : "",
          onClick: () => setMode("demo"),
          title: `\u6F14\u793A\u6A21\u5F0F\uFF08${shortcutModifier}+2\uFF09`
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
          onClick: () => setHotspotsVisible((value) => !value),
          title: `\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08${shortcutModifier}+H\uFF09`
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
          className: helpVisible ? "wf-toolbar-icon-button is-active" : "wf-toolbar-icon-button",
          "aria-label": "\u6253\u5F00\u5E2E\u52A9\u3001\u5FEB\u6377\u952E\u4E0E\u8BBE\u7F6E",
          "aria-expanded": helpVisible,
          "aria-controls": "wf-board-utility",
          title: "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E\uFF08?\uFF09",
          onClick: () => setHelpVisible((value) => !value)
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "help" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: reviewEnabled && reviewTool === "modify" ? "wf-toolbar-icon-button is-active" : "wf-toolbar-icon-button",
          "aria-pressed": reviewEnabled && reviewTool === "modify",
          "aria-label": reviewEnabled && reviewTool === "modify" ? "\u4FEE\u6539\u4E2D" : "\u4FEE\u6539",
          title: `\u4FEE\u6539\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt\uFF08${shortcutModifier}+M\uFF09`,
          onClick: () => toggleReview("modify")
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "edit" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u4FEE\u6539")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: reviewEnabled && reviewTool === "annotation" ? "wf-toolbar-icon-button is-active" : "wf-toolbar-icon-button",
          "aria-pressed": reviewEnabled && reviewTool === "annotation",
          "aria-label": reviewEnabled && reviewTool === "annotation" ? "\u6CE8\u91CA\u4E2D" : "\u6CE8\u91CA",
          title: "\u6CE8\u91CA\uFF1A\u7ED9\u9875\u9762\u6216\u6A21\u5757\u6DFB\u52A0\u53EF\u6301\u4E45\u5316\u8BF4\u660E",
          onClick: () => toggleReview("annotation")
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "comment" }),
        annotations2.length > 0 ? /* @__PURE__ */ React.createElement("span", { className: "wf-toolbar-icon-count" }, annotations2.length) : null,
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u6CE8\u91CA")
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: "wf-toolbar-icon-button",
          "aria-label": immersive ? "\u9000\u51FA\u6C89\u6D78\u6A21\u5F0F" : "\u8FDB\u5165\u6C89\u6D78\u6A21\u5F0F",
          title: `\u5207\u6362\u6C89\u6D78\u6A21\u5F0F\uFF08${shortcutModifier}+3\uFF09`,
          onClick: toggleImmersive
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
      immersive ? /* @__PURE__ */ React.createElement(
        "div",
        {
          className: `wf-immersive-chrome${immersiveToolbarExpanded ? "" : " is-collapsed"}`,
          role: "toolbar",
          "aria-label": "\u6C89\u6D78\u63A7\u4EF6"
        },
        immersiveToolbarExpanded ? /* @__PURE__ */ React.createElement("div", { className: "wf-immersive-controls" }, /* @__PURE__ */ React.createElement(
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
            title: browserFullscreen ? `\u9000\u51FA\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08${shortcutModifier}+Shift+F\uFF09` : `\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08${shortcutModifier}+Shift+F\uFF09`,
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
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: helpVisible ? "wf-toolbar-icon-button wf-immersive-action-button is-active" : "wf-toolbar-icon-button wf-immersive-action-button",
            "aria-label": "\u6253\u5F00\u5E2E\u52A9\u3001\u5FEB\u6377\u952E\u4E0E\u8BBE\u7F6E",
            "aria-expanded": helpVisible,
            "aria-controls": "wf-board-utility",
            title: "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E\uFF08?\uFF09",
            onClick: () => setHelpVisible((value) => !value)
          },
          /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "help" })
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "wf-toolbar-icon-button wf-immersive-action-button",
            "aria-label": selectedIds.size > 0 ? "\u5C55\u5F00\u5DF2\u52FE\u9009\u7684\u5C4F" : "\u5C55\u5F00\u5168\u90E8\u5C4F",
            title: selectedIds.size > 0 ? "\u5C55\u5F00\u5DF2\u52FE\u9009\u7684\u5C4F\uFF1B\u65E0\u52FE\u9009\u65F6\u5C55\u5F00\u5168\u90E8" : "\u5C55\u5F00\u5168\u90E8\u5C4F",
            onClick: () => expandTargets(true)
          },
          /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "expand" })
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "wf-toolbar-icon-button wf-immersive-action-button",
            "aria-label": selectedIds.size > 0 ? "\u6536\u8D77\u5DF2\u52FE\u9009\u7684\u5C4F" : "\u6536\u8D77\u5168\u90E8\u5C4F",
            title: selectedIds.size > 0 ? "\u6536\u8D77\u5DF2\u52FE\u9009\u7684\u5C4F\uFF1B\u65E0\u52FE\u9009\u65F6\u6536\u8D77\u5168\u90E8" : "\u6536\u8D77\u5168\u90E8\u5C4F",
            onClick: () => expandTargets(false)
          },
          /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "collapse" })
        ), isDemo ? /* @__PURE__ */ React.createElement(React.Fragment, null, canGoBack ? /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-board-button", onClick: goBack }, "\u8FD4\u56DE") : null, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: hotspotsVisible ? "wf-board-button is-active" : "wf-board-button",
            onClick: () => setHotspotsVisible((value) => !value),
            title: `\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08${shortcutModifier}+H\uFF09`
          },
          hotspotsVisible ? "\u70ED\u533A ON" : "\u70ED\u533A OFF"
        )) : null) : null,
        /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            className: "wf-toolbar-icon-button wf-immersive-toolbar-toggle",
            "aria-expanded": immersiveToolbarExpanded,
            "aria-label": immersiveToolbarExpanded ? "\u6536\u8D77\u7CBE\u7B80\u5DE5\u5177\u680F" : "\u5C55\u5F00\u7CBE\u7B80\u5DE5\u5177\u680F",
            title: immersiveToolbarExpanded ? "\u6536\u8D77\u7CBE\u7B80\u5DE5\u5177\u680F" : "\u5C55\u5F00\u7CBE\u7B80\u5DE5\u5177\u680F",
            onClick: () => setImmersiveToolbarExpanded((value) => !value)
          },
          /* @__PURE__ */ React.createElement(ToolbarIcon, { name: immersiveToolbarExpanded ? "toolbarCollapse" : "toolbarExpand" })
        )
      ) : null,
      mode === "canvas" ? /* @__PURE__ */ React.createElement(
        CanvasMode,
        {
          project: project2,
          scale: canvasScale,
          setScale: setCanvasScale,
          canvasLocked,
          wheelZoomOptions,
          selectedIds,
          setSelectedIds,
          expandedIds,
          onToggleExpand: toggleExpand,
          onExportIds: exportIds,
          reviewEnabled,
          onReviewSelect: selectReviewElement,
          onCanvasClick: reviewPanelVisible ? closeReviewPanel : void 0,
          canvasIndexVisible,
          canvasIndexPosition,
          onCanvasIndexPositionChange: setCanvasIndexPosition,
          onCloseCanvasIndex: () => updateCanvasIndexVisible(false)
        }
      ) : /* @__PURE__ */ React.createElement(
        DemoMode,
        {
          project: project2,
          hotspotsVisible,
          canvasLocked,
          scale: demoScale,
          setScale: setDemoScale,
          wheelZoomOptions,
          viewResetKey: demoViewResetKey,
          expandedIds,
          onToggleExpand: toggleExpand,
          reviewEnabled,
          onReviewSelect: selectReviewElement,
          onCanvasClick: reviewPanelVisible ? closeReviewPanel : void 0
        }
      ),
      reviewEnabled && reviewTool === "modify" ? /* @__PURE__ */ React.createElement(ReviewMarkers, { boardRef, items: reviewItems, onOpenPanel: openReviewPanel }) : null,
      showAnnotationMarkers || reviewEnabled && reviewTool === "annotation" ? /* @__PURE__ */ React.createElement(
        AnnotationMarkers,
        {
          boardRef,
          annotations: annotations2,
          onOpenPanel: openAnnotationPanel
        }
      ) : null,
      /* @__PURE__ */ React.createElement(
        ReviewLauncher,
        {
          boardRef,
          count: reviewItems.length,
          projectName: project2.name,
          onOpen: openReviewPanel
        }
      ),
      helpVisible ? /* @__PURE__ */ React.createElement(
        ShortcutHelp,
        {
          demoAvailable,
          showCanvasIndex: canvasIndexVisible,
          onShowCanvasIndexChange: updateCanvasIndexVisible,
          showAnnotationMarkers,
          onShowAnnotationMarkersChange: updateShowAnnotationMarkers,
          trackpadZoom,
          onTrackpadZoomChange: updateTrackpadZoom,
          zoomSensitivity,
          onZoomSensitivityChange: updateZoomSensitivity,
          onClose: () => setHelpVisible(false)
        }
      ) : null,
      /* @__PURE__ */ React.createElement(
        ReviewPanel,
        {
          project: project2,
          visible: reviewPanelVisible && reviewEnabled && reviewTool === "modify",
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
          onHoverElement: hoverReviewBreadcrumb,
          onRemoveSelection: removeReviewSelection,
          onClearSelection: clearReviewSelection,
          onAddItem: addReviewItem,
          onRemoveItem: removeReviewItem,
          onClose: closeReview
        }
      ),
      /* @__PURE__ */ React.createElement(
        AnnotationPanel,
        {
          project: project2,
          visible: reviewPanelVisible && reviewEnabled && reviewTool === "annotation",
          selection: reviewSelections[reviewSelections.length - 1] || null,
          currentScreenId,
          annotations: annotations2,
          operations: annotationOperations,
          storageSaved: annotationStorageSaved,
          onAdd: upsertAnnotation,
          onUpsert: upsertAnnotation,
          onDelete: deleteAnnotation,
          onImport: importAnnotations,
          onClearDraft: clearAnnotationDraft,
          onClearSelection: clearReviewSelection,
          onClose: closeReview
        }
      )
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
    if (project2.annotations != null) {
      if (!Array.isArray(project2.annotations)) fail("project.annotations", "must be an array");
      if (typeof project2.annotationsRevision !== "string" || !project2.annotationsRevision) {
        fail("project.annotationsRevision", "must be a non-empty string when annotations are provided");
      }
      const annotationIds = /* @__PURE__ */ new Set();
      project2.annotations.forEach((annotation, index) => {
        const path = `project.annotations[${index}]`;
        if (!annotation || typeof annotation !== "object") fail(path, "must be an object");
        if (typeof annotation.id !== "string" || !annotation.id) fail(`${path}.id`, "must be a non-empty string");
        if (annotationIds.has(annotation.id)) fail(`${path}.id`, `is duplicate "${annotation.id}"`);
        annotationIds.add(annotation.id);
        if (!ids.has(annotation.screenId)) {
          fail(`${path}.screenId`, `references missing screen "${annotation.screenId}"`);
        }
        if (typeof annotation.content !== "string" || !annotation.content.trim()) {
          fail(`${path}.content`, "must be a non-empty string");
        }
        if (!annotation.anchor || !["screen", "node"].includes(annotation.anchor.kind)) {
          fail(`${path}.anchor.kind`, 'must be "screen" or "node"');
        }
        if (annotation.anchor.kind === "node" && !annotation.anchor.selector) {
          fail(`${path}.anchor.selector`, "must be provided for a node annotation");
        }
      });
    }
  }

  // demo/api-client/src/annotations.js
  var annotationsRevision = "annotations-r1";
  var annotations = [
    {
      id: "note-20656bb0-5480-4500-aca1-c789e92e39d0",
      screenId: "workspace",
      screenTitle: "\u5DE5\u4F5C\u533A",
      anchor: {
        kind: "screen"
      },
      content: "\u8FD9\u662F\u5DE5\u4F5C\u533A\u9996\u9875",
      status: "open",
      createdAt: "2026-08-11T03:20:04.506Z",
      updatedAt: "2026-08-11T03:20:04.506Z"
    }
  ];

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
  function useLayoutFlow(to, onClick, rest) {
    const flow = useFlowTarget(to, onClick);
    return {
      classNameSuffix: to ? " wf-interactive" : "",
      role: to ? "link" : rest.role,
      tabIndex: to && rest.tabIndex === void 0 ? 0 : rest.tabIndex,
      flow
    };
  }
  function Row({
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
      flexDirection: "row",
      gap,
      alignItems,
      justifyContent,
      ...style
    };
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: joinClass(`wf-row${classNameSuffix}`, className),
        role,
        tabIndex,
        style: mergedStyle,
        ...rest,
        ...flow
      },
      children
    );
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
  function Toggle({ checked = false, onChange, label, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        role: "switch",
        "aria-checked": checked,
        className: `wf-toggle ${className}`.trim(),
        onClick: (event) => onChange == null ? void 0 : onChange(!checked, event),
        ...rest
      },
      /* @__PURE__ */ React.createElement("span", { className: "wf-toggle-track" }, /* @__PURE__ */ React.createElement("span", { className: "wf-toggle-thumb" })),
      label ? /* @__PURE__ */ React.createElement("span", { className: "wf-toggle-label" }, label) : null
    );
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
  function DataTable({ columns = [], rows = [], getRowKey, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-table-wrap ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("table", { className: "wf-table" }, /* @__PURE__ */ React.createElement("thead", { className: "wf-table-head" }, /* @__PURE__ */ React.createElement("tr", { className: "wf-table-header-row" }, columns.map((column) => /* @__PURE__ */ React.createElement("th", { className: "wf-table-heading", "data-wf-key": column.key, key: column.key }, column.label)))), /* @__PURE__ */ React.createElement("tbody", { className: "wf-table-body" }, rows.map((row, index) => {
      const rowKey = getRowKey ? getRowKey(row) : row.id || index;
      return /* @__PURE__ */ React.createElement("tr", { className: "wf-table-row", "data-wf-key": rowKey, key: rowKey }, columns.map((column) => /* @__PURE__ */ React.createElement("td", { className: "wf-table-cell", "data-wf-key": column.key, key: column.key }, column.render ? column.render(row[column.key], row) : row[column.key])));
    }))));
  }
  function Tabs({ items = [], activeId, onChange, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-tabs ${className}`.trim(), role: "tablist", ...rest }, items.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "wf-tab-control",
        type: "button",
        role: "tab",
        "aria-selected": item.id === activeId,
        key: item.id,
        onClick: () => onChange == null ? void 0 : onChange(item.id)
      },
      item.label
    )));
  }

  // demo/api-client/src/layouts/AppShell.jsx
  var NAV_ITEMS = [
    { label: "\u5DE5\u4F5C\u533A", to: "workspace" },
    { label: "Collections", to: "collection" },
    { label: "\u73AF\u5883", to: "environments" },
    { label: "\u5386\u53F2", to: "history" },
    { label: "\u8BBE\u7F6E", to: "settings" }
  ];
  var ACTIVE_ALIAS = {
    "request-editor": "collection"
  };
  function AppShell({ children, aside }) {
    const screenId = useScreenId();
    const activeId = ACTIVE_ALIAS[screenId] || screenId;
    return /* @__PURE__ */ React.createElement(Row, { className: "postman-shell", style: { width: "100%", height: "100%", gap: 0 } }, /* @__PURE__ */ React.createElement(
      Column,
      {
        className: "postman-shell__rail",
        gap: 16,
        style: {
          width: 200,
          flexShrink: 0,
          padding: "20px 12px",
          borderRight: "1px solid var(--wf-300)",
          background: "var(--wf-50)"
        }
      },
      /* @__PURE__ */ React.createElement(Column, { className: "postman-shell__brand", gap: 4 }, /* @__PURE__ */ React.createElement("strong", { className: "postman-shell__brand-name", style: { fontSize: 15 } }, "API Client"), /* @__PURE__ */ React.createElement(Text, { className: "postman-shell__brand-meta", style: { fontSize: 12, color: "var(--wf-600)" } }, "Workspace \xB7 Demo")),
      /* @__PURE__ */ React.createElement(SideNav, { className: "postman-shell__nav", activeId, items: NAV_ITEMS })
    ), aside ? /* @__PURE__ */ React.createElement(
      Column,
      {
        className: "postman-shell__aside",
        gap: 12,
        style: {
          width: 260,
          flexShrink: 0,
          padding: "16px 12px",
          borderRight: "1px solid var(--wf-300)",
          overflow: "auto",
          background: "var(--wf-100)"
        }
      },
      aside
    ) : null, /* @__PURE__ */ React.createElement(
      Column,
      {
        className: "postman-shell__main",
        gap: 0,
        style: { flex: 1, minWidth: 0, overflow: "auto" }
      },
      children
    ));
  }

  // demo/api-client/src/screens/collection.jsx
  var FOLDERS = [
    {
      id: "folder-users",
      name: "Users",
      requests: [
        { id: "req-list-users", method: "GET", name: "List Users", path: "/v1/users" },
        { id: "req-get-user", method: "GET", name: "Get User", path: "/v1/users/:id" },
        { id: "req-update-user", method: "PATCH", name: "Update User", path: "/v1/users/:id" },
        { id: "req-disable-user", method: "POST", name: "Disable User", path: "/v1/users/:id/disable" }
      ]
    },
    {
      id: "folder-roles",
      name: "Roles",
      requests: [
        { id: "req-list-roles", method: "GET", name: "List Roles", path: "/v1/roles" },
        { id: "req-assign-role", method: "PUT", name: "Assign Role", path: "/v1/users/:id/roles" }
      ]
    },
    {
      id: "folder-audit",
      name: "Audit",
      requests: [
        { id: "req-audit-log", method: "GET", name: "Audit Log", path: "/v1/audit/logs" },
        { id: "req-export-audit", method: "POST", name: "Export Audit", path: "/v1/audit/export" }
      ]
    }
  ];
  function CollectionScreen() {
    return /* @__PURE__ */ React.createElement(
      AppShell,
      {
        aside: /* @__PURE__ */ React.createElement(Column, { id: "collection-tree", className: "collection__tree", gap: 14 }, /* @__PURE__ */ React.createElement(Row, { className: "collection__tree-head", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Heading, { className: "collection__tree-title", level: 3 }, "User API"), /* @__PURE__ */ React.createElement(Button, { className: "collection__tree-new", to: "request-editor" }, "+")), FOLDERS.map((folder) => /* @__PURE__ */ React.createElement(
          Column,
          {
            key: folder.id,
            className: "collection__folder",
            "data-wf-key": folder.id,
            gap: 6
          },
          /* @__PURE__ */ React.createElement(Text, { className: "collection__folder-name", style: { fontSize: 12, fontWeight: 600 } }, folder.name),
          folder.requests.map((req) => /* @__PURE__ */ React.createElement(
            Card,
            {
              key: req.id,
              className: "collection__request",
              "data-wf-key": req.id,
              to: "request-editor",
              style: { padding: "8px 10px" }
            },
            /* @__PURE__ */ React.createElement(Row, { className: "collection__request-row", alignItems: "center", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "collection__request-method" }, req.method), /* @__PURE__ */ React.createElement(Text, { className: "collection__request-name", style: { fontSize: 13 } }, req.name))
          ))
        )))
      },
      /* @__PURE__ */ React.createElement(Column, { id: "collection-page", className: "collection__page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(
        PageHeader,
        {
          id: "collection-header",
          titleId: "collection-title",
          className: "collection__header",
          title: "User API",
          subtitle: "Collection \xB7 3 \u4E2A\u6587\u4EF6\u5939 \xB7 8 \u4E2A\u8BF7\u6C42",
          actions: /* @__PURE__ */ React.createElement(Row, { className: "collection__header-actions", gap: 8 }, /* @__PURE__ */ React.createElement(Button, { className: "collection__action-run", to: "request-editor" }, "Run collection"), /* @__PURE__ */ React.createElement(Button, { className: "collection__action-new", to: "request-editor", variant: "primary" }, "\u65B0\u5EFA\u8BF7\u6C42"))
        }
      ), /* @__PURE__ */ React.createElement(Card, { id: "collection-meta", className: "collection__meta", style: { padding: 14 } }, /* @__PURE__ */ React.createElement(Row, { className: "collection__meta-row", gap: 24 }, /* @__PURE__ */ React.createElement(Column, { className: "collection__meta-item", gap: 4 }, /* @__PURE__ */ React.createElement(Text, { className: "collection__meta-label", style: { fontSize: 12 } }, "Base URL"), /* @__PURE__ */ React.createElement("strong", { className: "collection__meta-value" }, "{{baseUrl}}")), /* @__PURE__ */ React.createElement(Column, { className: "collection__meta-item", gap: 4 }, /* @__PURE__ */ React.createElement(Text, { className: "collection__meta-label", style: { fontSize: 12 } }, "\u6388\u6743"), /* @__PURE__ */ React.createElement("strong", { className: "collection__meta-value" }, "Bearer Token")), /* @__PURE__ */ React.createElement(Column, { className: "collection__meta-item", gap: 4 }, /* @__PURE__ */ React.createElement(Text, { className: "collection__meta-label", style: { fontSize: 12 } }, "\u66F4\u65B0"), /* @__PURE__ */ React.createElement("strong", { className: "collection__meta-value" }, "\u4ECA\u5929 10:24")))), /* @__PURE__ */ React.createElement(Column, { id: "collection-list", className: "collection__list", gap: 10 }, /* @__PURE__ */ React.createElement(Heading, { className: "collection__list-title", level: 3 }, "\u5168\u90E8\u8BF7\u6C42"), FOLDERS.flatMap(
        (folder) => folder.requests.map((req) => /* @__PURE__ */ React.createElement(
          Card,
          {
            key: req.id,
            className: "collection__list-item",
            "data-wf-key": `list-${req.id}`,
            to: "request-editor",
            style: { padding: 12 }
          },
          /* @__PURE__ */ React.createElement(Row, { className: "collection__list-row", alignItems: "center", gap: 12 }, /* @__PURE__ */ React.createElement(Badge, { className: "collection__list-method" }, req.method), /* @__PURE__ */ React.createElement(Column, { className: "collection__list-copy", gap: 2, style: { flex: 1 } }, /* @__PURE__ */ React.createElement("strong", { className: "collection__list-name" }, req.name), /* @__PURE__ */ React.createElement(Text, { className: "collection__list-path", style: { fontSize: 12 } }, folder.name, " \xB7 ", req.path)), /* @__PURE__ */ React.createElement(Button, { className: "collection__list-open", to: "request-editor" }, "\u6253\u5F00"))
        ))
      )))
    );
  }

  // demo/api-client/src/screens/environments.jsx
  var ENV_LIST = [
    { id: "env-staging", name: "Staging", active: true, vars: 6 },
    { id: "env-prod", name: "Production", active: false, vars: 6 },
    { id: "env-local", name: "Local", active: false, vars: 4 }
  ];
  var VAR_ROWS = [
    { id: "v-base", key: "baseUrl", initial: "https://api.staging.example.com", current: "https://api.staging.example.com" },
    { id: "v-token", key: "token", initial: "st_demo_****", current: "st_demo_****" },
    { id: "v-tenant", key: "tenantId", initial: "tn_10086", current: "tn_10086" },
    { id: "v-timeout", key: "timeoutMs", initial: "15000", current: "15000" },
    { id: "v-locale", key: "locale", initial: "zh-CN", current: "zh-CN" }
  ];
  var VAR_COLUMNS = [
    { key: "key", label: "Variable" },
    { key: "initial", label: "Initial Value" },
    { key: "current", label: "Current Value" }
  ];
  function EnvironmentsScreen() {
    return /* @__PURE__ */ React.createElement(AppShell, null, /* @__PURE__ */ React.createElement(Column, { id: "environments-page", className: "environments__page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "environments-header",
        titleId: "environments-title",
        className: "environments__header",
        title: "\u73AF\u5883\u53D8\u91CF",
        subtitle: "\u5728\u8BF7\u6C42 URL / Header / Body \u4E2D\u901A\u8FC7 {{var}} \u5F15\u7528",
        actions: /* @__PURE__ */ React.createElement(Row, { className: "environments__header-actions", gap: 8 }, /* @__PURE__ */ React.createElement(Button, { className: "environments__action-workspace", to: "workspace" }, "\u8FD4\u56DE\u5DE5\u4F5C\u533A"), /* @__PURE__ */ React.createElement(Button, { className: "environments__action-add", variant: "primary" }, "\u6DFB\u52A0\u53D8\u91CF"))
      }
    ), /* @__PURE__ */ React.createElement(Row, { id: "environments-picker", className: "environments__picker", gap: 12, alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { className: "environments__picker-label" }, "\u5F53\u524D\u73AF\u5883"), /* @__PURE__ */ React.createElement(Select, { className: "environments__select", defaultValue: "Staging", style: { width: 200 } }, /* @__PURE__ */ React.createElement("option", null, "Staging"), /* @__PURE__ */ React.createElement("option", null, "Production"), /* @__PURE__ */ React.createElement("option", null, "Local")), /* @__PURE__ */ React.createElement(Badge, { className: "environments__active-badge" }, "Active")), /* @__PURE__ */ React.createElement(Row, { id: "environments-cards", className: "environments__cards", gap: 12 }, ENV_LIST.map((env) => /* @__PURE__ */ React.createElement(
      Card,
      {
        key: env.id,
        className: "environments__card",
        "data-wf-key": env.id,
        style: { flex: 1, padding: 14 }
      },
      /* @__PURE__ */ React.createElement(Row, { className: "environments__card-row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement("strong", { className: "environments__card-name" }, env.name), env.active ? /* @__PURE__ */ React.createElement(Badge, { className: "environments__card-badge" }, "\u4F7F\u7528\u4E2D") : null),
      /* @__PURE__ */ React.createElement(Text, { className: "environments__card-meta", style: { fontSize: 12, marginTop: 6 } }, env.vars, " \u4E2A\u53D8\u91CF")
    ))), /* @__PURE__ */ React.createElement(Column, { id: "environments-table-wrap", className: "environments__table-wrap", gap: 10 }, /* @__PURE__ */ React.createElement(Text, { className: "environments__table-title", style: { fontWeight: 600 } }, "Staging \u53D8\u91CF"), /* @__PURE__ */ React.createElement(
      DataTable,
      {
        id: "environments-table",
        className: "environments__table",
        columns: VAR_COLUMNS,
        rows: VAR_ROWS
      }
    ))));
  }

  // demo/api-client/src/screens/history.jsx
  var HISTORY = [
    {
      id: "hist-1",
      method: "GET",
      name: "List Users",
      url: "https://api.staging.example.com/v1/users?page=1",
      status: "200",
      time: "142 ms",
      at: "\u4ECA\u5929 14:21:08"
    },
    {
      id: "hist-2",
      method: "POST",
      name: "Create Order",
      url: "https://api.staging.example.com/v1/orders",
      status: "201",
      time: "310 ms",
      at: "\u4ECA\u5929 13:55:41"
    },
    {
      id: "hist-3",
      method: "POST",
      name: "Login",
      url: "https://api.staging.example.com/v1/auth/login",
      status: "200",
      time: "98 ms",
      at: "\u4ECA\u5929 11:02:17"
    },
    {
      id: "hist-4",
      method: "GET",
      name: "Get Invoice",
      url: "https://api.staging.example.com/v1/billing/invoices/inv_88",
      status: "404",
      time: "67 ms",
      at: "\u6628\u5929 19:44:03"
    },
    {
      id: "hist-5",
      method: "PATCH",
      name: "Update User",
      url: "https://api.staging.example.com/v1/users/u_1001",
      status: "200",
      time: "188 ms",
      at: "\u6628\u5929 16:12:50"
    },
    {
      id: "hist-6",
      method: "DELETE",
      name: "Revoke Token",
      url: "https://api.staging.example.com/v1/auth/token",
      status: "204",
      time: "54 ms",
      at: "08-08 21:06:22"
    }
  ];
  function HistoryScreen() {
    return /* @__PURE__ */ React.createElement(AppShell, null, /* @__PURE__ */ React.createElement(Column, { id: "history-page", className: "history__page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "history-header",
        titleId: "history-title",
        className: "history__header",
        title: "\u5386\u53F2\u8BB0\u5F55",
        subtitle: "\u672C\u673A\u6700\u8FD1\u53D1\u9001\u7684\u8BF7\u6C42\uFF0C\u53EF\u91CD\u65B0\u6253\u5F00\u5230\u7F16\u8F91\u5668",
        actions: /* @__PURE__ */ React.createElement(Row, { className: "history__header-actions", gap: 8 }, /* @__PURE__ */ React.createElement(Button, { className: "history__action-clear" }, "\u6E05\u7A7A\u5386\u53F2"), /* @__PURE__ */ React.createElement(Button, { className: "history__action-workspace", to: "workspace" }, "\u8FD4\u56DE\u5DE5\u4F5C\u533A"))
      }
    ), /* @__PURE__ */ React.createElement(Column, { id: "history-list", className: "history__list", gap: 10 }, HISTORY.map((item) => /* @__PURE__ */ React.createElement(
      Card,
      {
        key: item.id,
        className: "history__item",
        "data-wf-key": item.id,
        to: "request-editor",
        style: { padding: 12 }
      },
      /* @__PURE__ */ React.createElement(Row, { className: "history__item-row", alignItems: "center", gap: 12 }, /* @__PURE__ */ React.createElement(Badge, { className: "history__item-method" }, item.method), /* @__PURE__ */ React.createElement(Column, { className: "history__item-copy", gap: 2, style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("strong", { className: "history__item-name" }, item.name), /* @__PURE__ */ React.createElement(Text, { className: "history__item-url", style: { fontSize: 12 } }, item.url), /* @__PURE__ */ React.createElement(Text, { className: "history__item-at", style: { fontSize: 12, color: "var(--wf-600)" } }, item.at)), /* @__PURE__ */ React.createElement(Badge, { className: "history__item-status" }, item.status), /* @__PURE__ */ React.createElement(Badge, { className: "history__item-time" }, item.time), /* @__PURE__ */ React.createElement(Button, { className: "history__item-open", to: "request-editor" }, "\u6253\u5F00"))
    )))));
  }

  // demo/api-client/src/screens/request-editor.jsx
  var PARAM_ROWS = [
    { id: "p-page", key: "page", value: "1", desc: "\u9875\u7801" },
    { id: "p-size", key: "size", value: "20", desc: "\u6BCF\u9875\u6761\u6570" },
    { id: "p-q", key: "q", value: "alice", desc: "\u5173\u952E\u5B57\u641C\u7D22" },
    { id: "p-status", key: "status", value: "active", desc: "\u7528\u6237\u72B6\u6001" }
  ];
  var HEADER_ROWS = [
    { id: "h-auth", key: "Authorization", value: "Bearer {{token}}", desc: "\u8BBF\u95EE\u4EE4\u724C" },
    { id: "h-accept", key: "Accept", value: "application/json", desc: "" },
    { id: "h-trace", key: "X-Request-Id", value: "{{$guid}}", desc: "\u94FE\u8DEF\u8FFD\u8E2A" },
    { id: "h-client", key: "X-Client", value: "api-client-demo", desc: "" }
  ];
  var PARAM_COLUMNS = [
    { key: "key", label: "Key" },
    { key: "value", label: "Value" },
    { key: "desc", label: "Description" }
  ];
  var RESPONSE_JSON = `{
  "data": [
    { "id": "u_1001", "name": "Alice", "role": "admin" },
    { "id": "u_1002", "name": "Bob", "role": "editor" },
    { "id": "u_1003", "name": "Carol", "role": "viewer" }
  ],
  "page": 1,
  "total": 128
}`;
  function RequestEditorScreen() {
    const [tab, setTab] = React.useState("params");
    const [respTab, setRespTab] = React.useState("body");
    return /* @__PURE__ */ React.createElement(AppShell, null, /* @__PURE__ */ React.createElement(Column, { id: "request-editor-page", className: "request-editor__page", gap: 0, style: { height: "100%" } }, /* @__PURE__ */ React.createElement(Column, { className: "request-editor__top", gap: 12, style: { padding: "16px 24px 12px", borderBottom: "1px solid var(--wf-300)" } }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "request-editor-header",
        titleId: "request-editor-title",
        className: "request-editor__header",
        title: "List Users",
        subtitle: "User API / Users",
        actions: /* @__PURE__ */ React.createElement(Row, { className: "request-editor__header-actions", gap: 8 }, /* @__PURE__ */ React.createElement(Button, { className: "request-editor__action-collection", to: "collection" }, "\u8FD4\u56DE Collection"), /* @__PURE__ */ React.createElement(Button, { className: "request-editor__action-save", to: "collection" }, "Save"))
      }
    ), /* @__PURE__ */ React.createElement(Row, { id: "request-editor-urlbar", className: "request-editor__urlbar", gap: 8, alignItems: "center" }, /* @__PURE__ */ React.createElement(Select, { className: "request-editor__method", defaultValue: "GET", style: { width: 110 } }, /* @__PURE__ */ React.createElement("option", null, "GET"), /* @__PURE__ */ React.createElement("option", null, "POST"), /* @__PURE__ */ React.createElement("option", null, "PUT"), /* @__PURE__ */ React.createElement("option", null, "PATCH"), /* @__PURE__ */ React.createElement("option", null, "DELETE")), /* @__PURE__ */ React.createElement(
      TextInput,
      {
        id: "request-editor-url",
        className: "request-editor__url",
        defaultValue: "{{baseUrl}}/v1/users",
        style: { flex: 1 }
      }
    ), /* @__PURE__ */ React.createElement(Select, { className: "request-editor__env", defaultValue: "Staging", style: { width: 140 } }, /* @__PURE__ */ React.createElement("option", null, "Staging"), /* @__PURE__ */ React.createElement("option", null, "Production"), /* @__PURE__ */ React.createElement("option", null, "Local")), /* @__PURE__ */ React.createElement(Button, { id: "request-editor-send", className: "request-editor__send", variant: "primary" }, "Send")), /* @__PURE__ */ React.createElement(
      Tabs,
      {
        id: "request-editor-tabs",
        className: "request-editor__tabs",
        activeId: tab,
        onChange: setTab,
        items: [
          { id: "params", label: "Params" },
          { id: "headers", label: "Headers" },
          { id: "body", label: "Body" },
          { id: "auth", label: "Authorization" }
        ]
      }
    ), tab === "params" ? /* @__PURE__ */ React.createElement(
      DataTable,
      {
        id: "request-editor-params",
        className: "request-editor__params",
        columns: PARAM_COLUMNS,
        rows: PARAM_ROWS
      }
    ) : null, tab === "headers" ? /* @__PURE__ */ React.createElement(
      DataTable,
      {
        id: "request-editor-headers",
        className: "request-editor__headers",
        columns: PARAM_COLUMNS,
        rows: HEADER_ROWS
      }
    ) : null, tab === "body" ? /* @__PURE__ */ React.createElement(Card, { id: "request-editor-body", className: "request-editor__body", style: { padding: 12 } }, /* @__PURE__ */ React.createElement(Row, { className: "request-editor__body-toolbar", gap: 8, style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(Badge, { className: "request-editor__body-type" }, "raw"), /* @__PURE__ */ React.createElement(Badge, { className: "request-editor__body-format" }, "JSON")), /* @__PURE__ */ React.createElement(
      TextArea,
      {
        className: "request-editor__body-input",
        rows: 6,
        defaultValue: '{\n  "note": "GET \u8BF7\u6C42\u901A\u5E38\u65E0 Body\uFF0C\u6B64\u5904\u4EC5\u793A\u610F\u7F16\u8F91\u533A"\n}'
      }
    )) : null, tab === "auth" ? /* @__PURE__ */ React.createElement(Card, { id: "request-editor-auth", className: "request-editor__auth", style: { padding: 14 } }, /* @__PURE__ */ React.createElement(Column, { className: "request-editor__auth-fields", gap: 10 }, /* @__PURE__ */ React.createElement(Row, { className: "request-editor__auth-row", gap: 12, alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { className: "request-editor__auth-label", style: { width: 80 } }, "Type"), /* @__PURE__ */ React.createElement(Select, { className: "request-editor__auth-type", defaultValue: "Bearer Token", style: { width: 200 } }, /* @__PURE__ */ React.createElement("option", null, "Bearer Token"), /* @__PURE__ */ React.createElement("option", null, "API Key"), /* @__PURE__ */ React.createElement("option", null, "Basic Auth"), /* @__PURE__ */ React.createElement("option", null, "No Auth"))), /* @__PURE__ */ React.createElement(Row, { className: "request-editor__auth-row", gap: 12, alignItems: "center" }, /* @__PURE__ */ React.createElement(Text, { className: "request-editor__auth-label", style: { width: 80 } }, "Token"), /* @__PURE__ */ React.createElement(
      TextInput,
      {
        className: "request-editor__auth-token",
        defaultValue: "{{token}}",
        style: { flex: 1 }
      }
    )))) : null), /* @__PURE__ */ React.createElement(
      Column,
      {
        id: "request-editor-response",
        className: "request-editor__response",
        gap: 10,
        style: { flex: 1, padding: 24, background: "var(--wf-50)", minHeight: 280 }
      },
      /* @__PURE__ */ React.createElement(Row, { className: "request-editor__response-head", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Heading, { className: "request-editor__response-title", level: 3 }, "Response"), /* @__PURE__ */ React.createElement(Row, { className: "request-editor__response-meta", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "request-editor__status" }, "200 OK"), /* @__PURE__ */ React.createElement(Badge, { className: "request-editor__time" }, "142 ms"), /* @__PURE__ */ React.createElement(Badge, { className: "request-editor__size" }, "3.2 KB"))),
      /* @__PURE__ */ React.createElement(
        Tabs,
        {
          id: "request-editor-response-tabs",
          className: "request-editor__response-tabs",
          activeId: respTab,
          onChange: setRespTab,
          items: [
            { id: "body", label: "Body" },
            { id: "headers", label: "Headers" },
            { id: "cookies", label: "Cookies" }
          ]
        }
      ),
      respTab === "body" ? /* @__PURE__ */ React.createElement(Card, { id: "request-editor-response-body", className: "request-editor__response-body", style: { padding: 12 } }, /* @__PURE__ */ React.createElement(
        "pre",
        {
          className: "request-editor__response-json",
          style: { margin: 0, fontSize: 12, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace" }
        },
        RESPONSE_JSON
      )) : null,
      respTab === "headers" ? /* @__PURE__ */ React.createElement(
        DataTable,
        {
          id: "request-editor-response-headers",
          className: "request-editor__response-headers",
          columns: [
            { key: "key", label: "Header" },
            { key: "value", label: "Value" }
          ],
          rows: [
            { id: "rh-ct", key: "content-type", value: "application/json; charset=utf-8" },
            { id: "rh-cache", key: "cache-control", value: "no-store" },
            { id: "rh-req", key: "x-request-id", value: "req_8f3a2c" }
          ]
        }
      ) : null,
      respTab === "cookies" ? /* @__PURE__ */ React.createElement(Card, { id: "request-editor-cookies", className: "request-editor__cookies", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(Text, { className: "request-editor__cookies-empty" }, "\u672C\u6B21\u54CD\u5E94\u672A\u8BBE\u7F6E Cookie")) : null
    )));
  }

  // demo/api-client/src/screens/settings.jsx
  function SettingsScreen() {
    const [ssl, setSsl] = React.useState(true);
    const [followRedirect, setFollowRedirect] = React.useState(true);
    const [proxy, setProxy] = React.useState(false);
    return /* @__PURE__ */ React.createElement(AppShell, null, /* @__PURE__ */ React.createElement(Column, { id: "settings-page", className: "settings__page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "settings-header",
        titleId: "settings-title",
        className: "settings__header",
        title: "\u8BBE\u7F6E",
        subtitle: "\u901A\u7528\u504F\u597D\u3001\u4EE3\u7406\u4E0E\u8BC1\u4E66\uFF08\u7EBF\u6846\u793A\u610F\uFF09",
        actions: /* @__PURE__ */ React.createElement(Button, { className: "settings__action-workspace", to: "workspace" }, "\u8FD4\u56DE\u5DE5\u4F5C\u533A")
      }
    ), /* @__PURE__ */ React.createElement(Card, { id: "settings-general", className: "settings__section", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(Column, { className: "settings__section-body", gap: 14 }, /* @__PURE__ */ React.createElement(Text, { className: "settings__section-title", style: { fontWeight: 600 } }, "\u901A\u7528"), /* @__PURE__ */ React.createElement(FormField, { className: "settings__field", label: "\u9ED8\u8BA4\u8D85\u65F6\uFF08ms\uFF09", htmlFor: "settings-timeout" }, /* @__PURE__ */ React.createElement(TextInput, { id: "settings-timeout", className: "settings__timeout", defaultValue: "15000" })), /* @__PURE__ */ React.createElement(Row, { className: "settings__toggle-row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "settings__toggle-label" }, "\u81EA\u52A8\u8DDF\u968F\u91CD\u5B9A\u5411"), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        id: "settings-redirect",
        className: "settings__redirect",
        checked: followRedirect,
        onChange: setFollowRedirect
      }
    )), /* @__PURE__ */ React.createElement(Row, { className: "settings__toggle-row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "settings__toggle-label" }, "\u6821\u9A8C\u8BC1\u4E66\uFF08SSL\uFF09"), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        id: "settings-ssl",
        className: "settings__ssl",
        checked: ssl,
        onChange: setSsl
      }
    )))), /* @__PURE__ */ React.createElement(Card, { id: "settings-proxy", className: "settings__section", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(Column, { className: "settings__section-body", gap: 14 }, /* @__PURE__ */ React.createElement(Row, { className: "settings__proxy-head", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "settings__section-title", style: { fontWeight: 600 } }, "\u4EE3\u7406"), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        id: "settings-proxy-toggle",
        className: "settings__proxy-toggle",
        checked: proxy,
        onChange: setProxy,
        label: proxy ? "\u5F00\u542F" : "\u5173\u95ED"
      }
    )), /* @__PURE__ */ React.createElement(FormField, { className: "settings__field", label: "Host", htmlFor: "settings-proxy-host" }, /* @__PURE__ */ React.createElement(TextInput, { id: "settings-proxy-host", className: "settings__proxy-host", defaultValue: "127.0.0.1" })), /* @__PURE__ */ React.createElement(FormField, { className: "settings__field", label: "Port", htmlFor: "settings-proxy-port" }, /* @__PURE__ */ React.createElement(TextInput, { id: "settings-proxy-port", className: "settings__proxy-port", defaultValue: "7890" })))), /* @__PURE__ */ React.createElement(Card, { id: "settings-certs", className: "settings__section", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(Column, { className: "settings__section-body", gap: 10 }, /* @__PURE__ */ React.createElement(Text, { className: "settings__section-title", style: { fontWeight: 600 } }, "\u8BC1\u4E66"), /* @__PURE__ */ React.createElement(Text, { className: "settings__certs-empty", style: { fontSize: 13 } }, "\u5C1A\u672A\u6DFB\u52A0\u5BA2\u6237\u7AEF\u8BC1\u4E66\u3002\u751F\u4EA7\u73AF\u5883\u53EF\u5728\u6B64\u6302\u8F7D .pem / .p12\u3002"), /* @__PURE__ */ React.createElement(Button, { className: "settings__certs-add" }, "\u6DFB\u52A0\u8BC1\u4E66")))));
  }

  // demo/api-client/src/screens/workspace.jsx
  var COLLECTIONS = [
    {
      id: "col-users",
      name: "User API",
      desc: "\u7528\u6237\u5217\u8868\u3001\u8BE6\u60C5\u3001\u66F4\u65B0\u4E0E\u7981\u7528",
      count: 6,
      updatedAt: "\u4ECA\u5929 10:24"
    },
    {
      id: "col-orders",
      name: "Order API",
      desc: "\u8BA2\u5355\u67E5\u8BE2\u3001\u521B\u5EFA\u3001\u53D6\u6D88\u3001\u5C65\u7EA6\u72B6\u6001",
      count: 9,
      updatedAt: "\u6628\u5929 18:02"
    },
    {
      id: "col-auth",
      name: "Auth",
      desc: "\u767B\u5F55\u3001\u5237\u65B0 Token\u3001\u767B\u51FA",
      count: 4,
      updatedAt: "08-08 14:11"
    },
    {
      id: "col-billing",
      name: "Billing",
      desc: "\u8D26\u5355\u3001\u53D1\u7968\u3001\u652F\u4ED8\u56DE\u8C03",
      count: 5,
      updatedAt: "08-07 09:40"
    }
  ];
  var RECENT = [
    { id: "req-list-users", method: "GET", name: "List Users", path: "/v1/users", status: "200" },
    { id: "req-create-order", method: "POST", name: "Create Order", path: "/v1/orders", status: "201" },
    { id: "req-login", method: "POST", name: "Login", path: "/v1/auth/login", status: "200" },
    { id: "req-get-invoice", method: "GET", name: "Get Invoice", path: "/v1/billing/invoices/:id", status: "404" }
  ];
  function WorkspaceScreen() {
    return /* @__PURE__ */ React.createElement(
      AppShell,
      {
        aside: /* @__PURE__ */ React.createElement(Column, { id: "workspace-aside", className: "workspace__aside", gap: 12 }, /* @__PURE__ */ React.createElement(Row, { className: "workspace__aside-head", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Heading, { className: "workspace__aside-title", level: 3 }, "Collections"), /* @__PURE__ */ React.createElement(Button, { className: "workspace__aside-new", to: "collection" }, "\u65B0\u5EFA")), COLLECTIONS.map((item) => /* @__PURE__ */ React.createElement(
          Card,
          {
            key: item.id,
            className: "workspace__collection-card",
            "data-wf-key": item.id,
            to: "collection",
            style: { padding: 10 }
          },
          /* @__PURE__ */ React.createElement(Row, { className: "workspace__collection-row", alignItems: "center", justifyContent: "space-between", gap: 8 }, /* @__PURE__ */ React.createElement("strong", { className: "workspace__collection-name" }, item.name), /* @__PURE__ */ React.createElement(Badge, { className: "workspace__collection-count" }, item.count)),
          /* @__PURE__ */ React.createElement(Text, { className: "workspace__collection-desc", style: { fontSize: 12, marginTop: 4 } }, item.desc)
        )))
      },
      /* @__PURE__ */ React.createElement(Column, { id: "workspace-page", className: "workspace__page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(
        PageHeader,
        {
          id: "workspace-header",
          titleId: "workspace-title",
          className: "workspace__header",
          title: "\u5DE5\u4F5C\u533A",
          subtitle: "\u9009\u62E9 Collection \u6253\u5F00\u8BF7\u6C42\uFF0C\u6216\u4ECE\u6700\u8FD1\u8BB0\u5F55\u7EE7\u7EED\u7F16\u8F91",
          actions: /* @__PURE__ */ React.createElement(Row, { className: "workspace__header-actions", gap: 8 }, /* @__PURE__ */ React.createElement(Button, { className: "workspace__action-env", to: "environments" }, "\u5207\u6362\u73AF\u5883"), /* @__PURE__ */ React.createElement(Button, { className: "workspace__action-new", to: "request-editor", variant: "primary" }, "\u65B0\u5EFA\u8BF7\u6C42"))
        }
      ), /* @__PURE__ */ React.createElement(Card, { id: "workspace-welcome", className: "workspace__welcome", style: { padding: 16 } }, /* @__PURE__ */ React.createElement(Heading, { className: "workspace__welcome-title", level: 3 }, "Demo Workspace"), /* @__PURE__ */ React.createElement(Text, { className: "workspace__welcome-copy" }, "\u5F53\u524D\u73AF\u5883\uFF1AStaging \xB7 Base URL \u4F7F\u7528 ", "{{baseUrl}}", " \xB7 \u5171 4 \u4E2A Collection")), /* @__PURE__ */ React.createElement(Column, { id: "workspace-recent", className: "workspace__recent", gap: 10 }, /* @__PURE__ */ React.createElement(Heading, { className: "workspace__recent-title", level: 3 }, "\u6700\u8FD1\u8BF7\u6C42"), RECENT.map((item) => /* @__PURE__ */ React.createElement(
        Card,
        {
          key: item.id,
          className: "workspace__recent-item",
          "data-wf-key": item.id,
          to: "request-editor",
          style: { padding: 12 }
        },
        /* @__PURE__ */ React.createElement(Row, { className: "workspace__recent-row", alignItems: "center", gap: 12 }, /* @__PURE__ */ React.createElement(Badge, { className: "workspace__recent-method" }, item.method), /* @__PURE__ */ React.createElement(Column, { className: "workspace__recent-copy", gap: 2, style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("strong", { className: "workspace__recent-name" }, item.name), /* @__PURE__ */ React.createElement(Text, { className: "workspace__recent-path", style: { fontSize: 12 } }, item.path)), /* @__PURE__ */ React.createElement(Badge, { className: "workspace__recent-status" }, item.status))
      ))), /* @__PURE__ */ React.createElement(Row, { className: "workspace__shortcuts", gap: 12 }, /* @__PURE__ */ React.createElement(Card, { className: "workspace__shortcut", to: "history", style: { flex: 1, padding: 14 } }, /* @__PURE__ */ React.createElement(Heading, { className: "workspace__shortcut-title", level: 3 }, "\u5386\u53F2\u8BB0\u5F55"), /* @__PURE__ */ React.createElement(Text, { className: "workspace__shortcut-desc" }, "\u67E5\u770B\u672C\u673A\u53D1\u9001\u8FC7\u7684\u8BF7\u6C42")), /* @__PURE__ */ React.createElement(Card, { className: "workspace__shortcut", to: "settings", style: { flex: 1, padding: 14 } }, /* @__PURE__ */ React.createElement(Heading, { className: "workspace__shortcut-title", level: 3 }, "\u8BBE\u7F6E"), /* @__PURE__ */ React.createElement(Text, { className: "workspace__shortcut-desc" }, "\u4EE3\u7406\u3001\u8BC1\u4E66\u4E0E\u901A\u7528\u504F\u597D"))))
    );
  }

  // demo/api-client/src/project.js
  var SHELL_LINKS = ["workspace", "collection", "environments", "history", "settings"];
  var project = {
    name: "API Client\uFF08Postman \u98CE\u683C\uFF09",
    annotationsRevision,
    annotations,
    viewports: {
      desktop: { width: 1440, height: 900 }
    },
    defaultViewport: "desktop",
    screens: [
      {
        id: "workspace",
        title: "\u5DE5\u4F5C\u533A",
        description: "Collections \u4FA7\u680F\u4E0E\u6700\u8FD1\u8BF7\u6C42\u5165\u53E3",
        component: WorkspaceScreen,
        entry: true,
        links: [...SHELL_LINKS, "request-editor"],
        edgeCases: []
      },
      {
        id: "collection",
        title: "Collection",
        description: "\u6587\u4EF6\u5939\u4E0E\u8BF7\u6C42\u6811\uFF0C\u6253\u5F00\u8BF7\u6C42\u7F16\u8F91\u5668",
        component: CollectionScreen,
        links: [...SHELL_LINKS, "request-editor"],
        edgeCases: []
      },
      {
        id: "request-editor",
        title: "\u8BF7\u6C42\u7F16\u8F91",
        description: "Method / URL / Params / Headers / Body \u4E0E Response",
        component: RequestEditorScreen,
        links: SHELL_LINKS,
        edgeCases: []
      },
      {
        id: "environments",
        title: "\u73AF\u5883\u53D8\u91CF",
        description: "\u591A\u73AF\u5883\u5207\u6362\u4E0E\u53D8\u91CF\u8868",
        component: EnvironmentsScreen,
        links: SHELL_LINKS,
        edgeCases: []
      },
      {
        id: "history",
        title: "\u5386\u53F2\u8BB0\u5F55",
        description: "\u6700\u8FD1\u53D1\u9001\u8BB0\u5F55\uFF0C\u53EF\u91CD\u65B0\u6253\u5F00\u7F16\u8F91\u5668",
        component: HistoryScreen,
        links: [...SHELL_LINKS, "request-editor"],
        edgeCases: []
      },
      {
        id: "settings",
        title: "\u8BBE\u7F6E",
        description: "\u901A\u7528\u3001\u4EE3\u7406\u4E0E\u8BC1\u4E66",
        component: SettingsScreen,
        links: SHELL_LINKS,
        edgeCases: []
      }
    ]
  };

  // demo/api-client/src/app.jsx
  validateProject(project);
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(ErrorBoundary, { scope: "board" }, /* @__PURE__ */ React.createElement(PrototypeProvider, { project }, /* @__PURE__ */ React.createElement(Board, { project })))
  );
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9hbm5vdGF0aW9ucy5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQW5ub3RhdGlvblBhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQW5ub3RhdGlvbk1hcmtlcnMuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vc3JjL2Fubm90YXRpb25zLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9sYXlvdXQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9jb250ZW50LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZm9ybXMuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9uYXZpZ2F0aW9uLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZGF0YS5qc3giLCAiLi4vc3JjL2xheW91dHMvQXBwU2hlbGwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2NvbGxlY3Rpb24uanN4IiwgIi4uL3NyYy9zY3JlZW5zL2Vudmlyb25tZW50cy5qc3giLCAiLi4vc3JjL3NjcmVlbnMvaGlzdG9yeS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvcmVxdWVzdC1lZGl0b3IuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3NldHRpbmdzLmpzeCIsICIuLi9zcmMvc2NyZWVucy93b3Jrc3BhY2UuanN4IiwgIi4uL3NyYy9wcm9qZWN0LmpzIiwgIi4uL3NyYy9hcHAuanN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBQcm90b3R5cGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdCkge1xuICByZXR1cm4gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgcHJvamVjdC5zY3JlZW5zWzBdLmlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcm90b3R5cGVQcm92aWRlcih7IHByb2plY3QsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgaW5pdGlhbFNjcmVlbklkID0gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIG1vZGU6ICdjYW52YXMnLFxuICAgIHZpZXdwb3J0S2V5OiBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCxcbiAgICBlbnRyeUlkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgaGlzdG9yeTogW10sXG4gIH0pXG5cbiAgY29uc3QgbmF2aWdhdGUgPSBSZWFjdC51c2VDYWxsYmFjaygoaWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtpZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZClcbiAgICAgICAgaWYgKCFzY3JlZW4ubGlua3MuaW5jbHVkZXMoaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke2N1cnJlbnQuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHtpZH1cImApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogaWQsXG4gICAgICAgIGhpc3Rvcnk6XG4gICAgICAgICAgY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkXG4gICAgICAgICAgICA/IFsuLi5jdXJyZW50Lmhpc3RvcnksIGN1cnJlbnQuY3VycmVudFNjcmVlbklkXVxuICAgICAgICAgICAgOiBjdXJyZW50Lmhpc3RvcnksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNlbGVjdEVudHJ5ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVudHJ5SWQpID0+IHtcbiAgICBjb25zdCBlbnRyeSA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBlbnRyeUlkLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBnb0JhY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50Lmhpc3RvcnlbY3VycmVudC5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgICAgICBoaXN0b3J5OiBjdXJyZW50Lmhpc3Rvcnkuc2xpY2UoMCwgLTEpLFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHJlc2V0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5lbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtpbml0aWFsU2NyZWVuSWRdKVxuXG4gIGNvbnN0IHNldE1vZGUgPSBSZWFjdC51c2VDYWxsYmFjaygobW9kZSkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnY2FudmFzJyAmJiBtb2RlICE9PSAnZGVtbycpIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtb2RlIFwiJHttb2RlfVwiYClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtdKVxuXG4gIC8qKiBcdTc1M0JcdTY3N0ZcdTUzQ0NcdTUxRkJcdTY3RDBcdTk4NzVcdUZGMUFcdThGREJcdTUxNjVcdTZGMTRcdTc5M0FcdTVFNzZcdTg0M0RcdTU3MjhcdThCRTVcdTk4NzUgKi9cbiAgY29uc3QgZW50ZXJEZW1vID0gUmVhY3QudXNlQ2FsbGJhY2soKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHNjcmVlbklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7c2NyZWVuSWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlOiAnZGVtbycsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IHNjcmVlbklkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZXRWaWV3cG9ydEtleSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aWV3cG9ydEtleSkgPT4ge1xuICAgIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgdmlld3BvcnRLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdmlld3BvcnQgXCIke3ZpZXdwb3J0S2V5fVwiYClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHZpZXdwb3J0S2V5IH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgdmFsdWUgPSBSZWFjdC51c2VNZW1vKCgpID0+ICh7XG4gICAgbW9kZTogc3RhdGUubW9kZSxcbiAgICB2aWV3cG9ydEtleTogc3RhdGUudmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQ6IHByb2plY3Qudmlld3BvcnRzW3N0YXRlLnZpZXdwb3J0S2V5XSxcbiAgICBlbnRyeUlkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuY3VycmVudFNjcmVlbklkLFxuICAgIG5hdmlnYXRlLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBzZXRNb2RlLFxuICAgIGVudGVyRGVtbyxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICBjYW5Hb0JhY2s6IHN0YXRlLmhpc3RvcnkubGVuZ3RoID4gMCxcbiAgfSksIFtlbnRlckRlbW8sIGdvQmFjaywgbmF2aWdhdGUsIHByb2plY3QsIHJlc2V0LCBzZWxlY3RFbnRyeSwgc2V0TW9kZSwgc2V0Vmlld3BvcnRLZXksIHN0YXRlXSlcblxuICByZXR1cm4gPFByb3RvdHlwZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT57Y2hpbGRyZW59PC9Qcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvdG90eXBlKCkge1xuICBjb25zdCBjb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChQcm90b3R5cGVDb250ZXh0KVxuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcigndXNlUHJvdG90eXBlIG11c3QgYmUgdXNlZCBpbnNpZGUgUHJvdG90eXBlUHJvdmlkZXInKVxuICByZXR1cm4gY29udGV4dFxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjbGFtcFNjYWxlKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLm1pbigyLCBNYXRoLm1heCgwLjIsIHNjYWxlKSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMUFcdTYzMDlcdTVCQjlcdTU2NjhcdTUxODVcdTVCQjlcdTUzM0FcdTYyOEFcdTY1NzRcdTk4NzVcdTdGMjlcdTY1M0VcdTUyMzBcdTVCOENcdTY1NzRcdTUzRUZcdTg5QzFcdTMwMDJcbiAqIGNvbnRhaW5lciogXHU0RTNBXHU1M0JCXHU2Mzg5IHBhZGRpbmcgXHU1NDBFXHU3Njg0XHU1M0VGXHU3NTI4XHU1QzNBXHU1QkY4XHVGRjFCY29udGVudCogXHU0RTNBXHU2NzJBXHU3RjI5XHU2NTNFXHU3Njg0IHN0YWdlIFx1NUJCRFx1OUFEOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0RGVtb1NjYWxlKGNvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHQsIGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCkge1xuICBpZiAoY29udGFpbmVyV2lkdGggPD0gMCB8fCBjb250YWluZXJIZWlnaHQgPD0gMCB8fCBjb250ZW50V2lkdGggPD0gMCB8fCBjb250ZW50SGVpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiBjbGFtcFNjYWxlKE1hdGgubWluKGNvbnRhaW5lcldpZHRoIC8gY29udGVudFdpZHRoLCBjb250YWluZXJIZWlnaHQgLyBjb250ZW50SGVpZ2h0KSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTg5QzZcdTUzRTNcdTUzQ0NcdTUxRkJcdTc2RUVcdTY4MDdcdTY2MkZcdTU0MjZcdTRFM0FcdTVDNEZcdTU5MTZcdTdBN0FcdTc2N0RcdTMwMDJcbiAqIFx1NzBCOVx1NTcyOCAud2Ytc2NyZWVuLWNocm9tZVx1RkYwOFx1NjgwN1x1OTg5OFx1NjgwRiAvIFx1NTE4NVx1NUJCOVx1RkYwOVx1NTE4NVx1NEUwRFx1N0I5N1x1N0E3QVx1NzY3RFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1OTAwMFx1NTFGQVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiB0cnVlXG4gIHJldHVybiAhdGFyZ2V0LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY2hyb21lJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q2FudmFzVmlld3BvcnQoKSB7XG4gIHJldHVybiB7IHNjYWxlOiAxLCBwYW5YOiAwLCBwYW5ZOiAwIH1cbn1cblxuY29uc3QgRk9DVVNfUEFERElORyA9IDQwXG5cbi8qKlxuICogXHU3NTNCXHU2NzdGIGZvY3VzXHVGRjFBXHU2MjhBXHU2NTc0XHU1NzU3IHNjcmVlblx1RkYwOFx1NTQyQiBtZXRhXHVGRjA5XHU3OUZCXHU1MjMwXHU1QkI5XHU1NjY4XHU0RTJEXHU1RkMzXHUzMDAyXG4gKiBcdTRFQzVcdTVGNTNcdTVGNTNcdTUyNEQgc2NhbGUgXHU2NTNFXHU0RTBEXHU0RTBCXHU2NUY2XHU3RjI5XHU1QzBGXHVGRjFCXHU0RTBEXHU2NTNFXHU1OTI3XHUzMDAyXHU1QzNBXHU1QkY4XHU5NzVFXHU2Q0Q1XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgY29udGFpbmVyV2lkdGgsXG4gIGNvbnRhaW5lckhlaWdodCxcbiAgc2NyZWVuTGVmdCxcbiAgc2NyZWVuVG9wLFxuICBzY3JlZW5XaWR0aCxcbiAgc2NyZWVuSGVpZ2h0LFxuICBjdXJyZW50U2NhbGUsXG4gIHBhZGRpbmcgPSBGT0NVU19QQURESU5HLFxufSkge1xuICBpZiAoXG4gICAgY29udGFpbmVyV2lkdGggPD0gMFxuICAgIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwXG4gICAgfHwgc2NyZWVuV2lkdGggPD0gMFxuICAgIHx8IHNjcmVlbkhlaWdodCA8PSAwXG4gICAgfHwgIU51bWJlci5pc0Zpbml0ZShjdXJyZW50U2NhbGUpXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBhdmFpbFdpZHRoID0gY29udGFpbmVyV2lkdGggLSBwYWRkaW5nICogMlxuICBjb25zdCBhdmFpbEhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHBhZGRpbmcgKiAyXG4gIGlmIChhdmFpbFdpZHRoIDw9IDAgfHwgYXZhaWxIZWlnaHQgPD0gMCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBmaXRTY2FsZSA9IE1hdGgubWluKGF2YWlsV2lkdGggLyBzY3JlZW5XaWR0aCwgYXZhaWxIZWlnaHQgLyBzY3JlZW5IZWlnaHQpXG4gIGNvbnN0IHNjYWxlID0gY2xhbXBTY2FsZShNYXRoLm1pbihjdXJyZW50U2NhbGUsIGZpdFNjYWxlKSlcbiAgcmV0dXJuIHtcbiAgICBzY2FsZSxcbiAgICBwYW5YOiBjb250YWluZXJXaWR0aCAvIDIgLSAoc2NyZWVuTGVmdCArIHNjcmVlbldpZHRoIC8gMikgKiBzY2FsZSxcbiAgICBwYW5ZOiBjb250YWluZXJIZWlnaHQgLyAyIC0gKHNjcmVlblRvcCArIHNjcmVlbkhlaWdodCAvIDIpICogc2NhbGUsXG4gIH1cbn1cblxuLyoqXG4gKiBcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdUZGMUFcdTUzRUFcdTc1MjhcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTUyNERcdTYyMkFcdTgzQjdcdTc2ODQgc25hcHNob3RcdUZGMENcdTc5ODFcdTZCNjJcdTU3Mjggc2V0U3RhdGUgdXBkYXRlciBcdTkxQ0NcdThCRkIgZHJhZyByZWZcdTMwMDJcbiAqIFJlYWN0IDE4IFx1NEYxQVx1NTcyOCBlbmRQYW4gXHU2RTA1XHU3QTdBIHJlZiBcdTU0MEVcdTkxQ0RcdTY1M0UgdXBkYXRlclx1RkYxQlx1OEJGQiBudWxsLnBhblggXHU1MzczIEJvYXJkIFx1NjJBNVx1OTUxOVx1NjgzOVx1NTZFMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFuRnJvbURyYWdTbmFwc2hvdCh2aWV3LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gdmlld1xuICByZXR1cm4ge1xuICAgIC4uLnZpZXcsXG4gICAgcGFuWDogc25hcHNob3QucGFuWCArIGNsaWVudFggLSBzbmFwc2hvdC54LFxuICAgIHBhblk6IHNuYXBzaG90LnBhblkgKyBjbGllbnRZIC0gc25hcHNob3QueSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTY3JvbGxhYmxlT3ZlcmZsb3codmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSAnYXV0bycgfHwgdmFsdWUgPT09ICdzY3JvbGwnIHx8IHZhbHVlID09PSAnb3ZlcmxheSdcbn1cblxuLyoqIFx1NTcyOCByb290IFx1NTE4NVx1NTQxMVx1NEUwQVx1NjI3RVx1NTNFRlx1NkVEQVx1NTJBOFx1Nzk1Nlx1NTE0OFx1RkYwOFx1NTQyQiByb290IFx1ODFFQVx1OEVBQlx1RkYwQ1x1NTk4Mlx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1NTMzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlQW5jZXN0b3Ioc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGxldCBub2RlID0gc3RhcnRFbCAmJiBzdGFydEVsLm5vZGVUeXBlID09PSAzID8gc3RhcnRFbC5wYXJlbnRFbGVtZW50IDogc3RhcnRFbFxuICB3aGlsZSAobm9kZSkge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpXG4gICAgICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBub2RlLnNjcm9sbEhlaWdodCA+IG5vZGUuY2xpZW50SGVpZ2h0ICsgMVxuICAgICAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgbm9kZS5zY3JvbGxXaWR0aCA+IG5vZGUuY2xpZW50V2lkdGggKyAxXG4gICAgICBpZiAoY2FuWSB8fCBjYW5YKSByZXR1cm4gbm9kZVxuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBDT05URU5UX0RSQUdfVEhSRVNIT0xEID0gM1xuXG5mdW5jdGlvbiBpc0VkaXRhYmxlVGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxuICByZXR1cm4gISF0YXJnZXQuY2xvc2VzdCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJylcbn1cblxuLyoqXG4gKiBcdTU3MjhcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUxODVcdTYzMDlcdTRGNEZcdTYyRDZcdTYyRkQgXHUyMTkyIFx1NkVEQVx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHVGRjA4XHU1M0VGXHU0RUE0XHU0RTkyXHU1MTczXHU5NUVEIC8gXHU3QTdBXHU2ODNDXHVGRjA5XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdUZGMENcdTRFQTRcdTdFRDlcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcdTMwMDJcbiAqIFx1OEZENFx1NTZERSBudWxsIFx1ODg2OFx1NzkzQVx1NEUwRFx1NUU5NFx1NjNBNVx1N0JBMVx1OEJFNVx1NkIyMSBwb2ludGVyZG93blx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgcm9vdEVsLCB7IGxvY2tlZCA9IGZhbHNlLCBzY2FsZSA9IDEgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiBudWxsXG4gIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVybiBudWxsXG4gIGlmICghcm9vdEVsIHx8ICFyb290RWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgaWYgKGlzRWRpdGFibGVUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgY29uc3Qgc2Nyb2xsYWJsZSA9IGZpbmRTY3JvbGxhYmxlQW5jZXN0b3IoZXZlbnQudGFyZ2V0LCByb290RWwpXG4gIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHtcbiAgICBlbDogc2Nyb2xsYWJsZSxcbiAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgIHNjcm9sbExlZnQ6IHNjcm9sbGFibGUuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IHNjcm9sbGFibGUuc2Nyb2xsVG9wLFxuICAgIHNjYWxlOiBzY2FsZSA+IDAgPyBzY2FsZSA6IDEsXG4gICAgbW92ZWQ6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KSB7XG4gIGlmICghc3RhdGUgfHwgc3RhdGUucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVybiBzdGF0ZVxuICBjb25zdCBkeCA9IChldmVudC5jbGllbnRYIC0gc3RhdGUuc3RhcnRYKSAvIHN0YXRlLnNjYWxlXG4gIGNvbnN0IGR5ID0gKGV2ZW50LmNsaWVudFkgLSBzdGF0ZS5zdGFydFkpIC8gc3RhdGUuc2NhbGVcbiAgaWYgKCFzdGF0ZS5tb3ZlZCAmJiAoTWF0aC5hYnMoZHgpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCB8fCBNYXRoLmFicyhkeSkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEKSkge1xuICAgIHN0YXRlLm1vdmVkID0gdHJ1ZVxuICB9XG4gIHN0YXRlLmVsLnNjcm9sbExlZnQgPSBzdGF0ZS5zY3JvbGxMZWZ0IC0gZHhcbiAgc3RhdGUuZWwuc2Nyb2xsVG9wID0gc3RhdGUuc2Nyb2xsVG9wIC0gZHlcbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8qKiBcdTYyRDZcdTYyRkRcdThEODVcdThGQzdcdTk2MDhcdTUwM0NcdTU0MEVcdTU0MUVcdTYzODlcdTk2OEZcdTU0MEVcdTc2ODQgY2xpY2tcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTg5RTZcdThERjNcdThGNkMgKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgcm9vdEVsKSB7XG4gIGlmICghc3RhdGUgfHwgIXN0YXRlLm1vdmVkIHx8ICFyb290RWwpIHJldHVyblxuICBjb25zdCBwcmV2ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByb290RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG4gIH1cbiAgcm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxufVxuXG4vKiogXHU4QkU1XHU2NUI5XHU1NDExXHU2NjJGXHU1NDI2XHU4RkQ4XHU4MEZEXHU3RUU3XHU3RUVEXHU2RURBICovXG5leHBvcnQgZnVuY3Rpb24gY2FuU2Nyb2xsSW5EaXJlY3Rpb24oZWwsIGRlbHRhWCwgZGVsdGFZKSB7XG4gIGNvbnN0IGVwcyA9IDFcbiAgaWYgKGRlbHRhWSkge1xuICAgIGNvbnN0IG1heFkgPSBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHRcbiAgICBpZiAobWF4WSA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWSA8IDAgJiYgZWwuc2Nyb2xsVG9wID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWSA+IDAgJiYgZWwuc2Nyb2xsVG9wIDwgbWF4WSAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgaWYgKGRlbHRhWCkge1xuICAgIGNvbnN0IG1heFggPSBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoXG4gICAgaWYgKG1heFggPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVggPCAwICYmIGVsLnNjcm9sbExlZnQgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFYID4gMCAmJiBlbC5zY3JvbGxMZWZ0IDwgbWF4WCAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUZCXHU2MTBGXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUM1IEN0cmwvTWV0YSArIFx1NkVEQVx1OEY2RVxuICpcdUZGMDhcdTg5RTZcdTYzQTdcdTY3N0YgcGluY2ggXHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4XHU5MUNDXHU5MDFBXHU1RTM4XHU1RTI2IGN0cmxLZXlcdUZGMDlcdTMwMDJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTY2NkVcdTkwMUFcdTZFREFcdThGNkVcdTc1NTlcdTdFRDlcdTVDNEZcdTUxODVcdTZFREFcdTUyQThcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gISEoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJFbnRyeUlkKHNjcmVlbnMpIHtcbiAgcmV0dXJuIHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZW1vU3RhdGUoc2NyZWVucykge1xuICBjb25zdCBlbnRyeUlkID0gaW5mZXJFbnRyeUlkKHNjcmVlbnMpXG4gIGlmICghZW50cnlJZCkgdGhyb3cgbmV3IEVycm9yKCdEZW1vIG1vZGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGVudHJ5IHNjcmVlbicpXG4gIHJldHVybiB7XG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGVEZW1vKHN0YXRlLCB0YXJnZXRJZCwgc2NyZWVucykge1xuICBpZiAoIXNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3RhcmdldElkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgfVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKVxuICBpZiAoIWN1cnJlbnRTY3JlZW4ubGlua3MuaW5jbHVkZXModGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke3N0YXRlLmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7dGFyZ2V0SWR9XCJgKVxuICB9XG4gIGlmICh0YXJnZXRJZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKSByZXR1cm4gc3RhdGVcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHRhcmdldElkLFxuICAgIGhpc3Rvcnk6IFsuLi5zdGF0ZS5oaXN0b3J5LCBzdGF0ZS5jdXJyZW50U2NyZWVuSWRdLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3REZW1vRW50cnkoc3RhdGUsIGVudHJ5SWQsIHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnkgPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnb0JhY2tEZW1vKHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGhpc3RvcnkgPSBzdGF0ZS5oaXN0b3J5LnNsaWNlKDAsIC0xKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuaGlzdG9yeVtzdGF0ZS5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgIGhpc3RvcnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGVtbyhzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7IGVycm9yOiBudWxsIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9XG4gIH1cblxuICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgaW5mbykge1xuICAgIGNvbnNvbGUuZXJyb3IoYFt3aXJlZnJhbWU6JHt0aGlzLnByb3BzLnNjb3BlIHx8ICd1bmtub3duJ31dYCwgZXJyb3IsIGluZm8pXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICYmIHByZXZpb3VzUHJvcHMucmVzZXRLZXkgIT09IHRoaXMucHJvcHMucmVzZXRLZXkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZXJyb3IpIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgY29uc3QgeyBzY3JlZW5JZCwgc291cmNlLCBzY29wZSB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWVycm9yLWNhcmRcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgPHN0cm9uZz57c2NvcGUgPT09ICdzY3JlZW4nID8gYFNjcmVlbjogJHtzY3JlZW5JZH1gIDogJ0JvYXJkIGVycm9yJ308L3N0cm9uZz5cbiAgICAgICAge3NvdXJjZSA/IDxzcGFuPlNvdXJjZToge3NvdXJjZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPHNwYW4+TWVzc2FnZToge3RoaXMuc3RhdGUuZXJyb3IubWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDxwcmU+e3RoaXMuc3RhdGUuZXJyb3Iuc3RhY2t9PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsICJjb25zdCBTY3JlZW5JZGVudGl0eUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5JZGVudGl0eVByb3ZpZGVyKHsgc2NyZWVuSWQsIGNoaWxkcmVuIH0pIHtcbiAgaWYgKCFzY3JlZW5JZCkgdGhyb3cgbmV3IEVycm9yKCdTY3JlZW5JZGVudGl0eVByb3ZpZGVyIHJlcXVpcmVzIHNjcmVlbklkJylcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzY3JlZW5JZH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9TY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNjcmVlbklkKCkge1xuICBjb25zdCBzY3JlZW5JZCA9IFJlYWN0LnVzZUNvbnRleHQoU2NyZWVuSWRlbnRpdHlDb250ZXh0KVxuICBpZiAoIXNjcmVlbklkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VTY3JlZW5JZCBtdXN0IGJlIHVzZWQgaW5zaWRlIGEgcmVuZGVyZWQgc2NyZWVuJylcbiAgfVxuICByZXR1cm4gc2NyZWVuSWRcbn1cbiIsICIvKipcbiAqIFx1NzBFRFx1NTMzQVx1NEUwRVx1OERGM1x1OEY2Q1x1NzY4NFx1NTUyRlx1NEUwMFx1NTk1MVx1N0VBNlx1RkYxQVx1NTE0M1x1N0QyMFx1NUUyNiBkYXRhLWZsb3ctdG8gXHU1MzczXHU1M0VGXHU1QkZDXHU4MjJBXHUzMDAyXG4gKiBTY3JlZW5GcmFtZSBcdTU5RDRcdTYyNThcdTcwQjlcdTUxRkJcdTUxNUNcdTVFOTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMUFcdTUyQTFcdTUxOTlcdTYyMTBcdTg4Rjggc3Bhbi9kaXYgXHU1M0VBXHU2NzA5XHU1QzVFXHU2MDI3XHUzMDAxXHU2Q0ExXHU2NzA5IG9uQ2xpY2tcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGbG93VGFyZ2V0SWQoc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGlmICghc3RhcnRFbCB8fCB0eXBlb2Ygc3RhcnRFbC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbFxuICBjb25zdCBlbCA9IHN0YXJ0RWwuY2xvc2VzdCgnW2RhdGEtZmxvdy10b10nKVxuICBpZiAoIWVsKSByZXR1cm4gbnVsbFxuICBpZiAocm9vdEVsICYmIHR5cGVvZiByb290RWwuY29udGFpbnMgPT09ICdmdW5jdGlvbicgJiYgIXJvb3RFbC5jb250YWlucyhlbCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHRvID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZsb3ctdG8nKVxuICByZXR1cm4gdG8gfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCByb290RWwsIG5hdmlnYXRlKSB7XG4gIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChldmVudD8udGFyZ2V0LCByb290RWwpXG4gIGlmICghdG8pIHJldHVybiBmYWxzZVxuICBldmVudC5wcmV2ZW50RGVmYXVsdD8uKClcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICBuYXZpZ2F0ZSh0bylcbiAgcmV0dXJuIHRydWVcbn1cbiIsICJjb25zdCBUWVBFX0xBQkVMUyA9IHtcbiAgY29tbWVudDogJ1x1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXG4gIHRleHQ6ICdcdTRGRUVcdTY1MzlcdTY1ODdcdTVCNTcnLFxuICBvcmRlcjogJ1x1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RicsXG4gIHJlbW92ZTogJ1x1NTIyMFx1OTY2NFx1ODI4Mlx1NzBCOScsXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVNlbGVjdG9yVG9rZW4odmFsdWUpIHtcbiAgaWYgKGdsb2JhbFRoaXMuQ1NTPy5lc2NhcGUpIHJldHVybiBnbG9iYWxUaGlzLkNTUy5lc2NhcGUoU3RyaW5nKHZhbHVlKSlcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvW15hLXpBLVowLTlfLV0vZywgKGNoYXIpID0+IGBcXFxcJHtjaGFyfWApXG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHJpYnV0ZVZhbHVlKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG59XG5cbmZ1bmN0aW9uIGNsYXNzZXNPZihlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudD8uY2xhc3NMaXN0KSByZXR1cm4gW11cbiAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jbGFzc0xpc3QpLmZpbHRlcihCb29sZWFuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCdXNpbmVzc0NsYXNzTmFtZShuYW1lKSB7XG4gIHJldHVybiAhIW5hbWUgJiYgIW5hbWUuc3RhcnRzV2l0aCgnd2YtJykgJiYgIW5hbWUuc3RhcnRzV2l0aCgnaXMtJylcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JTY29wZShzY3JlZW5JZCkge1xuICByZXR1cm4gYFtkYXRhLXNjcmVlbi1pZD1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoc2NyZWVuSWQpfVwiXWBcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JJc1VuaXF1ZShzY3JlZW5Sb290LCBzZWxlY3Rvcikge1xuICB0cnkge1xuICAgIHJldHVybiBzY3JlZW5Sb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmxlbmd0aCA9PT0gMVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBlbGVtZW50U2VnbWVudChlbGVtZW50KSB7XG4gIGNvbnN0IHRhZyA9IChlbGVtZW50LnRhZ05hbWUgfHwgJ2RpdicpLnRvTG93ZXJDYXNlKClcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXMuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG4gIGNvbnN0IHVzYWJsZSA9IGJ1c2luZXNzLmxlbmd0aCA+IDAgPyBidXNpbmVzcyA6IGNsYXNzZXMuZmlsdGVyKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgY29uc3QgY2xhc3NQYXJ0ID0gdXNhYmxlLnNsaWNlKDAsIDIpLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJylcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgcmV0dXJuIGAke3RhZ30ke2NsYXNzUGFydH0ke2tleVBhcnR9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuSWQpIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuSWQpIHJldHVybiAnJ1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGVsZW1lbnQuaWQpfWBcblxuICBjb25zdCBzY29wZSA9IHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlc09mKGVsZW1lbnQpLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuXG4gIGZvciAoY29uc3QgbmFtZSBvZiBidXNpbmVzcykge1xuICAgIGNvbnN0IGxvY2FsID0gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9JHtrZXlQYXJ0fWBcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgaWYgKGJ1c2luZXNzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zdCBsb2NhbCA9IGJ1c2luZXNzLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJykgKyBrZXlQYXJ0XG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGNvbnN0IHNlZ21lbnRzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQpIHtcbiAgICAgIHNlZ21lbnRzLnVuc2hpZnQoYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oY3VycmVudC5pZCl9YClcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGxldCBzZWdtZW50ID0gZWxlbWVudFNlZ21lbnQoY3VycmVudClcbiAgICBjb25zdCBwYXJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgICBpZiAocGFyZW50ICYmIHBhcmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICAgIGNvbnN0IHBlZXJzID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4gfHwgW10pLmZpbHRlcihcbiAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGFnTmFtZSA9PT0gY3VycmVudC50YWdOYW1lICYmIGVsZW1lbnRTZWdtZW50KGl0ZW0pID09PSBzZWdtZW50LFxuICAgICAgKVxuICAgICAgaWYgKHBlZXJzLmxlbmd0aCA+IDEpIHNlZ21lbnQgKz0gYDpudGgtb2YtdHlwZSgke3BlZXJzLmluZGV4T2YoY3VycmVudCkgKyAxfSlgXG4gICAgfVxuICAgIHNlZ21lbnRzLnVuc2hpZnQoc2VnbWVudClcbiAgICBjb25zdCBsb2NhbCA9IHNlZ21lbnRzLmpvaW4oJyA+ICcpXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgICBjdXJyZW50ID0gcGFyZW50XG4gIH1cblxuICByZXR1cm4gYCR7c2NvcGV9ICR7c2VnbWVudHMuam9pbignID4gJykgfHwgZWxlbWVudFNlZ21lbnQoZWxlbWVudCl9YFxufVxuXG5mdW5jdGlvbiBkaXNwbGF5TGFiZWwoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlbGVtZW50LmlkfWBcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBzZW1hbnRpYyA9IGNsYXNzZXMuZmluZChpc0J1c2luZXNzQ2xhc3NOYW1lKSB8fCBjbGFzc2VzLmZpbmQoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICByZXR1cm4gc2VtYW50aWMgPyBgLiR7c2VtYW50aWN9YCA6IChlbGVtZW50LnRhZ05hbWUgfHwgJ25vZGUnKS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIHJlYWRUZXh0KGVsZW1lbnQpIHtcbiAgY29uc3QgdmFsdWUgPSAndmFsdWUnIGluIGVsZW1lbnQgJiYgdHlwZW9mIGVsZW1lbnQudmFsdWUgPT09ICdzdHJpbmcnXG4gICAgPyBlbGVtZW50LnZhbHVlXG4gICAgOiBlbGVtZW50LnRleHRDb250ZW50IHx8ICcnXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG4gIHJldHVybiBub3JtYWxpemVkLmxlbmd0aCA+IDI0MCA/IGAke25vcm1hbGl6ZWQuc2xpY2UoMCwgMjM3KX0uLi5gIDogbm9ybWFsaXplZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFJldmlld1RhcmdldCh0YXJnZXQsIGNvbnRlbnRSb290KSB7XG4gIGxldCBjdXJyZW50ID0gdGFyZ2V0Py5ub2RlVHlwZSA9PT0gMSA/IHRhcmdldCA6IHRhcmdldD8ucGFyZW50RWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkIHx8IGNsYXNzZXNPZihjdXJyZW50KS5sZW5ndGggPiAwKSByZXR1cm4gY3VycmVudFxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4pIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuKSByZXR1cm4gbnVsbFxuICBjb25zdCBhbmNlc3RvcnMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBhbmNlc3RvcnMudW5zaGlmdCh7XG4gICAgICBlbGVtZW50OiBjdXJyZW50LFxuICAgICAgbGFiZWw6IGRpc3BsYXlMYWJlbChjdXJyZW50KSxcbiAgICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGN1cnJlbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIH0pXG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50LFxuICAgIGNvbnRlbnRSb290LFxuICAgIHNjcmVlbklkOiBzY3JlZW4uaWQsXG4gICAgc2NyZWVuVGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICBzb3VyY2VIaW50OiBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGAsXG4gICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgdGFnTmFtZTogKGVsZW1lbnQudGFnTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSxcbiAgICBjbGFzc05hbWVzOiBjbGFzc2VzT2YoZWxlbWVudCksXG4gICAgY3VycmVudFRleHQ6IHJlYWRUZXh0KGVsZW1lbnQpLFxuICAgIGFuY2VzdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpdGVtUmVxdWVzdChpdGVtKSB7XG4gIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0JykgcmV0dXJuIGBcdTRGRUVcdTY1MzlcdTRFM0FcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAnb3JkZXInKSByZXR1cm4gYFx1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdyZW1vdmUnKSByZXR1cm4gYFx1NTIyMFx1OTY2NFx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31gXG4gIHJldHVybiBpdGVtLmluc3RydWN0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZpZXdUYXJnZXRzKGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbT8udGFyZ2V0cykgJiYgaXRlbS50YXJnZXRzLmxlbmd0aCA+IDApIHJldHVybiBpdGVtLnRhcmdldHNcbiAgaWYgKCFpdGVtPy5zZWxlY3RvcikgcmV0dXJuIFtdXG4gIHJldHVybiBbe1xuICAgIHNjcmVlbklkOiBpdGVtLnNjcmVlbklkLFxuICAgIHNjcmVlblRpdGxlOiBpdGVtLnNjcmVlblRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGl0ZW0uc291cmNlSGludCxcbiAgICBzZWxlY3RvcjogaXRlbS5zZWxlY3RvcixcbiAgICBjdXJyZW50VGV4dDogaXRlbS5jdXJyZW50VGV4dCxcbiAgfV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcHJvamVjdD8ubmFtZSB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCJ1xuXG4gIGNvbnN0IGxpbmVzID0gW1xuICAgIGBcdThCRjdcdTRGRUVcdTY1MzlcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEJcdTMwMEMke3Byb2plY3ROYW1lfVx1MzAwRFx1MzAwMmAsXG4gICAgJycsXG4gICAgJ1x1NEZFRVx1NjUzOVx1N0VBNlx1Njc1Rlx1RkYxQScsXG4gICAgJy0gXHU1M0VBXHU0RkVFXHU2NTM5XHU0RTFBXHU1MkExIHNyYy9cdUZGMUJcdTRFMERcdTg5ODFcdTRGRUVcdTY1MzkgZnJhbWV3b3JrLyBcdTYyMTYgZGlzdC9hcHAuanNcdTMwMDInLFxuICAgICctIFx1OTAxQVx1OEZDNyBET00gXHU5MDA5XHU2MkU5XHU1NjY4XHU1NzI4IEpTWCBcdTRFMkRcdTY0MUNcdTdEMjJcdTVCRjlcdTVFOTRcdTc2ODQgaWRcdTMwMDFjbGFzc05hbWUgXHU2MjE2IGRhdGEtd2Yta2V5XHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTc1NTlcdTYyNDBcdTY3MDlcdThCRURcdTRFNDkgY2xhc3NcdTMwMDFcdTUxNzNcdTk1MkVcdTgyODJcdTcwQjkgaWQgXHU1NDhDXHU5MUNEXHU1OTBEXHU2NTcwXHU2MzZFXHU4MjgyXHU3MEI5XHU3Njg0IGRhdGEtd2Yta2V5XHVGRjFCXHU2NUIwXHU1ODlFXHU4MjgyXHU3MEI5XHU0RTVGXHU5MDc1XHU1Qjg4XHU1NDBDXHU0RTAwXHU1NDdEXHU1NDBEXHU4OUM0XHU1MjE5XHUzMDAyJyxcbiAgICAnLSBcdTRGRUVcdTY1Mzkgc2NyZWVucy9sYXlvdXRzIFx1NjVGNlx1NEZERFx1NzU1OVx1MzAwQ1x1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RVx1MzAwRFx1RkYwQ1x1NUU3Nlx1NjI4QVx1MzAwQ1x1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RVx1MzAwRFx1NTNDQSBAd2lyZWZyYW1lLXNraWxsIFx1NjZGNFx1NjVCMFx1NEUzQVx1NUY1M1x1NTI0RCBza2lsbCBcdTcyNDhcdTY3MkNcdTMwMDInLFxuICAgICctIFx1NEZERFx1NjMwMSBwcm9qZWN0LmxpbmtzIFx1NEUzQVx1OTg3NVx1OTc2Mlx1NkQ0MVx1NzY4NFx1NTUyRlx1NEUwMFx1OEZCOVx1NjU3MFx1NjM2RVx1RkYxQlx1NUI4Q1x1NjIxMFx1NTQwRVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NUU3Nlx1OUE4Q1x1OEJDMVx1NzUzQlx1Njc3Rlx1MzAwMVx1NkYxNFx1NzkzQVx1NTQ4Q1x1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRlx1MzAwMicsXG4gIF1cblxuICBpZiAoIWl0ZW1zPy5sZW5ndGgpIHtcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyJylcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXZpZXdUYXJnZXRzKGl0ZW0pXG4gICAgbGluZXMucHVzaCgnJywgYCMjIFx1NEZFRVx1NjUzOSAke2l0ZW1JbmRleCArIDF9XHVGRjFBJHtUWVBFX0xBQkVMU1tpdGVtLnR5cGVdIHx8IFRZUEVfTEFCRUxTLmNvbW1lbnR9YClcbiAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHNjcmVlbklkID0gdGFyZ2V0LnNjcmVlbklkIHx8IGl0ZW0uc2NyZWVuSWRcbiAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICcnLFxuICAgICAgICBgXHU3NkVFXHU2ODA3ICR7dGFyZ2V0SW5kZXggKyAxfVx1RkYxQSR7dGFyZ2V0LnNjcmVlblRpdGxlIHx8IGl0ZW0uc2NyZWVuVGl0bGUgfHwgc2NyZWVuSWQgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1OTg3NVx1OTc2Mid9YCxcbiAgICAgICAgYFx1OTg3NVx1OTc2MiBJRFx1RkYxQSR7c2NyZWVuSWQgfHwgJ1x1NjcyQVx1NzdFNSd9YCxcbiAgICAgICAgYFx1NkU5MFx1NzgwMVx1NjNEMFx1NzkzQVx1RkYxQSR7dGFyZ2V0LnNvdXJjZUhpbnQgfHwgaXRlbS5zb3VyY2VIaW50IHx8IChzY3JlZW5JZCA/IGBzcmMvc2NyZWVucy8ke3NjcmVlbklkfS5qc3hgIDogJ1x1OEJGN1x1NjQxQ1x1N0QyMlx1OTAwOVx1NjJFOVx1NTY2OCcpfWAsXG4gICAgICAgICdET00gXHU5MDA5XHU2MkU5XHU1NjY4XHVGRjFBJyxcbiAgICAgICAgYFxcYCR7dGFyZ2V0LnNlbGVjdG9yfVxcYGAsXG4gICAgICApXG4gICAgICBpZiAodGFyZ2V0LmN1cnJlbnRUZXh0KSBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5XHVGRjFBJywgdGFyZ2V0LmN1cnJlbnRUZXh0KVxuICAgIH0pXG4gICAgbGluZXMucHVzaCgnJywgJ1x1NEZFRVx1NjUzOVx1ODk4MVx1NkM0Mlx1RkYxQScsIGl0ZW1SZXF1ZXN0KGl0ZW0pKVxuICB9KVxuXG4gIGxpbmVzLnB1c2goXG4gICAgJycsXG4gICAgJyMjIFx1NUI4Q1x1NjIxMFx1NjgwN1x1NTFDNicsXG4gICAgJy0gXHU5MDEwXHU5ODc5XHU1QjhDXHU2MjEwXHU0RUU1XHU0RTBBXHU0RkVFXHU2NTM5XHVGRjFCXHU4MkU1XHU5MDA5XHU2MkU5XHU1NjY4XHU1QkY5XHU1RTk0XHU1MTcxXHU0RUFCIGxheW91dFx1RkYwQ1x1OEJGN1x1NEZFRVx1NjUzOVx1NzcxRlx1NUI5RVx1NUI5QVx1NEU0OVx1NEY0RFx1N0Y2RVx1RkYwQ1x1NEUwRFx1ODk4MVx1NTcyOCBzY3JlZW4gXHU0RTJEXHU1OTBEXHU1MjM2XHU1QjlFXHU3M0IwXHUzMDAyJyxcbiAgICAnLSBcdTRFMERcdTc1MjggRE9NIFx1NUM0Mlx1N0VBN1x1NjIxNiBudGgtY2hpbGQgXHU2NkZGXHU0RUUzXHU1REYyXHU2NzA5XHU3Njg0XHU3QTMzXHU1QjlBXHU0RTFBXHU1MkExXHU5MDA5XHU2MkU5XHU1NjY4XHUzMDAyJyxcbiAgICAnLSBcdTY3ODRcdTVFRkFcdTYyMTBcdTUyOUZcdTU0MEVcdTY4QzBcdTY3RTVcdTUzRDdcdTVGNzFcdTU0Q0RcdTk4NzVcdTk3NjJcdTUzQ0FcdTUxNzZcdTRFMEFcdTRFMEJcdTZFMzhcdThERjNcdThGNkNcdTMwMDInLFxuICApXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxufVxuXG5leHBvcnQgY29uc3QgUkVWSUVXX1RZUEVfTEFCRUxTID0gVFlQRV9MQUJFTFNcbiIsICJpbXBvcnQgeyBpc1Njcm9sbGFibGVPdmVyZmxvdyB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuY29uc3QgU1RZTEVfS0VZUyA9IFtcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdtaW5XaWR0aCcsXG4gICdtaW5IZWlnaHQnLFxuICAnb3ZlcmZsb3cnLFxuICAnb3ZlcmZsb3dYJyxcbiAgJ292ZXJmbG93WScsXG4gICdtYXhXaWR0aCcsXG4gICdtYXhIZWlnaHQnLFxuXVxuXG4vKiogXHU4MjgyXHU3MEI5XHU1RjUzXHU1MjREXHU2NjJGXHU1NDI2XHU1NkUwIG92ZXJmbG93IFx1NEVBN1x1NzUxRlx1NTNFRlx1NkVEQVx1NTJBOFx1NkVBMlx1NTFGQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShlbCkge1xuICBpZiAoIWVsIHx8IGVsLm5vZGVUeXBlICE9PSAxKSByZXR1cm4gZmFsc2VcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0ICsgMVxuICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBlbC5zY3JvbGxXaWR0aCA+IGVsLmNsaWVudFdpZHRoICsgMVxuICByZXR1cm4gY2FuWSB8fCBjYW5YXG59XG5cbmZ1bmN0aW9uIGRlcHRoRnJvbShyb290RWwsIGVsKSB7XG4gIGxldCBkZXB0aCA9IDBcbiAgbGV0IG5vZGUgPSBlbFxuICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByb290RWwpIHtcbiAgICBkZXB0aCArPSAxXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBkZXB0aFxufVxuXG4vKipcbiAqIFx1NjUzNlx1OTZDNlx1OTcwMFx1NjQ5MVx1NUYwMFx1NzY4NFx1ODI4Mlx1NzBCOVx1RkYxQVx1NTNFRlx1NkVEQVx1NTJBOFx1ODI4Mlx1NzBCOSArIFx1NEUwQVx1NkVBRlx1NTIzMCByb290IFx1NzY4NFx1Nzk1Nlx1NTE0OFx1MzAwMlxuICogXHU2REYxXHU4MjgyXHU3MEI5XHU1NzI4XHU1MjREXHVGRjBDXHU1MTQ4XHU2NDkxXHU1MTg1XHU1QzQyXHU1MThEXHU2NDkxXHU1OTE2XHU1OEYzXHVGRjA4XHU5MDdGXHU1MTREIGdyaWQgLyB3aWR0aDoxMDAlIFx1NjI4QVx1NTkxNlx1Njg0Nlx1NTM2MVx1NkI3Qlx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpIHtcbiAgaWYgKCFyb290RWwpIHJldHVybiBbXVxuICBjb25zdCBzY3JvbGxhYmxlcyA9IFtdXG4gIGNvbnN0IHZpc2l0ID0gKG5vZGUpID0+IHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gPyBBcnJheS5mcm9tKG5vZGUuY2hpbGRyZW4pIDogW11cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB2aXNpdChjaGlsZClcbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsIHx8IGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShub2RlKSkgc2Nyb2xsYWJsZXMucHVzaChub2RlKVxuICB9XG4gIHZpc2l0KHJvb3RFbClcblxuICBjb25zdCBzZXQgPSBuZXcgU2V0KHNjcm9sbGFibGVzKVxuICBmb3IgKGNvbnN0IGVsIG9mIHNjcm9sbGFibGVzKSB7XG4gICAgLy8gcm9vdCBcdTY3MkNcdThFQUJcdTVERjJcdTU3MjhcdTk2QzZcdTU0MDhcdTRFMkRcdUZGMUJcdTRFQ0VcdTVCODNcdTc2ODRcdTcyMzZcdTgyODJcdTcwQjlcdTdFRTdcdTdFRURcdTRFMEFcdTZFQUZcdTRGMUFcdThEOEFcdThGQzcgc2NyZWVuIFx1OEZCOVx1NzU0Q1x1RkYwQ1xuICAgIC8vIFx1NjI4QSBTY3JlZW5GcmFtZVx1MzAwMWNhbnZhc1x1MzAwMWJvYXJkIFx1NzUxQVx1ODFGMyBib2R5L2h0bWwgXHU0RTAwXHU1RTc2XHU2NTM5XHU1MTk5XHUzMDAyXG4gICAgaWYgKGVsID09PSByb290RWwpIGNvbnRpbnVlXG4gICAgbGV0IG5vZGUgPSBlbC5wYXJlbnRFbGVtZW50XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIHNldC5hZGQobm9kZSlcbiAgICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi5zZXRdLnNvcnQoKGEsIGIpID0+IGRlcHRoRnJvbShyb290RWwsIGIpIC0gZGVwdGhGcm9tKHJvb3RFbCwgYSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbmFwc2hvdElubGluZUJveChlbCkge1xuICBjb25zdCBvdXQgPSB7fVxuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSBvdXRba2V5XSA9IGVsLnN0eWxlW2tleV0gfHwgJydcbiAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUlubGluZUJveChlbCwgc25hcHNob3QpIHtcbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykge1xuICAgIGVsLnN0eWxlW2tleV0gPSBzbmFwc2hvdFtrZXldIHx8ICcnXG4gIH1cbn1cblxuLyoqXG4gKiBvZmZzZXRUb3AgLyBvZmZzZXRMZWZ0IFx1NzZGOFx1NUJGOSBvZmZzZXRQYXJlbnRcdUZGMENcdTgwMENcdTRFMERcdTRFMDBcdTVCOUFcdTc2RjhcdTVCRjlcdTc2RjRcdTYzQTVcdTcyMzZcdTgyODJcdTcwQjlcdTMwMDJcbiAqIFx1NTQwRVx1NTNGMFx1OTg3NVx1OTFDQ1x1OEZERVx1N0VFRFx1NzY4NCBzdGF0aWMgXHU1QkI5XHU1NjY4XHU5MDFBXHU1RTM4XHU1MTcxXHU0RUFCIHNjcmVlbiByb290IFx1NEY1Q1x1NEUzQSBvZmZzZXRQYXJlbnRcdUZGMENcbiAqIFx1NTZFMFx1NkI2NFx1OTcwMFx1ODk4MVx1NTE0OFx1NjM2Mlx1N0I5N1x1NTIzMFx1NUY1M1x1NTI0RFx1NzIzNlx1ODI4Mlx1NzBCOVx1NTc1MFx1NjgwN1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OTAxMFx1NUM0Mlx1OTFDRFx1NTkwRFx1N0QyRlx1NTJBMFx1NTQwQ1x1NEUwMFx1NkJCNVx1NTA0Rlx1NzlGQlx1MzAwMlxuICovXG5mdW5jdGlvbiBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgYXhpcykge1xuICBjb25zdCBvZmZzZXRLZXkgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0TGVmdCcgOiAnb2Zmc2V0VG9wJ1xuICBjb25zdCByZWN0U3RhcnQgPSBheGlzID09PSAneCcgPyAnbGVmdCcgOiAndG9wJ1xuICBjb25zdCByZWN0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICBjb25zdCBsYXlvdXRTaXplID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG4gIGNvbnN0IHNjcm9sbEtleSA9IGF4aXMgPT09ICd4JyA/ICdzY3JvbGxMZWZ0JyA6ICdzY3JvbGxUb3AnXG4gIGNvbnN0IGNoaWxkT2Zmc2V0ID0gY2hpbGRbb2Zmc2V0S2V5XSB8fCAwXG5cbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwpIHJldHVybiBjaGlsZE9mZnNldFxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ICYmIGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwub2Zmc2V0UGFyZW50KSB7XG4gICAgcmV0dXJuIGNoaWxkT2Zmc2V0IC0gKGVsW29mZnNldEtleV0gfHwgMClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IHBhcmVudFJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNoaWxkUmVjdCA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgcmVuZGVyZWRTaXplID0gcGFyZW50UmVjdFtyZWN0U2l6ZV1cbiAgICBjb25zdCBzY2FsZSA9IGVsW2xheW91dFNpemVdID4gMCAmJiByZW5kZXJlZFNpemUgPiAwXG4gICAgICA/IHJlbmRlcmVkU2l6ZSAvIGVsW2xheW91dFNpemVdXG4gICAgICA6IDFcbiAgICBjb25zdCBzdGFydCA9IChjaGlsZFJlY3RbcmVjdFN0YXJ0XSAtIHBhcmVudFJlY3RbcmVjdFN0YXJ0XSkgLyBzY2FsZVxuICAgICAgKyAoZWxbc2Nyb2xsS2V5XSB8fCAwKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoc3RhcnQpKSByZXR1cm4gc3RhcnRcbiAgfVxuXG4gIHJldHVybiBjaGlsZE9mZnNldFxufVxuXG4vKipcbiAqIG92ZXJmbG93OnZpc2libGUgXHU2NUY2XHU5MEU4XHU1MjA2XHU2RDRGXHU4OUM4XHU1NjY4IHNjcm9sbFdpZHRoIFx1MjI0OCBjbGllbnRXaWR0aFx1RkYwQ1xuICogXHU2MjQwXHU0RUU1XHU1MThEXHU2MjZCXHU1QjUwXHU4MjgyXHU3MEI5IG9mZnNldCBcdThGQjlcdTc1NENcdUZGMENcdTkwN0ZcdTUxNERcdTVCQkRcdTg4NjhcdTY0OTFcdTRFMERcdTVGMDBcdTU5MTZcdTY4NDZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpIHtcbiAgbGV0IHdpZHRoID0gTWF0aC5tYXgoZWwuc2Nyb2xsV2lkdGggfHwgMCwgZWwub2Zmc2V0V2lkdGggfHwgMClcbiAgbGV0IGhlaWdodCA9IE1hdGgubWF4KGVsLnNjcm9sbEhlaWdodCB8fCAwLCBlbC5vZmZzZXRIZWlnaHQgfHwgMClcbiAgY29uc3QgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbiA/IEFycmF5LmZyb20oZWwuY2hpbGRyZW4pIDogW11cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneCcpICsgKGNoaWxkLm9mZnNldFdpZHRoIHx8IDApKVxuICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd5JykgKyAoY2hpbGQub2Zmc2V0SGVpZ2h0IHx8IDApKVxuICB9XG4gIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlFeHBhbmRlZEJveChlbCkge1xuICBlbC5zdHlsZS5tYXhXaWR0aCA9ICdub25lJ1xuICBlbC5zdHlsZS5tYXhIZWlnaHQgPSAnbm9uZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3cgPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dYID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WSA9ICd2aXNpYmxlJ1xuICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpXG4gIGVsLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgZWwuc3R5bGUubWluV2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUubWluSGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxufVxuXG4vKiogXHU2NDkxXHU1RjAwIHJvb3QgXHU1MTg1XHU2MjQwXHU2NzA5XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1M0NBXHU1MTc2XHU3OTU2XHU1MTQ4XHVGRjFCXHU4RkQ0XHU1NkRFXHU3NTI4XHU0RThFXHU2NTM2XHU4RDc3XHU3Njg0XHU1RkVCXHU3MTY3XHU1MjE3XHU4ODY4ICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kU2NyZWVuQ29udGVudChyb290RWwpIHtcbiAgY29uc3Qgbm9kZXMgPSBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbClcbiAgY29uc3Qgc25hcHNob3RzID0gbm9kZXMubWFwKChlbCkgPT4gKHsgZWwsIHN0eWxlOiBzbmFwc2hvdElubGluZUJveChlbCkgfSkpXG4gIGZvciAoY29uc3QgeyBlbCB9IG9mIHNuYXBzaG90cykgYXBwbHlFeHBhbmRlZEJveChlbClcbiAgLy8gXHU1QjUwXHU3RUE3XHU2NDkxXHU1RjAwXHU1NDBFXHVGRjBDXHU2ODM5XHU1MThEXHU5MUNGXHU0RTAwXHU2QjIxXHVGRjBDXHU1NDAzXHU2Mzg5XHU2QjhCXHU0RjU5XHU2RUEyXHU1MUZBXG4gIGFwcGx5RXhwYW5kZWRCb3gocm9vdEVsKVxuICByZXR1cm4gc25hcHNob3RzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoc25hcHNob3RzKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzbmFwc2hvdHMpKSByZXR1cm5cbiAgZm9yIChjb25zdCB7IGVsLCBzdHlsZSB9IG9mIHNuYXBzaG90cykgcmVzdG9yZUlubGluZUJveChlbCwgc3R5bGUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlQ29udGVudEJveChyb290RWwpIHtcbiAgcmV0dXJuIG1lYXN1cmVJbnRyaW5zaWNCb3gocm9vdEVsKVxufVxuXG4vKipcbiAqIFx1NURFNVx1NTE3N1x1NjgwRlx1NUM1NVx1NUYwMC9cdTY1MzZcdThENzdcdTc2RUVcdTY4MDdcdUZGMUFcbiAqIFx1NjcwOVx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MkZFXHU5MDA5XHU5NkM2XHU1NDA4XHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUxNjhcdTkwRThcdTVDNEZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxJZHMpIHtcbiAgaWYgKHNlbGVjdGVkSWRzIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgaWYgKHNlbGVjdGVkSWRzLnNpemUgPiAwKSByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0ZWRJZHMpICYmIHNlbGVjdGVkSWRzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9XG4gIHJldHVybiBbLi4uYWxsSWRzXVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFNjcmVlbklkZW50aXR5UHJvdmlkZXIgfSBmcm9tICcuLi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcbmltcG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQgfSBmcm9tICcuLi91aS9mbG93LXRhcmdldC5qcydcbmltcG9ydCB7IGZpbmRSZXZpZXdUYXJnZXQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7XG4gIGNvbGxhcHNlU2NyZWVuQ29udGVudCxcbiAgZXhwYW5kU2NyZWVuQ29udGVudCxcbiAgbWVhc3VyZUNvbnRlbnRCb3gsXG59IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHtcbiAgYmVnaW5Db250ZW50RHJhZ1Njcm9sbCxcbiAgZW5kQ29udGVudERyYWdTY3JvbGwsXG4gIG1vdmVDb250ZW50RHJhZ1Njcm9sbCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuRnJhbWUoe1xuICBzY3JlZW4sXG4gIHZpZXdwb3J0LFxuICBtb2RlLFxuICBpbmRleCA9IDAsXG4gIGZvY3VzZWQgPSBmYWxzZSxcbiAgb25FeHBvcnQsXG4gIGV4cGFuZGVkID0gZmFsc2UsXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBjYW52YXNMb2NrZWQgPSBmYWxzZSxcbiAgc2NhbGUgPSAxLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBjb250ZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcG9pbnRlckRvd25UYXJnZXRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZXhwYW5kU25hcHNob3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgaG92ZXJSZXZpZXdFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnU2Nyb2xsaW5nLCBzZXREcmFnU2Nyb2xsaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRCb3gsIHNldEV4cGFuZGVkQm94XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290ID0gY29udGVudFJlZi5jdXJyZW50XG4gICAgaWYgKCFyb290IHx8ICFzY3JlZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKCFleHBhbmRlZCkge1xuICAgICAgc2V0RXhwYW5kZWRCb3gobnVsbClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gZXhwYW5kU2NyZWVuQ29udGVudChyb290KVxuICAgIHNldEV4cGFuZGVkQm94KG1lYXN1cmVDb250ZW50Qm94KHJvb3QpKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSwgW2V4cGFuZGVkLCBzY3JlZW4/LmlkLCB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjYW52YXNMb2NrZWQsIHJldmlld0VuYWJsZWQsIHNjcmVlbj8uaWRdKVxuXG4gIGlmICghc2NyZWVuKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IENvbXBvbmVudCA9IHNjcmVlbi5jb21wb25lbnRcbiAgY29uc3QgZnJhbWVDbGFzcyA9IFtcbiAgICAnd2Ytc2NyZWVuLWNocm9tZScsXG4gICAgbW9kZSA9PT0gJ2NhbnZhcycgJiYgZm9jdXNlZCA/ICdpcy1mb2N1c2VkJyA6ICcnLFxuICAgIGV4cGFuZGVkID8gJ2lzLWV4cGFuZGVkJyA6ICcnLFxuICAgIGB3Zi1zY3JlZW4tJHttb2RlfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKVxuXG4gIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZXZlbnQpID0+IHtcbiAgICBwb2ludGVyRG93blRhcmdldFJlZi5jdXJyZW50ID0gZXZlbnQudGFyZ2V0XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIC8vIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1ODQzRFx1NTIzMFx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlxuICAgIGlmIChjYW52YXNMb2NrZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBcdTVERjJcdTVDNTVcdTVGMDBcdTY1RTBcdTUzRUZcdTZFREFcdTUzM0FcdTU3REZcdUZGMENcdTRFMERcdTYyQTJcdTYzMDdcdTk0ODhcbiAgICBpZiAoZXhwYW5kZWQpIHJldHVyblxuICAgIGNvbnN0IHN0YXRlID0gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgY29udGVudFJlZi5jdXJyZW50LCB7IGxvY2tlZDogY2FudmFzTG9ja2VkLCBzY2FsZSB9KVxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IHN0YXRlXG4gICAgLy8gXHU3QjQ5XHU3NzFGXHU2QjYzXHU2MkQ2XHU4RkM3XHU5NjA4XHU1MDNDXHU1MThEIGNhcHR1cmVcdTMwMDJcdThGQzdcdTY1RTkgc2V0UG9pbnRlckNhcHR1cmUgXHU0RjFBXHU2MjhBIGNsaWNrIFx1OTFDRFx1NUI5QVx1NTQxMVx1NTIzMFxuICAgIC8vIC53Zi1zY3JlZW4tY29udGVudFx1RkYwQ1x1NUJGQ1x1ODFGNCBkYXRhLWZsb3ctdG8gXHU1OUQ0XHU2MjU4XHU0RTBFXHU3RUM0XHU0RUY2IG9uQ2xpY2sgXHU1MTY4XHU5MEU4XHU1OTMxXHU2NTQ4XHUzMDAyXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICAgIGlmICh0YXJnZXQgPT09IGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50KSByZXR1cm5cbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICB0YXJnZXQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gdGFyZ2V0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBjb25zdCB3YXNNb3ZlZCA9IHN0YXRlLm1vdmVkXG4gICAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudClcbiAgICBpZiAoIXdhc01vdmVkICYmIHN0YXRlLm1vdmVkKSB7XG4gICAgICBzZXREcmFnU2Nyb2xsaW5nKHRydWUpXG4gICAgICB0cnkge1xuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBpZ25vcmU6IFx1OTBFOFx1NTIwNlx1NzNBRlx1NTg4M1x1NTcyOCBwb2ludGVydXAgXHU1NDBFXHU4QzAzXHU3NTI4XHU0RjFBXHU2MjlCXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGNvbnN0IGRvd25UYXJnZXQgPSBwb2ludGVyRG93blRhcmdldFJlZi5jdXJyZW50XG4gICAgcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudCA9IG51bGxcbiAgICAvLyBwb2ludGVyIGNhcHR1cmUgXHU0RUNEXHU1M0VGXHU4MEZEXHU2MjhBIGNsaWNrLnRhcmdldCBcdTY1MzlcdTYyMTBcdTUxODVcdTVCQjlcdTY4MzlcdUZGMUJcdTU2REVcdTkwMDBcdTUyMzAgcG9pbnRlcmRvd24gXHU3NkVFXHU2ODA3XG4gICAgY29uc3Qgc3RhcnRFbCA9IGRvd25UYXJnZXQgJiYgcm9vdD8uY29udGFpbnMoZG93blRhcmdldCkgPyBkb3duVGFyZ2V0IDogZXZlbnQudGFyZ2V0XG4gICAgY29uc3QgdG8gPSBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3QpXG4gICAgaWYgKCF0bykgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgIG5hdmlnYXRlKHRvKVxuICB9XG5cbiAgY29uc3Qgb25SZXZpZXdDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgaWYgKCF0YXJnZXQpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIG9uUmV2aWV3U2VsZWN0Py4odGFyZ2V0LCBzY3JlZW4sIGNvbnRlbnRSZWYuY3VycmVudCwge1xuICAgICAgYWRkaXRpdmU6IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY2xlYXJSZXZpZXdIb3ZlciA9ICgpID0+IHtcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICB9XG5cbiAgY29uc3QgY29udGVudFN0eWxlID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3hcbiAgICA/IHsgd2lkdGg6IGV4cGFuZGVkQm94LndpZHRoLCBoZWlnaHQ6IGV4cGFuZGVkQm94LmhlaWdodCwgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9XG4gICAgOiB7IHdpZHRoOiB2aWV3cG9ydC53aWR0aCwgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQgfVxuXG4gIGNvbnN0IGZyYW1lV2lkdGggPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveCA/IGV4cGFuZGVkQm94LndpZHRoIDogdmlld3BvcnQud2lkdGhcblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uXG4gICAgICBjbGFzc05hbWU9e2ZyYW1lQ2xhc3N9XG4gICAgICBkYXRhLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgZGF0YS1leHBhbmRlZD17ZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IGZyYW1lV2lkdGggfX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtbGFiZWxcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS10aXRsZVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtYWN0aW9uc1wiPlxuICAgICAgICAgIHtvblRvZ2dsZUV4cGFuZCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cGFuZC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kKClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2V4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3NycgOiAnXHU1QzU1XHU1RjAwJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyAmJiBvbkV4cG9ydCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cG9ydC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uRXhwb3J0KClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgXHU1QkZDXHU1MUZBIFBOR1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e2NvbnRlbnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1jb250ZW50JHtkcmFnU2Nyb2xsaW5nID8gJyBpcy1kcmFnLXNjcm9sbGluZycgOiAnJ30ke2V4cGFuZGVkID8gJyBpcy1leHBhbmRlZCcgOiAnJ30ke3Jldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXtjb250ZW50U3R5bGV9XG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e29uUG9pbnRlck1vdmV9XG4gICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJMZWF2ZT17Y2xlYXJSZXZpZXdIb3Zlcn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e29uUmV2aWV3Q2xpY2t9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5jb25zdCBUUkFDS1BBRF9aT09NX1JBVEUgPSAwLjAwMTVcblxuZnVuY3Rpb24gbm9ybWFsaXplZFdoZWVsRGVsdGEoZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmRlbHRhTW9kZSA9PT0gMSkgcmV0dXJuIGV2ZW50LmRlbHRhWSAqIDE2XG4gIGlmIChldmVudC5kZWx0YU1vZGUgPT09IDIpIHJldHVybiBldmVudC5kZWx0YVkgKiAxMDBcbiAgcmV0dXJuIGV2ZW50LmRlbHRhWVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV4dFdoZWVsU2NhbGUoc2NhbGUsIGV2ZW50LCB7IHRyYWNrcGFkTW9kZSA9IGZhbHNlLCBzZW5zaXRpdml0eSA9IDAuNiB9ID0ge30pIHtcbiAgaWYgKCF0cmFja3BhZE1vZGUpIHJldHVybiBjbGFtcFNjYWxlKHNjYWxlICogKGV2ZW50LmRlbHRhWSA+IDAgPyAwLjkgOiAxLjEpKVxuICBjb25zdCBkZWx0YSA9IG5vcm1hbGl6ZWRXaGVlbERlbHRhKGV2ZW50KVxuICBpZiAoIWRlbHRhKSByZXR1cm4gc2NhbGVcbiAgcmV0dXJuIGNsYW1wU2NhbGUoc2NhbGUgKiBNYXRoLmV4cCgtZGVsdGEgKiBUUkFDS1BBRF9aT09NX1JBVEUgKiBzZW5zaXRpdml0eSkpXG59XG5cbi8qKiBcdTdFRDFcdTVCOUFcdTk3NUUgcGFzc2l2ZSB3aGVlbFx1RkYwQ1x1NjI0RFx1ODBGRFx1NTQwOFx1NkNENSBwcmV2ZW50RGVmYXVsdFx1RkYwOFJlYWN0IG9uV2hlZWwgXHU5RUQ4XHU4QkE0IHBhc3NpdmVcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kV2hlZWxab29tKFxuICBlbCxcbiAgZ2V0U2NhbGUsXG4gIHNldFNjYWxlLFxuICBnZXRMb2NrZWQgPSAoKSA9PiBmYWxzZSxcbiAgZ2V0T3B0aW9ucyA9ICgpID0+ICh7fSksXG4pIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShuZXh0V2hlZWxTY2FsZShnZXRTY2FsZSgpLCBldmVudCwgZ2V0T3B0aW9ucygpKSlcbiAgfVxuICBlbC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSlcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVdoZWVsWm9vbShlbGVtZW50UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGxvY2tlZCA9IGZhbHNlLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIGNvbnN0IG9wdGlvbnNSZWYgPSBSZWFjdC51c2VSZWYob3B0aW9ucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGxvY2tlZFJlZi5jdXJyZW50ID0gbG9ja2VkXG4gIG9wdGlvbnNSZWYuY3VycmVudCA9IG9wdGlvbnNcblxuICBSZWFjdC51c2VFZmZlY3QoXG4gICAgKCkgPT4gYmluZFdoZWVsWm9vbShcbiAgICAgIGVsZW1lbnRSZWYuY3VycmVudCxcbiAgICAgICgpID0+IHNjYWxlUmVmLmN1cnJlbnQsXG4gICAgICBzZXRTY2FsZSxcbiAgICAgICgpID0+IGxvY2tlZFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gb3B0aW9uc1JlZi5jdXJyZW50LFxuICAgICksXG4gICAgW2VsZW1lbnRSZWYsIHNldFNjYWxlXSxcbiAgKVxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjYW5Vc2VEZW1vKHNjcmVlbnMpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2NyZWVucykgJiYgc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSA9PT0gdHJ1ZSlcbn1cbiIsICJleHBvcnQgY29uc3QgQ0FOVkFTX0lOREVYX01BUkdJTiA9IDE2XG5cbmZ1bmN0aW9uIGZpbml0ZSh2YWx1ZSwgZmFsbGJhY2sgPSAwKSB7XG4gIHJldHVybiBOdW1iZXIuaXNGaW5pdGUodmFsdWUpID8gdmFsdWUgOiBmYWxsYmFja1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKHBvc2l0aW9uLCBjb250YWluZXIsIGl0ZW0sIG1hcmdpbiA9IENBTlZBU19JTkRFWF9NQVJHSU4pIHtcbiAgY29uc3QgY29udGFpbmVyV2lkdGggPSBNYXRoLm1heCgwLCBmaW5pdGUoY29udGFpbmVyPy53aWR0aCkpXG4gIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IE1hdGgubWF4KDAsIGZpbml0ZShjb250YWluZXI/LmhlaWdodCkpXG4gIGNvbnN0IGl0ZW1XaWR0aCA9IE1hdGgubWF4KDAsIGZpbml0ZShpdGVtPy53aWR0aCkpXG4gIGNvbnN0IGl0ZW1IZWlnaHQgPSBNYXRoLm1heCgwLCBmaW5pdGUoaXRlbT8uaGVpZ2h0KSlcbiAgY29uc3QgbWF4WCA9IE1hdGgubWF4KG1hcmdpbiwgY29udGFpbmVyV2lkdGggLSBpdGVtV2lkdGggLSBtYXJnaW4pXG4gIGNvbnN0IG1heFkgPSBNYXRoLm1heChtYXJnaW4sIGNvbnRhaW5lckhlaWdodCAtIGl0ZW1IZWlnaHQgLSBtYXJnaW4pXG4gIHJldHVybiB7XG4gICAgeDogTWF0aC5taW4oTWF0aC5tYXgoZmluaXRlKHBvc2l0aW9uPy54LCBtYXJnaW4pLCBtYXJnaW4pLCBtYXhYKSxcbiAgICB5OiBNYXRoLm1pbihNYXRoLm1heChmaW5pdGUocG9zaXRpb24/LnksIG1hcmdpbiksIG1hcmdpbiksIG1heFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbihjb250YWluZXIsIGl0ZW0sIG1hcmdpbiA9IENBTlZBU19JTkRFWF9NQVJHSU4pIHtcbiAgcmV0dXJuIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbih7XG4gICAgeDogKGZpbml0ZShjb250YWluZXI/LndpZHRoKSAtIGZpbml0ZShpdGVtPy53aWR0aCkpIC8gMixcbiAgICB5OiBmaW5pdGUoY29udGFpbmVyPy5oZWlnaHQpIC0gZmluaXRlKGl0ZW0/LmhlaWdodCkgLSBtYXJnaW4sXG4gIH0sIGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMoZ2V0RWxlbWVudHMsIG9uUmVhZHksIHNjaGVkdWxlcikge1xuICBsZXQgYWN0aXZlID0gdHJ1ZVxuICBsZXQgZnJhbWUgPSBudWxsXG5cbiAgY29uc3QgYXR0ZW1wdCA9ICgpID0+IHtcbiAgICBpZiAoIWFjdGl2ZSkgcmV0dXJuXG4gICAgY29uc3QgZWxlbWVudHMgPSBnZXRFbGVtZW50cygpXG4gICAgaWYgKCFlbGVtZW50cz8uY29udGFpbmVyIHx8ICFlbGVtZW50cz8uaXRlbSkge1xuICAgICAgZnJhbWUgPSBzY2hlZHVsZXIucmVxdWVzdChhdHRlbXB0KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZyYW1lID0gbnVsbFxuICAgIG9uUmVhZHkoZWxlbWVudHMpXG4gIH1cblxuICBmcmFtZSA9IHNjaGVkdWxlci5yZXF1ZXN0KGF0dGVtcHQpXG4gIHJldHVybiAoKSA9PiB7XG4gICAgYWN0aXZlID0gZmFsc2VcbiAgICBpZiAoZnJhbWUgIT0gbnVsbCkgc2NoZWR1bGVyLmNhbmNlbChmcmFtZSlcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBmb2N1c0NhbnZhc1NjcmVlbiwgcmVzZXRDYW52YXNWaWV3cG9ydCwgcGFuRnJvbURyYWdTbmFwc2hvdCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5pbXBvcnQge1xuICBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24sXG4gIGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uLFxuICB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyxcbn0gZnJvbSAnLi9jYW52YXMtaW5kZXguanMnXG5cbmNvbnN0IElOREVYX0RSQUdfVEhSRVNIT0xEID0gNFxuXG5mdW5jdGlvbiBlbGVtZW50U2l6ZShlbGVtZW50KSB7XG4gIHJldHVybiB7IHdpZHRoOiBlbGVtZW50Py5vZmZzZXRXaWR0aCB8fCAwLCBoZWlnaHQ6IGVsZW1lbnQ/Lm9mZnNldEhlaWdodCB8fCAwIH1cbn1cblxuZnVuY3Rpb24gQ2FudmFzSW5kZXgoe1xuICBjYW52YXNSZWYsXG4gIHByb2plY3QsXG4gIGN1cnJlbnRTY3JlZW5JZCxcbiAgZGVtb0F2YWlsYWJsZSxcbiAgcG9zaXRpb24sXG4gIG9uUG9zaXRpb25DaGFuZ2UsXG4gIG9uQ2xvc2UsXG4gIG5hdmlnYXRlLFxuICBlbnRlckRlbW8sXG59KSB7XG4gIGNvbnN0IGluZGV4UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBjb25zdHJhaW4gPSBSZWFjdC51c2VDYWxsYmFjaygobmV4dFBvc2l0aW9uLCB1c2VEZWZhdWx0ID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgIGNvbnN0IGluZGV4ID0gaW5kZXhSZWYuY3VycmVudFxuICAgIGlmICghY2FudmFzIHx8ICFpbmRleCkgcmV0dXJuIG5leHRQb3NpdGlvblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IHsgd2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCwgaGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0IH1cbiAgICBjb25zdCBpdGVtID0gZWxlbWVudFNpemUoaW5kZXgpXG4gICAgcmV0dXJuIHVzZURlZmF1bHRcbiAgICAgID8gZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24oY29udGFpbmVyLCBpdGVtKVxuICAgICAgOiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24obmV4dFBvc2l0aW9uLCBjb250YWluZXIsIGl0ZW0pXG4gIH0sIFtjYW52YXNSZWZdKVxuXG4gIC8vIHBvc2l0aW9uID09IG51bGwgXHU4ODY4XHU3OTNBXHU1QzFBXHU2NzJBXHU4NDNEXHU3MEI5XHVGRjA4XHU2MjE2XHU5ODc5XHU3NkVFXHU1MjA3XHU2MzYyXHU4OEFCXHU2RTA1XHU2Mzg5XHVGRjA5XHVGRjFCXHU1RkM1XHU5ODdCXHU1MThEXHU4REQxXHU0RTAwXHU5MDREXHU1RTAzXHU1QzQwXHVGRjBDXG4gIC8vIFx1NTQyNlx1NTIxOVx1NEYxQVx1NEUwMFx1NzZGNFx1NTM2MVx1NTcyOCB2aXNpYmlsaXR5OmhpZGRlblx1MzAwMlxuICBjb25zdCBuZWVkc0RlZmF1bHRQb3NpdGlvbiA9IHBvc2l0aW9uID09IG51bGxcbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBsZXQgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHt9XG4gICAgY29uc3Qgc3RvcFdhaXRpbmcgPSB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhcbiAgICAgICgpID0+ICh7IGNvbnRhaW5lcjogY2FudmFzUmVmLmN1cnJlbnQsIGl0ZW06IGluZGV4UmVmLmN1cnJlbnQgfSksXG4gICAgICAoeyBjb250YWluZXI6IGNhbnZhcywgaXRlbTogaW5kZXggfSkgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiBvblBvc2l0aW9uQ2hhbmdlKChjdXJyZW50KSA9PiBjb25zdHJhaW4oY3VycmVudCwgY3VycmVudCA9PSBudWxsKSlcbiAgICAgICAgdXBkYXRlKClcblxuICAgICAgICBpZiAodHlwZW9mIFJlc2l6ZU9ic2VydmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodXBkYXRlKVxuICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoY2FudmFzKVxuICAgICAgICAgIG9ic2VydmVyLm9ic2VydmUoaW5kZXgpXG4gICAgICAgICAgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICAgIGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgcmVxdWVzdDogKGNhbGxiYWNrKSA9PiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNhbGxiYWNrKSxcbiAgICAgICAgY2FuY2VsOiAoZnJhbWUpID0+IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSksXG4gICAgICB9LFxuICAgIClcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdG9wV2FpdGluZygpXG4gICAgICBkaXNjb25uZWN0UmVzaXplKClcbiAgICB9XG4gIH0sIFtjYW52YXNSZWYsIGNvbnN0cmFpbiwgbmVlZHNEZWZhdWx0UG9zaXRpb24sIG9uUG9zaXRpb25DaGFuZ2VdKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtpbmRleFJlZn1cbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtY2FudmFzLWluZGV4IGlzLWRyYWdnaW5nJyA6ICd3Zi1jYW52YXMtaW5kZXgnfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgdmlzaWJpbGl0eTogJ2hpZGRlbicgfX1cbiAgICA+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtaGFuZGxlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU2MkQ2XHU1MkE4XHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb24gfHwgY29uc3RyYWluKG51bGwsIHRydWUpXG4gICAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IElOREVYX0RSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgICAgb25Qb3NpdGlvbkNoYW5nZShjb25zdHJhaW4oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtZ3JpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxpIC8+PGkgLz48aSAvPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4+XHU3RDIyXHU1RjE1PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1saXN0XCI+XG4gICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLWluZGV4LWRvdCBpcy1hY3RpdmUnIDogJ3dmLWNhbnZhcy1pbmRleC1kb3QnfVxuICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3Bhbj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLWZpbGVcIj5zcmMvc2NyZWVucy97c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtY2xvc2VcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgdGl0bGU9XCJcdTUxNzNcdTk1RURcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIG9uQ2xvc2UoKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48cGF0aCBkPVwibTQgNCA4IDhNMTIgNGwtOCA4XCIgLz48L3N2Zz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeHBvcnRXaXRoRmVlZGJhY2sodGFzaywgc2V0RXJyb3IpIHtcbiAgc2V0RXJyb3IobnVsbClcbiAgdHJ5IHtcbiAgICBhd2FpdCB0YXNrKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgc2V0RXJyb3IoYFx1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYxQSR7bWVzc2FnZX1gKVxuICB9XG59XG5cbi8qKiBmaWxlOi8vIFx1NEUwRFx1NjYyRiBzZWN1cmUgY29udGV4dFx1RkYwQ2NsaXBib2FyZCBBUEkgXHU1RTM4XHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDZXhlY0NvbW1hbmQgXHU1MTVDXHU1RTk1ICovXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgfVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNNb2RlKHtcbiAgcHJvamVjdCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHdoZWVsWm9vbU9wdGlvbnMsXG4gIHNlbGVjdGVkSWRzLFxuICBzZXRTZWxlY3RlZElkcyxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBvbkV4cG9ydElkcyxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbiAgb25DYW52YXNDbGljayxcbiAgY2FudmFzSW5kZXhWaXNpYmxlID0gdHJ1ZSxcbiAgY2FudmFzSW5kZXhQb3NpdGlvbixcbiAgb25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlQ2FudmFzSW5kZXgsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCBuYXZpZ2F0ZSwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBlbnRlckRlbW86IGVudGVyRGVtb01vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzaWRlYmFyQ29sbGFwc2VkLCBzZXRTaWRlYmFyQ29sbGFwc2VkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkS2V5LCBzZXRDb3BpZWRLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2NvcHlUb2FzdCwgc2V0Q29weVRvYXN0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY2FudmFzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNvcGllZFRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBkcmFnZ2luZ1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBzY2FsZVJlZi5jdXJyZW50ID0gc2NhbGVcbiAgZHJhZ2dpbmdSZWYuY3VycmVudCA9IGRyYWdnaW5nXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBjdXJyZW50LnNjYWxlIH0pKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmdSZWYuY3VycmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgYXBwbHkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgICBpZiAoIWNhbnZhcyB8fCAhc3RhZ2UpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc2NyZWVuRWwgPSBzdGFnZS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYW52YXMtc2NyZWVuLWlkPVwiJHtjdXJyZW50U2NyZWVuSWR9XCJdYClcbiAgICAgIGlmICghc2NyZWVuRWwpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3QgY3VycmVudFNjYWxlID0gc2NhbGVSZWYuY3VycmVudFxuICAgICAgaWYgKGN1cnJlbnRTY2FsZSA8PSAwKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHN0YWdlQm94ID0gc3RhZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNjcmVlbkJveCA9IHNjcmVlbkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBuZXh0ID0gZm9jdXNDYW52YXNTY3JlZW4oe1xuICAgICAgICBjb250YWluZXJXaWR0aDogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQsXG4gICAgICAgIHNjcmVlbkxlZnQ6IChzY3JlZW5Cb3gubGVmdCAtIHN0YWdlQm94LmxlZnQpIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5Ub3A6IChzY3JlZW5Cb3gudG9wIC0gc3RhZ2VCb3gudG9wKSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbkJveC53aWR0aCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW5Cb3guaGVpZ2h0IC8gY3VycmVudFNjYWxlLFxuICAgICAgICBjdXJyZW50U2NhbGUsXG4gICAgICB9KVxuICAgICAgaWYgKCFuZXh0KSByZXR1cm4gZmFsc2VcbiAgICAgIHNldFNjYWxlKG5leHQuc2NhbGUpXG4gICAgICBzZXRWaWV3KG5leHQpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChhcHBseSgpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgZnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGFwcGx5KClcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpXG4gIH0sIFtjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0S2V5LCBzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICB1c2VXaGVlbFpvb20oY2FudmFzUmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZCwgd2hlZWxab29tT3B0aW9ucylcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcdTY2MkZcdTY4NDZcdTY3QjYgY2hyb21lXHVGRjBDXHU5NTAxXHU0RUE0XHU0RTkyXHU1M0VBXHU3OTgxXHU1QzRGXHU1MTg1XHU1MTg1XHU1QkI5XHVGRjBDXHU0RTBEXHU2MkEyXHU3RDIyXHU1RjE1XHU3MEI5XHU1MUZCIC8gXHU2MkQ2XHU2MkZEXG4gICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0Py4oJy53Zi1jYW52YXMtaW5kZXgnKSkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgZW50ZXJEZW1vID0gKHNjcmVlbklkKSA9PiB7XG4gICAgLy8gXHU5NTAxXHU0RUE0XHU0RTkyXHU2NUY2IHN0YWdlIFx1NURGMiBwb2ludGVyLWV2ZW50czpub25lXHVGRjFCXHU3RDIyXHU1RjE1XHU0RUNEXHU1M0VGXHU1M0NDXHU1MUZCXHU4RkRCXHU2RjE0XHU3OTNBXG4gICAgaWYgKCFkZW1vQXZhaWxhYmxlKSByZXR1cm5cbiAgICBlbnRlckRlbW9Nb2RlKHNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY29weU1ldGEgPSAoa2V5LCB0ZXh0LCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvcHlUZXh0KHRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkS2V5KGtleSlcbiAgICAgIHNldENvcHlUb2FzdCgnXHU1REYyXHU1OTBEXHU1MjM2JylcbiAgICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3BpZWRUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWRLZXkobnVsbClcbiAgICAgICAgc2V0Q29weVRvYXN0KG51bGwpXG4gICAgICB9LCAxMjAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVTZWxlY3RlZCA9IChpZCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlQWxsID0gKCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpXG4gICAgICByZXR1cm4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tc2lkZWJhciR7c2lkZWJhckNvbGxhcHNlZCA/ICcgaXMtY29sbGFwc2VkJyA6ICcnfWB9IGFyaWEtaGlkZGVuPXtzaWRlYmFyQ29sbGFwc2VkfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWhlYWRlclwiPlxuICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoICYmIHByb2plY3Quc2NyZWVucy5sZW5ndGggPiAwfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dG9nZ2xlQWxsfVxuICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIFx1NTE2OFx1OTAwOVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZVwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaWRlYmFyQ29sbGFwc2VkKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGUtaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIm0xNiAxNS0zLTMgMy0zXCIgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1saXN0XCI+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICB0b2dnbGVTZWxlY3RlZChzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTkwMDlcdTYyRTkgJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcHNcIiBhcmlhLWxhYmVsPVwiXHU2NENEXHU0RjVDXHU2M0QwXHU3OTNBXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCIC8gXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1N0E3QVx1NjgzQ1x1NjJENlx1NjJGRCAvIEN0cmwrXHU2RURBXHU4RjZFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXNpZGU+XG4gICAgICB7c2lkZWJhckNvbGxhcHNlZCA/IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXNpZGViYXItZXhwYW5kXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU1QzU1XHU1RjAwXHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZChmYWxzZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTQgOSAzIDMtMyAzXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxtYWluXG4gICAgICAgIHJlZj17Y2FudmFzUmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1jYW52YXMke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gXG4gICAgICAgICAgICBjb25zdCBmaWxlVGV4dCA9IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgY29uc3QgdGl0bGVLZXkgPSBgJHtzY3JlZW4uaWR9OnRpdGxlYFxuICAgICAgICAgICAgY29uc3QgZmlsZUtleSA9IGAke3NjcmVlbi5pZH06ZmlsZWBcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1zY3JlZW4gaXMtZm9jdXNlZCcgOiAnd2YtY2FudmFzLXNjcmVlbid9XG4gICAgICAgICAgICAgICAgZGF0YS1jYW52YXMtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tbWV0YS10aXRsZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKHRpdGxlS2V5LCB0aXRsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RpdGxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3NjcmVlbi5kZXNjcmlwdGlvbiA/IDxkaXY+e3NjcmVlbi5kZXNjcmlwdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1tZXRhLWxpbmUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEoZmlsZUtleSwgZmlsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5cdTY1ODdcdTRFRjZcdUZGMUE8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgICAgICAgIG1vZGU9XCJjYW52YXNcIlxuICAgICAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgZm9jdXNlZD17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgICAgICBleHBhbmRlZD17ZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17KCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uRXhwb3J0PXsoKSA9PiBvbkV4cG9ydElkcyhbc2NyZWVuLmlkXSl9XG4gICAgICAgICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjYW52YXNJbmRleFZpc2libGUgPyAoXG4gICAgICAgICAgPENhbnZhc0luZGV4XG4gICAgICAgICAgICBjYW52YXNSZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgICBjdXJyZW50U2NyZWVuSWQ9e2N1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgICBwb3NpdGlvbj17Y2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2U9e29uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZX1cbiAgICAgICAgICAgIG9uQ2xvc2U9e29uQ2xvc2VDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG5hdmlnYXRlPXtuYXZpZ2F0ZX1cbiAgICAgICAgICAgIGVudGVyRGVtbz17ZW50ZXJEZW1vfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9tYWluPlxuICAgICAge2NvcHlUb2FzdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b2FzdFwiIHJvbGU9XCJzdGF0dXNcIj57Y29weVRvYXN0fTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHtcbiAgZml0RGVtb1NjYWxlLFxuICBpc0RlbW9CbGFua0V4aXRUYXJnZXQsXG4gIHBhbkZyb21EcmFnU25hcHNob3QsXG4gIHJlc2V0Q2FudmFzVmlld3BvcnQsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcblxuY29uc3QgQkxBTktfRVhJVF9ISU5UID0gJ1x1NTNDQ1x1NTFGQlx1N0E3QVx1NzY3RFx1NTkwNFx1OTAwMFx1NTFGQVx1NkYxNFx1NzkzQSdcblxuZnVuY3Rpb24gcmVhZENvbnRlbnRCb3goZWwpIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgcGFkWCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nUmlnaHQpXG4gIGNvbnN0IHBhZFkgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKVxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBNYXRoLm1heCgwLCBlbC5jbGllbnRXaWR0aCAtIHBhZFgpLFxuICAgIGhlaWdodDogTWF0aC5tYXgoMCwgZWwuY2xpZW50SGVpZ2h0IC0gcGFkWSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbW9Nb2RlKHtcbiAgcHJvamVjdCxcbiAgaG90c3BvdHNWaXNpYmxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHdoZWVsWm9vbU9wdGlvbnMsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgdmlld1Jlc2V0S2V5LFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIHNldE1vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHNjcmVlbkluZGV4ID0gcHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzY3JlZW4gPSBzY3JlZW5JbmRleCA+PSAwID8gcHJvamVjdC5zY3JlZW5zW3NjcmVlbkluZGV4XSA6IG51bGxcbiAgY29uc3QgY3VycmVudEV4cGFuZGVkID0gISEoc2NyZWVuICYmIGV4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHZpZXdwb3J0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgZXhpdE9uQmxhbmtEb3VibGVDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgIHNldE1vZGUoJ2NhbnZhcycpXG4gIH1cblxuICAvLyB0aXRsZSBcdTYzMDJcdTU3MjhcdTg5QzZcdTUzRTNcdTRFMEFcdTRGMUFcdTg0M0RcdTUyMzBcdTVDNEZcdTUxODVcdTVCNTBcdTgyODJcdTcwQjlcdUZGMENcdTVFNzJcdTYyNzBcdTY0Q0RcdTRGNUNcdUZGMUJcdTUzRUFcdTU3MjhcdTdBN0FcdTc2N0RcdTU5MDRcdTYwQUNcdTUwNUNcdTY1RjZcdTYzMDJcdTRFMEFcdTMwMDJcbiAgY29uc3Qgc3luY0JsYW5rRXhpdEhpbnQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBlbCA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBpZiAoIWVsKSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkgPyBCTEFOS19FWElUX0hJTlQgOiAnJ1xuICAgIGlmICgoZWwuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8ICcnKSA9PT0gbmV4dCkgcmV0dXJuXG4gICAgaWYgKG5leHQpIGVsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBuZXh0KVxuICAgIGVsc2UgZWwucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBjbGVhckJsYW5rRXhpdEhpbnQgPSAoKSA9PiB7XG4gICAgdmlld3BvcnRSZWYuY3VycmVudD8ucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBhcHBseUZpdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgIXN0YWdlKSByZXR1cm5cbiAgICBjb25zdCBib3ggPSByZWFkQ29udGVudEJveChjb250YWluZXIpXG4gICAgY29uc3QgbmV4dCA9IGZpdERlbW9TY2FsZShib3gud2lkdGgsIGJveC5oZWlnaHQsIHN0YWdlLm9mZnNldFdpZHRoLCBzdGFnZS5vZmZzZXRIZWlnaHQpXG4gICAgc2V0U2NhbGUobmV4dClcbiAgICBzZXRWaWV3KHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogbmV4dCB9KVxuICB9LCBbc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgdHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcHBseUZpdCgpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IGFwcGx5Rml0KCkpXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXIpXG4gICAgaWYgKHN0YWdlKSBvYnNlcnZlci5vYnNlcnZlKHN0YWdlKVxuICAgIGFwcGx5Rml0KClcbiAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gIH0sIFthcHBseUZpdCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBjdXJyZW50U2NyZWVuSWQsIHZpZXdSZXNldEtleSwgY3VycmVudEV4cGFuZGVkXSlcblxuICB1c2VXaGVlbFpvb20odmlld3BvcnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkLCB3aGVlbFpvb21PcHRpb25zKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1kZW1vIGlzLXNob3dpbmctaG90c3BvdHMnIDogJ3dmLWRlbW8nfT5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXt2aWV3cG9ydFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtZGVtby12aWV3cG9ydCR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgICBvbk1vdXNlTW92ZT17c3luY0JsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17Y2xlYXJCbGFua0V4aXRIaW50fVxuICAgICAgICBvbkNsaWNrPXtvbkNhbnZhc0NsaWNrfVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXtleGl0T25CbGFua0RvdWJsZUNsaWNrfVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1kZW1vLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICBtb2RlPVwiZGVtb1wiXG4gICAgICAgICAgICBpbmRleD17c2NyZWVuSW5kZXh9XG4gICAgICAgICAgICBleHBhbmRlZD17Y3VycmVudEV4cGFuZGVkfVxuICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3NjcmVlbiAmJiBvblRvZ2dsZUV4cGFuZCA/ICgpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtZGVtby1oaW50XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU1MTg1XHU2MzA5XHU5NEFFIC8gXHU5NEZFXHU2M0E1XHU4REYzXHU4RjZDXHVGRjFCXHU1M0VGXHU1NzI4XHU1REU1XHU1MTc3XHU2ODBGXHU1RjAwXHU1MTczXHU3MEVEXHU1MzNBXHU5QUQ4XHU0RUFFXHVGRjFCXHU2ODA3XHU5ODk4XHU2ODBGXHU1M0VGXHU0RTM0XHU2NUY2XHU1QzU1XHU1RjAwXHU3NzBCXHU1MTY4XHU4QzhDPC9wPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgZXhwYW5kU2NyZWVuQ29udGVudCwgbWVhc3VyZUNvbnRlbnRCb3ggfSBmcm9tICcuL2V4cGFuZC5qcydcblxubGV0IGV4cG9ydExpYnJhcmllc1Byb21pc2VcblxuY29uc3QgbGlicmFyaWVzID0gW1xuICB7IGZpbGU6ICdodG1sMmNhbnZhcy5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5odG1sMmNhbnZhcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdqc3ppcC5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5KU1ppcCA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdGaWxlU2F2ZXIubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuc2F2ZUFzID09PSAnZnVuY3Rpb24nIH0sXG5dXG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQoZmlsZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBleGlzdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXdpcmVmcmFtZS1leHBvcnQ9XCIke2ZpbGV9XCJdYClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID09PSAnbG9hZGVkJykge1xuICAgICAgICBleGlzdGluZy5yZW1vdmUoKVxuICAgICAgICBleGlzdGluZyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVzb2x2ZSwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlamVjdCwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdmVuZG9yQmFzZSA9IHdpbmRvdy5XSVJFRlJBTUVfVkVORE9SX0JBU0VcbiAgICBpZiAoIXZlbmRvckJhc2UpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1x1NjcyQVx1OTE0RFx1N0Y2RVx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5M1x1OERFRlx1NUY4NCBXSVJFRlJBTUVfVkVORE9SX0JBU0UnKSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgIHNjcmlwdC5zcmMgPSBuZXcgVVJMKGZpbGUsIHZlbmRvckJhc2UpLmhyZWZcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnQgPSBmaWxlXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGluZydcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGVkJ1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LnJlbW92ZSgpXG4gICAgICByZWplY3QobmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTUyQTBcdThGN0RcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTMgJHtmaWxlfWApKVxuICAgIH1cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFeHBvcnRMaWJyYXJpZXMoKSB7XG4gIGlmICghZXhwb3J0TGlicmFyaWVzUHJvbWlzZSkge1xuICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSBsaWJyYXJpZXMucmVkdWNlKFxuICAgICAgKGNoYWluLCBsaWJyYXJ5KSA9PiBjaGFpbi50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIGF3YWl0IGxvYWRTY3JpcHQobGlicmFyeS5maWxlKVxuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgdGhyb3cgbmV3IEVycm9yKGBcdTVCRkNcdTUxRkFcdTVFOTNcdTUyMURcdTU5Q0JcdTUzMTZcdTU5MzFcdThEMjU6ICR7bGlicmFyeS5maWxlfWApXG4gICAgICB9KSxcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLFxuICAgICkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gdW5kZWZpbmVkXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGV4cG9ydExpYnJhcmllc1Byb21pc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVTY3JlZW4oc2NyZWVuRWxlbWVudCwgdmlld3BvcnQsIHsgZXhwYW5kZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKCFzY3JlZW5FbGVtZW50KSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjI3RVx1NEUwRFx1NTIzMFx1ODk4MVx1NUJGQ1x1NTFGQVx1NzY4NCBzY3JlZW4gXHU1MTQzXHU3RDIwJylcbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG5cbiAgY29uc3Qgc2FuZGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNhbmRib3guY2xhc3NOYW1lID0gJ3dmLWV4cG9ydC1zYW5kYm94J1xuICBjb25zdCBjbG9uZSA9IHNjcmVlbkVsZW1lbnQuY2xvbmVOb2RlKHRydWUpXG4gIHNhbmRib3guYXBwZW5kQ2hpbGQoY2xvbmUpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2FuZGJveClcblxuICBsZXQgd2lkdGggPSB2aWV3cG9ydC53aWR0aFxuICBsZXQgaGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0XG4gIHRyeSB7XG4gICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICBleHBhbmRTY3JlZW5Db250ZW50KGNsb25lKVxuICAgICAgY29uc3QgYm94ID0gbWVhc3VyZUNvbnRlbnRCb3goY2xvbmUpXG4gICAgICB3aWR0aCA9IGJveC53aWR0aFxuICAgICAgaGVpZ2h0ID0gYm94LmhlaWdodFxuICAgIH1cbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgICBzYW5kYm94LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgc2FuZGJveC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG5cbiAgICBjb25zdCBjYW52YXMgPSBhd2FpdCB3aW5kb3cuaHRtbDJjYW52YXMoY2xvbmUsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBzY2FsZTogMixcbiAgICAgIHVzZUNPUlM6IGZhbHNlLFxuICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgKGJsb2IpID0+IGJsb2IgPyByZXNvbHZlKGJsb2IpIDogcmVqZWN0KG5ldyBFcnJvcignUE5HIFx1N0YxNlx1NzgwMVx1NTkzMVx1OEQyNScpKSxcbiAgICAgICAgJ2ltYWdlL3BuZycsXG4gICAgICApXG4gICAgfSlcbiAgfSBmaW5hbGx5IHtcbiAgICBzYW5kYm94LnJlbW92ZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbnMpIHx8IHNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTgxRjNcdTVDMTFcdTkwMDlcdTYyRTlcdTRFMDBcdTRFMkEgc2NyZWVuJylcbiAgfVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcbiAgY29uc3QgY2FwdHVyZWQgPSBbXVxuICBmb3IgKGNvbnN0IHNjcmVlbiBvZiBzY3JlZW5zKSB7XG4gICAgY2FwdHVyZWQucHVzaCh7XG4gICAgICBuYW1lOiBgJHtzbHVnKHNjcmVlbi5pZCl9LnBuZ2AsXG4gICAgICBibG9iOiBhd2FpdCBjYXB0dXJlU2NyZWVuKHNjcmVlbi5lbGVtZW50LCBzY3JlZW4udmlld3BvcnQsIHtcbiAgICAgICAgZXhwYW5kZWQ6ICEhc2NyZWVuLmV4cGFuZGVkLFxuICAgICAgfSksXG4gICAgfSlcbiAgfVxuXG4gIGlmIChjYXB0dXJlZC5sZW5ndGggPT09IDEpIHtcbiAgICB3aW5kb3cuc2F2ZUFzKGNhcHR1cmVkWzBdLmJsb2IsIGNhcHR1cmVkWzBdLm5hbWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB6aXAgPSBuZXcgd2luZG93LkpTWmlwKClcbiAgY2FwdHVyZWQuZm9yRWFjaCgoaXRlbSkgPT4gemlwLmZpbGUoaXRlbS5uYW1lLCBpdGVtLmJsb2IpKVxuICBjb25zdCBibG9iID0gYXdhaXQgemlwLmdlbmVyYXRlQXN5bmMoeyB0eXBlOiAnYmxvYicgfSlcbiAgd2luZG93LnNhdmVBcyhibG9iLCBgJHtzbHVnKHNjcmVlbnNbMF0ucHJvamVjdE5hbWUpfS56aXBgKVxufVxuIiwgImltcG9ydCB7IGJ1aWxkUmV2aWV3UHJvbXB0LCByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3UGFuZWwoe1xuICBwcm9qZWN0LFxuICB2aXNpYmxlID0gdHJ1ZSxcbiAgc2VsZWN0aW9ucyxcbiAgbXVsdGlTZWxlY3QsXG4gIGl0ZW1zLFxuICBvblRvZ2dsZU11bHRpU2VsZWN0LFxuICBvblNlbGVjdEVsZW1lbnQsXG4gIG9uSG92ZXJFbGVtZW50LFxuICBvblJlbW92ZVNlbGVjdGlvbixcbiAgb25DbGVhclNlbGVjdGlvbixcbiAgb25BZGRJdGVtLFxuICBvblJlbW92ZUl0ZW0sXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0aW9uc1tzZWxlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IG51bGxcbiAgY29uc3QgZ2VuZXJhdGVkUHJvbXB0ID0gUmVhY3QudXNlTWVtbygoKSA9PiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcyksIFtwcm9qZWN0LCBpdGVtc10pXG4gIGNvbnN0IFt0eXBlLCBzZXRUeXBlXSA9IFJlYWN0LnVzZVN0YXRlKCdjb21tZW50JylcbiAgY29uc3QgW2luc3RydWN0aW9uLCBzZXRJbnN0cnVjdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Byb21wdCwgc2V0UHJvbXB0XSA9IFJlYWN0LnVzZVN0YXRlKGdlbmVyYXRlZFByb21wdClcbiAgY29uc3QgW3Byb21wdERpcnR5LCBzZXRQcm9tcHREaXJ0eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjb3B5VGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcHJvbXB0RGlydHkpIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gIH0sIFtnZW5lcmF0ZWRQcm9tcHQsIHByb21wdERpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgY29uc3QgYWRkSXRlbSA9ICgpID0+IHtcbiAgICBpZiAoc2VsZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVyblxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBpbnN0cnVjdGlvbi50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQgJiYgdHlwZSAhPT0gJ3JlbW92ZScpIHJldHVyblxuICAgIG9uQWRkSXRlbSh7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0czogc2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbikgPT4gKHtcbiAgICAgICAgc2NyZWVuSWQ6IHNlbGVjdGlvbi5zY3JlZW5JZCxcbiAgICAgICAgc2NyZWVuVGl0bGU6IHNlbGVjdGlvbi5zY3JlZW5UaXRsZSxcbiAgICAgICAgc291cmNlSGludDogc2VsZWN0aW9uLnNvdXJjZUhpbnQsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3Rpb24uc2VsZWN0b3IsXG4gICAgICAgIGN1cnJlbnRUZXh0OiBzZWxlY3Rpb24uY3VycmVudFRleHQsXG4gICAgICB9KSksXG4gICAgICBpbnN0cnVjdGlvbjogbm9ybWFsaXplZCxcbiAgICB9KVxuICAgIHNldEluc3RydWN0aW9uKCcnKVxuICB9XG5cbiAgY29uc3QgcmVnZW5lcmF0ZSA9ICgpID0+IHtcbiAgICBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICAgIHNldFByb21wdERpcnR5KGZhbHNlKVxuICB9XG5cbiAgY29uc3QgY29weVByb21wdCA9ICgpID0+IHtcbiAgICBjb3B5VGV4dChwcm9tcHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3B5VGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDE0MDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGluc3RydWN0aW9uTGFiZWwgPSB0eXBlID09PSAndGV4dCdcbiAgICA/ICdcdTY1QjBcdTY1ODdcdTVCNTcnXG4gICAgOiB0eXBlID09PSAnb3JkZXInXG4gICAgICA/ICdcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDInXG4gICAgICA6IHR5cGUgPT09ICdyZW1vdmUnXG4gICAgICAgID8gJ1x1NTIyMFx1OTY2NFx1OEJGNFx1NjYwRVx1RkYwOFx1NTNFRlx1OTAwOVx1RkYwOSdcbiAgICAgICAgOiAnXHU3RUQ5IEFJIFx1NzY4NFx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRSdcblxuICByZXR1cm4gKFxuICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWxcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCXCIgaGlkZGVuPXshdmlzaWJsZX0+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLXRpdGxlXCI+XHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCPC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWNvdW50XCI+e2l0ZW1zLmxlbmd0aH0gXHU2NzYxXHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtYm9keVwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NURGMlx1OTAwOVx1ODI4Mlx1NzBCOSAoe3NlbGVjdGlvbnMubGVuZ3RofSk8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bXVsdGlTZWxlY3QgPyAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QnfVxuICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17bXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVNdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTkxQVx1OTAwOSB7bXVsdGlTZWxlY3QgPyAnT04nIDogJ09GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsZWFyLXNlbGVjdGlvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtvbkNsZWFyU2VsZWN0aW9ufT5cdTZFMDVcdTdBN0E8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhpbnRcIj5cdTU5MUFcdTkwMDlcdTVGMDBcdTU0MkZcdTU0MEVcdTcwQjlcdTUxRkJcdTgyODJcdTcwQjlcdTUzRUZcdTUyQTBcdTUxNjVcdTYyMTZcdTc5RkJcdTk2NjRcdUZGMUJcdTRFNUZcdTUzRUZcdTYzMDlcdTRGNEYgU2hpZnQgLyBDb21tYW5kIC8gQ3RybCBcdTcwQjlcdTUxRkJcdTMwMDI8L3A+XG4gICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uc1wiPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzZWxlY3Rpb24gPT09IHNlbGVjdGVkID8gJ3dmLXJldmlldy1zZWxlY3Rpb24gaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctc2VsZWN0aW9uJ30ga2V5PXtgJHtzZWxlY3Rpb24uc2NyZWVuSWR9OiR7c2VsZWN0aW9uLnNlbGVjdG9yfWB9PlxuICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1zZWxlY3RvclwiPntpbmRleCArIDF9LiB7c2VsZWN0aW9uLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1yZW1vdmVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVTZWxlY3Rpb24oc2VsZWN0aW9uLmVsZW1lbnQpfT5cdTc5RkJcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2NyZWVuLW5hbWVcIj57c2VsZWN0ZWQuc2NyZWVuVGl0bGV9IFx1MDBCNyB7c2VsZWN0ZWQuc2NyZWVuSWR9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJzXCIgYXJpYS1sYWJlbD1cIlx1ODI4Mlx1NzBCOVx1NUM0Mlx1N0VBN1wiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZC5hbmNlc3RvcnMubWFwKChhbmNlc3RvciwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2FuY2VzdG9yLnNlbGVjdG9yfT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYi1zZXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwibTkgMTggNi02LTYtNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthbmNlc3Rvci5zZWxlY3Rvcn1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IG9uSG92ZXJFbGVtZW50Py4oYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2VsZWN0RWxlbWVudChhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHthbmNlc3Rvci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdG9yXCI+e3NlbGVjdGVkLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAge3NlbGVjdGVkLmN1cnJlbnRUZXh0ID8gKFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1jdXJyZW50LXRleHRcIj5cdTVGNTNcdTUyNERcdUZGMUF7c2VsZWN0ZWQuY3VycmVudFRleHR9PC9wPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NEZFRVx1NjUzOVx1N0M3Qlx1NTc4Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLXNlbGVjdFwiIHZhbHVlPXt0eXBlfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRUeXBlKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKFJFVklFV19UWVBFX0xBQkVMUykubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLW9wdGlvblwiIHZhbHVlPXt2YWx1ZX0ga2V5PXt2YWx1ZX0+e2xhYmVsfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj57aW5zdHJ1Y3Rpb25MYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaW5zdHJ1Y3Rpb25cIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2luc3RydWN0aW9ufVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3R5cGUgPT09ICdvcmRlcicgPyAnXHU0RjhCXHU1OTgyXHVGRjFBXHU3OUZCXHU1MkE4XHU1MjMwXHU4QkEyXHU1MzU1XHU2NDU4XHU4OTgxXHU0RTRCXHU1NDBFJyA6ICdcdTYzQ0ZcdThGRjBcdTVFMENcdTY3MUIgQUkgXHU1OTgyXHU0RjU1XHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEluc3RydWN0aW9uKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaW5zdHJ1Y3Rpb24udHJpbSgpICYmIHR5cGUgIT09ICdyZW1vdmUnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FkZEl0ZW19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTUyQTBcdTUxNjVcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMDh7c2VsZWN0aW9ucy5sZW5ndGh9IFx1NEUyQVx1ODI4Mlx1NzBCOVx1RkYwOVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTRFMkRcdTc2ODRcdTgyODJcdTcwQjlcdTVGMDBcdTU5Q0JcdTRGRUVcdTY1MzlcdTMwMDJcdTcwQjlcdTUxRkJcdTk3NjJcdTUzMDVcdTVDNTFcdTUzRUZcdTUyMDdcdTYzNjJcdTUyMzBcdTcyMzZcdTdFQTdcdTdFQzRcdTRFRjZcdTMwMDI8L3A+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTU8L2gyPlxuICAgICAgICAgIHtpdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtc1wiPlxuICAgICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbVwiIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS10aXRsZVwiPntpbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2l0ZW0udHlwZV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Jldmlld1RhcmdldHMoaXRlbSkubWFwKCh0YXJnZXQpID0+IHRhcmdldC5zZWxlY3Rvcikuam9pbignXHUzMDAxJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0taW5zdHJ1Y3Rpb25cIj57aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ308L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tZGVsZXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlSXRlbShpdGVtLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDhcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24gd2YtcmV2aWV3LXByb21wdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTY3MDBcdTdFQzggUHJvbXB0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cmVnZW5lcmF0ZX0+XHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb21wdERpcnR5ID8gPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hbnVhbFwiPlByb21wdCBcdTVERjJcdTYyNEJcdTUyQThcdTRGRUVcdTY1MzlcdUZGMUJcdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTBcdTRGMUFcdTg5ODZcdTc2RDZcdTYyNEJcdTUyQThcdTUxODVcdTVCQjlcdTMwMDI8L3A+IDogbnVsbH1cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1wcm9tcHRcIlxuICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0UHJvbXB0KGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9e2NvcHlQcm9tcHR9PlxuICAgICAgICAgICAge2NvcGllZCA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NTkwRFx1NTIzNiBQcm9tcHQnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiaW1wb3J0IHsgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLml0ZW0gPT09IG90aGVyLml0ZW1cbiAgICAgICYmIGl0ZW0uaXRlbUluZGV4ID09PSBvdGhlci5pdGVtSW5kZXhcbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICB9KVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBpdGVtcykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgcG9zaXRpb25zID0gW11cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICByZXZpZXdUYXJnZXRzKGl0ZW0pLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0LnNlbGVjdG9yKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50Py5pc0Nvbm5lY3RlZCkgcmV0dXJuXG4gICAgICBjb25zdCBzY3JlZW5Db250ZW50ID0gZWxlbWVudC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKVxuICAgICAgaWYgKCFzY3JlZW5Db250ZW50KSByZXR1cm5cbiAgICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHNjcmVlbkNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgICBpZiAoIXZpc2libGUpIHJldHVyblxuICAgICAgY29uc3QgYmFzZUxlZnQgPSBNYXRoLnJvdW5kKHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdClcbiAgICAgIGNvbnN0IGJhc2VUb3AgPSBNYXRoLnJvdW5kKHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcClcbiAgICAgIGNvbnN0IG92ZXJsYXBDb3VudCA9IHBvc2l0aW9ucy5maWx0ZXIoXG4gICAgICAgIChwb3NpdGlvbikgPT4gTWF0aC5hYnMocG9zaXRpb24uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAyICYmIE1hdGguYWJzKHBvc2l0aW9uLmJhc2VUb3AgLSBiYXNlVG9wKSA8IDIsXG4gICAgICApLmxlbmd0aFxuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBrZXk6IGAke2l0ZW0uaWR9OiR7dGFyZ2V0SW5kZXh9YCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXRlbUluZGV4LFxuICAgICAgICB0YXJnZXRJbmRleCxcbiAgICAgICAgYmFzZUxlZnQsXG4gICAgICAgIGJhc2VUb3AsXG4gICAgICAgIGxlZnQ6IGJhc2VMZWZ0ICsgb3ZlcmxhcENvdW50ICogMTUsXG4gICAgICAgIHRvcDogYmFzZVRvcCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdNYXJrZXJzKHsgYm9hcmRSZWYsIGl0ZW1zLCBvbk9wZW5QYW5lbCB9KSB7XG4gIGNvbnN0IFtwb3NpdGlvbnMsIHNldFBvc2l0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2FjdGl2ZUtleSwgc2V0QWN0aXZlS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZyYW1lUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZFJlZi5jdXJyZW50LCBpdGVtcylcbiAgICBzZXRQb3NpdGlvbnMoKGN1cnJlbnQpID0+IHNhbWVQb3NpdGlvbnMoY3VycmVudCwgbmV4dCkgPyBjdXJyZW50IDogbmV4dClcbiAgfSwgW2JvYXJkUmVmLCBpdGVtc10pXG5cbiAgY29uc3Qgc2NoZWR1bGVSZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICBmcmFtZVJlZi5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmcmFtZVJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgcmVmcmVzaCgpXG4gICAgfSlcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgcmVmcmVzaCgpXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbc2NoZWR1bGVSZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmVLZXkgJiYgIXBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpKSBzZXRBY3RpdmVLZXkobnVsbClcbiAgfSwgW2FjdGl2ZUtleSwgcG9zaXRpb25zXSlcblxuICBjb25zdCBhY3RpdmUgPSBwb3NpdGlvbnMuZmluZCgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KVxuICBjb25zdCBib2FyZFdpZHRoID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50V2lkdGggfHwgMFxuICBjb25zdCBib2FyZEhlaWdodCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudEhlaWdodCB8fCAwXG4gIGNvbnN0IGJ1YmJsZUxlZnQgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLmxlZnQgKyAxNiwgYm9hcmRXaWR0aCAtIDMzNikpIDogMFxuICBjb25zdCBidWJibGVUb3AgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLnRvcCArIDI0LCBib2FyZEhlaWdodCAtIDE4MCkpIDogMFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbikgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICd3Zi1yZXZpZXctbWFya2VyIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW1hcmtlcid9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XHVGRjFBJHtSRVZJRVdfVFlQRV9MQUJFTFNbcG9zaXRpb24uaXRlbS50eXBlXX1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICAgIHthY3RpdmUgPyAoXG4gICAgICAgIDxhc2lkZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7YWN0aXZlLml0ZW1JbmRleCArIDF9YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGl0bGVcIj5cbiAgICAgICAgICAgICAge2FjdGl2ZS5pdGVtSW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1thY3RpdmUuaXRlbS50eXBlXX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaW5zdHJ1Y3Rpb25cIj5cbiAgICAgICAgICAgIHthY3RpdmUuaXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGFyZ2V0c1wiPlxuICAgICAgICAgICAge3Jldmlld1RhcmdldHMoYWN0aXZlLml0ZW0pLm1hcCgodGFyZ2V0KSA9PiAoXG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1zZWxlY3RvclwiIGtleT17dGFyZ2V0LnNlbGVjdG9yfT57dGFyZ2V0LnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1tb3JlXCJcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3RpdmVLZXkobnVsbClcbiAgICAgICAgICAgICAgb25PcGVuUGFuZWw/LigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1NjdFNVx1NzcwQlx1NjZGNFx1NTkxQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJjb25zdCBMQVVOQ0hFUl9TSVpFID0gNDhcbmNvbnN0IExBVU5DSEVSX01BUkdJTiA9IDIwXG5jb25zdCBEUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgTWF0aC5tYXgobWluLCBtYXgpKVxufVxuXG5mdW5jdGlvbiBjbGFtcFBvc2l0aW9uKGJvYXJkLCBwb3NpdGlvbikge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gcG9zaXRpb25cbiAgcmV0dXJuIHtcbiAgICB4OiBjbGFtcChwb3NpdGlvbi54LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gICAgeTogY2xhbXAocG9zaXRpb24ueSwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0UG9zaXRpb24oYm9hcmQpIHtcbiAgcmV0dXJuIGNsYW1wUG9zaXRpb24oYm9hcmQsIHtcbiAgICB4OiBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gICAgeTogYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWU/LngpICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueSkpIHJldHVybiB2YWx1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBsb2NhbFN0b3JhZ2UgbWF5IGJlIHVuYXZhaWxhYmxlIGZvciBhIGRpcmVjdGx5IG9wZW5lZCBsb2NhbCBmaWxlLlxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvbikge1xuICB0cnkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwb3NpdGlvbikpXG4gIH0gY2F0Y2gge1xuICAgIC8vIEtlZXBpbmcgdGhlIGxhdW5jaGVyIGRyYWdnYWJsZSBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHBlcnNpc3RlbmNlLlxuICB9XG59XG5cbmZ1bmN0aW9uIENvbW1lbnRJY29uKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTUgNC41aDE0YTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAyaC02bC00LjUgM3YtM0g1YTIgMiAwIDAgMS0yLTJ2LThhMiAyIDAgMCAxIDItMlpcIiAvPlxuICAgICAgPHBhdGggZD1cIk03LjUgMTAuNWg5XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TGF1bmNoZXIoeyBib2FyZFJlZiwgY291bnQsIHByb2plY3ROYW1lLCBvbk9wZW4gfSkge1xuICBjb25zdCBzdG9yYWdlS2V5ID0gYHdmLXJldmlldy1sYXVuY2hlci1wb3NpdGlvbjoke3Byb2plY3ROYW1lfWBcbiAgY29uc3QgW3Bvc2l0aW9uLCBzZXRQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvc2l0aW9uUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN1cHByZXNzQ2xpY2tSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG5cbiAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSBSZWFjdC51c2VDYWxsYmFjaygobmV4dCkgPT4ge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQsIG5leHQpXG4gICAgcG9zaXRpb25SZWYuY3VycmVudCA9IGNsYW1wZWRcbiAgICBzZXRQb3NpdGlvbihjbGFtcGVkKVxuICAgIHJldHVybiBjbGFtcGVkXG4gIH0sIFtib2FyZFJlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBib2FyZCA9IGJvYXJkUmVmLmN1cnJlbnRcbiAgICBpZiAoIWJvYXJkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgdXBkYXRlUG9zaXRpb24ocmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG5cbiAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gdXBkYXRlUG9zaXRpb24ocG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuICAgICAgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIG5leHQpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gIH0sIFtib2FyZFJlZiwgc3RvcmFnZUtleSwgdXBkYXRlUG9zaXRpb25dKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGRyYWcubW92ZWRcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKHBvc2l0aW9uUmVmLmN1cnJlbnQpIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvblJlZi5jdXJyZW50KVxuICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0Lmhhc1BvaW50ZXJDYXB0dXJlPy4oZXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLXJldmlldy1sYXVuY2hlciBpcy1kcmFnZ2luZycgOiAnd2YtcmV2aWV3LWxhdW5jaGVyJ31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHJpZ2h0OiBMQVVOQ0hFUl9NQVJHSU4sIGJvdHRvbTogTEFVTkNIRVJfTUFSR0lOIH19XG4gICAgICBhcmlhLWxhYmVsPXtgXHU1QzU1XHU1RjAwXHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjBDXHU1MTcxICR7Y291bnR9IFx1Njc2MVx1NEZFRVx1NjUzOWB9XG4gICAgICBkYXRhLXRvb2x0aXA9XCJcdTVDNTVcdTVGMDBcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50KVxuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgY29uc3QgZGVsdGFYID0gZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBEUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgIGRyYWcubW92ZWQgPSB0cnVlXG4gICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXtmaW5pc2hEcmFnfVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBpZiAoc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBvbk9wZW4oKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Q29tbWVudEljb24gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb3VudH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cbiIsICJleHBvcnQgY29uc3QgVU5TQVZFRF9SRVZJRVdfTUVTU0FHRSA9ICdcdTRGRUVcdTY1MzlcdTUxODVcdTVCQjlcdTVDMUFcdTY3MkFcdTRGRERcdTVCNThcdUZGMENcdTc5QkJcdTVGMDBcdTk4NzVcdTk3NjJcdTU0MEVcdTRGMUFcdTRFMjJcdTU5MzFcdTMwMDJcdTY2MkZcdTU0MjZcdTdFRTdcdTdFRURcdUZGMUYnXG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBldmVudC5yZXR1cm5WYWx1ZSA9IFVOU0FWRURfUkVWSUVXX01FU1NBR0VcbiAgcmV0dXJuIFVOU0FWRURfUkVWSUVXX01FU1NBR0Vcbn1cbiIsICJleHBvcnQgY29uc3QgQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTiA9IDFcbmV4cG9ydCBjb25zdCBVTlNBVkVEX0FOTk9UQVRJT05fTUVTU0FHRSA9ICdcdTZDRThcdTkxQ0FcdTgzNDlcdTdBM0ZcdTY3MkFcdTgwRkRcdTRGRERcdTVCNThcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTRFMkRcdUZGMENcdTc5QkJcdTVGMDBcdTk4NzVcdTk3NjJcdTU0MEVcdTRGMUFcdTRFMjJcdTU5MzFcdTMwMDJcdTY2MkZcdTU0MjZcdTdFRTdcdTdFRURcdUZGMUYnXG5cbmNvbnN0IFNUT1JBR0VfUFJFRklYID0gJ3dmLWFubm90YXRpb25zOnYxOidcblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50cmltKClcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOVxcdTRlMDAtXFx1OWZmZl0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCkge1xuICByZXR1cm4gU3RyaW5nKHByb2plY3Q/LmlkIHx8IHNsdWcocHJvamVjdD8ubmFtZSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbm5vdGF0aW9uQmFzZVJldmlzaW9uKHByb2plY3QpIHtcbiAgcmV0dXJuIFN0cmluZyhwcm9qZWN0Py5hbm5vdGF0aW9uc1JldmlzaW9uIHx8ICdhbm5vdGF0aW9ucy1lbXB0eScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbm5vdGF0aW9uU3RvcmFnZUtleShwcm9qZWN0KSB7XG4gIHJldHVybiBgJHtTVE9SQUdFX1BSRUZJWH0ke2Fubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCl9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5ub3RhdGlvblN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFVuc2F2ZWRBbm5vdGF0aW9uRXhpdChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIGV2ZW50LnJldHVyblZhbHVlID0gVU5TQVZFRF9BTk5PVEFUSU9OX01FU1NBR0VcbiAgcmV0dXJuIFVOU0FWRURfQU5OT1RBVElPTl9NRVNTQUdFXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUFuY2hvcihhbmNob3IpIHtcbiAgaWYgKGFuY2hvcj8ua2luZCA9PT0gJ25vZGUnICYmIGFuY2hvci5zZWxlY3Rvcikge1xuICAgIGNvbnN0IGZhbGxiYWNrID0gYW5jaG9yLmZhbGxiYWNrUG9zaXRpb25cbiAgICByZXR1cm4ge1xuICAgICAga2luZDogJ25vZGUnLFxuICAgICAgc2VsZWN0b3I6IFN0cmluZyhhbmNob3Iuc2VsZWN0b3IpLFxuICAgICAgLi4uKGZhbGxiYWNrICYmIE51bWJlci5pc0Zpbml0ZShmYWxsYmFjay54KSAmJiBOdW1iZXIuaXNGaW5pdGUoZmFsbGJhY2sueSlcbiAgICAgICAgPyB7IGZhbGxiYWNrUG9zaXRpb246IHtcbiAgICAgICAgICB4OiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBOdW1iZXIoZmFsbGJhY2sueCkpKSxcbiAgICAgICAgICB5OiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBOdW1iZXIoZmFsbGJhY2sueSkpKSxcbiAgICAgICAgfSB9XG4gICAgICAgIDoge30pLFxuICAgIH1cbiAgfVxuICByZXR1cm4geyBraW5kOiAnc2NyZWVuJyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVBbm5vdGF0aW9uKGFubm90YXRpb24pIHtcbiAgaWYgKCFhbm5vdGF0aW9uPy5pZCB8fCAhYW5ub3RhdGlvbj8uc2NyZWVuSWQgfHwgIVN0cmluZyhhbm5vdGF0aW9uLmNvbnRlbnQgfHwgJycpLnRyaW0oKSkgcmV0dXJuIG51bGxcbiAgY29uc3QgY3JlYXRlZEF0ID0gYW5ub3RhdGlvbi5jcmVhdGVkQXQgfHwgbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gIHJldHVybiB7XG4gICAgaWQ6IFN0cmluZyhhbm5vdGF0aW9uLmlkKSxcbiAgICBzY3JlZW5JZDogU3RyaW5nKGFubm90YXRpb24uc2NyZWVuSWQpLFxuICAgIHNjcmVlblRpdGxlOiBTdHJpbmcoYW5ub3RhdGlvbi5zY3JlZW5UaXRsZSB8fCBhbm5vdGF0aW9uLnNjcmVlbklkKSxcbiAgICBhbmNob3I6IG5vcm1hbGl6ZUFuY2hvcihhbm5vdGF0aW9uLmFuY2hvciksXG4gICAgY29udGVudDogU3RyaW5nKGFubm90YXRpb24uY29udGVudCkudHJpbSgpLFxuICAgIGNyZWF0ZWRBdDogU3RyaW5nKGNyZWF0ZWRBdCksXG4gICAgdXBkYXRlZEF0OiBTdHJpbmcoYW5ub3RhdGlvbi51cGRhdGVkQXQgfHwgY3JlYXRlZEF0KSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmFzZUFubm90YXRpb25zKHByb2plY3QpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Q/LmFubm90YXRpb25zKSkgcmV0dXJuIFtdXG4gIHJldHVybiBwcm9qZWN0LmFubm90YXRpb25zLm1hcChub3JtYWxpemVBbm5vdGF0aW9uKS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZnVuY3Rpb24gYW5ub3RhdGlvbkVxdWFsKGxlZnQsIHJpZ2h0KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShub3JtYWxpemVBbm5vdGF0aW9uKGxlZnQpKSA9PT0gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplQW5ub3RhdGlvbihyaWdodCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUFubm90YXRpb25PcGVyYXRpb25zKGJhc2UsIG9wZXJhdGlvbnMpIHtcbiAgY29uc3QgYnlJZCA9IG5ldyBNYXAoKGJhc2UgfHwgW10pLm1hcCgoaXRlbSkgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVBbm5vdGF0aW9uKGl0ZW0pXG4gICAgcmV0dXJuIG5vcm1hbGl6ZWQgPyBbbm9ybWFsaXplZC5pZCwgbm9ybWFsaXplZF0gOiBudWxsXG4gIH0pLmZpbHRlcihCb29sZWFuKSlcblxuICBmb3IgKGNvbnN0IG9wZXJhdGlvbiBvZiBvcGVyYXRpb25zIHx8IFtdKSB7XG4gICAgaWYgKG9wZXJhdGlvbj8ub3AgPT09ICdkZWxldGUnICYmIG9wZXJhdGlvbi5pZCkge1xuICAgICAgYnlJZC5kZWxldGUoU3RyaW5nKG9wZXJhdGlvbi5pZCkpXG4gICAgICBjb250aW51ZVxuICAgIH1cbiAgICBpZiAob3BlcmF0aW9uPy5vcCA9PT0gJ3Vwc2VydCcpIHtcbiAgICAgIGNvbnN0IGFubm90YXRpb24gPSBub3JtYWxpemVBbm5vdGF0aW9uKG9wZXJhdGlvbi5hbm5vdGF0aW9uKVxuICAgICAgaWYgKGFubm90YXRpb24pIGJ5SWQuc2V0KGFubm90YXRpb24uaWQsIGFubm90YXRpb24pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi5ieUlkLnZhbHVlcygpXS5zb3J0KChsZWZ0LCByaWdodCkgPT4ge1xuICAgIGNvbnN0IHRpbWUgPSBsZWZ0LmNyZWF0ZWRBdC5sb2NhbGVDb21wYXJlKHJpZ2h0LmNyZWF0ZWRBdClcbiAgICByZXR1cm4gdGltZSB8fCBsZWZ0LmlkLmxvY2FsZUNvbXBhcmUocmlnaHQuaWQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWNvbmNpbGVBbm5vdGF0aW9uT3BlcmF0aW9ucyhiYXNlLCBvcGVyYXRpb25zKSB7XG4gIGNvbnN0IGJhc2VCeUlkID0gbmV3IE1hcCgoYmFzZSB8fCBbXSkubWFwKChpdGVtKSA9PiBbaXRlbS5pZCwgbm9ybWFsaXplQW5ub3RhdGlvbihpdGVtKV0pKVxuICBjb25zdCBsYXRlc3QgPSBuZXcgTWFwKClcblxuICBmb3IgKGNvbnN0IG9wZXJhdGlvbiBvZiBvcGVyYXRpb25zIHx8IFtdKSB7XG4gICAgaWYgKG9wZXJhdGlvbj8ub3AgPT09ICdkZWxldGUnICYmIG9wZXJhdGlvbi5pZCkge1xuICAgICAgbGF0ZXN0LnNldChTdHJpbmcob3BlcmF0aW9uLmlkKSwgeyBvcDogJ2RlbGV0ZScsIGlkOiBTdHJpbmcob3BlcmF0aW9uLmlkKSB9KVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG9wZXJhdGlvbj8ub3AgPT09ICd1cHNlcnQnKSB7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gbm9ybWFsaXplQW5ub3RhdGlvbihvcGVyYXRpb24uYW5ub3RhdGlvbilcbiAgICAgIGlmIChhbm5vdGF0aW9uKSBsYXRlc3Quc2V0KGFubm90YXRpb24uaWQsIHsgb3A6ICd1cHNlcnQnLCBhbm5vdGF0aW9uIH0pXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi5sYXRlc3QudmFsdWVzKCldLmZpbHRlcigob3BlcmF0aW9uKSA9PiB7XG4gICAgY29uc3QgYmFzZUl0ZW0gPSBiYXNlQnlJZC5nZXQob3BlcmF0aW9uLm9wID09PSAnZGVsZXRlJyA/IG9wZXJhdGlvbi5pZCA6IG9wZXJhdGlvbi5hbm5vdGF0aW9uLmlkKVxuICAgIGlmIChvcGVyYXRpb24ub3AgPT09ICdkZWxldGUnKSByZXR1cm4gISFiYXNlSXRlbVxuICAgIHJldHVybiAhYmFzZUl0ZW0gfHwgIWFubm90YXRpb25FcXVhbChiYXNlSXRlbSwgb3BlcmF0aW9uLmFubm90YXRpb24pXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1cHNlcnRBbm5vdGF0aW9uT3BlcmF0aW9uKGJhc2UsIG9wZXJhdGlvbnMsIGFubm90YXRpb24pIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUFubm90YXRpb24oYW5ub3RhdGlvbilcbiAgaWYgKCFub3JtYWxpemVkKSByZXR1cm4gcmVjb25jaWxlQW5ub3RhdGlvbk9wZXJhdGlvbnMoYmFzZSwgb3BlcmF0aW9ucylcbiAgcmV0dXJuIHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKGJhc2UsIFtcbiAgICAuLi4ob3BlcmF0aW9ucyB8fCBbXSkuZmlsdGVyKChvcGVyYXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGlkID0gb3BlcmF0aW9uLm9wID09PSAnZGVsZXRlJyA/IG9wZXJhdGlvbi5pZCA6IG9wZXJhdGlvbi5hbm5vdGF0aW9uPy5pZFxuICAgICAgcmV0dXJuIGlkICE9PSBub3JtYWxpemVkLmlkXG4gICAgfSksXG4gICAgeyBvcDogJ3Vwc2VydCcsIGFubm90YXRpb246IG5vcm1hbGl6ZWQgfSxcbiAgXSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUFubm90YXRpb25PcGVyYXRpb24oYmFzZSwgb3BlcmF0aW9ucywgaWQpIHtcbiAgY29uc3Qgbm9ybWFsaXplZElkID0gU3RyaW5nKGlkKVxuICBjb25zdCBiYXNlSGFzSXRlbSA9IChiYXNlIHx8IFtdKS5zb21lKChpdGVtKSA9PiBpdGVtLmlkID09PSBub3JtYWxpemVkSWQpXG4gIGNvbnN0IG5leHQgPSAob3BlcmF0aW9ucyB8fCBbXSkuZmlsdGVyKChvcGVyYXRpb24pID0+IHtcbiAgICBjb25zdCBvcGVyYXRpb25JZCA9IG9wZXJhdGlvbi5vcCA9PT0gJ2RlbGV0ZScgPyBvcGVyYXRpb24uaWQgOiBvcGVyYXRpb24uYW5ub3RhdGlvbj8uaWRcbiAgICByZXR1cm4gb3BlcmF0aW9uSWQgIT09IG5vcm1hbGl6ZWRJZFxuICB9KVxuICBpZiAoYmFzZUhhc0l0ZW0pIG5leHQucHVzaCh7IG9wOiAnZGVsZXRlJywgaWQ6IG5vcm1hbGl6ZWRJZCB9KVxuICByZXR1cm4gcmVjb25jaWxlQW5ub3RhdGlvbk9wZXJhdGlvbnMoYmFzZSwgbmV4dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRBbm5vdGF0aW9uRHJhZnQoc3RvcmFnZSwgcHJvamVjdCkge1xuICBjb25zdCBlbXB0eSA9IHtcbiAgICBzY2hlbWFWZXJzaW9uOiBBTk5PVEFUSU9OX1NDSEVNQV9WRVJTSU9OLFxuICAgIHByb2plY3RJZDogYW5ub3RhdGlvblByb2plY3RJZChwcm9qZWN0KSxcbiAgICBiYXNlUmV2aXNpb246IGFubm90YXRpb25CYXNlUmV2aXNpb24ocHJvamVjdCksXG4gICAgb3BlcmF0aW9uczogW10sXG4gIH1cbiAgaWYgKCFzdG9yYWdlPy5nZXRJdGVtKSByZXR1cm4gZW1wdHlcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHN0b3JhZ2UuZ2V0SXRlbShhbm5vdGF0aW9uU3RvcmFnZUtleShwcm9qZWN0KSkgfHwgJ251bGwnKVxuICAgIGlmICghcGFyc2VkIHx8IHBhcnNlZC5zY2hlbWFWZXJzaW9uICE9PSBBTk5PVEFUSU9OX1NDSEVNQV9WRVJTSU9OKSByZXR1cm4gZW1wdHlcbiAgICBpZiAocGFyc2VkLnByb2plY3RJZCAhPT0gZW1wdHkucHJvamVjdElkIHx8ICFBcnJheS5pc0FycmF5KHBhcnNlZC5vcGVyYXRpb25zKSkgcmV0dXJuIGVtcHR5XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmVtcHR5LFxuICAgICAgYmFzZVJldmlzaW9uOiBTdHJpbmcocGFyc2VkLmJhc2VSZXZpc2lvbiB8fCBlbXB0eS5iYXNlUmV2aXNpb24pLFxuICAgICAgb3BlcmF0aW9uczogcmVjb25jaWxlQW5ub3RhdGlvbk9wZXJhdGlvbnMoYmFzZUFubm90YXRpb25zKHByb2plY3QpLCBwYXJzZWQub3BlcmF0aW9ucyksXG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZW1wdHlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUFubm90YXRpb25EcmFmdChzdG9yYWdlLCBwcm9qZWN0LCBvcGVyYXRpb25zKSB7XG4gIGlmICghc3RvcmFnZT8uc2V0SXRlbSB8fCAhc3RvcmFnZT8ucmVtb3ZlSXRlbSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IGtleSA9IGFubm90YXRpb25TdG9yYWdlS2V5KHByb2plY3QpXG4gIHRyeSB7XG4gICAgaWYgKCFvcGVyYXRpb25zPy5sZW5ndGgpIHtcbiAgICAgIHN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBzdG9yYWdlLnNldEl0ZW0oa2V5LCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICBzY2hlbWFWZXJzaW9uOiBBTk5PVEFUSU9OX1NDSEVNQV9WRVJTSU9OLFxuICAgICAgcHJvamVjdElkOiBhbm5vdGF0aW9uUHJvamVjdElkKHByb2plY3QpLFxuICAgICAgYmFzZVJldmlzaW9uOiBhbm5vdGF0aW9uQmFzZVJldmlzaW9uKHByb2plY3QpLFxuICAgICAgb3BlcmF0aW9ucyxcbiAgICB9KSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQW5ub3RhdGlvbkV4cG9ydChwcm9qZWN0LCBhbm5vdGF0aW9ucywgb3BlcmF0aW9ucyA9IFtdKSB7XG4gIHJldHVybiB7XG4gICAgc2NoZW1hVmVyc2lvbjogQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTixcbiAgICBwcm9qZWN0SWQ6IGFubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCksXG4gICAgcHJvamVjdE5hbWU6IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QicsXG4gICAgYmFzZVJldmlzaW9uOiBhbm5vdGF0aW9uQmFzZVJldmlzaW9uKHByb2plY3QpLFxuICAgIGV4cG9ydGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICBhbm5vdGF0aW9uczogKGFubm90YXRpb25zIHx8IFtdKS5tYXAobm9ybWFsaXplQW5ub3RhdGlvbikuZmlsdGVyKEJvb2xlYW4pLFxuICAgIG9wZXJhdGlvbnM6IHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKGJhc2VBbm5vdGF0aW9ucyhwcm9qZWN0KSwgb3BlcmF0aW9ucyksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQW5ub3RhdGlvbkltcG9ydCh2YWx1ZSwgcHJvamVjdCkge1xuICBjb25zdCBwYXJzZWQgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZSh2YWx1ZSkgOiB2YWx1ZVxuICBpZiAoIXBhcnNlZCB8fCBwYXJzZWQuc2NoZW1hVmVyc2lvbiAhPT0gQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTikge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU0RTBEXHU2NTJGXHU2MzAxXHU3Njg0XHU2Q0U4XHU5MUNBIEpTT04gXHU3MjQ4XHU2NzJDJylcbiAgfVxuICBpZiAocGFyc2VkLnByb2plY3RJZCAhPT0gYW5ub3RhdGlvblByb2plY3RJZChwcm9qZWN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgXHU2Q0U4XHU5MUNBIEpTT04gXHU1QzVFXHU0RThFXHU1MTc2XHU0RUQ2XHU5ODc5XHU3NkVFXHVGRjFBJHtwYXJzZWQucHJvamVjdE5hbWUgfHwgcGFyc2VkLnByb2plY3RJZH1gKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwYXJzZWQuYW5ub3RhdGlvbnMpKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NkNFOFx1OTFDQSBKU09OIFx1N0YzQVx1NUMxMSBhbm5vdGF0aW9ucyBcdTY1NzBcdTdFQzQnKVxuICBjb25zdCBhbm5vdGF0aW9ucyA9IHBhcnNlZC5hbm5vdGF0aW9ucy5tYXAobm9ybWFsaXplQW5ub3RhdGlvbikuZmlsdGVyKEJvb2xlYW4pXG4gIGlmIChhbm5vdGF0aW9ucy5sZW5ndGggIT09IHBhcnNlZC5hbm5vdGF0aW9ucy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignXHU2Q0U4XHU5MUNBIEpTT04gXHU1MzA1XHU1NDJCXHU2NUUwXHU2NTQ4XHU2Q0U4XHU5MUNBJylcbiAgY29uc3Qgb3BlcmF0aW9ucyA9IHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKFxuICAgIGJhc2VBbm5vdGF0aW9ucyhwcm9qZWN0KSxcbiAgICBBcnJheS5pc0FycmF5KHBhcnNlZC5vcGVyYXRpb25zKSA/IHBhcnNlZC5vcGVyYXRpb25zIDogW10sXG4gIClcbiAgcmV0dXJuIHsgLi4ucGFyc2VkLCBhbm5vdGF0aW9ucywgb3BlcmF0aW9ucyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEFubm90YXRpb25TeW5jUHJvbXB0KHByb2plY3QsIG9wZXJhdGlvbnMpIHtcbiAgY29uc3QgcHJvamVjdE5hbWUgPSBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSByZWNvbmNpbGVBbm5vdGF0aW9uT3BlcmF0aW9ucyhiYXNlQW5ub3RhdGlvbnMocHJvamVjdCksIG9wZXJhdGlvbnMpXG4gIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgc2NoZW1hVmVyc2lvbjogQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTixcbiAgICBwcm9qZWN0SWQ6IGFubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCksXG4gICAgYmFzZVJldmlzaW9uOiBhbm5vdGF0aW9uQmFzZVJldmlzaW9uKHByb2plY3QpLFxuICAgIG9wZXJhdGlvbnM6IG5vcm1hbGl6ZWQsXG4gIH1cbiAgcmV0dXJuIFtcbiAgICBgXHU4QkY3XHU2MjhBXHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTc2ODRcdTY3MkNcdTY3M0FcdTZDRThcdTkxQ0FcdTU0MENcdTZCNjVcdTUyMzBcdTRFMUFcdTUyQTFcdTZFOTBcdTc4MDFcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTU0MENcdTZCNjVcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTZDRThcdTkxQ0FcdTc2ODRcdTZCNjNcdTVGMEZcdTY1NzBcdTYzNkVcdTY1ODdcdTRFRjZcdTY2MkYgc3JjL2Fubm90YXRpb25zLmpzXHVGRjFCXHU4MkU1XHU0RTBEXHU1QjU4XHU1NzI4XHU1MjE5XHU1MjFCXHU1RUZBXHUzMDAyJyxcbiAgICAnLSBzcmMvYW5ub3RhdGlvbnMuanMgXHU1QkZDXHU1MUZBIGFubm90YXRpb25zUmV2aXNpb24gXHU0RTBFIGFubm90YXRpb25zXHVGRjBDXHU1RTc2XHU3NTMxIHNyYy9wcm9qZWN0LmpzIFx1NUJGQ1x1NTE2NVx1NTQwRVx1NjMwMlx1NTIzMFx1NTQwQ1x1NTQwRFx1NUI1N1x1NkJCNVx1MzAwMicsXG4gICAgJy0gXHU2MzA5XHU2Q0U4XHU5MUNBIGlkIFx1NUU0Mlx1N0I0OVx1NTQwOFx1NUU3Nlx1RkYxQXVwc2VydCBcdTY1QjBcdTU4OUVcdTYyMTZcdTY2RkZcdTYzNjJcdTU0MEMgaWQgXHU2Q0U4XHU5MUNBXHVGRjBDZGVsZXRlIFx1NTIyMFx1OTY2NFx1NTQwQyBpZCBcdTZDRThcdTkxQ0FcdUZGMUJcdTRGRERcdTc1NTlcdTY3MkFcdTZEODlcdTUzQ0FcdTc2ODRcdTZDRThcdTkxQ0FcdTMwMDInLFxuICAgICctIFx1NjZGNFx1NjVCMCBhbm5vdGF0aW9uc1JldmlzaW9uIFx1NEUzQVx1NjVCMFx1NzY4NFx1NTUyRlx1NEUwMFx1NTAzQ1x1MzAwMlx1NEUwRFx1ODk4MVx1NjI4QVx1NkNFOFx1OTFDQVx1NjU4N1x1NUI1N1x1NTE5OVx1OEZEQiBzY3JlZW5zL2xheW91dHMgSlNYXHUzMDAyJyxcbiAgICAnLSBcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdUZGMENcdTVFNzZcdTlBOENcdThCQzFcdTZDRThcdTkxQ0FcdTY4MDdcdThCQjBcdTMwMDFcdTk4NzVcdTk3NjIvXHU2QTIxXHU1NzU3XHU1QjlBXHU0RjREXHU1M0NBXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGXHUzMDAyJyxcbiAgICAnJyxcbiAgICAnXHU1Rjg1XHU1NDBDXHU2QjY1XHU2NENEXHU0RjVDXHVGRjFBJyxcbiAgICAnYGBganNvbicsXG4gICAgSlNPTi5zdHJpbmdpZnkocGF5bG9hZCwgbnVsbCwgMiksXG4gICAgJ2BgYCcsXG4gIF0uam9pbignXFxuJylcbn1cbiIsICJpbXBvcnQge1xuICBhbm5vdGF0aW9uUHJvamVjdElkLFxuICBidWlsZEFubm90YXRpb25TeW5jUHJvbXB0LFxuICBjcmVhdGVBbm5vdGF0aW9uRXhwb3J0LFxuICBwYXJzZUFubm90YXRpb25JbXBvcnQsXG59IGZyb20gJy4vYW5ub3RhdGlvbnMuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZnVuY3Rpb24gbWFrZUFubm90YXRpb25JZCgpIHtcbiAgaWYgKGdsb2JhbFRoaXMuY3J5cHRvPy5yYW5kb21VVUlEKSByZXR1cm4gYG5vdGUtJHtnbG9iYWxUaGlzLmNyeXB0by5yYW5kb21VVUlEKCl9YFxuICByZXR1cm4gYG5vdGUtJHtEYXRlLm5vdygpfS0ke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKDIsIDkpfWBcbn1cblxuZnVuY3Rpb24gZmFsbGJhY2tQb3NpdGlvbihzZWxlY3Rpb24pIHtcbiAgY29uc3QgZWxlbWVudFJlY3QgPSBzZWxlY3Rpb24/LmVsZW1lbnQ/LmdldEJvdW5kaW5nQ2xpZW50UmVjdD8uKClcbiAgY29uc3Qgcm9vdFJlY3QgPSBzZWxlY3Rpb24/LmNvbnRlbnRSb290Py5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/LigpXG4gIGlmICghZWxlbWVudFJlY3QgfHwgIXJvb3RSZWN0IHx8ICFyb290UmVjdC53aWR0aCB8fCAhcm9vdFJlY3QuaGVpZ2h0KSByZXR1cm4gdW5kZWZpbmVkXG4gIHJldHVybiB7XG4gICAgeDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKGVsZW1lbnRSZWN0LnJpZ2h0IC0gcm9vdFJlY3QubGVmdCkgLyByb290UmVjdC53aWR0aCkpLFxuICAgIHk6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChlbGVtZW50UmVjdC50b3AgLSByb290UmVjdC50b3ApIC8gcm9vdFJlY3QuaGVpZ2h0KSksXG4gIH1cbn1cblxuZnVuY3Rpb24gZG93bmxvYWRKc29uKGZpbGVuYW1lLCB2YWx1ZSkge1xuICBjb25zdCBibG9iID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCAyKV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtOCcgfSlcbiAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuICBjb25zdCBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gIGxpbmsuaHJlZiA9IHVybFxuICBsaW5rLmRvd25sb2FkID0gZmlsZW5hbWVcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKVxuICBsaW5rLmNsaWNrKClcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChsaW5rKVxuICAvLyBcdTdFRDkgZmlsZTovLyBcdTRFMEVcdThGODNcdTYxNjJcdTZENEZcdTg5QzhcdTU2NjhcdThEQjNcdTU5MUZcdTY1RjZcdTk1RjRcdTYzQTVcdTdCQTEgQmxvYiBcdTRFMEJcdThGN0RcdUZGMENcdTUxOERcdTkxQ0FcdTY1M0UgVVJMXHUzMDAyXG4gIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IFVSTC5yZXZva2VPYmplY3RVUkwodXJsKSwgMTUwMClcbn1cblxuZnVuY3Rpb24gQW5ub3RhdGlvbkl0ZW0oeyBhbm5vdGF0aW9uLCBwZW5kaW5nLCBvblVwc2VydCwgb25EZWxldGUgfSkge1xuICBjb25zdCBbZWRpdGluZywgc2V0RWRpdGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvbnRlbnQsIHNldENvbnRlbnRdID0gUmVhY3QudXNlU3RhdGUoYW5ub3RhdGlvbi5jb250ZW50KVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiBzZXRDb250ZW50KGFubm90YXRpb24uY29udGVudCksIFthbm5vdGF0aW9uLmNvbnRlbnRdKVxuXG4gIGNvbnN0IGNvbW1pdCA9ICgpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gY29udGVudC50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQpIHJldHVyblxuICAgIG9uVXBzZXJ0KHsgLi4uYW5ub3RhdGlvbiwgY29udGVudDogbm9ybWFsaXplZCwgdXBkYXRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkgfSlcbiAgICBzZXRFZGl0aW5nKGZhbHNlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8bGkgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1pdGVtXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24taXRlbS1tZXRhXCI+XG4gICAgICAgIDxzdHJvbmc+e2Fubm90YXRpb24uc2NyZWVuVGl0bGV9PC9zdHJvbmc+XG4gICAgICAgIDxzcGFuPnthbm5vdGF0aW9uLmFuY2hvci5raW5kID09PSAnbm9kZScgPyAnXHU2QTIxXHU1NzU3XHU2Q0U4XHU5MUNBJyA6ICdcdTk4NzVcdTk3NjJcdTZDRThcdTkxQ0EnfTwvc3Bhbj5cbiAgICAgICAge3BlbmRpbmcgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLXBlbmRpbmdcIj5cdTVGODVcdTU0MENcdTZCNjU8L3NwYW4+IDogPHNwYW4+XHU1MzlGXHU1NzhCXHU1MTg1XHU3RjZFPC9zcGFuPn1cbiAgICAgIDwvZGl2PlxuICAgICAge2Fubm90YXRpb24uYW5jaG9yLmtpbmQgPT09ICdub2RlJyA/IChcbiAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1zZWxlY3RvclwiPnthbm5vdGF0aW9uLmFuY2hvci5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICApIDogbnVsbH1cbiAgICAgIHtlZGl0aW5nID8gKFxuICAgICAgICA8PlxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1lZGl0XCJcbiAgICAgICAgICAgIHZhbHVlPXtjb250ZW50fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Q29udGVudChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWl0ZW0tYWN0aW9uc1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17Y29tbWl0fSBkaXNhYmxlZD17IWNvbnRlbnQudHJpbSgpfT5cdTRGRERcdTVCNTg8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0Q29udGVudChhbm5vdGF0aW9uLmNvbnRlbnQpXG4gICAgICAgICAgICAgIHNldEVkaXRpbmcoZmFsc2UpXG4gICAgICAgICAgICB9fT5cdTUzRDZcdTZEODg8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC8+XG4gICAgICApIDogKFxuICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWNvbnRlbnRcIj57YW5ub3RhdGlvbi5jb250ZW50fTwvcD5cbiAgICAgICl9XG4gICAgICB7IWVkaXRpbmcgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1pdGVtLWFjdGlvbnNcIj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRFZGl0aW5nKHRydWUpfT5cdTdGMTZcdThGOTE8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvbkRlbGV0ZShhbm5vdGF0aW9uLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9saT5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQW5ub3RhdGlvblBhbmVsKHtcbiAgcHJvamVjdCxcbiAgdmlzaWJsZSA9IHRydWUsXG4gIHNlbGVjdGlvbixcbiAgY3VycmVudFNjcmVlbklkLFxuICBhbm5vdGF0aW9ucyxcbiAgb3BlcmF0aW9ucyxcbiAgc3RvcmFnZVNhdmVkLFxuICBvbkFkZCxcbiAgb25VcHNlcnQsXG4gIG9uRGVsZXRlLFxuICBvbkltcG9ydCxcbiAgb25DbGVhckRyYWZ0LFxuICBvbkNsZWFyU2VsZWN0aW9uLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZFNjcmVlbklkID0gc2VsZWN0aW9uPy5zY3JlZW5JZCB8fCBjdXJyZW50U2NyZWVuSWQgfHwgcHJvamVjdC5zY3JlZW5zWzBdPy5pZFxuICBjb25zdCBbc2NvcGUsIHNldFNjb3BlXSA9IFJlYWN0LnVzZVN0YXRlKHNlbGVjdGlvbiA/ICdub2RlJyA6ICdzY3JlZW4nKVxuICBjb25zdCBbc2NyZWVuSWQsIHNldFNjcmVlbklkXSA9IFJlYWN0LnVzZVN0YXRlKHNlbGVjdGVkU2NyZWVuSWQpXG4gIGNvbnN0IFtjb250ZW50LCBzZXRDb250ZW50XSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUoJ2N1cnJlbnQnKVxuICBjb25zdCBbbWVzc2FnZSwgc2V0TWVzc2FnZV0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgZ2VuZXJhdGVkUHJvbXB0ID0gUmVhY3QudXNlTWVtbyhcbiAgICAoKSA9PiBidWlsZEFubm90YXRpb25TeW5jUHJvbXB0KHByb2plY3QsIG9wZXJhdGlvbnMpLFxuICAgIFtvcGVyYXRpb25zLCBwcm9qZWN0XSxcbiAgKVxuICBjb25zdCBbcHJvbXB0LCBzZXRQcm9tcHRdID0gUmVhY3QudXNlU3RhdGUoZ2VuZXJhdGVkUHJvbXB0KVxuICBjb25zdCBbcHJvbXB0RGlydHksIHNldFByb21wdERpcnR5XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2xlYXJBcm1lZCwgc2V0Q2xlYXJBcm1lZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgaW5wdXRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFNjcmVlbklkKHNlbGVjdGVkU2NyZWVuSWQpXG4gICAgaWYgKHNlbGVjdGlvbikgc2V0U2NvcGUoJ25vZGUnKVxuICB9LCBbc2VsZWN0ZWRTY3JlZW5JZCwgc2VsZWN0aW9uXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcHJvbXB0RGlydHkpIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gIH0sIFtnZW5lcmF0ZWRQcm9tcHQsIHByb21wdERpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghY2xlYXJBcm1lZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IHRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q2xlYXJBcm1lZChmYWxzZSksIDUwMDApXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jbGVhclRpbWVvdXQodGltZXIpXG4gIH0sIFtjbGVhckFybWVkXSlcblxuICBjb25zdCBhY3RpdmVTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHNjcmVlbklkKSB8fCBwcm9qZWN0LnNjcmVlbnNbMF1cbiAgY29uc3QgcGVuZGluZ0lkcyA9IG5ldyBTZXQoKG9wZXJhdGlvbnMgfHwgW10pLm1hcCgob3BlcmF0aW9uKSA9PiAoXG4gICAgb3BlcmF0aW9uLm9wID09PSAnZGVsZXRlJyA/IG9wZXJhdGlvbi5pZCA6IG9wZXJhdGlvbi5hbm5vdGF0aW9uPy5pZFxuICApKSlcbiAgY29uc3QgdmlzaWJsZUFubm90YXRpb25zID0gYW5ub3RhdGlvbnMuZmlsdGVyKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgaWYgKGZpbHRlciA9PT0gJ2N1cnJlbnQnKSByZXR1cm4gYW5ub3RhdGlvbi5zY3JlZW5JZCA9PT0gc2VsZWN0ZWRTY3JlZW5JZFxuICAgIHJldHVybiB0cnVlXG4gIH0pXG5cbiAgY29uc3QgYWRkID0gKCkgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBjb250ZW50LnRyaW0oKVxuICAgIGlmICghbm9ybWFsaXplZCB8fCAhYWN0aXZlU2NyZWVuKSByZXR1cm5cbiAgICBjb25zdCB1c2VOb2RlID0gc2NvcGUgPT09ICdub2RlJyAmJiBzZWxlY3Rpb25cbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICBvbkFkZCh7XG4gICAgICBpZDogbWFrZUFubm90YXRpb25JZCgpLFxuICAgICAgc2NyZWVuSWQ6IHVzZU5vZGUgPyBzZWxlY3Rpb24uc2NyZWVuSWQgOiBhY3RpdmVTY3JlZW4uaWQsXG4gICAgICBzY3JlZW5UaXRsZTogdXNlTm9kZSA/IHNlbGVjdGlvbi5zY3JlZW5UaXRsZSA6IGFjdGl2ZVNjcmVlbi50aXRsZSxcbiAgICAgIGFuY2hvcjogdXNlTm9kZVxuICAgICAgICA/IHtcbiAgICAgICAgICBraW5kOiAnbm9kZScsXG4gICAgICAgICAgc2VsZWN0b3I6IHNlbGVjdGlvbi5zZWxlY3RvcixcbiAgICAgICAgICBmYWxsYmFja1Bvc2l0aW9uOiBmYWxsYmFja1Bvc2l0aW9uKHNlbGVjdGlvbiksXG4gICAgICAgIH1cbiAgICAgICAgOiB7IGtpbmQ6ICdzY3JlZW4nIH0sXG4gICAgICBjb250ZW50OiBub3JtYWxpemVkLFxuICAgICAgY3JlYXRlZEF0OiBub3csXG4gICAgICB1cGRhdGVkQXQ6IG5vdyxcbiAgICB9KVxuICAgIHNldENvbnRlbnQoJycpXG4gICAgc2V0TWVzc2FnZSgnXHU2Q0U4XHU5MUNBXHU1REYyXHU0RkREXHU1QjU4XHU1NzI4XHU2NzJDXHU2NzNBXHVGRjBDXHU3QjQ5XHU1Rjg1XHU1NDBDXHU2QjY1XHU1MjMwXHU1MzlGXHU1NzhCXHUzMDAyJylcbiAgfVxuXG4gIGNvbnN0IGV4cG9ydFJldmlldyA9ICgpID0+IHtcbiAgICBjb25zdCBmaWxlID0gY3JlYXRlQW5ub3RhdGlvbkV4cG9ydChwcm9qZWN0LCBhbm5vdGF0aW9ucywgb3BlcmF0aW9ucylcbiAgICBkb3dubG9hZEpzb24oYCR7YW5ub3RhdGlvblByb2plY3RJZChwcm9qZWN0KX0ud2lyZWZyYW1lLWFubm90YXRpb25zLmpzb25gLCBmaWxlKVxuICAgIHNldE1lc3NhZ2UoYFx1NURGMlx1NUJGQ1x1NTFGQSAke2Fubm90YXRpb25zLmxlbmd0aH0gXHU2NzYxXHU2Q0U4XHU5MUNBXHUzMDAyYClcbiAgfVxuXG4gIGNvbnN0IGltcG9ydFJldmlldyA9IGFzeW5jIChmaWxlKSA9PiB7XG4gICAgaWYgKCFmaWxlKSByZXR1cm5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcGFyc2VkID0gcGFyc2VBbm5vdGF0aW9uSW1wb3J0KGF3YWl0IGZpbGUudGV4dCgpLCBwcm9qZWN0KVxuICAgICAgb25JbXBvcnQocGFyc2VkLmFubm90YXRpb25zLCBwYXJzZWQub3BlcmF0aW9ucylcbiAgICAgIHNldE1lc3NhZ2UoYFx1NURGMlx1NUJGQ1x1NTE2NVx1NUU3Nlx1NTQwOFx1NUU3NiAke3BhcnNlZC5hbm5vdGF0aW9ucy5sZW5ndGh9IFx1Njc2MVx1NkNFOFx1OTFDQVx1MzAwMmApXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHNldE1lc3NhZ2UoZXJyb3I/Lm1lc3NhZ2UgfHwgJ1x1NUJGQ1x1NTE2NVx1NTkzMVx1OEQyNVx1MzAwMicpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChpbnB1dFJlZi5jdXJyZW50KSBpbnB1dFJlZi5jdXJyZW50LnZhbHVlID0gJydcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwgd2YtYW5ub3RhdGlvbi1wYW5lbFwiIGFyaWEtbGFiZWw9XCJcdTUzOUZcdTU3OEJcdTZDRThcdTkxQ0FcIiBoaWRkZW49eyF2aXNpYmxlfT5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtdGl0bGVcIj5cdTUzOUZcdTU3OEJcdTZDRThcdTkxQ0E8L3N0cm9uZz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtY291bnRcIj57YW5ub3RhdGlvbnMubGVuZ3RofSBcdTY3NjFcdTZDRThcdTkxQ0E8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1ib2R5XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTZERkJcdTUyQTBcdTZDRThcdTkxQ0E8L2gyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1zY29wZVwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZDRThcdTkxQ0FcdTgzMDNcdTU2RjRcIj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NvcGUgPT09ICdzY3JlZW4nID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2NvcGUoJ3NjcmVlbicpfVxuICAgICAgICAgICAgPlx1OTg3NVx1OTc2MjwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY29wZSA9PT0gJ25vZGUnID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFzZWxlY3Rpb259XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNjb3BlKCdub2RlJyl9XG4gICAgICAgICAgICA+XHU2MjQwXHU5MDA5XHU2QTIxXHU1NzU3PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Njb3BlID09PSAnbm9kZScgJiYgc2VsZWN0aW9uID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLXRhcmdldFwiPlxuICAgICAgICAgICAgICA8c3Bhbj57c2VsZWN0aW9uLnNjcmVlblRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGNvZGU+e3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e29uQ2xlYXJTZWxlY3Rpb259Plx1NTNENlx1NkQ4OFx1OTAwOVx1NjJFOTwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+XHU5ODc1XHU5NzYyPC9zcGFuPlxuICAgICAgICAgICAgICA8c2VsZWN0IHZhbHVlPXtzY3JlZW5JZH0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0U2NyZWVuSWQoZXZlbnQudGFyZ2V0LnZhbHVlKX0+XG4gICAgICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT17c2NyZWVuLmlkfSBrZXk9e3NjcmVlbi5pZH0+e3NjcmVlbi50aXRsZX0gXHUwMEI3IHtzY3JlZW4uaWR9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NkNFOFx1OTFDQVx1NTE4NVx1NUJCOTwvc3Bhbj5cbiAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICB2YWx1ZT17Y29udGVudH1cbiAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3Njb3BlID09PSAnbm9kZScgPyAnXHU4QkY0XHU2NjBFXHUzMDAxXHU2M0QwXHU5NUVFXHU2MjE2XHU4QkIwXHU1RjU1XHU4RkQ5XHU0RTJBXHU2QTIxXHU1NzU3XHU3Njg0XHU4QkJFXHU4QkExXHU1MUIzXHU3QjU2JyA6ICdcdThCRjRcdTY2MEVcdTMwMDFcdTYzRDBcdTk1RUVcdTYyMTZcdThCQjBcdTVGNTVcdTY1NzRcdTRFMkFcdTk4NzVcdTk3NjJcdTc2ODRcdThCQkVcdThCQTFcdTUxQjNcdTdCNTYnfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRDb250ZW50KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWFkZFwiIGRpc2FibGVkPXshY29udGVudC50cmltKCl9IG9uQ2xpY2s9e2FkZH0+XG4gICAgICAgICAgICBcdTZERkJcdTUyQTBcdTVFNzZcdTRGRERcdTVCNThcdTUyMzBcdTY3MkNcdTY3M0FcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9e2B3Zi1hbm5vdGF0aW9uLXNhdmUtc3RhdGUke3N0b3JhZ2VTYXZlZCA/ICcnIDogJyBpcy1lcnJvcid9YH0+XG4gICAgICAgICAgICB7c3RvcmFnZVNhdmVkID8gYCR7b3BlcmF0aW9ucy5sZW5ndGh9IFx1Njc2MVx1NjcyQ1x1NjczQVx1NTNEOFx1NjZGNFx1NUY4NVx1NTQwQ1x1NkI2NWAgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU2NUUwXHU2Q0Q1XHU0RkREXHU1QjU4XHU2NzJDXHU2NzNBXHU4MzQ5XHU3QTNGXHVGRjBDXHU4QkY3XHU1MTQ4XHU1QkZDXHU1MUZBXHU2Q0U4XHU5MUNBIEpTT04nfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTZDRThcdTkxQ0FcdTUyMTdcdTg4Njg8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWZpbHRlcnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPXtmaWx0ZXIgPT09ICdjdXJyZW50JyA/ICdpcy1hY3RpdmUnIDogJyd9IG9uQ2xpY2s9eygpID0+IHNldEZpbHRlcignY3VycmVudCcpfT5cdTVGNTNcdTUyNERcdTk4NzU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPXtmaWx0ZXIgPT09ICdhbGwnID8gJ2lzLWFjdGl2ZScgOiAnJ30gb25DbGljaz17KCkgPT4gc2V0RmlsdGVyKCdhbGwnKX0+XHU1MTY4XHU5MEU4PC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7dmlzaWJsZUFubm90YXRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWl0ZW1zXCI+XG4gICAgICAgICAgICAgIHt2aXNpYmxlQW5ub3RhdGlvbnMubWFwKChhbm5vdGF0aW9uKSA9PiAoXG4gICAgICAgICAgICAgICAgPEFubm90YXRpb25JdGVtXG4gICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uPXthbm5vdGF0aW9ufVxuICAgICAgICAgICAgICAgICAgcGVuZGluZz17cGVuZGluZ0lkcy5oYXMoYW5ub3RhdGlvbi5pZCl9XG4gICAgICAgICAgICAgICAgICBrZXk9e2Fubm90YXRpb24uaWR9XG4gICAgICAgICAgICAgICAgICBvblVwc2VydD17b25VcHNlcnR9XG4gICAgICAgICAgICAgICAgICBvbkRlbGV0ZT17b25EZWxldGV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDlcdTRFMkFcdTgzMDNcdTU2RjRcdThGRDhcdTZDQTFcdTY3MDlcdTZDRThcdTkxQ0FcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NTQwQ1x1NkI2NVx1NEUwRVx1NEVBNFx1NjM2MjwvaDI+XG4gICAgICAgICAgICB7b3BlcmF0aW9ucy5sZW5ndGggPyAoXG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gICAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkoZmFsc2UpXG4gICAgICAgICAgICAgIH19Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge29wZXJhdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU1OTBEXHU1MjM2IFByb21wdCBcdTdFRDkgTExNXHVGRjBDXHU1MzczXHU1M0VGXHU2MjhBXHU2NzJDXHU2NzNBXHU1M0Q4XHU2NkY0XHU2QjYzXHU1RjBGXHU1MTk5XHU1MTY1XHU1MzlGXHU1NzhCXHU2RTkwXHU3ODAxXHUzMDAyPC9wPlxuICAgICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0IHdmLWFubm90YXRpb24tcHJvbXB0XCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17cHJvbXB0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgICAgICBzZXRQcm9tcHREaXJ0eSh0cnVlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jb3B5XCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0KHByb21wdCkudGhlbigoKSA9PiBzZXRNZXNzYWdlKCdcdTU0MENcdTZCNjUgUHJvbXB0IFx1NURGMlx1NTkwRFx1NTIzNlx1MzAwMicpKVxuICAgICAgICAgICAgICB9fT5cdTU5MERcdTUyMzZcdTU0MENcdTZCNjUgUHJvbXB0PC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU2MjQwXHU2NzA5XHU2NzJDXHU2NzNBXHU1M0Q4XHU2NkY0XHU5MEZEXHU1REYyXHU1MzA1XHU1NDJCXHU1NzI4XHU1MzlGXHU1NzhCXHU1MTg1XHU3RjZFXHU2NTcwXHU2MzZFXHU0RTJEXHUzMDAyPC9wPn1cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tZmlsZS1hY3Rpb25zXCI+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtleHBvcnRSZXZpZXd9Plx1NUJGQ1x1NTFGQVx1NkNFOFx1OTFDQSBKU09OPC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBpbnB1dFJlZi5jdXJyZW50Py5jbGljaygpfT5cdTVCRkNcdTUxNjVcdTZDRThcdTkxQ0EgSlNPTjwvYnV0dG9uPlxuICAgICAgICAgICAge29wZXJhdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFjbGVhckFybWVkKSB7XG4gICAgICAgICAgICAgICAgICBzZXRDbGVhckFybWVkKHRydWUpXG4gICAgICAgICAgICAgICAgICBzZXRNZXNzYWdlKCdcdTUxOERcdTZCMjFcdTcwQjlcdTUxRkJcdTc4NkVcdThCQTRcdTZFMDVcdTk2NjRcdUZGMUJcdTUzOUZcdTU3OEJcdTUxODVcdTdGNkVcdTZDRThcdTkxQ0FcdTRFMERcdTRGMUFcdTUzRDdcdTVGNzFcdTU0Q0RcdTMwMDInKVxuICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG9uQ2xlYXJEcmFmdCgpXG4gICAgICAgICAgICAgICAgc2V0Q2xlYXJBcm1lZChmYWxzZSlcbiAgICAgICAgICAgICAgICBzZXRNZXNzYWdlKCdcdTY3MkNcdTY3M0FcdTgzNDlcdTdBM0ZcdTVERjJcdTZFMDVcdTk2NjRcdTMwMDInKVxuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICB7Y2xlYXJBcm1lZCA/ICdcdTc4NkVcdThCQTRcdTZFMDVcdTk2NjRcdTY3MkNcdTY3M0FcdTgzNDlcdTdBM0YnIDogJ1x1NkUwNVx1OTY2NFx1NjcyQ1x1NjczQVx1ODM0OVx1N0EzRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1maWxlLWlucHV0XCJcbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIGFjY2VwdD1cImFwcGxpY2F0aW9uL2pzb24sLmpzb25cIlxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gaW1wb3J0UmV2aWV3KGV2ZW50LnRhcmdldC5maWxlcz8uWzBdKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHttZXNzYWdlID8gPHAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1tZXNzYWdlXCIgcm9sZT1cInN0YXR1c1wiPnttZXNzYWdlfTwvcD4gOiBudWxsfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiZnVuY3Rpb24gZXNjYXBlQXR0cmlidXRlKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdFJlY3QocmVjdCwgY2xpcCkge1xuICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBjbGlwLmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4ocmVjdC5yaWdodCwgY2xpcC5yaWdodClcbiAgY29uc3QgdG9wID0gTWF0aC5tYXgocmVjdC50b3AsIGNsaXAudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihyZWN0LmJvdHRvbSwgY2xpcC5ib3R0b20pXG4gIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHJldHVybiBudWxsXG4gIHJldHVybiB7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSB9XG59XG5cbmZ1bmN0aW9uIGFubm90YXRpb25Qb3NpdGlvbihib2FyZCwgYW5ub3RhdGlvbiwgcHJldmlvdXMpIHtcbiAgY29uc3Qgc2NyZWVuID0gYm9hcmQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2NyZWVuLWlkPVwiJHtlc2NhcGVBdHRyaWJ1dGUoYW5ub3RhdGlvbi5zY3JlZW5JZCl9XCJdYClcbiAgY29uc3QgY29udGVudCA9IHNjcmVlbj8ucXVlcnlTZWxlY3RvcignLndmLXNjcmVlbi1jb250ZW50JylcbiAgaWYgKCFjb250ZW50KSByZXR1cm4gbnVsbFxuXG4gIGxldCBlbGVtZW50ID0gY29udGVudFxuICBpZiAoYW5ub3RhdGlvbi5hbmNob3I/LmtpbmQgPT09ICdub2RlJykge1xuICAgIHRyeSB7XG4gICAgICBlbGVtZW50ID0gYm9hcmQucXVlcnlTZWxlY3Rvcihhbm5vdGF0aW9uLmFuY2hvci5zZWxlY3RvcilcbiAgICB9IGNhdGNoIHtcbiAgICAgIGVsZW1lbnQgPSBudWxsXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgY29udGVudFJlY3QgPSBjb250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGxldCBiYXNlTGVmdFxuICBsZXQgYmFzZVRvcFxuICBsZXQgb3JwaGFuZWQgPSBmYWxzZVxuXG4gIGlmIChlbGVtZW50Py5pc0Nvbm5lY3RlZCAmJiBjb250ZW50LmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgY29uc3QgdmlzaWJsZSA9IGludGVyc2VjdFJlY3QoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgY29udGVudFJlY3QpXG4gICAgaWYgKCF2aXNpYmxlKSByZXR1cm4gbnVsbFxuICAgIGJhc2VMZWZ0ID0gdmlzaWJsZS5yaWdodCAtIGJvYXJkUmVjdC5sZWZ0XG4gICAgYmFzZVRvcCA9IHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcFxuICB9IGVsc2Uge1xuICAgIGNvbnN0IGZhbGxiYWNrID0gYW5ub3RhdGlvbi5hbmNob3I/LmZhbGxiYWNrUG9zaXRpb24gfHwgeyB4OiAwLjk2LCB5OiAwLjA0IH1cbiAgICBiYXNlTGVmdCA9IGNvbnRlbnRSZWN0LmxlZnQgLSBib2FyZFJlY3QubGVmdCArIGNvbnRlbnRSZWN0LndpZHRoICogZmFsbGJhY2sueFxuICAgIGJhc2VUb3AgPSBjb250ZW50UmVjdC50b3AgLSBib2FyZFJlY3QudG9wICsgY29udGVudFJlY3QuaGVpZ2h0ICogZmFsbGJhY2sueVxuICAgIG9ycGhhbmVkID0gYW5ub3RhdGlvbi5hbmNob3I/LmtpbmQgPT09ICdub2RlJ1xuICB9XG5cbiAgY29uc3Qgb3ZlcmxhcCA9IHByZXZpb3VzLmZpbHRlcihcbiAgICAoaXRlbSkgPT4gTWF0aC5hYnMoaXRlbS5iYXNlTGVmdCAtIGJhc2VMZWZ0KSA8IDMgJiYgTWF0aC5hYnMoaXRlbS5iYXNlVG9wIC0gYmFzZVRvcCkgPCAzLFxuICApLmxlbmd0aFxuICByZXR1cm4ge1xuICAgIGtleTogYW5ub3RhdGlvbi5pZCxcbiAgICBhbm5vdGF0aW9uLFxuICAgIGJhc2VMZWZ0OiBNYXRoLnJvdW5kKGJhc2VMZWZ0KSxcbiAgICBiYXNlVG9wOiBNYXRoLnJvdW5kKGJhc2VUb3ApLFxuICAgIGxlZnQ6IE1hdGgucm91bmQoYmFzZUxlZnQgKyBvdmVybGFwICogMTUpLFxuICAgIHRvcDogTWF0aC5yb3VuZChiYXNlVG9wKSxcbiAgICBvcnBoYW5lZCxcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBhbm5vdGF0aW9ucykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgcG9zaXRpb25zID0gW11cbiAgZm9yIChjb25zdCBhbm5vdGF0aW9uIG9mIGFubm90YXRpb25zKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBhbm5vdGF0aW9uUG9zaXRpb24oYm9hcmQsIGFubm90YXRpb24sIHBvc2l0aW9ucylcbiAgICBpZiAocG9zaXRpb24pIHBvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKVxuICB9XG4gIHJldHVybiBwb3NpdGlvbnNcbn1cblxuZnVuY3Rpb24gc2FtZVBvc2l0aW9ucyhsZWZ0LCByaWdodCkge1xuICBpZiAobGVmdC5sZW5ndGggIT09IHJpZ2h0Lmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBsZWZ0LmV2ZXJ5KChpdGVtLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG90aGVyID0gcmlnaHRbaW5kZXhdXG4gICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBvdGhlci5rZXlcbiAgICAgICYmIGl0ZW0uYW5ub3RhdGlvbiA9PT0gb3RoZXIuYW5ub3RhdGlvblxuICAgICAgJiYgaXRlbS5sZWZ0ID09PSBvdGhlci5sZWZ0XG4gICAgICAmJiBpdGVtLnRvcCA9PT0gb3RoZXIudG9wXG4gICAgICAmJiBpdGVtLm9ycGhhbmVkID09PSBvdGhlci5vcnBoYW5lZFxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQW5ub3RhdGlvbk1hcmtlcnMoeyBib2FyZFJlZiwgYW5ub3RhdGlvbnMsIG9uT3BlblBhbmVsIH0pIHtcbiAgY29uc3QgW3Bvc2l0aW9ucywgc2V0UG9zaXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbYWN0aXZlS2V5LCBzZXRBY3RpdmVLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZnJhbWVSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCByZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSByZXNvbHZlUG9zaXRpb25zKGJvYXJkUmVmLmN1cnJlbnQsIGFubm90YXRpb25zKVxuICAgIHNldFBvc2l0aW9ucygoY3VycmVudCkgPT4gc2FtZVBvc2l0aW9ucyhjdXJyZW50LCBuZXh0KSA/IGN1cnJlbnQgOiBuZXh0KVxuICB9LCBbYW5ub3RhdGlvbnMsIGJvYXJkUmVmXSlcblxuICBjb25zdCBzY2hlZHVsZVJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIGZyYW1lUmVmLmN1cnJlbnQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGZyYW1lUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICByZWZyZXNoKClcbiAgICB9KVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgLy8gXHU2Q0U4XHU5MUNBXHU2NTcwXHU3RUM0XHU1M0Q4XHU1MzE2XHU1NDBFXHU1NzI4XHU2NzJDXHU2QjIxIGNvbW1pdCBcdTdBQ0JcdTUyM0JcdTVCOUFcdTRGNERcdUZGMENcdTkwN0ZcdTUxNERcdTY1RTcgY2xpY2svcG9pbnRlciBcdTc2RDFcdTU0MkNcdTU2NjhcbiAgLy8gXHU3NTI4XHU0RTBBXHU0RTAwXHU3MjQ4XHU5NUVEXHU1MzA1XHU4OTg2XHU3NkQ2XHU1MjFBXHU2MzkyXHU5NjFGXHU3Njg0IHJlcXVlc3RBbmltYXRpb25GcmFtZVx1MzAwMlxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIHJlZnJlc2goKVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW3NjaGVkdWxlUmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aXZlS2V5ICYmICFwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KSkgc2V0QWN0aXZlS2V5KG51bGwpXG4gIH0sIFthY3RpdmVLZXksIHBvc2l0aW9uc10pXG5cbiAgY29uc3QgYWN0aXZlID0gcG9zaXRpb25zLmZpbmQoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSlcbiAgY29uc3QgYm9hcmRXaWR0aCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudFdpZHRoIHx8IDBcbiAgY29uc3QgYm9hcmRIZWlnaHQgPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgfHwgMFxuICBjb25zdCBidWJibGVMZWZ0ID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS5sZWZ0ICsgMTYsIGJvYXJkV2lkdGggLSAzMzYpKSA6IDBcbiAgY29uc3QgYnViYmxlVG9wID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS50b3AgKyAyNCwgYm9hcmRIZWlnaHQgLSAxOTYpKSA6IDBcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1tYXJrZXJzXCIgYXJpYS1sYWJlbD1cIlx1NkNFOFx1OTFDQVx1NjgwN1x1OEJCMFwiPlxuICAgICAge3Bvc2l0aW9ucy5tYXAoKHBvc2l0aW9uLCBpbmRleCkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtgd2YtYW5ub3RhdGlvbi1tYXJrZXIke2FjdGl2ZUtleSA9PT0gcG9zaXRpb24ua2V5ID8gJyBpcy1hY3RpdmUnIDogJyd9JHtwb3NpdGlvbi5vcnBoYW5lZCA/ICcgaXMtb3JwaGFuZWQnIDogJyd9YH1cbiAgICAgICAgICBrZXk9e3Bvc2l0aW9uLmtleX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU2Q0U4XHU5MUNBICR7aW5kZXggKyAxfVx1RkYxQSR7cG9zaXRpb24uYW5ub3RhdGlvbi5jb250ZW50fWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogcG9zaXRpb24ubGVmdCwgdG9wOiBwb3NpdGlvbi50b3AgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRBY3RpdmVLZXkoKGN1cnJlbnQpID0+IGN1cnJlbnQgPT09IHBvc2l0aW9uLmtleSA/IG51bGwgOiBwb3NpdGlvbi5rZXkpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpbmRleCArIDF9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICB7YWN0aXZlID8gKFxuICAgICAgICA8YXNpZGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLW1hcmtlci1wb3BvdmVyXCJcbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBidWJibGVMZWZ0LCB0b3A6IGJ1YmJsZVRvcCB9fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTZDRThcdTkxQ0FcdUZGMUEke2FjdGl2ZS5hbm5vdGF0aW9uLnNjcmVlblRpdGxlfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgIHthY3RpdmUuYW5ub3RhdGlvbi5zY3JlZW5UaXRsZX0gXHUwMEI3IHthY3RpdmUuYW5ub3RhdGlvbi5hbmNob3Iua2luZCA9PT0gJ25vZGUnID8gJ1x1NkEyMVx1NTc1NycgOiAnXHU5ODc1XHU5NzYyJ31cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLW1hcmtlci1jbG9zZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVLZXkobnVsbCl9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIHthY3RpdmUub3JwaGFuZWQgPyA8cCBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLW9ycGhhbmVkXCI+XHU1MzlGXHU1QjlBXHU0RjREXHU1REYyXHU1OTMxXHU2NTQ4XHVGRjBDXHU1RjUzXHU1MjREXHU2NjNFXHU3OTNBXHU1OTA3XHU3NTI4XHU0RjREXHU3RjZFXHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1tYXJrZXItY29udGVudFwiPnthY3RpdmUuYW5ub3RhdGlvbi5jb250ZW50fTwvcD5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tbWFya2VyLW1vcmVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KG51bGwpXG4gICAgICAgICAgICBvbk9wZW5QYW5lbChhY3RpdmUuYW5ub3RhdGlvbilcbiAgICAgICAgICB9fT5cdTY3RTVcdTc3MEJcdTUxNjhcdTkwRTg8L2J1dHRvbj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiY29uc3QgU0hPUlRDVVRfREVGSU5JVElPTlMgPSBbXG4gIHsgaWQ6ICdjYW52YXMnLCBzdWZmaXg6ICcxJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTc1M0JcdTY3N0ZcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdkZW1vJywgc3VmZml4OiAnMicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW50ZXJhY3Rpb24nLCBzdWZmaXg6ICdJJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUzRUZcdTRFQTRcdTRFOTIgLyBcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInIH0sXG4gIHsgaWQ6ICdyZXZpZXcnLCBzdWZmaXg6ICdNJywgbGFiZWw6ICdcdTVGMDBcdTU0MkZcdTYyMTZcdTUxNzNcdTk1RURcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdpbW1lcnNpdmUnLCBzdWZmaXg6ICczJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdicm93c2VyLWZ1bGxzY3JlZW4nLCBzdWZmaXg6ICdTaGlmdCtGJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnIH0sXG4gIHsgaWQ6ICdob3RzcG90cycsIHN1ZmZpeDogJ0gnLCBsYWJlbDogJ1x1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQScgfSxcbiAgeyBpZDogJ3NwYWNlJywga2V5czogJ1NwYWNlJywgbGFiZWw6ICdcdTYzMDlcdTRGNEZcdTRFMzRcdTY1RjZcdTYyRDZcdTUyQThcdTc1M0JcdTVFMDMnIH0sXG4gIHsgaWQ6ICdlc2NhcGUnLCBrZXlzOiAnRXNjJywgbGFiZWw6ICdcdTUxNzNcdTk1RURcdTVGNTNcdTUyNERcdTk3NjJcdTY3N0ZcdTYyMTZcdTkwMDBcdTUxRkFcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdoZWxwJywga2V5czogJz8nLCBsYWJlbDogJ1x1NjI1M1x1NUYwMFx1NjIxNlx1NTE3M1x1OTVFRFx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTWFjUGxhdGZvcm0oKSB7XG4gIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAvTWFjfGlQaG9uZXxpUGFkfGlQb2QvaS50ZXN0KGAke25hdmlnYXRvci5wbGF0Zm9ybSB8fCAnJ30gJHtuYXZpZ2F0b3IudXNlckFnZW50IHx8ICcnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGN1dE1vZGlmaWVyTGFiZWwoaXNNYWMgPSBpc01hY1BsYXRmb3JtKCkpIHtcbiAgcmV0dXJuIGlzTWFjID8gJ0N0cmwnIDogJ0FsdCdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvYXJkU2hvcnRjdXRzKGlzTWFjID0gaXNNYWNQbGF0Zm9ybSgpKSB7XG4gIGNvbnN0IG1vZGlmaWVyID0gc2hvcnRjdXRNb2RpZmllckxhYmVsKGlzTWFjKVxuICByZXR1cm4gU0hPUlRDVVRfREVGSU5JVElPTlMubWFwKChzaG9ydGN1dCkgPT4gc2hvcnRjdXQua2V5c1xuICAgID8gc2hvcnRjdXRcbiAgICA6IHsgLi4uc2hvcnRjdXQsIGtleXM6IGAke21vZGlmaWVyfSske3Nob3J0Y3V0LnN1ZmZpeH1gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBCT0FSRF9TSE9SVENVVFMgPSBnZXRCb2FyZFNob3J0Y3V0cygpXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgY29uc3QgZWxlbWVudCA9IHRhcmdldC5ub2RlVHlwZSA9PT0gMyA/IHRhcmdldC5wYXJlbnRFbGVtZW50IDogdGFyZ2V0XG4gIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZVxuICBpZiAodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1RFWFRBUkVBJyB8fCB0YWcgPT09ICdTRUxFQ1QnKSByZXR1cm4gdHJ1ZVxuICBpZiAoZWxlbWVudC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhZWxlbWVudC5jbG9zZXN0Py4oJ1tjb250ZW50ZWRpdGFibGVdOm5vdChbY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIl0pJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0Y3V0SWRGb3JFdmVudChldmVudCwgaXNNYWMgPSBpc01hY1BsYXRmb3JtKCkpIHtcbiAgaWYgKCFldmVudCB8fCBldmVudC5yZXBlYXQpIHJldHVybiBudWxsXG4gIGNvbnN0IGtleSA9IFN0cmluZyhldmVudC5rZXkgfHwgJycpLnRvTG93ZXJDYXNlKClcbiAgY29uc3QgbW9kaWZpZXIgPSBpc01hYyA/IGV2ZW50LmN0cmxLZXkgOiBldmVudC5hbHRLZXlcblxuICBpZiAoIW1vZGlmaWVyKSB7XG4gICAgaWYgKCFldmVudC5zaGlmdEtleSAmJiBrZXkgPT09ICdlc2NhcGUnKSByZXR1cm4gJ2VzY2FwZSdcbiAgICBpZiAoZXZlbnQua2V5ID09PSAnPycpIHJldHVybiAnaGVscCdcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgaWYgKGV2ZW50LnNoaWZ0S2V5KSByZXR1cm4ga2V5ID09PSAnZicgPyAnYnJvd3Nlci1mdWxsc2NyZWVuJyA6IG51bGxcbiAgaWYgKGtleSA9PT0gJzEnKSByZXR1cm4gJ2NhbnZhcydcbiAgaWYgKGtleSA9PT0gJzInKSByZXR1cm4gJ2RlbW8nXG4gIGlmIChrZXkgPT09ICdpJykgcmV0dXJuICdpbnRlcmFjdGlvbidcbiAgaWYgKGtleSA9PT0gJ20nKSByZXR1cm4gJ3JldmlldydcbiAgaWYgKGtleSA9PT0gJzMnKSByZXR1cm4gJ2ltbWVyc2l2ZSdcbiAgaWYgKGtleSA9PT0gJ2gnKSByZXR1cm4gJ2hvdHNwb3RzJ1xuICByZXR1cm4gbnVsbFxufVxuIiwgImltcG9ydCB7IGdldEJvYXJkU2hvcnRjdXRzIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmZ1bmN0aW9uIFBhbmVsU2hlbGwoeyBpZCwgdGl0bGUsIGFyaWFMYWJlbCwgb25DbG9zZSwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBjbG9zZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCByZXR1cm5Gb2N1c1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuRm9jdXNSZWYuY3VycmVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICBjbG9zZVJlZi5jdXJyZW50Py5mb2N1cygpXG4gICAgcmV0dXJuICgpID0+IHJldHVybkZvY3VzUmVmLmN1cnJlbnQ/LmZvY3VzPy4oKVxuICB9LCBbXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWxheWVyXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBvbkNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNlY3Rpb24gaWQ9e2lkfSBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgPGJ1dHRvbiByZWY9e2Nsb3NlUmVmfSB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfSBhcmlhLWxhYmVsPXtgXHU1MTczXHU5NUVEJHt0aXRsZX1gfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2hvcnRjdXRIZWxwKHtcbiAgZGVtb0F2YWlsYWJsZSxcbiAgc2hvd0NhbnZhc0luZGV4LFxuICBvblNob3dDYW52YXNJbmRleENoYW5nZSxcbiAgc2hvd0Fubm90YXRpb25NYXJrZXJzLFxuICBvblNob3dBbm5vdGF0aW9uTWFya2Vyc0NoYW5nZSxcbiAgdHJhY2twYWRab29tLFxuICBvblRyYWNrcGFkWm9vbUNoYW5nZSxcbiAgem9vbVNlbnNpdGl2aXR5LFxuICBvblpvb21TZW5zaXRpdml0eUNoYW5nZSxcbiAgb25DbG9zZSxcbn0pIHtcbiAgY29uc3Qgc2hvcnRjdXRzID0gZ2V0Qm9hcmRTaG9ydGN1dHMoKVxuICByZXR1cm4gKFxuICAgIDxQYW5lbFNoZWxsIGlkPVwid2YtYm9hcmQtdXRpbGl0eVwiIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXCIgYXJpYUxhYmVsPVwiXHU1RTJFXHU1MkE5XHUzMDAxXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RTBFXHU4QkJFXHU3RjZFXCIgb25DbG9zZT17b25DbG9zZX0+XG4gICAgICA8ZGwgY2xhc3NOYW1lPVwid2Ytc2hvcnRjdXQtbGlzdFwiPlxuICAgICAgICB7c2hvcnRjdXRzLm1hcCgoc2hvcnRjdXQpID0+IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17c2hvcnRjdXQuaWQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSA/ICdpcy1kaXNhYmxlZCcgOiAnJ30ga2V5PXtzaG9ydGN1dC5pZH0+XG4gICAgICAgICAgICA8ZHQ+PGtiZD57c2hvcnRjdXQua2V5c308L2tiZD48L2R0PlxuICAgICAgICAgICAgPGRkPntzaG9ydGN1dC5sYWJlbH17c2hvcnRjdXQuaWQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSA/ICdcdUZGMDhcdTVGNTNcdTUyNERcdTRFMERcdTUzRUZcdTc1MjhcdUZGMDknIDogJyd9PC9kZD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2RsPlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbm90ZVwiPlx1NTcyOFx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMVx1NjU4N1x1NjcyQ1x1NTdERlx1MzAwMVx1NEUwQlx1NjJDOVx1Njg0Nlx1NTQ4Q1x1NTNFRlx1N0YxNlx1OEY5MVx1NTE4NVx1NUJCOVx1NEUyRFx1NEUwRFx1NEYxQVx1ODlFNlx1NTNEMVx1NjY2RVx1OTAxQVx1NUZFQlx1NjM3N1x1OTUyRVx1MzAwMjwvcD5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLXNlY3Rpb25cIiBhcmlhLWxhYmVsbGVkYnk9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XG4gICAgICAgIDxoMiBpZD1cIndmLWJvYXJkLWluZGV4LXNldHRpbmctdGl0bGVcIj5cdTc1M0JcdTY3N0ZcdThCQkVcdTdGNkU8L2gyPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtYm9hcmQtc2V0dGluZy1yb3dcIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU2NjNFXHU3OTNBXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1PC9zdHJvbmc+XG4gICAgICAgICAgICA8c21hbGw+XHU1NzI4XHU3NTNCXHU2NzdGXHU0RTBBXHU2NjNFXHU3OTNBXHU1M0VGXHU2MkQ2XHU2MkZEXHU3Njg0XHU5ODc1XHU5NzYyXHU3RDIyXHU1RjE1PC9zbWFsbD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgY2hlY2tlZD17c2hvd0NhbnZhc0luZGV4fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25TaG93Q2FudmFzSW5kZXhDaGFuZ2UoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1zZXR0aW5nLXJvd1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHN0cm9uZz5cdTlFRDhcdThCQTRcdTY2M0VcdTc5M0FcdTZDRThcdTkxQ0FcdTY4MDdcdThCQjA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxzbWFsbD5cdTUxNzNcdTk1RURcdTU0MEVcdTRFQzVcdTU3MjhcdThGREJcdTUxNjVcdTZDRThcdTkxQ0FcdTZBMjFcdTVGMEZcdTY1RjZcdTY2M0VcdTc5M0E8L3NtYWxsPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBjaGVja2VkPXtzaG93QW5ub3RhdGlvbk1hcmtlcnN9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblNob3dBbm5vdGF0aW9uTWFya2Vyc0NoYW5nZShldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1ODlFNlx1NjQ3OFx1Njc3Rlx1N0YyOVx1NjUzRTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPk1hYyBcdTk5OTZcdTZCMjFcdTlFRDhcdThCQTRcdTVGMDBcdTU0MkZcdUZGMUJcdTYzMDlcdTUzQ0NcdTYzMDdcdTYyNEJcdTUyQkZcdTVFNDVcdTVFQTZcdThGREVcdTdFRURcdTdGMjlcdTY1M0U8L3NtYWxsPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBjaGVja2VkPXt0cmFja3BhZFpvb219XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblRyYWNrcGFkWm9vbUNoYW5nZShldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT17YHdmLWJvYXJkLXNldHRpbmctcmFuZ2Uke3RyYWNrcGFkWm9vbSA/ICcnIDogJyBpcy1kaXNhYmxlZCd9YH0+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1N0YyOVx1NjUzRVx1NzA3NVx1NjU0Rlx1NUVBNjwvc3Ryb25nPlxuICAgICAgICAgICAgPG91dHB1dD57TWF0aC5yb3VuZCh6b29tU2Vuc2l0aXZpdHkgKiAxMDApfSU8L291dHB1dD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwicmFuZ2VcIlxuICAgICAgICAgICAgbWluPVwiMC4yNVwiXG4gICAgICAgICAgICBtYXg9XCIyXCJcbiAgICAgICAgICAgIHN0ZXA9XCIwLjA1XCJcbiAgICAgICAgICAgIHZhbHVlPXt6b29tU2Vuc2l0aXZpdHl9XG4gICAgICAgICAgICBkaXNhYmxlZD17IXRyYWNrcGFkWm9vbX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uWm9vbVNlbnNpdGl2aXR5Q2hhbmdlKE51bWJlcihldmVudC50YXJnZXQudmFsdWUpKX1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTg5RTZcdTY0NzhcdTY3N0ZcdTdGMjlcdTY1M0VcdTcwNzVcdTY1NEZcdTVFQTZcIlxuICAgICAgICAgIC8+XG4gICAgICAgICAgPHNtYWxsPjxzcGFuPlx1NjZGNFx1N0VDNlx1ODE3Qjwvc3Bhbj48c3Bhbj5cdTY2RjRcdTcwNzVcdTY1NEY8L3NwYW4+PC9zbWFsbD5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L1BhbmVsU2hlbGw+XG4gIClcbn1cbiIsICJleHBvcnQgY29uc3QgTUlOX1pPT01fU0VOU0lUSVZJVFkgPSAwLjI1XG5leHBvcnQgY29uc3QgTUFYX1pPT01fU0VOU0lUSVZJVFkgPSAyXG5leHBvcnQgY29uc3QgREVGQVVMVF9aT09NX1NFTlNJVElWSVRZID0gMC42XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3RNYWNPUyhuYXZpZ2F0b3JMaWtlID0gdHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogbmF2aWdhdG9yKSB7XG4gIGNvbnN0IHBsYXRmb3JtID0gbmF2aWdhdG9yTGlrZT8udXNlckFnZW50RGF0YT8ucGxhdGZvcm0gfHwgbmF2aWdhdG9yTGlrZT8ucGxhdGZvcm0gfHwgJydcbiAgaWYgKC9ebWFjL2kudGVzdChwbGF0Zm9ybSkpIHJldHVybiB0cnVlXG4gIHJldHVybiAvTWFjaW50b3NofE1hYyBPUyBYL2kudGVzdChuYXZpZ2F0b3JMaWtlPy51c2VyQWdlbnQgfHwgJycpXG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXR0aW5ncyhuYXZpZ2F0b3JMaWtlKSB7XG4gIHJldHVybiB7XG4gICAgc2hvd0NhbnZhc0luZGV4OiB0cnVlLFxuICAgIHNob3dBbm5vdGF0aW9uTWFya2VyczogdHJ1ZSxcbiAgICB0cmFja3BhZFpvb206IGRldGVjdE1hY09TKG5hdmlnYXRvckxpa2UpLFxuICAgIHpvb21TZW5zaXRpdml0eTogREVGQVVMVF9aT09NX1NFTlNJVElWSVRZLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkodmFsdWUpIHtcbiAgY29uc3QgbnVtYmVyID0gTnVtYmVyKHZhbHVlKVxuICBpZiAoIU51bWJlci5pc0Zpbml0ZShudW1iZXIpKSByZXR1cm4gREVGQVVMVF9aT09NX1NFTlNJVElWSVRZXG4gIHJldHVybiBNYXRoLm1pbihNQVhfWk9PTV9TRU5TSVRJVklUWSwgTWF0aC5tYXgoTUlOX1pPT01fU0VOU0lUSVZJVFksIG51bWJlcikpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpIHtcbiAgcmV0dXJuIGB3Zi1ib2FyZC1zZXR0aW5nczoke3Byb2plY3ROYW1lfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRCb2FyZFNldHRpbmdzKFxuICBzdG9yYWdlLFxuICBwcm9qZWN0TmFtZSxcbiAgbmF2aWdhdG9yTGlrZSA9IHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IG5hdmlnYXRvcixcbikge1xuICBjb25zdCBkZWZhdWx0cyA9IGRlZmF1bHRTZXR0aW5ncyhuYXZpZ2F0b3JMaWtlKVxuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RvcmFnZT8uZ2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSkpKVxuICAgIGlmIChwYXJzZWQgJiYgdHlwZW9mIHBhcnNlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNob3dDYW52YXNJbmRleDogcGFyc2VkLnNob3dDYW52YXNJbmRleCAhPT0gZmFsc2UsXG4gICAgICAgIHNob3dBbm5vdGF0aW9uTWFya2VyczogcGFyc2VkLnNob3dBbm5vdGF0aW9uTWFya2VycyAhPT0gZmFsc2UsXG4gICAgICAgIHRyYWNrcGFkWm9vbTogdHlwZW9mIHBhcnNlZC50cmFja3BhZFpvb20gPT09ICdib29sZWFuJ1xuICAgICAgICAgID8gcGFyc2VkLnRyYWNrcGFkWm9vbVxuICAgICAgICAgIDogZGVmYXVsdHMudHJhY2twYWRab29tLFxuICAgICAgICB6b29tU2Vuc2l0aXZpdHk6IG5vcm1hbGl6ZVpvb21TZW5zaXRpdml0eShwYXJzZWQuem9vbVNlbnNpdGl2aXR5KSxcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGZpbGU6Ly8gc3RvcmFnZSBjYW4gYmUgdW5hdmFpbGFibGUgb3IgY29udGFpbiBzdGFsZSBkYXRhLlxuICB9XG4gIHJldHVybiBkZWZhdWx0c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUJvYXJkU2V0dGluZ3Moc3RvcmFnZSwgcHJvamVjdE5hbWUsIHNldHRpbmdzKSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB7XG4gICAgc2hvd0NhbnZhc0luZGV4OiBzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlLFxuICAgIHNob3dBbm5vdGF0aW9uTWFya2Vyczogc2V0dGluZ3Muc2hvd0Fubm90YXRpb25NYXJrZXJzICE9PSBmYWxzZSxcbiAgICB0cmFja3BhZFpvb206IHNldHRpbmdzLnRyYWNrcGFkWm9vbSA9PT0gdHJ1ZSxcbiAgICB6b29tU2Vuc2l0aXZpdHk6IG5vcm1hbGl6ZVpvb21TZW5zaXRpdml0eShzZXR0aW5ncy56b29tU2Vuc2l0aXZpdHkpLFxuICB9XG4gIHRyeSB7XG4gICAgc3RvcmFnZT8uc2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSksIEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZWQpKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIFNldHRpbmdzIHJlbWFpbiB1c2FibGUgZm9yIHRoZSBjdXJyZW50IHNlc3Npb24gd2l0aG91dCBwZXJzaXN0ZW5jZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5pbXBvcnQgeyBBbm5vdGF0aW9uUGFuZWwgfSBmcm9tICcuL0Fubm90YXRpb25QYW5lbC5qc3gnXG5pbXBvcnQgeyBBbm5vdGF0aW9uTWFya2VycyB9IGZyb20gJy4vQW5ub3RhdGlvbk1hcmtlcnMuanN4J1xuaW1wb3J0IHtcbiAgYXBwbHlBbm5vdGF0aW9uT3BlcmF0aW9ucyxcbiAgYmFzZUFubm90YXRpb25zLFxuICBkZWxldGVBbm5vdGF0aW9uT3BlcmF0aW9uLFxuICBnZXRBbm5vdGF0aW9uU3RvcmFnZSxcbiAgcHJldmVudFVuc2F2ZWRBbm5vdGF0aW9uRXhpdCxcbiAgcmVhZEFubm90YXRpb25EcmFmdCxcbiAgc2F2ZUFubm90YXRpb25EcmFmdCxcbiAgdXBzZXJ0QW5ub3RhdGlvbk9wZXJhdGlvbixcbn0gZnJvbSAnLi9hbm5vdGF0aW9ucy5qcydcbmltcG9ydCB7IFNob3J0Y3V0SGVscCB9IGZyb20gJy4vQm9hcmRQYW5lbHMuanN4J1xuaW1wb3J0IHtcbiAgZ2V0Qm9hcmRTdG9yYWdlLFxuICBub3JtYWxpemVab29tU2Vuc2l0aXZpdHksXG4gIHJlYWRCb2FyZFNldHRpbmdzLFxuICBzYXZlQm9hcmRTZXR0aW5ncyxcbn0gZnJvbSAnLi9ib2FyZC1zZXR0aW5ncy5qcydcbmltcG9ydCB7IGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldCwgc2hvcnRjdXRJZEZvckV2ZW50LCBzaG9ydGN1dE1vZGlmaWVyTGFiZWwgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuY29uc3QgVklFV1BPUlRfTEFCRUxTID0ge1xuICBtb2JpbGU6ICdcdTYyNEJcdTY3M0EnLFxuICBkZXNrdG9wOiAnXHU2ODRDXHU5NzYyJyxcbn1cblxuZnVuY3Rpb24gWm9vbUNvbnRyb2xzKHsgc2NhbGUsIHNldFNjYWxlLCBvblJlc2V0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXpvb20tY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU3RjI5XHU1QzBGXCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlIC0gMC4xKSl9Pi08L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXpvb20tdmFsdWVcIj57TWF0aC5yb3VuZChzY2FsZSAqIDEwMCl9JTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU2NTNFXHU1OTI3XCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlICsgMC4xKSl9Pis8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU5MUNEXHU3RjZFXHU3RjI5XHU2NTNFXCIgb25DbGljaz17b25SZXNldH0+XHU1OTBEXHU0RjREPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEx1Y2lkZSBcdTk4Q0VcdTY4M0NcdTVERTVcdTUxNzdcdTY4MEZcdTU2RkVcdTY4MDdcdTMwMDJcdTRFQzVcdTc1MjhcdTRFOEVcdTY4NDZcdTY3QjYgY2hyb21lXHUzMDAyICovXG5mdW5jdGlvbiBUb29sYmFySWNvbih7IG5hbWUgfSkge1xuICBjb25zdCBwYXRocyA9IHtcbiAgICBlZGl0OiA8PjxwYXRoIGQ9XCJNMTIgMjBoOVwiIC8+PHBhdGggZD1cIk0xNi41IDMuNWEyLjEyIDIuMTIgMCAwIDEgMyAzTDcgMTlsLTQgMSAxLTRaXCIgLz48Lz4sXG4gICAgY29tbWVudDogPD48cGF0aCBkPVwiTTIxIDE1YTQgNCAwIDAgMS00IDRIOGwtNSAzVjdhNCA0IDAgMCAxIDQtNGgxMGE0IDQgMCAwIDEgNCA0WlwiIC8+PHBhdGggZD1cIk04IDloOE04IDEzaDVcIiAvPjwvPixcbiAgICBmdWxsc2NyZWVuOiA8PjxwYXRoIGQ9XCJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzXCIgLz48cGF0aCBkPVwiTTIxIDhWNWEyIDIgMCAwIDAtMi0yaC0zXCIgLz48cGF0aCBkPVwiTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDNcIiAvPjxwYXRoIGQ9XCJNMTYgMjFoM2EyIDIgMCAwIDAgMi0ydi0zXCIgLz48Lz4sXG4gICAgZXhwYW5kOiA8PjxwYXRoIGQ9XCJtNyAxNSA1IDUgNS01XCIgLz48cGF0aCBkPVwibTcgOSA1LTUgNSA1XCIgLz48Lz4sXG4gICAgY29sbGFwc2U6IDw+PHBhdGggZD1cIm03IDIwIDUtNSA1IDVcIiAvPjxwYXRoIGQ9XCJtNyA0IDUgNSA1LTVcIiAvPjwvPixcbiAgICB0b29sYmFyRXhwYW5kOiA8PjxwYXRoIGQ9XCJNNSA1djE0XCIgLz48cGF0aCBkPVwibTE1IDE4LTYtNiA2LTZcIiAvPjwvPixcbiAgICB0b29sYmFyQ29sbGFwc2U6IDw+PHBhdGggZD1cIk0xOSA1djE0XCIgLz48cGF0aCBkPVwibTkgMTggNi02LTYtNlwiIC8+PC8+LFxuICAgIGRvd25sb2FkOiA8PjxwYXRoIGQ9XCJNMTIgM3YxMlwiIC8+PHBhdGggZD1cIm03IDEwIDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJNNSAyMWgxNFwiIC8+PC8+LFxuICAgIHNldHRpbmdzOiA8PjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiM1wiIC8+PHBhdGggZD1cIk0xOS40IDE1YTEuNyAxLjcgMCAwIDAgLjM0IDEuODhsLjA2LjA2LTIuODMgMi44My0uMDYtLjA2QTEuNyAxLjcgMCAwIDAgMTUgMTkuNGExLjcgMS43IDAgMCAwLTEgLjYgMS43IDEuNyAwIDAgMC0uNCAxLjFWMjFoLTR2LS4wOUExLjcgMS43IDAgMCAwIDguNiAxOS40YTEuNyAxLjcgMCAwIDAtMS44OC4zNGwtLjA2LjA2LTIuODMtMi44My4wNi0uMDZBMS43IDEuNyAwIDAgMCA0LjYgMTVhMS43IDEuNyAwIDAgMC0uNi0xIDEuNyAxLjcgMCAwIDAtMS4xLS40SDN2LTRoLjA5QTEuNyAxLjcgMCAwIDAgNC42IDguNmExLjcgMS43IDAgMCAwLS4zNC0xLjg4bC0uMDYtLjA2IDIuODMtMi44My4wNi4wNkExLjcgMS43IDAgMCAwIDkgNC42YTEuNyAxLjcgMCAwIDAgMS0uNiAxLjcgMS43IDAgMCAwIC40LTEuMVYzaDR2LjA5QTEuNyAxLjcgMCAwIDAgMTUuNCA0LjZhMS43IDEuNyAwIDAgMCAxLjg4LS4zNGwuMDYtLjA2IDIuODMgMi44My0uMDYuMDZBMS43IDEuNyAwIDAgMCAxOS40IDljLjIuMzcuNTIuNyAxIC45LjMyLjEzLjY4LjIgMS4xLjJoLjA5djRoLS4wOWExLjcgMS43IDAgMCAwLTIuMS45WlwiIC8+PC8+LFxuICAgIGhlbHA6IDw+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCI5XCIgLz48cGF0aCBkPVwiTTkuNyA5YTIuNCAyLjQgMCAxIDEgMy43IDJjLS45LjYtMS40IDEuMS0xLjQgMlwiIC8+PHBhdGggZD1cIk0xMiAxN2guMDFcIiAvPjwvPixcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7cGF0aHNbbmFtZV19XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIFx1N0VCRlx1Njg0Nlx1OTUwMVx1RkYxQVx1NUYwMFx1OTUwMT1cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMENcdTk1RURcdTk1MDE9XHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDAyXHU2ODQ2XHU2N0I2IGNocm9tZSBcdTUzRUZcdTc1MjggU1ZHXHUzMDAyICovXG5mdW5jdGlvbiBMb2NrSWNvbih7IG9wZW4gfSkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtbG9jay1pY29uXCIgdmlld0JveD1cIjAgMCAxNCAxNFwiIHdpZHRoPVwiMTRcIiBoZWlnaHQ9XCIxNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge29wZW4gPyAoXG4gICAgICAgIC8vIFx1NUYwMFx1OTUwMVx1RkYxQVx1Njg4MVx1NEVDRVx1NURFNlx1NEZBN1x1N0FDQlx1OEQ3N1x1NTQwRVx1NTQxMVx1NTNGM1x1NEUwQVx1NjBBQ1x1N0E3QVx1RkYwQ1x1NTNGM1x1ODExQVx1NEUwRFx1NjI2M1x1NTZERVx1OTUwMVx1NEY1M1xuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuMzVhMi43NSAyLjc1IDAgMCAxIDUuMzUtLjJcIlxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMS41XCJcbiAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjVhMi43NSAyLjc1IDAgMCAxIDUuNSAwdjIuMjVcIlxuICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICBzdHJva2U9XCJjdXJyZW50Q29sb3JcIlxuICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMS41XCJcbiAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIDxyZWN0IHg9XCIyLjc1XCIgeT1cIjYuNzVcIiB3aWR0aD1cIjguNVwiIGhlaWdodD1cIjUuNVwiIHJ4PVwiMS4yNVwiIGZpbGw9XCJjdXJyZW50Q29sb3JcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBpbnRlcmFjdGl2ZT10cnVlIFx1NjYzRVx1NzkzQVx1NUYwMFx1OTUwMVx1MzAwQ1x1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwRFx1RkYxQmZhbHNlIFx1NEUzQVx1NEUwQVx1OTUwMVx1RkYwQ1x1NTNFRlx1NzZGNFx1NjNBNVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1MzAwMVx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRSAqL1xuZnVuY3Rpb24gSW50ZXJhY3Rpb25Mb2NrKHsgaW50ZXJhY3RpdmUsIG9uVG9nZ2xlIH0pIHtcbiAgY29uc3Qgc2hvcnRjdXRNb2RpZmllciA9IHNob3J0Y3V0TW9kaWZpZXJMYWJlbCgpXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2ludGVyYWN0aXZlID8gJ3dmLWludGVyYWN0aW9uLWxvY2snIDogJ3dmLWludGVyYWN0aW9uLWxvY2sgaXMtbG9ja2VkJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgYXJpYS1wcmVzc2VkPXshaW50ZXJhY3RpdmV9XG4gICAgICB0aXRsZT17aW50ZXJhY3RpdmVcbiAgICAgICAgPyBgXHU1RjUzXHU1MjREXHU1M0VGXHU0RUE0XHU0RTkyXHU5ODc1XHU5NzYyXHUzMDAyXHU3MEI5XHU1MUZCXHU5NTAxXHU0RjRGXHU1NDBFXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHU3NTNCXHU1RTAzXHVGRjBDXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFICR7c2hvcnRjdXRNb2RpZmllcn0rSWBcbiAgICAgICAgOiBgXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFICR7c2hvcnRjdXRNb2RpZmllcn0rSWB9XG4gICAgPlxuICAgICAgPExvY2tJY29uIG9wZW49e2ludGVyYWN0aXZlfSAvPlxuICAgICAgPHNwYW4+e2ludGVyYWN0aXZlID8gJ1x1NTNFRlx1NEVBNFx1NEU5MicgOiAnXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJ308L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fCBudWxsXG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RCb2FyZEZ1bGxzY3JlZW4oZWwpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGVsICYmIChlbC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBlbC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbilcbiAgaWYgKCFyZXF1ZXN0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXF1ZXN0LmNhbGwoZWwpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZnVuY3Rpb24gZXhpdEJvYXJkRnVsbHNjcmVlbigpIHtcbiAgaWYgKCFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgY29uc3QgZXhpdCA9IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8IGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuXG4gIGlmICghZXhpdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXhpdC5jYWxsKGRvY3VtZW50KSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb2FyZCh7IHByb2plY3QgfSkge1xuICBjb25zdCB7XG4gICAgbW9kZSxcbiAgICBzZXRNb2RlLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0LFxuICAgIGVudHJ5SWQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgY3VycmVudFNjcmVlbklkLFxuICAgIGNhbkdvQmFjayxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIGNvbnN0IHZpZXdwb3J0T3B0aW9ucyA9IE9iamVjdC5rZXlzKHByb2plY3Qudmlld3BvcnRzKVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG4gIGNvbnN0IHNob3J0Y3V0TW9kaWZpZXIgPSBzaG9ydGN1dE1vZGlmaWVyTGFiZWwoKVxuXG4gIGNvbnN0IFtzZWxlY3RlZElkcywgc2V0U2VsZWN0ZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpLFxuICApXG4gIGNvbnN0IFtjYW52YXNTY2FsZSwgc2V0Q2FudmFzU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9TY2FsZSwgc2V0RGVtb1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vVmlld1Jlc2V0S2V5LCBzZXREZW1vVmlld1Jlc2V0S2V5XSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpbnRlcmFjdGl2ZSwgc2V0SW50ZXJhY3RpdmVdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3NwYWNlSGVsZCwgc2V0U3BhY2VIZWxkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaG90c3BvdHNWaXNpYmxlLCBzZXRIb3RzcG90c1Zpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBvcnRFcnJvciwgc2V0RXhwb3J0RXJyb3JdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2V4cG9ydGluZywgc2V0RXhwb3J0aW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRJZHMsIHNldEV4cGFuZGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgW2ltbWVyc2l2ZSwgc2V0SW1tZXJzaXZlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkLCBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWRdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdUb29sLCBzZXRSZXZpZXdUb29sXSA9IFJlYWN0LnVzZVN0YXRlKCdtb2RpZnknKVxuICBjb25zdCBbcmV2aWV3UGFuZWxWaXNpYmxlLCBzZXRSZXZpZXdQYW5lbFZpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdTZWxlY3Rpb25zLCBzZXRSZXZpZXdTZWxlY3Rpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbcmV2aWV3TXVsdGlTZWxlY3QsIHNldFJldmlld011bHRpU2VsZWN0XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3SXRlbXMsIHNldFJldmlld0l0ZW1zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBhbm5vdGF0aW9uQmFzZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYmFzZUFubm90YXRpb25zKHByb2plY3QpLCBbcHJvamVjdF0pXG4gIGNvbnN0IFthbm5vdGF0aW9uT3BlcmF0aW9ucywgc2V0QW5ub3RhdGlvbk9wZXJhdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gcmVhZEFubm90YXRpb25EcmFmdChnZXRBbm5vdGF0aW9uU3RvcmFnZSgpLCBwcm9qZWN0KS5vcGVyYXRpb25zLFxuICApXG4gIGNvbnN0IFthbm5vdGF0aW9uU3RvcmFnZVNhdmVkLCBzZXRBbm5vdGF0aW9uU3RvcmFnZVNhdmVkXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtoZWxwVmlzaWJsZSwgc2V0SGVscFZpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYW52YXNJbmRleFZpc2libGUsIHNldENhbnZhc0luZGV4VmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS5zaG93Q2FudmFzSW5kZXgsXG4gIClcbiAgY29uc3QgW3Nob3dBbm5vdGF0aW9uTWFya2Vycywgc2V0U2hvd0Fubm90YXRpb25NYXJrZXJzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dBbm5vdGF0aW9uTWFya2VycyxcbiAgKVxuICBjb25zdCBbdHJhY2twYWRab29tLCBzZXRUcmFja3BhZFpvb21dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSkudHJhY2twYWRab29tLFxuICApXG4gIGNvbnN0IFt6b29tU2Vuc2l0aXZpdHksIHNldFpvb21TZW5zaXRpdml0eV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS56b29tU2Vuc2l0aXZpdHksXG4gIClcbiAgY29uc3QgW2NhbnZhc0luZGV4UG9zaXRpb24sIHNldENhbnZhc0luZGV4UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgYm9hcmRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZiA9IFJlYWN0LnVzZVJlZihuZXcgU2V0KCkpXG4gIGNvbnN0IGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSAhaW50ZXJhY3RpdmUgfHwgc3BhY2VIZWxkXG4gIGNvbnN0IGFsbFNjcmVlbklkcyA9IHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKVxuICBjb25zdCBpc0RlbW8gPSBtb2RlID09PSAnZGVtbycgJiYgZGVtb0F2YWlsYWJsZVxuICBjb25zdCBhY3RpdmVTY2FsZSA9IGlzRGVtbyA/IGRlbW9TY2FsZSA6IGNhbnZhc1NjYWxlXG4gIGNvbnN0IHNldEFjdGl2ZVNjYWxlID0gaXNEZW1vID8gc2V0RGVtb1NjYWxlIDogc2V0Q2FudmFzU2NhbGVcbiAgY29uc3Qgd2hlZWxab29tT3B0aW9ucyA9IHsgdHJhY2twYWRNb2RlOiB0cmFja3BhZFpvb20sIHNlbnNpdGl2aXR5OiB6b29tU2Vuc2l0aXZpdHkgfVxuICBjb25zdCBhbm5vdGF0aW9ucyA9IFJlYWN0LnVzZU1lbW8oXG4gICAgKCkgPT4gYXBwbHlBbm5vdGF0aW9uT3BlcmF0aW9ucyhhbm5vdGF0aW9uQmFzZSwgYW5ub3RhdGlvbk9wZXJhdGlvbnMpLFxuICAgIFthbm5vdGF0aW9uQmFzZSwgYW5ub3RhdGlvbk9wZXJhdGlvbnNdLFxuICApXG5cbiAgY29uc3QgY2xlYXJSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoW10pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHNlbGVjdFJldmlld0VsZW1lbnQgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCwgc2NyZWVuLCBjb250ZW50Um9vdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgcHJpbWFyeSA9IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IGFjdGl2ZVNjcmVlbiA9IHNjcmVlbiB8fCBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gcHJpbWFyeT8uc2NyZWVuSWQpXG4gICAgY29uc3QgYWN0aXZlUm9vdCA9IGNvbnRlbnRSb290IHx8IHByaW1hcnk/LmNvbnRlbnRSb290XG4gICAgaWYgKCFlbGVtZW50IHx8ICFhY3RpdmVTY3JlZW4gfHwgIWFjdGl2ZVJvb3QpIHJldHVyblxuICAgIGNvbnN0IG5leHRTZWxlY3Rpb24gPSBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgYWN0aXZlUm9vdCwgYWN0aXZlU2NyZWVuKVxuICAgIGNvbnN0IGFkZGl0aXZlID0gcmV2aWV3VG9vbCA9PT0gJ21vZGlmeScgJiYgKHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG5cbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5yZXBsYWNlRWxlbWVudCkge1xuICAgICAgICBvcHRpb25zLnJlcGxhY2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUob3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgaWYgKGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50ICYmIGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQubWFwKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQgPyBuZXh0U2VsZWN0aW9uIDogaXRlbSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50KVxuICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGVkRWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICByZXR1cm4gYWRkaXRpdmUgPyBbLi4uY3VycmVudCwgbmV4dFNlbGVjdGlvbl0gOiBbbmV4dFNlbGVjdGlvbl1cbiAgICB9KVxuICB9LCBbcHJvamVjdC5zY3JlZW5zLCByZXZpZXdNdWx0aVNlbGVjdCwgcmV2aWV3U2VsZWN0aW9ucywgcmV2aWV3VG9vbF0pXG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KSlcbiAgfSwgW10pXG5cbiAgY29uc3QgY2xvc2VSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0UmV2aWV3RW5hYmxlZChmYWxzZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uXSlcblxuICBjb25zdCBob3ZlclJldmlld0JyZWFkY3J1bWIgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IGVsZW1lbnQgfHwgbnVsbFxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygodG9vbCA9ICdtb2RpZnknKSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gdG9vbCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3TXVsdGlTZWxlY3QoZmFsc2UpXG4gICAgc2V0UmV2aWV3VG9vbCh0b29sKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0b29sID09PSAnYW5ub3RhdGlvbicpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICB9LCBbY2xvc2VSZXZpZXcsIHJldmlld0VuYWJsZWQsIHJldmlld1Rvb2xdKVxuXG4gIGNvbnN0IG9wZW5SZXZpZXdQYW5lbCA9ICgpID0+IHtcbiAgICBzZXRJbnRlcmFjdGl2ZSh0cnVlKVxuICAgIHNldFJldmlld1Rvb2woJ21vZGlmeScpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgY29uc3Qgb3BlbkFubm90YXRpb25QYW5lbCA9IChhbm5vdGF0aW9uKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdUb29sKCdhbm5vdGF0aW9uJylcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gICAgaWYgKGFubm90YXRpb24/LnNjcmVlbklkKSBzZWxlY3RFbnRyeShhbm5vdGF0aW9uLnNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY2xvc2VSZXZpZXdQYW5lbCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gIH0sIFtob3ZlclJldmlld0JyZWFkY3J1bWJdKVxuXG4gIGNvbnN0IGFkZFJldmlld0l0ZW0gPSAoaXRlbSkgPT4ge1xuICAgIHNldFJldmlld0l0ZW1zKChjdXJyZW50KSA9PiBbXG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgeyAuLi5pdGVtLCBpZDogYHJldmlldy0ke0RhdGUubm93KCl9LSR7Y3VycmVudC5sZW5ndGggKyAxfWAgfSxcbiAgICBdKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3SXRlbSA9IChpZCkgPT4ge1xuICAgIHNldFJldmlld0l0ZW1zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5pZCAhPT0gaWQpKVxuICB9XG5cbiAgY29uc3QgdXBzZXJ0QW5ub3RhdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgc2V0QW5ub3RhdGlvbk9wZXJhdGlvbnMoKGN1cnJlbnQpID0+IChcbiAgICAgIHVwc2VydEFubm90YXRpb25PcGVyYXRpb24oYW5ub3RhdGlvbkJhc2UsIGN1cnJlbnQsIGFubm90YXRpb24pXG4gICAgKSlcbiAgfSwgW2Fubm90YXRpb25CYXNlXSlcblxuICBjb25zdCBkZWxldGVBbm5vdGF0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgc2V0QW5ub3RhdGlvbk9wZXJhdGlvbnMoKGN1cnJlbnQpID0+IChcbiAgICAgIGRlbGV0ZUFubm90YXRpb25PcGVyYXRpb24oYW5ub3RhdGlvbkJhc2UsIGN1cnJlbnQsIGlkKVxuICAgICkpXG4gIH0sIFthbm5vdGF0aW9uQmFzZV0pXG5cbiAgY29uc3QgaW1wb3J0QW5ub3RhdGlvbnMgPSBSZWFjdC51c2VDYWxsYmFjaygoaW5jb21pbmcsIGltcG9ydGVkT3BlcmF0aW9ucyA9IFtdKSA9PiB7XG4gICAgc2V0QW5ub3RhdGlvbk9wZXJhdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGxldCBuZXh0ID0gaW5jb21pbmcucmVkdWNlKFxuICAgICAgICAob3BlcmF0aW9ucywgYW5ub3RhdGlvbikgPT4gdXBzZXJ0QW5ub3RhdGlvbk9wZXJhdGlvbihhbm5vdGF0aW9uQmFzZSwgb3BlcmF0aW9ucywgYW5ub3RhdGlvbiksXG4gICAgICAgIGN1cnJlbnQsXG4gICAgICApXG4gICAgICBmb3IgKGNvbnN0IG9wZXJhdGlvbiBvZiBpbXBvcnRlZE9wZXJhdGlvbnMpIHtcbiAgICAgICAgaWYgKG9wZXJhdGlvbi5vcCA9PT0gJ2RlbGV0ZScpIHtcbiAgICAgICAgICBuZXh0ID0gZGVsZXRlQW5ub3RhdGlvbk9wZXJhdGlvbihhbm5vdGF0aW9uQmFzZSwgbmV4dCwgb3BlcmF0aW9uLmlkKVxuICAgICAgICB9IGVsc2UgaWYgKG9wZXJhdGlvbi5vcCA9PT0gJ3Vwc2VydCcpIHtcbiAgICAgICAgICBuZXh0ID0gdXBzZXJ0QW5ub3RhdGlvbk9wZXJhdGlvbihhbm5vdGF0aW9uQmFzZSwgbmV4dCwgb3BlcmF0aW9uLmFubm90YXRpb24pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfSwgW2Fubm90YXRpb25CYXNlXSlcblxuICBjb25zdCBjbGVhckFubm90YXRpb25EcmFmdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHNldEFubm90YXRpb25PcGVyYXRpb25zKFtdKSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgfVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICAgIGhvdmVyUmV2aWV3QnJlYWRjcnVtYihudWxsKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uLCBob3ZlclJldmlld0JyZWFkY3J1bWIsIG1vZGUsIHZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChyZXZpZXdJdGVtcy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWRcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KVxuICB9LCBbcmV2aWV3SXRlbXMubGVuZ3RoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGRyYWZ0ID0gcmVhZEFubm90YXRpb25EcmFmdChnZXRBbm5vdGF0aW9uU3RvcmFnZSgpLCBwcm9qZWN0KVxuICAgIHNldEFubm90YXRpb25PcGVyYXRpb25zKGRyYWZ0Lm9wZXJhdGlvbnMpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEFubm90YXRpb25TdG9yYWdlU2F2ZWQoc2F2ZUFubm90YXRpb25EcmFmdChcbiAgICAgIGdldEFubm90YXRpb25TdG9yYWdlKCksXG4gICAgICBwcm9qZWN0LFxuICAgICAgYW5ub3RhdGlvbk9wZXJhdGlvbnMsXG4gICAgKSlcbiAgfSwgW2Fubm90YXRpb25PcGVyYXRpb25zLCBwcm9qZWN0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghYW5ub3RhdGlvbk9wZXJhdGlvbnMubGVuZ3RoIHx8IGFubm90YXRpb25TdG9yYWdlU2F2ZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgcHJldmVudFVuc2F2ZWRBbm5vdGF0aW9uRXhpdClcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkQW5ub3RhdGlvbkV4aXQpXG4gIH0sIFthbm5vdGF0aW9uT3BlcmF0aW9ucy5sZW5ndGgsIGFubm90YXRpb25TdG9yYWdlU2F2ZWRdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7XG4gICAgICBzaG93Q2FudmFzSW5kZXg6IHZpc2libGUsXG4gICAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnMsXG4gICAgICB0cmFja3BhZFpvb20sXG4gICAgICB6b29tU2Vuc2l0aXZpdHksXG4gICAgfSlcbiAgfSwgW3Byb2plY3QubmFtZSwgc2hvd0Fubm90YXRpb25NYXJrZXJzLCB0cmFja3BhZFpvb20sIHpvb21TZW5zaXRpdml0eV0pXG5cbiAgY29uc3QgdXBkYXRlU2hvd0Fubm90YXRpb25NYXJrZXJzID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRTaG93QW5ub3RhdGlvbk1hcmtlcnModmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7XG4gICAgICBzaG93Q2FudmFzSW5kZXg6IGNhbnZhc0luZGV4VmlzaWJsZSxcbiAgICAgIHNob3dBbm5vdGF0aW9uTWFya2VyczogdmlzaWJsZSxcbiAgICAgIHRyYWNrcGFkWm9vbSxcbiAgICAgIHpvb21TZW5zaXRpdml0eSxcbiAgICB9KVxuICB9LCBbY2FudmFzSW5kZXhWaXNpYmxlLCBwcm9qZWN0Lm5hbWUsIHRyYWNrcGFkWm9vbSwgem9vbVNlbnNpdGl2aXR5XSlcblxuICBjb25zdCB1cGRhdGVUcmFja3BhZFpvb20gPSBSZWFjdC51c2VDYWxsYmFjaygoZW5hYmxlZCkgPT4ge1xuICAgIHNldFRyYWNrcGFkWm9vbShlbmFibGVkKVxuICAgIHNhdmVCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUsIHtcbiAgICAgIHNob3dDYW52YXNJbmRleDogY2FudmFzSW5kZXhWaXNpYmxlLFxuICAgICAgc2hvd0Fubm90YXRpb25NYXJrZXJzLFxuICAgICAgdHJhY2twYWRab29tOiBlbmFibGVkLFxuICAgICAgem9vbVNlbnNpdGl2aXR5LFxuICAgIH0pXG4gIH0sIFtjYW52YXNJbmRleFZpc2libGUsIHByb2plY3QubmFtZSwgc2hvd0Fubm90YXRpb25NYXJrZXJzLCB6b29tU2Vuc2l0aXZpdHldKVxuXG4gIGNvbnN0IHVwZGF0ZVpvb21TZW5zaXRpdml0eSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkodmFsdWUpXG4gICAgc2V0Wm9vbVNlbnNpdGl2aXR5KG5vcm1hbGl6ZWQpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwge1xuICAgICAgc2hvd0NhbnZhc0luZGV4OiBjYW52YXNJbmRleFZpc2libGUsXG4gICAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnMsXG4gICAgICB0cmFja3BhZFpvb20sXG4gICAgICB6b29tU2Vuc2l0aXZpdHk6IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgfSwgW2NhbnZhc0luZGV4VmlzaWJsZSwgcHJvamVjdC5uYW1lLCBzaG93QW5ub3RhdGlvbk1hcmtlcnMsIHRyYWNrcGFkWm9vbV0pXG5cbiAgLy8gXHU1M0VBXHU1NzI4XHU1MjA3XHU2MzYyXHU5ODc5XHU3NkVFXHU2NUY2XHU2RTA1XHU0RjREXHU3RjZFXHUzMDAyXHU5OTk2XHU1QzRGIHVzZUVmZmVjdCBcdTgyRTVcdTRFNUYgc2V0IG51bGxcdUZGMENcdTRGMUFcdTc2RDZcdTYzODkgQ2FudmFzSW5kZXhcbiAgLy8gdXNlTGF5b3V0RWZmZWN0IFx1NTIxQVx1N0I5N1x1NTk3RFx1NzY4NFx1NTc1MFx1NjgwN1x1RkYwQ1x1N0QyMlx1NUYxNVx1NEYxQVx1NEUwMFx1NzZGNCB2aXNpYmlsaXR5OmhpZGRlblx1MzAwMlxuICBjb25zdCBjYW52YXNJbmRleFNldHRpbmdzUHJvamVjdFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSlcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUoc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4KVxuICAgIHNldFNob3dBbm5vdGF0aW9uTWFya2VycyhzZXR0aW5ncy5zaG93QW5ub3RhdGlvbk1hcmtlcnMpXG4gICAgc2V0VHJhY2twYWRab29tKHNldHRpbmdzLnRyYWNrcGFkWm9vbSlcbiAgICBzZXRab29tU2Vuc2l0aXZpdHkoc2V0dGluZ3Muem9vbVNlbnNpdGl2aXR5KVxuICAgIGNvbnN0IHByZXZpb3VzTmFtZSA9IGNhbnZhc0luZGV4U2V0dGluZ3NQcm9qZWN0UmVmLmN1cnJlbnRcbiAgICBjYW52YXNJbmRleFNldHRpbmdzUHJvamVjdFJlZi5jdXJyZW50ID0gcHJvamVjdC5uYW1lXG4gICAgaWYgKHByZXZpb3VzTmFtZSAhPSBudWxsICYmIHByZXZpb3VzTmFtZSAhPT0gcHJvamVjdC5uYW1lKSB7XG4gICAgICBzZXRDYW52YXNJbmRleFBvc2l0aW9uKG51bGwpXG4gICAgfVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKG5ldyBTZXQoKSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBjb25zdCB0b2dnbGVFeHBhbmQgPSAoaWQpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGV4cGFuZFRhcmdldHMgPSAoc2hvdWxkRXhwYW5kKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxTY3JlZW5JZHMpXG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIHRhcmdldHMpIHtcbiAgICAgICAgaWYgKHNob3VsZEV4cGFuZCkgbmV4dC5hZGQoaWQpXG4gICAgICAgIGVsc2UgbmV4dC5kZWxldGUoaWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnICYmICFldmVudC5yZXBlYXQgJiYgIWlzRWRpdGFibGVTaG9ydGN1dFRhcmdldChldmVudC50YXJnZXQpKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgc2V0U3BhY2VIZWxkKHRydWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBzaG9ydGN1dCA9IHNob3J0Y3V0SWRGb3JFdmVudChldmVudClcbiAgICAgIGlmICghc2hvcnRjdXQpIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ICE9PSAnZXNjYXBlJyAmJiBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlKSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hvdHNwb3RzJyAmJiAhaXNEZW1vKSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScgJiYgZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2NhbnZhcycpIHNldE1vZGUoJ2NhbnZhcycpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJykgc2V0TW9kZSgnZGVtbycpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbnRlcmFjdGlvbicpIHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAncmV2aWV3JykgdG9nZ2xlUmV2aWV3KClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2ltbWVyc2l2ZScpIHRvZ2dsZUltbWVyc2l2ZSgpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdicm93c2VyLWZ1bGxzY3JlZW4nKSB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbigpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycpIHNldEhvdHNwb3RzVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hlbHAnKSB7XG4gICAgICAgIHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgfVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZXNjYXBlJykge1xuICAgICAgICBpZiAoaGVscFZpc2libGUpIHNldEhlbHBWaXNpYmxlKGZhbHNlKVxuICAgICAgICBlbHNlIGlmIChyZXZpZXdFbmFibGVkKSBjbG9zZVJldmlldygpXG4gICAgICAgIGVsc2UgaWYgKGltbWVyc2l2ZSkgZXhpdEltbWVyc2l2ZSgpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHVwID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJykgc2V0U3BhY2VIZWxkKGZhbHNlKVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIH1cbiAgfSwgW1xuICAgIGNsb3NlUmV2aWV3LFxuICAgIGRlbW9BdmFpbGFibGUsXG4gICAgZXhpdEltbWVyc2l2ZSxcbiAgICBoZWxwVmlzaWJsZSxcbiAgICBpbW1lcnNpdmUsXG4gICAgaXNEZW1vLFxuICAgIHJldmlld0VuYWJsZWQsXG4gICAgc2V0TW9kZSxcbiAgICB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbixcbiAgICB0b2dnbGVJbW1lcnNpdmUsXG4gICAgdG9nZ2xlUmV2aWV3LFxuICBdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdkZW1vJykgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9LCBbbW9kZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzeW5jID0gKCkgPT4gc2V0QnJvd3NlckZ1bGxzY3JlZW4oISFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgZXhwb3J0SWRzID0gKGlkcykgPT4gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKGFzeW5jICgpID0+IHtcbiAgICBzZXRFeHBvcnRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NyZWVucyA9IGlkcy5tYXAoKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpZClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICB0aXRsZTogc2NyZWVuLnRpdGxlLFxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNjcmVlbi1pZD1cIiR7aWR9XCJdIC53Zi1zY3JlZW4tY29udGVudGApLFxuICAgICAgICAgIHZpZXdwb3J0LFxuICAgICAgICAgIGV4cGFuZGVkOiBleHBhbmRlZElkcy5oYXMoaWQpLFxuICAgICAgICAgIHByb2plY3ROYW1lOiBwcm9qZWN0Lm5hbWUsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBhd2FpdCBleHBvcnRTZWxlY3RlZChzY3JlZW5zKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRFeHBvcnRpbmcoZmFsc2UpXG4gICAgfVxuICB9LCBzZXRFeHBvcnRFcnJvcilcblxuICBjb25zdCByZXNldERlbW8gPSAoKSA9PiB7XG4gICAgcmVzZXQoKVxuICAgIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0RGVtb1ZpZXcgPSAoKSA9PiB7XG4gICAgc2V0RGVtb1ZpZXdSZXNldEtleSgodmFsdWUpID0+IHZhbHVlICsgMSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0QWN0aXZlVmlldyA9IGlzRGVtbyA/IHJlc2V0RGVtb1ZpZXcgOiAoKSA9PiBzZXRDYW52YXNTY2FsZSgxKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtib2FyZFJlZn1cbiAgICAgIGNsYXNzTmFtZT17YHdmLWJvYXJkJHtpbW1lcnNpdmUgPyAnIGlzLWltbWVyc2l2ZScgOiAnJ30ke3Jldmlld0VuYWJsZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgID5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW5hbWVcIj57cHJvamVjdC5uYW1lfTwvaDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcHJvamVjdC1tZXRhXCI+e3Byb2plY3Quc2NyZWVucy5sZW5ndGh9IFx1OTg3NTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHtkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RlLXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1NkEyMVx1NUYwRlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnY2FudmFzJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnY2FudmFzJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2BcdTc1M0JcdTY3N0ZcdTZBMjFcdTVGMEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9KzFcdUZGMDlgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU3NTNCXHU2NzdGXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnZGVtbycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2RlbW8nKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17YFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rMlx1RkYwOWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTZGMTRcdTc5M0FcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt2aWV3cG9ydE9wdGlvbnMubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytdmlld3BvcnQtc3dpdGNoZXJcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU4OUM2XHU1M0UzXCI+XG4gICAgICAgICAgICAgIHt2aWV3cG9ydE9wdGlvbnMubWFwKChrZXkpID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt2aWV3cG9ydEtleSA9PT0ga2V5ID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpZXdwb3J0S2V5KGtleSl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge1ZJRVdQT1JUX0xBQkVMU1trZXldIHx8IGtleX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyB8fCAhZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9eygpID0+IHNldENhbnZhc1NjYWxlKDEpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8SW50ZXJhY3Rpb25Mb2NrXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXtyZXNldERlbW9WaWV3fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8SW50ZXJhY3Rpb25Mb2NrXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhvdHNwb3RzVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2BcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0FcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K0hcdUZGMDlgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1kZW1vLWVudHJ5XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ3Zi1kZW1vLWVudHJ5XCI+XHU1MTY1XHU1M0UzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIndmLWRlbW8tZW50cnlcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2VudHJ5SWR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZWxlY3RFbnRyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDlcdTYyRTlcdTZGMTRcdTc5M0FcdTUxNjVcdTUzRTNcdTk4NzVcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtzY3JlZW4uaWR9IHZhbHVlPXtzY3JlZW4uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCArIDF9LiB7c2NyZWVuLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17cmVzZXREZW1vfT5cdTkxQ0RcdTdGNkU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZGVtby1wYWdlLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgXHU1RjUzXHU1MjREXHVGRjFBXG4gICAgICAgICAgICAgICAge2N1cnJlbnRTY3JlZW5cbiAgICAgICAgICAgICAgICAgID8gYCR7cHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW4uaWQpICsgMX0uICR7Y3VycmVudFNjcmVlbi50aXRsZX0gXHUwMEI3ICR7Y3VycmVudFNjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgICAgICAgOiBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2MjUzXHU1RjAwXHU1RTJFXHU1MkE5XHUzMDAxXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RTBFXHU4QkJFXHU3RjZFXCJcbiAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2hlbHBWaXNpYmxlfVxuICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkVcdUZGMDg/XHVGRjA5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImhlbHBcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdtb2RpZnknID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnbW9kaWZ5J31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ21vZGlmeScgPyAnXHU0RkVFXHU2NTM5XHU0RTJEJyA6ICdcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgdGl0bGU9e2BcdTRGRUVcdTY1MzlcdUZGMUFcdTcwQjlcdTkwMDlcdTk4NzVcdTk3NjJcdTgyODJcdTcwQjlcdTVFNzZcdTY1NzRcdTc0MDZcdTYyMTBcdTUzRUZcdTdGMTZcdThGOTFcdTc2ODQgQUkgXHU0RkVFXHU2NTM5IFByb21wdFx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rTVx1RkYwOWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGVSZXZpZXcoJ21vZGlmeScpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ2Fubm90YXRpb24nID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnYW5ub3RhdGlvbid9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdhbm5vdGF0aW9uJyA/ICdcdTZDRThcdTkxQ0FcdTRFMkQnIDogJ1x1NkNFOFx1OTFDQSd9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NkNFOFx1OTFDQVx1RkYxQVx1N0VEOVx1OTg3NVx1OTc2Mlx1NjIxNlx1NkEyMVx1NTc1N1x1NkRGQlx1NTJBMFx1NTNFRlx1NjMwMVx1NEU0NVx1NTMxNlx1OEJGNFx1NjYwRVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0b2dnbGVSZXZpZXcoJ2Fubm90YXRpb24nKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbW1lbnRcIiAvPlxuICAgICAgICAgICAge2Fubm90YXRpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPlxuICAgICAgICAgICAgICAgIHthbm5vdGF0aW9ucy5sZW5ndGh9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2Q0U4XHU5MUNBPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtpbW1lcnNpdmUgPyAnXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyA6ICdcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnfVxuICAgICAgICAgICAgdGl0bGU9e2BcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9KzNcdUZGMDlgfVxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlSW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgd2YtaW1tZXJzaXZlLWNocm9tZSR7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJycgOiAnIGlzLWNvbGxhcHNlZCd9YH1cbiAgICAgICAgICByb2xlPVwidG9vbGJhclwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NkM4OVx1NkQ3OFx1NjNBN1x1NEVGNlwiXG4gICAgICAgID5cbiAgICAgICAgICB7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V4aXRJbW1lcnNpdmV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGBcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgXG4gICAgICAgICAgICAgICAgICA6IGBcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17YFx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rSFx1RkYwOWB9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgd2hlZWxab29tT3B0aW9ucz17d2hlZWxab29tT3B0aW9uc31cbiAgICAgICAgICBzZWxlY3RlZElkcz17c2VsZWN0ZWRJZHN9XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJZHM9e3NldFNlbGVjdGVkSWRzfVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIG9uRXhwb3J0SWRzPXtleHBvcnRJZHN9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBvbkNhbnZhc0NsaWNrPXtyZXZpZXdQYW5lbFZpc2libGUgPyBjbG9zZVJldmlld1BhbmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAgIGNhbnZhc0luZGV4VmlzaWJsZT17Y2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0luZGV4UG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgb25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlPXtzZXRDYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2xvc2VDYW52YXNJbmRleD17KCkgPT4gdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxEZW1vTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgaG90c3BvdHNWaXNpYmxlPXtob3RzcG90c1Zpc2libGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgIHdoZWVsWm9vbU9wdGlvbnM9e3doZWVsWm9vbU9wdGlvbnN9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnbW9kaWZ5JyA/IChcbiAgICAgICAgPFJldmlld01hcmtlcnMgYm9hcmRSZWY9e2JvYXJkUmVmfSBpdGVtcz17cmV2aWV3SXRlbXN9IG9uT3BlblBhbmVsPXtvcGVuUmV2aWV3UGFuZWx9IC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIHtzaG93QW5ub3RhdGlvbk1hcmtlcnMgfHwgKHJldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ2Fubm90YXRpb24nKSA/IChcbiAgICAgICAgPEFubm90YXRpb25NYXJrZXJzXG4gICAgICAgICAgYm9hcmRSZWY9e2JvYXJkUmVmfVxuICAgICAgICAgIGFubm90YXRpb25zPXthbm5vdGF0aW9uc31cbiAgICAgICAgICBvbk9wZW5QYW5lbD17b3BlbkFubm90YXRpb25QYW5lbH1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge2hlbHBWaXNpYmxlID8gKFxuICAgICAgICA8U2hvcnRjdXRIZWxwXG4gICAgICAgICAgZGVtb0F2YWlsYWJsZT17ZGVtb0F2YWlsYWJsZX1cbiAgICAgICAgICBzaG93Q2FudmFzSW5kZXg9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvblNob3dDYW52YXNJbmRleENoYW5nZT17dXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIHNob3dBbm5vdGF0aW9uTWFya2Vycz17c2hvd0Fubm90YXRpb25NYXJrZXJzfVxuICAgICAgICAgIG9uU2hvd0Fubm90YXRpb25NYXJrZXJzQ2hhbmdlPXt1cGRhdGVTaG93QW5ub3RhdGlvbk1hcmtlcnN9XG4gICAgICAgICAgdHJhY2twYWRab29tPXt0cmFja3BhZFpvb219XG4gICAgICAgICAgb25UcmFja3BhZFpvb21DaGFuZ2U9e3VwZGF0ZVRyYWNrcGFkWm9vbX1cbiAgICAgICAgICB6b29tU2Vuc2l0aXZpdHk9e3pvb21TZW5zaXRpdml0eX1cbiAgICAgICAgICBvblpvb21TZW5zaXRpdml0eUNoYW5nZT17dXBkYXRlWm9vbVNlbnNpdGl2aXR5fVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldEhlbHBWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgIHZpc2libGU9e3Jldmlld1BhbmVsVmlzaWJsZSAmJiByZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdtb2RpZnknfVxuICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICBtdWx0aVNlbGVjdD17cmV2aWV3TXVsdGlTZWxlY3R9XG4gICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICBvblNlbGVjdEVsZW1lbnQ9eyhlbGVtZW50KSA9PiBzZWxlY3RSZXZpZXdFbGVtZW50KGVsZW1lbnQsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICB9KX1cbiAgICAgICAgb25Ib3ZlckVsZW1lbnQ9e2hvdmVyUmV2aWV3QnJlYWRjcnVtYn1cbiAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICBvbkNsb3NlPXtjbG9zZVJldmlld31cbiAgICAgIC8+XG4gICAgICA8QW5ub3RhdGlvblBhbmVsXG4gICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgIHZpc2libGU9e3Jldmlld1BhbmVsVmlzaWJsZSAmJiByZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdhbm5vdGF0aW9uJ31cbiAgICAgICAgc2VsZWN0aW9uPXtyZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV0gfHwgbnVsbH1cbiAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgIGFubm90YXRpb25zPXthbm5vdGF0aW9uc31cbiAgICAgICAgb3BlcmF0aW9ucz17YW5ub3RhdGlvbk9wZXJhdGlvbnN9XG4gICAgICAgIHN0b3JhZ2VTYXZlZD17YW5ub3RhdGlvblN0b3JhZ2VTYXZlZH1cbiAgICAgICAgb25BZGQ9e3Vwc2VydEFubm90YXRpb259XG4gICAgICAgIG9uVXBzZXJ0PXt1cHNlcnRBbm5vdGF0aW9ufVxuICAgICAgICBvbkRlbGV0ZT17ZGVsZXRlQW5ub3RhdGlvbn1cbiAgICAgICAgb25JbXBvcnQ9e2ltcG9ydEFubm90YXRpb25zfVxuICAgICAgICBvbkNsZWFyRHJhZnQ9e2NsZWFyQW5ub3RhdGlvbkRyYWZ0fVxuICAgICAgICBvbkNsZWFyU2VsZWN0aW9uPXtjbGVhclJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgb25DbG9zZT17Y2xvc2VSZXZpZXd9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiZnVuY3Rpb24gZmFpbChwYXRoLCBtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihgJHtwYXRofSAke21lc3NhZ2V9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUHJvamVjdChwcm9qZWN0KSB7XG4gIGlmICghcHJvamVjdCB8fCB0eXBlb2YgcHJvamVjdCAhPT0gJ29iamVjdCcpIGZhaWwoJ3Byb2plY3QnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICBpZiAoIXByb2plY3Qudmlld3BvcnRzIHx8IHR5cGVvZiBwcm9qZWN0LnZpZXdwb3J0cyAhPT0gJ29iamVjdCcpIHtcbiAgICBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBjb25zdCB2aWV3cG9ydEVudHJpZXMgPSBPYmplY3QuZW50cmllcyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgaWYgKHZpZXdwb3J0RW50cmllcy5sZW5ndGggPT09IDApIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgdmlld3BvcnQnKVxuICBmb3IgKGNvbnN0IFtrZXksIHZpZXdwb3J0XSBvZiB2aWV3cG9ydEVudHJpZXMpIHtcbiAgICBpZiAoIXZpZXdwb3J0IHx8IHR5cGVvZiB2aWV3cG9ydCAhPT0gJ29iamVjdCcpIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fWAsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgZm9yIChjb25zdCBkaW1lbnNpb24gb2YgWyd3aWR0aCcsICdoZWlnaHQnXSkge1xuICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmlld3BvcnRbZGltZW5zaW9uXSkgfHwgdmlld3BvcnRbZGltZW5zaW9uXSA8PSAwKSB7XG4gICAgICAgIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fS4ke2RpbWVuc2lvbn1gLCAnbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCkpIHtcbiAgICBmYWlsKCdwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCcsIGByZWZlcmVuY2VzIG1pc3Npbmcgdmlld3BvcnQgXCIke3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0fVwiYClcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkocHJvamVjdC5zY3JlZW5zKSB8fCBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgZmFpbCgncHJvamVjdC5zY3JlZW5zJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc2NyZWVuJylcbiAgfVxuXG4gIGNvbnN0IGlkcyA9IG5ldyBTZXQoKVxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBgcHJvamVjdC5zY3JlZW5zWyR7aW5kZXh9XWBcbiAgICBpZiAoIXNjcmVlbiB8fCB0eXBlb2Ygc2NyZWVuICE9PSAnb2JqZWN0JykgZmFpbChwYXRoLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmlkICE9PSAnc3RyaW5nJyB8fCAhL15bYS16MC05LV0rJC8udGVzdChzY3JlZW4uaWQpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmlkYCwgJ211c3QgbWF0Y2ggL15bYS16MC05LV0rJC8nKVxuICAgIH1cbiAgICBpZiAoaWRzLmhhcyhzY3JlZW4uaWQpKSBmYWlsKGAke3BhdGh9LmlkYCwgYGlzIGR1cGxpY2F0ZSBcIiR7c2NyZWVuLmlkfVwiYClcbiAgICBpZHMuYWRkKHNjcmVlbi5pZClcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5jb21wb25lbnQgIT09ICdmdW5jdGlvbicpIGZhaWwoYCR7cGF0aH0uY29tcG9uZW50YCwgJ211c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbi5saW5rcykpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0ubGlua3NgLCAnbXVzdCBiZSBhbiBhcnJheScpXG4gICAgfVxuICB9KVxuXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIHNjcmVlbkluZGV4KSA9PiB7XG4gICAgc2NyZWVuLmxpbmtzLmZvckVhY2goKHRhcmdldCwgbGlua0luZGV4KSA9PiB7XG4gICAgICBpZiAoIWlkcy5oYXModGFyZ2V0KSkge1xuICAgICAgICBmYWlsKFxuICAgICAgICAgIGBwcm9qZWN0LnNjcmVlbnNbJHtzY3JlZW5JbmRleH1dLmxpbmtzWyR7bGlua0luZGV4fV1gLFxuICAgICAgICAgIGByZWZlcmVuY2VzIG1pc3Npbmcgc2NyZWVuIFwiJHt0YXJnZXR9XCJgLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfSlcblxuICBpZiAocHJvamVjdC5hbm5vdGF0aW9ucyAhPSBudWxsKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3QuYW5ub3RhdGlvbnMpKSBmYWlsKCdwcm9qZWN0LmFubm90YXRpb25zJywgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIGlmICh0eXBlb2YgcHJvamVjdC5hbm5vdGF0aW9uc1JldmlzaW9uICE9PSAnc3RyaW5nJyB8fCAhcHJvamVjdC5hbm5vdGF0aW9uc1JldmlzaW9uKSB7XG4gICAgICBmYWlsKCdwcm9qZWN0LmFubm90YXRpb25zUmV2aXNpb24nLCAnbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcgd2hlbiBhbm5vdGF0aW9ucyBhcmUgcHJvdmlkZWQnKVxuICAgIH1cbiAgICBjb25zdCBhbm5vdGF0aW9uSWRzID0gbmV3IFNldCgpXG4gICAgcHJvamVjdC5hbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LmFubm90YXRpb25zWyR7aW5kZXh9XWBcbiAgICAgIGlmICghYW5ub3RhdGlvbiB8fCB0eXBlb2YgYW5ub3RhdGlvbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICAgIGlmICh0eXBlb2YgYW5ub3RhdGlvbi5pZCAhPT0gJ3N0cmluZycgfHwgIWFubm90YXRpb24uaWQpIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBiZSBhIG5vbi1lbXB0eSBzdHJpbmcnKVxuICAgICAgaWYgKGFubm90YXRpb25JZHMuaGFzKGFubm90YXRpb24uaWQpKSBmYWlsKGAke3BhdGh9LmlkYCwgYGlzIGR1cGxpY2F0ZSBcIiR7YW5ub3RhdGlvbi5pZH1cImApXG4gICAgICBhbm5vdGF0aW9uSWRzLmFkZChhbm5vdGF0aW9uLmlkKVxuICAgICAgaWYgKCFpZHMuaGFzKGFubm90YXRpb24uc2NyZWVuSWQpKSB7XG4gICAgICAgIGZhaWwoYCR7cGF0aH0uc2NyZWVuSWRgLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7YW5ub3RhdGlvbi5zY3JlZW5JZH1cImApXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIGFubm90YXRpb24uY29udGVudCAhPT0gJ3N0cmluZycgfHwgIWFubm90YXRpb24uY29udGVudC50cmltKCkpIHtcbiAgICAgICAgZmFpbChgJHtwYXRofS5jb250ZW50YCwgJ211c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGlmICghYW5ub3RhdGlvbi5hbmNob3IgfHwgIVsnc2NyZWVuJywgJ25vZGUnXS5pbmNsdWRlcyhhbm5vdGF0aW9uLmFuY2hvci5raW5kKSkge1xuICAgICAgICBmYWlsKGAke3BhdGh9LmFuY2hvci5raW5kYCwgJ211c3QgYmUgXCJzY3JlZW5cIiBvciBcIm5vZGVcIicpXG4gICAgICB9XG4gICAgICBpZiAoYW5ub3RhdGlvbi5hbmNob3Iua2luZCA9PT0gJ25vZGUnICYmICFhbm5vdGF0aW9uLmFuY2hvci5zZWxlY3Rvcikge1xuICAgICAgICBmYWlsKGAke3BhdGh9LmFuY2hvci5zZWxlY3RvcmAsICdtdXN0IGJlIHByb3ZpZGVkIGZvciBhIG5vZGUgYW5ub3RhdGlvbicpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIiwgIi8qKlxuICogXHU1MzlGXHU1NzhCXHU1MTg1XHU3RjZFXHU2Q0U4XHU5MUNBXHUzMDAyQm9hcmQgXHU0RTJEXHU3Njg0XHU2NzJDXHU2NzNBXHU4MzQ5XHU3QTNGXHU1M0VGXHU5MDFBXHU4RkM3XHUyMDFDXHU1NDBDXHU2QjY1XHU1MjMwXHU1MzlGXHU1NzhCXHUyMDFEUHJvbXB0IFx1NTQwOFx1NUU3Nlx1NTIzMFx1OEZEOVx1OTFDQ1x1MzAwMlxuICogaWQgXHU1RkM1XHU5ODdCXHU5NTdGXHU2NzFGXHU3QTMzXHU1QjlBXHVGRjFCXHU2NkY0XHU2NUIwXHU1MTg1XHU1QkI5XHU2NUY2XHU0RTBEXHU4OTgxXHU2NkY0XHU2MzYyIGlkXHUzMDAyXG4gKi9cbmV4cG9ydCBjb25zdCBhbm5vdGF0aW9uc1JldmlzaW9uID0gJ2Fubm90YXRpb25zLXIxJ1xuXG5leHBvcnQgY29uc3QgYW5ub3RhdGlvbnMgPSBbXG4gIHtcbiAgICBpZDogJ25vdGUtMjA2NTZiYjAtNTQ4MC00NTAwLWFjYTEtYzc4OWU5MmUzOWQwJyxcbiAgICBzY3JlZW5JZDogJ3dvcmtzcGFjZScsXG4gICAgc2NyZWVuVGl0bGU6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAgIGFuY2hvcjoge1xuICAgICAga2luZDogJ3NjcmVlbicsXG4gICAgfSxcbiAgICBjb250ZW50OiAnXHU4RkQ5XHU2NjJGXHU1REU1XHU0RjVDXHU1MzNBXHU5OTk2XHU5ODc1JyxcbiAgICBzdGF0dXM6ICdvcGVuJyxcbiAgICBjcmVhdGVkQXQ6ICcyMDI2LTA4LTExVDAzOjIwOjA0LjUwNlonLFxuICAgIHVwZGF0ZWRBdDogJzIwMjYtMDgtMTFUMDM6MjA6MDQuNTA2WicsXG4gIH0sXG5dXG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIndmLWNob2ljZS1pbnB1dFwiIHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2hvaWNlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtZmllbGQtbGFiZWxcIiBodG1sRm9yPXtodG1sRm9yfT57bGFiZWx9PC9sYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICAgIHtoaW50ICYmICFlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2Vycm9yfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGNyZWF0ZUZsb3dQcm9wcyB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VIZWFkZXIoeyB0aXRsZSwgdGl0bGVJZCwgc3VidGl0bGUsIHN1YnRpdGxlSWQsIGFjdGlvbnMsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyIGNsYXNzTmFtZT17YHdmLXBhZ2UtaGVhZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtaGVhZGVyLWNvcHlcIj5cbiAgICAgICAgPGgxIGlkPXt0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXRpdGxlXCI+e3RpdGxlfTwvaDE+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxwIGlkPXtzdWJ0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvcD4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7YWN0aW9ucyA/IDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1hY3Rpb25zXCI+e2FjdGlvbnN9PC9kaXY+IDogbnVsbH1cbiAgICA8L2hlYWRlcj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOYXZpZ2F0aW9uTGlzdCh7IGFzLCBpdGVtcywgYWN0aXZlSWQsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGFzLFxuICAgIHsgY2xhc3NOYW1lLCAuLi5yZXN0IH0sXG4gICAgaXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtbmF2LWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi1uYXYtaXRlbSd9XG4gICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZGVOYXYoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxOYXZpZ2F0aW9uTGlzdFxuICAgICAgYXM9XCJuYXZcIlxuICAgICAgaXRlbXM9e2l0ZW1zfVxuICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUlkfVxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc2lkZS1uYXYgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJCYXIoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtdGFiLWJhciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtdGFiLWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi10YWItaXRlbSd9XG4gICAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyZWFkY3J1bWJzKHsgaXRlbXMgPSBbXSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtYnJlYWRjcnVtYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IGFyaWEtbGFiZWw9XCJCcmVhZGNydW1ic1wiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Ake2l0ZW0ubGFiZWx9LSR7aW5kZXh9YH0+XG4gICAgICAgICAge2luZGV4ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItZGl2aWRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXRlbS50byA/IChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1saW5rXCIgdHlwZT1cImJ1dHRvblwiIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9PlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWN1cnJlbnRcIj57aXRlbS5sYWJlbH08L3NwYW4+fVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuLyoqIFx1NzlGQlx1NTJBOFx1N0FFRlx1NjU3NFx1NUM0Rlx1NThGM1x1RkYxQVx1NTE4NVx1NUJCOVx1NTMzQVx1NTNFRlx1NkVEQVx1RkYwQ1RhYkJhciBcdThEMzRcdTVFOTVcdTMwMDJ0YWJzIC8gYWN0aXZlSWQgXHU0RTBFIFRhYkJhciBcdTc2RjhcdTU0MENcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVTaGVsbCh7IGNoaWxkcmVuLCB0YWJzID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tb2JpbGUtc2hlbGwgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIndmLW1vYmlsZS1zaGVsbC1ib2R5XCI+e2NoaWxkcmVufTwvbWFpbj5cbiAgICAgIHt0YWJzLmxlbmd0aCA+IDAgPyA8VGFiQmFyIGl0ZW1zPXt0YWJzfSBhY3RpdmVJZD17YWN0aXZlSWR9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBDZWxsKHsgdG8sIG9uQ2xpY2ssIHRpdGxlLCBzdWJ0aXRsZSwgdmFsdWUsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNlbGwgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jZWxsLW1haW5cIj5cbiAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1jZWxsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICB7c3VidGl0bGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkXCI+XG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkaW5nXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+e2NvbHVtbi5sYWJlbH08L3RoPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cIndmLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0tleSA9IGdldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtcm93XCIgZGF0YS13Zi1rZXk9e3Jvd0tleX0ga2V5PXtyb3dLZXl9PlxuICAgICAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2YtdGFibGUtY2VsbFwiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9PlxuICAgICAgICAgICAgICAgICAgICB7Y29sdW1uLnJlbmRlciA/IGNvbHVtbi5yZW5kZXIocm93W2NvbHVtbi5rZXldLCByb3cpIDogcm93W2NvbHVtbi5rZXldfVxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgb25DaGFuZ2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJ0YWJsaXN0XCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtdGFiLWNvbnRyb2xcIlxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2l0ZW0uaWQgPT09IGFjdGl2ZUlkfVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZT8uKGl0ZW0uaWQpfVxuICAgICAgICA+XG4gICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBzKHtcbiAgaXRlbXMgPSBbXSxcbiAgY3VycmVudCA9IDAsXG4gIGRpcmVjdGlvbiA9ICdob3Jpem9udGFsJyxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgdmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCdcbiAgcmV0dXJuIChcbiAgICA8b2xcbiAgICAgIGNsYXNzTmFtZT17YHdmLXN0ZXBzICR7dmVydGljYWwgPyAnd2Ytc3RlcHMtdmVydGljYWwnIDogJ3dmLXN0ZXBzLWhvcml6b250YWwnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGluZGV4IDwgY3VycmVudCA/ICdkb25lJyA6IGluZGV4ID09PSBjdXJyZW50ID8gJ2N1cnJlbnQnIDogJ3RvZG8nXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17YHdmLXN0ZXBzLWl0ZW0gd2Ytc3RlcHMtaXRlbS0ke3N0YXR1c31gfSBrZXk9e2l0ZW0uaWQgfHwgaXRlbS5sYWJlbCB8fCBpbmRleH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwLW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzID09PSAnZG9uZScgPyBudWxsIDogaW5kZXggKyAxfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHtpbmRleCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1saW5lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIHtpdGVtLmRlc2NyaXB0aW9uID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtZGVzY1wiPntpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfSl9XG4gICAgPC9vbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRW1wdHlTdGF0ZSh7IHRpdGxlLCBkZXNjcmlwdGlvbiwgYWN0aW9uLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1lbXB0eS1zdGF0ZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZW1wdHktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7dGl0bGUgPyA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWVtcHR5LXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICB7ZGVzY3JpcHRpb24gPyA8cCBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1kZXNjXCI+e2Rlc2NyaXB0aW9ufTwvcD4gOiBudWxsfVxuICAgICAge2FjdGlvbiA/IDxkaXYgY2xhc3NOYW1lPVwid2YtZW1wdHktYWN0aW9uXCI+e2FjdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHsgQ29sdW1uLCBSb3csIFNpZGVOYXYsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTY3JlZW5JZCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcblxuY29uc3QgTkFWX0lURU1TID0gW1xuICB7IGxhYmVsOiAnXHU1REU1XHU0RjVDXHU1MzNBJywgdG86ICd3b3Jrc3BhY2UnIH0sXG4gIHsgbGFiZWw6ICdDb2xsZWN0aW9ucycsIHRvOiAnY29sbGVjdGlvbicgfSxcbiAgeyBsYWJlbDogJ1x1NzNBRlx1NTg4MycsIHRvOiAnZW52aXJvbm1lbnRzJyB9LFxuICB7IGxhYmVsOiAnXHU1Mzg2XHU1M0YyJywgdG86ICdoaXN0b3J5JyB9LFxuICB7IGxhYmVsOiAnXHU4QkJFXHU3RjZFJywgdG86ICdzZXR0aW5ncycgfSxcbl1cblxuY29uc3QgQUNUSVZFX0FMSUFTID0ge1xuICAncmVxdWVzdC1lZGl0b3InOiAnY29sbGVjdGlvbicsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcHBTaGVsbCh7IGNoaWxkcmVuLCBhc2lkZSB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICBjb25zdCBhY3RpdmVJZCA9IEFDVElWRV9BTElBU1tzY3JlZW5JZF0gfHwgc2NyZWVuSWRcblxuICByZXR1cm4gKFxuICAgIDxSb3cgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBnYXA6IDAgfX0+XG4gICAgICA8Q29sdW1uXG4gICAgICAgIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX3JhaWxcIlxuICAgICAgICBnYXA9ezE2fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICBwYWRkaW5nOiAnMjBweCAxMnB4JyxcbiAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAndmFyKC0td2YtNTApJyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZFwiIGdhcD17NH0+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDE1IH19PkFQSSBDbGllbnQ8L3N0cm9uZz5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1tZXRhXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogJ3ZhcigtLXdmLTYwMCknIH19PlxuICAgICAgICAgICAgV29ya3NwYWNlIFx1MDBCNyBEZW1vXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPFNpZGVOYXYgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fbmF2XCIgYWN0aXZlSWQ9e2FjdGl2ZUlkfSBpdGVtcz17TkFWX0lURU1TfSAvPlxuICAgICAgPC9Db2x1bW4+XG4gICAgICB7YXNpZGUgPyAoXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19hc2lkZVwiXG4gICAgICAgICAgZ2FwPXsxMn1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDI2MCxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTZweCAxMnB4JyxcbiAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnMXB4IHNvbGlkIHZhcigtLXdmLTMwMCknLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICd2YXIoLS13Zi0xMDApJyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2FzaWRlfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPENvbHVtblxuICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19tYWluXCJcbiAgICAgICAgZ2FwPXswfVxuICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCwgb3ZlcmZsb3c6ICdhdXRvJyB9fVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L1Jvdz5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBGT0xERVJTID0gW1xuICB7XG4gICAgaWQ6ICdmb2xkZXItdXNlcnMnLFxuICAgIG5hbWU6ICdVc2VycycsXG4gICAgcmVxdWVzdHM6IFtcbiAgICAgIHsgaWQ6ICdyZXEtbGlzdC11c2VycycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdMaXN0IFVzZXJzJywgcGF0aDogJy92MS91c2VycycgfSxcbiAgICAgIHsgaWQ6ICdyZXEtZ2V0LXVzZXInLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnR2V0IFVzZXInLCBwYXRoOiAnL3YxL3VzZXJzLzppZCcgfSxcbiAgICAgIHsgaWQ6ICdyZXEtdXBkYXRlLXVzZXInLCBtZXRob2Q6ICdQQVRDSCcsIG5hbWU6ICdVcGRhdGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkJyB9LFxuICAgICAgeyBpZDogJ3JlcS1kaXNhYmxlLXVzZXInLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0Rpc2FibGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkL2Rpc2FibGUnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLXJvbGVzJyxcbiAgICBuYW1lOiAnUm9sZXMnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWxpc3Qtcm9sZXMnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnTGlzdCBSb2xlcycsIHBhdGg6ICcvdjEvcm9sZXMnIH0sXG4gICAgICB7IGlkOiAncmVxLWFzc2lnbi1yb2xlJywgbWV0aG9kOiAnUFVUJywgbmFtZTogJ0Fzc2lnbiBSb2xlJywgcGF0aDogJy92MS91c2Vycy86aWQvcm9sZXMnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLWF1ZGl0JyxcbiAgICBuYW1lOiAnQXVkaXQnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWF1ZGl0LWxvZycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdBdWRpdCBMb2cnLCBwYXRoOiAnL3YxL2F1ZGl0L2xvZ3MnIH0sXG4gICAgICB7IGlkOiAncmVxLWV4cG9ydC1hdWRpdCcsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnRXhwb3J0IEF1ZGl0JywgcGF0aDogJy92MS9hdWRpdC9leHBvcnQnIH0sXG4gICAgXSxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbGxlY3Rpb25TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsXG4gICAgICBhc2lkZT17XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXRyZWVcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlXCIgZ2FwPXsxNH0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLXRpdGxlXCIgbGV2ZWw9ezN9PlVzZXIgQVBJPC9IZWFkaW5nPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj4rPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0ZPTERFUlMubWFwKChmb2xkZXIpID0+IChcbiAgICAgICAgICAgIDxDb2x1bW5cbiAgICAgICAgICAgICAga2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2ZvbGRlclwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGdhcD17Nn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fZm9sZGVyLW5hbWVcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cbiAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAge2ZvbGRlci5yZXF1ZXN0cy5tYXAoKHJlcSkgPT4gKFxuICAgICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAgICBrZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3RcIlxuICAgICAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMHB4JyB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3QtbWV0aG9kXCI+e3JlcS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDEzIH19PntyZXEubmFtZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXBhZ2VcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJjb2xsZWN0aW9uLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImNvbGxlY3Rpb24tdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJVc2VyIEFQSVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJDb2xsZWN0aW9uIFx1MDBCNyAzIFx1NEUyQVx1NjU4N1x1NEVGNlx1NTkzOSBcdTAwQjcgOCBcdTRFMkFcdThCRjdcdTZDNDJcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fYWN0aW9uLXJ1blwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5SdW4gY29sbGVjdGlvbjwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2FjdGlvbi1uZXdcIiB0bz1cInJlcXVlc3QtZWRpdG9yXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTY1QjBcdTVFRkFcdThCRjdcdTZDNDI8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q2FyZCBpZD1cImNvbGxlY3Rpb24tbWV0YVwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGFcIiBzdHlsZT17eyBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtcm93XCIgZ2FwPXsyNH0+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+QmFzZSBVUkw8L1RleHQ+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS12YWx1ZVwiPnsne3tiYXNlVXJsfX0nfTwvc3Ryb25nPlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+XHU2Mzg4XHU2NzQzPC9UZXh0PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtdmFsdWVcIj5CZWFyZXIgVG9rZW48L3N0cm9uZz5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWl0ZW1cIiBnYXA9ezR9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWxhYmVsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19Plx1NjZGNFx1NjVCMDwvVGV4dD5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXZhbHVlXCI+XHU0RUNBXHU1OTI5IDEwOjI0PC9zdHJvbmc+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLWxpc3RcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC10aXRsZVwiIGxldmVsPXszfT5cdTUxNjhcdTkwRThcdThCRjdcdTZDNDI8L0hlYWRpbmc+XG4gICAgICAgICAge0ZPTERFUlMuZmxhdE1hcCgoZm9sZGVyKSA9PlxuICAgICAgICAgICAgZm9sZGVyLnJlcXVlc3RzLm1hcCgocmVxKSA9PiAoXG4gICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAga2V5PXtyZXEuaWR9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1pdGVtXCJcbiAgICAgICAgICAgICAgICBkYXRhLXdmLWtleT17YGxpc3QtJHtyZXEuaWR9YH1cbiAgICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW1ldGhvZFwiPntyZXEubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW5hbWVcIj57cmVxLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtcGF0aFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9IFx1MDBCNyB7cmVxLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW9wZW5cIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+XHU2MjUzXHU1RjAwPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICkpLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgRU5WX0xJU1QgPSBbXG4gIHsgaWQ6ICdlbnYtc3RhZ2luZycsIG5hbWU6ICdTdGFnaW5nJywgYWN0aXZlOiB0cnVlLCB2YXJzOiA2IH0sXG4gIHsgaWQ6ICdlbnYtcHJvZCcsIG5hbWU6ICdQcm9kdWN0aW9uJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNiB9LFxuICB7IGlkOiAnZW52LWxvY2FsJywgbmFtZTogJ0xvY2FsJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNCB9LFxuXVxuXG5jb25zdCBWQVJfUk9XUyA9IFtcbiAgeyBpZDogJ3YtYmFzZScsIGtleTogJ2Jhc2VVcmwnLCBpbml0aWFsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbScsIGN1cnJlbnQ6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tJyB9LFxuICB7IGlkOiAndi10b2tlbicsIGtleTogJ3Rva2VuJywgaW5pdGlhbDogJ3N0X2RlbW9fKioqKicsIGN1cnJlbnQ6ICdzdF9kZW1vXyoqKionIH0sXG4gIHsgaWQ6ICd2LXRlbmFudCcsIGtleTogJ3RlbmFudElkJywgaW5pdGlhbDogJ3RuXzEwMDg2JywgY3VycmVudDogJ3RuXzEwMDg2JyB9LFxuICB7IGlkOiAndi10aW1lb3V0Jywga2V5OiAndGltZW91dE1zJywgaW5pdGlhbDogJzE1MDAwJywgY3VycmVudDogJzE1MDAwJyB9LFxuICB7IGlkOiAndi1sb2NhbGUnLCBrZXk6ICdsb2NhbGUnLCBpbml0aWFsOiAnemgtQ04nLCBjdXJyZW50OiAnemgtQ04nIH0sXG5dXG5cbmNvbnN0IFZBUl9DT0xVTU5TID0gW1xuICB7IGtleTogJ2tleScsIGxhYmVsOiAnVmFyaWFibGUnIH0sXG4gIHsga2V5OiAnaW5pdGlhbCcsIGxhYmVsOiAnSW5pdGlhbCBWYWx1ZScgfSxcbiAgeyBrZXk6ICdjdXJyZW50JywgbGFiZWw6ICdDdXJyZW50IFZhbHVlJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gRW52aXJvbm1lbnRzU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJlbnZpcm9ubWVudHMtcGFnZVwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZW52aXJvbm1lbnRzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImVudmlyb25tZW50cy10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTcyOFx1OEJGN1x1NkM0MiBVUkwgLyBIZWFkZXIgLyBCb2R5IFx1NEUyRFx1OTAxQVx1OEZDNyB7e3Zhcn19IFx1NUYxNVx1NzUyOFwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19hY3Rpb24tYWRkXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTZERkJcdTUyQTBcdTUzRDhcdTkxQ0Y8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Um93IGlkPVwiZW52aXJvbm1lbnRzLXBpY2tlclwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyXCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyLWxhYmVsXCI+XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzPC9UZXh0PlxuICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19zZWxlY3RcIiBkZWZhdWx0VmFsdWU9XCJTdGFnaW5nXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgIDxvcHRpb24+U3RhZ2luZzwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uPkxvY2FsPC9vcHRpb24+XG4gICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aXZlLWJhZGdlXCI+QWN0aXZlPC9CYWRnZT5cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPFJvdyBpZD1cImVudmlyb25tZW50cy1jYXJkc1wiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICB7RU5WX0xJU1QubWFwKChlbnYpID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmRcIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbmFtZVwiPntlbnYubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICB7ZW52LmFjdGl2ZSA/IDxCYWRnZSBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtYmFkZ2VcIj5cdTRGN0ZcdTc1MjhcdTRFMkQ8L0JhZGdlPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbWV0YVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgbWFyZ2luVG9wOiA2IH19PlxuICAgICAgICAgICAgICAgIHtlbnYudmFyc30gXHU0RTJBXHU1M0Q4XHU5MUNGXG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImVudmlyb25tZW50cy10YWJsZS13cmFwXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS13cmFwXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5TdGFnaW5nIFx1NTNEOFx1OTFDRjwvVGV4dD5cbiAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICBpZD1cImVudmlyb25tZW50cy10YWJsZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3RhYmxlXCJcbiAgICAgICAgICAgIGNvbHVtbnM9e1ZBUl9DT0xVTU5TfVxuICAgICAgICAgICAgcm93cz17VkFSX1JPV1N9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IEhJU1RPUlkgPSBbXG4gIHtcbiAgICBpZDogJ2hpc3QtMScsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBuYW1lOiAnTGlzdCBVc2VycycsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS91c2Vycz9wYWdlPTEnLFxuICAgIHN0YXR1czogJzIwMCcsXG4gICAgdGltZTogJzE0MiBtcycsXG4gICAgYXQ6ICdcdTRFQ0FcdTU5MjkgMTQ6MjE6MDgnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTInLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIG5hbWU6ICdDcmVhdGUgT3JkZXInLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvb3JkZXJzJyxcbiAgICBzdGF0dXM6ICcyMDEnLFxuICAgIHRpbWU6ICczMTAgbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDEzOjU1OjQxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC0zJyxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBuYW1lOiAnTG9naW4nLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvYXV0aC9sb2dpbicsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnOTggbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDExOjAyOjE3JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC00JyxcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIG5hbWU6ICdHZXQgSW52b2ljZScsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9iaWxsaW5nL2ludm9pY2VzL2ludl84OCcsXG4gICAgc3RhdHVzOiAnNDA0JyxcbiAgICB0aW1lOiAnNjcgbXMnLFxuICAgIGF0OiAnXHU2NjI4XHU1OTI5IDE5OjQ0OjAzJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC01JyxcbiAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgbmFtZTogJ1VwZGF0ZSBVc2VyJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL3VzZXJzL3VfMTAwMScsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnMTg4IG1zJyxcbiAgICBhdDogJ1x1NjYyOFx1NTkyOSAxNjoxMjo1MCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtNicsXG4gICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICBuYW1lOiAnUmV2b2tlIFRva2VuJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL2F1dGgvdG9rZW4nLFxuICAgIHN0YXR1czogJzIwNCcsXG4gICAgdGltZTogJzU0IG1zJyxcbiAgICBhdDogJzA4LTA4IDIxOjA2OjIyJyxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEhpc3RvcnlTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktcGFnZVwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImhpc3RvcnktaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiaGlzdG9yeS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTY3MkNcdTY3M0FcdTY3MDBcdThGRDFcdTUzRDFcdTkwMDFcdTc2ODRcdThCRjdcdTZDNDJcdUZGMENcdTUzRUZcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTUyMzBcdTdGMTZcdThGOTFcdTU2NjhcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLWNsZWFyXCI+XHU2RTA1XHU3QTdBXHU1Mzg2XHU1M0YyPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktbGlzdFwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX2xpc3RcIiBnYXA9ezEwfT5cbiAgICAgICAgICB7SElTVE9SWS5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbVwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTIgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1tZXRob2RcIj57aXRlbS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXVybFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT57aXRlbS51cmx9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1hdFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6ICd2YXIoLS13Zi02MDApJyB9fT5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0uYXR9XG4gICAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tc3RhdHVzXCI+e2l0ZW0uc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tdGltZVwiPntpdGVtLnRpbWV9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tb3BlblwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5cdTYyNTNcdTVGMDA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGFicyxcbiAgVGV4dCxcbiAgVGV4dEFyZWEsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgUEFSQU1fUk9XUyA9IFtcbiAgeyBpZDogJ3AtcGFnZScsIGtleTogJ3BhZ2UnLCB2YWx1ZTogJzEnLCBkZXNjOiAnXHU5ODc1XHU3ODAxJyB9LFxuICB7IGlkOiAncC1zaXplJywga2V5OiAnc2l6ZScsIHZhbHVlOiAnMjAnLCBkZXNjOiAnXHU2QkNGXHU5ODc1XHU2NzYxXHU2NTcwJyB9LFxuICB7IGlkOiAncC1xJywga2V5OiAncScsIHZhbHVlOiAnYWxpY2UnLCBkZXNjOiAnXHU1MTczXHU5NTJFXHU1QjU3XHU2NDFDXHU3RDIyJyB9LFxuICB7IGlkOiAncC1zdGF0dXMnLCBrZXk6ICdzdGF0dXMnLCB2YWx1ZTogJ2FjdGl2ZScsIGRlc2M6ICdcdTc1MjhcdTYyMzdcdTcyQjZcdTYwMDEnIH0sXG5dXG5cbmNvbnN0IEhFQURFUl9ST1dTID0gW1xuICB7IGlkOiAnaC1hdXRoJywga2V5OiAnQXV0aG9yaXphdGlvbicsIHZhbHVlOiAnQmVhcmVyIHt7dG9rZW59fScsIGRlc2M6ICdcdThCQkZcdTk1RUVcdTRFRTRcdTcyNEMnIH0sXG4gIHsgaWQ6ICdoLWFjY2VwdCcsIGtleTogJ0FjY2VwdCcsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbicsIGRlc2M6ICcnIH0sXG4gIHsgaWQ6ICdoLXRyYWNlJywga2V5OiAnWC1SZXF1ZXN0LUlkJywgdmFsdWU6ICd7eyRndWlkfX0nLCBkZXNjOiAnXHU5NEZFXHU4REVGXHU4RkZEXHU4RTJBJyB9LFxuICB7IGlkOiAnaC1jbGllbnQnLCBrZXk6ICdYLUNsaWVudCcsIHZhbHVlOiAnYXBpLWNsaWVudC1kZW1vJywgZGVzYzogJycgfSxcbl1cblxuY29uc3QgUEFSQU1fQ09MVU1OUyA9IFtcbiAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0tleScgfSxcbiAgeyBrZXk6ICd2YWx1ZScsIGxhYmVsOiAnVmFsdWUnIH0sXG4gIHsga2V5OiAnZGVzYycsIGxhYmVsOiAnRGVzY3JpcHRpb24nIH0sXG5dXG5cbmNvbnN0IFJFU1BPTlNFX0pTT04gPSBge1xuICBcImRhdGFcIjogW1xuICAgIHsgXCJpZFwiOiBcInVfMTAwMVwiLCBcIm5hbWVcIjogXCJBbGljZVwiLCBcInJvbGVcIjogXCJhZG1pblwiIH0sXG4gICAgeyBcImlkXCI6IFwidV8xMDAyXCIsIFwibmFtZVwiOiBcIkJvYlwiLCBcInJvbGVcIjogXCJlZGl0b3JcIiB9LFxuICAgIHsgXCJpZFwiOiBcInVfMTAwM1wiLCBcIm5hbWVcIjogXCJDYXJvbFwiLCBcInJvbGVcIjogXCJ2aWV3ZXJcIiB9XG4gIF0sXG4gIFwicGFnZVwiOiAxLFxuICBcInRvdGFsXCI6IDEyOFxufWBcblxuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3RFZGl0b3JTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgncGFyYW1zJylcbiAgY29uc3QgW3Jlc3BUYWIsIHNldFJlc3BUYWJdID0gUmVhY3QudXNlU3RhdGUoJ2JvZHknKVxuXG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cInJlcXVlc3QtZWRpdG9yLXBhZ2VcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcGFnZVwiIGdhcD17MH0gc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScgfX0+XG4gICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3RvcFwiIGdhcD17MTJ9IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHggMTJweCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyB9fT5cbiAgICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGVJZD1cInJlcXVlc3QtZWRpdG9yLXRpdGxlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGU9XCJMaXN0IFVzZXJzXCJcbiAgICAgICAgICAgIHN1YnRpdGxlPVwiVXNlciBBUEkgLyBVc2Vyc1wiXG4gICAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2FjdGlvbi1jb2xsZWN0aW9uXCIgdG89XCJjb2xsZWN0aW9uXCI+XHU4RkQ0XHU1NkRFIENvbGxlY3Rpb248L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hY3Rpb24tc2F2ZVwiIHRvPVwiY29sbGVjdGlvblwiPlNhdmU8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIDxSb3cgaWQ9XCJyZXF1ZXN0LWVkaXRvci11cmxiYXJcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdXJsYmFyXCIgZ2FwPXs4fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19tZXRob2RcIiBkZWZhdWx0VmFsdWU9XCJHRVRcIiBzdHlsZT17eyB3aWR0aDogMTEwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPkdFVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlBPU1Q8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QVVQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QQVRDSDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPkRFTEVURTwvb3B0aW9uPlxuICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdXJsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3VybFwiXG4gICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT1cInt7YmFzZVVybH19L3YxL3VzZXJzXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2VudlwiIGRlZmF1bHRWYWx1ZT1cIlN0YWdpbmdcIiBzdHlsZT17eyB3aWR0aDogMTQwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPlN0YWdpbmc8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+TG9jYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgPEJ1dHRvbiBpZD1cInJlcXVlc3QtZWRpdG9yLXNlbmRcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2VuZFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgIFNlbmRcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuXG4gICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdGFic1wiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGFic1wiXG4gICAgICAgICAgICBhY3RpdmVJZD17dGFifVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdwYXJhbXMnLCBsYWJlbDogJ1BhcmFtcycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2hlYWRlcnMnLCBsYWJlbDogJ0hlYWRlcnMnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnYXV0aCcsIGxhYmVsOiAnQXV0aG9yaXphdGlvbicgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIHt0YWIgPT09ICdwYXJhbXMnID8gKFxuICAgICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXBhcmFtc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19wYXJhbXNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtQQVJBTV9ST1dTfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2hlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtIRUFERVJfUk9XU31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dGFiID09PSAnYm9keScgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWJvZHlcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keVwiIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19PlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LXRvb2xiYXJcIiBnYXA9ezh9IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogOCB9fT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktdHlwZVwiPnJhdzwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LWZvcm1hdFwiPkpTT048L0JhZGdlPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPFRleHRBcmVhXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktaW5wdXRcIlxuICAgICAgICAgICAgICAgIHJvd3M9ezZ9XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXsne1xcbiAgXCJub3RlXCI6IFwiR0VUIFx1OEJGN1x1NkM0Mlx1OTAxQVx1NUUzOFx1NjVFMCBCb2R5XHVGRjBDXHU2QjY0XHU1OTA0XHU0RUM1XHU3OTNBXHU2MTBGXHU3RjE2XHU4RjkxXHU1MzNBXCJcXG59J31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdhdXRoJyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItYXV0aFwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoXCIgc3R5bGU9e3sgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtZmllbGRzXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1yb3dcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1sYWJlbFwiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fT5UeXBlPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC10eXBlXCIgZGVmYXVsdFZhbHVlPVwiQmVhcmVyIFRva2VuXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5CZWFyZXIgVG9rZW48L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5BUEkgS2V5PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+QmFzaWMgQXV0aDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPk5vIEF1dGg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtcm93XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtbGFiZWxcIiBzdHlsZT17eyB3aWR0aDogODAgfX0+VG9rZW48L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXRva2VuXCJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPVwie3t0b2tlbn19XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2VcIlxuICAgICAgICAgIGdhcD17MTB9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMjQsIGJhY2tncm91bmQ6ICd2YXIoLS13Zi01MCknLCBtaW5IZWlnaHQ6IDI4MCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS10aXRsZVwiIGxldmVsPXszfT5SZXNwb25zZTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLW1ldGFcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3N0YXR1c1wiPjIwMCBPSzwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGltZVwiPjE0MiBtczwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2l6ZVwiPjMuMiBLQjwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L1Jvdz5cblxuICAgICAgICAgIDxUYWJzXG4gICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgYWN0aXZlSWQ9e3Jlc3BUYWJ9XG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0UmVzcFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnaGVhZGVycycsIGxhYmVsOiAnSGVhZGVycycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2Nvb2tpZXMnLCBsYWJlbDogJ0Nvb2tpZXMnIH0sXG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICB7cmVzcFRhYiA9PT0gJ2JvZHknID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1ib2R5XCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWJvZHlcIiBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fT5cbiAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1qc29uXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAxMiwgd2hpdGVTcGFjZTogJ3ByZS13cmFwJywgZm9udEZhbWlseTogJ3VpLW1vbm9zcGFjZSwgbW9ub3NwYWNlJyB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge1JFU1BPTlNFX0pTT059XG4gICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3Jlc3BUYWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWhlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtbXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0hlYWRlcicgfSxcbiAgICAgICAgICAgICAgICB7IGtleTogJ3ZhbHVlJywgbGFiZWw6ICdWYWx1ZScgfSxcbiAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgcm93cz17W1xuICAgICAgICAgICAgICAgIHsgaWQ6ICdyaC1jdCcsIGtleTogJ2NvbnRlbnQtdHlwZScsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtY2FjaGUnLCBrZXk6ICdjYWNoZS1jb250cm9sJywgdmFsdWU6ICduby1zdG9yZScgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtcmVxJywga2V5OiAneC1yZXF1ZXN0LWlkJywgdmFsdWU6ICdyZXFfOGYzYTJjJyB9LFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHtyZXNwVGFiID09PSAnY29va2llcycgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWNvb2tpZXNcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llc1wiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llcy1lbXB0eVwiPlx1NjcyQ1x1NkIyMVx1NTRDRFx1NUU5NFx1NjcyQVx1OEJCRVx1N0Y2RSBDb29raWU8L1RleHQ+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nc1NjcmVlbigpIHtcbiAgY29uc3QgW3NzbCwgc2V0U3NsXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtmb2xsb3dSZWRpcmVjdCwgc2V0Rm9sbG93UmVkaXJlY3RdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3Byb3h5LCBzZXRQcm94eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJzZXR0aW5ncy1wYWdlXCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cInNldHRpbmdzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cInNldHRpbmdzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMUFcdTc1MjhcdTUwNEZcdTU5N0RcdTMwMDFcdTRFRTNcdTc0MDZcdTRFMEVcdThCQzFcdTRFNjZcdUZGMDhcdTdFQkZcdTY4NDZcdTc5M0FcdTYxMEZcdUZGMDlcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtZ2VuZXJhbFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdTkwMUFcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiXHU5RUQ4XHU4QkE0XHU4RDg1XHU2NUY2XHVGRjA4bXNcdUZGMDlcIiBodG1sRm9yPVwic2V0dGluZ3MtdGltZW91dFwiPlxuICAgICAgICAgICAgICA8VGV4dElucHV0IGlkPVwic2V0dGluZ3MtdGltZW91dFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX190aW1lb3V0XCIgZGVmYXVsdFZhbHVlPVwiMTUwMDBcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLWxhYmVsXCI+XHU4MUVBXHU1MkE4XHU4RERGXHU5NjhGXHU5MUNEXHU1QjlBXHU1NDExPC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1yZWRpcmVjdFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3JlZGlyZWN0XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtmb2xsb3dSZWRpcmVjdH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Rm9sbG93UmVkaXJlY3R9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtbGFiZWxcIj5cdTY4MjFcdTlBOENcdThCQzFcdTRFNjZcdUZGMDhTU0xcdUZGMDk8L1RleHQ+XG4gICAgICAgICAgICAgIDxUb2dnbGVcbiAgICAgICAgICAgICAgICBpZD1cInNldHRpbmdzLXNzbFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NzbFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c3NsfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTc2x9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtcHJveHlcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvblwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tYm9keVwiIGdhcD17MTR9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XHU0RUUzXHU3NDA2PC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3Byb3h5fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQcm94eX1cbiAgICAgICAgICAgICAgICBsYWJlbD17cHJveHkgPyAnXHU1RjAwXHU1NDJGJyA6ICdcdTUxNzNcdTk1RUQnfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiSG9zdFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LWhvc3RcIiBkZWZhdWx0VmFsdWU9XCIxMjcuMC4wLjFcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiUG9ydFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LXBvcnRcIiBkZWZhdWx0VmFsdWU9XCI3ODkwXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJzZXR0aW5ncy1jZXJ0c1wiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdThCQzFcdTRFNjY8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtZW1wdHlcIiBzdHlsZT17eyBmb250U2l6ZTogMTMgfX0+XG4gICAgICAgICAgICAgIFx1NUMxQVx1NjcyQVx1NkRGQlx1NTJBMFx1NUJBMlx1NjIzN1x1N0FFRlx1OEJDMVx1NEU2Nlx1MzAwMlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTNFRlx1NTcyOFx1NkI2NFx1NjMwMlx1OEY3RCAucGVtIC8gLnAxMlx1MzAwMlxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtYWRkXCI+XHU2REZCXHU1MkEwXHU4QkMxXHU0RTY2PC9CdXR0b24+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjguMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjguMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgQ09MTEVDVElPTlMgPSBbXG4gIHtcbiAgICBpZDogJ2NvbC11c2VycycsXG4gICAgbmFtZTogJ1VzZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU3NTI4XHU2MjM3XHU1MjE3XHU4ODY4XHUzMDAxXHU4QkU2XHU2MEM1XHUzMDAxXHU2NkY0XHU2NUIwXHU0RTBFXHU3OTgxXHU3NTI4JyxcbiAgICBjb3VudDogNixcbiAgICB1cGRhdGVkQXQ6ICdcdTRFQ0FcdTU5MjkgMTA6MjQnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtb3JkZXJzJyxcbiAgICBuYW1lOiAnT3JkZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU4QkEyXHU1MzU1XHU2N0U1XHU4QkUyXHUzMDAxXHU1MjFCXHU1RUZBXHUzMDAxXHU1M0Q2XHU2RDg4XHUzMDAxXHU1QzY1XHU3RUE2XHU3MkI2XHU2MDAxJyxcbiAgICBjb3VudDogOSxcbiAgICB1cGRhdGVkQXQ6ICdcdTY2MjhcdTU5MjkgMTg6MDInLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtYXV0aCcsXG4gICAgbmFtZTogJ0F1dGgnLFxuICAgIGRlc2M6ICdcdTc2N0JcdTVGNTVcdTMwMDFcdTUyMzdcdTY1QjAgVG9rZW5cdTMwMDFcdTc2N0JcdTUxRkEnLFxuICAgIGNvdW50OiA0LFxuICAgIHVwZGF0ZWRBdDogJzA4LTA4IDE0OjExJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnY29sLWJpbGxpbmcnLFxuICAgIG5hbWU6ICdCaWxsaW5nJyxcbiAgICBkZXNjOiAnXHU4RDI2XHU1MzU1XHUzMDAxXHU1M0QxXHU3OTY4XHUzMDAxXHU2NTJGXHU0RUQ4XHU1NkRFXHU4QzAzJyxcbiAgICBjb3VudDogNSxcbiAgICB1cGRhdGVkQXQ6ICcwOC0wNyAwOTo0MCcsXG4gIH0sXG5dXG5cbmNvbnN0IFJFQ0VOVCA9IFtcbiAgeyBpZDogJ3JlcS1saXN0LXVzZXJzJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0xpc3QgVXNlcnMnLCBwYXRoOiAnL3YxL3VzZXJzJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWNyZWF0ZS1vcmRlcicsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnQ3JlYXRlIE9yZGVyJywgcGF0aDogJy92MS9vcmRlcnMnLCBzdGF0dXM6ICcyMDEnIH0sXG4gIHsgaWQ6ICdyZXEtbG9naW4nLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0xvZ2luJywgcGF0aDogJy92MS9hdXRoL2xvZ2luJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWdldC1pbnZvaWNlJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0dldCBJbnZvaWNlJywgcGF0aDogJy92MS9iaWxsaW5nL2ludm9pY2VzLzppZCcsIHN0YXR1czogJzQwNCcgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFdvcmtzcGFjZVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGxcbiAgICAgIGFzaWRlPXtcbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1hc2lkZVwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGVcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtdGl0bGVcIiBsZXZlbD17M30+Q29sbGVjdGlvbnM8L0hlYWRpbmc+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtbmV3XCIgdG89XCJjb2xsZWN0aW9uXCI+XHU2NUIwXHU1RUZBPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0NPTExFQ1RJT05TLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tY2FyZFwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cImNvbGxlY3Rpb25cIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1uYW1lXCI+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLWNvdW50XCI+e2l0ZW0uY291bnR9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1kZXNjXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBtYXJnaW5Ub3A6IDQgfX0+XG4gICAgICAgICAgICAgICAge2l0ZW0uZGVzY31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIH1cbiAgICA+XG4gICAgICA8Q29sdW1uIGlkPVwid29ya3NwYWNlLXBhZ2VcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cIndvcmtzcGFjZS1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJ3b3Jrc3BhY2UtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NURFNVx1NEY1Q1x1NTMzQVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMDlcdTYyRTkgQ29sbGVjdGlvbiBcdTYyNTNcdTVGMDBcdThCRjdcdTZDNDJcdUZGMENcdTYyMTZcdTRFQ0VcdTY3MDBcdThGRDFcdThCQjBcdTVGNTVcdTdFRTdcdTdFRURcdTdGMTZcdThGOTFcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FjdGlvbi1lbnZcIiB0bz1cImVudmlyb25tZW50c1wiPlx1NTIwN1x1NjM2Mlx1NzNBRlx1NTg4MzwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYWN0aW9uLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIiB2YXJpYW50PVwicHJpbWFyeVwiPlx1NjVCMFx1NUVGQVx1OEJGN1x1NkM0MjwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwid29ya3NwYWNlLXdlbGNvbWVcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWVcIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWUtdGl0bGVcIiBsZXZlbD17M30+RGVtbyBXb3Jrc3BhY2U8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX193ZWxjb21lLWNvcHlcIj5cbiAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1NzNBRlx1NTg4M1x1RkYxQVN0YWdpbmcgXHUwMEI3IEJhc2UgVVJMIFx1NEY3Rlx1NzUyOCB7J3t7YmFzZVVybH19J30gXHUwMEI3IFx1NTE3MSA0IFx1NEUyQSBDb2xsZWN0aW9uXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1yZWNlbnRcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudFwiIGdhcD17MTB9PlxuICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NjcwMFx1OEZEMVx1OEJGN1x1NkM0MjwvSGVhZGluZz5cbiAgICAgICAgICB7UkVDRU5ULm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1pdGVtXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbWV0aG9kXCI+e2l0ZW0ubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1jb3B5XCIgZ2FwPXsyfSBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1wYXRoXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PntpdGVtLnBhdGh9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1zdGF0dXNcIj57aXRlbS5zdGF0dXN9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0XCIgdG89XCJoaXN0b3J5XCIgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtZGVzY1wiPlx1NjdFNVx1NzcwQlx1NjcyQ1x1NjczQVx1NTNEMVx1OTAwMVx1OEZDN1x1NzY4NFx1OEJGN1x1NkM0MjwvVGV4dD5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dFwiIHRvPVwic2V0dGluZ3NcIiBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtdGl0bGVcIiBsZXZlbD17M30+XHU4QkJFXHU3RjZFPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC1kZXNjXCI+XHU0RUUzXHU3NDA2XHUzMDAxXHU4QkMxXHU0RTY2XHU0RTBFXHU5MDFBXHU3NTI4XHU1MDRGXHU1OTdEPC9UZXh0PlxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPC9Sb3c+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiaW1wb3J0IHsgYW5ub3RhdGlvbnMsIGFubm90YXRpb25zUmV2aXNpb24gfSBmcm9tICcuL2Fubm90YXRpb25zLmpzJ1xuaW1wb3J0IHsgQ29sbGVjdGlvblNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9jb2xsZWN0aW9uLmpzeCdcbmltcG9ydCB7IEVudmlyb25tZW50c1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9lbnZpcm9ubWVudHMuanN4J1xuaW1wb3J0IHsgSGlzdG9yeVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9oaXN0b3J5LmpzeCdcbmltcG9ydCB7IFJlcXVlc3RFZGl0b3JTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcmVxdWVzdC1lZGl0b3IuanN4J1xuaW1wb3J0IHsgU2V0dGluZ3NTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvc2V0dGluZ3MuanN4J1xuaW1wb3J0IHsgV29ya3NwYWNlU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3dvcmtzcGFjZS5qc3gnXG5cbmNvbnN0IFNIRUxMX0xJTktTID0gWyd3b3Jrc3BhY2UnLCAnY29sbGVjdGlvbicsICdlbnZpcm9ubWVudHMnLCAnaGlzdG9yeScsICdzZXR0aW5ncyddXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnQVBJIENsaWVudFx1RkYwOFBvc3RtYW4gXHU5OENFXHU2ODNDXHVGRjA5JyxcbiAgYW5ub3RhdGlvbnNSZXZpc2lvbixcbiAgYW5ub3RhdGlvbnMsXG4gIHZpZXdwb3J0czoge1xuICAgIGRlc2t0b3A6IHsgd2lkdGg6IDE0NDAsIGhlaWdodDogOTAwIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ2Rlc2t0b3AnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICd3b3Jrc3BhY2UnLFxuICAgICAgdGl0bGU6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2xsZWN0aW9ucyBcdTRGQTdcdTY4MEZcdTRFMEVcdTY3MDBcdThGRDFcdThCRjdcdTZDNDJcdTUxNjVcdTUzRTMnLFxuICAgICAgY29tcG9uZW50OiBXb3Jrc3BhY2VTY3JlZW4sXG4gICAgICBlbnRyeTogdHJ1ZSxcbiAgICAgIGxpbmtzOiBbLi4uU0hFTExfTElOS1MsICdyZXF1ZXN0LWVkaXRvciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY29sbGVjdGlvbicsXG4gICAgICB0aXRsZTogJ0NvbGxlY3Rpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTY1ODdcdTRFRjZcdTU5MzlcdTRFMEVcdThCRjdcdTZDNDJcdTY4MTFcdUZGMENcdTYyNTNcdTVGMDBcdThCRjdcdTZDNDJcdTdGMTZcdThGOTFcdTU2NjgnLFxuICAgICAgY29tcG9uZW50OiBDb2xsZWN0aW9uU2NyZWVuLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdyZXF1ZXN0LWVkaXRvcicsXG4gICAgICB0aXRsZTogJ1x1OEJGN1x1NkM0Mlx1N0YxNlx1OEY5MScsXG4gICAgICBkZXNjcmlwdGlvbjogJ01ldGhvZCAvIFVSTCAvIFBhcmFtcyAvIEhlYWRlcnMgLyBCb2R5IFx1NEUwRSBSZXNwb25zZScsXG4gICAgICBjb21wb25lbnQ6IFJlcXVlc3RFZGl0b3JTY3JlZW4sXG4gICAgICBsaW5rczogU0hFTExfTElOS1MsXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdlbnZpcm9ubWVudHMnLFxuICAgICAgdGl0bGU6ICdcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0YnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTU5MUFcdTczQUZcdTU4ODNcdTUyMDdcdTYzNjJcdTRFMEVcdTUzRDhcdTkxQ0ZcdTg4NjgnLFxuICAgICAgY29tcG9uZW50OiBFbnZpcm9ubWVudHNTY3JlZW4sXG4gICAgICBsaW5rczogU0hFTExfTElOS1MsXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdoaXN0b3J5JyxcbiAgICAgIHRpdGxlOiAnXHU1Mzg2XHU1M0YyXHU4QkIwXHU1RjU1JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU2NzAwXHU4RkQxXHU1M0QxXHU5MDAxXHU4QkIwXHU1RjU1XHVGRjBDXHU1M0VGXHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU3RjE2XHU4RjkxXHU1NjY4JyxcbiAgICAgIGNvbXBvbmVudDogSGlzdG9yeVNjcmVlbixcbiAgICAgIGxpbmtzOiBbLi4uU0hFTExfTElOS1MsICdyZXF1ZXN0LWVkaXRvciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnc2V0dGluZ3MnLFxuICAgICAgdGl0bGU6ICdcdThCQkVcdTdGNkUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTkwMUFcdTc1MjhcdTMwMDFcdTRFRTNcdTc0MDZcdTRFMEVcdThCQzFcdTRFNjYnLFxuICAgICAgY29tcG9uZW50OiBTZXR0aW5nc1NjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgXSxcbn1cbiIsICJpbXBvcnQgeyBCb2FyZCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9Cb2FyZC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBQcm90b3R5cGVQcm92aWRlciB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9qZWN0IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvdmFsaWRhdGVQcm9qZWN0LmpzJ1xuaW1wb3J0IHsgcHJvamVjdCB9IGZyb20gJy4vcHJvamVjdC5qcydcblxudmFsaWRhdGVQcm9qZWN0KHByb2plY3QpXG5cblJlYWN0RE9NLmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSkucmVuZGVyKFxuICA8RXJyb3JCb3VuZGFyeSBzY29wZT1cImJvYXJkXCI+XG4gICAgPFByb3RvdHlwZVByb3ZpZGVyIHByb2plY3Q9e3Byb2plY3R9PlxuICAgICAgPEJvYXJkIHByb2plY3Q9e3Byb2plY3R9IC8+XG4gICAgPC9Qcm90b3R5cGVQcm92aWRlcj5cbiAgPC9FcnJvckJvdW5kYXJ5PixcbilcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUFBLE1BQU0sbUJBQW1CLE1BQU0sY0FBYyxJQUFJO0FBRWpELFdBQVMsbUJBQW1CQSxVQUFTO0FBRnJDO0FBR0UsYUFBTyxLQUFBQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxLQUFLLE1BQTdDLG1CQUFnRCxPQUFNQSxTQUFRLFFBQVEsQ0FBQyxFQUFFO0FBQUEsRUFDbEY7QUFFTyxXQUFTLGtCQUFrQixFQUFFLFNBQUFBLFVBQVMsU0FBUyxHQUFHO0FBQ3ZELFVBQU0sa0JBQWtCLG1CQUFtQkEsUUFBTztBQUNsRCxVQUFNLENBQUMsT0FBTyxRQUFRLElBQUksTUFBTSxTQUFTO0FBQUEsTUFDdkMsTUFBTTtBQUFBLE1BQ04sYUFBYUEsU0FBUTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxNQUNULGlCQUFpQjtBQUFBLE1BQ2pCLFNBQVMsQ0FBQztBQUFBLElBQ1osQ0FBQztBQUVELFVBQU0sV0FBVyxNQUFNLFlBQVksQ0FBQyxPQUFPO0FBQ3pDLFVBQUksQ0FBQ0EsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sT0FBTyxFQUFFLEdBQUc7QUFDdkQsY0FBTSxJQUFJLE1BQU0sc0JBQXNCLEVBQUUsa0JBQWtCO0FBQUEsTUFDNUQ7QUFD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TUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUMvREEsa0JBQWdCLE9BQU87QUFFdkIsV0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ25ELG9DQUFDLGlCQUFjLE9BQU0sV0FDbkIsb0NBQUMscUJBQWtCLFdBQ2pCLG9DQUFDLFNBQU0sU0FBa0IsQ0FDM0IsQ0FDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInByb2plY3QiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJzbHVnIiwgInByb2plY3QiLCAiYW5ub3RhdGlvbnMiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJhbm5vdGF0aW9ucyIsICJfYSIsICJpbnRlcnNlY3RSZWN0IiwgInJlc29sdmVQb3NpdGlvbnMiLCAiYW5ub3RhdGlvbnMiLCAic2FtZVBvc2l0aW9ucyIsICJfYSIsICJwcm9qZWN0IiwgImFubm90YXRpb25zIiwgInByb2plY3QiXQp9Cg==
