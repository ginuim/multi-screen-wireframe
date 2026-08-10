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
          onReviewSelect: selectReviewElement
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi9zcmMvbGF5b3V0cy9BcHBTaGVsbC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvY29sbGVjdGlvbi5qc3giLCAiLi4vc3JjL3NjcmVlbnMvZW52aXJvbm1lbnRzLmpzeCIsICIuLi9zcmMvc2NyZWVucy9oaXN0b3J5LmpzeCIsICIuLi9zcmMvc2NyZWVucy9yZXF1ZXN0LWVkaXRvci5qc3giLCAiLi4vc3JjL3NjcmVlbnMvc2V0dGluZ3MuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3dvcmtzcGFjZS5qc3giLCAiLi4vc3JjL3Byb2plY3QuanMiLCAiLi4vc3JjL2FwcC5qc3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IFByb3RvdHlwZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBwcm9qZWN0LnNjcmVlbnNbMF0uaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByb3RvdHlwZVByb3ZpZGVyKHsgcHJvamVjdCwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBpbml0aWFsU2NyZWVuSWQgPSBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdClcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZSh7XG4gICAgbW9kZTogJ2NhbnZhcycsXG4gICAgdmlld3BvcnRLZXk6IHByb2plY3QuZGVmYXVsdFZpZXdwb3J0LFxuICAgIGVudHJ5SWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgfSlcblxuICBjb25zdCBuYXZpZ2F0ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChpZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2lkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKVxuICAgICAgICBpZiAoIXNjcmVlbi5saW5rcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7Y3VycmVudC5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke2lkfVwiYClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBpZCxcbiAgICAgICAgaGlzdG9yeTpcbiAgICAgICAgICBjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWRcbiAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuaGlzdG9yeSwgY3VycmVudC5jdXJyZW50U2NyZWVuSWRdXG4gICAgICAgICAgICA6IGN1cnJlbnQuaGlzdG9yeSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2VsZWN0RW50cnkgPSBSZWFjdC51c2VDYWxsYmFjaygoZW50cnlJZCkgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICAgIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGVudHJ5SWQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IGdvQmFjayA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuaGlzdG9yeVtjdXJyZW50Lmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgICAgIGhpc3Rvcnk6IGN1cnJlbnQuaGlzdG9yeS5zbGljZSgwLCAtMSksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW10pXG5cbiAgY29uc3QgcmVzZXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50LmVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW2luaXRpYWxTY3JlZW5JZF0pXG5cbiAgY29uc3Qgc2V0TW9kZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChtb2RlKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdjYW52YXMnICYmIG1vZGUgIT09ICdkZW1vJykgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1vZGUgXCIke21vZGV9XCJgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGUsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW10pXG5cbiAgLyoqIFx1NzUzQlx1Njc3Rlx1NTNDQ1x1NTFGQlx1NjdEMFx1OTg3NVx1RkYxQVx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQVx1NUU3Nlx1ODQzRFx1NTcyOFx1OEJFNVx1OTg3NSAqL1xuICBjb25zdCBlbnRlckRlbW8gPSBSZWFjdC51c2VDYWxsYmFjaygoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc2NyZWVuSWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtzY3JlZW5JZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGU6ICdkZW1vJyxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogc2NyZWVuSWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNldFZpZXdwb3J0S2V5ID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpZXdwb3J0S2V5KSA9PiB7XG4gICAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCB2aWV3cG9ydEtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB2aWV3cG9ydCBcIiR7dmlld3BvcnRLZXl9XCJgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgdmlld3BvcnRLZXkgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCB2YWx1ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gKHtcbiAgICBtb2RlOiBzdGF0ZS5tb2RlLFxuICAgIHZpZXdwb3J0S2V5OiBzdGF0ZS52aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydDogcHJvamVjdC52aWV3cG9ydHNbc3RhdGUudmlld3BvcnRLZXldLFxuICAgIGVudHJ5SWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5jdXJyZW50U2NyZWVuSWQsXG4gICAgbmF2aWdhdGUsXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIHNldE1vZGUsXG4gICAgZW50ZXJEZW1vLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIGNhbkdvQmFjazogc3RhdGUuaGlzdG9yeS5sZW5ndGggPiAwLFxuICB9KSwgW2VudGVyRGVtbywgZ29CYWNrLCBuYXZpZ2F0ZSwgcHJvamVjdCwgcmVzZXQsIHNlbGVjdEVudHJ5LCBzZXRNb2RlLCBzZXRWaWV3cG9ydEtleSwgc3RhdGVdKVxuXG4gIHJldHVybiA8UHJvdG90eXBlQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PntjaGlsZHJlbn08L1Byb3RvdHlwZUNvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm90b3R5cGUoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KFByb3RvdHlwZUNvbnRleHQpXG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCd1c2VQcm90b3R5cGUgbXVzdCBiZSB1c2VkIGluc2lkZSBQcm90b3R5cGVQcm92aWRlcicpXG4gIHJldHVybiBjb250ZXh0XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNsYW1wU2NhbGUoc2NhbGUpIHtcbiAgcmV0dXJuIE1hdGgubWluKDIsIE1hdGgubWF4KDAuMiwgc2NhbGUpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYxQVx1NjMwOVx1NUJCOVx1NTY2OFx1NTE4NVx1NUJCOVx1NTMzQVx1NjI4QVx1NjU3NFx1OTg3NVx1N0YyOVx1NjUzRVx1NTIzMFx1NUI4Q1x1NjU3NFx1NTNFRlx1ODlDMVx1MzAwMlxuICogY29udGFpbmVyKiBcdTRFM0FcdTUzQkJcdTYzODkgcGFkZGluZyBcdTU0MEVcdTc2ODRcdTUzRUZcdTc1MjhcdTVDM0FcdTVCRjhcdUZGMUJjb250ZW50KiBcdTRFM0FcdTY3MkFcdTdGMjlcdTY1M0VcdTc2ODQgc3RhZ2UgXHU1QkJEXHU5QUQ4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXREZW1vU2NhbGUoY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgY29udGVudFdpZHRoLCBjb250ZW50SGVpZ2h0KSB7XG4gIGlmIChjb250YWluZXJXaWR0aCA8PSAwIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwIHx8IGNvbnRlbnRXaWR0aCA8PSAwIHx8IGNvbnRlbnRIZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIGNsYW1wU2NhbGUoTWF0aC5taW4oY29udGFpbmVyV2lkdGggLyBjb250ZW50V2lkdGgsIGNvbnRhaW5lckhlaWdodCAvIGNvbnRlbnRIZWlnaHQpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1ODlDNlx1NTNFM1x1NTNDQ1x1NTFGQlx1NzZFRVx1NjgwN1x1NjYyRlx1NTQyNlx1NEUzQVx1NUM0Rlx1NTkxNlx1N0E3QVx1NzY3RFx1MzAwMlxuICogXHU3MEI5XHU1NzI4IC53Zi1zY3JlZW4tY2hyb21lXHVGRjA4XHU2ODA3XHU5ODk4XHU2ODBGIC8gXHU1MTg1XHU1QkI5XHVGRjA5XHU1MTg1XHU0RTBEXHU3Qjk3XHU3QTdBXHU3NjdEXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU5MDAwXHU1MUZBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlbW9CbGFua0V4aXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRydWVcbiAgcmV0dXJuICF0YXJnZXQuY2xvc2VzdCgnLndmLXNjcmVlbi1jaHJvbWUnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRDYW52YXNWaWV3cG9ydCgpIHtcbiAgcmV0dXJuIHsgc2NhbGU6IDEsIHBhblg6IDAsIHBhblk6IDAgfVxufVxuXG5jb25zdCBGT0NVU19QQURESU5HID0gNDBcblxuLyoqXG4gKiBcdTc1M0JcdTY3N0YgZm9jdXNcdUZGMUFcdTYyOEFcdTY1NzRcdTU3NTcgc2NyZWVuXHVGRjA4XHU1NDJCIG1ldGFcdUZGMDlcdTc5RkJcdTUyMzBcdTVCQjlcdTU2NjhcdTRFMkRcdTVGQzNcdTMwMDJcbiAqIFx1NEVDNVx1NUY1M1x1NUY1M1x1NTI0RCBzY2FsZSBcdTY1M0VcdTRFMERcdTRFMEJcdTY1RjZcdTdGMjlcdTVDMEZcdUZGMUJcdTRFMERcdTY1M0VcdTU5MjdcdTMwMDJcdTVDM0FcdTVCRjhcdTk3NUVcdTZDRDVcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9jdXNDYW52YXNTY3JlZW4oe1xuICBjb250YWluZXJXaWR0aCxcbiAgY29udGFpbmVySGVpZ2h0LFxuICBzY3JlZW5MZWZ0LFxuICBzY3JlZW5Ub3AsXG4gIHNjcmVlbldpZHRoLFxuICBzY3JlZW5IZWlnaHQsXG4gIGN1cnJlbnRTY2FsZSxcbiAgcGFkZGluZyA9IEZPQ1VTX1BBRERJTkcsXG59KSB7XG4gIGlmIChcbiAgICBjb250YWluZXJXaWR0aCA8PSAwXG4gICAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDBcbiAgICB8fCBzY3JlZW5XaWR0aCA8PSAwXG4gICAgfHwgc2NyZWVuSGVpZ2h0IDw9IDBcbiAgICB8fCAhTnVtYmVyLmlzRmluaXRlKGN1cnJlbnRTY2FsZSlcbiAgKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGF2YWlsV2lkdGggPSBjb250YWluZXJXaWR0aCAtIHBhZGRpbmcgKiAyXG4gIGNvbnN0IGF2YWlsSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgaWYgKGF2YWlsV2lkdGggPD0gMCB8fCBhdmFpbEhlaWdodCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZpdFNjYWxlID0gTWF0aC5taW4oYXZhaWxXaWR0aCAvIHNjcmVlbldpZHRoLCBhdmFpbEhlaWdodCAvIHNjcmVlbkhlaWdodClcbiAgY29uc3Qgc2NhbGUgPSBjbGFtcFNjYWxlKE1hdGgubWluKGN1cnJlbnRTY2FsZSwgZml0U2NhbGUpKVxuICByZXR1cm4ge1xuICAgIHNjYWxlLFxuICAgIHBhblg6IGNvbnRhaW5lcldpZHRoIC8gMiAtIChzY3JlZW5MZWZ0ICsgc2NyZWVuV2lkdGggLyAyKSAqIHNjYWxlLFxuICAgIHBhblk6IGNvbnRhaW5lckhlaWdodCAvIDIgLSAoc2NyZWVuVG9wICsgc2NyZWVuSGVpZ2h0IC8gMikgKiBzY2FsZSxcbiAgfVxufVxuXG4vKipcbiAqIFx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1RkYxQVx1NTNFQVx1NzUyOFx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NTI0RFx1NjIyQVx1ODNCN1x1NzY4NCBzbmFwc2hvdFx1RkYwQ1x1Nzk4MVx1NkI2Mlx1NTcyOCBzZXRTdGF0ZSB1cGRhdGVyIFx1OTFDQ1x1OEJGQiBkcmFnIHJlZlx1MzAwMlxuICogUmVhY3QgMTggXHU0RjFBXHU1NzI4IGVuZFBhbiBcdTZFMDVcdTdBN0EgcmVmIFx1NTQwRVx1OTFDRFx1NjUzRSB1cGRhdGVyXHVGRjFCXHU4QkZCIG51bGwucGFuWCBcdTUzNzMgQm9hcmQgXHU2MkE1XHU5NTE5XHU2ODM5XHU1NkUwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYW5Gcm9tRHJhZ1NuYXBzaG90KHZpZXcsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiB2aWV3XG4gIHJldHVybiB7XG4gICAgLi4udmlldyxcbiAgICBwYW5YOiBzbmFwc2hvdC5wYW5YICsgY2xpZW50WCAtIHNuYXBzaG90LngsXG4gICAgcGFuWTogc25hcHNob3QucGFuWSArIGNsaWVudFkgLSBzbmFwc2hvdC55LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njcm9sbGFibGVPdmVyZmxvdyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09ICdhdXRvJyB8fCB2YWx1ZSA9PT0gJ3Njcm9sbCcgfHwgdmFsdWUgPT09ICdvdmVybGF5J1xufVxuXG4vKiogXHU1NzI4IHJvb3QgXHU1MTg1XHU1NDExXHU0RTBBXHU2MjdFXHU1M0VGXHU2RURBXHU1MkE4XHU3OTU2XHU1MTQ4XHVGRjA4XHU1NDJCIHJvb3QgXHU4MUVBXHU4RUFCXHVGRjBDXHU1OTgyXHU1QzRGXHU1MTg1XHU1MTg1XHU1QkI5XHU1MzNBXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVBbmNlc3RvcihzdGFydEVsLCByb290RWwpIHtcbiAgbGV0IG5vZGUgPSBzdGFydEVsICYmIHN0YXJ0RWwubm9kZVR5cGUgPT09IDMgPyBzdGFydEVsLnBhcmVudEVsZW1lbnQgOiBzdGFydEVsXG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSlcbiAgICAgIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIG5vZGUuc2Nyb2xsSGVpZ2h0ID4gbm9kZS5jbGllbnRIZWlnaHQgKyAxXG4gICAgICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBub2RlLnNjcm9sbFdpZHRoID4gbm9kZS5jbGllbnRXaWR0aCArIDFcbiAgICAgIGlmIChjYW5ZIHx8IGNhblgpIHJldHVybiBub2RlXG4gICAgfVxuICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IENPTlRFTlRfRFJBR19USFJFU0hPTEQgPSAzXG5cbmZ1bmN0aW9uIGlzRWRpdGFibGVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAhIXRhcmdldC5jbG9zZXN0KCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKVxufVxuXG4vKipcbiAqIFx1NTcyOFx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTE4NVx1NjMwOVx1NEY0Rlx1NjJENlx1NjJGRCBcdTIxOTIgXHU2RURBXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdUZGMDhcdTUzRUZcdTRFQTRcdTRFOTJcdTUxNzNcdTk1RUQgLyBcdTdBN0FcdTY4M0NcdUZGMDlcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1RkYwQ1x1NEVBNFx1N0VEOVx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlx1MzAwMlxuICogXHU4RkQ0XHU1NkRFIG51bGwgXHU4ODY4XHU3OTNBXHU0RTBEXHU1RTk0XHU2M0E1XHU3QkExXHU4QkU1XHU2QjIxIHBvaW50ZXJkb3duXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCByb290RWwsIHsgbG9ja2VkID0gZmFsc2UsIHNjYWxlID0gMSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIG51bGxcbiAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuIG51bGxcbiAgaWYgKCFyb290RWwgfHwgIXJvb3RFbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBpZiAoaXNFZGl0YWJsZVRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBzY3JvbGxhYmxlID0gZmluZFNjcm9sbGFibGVBbmNlc3RvcihldmVudC50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gbnVsbFxuICByZXR1cm4ge1xuICAgIGVsOiBzY3JvbGxhYmxlLFxuICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgc2Nyb2xsTGVmdDogc2Nyb2xsYWJsZS5zY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogc2Nyb2xsYWJsZS5zY3JvbGxUb3AsXG4gICAgc2NhbGU6IHNjYWxlID4gMCA/IHNjYWxlIDogMSxcbiAgICBtb3ZlZDogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpIHtcbiAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGR4ID0gKGV2ZW50LmNsaWVudFggLSBzdGF0ZS5zdGFydFgpIC8gc3RhdGUuc2NhbGVcbiAgY29uc3QgZHkgPSAoZXZlbnQuY2xpZW50WSAtIHN0YXRlLnN0YXJ0WSkgLyBzdGF0ZS5zY2FsZVxuICBpZiAoIXN0YXRlLm1vdmVkICYmIChNYXRoLmFicyhkeCkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEIHx8IE1hdGguYWJzKGR5KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQpKSB7XG4gICAgc3RhdGUubW92ZWQgPSB0cnVlXG4gIH1cbiAgc3RhdGUuZWwuc2Nyb2xsTGVmdCA9IHN0YXRlLnNjcm9sbExlZnQgLSBkeFxuICBzdGF0ZS5lbC5zY3JvbGxUb3AgPSBzdGF0ZS5zY3JvbGxUb3AgLSBkeVxuICByZXR1cm4gc3RhdGVcbn1cblxuLyoqIFx1NjJENlx1NjJGRFx1OEQ4NVx1OEZDN1x1OTYwOFx1NTAzQ1x1NTQwRVx1NTQxRVx1NjM4OVx1OTY4Rlx1NTQwRVx1NzY4NCBjbGlja1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1ODlFNlx1OERGM1x1OEY2QyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZENvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCByb290RWwpIHtcbiAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUubW92ZWQgfHwgIXJvb3RFbCkgcmV0dXJuXG4gIGNvbnN0IHByZXZlbnRDbGljayA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJvb3RFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbiAgfVxuICByb290RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG59XG5cbi8qKiBcdThCRTVcdTY1QjlcdTU0MTFcdTY2MkZcdTU0MjZcdThGRDhcdTgwRkRcdTdFRTdcdTdFRURcdTZFREEgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5TY3JvbGxJbkRpcmVjdGlvbihlbCwgZGVsdGFYLCBkZWx0YVkpIHtcbiAgY29uc3QgZXBzID0gMVxuICBpZiAoZGVsdGFZKSB7XG4gICAgY29uc3QgbWF4WSA9IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodFxuICAgIGlmIChtYXhZID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFZIDwgMCAmJiBlbC5zY3JvbGxUb3AgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFZID4gMCAmJiBlbC5zY3JvbGxUb3AgPCBtYXhZIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICBpZiAoZGVsdGFYKSB7XG4gICAgY29uc3QgbWF4WCA9IGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGhcbiAgICBpZiAobWF4WCA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWCA8IDAgJiYgZWwuc2Nyb2xsTGVmdCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVggPiAwICYmIGVsLnNjcm9sbExlZnQgPCBtYXhYIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFRkJcdTYxMEZcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTRFQzUgQ3RybC9NZXRhICsgXHU2RURBXHU4RjZFXG4gKlx1RkYwOFx1ODlFNlx1NjNBN1x1Njc3RiBwaW5jaCBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTkxQ0NcdTkwMUFcdTVFMzhcdTVFMjYgY3RybEtleVx1RkYwOVx1MzAwMlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NjY2RVx1OTAxQVx1NkVEQVx1OEY2RVx1NzU1OVx1N0VEOVx1NUM0Rlx1NTE4NVx1NkVEQVx1NTJBOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckVudHJ5SWQoc2NyZWVucykge1xuICByZXR1cm4gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbW9TdGF0ZShzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5SWQgPSBpbmZlckVudHJ5SWQoc2NyZWVucylcbiAgaWYgKCFlbnRyeUlkKSB0aHJvdyBuZXcgRXJyb3IoJ0RlbW8gbW9kZSByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZW50cnkgc2NyZWVuJylcbiAgcmV0dXJuIHtcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXZpZ2F0ZURlbW8oc3RhdGUsIHRhcmdldElkLCBzY3JlZW5zKSB7XG4gIGlmICghc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gdGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7dGFyZ2V0SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICB9XG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpXG4gIGlmICghY3VycmVudFNjcmVlbi5saW5rcy5pbmNsdWRlcyh0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7c3RhdGUuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHt0YXJnZXRJZH1cImApXG4gIH1cbiAgaWYgKHRhcmdldElkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpIHJldHVybiBzdGF0ZVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogdGFyZ2V0SWQsXG4gICAgaGlzdG9yeTogWy4uLnN0YXRlLmhpc3RvcnksIHN0YXRlLmN1cnJlbnRTY3JlZW5JZF0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdERlbW9FbnRyeShzdGF0ZSwgZW50cnlJZCwgc2NyZWVucykge1xuICBjb25zdCBlbnRyeSA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdvQmFja0RlbW8oc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgaGlzdG9yeSA9IHN0YXRlLmhpc3Rvcnkuc2xpY2UoMCwgLTEpXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5oaXN0b3J5W3N0YXRlLmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgaGlzdG9yeSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZW1vKHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwgfVxuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgIHJldHVybiB7IGVycm9yIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCBpbmZvKSB7XG4gICAgY29uc29sZS5lcnJvcihgW3dpcmVmcmFtZToke3RoaXMucHJvcHMuc2NvcGUgfHwgJ3Vua25vd24nfV1gLCBlcnJvciwgaW5mbylcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgJiYgcHJldmlvdXNQcm9wcy5yZXNldEtleSAhPT0gdGhpcy5wcm9wcy5yZXNldEtleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5lcnJvcikgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICBjb25zdCB7IHNjcmVlbklkLCBzb3VyY2UsIHNjb3BlIH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZXJyb3ItY2FyZFwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICA8c3Ryb25nPntzY29wZSA9PT0gJ3NjcmVlbicgPyBgU2NyZWVuOiAke3NjcmVlbklkfWAgOiAnQm9hcmQgZXJyb3InfTwvc3Ryb25nPlxuICAgICAgICB7c291cmNlID8gPHNwYW4+U291cmNlOiB7c291cmNlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8c3Bhbj5NZXNzYWdlOiB7dGhpcy5zdGF0ZS5lcnJvci5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPHByZT57dGhpcy5zdGF0ZS5lcnJvci5zdGFja308L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuIiwgImNvbnN0IFNjcmVlbklkZW50aXR5Q29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbklkZW50aXR5UHJvdmlkZXIoeyBzY3JlZW5JZCwgY2hpbGRyZW4gfSkge1xuICBpZiAoIXNjcmVlbklkKSB0aHJvdyBuZXcgRXJyb3IoJ1NjcmVlbklkZW50aXR5UHJvdmlkZXIgcmVxdWlyZXMgc2NyZWVuSWQnKVxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NjcmVlbklkfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1NjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2NyZWVuSWQoKSB7XG4gIGNvbnN0IHNjcmVlbklkID0gUmVhY3QudXNlQ29udGV4dChTY3JlZW5JZGVudGl0eUNvbnRleHQpXG4gIGlmICghc2NyZWVuSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZVNjcmVlbklkIG11c3QgYmUgdXNlZCBpbnNpZGUgYSByZW5kZXJlZCBzY3JlZW4nKVxuICB9XG4gIHJldHVybiBzY3JlZW5JZFxufVxuIiwgIi8qKlxuICogXHU3MEVEXHU1MzNBXHU0RTBFXHU4REYzXHU4RjZDXHU3Njg0XHU1NTJGXHU0RTAwXHU1OTUxXHU3RUE2XHVGRjFBXHU1MTQzXHU3RDIwXHU1RTI2IGRhdGEtZmxvdy10byBcdTUzNzNcdTUzRUZcdTVCRkNcdTgyMkFcdTMwMDJcbiAqIFNjcmVlbkZyYW1lIFx1NTlENFx1NjI1OFx1NzBCOVx1NTFGQlx1NTE1Q1x1NUU5NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUxQVx1NTJBMVx1NTE5OVx1NjIxMFx1ODhGOCBzcGFuL2RpdiBcdTUzRUFcdTY3MDlcdTVDNUVcdTYwMjdcdTMwMDFcdTZDQTFcdTY3MDkgb25DbGlja1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290RWwpIHtcbiAgaWYgKCFzdGFydEVsIHx8IHR5cGVvZiBzdGFydEVsLmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsXG4gIGNvbnN0IGVsID0gc3RhcnRFbC5jbG9zZXN0KCdbZGF0YS1mbG93LXRvXScpXG4gIGlmICghZWwpIHJldHVybiBudWxsXG4gIGlmIChyb290RWwgJiYgdHlwZW9mIHJvb3RFbC5jb250YWlucyA9PT0gJ2Z1bmN0aW9uJyAmJiAhcm9vdEVsLmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcbiAgY29uc3QgdG8gPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxvdy10bycpXG4gIHJldHVybiB0byB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIHJvb3RFbCwgbmF2aWdhdGUpIHtcbiAgY29uc3QgdG8gPSBmaW5kRmxvd1RhcmdldElkKGV2ZW50Py50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCF0bykgcmV0dXJuIGZhbHNlXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gIG5hdmlnYXRlKHRvKVxuICByZXR1cm4gdHJ1ZVxufVxuIiwgImNvbnN0IFRZUEVfTEFCRUxTID0ge1xuICBjb21tZW50OiAnXHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJyxcbiAgdGV4dDogJ1x1NEZFRVx1NjUzOVx1NjU4N1x1NUI1NycsXG4gIG9yZGVyOiAnXHU4QzAzXHU2NTc0XHU5ODdBXHU1RThGJyxcbiAgcmVtb3ZlOiAnXHU1MjIwXHU5NjY0XHU4MjgyXHU3MEI5Jyxcbn1cblxuZnVuY3Rpb24gZXNjYXBlU2VsZWN0b3JUb2tlbih2YWx1ZSkge1xuICBpZiAoZ2xvYmFsVGhpcy5DU1M/LmVzY2FwZSkgcmV0dXJuIGdsb2JhbFRoaXMuQ1NTLmVzY2FwZShTdHJpbmcodmFsdWUpKVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAoY2hhcikgPT4gYFxcXFwke2NoYXJ9YClcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cmlidXRlVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbn1cblxuZnVuY3Rpb24gY2xhc3Nlc09mKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50Py5jbGFzc0xpc3QpIHJldHVybiBbXVxuICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNsYXNzTGlzdCkuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQ2xhc3NOYW1lKG5hbWUpIHtcbiAgcmV0dXJuICEhbmFtZSAmJiAhbmFtZS5zdGFydHNXaXRoKCd3Zi0nKSAmJiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKVxufVxuXG5mdW5jdGlvbiBzZWxlY3RvclNjb3BlKHNjcmVlbklkKSB7XG4gIHJldHVybiBgW2RhdGEtc2NyZWVuLWlkPVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShzY3JlZW5JZCl9XCJdYFxufVxuXG5mdW5jdGlvbiBzZWxlY3RvcklzVW5pcXVlKHNjcmVlblJvb3QsIHNlbGVjdG9yKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjcmVlblJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoID09PSAxXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpIHtcbiAgY29uc3QgdGFnID0gKGVsZW1lbnQudGFnTmFtZSB8fCAnZGl2JykudG9Mb3dlckNhc2UoKVxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlcy5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcbiAgY29uc3QgdXNhYmxlID0gYnVzaW5lc3MubGVuZ3RoID4gMCA/IGJ1c2luZXNzIDogY2xhc3Nlcy5maWx0ZXIoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICBjb25zdCBjbGFzc1BhcnQgPSB1c2FibGUuc2xpY2UoMCwgMikubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICByZXR1cm4gYCR7dGFnfSR7Y2xhc3NQYXJ0fSR7a2V5UGFydH1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW5JZCkge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW5JZCkgcmV0dXJuICcnXG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oZWxlbWVudC5pZCl9YFxuXG4gIGNvbnN0IHNjb3BlID0gc2VsZWN0b3JTY29wZShzY3JlZW5JZClcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzT2YoZWxlbWVudCkuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG5cbiAgZm9yIChjb25zdCBuYW1lIG9mIGJ1c2luZXNzKSB7XG4gICAgY29uc3QgbG9jYWwgPSBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX0ke2tleVBhcnR9YFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBpZiAoYnVzaW5lc3MubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGxvY2FsID0gYnVzaW5lc3MubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKSArIGtleVBhcnRcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdChgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihjdXJyZW50LmlkKX1gKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgbGV0IHNlZ21lbnQgPSBlbGVtZW50U2VnbWVudChjdXJyZW50KVxuICAgIGNvbnN0IHBhcmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgICAgY29uc3QgcGVlcnMgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKFxuICAgICAgICAoaXRlbSkgPT4gaXRlbS50YWdOYW1lID09PSBjdXJyZW50LnRhZ05hbWUgJiYgZWxlbWVudFNlZ21lbnQoaXRlbSkgPT09IHNlZ21lbnQsXG4gICAgICApXG4gICAgICBpZiAocGVlcnMubGVuZ3RoID4gMSkgc2VnbWVudCArPSBgOm50aC1vZi10eXBlKCR7cGVlcnMuaW5kZXhPZihjdXJyZW50KSArIDF9KWBcbiAgICB9XG4gICAgc2VnbWVudHMudW5zaGlmdChzZWdtZW50KVxuICAgIGNvbnN0IGxvY2FsID0gc2VnbWVudHMuam9pbignID4gJylcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICAgIGN1cnJlbnQgPSBwYXJlbnRcbiAgfVxuXG4gIHJldHVybiBgJHtzY29wZX0gJHtzZWdtZW50cy5qb2luKCcgPiAnKSB8fCBlbGVtZW50U2VnbWVudChlbGVtZW50KX1gXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlMYWJlbChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VsZW1lbnQuaWR9YFxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IHNlbWFudGljID0gY2xhc3Nlcy5maW5kKGlzQnVzaW5lc3NDbGFzc05hbWUpIHx8IGNsYXNzZXMuZmluZCgobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIHJldHVybiBzZW1hbnRpYyA/IGAuJHtzZW1hbnRpY31gIDogKGVsZW1lbnQudGFnTmFtZSB8fCAnbm9kZScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gcmVhZFRleHQoZWxlbWVudCkge1xuICBjb25zdCB2YWx1ZSA9ICd2YWx1ZScgaW4gZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICA/IGVsZW1lbnQudmFsdWVcbiAgICA6IGVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbiAgcmV0dXJuIG5vcm1hbGl6ZWQubGVuZ3RoID4gMjQwID8gYCR7bm9ybWFsaXplZC5zbGljZSgwLCAyMzcpfS4uLmAgOiBub3JtYWxpemVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUmV2aWV3VGFyZ2V0KHRhcmdldCwgY29udGVudFJvb3QpIHtcbiAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ/Lm5vZGVUeXBlID09PSAxID8gdGFyZ2V0IDogdGFyZ2V0Py5wYXJlbnRFbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQgfHwgY2xhc3Nlc09mKGN1cnJlbnQpLmxlbmd0aCA+IDApIHJldHVybiBjdXJyZW50XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbikge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW4pIHJldHVybiBudWxsXG4gIGNvbnN0IGFuY2VzdG9ycyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGFuY2VzdG9ycy51bnNoaWZ0KHtcbiAgICAgIGVsZW1lbnQ6IGN1cnJlbnQsXG4gICAgICBsYWJlbDogZGlzcGxheUxhYmVsKGN1cnJlbnQpLFxuICAgICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoY3VycmVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgfSlcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQsXG4gICAgY29udGVudFJvb3QsXG4gICAgc2NyZWVuSWQ6IHNjcmVlbi5pZCxcbiAgICBzY3JlZW5UaXRsZTogc2NyZWVuLnRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YCxcbiAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB0YWdOYW1lOiAoZWxlbWVudC50YWdOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLFxuICAgIGNsYXNzTmFtZXM6IGNsYXNzZXNPZihlbGVtZW50KSxcbiAgICBjdXJyZW50VGV4dDogcmVhZFRleHQoZWxlbWVudCksXG4gICAgYW5jZXN0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZW1SZXF1ZXN0KGl0ZW0pIHtcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gYFx1NEZFRVx1NjUzOVx1NEUzQVx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdvcmRlcicpIHJldHVybiBgXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3JlbW92ZScpIHJldHVybiBgXHU1MjIwXHU5NjY0XHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfWBcbiAgcmV0dXJuIGl0ZW0uaW5zdHJ1Y3Rpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldmlld1RhcmdldHMoaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVtPy50YXJnZXRzKSAmJiBpdGVtLnRhcmdldHMubGVuZ3RoID4gMCkgcmV0dXJuIGl0ZW0udGFyZ2V0c1xuICBpZiAoIWl0ZW0/LnNlbGVjdG9yKSByZXR1cm4gW11cbiAgcmV0dXJuIFt7XG4gICAgc2NyZWVuSWQ6IGl0ZW0uc2NyZWVuSWQsXG4gICAgc2NyZWVuVGl0bGU6IGl0ZW0uc2NyZWVuVGl0bGUsXG4gICAgc291cmNlSGludDogaXRlbS5zb3VyY2VIaW50LFxuICAgIHNlbGVjdG9yOiBpdGVtLnNlbGVjdG9yLFxuICAgIGN1cnJlbnRUZXh0OiBpdGVtLmN1cnJlbnRUZXh0LFxuICB9XVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpIHtcbiAgY29uc3QgcHJvamVjdE5hbWUgPSBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInXG5cbiAgY29uc3QgbGluZXMgPSBbXG4gICAgYFx1OEJGN1x1NEZFRVx1NjUzOVx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4Qlx1MzAwQyR7cHJvamVjdE5hbWV9XHUzMDBEXHUzMDAyYCxcbiAgICAnJyxcbiAgICAnXHU0RkVFXHU2NTM5XHU3RUE2XHU2NzVGXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdTRGRUVcdTY1MzlcdTRFMUFcdTUyQTEgc3JjL1x1RkYxQlx1NEUwRFx1ODk4MVx1NEZFRVx1NjUzOSBmcmFtZXdvcmsvIFx1NjIxNiBkaXN0L2FwcC5qc1x1MzAwMicsXG4gICAgJy0gXHU5MDFBXHU4RkM3IERPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdTU3MjggSlNYIFx1NEUyRFx1NjQxQ1x1N0QyMlx1NUJGOVx1NUU5NFx1NzY4NCBpZFx1MzAwMWNsYXNzTmFtZSBcdTYyMTYgZGF0YS13Zi1rZXlcdTMwMDInLFxuICAgICctIFx1NEZERFx1NzU1OVx1NjI0MFx1NjcwOVx1OEJFRFx1NEU0OSBjbGFzc1x1MzAwMVx1NTE3M1x1OTUyRVx1ODI4Mlx1NzBCOSBpZCBcdTU0OENcdTkxQ0RcdTU5MERcdTY1NzBcdTYzNkVcdTgyODJcdTcwQjlcdTc2ODQgZGF0YS13Zi1rZXlcdUZGMUJcdTY1QjBcdTU4OUVcdTgyODJcdTcwQjlcdTRFNUZcdTkwNzVcdTVCODhcdTU0MENcdTRFMDBcdTU0N0RcdTU0MERcdTg5QzRcdTUyMTlcdTMwMDInLFxuICAgICctIFx1NEZFRVx1NjUzOSBzY3JlZW5zL2xheW91dHMgXHU2NUY2XHU0RkREXHU3NTU5XHUzMDBDXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFXHUzMDBEXHVGRjBDXHU1RTc2XHU2MjhBXHUzMDBDXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFXHUzMDBEXHU1M0NBIEB3aXJlZnJhbWUtc2tpbGwgXHU2NkY0XHU2NUIwXHU0RTNBXHU1RjUzXHU1MjREIHNraWxsIFx1NzI0OFx1NjcyQ1x1MzAwMicsXG4gICAgJy0gXHU0RkREXHU2MzAxIHByb2plY3QubGlua3MgXHU0RTNBXHU5ODc1XHU5NzYyXHU2RDQxXHU3Njg0XHU1NTJGXHU0RTAwXHU4RkI5XHU2NTcwXHU2MzZFXHVGRjFCXHU1QjhDXHU2MjEwXHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU1RTc2XHU5QThDXHU4QkMxXHU3NTNCXHU2NzdGXHUzMDAxXHU2RjE0XHU3OTNBXHU1NDhDXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGXHUzMDAyJyxcbiAgXVxuXG4gIGlmICghaXRlbXM/Lmxlbmd0aCkge1xuICAgIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDInKVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJldmlld1RhcmdldHMoaXRlbSlcbiAgICBsaW5lcy5wdXNoKCcnLCBgIyMgXHU0RkVFXHU2NTM5ICR7aXRlbUluZGV4ICsgMX1cdUZGMUEke1RZUEVfTEFCRUxTW2l0ZW0udHlwZV0gfHwgVFlQRV9MQUJFTFMuY29tbWVudH1gKVxuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2NyZWVuSWQgPSB0YXJnZXQuc2NyZWVuSWQgfHwgaXRlbS5zY3JlZW5JZFxuICAgICAgbGluZXMucHVzaChcbiAgICAgICAgJycsXG4gICAgICAgIGBcdTc2RUVcdTY4MDcgJHt0YXJnZXRJbmRleCArIDF9XHVGRjFBJHt0YXJnZXQuc2NyZWVuVGl0bGUgfHwgaXRlbS5zY3JlZW5UaXRsZSB8fCBzY3JlZW5JZCB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU5ODc1XHU5NzYyJ31gLFxuICAgICAgICBgXHU5ODc1XHU5NzYyIElEXHVGRjFBJHtzY3JlZW5JZCB8fCAnXHU2NzJBXHU3N0U1J31gLFxuICAgICAgICBgXHU2RTkwXHU3ODAxXHU2M0QwXHU3OTNBXHVGRjFBJHt0YXJnZXQuc291cmNlSGludCB8fCBpdGVtLnNvdXJjZUhpbnQgfHwgKHNjcmVlbklkID8gYHNyYy9zY3JlZW5zLyR7c2NyZWVuSWR9LmpzeGAgOiAnXHU4QkY3XHU2NDFDXHU3RDIyXHU5MDA5XHU2MkU5XHU1NjY4Jyl9YCxcbiAgICAgICAgJ0RPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdUZGMUEnLFxuICAgICAgICBgXFxgJHt0YXJnZXQuc2VsZWN0b3J9XFxgYCxcbiAgICAgIClcbiAgICAgIGlmICh0YXJnZXQuY3VycmVudFRleHQpIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjlcdUZGMUEnLCB0YXJnZXQuY3VycmVudFRleHQpXG4gICAgfSlcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU0RkVFXHU2NTM5XHU4OTgxXHU2QzQyXHVGRjFBJywgaXRlbVJlcXVlc3QoaXRlbSkpXG4gIH0pXG5cbiAgbGluZXMucHVzaChcbiAgICAnJyxcbiAgICAnIyMgXHU1QjhDXHU2MjEwXHU2ODA3XHU1MUM2JyxcbiAgICAnLSBcdTkwMTBcdTk4NzlcdTVCOENcdTYyMTBcdTRFRTVcdTRFMEFcdTRGRUVcdTY1MzlcdUZGMUJcdTgyRTVcdTkwMDlcdTYyRTlcdTU2NjhcdTVCRjlcdTVFOTRcdTUxNzFcdTRFQUIgbGF5b3V0XHVGRjBDXHU4QkY3XHU0RkVFXHU2NTM5XHU3NzFGXHU1QjlFXHU1QjlBXHU0RTQ5XHU0RjREXHU3RjZFXHVGRjBDXHU0RTBEXHU4OTgxXHU1NzI4IHNjcmVlbiBcdTRFMkRcdTU5MERcdTUyMzZcdTVCOUVcdTczQjBcdTMwMDInLFxuICAgICctIFx1NEUwRFx1NzUyOCBET00gXHU1QzQyXHU3RUE3XHU2MjE2IG50aC1jaGlsZCBcdTY2RkZcdTRFRTNcdTVERjJcdTY3MDlcdTc2ODRcdTdBMzNcdTVCOUFcdTRFMUFcdTUyQTFcdTkwMDlcdTYyRTlcdTU2NjhcdTMwMDInLFxuICAgICctIFx1Njc4NFx1NUVGQVx1NjIxMFx1NTI5Rlx1NTQwRVx1NjhDMFx1NjdFNVx1NTNEN1x1NUY3MVx1NTRDRFx1OTg3NVx1OTc2Mlx1NTNDQVx1NTE3Nlx1NEUwQVx1NEUwQlx1NkUzOFx1OERGM1x1OEY2Q1x1MzAwMicsXG4gIClcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCBjb25zdCBSRVZJRVdfVFlQRV9MQUJFTFMgPSBUWVBFX0xBQkVMU1xuIiwgImltcG9ydCB7IGlzU2Nyb2xsYWJsZU92ZXJmbG93IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5jb25zdCBTVFlMRV9LRVlTID0gW1xuICAnd2lkdGgnLFxuICAnaGVpZ2h0JyxcbiAgJ21pbldpZHRoJyxcbiAgJ21pbkhlaWdodCcsXG4gICdvdmVyZmxvdycsXG4gICdvdmVyZmxvd1gnLFxuICAnb3ZlcmZsb3dZJyxcbiAgJ21heFdpZHRoJyxcbiAgJ21heEhlaWdodCcsXG5dXG5cbi8qKiBcdTgyODJcdTcwQjlcdTVGNTNcdTUyNERcdTY2MkZcdTU0MjZcdTU2RTAgb3ZlcmZsb3cgXHU0RUE3XHU3NTFGXHU1M0VGXHU2RURBXHU1MkE4XHU2RUEyXHU1MUZBICovXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKGVsKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZVxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQgKyAxXG4gIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIGVsLnNjcm9sbFdpZHRoID4gZWwuY2xpZW50V2lkdGggKyAxXG4gIHJldHVybiBjYW5ZIHx8IGNhblhcbn1cblxuZnVuY3Rpb24gZGVwdGhGcm9tKHJvb3RFbCwgZWwpIHtcbiAgbGV0IGRlcHRoID0gMFxuICBsZXQgbm9kZSA9IGVsXG4gIHdoaWxlIChub2RlICYmIG5vZGUgIT09IHJvb3RFbCkge1xuICAgIGRlcHRoICs9IDFcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIGRlcHRoXG59XG5cbi8qKlxuICogXHU2NTM2XHU5NkM2XHU5NzAwXHU2NDkxXHU1RjAwXHU3Njg0XHU4MjgyXHU3MEI5XHVGRjFBXHU1M0VGXHU2RURBXHU1MkE4XHU4MjgyXHU3MEI5ICsgXHU0RTBBXHU2RUFGXHU1MjMwIHJvb3QgXHU3Njg0XHU3OTU2XHU1MTQ4XHUzMDAyXG4gKiBcdTZERjFcdTgyODJcdTcwQjlcdTU3MjhcdTUyNERcdUZGMENcdTUxNDhcdTY0OTFcdTUxODVcdTVDNDJcdTUxOERcdTY0OTFcdTU5MTZcdTU4RjNcdUZGMDhcdTkwN0ZcdTUxNEQgZ3JpZCAvIHdpZHRoOjEwMCUgXHU2MjhBXHU1OTE2XHU2ODQ2XHU1MzYxXHU2QjdCXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbCkge1xuICBpZiAoIXJvb3RFbCkgcmV0dXJuIFtdXG4gIGNvbnN0IHNjcm9sbGFibGVzID0gW11cbiAgY29uc3QgdmlzaXQgPSAobm9kZSkgPT4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiA/IEFycmF5LmZyb20obm9kZS5jaGlsZHJlbikgOiBbXVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHZpc2l0KGNoaWxkKVxuICAgIGlmIChub2RlID09PSByb290RWwgfHwgaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKG5vZGUpKSBzY3JvbGxhYmxlcy5wdXNoKG5vZGUpXG4gIH1cbiAgdmlzaXQocm9vdEVsKVxuXG4gIGNvbnN0IHNldCA9IG5ldyBTZXQoc2Nyb2xsYWJsZXMpXG4gIGZvciAoY29uc3QgZWwgb2Ygc2Nyb2xsYWJsZXMpIHtcbiAgICAvLyByb290IFx1NjcyQ1x1OEVBQlx1NURGMlx1NTcyOFx1OTZDNlx1NTQwOFx1NEUyRFx1RkYxQlx1NEVDRVx1NUI4M1x1NzY4NFx1NzIzNlx1ODI4Mlx1NzBCOVx1N0VFN1x1N0VFRFx1NEUwQVx1NkVBRlx1NEYxQVx1OEQ4QVx1OEZDNyBzY3JlZW4gXHU4RkI5XHU3NTRDXHVGRjBDXG4gICAgLy8gXHU2MjhBIFNjcmVlbkZyYW1lXHUzMDAxY2FudmFzXHUzMDAxYm9hcmQgXHU3NTFBXHU4MUYzIGJvZHkvaHRtbCBcdTRFMDBcdTVFNzZcdTY1MzlcdTUxOTlcdTMwMDJcbiAgICBpZiAoZWwgPT09IHJvb3RFbCkgY29udGludWVcbiAgICBsZXQgbm9kZSA9IGVsLnBhcmVudEVsZW1lbnRcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgc2V0LmFkZChub2RlKVxuICAgICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnNldF0uc29ydCgoYSwgYikgPT4gZGVwdGhGcm9tKHJvb3RFbCwgYikgLSBkZXB0aEZyb20ocm9vdEVsLCBhKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNuYXBzaG90SW5saW5lQm94KGVsKSB7XG4gIGNvbnN0IG91dCA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIG91dFtrZXldID0gZWwuc3R5bGVba2V5XSB8fCAnJ1xuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlSW5saW5lQm94KGVsLCBzbmFwc2hvdCkge1xuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSB7XG4gICAgZWwuc3R5bGVba2V5XSA9IHNuYXBzaG90W2tleV0gfHwgJydcbiAgfVxufVxuXG4vKipcbiAqIG9mZnNldFRvcCAvIG9mZnNldExlZnQgXHU3NkY4XHU1QkY5IG9mZnNldFBhcmVudFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NEUwMFx1NUI5QVx1NzZGOFx1NUJGOVx1NzZGNFx1NjNBNVx1NzIzNlx1ODI4Mlx1NzBCOVx1MzAwMlxuICogXHU1NDBFXHU1M0YwXHU5ODc1XHU5MUNDXHU4RkRFXHU3RUVEXHU3Njg0IHN0YXRpYyBcdTVCQjlcdTU2NjhcdTkwMUFcdTVFMzhcdTUxNzFcdTRFQUIgc2NyZWVuIHJvb3QgXHU0RjVDXHU0RTNBIG9mZnNldFBhcmVudFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU5NzAwXHU4OTgxXHU1MTQ4XHU2MzYyXHU3Qjk3XHU1MjMwXHU1RjUzXHU1MjREXHU3MjM2XHU4MjgyXHU3MEI5XHU1NzUwXHU2ODA3XHVGRjBDXHU5MDdGXHU1MTREXHU5MDEwXHU1QzQyXHU5MUNEXHU1OTBEXHU3RDJGXHU1MkEwXHU1NDBDXHU0RTAwXHU2QkI1XHU1MDRGXHU3OUZCXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCBheGlzKSB7XG4gIGNvbnN0IG9mZnNldEtleSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnXG4gIGNvbnN0IHJlY3RTdGFydCA9IGF4aXMgPT09ICd4JyA/ICdsZWZ0JyA6ICd0b3AnXG4gIGNvbnN0IHJlY3RTaXplID0gYXhpcyA9PT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIGNvbnN0IGxheW91dFNpemUgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcbiAgY29uc3Qgc2Nyb2xsS2V5ID0gYXhpcyA9PT0gJ3gnID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCdcbiAgY29uc3QgY2hpbGRPZmZzZXQgPSBjaGlsZFtvZmZzZXRLZXldIHx8IDBcblxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbCkgcmV0dXJuIGNoaWxkT2Zmc2V0XG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgJiYgY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbC5vZmZzZXRQYXJlbnQpIHtcbiAgICByZXR1cm4gY2hpbGRPZmZzZXQgLSAoZWxbb2Zmc2V0S2V5XSB8fCAwKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgcGFyZW50UmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY2hpbGRSZWN0ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCByZW5kZXJlZFNpemUgPSBwYXJlbnRSZWN0W3JlY3RTaXplXVxuICAgIGNvbnN0IHNjYWxlID0gZWxbbGF5b3V0U2l6ZV0gPiAwICYmIHJlbmRlcmVkU2l6ZSA+IDBcbiAgICAgID8gcmVuZGVyZWRTaXplIC8gZWxbbGF5b3V0U2l6ZV1cbiAgICAgIDogMVxuICAgIGNvbnN0IHN0YXJ0ID0gKGNoaWxkUmVjdFtyZWN0U3RhcnRdIC0gcGFyZW50UmVjdFtyZWN0U3RhcnRdKSAvIHNjYWxlXG4gICAgICArIChlbFtzY3JvbGxLZXldIHx8IDApXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShzdGFydCkpIHJldHVybiBzdGFydFxuICB9XG5cbiAgcmV0dXJuIGNoaWxkT2Zmc2V0XG59XG5cbi8qKlxuICogb3ZlcmZsb3c6dmlzaWJsZSBcdTY1RjZcdTkwRThcdTUyMDZcdTZENEZcdTg5QzhcdTU2Njggc2Nyb2xsV2lkdGggXHUyMjQ4IGNsaWVudFdpZHRoXHVGRjBDXG4gKiBcdTYyNDBcdTRFRTVcdTUxOERcdTYyNkJcdTVCNTBcdTgyODJcdTcwQjkgb2Zmc2V0IFx1OEZCOVx1NzU0Q1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRFx1ODg2OFx1NjQ5MVx1NEUwRFx1NUYwMFx1NTkxNlx1Njg0Nlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUludHJpbnNpY0JveChlbCkge1xuICBsZXQgd2lkdGggPSBNYXRoLm1heChlbC5zY3JvbGxXaWR0aCB8fCAwLCBlbC5vZmZzZXRXaWR0aCB8fCAwKVxuICBsZXQgaGVpZ2h0ID0gTWF0aC5tYXgoZWwuc2Nyb2xsSGVpZ2h0IHx8IDAsIGVsLm9mZnNldEhlaWdodCB8fCAwKVxuICBjb25zdCBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuID8gQXJyYXkuZnJvbShlbC5jaGlsZHJlbikgOiBbXVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd4JykgKyAoY2hpbGQub2Zmc2V0V2lkdGggfHwgMCkpXG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3knKSArIChjaGlsZC5vZmZzZXRIZWlnaHQgfHwgMCkpXG4gIH1cbiAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUV4cGFuZGVkQm94KGVsKSB7XG4gIGVsLnN0eWxlLm1heFdpZHRoID0gJ25vbmUnXG4gIGVsLnN0eWxlLm1heEhlaWdodCA9ICdub25lJ1xuICBlbC5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1ggPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dZID0gJ3Zpc2libGUnXG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWVhc3VyZUludHJpbnNpY0JveChlbClcbiAgZWwuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICBlbC5zdHlsZS5taW5XaWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5taW5IZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG59XG5cbi8qKiBcdTY0OTFcdTVGMDAgcm9vdCBcdTUxODVcdTYyNDBcdTY3MDlcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUzQ0FcdTUxNzZcdTc5NTZcdTUxNDhcdUZGMUJcdThGRDRcdTU2REVcdTc1MjhcdTRFOEVcdTY1MzZcdThENzdcdTc2ODRcdTVGRUJcdTcxNjdcdTUyMTdcdTg4NjggKi9cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmRTY3JlZW5Db250ZW50KHJvb3RFbCkge1xuICBjb25zdCBub2RlcyA9IGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKVxuICBjb25zdCBzbmFwc2hvdHMgPSBub2Rlcy5tYXAoKGVsKSA9PiAoeyBlbCwgc3R5bGU6IHNuYXBzaG90SW5saW5lQm94KGVsKSB9KSlcbiAgZm9yIChjb25zdCB7IGVsIH0gb2Ygc25hcHNob3RzKSBhcHBseUV4cGFuZGVkQm94KGVsKVxuICAvLyBcdTVCNTBcdTdFQTdcdTY0OTFcdTVGMDBcdTU0MEVcdUZGMENcdTY4MzlcdTUxOERcdTkxQ0ZcdTRFMDBcdTZCMjFcdUZGMENcdTU0MDNcdTYzODlcdTZCOEJcdTRGNTlcdTZFQTJcdTUxRkFcbiAgYXBwbHlFeHBhbmRlZEJveChyb290RWwpXG4gIHJldHVybiBzbmFwc2hvdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlU2NyZWVuQ29udGVudChzbmFwc2hvdHMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNuYXBzaG90cykpIHJldHVyblxuICBmb3IgKGNvbnN0IHsgZWwsIHN0eWxlIH0gb2Ygc25hcHNob3RzKSByZXN0b3JlSW5saW5lQm94KGVsLCBzdHlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVDb250ZW50Qm94KHJvb3RFbCkge1xuICByZXR1cm4gbWVhc3VyZUludHJpbnNpY0JveChyb290RWwpXG59XG5cbi8qKlxuICogXHU1REU1XHU1MTc3XHU2ODBGXHU1QzU1XHU1RjAwL1x1NjUzNlx1OEQ3N1x1NzZFRVx1NjgwN1x1RkYxQVxuICogXHU2NzA5XHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUyRkVcdTkwMDlcdTk2QzZcdTU0MDhcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTE2OFx1OTBFOFx1NUM0Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbElkcykge1xuICBpZiAoc2VsZWN0ZWRJZHMgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICBpZiAoc2VsZWN0ZWRJZHMuc2l6ZSA+IDApIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RlZElkcykgJiYgc2VsZWN0ZWRJZHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH1cbiAgcmV0dXJuIFsuLi5hbGxJZHNdXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgU2NyZWVuSWRlbnRpdHlQcm92aWRlciB9IGZyb20gJy4uL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuaW1wb3J0IHsgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIC8vIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1ODQzRFx1NTIzMFx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlxuICAgIGlmIChjYW52YXNMb2NrZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBcdTVERjJcdTVDNTVcdTVGMDBcdTY1RTBcdTUzRUZcdTZFREFcdTUzM0FcdTU3REZcdUZGMENcdTRFMERcdTYyQTJcdTYzMDdcdTk0ODhcbiAgICBpZiAoZXhwYW5kZWQpIHJldHVyblxuICAgIGNvbnN0IHN0YXRlID0gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgY29udGVudFJlZi5jdXJyZW50LCB7IGxvY2tlZDogY2FudmFzTG9ja2VkLCBzY2FsZSB9KVxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IHN0YXRlXG4gICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgY29udGVudFJlZi5jdXJyZW50LCBuYXZpZ2F0ZSlcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuLyoqIFx1N0VEMVx1NUI5QVx1OTc1RSBwYXNzaXZlIHdoZWVsXHVGRjBDXHU2MjREXHU4MEZEXHU1NDA4XHU2Q0Q1IHByZXZlbnREZWZhdWx0XHVGRjA4UmVhY3Qgb25XaGVlbCBcdTlFRDhcdThCQTQgcGFzc2l2ZVx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRXaGVlbFpvb20oZWwsIGdldFNjYWxlLCBzZXRTY2FsZSwgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UpIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgbG9ja2VkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuXG4gIFJlYWN0LnVzZUVmZmVjdChcbiAgICAoKSA9PiBiaW5kV2hlZWxab29tKFxuICAgICAgZWxlbWVudFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gc2NhbGVSZWYuY3VycmVudCxcbiAgICAgIHNldFNjYWxlLFxuICAgICAgKCkgPT4gbG9ja2VkUmVmLmN1cnJlbnQsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImV4cG9ydCBjb25zdCBDQU5WQVNfSU5ERVhfTUFSR0lOID0gMTZcblxuZnVuY3Rpb24gZmluaXRlKHZhbHVlLCBmYWxsYmFjayA9IDApIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24ocG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICBjb25zdCBjb250YWluZXJXaWR0aCA9IE1hdGgubWF4KDAsIGZpbml0ZShjb250YWluZXI/LndpZHRoKSlcbiAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSlcbiAgY29uc3QgaXRlbVdpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LndpZHRoKSlcbiAgY29uc3QgaXRlbUhlaWdodCA9IE1hdGgubWF4KDAsIGZpbml0ZShpdGVtPy5oZWlnaHQpKVxuICBjb25zdCBtYXhYID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJXaWR0aCAtIGl0ZW1XaWR0aCAtIG1hcmdpbilcbiAgY29uc3QgbWF4WSA9IE1hdGgubWF4KG1hcmdpbiwgY29udGFpbmVySGVpZ2h0IC0gaXRlbUhlaWdodCAtIG1hcmdpbilcbiAgcmV0dXJuIHtcbiAgICB4OiBNYXRoLm1pbihNYXRoLm1heChmaW5pdGUocG9zaXRpb24/LngsIG1hcmdpbiksIG1hcmdpbiksIG1heFgpLFxuICAgIHk6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueSwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICByZXR1cm4gY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKHtcbiAgICB4OiAoZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpIC0gZmluaXRlKGl0ZW0/LndpZHRoKSkgLyAyLFxuICAgIHk6IGZpbml0ZShjb250YWluZXI/LmhlaWdodCkgLSBmaW5pdGUoaXRlbT8uaGVpZ2h0KSAtIG1hcmdpbixcbiAgfSwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhnZXRFbGVtZW50cywgb25SZWFkeSwgc2NoZWR1bGVyKSB7XG4gIGxldCBhY3RpdmUgPSB0cnVlXG4gIGxldCBmcmFtZSA9IG51bGxcblxuICBjb25zdCBhdHRlbXB0ID0gKCkgPT4ge1xuICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICBjb25zdCBlbGVtZW50cyA9IGdldEVsZW1lbnRzKClcbiAgICBpZiAoIWVsZW1lbnRzPy5jb250YWluZXIgfHwgIWVsZW1lbnRzPy5pdGVtKSB7XG4gICAgICBmcmFtZSA9IHNjaGVkdWxlci5yZXF1ZXN0KGF0dGVtcHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZnJhbWUgPSBudWxsXG4gICAgb25SZWFkeShlbGVtZW50cylcbiAgfVxuXG4gIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGlmIChmcmFtZSAhPSBudWxsKSBzY2hlZHVsZXIuY2FuY2VsKGZyYW1lKVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7XG4gIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbixcbiAgZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24sXG4gIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzLFxufSBmcm9tICcuL2NhbnZhcy1pbmRleC5qcydcblxuY29uc3QgSU5ERVhfRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHsgd2lkdGg6IGVsZW1lbnQ/Lm9mZnNldFdpZHRoIHx8IDAsIGhlaWdodDogZWxlbWVudD8ub2Zmc2V0SGVpZ2h0IHx8IDAgfVxufVxuXG5mdW5jdGlvbiBDYW52YXNJbmRleCh7XG4gIGNhbnZhc1JlZixcbiAgcHJvamVjdCxcbiAgY3VycmVudFNjcmVlbklkLFxuICBkZW1vQXZhaWxhYmxlLFxuICBwb3NpdGlvbixcbiAgb25Qb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZSxcbiAgbmF2aWdhdGUsXG4gIGVudGVyRGVtbyxcbn0pIHtcbiAgY29uc3QgaW5kZXhSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IGNvbnN0cmFpbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0UG9zaXRpb24sIHVzZURlZmF1bHQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgY29uc3QgaW5kZXggPSBpbmRleFJlZi5jdXJyZW50XG4gICAgaWYgKCFjYW52YXMgfHwgIWluZGV4KSByZXR1cm4gbmV4dFBvc2l0aW9uXG4gICAgY29uc3QgY29udGFpbmVyID0geyB3aWR0aDogY2FudmFzLmNsaWVudFdpZHRoLCBoZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQgfVxuICAgIGNvbnN0IGl0ZW0gPSBlbGVtZW50U2l6ZShpbmRleClcbiAgICByZXR1cm4gdXNlRGVmYXVsdFxuICAgICAgPyBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbihjb250YWluZXIsIGl0ZW0pXG4gICAgICA6IGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihuZXh0UG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSlcbiAgfSwgW2NhbnZhc1JlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBsZXQgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHt9XG4gICAgY29uc3Qgc3RvcFdhaXRpbmcgPSB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhcbiAgICAgICgpID0+ICh7IGNvbnRhaW5lcjogY2FudmFzUmVmLmN1cnJlbnQsIGl0ZW06IGluZGV4UmVmLmN1cnJlbnQgfSksXG4gICAgICAoeyBjb250YWluZXI6IGNhbnZhcywgaXRlbTogaW5kZXggfSkgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiBvblBvc2l0aW9uQ2hhbmdlKChjdXJyZW50KSA9PiBjb25zdHJhaW4oY3VycmVudCwgIWN1cnJlbnQpKVxuICAgICAgICB1cGRhdGUoKVxuXG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih1cGRhdGUpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShpbmRleClcbiAgICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgICAgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXF1ZXN0OiAoY2FsbGJhY2spID0+IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spLFxuICAgICAgICBjYW5jZWw6IChmcmFtZSkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKSxcbiAgICAgIH0sXG4gICAgKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0b3BXYWl0aW5nKClcbiAgICAgIGRpc2Nvbm5lY3RSZXNpemUoKVxuICAgIH1cbiAgfSwgW2NhbnZhc1JlZiwgY29uc3RyYWluLCBvblBvc2l0aW9uQ2hhbmdlXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17aW5kZXhSZWZ9XG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLWNhbnZhcy1pbmRleCBpcy1kcmFnZ2luZycgOiAnd2YtY2FudmFzLWluZGV4J31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHZpc2liaWxpdHk6ICdoaWRkZW4nIH19XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWhhbmRsZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uIHx8IGNvbnN0cmFpbihudWxsLCB0cnVlKVxuICAgICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBJTkRFWF9EUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2UoY29uc3RyYWluKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KSlcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWdyaXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48aSAvPjxpIC8+PGkgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWNsb3NlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIm00IDQgOCA4TTEyIDRsLTggOFwiIC8+PC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIGNhbnZhc0luZGV4VmlzaWJsZSA9IHRydWUsXG4gIGNhbnZhc0luZGV4UG9zaXRpb24sXG4gIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZUNhbnZhc0luZGV4LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgZW50ZXJEZW1vID0gKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFkZW1vQXZhaWxhYmxlIHx8IGNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2FudmFzSW5kZXhWaXNpYmxlID8gKFxuICAgICAgICAgIDxDYW52YXNJbmRleFxuICAgICAgICAgICAgY2FudmFzUmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgICAgcG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlPXtvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvbkNsb3NlPXtvbkNsb3NlQ2FudmFzSW5kZXh9XG4gICAgICAgICAgICBuYXZpZ2F0ZT17bmF2aWdhdGV9XG4gICAgICAgICAgICBlbnRlckRlbW89e2VudGVyRGVtb31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgc2VsZWN0aW9ucyxcbiAgbXVsdGlTZWxlY3QsXG4gIGl0ZW1zLFxuICBvblRvZ2dsZU11bHRpU2VsZWN0LFxuICBvblNlbGVjdEVsZW1lbnQsXG4gIG9uSG92ZXJFbGVtZW50LFxuICBvblJlbW92ZVNlbGVjdGlvbixcbiAgb25DbGVhclNlbGVjdGlvbixcbiAgb25BZGRJdGVtLFxuICBvblJlbW92ZUl0ZW0sXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0aW9uc1tzZWxlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IG51bGxcbiAgY29uc3QgZ2VuZXJhdGVkUHJvbXB0ID0gUmVhY3QudXNlTWVtbygoKSA9PiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcyksIFtwcm9qZWN0LCBpdGVtc10pXG4gIGNvbnN0IFt0eXBlLCBzZXRUeXBlXSA9IFJlYWN0LnVzZVN0YXRlKCdjb21tZW50JylcbiAgY29uc3QgW2luc3RydWN0aW9uLCBzZXRJbnN0cnVjdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Byb21wdCwgc2V0UHJvbXB0XSA9IFJlYWN0LnVzZVN0YXRlKGdlbmVyYXRlZFByb21wdClcbiAgY29uc3QgW3Byb21wdERpcnR5LCBzZXRQcm9tcHREaXJ0eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjb3B5VGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcHJvbXB0RGlydHkpIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gIH0sIFtnZW5lcmF0ZWRQcm9tcHQsIHByb21wdERpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgY29uc3QgYWRkSXRlbSA9ICgpID0+IHtcbiAgICBpZiAoc2VsZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVyblxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBpbnN0cnVjdGlvbi50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQgJiYgdHlwZSAhPT0gJ3JlbW92ZScpIHJldHVyblxuICAgIG9uQWRkSXRlbSh7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0czogc2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbikgPT4gKHtcbiAgICAgICAgc2NyZWVuSWQ6IHNlbGVjdGlvbi5zY3JlZW5JZCxcbiAgICAgICAgc2NyZWVuVGl0bGU6IHNlbGVjdGlvbi5zY3JlZW5UaXRsZSxcbiAgICAgICAgc291cmNlSGludDogc2VsZWN0aW9uLnNvdXJjZUhpbnQsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3Rpb24uc2VsZWN0b3IsXG4gICAgICAgIGN1cnJlbnRUZXh0OiBzZWxlY3Rpb24uY3VycmVudFRleHQsXG4gICAgICB9KSksXG4gICAgICBpbnN0cnVjdGlvbjogbm9ybWFsaXplZCxcbiAgICB9KVxuICAgIHNldEluc3RydWN0aW9uKCcnKVxuICB9XG5cbiAgY29uc3QgcmVnZW5lcmF0ZSA9ICgpID0+IHtcbiAgICBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICAgIHNldFByb21wdERpcnR5KGZhbHNlKVxuICB9XG5cbiAgY29uc3QgY29weVByb21wdCA9ICgpID0+IHtcbiAgICBjb3B5VGV4dChwcm9tcHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3B5VGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDE0MDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGluc3RydWN0aW9uTGFiZWwgPSB0eXBlID09PSAndGV4dCdcbiAgICA/ICdcdTY1QjBcdTY1ODdcdTVCNTcnXG4gICAgOiB0eXBlID09PSAnb3JkZXInXG4gICAgICA/ICdcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDInXG4gICAgICA6IHR5cGUgPT09ICdyZW1vdmUnXG4gICAgICAgID8gJ1x1NTIyMFx1OTY2NFx1OEJGNFx1NjYwRVx1RkYwOFx1NTNFRlx1OTAwOVx1RkYwOSdcbiAgICAgICAgOiAnXHU3RUQ5IEFJIFx1NzY4NFx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRSdcblxuICByZXR1cm4gKFxuICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWxcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCXCI+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLXRpdGxlXCI+XHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCPC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWNvdW50XCI+e2l0ZW1zLmxlbmd0aH0gXHU2NzYxXHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtYm9keVwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NURGMlx1OTAwOVx1ODI4Mlx1NzBCOSAoe3NlbGVjdGlvbnMubGVuZ3RofSk8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bXVsdGlTZWxlY3QgPyAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QnfVxuICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17bXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVNdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTkxQVx1OTAwOSB7bXVsdGlTZWxlY3QgPyAnT04nIDogJ09GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsZWFyLXNlbGVjdGlvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtvbkNsZWFyU2VsZWN0aW9ufT5cdTZFMDVcdTdBN0E8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhpbnRcIj5cdTU5MUFcdTkwMDlcdTVGMDBcdTU0MkZcdTU0MEVcdTcwQjlcdTUxRkJcdTgyODJcdTcwQjlcdTUzRUZcdTUyQTBcdTUxNjVcdTYyMTZcdTc5RkJcdTk2NjRcdUZGMUJcdTRFNUZcdTUzRUZcdTYzMDlcdTRGNEYgU2hpZnQgLyBDb21tYW5kIC8gQ3RybCBcdTcwQjlcdTUxRkJcdTMwMDI8L3A+XG4gICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uc1wiPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzZWxlY3Rpb24gPT09IHNlbGVjdGVkID8gJ3dmLXJldmlldy1zZWxlY3Rpb24gaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctc2VsZWN0aW9uJ30ga2V5PXtgJHtzZWxlY3Rpb24uc2NyZWVuSWR9OiR7c2VsZWN0aW9uLnNlbGVjdG9yfWB9PlxuICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1zZWxlY3RvclwiPntpbmRleCArIDF9LiB7c2VsZWN0aW9uLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1yZW1vdmVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVTZWxlY3Rpb24oc2VsZWN0aW9uLmVsZW1lbnQpfT5cdTc5RkJcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2NyZWVuLW5hbWVcIj57c2VsZWN0ZWQuc2NyZWVuVGl0bGV9IFx1MDBCNyB7c2VsZWN0ZWQuc2NyZWVuSWR9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJzXCIgYXJpYS1sYWJlbD1cIlx1ODI4Mlx1NzBCOVx1NUM0Mlx1N0VBN1wiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZC5hbmNlc3RvcnMubWFwKChhbmNlc3RvciwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2FuY2VzdG9yLnNlbGVjdG9yfT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYi1zZXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwibTkgMTggNi02LTYtNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthbmNlc3Rvci5zZWxlY3Rvcn1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IG9uSG92ZXJFbGVtZW50Py4oYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2VsZWN0RWxlbWVudChhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHthbmNlc3Rvci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdG9yXCI+e3NlbGVjdGVkLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAge3NlbGVjdGVkLmN1cnJlbnRUZXh0ID8gKFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1jdXJyZW50LXRleHRcIj5cdTVGNTNcdTUyNERcdUZGMUF7c2VsZWN0ZWQuY3VycmVudFRleHR9PC9wPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NEZFRVx1NjUzOVx1N0M3Qlx1NTc4Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLXNlbGVjdFwiIHZhbHVlPXt0eXBlfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRUeXBlKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKFJFVklFV19UWVBFX0xBQkVMUykubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLW9wdGlvblwiIHZhbHVlPXt2YWx1ZX0ga2V5PXt2YWx1ZX0+e2xhYmVsfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj57aW5zdHJ1Y3Rpb25MYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaW5zdHJ1Y3Rpb25cIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2luc3RydWN0aW9ufVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3R5cGUgPT09ICdvcmRlcicgPyAnXHU0RjhCXHU1OTgyXHVGRjFBXHU3OUZCXHU1MkE4XHU1MjMwXHU4QkEyXHU1MzU1XHU2NDU4XHU4OTgxXHU0RTRCXHU1NDBFJyA6ICdcdTYzQ0ZcdThGRjBcdTVFMENcdTY3MUIgQUkgXHU1OTgyXHU0RjU1XHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEluc3RydWN0aW9uKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaW5zdHJ1Y3Rpb24udHJpbSgpICYmIHR5cGUgIT09ICdyZW1vdmUnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FkZEl0ZW19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTUyQTBcdTUxNjVcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMDh7c2VsZWN0aW9ucy5sZW5ndGh9IFx1NEUyQVx1ODI4Mlx1NzBCOVx1RkYwOVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTRFMkRcdTc2ODRcdTgyODJcdTcwQjlcdTVGMDBcdTU5Q0JcdThCQzRcdThCQkFcdTMwMDJcdTcwQjlcdTUxRkJcdTk3NjJcdTUzMDVcdTVDNTFcdTUzRUZcdTUyMDdcdTYzNjJcdTUyMzBcdTcyMzZcdTdFQTdcdTdFQzRcdTRFRjZcdTMwMDI8L3A+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTU8L2gyPlxuICAgICAgICAgIHtpdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtc1wiPlxuICAgICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbVwiIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS10aXRsZVwiPntpbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2l0ZW0udHlwZV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Jldmlld1RhcmdldHMoaXRlbSkubWFwKCh0YXJnZXQpID0+IHRhcmdldC5zZWxlY3Rvcikuam9pbignXHUzMDAxJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0taW5zdHJ1Y3Rpb25cIj57aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ308L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tZGVsZXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlSXRlbShpdGVtLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDhcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24gd2YtcmV2aWV3LXByb21wdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTY3MDBcdTdFQzggUHJvbXB0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cmVnZW5lcmF0ZX0+XHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb21wdERpcnR5ID8gPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hbnVhbFwiPlByb21wdCBcdTVERjJcdTYyNEJcdTUyQThcdTRGRUVcdTY1MzlcdUZGMUJcdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTBcdTRGMUFcdTg5ODZcdTc2RDZcdTYyNEJcdTUyQThcdTUxODVcdTVCQjlcdTMwMDI8L3A+IDogbnVsbH1cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1wcm9tcHRcIlxuICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0UHJvbXB0KGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9e2NvcHlQcm9tcHR9PlxuICAgICAgICAgICAge2NvcGllZCA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NTkwRFx1NTIzNiBQcm9tcHQnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiaW1wb3J0IHsgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLml0ZW0gPT09IG90aGVyLml0ZW1cbiAgICAgICYmIGl0ZW0uaXRlbUluZGV4ID09PSBvdGhlci5pdGVtSW5kZXhcbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICB9KVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBpdGVtcykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgcG9zaXRpb25zID0gW11cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICByZXZpZXdUYXJnZXRzKGl0ZW0pLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0LnNlbGVjdG9yKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50Py5pc0Nvbm5lY3RlZCkgcmV0dXJuXG4gICAgICBjb25zdCBzY3JlZW5Db250ZW50ID0gZWxlbWVudC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKVxuICAgICAgaWYgKCFzY3JlZW5Db250ZW50KSByZXR1cm5cbiAgICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHNjcmVlbkNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgICBpZiAoIXZpc2libGUpIHJldHVyblxuICAgICAgY29uc3QgYmFzZUxlZnQgPSBNYXRoLnJvdW5kKHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdClcbiAgICAgIGNvbnN0IGJhc2VUb3AgPSBNYXRoLnJvdW5kKHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcClcbiAgICAgIGNvbnN0IG92ZXJsYXBDb3VudCA9IHBvc2l0aW9ucy5maWx0ZXIoXG4gICAgICAgIChwb3NpdGlvbikgPT4gTWF0aC5hYnMocG9zaXRpb24uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAyICYmIE1hdGguYWJzKHBvc2l0aW9uLmJhc2VUb3AgLSBiYXNlVG9wKSA8IDIsXG4gICAgICApLmxlbmd0aFxuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBrZXk6IGAke2l0ZW0uaWR9OiR7dGFyZ2V0SW5kZXh9YCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXRlbUluZGV4LFxuICAgICAgICB0YXJnZXRJbmRleCxcbiAgICAgICAgYmFzZUxlZnQsXG4gICAgICAgIGJhc2VUb3AsXG4gICAgICAgIGxlZnQ6IGJhc2VMZWZ0ICsgb3ZlcmxhcENvdW50ICogMTUsXG4gICAgICAgIHRvcDogYmFzZVRvcCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdNYXJrZXJzKHsgYm9hcmRSZWYsIGl0ZW1zLCBvbk9wZW5QYW5lbCB9KSB7XG4gIGNvbnN0IFtwb3NpdGlvbnMsIHNldFBvc2l0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2FjdGl2ZUtleSwgc2V0QWN0aXZlS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZyYW1lUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZFJlZi5jdXJyZW50LCBpdGVtcylcbiAgICBzZXRQb3NpdGlvbnMoKGN1cnJlbnQpID0+IHNhbWVQb3NpdGlvbnMoY3VycmVudCwgbmV4dCkgPyBjdXJyZW50IDogbmV4dClcbiAgfSwgW2JvYXJkUmVmLCBpdGVtc10pXG5cbiAgY29uc3Qgc2NoZWR1bGVSZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICBmcmFtZVJlZi5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmcmFtZVJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgcmVmcmVzaCgpXG4gICAgfSlcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdChzY2hlZHVsZVJlZnJlc2gpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW3NjaGVkdWxlUmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aXZlS2V5ICYmICFwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KSkgc2V0QWN0aXZlS2V5KG51bGwpXG4gIH0sIFthY3RpdmVLZXksIHBvc2l0aW9uc10pXG5cbiAgY29uc3QgYWN0aXZlID0gcG9zaXRpb25zLmZpbmQoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSlcbiAgY29uc3QgYm9hcmRXaWR0aCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudFdpZHRoIHx8IDBcbiAgY29uc3QgYm9hcmRIZWlnaHQgPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgfHwgMFxuICBjb25zdCBidWJibGVMZWZ0ID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS5sZWZ0ICsgMTYsIGJvYXJkV2lkdGggLSAzMzYpKSA6IDBcbiAgY29uc3QgYnViYmxlVG9wID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS50b3AgKyAyNCwgYm9hcmRIZWlnaHQgLSAxODApKSA6IDBcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlcnNcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU2ODA3XHU4QkIwXCI+XG4gICAgICB7cG9zaXRpb25zLm1hcCgocG9zaXRpb24pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YWN0aXZlS2V5ID09PSBwb3NpdGlvbi5rZXkgPyAnd2YtcmV2aWV3LW1hcmtlciBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tYXJrZXInfVxuICAgICAgICAgIGtleT17cG9zaXRpb24ua2V5fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVx1RkYxQSR7UkVWSUVXX1RZUEVfTEFCRUxTW3Bvc2l0aW9uLml0ZW0udHlwZV19YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBwb3NpdGlvbi5sZWZ0LCB0b3A6IHBvc2l0aW9uLnRvcCB9fVxuICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldEFjdGl2ZUtleSgoY3VycmVudCkgPT4gY3VycmVudCA9PT0gcG9zaXRpb24ua2V5ID8gbnVsbCA6IHBvc2l0aW9uLmtleSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICB7YWN0aXZlID8gKFxuICAgICAgICA8YXNpZGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IGJ1YmJsZUxlZnQsIHRvcDogYnViYmxlVG9wIH19XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke2FjdGl2ZS5pdGVtSW5kZXggKyAxfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgIHthY3RpdmUuaXRlbUluZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbYWN0aXZlLml0ZW0udHlwZV19XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWNsb3NlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUtleShudWxsKX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWluc3RydWN0aW9uXCI+XG4gICAgICAgICAgICB7YWN0aXZlLml0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9XG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRhcmdldHNcIj5cbiAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGFjdGl2ZS5pdGVtKS5tYXAoKHRhcmdldCkgPT4gKFxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItc2VsZWN0b3JcIiBrZXk9e3RhcmdldC5zZWxlY3Rvcn0+e3RhcmdldC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItbW9yZVwiXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlS2V5KG51bGwpXG4gICAgICAgICAgICAgIG9uT3BlblBhbmVsPy4oKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTY3RTVcdTc3MEJcdTY2RjRcdTU5MUFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiY29uc3QgTEFVTkNIRVJfU0laRSA9IDQ4XG5jb25zdCBMQVVOQ0hFUl9NQVJHSU4gPSAyMFxuY29uc3QgRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIE1hdGgubWF4KG1pbiwgbWF4KSlcbn1cblxuZnVuY3Rpb24gY2xhbXBQb3NpdGlvbihib2FyZCwgcG9zaXRpb24pIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIHBvc2l0aW9uXG4gIHJldHVybiB7XG4gICAgeDogY2xhbXAocG9zaXRpb24ueCwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICAgIHk6IGNsYW1wKHBvc2l0aW9uLnksIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSB7XG4gIHJldHVybiBjbGFtcFBvc2l0aW9uKGJvYXJkLCB7XG4gICAgeDogYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICAgIHk6IGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlS2V5KSlcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlPy54KSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWU/LnkpKSByZXR1cm4gdmFsdWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gbG9jYWxTdG9yYWdlIG1heSBiZSB1bmF2YWlsYWJsZSBmb3IgYSBkaXJlY3RseSBvcGVuZWQgbG9jYWwgZmlsZS5cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb24pIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocG9zaXRpb24pKVxuICB9IGNhdGNoIHtcbiAgICAvLyBLZWVwaW5nIHRoZSBsYXVuY2hlciBkcmFnZ2FibGUgaXMgbW9yZSBpbXBvcnRhbnQgdGhhbiBwZXJzaXN0ZW5jZS5cbiAgfVxufVxuXG5mdW5jdGlvbiBDb21tZW50SWNvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk01IDQuNWgxNGEyIDIgMCAwIDEgMiAydjhhMiAyIDAgMCAxLTIgMmgtNmwtNC41IDN2LTNINWEyIDIgMCAwIDEtMi0ydi04YTIgMiAwIDAgMSAyLTJaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNy41IDEwLjVoOVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld0xhdW5jaGVyKHsgYm9hcmRSZWYsIGNvdW50LCBwcm9qZWN0TmFtZSwgb25PcGVuIH0pIHtcbiAgY29uc3Qgc3RvcmFnZUtleSA9IGB3Zi1yZXZpZXctbGF1bmNoZXItcG9zaXRpb246JHtwcm9qZWN0TmFtZX1gXG4gIGNvbnN0IFtwb3NpdGlvbiwgc2V0UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBwb3NpdGlvblJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdXBwcmVzc0NsaWNrUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuXG4gIGNvbnN0IHVwZGF0ZVBvc2l0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHQpID0+IHtcbiAgICBjb25zdCBjbGFtcGVkID0gY2xhbXBQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50LCBuZXh0KVxuICAgIHBvc2l0aW9uUmVmLmN1cnJlbnQgPSBjbGFtcGVkXG4gICAgc2V0UG9zaXRpb24oY2xhbXBlZClcbiAgICByZXR1cm4gY2xhbXBlZFxuICB9LCBbYm9hcmRSZWZdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYm9hcmQgPSBib2FyZFJlZi5jdXJyZW50XG4gICAgaWYgKCFib2FyZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHVwZGF0ZVBvc2l0aW9uKHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuXG4gICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IHVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcbiAgICAgIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBuZXh0KVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICB9LCBbYm9hcmRSZWYsIHN0b3JhZ2VLZXksIHVwZGF0ZVBvc2l0aW9uXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBkcmFnLm1vdmVkXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgIGlmIChwb3NpdGlvblJlZi5jdXJyZW50KSBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb25SZWYuY3VycmVudClcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPD0gMCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtkcmFnZ2luZyA/ICd3Zi1yZXZpZXctbGF1bmNoZXIgaXMtZHJhZ2dpbmcnIDogJ3dmLXJldmlldy1sYXVuY2hlcid9XG4gICAgICBzdHlsZT17cG9zaXRpb24gPyB7IGxlZnQ6IHBvc2l0aW9uLngsIHRvcDogcG9zaXRpb24ueSB9IDogeyByaWdodDogTEFVTkNIRVJfTUFSR0lOLCBib3R0b206IExBVU5DSEVSX01BUkdJTiB9fVxuICAgICAgYXJpYS1sYWJlbD17YFx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVx1RkYwQ1x1NTE3MSAke2NvdW50fSBcdTY3NjFcdTRGRUVcdTY1MzlgfVxuICAgICAgZGF0YS10b29sdGlwPVwiXHU1QzU1XHU1RjAwXHU4QkM0XHU4QkJBXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmRSZWYuY3VycmVudClcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgfVxuICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgaWYgKCFkcmFnLm1vdmVkICYmIE1hdGguaHlwb3QoZGVsdGFYLCBkZWx0YVkpIDwgRFJBR19USFJFU0hPTEQpIHJldHVyblxuICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICB1cGRhdGVQb3NpdGlvbih7IHg6IGRyYWcub3JpZ2luLnggKyBkZWx0YVgsIHk6IGRyYWcub3JpZ2luLnkgKyBkZWx0YVkgfSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgaWYgKHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCkge1xuICAgICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgb25PcGVuKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPENvbW1lbnRJY29uIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y291bnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG4iLCAiZXhwb3J0IGNvbnN0IFVOU0FWRURfUkVWSUVXX01FU1NBR0UgPSAnXHU0RkVFXHU2NTM5XHU1MTg1XHU1QkI5XHU1QzFBXHU2NzJBXHU0RkREXHU1QjU4XHVGRjBDXHU3OUJCXHU1RjAwXHU5ODc1XHU5NzYyXHU1NDBFXHU0RjFBXHU0RTIyXHU1OTMxXHUzMDAyXHU2NjJGXHU1NDI2XHU3RUU3XHU3RUVEXHVGRjFGJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgZXZlbnQucmV0dXJuVmFsdWUgPSBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG4gIHJldHVybiBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG59XG4iLCAiZXhwb3J0IGNvbnN0IEJPQVJEX1NIT1JUQ1VUUyA9IFtcbiAgeyBpZDogJ2NhbnZhcycsIGtleXM6ICdDdHJsKzEnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2RlbW8nLCBrZXlzOiAnQ3RybCsyJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdpbnRlcmFjdGlvbicsIGtleXM6ICdDdHJsK0knLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTNFRlx1NEVBNFx1NEU5MiAvIFx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5MicgfSxcbiAgeyBpZDogJ3JldmlldycsIGtleXM6ICdDdHJsK00nLCBsYWJlbDogJ1x1NUYwMFx1NTQyRlx1NjIxNlx1NTE3M1x1OTVFRFx1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ltbWVyc2l2ZScsIGtleXM6ICdDdHJsK0YnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2Jyb3dzZXItZnVsbHNjcmVlbicsIGtleXM6ICdDdHJsK1NoaWZ0K0YnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RicgfSxcbiAgeyBpZDogJ2hvdHNwb3RzJywga2V5czogJ0N0cmwrSCcsIGxhYmVsOiAnXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBJyB9LFxuICB7IGlkOiAnc3BhY2UnLCBrZXlzOiAnU3BhY2UnLCBsYWJlbDogJ1x1NjMwOVx1NEY0Rlx1NEUzNFx1NjVGNlx1NjJENlx1NTJBOFx1NzUzQlx1NUUwMycgfSxcbiAgeyBpZDogJ2VzY2FwZScsIGtleXM6ICdFc2MnLCBsYWJlbDogJ1x1NTE3M1x1OTVFRFx1NUY1M1x1NTI0RFx1OTc2Mlx1Njc3Rlx1NjIxNlx1OTAwMFx1NTFGQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2hlbHAnLCBrZXlzOiAnPycsIGxhYmVsOiAnXHU2MjUzXHU1RjAwXHU2MjE2XHU1MTczXHU5NUVEXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IGVsZW1lbnQgPSB0YXJnZXQubm9kZVR5cGUgPT09IDMgPyB0YXJnZXQucGFyZW50RWxlbWVudCA6IHRhcmdldFxuICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZVxuICBjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWVcbiAgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICdURVhUQVJFQScgfHwgdGFnID09PSAnU0VMRUNUJykgcmV0dXJuIHRydWVcbiAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIWVsZW1lbnQuY2xvc2VzdD8uKCdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpIHtcbiAgaWYgKCFldmVudCB8fCBldmVudC5yZXBlYXQgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkpIHJldHVybiBudWxsXG4gIGNvbnN0IGtleSA9IFN0cmluZyhldmVudC5rZXkgfHwgJycpLnRvTG93ZXJDYXNlKClcblxuICBpZiAoIWV2ZW50LmN0cmxLZXkpIHtcbiAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGtleSA9PT0gJ2VzY2FwZScpIHJldHVybiAnZXNjYXBlJ1xuICAgIGlmIChldmVudC5rZXkgPT09ICc/JykgcmV0dXJuICdoZWxwJ1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAoZXZlbnQuc2hpZnRLZXkpIHJldHVybiBrZXkgPT09ICdmJyA/ICdicm93c2VyLWZ1bGxzY3JlZW4nIDogbnVsbFxuICBpZiAoa2V5ID09PSAnMScpIHJldHVybiAnY2FudmFzJ1xuICBpZiAoa2V5ID09PSAnMicpIHJldHVybiAnZGVtbydcbiAgaWYgKGtleSA9PT0gJ2knKSByZXR1cm4gJ2ludGVyYWN0aW9uJ1xuICBpZiAoa2V5ID09PSAnbScpIHJldHVybiAncmV2aWV3J1xuICBpZiAoa2V5ID09PSAnZicpIHJldHVybiAnaW1tZXJzaXZlJ1xuICBpZiAoa2V5ID09PSAnaCcpIHJldHVybiAnaG90c3BvdHMnXG4gIHJldHVybiBudWxsXG59XG4iLCAiaW1wb3J0IHsgQk9BUkRfU0hPUlRDVVRTIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmZ1bmN0aW9uIFBhbmVsU2hlbGwoeyBpZCwgdGl0bGUsIGFyaWFMYWJlbCwgb25DbG9zZSwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBjbG9zZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCByZXR1cm5Gb2N1c1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuRm9jdXNSZWYuY3VycmVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICBjbG9zZVJlZi5jdXJyZW50Py5mb2N1cygpXG4gICAgcmV0dXJuICgpID0+IHJldHVybkZvY3VzUmVmLmN1cnJlbnQ/LmZvY3VzPy4oKVxuICB9LCBbXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWxheWVyXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBvbkNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNlY3Rpb24gaWQ9e2lkfSBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgPGJ1dHRvbiByZWY9e2Nsb3NlUmVmfSB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfSBhcmlhLWxhYmVsPXtgXHU1MTczXHU5NUVEJHt0aXRsZX1gfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2hvcnRjdXRIZWxwKHsgZGVtb0F2YWlsYWJsZSwgc2hvd0NhbnZhc0luZGV4LCBvblNob3dDYW52YXNJbmRleENoYW5nZSwgb25DbG9zZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPFBhbmVsU2hlbGwgaWQ9XCJ3Zi1ib2FyZC11dGlsaXR5XCIgdGl0bGU9XCJcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkVcIiBhcmlhTGFiZWw9XCJcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIiBvbkNsb3NlPXtvbkNsb3NlfT5cbiAgICAgIDxkbCBjbGFzc05hbWU9XCJ3Zi1zaG9ydGN1dC1saXN0XCI+XG4gICAgICAgIHtCT0FSRF9TSE9SVENVVFMubWFwKChzaG9ydGN1dCkgPT4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtzaG9ydGN1dC5pZCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlID8gJ2lzLWRpc2FibGVkJyA6ICcnfSBrZXk9e3Nob3J0Y3V0LmlkfT5cbiAgICAgICAgICAgIDxkdD48a2JkPntzaG9ydGN1dC5rZXlzfTwva2JkPjwvZHQ+XG4gICAgICAgICAgICA8ZGQ+e3Nob3J0Y3V0LmxhYmVsfXtzaG9ydGN1dC5pZCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlID8gJ1x1RkYwOFx1NUY1M1x1NTI0RFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwOScgOiAnJ308L2RkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGw+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ub3RlXCI+XHU1NzI4XHU4RjkzXHU1MTY1XHU2ODQ2XHUzMDAxXHU2NTg3XHU2NzJDXHU1N0RGXHUzMDAxXHU0RTBCXHU2MkM5XHU2ODQ2XHU1NDhDXHU1M0VGXHU3RjE2XHU4RjkxXHU1MTg1XHU1QkI5XHU0RTJEXHU0RTBEXHU0RjFBXHU4OUU2XHU1M0QxXHU2NjZFXHU5MDFBXHU1RkVCXHU2Mzc3XHU5NTJFXHUzMDAyPC9wPlxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtc2VjdGlvblwiIGFyaWEtbGFiZWxsZWRieT1cIndmLWJvYXJkLWluZGV4LXNldHRpbmctdGl0bGVcIj5cbiAgICAgICAgPGgyIGlkPVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlx1NzUzQlx1Njc3Rlx1OEJCRVx1N0Y2RTwvaDI+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1zZXR0aW5nLXJvd1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHN0cm9uZz5cdTY2M0VcdTc5M0FcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTU8L3N0cm9uZz5cbiAgICAgICAgICAgIDxzbWFsbD5cdTU3MjhcdTc1M0JcdTY3N0ZcdTRFMEFcdTY2M0VcdTc5M0FcdTUzRUZcdTYyRDZcdTYyRkRcdTc2ODRcdTk4NzVcdTk3NjJcdTdEMjJcdTVGMTU8L3NtYWxsPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBjaGVja2VkPXtzaG93Q2FudmFzSW5kZXh9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblNob3dDYW52YXNJbmRleENoYW5nZShldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L1BhbmVsU2hlbGw+XG4gIClcbn1cbiIsICJjb25zdCBERUZBVUxUX1NFVFRJTkdTID0gT2JqZWN0LmZyZWV6ZSh7IHNob3dDYW52YXNJbmRleDogdHJ1ZSB9KVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9hcmRTdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB3aW5kb3cubG9jYWxTdG9yYWdlXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSB7XG4gIHJldHVybiBgd2YtYm9hcmQtc2V0dGluZ3M6JHtwcm9qZWN0TmFtZX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQm9hcmRTZXR0aW5ncyhzdG9yYWdlLCBwcm9qZWN0TmFtZSkge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RvcmFnZT8uZ2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSkpKVxuICAgIGlmICh0eXBlb2YgcGFyc2VkPy5zaG93Q2FudmFzSW5kZXggPT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIHsgc2hvd0NhbnZhc0luZGV4OiBwYXJzZWQuc2hvd0NhbnZhc0luZGV4IH1cbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGZpbGU6Ly8gc3RvcmFnZSBjYW4gYmUgdW5hdmFpbGFibGUgb3IgY29udGFpbiBzdGFsZSBkYXRhLlxuICB9XG4gIHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUJvYXJkU2V0dGluZ3Moc3RvcmFnZSwgcHJvamVjdE5hbWUsIHNldHRpbmdzKSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB7IHNob3dDYW52YXNJbmRleDogc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4ICE9PSBmYWxzZSB9XG4gIHRyeSB7XG4gICAgc3RvcmFnZT8uc2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSksIEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZWQpKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIFNldHRpbmdzIHJlbWFpbiB1c2FibGUgZm9yIHRoZSBjdXJyZW50IHNlc3Npb24gd2l0aG91dCBwZXJzaXN0ZW5jZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5pbXBvcnQgeyBTaG9ydGN1dEhlbHAgfSBmcm9tICcuL0JvYXJkUGFuZWxzLmpzeCdcbmltcG9ydCB7IGdldEJvYXJkU3RvcmFnZSwgcmVhZEJvYXJkU2V0dGluZ3MsIHNhdmVCb2FyZFNldHRpbmdzIH0gZnJvbSAnLi9ib2FyZC1zZXR0aW5ncy5qcydcbmltcG9ydCB7IGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldCwgc2hvcnRjdXRJZEZvckV2ZW50IH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIHRvb2xiYXJFeHBhbmQ6IDw+PHBhdGggZD1cIk01IDV2MTRcIiAvPjxwYXRoIGQ9XCJtMTUgMTgtNi02IDYtNlwiIC8+PC8+LFxuICAgIHRvb2xiYXJDb2xsYXBzZTogPD48cGF0aCBkPVwiTTE5IDV2MTRcIiAvPjxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz48Lz4sXG4gICAgZG93bmxvYWQ6IDw+PHBhdGggZD1cIk0xMiAzdjEyXCIgLz48cGF0aCBkPVwibTcgMTAgNSA1IDUtNVwiIC8+PHBhdGggZD1cIk01IDIxaDE0XCIgLz48Lz4sXG4gICAgc2V0dGluZ3M6IDw+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIgLz48cGF0aCBkPVwiTTE5LjQgMTVhMS43IDEuNyAwIDAgMCAuMzQgMS44OGwuMDYuMDYtMi44MyAyLjgzLS4wNi0uMDZBMS43IDEuNyAwIDAgMCAxNSAxOS40YTEuNyAxLjcgMCAwIDAtMSAuNiAxLjcgMS43IDAgMCAwLS40IDEuMVYyMWgtNHYtLjA5QTEuNyAxLjcgMCAwIDAgOC42IDE5LjRhMS43IDEuNyAwIDAgMC0xLjg4LjM0bC0uMDYuMDYtMi44My0yLjgzLjA2LS4wNkExLjcgMS43IDAgMCAwIDQuNiAxNWExLjcgMS43IDAgMCAwLS42LTEgMS43IDEuNyAwIDAgMC0xLjEtLjRIM3YtNGguMDlBMS43IDEuNyAwIDAgMCA0LjYgOC42YTEuNyAxLjcgMCAwIDAtLjM0LTEuODhsLS4wNi0uMDYgMi44My0yLjgzLjA2LjA2QTEuNyAxLjcgMCAwIDAgOSA0LjZhMS43IDEuNyAwIDAgMCAxLS42IDEuNyAxLjcgMCAwIDAgLjQtMS4xVjNoNHYuMDlBMS43IDEuNyAwIDAgMCAxNS40IDQuNmExLjcgMS43IDAgMCAwIDEuODgtLjM0bC4wNi0uMDYgMi44MyAyLjgzLS4wNi4wNkExLjcgMS43IDAgMCAwIDE5LjQgOWMuMi4zNy41Mi43IDEgLjkuMzIuMTMuNjguMiAxLjEuMmguMDl2NGgtLjA5YTEuNyAxLjcgMCAwIDAtMi4xLjlaXCIgLz48Lz4sXG4gICAgaGVscDogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjlcIiAvPjxwYXRoIGQ9XCJNOS43IDlhMi40IDIuNCAwIDEgMSAzLjcgMmMtLjkuNi0xLjQgMS4xLTEuNCAyXCIgLz48cGF0aCBkPVwiTTEyIDE3aC4wMVwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gJ1x1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSBDdHJsK0knXG4gICAgICAgIDogJ1x1NUY1M1x1NTI0RFx1NURGMlx1OTUwMVx1NEY0Rlx1MzAwMlx1NzBCOVx1NTFGQlx1NjA2Mlx1NTkwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSBDdHJsK0knfVxuICAgID5cbiAgICAgIDxMb2NrSWNvbiBvcGVuPXtpbnRlcmFjdGl2ZX0gLz5cbiAgICAgIDxzcGFuPntpbnRlcmFjdGl2ZSA/ICdcdTUzRUZcdTRFQTRcdTRFOTInIDogJ1x1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mid9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkge1xuICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGVsKSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBlbCAmJiAoZWwucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZWwud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pXG4gIGlmICghcmVxdWVzdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVxdWVzdC5jYWxsKGVsKSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmZ1bmN0aW9uIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKSB7XG4gIGlmICghZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIGNvbnN0IGV4aXQgPSBkb2N1bWVudC5leGl0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlblxuICBpZiAoIWV4aXQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGV4aXQuY2FsbChkb2N1bWVudCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm9hcmQoeyBwcm9qZWN0IH0pIHtcbiAgY29uc3Qge1xuICAgIG1vZGUsXG4gICAgc2V0TW9kZSxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydCxcbiAgICBlbnRyeUlkLFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIGN1cnJlbnRTY3JlZW5JZCxcbiAgICBjYW5Hb0JhY2ssXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBjb25zdCB2aWV3cG9ydE9wdGlvbnMgPSBPYmplY3Qua2V5cyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuXG4gIGNvbnN0IFtzZWxlY3RlZElkcywgc2V0U2VsZWN0ZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpLFxuICApXG4gIGNvbnN0IFtjYW52YXNTY2FsZSwgc2V0Q2FudmFzU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9TY2FsZSwgc2V0RGVtb1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vVmlld1Jlc2V0S2V5LCBzZXREZW1vVmlld1Jlc2V0S2V5XSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpbnRlcmFjdGl2ZSwgc2V0SW50ZXJhY3RpdmVdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3NwYWNlSGVsZCwgc2V0U3BhY2VIZWxkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaG90c3BvdHNWaXNpYmxlLCBzZXRIb3RzcG90c1Zpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBvcnRFcnJvciwgc2V0RXhwb3J0RXJyb3JdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2V4cG9ydGluZywgc2V0RXhwb3J0aW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRJZHMsIHNldEV4cGFuZGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgW2ltbWVyc2l2ZSwgc2V0SW1tZXJzaXZlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkLCBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWRdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdQYW5lbFZpc2libGUsIHNldFJldmlld1BhbmVsVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1NlbGVjdGlvbnMsIHNldFJldmlld1NlbGVjdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtyZXZpZXdNdWx0aVNlbGVjdCwgc2V0UmV2aWV3TXVsdGlTZWxlY3RdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdJdGVtcywgc2V0UmV2aWV3SXRlbXNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtoZWxwVmlzaWJsZSwgc2V0SGVscFZpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYW52YXNJbmRleFZpc2libGUsIHNldENhbnZhc0luZGV4VmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS5zaG93Q2FudmFzSW5kZXgsXG4gIClcbiAgY29uc3QgW2NhbnZhc0luZGV4UG9zaXRpb24sIHNldENhbnZhc0luZGV4UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgYm9hcmRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZiA9IFJlYWN0LnVzZVJlZihuZXcgU2V0KCkpXG4gIGNvbnN0IGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSAhaW50ZXJhY3RpdmUgfHwgc3BhY2VIZWxkXG4gIGNvbnN0IGFsbFNjcmVlbklkcyA9IHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKVxuICBjb25zdCBpc0RlbW8gPSBtb2RlID09PSAnZGVtbycgJiYgZGVtb0F2YWlsYWJsZVxuICBjb25zdCBhY3RpdmVTY2FsZSA9IGlzRGVtbyA/IGRlbW9TY2FsZSA6IGNhbnZhc1NjYWxlXG4gIGNvbnN0IHNldEFjdGl2ZVNjYWxlID0gaXNEZW1vID8gc2V0RGVtb1NjYWxlIDogc2V0Q2FudmFzU2NhbGVcblxuICBjb25zdCBjbGVhclJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgfVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucyhbXSlcbiAgfSwgW10pXG5cbiAgY29uc3Qgc2VsZWN0UmV2aWV3RWxlbWVudCA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50LCBzY3JlZW4sIGNvbnRlbnRSb290LCBvcHRpb25zID0ge30pID0+IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdXG4gICAgY29uc3QgYWN0aXZlU2NyZWVuID0gc2NyZWVuIHx8IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBwcmltYXJ5Py5zY3JlZW5JZClcbiAgICBjb25zdCBhY3RpdmVSb290ID0gY29udGVudFJvb3QgfHwgcHJpbWFyeT8uY29udGVudFJvb3RcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWFjdGl2ZVNjcmVlbiB8fCAhYWN0aXZlUm9vdCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dFNlbGVjdGlvbiA9IGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBhY3RpdmVSb290LCBhY3RpdmVTY3JlZW4pXG4gICAgY29uc3QgYWRkaXRpdmUgPSByZXZpZXdNdWx0aVNlbGVjdCB8fCBvcHRpb25zLmFkZGl0aXZlXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG5cbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5yZXBsYWNlRWxlbWVudCkge1xuICAgICAgICBvcHRpb25zLnJlcGxhY2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUob3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgaWYgKGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50ICYmIGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQubWFwKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQgPyBuZXh0U2VsZWN0aW9uIDogaXRlbSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50KVxuICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGVkRWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICByZXR1cm4gYWRkaXRpdmUgPyBbLi4uY3VycmVudCwgbmV4dFNlbGVjdGlvbl0gOiBbbmV4dFNlbGVjdGlvbl1cbiAgICB9KVxuICB9LCBbcHJvamVjdC5zY3JlZW5zLCByZXZpZXdNdWx0aVNlbGVjdCwgcmV2aWV3U2VsZWN0aW9uc10pXG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KSlcbiAgfSwgW10pXG5cbiAgY29uc3QgY2xvc2VSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0UmV2aWV3RW5hYmxlZChmYWxzZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uXSlcblxuICBjb25zdCBob3ZlclJldmlld0JyZWFkY3J1bWIgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IGVsZW1lbnQgfHwgbnVsbFxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHtcbiAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBzZXRJbnRlcmFjdGl2ZSh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gIH0sIFtjbG9zZVJldmlldywgcmV2aWV3RW5hYmxlZF0pXG5cbiAgY29uc3Qgb3BlblJldmlld1BhbmVsID0gKCkgPT4ge1xuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7IHNob3dDYW52YXNJbmRleDogdmlzaWJsZSB9KVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSlcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUoc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4KVxuICAgIHNldENhbnZhc0luZGV4UG9zaXRpb24obnVsbClcbiAgfSwgW3Byb2plY3QubmFtZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJyAmJiAhZXZlbnQucmVwZWF0ICYmICFpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hvcnRjdXQgPSBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpXG4gICAgICBpZiAoIXNob3J0Y3V0KSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCAhPT0gJ2VzY2FwZScgJiYgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycgJiYgIWlzRGVtbykgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnICYmIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVyblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdjYW52YXMnKSBzZXRNb2RlKCdjYW52YXMnKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycpIHNldE1vZGUoJ2RlbW8nKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW50ZXJhY3Rpb24nKSBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ3JldmlldycpIHRvZ2dsZVJldmlldygpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbW1lcnNpdmUnKSB0b2dnbGVJbW1lcnNpdmUoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnYnJvd3Nlci1mdWxsc2NyZWVuJykgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4oKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnKSBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdoZWxwJykge1xuICAgICAgICBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgaWYgKGhlbHBWaXNpYmxlKSBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICAgICAgZWxzZSBpZiAocmV2aWV3RW5hYmxlZCkgY2xvc2VSZXZpZXcoKVxuICAgICAgICBlbHNlIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtcbiAgICBjbG9zZVJldmlldyxcbiAgICBkZW1vQXZhaWxhYmxlLFxuICAgIGV4aXRJbW1lcnNpdmUsXG4gICAgaGVscFZpc2libGUsXG4gICAgaW1tZXJzaXZlLFxuICAgIGlzRGVtbyxcbiAgICByZXZpZXdFbmFibGVkLFxuICAgIHNldE1vZGUsXG4gICAgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4sXG4gICAgdG9nZ2xlSW1tZXJzaXZlLFxuICAgIHRvZ2dsZVJldmlldyxcbiAgXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnZGVtbycpIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfSwgW21vZGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3luYyA9ICgpID0+IHNldEJyb3dzZXJGdWxsc2NyZWVuKCEhZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGXHVGRjA4Q3RybCsxXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NzUzQlx1Njc3RlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2RlbW8nID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdkZW1vJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMDhDdHJsKzJcdUZGMDlcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBXHVGRjA4Q3RybCtIXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoZWxwVmlzaWJsZX1cbiAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcdUZGMDhDdHJsK01cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlUmV2aWV3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2ltbWVyc2l2ZSA/ICdcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnIDogJ1x1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRid9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRlx1RkYwOEN0cmwrRlx1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVJbW1lcnNpdmV9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJmdWxsc2NyZWVuXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1NUM0Rjwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHModHJ1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU1QzU1XHU1RjAwPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyhmYWxzZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTY1MzZcdThENzc8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLXRvb2xiYXItaWNvbi1idXR0b24tLXByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2V4cG9ydGluZyB8fCBzZWxlY3RlZElkcy5zaXplID09PSAwIHx8IG1vZGUgPT09ICdkZW1vJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2V4cG9ydGluZyA/ICdcdTZCNjNcdTU3MjhcdTVCRkNcdTUxRkEnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RFx1RkYwOCR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1XHVGRjA5YH1cbiAgICAgICAgICAgIHRpdGxlPXtleHBvcnRpbmcgPyAnXHU1QkZDXHU1MUZBXHU0RTJEXHUyMDI2JyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0QgJHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwb3J0SWRzKFsuLi5zZWxlY3RlZElkc10pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZG93bmxvYWRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWNvdW50XCI+e2V4cG9ydGluZyA/ICdcdTIwMjYnIDogc2VsZWN0ZWRJZHMuc2l6ZX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTYyNTNcdTUzMDVcdTRFMEJcdThGN0Q8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIHtleHBvcnRFcnJvciA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2V4cG9ydEVycm9yfTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHtpbW1lcnNpdmUgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1pbW1lcnNpdmUtY2hyb21lJHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnJyA6ICcgaXMtY29sbGFwc2VkJ31gfVxuICAgICAgICAgIHJvbGU9XCJ0b29sYmFyXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2Qzg5XHU2RDc4XHU2M0E3XHU0RUY2XCJcbiAgICAgICAgPlxuICAgICAgICAgIHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWltbWVyc2l2ZS1jb250cm9sc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1RkYwOEVzY1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXhpdEltbWVyc2l2ZX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1OTAwMFx1NTFGQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU5MDAwXHU1MUZBXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4Q3RybCtTaGlmdCtGXHVGRjA5JyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDhDdHJsK1NoaWZ0K0ZcdUZGMDknfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOEN0cmwrSFx1RkYwOVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgY2FudmFzSW5kZXhWaXNpYmxlPXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgY2FudmFzSW5kZXhQb3NpdGlvbj17Y2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2U9e3NldENhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgb25DbG9zZUNhbnZhc0luZGV4PXsoKSA9PiB1cGRhdGVDYW52YXNJbmRleFZpc2libGUoZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPERlbW9Nb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBob3RzcG90c1Zpc2libGU9e2hvdHNwb3RzVmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3Jldmlld0VuYWJsZWQgPyAoXG4gICAgICAgIDxSZXZpZXdNYXJrZXJzIGJvYXJkUmVmPXtib2FyZFJlZn0gaXRlbXM9e3Jldmlld0l0ZW1zfSBvbk9wZW5QYW5lbD17b3BlblJldmlld1BhbmVsfSAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8UmV2aWV3TGF1bmNoZXJcbiAgICAgICAgYm9hcmRSZWY9e2JvYXJkUmVmfVxuICAgICAgICBjb3VudD17cmV2aWV3SXRlbXMubGVuZ3RofVxuICAgICAgICBwcm9qZWN0TmFtZT17cHJvamVjdC5uYW1lfVxuICAgICAgICBvbk9wZW49e29wZW5SZXZpZXdQYW5lbH1cbiAgICAgIC8+XG4gICAgICB7aGVscFZpc2libGUgPyAoXG4gICAgICAgIDxTaG9ydGN1dEhlbHBcbiAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgIHNob3dDYW52YXNJbmRleD17Y2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlPXt1cGRhdGVDYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SGVscFZpc2libGUoZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdQYW5lbFZpc2libGUgPyAoXG4gICAgICAgIDxSZXZpZXdQYW5lbFxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgc2VsZWN0aW9ucz17cmV2aWV3U2VsZWN0aW9uc31cbiAgICAgICAgICBtdWx0aVNlbGVjdD17cmV2aWV3TXVsdGlTZWxlY3R9XG4gICAgICAgICAgaXRlbXM9e3Jldmlld0l0ZW1zfVxuICAgICAgICAgIG9uVG9nZ2xlTXVsdGlTZWxlY3Q9eygpID0+IHNldFJldmlld011bHRpU2VsZWN0KCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICBvblNlbGVjdEVsZW1lbnQ9eyhlbGVtZW50KSA9PiBzZWxlY3RSZXZpZXdFbGVtZW50KGVsZW1lbnQsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV0/LmVsZW1lbnQsXG4gICAgICAgICAgfSl9XG4gICAgICAgICAgb25Ib3ZlckVsZW1lbnQ9e2hvdmVyUmV2aWV3QnJlYWRjcnVtYn1cbiAgICAgICAgICBvblJlbW92ZVNlbGVjdGlvbj17cmVtb3ZlUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQ2xlYXJTZWxlY3Rpb249e2NsZWFyUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgICBvblJlbW92ZUl0ZW09e3JlbW92ZVJldmlld0l0ZW19XG4gICAgICAgICAgb25DbG9zZT17Y2xvc2VSZXZpZXd9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIndmLWNob2ljZS1pbnB1dFwiIHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2hvaWNlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtZmllbGQtbGFiZWxcIiBodG1sRm9yPXtodG1sRm9yfT57bGFiZWx9PC9sYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICAgIHtoaW50ICYmICFlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2Vycm9yfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGNyZWF0ZUZsb3dQcm9wcyB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VIZWFkZXIoeyB0aXRsZSwgdGl0bGVJZCwgc3VidGl0bGUsIHN1YnRpdGxlSWQsIGFjdGlvbnMsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyIGNsYXNzTmFtZT17YHdmLXBhZ2UtaGVhZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtaGVhZGVyLWNvcHlcIj5cbiAgICAgICAgPGgxIGlkPXt0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXRpdGxlXCI+e3RpdGxlfTwvaDE+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxwIGlkPXtzdWJ0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvcD4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7YWN0aW9ucyA/IDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1hY3Rpb25zXCI+e2FjdGlvbnN9PC9kaXY+IDogbnVsbH1cbiAgICA8L2hlYWRlcj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOYXZpZ2F0aW9uTGlzdCh7IGFzLCBpdGVtcywgYWN0aXZlSWQsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGFzLFxuICAgIHsgY2xhc3NOYW1lLCAuLi5yZXN0IH0sXG4gICAgaXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtbmF2LWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi1uYXYtaXRlbSd9XG4gICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZGVOYXYoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxOYXZpZ2F0aW9uTGlzdFxuICAgICAgYXM9XCJuYXZcIlxuICAgICAgaXRlbXM9e2l0ZW1zfVxuICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUlkfVxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc2lkZS1uYXYgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJCYXIoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtdGFiLWJhciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtdGFiLWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi10YWItaXRlbSd9XG4gICAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyZWFkY3J1bWJzKHsgaXRlbXMgPSBbXSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtYnJlYWRjcnVtYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IGFyaWEtbGFiZWw9XCJCcmVhZGNydW1ic1wiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Ake2l0ZW0ubGFiZWx9LSR7aW5kZXh9YH0+XG4gICAgICAgICAge2luZGV4ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItZGl2aWRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXRlbS50byA/IChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1saW5rXCIgdHlwZT1cImJ1dHRvblwiIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9PlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWN1cnJlbnRcIj57aXRlbS5sYWJlbH08L3NwYW4+fVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuLyoqIFx1NzlGQlx1NTJBOFx1N0FFRlx1NjU3NFx1NUM0Rlx1NThGM1x1RkYxQVx1NTE4NVx1NUJCOVx1NTMzQVx1NTNFRlx1NkVEQVx1RkYwQ1RhYkJhciBcdThEMzRcdTVFOTVcdTMwMDJ0YWJzIC8gYWN0aXZlSWQgXHU0RTBFIFRhYkJhciBcdTc2RjhcdTU0MENcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVTaGVsbCh7IGNoaWxkcmVuLCB0YWJzID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tb2JpbGUtc2hlbGwgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIndmLW1vYmlsZS1zaGVsbC1ib2R5XCI+e2NoaWxkcmVufTwvbWFpbj5cbiAgICAgIHt0YWJzLmxlbmd0aCA+IDAgPyA8VGFiQmFyIGl0ZW1zPXt0YWJzfSBhY3RpdmVJZD17YWN0aXZlSWR9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBDZWxsKHsgdG8sIG9uQ2xpY2ssIHRpdGxlLCBzdWJ0aXRsZSwgdmFsdWUsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNlbGwgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jZWxsLW1haW5cIj5cbiAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1jZWxsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICB7c3VidGl0bGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkXCI+XG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkaW5nXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+e2NvbHVtbi5sYWJlbH08L3RoPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cIndmLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0tleSA9IGdldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtcm93XCIgZGF0YS13Zi1rZXk9e3Jvd0tleX0ga2V5PXtyb3dLZXl9PlxuICAgICAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2YtdGFibGUtY2VsbFwiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9PlxuICAgICAgICAgICAgICAgICAgICB7Y29sdW1uLnJlbmRlciA/IGNvbHVtbi5yZW5kZXIocm93W2NvbHVtbi5rZXldLCByb3cpIDogcm93W2NvbHVtbi5rZXldfVxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgb25DaGFuZ2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJ0YWJsaXN0XCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtdGFiLWNvbnRyb2xcIlxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2l0ZW0uaWQgPT09IGFjdGl2ZUlkfVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZT8uKGl0ZW0uaWQpfVxuICAgICAgICA+XG4gICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBzKHtcbiAgaXRlbXMgPSBbXSxcbiAgY3VycmVudCA9IDAsXG4gIGRpcmVjdGlvbiA9ICdob3Jpem9udGFsJyxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgdmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCdcbiAgcmV0dXJuIChcbiAgICA8b2xcbiAgICAgIGNsYXNzTmFtZT17YHdmLXN0ZXBzICR7dmVydGljYWwgPyAnd2Ytc3RlcHMtdmVydGljYWwnIDogJ3dmLXN0ZXBzLWhvcml6b250YWwnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGluZGV4IDwgY3VycmVudCA/ICdkb25lJyA6IGluZGV4ID09PSBjdXJyZW50ID8gJ2N1cnJlbnQnIDogJ3RvZG8nXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17YHdmLXN0ZXBzLWl0ZW0gd2Ytc3RlcHMtaXRlbS0ke3N0YXR1c31gfSBrZXk9e2l0ZW0uaWQgfHwgaXRlbS5sYWJlbCB8fCBpbmRleH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwLW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzID09PSAnZG9uZScgPyBudWxsIDogaW5kZXggKyAxfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHtpbmRleCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1saW5lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIHtpdGVtLmRlc2NyaXB0aW9uID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtZGVzY1wiPntpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfSl9XG4gICAgPC9vbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRW1wdHlTdGF0ZSh7IHRpdGxlLCBkZXNjcmlwdGlvbiwgYWN0aW9uLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1lbXB0eS1zdGF0ZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZW1wdHktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7dGl0bGUgPyA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWVtcHR5LXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICB7ZGVzY3JpcHRpb24gPyA8cCBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1kZXNjXCI+e2Rlc2NyaXB0aW9ufTwvcD4gOiBudWxsfVxuICAgICAge2FjdGlvbiA/IDxkaXYgY2xhc3NOYW1lPVwid2YtZW1wdHktYWN0aW9uXCI+e2FjdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHsgQ29sdW1uLCBSb3csIFNpZGVOYXYsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTY3JlZW5JZCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcblxuY29uc3QgTkFWX0lURU1TID0gW1xuICB7IGxhYmVsOiAnXHU1REU1XHU0RjVDXHU1MzNBJywgdG86ICd3b3Jrc3BhY2UnIH0sXG4gIHsgbGFiZWw6ICdDb2xsZWN0aW9ucycsIHRvOiAnY29sbGVjdGlvbicgfSxcbiAgeyBsYWJlbDogJ1x1NzNBRlx1NTg4MycsIHRvOiAnZW52aXJvbm1lbnRzJyB9LFxuICB7IGxhYmVsOiAnXHU1Mzg2XHU1M0YyJywgdG86ICdoaXN0b3J5JyB9LFxuICB7IGxhYmVsOiAnXHU4QkJFXHU3RjZFJywgdG86ICdzZXR0aW5ncycgfSxcbl1cblxuY29uc3QgQUNUSVZFX0FMSUFTID0ge1xuICAncmVxdWVzdC1lZGl0b3InOiAnY29sbGVjdGlvbicsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcHBTaGVsbCh7IGNoaWxkcmVuLCBhc2lkZSB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICBjb25zdCBhY3RpdmVJZCA9IEFDVElWRV9BTElBU1tzY3JlZW5JZF0gfHwgc2NyZWVuSWRcblxuICByZXR1cm4gKFxuICAgIDxSb3cgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBnYXA6IDAgfX0+XG4gICAgICA8Q29sdW1uXG4gICAgICAgIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX3JhaWxcIlxuICAgICAgICBnYXA9ezE2fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICBwYWRkaW5nOiAnMjBweCAxMnB4JyxcbiAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAndmFyKC0td2YtNTApJyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZFwiIGdhcD17NH0+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDE1IH19PkFQSSBDbGllbnQ8L3N0cm9uZz5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1tZXRhXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogJ3ZhcigtLXdmLTYwMCknIH19PlxuICAgICAgICAgICAgV29ya3NwYWNlIFx1MDBCNyBEZW1vXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPFNpZGVOYXYgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fbmF2XCIgYWN0aXZlSWQ9e2FjdGl2ZUlkfSBpdGVtcz17TkFWX0lURU1TfSAvPlxuICAgICAgPC9Db2x1bW4+XG4gICAgICB7YXNpZGUgPyAoXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19hc2lkZVwiXG4gICAgICAgICAgZ2FwPXsxMn1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDI2MCxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTZweCAxMnB4JyxcbiAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnMXB4IHNvbGlkIHZhcigtLXdmLTMwMCknLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICd2YXIoLS13Zi0xMDApJyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2FzaWRlfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPENvbHVtblxuICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19tYWluXCJcbiAgICAgICAgZ2FwPXswfVxuICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCwgb3ZlcmZsb3c6ICdhdXRvJyB9fVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L1Jvdz5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBGT0xERVJTID0gW1xuICB7XG4gICAgaWQ6ICdmb2xkZXItdXNlcnMnLFxuICAgIG5hbWU6ICdVc2VycycsXG4gICAgcmVxdWVzdHM6IFtcbiAgICAgIHsgaWQ6ICdyZXEtbGlzdC11c2VycycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdMaXN0IFVzZXJzJywgcGF0aDogJy92MS91c2VycycgfSxcbiAgICAgIHsgaWQ6ICdyZXEtZ2V0LXVzZXInLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnR2V0IFVzZXInLCBwYXRoOiAnL3YxL3VzZXJzLzppZCcgfSxcbiAgICAgIHsgaWQ6ICdyZXEtdXBkYXRlLXVzZXInLCBtZXRob2Q6ICdQQVRDSCcsIG5hbWU6ICdVcGRhdGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkJyB9LFxuICAgICAgeyBpZDogJ3JlcS1kaXNhYmxlLXVzZXInLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0Rpc2FibGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkL2Rpc2FibGUnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLXJvbGVzJyxcbiAgICBuYW1lOiAnUm9sZXMnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWxpc3Qtcm9sZXMnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnTGlzdCBSb2xlcycsIHBhdGg6ICcvdjEvcm9sZXMnIH0sXG4gICAgICB7IGlkOiAncmVxLWFzc2lnbi1yb2xlJywgbWV0aG9kOiAnUFVUJywgbmFtZTogJ0Fzc2lnbiBSb2xlJywgcGF0aDogJy92MS91c2Vycy86aWQvcm9sZXMnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLWF1ZGl0JyxcbiAgICBuYW1lOiAnQXVkaXQnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWF1ZGl0LWxvZycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdBdWRpdCBMb2cnLCBwYXRoOiAnL3YxL2F1ZGl0L2xvZ3MnIH0sXG4gICAgICB7IGlkOiAncmVxLWV4cG9ydC1hdWRpdCcsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnRXhwb3J0IEF1ZGl0JywgcGF0aDogJy92MS9hdWRpdC9leHBvcnQnIH0sXG4gICAgXSxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbGxlY3Rpb25TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsXG4gICAgICBhc2lkZT17XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXRyZWVcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlXCIgZ2FwPXsxNH0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLXRpdGxlXCIgbGV2ZWw9ezN9PlVzZXIgQVBJPC9IZWFkaW5nPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj4rPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0ZPTERFUlMubWFwKChmb2xkZXIpID0+IChcbiAgICAgICAgICAgIDxDb2x1bW5cbiAgICAgICAgICAgICAga2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2ZvbGRlclwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGdhcD17Nn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fZm9sZGVyLW5hbWVcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cbiAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAge2ZvbGRlci5yZXF1ZXN0cy5tYXAoKHJlcSkgPT4gKFxuICAgICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAgICBrZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3RcIlxuICAgICAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMHB4JyB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3QtbWV0aG9kXCI+e3JlcS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDEzIH19PntyZXEubmFtZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXBhZ2VcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJjb2xsZWN0aW9uLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImNvbGxlY3Rpb24tdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJVc2VyIEFQSVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJDb2xsZWN0aW9uIFx1MDBCNyAzIFx1NEUyQVx1NjU4N1x1NEVGNlx1NTkzOSBcdTAwQjcgOCBcdTRFMkFcdThCRjdcdTZDNDJcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fYWN0aW9uLXJ1blwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5SdW4gY29sbGVjdGlvbjwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2FjdGlvbi1uZXdcIiB0bz1cInJlcXVlc3QtZWRpdG9yXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTY1QjBcdTVFRkFcdThCRjdcdTZDNDI8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q2FyZCBpZD1cImNvbGxlY3Rpb24tbWV0YVwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGFcIiBzdHlsZT17eyBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtcm93XCIgZ2FwPXsyNH0+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+QmFzZSBVUkw8L1RleHQ+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS12YWx1ZVwiPnsne3tiYXNlVXJsfX0nfTwvc3Ryb25nPlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+XHU2Mzg4XHU2NzQzPC9UZXh0PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtdmFsdWVcIj5CZWFyZXIgVG9rZW48L3N0cm9uZz5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWl0ZW1cIiBnYXA9ezR9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWxhYmVsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19Plx1NjZGNFx1NjVCMDwvVGV4dD5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXZhbHVlXCI+XHU0RUNBXHU1OTI5IDEwOjI0PC9zdHJvbmc+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLWxpc3RcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC10aXRsZVwiIGxldmVsPXszfT5cdTUxNjhcdTkwRThcdThCRjdcdTZDNDI8L0hlYWRpbmc+XG4gICAgICAgICAge0ZPTERFUlMuZmxhdE1hcCgoZm9sZGVyKSA9PlxuICAgICAgICAgICAgZm9sZGVyLnJlcXVlc3RzLm1hcCgocmVxKSA9PiAoXG4gICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAga2V5PXtyZXEuaWR9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1pdGVtXCJcbiAgICAgICAgICAgICAgICBkYXRhLXdmLWtleT17YGxpc3QtJHtyZXEuaWR9YH1cbiAgICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW1ldGhvZFwiPntyZXEubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW5hbWVcIj57cmVxLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtcGF0aFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9IFx1MDBCNyB7cmVxLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW9wZW5cIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+XHU2MjUzXHU1RjAwPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICkpLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgRU5WX0xJU1QgPSBbXG4gIHsgaWQ6ICdlbnYtc3RhZ2luZycsIG5hbWU6ICdTdGFnaW5nJywgYWN0aXZlOiB0cnVlLCB2YXJzOiA2IH0sXG4gIHsgaWQ6ICdlbnYtcHJvZCcsIG5hbWU6ICdQcm9kdWN0aW9uJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNiB9LFxuICB7IGlkOiAnZW52LWxvY2FsJywgbmFtZTogJ0xvY2FsJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNCB9LFxuXVxuXG5jb25zdCBWQVJfUk9XUyA9IFtcbiAgeyBpZDogJ3YtYmFzZScsIGtleTogJ2Jhc2VVcmwnLCBpbml0aWFsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbScsIGN1cnJlbnQ6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tJyB9LFxuICB7IGlkOiAndi10b2tlbicsIGtleTogJ3Rva2VuJywgaW5pdGlhbDogJ3N0X2RlbW9fKioqKicsIGN1cnJlbnQ6ICdzdF9kZW1vXyoqKionIH0sXG4gIHsgaWQ6ICd2LXRlbmFudCcsIGtleTogJ3RlbmFudElkJywgaW5pdGlhbDogJ3RuXzEwMDg2JywgY3VycmVudDogJ3RuXzEwMDg2JyB9LFxuICB7IGlkOiAndi10aW1lb3V0Jywga2V5OiAndGltZW91dE1zJywgaW5pdGlhbDogJzE1MDAwJywgY3VycmVudDogJzE1MDAwJyB9LFxuICB7IGlkOiAndi1sb2NhbGUnLCBrZXk6ICdsb2NhbGUnLCBpbml0aWFsOiAnemgtQ04nLCBjdXJyZW50OiAnemgtQ04nIH0sXG5dXG5cbmNvbnN0IFZBUl9DT0xVTU5TID0gW1xuICB7IGtleTogJ2tleScsIGxhYmVsOiAnVmFyaWFibGUnIH0sXG4gIHsga2V5OiAnaW5pdGlhbCcsIGxhYmVsOiAnSW5pdGlhbCBWYWx1ZScgfSxcbiAgeyBrZXk6ICdjdXJyZW50JywgbGFiZWw6ICdDdXJyZW50IFZhbHVlJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gRW52aXJvbm1lbnRzU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJlbnZpcm9ubWVudHMtcGFnZVwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZW52aXJvbm1lbnRzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImVudmlyb25tZW50cy10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTcyOFx1OEJGN1x1NkM0MiBVUkwgLyBIZWFkZXIgLyBCb2R5IFx1NEUyRFx1OTAxQVx1OEZDNyB7e3Zhcn19IFx1NUYxNVx1NzUyOFwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19hY3Rpb24tYWRkXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTZERkJcdTUyQTBcdTUzRDhcdTkxQ0Y8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Um93IGlkPVwiZW52aXJvbm1lbnRzLXBpY2tlclwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyXCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyLWxhYmVsXCI+XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzPC9UZXh0PlxuICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19zZWxlY3RcIiBkZWZhdWx0VmFsdWU9XCJTdGFnaW5nXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgIDxvcHRpb24+U3RhZ2luZzwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uPkxvY2FsPC9vcHRpb24+XG4gICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aXZlLWJhZGdlXCI+QWN0aXZlPC9CYWRnZT5cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPFJvdyBpZD1cImVudmlyb25tZW50cy1jYXJkc1wiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICB7RU5WX0xJU1QubWFwKChlbnYpID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmRcIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbmFtZVwiPntlbnYubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICB7ZW52LmFjdGl2ZSA/IDxCYWRnZSBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtYmFkZ2VcIj5cdTRGN0ZcdTc1MjhcdTRFMkQ8L0JhZGdlPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbWV0YVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgbWFyZ2luVG9wOiA2IH19PlxuICAgICAgICAgICAgICAgIHtlbnYudmFyc30gXHU0RTJBXHU1M0Q4XHU5MUNGXG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImVudmlyb25tZW50cy10YWJsZS13cmFwXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS13cmFwXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5TdGFnaW5nIFx1NTNEOFx1OTFDRjwvVGV4dD5cbiAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICBpZD1cImVudmlyb25tZW50cy10YWJsZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3RhYmxlXCJcbiAgICAgICAgICAgIGNvbHVtbnM9e1ZBUl9DT0xVTU5TfVxuICAgICAgICAgICAgcm93cz17VkFSX1JPV1N9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IEhJU1RPUlkgPSBbXG4gIHtcbiAgICBpZDogJ2hpc3QtMScsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBuYW1lOiAnTGlzdCBVc2VycycsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS91c2Vycz9wYWdlPTEnLFxuICAgIHN0YXR1czogJzIwMCcsXG4gICAgdGltZTogJzE0MiBtcycsXG4gICAgYXQ6ICdcdTRFQ0FcdTU5MjkgMTQ6MjE6MDgnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTInLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIG5hbWU6ICdDcmVhdGUgT3JkZXInLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvb3JkZXJzJyxcbiAgICBzdGF0dXM6ICcyMDEnLFxuICAgIHRpbWU6ICczMTAgbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDEzOjU1OjQxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC0zJyxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBuYW1lOiAnTG9naW4nLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvYXV0aC9sb2dpbicsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnOTggbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDExOjAyOjE3JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC00JyxcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIG5hbWU6ICdHZXQgSW52b2ljZScsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9iaWxsaW5nL2ludm9pY2VzL2ludl84OCcsXG4gICAgc3RhdHVzOiAnNDA0JyxcbiAgICB0aW1lOiAnNjcgbXMnLFxuICAgIGF0OiAnXHU2NjI4XHU1OTI5IDE5OjQ0OjAzJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC01JyxcbiAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgbmFtZTogJ1VwZGF0ZSBVc2VyJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL3VzZXJzL3VfMTAwMScsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnMTg4IG1zJyxcbiAgICBhdDogJ1x1NjYyOFx1NTkyOSAxNjoxMjo1MCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtNicsXG4gICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICBuYW1lOiAnUmV2b2tlIFRva2VuJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL2F1dGgvdG9rZW4nLFxuICAgIHN0YXR1czogJzIwNCcsXG4gICAgdGltZTogJzU0IG1zJyxcbiAgICBhdDogJzA4LTA4IDIxOjA2OjIyJyxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEhpc3RvcnlTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktcGFnZVwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImhpc3RvcnktaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiaGlzdG9yeS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTY3MkNcdTY3M0FcdTY3MDBcdThGRDFcdTUzRDFcdTkwMDFcdTc2ODRcdThCRjdcdTZDNDJcdUZGMENcdTUzRUZcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTUyMzBcdTdGMTZcdThGOTFcdTU2NjhcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLWNsZWFyXCI+XHU2RTA1XHU3QTdBXHU1Mzg2XHU1M0YyPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktbGlzdFwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX2xpc3RcIiBnYXA9ezEwfT5cbiAgICAgICAgICB7SElTVE9SWS5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbVwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTIgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1tZXRob2RcIj57aXRlbS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXVybFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT57aXRlbS51cmx9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1hdFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6ICd2YXIoLS13Zi02MDApJyB9fT5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0uYXR9XG4gICAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tc3RhdHVzXCI+e2l0ZW0uc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tdGltZVwiPntpdGVtLnRpbWV9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tb3BlblwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5cdTYyNTNcdTVGMDA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGFicyxcbiAgVGV4dCxcbiAgVGV4dEFyZWEsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgUEFSQU1fUk9XUyA9IFtcbiAgeyBpZDogJ3AtcGFnZScsIGtleTogJ3BhZ2UnLCB2YWx1ZTogJzEnLCBkZXNjOiAnXHU5ODc1XHU3ODAxJyB9LFxuICB7IGlkOiAncC1zaXplJywga2V5OiAnc2l6ZScsIHZhbHVlOiAnMjAnLCBkZXNjOiAnXHU2QkNGXHU5ODc1XHU2NzYxXHU2NTcwJyB9LFxuICB7IGlkOiAncC1xJywga2V5OiAncScsIHZhbHVlOiAnYWxpY2UnLCBkZXNjOiAnXHU1MTczXHU5NTJFXHU1QjU3XHU2NDFDXHU3RDIyJyB9LFxuICB7IGlkOiAncC1zdGF0dXMnLCBrZXk6ICdzdGF0dXMnLCB2YWx1ZTogJ2FjdGl2ZScsIGRlc2M6ICdcdTc1MjhcdTYyMzdcdTcyQjZcdTYwMDEnIH0sXG5dXG5cbmNvbnN0IEhFQURFUl9ST1dTID0gW1xuICB7IGlkOiAnaC1hdXRoJywga2V5OiAnQXV0aG9yaXphdGlvbicsIHZhbHVlOiAnQmVhcmVyIHt7dG9rZW59fScsIGRlc2M6ICdcdThCQkZcdTk1RUVcdTRFRTRcdTcyNEMnIH0sXG4gIHsgaWQ6ICdoLWFjY2VwdCcsIGtleTogJ0FjY2VwdCcsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbicsIGRlc2M6ICcnIH0sXG4gIHsgaWQ6ICdoLXRyYWNlJywga2V5OiAnWC1SZXF1ZXN0LUlkJywgdmFsdWU6ICd7eyRndWlkfX0nLCBkZXNjOiAnXHU5NEZFXHU4REVGXHU4RkZEXHU4RTJBJyB9LFxuICB7IGlkOiAnaC1jbGllbnQnLCBrZXk6ICdYLUNsaWVudCcsIHZhbHVlOiAnYXBpLWNsaWVudC1kZW1vJywgZGVzYzogJycgfSxcbl1cblxuY29uc3QgUEFSQU1fQ09MVU1OUyA9IFtcbiAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0tleScgfSxcbiAgeyBrZXk6ICd2YWx1ZScsIGxhYmVsOiAnVmFsdWUnIH0sXG4gIHsga2V5OiAnZGVzYycsIGxhYmVsOiAnRGVzY3JpcHRpb24nIH0sXG5dXG5cbmNvbnN0IFJFU1BPTlNFX0pTT04gPSBge1xuICBcImRhdGFcIjogW1xuICAgIHsgXCJpZFwiOiBcInVfMTAwMVwiLCBcIm5hbWVcIjogXCJBbGljZVwiLCBcInJvbGVcIjogXCJhZG1pblwiIH0sXG4gICAgeyBcImlkXCI6IFwidV8xMDAyXCIsIFwibmFtZVwiOiBcIkJvYlwiLCBcInJvbGVcIjogXCJlZGl0b3JcIiB9LFxuICAgIHsgXCJpZFwiOiBcInVfMTAwM1wiLCBcIm5hbWVcIjogXCJDYXJvbFwiLCBcInJvbGVcIjogXCJ2aWV3ZXJcIiB9XG4gIF0sXG4gIFwicGFnZVwiOiAxLFxuICBcInRvdGFsXCI6IDEyOFxufWBcblxuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3RFZGl0b3JTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgncGFyYW1zJylcbiAgY29uc3QgW3Jlc3BUYWIsIHNldFJlc3BUYWJdID0gUmVhY3QudXNlU3RhdGUoJ2JvZHknKVxuXG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cInJlcXVlc3QtZWRpdG9yLXBhZ2VcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcGFnZVwiIGdhcD17MH0gc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScgfX0+XG4gICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3RvcFwiIGdhcD17MTJ9IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHggMTJweCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyB9fT5cbiAgICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGVJZD1cInJlcXVlc3QtZWRpdG9yLXRpdGxlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGU9XCJMaXN0IFVzZXJzXCJcbiAgICAgICAgICAgIHN1YnRpdGxlPVwiVXNlciBBUEkgLyBVc2Vyc1wiXG4gICAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2FjdGlvbi1jb2xsZWN0aW9uXCIgdG89XCJjb2xsZWN0aW9uXCI+XHU4RkQ0XHU1NkRFIENvbGxlY3Rpb248L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hY3Rpb24tc2F2ZVwiIHRvPVwiY29sbGVjdGlvblwiPlNhdmU8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIDxSb3cgaWQ9XCJyZXF1ZXN0LWVkaXRvci11cmxiYXJcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdXJsYmFyXCIgZ2FwPXs4fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19tZXRob2RcIiBkZWZhdWx0VmFsdWU9XCJHRVRcIiBzdHlsZT17eyB3aWR0aDogMTEwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPkdFVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlBPU1Q8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QVVQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QQVRDSDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPkRFTEVURTwvb3B0aW9uPlxuICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdXJsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3VybFwiXG4gICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT1cInt7YmFzZVVybH19L3YxL3VzZXJzXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2VudlwiIGRlZmF1bHRWYWx1ZT1cIlN0YWdpbmdcIiBzdHlsZT17eyB3aWR0aDogMTQwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPlN0YWdpbmc8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+TG9jYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgPEJ1dHRvbiBpZD1cInJlcXVlc3QtZWRpdG9yLXNlbmRcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2VuZFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgIFNlbmRcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuXG4gICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdGFic1wiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGFic1wiXG4gICAgICAgICAgICBhY3RpdmVJZD17dGFifVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdwYXJhbXMnLCBsYWJlbDogJ1BhcmFtcycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2hlYWRlcnMnLCBsYWJlbDogJ0hlYWRlcnMnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnYXV0aCcsIGxhYmVsOiAnQXV0aG9yaXphdGlvbicgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIHt0YWIgPT09ICdwYXJhbXMnID8gKFxuICAgICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXBhcmFtc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19wYXJhbXNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtQQVJBTV9ST1dTfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2hlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtIRUFERVJfUk9XU31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dGFiID09PSAnYm9keScgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWJvZHlcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keVwiIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19PlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LXRvb2xiYXJcIiBnYXA9ezh9IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogOCB9fT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktdHlwZVwiPnJhdzwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LWZvcm1hdFwiPkpTT048L0JhZGdlPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPFRleHRBcmVhXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktaW5wdXRcIlxuICAgICAgICAgICAgICAgIHJvd3M9ezZ9XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXsne1xcbiAgXCJub3RlXCI6IFwiR0VUIFx1OEJGN1x1NkM0Mlx1OTAxQVx1NUUzOFx1NjVFMCBCb2R5XHVGRjBDXHU2QjY0XHU1OTA0XHU0RUM1XHU3OTNBXHU2MTBGXHU3RjE2XHU4RjkxXHU1MzNBXCJcXG59J31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdhdXRoJyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItYXV0aFwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoXCIgc3R5bGU9e3sgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtZmllbGRzXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1yb3dcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1sYWJlbFwiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fT5UeXBlPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC10eXBlXCIgZGVmYXVsdFZhbHVlPVwiQmVhcmVyIFRva2VuXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5CZWFyZXIgVG9rZW48L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5BUEkgS2V5PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+QmFzaWMgQXV0aDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPk5vIEF1dGg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtcm93XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtbGFiZWxcIiBzdHlsZT17eyB3aWR0aDogODAgfX0+VG9rZW48L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXRva2VuXCJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPVwie3t0b2tlbn19XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2VcIlxuICAgICAgICAgIGdhcD17MTB9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMjQsIGJhY2tncm91bmQ6ICd2YXIoLS13Zi01MCknLCBtaW5IZWlnaHQ6IDI4MCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS10aXRsZVwiIGxldmVsPXszfT5SZXNwb25zZTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLW1ldGFcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3N0YXR1c1wiPjIwMCBPSzwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGltZVwiPjE0MiBtczwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2l6ZVwiPjMuMiBLQjwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L1Jvdz5cblxuICAgICAgICAgIDxUYWJzXG4gICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgYWN0aXZlSWQ9e3Jlc3BUYWJ9XG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0UmVzcFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnaGVhZGVycycsIGxhYmVsOiAnSGVhZGVycycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2Nvb2tpZXMnLCBsYWJlbDogJ0Nvb2tpZXMnIH0sXG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICB7cmVzcFRhYiA9PT0gJ2JvZHknID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1ib2R5XCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWJvZHlcIiBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fT5cbiAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1qc29uXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAxMiwgd2hpdGVTcGFjZTogJ3ByZS13cmFwJywgZm9udEZhbWlseTogJ3VpLW1vbm9zcGFjZSwgbW9ub3NwYWNlJyB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge1JFU1BPTlNFX0pTT059XG4gICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3Jlc3BUYWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWhlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtbXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0hlYWRlcicgfSxcbiAgICAgICAgICAgICAgICB7IGtleTogJ3ZhbHVlJywgbGFiZWw6ICdWYWx1ZScgfSxcbiAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgcm93cz17W1xuICAgICAgICAgICAgICAgIHsgaWQ6ICdyaC1jdCcsIGtleTogJ2NvbnRlbnQtdHlwZScsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtY2FjaGUnLCBrZXk6ICdjYWNoZS1jb250cm9sJywgdmFsdWU6ICduby1zdG9yZScgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtcmVxJywga2V5OiAneC1yZXF1ZXN0LWlkJywgdmFsdWU6ICdyZXFfOGYzYTJjJyB9LFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHtyZXNwVGFiID09PSAnY29va2llcycgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWNvb2tpZXNcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llc1wiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llcy1lbXB0eVwiPlx1NjcyQ1x1NkIyMVx1NTRDRFx1NUU5NFx1NjcyQVx1OEJCRVx1N0Y2RSBDb29raWU8L1RleHQ+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nc1NjcmVlbigpIHtcbiAgY29uc3QgW3NzbCwgc2V0U3NsXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtmb2xsb3dSZWRpcmVjdCwgc2V0Rm9sbG93UmVkaXJlY3RdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3Byb3h5LCBzZXRQcm94eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJzZXR0aW5ncy1wYWdlXCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cInNldHRpbmdzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cInNldHRpbmdzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMUFcdTc1MjhcdTUwNEZcdTU5N0RcdTMwMDFcdTRFRTNcdTc0MDZcdTRFMEVcdThCQzFcdTRFNjZcdUZGMDhcdTdFQkZcdTY4NDZcdTc5M0FcdTYxMEZcdUZGMDlcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtZ2VuZXJhbFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdTkwMUFcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiXHU5RUQ4XHU4QkE0XHU4RDg1XHU2NUY2XHVGRjA4bXNcdUZGMDlcIiBodG1sRm9yPVwic2V0dGluZ3MtdGltZW91dFwiPlxuICAgICAgICAgICAgICA8VGV4dElucHV0IGlkPVwic2V0dGluZ3MtdGltZW91dFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX190aW1lb3V0XCIgZGVmYXVsdFZhbHVlPVwiMTUwMDBcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLWxhYmVsXCI+XHU4MUVBXHU1MkE4XHU4RERGXHU5NjhGXHU5MUNEXHU1QjlBXHU1NDExPC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1yZWRpcmVjdFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3JlZGlyZWN0XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtmb2xsb3dSZWRpcmVjdH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Rm9sbG93UmVkaXJlY3R9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtbGFiZWxcIj5cdTY4MjFcdTlBOENcdThCQzFcdTRFNjZcdUZGMDhTU0xcdUZGMDk8L1RleHQ+XG4gICAgICAgICAgICAgIDxUb2dnbGVcbiAgICAgICAgICAgICAgICBpZD1cInNldHRpbmdzLXNzbFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NzbFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c3NsfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTc2x9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtcHJveHlcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvblwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tYm9keVwiIGdhcD17MTR9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XHU0RUUzXHU3NDA2PC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3Byb3h5fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQcm94eX1cbiAgICAgICAgICAgICAgICBsYWJlbD17cHJveHkgPyAnXHU1RjAwXHU1NDJGJyA6ICdcdTUxNzNcdTk1RUQnfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiSG9zdFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LWhvc3RcIiBkZWZhdWx0VmFsdWU9XCIxMjcuMC4wLjFcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiUG9ydFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LXBvcnRcIiBkZWZhdWx0VmFsdWU9XCI3ODkwXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJzZXR0aW5ncy1jZXJ0c1wiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdThCQzFcdTRFNjY8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtZW1wdHlcIiBzdHlsZT17eyBmb250U2l6ZTogMTMgfX0+XG4gICAgICAgICAgICAgIFx1NUMxQVx1NjcyQVx1NkRGQlx1NTJBMFx1NUJBMlx1NjIzN1x1N0FFRlx1OEJDMVx1NEU2Nlx1MzAwMlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTNFRlx1NTcyOFx1NkI2NFx1NjMwMlx1OEY3RCAucGVtIC8gLnAxMlx1MzAwMlxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtYWRkXCI+XHU2REZCXHU1MkEwXHU4QkMxXHU0RTY2PC9CdXR0b24+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgQ09MTEVDVElPTlMgPSBbXG4gIHtcbiAgICBpZDogJ2NvbC11c2VycycsXG4gICAgbmFtZTogJ1VzZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU3NTI4XHU2MjM3XHU1MjE3XHU4ODY4XHUzMDAxXHU4QkU2XHU2MEM1XHUzMDAxXHU2NkY0XHU2NUIwXHU0RTBFXHU3OTgxXHU3NTI4JyxcbiAgICBjb3VudDogNixcbiAgICB1cGRhdGVkQXQ6ICdcdTRFQ0FcdTU5MjkgMTA6MjQnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtb3JkZXJzJyxcbiAgICBuYW1lOiAnT3JkZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU4QkEyXHU1MzU1XHU2N0U1XHU4QkUyXHUzMDAxXHU1MjFCXHU1RUZBXHUzMDAxXHU1M0Q2XHU2RDg4XHUzMDAxXHU1QzY1XHU3RUE2XHU3MkI2XHU2MDAxJyxcbiAgICBjb3VudDogOSxcbiAgICB1cGRhdGVkQXQ6ICdcdTY2MjhcdTU5MjkgMTg6MDInLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtYXV0aCcsXG4gICAgbmFtZTogJ0F1dGgnLFxuICAgIGRlc2M6ICdcdTc2N0JcdTVGNTVcdTMwMDFcdTUyMzdcdTY1QjAgVG9rZW5cdTMwMDFcdTc2N0JcdTUxRkEnLFxuICAgIGNvdW50OiA0LFxuICAgIHVwZGF0ZWRBdDogJzA4LTA4IDE0OjExJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnY29sLWJpbGxpbmcnLFxuICAgIG5hbWU6ICdCaWxsaW5nJyxcbiAgICBkZXNjOiAnXHU4RDI2XHU1MzU1XHUzMDAxXHU1M0QxXHU3OTY4XHUzMDAxXHU2NTJGXHU0RUQ4XHU1NkRFXHU4QzAzJyxcbiAgICBjb3VudDogNSxcbiAgICB1cGRhdGVkQXQ6ICcwOC0wNyAwOTo0MCcsXG4gIH0sXG5dXG5cbmNvbnN0IFJFQ0VOVCA9IFtcbiAgeyBpZDogJ3JlcS1saXN0LXVzZXJzJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0xpc3QgVXNlcnMnLCBwYXRoOiAnL3YxL3VzZXJzJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWNyZWF0ZS1vcmRlcicsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnQ3JlYXRlIE9yZGVyJywgcGF0aDogJy92MS9vcmRlcnMnLCBzdGF0dXM6ICcyMDEnIH0sXG4gIHsgaWQ6ICdyZXEtbG9naW4nLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0xvZ2luJywgcGF0aDogJy92MS9hdXRoL2xvZ2luJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWdldC1pbnZvaWNlJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0dldCBJbnZvaWNlJywgcGF0aDogJy92MS9iaWxsaW5nL2ludm9pY2VzLzppZCcsIHN0YXR1czogJzQwNCcgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFdvcmtzcGFjZVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGxcbiAgICAgIGFzaWRlPXtcbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1hc2lkZVwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGVcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtdGl0bGVcIiBsZXZlbD17M30+Q29sbGVjdGlvbnM8L0hlYWRpbmc+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtbmV3XCIgdG89XCJjb2xsZWN0aW9uXCI+XHU2NUIwXHU1RUZBPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0NPTExFQ1RJT05TLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tY2FyZFwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cImNvbGxlY3Rpb25cIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1uYW1lXCI+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLWNvdW50XCI+e2l0ZW0uY291bnR9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1kZXNjXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBtYXJnaW5Ub3A6IDQgfX0+XG4gICAgICAgICAgICAgICAge2l0ZW0uZGVzY31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIH1cbiAgICA+XG4gICAgICA8Q29sdW1uIGlkPVwid29ya3NwYWNlLXBhZ2VcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cIndvcmtzcGFjZS1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJ3b3Jrc3BhY2UtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NURFNVx1NEY1Q1x1NTMzQVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMDlcdTYyRTkgQ29sbGVjdGlvbiBcdTYyNTNcdTVGMDBcdThCRjdcdTZDNDJcdUZGMENcdTYyMTZcdTRFQ0VcdTY3MDBcdThGRDFcdThCQjBcdTVGNTVcdTdFRTdcdTdFRURcdTdGMTZcdThGOTFcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FjdGlvbi1lbnZcIiB0bz1cImVudmlyb25tZW50c1wiPlx1NTIwN1x1NjM2Mlx1NzNBRlx1NTg4MzwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYWN0aW9uLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIiB2YXJpYW50PVwicHJpbWFyeVwiPlx1NjVCMFx1NUVGQVx1OEJGN1x1NkM0MjwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwid29ya3NwYWNlLXdlbGNvbWVcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWVcIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWUtdGl0bGVcIiBsZXZlbD17M30+RGVtbyBXb3Jrc3BhY2U8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX193ZWxjb21lLWNvcHlcIj5cbiAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1NzNBRlx1NTg4M1x1RkYxQVN0YWdpbmcgXHUwMEI3IEJhc2UgVVJMIFx1NEY3Rlx1NzUyOCB7J3t7YmFzZVVybH19J30gXHUwMEI3IFx1NTE3MSA0IFx1NEUyQSBDb2xsZWN0aW9uXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1yZWNlbnRcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudFwiIGdhcD17MTB9PlxuICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NjcwMFx1OEZEMVx1OEJGN1x1NkM0MjwvSGVhZGluZz5cbiAgICAgICAgICB7UkVDRU5ULm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1pdGVtXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbWV0aG9kXCI+e2l0ZW0ubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1jb3B5XCIgZ2FwPXsyfSBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1wYXRoXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PntpdGVtLnBhdGh9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1zdGF0dXNcIj57aXRlbS5zdGF0dXN9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0XCIgdG89XCJoaXN0b3J5XCIgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtZGVzY1wiPlx1NjdFNVx1NzcwQlx1NjcyQ1x1NjczQVx1NTNEMVx1OTAwMVx1OEZDN1x1NzY4NFx1OEJGN1x1NkM0MjwvVGV4dD5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dFwiIHRvPVwic2V0dGluZ3NcIiBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtdGl0bGVcIiBsZXZlbD17M30+XHU4QkJFXHU3RjZFPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC1kZXNjXCI+XHU0RUUzXHU3NDA2XHUzMDAxXHU4QkMxXHU0RTY2XHU0RTBFXHU5MDFBXHU3NTI4XHU1MDRGXHU1OTdEPC9UZXh0PlxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPC9Sb3c+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiaW1wb3J0IHsgQ29sbGVjdGlvblNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9jb2xsZWN0aW9uLmpzeCdcbmltcG9ydCB7IEVudmlyb25tZW50c1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9lbnZpcm9ubWVudHMuanN4J1xuaW1wb3J0IHsgSGlzdG9yeVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9oaXN0b3J5LmpzeCdcbmltcG9ydCB7IFJlcXVlc3RFZGl0b3JTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcmVxdWVzdC1lZGl0b3IuanN4J1xuaW1wb3J0IHsgU2V0dGluZ3NTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvc2V0dGluZ3MuanN4J1xuaW1wb3J0IHsgV29ya3NwYWNlU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3dvcmtzcGFjZS5qc3gnXG5cbmNvbnN0IFNIRUxMX0xJTktTID0gWyd3b3Jrc3BhY2UnLCAnY29sbGVjdGlvbicsICdlbnZpcm9ubWVudHMnLCAnaGlzdG9yeScsICdzZXR0aW5ncyddXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnQVBJIENsaWVudFx1RkYwOFBvc3RtYW4gXHU5OENFXHU2ODNDXHVGRjA5JyxcbiAgdmlld3BvcnRzOiB7XG4gICAgZGVza3RvcDogeyB3aWR0aDogMTQ0MCwgaGVpZ2h0OiA5MDAgfSxcbiAgfSxcbiAgZGVmYXVsdFZpZXdwb3J0OiAnZGVza3RvcCcsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ3dvcmtzcGFjZScsXG4gICAgICB0aXRsZTogJ1x1NURFNVx1NEY1Q1x1NTMzQScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbGxlY3Rpb25zIFx1NEZBN1x1NjgwRlx1NEUwRVx1NjcwMFx1OEZEMVx1OEJGN1x1NkM0Mlx1NTE2NVx1NTNFMycsXG4gICAgICBjb21wb25lbnQ6IFdvcmtzcGFjZVNjcmVlbixcbiAgICAgIGVudHJ5OiB0cnVlLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb2xsZWN0aW9uJyxcbiAgICAgIHRpdGxlOiAnQ29sbGVjdGlvbicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1NjU4N1x1NEVGNlx1NTkzOVx1NEUwRVx1OEJGN1x1NkM0Mlx1NjgxMVx1RkYwQ1x1NjI1M1x1NUYwMFx1OEJGN1x1NkM0Mlx1N0YxNlx1OEY5MVx1NTY2OCcsXG4gICAgICBjb21wb25lbnQ6IENvbGxlY3Rpb25TY3JlZW4sXG4gICAgICBsaW5rczogWy4uLlNIRUxMX0xJTktTLCAncmVxdWVzdC1lZGl0b3InXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3JlcXVlc3QtZWRpdG9yJyxcbiAgICAgIHRpdGxlOiAnXHU4QkY3XHU2QzQyXHU3RjE2XHU4RjkxJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWV0aG9kIC8gVVJMIC8gUGFyYW1zIC8gSGVhZGVycyAvIEJvZHkgXHU0RTBFIFJlc3BvbnNlJyxcbiAgICAgIGNvbXBvbmVudDogUmVxdWVzdEVkaXRvclNjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2Vudmlyb25tZW50cycsXG4gICAgICB0aXRsZTogJ1x1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1NTkxQVx1NzNBRlx1NTg4M1x1NTIwN1x1NjM2Mlx1NEUwRVx1NTNEOFx1OTFDRlx1ODg2OCcsXG4gICAgICBjb21wb25lbnQ6IEVudmlyb25tZW50c1NjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2hpc3RvcnknLFxuICAgICAgdGl0bGU6ICdcdTUzODZcdTUzRjJcdThCQjBcdTVGNTUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTY3MDBcdThGRDFcdTUzRDFcdTkwMDFcdThCQjBcdTVGNTVcdUZGMENcdTUzRUZcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTdGMTZcdThGOTFcdTU2NjgnLFxuICAgICAgY29tcG9uZW50OiBIaXN0b3J5U2NyZWVuLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdzZXR0aW5ncycsXG4gICAgICB0aXRsZTogJ1x1OEJCRVx1N0Y2RScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OTAxQVx1NzUyOFx1MzAwMVx1NEVFM1x1NzQwNlx1NEUwRVx1OEJDMVx1NEU2NicsXG4gICAgICBjb21wb25lbnQ6IFNldHRpbmdzU2NyZWVuLFxuICAgICAgbGlua3M6IFNIRUxMX0xJTktTLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMnXG5pbXBvcnQgeyBwcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJ1xuXG52YWxpZGF0ZVByb2plY3QocHJvamVjdClcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxFcnJvckJvdW5kYXJ5IHNjb3BlPVwiYm9hcmRcIj5cbiAgICA8UHJvdG90eXBlUHJvdmlkZXIgcHJvamVjdD17cHJvamVjdH0+XG4gICAgICA8Qm9hcmQgcHJvamVjdD17cHJvamVjdH0gLz5cbiAgICA8L1Byb3RvdHlwZVByb3ZpZGVyPlxu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Q1QsU0FBUyxFQUFFLE9BQU8sTUFBTSxRQUFRLElBQUk7QUFBQSxJQUN0QztBQUFBLElBQ0EsaUJBQWlCO0FBQUEsSUFDakIsU0FBUztBQUFBLE1BQ1A7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE9BQU8sQ0FBQyxHQUFHLGFBQWEsZ0JBQWdCO0FBQUEsUUFDeEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxHQUFHLGFBQWEsZ0JBQWdCO0FBQUEsUUFDeEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLEdBQUcsYUFBYSxnQkFBZ0I7QUFBQSxRQUN4QyxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUM1REEsa0JBQWdCLE9BQU87QUFFdkIsV0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ25ELG9DQUFDLGlCQUFjLE9BQU0sV0FDbkIsb0NBQUMscUJBQWtCLFdBQ2pCLG9DQUFDLFNBQU0sU0FBa0IsQ0FDM0IsQ0FDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInByb2plY3QiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiXQp9Cg==
