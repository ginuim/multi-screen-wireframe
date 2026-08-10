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
    useWheelZoom(canvasRef, scale, setScale, canvasLocked);
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
  function ShortcutHelp({ demoAvailable, showCanvasIndex, onShowCanvasIndexChange, onClose }) {
    const shortcuts = getBoardShortcuts();
    return /* @__PURE__ */ React.createElement(PanelShell, { id: "wf-board-utility", title: "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E", ariaLabel: "\u5E2E\u52A9\u3001\u5FEB\u6377\u952E\u4E0E\u8BBE\u7F6E", onClose }, /* @__PURE__ */ React.createElement("dl", { className: "wf-shortcut-list" }, shortcuts.map((shortcut) => /* @__PURE__ */ React.createElement("div", { className: shortcut.id === "demo" && !demoAvailable ? "is-disabled" : "", key: shortcut.id }, /* @__PURE__ */ React.createElement("dt", null, /* @__PURE__ */ React.createElement("kbd", null, shortcut.keys)), /* @__PURE__ */ React.createElement("dd", null, shortcut.label, shortcut.id === "demo" && !demoAvailable ? "\uFF08\u5F53\u524D\u4E0D\u53EF\u7528\uFF09" : "")))), /* @__PURE__ */ React.createElement("p", { className: "wf-board-panel-note" }, "\u5728\u8F93\u5165\u6846\u3001\u6587\u672C\u57DF\u3001\u4E0B\u62C9\u6846\u548C\u53EF\u7F16\u8F91\u5185\u5BB9\u4E2D\u4E0D\u4F1A\u89E6\u53D1\u666E\u901A\u5FEB\u6377\u952E\u3002"), /* @__PURE__ */ React.createElement("section", { className: "wf-board-panel-section", "aria-labelledby": "wf-board-index-setting-title" }, /* @__PURE__ */ React.createElement("h2", { id: "wf-board-index-setting-title" }, "\u753B\u677F\u8BBE\u7F6E"), /* @__PURE__ */ React.createElement("label", { className: "wf-board-setting-row" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u663E\u793A\u753B\u677F\u7D22\u5F15"), /* @__PURE__ */ React.createElement("small", null, "\u5728\u753B\u677F\u4E0A\u663E\u793A\u53EF\u62D6\u62FD\u7684\u9875\u9762\u7D22\u5F15")), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "checkbox",
        checked: showCanvasIndex,
        onChange: (event) => onShowCanvasIndexChange(event.target.checked)
      }
    ))));
  }

  // starter/framework/lib/board/board-settings.js
  var DEFAULT_SETTINGS = Object.freeze({ showCanvasIndex: true });
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
  function readBoardSettings(storage, projectName) {
    try {
      const parsed = JSON.parse(storage == null ? void 0 : storage.getItem(boardSettingsStorageKey(projectName)));
      if (typeof (parsed == null ? void 0 : parsed.showCanvasIndex) === "boolean") {
        return { showCanvasIndex: parsed.showCanvasIndex };
      }
    } catch (e) {
    }
    return { ...DEFAULT_SETTINGS };
  }
  function saveBoardSettings(storage, projectName, settings) {
    const normalized = { showCanvasIndex: settings.showCanvasIndex !== false };
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
    const [reviewPanelVisible, setReviewPanelVisible] = React.useState(false);
    const [reviewSelections, setReviewSelections] = React.useState([]);
    const [reviewMultiSelect, setReviewMultiSelect] = React.useState(false);
    const [reviewItems, setReviewItems] = React.useState([]);
    const [helpVisible, setHelpVisible] = React.useState(false);
    const [canvasIndexVisible, setCanvasIndexVisible] = React.useState(
      () => readBoardSettings(getBoardStorage(), project2.name).showCanvasIndex
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
    }, [project2.screens, reviewMultiSelect, reviewSelections]);
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
    const toggleReview = React.useCallback(() => {
      if (reviewEnabled) {
        closeReview();
        return;
      }
      setInteractive(true);
      setReviewPanelVisible(false);
      setReviewEnabled(true);
    }, [closeReview, reviewEnabled]);
    const openReviewPanel = () => {
      setInteractive(true);
      setReviewEnabled(true);
      setReviewPanelVisible(true);
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
      saveBoardSettings(getBoardStorage(), project2.name, { showCanvasIndex: visible });
    }, [project2.name]);
    const canvasIndexSettingsProjectRef = React.useRef(null);
    React.useEffect(() => {
      const settings = readBoardSettings(getBoardStorage(), project2.name);
      setCanvasIndexVisible(settings.showCanvasIndex);
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
          className: reviewEnabled ? "wf-toolbar-icon-button is-active" : "wf-toolbar-icon-button",
          "aria-pressed": reviewEnabled,
          "aria-label": reviewEnabled ? "\u4FEE\u6539\u4E2D" : "\u4FEE\u6539",
          title: `\u4FEE\u6539\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt\uFF08${shortcutModifier}+M\uFF09`,
          onClick: toggleReview
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "edit" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u4FEE\u6539")
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
          viewResetKey: demoViewResetKey,
          expandedIds,
          onToggleExpand: toggleExpand,
          reviewEnabled,
          onReviewSelect: selectReviewElement,
          onCanvasClick: reviewPanelVisible ? closeReviewPanel : void 0
        }
      ),
      reviewEnabled ? /* @__PURE__ */ React.createElement(ReviewMarkers, { boardRef, items: reviewItems, onOpenPanel: openReviewPanel }) : null,
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
          onClose: () => setHelpVisible(false)
        }
      ) : null,
      /* @__PURE__ */ React.createElement(
        ReviewPanel,
        {
          project: project2,
          visible: reviewPanelVisible && reviewEnabled,
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
  function resolveColumns(columns, viewportKey) {
    const value = columns && typeof columns === "object" && !Array.isArray(columns) ? columns[viewportKey] : columns;
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
  function Grid({ className, style, children, columns = 1, gap = 0, to, onClick, ...rest }) {
    const { viewportKey } = usePrototype();
    const { classNameSuffix, role, tabIndex, flow } = useLayoutFlow(to, onClick, rest);
    const mergedStyle = {
      display: "grid",
      gridTemplateColumns: resolveColumns(columns, viewportKey),
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
  function Avatar({ size = 40, label, className = "", style, ...rest }) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `wf-avatar ${className}`.trim(),
        "aria-label": label,
        style: { width: size, height: size, ...style },
        ...rest
      }
    );
  }
  function ImagePlaceholder({
    width = "100%",
    height = 160,
    borderRadius = 0,
    className = "",
    style,
    ...rest
  }) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `wf-image-placeholder ${className}`.trim(),
        "aria-hidden": "true",
        style: { width, height, borderRadius, ...style },
        ...rest
      },
      /* @__PURE__ */ React.createElement("span", { className: "wf-placeholder-block" })
    );
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
  function Choice({ type, label, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("label", { className: `wf-choice ${className}`.trim() }, /* @__PURE__ */ React.createElement("input", { className: "wf-choice-input", type, ...rest }), /* @__PURE__ */ React.createElement("span", { className: "wf-choice-label" }, label));
  }
  function Checkbox(props) {
    return /* @__PURE__ */ React.createElement(Choice, { type: "checkbox", ...props });
  }
  function Radio(props) {
    return /* @__PURE__ */ React.createElement(Choice, { type: "radio", ...props });
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
  function TabBar({ items = [], activeId, className = "", ...rest }) {
    const { navigate } = usePrototype();
    return /* @__PURE__ */ React.createElement("nav", { className: `wf-tab-bar ${className}`.trim(), ...rest }, items.map((item) => /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        key: item.to,
        className: item.to === activeId ? "wf-tab-item is-active" : "wf-tab-item",
        ...createFlowProps(item.to, item.onClick, navigate)
      },
      /* @__PURE__ */ React.createElement("span", { className: "wf-tab-icon", "aria-hidden": "true" }),
      /* @__PURE__ */ React.createElement("span", { className: "wf-tab-label" }, item.label)
    )));
  }
  function Breadcrumbs({ items = [], className = "", ...rest }) {
    const { navigate } = usePrototype();
    return /* @__PURE__ */ React.createElement("nav", { className: `wf-breadcrumbs ${className}`.trim(), "aria-label": "Breadcrumbs", ...rest }, items.map((item, index) => /* @__PURE__ */ React.createElement(React.Fragment, { key: `${item.label}-${index}` }, index > 0 ? /* @__PURE__ */ React.createElement("span", { className: "wf-breadcrumb-divider", "aria-hidden": "true" }) : null, item.to ? /* @__PURE__ */ React.createElement("button", { className: "wf-breadcrumb-link", type: "button", ...createFlowProps(item.to, item.onClick, navigate) }, item.label) : /* @__PURE__ */ React.createElement("span", { className: "wf-breadcrumb-current" }, item.label))));
  }
  function MobileShell({ children, tabs: tabs2 = [], activeId, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-mobile-shell ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("main", { className: "wf-mobile-shell-body" }, children), tabs2.length > 0 ? /* @__PURE__ */ React.createElement(TabBar, { items: tabs2, activeId }) : null);
  }

  // starter/framework/lib/ui/data.jsx
  function Cell({ to, onClick, title, subtitle, value, className = "", children, ...rest }) {
    const flow = useFlowTarget(to, onClick);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `wf-cell ${to ? "wf-interactive" : ""} ${className}`.trim(),
        role: to ? "link" : rest.role,
        tabIndex: to && rest.tabIndex === void 0 ? 0 : rest.tabIndex,
        ...rest,
        ...flow
      },
      /* @__PURE__ */ React.createElement("div", { className: "wf-cell-main" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-cell-title" }, title), subtitle ? /* @__PURE__ */ React.createElement("span", { className: "wf-cell-subtitle" }, subtitle) : null, children),
      value !== void 0 ? /* @__PURE__ */ React.createElement("span", { className: "wf-cell-value" }, value) : null
    );
  }
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
  function Steps({
    items = [],
    current = 0,
    direction = "horizontal",
    className = "",
    ...rest
  }) {
    const vertical = direction === "vertical";
    return /* @__PURE__ */ React.createElement(
      "ol",
      {
        className: `wf-steps ${vertical ? "wf-steps-vertical" : "wf-steps-horizontal"} ${className}`.trim(),
        ...rest
      },
      items.map((item, index) => {
        const status = index < current ? "done" : index === current ? "current" : "todo";
        return /* @__PURE__ */ React.createElement("li", { className: `wf-steps-item wf-steps-item-${status}`, key: item.id || item.label || index }, /* @__PURE__ */ React.createElement("div", { className: "wf-steps-indicator" }, /* @__PURE__ */ React.createElement("span", { className: "wf-step-mark", "aria-hidden": "true" }, status === "done" ? null : index + 1), index < items.length - 1 ? /* @__PURE__ */ React.createElement("span", { className: "wf-steps-line", "aria-hidden": "true" }) : null), /* @__PURE__ */ React.createElement("div", { className: "wf-steps-content" }, /* @__PURE__ */ React.createElement("span", { className: "wf-steps-label" }, item.label), item.description ? /* @__PURE__ */ React.createElement("span", { className: "wf-steps-desc" }, item.description) : null));
      })
    );
  }
  function EmptyState({ title, description, action, className = "", ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-empty-state ${className}`.trim(), ...rest }, /* @__PURE__ */ React.createElement("span", { className: "wf-empty-icon", "aria-hidden": "true" }), title ? /* @__PURE__ */ React.createElement("strong", { className: "wf-empty-title" }, title) : null, description ? /* @__PURE__ */ React.createElement("p", { className: "wf-empty-desc" }, description) : null, action ? /* @__PURE__ */ React.createElement("div", { className: "wf-empty-action" }, action) : null);
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
  function Toast({ open, children, className = "", ...rest }) {
    if (!open) return null;
    return /* @__PURE__ */ React.createElement(ScreenPortal, null, /* @__PURE__ */ React.createElement("div", { className: `wf-overlay wf-toast ${className}`.trim(), role: "status", ...rest }, children));
  }
  function LoadingOverlay({ open, label = "\u52A0\u8F7D\u4E2D", className = "", ...rest }) {
    if (!open) return null;
    return /* @__PURE__ */ React.createElement(ScreenPortal, null, /* @__PURE__ */ React.createElement("div", { className: `wf-overlay wf-loading ${className}`.trim(), role: "status", ...rest }, /* @__PURE__ */ React.createElement("span", { className: "wf-loading-shape", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", { className: "wf-loading-label" }, label)));
  }

  // starter/framework/lib/ui/map.jsx
  function WireMap({ className = "", style, children, ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-map ${className}`.trim(), style: { position: "relative", ...style }, ...rest }, /* @__PURE__ */ React.createElement("span", { className: "wf-map-line wf-map-line-a", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("span", { className: "wf-map-line wf-map-line-b", "aria-hidden": "true" }), children);
  }
  function MapMarker({ x, y, label, to, onClick, className = "", style, ...rest }) {
    const flow = useFlowTarget(to, onClick);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: `wf-map-marker ${className}`.trim(),
        "aria-label": label,
        style: { left: `${x}%`, top: `${y}%`, ...style },
        ...rest,
        ...flow
      },
      /* @__PURE__ */ React.createElement("span", { className: "wf-map-marker-shape", "aria-hidden": "true" })
    );
  }
  function MapOverlay({ position = "bottom", className = "", children, ...rest }) {
    return /* @__PURE__ */ React.createElement("div", { className: `wf-map-overlay wf-map-overlay-${position} ${className}`.trim(), ...rest }, children);
  }

  // demo/travel-app/src/layouts/MobileLayout.jsx
  var tabs = [
    { label: "\u53D1\u73B0", to: "discover" },
    { label: "\u884C\u7A0B", to: "trips" },
    { label: "\u6211\u7684", to: "profile" }
  ];
  function MobileLayout({ children }) {
    const screenId = useScreenId();
    return /* @__PURE__ */ React.createElement(MobileShell, { className: "weekend-shell weekend-layout", tabs, activeId: screenId, "aria-label": "\u5468\u672B\u51FA\u53D1\u65C5\u884C\u52A9\u624B" }, children);
  }

  // demo/travel-app/src/screens/budget.jsx
  var COSTS = [
    { id: "cost-transit", item: "\u5E02\u5185\u4EA4\u901A", owner: "\u5171\u540C", amount: "48" },
    { id: "cost-ticket", item: "\u5C55\u5385\u95E8\u7968", owner: "\u6797\u6653\u91CE", amount: "80" },
    { id: "cost-lunch", item: "\u5348\u9910", owner: "\u5171\u540C", amount: "180" },
    { id: "cost-market", item: "\u5E02\u96C6\u9884\u7559", owner: "\u4E2A\u4EBA", amount: "120" }
  ];
  function BudgetScreen() {
    const [inviteOpen, setInviteOpen] = React.useState(false);
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "budget-page", gap: 18, className: "weekend-page budget__page" }, /* @__PURE__ */ React.createElement(PageHeader, { id: "budget-header", titleId: "budget-title", className: "budget__header", title: "\u9884\u7B97\u4E0E\u540C\u884C\u4EBA", subtitle: "\u4E3A\u884C\u7A0B\u9884\u7559\u8D39\u7528\u5E76\u9080\u8BF7\u4F19\u4F34", actions: /* @__PURE__ */ React.createElement(Button, { className: "budget__back", to: "trip-confirm" }, "\u8FD4\u56DE") }), /* @__PURE__ */ React.createElement(Card, { id: "budget-summary", className: "budget__summary" }, /* @__PURE__ */ React.createElement(Column, { className: "budget__summary-body", gap: 6 }, /* @__PURE__ */ React.createElement(Text, { className: "budget__summary-label" }, "\u9884\u8BA1\u603B\u8D39\u7528"), /* @__PURE__ */ React.createElement("strong", { className: "budget__summary-value" }, "428 \u5143"), /* @__PURE__ */ React.createElement(Text, { className: "budget__summary-note" }, "\u6309 3 \u4F4D\u540C\u884C\u4EBA\u8BA1\u7B97\uFF0C\u4EBA\u5747\u7EA6 143 \u5143"))), /* @__PURE__ */ React.createElement(DataTable, { id: "budget-table", className: "budget__table", columns: [{ key: "item", label: "\u9879\u76EE" }, { key: "owner", label: "\u627F\u62C5" }, { key: "amount", label: "\u91D1\u989D" }], rows: COSTS, getRowKey: (row) => row.id }), /* @__PURE__ */ React.createElement(Column, { id: "budget-members", className: "budget__members", gap: 12 }, /* @__PURE__ */ React.createElement(Row, { className: "budget__members-heading", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "budget__members-label" }, "\u540C\u884C\u4EBA"), /* @__PURE__ */ React.createElement(Button, { id: "budget-invite-action", className: "budget__invite-action", onClick: () => setInviteOpen(true) }, "\u9080\u8BF7")), /* @__PURE__ */ React.createElement(Row, { className: "budget__member-stack", gap: 14 }, /* @__PURE__ */ React.createElement(Column, { className: "budget__member", "data-wf-key": "member-lin", gap: 5, alignItems: "center" }, /* @__PURE__ */ React.createElement(Avatar, { className: "budget__member-avatar", label: "\u6797\u6653\u91CE" }), /* @__PURE__ */ React.createElement(Text, { className: "budget__member-name" }, "\u6797\u6653\u91CE")), /* @__PURE__ */ React.createElement(Column, { className: "budget__member", "data-wf-key": "member-chen", gap: 5, alignItems: "center" }, /* @__PURE__ */ React.createElement(Avatar, { className: "budget__member-avatar", label: "\u9648\u6986" }), /* @__PURE__ */ React.createElement(Text, { className: "budget__member-name" }, "\u9648\u6986")), /* @__PURE__ */ React.createElement(Column, { className: "budget__member", "data-wf-key": "member-zhou", gap: 5, alignItems: "center" }, /* @__PURE__ */ React.createElement(Avatar, { className: "budget__member-avatar", label: "\u5468\u5CB8" }), /* @__PURE__ */ React.createElement(Text, { className: "budget__member-name" }, "\u5468\u5CB8")))), /* @__PURE__ */ React.createElement(Button, { id: "budget-done", className: "budget__done", variant: "primary", to: "trip-confirm" }, "\u4FDD\u5B58\u9884\u7B97"), /* @__PURE__ */ React.createElement(
      Modal,
      {
        id: "budget-invite-modal",
        className: "budget__invite-modal",
        open: inviteOpen,
        title: "\u9080\u8BF7\u540C\u884C\u4EBA",
        onClose: () => setInviteOpen(false),
        actions: /* @__PURE__ */ React.createElement(Button, { className: "budget__invite-submit", variant: "primary", onClick: () => setInviteOpen(false) }, "\u53D1\u9001\u9080\u8BF7")
      },
      /* @__PURE__ */ React.createElement(FormField, { className: "budget__invite-field", label: "\u624B\u673A\u53F7\u6216\u7528\u6237\u540D", htmlFor: "budget-invite-input" }, /* @__PURE__ */ React.createElement(TextInput, { id: "budget-invite-input", className: "budget__invite-input", placeholder: "\u8F93\u5165\u540C\u884C\u4EBA\u4FE1\u606F" }))
    )));
  }

  // demo/travel-app/src/screens/discover.jsx
  var ROUTES = [
    { id: "route-canal", title: "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929", meta: "\u6B65\u884C 8.6 km \xB7 6 \u5C0F\u65F6", note: "\u65E7\u4ED3\u5E93\u3001\u6865\u4E0B\u5E02\u96C6\u4E0E\u508D\u665A\u6CB3\u5CB8" },
    { id: "route-hills", title: "\u57CE\u5317\u8F7B\u5F92\u6B65", meta: "\u5F92\u6B65 11 km \xB7 7 \u5C0F\u65F6", note: "\u6797\u95F4\u7F13\u5761\u3001\u89C2\u666F\u53F0\u4E0E\u5C71\u811A\u5C0F\u9986" },
    { id: "route-lanes", title: "\u8001\u8857\u6162\u6E38", meta: "\u6B65\u884C 5.2 km \xB7 4 \u5C0F\u65F6", note: "\u5DF7\u53E3\u65E9\u9910\u3001\u65E7\u4E66\u5E97\u4E0E\u793E\u533A\u82B1\u56ED" },
    { id: "route-lake", title: "\u73AF\u6E56\u9A91\u884C\u534A\u65E5", meta: "\u9A91\u884C 18 km \xB7 5 \u5C0F\u65F6", note: "\u6E7F\u5730\u6808\u9053\u3001\u5824\u5CB8\u4E0E\u65E5\u843D\u5E73\u53F0" },
    { id: "route-museum", title: "\u96E8\u5929\u535A\u7269\u9986\u7EBF", meta: "\u516C\u4EA4 4 \u7AD9 \xB7 6 \u5C0F\u65F6", note: "\u4E09\u4E2A\u5C55\u9986\u4E0E\u4E00\u95F4\u5B89\u9759\u5496\u5561\u9986" },
    { id: "route-night", title: "\u591C\u8272\u5EFA\u7B51\u6563\u6B65", meta: "\u6B65\u884C 6.4 km \xB7 3 \u5C0F\u65F6", note: "\u5E7F\u573A\u3001\u5267\u9662\u4E0E\u6C5F\u8FB9\u706F\u5149\u5E26" }
  ];
  function DiscoverScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "discover-page", gap: 18, className: "weekend-page discover__page" }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "discover-header",
        titleId: "discover-title",
        subtitleId: "discover-subtitle",
        className: "discover__header",
        title: "\u8FD9\u4E2A\u5468\u672B\uFF0C\u53BB\u54EA\u8D70\u8D70",
        subtitle: "\u4E3A\u4F60\u6311\u4E86\u51E0\u6761\u4E0D\u7528\u8D76\u65F6\u95F4\u7684\u57CE\u5E02\u8DEF\u7EBF",
        actions: /* @__PURE__ */ React.createElement(Button, { id: "discover-map-action", className: "discover__map-action", to: "explore-map" }, "\u5730\u56FE")
      }
    ), /* @__PURE__ */ React.createElement(Card, { id: "discover-featured", className: "weekend-route-card discover__featured", to: "route-detail" }, /* @__PURE__ */ React.createElement(ImagePlaceholder, { className: "discover__featured-image", height: 176, borderRadius: 0 }), /* @__PURE__ */ React.createElement(Column, { className: "weekend-route-card__body discover__featured-body", gap: 10 }, /* @__PURE__ */ React.createElement(Row, { className: "weekend-chip-row discover__featured-badges", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "discover__featured-badge" }, "\u672C\u5468\u63A8\u8350"), /* @__PURE__ */ React.createElement(Badge, { className: "discover__featured-badge" }, "\u9002\u5408\u521D\u6B21\u5230\u8BBF")), /* @__PURE__ */ React.createElement(Heading, { className: "discover__featured-title", level: 2 }, "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929"), /* @__PURE__ */ React.createElement(Text, { className: "discover__featured-copy" }, "\u4ECE\u65E7\u4ED3\u5E93\u51FA\u53D1\uFF0C\u6CBF\u6C34\u5CB8\u8D70\u5230\u6865\u4E0B\u5E02\u96C6\uFF0C\u5728\u65E5\u843D\u524D\u62B5\u8FBE\u6CB3\u6E7E\u5E73\u53F0\u3002"), /* @__PURE__ */ React.createElement(Row, { className: "weekend-card-meta discover__featured-meta", gap: 12 }, /* @__PURE__ */ React.createElement(Text, { className: "discover__featured-meta-item" }, "8.6 km"), /* @__PURE__ */ React.createElement(Text, { className: "discover__featured-meta-item" }, "\u7EA6 6 \u5C0F\u65F6"), /* @__PURE__ */ React.createElement(Text, { className: "discover__featured-meta-item" }, "\u8F7B\u677E")))), /* @__PURE__ */ React.createElement(Heading, { id: "discover-routes-title", className: "weekend-section-heading discover__routes-title", level: 2 }, "\u66F4\u591A\u8DEF\u7EBF"), /* @__PURE__ */ React.createElement(Grid, { id: "discover-routes", className: "discover__routes", columns: 1, gap: 14 }, ROUTES.map((route, index) => /* @__PURE__ */ React.createElement(Card, { className: "weekend-route-card discover__route-card", "data-wf-key": route.id, key: route.id, to: "route-detail" }, /* @__PURE__ */ React.createElement(ImagePlaceholder, { className: "discover__route-image", height: index % 2 === 0 ? 116 : 136, borderRadius: 0 }), /* @__PURE__ */ React.createElement(Column, { className: "weekend-route-card__body discover__route-body", gap: 7 }, /* @__PURE__ */ React.createElement(Heading, { className: "discover__route-title", level: 3 }, route.title), /* @__PURE__ */ React.createElement(Text, { className: "discover__route-meta" }, route.meta), /* @__PURE__ */ React.createElement(Text, { className: "discover__route-note" }, route.note)))))));
  }

  // demo/travel-app/src/components/ShanghaiMap.jsx
  function ShanghaiMap({ className = "", children, ...rest }) {
    return /* @__PURE__ */ React.createElement(WireMap, { className: `shanghai-map ${className}`.trim(), ...rest }, children);
  }

  // demo/travel-app/src/screens/explore-map.jsx
  function ExploreMapScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "explore-map-page", gap: 16, className: "weekend-page explore-map__page" }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "explore-map-header",
        titleId: "explore-map-title",
        className: "explore-map__header",
        title: "\u76EE\u7684\u5730\u5730\u56FE",
        subtitle: "\u8F7B\u89E6\u6807\u8BB0\u67E5\u770B\u63A8\u8350\u8DEF\u7EBF",
        actions: /* @__PURE__ */ React.createElement(Button, { className: "explore-map__back", to: "discover" }, "\u5217\u8868")
      }
    ), /* @__PURE__ */ React.createElement(Row, { id: "explore-map-filters", className: "weekend-chip-row explore-map__filters", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u5168\u90E8"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u6B65\u884C"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u9A91\u884C"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u5BA4\u5185")), /* @__PURE__ */ React.createElement(ShanghaiMap, { id: "explore-map-canvas", className: "weekend-map explore-map__canvas" }, /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-suzhou-creek", x: 51, y: 40, label: "\u82CF\u5DDE\u6CB3\u6EE8\u6C34\u6F2B\u6B65", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-bund", x: 62, y: 47, label: "\u5916\u6EE9\u5EFA\u7B51\u6F2B\u6E38", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-xuhui", x: 49, y: 55, label: "\u8861\u590D\u98CE\u8C8C\u9A91\u884C", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-pudong", x: 75, y: 43, label: "\u9646\u5BB6\u5634\u57CE\u5E02\u6F2B\u6B65", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapOverlay, { className: "explore-map__overlay", position: "bottom" }, /* @__PURE__ */ React.createElement(Card, { className: "explore-map__route-preview", to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "explore-map__preview-body", gap: 6 }, /* @__PURE__ */ React.createElement(Text, { className: "explore-map__preview-eyebrow" }, "\u8DDD\u79BB\u4F60 2.4 km"), /* @__PURE__ */ React.createElement("strong", { className: "explore-map__preview-title" }, "\u82CF\u5DDE\u6CB3\u6EE8\u6C34\u6F2B\u6B65"), /* @__PURE__ */ React.createElement(Text, { className: "explore-map__preview-meta" }, "8.6 km \xB7 \u7EA6 6 \u5C0F\u65F6 \xB7 \u8F7B\u677E")))))));
  }

  // demo/travel-app/src/screens/itinerary.jsx
  var EVENTS = [
    { id: "event-meet", time: "09:10", title: "\u5730\u94C1\u53E3\u96C6\u5408", note: "\u4ECE 3 \u53F7\u53E3\u6B65\u884C\u7EA6 8 \u5206\u949F\u5230\u8DEF\u7EBF\u8D77\u70B9\u3002", tag: "\u96C6\u5408" },
    { id: "event-warehouse", time: "09:30", title: "\u65E7\u4ED3\u5E93\u5C55\u5385", note: "\u770B\u5E38\u8BBE\u5C55\u4E0E\u5C4B\u9876\u7ED3\u6784\uFF0C\u5165\u53E3\u5904\u53EF\u5BC4\u5B58\u80CC\u5305\u3002", tag: "\u53C2\u89C2" },
    { id: "event-market", time: "11:00", title: "\u6865\u4E0B\u5468\u672B\u5E02\u96C6", note: "\u5148\u901B\u624B\u4F5C\u644A\u4F4D\uFF0C\u518D\u5728\u4E1C\u4FA7\u9910\u8F66\u533A\u7B80\u5355\u5348\u9910\u3002", tag: "\u5E02\u96C6" },
    { id: "event-lunch", time: "13:00", title: "\u6C34\u5CB8\u5C0F\u9986\u5348\u9910", note: "\u9884\u8BA1\u7528\u9910 70 \u5206\u949F\uFF0C\u9760\u7A97\u533A\u57DF\u65E0\u9700\u9884\u7EA6\u3002", tag: "\u7528\u9910" },
    { id: "event-lanes", time: "14:20", title: "\u6C34\u5CB8\u5C0F\u5DF7\u6563\u6B65", note: "\u6CBF\u77F3\u9636\u8FDB\u5165\u65E7\u8857\u533A\uFF0C\u7ECF\u8FC7\u4E66\u5E97\u548C\u516C\u5171\u6D17\u8863\u623F\u3002", tag: "\u6B65\u884C" },
    { id: "event-garden", time: "15:20", title: "\u793E\u533A\u82B1\u56ED\u4F11\u606F", note: "\u8865\u6C34\u5E76\u6574\u7406\u968F\u8EAB\u7269\u54C1\uFF0C\u82B1\u56ED\u5317\u95E8\u6709\u516C\u5171\u8BBE\u65BD\u3002", tag: "\u4F11\u606F" },
    { id: "event-sunset", time: "17:10", title: "\u6CB3\u6E7E\u65E5\u843D\u5E73\u53F0", note: "\u8DEF\u7EBF\u7EC8\u70B9\uFF0C\u53EF\u7EE7\u7EED\u6CBF\u5824\u5CB8\u6B65\u884C\u81F3\u665A\u9910\u533A\u57DF\u3002", tag: "\u89C2\u666F" }
  ];
  function ItineraryScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "itinerary-page", gap: 18, className: "weekend-page itinerary__page" }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "itinerary-header",
        titleId: "itinerary-title",
        className: "itinerary__header",
        title: "\u6BCF\u65E5\u884C\u7A0B",
        subtitle: "\u5468\u516D \xB7 \u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929",
        actions: /* @__PURE__ */ React.createElement(Button, { className: "itinerary__back", to: "route-detail" }, "\u8DEF\u7EBF")
      }
    ), /* @__PURE__ */ React.createElement(
      Steps,
      {
        id: "itinerary-progress",
        className: "itinerary__progress",
        current: 1,
        items: [{ id: "morning", label: "\u4E0A\u5348" }, { id: "afternoon", label: "\u4E0B\u5348" }, { id: "evening", label: "\u508D\u665A" }]
      }
    ), /* @__PURE__ */ React.createElement(Column, { id: "itinerary-events", className: "itinerary__events", gap: 14 }, EVENTS.map((event) => /* @__PURE__ */ React.createElement(Row, { className: "itinerary__event", "data-wf-key": event.id, key: event.id, gap: 10, alignItems: "flex-start" }, /* @__PURE__ */ React.createElement(Text, { className: "itinerary__time" }, event.time), /* @__PURE__ */ React.createElement(Card, { className: "itinerary__event-card" }, /* @__PURE__ */ React.createElement(Column, { className: "itinerary__event-body", gap: 8 }, /* @__PURE__ */ React.createElement(Row, { className: "itinerary__event-heading", alignItems: "center", justifyContent: "space-between", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "itinerary__event-title", level: 3 }, event.title), /* @__PURE__ */ React.createElement(Badge, { className: "itinerary__event-badge" }, event.tag)), /* @__PURE__ */ React.createElement(Text, { className: "itinerary__event-note" }, event.note)))))), /* @__PURE__ */ React.createElement(Card, { id: "itinerary-reminder", className: "itinerary__reminder" }, /* @__PURE__ */ React.createElement(Column, { className: "itinerary__reminder-body", gap: 6 }, /* @__PURE__ */ React.createElement("strong", { className: "itinerary__reminder-title" }, "\u51FA\u53D1\u63D0\u9192"), /* @__PURE__ */ React.createElement(Text, { className: "itinerary__reminder-copy" }, "\u5EFA\u8BAE\u643A\u5E26\u996E\u7528\u6C34\u3001\u8F7B\u4FBF\u96E8\u5177\u548C\u53EF\u91CD\u590D\u4F7F\u7528\u7684\u8D2D\u7269\u888B\u3002"))), /* @__PURE__ */ React.createElement(Button, { id: "itinerary-create-action", className: "itinerary__create-action", variant: "primary", to: "trip-create" }, "\u521B\u5EFA\u6211\u7684\u7248\u672C")));
  }

  // demo/travel-app/src/screens/login.jsx
  function LoginScreen() {
    return /* @__PURE__ */ React.createElement(Column, { id: "login-page", gap: 20, className: "weekend-login login__page" }, /* @__PURE__ */ React.createElement("span", { id: "login-logo", className: "weekend-logo-placeholder login__logo", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement(Column, { className: "login__intro", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { id: "login-title", className: "login__title", level: 1 }, "\u5468\u672B\u51FA\u53D1"), /* @__PURE__ */ React.createElement(Text, { className: "login__description" }, "\u628A\u60F3\u53BB\u7684\u5730\u65B9\uFF0C\u53D8\u6210\u4E00\u4EFD\u968F\u65F6\u80FD\u8D70\u7684\u884C\u7A0B\u3002")), /* @__PURE__ */ React.createElement(FormField, { className: "login__phone-field", label: "\u624B\u673A\u53F7", htmlFor: "login-phone" }, /* @__PURE__ */ React.createElement(TextInput, { id: "login-phone", className: "login__phone-input", inputMode: "tel", placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7" })), /* @__PURE__ */ React.createElement(FormField, { className: "login__code-field", label: "\u9A8C\u8BC1\u7801", htmlFor: "login-code", hint: "\u6F14\u793A\u73AF\u5883\u53EF\u8F93\u5165\u4EFB\u610F 6 \u4F4D\u6570\u5B57" }, /* @__PURE__ */ React.createElement(TextInput, { id: "login-code", className: "login__code-input", inputMode: "numeric", placeholder: "\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801" })), /* @__PURE__ */ React.createElement(Button, { id: "login-submit", className: "login__submit", variant: "primary", to: "discover" }, "\u5F00\u59CB\u63A2\u7D22"), /* @__PURE__ */ React.createElement(Text, { className: "login__agreement", as: "small" }, "\u7EE7\u7EED\u5373\u8868\u793A\u540C\u610F\u670D\u52A1\u6761\u6B3E\u4E0E\u9690\u79C1\u8BF4\u660E\u3002"));
  }

  // demo/travel-app/src/screens/profile.jsx
  function ProfileScreen() {
    const [notifications, setNotifications] = React.useState(true);
    const [offlineMaps, setOfflineMaps] = React.useState(false);
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "profile-page", gap: 20, className: "weekend-page profile__page" }, /* @__PURE__ */ React.createElement(PageHeader, { id: "profile-header", titleId: "profile-title", className: "profile__header", title: "\u6211\u7684", subtitle: "\u4E2A\u4EBA\u504F\u597D\u4E0E\u65C5\u884C\u8BBE\u7F6E" }), /* @__PURE__ */ React.createElement(Row, { id: "profile-summary", className: "profile__summary", gap: 12, alignItems: "center" }, /* @__PURE__ */ React.createElement(Avatar, { className: "profile__avatar", size: 58, label: "\u7528\u6237\u5934\u50CF\u5360\u4F4D" }), /* @__PURE__ */ React.createElement("div", { className: "profile__identity" }, /* @__PURE__ */ React.createElement("strong", { className: "profile__name" }, "\u6797\u6653\u91CE"), /* @__PURE__ */ React.createElement(Text, { className: "profile__bio" }, "\u5DF2\u8D70\u8FC7 12 \u5EA7\u57CE\u5E02"))), /* @__PURE__ */ React.createElement(Column, { id: "profile-account", className: "profile__account", gap: 0 }, /* @__PURE__ */ React.createElement(Cell, { className: "profile__account-cell", title: "\u65C5\u884C\u6863\u6848", subtitle: "\u504F\u597D\u3001\u8DB3\u8FF9\u4E0E\u6536\u85CF" }), /* @__PURE__ */ React.createElement(Cell, { className: "profile__account-cell", title: "\u540C\u884C\u4EBA", subtitle: "3 \u4F4D\u5E38\u7528\u540C\u884C\u4EBA" }), /* @__PURE__ */ React.createElement(Cell, { className: "profile__account-cell", title: "\u7D27\u6025\u8054\u7CFB\u4EBA", subtitle: "\u5DF2\u8BBE\u7F6E" })), /* @__PURE__ */ React.createElement(Column, { id: "profile-settings", className: "profile__settings", gap: 12 }, /* @__PURE__ */ React.createElement(Row, { className: "profile__setting-row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "profile__setting-label" }, "\u884C\u7A0B\u63D0\u9192"), /* @__PURE__ */ React.createElement(Toggle, { id: "profile-notifications", className: "profile__notifications", checked: notifications, onChange: setNotifications })), /* @__PURE__ */ React.createElement(Row, { className: "profile__setting-row", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Text, { className: "profile__setting-label" }, "\u81EA\u52A8\u4E0B\u8F7D\u79BB\u7EBF\u5730\u56FE"), /* @__PURE__ */ React.createElement(Toggle, { id: "profile-offline-maps", className: "profile__offline-maps", checked: offlineMaps, onChange: setOfflineMaps }))), /* @__PURE__ */ React.createElement(Column, { id: "profile-support", className: "profile__support", gap: 0 }, /* @__PURE__ */ React.createElement(Cell, { className: "profile__support-cell", title: "\u5E2E\u52A9\u4E0E\u53CD\u9988" }), /* @__PURE__ */ React.createElement(Cell, { className: "profile__support-cell", title: "\u9690\u79C1\u8BBE\u7F6E" }), /* @__PURE__ */ React.createElement(Cell, { className: "profile__support-cell", title: "\u5173\u4E8E\u5468\u672B\u51FA\u53D1", value: "1.0" }))));
  }

  // demo/travel-app/src/screens/route-detail.jsx
  var STOPS = [
    { id: "stop-warehouse", title: "\u65E7\u4ED3\u5E93\u5C55\u5385", subtitle: "09:30 \xB7 \u5EFA\u8BAE\u505C\u7559 60 \u5206\u949F" },
    { id: "stop-bridge", title: "\u6865\u4E0B\u5468\u672B\u5E02\u96C6", subtitle: "11:00 \xB7 \u5EFA\u8BAE\u505C\u7559 90 \u5206\u949F" },
    { id: "stop-lane", title: "\u6C34\u5CB8\u5C0F\u5DF7", subtitle: "13:30 \xB7 \u5348\u9910\u4E0E\u8857\u533A\u6563\u6B65" },
    { id: "stop-garden", title: "\u793E\u533A\u82B1\u56ED", subtitle: "15:20 \xB7 \u5EFA\u8BAE\u505C\u7559 45 \u5206\u949F" },
    { id: "stop-bend", title: "\u6CB3\u6E7E\u65E5\u843D\u5E73\u53F0", subtitle: "17:10 \xB7 \u8DEF\u7EBF\u7EC8\u70B9" }
  ];
  function RouteDetailScreen() {
    const [tab, setTab] = React.useState("overview");
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "route-detail-page", gap: 18, className: "weekend-page route-detail__page" }, /* @__PURE__ */ React.createElement(Breadcrumbs, { id: "route-detail-breadcrumbs", className: "route-detail__breadcrumbs", items: [{ label: "\u53D1\u73B0", to: "discover" }, { label: "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929" }] }), /* @__PURE__ */ React.createElement(ImagePlaceholder, { id: "route-detail-hero", className: "route-detail__hero", height: 224, borderRadius: 0 }), /* @__PURE__ */ React.createElement(Column, { id: "route-detail-summary", className: "route-detail__summary", gap: 10 }, /* @__PURE__ */ React.createElement(Row, { className: "weekend-chip-row route-detail__badges", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "route-detail__badge" }, "\u57CE\u5E02\u6F2B\u6B65"), /* @__PURE__ */ React.createElement(Badge, { className: "route-detail__badge" }, "\u8F7B\u677E"), /* @__PURE__ */ React.createElement(Badge, { className: "route-detail__badge" }, "\u53EF\u5E26\u5BA0\u7269")), /* @__PURE__ */ React.createElement(Heading, { id: "route-detail-title", className: "route-detail__title", level: 1 }, "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929"), /* @__PURE__ */ React.createElement(Text, { className: "route-detail__intro" }, "\u4E00\u6761\u4ECE\u5DE5\u4E1A\u9057\u5B58\u8D70\u5411\u751F\u6D3B\u8857\u533A\u7684\u6C34\u5CB8\u8DEF\u7EBF\u3002\u4E0A\u5348\u770B\u5C55\uFF0C\u4E2D\u5348\u901B\u5E02\u96C6\uFF0C\u508D\u665A\u5728\u6CB3\u6E7E\u7B49\u65E5\u843D\u3002")), /* @__PURE__ */ React.createElement(Grid, { id: "route-detail-facts", className: "route-detail__facts", columns: 3, gap: 8 }, /* @__PURE__ */ React.createElement(Card, { className: "route-detail__fact" }, /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-value" }, "8.6 km"), /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-label" }, "\u603B\u8DEF\u7A0B")), /* @__PURE__ */ React.createElement(Card, { className: "route-detail__fact" }, /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-value" }, "6 \u5C0F\u65F6"), /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-label" }, "\u5EFA\u8BAE\u65F6\u957F")), /* @__PURE__ */ React.createElement(Card, { className: "route-detail__fact" }, /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-value" }, "5 \u7AD9"), /* @__PURE__ */ React.createElement("span", { className: "route-detail__fact-label" }, "\u8DEF\u7EBF\u8282\u70B9"))), /* @__PURE__ */ React.createElement(Tabs, { id: "route-detail-tabs", className: "route-detail__tabs", activeId: tab, onChange: setTab, items: [{ id: "overview", label: "\u8DEF\u7EBF\u6982\u89C8" }, { id: "notes", label: "\u51FA\u53D1\u987B\u77E5" }] }), tab === "overview" ? /* @__PURE__ */ React.createElement(Column, { id: "route-detail-stops", className: "route-detail__stops", gap: 0 }, STOPS.map((stop, index) => /* @__PURE__ */ React.createElement(Cell, { className: "route-detail__stop", "data-wf-key": stop.id, key: stop.id, title: `${index + 1}. ${stop.title}`, subtitle: stop.subtitle, value: `${index + 1}` }))) : /* @__PURE__ */ React.createElement(Card, { id: "route-detail-notes", className: "route-detail__notes" }, /* @__PURE__ */ React.createElement(Column, { className: "route-detail__notes-body", gap: 10 }, /* @__PURE__ */ React.createElement(Text, { className: "route-detail__note" }, "\u6CBF\u9014\u5927\u90E8\u5206\u8DEF\u6BB5\u6709\u6811\u836B\uFF0C\u6CB3\u6E7E\u533A\u57DF\u4E0B\u5348\u65E5\u7167\u8F83\u5F3A\u3002"), /* @__PURE__ */ React.createElement(Text, { className: "route-detail__note" }, "\u65E7\u4ED3\u5E93\u5468\u4E00\u95ED\u9986\uFF0C\u5468\u672B\u5EFA\u8BAE\u63D0\u524D\u9884\u7EA6\u5165\u573A\u65F6\u6BB5\u3002"), /* @__PURE__ */ React.createElement(Text, { className: "route-detail__note" }, "\u8DEF\u7EBF\u7EC8\u70B9\u8DDD\u79BB\u5730\u94C1\u7AD9\u7EA6 900 \u7C73\uFF0C\u4E5F\u53EF\u4E58\u5750\u793E\u533A\u63A5\u9A73\u8F66\u3002"))), /* @__PURE__ */ React.createElement(Card, { id: "route-detail-guide", className: "route-detail__guide" }, /* @__PURE__ */ React.createElement(Column, { className: "route-detail__guide-body", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "route-detail__guide-title", level: 3 }, "\u8DEF\u7EBF\u7B56\u5212\u4EBA"), /* @__PURE__ */ React.createElement(Text, { className: "route-detail__guide-copy" }, "\u6797\u5C7F \xB7 \u57CE\u5E02\u6B65\u884C\u8BB0\u5F55\u8005\uFF0C\u5DF2\u53D1\u5E03 18 \u6761\u6C34\u5CB8\u8DEF\u7EBF\u3002"))), /* @__PURE__ */ React.createElement(Column, { id: "route-detail-actions", className: "route-detail__actions", gap: 10 }, /* @__PURE__ */ React.createElement(Button, { id: "route-detail-itinerary-action", className: "route-detail__itinerary-action", to: "itinerary" }, "\u67E5\u770B\u5B8C\u6574\u65E5\u7A0B"), /* @__PURE__ */ React.createElement(Button, { id: "route-detail-create-action", className: "route-detail__create-action", variant: "primary", to: "trip-create" }, "\u7528\u8FD9\u6761\u8DEF\u7EBF\u521B\u5EFA\u884C\u7A0B"))));
  }

  // demo/travel-app/src/screens/trip-confirm.jsx
  function TripConfirmScreen() {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [saved, setSaved] = React.useState(false);
    const submitTrip = () => {
      setConfirmOpen(false);
      setLoading(true);
      window.setTimeout(() => {
        setLoading(false);
        setSaved(true);
      }, 700);
    };
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "trip-confirm-page", gap: 18, className: "weekend-page trip-confirm__page" }, /* @__PURE__ */ React.createElement(PageHeader, { id: "trip-confirm-header", titleId: "trip-confirm-title", className: "trip-confirm__header", title: "\u786E\u8BA4\u884C\u7A0B", subtitle: "\u68C0\u67E5\u4FE1\u606F\u540E\u4FDD\u5B58\u5230\u6211\u7684\u884C\u7A0B" }), /* @__PURE__ */ React.createElement(Steps, { id: "trip-confirm-steps", className: "trip-confirm__steps", current: 2, items: [{ id: "basic", label: "\u57FA\u672C\u4FE1\u606F" }, { id: "budget", label: "\u9884\u7B97" }, { id: "confirm", label: "\u786E\u8BA4" }] }), /* @__PURE__ */ React.createElement(Card, { id: "trip-confirm-summary", className: "trip-confirm__summary" }, /* @__PURE__ */ React.createElement(Column, { className: "trip-confirm__summary-body", gap: 10 }, /* @__PURE__ */ React.createElement(Row, { className: "trip-confirm__summary-heading", alignItems: "center", justifyContent: "space-between", gap: 8 }, /* @__PURE__ */ React.createElement("strong", { className: "trip-confirm__trip-name" }, "\u5468\u516D\u8FD0\u6CB3\u6563\u6B65"), /* @__PURE__ */ React.createElement(Badge, { className: "trip-confirm__status" }, "\u5F85\u4FDD\u5B58")), /* @__PURE__ */ React.createElement(Text, { className: "trip-confirm__date" }, "2026 \u5E74 8 \u6708 15 \u65E5 \xB7 \u5468\u516D"), /* @__PURE__ */ React.createElement(Text, { className: "trip-confirm__route" }, "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929 \xB7 8.6 km \xB7 \u7EA6 6 \u5C0F\u65F6"))), /* @__PURE__ */ React.createElement(Column, { id: "trip-confirm-details", className: "trip-confirm__details", gap: 0 }, /* @__PURE__ */ React.createElement(Cell, { className: "trip-confirm__detail", title: "\u96C6\u5408\u5730\u70B9", subtitle: "\u8FD0\u6CB3\u8DEF\u5730\u94C1\u7AD9 3 \u53F7\u53E3" }), /* @__PURE__ */ React.createElement(Cell, { className: "trip-confirm__detail", title: "\u884C\u7A0B\u8282\u594F", value: "\u8F7B\u677E" }), /* @__PURE__ */ React.createElement(Cell, { className: "trip-confirm__detail", title: "\u540C\u884C\u4EBA\u6570", value: "3 \u4EBA" }), /* @__PURE__ */ React.createElement(Cell, { className: "trip-confirm__detail", title: "\u51FA\u53D1\u63D0\u9192", value: "\u5DF2\u5F00\u542F" })), /* @__PURE__ */ React.createElement(Card, { id: "trip-confirm-budget", className: "trip-confirm__budget", to: "budget" }, /* @__PURE__ */ React.createElement(Row, { className: "trip-confirm__budget-body", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement(Column, { className: "trip-confirm__budget-copy", gap: 5 }, /* @__PURE__ */ React.createElement(Text, { className: "trip-confirm__budget-label" }, "\u9884\u8BA1\u603B\u8D39\u7528"), /* @__PURE__ */ React.createElement(Text, { className: "trip-confirm__budget-note" }, "\u67E5\u770B\u660E\u7EC6\u4E0E\u540C\u884C\u4EBA")), /* @__PURE__ */ React.createElement("span", { className: "trip-confirm__total" }, "428 \u5143"))), /* @__PURE__ */ React.createElement(Column, { id: "trip-confirm-actions", className: "trip-confirm__actions", gap: 10 }, /* @__PURE__ */ React.createElement(Button, { id: "trip-confirm-submit", className: "trip-confirm__submit", variant: "primary", onClick: () => setConfirmOpen(true) }, "\u786E\u8BA4\u5E76\u4FDD\u5B58"), /* @__PURE__ */ React.createElement(Button, { className: "trip-confirm__trips-action", to: "trips" }, "\u67E5\u770B\u6211\u7684\u884C\u7A0B")), /* @__PURE__ */ React.createElement(
      ConfirmDialog,
      {
        id: "trip-confirm-dialog",
        className: "trip-confirm__dialog",
        open: confirmOpen,
        title: "\u4FDD\u5B58\u8FD9\u4EFD\u884C\u7A0B\uFF1F",
        message: "\u4FDD\u5B58\u540E\u4F1A\u540C\u6B65\u7ED9\u5DF2\u52A0\u5165\u7684\u540C\u884C\u4EBA\uFF0C\u5E76\u5728\u51FA\u53D1\u524D\u53D1\u9001\u63D0\u9192\u3002",
        confirmLabel: "\u786E\u8BA4\u4FDD\u5B58",
        onConfirm: submitTrip,
        onCancel: () => setConfirmOpen(false)
      }
    ), /* @__PURE__ */ React.createElement(LoadingOverlay, { id: "trip-confirm-loading", className: "trip-confirm__loading", open: loading, label: "\u6B63\u5728\u751F\u6210\u884C\u7A0B" }), /* @__PURE__ */ React.createElement(Toast, { id: "trip-confirm-toast", className: "trip-confirm__toast", open: saved }, "\u884C\u7A0B\u5DF2\u4FDD\u5B58\uFF0C\u53EF\u5728\u201C\u6211\u7684\u884C\u7A0B\u201D\u67E5\u770B\u3002")));
  }

  // demo/travel-app/src/screens/trip-create.jsx
  function TripCreateScreen() {
    const [reminder, setReminder] = React.useState(true);
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "trip-create-page", gap: 17, className: "weekend-page trip-create__page" }, /* @__PURE__ */ React.createElement(PageHeader, { id: "trip-create-header", titleId: "trip-create-title", className: "trip-create__header", title: "\u521B\u5EFA\u884C\u7A0B", subtitle: "\u5148\u786E\u5B9A\u65F6\u95F4\u4E0E\u540C\u884C\u65B9\u5F0F", actions: /* @__PURE__ */ React.createElement(Button, { className: "trip-create__cancel", to: "route-detail" }, "\u53D6\u6D88") }), /* @__PURE__ */ React.createElement(Steps, { id: "trip-create-steps", className: "trip-create__steps", current: 0, items: [{ id: "basic", label: "\u57FA\u672C\u4FE1\u606F" }, { id: "budget", label: "\u9884\u7B97" }, { id: "confirm", label: "\u786E\u8BA4" }] }), /* @__PURE__ */ React.createElement(FormField, { className: "trip-create__name-field", label: "\u884C\u7A0B\u540D\u79F0", htmlFor: "trip-create-name" }, /* @__PURE__ */ React.createElement(TextInput, { id: "trip-create-name", className: "trip-create__name-input", defaultValue: "\u5468\u516D\u8FD0\u6CB3\u6563\u6B65" })), /* @__PURE__ */ React.createElement(FormField, { className: "trip-create__date-field", label: "\u51FA\u53D1\u65E5\u671F", htmlFor: "trip-create-date", hint: "\u5EFA\u8BAE\u9009\u62E9\u5929\u6C14\u7A33\u5B9A\u7684\u65E5\u671F" }, /* @__PURE__ */ React.createElement(TextInput, { id: "trip-create-date", className: "trip-create__date-input", defaultValue: "2026-08-15" })), /* @__PURE__ */ React.createElement(FormField, { className: "trip-create__start-field", label: "\u96C6\u5408\u5730\u70B9", htmlFor: "trip-create-start" }, /* @__PURE__ */ React.createElement(Select, { id: "trip-create-start", className: "trip-create__start-select", defaultValue: "metro" }, /* @__PURE__ */ React.createElement("option", { className: "trip-create__start-option", value: "metro" }, "\u8FD0\u6CB3\u8DEF\u5730\u94C1\u7AD9 3 \u53F7\u53E3"), /* @__PURE__ */ React.createElement("option", { className: "trip-create__start-option", value: "warehouse" }, "\u65E7\u4ED3\u5E93\u6B63\u95E8"), /* @__PURE__ */ React.createElement("option", { className: "trip-create__start-option", value: "custom" }, "\u81EA\u5B9A\u4E49\u5730\u70B9"))), /* @__PURE__ */ React.createElement(Column, { id: "trip-create-pace", className: "trip-create__pace", gap: 9 }, /* @__PURE__ */ React.createElement("span", { className: "trip-create__group-label" }, "\u884C\u7A0B\u8282\u594F"), /* @__PURE__ */ React.createElement(Row, { className: "trip-create__pace-options", gap: 12 }, /* @__PURE__ */ React.createElement(Radio, { className: "trip-create__pace-option", name: "pace", label: "\u8F7B\u677E", defaultChecked: true }), /* @__PURE__ */ React.createElement(Radio, { className: "trip-create__pace-option", name: "pace", label: "\u6807\u51C6" }), /* @__PURE__ */ React.createElement(Radio, { className: "trip-create__pace-option", name: "pace", label: "\u7D27\u51D1" }))), /* @__PURE__ */ React.createElement(FormField, { className: "trip-create__note-field", label: "\u540C\u884C\u5907\u6CE8", htmlFor: "trip-create-note" }, /* @__PURE__ */ React.createElement(TextArea, { id: "trip-create-note", className: "trip-create__note-input", placeholder: "\u4F8B\u5982\uFF1A\u6709\u513F\u7AE5\u540C\u884C\uFF0C\u5E0C\u671B\u51CF\u5C11\u697C\u68AF\u8DEF\u6BB5" })), /* @__PURE__ */ React.createElement(Column, { id: "trip-create-preferences", className: "trip-create__preferences", gap: 10 }, /* @__PURE__ */ React.createElement(Checkbox, { className: "trip-create__preference", label: "\u4F18\u5148\u5B89\u6392\u65E0\u969C\u788D\u8DEF\u7EBF" }), /* @__PURE__ */ React.createElement(Checkbox, { className: "trip-create__preference", label: "\u907F\u5F00\u9700\u8981\u9884\u7EA6\u7684\u5730\u70B9", defaultChecked: true }), /* @__PURE__ */ React.createElement(Toggle, { id: "trip-create-reminder", className: "trip-create__reminder", checked: reminder, onChange: setReminder, label: "\u51FA\u53D1\u524D\u4E00\u5929\u63D0\u9192" })), /* @__PURE__ */ React.createElement(Button, { id: "trip-create-next", className: "trip-create__next", variant: "primary", to: "budget" }, "\u4E0B\u4E00\u6B65\uFF1A\u9884\u7B97\u4E0E\u540C\u884C\u4EBA")));
  }

  // demo/travel-app/src/screens/trips.jsx
  var TRIPS = [
    { id: "trip-canal", title: "\u5468\u516D\u8FD0\u6CB3\u6563\u6B65", date: "8 \u6708 15 \u65E5", status: "\u5F85\u51FA\u53D1", detail: "3 \u4EBA \xB7 5 \u4E2A\u5730\u70B9" },
    { id: "trip-lake", title: "\u73AF\u6E56\u9A91\u884C\u534A\u65E5", date: "8 \u6708 22 \u65E5", status: "\u89C4\u5212\u4E2D", detail: "2 \u4EBA \xB7 4 \u4E2A\u5730\u70B9" },
    { id: "trip-museum", title: "\u96E8\u5929\u535A\u7269\u9986\u7EBF", date: "9 \u6708 5 \u65E5", status: "\u5F85\u786E\u8BA4", detail: "4 \u4EBA \xB7 3 \u4E2A\u573A\u9986" },
    { id: "trip-hills", title: "\u57CE\u5317\u8F7B\u5F92\u6B65", date: "9 \u6708 12 \u65E5", status: "\u89C4\u5212\u4E2D", detail: "3 \u4EBA \xB7 6 \u4E2A\u5730\u70B9" }
  ];
  function TripsScreen() {
    const [tab, setTab] = React.useState("upcoming");
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "trips-page", gap: 18, className: "weekend-page trips__page" }, /* @__PURE__ */ React.createElement(
      PageHeader,
      {
        id: "trips-header",
        titleId: "trips-title",
        className: "trips__header",
        title: "\u6211\u7684\u884C\u7A0B",
        subtitle: "\u8BA1\u5212\u3001\u540C\u884C\u4FE1\u606F\u4E0E\u65C5\u884C\u8BB0\u5F55",
        actions: /* @__PURE__ */ React.createElement(Button, { id: "trips-create-action", className: "trips__create-action", to: "trip-create" }, "\u65B0\u5EFA")
      }
    ), /* @__PURE__ */ React.createElement(Tabs, { id: "trips-tabs", className: "trips__tabs", activeId: tab, onChange: setTab, items: [{ id: "upcoming", label: "\u5F85\u51FA\u53D1" }, { id: "completed", label: "\u5DF2\u5B8C\u6210" }, { id: "saved", label: "\u6536\u85CF" }] }), tab === "upcoming" ? /* @__PURE__ */ React.createElement(Column, { id: "trips-upcoming", className: "trips__list", gap: 12 }, TRIPS.map((trip) => /* @__PURE__ */ React.createElement(Card, { className: "trips__card", "data-wf-key": trip.id, key: trip.id, to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "trips__card-body", gap: 9 }, /* @__PURE__ */ React.createElement(Row, { className: "trips__card-heading", alignItems: "center", justifyContent: "space-between", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "trips__card-title", level: 3 }, trip.title), /* @__PURE__ */ React.createElement(Badge, { className: "trips__card-status" }, trip.status)), /* @__PURE__ */ React.createElement(Text, { className: "trips__card-date" }, trip.date), /* @__PURE__ */ React.createElement(Row, { className: "trips__status-row", gap: 10 }, /* @__PURE__ */ React.createElement(Text, { className: "trips__card-detail" }, trip.detail), /* @__PURE__ */ React.createElement(Text, { className: "trips__card-reminder" }, "\u63D0\u9192\u5DF2\u5F00\u542F")))))) : tab === "completed" ? /* @__PURE__ */ React.createElement(Column, { id: "trips-completed", className: "trips__completed", gap: 12 }, /* @__PURE__ */ React.createElement(Card, { className: "trips__card", "data-wf-key": "trip-old-street", to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "trips__card-body", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "trips__card-title", level: 3 }, "\u8001\u8857\u6162\u6E38"), /* @__PURE__ */ React.createElement(Text, { className: "trips__card-date" }, "7 \u6708 18 \u65E5 \xB7 \u5DF2\u5B8C\u6210"))), /* @__PURE__ */ React.createElement(Card, { className: "trips__card", "data-wf-key": "trip-night-walk", to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "trips__card-body", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "trips__card-title", level: 3 }, "\u591C\u8272\u5EFA\u7B51\u6563\u6B65"), /* @__PURE__ */ React.createElement(Text, { className: "trips__card-date" }, "6 \u6708 27 \u65E5 \xB7 \u5DF2\u5B8C\u6210"))), /* @__PURE__ */ React.createElement(Card, { className: "trips__card", "data-wf-key": "trip-riverside", to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "trips__card-body", gap: 8 }, /* @__PURE__ */ React.createElement(Heading, { className: "trips__card-title", level: 3 }, "\u5357\u5CB8\u65E7\u7801\u5934"), /* @__PURE__ */ React.createElement(Text, { className: "trips__card-date" }, "5 \u6708 16 \u65E5 \xB7 \u5DF2\u5B8C\u6210")))) : /* @__PURE__ */ React.createElement(EmptyState, { id: "trips-saved-empty", className: "trips__empty", title: "\u8FD8\u6CA1\u6709\u6536\u85CF\u8DEF\u7EBF", description: "\u5728\u8DEF\u7EBF\u8BE6\u60C5\u4E2D\u6536\u85CF\uFF0C\u7A0D\u540E\u518D\u51B3\u5B9A\u4EC0\u4E48\u65F6\u5019\u51FA\u53D1\u3002", action: /* @__PURE__ */ React.createElement(Button, { className: "trips__empty-action", to: "discover" }, "\u53BB\u53D1\u73B0\u8DEF\u7EBF") })));
  }

  // demo/travel-app/src/project.js
  var project = {
    name: "\u5468\u672B\u51FA\u53D1\u65C5\u884C\u52A9\u624B",
    viewports: {
      mobile: { width: 375, height: 812 }
    },
    defaultViewport: "mobile",
    screens: [
      {
        id: "login",
        title: "\u767B\u5F55",
        component: LoginScreen,
        entry: true,
        links: ["discover"],
        edgeCases: []
      },
      {
        id: "discover",
        title: "\u53D1\u73B0",
        description: "\u8D85\u8FC7\u4E00\u5C4F\u7684\u8DEF\u7EBF\u63A8\u8350\u9996\u9875",
        component: DiscoverScreen,
        links: ["discover", "explore-map", "route-detail", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "explore-map",
        title: "\u76EE\u7684\u5730\u5730\u56FE",
        component: ExploreMapScreen,
        links: ["discover", "route-detail", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "route-detail",
        title: "\u8DEF\u7EBF\u8BE6\u60C5",
        description: "\u957F\u5185\u5BB9\u8DEF\u7EBF\u4ECB\u7ECD\u4E0E\u5730\u70B9\u5217\u8868",
        component: RouteDetailScreen,
        links: ["discover", "explore-map", "itinerary", "trip-create", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "itinerary",
        title: "\u6BCF\u65E5\u884C\u7A0B",
        description: "\u8D85\u8FC7\u4E00\u5C4F\u7684\u7EB5\u5411\u6B65\u9AA4\u4E0E\u65E5\u7A0B\u5361\u7247",
        component: ItineraryScreen,
        links: ["discover", "route-detail", "trip-create", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "trip-create",
        title: "\u521B\u5EFA\u884C\u7A0B",
        component: TripCreateScreen,
        links: ["discover", "route-detail", "budget", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "budget",
        title: "\u9884\u7B97\u4E0E\u540C\u884C\u4EBA",
        component: BudgetScreen,
        links: ["discover", "trip-confirm", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "trip-confirm",
        title: "\u63D0\u4EA4\u786E\u8BA4",
        component: TripConfirmScreen,
        links: ["discover", "budget", "trips", "profile"],
        edgeCases: ["\u786E\u8BA4\u5F39\u5C42", "\u52A0\u8F7D\u72B6\u6001", "\u6210\u529F\u63D0\u793A"]
      },
      {
        id: "trips",
        title: "\u6211\u7684\u884C\u7A0B",
        component: TripsScreen,
        links: ["discover", "route-detail", "trip-create", "trips", "profile"],
        edgeCases: []
      },
      {
        id: "profile",
        title: "\u4E2A\u4EBA\u8BBE\u7F6E",
        component: ProfileScreen,
        links: ["discover", "trips", "profile"],
        edgeCases: []
      }
    ]
  };

  // demo/travel-app/src/app.jsx
  validateProject(project);
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(ErrorBoundary, { scope: "board" }, /* @__PURE__ */ React.createElement(PrototypeProvider, { project }, /* @__PURE__ */ React.createElement(Board, { project })))
  );
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9tYXAuanN4IiwgIi4uL3NyYy9sYXlvdXRzL01vYmlsZUxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvYnVkZ2V0LmpzeCIsICIuLi9zcmMvc2NyZWVucy9kaXNjb3Zlci5qc3giLCAiLi4vc3JjL2NvbXBvbmVudHMvU2hhbmdoYWlNYXAuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCIsICIuLi9zcmMvc2NyZWVucy9pdGluZXJhcnkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvc2NyZWVucy9wcm9maWxlLmpzeCIsICIuLi9zcmMvc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXAtY29uZmlybS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXBzLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBmaW5kRmxvd1RhcmdldElkIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvaW50ZXJEb3duVGFyZ2V0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudCA9IGV2ZW50LnRhcmdldFxuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFMERcdTYzQTVcdTdCQTFcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMENcdThCQTlcdTRFOEJcdTRFRjZcdTg0M0RcdTUyMzBcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcbiAgICBpZiAoY2FudmFzTG9ja2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1REYyXHU1QzU1XHU1RjAwXHU2NUUwXHU1M0VGXHU2RURBXHU1MzNBXHU1N0RGXHVGRjBDXHU0RTBEXHU2MkEyXHU2MzA3XHU5NDg4XG4gICAgaWYgKGV4cGFuZGVkKSByZXR1cm5cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBsb2NrZWQ6IGNhbnZhc0xvY2tlZCwgc2NhbGUgfSlcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBzdGF0ZVxuICAgIC8vIFx1N0I0OVx1NzcxRlx1NkI2M1x1NjJENlx1OEZDN1x1OTYwOFx1NTAzQ1x1NTE4RCBjYXB0dXJlXHUzMDAyXHU4RkM3XHU2NUU5IHNldFBvaW50ZXJDYXB0dXJlIFx1NEYxQVx1NjI4QSBjbGljayBcdTkxQ0RcdTVCOUFcdTU0MTFcdTUyMzBcbiAgICAvLyAud2Ytc2NyZWVuLWNvbnRlbnRcdUZGMENcdTVCRkNcdTgxRjQgZGF0YS1mbG93LXRvIFx1NTlENFx1NjI1OFx1NEUwRVx1N0VDNFx1NEVGNiBvbkNsaWNrIFx1NTE2OFx1OTBFOFx1NTkzMVx1NjU0OFx1MzAwMlxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgY29uc3Qgd2FzTW92ZWQgPSBzdGF0ZS5tb3ZlZFxuICAgIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpXG4gICAgaWYgKCF3YXNNb3ZlZCAmJiBzdGF0ZS5tb3ZlZCkge1xuICAgICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgICAgdHJ5IHtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gaWdub3JlOiBcdTkwRThcdTUyMDZcdTczQUZcdTU4ODNcdTU3MjggcG9pbnRlcnVwIFx1NTQwRVx1OEMwM1x1NzUyOFx1NEYxQVx1NjI5QlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNvbnN0IHJvb3QgPSBjb250ZW50UmVmLmN1cnJlbnRcbiAgICBjb25zdCBkb3duVGFyZ2V0ID0gcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudFxuICAgIHBvaW50ZXJEb3duVGFyZ2V0UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgLy8gcG9pbnRlciBjYXB0dXJlIFx1NEVDRFx1NTNFRlx1ODBGRFx1NjI4QSBjbGljay50YXJnZXQgXHU2NTM5XHU2MjEwXHU1MTg1XHU1QkI5XHU2ODM5XHVGRjFCXHU1NkRFXHU5MDAwXHU1MjMwIHBvaW50ZXJkb3duIFx1NzZFRVx1NjgwN1xuICAgIGNvbnN0IHN0YXJ0RWwgPSBkb3duVGFyZ2V0ICYmIHJvb3Q/LmNvbnRhaW5zKGRvd25UYXJnZXQpID8gZG93blRhcmdldCA6IGV2ZW50LnRhcmdldFxuICAgIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290KVxuICAgIGlmICghdG8pIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICBuYXZpZ2F0ZSh0bylcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuLyoqIFx1N0VEMVx1NUI5QVx1OTc1RSBwYXNzaXZlIHdoZWVsXHVGRjBDXHU2MjREXHU4MEZEXHU1NDA4XHU2Q0Q1IHByZXZlbnREZWZhdWx0XHVGRjA4UmVhY3Qgb25XaGVlbCBcdTlFRDhcdThCQTQgcGFzc2l2ZVx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRXaGVlbFpvb20oZWwsIGdldFNjYWxlLCBzZXRTY2FsZSwgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UpIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgbG9ja2VkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuXG4gIFJlYWN0LnVzZUVmZmVjdChcbiAgICAoKSA9PiBiaW5kV2hlZWxab29tKFxuICAgICAgZWxlbWVudFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gc2NhbGVSZWYuY3VycmVudCxcbiAgICAgIHNldFNjYWxlLFxuICAgICAgKCkgPT4gbG9ja2VkUmVmLmN1cnJlbnQsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImV4cG9ydCBjb25zdCBDQU5WQVNfSU5ERVhfTUFSR0lOID0gMTZcblxuZnVuY3Rpb24gZmluaXRlKHZhbHVlLCBmYWxsYmFjayA9IDApIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24ocG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICBjb25zdCBjb250YWluZXJXaWR0aCA9IE1hdGgubWF4KDAsIGZpbml0ZShjb250YWluZXI/LndpZHRoKSlcbiAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSlcbiAgY29uc3QgaXRlbVdpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LndpZHRoKSlcbiAgY29uc3QgaXRlbUhlaWdodCA9IE1hdGgubWF4KDAsIGZpbml0ZShpdGVtPy5oZWlnaHQpKVxuICBjb25zdCBtYXhYID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJXaWR0aCAtIGl0ZW1XaWR0aCAtIG1hcmdpbilcbiAgY29uc3QgbWF4WSA9IE1hdGgubWF4KG1hcmdpbiwgY29udGFpbmVySGVpZ2h0IC0gaXRlbUhlaWdodCAtIG1hcmdpbilcbiAgcmV0dXJuIHtcbiAgICB4OiBNYXRoLm1pbihNYXRoLm1heChmaW5pdGUocG9zaXRpb24/LngsIG1hcmdpbiksIG1hcmdpbiksIG1heFgpLFxuICAgIHk6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueSwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICByZXR1cm4gY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKHtcbiAgICB4OiAoZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpIC0gZmluaXRlKGl0ZW0/LndpZHRoKSkgLyAyLFxuICAgIHk6IGZpbml0ZShjb250YWluZXI/LmhlaWdodCkgLSBmaW5pdGUoaXRlbT8uaGVpZ2h0KSAtIG1hcmdpbixcbiAgfSwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhnZXRFbGVtZW50cywgb25SZWFkeSwgc2NoZWR1bGVyKSB7XG4gIGxldCBhY3RpdmUgPSB0cnVlXG4gIGxldCBmcmFtZSA9IG51bGxcblxuICBjb25zdCBhdHRlbXB0ID0gKCkgPT4ge1xuICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICBjb25zdCBlbGVtZW50cyA9IGdldEVsZW1lbnRzKClcbiAgICBpZiAoIWVsZW1lbnRzPy5jb250YWluZXIgfHwgIWVsZW1lbnRzPy5pdGVtKSB7XG4gICAgICBmcmFtZSA9IHNjaGVkdWxlci5yZXF1ZXN0KGF0dGVtcHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZnJhbWUgPSBudWxsXG4gICAgb25SZWFkeShlbGVtZW50cylcbiAgfVxuXG4gIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGlmIChmcmFtZSAhPSBudWxsKSBzY2hlZHVsZXIuY2FuY2VsKGZyYW1lKVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7XG4gIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbixcbiAgZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24sXG4gIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzLFxufSBmcm9tICcuL2NhbnZhcy1pbmRleC5qcydcblxuY29uc3QgSU5ERVhfRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHsgd2lkdGg6IGVsZW1lbnQ/Lm9mZnNldFdpZHRoIHx8IDAsIGhlaWdodDogZWxlbWVudD8ub2Zmc2V0SGVpZ2h0IHx8IDAgfVxufVxuXG5mdW5jdGlvbiBDYW52YXNJbmRleCh7XG4gIGNhbnZhc1JlZixcbiAgcHJvamVjdCxcbiAgY3VycmVudFNjcmVlbklkLFxuICBkZW1vQXZhaWxhYmxlLFxuICBwb3NpdGlvbixcbiAgb25Qb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZSxcbiAgbmF2aWdhdGUsXG4gIGVudGVyRGVtbyxcbn0pIHtcbiAgY29uc3QgaW5kZXhSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IGNvbnN0cmFpbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0UG9zaXRpb24sIHVzZURlZmF1bHQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgY29uc3QgaW5kZXggPSBpbmRleFJlZi5jdXJyZW50XG4gICAgaWYgKCFjYW52YXMgfHwgIWluZGV4KSByZXR1cm4gbmV4dFBvc2l0aW9uXG4gICAgY29uc3QgY29udGFpbmVyID0geyB3aWR0aDogY2FudmFzLmNsaWVudFdpZHRoLCBoZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQgfVxuICAgIGNvbnN0IGl0ZW0gPSBlbGVtZW50U2l6ZShpbmRleClcbiAgICByZXR1cm4gdXNlRGVmYXVsdFxuICAgICAgPyBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbihjb250YWluZXIsIGl0ZW0pXG4gICAgICA6IGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihuZXh0UG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSlcbiAgfSwgW2NhbnZhc1JlZl0pXG5cbiAgLy8gcG9zaXRpb24gPT0gbnVsbCBcdTg4NjhcdTc5M0FcdTVDMUFcdTY3MkFcdTg0M0RcdTcwQjlcdUZGMDhcdTYyMTZcdTk4NzlcdTc2RUVcdTUyMDdcdTYzNjJcdTg4QUJcdTZFMDVcdTYzODlcdUZGMDlcdUZGMUJcdTVGQzVcdTk4N0JcdTUxOERcdThERDFcdTRFMDBcdTkwNERcdTVFMDNcdTVDNDBcdUZGMENcbiAgLy8gXHU1NDI2XHU1MjE5XHU0RjFBXHU0RTAwXHU3NkY0XHU1MzYxXHU1NzI4IHZpc2liaWxpdHk6aGlkZGVuXHUzMDAyXG4gIGNvbnN0IG5lZWRzRGVmYXVsdFBvc2l0aW9uID0gcG9zaXRpb24gPT0gbnVsbFxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4ge31cbiAgICBjb25zdCBzdG9wV2FpdGluZyA9IHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKFxuICAgICAgKCkgPT4gKHsgY29udGFpbmVyOiBjYW52YXNSZWYuY3VycmVudCwgaXRlbTogaW5kZXhSZWYuY3VycmVudCB9KSxcbiAgICAgICh7IGNvbnRhaW5lcjogY2FudmFzLCBpdGVtOiBpbmRleCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IG9uUG9zaXRpb25DaGFuZ2UoKGN1cnJlbnQpID0+IGNvbnN0cmFpbihjdXJyZW50LCBjdXJyZW50ID09IG51bGwpKVxuICAgICAgICB1cGRhdGUoKVxuXG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih1cGRhdGUpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShpbmRleClcbiAgICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgICAgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXF1ZXN0OiAoY2FsbGJhY2spID0+IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spLFxuICAgICAgICBjYW5jZWw6IChmcmFtZSkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKSxcbiAgICAgIH0sXG4gICAgKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0b3BXYWl0aW5nKClcbiAgICAgIGRpc2Nvbm5lY3RSZXNpemUoKVxuICAgIH1cbiAgfSwgW2NhbnZhc1JlZiwgY29uc3RyYWluLCBuZWVkc0RlZmF1bHRQb3NpdGlvbiwgb25Qb3NpdGlvbkNoYW5nZV0pXG5cbiAgY29uc3QgZmluaXNoRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0Lmhhc1BvaW50ZXJDYXB0dXJlPy4oZXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIH1cbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e2luZGV4UmVmfVxuICAgICAgY2xhc3NOYW1lPXtkcmFnZ2luZyA/ICd3Zi1jYW52YXMtaW5kZXggaXMtZHJhZ2dpbmcnIDogJ3dmLWNhbnZhcy1pbmRleCd9XG4gICAgICBzdHlsZT17cG9zaXRpb24gPyB7IGxlZnQ6IHBvc2l0aW9uLngsIHRvcDogcG9zaXRpb24ueSB9IDogeyB2aXNpYmlsaXR5OiAnaGlkZGVuJyB9fVxuICAgID5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1oYW5kbGVcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiXHU2MkQ2XHU1MkE4XHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgdGl0bGU9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvbiB8fCBjb25zdHJhaW4obnVsbCwgdHJ1ZSlcbiAgICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICAgIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH19XG4gICAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICAgICAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgICAgICAgY29uc3QgZGVsdGFYID0gZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYXG4gICAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZXG4gICAgICAgICAgaWYgKCFkcmFnLm1vdmVkICYmIE1hdGguaHlwb3QoZGVsdGFYLCBkZWx0YVkpIDwgSU5ERVhfRFJBR19USFJFU0hPTEQpIHJldHVyblxuICAgICAgICAgIGRyYWcubW92ZWQgPSB0cnVlXG4gICAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlKGNvbnN0cmFpbih7IHg6IGRyYWcub3JpZ2luLnggKyBkZWx0YVgsIHk6IGRyYWcub3JpZ2luLnkgKyBkZWx0YVkgfSkpXG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgIH19XG4gICAgICAgIG9uUG9pbnRlclVwPXtmaW5pc2hEcmFnfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2ZpbmlzaERyYWd9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1ncmlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PGkgLz48aSAvPjxpIC8+PC9zcGFuPlxuICAgICAgICA8c3Bhbj5cdTdEMjJcdTVGMTU8L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWxpc3RcIj5cbiAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtaW5kZXgtZG90IGlzLWFjdGl2ZScgOiAnd2YtY2FudmFzLWluZGV4LWRvdCd9XG4gICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgbmF2aWdhdGUoc2NyZWVuLmlkKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBlbnRlckRlbW8oc2NyZWVuLmlkKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2Ake2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzcGFuPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXAtdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXAtZmlsZVwiPnNyYy9zY3JlZW5zL3tzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1jbG9zZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTUxNzNcdTk1RURcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgb25DbG9zZSgpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAxNiAxNlwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxwYXRoIGQ9XCJtNCA0IDggOE0xMiA0bC04IDhcIiAvPjwvc3ZnPlxuICAgICAgPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayh0YXNrLCBzZXRFcnJvcikge1xuICBzZXRFcnJvcihudWxsKVxuICB0cnkge1xuICAgIGF3YWl0IHRhc2soKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcbiAgICBzZXRFcnJvcihgXHU1QkZDXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjFBJHttZXNzYWdlfWApXG4gIH1cbn1cblxuLyoqIGZpbGU6Ly8gXHU0RTBEXHU2NjJGIHNlY3VyZSBjb250ZXh0XHVGRjBDY2xpcGJvYXJkIEFQSSBcdTVFMzhcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENleGVjQ29tbWFuZCBcdTUxNUNcdTVFOTUgKi9cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkge1xuICAgIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICB9XG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc01vZGUoe1xuICBwcm9qZWN0LFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2VsZWN0ZWRJZHMsXG4gIHNldFNlbGVjdGVkSWRzLFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIG9uRXhwb3J0SWRzLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxuICBvbkNhbnZhc0NsaWNrLFxuICBjYW52YXNJbmRleFZpc2libGUgPSB0cnVlLFxuICBjYW52YXNJbmRleFBvc2l0aW9uLFxuICBvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2UsXG4gIG9uQ2xvc2VDYW52YXNJbmRleCxcbn0pIHtcbiAgY29uc3QgeyBjdXJyZW50U2NyZWVuSWQsIG5hdmlnYXRlLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIGVudGVyRGVtbzogZW50ZXJEZW1vTW9kZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NpZGViYXJDb2xsYXBzZWQsIHNldFNpZGViYXJDb2xsYXBzZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWRLZXksIHNldENvcGllZEtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbY29weVRvYXN0LCBzZXRDb3B5VG9hc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjYW52YXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY29waWVkVGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGRyYWdnaW5nUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBkcmFnZ2luZ1JlZi5jdXJyZW50ID0gZHJhZ2dpbmdcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IGN1cnJlbnQuc2NhbGUgfSkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcmFnZ2luZ1JlZi5jdXJyZW50KSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcHBseSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICAgIGlmICghY2FudmFzIHx8ICFzdGFnZSkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzY3JlZW5FbCA9IHN0YWdlLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhbnZhcy1zY3JlZW4taWQ9XCIke2N1cnJlbnRTY3JlZW5JZH1cIl1gKVxuICAgICAgaWYgKCFzY3JlZW5FbCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBjdXJyZW50U2NhbGUgPSBzY2FsZVJlZi5jdXJyZW50XG4gICAgICBpZiAoY3VycmVudFNjYWxlIDw9IDApIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc3RhZ2VCb3ggPSBzdGFnZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc2NyZWVuQm94ID0gc2NyZWVuRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IG5leHQgPSBmb2N1c0NhbnZhc1NjcmVlbih7XG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsXG4gICAgICAgIGNvbnRhaW5lckhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCxcbiAgICAgICAgc2NyZWVuTGVmdDogKHNjcmVlbkJveC5sZWZ0IC0gc3RhZ2VCb3gubGVmdCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlblRvcDogKHNjcmVlbkJveC50b3AgLSBzdGFnZUJveC50b3ApIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5XaWR0aDogc2NyZWVuQm94LndpZHRoIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5IZWlnaHQ6IHNjcmVlbkJveC5oZWlnaHQgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIGN1cnJlbnRTY2FsZSxcbiAgICAgIH0pXG4gICAgICBpZiAoIW5leHQpIHJldHVybiBmYWxzZVxuICAgICAgc2V0U2NhbGUobmV4dC5zY2FsZSlcbiAgICAgIHNldFZpZXcobmV4dClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KCkpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgYXBwbHkoKVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSlcbiAgfSwgW2N1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnRLZXksIHNldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIHVzZVdoZWVsWm9vbShjYW52YXNSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIC8vIFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVx1NjYyRlx1Njg0Nlx1NjdCNiBjaHJvbWVcdUZGMENcdTk1MDFcdTRFQTRcdTRFOTJcdTUzRUFcdTc5ODFcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdUZGMENcdTRFMERcdTYyQTJcdTdEMjJcdTVGMTVcdTcwQjlcdTUxRkIgLyBcdTYyRDZcdTYyRkRcbiAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3Q/LignLndmLWNhbnZhcy1pbmRleCcpKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBlbnRlckRlbW8gPSAoc2NyZWVuSWQpID0+IHtcbiAgICAvLyBcdTk1MDFcdTRFQTRcdTRFOTJcdTY1RjYgc3RhZ2UgXHU1REYyIHBvaW50ZXItZXZlbnRzOm5vbmVcdUZGMUJcdTdEMjJcdTVGMTVcdTRFQ0RcdTUzRUZcdTUzQ0NcdTUxRkJcdThGREJcdTZGMTRcdTc5M0FcbiAgICBpZiAoIWRlbW9BdmFpbGFibGUpIHJldHVyblxuICAgIGVudGVyRGVtb01vZGUoc2NyZWVuSWQpXG4gIH1cblxuICBjb25zdCBjb3B5TWV0YSA9IChrZXksIHRleHQsIGV2ZW50KSA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgY29weVRleHQodGV4dCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWRLZXkoa2V5KVxuICAgICAgc2V0Q29weVRvYXN0KCdcdTVERjJcdTU5MERcdTUyMzYnKVxuICAgICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgICAgIGNvcGllZFRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldENvcGllZEtleShudWxsKVxuICAgICAgICBzZXRDb3B5VG9hc3QobnVsbClcbiAgICAgIH0sIDEyMDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZVNlbGVjdGVkID0gKGlkKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVBbGwgPSAoKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50LnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGgpIHJldHVybiBuZXcgU2V0KClcbiAgICAgIHJldHVybiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zaGVsbFwiPlxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1zaWRlYmFyJHtzaWRlYmFyQ29sbGFwc2VkID8gJyBpcy1jb2xsYXBzZWQnIDogJyd9YH0gYXJpYS1oaWRkZW49e3NpZGViYXJDb2xsYXBzZWR9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItaGVhZGVyXCI+XG4gICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGggJiYgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA+IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0b2dnbGVBbGx9XG4gICAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgXHU1MTY4XHU5MDA5XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTY1MzZcdThENzdcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTY1MzZcdThENzdcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQodHJ1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk05IDN2MThcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwibTE2IDE1LTMtMyAzLTNcIiAvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWxpc3RcIj5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KCkgPT4gZW50ZXJEZW1vKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgIHRvZ2dsZVNlbGVjdGVkKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YFx1OTAwOVx1NjJFOSAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwc1wiIGFyaWEtbGFiZWw9XCJcdTY0Q0RcdTRGNUNcdTYzRDBcdTc5M0FcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkIgLyBcdTZFREFcdThGNkVcdTdGMjlcdTY1M0U8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU3QTdBXHU2ODNDXHU2MkQ2XHU2MkZEIC8gQ3RybCtcdTZFREFcdThGNkU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hc2lkZT5cbiAgICAgIHtzaWRlYmFyQ29sbGFwc2VkID8gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1leHBhbmRcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIHRpdGxlPVwiXHU1QzU1XHU1RjAwXHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaWRlYmFyQ29sbGFwc2VkKGZhbHNlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGUtaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgPHBhdGggZD1cIk05IDN2MThcIiAvPlxuICAgICAgICAgICAgPHBhdGggZD1cIm0xNCA5IDMgMy0zIDNcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPG1haW5cbiAgICAgICAgcmVmPXtjYW52YXNSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWNhbnZhcyR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgICBvbkNsaWNrPXtvbkNhbnZhc0NsaWNrfVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVGV4dCA9IGAke2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICBjb25zdCB0aXRsZUtleSA9IGAke3NjcmVlbi5pZH06dGl0bGVgXG4gICAgICAgICAgICBjb25zdCBmaWxlS2V5ID0gYCR7c2NyZWVuLmlkfTpmaWxlYFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLXNjcmVlbiBpcy1mb2N1c2VkJyA6ICd3Zi1jYW52YXMtc2NyZWVuJ31cbiAgICAgICAgICAgICAgICBkYXRhLWNhbnZhcy1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgbmF2aWdhdGUoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICBlbnRlckRlbW8oc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1tZXRhLXRpdGxlIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEodGl0bGVLZXksIHRpdGxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGl0bGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7c2NyZWVuLmRlc2NyaXB0aW9uID8gPGRpdj57c2NyZWVuLmRlc2NyaXB0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLW1ldGEtbGluZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YShmaWxlS2V5LCBmaWxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlx1NjU4N1x1NEVGNlx1RkYxQTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICB7ZmlsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgICAgICAgbW9kZT1cImNhbnZhc1wiXG4gICAgICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICBmb2N1c2VkPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgICAgIGV4cGFuZGVkPXtleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXsoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25FeHBvcnQ9eygpID0+IG9uRXhwb3J0SWRzKFtzY3JlZW4uaWRdKX1cbiAgICAgICAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2NhbnZhc0luZGV4VmlzaWJsZSA/IChcbiAgICAgICAgICA8Q2FudmFzSW5kZXhcbiAgICAgICAgICAgIGNhbnZhc1JlZj17Y2FudmFzUmVmfVxuICAgICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICAgIGN1cnJlbnRTY3JlZW5JZD17Y3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgZGVtb0F2YWlsYWJsZT17ZGVtb0F2YWlsYWJsZX1cbiAgICAgICAgICAgIHBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgICAgb25Qb3NpdGlvbkNoYW5nZT17b25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgb25DbG9zZT17b25DbG9zZUNhbnZhc0luZGV4fVxuICAgICAgICAgICAgbmF2aWdhdGU9e25hdmlnYXRlfVxuICAgICAgICAgICAgZW50ZXJEZW1vPXtlbnRlckRlbW99XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L21haW4+XG4gICAgICB7Y29weVRvYXN0ID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvYXN0XCIgcm9sZT1cInN0YXR1c1wiPntjb3B5VG9hc3R9PC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQge1xuICBmaXREZW1vU2NhbGUsXG4gIGlzRGVtb0JsYW5rRXhpdFRhcmdldCxcbiAgcGFuRnJvbURyYWdTbmFwc2hvdCxcbiAgcmVzZXRDYW52YXNWaWV3cG9ydCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuXG5jb25zdCBCTEFOS19FWElUX0hJTlQgPSAnXHU1M0NDXHU1MUZCXHU3QTdBXHU3NjdEXHU1OTA0XHU5MDAwXHU1MUZBXHU2RjE0XHU3OTNBJ1xuXG5mdW5jdGlvbiByZWFkQ29udGVudEJveChlbCkge1xuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBwYWRYID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodClcbiAgY29uc3QgcGFkWSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IE1hdGgubWF4KDAsIGVsLmNsaWVudFdpZHRoIC0gcGFkWCksXG4gICAgaGVpZ2h0OiBNYXRoLm1heCgwLCBlbC5jbGllbnRIZWlnaHQgLSBwYWRZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVtb01vZGUoe1xuICBwcm9qZWN0LFxuICBob3RzcG90c1Zpc2libGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICB2aWV3UmVzZXRLZXksXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbiAgb25DYW52YXNDbGljayxcbn0pIHtcbiAgY29uc3QgeyBjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgc2V0TW9kZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3Qgc2NyZWVuSW5kZXggPSBwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG4gIGNvbnN0IHNjcmVlbiA9IHNjcmVlbkluZGV4ID49IDAgPyBwcm9qZWN0LnNjcmVlbnNbc2NyZWVuSW5kZXhdIDogbnVsbFxuICBjb25zdCBjdXJyZW50RXhwYW5kZWQgPSAhIShzY3JlZW4gJiYgZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCkpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgdmlld3BvcnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBleGl0T25CbGFua0RvdWJsZUNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gICAgc2V0TW9kZSgnY2FudmFzJylcbiAgfVxuXG4gIC8vIHRpdGxlIFx1NjMwMlx1NTcyOFx1ODlDNlx1NTNFM1x1NEUwQVx1NEYxQVx1ODQzRFx1NTIzMFx1NUM0Rlx1NTE4NVx1NUI1MFx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Mlx1NjI3MFx1NjRDRFx1NEY1Q1x1RkYxQlx1NTNFQVx1NTcyOFx1N0E3QVx1NzY3RFx1NTkwNFx1NjBBQ1x1NTA1Q1x1NjVGNlx1NjMwMlx1NEUwQVx1MzAwMlxuICBjb25zdCBzeW5jQmxhbmtFeGl0SGludCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGVsID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGlmICghZWwpIHJldHVyblxuICAgIGNvbnN0IG5leHQgPSBpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSA/IEJMQU5LX0VYSVRfSElOVCA6ICcnXG4gICAgaWYgKChlbC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykgfHwgJycpID09PSBuZXh0KSByZXR1cm5cbiAgICBpZiAobmV4dCkgZWwuc2V0QXR0cmlidXRlKCd0aXRsZScsIG5leHQpXG4gICAgZWxzZSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGNsZWFyQmxhbmtFeGl0SGludCA9ICgpID0+IHtcbiAgICB2aWV3cG9ydFJlZi5jdXJyZW50Py5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGFwcGx5Rml0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCAhc3RhZ2UpIHJldHVyblxuICAgIGNvbnN0IGJveCA9IHJlYWRDb250ZW50Qm94KGNvbnRhaW5lcilcbiAgICBjb25zdCBuZXh0ID0gZml0RGVtb1NjYWxlKGJveC53aWR0aCwgYm94LmhlaWdodCwgc3RhZ2Uub2Zmc2V0V2lkdGgsIHN0YWdlLm9mZnNldEhlaWdodClcbiAgICBzZXRTY2FsZShuZXh0KVxuICAgIHNldFZpZXcoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBuZXh0IH0pXG4gIH0sIFtzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCB0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFwcGx5Rml0KClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gYXBwbHlGaXQoKSlcbiAgICBvYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lcilcbiAgICBpZiAoc3RhZ2UpIG9ic2VydmVyLm9ic2VydmUoc3RhZ2UpXG4gICAgYXBwbHlGaXQoKVxuICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgfSwgW2FwcGx5Rml0LCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIGN1cnJlbnRTY3JlZW5JZCwgdmlld1Jlc2V0S2V5LCBjdXJyZW50RXhwYW5kZWRdKVxuXG4gIHVzZVdoZWVsWm9vbSh2aWV3cG9ydFJlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWRlbW8gaXMtc2hvd2luZy1ob3RzcG90cycgOiAnd2YtZGVtbyd9PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e3ZpZXdwb3J0UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1kZW1vLXZpZXdwb3J0JHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uTW91c2VNb3ZlPXtzeW5jQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25Nb3VzZUxlYXZlPXtjbGVhckJsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uQ2xpY2s9e29uQ2FudmFzQ2xpY2t9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e2V4aXRPbkJsYW5rRG91YmxlQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWRlbW8tc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgIG1vZGU9XCJkZW1vXCJcbiAgICAgICAgICAgIGluZGV4PXtzY3JlZW5JbmRleH1cbiAgICAgICAgICAgIGV4cGFuZGVkPXtjdXJyZW50RXhwYW5kZWR9XG4gICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17c2NyZWVuICYmIG9uVG9nZ2xlRXhwYW5kID8gKCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1kZW1vLWhpbnRcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTUxODVcdTYzMDlcdTk0QUUgLyBcdTk0RkVcdTYzQTVcdThERjNcdThGNkNcdUZGMUJcdTUzRUZcdTU3MjhcdTVERTVcdTUxNzdcdTY4MEZcdTVGMDBcdTUxNzNcdTcwRURcdTUzM0FcdTlBRDhcdTRFQUVcdUZGMUJcdTY4MDdcdTk4OThcdTY4MEZcdTUzRUZcdTRFMzRcdTY1RjZcdTVDNTVcdTVGMDBcdTc3MEJcdTUxNjhcdThDOEM8L3A+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBleHBhbmRTY3JlZW5Db250ZW50LCBtZWFzdXJlQ29udGVudEJveCB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuXG5sZXQgZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxuXG5jb25zdCBsaWJyYXJpZXMgPSBbXG4gIHsgZmlsZTogJ2h0bWwyY2FudmFzLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93Lmh0bWwyY2FudmFzID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ2pzemlwLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LkpTWmlwID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ0ZpbGVTYXZlci5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5zYXZlQXMgPT09ICdmdW5jdGlvbicgfSxcbl1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdChmaWxlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtd2lyZWZyYW1lLWV4cG9ydD1cIiR7ZmlsZX1cIl1gKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPT09ICdsb2FkZWQnKSB7XG4gICAgICAgIGV4aXN0aW5nLnJlbW92ZSgpXG4gICAgICAgIGV4aXN0aW5nID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXNvbHZlLCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0LCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB2ZW5kb3JCYXNlID0gd2luZG93LldJUkVGUkFNRV9WRU5ET1JfQkFTRVxuICAgIGlmICghdmVuZG9yQmFzZSkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignXHU2NzJBXHU5MTREXHU3RjZFXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzXHU4REVGXHU1Rjg0IFdJUkVGUkFNRV9WRU5ET1JfQkFTRScpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgc2NyaXB0LnNyYyA9IG5ldyBVUkwoZmlsZSwgdmVuZG9yQmFzZSkuaHJlZlxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydCA9IGZpbGVcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkaW5nJ1xuICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkZWQnXG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQucmVtb3ZlKClcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1NTJBMFx1OEY3RFx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5MyAke2ZpbGV9YCkpXG4gICAgfVxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEV4cG9ydExpYnJhcmllcygpIHtcbiAgaWYgKCFleHBvcnRMaWJyYXJpZXNQcm9taXNlKSB7XG4gICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IGxpYnJhcmllcy5yZWR1Y2UoXG4gICAgICAoY2hhaW4sIGxpYnJhcnkpID0+IGNoYWluLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgYXdhaXQgbG9hZFNjcmlwdChsaWJyYXJ5LmZpbGUpXG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSB0aHJvdyBuZXcgRXJyb3IoYFx1NUJGQ1x1NTFGQVx1NUU5M1x1NTIxRFx1NTlDQlx1NTMxNlx1NTkzMVx1OEQyNTogJHtsaWJyYXJ5LmZpbGV9YClcbiAgICAgIH0pLFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKCksXG4gICAgKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSB1bmRlZmluZWRcbiAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbiAgfVxuICByZXR1cm4gZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVNjcmVlbihzY3JlZW5FbGVtZW50LCB2aWV3cG9ydCwgeyBleHBhbmRlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAoIXNjcmVlbkVsZW1lbnQpIHRocm93IG5ldyBFcnJvcignXHU2MjdFXHU0RTBEXHU1MjMwXHU4OTgxXHU1QkZDXHU1MUZBXHU3Njg0IHNjcmVlbiBcdTUxNDNcdTdEMjAnKVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcblxuICBjb25zdCBzYW5kYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc2FuZGJveC5jbGFzc05hbWUgPSAnd2YtZXhwb3J0LXNhbmRib3gnXG4gIGNvbnN0IGNsb25lID0gc2NyZWVuRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSlcbiAgc2FuZGJveC5hcHBlbmRDaGlsZChjbG9uZSlcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzYW5kYm94KVxuXG4gIGxldCB3aWR0aCA9IHZpZXdwb3J0LndpZHRoXG4gIGxldCBoZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHRcbiAgdHJ5IHtcbiAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgIGV4cGFuZFNjcmVlbkNvbnRlbnQoY2xvbmUpXG4gICAgICBjb25zdCBib3ggPSBtZWFzdXJlQ29udGVudEJveChjbG9uZSlcbiAgICAgIHdpZHRoID0gYm94LndpZHRoXG4gICAgICBoZWlnaHQgPSBib3guaGVpZ2h0XG4gICAgfVxuICAgIGNsb25lLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgY2xvbmUuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICAgIHNhbmRib3guc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBzYW5kYm94LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcblxuICAgIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHdpbmRvdy5odG1sMmNhbnZhcyhjbG9uZSwge1xuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHNjYWxlOiAyLFxuICAgICAgdXNlQ09SUzogZmFsc2UsXG4gICAgICBsb2dnaW5nOiBmYWxzZSxcbiAgICB9KVxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjYW52YXMudG9CbG9iKFxuICAgICAgICAoYmxvYikgPT4gYmxvYiA/IHJlc29sdmUoYmxvYikgOiByZWplY3QobmV3IEVycm9yKCdQTkcgXHU3RjE2XHU3ODAxXHU1OTMxXHU4RDI1JykpLFxuICAgICAgICAnaW1hZ2UvcG5nJyxcbiAgICAgIClcbiAgICB9KVxuICB9IGZpbmFsbHkge1xuICAgIHNhbmRib3gucmVtb3ZlKClcbiAgfVxufVxuXG5mdW5jdGlvbiBzbHVnKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUgfHwgJ3dpcmVmcmFtZScpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tfC0kL2csICcnKSB8fCAnd2lyZWZyYW1lJ1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U2VsZWN0ZWQoc2NyZWVucykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVucykgfHwgc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1ODFGM1x1NUMxMVx1OTAwOVx1NjJFOVx1NEUwMFx1NEUyQSBzY3JlZW4nKVxuICB9XG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuICBjb25zdCBjYXB0dXJlZCA9IFtdXG4gIGZvciAoY29uc3Qgc2NyZWVuIG9mIHNjcmVlbnMpIHtcbiAgICBjYXB0dXJlZC5wdXNoKHtcbiAgICAgIG5hbWU6IGAke3NsdWcoc2NyZWVuLmlkKX0ucG5nYCxcbiAgICAgIGJsb2I6IGF3YWl0IGNhcHR1cmVTY3JlZW4oc2NyZWVuLmVsZW1lbnQsIHNjcmVlbi52aWV3cG9ydCwge1xuICAgICAgICBleHBhbmRlZDogISFzY3JlZW4uZXhwYW5kZWQsXG4gICAgICB9KSxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGNhcHR1cmVkLmxlbmd0aCA9PT0gMSkge1xuICAgIHdpbmRvdy5zYXZlQXMoY2FwdHVyZWRbMF0uYmxvYiwgY2FwdHVyZWRbMF0ubmFtZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHppcCA9IG5ldyB3aW5kb3cuSlNaaXAoKVxuICBjYXB0dXJlZC5mb3JFYWNoKChpdGVtKSA9PiB6aXAuZmlsZShpdGVtLm5hbWUsIGl0ZW0uYmxvYikpXG4gIGNvbnN0IGJsb2IgPSBhd2FpdCB6aXAuZ2VuZXJhdGVBc3luYyh7IHR5cGU6ICdibG9iJyB9KVxuICB3aW5kb3cuc2F2ZUFzKGJsb2IsIGAke3NsdWcoc2NyZWVuc1swXS5wcm9qZWN0TmFtZSl9LnppcGApXG59XG4iLCAiaW1wb3J0IHsgYnVpbGRSZXZpZXdQcm9tcHQsIHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdQYW5lbCh7XG4gIHByb2plY3QsXG4gIHZpc2libGUgPSB0cnVlLFxuICBzZWxlY3Rpb25zLFxuICBtdWx0aVNlbGVjdCxcbiAgaXRlbXMsXG4gIG9uVG9nZ2xlTXVsdGlTZWxlY3QsXG4gIG9uU2VsZWN0RWxlbWVudCxcbiAgb25Ib3ZlckVsZW1lbnQsXG4gIG9uUmVtb3ZlU2VsZWN0aW9uLFxuICBvbkNsZWFyU2VsZWN0aW9uLFxuICBvbkFkZEl0ZW0sXG4gIG9uUmVtb3ZlSXRlbSxcbiAgb25DbG9zZSxcbn0pIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxlY3Rpb25zW3NlbGVjdGlvbnMubGVuZ3RoIC0gMV0gfHwgbnVsbFxuICBjb25zdCBnZW5lcmF0ZWRQcm9tcHQgPSBSZWFjdC51c2VNZW1vKCgpID0+IGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSwgW3Byb2plY3QsIGl0ZW1zXSlcbiAgY29uc3QgW3R5cGUsIHNldFR5cGVdID0gUmVhY3QudXNlU3RhdGUoJ2NvbW1lbnQnKVxuICBjb25zdCBbaW5zdHJ1Y3Rpb24sIHNldEluc3RydWN0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuICBjb25zdCBbcHJvbXB0LCBzZXRQcm9tcHRdID0gUmVhY3QudXNlU3RhdGUoZ2VuZXJhdGVkUHJvbXB0KVxuICBjb25zdCBbcHJvbXB0RGlydHksIHNldFByb21wdERpcnR5XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGNvcHlUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFwcm9tcHREaXJ0eSkgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgfSwgW2dlbmVyYXRlZFByb21wdCwgcHJvbXB0RGlydHldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICBjb25zdCBhZGRJdGVtID0gKCkgPT4ge1xuICAgIGlmIChzZWxlY3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGluc3RydWN0aW9uLnRyaW0oKVxuICAgIGlmICghbm9ybWFsaXplZCAmJiB0eXBlICE9PSAncmVtb3ZlJykgcmV0dXJuXG4gICAgb25BZGRJdGVtKHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXRzOiBzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uKSA9PiAoe1xuICAgICAgICBzY3JlZW5JZDogc2VsZWN0aW9uLnNjcmVlbklkLFxuICAgICAgICBzY3JlZW5UaXRsZTogc2VsZWN0aW9uLnNjcmVlblRpdGxlLFxuICAgICAgICBzb3VyY2VIaW50OiBzZWxlY3Rpb24uc291cmNlSGludCxcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdGlvbi5zZWxlY3RvcixcbiAgICAgICAgY3VycmVudFRleHQ6IHNlbGVjdGlvbi5jdXJyZW50VGV4dCxcbiAgICAgIH0pKSxcbiAgICAgIGluc3RydWN0aW9uOiBub3JtYWxpemVkLFxuICAgIH0pXG4gICAgc2V0SW5zdHJ1Y3Rpb24oJycpXG4gIH1cblxuICBjb25zdCByZWdlbmVyYXRlID0gKCkgPT4ge1xuICAgIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gICAgc2V0UHJvbXB0RGlydHkoZmFsc2UpXG4gIH1cblxuICBjb25zdCBjb3B5UHJvbXB0ID0gKCkgPT4ge1xuICAgIGNvcHlUZXh0KHByb21wdCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgICAgIGNvcHlUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTQwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgaW5zdHJ1Y3Rpb25MYWJlbCA9IHR5cGUgPT09ICd0ZXh0J1xuICAgID8gJ1x1NjVCMFx1NjU4N1x1NUI1NydcbiAgICA6IHR5cGUgPT09ICdvcmRlcidcbiAgICAgID8gJ1x1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0MidcbiAgICAgIDogdHlwZSA9PT0gJ3JlbW92ZSdcbiAgICAgICAgPyAnXHU1MjIwXHU5NjY0XHU4QkY0XHU2NjBFXHVGRjA4XHU1M0VGXHU5MDA5XHVGRjA5J1xuICAgICAgICA6ICdcdTdFRDkgQUkgXHU3Njg0XHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJ1xuXG4gIHJldHVybiAoXG4gICAgPGFzaWRlIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbFwiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEJcIiBoaWRkZW49eyF2aXNpYmxlfT5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtdGl0bGVcIj5cdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEI8L3N0cm9uZz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtY291bnRcIj57aXRlbXMubGVuZ3RofSBcdTY3NjFcdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1ib2R5XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhlYWRpbmdcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU1REYyXHU5MDA5XHU4MjgyXHU3MEI5ICh7c2VsZWN0aW9ucy5sZW5ndGh9KTwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tYWN0aW9uc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttdWx0aVNlbGVjdCA/ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0IGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCd9XG4gICAgICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXttdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblRvZ2dsZU11bHRpU2VsZWN0fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1OTFBXHU5MDA5IHttdWx0aVNlbGVjdCA/ICdPTicgOiAnT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xlYXItc2VsZWN0aW9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e29uQ2xlYXJTZWxlY3Rpb259Plx1NkUwNVx1N0E3QTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGludFwiPlx1NTkxQVx1OTAwOVx1NUYwMFx1NTQyRlx1NTQwRVx1NzBCOVx1NTFGQlx1ODI4Mlx1NzBCOVx1NTNFRlx1NTJBMFx1NTE2NVx1NjIxNlx1NzlGQlx1OTY2NFx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0RiBTaGlmdCAvIENvbW1hbmQgLyBDdHJsIFx1NzBCOVx1NTFGQlx1MzAwMjwvcD5cbiAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb25zXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9e3NlbGVjdGlvbiA9PT0gc2VsZWN0ZWQgPyAnd2YtcmV2aWV3LXNlbGVjdGlvbiBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1zZWxlY3Rpb24nfSBrZXk9e2Ake3NlbGVjdGlvbi5zY3JlZW5JZH06JHtzZWxlY3Rpb24uc2VsZWN0b3J9YH0+XG4gICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXNlbGVjdG9yXCI+e2luZGV4ICsgMX0uIHtzZWxlY3Rpb24uc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXJlbW92ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZVNlbGVjdGlvbihzZWxlY3Rpb24uZWxlbWVudCl9Plx1NzlGQlx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zY3JlZW4tbmFtZVwiPntzZWxlY3RlZC5zY3JlZW5UaXRsZX0gXHUwMEI3IHtzZWxlY3RlZC5zY3JlZW5JZH08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYnNcIiBhcmlhLWxhYmVsPVwiXHU4MjgyXHU3MEI5XHU1QzQyXHU3RUE3XCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkLmFuY2VzdG9ycy5tYXAoKGFuY2VzdG9yLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YW5jZXN0b3Iuc2VsZWN0b3J9PlxuICAgICAgICAgICAgICAgICAgICB7aW5kZXggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iLXNlcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYlwiXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2FuY2VzdG9yLnNlbGVjdG9yfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IG9uSG92ZXJFbGVtZW50Py4obnVsbCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZWxlY3RFbGVtZW50KGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2FuY2VzdG9yLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0b3JcIj57c2VsZWN0ZWQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICB7c2VsZWN0ZWQuY3VycmVudFRleHQgPyAoXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWN1cnJlbnQtdGV4dFwiPlx1NUY1M1x1NTI0RFx1RkYxQXtzZWxlY3RlZC5jdXJyZW50VGV4dH08L3A+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+XHU0RkVFXHU2NTM5XHU3QzdCXHU1NzhCPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtc2VsZWN0XCIgdmFsdWU9e3R5cGV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFR5cGUoZXZlbnQudGFyZ2V0LnZhbHVlKX0+XG4gICAgICAgICAgICAgICAgICB7T2JqZWN0LmVudHJpZXMoUkVWSUVXX1RZUEVfTEFCRUxTKS5tYXAoKFt2YWx1ZSwgbGFiZWxdKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtb3B0aW9uXCIgdmFsdWU9e3ZhbHVlfSBrZXk9e3ZhbHVlfT57bGFiZWx9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPntpbnN0cnVjdGlvbkxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1pbnN0cnVjdGlvblwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17aW5zdHJ1Y3Rpb259XG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dHlwZSA9PT0gJ29yZGVyJyA/ICdcdTRGOEJcdTU5ODJcdUZGMUFcdTc5RkJcdTUyQThcdTUyMzBcdThCQTJcdTUzNTVcdTY0NThcdTg5ODFcdTRFNEJcdTU0MEUnIDogJ1x1NjNDRlx1OEZGMFx1NUUwQ1x1NjcxQiBBSSBcdTU5ODJcdTRGNTVcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0SW5zdHJ1Y3Rpb24oZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWFkZFwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFpbnN0cnVjdGlvbi50cmltKCkgJiYgdHlwZSAhPT0gJ3JlbW92ZSd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17YWRkSXRlbX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTJBMFx1NTE2NVx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NVx1RkYwOHtzZWxlY3Rpb25zLmxlbmd0aH0gXHU0RTJBXHU4MjgyXHU3MEI5XHVGRjA5XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NEUyRFx1NzY4NFx1ODI4Mlx1NzBCOVx1NUYwMFx1NTlDQlx1NEZFRVx1NjUzOVx1MzAwMlx1NzBCOVx1NTFGQlx1OTc2Mlx1NTMwNVx1NUM1MVx1NTNFRlx1NTIwN1x1NjM2Mlx1NTIzMFx1NzIzNlx1N0VBN1x1N0VDNFx1NEVGNlx1MzAwMjwvcD5cbiAgICAgICAgICApfVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NTwvaDI+XG4gICAgICAgICAge2l0ZW1zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1zXCI+XG4gICAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtXCIga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXRpdGxlXCI+e2luZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbaXRlbS50eXBlXX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tc2VsZWN0b3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhpdGVtKS5tYXAoKHRhcmdldCkgPT4gdGFyZ2V0LnNlbGVjdG9yKS5qb2luKCdcdTMwMDEnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1pbnN0cnVjdGlvblwiPntpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1kZWxldGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVJdGVtKGl0ZW0uaWQpfT5cdTUyMjBcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1OEZEOFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMjwvcD59XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbiB3Zi1yZXZpZXctcHJvbXB0LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NjcwMFx1N0VDOCBQcm9tcHQ8L2gyPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcmVnZW5lcmF0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtyZWdlbmVyYXRlfT5cdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7cHJvbXB0RGlydHkgPyA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFudWFsXCI+UHJvbXB0IFx1NURGMlx1NjI0Qlx1NTJBOFx1NEZFRVx1NjUzOVx1RkYxQlx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMFx1NEYxQVx1ODk4Nlx1NzZENlx1NjI0Qlx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMjwvcD4gOiBudWxsfVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXByb21wdFwiXG4gICAgICAgICAgICB2YWx1ZT17cHJvbXB0fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRQcm9tcHQoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgICBzZXRQcm9tcHREaXJ0eSh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jb3B5XCIgb25DbGljaz17Y29weVByb21wdH0+XG4gICAgICAgICAgICB7Y29waWVkID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU1OTBEXHU1MjM2IFByb21wdCd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvYXNpZGU+XG4gIClcbn1cbiIsICJpbXBvcnQgeyByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gc2FtZVBvc2l0aW9ucyhsZWZ0LCByaWdodCkge1xuICBpZiAobGVmdC5sZW5ndGggIT09IHJpZ2h0Lmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBsZWZ0LmV2ZXJ5KChpdGVtLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG90aGVyID0gcmlnaHRbaW5kZXhdXG4gICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBvdGhlci5rZXlcbiAgICAgICYmIGl0ZW0uaXRlbSA9PT0gb3RoZXIuaXRlbVxuICAgICAgJiYgaXRlbS5pdGVtSW5kZXggPT09IG90aGVyLml0ZW1JbmRleFxuICAgICAgJiYgaXRlbS5sZWZ0ID09PSBvdGhlci5sZWZ0XG4gICAgICAmJiBpdGVtLnRvcCA9PT0gb3RoZXIudG9wXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdFJlY3QocmVjdCwgY2xpcCkge1xuICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBjbGlwLmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4ocmVjdC5yaWdodCwgY2xpcC5yaWdodClcbiAgY29uc3QgdG9wID0gTWF0aC5tYXgocmVjdC50b3AsIGNsaXAudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihyZWN0LmJvdHRvbSwgY2xpcC5ib3R0b20pXG4gIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHJldHVybiBudWxsXG4gIHJldHVybiB7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQb3NpdGlvbnMoYm9hcmQsIGl0ZW1zKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBbXVxuICBjb25zdCBib2FyZFJlY3QgPSBib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBjb25zdCBwb3NpdGlvbnMgPSBbXVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIHJldmlld1RhcmdldHMoaXRlbSkuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgbGV0IGVsZW1lbnQgPSBudWxsXG4gICAgICB0cnkge1xuICAgICAgICBlbGVtZW50ID0gYm9hcmQucXVlcnlTZWxlY3Rvcih0YXJnZXQuc2VsZWN0b3IpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQ/LmlzQ29ubmVjdGVkKSByZXR1cm5cbiAgICAgIGNvbnN0IHNjcmVlbkNvbnRlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY29udGVudCcpXG4gICAgICBpZiAoIXNjcmVlbkNvbnRlbnQpIHJldHVyblxuICAgICAgY29uc3QgdmlzaWJsZSA9IGludGVyc2VjdFJlY3QoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgc2NyZWVuQ29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSlcbiAgICAgIGlmICghdmlzaWJsZSkgcmV0dXJuXG4gICAgICBjb25zdCBiYXNlTGVmdCA9IE1hdGgucm91bmQodmlzaWJsZS5yaWdodCAtIGJvYXJkUmVjdC5sZWZ0KVxuICAgICAgY29uc3QgYmFzZVRvcCA9IE1hdGgucm91bmQodmlzaWJsZS50b3AgLSBib2FyZFJlY3QudG9wKVxuICAgICAgY29uc3Qgb3ZlcmxhcENvdW50ID0gcG9zaXRpb25zLmZpbHRlcihcbiAgICAgICAgKHBvc2l0aW9uKSA9PiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlTGVmdCAtIGJhc2VMZWZ0KSA8IDIgJiYgTWF0aC5hYnMocG9zaXRpb24uYmFzZVRvcCAtIGJhc2VUb3ApIDwgMixcbiAgICAgICkubGVuZ3RoXG4gICAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICAgIGtleTogYCR7aXRlbS5pZH06JHt0YXJnZXRJbmRleH1gLFxuICAgICAgICBpdGVtLFxuICAgICAgICBpdGVtSW5kZXgsXG4gICAgICAgIHRhcmdldEluZGV4LFxuICAgICAgICBiYXNlTGVmdCxcbiAgICAgICAgYmFzZVRvcCxcbiAgICAgICAgbGVmdDogYmFzZUxlZnQgKyBvdmVybGFwQ291bnQgKiAxNSxcbiAgICAgICAgdG9wOiBiYXNlVG9wLFxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBwb3NpdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld01hcmtlcnMoeyBib2FyZFJlZiwgaXRlbXMsIG9uT3BlblBhbmVsIH0pIHtcbiAgY29uc3QgW3Bvc2l0aW9ucywgc2V0UG9zaXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbYWN0aXZlS2V5LCBzZXRBY3RpdmVLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZnJhbWVSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCByZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSByZXNvbHZlUG9zaXRpb25zKGJvYXJkUmVmLmN1cnJlbnQsIGl0ZW1zKVxuICAgIHNldFBvc2l0aW9ucygoY3VycmVudCkgPT4gc2FtZVBvc2l0aW9ucyhjdXJyZW50LCBuZXh0KSA/IGN1cnJlbnQgOiBuZXh0KVxuICB9LCBbYm9hcmRSZWYsIGl0ZW1zXSlcblxuICBjb25zdCBzY2hlZHVsZVJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIGZyYW1lUmVmLmN1cnJlbnQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGZyYW1lUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICByZWZyZXNoKClcbiAgICB9KVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KHNjaGVkdWxlUmVmcmVzaClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbc2NoZWR1bGVSZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmVLZXkgJiYgIXBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpKSBzZXRBY3RpdmVLZXkobnVsbClcbiAgfSwgW2FjdGl2ZUtleSwgcG9zaXRpb25zXSlcblxuICBjb25zdCBhY3RpdmUgPSBwb3NpdGlvbnMuZmluZCgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KVxuICBjb25zdCBib2FyZFdpZHRoID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50V2lkdGggfHwgMFxuICBjb25zdCBib2FyZEhlaWdodCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudEhlaWdodCB8fCAwXG4gIGNvbnN0IGJ1YmJsZUxlZnQgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLmxlZnQgKyAxNiwgYm9hcmRXaWR0aCAtIDMzNikpIDogMFxuICBjb25zdCBidWJibGVUb3AgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLnRvcCArIDI0LCBib2FyZEhlaWdodCAtIDE4MCkpIDogMFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbikgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICd3Zi1yZXZpZXctbWFya2VyIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW1hcmtlcid9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XHVGRjFBJHtSRVZJRVdfVFlQRV9MQUJFTFNbcG9zaXRpb24uaXRlbS50eXBlXX1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICAgIHthY3RpdmUgPyAoXG4gICAgICAgIDxhc2lkZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7YWN0aXZlLml0ZW1JbmRleCArIDF9YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGl0bGVcIj5cbiAgICAgICAgICAgICAge2FjdGl2ZS5pdGVtSW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1thY3RpdmUuaXRlbS50eXBlXX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaW5zdHJ1Y3Rpb25cIj5cbiAgICAgICAgICAgIHthY3RpdmUuaXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGFyZ2V0c1wiPlxuICAgICAgICAgICAge3Jldmlld1RhcmdldHMoYWN0aXZlLml0ZW0pLm1hcCgodGFyZ2V0KSA9PiAoXG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1zZWxlY3RvclwiIGtleT17dGFyZ2V0LnNlbGVjdG9yfT57dGFyZ2V0LnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1tb3JlXCJcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3RpdmVLZXkobnVsbClcbiAgICAgICAgICAgICAgb25PcGVuUGFuZWw/LigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1NjdFNVx1NzcwQlx1NjZGNFx1NTkxQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJjb25zdCBMQVVOQ0hFUl9TSVpFID0gNDhcbmNvbnN0IExBVU5DSEVSX01BUkdJTiA9IDIwXG5jb25zdCBEUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgTWF0aC5tYXgobWluLCBtYXgpKVxufVxuXG5mdW5jdGlvbiBjbGFtcFBvc2l0aW9uKGJvYXJkLCBwb3NpdGlvbikge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gcG9zaXRpb25cbiAgcmV0dXJuIHtcbiAgICB4OiBjbGFtcChwb3NpdGlvbi54LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gICAgeTogY2xhbXAocG9zaXRpb24ueSwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0UG9zaXRpb24oYm9hcmQpIHtcbiAgcmV0dXJuIGNsYW1wUG9zaXRpb24oYm9hcmQsIHtcbiAgICB4OiBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gICAgeTogYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWU/LngpICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueSkpIHJldHVybiB2YWx1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBsb2NhbFN0b3JhZ2UgbWF5IGJlIHVuYXZhaWxhYmxlIGZvciBhIGRpcmVjdGx5IG9wZW5lZCBsb2NhbCBmaWxlLlxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvbikge1xuICB0cnkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwb3NpdGlvbikpXG4gIH0gY2F0Y2gge1xuICAgIC8vIEtlZXBpbmcgdGhlIGxhdW5jaGVyIGRyYWdnYWJsZSBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHBlcnNpc3RlbmNlLlxuICB9XG59XG5cbmZ1bmN0aW9uIENvbW1lbnRJY29uKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTUgNC41aDE0YTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAyaC02bC00LjUgM3YtM0g1YTIgMiAwIDAgMS0yLTJ2LThhMiAyIDAgMCAxIDItMlpcIiAvPlxuICAgICAgPHBhdGggZD1cIk03LjUgMTAuNWg5XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TGF1bmNoZXIoeyBib2FyZFJlZiwgY291bnQsIHByb2plY3ROYW1lLCBvbk9wZW4gfSkge1xuICBjb25zdCBzdG9yYWdlS2V5ID0gYHdmLXJldmlldy1sYXVuY2hlci1wb3NpdGlvbjoke3Byb2plY3ROYW1lfWBcbiAgY29uc3QgW3Bvc2l0aW9uLCBzZXRQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvc2l0aW9uUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN1cHByZXNzQ2xpY2tSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG5cbiAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSBSZWFjdC51c2VDYWxsYmFjaygobmV4dCkgPT4ge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQsIG5leHQpXG4gICAgcG9zaXRpb25SZWYuY3VycmVudCA9IGNsYW1wZWRcbiAgICBzZXRQb3NpdGlvbihjbGFtcGVkKVxuICAgIHJldHVybiBjbGFtcGVkXG4gIH0sIFtib2FyZFJlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBib2FyZCA9IGJvYXJkUmVmLmN1cnJlbnRcbiAgICBpZiAoIWJvYXJkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgdXBkYXRlUG9zaXRpb24ocmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG5cbiAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gdXBkYXRlUG9zaXRpb24ocG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuICAgICAgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIG5leHQpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gIH0sIFtib2FyZFJlZiwgc3RvcmFnZUtleSwgdXBkYXRlUG9zaXRpb25dKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGRyYWcubW92ZWRcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKHBvc2l0aW9uUmVmLmN1cnJlbnQpIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvblJlZi5jdXJyZW50KVxuICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0Lmhhc1BvaW50ZXJDYXB0dXJlPy4oZXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLXJldmlldy1sYXVuY2hlciBpcy1kcmFnZ2luZycgOiAnd2YtcmV2aWV3LWxhdW5jaGVyJ31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHJpZ2h0OiBMQVVOQ0hFUl9NQVJHSU4sIGJvdHRvbTogTEFVTkNIRVJfTUFSR0lOIH19XG4gICAgICBhcmlhLWxhYmVsPXtgXHU1QzU1XHU1RjAwXHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjBDXHU1MTcxICR7Y291bnR9IFx1Njc2MVx1NEZFRVx1NjUzOWB9XG4gICAgICBkYXRhLXRvb2x0aXA9XCJcdTVDNTVcdTVGMDBcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50KVxuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgY29uc3QgZGVsdGFYID0gZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBEUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgIGRyYWcubW92ZWQgPSB0cnVlXG4gICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXtmaW5pc2hEcmFnfVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBpZiAoc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBvbk9wZW4oKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Q29tbWVudEljb24gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb3VudH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cbiIsICJleHBvcnQgY29uc3QgVU5TQVZFRF9SRVZJRVdfTUVTU0FHRSA9ICdcdTRGRUVcdTY1MzlcdTUxODVcdTVCQjlcdTVDMUFcdTY3MkFcdTRGRERcdTVCNThcdUZGMENcdTc5QkJcdTVGMDBcdTk4NzVcdTk3NjJcdTU0MEVcdTRGMUFcdTRFMjJcdTU5MzFcdTMwMDJcdTY2MkZcdTU0MjZcdTdFRTdcdTdFRURcdUZGMUYnXG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBldmVudC5yZXR1cm5WYWx1ZSA9IFVOU0FWRURfUkVWSUVXX01FU1NBR0VcbiAgcmV0dXJuIFVOU0FWRURfUkVWSUVXX01FU1NBR0Vcbn1cbiIsICJjb25zdCBTSE9SVENVVF9ERUZJTklUSU9OUyA9IFtcbiAgeyBpZDogJ2NhbnZhcycsIHN1ZmZpeDogJzEnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2RlbW8nLCBzdWZmaXg6ICcyJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdpbnRlcmFjdGlvbicsIHN1ZmZpeDogJ0knLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTNFRlx1NEVBNFx1NEU5MiAvIFx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5MicgfSxcbiAgeyBpZDogJ3JldmlldycsIHN1ZmZpeDogJ00nLCBsYWJlbDogJ1x1NUYwMFx1NTQyRlx1NjIxNlx1NTE3M1x1OTVFRFx1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ltbWVyc2l2ZScsIHN1ZmZpeDogJzMnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2Jyb3dzZXItZnVsbHNjcmVlbicsIHN1ZmZpeDogJ1NoaWZ0K0YnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RicgfSxcbiAgeyBpZDogJ2hvdHNwb3RzJywgc3VmZml4OiAnSCcsIGxhYmVsOiAnXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBJyB9LFxuICB7IGlkOiAnc3BhY2UnLCBrZXlzOiAnU3BhY2UnLCBsYWJlbDogJ1x1NjMwOVx1NEY0Rlx1NEUzNFx1NjVGNlx1NjJENlx1NTJBOFx1NzUzQlx1NUUwMycgfSxcbiAgeyBpZDogJ2VzY2FwZScsIGtleXM6ICdFc2MnLCBsYWJlbDogJ1x1NTE3M1x1OTVFRFx1NUY1M1x1NTI0RFx1OTc2Mlx1Njc3Rlx1NjIxNlx1OTAwMFx1NTFGQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2hlbHAnLCBrZXlzOiAnPycsIGxhYmVsOiAnXHU2MjUzXHU1RjAwXHU2MjE2XHU1MTczXHU5NUVEXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gaXNNYWNQbGF0Zm9ybSgpIHtcbiAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIC9NYWN8aVBob25lfGlQYWR8aVBvZC9pLnRlc3QoYCR7bmF2aWdhdG9yLnBsYXRmb3JtIHx8ICcnfSAke25hdmlnYXRvci51c2VyQWdlbnQgfHwgJyd9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0Y3V0TW9kaWZpZXJMYWJlbChpc01hYyA9IGlzTWFjUGxhdGZvcm0oKSkge1xuICByZXR1cm4gaXNNYWMgPyAnQ3RybCcgOiAnQWx0J1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9hcmRTaG9ydGN1dHMoaXNNYWMgPSBpc01hY1BsYXRmb3JtKCkpIHtcbiAgY29uc3QgbW9kaWZpZXIgPSBzaG9ydGN1dE1vZGlmaWVyTGFiZWwoaXNNYWMpXG4gIHJldHVybiBTSE9SVENVVF9ERUZJTklUSU9OUy5tYXAoKHNob3J0Y3V0KSA9PiBzaG9ydGN1dC5rZXlzXG4gICAgPyBzaG9ydGN1dFxuICAgIDogeyAuLi5zaG9ydGN1dCwga2V5czogYCR7bW9kaWZpZXJ9KyR7c2hvcnRjdXQuc3VmZml4fWAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IEJPQVJEX1NIT1JUQ1VUUyA9IGdldEJvYXJkU2hvcnRjdXRzKClcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQpIHJldHVybiBmYWxzZVxuICBjb25zdCBlbGVtZW50ID0gdGFyZ2V0Lm5vZGVUeXBlID09PSAzID8gdGFyZ2V0LnBhcmVudEVsZW1lbnQgOiB0YXJnZXRcbiAgaWYgKCFlbGVtZW50KSByZXR1cm4gZmFsc2VcbiAgY29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lXG4gIGlmICh0YWcgPT09ICdJTlBVVCcgfHwgdGFnID09PSAnVEVYVEFSRUEnIHx8IHRhZyA9PT0gJ1NFTEVDVCcpIHJldHVybiB0cnVlXG4gIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gISFlbGVtZW50LmNsb3Nlc3Q/LignW2NvbnRlbnRlZGl0YWJsZV06bm90KFtjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiXSknKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvcnRjdXRJZEZvckV2ZW50KGV2ZW50LCBpc01hYyA9IGlzTWFjUGxhdGZvcm0oKSkge1xuICBpZiAoIWV2ZW50IHx8IGV2ZW50LnJlcGVhdCkgcmV0dXJuIG51bGxcbiAgY29uc3Qga2V5ID0gU3RyaW5nKGV2ZW50LmtleSB8fCAnJykudG9Mb3dlckNhc2UoKVxuICBjb25zdCBtb2RpZmllciA9IGlzTWFjID8gZXZlbnQuY3RybEtleSA6IGV2ZW50LmFsdEtleVxuXG4gIGlmICghbW9kaWZpZXIpIHtcbiAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGtleSA9PT0gJ2VzY2FwZScpIHJldHVybiAnZXNjYXBlJ1xuICAgIGlmIChldmVudC5rZXkgPT09ICc/JykgcmV0dXJuICdoZWxwJ1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAoZXZlbnQuc2hpZnRLZXkpIHJldHVybiBrZXkgPT09ICdmJyA/ICdicm93c2VyLWZ1bGxzY3JlZW4nIDogbnVsbFxuICBpZiAoa2V5ID09PSAnMScpIHJldHVybiAnY2FudmFzJ1xuICBpZiAoa2V5ID09PSAnMicpIHJldHVybiAnZGVtbydcbiAgaWYgKGtleSA9PT0gJ2knKSByZXR1cm4gJ2ludGVyYWN0aW9uJ1xuICBpZiAoa2V5ID09PSAnbScpIHJldHVybiAncmV2aWV3J1xuICBpZiAoa2V5ID09PSAnMycpIHJldHVybiAnaW1tZXJzaXZlJ1xuICBpZiAoa2V5ID09PSAnaCcpIHJldHVybiAnaG90c3BvdHMnXG4gIHJldHVybiBudWxsXG59XG4iLCAiaW1wb3J0IHsgZ2V0Qm9hcmRTaG9ydGN1dHMgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuZnVuY3Rpb24gUGFuZWxTaGVsbCh7IGlkLCB0aXRsZSwgYXJpYUxhYmVsLCBvbkNsb3NlLCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGNsb3NlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHJldHVybkZvY3VzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm5Gb2N1c1JlZi5jdXJyZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgIGNsb3NlUmVmLmN1cnJlbnQ/LmZvY3VzKClcbiAgICByZXR1cm4gKCkgPT4gcmV0dXJuRm9jdXNSZWYuY3VycmVudD8uZm9jdXM/LigpXG4gIH0sIFtdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbGF5ZXJcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIG9uQ2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c2VjdGlvbiBpZD17aWR9IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICA8YnV0dG9uIHJlZj17Y2xvc2VSZWZ9IHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9IGFyaWEtbGFiZWw9e2BcdTUxNzNcdTk1RUQke3RpdGxlfWB9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9ydGN1dEhlbHAoeyBkZW1vQXZhaWxhYmxlLCBzaG93Q2FudmFzSW5kZXgsIG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlLCBvbkNsb3NlIH0pIHtcbiAgY29uc3Qgc2hvcnRjdXRzID0gZ2V0Qm9hcmRTaG9ydGN1dHMoKVxuICByZXR1cm4gKFxuICAgIDxQYW5lbFNoZWxsIGlkPVwid2YtYm9hcmQtdXRpbGl0eVwiIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXCIgYXJpYUxhYmVsPVwiXHU1RTJFXHU1MkE5XHUzMDAxXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RTBFXHU4QkJFXHU3RjZFXCIgb25DbG9zZT17b25DbG9zZX0+XG4gICAgICA8ZGwgY2xhc3NOYW1lPVwid2Ytc2hvcnRjdXQtbGlzdFwiPlxuICAgICAgICB7c2hvcnRjdXRzLm1hcCgoc2hvcnRjdXQpID0+IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17c2hvcnRjdXQuaWQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSA/ICdpcy1kaXNhYmxlZCcgOiAnJ30ga2V5PXtzaG9ydGN1dC5pZH0+XG4gICAgICAgICAgICA8ZHQ+PGtiZD57c2hvcnRjdXQua2V5c308L2tiZD48L2R0PlxuICAgICAgICAgICAgPGRkPntzaG9ydGN1dC5sYWJlbH17c2hvcnRjdXQuaWQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSA/ICdcdUZGMDhcdTVGNTNcdTUyNERcdTRFMERcdTUzRUZcdTc1MjhcdUZGMDknIDogJyd9PC9kZD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2RsPlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbm90ZVwiPlx1NTcyOFx1OEY5M1x1NTE2NVx1Njg0Nlx1MzAwMVx1NjU4N1x1NjcyQ1x1NTdERlx1MzAwMVx1NEUwQlx1NjJDOVx1Njg0Nlx1NTQ4Q1x1NTNFRlx1N0YxNlx1OEY5MVx1NTE4NVx1NUJCOVx1NEUyRFx1NEUwRFx1NEYxQVx1ODlFNlx1NTNEMVx1NjY2RVx1OTAxQVx1NUZFQlx1NjM3N1x1OTUyRVx1MzAwMjwvcD5cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLXNlY3Rpb25cIiBhcmlhLWxhYmVsbGVkYnk9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XG4gICAgICAgIDxoMiBpZD1cIndmLWJvYXJkLWluZGV4LXNldHRpbmctdGl0bGVcIj5cdTc1M0JcdTY3N0ZcdThCQkVcdTdGNkU8L2gyPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtYm9hcmQtc2V0dGluZy1yb3dcIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU2NjNFXHU3OTNBXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1PC9zdHJvbmc+XG4gICAgICAgICAgICA8c21hbGw+XHU1NzI4XHU3NTNCXHU2NzdGXHU0RTBBXHU2NjNFXHU3OTNBXHU1M0VGXHU2MkQ2XHU2MkZEXHU3Njg0XHU5ODc1XHU5NzYyXHU3RDIyXHU1RjE1PC9zbWFsbD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgY2hlY2tlZD17c2hvd0NhbnZhc0luZGV4fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25TaG93Q2FudmFzSW5kZXhDaGFuZ2UoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9QYW5lbFNoZWxsPlxuICApXG59XG4iLCAiY29uc3QgREVGQVVMVF9TRVRUSU5HUyA9IE9iamVjdC5mcmVlemUoeyBzaG93Q2FudmFzSW5kZXg6IHRydWUgfSlcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEJvYXJkU3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogd2luZG93LmxvY2FsU3RvcmFnZVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSkge1xuICByZXR1cm4gYHdmLWJvYXJkLXNldHRpbmdzOiR7cHJvamVjdE5hbWV9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEJvYXJkU2V0dGluZ3Moc3RvcmFnZSwgcHJvamVjdE5hbWUpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHN0b3JhZ2U/LmdldEl0ZW0oYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpKSlcbiAgICBpZiAodHlwZW9mIHBhcnNlZD8uc2hvd0NhbnZhc0luZGV4ID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiB7IHNob3dDYW52YXNJbmRleDogcGFyc2VkLnNob3dDYW52YXNJbmRleCB9XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBmaWxlOi8vIHN0b3JhZ2UgY2FuIGJlIHVuYXZhaWxhYmxlIG9yIGNvbnRhaW4gc3RhbGUgZGF0YS5cbiAgfVxuICByZXR1cm4geyAuLi5ERUZBVUxUX1NFVFRJTkdTIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lLCBzZXR0aW5ncykge1xuICBjb25zdCBub3JtYWxpemVkID0geyBzaG93Q2FudmFzSW5kZXg6IHNldHRpbmdzLnNob3dDYW52YXNJbmRleCAhPT0gZmFsc2UgfVxuICB0cnkge1xuICAgIHN0b3JhZ2U/LnNldEl0ZW0oYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpLCBKU09OLnN0cmluZ2lmeShub3JtYWxpemVkKSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBTZXR0aW5ncyByZW1haW4gdXNhYmxlIGZvciB0aGUgY3VycmVudCBzZXNzaW9uIHdpdGhvdXQgcGVyc2lzdGVuY2UuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgQ2FudmFzTW9kZSwgcnVuRXhwb3J0V2l0aEZlZWRiYWNrIH0gZnJvbSAnLi9DYW52YXNNb2RlLmpzeCdcbmltcG9ydCB7IERlbW9Nb2RlIH0gZnJvbSAnLi9EZW1vTW9kZS5qc3gnXG5pbXBvcnQgeyByZXNvbHZlRXhwYW5kVGFyZ2V0cyB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHsgZXhwb3J0U2VsZWN0ZWQgfSBmcm9tICcuL2V4cG9ydC5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5pbXBvcnQgeyBjbGFtcFNjYWxlIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgUmV2aWV3UGFuZWwgfSBmcm9tICcuL1Jldmlld1BhbmVsLmpzeCdcbmltcG9ydCB7IFJldmlld01hcmtlcnMgfSBmcm9tICcuL1Jldmlld01hcmtlcnMuanN4J1xuaW1wb3J0IHsgUmV2aWV3TGF1bmNoZXIgfSBmcm9tICcuL1Jldmlld0xhdW5jaGVyLmpzeCdcbmltcG9ydCB7IGRlc2NyaWJlUmV2aWV3RWxlbWVudCB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuaW1wb3J0IHsgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0IH0gZnJvbSAnLi9iZWZvcmUtdW5sb2FkLmpzJ1xuaW1wb3J0IHsgU2hvcnRjdXRIZWxwIH0gZnJvbSAnLi9Cb2FyZFBhbmVscy5qc3gnXG5pbXBvcnQgeyBnZXRCb2FyZFN0b3JhZ2UsIHJlYWRCb2FyZFNldHRpbmdzLCBzYXZlQm9hcmRTZXR0aW5ncyB9IGZyb20gJy4vYm9hcmQtc2V0dGluZ3MuanMnXG5pbXBvcnQgeyBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQsIHNob3J0Y3V0SWRGb3JFdmVudCwgc2hvcnRjdXRNb2RpZmllckxhYmVsIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIHRvb2xiYXJFeHBhbmQ6IDw+PHBhdGggZD1cIk01IDV2MTRcIiAvPjxwYXRoIGQ9XCJtMTUgMTgtNi02IDYtNlwiIC8+PC8+LFxuICAgIHRvb2xiYXJDb2xsYXBzZTogPD48cGF0aCBkPVwiTTE5IDV2MTRcIiAvPjxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz48Lz4sXG4gICAgZG93bmxvYWQ6IDw+PHBhdGggZD1cIk0xMiAzdjEyXCIgLz48cGF0aCBkPVwibTcgMTAgNSA1IDUtNVwiIC8+PHBhdGggZD1cIk01IDIxaDE0XCIgLz48Lz4sXG4gICAgc2V0dGluZ3M6IDw+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIgLz48cGF0aCBkPVwiTTE5LjQgMTVhMS43IDEuNyAwIDAgMCAuMzQgMS44OGwuMDYuMDYtMi44MyAyLjgzLS4wNi0uMDZBMS43IDEuNyAwIDAgMCAxNSAxOS40YTEuNyAxLjcgMCAwIDAtMSAuNiAxLjcgMS43IDAgMCAwLS40IDEuMVYyMWgtNHYtLjA5QTEuNyAxLjcgMCAwIDAgOC42IDE5LjRhMS43IDEuNyAwIDAgMC0xLjg4LjM0bC0uMDYuMDYtMi44My0yLjgzLjA2LS4wNkExLjcgMS43IDAgMCAwIDQuNiAxNWExLjcgMS43IDAgMCAwLS42LTEgMS43IDEuNyAwIDAgMC0xLjEtLjRIM3YtNGguMDlBMS43IDEuNyAwIDAgMCA0LjYgOC42YTEuNyAxLjcgMCAwIDAtLjM0LTEuODhsLS4wNi0uMDYgMi44My0yLjgzLjA2LjA2QTEuNyAxLjcgMCAwIDAgOSA0LjZhMS43IDEuNyAwIDAgMCAxLS42IDEuNyAxLjcgMCAwIDAgLjQtMS4xVjNoNHYuMDlBMS43IDEuNyAwIDAgMCAxNS40IDQuNmExLjcgMS43IDAgMCAwIDEuODgtLjM0bC4wNi0uMDYgMi44MyAyLjgzLS4wNi4wNkExLjcgMS43IDAgMCAwIDE5LjQgOWMuMi4zNy41Mi43IDEgLjkuMzIuMTMuNjguMiAxLjEuMmguMDl2NGgtLjA5YTEuNyAxLjcgMCAwIDAtMi4xLjlaXCIgLz48Lz4sXG4gICAgaGVscDogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjlcIiAvPjxwYXRoIGQ9XCJNOS43IDlhMi40IDIuNCAwIDEgMSAzLjcgMmMtLjkuNi0xLjQgMS4xLTEuNCAyXCIgLz48cGF0aCBkPVwiTTEyIDE3aC4wMVwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICBjb25zdCBzaG9ydGN1dE1vZGlmaWVyID0gc2hvcnRjdXRNb2RpZmllckxhYmVsKClcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17aW50ZXJhY3RpdmUgPyAnd2YtaW50ZXJhY3Rpb24tbG9jaycgOiAnd2YtaW50ZXJhY3Rpb24tbG9jayBpcy1sb2NrZWQnfVxuICAgICAgb25DbGljaz17b25Ub2dnbGV9XG4gICAgICBhcmlhLXByZXNzZWQ9eyFpbnRlcmFjdGl2ZX1cbiAgICAgIHRpdGxlPXtpbnRlcmFjdGl2ZVxuICAgICAgICA/IGBcdTVGNTNcdTUyNERcdTUzRUZcdTRFQTRcdTRFOTJcdTk4NzVcdTk3NjJcdTMwMDJcdTcwQjlcdTUxRkJcdTk1MDFcdTRGNEZcdTU0MEVcdUZGMUFcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTc1M0JcdTVFMDNcdUZGMENcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTVGRUJcdTYzNzdcdTk1MkUgJHtzaG9ydGN1dE1vZGlmaWVyfStJYFxuICAgICAgICA6IGBcdTVGNTNcdTUyNERcdTVERjJcdTk1MDFcdTRGNEZcdTMwMDJcdTcwQjlcdTUxRkJcdTYwNjJcdTU5MERcdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUJcdTVGRUJcdTYzNzdcdTk1MkUgJHtzaG9ydGN1dE1vZGlmaWVyfStJYH1cbiAgICA+XG4gICAgICA8TG9ja0ljb24gb3Blbj17aW50ZXJhY3RpdmV9IC8+XG4gICAgICA8c3Bhbj57aW50ZXJhY3RpdmUgPyAnXHU1M0VGXHU0RUE0XHU0RTkyJyA6ICdcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInfTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihlbCkge1xuICBjb25zdCByZXF1ZXN0ID0gZWwgJiYgKGVsLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGVsLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKVxuICBpZiAoIXJlcXVlc3QpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcXVlc3QuY2FsbChlbCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5mdW5jdGlvbiBleGl0Qm9hcmRGdWxsc2NyZWVuKCkge1xuICBpZiAoIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICBjb25zdCBleGl0ID0gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW5cbiAgaWYgKCFleGl0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShleGl0LmNhbGwoZG9jdW1lbnQpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2hvcnRjdXRNb2RpZmllciA9IHNob3J0Y3V0TW9kaWZpZXJMYWJlbCgpXG5cbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSksXG4gIClcbiAgY29uc3QgW2NhbnZhc1NjYWxlLCBzZXRDYW52YXNTY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1NjYWxlLCBzZXREZW1vU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9WaWV3UmVzZXRLZXksIHNldERlbW9WaWV3UmVzZXRLZXldID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2ludGVyYWN0aXZlLCBzZXRJbnRlcmFjdGl2ZV0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZElkcywgc2V0RXhwYW5kZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCBbaW1tZXJzaXZlLCBzZXRJbW1lcnNpdmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQsIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2hlbHBWaXNpYmxlLCBzZXRIZWxwVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NhbnZhc0luZGV4VmlzaWJsZSwgc2V0Q2FudmFzSW5kZXhWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dDYW52YXNJbmRleCxcbiAgKVxuICBjb25zdCBbY2FudmFzSW5kZXhQb3NpdGlvbiwgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBib2FyZFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmID0gUmVhY3QudXNlUmVmKG5ldyBTZXQoKSlcbiAgY29uc3QgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGNhbnZhc0xvY2tlZCA9ICFpbnRlcmFjdGl2ZSB8fCBzcGFjZUhlbGRcbiAgY29uc3QgYWxsU2NyZWVuSWRzID0gcHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpXG4gIGNvbnN0IGlzRGVtbyA9IG1vZGUgPT09ICdkZW1vJyAmJiBkZW1vQXZhaWxhYmxlXG4gIGNvbnN0IGFjdGl2ZVNjYWxlID0gaXNEZW1vID8gZGVtb1NjYWxlIDogY2FudmFzU2NhbGVcbiAgY29uc3Qgc2V0QWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBzZXREZW1vU2NhbGUgOiBzZXRDYW52YXNTY2FsZVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmVcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcblxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2VFbGVtZW50KSB7XG4gICAgICAgIG9wdGlvbnMucmVwbGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICBpZiAoY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQgJiYgaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5tYXAoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCA/IG5leHRTZWxlY3Rpb24gOiBpdGVtKVxuICAgICAgfVxuICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQpXG4gICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0ZWRFbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgIHJldHVybiBhZGRpdGl2ZSA/IFsuLi5jdXJyZW50LCBuZXh0U2VsZWN0aW9uXSA6IFtuZXh0U2VsZWN0aW9uXVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0LnNjcmVlbnMsIHJldmlld011bHRpU2VsZWN0LCByZXZpZXdTZWxlY3Rpb25zXSlcblxuICBjb25zdCByZW1vdmVSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpKVxuICB9LCBbXSlcblxuICBjb25zdCBjbG9zZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdFbmFibGVkKGZhbHNlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IGhvdmVyUmV2aWV3QnJlYWRjcnVtYiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gZWxlbWVudCB8fCBudWxsXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBjbG9zZVJldmlld1BhbmVsID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgfSwgW2hvdmVyUmV2aWV3QnJlYWRjcnVtYl0pXG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7IHNob3dDYW52YXNJbmRleDogdmlzaWJsZSB9KVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICAvLyBcdTUzRUFcdTU3MjhcdTUyMDdcdTYzNjJcdTk4NzlcdTc2RUVcdTY1RjZcdTZFMDVcdTRGNERcdTdGNkVcdTMwMDJcdTk5OTZcdTVDNEYgdXNlRWZmZWN0IFx1ODJFNVx1NEU1RiBzZXQgbnVsbFx1RkYwQ1x1NEYxQVx1NzZENlx1NjM4OSBDYW52YXNJbmRleFxuICAvLyB1c2VMYXlvdXRFZmZlY3QgXHU1MjFBXHU3Qjk3XHU1OTdEXHU3Njg0XHU1NzUwXHU2ODA3XHVGRjBDXHU3RDIyXHU1RjE1XHU0RjFBXHU0RTAwXHU3NkY0IHZpc2liaWxpdHk6aGlkZGVuXHUzMDAyXG4gIGNvbnN0IGNhbnZhc0luZGV4U2V0dGluZ3NQcm9qZWN0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKVxuICAgIHNldENhbnZhc0luZGV4VmlzaWJsZShzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXgpXG4gICAgY29uc3QgcHJldmlvdXNOYW1lID0gY2FudmFzSW5kZXhTZXR0aW5nc1Byb2plY3RSZWYuY3VycmVudFxuICAgIGNhbnZhc0luZGV4U2V0dGluZ3NQcm9qZWN0UmVmLmN1cnJlbnQgPSBwcm9qZWN0Lm5hbWVcbiAgICBpZiAocHJldmlvdXNOYW1lICE9IG51bGwgJiYgcHJldmlvdXNOYW1lICE9PSBwcm9qZWN0Lm5hbWUpIHtcbiAgICAgIHNldENhbnZhc0luZGV4UG9zaXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtwcm9qZWN0Lm5hbWVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMobmV3IFNldCgpKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIGNvbnN0IHRvZ2dsZUV4cGFuZCA9IChpZCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZXhwYW5kVGFyZ2V0cyA9IChzaG91bGRFeHBhbmQpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbFNjcmVlbklkcylcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgdGFyZ2V0cykge1xuICAgICAgICBpZiAoc2hvdWxkRXhwYW5kKSBuZXh0LmFkZChpZClcbiAgICAgICAgZWxzZSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScgJiYgIWV2ZW50LnJlcGVhdCAmJiAhaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzZXRTcGFjZUhlbGQodHJ1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3J0Y3V0ID0gc2hvcnRjdXRJZEZvckV2ZW50KGV2ZW50KVxuICAgICAgaWYgKCFzaG9ydGN1dCkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgIT09ICdlc2NhcGUnICYmIGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUpIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnICYmICFpc0RlbW8pIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZXNjYXBlJyAmJiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnY2FudmFzJykgc2V0TW9kZSgnY2FudmFzJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2RlbW8nKSBzZXRNb2RlKCdkZW1vJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2ludGVyYWN0aW9uJykgc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdyZXZpZXcnKSB0b2dnbGVSZXZpZXcoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW1tZXJzaXZlJykgdG9nZ2xlSW1tZXJzaXZlKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2Jyb3dzZXItZnVsbHNjcmVlbicpIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hvdHNwb3RzJykgc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaGVscCcpIHtcbiAgICAgICAgc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICB9XG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnKSB7XG4gICAgICAgIGlmIChoZWxwVmlzaWJsZSkgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgICAgIGVsc2UgaWYgKHJldmlld0VuYWJsZWQpIGNsb3NlUmV2aWV3KClcbiAgICAgICAgZWxzZSBpZiAoaW1tZXJzaXZlKSBleGl0SW1tZXJzaXZlKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXAgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnKSBzZXRTcGFjZUhlbGQoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgfVxuICB9LCBbXG4gICAgY2xvc2VSZXZpZXcsXG4gICAgZGVtb0F2YWlsYWJsZSxcbiAgICBleGl0SW1tZXJzaXZlLFxuICAgIGhlbHBWaXNpYmxlLFxuICAgIGltbWVyc2l2ZSxcbiAgICBpc0RlbW8sXG4gICAgcmV2aWV3RW5hYmxlZCxcbiAgICBzZXRNb2RlLFxuICAgIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuLFxuICAgIHRvZ2dsZUltbWVyc2l2ZSxcbiAgICB0b2dnbGVSZXZpZXcsXG4gIF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2RlbW8nKSBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH0sIFttb2RlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN5bmMgPSAoKSA9PiBzZXRCcm93c2VyRnVsbHNjcmVlbighIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBleHBvcnRJZHMgPSAoaWRzKSA9PiBydW5FeHBvcnRXaXRoRmVlZGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHNldEV4cG9ydGluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzY3JlZW5zID0gaWRzLm1hcCgoaWQpID0+IHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGlkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkLFxuICAgICAgICAgIHRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2NyZWVuLWlkPVwiJHtpZH1cIl0gLndmLXNjcmVlbi1jb250ZW50YCksXG4gICAgICAgICAgdmlld3BvcnQsXG4gICAgICAgICAgZXhwYW5kZWQ6IGV4cGFuZGVkSWRzLmhhcyhpZCksXG4gICAgICAgICAgcHJvamVjdE5hbWU6IHByb2plY3QubmFtZSxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGF3YWl0IGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEV4cG9ydGluZyhmYWxzZSlcbiAgICB9XG4gIH0sIHNldEV4cG9ydEVycm9yKVxuXG4gIGNvbnN0IHJlc2V0RGVtbyA9ICgpID0+IHtcbiAgICByZXNldCgpXG4gICAgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgcmVzZXREZW1vVmlldyA9ICgpID0+IHtcbiAgICBzZXREZW1vVmlld1Jlc2V0S2V5KCh2YWx1ZSkgPT4gdmFsdWUgKyAxKVxuICB9XG5cbiAgY29uc3QgcmVzZXRBY3RpdmVWaWV3ID0gaXNEZW1vID8gcmVzZXREZW1vVmlldyA6ICgpID0+IHNldENhbnZhc1NjYWxlKDEpXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e2JvYXJkUmVmfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtYm9hcmQke2ltbWVyc2l2ZSA/ICcgaXMtaW1tZXJzaXZlJyA6ICcnfSR7cmV2aWV3RW5hYmxlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b29sYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1sZWZ0XCI+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbmFtZVwiPntwcm9qZWN0Lm5hbWV9PC9oMT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW1ldGFcIj57cHJvamVjdC5zY3JlZW5zLmxlbmd0aH0gXHU5ODc1PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItY2VudGVyXCI+XG4gICAgICAgICAge2RlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLW1vZGUtc3dpdGNoZXJcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU2QTIxXHU1RjBGXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdjYW52YXMnID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdjYW52YXMnKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17YFx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRlx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rMVx1RkYwOWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtgXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfSsyXHVGRjA5YH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NkYxNFx1NzkzQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi12aWV3cG9ydC1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTg5QzZcdTUzRTNcIj5cbiAgICAgICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5tYXAoKGtleSkgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3ZpZXdwb3J0S2V5ID09PSBrZXkgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld3BvcnRLZXkoa2V5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7VklFV1BPUlRfTEFCRUxTW2tleV0gfHwga2V5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnIHx8ICFkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17KCkgPT4gc2V0Q2FudmFzU2NhbGUoMSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0RGVtb1ZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17YFx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rSFx1RkYwOWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7aG90c3BvdHNWaXNpYmxlID8gJ1x1NzBFRFx1NTMzQSBPTicgOiAnXHU3MEVEXHU1MzNBIE9GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWRlbW8tZW50cnlcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cIndmLWRlbW8tZW50cnlcIj5cdTUxNjVcdTUzRTM8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgIGlkPVwid2YtZGVtby1lbnRyeVwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZW50cnlJZH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNlbGVjdEVudHJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwOVx1NjJFOVx1NkYxNFx1NzkzQVx1NTE2NVx1NTNFM1x1OTg3NVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e3NjcmVlbi5pZH0gdmFsdWU9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAge2luZGV4ICsgMX0uIHtzY3JlZW4udGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtyZXNldERlbW99Plx1OTFDRFx1N0Y2RTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1kZW1vLXBhZ2UtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICBcdTVGNTNcdTUyNERcdUZGMUFcbiAgICAgICAgICAgICAgICB7Y3VycmVudFNjcmVlblxuICAgICAgICAgICAgICAgICAgPyBgJHtwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbi5pZCkgKyAxfS4gJHtjdXJyZW50U2NyZWVuLnRpdGxlfSBcdTAwQjcgJHtjdXJyZW50U2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICAgICAgICA6IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2hlbHBWaXNpYmxlID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyNTNcdTVGMDBcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICBhcmlhLWNvbnRyb2xzPVwid2YtYm9hcmQtdXRpbGl0eVwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVx1RkYwOD9cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiaGVscFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkU8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e3Jldmlld0VuYWJsZWQgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17cmV2aWV3RW5hYmxlZCA/ICdcdTRGRUVcdTY1MzlcdTRFMkQnIDogJ1x1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICB0aXRsZT17YFx1NEZFRVx1NjUzOVx1RkYxQVx1NzBCOVx1OTAwOVx1OTg3NVx1OTc2Mlx1ODI4Mlx1NzBCOVx1NUU3Nlx1NjU3NFx1NzQwNlx1NjIxMFx1NTNFRlx1N0YxNlx1OEY5MVx1NzY4NCBBSSBcdTRGRUVcdTY1MzkgUHJvbXB0XHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfStNXHVGRjA5YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVJldmlld31cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImVkaXRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtpbW1lcnNpdmUgPyAnXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyA6ICdcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnfVxuICAgICAgICAgICAgdGl0bGU9e2BcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9KzNcdUZGMDlgfVxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlSW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgd2YtaW1tZXJzaXZlLWNocm9tZSR7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJycgOiAnIGlzLWNvbGxhcHNlZCd9YH1cbiAgICAgICAgICByb2xlPVwidG9vbGJhclwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NkM4OVx1NkQ3OFx1NjNBN1x1NEVGNlwiXG4gICAgICAgID5cbiAgICAgICAgICB7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V4aXRJbW1lcnNpdmV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGBcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgXG4gICAgICAgICAgICAgICAgICA6IGBcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17YFx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rSFx1RkYwOWB9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICBjYW52YXNJbmRleFZpc2libGU9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNJbmRleFBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZT17c2V0Q2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNsb3NlQ2FudmFzSW5kZXg9eygpID0+IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8RGVtb01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIGhvdHNwb3RzVmlzaWJsZT17aG90c3BvdHNWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICB2aWV3UmVzZXRLZXk9e2RlbW9WaWV3UmVzZXRLZXl9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBvbkNhbnZhc0NsaWNrPXtyZXZpZXdQYW5lbFZpc2libGUgPyBjbG9zZVJldmlld1BhbmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtyZXZpZXdFbmFibGVkID8gKFxuICAgICAgICA8UmV2aWV3TWFya2VycyBib2FyZFJlZj17Ym9hcmRSZWZ9IGl0ZW1zPXtyZXZpZXdJdGVtc30gb25PcGVuUGFuZWw9e29wZW5SZXZpZXdQYW5lbH0gLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge2hlbHBWaXNpYmxlID8gKFxuICAgICAgICA8U2hvcnRjdXRIZWxwXG4gICAgICAgICAgZGVtb0F2YWlsYWJsZT17ZGVtb0F2YWlsYWJsZX1cbiAgICAgICAgICBzaG93Q2FudmFzSW5kZXg9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvblNob3dDYW52YXNJbmRleENoYW5nZT17dXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldEhlbHBWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgIHZpc2libGU9e3Jldmlld1BhbmVsVmlzaWJsZSAmJiByZXZpZXdFbmFibGVkfVxuICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICBtdWx0aVNlbGVjdD17cmV2aWV3TXVsdGlTZWxlY3R9XG4gICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICBvblNlbGVjdEVsZW1lbnQ9eyhlbGVtZW50KSA9PiBzZWxlY3RSZXZpZXdFbGVtZW50KGVsZW1lbnQsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICB9KX1cbiAgICAgICAgb25Ib3ZlckVsZW1lbnQ9e2hvdmVyUmV2aWV3QnJlYWRjcnVtYn1cbiAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICBvbkNsb3NlPXtjbG9zZVJldmlld31cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJmdW5jdGlvbiBmYWlsKHBhdGgsIG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke3BhdGh9ICR7bWVzc2FnZX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KHByb2plY3QpIHtcbiAgaWYgKCFwcm9qZWN0IHx8IHR5cGVvZiBwcm9qZWN0ICE9PSAnb2JqZWN0JykgZmFpbCgncHJvamVjdCcsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGlmICghcHJvamVjdC52aWV3cG9ydHMgfHwgdHlwZW9mIHByb2plY3Qudmlld3BvcnRzICE9PSAnb2JqZWN0Jykge1xuICAgIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHByb2plY3Qudmlld3BvcnRzKVxuICBpZiAodmlld3BvcnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSB2aWV3cG9ydCcpXG4gIGZvciAoY29uc3QgW2tleSwgdmlld3BvcnRdIG9mIHZpZXdwb3J0RW50cmllcykge1xuICAgIGlmICghdmlld3BvcnQgfHwgdHlwZW9mIHZpZXdwb3J0ICE9PSAnb2JqZWN0JykgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9YCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbiBvZiBbJ3dpZHRoJywgJ2hlaWdodCddKSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWV3cG9ydFtkaW1lbnNpb25dKSB8fCB2aWV3cG9ydFtkaW1lbnNpb25dIDw9IDApIHtcbiAgICAgICAgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9LiR7ZGltZW5zaW9ufWAsICdtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHByb2plY3QuZGVmYXVsdFZpZXdwb3J0KSkge1xuICAgIGZhaWwoJ3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0JywgYHJlZmVyZW5jZXMgbWlzc2luZyB2aWV3cG9ydCBcIiR7cHJvamVjdC5kZWZhdWx0Vmlld3BvcnR9XCJgKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LnNjcmVlbnMpIHx8IHByb2plY3Quc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICBmYWlsKCdwcm9qZWN0LnNjcmVlbnMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzY3JlZW4nKVxuICB9XG5cbiAgY29uc3QgaWRzID0gbmV3IFNldCgpXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LnNjcmVlbnNbJHtpbmRleH1dYFxuICAgIGlmICghc2NyZWVuIHx8IHR5cGVvZiBzY3JlZW4gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uaWQgIT09ICdzdHJpbmcnIHx8ICEvXlthLXowLTktXSskLy50ZXN0KHNjcmVlbi5pZCkpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBtYXRjaCAvXlthLXowLTktXSskLycpXG4gICAgfVxuICAgIGlmIChpZHMuaGFzKHNjcmVlbi5pZCkpIGZhaWwoYCR7cGF0aH0uaWRgLCBgaXMgZHVwbGljYXRlIFwiJHtzY3JlZW4uaWR9XCJgKVxuICAgIGlkcy5hZGQoc2NyZWVuLmlkKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmNvbXBvbmVudCAhPT0gJ2Z1bmN0aW9uJykgZmFpbChgJHtwYXRofS5jb21wb25lbnRgLCAnbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVuLmxpbmtzKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5saW5rc2AsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gIH0pXG5cbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgc2NyZWVuSW5kZXgpID0+IHtcbiAgICBzY3JlZW4ubGlua3MuZm9yRWFjaCgodGFyZ2V0LCBsaW5rSW5kZXgpID0+IHtcbiAgICAgIGlmICghaWRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgYHByb2plY3Quc2NyZWVuc1ske3NjcmVlbkluZGV4fV0ubGlua3NbJHtsaW5rSW5kZXh9XWAsXG4gICAgICAgICAgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke3RhcmdldH1cImAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5cbmV4cG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQsIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4vZmxvdy10YXJnZXQuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKSB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtZmxvdy10byc6IHRvIHx8IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0bykgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgICAgaWYgKG9uQ2xpY2spIG9uQ2xpY2soZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgdG8pIG5hdmlnYXRlKHRvKVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmZ1bmN0aW9uIGpvaW5DbGFzcyhiYXNlLCBleHRyYSkge1xuICByZXR1cm4gZXh0cmEgPyBgJHtiYXNlfSAke2V4dHJhfWAgOiBiYXNlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICBjb2x1bW5zICYmIHR5cGVvZiBjb2x1bW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjb2x1bW5zKVxuICAgICAgPyBjb2x1bW5zW3ZpZXdwb3J0S2V5XVxuICAgICAgOiBjb2x1bW5zXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDApIHJldHVybiBgcmVwZWF0KCR7dmFsdWV9LCBtaW5tYXgoMCwgMWZyKSlgXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSkgcmV0dXJuIHZhbHVlXG4gIHRocm93IG5ldyBFcnJvcignR3JpZCBjb2x1bW5zIG11c3QgcmVzb2x2ZSB0byBhIHBvc2l0aXZlIGludGVnZXIgb3Igbm9uLWVtcHR5IENTUyBzdHJpbmcnKVxufVxuXG5mdW5jdGlvbiB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZVN1ZmZpeDogdG8gPyAnIHdmLWludGVyYWN0aXZlJyA6ICcnLFxuICAgIHJvbGU6IHRvID8gJ2xpbmsnIDogcmVzdC5yb2xlLFxuICAgIHRhYkluZGV4OiB0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleCxcbiAgICBmbG93LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3goeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWJveCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e3sgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSb3coe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLXJvdyR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbHVtbih7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtY29sdW1uJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCBjb2x1bW5zID0gMSwgZ2FwID0gMCwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IHZpZXdwb3J0S2V5IH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSksXG4gICAgZ2FwLFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWdyaWQke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRpbmcoeyBsZXZlbCA9IDIsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHRhZyA9IGBoJHtNYXRoLm1pbig2LCBNYXRoLm1heCgxLCBsZXZlbCkpfWBcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnLCB7IGNsYXNzTmFtZTogYHdmLWhlYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KHsgYXMgPSAncCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7IGNsYXNzTmFtZTogYHdmLXRleHQgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkKHsgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNhcmQgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYWRnZSh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B3Zi1iYWRnZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdmF0YXIoeyBzaXplID0gNDAsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWF2YXRhciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGxhY2Vob2xkZXIoe1xuICB3aWR0aCA9ICcxMDAlJyxcbiAgaGVpZ2h0ID0gMTYwLFxuICBib3JkZXJSYWRpdXMgPSAwLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgc3R5bGUsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1pbWFnZS1wbGFjZWhvbGRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0LCBib3JkZXJSYWRpdXMsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wbGFjZWhvbGRlci1ibG9ja1wiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHsgdG8sIG9uQ2xpY2ssIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYnV0dG9uIHdmLWJ1dHRvbi0ke3ZhcmlhbnR9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRJbnB1dCh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxpbnB1dCBjbGFzc05hbWU9e2B3Zi1pbnB1dCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gdHlwZT1cInRleHRcIiB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRBcmVhKHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHRleHRhcmVhIGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXRleHRhcmVhICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c2VsZWN0IGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXNlbGVjdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NlbGVjdD5cbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHsgdHlwZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtY2hvaWNlICR7Y2xhc3NOYW1lfWAudHJpbSgpfT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtaW5wdXRcIiB0eXBlPXt0eXBlfSB7Li4ucmVzdH0gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNob2ljZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3gocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cImNoZWNrYm94XCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFkaW8ocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cInJhZGlvXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlKHsgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJzd2l0Y2hcIlxuICAgICAgYXJpYS1jaGVja2VkPXtjaGVja2VkfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtdG9nZ2xlICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBvbkNoYW5nZT8uKCFjaGVja2VkLCBldmVudCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdHJhY2tcIj48c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdGh1bWJcIiAvPjwvc3Bhbj5cbiAgICAgIHtsYWJlbCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybUZpZWxkKHsgbGFiZWwsIGh0bWxGb3IsIGhpbnQsIGVycm9yLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZm9ybS1maWVsZCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWZpZWxkLWxhYmVsXCIgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBjcmVhdGVGbG93UHJvcHMgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBQYWdlSGVhZGVyKHsgdGl0bGUsIHRpdGxlSWQsIHN1YnRpdGxlLCBzdWJ0aXRsZUlkLCBhY3Rpb25zLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGhlYWRlciBjbGFzc05hbWU9e2B3Zi1wYWdlLWhlYWRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWhlYWRlci1jb3B5XCI+XG4gICAgICAgIDxoMSBpZD17dGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS10aXRsZVwiPnt0aXRsZX08L2gxPlxuICAgICAgICB7c3VidGl0bGUgPyA8cCBpZD17c3VidGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3A+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge2FjdGlvbnMgPyA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtYWN0aW9uc1wiPnthY3Rpb25zfTwvZGl2PiA6IG51bGx9XG4gICAgPC9oZWFkZXI+XG4gIClcbn1cblxuZnVuY3Rpb24gTmF2aWdhdGlvbkxpc3QoeyBhcywgaXRlbXMsIGFjdGl2ZUlkLCBjbGFzc05hbWUsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBhcyxcbiAgICB7IGNsYXNzTmFtZSwgLi4ucmVzdCB9LFxuICAgIGl0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLW5hdi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtbmF2LWl0ZW0nfVxuICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICkpLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaWRlTmF2KHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8TmF2aWdhdGlvbkxpc3RcbiAgICAgIGFzPVwibmF2XCJcbiAgICAgIGl0ZW1zPXtpdGVtc31cbiAgICAgIGFjdGl2ZUlkPXthY3RpdmVJZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXNpZGUtbmF2ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFiQmFyKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLXRhYi1iYXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLXRhYi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtdGFiLWl0ZW0nfVxuICAgICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCcmVhZGNydW1icyh7IGl0ZW1zID0gW10sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLWJyZWFkY3J1bWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSBhcmlhLWxhYmVsPVwiQnJlYWRjcnVtYnNcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtgJHtpdGVtLmxhYmVsfS0ke2luZGV4fWB9PlxuICAgICAgICAgIHtpbmRleCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWRpdmlkZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2l0ZW0udG8gPyAoXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItbGlua1wiIHR5cGU9XCJidXR0b25cIiB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfT5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1jdXJyZW50XCI+e2l0ZW0ubGFiZWx9PC9zcGFuPn1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbi8qKiBcdTc5RkJcdTUyQThcdTdBRUZcdTY1NzRcdTVDNEZcdTU4RjNcdUZGMUFcdTUxODVcdTVCQjlcdTUzM0FcdTUzRUZcdTZFREFcdUZGMENUYWJCYXIgXHU4RDM0XHU1RTk1XHUzMDAydGFicyAvIGFjdGl2ZUlkIFx1NEUwRSBUYWJCYXIgXHU3NkY4XHU1NDBDXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlU2hlbGwoeyBjaGlsZHJlbiwgdGFicyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbW9iaWxlLXNoZWxsICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJ3Zi1tb2JpbGUtc2hlbGwtYm9keVwiPntjaGlsZHJlbn08L21haW4+XG4gICAgICB7dGFicy5sZW5ndGggPiAwID8gPFRhYkJhciBpdGVtcz17dGFic30gYWN0aXZlSWQ9e2FjdGl2ZUlkfSAvPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQ2VsbCh7IHRvLCBvbkNsaWNrLCB0aXRsZSwgc3VidGl0bGUsIHZhbHVlLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jZWxsICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2VsbC1tYWluXCI+XG4gICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtY2VsbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAge3N1YnRpdGxlID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgICB7dmFsdWUgIT09IHVuZGVmaW5lZCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtdmFsdWVcIj57dmFsdWV9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERhdGFUYWJsZSh7IGNvbHVtbnMgPSBbXSwgcm93cyA9IFtdLCBnZXRSb3dLZXksIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYmxlLXdyYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3Zi10YWJsZVwiPlxuICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZFwiPlxuICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkZXItcm93XCI+XG4gICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGluZ1wiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9Pntjb2x1bW4ubGFiZWx9PC90aD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keSBjbGFzc05hbWU9XCJ3Zi10YWJsZS1ib2R5XCI+XG4gICAgICAgICAge3Jvd3MubWFwKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dLZXkgPSBnZXRSb3dLZXkgPyBnZXRSb3dLZXkocm93KSA6IHJvdy5pZCB8fCBpbmRleFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLXJvd1wiIGRhdGEtd2Yta2V5PXtyb3dLZXl9IGtleT17cm93S2V5fT5cbiAgICAgICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWNlbGxcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT5cbiAgICAgICAgICAgICAgICAgICAge2NvbHVtbi5yZW5kZXIgPyBjb2x1bW4ucmVuZGVyKHJvd1tjb2x1bW4ua2V5XSwgcm93KSA6IHJvd1tjb2x1bW4ua2V5XX1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJzKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIG9uQ2hhbmdlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwidGFibGlzdFwiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRhYi1jb250cm9sXCJcbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpdGVtLmlkID09PSBhY3RpdmVJZH1cbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2U/LihpdGVtLmlkKX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGVwcyh7XG4gIGl0ZW1zID0gW10sXG4gIGN1cnJlbnQgPSAwLFxuICBkaXJlY3Rpb24gPSAnaG9yaXpvbnRhbCcsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHZlcnRpY2FsID0gZGlyZWN0aW9uID09PSAndmVydGljYWwnXG4gIHJldHVybiAoXG4gICAgPG9sXG4gICAgICBjbGFzc05hbWU9e2B3Zi1zdGVwcyAke3ZlcnRpY2FsID8gJ3dmLXN0ZXBzLXZlcnRpY2FsJyA6ICd3Zi1zdGVwcy1ob3Jpem9udGFsJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBpbmRleCA8IGN1cnJlbnQgPyAnZG9uZScgOiBpbmRleCA9PT0gY3VycmVudCA/ICdjdXJyZW50JyA6ICd0b2RvJ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2B3Zi1zdGVwcy1pdGVtIHdmLXN0ZXBzLWl0ZW0tJHtzdGF0dXN9YH0ga2V5PXtpdGVtLmlkIHx8IGl0ZW0ubGFiZWwgfHwgaW5kZXh9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcC1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAge3N0YXR1cyA9PT0gJ2RvbmUnID8gbnVsbCA6IGluZGV4ICsgMX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7aW5kZXggPCBpdGVtcy5sZW5ndGggLSAxID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGluZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICB7aXRlbS5kZXNjcmlwdGlvbiA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWRlc2NcIj57aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvb2w+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVtcHR5U3RhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGFjdGlvbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZW1wdHktc3RhdGUgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWVtcHR5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge3RpdGxlID8gPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1lbXB0eS10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz4gOiBudWxsfVxuICAgICAge2Rlc2NyaXB0aW9uID8gPHAgY2xhc3NOYW1lPVwid2YtZW1wdHktZGVzY1wiPntkZXNjcmlwdGlvbn08L3A+IDogbnVsbH1cbiAgICAgIHthY3Rpb24gPyA8ZGl2IGNsYXNzTmFtZT1cIndmLWVtcHR5LWFjdGlvblwiPnthY3Rpb259PC9kaXY+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vZm9ybXMuanN4J1xuXG5mdW5jdGlvbiBTY3JlZW5Qb3J0YWwoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGFuY2hvciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbaG9zdCwgc2V0SG9zdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SG9zdChhbmNob3IuY3VycmVudD8uY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JykgfHwgbnVsbClcbiAgfSwgW10pXG5cbiAgaWYgKCFob3N0KSByZXR1cm4gPHNwYW4gcmVmPXthbmNob3J9IGNsYXNzTmFtZT1cIndmLW92ZXJsYXktYW5jaG9yXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbChjaGlsZHJlbiwgaG9zdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vZGFsKHsgb3BlbiwgdGl0bGUsIGNoaWxkcmVuLCBhY3Rpb25zLCBvbkNsb3NlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLW1vZGFsLW92ZXJsYXkgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJwcmVzZW50YXRpb25cIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLW1vZGFsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17dGl0bGV9PlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtbW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLW1vZGFsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICAgICAge29uQ2xvc2UgPyA8QnV0dG9uIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvQnV0dG9uPiA6IG51bGx9XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgICAgIHthY3Rpb25zID8gPGZvb3RlciBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1mb290ZXJcIj57YWN0aW9uc308L2Zvb3Rlcj4gOiBudWxsfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29uZmlybURpYWxvZyh7XG4gIG9wZW4sXG4gIHRpdGxlID0gJ1x1Nzg2RVx1OEJBNFx1NjRDRFx1NEY1QycsXG4gIG1lc3NhZ2UsXG4gIGNvbmZpcm1MYWJlbCA9ICdcdTc4NkVcdThCQTQnLFxuICBjYW5jZWxMYWJlbCA9ICdcdTUzRDZcdTZEODgnLFxuICBvbkNvbmZpcm0sXG4gIG9uQ2FuY2VsLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxNb2RhbFxuICAgICAgb3Blbj17b3Blbn1cbiAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgb25DbG9zZT17b25DYW5jZWx9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIGFjdGlvbnM9eyhcbiAgICAgICAgPD5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e29uQ2FuY2VsfT57Y2FuY2VsTGFiZWx9PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9e29uQ29uZmlybX0+e2NvbmZpcm1MYWJlbH08L0J1dHRvbj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgID5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWNvbmZpcm0tbWVzc2FnZVwiPnttZXNzYWdlfTwvcD5cbiAgICA8L01vZGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2FzdCh7IG9wZW4sIGNoaWxkcmVuLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLXRvYXN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwic3RhdHVzXCIgey4uLnJlc3R9PntjaGlsZHJlbn08L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9hZGluZ092ZXJsYXkoeyBvcGVuLCBsYWJlbCA9ICdcdTUyQTBcdThGN0RcdTRFMkQnLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLWxvYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJzdGF0dXNcIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWxvYWRpbmctc2hhcGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1sb2FkaW5nLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFdpcmVNYXAoeyBjbGFzc05hbWUgPSAnJywgc3R5bGUsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1hcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gc3R5bGU9e3sgcG9zaXRpb246ICdyZWxhdGl2ZScsIC4uLnN0eWxlIH19IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1saW5lIHdmLW1hcC1saW5lLWFcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbWFwLWxpbmUgd2YtbWFwLWxpbmUtYlwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1hcE1hcmtlcih7IHgsIHksIGxhYmVsLCB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIHN0eWxlLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1tYXAtbWFya2VyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyBsZWZ0OiBgJHt4fSVgLCB0b3A6IGAke3l9JWAsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1tYXJrZXItc2hhcGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNYXBPdmVybGF5KHsgcG9zaXRpb24gPSAnYm90dG9tJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1hcC1vdmVybGF5IHdmLW1hcC1vdmVybGF5LSR7cG9zaXRpb259ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQgeyBNb2JpbGVTaGVsbCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IHVzZVNjcmVlbklkIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuXG5jb25zdCB0YWJzID0gW1xuICB7IGxhYmVsOiAnXHU1M0QxXHU3M0IwJywgdG86ICdkaXNjb3ZlcicgfSxcbiAgeyBsYWJlbDogJ1x1ODg0Q1x1N0EwQicsIHRvOiAndHJpcHMnIH0sXG4gIHsgbGFiZWw6ICdcdTYyMTFcdTc2ODQnLCB0bzogJ3Byb2ZpbGUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVMYXlvdXQoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVTaGVsbCBjbGFzc05hbWU9XCJ3ZWVrZW5kLXNoZWxsIHdlZWtlbmQtbGF5b3V0XCIgdGFicz17dGFic30gYWN0aXZlSWQ9e3NjcmVlbklkfSBhcmlhLWxhYmVsPVwiXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXHU2NUM1XHU4ODRDXHU1MkE5XHU2MjRCXCI+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Nb2JpbGVTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEF2YXRhcixcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIERhdGFUYWJsZSxcbiAgRm9ybUZpZWxkLFxuICBNb2RhbCxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgQ09TVFMgPSBbXG4gIHsgaWQ6ICdjb3N0LXRyYW5zaXQnLCBpdGVtOiAnXHU1RTAyXHU1MTg1XHU0RUE0XHU5MDFBJywgb3duZXI6ICdcdTUxNzFcdTU0MEMnLCBhbW91bnQ6ICc0OCcgfSxcbiAgeyBpZDogJ2Nvc3QtdGlja2V0JywgaXRlbTogJ1x1NUM1NVx1NTM4NVx1OTVFOFx1Nzk2OCcsIG93bmVyOiAnXHU2Nzk3XHU2NjUzXHU5MUNFJywgYW1vdW50OiAnODAnIH0sXG4gIHsgaWQ6ICdjb3N0LWx1bmNoJywgaXRlbTogJ1x1NTM0OFx1OTkxMCcsIG93bmVyOiAnXHU1MTcxXHU1NDBDJywgYW1vdW50OiAnMTgwJyB9LFxuICB7IGlkOiAnY29zdC1tYXJrZXQnLCBpdGVtOiAnXHU1RTAyXHU5NkM2XHU5ODg0XHU3NTU5Jywgb3duZXI6ICdcdTRFMkFcdTRFQkEnLCBhbW91bnQ6ICcxMjAnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBCdWRnZXRTY3JlZW4oKSB7XG4gIGNvbnN0IFtpbnZpdGVPcGVuLCBzZXRJbnZpdGVPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiYnVkZ2V0LXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgYnVkZ2V0X19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwiYnVkZ2V0LWhlYWRlclwiIHRpdGxlSWQ9XCJidWRnZXQtdGl0bGVcIiBjbGFzc05hbWU9XCJidWRnZXRfX2hlYWRlclwiIHRpdGxlPVwiXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBXCIgc3VidGl0bGU9XCJcdTRFM0FcdTg4NENcdTdBMEJcdTk4ODRcdTc1NTlcdThEMzlcdTc1MjhcdTVFNzZcdTkwODBcdThCRjdcdTRGMTlcdTRGMzRcIiBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImJ1ZGdldF9fYmFja1wiIHRvPVwidHJpcC1jb25maXJtXCI+XHU4RkQ0XHU1NkRFPC9CdXR0b24+fSAvPlxuICAgICAgICA8Q2FyZCBpZD1cImJ1ZGdldC1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5XCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktbGFiZWxcIj5cdTk4ODRcdThCQTFcdTYwM0JcdThEMzlcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS12YWx1ZVwiPjQyOCBcdTUxNDM8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS1ub3RlXCI+XHU2MzA5IDMgXHU0RjREXHU1NDBDXHU4ODRDXHU0RUJBXHU4QkExXHU3Qjk3XHVGRjBDXHU0RUJBXHU1NzQ3XHU3RUE2IDE0MyBcdTUxNDM8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPERhdGFUYWJsZSBpZD1cImJ1ZGdldC10YWJsZVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fdGFibGVcIiBjb2x1bW5zPXtbeyBrZXk6ICdpdGVtJywgbGFiZWw6ICdcdTk4NzlcdTc2RUUnIH0sIHsga2V5OiAnb3duZXInLCBsYWJlbDogJ1x1NjI3Rlx1NjJDNScgfSwgeyBrZXk6ICdhbW91bnQnLCBsYWJlbDogJ1x1OTFEMVx1OTg5RCcgfV19IHJvd3M9e0NPU1RTfSBnZXRSb3dLZXk9eyhyb3cpID0+IHJvdy5pZH0gLz5cbiAgICAgICAgPENvbHVtbiBpZD1cImJ1ZGdldC1tZW1iZXJzXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlcnMtaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVycy1sYWJlbFwiPlx1NTQwQ1x1ODg0Q1x1NEVCQTwvVGV4dD5cbiAgICAgICAgICAgIDxCdXR0b24gaWQ9XCJidWRnZXQtaW52aXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWFjdGlvblwiIG9uQ2xpY2s9eygpID0+IHNldEludml0ZU9wZW4odHJ1ZSl9Plx1OTA4MFx1OEJGNzwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItc3RhY2tcIiBnYXA9ezE0fT5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci1saW5cIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU2Nzk3XHU2NjUzXHU5MUNFXCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU2Nzk3XHU2NjUzXHU5MUNFPC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlclwiIGRhdGEtd2Yta2V5PVwibWVtYmVyLWNoZW5cIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU5NjQ4XHU2OTg2XCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU5NjQ4XHU2OTg2PC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlclwiIGRhdGEtd2Yta2V5PVwibWVtYmVyLXpob3VcIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU1NDY4XHU1Q0I4XCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU1NDY4XHU1Q0I4PC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEJ1dHRvbiBpZD1cImJ1ZGdldC1kb25lXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19kb25lXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY29uZmlybVwiPlx1NEZERFx1NUI1OFx1OTg4NFx1N0I5NzwvQnV0dG9uPlxuICAgICAgICA8TW9kYWxcbiAgICAgICAgICBpZD1cImJ1ZGdldC1pbnZpdGUtbW9kYWxcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLW1vZGFsXCJcbiAgICAgICAgICBvcGVuPXtpbnZpdGVPcGVufVxuICAgICAgICAgIHRpdGxlPVwiXHU5MDgwXHU4QkY3XHU1NDBDXHU4ODRDXHU0RUJBXCJcbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRJbnZpdGVPcGVuKGZhbHNlKX1cbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLXN1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17KCkgPT4gc2V0SW52aXRlT3BlbihmYWxzZSl9Plx1NTNEMVx1OTAwMVx1OTA4MFx1OEJGNzwvQnV0dG9uPn1cbiAgICAgICAgPlxuICAgICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtZmllbGRcIiBsYWJlbD1cIlx1NjI0Qlx1NjczQVx1NTNGN1x1NjIxNlx1NzUyOFx1NjIzN1x1NTQwRFwiIGh0bWxGb3I9XCJidWRnZXQtaW52aXRlLWlucHV0XCI+XG4gICAgICAgICAgICA8VGV4dElucHV0IGlkPVwiYnVkZ2V0LWludml0ZS1pbnB1dFwiIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJcdThGOTNcdTUxNjVcdTU0MENcdTg4NENcdTRFQkFcdTRGRTFcdTYwNkZcIiAvPlxuICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8L01vZGFsPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEdyaWQsXG4gIEhlYWRpbmcsXG4gIEltYWdlUGxhY2Vob2xkZXIsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBST1VURVMgPSBbXG4gIHsgaWQ6ICdyb3V0ZS1jYW5hbCcsIHRpdGxlOiAnXHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5JywgbWV0YTogJ1x1NkI2NVx1ODg0QyA4LjYga20gXHUwMEI3IDYgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1MzAwMVx1Njg2NVx1NEUwQlx1NUUwMlx1OTZDNlx1NEUwRVx1NTA4RFx1NjY1QVx1NkNCM1x1NUNCOCcgfSxcbiAgeyBpZDogJ3JvdXRlLWhpbGxzJywgdGl0bGU6ICdcdTU3Q0VcdTUzMTdcdThGN0JcdTVGOTJcdTZCNjUnLCBtZXRhOiAnXHU1RjkyXHU2QjY1IDExIGttIFx1MDBCNyA3IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTY3OTdcdTk1RjRcdTdGMTNcdTU3NjFcdTMwMDFcdTg5QzJcdTY2NkZcdTUzRjBcdTRFMEVcdTVDNzFcdTgxMUFcdTVDMEZcdTk5ODYnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1sYW5lcycsIHRpdGxlOiAnXHU4MDAxXHU4ODU3XHU2MTYyXHU2RTM4JywgbWV0YTogJ1x1NkI2NVx1ODg0QyA1LjIga20gXHUwMEI3IDQgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NURGN1x1NTNFM1x1NjVFOVx1OTkxMFx1MzAwMVx1NjVFN1x1NEU2Nlx1NUU5N1x1NEUwRVx1NzkzRVx1NTMzQVx1ODJCMVx1NTZFRCcgfSxcbiAgeyBpZDogJ3JvdXRlLWxha2UnLCB0aXRsZTogJ1x1NzNBRlx1NkU1Nlx1OUE5MVx1ODg0Q1x1NTM0QVx1NjVFNScsIG1ldGE6ICdcdTlBOTFcdTg4NEMgMTgga20gXHUwMEI3IDUgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NkU3Rlx1NTczMFx1NjgwOFx1OTA1M1x1MzAwMVx1NTgyNFx1NUNCOFx1NEUwRVx1NjVFNVx1ODQzRFx1NUU3M1x1NTNGMCcgfSxcbiAgeyBpZDogJ3JvdXRlLW11c2V1bScsIHRpdGxlOiAnXHU5NkU4XHU1OTI5XHU1MzVBXHU3MjY5XHU5OTg2XHU3RUJGJywgbWV0YTogJ1x1NTE2Q1x1NEVBNCA0IFx1N0FEOSBcdTAwQjcgNiBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU0RTA5XHU0RTJBXHU1QzU1XHU5OTg2XHU0RTBFXHU0RTAwXHU5NUY0XHU1Qjg5XHU5NzU5XHU1NDk2XHU1NTYxXHU5OTg2JyB9LFxuICB7IGlkOiAncm91dGUtbmlnaHQnLCB0aXRsZTogJ1x1NTkxQ1x1ODI3Mlx1NUVGQVx1N0I1MVx1NjU2M1x1NkI2NScsIG1ldGE6ICdcdTZCNjVcdTg4NEMgNi40IGttIFx1MDBCNyAzIFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTVFN0ZcdTU3M0FcdTMwMDFcdTUyNjdcdTk2NjJcdTRFMEVcdTZDNUZcdThGQjlcdTcwNkZcdTUxNDlcdTVFMjYnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBEaXNjb3ZlclNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cImRpc2NvdmVyLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgZGlzY292ZXJfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImRpc2NvdmVyLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImRpc2NvdmVyLXRpdGxlXCJcbiAgICAgICAgICBzdWJ0aXRsZUlkPVwiZGlzY292ZXItc3VidGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRpc2NvdmVyX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU4RkQ5XHU0RTJBXHU1NDY4XHU2NzJCXHVGRjBDXHU1M0JCXHU1NEVBXHU4RDcwXHU4RDcwXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NEUzQVx1NEY2MFx1NjMxMVx1NEU4Nlx1NTFFMFx1Njc2MVx1NEUwRFx1NzUyOFx1OEQ3Nlx1NjVGNlx1OTVGNFx1NzY4NFx1NTdDRVx1NUUwMlx1OERFRlx1N0VCRlwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBpZD1cImRpc2NvdmVyLW1hcC1hY3Rpb25cIiBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fbWFwLWFjdGlvblwiIHRvPVwiZXhwbG9yZS1tYXBcIj5cdTU3MzBcdTU2RkU8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxDYXJkIGlkPVwiZGlzY292ZXItZmVhdHVyZWRcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmQgZGlzY292ZXJfX2ZlYXR1cmVkXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtaW1hZ2VcIiBoZWlnaHQ9ezE3Nn0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkX19ib2R5IGRpc2NvdmVyX19mZWF0dXJlZC1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndlZWtlbmQtY2hpcC1yb3cgZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtYmFkZ2VcIj5cdTY3MkNcdTU0NjhcdTYzQThcdTgzNTA8L0JhZGdlPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlXCI+XHU5MDAyXHU1NDA4XHU1MjFEXHU2QjIxXHU1MjMwXHU4QkJGPC9CYWRnZT5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLXRpdGxlXCIgbGV2ZWw9ezJ9Plx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1jb3B5XCI+XHU0RUNFXHU2NUU3XHU0RUQzXHU1RTkzXHU1MUZBXHU1M0QxXHVGRjBDXHU2Q0JGXHU2QzM0XHU1Q0I4XHU4RDcwXHU1MjMwXHU2ODY1XHU0RTBCXHU1RTAyXHU5NkM2XHVGRjBDXHU1NzI4XHU2NUU1XHU4NDNEXHU1MjREXHU2MkI1XHU4RkJFXHU2Q0IzXHU2RTdFXHU1RTczXHU1M0YwXHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNhcmQtbWV0YSBkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YVwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+OC42IGttPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+XHU3RUE2IDYgXHU1QzBGXHU2NUY2PC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+XHU4RjdCXHU2NzdFPC9UZXh0PlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPEhlYWRpbmcgaWQ9XCJkaXNjb3Zlci1yb3V0ZXMtdGl0bGVcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXNlY3Rpb24taGVhZGluZyBkaXNjb3Zlcl9fcm91dGVzLXRpdGxlXCIgbGV2ZWw9ezJ9Plx1NjZGNFx1NTkxQVx1OERFRlx1N0VCRjwvSGVhZGluZz5cbiAgICAgICAgPEdyaWQgaWQ9XCJkaXNjb3Zlci1yb3V0ZXNcIiBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGVzXCIgY29sdW1ucz17MX0gZ2FwPXsxNH0+XG4gICAgICAgICAge1JPVVRFUy5tYXAoKHJvdXRlLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkIGRpc2NvdmVyX19yb3V0ZS1jYXJkXCIgZGF0YS13Zi1rZXk9e3JvdXRlLmlkfSBrZXk9e3JvdXRlLmlkfSB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGUtaW1hZ2VcIiBoZWlnaHQ9e2luZGV4ICUgMiA9PT0gMCA/IDExNiA6IDEzNn0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZF9fYm9keSBkaXNjb3Zlcl9fcm91dGUtYm9keVwiIGdhcD17N30+XG4gICAgICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLXRpdGxlXCIgbGV2ZWw9ezN9Pntyb3V0ZS50aXRsZX08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLW1ldGFcIj57cm91dGUubWV0YX08L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLW5vdGVcIj57cm91dGUubm90ZX08L1RleHQ+XG4gICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgImltcG9ydCB7IFdpcmVNYXAgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBTaGFuZ2hhaU1hcCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPFdpcmVNYXAgY2xhc3NOYW1lPXtgc2hhbmdoYWktbWFwICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9XaXJlTWFwPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBNYXBNYXJrZXIsXG4gIE1hcE92ZXJsYXksXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgU2hhbmdoYWlNYXAgfSBmcm9tICcuLi9jb21wb25lbnRzL1NoYW5naGFpTWFwLmpzeCdcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIEV4cGxvcmVNYXBTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJleHBsb3JlLW1hcC1wYWdlXCIgZ2FwPXsxNn0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGV4cGxvcmUtbWFwX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJleHBsb3JlLW1hcC1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJleHBsb3JlLW1hcC10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTc2RUVcdTc2ODRcdTU3MzBcdTU3MzBcdTU2RkVcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU4RjdCXHU4OUU2XHU2ODA3XHU4QkIwXHU2N0U1XHU3NzBCXHU2M0E4XHU4MzUwXHU4REVGXHU3RUJGXCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19iYWNrXCIgdG89XCJkaXNjb3ZlclwiPlx1NTIxN1x1ODg2ODwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPFJvdyBpZD1cImV4cGxvcmUtbWFwLWZpbHRlcnNcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IGV4cGxvcmUtbWFwX19maWx0ZXJzXCIgZ2FwPXs4fT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1NTE2OFx1OTBFODwvQmFkZ2U+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTZCNjVcdTg4NEM8L0JhZGdlPlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU5QTkxXHU4ODRDPC9CYWRnZT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1NUJBNFx1NTE4NTwvQmFkZ2U+XG4gICAgICAgIDwvUm93PlxuICAgICAgICA8U2hhbmdoYWlNYXAgaWQ9XCJleHBsb3JlLW1hcC1jYW52YXNcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLW1hcCBleHBsb3JlLW1hcF9fY2FudmFzXCI+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXItc3V6aG91LWNyZWVrXCIgeD17NTF9IHk9ezQwfSBsYWJlbD1cIlx1ODJDRlx1NURERVx1NkNCM1x1NkVFOFx1NkMzNFx1NkYyQlx1NkI2NVwiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci1idW5kXCIgeD17NjJ9IHk9ezQ3fSBsYWJlbD1cIlx1NTkxNlx1NkVFOVx1NUVGQVx1N0I1MVx1NkYyQlx1NkUzOFwiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci14dWh1aVwiIHg9ezQ5fSB5PXs1NX0gbGFiZWw9XCJcdTg4NjFcdTU5MERcdTk4Q0VcdThDOENcdTlBOTFcdTg4NENcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXItcHVkb25nXCIgeD17NzV9IHk9ezQzfSBsYWJlbD1cIlx1OTY0Nlx1NUJCNlx1NTYzNFx1NTdDRVx1NUUwMlx1NkYyQlx1NkI2NVwiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwT3ZlcmxheSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fb3ZlcmxheVwiIHBvc2l0aW9uPVwiYm90dG9tXCI+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcm91dGUtcHJldmlld1wiIHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctZXllYnJvd1wiPlx1OERERFx1NzlCQlx1NEY2MCAyLjQga208L1RleHQ+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy10aXRsZVwiPlx1ODJDRlx1NURERVx1NkNCM1x1NkVFOFx1NkMzNFx1NkYyQlx1NkI2NTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LW1ldGFcIj44LjYga20gXHUwMEI3IFx1N0VBNiA2IFx1NUMwRlx1NjVGNiBcdTAwQjcgXHU4RjdCXHU2NzdFPC9UZXh0PlxuICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICA8L01hcE92ZXJsYXk+XG4gICAgICAgIDwvU2hhbmdoYWlNYXA+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBTdGVwcyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBFVkVOVFMgPSBbXG4gIHsgaWQ6ICdldmVudC1tZWV0JywgdGltZTogJzA5OjEwJywgdGl0bGU6ICdcdTU3MzBcdTk0QzFcdTUzRTNcdTk2QzZcdTU0MDgnLCBub3RlOiAnXHU0RUNFIDMgXHU1M0Y3XHU1M0UzXHU2QjY1XHU4ODRDXHU3RUE2IDggXHU1MjA2XHU5NDlGXHU1MjMwXHU4REVGXHU3RUJGXHU4RDc3XHU3MEI5XHUzMDAyJywgdGFnOiAnXHU5NkM2XHU1NDA4JyB9LFxuICB7IGlkOiAnZXZlbnQtd2FyZWhvdXNlJywgdGltZTogJzA5OjMwJywgdGl0bGU6ICdcdTY1RTdcdTRFRDNcdTVFOTNcdTVDNTVcdTUzODUnLCBub3RlOiAnXHU3NzBCXHU1RTM4XHU4QkJFXHU1QzU1XHU0RTBFXHU1QzRCXHU5ODc2XHU3RUQzXHU2Nzg0XHVGRjBDXHU1MTY1XHU1M0UzXHU1OTA0XHU1M0VGXHU1QkM0XHU1QjU4XHU4MENDXHU1MzA1XHUzMDAyJywgdGFnOiAnXHU1M0MyXHU4OUMyJyB9LFxuICB7IGlkOiAnZXZlbnQtbWFya2V0JywgdGltZTogJzExOjAwJywgdGl0bGU6ICdcdTY4NjVcdTRFMEJcdTU0NjhcdTY3MkJcdTVFMDJcdTk2QzYnLCBub3RlOiAnXHU1MTQ4XHU5MDFCXHU2MjRCXHU0RjVDXHU2NDRBXHU0RjREXHVGRjBDXHU1MThEXHU1NzI4XHU0RTFDXHU0RkE3XHU5OTEwXHU4RjY2XHU1MzNBXHU3QjgwXHU1MzU1XHU1MzQ4XHU5OTEwXHUzMDAyJywgdGFnOiAnXHU1RTAyXHU5NkM2JyB9LFxuICB7IGlkOiAnZXZlbnQtbHVuY2gnLCB0aW1lOiAnMTM6MDAnLCB0aXRsZTogJ1x1NkMzNFx1NUNCOFx1NUMwRlx1OTk4Nlx1NTM0OFx1OTkxMCcsIG5vdGU6ICdcdTk4ODRcdThCQTFcdTc1MjhcdTk5MTAgNzAgXHU1MjA2XHU5NDlGXHVGRjBDXHU5NzYwXHU3QTk3XHU1MzNBXHU1N0RGXHU2NUUwXHU5NzAwXHU5ODg0XHU3RUE2XHUzMDAyJywgdGFnOiAnXHU3NTI4XHU5OTEwJyB9LFxuICB7IGlkOiAnZXZlbnQtbGFuZXMnLCB0aW1lOiAnMTQ6MjAnLCB0aXRsZTogJ1x1NkMzNFx1NUNCOFx1NUMwRlx1NURGN1x1NjU2M1x1NkI2NScsIG5vdGU6ICdcdTZDQkZcdTc3RjNcdTk2MzZcdThGREJcdTUxNjVcdTY1RTdcdTg4NTdcdTUzM0FcdUZGMENcdTdFQ0ZcdThGQzdcdTRFNjZcdTVFOTdcdTU0OENcdTUxNkNcdTUxNzFcdTZEMTdcdTg4NjNcdTYyM0ZcdTMwMDInLCB0YWc6ICdcdTZCNjVcdTg4NEMnIH0sXG4gIHsgaWQ6ICdldmVudC1nYXJkZW4nLCB0aW1lOiAnMTU6MjAnLCB0aXRsZTogJ1x1NzkzRVx1NTMzQVx1ODJCMVx1NTZFRFx1NEYxMVx1NjA2RicsIG5vdGU6ICdcdTg4NjVcdTZDMzRcdTVFNzZcdTY1NzRcdTc0MDZcdTk2OEZcdThFQUJcdTcyNjlcdTU0QzFcdUZGMENcdTgyQjFcdTU2RURcdTUzMTdcdTk1RThcdTY3MDlcdTUxNkNcdTUxNzFcdThCQkVcdTY1QkRcdTMwMDInLCB0YWc6ICdcdTRGMTFcdTYwNkYnIH0sXG4gIHsgaWQ6ICdldmVudC1zdW5zZXQnLCB0aW1lOiAnMTc6MTAnLCB0aXRsZTogJ1x1NkNCM1x1NkU3RVx1NjVFNVx1ODQzRFx1NUU3M1x1NTNGMCcsIG5vdGU6ICdcdThERUZcdTdFQkZcdTdFQzhcdTcwQjlcdUZGMENcdTUzRUZcdTdFRTdcdTdFRURcdTZDQkZcdTU4MjRcdTVDQjhcdTZCNjVcdTg4NENcdTgxRjNcdTY2NUFcdTk5MTBcdTUzM0FcdTU3REZcdTMwMDInLCB0YWc6ICdcdTg5QzJcdTY2NkYnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBJdGluZXJhcnlTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJpdGluZXJhcnktcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBpdGluZXJhcnlfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cIml0aW5lcmFyeS1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJpdGluZXJhcnktdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NkJDRlx1NjVFNVx1ODg0Q1x1N0EwQlwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTU0NjhcdTUxNkQgXHUwMEI3IFx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOVwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2JhY2tcIiB0bz1cInJvdXRlLWRldGFpbFwiPlx1OERFRlx1N0VCRjwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPFN0ZXBzXG4gICAgICAgICAgaWQ9XCJpdGluZXJhcnktcHJvZ3Jlc3NcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcHJvZ3Jlc3NcIlxuICAgICAgICAgIGN1cnJlbnQ9ezF9XG4gICAgICAgICAgaXRlbXM9e1t7IGlkOiAnbW9ybmluZycsIGxhYmVsOiAnXHU0RTBBXHU1MzQ4JyB9LCB7IGlkOiAnYWZ0ZXJub29uJywgbGFiZWw6ICdcdTRFMEJcdTUzNDgnIH0sIHsgaWQ6ICdldmVuaW5nJywgbGFiZWw6ICdcdTUwOERcdTY2NUEnIH1dfVxuICAgICAgICAvPlxuICAgICAgICA8Q29sdW1uIGlkPVwiaXRpbmVyYXJ5LWV2ZW50c1wiIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnRzXCIgZ2FwPXsxNH0+XG4gICAgICAgICAge0VWRU5UUy5tYXAoKGV2ZW50KSA9PiAoXG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnRcIiBkYXRhLXdmLWtleT17ZXZlbnQuaWR9IGtleT17ZXZlbnQuaWR9IGdhcD17MTB9IGFsaWduSXRlbXM9XCJmbGV4LXN0YXJ0XCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fdGltZVwiPntldmVudC50aW1lfTwvVGV4dD5cbiAgICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1jYXJkXCI+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWJvZHlcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC10aXRsZVwiIGxldmVsPXszfT57ZXZlbnQudGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1iYWRnZVwiPntldmVudC50YWd9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1ub3RlXCI+e2V2ZW50Lm5vdGV9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDYXJkIGlkPVwiaXRpbmVyYXJ5LXJlbWluZGVyXCIgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19yZW1pbmRlclwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19yZW1pbmRlci1ib2R5XCIgZ2FwPXs2fT5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19yZW1pbmRlci10aXRsZVwiPlx1NTFGQVx1NTNEMVx1NjNEMFx1OTE5Mjwvc3Ryb25nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19yZW1pbmRlci1jb3B5XCI+XHU1RUZBXHU4QkFFXHU2NDNBXHU1RTI2XHU5OTZFXHU3NTI4XHU2QzM0XHUzMDAxXHU4RjdCXHU0RkJGXHU5NkU4XHU1MTc3XHU1NDhDXHU1M0VGXHU5MUNEXHU1OTBEXHU0RjdGXHU3NTI4XHU3Njg0XHU4RDJEXHU3MjY5XHU4ODhCXHUzMDAyPC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJpdGluZXJhcnktY3JlYXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fY3JlYXRlLWFjdGlvblwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJ0cmlwLWNyZWF0ZVwiPlx1NTIxQlx1NUVGQVx1NjIxMVx1NzY4NFx1NzI0OFx1NjcyQzwvQnV0dG9uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBIZWFkaW5nLFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIExvZ2luU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxDb2x1bW4gaWQ9XCJsb2dpbi1wYWdlXCIgZ2FwPXsyMH0gY2xhc3NOYW1lPVwid2Vla2VuZC1sb2dpbiBsb2dpbl9fcGFnZVwiPlxuICAgICAgPHNwYW4gaWQ9XCJsb2dpbi1sb2dvXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1sb2dvLXBsYWNlaG9sZGVyIGxvZ2luX19sb2dvXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwibG9naW5fX2ludHJvXCIgZ2FwPXs4fT5cbiAgICAgICAgPEhlYWRpbmcgaWQ9XCJsb2dpbi10aXRsZVwiIGNsYXNzTmFtZT1cImxvZ2luX190aXRsZVwiIGxldmVsPXsxfT5cdTU0NjhcdTY3MkJcdTUxRkFcdTUzRDE8L0hlYWRpbmc+XG4gICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImxvZ2luX19kZXNjcmlwdGlvblwiPlx1NjI4QVx1NjBGM1x1NTNCQlx1NzY4NFx1NTczMFx1NjVCOVx1RkYwQ1x1NTNEOFx1NjIxMFx1NEUwMFx1NEVGRFx1OTY4Rlx1NjVGNlx1ODBGRFx1OEQ3MFx1NzY4NFx1ODg0Q1x1N0EwQlx1MzAwMjwvVGV4dD5cbiAgICAgIDwvQ29sdW1uPlxuICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJsb2dpbl9fcGhvbmUtZmllbGRcIiBsYWJlbD1cIlx1NjI0Qlx1NjczQVx1NTNGN1wiIGh0bWxGb3I9XCJsb2dpbi1waG9uZVwiPlxuICAgICAgICA8VGV4dElucHV0IGlkPVwibG9naW4tcGhvbmVcIiBjbGFzc05hbWU9XCJsb2dpbl9fcGhvbmUtaW5wdXRcIiBpbnB1dE1vZGU9XCJ0ZWxcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1NjI0Qlx1NjczQVx1NTNGN1wiIC8+XG4gICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwibG9naW5fX2NvZGUtZmllbGRcIiBsYWJlbD1cIlx1OUE4Q1x1OEJDMVx1NzgwMVwiIGh0bWxGb3I9XCJsb2dpbi1jb2RlXCIgaGludD1cIlx1NkYxNFx1NzkzQVx1NzNBRlx1NTg4M1x1NTNFRlx1OEY5M1x1NTE2NVx1NEVGQlx1NjEwRiA2IFx1NEY0RFx1NjU3MFx1NUI1N1wiPlxuICAgICAgICA8VGV4dElucHV0IGlkPVwibG9naW4tY29kZVwiIGNsYXNzTmFtZT1cImxvZ2luX19jb2RlLWlucHV0XCIgaW5wdXRNb2RlPVwibnVtZXJpY1wiIHBsYWNlaG9sZGVyPVwiXHU4QkY3XHU4RjkzXHU1MTY1XHU5QThDXHU4QkMxXHU3ODAxXCIgLz5cbiAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgPEJ1dHRvbiBpZD1cImxvZ2luLXN1Ym1pdFwiIGNsYXNzTmFtZT1cImxvZ2luX19zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwiZGlzY292ZXJcIj5cdTVGMDBcdTU5Q0JcdTYzQTJcdTdEMjI8L0J1dHRvbj5cbiAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImxvZ2luX19hZ3JlZW1lbnRcIiBhcz1cInNtYWxsXCI+XHU3RUU3XHU3RUVEXHU1MzczXHU4ODY4XHU3OTNBXHU1NDBDXHU2MTBGXHU2NzBEXHU1MkExXHU2NzYxXHU2QjNFXHU0RTBFXHU5NjkwXHU3OUMxXHU4QkY0XHU2NjBFXHUzMDAyPC9UZXh0PlxuICAgIDwvQ29sdW1uPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQXZhdGFyLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVG9nZ2xlLFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBQcm9maWxlU2NyZWVuKCkge1xuICBjb25zdCBbbm90aWZpY2F0aW9ucywgc2V0Tm90aWZpY2F0aW9uc10gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbb2ZmbGluZU1hcHMsIHNldE9mZmxpbmVNYXBzXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1wYWdlXCIgZ2FwPXsyMH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHByb2ZpbGVfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJwcm9maWxlLWhlYWRlclwiIHRpdGxlSWQ9XCJwcm9maWxlLXRpdGxlXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9faGVhZGVyXCIgdGl0bGU9XCJcdTYyMTFcdTc2ODRcIiBzdWJ0aXRsZT1cIlx1NEUyQVx1NEVCQVx1NTA0Rlx1NTk3RFx1NEUwRVx1NjVDNVx1ODg0Q1x1OEJCRVx1N0Y2RVwiIC8+XG4gICAgICAgIDxSb3cgaWQ9XCJwcm9maWxlLXN1bW1hcnlcIiBjbGFzc05hbWU9XCJwcm9maWxlX19zdW1tYXJ5XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgIDxBdmF0YXIgY2xhc3NOYW1lPVwicHJvZmlsZV9fYXZhdGFyXCIgc2l6ZT17NTh9IGxhYmVsPVwiXHU3NTI4XHU2MjM3XHU1OTM0XHU1MENGXHU1MzYwXHU0RjREXCIgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb2ZpbGVfX2lkZW50aXR5XCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInByb2ZpbGVfX25hbWVcIj5cdTY3OTdcdTY2NTNcdTkxQ0U8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInByb2ZpbGVfX2Jpb1wiPlx1NURGMlx1OEQ3MFx1OEZDNyAxMiBcdTVFQTdcdTU3Q0VcdTVFMDI8L1RleHQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvUm93PlxuICAgICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1hY2NvdW50XCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fYWNjb3VudFwiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fYWNjb3VudC1jZWxsXCIgdGl0bGU9XCJcdTY1QzVcdTg4NENcdTY4NjNcdTY4NDhcIiBzdWJ0aXRsZT1cIlx1NTA0Rlx1NTk3RFx1MzAwMVx1OERCM1x1OEZGOVx1NEUwRVx1NjUzNlx1ODVDRlwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fYWNjb3VudC1jZWxsXCIgdGl0bGU9XCJcdTU0MENcdTg4NENcdTRFQkFcIiBzdWJ0aXRsZT1cIjMgXHU0RjREXHU1RTM4XHU3NTI4XHU1NDBDXHU4ODRDXHU0RUJBXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50LWNlbGxcIiB0aXRsZT1cIlx1N0QyN1x1NjAyNVx1ODA1NFx1N0NGQlx1NEVCQVwiIHN1YnRpdGxlPVwiXHU1REYyXHU4QkJFXHU3RjZFXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLXNldHRpbmdzXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZ3NcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1sYWJlbFwiPlx1ODg0Q1x1N0EwQlx1NjNEMFx1OTE5MjwvVGV4dD5cbiAgICAgICAgICAgIDxUb2dnbGUgaWQ9XCJwcm9maWxlLW5vdGlmaWNhdGlvbnNcIiBjbGFzc05hbWU9XCJwcm9maWxlX19ub3RpZmljYXRpb25zXCIgY2hlY2tlZD17bm90aWZpY2F0aW9uc30gb25DaGFuZ2U9e3NldE5vdGlmaWNhdGlvbnN9IC8+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctbGFiZWxcIj5cdTgxRUFcdTUyQThcdTRFMEJcdThGN0RcdTc5QkJcdTdFQkZcdTU3MzBcdTU2RkU8L1RleHQ+XG4gICAgICAgICAgICA8VG9nZ2xlIGlkPVwicHJvZmlsZS1vZmZsaW5lLW1hcHNcIiBjbGFzc05hbWU9XCJwcm9maWxlX19vZmZsaW5lLW1hcHNcIiBjaGVja2VkPXtvZmZsaW5lTWFwc30gb25DaGFuZ2U9e3NldE9mZmxpbmVNYXBzfSAvPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtc3VwcG9ydFwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnRcIiBnYXA9ezB9PlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnQtY2VsbFwiIHRpdGxlPVwiXHU1RTJFXHU1MkE5XHU0RTBFXHU1M0NEXHU5OTg4XCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0LWNlbGxcIiB0aXRsZT1cIlx1OTY5MFx1NzlDMVx1OEJCRVx1N0Y2RVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydC1jZWxsXCIgdGl0bGU9XCJcdTUxNzNcdTRFOEVcdTU0NjhcdTY3MkJcdTUxRkFcdTUzRDFcIiB2YWx1ZT1cIjEuMFwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnJlYWRjcnVtYnMsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ2VsbCxcbiAgQ29sdW1uLFxuICBHcmlkLFxuICBIZWFkaW5nLFxuICBJbWFnZVBsYWNlaG9sZGVyLFxuICBSb3csXG4gIFRhYnMsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgU1RPUFMgPSBbXG4gIHsgaWQ6ICdzdG9wLXdhcmVob3VzZScsIHRpdGxlOiAnXHU2NUU3XHU0RUQzXHU1RTkzXHU1QzU1XHU1Mzg1Jywgc3VidGl0bGU6ICcwOTozMCBcdTAwQjcgXHU1RUZBXHU4QkFFXHU1MDVDXHU3NTU5IDYwIFx1NTIwNlx1OTQ5RicgfSxcbiAgeyBpZDogJ3N0b3AtYnJpZGdlJywgdGl0bGU6ICdcdTY4NjVcdTRFMEJcdTU0NjhcdTY3MkJcdTVFMDJcdTk2QzYnLCBzdWJ0aXRsZTogJzExOjAwIFx1MDBCNyBcdTVFRkFcdThCQUVcdTUwNUNcdTc1NTkgOTAgXHU1MjA2XHU5NDlGJyB9LFxuICB7IGlkOiAnc3RvcC1sYW5lJywgdGl0bGU6ICdcdTZDMzRcdTVDQjhcdTVDMEZcdTVERjcnLCBzdWJ0aXRsZTogJzEzOjMwIFx1MDBCNyBcdTUzNDhcdTk5MTBcdTRFMEVcdTg4NTdcdTUzM0FcdTY1NjNcdTZCNjUnIH0sXG4gIHsgaWQ6ICdzdG9wLWdhcmRlbicsIHRpdGxlOiAnXHU3OTNFXHU1MzNBXHU4MkIxXHU1NkVEJywgc3VidGl0bGU6ICcxNToyMCBcdTAwQjcgXHU1RUZBXHU4QkFFXHU1MDVDXHU3NTU5IDQ1IFx1NTIwNlx1OTQ5RicgfSxcbiAgeyBpZDogJ3N0b3AtYmVuZCcsIHRpdGxlOiAnXHU2Q0IzXHU2RTdFXHU2NUU1XHU4NDNEXHU1RTczXHU1M0YwJywgc3VidGl0bGU6ICcxNzoxMCBcdTAwQjcgXHU4REVGXHU3RUJGXHU3RUM4XHU3MEI5JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gUm91dGVEZXRhaWxTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgnb3ZlcnZpZXcnKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2Ugcm91dGUtZGV0YWlsX19wYWdlXCI+XG4gICAgICAgIDxCcmVhZGNydW1icyBpZD1cInJvdXRlLWRldGFpbC1icmVhZGNydW1ic1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYnJlYWRjcnVtYnNcIiBpdGVtcz17W3sgbGFiZWw6ICdcdTUzRDFcdTczQjAnLCB0bzogJ2Rpc2NvdmVyJyB9LCB7IGxhYmVsOiAnXHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5JyB9XX0gLz5cbiAgICAgICAgPEltYWdlUGxhY2Vob2xkZXIgaWQ9XCJyb3V0ZS1kZXRhaWwtaGVyb1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9faGVyb1wiIGhlaWdodD17MjI0fSBib3JkZXJSYWRpdXM9ezB9IC8+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtc3VtbWFyeVwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fc3VtbWFyeVwiIGdhcD17MTB9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid2Vla2VuZC1jaGlwLXJvdyByb3V0ZS1kZXRhaWxfX2JhZGdlc1wiIGdhcD17OH0+XG4gICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19iYWRnZVwiPlx1NTdDRVx1NUUwMlx1NkYyQlx1NkI2NTwvQmFkZ2U+XG4gICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19iYWRnZVwiPlx1OEY3Qlx1Njc3RTwvQmFkZ2U+XG4gICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19iYWRnZVwiPlx1NTNFRlx1NUUyNlx1NUJBMFx1NzI2OTwvQmFkZ2U+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPEhlYWRpbmcgaWQ9XCJyb3V0ZS1kZXRhaWwtdGl0bGVcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3RpdGxlXCIgbGV2ZWw9ezF9Plx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOTwvSGVhZGluZz5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ludHJvXCI+XHU0RTAwXHU2NzYxXHU0RUNFXHU1REU1XHU0RTFBXHU5MDU3XHU1QjU4XHU4RDcwXHU1NDExXHU3NTFGXHU2RDNCXHU4ODU3XHU1MzNBXHU3Njg0XHU2QzM0XHU1Q0I4XHU4REVGXHU3RUJGXHUzMDAyXHU0RTBBXHU1MzQ4XHU3NzBCXHU1QzU1XHVGRjBDXHU0RTJEXHU1MzQ4XHU5MDFCXHU1RTAyXHU5NkM2XHVGRjBDXHU1MDhEXHU2NjVBXHU1NzI4XHU2Q0IzXHU2RTdFXHU3QjQ5XHU2NUU1XHU4NDNEXHUzMDAyPC9UZXh0PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEdyaWQgaWQ9XCJyb3V0ZS1kZXRhaWwtZmFjdHNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3RzXCIgY29sdW1ucz17M30gZ2FwPXs4fT5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3RcIj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtdmFsdWVcIj44LjYga208L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LWxhYmVsXCI+XHU2MDNCXHU4REVGXHU3QTBCPC9zcGFuPjwvQ2FyZD5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3RcIj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtdmFsdWVcIj42IFx1NUMwRlx1NjVGNjwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtbGFiZWxcIj5cdTVFRkFcdThCQUVcdTY1RjZcdTk1N0Y8L3NwYW4+PC9DYXJkPlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdFwiPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC12YWx1ZVwiPjUgXHU3QUQ5PC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC1sYWJlbFwiPlx1OERFRlx1N0VCRlx1ODI4Mlx1NzBCOTwvc3Bhbj48L0NhcmQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgICAgPFRhYnMgaWQ9XCJyb3V0ZS1kZXRhaWwtdGFic1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fdGFic1wiIGFjdGl2ZUlkPXt0YWJ9IG9uQ2hhbmdlPXtzZXRUYWJ9IGl0ZW1zPXtbeyBpZDogJ292ZXJ2aWV3JywgbGFiZWw6ICdcdThERUZcdTdFQkZcdTY5ODJcdTg5QzgnIH0sIHsgaWQ6ICdub3RlcycsIGxhYmVsOiAnXHU1MUZBXHU1M0QxXHU5ODdCXHU3N0U1JyB9XX0gLz5cbiAgICAgICAge3RhYiA9PT0gJ292ZXJ2aWV3JyA/IChcbiAgICAgICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLXN0b3BzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19zdG9wc1wiIGdhcD17MH0+XG4gICAgICAgICAgICB7U1RPUFMubWFwKChzdG9wLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3N0b3BcIiBkYXRhLXdmLWtleT17c3RvcC5pZH0ga2V5PXtzdG9wLmlkfSB0aXRsZT17YCR7aW5kZXggKyAxfS4gJHtzdG9wLnRpdGxlfWB9IHN1YnRpdGxlPXtzdG9wLnN1YnRpdGxlfSB2YWx1ZT17YCR7aW5kZXggKyAxfWB9IC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8Q2FyZCBpZD1cInJvdXRlLWRldGFpbC1ub3Rlc1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZXNcIj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3Rlcy1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZVwiPlx1NkNCRlx1OTAxNFx1NTkyN1x1OTBFOFx1NTIwNlx1OERFRlx1NkJCNVx1NjcwOVx1NjgxMVx1ODM2Qlx1RkYwQ1x1NkNCM1x1NkU3RVx1NTMzQVx1NTdERlx1NEUwQlx1NTM0OFx1NjVFNVx1NzE2N1x1OEY4M1x1NUYzQVx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3RlXCI+XHU2NUU3XHU0RUQzXHU1RTkzXHU1NDY4XHU0RTAwXHU5NUVEXHU5OTg2XHVGRjBDXHU1NDY4XHU2NzJCXHU1RUZBXHU4QkFFXHU2M0QwXHU1MjREXHU5ODg0XHU3RUE2XHU1MTY1XHU1NzNBXHU2NUY2XHU2QkI1XHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVcIj5cdThERUZcdTdFQkZcdTdFQzhcdTcwQjlcdThERERcdTc5QkJcdTU3MzBcdTk0QzFcdTdBRDlcdTdFQTYgOTAwIFx1N0M3M1x1RkYwQ1x1NEU1Rlx1NTNFRlx1NEU1OFx1NTc1MFx1NzkzRVx1NTMzQVx1NjNBNVx1OUE3M1x1OEY2Nlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgKX1cbiAgICAgICAgPENhcmQgaWQ9XCJyb3V0ZS1kZXRhaWwtZ3VpZGVcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2d1aWRlXCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2d1aWRlLWJvZHlcIiBnYXA9ezh9PlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZS10aXRsZVwiIGxldmVsPXszfT5cdThERUZcdTdFQkZcdTdCNTZcdTUyMTJcdTRFQkE8L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2d1aWRlLWNvcHlcIj5cdTY3OTdcdTVDN0YgXHUwMEI3IFx1NTdDRVx1NUUwMlx1NkI2NVx1ODg0Q1x1OEJCMFx1NUY1NVx1ODAwNVx1RkYwQ1x1NURGMlx1NTNEMVx1NUUwMyAxOCBcdTY3NjFcdTZDMzRcdTVDQjhcdThERUZcdTdFQkZcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1hY3Rpb25zXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19hY3Rpb25zXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEJ1dHRvbiBpZD1cInJvdXRlLWRldGFpbC1pdGluZXJhcnktYWN0aW9uXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19pdGluZXJhcnktYWN0aW9uXCIgdG89XCJpdGluZXJhcnlcIj5cdTY3RTVcdTc3MEJcdTVCOENcdTY1NzRcdTY1RTVcdTdBMEI8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIGlkPVwicm91dGUtZGV0YWlsLWNyZWF0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2NyZWF0ZS1hY3Rpb25cIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwidHJpcC1jcmVhdGVcIj5cdTc1MjhcdThGRDlcdTY3NjFcdThERUZcdTdFQkZcdTUyMUJcdTVFRkFcdTg4NENcdTdBMEI8L0J1dHRvbj5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgQ29uZmlybURpYWxvZyxcbiAgTG9hZGluZ092ZXJsYXksXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgU3RlcHMsXG4gIFRleHQsXG4gIFRvYXN0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBUcmlwQ29uZmlybVNjcmVlbigpIHtcbiAgY29uc3QgW2NvbmZpcm1PcGVuLCBzZXRDb25maXJtT3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzYXZlZCwgc2V0U2F2ZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3Qgc3VibWl0VHJpcCA9ICgpID0+IHtcbiAgICBzZXRDb25maXJtT3BlbihmYWxzZSlcbiAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICAgIHNldFNhdmVkKHRydWUpXG4gICAgfSwgNzAwKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInRyaXAtY29uZmlybS1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHRyaXAtY29uZmlybV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cInRyaXAtY29uZmlybS1oZWFkZXJcIiB0aXRsZUlkPVwidHJpcC1jb25maXJtLXRpdGxlXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19oZWFkZXJcIiB0aXRsZT1cIlx1Nzg2RVx1OEJBNFx1ODg0Q1x1N0EwQlwiIHN1YnRpdGxlPVwiXHU2OEMwXHU2N0U1XHU0RkUxXHU2MDZGXHU1NDBFXHU0RkREXHU1QjU4XHU1MjMwXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCXCIgLz5cbiAgICAgICAgPFN0ZXBzIGlkPVwidHJpcC1jb25maXJtLXN0ZXBzXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdGVwc1wiIGN1cnJlbnQ9ezJ9IGl0ZW1zPXtbeyBpZDogJ2Jhc2ljJywgbGFiZWw6ICdcdTU3RkFcdTY3MkNcdTRGRTFcdTYwNkYnIH0sIHsgaWQ6ICdidWRnZXQnLCBsYWJlbDogJ1x1OTg4NFx1N0I5NycgfSwgeyBpZDogJ2NvbmZpcm0nLCBsYWJlbDogJ1x1Nzg2RVx1OEJBNCcgfV19IC8+XG4gICAgICAgIDxDYXJkIGlkPVwidHJpcC1jb25maXJtLXN1bW1hcnlcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1bW1hcnlcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VtbWFyeS1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VtbWFyeS1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX190cmlwLW5hbWVcIj5cdTU0NjhcdTUxNkRcdThGRDBcdTZDQjNcdTY1NjNcdTZCNjU8L3N0cm9uZz5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3RhdHVzXCI+XHU1Rjg1XHU0RkREXHU1QjU4PC9CYWRnZT5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kYXRlXCI+MjAyNiBcdTVFNzQgOCBcdTY3MDggMTUgXHU2NUU1IFx1MDBCNyBcdTU0NjhcdTUxNkQ8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3JvdXRlXCI+XHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5IFx1MDBCNyA4LjYga20gXHUwMEI3IFx1N0VBNiA2IFx1NUMwRlx1NjVGNjwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jb25maXJtLWRldGFpbHNcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbHNcIiBnYXA9ezB9PlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTk2QzZcdTU0MDhcdTU3MzBcdTcwQjlcIiBzdWJ0aXRsZT1cIlx1OEZEMFx1NkNCM1x1OERFRlx1NTczMFx1OTRDMVx1N0FEOSAzIFx1NTNGN1x1NTNFM1wiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1ODg0Q1x1N0EwQlx1ODI4Mlx1NTk0RlwiIHZhbHVlPVwiXHU4RjdCXHU2NzdFXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU1NDBDXHU4ODRDXHU0RUJBXHU2NTcwXCIgdmFsdWU9XCIzIFx1NEVCQVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1NTFGQVx1NTNEMVx1NjNEMFx1OTE5MlwiIHZhbHVlPVwiXHU1REYyXHU1RjAwXHU1NDJGXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDYXJkIGlkPVwidHJpcC1jb25maXJtLWJ1ZGdldFwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0XCIgdG89XCJidWRnZXRcIj5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LWJvZHlcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LWNvcHlcIiBnYXA9ezV9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1sYWJlbFwiPlx1OTg4NFx1OEJBMVx1NjAzQlx1OEQzOVx1NzUyODwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtbm90ZVwiPlx1NjdFNVx1NzcwQlx1NjYwRVx1N0VDNlx1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQTwvVGV4dD5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX190b3RhbFwiPjQyOCBcdTUxNDM8L3NwYW4+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY29uZmlybS1hY3Rpb25zXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19hY3Rpb25zXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEJ1dHRvbiBpZD1cInRyaXAtY29uZmlybS1zdWJtaXRcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17KCkgPT4gc2V0Q29uZmlybU9wZW4odHJ1ZSl9Plx1Nzg2RVx1OEJBNFx1NUU3Nlx1NEZERFx1NUI1ODwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX190cmlwcy1hY3Rpb25cIiB0bz1cInRyaXBzXCI+XHU2N0U1XHU3NzBCXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCPC9CdXR0b24+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q29uZmlybURpYWxvZ1xuICAgICAgICAgIGlkPVwidHJpcC1jb25maXJtLWRpYWxvZ1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kaWFsb2dcIlxuICAgICAgICAgIG9wZW49e2NvbmZpcm1PcGVufVxuICAgICAgICAgIHRpdGxlPVwiXHU0RkREXHU1QjU4XHU4RkQ5XHU0RUZEXHU4ODRDXHU3QTBCXHVGRjFGXCJcbiAgICAgICAgICBtZXNzYWdlPVwiXHU0RkREXHU1QjU4XHU1NDBFXHU0RjFBXHU1NDBDXHU2QjY1XHU3RUQ5XHU1REYyXHU1MkEwXHU1MTY1XHU3Njg0XHU1NDBDXHU4ODRDXHU0RUJBXHVGRjBDXHU1RTc2XHU1NzI4XHU1MUZBXHU1M0QxXHU1MjREXHU1M0QxXHU5MDAxXHU2M0QwXHU5MTkyXHUzMDAyXCJcbiAgICAgICAgICBjb25maXJtTGFiZWw9XCJcdTc4NkVcdThCQTRcdTRGRERcdTVCNThcIlxuICAgICAgICAgIG9uQ29uZmlybT17c3VibWl0VHJpcH1cbiAgICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0Q29uZmlybU9wZW4oZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgICA8TG9hZGluZ092ZXJsYXkgaWQ9XCJ0cmlwLWNvbmZpcm0tbG9hZGluZ1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fbG9hZGluZ1wiIG9wZW49e2xvYWRpbmd9IGxhYmVsPVwiXHU2QjYzXHU1NzI4XHU3NTFGXHU2MjEwXHU4ODRDXHU3QTBCXCIgLz5cbiAgICAgICAgPFRvYXN0IGlkPVwidHJpcC1jb25maXJtLXRvYXN0XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX190b2FzdFwiIG9wZW49e3NhdmVkfT5cdTg4NENcdTdBMEJcdTVERjJcdTRGRERcdTVCNThcdUZGMENcdTUzRUZcdTU3MjhcdTIwMUNcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEJcdTIwMURcdTY3RTVcdTc3MEJcdTMwMDI8L1RvYXN0PlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENoZWNrYm94LFxuICBDb2x1bW4sXG4gIEZvcm1GaWVsZCxcbiAgUGFnZUhlYWRlcixcbiAgUmFkaW8sXG4gIFJvdyxcbiAgU2VsZWN0LFxuICBTdGVwcyxcbiAgVGV4dEFyZWEsXG4gIFRleHRJbnB1dCxcbiAgVG9nZ2xlLFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBUcmlwQ3JlYXRlU2NyZWVuKCkge1xuICBjb25zdCBbcmVtaW5kZXIsIHNldFJlbWluZGVyXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNyZWF0ZS1wYWdlXCIgZ2FwPXsxN30gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHRyaXAtY3JlYXRlX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwidHJpcC1jcmVhdGUtaGVhZGVyXCIgdGl0bGVJZD1cInRyaXAtY3JlYXRlLXRpdGxlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2hlYWRlclwiIHRpdGxlPVwiXHU1MjFCXHU1RUZBXHU4ODRDXHU3QTBCXCIgc3VidGl0bGU9XCJcdTUxNDhcdTc4NkVcdTVCOUFcdTY1RjZcdTk1RjRcdTRFMEVcdTU0MENcdTg4NENcdTY1QjlcdTVGMEZcIiBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19jYW5jZWxcIiB0bz1cInJvdXRlLWRldGFpbFwiPlx1NTNENlx1NkQ4ODwvQnV0dG9uPn0gLz5cbiAgICAgICAgPFN0ZXBzIGlkPVwidHJpcC1jcmVhdGUtc3RlcHNcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RlcHNcIiBjdXJyZW50PXswfSBpdGVtcz17W3sgaWQ6ICdiYXNpYycsIGxhYmVsOiAnXHU1N0ZBXHU2NzJDXHU0RkUxXHU2MDZGJyB9LCB7IGlkOiAnYnVkZ2V0JywgbGFiZWw6ICdcdTk4ODRcdTdCOTcnIH0sIHsgaWQ6ICdjb25maXJtJywgbGFiZWw6ICdcdTc4NkVcdThCQTQnIH1dfSAvPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19uYW1lLWZpZWxkXCIgbGFiZWw9XCJcdTg4NENcdTdBMEJcdTU0MERcdTc5RjBcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtbmFtZVwiPlxuICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJ0cmlwLWNyZWF0ZS1uYW1lXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25hbWUtaW5wdXRcIiBkZWZhdWx0VmFsdWU9XCJcdTU0NjhcdTUxNkRcdThGRDBcdTZDQjNcdTY1NjNcdTZCNjVcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fZGF0ZS1maWVsZFwiIGxhYmVsPVwiXHU1MUZBXHU1M0QxXHU2NUU1XHU2NzFGXCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLWRhdGVcIiBoaW50PVwiXHU1RUZBXHU4QkFFXHU5MDA5XHU2MkU5XHU1OTI5XHU2QzE0XHU3QTMzXHU1QjlBXHU3Njg0XHU2NUU1XHU2NzFGXCI+XG4gICAgICAgICAgPFRleHRJbnB1dCBpZD1cInRyaXAtY3JlYXRlLWRhdGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fZGF0ZS1pbnB1dFwiIGRlZmF1bHRWYWx1ZT1cIjIwMjYtMDgtMTVcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtZmllbGRcIiBsYWJlbD1cIlx1OTZDNlx1NTQwOFx1NTczMFx1NzBCOVwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1zdGFydFwiPlxuICAgICAgICAgIDxTZWxlY3QgaWQ9XCJ0cmlwLWNyZWF0ZS1zdGFydFwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1zZWxlY3RcIiBkZWZhdWx0VmFsdWU9XCJtZXRyb1wiPlxuICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtb3B0aW9uXCIgdmFsdWU9XCJtZXRyb1wiPlx1OEZEMFx1NkNCM1x1OERFRlx1NTczMFx1OTRDMVx1N0FEOSAzIFx1NTNGN1x1NTNFMzwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtb3B0aW9uXCIgdmFsdWU9XCJ3YXJlaG91c2VcIj5cdTY1RTdcdTRFRDNcdTVFOTNcdTZCNjNcdTk1RTg8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LW9wdGlvblwiIHZhbHVlPVwiY3VzdG9tXCI+XHU4MUVBXHU1QjlBXHU0RTQ5XHU1NzMwXHU3MEI5PC9vcHRpb24+XG4gICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jcmVhdGUtcGFjZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlXCIgZ2FwPXs5fT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fZ3JvdXAtbGFiZWxcIj5cdTg4NENcdTdBMEJcdTgyODJcdTU5NEY8L3NwYW4+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25zXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICA8UmFkaW8gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2Utb3B0aW9uXCIgbmFtZT1cInBhY2VcIiBsYWJlbD1cIlx1OEY3Qlx1Njc3RVwiIGRlZmF1bHRDaGVja2VkIC8+XG4gICAgICAgICAgICA8UmFkaW8gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2Utb3B0aW9uXCIgbmFtZT1cInBhY2VcIiBsYWJlbD1cIlx1NjgwN1x1NTFDNlwiIC8+XG4gICAgICAgICAgICA8UmFkaW8gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2Utb3B0aW9uXCIgbmFtZT1cInBhY2VcIiBsYWJlbD1cIlx1N0QyN1x1NTFEMVwiIC8+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19ub3RlLWZpZWxkXCIgbGFiZWw9XCJcdTU0MENcdTg4NENcdTU5MDdcdTZDRThcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtbm90ZVwiPlxuICAgICAgICAgIDxUZXh0QXJlYSBpZD1cInRyaXAtY3JlYXRlLW5vdGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbm90ZS1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiXHU0RjhCXHU1OTgyXHVGRjFBXHU2NzA5XHU1MTNGXHU3QUU1XHU1NDBDXHU4ODRDXHVGRjBDXHU1RTBDXHU2NzFCXHU1MUNGXHU1QzExXHU2OTdDXHU2OEFGXHU4REVGXHU2QkI1XCIgLz5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNyZWF0ZS1wcmVmZXJlbmNlc1wiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wcmVmZXJlbmNlc1wiIGdhcD17MTB9PlxuICAgICAgICAgIDxDaGVja2JveCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcHJlZmVyZW5jZVwiIGxhYmVsPVwiXHU0RjE4XHU1MTQ4XHU1Qjg5XHU2MzkyXHU2NUUwXHU5NjlDXHU3ODhEXHU4REVGXHU3RUJGXCIgLz5cbiAgICAgICAgICA8Q2hlY2tib3ggY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3ByZWZlcmVuY2VcIiBsYWJlbD1cIlx1OTA3Rlx1NUYwMFx1OTcwMFx1ODk4MVx1OTg4NFx1N0VBNlx1NzY4NFx1NTczMFx1NzBCOVwiIGRlZmF1bHRDaGVja2VkIC8+XG4gICAgICAgICAgPFRvZ2dsZSBpZD1cInRyaXAtY3JlYXRlLXJlbWluZGVyXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3JlbWluZGVyXCIgY2hlY2tlZD17cmVtaW5kZXJ9IG9uQ2hhbmdlPXtzZXRSZW1pbmRlcn0gbGFiZWw9XCJcdTUxRkFcdTUzRDFcdTUyNERcdTRFMDBcdTU5MjlcdTYzRDBcdTkxOTJcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEJ1dHRvbiBpZD1cInRyaXAtY3JlYXRlLW5leHRcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbmV4dFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJidWRnZXRcIj5cdTRFMEJcdTRFMDBcdTZCNjVcdUZGMUFcdTk4ODRcdTdCOTdcdTRFMEVcdTU0MENcdTg4NENcdTRFQkE8L0J1dHRvbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBFbXB0eVN0YXRlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRhYnMsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgVFJJUFMgPSBbXG4gIHsgaWQ6ICd0cmlwLWNhbmFsJywgdGl0bGU6ICdcdTU0NjhcdTUxNkRcdThGRDBcdTZDQjNcdTY1NjNcdTZCNjUnLCBkYXRlOiAnOCBcdTY3MDggMTUgXHU2NUU1Jywgc3RhdHVzOiAnXHU1Rjg1XHU1MUZBXHU1M0QxJywgZGV0YWlsOiAnMyBcdTRFQkEgXHUwMEI3IDUgXHU0RTJBXHU1NzMwXHU3MEI5JyB9LFxuICB7IGlkOiAndHJpcC1sYWtlJywgdGl0bGU6ICdcdTczQUZcdTZFNTZcdTlBOTFcdTg4NENcdTUzNEFcdTY1RTUnLCBkYXRlOiAnOCBcdTY3MDggMjIgXHU2NUU1Jywgc3RhdHVzOiAnXHU4OUM0XHU1MjEyXHU0RTJEJywgZGV0YWlsOiAnMiBcdTRFQkEgXHUwMEI3IDQgXHU0RTJBXHU1NzMwXHU3MEI5JyB9LFxuICB7IGlkOiAndHJpcC1tdXNldW0nLCB0aXRsZTogJ1x1OTZFOFx1NTkyOVx1NTM1QVx1NzI2OVx1OTk4Nlx1N0VCRicsIGRhdGU6ICc5IFx1NjcwOCA1IFx1NjVFNScsIHN0YXR1czogJ1x1NUY4NVx1Nzg2RVx1OEJBNCcsIGRldGFpbDogJzQgXHU0RUJBIFx1MDBCNyAzIFx1NEUyQVx1NTczQVx1OTk4NicgfSxcbiAgeyBpZDogJ3RyaXAtaGlsbHMnLCB0aXRsZTogJ1x1NTdDRVx1NTMxN1x1OEY3Qlx1NUY5Mlx1NkI2NScsIGRhdGU6ICc5IFx1NjcwOCAxMiBcdTY1RTUnLCBzdGF0dXM6ICdcdTg5QzRcdTUyMTJcdTRFMkQnLCBkZXRhaWw6ICczIFx1NEVCQSBcdTAwQjcgNiBcdTRFMkFcdTU3MzBcdTcwQjknIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBUcmlwc1NjcmVlbigpIHtcbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IFJlYWN0LnVzZVN0YXRlKCd1cGNvbWluZycpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwcy1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHRyaXBzX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJ0cmlwcy1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJ0cmlwcy10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwidHJpcHNfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEJcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU4QkExXHU1MjEyXHUzMDAxXHU1NDBDXHU4ODRDXHU0RkUxXHU2MDZGXHU0RTBFXHU2NUM1XHU4ODRDXHU4QkIwXHU1RjU1XCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGlkPVwidHJpcHMtY3JlYXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cInRyaXBzX19jcmVhdGUtYWN0aW9uXCIgdG89XCJ0cmlwLWNyZWF0ZVwiPlx1NjVCMFx1NUVGQTwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPFRhYnMgaWQ9XCJ0cmlwcy10YWJzXCIgY2xhc3NOYW1lPVwidHJpcHNfX3RhYnNcIiBhY3RpdmVJZD17dGFifSBvbkNoYW5nZT17c2V0VGFifSBpdGVtcz17W3sgaWQ6ICd1cGNvbWluZycsIGxhYmVsOiAnXHU1Rjg1XHU1MUZBXHU1M0QxJyB9LCB7IGlkOiAnY29tcGxldGVkJywgbGFiZWw6ICdcdTVERjJcdTVCOENcdTYyMTAnIH0sIHsgaWQ6ICdzYXZlZCcsIGxhYmVsOiAnXHU2NTM2XHU4NUNGJyB9XX0gLz5cbiAgICAgICAge3RhYiA9PT0gJ3VwY29taW5nJyA/IChcbiAgICAgICAgICA8Q29sdW1uIGlkPVwidHJpcHMtdXBjb21pbmdcIiBjbGFzc05hbWU9XCJ0cmlwc19fbGlzdFwiIGdhcD17MTJ9PlxuICAgICAgICAgICAge1RSSVBTLm1hcCgodHJpcCkgPT4gKFxuICAgICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PXt0cmlwLmlkfSBrZXk9e3RyaXAuaWR9IHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs5fT5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT57dHJpcC50aXRsZX08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1zdGF0dXNcIj57dHJpcC5zdGF0dXN9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPnt0cmlwLmRhdGV9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwc19fc3RhdHVzLXJvd1wiIGdhcD17MTB9PlxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kZXRhaWxcIj57dHJpcC5kZXRhaWx9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1yZW1pbmRlclwiPlx1NjNEMFx1OTE5Mlx1NURGMlx1NUYwMFx1NTQyRjwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgKSA6IHRhYiA9PT0gJ2NvbXBsZXRlZCcgPyAoXG4gICAgICAgICAgPENvbHVtbiBpZD1cInRyaXBzLWNvbXBsZXRlZFwiIGNsYXNzTmFtZT1cInRyaXBzX19jb21wbGV0ZWRcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9XCJ0cmlwLW9sZC1zdHJlZXRcIiB0bz1cInJvdXRlLWRldGFpbFwiPjxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OH0+PEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+XHU4MDAxXHU4ODU3XHU2MTYyXHU2RTM4PC9IZWFkaW5nPjxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj43IFx1NjcwOCAxOCBcdTY1RTUgXHUwMEI3IFx1NURGMlx1NUI4Q1x1NjIxMDwvVGV4dD48L0NvbHVtbj48L0NhcmQ+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PVwidHJpcC1uaWdodC13YWxrXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj48Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezh9PjxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTkxQ1x1ODI3Mlx1NUVGQVx1N0I1MVx1NjU2M1x1NkI2NTwvSGVhZGluZz48VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+NiBcdTY3MDggMjcgXHU2NUU1IFx1MDBCNyBcdTVERjJcdTVCOENcdTYyMTA8L1RleHQ+PC9Db2x1bW4+PC9DYXJkPlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT1cInRyaXAtcml2ZXJzaWRlXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj48Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezh9PjxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTM1N1x1NUNCOFx1NjVFN1x1NzgwMVx1NTkzNDwvSGVhZGluZz48VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+NSBcdTY3MDggMTYgXHU2NUU1IFx1MDBCNyBcdTVERjJcdTVCOENcdTYyMTA8L1RleHQ+PC9Db2x1bW4+PC9DYXJkPlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxFbXB0eVN0YXRlIGlkPVwidHJpcHMtc2F2ZWQtZW1wdHlcIiBjbGFzc05hbWU9XCJ0cmlwc19fZW1wdHlcIiB0aXRsZT1cIlx1OEZEOFx1NkNBMVx1NjcwOVx1NjUzNlx1ODVDRlx1OERFRlx1N0VCRlwiIGRlc2NyaXB0aW9uPVwiXHU1NzI4XHU4REVGXHU3RUJGXHU4QkU2XHU2MEM1XHU0RTJEXHU2NTM2XHU4NUNGXHVGRjBDXHU3QTBEXHU1NDBFXHU1MThEXHU1MUIzXHU1QjlBXHU0RUMwXHU0RTQ4XHU2NUY2XHU1MDE5XHU1MUZBXHU1M0QxXHUzMDAyXCIgYWN0aW9uPXs8QnV0dG9uIGNsYXNzTmFtZT1cInRyaXBzX19lbXB0eS1hY3Rpb25cIiB0bz1cImRpc2NvdmVyXCI+XHU1M0JCXHU1M0QxXHU3M0IwXHU4REVGXHU3RUJGPC9CdXR0b24+fSAvPlxuICAgICAgICApfVxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBCdWRnZXRTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvYnVkZ2V0LmpzeCdcbmltcG9ydCB7IERpc2NvdmVyU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2Rpc2NvdmVyLmpzeCdcbmltcG9ydCB7IEV4cGxvcmVNYXBTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvZXhwbG9yZS1tYXAuanN4J1xuaW1wb3J0IHsgSXRpbmVyYXJ5U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2l0aW5lcmFyeS5qc3gnXG5pbXBvcnQgeyBMb2dpblNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9sb2dpbi5qc3gnXG5pbXBvcnQgeyBQcm9maWxlU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3Byb2ZpbGUuanN4J1xuaW1wb3J0IHsgUm91dGVEZXRhaWxTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcm91dGUtZGV0YWlsLmpzeCdcbmltcG9ydCB7IFRyaXBDb25maXJtU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3RyaXAtY29uZmlybS5qc3gnXG5pbXBvcnQgeyBUcmlwQ3JlYXRlU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3RyaXAtY3JlYXRlLmpzeCdcbmltcG9ydCB7IFRyaXBzU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3RyaXBzLmpzeCdcblxuZXhwb3J0IGNvbnN0IHByb2plY3QgPSB7XG4gIG5hbWU6ICdcdTU0NjhcdTY3MkJcdTUxRkFcdTUzRDFcdTY1QzVcdTg4NENcdTUyQTlcdTYyNEInLFxuICB2aWV3cG9ydHM6IHtcbiAgICBtb2JpbGU6IHsgd2lkdGg6IDM3NSwgaGVpZ2h0OiA4MTIgfSxcbiAgfSxcbiAgZGVmYXVsdFZpZXdwb3J0OiAnbW9iaWxlJyxcbiAgc2NyZWVuczogW1xuICAgIHtcbiAgICAgIGlkOiAnbG9naW4nLFxuICAgICAgdGl0bGU6ICdcdTc2N0JcdTVGNTUnLFxuICAgICAgY29tcG9uZW50OiBMb2dpblNjcmVlbixcbiAgICAgIGVudHJ5OiB0cnVlLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2Rpc2NvdmVyJyxcbiAgICAgIHRpdGxlOiAnXHU1M0QxXHU3M0IwJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU4RDg1XHU4RkM3XHU0RTAwXHU1QzRGXHU3Njg0XHU4REVGXHU3RUJGXHU2M0E4XHU4MzUwXHU5OTk2XHU5ODc1JyxcbiAgICAgIGNvbXBvbmVudDogRGlzY292ZXJTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdleHBsb3JlLW1hcCcsICdyb3V0ZS1kZXRhaWwnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnZXhwbG9yZS1tYXAnLFxuICAgICAgdGl0bGU6ICdcdTc2RUVcdTc2ODRcdTU3MzBcdTU3MzBcdTU2RkUnLFxuICAgICAgY29tcG9uZW50OiBFeHBsb3JlTWFwU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3JvdXRlLWRldGFpbCcsXG4gICAgICB0aXRsZTogJ1x1OERFRlx1N0VCRlx1OEJFNlx1NjBDNScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OTU3Rlx1NTE4NVx1NUJCOVx1OERFRlx1N0VCRlx1NEVDQlx1N0VDRFx1NEUwRVx1NTczMFx1NzBCOVx1NTIxN1x1ODg2OCcsXG4gICAgICBjb21wb25lbnQ6IFJvdXRlRGV0YWlsU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAnZXhwbG9yZS1tYXAnLCAnaXRpbmVyYXJ5JywgJ3RyaXAtY3JlYXRlJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2l0aW5lcmFyeScsXG4gICAgICB0aXRsZTogJ1x1NkJDRlx1NjVFNVx1ODg0Q1x1N0EwQicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OEQ4NVx1OEZDN1x1NEUwMFx1NUM0Rlx1NzY4NFx1N0VCNVx1NTQxMVx1NkI2NVx1OUFBNFx1NEUwRVx1NjVFNVx1N0EwQlx1NTM2MVx1NzI0NycsXG4gICAgICBjb21wb25lbnQ6IEl0aW5lcmFyeVNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwLWNyZWF0ZScsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd0cmlwLWNyZWF0ZScsXG4gICAgICB0aXRsZTogJ1x1NTIxQlx1NUVGQVx1ODg0Q1x1N0EwQicsXG4gICAgICBjb21wb25lbnQ6IFRyaXBDcmVhdGVTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAnYnVkZ2V0JywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2J1ZGdldCcsXG4gICAgICB0aXRsZTogJ1x1OTg4NFx1N0I5N1x1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQScsXG4gICAgICBjb21wb25lbnQ6IEJ1ZGdldFNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3RyaXAtY29uZmlybScsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd0cmlwLWNvbmZpcm0nLFxuICAgICAgdGl0bGU6ICdcdTYzRDBcdTRFQTRcdTc4NkVcdThCQTQnLFxuICAgICAgY29tcG9uZW50OiBUcmlwQ29uZmlybVNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ2J1ZGdldCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFsnXHU3ODZFXHU4QkE0XHU1RjM5XHU1QzQyJywgJ1x1NTJBMFx1OEY3RFx1NzJCNlx1NjAwMScsICdcdTYyMTBcdTUyOUZcdTYzRDBcdTc5M0EnXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHJpcHMnLFxuICAgICAgdGl0bGU6ICdcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEInLFxuICAgICAgY29tcG9uZW50OiBUcmlwc1NjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwLWNyZWF0ZScsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdwcm9maWxlJyxcbiAgICAgIHRpdGxlOiAnXHU0RTJBXHU0RUJBXHU4QkJFXHU3RjZFJyxcbiAgICAgIGNvbXBvbmVudDogUHJvZmlsZVNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgXSxcbn1cbiIsICJpbXBvcnQgeyBCb2FyZCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9Cb2FyZC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBQcm90b3R5cGVQcm92aWRlciB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9qZWN0IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvdmFsaWRhdGVQcm9qZWN0LmpzJ1xuaW1wb3J0IHsgcHJvamVjdCB9IGZyb20gJy4vcHJvamVjdC5qcydcblxudmFsaWRhdGVQcm9qZWN0KHByb2plY3QpXG5cblJlYWN0RE9NLmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSkucmVuZGVyKFxuICA8RXJyb3JCb3VuZGFyeSBzY29wZT1cImJvYXJkXCI+XG4gICAgPFByb3RvdHlwZVByb3ZpZGVyIHByb2plY3Q9e3Byb2plY3R9PlxuICAgICAgPEJvYXJkIHByb2plY3Q9e3Byb2plY3R9IC8+XG4gICAgPC9Qcm90b3R5cGVQcm92aWRlcj5cbiAgPC9FcnJvckJvdW5kYXJ5PixcbilcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUFBLE1BQU0sbUJBQW1CLE1BQU0sY0FBYyxJQUFJO0FBRWpELFdBQVMsbUJBQW1CQSxVQUFTO0FBRnJDO0FBR0UsYUFBTyxLQUFBQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxLQUFLLE1BQTdDLG1CQUFnRCxPQUFNQSxTQUFRLFFBQVEsQ0FBQyxFQUFFO0FBQUEsRUFDbEY7QUFFTyxXQUFTLGtCQUFrQixFQUFFLFNBQUFBLFVBQVMsU0FBUyxHQUFHO0FBQ3ZELFVBQU0sa0JBQWtCLG1CQUFtQkEs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LFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGVBQWUsYUFBYSxlQUFlLFNBQVMsU0FBUztBQUFBLFFBQ2pGLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxnQkFBZ0IsZUFBZSxTQUFTLFNBQVM7QUFBQSxRQUNyRSxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZ0JBQWdCLFVBQVUsU0FBUyxTQUFTO0FBQUEsUUFDaEUsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixTQUFTLFNBQVM7QUFBQSxRQUN0RCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksVUFBVSxTQUFTLFNBQVM7QUFBQSxRQUNoRCxXQUFXLENBQUMsNEJBQVEsNEJBQVEsMEJBQU07QUFBQSxNQUNwQztBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixlQUFlLFNBQVMsU0FBUztBQUFBLFFBQ3JFLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxTQUFTLFNBQVM7QUFBQSxRQUN0QyxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7OztBQ3ZGQSxrQkFBZ0IsT0FBTztBQUV2QixXQUFTLFdBQVcsU0FBUyxlQUFlLE1BQU0sQ0FBQyxFQUFFO0FBQUEsSUFDbkQsb0NBQUMsaUJBQWMsT0FBTSxXQUNuQixvQ0FBQyxxQkFBa0IsV0FDakIsb0NBQUMsU0FBTSxTQUFrQixDQUMzQixDQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsicHJvamVjdCIsICJwcm9qZWN0IiwgIl9hIiwgInByb2plY3QiLCAicHJvamVjdCIsICJjb3B5VGV4dCIsICJwcm9qZWN0IiwgIl9hIiwgInByb2plY3QiLCAicHJvamVjdCIsICJ0YWJzIl0KfQo=
