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
    React.useLayoutEffect(() => {
      let disconnectResize = () => {
      };
      const stopWaiting = waitForCanvasIndexElements(
        () => ({ container: canvasRef.current, item: indexRef.current }),
        ({ container: canvas, item: index }) => {
          const update = () => onPositionChange((current) => constrain(current, !current));
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
    }, [canvasRef, constrain, onPositionChange]);
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
    return /* @__PURE__ */ React.createElement("aside", { className: "wf-review-panel", "aria-label": "\u4FEE\u6539\u539F\u578B" }, /* @__PURE__ */ React.createElement("header", { className: "wf-review-panel-header" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-heading" }, /* @__PURE__ */ React.createElement("strong", { className: "wf-review-panel-title" }, "\u4FEE\u6539\u539F\u578B"), /* @__PURE__ */ React.createElement("span", { className: "wf-review-panel-count" }, items.length, " \u6761\u4FEE\u6539")), /* @__PURE__ */ React.createElement("button", { type: "button", className: "wf-review-close", onClick: onClose }, "\u5173\u95ED")), /* @__PURE__ */ React.createElement("div", { className: "wf-review-panel-body" }, /* @__PURE__ */ React.createElement("section", { className: "wf-review-section" }, /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-heading" }, /* @__PURE__ */ React.createElement("h2", { className: "wf-review-section-heading" }, "\u5DF2\u9009\u8282\u70B9 (", selections.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "wf-review-selection-actions" }, /* @__PURE__ */ React.createElement(
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
        "aria-label": `\u5C55\u5F00\u8BC4\u8BBA\uFF0C\u5171 ${count} \u6761\u4FEE\u6539`,
        "data-tooltip": "\u5C55\u5F00\u8BC4\u8BBA",
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
  var BOARD_SHORTCUTS = [
    { id: "canvas", keys: "Ctrl+1", label: "\u5207\u6362\u5230\u753B\u677F\u6A21\u5F0F" },
    { id: "demo", keys: "Ctrl+2", label: "\u5207\u6362\u5230\u6F14\u793A\u6A21\u5F0F" },
    { id: "interaction", keys: "Ctrl+I", label: "\u5207\u6362\u53EF\u4EA4\u4E92 / \u4E0D\u53EF\u4EA4\u4E92" },
    { id: "review", keys: "Ctrl+M", label: "\u5F00\u542F\u6216\u5173\u95ED\u4FEE\u6539\u6A21\u5F0F" },
    { id: "immersive", keys: "Ctrl+F", label: "\u5207\u6362\u6C89\u6D78\u6A21\u5F0F" },
    { id: "browser-fullscreen", keys: "Ctrl+Shift+F", label: "\u5207\u6362\u6D4F\u89C8\u5668\u5168\u5C4F" },
    { id: "hotspots", keys: "Ctrl+H", label: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A" },
    { id: "space", keys: "Space", label: "\u6309\u4F4F\u4E34\u65F6\u62D6\u52A8\u753B\u5E03" },
    { id: "escape", keys: "Esc", label: "\u5173\u95ED\u5F53\u524D\u9762\u677F\u6216\u9000\u51FA\u6A21\u5F0F" },
    { id: "help", keys: "?", label: "\u6253\u5F00\u6216\u5173\u95ED\u5E2E\u52A9 / \u5FEB\u6377\u952E" }
  ];
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
  function shortcutIdForEvent(event) {
    if (!event || event.repeat || event.metaKey || event.altKey) return null;
    const key = String(event.key || "").toLowerCase();
    if (!event.ctrlKey) {
      if (!event.shiftKey && key === "escape") return "escape";
      if (event.key === "?") return "help";
      return null;
    }
    if (event.shiftKey) return key === "f" ? "browser-fullscreen" : null;
    if (key === "1") return "canvas";
    if (key === "2") return "demo";
    if (key === "i") return "interaction";
    if (key === "m") return "review";
    if (key === "f") return "immersive";
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
    return /* @__PURE__ */ React.createElement(PanelShell, { id: "wf-board-utility", title: "\u5E2E\u52A9 / \u5FEB\u6377\u952E / \u8BBE\u7F6E", ariaLabel: "\u5E2E\u52A9\u3001\u5FEB\u6377\u952E\u4E0E\u8BBE\u7F6E", onClose }, /* @__PURE__ */ React.createElement("dl", { className: "wf-shortcut-list" }, BOARD_SHORTCUTS.map((shortcut) => /* @__PURE__ */ React.createElement("div", { className: shortcut.id === "demo" && !demoAvailable ? "is-disabled" : "", key: shortcut.id }, /* @__PURE__ */ React.createElement("dt", null, /* @__PURE__ */ React.createElement("kbd", null, shortcut.keys)), /* @__PURE__ */ React.createElement("dd", null, shortcut.label, shortcut.id === "demo" && !demoAvailable ? "\uFF08\u5F53\u524D\u4E0D\u53EF\u7528\uFF09" : "")))), /* @__PURE__ */ React.createElement("p", { className: "wf-board-panel-note" }, "\u5728\u8F93\u5165\u6846\u3001\u6587\u672C\u57DF\u3001\u4E0B\u62C9\u6846\u548C\u53EF\u7F16\u8F91\u5185\u5BB9\u4E2D\u4E0D\u4F1A\u89E6\u53D1\u666E\u901A\u5FEB\u6377\u952E\u3002"), /* @__PURE__ */ React.createElement("section", { className: "wf-board-panel-section", "aria-labelledby": "wf-board-index-setting-title" }, /* @__PURE__ */ React.createElement("h2", { id: "wf-board-index-setting-title" }, "\u753B\u677F\u8BBE\u7F6E"), /* @__PURE__ */ React.createElement("label", { className: "wf-board-setting-row" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, "\u663E\u793A\u753B\u677F\u7D22\u5F15"), /* @__PURE__ */ React.createElement("small", null, "\u5728\u753B\u677F\u4E0A\u663E\u793A\u53EF\u62D6\u62FD\u7684\u9875\u9762\u7D22\u5F15")), /* @__PURE__ */ React.createElement(
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
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        className: interactive ? "wf-interaction-lock" : "wf-interaction-lock is-locked",
        onClick: onToggle,
        "aria-pressed": !interactive,
        title: interactive ? "\u5F53\u524D\u53EF\u4EA4\u4E92\u9875\u9762\u3002\u70B9\u51FB\u9501\u4F4F\u540E\uFF1A\u62D6\u62FD\u5E73\u79FB\u753B\u5E03\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF1B\u5FEB\u6377\u952E Ctrl+I" : "\u5F53\u524D\u5DF2\u9501\u4F4F\u3002\u70B9\u51FB\u6062\u590D\u53EF\u4EA4\u4E92\uFF1B\u5FEB\u6377\u952E Ctrl+I"
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
    React.useEffect(() => {
      const settings = readBoardSettings(getBoardStorage(), project2.name);
      setCanvasIndexVisible(settings.showCanvasIndex);
      setCanvasIndexPosition(null);
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
          title: "\u753B\u677F\u6A21\u5F0F\uFF08Ctrl+1\uFF09"
        },
        "\u753B\u677F"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: mode === "demo" ? "is-active" : "",
          onClick: () => setMode("demo"),
          title: "\u6F14\u793A\u6A21\u5F0F\uFF08Ctrl+2\uFF09"
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
          title: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08Ctrl+H\uFF09"
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
          title: "\u4FEE\u6539\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt\uFF08Ctrl+M\uFF09",
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
          title: "\u5207\u6362\u6C89\u6D78\u6A21\u5F0F\uFF08Ctrl+F\uFF09",
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
            title: browserFullscreen ? "\u9000\u51FA\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08Ctrl+Shift+F\uFF09" : "\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08Ctrl+Shift+F\uFF09",
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
            title: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08Ctrl+H\uFF09"
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
      reviewEnabled && reviewPanelVisible ? /* @__PURE__ */ React.createElement(
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
          onHoverElement: hoverReviewBreadcrumb,
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

  // starter/framework/lib/ui/content.jsx
  function Heading({ level = 2, className = "", children, ...rest }) {
    const tag = `h${Math.min(6, Math.max(1, level))}`;
    return React.createElement(tag, { className: `wf-heading ${className}`.trim(), ...rest }, children);
  }
  function Text({ as = "p", className = "", children, ...rest }) {
    return React.createElement(as, { className: `wf-text ${className}`.trim(), ...rest }, children);
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

  // starter/src/screens/detail.jsx
  function DetailScreen() {
    return /* @__PURE__ */ React.createElement(Column, { id: "detail-page", className: "detail-page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(Heading, { id: "detail-title", className: "detail-page__title", level: 1 }, "\u8BE6\u60C5\u9875"), /* @__PURE__ */ React.createElement(Text, { className: "detail-page__description" }, "\u8FD9\u662F\u4E00\u4E2A\u6700\u5C0F\u5BFC\u822A\u76EE\u6807\u3002"));
  }

  // starter/src/screens/home.jsx
  function HomeScreen() {
    return /* @__PURE__ */ React.createElement(Column, { id: "home-page", className: "home-page", gap: 16, style: { padding: 24 } }, /* @__PURE__ */ React.createElement(Heading, { id: "home-title", className: "home-page__title", level: 1 }, "\u7EBF\u6846\u9996\u9875"), /* @__PURE__ */ React.createElement(Text, { className: "home-page__description" }, "\u4ECE src/screens \u5F00\u59CB\u7F16\u8F91\u9875\u9762\u3002"), /* @__PURE__ */ React.createElement(Button, { id: "home-detail-action", className: "home-page__detail-action", to: "detail" }, "\u67E5\u770B\u8BE6\u60C5"));
  }

  // starter/src/project.js
  var project = {
    name: "\u591A\u5C4F\u7EBF\u6846\u539F\u578B",
    viewports: {
      mobile: { width: 375, height: 812 },
      desktop: { width: 1280, height: 800 }
    },
    defaultViewport: "mobile",
    screens: [
      {
        id: "home",
        title: "\u9996\u9875",
        description: "\u5165\u53E3\u9875\u9762",
        component: HomeScreen,
        entry: true,
        links: ["detail"],
        edgeCases: []
      },
      {
        id: "detail",
        title: "\u8BE6\u60C5",
        description: "\u8BE6\u60C5\u9875\u9762",
        component: DetailScreen,
        links: [],
        edgeCases: []
      }
    ]
  };

  // starter/src/app.jsx
  validateProject(project);
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(ErrorBoundary, { scope: "board" }, /* @__PURE__ */ React.createElement(PrototypeProvider, { project }, /* @__PURE__ */ React.createElement(Board, { project })))
  );
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZnJhbWV3b3JrL2xpYi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvbmF2aWdhdGlvbi5qcyIsICIuLi9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCIsICIuLi9mcmFtZXdvcmsvbGliL3VpL2Zsb3ctdGFyZ2V0LmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvZXhwYW5kLmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvU2NyZWVuRnJhbWUuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvdmFsaWRhdGlvbi5qcyIsICIuLi9mcmFtZXdvcmsvbGliL2JvYXJkL2NhbnZhcy1pbmRleC5qcyIsICIuLi9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvRGVtb01vZGUuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvZXhwb3J0LmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TWFya2Vycy5qc3giLCAiLi4vZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdMYXVuY2hlci5qc3giLCAiLi4vZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvc2hvcnRjdXRzLmpzIiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmRQYW5lbHMuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vZnJhbWV3b3JrL2xpYi9ib2FyZC9Cb2FyZC5qc3giLCAiLi4vZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcyIsICIuLi9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vZnJhbWV3b3JrL2xpYi91aS9sYXlvdXQuanN4IiwgIi4uL2ZyYW1ld29yay9saWIvdWkvY29udGVudC5qc3giLCAiLi4vZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vc3JjL3NjcmVlbnMvZGV0YWlsLmpzeCIsICIuLi9zcmMvc2NyZWVucy9ob21lLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuLi91aS9mbG93LXRhcmdldC5qcydcbmltcG9ydCB7IGZpbmRSZXZpZXdUYXJnZXQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7XG4gIGNvbGxhcHNlU2NyZWVuQ29udGVudCxcbiAgZXhwYW5kU2NyZWVuQ29udGVudCxcbiAgbWVhc3VyZUNvbnRlbnRCb3gsXG59IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHtcbiAgYmVnaW5Db250ZW50RHJhZ1Njcm9sbCxcbiAgZW5kQ29udGVudERyYWdTY3JvbGwsXG4gIG1vdmVDb250ZW50RHJhZ1Njcm9sbCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuRnJhbWUoe1xuICBzY3JlZW4sXG4gIHZpZXdwb3J0LFxuICBtb2RlLFxuICBpbmRleCA9IDAsXG4gIGZvY3VzZWQgPSBmYWxzZSxcbiAgb25FeHBvcnQsXG4gIGV4cGFuZGVkID0gZmFsc2UsXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBjYW52YXNMb2NrZWQgPSBmYWxzZSxcbiAgc2NhbGUgPSAxLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBjb250ZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZXhwYW5kU25hcHNob3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgaG92ZXJSZXZpZXdFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnU2Nyb2xsaW5nLCBzZXREcmFnU2Nyb2xsaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRCb3gsIHNldEV4cGFuZGVkQm94XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290ID0gY29udGVudFJlZi5jdXJyZW50XG4gICAgaWYgKCFyb290IHx8ICFzY3JlZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKCFleHBhbmRlZCkge1xuICAgICAgc2V0RXhwYW5kZWRCb3gobnVsbClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gZXhwYW5kU2NyZWVuQ29udGVudChyb290KVxuICAgIHNldEV4cGFuZGVkQm94KG1lYXN1cmVDb250ZW50Qm94KHJvb3QpKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSwgW2V4cGFuZGVkLCBzY3JlZW4/LmlkLCB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjYW52YXNMb2NrZWQsIHJldmlld0VuYWJsZWQsIHNjcmVlbj8uaWRdKVxuXG4gIGlmICghc2NyZWVuKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IENvbXBvbmVudCA9IHNjcmVlbi5jb21wb25lbnRcbiAgY29uc3QgZnJhbWVDbGFzcyA9IFtcbiAgICAnd2Ytc2NyZWVuLWNocm9tZScsXG4gICAgbW9kZSA9PT0gJ2NhbnZhcycgJiYgZm9jdXNlZCA/ICdpcy1mb2N1c2VkJyA6ICcnLFxuICAgIGV4cGFuZGVkID8gJ2lzLWV4cGFuZGVkJyA6ICcnLFxuICAgIGB3Zi1zY3JlZW4tJHttb2RlfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKVxuXG4gIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgLy8gXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RTBEXHU2M0E1XHU3QkExXHU1QzRGXHU1MTg1XHU2MkQ2XHU2MkZEXHU2RURBXHU1MkE4XHVGRjBDXHU4QkE5XHU0RThCXHU0RUY2XHU4NDNEXHU1MjMwXHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXG4gICAgaWYgKGNhbnZhc0xvY2tlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIFx1NURGMlx1NUM1NVx1NUYwMFx1NjVFMFx1NTNFRlx1NkVEQVx1NTMzQVx1NTdERlx1RkYwQ1x1NEUwRFx1NjJBMlx1NjMwN1x1OTQ4OFxuICAgIGlmIChleHBhbmRlZCkgcmV0dXJuXG4gICAgY29uc3Qgc3RhdGUgPSBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIHsgbG9ja2VkOiBjYW52YXNMb2NrZWQsIHNjYWxlIH0pXG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gc3RhdGVcbiAgICBzZXREcmFnU2Nyb2xsaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICAgIGlmICh0YXJnZXQgPT09IGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50KSByZXR1cm5cbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICB0YXJnZXQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gdGFyZ2V0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIG5hdmlnYXRlKVxuICB9XG5cbiAgY29uc3Qgb25SZXZpZXdDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgaWYgKCF0YXJnZXQpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIG9uUmV2aWV3U2VsZWN0Py4odGFyZ2V0LCBzY3JlZW4sIGNvbnRlbnRSZWYuY3VycmVudCwge1xuICAgICAgYWRkaXRpdmU6IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY2xlYXJSZXZpZXdIb3ZlciA9ICgpID0+IHtcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICB9XG5cbiAgY29uc3QgY29udGVudFN0eWxlID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3hcbiAgICA/IHsgd2lkdGg6IGV4cGFuZGVkQm94LndpZHRoLCBoZWlnaHQ6IGV4cGFuZGVkQm94LmhlaWdodCwgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9XG4gICAgOiB7IHdpZHRoOiB2aWV3cG9ydC53aWR0aCwgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQgfVxuXG4gIGNvbnN0IGZyYW1lV2lkdGggPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveCA/IGV4cGFuZGVkQm94LndpZHRoIDogdmlld3BvcnQud2lkdGhcblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uXG4gICAgICBjbGFzc05hbWU9e2ZyYW1lQ2xhc3N9XG4gICAgICBkYXRhLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgZGF0YS1leHBhbmRlZD17ZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IGZyYW1lV2lkdGggfX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtbGFiZWxcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS10aXRsZVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1maWxlXCI+e3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtYWN0aW9uc1wiPlxuICAgICAgICAgIHtvblRvZ2dsZUV4cGFuZCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cGFuZC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kKClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2V4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3NycgOiAnXHU1QzU1XHU1RjAwJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyAmJiBvbkV4cG9ydCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cG9ydC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uRXhwb3J0KClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgXHU1QkZDXHU1MUZBIFBOR1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e2NvbnRlbnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1jb250ZW50JHtkcmFnU2Nyb2xsaW5nID8gJyBpcy1kcmFnLXNjcm9sbGluZycgOiAnJ30ke2V4cGFuZGVkID8gJyBpcy1leHBhbmRlZCcgOiAnJ30ke3Jldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXtjb250ZW50U3R5bGV9XG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e29uUG9pbnRlck1vdmV9XG4gICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJMZWF2ZT17Y2xlYXJSZXZpZXdIb3Zlcn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e29uUmV2aWV3Q2xpY2t9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShlbCwgZ2V0U2NhbGUsIHNldFNjYWxlLCBnZXRMb2NrZWQgPSAoKSA9PiBmYWxzZSkge1xuICBpZiAoIWVsKSByZXR1cm4gKCkgPT4ge31cbiAgY29uc3Qgb25XaGVlbCA9IChldmVudCkgPT4ge1xuICAgIGlmICghc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkOiBnZXRMb2NrZWQoKSB9KSkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldFNjYWxlKGNsYW1wU2NhbGUoZ2V0U2NhbGUoKSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSkge1xuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgbG9ja2VkUmVmID0gUmVhY3QudXNlUmVmKGxvY2tlZClcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGxvY2tlZFJlZi5jdXJyZW50ID0gbG9ja2VkXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiZXhwb3J0IGNvbnN0IENBTlZBU19JTkRFWF9NQVJHSU4gPSAxNlxuXG5mdW5jdGlvbiBmaW5pdGUodmFsdWUsIGZhbGxiYWNrID0gMCkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihwb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpKVxuICBjb25zdCBjb250YWluZXJIZWlnaHQgPSBNYXRoLm1heCgwLCBmaW5pdGUoY29udGFpbmVyPy5oZWlnaHQpKVxuICBjb25zdCBpdGVtV2lkdGggPSBNYXRoLm1heCgwLCBmaW5pdGUoaXRlbT8ud2lkdGgpKVxuICBjb25zdCBpdGVtSGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LmhlaWdodCkpXG4gIGNvbnN0IG1heFggPSBNYXRoLm1heChtYXJnaW4sIGNvbnRhaW5lcldpZHRoIC0gaXRlbVdpZHRoIC0gbWFyZ2luKVxuICBjb25zdCBtYXhZID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJIZWlnaHQgLSBpdGVtSGVpZ2h0IC0gbWFyZ2luKVxuICByZXR1cm4ge1xuICAgIHg6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueCwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WCksXG4gICAgeTogTWF0aC5taW4oTWF0aC5tYXgoZmluaXRlKHBvc2l0aW9uPy55LCBtYXJnaW4pLCBtYXJnaW4pLCBtYXhZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24oY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIHJldHVybiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24oe1xuICAgIHg6IChmaW5pdGUoY29udGFpbmVyPy53aWR0aCkgLSBmaW5pdGUoaXRlbT8ud2lkdGgpKSAvIDIsXG4gICAgeTogZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSAtIGZpbml0ZShpdGVtPy5oZWlnaHQpIC0gbWFyZ2luLFxuICB9LCBjb250YWluZXIsIGl0ZW0sIG1hcmdpbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKGdldEVsZW1lbnRzLCBvblJlYWR5LCBzY2hlZHVsZXIpIHtcbiAgbGV0IGFjdGl2ZSA9IHRydWVcbiAgbGV0IGZyYW1lID0gbnVsbFxuXG4gIGNvbnN0IGF0dGVtcHQgPSAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2V0RWxlbWVudHMoKVxuICAgIGlmICghZWxlbWVudHM/LmNvbnRhaW5lciB8fCAhZWxlbWVudHM/Lml0ZW0pIHtcbiAgICAgIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmcmFtZSA9IG51bGxcbiAgICBvblJlYWR5KGVsZW1lbnRzKVxuICB9XG5cbiAgZnJhbWUgPSBzY2hlZHVsZXIucmVxdWVzdChhdHRlbXB0KVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgaWYgKGZyYW1lICE9IG51bGwpIHNjaGVkdWxlci5jYW5jZWwoZnJhbWUpXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZm9jdXNDYW52YXNTY3JlZW4sIHJlc2V0Q2FudmFzVmlld3BvcnQsIHBhbkZyb21EcmFnU25hcHNob3QgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHtcbiAgY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uLFxuICBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbixcbiAgd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMsXG59IGZyb20gJy4vY2FudmFzLWluZGV4LmpzJ1xuXG5jb25zdCBJTkRFWF9EUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gZWxlbWVudFNpemUoZWxlbWVudCkge1xuICByZXR1cm4geyB3aWR0aDogZWxlbWVudD8ub2Zmc2V0V2lkdGggfHwgMCwgaGVpZ2h0OiBlbGVtZW50Py5vZmZzZXRIZWlnaHQgfHwgMCB9XG59XG5cbmZ1bmN0aW9uIENhbnZhc0luZGV4KHtcbiAgY2FudmFzUmVmLFxuICBwcm9qZWN0LFxuICBjdXJyZW50U2NyZWVuSWQsXG4gIGRlbW9BdmFpbGFibGUsXG4gIHBvc2l0aW9uLFxuICBvblBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlLFxuICBuYXZpZ2F0ZSxcbiAgZW50ZXJEZW1vLFxufSkge1xuICBjb25zdCBpbmRleFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgY29uc3RyYWluID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHRQb3NpdGlvbiwgdXNlRGVmYXVsdCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICBjb25zdCBpbmRleCA9IGluZGV4UmVmLmN1cnJlbnRcbiAgICBpZiAoIWNhbnZhcyB8fCAhaW5kZXgpIHJldHVybiBuZXh0UG9zaXRpb25cbiAgICBjb25zdCBjb250YWluZXIgPSB7IHdpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsIGhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCB9XG4gICAgY29uc3QgaXRlbSA9IGVsZW1lbnRTaXplKGluZGV4KVxuICAgIHJldHVybiB1c2VEZWZhdWx0XG4gICAgICA/IGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSlcbiAgICAgIDogY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKG5leHRQb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtKVxuICB9LCBbY2FudmFzUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4ge31cbiAgICBjb25zdCBzdG9wV2FpdGluZyA9IHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKFxuICAgICAgKCkgPT4gKHsgY29udGFpbmVyOiBjYW52YXNSZWYuY3VycmVudCwgaXRlbTogaW5kZXhSZWYuY3VycmVudCB9KSxcbiAgICAgICh7IGNvbnRhaW5lcjogY2FudmFzLCBpdGVtOiBpbmRleCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IG9uUG9zaXRpb25DaGFuZ2UoKGN1cnJlbnQpID0+IGNvbnN0cmFpbihjdXJyZW50LCAhY3VycmVudCkpXG4gICAgICAgIHVwZGF0ZSgpXG5cbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHVwZGF0ZSlcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGNhbnZhcylcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGluZGV4KVxuICAgICAgICAgIGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcXVlc3Q6IChjYWxsYmFjaykgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayksXG4gICAgICAgIGNhbmNlbDogKGZyYW1lKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpLFxuICAgICAgfSxcbiAgICApXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcFdhaXRpbmcoKVxuICAgICAgZGlzY29ubmVjdFJlc2l6ZSgpXG4gICAgfVxuICB9LCBbY2FudmFzUmVmLCBjb25zdHJhaW4sIG9uUG9zaXRpb25DaGFuZ2VdKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtpbmRleFJlZn1cbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtY2FudmFzLWluZGV4IGlzLWRyYWdnaW5nJyA6ICd3Zi1jYW52YXMtaW5kZXgnfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgdmlzaWJpbGl0eTogJ2hpZGRlbicgfX1cbiAgICA+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtaGFuZGxlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU2MkQ2XHU1MkE4XHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb24gfHwgY29uc3RyYWluKG51bGwsIHRydWUpXG4gICAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IElOREVYX0RSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgICAgb25Qb3NpdGlvbkNoYW5nZShjb25zdHJhaW4oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtZ3JpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxpIC8+PGkgLz48aSAvPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4+XHU3RDIyXHU1RjE1PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1saXN0XCI+XG4gICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLWluZGV4LWRvdCBpcy1hY3RpdmUnIDogJ3dmLWNhbnZhcy1pbmRleC1kb3QnfVxuICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3Bhbj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLWZpbGVcIj5zcmMvc2NyZWVucy97c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtY2xvc2VcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgdGl0bGU9XCJcdTUxNzNcdTk1RURcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIG9uQ2xvc2UoKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48cGF0aCBkPVwibTQgNCA4IDhNMTIgNGwtOCA4XCIgLz48L3N2Zz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeHBvcnRXaXRoRmVlZGJhY2sodGFzaywgc2V0RXJyb3IpIHtcbiAgc2V0RXJyb3IobnVsbClcbiAgdHJ5IHtcbiAgICBhd2FpdCB0YXNrKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgc2V0RXJyb3IoYFx1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYxQSR7bWVzc2FnZX1gKVxuICB9XG59XG5cbi8qKiBmaWxlOi8vIFx1NEUwRFx1NjYyRiBzZWN1cmUgY29udGV4dFx1RkYwQ2NsaXBib2FyZCBBUEkgXHU1RTM4XHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDZXhlY0NvbW1hbmQgXHU1MTVDXHU1RTk1ICovXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgfVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNNb2RlKHtcbiAgcHJvamVjdCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNlbGVjdGVkSWRzLFxuICBzZXRTZWxlY3RlZElkcyxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBvbkV4cG9ydElkcyxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbiAgb25DYW52YXNDbGljayxcbiAgY2FudmFzSW5kZXhWaXNpYmxlID0gdHJ1ZSxcbiAgY2FudmFzSW5kZXhQb3NpdGlvbixcbiAgb25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlQ2FudmFzSW5kZXgsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCBuYXZpZ2F0ZSwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBlbnRlckRlbW86IGVudGVyRGVtb01vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzaWRlYmFyQ29sbGFwc2VkLCBzZXRTaWRlYmFyQ29sbGFwc2VkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkS2V5LCBzZXRDb3BpZWRLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2NvcHlUb2FzdCwgc2V0Q29weVRvYXN0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY2FudmFzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNvcGllZFRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBkcmFnZ2luZ1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBzY2FsZVJlZi5jdXJyZW50ID0gc2NhbGVcbiAgZHJhZ2dpbmdSZWYuY3VycmVudCA9IGRyYWdnaW5nXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBjdXJyZW50LnNjYWxlIH0pKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmdSZWYuY3VycmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgYXBwbHkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgICBpZiAoIWNhbnZhcyB8fCAhc3RhZ2UpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc2NyZWVuRWwgPSBzdGFnZS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYW52YXMtc2NyZWVuLWlkPVwiJHtjdXJyZW50U2NyZWVuSWR9XCJdYClcbiAgICAgIGlmICghc2NyZWVuRWwpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3QgY3VycmVudFNjYWxlID0gc2NhbGVSZWYuY3VycmVudFxuICAgICAgaWYgKGN1cnJlbnRTY2FsZSA8PSAwKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHN0YWdlQm94ID0gc3RhZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNjcmVlbkJveCA9IHNjcmVlbkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBuZXh0ID0gZm9jdXNDYW52YXNTY3JlZW4oe1xuICAgICAgICBjb250YWluZXJXaWR0aDogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQsXG4gICAgICAgIHNjcmVlbkxlZnQ6IChzY3JlZW5Cb3gubGVmdCAtIHN0YWdlQm94LmxlZnQpIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5Ub3A6IChzY3JlZW5Cb3gudG9wIC0gc3RhZ2VCb3gudG9wKSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbkJveC53aWR0aCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW5Cb3guaGVpZ2h0IC8gY3VycmVudFNjYWxlLFxuICAgICAgICBjdXJyZW50U2NhbGUsXG4gICAgICB9KVxuICAgICAgaWYgKCFuZXh0KSByZXR1cm4gZmFsc2VcbiAgICAgIHNldFNjYWxlKG5leHQuc2NhbGUpXG4gICAgICBzZXRWaWV3KG5leHQpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChhcHBseSgpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgZnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGFwcGx5KClcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpXG4gIH0sIFtjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0S2V5LCBzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICB1c2VXaGVlbFpvb20oY2FudmFzUmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBlbnRlckRlbW8gPSAoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIWRlbW9BdmFpbGFibGUgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBlbnRlckRlbW9Nb2RlKHNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY29weU1ldGEgPSAoa2V5LCB0ZXh0LCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvcHlUZXh0KHRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkS2V5KGtleSlcbiAgICAgIHNldENvcHlUb2FzdCgnXHU1REYyXHU1OTBEXHU1MjM2JylcbiAgICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3BpZWRUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWRLZXkobnVsbClcbiAgICAgICAgc2V0Q29weVRvYXN0KG51bGwpXG4gICAgICB9LCAxMjAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVTZWxlY3RlZCA9IChpZCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlQWxsID0gKCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpXG4gICAgICByZXR1cm4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tc2lkZWJhciR7c2lkZWJhckNvbGxhcHNlZCA/ICcgaXMtY29sbGFwc2VkJyA6ICcnfWB9IGFyaWEtaGlkZGVuPXtzaWRlYmFyQ29sbGFwc2VkfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWhlYWRlclwiPlxuICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoICYmIHByb2plY3Quc2NyZWVucy5sZW5ndGggPiAwfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dG9nZ2xlQWxsfVxuICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIFx1NTE2OFx1OTAwOVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZVwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaWRlYmFyQ29sbGFwc2VkKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGUtaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIm0xNiAxNS0zLTMgMy0zXCIgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1saXN0XCI+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICB0b2dnbGVTZWxlY3RlZChzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTkwMDlcdTYyRTkgJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcHNcIiBhcmlhLWxhYmVsPVwiXHU2NENEXHU0RjVDXHU2M0QwXHU3OTNBXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCIC8gXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1N0E3QVx1NjgzQ1x1NjJENlx1NjJGRCAvIEN0cmwrXHU2RURBXHU4RjZFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXNpZGU+XG4gICAgICB7c2lkZWJhckNvbGxhcHNlZCA/IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXNpZGViYXItZXhwYW5kXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU1QzU1XHU1RjAwXHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZChmYWxzZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTQgOSAzIDMtMyAzXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxtYWluXG4gICAgICAgIHJlZj17Y2FudmFzUmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1jYW52YXMke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gXG4gICAgICAgICAgICBjb25zdCBmaWxlVGV4dCA9IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgY29uc3QgdGl0bGVLZXkgPSBgJHtzY3JlZW4uaWR9OnRpdGxlYFxuICAgICAgICAgICAgY29uc3QgZmlsZUtleSA9IGAke3NjcmVlbi5pZH06ZmlsZWBcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1zY3JlZW4gaXMtZm9jdXNlZCcgOiAnd2YtY2FudmFzLXNjcmVlbid9XG4gICAgICAgICAgICAgICAgZGF0YS1jYW52YXMtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tbWV0YS10aXRsZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKHRpdGxlS2V5LCB0aXRsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RpdGxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3NjcmVlbi5kZXNjcmlwdGlvbiA/IDxkaXY+e3NjcmVlbi5kZXNjcmlwdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1tZXRhLWxpbmUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEoZmlsZUtleSwgZmlsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5cdTY1ODdcdTRFRjZcdUZGMUE8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgICAgICAgIG1vZGU9XCJjYW52YXNcIlxuICAgICAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgZm9jdXNlZD17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgICAgICBleHBhbmRlZD17ZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17KCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uRXhwb3J0PXsoKSA9PiBvbkV4cG9ydElkcyhbc2NyZWVuLmlkXSl9XG4gICAgICAgICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjYW52YXNJbmRleFZpc2libGUgPyAoXG4gICAgICAgICAgPENhbnZhc0luZGV4XG4gICAgICAgICAgICBjYW52YXNSZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgICBjdXJyZW50U2NyZWVuSWQ9e2N1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgICBwb3NpdGlvbj17Y2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2U9e29uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZX1cbiAgICAgICAgICAgIG9uQ2xvc2U9e29uQ2xvc2VDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG5hdmlnYXRlPXtuYXZpZ2F0ZX1cbiAgICAgICAgICAgIGVudGVyRGVtbz17ZW50ZXJEZW1vfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9tYWluPlxuICAgICAge2NvcHlUb2FzdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b2FzdFwiIHJvbGU9XCJzdGF0dXNcIj57Y29weVRvYXN0fTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHtcbiAgZml0RGVtb1NjYWxlLFxuICBpc0RlbW9CbGFua0V4aXRUYXJnZXQsXG4gIHBhbkZyb21EcmFnU25hcHNob3QsXG4gIHJlc2V0Q2FudmFzVmlld3BvcnQsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcblxuY29uc3QgQkxBTktfRVhJVF9ISU5UID0gJ1x1NTNDQ1x1NTFGQlx1N0E3QVx1NzY3RFx1NTkwNFx1OTAwMFx1NTFGQVx1NkYxNFx1NzkzQSdcblxuZnVuY3Rpb24gcmVhZENvbnRlbnRCb3goZWwpIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgcGFkWCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nUmlnaHQpXG4gIGNvbnN0IHBhZFkgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKVxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBNYXRoLm1heCgwLCBlbC5jbGllbnRXaWR0aCAtIHBhZFgpLFxuICAgIGhlaWdodDogTWF0aC5tYXgoMCwgZWwuY2xpZW50SGVpZ2h0IC0gcGFkWSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbW9Nb2RlKHtcbiAgcHJvamVjdCxcbiAgaG90c3BvdHNWaXNpYmxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgdmlld1Jlc2V0S2V5LFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIHNldE1vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHNjcmVlbkluZGV4ID0gcHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzY3JlZW4gPSBzY3JlZW5JbmRleCA+PSAwID8gcHJvamVjdC5zY3JlZW5zW3NjcmVlbkluZGV4XSA6IG51bGxcbiAgY29uc3QgY3VycmVudEV4cGFuZGVkID0gISEoc2NyZWVuICYmIGV4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHZpZXdwb3J0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgZXhpdE9uQmxhbmtEb3VibGVDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgIHNldE1vZGUoJ2NhbnZhcycpXG4gIH1cblxuICAvLyB0aXRsZSBcdTYzMDJcdTU3MjhcdTg5QzZcdTUzRTNcdTRFMEFcdTRGMUFcdTg0M0RcdTUyMzBcdTVDNEZcdTUxODVcdTVCNTBcdTgyODJcdTcwQjlcdUZGMENcdTVFNzJcdTYyNzBcdTY0Q0RcdTRGNUNcdUZGMUJcdTUzRUFcdTU3MjhcdTdBN0FcdTc2N0RcdTU5MDRcdTYwQUNcdTUwNUNcdTY1RjZcdTYzMDJcdTRFMEFcdTMwMDJcbiAgY29uc3Qgc3luY0JsYW5rRXhpdEhpbnQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBlbCA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBpZiAoIWVsKSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkgPyBCTEFOS19FWElUX0hJTlQgOiAnJ1xuICAgIGlmICgoZWwuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8ICcnKSA9PT0gbmV4dCkgcmV0dXJuXG4gICAgaWYgKG5leHQpIGVsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBuZXh0KVxuICAgIGVsc2UgZWwucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBjbGVhckJsYW5rRXhpdEhpbnQgPSAoKSA9PiB7XG4gICAgdmlld3BvcnRSZWYuY3VycmVudD8ucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBhcHBseUZpdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgIXN0YWdlKSByZXR1cm5cbiAgICBjb25zdCBib3ggPSByZWFkQ29udGVudEJveChjb250YWluZXIpXG4gICAgY29uc3QgbmV4dCA9IGZpdERlbW9TY2FsZShib3gud2lkdGgsIGJveC5oZWlnaHQsIHN0YWdlLm9mZnNldFdpZHRoLCBzdGFnZS5vZmZzZXRIZWlnaHQpXG4gICAgc2V0U2NhbGUobmV4dClcbiAgICBzZXRWaWV3KHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogbmV4dCB9KVxuICB9LCBbc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgdHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcHBseUZpdCgpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IGFwcGx5Rml0KCkpXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXIpXG4gICAgaWYgKHN0YWdlKSBvYnNlcnZlci5vYnNlcnZlKHN0YWdlKVxuICAgIGFwcGx5Rml0KClcbiAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gIH0sIFthcHBseUZpdCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBjdXJyZW50U2NyZWVuSWQsIHZpZXdSZXNldEtleSwgY3VycmVudEV4cGFuZGVkXSlcblxuICB1c2VXaGVlbFpvb20odmlld3BvcnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1kZW1vIGlzLXNob3dpbmctaG90c3BvdHMnIDogJ3dmLWRlbW8nfT5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXt2aWV3cG9ydFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtZGVtby12aWV3cG9ydCR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgICBvbk1vdXNlTW92ZT17c3luY0JsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17Y2xlYXJCbGFua0V4aXRIaW50fVxuICAgICAgICBvbkNsaWNrPXtvbkNhbnZhc0NsaWNrfVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXtleGl0T25CbGFua0RvdWJsZUNsaWNrfVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1kZW1vLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICBtb2RlPVwiZGVtb1wiXG4gICAgICAgICAgICBpbmRleD17c2NyZWVuSW5kZXh9XG4gICAgICAgICAgICBleHBhbmRlZD17Y3VycmVudEV4cGFuZGVkfVxuICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3NjcmVlbiAmJiBvblRvZ2dsZUV4cGFuZCA/ICgpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtZGVtby1oaW50XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU1MTg1XHU2MzA5XHU5NEFFIC8gXHU5NEZFXHU2M0E1XHU4REYzXHU4RjZDXHVGRjFCXHU1M0VGXHU1NzI4XHU1REU1XHU1MTc3XHU2ODBGXHU1RjAwXHU1MTczXHU3MEVEXHU1MzNBXHU5QUQ4XHU0RUFFXHVGRjFCXHU2ODA3XHU5ODk4XHU2ODBGXHU1M0VGXHU0RTM0XHU2NUY2XHU1QzU1XHU1RjAwXHU3NzBCXHU1MTY4XHU4QzhDPC9wPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgZXhwYW5kU2NyZWVuQ29udGVudCwgbWVhc3VyZUNvbnRlbnRCb3ggfSBmcm9tICcuL2V4cGFuZC5qcydcblxubGV0IGV4cG9ydExpYnJhcmllc1Byb21pc2VcblxuY29uc3QgbGlicmFyaWVzID0gW1xuICB7IGZpbGU6ICdodG1sMmNhbnZhcy5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5odG1sMmNhbnZhcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdqc3ppcC5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5KU1ppcCA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdGaWxlU2F2ZXIubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuc2F2ZUFzID09PSAnZnVuY3Rpb24nIH0sXG5dXG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQoZmlsZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBleGlzdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXdpcmVmcmFtZS1leHBvcnQ9XCIke2ZpbGV9XCJdYClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID09PSAnbG9hZGVkJykge1xuICAgICAgICBleGlzdGluZy5yZW1vdmUoKVxuICAgICAgICBleGlzdGluZyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVzb2x2ZSwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlamVjdCwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdmVuZG9yQmFzZSA9IHdpbmRvdy5XSVJFRlJBTUVfVkVORE9SX0JBU0VcbiAgICBpZiAoIXZlbmRvckJhc2UpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1x1NjcyQVx1OTE0RFx1N0Y2RVx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5M1x1OERFRlx1NUY4NCBXSVJFRlJBTUVfVkVORE9SX0JBU0UnKSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgIHNjcmlwdC5zcmMgPSBuZXcgVVJMKGZpbGUsIHZlbmRvckJhc2UpLmhyZWZcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnQgPSBmaWxlXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGluZydcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGVkJ1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LnJlbW92ZSgpXG4gICAgICByZWplY3QobmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTUyQTBcdThGN0RcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTMgJHtmaWxlfWApKVxuICAgIH1cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFeHBvcnRMaWJyYXJpZXMoKSB7XG4gIGlmICghZXhwb3J0TGlicmFyaWVzUHJvbWlzZSkge1xuICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSBsaWJyYXJpZXMucmVkdWNlKFxuICAgICAgKGNoYWluLCBsaWJyYXJ5KSA9PiBjaGFpbi50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIGF3YWl0IGxvYWRTY3JpcHQobGlicmFyeS5maWxlKVxuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgdGhyb3cgbmV3IEVycm9yKGBcdTVCRkNcdTUxRkFcdTVFOTNcdTUyMURcdTU5Q0JcdTUzMTZcdTU5MzFcdThEMjU6ICR7bGlicmFyeS5maWxlfWApXG4gICAgICB9KSxcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLFxuICAgICkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gdW5kZWZpbmVkXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGV4cG9ydExpYnJhcmllc1Byb21pc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVTY3JlZW4oc2NyZWVuRWxlbWVudCwgdmlld3BvcnQsIHsgZXhwYW5kZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKCFzY3JlZW5FbGVtZW50KSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjI3RVx1NEUwRFx1NTIzMFx1ODk4MVx1NUJGQ1x1NTFGQVx1NzY4NCBzY3JlZW4gXHU1MTQzXHU3RDIwJylcbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG5cbiAgY29uc3Qgc2FuZGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNhbmRib3guY2xhc3NOYW1lID0gJ3dmLWV4cG9ydC1zYW5kYm94J1xuICBjb25zdCBjbG9uZSA9IHNjcmVlbkVsZW1lbnQuY2xvbmVOb2RlKHRydWUpXG4gIHNhbmRib3guYXBwZW5kQ2hpbGQoY2xvbmUpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2FuZGJveClcblxuICBsZXQgd2lkdGggPSB2aWV3cG9ydC53aWR0aFxuICBsZXQgaGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0XG4gIHRyeSB7XG4gICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICBleHBhbmRTY3JlZW5Db250ZW50KGNsb25lKVxuICAgICAgY29uc3QgYm94ID0gbWVhc3VyZUNvbnRlbnRCb3goY2xvbmUpXG4gICAgICB3aWR0aCA9IGJveC53aWR0aFxuICAgICAgaGVpZ2h0ID0gYm94LmhlaWdodFxuICAgIH1cbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgICBzYW5kYm94LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgc2FuZGJveC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG5cbiAgICBjb25zdCBjYW52YXMgPSBhd2FpdCB3aW5kb3cuaHRtbDJjYW52YXMoY2xvbmUsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBzY2FsZTogMixcbiAgICAgIHVzZUNPUlM6IGZhbHNlLFxuICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgKGJsb2IpID0+IGJsb2IgPyByZXNvbHZlKGJsb2IpIDogcmVqZWN0KG5ldyBFcnJvcignUE5HIFx1N0YxNlx1NzgwMVx1NTkzMVx1OEQyNScpKSxcbiAgICAgICAgJ2ltYWdlL3BuZycsXG4gICAgICApXG4gICAgfSlcbiAgfSBmaW5hbGx5IHtcbiAgICBzYW5kYm94LnJlbW92ZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbnMpIHx8IHNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTgxRjNcdTVDMTFcdTkwMDlcdTYyRTlcdTRFMDBcdTRFMkEgc2NyZWVuJylcbiAgfVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcbiAgY29uc3QgY2FwdHVyZWQgPSBbXVxuICBmb3IgKGNvbnN0IHNjcmVlbiBvZiBzY3JlZW5zKSB7XG4gICAgY2FwdHVyZWQucHVzaCh7XG4gICAgICBuYW1lOiBgJHtzbHVnKHNjcmVlbi5pZCl9LnBuZ2AsXG4gICAgICBibG9iOiBhd2FpdCBjYXB0dXJlU2NyZWVuKHNjcmVlbi5lbGVtZW50LCBzY3JlZW4udmlld3BvcnQsIHtcbiAgICAgICAgZXhwYW5kZWQ6ICEhc2NyZWVuLmV4cGFuZGVkLFxuICAgICAgfSksXG4gICAgfSlcbiAgfVxuXG4gIGlmIChjYXB0dXJlZC5sZW5ndGggPT09IDEpIHtcbiAgICB3aW5kb3cuc2F2ZUFzKGNhcHR1cmVkWzBdLmJsb2IsIGNhcHR1cmVkWzBdLm5hbWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB6aXAgPSBuZXcgd2luZG93LkpTWmlwKClcbiAgY2FwdHVyZWQuZm9yRWFjaCgoaXRlbSkgPT4gemlwLmZpbGUoaXRlbS5uYW1lLCBpdGVtLmJsb2IpKVxuICBjb25zdCBibG9iID0gYXdhaXQgemlwLmdlbmVyYXRlQXN5bmMoeyB0eXBlOiAnYmxvYicgfSlcbiAgd2luZG93LnNhdmVBcyhibG9iLCBgJHtzbHVnKHNjcmVlbnNbMF0ucHJvamVjdE5hbWUpfS56aXBgKVxufVxuIiwgImltcG9ydCB7IGJ1aWxkUmV2aWV3UHJvbXB0LCByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3UGFuZWwoe1xuICBwcm9qZWN0LFxuICBzZWxlY3Rpb25zLFxuICBtdWx0aVNlbGVjdCxcbiAgaXRlbXMsXG4gIG9uVG9nZ2xlTXVsdGlTZWxlY3QsXG4gIG9uU2VsZWN0RWxlbWVudCxcbiAgb25Ib3ZlckVsZW1lbnQsXG4gIG9uUmVtb3ZlU2VsZWN0aW9uLFxuICBvbkNsZWFyU2VsZWN0aW9uLFxuICBvbkFkZEl0ZW0sXG4gIG9uUmVtb3ZlSXRlbSxcbiAgb25DbG9zZSxcbn0pIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxlY3Rpb25zW3NlbGVjdGlvbnMubGVuZ3RoIC0gMV0gfHwgbnVsbFxuICBjb25zdCBnZW5lcmF0ZWRQcm9tcHQgPSBSZWFjdC51c2VNZW1vKCgpID0+IGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSwgW3Byb2plY3QsIGl0ZW1zXSlcbiAgY29uc3QgW3R5cGUsIHNldFR5cGVdID0gUmVhY3QudXNlU3RhdGUoJ2NvbW1lbnQnKVxuICBjb25zdCBbaW5zdHJ1Y3Rpb24sIHNldEluc3RydWN0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuICBjb25zdCBbcHJvbXB0LCBzZXRQcm9tcHRdID0gUmVhY3QudXNlU3RhdGUoZ2VuZXJhdGVkUHJvbXB0KVxuICBjb25zdCBbcHJvbXB0RGlydHksIHNldFByb21wdERpcnR5XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGNvcHlUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFwcm9tcHREaXJ0eSkgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgfSwgW2dlbmVyYXRlZFByb21wdCwgcHJvbXB0RGlydHldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICBjb25zdCBhZGRJdGVtID0gKCkgPT4ge1xuICAgIGlmIChzZWxlY3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGluc3RydWN0aW9uLnRyaW0oKVxuICAgIGlmICghbm9ybWFsaXplZCAmJiB0eXBlICE9PSAncmVtb3ZlJykgcmV0dXJuXG4gICAgb25BZGRJdGVtKHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXRzOiBzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uKSA9PiAoe1xuICAgICAgICBzY3JlZW5JZDogc2VsZWN0aW9uLnNjcmVlbklkLFxuICAgICAgICBzY3JlZW5UaXRsZTogc2VsZWN0aW9uLnNjcmVlblRpdGxlLFxuICAgICAgICBzb3VyY2VIaW50OiBzZWxlY3Rpb24uc291cmNlSGludCxcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdGlvbi5zZWxlY3RvcixcbiAgICAgICAgY3VycmVudFRleHQ6IHNlbGVjdGlvbi5jdXJyZW50VGV4dCxcbiAgICAgIH0pKSxcbiAgICAgIGluc3RydWN0aW9uOiBub3JtYWxpemVkLFxuICAgIH0pXG4gICAgc2V0SW5zdHJ1Y3Rpb24oJycpXG4gIH1cblxuICBjb25zdCByZWdlbmVyYXRlID0gKCkgPT4ge1xuICAgIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gICAgc2V0UHJvbXB0RGlydHkoZmFsc2UpXG4gIH1cblxuICBjb25zdCBjb3B5UHJvbXB0ID0gKCkgPT4ge1xuICAgIGNvcHlUZXh0KHByb21wdCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgICAgIGNvcHlUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTQwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgaW5zdHJ1Y3Rpb25MYWJlbCA9IHR5cGUgPT09ICd0ZXh0J1xuICAgID8gJ1x1NjVCMFx1NjU4N1x1NUI1NydcbiAgICA6IHR5cGUgPT09ICdvcmRlcidcbiAgICAgID8gJ1x1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0MidcbiAgICAgIDogdHlwZSA9PT0gJ3JlbW92ZSdcbiAgICAgICAgPyAnXHU1MjIwXHU5NjY0XHU4QkY0XHU2NjBFXHVGRjA4XHU1M0VGXHU5MDA5XHVGRjA5J1xuICAgICAgICA6ICdcdTdFRDkgQUkgXHU3Njg0XHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJ1xuXG4gIHJldHVybiAoXG4gICAgPGFzaWRlIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbFwiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEJcIj5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtdGl0bGVcIj5cdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEI8L3N0cm9uZz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtY291bnRcIj57aXRlbXMubGVuZ3RofSBcdTY3NjFcdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1ib2R5XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhlYWRpbmdcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU1REYyXHU5MDA5XHU4MjgyXHU3MEI5ICh7c2VsZWN0aW9ucy5sZW5ndGh9KTwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tYWN0aW9uc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttdWx0aVNlbGVjdCA/ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0IGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCd9XG4gICAgICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXttdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblRvZ2dsZU11bHRpU2VsZWN0fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1OTFBXHU5MDA5IHttdWx0aVNlbGVjdCA/ICdPTicgOiAnT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xlYXItc2VsZWN0aW9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e29uQ2xlYXJTZWxlY3Rpb259Plx1NkUwNVx1N0E3QTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGludFwiPlx1NTkxQVx1OTAwOVx1NUYwMFx1NTQyRlx1NTQwRVx1NzBCOVx1NTFGQlx1ODI4Mlx1NzBCOVx1NTNFRlx1NTJBMFx1NTE2NVx1NjIxNlx1NzlGQlx1OTY2NFx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0RiBTaGlmdCAvIENvbW1hbmQgLyBDdHJsIFx1NzBCOVx1NTFGQlx1MzAwMjwvcD5cbiAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb25zXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9e3NlbGVjdGlvbiA9PT0gc2VsZWN0ZWQgPyAnd2YtcmV2aWV3LXNlbGVjdGlvbiBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1zZWxlY3Rpb24nfSBrZXk9e2Ake3NlbGVjdGlvbi5zY3JlZW5JZH06JHtzZWxlY3Rpb24uc2VsZWN0b3J9YH0+XG4gICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXNlbGVjdG9yXCI+e2luZGV4ICsgMX0uIHtzZWxlY3Rpb24uc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXJlbW92ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZVNlbGVjdGlvbihzZWxlY3Rpb24uZWxlbWVudCl9Plx1NzlGQlx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zY3JlZW4tbmFtZVwiPntzZWxlY3RlZC5zY3JlZW5UaXRsZX0gXHUwMEI3IHtzZWxlY3RlZC5zY3JlZW5JZH08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYnNcIiBhcmlhLWxhYmVsPVwiXHU4MjgyXHU3MEI5XHU1QzQyXHU3RUE3XCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkLmFuY2VzdG9ycy5tYXAoKGFuY2VzdG9yLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YW5jZXN0b3Iuc2VsZWN0b3J9PlxuICAgICAgICAgICAgICAgICAgICB7aW5kZXggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iLXNlcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYlwiXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2FuY2VzdG9yLnNlbGVjdG9yfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IG9uSG92ZXJFbGVtZW50Py4obnVsbCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZWxlY3RFbGVtZW50KGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2FuY2VzdG9yLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0b3JcIj57c2VsZWN0ZWQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICB7c2VsZWN0ZWQuY3VycmVudFRleHQgPyAoXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWN1cnJlbnQtdGV4dFwiPlx1NUY1M1x1NTI0RFx1RkYxQXtzZWxlY3RlZC5jdXJyZW50VGV4dH08L3A+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+XHU0RkVFXHU2NTM5XHU3QzdCXHU1NzhCPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtc2VsZWN0XCIgdmFsdWU9e3R5cGV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFR5cGUoZXZlbnQudGFyZ2V0LnZhbHVlKX0+XG4gICAgICAgICAgICAgICAgICB7T2JqZWN0LmVudHJpZXMoUkVWSUVXX1RZUEVfTEFCRUxTKS5tYXAoKFt2YWx1ZSwgbGFiZWxdKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtb3B0aW9uXCIgdmFsdWU9e3ZhbHVlfSBrZXk9e3ZhbHVlfT57bGFiZWx9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPntpbnN0cnVjdGlvbkxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1pbnN0cnVjdGlvblwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17aW5zdHJ1Y3Rpb259XG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dHlwZSA9PT0gJ29yZGVyJyA/ICdcdTRGOEJcdTU5ODJcdUZGMUFcdTc5RkJcdTUyQThcdTUyMzBcdThCQTJcdTUzNTVcdTY0NThcdTg5ODFcdTRFNEJcdTU0MEUnIDogJ1x1NjNDRlx1OEZGMFx1NUUwQ1x1NjcxQiBBSSBcdTU5ODJcdTRGNTVcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0SW5zdHJ1Y3Rpb24oZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWFkZFwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFpbnN0cnVjdGlvbi50cmltKCkgJiYgdHlwZSAhPT0gJ3JlbW92ZSd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17YWRkSXRlbX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTJBMFx1NTE2NVx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NVx1RkYwOHtzZWxlY3Rpb25zLmxlbmd0aH0gXHU0RTJBXHU4MjgyXHU3MEI5XHVGRjA5XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NEUyRFx1NzY4NFx1ODI4Mlx1NzBCOVx1NUYwMFx1NTlDQlx1OEJDNFx1OEJCQVx1MzAwMlx1NzBCOVx1NTFGQlx1OTc2Mlx1NTMwNVx1NUM1MVx1NTNFRlx1NTIwN1x1NjM2Mlx1NTIzMFx1NzIzNlx1N0VBN1x1N0VDNFx1NEVGNlx1MzAwMjwvcD5cbiAgICAgICAgICApfVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NTwvaDI+XG4gICAgICAgICAge2l0ZW1zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1zXCI+XG4gICAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtXCIga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXRpdGxlXCI+e2luZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbaXRlbS50eXBlXX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tc2VsZWN0b3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhpdGVtKS5tYXAoKHRhcmdldCkgPT4gdGFyZ2V0LnNlbGVjdG9yKS5qb2luKCdcdTMwMDEnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1pbnN0cnVjdGlvblwiPntpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1kZWxldGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVJdGVtKGl0ZW0uaWQpfT5cdTUyMjBcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1OEZEOFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMjwvcD59XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbiB3Zi1yZXZpZXctcHJvbXB0LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NjcwMFx1N0VDOCBQcm9tcHQ8L2gyPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcmVnZW5lcmF0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtyZWdlbmVyYXRlfT5cdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7cHJvbXB0RGlydHkgPyA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFudWFsXCI+UHJvbXB0IFx1NURGMlx1NjI0Qlx1NTJBOFx1NEZFRVx1NjUzOVx1RkYxQlx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMFx1NEYxQVx1ODk4Nlx1NzZENlx1NjI0Qlx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMjwvcD4gOiBudWxsfVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXByb21wdFwiXG4gICAgICAgICAgICB2YWx1ZT17cHJvbXB0fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRQcm9tcHQoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgICBzZXRQcm9tcHREaXJ0eSh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jb3B5XCIgb25DbGljaz17Y29weVByb21wdH0+XG4gICAgICAgICAgICB7Y29waWVkID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU1OTBEXHU1MjM2IFByb21wdCd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvYXNpZGU+XG4gIClcbn1cbiIsICJpbXBvcnQgeyByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gc2FtZVBvc2l0aW9ucyhsZWZ0LCByaWdodCkge1xuICBpZiAobGVmdC5sZW5ndGggIT09IHJpZ2h0Lmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBsZWZ0LmV2ZXJ5KChpdGVtLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG90aGVyID0gcmlnaHRbaW5kZXhdXG4gICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBvdGhlci5rZXlcbiAgICAgICYmIGl0ZW0uaXRlbSA9PT0gb3RoZXIuaXRlbVxuICAgICAgJiYgaXRlbS5pdGVtSW5kZXggPT09IG90aGVyLml0ZW1JbmRleFxuICAgICAgJiYgaXRlbS5sZWZ0ID09PSBvdGhlci5sZWZ0XG4gICAgICAmJiBpdGVtLnRvcCA9PT0gb3RoZXIudG9wXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdFJlY3QocmVjdCwgY2xpcCkge1xuICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBjbGlwLmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4ocmVjdC5yaWdodCwgY2xpcC5yaWdodClcbiAgY29uc3QgdG9wID0gTWF0aC5tYXgocmVjdC50b3AsIGNsaXAudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihyZWN0LmJvdHRvbSwgY2xpcC5ib3R0b20pXG4gIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHJldHVybiBudWxsXG4gIHJldHVybiB7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQb3NpdGlvbnMoYm9hcmQsIGl0ZW1zKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBbXVxuICBjb25zdCBib2FyZFJlY3QgPSBib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBjb25zdCBwb3NpdGlvbnMgPSBbXVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIHJldmlld1RhcmdldHMoaXRlbSkuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgbGV0IGVsZW1lbnQgPSBudWxsXG4gICAgICB0cnkge1xuICAgICAgICBlbGVtZW50ID0gYm9hcmQucXVlcnlTZWxlY3Rvcih0YXJnZXQuc2VsZWN0b3IpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQ/LmlzQ29ubmVjdGVkKSByZXR1cm5cbiAgICAgIGNvbnN0IHNjcmVlbkNvbnRlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY29udGVudCcpXG4gICAgICBpZiAoIXNjcmVlbkNvbnRlbnQpIHJldHVyblxuICAgICAgY29uc3QgdmlzaWJsZSA9IGludGVyc2VjdFJlY3QoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgc2NyZWVuQ29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSlcbiAgICAgIGlmICghdmlzaWJsZSkgcmV0dXJuXG4gICAgICBjb25zdCBiYXNlTGVmdCA9IE1hdGgucm91bmQodmlzaWJsZS5yaWdodCAtIGJvYXJkUmVjdC5sZWZ0KVxuICAgICAgY29uc3QgYmFzZVRvcCA9IE1hdGgucm91bmQodmlzaWJsZS50b3AgLSBib2FyZFJlY3QudG9wKVxuICAgICAgY29uc3Qgb3ZlcmxhcENvdW50ID0gcG9zaXRpb25zLmZpbHRlcihcbiAgICAgICAgKHBvc2l0aW9uKSA9PiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlTGVmdCAtIGJhc2VMZWZ0KSA8IDIgJiYgTWF0aC5hYnMocG9zaXRpb24uYmFzZVRvcCAtIGJhc2VUb3ApIDwgMixcbiAgICAgICkubGVuZ3RoXG4gICAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICAgIGtleTogYCR7aXRlbS5pZH06JHt0YXJnZXRJbmRleH1gLFxuICAgICAgICBpdGVtLFxuICAgICAgICBpdGVtSW5kZXgsXG4gICAgICAgIHRhcmdldEluZGV4LFxuICAgICAgICBiYXNlTGVmdCxcbiAgICAgICAgYmFzZVRvcCxcbiAgICAgICAgbGVmdDogYmFzZUxlZnQgKyBvdmVybGFwQ291bnQgKiAxNSxcbiAgICAgICAgdG9wOiBiYXNlVG9wLFxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBwb3NpdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld01hcmtlcnMoeyBib2FyZFJlZiwgaXRlbXMsIG9uT3BlblBhbmVsIH0pIHtcbiAgY29uc3QgW3Bvc2l0aW9ucywgc2V0UG9zaXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbYWN0aXZlS2V5LCBzZXRBY3RpdmVLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZnJhbWVSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCByZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSByZXNvbHZlUG9zaXRpb25zKGJvYXJkUmVmLmN1cnJlbnQsIGl0ZW1zKVxuICAgIHNldFBvc2l0aW9ucygoY3VycmVudCkgPT4gc2FtZVBvc2l0aW9ucyhjdXJyZW50LCBuZXh0KSA/IGN1cnJlbnQgOiBuZXh0KVxuICB9LCBbYm9hcmRSZWYsIGl0ZW1zXSlcblxuICBjb25zdCBzY2hlZHVsZVJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIGZyYW1lUmVmLmN1cnJlbnQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGZyYW1lUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICByZWZyZXNoKClcbiAgICB9KVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KHNjaGVkdWxlUmVmcmVzaClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbc2NoZWR1bGVSZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmVLZXkgJiYgIXBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpKSBzZXRBY3RpdmVLZXkobnVsbClcbiAgfSwgW2FjdGl2ZUtleSwgcG9zaXRpb25zXSlcblxuICBjb25zdCBhY3RpdmUgPSBwb3NpdGlvbnMuZmluZCgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KVxuICBjb25zdCBib2FyZFdpZHRoID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50V2lkdGggfHwgMFxuICBjb25zdCBib2FyZEhlaWdodCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudEhlaWdodCB8fCAwXG4gIGNvbnN0IGJ1YmJsZUxlZnQgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLmxlZnQgKyAxNiwgYm9hcmRXaWR0aCAtIDMzNikpIDogMFxuICBjb25zdCBidWJibGVUb3AgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLnRvcCArIDI0LCBib2FyZEhlaWdodCAtIDE4MCkpIDogMFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbikgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICd3Zi1yZXZpZXctbWFya2VyIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW1hcmtlcid9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XHVGRjFBJHtSRVZJRVdfVFlQRV9MQUJFTFNbcG9zaXRpb24uaXRlbS50eXBlXX1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICAgIHthY3RpdmUgPyAoXG4gICAgICAgIDxhc2lkZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7YWN0aXZlLml0ZW1JbmRleCArIDF9YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGl0bGVcIj5cbiAgICAgICAgICAgICAge2FjdGl2ZS5pdGVtSW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1thY3RpdmUuaXRlbS50eXBlXX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaW5zdHJ1Y3Rpb25cIj5cbiAgICAgICAgICAgIHthY3RpdmUuaXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGFyZ2V0c1wiPlxuICAgICAgICAgICAge3Jldmlld1RhcmdldHMoYWN0aXZlLml0ZW0pLm1hcCgodGFyZ2V0KSA9PiAoXG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1zZWxlY3RvclwiIGtleT17dGFyZ2V0LnNlbGVjdG9yfT57dGFyZ2V0LnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1tb3JlXCJcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3RpdmVLZXkobnVsbClcbiAgICAgICAgICAgICAgb25PcGVuUGFuZWw/LigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1NjdFNVx1NzcwQlx1NjZGNFx1NTkxQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJjb25zdCBMQVVOQ0hFUl9TSVpFID0gNDhcbmNvbnN0IExBVU5DSEVSX01BUkdJTiA9IDIwXG5jb25zdCBEUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgTWF0aC5tYXgobWluLCBtYXgpKVxufVxuXG5mdW5jdGlvbiBjbGFtcFBvc2l0aW9uKGJvYXJkLCBwb3NpdGlvbikge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gcG9zaXRpb25cbiAgcmV0dXJuIHtcbiAgICB4OiBjbGFtcChwb3NpdGlvbi54LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gICAgeTogY2xhbXAocG9zaXRpb24ueSwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0UG9zaXRpb24oYm9hcmQpIHtcbiAgcmV0dXJuIGNsYW1wUG9zaXRpb24oYm9hcmQsIHtcbiAgICB4OiBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gICAgeTogYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWU/LngpICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueSkpIHJldHVybiB2YWx1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBsb2NhbFN0b3JhZ2UgbWF5IGJlIHVuYXZhaWxhYmxlIGZvciBhIGRpcmVjdGx5IG9wZW5lZCBsb2NhbCBmaWxlLlxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvbikge1xuICB0cnkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwb3NpdGlvbikpXG4gIH0gY2F0Y2gge1xuICAgIC8vIEtlZXBpbmcgdGhlIGxhdW5jaGVyIGRyYWdnYWJsZSBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHBlcnNpc3RlbmNlLlxuICB9XG59XG5cbmZ1bmN0aW9uIENvbW1lbnRJY29uKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTUgNC41aDE0YTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAyaC02bC00LjUgM3YtM0g1YTIgMiAwIDAgMS0yLTJ2LThhMiAyIDAgMCAxIDItMlpcIiAvPlxuICAgICAgPHBhdGggZD1cIk03LjUgMTAuNWg5XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TGF1bmNoZXIoeyBib2FyZFJlZiwgY291bnQsIHByb2plY3ROYW1lLCBvbk9wZW4gfSkge1xuICBjb25zdCBzdG9yYWdlS2V5ID0gYHdmLXJldmlldy1sYXVuY2hlci1wb3NpdGlvbjoke3Byb2plY3ROYW1lfWBcbiAgY29uc3QgW3Bvc2l0aW9uLCBzZXRQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvc2l0aW9uUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN1cHByZXNzQ2xpY2tSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG5cbiAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSBSZWFjdC51c2VDYWxsYmFjaygobmV4dCkgPT4ge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQsIG5leHQpXG4gICAgcG9zaXRpb25SZWYuY3VycmVudCA9IGNsYW1wZWRcbiAgICBzZXRQb3NpdGlvbihjbGFtcGVkKVxuICAgIHJldHVybiBjbGFtcGVkXG4gIH0sIFtib2FyZFJlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBib2FyZCA9IGJvYXJkUmVmLmN1cnJlbnRcbiAgICBpZiAoIWJvYXJkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgdXBkYXRlUG9zaXRpb24ocmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG5cbiAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gdXBkYXRlUG9zaXRpb24ocG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuICAgICAgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIG5leHQpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gIH0sIFtib2FyZFJlZiwgc3RvcmFnZUtleSwgdXBkYXRlUG9zaXRpb25dKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGRyYWcubW92ZWRcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKHBvc2l0aW9uUmVmLmN1cnJlbnQpIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvblJlZi5jdXJyZW50KVxuICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0Lmhhc1BvaW50ZXJDYXB0dXJlPy4oZXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLXJldmlldy1sYXVuY2hlciBpcy1kcmFnZ2luZycgOiAnd2YtcmV2aWV3LWxhdW5jaGVyJ31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHJpZ2h0OiBMQVVOQ0hFUl9NQVJHSU4sIGJvdHRvbTogTEFVTkNIRVJfTUFSR0lOIH19XG4gICAgICBhcmlhLWxhYmVsPXtgXHU1QzU1XHU1RjAwXHU4QkM0XHU4QkJBXHVGRjBDXHU1MTcxICR7Y291bnR9IFx1Njc2MVx1NEZFRVx1NjUzOWB9XG4gICAgICBkYXRhLXRvb2x0aXA9XCJcdTVDNTVcdTVGMDBcdThCQzRcdThCQkFcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50KVxuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgY29uc3QgZGVsdGFYID0gZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBEUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgIGRyYWcubW92ZWQgPSB0cnVlXG4gICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXtmaW5pc2hEcmFnfVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBpZiAoc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBvbk9wZW4oKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Q29tbWVudEljb24gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb3VudH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cbiIsICJleHBvcnQgY29uc3QgVU5TQVZFRF9SRVZJRVdfTUVTU0FHRSA9ICdcdTRGRUVcdTY1MzlcdTUxODVcdTVCQjlcdTVDMUFcdTY3MkFcdTRGRERcdTVCNThcdUZGMENcdTc5QkJcdTVGMDBcdTk4NzVcdTk3NjJcdTU0MEVcdTRGMUFcdTRFMjJcdTU5MzFcdTMwMDJcdTY2MkZcdTU0MjZcdTdFRTdcdTdFRURcdUZGMUYnXG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBldmVudC5yZXR1cm5WYWx1ZSA9IFVOU0FWRURfUkVWSUVXX01FU1NBR0VcbiAgcmV0dXJuIFVOU0FWRURfUkVWSUVXX01FU1NBR0Vcbn1cbiIsICJleHBvcnQgY29uc3QgQk9BUkRfU0hPUlRDVVRTID0gW1xuICB7IGlkOiAnY2FudmFzJywga2V5czogJ0N0cmwrMScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnZGVtbycsIGtleXM6ICdDdHJsKzInLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ludGVyYWN0aW9uJywga2V5czogJ0N0cmwrSScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1M0VGXHU0RUE0XHU0RTkyIC8gXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJyB9LFxuICB7IGlkOiAncmV2aWV3Jywga2V5czogJ0N0cmwrTScsIGxhYmVsOiAnXHU1RjAwXHU1NDJGXHU2MjE2XHU1MTczXHU5NUVEXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW1tZXJzaXZlJywga2V5czogJ0N0cmwrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnYnJvd3Nlci1mdWxsc2NyZWVuJywga2V5czogJ0N0cmwrU2hpZnQrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJyB9LFxuICB7IGlkOiAnaG90c3BvdHMnLCBrZXlzOiAnQ3RybCtIJywgbGFiZWw6ICdcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0EnIH0sXG4gIHsgaWQ6ICdzcGFjZScsIGtleXM6ICdTcGFjZScsIGxhYmVsOiAnXHU2MzA5XHU0RjRGXHU0RTM0XHU2NUY2XHU2MkQ2XHU1MkE4XHU3NTNCXHU1RTAzJyB9LFxuICB7IGlkOiAnZXNjYXBlJywga2V5czogJ0VzYycsIGxhYmVsOiAnXHU1MTczXHU5NUVEXHU1RjUzXHU1MjREXHU5NzYyXHU2NzdGXHU2MjE2XHU5MDAwXHU1MUZBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaGVscCcsIGtleXM6ICc/JywgbGFiZWw6ICdcdTYyNTNcdTVGMDBcdTYyMTZcdTUxNzNcdTk1RURcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgY29uc3QgZWxlbWVudCA9IHRhcmdldC5ub2RlVHlwZSA9PT0gMyA/IHRhcmdldC5wYXJlbnRFbGVtZW50IDogdGFyZ2V0XG4gIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZVxuICBpZiAodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1RFWFRBUkVBJyB8fCB0YWcgPT09ICdTRUxFQ1QnKSByZXR1cm4gdHJ1ZVxuICBpZiAoZWxlbWVudC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhZWxlbWVudC5jbG9zZXN0Py4oJ1tjb250ZW50ZWRpdGFibGVdOm5vdChbY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIl0pJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0Y3V0SWRGb3JFdmVudChldmVudCkge1xuICBpZiAoIWV2ZW50IHx8IGV2ZW50LnJlcGVhdCB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuIG51bGxcbiAgY29uc3Qga2V5ID0gU3RyaW5nKGV2ZW50LmtleSB8fCAnJykudG9Mb3dlckNhc2UoKVxuXG4gIGlmICghZXZlbnQuY3RybEtleSkge1xuICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYga2V5ID09PSAnZXNjYXBlJykgcmV0dXJuICdlc2NhcGUnXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJz8nKSByZXR1cm4gJ2hlbHAnXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChldmVudC5zaGlmdEtleSkgcmV0dXJuIGtleSA9PT0gJ2YnID8gJ2Jyb3dzZXItZnVsbHNjcmVlbicgOiBudWxsXG4gIGlmIChrZXkgPT09ICcxJykgcmV0dXJuICdjYW52YXMnXG4gIGlmIChrZXkgPT09ICcyJykgcmV0dXJuICdkZW1vJ1xuICBpZiAoa2V5ID09PSAnaScpIHJldHVybiAnaW50ZXJhY3Rpb24nXG4gIGlmIChrZXkgPT09ICdtJykgcmV0dXJuICdyZXZpZXcnXG4gIGlmIChrZXkgPT09ICdmJykgcmV0dXJuICdpbW1lcnNpdmUnXG4gIGlmIChrZXkgPT09ICdoJykgcmV0dXJuICdob3RzcG90cydcbiAgcmV0dXJuIG51bGxcbn1cbiIsICJpbXBvcnQgeyBCT0FSRF9TSE9SVENVVFMgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuZnVuY3Rpb24gUGFuZWxTaGVsbCh7IGlkLCB0aXRsZSwgYXJpYUxhYmVsLCBvbkNsb3NlLCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGNsb3NlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHJldHVybkZvY3VzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm5Gb2N1c1JlZi5jdXJyZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgIGNsb3NlUmVmLmN1cnJlbnQ/LmZvY3VzKClcbiAgICByZXR1cm4gKCkgPT4gcmV0dXJuRm9jdXNSZWYuY3VycmVudD8uZm9jdXM/LigpXG4gIH0sIFtdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbGF5ZXJcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIG9uQ2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c2VjdGlvbiBpZD17aWR9IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICA8YnV0dG9uIHJlZj17Y2xvc2VSZWZ9IHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9IGFyaWEtbGFiZWw9e2BcdTUxNzNcdTk1RUQke3RpdGxlfWB9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9ydGN1dEhlbHAoeyBkZW1vQXZhaWxhYmxlLCBzaG93Q2FudmFzSW5kZXgsIG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlLCBvbkNsb3NlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8UGFuZWxTaGVsbCBpZD1cIndmLWJvYXJkLXV0aWxpdHlcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVwiIGFyaWFMYWJlbD1cIlx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiIG9uQ2xvc2U9e29uQ2xvc2V9PlxuICAgICAgPGRsIGNsYXNzTmFtZT1cIndmLXNob3J0Y3V0LWxpc3RcIj5cbiAgICAgICAge0JPQVJEX1NIT1JUQ1VUUy5tYXAoKHNob3J0Y3V0KSA9PiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnaXMtZGlzYWJsZWQnIDogJyd9IGtleT17c2hvcnRjdXQuaWR9PlxuICAgICAgICAgICAgPGR0PjxrYmQ+e3Nob3J0Y3V0LmtleXN9PC9rYmQ+PC9kdD5cbiAgICAgICAgICAgIDxkZD57c2hvcnRjdXQubGFiZWx9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnXHVGRjA4XHU1RjUzXHU1MjREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjA5JyA6ICcnfTwvZGQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kbD5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLW5vdGVcIj5cdTU3MjhcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDFcdTY1ODdcdTY3MkNcdTU3REZcdTMwMDFcdTRFMEJcdTYyQzlcdTY4NDZcdTU0OENcdTUzRUZcdTdGMTZcdThGOTFcdTUxODVcdTVCQjlcdTRFMkRcdTRFMERcdTRGMUFcdTg5RTZcdTUzRDFcdTY2NkVcdTkwMUFcdTVGRUJcdTYzNzdcdTk1MkVcdTMwMDI8L3A+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1zZWN0aW9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlxuICAgICAgICA8aDIgaWQ9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XHU3NTNCXHU2NzdGXHU4QkJFXHU3RjZFPC9oMj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NjYzRVx1NzkzQVx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPlx1NTcyOFx1NzUzQlx1Njc3Rlx1NEUwQVx1NjYzRVx1NzkzQVx1NTNFRlx1NjJENlx1NjJGRFx1NzY4NFx1OTg3NVx1OTc2Mlx1N0QyMlx1NUYxNTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3Nob3dDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvUGFuZWxTaGVsbD5cbiAgKVxufVxuIiwgImNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSBPYmplY3QuZnJlZXplKHsgc2hvd0NhbnZhc0luZGV4OiB0cnVlIH0pXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpIHtcbiAgcmV0dXJuIGB3Zi1ib2FyZC1zZXR0aW5nczoke3Byb2plY3ROYW1lfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzdG9yYWdlPy5nZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSkpXG4gICAgaWYgKHR5cGVvZiBwYXJzZWQ/LnNob3dDYW52YXNJbmRleCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4geyBzaG93Q2FudmFzSW5kZXg6IHBhcnNlZC5zaG93Q2FudmFzSW5kZXggfVxuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gZmlsZTovLyBzdG9yYWdlIGNhbiBiZSB1bmF2YWlsYWJsZSBvciBjb250YWluIHN0YWxlIGRhdGEuXG4gIH1cbiAgcmV0dXJuIHsgLi4uREVGQVVMVF9TRVRUSU5HUyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQm9hcmRTZXR0aW5ncyhzdG9yYWdlLCBwcm9qZWN0TmFtZSwgc2V0dGluZ3MpIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHsgc2hvd0NhbnZhc0luZGV4OiBzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlIH1cbiAgdHJ5IHtcbiAgICBzdG9yYWdlPy5zZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSwgSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplZCkpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gU2V0dGluZ3MgcmVtYWluIHVzYWJsZSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbiB3aXRob3V0IHBlcnNpc3RlbmNlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IENhbnZhc01vZGUsIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayB9IGZyb20gJy4vQ2FudmFzTW9kZS5qc3gnXG5pbXBvcnQgeyBEZW1vTW9kZSB9IGZyb20gJy4vRGVtb01vZGUuanN4J1xuaW1wb3J0IHsgcmVzb2x2ZUV4cGFuZFRhcmdldHMgfSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7IGV4cG9ydFNlbGVjdGVkIH0gZnJvbSAnLi9leHBvcnQuanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHsgY2xhbXBTY2FsZSB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFJldmlld1BhbmVsIH0gZnJvbSAnLi9SZXZpZXdQYW5lbC5qc3gnXG5pbXBvcnQgeyBSZXZpZXdNYXJrZXJzIH0gZnJvbSAnLi9SZXZpZXdNYXJrZXJzLmpzeCdcbmltcG9ydCB7IFJldmlld0xhdW5jaGVyIH0gZnJvbSAnLi9SZXZpZXdMYXVuY2hlci5qc3gnXG5pbXBvcnQgeyBkZXNjcmliZVJldmlld0VsZW1lbnQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7IHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdCB9IGZyb20gJy4vYmVmb3JlLXVubG9hZC5qcydcbmltcG9ydCB7IFNob3J0Y3V0SGVscCB9IGZyb20gJy4vQm9hcmRQYW5lbHMuanN4J1xuaW1wb3J0IHsgZ2V0Qm9hcmRTdG9yYWdlLCByZWFkQm9hcmRTZXR0aW5ncywgc2F2ZUJvYXJkU2V0dGluZ3MgfSBmcm9tICcuL2JvYXJkLXNldHRpbmdzLmpzJ1xuaW1wb3J0IHsgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0LCBzaG9ydGN1dElkRm9yRXZlbnQgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuY29uc3QgVklFV1BPUlRfTEFCRUxTID0ge1xuICBtb2JpbGU6ICdcdTYyNEJcdTY3M0EnLFxuICBkZXNrdG9wOiAnXHU2ODRDXHU5NzYyJyxcbn1cblxuZnVuY3Rpb24gWm9vbUNvbnRyb2xzKHsgc2NhbGUsIHNldFNjYWxlLCBvblJlc2V0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXpvb20tY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU3RjI5XHU1QzBGXCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlIC0gMC4xKSl9Pi08L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXpvb20tdmFsdWVcIj57TWF0aC5yb3VuZChzY2FsZSAqIDEwMCl9JTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU2NTNFXHU1OTI3XCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlICsgMC4xKSl9Pis8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU5MUNEXHU3RjZFXHU3RjI5XHU2NTNFXCIgb25DbGljaz17b25SZXNldH0+XHU1OTBEXHU0RjREPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEx1Y2lkZSBcdTk4Q0VcdTY4M0NcdTVERTVcdTUxNzdcdTY4MEZcdTU2RkVcdTY4MDdcdTMwMDJcdTRFQzVcdTc1MjhcdTRFOEVcdTY4NDZcdTY3QjYgY2hyb21lXHUzMDAyICovXG5mdW5jdGlvbiBUb29sYmFySWNvbih7IG5hbWUgfSkge1xuICBjb25zdCBwYXRocyA9IHtcbiAgICBlZGl0OiA8PjxwYXRoIGQ9XCJNMTIgMjBoOVwiIC8+PHBhdGggZD1cIk0xNi41IDMuNWEyLjEyIDIuMTIgMCAwIDEgMyAzTDcgMTlsLTQgMSAxLTRaXCIgLz48Lz4sXG4gICAgZnVsbHNjcmVlbjogPD48cGF0aCBkPVwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M1wiIC8+PHBhdGggZD1cIk0yMSA4VjVhMiAyIDAgMCAwLTItMmgtM1wiIC8+PHBhdGggZD1cIk0zIDE2djNhMiAyIDAgMCAwIDIgMmgzXCIgLz48cGF0aCBkPVwiTTE2IDIxaDNhMiAyIDAgMCAwIDItMnYtM1wiIC8+PC8+LFxuICAgIGV4cGFuZDogPD48cGF0aCBkPVwibTcgMTUgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDkgNS01IDUgNVwiIC8+PC8+LFxuICAgIGNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJtNyAyMCA1LTUgNSA1XCIgLz48cGF0aCBkPVwibTcgNCA1IDUgNS01XCIgLz48Lz4sXG4gICAgdG9vbGJhckV4cGFuZDogPD48cGF0aCBkPVwiTTUgNXYxNFwiIC8+PHBhdGggZD1cIm0xNSAxOC02LTYgNi02XCIgLz48Lz4sXG4gICAgdG9vbGJhckNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJNMTkgNXYxNFwiIC8+PHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPjwvPixcbiAgICBkb3dubG9hZDogPD48cGF0aCBkPVwiTTEyIDN2MTJcIiAvPjxwYXRoIGQ9XCJtNyAxMCA1IDUgNS01XCIgLz48cGF0aCBkPVwiTTUgMjFoMTRcIiAvPjwvPixcbiAgICBzZXR0aW5nczogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjcgMS43IDAgMCAwIC4zNCAxLjg4bC4wNi4wNi0yLjgzIDIuODMtLjA2LS4wNkExLjcgMS43IDAgMCAwIDE1IDE5LjRhMS43IDEuNyAwIDAgMC0xIC42IDEuNyAxLjcgMCAwIDAtLjQgMS4xVjIxaC00di0uMDlBMS43IDEuNyAwIDAgMCA4LjYgMTkuNGExLjcgMS43IDAgMCAwLTEuODguMzRsLS4wNi4wNi0yLjgzLTIuODMuMDYtLjA2QTEuNyAxLjcgMCAwIDAgNC42IDE1YTEuNyAxLjcgMCAwIDAtLjYtMSAxLjcgMS43IDAgMCAwLTEuMS0uNEgzdi00aC4wOUExLjcgMS43IDAgMCAwIDQuNiA4LjZhMS43IDEuNyAwIDAgMC0uMzQtMS44OGwtLjA2LS4wNiAyLjgzLTIuODMuMDYuMDZBMS43IDEuNyAwIDAgMCA5IDQuNmExLjcgMS43IDAgMCAwIDEtLjYgMS43IDEuNyAwIDAgMCAuNC0xLjFWM2g0di4wOUExLjcgMS43IDAgMCAwIDE1LjQgNC42YTEuNyAxLjcgMCAwIDAgMS44OC0uMzRsLjA2LS4wNiAyLjgzIDIuODMtLjA2LjA2QTEuNyAxLjcgMCAwIDAgMTkuNCA5Yy4yLjM3LjUyLjcgMSAuOS4zMi4xMy42OC4yIDEuMS4yaC4wOXY0aC0uMDlhMS43IDEuNyAwIDAgMC0yLjEuOVpcIiAvPjwvPixcbiAgICBoZWxwOiA8PjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiOVwiIC8+PHBhdGggZD1cIk05LjcgOWEyLjQgMi40IDAgMSAxIDMuNyAyYy0uOS42LTEuNCAxLjEtMS40IDJcIiAvPjxwYXRoIGQ9XCJNMTIgMTdoLjAxXCIgLz48Lz4sXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3BhdGhzW25hbWVdfVxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBcdTdFQkZcdTY4NDZcdTk1MDFcdUZGMUFcdTVGMDBcdTk1MDE9XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjBDXHU5NUVEXHU5NTAxPVx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwMlx1Njg0Nlx1NjdCNiBjaHJvbWUgXHU1M0VGXHU3NTI4IFNWR1x1MzAwMiAqL1xuZnVuY3Rpb24gTG9ja0ljb24oeyBvcGVuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLWxvY2staWNvblwiIHZpZXdCb3g9XCIwIDAgMTQgMTRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICAvLyBcdTVGMDBcdTk1MDFcdUZGMUFcdTY4ODFcdTRFQ0VcdTVERTZcdTRGQTdcdTdBQ0JcdThENzdcdTU0MEVcdTU0MTFcdTUzRjNcdTRFMEFcdTYwQUNcdTdBN0FcdUZGMENcdTUzRjNcdTgxMUFcdTRFMERcdTYyNjNcdTU2REVcdTk1MDFcdTRGNTNcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjM1YTIuNzUgMi43NSAwIDAgMSA1LjM1LS4yXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC41YTIuNzUgMi43NSAwIDAgMSA1LjUgMHYyLjI1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8cmVjdCB4PVwiMi43NVwiIHk9XCI2Ljc1XCIgd2lkdGg9XCI4LjVcIiBoZWlnaHQ9XCI1LjVcIiByeD1cIjEuMjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogaW50ZXJhY3RpdmU9dHJ1ZSBcdTY2M0VcdTc5M0FcdTVGMDBcdTk1MDFcdTMwMENcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMERcdUZGMUJmYWxzZSBcdTRFM0FcdTRFMEFcdTk1MDFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0UgKi9cbmZ1bmN0aW9uIEludGVyYWN0aW9uTG9jayh7IGludGVyYWN0aXZlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2ludGVyYWN0aXZlID8gJ3dmLWludGVyYWN0aW9uLWxvY2snIDogJ3dmLWludGVyYWN0aW9uLWxvY2sgaXMtbG9ja2VkJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgYXJpYS1wcmVzc2VkPXshaW50ZXJhY3RpdmV9XG4gICAgICB0aXRsZT17aW50ZXJhY3RpdmVcbiAgICAgICAgPyAnXHU1RjUzXHU1MjREXHU1M0VGXHU0RUE0XHU0RTkyXHU5ODc1XHU5NzYyXHUzMDAyXHU3MEI5XHU1MUZCXHU5NTAxXHU0RjRGXHU1NDBFXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHU3NTNCXHU1RTAzXHVGRjBDXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIEN0cmwrSSdcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIEN0cmwrSSd9XG4gICAgPlxuICAgICAgPExvY2tJY29uIG9wZW49e2ludGVyYWN0aXZlfSAvPlxuICAgICAgPHNwYW4+e2ludGVyYWN0aXZlID8gJ1x1NTNFRlx1NEVBNFx1NEU5MicgOiAnXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJ308L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fCBudWxsXG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RCb2FyZEZ1bGxzY3JlZW4oZWwpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGVsICYmIChlbC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBlbC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbilcbiAgaWYgKCFyZXF1ZXN0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXF1ZXN0LmNhbGwoZWwpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZnVuY3Rpb24gZXhpdEJvYXJkRnVsbHNjcmVlbigpIHtcbiAgaWYgKCFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgY29uc3QgZXhpdCA9IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8IGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuXG4gIGlmICghZXhpdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXhpdC5jYWxsKGRvY3VtZW50KSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb2FyZCh7IHByb2plY3QgfSkge1xuICBjb25zdCB7XG4gICAgbW9kZSxcbiAgICBzZXRNb2RlLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0LFxuICAgIGVudHJ5SWQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgY3VycmVudFNjcmVlbklkLFxuICAgIGNhbkdvQmFjayxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIGNvbnN0IHZpZXdwb3J0T3B0aW9ucyA9IE9iamVjdC5rZXlzKHByb2plY3Qudmlld3BvcnRzKVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG5cbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSksXG4gIClcbiAgY29uc3QgW2NhbnZhc1NjYWxlLCBzZXRDYW52YXNTY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1NjYWxlLCBzZXREZW1vU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9WaWV3UmVzZXRLZXksIHNldERlbW9WaWV3UmVzZXRLZXldID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2ludGVyYWN0aXZlLCBzZXRJbnRlcmFjdGl2ZV0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZElkcywgc2V0RXhwYW5kZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCBbaW1tZXJzaXZlLCBzZXRJbW1lcnNpdmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQsIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2hlbHBWaXNpYmxlLCBzZXRIZWxwVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NhbnZhc0luZGV4VmlzaWJsZSwgc2V0Q2FudmFzSW5kZXhWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dDYW52YXNJbmRleCxcbiAgKVxuICBjb25zdCBbY2FudmFzSW5kZXhQb3NpdGlvbiwgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBib2FyZFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmID0gUmVhY3QudXNlUmVmKG5ldyBTZXQoKSlcbiAgY29uc3QgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGNhbnZhc0xvY2tlZCA9ICFpbnRlcmFjdGl2ZSB8fCBzcGFjZUhlbGRcbiAgY29uc3QgYWxsU2NyZWVuSWRzID0gcHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpXG4gIGNvbnN0IGlzRGVtbyA9IG1vZGUgPT09ICdkZW1vJyAmJiBkZW1vQXZhaWxhYmxlXG4gIGNvbnN0IGFjdGl2ZVNjYWxlID0gaXNEZW1vID8gZGVtb1NjYWxlIDogY2FudmFzU2NhbGVcbiAgY29uc3Qgc2V0QWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBzZXREZW1vU2NhbGUgOiBzZXRDYW52YXNTY2FsZVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmVcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcblxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2VFbGVtZW50KSB7XG4gICAgICAgIG9wdGlvbnMucmVwbGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICBpZiAoY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQgJiYgaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5tYXAoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCA/IG5leHRTZWxlY3Rpb24gOiBpdGVtKVxuICAgICAgfVxuICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQpXG4gICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0ZWRFbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgIHJldHVybiBhZGRpdGl2ZSA/IFsuLi5jdXJyZW50LCBuZXh0U2VsZWN0aW9uXSA6IFtuZXh0U2VsZWN0aW9uXVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0LnNjcmVlbnMsIHJldmlld011bHRpU2VsZWN0LCByZXZpZXdTZWxlY3Rpb25zXSlcblxuICBjb25zdCByZW1vdmVSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpKVxuICB9LCBbXSlcblxuICBjb25zdCBjbG9zZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdFbmFibGVkKGZhbHNlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IGhvdmVyUmV2aWV3QnJlYWRjcnVtYiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gZWxlbWVudCB8fCBudWxsXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBjbG9zZVJldmlld1BhbmVsID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgfSwgW2hvdmVyUmV2aWV3QnJlYWRjcnVtYl0pXG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7IHNob3dDYW52YXNJbmRleDogdmlzaWJsZSB9KVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSlcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUoc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4KVxuICAgIHNldENhbnZhc0luZGV4UG9zaXRpb24obnVsbClcbiAgfSwgW3Byb2plY3QubmFtZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJyAmJiAhZXZlbnQucmVwZWF0ICYmICFpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hvcnRjdXQgPSBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpXG4gICAgICBpZiAoIXNob3J0Y3V0KSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCAhPT0gJ2VzY2FwZScgJiYgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycgJiYgIWlzRGVtbykgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnICYmIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVyblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdjYW52YXMnKSBzZXRNb2RlKCdjYW52YXMnKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycpIHNldE1vZGUoJ2RlbW8nKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW50ZXJhY3Rpb24nKSBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ3JldmlldycpIHRvZ2dsZVJldmlldygpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbW1lcnNpdmUnKSB0b2dnbGVJbW1lcnNpdmUoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnYnJvd3Nlci1mdWxsc2NyZWVuJykgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4oKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnKSBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdoZWxwJykge1xuICAgICAgICBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgaWYgKGhlbHBWaXNpYmxlKSBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICAgICAgZWxzZSBpZiAocmV2aWV3RW5hYmxlZCkgY2xvc2VSZXZpZXcoKVxuICAgICAgICBlbHNlIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtcbiAgICBjbG9zZVJldmlldyxcbiAgICBkZW1vQXZhaWxhYmxlLFxuICAgIGV4aXRJbW1lcnNpdmUsXG4gICAgaGVscFZpc2libGUsXG4gICAgaW1tZXJzaXZlLFxuICAgIGlzRGVtbyxcbiAgICByZXZpZXdFbmFibGVkLFxuICAgIHNldE1vZGUsXG4gICAgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4sXG4gICAgdG9nZ2xlSW1tZXJzaXZlLFxuICAgIHRvZ2dsZVJldmlldyxcbiAgXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnZGVtbycpIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfSwgW21vZGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3luYyA9ICgpID0+IHNldEJyb3dzZXJGdWxsc2NyZWVuKCEhZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGXHVGRjA4Q3RybCsxXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NzUzQlx1Njc3RlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2RlbW8nID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdkZW1vJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMDhDdHJsKzJcdUZGMDlcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBXHVGRjA4Q3RybCtIXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoZWxwVmlzaWJsZX1cbiAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcdUZGMDhDdHJsK01cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlUmV2aWV3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2ltbWVyc2l2ZSA/ICdcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnIDogJ1x1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRid9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRlx1RkYwOEN0cmwrRlx1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVJbW1lcnNpdmV9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJmdWxsc2NyZWVuXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1NUM0Rjwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHModHJ1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU1QzU1XHU1RjAwPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyhmYWxzZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTY1MzZcdThENzc8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLXRvb2xiYXItaWNvbi1idXR0b24tLXByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2V4cG9ydGluZyB8fCBzZWxlY3RlZElkcy5zaXplID09PSAwIHx8IG1vZGUgPT09ICdkZW1vJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2V4cG9ydGluZyA/ICdcdTZCNjNcdTU3MjhcdTVCRkNcdTUxRkEnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RFx1RkYwOCR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1XHVGRjA5YH1cbiAgICAgICAgICAgIHRpdGxlPXtleHBvcnRpbmcgPyAnXHU1QkZDXHU1MUZBXHU0RTJEXHUyMDI2JyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0QgJHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwb3J0SWRzKFsuLi5zZWxlY3RlZElkc10pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZG93bmxvYWRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWNvdW50XCI+e2V4cG9ydGluZyA/ICdcdTIwMjYnIDogc2VsZWN0ZWRJZHMuc2l6ZX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTYyNTNcdTUzMDVcdTRFMEJcdThGN0Q8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIHtleHBvcnRFcnJvciA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2V4cG9ydEVycm9yfTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHtpbW1lcnNpdmUgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1pbW1lcnNpdmUtY2hyb21lJHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnJyA6ICcgaXMtY29sbGFwc2VkJ31gfVxuICAgICAgICAgIHJvbGU9XCJ0b29sYmFyXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2Qzg5XHU2RDc4XHU2M0E3XHU0RUY2XCJcbiAgICAgICAgPlxuICAgICAgICAgIHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWltbWVyc2l2ZS1jb250cm9sc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1RkYwOEVzY1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXhpdEltbWVyc2l2ZX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1OTAwMFx1NTFGQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU5MDAwXHU1MUZBXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4Q3RybCtTaGlmdCtGXHVGRjA5JyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDhDdHJsK1NoaWZ0K0ZcdUZGMDknfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOEN0cmwrSFx1RkYwOVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICBjYW52YXNJbmRleFZpc2libGU9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNJbmRleFBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZT17c2V0Q2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNsb3NlQ2FudmFzSW5kZXg9eygpID0+IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8RGVtb01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIGhvdHNwb3RzVmlzaWJsZT17aG90c3BvdHNWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICB2aWV3UmVzZXRLZXk9e2RlbW9WaWV3UmVzZXRLZXl9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBvbkNhbnZhc0NsaWNrPXtyZXZpZXdQYW5lbFZpc2libGUgPyBjbG9zZVJldmlld1BhbmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtyZXZpZXdFbmFibGVkID8gKFxuICAgICAgICA8UmV2aWV3TWFya2VycyBib2FyZFJlZj17Ym9hcmRSZWZ9IGl0ZW1zPXtyZXZpZXdJdGVtc30gb25PcGVuUGFuZWw9e29wZW5SZXZpZXdQYW5lbH0gLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge2hlbHBWaXNpYmxlID8gKFxuICAgICAgICA8U2hvcnRjdXRIZWxwXG4gICAgICAgICAgZGVtb0F2YWlsYWJsZT17ZGVtb0F2YWlsYWJsZX1cbiAgICAgICAgICBzaG93Q2FudmFzSW5kZXg9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvblNob3dDYW52YXNJbmRleENoYW5nZT17dXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldEhlbHBWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAge3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3UGFuZWxWaXNpYmxlID8gKFxuICAgICAgICA8UmV2aWV3UGFuZWxcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNlbGVjdGlvbnM9e3Jldmlld1NlbGVjdGlvbnN9XG4gICAgICAgICAgbXVsdGlTZWxlY3Q9e3Jldmlld011bHRpU2VsZWN0fVxuICAgICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgICBvblRvZ2dsZU11bHRpU2VsZWN0PXsoKSA9PiBzZXRSZXZpZXdNdWx0aVNlbGVjdCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgb25TZWxlY3RFbGVtZW50PXsoZWxlbWVudCkgPT4gc2VsZWN0UmV2aWV3RWxlbWVudChlbGVtZW50LCBudWxsLCBudWxsLCB7XG4gICAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIG9uSG92ZXJFbGVtZW50PXtob3ZlclJldmlld0JyZWFkY3J1bWJ9XG4gICAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkNsZWFyU2VsZWN0aW9uPXtjbGVhclJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkFkZEl0ZW09e2FkZFJldmlld0l0ZW19XG4gICAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICAgIG9uQ2xvc2U9e2Nsb3NlUmV2aWV3fVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJmdW5jdGlvbiBmYWlsKHBhdGgsIG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke3BhdGh9ICR7bWVzc2FnZX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KHByb2plY3QpIHtcbiAgaWYgKCFwcm9qZWN0IHx8IHR5cGVvZiBwcm9qZWN0ICE9PSAnb2JqZWN0JykgZmFpbCgncHJvamVjdCcsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGlmICghcHJvamVjdC52aWV3cG9ydHMgfHwgdHlwZW9mIHByb2plY3Qudmlld3BvcnRzICE9PSAnb2JqZWN0Jykge1xuICAgIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHByb2plY3Qudmlld3BvcnRzKVxuICBpZiAodmlld3BvcnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSB2aWV3cG9ydCcpXG4gIGZvciAoY29uc3QgW2tleSwgdmlld3BvcnRdIG9mIHZpZXdwb3J0RW50cmllcykge1xuICAgIGlmICghdmlld3BvcnQgfHwgdHlwZW9mIHZpZXdwb3J0ICE9PSAnb2JqZWN0JykgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9YCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbiBvZiBbJ3dpZHRoJywgJ2hlaWdodCddKSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWV3cG9ydFtkaW1lbnNpb25dKSB8fCB2aWV3cG9ydFtkaW1lbnNpb25dIDw9IDApIHtcbiAgICAgICAgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9LiR7ZGltZW5zaW9ufWAsICdtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHByb2plY3QuZGVmYXVsdFZpZXdwb3J0KSkge1xuICAgIGZhaWwoJ3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0JywgYHJlZmVyZW5jZXMgbWlzc2luZyB2aWV3cG9ydCBcIiR7cHJvamVjdC5kZWZhdWx0Vmlld3BvcnR9XCJgKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LnNjcmVlbnMpIHx8IHByb2plY3Quc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICBmYWlsKCdwcm9qZWN0LnNjcmVlbnMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzY3JlZW4nKVxuICB9XG5cbiAgY29uc3QgaWRzID0gbmV3IFNldCgpXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LnNjcmVlbnNbJHtpbmRleH1dYFxuICAgIGlmICghc2NyZWVuIHx8IHR5cGVvZiBzY3JlZW4gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uaWQgIT09ICdzdHJpbmcnIHx8ICEvXlthLXowLTktXSskLy50ZXN0KHNjcmVlbi5pZCkpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBtYXRjaCAvXlthLXowLTktXSskLycpXG4gICAgfVxuICAgIGlmIChpZHMuaGFzKHNjcmVlbi5pZCkpIGZhaWwoYCR7cGF0aH0uaWRgLCBgaXMgZHVwbGljYXRlIFwiJHtzY3JlZW4uaWR9XCJgKVxuICAgIGlkcy5hZGQoc2NyZWVuLmlkKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmNvbXBvbmVudCAhPT0gJ2Z1bmN0aW9uJykgZmFpbChgJHtwYXRofS5jb21wb25lbnRgLCAnbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVuLmxpbmtzKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5saW5rc2AsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gIH0pXG5cbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgc2NyZWVuSW5kZXgpID0+IHtcbiAgICBzY3JlZW4ubGlua3MuZm9yRWFjaCgodGFyZ2V0LCBsaW5rSW5kZXgpID0+IHtcbiAgICAgIGlmICghaWRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgYHByb2plY3Quc2NyZWVuc1ske3NjcmVlbkluZGV4fV0ubGlua3NbJHtsaW5rSW5kZXh9XWAsXG4gICAgICAgICAgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke3RhcmdldH1cImAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5cbmV4cG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQsIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4vZmxvdy10YXJnZXQuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKSB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtZmxvdy10byc6IHRvIHx8IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0bykgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgICAgaWYgKG9uQ2xpY2spIG9uQ2xpY2soZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgdG8pIG5hdmlnYXRlKHRvKVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmZ1bmN0aW9uIGpvaW5DbGFzcyhiYXNlLCBleHRyYSkge1xuICByZXR1cm4gZXh0cmEgPyBgJHtiYXNlfSAke2V4dHJhfWAgOiBiYXNlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICBjb2x1bW5zICYmIHR5cGVvZiBjb2x1bW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjb2x1bW5zKVxuICAgICAgPyBjb2x1bW5zW3ZpZXdwb3J0S2V5XVxuICAgICAgOiBjb2x1bW5zXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDApIHJldHVybiBgcmVwZWF0KCR7dmFsdWV9LCBtaW5tYXgoMCwgMWZyKSlgXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSkgcmV0dXJuIHZhbHVlXG4gIHRocm93IG5ldyBFcnJvcignR3JpZCBjb2x1bW5zIG11c3QgcmVzb2x2ZSB0byBhIHBvc2l0aXZlIGludGVnZXIgb3Igbm9uLWVtcHR5IENTUyBzdHJpbmcnKVxufVxuXG5mdW5jdGlvbiB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZVN1ZmZpeDogdG8gPyAnIHdmLWludGVyYWN0aXZlJyA6ICcnLFxuICAgIHJvbGU6IHRvID8gJ2xpbmsnIDogcmVzdC5yb2xlLFxuICAgIHRhYkluZGV4OiB0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleCxcbiAgICBmbG93LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3goeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWJveCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e3sgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSb3coe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLXJvdyR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbHVtbih7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtY29sdW1uJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCBjb2x1bW5zID0gMSwgZ2FwID0gMCwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IHZpZXdwb3J0S2V5IH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSksXG4gICAgZ2FwLFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWdyaWQke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRpbmcoeyBsZXZlbCA9IDIsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHRhZyA9IGBoJHtNYXRoLm1pbig2LCBNYXRoLm1heCgxLCBsZXZlbCkpfWBcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnLCB7IGNsYXNzTmFtZTogYHdmLWhlYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KHsgYXMgPSAncCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7IGNsYXNzTmFtZTogYHdmLXRleHQgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkKHsgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNhcmQgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYWRnZSh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B3Zi1iYWRnZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdmF0YXIoeyBzaXplID0gNDAsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWF2YXRhciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGxhY2Vob2xkZXIoe1xuICB3aWR0aCA9ICcxMDAlJyxcbiAgaGVpZ2h0ID0gMTYwLFxuICBib3JkZXJSYWRpdXMgPSAwLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgc3R5bGUsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1pbWFnZS1wbGFjZWhvbGRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0LCBib3JkZXJSYWRpdXMsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wbGFjZWhvbGRlci1ibG9ja1wiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHsgdG8sIG9uQ2xpY2ssIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYnV0dG9uIHdmLWJ1dHRvbi0ke3ZhcmlhbnR9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRJbnB1dCh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxpbnB1dCBjbGFzc05hbWU9e2B3Zi1pbnB1dCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gdHlwZT1cInRleHRcIiB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRBcmVhKHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHRleHRhcmVhIGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXRleHRhcmVhICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c2VsZWN0IGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXNlbGVjdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NlbGVjdD5cbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHsgdHlwZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtY2hvaWNlICR7Y2xhc3NOYW1lfWAudHJpbSgpfT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtaW5wdXRcIiB0eXBlPXt0eXBlfSB7Li4ucmVzdH0gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNob2ljZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3gocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cImNoZWNrYm94XCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFkaW8ocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cInJhZGlvXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlKHsgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJzd2l0Y2hcIlxuICAgICAgYXJpYS1jaGVja2VkPXtjaGVja2VkfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtdG9nZ2xlICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBvbkNoYW5nZT8uKCFjaGVja2VkLCBldmVudCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdHJhY2tcIj48c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdGh1bWJcIiAvPjwvc3Bhbj5cbiAgICAgIHtsYWJlbCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybUZpZWxkKHsgbGFiZWwsIGh0bWxGb3IsIGhpbnQsIGVycm9yLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZm9ybS1maWVsZCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWZpZWxkLWxhYmVsXCIgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7IENvbHVtbiwgSGVhZGluZywgVGV4dCB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBEZXRhaWxTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPENvbHVtbiBpZD1cImRldGFpbC1wYWdlXCIgY2xhc3NOYW1lPVwiZGV0YWlsLXBhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgIDxIZWFkaW5nIGlkPVwiZGV0YWlsLXRpdGxlXCIgY2xhc3NOYW1lPVwiZGV0YWlsLXBhZ2VfX3RpdGxlXCIgbGV2ZWw9ezF9Plx1OEJFNlx1NjBDNVx1OTg3NTwvSGVhZGluZz5cbiAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRldGFpbC1wYWdlX19kZXNjcmlwdGlvblwiPlx1OEZEOVx1NjYyRlx1NEUwMFx1NEUyQVx1NjcwMFx1NUMwRlx1NUJGQ1x1ODIyQVx1NzZFRVx1NjgwN1x1MzAwMjwvVGV4dD5cbiAgICA8L0NvbHVtbj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7IEJ1dHRvbiwgQ29sdW1uLCBIZWFkaW5nLCBUZXh0IH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhvbWVTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPENvbHVtbiBpZD1cImhvbWUtcGFnZVwiIGNsYXNzTmFtZT1cImhvbWUtcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgPEhlYWRpbmcgaWQ9XCJob21lLXRpdGxlXCIgY2xhc3NOYW1lPVwiaG9tZS1wYWdlX190aXRsZVwiIGxldmVsPXsxfT5cdTdFQkZcdTY4NDZcdTk5OTZcdTk4NzU8L0hlYWRpbmc+XG4gICAgICA8VGV4dCBjbGFzc05hbWU9XCJob21lLXBhZ2VfX2Rlc2NyaXB0aW9uXCI+XHU0RUNFIHNyYy9zY3JlZW5zIFx1NUYwMFx1NTlDQlx1N0YxNlx1OEY5MVx1OTg3NVx1OTc2Mlx1MzAwMjwvVGV4dD5cbiAgICAgIDxCdXR0b24gaWQ9XCJob21lLWRldGFpbC1hY3Rpb25cIiBjbGFzc05hbWU9XCJob21lLXBhZ2VfX2RldGFpbC1hY3Rpb25cIiB0bz1cImRldGFpbFwiPlx1NjdFNVx1NzcwQlx1OEJFNlx1NjBDNTwvQnV0dG9uPlxuICAgIDwvQ29sdW1uPlxuICApXG59XG4iLCAiaW1wb3J0IHsgRGV0YWlsU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2RldGFpbC5qc3gnXG5pbXBvcnQgeyBIb21lU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2hvbWUuanN4J1xuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ1x1NTkxQVx1NUM0Rlx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QicsXG4gIHZpZXdwb3J0czoge1xuICAgIG1vYmlsZTogeyB3aWR0aDogMzc1LCBoZWlnaHQ6IDgxMiB9LFxuICAgIGRlc2t0b3A6IHsgd2lkdGg6IDEyODAsIGhlaWdodDogODAwIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ21vYmlsZScsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ2hvbWUnLFxuICAgICAgdGl0bGU6ICdcdTk5OTZcdTk4NzUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTUxNjVcdTUzRTNcdTk4NzVcdTk3NjInLFxuICAgICAgY29tcG9uZW50OiBIb21lU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWydkZXRhaWwnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2RldGFpbCcsXG4gICAgICB0aXRsZTogJ1x1OEJFNlx1NjBDNScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OEJFNlx1NjBDNVx1OTg3NVx1OTc2MicsXG4gICAgICBjb21wb25lbnQ6IERldGFpbFNjcmVlbixcbiAgICAgIGxpbmtzOiBbXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgXSxcbn1cbiIsICJpbXBvcnQgeyBCb2FyZCB9IGZyb20gJy4uL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vZnJhbWV3b3JrL2xpYi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9qZWN0IH0gZnJvbSAnLi4vZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3ZDLE1BQU07QUFBQSxNQUNOLGFBQWFBLFNBQVE7QUFBQSxNQUNyQixTQUFTO0FBQUEsTUFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLENBQUM7QUFBQSxJQUNaLENBQUM7QUFFRCxVQUFNLFdBQVcsTUFBTSxZQUFZLENBQUMsT0FBTztBQUN6QyxVQUFJLENBQUNBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLE9BQU8sRUFBRSxH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QSxRQUNMLFdBQVcsdUJBQXVCLE9BQU8sSUFBSSxTQUFTLEdBQUcsS0FBSztBQUFBLFFBQzdELEdBQUc7QUFBQSxRQUNILEdBQUc7QUFBQTtBQUFBLE1BRUg7QUFBQSxJQUNIO0FBQUEsRUFFSjs7O0FDUE8sV0FBUyxlQUFlO0FBQzdCLFdBQ0Usb0NBQUMsVUFBTyxJQUFHLGVBQWMsV0FBVSxlQUFjLEtBQUssSUFBSSxPQUFPLEVBQUUsU0FBUyxHQUFHLEtBQzdFLG9DQUFDLFdBQVEsSUFBRyxnQkFBZSxXQUFVLHNCQUFxQixPQUFPLEtBQUcsb0JBQUcsR0FDdkUsb0NBQUMsUUFBSyxXQUFVLDhCQUEyQixvRUFBVyxDQUN4RDtBQUFBLEVBRUo7OztBQ1BPLFdBQVMsYUFBYTtBQUMzQixXQUNFLG9DQUFDLFVBQU8sSUFBRyxhQUFZLFdBQVUsYUFBWSxLQUFLLElBQUksT0FBTyxFQUFFLFNBQVMsR0FBRyxLQUN6RSxvQ0FBQyxXQUFRLElBQUcsY0FBYSxXQUFVLG9CQUFtQixPQUFPLEtBQUcsMEJBQUksR0FDcEUsb0NBQUMsUUFBSyxXQUFVLDRCQUF5QiwrREFBcUIsR0FDOUQsb0NBQUMsVUFBTyxJQUFHLHNCQUFxQixXQUFVLDRCQUEyQixJQUFHLFlBQVMsMEJBQUksQ0FDdkY7QUFBQSxFQUVKOzs7QUNaTyxNQUFNLFVBQVU7QUFBQSxJQUNyQixNQUFNO0FBQUEsSUFDTixXQUFXO0FBQUEsTUFDVCxRQUFRLEVBQUUsT0FBTyxLQUFLLFFBQVEsSUFBSTtBQUFBLE1BQ2xDLFNBQVMsRUFBRSxPQUFPLE1BQU0sUUFBUSxJQUFJO0FBQUEsSUFDdEM7QUFBQSxJQUNBLGlCQUFpQjtBQUFBLElBQ2pCLFNBQVM7QUFBQSxNQUNQO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxPQUFPLENBQUMsUUFBUTtBQUFBLFFBQ2hCLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUM7QUFBQSxRQUNSLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDdkJBLGtCQUFnQixPQUFPO0FBRXZCLFdBQVMsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUU7QUFBQSxJQUNuRCxvQ0FBQyxpQkFBYyxPQUFNLFdBQ25CLG9DQUFDLHFCQUFrQixXQUNqQixvQ0FBQyxTQUFNLFNBQWtCLENBQzNCLENBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJwcm9qZWN0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0Il0KfQo=
