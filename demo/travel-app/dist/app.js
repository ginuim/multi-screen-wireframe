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
  function createAnnotationExport(project2, annotations, operations = []) {
    return {
      schemaVersion: ANNOTATION_SCHEMA_VERSION,
      projectId: annotationProjectId(project2),
      projectName: (project2 == null ? void 0 : project2.name) || "\u672A\u547D\u540D\u7EBF\u6846\u539F\u578B",
      baseRevision: annotationBaseRevision(project2),
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      annotations: (annotations || []).map(normalizeAnnotation).filter(Boolean),
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
    const annotations = parsed.annotations.map(normalizeAnnotation).filter(Boolean);
    if (annotations.length !== parsed.annotations.length) throw new Error("\u6CE8\u91CA JSON \u5305\u542B\u65E0\u6548\u6CE8\u91CA");
    const operations = reconcileAnnotationOperations(
      baseAnnotations(project2),
      Array.isArray(parsed.operations) ? parsed.operations : []
    );
    return { ...parsed, annotations, operations };
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
    annotations,
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
    const visibleAnnotations = annotations.filter((annotation) => {
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
      const file = createAnnotationExport(project2, annotations, operations);
      downloadJson(`${annotationProjectId(project2)}.wireframe-annotations.json`, file);
      setMessage(`\u5DF2\u5BFC\u51FA ${annotations.length} \u6761\u6CE8\u91CA\u3002`);
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
    return /* @__PURE__ */ React.createElement("aside", { className: "wf-review-panel wf-annotation-panel", "aria-label": "\u539F\u578B\u6CE8\u91CA", hidden: !visible }, /* @__PURE__ */ React.createElement("header", { className: "wf-review-panel-header" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-heading" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-panel-title" }, "\u539F\u578B\u6CE8\u91CA"), /* @__PURE__ */ React.createElement("span", { className: "wf-review-panel-count" }, annotations.length, " \u6761\u6CE8\u91CA")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-close", onClick: onClose }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-body" }, /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u6DFB\u52A0\u6CE8\u91CA"), /* @__PURE__ */ React.createElement("div", { className: "wf-annotation-scope", role: "group", "aria-label": "\u6CE8\u91CA\u8303\u56F4" }, /* @__PURE__ */ React.createElement(
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
  function resolvePositions2(board, annotations) {
    if (!board) return [];
    const positions = [];
    for (const annotation of annotations) {
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
  function AnnotationMarkers({ boardRef, annotations, onOpenPanel }) {
    var _a, _b;
    const [positions, setPositions] = React.useState([]);
    const [activeKey, setActiveKey] = React.useState(null);
    const frameRef = React.useRef(null);
    const refresh = React.useCallback(() => {
      const next = resolvePositions2(boardRef.current, annotations);
      setPositions((current) => samePositions2(current, next) ? current : next);
    }, [annotations, boardRef]);
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
    const annotations = React.useMemo(
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
        annotations.length > 0 ? /* @__PURE__ */ React.createElement("span", { className: "wf-toolbar-icon-count" }, annotations.length) : null,
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
          annotations,
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
          annotations,
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9hbm5vdGF0aW9ucy5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQW5ub3RhdGlvblBhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQW5ub3RhdGlvbk1hcmtlcnMuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9tYXAuanN4IiwgIi4uL3NyYy9sYXlvdXRzL01vYmlsZUxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvYnVkZ2V0LmpzeCIsICIuLi9zcmMvc2NyZWVucy9kaXNjb3Zlci5qc3giLCAiLi4vc3JjL2NvbXBvbmVudHMvU2hhbmdoYWlNYXAuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCIsICIuLi9zcmMvc2NyZWVucy9pdGluZXJhcnkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvc2NyZWVucy9wcm9maWxlLmpzeCIsICIuLi9zcmMvc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXAtY29uZmlybS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXBzLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBmaW5kRmxvd1RhcmdldElkIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvaW50ZXJEb3duVGFyZ2V0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudCA9IGV2ZW50LnRhcmdldFxuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFMERcdTYzQTVcdTdCQTFcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMENcdThCQTlcdTRFOEJcdTRFRjZcdTg0M0RcdTUyMzBcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcbiAgICBpZiAoY2FudmFzTG9ja2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1REYyXHU1QzU1XHU1RjAwXHU2NUUwXHU1M0VGXHU2RURBXHU1MzNBXHU1N0RGXHVGRjBDXHU0RTBEXHU2MkEyXHU2MzA3XHU5NDg4XG4gICAgaWYgKGV4cGFuZGVkKSByZXR1cm5cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBsb2NrZWQ6IGNhbnZhc0xvY2tlZCwgc2NhbGUgfSlcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBzdGF0ZVxuICAgIC8vIFx1N0I0OVx1NzcxRlx1NkI2M1x1NjJENlx1OEZDN1x1OTYwOFx1NTAzQ1x1NTE4RCBjYXB0dXJlXHUzMDAyXHU4RkM3XHU2NUU5IHNldFBvaW50ZXJDYXB0dXJlIFx1NEYxQVx1NjI4QSBjbGljayBcdTkxQ0RcdTVCOUFcdTU0MTFcdTUyMzBcbiAgICAvLyAud2Ytc2NyZWVuLWNvbnRlbnRcdUZGMENcdTVCRkNcdTgxRjQgZGF0YS1mbG93LXRvIFx1NTlENFx1NjI1OFx1NEUwRVx1N0VDNFx1NEVGNiBvbkNsaWNrIFx1NTE2OFx1OTBFOFx1NTkzMVx1NjU0OFx1MzAwMlxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgY29uc3Qgd2FzTW92ZWQgPSBzdGF0ZS5tb3ZlZFxuICAgIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpXG4gICAgaWYgKCF3YXNNb3ZlZCAmJiBzdGF0ZS5tb3ZlZCkge1xuICAgICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgICAgdHJ5IHtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gaWdub3JlOiBcdTkwRThcdTUyMDZcdTczQUZcdTU4ODNcdTU3MjggcG9pbnRlcnVwIFx1NTQwRVx1OEMwM1x1NzUyOFx1NEYxQVx1NjI5QlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNvbnN0IHJvb3QgPSBjb250ZW50UmVmLmN1cnJlbnRcbiAgICBjb25zdCBkb3duVGFyZ2V0ID0gcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudFxuICAgIHBvaW50ZXJEb3duVGFyZ2V0UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgLy8gcG9pbnRlciBjYXB0dXJlIFx1NEVDRFx1NTNFRlx1ODBGRFx1NjI4QSBjbGljay50YXJnZXQgXHU2NTM5XHU2MjEwXHU1MTg1XHU1QkI5XHU2ODM5XHVGRjFCXHU1NkRFXHU5MDAwXHU1MjMwIHBvaW50ZXJkb3duIFx1NzZFRVx1NjgwN1xuICAgIGNvbnN0IHN0YXJ0RWwgPSBkb3duVGFyZ2V0ICYmIHJvb3Q/LmNvbnRhaW5zKGRvd25UYXJnZXQpID8gZG93blRhcmdldCA6IGV2ZW50LnRhcmdldFxuICAgIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290KVxuICAgIGlmICghdG8pIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICBuYXZpZ2F0ZSh0bylcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuY29uc3QgVFJBQ0tQQURfWk9PTV9SQVRFID0gMC4wMDE1XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZWRXaGVlbERlbHRhKGV2ZW50KSB7XG4gIGlmIChldmVudC5kZWx0YU1vZGUgPT09IDEpIHJldHVybiBldmVudC5kZWx0YVkgKiAxNlxuICBpZiAoZXZlbnQuZGVsdGFNb2RlID09PSAyKSByZXR1cm4gZXZlbnQuZGVsdGFZICogMTAwXG4gIHJldHVybiBldmVudC5kZWx0YVlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRXaGVlbFNjYWxlKHNjYWxlLCBldmVudCwgeyB0cmFja3BhZE1vZGUgPSBmYWxzZSwgc2Vuc2l0aXZpdHkgPSAwLjYgfSA9IHt9KSB7XG4gIGlmICghdHJhY2twYWRNb2RlKSByZXR1cm4gY2xhbXBTY2FsZShzY2FsZSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSlcbiAgY29uc3QgZGVsdGEgPSBub3JtYWxpemVkV2hlZWxEZWx0YShldmVudClcbiAgaWYgKCFkZWx0YSkgcmV0dXJuIHNjYWxlXG4gIHJldHVybiBjbGFtcFNjYWxlKHNjYWxlICogTWF0aC5leHAoLWRlbHRhICogVFJBQ0tQQURfWk9PTV9SQVRFICogc2Vuc2l0aXZpdHkpKVxufVxuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShcbiAgZWwsXG4gIGdldFNjYWxlLFxuICBzZXRTY2FsZSxcbiAgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UsXG4gIGdldE9wdGlvbnMgPSAoKSA9PiAoe30pLFxuKSB7XG4gIGlmICghZWwpIHJldHVybiAoKSA9PiB7fVxuICBjb25zdCBvbldoZWVsID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQ6IGdldExvY2tlZCgpIH0pKSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgc2V0U2NhbGUobmV4dFdoZWVsU2NhbGUoZ2V0U2NhbGUoKSwgZXZlbnQsIGdldE9wdGlvbnMoKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBsb2NrZWRSZWYgPSBSZWFjdC51c2VSZWYobG9ja2VkKVxuICBjb25zdCBvcHRpb25zUmVmID0gUmVhY3QudXNlUmVmKG9wdGlvbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuICBvcHRpb25zUmVmLmN1cnJlbnQgPSBvcHRpb25zXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICAgICgpID0+IG9wdGlvbnNSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiZXhwb3J0IGNvbnN0IENBTlZBU19JTkRFWF9NQVJHSU4gPSAxNlxuXG5mdW5jdGlvbiBmaW5pdGUodmFsdWUsIGZhbGxiYWNrID0gMCkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihwb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpKVxuICBjb25zdCBjb250YWluZXJIZWlnaHQgPSBNYXRoLm1heCgwLCBmaW5pdGUoY29udGFpbmVyPy5oZWlnaHQpKVxuICBjb25zdCBpdGVtV2lkdGggPSBNYXRoLm1heCgwLCBmaW5pdGUoaXRlbT8ud2lkdGgpKVxuICBjb25zdCBpdGVtSGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LmhlaWdodCkpXG4gIGNvbnN0IG1heFggPSBNYXRoLm1heChtYXJnaW4sIGNvbnRhaW5lcldpZHRoIC0gaXRlbVdpZHRoIC0gbWFyZ2luKVxuICBjb25zdCBtYXhZID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJIZWlnaHQgLSBpdGVtSGVpZ2h0IC0gbWFyZ2luKVxuICByZXR1cm4ge1xuICAgIHg6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueCwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WCksXG4gICAgeTogTWF0aC5taW4oTWF0aC5tYXgoZmluaXRlKHBvc2l0aW9uPy55LCBtYXJnaW4pLCBtYXJnaW4pLCBtYXhZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24oY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIHJldHVybiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24oe1xuICAgIHg6IChmaW5pdGUoY29udGFpbmVyPy53aWR0aCkgLSBmaW5pdGUoaXRlbT8ud2lkdGgpKSAvIDIsXG4gICAgeTogZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSAtIGZpbml0ZShpdGVtPy5oZWlnaHQpIC0gbWFyZ2luLFxuICB9LCBjb250YWluZXIsIGl0ZW0sIG1hcmdpbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKGdldEVsZW1lbnRzLCBvblJlYWR5LCBzY2hlZHVsZXIpIHtcbiAgbGV0IGFjdGl2ZSA9IHRydWVcbiAgbGV0IGZyYW1lID0gbnVsbFxuXG4gIGNvbnN0IGF0dGVtcHQgPSAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2V0RWxlbWVudHMoKVxuICAgIGlmICghZWxlbWVudHM/LmNvbnRhaW5lciB8fCAhZWxlbWVudHM/Lml0ZW0pIHtcbiAgICAgIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmcmFtZSA9IG51bGxcbiAgICBvblJlYWR5KGVsZW1lbnRzKVxuICB9XG5cbiAgZnJhbWUgPSBzY2hlZHVsZXIucmVxdWVzdChhdHRlbXB0KVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgaWYgKGZyYW1lICE9IG51bGwpIHNjaGVkdWxlci5jYW5jZWwoZnJhbWUpXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZm9jdXNDYW52YXNTY3JlZW4sIHJlc2V0Q2FudmFzVmlld3BvcnQsIHBhbkZyb21EcmFnU25hcHNob3QgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHtcbiAgY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uLFxuICBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbixcbiAgd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMsXG59IGZyb20gJy4vY2FudmFzLWluZGV4LmpzJ1xuXG5jb25zdCBJTkRFWF9EUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gZWxlbWVudFNpemUoZWxlbWVudCkge1xuICByZXR1cm4geyB3aWR0aDogZWxlbWVudD8ub2Zmc2V0V2lkdGggfHwgMCwgaGVpZ2h0OiBlbGVtZW50Py5vZmZzZXRIZWlnaHQgfHwgMCB9XG59XG5cbmZ1bmN0aW9uIENhbnZhc0luZGV4KHtcbiAgY2FudmFzUmVmLFxuICBwcm9qZWN0LFxuICBjdXJyZW50U2NyZWVuSWQsXG4gIGRlbW9BdmFpbGFibGUsXG4gIHBvc2l0aW9uLFxuICBvblBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlLFxuICBuYXZpZ2F0ZSxcbiAgZW50ZXJEZW1vLFxufSkge1xuICBjb25zdCBpbmRleFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgY29uc3RyYWluID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHRQb3NpdGlvbiwgdXNlRGVmYXVsdCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICBjb25zdCBpbmRleCA9IGluZGV4UmVmLmN1cnJlbnRcbiAgICBpZiAoIWNhbnZhcyB8fCAhaW5kZXgpIHJldHVybiBuZXh0UG9zaXRpb25cbiAgICBjb25zdCBjb250YWluZXIgPSB7IHdpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsIGhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCB9XG4gICAgY29uc3QgaXRlbSA9IGVsZW1lbnRTaXplKGluZGV4KVxuICAgIHJldHVybiB1c2VEZWZhdWx0XG4gICAgICA/IGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSlcbiAgICAgIDogY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKG5leHRQb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtKVxuICB9LCBbY2FudmFzUmVmXSlcblxuICAvLyBwb3NpdGlvbiA9PSBudWxsIFx1ODg2OFx1NzkzQVx1NUMxQVx1NjcyQVx1ODQzRFx1NzBCOVx1RkYwOFx1NjIxNlx1OTg3OVx1NzZFRVx1NTIwN1x1NjM2Mlx1ODhBQlx1NkUwNVx1NjM4OVx1RkYwOVx1RkYxQlx1NUZDNVx1OTg3Qlx1NTE4RFx1OEREMVx1NEUwMFx1OTA0RFx1NUUwM1x1NUM0MFx1RkYwQ1xuICAvLyBcdTU0MjZcdTUyMTlcdTRGMUFcdTRFMDBcdTc2RjRcdTUzNjFcdTU3MjggdmlzaWJpbGl0eTpoaWRkZW5cdTMwMDJcbiAgY29uc3QgbmVlZHNEZWZhdWx0UG9zaXRpb24gPSBwb3NpdGlvbiA9PSBudWxsXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiB7fVxuICAgIGNvbnN0IHN0b3BXYWl0aW5nID0gd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMoXG4gICAgICAoKSA9PiAoeyBjb250YWluZXI6IGNhbnZhc1JlZi5jdXJyZW50LCBpdGVtOiBpbmRleFJlZi5jdXJyZW50IH0pLFxuICAgICAgKHsgY29udGFpbmVyOiBjYW52YXMsIGl0ZW06IGluZGV4IH0pID0+IHtcbiAgICAgICAgY29uc3QgdXBkYXRlID0gKCkgPT4gb25Qb3NpdGlvbkNoYW5nZSgoY3VycmVudCkgPT4gY29uc3RyYWluKGN1cnJlbnQsIGN1cnJlbnQgPT0gbnVsbCkpXG4gICAgICAgIHVwZGF0ZSgpXG5cbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHVwZGF0ZSlcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGNhbnZhcylcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGluZGV4KVxuICAgICAgICAgIGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcXVlc3Q6IChjYWxsYmFjaykgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayksXG4gICAgICAgIGNhbmNlbDogKGZyYW1lKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpLFxuICAgICAgfSxcbiAgICApXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcFdhaXRpbmcoKVxuICAgICAgZGlzY29ubmVjdFJlc2l6ZSgpXG4gICAgfVxuICB9LCBbY2FudmFzUmVmLCBjb25zdHJhaW4sIG5lZWRzRGVmYXVsdFBvc2l0aW9uLCBvblBvc2l0aW9uQ2hhbmdlXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17aW5kZXhSZWZ9XG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLWNhbnZhcy1pbmRleCBpcy1kcmFnZ2luZycgOiAnd2YtY2FudmFzLWluZGV4J31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHZpc2liaWxpdHk6ICdoaWRkZW4nIH19XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWhhbmRsZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uIHx8IGNvbnN0cmFpbihudWxsLCB0cnVlKVxuICAgICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBJTkRFWF9EUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2UoY29uc3RyYWluKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KSlcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWdyaXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48aSAvPjxpIC8+PGkgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWNsb3NlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIm00IDQgOCA4TTEyIDRsLTggOFwiIC8+PC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICB3aGVlbFpvb21PcHRpb25zLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG4gIGNhbnZhc0luZGV4VmlzaWJsZSA9IHRydWUsXG4gIGNhbnZhc0luZGV4UG9zaXRpb24sXG4gIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZUNhbnZhc0luZGV4LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQsIHdoZWVsWm9vbU9wdGlvbnMpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgLy8gXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XHU2NjJGXHU2ODQ2XHU2N0I2IGNocm9tZVx1RkYwQ1x1OTUwMVx1NEVBNFx1NEU5Mlx1NTNFQVx1Nzk4MVx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1RkYwQ1x1NEUwRFx1NjJBMlx1N0QyMlx1NUYxNVx1NzBCOVx1NTFGQiAvIFx1NjJENlx1NjJGRFxuICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdD8uKCcud2YtY2FudmFzLWluZGV4JykpIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGVudGVyRGVtbyA9IChzY3JlZW5JZCkgPT4ge1xuICAgIC8vIFx1OTUwMVx1NEVBNFx1NEU5Mlx1NjVGNiBzdGFnZSBcdTVERjIgcG9pbnRlci1ldmVudHM6bm9uZVx1RkYxQlx1N0QyMlx1NUYxNVx1NEVDRFx1NTNFRlx1NTNDQ1x1NTFGQlx1OEZEQlx1NkYxNFx1NzkzQVxuICAgIGlmICghZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uQ2xpY2s9e29uQ2FudmFzQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2FudmFzSW5kZXhWaXNpYmxlID8gKFxuICAgICAgICAgIDxDYW52YXNJbmRleFxuICAgICAgICAgICAgY2FudmFzUmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgICAgcG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlPXtvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvbkNsb3NlPXtvbkNsb3NlQ2FudmFzSW5kZXh9XG4gICAgICAgICAgICBuYXZpZ2F0ZT17bmF2aWdhdGV9XG4gICAgICAgICAgICBlbnRlckRlbW89e2VudGVyRGVtb31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICB3aGVlbFpvb21PcHRpb25zLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxuICBvbkNhbnZhc0NsaWNrLFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZCwgd2hlZWxab29tT3B0aW9ucylcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgdmlzaWJsZSA9IHRydWUsXG4gIHNlbGVjdGlvbnMsXG4gIG11bHRpU2VsZWN0LFxuICBpdGVtcyxcbiAgb25Ub2dnbGVNdWx0aVNlbGVjdCxcbiAgb25TZWxlY3RFbGVtZW50LFxuICBvbkhvdmVyRWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4QlwiIGhpZGRlbj17IXZpc2libGV9PlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWItc2VwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iXCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YW5jZXN0b3Iuc2VsZWN0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5jZXN0b3IubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3RvclwiPntzZWxlY3RlZC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZC5jdXJyZW50VGV4dCA/IChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY3VycmVudC10ZXh0XCI+XHU1RjUzXHU1MjREXHVGRjFBe3NlbGVjdGVkLmN1cnJlbnRUZXh0fTwvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTRGRUVcdTY1MzlcdTdDN0JcdTU3OEI8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1zZWxlY3RcIiB2YWx1ZT17dHlwZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0VHlwZShldmVudC50YXJnZXQudmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhSRVZJRVdfVFlQRV9MQUJFTFMpLm1hcCgoW3ZhbHVlLCBsYWJlbF0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1vcHRpb25cIiB2YWx1ZT17dmFsdWV9IGtleT17dmFsdWV9PntsYWJlbH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+e2luc3RydWN0aW9uTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWluc3RydWN0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbnN0cnVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0eXBlID09PSAnb3JkZXInID8gJ1x1NEY4Qlx1NTk4Mlx1RkYxQVx1NzlGQlx1NTJBOFx1NTIzMFx1OEJBMlx1NTM1NVx1NjQ1OFx1ODk4MVx1NEU0Qlx1NTQwRScgOiAnXHU2M0NGXHU4RkYwXHU1RTBDXHU2NzFCIEFJIFx1NTk4Mlx1NEY1NVx1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbnN0cnVjdGlvbihldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYWRkXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWluc3RydWN0aW9uLnRyaW0oKSAmJiB0eXBlICE9PSAncmVtb3ZlJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthZGRJdGVtfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1MkEwXHU1MTY1XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjA4e3NlbGVjdGlvbnMubGVuZ3RofSBcdTRFMkFcdTgyODJcdTcwQjlcdUZGMDlcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU0RTJEXHU3Njg0XHU4MjgyXHU3MEI5XHU1RjAwXHU1OUNCXHU0RkVFXHU2NTM5XHUzMDAyXHU3MEI5XHU1MUZCXHU5NzYyXHU1MzA1XHU1QzUxXHU1M0VGXHU1MjA3XHU2MzYyXHU1MjMwXHU3MjM2XHU3RUE3XHU3RUM0XHU0RUY2XHUzMDAyPC9wPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1PC9oMj5cbiAgICAgICAgICB7aXRlbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbXNcIj5cbiAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1cIiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tdGl0bGVcIj57aW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1tpdGVtLnR5cGVdfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGl0ZW0pLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuc2VsZWN0b3IpLmpvaW4oJ1x1MzAwMScpfVxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWluc3RydWN0aW9uXCI+e2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWRlbGV0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZUl0ZW0oaXRlbS5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ4XHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uIHdmLXJldmlldy1wcm9tcHQtc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2NzAwXHU3RUM4IFByb21wdDwvaDI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3JlZ2VuZXJhdGV9Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9tcHREaXJ0eSA/IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYW51YWxcIj5Qcm9tcHQgXHU1REYyXHU2MjRCXHU1MkE4XHU0RkVFXHU2NTM5XHVGRjFCXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU0RjFBXHU4OTg2XHU3NkQ2XHU2MjRCXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwcm9tcHR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIHNldFByb21wdERpcnR5KHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNvcHlcIiBvbkNsaWNrPXtjb3B5UHJvbXB0fT5cbiAgICAgICAgICAgIHtjb3BpZWQgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTU5MERcdTUyMzYgUHJvbXB0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImltcG9ydCB7IHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBzYW1lUG9zaXRpb25zKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGxlZnQuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgb3RoZXIgPSByaWdodFtpbmRleF1cbiAgICByZXR1cm4gaXRlbS5rZXkgPT09IG90aGVyLmtleVxuICAgICAgJiYgaXRlbS5pdGVtID09PSBvdGhlci5pdGVtXG4gICAgICAmJiBpdGVtLml0ZW1JbmRleCA9PT0gb3RoZXIuaXRlbUluZGV4XG4gICAgICAmJiBpdGVtLmxlZnQgPT09IG90aGVyLmxlZnRcbiAgICAgICYmIGl0ZW0udG9wID09PSBvdGhlci50b3BcbiAgfSlcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBjbGlwKSB7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChyZWN0LmxlZnQsIGNsaXAubGVmdClcbiAgY29uc3QgcmlnaHQgPSBNYXRoLm1pbihyZWN0LnJpZ2h0LCBjbGlwLnJpZ2h0KVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChyZWN0LnRvcCwgY2xpcC50b3ApXG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWluKHJlY3QuYm90dG9tLCBjbGlwLmJvdHRvbSlcbiAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgaXRlbXMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgcmV2aWV3VGFyZ2V0cyhpdGVtKS5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBsZXQgZWxlbWVudCA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGVsZW1lbnQgPSBib2FyZC5xdWVyeVNlbGVjdG9yKHRhcmdldC5zZWxlY3RvcilcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudD8uaXNDb25uZWN0ZWQpIHJldHVyblxuICAgICAgY29uc3Qgc2NyZWVuQ29udGVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JylcbiAgICAgIGlmICghc2NyZWVuQ29udGVudCkgcmV0dXJuXG4gICAgICBjb25zdCB2aXNpYmxlID0gaW50ZXJzZWN0UmVjdChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBzY3JlZW5Db250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgICAgaWYgKCF2aXNpYmxlKSByZXR1cm5cbiAgICAgIGNvbnN0IGJhc2VMZWZ0ID0gTWF0aC5yb3VuZCh2aXNpYmxlLnJpZ2h0IC0gYm9hcmRSZWN0LmxlZnQpXG4gICAgICBjb25zdCBiYXNlVG9wID0gTWF0aC5yb3VuZCh2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3ApXG4gICAgICBjb25zdCBvdmVybGFwQ291bnQgPSBwb3NpdGlvbnMuZmlsdGVyKFxuICAgICAgICAocG9zaXRpb24pID0+IE1hdGguYWJzKHBvc2l0aW9uLmJhc2VMZWZ0IC0gYmFzZUxlZnQpIDwgMiAmJiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlVG9wIC0gYmFzZVRvcCkgPCAyLFxuICAgICAgKS5sZW5ndGhcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAga2V5OiBgJHtpdGVtLmlkfToke3RhcmdldEluZGV4fWAsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1JbmRleCxcbiAgICAgICAgdGFyZ2V0SW5kZXgsXG4gICAgICAgIGJhc2VMZWZ0LFxuICAgICAgICBiYXNlVG9wLFxuICAgICAgICBsZWZ0OiBiYXNlTGVmdCArIG92ZXJsYXBDb3VudCAqIDE1LFxuICAgICAgICB0b3A6IGJhc2VUb3AsXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TWFya2Vycyh7IGJvYXJkUmVmLCBpdGVtcywgb25PcGVuUGFuZWwgfSkge1xuICBjb25zdCBbcG9zaXRpb25zLCBzZXRQb3NpdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFthY3RpdmVLZXksIHNldEFjdGl2ZUtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBmcmFtZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IHJlc29sdmVQb3NpdGlvbnMoYm9hcmRSZWYuY3VycmVudCwgaXRlbXMpXG4gICAgc2V0UG9zaXRpb25zKChjdXJyZW50KSA9PiBzYW1lUG9zaXRpb25zKGN1cnJlbnQsIG5leHQpID8gY3VycmVudCA6IG5leHQpXG4gIH0sIFtib2FyZFJlZiwgaXRlbXNdKVxuXG4gIGNvbnN0IHNjaGVkdWxlUmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgZnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZnJhbWVSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIHJlZnJlc2goKVxuICAgIH0pXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIHJlZnJlc2goKVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW3NjaGVkdWxlUmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aXZlS2V5ICYmICFwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KSkgc2V0QWN0aXZlS2V5KG51bGwpXG4gIH0sIFthY3RpdmVLZXksIHBvc2l0aW9uc10pXG5cbiAgY29uc3QgYWN0aXZlID0gcG9zaXRpb25zLmZpbmQoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSlcbiAgY29uc3QgYm9hcmRXaWR0aCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudFdpZHRoIHx8IDBcbiAgY29uc3QgYm9hcmRIZWlnaHQgPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgfHwgMFxuICBjb25zdCBidWJibGVMZWZ0ID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS5sZWZ0ICsgMTYsIGJvYXJkV2lkdGggLSAzMzYpKSA6IDBcbiAgY29uc3QgYnViYmxlVG9wID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS50b3AgKyAyNCwgYm9hcmRIZWlnaHQgLSAxODApKSA6IDBcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlcnNcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU2ODA3XHU4QkIwXCI+XG4gICAgICB7cG9zaXRpb25zLm1hcCgocG9zaXRpb24pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YWN0aXZlS2V5ID09PSBwb3NpdGlvbi5rZXkgPyAnd2YtcmV2aWV3LW1hcmtlciBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tYXJrZXInfVxuICAgICAgICAgIGtleT17cG9zaXRpb24ua2V5fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVx1RkYxQSR7UkVWSUVXX1RZUEVfTEFCRUxTW3Bvc2l0aW9uLml0ZW0udHlwZV19YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBwb3NpdGlvbi5sZWZ0LCB0b3A6IHBvc2l0aW9uLnRvcCB9fVxuICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldEFjdGl2ZUtleSgoY3VycmVudCkgPT4gY3VycmVudCA9PT0gcG9zaXRpb24ua2V5ID8gbnVsbCA6IHBvc2l0aW9uLmtleSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICB7YWN0aXZlID8gKFxuICAgICAgICA8YXNpZGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IGJ1YmJsZUxlZnQsIHRvcDogYnViYmxlVG9wIH19XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke2FjdGl2ZS5pdGVtSW5kZXggKyAxfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgIHthY3RpdmUuaXRlbUluZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbYWN0aXZlLml0ZW0udHlwZV19XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWNsb3NlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUtleShudWxsKX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWluc3RydWN0aW9uXCI+XG4gICAgICAgICAgICB7YWN0aXZlLml0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9XG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRhcmdldHNcIj5cbiAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGFjdGl2ZS5pdGVtKS5tYXAoKHRhcmdldCkgPT4gKFxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItc2VsZWN0b3JcIiBrZXk9e3RhcmdldC5zZWxlY3Rvcn0+e3RhcmdldC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItbW9yZVwiXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlS2V5KG51bGwpXG4gICAgICAgICAgICAgIG9uT3BlblBhbmVsPy4oKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTY3RTVcdTc3MEJcdTY2RjRcdTU5MUFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiY29uc3QgTEFVTkNIRVJfU0laRSA9IDQ4XG5jb25zdCBMQVVOQ0hFUl9NQVJHSU4gPSAyMFxuY29uc3QgRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIE1hdGgubWF4KG1pbiwgbWF4KSlcbn1cblxuZnVuY3Rpb24gY2xhbXBQb3NpdGlvbihib2FyZCwgcG9zaXRpb24pIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIHBvc2l0aW9uXG4gIHJldHVybiB7XG4gICAgeDogY2xhbXAocG9zaXRpb24ueCwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICAgIHk6IGNsYW1wKHBvc2l0aW9uLnksIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSB7XG4gIHJldHVybiBjbGFtcFBvc2l0aW9uKGJvYXJkLCB7XG4gICAgeDogYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICAgIHk6IGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlS2V5KSlcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlPy54KSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWU/LnkpKSByZXR1cm4gdmFsdWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gbG9jYWxTdG9yYWdlIG1heSBiZSB1bmF2YWlsYWJsZSBmb3IgYSBkaXJlY3RseSBvcGVuZWQgbG9jYWwgZmlsZS5cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb24pIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocG9zaXRpb24pKVxuICB9IGNhdGNoIHtcbiAgICAvLyBLZWVwaW5nIHRoZSBsYXVuY2hlciBkcmFnZ2FibGUgaXMgbW9yZSBpbXBvcnRhbnQgdGhhbiBwZXJzaXN0ZW5jZS5cbiAgfVxufVxuXG5mdW5jdGlvbiBDb21tZW50SWNvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk01IDQuNWgxNGEyIDIgMCAwIDEgMiAydjhhMiAyIDAgMCAxLTIgMmgtNmwtNC41IDN2LTNINWEyIDIgMCAwIDEtMi0ydi04YTIgMiAwIDAgMSAyLTJaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNy41IDEwLjVoOVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld0xhdW5jaGVyKHsgYm9hcmRSZWYsIGNvdW50LCBwcm9qZWN0TmFtZSwgb25PcGVuIH0pIHtcbiAgY29uc3Qgc3RvcmFnZUtleSA9IGB3Zi1yZXZpZXctbGF1bmNoZXItcG9zaXRpb246JHtwcm9qZWN0TmFtZX1gXG4gIGNvbnN0IFtwb3NpdGlvbiwgc2V0UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBwb3NpdGlvblJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdXBwcmVzc0NsaWNrUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuXG4gIGNvbnN0IHVwZGF0ZVBvc2l0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHQpID0+IHtcbiAgICBjb25zdCBjbGFtcGVkID0gY2xhbXBQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50LCBuZXh0KVxuICAgIHBvc2l0aW9uUmVmLmN1cnJlbnQgPSBjbGFtcGVkXG4gICAgc2V0UG9zaXRpb24oY2xhbXBlZClcbiAgICByZXR1cm4gY2xhbXBlZFxuICB9LCBbYm9hcmRSZWZdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYm9hcmQgPSBib2FyZFJlZi5jdXJyZW50XG4gICAgaWYgKCFib2FyZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHVwZGF0ZVBvc2l0aW9uKHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuXG4gICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IHVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcbiAgICAgIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBuZXh0KVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICB9LCBbYm9hcmRSZWYsIHN0b3JhZ2VLZXksIHVwZGF0ZVBvc2l0aW9uXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBkcmFnLm1vdmVkXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgIGlmIChwb3NpdGlvblJlZi5jdXJyZW50KSBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb25SZWYuY3VycmVudClcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPD0gMCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtkcmFnZ2luZyA/ICd3Zi1yZXZpZXctbGF1bmNoZXIgaXMtZHJhZ2dpbmcnIDogJ3dmLXJldmlldy1sYXVuY2hlcid9XG4gICAgICBzdHlsZT17cG9zaXRpb24gPyB7IGxlZnQ6IHBvc2l0aW9uLngsIHRvcDogcG9zaXRpb24ueSB9IDogeyByaWdodDogTEFVTkNIRVJfTUFSR0lOLCBib3R0b206IExBVU5DSEVSX01BUkdJTiB9fVxuICAgICAgYXJpYS1sYWJlbD17YFx1NUM1NVx1NUYwMFx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NVx1RkYwQ1x1NTE3MSAke2NvdW50fSBcdTY3NjFcdTRGRUVcdTY1MzlgfVxuICAgICAgZGF0YS10b29sdGlwPVwiXHU1QzU1XHU1RjAwXHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmRSZWYuY3VycmVudClcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgfVxuICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgaWYgKCFkcmFnLm1vdmVkICYmIE1hdGguaHlwb3QoZGVsdGFYLCBkZWx0YVkpIDwgRFJBR19USFJFU0hPTEQpIHJldHVyblxuICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICB1cGRhdGVQb3NpdGlvbih7IHg6IGRyYWcub3JpZ2luLnggKyBkZWx0YVgsIHk6IGRyYWcub3JpZ2luLnkgKyBkZWx0YVkgfSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgaWYgKHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCkge1xuICAgICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgb25PcGVuKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPENvbW1lbnRJY29uIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y291bnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG4iLCAiZXhwb3J0IGNvbnN0IFVOU0FWRURfUkVWSUVXX01FU1NBR0UgPSAnXHU0RkVFXHU2NTM5XHU1MTg1XHU1QkI5XHU1QzFBXHU2NzJBXHU0RkREXHU1QjU4XHVGRjBDXHU3OUJCXHU1RjAwXHU5ODc1XHU5NzYyXHU1NDBFXHU0RjFBXHU0RTIyXHU1OTMxXHUzMDAyXHU2NjJGXHU1NDI2XHU3RUU3XHU3RUVEXHVGRjFGJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgZXZlbnQucmV0dXJuVmFsdWUgPSBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG4gIHJldHVybiBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG59XG4iLCAiZXhwb3J0IGNvbnN0IEFOTk9UQVRJT05fU0NIRU1BX1ZFUlNJT04gPSAxXG5leHBvcnQgY29uc3QgVU5TQVZFRF9BTk5PVEFUSU9OX01FU1NBR0UgPSAnXHU2Q0U4XHU5MUNBXHU4MzQ5XHU3QTNGXHU2NzJBXHU4MEZEXHU0RkREXHU1QjU4XHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4XHU0RTJEXHVGRjBDXHU3OUJCXHU1RjAwXHU5ODc1XHU5NzYyXHU1NDBFXHU0RjFBXHU0RTIyXHU1OTMxXHUzMDAyXHU2NjJGXHU1NDI2XHU3RUU3XHU3RUVEXHVGRjFGJ1xuXG5jb25zdCBTVE9SQUdFX1BSRUZJWCA9ICd3Zi1hbm5vdGF0aW9uczp2MTonXG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudHJpbSgpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTlcXHU0ZTAwLVxcdTlmZmZdKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tK3wtKyQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbm5vdGF0aW9uUHJvamVjdElkKHByb2plY3QpIHtcbiAgcmV0dXJuIFN0cmluZyhwcm9qZWN0Py5pZCB8fCBzbHVnKHByb2plY3Q/Lm5hbWUpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5ub3RhdGlvbkJhc2VSZXZpc2lvbihwcm9qZWN0KSB7XG4gIHJldHVybiBTdHJpbmcocHJvamVjdD8uYW5ub3RhdGlvbnNSZXZpc2lvbiB8fCAnYW5ub3RhdGlvbnMtZW1wdHknKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYW5ub3RhdGlvblN0b3JhZ2VLZXkocHJvamVjdCkge1xuICByZXR1cm4gYCR7U1RPUkFHRV9QUkVGSVh9JHthbm5vdGF0aW9uUHJvamVjdElkKHByb2plY3QpfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFubm90YXRpb25TdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnRVbnNhdmVkQW5ub3RhdGlvbkV4aXQoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBldmVudC5yZXR1cm5WYWx1ZSA9IFVOU0FWRURfQU5OT1RBVElPTl9NRVNTQUdFXG4gIHJldHVybiBVTlNBVkVEX0FOTk9UQVRJT05fTUVTU0FHRVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVBbmNob3IoYW5jaG9yKSB7XG4gIGlmIChhbmNob3I/LmtpbmQgPT09ICdub2RlJyAmJiBhbmNob3Iuc2VsZWN0b3IpIHtcbiAgICBjb25zdCBmYWxsYmFjayA9IGFuY2hvci5mYWxsYmFja1Bvc2l0aW9uXG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6ICdub2RlJyxcbiAgICAgIHNlbGVjdG9yOiBTdHJpbmcoYW5jaG9yLnNlbGVjdG9yKSxcbiAgICAgIC4uLihmYWxsYmFjayAmJiBOdW1iZXIuaXNGaW5pdGUoZmFsbGJhY2sueCkgJiYgTnVtYmVyLmlzRmluaXRlKGZhbGxiYWNrLnkpXG4gICAgICAgID8geyBmYWxsYmFja1Bvc2l0aW9uOiB7XG4gICAgICAgICAgeDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgTnVtYmVyKGZhbGxiYWNrLngpKSksXG4gICAgICAgICAgeTogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgTnVtYmVyKGZhbGxiYWNrLnkpKSksXG4gICAgICAgIH0gfVxuICAgICAgICA6IHt9KSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsga2luZDogJ3NjcmVlbicgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQW5ub3RhdGlvbihhbm5vdGF0aW9uKSB7XG4gIGlmICghYW5ub3RhdGlvbj8uaWQgfHwgIWFubm90YXRpb24/LnNjcmVlbklkIHx8ICFTdHJpbmcoYW5ub3RhdGlvbi5jb250ZW50IHx8ICcnKS50cmltKCkpIHJldHVybiBudWxsXG4gIGNvbnN0IGNyZWF0ZWRBdCA9IGFubm90YXRpb24uY3JlYXRlZEF0IHx8IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICByZXR1cm4ge1xuICAgIGlkOiBTdHJpbmcoYW5ub3RhdGlvbi5pZCksXG4gICAgc2NyZWVuSWQ6IFN0cmluZyhhbm5vdGF0aW9uLnNjcmVlbklkKSxcbiAgICBzY3JlZW5UaXRsZTogU3RyaW5nKGFubm90YXRpb24uc2NyZWVuVGl0bGUgfHwgYW5ub3RhdGlvbi5zY3JlZW5JZCksXG4gICAgYW5jaG9yOiBub3JtYWxpemVBbmNob3IoYW5ub3RhdGlvbi5hbmNob3IpLFxuICAgIGNvbnRlbnQ6IFN0cmluZyhhbm5vdGF0aW9uLmNvbnRlbnQpLnRyaW0oKSxcbiAgICBjcmVhdGVkQXQ6IFN0cmluZyhjcmVhdGVkQXQpLFxuICAgIHVwZGF0ZWRBdDogU3RyaW5nKGFubm90YXRpb24udXBkYXRlZEF0IHx8IGNyZWF0ZWRBdCksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VBbm5vdGF0aW9ucyhwcm9qZWN0KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0Py5hbm5vdGF0aW9ucykpIHJldHVybiBbXVxuICByZXR1cm4gcHJvamVjdC5hbm5vdGF0aW9ucy5tYXAobm9ybWFsaXplQW5ub3RhdGlvbikuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmZ1bmN0aW9uIGFubm90YXRpb25FcXVhbChsZWZ0LCByaWdodCkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplQW5ub3RhdGlvbihsZWZ0KSkgPT09IEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZUFubm90YXRpb24ocmlnaHQpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlBbm5vdGF0aW9uT3BlcmF0aW9ucyhiYXNlLCBvcGVyYXRpb25zKSB7XG4gIGNvbnN0IGJ5SWQgPSBuZXcgTWFwKChiYXNlIHx8IFtdKS5tYXAoKGl0ZW0pID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplQW5ub3RhdGlvbihpdGVtKVxuICAgIHJldHVybiBub3JtYWxpemVkID8gW25vcm1hbGl6ZWQuaWQsIG5vcm1hbGl6ZWRdIDogbnVsbFxuICB9KS5maWx0ZXIoQm9vbGVhbikpXG5cbiAgZm9yIChjb25zdCBvcGVyYXRpb24gb2Ygb3BlcmF0aW9ucyB8fCBbXSkge1xuICAgIGlmIChvcGVyYXRpb24/Lm9wID09PSAnZGVsZXRlJyAmJiBvcGVyYXRpb24uaWQpIHtcbiAgICAgIGJ5SWQuZGVsZXRlKFN0cmluZyhvcGVyYXRpb24uaWQpKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYgKG9wZXJhdGlvbj8ub3AgPT09ICd1cHNlcnQnKSB7XG4gICAgICBjb25zdCBhbm5vdGF0aW9uID0gbm9ybWFsaXplQW5ub3RhdGlvbihvcGVyYXRpb24uYW5ub3RhdGlvbilcbiAgICAgIGlmIChhbm5vdGF0aW9uKSBieUlkLnNldChhbm5vdGF0aW9uLmlkLCBhbm5vdGF0aW9uKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uYnlJZC52YWx1ZXMoKV0uc29ydCgobGVmdCwgcmlnaHQpID0+IHtcbiAgICBjb25zdCB0aW1lID0gbGVmdC5jcmVhdGVkQXQubG9jYWxlQ29tcGFyZShyaWdodC5jcmVhdGVkQXQpXG4gICAgcmV0dXJuIHRpbWUgfHwgbGVmdC5pZC5sb2NhbGVDb21wYXJlKHJpZ2h0LmlkKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVjb25jaWxlQW5ub3RhdGlvbk9wZXJhdGlvbnMoYmFzZSwgb3BlcmF0aW9ucykge1xuICBjb25zdCBiYXNlQnlJZCA9IG5ldyBNYXAoKGJhc2UgfHwgW10pLm1hcCgoaXRlbSkgPT4gW2l0ZW0uaWQsIG5vcm1hbGl6ZUFubm90YXRpb24oaXRlbSldKSlcbiAgY29uc3QgbGF0ZXN0ID0gbmV3IE1hcCgpXG5cbiAgZm9yIChjb25zdCBvcGVyYXRpb24gb2Ygb3BlcmF0aW9ucyB8fCBbXSkge1xuICAgIGlmIChvcGVyYXRpb24/Lm9wID09PSAnZGVsZXRlJyAmJiBvcGVyYXRpb24uaWQpIHtcbiAgICAgIGxhdGVzdC5zZXQoU3RyaW5nKG9wZXJhdGlvbi5pZCksIHsgb3A6ICdkZWxldGUnLCBpZDogU3RyaW5nKG9wZXJhdGlvbi5pZCkgfSlcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmIChvcGVyYXRpb24/Lm9wID09PSAndXBzZXJ0Jykge1xuICAgICAgY29uc3QgYW5ub3RhdGlvbiA9IG5vcm1hbGl6ZUFubm90YXRpb24ob3BlcmF0aW9uLmFubm90YXRpb24pXG4gICAgICBpZiAoYW5ub3RhdGlvbikgbGF0ZXN0LnNldChhbm5vdGF0aW9uLmlkLCB7IG9wOiAndXBzZXJ0JywgYW5ub3RhdGlvbiB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4ubGF0ZXN0LnZhbHVlcygpXS5maWx0ZXIoKG9wZXJhdGlvbikgPT4ge1xuICAgIGNvbnN0IGJhc2VJdGVtID0gYmFzZUJ5SWQuZ2V0KG9wZXJhdGlvbi5vcCA9PT0gJ2RlbGV0ZScgPyBvcGVyYXRpb24uaWQgOiBvcGVyYXRpb24uYW5ub3RhdGlvbi5pZClcbiAgICBpZiAob3BlcmF0aW9uLm9wID09PSAnZGVsZXRlJykgcmV0dXJuICEhYmFzZUl0ZW1cbiAgICByZXR1cm4gIWJhc2VJdGVtIHx8ICFhbm5vdGF0aW9uRXF1YWwoYmFzZUl0ZW0sIG9wZXJhdGlvbi5hbm5vdGF0aW9uKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0QW5ub3RhdGlvbk9wZXJhdGlvbihiYXNlLCBvcGVyYXRpb25zLCBhbm5vdGF0aW9uKSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVBbm5vdGF0aW9uKGFubm90YXRpb24pXG4gIGlmICghbm9ybWFsaXplZCkgcmV0dXJuIHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKGJhc2UsIG9wZXJhdGlvbnMpXG4gIHJldHVybiByZWNvbmNpbGVBbm5vdGF0aW9uT3BlcmF0aW9ucyhiYXNlLCBbXG4gICAgLi4uKG9wZXJhdGlvbnMgfHwgW10pLmZpbHRlcigob3BlcmF0aW9uKSA9PiB7XG4gICAgICBjb25zdCBpZCA9IG9wZXJhdGlvbi5vcCA9PT0gJ2RlbGV0ZScgPyBvcGVyYXRpb24uaWQgOiBvcGVyYXRpb24uYW5ub3RhdGlvbj8uaWRcbiAgICAgIHJldHVybiBpZCAhPT0gbm9ybWFsaXplZC5pZFxuICAgIH0pLFxuICAgIHsgb3A6ICd1cHNlcnQnLCBhbm5vdGF0aW9uOiBub3JtYWxpemVkIH0sXG4gIF0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVBbm5vdGF0aW9uT3BlcmF0aW9uKGJhc2UsIG9wZXJhdGlvbnMsIGlkKSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRJZCA9IFN0cmluZyhpZClcbiAgY29uc3QgYmFzZUhhc0l0ZW0gPSAoYmFzZSB8fCBbXSkuc29tZSgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gbm9ybWFsaXplZElkKVxuICBjb25zdCBuZXh0ID0gKG9wZXJhdGlvbnMgfHwgW10pLmZpbHRlcigob3BlcmF0aW9uKSA9PiB7XG4gICAgY29uc3Qgb3BlcmF0aW9uSWQgPSBvcGVyYXRpb24ub3AgPT09ICdkZWxldGUnID8gb3BlcmF0aW9uLmlkIDogb3BlcmF0aW9uLmFubm90YXRpb24/LmlkXG4gICAgcmV0dXJuIG9wZXJhdGlvbklkICE9PSBub3JtYWxpemVkSWRcbiAgfSlcbiAgaWYgKGJhc2VIYXNJdGVtKSBuZXh0LnB1c2goeyBvcDogJ2RlbGV0ZScsIGlkOiBub3JtYWxpemVkSWQgfSlcbiAgcmV0dXJuIHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKGJhc2UsIG5leHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQW5ub3RhdGlvbkRyYWZ0KHN0b3JhZ2UsIHByb2plY3QpIHtcbiAgY29uc3QgZW1wdHkgPSB7XG4gICAgc2NoZW1hVmVyc2lvbjogQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTixcbiAgICBwcm9qZWN0SWQ6IGFubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCksXG4gICAgYmFzZVJldmlzaW9uOiBhbm5vdGF0aW9uQmFzZVJldmlzaW9uKHByb2plY3QpLFxuICAgIG9wZXJhdGlvbnM6IFtdLFxuICB9XG4gIGlmICghc3RvcmFnZT8uZ2V0SXRlbSkgcmV0dXJuIGVtcHR5XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzdG9yYWdlLmdldEl0ZW0oYW5ub3RhdGlvblN0b3JhZ2VLZXkocHJvamVjdCkpIHx8ICdudWxsJylcbiAgICBpZiAoIXBhcnNlZCB8fCBwYXJzZWQuc2NoZW1hVmVyc2lvbiAhPT0gQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTikgcmV0dXJuIGVtcHR5XG4gICAgaWYgKHBhcnNlZC5wcm9qZWN0SWQgIT09IGVtcHR5LnByb2plY3RJZCB8fCAhQXJyYXkuaXNBcnJheShwYXJzZWQub3BlcmF0aW9ucykpIHJldHVybiBlbXB0eVxuICAgIHJldHVybiB7XG4gICAgICAuLi5lbXB0eSxcbiAgICAgIGJhc2VSZXZpc2lvbjogU3RyaW5nKHBhcnNlZC5iYXNlUmV2aXNpb24gfHwgZW1wdHkuYmFzZVJldmlzaW9uKSxcbiAgICAgIG9wZXJhdGlvbnM6IHJlY29uY2lsZUFubm90YXRpb25PcGVyYXRpb25zKGJhc2VBbm5vdGF0aW9ucyhwcm9qZWN0KSwgcGFyc2VkLm9wZXJhdGlvbnMpLFxuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGVtcHR5XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVBbm5vdGF0aW9uRHJhZnQoc3RvcmFnZSwgcHJvamVjdCwgb3BlcmF0aW9ucykge1xuICBpZiAoIXN0b3JhZ2U/LnNldEl0ZW0gfHwgIXN0b3JhZ2U/LnJlbW92ZUl0ZW0pIHJldHVybiBmYWxzZVxuICBjb25zdCBrZXkgPSBhbm5vdGF0aW9uU3RvcmFnZUtleShwcm9qZWN0KVxuICB0cnkge1xuICAgIGlmICghb3BlcmF0aW9ucz8ubGVuZ3RoKSB7XG4gICAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgc3RvcmFnZS5zZXRJdGVtKGtleSwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc2NoZW1hVmVyc2lvbjogQU5OT1RBVElPTl9TQ0hFTUFfVkVSU0lPTixcbiAgICAgIHByb2plY3RJZDogYW5ub3RhdGlvblByb2plY3RJZChwcm9qZWN0KSxcbiAgICAgIGJhc2VSZXZpc2lvbjogYW5ub3RhdGlvbkJhc2VSZXZpc2lvbihwcm9qZWN0KSxcbiAgICAgIG9wZXJhdGlvbnMsXG4gICAgfSkpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFubm90YXRpb25FeHBvcnQocHJvamVjdCwgYW5ub3RhdGlvbnMsIG9wZXJhdGlvbnMgPSBbXSkge1xuICByZXR1cm4ge1xuICAgIHNjaGVtYVZlcnNpb246IEFOTk9UQVRJT05fU0NIRU1BX1ZFUlNJT04sXG4gICAgcHJvamVjdElkOiBhbm5vdGF0aW9uUHJvamVjdElkKHByb2plY3QpLFxuICAgIHByb2plY3ROYW1lOiBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInLFxuICAgIGJhc2VSZXZpc2lvbjogYW5ub3RhdGlvbkJhc2VSZXZpc2lvbihwcm9qZWN0KSxcbiAgICBleHBvcnRlZEF0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgYW5ub3RhdGlvbnM6IChhbm5vdGF0aW9ucyB8fCBbXSkubWFwKG5vcm1hbGl6ZUFubm90YXRpb24pLmZpbHRlcihCb29sZWFuKSxcbiAgICBvcGVyYXRpb25zOiByZWNvbmNpbGVBbm5vdGF0aW9uT3BlcmF0aW9ucyhiYXNlQW5ub3RhdGlvbnMocHJvamVjdCksIG9wZXJhdGlvbnMpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUFubm90YXRpb25JbXBvcnQodmFsdWUsIHByb2plY3QpIHtcbiAgY29uc3QgcGFyc2VkID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2UodmFsdWUpIDogdmFsdWVcbiAgaWYgKCFwYXJzZWQgfHwgcGFyc2VkLnNjaGVtYVZlcnNpb24gIT09IEFOTk9UQVRJT05fU0NIRU1BX1ZFUlNJT04pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1NEUwRFx1NjUyRlx1NjMwMVx1NzY4NFx1NkNFOFx1OTFDQSBKU09OIFx1NzI0OFx1NjcyQycpXG4gIH1cbiAgaWYgKHBhcnNlZC5wcm9qZWN0SWQgIT09IGFubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFx1NkNFOFx1OTFDQSBKU09OIFx1NUM1RVx1NEU4RVx1NTE3Nlx1NEVENlx1OTg3OVx1NzZFRVx1RkYxQSR7cGFyc2VkLnByb2plY3ROYW1lIHx8IHBhcnNlZC5wcm9qZWN0SWR9YClcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkocGFyc2VkLmFubm90YXRpb25zKSkgdGhyb3cgbmV3IEVycm9yKCdcdTZDRThcdTkxQ0EgSlNPTiBcdTdGM0FcdTVDMTEgYW5ub3RhdGlvbnMgXHU2NTcwXHU3RUM0JylcbiAgY29uc3QgYW5ub3RhdGlvbnMgPSBwYXJzZWQuYW5ub3RhdGlvbnMubWFwKG5vcm1hbGl6ZUFubm90YXRpb24pLmZpbHRlcihCb29sZWFuKVxuICBpZiAoYW5ub3RhdGlvbnMubGVuZ3RoICE9PSBwYXJzZWQuYW5ub3RhdGlvbnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ1x1NkNFOFx1OTFDQSBKU09OIFx1NTMwNVx1NTQyQlx1NjVFMFx1NjU0OFx1NkNFOFx1OTFDQScpXG4gIGNvbnN0IG9wZXJhdGlvbnMgPSByZWNvbmNpbGVBbm5vdGF0aW9uT3BlcmF0aW9ucyhcbiAgICBiYXNlQW5ub3RhdGlvbnMocHJvamVjdCksXG4gICAgQXJyYXkuaXNBcnJheShwYXJzZWQub3BlcmF0aW9ucykgPyBwYXJzZWQub3BlcmF0aW9ucyA6IFtdLFxuICApXG4gIHJldHVybiB7IC4uLnBhcnNlZCwgYW5ub3RhdGlvbnMsIG9wZXJhdGlvbnMgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRBbm5vdGF0aW9uU3luY1Byb21wdChwcm9qZWN0LCBvcGVyYXRpb25zKSB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcHJvamVjdD8ubmFtZSB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCJ1xuICBjb25zdCBub3JtYWxpemVkID0gcmVjb25jaWxlQW5ub3RhdGlvbk9wZXJhdGlvbnMoYmFzZUFubm90YXRpb25zKHByb2plY3QpLCBvcGVyYXRpb25zKVxuICBjb25zdCBwYXlsb2FkID0ge1xuICAgIHNjaGVtYVZlcnNpb246IEFOTk9UQVRJT05fU0NIRU1BX1ZFUlNJT04sXG4gICAgcHJvamVjdElkOiBhbm5vdGF0aW9uUHJvamVjdElkKHByb2plY3QpLFxuICAgIGJhc2VSZXZpc2lvbjogYW5ub3RhdGlvbkJhc2VSZXZpc2lvbihwcm9qZWN0KSxcbiAgICBvcGVyYXRpb25zOiBub3JtYWxpemVkLFxuICB9XG4gIHJldHVybiBbXG4gICAgYFx1OEJGN1x1NjI4QVx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4Qlx1MzAwQyR7cHJvamVjdE5hbWV9XHUzMDBEXHU3Njg0XHU2NzJDXHU2NzNBXHU2Q0U4XHU5MUNBXHU1NDBDXHU2QjY1XHU1MjMwXHU0RTFBXHU1MkExXHU2RTkwXHU3ODAxXHUzMDAyYCxcbiAgICAnJyxcbiAgICAnXHU1NDBDXHU2QjY1XHU3RUE2XHU2NzVGXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdTRGRUVcdTY1MzlcdTRFMUFcdTUyQTEgc3JjL1x1RkYxQlx1NEUwRFx1ODk4MVx1NEZFRVx1NjUzOSBmcmFtZXdvcmsvIFx1NjIxNiBkaXN0L2FwcC5qc1x1MzAwMicsXG4gICAgJy0gXHU2Q0U4XHU5MUNBXHU3Njg0XHU2QjYzXHU1RjBGXHU2NTcwXHU2MzZFXHU2NTg3XHU0RUY2XHU2NjJGIHNyYy9hbm5vdGF0aW9ucy5qc1x1RkYxQlx1ODJFNVx1NEUwRFx1NUI1OFx1NTcyOFx1NTIxOVx1NTIxQlx1NUVGQVx1MzAwMicsXG4gICAgJy0gc3JjL2Fubm90YXRpb25zLmpzIFx1NUJGQ1x1NTFGQSBhbm5vdGF0aW9uc1JldmlzaW9uIFx1NEUwRSBhbm5vdGF0aW9uc1x1RkYwQ1x1NUU3Nlx1NzUzMSBzcmMvcHJvamVjdC5qcyBcdTVCRkNcdTUxNjVcdTU0MEVcdTYzMDJcdTUyMzBcdTU0MENcdTU0MERcdTVCNTdcdTZCQjVcdTMwMDInLFxuICAgICctIFx1NjMwOVx1NkNFOFx1OTFDQSBpZCBcdTVFNDJcdTdCNDlcdTU0MDhcdTVFNzZcdUZGMUF1cHNlcnQgXHU2NUIwXHU1ODlFXHU2MjE2XHU2NkZGXHU2MzYyXHU1NDBDIGlkIFx1NkNFOFx1OTFDQVx1RkYwQ2RlbGV0ZSBcdTUyMjBcdTk2NjRcdTU0MEMgaWQgXHU2Q0U4XHU5MUNBXHVGRjFCXHU0RkREXHU3NTU5XHU2NzJBXHU2RDg5XHU1M0NBXHU3Njg0XHU2Q0U4XHU5MUNBXHUzMDAyJyxcbiAgICAnLSBcdTY2RjRcdTY1QjAgYW5ub3RhdGlvbnNSZXZpc2lvbiBcdTRFM0FcdTY1QjBcdTc2ODRcdTU1MkZcdTRFMDBcdTUwM0NcdTMwMDJcdTRFMERcdTg5ODFcdTYyOEFcdTZDRThcdTkxQ0FcdTY1ODdcdTVCNTdcdTUxOTlcdThGREIgc2NyZWVucy9sYXlvdXRzIEpTWFx1MzAwMicsXG4gICAgJy0gXHU1QjhDXHU2MjEwXHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHVGRjBDXHU1RTc2XHU5QThDXHU4QkMxXHU2Q0U4XHU5MUNBXHU2ODA3XHU4QkIwXHUzMDAxXHU5ODc1XHU5NzYyL1x1NkEyMVx1NTc1N1x1NUI5QVx1NEY0RFx1NTNDQVx1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRlx1MzAwMicsXG4gICAgJycsXG4gICAgJ1x1NUY4NVx1NTQwQ1x1NkI2NVx1NjRDRFx1NEY1Q1x1RkYxQScsXG4gICAgJ2BgYGpzb24nLFxuICAgIEpTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDIpLFxuICAgICdgYGAnLFxuICBdLmpvaW4oJ1xcbicpXG59XG4iLCAiaW1wb3J0IHtcbiAgYW5ub3RhdGlvblByb2plY3RJZCxcbiAgYnVpbGRBbm5vdGF0aW9uU3luY1Byb21wdCxcbiAgY3JlYXRlQW5ub3RhdGlvbkV4cG9ydCxcbiAgcGFyc2VBbm5vdGF0aW9uSW1wb3J0LFxufSBmcm9tICcuL2Fubm90YXRpb25zLmpzJ1xuXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmZ1bmN0aW9uIG1ha2VBbm5vdGF0aW9uSWQoKSB7XG4gIGlmIChnbG9iYWxUaGlzLmNyeXB0bz8ucmFuZG9tVVVJRCkgcmV0dXJuIGBub3RlLSR7Z2xvYmFsVGhpcy5jcnlwdG8ucmFuZG9tVVVJRCgpfWBcbiAgcmV0dXJuIGBub3RlLSR7RGF0ZS5ub3coKX0tJHtNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zbGljZSgyLCA5KX1gXG59XG5cbmZ1bmN0aW9uIGZhbGxiYWNrUG9zaXRpb24oc2VsZWN0aW9uKSB7XG4gIGNvbnN0IGVsZW1lbnRSZWN0ID0gc2VsZWN0aW9uPy5lbGVtZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3Q/LigpXG4gIGNvbnN0IHJvb3RSZWN0ID0gc2VsZWN0aW9uPy5jb250ZW50Um9vdD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0Py4oKVxuICBpZiAoIWVsZW1lbnRSZWN0IHx8ICFyb290UmVjdCB8fCAhcm9vdFJlY3Qud2lkdGggfHwgIXJvb3RSZWN0LmhlaWdodCkgcmV0dXJuIHVuZGVmaW5lZFxuICByZXR1cm4ge1xuICAgIHg6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChlbGVtZW50UmVjdC5yaWdodCAtIHJvb3RSZWN0LmxlZnQpIC8gcm9vdFJlY3Qud2lkdGgpKSxcbiAgICB5OiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCAoZWxlbWVudFJlY3QudG9wIC0gcm9vdFJlY3QudG9wKSAvIHJvb3RSZWN0LmhlaWdodCkpLFxuICB9XG59XG5cbmZ1bmN0aW9uIGRvd25sb2FkSnNvbihmaWxlbmFtZSwgdmFsdWUpIHtcbiAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeSh2YWx1ZSwgbnVsbCwgMildLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTgnIH0pXG4gIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYilcbiAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICBsaW5rLmhyZWYgPSB1cmxcbiAgbGluay5kb3dubG9hZCA9IGZpbGVuYW1lXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGluaylcbiAgbGluay5jbGljaygpXG4gIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluaylcbiAgLy8gXHU3RUQ5IGZpbGU6Ly8gXHU0RTBFXHU4RjgzXHU2MTYyXHU2RDRGXHU4OUM4XHU1NjY4XHU4REIzXHU1OTFGXHU2NUY2XHU5NUY0XHU2M0E1XHU3QkExIEJsb2IgXHU0RTBCXHU4RjdEXHVGRjBDXHU1MThEXHU5MUNBXHU2NTNFIFVSTFx1MzAwMlxuICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCksIDE1MDApXG59XG5cbmZ1bmN0aW9uIEFubm90YXRpb25JdGVtKHsgYW5ub3RhdGlvbiwgcGVuZGluZywgb25VcHNlcnQsIG9uRGVsZXRlIH0pIHtcbiAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb250ZW50LCBzZXRDb250ZW50XSA9IFJlYWN0LnVzZVN0YXRlKGFubm90YXRpb24uY29udGVudClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gc2V0Q29udGVudChhbm5vdGF0aW9uLmNvbnRlbnQpLCBbYW5ub3RhdGlvbi5jb250ZW50XSlcblxuICBjb25zdCBjb21taXQgPSAoKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGNvbnRlbnQudHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkKSByZXR1cm5cbiAgICBvblVwc2VydCh7IC4uLmFubm90YXRpb24sIGNvbnRlbnQ6IG5vcm1hbGl6ZWQsIHVwZGF0ZWRBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pXG4gICAgc2V0RWRpdGluZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGxpIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24taXRlbVwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWl0ZW0tbWV0YVwiPlxuICAgICAgICA8c3Ryb25nPnthbm5vdGF0aW9uLnNjcmVlblRpdGxlfTwvc3Ryb25nPlxuICAgICAgICA8c3Bhbj57YW5ub3RhdGlvbi5hbmNob3Iua2luZCA9PT0gJ25vZGUnID8gJ1x1NkEyMVx1NTc1N1x1NkNFOFx1OTFDQScgOiAnXHU5ODc1XHU5NzYyXHU2Q0U4XHU5MUNBJ308L3NwYW4+XG4gICAgICAgIHtwZW5kaW5nID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1wZW5kaW5nXCI+XHU1Rjg1XHU1NDBDXHU2QjY1PC9zcGFuPiA6IDxzcGFuPlx1NTM5Rlx1NTc4Qlx1NTE4NVx1N0Y2RTwvc3Bhbj59XG4gICAgICA8L2Rpdj5cbiAgICAgIHthbm5vdGF0aW9uLmFuY2hvci5raW5kID09PSAnbm9kZScgPyAoXG4gICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tc2VsZWN0b3JcIj57YW5ub3RhdGlvbi5hbmNob3Iuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7ZWRpdGluZyA/IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tZWRpdFwiXG4gICAgICAgICAgICB2YWx1ZT17Y29udGVudH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldENvbnRlbnQoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1pdGVtLWFjdGlvbnNcIj5cbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2NvbW1pdH0gZGlzYWJsZWQ9eyFjb250ZW50LnRyaW0oKX0+XHU0RkREXHU1QjU4PC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldENvbnRlbnQoYW5ub3RhdGlvbi5jb250ZW50KVxuICAgICAgICAgICAgICBzZXRFZGl0aW5nKGZhbHNlKVxuICAgICAgICAgICAgfX0+XHU1M0Q2XHU2RDg4PC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvPlxuICAgICAgKSA6IChcbiAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1jb250ZW50XCI+e2Fubm90YXRpb24uY29udGVudH08L3A+XG4gICAgICApfVxuICAgICAgeyFlZGl0aW5nID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24taXRlbS1hY3Rpb25zXCI+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0RWRpdGluZyh0cnVlKX0+XHU3RjE2XHU4RjkxPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25EZWxldGUoYW5ub3RhdGlvbi5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvbGk+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFubm90YXRpb25QYW5lbCh7XG4gIHByb2plY3QsXG4gIHZpc2libGUgPSB0cnVlLFxuICBzZWxlY3Rpb24sXG4gIGN1cnJlbnRTY3JlZW5JZCxcbiAgYW5ub3RhdGlvbnMsXG4gIG9wZXJhdGlvbnMsXG4gIHN0b3JhZ2VTYXZlZCxcbiAgb25BZGQsXG4gIG9uVXBzZXJ0LFxuICBvbkRlbGV0ZSxcbiAgb25JbXBvcnQsXG4gIG9uQ2xlYXJEcmFmdCxcbiAgb25DbGVhclNlbGVjdGlvbixcbiAgb25DbG9zZSxcbn0pIHtcbiAgY29uc3Qgc2VsZWN0ZWRTY3JlZW5JZCA9IHNlbGVjdGlvbj8uc2NyZWVuSWQgfHwgY3VycmVudFNjcmVlbklkIHx8IHByb2plY3Quc2NyZWVuc1swXT8uaWRcbiAgY29uc3QgW3Njb3BlLCBzZXRTY29wZV0gPSBSZWFjdC51c2VTdGF0ZShzZWxlY3Rpb24gPyAnbm9kZScgOiAnc2NyZWVuJylcbiAgY29uc3QgW3NjcmVlbklkLCBzZXRTY3JlZW5JZF0gPSBSZWFjdC51c2VTdGF0ZShzZWxlY3RlZFNjcmVlbklkKVxuICBjb25zdCBbY29udGVudCwgc2V0Q29udGVudF0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKCdjdXJyZW50JylcbiAgY29uc3QgW21lc3NhZ2UsIHNldE1lc3NhZ2VdID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oXG4gICAgKCkgPT4gYnVpbGRBbm5vdGF0aW9uU3luY1Byb21wdChwcm9qZWN0LCBvcGVyYXRpb25zKSxcbiAgICBbb3BlcmF0aW9ucywgcHJvamVjdF0sXG4gIClcbiAgY29uc3QgW3Byb21wdCwgc2V0UHJvbXB0XSA9IFJlYWN0LnVzZVN0YXRlKGdlbmVyYXRlZFByb21wdClcbiAgY29uc3QgW3Byb21wdERpcnR5LCBzZXRQcm9tcHREaXJ0eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NsZWFyQXJtZWQsIHNldENsZWFyQXJtZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGlucHV0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRTY3JlZW5JZChzZWxlY3RlZFNjcmVlbklkKVxuICAgIGlmIChzZWxlY3Rpb24pIHNldFNjb3BlKCdub2RlJylcbiAgfSwgW3NlbGVjdGVkU2NyZWVuSWQsIHNlbGVjdGlvbl0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWNsZWFyQXJtZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCB0aW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENsZWFyQXJtZWQoZmFsc2UpLCA1MDAwKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVyKVxuICB9LCBbY2xlYXJBcm1lZF0pXG5cbiAgY29uc3QgYWN0aXZlU2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkgfHwgcHJvamVjdC5zY3JlZW5zWzBdXG4gIGNvbnN0IHBlbmRpbmdJZHMgPSBuZXcgU2V0KChvcGVyYXRpb25zIHx8IFtdKS5tYXAoKG9wZXJhdGlvbikgPT4gKFxuICAgIG9wZXJhdGlvbi5vcCA9PT0gJ2RlbGV0ZScgPyBvcGVyYXRpb24uaWQgOiBvcGVyYXRpb24uYW5ub3RhdGlvbj8uaWRcbiAgKSkpXG4gIGNvbnN0IHZpc2libGVBbm5vdGF0aW9ucyA9IGFubm90YXRpb25zLmZpbHRlcigoYW5ub3RhdGlvbikgPT4ge1xuICAgIGlmIChmaWx0ZXIgPT09ICdjdXJyZW50JykgcmV0dXJuIGFubm90YXRpb24uc2NyZWVuSWQgPT09IHNlbGVjdGVkU2NyZWVuSWRcbiAgICByZXR1cm4gdHJ1ZVxuICB9KVxuXG4gIGNvbnN0IGFkZCA9ICgpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gY29udGVudC50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQgfHwgIWFjdGl2ZVNjcmVlbikgcmV0dXJuXG4gICAgY29uc3QgdXNlTm9kZSA9IHNjb3BlID09PSAnbm9kZScgJiYgc2VsZWN0aW9uXG4gICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgb25BZGQoe1xuICAgICAgaWQ6IG1ha2VBbm5vdGF0aW9uSWQoKSxcbiAgICAgIHNjcmVlbklkOiB1c2VOb2RlID8gc2VsZWN0aW9uLnNjcmVlbklkIDogYWN0aXZlU2NyZWVuLmlkLFxuICAgICAgc2NyZWVuVGl0bGU6IHVzZU5vZGUgPyBzZWxlY3Rpb24uc2NyZWVuVGl0bGUgOiBhY3RpdmVTY3JlZW4udGl0bGUsXG4gICAgICBhbmNob3I6IHVzZU5vZGVcbiAgICAgICAgPyB7XG4gICAgICAgICAga2luZDogJ25vZGUnLFxuICAgICAgICAgIHNlbGVjdG9yOiBzZWxlY3Rpb24uc2VsZWN0b3IsXG4gICAgICAgICAgZmFsbGJhY2tQb3NpdGlvbjogZmFsbGJhY2tQb3NpdGlvbihzZWxlY3Rpb24pLFxuICAgICAgICB9XG4gICAgICAgIDogeyBraW5kOiAnc2NyZWVuJyB9LFxuICAgICAgY29udGVudDogbm9ybWFsaXplZCxcbiAgICAgIGNyZWF0ZWRBdDogbm93LFxuICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgfSlcbiAgICBzZXRDb250ZW50KCcnKVxuICAgIHNldE1lc3NhZ2UoJ1x1NkNFOFx1OTFDQVx1NURGMlx1NEZERFx1NUI1OFx1NTcyOFx1NjcyQ1x1NjczQVx1RkYwQ1x1N0I0OVx1NUY4NVx1NTQwQ1x1NkI2NVx1NTIzMFx1NTM5Rlx1NTc4Qlx1MzAwMicpXG4gIH1cblxuICBjb25zdCBleHBvcnRSZXZpZXcgPSAoKSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGNyZWF0ZUFubm90YXRpb25FeHBvcnQocHJvamVjdCwgYW5ub3RhdGlvbnMsIG9wZXJhdGlvbnMpXG4gICAgZG93bmxvYWRKc29uKGAke2Fubm90YXRpb25Qcm9qZWN0SWQocHJvamVjdCl9LndpcmVmcmFtZS1hbm5vdGF0aW9ucy5qc29uYCwgZmlsZSlcbiAgICBzZXRNZXNzYWdlKGBcdTVERjJcdTVCRkNcdTUxRkEgJHthbm5vdGF0aW9ucy5sZW5ndGh9IFx1Njc2MVx1NkNFOFx1OTFDQVx1MzAwMmApXG4gIH1cblxuICBjb25zdCBpbXBvcnRSZXZpZXcgPSBhc3luYyAoZmlsZSkgPT4ge1xuICAgIGlmICghZmlsZSkgcmV0dXJuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQW5ub3RhdGlvbkltcG9ydChhd2FpdCBmaWxlLnRleHQoKSwgcHJvamVjdClcbiAgICAgIG9uSW1wb3J0KHBhcnNlZC5hbm5vdGF0aW9ucywgcGFyc2VkLm9wZXJhdGlvbnMpXG4gICAgICBzZXRNZXNzYWdlKGBcdTVERjJcdTVCRkNcdTUxNjVcdTVFNzZcdTU0MDhcdTVFNzYgJHtwYXJzZWQuYW5ub3RhdGlvbnMubGVuZ3RofSBcdTY3NjFcdTZDRThcdTkxQ0FcdTMwMDJgKVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzZXRNZXNzYWdlKGVycm9yPy5tZXNzYWdlIHx8ICdcdTVCRkNcdTUxNjVcdTU5MzFcdThEMjVcdTMwMDInKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoaW5wdXRSZWYuY3VycmVudCkgaW5wdXRSZWYuY3VycmVudC52YWx1ZSA9ICcnXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsIHdmLWFubm90YXRpb24tcGFuZWxcIiBhcmlhLWxhYmVsPVwiXHU1MzlGXHU1NzhCXHU2Q0U4XHU5MUNBXCIgaGlkZGVuPXshdmlzaWJsZX0+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLXRpdGxlXCI+XHU1MzlGXHU1NzhCXHU2Q0U4XHU5MUNBPC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWNvdW50XCI+e2Fubm90YXRpb25zLmxlbmd0aH0gXHU2NzYxXHU2Q0U4XHU5MUNBPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtYm9keVwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2REZCXHU1MkEwXHU2Q0U4XHU5MUNBPC9oMj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tc2NvcGVcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU2Q0U4XHU5MUNBXHU4MzAzXHU1NkY0XCI+XG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e3Njb3BlID09PSAnc2NyZWVuJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNjb3BlKCdzY3JlZW4nKX1cbiAgICAgICAgICAgID5cdTk4NzVcdTk3NjI8L2J1dHRvbj5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NvcGUgPT09ICdub2RlJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXshc2VsZWN0aW9ufVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTY29wZSgnbm9kZScpfVxuICAgICAgICAgICAgPlx1NjI0MFx1OTAwOVx1NkEyMVx1NTc1NzwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtzY29wZSA9PT0gJ25vZGUnICYmIHNlbGVjdGlvbiA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi10YXJnZXRcIj5cbiAgICAgICAgICAgICAgPHNwYW4+e3NlbGVjdGlvbi5zY3JlZW5UaXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxjb2RlPntzZWxlY3Rpb24uc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtvbkNsZWFyU2VsZWN0aW9ufT5cdTUzRDZcdTZEODhcdTkwMDlcdTYyRTk8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1OTg3NVx1OTc2Mjwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNlbGVjdCB2YWx1ZT17c2NyZWVuSWR9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFNjcmVlbklkKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IChcbiAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9e3NjcmVlbi5pZH0ga2V5PXtzY3JlZW4uaWR9PntzY3JlZW4udGl0bGV9IFx1MDBCNyB7c2NyZWVuLmlkfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgKX1cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTZDRThcdTkxQ0FcdTUxODVcdTVCQjk8L3NwYW4+XG4gICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgdmFsdWU9e2NvbnRlbnR9XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzY29wZSA9PT0gJ25vZGUnID8gJ1x1OEJGNFx1NjYwRVx1MzAwMVx1NjNEMFx1OTVFRVx1NjIxNlx1OEJCMFx1NUY1NVx1OEZEOVx1NEUyQVx1NkEyMVx1NTc1N1x1NzY4NFx1OEJCRVx1OEJBMVx1NTFCM1x1N0I1NicgOiAnXHU4QkY0XHU2NjBFXHUzMDAxXHU2M0QwXHU5NUVFXHU2MjE2XHU4QkIwXHU1RjU1XHU2NTc0XHU0RTJBXHU5ODc1XHU5NzYyXHU3Njg0XHU4QkJFXHU4QkExXHU1MUIzXHU3QjU2J31cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0Q29udGVudChldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIiBkaXNhYmxlZD17IWNvbnRlbnQudHJpbSgpfSBvbkNsaWNrPXthZGR9PlxuICAgICAgICAgICAgXHU2REZCXHU1MkEwXHU1RTc2XHU0RkREXHU1QjU4XHU1MjMwXHU2NzJDXHU2NzNBXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPXtgd2YtYW5ub3RhdGlvbi1zYXZlLXN0YXRlJHtzdG9yYWdlU2F2ZWQgPyAnJyA6ICcgaXMtZXJyb3InfWB9PlxuICAgICAgICAgICAge3N0b3JhZ2VTYXZlZCA/IGAke29wZXJhdGlvbnMubGVuZ3RofSBcdTY3NjFcdTY3MkNcdTY3M0FcdTUzRDhcdTY2RjRcdTVGODVcdTU0MENcdTZCNjVgIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NjVFMFx1NkNENVx1NEZERFx1NUI1OFx1NjcyQ1x1NjczQVx1ODM0OVx1N0EzRlx1RkYwQ1x1OEJGN1x1NTE0OFx1NUJGQ1x1NTFGQVx1NkNFOFx1OTFDQSBKU09OJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2Q0U4XHU5MUNBXHU1MjE3XHU4ODY4PC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1maWx0ZXJzXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT17ZmlsdGVyID09PSAnY3VycmVudCcgPyAnaXMtYWN0aXZlJyA6ICcnfSBvbkNsaWNrPXsoKSA9PiBzZXRGaWx0ZXIoJ2N1cnJlbnQnKX0+XHU1RjUzXHU1MjREXHU5ODc1PC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT17ZmlsdGVyID09PSAnYWxsJyA/ICdpcy1hY3RpdmUnIDogJyd9IG9uQ2xpY2s9eygpID0+IHNldEZpbHRlcignYWxsJyl9Plx1NTE2OFx1OTBFODwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Zpc2libGVBbm5vdGF0aW9ucy5sZW5ndGggPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1pdGVtc1wiPlxuICAgICAgICAgICAgICB7dmlzaWJsZUFubm90YXRpb25zLm1hcCgoYW5ub3RhdGlvbikgPT4gKFxuICAgICAgICAgICAgICAgIDxBbm5vdGF0aW9uSXRlbVxuICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbj17YW5ub3RhdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBlbmRpbmc9e3BlbmRpbmdJZHMuaGFzKGFubm90YXRpb24uaWQpfVxuICAgICAgICAgICAgICAgICAga2V5PXthbm5vdGF0aW9uLmlkfVxuICAgICAgICAgICAgICAgICAgb25VcHNlcnQ9e29uVXBzZXJ0fVxuICAgICAgICAgICAgICAgICAgb25EZWxldGU9e29uRGVsZXRlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ5XHU0RTJBXHU4MzAzXHU1NkY0XHU4RkQ4XHU2Q0ExXHU2NzA5XHU2Q0U4XHU5MUNBXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTU0MENcdTZCNjVcdTRFMEVcdTRFQTRcdTYzNjI8L2gyPlxuICAgICAgICAgICAge29wZXJhdGlvbnMubGVuZ3RoID8gKFxuICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICAgICAgICAgICAgICAgIHNldFByb21wdERpcnR5KGZhbHNlKVxuICAgICAgICAgICAgICB9fT5cdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTA8L2J1dHRvbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtvcGVyYXRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1NTkwRFx1NTIzNiBQcm9tcHQgXHU3RUQ5IExMTVx1RkYwQ1x1NTM3M1x1NTNFRlx1NjI4QVx1NjcyQ1x1NjczQVx1NTNEOFx1NjZGNFx1NkI2M1x1NUYwRlx1NTE5OVx1NTE2NVx1NTM5Rlx1NTc4Qlx1NkU5MFx1NzgwMVx1MzAwMjwvcD5cbiAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXByb21wdCB3Zi1hbm5vdGF0aW9uLXByb21wdFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRQcm9tcHQoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBjb3B5VGV4dChwcm9tcHQpLnRoZW4oKCkgPT4gc2V0TWVzc2FnZSgnXHU1NDBDXHU2QjY1IFByb21wdCBcdTVERjJcdTU5MERcdTUyMzZcdTMwMDInKSlcbiAgICAgICAgICAgICAgfX0+XHU1OTBEXHU1MjM2XHU1NDBDXHU2QjY1IFByb21wdDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1NjI0MFx1NjcwOVx1NjcyQ1x1NjczQVx1NTNEOFx1NjZGNFx1OTBGRFx1NURGMlx1NTMwNVx1NTQyQlx1NTcyOFx1NTM5Rlx1NTc4Qlx1NTE4NVx1N0Y2RVx1NjU3MFx1NjM2RVx1NEUyRFx1MzAwMjwvcD59XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLWZpbGUtYWN0aW9uc1wiPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17ZXhwb3J0UmV2aWV3fT5cdTVCRkNcdTUxRkFcdTZDRThcdTkxQ0EgSlNPTjwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gaW5wdXRSZWYuY3VycmVudD8uY2xpY2soKX0+XHU1QkZDXHU1MTY1XHU2Q0U4XHU5MUNBIEpTT048L2J1dHRvbj5cbiAgICAgICAgICAgIHtvcGVyYXRpb25zLmxlbmd0aCA/IChcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY2xlYXJBcm1lZCkge1xuICAgICAgICAgICAgICAgICAgc2V0Q2xlYXJBcm1lZCh0cnVlKVxuICAgICAgICAgICAgICAgICAgc2V0TWVzc2FnZSgnXHU1MThEXHU2QjIxXHU3MEI5XHU1MUZCXHU3ODZFXHU4QkE0XHU2RTA1XHU5NjY0XHVGRjFCXHU1MzlGXHU1NzhCXHU1MTg1XHU3RjZFXHU2Q0U4XHU5MUNBXHU0RTBEXHU0RjFBXHU1M0Q3XHU1RjcxXHU1NENEXHUzMDAyJylcbiAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvbkNsZWFyRHJhZnQoKVxuICAgICAgICAgICAgICAgIHNldENsZWFyQXJtZWQoZmFsc2UpXG4gICAgICAgICAgICAgICAgc2V0TWVzc2FnZSgnXHU2NzJDXHU2NzNBXHU4MzQ5XHU3QTNGXHU1REYyXHU2RTA1XHU5NjY0XHUzMDAyJylcbiAgICAgICAgICAgICAgfX0+XG4gICAgICAgICAgICAgICAge2NsZWFyQXJtZWQgPyAnXHU3ODZFXHU4QkE0XHU2RTA1XHU5NjY0XHU2NzJDXHU2NzNBXHU4MzQ5XHU3QTNGJyA6ICdcdTZFMDVcdTk2NjRcdTY3MkNcdTY3M0FcdTgzNDlcdTdBM0YnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tZmlsZS1pbnB1dFwiXG4gICAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICBhY2NlcHQ9XCJhcHBsaWNhdGlvbi9qc29uLC5qc29uXCJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IGltcG9ydFJldmlldyhldmVudC50YXJnZXQuZmlsZXM/LlswXSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7bWVzc2FnZSA/IDxwIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tbWVzc2FnZVwiIHJvbGU9XCJzdGF0dXNcIj57bWVzc2FnZX08L3A+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGVzY2FwZUF0dHJpYnV0ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiBhbm5vdGF0aW9uUG9zaXRpb24oYm9hcmQsIGFubm90YXRpb24sIHByZXZpb3VzKSB7XG4gIGNvbnN0IHNjcmVlbiA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNjcmVlbi1pZD1cIiR7ZXNjYXBlQXR0cmlidXRlKGFubm90YXRpb24uc2NyZWVuSWQpfVwiXWApXG4gIGNvbnN0IGNvbnRlbnQgPSBzY3JlZW4/LnF1ZXJ5U2VsZWN0b3IoJy53Zi1zY3JlZW4tY29udGVudCcpXG4gIGlmICghY29udGVudCkgcmV0dXJuIG51bGxcblxuICBsZXQgZWxlbWVudCA9IGNvbnRlbnRcbiAgaWYgKGFubm90YXRpb24uYW5jaG9yPy5raW5kID09PSAnbm9kZScpIHtcbiAgICB0cnkge1xuICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IoYW5ub3RhdGlvbi5hbmNob3Iuc2VsZWN0b3IpXG4gICAgfSBjYXRjaCB7XG4gICAgICBlbGVtZW50ID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IGNvbnRlbnRSZWN0ID0gY29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBsZXQgYmFzZUxlZnRcbiAgbGV0IGJhc2VUb3BcbiAgbGV0IG9ycGhhbmVkID0gZmFsc2VcblxuICBpZiAoZWxlbWVudD8uaXNDb25uZWN0ZWQgJiYgY29udGVudC5jb250YWlucyhlbGVtZW50KSkge1xuICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIGNvbnRlbnRSZWN0KVxuICAgIGlmICghdmlzaWJsZSkgcmV0dXJuIG51bGxcbiAgICBiYXNlTGVmdCA9IHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdFxuICAgIGJhc2VUb3AgPSB2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3BcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBmYWxsYmFjayA9IGFubm90YXRpb24uYW5jaG9yPy5mYWxsYmFja1Bvc2l0aW9uIHx8IHsgeDogMC45NiwgeTogMC4wNCB9XG4gICAgYmFzZUxlZnQgPSBjb250ZW50UmVjdC5sZWZ0IC0gYm9hcmRSZWN0LmxlZnQgKyBjb250ZW50UmVjdC53aWR0aCAqIGZhbGxiYWNrLnhcbiAgICBiYXNlVG9wID0gY29udGVudFJlY3QudG9wIC0gYm9hcmRSZWN0LnRvcCArIGNvbnRlbnRSZWN0LmhlaWdodCAqIGZhbGxiYWNrLnlcbiAgICBvcnBoYW5lZCA9IGFubm90YXRpb24uYW5jaG9yPy5raW5kID09PSAnbm9kZSdcbiAgfVxuXG4gIGNvbnN0IG92ZXJsYXAgPSBwcmV2aW91cy5maWx0ZXIoXG4gICAgKGl0ZW0pID0+IE1hdGguYWJzKGl0ZW0uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAzICYmIE1hdGguYWJzKGl0ZW0uYmFzZVRvcCAtIGJhc2VUb3ApIDwgMyxcbiAgKS5sZW5ndGhcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGFubm90YXRpb24uaWQsXG4gICAgYW5ub3RhdGlvbixcbiAgICBiYXNlTGVmdDogTWF0aC5yb3VuZChiYXNlTGVmdCksXG4gICAgYmFzZVRvcDogTWF0aC5yb3VuZChiYXNlVG9wKSxcbiAgICBsZWZ0OiBNYXRoLnJvdW5kKGJhc2VMZWZ0ICsgb3ZlcmxhcCAqIDE1KSxcbiAgICB0b3A6IE1hdGgucm91bmQoYmFzZVRvcCksXG4gICAgb3JwaGFuZWQsXG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgYW5ub3RhdGlvbnMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG4gIGZvciAoY29uc3QgYW5ub3RhdGlvbiBvZiBhbm5vdGF0aW9ucykge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gYW5ub3RhdGlvblBvc2l0aW9uKGJvYXJkLCBhbm5vdGF0aW9uLCBwb3NpdGlvbnMpXG4gICAgaWYgKHBvc2l0aW9uKSBwb3NpdGlvbnMucHVzaChwb3NpdGlvbilcbiAgfVxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLmFubm90YXRpb24gPT09IG90aGVyLmFubm90YXRpb25cbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICAgICAgJiYgaXRlbS5vcnBoYW5lZCA9PT0gb3RoZXIub3JwaGFuZWRcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFubm90YXRpb25NYXJrZXJzKHsgYm9hcmRSZWYsIGFubm90YXRpb25zLCBvbk9wZW5QYW5lbCB9KSB7XG4gIGNvbnN0IFtwb3NpdGlvbnMsIHNldFBvc2l0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2FjdGl2ZUtleSwgc2V0QWN0aXZlS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZyYW1lUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZFJlZi5jdXJyZW50LCBhbm5vdGF0aW9ucylcbiAgICBzZXRQb3NpdGlvbnMoKGN1cnJlbnQpID0+IHNhbWVQb3NpdGlvbnMoY3VycmVudCwgbmV4dCkgPyBjdXJyZW50IDogbmV4dClcbiAgfSwgW2Fubm90YXRpb25zLCBib2FyZFJlZl0pXG5cbiAgY29uc3Qgc2NoZWR1bGVSZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICBmcmFtZVJlZi5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmcmFtZVJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgcmVmcmVzaCgpXG4gICAgfSlcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIC8vIFx1NkNFOFx1OTFDQVx1NjU3MFx1N0VDNFx1NTNEOFx1NTMxNlx1NTQwRVx1NTcyOFx1NjcyQ1x1NkIyMSBjb21taXQgXHU3QUNCXHU1MjNCXHU1QjlBXHU0RjREXHVGRjBDXHU5MDdGXHU1MTREXHU2NUU3IGNsaWNrL3BvaW50ZXIgXHU3NkQxXHU1NDJDXHU1NjY4XG4gIC8vIFx1NzUyOFx1NEUwQVx1NEUwMFx1NzI0OFx1OTVFRFx1NTMwNVx1ODk4Nlx1NzZENlx1NTIxQVx1NjM5Mlx1OTYxRlx1NzY4NCByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdTMwMDJcbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICByZWZyZXNoKClcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtzY2hlZHVsZVJlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZUtleSAmJiAhcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSkpIHNldEFjdGl2ZUtleShudWxsKVxuICB9LCBbYWN0aXZlS2V5LCBwb3NpdGlvbnNdKVxuXG4gIGNvbnN0IGFjdGl2ZSA9IHBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpXG4gIGNvbnN0IGJvYXJkV2lkdGggPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRXaWR0aCB8fCAwXG4gIGNvbnN0IGJvYXJkSGVpZ2h0ID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0IHx8IDBcbiAgY29uc3QgYnViYmxlTGVmdCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUubGVmdCArIDE2LCBib2FyZFdpZHRoIC0gMzM2KSkgOiAwXG4gIGNvbnN0IGJ1YmJsZVRvcCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUudG9wICsgMjQsIGJvYXJkSGVpZ2h0IC0gMTk2KSkgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTZDRThcdTkxQ0FcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbiwgaW5kZXgpID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YHdmLWFubm90YXRpb24tbWFya2VyJHthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICcgaXMtYWN0aXZlJyA6ICcnfSR7cG9zaXRpb24ub3JwaGFuZWQgPyAnIGlzLW9ycGhhbmVkJyA6ICcnfWB9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NkNFOFx1OTFDQSAke2luZGV4ICsgMX1cdUZGMUEke3Bvc2l0aW9uLmFubm90YXRpb24uY29udGVudH1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7aW5kZXggKyAxfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAge2FjdGl2ZSA/IChcbiAgICAgICAgPGFzaWRlXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU2Q0U4XHU5MUNBXHVGRjFBJHthY3RpdmUuYW5ub3RhdGlvbi5zY3JlZW5UaXRsZX1gfVxuICAgICAgICA+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10aXRsZVwiPlxuICAgICAgICAgICAgICB7YWN0aXZlLmFubm90YXRpb24uc2NyZWVuVGl0bGV9IFx1MDBCNyB7YWN0aXZlLmFubm90YXRpb24uYW5jaG9yLmtpbmQgPT09ICdub2RlJyA/ICdcdTZBMjFcdTU3NTcnIDogJ1x1OTg3NVx1OTc2Mid9XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1tYXJrZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICB7YWN0aXZlLm9ycGhhbmVkID8gPHAgY2xhc3NOYW1lPVwid2YtYW5ub3RhdGlvbi1vcnBoYW5lZFwiPlx1NTM5Rlx1NUI5QVx1NEY0RFx1NURGMlx1NTkzMVx1NjU0OFx1RkYwQ1x1NUY1M1x1NTI0RFx1NjYzRVx1NzkzQVx1NTkwN1x1NzUyOFx1NEY0RFx1N0Y2RVx1MzAwMjwvcD4gOiBudWxsfVxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWFubm90YXRpb24tbWFya2VyLWNvbnRlbnRcIj57YWN0aXZlLmFubm90YXRpb24uY29udGVudH08L3A+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1hbm5vdGF0aW9uLW1hcmtlci1tb3JlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIHNldEFjdGl2ZUtleShudWxsKVxuICAgICAgICAgICAgb25PcGVuUGFuZWwoYWN0aXZlLmFubm90YXRpb24pXG4gICAgICAgICAgfX0+XHU2N0U1XHU3NzBCXHU1MTY4XHU5MEU4PC9idXR0b24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImNvbnN0IFNIT1JUQ1VUX0RFRklOSVRJT05TID0gW1xuICB7IGlkOiAnY2FudmFzJywgc3VmZml4OiAnMScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnZGVtbycsIHN1ZmZpeDogJzInLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ludGVyYWN0aW9uJywgc3VmZml4OiAnSScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1M0VGXHU0RUE0XHU0RTkyIC8gXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJyB9LFxuICB7IGlkOiAncmV2aWV3Jywgc3VmZml4OiAnTScsIGxhYmVsOiAnXHU1RjAwXHU1NDJGXHU2MjE2XHU1MTczXHU5NUVEXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW1tZXJzaXZlJywgc3VmZml4OiAnMycsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnYnJvd3Nlci1mdWxsc2NyZWVuJywgc3VmZml4OiAnU2hpZnQrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJyB9LFxuICB7IGlkOiAnaG90c3BvdHMnLCBzdWZmaXg6ICdIJywgbGFiZWw6ICdcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0EnIH0sXG4gIHsgaWQ6ICdzcGFjZScsIGtleXM6ICdTcGFjZScsIGxhYmVsOiAnXHU2MzA5XHU0RjRGXHU0RTM0XHU2NUY2XHU2MkQ2XHU1MkE4XHU3NTNCXHU1RTAzJyB9LFxuICB7IGlkOiAnZXNjYXBlJywga2V5czogJ0VzYycsIGxhYmVsOiAnXHU1MTczXHU5NUVEXHU1RjUzXHU1MjREXHU5NzYyXHU2NzdGXHU2MjE2XHU5MDAwXHU1MUZBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaGVscCcsIGtleXM6ICc/JywgbGFiZWw6ICdcdTYyNTNcdTVGMDBcdTYyMTZcdTUxNzNcdTk1RURcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBpc01hY1BsYXRmb3JtKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZVxuICByZXR1cm4gL01hY3xpUGhvbmV8aVBhZHxpUG9kL2kudGVzdChgJHtuYXZpZ2F0b3IucGxhdGZvcm0gfHwgJyd9ICR7bmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJ31gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvcnRjdXRNb2RpZmllckxhYmVsKGlzTWFjID0gaXNNYWNQbGF0Zm9ybSgpKSB7XG4gIHJldHVybiBpc01hYyA/ICdDdHJsJyA6ICdBbHQnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFNob3J0Y3V0cyhpc01hYyA9IGlzTWFjUGxhdGZvcm0oKSkge1xuICBjb25zdCBtb2RpZmllciA9IHNob3J0Y3V0TW9kaWZpZXJMYWJlbChpc01hYylcbiAgcmV0dXJuIFNIT1JUQ1VUX0RFRklOSVRJT05TLm1hcCgoc2hvcnRjdXQpID0+IHNob3J0Y3V0LmtleXNcbiAgICA/IHNob3J0Y3V0XG4gICAgOiB7IC4uLnNob3J0Y3V0LCBrZXlzOiBgJHttb2RpZmllcn0rJHtzaG9ydGN1dC5zdWZmaXh9YCB9KVxufVxuXG5leHBvcnQgY29uc3QgQk9BUkRfU0hPUlRDVVRTID0gZ2V0Qm9hcmRTaG9ydGN1dHMoKVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IGVsZW1lbnQgPSB0YXJnZXQubm9kZVR5cGUgPT09IDMgPyB0YXJnZXQucGFyZW50RWxlbWVudCA6IHRhcmdldFxuICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZVxuICBjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWVcbiAgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICdURVhUQVJFQScgfHwgdGFnID09PSAnU0VMRUNUJykgcmV0dXJuIHRydWVcbiAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIWVsZW1lbnQuY2xvc2VzdD8uKCdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQsIGlzTWFjID0gaXNNYWNQbGF0Zm9ybSgpKSB7XG4gIGlmICghZXZlbnQgfHwgZXZlbnQucmVwZWF0KSByZXR1cm4gbnVsbFxuICBjb25zdCBrZXkgPSBTdHJpbmcoZXZlbnQua2V5IHx8ICcnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IG1vZGlmaWVyID0gaXNNYWMgPyBldmVudC5jdHJsS2V5IDogZXZlbnQuYWx0S2V5XG5cbiAgaWYgKCFtb2RpZmllcikge1xuICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYga2V5ID09PSAnZXNjYXBlJykgcmV0dXJuICdlc2NhcGUnXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJz8nKSByZXR1cm4gJ2hlbHAnXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChldmVudC5zaGlmdEtleSkgcmV0dXJuIGtleSA9PT0gJ2YnID8gJ2Jyb3dzZXItZnVsbHNjcmVlbicgOiBudWxsXG4gIGlmIChrZXkgPT09ICcxJykgcmV0dXJuICdjYW52YXMnXG4gIGlmIChrZXkgPT09ICcyJykgcmV0dXJuICdkZW1vJ1xuICBpZiAoa2V5ID09PSAnaScpIHJldHVybiAnaW50ZXJhY3Rpb24nXG4gIGlmIChrZXkgPT09ICdtJykgcmV0dXJuICdyZXZpZXcnXG4gIGlmIChrZXkgPT09ICczJykgcmV0dXJuICdpbW1lcnNpdmUnXG4gIGlmIChrZXkgPT09ICdoJykgcmV0dXJuICdob3RzcG90cydcbiAgcmV0dXJuIG51bGxcbn1cbiIsICJpbXBvcnQgeyBnZXRCb2FyZFNob3J0Y3V0cyB9IGZyb20gJy4vc2hvcnRjdXRzLmpzJ1xuXG5mdW5jdGlvbiBQYW5lbFNoZWxsKHsgaWQsIHRpdGxlLCBhcmlhTGFiZWwsIG9uQ2xvc2UsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgY2xvc2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcmV0dXJuRm9jdXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybkZvY3VzUmVmLmN1cnJlbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgY2xvc2VSZWYuY3VycmVudD8uZm9jdXMoKVxuICAgIHJldHVybiAoKSA9PiByZXR1cm5Gb2N1c1JlZi5jdXJyZW50Py5mb2N1cz8uKClcbiAgfSwgW10pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1sYXllclwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgb25DbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzZWN0aW9uIGlkPXtpZH0gY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWhlYWRlclwiPlxuICAgICAgICAgIDxzdHJvbmc+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICAgIDxidXR0b24gcmVmPXtjbG9zZVJlZn0gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0gYXJpYS1sYWJlbD17YFx1NTE3M1x1OTVFRCR7dGl0bGV9YH0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgIDwvaGVhZGVyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWJvZHlcIj57Y2hpbGRyZW59PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNob3J0Y3V0SGVscCh7XG4gIGRlbW9BdmFpbGFibGUsXG4gIHNob3dDYW52YXNJbmRleCxcbiAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2UsXG4gIHNob3dBbm5vdGF0aW9uTWFya2VycyxcbiAgb25TaG93QW5ub3RhdGlvbk1hcmtlcnNDaGFuZ2UsXG4gIHRyYWNrcGFkWm9vbSxcbiAgb25UcmFja3BhZFpvb21DaGFuZ2UsXG4gIHpvb21TZW5zaXRpdml0eSxcbiAgb25ab29tU2Vuc2l0aXZpdHlDaGFuZ2UsXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNob3J0Y3V0cyA9IGdldEJvYXJkU2hvcnRjdXRzKClcbiAgcmV0dXJuIChcbiAgICA8UGFuZWxTaGVsbCBpZD1cIndmLWJvYXJkLXV0aWxpdHlcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVwiIGFyaWFMYWJlbD1cIlx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiIG9uQ2xvc2U9e29uQ2xvc2V9PlxuICAgICAgPGRsIGNsYXNzTmFtZT1cIndmLXNob3J0Y3V0LWxpc3RcIj5cbiAgICAgICAge3Nob3J0Y3V0cy5tYXAoKHNob3J0Y3V0KSA9PiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnaXMtZGlzYWJsZWQnIDogJyd9IGtleT17c2hvcnRjdXQuaWR9PlxuICAgICAgICAgICAgPGR0PjxrYmQ+e3Nob3J0Y3V0LmtleXN9PC9rYmQ+PC9kdD5cbiAgICAgICAgICAgIDxkZD57c2hvcnRjdXQubGFiZWx9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnXHVGRjA4XHU1RjUzXHU1MjREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjA5JyA6ICcnfTwvZGQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kbD5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLW5vdGVcIj5cdTU3MjhcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDFcdTY1ODdcdTY3MkNcdTU3REZcdTMwMDFcdTRFMEJcdTYyQzlcdTY4NDZcdTU0OENcdTUzRUZcdTdGMTZcdThGOTFcdTUxODVcdTVCQjlcdTRFMkRcdTRFMERcdTRGMUFcdTg5RTZcdTUzRDFcdTY2NkVcdTkwMUFcdTVGRUJcdTYzNzdcdTk1MkVcdTMwMDI8L3A+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1zZWN0aW9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlxuICAgICAgICA8aDIgaWQ9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XHU3NTNCXHU2NzdGXHU4QkJFXHU3RjZFPC9oMj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NjYzRVx1NzkzQVx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPlx1NTcyOFx1NzUzQlx1Njc3Rlx1NEUwQVx1NjYzRVx1NzkzQVx1NTNFRlx1NjJENlx1NjJGRFx1NzY4NFx1OTg3NVx1OTc2Mlx1N0QyMlx1NUYxNTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3Nob3dDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtYm9hcmQtc2V0dGluZy1yb3dcIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU5RUQ4XHU4QkE0XHU2NjNFXHU3OTNBXHU2Q0U4XHU5MUNBXHU2ODA3XHU4QkIwPC9zdHJvbmc+XG4gICAgICAgICAgICA8c21hbGw+XHU1MTczXHU5NUVEXHU1NDBFXHU0RUM1XHU1NzI4XHU4RkRCXHU1MTY1XHU2Q0U4XHU5MUNBXHU2QTIxXHU1RjBGXHU2NUY2XHU2NjNFXHU3OTNBPC9zbWFsbD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgY2hlY2tlZD17c2hvd0Fubm90YXRpb25NYXJrZXJzfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25TaG93QW5ub3RhdGlvbk1hcmtlcnNDaGFuZ2UoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1zZXR0aW5nLXJvd1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHN0cm9uZz5cdTg5RTZcdTY0NzhcdTY3N0ZcdTdGMjlcdTY1M0U8L3N0cm9uZz5cbiAgICAgICAgICAgIDxzbWFsbD5NYWMgXHU5OTk2XHU2QjIxXHU5RUQ4XHU4QkE0XHU1RjAwXHU1NDJGXHVGRjFCXHU2MzA5XHU1M0NDXHU2MzA3XHU2MjRCXHU1MkJGXHU1RTQ1XHU1RUE2XHU4RkRFXHU3RUVEXHU3RjI5XHU2NTNFPC9zbWFsbD5cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgY2hlY2tlZD17dHJhY2twYWRab29tfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25UcmFja3BhZFpvb21DaGFuZ2UoZXZlbnQudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1ib2FyZC1zZXR0aW5nLXJhbmdlJHt0cmFja3BhZFpvb20gPyAnJyA6ICcgaXMtZGlzYWJsZWQnfWB9PlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHN0cm9uZz5cdTdGMjlcdTY1M0VcdTcwNzVcdTY1NEZcdTVFQTY8L3N0cm9uZz5cbiAgICAgICAgICAgIDxvdXRwdXQ+e01hdGgucm91bmQoem9vbVNlbnNpdGl2aXR5ICogMTAwKX0lPC9vdXRwdXQ+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInJhbmdlXCJcbiAgICAgICAgICAgIG1pbj1cIjAuMjVcIlxuICAgICAgICAgICAgbWF4PVwiMlwiXG4gICAgICAgICAgICBzdGVwPVwiMC4wNVwiXG4gICAgICAgICAgICB2YWx1ZT17em9vbVNlbnNpdGl2aXR5fVxuICAgICAgICAgICAgZGlzYWJsZWQ9eyF0cmFja3BhZFpvb219XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblpvb21TZW5zaXRpdml0eUNoYW5nZShOdW1iZXIoZXZlbnQudGFyZ2V0LnZhbHVlKSl9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU4OUU2XHU2NDc4XHU2NzdGXHU3RjI5XHU2NTNFXHU3MDc1XHU2NTRGXHU1RUE2XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIDxzbWFsbD48c3Bhbj5cdTY2RjRcdTdFQzZcdTgxN0I8L3NwYW4+PHNwYW4+XHU2NkY0XHU3MDc1XHU2NTRGPC9zcGFuPjwvc21hbGw+XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9QYW5lbFNoZWxsPlxuICApXG59XG4iLCAiZXhwb3J0IGNvbnN0IE1JTl9aT09NX1NFTlNJVElWSVRZID0gMC4yNVxuZXhwb3J0IGNvbnN0IE1BWF9aT09NX1NFTlNJVElWSVRZID0gMlxuZXhwb3J0IGNvbnN0IERFRkFVTFRfWk9PTV9TRU5TSVRJVklUWSA9IDAuNlxuXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0TWFjT1MobmF2aWdhdG9yTGlrZSA9IHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IG5hdmlnYXRvcikge1xuICBjb25zdCBwbGF0Zm9ybSA9IG5hdmlnYXRvckxpa2U/LnVzZXJBZ2VudERhdGE/LnBsYXRmb3JtIHx8IG5hdmlnYXRvckxpa2U/LnBsYXRmb3JtIHx8ICcnXG4gIGlmICgvXm1hYy9pLnRlc3QocGxhdGZvcm0pKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gL01hY2ludG9zaHxNYWMgT1MgWC9pLnRlc3QobmF2aWdhdG9yTGlrZT8udXNlckFnZW50IHx8ICcnKVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0U2V0dGluZ3MobmF2aWdhdG9yTGlrZSkge1xuICByZXR1cm4ge1xuICAgIHNob3dDYW52YXNJbmRleDogdHJ1ZSxcbiAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnM6IHRydWUsXG4gICAgdHJhY2twYWRab29tOiBkZXRlY3RNYWNPUyhuYXZpZ2F0b3JMaWtlKSxcbiAgICB6b29tU2Vuc2l0aXZpdHk6IERFRkFVTFRfWk9PTV9TRU5TSVRJVklUWSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplWm9vbVNlbnNpdGl2aXR5KHZhbHVlKSB7XG4gIGNvbnN0IG51bWJlciA9IE51bWJlcih2YWx1ZSlcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobnVtYmVyKSkgcmV0dXJuIERFRkFVTFRfWk9PTV9TRU5TSVRJVklUWVxuICByZXR1cm4gTWF0aC5taW4oTUFYX1pPT01fU0VOU0lUSVZJVFksIE1hdGgubWF4KE1JTl9aT09NX1NFTlNJVElWSVRZLCBudW1iZXIpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9hcmRTdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB3aW5kb3cubG9jYWxTdG9yYWdlXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSB7XG4gIHJldHVybiBgd2YtYm9hcmQtc2V0dGluZ3M6JHtwcm9qZWN0TmFtZX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQm9hcmRTZXR0aW5ncyhcbiAgc3RvcmFnZSxcbiAgcHJvamVjdE5hbWUsXG4gIG5hdmlnYXRvckxpa2UgPSB0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBuYXZpZ2F0b3IsXG4pIHtcbiAgY29uc3QgZGVmYXVsdHMgPSBkZWZhdWx0U2V0dGluZ3MobmF2aWdhdG9yTGlrZSlcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHN0b3JhZ2U/LmdldEl0ZW0oYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpKSlcbiAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaG93Q2FudmFzSW5kZXg6IHBhcnNlZC5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlLFxuICAgICAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnM6IHBhcnNlZC5zaG93QW5ub3RhdGlvbk1hcmtlcnMgIT09IGZhbHNlLFxuICAgICAgICB0cmFja3BhZFpvb206IHR5cGVvZiBwYXJzZWQudHJhY2twYWRab29tID09PSAnYm9vbGVhbidcbiAgICAgICAgICA/IHBhcnNlZC50cmFja3BhZFpvb21cbiAgICAgICAgICA6IGRlZmF1bHRzLnRyYWNrcGFkWm9vbSxcbiAgICAgICAgem9vbVNlbnNpdGl2aXR5OiBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkocGFyc2VkLnpvb21TZW5zaXRpdml0eSksXG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBmaWxlOi8vIHN0b3JhZ2UgY2FuIGJlIHVuYXZhaWxhYmxlIG9yIGNvbnRhaW4gc3RhbGUgZGF0YS5cbiAgfVxuICByZXR1cm4gZGVmYXVsdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lLCBzZXR0aW5ncykge1xuICBjb25zdCBub3JtYWxpemVkID0ge1xuICAgIHNob3dDYW52YXNJbmRleDogc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4ICE9PSBmYWxzZSxcbiAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnM6IHNldHRpbmdzLnNob3dBbm5vdGF0aW9uTWFya2VycyAhPT0gZmFsc2UsXG4gICAgdHJhY2twYWRab29tOiBzZXR0aW5ncy50cmFja3BhZFpvb20gPT09IHRydWUsXG4gICAgem9vbVNlbnNpdGl2aXR5OiBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkoc2V0dGluZ3Muem9vbVNlbnNpdGl2aXR5KSxcbiAgfVxuICB0cnkge1xuICAgIHN0b3JhZ2U/LnNldEl0ZW0oYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpLCBKU09OLnN0cmluZ2lmeShub3JtYWxpemVkKSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBTZXR0aW5ncyByZW1haW4gdXNhYmxlIGZvciB0aGUgY3VycmVudCBzZXNzaW9uIHdpdGhvdXQgcGVyc2lzdGVuY2UuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgQ2FudmFzTW9kZSwgcnVuRXhwb3J0V2l0aEZlZWRiYWNrIH0gZnJvbSAnLi9DYW52YXNNb2RlLmpzeCdcbmltcG9ydCB7IERlbW9Nb2RlIH0gZnJvbSAnLi9EZW1vTW9kZS5qc3gnXG5pbXBvcnQgeyByZXNvbHZlRXhwYW5kVGFyZ2V0cyB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHsgZXhwb3J0U2VsZWN0ZWQgfSBmcm9tICcuL2V4cG9ydC5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5pbXBvcnQgeyBjbGFtcFNjYWxlIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgUmV2aWV3UGFuZWwgfSBmcm9tICcuL1Jldmlld1BhbmVsLmpzeCdcbmltcG9ydCB7IFJldmlld01hcmtlcnMgfSBmcm9tICcuL1Jldmlld01hcmtlcnMuanN4J1xuaW1wb3J0IHsgUmV2aWV3TGF1bmNoZXIgfSBmcm9tICcuL1Jldmlld0xhdW5jaGVyLmpzeCdcbmltcG9ydCB7IGRlc2NyaWJlUmV2aWV3RWxlbWVudCB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuaW1wb3J0IHsgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0IH0gZnJvbSAnLi9iZWZvcmUtdW5sb2FkLmpzJ1xuaW1wb3J0IHsgQW5ub3RhdGlvblBhbmVsIH0gZnJvbSAnLi9Bbm5vdGF0aW9uUGFuZWwuanN4J1xuaW1wb3J0IHsgQW5ub3RhdGlvbk1hcmtlcnMgfSBmcm9tICcuL0Fubm90YXRpb25NYXJrZXJzLmpzeCdcbmltcG9ydCB7XG4gIGFwcGx5QW5ub3RhdGlvbk9wZXJhdGlvbnMsXG4gIGJhc2VBbm5vdGF0aW9ucyxcbiAgZGVsZXRlQW5ub3RhdGlvbk9wZXJhdGlvbixcbiAgZ2V0QW5ub3RhdGlvblN0b3JhZ2UsXG4gIHByZXZlbnRVbnNhdmVkQW5ub3RhdGlvbkV4aXQsXG4gIHJlYWRBbm5vdGF0aW9uRHJhZnQsXG4gIHNhdmVBbm5vdGF0aW9uRHJhZnQsXG4gIHVwc2VydEFubm90YXRpb25PcGVyYXRpb24sXG59IGZyb20gJy4vYW5ub3RhdGlvbnMuanMnXG5pbXBvcnQgeyBTaG9ydGN1dEhlbHAgfSBmcm9tICcuL0JvYXJkUGFuZWxzLmpzeCdcbmltcG9ydCB7XG4gIGdldEJvYXJkU3RvcmFnZSxcbiAgbm9ybWFsaXplWm9vbVNlbnNpdGl2aXR5LFxuICByZWFkQm9hcmRTZXR0aW5ncyxcbiAgc2F2ZUJvYXJkU2V0dGluZ3MsXG59IGZyb20gJy4vYm9hcmQtc2V0dGluZ3MuanMnXG5pbXBvcnQgeyBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQsIHNob3J0Y3V0SWRGb3JFdmVudCwgc2hvcnRjdXRNb2RpZmllckxhYmVsIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGNvbW1lbnQ6IDw+PHBhdGggZD1cIk0yMSAxNWE0IDQgMCAwIDEtNCA0SDhsLTUgM1Y3YTQgNCAwIDAgMSA0LTRoMTBhNCA0IDAgMCAxIDQgNFpcIiAvPjxwYXRoIGQ9XCJNOCA5aDhNOCAxM2g1XCIgLz48Lz4sXG4gICAgZnVsbHNjcmVlbjogPD48cGF0aCBkPVwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M1wiIC8+PHBhdGggZD1cIk0yMSA4VjVhMiAyIDAgMCAwLTItMmgtM1wiIC8+PHBhdGggZD1cIk0zIDE2djNhMiAyIDAgMCAwIDIgMmgzXCIgLz48cGF0aCBkPVwiTTE2IDIxaDNhMiAyIDAgMCAwIDItMnYtM1wiIC8+PC8+LFxuICAgIGV4cGFuZDogPD48cGF0aCBkPVwibTcgMTUgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDkgNS01IDUgNVwiIC8+PC8+LFxuICAgIGNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJtNyAyMCA1LTUgNSA1XCIgLz48cGF0aCBkPVwibTcgNCA1IDUgNS01XCIgLz48Lz4sXG4gICAgdG9vbGJhckV4cGFuZDogPD48cGF0aCBkPVwiTTUgNXYxNFwiIC8+PHBhdGggZD1cIm0xNSAxOC02LTYgNi02XCIgLz48Lz4sXG4gICAgdG9vbGJhckNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJNMTkgNXYxNFwiIC8+PHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPjwvPixcbiAgICBkb3dubG9hZDogPD48cGF0aCBkPVwiTTEyIDN2MTJcIiAvPjxwYXRoIGQ9XCJtNyAxMCA1IDUgNS01XCIgLz48cGF0aCBkPVwiTTUgMjFoMTRcIiAvPjwvPixcbiAgICBzZXR0aW5nczogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjcgMS43IDAgMCAwIC4zNCAxLjg4bC4wNi4wNi0yLjgzIDIuODMtLjA2LS4wNkExLjcgMS43IDAgMCAwIDE1IDE5LjRhMS43IDEuNyAwIDAgMC0xIC42IDEuNyAxLjcgMCAwIDAtLjQgMS4xVjIxaC00di0uMDlBMS43IDEuNyAwIDAgMCA4LjYgMTkuNGExLjcgMS43IDAgMCAwLTEuODguMzRsLS4wNi4wNi0yLjgzLTIuODMuMDYtLjA2QTEuNyAxLjcgMCAwIDAgNC42IDE1YTEuNyAxLjcgMCAwIDAtLjYtMSAxLjcgMS43IDAgMCAwLTEuMS0uNEgzdi00aC4wOUExLjcgMS43IDAgMCAwIDQuNiA4LjZhMS43IDEuNyAwIDAgMC0uMzQtMS44OGwtLjA2LS4wNiAyLjgzLTIuODMuMDYuMDZBMS43IDEuNyAwIDAgMCA5IDQuNmExLjcgMS43IDAgMCAwIDEtLjYgMS43IDEuNyAwIDAgMCAuNC0xLjFWM2g0di4wOUExLjcgMS43IDAgMCAwIDE1LjQgNC42YTEuNyAxLjcgMCAwIDAgMS44OC0uMzRsLjA2LS4wNiAyLjgzIDIuODMtLjA2LjA2QTEuNyAxLjcgMCAwIDAgMTkuNCA5Yy4yLjM3LjUyLjcgMSAuOS4zMi4xMy42OC4yIDEuMS4yaC4wOXY0aC0uMDlhMS43IDEuNyAwIDAgMC0yLjEuOVpcIiAvPjwvPixcbiAgICBoZWxwOiA8PjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiOVwiIC8+PHBhdGggZD1cIk05LjcgOWEyLjQgMi40IDAgMSAxIDMuNyAyYy0uOS42LTEuNCAxLjEtMS40IDJcIiAvPjxwYXRoIGQ9XCJNMTIgMTdoLjAxXCIgLz48Lz4sXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3BhdGhzW25hbWVdfVxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBcdTdFQkZcdTY4NDZcdTk1MDFcdUZGMUFcdTVGMDBcdTk1MDE9XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjBDXHU5NUVEXHU5NTAxPVx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwMlx1Njg0Nlx1NjdCNiBjaHJvbWUgXHU1M0VGXHU3NTI4IFNWR1x1MzAwMiAqL1xuZnVuY3Rpb24gTG9ja0ljb24oeyBvcGVuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLWxvY2staWNvblwiIHZpZXdCb3g9XCIwIDAgMTQgMTRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICAvLyBcdTVGMDBcdTk1MDFcdUZGMUFcdTY4ODFcdTRFQ0VcdTVERTZcdTRGQTdcdTdBQ0JcdThENzdcdTU0MEVcdTU0MTFcdTUzRjNcdTRFMEFcdTYwQUNcdTdBN0FcdUZGMENcdTUzRjNcdTgxMUFcdTRFMERcdTYyNjNcdTU2REVcdTk1MDFcdTRGNTNcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjM1YTIuNzUgMi43NSAwIDAgMSA1LjM1LS4yXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC41YTIuNzUgMi43NSAwIDAgMSA1LjUgMHYyLjI1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8cmVjdCB4PVwiMi43NVwiIHk9XCI2Ljc1XCIgd2lkdGg9XCI4LjVcIiBoZWlnaHQ9XCI1LjVcIiByeD1cIjEuMjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogaW50ZXJhY3RpdmU9dHJ1ZSBcdTY2M0VcdTc5M0FcdTVGMDBcdTk1MDFcdTMwMENcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMERcdUZGMUJmYWxzZSBcdTRFM0FcdTRFMEFcdTk1MDFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0UgKi9cbmZ1bmN0aW9uIEludGVyYWN0aW9uTG9jayh7IGludGVyYWN0aXZlLCBvblRvZ2dsZSB9KSB7XG4gIGNvbnN0IHNob3J0Y3V0TW9kaWZpZXIgPSBzaG9ydGN1dE1vZGlmaWVyTGFiZWwoKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gYFx1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSAke3Nob3J0Y3V0TW9kaWZpZXJ9K0lgXG4gICAgICAgIDogYFx1NUY1M1x1NTI0RFx1NURGMlx1OTUwMVx1NEY0Rlx1MzAwMlx1NzBCOVx1NTFGQlx1NjA2Mlx1NTkwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSAke3Nob3J0Y3V0TW9kaWZpZXJ9K0lgfVxuICAgID5cbiAgICAgIDxMb2NrSWNvbiBvcGVuPXtpbnRlcmFjdGl2ZX0gLz5cbiAgICAgIDxzcGFuPntpbnRlcmFjdGl2ZSA/ICdcdTUzRUZcdTRFQTRcdTRFOTInIDogJ1x1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mid9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkge1xuICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGVsKSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBlbCAmJiAoZWwucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZWwud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pXG4gIGlmICghcmVxdWVzdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVxdWVzdC5jYWxsKGVsKSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmZ1bmN0aW9uIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKSB7XG4gIGlmICghZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIGNvbnN0IGV4aXQgPSBkb2N1bWVudC5leGl0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlblxuICBpZiAoIWV4aXQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGV4aXQuY2FsbChkb2N1bWVudCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm9hcmQoeyBwcm9qZWN0IH0pIHtcbiAgY29uc3Qge1xuICAgIG1vZGUsXG4gICAgc2V0TW9kZSxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydCxcbiAgICBlbnRyeUlkLFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIGN1cnJlbnRTY3JlZW5JZCxcbiAgICBjYW5Hb0JhY2ssXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBjb25zdCB2aWV3cG9ydE9wdGlvbnMgPSBPYmplY3Qua2V5cyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzaG9ydGN1dE1vZGlmaWVyID0gc2hvcnRjdXRNb2RpZmllckxhYmVsKClcblxuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKSxcbiAgKVxuICBjb25zdCBbY2FudmFzU2NhbGUsIHNldENhbnZhc1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vU2NhbGUsIHNldERlbW9TY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1ZpZXdSZXNldEtleSwgc2V0RGVtb1ZpZXdSZXNldEtleV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBbaW50ZXJhY3RpdmUsIHNldEludGVyYWN0aXZlXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtzcGFjZUhlbGQsIHNldFNwYWNlSGVsZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hvdHNwb3RzVmlzaWJsZSwgc2V0SG90c3BvdHNWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwb3J0RXJyb3IsIHNldEV4cG9ydEVycm9yXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkSWRzLCBzZXRFeHBhbmRlZElkc10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IFtpbW1lcnNpdmUsIHNldEltbWVyc2l2ZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCwgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFticm93c2VyRnVsbHNjcmVlbiwgc2V0QnJvd3NlckZ1bGxzY3JlZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdFbmFibGVkLCBzZXRSZXZpZXdFbmFibGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3VG9vbCwgc2V0UmV2aWV3VG9vbF0gPSBSZWFjdC51c2VTdGF0ZSgnbW9kaWZ5JylcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgYW5ub3RhdGlvbkJhc2UgPSBSZWFjdC51c2VNZW1vKCgpID0+IGJhc2VBbm5vdGF0aW9ucyhwcm9qZWN0KSwgW3Byb2plY3RdKVxuICBjb25zdCBbYW5ub3RhdGlvbk9wZXJhdGlvbnMsIHNldEFubm90YXRpb25PcGVyYXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRBbm5vdGF0aW9uRHJhZnQoZ2V0QW5ub3RhdGlvblN0b3JhZ2UoKSwgcHJvamVjdCkub3BlcmF0aW9ucyxcbiAgKVxuICBjb25zdCBbYW5ub3RhdGlvblN0b3JhZ2VTYXZlZCwgc2V0QW5ub3RhdGlvblN0b3JhZ2VTYXZlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbaGVscFZpc2libGUsIHNldEhlbHBWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY2FudmFzSW5kZXhWaXNpYmxlLCBzZXRDYW52YXNJbmRleFZpc2libGVdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSkuc2hvd0NhbnZhc0luZGV4LFxuICApXG4gIGNvbnN0IFtzaG93QW5ub3RhdGlvbk1hcmtlcnMsIHNldFNob3dBbm5vdGF0aW9uTWFya2Vyc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS5zaG93QW5ub3RhdGlvbk1hcmtlcnMsXG4gIClcbiAgY29uc3QgW3RyYWNrcGFkWm9vbSwgc2V0VHJhY2twYWRab29tXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnRyYWNrcGFkWm9vbSxcbiAgKVxuICBjb25zdCBbem9vbVNlbnNpdGl2aXR5LCBzZXRab29tU2Vuc2l0aXZpdHldID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSkuem9vbVNlbnNpdGl2aXR5LFxuICApXG4gIGNvbnN0IFtjYW52YXNJbmRleFBvc2l0aW9uLCBzZXRDYW52YXNJbmRleFBvc2l0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGJvYXJkUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYgPSBSZWFjdC51c2VSZWYobmV3IFNldCgpKVxuICBjb25zdCBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgY2FudmFzTG9ja2VkID0gIWludGVyYWN0aXZlIHx8IHNwYWNlSGVsZFxuICBjb25zdCBhbGxTY3JlZW5JZHMgPSBwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZClcbiAgY29uc3QgaXNEZW1vID0gbW9kZSA9PT0gJ2RlbW8nICYmIGRlbW9BdmFpbGFibGVcbiAgY29uc3QgYWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBkZW1vU2NhbGUgOiBjYW52YXNTY2FsZVxuICBjb25zdCBzZXRBY3RpdmVTY2FsZSA9IGlzRGVtbyA/IHNldERlbW9TY2FsZSA6IHNldENhbnZhc1NjYWxlXG4gIGNvbnN0IHdoZWVsWm9vbU9wdGlvbnMgPSB7IHRyYWNrcGFkTW9kZTogdHJhY2twYWRab29tLCBzZW5zaXRpdml0eTogem9vbVNlbnNpdGl2aXR5IH1cbiAgY29uc3QgYW5ub3RhdGlvbnMgPSBSZWFjdC51c2VNZW1vKFxuICAgICgpID0+IGFwcGx5QW5ub3RhdGlvbk9wZXJhdGlvbnMoYW5ub3RhdGlvbkJhc2UsIGFubm90YXRpb25PcGVyYXRpb25zKSxcbiAgICBbYW5ub3RhdGlvbkJhc2UsIGFubm90YXRpb25PcGVyYXRpb25zXSxcbiAgKVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld1Rvb2wgPT09ICdtb2RpZnknICYmIChyZXZpZXdNdWx0aVNlbGVjdCB8fCBvcHRpb25zLmFkZGl0aXZlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpIHtcbiAgICAgICAgb3B0aW9ucy5yZXBsYWNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIGlmIChjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudCAmJiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50Lm1hcCgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50ID8gbmV4dFNlbGVjdGlvbiA6IGl0ZW0pXG4gICAgICB9XG4gICAgICBjb25zdCBhbHJlYWR5U2VsZWN0ZWQgPSBjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudClcbiAgICAgIGlmICghYWRkaXRpdmUpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RlZEVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudClcbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgcmV0dXJuIGFkZGl0aXZlID8gWy4uLmN1cnJlbnQsIG5leHRTZWxlY3Rpb25dIDogW25leHRTZWxlY3Rpb25dXG4gICAgfSlcbiAgfSwgW3Byb2plY3Quc2NyZWVucywgcmV2aWV3TXVsdGlTZWxlY3QsIHJldmlld1NlbGVjdGlvbnMsIHJldmlld1Rvb2xdKVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudCkpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNsb3NlUmV2aWV3ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld0VuYWJsZWQoZmFsc2UpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbl0pXG5cbiAgY29uc3QgaG92ZXJSZXZpZXdCcmVhZGNydW1iID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBlbGVtZW50IHx8IG51bGxcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgY29uc3QgdG9nZ2xlUmV2aWV3ID0gUmVhY3QudXNlQ2FsbGJhY2soKHRvb2wgPSAnbW9kaWZ5JykgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09IHRvb2wpIHtcbiAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBzZXRJbnRlcmFjdGl2ZSh0cnVlKVxuICAgIHNldFJldmlld011bHRpU2VsZWN0KGZhbHNlKVxuICAgIHNldFJldmlld1Rvb2wodG9vbClcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodG9vbCA9PT0gJ2Fubm90YXRpb24nKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkLCByZXZpZXdUb29sXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdUb29sKCdtb2RpZnknKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcbiAgfVxuXG4gIGNvbnN0IG9wZW5Bbm5vdGF0aW9uUGFuZWwgPSAoYW5ub3RhdGlvbikgPT4ge1xuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3VG9vbCgnYW5ub3RhdGlvbicpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICAgIGlmIChhbm5vdGF0aW9uPy5zY3JlZW5JZCkgc2VsZWN0RW50cnkoYW5ub3RhdGlvbi5zY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNsb3NlUmV2aWV3UGFuZWwgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIGhvdmVyUmV2aWV3QnJlYWRjcnVtYihudWxsKVxuICB9LCBbaG92ZXJSZXZpZXdCcmVhZGNydW1iXSlcblxuICBjb25zdCBhZGRSZXZpZXdJdGVtID0gKGl0ZW0pID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gW1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIHsgLi4uaXRlbSwgaWQ6IGByZXZpZXctJHtEYXRlLm5vdygpfS0ke2N1cnJlbnQubGVuZ3RoICsgMX1gIH0sXG4gICAgXSlcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld0l0ZW0gPSAoaWQpID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaWQgIT09IGlkKSlcbiAgfVxuXG4gIGNvbnN0IHVwc2VydEFubm90YXRpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoYW5ub3RhdGlvbikgPT4ge1xuICAgIHNldEFubm90YXRpb25PcGVyYXRpb25zKChjdXJyZW50KSA9PiAoXG4gICAgICB1cHNlcnRBbm5vdGF0aW9uT3BlcmF0aW9uKGFubm90YXRpb25CYXNlLCBjdXJyZW50LCBhbm5vdGF0aW9uKVxuICAgICkpXG4gIH0sIFthbm5vdGF0aW9uQmFzZV0pXG5cbiAgY29uc3QgZGVsZXRlQW5ub3RhdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChpZCkgPT4ge1xuICAgIHNldEFubm90YXRpb25PcGVyYXRpb25zKChjdXJyZW50KSA9PiAoXG4gICAgICBkZWxldGVBbm5vdGF0aW9uT3BlcmF0aW9uKGFubm90YXRpb25CYXNlLCBjdXJyZW50LCBpZClcbiAgICApKVxuICB9LCBbYW5ub3RhdGlvbkJhc2VdKVxuXG4gIGNvbnN0IGltcG9ydEFubm90YXRpb25zID0gUmVhY3QudXNlQ2FsbGJhY2soKGluY29taW5nLCBpbXBvcnRlZE9wZXJhdGlvbnMgPSBbXSkgPT4ge1xuICAgIHNldEFubm90YXRpb25PcGVyYXRpb25zKChjdXJyZW50KSA9PiB7XG4gICAgICBsZXQgbmV4dCA9IGluY29taW5nLnJlZHVjZShcbiAgICAgICAgKG9wZXJhdGlvbnMsIGFubm90YXRpb24pID0+IHVwc2VydEFubm90YXRpb25PcGVyYXRpb24oYW5ub3RhdGlvbkJhc2UsIG9wZXJhdGlvbnMsIGFubm90YXRpb24pLFxuICAgICAgICBjdXJyZW50LFxuICAgICAgKVxuICAgICAgZm9yIChjb25zdCBvcGVyYXRpb24gb2YgaW1wb3J0ZWRPcGVyYXRpb25zKSB7XG4gICAgICAgIGlmIChvcGVyYXRpb24ub3AgPT09ICdkZWxldGUnKSB7XG4gICAgICAgICAgbmV4dCA9IGRlbGV0ZUFubm90YXRpb25PcGVyYXRpb24oYW5ub3RhdGlvbkJhc2UsIG5leHQsIG9wZXJhdGlvbi5pZClcbiAgICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24ub3AgPT09ICd1cHNlcnQnKSB7XG4gICAgICAgICAgbmV4dCA9IHVwc2VydEFubm90YXRpb25PcGVyYXRpb24oYW5ub3RhdGlvbkJhc2UsIG5leHQsIG9wZXJhdGlvbi5hbm5vdGF0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH0sIFthbm5vdGF0aW9uQmFzZV0pXG5cbiAgY29uc3QgY2xlYXJBbm5vdGF0aW9uRHJhZnQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiBzZXRBbm5vdGF0aW9uT3BlcmF0aW9ucyhbXSksIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbiwgaG92ZXJSZXZpZXdCcmVhZGNydW1iLCBtb2RlLCB2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocmV2aWV3SXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgfSwgW3Jldmlld0l0ZW1zLmxlbmd0aF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkcmFmdCA9IHJlYWRBbm5vdGF0aW9uRHJhZnQoZ2V0QW5ub3RhdGlvblN0b3JhZ2UoKSwgcHJvamVjdClcbiAgICBzZXRBbm5vdGF0aW9uT3BlcmF0aW9ucyhkcmFmdC5vcGVyYXRpb25zKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRBbm5vdGF0aW9uU3RvcmFnZVNhdmVkKHNhdmVBbm5vdGF0aW9uRHJhZnQoXG4gICAgICBnZXRBbm5vdGF0aW9uU3RvcmFnZSgpLFxuICAgICAgcHJvamVjdCxcbiAgICAgIGFubm90YXRpb25PcGVyYXRpb25zLFxuICAgICkpXG4gIH0sIFthbm5vdGF0aW9uT3BlcmF0aW9ucywgcHJvamVjdF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWFubm90YXRpb25PcGVyYXRpb25zLmxlbmd0aCB8fCBhbm5vdGF0aW9uU3RvcmFnZVNhdmVkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkQW5ub3RhdGlvbkV4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZEFubm90YXRpb25FeGl0KVxuICB9LCBbYW5ub3RhdGlvbk9wZXJhdGlvbnMubGVuZ3RoLCBhbm5vdGF0aW9uU3RvcmFnZVNhdmVkXSlcblxuICBjb25zdCBleGl0SW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldEltbWVyc2l2ZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgfSwgW10pXG5cbiAgY29uc3QgZW50ZXJJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY2xvc2VSZXZpZXcoKVxuICAgIHNldEhlbHBWaXNpYmxlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIHNldEltbWVyc2l2ZSh0cnVlKVxuICB9LCBbY2xvc2VSZXZpZXddKVxuXG4gIGNvbnN0IHRvZ2dsZUltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoaW1tZXJzaXZlKSBleGl0SW1tZXJzaXZlKClcbiAgICBlbHNlIGVudGVySW1tZXJzaXZlKClcbiAgfSwgW2VudGVySW1tZXJzaXZlLCBleGl0SW1tZXJzaXZlLCBpbW1lcnNpdmVdKVxuXG4gIGNvbnN0IHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gICAgcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihib2FyZFJlZi5jdXJyZW50KVxuICB9LCBbY2xvc2VSZXZpZXddKVxuXG4gIGNvbnN0IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aXNpYmxlKSA9PiB7XG4gICAgc2V0Q2FudmFzSW5kZXhWaXNpYmxlKHZpc2libGUpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwge1xuICAgICAgc2hvd0NhbnZhc0luZGV4OiB2aXNpYmxlLFxuICAgICAgc2hvd0Fubm90YXRpb25NYXJrZXJzLFxuICAgICAgdHJhY2twYWRab29tLFxuICAgICAgem9vbVNlbnNpdGl2aXR5LFxuICAgIH0pXG4gIH0sIFtwcm9qZWN0Lm5hbWUsIHNob3dBbm5vdGF0aW9uTWFya2VycywgdHJhY2twYWRab29tLCB6b29tU2Vuc2l0aXZpdHldKVxuXG4gIGNvbnN0IHVwZGF0ZVNob3dBbm5vdGF0aW9uTWFya2VycyA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aXNpYmxlKSA9PiB7XG4gICAgc2V0U2hvd0Fubm90YXRpb25NYXJrZXJzKHZpc2libGUpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwge1xuICAgICAgc2hvd0NhbnZhc0luZGV4OiBjYW52YXNJbmRleFZpc2libGUsXG4gICAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnM6IHZpc2libGUsXG4gICAgICB0cmFja3BhZFpvb20sXG4gICAgICB6b29tU2Vuc2l0aXZpdHksXG4gICAgfSlcbiAgfSwgW2NhbnZhc0luZGV4VmlzaWJsZSwgcHJvamVjdC5uYW1lLCB0cmFja3BhZFpvb20sIHpvb21TZW5zaXRpdml0eV0pXG5cbiAgY29uc3QgdXBkYXRlVHJhY2twYWRab29tID0gUmVhY3QudXNlQ2FsbGJhY2soKGVuYWJsZWQpID0+IHtcbiAgICBzZXRUcmFja3BhZFpvb20oZW5hYmxlZClcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7XG4gICAgICBzaG93Q2FudmFzSW5kZXg6IGNhbnZhc0luZGV4VmlzaWJsZSxcbiAgICAgIHNob3dBbm5vdGF0aW9uTWFya2VycyxcbiAgICAgIHRyYWNrcGFkWm9vbTogZW5hYmxlZCxcbiAgICAgIHpvb21TZW5zaXRpdml0eSxcbiAgICB9KVxuICB9LCBbY2FudmFzSW5kZXhWaXNpYmxlLCBwcm9qZWN0Lm5hbWUsIHNob3dBbm5vdGF0aW9uTWFya2Vycywgem9vbVNlbnNpdGl2aXR5XSlcblxuICBjb25zdCB1cGRhdGVab29tU2Vuc2l0aXZpdHkgPSBSZWFjdC51c2VDYWxsYmFjaygodmFsdWUpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkID0gbm9ybWFsaXplWm9vbVNlbnNpdGl2aXR5KHZhbHVlKVxuICAgIHNldFpvb21TZW5zaXRpdml0eShub3JtYWxpemVkKVxuICAgIHNhdmVCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUsIHtcbiAgICAgIHNob3dDYW52YXNJbmRleDogY2FudmFzSW5kZXhWaXNpYmxlLFxuICAgICAgc2hvd0Fubm90YXRpb25NYXJrZXJzLFxuICAgICAgdHJhY2twYWRab29tLFxuICAgICAgem9vbVNlbnNpdGl2aXR5OiBub3JtYWxpemVkLFxuICAgIH0pXG4gIH0sIFtjYW52YXNJbmRleFZpc2libGUsIHByb2plY3QubmFtZSwgc2hvd0Fubm90YXRpb25NYXJrZXJzLCB0cmFja3BhZFpvb21dKVxuXG4gIC8vIFx1NTNFQVx1NTcyOFx1NTIwN1x1NjM2Mlx1OTg3OVx1NzZFRVx1NjVGNlx1NkUwNVx1NEY0RFx1N0Y2RVx1MzAwMlx1OTk5Nlx1NUM0RiB1c2VFZmZlY3QgXHU4MkU1XHU0RTVGIHNldCBudWxsXHVGRjBDXHU0RjFBXHU3NkQ2XHU2Mzg5IENhbnZhc0luZGV4XG4gIC8vIHVzZUxheW91dEVmZmVjdCBcdTUyMUFcdTdCOTdcdTU5N0RcdTc2ODRcdTU3NTBcdTY4MDdcdUZGMENcdTdEMjJcdTVGMTVcdTRGMUFcdTRFMDBcdTc2RjQgdmlzaWJpbGl0eTpoaWRkZW5cdTMwMDJcbiAgY29uc3QgY2FudmFzSW5kZXhTZXR0aW5nc1Byb2plY3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpXG4gICAgc2V0Q2FudmFzSW5kZXhWaXNpYmxlKHNldHRpbmdzLnNob3dDYW52YXNJbmRleClcbiAgICBzZXRTaG93QW5ub3RhdGlvbk1hcmtlcnMoc2V0dGluZ3Muc2hvd0Fubm90YXRpb25NYXJrZXJzKVxuICAgIHNldFRyYWNrcGFkWm9vbShzZXR0aW5ncy50cmFja3BhZFpvb20pXG4gICAgc2V0Wm9vbVNlbnNpdGl2aXR5KHNldHRpbmdzLnpvb21TZW5zaXRpdml0eSlcbiAgICBjb25zdCBwcmV2aW91c05hbWUgPSBjYW52YXNJbmRleFNldHRpbmdzUHJvamVjdFJlZi5jdXJyZW50XG4gICAgY2FudmFzSW5kZXhTZXR0aW5nc1Byb2plY3RSZWYuY3VycmVudCA9IHByb2plY3QubmFtZVxuICAgIGlmIChwcmV2aW91c05hbWUgIT0gbnVsbCAmJiBwcmV2aW91c05hbWUgIT09IHByb2plY3QubmFtZSkge1xuICAgICAgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbihudWxsKVxuICAgIH1cbiAgfSwgW3Byb2plY3QubmFtZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJyAmJiAhZXZlbnQucmVwZWF0ICYmICFpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hvcnRjdXQgPSBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpXG4gICAgICBpZiAoIXNob3J0Y3V0KSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCAhPT0gJ2VzY2FwZScgJiYgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycgJiYgIWlzRGVtbykgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnICYmIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVyblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdjYW52YXMnKSBzZXRNb2RlKCdjYW52YXMnKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycpIHNldE1vZGUoJ2RlbW8nKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW50ZXJhY3Rpb24nKSBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ3JldmlldycpIHRvZ2dsZVJldmlldygpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbW1lcnNpdmUnKSB0b2dnbGVJbW1lcnNpdmUoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnYnJvd3Nlci1mdWxsc2NyZWVuJykgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4oKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnKSBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdoZWxwJykge1xuICAgICAgICBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgaWYgKGhlbHBWaXNpYmxlKSBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICAgICAgZWxzZSBpZiAocmV2aWV3RW5hYmxlZCkgY2xvc2VSZXZpZXcoKVxuICAgICAgICBlbHNlIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtcbiAgICBjbG9zZVJldmlldyxcbiAgICBkZW1vQXZhaWxhYmxlLFxuICAgIGV4aXRJbW1lcnNpdmUsXG4gICAgaGVscFZpc2libGUsXG4gICAgaW1tZXJzaXZlLFxuICAgIGlzRGVtbyxcbiAgICByZXZpZXdFbmFibGVkLFxuICAgIHNldE1vZGUsXG4gICAgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4sXG4gICAgdG9nZ2xlSW1tZXJzaXZlLFxuICAgIHRvZ2dsZVJldmlldyxcbiAgXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnZGVtbycpIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfSwgW21vZGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3luYyA9ICgpID0+IHNldEJyb3dzZXJGdWxsc2NyZWVuKCEhZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtgXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfSsxXHVGRjA5YH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NzUzQlx1Njc3RlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2RlbW8nID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdkZW1vJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2BcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9KzJcdUZGMDlgfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtgXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfStIXHVGRjA5YH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoZWxwVmlzaWJsZX1cbiAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnbW9kaWZ5JyA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ21vZGlmeSd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdtb2RpZnknID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPXtgXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K01cdUZGMDlgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdG9nZ2xlUmV2aWV3KCdtb2RpZnknKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImVkaXRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdhbm5vdGF0aW9uJyA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ2Fubm90YXRpb24nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnYW5ub3RhdGlvbicgPyAnXHU2Q0U4XHU5MUNBXHU0RTJEJyA6ICdcdTZDRThcdTkxQ0EnfVxuICAgICAgICAgICAgdGl0bGU9XCJcdTZDRThcdTkxQ0FcdUZGMUFcdTdFRDlcdTk4NzVcdTk3NjJcdTYyMTZcdTZBMjFcdTU3NTdcdTZERkJcdTUyQTBcdTUzRUZcdTYzMDFcdTRFNDVcdTUzMTZcdThCRjRcdTY2MEVcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdG9nZ2xlUmV2aWV3KCdhbm5vdGF0aW9uJyl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb21tZW50XCIgLz5cbiAgICAgICAgICAgIHthbm5vdGF0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj5cbiAgICAgICAgICAgICAgICB7YW5ub3RhdGlvbnMubGVuZ3RofVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NkNFOFx1OTFDQTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlID8gJ1x1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRicgOiAnXHU4RkRCXHU1MTY1XHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtgXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfSszXHVGRjA5YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUltbWVyc2l2ZX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImZ1bGxzY3JlZW5cIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU1QzRGPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4JyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImV4cGFuZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTVDNTVcdTVGMDA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTY1MzZcdThENzdcdTUxNjhcdTkwRTgnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbGxhcHNlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NjUzNlx1OEQ3Nzwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtdG9vbGJhci1pY29uLWJ1dHRvbi0tcHJpbWFyeVwiXG4gICAgICAgICAgICBkaXNhYmxlZD17ZXhwb3J0aW5nIHx8IHNlbGVjdGVkSWRzLnNpemUgPT09IDAgfHwgbW9kZSA9PT0gJ2RlbW8nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17ZXhwb3J0aW5nID8gJ1x1NkI2M1x1NTcyOFx1NUJGQ1x1NTFGQScgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEXHVGRjA4JHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVcdUZGMDlgfVxuICAgICAgICAgICAgdGl0bGU9e2V4cG9ydGluZyA/ICdcdTVCRkNcdTUxRkFcdTRFMkRcdTIwMjYnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RCAke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBvcnRJZHMoWy4uLnNlbGVjdGVkSWRzXSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJkb3dubG9hZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj57ZXhwb3J0aW5nID8gJ1x1MjAyNicgOiBzZWxlY3RlZElkcy5zaXplfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAge2V4cG9ydEVycm9yID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXhwb3J0RXJyb3J9PC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge2ltbWVyc2l2ZSA/IChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17YHdmLWltbWVyc2l2ZS1jaHJvbWUke2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICcnIDogJyBpcy1jb2xsYXBzZWQnfWB9XG4gICAgICAgICAgcm9sZT1cInRvb2xiYXJcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTZDODlcdTZENzhcdTYzQTdcdTRFRjZcIlxuICAgICAgICA+XG4gICAgICAgICAge2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtaW1tZXJzaXZlLWNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHVGRjA4RXNjXHVGRjA5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtleGl0SW1tZXJzaXZlfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU5MDAwXHU1MUZBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXticm93c2VyRnVsbHNjcmVlbiA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgIHRpdGxlPXticm93c2VyRnVsbHNjcmVlblxuICAgICAgICAgICAgICAgICAgPyBgXHU5MDAwXHU1MUZBXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfStTaGlmdCtGXHVGRjA5YFxuICAgICAgICAgICAgICAgICAgOiBgXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfStTaGlmdCtGXHVGRjA5YH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVCcm93c2VyRnVsbHNjcmVlbn1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHticm93c2VyRnVsbHNjcmVlbiA/ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYgT04nIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2FjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRBY3RpdmVTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXtyZXNldEFjdGl2ZVZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b24nfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyNTNcdTVGMDBcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIlxuICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2hlbHBWaXNpYmxlfVxuICAgICAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVx1RkYwOD9cdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiaGVscFwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzRGVtbyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2BcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0FcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K0hcdUZGMDlgfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7aG90c3BvdHNWaXNpYmxlID8gJ1x1NzBFRFx1NTMzQSBPTicgOiAnXHU3MEVEXHU1MzNBIE9GRid9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLXRvb2xiYXItdG9nZ2xlXCJcbiAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICdcdTY1MzZcdThENzdcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnIDogJ1x1NUM1NVx1NUYwMFx1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRid9XG4gICAgICAgICAgICB0aXRsZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICd0b29sYmFyQ29sbGFwc2UnIDogJ3Rvb2xiYXJFeHBhbmQnfSAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgPyAoXG4gICAgICAgIDxDYW52YXNNb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHdoZWVsWm9vbU9wdGlvbnM9e3doZWVsWm9vbU9wdGlvbnN9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICBjYW52YXNJbmRleFZpc2libGU9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNJbmRleFBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZT17c2V0Q2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNsb3NlQ2FudmFzSW5kZXg9eygpID0+IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8RGVtb01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIGhvdHNwb3RzVmlzaWJsZT17aG90c3BvdHNWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICB3aGVlbFpvb21PcHRpb25zPXt3aGVlbFpvb21PcHRpb25zfVxuICAgICAgICAgIHZpZXdSZXNldEtleT17ZGVtb1ZpZXdSZXNldEtleX1cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAgIG9uQ2FudmFzQ2xpY2s9e3Jldmlld1BhbmVsVmlzaWJsZSA/IGNsb3NlUmV2aWV3UGFuZWwgOiB1bmRlZmluZWR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3VG9vbCA9PT0gJ21vZGlmeScgPyAoXG4gICAgICAgIDxSZXZpZXdNYXJrZXJzIGJvYXJkUmVmPXtib2FyZFJlZn0gaXRlbXM9e3Jldmlld0l0ZW1zfSBvbk9wZW5QYW5lbD17b3BlblJldmlld1BhbmVsfSAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7c2hvd0Fubm90YXRpb25NYXJrZXJzIHx8IChyZXZpZXdFbmFibGVkICYmIHJldmlld1Rvb2wgPT09ICdhbm5vdGF0aW9uJykgPyAoXG4gICAgICAgIDxBbm5vdGF0aW9uTWFya2Vyc1xuICAgICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgICBhbm5vdGF0aW9ucz17YW5ub3RhdGlvbnN9XG4gICAgICAgICAgb25PcGVuUGFuZWw9e29wZW5Bbm5vdGF0aW9uUGFuZWx9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxSZXZpZXdMYXVuY2hlclxuICAgICAgICBib2FyZFJlZj17Ym9hcmRSZWZ9XG4gICAgICAgIGNvdW50PXtyZXZpZXdJdGVtcy5sZW5ndGh9XG4gICAgICAgIHByb2plY3ROYW1lPXtwcm9qZWN0Lm5hbWV9XG4gICAgICAgIG9uT3Blbj17b3BlblJldmlld1BhbmVsfVxuICAgICAgLz5cbiAgICAgIHtoZWxwVmlzaWJsZSA/IChcbiAgICAgICAgPFNob3J0Y3V0SGVscFxuICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgc2hvd0NhbnZhc0luZGV4PXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2U9e3VwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBzaG93QW5ub3RhdGlvbk1hcmtlcnM9e3Nob3dBbm5vdGF0aW9uTWFya2Vyc31cbiAgICAgICAgICBvblNob3dBbm5vdGF0aW9uTWFya2Vyc0NoYW5nZT17dXBkYXRlU2hvd0Fubm90YXRpb25NYXJrZXJzfVxuICAgICAgICAgIHRyYWNrcGFkWm9vbT17dHJhY2twYWRab29tfVxuICAgICAgICAgIG9uVHJhY2twYWRab29tQ2hhbmdlPXt1cGRhdGVUcmFja3BhZFpvb219XG4gICAgICAgICAgem9vbVNlbnNpdGl2aXR5PXt6b29tU2Vuc2l0aXZpdHl9XG4gICAgICAgICAgb25ab29tU2Vuc2l0aXZpdHlDaGFuZ2U9e3VwZGF0ZVpvb21TZW5zaXRpdml0eX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRIZWxwVmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxSZXZpZXdQYW5lbFxuICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICB2aXNpYmxlPXtyZXZpZXdQYW5lbFZpc2libGUgJiYgcmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnbW9kaWZ5J31cbiAgICAgICAgc2VsZWN0aW9ucz17cmV2aWV3U2VsZWN0aW9uc31cbiAgICAgICAgbXVsdGlTZWxlY3Q9e3Jldmlld011bHRpU2VsZWN0fVxuICAgICAgICBpdGVtcz17cmV2aWV3SXRlbXN9XG4gICAgICAgIG9uVG9nZ2xlTXVsdGlTZWxlY3Q9eygpID0+IHNldFJldmlld011bHRpU2VsZWN0KCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgb25TZWxlY3RFbGVtZW50PXsoZWxlbWVudCkgPT4gc2VsZWN0UmV2aWV3RWxlbWVudChlbGVtZW50LCBudWxsLCBudWxsLCB7XG4gICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXT8uZWxlbWVudCxcbiAgICAgICAgfSl9XG4gICAgICAgIG9uSG92ZXJFbGVtZW50PXtob3ZlclJldmlld0JyZWFkY3J1bWJ9XG4gICAgICAgIG9uUmVtb3ZlU2VsZWN0aW9uPXtyZW1vdmVSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgIG9uQ2xlYXJTZWxlY3Rpb249e2NsZWFyUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICBvbkFkZEl0ZW09e2FkZFJldmlld0l0ZW19XG4gICAgICAgIG9uUmVtb3ZlSXRlbT17cmVtb3ZlUmV2aWV3SXRlbX1cbiAgICAgICAgb25DbG9zZT17Y2xvc2VSZXZpZXd9XG4gICAgICAvPlxuICAgICAgPEFubm90YXRpb25QYW5lbFxuICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICB2aXNpYmxlPXtyZXZpZXdQYW5lbFZpc2libGUgJiYgcmV2aWV3RW5hYmxlZCAmJiByZXZpZXdUb29sID09PSAnYW5ub3RhdGlvbid9XG4gICAgICAgIHNlbGVjdGlvbj17cmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IG51bGx9XG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZD17Y3VycmVudFNjcmVlbklkfVxuICAgICAgICBhbm5vdGF0aW9ucz17YW5ub3RhdGlvbnN9XG4gICAgICAgIG9wZXJhdGlvbnM9e2Fubm90YXRpb25PcGVyYXRpb25zfVxuICAgICAgICBzdG9yYWdlU2F2ZWQ9e2Fubm90YXRpb25TdG9yYWdlU2F2ZWR9XG4gICAgICAgIG9uQWRkPXt1cHNlcnRBbm5vdGF0aW9ufVxuICAgICAgICBvblVwc2VydD17dXBzZXJ0QW5ub3RhdGlvbn1cbiAgICAgICAgb25EZWxldGU9e2RlbGV0ZUFubm90YXRpb259XG4gICAgICAgIG9uSW1wb3J0PXtpbXBvcnRBbm5vdGF0aW9uc31cbiAgICAgICAgb25DbGVhckRyYWZ0PXtjbGVhckFubm90YXRpb25EcmFmdH1cbiAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgIG9uQ2xvc2U9e2Nsb3NlUmV2aWV3fVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG5cbiAgaWYgKHByb2plY3QuYW5ub3RhdGlvbnMgIT0gbnVsbCkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LmFubm90YXRpb25zKSkgZmFpbCgncHJvamVjdC5hbm5vdGF0aW9ucycsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICBpZiAodHlwZW9mIHByb2plY3QuYW5ub3RhdGlvbnNSZXZpc2lvbiAhPT0gJ3N0cmluZycgfHwgIXByb2plY3QuYW5ub3RhdGlvbnNSZXZpc2lvbikge1xuICAgICAgZmFpbCgncHJvamVjdC5hbm5vdGF0aW9uc1JldmlzaW9uJywgJ211c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nIHdoZW4gYW5ub3RhdGlvbnMgYXJlIHByb3ZpZGVkJylcbiAgICB9XG4gICAgY29uc3QgYW5ub3RhdGlvbklkcyA9IG5ldyBTZXQoKVxuICAgIHByb2plY3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSBgcHJvamVjdC5hbm5vdGF0aW9uc1ske2luZGV4fV1gXG4gICAgICBpZiAoIWFubm90YXRpb24gfHwgdHlwZW9mIGFubm90YXRpb24gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgICBpZiAodHlwZW9mIGFubm90YXRpb24uaWQgIT09ICdzdHJpbmcnIHx8ICFhbm5vdGF0aW9uLmlkKSBmYWlsKGAke3BhdGh9LmlkYCwgJ211c3QgYmUgYSBub24tZW1wdHkgc3RyaW5nJylcbiAgICAgIGlmIChhbm5vdGF0aW9uSWRzLmhhcyhhbm5vdGF0aW9uLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke2Fubm90YXRpb24uaWR9XCJgKVxuICAgICAgYW5ub3RhdGlvbklkcy5hZGQoYW5ub3RhdGlvbi5pZClcbiAgICAgIGlmICghaWRzLmhhcyhhbm5vdGF0aW9uLnNjcmVlbklkKSkge1xuICAgICAgICBmYWlsKGAke3BhdGh9LnNjcmVlbklkYCwgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke2Fubm90YXRpb24uc2NyZWVuSWR9XCJgKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBhbm5vdGF0aW9uLmNvbnRlbnQgIT09ICdzdHJpbmcnIHx8ICFhbm5vdGF0aW9uLmNvbnRlbnQudHJpbSgpKSB7XG4gICAgICAgIGZhaWwoYCR7cGF0aH0uY29udGVudGAsICdtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpXG4gICAgICB9XG4gICAgICBpZiAoIWFubm90YXRpb24uYW5jaG9yIHx8ICFbJ3NjcmVlbicsICdub2RlJ10uaW5jbHVkZXMoYW5ub3RhdGlvbi5hbmNob3Iua2luZCkpIHtcbiAgICAgICAgZmFpbChgJHtwYXRofS5hbmNob3Iua2luZGAsICdtdXN0IGJlIFwic2NyZWVuXCIgb3IgXCJub2RlXCInKVxuICAgICAgfVxuICAgICAgaWYgKGFubm90YXRpb24uYW5jaG9yLmtpbmQgPT09ICdub2RlJyAmJiAhYW5ub3RhdGlvbi5hbmNob3Iuc2VsZWN0b3IpIHtcbiAgICAgICAgZmFpbChgJHtwYXRofS5hbmNob3Iuc2VsZWN0b3JgLCAnbXVzdCBiZSBwcm92aWRlZCBmb3IgYSBub2RlIGFubm90YXRpb24nKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuXG5leHBvcnQgeyBmaW5kRmxvd1RhcmdldElkLCBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuL2Zsb3ctdGFyZ2V0LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSkge1xuICByZXR1cm4ge1xuICAgICdkYXRhLWZsb3ctdG8nOiB0byB8fCB1bmRlZmluZWQsXG4gICAgb25DbGljazogKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodG8pIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICAgIGlmIChvbkNsaWNrKSBvbkNsaWNrKGV2ZW50KVxuICAgICAgaWYgKCFldmVudC5kZWZhdWx0UHJldmVudGVkICYmIHRvKSBuYXZpZ2F0ZSh0bylcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5mdW5jdGlvbiBqb2luQ2xhc3MoYmFzZSwgZXh0cmEpIHtcbiAgcmV0dXJuIGV4dHJhID8gYCR7YmFzZX0gJHtleHRyYX1gIDogYmFzZVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSkge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgY29sdW1ucyAmJiB0eXBlb2YgY29sdW1ucyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY29sdW1ucylcbiAgICAgID8gY29sdW1uc1t2aWV3cG9ydEtleV1cbiAgICAgIDogY29sdW1uc1xuICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPiAwKSByZXR1cm4gYHJlcGVhdCgke3ZhbHVlfSwgbWlubWF4KDAsIDFmcikpYFxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkpIHJldHVybiB2YWx1ZVxuICB0aHJvdyBuZXcgRXJyb3IoJ0dyaWQgY29sdW1ucyBtdXN0IHJlc29sdmUgdG8gYSBwb3NpdGl2ZSBpbnRlZ2VyIG9yIG5vbi1lbXB0eSBDU1Mgc3RyaW5nJylcbn1cblxuZnVuY3Rpb24gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdCkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIHtcbiAgICBjbGFzc05hbWVTdWZmaXg6IHRvID8gJyB3Zi1pbnRlcmFjdGl2ZScgOiAnJyxcbiAgICByb2xlOiB0byA/ICdsaW5rJyA6IHJlc3Qucm9sZSxcbiAgICB0YWJJbmRleDogdG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXgsXG4gICAgZmxvdyxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm94KHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ib3gke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXt7IC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUm93KHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1yb3cke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2x1bW4oe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWNvbHVtbiR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdyaWQoeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgY29sdW1ucyA9IDEsIGdhcCA9IDAsIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyB2aWV3cG9ydEtleSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpLFxuICAgIGdhcCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ncmlkJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBIZWFkaW5nKHsgbGV2ZWwgPSAyLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCB0YWcgPSBgaCR7TWF0aC5taW4oNiwgTWF0aC5tYXgoMSwgbGV2ZWwpKX1gXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRhZywgeyBjbGFzc05hbWU6IGB3Zi1oZWFkaW5nICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dCh7IGFzID0gJ3AnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChhcywgeyBjbGFzc05hbWU6IGB3Zi10ZXh0ICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FyZCh7IHRvLCBvbkNsaWNrLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jYXJkICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQmFkZ2UoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtgd2YtYmFkZ2UgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zcGFuPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXZhdGFyKHsgc2l6ZSA9IDQwLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIHN0eWxlLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1hdmF0YXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZVBsYWNlaG9sZGVyKHtcbiAgd2lkdGggPSAnMTAwJScsXG4gIGhlaWdodCA9IDE2MCxcbiAgYm9yZGVyUmFkaXVzID0gMCxcbiAgY2xhc3NOYW1lID0gJycsXG4gIHN0eWxlLFxuICAuLi5yZXN0XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtaW1hZ2UtcGxhY2Vob2xkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCwgYm9yZGVyUmFkaXVzLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcGxhY2Vob2xkZXItYmxvY2tcIiAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEJ1dHRvbih7IHRvLCBvbkNsaWNrLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHdmLWJ1dHRvbiB3Zi1idXR0b24tJHt2YXJpYW50fSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0SW5wdXQoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8aW5wdXQgY2xhc3NOYW1lPXtgd2YtaW5wdXQgJHtjbGFzc05hbWV9YC50cmltKCl9IHR5cGU9XCJ0ZXh0XCIgey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0QXJlYSh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDx0ZXh0YXJlYSBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi10ZXh0YXJlYSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3QoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNlbGVjdCBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi1zZWxlY3QgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zZWxlY3Q+XG59XG5cbmZ1bmN0aW9uIENob2ljZSh7IHR5cGUsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGxhYmVsIGNsYXNzTmFtZT17YHdmLWNob2ljZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0+XG4gICAgICA8aW5wdXQgY2xhc3NOYW1lPVwid2YtY2hvaWNlLWlucHV0XCIgdHlwZT17dHlwZX0gey4uLnJlc3R9IC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENoZWNrYm94KHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJjaGVja2JveFwiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhZGlvKHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJyYWRpb1wiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRvZ2dsZSh7IGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwic3dpdGNoXCJcbiAgICAgIGFyaWEtY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXRvZ2dsZSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gb25DaGFuZ2U/LighY2hlY2tlZCwgZXZlbnQpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRyYWNrXCI+PHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRodW1iXCIgLz48L3NwYW4+XG4gICAgICB7bGFiZWwgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtbGFiZWxcIj57bGFiZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZvcm1GaWVsZCh7IGxhYmVsLCBodG1sRm9yLCBoaW50LCBlcnJvciwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWZvcm0tZmllbGQgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1maWVsZC1sYWJlbFwiIGh0bWxGb3I9e2h0bWxGb3J9PntsYWJlbH08L2xhYmVsPlxuICAgICAge2NoaWxkcmVufVxuICAgICAge2hpbnQgJiYgIWVycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtaGludFwiPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge2Vycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXJyb3J9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgY3JlYXRlRmxvd1Byb3BzIH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gUGFnZUhlYWRlcih7IHRpdGxlLCB0aXRsZUlkLCBzdWJ0aXRsZSwgc3VidGl0bGVJZCwgYWN0aW9ucywgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxoZWFkZXIgY2xhc3NOYW1lPXtgd2YtcGFnZS1oZWFkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1oZWFkZXItY29weVwiPlxuICAgICAgICA8aDEgaWQ9e3RpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2UtdGl0bGVcIj57dGl0bGV9PC9oMT5cbiAgICAgICAge3N1YnRpdGxlID8gPHAgaWQ9e3N1YnRpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2Utc3VidGl0bGVcIj57c3VidGl0bGV9PC9wPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHthY3Rpb25zID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWFjdGlvbnNcIj57YWN0aW9uc308L2Rpdj4gOiBudWxsfVxuICAgIDwvaGVhZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIE5hdmlnYXRpb25MaXN0KHsgYXMsIGl0ZW1zLCBhY3RpdmVJZCwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgYXMsXG4gICAgeyBjbGFzc05hbWUsIC4uLnJlc3QgfSxcbiAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi1uYXYtaXRlbSBpcy1hY3RpdmUnIDogJ3dmLW5hdi1pdGVtJ31cbiAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICApKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2lkZU5hdih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPE5hdmlnYXRpb25MaXN0XG4gICAgICBhcz1cIm5hdlwiXG4gICAgICBpdGVtcz17aXRlbXN9XG4gICAgICBhY3RpdmVJZD17YWN0aXZlSWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1zaWRlLW5hdiAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYkJhcih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi10YWItYmFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi10YWItaXRlbSBpcy1hY3RpdmUnIDogJ3dmLXRhYi1pdGVtJ31cbiAgICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQnJlYWRjcnVtYnMoeyBpdGVtcyA9IFtdLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi1icmVhZGNydW1icyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gYXJpYS1sYWJlbD1cIkJyZWFkY3J1bWJzXCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YCR7aXRlbS5sYWJlbH0tJHtpbmRleH1gfT5cbiAgICAgICAgICB7aW5kZXggPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1kaXZpZGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtpdGVtLnRvID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWxpbmtcIiB0eXBlPVwiYnV0dG9uXCIgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX0+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItY3VycmVudFwiPntpdGVtLmxhYmVsfTwvc3Bhbj59XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG4vKiogXHU3OUZCXHU1MkE4XHU3QUVGXHU2NTc0XHU1QzRGXHU1OEYzXHVGRjFBXHU1MTg1XHU1QkI5XHU1MzNBXHU1M0VGXHU2RURBXHVGRjBDVGFiQmFyIFx1OEQzNFx1NUU5NVx1MzAwMnRhYnMgLyBhY3RpdmVJZCBcdTRFMEUgVGFiQmFyIFx1NzZGOFx1NTQwQ1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZVNoZWxsKHsgY2hpbGRyZW4sIHRhYnMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1vYmlsZS1zaGVsbCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwid2YtbW9iaWxlLXNoZWxsLWJvZHlcIj57Y2hpbGRyZW59PC9tYWluPlxuICAgICAge3RhYnMubGVuZ3RoID4gMCA/IDxUYWJCYXIgaXRlbXM9e3RhYnN9IGFjdGl2ZUlkPXthY3RpdmVJZH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIENlbGwoeyB0bywgb25DbGljaywgdGl0bGUsIHN1YnRpdGxlLCB2YWx1ZSwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2VsbCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNlbGwtbWFpblwiPlxuICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWNlbGwtdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtc3VidGl0bGVcIj57c3VidGl0bGV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICAge3ZhbHVlICE9PSB1bmRlZmluZWQgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXZhbHVlXCI+e3ZhbHVlfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEYXRhVGFibGUoeyBjb2x1bW5zID0gW10sIHJvd3MgPSBbXSwgZ2V0Um93S2V5LCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJsZS13cmFwICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8dGFibGUgY2xhc3NOYW1lPVwid2YtdGFibGVcIj5cbiAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRcIj5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGVyLXJvd1wiPlxuICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRpbmdcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT57Y29sdW1uLmxhYmVsfTwvdGg+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwid2YtdGFibGUtYm9keVwiPlxuICAgICAgICAgIHtyb3dzLm1hcCgocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93S2V5ID0gZ2V0Um93S2V5ID8gZ2V0Um93S2V5KHJvdykgOiByb3cuaWQgfHwgaW5kZXhcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1yb3dcIiBkYXRhLXdmLWtleT17cm93S2V5fSBrZXk9e3Jvd0tleX0+XG4gICAgICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1jZWxsXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+XG4gICAgICAgICAgICAgICAgICAgIHtjb2x1bW4ucmVuZGVyID8gY29sdW1uLnJlbmRlcihyb3dbY29sdW1uLmtleV0sIHJvdykgOiByb3dbY29sdW1uLmtleV19XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFicyh7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBvbkNoYW5nZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFicyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInRhYmxpc3RcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10YWItY29udHJvbFwiXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgYXJpYS1zZWxlY3RlZD17aXRlbS5pZCA9PT0gYWN0aXZlSWR9XG4gICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlPy4oaXRlbS5pZCl9XG4gICAgICAgID5cbiAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU3RlcHMoe1xuICBpdGVtcyA9IFtdLFxuICBjdXJyZW50ID0gMCxcbiAgZGlyZWN0aW9uID0gJ2hvcml6b250YWwnLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB2ZXJ0aWNhbCA9IGRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJ1xuICByZXR1cm4gKFxuICAgIDxvbFxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc3RlcHMgJHt2ZXJ0aWNhbCA/ICd3Zi1zdGVwcy12ZXJ0aWNhbCcgOiAnd2Ytc3RlcHMtaG9yaXpvbnRhbCd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gaW5kZXggPCBjdXJyZW50ID8gJ2RvbmUnIDogaW5kZXggPT09IGN1cnJlbnQgPyAnY3VycmVudCcgOiAndG9kbydcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtgd2Ytc3RlcHMtaXRlbSB3Zi1zdGVwcy1pdGVtLSR7c3RhdHVzfWB9IGtleT17aXRlbS5pZCB8fCBpdGVtLmxhYmVsIHx8IGluZGV4fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtaW5kaWNhdG9yXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXAtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgIHtzdGF0dXMgPT09ICdkb25lJyA/IG51bGwgOiBpbmRleCArIDF9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge2luZGV4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxpbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtY29udGVudFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAge2l0ZW0uZGVzY3JpcHRpb24gPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1kZXNjXCI+e2l0ZW0uZGVzY3JpcHRpb259PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApXG4gICAgICB9KX1cbiAgICA8L29sPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbXB0eVN0YXRlKHsgdGl0bGUsIGRlc2NyaXB0aW9uLCBhY3Rpb24sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWVtcHR5LXN0YXRlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIHt0aXRsZSA/IDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtZW1wdHktdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgIHtkZXNjcmlwdGlvbiA/IDxwIGNsYXNzTmFtZT1cIndmLWVtcHR5LWRlc2NcIj57ZGVzY3JpcHRpb259PC9wPiA6IG51bGx9XG4gICAgICB7YWN0aW9uID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1hY3Rpb25cIj57YWN0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuL2Zvcm1zLmpzeCdcblxuZnVuY3Rpb24gU2NyZWVuUG9ydGFsKHsgY2hpbGRyZW4gfSkge1xuICBjb25zdCBhbmNob3IgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2hvc3QsIHNldEhvc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIHNldEhvc3QoYW5jaG9yLmN1cnJlbnQ/LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY29udGVudCcpIHx8IG51bGwpXG4gIH0sIFtdKVxuXG4gIGlmICghaG9zdCkgcmV0dXJuIDxzcGFuIHJlZj17YW5jaG9yfSBjbGFzc05hbWU9XCJ3Zi1vdmVybGF5LWFuY2hvclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gIHJldHVybiBSZWFjdERPTS5jcmVhdGVQb3J0YWwoY2hpbGRyZW4sIGhvc3QpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb2RhbCh7IG9wZW4sIHRpdGxlLCBjaGlsZHJlbiwgYWN0aW9ucywgb25DbG9zZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi1tb2RhbC1vdmVybGF5ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwicHJlc2VudGF0aW9uXCIgey4uLnJlc3R9PlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1tb2RhbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e3RpdGxlfT5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLW1vZGFsLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1tb2RhbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICAgIHtvbkNsb3NlID8gPEJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L0J1dHRvbj4gOiBudWxsfVxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kYWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgICAgICB7YWN0aW9ucyA/IDxmb290ZXIgY2xhc3NOYW1lPVwid2YtbW9kYWwtZm9vdGVyXCI+e2FjdGlvbnN9PC9mb290ZXI+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbmZpcm1EaWFsb2coe1xuICBvcGVuLFxuICB0aXRsZSA9ICdcdTc4NkVcdThCQTRcdTY0Q0RcdTRGNUMnLFxuICBtZXNzYWdlLFxuICBjb25maXJtTGFiZWwgPSAnXHU3ODZFXHU4QkE0JyxcbiAgY2FuY2VsTGFiZWwgPSAnXHU1M0Q2XHU2RDg4JyxcbiAgb25Db25maXJtLFxuICBvbkNhbmNlbCxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8TW9kYWxcbiAgICAgIG9wZW49e29wZW59XG4gICAgICB0aXRsZT17dGl0bGV9XG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgIG9uQ2xvc2U9e29uQ2FuY2VsfVxuICAgICAgey4uLnJlc3R9XG4gICAgICBhY3Rpb25zPXsoXG4gICAgICAgIDw+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtvbkNhbmNlbH0+e2NhbmNlbExhYmVsfTwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtvbkNvbmZpcm19Pntjb25maXJtTGFiZWx9PC9CdXR0b24+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1jb25maXJtLW1lc3NhZ2VcIj57bWVzc2FnZX08L3A+XG4gICAgPC9Nb2RhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9hc3QoeyBvcGVuLCBjaGlsZHJlbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi10b2FzdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInN0YXR1c1wiIHsuLi5yZXN0fT57Y2hpbGRyZW59PC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExvYWRpbmdPdmVybGF5KHsgb3BlbiwgbGFiZWwgPSAnXHU1MkEwXHU4RjdEXHU0RTJEJywgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi1sb2FkaW5nICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwic3RhdHVzXCIgey4uLnJlc3R9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1sb2FkaW5nLXNoYXBlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbG9hZGluZy1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBXaXJlTWFwKHsgY2xhc3NOYW1lID0gJycsIHN0eWxlLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHN0eWxlPXt7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCAuLi5zdHlsZSB9fSB7Li4ucmVzdH0+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1tYXAtbGluZSB3Zi1tYXAtbGluZS1hXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1saW5lIHdmLW1hcC1saW5lLWJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNYXBNYXJrZXIoeyB4LCB5LCBsYWJlbCwgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtbWFwLW1hcmtlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgbGVmdDogYCR7eH0lYCwgdG9wOiBgJHt5fSVgLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1tYXAtbWFya2VyLXNoYXBlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTWFwT3ZlcmxheSh7IHBvc2l0aW9uID0gJ2JvdHRvbScsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tYXAtb3ZlcmxheSB3Zi1tYXAtb3ZlcmxheS0ke3Bvc2l0aW9ufSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHsgTW9iaWxlU2hlbGwgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTY3JlZW5JZCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcblxuY29uc3QgdGFicyA9IFtcbiAgeyBsYWJlbDogJ1x1NTNEMVx1NzNCMCcsIHRvOiAnZGlzY292ZXInIH0sXG4gIHsgbGFiZWw6ICdcdTg4NENcdTdBMEInLCB0bzogJ3RyaXBzJyB9LFxuICB7IGxhYmVsOiAnXHU2MjExXHU3Njg0JywgdG86ICdwcm9maWxlJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlTGF5b3V0KHsgY2hpbGRyZW4gfSkge1xuICBjb25zdCBzY3JlZW5JZCA9IHVzZVNjcmVlbklkKClcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlU2hlbGwgY2xhc3NOYW1lPVwid2Vla2VuZC1zaGVsbCB3ZWVrZW5kLWxheW91dFwiIHRhYnM9e3RhYnN9IGFjdGl2ZUlkPXtzY3JlZW5JZH0gYXJpYS1sYWJlbD1cIlx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVx1NjVDNVx1ODg0Q1x1NTJBOVx1NjI0QlwiPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvTW9iaWxlU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjguMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjguMFxuICovXG5pbXBvcnQge1xuICBBdmF0YXIsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBEYXRhVGFibGUsXG4gIEZvcm1GaWVsZCxcbiAgTW9kYWwsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IENPU1RTID0gW1xuICB7IGlkOiAnY29zdC10cmFuc2l0JywgaXRlbTogJ1x1NUUwMlx1NTE4NVx1NEVBNFx1OTAxQScsIG93bmVyOiAnXHU1MTcxXHU1NDBDJywgYW1vdW50OiAnNDgnIH0sXG4gIHsgaWQ6ICdjb3N0LXRpY2tldCcsIGl0ZW06ICdcdTVDNTVcdTUzODVcdTk1RThcdTc5NjgnLCBvd25lcjogJ1x1Njc5N1x1NjY1M1x1OTFDRScsIGFtb3VudDogJzgwJyB9LFxuICB7IGlkOiAnY29zdC1sdW5jaCcsIGl0ZW06ICdcdTUzNDhcdTk5MTAnLCBvd25lcjogJ1x1NTE3MVx1NTQwQycsIGFtb3VudDogJzE4MCcgfSxcbiAgeyBpZDogJ2Nvc3QtbWFya2V0JywgaXRlbTogJ1x1NUUwMlx1OTZDNlx1OTg4NFx1NzU1OScsIG93bmVyOiAnXHU0RTJBXHU0RUJBJywgYW1vdW50OiAnMTIwJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gQnVkZ2V0U2NyZWVuKCkge1xuICBjb25zdCBbaW52aXRlT3Blbiwgc2V0SW52aXRlT3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cImJ1ZGdldC1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGJ1ZGdldF9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cImJ1ZGdldC1oZWFkZXJcIiB0aXRsZUlkPVwiYnVkZ2V0LXRpdGxlXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19oZWFkZXJcIiB0aXRsZT1cIlx1OTg4NFx1N0I5N1x1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQVwiIHN1YnRpdGxlPVwiXHU0RTNBXHU4ODRDXHU3QTBCXHU5ODg0XHU3NTU5XHU4RDM5XHU3NTI4XHU1RTc2XHU5MDgwXHU4QkY3XHU0RjE5XHU0RjM0XCIgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJidWRnZXRfX2JhY2tcIiB0bz1cInRyaXAtY29uZmlybVwiPlx1OEZENFx1NTZERTwvQnV0dG9uPn0gLz5cbiAgICAgICAgPENhcmQgaWQ9XCJidWRnZXQtc3VtbWFyeVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LWxhYmVsXCI+XHU5ODg0XHU4QkExXHU2MDNCXHU4RDM5XHU3NTI4PC9UZXh0PlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktdmFsdWVcIj40MjggXHU1MTQzPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktbm90ZVwiPlx1NjMwOSAzIFx1NEY0RFx1NTQwQ1x1ODg0Q1x1NEVCQVx1OEJBMVx1N0I5N1x1RkYwQ1x1NEVCQVx1NTc0N1x1N0VBNiAxNDMgXHU1MTQzPC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxEYXRhVGFibGUgaWQ9XCJidWRnZXQtdGFibGVcIiBjbGFzc05hbWU9XCJidWRnZXRfX3RhYmxlXCIgY29sdW1ucz17W3sga2V5OiAnaXRlbScsIGxhYmVsOiAnXHU5ODc5XHU3NkVFJyB9LCB7IGtleTogJ293bmVyJywgbGFiZWw6ICdcdTYyN0ZcdTYyQzUnIH0sIHsga2V5OiAnYW1vdW50JywgbGFiZWw6ICdcdTkxRDFcdTk4OUQnIH1dfSByb3dzPXtDT1NUU30gZ2V0Um93S2V5PXsocm93KSA9PiByb3cuaWR9IC8+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJidWRnZXQtbWVtYmVyc1wiIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyc1wiIGdhcD17MTJ9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJzLWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlcnMtbGFiZWxcIj5cdTU0MENcdTg4NENcdTRFQkE8L1RleHQ+XG4gICAgICAgICAgICA8QnV0dG9uIGlkPVwiYnVkZ2V0LWludml0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1hY3Rpb25cIiBvbkNsaWNrPXsoKSA9PiBzZXRJbnZpdGVPcGVuKHRydWUpfT5cdTkwODBcdThCRjc8L0J1dHRvbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLXN0YWNrXCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyXCIgZGF0YS13Zi1rZXk9XCJtZW1iZXItbGluXCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1Njc5N1x1NjY1M1x1OTFDRVwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1Njc5N1x1NjY1M1x1OTFDRTwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci1jaGVuXCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1OTY0OFx1Njk4NlwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1OTY0OFx1Njk4NjwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci16aG91XCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1NTQ2OFx1NUNCOFwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1NTQ2OFx1NUNCODwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJidWRnZXQtZG9uZVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fZG9uZVwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJ0cmlwLWNvbmZpcm1cIj5cdTRGRERcdTVCNThcdTk4ODRcdTdCOTc8L0J1dHRvbj5cbiAgICAgICAgPE1vZGFsXG4gICAgICAgICAgaWQ9XCJidWRnZXQtaW52aXRlLW1vZGFsXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1tb2RhbFwiXG4gICAgICAgICAgb3Blbj17aW52aXRlT3Blbn1cbiAgICAgICAgICB0aXRsZT1cIlx1OTA4MFx1OEJGN1x1NTQwQ1x1ODg0Q1x1NEVCQVwiXG4gICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SW52aXRlT3BlbihmYWxzZSl9XG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9eygpID0+IHNldEludml0ZU9wZW4oZmFsc2UpfT5cdTUzRDFcdTkwMDFcdTkwODBcdThCRjc8L0J1dHRvbj59XG4gICAgICAgID5cbiAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWZpZWxkXCIgbGFiZWw9XCJcdTYyNEJcdTY3M0FcdTUzRjdcdTYyMTZcdTc1MjhcdTYyMzdcdTU0MERcIiBodG1sRm9yPVwiYnVkZ2V0LWludml0ZS1pbnB1dFwiPlxuICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cImJ1ZGdldC1pbnZpdGUtaW5wdXRcIiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiXHU4RjkzXHU1MTY1XHU1NDBDXHU4ODRDXHU0RUJBXHU0RkUxXHU2MDZGXCIgLz5cbiAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPC9Nb2RhbD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBHcmlkLFxuICBIZWFkaW5nLFxuICBJbWFnZVBsYWNlaG9sZGVyLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgUk9VVEVTID0gW1xuICB7IGlkOiAncm91dGUtY2FuYWwnLCB0aXRsZTogJ1x1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOScsIG1ldGE6ICdcdTZCNjVcdTg4NEMgOC42IGttIFx1MDBCNyA2IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTY1RTdcdTRFRDNcdTVFOTNcdTMwMDFcdTY4NjVcdTRFMEJcdTVFMDJcdTk2QzZcdTRFMEVcdTUwOERcdTY2NUFcdTZDQjNcdTVDQjgnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1oaWxscycsIHRpdGxlOiAnXHU1N0NFXHU1MzE3XHU4RjdCXHU1RjkyXHU2QjY1JywgbWV0YTogJ1x1NUY5Mlx1NkI2NSAxMSBrbSBcdTAwQjcgNyBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU2Nzk3XHU5NUY0XHU3RjEzXHU1NzYxXHUzMDAxXHU4OUMyXHU2NjZGXHU1M0YwXHU0RTBFXHU1QzcxXHU4MTFBXHU1QzBGXHU5OTg2JyB9LFxuICB7IGlkOiAncm91dGUtbGFuZXMnLCB0aXRsZTogJ1x1ODAwMVx1ODg1N1x1NjE2Mlx1NkUzOCcsIG1ldGE6ICdcdTZCNjVcdTg4NEMgNS4yIGttIFx1MDBCNyA0IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTVERjdcdTUzRTNcdTY1RTlcdTk5MTBcdTMwMDFcdTY1RTdcdTRFNjZcdTVFOTdcdTRFMEVcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RUQnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1sYWtlJywgdGl0bGU6ICdcdTczQUZcdTZFNTZcdTlBOTFcdTg4NENcdTUzNEFcdTY1RTUnLCBtZXRhOiAnXHU5QTkxXHU4ODRDIDE4IGttIFx1MDBCNyA1IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTZFN0ZcdTU3MzBcdTY4MDhcdTkwNTNcdTMwMDFcdTU4MjRcdTVDQjhcdTRFMEVcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1tdXNldW0nLCB0aXRsZTogJ1x1OTZFOFx1NTkyOVx1NTM1QVx1NzI2OVx1OTk4Nlx1N0VCRicsIG1ldGE6ICdcdTUxNkNcdTRFQTQgNCBcdTdBRDkgXHUwMEI3IDYgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NEUwOVx1NEUyQVx1NUM1NVx1OTk4Nlx1NEUwRVx1NEUwMFx1OTVGNFx1NUI4OVx1OTc1OVx1NTQ5Nlx1NTU2MVx1OTk4NicgfSxcbiAgeyBpZDogJ3JvdXRlLW5pZ2h0JywgdGl0bGU6ICdcdTU5MUNcdTgyNzJcdTVFRkFcdTdCNTFcdTY1NjNcdTZCNjUnLCBtZXRhOiAnXHU2QjY1XHU4ODRDIDYuNCBrbSBcdTAwQjcgMyBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU1RTdGXHU1NzNBXHUzMDAxXHU1MjY3XHU5NjYyXHU0RTBFXHU2QzVGXHU4RkI5XHU3MDZGXHU1MTQ5XHU1RTI2JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gRGlzY292ZXJTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJkaXNjb3Zlci1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGRpc2NvdmVyX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJkaXNjb3Zlci1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJkaXNjb3Zlci10aXRsZVwiXG4gICAgICAgICAgc3VidGl0bGVJZD1cImRpc2NvdmVyLXN1YnRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkaXNjb3Zlcl9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEZEOVx1NEUyQVx1NTQ2OFx1NjcyQlx1RkYwQ1x1NTNCQlx1NTRFQVx1OEQ3MFx1OEQ3MFwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTRFM0FcdTRGNjBcdTYzMTFcdTRFODZcdTUxRTBcdTY3NjFcdTRFMERcdTc1MjhcdThENzZcdTY1RjZcdTk1RjRcdTc2ODRcdTU3Q0VcdTVFMDJcdThERUZcdTdFQkZcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gaWQ9XCJkaXNjb3Zlci1tYXAtYWN0aW9uXCIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX21hcC1hY3Rpb25cIiB0bz1cImV4cGxvcmUtbWFwXCI+XHU1NzMwXHU1NkZFPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8Q2FyZCBpZD1cImRpc2NvdmVyLWZlYXR1cmVkXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkIGRpc2NvdmVyX19mZWF0dXJlZFwiIHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgPEltYWdlUGxhY2Vob2xkZXIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWltYWdlXCIgaGVpZ2h0PXsxNzZ9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZF9fYm9keSBkaXNjb3Zlcl9fZmVhdHVyZWQtYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IGRpc2NvdmVyX19mZWF0dXJlZC1iYWRnZXNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlXCI+XHU2NzJDXHU1NDY4XHU2M0E4XHU4MzUwPC9CYWRnZT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1iYWRnZVwiPlx1OTAwMlx1NTQwOFx1NTIxRFx1NkIyMVx1NTIzMFx1OEJCRjwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC10aXRsZVwiIGxldmVsPXsyfT5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5Mjk8L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtY29weVwiPlx1NEVDRVx1NjVFN1x1NEVEM1x1NUU5M1x1NTFGQVx1NTNEMVx1RkYwQ1x1NkNCRlx1NkMzNFx1NUNCOFx1OEQ3MFx1NTIzMFx1Njg2NVx1NEUwQlx1NUUwMlx1OTZDNlx1RkYwQ1x1NTcyOFx1NjVFNVx1ODQzRFx1NTI0RFx1NjJCNVx1OEZCRVx1NkNCM1x1NkU3RVx1NUU3M1x1NTNGMFx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid2Vla2VuZC1jYXJkLW1ldGEgZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGFcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPjguNiBrbTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPlx1N0VBNiA2IFx1NUMwRlx1NjVGNjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPlx1OEY3Qlx1Njc3RTwvVGV4dD5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwiZGlzY292ZXItcm91dGVzLXRpdGxlXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1zZWN0aW9uLWhlYWRpbmcgZGlzY292ZXJfX3JvdXRlcy10aXRsZVwiIGxldmVsPXsyfT5cdTY2RjRcdTU5MUFcdThERUZcdTdFQkY8L0hlYWRpbmc+XG4gICAgICAgIDxHcmlkIGlkPVwiZGlzY292ZXItcm91dGVzXCIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlc1wiIGNvbHVtbnM9ezF9IGdhcD17MTR9PlxuICAgICAgICAgIHtST1VURVMubWFwKChyb3V0ZSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZCBkaXNjb3Zlcl9fcm91dGUtY2FyZFwiIGRhdGEtd2Yta2V5PXtyb3V0ZS5pZH0ga2V5PXtyb3V0ZS5pZH0gdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgPEltYWdlUGxhY2Vob2xkZXIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLWltYWdlXCIgaGVpZ2h0PXtpbmRleCAlIDIgPT09IDAgPyAxMTYgOiAxMzZ9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmRfX2JvZHkgZGlzY292ZXJfX3JvdXRlLWJvZHlcIiBnYXA9ezd9PlxuICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS10aXRsZVwiIGxldmVsPXszfT57cm91dGUudGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS1tZXRhXCI+e3JvdXRlLm1ldGF9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS1ub3RlXCI+e3JvdXRlLm5vdGV9PC9UZXh0PlxuICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBXaXJlTWFwIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2hhbmdoYWlNYXAoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxXaXJlTWFwIGNsYXNzTmFtZT17YHNoYW5naGFpLW1hcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvV2lyZU1hcD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgTWFwTWFya2VyLFxuICBNYXBPdmVybGF5LFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IFNoYW5naGFpTWFwIH0gZnJvbSAnLi4vY29tcG9uZW50cy9TaGFuZ2hhaU1hcC5qc3gnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBFeHBsb3JlTWFwU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiZXhwbG9yZS1tYXAtcGFnZVwiIGdhcD17MTZ9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBleHBsb3JlLW1hcF9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZXhwbG9yZS1tYXAtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiZXhwbG9yZS1tYXAtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU3NkVFXHU3Njg0XHU1NzMwXHU1NzMwXHU1NkZFXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OEY3Qlx1ODlFNlx1NjgwN1x1OEJCMFx1NjdFNVx1NzcwQlx1NjNBOFx1ODM1MFx1OERFRlx1N0VCRlwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fYmFja1wiIHRvPVwiZGlzY292ZXJcIj5cdTUyMTdcdTg4Njg8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxSb3cgaWQ9XCJleHBsb3JlLW1hcC1maWx0ZXJzXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1jaGlwLXJvdyBleHBsb3JlLW1hcF9fZmlsdGVyc1wiIGdhcD17OH0+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTUxNjhcdTkwRTg8L0JhZGdlPlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU2QjY1XHU4ODRDPC9CYWRnZT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1OUE5MVx1ODg0QzwvQmFkZ2U+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTVCQTRcdTUxODU8L0JhZGdlPlxuICAgICAgICA8L1Jvdz5cbiAgICAgICAgPFNoYW5naGFpTWFwIGlkPVwiZXhwbG9yZS1tYXAtY2FudmFzXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1tYXAgZXhwbG9yZS1tYXBfX2NhbnZhc1wiPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLXN1emhvdS1jcmVla1wiIHg9ezUxfSB5PXs0MH0gbGFiZWw9XCJcdTgyQ0ZcdTVEREVcdTZDQjNcdTZFRThcdTZDMzRcdTZGMkJcdTZCNjVcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXItYnVuZFwiIHg9ezYyfSB5PXs0N30gbGFiZWw9XCJcdTU5MTZcdTZFRTlcdTVFRkFcdTdCNTFcdTZGMkJcdTZFMzhcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXIteHVodWlcIiB4PXs0OX0geT17NTV9IGxhYmVsPVwiXHU4ODYxXHU1OTBEXHU5OENFXHU4QzhDXHU5QTkxXHU4ODRDXCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLXB1ZG9uZ1wiIHg9ezc1fSB5PXs0M30gbGFiZWw9XCJcdTk2NDZcdTVCQjZcdTU2MzRcdTU3Q0VcdTVFMDJcdTZGMkJcdTZCNjVcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE92ZXJsYXkgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX292ZXJsYXlcIiBwb3NpdGlvbj1cImJvdHRvbVwiPlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3JvdXRlLXByZXZpZXdcIiB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LWV5ZWJyb3dcIj5cdThERERcdTc5QkJcdTRGNjAgMi40IGttPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctdGl0bGVcIj5cdTgyQ0ZcdTVEREVcdTZDQjNcdTZFRThcdTZDMzRcdTZGMkJcdTZCNjU8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy1tZXRhXCI+OC42IGttIFx1MDBCNyBcdTdFQTYgNiBcdTVDMEZcdTY1RjYgXHUwMEI3IFx1OEY3Qlx1Njc3RTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPC9NYXBPdmVybGF5PlxuICAgICAgICA8L1NoYW5naGFpTWFwPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjguMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjguMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgU3RlcHMsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgRVZFTlRTID0gW1xuICB7IGlkOiAnZXZlbnQtbWVldCcsIHRpbWU6ICcwOToxMCcsIHRpdGxlOiAnXHU1NzMwXHU5NEMxXHU1M0UzXHU5NkM2XHU1NDA4Jywgbm90ZTogJ1x1NEVDRSAzIFx1NTNGN1x1NTNFM1x1NkI2NVx1ODg0Q1x1N0VBNiA4IFx1NTIwNlx1OTQ5Rlx1NTIzMFx1OERFRlx1N0VCRlx1OEQ3N1x1NzBCOVx1MzAwMicsIHRhZzogJ1x1OTZDNlx1NTQwOCcgfSxcbiAgeyBpZDogJ2V2ZW50LXdhcmVob3VzZScsIHRpbWU6ICcwOTozMCcsIHRpdGxlOiAnXHU2NUU3XHU0RUQzXHU1RTkzXHU1QzU1XHU1Mzg1Jywgbm90ZTogJ1x1NzcwQlx1NUUzOFx1OEJCRVx1NUM1NVx1NEUwRVx1NUM0Qlx1OTg3Nlx1N0VEM1x1Njc4NFx1RkYwQ1x1NTE2NVx1NTNFM1x1NTkwNFx1NTNFRlx1NUJDNFx1NUI1OFx1ODBDQ1x1NTMwNVx1MzAwMicsIHRhZzogJ1x1NTNDMlx1ODlDMicgfSxcbiAgeyBpZDogJ2V2ZW50LW1hcmtldCcsIHRpbWU6ICcxMTowMCcsIHRpdGxlOiAnXHU2ODY1XHU0RTBCXHU1NDY4XHU2NzJCXHU1RTAyXHU5NkM2Jywgbm90ZTogJ1x1NTE0OFx1OTAxQlx1NjI0Qlx1NEY1Q1x1NjQ0QVx1NEY0RFx1RkYwQ1x1NTE4RFx1NTcyOFx1NEUxQ1x1NEZBN1x1OTkxMFx1OEY2Nlx1NTMzQVx1N0I4MFx1NTM1NVx1NTM0OFx1OTkxMFx1MzAwMicsIHRhZzogJ1x1NUUwMlx1OTZDNicgfSxcbiAgeyBpZDogJ2V2ZW50LWx1bmNoJywgdGltZTogJzEzOjAwJywgdGl0bGU6ICdcdTZDMzRcdTVDQjhcdTVDMEZcdTk5ODZcdTUzNDhcdTk5MTAnLCBub3RlOiAnXHU5ODg0XHU4QkExXHU3NTI4XHU5OTEwIDcwIFx1NTIwNlx1OTQ5Rlx1RkYwQ1x1OTc2MFx1N0E5N1x1NTMzQVx1NTdERlx1NjVFMFx1OTcwMFx1OTg4NFx1N0VBNlx1MzAwMicsIHRhZzogJ1x1NzUyOFx1OTkxMCcgfSxcbiAgeyBpZDogJ2V2ZW50LWxhbmVzJywgdGltZTogJzE0OjIwJywgdGl0bGU6ICdcdTZDMzRcdTVDQjhcdTVDMEZcdTVERjdcdTY1NjNcdTZCNjUnLCBub3RlOiAnXHU2Q0JGXHU3N0YzXHU5NjM2XHU4RkRCXHU1MTY1XHU2NUU3XHU4ODU3XHU1MzNBXHVGRjBDXHU3RUNGXHU4RkM3XHU0RTY2XHU1RTk3XHU1NDhDXHU1MTZDXHU1MTcxXHU2RDE3XHU4ODYzXHU2MjNGXHUzMDAyJywgdGFnOiAnXHU2QjY1XHU4ODRDJyB9LFxuICB7IGlkOiAnZXZlbnQtZ2FyZGVuJywgdGltZTogJzE1OjIwJywgdGl0bGU6ICdcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RURcdTRGMTFcdTYwNkYnLCBub3RlOiAnXHU4ODY1XHU2QzM0XHU1RTc2XHU2NTc0XHU3NDA2XHU5NjhGXHU4RUFCXHU3MjY5XHU1NEMxXHVGRjBDXHU4MkIxXHU1NkVEXHU1MzE3XHU5NUU4XHU2NzA5XHU1MTZDXHU1MTcxXHU4QkJFXHU2NUJEXHUzMDAyJywgdGFnOiAnXHU0RjExXHU2MDZGJyB9LFxuICB7IGlkOiAnZXZlbnQtc3Vuc2V0JywgdGltZTogJzE3OjEwJywgdGl0bGU6ICdcdTZDQjNcdTZFN0VcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnLCBub3RlOiAnXHU4REVGXHU3RUJGXHU3RUM4XHU3MEI5XHVGRjBDXHU1M0VGXHU3RUU3XHU3RUVEXHU2Q0JGXHU1ODI0XHU1Q0I4XHU2QjY1XHU4ODRDXHU4MUYzXHU2NjVBXHU5OTEwXHU1MzNBXHU1N0RGXHUzMDAyJywgdGFnOiAnXHU4OUMyXHU2NjZGJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gSXRpbmVyYXJ5U2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiaXRpbmVyYXJ5LXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgaXRpbmVyYXJ5X19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJpdGluZXJhcnktaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiaXRpbmVyYXJ5LXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTZCQ0ZcdTY1RTVcdTg4NENcdTdBMEJcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU1NDY4XHU1MTZEIFx1MDBCNyBcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjlcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19iYWNrXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cdThERUZcdTdFQkY8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxTdGVwc1xuICAgICAgICAgIGlkPVwiaXRpbmVyYXJ5LXByb2dyZXNzXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3Byb2dyZXNzXCJcbiAgICAgICAgICBjdXJyZW50PXsxfVxuICAgICAgICAgIGl0ZW1zPXtbeyBpZDogJ21vcm5pbmcnLCBsYWJlbDogJ1x1NEUwQVx1NTM0OCcgfSwgeyBpZDogJ2FmdGVybm9vbicsIGxhYmVsOiAnXHU0RTBCXHU1MzQ4JyB9LCB7IGlkOiAnZXZlbmluZycsIGxhYmVsOiAnXHU1MDhEXHU2NjVBJyB9XX1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtbiBpZD1cIml0aW5lcmFyeS1ldmVudHNcIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50c1wiIGdhcD17MTR9PlxuICAgICAgICAgIHtFVkVOVFMubWFwKChldmVudCkgPT4gKFxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50XCIgZGF0YS13Zi1rZXk9e2V2ZW50LmlkfSBrZXk9e2V2ZW50LmlkfSBnYXA9ezEwfSBhbGlnbkl0ZW1zPVwiZmxleC1zdGFydFwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3RpbWVcIj57ZXZlbnQudGltZX08L1RleHQ+XG4gICAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtY2FyZFwiPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1ib2R5XCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtdGl0bGVcIiBsZXZlbD17M30+e2V2ZW50LnRpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtYmFkZ2VcIj57ZXZlbnQudGFnfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtbm90ZVwiPntldmVudC5ub3RlfTwvVGV4dD5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q2FyZCBpZD1cIml0aW5lcmFyeS1yZW1pbmRlclwiIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXJcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItdGl0bGVcIj5cdTUxRkFcdTUzRDFcdTYzRDBcdTkxOTI8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItY29weVwiPlx1NUVGQVx1OEJBRVx1NjQzQVx1NUUyNlx1OTk2RVx1NzUyOFx1NkMzNFx1MzAwMVx1OEY3Qlx1NEZCRlx1OTZFOFx1NTE3N1x1NTQ4Q1x1NTNFRlx1OTFDRFx1NTkwRFx1NEY3Rlx1NzUyOFx1NzY4NFx1OEQyRFx1NzI2OVx1ODg4Qlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8QnV0dG9uIGlkPVwiaXRpbmVyYXJ5LWNyZWF0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2NyZWF0ZS1hY3Rpb25cIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwidHJpcC1jcmVhdGVcIj5cdTUyMUJcdTVFRkFcdTYyMTFcdTc2ODRcdTcyNDhcdTY3MkM8L0J1dHRvbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDb2x1bW4sXG4gIEZvcm1GaWVsZCxcbiAgSGVhZGluZyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dpblNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8Q29sdW1uIGlkPVwibG9naW4tcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cIndlZWtlbmQtbG9naW4gbG9naW5fX3BhZ2VcIj5cbiAgICAgIDxzcGFuIGlkPVwibG9naW4tbG9nb1wiIGNsYXNzTmFtZT1cIndlZWtlbmQtbG9nby1wbGFjZWhvbGRlciBsb2dpbl9fbG9nb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImxvZ2luX19pbnRyb1wiIGdhcD17OH0+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwibG9naW4tdGl0bGVcIiBjbGFzc05hbWU9XCJsb2dpbl9fdGl0bGVcIiBsZXZlbD17MX0+XHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxPC9IZWFkaW5nPlxuICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJsb2dpbl9fZGVzY3JpcHRpb25cIj5cdTYyOEFcdTYwRjNcdTUzQkJcdTc2ODRcdTU3MzBcdTY1QjlcdUZGMENcdTUzRDhcdTYyMTBcdTRFMDBcdTRFRkRcdTk2OEZcdTY1RjZcdTgwRkRcdThENzBcdTc2ODRcdTg4NENcdTdBMEJcdTMwMDI8L1RleHQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwibG9naW5fX3Bob25lLWZpZWxkXCIgbGFiZWw9XCJcdTYyNEJcdTY3M0FcdTUzRjdcIiBodG1sRm9yPVwibG9naW4tcGhvbmVcIj5cbiAgICAgICAgPFRleHRJbnB1dCBpZD1cImxvZ2luLXBob25lXCIgY2xhc3NOYW1lPVwibG9naW5fX3Bob25lLWlucHV0XCIgaW5wdXRNb2RlPVwidGVsXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTYyNEJcdTY3M0FcdTUzRjdcIiAvPlxuICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImxvZ2luX19jb2RlLWZpZWxkXCIgbGFiZWw9XCJcdTlBOENcdThCQzFcdTc4MDFcIiBodG1sRm9yPVwibG9naW4tY29kZVwiIGhpbnQ9XCJcdTZGMTRcdTc5M0FcdTczQUZcdTU4ODNcdTUzRUZcdThGOTNcdTUxNjVcdTRFRkJcdTYxMEYgNiBcdTRGNERcdTY1NzBcdTVCNTdcIj5cbiAgICAgICAgPFRleHRJbnB1dCBpZD1cImxvZ2luLWNvZGVcIiBjbGFzc05hbWU9XCJsb2dpbl9fY29kZS1pbnB1dFwiIGlucHV0TW9kZT1cIm51bWVyaWNcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1OUE4Q1x1OEJDMVx1NzgwMVwiIC8+XG4gICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgIDxCdXR0b24gaWQ9XCJsb2dpbi1zdWJtaXRcIiBjbGFzc05hbWU9XCJsb2dpbl9fc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cImRpc2NvdmVyXCI+XHU1RjAwXHU1OUNCXHU2M0EyXHU3RDIyPC9CdXR0b24+XG4gICAgICA8VGV4dCBjbGFzc05hbWU9XCJsb2dpbl9fYWdyZWVtZW50XCIgYXM9XCJzbWFsbFwiPlx1N0VFN1x1N0VFRFx1NTM3M1x1ODg2OFx1NzkzQVx1NTQwQ1x1NjEwRlx1NjcwRFx1NTJBMVx1Njc2MVx1NkIzRVx1NEUwRVx1OTY5MFx1NzlDMVx1OEJGNFx1NjYwRVx1MzAwMjwvVGV4dD5cbiAgICA8L0NvbHVtbj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEF2YXRhcixcbiAgQ2VsbCxcbiAgQ29sdW1uLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG4gIFRvZ2dsZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvZmlsZVNjcmVlbigpIHtcbiAgY29uc3QgW25vdGlmaWNhdGlvbnMsIHNldE5vdGlmaWNhdGlvbnNdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW29mZmxpbmVNYXBzLCBzZXRPZmZsaW5lTWFwc10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBwcm9maWxlX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwicHJvZmlsZS1oZWFkZXJcIiB0aXRsZUlkPVwicHJvZmlsZS10aXRsZVwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX2hlYWRlclwiIHRpdGxlPVwiXHU2MjExXHU3Njg0XCIgc3VidGl0bGU9XCJcdTRFMkFcdTRFQkFcdTUwNEZcdTU5N0RcdTRFMEVcdTY1QzVcdTg4NENcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICA8Um93IGlkPVwicHJvZmlsZS1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VtbWFyeVwiIGdhcD17MTJ9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICA8QXZhdGFyIGNsYXNzTmFtZT1cInByb2ZpbGVfX2F2YXRhclwiIHNpemU9ezU4fSBsYWJlbD1cIlx1NzUyOFx1NjIzN1x1NTkzNFx1NTBDRlx1NTM2MFx1NEY0RFwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9maWxlX19pZGVudGl0eVwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJwcm9maWxlX19uYW1lXCI+XHU2Nzk3XHU2NjUzXHU5MUNFPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19iaW9cIj5cdTVERjJcdThENzBcdThGQzcgMTIgXHU1RUE3XHU1N0NFXHU1RTAyPC9UZXh0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1Jvdz5cbiAgICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtYWNjb3VudFwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnRcIiBnYXA9ezB9PlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU2NUM1XHU4ODRDXHU2ODYzXHU2ODQ4XCIgc3VidGl0bGU9XCJcdTUwNEZcdTU5N0RcdTMwMDFcdThEQjNcdThGRjlcdTRFMEVcdTY1MzZcdTg1Q0ZcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU1NDBDXHU4ODRDXHU0RUJBXCIgc3VidGl0bGU9XCIzIFx1NEY0RFx1NUUzOFx1NzUyOFx1NTQwQ1x1ODg0Q1x1NEVCQVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fYWNjb3VudC1jZWxsXCIgdGl0bGU9XCJcdTdEMjdcdTYwMjVcdTgwNTRcdTdDRkJcdTRFQkFcIiBzdWJ0aXRsZT1cIlx1NURGMlx1OEJCRVx1N0Y2RVwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1zZXR0aW5nc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmdzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctbGFiZWxcIj5cdTg4NENcdTdBMEJcdTYzRDBcdTkxOTI8L1RleHQ+XG4gICAgICAgICAgICA8VG9nZ2xlIGlkPVwicHJvZmlsZS1ub3RpZmljYXRpb25zXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fbm90aWZpY2F0aW9uc1wiIGNoZWNrZWQ9e25vdGlmaWNhdGlvbnN9IG9uQ2hhbmdlPXtzZXROb3RpZmljYXRpb25zfSAvPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLWxhYmVsXCI+XHU4MUVBXHU1MkE4XHU0RTBCXHU4RjdEXHU3OUJCXHU3RUJGXHU1NzMwXHU1NkZFPC9UZXh0PlxuICAgICAgICAgICAgPFRvZ2dsZSBpZD1cInByb2ZpbGUtb2ZmbGluZS1tYXBzXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fb2ZmbGluZS1tYXBzXCIgY2hlY2tlZD17b2ZmbGluZU1hcHN9IG9uQ2hhbmdlPXtzZXRPZmZsaW5lTWFwc30gLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLXN1cHBvcnRcIiBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0XCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0LWNlbGxcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOVx1NEUwRVx1NTNDRFx1OTk4OFwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydC1jZWxsXCIgdGl0bGU9XCJcdTk2OTBcdTc5QzFcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnQtY2VsbFwiIHRpdGxlPVwiXHU1MTczXHU0RThFXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXCIgdmFsdWU9XCIxLjBcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJyZWFkY3J1bWJzLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgR3JpZCxcbiAgSGVhZGluZyxcbiAgSW1hZ2VQbGFjZWhvbGRlcixcbiAgUm93LFxuICBUYWJzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IFNUT1BTID0gW1xuICB7IGlkOiAnc3RvcC13YXJlaG91c2UnLCB0aXRsZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1NUM1NVx1NTM4NScsIHN1YnRpdGxlOiAnMDk6MzAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA2MCBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWJyaWRnZScsIHRpdGxlOiAnXHU2ODY1XHU0RTBCXHU1NDY4XHU2NzJCXHU1RTAyXHU5NkM2Jywgc3VidGl0bGU6ICcxMTowMCBcdTAwQjcgXHU1RUZBXHU4QkFFXHU1MDVDXHU3NTU5IDkwIFx1NTIwNlx1OTQ5RicgfSxcbiAgeyBpZDogJ3N0b3AtbGFuZScsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU1REY3Jywgc3VidGl0bGU6ICcxMzozMCBcdTAwQjcgXHU1MzQ4XHU5OTEwXHU0RTBFXHU4ODU3XHU1MzNBXHU2NTYzXHU2QjY1JyB9LFxuICB7IGlkOiAnc3RvcC1nYXJkZW4nLCB0aXRsZTogJ1x1NzkzRVx1NTMzQVx1ODJCMVx1NTZFRCcsIHN1YnRpdGxlOiAnMTU6MjAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA0NSBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWJlbmQnLCB0aXRsZTogJ1x1NkNCM1x1NkU3RVx1NjVFNVx1ODQzRFx1NUU3M1x1NTNGMCcsIHN1YnRpdGxlOiAnMTc6MTAgXHUwMEI3IFx1OERFRlx1N0VCRlx1N0VDOFx1NzBCOScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlRGV0YWlsU2NyZWVuKCkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gUmVhY3QudXNlU3RhdGUoJ292ZXJ2aWV3JylcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHJvdXRlLWRldGFpbF9fcGFnZVwiPlxuICAgICAgICA8QnJlYWRjcnVtYnMgaWQ9XCJyb3V0ZS1kZXRhaWwtYnJlYWRjcnVtYnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JyZWFkY3J1bWJzXCIgaXRlbXM9e1t7IGxhYmVsOiAnXHU1M0QxXHU3M0IwJywgdG86ICdkaXNjb3ZlcicgfSwgeyBsYWJlbDogJ1x1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOScgfV19IC8+XG4gICAgICAgIDxJbWFnZVBsYWNlaG9sZGVyIGlkPVwicm91dGUtZGV0YWlsLWhlcm9cIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2hlcm9cIiBoZWlnaHQ9ezIyNH0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLXN1bW1hcnlcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3N1bW1hcnlcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndlZWtlbmQtY2hpcC1yb3cgcm91dGUtZGV0YWlsX19iYWRnZXNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdTU3Q0VcdTVFMDJcdTZGMkJcdTZCNjU8L0JhZGdlPlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdThGN0JcdTY3N0U8L0JhZGdlPlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdTUzRUZcdTVFMjZcdTVCQTBcdTcyNjk8L0JhZGdlPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxIZWFkaW5nIGlkPVwicm91dGUtZGV0YWlsLXRpdGxlXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX190aXRsZVwiIGxldmVsPXsxfT5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5Mjk8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19pbnRyb1wiPlx1NEUwMFx1Njc2MVx1NEVDRVx1NURFNVx1NEUxQVx1OTA1N1x1NUI1OFx1OEQ3MFx1NTQxMVx1NzUxRlx1NkQzQlx1ODg1N1x1NTMzQVx1NzY4NFx1NkMzNFx1NUNCOFx1OERFRlx1N0VCRlx1MzAwMlx1NEUwQVx1NTM0OFx1NzcwQlx1NUM1NVx1RkYwQ1x1NEUyRFx1NTM0OFx1OTAxQlx1NUUwMlx1OTZDNlx1RkYwQ1x1NTA4RFx1NjY1QVx1NTcyOFx1NkNCM1x1NkU3RVx1N0I0OVx1NjVFNVx1ODQzRFx1MzAwMjwvVGV4dD5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxHcmlkIGlkPVwicm91dGUtZGV0YWlsLWZhY3RzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0c1wiIGNvbHVtbnM9ezN9IGdhcD17OH0+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+OC42IGttPC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC1sYWJlbFwiPlx1NjAzQlx1OERFRlx1N0EwQjwvc3Bhbj48L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+NiBcdTVDMEZcdTY1RjY8L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LWxhYmVsXCI+XHU1RUZBXHU4QkFFXHU2NUY2XHU5NTdGPC9zcGFuPjwvQ2FyZD5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3RcIj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtdmFsdWVcIj41IFx1N0FEOTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtbGFiZWxcIj5cdThERUZcdTdFQkZcdTgyODJcdTcwQjk8L3NwYW4+PC9DYXJkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDxUYWJzIGlkPVwicm91dGUtZGV0YWlsLXRhYnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3RhYnNcIiBhY3RpdmVJZD17dGFifSBvbkNoYW5nZT17c2V0VGFifSBpdGVtcz17W3sgaWQ6ICdvdmVydmlldycsIGxhYmVsOiAnXHU4REVGXHU3RUJGXHU2OTgyXHU4OUM4JyB9LCB7IGlkOiAnbm90ZXMnLCBsYWJlbDogJ1x1NTFGQVx1NTNEMVx1OTg3Qlx1NzdFNScgfV19IC8+XG4gICAgICAgIHt0YWIgPT09ICdvdmVydmlldycgPyAoXG4gICAgICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1zdG9wc1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fc3RvcHNcIiBnYXA9ezB9PlxuICAgICAgICAgICAge1NUT1BTLm1hcCgoc3RvcCwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19zdG9wXCIgZGF0YS13Zi1rZXk9e3N0b3AuaWR9IGtleT17c3RvcC5pZH0gdGl0bGU9e2Ake2luZGV4ICsgMX0uICR7c3RvcC50aXRsZX1gfSBzdWJ0aXRsZT17c3RvcC5zdWJ0aXRsZX0gdmFsdWU9e2Ake2luZGV4ICsgMX1gfSAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPENhcmQgaWQ9XCJyb3V0ZS1kZXRhaWwtbm90ZXNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVzXCI+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZXMtYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVcIj5cdTZDQkZcdTkwMTRcdTU5MjdcdTkwRThcdTUyMDZcdThERUZcdTZCQjVcdTY3MDlcdTY4MTFcdTgzNkJcdUZGMENcdTZDQjNcdTZFN0VcdTUzM0FcdTU3REZcdTRFMEJcdTUzNDhcdTY1RTVcdTcxNjdcdThGODNcdTVGM0FcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZVwiPlx1NjVFN1x1NEVEM1x1NUU5M1x1NTQ2OFx1NEUwMFx1OTVFRFx1OTk4Nlx1RkYwQ1x1NTQ2OFx1NjcyQlx1NUVGQVx1OEJBRVx1NjNEMFx1NTI0RFx1OTg4NFx1N0VBNlx1NTE2NVx1NTczQVx1NjVGNlx1NkJCNVx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3RlXCI+XHU4REVGXHU3RUJGXHU3RUM4XHU3MEI5XHU4REREXHU3OUJCXHU1NzMwXHU5NEMxXHU3QUQ5XHU3RUE2IDkwMCBcdTdDNzNcdUZGMENcdTRFNUZcdTUzRUZcdTRFNThcdTU3NTBcdTc5M0VcdTUzM0FcdTYzQTVcdTlBNzNcdThGNjZcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICl9XG4gICAgICAgIDxDYXJkIGlkPVwicm91dGUtZGV0YWlsLWd1aWRlXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZS1ib2R5XCIgZ2FwPXs4fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtdGl0bGVcIiBsZXZlbD17M30+XHU4REVGXHU3RUJGXHU3QjU2XHU1MjEyXHU0RUJBPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZS1jb3B5XCI+XHU2Nzk3XHU1QzdGIFx1MDBCNyBcdTU3Q0VcdTVFMDJcdTZCNjVcdTg4NENcdThCQjBcdTVGNTVcdTgwMDVcdUZGMENcdTVERjJcdTUzRDFcdTVFMDMgMTggXHU2NzYxXHU2QzM0XHU1Q0I4XHU4REVGXHU3RUJGXHUzMDAyPC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtYWN0aW9uc1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYWN0aW9uc1wiIGdhcD17MTB9PlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJyb3V0ZS1kZXRhaWwtaXRpbmVyYXJ5LWFjdGlvblwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9faXRpbmVyYXJ5LWFjdGlvblwiIHRvPVwiaXRpbmVyYXJ5XCI+XHU2N0U1XHU3NzBCXHU1QjhDXHU2NTc0XHU2NUU1XHU3QTBCPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBpZD1cInJvdXRlLWRldGFpbC1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19jcmVhdGUtYWN0aW9uXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU3NTI4XHU4RkQ5XHU2NzYxXHU4REVGXHU3RUJGXHU1MjFCXHU1RUZBXHU4ODRDXHU3QTBCPC9CdXR0b24+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjguMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjguMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIENvbmZpcm1EaWFsb2csXG4gIExvYWRpbmdPdmVybGF5LFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFN0ZXBzLFxuICBUZXh0LFxuICBUb2FzdCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gVHJpcENvbmZpcm1TY3JlZW4oKSB7XG4gIGNvbnN0IFtjb25maXJtT3Blbiwgc2V0Q29uZmlybU9wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2F2ZWQsIHNldFNhdmVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IHN1Ym1pdFRyaXAgPSAoKSA9PiB7XG4gICAgc2V0Q29uZmlybU9wZW4oZmFsc2UpXG4gICAgc2V0TG9hZGluZyh0cnVlKVxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICBzZXRTYXZlZCh0cnVlKVxuICAgIH0sIDcwMClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwLWNvbmZpcm1fX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJ0cmlwLWNvbmZpcm0taGVhZGVyXCIgdGl0bGVJZD1cInRyaXAtY29uZmlybS10aXRsZVwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9faGVhZGVyXCIgdGl0bGU9XCJcdTc4NkVcdThCQTRcdTg4NENcdTdBMEJcIiBzdWJ0aXRsZT1cIlx1NjhDMFx1NjdFNVx1NEZFMVx1NjA2Rlx1NTQwRVx1NEZERFx1NUI1OFx1NTIzMFx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlwiIC8+XG4gICAgICAgIDxTdGVwcyBpZD1cInRyaXAtY29uZmlybS1zdGVwc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3RlcHNcIiBjdXJyZW50PXsyfSBpdGVtcz17W3sgaWQ6ICdiYXNpYycsIGxhYmVsOiAnXHU1N0ZBXHU2NzJDXHU0RkUxXHU2MDZGJyB9LCB7IGlkOiAnYnVkZ2V0JywgbGFiZWw6ICdcdTk4ODRcdTdCOTcnIH0sIHsgaWQ6ICdjb25maXJtJywgbGFiZWw6ICdcdTc4NkVcdThCQTQnIH1dfSAvPlxuICAgICAgICA8Q2FyZCBpZD1cInRyaXAtY29uZmlybS1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5XCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1bW1hcnktYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1bW1hcnktaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdHJpcC1uYW1lXCI+XHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1PC9zdHJvbmc+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N0YXR1c1wiPlx1NUY4NVx1NEZERFx1NUI1ODwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGF0ZVwiPjIwMjYgXHU1RTc0IDggXHU2NzA4IDE1IFx1NjVFNSBcdTAwQjcgXHU1NDY4XHU1MTZEPC9UZXh0PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19yb3V0ZVwiPlx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOSBcdTAwQjcgOC42IGttIFx1MDBCNyBcdTdFQTYgNiBcdTVDMEZcdTY1RjY8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY29uZmlybS1kZXRhaWxzXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxzXCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU5NkM2XHU1NDA4XHU1NzMwXHU3MEI5XCIgc3VidGl0bGU9XCJcdThGRDBcdTZDQjNcdThERUZcdTU3MzBcdTk0QzFcdTdBRDkgMyBcdTUzRjdcdTUzRTNcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTg4NENcdTdBMEJcdTgyODJcdTU5NEZcIiB2YWx1ZT1cIlx1OEY3Qlx1Njc3RVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1NTQwQ1x1ODg0Q1x1NEVCQVx1NjU3MFwiIHZhbHVlPVwiMyBcdTRFQkFcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTUxRkFcdTUzRDFcdTYzRDBcdTkxOTJcIiB2YWx1ZT1cIlx1NURGMlx1NUYwMFx1NTQyRlwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q2FyZCBpZD1cInRyaXAtY29uZmlybS1idWRnZXRcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldFwiIHRvPVwiYnVkZ2V0XCI+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1ib2R5XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1jb3B5XCIgZ2FwPXs1fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtbGFiZWxcIj5cdTk4ODRcdThCQTFcdTYwM0JcdThEMzlcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LW5vdGVcIj5cdTY3RTVcdTc3MEJcdTY2MEVcdTdFQzZcdTRFMEVcdTU0MENcdTg4NENcdTRFQkE8L1RleHQ+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdG90YWxcIj40MjggXHU1MTQzPC9zcGFuPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tYWN0aW9uc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYWN0aW9uc1wiIGdhcD17MTB9PlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJ0cmlwLWNvbmZpcm0tc3VibWl0XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9eygpID0+IHNldENvbmZpcm1PcGVuKHRydWUpfT5cdTc4NkVcdThCQTRcdTVFNzZcdTRGRERcdTVCNTg8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdHJpcHMtYWN0aW9uXCIgdG89XCJ0cmlwc1wiPlx1NjdFNVx1NzcwQlx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQjwvQnV0dG9uPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENvbmZpcm1EaWFsb2dcbiAgICAgICAgICBpZD1cInRyaXAtY29uZmlybS1kaWFsb2dcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGlhbG9nXCJcbiAgICAgICAgICBvcGVuPXtjb25maXJtT3Blbn1cbiAgICAgICAgICB0aXRsZT1cIlx1NEZERFx1NUI1OFx1OEZEOVx1NEVGRFx1ODg0Q1x1N0EwQlx1RkYxRlwiXG4gICAgICAgICAgbWVzc2FnZT1cIlx1NEZERFx1NUI1OFx1NTQwRVx1NEYxQVx1NTQwQ1x1NkI2NVx1N0VEOVx1NURGMlx1NTJBMFx1NTE2NVx1NzY4NFx1NTQwQ1x1ODg0Q1x1NEVCQVx1RkYwQ1x1NUU3Nlx1NTcyOFx1NTFGQVx1NTNEMVx1NTI0RFx1NTNEMVx1OTAwMVx1NjNEMFx1OTE5Mlx1MzAwMlwiXG4gICAgICAgICAgY29uZmlybUxhYmVsPVwiXHU3ODZFXHU4QkE0XHU0RkREXHU1QjU4XCJcbiAgICAgICAgICBvbkNvbmZpcm09e3N1Ym1pdFRyaXB9XG4gICAgICAgICAgb25DYW5jZWw9eygpID0+IHNldENvbmZpcm1PcGVuKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICAgPExvYWRpbmdPdmVybGF5IGlkPVwidHJpcC1jb25maXJtLWxvYWRpbmdcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2xvYWRpbmdcIiBvcGVuPXtsb2FkaW5nfSBsYWJlbD1cIlx1NkI2M1x1NTcyOFx1NzUxRlx1NjIxMFx1ODg0Q1x1N0EwQlwiIC8+XG4gICAgICAgIDxUb2FzdCBpZD1cInRyaXAtY29uZmlybS10b2FzdFwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdG9hc3RcIiBvcGVuPXtzYXZlZH0+XHU4ODRDXHU3QTBCXHU1REYyXHU0RkREXHU1QjU4XHVGRjBDXHU1M0VGXHU1NzI4XHUyMDFDXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCXHUyMDFEXHU2N0U1XHU3NzBCXHUzMDAyPC9Ub2FzdD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS44LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS44LjBcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDaGVja2JveCxcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFJhZGlvLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgU3RlcHMsXG4gIFRleHRBcmVhLFxuICBUZXh0SW5wdXQsXG4gIFRvZ2dsZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gVHJpcENyZWF0ZVNjcmVlbigpIHtcbiAgY29uc3QgW3JlbWluZGVyLCBzZXRSZW1pbmRlcl0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcC1jcmVhdGUtcGFnZVwiIGdhcD17MTd9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwLWNyZWF0ZV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cInRyaXAtY3JlYXRlLWhlYWRlclwiIHRpdGxlSWQ9XCJ0cmlwLWNyZWF0ZS10aXRsZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19oZWFkZXJcIiB0aXRsZT1cIlx1NTIxQlx1NUVGQVx1ODg0Q1x1N0EwQlwiIHN1YnRpdGxlPVwiXHU1MTQ4XHU3ODZFXHU1QjlBXHU2NUY2XHU5NUY0XHU0RTBFXHU1NDBDXHU4ODRDXHU2NUI5XHU1RjBGXCIgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fY2FuY2VsXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cdTUzRDZcdTZEODg8L0J1dHRvbj59IC8+XG4gICAgICAgIDxTdGVwcyBpZD1cInRyaXAtY3JlYXRlLXN0ZXBzXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0ZXBzXCIgY3VycmVudD17MH0gaXRlbXM9e1t7IGlkOiAnYmFzaWMnLCBsYWJlbDogJ1x1NTdGQVx1NjcyQ1x1NEZFMVx1NjA2RicgfSwgeyBpZDogJ2J1ZGdldCcsIGxhYmVsOiAnXHU5ODg0XHU3Qjk3JyB9LCB7IGlkOiAnY29uZmlybScsIGxhYmVsOiAnXHU3ODZFXHU4QkE0JyB9XX0gLz5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbmFtZS1maWVsZFwiIGxhYmVsPVwiXHU4ODRDXHU3QTBCXHU1NDBEXHU3OUYwXCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLW5hbWVcIj5cbiAgICAgICAgICA8VGV4dElucHV0IGlkPVwidHJpcC1jcmVhdGUtbmFtZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19uYW1lLWlucHV0XCIgZGVmYXVsdFZhbHVlPVwiXHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1XCIgLz5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2RhdGUtZmllbGRcIiBsYWJlbD1cIlx1NTFGQVx1NTNEMVx1NjVFNVx1NjcxRlwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1kYXRlXCIgaGludD1cIlx1NUVGQVx1OEJBRVx1OTAwOVx1NjJFOVx1NTkyOVx1NkMxNFx1N0EzM1x1NUI5QVx1NzY4NFx1NjVFNVx1NjcxRlwiPlxuICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJ0cmlwLWNyZWF0ZS1kYXRlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2RhdGUtaW5wdXRcIiBkZWZhdWx0VmFsdWU9XCIyMDI2LTA4LTE1XCIgLz5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LWZpZWxkXCIgbGFiZWw9XCJcdTk2QzZcdTU0MDhcdTU3MzBcdTcwQjlcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtc3RhcnRcIj5cbiAgICAgICAgICA8U2VsZWN0IGlkPVwidHJpcC1jcmVhdGUtc3RhcnRcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtc2VsZWN0XCIgZGVmYXVsdFZhbHVlPVwibWV0cm9cIj5cbiAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LW9wdGlvblwiIHZhbHVlPVwibWV0cm9cIj5cdThGRDBcdTZDQjNcdThERUZcdTU3MzBcdTk0QzFcdTdBRDkgMyBcdTUzRjdcdTUzRTM8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LW9wdGlvblwiIHZhbHVlPVwid2FyZWhvdXNlXCI+XHU2NUU3XHU0RUQzXHU1RTkzXHU2QjYzXHU5NUU4PC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cImN1c3RvbVwiPlx1ODFFQVx1NUI5QVx1NEU0OVx1NTczMFx1NzBCOTwvb3B0aW9uPlxuICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXBhY2VcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZVwiIGdhcD17OX0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2dyb3VwLWxhYmVsXCI+XHU4ODRDXHU3QTBCXHU4MjgyXHU1OTRGPC9zcGFuPlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2Utb3B0aW9uc1wiIGdhcD17MTJ9PlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdThGN0JcdTY3N0VcIiBkZWZhdWx0Q2hlY2tlZCAvPlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdTY4MDdcdTUxQzZcIiAvPlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdTdEMjdcdTUxRDFcIiAvPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbm90ZS1maWVsZFwiIGxhYmVsPVwiXHU1NDBDXHU4ODRDXHU1OTA3XHU2Q0U4XCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLW5vdGVcIj5cbiAgICAgICAgICA8VGV4dEFyZWEgaWQ9XCJ0cmlwLWNyZWF0ZS1ub3RlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25vdGUtaW5wdXRcIiBwbGFjZWhvbGRlcj1cIlx1NEY4Qlx1NTk4Mlx1RkYxQVx1NjcwOVx1NTEzRlx1N0FFNVx1NTQwQ1x1ODg0Q1x1RkYwQ1x1NUUwQ1x1NjcxQlx1NTFDRlx1NUMxMVx1Njk3Q1x1NjhBRlx1OERFRlx1NkJCNVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jcmVhdGUtcHJlZmVyZW5jZXNcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcHJlZmVyZW5jZXNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8Q2hlY2tib3ggY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3ByZWZlcmVuY2VcIiBsYWJlbD1cIlx1NEYxOFx1NTE0OFx1NUI4OVx1NjM5Mlx1NjVFMFx1OTY5Q1x1Nzg4RFx1OERFRlx1N0VCRlwiIC8+XG4gICAgICAgICAgPENoZWNrYm94IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wcmVmZXJlbmNlXCIgbGFiZWw9XCJcdTkwN0ZcdTVGMDBcdTk3MDBcdTg5ODFcdTk4ODRcdTdFQTZcdTc2ODRcdTU3MzBcdTcwQjlcIiBkZWZhdWx0Q2hlY2tlZCAvPlxuICAgICAgICAgIDxUb2dnbGUgaWQ9XCJ0cmlwLWNyZWF0ZS1yZW1pbmRlclwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19yZW1pbmRlclwiIGNoZWNrZWQ9e3JlbWluZGVyfSBvbkNoYW5nZT17c2V0UmVtaW5kZXJ9IGxhYmVsPVwiXHU1MUZBXHU1M0QxXHU1MjREXHU0RTAwXHU1OTI5XHU2M0QwXHU5MTkyXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJ0cmlwLWNyZWF0ZS1uZXh0XCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25leHRcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwiYnVkZ2V0XCI+XHU0RTBCXHU0RTAwXHU2QjY1XHVGRjFBXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBPC9CdXR0b24+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuOC4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuOC4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRW1wdHlTdGF0ZSxcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUYWJzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IFRSSVBTID0gW1xuICB7IGlkOiAndHJpcC1jYW5hbCcsIHRpdGxlOiAnXHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1JywgZGF0ZTogJzggXHU2NzA4IDE1IFx1NjVFNScsIHN0YXR1czogJ1x1NUY4NVx1NTFGQVx1NTNEMScsIGRldGFpbDogJzMgXHU0RUJBIFx1MDBCNyA1IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbiAgeyBpZDogJ3RyaXAtbGFrZScsIHRpdGxlOiAnXHU3M0FGXHU2RTU2XHU5QTkxXHU4ODRDXHU1MzRBXHU2NUU1JywgZGF0ZTogJzggXHU2NzA4IDIyIFx1NjVFNScsIHN0YXR1czogJ1x1ODlDNFx1NTIxMlx1NEUyRCcsIGRldGFpbDogJzIgXHU0RUJBIFx1MDBCNyA0IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbiAgeyBpZDogJ3RyaXAtbXVzZXVtJywgdGl0bGU6ICdcdTk2RThcdTU5MjlcdTUzNUFcdTcyNjlcdTk5ODZcdTdFQkYnLCBkYXRlOiAnOSBcdTY3MDggNSBcdTY1RTUnLCBzdGF0dXM6ICdcdTVGODVcdTc4NkVcdThCQTQnLCBkZXRhaWw6ICc0IFx1NEVCQSBcdTAwQjcgMyBcdTRFMkFcdTU3M0FcdTk5ODYnIH0sXG4gIHsgaWQ6ICd0cmlwLWhpbGxzJywgdGl0bGU6ICdcdTU3Q0VcdTUzMTdcdThGN0JcdTVGOTJcdTZCNjUnLCBkYXRlOiAnOSBcdTY3MDggMTIgXHU2NUU1Jywgc3RhdHVzOiAnXHU4OUM0XHU1MjEyXHU0RTJEJywgZGV0YWlsOiAnMyBcdTRFQkEgXHUwMEI3IDYgXHU0RTJBXHU1NzMwXHU3MEI5JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gVHJpcHNTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgndXBjb21pbmcnKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcHMtcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwc19fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwidHJpcHMtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwidHJpcHMtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRyaXBzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OEJBMVx1NTIxMlx1MzAwMVx1NTQwQ1x1ODg0Q1x1NEZFMVx1NjA2Rlx1NEUwRVx1NjVDNVx1ODg0Q1x1OEJCMFx1NUY1NVwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBpZD1cInRyaXBzLWNyZWF0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJ0cmlwc19fY3JlYXRlLWFjdGlvblwiIHRvPVwidHJpcC1jcmVhdGVcIj5cdTY1QjBcdTVFRkE8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxUYWJzIGlkPVwidHJpcHMtdGFic1wiIGNsYXNzTmFtZT1cInRyaXBzX190YWJzXCIgYWN0aXZlSWQ9e3RhYn0gb25DaGFuZ2U9e3NldFRhYn0gaXRlbXM9e1t7IGlkOiAndXBjb21pbmcnLCBsYWJlbDogJ1x1NUY4NVx1NTFGQVx1NTNEMScgfSwgeyBpZDogJ2NvbXBsZXRlZCcsIGxhYmVsOiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9LCB7IGlkOiAnc2F2ZWQnLCBsYWJlbDogJ1x1NjUzNlx1ODVDRicgfV19IC8+XG4gICAgICAgIHt0YWIgPT09ICd1cGNvbWluZycgPyAoXG4gICAgICAgICAgPENvbHVtbiBpZD1cInRyaXBzLXVwY29taW5nXCIgY2xhc3NOYW1lPVwidHJpcHNfX2xpc3RcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgIHtUUklQUy5tYXAoKHRyaXApID0+IChcbiAgICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT17dHJpcC5pZH0ga2V5PXt0cmlwLmlkfSB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OX0+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+e3RyaXAudGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtc3RhdHVzXCI+e3RyaXAuc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj57dHJpcC5kYXRlfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcHNfX3N0YXR1cy1yb3dcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGV0YWlsXCI+e3RyaXAuZGV0YWlsfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtcmVtaW5kZXJcIj5cdTYzRDBcdTkxOTJcdTVERjJcdTVGMDBcdTU0MkY8L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiB0YWIgPT09ICdjb21wbGV0ZWQnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwcy1jb21wbGV0ZWRcIiBjbGFzc05hbWU9XCJ0cmlwc19fY29tcGxldGVkXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PVwidHJpcC1vbGQtc3RyZWV0XCIgdG89XCJyb3V0ZS1kZXRhaWxcIj48Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezh9PjxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Plx1ODAwMVx1ODg1N1x1NjE2Mlx1NkUzODwvSGVhZGluZz48VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+NyBcdTY3MDggMTggXHU2NUU1IFx1MDBCNyBcdTVERjJcdTVCOENcdTYyMTA8L1RleHQ+PC9Db2x1bW4+PC9DYXJkPlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT1cInRyaXAtbmlnaHQtd2Fsa1wiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTU5MUNcdTgyNzJcdTVFRkFcdTdCNTFcdTY1NjNcdTZCNjU8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjYgXHU2NzA4IDI3IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9XCJ0cmlwLXJpdmVyc2lkZVwiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTUzNTdcdTVDQjhcdTY1RTdcdTc4MDFcdTU5MzQ8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjUgXHU2NzA4IDE2IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8RW1wdHlTdGF0ZSBpZD1cInRyaXBzLXNhdmVkLWVtcHR5XCIgY2xhc3NOYW1lPVwidHJpcHNfX2VtcHR5XCIgdGl0bGU9XCJcdThGRDhcdTZDQTFcdTY3MDlcdTY1MzZcdTg1Q0ZcdThERUZcdTdFQkZcIiBkZXNjcmlwdGlvbj1cIlx1NTcyOFx1OERFRlx1N0VCRlx1OEJFNlx1NjBDNVx1NEUyRFx1NjUzNlx1ODVDRlx1RkYwQ1x1N0EwRFx1NTQwRVx1NTE4RFx1NTFCM1x1NUI5QVx1NEVDMFx1NEU0OFx1NjVGNlx1NTAxOVx1NTFGQVx1NTNEMVx1MzAwMlwiIGFjdGlvbj17PEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwc19fZW1wdHktYWN0aW9uXCIgdG89XCJkaXNjb3ZlclwiPlx1NTNCQlx1NTNEMVx1NzNCMFx1OERFRlx1N0VCRjwvQnV0dG9uPn0gLz5cbiAgICAgICAgKX1cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiaW1wb3J0IHsgQnVkZ2V0U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2J1ZGdldC5qc3gnXG5pbXBvcnQgeyBEaXNjb3ZlclNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9kaXNjb3Zlci5qc3gnXG5pbXBvcnQgeyBFeHBsb3JlTWFwU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCdcbmltcG9ydCB7IEl0aW5lcmFyeVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9pdGluZXJhcnkuanN4J1xuaW1wb3J0IHsgTG9naW5TY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvbG9naW4uanN4J1xuaW1wb3J0IHsgUHJvZmlsZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9wcm9maWxlLmpzeCdcbmltcG9ydCB7IFJvdXRlRGV0YWlsU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3JvdXRlLWRldGFpbC5qc3gnXG5pbXBvcnQgeyBUcmlwQ29uZmlybVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwLWNvbmZpcm0uanN4J1xuaW1wb3J0IHsgVHJpcENyZWF0ZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwLWNyZWF0ZS5qc3gnXG5pbXBvcnQgeyBUcmlwc1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwcy5qc3gnXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXHU2NUM1XHU4ODRDXHU1MkE5XHU2MjRCJyxcbiAgdmlld3BvcnRzOiB7XG4gICAgbW9iaWxlOiB7IHdpZHRoOiAzNzUsIGhlaWdodDogODEyIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ21vYmlsZScsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ2xvZ2luJyxcbiAgICAgIHRpdGxlOiAnXHU3NjdCXHU1RjU1JyxcbiAgICAgIGNvbXBvbmVudDogTG9naW5TY3JlZW4sXG4gICAgICBlbnRyeTogdHJ1ZSxcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdkaXNjb3ZlcicsXG4gICAgICB0aXRsZTogJ1x1NTNEMVx1NzNCMCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OEQ4NVx1OEZDN1x1NEUwMFx1NUM0Rlx1NzY4NFx1OERFRlx1N0VCRlx1NjNBOFx1ODM1MFx1OTk5Nlx1OTg3NScsXG4gICAgICBjb21wb25lbnQ6IERpc2NvdmVyU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAnZXhwbG9yZS1tYXAnLCAncm91dGUtZGV0YWlsJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2V4cGxvcmUtbWFwJyxcbiAgICAgIHRpdGxlOiAnXHU3NkVFXHU3Njg0XHU1NzMwXHU1NzMwXHU1NkZFJyxcbiAgICAgIGNvbXBvbmVudDogRXhwbG9yZU1hcFNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdyb3V0ZS1kZXRhaWwnLFxuICAgICAgdGl0bGU6ICdcdThERUZcdTdFQkZcdThCRTZcdTYwQzUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTk1N0ZcdTUxODVcdTVCQjlcdThERUZcdTdFQkZcdTRFQ0JcdTdFQ0RcdTRFMEVcdTU3MzBcdTcwQjlcdTUyMTdcdTg4NjgnLFxuICAgICAgY29tcG9uZW50OiBSb3V0ZURldGFpbFNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ2V4cGxvcmUtbWFwJywgJ2l0aW5lcmFyeScsICd0cmlwLWNyZWF0ZScsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdpdGluZXJhcnknLFxuICAgICAgdGl0bGU6ICdcdTZCQ0ZcdTY1RTVcdTg4NENcdTdBMEInLFxuICAgICAgZGVzY3JpcHRpb246ICdcdThEODVcdThGQzdcdTRFMDBcdTVDNEZcdTc2ODRcdTdFQjVcdTU0MTFcdTZCNjVcdTlBQTRcdTRFMEVcdTY1RTVcdTdBMEJcdTUzNjFcdTcyNDcnLFxuICAgICAgY29tcG9uZW50OiBJdGluZXJhcnlTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHJpcC1jcmVhdGUnLFxuICAgICAgdGl0bGU6ICdcdTUyMUJcdTVFRkFcdTg4NENcdTdBMEInLFxuICAgICAgY29tcG9uZW50OiBUcmlwQ3JlYXRlU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ2J1ZGdldCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdidWRnZXQnLFxuICAgICAgdGl0bGU6ICdcdTk4ODRcdTdCOTdcdTRFMEVcdTU0MENcdTg4NENcdTRFQkEnLFxuICAgICAgY29tcG9uZW50OiBCdWRnZXRTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICd0cmlwLWNvbmZpcm0nLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHJpcC1jb25maXJtJyxcbiAgICAgIHRpdGxlOiAnXHU2M0QwXHU0RUE0XHU3ODZFXHU4QkE0JyxcbiAgICAgIGNvbXBvbmVudDogVHJpcENvbmZpcm1TY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdidWRnZXQnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbJ1x1Nzg2RVx1OEJBNFx1NUYzOVx1NUM0MicsICdcdTUyQTBcdThGN0RcdTcyQjZcdTYwMDEnLCAnXHU2MjEwXHU1MjlGXHU2M0QwXHU3OTNBJ10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXBzJyxcbiAgICAgIHRpdGxlOiAnXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCJyxcbiAgICAgIGNvbXBvbmVudDogVHJpcHNTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncHJvZmlsZScsXG4gICAgICB0aXRsZTogJ1x1NEUyQVx1NEVCQVx1OEJCRVx1N0Y2RScsXG4gICAgICBjb21wb25lbnQ6IFByb2ZpbGVTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gIF0sXG59XG4iLCAiaW1wb3J0IHsgQm9hcmQgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgUHJvdG90eXBlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHZhbGlkYXRlUHJvamVjdCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3ZDLE1BQU07QUFBQSxNQUNOLGFBQWFBLFNBQVE7QUFBQSxNQUNyQixTQUFTO0FBQUEsTUFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLENBQUM7QUFBQSxJQUNaLENBQUM7QUFFRCxVQUFNLFdBQVcsTUFBTSxZQUFZLENBQUMsT0FBTztBQUN6QyxVQUFJLENBQUNBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLE9BQU8sRUFBRSxHQUFHO0FBQ3ZELGNBQU0sSUFBSSxNQUFNLHNCQUFzQixFQUFFLGtCQUFrQjtBQUFBLE1BQzVEO0FBQ0EsZUFBUyxDQUFDLFlBQVk7QUFDcEIsWUFBSSxRQUFRLFNBQVMsVUFBVSxPQUFPLFFBQVEsaUJBQWlCO0FBQzdELGdCQUFNLFNBQVNBLFNBQVEsUUFBUSxLQUFLLENBQUMsU0FBUyxLQUFLLE9BQU8sUUFBUSxlQUFlO0FBQ2pGLGNBQUksQ0FBQyxPQUFPLE1BQU0sU0FBUyxFQUFFLEdBQUc7QUFDOUIsa0JBQU0sSUFBSSxNQUFNLFdBQVcsUUFBUSxlQUFlLDJCQUEyQixFQUFFLEdBQUc7QUFBQSxVQUNwRjtBQUFBLFFBQ0Y7QUFDQSxlQUFPO0FBQUEsVUFDTCxHQUFHO0FBQUEsVUFDSCxpQkFBaUI7QUFBQSxVQUNqQixTQUNFLFFBQVEsU0FBUyxVQUFVLE9BQU8sUUFBUSxrQkFDdEMsQ0FBQyxHQUFHLFFBQVEsU0FBUyxRQUFRLGVBQWUsSUFDNUMsUUFBUTtBQUFBLFFBQ2hCO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxHQUFHLENBQUNBLFFBQU8sQ0FBQztBQUVaLFVBQU0sY0FBYyxNQUFNLFlBQVksQ0FBQyxZQUFZO0FBQ2pELFlBQU0sUUFBUUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sT0FBTyxPQUFPO0FBQ3BFLFVBQUksQ0FBQyxNQUFPLE9BQU0sSUFBSSxNQUFNLHNCQUFzQixPQUFPLGtCQUFrQjtBQUMzRSxlQUFTLENBQUMsYUFBYTtBQUFBLFFBQ3JCLEdBQUc7QUFBQSxRQUNIO0FBQUEsUUFDQSxpQkFBaUI7QUFBQSxRQUNqQixTQUFTLENBQUM7QUFBQSxNQUNaLEVBQUU7QUFBQSxJQUNKLEdBQUcsQ0FBQ0EsUUFBTyxDQUFDO0FBRVosVUFBTSxTQUFTLE1BQU0sWUFBWSxNQUFNO0FBQ3JDLGVBQVMsQ0FBQyxZQUFZO0FBQ3BCLFlBQUksUUFBUSxRQUFRLFdBQVcsRUFBRyxRQUFPO0FBQ3pDLGVBQU87QUFBQSxVQUNMLEdBQUc7QUFBQSxVQUNILGlCQUFpQixRQUFRLFFBQVEsUUFBUSxRQUFRLFNBQVMsQ0FBQztBQUFBLFVBQzNELFNBQVMsUUFBUSxRQUFRLE1BQU0sR0FBRyxFQUFFO0FBQUEsUUFDdEM7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILEdBQUcsQ0FBQyxDQUFDO0FBRUwsVUFBTSxRQUFRLE1BQU0sWUFBWSxNQUFNO0FBQ3BDLGVBQVMsQ0FBQyxhQUFhO0FBQUEsUUFDckIsR0FBRztBQUFBLFFBQ0gsaUJBQWlCLFFBQVE7QUFBQSxRQUN6QixTQUFTLENBQUM7QUFBQSxNQUNaLEVBQUU7QUFBQSxJQUNKLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFFcEIsVUFBTSxVQUFVLE1BQU0sWUFBWSxDQUFDLFNBQVM7QUFDMUMsVUFBSSxTQUFTLFlBQVksU0FBUyxPQUFRLE9BQU0sSUFBSSxNQUFNLGlCQUFpQixJQUFJLEdBQUc7QUFDbEYsZUFBUyxDQUFDLGFBQWE7QUFBQSxRQUNyQixHQUFHO0FBQUEsUUFDSDtBQUFBLFFBQ0EsU0FBUyxDQUFDO0FBQUEsTUFDWixFQUFFO0FBQUEsSUFDSixHQUFHLENBQUMsQ0FBQztBQUdMLFVBQU0sWUFBWSxNQUFNLFlBQVksQ0FBQyxhQUFhO0FBQ2hELFVBQUksQ0FBQ0EsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sT0FBTyxRQUFRLEdBQUc7QUFDN0QsY0FBTSxJQUFJLE1BQU0sc0JBQXNCLFFBQVEsa0JBQWtCO0FBQUEsTUFDbEU7QUFDQSxlQUFTLENBQUMsYUFBYTtBQUFBLFFBQ3JCLEdBQUc7QUFBQSxRQUNILE1BQU07QUFBQSxRQUNOLGlCQUFpQjtBQUFBLFFBQ2pCLFNBQVMsQ0FBQztBQUFBLE1BQ1osRUFBRTtBQUFBLElBQ0osR0FBRyxDQUFDQSxRQUFPLENBQUM7QUFFWixVQUFNLGlCQUFpQixNQUFNLFlBQVksQ0FBQyxnQkFBZ0I7QUFDeEQsVUFBSSxDQUFDLE9BQU8sT0FBT0EsU0FBUSxXQUFXLFdBQVcsR0FBRztBQUNsRCxjQUFNLElBQUksTUFBTSxxQkFBcUIsV0FBVyxHQUFHO0FBQUEsTUFDckQ7QUFDQSxlQUFTLENBQUMsYUFBYSxFQUFFLEdBQUcsU0FBUyxZQUFZLEVBQUU7QUFBQSxJQUNyRCxHQUFHLENBQUNBLFFBQU8sQ0FBQztBQUVaLFVBQU0sUUFBUSxNQUFNLFFBQVEsT0FBTztBQUFBLE1BQ2pDLE1BQU0sTUFBTTtBQUFBLE1BQ1osYUFBYSxNQUFNO0FBQUEsTUFDbkIsVUFBVUEsU0FBUSxVQUFVLE1BQU0sV0FBVztBQUFBLE1BQzdDLFNBQVMsTUFBTTtBQUFBLE1BQ2YsaUJBQWlCLE1BQU07QUFBQSxNQUN2QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0EsV0FBVyxNQUFNLFFBQVEsU0FBUztBQUFBLElBQ3BDLElBQUksQ0FBQyxXQUFXLFFBQVEsVUFBVUEsVUFBUyxPQUFPLGFBQWEsU0FBUyxnQkFBZ0IsS0FBSyxDQUFDO0FBRTlGLFdBQU8sb0NBQUMsaUJBQWlCLFVBQWpCLEVBQTBCLFNBQWUsUUFBUztBQUFBLEVBQzVEO0FBRU8sV0FBUyxlQUFlO0FBQzdCLFVBQU0sVUFBVSxNQUFNLFdBQVcsZ0JBQWdCO0FBQ2pELFFBQUksQ0FBQyxRQUFTLE9BQU0sSUFBSSxNQUFNLG9EQUFvRDtBQUNsRixXQUFPO0FBQUEsRUFDVDs7O0FDeEhPLFdBQVMsV0FBVyxPQUFPO0FBQ2hDLFdBQU8sS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDekM7QUFNTyxXQUFTLGFBQWEsZ0JBQWdCLGlCQUFpQixjQUFjLGVBQWU7QUFDekYsUUFBSSxrQkFBa0IsS0FBSyxtQkFBbUIsS0FBSyxnQkFBZ0IsS0FBSyxpQkFBaUIsR0FBRztBQUMxRixhQUFPO0FBQUEsSUFDVDtBQUNBLFdBQU8sV0FBVyxLQUFLLElBQUksaUJBQWlCLGNBQWMsa0JBQWtCLGFBQWEsQ0FBQztBQUFBLEVBQzVGO0FBTU8sV0FBUyxzQkFBc0IsUUFBUTtBQUM1QyxRQUFJLENBQUMsVUFBVSxPQUFPLE9BQU8sWUFBWSxXQUFZLFFBQU87QUFDNUQsV0FBTyxDQUFDLE9BQU8sUUFBUSxtQkFBbUI7QUFBQSxFQUM1QztBQUVPLFdBQVMsc0JBQXNCO0FBQ3BDLFdBQU8sRUFBRSxPQUFPLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRTtBQUFBLEVBQ3RDO0FBRUEsTUFBTSxnQkFBZ0I7QUFNZixXQUFTLGtCQUFrQjtBQUFBLElBQ2hDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxVQUFVO0FBQUEsRUFDWixHQUFHO0FBQ0QsUUFDRSxrQkFBa0IsS0FDZixtQkFBbUIsS0FDbkIsZUFBZSxLQUNmLGdCQUFnQixLQUNoQixDQUFDLE9BQU8sU0FBUyxZQUFZLEdBQ2hDO0FBQ0EsYUFBTztBQUFBLElBQ1Q7QUFFQSxVQUFNLGFBQWEsaUJBQWlCLFVBQVU7QUFDOUMsVUFBTSxjQUFjLGtCQUFrQixVQUFVO0FBQ2hELFFBQUksY0FBYyxLQUFLLGVBQWUsRUFBRyxRQUFPO0FBRWhELFVBQU0sV0FBVyxLQUFLLElBQUksYUFBYSxhQUFhLGNBQWMsWUFBWTtBQUM5RSxVQUFNLFFBQVEsV0FBVyxLQUFLLElBQUksY0FBYyxRQUFRLENBQUM7QUFDekQsV0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBLE1BQU0saUJBQWlCLEtBQUssYUFBYSxjQUFjLEtBQUs7QUFBQSxNQUM1RCxNQUFNLGtCQUFrQixLQUFLLFlBQVksZUFBZSxLQUFLO0FBQUEsSUFDL0Q7QUFBQSxFQUNGO0FBTU8sV0FBUyxvQkFBb0IsTUFBTSxVQUFVLFNBQVMsU0FBUztBQUNwRSxRQUFJLENBQUMsU0FBVSxRQUFPO0FBQ3RCLFdBQU87QUFBQSxNQUNMLEdBQUc7QUFBQSxNQUNILE1BQU0sU0FBUyxPQUFPLFVBQVUsU0FBUztBQUFBLE1BQ3pDLE1BQU0sU0FBUyxPQUFPLFVBQVUsU0FBUztBQUFBLElBQzNDO0FBQUEsRUFDRjtBQUVPLFdBQVMscUJBQXFCLE9BQU87QUFDMUMsV0FBTyxVQUFVLFVBQVUsVUFBVSxZQUFZLFVBQVU7QUFBQSxFQUM3RDtBQUdPLFdBQVMsdUJBQXVCLFNBQVMsUUFBUTtBQUN0RCxRQUFJLE9BQU8sV0FBVyxRQUFRLGFBQWEsSUFBSSxRQUFRLGdCQUFnQjtBQUN2RSxXQUFPLE1BQU07QUFDWCxVQUFJLEtBQUssYUFBYSxHQUFHO0FBQ3ZCLGNBQU0sUUFBUSxPQUFPLGlCQUFpQixJQUFJO0FBQzFDLGNBQU0sT0FBTyxxQkFBcUIsTUFBTSxTQUFTLEtBQUssS0FBSyxlQUFlLEtBQUssZUFBZTtBQUM5RixjQUFNLE9BQU8scUJBQXFCLE1BQU0sU0FBUyxLQUFLLEtBQUssY0FBYyxLQUFLLGNBQWM7QUFDNUYsWUFBSSxRQUFRLEtBQU0sUUFBTztBQUFBLE1BQzNCO0FBQ0EsVUFBSSxTQUFTLE9BQVE7QUFDckIsYUFBTyxLQUFLO0FBQUEsSUFDZDtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsTUFBTSx5QkFBeUI7QUFFL0IsV0FBUyxpQkFBaUIsUUFBUTtBQUNoQyxRQUFJLENBQUMsVUFBVSxPQUFPLE9BQU8sWUFBWSxXQUFZLFFBQU87QUFDNUQsV0FBTyxDQUFDLENBQUMsT0FBTyxRQUFRLG1EQUFtRDtBQUFBLEVBQzdFO0FBT08sV0FBUyx1QkFBdUIsT0FBTyxRQUFRLEVBQUUsU0FBUyxPQUFPLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRztBQUN4RixRQUFJLE9BQVEsUUFBTztBQUNuQixRQUFJLE1BQU0sVUFBVSxRQUFRLE1BQU0sV0FBVyxFQUFHLFFBQU87QUFDdkQsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLFNBQVMsTUFBTSxNQUFNLEVBQUcsUUFBTztBQUN0RCxRQUFJLGlCQUFpQixNQUFNLE1BQU0sRUFBRyxRQUFPO0FBQzNDLFVBQU0sYUFBYSx1QkFBdUIsTUFBTSxRQUFRLE1BQU07QUFDOUQsUUFBSSxDQUFDLFdBQVksUUFBTztBQUN4QixXQUFPO0FBQUEsTUFDTCxJQUFJO0FBQUEsTUFDSixXQUFXLE1BQU07QUFBQSxNQUNqQixRQUFRLE1BQU07QUFBQSxNQUNkLFFBQVEsTUFBTTtBQUFBLE1BQ2QsWUFBWSxXQUFXO0FBQUEsTUFDdkIsV0FBVyxXQUFXO0FBQUEsTUFDdEIsT0FBTyxRQUFRLElBQUksUUFBUTtBQUFBLE1BQzNCLE9BQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVPLFdBQVMsc0JBQXNCLE9BQU8sT0FBTztBQUNsRCxRQUFJLENBQUMsU0FBUyxNQUFNLGNBQWMsTUFBTSxVQUFXLFFBQU87QUFDMUQsVUFBTSxNQUFNLE1BQU0sVUFBVSxNQUFNLFVBQVUsTUFBTTtBQUNsRCxVQUFNLE1BQU0sTUFBTSxVQUFVLE1BQU0sVUFBVSxNQUFNO0FBQ2xELFFBQUksQ0FBQyxNQUFNLFVBQVUsS0FBSyxJQUFJLEVBQUUsSUFBSSwwQkFBMEIsS0FBSyxJQUFJLEVBQUUsSUFBSSx5QkFBeUI7QUFDcEcsWUFBTSxRQUFRO0FBQUEsSUFDaEI7QUFDQSxVQUFNLEdBQUcsYUFBYSxNQUFNLGFBQWE7QUFDekMsVUFBTSxHQUFHLFlBQVksTUFBTSxZQUFZO0FBQ3ZDLFdBQU87QUFBQSxFQUNUO0FBR08sV0FBUyxxQkFBcUIsT0FBTyxRQUFRO0FBQ2xELFFBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxTQUFTLENBQUMsT0FBUTtBQUN2QyxVQUFNLGVBQWUsQ0FBQyxVQUFVO0FBQzlCLFlBQU0sZUFBZTtBQUNyQixZQUFNLGdCQUFnQjtBQUN0QixhQUFPLG9CQUFvQixTQUFTLGNBQWMsSUFBSTtBQUFBLElBQ3hEO0FBQ0EsV0FBTyxpQkFBaUIsU0FBUyxjQUFjLElBQUk7QUFBQSxFQUNyRDtBQTBCTyxXQUFTLGtCQUFrQixPQUFPLEVBQUUsU0FBUyxNQUFNLElBQUksQ0FBQyxHQUFHO0FBQ2hFLFFBQUksT0FBUSxRQUFPO0FBQ25CLFdBQU8sQ0FBQyxFQUFFLE1BQU0sV0FBVyxNQUFNO0FBQUEsRUFDbkM7OztBQ3JMTyxNQUFNLGdCQUFOLGNBQTRCLE1BQU0sVUFBVTtBQUFBLElBQ2pELFlBQVksT0FBTztBQUNqQixZQUFNLEtBQUs7QUFDWCxXQUFLLFFBQVEsRUFBRSxPQUFPLEtBQUs7QUFBQSxJQUM3QjtBQUFBLElBRUEsT0FBTyx5QkFBeUIsT0FBTztBQUNyQyxhQUFPLEVBQUUsTUFBTTtBQUFBLElBQ2pCO0FBQUEsSUFFQSxrQkFBa0IsT0FBTyxNQUFNO0FBQzdCLGNBQVEsTUFBTSxjQUFjLEtBQUssTUFBTSxTQUFTLFNBQVMsS0FBSyxPQUFPLElBQUk7QUFBQSxJQUMzRTtBQUFBLElBRUEsbUJBQW1CLGVBQWU7QUFDaEMsVUFBSSxLQUFLLE1BQU0sU0FBUyxjQUFjLGFBQWEsS0FBSyxNQUFNLFVBQVU7QUFDdEUsYUFBSyxTQUFTLEVBQUUsT0FBTyxLQUFLLENBQUM7QUFBQSxNQUMvQjtBQUFBLElBQ0Y7QUFBQSxJQUVBLFNBQVM7QUFDUCxVQUFJLENBQUMsS0FBSyxNQUFNLE1BQU8sUUFBTyxLQUFLLE1BQU07QUFDekMsWUFBTSxFQUFFLFVBQVUsUUFBUSxNQUFNLElBQUksS0FBSztBQUN6QyxhQUNFLG9DQUFDLFNBQUksV0FBVSxpQkFBZ0IsTUFBSyxXQUNsQyxvQ0FBQyxnQkFBUSxVQUFVLFdBQVcsV0FBVyxRQUFRLEtBQUssYUFBYyxHQUNuRSxTQUFTLG9DQUFDLGNBQUssWUFBUyxNQUFPLElBQVUsTUFDMUMsb0NBQUMsY0FBSyxhQUFVLEtBQUssTUFBTSxNQUFNLE9BQVEsR0FDekMsb0NBQUMsYUFBSyxLQUFLLE1BQU0sTUFBTSxLQUFNLENBQy9CO0FBQUEsSUFFSjtBQUFBLEVBQ0Y7OztBQ2hDQSxNQUFNLHdCQUF3QixNQUFNLGNBQWMsSUFBSTtBQUUvQyxXQUFTLHVCQUF1QixFQUFFLFVBQVUsU0FBUyxHQUFHO0FBQzdELFFBQUksQ0FBQyxTQUFVLE9BQU0sSUFBSSxNQUFNLDBDQUEwQztBQUN6RSxXQUNFLG9DQUFDLHNCQUFzQixVQUF0QixFQUErQixPQUFPLFlBQ3BDLFFBQ0g7QUFBQSxFQUVKO0FBRU8sV0FBUyxjQUFjO0FBQzVCLFVBQU0sV0FBVyxNQUFNLFdBQVcscUJBQXFCO0FBQ3ZELFFBQUksQ0FBQyxVQUFVO0FBQ2IsWUFBTSxJQUFJLE1BQU0sbURBQW1EO0FBQUEsSUFDckU7QUFDQSxXQUFPO0FBQUEsRUFDVDs7O0FDYk8sV0FBUyxpQkFBaUIsU0FBUyxRQUFRO0FBQ2hELFFBQUksQ0FBQyxXQUFXLE9BQU8sUUFBUSxZQUFZLFdBQVksUUFBTztBQUM5RCxVQUFNLEtBQUssUUFBUSxRQUFRLGdCQUFnQjtBQUMzQyxRQUFJLENBQUMsR0FBSSxRQUFPO0FBQ2hCLFFBQUksVUFBVSxPQUFPLE9BQU8sYUFBYSxjQUFjLENBQUMsT0FBTyxTQUFTLEVBQUUsRUFBRyxRQUFPO0FBQ3BGLFVBQU0sS0FBSyxHQUFHLGFBQWEsY0FBYztBQUN6QyxXQUFPLE1BQU07QUFBQSxFQUNmOzs7QUNYQSxNQUFNLGNBQWM7QUFBQSxJQUNsQixTQUFTO0FBQUEsSUFDVCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxRQUFRO0FBQUEsRUFDVjtBQUVBLFdBQVMsb0JBQW9CLE9BQU87QUFQcEM7QUFRRSxTQUFJLGdCQUFXLFFBQVgsbUJBQWdCLE9BQVEsUUFBTyxXQUFXLElBQUksT0FBTyxPQUFPLEtBQUssQ0FBQztBQUN0RSxXQUFPLE9BQU8sS0FBSyxFQUFFLFFBQVEsbUJBQW1CLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtBQUFBLEVBQ3ZFO0FBRUEsV0FBUyxxQkFBcUIsT0FBTztBQUNuQyxXQUFPLE9BQU8sS0FBSyxFQUFFLFFBQVEsT0FBTyxNQUFNLEVBQUUsUUFBUSxNQUFNLEtBQUs7QUFBQSxFQUNqRTtBQUVBLFdBQVMsVUFBVSxTQUFTO0FBQzFCLFFBQUksRUFBQyxtQ0FBUyxXQUFXLFFBQU8sQ0FBQztBQUNqQyxXQUFPLE1BQU0sS0FBSyxRQUFRLFNBQVMsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNyRDtBQUVPLFdBQVMsb0JBQW9CLE1BQU07QUFDeEMsV0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssV0FBVyxLQUFLLEtBQUssQ0FBQyxLQUFLLFdBQVcsS0FBSztBQUFBLEVBQ3BFO0FBRUEsV0FBUyxjQUFjLFVBQVU7QUFDL0IsV0FBTyxvQkFBb0IscUJBQXFCLFFBQVEsQ0FBQztBQUFBLEVBQzNEO0FBRUEsV0FBUyxpQkFBaUIsWUFBWSxVQUFVO0FBQzlDLFFBQUk7QUFDRixhQUFPLFdBQVcsaUJBQWlCLFFBQVEsRUFBRSxXQUFXO0FBQUEsSUFDMUQsU0FBUTtBQUNOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVBLFdBQVMsZUFBZSxTQUFTO0FBckNqQztBQXNDRSxVQUFNLE9BQU8sUUFBUSxXQUFXLE9BQU8sWUFBWTtBQUNuRCxVQUFNLFVBQVUsVUFBVSxPQUFPO0FBQ2pDLFVBQU0sV0FBVyxRQUFRLE9BQU8sbUJBQW1CO0FBQ25ELFVBQU0sU0FBUyxTQUFTLFNBQVMsSUFBSSxXQUFXLFFBQVEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFdBQVcsS0FBSyxDQUFDO0FBQ2hHLFVBQU0sWUFBWSxPQUFPLE1BQU0sR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsSUFBSSxvQkFBb0IsSUFBSSxDQUFDLEVBQUUsRUFBRSxLQUFLLEVBQUU7QUFDM0YsVUFBTSxPQUFNLGFBQVEsaUJBQVIsaUNBQXVCO0FBQ25DLFVBQU0sVUFBVSxNQUFNLGlCQUFpQixxQkFBcUIsR0FBRyxDQUFDLE9BQU87QUFDdkUsV0FBTyxHQUFHLEdBQUcsR0FBRyxTQUFTLEdBQUcsT0FBTztBQUFBLEVBQ3JDO0FBRU8sV0FBUyxvQkFBb0IsU0FBUyxhQUFhLFVBQVU7QUFoRHBFO0FBaURFLFFBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLFNBQVUsUUFBTztBQUNsRCxRQUFJLFFBQVEsR0FBSSxRQUFPLElBQUksb0JBQW9CLFFBQVEsRUFBRSxDQUFDO0FBRTFELFVBQU0sUUFBUSxjQUFjLFFBQVE7QUFDcEMsVUFBTSxPQUFNLGFBQVEsaUJBQVIsaUNBQXVCO0FBQ25DLFVBQU0sVUFBVSxNQUFNLGlCQUFpQixxQkFBcUIsR0FBRyxDQUFDLE9BQU87QUFDdkUsVUFBTSxXQUFXLFVBQVUsT0FBTyxFQUFFLE9BQU8sbUJBQW1CO0FBRTlELGVBQVcsUUFBUSxVQUFVO0FBQzNCLFlBQU0sUUFBUSxJQUFJLG9CQUFvQixJQUFJLENBQUMsR0FBRyxPQUFPO0FBQ3JELFVBQUksaUJBQWlCLGFBQWEsS0FBSyxFQUFHLFFBQU8sR0FBRyxLQUFLLElBQUksS0FBSztBQUFBLElBQ3BFO0FBRUEsUUFBSSxTQUFTLFNBQVMsR0FBRztBQUN2QixZQUFNLFFBQVEsU0FBUyxJQUFJLENBQUMsU0FBUyxJQUFJLG9CQUFvQixJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJO0FBQ2pGLFVBQUksaUJBQWlCLGFBQWEsS0FBSyxFQUFHLFFBQU8sR0FBRyxLQUFLLElBQUksS0FBSztBQUFBLElBQ3BFO0FBRUEsVUFBTSxXQUFXLENBQUM7QUFDbEIsUUFBSSxVQUFVO0FBQ2QsV0FBTyxXQUFXLFlBQVksYUFBYTtBQUN6QyxVQUFJLFFBQVEsSUFBSTtBQUNkLGlCQUFTLFFBQVEsSUFBSSxvQkFBb0IsUUFBUSxFQUFFLENBQUMsRUFBRTtBQUN0RDtBQUFBLE1BQ0Y7QUFDQSxVQUFJLFVBQVUsZUFBZSxPQUFPO0FBQ3BDLFlBQU0sU0FBUyxRQUFRO0FBQ3ZCLFVBQUksVUFBVSxXQUFXLGFBQWE7QUFDcEMsY0FBTSxRQUFRLE1BQU0sS0FBSyxPQUFPLFlBQVksQ0FBQyxDQUFDLEVBQUU7QUFBQSxVQUM5QyxDQUFDLFNBQVMsS0FBSyxZQUFZLFFBQVEsV0FBVyxlQUFlLElBQUksTUFBTTtBQUFBLFFBQ3pFO0FBQ0EsWUFBSSxNQUFNLFNBQVMsRUFBRyxZQUFXLGdCQUFnQixNQUFNLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUM3RTtBQUNBLGVBQVMsUUFBUSxPQUFPO0FBQ3hCLFlBQU0sUUFBUSxTQUFTLEtBQUssS0FBSztBQUNqQyxVQUFJLGlCQUFpQixhQUFhLEtBQUssRUFBRyxRQUFPLEdBQUcsS0FBSyxJQUFJLEtBQUs7QUFDbEUsZ0JBQVU7QUFBQSxJQUNaO0FBRUEsV0FBTyxHQUFHLEtBQUssSUFBSSxTQUFTLEtBQUssS0FBSyxLQUFLLGVBQWUsT0FBTyxDQUFDO0FBQUEsRUFDcEU7QUFFQSxXQUFTLGFBQWEsU0FBUztBQUM3QixRQUFJLFFBQVEsR0FBSSxRQUFPLElBQUksUUFBUSxFQUFFO0FBQ3JDLFVBQU0sVUFBVSxVQUFVLE9BQU87QUFDakMsVUFBTSxXQUFXLFFBQVEsS0FBSyxtQkFBbUIsS0FBSyxRQUFRLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxXQUFXLEtBQUssQ0FBQztBQUNwRyxXQUFPLFdBQVcsSUFBSSxRQUFRLE1BQU0sUUFBUSxXQUFXLFFBQVEsWUFBWTtBQUFBLEVBQzdFO0FBRUEsV0FBUyxTQUFTLFNBQVM7QUFDekIsVUFBTSxRQUFRLFdBQVcsV0FBVyxPQUFPLFFBQVEsVUFBVSxXQUN6RCxRQUFRLFFBQ1IsUUFBUSxlQUFlO0FBQzNCLFVBQU0sYUFBYSxNQUFNLFFBQVEsUUFBUSxHQUFHLEVBQUUsS0FBSztBQUNuRCxXQUFPLFdBQVcsU0FBUyxNQUFNLEdBQUcsV0FBVyxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVE7QUFBQSxFQUN0RTtBQUVPLFdBQVMsaUJBQWlCLFFBQVEsYUFBYTtBQUNwRCxRQUFJLFdBQVUsaUNBQVEsY0FBYSxJQUFJLFNBQVMsaUNBQVE7QUFDeEQsV0FBTyxXQUFXLFlBQVksYUFBYTtBQUN6QyxVQUFJLFFBQVEsTUFBTSxVQUFVLE9BQU8sRUFBRSxTQUFTLEVBQUcsUUFBTztBQUN4RCxnQkFBVSxRQUFRO0FBQUEsSUFDcEI7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQUVPLFdBQVMsc0JBQXNCLFNBQVMsYUFBYSxRQUFRO0FBQ2xFLFFBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLE9BQVEsUUFBTztBQUNoRCxVQUFNLFlBQVksQ0FBQztBQUNuQixRQUFJLFVBQVU7QUFDZCxXQUFPLFdBQVcsWUFBWSxhQUFhO0FBQ3pDLGdCQUFVLFFBQVE7QUFBQSxRQUNoQixTQUFTO0FBQUEsUUFDVCxPQUFPLGFBQWEsT0FBTztBQUFBLFFBQzNCLFVBQVUsb0JBQW9CLFNBQVMsYUFBYSxPQUFPLEVBQUU7QUFBQSxNQUMvRCxDQUFDO0FBQ0QsZ0JBQVUsUUFBUTtBQUFBLElBQ3BCO0FBRUEsV0FBTztBQUFBLE1BQ0w7QUFBQSxNQUNBO0FBQUEsTUFDQSxVQUFVLE9BQU87QUFBQSxNQUNqQixhQUFhLE9BQU87QUFBQSxNQUNwQixZQUFZLGVBQWUsT0FBTyxFQUFFO0FBQUEsTUFDcEMsVUFBVSxvQkFBb0IsU0FBUyxhQUFhLE9BQU8sRUFBRTtBQUFBLE1BQzdELFVBQVUsUUFBUSxXQUFXLElBQUksWUFBWTtBQUFBLE1BQzdDLFlBQVksVUFBVSxPQUFPO0FBQUEsTUFDN0IsYUFBYSxTQUFTLE9BQU87QUFBQSxNQUM3QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUEsV0FBUyxZQUFZLE1BQU07QUFDekIsUUFBSSxLQUFLLFNBQVMsT0FBUSxRQUFPLDJCQUFPLEtBQUssV0FBVztBQUN4RCxRQUFJLEtBQUssU0FBUyxRQUFTLFFBQU8saUNBQVEsS0FBSyxXQUFXO0FBQzFELFFBQUksS0FBSyxTQUFTLFNBQVUsUUFBTyxpQ0FBUSxLQUFLLGVBQWUsa0dBQWtCO0FBQ2pGLFdBQU8sS0FBSztBQUFBLEVBQ2Q7QUFFTyxXQUFTLGNBQWMsTUFBTTtBQUNsQyxRQUFJLE1BQU0sUUFBUSw2QkFBTSxPQUFPLEtBQUssS0FBSyxRQUFRLFNBQVMsRUFBRyxRQUFPLEtBQUs7QUFDekUsUUFBSSxFQUFDLDZCQUFNLFVBQVUsUUFBTyxDQUFDO0FBQzdCLFdBQU8sQ0FBQztBQUFBLE1BQ04sVUFBVSxLQUFLO0FBQUEsTUFDZixhQUFhLEtBQUs7QUFBQSxNQUNsQixZQUFZLEtBQUs7QUFBQSxNQUNqQixVQUFVLEtBQUs7QUFBQSxNQUNmLGFBQWEsS0FBSztBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBRU8sV0FBUyxrQkFBa0JDLFVBQVMsT0FBTztBQUNoRCxVQUFNLGVBQWNBLFlBQUEsZ0JBQUFBLFNBQVMsU0FBUTtBQUVyQyxVQUFNLFFBQVE7QUFBQSxNQUNaLG1EQUFXLFdBQVc7QUFBQSxNQUN0QjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFFQSxRQUFJLEVBQUMsK0JBQU8sU0FBUTtBQUNsQixZQUFNLEtBQUssSUFBSSx3REFBVztBQUMxQixhQUFPLE1BQU0sS0FBSyxJQUFJO0FBQUEsSUFDeEI7QUFFQSxVQUFNLFFBQVEsQ0FBQyxNQUFNLGNBQWM7QUFDakMsWUFBTSxVQUFVLGNBQWMsSUFBSTtBQUNsQyxZQUFNLEtBQUssSUFBSSxtQkFBUyxZQUFZLENBQUMsU0FBSSxZQUFZLEtBQUssSUFBSSxLQUFLLFlBQVksT0FBTyxFQUFFO0FBQ3hGLGNBQVEsUUFBUSxDQUFDLFFBQVEsZ0JBQWdCO0FBQ3ZDLGNBQU0sV0FBVyxPQUFPLFlBQVksS0FBSztBQUN6QyxjQUFNO0FBQUEsVUFDSjtBQUFBLFVBQ0EsZ0JBQU0sY0FBYyxDQUFDLFNBQUksT0FBTyxlQUFlLEtBQUssZUFBZSxZQUFZLGdDQUFPO0FBQUEsVUFDdEYsd0JBQVMsWUFBWSxjQUFJO0FBQUEsVUFDekIsaUNBQVEsT0FBTyxjQUFjLEtBQUssZUFBZSxXQUFXLGVBQWUsUUFBUSxTQUFTLHVDQUFTO0FBQUEsVUFDckc7QUFBQSxVQUNBLEtBQUssT0FBTyxRQUFRO0FBQUEsUUFDdEI7QUFDQSxZQUFJLE9BQU8sWUFBYSxPQUFNLEtBQUssSUFBSSxrQ0FBUyxPQUFPLFdBQVc7QUFBQSxNQUNwRSxDQUFDO0FBQ0QsWUFBTSxLQUFLLElBQUksa0NBQVMsWUFBWSxJQUFJLENBQUM7QUFBQSxJQUMzQyxDQUFDO0FBRUQsVUFBTTtBQUFBLE1BQ0o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUNBLFdBQU8sTUFBTSxLQUFLLElBQUk7QUFBQSxFQUN4QjtBQUVPLE1BQU0scUJBQXFCOzs7QUM5TWxDLE1BQU0sYUFBYTtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBR08sV0FBUyx5QkFBeUIsSUFBSTtBQUMzQyxRQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsRUFBRyxRQUFPO0FBQ3JDLFVBQU0sUUFBUSxPQUFPLGlCQUFpQixFQUFFO0FBQ3hDLFVBQU0sT0FBTyxxQkFBcUIsTUFBTSxTQUFTLEtBQUssR0FBRyxlQUFlLEdBQUcsZUFBZTtBQUMxRixVQUFNLE9BQU8scUJBQXFCLE1BQU0sU0FBUyxLQUFLLEdBQUcsY0FBYyxHQUFHLGNBQWM7QUFDeEYsV0FBTyxRQUFRO0FBQUEsRUFDakI7QUFFQSxXQUFTLFVBQVUsUUFBUSxJQUFJO0FBQzdCLFFBQUksUUFBUTtBQUNaLFFBQUksT0FBTztBQUNYLFdBQU8sUUFBUSxTQUFTLFFBQVE7QUFDOUIsZUFBUztBQUNULGFBQU8sS0FBSztBQUFBLElBQ2Q7QUFDQSxXQUFPO0FBQUEsRUFDVDtBQU1PLFdBQVMsb0JBQW9CLFFBQVE7QUFDMUMsUUFBSSxDQUFDLE9BQVEsUUFBTyxDQUFDO0FBQ3JCLFVBQU0sY0FBYyxDQUFDO0FBQ3JCLFVBQU0sUUFBUSxDQUFDLFNBQVM7QUFDdEIsWUFBTSxXQUFXLEtBQUssV0FBVyxNQUFNLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQztBQUM5RCxpQkFBVyxTQUFTLFNBQVUsT0FBTSxLQUFLO0FBQ3pDLFVBQUksU0FBUyxVQUFVLHlCQUF5QixJQUFJLEVBQUcsYUFBWSxLQUFLLElBQUk7QUFBQSxJQUM5RTtBQUNBLFVBQU0sTUFBTTtBQUVaLFVBQU0sTUFBTSxJQUFJLElBQUksV0FBVztBQUMvQixlQUFXLE1BQU0sYUFBYTtBQUc1QixVQUFJLE9BQU8sT0FBUTtBQUNuQixVQUFJLE9BQU8sR0FBRztBQUNkLGFBQU8sTUFBTTtBQUNYLFlBQUksSUFBSSxJQUFJO0FBQ1osWUFBSSxTQUFTLE9BQVE7QUFDckIsZUFBTyxLQUFLO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFFQSxXQUFPLENBQUMsR0FBRyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxVQUFVLFFBQVEsQ0FBQyxJQUFJLFVBQVUsUUFBUSxDQUFDLENBQUM7QUFBQSxFQUM1RTtBQUVPLFdBQVMsa0JBQWtCLElBQUk7QUFDcEMsVUFBTSxNQUFNLENBQUM7QUFDYixlQUFXLE9BQU8sV0FBWSxLQUFJLEdBQUcsSUFBSSxHQUFHLE1BQU0sR0FBRyxLQUFLO0FBQzFELFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxpQkFBaUIsSUFBSSxVQUFVO0FBQzdDLGVBQVcsT0FBTyxZQUFZO0FBQzVCLFNBQUcsTUFBTSxHQUFHLElBQUksU0FBUyxHQUFHLEtBQUs7QUFBQSxJQUNuQztBQUFBLEVBQ0Y7QUFPQSxXQUFTLGlCQUFpQixJQUFJLE9BQU8sTUFBTTtBQUN6QyxVQUFNLFlBQVksU0FBUyxNQUFNLGVBQWU7QUFDaEQsVUFBTSxZQUFZLFNBQVMsTUFBTSxTQUFTO0FBQzFDLFVBQU0sV0FBVyxTQUFTLE1BQU0sVUFBVTtBQUMxQyxVQUFNLGFBQWEsU0FBUyxNQUFNLGdCQUFnQjtBQUNsRCxVQUFNLFlBQVksU0FBUyxNQUFNLGVBQWU7QUFDaEQsVUFBTSxjQUFjLE1BQU0sU0FBUyxLQUFLO0FBRXhDLFFBQUksTUFBTSxpQkFBaUIsR0FBSSxRQUFPO0FBQ3RDLFFBQUksTUFBTSxnQkFBZ0IsTUFBTSxpQkFBaUIsR0FBRyxjQUFjO0FBQ2hFLGFBQU8sZUFBZSxHQUFHLFNBQVMsS0FBSztBQUFBLElBQ3pDO0FBRUEsUUFBSSxPQUFPLEdBQUcsMEJBQTBCLGNBQ25DLE9BQU8sTUFBTSwwQkFBMEIsWUFBWTtBQUN0RCxZQUFNLGFBQWEsR0FBRyxzQkFBc0I7QUFDNUMsWUFBTSxZQUFZLE1BQU0sc0JBQXNCO0FBQzlDLFlBQU0sZUFBZSxXQUFXLFFBQVE7QUFDeEMsWUFBTSxRQUFRLEdBQUcsVUFBVSxJQUFJLEtBQUssZUFBZSxJQUMvQyxlQUFlLEdBQUcsVUFBVSxJQUM1QjtBQUNKLFlBQU0sU0FBUyxVQUFVLFNBQVMsSUFBSSxXQUFXLFNBQVMsS0FBSyxTQUMxRCxHQUFHLFNBQVMsS0FBSztBQUN0QixVQUFJLE9BQU8sU0FBUyxLQUFLLEVBQUcsUUFBTztBQUFBLElBQ3JDO0FBRUEsV0FBTztBQUFBLEVBQ1Q7QUFNTyxXQUFTLG9CQUFvQixJQUFJO0FBQ3RDLFFBQUksUUFBUSxLQUFLLElBQUksR0FBRyxlQUFlLEdBQUcsR0FBRyxlQUFlLENBQUM7QUFDN0QsUUFBSSxTQUFTLEtBQUssSUFBSSxHQUFHLGdCQUFnQixHQUFHLEdBQUcsZ0JBQWdCLENBQUM7QUFDaEUsVUFBTSxXQUFXLEdBQUcsV0FBVyxNQUFNLEtBQUssR0FBRyxRQUFRLElBQUksQ0FBQztBQUMxRCxlQUFXLFNBQVMsVUFBVTtBQUM1QixjQUFRLEtBQUssSUFBSSxPQUFPLGlCQUFpQixJQUFJLE9BQU8sR0FBRyxLQUFLLE1BQU0sZUFBZSxFQUFFO0FBQ25GLGVBQVMsS0FBSyxJQUFJLFFBQVEsaUJBQWlCLElBQUksT0FBTyxHQUFHLEtBQUssTUFBTSxnQkFBZ0IsRUFBRTtBQUFBLElBQ3hGO0FBQ0EsV0FBTyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ3pCO0FBRU8sV0FBUyxpQkFBaUIsSUFBSTtBQUNuQyxPQUFHLE1BQU0sV0FBVztBQUNwQixPQUFHLE1BQU0sWUFBWTtBQUNyQixPQUFHLE1BQU0sV0FBVztBQUNwQixPQUFHLE1BQU0sWUFBWTtBQUNyQixPQUFHLE1BQU0sWUFBWTtBQUNyQixVQUFNLEVBQUUsT0FBTyxPQUFPLElBQUksb0JBQW9CLEVBQUU7QUFDaEQsT0FBRyxNQUFNLFFBQVEsR0FBRyxLQUFLO0FBQ3pCLE9BQUcsTUFBTSxTQUFTLEdBQUcsTUFBTTtBQUMzQixPQUFHLE1BQU0sV0FBVyxHQUFHLEtBQUs7QUFDNUIsT0FBRyxNQUFNLFlBQVksR0FBRyxNQUFNO0FBQUEsRUFDaEM7QUFHTyxXQUFTLG9CQUFvQixRQUFRO0FBQzFDLFVBQU0sUUFBUSxvQkFBb0IsTUFBTTtBQUN4QyxVQUFNLFlBQVksTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksT0FBTyxrQkFBa0IsRUFBRSxFQUFFLEVBQUU7QUFDMUUsZUFBVyxFQUFFLEdBQUcsS0FBSyxVQUFXLGtCQUFpQixFQUFFO0FBRW5ELHFCQUFpQixNQUFNO0FBQ3ZCLFdBQU87QUFBQSxFQUNUO0FBRU8sV0FBUyxzQkFBc0IsV0FBVztBQUMvQyxRQUFJLENBQUMsTUFBTSxRQUFRLFNBQVMsRUFBRztBQUMvQixlQUFXLEVBQUUsSUFBSSxNQUFNLEtBQUssVUFBVyxrQkFBaUIsSUFBSSxLQUFLO0FBQUEsRUFDbkU7QUFFTyxXQUFTLGtCQUFrQixRQUFRO0FBQ3hDLFdBQU8sb0JBQW9CLE1BQU07QUFBQSxFQUNuQztBQU1PLFdBQVMscUJBQXFCLGFBQWEsUUFBUTtBQUN4RCxRQUFJLHVCQUF1QixLQUFLO0FBQzlCLFVBQUksWUFBWSxPQUFPLEVBQUcsUUFBTyxDQUFDLEdBQUcsV0FBVztBQUFBLElBQ2xELFdBQVcsTUFBTSxRQUFRLFdBQVcsS0FBSyxZQUFZLFNBQVMsR0FBRztBQUMvRCxhQUFPLENBQUMsR0FBRyxXQUFXO0FBQUEsSUFDeEI7QUFDQSxXQUFPLENBQUMsR0FBRyxNQUFNO0FBQUEsRUFDbkI7OztBQ3ZKTyxXQUFTLFlBQVk7QUFBQSxJQUMxQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFDVjtBQUFBLElBQ0EsV0FBVztBQUFBLElBQ1g7QUFBQSxJQUNBLGVBQWU7QUFBQSxJQUNmLFFBQVE7QUFBQSxJQUNSLGdCQUFnQjtBQUFBLElBQ2hCO0FBQUEsRUFDRixHQUFHO0FBQ0QsVUFBTSxFQUFFLFNBQVMsSUFBSSxhQUFhO0FBQ2xDLFVBQU0sYUFBYSxNQUFNLE9BQU8sSUFBSTtBQUNwQyxVQUFNLFVBQVUsTUFBTSxPQUFPLElBQUk7QUFDakMsVUFBTSx1QkFBdUIsTUFBTSxPQUFPLElBQUk7QUFDOUMsVUFBTSxvQkFBb0IsTUFBTSxPQUFPLElBQUk7QUFDM0MsVUFBTSx3QkFBd0IsTUFBTSxPQUFPLElBQUk7QUFDL0MsVUFBTSxDQUFDLGVBQWUsZ0JBQWdCLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDOUQsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU0sU0FBUyxJQUFJO0FBRXpELFVBQU0sZ0JBQWdCLE1BQU07QUFDMUIsWUFBTSxPQUFPLFdBQVc7QUFDeEIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFRLFFBQU87QUFFN0IsVUFBSSxrQkFBa0IsU0FBUztBQUM3Qiw4QkFBc0Isa0JBQWtCLE9BQU87QUFDL0MsMEJBQWtCLFVBQVU7QUFBQSxNQUM5QjtBQUVBLFVBQUksQ0FBQyxVQUFVO0FBQ2IsdUJBQWUsSUFBSTtBQUNuQixlQUFPO0FBQUEsTUFDVDtBQUVBLHdCQUFrQixVQUFVLG9CQUFvQixJQUFJO0FBQ3BELHFCQUFlLGtCQUFrQixJQUFJLENBQUM7QUFFdEMsYUFBTyxNQUFNO0FBQ1gsWUFBSSxrQkFBa0IsU0FBUztBQUM3QixnQ0FBc0Isa0JBQWtCLE9BQU87QUFDL0MsNEJBQWtCLFVBQVU7QUFBQSxRQUM5QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLEdBQUcsQ0FBQyxVQUFVLGlDQUFRLElBQUksU0FBUyxPQUFPLFNBQVMsTUFBTSxDQUFDO0FBRTFELFVBQU0sVUFBVSxNQUFNO0FBaEV4QjtBQWlFSSxVQUFJLENBQUMsaUJBQWlCLGNBQWM7QUFDbEMsb0NBQXNCLFlBQXRCLG1CQUErQixVQUFVLE9BQU87QUFDaEQsOEJBQXNCLFVBQVU7QUFBQSxNQUNsQztBQUNBLGFBQU8sTUFBTTtBQXJFakIsWUFBQUM7QUFzRU0sU0FBQUEsTUFBQSxzQkFBc0IsWUFBdEIsZ0JBQUFBLElBQStCLFVBQVUsT0FBTztBQUNoRCw4QkFBc0IsVUFBVTtBQUFBLE1BQ2xDO0FBQUEsSUFDRixHQUFHLENBQUMsY0FBYyxlQUFlLGlDQUFRLEVBQUUsQ0FBQztBQUU1QyxRQUFJLENBQUMsT0FBUSxRQUFPO0FBRXBCLFVBQU0sWUFBWSxPQUFPO0FBQ3pCLFVBQU0sYUFBYTtBQUFBLE1BQ2pCO0FBQUEsTUFDQSxTQUFTLFlBQVksVUFBVSxlQUFlO0FBQUEsTUFDOUMsV0FBVyxnQkFBZ0I7QUFBQSxNQUMzQixhQUFhLElBQUk7QUFBQSxJQUNuQixFQUFFLE9BQU8sT0FBTyxFQUFFLEtBQUssR0FBRztBQUUxQixVQUFNLGdCQUFnQixDQUFDLFVBQVU7QUFDL0IsMkJBQXFCLFVBQVUsTUFBTTtBQUNyQyxVQUFJLGNBQWU7QUFFbkIsVUFBSSxjQUFjO0FBQ2hCLGNBQU0sZUFBZTtBQUNyQjtBQUFBLE1BQ0Y7QUFFQSxVQUFJLFNBQVU7QUFDZCxZQUFNLFFBQVEsdUJBQXVCLE9BQU8sV0FBVyxTQUFTLEVBQUUsUUFBUSxjQUFjLE1BQU0sQ0FBQztBQUMvRixVQUFJLENBQUMsTUFBTztBQUNaLGNBQVEsVUFBVTtBQUFBLElBR3BCO0FBRUEsVUFBTSxnQkFBZ0IsQ0FBQyxVQUFVO0FBdEduQztBQXVHSSxVQUFJLGlCQUFpQixDQUFDLGNBQWM7QUFDbEMsY0FBTSxTQUFTLGlCQUFpQixNQUFNLFFBQVEsV0FBVyxPQUFPO0FBQ2hFLFlBQUksV0FBVyxzQkFBc0IsUUFBUztBQUM5QyxvQ0FBc0IsWUFBdEIsbUJBQStCLFVBQVUsT0FBTztBQUNoRCx5Q0FBUSxVQUFVLElBQUk7QUFDdEIsOEJBQXNCLFVBQVU7QUFDaEM7QUFBQSxNQUNGO0FBQ0EsWUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBSSxDQUFDLE1BQU87QUFDWixZQUFNLFdBQVcsTUFBTTtBQUN2Qiw0QkFBc0IsT0FBTyxLQUFLO0FBQ2xDLFVBQUksQ0FBQyxZQUFZLE1BQU0sT0FBTztBQUM1Qix5QkFBaUIsSUFBSTtBQUNyQixZQUFJO0FBQ0YsZ0JBQU0sY0FBYyxrQkFBa0IsTUFBTSxTQUFTO0FBQUEsUUFDdkQsU0FBUTtBQUFBLFFBRVI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUVBLFVBQU0sZUFBZSxDQUFDLFVBQVU7QUFDOUIsWUFBTSxRQUFRLFFBQVE7QUFDdEIsVUFBSSxDQUFDLFNBQVMsTUFBTSxjQUFjLE1BQU0sVUFBVztBQUNuRCwyQkFBcUIsT0FBTyxXQUFXLE9BQU87QUFDOUMsY0FBUSxVQUFVO0FBQ2xCLHVCQUFpQixLQUFLO0FBQUEsSUFDeEI7QUFFQSxVQUFNLGlCQUFpQixDQUFDLFVBQVU7QUFySXBDO0FBc0lJLFVBQUksY0FBZTtBQUNuQixZQUFNLE9BQU8sV0FBVztBQUN4QixZQUFNLGFBQWEscUJBQXFCO0FBQ3hDLDJCQUFxQixVQUFVO0FBRS9CLFlBQU0sVUFBVSxlQUFjLDZCQUFNLFNBQVMsZUFBYyxhQUFhLE1BQU07QUFDOUUsWUFBTSxLQUFLLGlCQUFpQixTQUFTLElBQUk7QUFDekMsVUFBSSxDQUFDLEdBQUk7QUFDVCxrQkFBTSxtQkFBTjtBQUNBLGtCQUFNLG9CQUFOO0FBQ0EsZUFBUyxFQUFFO0FBQUEsSUFDYjtBQUVBLFVBQU0sZ0JBQWdCLENBQUMsVUFBVTtBQUMvQixVQUFJLENBQUMsaUJBQWlCLGFBQWM7QUFDcEMsWUFBTSxTQUFTLGlCQUFpQixNQUFNLFFBQVEsV0FBVyxPQUFPO0FBQ2hFLFVBQUksQ0FBQyxPQUFRO0FBQ2IsWUFBTSxlQUFlO0FBQ3JCLFlBQU0sZ0JBQWdCO0FBQ3RCLHVEQUFpQixRQUFRLFFBQVEsV0FBVyxTQUFTO0FBQUEsUUFDbkQsVUFBVSxNQUFNLFlBQVksTUFBTSxXQUFXLE1BQU07QUFBQSxNQUNyRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLG1CQUFtQixNQUFNO0FBOUpqQztBQStKSSxrQ0FBc0IsWUFBdEIsbUJBQStCLFVBQVUsT0FBTztBQUNoRCw0QkFBc0IsVUFBVTtBQUFBLElBQ2xDO0FBRUEsVUFBTSxlQUFlLFlBQVksY0FDN0IsRUFBRSxPQUFPLFlBQVksT0FBTyxRQUFRLFlBQVksUUFBUSxVQUFVLFVBQVUsSUFDNUUsRUFBRSxPQUFPLFNBQVMsT0FBTyxRQUFRLFNBQVMsT0FBTztBQUVyRCxVQUFNLGFBQWEsWUFBWSxjQUFjLFlBQVksUUFBUSxTQUFTO0FBRTFFLFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFdBQVc7QUFBQSxRQUNYLGtCQUFnQixPQUFPO0FBQUEsUUFDdkIsaUJBQWUsV0FBVyxTQUFTO0FBQUEsUUFDbkMsT0FBTyxFQUFFLE9BQU8sV0FBVztBQUFBO0FBQUEsTUFFM0Isb0NBQUMsU0FBSSxXQUFVLDRCQUNiLG9DQUFDLFVBQUssV0FBVSw0QkFDZCxvQ0FBQyxVQUFLLFdBQVUseUJBQXVCLFFBQVEsQ0FBRSxHQUNqRCxvQ0FBQyxVQUFLLFdBQVUsbUNBQWlDLE9BQU8sS0FBTSxDQUNoRSxHQUNBLG9DQUFDLFVBQUssV0FBVSw4QkFDYixpQkFDQztBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsU0FBUyxDQUFDLFVBQVU7QUFDbEIsa0JBQU0sZ0JBQWdCO0FBQ3RCLDJCQUFlO0FBQUEsVUFDakI7QUFBQTtBQUFBLFFBRUMsV0FBVyxpQkFBTztBQUFBLE1BQ3JCLElBQ0UsTUFDSCxTQUFTLFlBQVksV0FDcEI7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLE1BQUs7QUFBQSxVQUNMLFdBQVU7QUFBQSxVQUNWLFNBQVMsQ0FBQyxVQUFVO0FBQ2xCLGtCQUFNLGdCQUFnQjtBQUN0QixxQkFBUztBQUFBLFVBQ1g7QUFBQTtBQUFBLFFBQ0Q7QUFBQSxNQUVELElBQ0UsSUFDTixDQUNGO0FBQUEsTUFDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsV0FBVyxvQkFBb0IsZ0JBQWdCLHVCQUF1QixFQUFFLEdBQUcsV0FBVyxpQkFBaUIsRUFBRSxHQUFHLGlCQUFpQixDQUFDLGVBQWUsa0JBQWtCLEVBQUU7QUFBQSxVQUNqSyxPQUFPO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxVQUNBLGFBQWE7QUFBQSxVQUNiLGlCQUFpQjtBQUFBLFVBQ2pCLGdCQUFnQjtBQUFBLFVBQ2hCLGdCQUFnQjtBQUFBLFVBQ2hCLFNBQVM7QUFBQTtBQUFBLFFBRVQ7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE9BQU07QUFBQSxZQUNOLFVBQVUsT0FBTztBQUFBLFlBQ2pCLFVBQVUsT0FBTztBQUFBLFlBQ2pCLFFBQVEsZUFBZSxPQUFPLEVBQUU7QUFBQTtBQUFBLFVBRWhDLG9DQUFDLDBCQUF1QixVQUFVLE9BQU8sTUFDdkMsb0NBQUMsZUFBVSxDQUNiO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFFSjs7O0FDdk9BLE1BQU0scUJBQXFCO0FBRTNCLFdBQVMscUJBQXFCLE9BQU87QUFDbkMsUUFBSSxNQUFNLGNBQWMsRUFBRyxRQUFPLE1BQU0sU0FBUztBQUNqRCxRQUFJLE1BQU0sY0FBYyxFQUFHLFFBQU8sTUFBTSxTQUFTO0FBQ2pELFdBQU8sTUFBTTtBQUFBLEVBQ2Y7QUFFTyxXQUFTLGVBQWUsT0FBTyxPQUFPLEVBQUUsZUFBZSxPQUFPLGNBQWMsSUFBSSxJQUFJLENBQUMsR0FBRztBQUM3RixRQUFJLENBQUMsYUFBYyxRQUFPLFdBQVcsU0FBUyxNQUFNLFNBQVMsSUFBSSxNQUFNLElBQUk7QUFDM0UsVUFBTSxRQUFRLHFCQUFxQixLQUFLO0FBQ3hDLFFBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsV0FBTyxXQUFXLFFBQVEsS0FBSyxJQUFJLENBQUMsUUFBUSxxQkFBcUIsV0FBVyxDQUFDO0FBQUEsRUFDL0U7QUFHTyxXQUFTLGNBQ2QsSUFDQSxVQUNBLFVBQ0EsWUFBWSxNQUFNLE9BQ2xCLGFBQWEsT0FBTyxDQUFDLElBQ3JCO0FBQ0EsUUFBSSxDQUFDLEdBQUksUUFBTyxNQUFNO0FBQUEsSUFBQztBQUN2QixVQUFNLFVBQVUsQ0FBQyxVQUFVO0FBQ3pCLFVBQUksQ0FBQyxrQkFBa0IsT0FBTyxFQUFFLFFBQVEsVUFBVSxFQUFFLENBQUMsRUFBRztBQUN4RCxZQUFNLGVBQWU7QUFDckIsZUFBUyxlQUFlLFNBQVMsR0FBRyxPQUFPLFdBQVcsQ0FBQyxDQUFDO0FBQUEsSUFDMUQ7QUFDQSxPQUFHLGlCQUFpQixTQUFTLFNBQVMsRUFBRSxTQUFTLE1BQU0sQ0FBQztBQUN4RCxXQUFPLE1BQU0sR0FBRyxvQkFBb0IsU0FBUyxPQUFPO0FBQUEsRUFDdEQ7QUFFTyxXQUFTLGFBQWEsWUFBWSxPQUFPLFVBQVUsU0FBUyxPQUFPLFVBQVUsQ0FBQyxHQUFHO0FBQ3RGLFVBQU0sV0FBVyxNQUFNLE9BQU8sS0FBSztBQUNuQyxVQUFNLFlBQVksTUFBTSxPQUFPLE1BQU07QUFDckMsVUFBTSxhQUFhLE1BQU0sT0FBTyxPQUFPO0FBQ3ZDLGFBQVMsVUFBVTtBQUNuQixjQUFVLFVBQVU7QUFDcEIsZUFBVyxVQUFVO0FBRXJCLFVBQU07QUFBQSxNQUNKLE1BQU07QUFBQSxRQUNKLFdBQVc7QUFBQSxRQUNYLE1BQU0sU0FBUztBQUFBLFFBQ2Y7QUFBQSxRQUNBLE1BQU0sVUFBVTtBQUFBLFFBQ2hCLE1BQU0sV0FBVztBQUFBLE1BQ25CO0FBQUEsTUFDQSxDQUFDLFlBQVksUUFBUTtBQUFBLElBQ3ZCO0FBQUEsRUFDRjs7O0FDckRPLFdBQVMsV0FBVyxTQUFTO0FBQ2xDLFdBQU8sTUFBTSxRQUFRLE9BQU8sS0FBSyxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sVUFBVSxJQUFJO0FBQUEsRUFDakY7OztBQ0ZPLE1BQU0sc0JBQXNCO0FBRW5DLFdBQVMsT0FBTyxPQUFPLFdBQVcsR0FBRztBQUNuQyxXQUFPLE9BQU8sU0FBUyxLQUFLLElBQUksUUFBUTtBQUFBLEVBQzFDO0FBRU8sV0FBUyx5QkFBeUIsVUFBVSxXQUFXLE1BQU0sU0FBUyxxQkFBcUI7QUFDaEcsVUFBTSxpQkFBaUIsS0FBSyxJQUFJLEdBQUcsT0FBTyx1Q0FBVyxLQUFLLENBQUM7QUFDM0QsVUFBTSxrQkFBa0IsS0FBSyxJQUFJLEdBQUcsT0FBTyx1Q0FBVyxNQUFNLENBQUM7QUFDN0QsVUFBTSxZQUFZLEtBQUssSUFBSSxHQUFHLE9BQU8sNkJBQU0sS0FBSyxDQUFDO0FBQ2pELFVBQU0sYUFBYSxLQUFLLElBQUksR0FBRyxPQUFPLDZCQUFNLE1BQU0sQ0FBQztBQUNuRCxVQUFNLE9BQU8sS0FBSyxJQUFJLFFBQVEsaUJBQWlCLFlBQVksTUFBTTtBQUNqRSxVQUFNLE9BQU8sS0FBSyxJQUFJLFFBQVEsa0JBQWtCLGFBQWEsTUFBTTtBQUNuRSxXQUFPO0FBQUEsTUFDTCxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxxQ0FBVSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSTtBQUFBLE1BQy9ELEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxPQUFPLHFDQUFVLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBRU8sV0FBUywyQkFBMkIsV0FBVyxNQUFNLFNBQVMscUJBQXFCO0FBQ3hGLFdBQU8seUJBQXlCO0FBQUEsTUFDOUIsSUFBSSxPQUFPLHVDQUFXLEtBQUssSUFBSSxPQUFPLDZCQUFNLEtBQUssS0FBSztBQUFBLE1BQ3RELEdBQUcsT0FBTyx1Q0FBVyxNQUFNLElBQUksT0FBTyw2QkFBTSxNQUFNLElBQUk7QUFBQSxJQUN4RCxHQUFHLFdBQVcsTUFBTSxNQUFNO0FBQUEsRUFDNUI7QUFFTyxXQUFTLDJCQUEyQixhQUFhLFNBQVMsV0FBVztBQUMxRSxRQUFJLFNBQVM7QUFDYixRQUFJLFFBQVE7QUFFWixVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLENBQUMsT0FBUTtBQUNiLFlBQU0sV0FBVyxZQUFZO0FBQzdCLFVBQUksRUFBQyxxQ0FBVSxjQUFhLEVBQUMscUNBQVUsT0FBTTtBQUMzQyxnQkFBUSxVQUFVLFFBQVEsT0FBTztBQUNqQztBQUFBLE1BQ0Y7QUFDQSxjQUFRO0FBQ1IsY0FBUSxRQUFRO0FBQUEsSUFDbEI7QUFFQSxZQUFRLFVBQVUsUUFBUSxPQUFPO0FBQ2pDLFdBQU8sTUFBTTtBQUNYLGVBQVM7QUFDVCxVQUFJLFNBQVMsS0FBTSxXQUFVLE9BQU8sS0FBSztBQUFBLElBQzNDO0FBQUEsRUFDRjs7O0FDbkNBLE1BQU0sdUJBQXVCO0FBRTdCLFdBQVMsWUFBWSxTQUFTO0FBQzVCLFdBQU8sRUFBRSxRQUFPLG1DQUFTLGdCQUFlLEdBQUcsU0FBUSxtQ0FBUyxpQkFBZ0IsRUFBRTtBQUFBLEVBQ2hGO0FBRUEsV0FBUyxZQUFZO0FBQUEsSUFDbkI7QUFBQSxJQUNBLFNBQUFDO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsR0FBRztBQUNELFVBQU0sV0FBVyxNQUFNLE9BQU8sSUFBSTtBQUNsQyxVQUFNLFVBQVUsTUFBTSxPQUFPLElBQUk7QUFDakMsVUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBRXBELFVBQU0sWUFBWSxNQUFNLFlBQVksQ0FBQyxjQUFjLGFBQWEsVUFBVTtBQUN4RSxZQUFNLFNBQVMsVUFBVTtBQUN6QixZQUFNLFFBQVEsU0FBUztBQUN2QixVQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sUUFBTztBQUM5QixZQUFNLFlBQVksRUFBRSxPQUFPLE9BQU8sYUFBYSxRQUFRLE9BQU8sYUFBYTtBQUMzRSxZQUFNLE9BQU8sWUFBWSxLQUFLO0FBQzlCLGFBQU8sYUFDSCwyQkFBMkIsV0FBVyxJQUFJLElBQzFDLHlCQUF5QixjQUFjLFdBQVcsSUFBSTtBQUFBLElBQzVELEdBQUcsQ0FBQyxTQUFTLENBQUM7QUFJZCxVQUFNLHVCQUF1QixZQUFZO0FBQ3pDLFVBQU0sZ0JBQWdCLE1BQU07QUFDMUIsVUFBSSxtQkFBbUIsTUFBTTtBQUFBLE1BQUM7QUFDOUIsWUFBTSxjQUFjO0FBQUEsUUFDbEIsT0FBTyxFQUFFLFdBQVcsVUFBVSxTQUFTLE1BQU0sU0FBUyxRQUFRO0FBQUEsUUFDOUQsQ0FBQyxFQUFFLFdBQVcsUUFBUSxNQUFNLE1BQU0sTUFBTTtBQUN0QyxnQkFBTSxTQUFTLE1BQU0saUJBQWlCLENBQUMsWUFBWSxVQUFVLFNBQVMsV0FBVyxJQUFJLENBQUM7QUFDdEYsaUJBQU87QUFFUCxjQUFJLE9BQU8sbUJBQW1CLFlBQVk7QUFDeEMsa0JBQU0sV0FBVyxJQUFJLGVBQWUsTUFBTTtBQUMxQyxxQkFBUyxRQUFRLE1BQU07QUFDdkIscUJBQVMsUUFBUSxLQUFLO0FBQ3RCLCtCQUFtQixNQUFNLFNBQVMsV0FBVztBQUM3QztBQUFBLFVBQ0Y7QUFDQSxpQkFBTyxpQkFBaUIsVUFBVSxNQUFNO0FBQ3hDLDZCQUFtQixNQUFNLE9BQU8sb0JBQW9CLFVBQVUsTUFBTTtBQUFBLFFBQ3RFO0FBQUEsUUFDQTtBQUFBLFVBQ0UsU0FBUyxDQUFDLGFBQWEsT0FBTyxzQkFBc0IsUUFBUTtBQUFBLFVBQzVELFFBQVEsQ0FBQyxVQUFVLE9BQU8scUJBQXFCLEtBQUs7QUFBQSxRQUN0RDtBQUFBLE1BQ0Y7QUFFQSxhQUFPLE1BQU07QUFDWCxvQkFBWTtBQUNaLHlCQUFpQjtBQUFBLE1BQ25CO0FBQUEsSUFDRixHQUFHLENBQUMsV0FBVyxXQUFXLHNCQUFzQixnQkFBZ0IsQ0FBQztBQUVqRSxVQUFNLGFBQWEsQ0FBQyxVQUFVO0FBNUVoQztBQTZFSSxZQUFNLE9BQU8sUUFBUTtBQUNyQixVQUFJLENBQUMsUUFBUSxLQUFLLGNBQWMsTUFBTSxVQUFXO0FBQ2pELGNBQVEsVUFBVTtBQUNsQixrQkFBWSxLQUFLO0FBQ2pCLFdBQUksaUJBQU0sZUFBYyxzQkFBcEIsNEJBQXdDLE1BQU0sWUFBWTtBQUM1RCxjQUFNLGNBQWMsc0JBQXNCLE1BQU0sU0FBUztBQUFBLE1BQzNEO0FBQ0EsWUFBTSxnQkFBZ0I7QUFBQSxJQUN4QjtBQUVBLFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLEtBQUs7QUFBQSxRQUNMLFdBQVcsV0FBVyxnQ0FBZ0M7QUFBQSxRQUN0RCxPQUFPLFdBQVcsRUFBRSxNQUFNLFNBQVMsR0FBRyxLQUFLLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBWSxTQUFTO0FBQUE7QUFBQSxNQUVqRjtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsY0FBVztBQUFBLFVBQ1gsT0FBTTtBQUFBLFVBQ04sZUFBZSxDQUFDLFVBQVU7QUFDeEIsZ0JBQUksTUFBTSxXQUFXLEVBQUc7QUFDeEIsa0JBQU0sU0FBUyxZQUFZLFVBQVUsTUFBTSxJQUFJO0FBQy9DLG9CQUFRLFVBQVU7QUFBQSxjQUNoQixXQUFXLE1BQU07QUFBQSxjQUNqQixRQUFRLE1BQU07QUFBQSxjQUNkLFFBQVEsTUFBTTtBQUFBLGNBQ2Q7QUFBQSxjQUNBLE9BQU87QUFBQSxZQUNUO0FBQ0Esa0JBQU0sY0FBYyxrQkFBa0IsTUFBTSxTQUFTO0FBQ3JELGtCQUFNLGVBQWU7QUFDckIsa0JBQU0sZ0JBQWdCO0FBQUEsVUFDeEI7QUFBQSxVQUNBLGVBQWUsQ0FBQyxVQUFVO0FBQ3hCLGtCQUFNLE9BQU8sUUFBUTtBQUNyQixnQkFBSSxDQUFDLFFBQVEsS0FBSyxjQUFjLE1BQU0sVUFBVztBQUNqRCxrQkFBTSxTQUFTLE1BQU0sVUFBVSxLQUFLO0FBQ3BDLGtCQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUs7QUFDcEMsZ0JBQUksQ0FBQyxLQUFLLFNBQVMsS0FBSyxNQUFNLFFBQVEsTUFBTSxJQUFJLHFCQUFzQjtBQUN0RSxpQkFBSyxRQUFRO0FBQ2Isd0JBQVksSUFBSTtBQUNoQiw2QkFBaUIsVUFBVSxFQUFFLEdBQUcsS0FBSyxPQUFPLElBQUksUUFBUSxHQUFHLEtBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDO0FBQ3BGLGtCQUFNLGVBQWU7QUFDckIsa0JBQU0sZ0JBQWdCO0FBQUEsVUFDeEI7QUFBQSxVQUNBLGFBQWE7QUFBQSxVQUNiLGlCQUFpQjtBQUFBO0FBQUEsUUFFakIsb0NBQUMsVUFBSyxXQUFVLHdCQUF1QixlQUFZLFVBQU8sb0NBQUMsU0FBRSxHQUFFLG9DQUFDLFNBQUUsR0FBRSxvQ0FBQyxTQUFFLENBQUU7QUFBQSxRQUN6RSxvQ0FBQyxjQUFLLGNBQUU7QUFBQSxNQUNWO0FBQUEsTUFDQSxvQ0FBQyxTQUFJLFdBQVUsMEJBQ1pBLFNBQVEsUUFBUSxJQUFJLENBQUMsUUFBUSxVQUM1QjtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsS0FBSyxPQUFPO0FBQUEsVUFDWixXQUFXLE9BQU8sT0FBTyxrQkFBa0Isa0NBQWtDO0FBQUEsVUFDN0UsU0FBUyxDQUFDLFVBQVU7QUFDbEIsa0JBQU0sZ0JBQWdCO0FBQ3RCLHFCQUFTLE9BQU8sRUFBRTtBQUFBLFVBQ3BCO0FBQUEsVUFDQSxlQUFlLENBQUMsVUFBVTtBQUN4QixrQkFBTSxnQkFBZ0I7QUFDdEIsc0JBQVUsT0FBTyxFQUFFO0FBQUEsVUFDckI7QUFBQSxVQUNBLGNBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxPQUFPLEtBQUs7QUFBQSxVQUN6QyxPQUFPLGdCQUFnQix5Q0FBVztBQUFBO0FBQUEsUUFFbEMsb0NBQUMsY0FBTSxRQUFRLENBQUU7QUFBQSxRQUNqQixvQ0FBQyxVQUFLLFdBQVUsMkJBQTBCLGVBQVksVUFDcEQsb0NBQUMsVUFBSyxXQUFVLG1DQUFpQyxPQUFPLEtBQU0sR0FDOUQsb0NBQUMsVUFBSyxXQUFVLGtDQUErQixnQkFBYSxPQUFPLElBQUcsTUFBSSxDQUM1RTtBQUFBLE1BQ0YsQ0FDRCxDQUNIO0FBQUEsTUFDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsY0FBVztBQUFBLFVBQ1gsT0FBTTtBQUFBLFVBQ04sU0FBUyxDQUFDLFVBQVU7QUFDbEIsa0JBQU0sZ0JBQWdCO0FBQ3RCLG9CQUFRO0FBQUEsVUFDVjtBQUFBO0FBQUEsUUFFQSxvQ0FBQyxTQUFJLFNBQVEsYUFBWSxlQUFZLFVBQU8sb0NBQUMsVUFBSyxHQUFFLHNCQUFxQixDQUFFO0FBQUEsTUFDN0U7QUFBQSxJQUNGO0FBQUEsRUFFSjtBQUVBLGlCQUFzQixzQkFBc0IsTUFBTSxVQUFVO0FBQzFELGFBQVMsSUFBSTtBQUNiLFFBQUk7QUFDRixZQUFNLEtBQUs7QUFBQSxJQUNiLFNBQVMsT0FBTztBQUNkLFlBQU0sVUFBVSxpQkFBaUIsUUFBUSxNQUFNLFVBQVUsT0FBTyxLQUFLO0FBQ3JFLGVBQVMsaUNBQVEsT0FBTyxFQUFFO0FBQUEsSUFDNUI7QUFBQSxFQUNGO0FBR0EsV0FBUyxTQUFTLE1BQU07QUFDdEIsUUFBSSxVQUFVLGFBQWEsT0FBTyxpQkFBaUI7QUFDakQsYUFBTyxVQUFVLFVBQVUsVUFBVSxJQUFJO0FBQUEsSUFDM0M7QUFDQSxVQUFNLE9BQU8sU0FBUyxjQUFjLFVBQVU7QUFDOUMsU0FBSyxRQUFRO0FBQ2IsU0FBSyxhQUFhLFlBQVksRUFBRTtBQUNoQyxTQUFLLE1BQU0sV0FBVztBQUN0QixTQUFLLE1BQU0sT0FBTztBQUNsQixhQUFTLEtBQUssWUFBWSxJQUFJO0FBQzlCLFNBQUssT0FBTztBQUNaLFFBQUk7QUFDRixlQUFTLFlBQVksTUFBTTtBQUFBLElBQzdCLFVBQUU7QUFDQSxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDaEM7QUFDQSxXQUFPLFFBQVEsUUFBUTtBQUFBLEVBQ3pCO0FBRU8sV0FBUyxXQUFXO0FBQUEsSUFDekIsU0FBQUE7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLGNBQWMsb0JBQUksSUFBSTtBQUFBLElBQ3RCO0FBQUEsSUFDQTtBQUFBLElBQ0EsZ0JBQWdCO0FBQUEsSUFDaEI7QUFBQSxJQUNBO0FBQUEsSUFDQSxxQkFBcUI7QUFBQSxJQUNyQjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixHQUFHO0FBQ0QsVUFBTSxFQUFFLGlCQUFpQixVQUFVLFVBQVUsYUFBYSxXQUFXLGNBQWMsSUFBSSxhQUFhO0FBQ3BHLFVBQU0sQ0FBQyxNQUFNLE9BQU8sSUFBSSxNQUFNLFNBQVMsT0FBTyxFQUFFLEdBQUcsb0JBQW9CLEdBQUcsTUFBTSxFQUFFO0FBQ2xGLFVBQU0sQ0FBQyxVQUFVLFdBQVcsSUFBSSxNQUFNLFNBQVMsS0FBSztBQUNwRCxVQUFNLENBQUMsa0JBQWtCLG1CQUFtQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3BFLFVBQU0sQ0FBQyxXQUFXLFlBQVksSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUNyRCxVQUFNLENBQUMsV0FBVyxZQUFZLElBQUksTUFBTSxTQUFTLElBQUk7QUFDckQsVUFBTSxPQUFPLE1BQU0sT0FBTyxJQUFJO0FBQzlCLFVBQU0sWUFBWSxNQUFNLE9BQU8sSUFBSTtBQUNuQyxVQUFNLFdBQVcsTUFBTSxPQUFPLElBQUk7QUFDbEMsVUFBTSxjQUFjLE1BQU0sT0FBTyxJQUFJO0FBQ3JDLFVBQU0sV0FBVyxNQUFNLE9BQU8sS0FBSztBQUNuQyxVQUFNLGNBQWMsTUFBTSxPQUFPLEtBQUs7QUFDdEMsVUFBTSxnQkFBZ0IsV0FBV0EsU0FBUSxPQUFPO0FBQ2hELGFBQVMsVUFBVTtBQUNuQixnQkFBWSxVQUFVO0FBRXRCLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLGNBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxvQkFBb0IsR0FBRyxPQUFPLFFBQVEsTUFBTSxFQUFFO0FBQUEsSUFDM0UsR0FBRyxDQUFDLFdBQVcsQ0FBQztBQUVoQixVQUFNLFVBQVUsTUFBTTtBQUNwQixjQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsU0FBUyxNQUFNLEVBQUU7QUFBQSxJQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBRVYsVUFBTSxVQUFVLE1BQU07QUFDcEIsVUFBSSxZQUFZLFFBQVMsUUFBTztBQUVoQyxZQUFNLFFBQVEsTUFBTTtBQUNsQixjQUFNLFNBQVMsVUFBVTtBQUN6QixjQUFNLFFBQVEsU0FBUztBQUN2QixZQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sUUFBTztBQUM5QixjQUFNLFdBQVcsTUFBTSxjQUFjLDJCQUEyQixlQUFlLElBQUk7QUFDbkYsWUFBSSxDQUFDLFNBQVUsUUFBTztBQUN0QixjQUFNLGVBQWUsU0FBUztBQUM5QixZQUFJLGdCQUFnQixFQUFHLFFBQU87QUFDOUIsY0FBTSxXQUFXLE1BQU0sc0JBQXNCO0FBQzdDLGNBQU0sWUFBWSxTQUFTLHNCQUFzQjtBQUNqRCxjQUFNLE9BQU8sa0JBQWtCO0FBQUEsVUFDN0IsZ0JBQWdCLE9BQU87QUFBQSxVQUN2QixpQkFBaUIsT0FBTztBQUFBLFVBQ3hCLGFBQWEsVUFBVSxPQUFPLFNBQVMsUUFBUTtBQUFBLFVBQy9DLFlBQVksVUFBVSxNQUFNLFNBQVMsT0FBTztBQUFBLFVBQzVDLGFBQWEsVUFBVSxRQUFRO0FBQUEsVUFDL0IsY0FBYyxVQUFVLFNBQVM7QUFBQSxVQUNqQztBQUFBLFFBQ0YsQ0FBQztBQUNELFlBQUksQ0FBQyxLQUFNLFFBQU87QUFDbEIsaUJBQVMsS0FBSyxLQUFLO0FBQ25CLGdCQUFRLElBQUk7QUFDWixlQUFPO0FBQUEsTUFDVDtBQUVBLFVBQUksTUFBTSxFQUFHLFFBQU87QUFDcEIsWUFBTSxRQUFRLE9BQU8sc0JBQXNCLE1BQU07QUFDL0MsY0FBTTtBQUFBLE1BQ1IsQ0FBQztBQUNELGFBQU8sTUFBTSxPQUFPLHFCQUFxQixLQUFLO0FBQUEsSUFDaEQsR0FBRyxDQUFDLGlCQUFpQixhQUFhLFFBQVEsQ0FBQztBQUUzQyxVQUFNLFVBQVUsTUFBTSxNQUFNO0FBQzFCLFVBQUksWUFBWSxRQUFTLFFBQU8sYUFBYSxZQUFZLE9BQU87QUFBQSxJQUNsRSxHQUFHLENBQUMsQ0FBQztBQUVMLGlCQUFhLFdBQVcsT0FBTyxVQUFVLGNBQWMsZ0JBQWdCO0FBRXZFLFVBQU0sV0FBVyxDQUFDLFVBQVU7QUE3UjlCO0FBOFJJLFVBQUksQ0FBQyxhQUFjO0FBQ25CLFVBQUksTUFBTSxVQUFVLFFBQVEsTUFBTSxXQUFXLEVBQUc7QUFFaEQsV0FBSSxpQkFBTSxRQUFPLFlBQWIsNEJBQXVCLG9CQUFxQjtBQUNoRCxXQUFLLFVBQVUsRUFBRSxHQUFHLE1BQU0sU0FBUyxHQUFHLE1BQU0sU0FBUyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssS0FBSztBQUN0RixrQkFBWSxJQUFJO0FBQ2hCLFlBQU0sY0FBYyxrQkFBa0IsTUFBTSxTQUFTO0FBQ3JELFlBQU0sZUFBZTtBQUFBLElBQ3ZCO0FBRUEsVUFBTSxVQUFVLENBQUMsVUFBVTtBQUN6QixZQUFNLFdBQVcsS0FBSztBQUN0QixVQUFJLENBQUMsU0FBVTtBQUNmLFlBQU0sRUFBRSxTQUFTLFFBQVEsSUFBSTtBQUM3QixjQUFRLENBQUMsWUFBWSxvQkFBb0IsU0FBUyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsSUFDL0U7QUFFQSxVQUFNLFNBQVMsTUFBTTtBQUNuQixXQUFLLFVBQVU7QUFDZixrQkFBWSxLQUFLO0FBQUEsSUFDbkI7QUFFQSxVQUFNLFlBQVksQ0FBQyxhQUFhO0FBRTlCLFVBQUksQ0FBQyxjQUFlO0FBQ3BCLG9CQUFjLFFBQVE7QUFBQSxJQUN4QjtBQUVBLFVBQU0sV0FBVyxDQUFDLEtBQUssTUFBTSxVQUFVO0FBQ3JDLFlBQU0sZ0JBQWdCO0FBQ3RCLFlBQU0sZUFBZTtBQUNyQixlQUFTLElBQUksRUFBRSxLQUFLLE1BQU07QUFDeEIscUJBQWEsR0FBRztBQUNoQixxQkFBYSxvQkFBSztBQUNsQixZQUFJLFlBQVksUUFBUyxRQUFPLGFBQWEsWUFBWSxPQUFPO0FBQ2hFLG9CQUFZLFVBQVUsT0FBTyxXQUFXLE1BQU07QUFDNUMsdUJBQWEsSUFBSTtBQUNqQix1QkFBYSxJQUFJO0FBQUEsUUFDbkIsR0FBRyxJQUFJO0FBQUEsTUFDVCxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0saUJBQWlCLENBQUMsT0FBTztBQUM3QixxQkFBZSxDQUFDLFlBQVk7QUFDMUIsY0FBTSxPQUFPLElBQUksSUFBSSxPQUFPO0FBQzVCLFlBQUksS0FBSyxJQUFJLEVBQUUsRUFBRyxNQUFLLE9BQU8sRUFBRTtBQUFBLFlBQzNCLE1BQUssSUFBSSxFQUFFO0FBQ2hCLGVBQU87QUFBQSxNQUNULENBQUM7QUFBQSxJQUNIO0FBRUEsVUFBTSxZQUFZLE1BQU07QUFDdEIscUJBQWUsQ0FBQyxZQUFZO0FBQzFCLFlBQUksUUFBUSxTQUFTQSxTQUFRLFFBQVEsT0FBUSxRQUFPLG9CQUFJLElBQUk7QUFDNUQsZUFBTyxJQUFJLElBQUlBLFNBQVEsUUFBUSxJQUFJLENBQUMsV0FBVyxPQUFPLEVBQUUsQ0FBQztBQUFBLE1BQzNELENBQUM7QUFBQSxJQUNIO0FBRUEsV0FDRSxvQ0FBQyxTQUFJLFdBQVUscUJBQ2Isb0NBQUMsV0FBTSxXQUFXLG9CQUFvQixtQkFBbUIsa0JBQWtCLEVBQUUsSUFBSSxlQUFhLG9CQUM1RixvQ0FBQyxTQUFJLFdBQVUsdUJBQ2Isb0NBQUMsZUFDQztBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsTUFBSztBQUFBLFFBQ0wsU0FBUyxZQUFZLFNBQVNBLFNBQVEsUUFBUSxVQUFVQSxTQUFRLFFBQVEsU0FBUztBQUFBLFFBQ2pGLFVBQVU7QUFBQSxRQUNWLFVBQVUsbUJBQW1CLEtBQUs7QUFBQTtBQUFBLElBQ3BDLEdBQUUsY0FFSixHQUNBO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFVO0FBQUEsUUFDVixjQUFXO0FBQUEsUUFDWCxPQUFNO0FBQUEsUUFDTixVQUFVLG1CQUFtQixLQUFLO0FBQUEsUUFDbEMsU0FBUyxNQUFNLG9CQUFvQixJQUFJO0FBQUE7QUFBQSxNQUV2QyxvQ0FBQyxTQUFJLFdBQVUsMEJBQXlCLFNBQVEsYUFBWSxlQUFZLFVBQ3RFLG9DQUFDLFVBQUssT0FBTSxNQUFLLFFBQU8sTUFBSyxHQUFFLEtBQUksR0FBRSxLQUFJLElBQUcsS0FBSSxHQUNoRCxvQ0FBQyxVQUFLLEdBQUUsV0FBVSxHQUNsQixvQ0FBQyxVQUFLLEdBQUUsa0JBQWlCLENBQzNCO0FBQUEsSUFDRixDQUNGLEdBQ0Esb0NBQUMsUUFBRyxXQUFVLG9CQUNYQSxTQUFRLFFBQVEsSUFBSSxDQUFDLFFBQVEsVUFDNUI7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFdBQVcsT0FBTyxPQUFPLGtCQUFrQixjQUFjO0FBQUEsUUFDekQsS0FBSyxPQUFPO0FBQUEsUUFDWixTQUFTLE1BQU0sU0FBUyxPQUFPLEVBQUU7QUFBQSxRQUNqQyxlQUFlLE1BQU0sVUFBVSxPQUFPLEVBQUU7QUFBQSxRQUN4QyxPQUFPLGdCQUFnQix5Q0FBVztBQUFBO0FBQUEsTUFFbEM7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLE1BQUs7QUFBQSxVQUNMLFNBQVMsWUFBWSxJQUFJLE9BQU8sRUFBRTtBQUFBLFVBQ2xDLFVBQVUsQ0FBQyxVQUFVO0FBQ25CLGtCQUFNLGdCQUFnQjtBQUN0QiwyQkFBZSxPQUFPLEVBQUU7QUFBQSxVQUMxQjtBQUFBLFVBQ0EsU0FBUyxDQUFDLFVBQVUsTUFBTSxnQkFBZ0I7QUFBQSxVQUMxQyxjQUFZLGdCQUFNLE9BQU8sS0FBSztBQUFBLFVBQzlCLFVBQVUsbUJBQW1CLEtBQUs7QUFBQTtBQUFBLE1BQ3BDO0FBQUEsTUFDQSxvQ0FBQyxVQUFLLFdBQVUseUJBQXVCLFFBQVEsQ0FBRTtBQUFBLE1BQ2pELG9DQUFDLFVBQUssV0FBVSxxQkFBbUIsT0FBTyxLQUFNO0FBQUEsSUFDbEQsQ0FDRCxDQUNILEdBQ0Esb0NBQUMsU0FBSSxXQUFVLG1CQUFrQixjQUFXLDhCQUMxQyxvQ0FBQyxTQUFJLFdBQVUsb0JBQ2Isb0NBQUMsY0FBSyxtRkFBZ0IsQ0FDeEIsR0FDQSxvQ0FBQyxTQUFJLFdBQVUsb0JBQ2Isb0NBQUMsY0FBSyxzRUFBa0IsQ0FDMUIsQ0FDRixDQUNGLEdBQ0MsbUJBQ0M7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLFdBQVU7QUFBQSxRQUNWLGNBQVc7QUFBQSxRQUNYLE9BQU07QUFBQSxRQUNOLFNBQVMsTUFBTSxvQkFBb0IsS0FBSztBQUFBO0FBQUEsTUFFeEMsb0NBQUMsU0FBSSxXQUFVLDBCQUF5QixTQUFRLGFBQVksZUFBWSxVQUN0RSxvQ0FBQyxVQUFLLE9BQU0sTUFBSyxRQUFPLE1BQUssR0FBRSxLQUFJLEdBQUUsS0FBSSxJQUFHLEtBQUksR0FDaEQsb0NBQUMsVUFBSyxHQUFFLFdBQVUsR0FDbEIsb0NBQUMsVUFBSyxHQUFFLGlCQUFnQixDQUMxQjtBQUFBLElBQ0YsSUFDRSxNQUNKO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxLQUFLO0FBQUEsUUFDTCxXQUFXLFlBQVksV0FBVyxpQkFBaUIsRUFBRSxHQUFHLGVBQWUsZUFBZSxFQUFFO0FBQUEsUUFDeEYsZUFBZTtBQUFBLFFBQ2YsZUFBZTtBQUFBLFFBQ2YsYUFBYTtBQUFBLFFBQ2IsaUJBQWlCO0FBQUEsUUFDakIsU0FBUztBQUFBO0FBQUEsTUFFVDtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsS0FBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsT0FBTyxFQUFFLFdBQVcsYUFBYSxLQUFLLElBQUksT0FBTyxLQUFLLElBQUksYUFBYSxLQUFLLEtBQUssSUFBSTtBQUFBO0FBQUEsUUFFcEZBLFNBQVEsUUFBUSxJQUFJLENBQUMsUUFBUSxVQUFVO0FBQ3RDLGdCQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsS0FBSyxPQUFPLEtBQUs7QUFDL0MsZ0JBQU0sV0FBVyxlQUFlLE9BQU8sRUFBRTtBQUN6QyxnQkFBTSxXQUFXLEdBQUcsT0FBTyxFQUFFO0FBQzdCLGdCQUFNLFVBQVUsR0FBRyxPQUFPLEVBQUU7QUFDNUIsaUJBQ0U7QUFBQSxZQUFDO0FBQUE7QUFBQSxjQUNDLFdBQVcsT0FBTyxPQUFPLGtCQUFrQixnQ0FBZ0M7QUFBQSxjQUMzRSx5QkFBdUIsT0FBTztBQUFBLGNBQzlCLEtBQUssT0FBTztBQUFBLGNBQ1osT0FBTyxnQkFBZ0IseUNBQVc7QUFBQSxjQUNsQyxTQUFTLENBQUMsVUFBVTtBQUNsQixvQkFBSSxNQUFNLE9BQU8sUUFBUSxzREFBc0QsRUFBRztBQUNsRix5QkFBUyxPQUFPLEVBQUU7QUFBQSxjQUNwQjtBQUFBLGNBQ0EsZUFBZSxDQUFDLFVBQVU7QUFDeEIsb0JBQUksTUFBTSxPQUFPLFFBQVEsc0RBQXNELEVBQUc7QUFDbEYsc0JBQU0sZUFBZTtBQUNyQiwwQkFBVSxPQUFPLEVBQUU7QUFBQSxjQUNyQjtBQUFBO0FBQUEsWUFFQSxvQ0FBQyxTQUFJLFdBQVUsb0JBQ2I7QUFBQSxjQUFDO0FBQUE7QUFBQSxnQkFDQyxXQUFXLDJDQUEyQyxjQUFjLFdBQVcsZUFBZSxFQUFFO0FBQUEsZ0JBQ2hHLE9BQU8sY0FBYyxXQUFXLHVCQUFRO0FBQUEsZ0JBQ3hDLFNBQVMsQ0FBQyxVQUFVLFNBQVMsVUFBVSxXQUFXLEtBQUs7QUFBQTtBQUFBLGNBRXREO0FBQUEsWUFDSCxHQUNDLE9BQU8sY0FBYyxvQ0FBQyxhQUFLLE9BQU8sV0FBWSxJQUFTLE1BQ3hEO0FBQUEsY0FBQztBQUFBO0FBQUEsZ0JBQ0MsV0FBVyxtQ0FBbUMsY0FBYyxVQUFVLGVBQWUsRUFBRTtBQUFBLGdCQUN2RixPQUFPLGNBQWMsVUFBVSx1QkFBUTtBQUFBLGdCQUN2QyxTQUFTLENBQUMsVUFBVSxTQUFTLFNBQVMsVUFBVSxLQUFLO0FBQUE7QUFBQSxjQUVyRCxvQ0FBQyxnQkFBTyxvQkFBRztBQUFBLGNBQ1Y7QUFBQSxZQUNILENBQ0Y7QUFBQSxZQUNBO0FBQUEsY0FBQztBQUFBO0FBQUEsZ0JBQ0M7QUFBQSxnQkFDQTtBQUFBLGdCQUNBLE1BQUs7QUFBQSxnQkFDTDtBQUFBLGdCQUNBLFNBQVMsT0FBTyxPQUFPO0FBQUEsZ0JBQ3ZCLFVBQVUsWUFBWSxJQUFJLE9BQU8sRUFBRTtBQUFBLGdCQUNuQyxnQkFBZ0IsTUFBTSxlQUFlLE9BQU8sRUFBRTtBQUFBLGdCQUM5QyxVQUFVLE1BQU0sWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQUEsZ0JBQ3ZDO0FBQUEsZ0JBQ0EsT0FBTyxLQUFLO0FBQUEsZ0JBQ1o7QUFBQSxnQkFDQTtBQUFBO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUVKLENBQUM7QUFBQSxNQUNIO0FBQUEsTUFDQyxxQkFDQztBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0M7QUFBQSxVQUNBLFNBQVNBO0FBQUEsVUFDVDtBQUFBLFVBQ0E7QUFBQSxVQUNBLFVBQVU7QUFBQSxVQUNWLGtCQUFrQjtBQUFBLFVBQ2xCLFNBQVM7QUFBQSxVQUNUO0FBQUEsVUFDQTtBQUFBO0FBQUEsTUFDRixJQUNFO0FBQUEsSUFDTixHQUNDLFlBQ0Msb0NBQUMsU0FBSSxXQUFVLGtCQUFpQixNQUFLLFlBQVUsU0FBVSxJQUN2RCxJQUNOO0FBQUEsRUFFSjs7O0FDcmZBLE1BQU0sa0JBQWtCO0FBRXhCLFdBQVMsZUFBZSxJQUFJO0FBQzFCLFVBQU0sUUFBUSxPQUFPLGlCQUFpQixFQUFFO0FBQ3hDLFVBQU0sT0FBTyxXQUFXLE1BQU0sV0FBVyxJQUFJLFdBQVcsTUFBTSxZQUFZO0FBQzFFLFVBQU0sT0FBTyxXQUFXLE1BQU0sVUFBVSxJQUFJLFdBQVcsTUFBTSxhQUFhO0FBQzFFLFdBQU87QUFBQSxNQUNMLE9BQU8sS0FBSyxJQUFJLEdBQUcsR0FBRyxjQUFjLElBQUk7QUFBQSxNQUN4QyxRQUFRLEtBQUssSUFBSSxHQUFHLEdBQUcsZUFBZSxJQUFJO0FBQUEsSUFDNUM7QUFBQSxFQUNGO0FBRU8sV0FBUyxTQUFTO0FBQUEsSUFDdkIsU0FBQUM7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLGNBQWMsb0JBQUksSUFBSTtBQUFBLElBQ3RCO0FBQUEsSUFDQSxnQkFBZ0I7QUFBQSxJQUNoQjtBQUFBLElBQ0E7QUFBQSxFQUNGLEdBQUc7QUFDRCxVQUFNLEVBQUUsaUJBQWlCLFVBQVUsYUFBYSxRQUFRLElBQUksYUFBYTtBQUN6RSxVQUFNLGNBQWNBLFNBQVEsUUFBUSxVQUFVLENBQUMsU0FBUyxLQUFLLE9BQU8sZUFBZTtBQUNuRixVQUFNLFNBQVMsZUFBZSxJQUFJQSxTQUFRLFFBQVEsV0FBVyxJQUFJO0FBQ2pFLFVBQU0sa0JBQWtCLENBQUMsRUFBRSxVQUFVLFlBQVksSUFBSSxPQUFPLEVBQUU7QUFDOUQsVUFBTSxDQUFDLE1BQU0sT0FBTyxJQUFJLE1BQU0sU0FBUyxPQUFPLEVBQUUsR0FBRyxvQkFBb0IsR0FBRyxNQUFNLEVBQUU7QUFDbEYsVUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3BELFVBQU0sT0FBTyxNQUFNLE9BQU8sSUFBSTtBQUM5QixVQUFNLGNBQWMsTUFBTSxPQUFPLElBQUk7QUFDckMsVUFBTSxXQUFXLE1BQU0sT0FBTyxJQUFJO0FBRWxDLFVBQU0seUJBQXlCLENBQUMsVUFBVTtBQUN4QyxVQUFJLENBQUMsc0JBQXNCLE1BQU0sTUFBTSxFQUFHO0FBQzFDLGNBQVEsUUFBUTtBQUFBLElBQ2xCO0FBR0EsVUFBTSxvQkFBb0IsQ0FBQyxVQUFVO0FBQ25DLFlBQU0sS0FBSyxZQUFZO0FBQ3ZCLFVBQUksQ0FBQyxHQUFJO0FBQ1QsWUFBTSxPQUFPLHNCQUFzQixNQUFNLE1BQU0sSUFBSSxrQkFBa0I7QUFDckUsV0FBSyxHQUFHLGFBQWEsT0FBTyxLQUFLLFFBQVEsS0FBTTtBQUMvQyxVQUFJLEtBQU0sSUFBRyxhQUFhLFNBQVMsSUFBSTtBQUFBLFVBQ2xDLElBQUcsZ0JBQWdCLE9BQU87QUFBQSxJQUNqQztBQUVBLFVBQU0scUJBQXFCLE1BQU07QUE3RG5DO0FBOERJLHdCQUFZLFlBQVosbUJBQXFCLGdCQUFnQjtBQUFBLElBQ3ZDO0FBRUEsVUFBTSxXQUFXLE1BQU0sWUFBWSxNQUFNO0FBQ3ZDLFlBQU0sWUFBWSxZQUFZO0FBQzlCLFlBQU0sUUFBUSxTQUFTO0FBQ3ZCLFVBQUksQ0FBQyxhQUFhLENBQUMsTUFBTztBQUMxQixZQUFNLE1BQU0sZUFBZSxTQUFTO0FBQ3BDLFlBQU0sT0FBTyxhQUFhLElBQUksT0FBTyxJQUFJLFFBQVEsTUFBTSxhQUFhLE1BQU0sWUFBWTtBQUN0RixlQUFTLElBQUk7QUFDYixjQUFRLEVBQUUsR0FBRyxvQkFBb0IsR0FBRyxPQUFPLEtBQUssQ0FBQztBQUFBLElBQ25ELEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFFYixVQUFNLFVBQVUsTUFBTTtBQUNwQixjQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsU0FBUyxNQUFNLEVBQUU7QUFBQSxJQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBRVYsVUFBTSxVQUFVLE1BQU07QUFDcEIsWUFBTSxZQUFZLFlBQVk7QUFDOUIsWUFBTSxRQUFRLFNBQVM7QUFDdkIsVUFBSSxDQUFDLGFBQWEsT0FBTyxtQkFBbUIsWUFBWTtBQUN0RCxpQkFBUztBQUNULGVBQU87QUFBQSxNQUNUO0FBQ0EsWUFBTSxXQUFXLElBQUksZUFBZSxNQUFNLFNBQVMsQ0FBQztBQUNwRCxlQUFTLFFBQVEsU0FBUztBQUMxQixVQUFJLE1BQU8sVUFBUyxRQUFRLEtBQUs7QUFDakMsZUFBUztBQUNULGFBQU8sTUFBTSxTQUFTLFdBQVc7QUFBQSxJQUNuQyxHQUFHLENBQUMsVUFBVSxVQUFVLGFBQWEsaUJBQWlCLGNBQWMsZUFBZSxDQUFDO0FBRXBGLGlCQUFhLGFBQWEsT0FBTyxVQUFVLGNBQWMsZ0JBQWdCO0FBRXpFLFVBQU0sV0FBVyxDQUFDLFVBQVU7QUFDMUIsVUFBSSxDQUFDLGFBQWM7QUFDbkIsVUFBSSxNQUFNLFVBQVUsUUFBUSxNQUFNLFdBQVcsRUFBRztBQUNoRCxXQUFLLFVBQVUsRUFBRSxHQUFHLE1BQU0sU0FBUyxHQUFHLE1BQU0sU0FBUyxNQUFNLEtBQUssTUFBTSxNQUFNLEtBQUssS0FBSztBQUN0RixrQkFBWSxJQUFJO0FBQ2hCLFlBQU0sY0FBYyxrQkFBa0IsTUFBTSxTQUFTO0FBQ3JELFlBQU0sZUFBZTtBQUFBLElBQ3ZCO0FBRUEsVUFBTSxVQUFVLENBQUMsVUFBVTtBQUN6QixZQUFNLFdBQVcsS0FBSztBQUN0QixVQUFJLENBQUMsU0FBVTtBQUNmLFlBQU0sRUFBRSxTQUFTLFFBQVEsSUFBSTtBQUM3QixjQUFRLENBQUMsWUFBWSxvQkFBb0IsU0FBUyxVQUFVLFNBQVMsT0FBTyxDQUFDO0FBQUEsSUFDL0U7QUFFQSxVQUFNLFNBQVMsTUFBTTtBQUNuQixXQUFLLFVBQVU7QUFDZixrQkFBWSxLQUFLO0FBQUEsSUFDbkI7QUFFQSxXQUNFLG9DQUFDLFNBQUksV0FBVyxrQkFBa0IsZ0NBQWdDLGFBQ2hFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxLQUFLO0FBQUEsUUFDTCxXQUFXLG1CQUFtQixXQUFXLGlCQUFpQixFQUFFLEdBQUcsZUFBZSxlQUFlLEVBQUU7QUFBQSxRQUMvRixlQUFlO0FBQUEsUUFDZixlQUFlO0FBQUEsUUFDZixhQUFhO0FBQUEsUUFDYixpQkFBaUI7QUFBQSxRQUNqQixhQUFhO0FBQUEsUUFDYixjQUFjO0FBQUEsUUFDZCxTQUFTO0FBQUEsUUFDVCxlQUFlO0FBQUE7QUFBQSxNQUVmO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxLQUFLO0FBQUEsVUFDTCxXQUFVO0FBQUEsVUFDVixPQUFPLEVBQUUsV0FBVyxhQUFhLEtBQUssSUFBSSxPQUFPLEtBQUssSUFBSSxhQUFhLEtBQUssS0FBSyxJQUFJO0FBQUE7QUFBQSxRQUVyRjtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0M7QUFBQSxZQUNBO0FBQUEsWUFDQSxNQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxVQUFVO0FBQUEsWUFDVixnQkFBZ0IsVUFBVSxpQkFBaUIsTUFBTSxlQUFlLE9BQU8sRUFBRSxJQUFJO0FBQUEsWUFDN0U7QUFBQSxZQUNBLE9BQU8sS0FBSztBQUFBLFlBQ1o7QUFBQSxZQUNBO0FBQUE7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsR0FDQSxvQ0FBQyxPQUFFLFdBQVUsa0JBQWUsdU5BQXNDLENBQ3BFO0FBQUEsRUFFSjs7O0FDdEpBLE1BQUk7QUFFSixNQUFNLFlBQVk7QUFBQSxJQUNoQixFQUFFLE1BQU0sc0JBQXNCLE9BQU8sTUFBTSxPQUFPLE9BQU8sZ0JBQWdCLFdBQVc7QUFBQSxJQUNwRixFQUFFLE1BQU0sZ0JBQWdCLE9BQU8sTUFBTSxPQUFPLE9BQU8sVUFBVSxXQUFXO0FBQUEsSUFDeEUsRUFBRSxNQUFNLG9CQUFvQixPQUFPLE1BQU0sT0FBTyxPQUFPLFdBQVcsV0FBVztBQUFBLEVBQy9FO0FBRUEsV0FBUyxXQUFXLE1BQU07QUFDeEIsV0FBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDdEMsVUFBSSxXQUFXLFNBQVMsY0FBYyxpQ0FBaUMsSUFBSSxJQUFJO0FBQy9FLFVBQUksVUFBVTtBQUNaLFlBQUksU0FBUyxRQUFRLHlCQUF5QixVQUFVO0FBQ3RELG1CQUFTLE9BQU87QUFDaEIscUJBQVc7QUFBQSxRQUNiO0FBQUEsTUFDRjtBQUNBLFVBQUksVUFBVTtBQUNaLGlCQUFTLGlCQUFpQixRQUFRLFNBQVMsRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN6RCxpQkFBUyxpQkFBaUIsU0FBUyxRQUFRLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDekQ7QUFBQSxNQUNGO0FBQ0EsWUFBTSxhQUFhLE9BQU87QUFDMUIsVUFBSSxDQUFDLFlBQVk7QUFDZixlQUFPLElBQUksTUFBTSxvRkFBa0MsQ0FBQztBQUNwRDtBQUFBLE1BQ0Y7QUFDQSxZQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsYUFBTyxNQUFNLElBQUksSUFBSSxNQUFNLFVBQVUsRUFBRTtBQUN2QyxhQUFPLFFBQVEsa0JBQWtCO0FBQ2pDLGFBQU8sUUFBUSx1QkFBdUI7QUFDdEMsYUFBTyxTQUFTLE1BQU07QUFDcEIsZUFBTyxRQUFRLHVCQUF1QjtBQUN0QyxnQkFBUTtBQUFBLE1BQ1Y7QUFDQSxhQUFPLFVBQVUsTUFBTTtBQUNyQixlQUFPLE9BQU87QUFDZCxlQUFPLElBQUksTUFBTSwwREFBYSxJQUFJLEVBQUUsQ0FBQztBQUFBLE1BQ3ZDO0FBQ0EsZUFBUyxLQUFLLFlBQVksTUFBTTtBQUFBLElBQ2xDLENBQUM7QUFBQSxFQUNIO0FBRU8sV0FBUyxzQkFBc0I7QUFDcEMsUUFBSSxDQUFDLHdCQUF3QjtBQUMzQiwrQkFBeUIsVUFBVTtBQUFBLFFBQ2pDLENBQUMsT0FBTyxZQUFZLE1BQU0sS0FBSyxZQUFZO0FBQ3pDLGNBQUksQ0FBQyxRQUFRLE1BQU0sRUFBRyxPQUFNLFdBQVcsUUFBUSxJQUFJO0FBQ25ELGNBQUksQ0FBQyxRQUFRLE1BQU0sRUFBRyxPQUFNLElBQUksTUFBTSxxREFBYSxRQUFRLElBQUksRUFBRTtBQUFBLFFBQ25FLENBQUM7QUFBQSxRQUNELFFBQVEsUUFBUTtBQUFBLE1BQ2xCLEVBQUUsTUFBTSxDQUFDLFVBQVU7QUFDakIsaUNBQXlCO0FBQ3pCLGNBQU07QUFBQSxNQUNSLENBQUM7QUFBQSxJQUNIO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxpQkFBc0IsY0FBYyxlQUFlLFVBQVUsRUFBRSxXQUFXLE1BQU0sSUFBSSxDQUFDLEdBQUc7QUFDdEYsUUFBSSxDQUFDLGNBQWUsT0FBTSxJQUFJLE1BQU0sZ0VBQW1CO0FBQ3ZELFVBQU0sb0JBQW9CO0FBRTFCLFVBQU0sVUFBVSxTQUFTLGNBQWMsS0FBSztBQUM1QyxZQUFRLFlBQVk7QUFDcEIsVUFBTSxRQUFRLGNBQWMsVUFBVSxJQUFJO0FBQzFDLFlBQVEsWUFBWSxLQUFLO0FBQ3pCLGFBQVMsS0FBSyxZQUFZLE9BQU87QUFFakMsUUFBSSxRQUFRLFNBQVM7QUFDckIsUUFBSSxTQUFTLFNBQVM7QUFDdEIsUUFBSTtBQUNGLFVBQUksVUFBVTtBQUNaLDRCQUFvQixLQUFLO0FBQ3pCLGNBQU0sTUFBTSxrQkFBa0IsS0FBSztBQUNuQyxnQkFBUSxJQUFJO0FBQ1osaUJBQVMsSUFBSTtBQUFBLE1BQ2Y7QUFDQSxZQUFNLE1BQU0sUUFBUSxHQUFHLEtBQUs7QUFDNUIsWUFBTSxNQUFNLFNBQVMsR0FBRyxNQUFNO0FBQzlCLGNBQVEsTUFBTSxRQUFRLEdBQUcsS0FBSztBQUM5QixjQUFRLE1BQU0sU0FBUyxHQUFHLE1BQU07QUFFaEMsWUFBTSxTQUFTLE1BQU0sT0FBTyxZQUFZLE9BQU87QUFBQSxRQUM3QyxpQkFBaUI7QUFBQSxRQUNqQjtBQUFBLFFBQ0E7QUFBQSxRQUNBLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULFNBQVM7QUFBQSxNQUNYLENBQUM7QUFDRCxhQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQzVDLGVBQU87QUFBQSxVQUNMLENBQUMsU0FBUyxPQUFPLFFBQVEsSUFBSSxJQUFJLE9BQU8sSUFBSSxNQUFNLDhCQUFVLENBQUM7QUFBQSxVQUM3RDtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILFVBQUU7QUFDQSxjQUFRLE9BQU87QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFFQSxXQUFTLEtBQUssT0FBTztBQUNuQixXQUFPLE9BQU8sU0FBUyxXQUFXLEVBQy9CLFlBQVksRUFDWixRQUFRLGVBQWUsR0FBRyxFQUMxQixRQUFRLFVBQVUsRUFBRSxLQUFLO0FBQUEsRUFDOUI7QUFFQSxpQkFBc0IsZUFBZSxTQUFTO0FBQzVDLFFBQUksQ0FBQyxNQUFNLFFBQVEsT0FBTyxLQUFLLFFBQVEsV0FBVyxHQUFHO0FBQ25ELFlBQU0sSUFBSSxNQUFNLDZDQUFlO0FBQUEsSUFDakM7QUFDQSxVQUFNLG9CQUFvQjtBQUMxQixVQUFNLFdBQVcsQ0FBQztBQUNsQixlQUFXLFVBQVUsU0FBUztBQUM1QixlQUFTLEtBQUs7QUFBQSxRQUNaLE1BQU0sR0FBRyxLQUFLLE9BQU8sRUFBRSxDQUFDO0FBQUEsUUFDeEIsTUFBTSxNQUFNLGNBQWMsT0FBTyxTQUFTLE9BQU8sVUFBVTtBQUFBLFVBQ3pELFVBQVUsQ0FBQyxDQUFDLE9BQU87QUFBQSxRQUNyQixDQUFDO0FBQUEsTUFDSCxDQUFDO0FBQUEsSUFDSDtBQUVBLFFBQUksU0FBUyxXQUFXLEdBQUc7QUFDekIsYUFBTyxPQUFPLFNBQVMsQ0FBQyxFQUFFLE1BQU0sU0FBUyxDQUFDLEVBQUUsSUFBSTtBQUNoRDtBQUFBLElBQ0Y7QUFFQSxVQUFNLE1BQU0sSUFBSSxPQUFPLE1BQU07QUFDN0IsYUFBUyxRQUFRLENBQUMsU0FBUyxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssSUFBSSxDQUFDO0FBQ3pELFVBQU0sT0FBTyxNQUFNLElBQUksY0FBYyxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQ3JELFdBQU8sT0FBTyxNQUFNLEdBQUcsS0FBSyxRQUFRLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTTtBQUFBLEVBQzNEOzs7QUNySUEsV0FBU0MsVUFBUyxNQUFNO0FBQ3RCLFFBQUksVUFBVSxhQUFhLE9BQU8sZ0JBQWlCLFFBQU8sVUFBVSxVQUFVLFVBQVUsSUFBSTtBQUM1RixVQUFNLE9BQU8sU0FBUyxjQUFjLFVBQVU7QUFDOUMsU0FBSyxRQUFRO0FBQ2IsU0FBSyxhQUFhLFlBQVksRUFBRTtBQUNoQyxTQUFLLE1BQU0sV0FBVztBQUN0QixTQUFLLE1BQU0sT0FBTztBQUNsQixhQUFTLEtBQUssWUFBWSxJQUFJO0FBQzlCLFNBQUssT0FBTztBQUNaLFFBQUk7QUFDRixlQUFTLFlBQVksTUFBTTtBQUFBLElBQzdCLFVBQUU7QUFDQSxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDaEM7QUFDQSxXQUFPLFFBQVEsUUFBUTtBQUFBLEVBQ3pCO0FBRU8sV0FBUyxZQUFZO0FBQUEsSUFDMUIsU0FBQUM7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0YsR0FBRztBQUNELFVBQU0sV0FBVyxXQUFXLFdBQVcsU0FBUyxDQUFDLEtBQUs7QUFDdEQsVUFBTSxrQkFBa0IsTUFBTSxRQUFRLE1BQU0sa0JBQWtCQSxVQUFTLEtBQUssR0FBRyxDQUFDQSxVQUFTLEtBQUssQ0FBQztBQUMvRixVQUFNLENBQUMsTUFBTSxPQUFPLElBQUksTUFBTSxTQUFTLFNBQVM7QUFDaEQsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU0sU0FBUyxFQUFFO0FBQ3ZELFVBQU0sQ0FBQyxRQUFRLFNBQVMsSUFBSSxNQUFNLFNBQVMsZUFBZTtBQUMxRCxVQUFNLENBQUMsYUFBYSxjQUFjLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDMUQsVUFBTSxDQUFDLFFBQVEsU0FBUyxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ2hELFVBQU0sWUFBWSxNQUFNLE9BQU8sSUFBSTtBQUVuQyxVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLENBQUMsWUFBYSxXQUFVLGVBQWU7QUFBQSxJQUM3QyxHQUFHLENBQUMsaUJBQWlCLFdBQVcsQ0FBQztBQUVqQyxVQUFNLFVBQVUsTUFBTSxNQUFNO0FBQzFCLFVBQUksVUFBVSxRQUFTLFFBQU8sYUFBYSxVQUFVLE9BQU87QUFBQSxJQUM5RCxHQUFHLENBQUMsQ0FBQztBQUVMLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLFVBQUksV0FBVyxXQUFXLEVBQUc7QUFDN0IsWUFBTSxhQUFhLFlBQVksS0FBSztBQUNwQyxVQUFJLENBQUMsY0FBYyxTQUFTLFNBQVU7QUFDdEMsZ0JBQVU7QUFBQSxRQUNSO0FBQUEsUUFDQSxTQUFTLFdBQVcsSUFBSSxDQUFDLGVBQWU7QUFBQSxVQUN0QyxVQUFVLFVBQVU7QUFBQSxVQUNwQixhQUFhLFVBQVU7QUFBQSxVQUN2QixZQUFZLFVBQVU7QUFBQSxVQUN0QixVQUFVLFVBQVU7QUFBQSxVQUNwQixhQUFhLFVBQVU7QUFBQSxRQUN6QixFQUFFO0FBQUEsUUFDRixhQUFhO0FBQUEsTUFDZixDQUFDO0FBQ0QscUJBQWUsRUFBRTtBQUFBLElBQ25CO0FBRUEsVUFBTSxhQUFhLE1BQU07QUFDdkIsZ0JBQVUsZUFBZTtBQUN6QixxQkFBZSxLQUFLO0FBQUEsSUFDdEI7QUFFQSxVQUFNLGFBQWEsTUFBTTtBQUN2QixNQUFBRCxVQUFTLE1BQU0sRUFBRSxLQUFLLE1BQU07QUFDMUIsa0JBQVUsSUFBSTtBQUNkLFlBQUksVUFBVSxRQUFTLFFBQU8sYUFBYSxVQUFVLE9BQU87QUFDNUQsa0JBQVUsVUFBVSxPQUFPLFdBQVcsTUFBTSxVQUFVLEtBQUssR0FBRyxJQUFJO0FBQUEsTUFDcEUsQ0FBQztBQUFBLElBQ0g7QUFFQSxVQUFNLG1CQUFtQixTQUFTLFNBQzlCLHVCQUNBLFNBQVMsVUFDUCw2QkFDQSxTQUFTLFdBQ1AscURBQ0E7QUFFUixXQUNFLG9DQUFDLFdBQU0sV0FBVSxtQkFBa0IsY0FBVyw0QkFBTyxRQUFRLENBQUMsV0FDNUQsb0NBQUMsWUFBTyxXQUFVLDRCQUNoQixvQ0FBQyxTQUFJLFdBQVUsNkJBQ2Isb0NBQUMsWUFBTyxXQUFVLDJCQUF3QiwwQkFBSSxHQUM5QyxvQ0FBQyxVQUFLLFdBQVUsMkJBQXlCLE1BQU0sUUFBTyxxQkFBSSxDQUM1RCxHQUNBLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFdBQVUsbUJBQWtCLFNBQVMsV0FBUyxjQUFFLENBQ3hFLEdBRUEsb0NBQUMsU0FBSSxXQUFVLDBCQUNiLG9DQUFDLGFBQVEsV0FBVSx1QkFDakIsb0NBQUMsU0FBSSxXQUFVLGlDQUNiLG9DQUFDLFFBQUcsV0FBVSwrQkFBNEIsOEJBQU8sV0FBVyxRQUFPLEdBQUMsR0FDcEUsb0NBQUMsU0FBSSxXQUFVLGlDQUNiO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLGNBQWMscUNBQXFDO0FBQUEsUUFDOUQsZ0JBQWM7QUFBQSxRQUNkLFNBQVM7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxNQUNLLGNBQWMsT0FBTztBQUFBLElBQzNCLEdBQ0MsV0FBVyxTQUFTLElBQ25CLG9DQUFDLFlBQU8sV0FBVSw2QkFBNEIsTUFBSyxVQUFTLFNBQVMsb0JBQWtCLGNBQUUsSUFDdkYsSUFDTixDQUNGLEdBQ0Esb0NBQUMsT0FBRSxXQUFVLDhCQUEyQixvS0FBK0MsR0FDdEYsV0FBVyxTQUFTLElBQ25CLG9DQUFDLFFBQUcsV0FBVSwwQkFDWCxXQUFXLElBQUksQ0FBQyxXQUFXLFVBQzFCLG9DQUFDLFFBQUcsV0FBVyxjQUFjLFdBQVcsa0NBQWtDLHVCQUF1QixLQUFLLEdBQUcsVUFBVSxRQUFRLElBQUksVUFBVSxRQUFRLE1BQy9JLG9DQUFDLFVBQUssV0FBVSxrQ0FBZ0MsUUFBUSxHQUFFLE1BQUcsVUFBVSxRQUFTLEdBQ2hGLG9DQUFDLFlBQU8sV0FBVSw4QkFBNkIsTUFBSyxVQUFTLFNBQVMsTUFBTSxrQkFBa0IsVUFBVSxPQUFPLEtBQUcsY0FBRSxDQUN0SCxDQUNELENBQ0gsSUFDRSxNQUNILFdBQ0MsMERBQ0Usb0NBQUMsU0FBSSxXQUFVLDJCQUF5QixTQUFTLGFBQVksVUFBSSxTQUFTLFFBQVMsR0FDbkYsb0NBQUMsU0FBSSxXQUFVLHlCQUF3QixjQUFXLDhCQUMvQyxTQUFTLFVBQVUsSUFBSSxDQUFDLFVBQVUsVUFDakMsb0NBQUMsTUFBTSxVQUFOLEVBQWUsS0FBSyxTQUFTLFlBQzNCLFFBQVEsSUFDUCxvQ0FBQyxVQUFLLFdBQVUsNEJBQTJCLGVBQVksVUFDckQsb0NBQUMsU0FBSSxTQUFRLGVBQ1gsb0NBQUMsVUFBSyxHQUFFLGlCQUFnQixDQUMxQixDQUNGLElBQ0UsTUFDSjtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsTUFBSztBQUFBLFFBQ0wsT0FBTyxTQUFTO0FBQUEsUUFDaEIsY0FBYyxNQUFNLGlEQUFpQixTQUFTO0FBQUEsUUFDOUMsY0FBYyxNQUFNLGlEQUFpQjtBQUFBLFFBQ3JDLFNBQVMsTUFBTSxnQkFBZ0IsU0FBUyxPQUFPO0FBQUE7QUFBQSxNQUU5QyxTQUFTO0FBQUEsSUFDWixDQUNGLENBQ0QsQ0FDSCxHQUNBLG9DQUFDLFVBQUssV0FBVSx3QkFBc0IsU0FBUyxRQUFTLEdBQ3ZELFNBQVMsY0FDUixvQ0FBQyxPQUFFLFdBQVUsNEJBQXlCLHNCQUFJLFNBQVMsV0FBWSxJQUM3RCxNQUNKLG9DQUFDLFdBQU0sV0FBVSxxQkFDZixvQ0FBQyxVQUFLLFdBQVUsMkJBQXdCLDBCQUFJLEdBQzVDLG9DQUFDLFlBQU8sV0FBVSx5QkFBd0IsT0FBTyxNQUFNLFVBQVUsQ0FBQyxVQUFVLFFBQVEsTUFBTSxPQUFPLEtBQUssS0FDbkcsT0FBTyxRQUFRLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDLE9BQU8sS0FBSyxNQUNwRCxvQ0FBQyxZQUFPLFdBQVUseUJBQXdCLE9BQWMsS0FBSyxTQUFRLEtBQU0sQ0FDNUUsQ0FDSCxDQUNGLEdBQ0Esb0NBQUMsV0FBTSxXQUFVLHFCQUNmLG9DQUFDLFVBQUssV0FBVSwyQkFBeUIsZ0JBQWlCLEdBQzFEO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxXQUFVO0FBQUEsUUFDVixPQUFPO0FBQUEsUUFDUCxhQUFhLFNBQVMsVUFBVSw2RUFBaUI7QUFBQSxRQUNqRCxVQUFVLENBQUMsVUFBVSxlQUFlLE1BQU0sT0FBTyxLQUFLO0FBQUE7QUFBQSxJQUN4RCxDQUNGLEdBQ0E7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLFdBQVU7QUFBQSxRQUNWLFVBQVUsQ0FBQyxZQUFZLEtBQUssS0FBSyxTQUFTO0FBQUEsUUFDMUMsU0FBUztBQUFBO0FBQUEsTUFDVjtBQUFBLE1BQ1MsV0FBVztBQUFBLE1BQU87QUFBQSxJQUM1QixDQUNGLElBRUEsb0NBQUMsT0FBRSxXQUFVLHFCQUFrQixvS0FBMkIsQ0FFOUQsR0FFQSxvQ0FBQyxhQUFRLFdBQVUsdUJBQ2pCLG9DQUFDLFFBQUcsV0FBVSwrQkFBNEIsMEJBQUksR0FDN0MsTUFBTSxTQUFTLElBQ2Qsb0NBQUMsUUFBRyxXQUFVLHFCQUNYLE1BQU0sSUFBSSxDQUFDLE1BQU0sVUFDaEIsb0NBQUMsUUFBRyxXQUFVLGtCQUFpQixLQUFLLEtBQUssTUFDdkMsb0NBQUMsU0FBSSxXQUFVLDRCQUNiLG9DQUFDLFlBQU8sV0FBVSwwQkFBd0IsUUFBUSxHQUFFLE1BQUcsbUJBQW1CLEtBQUssSUFBSSxDQUFFLEdBQ3JGLG9DQUFDLFVBQUssV0FBVSw2QkFDYixjQUFjLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxPQUFPLFFBQVEsRUFBRSxLQUFLLFFBQUcsQ0FDaEUsR0FDQSxvQ0FBQyxPQUFFLFdBQVUsZ0NBQThCLEtBQUssZUFBZSxrR0FBbUIsQ0FDcEYsR0FDQSxvQ0FBQyxZQUFPLFdBQVUseUJBQXdCLE1BQUssVUFBUyxTQUFTLE1BQU0sYUFBYSxLQUFLLEVBQUUsS0FBRyxjQUFFLENBQ2xHLENBQ0QsQ0FDSCxJQUNFLG9DQUFDLE9BQUUsV0FBVSxxQkFBa0Isa0RBQVEsQ0FDN0MsR0FFQSxvQ0FBQyxhQUFRLFdBQVUsZ0RBQ2pCLG9DQUFDLFNBQUksV0FBVSw2QkFDYixvQ0FBQyxRQUFHLFdBQVUsK0JBQTRCLHFCQUFTLEdBQ25ELG9DQUFDLFlBQU8sV0FBVSx3QkFBdUIsTUFBSyxVQUFTLFNBQVMsY0FBWSwwQkFBSSxDQUNsRixHQUNDLGNBQWMsb0NBQUMsT0FBRSxXQUFVLHNCQUFtQixxSEFBeUIsSUFBTyxNQUMvRTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsT0FBTztBQUFBLFFBQ1AsVUFBVSxDQUFDLFVBQVU7QUFDbkIsb0JBQVUsTUFBTSxPQUFPLEtBQUs7QUFDNUIseUJBQWUsSUFBSTtBQUFBLFFBQ3JCO0FBQUE7QUFBQSxJQUNGLEdBQ0Esb0NBQUMsWUFBTyxNQUFLLFVBQVMsV0FBVSxrQkFBaUIsU0FBUyxjQUN2RCxTQUFTLHVCQUFRLHFCQUNwQixDQUNGLENBQ0YsQ0FDRjtBQUFBLEVBRUo7OztBQ3JPQSxXQUFTLGNBQWMsTUFBTSxPQUFPO0FBQ2xDLFFBQUksS0FBSyxXQUFXLE1BQU0sT0FBUSxRQUFPO0FBQ3pDLFdBQU8sS0FBSyxNQUFNLENBQUMsTUFBTSxVQUFVO0FBQ2pDLFlBQU0sUUFBUSxNQUFNLEtBQUs7QUFDekIsYUFBTyxLQUFLLFFBQVEsTUFBTSxPQUNyQixLQUFLLFNBQVMsTUFBTSxRQUNwQixLQUFLLGNBQWMsTUFBTSxhQUN6QixLQUFLLFNBQVMsTUFBTSxRQUNwQixLQUFLLFFBQVEsTUFBTTtBQUFBLElBQzFCLENBQUM7QUFBQSxFQUNIO0FBRUEsV0FBUyxjQUFjLE1BQU0sTUFBTTtBQUNqQyxVQUFNLE9BQU8sS0FBSyxJQUFJLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDMUMsVUFBTSxRQUFRLEtBQUssSUFBSSxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQzdDLFVBQU0sTUFBTSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRztBQUN2QyxVQUFNLFNBQVMsS0FBSyxJQUFJLEtBQUssUUFBUSxLQUFLLE1BQU07QUFDaEQsUUFBSSxTQUFTLFFBQVEsVUFBVSxJQUFLLFFBQU87QUFDM0MsV0FBTyxFQUFFLE1BQU0sT0FBTyxLQUFLLE9BQU87QUFBQSxFQUNwQztBQUVBLFdBQVMsaUJBQWlCLE9BQU8sT0FBTztBQUN0QyxRQUFJLENBQUMsTUFBTyxRQUFPLENBQUM7QUFDcEIsVUFBTSxZQUFZLE1BQU0sc0JBQXNCO0FBQzlDLFVBQU0sWUFBWSxDQUFDO0FBRW5CLFVBQU0sUUFBUSxDQUFDLE1BQU0sY0FBYztBQUNqQyxvQkFBYyxJQUFJLEVBQUUsUUFBUSxDQUFDLFFBQVEsZ0JBQWdCO0FBQ25ELFlBQUksVUFBVTtBQUNkLFlBQUk7QUFDRixvQkFBVSxNQUFNLGNBQWMsT0FBTyxRQUFRO0FBQUEsUUFDL0MsU0FBUTtBQUNOO0FBQUEsUUFDRjtBQUNBLFlBQUksRUFBQyxtQ0FBUyxhQUFhO0FBQzNCLGNBQU0sZ0JBQWdCLFFBQVEsUUFBUSxvQkFBb0I7QUFDMUQsWUFBSSxDQUFDLGNBQWU7QUFDcEIsY0FBTSxVQUFVLGNBQWMsUUFBUSxzQkFBc0IsR0FBRyxjQUFjLHNCQUFzQixDQUFDO0FBQ3BHLFlBQUksQ0FBQyxRQUFTO0FBQ2QsY0FBTSxXQUFXLEtBQUssTUFBTSxRQUFRLFFBQVEsVUFBVSxJQUFJO0FBQzFELGNBQU0sVUFBVSxLQUFLLE1BQU0sUUFBUSxNQUFNLFVBQVUsR0FBRztBQUN0RCxjQUFNLGVBQWUsVUFBVTtBQUFBLFVBQzdCLENBQUMsYUFBYSxLQUFLLElBQUksU0FBUyxXQUFXLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxTQUFTLFVBQVUsT0FBTyxJQUFJO0FBQUEsUUFDckcsRUFBRTtBQUNGLGtCQUFVLEtBQUs7QUFBQSxVQUNiLEtBQUssR0FBRyxLQUFLLEVBQUUsSUFBSSxXQUFXO0FBQUEsVUFDOUI7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQSxNQUFNLFdBQVcsZUFBZTtBQUFBLFVBQ2hDLEtBQUs7QUFBQSxRQUNQLENBQUM7QUFBQSxNQUNILENBQUM7QUFBQSxJQUNILENBQUM7QUFFRCxXQUFPO0FBQUEsRUFDVDtBQUVPLFdBQVMsY0FBYyxFQUFFLFVBQVUsT0FBTyxZQUFZLEdBQUc7QUE5RGhFO0FBK0RFLFVBQU0sQ0FBQyxXQUFXLFlBQVksSUFBSSxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQ25ELFVBQU0sQ0FBQyxXQUFXLFlBQVksSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUNyRCxVQUFNLFdBQVcsTUFBTSxPQUFPLElBQUk7QUFFbEMsVUFBTSxVQUFVLE1BQU0sWUFBWSxNQUFNO0FBQ3RDLFlBQU0sT0FBTyxpQkFBaUIsU0FBUyxTQUFTLEtBQUs7QUFDckQsbUJBQWEsQ0FBQyxZQUFZLGNBQWMsU0FBUyxJQUFJLElBQUksVUFBVSxJQUFJO0FBQUEsSUFDekUsR0FBRyxDQUFDLFVBQVUsS0FBSyxDQUFDO0FBRXBCLFVBQU0sa0JBQWtCLE1BQU0sWUFBWSxNQUFNO0FBQzlDLFVBQUksU0FBUyxRQUFTLFFBQU8scUJBQXFCLFNBQVMsT0FBTztBQUNsRSxlQUFTLFVBQVUsT0FBTyxzQkFBc0IsTUFBTTtBQUNwRCxpQkFBUyxVQUFVO0FBQ25CLGdCQUFRO0FBQUEsTUFDVixDQUFDO0FBQUEsSUFDSCxHQUFHLENBQUMsT0FBTyxDQUFDO0FBRVosVUFBTSxnQkFBZ0IsTUFBTTtBQUMxQixjQUFRO0FBQUEsSUFDVixHQUFHLENBQUMsT0FBTyxDQUFDO0FBRVosVUFBTSxVQUFVLE1BQU07QUFDcEIsWUFBTSxVQUFVLEVBQUUsU0FBUyxNQUFNLFNBQVMsS0FBSztBQUMvQyxhQUFPLGlCQUFpQixVQUFVLGVBQWU7QUFDakQsYUFBTyxpQkFBaUIsVUFBVSxpQkFBaUIsT0FBTztBQUMxRCxhQUFPLGlCQUFpQixlQUFlLGlCQUFpQixPQUFPO0FBQy9ELGFBQU8saUJBQWlCLFNBQVMsaUJBQWlCLE9BQU87QUFDekQsYUFBTyxpQkFBaUIsU0FBUyxpQkFBaUIsSUFBSTtBQUN0RCxhQUFPLE1BQU07QUFDWCxlQUFPLG9CQUFvQixVQUFVLGVBQWU7QUFDcEQsZUFBTyxvQkFBb0IsVUFBVSxpQkFBaUIsT0FBTztBQUM3RCxlQUFPLG9CQUFvQixlQUFlLGlCQUFpQixPQUFPO0FBQ2xFLGVBQU8sb0JBQW9CLFNBQVMsaUJBQWlCLE9BQU87QUFDNUQsZUFBTyxvQkFBb0IsU0FBUyxpQkFBaUIsSUFBSTtBQUN6RCxZQUFJLFNBQVMsUUFBUyxRQUFPLHFCQUFxQixTQUFTLE9BQU87QUFBQSxNQUNwRTtBQUFBLElBQ0YsR0FBRyxDQUFDLGVBQWUsQ0FBQztBQUVwQixVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLGFBQWEsQ0FBQyxVQUFVLEtBQUssQ0FBQyxhQUFhLFNBQVMsUUFBUSxTQUFTLEVBQUcsY0FBYSxJQUFJO0FBQUEsSUFDL0YsR0FBRyxDQUFDLFdBQVcsU0FBUyxDQUFDO0FBRXpCLFVBQU0sU0FBUyxVQUFVLEtBQUssQ0FBQyxhQUFhLFNBQVMsUUFBUSxTQUFTO0FBQ3RFLFVBQU0sZUFBYSxjQUFTLFlBQVQsbUJBQWtCLGdCQUFlO0FBQ3BELFVBQU0sZ0JBQWMsY0FBUyxZQUFULG1CQUFrQixpQkFBZ0I7QUFDdEQsVUFBTSxhQUFhLFNBQVMsS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLE9BQU8sT0FBTyxJQUFJLGFBQWEsR0FBRyxDQUFDLElBQUk7QUFDekYsVUFBTSxZQUFZLFNBQVMsS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLE9BQU8sTUFBTSxJQUFJLGNBQWMsR0FBRyxDQUFDLElBQUk7QUFFeEYsV0FDRSxvQ0FBQyxTQUFJLFdBQVUscUJBQW9CLGNBQVcsOEJBQzNDLFVBQVUsSUFBSSxDQUFDLGFBQ2Q7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLFdBQVcsY0FBYyxTQUFTLE1BQU0sK0JBQStCO0FBQUEsUUFDdkUsS0FBSyxTQUFTO0FBQUEsUUFDZCxjQUFZLGdCQUFNLFNBQVMsWUFBWSxDQUFDLFNBQUksbUJBQW1CLFNBQVMsS0FBSyxJQUFJLENBQUM7QUFBQSxRQUNsRixPQUFPLEVBQUUsTUFBTSxTQUFTLE1BQU0sS0FBSyxTQUFTLElBQUk7QUFBQSxRQUNoRCxTQUFTLENBQUMsVUFBVTtBQUNsQixnQkFBTSxlQUFlO0FBQ3JCLGdCQUFNLGdCQUFnQjtBQUN0Qix1QkFBYSxDQUFDLFlBQVksWUFBWSxTQUFTLE1BQU0sT0FBTyxTQUFTLEdBQUc7QUFBQSxRQUMxRTtBQUFBO0FBQUEsTUFFQyxTQUFTLFlBQVk7QUFBQSxJQUN4QixDQUNELEdBQ0EsU0FDQztBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsT0FBTyxFQUFFLE1BQU0sWUFBWSxLQUFLLFVBQVU7QUFBQSxRQUMxQyxjQUFZLGdCQUFNLE9BQU8sWUFBWSxDQUFDO0FBQUE7QUFBQSxNQUV0QyxvQ0FBQyxZQUFPLFdBQVUscUNBQ2hCLG9DQUFDLFlBQU8sV0FBVSxvQ0FDZixPQUFPLFlBQVksR0FBRSxNQUFHLG1CQUFtQixPQUFPLEtBQUssSUFBSSxDQUM5RCxHQUNBLG9DQUFDLFlBQU8sV0FBVSxrQ0FBaUMsTUFBSyxVQUFTLFNBQVMsTUFBTSxhQUFhLElBQUksS0FBRyxjQUFFLENBQ3hHO0FBQUEsTUFDQSxvQ0FBQyxPQUFFLFdBQVUsMENBQ1YsT0FBTyxLQUFLLGVBQWUsa0dBQzlCO0FBQUEsTUFDQSxvQ0FBQyxTQUFJLFdBQVUsc0NBQ1osY0FBYyxPQUFPLElBQUksRUFBRSxJQUFJLENBQUMsV0FDL0Isb0NBQUMsVUFBSyxXQUFVLHFDQUFvQyxLQUFLLE9BQU8sWUFBVyxPQUFPLFFBQVMsQ0FDNUYsQ0FDSDtBQUFBLE1BQ0E7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLFdBQVU7QUFBQSxVQUNWLE1BQUs7QUFBQSxVQUNMLFNBQVMsTUFBTTtBQUNiLHlCQUFhLElBQUk7QUFDakI7QUFBQSxVQUNGO0FBQUE7QUFBQSxRQUNEO0FBQUEsTUFFRDtBQUFBLElBQ0YsSUFDRSxJQUNOO0FBQUEsRUFFSjs7O0FDbktBLE1BQU0sZ0JBQWdCO0FBQ3RCLE1BQU0sa0JBQWtCO0FBQ3hCLE1BQU0saUJBQWlCO0FBRXZCLFdBQVMsTUFBTSxPQUFPLEtBQUssS0FBSztBQUM5QixXQUFPLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxHQUFHLEdBQUcsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDO0FBQUEsRUFDMUQ7QUFFQSxXQUFTLGNBQWMsT0FBTyxVQUFVO0FBQ3RDLFFBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIsV0FBTztBQUFBLE1BQ0wsR0FBRyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsTUFBTSxjQUFjLGdCQUFnQixlQUFlO0FBQUEsTUFDekYsR0FBRyxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsTUFBTSxlQUFlLGdCQUFnQixlQUFlO0FBQUEsSUFDNUY7QUFBQSxFQUNGO0FBRUEsV0FBUyxnQkFBZ0IsT0FBTztBQUM5QixXQUFPLGNBQWMsT0FBTztBQUFBLE1BQzFCLEdBQUcsTUFBTSxjQUFjLGdCQUFnQjtBQUFBLE1BQ3ZDLEdBQUcsTUFBTSxlQUFlLGdCQUFnQjtBQUFBLElBQzFDLENBQUM7QUFBQSxFQUNIO0FBRUEsV0FBUyxhQUFhLFlBQVk7QUFDaEMsUUFBSTtBQUNGLFlBQU0sUUFBUSxLQUFLLE1BQU0sT0FBTyxhQUFhLFFBQVEsVUFBVSxDQUFDO0FBQ2hFLFVBQUksT0FBTyxTQUFTLCtCQUFPLENBQUMsS0FBSyxPQUFPLFNBQVMsK0JBQU8sQ0FBQyxFQUFHLFFBQU87QUFBQSxJQUNyRSxTQUFRO0FBQUEsSUFFUjtBQUNBLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxhQUFhLFlBQVksVUFBVTtBQUMxQyxRQUFJO0FBQ0YsYUFBTyxhQUFhLFFBQVEsWUFBWSxLQUFLLFVBQVUsUUFBUSxDQUFDO0FBQUEsSUFDbEUsU0FBUTtBQUFBLElBRVI7QUFBQSxFQUNGO0FBRUEsV0FBUyxjQUFjO0FBQ3JCLFdBQ0Usb0NBQUMsU0FBSSxXQUFVLDJCQUEwQixTQUFRLGFBQVksZUFBWSxVQUN2RSxvQ0FBQyxVQUFLLEdBQUUsMEZBQXlGLEdBQ2pHLG9DQUFDLFVBQUssR0FBRSxlQUFjLENBQ3hCO0FBQUEsRUFFSjtBQUVPLFdBQVMsZUFBZSxFQUFFLFVBQVUsT0FBTyxhQUFhLE9BQU8sR0FBRztBQUN2RSxVQUFNLGFBQWEsK0JBQStCLFdBQVc7QUFDN0QsVUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLE1BQU0sU0FBUyxJQUFJO0FBQ25ELFVBQU0sQ0FBQyxVQUFVLFdBQVcsSUFBSSxNQUFNLFNBQVMsS0FBSztBQUNwRCxVQUFNLFVBQVUsTUFBTSxPQUFPLElBQUk7QUFDakMsVUFBTSxjQUFjLE1BQU0sT0FBTyxJQUFJO0FBQ3JDLFVBQU0sbUJBQW1CLE1BQU0sT0FBTyxLQUFLO0FBRTNDLFVBQU0saUJBQWlCLE1BQU0sWUFBWSxDQUFDLFNBQVM7QUFDakQsWUFBTSxVQUFVLGNBQWMsU0FBUyxTQUFTLElBQUk7QUFDcEQsa0JBQVksVUFBVTtBQUN0QixrQkFBWSxPQUFPO0FBQ25CLGFBQU87QUFBQSxJQUNULEdBQUcsQ0FBQyxRQUFRLENBQUM7QUFFYixVQUFNLGdCQUFnQixNQUFNO0FBQzFCLFlBQU0sUUFBUSxTQUFTO0FBQ3ZCLFVBQUksQ0FBQyxNQUFPLFFBQU87QUFDbkIscUJBQWUsYUFBYSxVQUFVLEtBQUssZ0JBQWdCLEtBQUssQ0FBQztBQUVqRSxZQUFNLGVBQWUsTUFBTTtBQUN6QixjQUFNLE9BQU8sZUFBZSxZQUFZLFdBQVcsZ0JBQWdCLEtBQUssQ0FBQztBQUN6RSxxQkFBYSxZQUFZLElBQUk7QUFBQSxNQUMvQjtBQUNBLGFBQU8saUJBQWlCLFVBQVUsWUFBWTtBQUM5QyxhQUFPLE1BQU0sT0FBTyxvQkFBb0IsVUFBVSxZQUFZO0FBQUEsSUFDaEUsR0FBRyxDQUFDLFVBQVUsWUFBWSxjQUFjLENBQUM7QUFFekMsVUFBTSxhQUFhLENBQUMsVUFBVTtBQTlFaEM7QUErRUksWUFBTSxPQUFPLFFBQVE7QUFDckIsVUFBSSxDQUFDLFFBQVEsS0FBSyxjQUFjLE1BQU0sVUFBVztBQUNqRCx1QkFBaUIsVUFBVSxLQUFLO0FBQ2hDLGNBQVEsVUFBVTtBQUNsQixrQkFBWSxLQUFLO0FBQ2pCLFVBQUksWUFBWSxRQUFTLGNBQWEsWUFBWSxZQUFZLE9BQU87QUFDckUsV0FBSSxpQkFBTSxlQUFjLHNCQUFwQiw0QkFBd0MsTUFBTSxZQUFZO0FBQzVELGNBQU0sY0FBYyxzQkFBc0IsTUFBTSxTQUFTO0FBQUEsTUFDM0Q7QUFBQSxJQUNGO0FBRUEsUUFBSSxTQUFTLEVBQUcsUUFBTztBQUV2QixXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLFdBQVcsbUNBQW1DO0FBQUEsUUFDekQsT0FBTyxXQUFXLEVBQUUsTUFBTSxTQUFTLEdBQUcsS0FBSyxTQUFTLEVBQUUsSUFBSSxFQUFFLE9BQU8saUJBQWlCLFFBQVEsZ0JBQWdCO0FBQUEsUUFDNUcsY0FBWSxvREFBWSxLQUFLO0FBQUEsUUFDN0IsZ0JBQWE7QUFBQSxRQUNiLGVBQWUsQ0FBQyxVQUFVO0FBQ3hCLGNBQUksTUFBTSxXQUFXLEVBQUc7QUFDeEIsZ0JBQU0sU0FBUyxZQUFZLFdBQVcsZ0JBQWdCLFNBQVMsT0FBTztBQUN0RSxrQkFBUSxVQUFVO0FBQUEsWUFDaEIsV0FBVyxNQUFNO0FBQUEsWUFDakIsUUFBUSxNQUFNO0FBQUEsWUFDZCxRQUFRLE1BQU07QUFBQSxZQUNkO0FBQUEsWUFDQSxPQUFPO0FBQUEsVUFDVDtBQUNBLDJCQUFpQixVQUFVO0FBQzNCLGdCQUFNLGNBQWMsa0JBQWtCLE1BQU0sU0FBUztBQUFBLFFBQ3ZEO0FBQUEsUUFDQSxlQUFlLENBQUMsVUFBVTtBQUN4QixnQkFBTSxPQUFPLFFBQVE7QUFDckIsY0FBSSxDQUFDLFFBQVEsS0FBSyxjQUFjLE1BQU0sVUFBVztBQUNqRCxnQkFBTSxTQUFTLE1BQU0sVUFBVSxLQUFLO0FBQ3BDLGdCQUFNLFNBQVMsTUFBTSxVQUFVLEtBQUs7QUFDcEMsY0FBSSxDQUFDLEtBQUssU0FBUyxLQUFLLE1BQU0sUUFBUSxNQUFNLElBQUksZUFBZ0I7QUFDaEUsZUFBSyxRQUFRO0FBQ2Isc0JBQVksSUFBSTtBQUNoQix5QkFBZSxFQUFFLEdBQUcsS0FBSyxPQUFPLElBQUksUUFBUSxHQUFHLEtBQUssT0FBTyxJQUFJLE9BQU8sQ0FBQztBQUFBLFFBQ3pFO0FBQUEsUUFDQSxhQUFhO0FBQUEsUUFDYixpQkFBaUI7QUFBQSxRQUNqQixTQUFTLE1BQU07QUFDYixjQUFJLGlCQUFpQixTQUFTO0FBQzVCLDZCQUFpQixVQUFVO0FBQzNCO0FBQUEsVUFDRjtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBO0FBQUEsTUFFQSxvQ0FBQyxpQkFBWTtBQUFBLE1BQ2Isb0NBQUMsVUFBSyxXQUFVLDRCQUEyQixlQUFZLFVBQVEsS0FBTTtBQUFBLElBQ3ZFO0FBQUEsRUFFSjs7O0FDeElPLE1BQU0seUJBQXlCO0FBRS9CLFdBQVMseUJBQXlCLE9BQU87QUFDOUMsVUFBTSxlQUFlO0FBQ3JCLFVBQU0sY0FBYztBQUNwQixXQUFPO0FBQUEsRUFDVDs7O0FDTk8sTUFBTSw0QkFBNEI7QUFDbEMsTUFBTSw2QkFBNkI7QUFFMUMsTUFBTSxpQkFBaUI7QUFFdkIsV0FBU0UsTUFBSyxPQUFPO0FBQ25CLFdBQU8sT0FBTyxTQUFTLFdBQVcsRUFDL0IsS0FBSyxFQUNMLFlBQVksRUFDWixRQUFRLDRCQUE0QixHQUFHLEVBQ3ZDLFFBQVEsWUFBWSxFQUFFLEtBQUs7QUFBQSxFQUNoQztBQUVPLFdBQVMsb0JBQW9CQyxVQUFTO0FBQzNDLFdBQU8sUUFBT0EsWUFBQSxnQkFBQUEsU0FBUyxPQUFNRCxNQUFLQyxZQUFBLGdCQUFBQSxTQUFTLElBQUksQ0FBQztBQUFBLEVBQ2xEO0FBRU8sV0FBUyx1QkFBdUJBLFVBQVM7QUFDOUMsV0FBTyxRQUFPQSxZQUFBLGdCQUFBQSxTQUFTLHdCQUF1QixtQkFBbUI7QUFBQSxFQUNuRTtBQUVPLFdBQVMscUJBQXFCQSxVQUFTO0FBQzVDLFdBQU8sR0FBRyxjQUFjLEdBQUcsb0JBQW9CQSxRQUFPLENBQUM7QUFBQSxFQUN6RDtBQUVPLFdBQVMsdUJBQXVCO0FBQ3JDLFFBQUk7QUFDRixhQUFPLE9BQU87QUFBQSxJQUNoQixTQUFRO0FBQ04sYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRU8sV0FBUyw2QkFBNkIsT0FBTztBQUNsRCxVQUFNLGVBQWU7QUFDckIsVUFBTSxjQUFjO0FBQ3BCLFdBQU87QUFBQSxFQUNUO0FBRUEsV0FBUyxnQkFBZ0IsUUFBUTtBQUMvQixTQUFJLGlDQUFRLFVBQVMsVUFBVSxPQUFPLFVBQVU7QUFDOUMsWUFBTSxXQUFXLE9BQU87QUFDeEIsYUFBTztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sVUFBVSxPQUFPLE9BQU8sUUFBUTtBQUFBLFFBQ2hDLEdBQUksWUFBWSxPQUFPLFNBQVMsU0FBUyxDQUFDLEtBQUssT0FBTyxTQUFTLFNBQVMsQ0FBQyxJQUNyRSxFQUFFLGtCQUFrQjtBQUFBLFVBQ3BCLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQUEsVUFDOUMsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksR0FBRyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFBQSxRQUNoRCxFQUFFLElBQ0EsQ0FBQztBQUFBLE1BQ1A7QUFBQSxJQUNGO0FBQ0EsV0FBTyxFQUFFLE1BQU0sU0FBUztBQUFBLEVBQzFCO0FBRU8sV0FBUyxvQkFBb0IsWUFBWTtBQUM5QyxRQUFJLEVBQUMseUNBQVksT0FBTSxFQUFDLHlDQUFZLGFBQVksQ0FBQyxPQUFPLFdBQVcsV0FBVyxFQUFFLEVBQUUsS0FBSyxFQUFHLFFBQU87QUFDakcsVUFBTSxZQUFZLFdBQVcsY0FBYSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUNqRSxXQUFPO0FBQUEsTUFDTCxJQUFJLE9BQU8sV0FBVyxFQUFFO0FBQUEsTUFDeEIsVUFBVSxPQUFPLFdBQVcsUUFBUTtBQUFBLE1BQ3BDLGFBQWEsT0FBTyxXQUFXLGVBQWUsV0FBVyxRQUFRO0FBQUEsTUFDakUsUUFBUSxnQkFBZ0IsV0FBVyxNQUFNO0FBQUEsTUFDekMsU0FBUyxPQUFPLFdBQVcsT0FBTyxFQUFFLEtBQUs7QUFBQSxNQUN6QyxXQUFXLE9BQU8sU0FBUztBQUFBLE1BQzNCLFdBQVcsT0FBTyxXQUFXLGFBQWEsU0FBUztBQUFBLElBQ3JEO0FBQUEsRUFDRjtBQUVPLFdBQVMsZ0JBQWdCQSxVQUFTO0FBQ3ZDLFFBQUksQ0FBQyxNQUFNLFFBQVFBLFlBQUEsZ0JBQUFBLFNBQVMsV0FBVyxFQUFHLFFBQU8sQ0FBQztBQUNsRCxXQUFPQSxTQUFRLFlBQVksSUFBSSxtQkFBbUIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNwRTtBQUVBLFdBQVMsZ0JBQWdCLE1BQU0sT0FBTztBQUNwQyxXQUFPLEtBQUssVUFBVSxvQkFBb0IsSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLG9CQUFvQixLQUFLLENBQUM7QUFBQSxFQUNoRztBQUVPLFdBQVMsMEJBQTBCLE1BQU0sWUFBWTtBQUMxRCxVQUFNLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTO0FBQzlDLFlBQU0sYUFBYSxvQkFBb0IsSUFBSTtBQUMzQyxhQUFPLGFBQWEsQ0FBQyxXQUFXLElBQUksVUFBVSxJQUFJO0FBQUEsSUFDcEQsQ0FBQyxFQUFFLE9BQU8sT0FBTyxDQUFDO0FBRWxCLGVBQVcsYUFBYSxjQUFjLENBQUMsR0FBRztBQUN4QyxXQUFJLHVDQUFXLFFBQU8sWUFBWSxVQUFVLElBQUk7QUFDOUMsYUFBSyxPQUFPLE9BQU8sVUFBVSxFQUFFLENBQUM7QUFDaEM7QUFBQSxNQUNGO0FBQ0EsV0FBSSx1Q0FBVyxRQUFPLFVBQVU7QUFDOUIsY0FBTSxhQUFhLG9CQUFvQixVQUFVLFVBQVU7QUFDM0QsWUFBSSxXQUFZLE1BQUssSUFBSSxXQUFXLElBQUksVUFBVTtBQUFBLE1BQ3BEO0FBQUEsSUFDRjtBQUVBLFdBQU8sQ0FBQyxHQUFHLEtBQUssT0FBTyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sVUFBVTtBQUM5QyxZQUFNLE9BQU8sS0FBSyxVQUFVLGNBQWMsTUFBTSxTQUFTO0FBQ3pELGFBQU8sUUFBUSxLQUFLLEdBQUcsY0FBYyxNQUFNLEVBQUU7QUFBQSxJQUMvQyxDQUFDO0FBQUEsRUFDSDtBQUVPLFdBQVMsOEJBQThCLE1BQU0sWUFBWTtBQUM5RCxVQUFNLFdBQVcsSUFBSSxLQUFLLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLG9CQUFvQixJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3pGLFVBQU0sU0FBUyxvQkFBSSxJQUFJO0FBRXZCLGVBQVcsYUFBYSxjQUFjLENBQUMsR0FBRztBQUN4QyxXQUFJLHVDQUFXLFFBQU8sWUFBWSxVQUFVLElBQUk7QUFDOUMsZUFBTyxJQUFJLE9BQU8sVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUFJLFVBQVUsSUFBSSxPQUFPLFVBQVUsRUFBRSxFQUFFLENBQUM7QUFDM0U7QUFBQSxNQUNGO0FBQ0EsV0FBSSx1Q0FBVyxRQUFPLFVBQVU7QUFDOUIsY0FBTSxhQUFhLG9CQUFvQixVQUFVLFVBQVU7QUFDM0QsWUFBSSxXQUFZLFFBQU8sSUFBSSxXQUFXLElBQUksRUFBRSxJQUFJLFVBQVUsV0FBVyxDQUFDO0FBQUEsTUFDeEU7QUFBQSxJQUNGO0FBRUEsV0FBTyxDQUFDLEdBQUcsT0FBTyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsY0FBYztBQUNoRCxZQUFNLFdBQVcsU0FBUyxJQUFJLFVBQVUsT0FBTyxXQUFXLFVBQVUsS0FBSyxVQUFVLFdBQVcsRUFBRTtBQUNoRyxVQUFJLFVBQVUsT0FBTyxTQUFVLFFBQU8sQ0FBQyxDQUFDO0FBQ3hDLGFBQU8sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLFVBQVUsVUFBVSxVQUFVO0FBQUEsSUFDckUsQ0FBQztBQUFBLEVBQ0g7QUFFTyxXQUFTLDBCQUEwQixNQUFNLFlBQVksWUFBWTtBQUN0RSxVQUFNLGFBQWEsb0JBQW9CLFVBQVU7QUFDakQsUUFBSSxDQUFDLFdBQVksUUFBTyw4QkFBOEIsTUFBTSxVQUFVO0FBQ3RFLFdBQU8sOEJBQThCLE1BQU07QUFBQSxNQUN6QyxJQUFJLGNBQWMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxjQUFjO0FBaEloRDtBQWlJTSxjQUFNLEtBQUssVUFBVSxPQUFPLFdBQVcsVUFBVSxNQUFLLGVBQVUsZUFBVixtQkFBc0I7QUFDNUUsZUFBTyxPQUFPLFdBQVc7QUFBQSxNQUMzQixDQUFDO0FBQUEsTUFDRCxFQUFFLElBQUksVUFBVSxZQUFZLFdBQVc7QUFBQSxJQUN6QyxDQUFDO0FBQUEsRUFDSDtBQUVPLFdBQVMsMEJBQTBCLE1BQU0sWUFBWSxJQUFJO0FBQzlELFVBQU0sZUFBZSxPQUFPLEVBQUU7QUFDOUIsVUFBTSxlQUFlLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxZQUFZO0FBQ3hFLFVBQU0sUUFBUSxjQUFjLENBQUMsR0FBRyxPQUFPLENBQUMsY0FBYztBQTNJeEQ7QUE0SUksWUFBTSxjQUFjLFVBQVUsT0FBTyxXQUFXLFVBQVUsTUFBSyxlQUFVLGVBQVYsbUJBQXNCO0FBQ3JGLGFBQU8sZ0JBQWdCO0FBQUEsSUFDekIsQ0FBQztBQUNELFFBQUksWUFBYSxNQUFLLEtBQUssRUFBRSxJQUFJLFVBQVUsSUFBSSxhQUFhLENBQUM7QUFDN0QsV0FBTyw4QkFBOEIsTUFBTSxJQUFJO0FBQUEsRUFDakQ7QUFFTyxXQUFTLG9CQUFvQixTQUFTQSxVQUFTO0FBQ3BELFVBQU0sUUFBUTtBQUFBLE1BQ1osZUFBZTtBQUFBLE1BQ2YsV0FBVyxvQkFBb0JBLFFBQU87QUFBQSxNQUN0QyxjQUFjLHVCQUF1QkEsUUFBTztBQUFBLE1BQzVDLFlBQVksQ0FBQztBQUFBLElBQ2Y7QUFDQSxRQUFJLEVBQUMsbUNBQVMsU0FBUyxRQUFPO0FBQzlCLFFBQUk7QUFDRixZQUFNLFNBQVMsS0FBSyxNQUFNLFFBQVEsUUFBUSxxQkFBcUJBLFFBQU8sQ0FBQyxLQUFLLE1BQU07QUFDbEYsVUFBSSxDQUFDLFVBQVUsT0FBTyxrQkFBa0IsMEJBQTJCLFFBQU87QUFDMUUsVUFBSSxPQUFPLGNBQWMsTUFBTSxhQUFhLENBQUMsTUFBTSxRQUFRLE9BQU8sVUFBVSxFQUFHLFFBQU87QUFDdEYsYUFBTztBQUFBLFFBQ0wsR0FBRztBQUFBLFFBQ0gsY0FBYyxPQUFPLE9BQU8sZ0JBQWdCLE1BQU0sWUFBWTtBQUFBLFFBQzlELFlBQVksOEJBQThCLGdCQUFnQkEsUUFBTyxHQUFHLE9BQU8sVUFBVTtBQUFBLE1BQ3ZGO0FBQUEsSUFDRixTQUFRO0FBQ04sYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRU8sV0FBUyxvQkFBb0IsU0FBU0EsVUFBUyxZQUFZO0FBQ2hFLFFBQUksRUFBQyxtQ0FBUyxZQUFXLEVBQUMsbUNBQVMsWUFBWSxRQUFPO0FBQ3RELFVBQU0sTUFBTSxxQkFBcUJBLFFBQU87QUFDeEMsUUFBSTtBQUNGLFVBQUksRUFBQyx5Q0FBWSxTQUFRO0FBQ3ZCLGdCQUFRLFdBQVcsR0FBRztBQUN0QixlQUFPO0FBQUEsTUFDVDtBQUNBLGNBQVEsUUFBUSxLQUFLLEtBQUssVUFBVTtBQUFBLFFBQ2xDLGVBQWU7QUFBQSxRQUNmLFdBQVcsb0JBQW9CQSxRQUFPO0FBQUEsUUFDdEMsY0FBYyx1QkFBdUJBLFFBQU87QUFBQSxRQUM1QztBQUFBLE1BQ0YsQ0FBQyxDQUFDO0FBQ0YsYUFBTztBQUFBLElBQ1QsU0FBUTtBQUNOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjtBQUVPLFdBQVMsdUJBQXVCQSxVQUFTLGFBQWEsYUFBYSxDQUFDLEdBQUc7QUFDNUUsV0FBTztBQUFBLE1BQ0wsZUFBZTtBQUFBLE1BQ2YsV0FBVyxvQkFBb0JBLFFBQU87QUFBQSxNQUN0QyxjQUFhQSxZQUFBLGdCQUFBQSxTQUFTLFNBQVE7QUFBQSxNQUM5QixjQUFjLHVCQUF1QkEsUUFBTztBQUFBLE1BQzVDLGFBQVksb0JBQUksS0FBSyxHQUFFLFlBQVk7QUFBQSxNQUNuQyxjQUFjLGVBQWUsQ0FBQyxHQUFHLElBQUksbUJBQW1CLEVBQUUsT0FBTyxPQUFPO0FBQUEsTUFDeEUsWUFBWSw4QkFBOEIsZ0JBQWdCQSxRQUFPLEdBQUcsVUFBVTtBQUFBLElBQ2hGO0FBQUEsRUFDRjtBQUVPLFdBQVMsc0JBQXNCLE9BQU9BLFVBQVM7QUFDcEQsVUFBTSxTQUFTLE9BQU8sVUFBVSxXQUFXLEtBQUssTUFBTSxLQUFLLElBQUk7QUFDL0QsUUFBSSxDQUFDLFVBQVUsT0FBTyxrQkFBa0IsMkJBQTJCO0FBQ2pFLFlBQU0sSUFBSSxNQUFNLHdEQUFnQjtBQUFBLElBQ2xDO0FBQ0EsUUFBSSxPQUFPLGNBQWMsb0JBQW9CQSxRQUFPLEdBQUc7QUFDckQsWUFBTSxJQUFJLE1BQU0sK0RBQWtCLE9BQU8sZUFBZSxPQUFPLFNBQVMsRUFBRTtBQUFBLElBQzVFO0FBQ0EsUUFBSSxDQUFDLE1BQU0sUUFBUSxPQUFPLFdBQVcsRUFBRyxPQUFNLElBQUksTUFBTSx5REFBMkI7QUFDbkYsVUFBTSxjQUFjLE9BQU8sWUFBWSxJQUFJLG1CQUFtQixFQUFFLE9BQU8sT0FBTztBQUM5RSxRQUFJLFlBQVksV0FBVyxPQUFPLFlBQVksT0FBUSxPQUFNLElBQUksTUFBTSx3REFBZ0I7QUFDdEYsVUFBTSxhQUFhO0FBQUEsTUFDakIsZ0JBQWdCQSxRQUFPO0FBQUEsTUFDdkIsTUFBTSxRQUFRLE9BQU8sVUFBVSxJQUFJLE9BQU8sYUFBYSxDQUFDO0FBQUEsSUFDMUQ7QUFDQSxXQUFPLEVBQUUsR0FBRyxRQUFRLGFBQWEsV0FBVztBQUFBLEVBQzlDO0FBRU8sV0FBUywwQkFBMEJBLFVBQVMsWUFBWTtBQUM3RCxVQUFNLGVBQWNBLFlBQUEsZ0JBQUFBLFNBQVMsU0FBUTtBQUNyQyxVQUFNLGFBQWEsOEJBQThCLGdCQUFnQkEsUUFBTyxHQUFHLFVBQVU7QUFDckYsVUFBTSxVQUFVO0FBQUEsTUFDZCxlQUFlO0FBQUEsTUFDZixXQUFXLG9CQUFvQkEsUUFBTztBQUFBLE1BQ3RDLGNBQWMsdUJBQXVCQSxRQUFPO0FBQUEsTUFDNUMsWUFBWTtBQUFBLElBQ2Q7QUFDQSxXQUFPO0FBQUEsTUFDTCw2Q0FBVSxXQUFXO0FBQUEsTUFDckI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQSxLQUFLLFVBQVUsU0FBUyxNQUFNLENBQUM7QUFBQSxNQUMvQjtBQUFBLElBQ0YsRUFBRSxLQUFLLElBQUk7QUFBQSxFQUNiOzs7QUM3T0EsV0FBU0MsVUFBUyxNQUFNO0FBQ3RCLFFBQUksVUFBVSxhQUFhLE9BQU8sZ0JBQWlCLFFBQU8sVUFBVSxVQUFVLFVBQVUsSUFBSTtBQUM1RixVQUFNLE9BQU8sU0FBUyxjQUFjLFVBQVU7QUFDOUMsU0FBSyxRQUFRO0FBQ2IsU0FBSyxhQUFhLFlBQVksRUFBRTtBQUNoQyxTQUFLLE1BQU0sV0FBVztBQUN0QixTQUFLLE1BQU0sT0FBTztBQUNsQixhQUFTLEtBQUssWUFBWSxJQUFJO0FBQzlCLFNBQUssT0FBTztBQUNaLFFBQUk7QUFDRixlQUFTLFlBQVksTUFBTTtBQUFBLElBQzdCLFVBQUU7QUFDQSxlQUFTLEtBQUssWUFBWSxJQUFJO0FBQUEsSUFDaEM7QUFDQSxXQUFPLFFBQVEsUUFBUTtBQUFBLEVBQ3pCO0FBRUEsV0FBUyxtQkFBbUI7QUF4QjVCO0FBeUJFLFNBQUksZ0JBQVcsV0FBWCxtQkFBbUIsV0FBWSxRQUFPLFFBQVEsV0FBVyxPQUFPLFdBQVcsQ0FBQztBQUNoRixXQUFPLFFBQVEsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU8sRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQUEsRUFDckU7QUFFQSxXQUFTLGlCQUFpQixXQUFXO0FBN0JyQztBQThCRSxVQUFNLGVBQWMsa0RBQVcsWUFBWCxtQkFBb0IsMEJBQXBCO0FBQ3BCLFVBQU0sWUFBVyxrREFBVyxnQkFBWCxtQkFBd0IsMEJBQXhCO0FBQ2pCLFFBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLFNBQVMsU0FBUyxDQUFDLFNBQVMsT0FBUSxRQUFPO0FBQzdFLFdBQU87QUFBQSxNQUNMLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksWUFBWSxRQUFRLFNBQVMsUUFBUSxTQUFTLEtBQUssQ0FBQztBQUFBLE1BQ2hGLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksWUFBWSxNQUFNLFNBQVMsT0FBTyxTQUFTLE1BQU0sQ0FBQztBQUFBLElBQ2hGO0FBQUEsRUFDRjtBQUVBLFdBQVMsYUFBYSxVQUFVLE9BQU87QUFDckMsVUFBTSxPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssVUFBVSxPQUFPLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xHLFVBQU0sTUFBTSxJQUFJLGdCQUFnQixJQUFJO0FBQ3BDLFVBQU0sT0FBTyxTQUFTLGNBQWMsR0FBRztBQUN2QyxTQUFLLE9BQU87QUFDWixTQUFLLFdBQVc7QUFDaEIsYUFBUyxLQUFLLFlBQVksSUFBSTtBQUM5QixTQUFLLE1BQU07QUFDWCxhQUFTLEtBQUssWUFBWSxJQUFJO0FBRTlCLFdBQU8sV0FBVyxNQUFNLElBQUksZ0JBQWdCLEdBQUcsR0FBRyxJQUFJO0FBQUEsRUFDeEQ7QUFFQSxXQUFTLGVBQWUsRUFBRSxZQUFZLFNBQVMsVUFBVSxTQUFTLEdBQUc7QUFDbkUsVUFBTSxDQUFDLFNBQVMsVUFBVSxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ2xELFVBQU0sQ0FBQyxTQUFTLFVBQVUsSUFBSSxNQUFNLFNBQVMsV0FBVyxPQUFPO0FBRS9ELFVBQU0sVUFBVSxNQUFNLFdBQVcsV0FBVyxPQUFPLEdBQUcsQ0FBQyxXQUFXLE9BQU8sQ0FBQztBQUUxRSxVQUFNLFNBQVMsTUFBTTtBQUNuQixZQUFNLGFBQWEsUUFBUSxLQUFLO0FBQ2hDLFVBQUksQ0FBQyxXQUFZO0FBQ2pCLGVBQVMsRUFBRSxHQUFHLFlBQVksU0FBUyxZQUFZLFlBQVcsb0JBQUksS0FBSyxHQUFFLFlBQVksRUFBRSxDQUFDO0FBQ3BGLGlCQUFXLEtBQUs7QUFBQSxJQUNsQjtBQUVBLFdBQ0Usb0NBQUMsUUFBRyxXQUFVLHdCQUNaLG9DQUFDLFNBQUksV0FBVSw2QkFDYixvQ0FBQyxnQkFBUSxXQUFXLFdBQVksR0FDaEMsb0NBQUMsY0FBTSxXQUFXLE9BQU8sU0FBUyxTQUFTLDZCQUFTLDBCQUFPLEdBQzFELFVBQVUsb0NBQUMsVUFBSyxXQUFVLDJCQUF3QixvQkFBRyxJQUFVLG9DQUFDLGNBQUssMEJBQUksQ0FDNUUsR0FDQyxXQUFXLE9BQU8sU0FBUyxTQUMxQixvQ0FBQyxVQUFLLFdBQVUsNEJBQTBCLFdBQVcsT0FBTyxRQUFTLElBQ25FLE1BQ0gsVUFDQywwREFDRTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsT0FBTztBQUFBLFFBQ1AsVUFBVSxDQUFDLFVBQVUsV0FBVyxNQUFNLE9BQU8sS0FBSztBQUFBO0FBQUEsSUFDcEQsR0FDQSxvQ0FBQyxTQUFJLFdBQVUsZ0NBQ2Isb0NBQUMsWUFBTyxNQUFLLFVBQVMsU0FBUyxRQUFRLFVBQVUsQ0FBQyxRQUFRLEtBQUssS0FBRyxjQUFFLEdBQ3BFLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFNBQVMsTUFBTTtBQUNuQyxpQkFBVyxXQUFXLE9BQU87QUFDN0IsaUJBQVcsS0FBSztBQUFBLElBQ2xCLEtBQUcsY0FBRSxDQUNQLENBQ0YsSUFFQSxvQ0FBQyxPQUFFLFdBQVUsMkJBQXlCLFdBQVcsT0FBUSxHQUUxRCxDQUFDLFVBQ0Esb0NBQUMsU0FBSSxXQUFVLGdDQUNiLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFNBQVMsTUFBTSxXQUFXLElBQUksS0FBRyxjQUFFLEdBQ3pELG9DQUFDLFlBQU8sTUFBSyxVQUFTLFNBQVMsTUFBTSxTQUFTLFdBQVcsRUFBRSxLQUFHLGNBQUUsQ0FDbEUsSUFDRSxJQUNOO0FBQUEsRUFFSjtBQUVPLFdBQVMsZ0JBQWdCO0FBQUEsSUFDOUIsU0FBQUM7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGLEdBQUc7QUF0SEg7QUF1SEUsVUFBTSxvQkFBbUIsdUNBQVcsYUFBWSxxQkFBbUIsS0FBQUEsU0FBUSxRQUFRLENBQUMsTUFBakIsbUJBQW9CO0FBQ3ZGLFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVMsWUFBWSxTQUFTLFFBQVE7QUFDdEUsVUFBTSxDQUFDLFVBQVUsV0FBVyxJQUFJLE1BQU0sU0FBUyxnQkFBZ0I7QUFDL0QsVUFBTSxDQUFDLFNBQVMsVUFBVSxJQUFJLE1BQU0sU0FBUyxFQUFFO0FBQy9DLFVBQU0sQ0FBQyxRQUFRLFNBQVMsSUFBSSxNQUFNLFNBQVMsU0FBUztBQUNwRCxVQUFNLENBQUMsU0FBUyxVQUFVLElBQUksTUFBTSxTQUFTLEVBQUU7QUFDL0MsVUFBTSxrQkFBa0IsTUFBTTtBQUFBLE1BQzVCLE1BQU0sMEJBQTBCQSxVQUFTLFVBQVU7QUFBQSxNQUNuRCxDQUFDLFlBQVlBLFFBQU87QUFBQSxJQUN0QjtBQUNBLFVBQU0sQ0FBQyxRQUFRLFNBQVMsSUFBSSxNQUFNLFNBQVMsZUFBZTtBQUMxRCxVQUFNLENBQUMsYUFBYSxjQUFjLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDMUQsVUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3hELFVBQU0sV0FBVyxNQUFNLE9BQU8sSUFBSTtBQUVsQyxVQUFNLFVBQVUsTUFBTTtBQUNwQixrQkFBWSxnQkFBZ0I7QUFDNUIsVUFBSSxVQUFXLFVBQVMsTUFBTTtBQUFBLElBQ2hDLEdBQUcsQ0FBQyxrQkFBa0IsU0FBUyxDQUFDO0FBRWhDLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLFVBQUksQ0FBQyxZQUFhLFdBQVUsZUFBZTtBQUFBLElBQzdDLEdBQUcsQ0FBQyxpQkFBaUIsV0FBVyxDQUFDO0FBRWpDLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLFVBQUksQ0FBQyxXQUFZLFFBQU87QUFDeEIsWUFBTSxRQUFRLE9BQU8sV0FBVyxNQUFNLGNBQWMsS0FBSyxHQUFHLEdBQUk7QUFDaEUsYUFBTyxNQUFNLE9BQU8sYUFBYSxLQUFLO0FBQUEsSUFDeEMsR0FBRyxDQUFDLFVBQVUsQ0FBQztBQUVmLFVBQU0sZUFBZUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sT0FBTyxRQUFRLEtBQUtBLFNBQVEsUUFBUSxDQUFDO0FBQ2xHLFVBQU0sYUFBYSxJQUFJLEtBQUssY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQVc7QUF0SmhFLFVBQUFDO0FBdUpJLHVCQUFVLE9BQU8sV0FBVyxVQUFVLE1BQUtBLE1BQUEsVUFBVSxlQUFWLGdCQUFBQSxJQUFzQjtBQUFBLEtBQ2xFLENBQUM7QUFDRixVQUFNLHFCQUFxQixZQUFZLE9BQU8sQ0FBQyxlQUFlO0FBQzVELFVBQUksV0FBVyxVQUFXLFFBQU8sV0FBVyxhQUFhO0FBQ3pELGFBQU87QUFBQSxJQUNULENBQUM7QUFFRCxVQUFNLE1BQU0sTUFBTTtBQUNoQixZQUFNLGFBQWEsUUFBUSxLQUFLO0FBQ2hDLFVBQUksQ0FBQyxjQUFjLENBQUMsYUFBYztBQUNsQyxZQUFNLFVBQVUsVUFBVSxVQUFVO0FBQ3BDLFlBQU0sT0FBTSxvQkFBSSxLQUFLLEdBQUUsWUFBWTtBQUNuQyxZQUFNO0FBQUEsUUFDSixJQUFJLGlCQUFpQjtBQUFBLFFBQ3JCLFVBQVUsVUFBVSxVQUFVLFdBQVcsYUFBYTtBQUFBLFFBQ3RELGFBQWEsVUFBVSxVQUFVLGNBQWMsYUFBYTtBQUFBLFFBQzVELFFBQVEsVUFDSjtBQUFBLFVBQ0EsTUFBTTtBQUFBLFVBQ04sVUFBVSxVQUFVO0FBQUEsVUFDcEIsa0JBQWtCLGlCQUFpQixTQUFTO0FBQUEsUUFDOUMsSUFDRSxFQUFFLE1BQU0sU0FBUztBQUFBLFFBQ3JCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLFdBQVc7QUFBQSxNQUNiLENBQUM7QUFDRCxpQkFBVyxFQUFFO0FBQ2IsaUJBQVcsd0dBQW1CO0FBQUEsSUFDaEM7QUFFQSxVQUFNLGVBQWUsTUFBTTtBQUN6QixZQUFNLE9BQU8sdUJBQXVCRCxVQUFTLGFBQWEsVUFBVTtBQUNwRSxtQkFBYSxHQUFHLG9CQUFvQkEsUUFBTyxDQUFDLCtCQUErQixJQUFJO0FBQy9FLGlCQUFXLHNCQUFPLFlBQVksTUFBTSwyQkFBTztBQUFBLElBQzdDO0FBRUEsVUFBTSxlQUFlLE9BQU8sU0FBUztBQUNuQyxVQUFJLENBQUMsS0FBTTtBQUNYLFVBQUk7QUFDRixjQUFNLFNBQVMsc0JBQXNCLE1BQU0sS0FBSyxLQUFLLEdBQUdBLFFBQU87QUFDL0QsaUJBQVMsT0FBTyxhQUFhLE9BQU8sVUFBVTtBQUM5QyxtQkFBVyx3Q0FBVSxPQUFPLFlBQVksTUFBTSwyQkFBTztBQUFBLE1BQ3ZELFNBQVMsT0FBTztBQUNkLG9CQUFXLCtCQUFPLFlBQVcsZ0NBQU87QUFBQSxNQUN0QyxVQUFFO0FBQ0EsWUFBSSxTQUFTLFFBQVMsVUFBUyxRQUFRLFFBQVE7QUFBQSxNQUNqRDtBQUFBLElBQ0Y7QUFFQSxXQUNFLG9DQUFDLFdBQU0sV0FBVSx1Q0FBc0MsY0FBVyw0QkFBTyxRQUFRLENBQUMsV0FDaEYsb0NBQUMsWUFBTyxXQUFVLDRCQUNoQixvQ0FBQyxTQUFJLFdBQVUsNkJBQ2Isb0NBQUMsWUFBTyxXQUFVLDJCQUF3QiwwQkFBSSxHQUM5QyxvQ0FBQyxVQUFLLFdBQVUsMkJBQXlCLFlBQVksUUFBTyxxQkFBSSxDQUNsRSxHQUNBLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFdBQVUsbUJBQWtCLFNBQVMsV0FBUyxjQUFFLENBQ3hFLEdBRUEsb0NBQUMsU0FBSSxXQUFVLDBCQUNiLG9DQUFDLGFBQVEsV0FBVSx1QkFDakIsb0NBQUMsUUFBRyxXQUFVLCtCQUE0QiwwQkFBSSxHQUM5QyxvQ0FBQyxTQUFJLFdBQVUsdUJBQXNCLE1BQUssU0FBUSxjQUFXLDhCQUMzRDtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsTUFBSztBQUFBLFFBQ0wsV0FBVyxVQUFVLFdBQVcsY0FBYztBQUFBLFFBQzlDLFNBQVMsTUFBTSxTQUFTLFFBQVE7QUFBQTtBQUFBLE1BQ2pDO0FBQUEsSUFBRSxHQUNIO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLFVBQVUsU0FBUyxjQUFjO0FBQUEsUUFDNUMsVUFBVSxDQUFDO0FBQUEsUUFDWCxTQUFTLE1BQU0sU0FBUyxNQUFNO0FBQUE7QUFBQSxNQUMvQjtBQUFBLElBQUksQ0FDUCxHQUNDLFVBQVUsVUFBVSxZQUNuQixvQ0FBQyxTQUFJLFdBQVUsMEJBQ2Isb0NBQUMsY0FBTSxVQUFVLFdBQVksR0FDN0Isb0NBQUMsY0FBTSxVQUFVLFFBQVMsR0FDMUIsb0NBQUMsWUFBTyxNQUFLLFVBQVMsU0FBUyxvQkFBa0IsMEJBQUksQ0FDdkQsSUFFQSxvQ0FBQyxXQUFNLFdBQVUscUJBQ2Ysb0NBQUMsVUFBSyxXQUFVLDJCQUF3QixjQUFFLEdBQzFDLG9DQUFDLFlBQU8sT0FBTyxVQUFVLFVBQVUsQ0FBQyxVQUFVLFlBQVksTUFBTSxPQUFPLEtBQUssS0FDekVBLFNBQVEsUUFBUSxJQUFJLENBQUMsV0FDcEIsb0NBQUMsWUFBTyxPQUFPLE9BQU8sSUFBSSxLQUFLLE9BQU8sTUFBSyxPQUFPLE9BQU0sVUFBSSxPQUFPLEVBQUcsQ0FDdkUsQ0FDSCxDQUNGLEdBRUYsb0NBQUMsV0FBTSxXQUFVLHFCQUNmLG9DQUFDLFVBQUssV0FBVSwyQkFBd0IsMEJBQUksR0FDNUM7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE9BQU87QUFBQSxRQUNQLGFBQWEsVUFBVSxTQUFTLDJHQUFzQjtBQUFBLFFBQ3RELFVBQVUsQ0FBQyxVQUFVLFdBQVcsTUFBTSxPQUFPLEtBQUs7QUFBQTtBQUFBLElBQ3BELENBQ0YsR0FDQSxvQ0FBQyxZQUFPLE1BQUssVUFBUyxXQUFVLGlCQUFnQixVQUFVLENBQUMsUUFBUSxLQUFLLEdBQUcsU0FBUyxPQUFLLGtEQUV6RixHQUNBLG9DQUFDLE9BQUUsV0FBVywyQkFBMkIsZUFBZSxLQUFLLFdBQVcsTUFDckUsZUFBZSxHQUFHLFdBQVcsTUFBTSxzREFBYyxtSEFDcEQsQ0FDRixHQUVBLG9DQUFDLGFBQVEsV0FBVSx1QkFDakIsb0NBQUMsU0FBSSxXQUFVLDZCQUNiLG9DQUFDLFFBQUcsV0FBVSwrQkFBNEIsMEJBQUksR0FDOUMsb0NBQUMsU0FBSSxXQUFVLDJCQUNiLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFdBQVcsV0FBVyxZQUFZLGNBQWMsSUFBSSxTQUFTLE1BQU0sVUFBVSxTQUFTLEtBQUcsb0JBQUcsR0FDbEgsb0NBQUMsWUFBTyxNQUFLLFVBQVMsV0FBVyxXQUFXLFFBQVEsY0FBYyxJQUFJLFNBQVMsTUFBTSxVQUFVLEtBQUssS0FBRyxjQUFFLENBQzNHLENBQ0YsR0FDQyxtQkFBbUIsU0FDbEIsb0NBQUMsUUFBRyxXQUFVLHlCQUNYLG1CQUFtQixJQUFJLENBQUMsZUFDdkI7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDO0FBQUEsUUFDQSxTQUFTLFdBQVcsSUFBSSxXQUFXLEVBQUU7QUFBQSxRQUNyQyxLQUFLLFdBQVc7QUFBQSxRQUNoQjtBQUFBLFFBQ0E7QUFBQTtBQUFBLElBQ0YsQ0FDRCxDQUNILElBQ0Usb0NBQUMsT0FBRSxXQUFVLHFCQUFrQiw4REFBVSxDQUMvQyxHQUVBLG9DQUFDLGFBQVEsV0FBVSx1QkFDakIsb0NBQUMsU0FBSSxXQUFVLDZCQUNiLG9DQUFDLFFBQUcsV0FBVSwrQkFBNEIsZ0NBQUssR0FDOUMsV0FBVyxTQUNWLG9DQUFDLFlBQU8sV0FBVSx3QkFBdUIsTUFBSyxVQUFTLFNBQVMsTUFBTTtBQUNwRSxnQkFBVSxlQUFlO0FBQ3pCLHFCQUFlLEtBQUs7QUFBQSxJQUN0QixLQUFHLDBCQUFJLElBQ0wsSUFDTixHQUNDLFdBQVcsU0FDViwwREFDRSxvQ0FBQyxPQUFFLFdBQVUscUJBQWtCLHNJQUFnQyxHQUMvRDtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsT0FBTztBQUFBLFFBQ1AsVUFBVSxDQUFDLFVBQVU7QUFDbkIsb0JBQVUsTUFBTSxPQUFPLEtBQUs7QUFDNUIseUJBQWUsSUFBSTtBQUFBLFFBQ3JCO0FBQUE7QUFBQSxJQUNGLEdBQ0Esb0NBQUMsWUFBTyxNQUFLLFVBQVMsV0FBVSxrQkFBaUIsU0FBUyxNQUFNO0FBQzlELE1BQUFELFVBQVMsTUFBTSxFQUFFLEtBQUssTUFBTSxXQUFXLDhDQUFnQixDQUFDO0FBQUEsSUFDMUQsS0FBRyxpQ0FBVyxDQUNoQixJQUNFLG9DQUFDLE9BQUUsV0FBVSxxQkFBa0Isb0hBQW1CLEdBQ3RELG9DQUFDLFNBQUksV0FBVSxnQ0FDYixvQ0FBQyxZQUFPLE1BQUssVUFBUyxTQUFTLGdCQUFjLCtCQUFTLEdBQ3RELG9DQUFDLFlBQU8sTUFBSyxVQUFTLFNBQVMsTUFBRztBQXRUOUMsVUFBQUU7QUFzVGlELGNBQUFBLE1BQUEsU0FBUyxZQUFULGdCQUFBQSxJQUFrQjtBQUFBLFNBQVMsK0JBQVMsR0FDeEUsV0FBVyxTQUNWLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFNBQVMsTUFBTTtBQUNuQyxVQUFJLENBQUMsWUFBWTtBQUNmLHNCQUFjLElBQUk7QUFDbEIsbUJBQVcsZ0lBQXVCO0FBQ2xDO0FBQUEsTUFDRjtBQUNBLG1CQUFhO0FBQ2Isb0JBQWMsS0FBSztBQUNuQixpQkFBVyxrREFBVTtBQUFBLElBQ3ZCLEtBQ0csYUFBYSxxREFBYSxzQ0FDN0IsSUFDRSxJQUNOLEdBQ0E7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLEtBQUs7QUFBQSxRQUNMLFdBQVU7QUFBQSxRQUNWLE1BQUs7QUFBQSxRQUNMLFFBQU87QUFBQSxRQUNQLFVBQVUsQ0FBQyxVQUFPO0FBM1U5QixjQUFBQTtBQTJVaUMsK0JBQWFBLE1BQUEsTUFBTSxPQUFPLFVBQWIsZ0JBQUFBLElBQXFCLEVBQUU7QUFBQTtBQUFBO0FBQUEsSUFDM0QsR0FDQyxVQUFVLG9DQUFDLE9BQUUsV0FBVSx5QkFBd0IsTUFBSyxZQUFVLE9BQVEsSUFBTyxJQUNoRixDQUNGLENBQ0Y7QUFBQSxFQUVKOzs7QUNsVkEsV0FBUyxnQkFBZ0IsT0FBTztBQUM5QixXQUFPLE9BQU8sS0FBSyxFQUFFLFFBQVEsT0FBTyxNQUFNLEVBQUUsUUFBUSxNQUFNLEtBQUs7QUFBQSxFQUNqRTtBQUVBLFdBQVNDLGVBQWMsTUFBTSxNQUFNO0FBQ2pDLFVBQU0sT0FBTyxLQUFLLElBQUksS0FBSyxNQUFNLEtBQUssSUFBSTtBQUMxQyxVQUFNLFFBQVEsS0FBSyxJQUFJLEtBQUssT0FBTyxLQUFLLEtBQUs7QUFDN0MsVUFBTSxNQUFNLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQ3ZDLFVBQU0sU0FBUyxLQUFLLElBQUksS0FBSyxRQUFRLEtBQUssTUFBTTtBQUNoRCxRQUFJLFNBQVMsUUFBUSxVQUFVLElBQUssUUFBTztBQUMzQyxXQUFPLEVBQUUsTUFBTSxPQUFPLEtBQUssT0FBTztBQUFBLEVBQ3BDO0FBRUEsV0FBUyxtQkFBbUIsT0FBTyxZQUFZLFVBQVU7QUFiekQ7QUFjRSxVQUFNLFNBQVMsTUFBTSxjQUFjLG9CQUFvQixnQkFBZ0IsV0FBVyxRQUFRLENBQUMsSUFBSTtBQUMvRixVQUFNLFVBQVUsaUNBQVEsY0FBYztBQUN0QyxRQUFJLENBQUMsUUFBUyxRQUFPO0FBRXJCLFFBQUksVUFBVTtBQUNkLFVBQUksZ0JBQVcsV0FBWCxtQkFBbUIsVUFBUyxRQUFRO0FBQ3RDLFVBQUk7QUFDRixrQkFBVSxNQUFNLGNBQWMsV0FBVyxPQUFPLFFBQVE7QUFBQSxNQUMxRCxTQUFRO0FBQ04sa0JBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUVBLFVBQU0sWUFBWSxNQUFNLHNCQUFzQjtBQUM5QyxVQUFNLGNBQWMsUUFBUSxzQkFBc0I7QUFDbEQsUUFBSTtBQUNKLFFBQUk7QUFDSixRQUFJLFdBQVc7QUFFZixTQUFJLG1DQUFTLGdCQUFlLFFBQVEsU0FBUyxPQUFPLEdBQUc7QUFDckQsWUFBTSxVQUFVQSxlQUFjLFFBQVEsc0JBQXNCLEdBQUcsV0FBVztBQUMxRSxVQUFJLENBQUMsUUFBUyxRQUFPO0FBQ3JCLGlCQUFXLFFBQVEsUUFBUSxVQUFVO0FBQ3JDLGdCQUFVLFFBQVEsTUFBTSxVQUFVO0FBQUEsSUFDcEMsT0FBTztBQUNMLFlBQU0sYUFBVyxnQkFBVyxXQUFYLG1CQUFtQixxQkFBb0IsRUFBRSxHQUFHLE1BQU0sR0FBRyxLQUFLO0FBQzNFLGlCQUFXLFlBQVksT0FBTyxVQUFVLE9BQU8sWUFBWSxRQUFRLFNBQVM7QUFDNUUsZ0JBQVUsWUFBWSxNQUFNLFVBQVUsTUFBTSxZQUFZLFNBQVMsU0FBUztBQUMxRSxtQkFBVyxnQkFBVyxXQUFYLG1CQUFtQixVQUFTO0FBQUEsSUFDekM7QUFFQSxVQUFNLFVBQVUsU0FBUztBQUFBLE1BQ3ZCLENBQUMsU0FBUyxLQUFLLElBQUksS0FBSyxXQUFXLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxLQUFLLFVBQVUsT0FBTyxJQUFJO0FBQUEsSUFDekYsRUFBRTtBQUNGLFdBQU87QUFBQSxNQUNMLEtBQUssV0FBVztBQUFBLE1BQ2hCO0FBQUEsTUFDQSxVQUFVLEtBQUssTUFBTSxRQUFRO0FBQUEsTUFDN0IsU0FBUyxLQUFLLE1BQU0sT0FBTztBQUFBLE1BQzNCLE1BQU0sS0FBSyxNQUFNLFdBQVcsVUFBVSxFQUFFO0FBQUEsTUFDeEMsS0FBSyxLQUFLLE1BQU0sT0FBTztBQUFBLE1BQ3ZCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxXQUFTQyxrQkFBaUIsT0FBTyxhQUFhO0FBQzVDLFFBQUksQ0FBQyxNQUFPLFFBQU8sQ0FBQztBQUNwQixVQUFNLFlBQVksQ0FBQztBQUNuQixlQUFXLGNBQWMsYUFBYTtBQUNwQyxZQUFNLFdBQVcsbUJBQW1CLE9BQU8sWUFBWSxTQUFTO0FBQ2hFLFVBQUksU0FBVSxXQUFVLEtBQUssUUFBUTtBQUFBLElBQ3ZDO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFQSxXQUFTQyxlQUFjLE1BQU0sT0FBTztBQUNsQyxRQUFJLEtBQUssV0FBVyxNQUFNLE9BQVEsUUFBTztBQUN6QyxXQUFPLEtBQUssTUFBTSxDQUFDLE1BQU0sVUFBVTtBQUNqQyxZQUFNLFFBQVEsTUFBTSxLQUFLO0FBQ3pCLGFBQU8sS0FBSyxRQUFRLE1BQU0sT0FDckIsS0FBSyxlQUFlLE1BQU0sY0FDMUIsS0FBSyxTQUFTLE1BQU0sUUFDcEIsS0FBSyxRQUFRLE1BQU0sT0FDbkIsS0FBSyxhQUFhLE1BQU07QUFBQSxJQUMvQixDQUFDO0FBQUEsRUFDSDtBQUVPLFdBQVMsa0JBQWtCLEVBQUUsVUFBVSxhQUFhLFlBQVksR0FBRztBQWpGMUU7QUFrRkUsVUFBTSxDQUFDLFdBQVcsWUFBWSxJQUFJLE1BQU0sU0FBUyxDQUFDLENBQUM7QUFDbkQsVUFBTSxDQUFDLFdBQVcsWUFBWSxJQUFJLE1BQU0sU0FBUyxJQUFJO0FBQ3JELFVBQU0sV0FBVyxNQUFNLE9BQU8sSUFBSTtBQUVsQyxVQUFNLFVBQVUsTUFBTSxZQUFZLE1BQU07QUFDdEMsWUFBTSxPQUFPRCxrQkFBaUIsU0FBUyxTQUFTLFdBQVc7QUFDM0QsbUJBQWEsQ0FBQyxZQUFZQyxlQUFjLFNBQVMsSUFBSSxJQUFJLFVBQVUsSUFBSTtBQUFBLElBQ3pFLEdBQUcsQ0FBQyxhQUFhLFFBQVEsQ0FBQztBQUUxQixVQUFNLGtCQUFrQixNQUFNLFlBQVksTUFBTTtBQUM5QyxVQUFJLFNBQVMsUUFBUyxRQUFPLHFCQUFxQixTQUFTLE9BQU87QUFDbEUsZUFBUyxVQUFVLE9BQU8sc0JBQXNCLE1BQU07QUFDcEQsaUJBQVMsVUFBVTtBQUNuQixnQkFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLElBQ0gsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUlaLFVBQU0sZ0JBQWdCLE1BQU07QUFDMUIsY0FBUTtBQUFBLElBQ1YsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUVaLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLFlBQU0sVUFBVSxFQUFFLFNBQVMsTUFBTSxTQUFTLEtBQUs7QUFDL0MsYUFBTyxpQkFBaUIsVUFBVSxlQUFlO0FBQ2pELGFBQU8saUJBQWlCLFVBQVUsaUJBQWlCLE9BQU87QUFDMUQsYUFBTyxpQkFBaUIsZUFBZSxpQkFBaUIsT0FBTztBQUMvRCxhQUFPLGlCQUFpQixTQUFTLGlCQUFpQixPQUFPO0FBQ3pELGFBQU8saUJBQWlCLFNBQVMsaUJBQWlCLElBQUk7QUFDdEQsYUFBTyxNQUFNO0FBQ1gsZUFBTyxvQkFBb0IsVUFBVSxlQUFlO0FBQ3BELGVBQU8sb0JBQW9CLFVBQVUsaUJBQWlCLE9BQU87QUFDN0QsZUFBTyxvQkFBb0IsZUFBZSxpQkFBaUIsT0FBTztBQUNsRSxlQUFPLG9CQUFvQixTQUFTLGlCQUFpQixPQUFPO0FBQzVELGVBQU8sb0JBQW9CLFNBQVMsaUJBQWlCLElBQUk7QUFDekQsWUFBSSxTQUFTLFFBQVMsUUFBTyxxQkFBcUIsU0FBUyxPQUFPO0FBQUEsTUFDcEU7QUFBQSxJQUNGLEdBQUcsQ0FBQyxlQUFlLENBQUM7QUFFcEIsVUFBTSxVQUFVLE1BQU07QUFDcEIsVUFBSSxhQUFhLENBQUMsVUFBVSxLQUFLLENBQUMsYUFBYSxTQUFTLFFBQVEsU0FBUyxFQUFHLGNBQWEsSUFBSTtBQUFBLElBQy9GLEdBQUcsQ0FBQyxXQUFXLFNBQVMsQ0FBQztBQUV6QixVQUFNLFNBQVMsVUFBVSxLQUFLLENBQUMsYUFBYSxTQUFTLFFBQVEsU0FBUztBQUN0RSxVQUFNLGVBQWEsY0FBUyxZQUFULG1CQUFrQixnQkFBZTtBQUNwRCxVQUFNLGdCQUFjLGNBQVMsWUFBVCxtQkFBa0IsaUJBQWdCO0FBQ3RELFVBQU0sYUFBYSxTQUFTLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxPQUFPLE9BQU8sSUFBSSxhQUFhLEdBQUcsQ0FBQyxJQUFJO0FBQ3pGLFVBQU0sWUFBWSxTQUFTLEtBQUssSUFBSSxJQUFJLEtBQUssSUFBSSxPQUFPLE1BQU0sSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJO0FBRXhGLFdBQ0Usb0NBQUMsU0FBSSxXQUFVLHlCQUF3QixjQUFXLDhCQUMvQyxVQUFVLElBQUksQ0FBQyxVQUFVLFVBQ3hCO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLHVCQUF1QixjQUFjLFNBQVMsTUFBTSxlQUFlLEVBQUUsR0FBRyxTQUFTLFdBQVcsaUJBQWlCLEVBQUU7QUFBQSxRQUMxSCxLQUFLLFNBQVM7QUFBQSxRQUNkLGNBQVksZ0JBQU0sUUFBUSxDQUFDLFNBQUksU0FBUyxXQUFXLE9BQU87QUFBQSxRQUMxRCxPQUFPLEVBQUUsTUFBTSxTQUFTLE1BQU0sS0FBSyxTQUFTLElBQUk7QUFBQSxRQUNoRCxTQUFTLENBQUMsVUFBVTtBQUNsQixnQkFBTSxlQUFlO0FBQ3JCLGdCQUFNLGdCQUFnQjtBQUN0Qix1QkFBYSxDQUFDLFlBQVksWUFBWSxTQUFTLE1BQU0sT0FBTyxTQUFTLEdBQUc7QUFBQSxRQUMxRTtBQUFBO0FBQUEsTUFFQyxRQUFRO0FBQUEsSUFDWCxDQUNELEdBQ0EsU0FDQztBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsT0FBTyxFQUFFLE1BQU0sWUFBWSxLQUFLLFVBQVU7QUFBQSxRQUMxQyxjQUFZLHFCQUFNLE9BQU8sV0FBVyxXQUFXO0FBQUE7QUFBQSxNQUUvQyxvQ0FBQyxZQUFPLFdBQVUscUNBQ2hCLG9DQUFDLFlBQU8sV0FBVSxvQ0FDZixPQUFPLFdBQVcsYUFBWSxVQUFJLE9BQU8sV0FBVyxPQUFPLFNBQVMsU0FBUyxpQkFBTyxjQUN2RixHQUNBLG9DQUFDLFlBQU8sV0FBVSw4QkFBNkIsTUFBSyxVQUFTLFNBQVMsTUFBTSxhQUFhLElBQUksS0FBRyxjQUFFLENBQ3BHO0FBQUEsTUFDQyxPQUFPLFdBQVcsb0NBQUMsT0FBRSxXQUFVLDRCQUF5QixrR0FBZ0IsSUFBTztBQUFBLE1BQ2hGLG9DQUFDLE9BQUUsV0FBVSxrQ0FBZ0MsT0FBTyxXQUFXLE9BQVE7QUFBQSxNQUN2RSxvQ0FBQyxZQUFPLFdBQVUsNkJBQTRCLE1BQUssVUFBUyxTQUFTLE1BQU07QUFDekUscUJBQWEsSUFBSTtBQUNqQixvQkFBWSxPQUFPLFVBQVU7QUFBQSxNQUMvQixLQUFHLDBCQUFJO0FBQUEsSUFDVCxJQUNFLElBQ047QUFBQSxFQUVKOzs7QUM1S0EsTUFBTSx1QkFBdUI7QUFBQSxJQUMzQixFQUFFLElBQUksVUFBVSxRQUFRLEtBQUssT0FBTyw2Q0FBVTtBQUFBLElBQzlDLEVBQUUsSUFBSSxRQUFRLFFBQVEsS0FBSyxPQUFPLDZDQUFVO0FBQUEsSUFDNUMsRUFBRSxJQUFJLGVBQWUsUUFBUSxLQUFLLE9BQU8sNERBQWU7QUFBQSxJQUN4RCxFQUFFLElBQUksVUFBVSxRQUFRLEtBQUssT0FBTyx5REFBWTtBQUFBLElBQ2hELEVBQUUsSUFBSSxhQUFhLFFBQVEsS0FBSyxPQUFPLHVDQUFTO0FBQUEsSUFDaEQsRUFBRSxJQUFJLHNCQUFzQixRQUFRLFdBQVcsT0FBTyw2Q0FBVTtBQUFBLElBQ2hFLEVBQUUsSUFBSSxZQUFZLFFBQVEsS0FBSyxPQUFPLHlEQUFZO0FBQUEsSUFDbEQsRUFBRSxJQUFJLFNBQVMsTUFBTSxTQUFTLE9BQU8sbURBQVc7QUFBQSxJQUNoRCxFQUFFLElBQUksVUFBVSxNQUFNLE9BQU8sT0FBTyxxRUFBYztBQUFBLElBQ2xELEVBQUUsSUFBSSxRQUFRLE1BQU0sS0FBSyxPQUFPLGtFQUFnQjtBQUFBLEVBQ2xEO0FBRU8sV0FBUyxnQkFBZ0I7QUFDOUIsUUFBSSxPQUFPLGNBQWMsWUFBYSxRQUFPO0FBQzdDLFdBQU8sd0JBQXdCLEtBQUssR0FBRyxVQUFVLFlBQVksRUFBRSxJQUFJLFVBQVUsYUFBYSxFQUFFLEVBQUU7QUFBQSxFQUNoRztBQUVPLFdBQVMsc0JBQXNCLFFBQVEsY0FBYyxHQUFHO0FBQzdELFdBQU8sUUFBUSxTQUFTO0FBQUEsRUFDMUI7QUFFTyxXQUFTLGtCQUFrQixRQUFRLGNBQWMsR0FBRztBQUN6RCxVQUFNLFdBQVcsc0JBQXNCLEtBQUs7QUFDNUMsV0FBTyxxQkFBcUIsSUFBSSxDQUFDLGFBQWEsU0FBUyxPQUNuRCxXQUNBLEVBQUUsR0FBRyxVQUFVLE1BQU0sR0FBRyxRQUFRLElBQUksU0FBUyxNQUFNLEdBQUcsQ0FBQztBQUFBLEVBQzdEO0FBRU8sTUFBTSxrQkFBa0Isa0JBQWtCO0FBRTFDLFdBQVMseUJBQXlCLFFBQVE7QUEvQmpEO0FBZ0NFLFFBQUksQ0FBQyxPQUFRLFFBQU87QUFDcEIsVUFBTSxVQUFVLE9BQU8sYUFBYSxJQUFJLE9BQU8sZ0JBQWdCO0FBQy9ELFFBQUksQ0FBQyxRQUFTLFFBQU87QUFDckIsVUFBTSxNQUFNLFFBQVE7QUFDcEIsUUFBSSxRQUFRLFdBQVcsUUFBUSxjQUFjLFFBQVEsU0FBVSxRQUFPO0FBQ3RFLFFBQUksUUFBUSxrQkFBbUIsUUFBTztBQUN0QyxXQUFPLENBQUMsR0FBQyxhQUFRLFlBQVIsaUNBQWtCO0FBQUEsRUFDN0I7QUFFTyxXQUFTLG1CQUFtQixPQUFPLFFBQVEsY0FBYyxHQUFHO0FBQ2pFLFFBQUksQ0FBQyxTQUFTLE1BQU0sT0FBUSxRQUFPO0FBQ25DLFVBQU0sTUFBTSxPQUFPLE1BQU0sT0FBTyxFQUFFLEVBQUUsWUFBWTtBQUNoRCxVQUFNLFdBQVcsUUFBUSxNQUFNLFVBQVUsTUFBTTtBQUUvQyxRQUFJLENBQUMsVUFBVTtBQUNiLFVBQUksQ0FBQyxNQUFNLFlBQVksUUFBUSxTQUFVLFFBQU87QUFDaEQsVUFBSSxNQUFNLFFBQVEsSUFBSyxRQUFPO0FBQzlCLGFBQU87QUFBQSxJQUNUO0FBRUEsUUFBSSxNQUFNLFNBQVUsUUFBTyxRQUFRLE1BQU0sdUJBQXVCO0FBQ2hFLFFBQUksUUFBUSxJQUFLLFFBQU87QUFDeEIsUUFBSSxRQUFRLElBQUssUUFBTztBQUN4QixRQUFJLFFBQVEsSUFBSyxRQUFPO0FBQ3hCLFFBQUksUUFBUSxJQUFLLFFBQU87QUFDeEIsUUFBSSxRQUFRLElBQUssUUFBTztBQUN4QixRQUFJLFFBQVEsSUFBSyxRQUFPO0FBQ3hCLFdBQU87QUFBQSxFQUNUOzs7QUMxREEsV0FBUyxXQUFXLEVBQUUsSUFBSSxPQUFPLFdBQVcsU0FBUyxTQUFTLEdBQUc7QUFDL0QsVUFBTSxXQUFXLE1BQU0sT0FBTyxJQUFJO0FBQ2xDLFVBQU0saUJBQWlCLE1BQU0sT0FBTyxJQUFJO0FBRXhDLFVBQU0sVUFBVSxNQUFNO0FBTnhCO0FBT0kscUJBQWUsVUFBVSxTQUFTO0FBQ2xDLHFCQUFTLFlBQVQsbUJBQWtCO0FBQ2xCLGFBQU8sTUFBRztBQVRkLFlBQUFDLEtBQUE7QUFTaUIsc0JBQUFBLE1BQUEsZUFBZSxZQUFmLGdCQUFBQSxJQUF3QixVQUF4Qix3QkFBQUE7QUFBQTtBQUFBLElBQ2YsR0FBRyxDQUFDLENBQUM7QUFFTCxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxXQUFVO0FBQUEsUUFDVixlQUFlLENBQUMsVUFBVTtBQUN4QixjQUFJLE1BQU0sV0FBVyxNQUFNLGNBQWUsU0FBUTtBQUFBLFFBQ3BEO0FBQUE7QUFBQSxNQUVBLG9DQUFDLGFBQVEsSUFBUSxXQUFVLGtCQUFpQixNQUFLLFVBQVMsY0FBVyxRQUFPLGNBQVksYUFDdEYsb0NBQUMsWUFBTyxXQUFVLDJCQUNoQixvQ0FBQyxnQkFBUSxLQUFNLEdBQ2Ysb0NBQUMsWUFBTyxLQUFLLFVBQVUsTUFBSyxVQUFTLFdBQVUsd0JBQXVCLFNBQVMsU0FBUyxjQUFZLGVBQUssS0FBSyxNQUFJLGNBQUUsQ0FDdEgsR0FDQSxvQ0FBQyxTQUFJLFdBQVUseUJBQXVCLFFBQVMsQ0FDakQ7QUFBQSxJQUNGO0FBQUEsRUFFSjtBQUVPLFdBQVMsYUFBYTtBQUFBLElBQzNCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRixHQUFHO0FBQ0QsVUFBTSxZQUFZLGtCQUFrQjtBQUNwQyxXQUNFLG9DQUFDLGNBQVcsSUFBRyxvQkFBbUIsT0FBTSxvREFBZ0IsV0FBVSwwREFBWSxXQUM1RSxvQ0FBQyxRQUFHLFdBQVUsc0JBQ1gsVUFBVSxJQUFJLENBQUMsYUFDZCxvQ0FBQyxTQUFJLFdBQVcsU0FBUyxPQUFPLFVBQVUsQ0FBQyxnQkFBZ0IsZ0JBQWdCLElBQUksS0FBSyxTQUFTLE1BQzNGLG9DQUFDLFlBQUcsb0NBQUMsYUFBSyxTQUFTLElBQUssQ0FBTSxHQUM5QixvQ0FBQyxZQUFJLFNBQVMsT0FBTyxTQUFTLE9BQU8sVUFBVSxDQUFDLGdCQUFnQiwrQ0FBWSxFQUFHLENBQ2pGLENBQ0QsQ0FDSCxHQUNBLG9DQUFDLE9BQUUsV0FBVSx5QkFBc0IsZ0xBQTZCLEdBQ2hFLG9DQUFDLGFBQVEsV0FBVSwwQkFBeUIsbUJBQWdCLGtDQUMxRCxvQ0FBQyxRQUFHLElBQUcsa0NBQStCLDBCQUFJLEdBQzFDLG9DQUFDLFdBQU0sV0FBVSwwQkFDZixvQ0FBQyxjQUNDLG9DQUFDLGdCQUFPLHNDQUFNLEdBQ2Qsb0NBQUMsZUFBTSxzRkFBYyxDQUN2QixHQUNBO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxTQUFTO0FBQUEsUUFDVCxVQUFVLENBQUMsVUFBVSx3QkFBd0IsTUFBTSxPQUFPLE9BQU87QUFBQTtBQUFBLElBQ25FLENBQ0YsR0FDQSxvQ0FBQyxXQUFNLFdBQVUsMEJBQ2Ysb0NBQUMsY0FDQyxvQ0FBQyxnQkFBTyxrREFBUSxHQUNoQixvQ0FBQyxlQUFNLHNGQUFjLENBQ3ZCLEdBQ0E7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLFNBQVM7QUFBQSxRQUNULFVBQVUsQ0FBQyxVQUFVLDhCQUE4QixNQUFNLE9BQU8sT0FBTztBQUFBO0FBQUEsSUFDekUsQ0FDRixHQUNBLG9DQUFDLFdBQU0sV0FBVSwwQkFDZixvQ0FBQyxjQUNDLG9DQUFDLGdCQUFPLGdDQUFLLEdBQ2Isb0NBQUMsZUFBTSxrSEFBc0IsQ0FDL0IsR0FDQTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsTUFBSztBQUFBLFFBQ0wsU0FBUztBQUFBLFFBQ1QsVUFBVSxDQUFDLFVBQVUscUJBQXFCLE1BQU0sT0FBTyxPQUFPO0FBQUE7QUFBQSxJQUNoRSxDQUNGLEdBQ0Esb0NBQUMsV0FBTSxXQUFXLHlCQUF5QixlQUFlLEtBQUssY0FBYyxNQUMzRSxvQ0FBQyxjQUNDLG9DQUFDLGdCQUFPLGdDQUFLLEdBQ2Isb0NBQUMsZ0JBQVEsS0FBSyxNQUFNLGtCQUFrQixHQUFHLEdBQUUsR0FBQyxDQUM5QyxHQUNBO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxLQUFJO0FBQUEsUUFDSixLQUFJO0FBQUEsUUFDSixNQUFLO0FBQUEsUUFDTCxPQUFPO0FBQUEsUUFDUCxVQUFVLENBQUM7QUFBQSxRQUNYLFVBQVUsQ0FBQyxVQUFVLHdCQUF3QixPQUFPLE1BQU0sT0FBTyxLQUFLLENBQUM7QUFBQSxRQUN2RSxjQUFXO0FBQUE7QUFBQSxJQUNiLEdBQ0Esb0NBQUMsZUFBTSxvQ0FBQyxjQUFLLG9CQUFHLEdBQU8sb0NBQUMsY0FBSyxvQkFBRyxDQUFPLENBQ3pDLENBQ0YsQ0FDRjtBQUFBLEVBRUo7OztBQzdHTyxNQUFNLHVCQUF1QjtBQUM3QixNQUFNLHVCQUF1QjtBQUM3QixNQUFNLDJCQUEyQjtBQUVqQyxXQUFTLFlBQVksZ0JBQWdCLE9BQU8sY0FBYyxjQUFjLE9BQU8sV0FBVztBQUpqRztBQUtFLFVBQU0sYUFBVyxvREFBZSxrQkFBZixtQkFBOEIsY0FBWSwrQ0FBZSxhQUFZO0FBQ3RGLFFBQUksUUFBUSxLQUFLLFFBQVEsRUFBRyxRQUFPO0FBQ25DLFdBQU8sc0JBQXNCLE1BQUssK0NBQWUsY0FBYSxFQUFFO0FBQUEsRUFDbEU7QUFFQSxXQUFTLGdCQUFnQixlQUFlO0FBQ3RDLFdBQU87QUFBQSxNQUNMLGlCQUFpQjtBQUFBLE1BQ2pCLHVCQUF1QjtBQUFBLE1BQ3ZCLGNBQWMsWUFBWSxhQUFhO0FBQUEsTUFDdkMsaUJBQWlCO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBRU8sV0FBUyx5QkFBeUIsT0FBTztBQUM5QyxVQUFNLFNBQVMsT0FBTyxLQUFLO0FBQzNCLFFBQUksQ0FBQyxPQUFPLFNBQVMsTUFBTSxFQUFHLFFBQU87QUFDckMsV0FBTyxLQUFLLElBQUksc0JBQXNCLEtBQUssSUFBSSxzQkFBc0IsTUFBTSxDQUFDO0FBQUEsRUFDOUU7QUFFTyxXQUFTLGtCQUFrQjtBQUNoQyxRQUFJO0FBQ0YsYUFBTyxPQUFPLFdBQVcsY0FBYyxPQUFPLE9BQU87QUFBQSxJQUN2RCxTQUFRO0FBQ04sYUFBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBRU8sV0FBUyx3QkFBd0IsYUFBYTtBQUNuRCxXQUFPLHFCQUFxQixXQUFXO0FBQUEsRUFDekM7QUFFTyxXQUFTLGtCQUNkLFNBQ0EsYUFDQSxnQkFBZ0IsT0FBTyxjQUFjLGNBQWMsT0FBTyxXQUMxRDtBQUNBLFVBQU0sV0FBVyxnQkFBZ0IsYUFBYTtBQUM5QyxRQUFJO0FBQ0YsWUFBTSxTQUFTLEtBQUssTUFBTSxtQ0FBUyxRQUFRLHdCQUF3QixXQUFXLEVBQUU7QUFDaEYsVUFBSSxVQUFVLE9BQU8sV0FBVyxVQUFVO0FBQ3hDLGVBQU87QUFBQSxVQUNMLGlCQUFpQixPQUFPLG9CQUFvQjtBQUFBLFVBQzVDLHVCQUF1QixPQUFPLDBCQUEwQjtBQUFBLFVBQ3hELGNBQWMsT0FBTyxPQUFPLGlCQUFpQixZQUN6QyxPQUFPLGVBQ1AsU0FBUztBQUFBLFVBQ2IsaUJBQWlCLHlCQUF5QixPQUFPLGVBQWU7QUFBQSxRQUNsRTtBQUFBLE1BQ0Y7QUFBQSxJQUNGLFNBQVE7QUFBQSxJQUVSO0FBQ0EsV0FBTztBQUFBLEVBQ1Q7QUFFTyxXQUFTLGtCQUFrQixTQUFTLGFBQWEsVUFBVTtBQUNoRSxVQUFNLGFBQWE7QUFBQSxNQUNqQixpQkFBaUIsU0FBUyxvQkFBb0I7QUFBQSxNQUM5Qyx1QkFBdUIsU0FBUywwQkFBMEI7QUFBQSxNQUMxRCxjQUFjLFNBQVMsaUJBQWlCO0FBQUEsTUFDeEMsaUJBQWlCLHlCQUF5QixTQUFTLGVBQWU7QUFBQSxJQUNwRTtBQUNBLFFBQUk7QUFDRix5Q0FBUyxRQUFRLHdCQUF3QixXQUFXLEdBQUcsS0FBSyxVQUFVLFVBQVU7QUFDaEYsYUFBTztBQUFBLElBQ1QsU0FBUTtBQUVOLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRjs7O0FDMUNBLE1BQU0sa0JBQWtCO0FBQUEsSUFDdEIsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLEVBQ1g7QUFFQSxXQUFTLGFBQWEsRUFBRSxPQUFPLFVBQVUsUUFBUSxHQUFHO0FBQ2xELFdBQ0Usb0NBQUMsU0FBSSxXQUFVLHNCQUNiLG9DQUFDLFlBQU8sTUFBSyxVQUFTLE9BQU0sZ0JBQUssU0FBUyxNQUFNLFNBQVMsQ0FBQyxVQUFVLFdBQVcsUUFBUSxHQUFHLENBQUMsS0FBRyxHQUFDLEdBQy9GLG9DQUFDLFVBQUssV0FBVSxtQkFBaUIsS0FBSyxNQUFNLFFBQVEsR0FBRyxHQUFFLEdBQUMsR0FDMUQsb0NBQUMsWUFBTyxNQUFLLFVBQVMsT0FBTSxnQkFBSyxTQUFTLE1BQU0sU0FBUyxDQUFDLFVBQVUsV0FBVyxRQUFRLEdBQUcsQ0FBQyxLQUFHLEdBQUMsR0FDL0Ysb0NBQUMsWUFBTyxNQUFLLFVBQVMsT0FBTSw0QkFBTyxTQUFTLFdBQVMsY0FBRSxDQUN6RDtBQUFBLEVBRUo7QUFHQSxXQUFTLFlBQVksRUFBRSxLQUFLLEdBQUc7QUFDN0IsVUFBTSxRQUFRO0FBQUEsTUFDWixNQUFNLDBEQUFFLG9DQUFDLFVBQUssR0FBRSxZQUFXLEdBQUUsb0NBQUMsVUFBSyxHQUFFLGdEQUErQyxDQUFFO0FBQUEsTUFDdEYsU0FBUywwREFBRSxvQ0FBQyxVQUFLLEdBQUUsaUVBQWdFLEdBQUUsb0NBQUMsVUFBSyxHQUFFLGlCQUFnQixDQUFFO0FBQUEsTUFDL0csWUFBWSwwREFBRSxvQ0FBQyxVQUFLLEdBQUUsMEJBQXlCLEdBQUUsb0NBQUMsVUFBSyxHQUFFLDRCQUEyQixHQUFFLG9DQUFDLFVBQUssR0FBRSwyQkFBMEIsR0FBRSxvQ0FBQyxVQUFLLEdBQUUsNkJBQTRCLENBQUU7QUFBQSxNQUNoSyxRQUFRLDBEQUFFLG9DQUFDLFVBQUssR0FBRSxpQkFBZ0IsR0FBRSxvQ0FBQyxVQUFLLEdBQUUsZ0JBQWUsQ0FBRTtBQUFBLE1BQzdELFVBQVUsMERBQUUsb0NBQUMsVUFBSyxHQUFFLGlCQUFnQixHQUFFLG9DQUFDLFVBQUssR0FBRSxnQkFBZSxDQUFFO0FBQUEsTUFDL0QsZUFBZSwwREFBRSxvQ0FBQyxVQUFLLEdBQUUsV0FBVSxHQUFFLG9DQUFDLFVBQUssR0FBRSxrQkFBaUIsQ0FBRTtBQUFBLE1BQ2hFLGlCQUFpQiwwREFBRSxvQ0FBQyxVQUFLLEdBQUUsWUFBVyxHQUFFLG9DQUFDLFVBQUssR0FBRSxpQkFBZ0IsQ0FBRTtBQUFBLE1BQ2xFLFVBQVUsMERBQUUsb0NBQUMsVUFBSyxHQUFFLFlBQVcsR0FBRSxvQ0FBQyxVQUFLLEdBQUUsaUJBQWdCLEdBQUUsb0NBQUMsVUFBSyxHQUFFLFlBQVcsQ0FBRTtBQUFBLE1BQ2hGLFVBQVUsMERBQUUsb0NBQUMsWUFBTyxJQUFHLE1BQUssSUFBRyxNQUFLLEdBQUUsS0FBSSxHQUFFLG9DQUFDLFVBQUssR0FBRSx3akJBQXVqQixDQUFFO0FBQUEsTUFDN21CLE1BQU0sMERBQUUsb0NBQUMsWUFBTyxJQUFHLE1BQUssSUFBRyxNQUFLLEdBQUUsS0FBSSxHQUFFLG9DQUFDLFVBQUssR0FBRSxrREFBaUQsR0FBRSxvQ0FBQyxVQUFLLEdBQUUsY0FBYSxDQUFFO0FBQUEsSUFDNUg7QUFFQSxXQUNFLG9DQUFDLFNBQUksV0FBVSxtQkFBa0IsU0FBUSxhQUFZLGVBQVksVUFDOUQsTUFBTSxJQUFJLENBQ2I7QUFBQSxFQUVKO0FBR0EsV0FBUyxTQUFTLEVBQUUsS0FBSyxHQUFHO0FBQzFCLFdBQ0Usb0NBQUMsU0FBSSxXQUFVLGdCQUFlLFNBQVEsYUFBWSxPQUFNLE1BQUssUUFBTyxNQUFLLGVBQVksVUFDbEY7QUFBQTtBQUFBLE1BRUM7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLEdBQUU7QUFBQSxVQUNGLE1BQUs7QUFBQSxVQUNMLFFBQU87QUFBQSxVQUNQLGFBQVk7QUFBQSxVQUNaLGVBQWM7QUFBQTtBQUFBLE1BQ2hCO0FBQUEsUUFFQTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsR0FBRTtBQUFBLFFBQ0YsTUFBSztBQUFBLFFBQ0wsUUFBTztBQUFBLFFBQ1AsYUFBWTtBQUFBLFFBQ1osZUFBYztBQUFBO0FBQUEsSUFDaEIsR0FFRixvQ0FBQyxVQUFLLEdBQUUsUUFBTyxHQUFFLFFBQU8sT0FBTSxPQUFNLFFBQU8sT0FBTSxJQUFHLFFBQU8sTUFBSyxnQkFBZSxDQUNqRjtBQUFBLEVBRUo7QUFHQSxXQUFTLGdCQUFnQixFQUFFLGFBQWEsU0FBUyxHQUFHO0FBQ2xELFVBQU0sbUJBQW1CLHNCQUFzQjtBQUMvQyxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLGNBQWMsd0JBQXdCO0FBQUEsUUFDakQsU0FBUztBQUFBLFFBQ1QsZ0JBQWMsQ0FBQztBQUFBLFFBQ2YsT0FBTyxjQUNILGtMQUFpQyxnQkFBZ0IsT0FDakQsMEdBQXFCLGdCQUFnQjtBQUFBO0FBQUEsTUFFekMsb0NBQUMsWUFBUyxNQUFNLGFBQWE7QUFBQSxNQUM3QixvQ0FBQyxjQUFNLGNBQWMsdUJBQVEsMEJBQU87QUFBQSxJQUN0QztBQUFBLEVBRUo7QUFFQSxXQUFTLHVCQUF1QjtBQUM5QixXQUFPLFNBQVMscUJBQXFCLFNBQVMsMkJBQTJCO0FBQUEsRUFDM0U7QUFFQSxXQUFTLHVCQUF1QixJQUFJO0FBQ2xDLFVBQU0sVUFBVSxPQUFPLEdBQUcscUJBQXFCLEdBQUc7QUFDbEQsUUFBSSxDQUFDLFFBQVMsUUFBTyxRQUFRLFFBQVE7QUFDckMsV0FBTyxRQUFRLFFBQVEsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sTUFBTTtBQUFBLElBQUMsQ0FBQztBQUFBLEVBQ3pEO0FBRUEsV0FBUyxzQkFBc0I7QUFDN0IsUUFBSSxDQUFDLHFCQUFxQixFQUFHLFFBQU8sUUFBUSxRQUFRO0FBQ3BELFVBQU0sT0FBTyxTQUFTLGtCQUFrQixTQUFTO0FBQ2pELFFBQUksQ0FBQyxLQUFNLFFBQU8sUUFBUSxRQUFRO0FBQ2xDLFdBQU8sUUFBUSxRQUFRLEtBQUssS0FBSyxRQUFRLENBQUMsRUFBRSxNQUFNLE1BQU07QUFBQSxJQUFDLENBQUM7QUFBQSxFQUM1RDtBQUVPLFdBQVMsTUFBTSxFQUFFLFNBQUFDLFNBQVEsR0FBRztBQUNqQyxVQUFNO0FBQUEsTUFDSjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLElBQUksYUFBYTtBQUNqQixVQUFNLGdCQUFnQixXQUFXQSxTQUFRLE9BQU87QUFDaEQsVUFBTSxrQkFBa0IsT0FBTyxLQUFLQSxTQUFRLFNBQVM7QUFDckQsVUFBTSxnQkFBZ0JBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLE9BQU8sZUFBZTtBQUNwRixVQUFNLG1CQUFtQixzQkFBc0I7QUFFL0MsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU07QUFBQSxNQUMxQyxNQUFNLElBQUksSUFBSUEsU0FBUSxRQUFRLElBQUksQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDO0FBQUEsSUFDMUQ7QUFDQSxVQUFNLENBQUMsYUFBYSxjQUFjLElBQUksTUFBTSxTQUFTLENBQUM7QUFDdEQsVUFBTSxDQUFDLFdBQVcsWUFBWSxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQ2xELFVBQU0sQ0FBQyxrQkFBa0IsbUJBQW1CLElBQUksTUFBTSxTQUFTLENBQUM7QUFDaEUsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU0sU0FBUyxJQUFJO0FBQ3pELFVBQU0sQ0FBQyxXQUFXLFlBQVksSUFBSSxNQUFNLFNBQVMsS0FBSztBQUN0RCxVQUFNLENBQUMsaUJBQWlCLGtCQUFrQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ2xFLFVBQU0sQ0FBQyxhQUFhLGNBQWMsSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUN6RCxVQUFNLENBQUMsV0FBVyxZQUFZLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDdEQsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU0sU0FBUyxNQUFNLG9CQUFJLElBQUksQ0FBQztBQUNwRSxVQUFNLENBQUMsV0FBVyxZQUFZLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDdEQsVUFBTSxDQUFDLDBCQUEwQiwyQkFBMkIsSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUNuRixVQUFNLENBQUMsbUJBQW1CLG9CQUFvQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3RFLFVBQU0sQ0FBQyxlQUFlLGdCQUFnQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQzlELFVBQU0sQ0FBQyxZQUFZLGFBQWEsSUFBSSxNQUFNLFNBQVMsUUFBUTtBQUMzRCxVQUFNLENBQUMsb0JBQW9CLHFCQUFxQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3hFLFVBQU0sQ0FBQyxrQkFBa0IsbUJBQW1CLElBQUksTUFBTSxTQUFTLENBQUMsQ0FBQztBQUNqRSxVQUFNLENBQUMsbUJBQW1CLG9CQUFvQixJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3RFLFVBQU0sQ0FBQyxhQUFhLGNBQWMsSUFBSSxNQUFNLFNBQVMsQ0FBQyxDQUFDO0FBQ3ZELFVBQU0saUJBQWlCLE1BQU0sUUFBUSxNQUFNLGdCQUFnQkEsUUFBTyxHQUFHLENBQUNBLFFBQU8sQ0FBQztBQUM5RSxVQUFNLENBQUMsc0JBQXNCLHVCQUF1QixJQUFJLE1BQU07QUFBQSxNQUM1RCxNQUFNLG9CQUFvQixxQkFBcUIsR0FBR0EsUUFBTyxFQUFFO0FBQUEsSUFDN0Q7QUFDQSxVQUFNLENBQUMsd0JBQXdCLHlCQUF5QixJQUFJLE1BQU0sU0FBUyxJQUFJO0FBQy9FLFVBQU0sQ0FBQyxhQUFhLGNBQWMsSUFBSSxNQUFNLFNBQVMsS0FBSztBQUMxRCxVQUFNLENBQUMsb0JBQW9CLHFCQUFxQixJQUFJLE1BQU07QUFBQSxNQUN4RCxNQUFNLGtCQUFrQixnQkFBZ0IsR0FBR0EsU0FBUSxJQUFJLEVBQUU7QUFBQSxJQUMzRDtBQUNBLFVBQU0sQ0FBQyx1QkFBdUIsd0JBQXdCLElBQUksTUFBTTtBQUFBLE1BQzlELE1BQU0sa0JBQWtCLGdCQUFnQixHQUFHQSxTQUFRLElBQUksRUFBRTtBQUFBLElBQzNEO0FBQ0EsVUFBTSxDQUFDLGNBQWMsZUFBZSxJQUFJLE1BQU07QUFBQSxNQUM1QyxNQUFNLGtCQUFrQixnQkFBZ0IsR0FBR0EsU0FBUSxJQUFJLEVBQUU7QUFBQSxJQUMzRDtBQUNBLFVBQU0sQ0FBQyxpQkFBaUIsa0JBQWtCLElBQUksTUFBTTtBQUFBLE1BQ2xELE1BQU0sa0JBQWtCLGdCQUFnQixHQUFHQSxTQUFRLElBQUksRUFBRTtBQUFBLElBQzNEO0FBQ0EsVUFBTSxDQUFDLHFCQUFxQixzQkFBc0IsSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUN6RSxVQUFNLFdBQVcsTUFBTSxPQUFPLElBQUk7QUFDbEMsVUFBTSw0QkFBNEIsTUFBTSxPQUFPLG9CQUFJLElBQUksQ0FBQztBQUN4RCxVQUFNLDRCQUE0QixNQUFNLE9BQU8sSUFBSTtBQUVuRCxVQUFNLGVBQWUsQ0FBQyxlQUFlO0FBQ3JDLFVBQU0sZUFBZUEsU0FBUSxRQUFRLElBQUksQ0FBQyxXQUFXLE9BQU8sRUFBRTtBQUM5RCxVQUFNLFNBQVMsU0FBUyxVQUFVO0FBQ2xDLFVBQU0sY0FBYyxTQUFTLFlBQVk7QUFDekMsVUFBTSxpQkFBaUIsU0FBUyxlQUFlO0FBQy9DLFVBQU0sbUJBQW1CLEVBQUUsY0FBYyxjQUFjLGFBQWEsZ0JBQWdCO0FBQ3BGLFVBQU0sY0FBYyxNQUFNO0FBQUEsTUFDeEIsTUFBTSwwQkFBMEIsZ0JBQWdCLG9CQUFvQjtBQUFBLE1BQ3BFLENBQUMsZ0JBQWdCLG9CQUFvQjtBQUFBLElBQ3ZDO0FBRUEsVUFBTSx1QkFBdUIsTUFBTSxZQUFZLE1BQU07QUFDbkQsaUJBQVcsV0FBVywwQkFBMEIsU0FBUztBQUN2RCxnQkFBUSxVQUFVLE9BQU8sb0JBQW9CO0FBQUEsTUFDL0M7QUFDQSxnQ0FBMEIsUUFBUSxNQUFNO0FBQ3hDLDBCQUFvQixDQUFDLENBQUM7QUFBQSxJQUN4QixHQUFHLENBQUMsQ0FBQztBQUVMLFVBQU0sc0JBQXNCLE1BQU0sWUFBWSxDQUFDLFNBQVMsUUFBUSxhQUFhLFVBQVUsQ0FBQyxNQUFNO0FBQzVGLFlBQU0sVUFBVSxpQkFBaUIsaUJBQWlCLFNBQVMsQ0FBQztBQUM1RCxZQUFNLGVBQWUsVUFBVUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxTQUFTLEtBQUssUUFBTyxtQ0FBUyxTQUFRO0FBQzNGLFlBQU0sYUFBYSxnQkFBZSxtQ0FBUztBQUMzQyxVQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLFdBQVk7QUFDOUMsWUFBTSxnQkFBZ0Isc0JBQXNCLFNBQVMsWUFBWSxZQUFZO0FBQzdFLFlBQU0sV0FBVyxlQUFlLGFBQWEscUJBQXFCLFFBQVE7QUFDMUUsNEJBQXNCLElBQUk7QUFFMUIsMEJBQW9CLENBQUMsWUFBWTtBQUMvQixZQUFJLFFBQVEsZ0JBQWdCO0FBQzFCLGtCQUFRLGVBQWUsVUFBVSxPQUFPLG9CQUFvQjtBQUM1RCxvQ0FBMEIsUUFBUSxPQUFPLFFBQVEsY0FBYztBQUMvRCxjQUFJLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxZQUFZLFdBQVcsS0FBSyxZQUFZLFFBQVEsY0FBYyxHQUFHO0FBQy9GLG1CQUFPLFFBQVEsT0FBTyxDQUFDLFNBQVMsS0FBSyxZQUFZLFFBQVEsY0FBYztBQUFBLFVBQ3pFO0FBQ0Esa0JBQVEsVUFBVSxJQUFJLG9CQUFvQjtBQUMxQyxvQ0FBMEIsUUFBUSxJQUFJLE9BQU87QUFDN0MsaUJBQU8sUUFBUSxJQUFJLENBQUMsU0FBUyxLQUFLLFlBQVksUUFBUSxpQkFBaUIsZ0JBQWdCLElBQUk7QUFBQSxRQUM3RjtBQUNBLGNBQU0sa0JBQWtCLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxZQUFZLE9BQU87QUFDdkUsWUFBSSxDQUFDLFVBQVU7QUFDYixxQkFBVyxtQkFBbUIsMEJBQTBCLFNBQVM7QUFDL0QsNEJBQWdCLFVBQVUsT0FBTyxvQkFBb0I7QUFBQSxVQUN2RDtBQUNBLG9DQUEwQixRQUFRLE1BQU07QUFBQSxRQUMxQyxXQUFXLGlCQUFpQjtBQUMxQixrQkFBUSxVQUFVLE9BQU8sb0JBQW9CO0FBQzdDLG9DQUEwQixRQUFRLE9BQU8sT0FBTztBQUNoRCxpQkFBTyxRQUFRLE9BQU8sQ0FBQyxTQUFTLEtBQUssWUFBWSxPQUFPO0FBQUEsUUFDMUQ7QUFFQSxnQkFBUSxVQUFVLElBQUksb0JBQW9CO0FBQzFDLGtDQUEwQixRQUFRLElBQUksT0FBTztBQUM3QyxlQUFPLFdBQVcsQ0FBQyxHQUFHLFNBQVMsYUFBYSxJQUFJLENBQUMsYUFBYTtBQUFBLE1BQ2hFLENBQUM7QUFBQSxJQUNILEdBQUcsQ0FBQ0EsU0FBUSxTQUFTLG1CQUFtQixrQkFBa0IsVUFBVSxDQUFDO0FBRXJFLFVBQU0sd0JBQXdCLE1BQU0sWUFBWSxDQUFDLFlBQVk7QUFDM0QseUNBQVMsVUFBVSxPQUFPO0FBQzFCLGdDQUEwQixRQUFRLE9BQU8sT0FBTztBQUNoRCwwQkFBb0IsQ0FBQyxZQUFZLFFBQVEsT0FBTyxDQUFDLFNBQVMsS0FBSyxZQUFZLE9BQU8sQ0FBQztBQUFBLElBQ3JGLEdBQUcsQ0FBQyxDQUFDO0FBRUwsVUFBTSxjQUFjLE1BQU0sWUFBWSxNQUFNO0FBcFE5QztBQXFRSSx1QkFBaUIsS0FBSztBQUN0Qiw0QkFBc0IsS0FBSztBQUMzQixzQ0FBMEIsWUFBMUIsbUJBQW1DLFVBQVUsT0FBTztBQUNwRCxnQ0FBMEIsVUFBVTtBQUNwQywyQkFBcUI7QUFBQSxJQUN2QixHQUFHLENBQUMsb0JBQW9CLENBQUM7QUFFekIsVUFBTSx3QkFBd0IsTUFBTSxZQUFZLENBQUMsWUFBWTtBQTVRL0Q7QUE2UUksc0NBQTBCLFlBQTFCLG1CQUFtQyxVQUFVLE9BQU87QUFDcEQsZ0NBQTBCLFVBQVUsV0FBVztBQUMvQyxzQ0FBMEIsWUFBMUIsbUJBQW1DLFVBQVUsSUFBSTtBQUFBLElBQ25ELEdBQUcsQ0FBQyxDQUFDO0FBRUwsVUFBTSxlQUFlLE1BQU0sWUFBWSxDQUFDLE9BQU8sYUFBYTtBQUMxRCxVQUFJLGlCQUFpQixlQUFlLE1BQU07QUFDeEMsb0JBQVk7QUFDWjtBQUFBLE1BQ0Y7QUFDQSxxQkFBZSxJQUFJO0FBQ25CLDJCQUFxQixLQUFLO0FBQzFCLG9CQUFjLElBQUk7QUFDbEIsNEJBQXNCLFNBQVMsWUFBWTtBQUMzQyx1QkFBaUIsSUFBSTtBQUFBLElBQ3ZCLEdBQUcsQ0FBQyxhQUFhLGVBQWUsVUFBVSxDQUFDO0FBRTNDLFVBQU0sa0JBQWtCLE1BQU07QUFDNUIscUJBQWUsSUFBSTtBQUNuQixvQkFBYyxRQUFRO0FBQ3RCLHVCQUFpQixJQUFJO0FBQ3JCLDRCQUFzQixJQUFJO0FBQUEsSUFDNUI7QUFFQSxVQUFNLHNCQUFzQixDQUFDLGVBQWU7QUFDMUMscUJBQWUsSUFBSTtBQUNuQixvQkFBYyxZQUFZO0FBQzFCLHVCQUFpQixJQUFJO0FBQ3JCLDRCQUFzQixJQUFJO0FBQzFCLFVBQUkseUNBQVksU0FBVSxhQUFZLFdBQVcsUUFBUTtBQUFBLElBQzNEO0FBRUEsVUFBTSxtQkFBbUIsTUFBTSxZQUFZLE1BQU07QUFDL0MsNEJBQXNCLEtBQUs7QUFDM0IsNEJBQXNCLElBQUk7QUFBQSxJQUM1QixHQUFHLENBQUMscUJBQXFCLENBQUM7QUFFMUIsVUFBTSxnQkFBZ0IsQ0FBQyxTQUFTO0FBQzlCLHFCQUFlLENBQUMsWUFBWTtBQUFBLFFBQzFCLEdBQUc7QUFBQSxRQUNILEVBQUUsR0FBRyxNQUFNLElBQUksVUFBVSxLQUFLLElBQUksQ0FBQyxJQUFJLFFBQVEsU0FBUyxDQUFDLEdBQUc7QUFBQSxNQUM5RCxDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sbUJBQW1CLENBQUMsT0FBTztBQUMvQixxQkFBZSxDQUFDLFlBQVksUUFBUSxPQUFPLENBQUMsU0FBUyxLQUFLLE9BQU8sRUFBRSxDQUFDO0FBQUEsSUFDdEU7QUFFQSxVQUFNLG1CQUFtQixNQUFNLFlBQVksQ0FBQyxlQUFlO0FBQ3pELDhCQUF3QixDQUFDLFlBQ3ZCLDBCQUEwQixnQkFBZ0IsU0FBUyxVQUFVLENBQzlEO0FBQUEsSUFDSCxHQUFHLENBQUMsY0FBYyxDQUFDO0FBRW5CLFVBQU0sbUJBQW1CLE1BQU0sWUFBWSxDQUFDLE9BQU87QUFDakQsOEJBQXdCLENBQUMsWUFDdkIsMEJBQTBCLGdCQUFnQixTQUFTLEVBQUUsQ0FDdEQ7QUFBQSxJQUNILEdBQUcsQ0FBQyxjQUFjLENBQUM7QUFFbkIsVUFBTSxvQkFBb0IsTUFBTSxZQUFZLENBQUMsVUFBVSxxQkFBcUIsQ0FBQyxNQUFNO0FBQ2pGLDhCQUF3QixDQUFDLFlBQVk7QUFDbkMsWUFBSSxPQUFPLFNBQVM7QUFBQSxVQUNsQixDQUFDLFlBQVksZUFBZSwwQkFBMEIsZ0JBQWdCLFlBQVksVUFBVTtBQUFBLFVBQzVGO0FBQUEsUUFDRjtBQUNBLG1CQUFXLGFBQWEsb0JBQW9CO0FBQzFDLGNBQUksVUFBVSxPQUFPLFVBQVU7QUFDN0IsbUJBQU8sMEJBQTBCLGdCQUFnQixNQUFNLFVBQVUsRUFBRTtBQUFBLFVBQ3JFLFdBQVcsVUFBVSxPQUFPLFVBQVU7QUFDcEMsbUJBQU8sMEJBQTBCLGdCQUFnQixNQUFNLFVBQVUsVUFBVTtBQUFBLFVBQzdFO0FBQUEsUUFDRjtBQUNBLGVBQU87QUFBQSxNQUNULENBQUM7QUFBQSxJQUNILEdBQUcsQ0FBQyxjQUFjLENBQUM7QUFFbkIsVUFBTSx1QkFBdUIsTUFBTSxZQUFZLE1BQU0sd0JBQXdCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUVwRixVQUFNLFVBQVUsTUFBTSxNQUFNO0FBNVY5QjtBQTZWSSxpQkFBVyxXQUFXLDBCQUEwQixTQUFTO0FBQ3ZELGdCQUFRLFVBQVUsT0FBTyxvQkFBb0I7QUFBQSxNQUMvQztBQUNBLHNDQUEwQixZQUExQixtQkFBbUMsVUFBVSxPQUFPO0FBQUEsSUFDdEQsR0FBRyxDQUFDLENBQUM7QUFFTCxVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLENBQUMsY0FBZTtBQUNwQiwyQkFBcUI7QUFDckIsNEJBQXNCLElBQUk7QUFDMUIsNEJBQXNCLEtBQUs7QUFBQSxJQUM3QixHQUFHLENBQUMsc0JBQXNCLHVCQUF1QixNQUFNLFdBQVcsQ0FBQztBQUVuRSxVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLFlBQVksV0FBVyxFQUFHLFFBQU87QUFDckMsYUFBTyxpQkFBaUIsZ0JBQWdCLHdCQUF3QjtBQUNoRSxhQUFPLE1BQU0sT0FBTyxvQkFBb0IsZ0JBQWdCLHdCQUF3QjtBQUFBLElBQ2xGLEdBQUcsQ0FBQyxZQUFZLE1BQU0sQ0FBQztBQUV2QixVQUFNLFVBQVUsTUFBTTtBQUNwQixZQUFNLFFBQVEsb0JBQW9CLHFCQUFxQixHQUFHQSxRQUFPO0FBQ2pFLDhCQUF3QixNQUFNLFVBQVU7QUFBQSxJQUMxQyxHQUFHLENBQUNBLFFBQU8sQ0FBQztBQUVaLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLGdDQUEwQjtBQUFBLFFBQ3hCLHFCQUFxQjtBQUFBLFFBQ3JCQTtBQUFBLFFBQ0E7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILEdBQUcsQ0FBQyxzQkFBc0JBLFFBQU8sQ0FBQztBQUVsQyxVQUFNLFVBQVUsTUFBTTtBQUNwQixVQUFJLENBQUMscUJBQXFCLFVBQVUsdUJBQXdCLFFBQU87QUFDbkUsYUFBTyxpQkFBaUIsZ0JBQWdCLDRCQUE0QjtBQUNwRSxhQUFPLE1BQU0sT0FBTyxvQkFBb0IsZ0JBQWdCLDRCQUE0QjtBQUFBLElBQ3RGLEdBQUcsQ0FBQyxxQkFBcUIsUUFBUSxzQkFBc0IsQ0FBQztBQUV4RCxVQUFNLGdCQUFnQixNQUFNLFlBQVksTUFBTTtBQUM1QyxtQkFBYSxLQUFLO0FBQ2xCLGtDQUE0QixJQUFJO0FBQ2hDLDBCQUFvQjtBQUFBLElBQ3RCLEdBQUcsQ0FBQyxDQUFDO0FBRUwsVUFBTSxpQkFBaUIsTUFBTSxZQUFZLE1BQU07QUFDN0Msa0JBQVk7QUFDWixxQkFBZSxLQUFLO0FBQ3BCLGtDQUE0QixJQUFJO0FBQ2hDLG1CQUFhLElBQUk7QUFBQSxJQUNuQixHQUFHLENBQUMsV0FBVyxDQUFDO0FBRWhCLFVBQU0sa0JBQWtCLE1BQU0sWUFBWSxNQUFNO0FBQzlDLFVBQUksVUFBVyxlQUFjO0FBQUEsVUFDeEIsZ0JBQWU7QUFBQSxJQUN0QixHQUFHLENBQUMsZ0JBQWdCLGVBQWUsU0FBUyxDQUFDO0FBRTdDLFVBQU0sMEJBQTBCLE1BQU0sWUFBWSxNQUFNO0FBQ3RELFVBQUkscUJBQXFCLEdBQUc7QUFDMUIsNEJBQW9CO0FBQ3BCO0FBQUEsTUFDRjtBQUNBLGtCQUFZO0FBQ1oscUJBQWUsS0FBSztBQUNwQixrQ0FBNEIsSUFBSTtBQUNoQyxtQkFBYSxJQUFJO0FBQ2pCLDZCQUF1QixTQUFTLE9BQU87QUFBQSxJQUN6QyxHQUFHLENBQUMsV0FBVyxDQUFDO0FBRWhCLFVBQU0sMkJBQTJCLE1BQU0sWUFBWSxDQUFDLFlBQVk7QUFDOUQsNEJBQXNCLE9BQU87QUFDN0Isd0JBQWtCLGdCQUFnQixHQUFHQSxTQUFRLE1BQU07QUFBQSxRQUNqRCxpQkFBaUI7QUFBQSxRQUNqQjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSCxHQUFHLENBQUNBLFNBQVEsTUFBTSx1QkFBdUIsY0FBYyxlQUFlLENBQUM7QUFFdkUsVUFBTSw4QkFBOEIsTUFBTSxZQUFZLENBQUMsWUFBWTtBQUNqRSwrQkFBeUIsT0FBTztBQUNoQyx3QkFBa0IsZ0JBQWdCLEdBQUdBLFNBQVEsTUFBTTtBQUFBLFFBQ2pELGlCQUFpQjtBQUFBLFFBQ2pCLHVCQUF1QjtBQUFBLFFBQ3ZCO0FBQUEsUUFDQTtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsR0FBRyxDQUFDLG9CQUFvQkEsU0FBUSxNQUFNLGNBQWMsZUFBZSxDQUFDO0FBRXBFLFVBQU0scUJBQXFCLE1BQU0sWUFBWSxDQUFDLFlBQVk7QUFDeEQsc0JBQWdCLE9BQU87QUFDdkIsd0JBQWtCLGdCQUFnQixHQUFHQSxTQUFRLE1BQU07QUFBQSxRQUNqRCxpQkFBaUI7QUFBQSxRQUNqQjtBQUFBLFFBQ0EsY0FBYztBQUFBLFFBQ2Q7QUFBQSxNQUNGLENBQUM7QUFBQSxJQUNILEdBQUcsQ0FBQyxvQkFBb0JBLFNBQVEsTUFBTSx1QkFBdUIsZUFBZSxDQUFDO0FBRTdFLFVBQU0sd0JBQXdCLE1BQU0sWUFBWSxDQUFDLFVBQVU7QUFDekQsWUFBTSxhQUFhLHlCQUF5QixLQUFLO0FBQ2pELHlCQUFtQixVQUFVO0FBQzdCLHdCQUFrQixnQkFBZ0IsR0FBR0EsU0FBUSxNQUFNO0FBQUEsUUFDakQsaUJBQWlCO0FBQUEsUUFDakI7QUFBQSxRQUNBO0FBQUEsUUFDQSxpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSCxHQUFHLENBQUMsb0JBQW9CQSxTQUFRLE1BQU0sdUJBQXVCLFlBQVksQ0FBQztBQUkxRSxVQUFNLGdDQUFnQyxNQUFNLE9BQU8sSUFBSTtBQUN2RCxVQUFNLFVBQVUsTUFBTTtBQUNwQixZQUFNLFdBQVcsa0JBQWtCLGdCQUFnQixHQUFHQSxTQUFRLElBQUk7QUFDbEUsNEJBQXNCLFNBQVMsZUFBZTtBQUM5QywrQkFBeUIsU0FBUyxxQkFBcUI7QUFDdkQsc0JBQWdCLFNBQVMsWUFBWTtBQUNyQyx5QkFBbUIsU0FBUyxlQUFlO0FBQzNDLFlBQU0sZUFBZSw4QkFBOEI7QUFDbkQsb0NBQThCLFVBQVVBLFNBQVE7QUFDaEQsVUFBSSxnQkFBZ0IsUUFBUSxpQkFBaUJBLFNBQVEsTUFBTTtBQUN6RCwrQkFBdUIsSUFBSTtBQUFBLE1BQzdCO0FBQUEsSUFDRixHQUFHLENBQUNBLFNBQVEsSUFBSSxDQUFDO0FBRWpCLFVBQU0sVUFBVSxNQUFNO0FBQ3BCLHFCQUFlLG9CQUFJLElBQUksQ0FBQztBQUFBLElBQzFCLEdBQUcsQ0FBQyxXQUFXLENBQUM7QUFFaEIsVUFBTSxlQUFlLENBQUMsT0FBTztBQUMzQixxQkFBZSxDQUFDLFlBQVk7QUFDMUIsY0FBTSxPQUFPLElBQUksSUFBSSxPQUFPO0FBQzVCLFlBQUksS0FBSyxJQUFJLEVBQUUsRUFBRyxNQUFLLE9BQU8sRUFBRTtBQUFBLFlBQzNCLE1BQUssSUFBSSxFQUFFO0FBQ2hCLGVBQU87QUFBQSxNQUNULENBQUM7QUFBQSxJQUNIO0FBRUEsVUFBTSxnQkFBZ0IsQ0FBQyxpQkFBaUI7QUFDdEMsWUFBTSxVQUFVLHFCQUFxQixhQUFhLFlBQVk7QUFDOUQscUJBQWUsQ0FBQyxZQUFZO0FBQzFCLGNBQU0sT0FBTyxJQUFJLElBQUksT0FBTztBQUM1QixtQkFBVyxNQUFNLFNBQVM7QUFDeEIsY0FBSSxhQUFjLE1BQUssSUFBSSxFQUFFO0FBQUEsY0FDeEIsTUFBSyxPQUFPLEVBQUU7QUFBQSxRQUNyQjtBQUNBLGVBQU87QUFBQSxNQUNULENBQUM7QUFBQSxJQUNIO0FBRUEsVUFBTSxVQUFVLE1BQU07QUFDcEIsWUFBTSxPQUFPLENBQUMsVUFBVTtBQUN0QixZQUFJLE1BQU0sU0FBUyxXQUFXLENBQUMsTUFBTSxVQUFVLENBQUMseUJBQXlCLE1BQU0sTUFBTSxHQUFHO0FBQ3RGLGdCQUFNLGVBQWU7QUFDckIsdUJBQWEsSUFBSTtBQUNqQjtBQUFBLFFBQ0Y7QUFFQSxjQUFNLFdBQVcsbUJBQW1CLEtBQUs7QUFDekMsWUFBSSxDQUFDLFNBQVU7QUFDZixZQUFJLGFBQWEsWUFBWSx5QkFBeUIsTUFBTSxNQUFNLEVBQUc7QUFFckUsWUFBSSxhQUFhLFVBQVUsQ0FBQyxjQUFlO0FBQzNDLFlBQUksYUFBYSxjQUFjLENBQUMsT0FBUTtBQUN4QyxZQUFJLGFBQWEsWUFBWSxxQkFBcUIsRUFBRztBQUNyRCxjQUFNLGVBQWU7QUFFckIsWUFBSSxhQUFhLFNBQVUsU0FBUSxRQUFRO0FBQzNDLFlBQUksYUFBYSxPQUFRLFNBQVEsTUFBTTtBQUN2QyxZQUFJLGFBQWEsY0FBZSxnQkFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQ2hFLFlBQUksYUFBYSxTQUFVLGNBQWE7QUFDeEMsWUFBSSxhQUFhLFlBQWEsaUJBQWdCO0FBQzlDLFlBQUksYUFBYSxxQkFBc0IseUJBQXdCO0FBQy9ELFlBQUksYUFBYSxXQUFZLG9CQUFtQixDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQ2pFLFlBQUksYUFBYSxRQUFRO0FBQ3ZCLHlCQUFlLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQSxRQUNsQztBQUNBLFlBQUksYUFBYSxVQUFVO0FBQ3pCLGNBQUksWUFBYSxnQkFBZSxLQUFLO0FBQUEsbUJBQzVCLGNBQWUsYUFBWTtBQUFBLG1CQUMzQixVQUFXLGVBQWM7QUFBQSxRQUNwQztBQUFBLE1BQ0Y7QUFDQSxZQUFNLEtBQUssQ0FBQyxVQUFVO0FBQ3BCLFlBQUksTUFBTSxTQUFTLFFBQVMsY0FBYSxLQUFLO0FBQUEsTUFDaEQ7QUFDQSxhQUFPLGlCQUFpQixXQUFXLElBQUk7QUFDdkMsYUFBTyxpQkFBaUIsU0FBUyxFQUFFO0FBQ25DLGFBQU8sTUFBTTtBQUNYLGVBQU8sb0JBQW9CLFdBQVcsSUFBSTtBQUMxQyxlQUFPLG9CQUFvQixTQUFTLEVBQUU7QUFBQSxNQUN4QztBQUFBLElBQ0YsR0FBRztBQUFBLE1BQ0Q7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRixDQUFDO0FBRUQsVUFBTSxVQUFVLE1BQU07QUFDcEIsVUFBSSxTQUFTLE9BQVEsb0JBQW1CLEtBQUs7QUFBQSxJQUMvQyxHQUFHLENBQUMsSUFBSSxDQUFDO0FBRVQsVUFBTSxVQUFVLE1BQU07QUFDcEIsWUFBTSxPQUFPLE1BQU0scUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztBQUNoRSxlQUFTLGlCQUFpQixvQkFBb0IsSUFBSTtBQUNsRCxlQUFTLGlCQUFpQiwwQkFBMEIsSUFBSTtBQUN4RCxhQUFPLE1BQU07QUFDWCxpQkFBUyxvQkFBb0Isb0JBQW9CLElBQUk7QUFDckQsaUJBQVMsb0JBQW9CLDBCQUEwQixJQUFJO0FBQUEsTUFDN0Q7QUFBQSxJQUNGLEdBQUcsQ0FBQyxDQUFDO0FBRUwsVUFBTSxZQUFZLENBQUMsUUFBUSxzQkFBc0IsWUFBWTtBQUMzRCxtQkFBYSxJQUFJO0FBQ2pCLFVBQUk7QUFDRixjQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTztBQUM5QixnQkFBTSxTQUFTQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLEVBQUU7QUFDNUQsaUJBQU87QUFBQSxZQUNMO0FBQUEsWUFDQSxPQUFPLE9BQU87QUFBQSxZQUNkLFNBQVMsU0FBUyxjQUFjLG9CQUFvQixFQUFFLHVCQUF1QjtBQUFBLFlBQzdFO0FBQUEsWUFDQSxVQUFVLFlBQVksSUFBSSxFQUFFO0FBQUEsWUFDNUIsYUFBYUEsU0FBUTtBQUFBLFVBQ3ZCO0FBQUEsUUFDRixDQUFDO0FBQ0QsY0FBTSxlQUFlLE9BQU87QUFBQSxNQUM5QixVQUFFO0FBQ0EscUJBQWEsS0FBSztBQUFBLE1BQ3BCO0FBQUEsSUFDRixHQUFHLGNBQWM7QUFFakIsVUFBTSxZQUFZLE1BQU07QUFDdEIsWUFBTTtBQUNOLHlCQUFtQixLQUFLO0FBQUEsSUFDMUI7QUFFQSxVQUFNLGdCQUFnQixNQUFNO0FBQzFCLDBCQUFvQixDQUFDLFVBQVUsUUFBUSxDQUFDO0FBQUEsSUFDMUM7QUFFQSxVQUFNLGtCQUFrQixTQUFTLGdCQUFnQixNQUFNLGVBQWUsQ0FBQztBQUV2RSxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxLQUFLO0FBQUEsUUFDTCxXQUFXLFdBQVcsWUFBWSxrQkFBa0IsRUFBRSxHQUFHLGdCQUFnQixrQkFBa0IsRUFBRTtBQUFBO0FBQUEsTUFFN0Ysb0NBQUMsWUFBTyxXQUFVLHNCQUNoQixvQ0FBQyxTQUFJLFdBQVUscUJBQ2Isb0NBQUMsUUFBRyxXQUFVLHFCQUFtQkEsU0FBUSxJQUFLLEdBQzlDLG9DQUFDLFVBQUssV0FBVSxxQkFBbUJBLFNBQVEsUUFBUSxRQUFPLFNBQUUsQ0FDOUQsR0FFQSxvQ0FBQyxTQUFJLFdBQVUsdUJBQ1osZ0JBQ0Msb0NBQUMsU0FBSSxXQUFVLG9CQUFtQixNQUFLLFNBQVEsY0FBVyxrQkFDeEQ7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLE1BQUs7QUFBQSxVQUNMLFdBQVcsU0FBUyxXQUFXLGNBQWM7QUFBQSxVQUM3QyxTQUFTLE1BQU0sUUFBUSxRQUFRO0FBQUEsVUFDL0IsT0FBTyxpQ0FBUSxnQkFBZ0I7QUFBQTtBQUFBLFFBQ2hDO0FBQUEsTUFFRCxHQUNBO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxNQUFLO0FBQUEsVUFDTCxXQUFXLFNBQVMsU0FBUyxjQUFjO0FBQUEsVUFDM0MsU0FBUyxNQUFNLFFBQVEsTUFBTTtBQUFBLFVBQzdCLE9BQU8saUNBQVEsZ0JBQWdCO0FBQUE7QUFBQSxRQUNoQztBQUFBLE1BRUQsQ0FDRixJQUNFLE1BRUgsZ0JBQWdCLFNBQVMsSUFDeEIsb0NBQUMsU0FBSSxXQUFVLHdCQUF1QixNQUFLLFNBQVEsY0FBVyxrQkFDM0QsZ0JBQWdCLElBQUksQ0FBQyxRQUNwQjtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0w7QUFBQSxVQUNBLFdBQVcsZ0JBQWdCLE1BQU0sY0FBYztBQUFBLFVBQy9DLFNBQVMsTUFBTSxlQUFlLEdBQUc7QUFBQTtBQUFBLFFBRWhDLGdCQUFnQixHQUFHLEtBQUs7QUFBQSxNQUMzQixDQUNELENBQ0gsSUFDRSxNQUVILFNBQVMsWUFBWSxDQUFDLGdCQUNyQiwwREFDRTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsT0FBTztBQUFBLFVBQ1AsVUFBVTtBQUFBLFVBQ1YsU0FBUyxNQUFNLGVBQWUsQ0FBQztBQUFBO0FBQUEsTUFDakMsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0M7QUFBQSxVQUNBLFVBQVUsTUFBTSxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQTtBQUFBLE1BQ2xELENBQ0YsSUFFQSwwREFDRTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsT0FBTztBQUFBLFVBQ1AsVUFBVTtBQUFBLFVBQ1YsU0FBUztBQUFBO0FBQUEsTUFDWCxHQUNBO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQztBQUFBLFVBQ0EsVUFBVSxNQUFNLGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSztBQUFBO0FBQUEsTUFDbEQsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVyxrQkFBa0IsOEJBQThCO0FBQUEsVUFDM0QsU0FBUyxNQUFNLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQUEsVUFDbkQsT0FBTywrREFBYSxnQkFBZ0I7QUFBQTtBQUFBLFFBRW5DLGtCQUFrQixvQkFBVTtBQUFBLE1BQy9CLEdBQ0Esb0NBQUMsU0FBSSxXQUFVLG1CQUNiLG9DQUFDLFdBQU0sU0FBUSxtQkFBZ0IsY0FBRSxHQUNqQztBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsSUFBRztBQUFBLFVBQ0gsT0FBTztBQUFBLFVBQ1AsVUFBVSxDQUFDLFVBQVUsWUFBWSxNQUFNLE9BQU8sS0FBSztBQUFBLFVBQ25ELE9BQU07QUFBQTtBQUFBLFFBRUxBLFNBQVEsUUFBUSxJQUFJLENBQUMsUUFBUSxVQUM1QixvQ0FBQyxZQUFPLEtBQUssT0FBTyxJQUFJLE9BQU8sT0FBTyxNQUNuQyxRQUFRLEdBQUUsTUFBRyxPQUFPLEtBQ3ZCLENBQ0Q7QUFBQSxNQUNILENBQ0YsR0FDQyxZQUNDLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFdBQVUsbUJBQWtCLFNBQVMsVUFBUSxjQUFFLElBQ25FLE1BQ0osb0NBQUMsWUFBTyxNQUFLLFVBQVMsV0FBVSxtQkFBa0IsU0FBUyxhQUFXLGNBQUUsR0FDeEUsb0NBQUMsVUFBSyxXQUFVLHdCQUFxQixzQkFFbEMsZ0JBQ0csR0FBR0EsU0FBUSxRQUFRLFVBQVUsQ0FBQyxXQUFXLE9BQU8sT0FBTyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssY0FBYyxLQUFLLFNBQU0sY0FBYyxFQUFFLFNBQzFILGVBQ04sQ0FDRixDQUVKLEdBRUEsb0NBQUMsU0FBSSxXQUFVLHNCQUNiO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxNQUFLO0FBQUEsVUFDTCxXQUFXLGNBQWMscUNBQXFDO0FBQUEsVUFDOUQsY0FBVztBQUFBLFVBQ1gsaUJBQWU7QUFBQSxVQUNmLGlCQUFjO0FBQUEsVUFDZCxPQUFNO0FBQUEsVUFDTixTQUFTLE1BQU0sZUFBZSxDQUFDLFVBQVUsQ0FBQyxLQUFLO0FBQUE7QUFBQSxRQUUvQyxvQ0FBQyxlQUFZLE1BQUssUUFBTztBQUFBLFFBQ3pCLG9DQUFDLFVBQUssV0FBVSx3QkFBcUIsa0RBQWE7QUFBQSxNQUNwRCxHQUNBO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxNQUFLO0FBQUEsVUFDTCxXQUFXLGlCQUFpQixlQUFlLFdBQVcscUNBQXFDO0FBQUEsVUFDM0YsZ0JBQWMsaUJBQWlCLGVBQWU7QUFBQSxVQUM5QyxjQUFZLGlCQUFpQixlQUFlLFdBQVcsdUJBQVE7QUFBQSxVQUMvRCxPQUFPLHNJQUFrQyxnQkFBZ0I7QUFBQSxVQUN6RCxTQUFTLE1BQU0sYUFBYSxRQUFRO0FBQUE7QUFBQSxRQUVwQyxvQ0FBQyxlQUFZLE1BQUssUUFBTztBQUFBLFFBQ3pCLG9DQUFDLFVBQUssV0FBVSx3QkFBcUIsY0FBRTtBQUFBLE1BQ3pDLEdBQ0E7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLE1BQUs7QUFBQSxVQUNMLFdBQVcsaUJBQWlCLGVBQWUsZUFBZSxxQ0FBcUM7QUFBQSxVQUMvRixnQkFBYyxpQkFBaUIsZUFBZTtBQUFBLFVBQzlDLGNBQVksaUJBQWlCLGVBQWUsZUFBZSx1QkFBUTtBQUFBLFVBQ25FLE9BQU07QUFBQSxVQUNOLFNBQVMsTUFBTSxhQUFhLFlBQVk7QUFBQTtBQUFBLFFBRXhDLG9DQUFDLGVBQVksTUFBSyxXQUFVO0FBQUEsUUFDM0IsWUFBWSxTQUFTLElBQ3BCLG9DQUFDLFVBQUssV0FBVSwyQkFDYixZQUFZLE1BQ2YsSUFDRTtBQUFBLFFBQ0osb0NBQUMsVUFBSyxXQUFVLHdCQUFxQixjQUFFO0FBQUEsTUFDekMsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsY0FBWSxZQUFZLHlDQUFXO0FBQUEsVUFDbkMsT0FBTyw2Q0FBVSxnQkFBZ0I7QUFBQSxVQUNqQyxTQUFTO0FBQUE7QUFBQSxRQUVULG9DQUFDLGVBQVksTUFBSyxjQUFhO0FBQUEsUUFDL0Isb0NBQUMsVUFBSyxXQUFVLHdCQUFxQixjQUFFO0FBQUEsTUFDekMsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsY0FBWSxZQUFZLE9BQU8sSUFBSSwrQ0FBWTtBQUFBLFVBQy9DLE9BQU8sWUFBWSxPQUFPLElBQUkscUdBQXFCO0FBQUEsVUFDbkQsU0FBUyxNQUFNLGNBQWMsSUFBSTtBQUFBO0FBQUEsUUFFakMsb0NBQUMsZUFBWSxNQUFLLFVBQVM7QUFBQSxRQUMzQixvQ0FBQyxVQUFLLFdBQVUsd0JBQXFCLDBCQUFJO0FBQUEsTUFDM0MsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsY0FBWSxZQUFZLE9BQU8sSUFBSSwrQ0FBWTtBQUFBLFVBQy9DLE9BQU8sWUFBWSxPQUFPLElBQUkscUdBQXFCO0FBQUEsVUFDbkQsU0FBUyxNQUFNLGNBQWMsS0FBSztBQUFBO0FBQUEsUUFFbEMsb0NBQUMsZUFBWSxNQUFLLFlBQVc7QUFBQSxRQUM3QixvQ0FBQyxVQUFLLFdBQVUsd0JBQXFCLDBCQUFJO0FBQUEsTUFDM0MsR0FDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsTUFBSztBQUFBLFVBQ0wsV0FBVTtBQUFBLFVBQ1YsVUFBVSxhQUFhLFlBQVksU0FBUyxLQUFLLFNBQVM7QUFBQSxVQUMxRCxjQUFZLFlBQVksNkJBQVMsaUNBQVEsWUFBWSxJQUFJO0FBQUEsVUFDekQsT0FBTyxZQUFZLDZCQUFTLDRCQUFRLFlBQVksSUFBSTtBQUFBLFVBQ3BELFNBQVMsTUFBTSxVQUFVLENBQUMsR0FBRyxXQUFXLENBQUM7QUFBQTtBQUFBLFFBRXpDLG9DQUFDLGVBQVksTUFBSyxZQUFXO0FBQUEsUUFDN0Isb0NBQUMsVUFBSyxXQUFVLDJCQUF5QixZQUFZLFdBQU0sWUFBWSxJQUFLO0FBQUEsUUFDNUUsb0NBQUMsVUFBSyxXQUFVLHdCQUFxQiwwQkFBSTtBQUFBLE1BQzNDLENBQ0YsQ0FDRjtBQUFBLE1BRUMsY0FDQyxvQ0FBQyxTQUFJLFdBQVUsb0JBQW1CLE1BQUssV0FBUyxXQUFZLElBQzFEO0FBQUEsTUFFSCxZQUNDO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxXQUFXLHNCQUFzQiwyQkFBMkIsS0FBSyxlQUFlO0FBQUEsVUFDaEYsTUFBSztBQUFBLFVBQ0wsY0FBVztBQUFBO0FBQUEsUUFFViwyQkFDQyxvQ0FBQyxTQUFJLFdBQVUsMkJBQ2I7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE1BQUs7QUFBQSxZQUNMLFdBQVU7QUFBQSxZQUNWLE9BQU07QUFBQSxZQUNOLFNBQVM7QUFBQTtBQUFBLFVBQ1Y7QUFBQSxRQUVELEdBQ0E7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE1BQUs7QUFBQSxZQUNMLFdBQVcsb0JBQW9CLDhCQUE4QjtBQUFBLFlBQzdELE9BQU8sb0JBQ0gsbURBQVcsZ0JBQWdCLG1CQUMzQix1Q0FBUyxnQkFBZ0I7QUFBQSxZQUM3QixTQUFTO0FBQUE7QUFBQSxVQUVSLG9CQUFvQixzQ0FBYTtBQUFBLFFBQ3BDLEdBQ0E7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE9BQU87QUFBQSxZQUNQLFVBQVU7QUFBQSxZQUNWLFNBQVM7QUFBQTtBQUFBLFFBQ1gsR0FDQTtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0M7QUFBQSxZQUNBLFVBQVUsTUFBTSxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQTtBQUFBLFFBQ2xELEdBQ0E7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE1BQUs7QUFBQSxZQUNMLFdBQVcsY0FBYyxnRUFBZ0U7QUFBQSxZQUN6RixjQUFXO0FBQUEsWUFDWCxpQkFBZTtBQUFBLFlBQ2YsaUJBQWM7QUFBQSxZQUNkLE9BQU07QUFBQSxZQUNOLFNBQVMsTUFBTSxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQTtBQUFBLFVBRS9DLG9DQUFDLGVBQVksTUFBSyxRQUFPO0FBQUEsUUFDM0IsR0FDQTtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0MsTUFBSztBQUFBLFlBQ0wsV0FBVTtBQUFBLFlBQ1YsY0FBWSxZQUFZLE9BQU8sSUFBSSwrQ0FBWTtBQUFBLFlBQy9DLE9BQU8sWUFBWSxPQUFPLElBQUkscUdBQXFCO0FBQUEsWUFDbkQsU0FBUyxNQUFNLGNBQWMsSUFBSTtBQUFBO0FBQUEsVUFFakMsb0NBQUMsZUFBWSxNQUFLLFVBQVM7QUFBQSxRQUM3QixHQUNBO0FBQUEsVUFBQztBQUFBO0FBQUEsWUFDQyxNQUFLO0FBQUEsWUFDTCxXQUFVO0FBQUEsWUFDVixjQUFZLFlBQVksT0FBTyxJQUFJLCtDQUFZO0FBQUEsWUFDL0MsT0FBTyxZQUFZLE9BQU8sSUFBSSxxR0FBcUI7QUFBQSxZQUNuRCxTQUFTLE1BQU0sY0FBYyxLQUFLO0FBQUE7QUFBQSxVQUVsQyxvQ0FBQyxlQUFZLE1BQUssWUFBVztBQUFBLFFBQy9CLEdBQ0MsU0FDQywwREFDRyxZQUNDLG9DQUFDLFlBQU8sTUFBSyxVQUFTLFdBQVUsbUJBQWtCLFNBQVMsVUFBUSxjQUFFLElBQ25FLE1BQ0o7QUFBQSxVQUFDO0FBQUE7QUFBQSxZQUNDLE1BQUs7QUFBQSxZQUNMLFdBQVcsa0JBQWtCLDhCQUE4QjtBQUFBLFlBQzNELFNBQVMsTUFBTSxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsS0FBSztBQUFBLFlBQ25ELE9BQU8sK0RBQWEsZ0JBQWdCO0FBQUE7QUFBQSxVQUVuQyxrQkFBa0Isb0JBQVU7QUFBQSxRQUMvQixDQUNGLElBQ0UsSUFDTixJQUNFO0FBQUEsUUFDSjtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0MsTUFBSztBQUFBLFlBQ0wsV0FBVTtBQUFBLFlBQ1YsaUJBQWU7QUFBQSxZQUNmLGNBQVksMkJBQTJCLCtDQUFZO0FBQUEsWUFDbkQsT0FBTywyQkFBMkIsK0NBQVk7QUFBQSxZQUM5QyxTQUFTLE1BQU0sNEJBQTRCLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQTtBQUFBLFVBRTVELG9DQUFDLGVBQVksTUFBTSwyQkFBMkIsb0JBQW9CLGlCQUFpQjtBQUFBLFFBQ3JGO0FBQUEsTUFDRixJQUNFO0FBQUEsTUFFSCxTQUFTLFdBQ1I7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDLFNBQVNBO0FBQUEsVUFDVCxPQUFPO0FBQUEsVUFDUCxVQUFVO0FBQUEsVUFDVjtBQUFBLFVBQ0E7QUFBQSxVQUNBO0FBQUEsVUFDQTtBQUFBLFVBQ0E7QUFBQSxVQUNBLGdCQUFnQjtBQUFBLFVBQ2hCLGFBQWE7QUFBQSxVQUNiO0FBQUEsVUFDQSxnQkFBZ0I7QUFBQSxVQUNoQixlQUFlLHFCQUFxQixtQkFBbUI7QUFBQSxVQUN2RDtBQUFBLFVBQ0E7QUFBQSxVQUNBLDZCQUE2QjtBQUFBLFVBQzdCLG9CQUFvQixNQUFNLHlCQUF5QixLQUFLO0FBQUE7QUFBQSxNQUMxRCxJQUVBO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQyxTQUFTQTtBQUFBLFVBQ1Q7QUFBQSxVQUNBO0FBQUEsVUFDQSxPQUFPO0FBQUEsVUFDUCxVQUFVO0FBQUEsVUFDVjtBQUFBLFVBQ0EsY0FBYztBQUFBLFVBQ2Q7QUFBQSxVQUNBLGdCQUFnQjtBQUFBLFVBQ2hCO0FBQUEsVUFDQSxnQkFBZ0I7QUFBQSxVQUNoQixlQUFlLHFCQUFxQixtQkFBbUI7QUFBQTtBQUFBLE1BQ3pEO0FBQUEsTUFFRCxpQkFBaUIsZUFBZSxXQUMvQixvQ0FBQyxpQkFBYyxVQUFvQixPQUFPLGFBQWEsYUFBYSxpQkFBaUIsSUFDbkY7QUFBQSxNQUNILHlCQUEwQixpQkFBaUIsZUFBZSxlQUN6RDtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0M7QUFBQSxVQUNBO0FBQUEsVUFDQSxhQUFhO0FBQUE7QUFBQSxNQUNmLElBQ0U7QUFBQSxNQUNKO0FBQUEsUUFBQztBQUFBO0FBQUEsVUFDQztBQUFBLFVBQ0EsT0FBTyxZQUFZO0FBQUEsVUFDbkIsYUFBYUEsU0FBUTtBQUFBLFVBQ3JCLFFBQVE7QUFBQTtBQUFBLE1BQ1Y7QUFBQSxNQUNDLGNBQ0M7QUFBQSxRQUFDO0FBQUE7QUFBQSxVQUNDO0FBQUEsVUFDQSxpQkFBaUI7QUFBQSxVQUNqQix5QkFBeUI7QUFBQSxVQUN6QjtBQUFBLFVBQ0EsK0JBQStCO0FBQUEsVUFDL0I7QUFBQSxVQUNBLHNCQUFzQjtBQUFBLFVBQ3RCO0FBQUEsVUFDQSx5QkFBeUI7QUFBQSxVQUN6QixTQUFTLE1BQU0sZUFBZSxLQUFLO0FBQUE7QUFBQSxNQUNyQyxJQUNFO0FBQUEsTUFDSjtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsU0FBU0E7QUFBQSxVQUNULFNBQVMsc0JBQXNCLGlCQUFpQixlQUFlO0FBQUEsVUFDL0QsWUFBWTtBQUFBLFVBQ1osYUFBYTtBQUFBLFVBQ2IsT0FBTztBQUFBLFVBQ1AscUJBQXFCLE1BQU0scUJBQXFCLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFBQSxVQUNqRSxpQkFBaUIsQ0FBQyxZQUFTO0FBcDhCbkM7QUFvOEJzQyx1Q0FBb0IsU0FBUyxNQUFNLE1BQU07QUFBQSxjQUNyRSxpQkFBZ0Isc0JBQWlCLGlCQUFpQixTQUFTLENBQUMsTUFBNUMsbUJBQStDO0FBQUEsWUFDakUsQ0FBQztBQUFBO0FBQUEsVUFDRCxnQkFBZ0I7QUFBQSxVQUNoQixtQkFBbUI7QUFBQSxVQUNuQixrQkFBa0I7QUFBQSxVQUNsQixXQUFXO0FBQUEsVUFDWCxjQUFjO0FBQUEsVUFDZCxTQUFTO0FBQUE7QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLFFBQUM7QUFBQTtBQUFBLFVBQ0MsU0FBU0E7QUFBQSxVQUNULFNBQVMsc0JBQXNCLGlCQUFpQixlQUFlO0FBQUEsVUFDL0QsV0FBVyxpQkFBaUIsaUJBQWlCLFNBQVMsQ0FBQyxLQUFLO0FBQUEsVUFDNUQ7QUFBQSxVQUNBO0FBQUEsVUFDQSxZQUFZO0FBQUEsVUFDWixjQUFjO0FBQUEsVUFDZCxPQUFPO0FBQUEsVUFDUCxVQUFVO0FBQUEsVUFDVixVQUFVO0FBQUEsVUFDVixVQUFVO0FBQUEsVUFDVixjQUFjO0FBQUEsVUFDZCxrQkFBa0I7QUFBQSxVQUNsQixTQUFTO0FBQUE7QUFBQSxNQUNYO0FBQUEsSUFDRjtBQUFBLEVBRUo7OztBQ2grQkEsV0FBUyxLQUFLLE1BQU0sU0FBUztBQUMzQixVQUFNLElBQUksTUFBTSxHQUFHLElBQUksSUFBSSxPQUFPLEVBQUU7QUFBQSxFQUN0QztBQUVPLFdBQVMsZ0JBQWdCQyxVQUFTO0FBQ3ZDLFFBQUksQ0FBQ0EsWUFBVyxPQUFPQSxhQUFZLFNBQVUsTUFBSyxXQUFXLG1CQUFtQjtBQUNoRixRQUFJLENBQUNBLFNBQVEsYUFBYSxPQUFPQSxTQUFRLGNBQWMsVUFBVTtBQUMvRCxXQUFLLHFCQUFxQixtQkFBbUI7QUFBQSxJQUMvQztBQUVBLFVBQU0sa0JBQWtCLE9BQU8sUUFBUUEsU0FBUSxTQUFTO0FBQ3hELFFBQUksZ0JBQWdCLFdBQVcsRUFBRyxNQUFLLHFCQUFxQixvQ0FBb0M7QUFDaEcsZUFBVyxDQUFDLEtBQUssUUFBUSxLQUFLLGlCQUFpQjtBQUM3QyxVQUFJLENBQUMsWUFBWSxPQUFPLGFBQWEsU0FBVSxNQUFLLHFCQUFxQixHQUFHLElBQUksbUJBQW1CO0FBQ25HLGlCQUFXLGFBQWEsQ0FBQyxTQUFTLFFBQVEsR0FBRztBQUMzQyxZQUFJLENBQUMsT0FBTyxTQUFTLFNBQVMsU0FBUyxDQUFDLEtBQUssU0FBUyxTQUFTLEtBQUssR0FBRztBQUNyRSxlQUFLLHFCQUFxQixHQUFHLElBQUksU0FBUyxJQUFJLDJCQUEyQjtBQUFBLFFBQzNFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFFQSxRQUFJLENBQUMsT0FBTyxPQUFPQSxTQUFRLFdBQVdBLFNBQVEsZUFBZSxHQUFHO0FBQzlELFdBQUssMkJBQTJCLGdDQUFnQ0EsU0FBUSxlQUFlLEdBQUc7QUFBQSxJQUM1RjtBQUNBLFFBQUksQ0FBQyxNQUFNLFFBQVFBLFNBQVEsT0FBTyxLQUFLQSxTQUFRLFFBQVEsV0FBVyxHQUFHO0FBQ25FLFdBQUssbUJBQW1CLGtDQUFrQztBQUFBLElBQzVEO0FBRUEsVUFBTSxNQUFNLG9CQUFJLElBQUk7QUFDcEIsSUFBQUEsU0FBUSxRQUFRLFFBQVEsQ0FBQyxRQUFRLFVBQVU7QUFDekMsWUFBTSxPQUFPLG1CQUFtQixLQUFLO0FBQ3JDLFVBQUksQ0FBQyxVQUFVLE9BQU8sV0FBVyxTQUFVLE1BQUssTUFBTSxtQkFBbUI7QUFDekUsVUFBSSxPQUFPLE9BQU8sT0FBTyxZQUFZLENBQUMsZUFBZSxLQUFLLE9BQU8sRUFBRSxHQUFHO0FBQ3BFLGFBQUssR0FBRyxJQUFJLE9BQU8sMkJBQTJCO0FBQUEsTUFDaEQ7QUFDQSxVQUFJLElBQUksSUFBSSxPQUFPLEVBQUUsRUFBRyxNQUFLLEdBQUcsSUFBSSxPQUFPLGlCQUFpQixPQUFPLEVBQUUsR0FBRztBQUN4RSxVQUFJLElBQUksT0FBTyxFQUFFO0FBQ2pCLFVBQUksT0FBTyxPQUFPLGNBQWMsV0FBWSxNQUFLLEdBQUcsSUFBSSxjQUFjLG9CQUFvQjtBQUMxRixVQUFJLENBQUMsTUFBTSxRQUFRLE9BQU8sS0FBSyxHQUFHO0FBQ2hDLGFBQUssR0FBRyxJQUFJLFVBQVUsa0JBQWtCO0FBQUEsTUFDMUM7QUFBQSxJQUNGLENBQUM7QUFFRCxJQUFBQSxTQUFRLFFBQVEsUUFBUSxDQUFDLFFBQVEsZ0JBQWdCO0FBQy9DLGFBQU8sTUFBTSxRQUFRLENBQUMsUUFBUSxjQUFjO0FBQzFDLFlBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxHQUFHO0FBQ3BCO0FBQUEsWUFDRSxtQkFBbUIsV0FBVyxXQUFXLFNBQVM7QUFBQSxZQUNsRCw4QkFBOEIsTUFBTTtBQUFBLFVBQ3RDO0FBQUEsUUFDRjtBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUVELFFBQUlBLFNBQVEsZUFBZSxNQUFNO0FBQy9CLFVBQUksQ0FBQyxNQUFNLFFBQVFBLFNBQVEsV0FBVyxFQUFHLE1BQUssdUJBQXVCLGtCQUFrQjtBQUN2RixVQUFJLE9BQU9BLFNBQVEsd0JBQXdCLFlBQVksQ0FBQ0EsU0FBUSxxQkFBcUI7QUFDbkYsYUFBSywrQkFBK0IsMERBQTBEO0FBQUEsTUFDaEc7QUFDQSxZQUFNLGdCQUFnQixvQkFBSSxJQUFJO0FBQzlCLE1BQUFBLFNBQVEsWUFBWSxRQUFRLENBQUMsWUFBWSxVQUFVO0FBQ2pELGNBQU0sT0FBTyx1QkFBdUIsS0FBSztBQUN6QyxZQUFJLENBQUMsY0FBYyxPQUFPLGVBQWUsU0FBVSxNQUFLLE1BQU0sbUJBQW1CO0FBQ2pGLFlBQUksT0FBTyxXQUFXLE9BQU8sWUFBWSxDQUFDLFdBQVcsR0FBSSxNQUFLLEdBQUcsSUFBSSxPQUFPLDRCQUE0QjtBQUN4RyxZQUFJLGNBQWMsSUFBSSxXQUFXLEVBQUUsRUFBRyxNQUFLLEdBQUcsSUFBSSxPQUFPLGlCQUFpQixXQUFXLEVBQUUsR0FBRztBQUMxRixzQkFBYyxJQUFJLFdBQVcsRUFBRTtBQUMvQixZQUFJLENBQUMsSUFBSSxJQUFJLFdBQVcsUUFBUSxHQUFHO0FBQ2pDLGVBQUssR0FBRyxJQUFJLGFBQWEsOEJBQThCLFdBQVcsUUFBUSxHQUFHO0FBQUEsUUFDL0U7QUFDQSxZQUFJLE9BQU8sV0FBVyxZQUFZLFlBQVksQ0FBQyxXQUFXLFFBQVEsS0FBSyxHQUFHO0FBQ3hFLGVBQUssR0FBRyxJQUFJLFlBQVksNEJBQTRCO0FBQUEsUUFDdEQ7QUFDQSxZQUFJLENBQUMsV0FBVyxVQUFVLENBQUMsQ0FBQyxVQUFVLE1BQU0sRUFBRSxTQUFTLFdBQVcsT0FBTyxJQUFJLEdBQUc7QUFDOUUsZUFBSyxHQUFHLElBQUksZ0JBQWdCLDRCQUE0QjtBQUFBLFFBQzFEO0FBQ0EsWUFBSSxXQUFXLE9BQU8sU0FBUyxVQUFVLENBQUMsV0FBVyxPQUFPLFVBQVU7QUFDcEUsZUFBSyxHQUFHLElBQUksb0JBQW9CLHdDQUF3QztBQUFBLFFBQzFFO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7OztBQzVFTyxXQUFTLGdCQUFnQixJQUFJLFNBQVMsVUFBVTtBQUNyRCxXQUFPO0FBQUEsTUFDTCxnQkFBZ0IsTUFBTTtBQUFBLE1BQ3RCLFNBQVMsQ0FBQyxVQUFVO0FBUHhCO0FBUU0sWUFBSSxHQUFJLGFBQU0sb0JBQU47QUFDUixZQUFJLFFBQVMsU0FBUSxLQUFLO0FBQzFCLFlBQUksQ0FBQyxNQUFNLG9CQUFvQixHQUFJLFVBQVMsRUFBRTtBQUFBLE1BQ2hEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFTyxXQUFTLGNBQWMsSUFBSSxTQUFTO0FBQ3pDLFVBQU0sRUFBRSxTQUFTLElBQUksYUFBYTtBQUNsQyxXQUFPLGdCQUFnQixJQUFJLFNBQVMsUUFBUTtBQUFBLEVBQzlDOzs7QUNmQSxXQUFTLFVBQVUsTUFBTSxPQUFPO0FBQzlCLFdBQU8sUUFBUSxHQUFHLElBQUksSUFBSSxLQUFLLEtBQUs7QUFBQSxFQUN0QztBQUVBLFdBQVMsZUFBZSxTQUFTLGFBQWE7QUFDNUMsVUFBTSxRQUNKLFdBQVcsT0FBTyxZQUFZLFlBQVksQ0FBQyxNQUFNLFFBQVEsT0FBTyxJQUM1RCxRQUFRLFdBQVcsSUFDbkI7QUFDTixRQUFJLE9BQU8sVUFBVSxLQUFLLEtBQUssUUFBUSxFQUFHLFFBQU8sVUFBVSxLQUFLO0FBQ2hFLFFBQUksT0FBTyxVQUFVLFlBQVksTUFBTSxLQUFLLEVBQUcsUUFBTztBQUN0RCxVQUFNLElBQUksTUFBTSx5RUFBeUU7QUFBQSxFQUMzRjtBQUVBLFdBQVMsY0FBYyxJQUFJLFNBQVMsTUFBTTtBQUN4QyxVQUFNLE9BQU8sY0FBYyxJQUFJLE9BQU87QUFDdEMsV0FBTztBQUFBLE1BQ0wsaUJBQWlCLEtBQUssb0JBQW9CO0FBQUEsTUFDMUMsTUFBTSxLQUFLLFNBQVMsS0FBSztBQUFBLE1BQ3pCLFVBQVUsTUFBTSxLQUFLLGFBQWEsU0FBWSxJQUFJLEtBQUs7QUFBQSxNQUN2RDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBa0JPLFdBQVMsSUFBSTtBQUFBLElBQ2xCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxJQUNiLGlCQUFpQjtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLElBQ0EsR0FBRztBQUFBLEVBQ0wsR0FBRztBQUNELFVBQU0sRUFBRSxpQkFBaUIsTUFBTSxVQUFVLEtBQUssSUFBSSxjQUFjLElBQUksU0FBUyxJQUFJO0FBQ2pGLFVBQU0sY0FBYztBQUFBLE1BQ2xCLFNBQVM7QUFBQSxNQUNULGVBQWU7QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUc7QUFBQSxJQUNMO0FBQ0EsV0FDRTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVyxVQUFVLFNBQVMsZUFBZSxJQUFJLFNBQVM7QUFBQSxRQUMxRDtBQUFBLFFBQ0E7QUFBQSxRQUNBLE9BQU87QUFBQSxRQUNOLEdBQUc7QUFBQSxRQUNILEdBQUc7QUFBQTtBQUFBLE1BRUg7QUFBQSxJQUNIO0FBQUEsRUFFSjtBQUVPLFdBQVMsT0FBTztBQUFBLElBQ3JCO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFBQSxJQUNiLGlCQUFpQjtBQUFBLElBQ2pCO0FBQUEsSUFDQTtBQUFBLElBQ0EsR0FBRztBQUFBLEVBQ0wsR0FBRztBQUNELFVBQU0sRUFBRSxpQkFBaUIsTUFBTSxVQUFVLEtBQUssSUFBSSxjQUFjLElBQUksU0FBUyxJQUFJO0FBQ2pGLFVBQU0sY0FBYztBQUFBLE1BQ2xCLFNBQVM7QUFBQSxNQUNULGVBQWU7QUFBQSxNQUNmO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUc7QUFBQSxJQUNMO0FBQ0EsV0FDRTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVyxVQUFVLFlBQVksZUFBZSxJQUFJLFNBQVM7QUFBQSxRQUM3RDtBQUFBLFFBQ0E7QUFBQSxRQUNBLE9BQU87QUFBQSxRQUNOLEdBQUc7QUFBQSxRQUNILEdBQUc7QUFBQTtBQUFBLE1BRUg7QUFBQSxJQUNIO0FBQUEsRUFFSjtBQUVPLFdBQVMsS0FBSyxFQUFFLFdBQVcsT0FBTyxVQUFVLFVBQVUsR0FBRyxNQUFNLEdBQUcsSUFBSSxTQUFTLEdBQUcsS0FBSyxHQUFHO0FBQy9GLFVBQU0sRUFBRSxZQUFZLElBQUksYUFBYTtBQUNyQyxVQUFNLEVBQUUsaUJBQWlCLE1BQU0sVUFBVSxLQUFLLElBQUksY0FBYyxJQUFJLFNBQVMsSUFBSTtBQUNqRixVQUFNLGNBQWM7QUFBQSxNQUNsQixTQUFTO0FBQUEsTUFDVCxxQkFBcUIsZUFBZSxTQUFTLFdBQVc7QUFBQSxNQUN4RDtBQUFBLE1BQ0EsR0FBRztBQUFBLElBQ0w7QUFDQSxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxXQUFXLFVBQVUsVUFBVSxlQUFlLElBQUksU0FBUztBQUFBLFFBQzNEO0FBQUEsUUFDQTtBQUFBLFFBQ0EsT0FBTztBQUFBLFFBQ04sR0FBRztBQUFBLFFBQ0gsR0FBRztBQUFBO0FBQUEsTUFFSDtBQUFBLElBQ0g7QUFBQSxFQUVKOzs7QUNsSU8sV0FBUyxRQUFRLEVBQUUsUUFBUSxHQUFHLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQ3hFLFVBQU0sTUFBTSxJQUFJLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO0FBQy9DLFdBQU8sTUFBTSxjQUFjLEtBQUssRUFBRSxXQUFXLGNBQWMsU0FBUyxHQUFHLEtBQUssR0FBRyxHQUFHLEtBQUssR0FBRyxRQUFRO0FBQUEsRUFDcEc7QUFFTyxXQUFTLEtBQUssRUFBRSxLQUFLLEtBQUssWUFBWSxJQUFJLFVBQVUsR0FBRyxLQUFLLEdBQUc7QUFDcEUsV0FBTyxNQUFNLGNBQWMsSUFBSSxFQUFFLFdBQVcsV0FBVyxTQUFTLEdBQUcsS0FBSyxHQUFHLEdBQUcsS0FBSyxHQUFHLFFBQVE7QUFBQSxFQUNoRztBQUVPLFdBQVMsS0FBSyxFQUFFLElBQUksU0FBUyxZQUFZLElBQUksVUFBVSxHQUFHLEtBQUssR0FBRztBQUN2RSxVQUFNLE9BQU8sY0FBYyxJQUFJLE9BQU87QUFDdEMsV0FDRTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVyxXQUFXLEtBQUssbUJBQW1CLEVBQUUsSUFBSSxTQUFTLEdBQUcsS0FBSztBQUFBLFFBQ3JFLE1BQU0sS0FBSyxTQUFTLEtBQUs7QUFBQSxRQUN6QixVQUFVLE1BQU0sS0FBSyxhQUFhLFNBQVksSUFBSSxLQUFLO0FBQUEsUUFDdEQsR0FBRztBQUFBLFFBQ0gsR0FBRztBQUFBO0FBQUEsTUFFSDtBQUFBLElBQ0g7QUFBQSxFQUVKO0FBRU8sV0FBUyxNQUFNLEVBQUUsWUFBWSxJQUFJLFVBQVUsR0FBRyxLQUFLLEdBQUc7QUFDM0QsV0FBTyxvQ0FBQyxVQUFLLFdBQVcsWUFBWSxTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFBTyxRQUFTO0FBQUEsRUFDOUU7QUFFTyxXQUFTLE9BQU8sRUFBRSxPQUFPLElBQUksT0FBTyxZQUFZLElBQUksT0FBTyxHQUFHLEtBQUssR0FBRztBQUMzRSxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxXQUFXLGFBQWEsU0FBUyxHQUFHLEtBQUs7QUFBQSxRQUN6QyxjQUFZO0FBQUEsUUFDWixPQUFPLEVBQUUsT0FBTyxNQUFNLFFBQVEsTUFBTSxHQUFHLE1BQU07QUFBQSxRQUM1QyxHQUFHO0FBQUE7QUFBQSxJQUNOO0FBQUEsRUFFSjtBQUVPLFdBQVMsaUJBQWlCO0FBQUEsSUFDL0IsUUFBUTtBQUFBLElBQ1IsU0FBUztBQUFBLElBQ1QsZUFBZTtBQUFBLElBQ2YsWUFBWTtBQUFBLElBQ1o7QUFBQSxJQUNBLEdBQUc7QUFBQSxFQUNMLEdBQUc7QUFDRCxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxXQUFXLHdCQUF3QixTQUFTLEdBQUcsS0FBSztBQUFBLFFBQ3BELGVBQVk7QUFBQSxRQUNaLE9BQU8sRUFBRSxPQUFPLFFBQVEsY0FBYyxHQUFHLE1BQU07QUFBQSxRQUM5QyxHQUFHO0FBQUE7QUFBQSxNQUVKLG9DQUFDLFVBQUssV0FBVSx3QkFBdUI7QUFBQSxJQUN6QztBQUFBLEVBRUo7OztBQ3pETyxXQUFTLE9BQU8sRUFBRSxJQUFJLFNBQVMsVUFBVSxXQUFXLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQzlGLFVBQU0sT0FBTyxjQUFjLElBQUksT0FBTztBQUN0QyxXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxXQUFXLHVCQUF1QixPQUFPLElBQUksU0FBUyxHQUFHLEtBQUs7QUFBQSxRQUM3RCxHQUFHO0FBQUEsUUFDSCxHQUFHO0FBQUE7QUFBQSxNQUVIO0FBQUEsSUFDSDtBQUFBLEVBRUo7QUFFTyxXQUFTLFVBQVUsRUFBRSxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDckQsV0FBTyxvQ0FBQyxXQUFNLFdBQVcsWUFBWSxTQUFTLEdBQUcsS0FBSyxHQUFHLE1BQUssUUFBUSxHQUFHLE1BQU07QUFBQSxFQUNqRjtBQUVPLFdBQVMsU0FBUyxFQUFFLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRztBQUNwRCxXQUFPLG9DQUFDLGNBQVMsV0FBVyx3QkFBd0IsU0FBUyxHQUFHLEtBQUssR0FBSSxHQUFHLE1BQU07QUFBQSxFQUNwRjtBQUVPLFdBQVMsT0FBTyxFQUFFLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQzVELFdBQU8sb0NBQUMsWUFBTyxXQUFXLHNCQUFzQixTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFBTyxRQUFTO0FBQUEsRUFDMUY7QUFFQSxXQUFTLE9BQU8sRUFBRSxNQUFNLE9BQU8sWUFBWSxJQUFJLEdBQUcsS0FBSyxHQUFHO0FBQ3hELFdBQ0Usb0NBQUMsV0FBTSxXQUFXLGFBQWEsU0FBUyxHQUFHLEtBQUssS0FDOUMsb0NBQUMsV0FBTSxXQUFVLG1CQUFrQixNQUFhLEdBQUcsTUFBTSxHQUN6RCxvQ0FBQyxVQUFLLFdBQVUscUJBQW1CLEtBQU0sQ0FDM0M7QUFBQSxFQUVKO0FBRU8sV0FBUyxTQUFTLE9BQU87QUFDOUIsV0FBTyxvQ0FBQyxVQUFPLE1BQUssWUFBWSxHQUFHLE9BQU87QUFBQSxFQUM1QztBQUVPLFdBQVMsTUFBTSxPQUFPO0FBQzNCLFdBQU8sb0NBQUMsVUFBTyxNQUFLLFNBQVMsR0FBRyxPQUFPO0FBQUEsRUFDekM7QUFFTyxXQUFTLE9BQU8sRUFBRSxVQUFVLE9BQU8sVUFBVSxPQUFPLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRztBQUNwRixXQUNFO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxNQUFLO0FBQUEsUUFDTCxNQUFLO0FBQUEsUUFDTCxnQkFBYztBQUFBLFFBQ2QsV0FBVyxhQUFhLFNBQVMsR0FBRyxLQUFLO0FBQUEsUUFDekMsU0FBUyxDQUFDLFVBQVUscUNBQVcsQ0FBQyxTQUFTO0FBQUEsUUFDeEMsR0FBRztBQUFBO0FBQUEsTUFFSixvQ0FBQyxVQUFLLFdBQVUscUJBQWtCLG9DQUFDLFVBQUssV0FBVSxtQkFBa0IsQ0FBRTtBQUFBLE1BQ3JFLFFBQVEsb0NBQUMsVUFBSyxXQUFVLHFCQUFtQixLQUFNLElBQVU7QUFBQSxJQUM5RDtBQUFBLEVBRUo7QUFFTyxXQUFTLFVBQVUsRUFBRSxPQUFPLFNBQVMsTUFBTSxPQUFPLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQzVGLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLGlCQUFpQixTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFDdkQsb0NBQUMsV0FBTSxXQUFVLGtCQUFpQixXQUFtQixLQUFNLEdBQzFELFVBQ0EsUUFBUSxDQUFDLFFBQVEsb0NBQUMsVUFBSyxXQUFVLG1CQUFpQixJQUFLLElBQVUsTUFDakUsUUFBUSxvQ0FBQyxVQUFLLFdBQVUsa0JBQWlCLE1BQUssV0FBUyxLQUFNLElBQVUsSUFDMUU7QUFBQSxFQUVKOzs7QUNuRU8sV0FBUyxXQUFXLEVBQUUsT0FBTyxTQUFTLFVBQVUsWUFBWSxTQUFTLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRztBQUNyRyxXQUNFLG9DQUFDLFlBQU8sV0FBVyxrQkFBa0IsU0FBUyxHQUFHLEtBQUssR0FBSSxHQUFHLFFBQzNELG9DQUFDLFNBQUksV0FBVSx5QkFDYixvQ0FBQyxRQUFHLElBQUksU0FBUyxXQUFVLG1CQUFpQixLQUFNLEdBQ2pELFdBQVcsb0NBQUMsT0FBRSxJQUFJLFlBQVksV0FBVSxzQkFBb0IsUUFBUyxJQUFPLElBQy9FLEdBQ0MsVUFBVSxvQ0FBQyxTQUFJLFdBQVUscUJBQW1CLE9BQVEsSUFBUyxJQUNoRTtBQUFBLEVBRUo7QUFpQ08sV0FBUyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsVUFBVSxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDeEUsVUFBTSxFQUFFLFNBQVMsSUFBSSxhQUFhO0FBQ2xDLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLGNBQWMsU0FBUyxHQUFHLEtBQUssR0FBSSxHQUFHLFFBQ25ELE1BQU0sSUFBSSxDQUFDLFNBQ1Y7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLEtBQUssS0FBSztBQUFBLFFBQ1YsV0FBVyxLQUFLLE9BQU8sV0FBVywwQkFBMEI7QUFBQSxRQUMzRCxHQUFHLGdCQUFnQixLQUFLLElBQUksS0FBSyxTQUFTLFFBQVE7QUFBQTtBQUFBLE1BRW5ELG9DQUFDLFVBQUssV0FBVSxlQUFjLGVBQVksUUFBTztBQUFBLE1BQ2pELG9DQUFDLFVBQUssV0FBVSxrQkFBZ0IsS0FBSyxLQUFNO0FBQUEsSUFDN0MsQ0FDRCxDQUNIO0FBQUEsRUFFSjtBQUVPLFdBQVMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxHQUFHLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRztBQUNuRSxVQUFNLEVBQUUsU0FBUyxJQUFJLGFBQWE7QUFDbEMsV0FDRSxvQ0FBQyxTQUFJLFdBQVcsa0JBQWtCLFNBQVMsR0FBRyxLQUFLLEdBQUcsY0FBVyxlQUFlLEdBQUcsUUFDaEYsTUFBTSxJQUFJLENBQUMsTUFBTSxVQUNoQixvQ0FBQyxNQUFNLFVBQU4sRUFBZSxLQUFLLEdBQUcsS0FBSyxLQUFLLElBQUksS0FBSyxNQUN4QyxRQUFRLElBQUksb0NBQUMsVUFBSyxXQUFVLHlCQUF3QixlQUFZLFFBQU8sSUFBSyxNQUM1RSxLQUFLLEtBQ0osb0NBQUMsWUFBTyxXQUFVLHNCQUFxQixNQUFLLFVBQVUsR0FBRyxnQkFBZ0IsS0FBSyxJQUFJLEtBQUssU0FBUyxRQUFRLEtBQ3JHLEtBQUssS0FDUixJQUNFLG9DQUFDLFVBQUssV0FBVSwyQkFBeUIsS0FBSyxLQUFNLENBQzFELENBQ0QsQ0FDSDtBQUFBLEVBRUo7QUFHTyxXQUFTLFlBQVksRUFBRSxVQUFVLE1BQUFDLFFBQU8sQ0FBQyxHQUFHLFVBQVUsWUFBWSxJQUFJLEdBQUcsS0FBSyxHQUFHO0FBQ3RGLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLG1CQUFtQixTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFDekQsb0NBQUMsVUFBSyxXQUFVLDBCQUF3QixRQUFTLEdBQ2hEQSxNQUFLLFNBQVMsSUFBSSxvQ0FBQyxVQUFPLE9BQU9BLE9BQU0sVUFBb0IsSUFBSyxJQUNuRTtBQUFBLEVBRUo7OztBQ3pGTyxXQUFTLEtBQUssRUFBRSxJQUFJLFNBQVMsT0FBTyxVQUFVLE9BQU8sWUFBWSxJQUFJLFVBQVUsR0FBRyxLQUFLLEdBQUc7QUFDL0YsVUFBTSxPQUFPLGNBQWMsSUFBSSxPQUFPO0FBQ3RDLFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFdBQVcsV0FBVyxLQUFLLG1CQUFtQixFQUFFLElBQUksU0FBUyxHQUFHLEtBQUs7QUFBQSxRQUNyRSxNQUFNLEtBQUssU0FBUyxLQUFLO0FBQUEsUUFDekIsVUFBVSxNQUFNLEtBQUssYUFBYSxTQUFZLElBQUksS0FBSztBQUFBLFFBQ3RELEdBQUc7QUFBQSxRQUNILEdBQUc7QUFBQTtBQUFBLE1BRUosb0NBQUMsU0FBSSxXQUFVLGtCQUNiLG9DQUFDLFlBQU8sV0FBVSxtQkFBaUIsS0FBTSxHQUN4QyxXQUFXLG9DQUFDLFVBQUssV0FBVSxzQkFBb0IsUUFBUyxJQUFVLE1BQ2xFLFFBQ0g7QUFBQSxNQUNDLFVBQVUsU0FBWSxvQ0FBQyxVQUFLLFdBQVUsbUJBQWlCLEtBQU0sSUFBVTtBQUFBLElBQzFFO0FBQUEsRUFFSjtBQUVPLFdBQVMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLFdBQVcsWUFBWSxJQUFJLEdBQUcsS0FBSyxHQUFHO0FBQ3pGLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLGlCQUFpQixTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFDdkQsb0NBQUMsV0FBTSxXQUFVLGNBQ2Ysb0NBQUMsV0FBTSxXQUFVLG1CQUNmLG9DQUFDLFFBQUcsV0FBVSx5QkFDWCxRQUFRLElBQUksQ0FBQyxXQUNaLG9DQUFDLFFBQUcsV0FBVSxvQkFBbUIsZUFBYSxPQUFPLEtBQUssS0FBSyxPQUFPLE9BQU0sT0FBTyxLQUFNLENBQzFGLENBQ0gsQ0FDRixHQUNBLG9DQUFDLFdBQU0sV0FBVSxtQkFDZCxLQUFLLElBQUksQ0FBQyxLQUFLLFVBQVU7QUFDeEIsWUFBTSxTQUFTLFlBQVksVUFBVSxHQUFHLElBQUksSUFBSSxNQUFNO0FBQ3RELGFBQ0Usb0NBQUMsUUFBRyxXQUFVLGdCQUFlLGVBQWEsUUFBUSxLQUFLLFVBQ3BELFFBQVEsSUFBSSxDQUFDLFdBQ1osb0NBQUMsUUFBRyxXQUFVLGlCQUFnQixlQUFhLE9BQU8sS0FBSyxLQUFLLE9BQU8sT0FDaEUsT0FBTyxTQUFTLE9BQU8sT0FBTyxJQUFJLE9BQU8sR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLE9BQU8sR0FBRyxDQUN2RSxDQUNELENBQ0g7QUFBQSxJQUVKLENBQUMsQ0FDSCxDQUNGLENBQ0Y7QUFBQSxFQUVKO0FBRU8sV0FBUyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsVUFBVSxVQUFVLFlBQVksSUFBSSxHQUFHLEtBQUssR0FBRztBQUNoRixXQUNFLG9DQUFDLFNBQUksV0FBVyxXQUFXLFNBQVMsR0FBRyxLQUFLLEdBQUcsTUFBSyxXQUFXLEdBQUcsUUFDL0QsTUFBTSxJQUFJLENBQUMsU0FDVjtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsV0FBVTtBQUFBLFFBQ1YsTUFBSztBQUFBLFFBQ0wsTUFBSztBQUFBLFFBQ0wsaUJBQWUsS0FBSyxPQUFPO0FBQUEsUUFDM0IsS0FBSyxLQUFLO0FBQUEsUUFDVixTQUFTLE1BQU0scUNBQVcsS0FBSztBQUFBO0FBQUEsTUFFOUIsS0FBSztBQUFBLElBQ1IsQ0FDRCxDQUNIO0FBQUEsRUFFSjtBQUVPLFdBQVMsTUFBTTtBQUFBLElBQ3BCLFFBQVEsQ0FBQztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsWUFBWTtBQUFBLElBQ1osWUFBWTtBQUFBLElBQ1osR0FBRztBQUFBLEVBQ0wsR0FBRztBQUNELFVBQU0sV0FBVyxjQUFjO0FBQy9CLFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLFdBQVcsWUFBWSxXQUFXLHNCQUFzQixxQkFBcUIsSUFBSSxTQUFTLEdBQUcsS0FBSztBQUFBLFFBQ2pHLEdBQUc7QUFBQTtBQUFBLE1BRUgsTUFBTSxJQUFJLENBQUMsTUFBTSxVQUFVO0FBQzFCLGNBQU0sU0FBUyxRQUFRLFVBQVUsU0FBUyxVQUFVLFVBQVUsWUFBWTtBQUMxRSxlQUNFLG9DQUFDLFFBQUcsV0FBVywrQkFBK0IsTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssU0FBUyxTQUNwRixvQ0FBQyxTQUFJLFdBQVUsd0JBQ2Isb0NBQUMsVUFBSyxXQUFVLGdCQUFlLGVBQVksVUFDeEMsV0FBVyxTQUFTLE9BQU8sUUFBUSxDQUN0QyxHQUNDLFFBQVEsTUFBTSxTQUFTLElBQUksb0NBQUMsVUFBSyxXQUFVLGlCQUFnQixlQUFZLFFBQU8sSUFBSyxJQUN0RixHQUNBLG9DQUFDLFNBQUksV0FBVSxzQkFDYixvQ0FBQyxVQUFLLFdBQVUsb0JBQWtCLEtBQUssS0FBTSxHQUM1QyxLQUFLLGNBQWMsb0NBQUMsVUFBSyxXQUFVLG1CQUFpQixLQUFLLFdBQVksSUFBVSxJQUNsRixDQUNGO0FBQUEsTUFFSixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBRUo7QUFFTyxXQUFTLFdBQVcsRUFBRSxPQUFPLGFBQWEsUUFBUSxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDbEYsV0FDRSxvQ0FBQyxTQUFJLFdBQVcsa0JBQWtCLFNBQVMsR0FBRyxLQUFLLEdBQUksR0FBRyxRQUN4RCxvQ0FBQyxVQUFLLFdBQVUsaUJBQWdCLGVBQVksUUFBTyxHQUNsRCxRQUFRLG9DQUFDLFlBQU8sV0FBVSxvQkFBa0IsS0FBTSxJQUFZLE1BQzlELGNBQWMsb0NBQUMsT0FBRSxXQUFVLG1CQUFpQixXQUFZLElBQU8sTUFDL0QsU0FBUyxvQ0FBQyxTQUFJLFdBQVUscUJBQW1CLE1BQU8sSUFBUyxJQUM5RDtBQUFBLEVBRUo7OztBQ2hIQSxXQUFTLGFBQWEsRUFBRSxTQUFTLEdBQUc7QUFDbEMsVUFBTSxTQUFTLE1BQU0sT0FBTyxJQUFJO0FBQ2hDLFVBQU0sQ0FBQyxNQUFNLE9BQU8sSUFBSSxNQUFNLFNBQVMsSUFBSTtBQUUzQyxVQUFNLGdCQUFnQixNQUFNO0FBTjlCO0FBT0ksZ0JBQVEsWUFBTyxZQUFQLG1CQUFnQixRQUFRLDBCQUF5QixJQUFJO0FBQUEsSUFDL0QsR0FBRyxDQUFDLENBQUM7QUFFTCxRQUFJLENBQUMsS0FBTSxRQUFPLG9DQUFDLFVBQUssS0FBSyxRQUFRLFdBQVUscUJBQW9CLGVBQVksUUFBTztBQUN0RixXQUFPLFNBQVMsYUFBYSxVQUFVLElBQUk7QUFBQSxFQUM3QztBQUVPLFdBQVMsTUFBTSxFQUFFLE1BQU0sT0FBTyxVQUFVLFNBQVMsU0FBUyxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDMUYsUUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixXQUNFLG9DQUFDLG9CQUNDLG9DQUFDLFNBQUksV0FBVywrQkFBK0IsU0FBUyxHQUFHLEtBQUssR0FBRyxNQUFLLGdCQUFnQixHQUFHLFFBQ3pGLG9DQUFDLGFBQVEsV0FBVSxZQUFXLE1BQUssVUFBUyxjQUFXLFFBQU8sY0FBWSxTQUN4RSxvQ0FBQyxZQUFPLFdBQVUscUJBQ2hCLG9DQUFDLFlBQU8sV0FBVSxvQkFBa0IsS0FBTSxHQUN6QyxVQUFVLG9DQUFDLFVBQU8sU0FBUyxXQUFTLGNBQUUsSUFBWSxJQUNyRCxHQUNBLG9DQUFDLFNBQUksV0FBVSxtQkFBaUIsUUFBUyxHQUN4QyxVQUFVLG9DQUFDLFlBQU8sV0FBVSxxQkFBbUIsT0FBUSxJQUFZLElBQ3RFLENBQ0YsQ0FDRjtBQUFBLEVBRUo7QUFFTyxXQUFTLGNBQWM7QUFBQSxJQUM1QjtBQUFBLElBQ0EsUUFBUTtBQUFBLElBQ1I7QUFBQSxJQUNBLGVBQWU7QUFBQSxJQUNmLGNBQWM7QUFBQSxJQUNkO0FBQUEsSUFDQTtBQUFBLElBQ0EsWUFBWTtBQUFBLElBQ1osR0FBRztBQUFBLEVBQ0wsR0FBRztBQUNELFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBLFNBQVM7QUFBQSxRQUNSLEdBQUc7QUFBQSxRQUNKLFNBQ0UsMERBQ0Usb0NBQUMsVUFBTyxTQUFTLFlBQVcsV0FBWSxHQUN4QyxvQ0FBQyxVQUFPLFNBQVEsV0FBVSxTQUFTLGFBQVksWUFBYSxDQUM5RDtBQUFBO0FBQUEsTUFHRixvQ0FBQyxPQUFFLFdBQVUsd0JBQXNCLE9BQVE7QUFBQSxJQUM3QztBQUFBLEVBRUo7QUFFTyxXQUFTLE1BQU0sRUFBRSxNQUFNLFVBQVUsWUFBWSxJQUFJLEdBQUcsS0FBSyxHQUFHO0FBQ2pFLFFBQUksQ0FBQyxLQUFNLFFBQU87QUFDbEIsV0FDRSxvQ0FBQyxvQkFDQyxvQ0FBQyxTQUFJLFdBQVcsdUJBQXVCLFNBQVMsR0FBRyxLQUFLLEdBQUcsTUFBSyxVQUFVLEdBQUcsUUFBTyxRQUFTLENBQy9GO0FBQUEsRUFFSjtBQUVPLFdBQVMsZUFBZSxFQUFFLE1BQU0sUUFBUSxzQkFBTyxZQUFZLElBQUksR0FBRyxLQUFLLEdBQUc7QUFDL0UsUUFBSSxDQUFDLEtBQU0sUUFBTztBQUNsQixXQUNFLG9DQUFDLG9CQUNDLG9DQUFDLFNBQUksV0FBVyx5QkFBeUIsU0FBUyxHQUFHLEtBQUssR0FBRyxNQUFLLFVBQVUsR0FBRyxRQUM3RSxvQ0FBQyxVQUFLLFdBQVUsb0JBQW1CLGVBQVksUUFBTyxHQUN0RCxvQ0FBQyxVQUFLLFdBQVUsc0JBQW9CLEtBQU0sQ0FDNUMsQ0FDRjtBQUFBLEVBRUo7OztBQy9FTyxXQUFTLFFBQVEsRUFBRSxZQUFZLElBQUksT0FBTyxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQ3BFLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLFVBQVUsU0FBUyxHQUFHLEtBQUssR0FBRyxPQUFPLEVBQUUsVUFBVSxZQUFZLEdBQUcsTUFBTSxHQUFJLEdBQUcsUUFDM0Ysb0NBQUMsVUFBSyxXQUFVLDZCQUE0QixlQUFZLFFBQU8sR0FDL0Qsb0NBQUMsVUFBSyxXQUFVLDZCQUE0QixlQUFZLFFBQU8sR0FDOUQsUUFDSDtBQUFBLEVBRUo7QUFFTyxXQUFTLFVBQVUsRUFBRSxHQUFHLEdBQUcsT0FBTyxJQUFJLFNBQVMsWUFBWSxJQUFJLE9BQU8sR0FBRyxLQUFLLEdBQUc7QUFDdEYsVUFBTSxPQUFPLGNBQWMsSUFBSSxPQUFPO0FBQ3RDLFdBQ0U7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLE1BQUs7QUFBQSxRQUNMLFdBQVcsaUJBQWlCLFNBQVMsR0FBRyxLQUFLO0FBQUEsUUFDN0MsY0FBWTtBQUFBLFFBQ1osT0FBTyxFQUFFLE1BQU0sR0FBRyxDQUFDLEtBQUssS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU07QUFBQSxRQUM5QyxHQUFHO0FBQUEsUUFDSCxHQUFHO0FBQUE7QUFBQSxNQUVKLG9DQUFDLFVBQUssV0FBVSx1QkFBc0IsZUFBWSxRQUFPO0FBQUEsSUFDM0Q7QUFBQSxFQUVKO0FBRU8sV0FBUyxXQUFXLEVBQUUsV0FBVyxVQUFVLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQ3JGLFdBQ0Usb0NBQUMsU0FBSSxXQUFXLGlDQUFpQyxRQUFRLElBQUksU0FBUyxHQUFHLEtBQUssR0FBSSxHQUFHLFFBQ2xGLFFBQ0g7QUFBQSxFQUVKOzs7QUMxQkEsTUFBTSxPQUFPO0FBQUEsSUFDWCxFQUFFLE9BQU8sZ0JBQU0sSUFBSSxXQUFXO0FBQUEsSUFDOUIsRUFBRSxPQUFPLGdCQUFNLElBQUksUUFBUTtBQUFBLElBQzNCLEVBQUUsT0FBTyxnQkFBTSxJQUFJLFVBQVU7QUFBQSxFQUMvQjtBQUVPLFdBQVMsYUFBYSxFQUFFLFNBQVMsR0FBRztBQUN6QyxVQUFNLFdBQVcsWUFBWTtBQUM3QixXQUNFLG9DQUFDLGVBQVksV0FBVSxnQ0FBK0IsTUFBWSxVQUFVLFVBQVUsY0FBVyxzREFDOUYsUUFDSDtBQUFBLEVBRUo7OztBQ0RBLE1BQU0sUUFBUTtBQUFBLElBQ1osRUFBRSxJQUFJLGdCQUFnQixNQUFNLDRCQUFRLE9BQU8sZ0JBQU0sUUFBUSxLQUFLO0FBQUEsSUFDOUQsRUFBRSxJQUFJLGVBQWUsTUFBTSw0QkFBUSxPQUFPLHNCQUFPLFFBQVEsS0FBSztBQUFBLElBQzlELEVBQUUsSUFBSSxjQUFjLE1BQU0sZ0JBQU0sT0FBTyxnQkFBTSxRQUFRLE1BQU07QUFBQSxJQUMzRCxFQUFFLElBQUksZUFBZSxNQUFNLDRCQUFRLE9BQU8sZ0JBQU0sUUFBUSxNQUFNO0FBQUEsRUFDaEU7QUFFTyxXQUFTLGVBQWU7QUFDN0IsVUFBTSxDQUFDLFlBQVksYUFBYSxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ3hELFdBQ0Usb0NBQUMsb0JBQ0Msb0NBQUMsVUFBTyxJQUFHLGVBQWMsS0FBSyxJQUFJLFdBQVUsK0JBQzFDLG9DQUFDLGNBQVcsSUFBRyxpQkFBZ0IsU0FBUSxnQkFBZSxXQUFVLGtCQUFpQixPQUFNLHdDQUFTLFVBQVMsNEVBQWUsU0FBUyxvQ0FBQyxVQUFPLFdBQVUsZ0JBQWUsSUFBRyxrQkFBZSxjQUFFLEdBQVcsR0FDak0sb0NBQUMsUUFBSyxJQUFHLGtCQUFpQixXQUFVLHFCQUNsQyxvQ0FBQyxVQUFPLFdBQVUsd0JBQXVCLEtBQUssS0FDNUMsb0NBQUMsUUFBSyxXQUFVLDJCQUF3QixnQ0FBSyxHQUM3QyxvQ0FBQyxZQUFPLFdBQVUsMkJBQXdCLFlBQUssR0FDL0Msb0NBQUMsUUFBSyxXQUFVLDBCQUF1QixrRkFBb0IsQ0FDN0QsQ0FDRixHQUNBLG9DQUFDLGFBQVUsSUFBRyxnQkFBZSxXQUFVLGlCQUFnQixTQUFTLENBQUMsRUFBRSxLQUFLLFFBQVEsT0FBTyxlQUFLLEdBQUcsRUFBRSxLQUFLLFNBQVMsT0FBTyxlQUFLLEdBQUcsRUFBRSxLQUFLLFVBQVUsT0FBTyxlQUFLLENBQUMsR0FBRyxNQUFNLE9BQU8sV0FBVyxDQUFDLFFBQVEsSUFBSSxJQUFJLEdBQ3hNLG9DQUFDLFVBQU8sSUFBRyxrQkFBaUIsV0FBVSxtQkFBa0IsS0FBSyxNQUMzRCxvQ0FBQyxPQUFJLFdBQVUsMkJBQTBCLFlBQVcsVUFBUyxnQkFBZSxtQkFDMUUsb0NBQUMsUUFBSyxXQUFVLDJCQUF3QixvQkFBRyxHQUMzQyxvQ0FBQyxVQUFPLElBQUcsd0JBQXVCLFdBQVUseUJBQXdCLFNBQVMsTUFBTSxjQUFjLElBQUksS0FBRyxjQUFFLENBQzVHLEdBQ0Esb0NBQUMsT0FBSSxXQUFVLHdCQUF1QixLQUFLLE1BQ3pDLG9DQUFDLFVBQU8sV0FBVSxrQkFBaUIsZUFBWSxjQUFhLEtBQUssR0FBRyxZQUFXLFlBQVMsb0NBQUMsVUFBTyxXQUFVLHlCQUF3QixPQUFNLHNCQUFNLEdBQUUsb0NBQUMsUUFBSyxXQUFVLHlCQUFzQixvQkFBRyxDQUFPLEdBQ2hNLG9DQUFDLFVBQU8sV0FBVSxrQkFBaUIsZUFBWSxlQUFjLEtBQUssR0FBRyxZQUFXLFlBQVMsb0NBQUMsVUFBTyxXQUFVLHlCQUF3QixPQUFNLGdCQUFLLEdBQUUsb0NBQUMsUUFBSyxXQUFVLHlCQUFzQixjQUFFLENBQU8sR0FDL0wsb0NBQUMsVUFBTyxXQUFVLGtCQUFpQixlQUFZLGVBQWMsS0FBSyxHQUFHLFlBQVcsWUFBUyxvQ0FBQyxVQUFPLFdBQVUseUJBQXdCLE9BQU0sZ0JBQUssR0FBRSxvQ0FBQyxRQUFLLFdBQVUseUJBQXNCLGNBQUUsQ0FBTyxDQUNqTSxDQUNGLEdBQ0Esb0NBQUMsVUFBTyxJQUFHLGVBQWMsV0FBVSxnQkFBZSxTQUFRLFdBQVUsSUFBRyxrQkFBZSwwQkFBSSxHQUMxRjtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsSUFBRztBQUFBLFFBQ0gsV0FBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sT0FBTTtBQUFBLFFBQ04sU0FBUyxNQUFNLGNBQWMsS0FBSztBQUFBLFFBQ2xDLFNBQVMsb0NBQUMsVUFBTyxXQUFVLHlCQUF3QixTQUFRLFdBQVUsU0FBUyxNQUFNLGNBQWMsS0FBSyxLQUFHLDBCQUFJO0FBQUE7QUFBQSxNQUU5RyxvQ0FBQyxhQUFVLFdBQVUsd0JBQXVCLE9BQU0sOENBQVUsU0FBUSx5QkFDbEUsb0NBQUMsYUFBVSxJQUFHLHVCQUFzQixXQUFVLHdCQUF1QixhQUFZLDhDQUFVLENBQzdGO0FBQUEsSUFDRixDQUNGLENBQ0Y7QUFBQSxFQUVKOzs7QUNqREEsTUFBTSxTQUFTO0FBQUEsSUFDYixFQUFFLElBQUksZUFBZSxPQUFPLHdDQUFVLE1BQU0sMkNBQW9CLE1BQU0saUZBQWdCO0FBQUEsSUFDdEYsRUFBRSxJQUFJLGVBQWUsT0FBTyxrQ0FBUyxNQUFNLDBDQUFtQixNQUFNLGlGQUFnQjtBQUFBLElBQ3BGLEVBQUUsSUFBSSxlQUFlLE9BQU8sNEJBQVEsTUFBTSwyQ0FBb0IsTUFBTSxpRkFBZ0I7QUFBQSxJQUNwRixFQUFFLElBQUksY0FBYyxPQUFPLHdDQUFVLE1BQU0sMENBQW1CLE1BQU0sMkVBQWU7QUFBQSxJQUNuRixFQUFFLElBQUksZ0JBQWdCLE9BQU8sd0NBQVUsTUFBTSw2Q0FBaUIsTUFBTSwyRUFBZTtBQUFBLElBQ25GLEVBQUUsSUFBSSxlQUFlLE9BQU8sd0NBQVUsTUFBTSwyQ0FBb0IsTUFBTSxxRUFBYztBQUFBLEVBQ3RGO0FBRU8sV0FBUyxpQkFBaUI7QUFDL0IsV0FDRSxvQ0FBQyxvQkFDQyxvQ0FBQyxVQUFPLElBQUcsaUJBQWdCLEtBQUssSUFBSSxXQUFVLGlDQUM1QztBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsSUFBRztBQUFBLFFBQ0gsU0FBUTtBQUFBLFFBQ1IsWUFBVztBQUFBLFFBQ1gsV0FBVTtBQUFBLFFBQ1YsT0FBTTtBQUFBLFFBQ04sVUFBUztBQUFBLFFBQ1QsU0FBUyxvQ0FBQyxVQUFPLElBQUcsdUJBQXNCLFdBQVUsd0JBQXVCLElBQUcsaUJBQWMsY0FBRTtBQUFBO0FBQUEsSUFDaEcsR0FDQSxvQ0FBQyxRQUFLLElBQUcscUJBQW9CLFdBQVUseUNBQXdDLElBQUcsa0JBQ2hGLG9DQUFDLG9CQUFpQixXQUFVLDRCQUEyQixRQUFRLEtBQUssY0FBYyxHQUFHLEdBQ3JGLG9DQUFDLFVBQU8sV0FBVSxvREFBbUQsS0FBSyxNQUN4RSxvQ0FBQyxPQUFJLFdBQVUsOENBQTZDLEtBQUssS0FDL0Qsb0NBQUMsU0FBTSxXQUFVLDhCQUEyQiwwQkFBSSxHQUNoRCxvQ0FBQyxTQUFNLFdBQVUsOEJBQTJCLHNDQUFNLENBQ3BELEdBQ0Esb0NBQUMsV0FBUSxXQUFVLDRCQUEyQixPQUFPLEtBQUcsc0NBQU0sR0FDOUQsb0NBQUMsUUFBSyxXQUFVLDZCQUEwQiwwS0FBNEIsR0FDdEUsb0NBQUMsT0FBSSxXQUFVLDZDQUE0QyxLQUFLLE1BQzlELG9DQUFDLFFBQUssV0FBVSxrQ0FBK0IsUUFBTSxHQUNyRCxvQ0FBQyxRQUFLLFdBQVUsa0NBQStCLHVCQUFNLEdBQ3JELG9DQUFDLFFBQUssV0FBVSxrQ0FBK0IsY0FBRSxDQUNuRCxDQUNGLENBQ0YsR0FDQSxvQ0FBQyxXQUFRLElBQUcseUJBQXdCLFdBQVUsa0RBQWlELE9BQU8sS0FBRywwQkFBSSxHQUM3RyxvQ0FBQyxRQUFLLElBQUcsbUJBQWtCLFdBQVUsb0JBQW1CLFNBQVMsR0FBRyxLQUFLLE1BQ3RFLE9BQU8sSUFBSSxDQUFDLE9BQU8sVUFDbEIsb0NBQUMsUUFBSyxXQUFVLDJDQUEwQyxlQUFhLE1BQU0sSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFHLGtCQUNqRyxvQ0FBQyxvQkFBaUIsV0FBVSx5QkFBd0IsUUFBUSxRQUFRLE1BQU0sSUFBSSxNQUFNLEtBQUssY0FBYyxHQUFHLEdBQzFHLG9DQUFDLFVBQU8sV0FBVSxpREFBZ0QsS0FBSyxLQUNyRSxvQ0FBQyxXQUFRLFdBQVUseUJBQXdCLE9BQU8sS0FBSSxNQUFNLEtBQU0sR0FDbEUsb0NBQUMsUUFBSyxXQUFVLDBCQUF3QixNQUFNLElBQUssR0FDbkQsb0NBQUMsUUFBSyxXQUFVLDBCQUF3QixNQUFNLElBQUssQ0FDckQsQ0FDRixDQUNELENBQ0gsQ0FDRixDQUNGO0FBQUEsRUFFSjs7O0FDdkVPLFdBQVMsWUFBWSxFQUFFLFlBQVksSUFBSSxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQ2pFLFdBQ0Usb0NBQUMsV0FBUSxXQUFXLGdCQUFnQixTQUFTLEdBQUcsS0FBSyxHQUFJLEdBQUcsUUFDekQsUUFDSDtBQUFBLEVBRUo7OztBQ1dPLFdBQVMsbUJBQW1CO0FBQ2pDLFdBQ0Usb0NBQUMsb0JBQ0Msb0NBQUMsVUFBTyxJQUFHLG9CQUFtQixLQUFLLElBQUksV0FBVSxvQ0FDL0M7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLElBQUc7QUFBQSxRQUNILFNBQVE7QUFBQSxRQUNSLFdBQVU7QUFBQSxRQUNWLE9BQU07QUFBQSxRQUNOLFVBQVM7QUFBQSxRQUNULFNBQVMsb0NBQUMsVUFBTyxXQUFVLHFCQUFvQixJQUFHLGNBQVcsY0FBRTtBQUFBO0FBQUEsSUFDakUsR0FDQSxvQ0FBQyxPQUFJLElBQUcsdUJBQXNCLFdBQVUseUNBQXdDLEtBQUssS0FDbkYsb0NBQUMsU0FBTSxXQUFVLHlCQUFzQixjQUFFLEdBQ3pDLG9DQUFDLFNBQU0sV0FBVSx5QkFBc0IsY0FBRSxHQUN6QyxvQ0FBQyxTQUFNLFdBQVUseUJBQXNCLGNBQUUsR0FDekMsb0NBQUMsU0FBTSxXQUFVLHlCQUFzQixjQUFFLENBQzNDLEdBQ0Esb0NBQUMsZUFBWSxJQUFHLHNCQUFxQixXQUFVLHFDQUM3QyxvQ0FBQyxhQUFVLFdBQVUsdUJBQXNCLGVBQVksdUJBQXNCLEdBQUcsSUFBSSxHQUFHLElBQUksT0FBTSw4Q0FBVSxJQUFHLGdCQUFlLEdBQzdILG9DQUFDLGFBQVUsV0FBVSx1QkFBc0IsZUFBWSxlQUFjLEdBQUcsSUFBSSxHQUFHLElBQUksT0FBTSx3Q0FBUyxJQUFHLGdCQUFlLEdBQ3BILG9DQUFDLGFBQVUsV0FBVSx1QkFBc0IsZUFBWSxnQkFBZSxHQUFHLElBQUksR0FBRyxJQUFJLE9BQU0sd0NBQVMsSUFBRyxnQkFBZSxHQUNySCxvQ0FBQyxhQUFVLFdBQVUsdUJBQXNCLGVBQVksaUJBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksT0FBTSw4Q0FBVSxJQUFHLGdCQUFlLEdBQ3ZILG9DQUFDLGNBQVcsV0FBVSx3QkFBdUIsVUFBUyxZQUNwRCxvQ0FBQyxRQUFLLFdBQVUsOEJBQTZCLElBQUcsa0JBQzlDLG9DQUFDLFVBQU8sV0FBVSw2QkFBNEIsS0FBSyxLQUNqRCxvQ0FBQyxRQUFLLFdBQVUsa0NBQStCLDJCQUFVLEdBQ3pELG9DQUFDLFlBQU8sV0FBVSxnQ0FBNkIsNENBQU8sR0FDdEQsb0NBQUMsUUFBSyxXQUFVLCtCQUE0QixxREFBb0IsQ0FDbEUsQ0FDRixDQUNGLENBQ0YsQ0FDRixDQUNGO0FBQUEsRUFFSjs7O0FDckNBLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxJQUFJLGNBQWMsTUFBTSxTQUFTLE9BQU8sa0NBQVMsTUFBTSw4RkFBd0IsS0FBSyxlQUFLO0FBQUEsSUFDM0YsRUFBRSxJQUFJLG1CQUFtQixNQUFNLFNBQVMsT0FBTyxrQ0FBUyxNQUFNLHNIQUF1QixLQUFLLGVBQUs7QUFBQSxJQUMvRixFQUFFLElBQUksZ0JBQWdCLE1BQU0sU0FBUyxPQUFPLHdDQUFVLE1BQU0sc0hBQXVCLEtBQUssZUFBSztBQUFBLElBQzdGLEVBQUUsSUFBSSxlQUFlLE1BQU0sU0FBUyxPQUFPLHdDQUFVLE1BQU0sd0dBQXdCLEtBQUssZUFBSztBQUFBLElBQzdGLEVBQUUsSUFBSSxlQUFlLE1BQU0sU0FBUyxPQUFPLHdDQUFVLE1BQU0sNEhBQXdCLEtBQUssZUFBSztBQUFBLElBQzdGLEVBQUUsSUFBSSxnQkFBZ0IsTUFBTSxTQUFTLE9BQU8sd0NBQVUsTUFBTSw0SEFBd0IsS0FBSyxlQUFLO0FBQUEsSUFDOUYsRUFBRSxJQUFJLGdCQUFnQixNQUFNLFNBQVMsT0FBTyx3Q0FBVSxNQUFNLHNIQUF1QixLQUFLLGVBQUs7QUFBQSxFQUMvRjtBQUVPLFdBQVMsa0JBQWtCO0FBQ2hDLFdBQ0Usb0NBQUMsb0JBQ0Msb0NBQUMsVUFBTyxJQUFHLGtCQUFpQixLQUFLLElBQUksV0FBVSxrQ0FDN0M7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLElBQUc7QUFBQSxRQUNILFNBQVE7QUFBQSxRQUNSLFdBQVU7QUFBQSxRQUNWLE9BQU07QUFBQSxRQUNOLFVBQVM7QUFBQSxRQUNULFNBQVMsb0NBQUMsVUFBTyxXQUFVLG1CQUFrQixJQUFHLGtCQUFlLGNBQUU7QUFBQTtBQUFBLElBQ25FLEdBQ0E7QUFBQSxNQUFDO0FBQUE7QUFBQSxRQUNDLElBQUc7QUFBQSxRQUNILFdBQVU7QUFBQSxRQUNWLFNBQVM7QUFBQSxRQUNULE9BQU8sQ0FBQyxFQUFFLElBQUksV0FBVyxPQUFPLGVBQUssR0FBRyxFQUFFLElBQUksYUFBYSxPQUFPLGVBQUssR0FBRyxFQUFFLElBQUksV0FBVyxPQUFPLGVBQUssQ0FBQztBQUFBO0FBQUEsSUFDMUcsR0FDQSxvQ0FBQyxVQUFPLElBQUcsb0JBQW1CLFdBQVUscUJBQW9CLEtBQUssTUFDOUQsT0FBTyxJQUFJLENBQUMsVUFDWCxvQ0FBQyxPQUFJLFdBQVUsb0JBQW1CLGVBQWEsTUFBTSxJQUFJLEtBQUssTUFBTSxJQUFJLEtBQUssSUFBSSxZQUFXLGdCQUMxRixvQ0FBQyxRQUFLLFdBQVUscUJBQW1CLE1BQU0sSUFBSyxHQUM5QyxvQ0FBQyxRQUFLLFdBQVUsMkJBQ2Qsb0NBQUMsVUFBTyxXQUFVLHlCQUF3QixLQUFLLEtBQzdDLG9DQUFDLE9BQUksV0FBVSw0QkFBMkIsWUFBVyxVQUFTLGdCQUFlLGlCQUFnQixLQUFLLEtBQ2hHLG9DQUFDLFdBQVEsV0FBVSwwQkFBeUIsT0FBTyxLQUFJLE1BQU0sS0FBTSxHQUNuRSxvQ0FBQyxTQUFNLFdBQVUsNEJBQTBCLE1BQU0sR0FBSSxDQUN2RCxHQUNBLG9DQUFDLFFBQUssV0FBVSwyQkFBeUIsTUFBTSxJQUFLLENBQ3RELENBQ0YsQ0FDRixDQUNELENBQ0gsR0FDQSxvQ0FBQyxRQUFLLElBQUcsc0JBQXFCLFdBQVUseUJBQ3RDLG9DQUFDLFVBQU8sV0FBVSw0QkFBMkIsS0FBSyxLQUNoRCxvQ0FBQyxZQUFPLFdBQVUsK0JBQTRCLDBCQUFJLEdBQ2xELG9DQUFDLFFBQUssV0FBVSw4QkFBMkIsNElBQXVCLENBQ3BFLENBQ0YsR0FDQSxvQ0FBQyxVQUFPLElBQUcsMkJBQTBCLFdBQVUsNEJBQTJCLFNBQVEsV0FBVSxJQUFHLGlCQUFjLHNDQUFNLENBQ3JILENBQ0Y7QUFBQSxFQUVKOzs7QUMxRE8sV0FBUyxjQUFjO0FBQzVCLFdBQ0Usb0NBQUMsVUFBTyxJQUFHLGNBQWEsS0FBSyxJQUFJLFdBQVUsK0JBQ3pDLG9DQUFDLFVBQUssSUFBRyxjQUFhLFdBQVUsd0NBQXVDLGVBQVksUUFBTyxHQUMxRixvQ0FBQyxVQUFPLFdBQVUsZ0JBQWUsS0FBSyxLQUNwQyxvQ0FBQyxXQUFRLElBQUcsZUFBYyxXQUFVLGdCQUFlLE9BQU8sS0FBRywwQkFBSSxHQUNqRSxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLG9IQUFtQixDQUMxRCxHQUNBLG9DQUFDLGFBQVUsV0FBVSxzQkFBcUIsT0FBTSxzQkFBTSxTQUFRLGlCQUM1RCxvQ0FBQyxhQUFVLElBQUcsZUFBYyxXQUFVLHNCQUFxQixXQUFVLE9BQU0sYUFBWSx3Q0FBUyxDQUNsRyxHQUNBLG9DQUFDLGFBQVUsV0FBVSxxQkFBb0IsT0FBTSxzQkFBTSxTQUFRLGNBQWEsTUFBSyxpRkFDN0Usb0NBQUMsYUFBVSxJQUFHLGNBQWEsV0FBVSxxQkFBb0IsV0FBVSxXQUFVLGFBQVksd0NBQVMsQ0FDcEcsR0FDQSxvQ0FBQyxVQUFPLElBQUcsZ0JBQWUsV0FBVSxpQkFBZ0IsU0FBUSxXQUFVLElBQUcsY0FBVywwQkFBSSxHQUN4RixvQ0FBQyxRQUFLLFdBQVUsb0JBQW1CLElBQUcsV0FBUSx3R0FBaUIsQ0FDakU7QUFBQSxFQUVKOzs7QUNoQk8sV0FBUyxnQkFBZ0I7QUFDOUIsVUFBTSxDQUFDLGVBQWUsZ0JBQWdCLElBQUksTUFBTSxTQUFTLElBQUk7QUFDN0QsVUFBTSxDQUFDLGFBQWEsY0FBYyxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQzFELFdBQ0Usb0NBQUMsb0JBQ0Msb0NBQUMsVUFBTyxJQUFHLGdCQUFlLEtBQUssSUFBSSxXQUFVLGdDQUMzQyxvQ0FBQyxjQUFXLElBQUcsa0JBQWlCLFNBQVEsaUJBQWdCLFdBQVUsbUJBQWtCLE9BQU0sZ0JBQUssVUFBUywwREFBWSxHQUNwSCxvQ0FBQyxPQUFJLElBQUcsbUJBQWtCLFdBQVUsb0JBQW1CLEtBQUssSUFBSSxZQUFXLFlBQ3pFLG9DQUFDLFVBQU8sV0FBVSxtQkFBa0IsTUFBTSxJQUFJLE9BQU0sd0NBQVMsR0FDN0Qsb0NBQUMsU0FBSSxXQUFVLHVCQUNiLG9DQUFDLFlBQU8sV0FBVSxtQkFBZ0Isb0JBQUcsR0FDckMsb0NBQUMsUUFBSyxXQUFVLGtCQUFlLDBDQUFVLENBQzNDLENBQ0YsR0FDQSxvQ0FBQyxVQUFPLElBQUcsbUJBQWtCLFdBQVUsb0JBQW1CLEtBQUssS0FDN0Qsb0NBQUMsUUFBSyxXQUFVLHlCQUF3QixPQUFNLDRCQUFPLFVBQVMsb0RBQVcsR0FDekUsb0NBQUMsUUFBSyxXQUFVLHlCQUF3QixPQUFNLHNCQUFNLFVBQVMsMENBQVcsR0FDeEUsb0NBQUMsUUFBSyxXQUFVLHlCQUF3QixPQUFNLGtDQUFRLFVBQVMsc0JBQU0sQ0FDdkUsR0FDQSxvQ0FBQyxVQUFPLElBQUcsb0JBQW1CLFdBQVUscUJBQW9CLEtBQUssTUFDL0Qsb0NBQUMsT0FBSSxXQUFVLHdCQUF1QixZQUFXLFVBQVMsZ0JBQWUsbUJBQ3ZFLG9DQUFDLFFBQUssV0FBVSw0QkFBeUIsMEJBQUksR0FDN0Msb0NBQUMsVUFBTyxJQUFHLHlCQUF3QixXQUFVLDBCQUF5QixTQUFTLGVBQWUsVUFBVSxrQkFBa0IsQ0FDNUgsR0FDQSxvQ0FBQyxPQUFJLFdBQVUsd0JBQXVCLFlBQVcsVUFBUyxnQkFBZSxtQkFDdkUsb0NBQUMsUUFBSyxXQUFVLDRCQUF5QixrREFBUSxHQUNqRCxvQ0FBQyxVQUFPLElBQUcsd0JBQXVCLFdBQVUseUJBQXdCLFNBQVMsYUFBYSxVQUFVLGdCQUFnQixDQUN0SCxDQUNGLEdBQ0Esb0NBQUMsVUFBTyxJQUFHLG1CQUFrQixXQUFVLG9CQUFtQixLQUFLLEtBQzdELG9DQUFDLFFBQUssV0FBVSx5QkFBd0IsT0FBTSxrQ0FBUSxHQUN0RCxvQ0FBQyxRQUFLLFdBQVUseUJBQXdCLE9BQU0sNEJBQU8sR0FDckQsb0NBQUMsUUFBSyxXQUFVLHlCQUF3QixPQUFNLHdDQUFTLE9BQU0sT0FBTSxDQUNyRSxDQUNGLENBQ0Y7QUFBQSxFQUVKOzs7QUNoQ0EsTUFBTSxRQUFRO0FBQUEsSUFDWixFQUFFLElBQUksa0JBQWtCLE9BQU8sa0NBQVMsVUFBVSxzREFBcUI7QUFBQSxJQUN2RSxFQUFFLElBQUksZUFBZSxPQUFPLHdDQUFVLFVBQVUsc0RBQXFCO0FBQUEsSUFDckUsRUFBRSxJQUFJLGFBQWEsT0FBTyw0QkFBUSxVQUFVLHdEQUFrQjtBQUFBLElBQzlELEVBQUUsSUFBSSxlQUFlLE9BQU8sNEJBQVEsVUFBVSxzREFBcUI7QUFBQSxJQUNuRSxFQUFFLElBQUksYUFBYSxPQUFPLHdDQUFVLFVBQVUsc0NBQWU7QUFBQSxFQUMvRDtBQUVPLFdBQVMsb0JBQW9CO0FBQ2xDLFVBQU0sQ0FBQyxLQUFLLE1BQU0sSUFBSSxNQUFNLFNBQVMsVUFBVTtBQUMvQyxXQUNFLG9DQUFDLG9CQUNDLG9DQUFDLFVBQU8sSUFBRyxxQkFBb0IsS0FBSyxJQUFJLFdBQVUscUNBQ2hELG9DQUFDLGVBQVksSUFBRyw0QkFBMkIsV0FBVSw2QkFBNEIsT0FBTyxDQUFDLEVBQUUsT0FBTyxnQkFBTSxJQUFJLFdBQVcsR0FBRyxFQUFFLE9BQU8sdUNBQVMsQ0FBQyxHQUFHLEdBQ2hKLG9DQUFDLG9CQUFpQixJQUFHLHFCQUFvQixXQUFVLHNCQUFxQixRQUFRLEtBQUssY0FBYyxHQUFHLEdBQ3RHLG9DQUFDLFVBQU8sSUFBRyx3QkFBdUIsV0FBVSx5QkFBd0IsS0FBSyxNQUN2RSxvQ0FBQyxPQUFJLFdBQVUseUNBQXdDLEtBQUssS0FDMUQsb0NBQUMsU0FBTSxXQUFVLHlCQUFzQiwwQkFBSSxHQUMzQyxvQ0FBQyxTQUFNLFdBQVUseUJBQXNCLGNBQUUsR0FDekMsb0NBQUMsU0FBTSxXQUFVLHlCQUFzQiwwQkFBSSxDQUM3QyxHQUNBLG9DQUFDLFdBQVEsSUFBRyxzQkFBcUIsV0FBVSx1QkFBc0IsT0FBTyxLQUFHLHNDQUFNLEdBQ2pGLG9DQUFDLFFBQUssV0FBVSx5QkFBc0IsNE9BQXVDLENBQy9FLEdBQ0Esb0NBQUMsUUFBSyxJQUFHLHNCQUFxQixXQUFVLHVCQUFzQixTQUFTLEdBQUcsS0FBSyxLQUM3RSxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLG9DQUFDLFVBQUssV0FBVSw4QkFBMkIsUUFBTSxHQUFPLG9DQUFDLFVBQUssV0FBVSw4QkFBMkIsb0JBQUcsQ0FBTyxHQUNsSixvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLG9DQUFDLFVBQUssV0FBVSw4QkFBMkIsZ0JBQUksR0FBTyxvQ0FBQyxVQUFLLFdBQVUsOEJBQTJCLDBCQUFJLENBQU8sR0FDakosb0NBQUMsUUFBSyxXQUFVLHdCQUFxQixvQ0FBQyxVQUFLLFdBQVUsOEJBQTJCLFVBQUcsR0FBTyxvQ0FBQyxVQUFLLFdBQVUsOEJBQTJCLDBCQUFJLENBQU8sQ0FDbEosR0FDQSxvQ0FBQyxRQUFLLElBQUcscUJBQW9CLFdBQVUsc0JBQXFCLFVBQVUsS0FBSyxVQUFVLFFBQVEsT0FBTyxDQUFDLEVBQUUsSUFBSSxZQUFZLE9BQU8sMkJBQU8sR0FBRyxFQUFFLElBQUksU0FBUyxPQUFPLDJCQUFPLENBQUMsR0FBRyxHQUN4SyxRQUFRLGFBQ1Asb0NBQUMsVUFBTyxJQUFHLHNCQUFxQixXQUFVLHVCQUFzQixLQUFLLEtBQ2xFLE1BQU0sSUFBSSxDQUFDLE1BQU0sVUFDaEIsb0NBQUMsUUFBSyxXQUFVLHNCQUFxQixlQUFhLEtBQUssSUFBSSxLQUFLLEtBQUssSUFBSSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssS0FBSyxLQUFLLElBQUksVUFBVSxLQUFLLFVBQVUsT0FBTyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQ2hLLENBQ0gsSUFFQSxvQ0FBQyxRQUFLLElBQUcsc0JBQXFCLFdBQVUseUJBQ3RDLG9DQUFDLFVBQU8sV0FBVSw0QkFBMkIsS0FBSyxNQUNoRCxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLHNJQUFzQixHQUMzRCxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLGdJQUFxQixHQUMxRCxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLDJJQUEyQixDQUNsRSxDQUNGLEdBRUYsb0NBQUMsUUFBSyxJQUFHLHNCQUFxQixXQUFVLHlCQUN0QyxvQ0FBQyxVQUFPLFdBQVUsNEJBQTJCLEtBQUssS0FDaEQsb0NBQUMsV0FBUSxXQUFVLDZCQUE0QixPQUFPLEtBQUcsZ0NBQUssR0FDOUQsb0NBQUMsUUFBSyxXQUFVLDhCQUEyQiw4SEFBMEIsQ0FDdkUsQ0FDRixHQUNBLG9DQUFDLFVBQU8sSUFBRyx3QkFBdUIsV0FBVSx5QkFBd0IsS0FBSyxNQUN2RSxvQ0FBQyxVQUFPLElBQUcsaUNBQWdDLFdBQVUsa0NBQWlDLElBQUcsZUFBWSxzQ0FBTSxHQUMzRyxvQ0FBQyxVQUFPLElBQUcsOEJBQTZCLFdBQVUsK0JBQThCLFNBQVEsV0FBVSxJQUFHLGlCQUFjLHdEQUFTLENBQzlILENBQ0YsQ0FDRjtBQUFBLEVBRUo7OztBQzFETyxXQUFTLG9CQUFvQjtBQUNsQyxVQUFNLENBQUMsYUFBYSxjQUFjLElBQUksTUFBTSxTQUFTLEtBQUs7QUFDMUQsVUFBTSxDQUFDLFNBQVMsVUFBVSxJQUFJLE1BQU0sU0FBUyxLQUFLO0FBQ2xELFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVMsS0FBSztBQUU5QyxVQUFNLGFBQWEsTUFBTTtBQUN2QixxQkFBZSxLQUFLO0FBQ3BCLGlCQUFXLElBQUk7QUFDZixhQUFPLFdBQVcsTUFBTTtBQUN0QixtQkFBVyxLQUFLO0FBQ2hCLGlCQUFTLElBQUk7QUFBQSxNQUNmLEdBQUcsR0FBRztBQUFBLElBQ1I7QUFFQSxXQUNFLG9DQUFDLG9CQUNDLG9DQUFDLFVBQU8sSUFBRyxxQkFBb0IsS0FBSyxJQUFJLFdBQVUscUNBQ2hELG9DQUFDLGNBQVcsSUFBRyx1QkFBc0IsU0FBUSxzQkFBcUIsV0FBVSx3QkFBdUIsT0FBTSw0QkFBTyxVQUFTLDRFQUFlLEdBQ3hJLG9DQUFDLFNBQU0sSUFBRyxzQkFBcUIsV0FBVSx1QkFBc0IsU0FBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLElBQUksU0FBUyxPQUFPLDJCQUFPLEdBQUcsRUFBRSxJQUFJLFVBQVUsT0FBTyxlQUFLLEdBQUcsRUFBRSxJQUFJLFdBQVcsT0FBTyxlQUFLLENBQUMsR0FBRyxHQUNuTCxvQ0FBQyxRQUFLLElBQUcsd0JBQXVCLFdBQVUsMkJBQ3hDLG9DQUFDLFVBQU8sV0FBVSw4QkFBNkIsS0FBSyxNQUNsRCxvQ0FBQyxPQUFJLFdBQVUsaUNBQWdDLFlBQVcsVUFBUyxnQkFBZSxpQkFBZ0IsS0FBSyxLQUNyRyxvQ0FBQyxZQUFPLFdBQVUsNkJBQTBCLHNDQUFNLEdBQ2xELG9DQUFDLFNBQU0sV0FBVSwwQkFBdUIsb0JBQUcsQ0FDN0MsR0FDQSxvQ0FBQyxRQUFLLFdBQVUsd0JBQXFCLGtEQUFvQixHQUN6RCxvQ0FBQyxRQUFLLFdBQVUseUJBQXNCLDZFQUF3QixDQUNoRSxDQUNGLEdBQ0Esb0NBQUMsVUFBTyxJQUFHLHdCQUF1QixXQUFVLHlCQUF3QixLQUFLLEtBQ3ZFLG9DQUFDLFFBQUssV0FBVSx3QkFBdUIsT0FBTSw0QkFBTyxVQUFTLHVEQUFjLEdBQzNFLG9DQUFDLFFBQUssV0FBVSx3QkFBdUIsT0FBTSw0QkFBTyxPQUFNLGdCQUFLLEdBQy9ELG9DQUFDLFFBQUssV0FBVSx3QkFBdUIsT0FBTSw0QkFBTyxPQUFNLFlBQU0sR0FDaEUsb0NBQUMsUUFBSyxXQUFVLHdCQUF1QixPQUFNLDRCQUFPLE9BQU0sc0JBQU0sQ0FDbEUsR0FDQSxvQ0FBQyxRQUFLLElBQUcsdUJBQXNCLFdBQVUsd0JBQXVCLElBQUcsWUFDakUsb0NBQUMsT0FBSSxXQUFVLDZCQUE0QixZQUFXLFVBQVMsZ0JBQWUsbUJBQzVFLG9DQUFDLFVBQU8sV0FBVSw2QkFBNEIsS0FBSyxLQUNqRCxvQ0FBQyxRQUFLLFdBQVUsZ0NBQTZCLGdDQUFLLEdBQ2xELG9DQUFDLFFBQUssV0FBVSwrQkFBNEIsa0RBQVEsQ0FDdEQsR0FDQSxvQ0FBQyxVQUFLLFdBQVUseUJBQXNCLFlBQUssQ0FDN0MsQ0FDRixHQUNBLG9DQUFDLFVBQU8sSUFBRyx3QkFBdUIsV0FBVSx5QkFBd0IsS0FBSyxNQUN2RSxvQ0FBQyxVQUFPLElBQUcsdUJBQXNCLFdBQVUsd0JBQXVCLFNBQVEsV0FBVSxTQUFTLE1BQU0sZUFBZSxJQUFJLEtBQUcsZ0NBQUssR0FDOUgsb0NBQUMsVUFBTyxXQUFVLDhCQUE2QixJQUFHLFdBQVEsc0NBQU0sQ0FDbEUsR0FDQTtBQUFBLE1BQUM7QUFBQTtBQUFBLFFBQ0MsSUFBRztBQUFBLFFBQ0gsV0FBVTtBQUFBLFFBQ1YsTUFBTTtBQUFBLFFBQ04sT0FBTTtBQUFBLFFBQ04sU0FBUTtBQUFBLFFBQ1IsY0FBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsVUFBVSxNQUFNLGVBQWUsS0FBSztBQUFBO0FBQUEsSUFDdEMsR0FDQSxvQ0FBQyxrQkFBZSxJQUFHLHdCQUF1QixXQUFVLHlCQUF3QixNQUFNLFNBQVMsT0FBTSx3Q0FBUyxHQUMxRyxvQ0FBQyxTQUFNLElBQUcsc0JBQXFCLFdBQVUsdUJBQXNCLE1BQU0sU0FBTyx3R0FBaUIsQ0FDL0YsQ0FDRjtBQUFBLEVBRUo7OztBQy9ETyxXQUFTLG1CQUFtQjtBQUNqQyxVQUFNLENBQUMsVUFBVSxXQUFXLElBQUksTUFBTSxTQUFTLElBQUk7QUFDbkQsV0FDRSxvQ0FBQyxvQkFDQyxvQ0FBQyxVQUFPLElBQUcsb0JBQW1CLEtBQUssSUFBSSxXQUFVLG9DQUMvQyxvQ0FBQyxjQUFXLElBQUcsc0JBQXFCLFNBQVEscUJBQW9CLFdBQVUsdUJBQXNCLE9BQU0sNEJBQU8sVUFBUyxnRUFBYSxTQUFTLG9DQUFDLFVBQU8sV0FBVSx1QkFBc0IsSUFBRyxrQkFBZSxjQUFFLEdBQVcsR0FDbk4sb0NBQUMsU0FBTSxJQUFHLHFCQUFvQixXQUFVLHNCQUFxQixTQUFTLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBSSxTQUFTLE9BQU8sMkJBQU8sR0FBRyxFQUFFLElBQUksVUFBVSxPQUFPLGVBQUssR0FBRyxFQUFFLElBQUksV0FBVyxPQUFPLGVBQUssQ0FBQyxHQUFHLEdBQ2pMLG9DQUFDLGFBQVUsV0FBVSwyQkFBMEIsT0FBTSw0QkFBTyxTQUFRLHNCQUNsRSxvQ0FBQyxhQUFVLElBQUcsb0JBQW1CLFdBQVUsMkJBQTBCLGNBQWEsd0NBQVMsQ0FDN0YsR0FDQSxvQ0FBQyxhQUFVLFdBQVUsMkJBQTBCLE9BQU0sNEJBQU8sU0FBUSxvQkFBbUIsTUFBSyx3RUFDMUYsb0NBQUMsYUFBVSxJQUFHLG9CQUFtQixXQUFVLDJCQUEwQixjQUFhLGNBQWEsQ0FDakcsR0FDQSxvQ0FBQyxhQUFVLFdBQVUsNEJBQTJCLE9BQU0sNEJBQU8sU0FBUSx1QkFDbkUsb0NBQUMsVUFBTyxJQUFHLHFCQUFvQixXQUFVLDZCQUE0QixjQUFhLFdBQ2hGLG9DQUFDLFlBQU8sV0FBVSw2QkFBNEIsT0FBTSxXQUFRLHFEQUFXLEdBQ3ZFLG9DQUFDLFlBQU8sV0FBVSw2QkFBNEIsT0FBTSxlQUFZLGdDQUFLLEdBQ3JFLG9DQUFDLFlBQU8sV0FBVSw2QkFBNEIsT0FBTSxZQUFTLGdDQUFLLENBQ3BFLENBQ0YsR0FDQSxvQ0FBQyxVQUFPLElBQUcsb0JBQW1CLFdBQVUscUJBQW9CLEtBQUssS0FDL0Qsb0NBQUMsVUFBSyxXQUFVLDhCQUEyQiwwQkFBSSxHQUMvQyxvQ0FBQyxPQUFJLFdBQVUsNkJBQTRCLEtBQUssTUFDOUMsb0NBQUMsU0FBTSxXQUFVLDRCQUEyQixNQUFLLFFBQU8sT0FBTSxnQkFBSyxnQkFBYyxNQUFDLEdBQ2xGLG9DQUFDLFNBQU0sV0FBVSw0QkFBMkIsTUFBSyxRQUFPLE9BQU0sZ0JBQUssR0FDbkUsb0NBQUMsU0FBTSxXQUFVLDRCQUEyQixNQUFLLFFBQU8sT0FBTSxnQkFBSyxDQUNyRSxDQUNGLEdBQ0Esb0NBQUMsYUFBVSxXQUFVLDJCQUEwQixPQUFNLDRCQUFPLFNBQVEsc0JBQ2xFLG9DQUFDLFlBQVMsSUFBRyxvQkFBbUIsV0FBVSwyQkFBMEIsYUFBWSwwR0FBb0IsQ0FDdEcsR0FDQSxvQ0FBQyxVQUFPLElBQUcsMkJBQTBCLFdBQVUsNEJBQTJCLEtBQUssTUFDN0Usb0NBQUMsWUFBUyxXQUFVLDJCQUEwQixPQUFNLDBEQUFZLEdBQ2hFLG9DQUFDLFlBQVMsV0FBVSwyQkFBMEIsT0FBTSwwREFBWSxnQkFBYyxNQUFDLEdBQy9FLG9DQUFDLFVBQU8sSUFBRyx3QkFBdUIsV0FBVSx5QkFBd0IsU0FBUyxVQUFVLFVBQVUsYUFBYSxPQUFNLDhDQUFVLENBQ2hJLEdBQ0Esb0NBQUMsVUFBTyxJQUFHLG9CQUFtQixXQUFVLHFCQUFvQixTQUFRLFdBQVUsSUFBRyxZQUFTLDhEQUFVLENBQ3RHLENBQ0Y7QUFBQSxFQUVKOzs7QUMxQ0EsTUFBTSxRQUFRO0FBQUEsSUFDWixFQUFFLElBQUksY0FBYyxPQUFPLHdDQUFVLE1BQU0sc0JBQVksUUFBUSxzQkFBTyxRQUFRLHFDQUFjO0FBQUEsSUFDNUYsRUFBRSxJQUFJLGFBQWEsT0FBTyx3Q0FBVSxNQUFNLHNCQUFZLFFBQVEsc0JBQU8sUUFBUSxxQ0FBYztBQUFBLElBQzNGLEVBQUUsSUFBSSxlQUFlLE9BQU8sd0NBQVUsTUFBTSxxQkFBVyxRQUFRLHNCQUFPLFFBQVEscUNBQWM7QUFBQSxJQUM1RixFQUFFLElBQUksY0FBYyxPQUFPLGtDQUFTLE1BQU0sc0JBQVksUUFBUSxzQkFBTyxRQUFRLHFDQUFjO0FBQUEsRUFDN0Y7QUFFTyxXQUFTLGNBQWM7QUFDNUIsVUFBTSxDQUFDLEtBQUssTUFBTSxJQUFJLE1BQU0sU0FBUyxVQUFVO0FBQy9DLFdBQ0Usb0NBQUMsb0JBQ0Msb0NBQUMsVUFBTyxJQUFHLGNBQWEsS0FBSyxJQUFJLFdBQVUsOEJBQ3pDO0FBQUEsTUFBQztBQUFBO0FBQUEsUUFDQyxJQUFHO0FBQUEsUUFDSCxTQUFRO0FBQUEsUUFDUixXQUFVO0FBQUEsUUFDVixPQUFNO0FBQUEsUUFDTixVQUFTO0FBQUEsUUFDVCxTQUFTLG9DQUFDLFVBQU8sSUFBRyx1QkFBc0IsV0FBVSx3QkFBdUIsSUFBRyxpQkFBYyxjQUFFO0FBQUE7QUFBQSxJQUNoRyxHQUNBLG9DQUFDLFFBQUssSUFBRyxjQUFhLFdBQVUsZUFBYyxVQUFVLEtBQUssVUFBVSxRQUFRLE9BQU8sQ0FBQyxFQUFFLElBQUksWUFBWSxPQUFPLHFCQUFNLEdBQUcsRUFBRSxJQUFJLGFBQWEsT0FBTyxxQkFBTSxHQUFHLEVBQUUsSUFBSSxTQUFTLE9BQU8sZUFBSyxDQUFDLEdBQUcsR0FDMUwsUUFBUSxhQUNQLG9DQUFDLFVBQU8sSUFBRyxrQkFBaUIsV0FBVSxlQUFjLEtBQUssTUFDdEQsTUFBTSxJQUFJLENBQUMsU0FDVixvQ0FBQyxRQUFLLFdBQVUsZUFBYyxlQUFhLEtBQUssSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFHLGtCQUNuRSxvQ0FBQyxVQUFPLFdBQVUsb0JBQW1CLEtBQUssS0FDeEMsb0NBQUMsT0FBSSxXQUFVLHVCQUFzQixZQUFXLFVBQVMsZ0JBQWUsaUJBQWdCLEtBQUssS0FDM0Ysb0NBQUMsV0FBUSxXQUFVLHFCQUFvQixPQUFPLEtBQUksS0FBSyxLQUFNLEdBQzdELG9DQUFDLFNBQU0sV0FBVSx3QkFBc0IsS0FBSyxNQUFPLENBQ3JELEdBQ0Esb0NBQUMsUUFBSyxXQUFVLHNCQUFvQixLQUFLLElBQUssR0FDOUMsb0NBQUMsT0FBSSxXQUFVLHFCQUFvQixLQUFLLE1BQ3RDLG9DQUFDLFFBQUssV0FBVSx3QkFBc0IsS0FBSyxNQUFPLEdBQ2xELG9DQUFDLFFBQUssV0FBVSwwQkFBdUIsZ0NBQUssQ0FDOUMsQ0FDRixDQUNGLENBQ0QsQ0FDSCxJQUNFLFFBQVEsY0FDVixvQ0FBQyxVQUFPLElBQUcsbUJBQWtCLFdBQVUsb0JBQW1CLEtBQUssTUFDN0Qsb0NBQUMsUUFBSyxXQUFVLGVBQWMsZUFBWSxtQkFBa0IsSUFBRyxrQkFBZSxvQ0FBQyxVQUFPLFdBQVUsb0JBQW1CLEtBQUssS0FBRyxvQ0FBQyxXQUFRLFdBQVUscUJBQW9CLE9BQU8sS0FBRywwQkFBSSxHQUFVLG9DQUFDLFFBQUssV0FBVSxzQkFBbUIsNENBQWMsQ0FBTyxDQUFTLEdBQzNQLG9DQUFDLFFBQUssV0FBVSxlQUFjLGVBQVksbUJBQWtCLElBQUcsa0JBQWUsb0NBQUMsVUFBTyxXQUFVLG9CQUFtQixLQUFLLEtBQUcsb0NBQUMsV0FBUSxXQUFVLHFCQUFvQixPQUFPLEtBQUcsc0NBQU0sR0FBVSxvQ0FBQyxRQUFLLFdBQVUsc0JBQW1CLDRDQUFjLENBQU8sQ0FBUyxHQUM3UCxvQ0FBQyxRQUFLLFdBQVUsZUFBYyxlQUFZLGtCQUFpQixJQUFHLGtCQUFlLG9DQUFDLFVBQU8sV0FBVSxvQkFBbUIsS0FBSyxLQUFHLG9DQUFDLFdBQVEsV0FBVSxxQkFBb0IsT0FBTyxLQUFHLGdDQUFLLEdBQVUsb0NBQUMsUUFBSyxXQUFVLHNCQUFtQiw0Q0FBYyxDQUFPLENBQVMsQ0FDN1AsSUFFQSxvQ0FBQyxjQUFXLElBQUcscUJBQW9CLFdBQVUsZ0JBQWUsT0FBTSw4Q0FBVSxhQUFZLGtJQUF3QixRQUFRLG9DQUFDLFVBQU8sV0FBVSx1QkFBc0IsSUFBRyxjQUFXLGdDQUFLLEdBQVcsQ0FFbE0sQ0FDRjtBQUFBLEVBRUo7OztBQzNETyxNQUFNLFVBQVU7QUFBQSxJQUNyQixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsTUFDVCxRQUFRLEVBQUUsT0FBTyxLQUFLLFFBQVEsSUFBSTtBQUFBLElBQ3BDO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxJQUNqQixTQUFTO0FBQUEsTUFDUDtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsT0FBTyxDQUFDLFVBQVU7QUFBQSxRQUNsQixXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZUFBZSxnQkFBZ0IsU0FBUyxTQUFTO0FBQUEsUUFDckUsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixTQUFTLFNBQVM7QUFBQSxRQUN0RCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZUFBZSxhQUFhLGVBQWUsU0FBUyxTQUFTO0FBQUEsUUFDakYsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixlQUFlLFNBQVMsU0FBUztBQUFBLFFBQ3JFLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxnQkFBZ0IsVUFBVSxTQUFTLFNBQVM7QUFBQSxRQUNoRSxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZ0JBQWdCLFNBQVMsU0FBUztBQUFBLFFBQ3RELFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxVQUFVLFNBQVMsU0FBUztBQUFBLFFBQ2hELFdBQVcsQ0FBQyw0QkFBUSw0QkFBUSwwQkFBTTtBQUFBLE1BQ3BDO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZ0JBQWdCLGVBQWUsU0FBUyxTQUFTO0FBQUEsUUFDckUsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLFNBQVMsU0FBUztBQUFBLFFBQ3RDLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDdkZBLGtCQUFnQixPQUFPO0FBRXZCLFdBQVMsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUU7QUFBQSxJQUNuRCxvQ0FBQyxpQkFBYyxPQUFNLFdBQ25CLG9DQUFDLHFCQUFrQixXQUNqQixvQ0FBQyxTQUFNLFNBQWtCLENBQzNCLENBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJwcm9qZWN0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAic2x1ZyIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAiX2EiLCAiaW50ZXJzZWN0UmVjdCIsICJyZXNvbHZlUG9zaXRpb25zIiwgInNhbWVQb3NpdGlvbnMiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgInRhYnMiXQp9Cg==
