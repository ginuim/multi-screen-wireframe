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
  function ShortcutHelp({
    demoAvailable,
    showCanvasIndex,
    onShowCanvasIndexChange,
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
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: visible,
        trackpadZoom,
        zoomSensitivity
      });
    }, [project2.name, trackpadZoom, zoomSensitivity]);
    const updateTrackpadZoom = React.useCallback((enabled) => {
      setTrackpadZoom(enabled);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: canvasIndexVisible,
        trackpadZoom: enabled,
        zoomSensitivity
      });
    }, [canvasIndexVisible, project2.name, zoomSensitivity]);
    const updateZoomSensitivity = React.useCallback((value) => {
      const normalized = normalizeZoomSensitivity(value);
      setZoomSensitivity(normalized);
      saveBoardSettings(getBoardStorage(), project2.name, {
        showCanvasIndex: canvasIndexVisible,
        trackpadZoom,
        zoomSensitivity: normalized
      });
    }, [canvasIndexVisible, project2.name, trackpadZoom]);
    const canvasIndexSettingsProjectRef = React.useRef(null);
    React.useEffect(() => {
      const settings = readBoardSettings(getBoardStorage(), project2.name);
      setCanvasIndexVisible(settings.showCanvasIndex);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9tYXAuanN4IiwgIi4uL3NyYy9sYXlvdXRzL01vYmlsZUxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvYnVkZ2V0LmpzeCIsICIuLi9zcmMvc2NyZWVucy9kaXNjb3Zlci5qc3giLCAiLi4vc3JjL2NvbXBvbmVudHMvU2hhbmdoYWlNYXAuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCIsICIuLi9zcmMvc2NyZWVucy9pdGluZXJhcnkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvc2NyZWVucy9wcm9maWxlLmpzeCIsICIuLi9zcmMvc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXAtY29uZmlybS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXBzLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBmaW5kRmxvd1RhcmdldElkIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvaW50ZXJEb3duVGFyZ2V0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudCA9IGV2ZW50LnRhcmdldFxuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFMERcdTYzQTVcdTdCQTFcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMENcdThCQTlcdTRFOEJcdTRFRjZcdTg0M0RcdTUyMzBcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcbiAgICBpZiAoY2FudmFzTG9ja2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1REYyXHU1QzU1XHU1RjAwXHU2NUUwXHU1M0VGXHU2RURBXHU1MzNBXHU1N0RGXHVGRjBDXHU0RTBEXHU2MkEyXHU2MzA3XHU5NDg4XG4gICAgaWYgKGV4cGFuZGVkKSByZXR1cm5cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBsb2NrZWQ6IGNhbnZhc0xvY2tlZCwgc2NhbGUgfSlcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBzdGF0ZVxuICAgIC8vIFx1N0I0OVx1NzcxRlx1NkI2M1x1NjJENlx1OEZDN1x1OTYwOFx1NTAzQ1x1NTE4RCBjYXB0dXJlXHUzMDAyXHU4RkM3XHU2NUU5IHNldFBvaW50ZXJDYXB0dXJlIFx1NEYxQVx1NjI4QSBjbGljayBcdTkxQ0RcdTVCOUFcdTU0MTFcdTUyMzBcbiAgICAvLyAud2Ytc2NyZWVuLWNvbnRlbnRcdUZGMENcdTVCRkNcdTgxRjQgZGF0YS1mbG93LXRvIFx1NTlENFx1NjI1OFx1NEUwRVx1N0VDNFx1NEVGNiBvbkNsaWNrIFx1NTE2OFx1OTBFOFx1NTkzMVx1NjU0OFx1MzAwMlxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgY29uc3Qgd2FzTW92ZWQgPSBzdGF0ZS5tb3ZlZFxuICAgIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpXG4gICAgaWYgKCF3YXNNb3ZlZCAmJiBzdGF0ZS5tb3ZlZCkge1xuICAgICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgICAgdHJ5IHtcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgLy8gaWdub3JlOiBcdTkwRThcdTUyMDZcdTczQUZcdTU4ODNcdTU3MjggcG9pbnRlcnVwIFx1NTQwRVx1OEMwM1x1NzUyOFx1NEYxQVx1NjI5QlxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNvbnN0IHJvb3QgPSBjb250ZW50UmVmLmN1cnJlbnRcbiAgICBjb25zdCBkb3duVGFyZ2V0ID0gcG9pbnRlckRvd25UYXJnZXRSZWYuY3VycmVudFxuICAgIHBvaW50ZXJEb3duVGFyZ2V0UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgLy8gcG9pbnRlciBjYXB0dXJlIFx1NEVDRFx1NTNFRlx1ODBGRFx1NjI4QSBjbGljay50YXJnZXQgXHU2NTM5XHU2MjEwXHU1MTg1XHU1QkI5XHU2ODM5XHVGRjFCXHU1NkRFXHU5MDAwXHU1MjMwIHBvaW50ZXJkb3duIFx1NzZFRVx1NjgwN1xuICAgIGNvbnN0IHN0YXJ0RWwgPSBkb3duVGFyZ2V0ICYmIHJvb3Q/LmNvbnRhaW5zKGRvd25UYXJnZXQpID8gZG93blRhcmdldCA6IGV2ZW50LnRhcmdldFxuICAgIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290KVxuICAgIGlmICghdG8pIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICBuYXZpZ2F0ZSh0bylcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuY29uc3QgVFJBQ0tQQURfWk9PTV9SQVRFID0gMC4wMDE1XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZWRXaGVlbERlbHRhKGV2ZW50KSB7XG4gIGlmIChldmVudC5kZWx0YU1vZGUgPT09IDEpIHJldHVybiBldmVudC5kZWx0YVkgKiAxNlxuICBpZiAoZXZlbnQuZGVsdGFNb2RlID09PSAyKSByZXR1cm4gZXZlbnQuZGVsdGFZICogMTAwXG4gIHJldHVybiBldmVudC5kZWx0YVlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5leHRXaGVlbFNjYWxlKHNjYWxlLCBldmVudCwgeyB0cmFja3BhZE1vZGUgPSBmYWxzZSwgc2Vuc2l0aXZpdHkgPSAwLjYgfSA9IHt9KSB7XG4gIGlmICghdHJhY2twYWRNb2RlKSByZXR1cm4gY2xhbXBTY2FsZShzY2FsZSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSlcbiAgY29uc3QgZGVsdGEgPSBub3JtYWxpemVkV2hlZWxEZWx0YShldmVudClcbiAgaWYgKCFkZWx0YSkgcmV0dXJuIHNjYWxlXG4gIHJldHVybiBjbGFtcFNjYWxlKHNjYWxlICogTWF0aC5leHAoLWRlbHRhICogVFJBQ0tQQURfWk9PTV9SQVRFICogc2Vuc2l0aXZpdHkpKVxufVxuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShcbiAgZWwsXG4gIGdldFNjYWxlLFxuICBzZXRTY2FsZSxcbiAgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UsXG4gIGdldE9wdGlvbnMgPSAoKSA9PiAoe30pLFxuKSB7XG4gIGlmICghZWwpIHJldHVybiAoKSA9PiB7fVxuICBjb25zdCBvbldoZWVsID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQ6IGdldExvY2tlZCgpIH0pKSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgc2V0U2NhbGUobmV4dFdoZWVsU2NhbGUoZ2V0U2NhbGUoKSwgZXZlbnQsIGdldE9wdGlvbnMoKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBsb2NrZWRSZWYgPSBSZWFjdC51c2VSZWYobG9ja2VkKVxuICBjb25zdCBvcHRpb25zUmVmID0gUmVhY3QudXNlUmVmKG9wdGlvbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuICBvcHRpb25zUmVmLmN1cnJlbnQgPSBvcHRpb25zXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICAgICgpID0+IG9wdGlvbnNSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiZXhwb3J0IGNvbnN0IENBTlZBU19JTkRFWF9NQVJHSU4gPSAxNlxuXG5mdW5jdGlvbiBmaW5pdGUodmFsdWUsIGZhbGxiYWNrID0gMCkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihwb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpKVxuICBjb25zdCBjb250YWluZXJIZWlnaHQgPSBNYXRoLm1heCgwLCBmaW5pdGUoY29udGFpbmVyPy5oZWlnaHQpKVxuICBjb25zdCBpdGVtV2lkdGggPSBNYXRoLm1heCgwLCBmaW5pdGUoaXRlbT8ud2lkdGgpKVxuICBjb25zdCBpdGVtSGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LmhlaWdodCkpXG4gIGNvbnN0IG1heFggPSBNYXRoLm1heChtYXJnaW4sIGNvbnRhaW5lcldpZHRoIC0gaXRlbVdpZHRoIC0gbWFyZ2luKVxuICBjb25zdCBtYXhZID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJIZWlnaHQgLSBpdGVtSGVpZ2h0IC0gbWFyZ2luKVxuICByZXR1cm4ge1xuICAgIHg6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueCwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WCksXG4gICAgeTogTWF0aC5taW4oTWF0aC5tYXgoZmluaXRlKHBvc2l0aW9uPy55LCBtYXJnaW4pLCBtYXJnaW4pLCBtYXhZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24oY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIHJldHVybiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24oe1xuICAgIHg6IChmaW5pdGUoY29udGFpbmVyPy53aWR0aCkgLSBmaW5pdGUoaXRlbT8ud2lkdGgpKSAvIDIsXG4gICAgeTogZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSAtIGZpbml0ZShpdGVtPy5oZWlnaHQpIC0gbWFyZ2luLFxuICB9LCBjb250YWluZXIsIGl0ZW0sIG1hcmdpbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKGdldEVsZW1lbnRzLCBvblJlYWR5LCBzY2hlZHVsZXIpIHtcbiAgbGV0IGFjdGl2ZSA9IHRydWVcbiAgbGV0IGZyYW1lID0gbnVsbFxuXG4gIGNvbnN0IGF0dGVtcHQgPSAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2V0RWxlbWVudHMoKVxuICAgIGlmICghZWxlbWVudHM/LmNvbnRhaW5lciB8fCAhZWxlbWVudHM/Lml0ZW0pIHtcbiAgICAgIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmcmFtZSA9IG51bGxcbiAgICBvblJlYWR5KGVsZW1lbnRzKVxuICB9XG5cbiAgZnJhbWUgPSBzY2hlZHVsZXIucmVxdWVzdChhdHRlbXB0KVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgaWYgKGZyYW1lICE9IG51bGwpIHNjaGVkdWxlci5jYW5jZWwoZnJhbWUpXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZm9jdXNDYW52YXNTY3JlZW4sIHJlc2V0Q2FudmFzVmlld3BvcnQsIHBhbkZyb21EcmFnU25hcHNob3QgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHtcbiAgY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uLFxuICBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbixcbiAgd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMsXG59IGZyb20gJy4vY2FudmFzLWluZGV4LmpzJ1xuXG5jb25zdCBJTkRFWF9EUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gZWxlbWVudFNpemUoZWxlbWVudCkge1xuICByZXR1cm4geyB3aWR0aDogZWxlbWVudD8ub2Zmc2V0V2lkdGggfHwgMCwgaGVpZ2h0OiBlbGVtZW50Py5vZmZzZXRIZWlnaHQgfHwgMCB9XG59XG5cbmZ1bmN0aW9uIENhbnZhc0luZGV4KHtcbiAgY2FudmFzUmVmLFxuICBwcm9qZWN0LFxuICBjdXJyZW50U2NyZWVuSWQsXG4gIGRlbW9BdmFpbGFibGUsXG4gIHBvc2l0aW9uLFxuICBvblBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlLFxuICBuYXZpZ2F0ZSxcbiAgZW50ZXJEZW1vLFxufSkge1xuICBjb25zdCBpbmRleFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgY29uc3RyYWluID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHRQb3NpdGlvbiwgdXNlRGVmYXVsdCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICBjb25zdCBpbmRleCA9IGluZGV4UmVmLmN1cnJlbnRcbiAgICBpZiAoIWNhbnZhcyB8fCAhaW5kZXgpIHJldHVybiBuZXh0UG9zaXRpb25cbiAgICBjb25zdCBjb250YWluZXIgPSB7IHdpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsIGhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCB9XG4gICAgY29uc3QgaXRlbSA9IGVsZW1lbnRTaXplKGluZGV4KVxuICAgIHJldHVybiB1c2VEZWZhdWx0XG4gICAgICA/IGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSlcbiAgICAgIDogY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKG5leHRQb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtKVxuICB9LCBbY2FudmFzUmVmXSlcblxuICAvLyBwb3NpdGlvbiA9PSBudWxsIFx1ODg2OFx1NzkzQVx1NUMxQVx1NjcyQVx1ODQzRFx1NzBCOVx1RkYwOFx1NjIxNlx1OTg3OVx1NzZFRVx1NTIwN1x1NjM2Mlx1ODhBQlx1NkUwNVx1NjM4OVx1RkYwOVx1RkYxQlx1NUZDNVx1OTg3Qlx1NTE4RFx1OEREMVx1NEUwMFx1OTA0RFx1NUUwM1x1NUM0MFx1RkYwQ1xuICAvLyBcdTU0MjZcdTUyMTlcdTRGMUFcdTRFMDBcdTc2RjRcdTUzNjFcdTU3MjggdmlzaWJpbGl0eTpoaWRkZW5cdTMwMDJcbiAgY29uc3QgbmVlZHNEZWZhdWx0UG9zaXRpb24gPSBwb3NpdGlvbiA9PSBudWxsXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiB7fVxuICAgIGNvbnN0IHN0b3BXYWl0aW5nID0gd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMoXG4gICAgICAoKSA9PiAoeyBjb250YWluZXI6IGNhbnZhc1JlZi5jdXJyZW50LCBpdGVtOiBpbmRleFJlZi5jdXJyZW50IH0pLFxuICAgICAgKHsgY29udGFpbmVyOiBjYW52YXMsIGl0ZW06IGluZGV4IH0pID0+IHtcbiAgICAgICAgY29uc3QgdXBkYXRlID0gKCkgPT4gb25Qb3NpdGlvbkNoYW5nZSgoY3VycmVudCkgPT4gY29uc3RyYWluKGN1cnJlbnQsIGN1cnJlbnQgPT0gbnVsbCkpXG4gICAgICAgIHVwZGF0ZSgpXG5cbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHVwZGF0ZSlcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGNhbnZhcylcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGluZGV4KVxuICAgICAgICAgIGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcXVlc3Q6IChjYWxsYmFjaykgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayksXG4gICAgICAgIGNhbmNlbDogKGZyYW1lKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpLFxuICAgICAgfSxcbiAgICApXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcFdhaXRpbmcoKVxuICAgICAgZGlzY29ubmVjdFJlc2l6ZSgpXG4gICAgfVxuICB9LCBbY2FudmFzUmVmLCBjb25zdHJhaW4sIG5lZWRzRGVmYXVsdFBvc2l0aW9uLCBvblBvc2l0aW9uQ2hhbmdlXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17aW5kZXhSZWZ9XG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLWNhbnZhcy1pbmRleCBpcy1kcmFnZ2luZycgOiAnd2YtY2FudmFzLWluZGV4J31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHZpc2liaWxpdHk6ICdoaWRkZW4nIH19XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWhhbmRsZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uIHx8IGNvbnN0cmFpbihudWxsLCB0cnVlKVxuICAgICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBJTkRFWF9EUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2UoY29uc3RyYWluKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KSlcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWdyaXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48aSAvPjxpIC8+PGkgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWNsb3NlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIm00IDQgOCA4TTEyIDRsLTggOFwiIC8+PC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICB3aGVlbFpvb21PcHRpb25zLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG4gIGNhbnZhc0luZGV4VmlzaWJsZSA9IHRydWUsXG4gIGNhbnZhc0luZGV4UG9zaXRpb24sXG4gIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZUNhbnZhc0luZGV4LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQsIHdoZWVsWm9vbU9wdGlvbnMpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgLy8gXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XHU2NjJGXHU2ODQ2XHU2N0I2IGNocm9tZVx1RkYwQ1x1OTUwMVx1NEVBNFx1NEU5Mlx1NTNFQVx1Nzk4MVx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1RkYwQ1x1NEUwRFx1NjJBMlx1N0QyMlx1NUYxNVx1NzBCOVx1NTFGQiAvIFx1NjJENlx1NjJGRFxuICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdD8uKCcud2YtY2FudmFzLWluZGV4JykpIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGVudGVyRGVtbyA9IChzY3JlZW5JZCkgPT4ge1xuICAgIC8vIFx1OTUwMVx1NEVBNFx1NEU5Mlx1NjVGNiBzdGFnZSBcdTVERjIgcG9pbnRlci1ldmVudHM6bm9uZVx1RkYxQlx1N0QyMlx1NUYxNVx1NEVDRFx1NTNFRlx1NTNDQ1x1NTFGQlx1OEZEQlx1NkYxNFx1NzkzQVxuICAgIGlmICghZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uQ2xpY2s9e29uQ2FudmFzQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2FudmFzSW5kZXhWaXNpYmxlID8gKFxuICAgICAgICAgIDxDYW52YXNJbmRleFxuICAgICAgICAgICAgY2FudmFzUmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgICAgcG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlPXtvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvbkNsb3NlPXtvbkNsb3NlQ2FudmFzSW5kZXh9XG4gICAgICAgICAgICBuYXZpZ2F0ZT17bmF2aWdhdGV9XG4gICAgICAgICAgICBlbnRlckRlbW89e2VudGVyRGVtb31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICB3aGVlbFpvb21PcHRpb25zLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxuICBvbkNhbnZhc0NsaWNrLFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZCwgd2hlZWxab29tT3B0aW9ucylcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgdmlzaWJsZSA9IHRydWUsXG4gIHNlbGVjdGlvbnMsXG4gIG11bHRpU2VsZWN0LFxuICBpdGVtcyxcbiAgb25Ub2dnbGVNdWx0aVNlbGVjdCxcbiAgb25TZWxlY3RFbGVtZW50LFxuICBvbkhvdmVyRWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4QlwiIGhpZGRlbj17IXZpc2libGV9PlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWItc2VwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iXCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YW5jZXN0b3Iuc2VsZWN0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5jZXN0b3IubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3RvclwiPntzZWxlY3RlZC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZC5jdXJyZW50VGV4dCA/IChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY3VycmVudC10ZXh0XCI+XHU1RjUzXHU1MjREXHVGRjFBe3NlbGVjdGVkLmN1cnJlbnRUZXh0fTwvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTRGRUVcdTY1MzlcdTdDN0JcdTU3OEI8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1zZWxlY3RcIiB2YWx1ZT17dHlwZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0VHlwZShldmVudC50YXJnZXQudmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhSRVZJRVdfVFlQRV9MQUJFTFMpLm1hcCgoW3ZhbHVlLCBsYWJlbF0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1vcHRpb25cIiB2YWx1ZT17dmFsdWV9IGtleT17dmFsdWV9PntsYWJlbH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+e2luc3RydWN0aW9uTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWluc3RydWN0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbnN0cnVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0eXBlID09PSAnb3JkZXInID8gJ1x1NEY4Qlx1NTk4Mlx1RkYxQVx1NzlGQlx1NTJBOFx1NTIzMFx1OEJBMlx1NTM1NVx1NjQ1OFx1ODk4MVx1NEU0Qlx1NTQwRScgOiAnXHU2M0NGXHU4RkYwXHU1RTBDXHU2NzFCIEFJIFx1NTk4Mlx1NEY1NVx1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbnN0cnVjdGlvbihldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYWRkXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWluc3RydWN0aW9uLnRyaW0oKSAmJiB0eXBlICE9PSAncmVtb3ZlJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthZGRJdGVtfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1MkEwXHU1MTY1XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjA4e3NlbGVjdGlvbnMubGVuZ3RofSBcdTRFMkFcdTgyODJcdTcwQjlcdUZGMDlcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU0RTJEXHU3Njg0XHU4MjgyXHU3MEI5XHU1RjAwXHU1OUNCXHU0RkVFXHU2NTM5XHUzMDAyXHU3MEI5XHU1MUZCXHU5NzYyXHU1MzA1XHU1QzUxXHU1M0VGXHU1MjA3XHU2MzYyXHU1MjMwXHU3MjM2XHU3RUE3XHU3RUM0XHU0RUY2XHUzMDAyPC9wPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1PC9oMj5cbiAgICAgICAgICB7aXRlbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbXNcIj5cbiAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1cIiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tdGl0bGVcIj57aW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1tpdGVtLnR5cGVdfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGl0ZW0pLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuc2VsZWN0b3IpLmpvaW4oJ1x1MzAwMScpfVxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWluc3RydWN0aW9uXCI+e2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWRlbGV0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZUl0ZW0oaXRlbS5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ4XHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uIHdmLXJldmlldy1wcm9tcHQtc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2NzAwXHU3RUM4IFByb21wdDwvaDI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3JlZ2VuZXJhdGV9Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9tcHREaXJ0eSA/IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYW51YWxcIj5Qcm9tcHQgXHU1REYyXHU2MjRCXHU1MkE4XHU0RkVFXHU2NTM5XHVGRjFCXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU0RjFBXHU4OTg2XHU3NkQ2XHU2MjRCXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwcm9tcHR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIHNldFByb21wdERpcnR5KHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNvcHlcIiBvbkNsaWNrPXtjb3B5UHJvbXB0fT5cbiAgICAgICAgICAgIHtjb3BpZWQgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTU5MERcdTUyMzYgUHJvbXB0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImltcG9ydCB7IHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBzYW1lUG9zaXRpb25zKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGxlZnQuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgb3RoZXIgPSByaWdodFtpbmRleF1cbiAgICByZXR1cm4gaXRlbS5rZXkgPT09IG90aGVyLmtleVxuICAgICAgJiYgaXRlbS5pdGVtID09PSBvdGhlci5pdGVtXG4gICAgICAmJiBpdGVtLml0ZW1JbmRleCA9PT0gb3RoZXIuaXRlbUluZGV4XG4gICAgICAmJiBpdGVtLmxlZnQgPT09IG90aGVyLmxlZnRcbiAgICAgICYmIGl0ZW0udG9wID09PSBvdGhlci50b3BcbiAgfSlcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBjbGlwKSB7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChyZWN0LmxlZnQsIGNsaXAubGVmdClcbiAgY29uc3QgcmlnaHQgPSBNYXRoLm1pbihyZWN0LnJpZ2h0LCBjbGlwLnJpZ2h0KVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChyZWN0LnRvcCwgY2xpcC50b3ApXG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWluKHJlY3QuYm90dG9tLCBjbGlwLmJvdHRvbSlcbiAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgaXRlbXMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgcmV2aWV3VGFyZ2V0cyhpdGVtKS5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBsZXQgZWxlbWVudCA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGVsZW1lbnQgPSBib2FyZC5xdWVyeVNlbGVjdG9yKHRhcmdldC5zZWxlY3RvcilcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudD8uaXNDb25uZWN0ZWQpIHJldHVyblxuICAgICAgY29uc3Qgc2NyZWVuQ29udGVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JylcbiAgICAgIGlmICghc2NyZWVuQ29udGVudCkgcmV0dXJuXG4gICAgICBjb25zdCB2aXNpYmxlID0gaW50ZXJzZWN0UmVjdChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBzY3JlZW5Db250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgICAgaWYgKCF2aXNpYmxlKSByZXR1cm5cbiAgICAgIGNvbnN0IGJhc2VMZWZ0ID0gTWF0aC5yb3VuZCh2aXNpYmxlLnJpZ2h0IC0gYm9hcmRSZWN0LmxlZnQpXG4gICAgICBjb25zdCBiYXNlVG9wID0gTWF0aC5yb3VuZCh2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3ApXG4gICAgICBjb25zdCBvdmVybGFwQ291bnQgPSBwb3NpdGlvbnMuZmlsdGVyKFxuICAgICAgICAocG9zaXRpb24pID0+IE1hdGguYWJzKHBvc2l0aW9uLmJhc2VMZWZ0IC0gYmFzZUxlZnQpIDwgMiAmJiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlVG9wIC0gYmFzZVRvcCkgPCAyLFxuICAgICAgKS5sZW5ndGhcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAga2V5OiBgJHtpdGVtLmlkfToke3RhcmdldEluZGV4fWAsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1JbmRleCxcbiAgICAgICAgdGFyZ2V0SW5kZXgsXG4gICAgICAgIGJhc2VMZWZ0LFxuICAgICAgICBiYXNlVG9wLFxuICAgICAgICBsZWZ0OiBiYXNlTGVmdCArIG92ZXJsYXBDb3VudCAqIDE1LFxuICAgICAgICB0b3A6IGJhc2VUb3AsXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TWFya2Vycyh7IGJvYXJkUmVmLCBpdGVtcywgb25PcGVuUGFuZWwgfSkge1xuICBjb25zdCBbcG9zaXRpb25zLCBzZXRQb3NpdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFthY3RpdmVLZXksIHNldEFjdGl2ZUtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBmcmFtZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IHJlc29sdmVQb3NpdGlvbnMoYm9hcmRSZWYuY3VycmVudCwgaXRlbXMpXG4gICAgc2V0UG9zaXRpb25zKChjdXJyZW50KSA9PiBzYW1lUG9zaXRpb25zKGN1cnJlbnQsIG5leHQpID8gY3VycmVudCA6IG5leHQpXG4gIH0sIFtib2FyZFJlZiwgaXRlbXNdKVxuXG4gIGNvbnN0IHNjaGVkdWxlUmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgZnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZnJhbWVSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIHJlZnJlc2goKVxuICAgIH0pXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3Qoc2NoZWR1bGVSZWZyZXNoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtzY2hlZHVsZVJlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZUtleSAmJiAhcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSkpIHNldEFjdGl2ZUtleShudWxsKVxuICB9LCBbYWN0aXZlS2V5LCBwb3NpdGlvbnNdKVxuXG4gIGNvbnN0IGFjdGl2ZSA9IHBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpXG4gIGNvbnN0IGJvYXJkV2lkdGggPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRXaWR0aCB8fCAwXG4gIGNvbnN0IGJvYXJkSGVpZ2h0ID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0IHx8IDBcbiAgY29uc3QgYnViYmxlTGVmdCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUubGVmdCArIDE2LCBib2FyZFdpZHRoIC0gMzM2KSkgOiAwXG4gIGNvbnN0IGJ1YmJsZVRvcCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUudG9wICsgMjQsIGJvYXJkSGVpZ2h0IC0gMTgwKSkgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXJzXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NjgwN1x1OEJCMFwiPlxuICAgICAge3Bvc2l0aW9ucy5tYXAoKHBvc2l0aW9uKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2FjdGl2ZUtleSA9PT0gcG9zaXRpb24ua2V5ID8gJ3dmLXJldmlldy1tYXJrZXIgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbWFya2VyJ31cbiAgICAgICAgICBrZXk9e3Bvc2l0aW9uLmtleX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cdUZGMUEke1JFVklFV19UWVBFX0xBQkVMU1twb3NpdGlvbi5pdGVtLnR5cGVdfWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogcG9zaXRpb24ubGVmdCwgdG9wOiBwb3NpdGlvbi50b3AgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRBY3RpdmVLZXkoKGN1cnJlbnQpID0+IGN1cnJlbnQgPT09IHBvc2l0aW9uLmtleSA/IG51bGwgOiBwb3NpdGlvbi5rZXkpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAge2FjdGl2ZSA/IChcbiAgICAgICAgPGFzaWRlXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyXCJcbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBidWJibGVMZWZ0LCB0b3A6IGJ1YmJsZVRvcCB9fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHthY3RpdmUuaXRlbUluZGV4ICsgMX1gfVxuICAgICAgICA+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10aXRsZVwiPlxuICAgICAgICAgICAgICB7YWN0aXZlLml0ZW1JbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2FjdGl2ZS5pdGVtLnR5cGVdfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1jbG9zZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVLZXkobnVsbCl9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1pbnN0cnVjdGlvblwiPlxuICAgICAgICAgICAge2FjdGl2ZS5pdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10YXJnZXRzXCI+XG4gICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhhY3RpdmUuaXRlbSkubWFwKCh0YXJnZXQpID0+IChcbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXNlbGVjdG9yXCIga2V5PXt0YXJnZXQuc2VsZWN0b3J9Pnt0YXJnZXQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLW1vcmVcIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEFjdGl2ZUtleShudWxsKVxuICAgICAgICAgICAgICBvbk9wZW5QYW5lbD8uKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgXHU2N0U1XHU3NzBCXHU2NkY0XHU1OTFBXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImNvbnN0IExBVU5DSEVSX1NJWkUgPSA0OFxuY29uc3QgTEFVTkNIRVJfTUFSR0lOID0gMjBcbmNvbnN0IERSQUdfVEhSRVNIT0xEID0gNFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW4pLCBNYXRoLm1heChtaW4sIG1heCkpXG59XG5cbmZ1bmN0aW9uIGNsYW1wUG9zaXRpb24oYm9hcmQsIHBvc2l0aW9uKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBwb3NpdGlvblxuICByZXR1cm4ge1xuICAgIHg6IGNsYW1wKHBvc2l0aW9uLngsIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgICB5OiBjbGFtcChwb3NpdGlvbi55LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRQb3NpdGlvbihib2FyZCkge1xuICByZXR1cm4gY2xhbXBQb3NpdGlvbihib2FyZCwge1xuICAgIHg6IGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgICB5OiBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkUG9zaXRpb24oc3RvcmFnZUtleSkge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSkpXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueCkgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlPy55KSkgcmV0dXJuIHZhbHVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIGxvY2FsU3RvcmFnZSBtYXkgYmUgdW5hdmFpbGFibGUgZm9yIGEgZGlyZWN0bHkgb3BlbmVkIGxvY2FsIGZpbGUuXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHBvc2l0aW9uKSlcbiAgfSBjYXRjaCB7XG4gICAgLy8gS2VlcGluZyB0aGUgbGF1bmNoZXIgZHJhZ2dhYmxlIGlzIG1vcmUgaW1wb3J0YW50IHRoYW4gcGVyc2lzdGVuY2UuXG4gIH1cbn1cblxuZnVuY3Rpb24gQ29tbWVudEljb24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNNSA0LjVoMTRhMiAyIDAgMCAxIDIgMnY4YTIgMiAwIDAgMS0yIDJoLTZsLTQuNSAzdi0zSDVhMiAyIDAgMCAxLTItMnYtOGEyIDIgMCAwIDEgMi0yWlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTcuNSAxMC41aDlcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdMYXVuY2hlcih7IGJvYXJkUmVmLCBjb3VudCwgcHJvamVjdE5hbWUsIG9uT3BlbiB9KSB7XG4gIGNvbnN0IHN0b3JhZ2VLZXkgPSBgd2YtcmV2aWV3LWxhdW5jaGVyLXBvc2l0aW9uOiR7cHJvamVjdE5hbWV9YFxuICBjb25zdCBbcG9zaXRpb24sIHNldFBvc2l0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcG9zaXRpb25SZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3VwcHJlc3NDbGlja1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcblxuICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0KSA9PiB7XG4gICAgY29uc3QgY2xhbXBlZCA9IGNsYW1wUG9zaXRpb24oYm9hcmRSZWYuY3VycmVudCwgbmV4dClcbiAgICBwb3NpdGlvblJlZi5jdXJyZW50ID0gY2xhbXBlZFxuICAgIHNldFBvc2l0aW9uKGNsYW1wZWQpXG4gICAgcmV0dXJuIGNsYW1wZWRcbiAgfSwgW2JvYXJkUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGJvYXJkID0gYm9hcmRSZWYuY3VycmVudFxuICAgIGlmICghYm9hcmQpIHJldHVybiB1bmRlZmluZWRcbiAgICB1cGRhdGVQb3NpdGlvbihyZWFkUG9zaXRpb24oc3RvcmFnZUtleSkgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcblxuICAgIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSB1cGRhdGVQb3NpdGlvbihwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG4gICAgICBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgbmV4dClcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgfSwgW2JvYXJkUmVmLCBzdG9yYWdlS2V5LCB1cGRhdGVQb3NpdGlvbl0pXG5cbiAgY29uc3QgZmluaXNoRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZHJhZy5tb3ZlZFxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAocG9zaXRpb25SZWYuY3VycmVudCkgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uUmVmLmN1cnJlbnQpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICB9XG5cbiAgaWYgKGNvdW50IDw9IDApIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtcmV2aWV3LWxhdW5jaGVyIGlzLWRyYWdnaW5nJyA6ICd3Zi1yZXZpZXctbGF1bmNoZXInfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgcmlnaHQ6IExBVU5DSEVSX01BUkdJTiwgYm90dG9tOiBMQVVOQ0hFUl9NQVJHSU4gfX1cbiAgICAgIGFyaWEtbGFiZWw9e2BcdTVDNTVcdTVGMDBcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMENcdTUxNzEgJHtjb3VudH0gXHU2NzYxXHU0RkVFXHU2NTM5YH1cbiAgICAgIGRhdGEtdG9vbHRpcD1cIlx1NUM1NVx1NUYwMFx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQpXG4gICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZXG4gICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IERSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICBvblBvaW50ZXJDYW5jZWw9e2ZpbmlzaERyYWd9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGlmIChzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIG9uT3BlbigpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxDb21tZW50SWNvbiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvdW50fTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuIiwgImV4cG9ydCBjb25zdCBVTlNBVkVEX1JFVklFV19NRVNTQUdFID0gJ1x1NEZFRVx1NjUzOVx1NTE4NVx1NUJCOVx1NUMxQVx1NjcyQVx1NEZERFx1NUI1OFx1RkYwQ1x1NzlCQlx1NUYwMFx1OTg3NVx1OTc2Mlx1NTQwRVx1NEYxQVx1NEUyMlx1NTkzMVx1MzAwMlx1NjYyRlx1NTQyNlx1N0VFN1x1N0VFRFx1RkYxRidcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIGV2ZW50LnJldHVyblZhbHVlID0gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxuICByZXR1cm4gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxufVxuIiwgImNvbnN0IFNIT1JUQ1VUX0RFRklOSVRJT05TID0gW1xuICB7IGlkOiAnY2FudmFzJywgc3VmZml4OiAnMScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnZGVtbycsIHN1ZmZpeDogJzInLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ludGVyYWN0aW9uJywgc3VmZml4OiAnSScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1M0VGXHU0RUE0XHU0RTkyIC8gXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJyB9LFxuICB7IGlkOiAncmV2aWV3Jywgc3VmZml4OiAnTScsIGxhYmVsOiAnXHU1RjAwXHU1NDJGXHU2MjE2XHU1MTczXHU5NUVEXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW1tZXJzaXZlJywgc3VmZml4OiAnMycsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnYnJvd3Nlci1mdWxsc2NyZWVuJywgc3VmZml4OiAnU2hpZnQrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJyB9LFxuICB7IGlkOiAnaG90c3BvdHMnLCBzdWZmaXg6ICdIJywgbGFiZWw6ICdcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0EnIH0sXG4gIHsgaWQ6ICdzcGFjZScsIGtleXM6ICdTcGFjZScsIGxhYmVsOiAnXHU2MzA5XHU0RjRGXHU0RTM0XHU2NUY2XHU2MkQ2XHU1MkE4XHU3NTNCXHU1RTAzJyB9LFxuICB7IGlkOiAnZXNjYXBlJywga2V5czogJ0VzYycsIGxhYmVsOiAnXHU1MTczXHU5NUVEXHU1RjUzXHU1MjREXHU5NzYyXHU2NzdGXHU2MjE2XHU5MDAwXHU1MUZBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaGVscCcsIGtleXM6ICc/JywgbGFiZWw6ICdcdTYyNTNcdTVGMDBcdTYyMTZcdTUxNzNcdTk1RURcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBpc01hY1BsYXRmb3JtKCkge1xuICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBmYWxzZVxuICByZXR1cm4gL01hY3xpUGhvbmV8aVBhZHxpUG9kL2kudGVzdChgJHtuYXZpZ2F0b3IucGxhdGZvcm0gfHwgJyd9ICR7bmF2aWdhdG9yLnVzZXJBZ2VudCB8fCAnJ31gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvcnRjdXRNb2RpZmllckxhYmVsKGlzTWFjID0gaXNNYWNQbGF0Zm9ybSgpKSB7XG4gIHJldHVybiBpc01hYyA/ICdDdHJsJyA6ICdBbHQnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFNob3J0Y3V0cyhpc01hYyA9IGlzTWFjUGxhdGZvcm0oKSkge1xuICBjb25zdCBtb2RpZmllciA9IHNob3J0Y3V0TW9kaWZpZXJMYWJlbChpc01hYylcbiAgcmV0dXJuIFNIT1JUQ1VUX0RFRklOSVRJT05TLm1hcCgoc2hvcnRjdXQpID0+IHNob3J0Y3V0LmtleXNcbiAgICA/IHNob3J0Y3V0XG4gICAgOiB7IC4uLnNob3J0Y3V0LCBrZXlzOiBgJHttb2RpZmllcn0rJHtzaG9ydGN1dC5zdWZmaXh9YCB9KVxufVxuXG5leHBvcnQgY29uc3QgQk9BUkRfU0hPUlRDVVRTID0gZ2V0Qm9hcmRTaG9ydGN1dHMoKVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IGVsZW1lbnQgPSB0YXJnZXQubm9kZVR5cGUgPT09IDMgPyB0YXJnZXQucGFyZW50RWxlbWVudCA6IHRhcmdldFxuICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZVxuICBjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWVcbiAgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICdURVhUQVJFQScgfHwgdGFnID09PSAnU0VMRUNUJykgcmV0dXJuIHRydWVcbiAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIWVsZW1lbnQuY2xvc2VzdD8uKCdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQsIGlzTWFjID0gaXNNYWNQbGF0Zm9ybSgpKSB7XG4gIGlmICghZXZlbnQgfHwgZXZlbnQucmVwZWF0KSByZXR1cm4gbnVsbFxuICBjb25zdCBrZXkgPSBTdHJpbmcoZXZlbnQua2V5IHx8ICcnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IG1vZGlmaWVyID0gaXNNYWMgPyBldmVudC5jdHJsS2V5IDogZXZlbnQuYWx0S2V5XG5cbiAgaWYgKCFtb2RpZmllcikge1xuICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYga2V5ID09PSAnZXNjYXBlJykgcmV0dXJuICdlc2NhcGUnXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJz8nKSByZXR1cm4gJ2hlbHAnXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChldmVudC5zaGlmdEtleSkgcmV0dXJuIGtleSA9PT0gJ2YnID8gJ2Jyb3dzZXItZnVsbHNjcmVlbicgOiBudWxsXG4gIGlmIChrZXkgPT09ICcxJykgcmV0dXJuICdjYW52YXMnXG4gIGlmIChrZXkgPT09ICcyJykgcmV0dXJuICdkZW1vJ1xuICBpZiAoa2V5ID09PSAnaScpIHJldHVybiAnaW50ZXJhY3Rpb24nXG4gIGlmIChrZXkgPT09ICdtJykgcmV0dXJuICdyZXZpZXcnXG4gIGlmIChrZXkgPT09ICczJykgcmV0dXJuICdpbW1lcnNpdmUnXG4gIGlmIChrZXkgPT09ICdoJykgcmV0dXJuICdob3RzcG90cydcbiAgcmV0dXJuIG51bGxcbn1cbiIsICJpbXBvcnQgeyBnZXRCb2FyZFNob3J0Y3V0cyB9IGZyb20gJy4vc2hvcnRjdXRzLmpzJ1xuXG5mdW5jdGlvbiBQYW5lbFNoZWxsKHsgaWQsIHRpdGxlLCBhcmlhTGFiZWwsIG9uQ2xvc2UsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgY2xvc2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcmV0dXJuRm9jdXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHJldHVybkZvY3VzUmVmLmN1cnJlbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50XG4gICAgY2xvc2VSZWYuY3VycmVudD8uZm9jdXMoKVxuICAgIHJldHVybiAoKSA9PiByZXR1cm5Gb2N1c1JlZi5jdXJyZW50Py5mb2N1cz8uKClcbiAgfSwgW10pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1sYXllclwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gZXZlbnQuY3VycmVudFRhcmdldCkgb25DbG9zZSgpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxzZWN0aW9uIGlkPXtpZH0gY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsPXthcmlhTGFiZWx9PlxuICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWhlYWRlclwiPlxuICAgICAgICAgIDxzdHJvbmc+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICAgIDxidXR0b24gcmVmPXtjbG9zZVJlZn0gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0gYXJpYS1sYWJlbD17YFx1NTE3M1x1OTVFRCR7dGl0bGV9YH0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgIDwvaGVhZGVyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWJvZHlcIj57Y2hpbGRyZW59PC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNob3J0Y3V0SGVscCh7XG4gIGRlbW9BdmFpbGFibGUsXG4gIHNob3dDYW52YXNJbmRleCxcbiAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2UsXG4gIHRyYWNrcGFkWm9vbSxcbiAgb25UcmFja3BhZFpvb21DaGFuZ2UsXG4gIHpvb21TZW5zaXRpdml0eSxcbiAgb25ab29tU2Vuc2l0aXZpdHlDaGFuZ2UsXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNob3J0Y3V0cyA9IGdldEJvYXJkU2hvcnRjdXRzKClcbiAgcmV0dXJuIChcbiAgICA8UGFuZWxTaGVsbCBpZD1cIndmLWJvYXJkLXV0aWxpdHlcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVwiIGFyaWFMYWJlbD1cIlx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiIG9uQ2xvc2U9e29uQ2xvc2V9PlxuICAgICAgPGRsIGNsYXNzTmFtZT1cIndmLXNob3J0Y3V0LWxpc3RcIj5cbiAgICAgICAge3Nob3J0Y3V0cy5tYXAoKHNob3J0Y3V0KSA9PiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnaXMtZGlzYWJsZWQnIDogJyd9IGtleT17c2hvcnRjdXQuaWR9PlxuICAgICAgICAgICAgPGR0PjxrYmQ+e3Nob3J0Y3V0LmtleXN9PC9rYmQ+PC9kdD5cbiAgICAgICAgICAgIDxkZD57c2hvcnRjdXQubGFiZWx9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnXHVGRjA4XHU1RjUzXHU1MjREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjA5JyA6ICcnfTwvZGQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kbD5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLW5vdGVcIj5cdTU3MjhcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDFcdTY1ODdcdTY3MkNcdTU3REZcdTMwMDFcdTRFMEJcdTYyQzlcdTY4NDZcdTU0OENcdTUzRUZcdTdGMTZcdThGOTFcdTUxODVcdTVCQjlcdTRFMkRcdTRFMERcdTRGMUFcdTg5RTZcdTUzRDFcdTY2NkVcdTkwMUFcdTVGRUJcdTYzNzdcdTk1MkVcdTMwMDI8L3A+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1zZWN0aW9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlxuICAgICAgICA8aDIgaWQ9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XHU3NTNCXHU2NzdGXHU4QkJFXHU3RjZFPC9oMj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NjYzRVx1NzkzQVx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPlx1NTcyOFx1NzUzQlx1Njc3Rlx1NEUwQVx1NjYzRVx1NzkzQVx1NTNFRlx1NjJENlx1NjJGRFx1NzY4NFx1OTg3NVx1OTc2Mlx1N0QyMlx1NUYxNTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3Nob3dDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtYm9hcmQtc2V0dGluZy1yb3dcIj5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU4OUU2XHU2NDc4XHU2NzdGXHU3RjI5XHU2NTNFPC9zdHJvbmc+XG4gICAgICAgICAgICA8c21hbGw+TWFjIFx1OTk5Nlx1NkIyMVx1OUVEOFx1OEJBNFx1NUYwMFx1NTQyRlx1RkYxQlx1NjMwOVx1NTNDQ1x1NjMwN1x1NjI0Qlx1NTJCRlx1NUU0NVx1NUVBNlx1OEZERVx1N0VFRFx1N0YyOVx1NjUzRTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3RyYWNrcGFkWm9vbX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uVHJhY2twYWRab29tQ2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtYm9hcmQtc2V0dGluZy1yYW5nZSR7dHJhY2twYWRab29tID8gJycgOiAnIGlzLWRpc2FibGVkJ31gfT5cbiAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgIDxzdHJvbmc+XHU3RjI5XHU2NTNFXHU3MDc1XHU2NTRGXHU1RUE2PC9zdHJvbmc+XG4gICAgICAgICAgICA8b3V0cHV0PntNYXRoLnJvdW5kKHpvb21TZW5zaXRpdml0eSAqIDEwMCl9JTwvb3V0cHV0PlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJyYW5nZVwiXG4gICAgICAgICAgICBtaW49XCIwLjI1XCJcbiAgICAgICAgICAgIG1heD1cIjJcIlxuICAgICAgICAgICAgc3RlcD1cIjAuMDVcIlxuICAgICAgICAgICAgdmFsdWU9e3pvb21TZW5zaXRpdml0eX1cbiAgICAgICAgICAgIGRpc2FibGVkPXshdHJhY2twYWRab29tfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gb25ab29tU2Vuc2l0aXZpdHlDaGFuZ2UoTnVtYmVyKGV2ZW50LnRhcmdldC52YWx1ZSkpfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1ODlFNlx1NjQ3OFx1Njc3Rlx1N0YyOVx1NjUzRVx1NzA3NVx1NjU0Rlx1NUVBNlwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICA8c21hbGw+PHNwYW4+XHU2NkY0XHU3RUM2XHU4MTdCPC9zcGFuPjxzcGFuPlx1NjZGNFx1NzA3NVx1NjU0Rjwvc3Bhbj48L3NtYWxsPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvUGFuZWxTaGVsbD5cbiAgKVxufVxuIiwgImV4cG9ydCBjb25zdCBNSU5fWk9PTV9TRU5TSVRJVklUWSA9IDAuMjVcbmV4cG9ydCBjb25zdCBNQVhfWk9PTV9TRU5TSVRJVklUWSA9IDJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1pPT01fU0VOU0lUSVZJVFkgPSAwLjZcblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdE1hY09TKG5hdmlnYXRvckxpa2UgPSB0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBuYXZpZ2F0b3IpIHtcbiAgY29uc3QgcGxhdGZvcm0gPSBuYXZpZ2F0b3JMaWtlPy51c2VyQWdlbnREYXRhPy5wbGF0Zm9ybSB8fCBuYXZpZ2F0b3JMaWtlPy5wbGF0Zm9ybSB8fCAnJ1xuICBpZiAoL15tYWMvaS50ZXN0KHBsYXRmb3JtKSkgcmV0dXJuIHRydWVcbiAgcmV0dXJuIC9NYWNpbnRvc2h8TWFjIE9TIFgvaS50ZXN0KG5hdmlnYXRvckxpa2U/LnVzZXJBZ2VudCB8fCAnJylcbn1cblxuZnVuY3Rpb24gZGVmYXVsdFNldHRpbmdzKG5hdmlnYXRvckxpa2UpIHtcbiAgcmV0dXJuIHtcbiAgICBzaG93Q2FudmFzSW5kZXg6IHRydWUsXG4gICAgdHJhY2twYWRab29tOiBkZXRlY3RNYWNPUyhuYXZpZ2F0b3JMaWtlKSxcbiAgICB6b29tU2Vuc2l0aXZpdHk6IERFRkFVTFRfWk9PTV9TRU5TSVRJVklUWSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplWm9vbVNlbnNpdGl2aXR5KHZhbHVlKSB7XG4gIGNvbnN0IG51bWJlciA9IE51bWJlcih2YWx1ZSlcbiAgaWYgKCFOdW1iZXIuaXNGaW5pdGUobnVtYmVyKSkgcmV0dXJuIERFRkFVTFRfWk9PTV9TRU5TSVRJVklUWVxuICByZXR1cm4gTWF0aC5taW4oTUFYX1pPT01fU0VOU0lUSVZJVFksIE1hdGgubWF4KE1JTl9aT09NX1NFTlNJVElWSVRZLCBudW1iZXIpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9hcmRTdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB3aW5kb3cubG9jYWxTdG9yYWdlXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSB7XG4gIHJldHVybiBgd2YtYm9hcmQtc2V0dGluZ3M6JHtwcm9qZWN0TmFtZX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQm9hcmRTZXR0aW5ncyhcbiAgc3RvcmFnZSxcbiAgcHJvamVjdE5hbWUsXG4gIG5hdmlnYXRvckxpa2UgPSB0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBuYXZpZ2F0b3IsXG4pIHtcbiAgY29uc3QgZGVmYXVsdHMgPSBkZWZhdWx0U2V0dGluZ3MobmF2aWdhdG9yTGlrZSlcbiAgdHJ5IHtcbiAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHN0b3JhZ2U/LmdldEl0ZW0oYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpKSlcbiAgICBpZiAocGFyc2VkICYmIHR5cGVvZiBwYXJzZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzaG93Q2FudmFzSW5kZXg6IHBhcnNlZC5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlLFxuICAgICAgICB0cmFja3BhZFpvb206IHR5cGVvZiBwYXJzZWQudHJhY2twYWRab29tID09PSAnYm9vbGVhbidcbiAgICAgICAgICA/IHBhcnNlZC50cmFja3BhZFpvb21cbiAgICAgICAgICA6IGRlZmF1bHRzLnRyYWNrcGFkWm9vbSxcbiAgICAgICAgem9vbVNlbnNpdGl2aXR5OiBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkocGFyc2VkLnpvb21TZW5zaXRpdml0eSksXG4gICAgICB9XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBmaWxlOi8vIHN0b3JhZ2UgY2FuIGJlIHVuYXZhaWxhYmxlIG9yIGNvbnRhaW4gc3RhbGUgZGF0YS5cbiAgfVxuICByZXR1cm4gZGVmYXVsdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhdmVCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lLCBzZXR0aW5ncykge1xuICBjb25zdCBub3JtYWxpemVkID0ge1xuICAgIHNob3dDYW52YXNJbmRleDogc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4ICE9PSBmYWxzZSxcbiAgICB0cmFja3BhZFpvb206IHNldHRpbmdzLnRyYWNrcGFkWm9vbSA9PT0gdHJ1ZSxcbiAgICB6b29tU2Vuc2l0aXZpdHk6IG5vcm1hbGl6ZVpvb21TZW5zaXRpdml0eShzZXR0aW5ncy56b29tU2Vuc2l0aXZpdHkpLFxuICB9XG4gIHRyeSB7XG4gICAgc3RvcmFnZT8uc2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSksIEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZWQpKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIFNldHRpbmdzIHJlbWFpbiB1c2FibGUgZm9yIHRoZSBjdXJyZW50IHNlc3Npb24gd2l0aG91dCBwZXJzaXN0ZW5jZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5pbXBvcnQgeyBTaG9ydGN1dEhlbHAgfSBmcm9tICcuL0JvYXJkUGFuZWxzLmpzeCdcbmltcG9ydCB7XG4gIGdldEJvYXJkU3RvcmFnZSxcbiAgbm9ybWFsaXplWm9vbVNlbnNpdGl2aXR5LFxuICByZWFkQm9hcmRTZXR0aW5ncyxcbiAgc2F2ZUJvYXJkU2V0dGluZ3MsXG59IGZyb20gJy4vYm9hcmQtc2V0dGluZ3MuanMnXG5pbXBvcnQgeyBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQsIHNob3J0Y3V0SWRGb3JFdmVudCwgc2hvcnRjdXRNb2RpZmllckxhYmVsIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIHRvb2xiYXJFeHBhbmQ6IDw+PHBhdGggZD1cIk01IDV2MTRcIiAvPjxwYXRoIGQ9XCJtMTUgMTgtNi02IDYtNlwiIC8+PC8+LFxuICAgIHRvb2xiYXJDb2xsYXBzZTogPD48cGF0aCBkPVwiTTE5IDV2MTRcIiAvPjxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz48Lz4sXG4gICAgZG93bmxvYWQ6IDw+PHBhdGggZD1cIk0xMiAzdjEyXCIgLz48cGF0aCBkPVwibTcgMTAgNSA1IDUtNVwiIC8+PHBhdGggZD1cIk01IDIxaDE0XCIgLz48Lz4sXG4gICAgc2V0dGluZ3M6IDw+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIgLz48cGF0aCBkPVwiTTE5LjQgMTVhMS43IDEuNyAwIDAgMCAuMzQgMS44OGwuMDYuMDYtMi44MyAyLjgzLS4wNi0uMDZBMS43IDEuNyAwIDAgMCAxNSAxOS40YTEuNyAxLjcgMCAwIDAtMSAuNiAxLjcgMS43IDAgMCAwLS40IDEuMVYyMWgtNHYtLjA5QTEuNyAxLjcgMCAwIDAgOC42IDE5LjRhMS43IDEuNyAwIDAgMC0xLjg4LjM0bC0uMDYuMDYtMi44My0yLjgzLjA2LS4wNkExLjcgMS43IDAgMCAwIDQuNiAxNWExLjcgMS43IDAgMCAwLS42LTEgMS43IDEuNyAwIDAgMC0xLjEtLjRIM3YtNGguMDlBMS43IDEuNyAwIDAgMCA0LjYgOC42YTEuNyAxLjcgMCAwIDAtLjM0LTEuODhsLS4wNi0uMDYgMi44My0yLjgzLjA2LjA2QTEuNyAxLjcgMCAwIDAgOSA0LjZhMS43IDEuNyAwIDAgMCAxLS42IDEuNyAxLjcgMCAwIDAgLjQtMS4xVjNoNHYuMDlBMS43IDEuNyAwIDAgMCAxNS40IDQuNmExLjcgMS43IDAgMCAwIDEuODgtLjM0bC4wNi0uMDYgMi44MyAyLjgzLS4wNi4wNkExLjcgMS43IDAgMCAwIDE5LjQgOWMuMi4zNy41Mi43IDEgLjkuMzIuMTMuNjguMiAxLjEuMmguMDl2NGgtLjA5YTEuNyAxLjcgMCAwIDAtMi4xLjlaXCIgLz48Lz4sXG4gICAgaGVscDogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjlcIiAvPjxwYXRoIGQ9XCJNOS43IDlhMi40IDIuNCAwIDEgMSAzLjcgMmMtLjkuNi0xLjQgMS4xLTEuNCAyXCIgLz48cGF0aCBkPVwiTTEyIDE3aC4wMVwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICBjb25zdCBzaG9ydGN1dE1vZGlmaWVyID0gc2hvcnRjdXRNb2RpZmllckxhYmVsKClcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17aW50ZXJhY3RpdmUgPyAnd2YtaW50ZXJhY3Rpb24tbG9jaycgOiAnd2YtaW50ZXJhY3Rpb24tbG9jayBpcy1sb2NrZWQnfVxuICAgICAgb25DbGljaz17b25Ub2dnbGV9XG4gICAgICBhcmlhLXByZXNzZWQ9eyFpbnRlcmFjdGl2ZX1cbiAgICAgIHRpdGxlPXtpbnRlcmFjdGl2ZVxuICAgICAgICA/IGBcdTVGNTNcdTUyNERcdTUzRUZcdTRFQTRcdTRFOTJcdTk4NzVcdTk3NjJcdTMwMDJcdTcwQjlcdTUxRkJcdTk1MDFcdTRGNEZcdTU0MEVcdUZGMUFcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTc1M0JcdTVFMDNcdUZGMENcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTVGRUJcdTYzNzdcdTk1MkUgJHtzaG9ydGN1dE1vZGlmaWVyfStJYFxuICAgICAgICA6IGBcdTVGNTNcdTUyNERcdTVERjJcdTk1MDFcdTRGNEZcdTMwMDJcdTcwQjlcdTUxRkJcdTYwNjJcdTU5MERcdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUJcdTVGRUJcdTYzNzdcdTk1MkUgJHtzaG9ydGN1dE1vZGlmaWVyfStJYH1cbiAgICA+XG4gICAgICA8TG9ja0ljb24gb3Blbj17aW50ZXJhY3RpdmV9IC8+XG4gICAgICA8c3Bhbj57aW50ZXJhY3RpdmUgPyAnXHU1M0VGXHU0RUE0XHU0RTkyJyA6ICdcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInfTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihlbCkge1xuICBjb25zdCByZXF1ZXN0ID0gZWwgJiYgKGVsLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGVsLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKVxuICBpZiAoIXJlcXVlc3QpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcXVlc3QuY2FsbChlbCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5mdW5jdGlvbiBleGl0Qm9hcmRGdWxsc2NyZWVuKCkge1xuICBpZiAoIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICBjb25zdCBleGl0ID0gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW5cbiAgaWYgKCFleGl0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShleGl0LmNhbGwoZG9jdW1lbnQpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2hvcnRjdXRNb2RpZmllciA9IHNob3J0Y3V0TW9kaWZpZXJMYWJlbCgpXG5cbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSksXG4gIClcbiAgY29uc3QgW2NhbnZhc1NjYWxlLCBzZXRDYW52YXNTY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1NjYWxlLCBzZXREZW1vU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9WaWV3UmVzZXRLZXksIHNldERlbW9WaWV3UmVzZXRLZXldID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2ludGVyYWN0aXZlLCBzZXRJbnRlcmFjdGl2ZV0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZElkcywgc2V0RXhwYW5kZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCBbaW1tZXJzaXZlLCBzZXRJbW1lcnNpdmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQsIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2hlbHBWaXNpYmxlLCBzZXRIZWxwVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NhbnZhc0luZGV4VmlzaWJsZSwgc2V0Q2FudmFzSW5kZXhWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dDYW52YXNJbmRleCxcbiAgKVxuICBjb25zdCBbdHJhY2twYWRab29tLCBzZXRUcmFja3BhZFpvb21dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSkudHJhY2twYWRab29tLFxuICApXG4gIGNvbnN0IFt6b29tU2Vuc2l0aXZpdHksIHNldFpvb21TZW5zaXRpdml0eV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS56b29tU2Vuc2l0aXZpdHksXG4gIClcbiAgY29uc3QgW2NhbnZhc0luZGV4UG9zaXRpb24sIHNldENhbnZhc0luZGV4UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgYm9hcmRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZiA9IFJlYWN0LnVzZVJlZihuZXcgU2V0KCkpXG4gIGNvbnN0IGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSAhaW50ZXJhY3RpdmUgfHwgc3BhY2VIZWxkXG4gIGNvbnN0IGFsbFNjcmVlbklkcyA9IHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKVxuICBjb25zdCBpc0RlbW8gPSBtb2RlID09PSAnZGVtbycgJiYgZGVtb0F2YWlsYWJsZVxuICBjb25zdCBhY3RpdmVTY2FsZSA9IGlzRGVtbyA/IGRlbW9TY2FsZSA6IGNhbnZhc1NjYWxlXG4gIGNvbnN0IHNldEFjdGl2ZVNjYWxlID0gaXNEZW1vID8gc2V0RGVtb1NjYWxlIDogc2V0Q2FudmFzU2NhbGVcbiAgY29uc3Qgd2hlZWxab29tT3B0aW9ucyA9IHsgdHJhY2twYWRNb2RlOiB0cmFja3BhZFpvb20sIHNlbnNpdGl2aXR5OiB6b29tU2Vuc2l0aXZpdHkgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmVcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcblxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2VFbGVtZW50KSB7XG4gICAgICAgIG9wdGlvbnMucmVwbGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICBpZiAoY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQgJiYgaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5tYXAoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCA/IG5leHRTZWxlY3Rpb24gOiBpdGVtKVxuICAgICAgfVxuICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQpXG4gICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0ZWRFbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgIHJldHVybiBhZGRpdGl2ZSA/IFsuLi5jdXJyZW50LCBuZXh0U2VsZWN0aW9uXSA6IFtuZXh0U2VsZWN0aW9uXVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0LnNjcmVlbnMsIHJldmlld011bHRpU2VsZWN0LCByZXZpZXdTZWxlY3Rpb25zXSlcblxuICBjb25zdCByZW1vdmVSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpKVxuICB9LCBbXSlcblxuICBjb25zdCBjbG9zZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdFbmFibGVkKGZhbHNlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IGhvdmVyUmV2aWV3QnJlYWRjcnVtYiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gZWxlbWVudCB8fCBudWxsXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBjbG9zZVJldmlld1BhbmVsID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgfSwgW2hvdmVyUmV2aWV3QnJlYWRjcnVtYl0pXG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7XG4gICAgICBzaG93Q2FudmFzSW5kZXg6IHZpc2libGUsXG4gICAgICB0cmFja3BhZFpvb20sXG4gICAgICB6b29tU2Vuc2l0aXZpdHksXG4gICAgfSlcbiAgfSwgW3Byb2plY3QubmFtZSwgdHJhY2twYWRab29tLCB6b29tU2Vuc2l0aXZpdHldKVxuXG4gIGNvbnN0IHVwZGF0ZVRyYWNrcGFkWm9vbSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbmFibGVkKSA9PiB7XG4gICAgc2V0VHJhY2twYWRab29tKGVuYWJsZWQpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwge1xuICAgICAgc2hvd0NhbnZhc0luZGV4OiBjYW52YXNJbmRleFZpc2libGUsXG4gICAgICB0cmFja3BhZFpvb206IGVuYWJsZWQsXG4gICAgICB6b29tU2Vuc2l0aXZpdHksXG4gICAgfSlcbiAgfSwgW2NhbnZhc0luZGV4VmlzaWJsZSwgcHJvamVjdC5uYW1lLCB6b29tU2Vuc2l0aXZpdHldKVxuXG4gIGNvbnN0IHVwZGF0ZVpvb21TZW5zaXRpdml0eSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2YWx1ZSkgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBub3JtYWxpemVab29tU2Vuc2l0aXZpdHkodmFsdWUpXG4gICAgc2V0Wm9vbVNlbnNpdGl2aXR5KG5vcm1hbGl6ZWQpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwge1xuICAgICAgc2hvd0NhbnZhc0luZGV4OiBjYW52YXNJbmRleFZpc2libGUsXG4gICAgICB0cmFja3BhZFpvb20sXG4gICAgICB6b29tU2Vuc2l0aXZpdHk6IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgfSwgW2NhbnZhc0luZGV4VmlzaWJsZSwgcHJvamVjdC5uYW1lLCB0cmFja3BhZFpvb21dKVxuXG4gIC8vIFx1NTNFQVx1NTcyOFx1NTIwN1x1NjM2Mlx1OTg3OVx1NzZFRVx1NjVGNlx1NkUwNVx1NEY0RFx1N0Y2RVx1MzAwMlx1OTk5Nlx1NUM0RiB1c2VFZmZlY3QgXHU4MkU1XHU0RTVGIHNldCBudWxsXHVGRjBDXHU0RjFBXHU3NkQ2XHU2Mzg5IENhbnZhc0luZGV4XG4gIC8vIHVzZUxheW91dEVmZmVjdCBcdTUyMUFcdTdCOTdcdTU5N0RcdTc2ODRcdTU3NTBcdTY4MDdcdUZGMENcdTdEMjJcdTVGMTVcdTRGMUFcdTRFMDBcdTc2RjQgdmlzaWJpbGl0eTpoaWRkZW5cdTMwMDJcbiAgY29uc3QgY2FudmFzSW5kZXhTZXR0aW5nc1Byb2plY3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpXG4gICAgc2V0Q2FudmFzSW5kZXhWaXNpYmxlKHNldHRpbmdzLnNob3dDYW52YXNJbmRleClcbiAgICBzZXRUcmFja3BhZFpvb20oc2V0dGluZ3MudHJhY2twYWRab29tKVxuICAgIHNldFpvb21TZW5zaXRpdml0eShzZXR0aW5ncy56b29tU2Vuc2l0aXZpdHkpXG4gICAgY29uc3QgcHJldmlvdXNOYW1lID0gY2FudmFzSW5kZXhTZXR0aW5nc1Byb2plY3RSZWYuY3VycmVudFxuICAgIGNhbnZhc0luZGV4U2V0dGluZ3NQcm9qZWN0UmVmLmN1cnJlbnQgPSBwcm9qZWN0Lm5hbWVcbiAgICBpZiAocHJldmlvdXNOYW1lICE9IG51bGwgJiYgcHJldmlvdXNOYW1lICE9PSBwcm9qZWN0Lm5hbWUpIHtcbiAgICAgIHNldENhbnZhc0luZGV4UG9zaXRpb24obnVsbClcbiAgICB9XG4gIH0sIFtwcm9qZWN0Lm5hbWVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMobmV3IFNldCgpKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIGNvbnN0IHRvZ2dsZUV4cGFuZCA9IChpZCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZXhwYW5kVGFyZ2V0cyA9IChzaG91bGRFeHBhbmQpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbFNjcmVlbklkcylcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgdGFyZ2V0cykge1xuICAgICAgICBpZiAoc2hvdWxkRXhwYW5kKSBuZXh0LmFkZChpZClcbiAgICAgICAgZWxzZSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScgJiYgIWV2ZW50LnJlcGVhdCAmJiAhaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzZXRTcGFjZUhlbGQodHJ1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3J0Y3V0ID0gc2hvcnRjdXRJZEZvckV2ZW50KGV2ZW50KVxuICAgICAgaWYgKCFzaG9ydGN1dCkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgIT09ICdlc2NhcGUnICYmIGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUpIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnICYmICFpc0RlbW8pIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZXNjYXBlJyAmJiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnY2FudmFzJykgc2V0TW9kZSgnY2FudmFzJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2RlbW8nKSBzZXRNb2RlKCdkZW1vJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2ludGVyYWN0aW9uJykgc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdyZXZpZXcnKSB0b2dnbGVSZXZpZXcoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW1tZXJzaXZlJykgdG9nZ2xlSW1tZXJzaXZlKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2Jyb3dzZXItZnVsbHNjcmVlbicpIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hvdHNwb3RzJykgc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaGVscCcpIHtcbiAgICAgICAgc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICB9XG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnKSB7XG4gICAgICAgIGlmIChoZWxwVmlzaWJsZSkgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgICAgIGVsc2UgaWYgKHJldmlld0VuYWJsZWQpIGNsb3NlUmV2aWV3KClcbiAgICAgICAgZWxzZSBpZiAoaW1tZXJzaXZlKSBleGl0SW1tZXJzaXZlKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXAgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnKSBzZXRTcGFjZUhlbGQoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgfVxuICB9LCBbXG4gICAgY2xvc2VSZXZpZXcsXG4gICAgZGVtb0F2YWlsYWJsZSxcbiAgICBleGl0SW1tZXJzaXZlLFxuICAgIGhlbHBWaXNpYmxlLFxuICAgIGltbWVyc2l2ZSxcbiAgICBpc0RlbW8sXG4gICAgcmV2aWV3RW5hYmxlZCxcbiAgICBzZXRNb2RlLFxuICAgIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuLFxuICAgIHRvZ2dsZUltbWVyc2l2ZSxcbiAgICB0b2dnbGVSZXZpZXcsXG4gIF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2RlbW8nKSBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH0sIFttb2RlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN5bmMgPSAoKSA9PiBzZXRCcm93c2VyRnVsbHNjcmVlbighIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBleHBvcnRJZHMgPSAoaWRzKSA9PiBydW5FeHBvcnRXaXRoRmVlZGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHNldEV4cG9ydGluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzY3JlZW5zID0gaWRzLm1hcCgoaWQpID0+IHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGlkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkLFxuICAgICAgICAgIHRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2NyZWVuLWlkPVwiJHtpZH1cIl0gLndmLXNjcmVlbi1jb250ZW50YCksXG4gICAgICAgICAgdmlld3BvcnQsXG4gICAgICAgICAgZXhwYW5kZWQ6IGV4cGFuZGVkSWRzLmhhcyhpZCksXG4gICAgICAgICAgcHJvamVjdE5hbWU6IHByb2plY3QubmFtZSxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGF3YWl0IGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEV4cG9ydGluZyhmYWxzZSlcbiAgICB9XG4gIH0sIHNldEV4cG9ydEVycm9yKVxuXG4gIGNvbnN0IHJlc2V0RGVtbyA9ICgpID0+IHtcbiAgICByZXNldCgpXG4gICAgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgcmVzZXREZW1vVmlldyA9ICgpID0+IHtcbiAgICBzZXREZW1vVmlld1Jlc2V0S2V5KCh2YWx1ZSkgPT4gdmFsdWUgKyAxKVxuICB9XG5cbiAgY29uc3QgcmVzZXRBY3RpdmVWaWV3ID0gaXNEZW1vID8gcmVzZXREZW1vVmlldyA6ICgpID0+IHNldENhbnZhc1NjYWxlKDEpXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e2JvYXJkUmVmfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtYm9hcmQke2ltbWVyc2l2ZSA/ICcgaXMtaW1tZXJzaXZlJyA6ICcnfSR7cmV2aWV3RW5hYmxlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b29sYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1sZWZ0XCI+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbmFtZVwiPntwcm9qZWN0Lm5hbWV9PC9oMT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW1ldGFcIj57cHJvamVjdC5zY3JlZW5zLmxlbmd0aH0gXHU5ODc1PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItY2VudGVyXCI+XG4gICAgICAgICAge2RlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLW1vZGUtc3dpdGNoZXJcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU2QTIxXHU1RjBGXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdjYW52YXMnID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdjYW52YXMnKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17YFx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRlx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rMVx1RkYwOWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtgXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfSsyXHVGRjA5YH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NkYxNFx1NzkzQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi12aWV3cG9ydC1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTg5QzZcdTUzRTNcIj5cbiAgICAgICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5tYXAoKGtleSkgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3ZpZXdwb3J0S2V5ID09PSBrZXkgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld3BvcnRLZXkoa2V5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7VklFV1BPUlRfTEFCRUxTW2tleV0gfHwga2V5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnIHx8ICFkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17KCkgPT4gc2V0Q2FudmFzU2NhbGUoMSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0RGVtb1ZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICB0aXRsZT17YFx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rSFx1RkYwOWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7aG90c3BvdHNWaXNpYmxlID8gJ1x1NzBFRFx1NTMzQSBPTicgOiAnXHU3MEVEXHU1MzNBIE9GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWRlbW8tZW50cnlcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cIndmLWRlbW8tZW50cnlcIj5cdTUxNjVcdTUzRTM8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgIGlkPVwid2YtZGVtby1lbnRyeVwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZW50cnlJZH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNlbGVjdEVudHJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwOVx1NjJFOVx1NkYxNFx1NzkzQVx1NTE2NVx1NTNFM1x1OTg3NVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e3NjcmVlbi5pZH0gdmFsdWU9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAge2luZGV4ICsgMX0uIHtzY3JlZW4udGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtyZXNldERlbW99Plx1OTFDRFx1N0Y2RTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1kZW1vLXBhZ2UtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICBcdTVGNTNcdTUyNERcdUZGMUFcbiAgICAgICAgICAgICAgICB7Y3VycmVudFNjcmVlblxuICAgICAgICAgICAgICAgICAgPyBgJHtwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbi5pZCkgKyAxfS4gJHtjdXJyZW50U2NyZWVuLnRpdGxlfSBcdTAwQjcgJHtjdXJyZW50U2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICAgICAgICA6IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2hlbHBWaXNpYmxlID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyNTNcdTVGMDBcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICBhcmlhLWNvbnRyb2xzPVwid2YtYm9hcmQtdXRpbGl0eVwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVx1RkYwOD9cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiaGVscFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkU8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e3Jldmlld0VuYWJsZWQgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17cmV2aWV3RW5hYmxlZCA/ICdcdTRGRUVcdTY1MzlcdTRFMkQnIDogJ1x1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICB0aXRsZT17YFx1NEZFRVx1NjUzOVx1RkYxQVx1NzBCOVx1OTAwOVx1OTg3NVx1OTc2Mlx1ODI4Mlx1NzBCOVx1NUU3Nlx1NjU3NFx1NzQwNlx1NjIxMFx1NTNFRlx1N0YxNlx1OEY5MVx1NzY4NCBBSSBcdTRGRUVcdTY1MzkgUHJvbXB0XHVGRjA4JHtzaG9ydGN1dE1vZGlmaWVyfStNXHVGRjA5YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVJldmlld31cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImVkaXRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtpbW1lcnNpdmUgPyAnXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyA6ICdcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnfVxuICAgICAgICAgICAgdGl0bGU9e2BcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9KzNcdUZGMDlgfVxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlSW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgd2YtaW1tZXJzaXZlLWNocm9tZSR7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJycgOiAnIGlzLWNvbGxhcHNlZCd9YH1cbiAgICAgICAgICByb2xlPVwidG9vbGJhclwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NkM4OVx1NkQ3OFx1NjNBN1x1NEVGNlwiXG4gICAgICAgID5cbiAgICAgICAgICB7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V4aXRJbW1lcnNpdmV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGBcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgXG4gICAgICAgICAgICAgICAgICA6IGBcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDgke3Nob3J0Y3V0TW9kaWZpZXJ9K1NoaWZ0K0ZcdUZGMDlgfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17YFx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOCR7c2hvcnRjdXRNb2RpZmllcn0rSFx1RkYwOWB9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgd2hlZWxab29tT3B0aW9ucz17d2hlZWxab29tT3B0aW9uc31cbiAgICAgICAgICBzZWxlY3RlZElkcz17c2VsZWN0ZWRJZHN9XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJZHM9e3NldFNlbGVjdGVkSWRzfVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIG9uRXhwb3J0SWRzPXtleHBvcnRJZHN9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBvbkNhbnZhc0NsaWNrPXtyZXZpZXdQYW5lbFZpc2libGUgPyBjbG9zZVJldmlld1BhbmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAgIGNhbnZhc0luZGV4VmlzaWJsZT17Y2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0luZGV4UG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgb25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlPXtzZXRDYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2xvc2VDYW52YXNJbmRleD17KCkgPT4gdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxEZW1vTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgaG90c3BvdHNWaXNpYmxlPXtob3RzcG90c1Zpc2libGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgIHdoZWVsWm9vbU9wdGlvbnM9e3doZWVsWm9vbU9wdGlvbnN9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7cmV2aWV3RW5hYmxlZCA/IChcbiAgICAgICAgPFJldmlld01hcmtlcnMgYm9hcmRSZWY9e2JvYXJkUmVmfSBpdGVtcz17cmV2aWV3SXRlbXN9IG9uT3BlblBhbmVsPXtvcGVuUmV2aWV3UGFuZWx9IC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxSZXZpZXdMYXVuY2hlclxuICAgICAgICBib2FyZFJlZj17Ym9hcmRSZWZ9XG4gICAgICAgIGNvdW50PXtyZXZpZXdJdGVtcy5sZW5ndGh9XG4gICAgICAgIHByb2plY3ROYW1lPXtwcm9qZWN0Lm5hbWV9XG4gICAgICAgIG9uT3Blbj17b3BlblJldmlld1BhbmVsfVxuICAgICAgLz5cbiAgICAgIHtoZWxwVmlzaWJsZSA/IChcbiAgICAgICAgPFNob3J0Y3V0SGVscFxuICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgc2hvd0NhbnZhc0luZGV4PXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2U9e3VwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICB0cmFja3BhZFpvb209e3RyYWNrcGFkWm9vbX1cbiAgICAgICAgICBvblRyYWNrcGFkWm9vbUNoYW5nZT17dXBkYXRlVHJhY2twYWRab29tfVxuICAgICAgICAgIHpvb21TZW5zaXRpdml0eT17em9vbVNlbnNpdGl2aXR5fVxuICAgICAgICAgIG9uWm9vbVNlbnNpdGl2aXR5Q2hhbmdlPXt1cGRhdGVab29tU2Vuc2l0aXZpdHl9XG4gICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SGVscFZpc2libGUoZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8UmV2aWV3UGFuZWxcbiAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgdmlzaWJsZT17cmV2aWV3UGFuZWxWaXNpYmxlICYmIHJldmlld0VuYWJsZWR9XG4gICAgICAgIHNlbGVjdGlvbnM9e3Jldmlld1NlbGVjdGlvbnN9XG4gICAgICAgIG11bHRpU2VsZWN0PXtyZXZpZXdNdWx0aVNlbGVjdH1cbiAgICAgICAgaXRlbXM9e3Jldmlld0l0ZW1zfVxuICAgICAgICBvblRvZ2dsZU11bHRpU2VsZWN0PXsoKSA9PiBzZXRSZXZpZXdNdWx0aVNlbGVjdCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgIG9uU2VsZWN0RWxlbWVudD17KGVsZW1lbnQpID0+IHNlbGVjdFJldmlld0VsZW1lbnQoZWxlbWVudCwgbnVsbCwgbnVsbCwge1xuICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV0/LmVsZW1lbnQsXG4gICAgICAgIH0pfVxuICAgICAgICBvbkhvdmVyRWxlbWVudD17aG92ZXJSZXZpZXdCcmVhZGNydW1ifVxuICAgICAgICBvblJlbW92ZVNlbGVjdGlvbj17cmVtb3ZlUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICBvbkNsZWFyU2VsZWN0aW9uPXtjbGVhclJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgb25BZGRJdGVtPXthZGRSZXZpZXdJdGVtfVxuICAgICAgICBvblJlbW92ZUl0ZW09e3JlbW92ZVJldmlld0l0ZW19XG4gICAgICAgIG9uQ2xvc2U9e2Nsb3NlUmV2aWV3fVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIndmLWNob2ljZS1pbnB1dFwiIHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2hvaWNlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtZmllbGQtbGFiZWxcIiBodG1sRm9yPXtodG1sRm9yfT57bGFiZWx9PC9sYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICAgIHtoaW50ICYmICFlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2Vycm9yfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGNyZWF0ZUZsb3dQcm9wcyB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VIZWFkZXIoeyB0aXRsZSwgdGl0bGVJZCwgc3VidGl0bGUsIHN1YnRpdGxlSWQsIGFjdGlvbnMsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyIGNsYXNzTmFtZT17YHdmLXBhZ2UtaGVhZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtaGVhZGVyLWNvcHlcIj5cbiAgICAgICAgPGgxIGlkPXt0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXRpdGxlXCI+e3RpdGxlfTwvaDE+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxwIGlkPXtzdWJ0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvcD4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7YWN0aW9ucyA/IDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1hY3Rpb25zXCI+e2FjdGlvbnN9PC9kaXY+IDogbnVsbH1cbiAgICA8L2hlYWRlcj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOYXZpZ2F0aW9uTGlzdCh7IGFzLCBpdGVtcywgYWN0aXZlSWQsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGFzLFxuICAgIHsgY2xhc3NOYW1lLCAuLi5yZXN0IH0sXG4gICAgaXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtbmF2LWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi1uYXYtaXRlbSd9XG4gICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZGVOYXYoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxOYXZpZ2F0aW9uTGlzdFxuICAgICAgYXM9XCJuYXZcIlxuICAgICAgaXRlbXM9e2l0ZW1zfVxuICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUlkfVxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc2lkZS1uYXYgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJCYXIoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtdGFiLWJhciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtdGFiLWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi10YWItaXRlbSd9XG4gICAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyZWFkY3J1bWJzKHsgaXRlbXMgPSBbXSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtYnJlYWRjcnVtYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IGFyaWEtbGFiZWw9XCJCcmVhZGNydW1ic1wiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Ake2l0ZW0ubGFiZWx9LSR7aW5kZXh9YH0+XG4gICAgICAgICAge2luZGV4ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItZGl2aWRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXRlbS50byA/IChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1saW5rXCIgdHlwZT1cImJ1dHRvblwiIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9PlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWN1cnJlbnRcIj57aXRlbS5sYWJlbH08L3NwYW4+fVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuLyoqIFx1NzlGQlx1NTJBOFx1N0FFRlx1NjU3NFx1NUM0Rlx1NThGM1x1RkYxQVx1NTE4NVx1NUJCOVx1NTMzQVx1NTNFRlx1NkVEQVx1RkYwQ1RhYkJhciBcdThEMzRcdTVFOTVcdTMwMDJ0YWJzIC8gYWN0aXZlSWQgXHU0RTBFIFRhYkJhciBcdTc2RjhcdTU0MENcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVTaGVsbCh7IGNoaWxkcmVuLCB0YWJzID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tb2JpbGUtc2hlbGwgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIndmLW1vYmlsZS1zaGVsbC1ib2R5XCI+e2NoaWxkcmVufTwvbWFpbj5cbiAgICAgIHt0YWJzLmxlbmd0aCA+IDAgPyA8VGFiQmFyIGl0ZW1zPXt0YWJzfSBhY3RpdmVJZD17YWN0aXZlSWR9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBDZWxsKHsgdG8sIG9uQ2xpY2ssIHRpdGxlLCBzdWJ0aXRsZSwgdmFsdWUsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNlbGwgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jZWxsLW1haW5cIj5cbiAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1jZWxsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICB7c3VidGl0bGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkXCI+XG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkaW5nXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+e2NvbHVtbi5sYWJlbH08L3RoPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cIndmLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0tleSA9IGdldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtcm93XCIgZGF0YS13Zi1rZXk9e3Jvd0tleX0ga2V5PXtyb3dLZXl9PlxuICAgICAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2YtdGFibGUtY2VsbFwiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9PlxuICAgICAgICAgICAgICAgICAgICB7Y29sdW1uLnJlbmRlciA/IGNvbHVtbi5yZW5kZXIocm93W2NvbHVtbi5rZXldLCByb3cpIDogcm93W2NvbHVtbi5rZXldfVxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgb25DaGFuZ2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJ0YWJsaXN0XCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtdGFiLWNvbnRyb2xcIlxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2l0ZW0uaWQgPT09IGFjdGl2ZUlkfVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZT8uKGl0ZW0uaWQpfVxuICAgICAgICA+XG4gICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBzKHtcbiAgaXRlbXMgPSBbXSxcbiAgY3VycmVudCA9IDAsXG4gIGRpcmVjdGlvbiA9ICdob3Jpem9udGFsJyxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgdmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCdcbiAgcmV0dXJuIChcbiAgICA8b2xcbiAgICAgIGNsYXNzTmFtZT17YHdmLXN0ZXBzICR7dmVydGljYWwgPyAnd2Ytc3RlcHMtdmVydGljYWwnIDogJ3dmLXN0ZXBzLWhvcml6b250YWwnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGluZGV4IDwgY3VycmVudCA/ICdkb25lJyA6IGluZGV4ID09PSBjdXJyZW50ID8gJ2N1cnJlbnQnIDogJ3RvZG8nXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17YHdmLXN0ZXBzLWl0ZW0gd2Ytc3RlcHMtaXRlbS0ke3N0YXR1c31gfSBrZXk9e2l0ZW0uaWQgfHwgaXRlbS5sYWJlbCB8fCBpbmRleH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwLW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzID09PSAnZG9uZScgPyBudWxsIDogaW5kZXggKyAxfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHtpbmRleCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1saW5lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIHtpdGVtLmRlc2NyaXB0aW9uID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtZGVzY1wiPntpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfSl9XG4gICAgPC9vbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRW1wdHlTdGF0ZSh7IHRpdGxlLCBkZXNjcmlwdGlvbiwgYWN0aW9uLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1lbXB0eS1zdGF0ZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZW1wdHktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7dGl0bGUgPyA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWVtcHR5LXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICB7ZGVzY3JpcHRpb24gPyA8cCBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1kZXNjXCI+e2Rlc2NyaXB0aW9ufTwvcD4gOiBudWxsfVxuICAgICAge2FjdGlvbiA/IDxkaXYgY2xhc3NOYW1lPVwid2YtZW1wdHktYWN0aW9uXCI+e2FjdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi9mb3Jtcy5qc3gnXG5cbmZ1bmN0aW9uIFNjcmVlblBvcnRhbCh7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgYW5jaG9yID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtob3N0LCBzZXRIb3N0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBzZXRIb3N0KGFuY2hvci5jdXJyZW50Py5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKSB8fCBudWxsKVxuICB9LCBbXSlcblxuICBpZiAoIWhvc3QpIHJldHVybiA8c3BhbiByZWY9e2FuY2hvcn0gY2xhc3NOYW1lPVwid2Ytb3ZlcmxheS1hbmNob3JcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICByZXR1cm4gUmVhY3RET00uY3JlYXRlUG9ydGFsKGNoaWxkcmVuLCBob3N0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTW9kYWwoeyBvcGVuLCB0aXRsZSwgY2hpbGRyZW4sIGFjdGlvbnMsIG9uQ2xvc2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtbW9kYWwtb3ZlcmxheSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInByZXNlbnRhdGlvblwiIHsuLi5yZXN0fT5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtbW9kYWxcIiByb2xlPVwiZGlhbG9nXCIgYXJpYS1tb2RhbD1cInRydWVcIiBhcmlhLWxhYmVsPXt0aXRsZX0+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtbW9kYWwtdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgICB7b25DbG9zZSA/IDxCdXR0b24gb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9CdXR0b24+IDogbnVsbH1cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLW1vZGFsLWJvZHlcIj57Y2hpbGRyZW59PC9kaXY+XG4gICAgICAgICAge2FjdGlvbnMgPyA8Zm9vdGVyIGNsYXNzTmFtZT1cIndmLW1vZGFsLWZvb3RlclwiPnthY3Rpb25zfTwvZm9vdGVyPiA6IG51bGx9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb25maXJtRGlhbG9nKHtcbiAgb3BlbixcbiAgdGl0bGUgPSAnXHU3ODZFXHU4QkE0XHU2NENEXHU0RjVDJyxcbiAgbWVzc2FnZSxcbiAgY29uZmlybUxhYmVsID0gJ1x1Nzg2RVx1OEJBNCcsXG4gIGNhbmNlbExhYmVsID0gJ1x1NTNENlx1NkQ4OCcsXG4gIG9uQ29uZmlybSxcbiAgb25DYW5jZWwsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIHJldHVybiAoXG4gICAgPE1vZGFsXG4gICAgICBvcGVuPXtvcGVufVxuICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICBvbkNsb3NlPXtvbkNhbmNlbH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgYWN0aW9ucz17KFxuICAgICAgICA8PlxuICAgICAgICAgIDxCdXR0b24gb25DbGljaz17b25DYW5jZWx9PntjYW5jZWxMYWJlbH08L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17b25Db25maXJtfT57Y29uZmlybUxhYmVsfTwvQnV0dG9uPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtY29uZmlybS1tZXNzYWdlXCI+e21lc3NhZ2V9PC9wPlxuICAgIDwvTW9kYWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRvYXN0KHsgb3BlbiwgY2hpbGRyZW4sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtdG9hc3QgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJzdGF0dXNcIiB7Li4ucmVzdH0+e2NoaWxkcmVufTwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBMb2FkaW5nT3ZlcmxheSh7IG9wZW4sIGxhYmVsID0gJ1x1NTJBMFx1OEY3RFx1NEUyRCcsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgaWYgKCFvcGVuKSByZXR1cm4gbnVsbFxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5Qb3J0YWw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW92ZXJsYXkgd2YtbG9hZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInN0YXR1c1wiIHsuLi5yZXN0fT5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbG9hZGluZy1zaGFwZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWxvYWRpbmctbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gV2lyZU1hcCh7IGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbWFwICR7Y2xhc3NOYW1lfWAudHJpbSgpfSBzdHlsZT17eyBwb3NpdGlvbjogJ3JlbGF0aXZlJywgLi4uc3R5bGUgfX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbWFwLWxpbmUgd2YtbWFwLWxpbmUtYVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1tYXAtbGluZSB3Zi1tYXAtbGluZS1iXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTWFwTWFya2VyKHsgeCwgeSwgbGFiZWwsIHRvLCBvbkNsaWNrLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHdmLW1hcC1tYXJrZXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgIHN0eWxlPXt7IGxlZnQ6IGAke3h9JWAsIHRvcDogYCR7eX0lYCwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbWFwLW1hcmtlci1zaGFwZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1hcE92ZXJsYXkoeyBwb3NpdGlvbiA9ICdib3R0b20nLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbWFwLW92ZXJsYXkgd2YtbWFwLW92ZXJsYXktJHtwb3NpdGlvbn0gJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNy4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNy4wXG4gKi9cbmltcG9ydCB7IE1vYmlsZVNoZWxsIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgdXNlU2NyZWVuSWQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5cbmNvbnN0IHRhYnMgPSBbXG4gIHsgbGFiZWw6ICdcdTUzRDFcdTczQjAnLCB0bzogJ2Rpc2NvdmVyJyB9LFxuICB7IGxhYmVsOiAnXHU4ODRDXHU3QTBCJywgdG86ICd0cmlwcycgfSxcbiAgeyBsYWJlbDogJ1x1NjIxMVx1NzY4NCcsIHRvOiAncHJvZmlsZScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZUxheW91dCh7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSB1c2VTY3JlZW5JZCgpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZVNoZWxsIGNsYXNzTmFtZT1cIndlZWtlbmQtc2hlbGwgd2Vla2VuZC1sYXlvdXRcIiB0YWJzPXt0YWJzfSBhY3RpdmVJZD17c2NyZWVuSWR9IGFyaWEtbGFiZWw9XCJcdTU0NjhcdTY3MkJcdTUxRkFcdTUzRDFcdTY1QzVcdTg4NENcdTUyQTlcdTYyNEJcIj5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L01vYmlsZVNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS43LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS43LjBcbiAqL1xuaW1wb3J0IHtcbiAgQXZhdGFyLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBGb3JtRmllbGQsXG4gIE1vZGFsLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBDT1NUUyA9IFtcbiAgeyBpZDogJ2Nvc3QtdHJhbnNpdCcsIGl0ZW06ICdcdTVFMDJcdTUxODVcdTRFQTRcdTkwMUEnLCBvd25lcjogJ1x1NTE3MVx1NTQwQycsIGFtb3VudDogJzQ4JyB9LFxuICB7IGlkOiAnY29zdC10aWNrZXQnLCBpdGVtOiAnXHU1QzU1XHU1Mzg1XHU5NUU4XHU3OTY4Jywgb3duZXI6ICdcdTY3OTdcdTY2NTNcdTkxQ0UnLCBhbW91bnQ6ICc4MCcgfSxcbiAgeyBpZDogJ2Nvc3QtbHVuY2gnLCBpdGVtOiAnXHU1MzQ4XHU5OTEwJywgb3duZXI6ICdcdTUxNzFcdTU0MEMnLCBhbW91bnQ6ICcxODAnIH0sXG4gIHsgaWQ6ICdjb3N0LW1hcmtldCcsIGl0ZW06ICdcdTVFMDJcdTk2QzZcdTk4ODRcdTc1NTknLCBvd25lcjogJ1x1NEUyQVx1NEVCQScsIGFtb3VudDogJzEyMCcgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEJ1ZGdldFNjcmVlbigpIHtcbiAgY29uc3QgW2ludml0ZU9wZW4sIHNldEludml0ZU9wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJidWRnZXQtcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBidWRnZXRfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJidWRnZXQtaGVhZGVyXCIgdGl0bGVJZD1cImJ1ZGdldC10aXRsZVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9faGVhZGVyXCIgdGl0bGU9XCJcdTk4ODRcdTdCOTdcdTRFMEVcdTU0MENcdTg4NENcdTRFQkFcIiBzdWJ0aXRsZT1cIlx1NEUzQVx1ODg0Q1x1N0EwQlx1OTg4NFx1NzU1OVx1OEQzOVx1NzUyOFx1NUU3Nlx1OTA4MFx1OEJGN1x1NEYxOVx1NEYzNFwiIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwiYnVkZ2V0X19iYWNrXCIgdG89XCJ0cmlwLWNvbmZpcm1cIj5cdThGRDRcdTU2REU8L0J1dHRvbj59IC8+XG4gICAgICAgIDxDYXJkIGlkPVwiYnVkZ2V0LXN1bW1hcnlcIiBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnlcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS1ib2R5XCIgZ2FwPXs2fT5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS1sYWJlbFwiPlx1OTg4NFx1OEJBMVx1NjAzQlx1OEQzOVx1NzUyODwvVGV4dD5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LXZhbHVlXCI+NDI4IFx1NTE0Mzwvc3Ryb25nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LW5vdGVcIj5cdTYzMDkgMyBcdTRGNERcdTU0MENcdTg4NENcdTRFQkFcdThCQTFcdTdCOTdcdUZGMENcdTRFQkFcdTU3NDdcdTdFQTYgMTQzIFx1NTE0MzwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8RGF0YVRhYmxlIGlkPVwiYnVkZ2V0LXRhYmxlXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X190YWJsZVwiIGNvbHVtbnM9e1t7IGtleTogJ2l0ZW0nLCBsYWJlbDogJ1x1OTg3OVx1NzZFRScgfSwgeyBrZXk6ICdvd25lcicsIGxhYmVsOiAnXHU2MjdGXHU2MkM1JyB9LCB7IGtleTogJ2Ftb3VudCcsIGxhYmVsOiAnXHU5MUQxXHU5ODlEJyB9XX0gcm93cz17Q09TVFN9IGdldFJvd0tleT17KHJvdykgPT4gcm93LmlkfSAvPlxuICAgICAgICA8Q29sdW1uIGlkPVwiYnVkZ2V0LW1lbWJlcnNcIiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlcnNcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVycy1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJzLWxhYmVsXCI+XHU1NDBDXHU4ODRDXHU0RUJBPC9UZXh0PlxuICAgICAgICAgICAgPEJ1dHRvbiBpZD1cImJ1ZGdldC1pbnZpdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtYWN0aW9uXCIgb25DbGljaz17KCkgPT4gc2V0SW52aXRlT3Blbih0cnVlKX0+XHU5MDgwXHU4QkY3PC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1zdGFja1wiIGdhcD17MTR9PlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlclwiIGRhdGEtd2Yta2V5PVwibWVtYmVyLWxpblwiIGdhcD17NX0gYWxpZ25JdGVtcz1cImNlbnRlclwiPjxBdmF0YXIgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItYXZhdGFyXCIgbGFiZWw9XCJcdTY3OTdcdTY2NTNcdTkxQ0VcIiAvPjxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLW5hbWVcIj5cdTY3OTdcdTY2NTNcdTkxQ0U8L1RleHQ+PC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyXCIgZGF0YS13Zi1rZXk9XCJtZW1iZXItY2hlblwiIGdhcD17NX0gYWxpZ25JdGVtcz1cImNlbnRlclwiPjxBdmF0YXIgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItYXZhdGFyXCIgbGFiZWw9XCJcdTk2NDhcdTY5ODZcIiAvPjxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLW5hbWVcIj5cdTk2NDhcdTY5ODY8L1RleHQ+PC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyXCIgZGF0YS13Zi1rZXk9XCJtZW1iZXItemhvdVwiIGdhcD17NX0gYWxpZ25JdGVtcz1cImNlbnRlclwiPjxBdmF0YXIgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItYXZhdGFyXCIgbGFiZWw9XCJcdTU0NjhcdTVDQjhcIiAvPjxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLW5hbWVcIj5cdTU0NjhcdTVDQjg8L1RleHQ+PC9Db2x1bW4+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8QnV0dG9uIGlkPVwiYnVkZ2V0LWRvbmVcIiBjbGFzc05hbWU9XCJidWRnZXRfX2RvbmVcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwidHJpcC1jb25maXJtXCI+XHU0RkREXHU1QjU4XHU5ODg0XHU3Qjk3PC9CdXR0b24+XG4gICAgICAgIDxNb2RhbFxuICAgICAgICAgIGlkPVwiYnVkZ2V0LWludml0ZS1tb2RhbFwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtbW9kYWxcIlxuICAgICAgICAgIG9wZW49e2ludml0ZU9wZW59XG4gICAgICAgICAgdGl0bGU9XCJcdTkwODBcdThCRjdcdTU0MENcdTg4NENcdTRFQkFcIlxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldEludml0ZU9wZW4oZmFsc2UpfVxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXsoKSA9PiBzZXRJbnZpdGVPcGVuKGZhbHNlKX0+XHU1M0QxXHU5MDAxXHU5MDgwXHU4QkY3PC9CdXR0b24+fVxuICAgICAgICA+XG4gICAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1maWVsZFwiIGxhYmVsPVwiXHU2MjRCXHU2NzNBXHU1M0Y3XHU2MjE2XHU3NTI4XHU2MjM3XHU1NDBEXCIgaHRtbEZvcj1cImJ1ZGdldC1pbnZpdGUtaW5wdXRcIj5cbiAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJidWRnZXQtaW52aXRlLWlucHV0XCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtaW5wdXRcIiBwbGFjZWhvbGRlcj1cIlx1OEY5M1x1NTE2NVx1NTQwQ1x1ODg0Q1x1NEVCQVx1NEZFMVx1NjA2RlwiIC8+XG4gICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDwvTW9kYWw+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNy4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNy4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgR3JpZCxcbiAgSGVhZGluZyxcbiAgSW1hZ2VQbGFjZWhvbGRlcixcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IFJPVVRFUyA9IFtcbiAgeyBpZDogJ3JvdXRlLWNhbmFsJywgdGl0bGU6ICdcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjknLCBtZXRhOiAnXHU2QjY1XHU4ODRDIDguNiBrbSBcdTAwQjcgNiBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU2NUU3XHU0RUQzXHU1RTkzXHUzMDAxXHU2ODY1XHU0RTBCXHU1RTAyXHU5NkM2XHU0RTBFXHU1MDhEXHU2NjVBXHU2Q0IzXHU1Q0I4JyB9LFxuICB7IGlkOiAncm91dGUtaGlsbHMnLCB0aXRsZTogJ1x1NTdDRVx1NTMxN1x1OEY3Qlx1NUY5Mlx1NkI2NScsIG1ldGE6ICdcdTVGOTJcdTZCNjUgMTEga20gXHUwMEI3IDcgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1Njc5N1x1OTVGNFx1N0YxM1x1NTc2MVx1MzAwMVx1ODlDMlx1NjY2Rlx1NTNGMFx1NEUwRVx1NUM3MVx1ODExQVx1NUMwRlx1OTk4NicgfSxcbiAgeyBpZDogJ3JvdXRlLWxhbmVzJywgdGl0bGU6ICdcdTgwMDFcdTg4NTdcdTYxNjJcdTZFMzgnLCBtZXRhOiAnXHU2QjY1XHU4ODRDIDUuMiBrbSBcdTAwQjcgNCBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU1REY3XHU1M0UzXHU2NUU5XHU5OTEwXHUzMDAxXHU2NUU3XHU0RTY2XHU1RTk3XHU0RTBFXHU3OTNFXHU1MzNBXHU4MkIxXHU1NkVEJyB9LFxuICB7IGlkOiAncm91dGUtbGFrZScsIHRpdGxlOiAnXHU3M0FGXHU2RTU2XHU5QTkxXHU4ODRDXHU1MzRBXHU2NUU1JywgbWV0YTogJ1x1OUE5MVx1ODg0QyAxOCBrbSBcdTAwQjcgNSBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU2RTdGXHU1NzMwXHU2ODA4XHU5MDUzXHUzMDAxXHU1ODI0XHU1Q0I4XHU0RTBFXHU2NUU1XHU4NDNEXHU1RTczXHU1M0YwJyB9LFxuICB7IGlkOiAncm91dGUtbXVzZXVtJywgdGl0bGU6ICdcdTk2RThcdTU5MjlcdTUzNUFcdTcyNjlcdTk5ODZcdTdFQkYnLCBtZXRhOiAnXHU1MTZDXHU0RUE0IDQgXHU3QUQ5IFx1MDBCNyA2IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTRFMDlcdTRFMkFcdTVDNTVcdTk5ODZcdTRFMEVcdTRFMDBcdTk1RjRcdTVCODlcdTk3NTlcdTU0OTZcdTU1NjFcdTk5ODYnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1uaWdodCcsIHRpdGxlOiAnXHU1OTFDXHU4MjcyXHU1RUZBXHU3QjUxXHU2NTYzXHU2QjY1JywgbWV0YTogJ1x1NkI2NVx1ODg0QyA2LjQga20gXHUwMEI3IDMgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NUU3Rlx1NTczQVx1MzAwMVx1NTI2N1x1OTY2Mlx1NEUwRVx1NkM1Rlx1OEZCOVx1NzA2Rlx1NTE0OVx1NUUyNicgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIERpc2NvdmVyU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiZGlzY292ZXItcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBkaXNjb3Zlcl9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZGlzY292ZXItaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiZGlzY292ZXItdGl0bGVcIlxuICAgICAgICAgIHN1YnRpdGxlSWQ9XCJkaXNjb3Zlci1zdWJ0aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdThGRDlcdTRFMkFcdTU0NjhcdTY3MkJcdUZGMENcdTUzQkJcdTU0RUFcdThENzBcdThENzBcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU0RTNBXHU0RjYwXHU2MzExXHU0RTg2XHU1MUUwXHU2NzYxXHU0RTBEXHU3NTI4XHU4RDc2XHU2NUY2XHU5NUY0XHU3Njg0XHU1N0NFXHU1RTAyXHU4REVGXHU3RUJGXCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGlkPVwiZGlzY292ZXItbWFwLWFjdGlvblwiIGNsYXNzTmFtZT1cImRpc2NvdmVyX19tYXAtYWN0aW9uXCIgdG89XCJleHBsb3JlLW1hcFwiPlx1NTczMFx1NTZGRTwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPENhcmQgaWQ9XCJkaXNjb3Zlci1mZWF0dXJlZFwiIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZCBkaXNjb3Zlcl9fZmVhdHVyZWRcIiB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgIDxJbWFnZVBsYWNlaG9sZGVyIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1pbWFnZVwiIGhlaWdodD17MTc2fSBib3JkZXJSYWRpdXM9ezB9IC8+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmRfX2JvZHkgZGlzY292ZXJfX2ZlYXR1cmVkLWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid2Vla2VuZC1jaGlwLXJvdyBkaXNjb3Zlcl9fZmVhdHVyZWQtYmFkZ2VzXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1iYWRnZVwiPlx1NjcyQ1x1NTQ2OFx1NjNBOFx1ODM1MDwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtYmFkZ2VcIj5cdTkwMDJcdTU0MDhcdTUyMURcdTZCMjFcdTUyMzBcdThCQkY8L0JhZGdlPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtdGl0bGVcIiBsZXZlbD17Mn0+XHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5PC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWNvcHlcIj5cdTRFQ0VcdTY1RTdcdTRFRDNcdTVFOTNcdTUxRkFcdTUzRDFcdUZGMENcdTZDQkZcdTZDMzRcdTVDQjhcdThENzBcdTUyMzBcdTY4NjVcdTRFMEJcdTVFMDJcdTk2QzZcdUZGMENcdTU3MjhcdTY1RTVcdTg0M0RcdTUyNERcdTYyQjVcdThGQkVcdTZDQjNcdTZFN0VcdTVFNzNcdTUzRjBcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndlZWtlbmQtY2FyZC1tZXRhIGRpc2NvdmVyX19mZWF0dXJlZC1tZXRhXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1tZXRhLWl0ZW1cIj44LjYga208L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1tZXRhLWl0ZW1cIj5cdTdFQTYgNiBcdTVDMEZcdTY1RjY8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1tZXRhLWl0ZW1cIj5cdThGN0JcdTY3N0U8L1RleHQ+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8SGVhZGluZyBpZD1cImRpc2NvdmVyLXJvdXRlcy10aXRsZVwiIGNsYXNzTmFtZT1cIndlZWtlbmQtc2VjdGlvbi1oZWFkaW5nIGRpc2NvdmVyX19yb3V0ZXMtdGl0bGVcIiBsZXZlbD17Mn0+XHU2NkY0XHU1OTFBXHU4REVGXHU3RUJGPC9IZWFkaW5nPlxuICAgICAgICA8R3JpZCBpZD1cImRpc2NvdmVyLXJvdXRlc1wiIGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZXNcIiBjb2x1bW5zPXsxfSBnYXA9ezE0fT5cbiAgICAgICAgICB7Uk9VVEVTLm1hcCgocm91dGUsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmQgZGlzY292ZXJfX3JvdXRlLWNhcmRcIiBkYXRhLXdmLWtleT17cm91dGUuaWR9IGtleT17cm91dGUuaWR9IHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgICAgIDxJbWFnZVBsYWNlaG9sZGVyIGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS1pbWFnZVwiIGhlaWdodD17aW5kZXggJSAyID09PSAwID8gMTE2IDogMTM2fSBib3JkZXJSYWRpdXM9ezB9IC8+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkX19ib2R5IGRpc2NvdmVyX19yb3V0ZS1ib2R5XCIgZ2FwPXs3fT5cbiAgICAgICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGUtdGl0bGVcIiBsZXZlbD17M30+e3JvdXRlLnRpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGUtbWV0YVwiPntyb3V0ZS5tZXRhfTwvVGV4dD5cbiAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGUtbm90ZVwiPntyb3V0ZS5ub3RlfTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiaW1wb3J0IHsgV2lyZU1hcCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNoYW5naGFpTWFwKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8V2lyZU1hcCBjbGFzc05hbWU9e2BzaGFuZ2hhaS1tYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1dpcmVNYXA+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjcuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjcuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIE1hcE1hcmtlcixcbiAgTWFwT3ZlcmxheSxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBTaGFuZ2hhaU1hcCB9IGZyb20gJy4uL2NvbXBvbmVudHMvU2hhbmdoYWlNYXAuanN4J1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gRXhwbG9yZU1hcFNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cImV4cGxvcmUtbWFwLXBhZ2VcIiBnYXA9ezE2fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgZXhwbG9yZS1tYXBfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImV4cGxvcmUtbWFwLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImV4cGxvcmUtbWFwLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NzZFRVx1NzY4NFx1NTczMFx1NTczMFx1NTZGRVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdThGN0JcdTg5RTZcdTY4MDdcdThCQjBcdTY3RTVcdTc3MEJcdTYzQThcdTgzNTBcdThERUZcdTdFQkZcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2JhY2tcIiB0bz1cImRpc2NvdmVyXCI+XHU1MjE3XHU4ODY4PC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8Um93IGlkPVwiZXhwbG9yZS1tYXAtZmlsdGVyc1wiIGNsYXNzTmFtZT1cIndlZWtlbmQtY2hpcC1yb3cgZXhwbG9yZS1tYXBfX2ZpbHRlcnNcIiBnYXA9ezh9PlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU1MTY4XHU5MEU4PC9CYWRnZT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1NkI2NVx1ODg0QzwvQmFkZ2U+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTlBOTFcdTg4NEM8L0JhZGdlPlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU1QkE0XHU1MTg1PC9CYWRnZT5cbiAgICAgICAgPC9Sb3c+XG4gICAgICAgIDxTaGFuZ2hhaU1hcCBpZD1cImV4cGxvcmUtbWFwLWNhbnZhc1wiIGNsYXNzTmFtZT1cIndlZWtlbmQtbWFwIGV4cGxvcmUtbWFwX19jYW52YXNcIj5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci1zdXpob3UtY3JlZWtcIiB4PXs1MX0geT17NDB9IGxhYmVsPVwiXHU4MkNGXHU1RERFXHU2Q0IzXHU2RUU4XHU2QzM0XHU2RjJCXHU2QjY1XCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLWJ1bmRcIiB4PXs2Mn0geT17NDd9IGxhYmVsPVwiXHU1OTE2XHU2RUU5XHU1RUZBXHU3QjUxXHU2RjJCXHU2RTM4XCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLXh1aHVpXCIgeD17NDl9IHk9ezU1fSBsYWJlbD1cIlx1ODg2MVx1NTkwRFx1OThDRVx1OEM4Q1x1OUE5MVx1ODg0Q1wiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci1wdWRvbmdcIiB4PXs3NX0geT17NDN9IGxhYmVsPVwiXHU5NjQ2XHU1QkI2XHU1NjM0XHU1N0NFXHU1RTAyXHU2RjJCXHU2QjY1XCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBPdmVybGF5IGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19vdmVybGF5XCIgcG9zaXRpb249XCJib3R0b21cIj5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19yb3V0ZS1wcmV2aWV3XCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy1ib2R5XCIgZ2FwPXs2fT5cbiAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy1leWVicm93XCI+XHU4REREXHU3OUJCXHU0RjYwIDIuNCBrbTwvVGV4dD5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LXRpdGxlXCI+XHU4MkNGXHU1RERFXHU2Q0IzXHU2RUU4XHU2QzM0XHU2RjJCXHU2QjY1PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctbWV0YVwiPjguNiBrbSBcdTAwQjcgXHU3RUE2IDYgXHU1QzBGXHU2NUY2IFx1MDBCNyBcdThGN0JcdTY3N0U8L1RleHQ+XG4gICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgIDwvTWFwT3ZlcmxheT5cbiAgICAgICAgPC9TaGFuZ2hhaU1hcD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS43LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS43LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFN0ZXBzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IEVWRU5UUyA9IFtcbiAgeyBpZDogJ2V2ZW50LW1lZXQnLCB0aW1lOiAnMDk6MTAnLCB0aXRsZTogJ1x1NTczMFx1OTRDMVx1NTNFM1x1OTZDNlx1NTQwOCcsIG5vdGU6ICdcdTRFQ0UgMyBcdTUzRjdcdTUzRTNcdTZCNjVcdTg4NENcdTdFQTYgOCBcdTUyMDZcdTk0OUZcdTUyMzBcdThERUZcdTdFQkZcdThENzdcdTcwQjlcdTMwMDInLCB0YWc6ICdcdTk2QzZcdTU0MDgnIH0sXG4gIHsgaWQ6ICdldmVudC13YXJlaG91c2UnLCB0aW1lOiAnMDk6MzAnLCB0aXRsZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1NUM1NVx1NTM4NScsIG5vdGU6ICdcdTc3MEJcdTVFMzhcdThCQkVcdTVDNTVcdTRFMEVcdTVDNEJcdTk4NzZcdTdFRDNcdTY3ODRcdUZGMENcdTUxNjVcdTUzRTNcdTU5MDRcdTUzRUZcdTVCQzRcdTVCNThcdTgwQ0NcdTUzMDVcdTMwMDInLCB0YWc6ICdcdTUzQzJcdTg5QzInIH0sXG4gIHsgaWQ6ICdldmVudC1tYXJrZXQnLCB0aW1lOiAnMTE6MDAnLCB0aXRsZTogJ1x1Njg2NVx1NEUwQlx1NTQ2OFx1NjcyQlx1NUUwMlx1OTZDNicsIG5vdGU6ICdcdTUxNDhcdTkwMUJcdTYyNEJcdTRGNUNcdTY0NEFcdTRGNERcdUZGMENcdTUxOERcdTU3MjhcdTRFMUNcdTRGQTdcdTk5MTBcdThGNjZcdTUzM0FcdTdCODBcdTUzNTVcdTUzNDhcdTk5MTBcdTMwMDInLCB0YWc6ICdcdTVFMDJcdTk2QzYnIH0sXG4gIHsgaWQ6ICdldmVudC1sdW5jaCcsIHRpbWU6ICcxMzowMCcsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU5OTg2XHU1MzQ4XHU5OTEwJywgbm90ZTogJ1x1OTg4NFx1OEJBMVx1NzUyOFx1OTkxMCA3MCBcdTUyMDZcdTk0OUZcdUZGMENcdTk3NjBcdTdBOTdcdTUzM0FcdTU3REZcdTY1RTBcdTk3MDBcdTk4ODRcdTdFQTZcdTMwMDInLCB0YWc6ICdcdTc1MjhcdTk5MTAnIH0sXG4gIHsgaWQ6ICdldmVudC1sYW5lcycsIHRpbWU6ICcxNDoyMCcsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU1REY3XHU2NTYzXHU2QjY1Jywgbm90ZTogJ1x1NkNCRlx1NzdGM1x1OTYzNlx1OEZEQlx1NTE2NVx1NjVFN1x1ODg1N1x1NTMzQVx1RkYwQ1x1N0VDRlx1OEZDN1x1NEU2Nlx1NUU5N1x1NTQ4Q1x1NTE2Q1x1NTE3MVx1NkQxN1x1ODg2M1x1NjIzRlx1MzAwMicsIHRhZzogJ1x1NkI2NVx1ODg0QycgfSxcbiAgeyBpZDogJ2V2ZW50LWdhcmRlbicsIHRpbWU6ICcxNToyMCcsIHRpdGxlOiAnXHU3OTNFXHU1MzNBXHU4MkIxXHU1NkVEXHU0RjExXHU2MDZGJywgbm90ZTogJ1x1ODg2NVx1NkMzNFx1NUU3Nlx1NjU3NFx1NzQwNlx1OTY4Rlx1OEVBQlx1NzI2OVx1NTRDMVx1RkYwQ1x1ODJCMVx1NTZFRFx1NTMxN1x1OTVFOFx1NjcwOVx1NTE2Q1x1NTE3MVx1OEJCRVx1NjVCRFx1MzAwMicsIHRhZzogJ1x1NEYxMVx1NjA2RicgfSxcbiAgeyBpZDogJ2V2ZW50LXN1bnNldCcsIHRpbWU6ICcxNzoxMCcsIHRpdGxlOiAnXHU2Q0IzXHU2RTdFXHU2NUU1XHU4NDNEXHU1RTczXHU1M0YwJywgbm90ZTogJ1x1OERFRlx1N0VCRlx1N0VDOFx1NzBCOVx1RkYwQ1x1NTNFRlx1N0VFN1x1N0VFRFx1NkNCRlx1NTgyNFx1NUNCOFx1NkI2NVx1ODg0Q1x1ODFGM1x1NjY1QVx1OTkxMFx1NTMzQVx1NTdERlx1MzAwMicsIHRhZzogJ1x1ODlDMlx1NjY2RicgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEl0aW5lcmFyeVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cIml0aW5lcmFyeS1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGl0aW5lcmFyeV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiaXRpbmVyYXJ5LWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cIml0aW5lcmFyeS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU2QkNGXHU2NUU1XHU4ODRDXHU3QTBCXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTQ2OFx1NTE2RCBcdTAwQjcgXHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5XCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fYmFja1wiIHRvPVwicm91dGUtZGV0YWlsXCI+XHU4REVGXHU3RUJGPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8U3RlcHNcbiAgICAgICAgICBpZD1cIml0aW5lcmFyeS1wcm9ncmVzc1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19wcm9ncmVzc1wiXG4gICAgICAgICAgY3VycmVudD17MX1cbiAgICAgICAgICBpdGVtcz17W3sgaWQ6ICdtb3JuaW5nJywgbGFiZWw6ICdcdTRFMEFcdTUzNDgnIH0sIHsgaWQ6ICdhZnRlcm5vb24nLCBsYWJlbDogJ1x1NEUwQlx1NTM0OCcgfSwgeyBpZDogJ2V2ZW5pbmcnLCBsYWJlbDogJ1x1NTA4RFx1NjY1QScgfV19XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJpdGluZXJhcnktZXZlbnRzXCIgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudHNcIiBnYXA9ezE0fT5cbiAgICAgICAgICB7RVZFTlRTLm1hcCgoZXZlbnQpID0+IChcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudFwiIGRhdGEtd2Yta2V5PXtldmVudC5pZH0ga2V5PXtldmVudC5pZH0gZ2FwPXsxMH0gYWxpZ25JdGVtcz1cImZsZXgtc3RhcnRcIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X190aW1lXCI+e2V2ZW50LnRpbWV9PC9UZXh0PlxuICAgICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWNhcmRcIj5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtYm9keVwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LXRpdGxlXCIgbGV2ZWw9ezN9PntldmVudC50aXRsZX08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWJhZGdlXCI+e2V2ZW50LnRhZ308L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LW5vdGVcIj57ZXZlbnQubm90ZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENhcmQgaWQ9XCJpdGluZXJhcnktcmVtaW5kZXJcIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyXCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLXRpdGxlXCI+XHU1MUZBXHU1M0QxXHU2M0QwXHU5MTkyPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLWNvcHlcIj5cdTVFRkFcdThCQUVcdTY0M0FcdTVFMjZcdTk5NkVcdTc1MjhcdTZDMzRcdTMwMDFcdThGN0JcdTRGQkZcdTk2RThcdTUxNzdcdTU0OENcdTUzRUZcdTkxQ0RcdTU5MERcdTRGN0ZcdTc1MjhcdTc2ODRcdThEMkRcdTcyNjlcdTg4OEJcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPEJ1dHRvbiBpZD1cIml0aW5lcmFyeS1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19jcmVhdGUtYWN0aW9uXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU1MjFCXHU1RUZBXHU2MjExXHU3Njg0XHU3MjQ4XHU2NzJDPC9CdXR0b24+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNy4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNy4wXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIEhlYWRpbmcsXG4gIFRleHQsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gTG9naW5TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPENvbHVtbiBpZD1cImxvZ2luLXBhZ2VcIiBnYXA9ezIwfSBjbGFzc05hbWU9XCJ3ZWVrZW5kLWxvZ2luIGxvZ2luX19wYWdlXCI+XG4gICAgICA8c3BhbiBpZD1cImxvZ2luLWxvZ29cIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLWxvZ28tcGxhY2Vob2xkZXIgbG9naW5fX2xvZ29cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJsb2dpbl9faW50cm9cIiBnYXA9ezh9PlxuICAgICAgICA8SGVhZGluZyBpZD1cImxvZ2luLXRpdGxlXCIgY2xhc3NOYW1lPVwibG9naW5fX3RpdGxlXCIgbGV2ZWw9ezF9Plx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMTwvSGVhZGluZz5cbiAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwibG9naW5fX2Rlc2NyaXB0aW9uXCI+XHU2MjhBXHU2MEYzXHU1M0JCXHU3Njg0XHU1NzMwXHU2NUI5XHVGRjBDXHU1M0Q4XHU2MjEwXHU0RTAwXHU0RUZEXHU5NjhGXHU2NUY2XHU4MEZEXHU4RDcwXHU3Njg0XHU4ODRDXHU3QTBCXHUzMDAyPC9UZXh0PlxuICAgICAgPC9Db2x1bW4+XG4gICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImxvZ2luX19waG9uZS1maWVsZFwiIGxhYmVsPVwiXHU2MjRCXHU2NzNBXHU1M0Y3XCIgaHRtbEZvcj1cImxvZ2luLXBob25lXCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJsb2dpbi1waG9uZVwiIGNsYXNzTmFtZT1cImxvZ2luX19waG9uZS1pbnB1dFwiIGlucHV0TW9kZT1cInRlbFwiIHBsYWNlaG9sZGVyPVwiXHU4QkY3XHU4RjkzXHU1MTY1XHU2MjRCXHU2NzNBXHU1M0Y3XCIgLz5cbiAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJsb2dpbl9fY29kZS1maWVsZFwiIGxhYmVsPVwiXHU5QThDXHU4QkMxXHU3ODAxXCIgaHRtbEZvcj1cImxvZ2luLWNvZGVcIiBoaW50PVwiXHU2RjE0XHU3OTNBXHU3M0FGXHU1ODgzXHU1M0VGXHU4RjkzXHU1MTY1XHU0RUZCXHU2MTBGIDYgXHU0RjREXHU2NTcwXHU1QjU3XCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJsb2dpbi1jb2RlXCIgY2xhc3NOYW1lPVwibG9naW5fX2NvZGUtaW5wdXRcIiBpbnB1dE1vZGU9XCJudW1lcmljXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTlBOENcdThCQzFcdTc4MDFcIiAvPlxuICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICA8QnV0dG9uIGlkPVwibG9naW4tc3VibWl0XCIgY2xhc3NOYW1lPVwibG9naW5fX3N1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJkaXNjb3ZlclwiPlx1NUYwMFx1NTlDQlx1NjNBMlx1N0QyMjwvQnV0dG9uPlxuICAgICAgPFRleHQgY2xhc3NOYW1lPVwibG9naW5fX2FncmVlbWVudFwiIGFzPVwic21hbGxcIj5cdTdFRTdcdTdFRURcdTUzNzNcdTg4NjhcdTc5M0FcdTU0MENcdTYxMEZcdTY3MERcdTUyQTFcdTY3NjFcdTZCM0VcdTRFMEVcdTk2OTBcdTc5QzFcdThCRjRcdTY2MEVcdTMwMDI8L1RleHQ+XG4gICAgPC9Db2x1bW4+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjcuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjcuMFxuICovXG5pbXBvcnQge1xuICBBdmF0YXIsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFByb2ZpbGVTY3JlZW4oKSB7XG4gIGNvbnN0IFtub3RpZmljYXRpb25zLCBzZXROb3RpZmljYXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtvZmZsaW5lTWFwcywgc2V0T2ZmbGluZU1hcHNdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLXBhZ2VcIiBnYXA9ezIwfSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgcHJvZmlsZV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cInByb2ZpbGUtaGVhZGVyXCIgdGl0bGVJZD1cInByb2ZpbGUtdGl0bGVcIiBjbGFzc05hbWU9XCJwcm9maWxlX19oZWFkZXJcIiB0aXRsZT1cIlx1NjIxMVx1NzY4NFwiIHN1YnRpdGxlPVwiXHU0RTJBXHU0RUJBXHU1MDRGXHU1OTdEXHU0RTBFXHU2NUM1XHU4ODRDXHU4QkJFXHU3RjZFXCIgLz5cbiAgICAgICAgPFJvdyBpZD1cInByb2ZpbGUtc3VtbWFyeVwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1bW1hcnlcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgPEF2YXRhciBjbGFzc05hbWU9XCJwcm9maWxlX19hdmF0YXJcIiBzaXplPXs1OH0gbGFiZWw9XCJcdTc1MjhcdTYyMzdcdTU5MzRcdTUwQ0ZcdTUzNjBcdTRGNERcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvZmlsZV9faWRlbnRpdHlcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwicHJvZmlsZV9fbmFtZVwiPlx1Njc5N1x1NjY1M1x1OTFDRTwvc3Ryb25nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicHJvZmlsZV9fYmlvXCI+XHU1REYyXHU4RDcwXHU4RkM3IDEyIFx1NUVBN1x1NTdDRVx1NUUwMjwvVGV4dD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Sb3c+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLWFjY291bnRcIiBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50XCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50LWNlbGxcIiB0aXRsZT1cIlx1NjVDNVx1ODg0Q1x1Njg2M1x1Njg0OFwiIHN1YnRpdGxlPVwiXHU1MDRGXHU1OTdEXHUzMDAxXHU4REIzXHU4RkY5XHU0RTBFXHU2NTM2XHU4NUNGXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50LWNlbGxcIiB0aXRsZT1cIlx1NTQwQ1x1ODg0Q1x1NEVCQVwiIHN1YnRpdGxlPVwiMyBcdTRGNERcdTVFMzhcdTc1MjhcdTU0MENcdTg4NENcdTRFQkFcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU3RDI3XHU2MDI1XHU4MDU0XHU3Q0ZCXHU0RUJBXCIgc3VidGl0bGU9XCJcdTVERjJcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtc2V0dGluZ3NcIiBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nc1wiIGdhcD17MTJ9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLWxhYmVsXCI+XHU4ODRDXHU3QTBCXHU2M0QwXHU5MTkyPC9UZXh0PlxuICAgICAgICAgICAgPFRvZ2dsZSBpZD1cInByb2ZpbGUtbm90aWZpY2F0aW9uc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX25vdGlmaWNhdGlvbnNcIiBjaGVja2VkPXtub3RpZmljYXRpb25zfSBvbkNoYW5nZT17c2V0Tm90aWZpY2F0aW9uc30gLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1sYWJlbFwiPlx1ODFFQVx1NTJBOFx1NEUwQlx1OEY3RFx1NzlCQlx1N0VCRlx1NTczMFx1NTZGRTwvVGV4dD5cbiAgICAgICAgICAgIDxUb2dnbGUgaWQ9XCJwcm9maWxlLW9mZmxpbmUtbWFwc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX29mZmxpbmUtbWFwc1wiIGNoZWNrZWQ9e29mZmxpbmVNYXBzfSBvbkNoYW5nZT17c2V0T2ZmbGluZU1hcHN9IC8+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1zdXBwb3J0XCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydFwiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydC1jZWxsXCIgdGl0bGU9XCJcdTVFMkVcdTUyQTlcdTRFMEVcdTUzQ0RcdTk5ODhcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnQtY2VsbFwiIHRpdGxlPVwiXHU5NjkwXHU3OUMxXHU4QkJFXHU3RjZFXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0LWNlbGxcIiB0aXRsZT1cIlx1NTE3M1x1NEU4RVx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVwiIHZhbHVlPVwiMS4wXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNy4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNy4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCcmVhZGNydW1icyxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIEdyaWQsXG4gIEhlYWRpbmcsXG4gIEltYWdlUGxhY2Vob2xkZXIsXG4gIFJvdyxcbiAgVGFicyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBTVE9QUyA9IFtcbiAgeyBpZDogJ3N0b3Atd2FyZWhvdXNlJywgdGl0bGU6ICdcdTY1RTdcdTRFRDNcdTVFOTNcdTVDNTVcdTUzODUnLCBzdWJ0aXRsZTogJzA5OjMwIFx1MDBCNyBcdTVFRkFcdThCQUVcdTUwNUNcdTc1NTkgNjAgXHU1MjA2XHU5NDlGJyB9LFxuICB7IGlkOiAnc3RvcC1icmlkZ2UnLCB0aXRsZTogJ1x1Njg2NVx1NEUwQlx1NTQ2OFx1NjcyQlx1NUUwMlx1OTZDNicsIHN1YnRpdGxlOiAnMTE6MDAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA5MCBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWxhbmUnLCB0aXRsZTogJ1x1NkMzNFx1NUNCOFx1NUMwRlx1NURGNycsIHN1YnRpdGxlOiAnMTM6MzAgXHUwMEI3IFx1NTM0OFx1OTkxMFx1NEUwRVx1ODg1N1x1NTMzQVx1NjU2M1x1NkI2NScgfSxcbiAgeyBpZDogJ3N0b3AtZ2FyZGVuJywgdGl0bGU6ICdcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RUQnLCBzdWJ0aXRsZTogJzE1OjIwIFx1MDBCNyBcdTVFRkFcdThCQUVcdTUwNUNcdTc1NTkgNDUgXHU1MjA2XHU5NDlGJyB9LFxuICB7IGlkOiAnc3RvcC1iZW5kJywgdGl0bGU6ICdcdTZDQjNcdTZFN0VcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnLCBzdWJ0aXRsZTogJzE3OjEwIFx1MDBCNyBcdThERUZcdTdFQkZcdTdFQzhcdTcwQjknIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZURldGFpbFNjcmVlbigpIHtcbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IFJlYWN0LnVzZVN0YXRlKCdvdmVydmlldycpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSByb3V0ZS1kZXRhaWxfX3BhZ2VcIj5cbiAgICAgICAgPEJyZWFkY3J1bWJzIGlkPVwicm91dGUtZGV0YWlsLWJyZWFkY3J1bWJzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19icmVhZGNydW1ic1wiIGl0ZW1zPXtbeyBsYWJlbDogJ1x1NTNEMVx1NzNCMCcsIHRvOiAnZGlzY292ZXInIH0sIHsgbGFiZWw6ICdcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjknIH1dfSAvPlxuICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBpZD1cInJvdXRlLWRldGFpbC1oZXJvXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19oZXJvXCIgaGVpZ2h0PXsyMjR9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19zdW1tYXJ5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IHJvdXRlLWRldGFpbF9fYmFkZ2VzXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU1N0NFXHU1RTAyXHU2RjJCXHU2QjY1PC9CYWRnZT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU4RjdCXHU2NzdFPC9CYWRnZT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU1M0VGXHU1RTI2XHU1QkEwXHU3MjY5PC9CYWRnZT5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8SGVhZGluZyBpZD1cInJvdXRlLWRldGFpbC10aXRsZVwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fdGl0bGVcIiBsZXZlbD17MX0+XHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5PC9IZWFkaW5nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9faW50cm9cIj5cdTRFMDBcdTY3NjFcdTRFQ0VcdTVERTVcdTRFMUFcdTkwNTdcdTVCNThcdThENzBcdTU0MTFcdTc1MUZcdTZEM0JcdTg4NTdcdTUzM0FcdTc2ODRcdTZDMzRcdTVDQjhcdThERUZcdTdFQkZcdTMwMDJcdTRFMEFcdTUzNDhcdTc3MEJcdTVDNTVcdUZGMENcdTRFMkRcdTUzNDhcdTkwMUJcdTVFMDJcdTk2QzZcdUZGMENcdTUwOERcdTY2NUFcdTU3MjhcdTZDQjNcdTZFN0VcdTdCNDlcdTY1RTVcdTg0M0RcdTMwMDI8L1RleHQ+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8R3JpZCBpZD1cInJvdXRlLWRldGFpbC1mYWN0c1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdHNcIiBjb2x1bW5zPXszfSBnYXA9ezh9PlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdFwiPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC12YWx1ZVwiPjguNiBrbTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtbGFiZWxcIj5cdTYwM0JcdThERUZcdTdBMEI8L3NwYW4+PC9DYXJkPlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdFwiPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC12YWx1ZVwiPjYgXHU1QzBGXHU2NUY2PC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC1sYWJlbFwiPlx1NUVGQVx1OEJBRVx1NjVGNlx1OTU3Rjwvc3Bhbj48L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+NSBcdTdBRDk8L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LWxhYmVsXCI+XHU4REVGXHU3RUJGXHU4MjgyXHU3MEI5PC9zcGFuPjwvQ2FyZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgICA8VGFicyBpZD1cInJvdXRlLWRldGFpbC10YWJzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX190YWJzXCIgYWN0aXZlSWQ9e3RhYn0gb25DaGFuZ2U9e3NldFRhYn0gaXRlbXM9e1t7IGlkOiAnb3ZlcnZpZXcnLCBsYWJlbDogJ1x1OERFRlx1N0VCRlx1Njk4Mlx1ODlDOCcgfSwgeyBpZDogJ25vdGVzJywgbGFiZWw6ICdcdTUxRkFcdTUzRDFcdTk4N0JcdTc3RTUnIH1dfSAvPlxuICAgICAgICB7dGFiID09PSAnb3ZlcnZpZXcnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtc3RvcHNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3N0b3BzXCIgZ2FwPXswfT5cbiAgICAgICAgICAgIHtTVE9QUy5tYXAoKHN0b3AsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fc3RvcFwiIGRhdGEtd2Yta2V5PXtzdG9wLmlkfSBrZXk9e3N0b3AuaWR9IHRpdGxlPXtgJHtpbmRleCArIDF9LiAke3N0b3AudGl0bGV9YH0gc3VidGl0bGU9e3N0b3Auc3VidGl0bGV9IHZhbHVlPXtgJHtpbmRleCArIDF9YH0gLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxDYXJkIGlkPVwicm91dGUtZGV0YWlsLW5vdGVzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3Rlc1wiPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVzLWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3RlXCI+XHU2Q0JGXHU5MDE0XHU1OTI3XHU5MEU4XHU1MjA2XHU4REVGXHU2QkI1XHU2NzA5XHU2ODExXHU4MzZCXHVGRjBDXHU2Q0IzXHU2RTdFXHU1MzNBXHU1N0RGXHU0RTBCXHU1MzQ4XHU2NUU1XHU3MTY3XHU4RjgzXHU1RjNBXHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVcIj5cdTY1RTdcdTRFRDNcdTVFOTNcdTU0NjhcdTRFMDBcdTk1RURcdTk5ODZcdUZGMENcdTU0NjhcdTY3MkJcdTVFRkFcdThCQUVcdTYzRDBcdTUyNERcdTk4ODRcdTdFQTZcdTUxNjVcdTU3M0FcdTY1RjZcdTZCQjVcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZVwiPlx1OERFRlx1N0VCRlx1N0VDOFx1NzBCOVx1OERERFx1NzlCQlx1NTczMFx1OTRDMVx1N0FEOVx1N0VBNiA5MDAgXHU3QzczXHVGRjBDXHU0RTVGXHU1M0VGXHU0RTU4XHU1NzUwXHU3OTNFXHU1MzNBXHU2M0E1XHU5QTczXHU4RjY2XHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICApfVxuICAgICAgICA8Q2FyZCBpZD1cInJvdXRlLWRldGFpbC1ndWlkZVwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGVcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtYm9keVwiIGdhcD17OH0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2d1aWRlLXRpdGxlXCIgbGV2ZWw9ezN9Plx1OERFRlx1N0VCRlx1N0I1Nlx1NTIxMlx1NEVCQTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtY29weVwiPlx1Njc5N1x1NUM3RiBcdTAwQjcgXHU1N0NFXHU1RTAyXHU2QjY1XHU4ODRDXHU4QkIwXHU1RjU1XHU4MDA1XHVGRjBDXHU1REYyXHU1M0QxXHU1RTAzIDE4IFx1Njc2MVx1NkMzNFx1NUNCOFx1OERFRlx1N0VCRlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLWFjdGlvbnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2FjdGlvbnNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8QnV0dG9uIGlkPVwicm91dGUtZGV0YWlsLWl0aW5lcmFyeS1hY3Rpb25cIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2l0aW5lcmFyeS1hY3Rpb25cIiB0bz1cIml0aW5lcmFyeVwiPlx1NjdFNVx1NzcwQlx1NUI4Q1x1NjU3NFx1NjVFNVx1N0EwQjwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJyb3V0ZS1kZXRhaWwtY3JlYXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fY3JlYXRlLWFjdGlvblwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJ0cmlwLWNyZWF0ZVwiPlx1NzUyOFx1OEZEOVx1Njc2MVx1OERFRlx1N0VCRlx1NTIxQlx1NUVGQVx1ODg0Q1x1N0EwQjwvQnV0dG9uPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS43LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS43LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ2VsbCxcbiAgQ29sdW1uLFxuICBDb25maXJtRGlhbG9nLFxuICBMb2FkaW5nT3ZlcmxheSxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBTdGVwcyxcbiAgVGV4dCxcbiAgVG9hc3QsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBDb25maXJtU2NyZWVuKCkge1xuICBjb25zdCBbY29uZmlybU9wZW4sIHNldENvbmZpcm1PcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NhdmVkLCBzZXRTYXZlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBzdWJtaXRUcmlwID0gKCkgPT4ge1xuICAgIHNldENvbmZpcm1PcGVuKGZhbHNlKVxuICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgc2V0U2F2ZWQodHJ1ZSlcbiAgICB9LCA3MDApXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcC1jb25maXJtLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcC1jb25maXJtX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwidHJpcC1jb25maXJtLWhlYWRlclwiIHRpdGxlSWQ9XCJ0cmlwLWNvbmZpcm0tdGl0bGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2hlYWRlclwiIHRpdGxlPVwiXHU3ODZFXHU4QkE0XHU4ODRDXHU3QTBCXCIgc3VidGl0bGU9XCJcdTY4QzBcdTY3RTVcdTRGRTFcdTYwNkZcdTU0MEVcdTRGRERcdTVCNThcdTUyMzBcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEJcIiAvPlxuICAgICAgICA8U3RlcHMgaWQ9XCJ0cmlwLWNvbmZpcm0tc3RlcHNcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N0ZXBzXCIgY3VycmVudD17Mn0gaXRlbXM9e1t7IGlkOiAnYmFzaWMnLCBsYWJlbDogJ1x1NTdGQVx1NjcyQ1x1NEZFMVx1NjA2RicgfSwgeyBpZDogJ2J1ZGdldCcsIGxhYmVsOiAnXHU5ODg0XHU3Qjk3JyB9LCB7IGlkOiAnY29uZmlybScsIGxhYmVsOiAnXHU3ODZFXHU4QkE0JyB9XX0gLz5cbiAgICAgICAgPENhcmQgaWQ9XCJ0cmlwLWNvbmZpcm0tc3VtbWFyeVwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VtbWFyeVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5LWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5LWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RyaXAtbmFtZVwiPlx1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NTwvc3Ryb25nPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdGF0dXNcIj5cdTVGODVcdTRGRERcdTVCNTg8L0JhZGdlPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RhdGVcIj4yMDI2IFx1NUU3NCA4IFx1NjcwOCAxNSBcdTY1RTUgXHUwMEI3IFx1NTQ2OFx1NTE2RDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fcm91dGVcIj5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjkgXHUwMEI3IDguNiBrbSBcdTAwQjcgXHU3RUE2IDYgXHU1QzBGXHU2NUY2PC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tZGV0YWlsc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsc1wiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1OTZDNlx1NTQwOFx1NTczMFx1NzBCOVwiIHN1YnRpdGxlPVwiXHU4RkQwXHU2Q0IzXHU4REVGXHU1NzMwXHU5NEMxXHU3QUQ5IDMgXHU1M0Y3XHU1M0UzXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU4ODRDXHU3QTBCXHU4MjgyXHU1OTRGXCIgdmFsdWU9XCJcdThGN0JcdTY3N0VcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTU0MENcdTg4NENcdTRFQkFcdTY1NzBcIiB2YWx1ZT1cIjMgXHU0RUJBXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU1MUZBXHU1M0QxXHU2M0QwXHU5MTkyXCIgdmFsdWU9XCJcdTVERjJcdTVGMDBcdTU0MkZcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENhcmQgaWQ9XCJ0cmlwLWNvbmZpcm0tYnVkZ2V0XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXRcIiB0bz1cImJ1ZGdldFwiPlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtYm9keVwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtY29weVwiIGdhcD17NX0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LWxhYmVsXCI+XHU5ODg0XHU4QkExXHU2MDNCXHU4RDM5XHU3NTI4PC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1ub3RlXCI+XHU2N0U1XHU3NzBCXHU2NjBFXHU3RUM2XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBPC9UZXh0PlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RvdGFsXCI+NDI4IFx1NTE0Mzwvc3Bhbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jb25maXJtLWFjdGlvbnNcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2FjdGlvbnNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8QnV0dG9uIGlkPVwidHJpcC1jb25maXJtLXN1Ym1pdFwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXsoKSA9PiBzZXRDb25maXJtT3Blbih0cnVlKX0+XHU3ODZFXHU4QkE0XHU1RTc2XHU0RkREXHU1QjU4PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RyaXBzLWFjdGlvblwiIHRvPVwidHJpcHNcIj5cdTY3RTVcdTc3MEJcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEI8L0J1dHRvbj5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDb25maXJtRGlhbG9nXG4gICAgICAgICAgaWQ9XCJ0cmlwLWNvbmZpcm0tZGlhbG9nXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RpYWxvZ1wiXG4gICAgICAgICAgb3Blbj17Y29uZmlybU9wZW59XG4gICAgICAgICAgdGl0bGU9XCJcdTRGRERcdTVCNThcdThGRDlcdTRFRkRcdTg4NENcdTdBMEJcdUZGMUZcIlxuICAgICAgICAgIG1lc3NhZ2U9XCJcdTRGRERcdTVCNThcdTU0MEVcdTRGMUFcdTU0MENcdTZCNjVcdTdFRDlcdTVERjJcdTUyQTBcdTUxNjVcdTc2ODRcdTU0MENcdTg4NENcdTRFQkFcdUZGMENcdTVFNzZcdTU3MjhcdTUxRkFcdTUzRDFcdTUyNERcdTUzRDFcdTkwMDFcdTYzRDBcdTkxOTJcdTMwMDJcIlxuICAgICAgICAgIGNvbmZpcm1MYWJlbD1cIlx1Nzg2RVx1OEJBNFx1NEZERFx1NUI1OFwiXG4gICAgICAgICAgb25Db25maXJtPXtzdWJtaXRUcmlwfVxuICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBzZXRDb25maXJtT3BlbihmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxMb2FkaW5nT3ZlcmxheSBpZD1cInRyaXAtY29uZmlybS1sb2FkaW5nXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19sb2FkaW5nXCIgb3Blbj17bG9hZGluZ30gbGFiZWw9XCJcdTZCNjNcdTU3MjhcdTc1MUZcdTYyMTBcdTg4NENcdTdBMEJcIiAvPlxuICAgICAgICA8VG9hc3QgaWQ9XCJ0cmlwLWNvbmZpcm0tdG9hc3RcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RvYXN0XCIgb3Blbj17c2F2ZWR9Plx1ODg0Q1x1N0EwQlx1NURGMlx1NEZERFx1NUI1OFx1RkYwQ1x1NTNFRlx1NTcyOFx1MjAxQ1x1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlx1MjAxRFx1NjdFNVx1NzcwQlx1MzAwMjwvVG9hc3Q+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNy4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNy4wXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2hlY2tib3gsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBQYWdlSGVhZGVyLFxuICBSYWRpbyxcbiAgUm93LFxuICBTZWxlY3QsXG4gIFN0ZXBzLFxuICBUZXh0QXJlYSxcbiAgVGV4dElucHV0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBDcmVhdGVTY3JlZW4oKSB7XG4gIGNvbnN0IFtyZW1pbmRlciwgc2V0UmVtaW5kZXJdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXBhZ2VcIiBnYXA9ezE3fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcC1jcmVhdGVfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJ0cmlwLWNyZWF0ZS1oZWFkZXJcIiB0aXRsZUlkPVwidHJpcC1jcmVhdGUtdGl0bGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9faGVhZGVyXCIgdGl0bGU9XCJcdTUyMUJcdTVFRkFcdTg4NENcdTdBMEJcIiBzdWJ0aXRsZT1cIlx1NTE0OFx1Nzg2RVx1NUI5QVx1NjVGNlx1OTVGNFx1NEUwRVx1NTQwQ1x1ODg0Q1x1NjVCOVx1NUYwRlwiIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2NhbmNlbFwiIHRvPVwicm91dGUtZGV0YWlsXCI+XHU1M0Q2XHU2RDg4PC9CdXR0b24+fSAvPlxuICAgICAgICA8U3RlcHMgaWQ9XCJ0cmlwLWNyZWF0ZS1zdGVwc1wiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGVwc1wiIGN1cnJlbnQ9ezB9IGl0ZW1zPXtbeyBpZDogJ2Jhc2ljJywgbGFiZWw6ICdcdTU3RkFcdTY3MkNcdTRGRTFcdTYwNkYnIH0sIHsgaWQ6ICdidWRnZXQnLCBsYWJlbDogJ1x1OTg4NFx1N0I5NycgfSwgeyBpZDogJ2NvbmZpcm0nLCBsYWJlbDogJ1x1Nzg2RVx1OEJBNCcgfV19IC8+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25hbWUtZmllbGRcIiBsYWJlbD1cIlx1ODg0Q1x1N0EwQlx1NTQwRFx1NzlGMFwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1uYW1lXCI+XG4gICAgICAgICAgPFRleHRJbnB1dCBpZD1cInRyaXAtY3JlYXRlLW5hbWVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbmFtZS1pbnB1dFwiIGRlZmF1bHRWYWx1ZT1cIlx1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19kYXRlLWZpZWxkXCIgbGFiZWw9XCJcdTUxRkFcdTUzRDFcdTY1RTVcdTY3MUZcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtZGF0ZVwiIGhpbnQ9XCJcdTVFRkFcdThCQUVcdTkwMDlcdTYyRTlcdTU5MjlcdTZDMTRcdTdBMzNcdTVCOUFcdTc2ODRcdTY1RTVcdTY3MUZcIj5cbiAgICAgICAgICA8VGV4dElucHV0IGlkPVwidHJpcC1jcmVhdGUtZGF0ZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19kYXRlLWlucHV0XCIgZGVmYXVsdFZhbHVlPVwiMjAyNi0wOC0xNVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1maWVsZFwiIGxhYmVsPVwiXHU5NkM2XHU1NDA4XHU1NzMwXHU3MEI5XCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLXN0YXJ0XCI+XG4gICAgICAgICAgPFNlbGVjdCBpZD1cInRyaXAtY3JlYXRlLXN0YXJ0XCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LXNlbGVjdFwiIGRlZmF1bHRWYWx1ZT1cIm1ldHJvXCI+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cIm1ldHJvXCI+XHU4RkQwXHU2Q0IzXHU4REVGXHU1NzMwXHU5NEMxXHU3QUQ5IDMgXHU1M0Y3XHU1M0UzPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cIndhcmVob3VzZVwiPlx1NjVFN1x1NEVEM1x1NUU5M1x1NkI2M1x1OTVFODwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtb3B0aW9uXCIgdmFsdWU9XCJjdXN0b21cIj5cdTgxRUFcdTVCOUFcdTRFNDlcdTU3MzBcdTcwQjk8L29wdGlvbj5cbiAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNyZWF0ZS1wYWNlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2VcIiBnYXA9ezl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19ncm91cC1sYWJlbFwiPlx1ODg0Q1x1N0EwQlx1ODI4Mlx1NTk0Rjwvc3Bhbj5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvbnNcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU4RjdCXHU2NzdFXCIgZGVmYXVsdENoZWNrZWQgLz5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU2ODA3XHU1MUM2XCIgLz5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU3RDI3XHU1MUQxXCIgLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25vdGUtZmllbGRcIiBsYWJlbD1cIlx1NTQwQ1x1ODg0Q1x1NTkwN1x1NkNFOFwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1ub3RlXCI+XG4gICAgICAgICAgPFRleHRBcmVhIGlkPVwidHJpcC1jcmVhdGUtbm90ZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19ub3RlLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJcdTRGOEJcdTU5ODJcdUZGMUFcdTY3MDlcdTUxM0ZcdTdBRTVcdTU0MENcdTg4NENcdUZGMENcdTVFMENcdTY3MUJcdTUxQ0ZcdTVDMTFcdTY5N0NcdTY4QUZcdThERUZcdTZCQjVcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXByZWZlcmVuY2VzXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3ByZWZlcmVuY2VzXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPENoZWNrYm94IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wcmVmZXJlbmNlXCIgbGFiZWw9XCJcdTRGMThcdTUxNDhcdTVCODlcdTYzOTJcdTY1RTBcdTk2OUNcdTc4OERcdThERUZcdTdFQkZcIiAvPlxuICAgICAgICAgIDxDaGVja2JveCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcHJlZmVyZW5jZVwiIGxhYmVsPVwiXHU5MDdGXHU1RjAwXHU5NzAwXHU4OTgxXHU5ODg0XHU3RUE2XHU3Njg0XHU1NzMwXHU3MEI5XCIgZGVmYXVsdENoZWNrZWQgLz5cbiAgICAgICAgICA8VG9nZ2xlIGlkPVwidHJpcC1jcmVhdGUtcmVtaW5kZXJcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcmVtaW5kZXJcIiBjaGVja2VkPXtyZW1pbmRlcn0gb25DaGFuZ2U9e3NldFJlbWluZGVyfSBsYWJlbD1cIlx1NTFGQVx1NTNEMVx1NTI0RFx1NEUwMFx1NTkyOVx1NjNEMFx1OTE5MlwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8QnV0dG9uIGlkPVwidHJpcC1jcmVhdGUtbmV4dFwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19uZXh0XCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cImJ1ZGdldFwiPlx1NEUwQlx1NEUwMFx1NkI2NVx1RkYxQVx1OTg4NFx1N0I5N1x1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQTwvQnV0dG9uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjcuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjcuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEVtcHR5U3RhdGUsXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGFicyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBUUklQUyA9IFtcbiAgeyBpZDogJ3RyaXAtY2FuYWwnLCB0aXRsZTogJ1x1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NScsIGRhdGU6ICc4IFx1NjcwOCAxNSBcdTY1RTUnLCBzdGF0dXM6ICdcdTVGODVcdTUxRkFcdTUzRDEnLCBkZXRhaWw6ICczIFx1NEVCQSBcdTAwQjcgNSBcdTRFMkFcdTU3MzBcdTcwQjknIH0sXG4gIHsgaWQ6ICd0cmlwLWxha2UnLCB0aXRsZTogJ1x1NzNBRlx1NkU1Nlx1OUE5MVx1ODg0Q1x1NTM0QVx1NjVFNScsIGRhdGU6ICc4IFx1NjcwOCAyMiBcdTY1RTUnLCBzdGF0dXM6ICdcdTg5QzRcdTUyMTJcdTRFMkQnLCBkZXRhaWw6ICcyIFx1NEVCQSBcdTAwQjcgNCBcdTRFMkFcdTU3MzBcdTcwQjknIH0sXG4gIHsgaWQ6ICd0cmlwLW11c2V1bScsIHRpdGxlOiAnXHU5NkU4XHU1OTI5XHU1MzVBXHU3MjY5XHU5OTg2XHU3RUJGJywgZGF0ZTogJzkgXHU2NzA4IDUgXHU2NUU1Jywgc3RhdHVzOiAnXHU1Rjg1XHU3ODZFXHU4QkE0JywgZGV0YWlsOiAnNCBcdTRFQkEgXHUwMEI3IDMgXHU0RTJBXHU1NzNBXHU5OTg2JyB9LFxuICB7IGlkOiAndHJpcC1oaWxscycsIHRpdGxlOiAnXHU1N0NFXHU1MzE3XHU4RjdCXHU1RjkyXHU2QjY1JywgZGF0ZTogJzkgXHU2NzA4IDEyIFx1NjVFNScsIHN0YXR1czogJ1x1ODlDNFx1NTIxMlx1NEUyRCcsIGRldGFpbDogJzMgXHU0RUJBIFx1MDBCNyA2IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBzU2NyZWVuKCkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gUmVhY3QudXNlU3RhdGUoJ3VwY29taW5nJylcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInRyaXBzLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcHNfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cInRyaXBzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cInRyaXBzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0cmlwc19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdThCQTFcdTUyMTJcdTMwMDFcdTU0MENcdTg4NENcdTRGRTFcdTYwNkZcdTRFMEVcdTY1QzVcdTg4NENcdThCQjBcdTVGNTVcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gaWQ9XCJ0cmlwcy1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwidHJpcHNfX2NyZWF0ZS1hY3Rpb25cIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU2NUIwXHU1RUZBPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8VGFicyBpZD1cInRyaXBzLXRhYnNcIiBjbGFzc05hbWU9XCJ0cmlwc19fdGFic1wiIGFjdGl2ZUlkPXt0YWJ9IG9uQ2hhbmdlPXtzZXRUYWJ9IGl0ZW1zPXtbeyBpZDogJ3VwY29taW5nJywgbGFiZWw6ICdcdTVGODVcdTUxRkFcdTUzRDEnIH0sIHsgaWQ6ICdjb21wbGV0ZWQnLCBsYWJlbDogJ1x1NURGMlx1NUI4Q1x1NjIxMCcgfSwgeyBpZDogJ3NhdmVkJywgbGFiZWw6ICdcdTY1MzZcdTg1Q0YnIH1dfSAvPlxuICAgICAgICB7dGFiID09PSAndXBjb21pbmcnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwcy11cGNvbWluZ1wiIGNsYXNzTmFtZT1cInRyaXBzX19saXN0XCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICB7VFJJUFMubWFwKCh0cmlwKSA9PiAoXG4gICAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9e3RyaXAuaWR9IGtleT17dHJpcC5pZH0gdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezl9PlxuICAgICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Pnt0cmlwLnRpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXN0YXR1c1wiPnt0cmlwLnN0YXR1c308L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+e3RyaXAuZGF0ZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXBzX19zdGF0dXMtcm93XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRldGFpbFwiPnt0cmlwLmRldGFpbH08L1RleHQ+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXJlbWluZGVyXCI+XHU2M0QwXHU5MTkyXHU1REYyXHU1RjAwXHU1NDJGPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICApIDogdGFiID09PSAnY29tcGxldGVkJyA/IChcbiAgICAgICAgICA8Q29sdW1uIGlkPVwidHJpcHMtY29tcGxldGVkXCIgY2xhc3NOYW1lPVwidHJpcHNfX2NvbXBsZXRlZFwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT1cInRyaXAtb2xkLXN0cmVldFwiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTgwMDFcdTg4NTdcdTYxNjJcdTZFMzg8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjcgXHU2NzA4IDE4IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9XCJ0cmlwLW5pZ2h0LXdhbGtcIiB0bz1cInJvdXRlLWRldGFpbFwiPjxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OH0+PEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+XHU1OTFDXHU4MjcyXHU1RUZBXHU3QjUxXHU2NTYzXHU2QjY1PC9IZWFkaW5nPjxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj42IFx1NjcwOCAyNyBcdTY1RTUgXHUwMEI3IFx1NURGMlx1NUI4Q1x1NjIxMDwvVGV4dD48L0NvbHVtbj48L0NhcmQ+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PVwidHJpcC1yaXZlcnNpZGVcIiB0bz1cInJvdXRlLWRldGFpbFwiPjxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OH0+PEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+XHU1MzU3XHU1Q0I4XHU2NUU3XHU3ODAxXHU1OTM0PC9IZWFkaW5nPjxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj41IFx1NjcwOCAxNiBcdTY1RTUgXHUwMEI3IFx1NURGMlx1NUI4Q1x1NjIxMDwvVGV4dD48L0NvbHVtbj48L0NhcmQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPEVtcHR5U3RhdGUgaWQ9XCJ0cmlwcy1zYXZlZC1lbXB0eVwiIGNsYXNzTmFtZT1cInRyaXBzX19lbXB0eVwiIHRpdGxlPVwiXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTM2XHU4NUNGXHU4REVGXHU3RUJGXCIgZGVzY3JpcHRpb249XCJcdTU3MjhcdThERUZcdTdFQkZcdThCRTZcdTYwQzVcdTRFMkRcdTY1MzZcdTg1Q0ZcdUZGMENcdTdBMERcdTU0MEVcdTUxOERcdTUxQjNcdTVCOUFcdTRFQzBcdTRFNDhcdTY1RjZcdTUwMTlcdTUxRkFcdTUzRDFcdTMwMDJcIiBhY3Rpb249ezxCdXR0b24gY2xhc3NOYW1lPVwidHJpcHNfX2VtcHR5LWFjdGlvblwiIHRvPVwiZGlzY292ZXJcIj5cdTUzQkJcdTUzRDFcdTczQjBcdThERUZcdTdFQkY8L0J1dHRvbj59IC8+XG4gICAgICAgICl9XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgImltcG9ydCB7IEJ1ZGdldFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9idWRnZXQuanN4J1xuaW1wb3J0IHsgRGlzY292ZXJTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvZGlzY292ZXIuanN4J1xuaW1wb3J0IHsgRXhwbG9yZU1hcFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9leHBsb3JlLW1hcC5qc3gnXG5pbXBvcnQgeyBJdGluZXJhcnlTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvaXRpbmVyYXJ5LmpzeCdcbmltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2xvZ2luLmpzeCdcbmltcG9ydCB7IFByb2ZpbGVTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcHJvZmlsZS5qc3gnXG5pbXBvcnQgeyBSb3V0ZURldGFpbFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4J1xuaW1wb3J0IHsgVHJpcENvbmZpcm1TY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcC1jb25maXJtLmpzeCdcbmltcG9ydCB7IFRyaXBDcmVhdGVTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4J1xuaW1wb3J0IHsgVHJpcHNTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcHMuanN4J1xuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ1x1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVx1NjVDNVx1ODg0Q1x1NTJBOVx1NjI0QicsXG4gIHZpZXdwb3J0czoge1xuICAgIG1vYmlsZTogeyB3aWR0aDogMzc1LCBoZWlnaHQ6IDgxMiB9LFxuICB9LFxuICBkZWZhdWx0Vmlld3BvcnQ6ICdtb2JpbGUnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICdsb2dpbicsXG4gICAgICB0aXRsZTogJ1x1NzY3Qlx1NUY1NScsXG4gICAgICBjb21wb25lbnQ6IExvZ2luU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWydkaXNjb3ZlciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnZGlzY292ZXInLFxuICAgICAgdGl0bGU6ICdcdTUzRDFcdTczQjAnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdThEODVcdThGQzdcdTRFMDBcdTVDNEZcdTc2ODRcdThERUZcdTdFQkZcdTYzQThcdTgzNTBcdTk5OTZcdTk4NzUnLFxuICAgICAgY29tcG9uZW50OiBEaXNjb3ZlclNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ2V4cGxvcmUtbWFwJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdleHBsb3JlLW1hcCcsXG4gICAgICB0aXRsZTogJ1x1NzZFRVx1NzY4NFx1NTczMFx1NTczMFx1NTZGRScsXG4gICAgICBjb21wb25lbnQ6IEV4cGxvcmVNYXBTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncm91dGUtZGV0YWlsJyxcbiAgICAgIHRpdGxlOiAnXHU4REVGXHU3RUJGXHU4QkU2XHU2MEM1JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU5NTdGXHU1MTg1XHU1QkI5XHU4REVGXHU3RUJGXHU0RUNCXHU3RUNEXHU0RTBFXHU1NzMwXHU3MEI5XHU1MjE3XHU4ODY4JyxcbiAgICAgIGNvbXBvbmVudDogUm91dGVEZXRhaWxTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdleHBsb3JlLW1hcCcsICdpdGluZXJhcnknLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnaXRpbmVyYXJ5JyxcbiAgICAgIHRpdGxlOiAnXHU2QkNGXHU2NUU1XHU4ODRDXHU3QTBCJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU4RDg1XHU4RkM3XHU0RTAwXHU1QzRGXHU3Njg0XHU3RUI1XHU1NDExXHU2QjY1XHU5QUE0XHU0RTBFXHU2NUU1XHU3QTBCXHU1MzYxXHU3MjQ3JyxcbiAgICAgIGNvbXBvbmVudDogSXRpbmVyYXJ5U2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ3RyaXAtY3JlYXRlJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXAtY3JlYXRlJyxcbiAgICAgIHRpdGxlOiAnXHU1MjFCXHU1RUZBXHU4ODRDXHU3QTBCJyxcbiAgICAgIGNvbXBvbmVudDogVHJpcENyZWF0ZVNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICdidWRnZXQnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnYnVkZ2V0JyxcbiAgICAgIHRpdGxlOiAnXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBJyxcbiAgICAgIGNvbXBvbmVudDogQnVkZ2V0U2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAndHJpcC1jb25maXJtJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXAtY29uZmlybScsXG4gICAgICB0aXRsZTogJ1x1NjNEMFx1NEVBNFx1Nzg2RVx1OEJBNCcsXG4gICAgICBjb21wb25lbnQ6IFRyaXBDb25maXJtU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAnYnVkZ2V0JywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogWydcdTc4NkVcdThCQTRcdTVGMzlcdTVDNDInLCAnXHU1MkEwXHU4RjdEXHU3MkI2XHU2MDAxJywgJ1x1NjIxMFx1NTI5Rlx1NjNEMFx1NzkzQSddLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd0cmlwcycsXG4gICAgICB0aXRsZTogJ1x1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQicsXG4gICAgICBjb21wb25lbnQ6IFRyaXBzU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ3RyaXAtY3JlYXRlJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3Byb2ZpbGUnLFxuICAgICAgdGl0bGU6ICdcdTRFMkFcdTRFQkFcdThCQkVcdTdGNkUnLFxuICAgICAgY29tcG9uZW50OiBQcm9maWxlU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMnXG5pbXBvcnQgeyBwcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJ1xuXG52YWxpZGF0ZVByb2plY3QocHJvamVjdClcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxFcnJvckJvdW5kYXJ5IHNjb3BlPVwiYm9hcmRcIj5cbiAgICA8UHJvdG90eXBlUHJvdmlkZXIgcHJvamVjdD17cHJvamVjdH0+XG4gICAgICA8Qm9hcmQgcHJvamVjdD17cHJvamVjdH0gLz5cbiAgICA8L1Byb3RvdHlwZVByb3ZpZGVyPlxuICA8L0Vycm9yQm91bmRhcnk+LFxuKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQUEsTUFBTSxtQkFBbUIsTUFBTSxjQUFjLElBQUk7QUFFakQsV0FBUyxtQkFBbUJBLFVBQVM7QUFGckM7QUFHRSxhQUFPLEtBQUFBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLEtBQUssTUFBN0MsbUJBQWdELE9BQU1BLFNBQVEsUUFBUSxDQUFDLEVBQUU7QUFBQSxFQUNsRjtBQUVPLFdBQVMsa0JBQWtCLEVBQUUsU0FBQUEsVUFBUyxTQUFTLEdBQUc7QUFDdkQsVUFBTSxrQkFBa0IsbUJBQW1CQSxRQUFPO0FBQ2xELFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUN2QyxNQUFNO0FBQUEsTUFDTixhQUFhQSxTQUFRO0FBQUEsTUFDckIsU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDO0FBQUEsSUFDWixDQUFDO0FBRUQsVUFBTSxXQUFXLE1BQU0sWUFBWSxDQUFDLE9BQU87QUFDekMsVUFBSSxDQUFDQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxPQUFPLEVBQUUsR0FBRztBQUN2RCxjQUFNLElBQUksTUFBTSxzQkFBc0IsRUFBRSxrQkFBa0I7QUFBQSxNQUM1RDtBQUNBLGVBQVMsQ0FBQyxZQUFZO0FBQ3BCLFlBQUksUUFBUSxTQUFTLFVBQVUsT0FBTyxRQUFRLGlCQUFpQjtBQUM3RCxnQkFBTSxTQUFTQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLFFBQVEs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LFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixTQUFTLFNBQVM7QUFBQSxRQUN0RCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksVUFBVSxTQUFTLFNBQVM7QUFBQSxRQUNoRCxXQUFXLENBQUMsNEJBQVEsNEJBQVEsMEJBQU07QUFBQSxNQUNwQztBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLGdCQUFnQixlQUFlLFNBQVMsU0FBUztBQUFBLFFBQ3JFLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxTQUFTLFNBQVM7QUFBQSxRQUN0QyxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7OztBQ3ZGQSxrQkFBZ0IsT0FBTztBQUV2QixXQUFTLFdBQVcsU0FBUyxlQUFlLE1BQU0sQ0FBQyxFQUFFO0FBQUEsSUFDbkQsb0NBQUMsaUJBQWMsT0FBTSxXQUNuQixvQ0FBQyxxQkFBa0IsV0FDakIsb0NBQUMsU0FBTSxTQUFrQixDQUMzQixDQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsicHJvamVjdCIsICJwcm9qZWN0IiwgIl9hIiwgInByb2plY3QiLCAicHJvamVjdCIsICJjb3B5VGV4dCIsICJwcm9qZWN0IiwgIl9hIiwgInByb2plY3QiLCAicHJvamVjdCIsICJ0YWJzIl0KfQo=
