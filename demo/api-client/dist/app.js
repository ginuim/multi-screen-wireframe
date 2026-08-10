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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi9zcmMvbGF5b3V0cy9BcHBTaGVsbC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvY29sbGVjdGlvbi5qc3giLCAiLi4vc3JjL3NjcmVlbnMvZW52aXJvbm1lbnRzLmpzeCIsICIuLi9zcmMvc2NyZWVucy9oaXN0b3J5LmpzeCIsICIuLi9zcmMvc2NyZWVucy9yZXF1ZXN0LWVkaXRvci5qc3giLCAiLi4vc3JjL3NjcmVlbnMvc2V0dGluZ3MuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3dvcmtzcGFjZS5qc3giLCAiLi4vc3JjL3Byb2plY3QuanMiLCAiLi4vc3JjL2FwcC5qc3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IFByb3RvdHlwZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBwcm9qZWN0LnNjcmVlbnNbMF0uaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByb3RvdHlwZVByb3ZpZGVyKHsgcHJvamVjdCwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBpbml0aWFsU2NyZWVuSWQgPSBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdClcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZSh7XG4gICAgbW9kZTogJ2NhbnZhcycsXG4gICAgdmlld3BvcnRLZXk6IHByb2plY3QuZGVmYXVsdFZpZXdwb3J0LFxuICAgIGVudHJ5SWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgfSlcblxuICBjb25zdCBuYXZpZ2F0ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChpZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2lkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKVxuICAgICAgICBpZiAoIXNjcmVlbi5saW5rcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7Y3VycmVudC5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke2lkfVwiYClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBpZCxcbiAgICAgICAgaGlzdG9yeTpcbiAgICAgICAgICBjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWRcbiAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuaGlzdG9yeSwgY3VycmVudC5jdXJyZW50U2NyZWVuSWRdXG4gICAgICAgICAgICA6IGN1cnJlbnQuaGlzdG9yeSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2VsZWN0RW50cnkgPSBSZWFjdC51c2VDYWxsYmFjaygoZW50cnlJZCkgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICAgIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGVudHJ5SWQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IGdvQmFjayA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuaGlzdG9yeVtjdXJyZW50Lmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgICAgIGhpc3Rvcnk6IGN1cnJlbnQuaGlzdG9yeS5zbGljZSgwLCAtMSksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW10pXG5cbiAgY29uc3QgcmVzZXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50LmVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW2luaXRpYWxTY3JlZW5JZF0pXG5cbiAgY29uc3Qgc2V0TW9kZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChtb2RlKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdjYW52YXMnICYmIG1vZGUgIT09ICdkZW1vJykgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1vZGUgXCIke21vZGV9XCJgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGUsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW10pXG5cbiAgLyoqIFx1NzUzQlx1Njc3Rlx1NTNDQ1x1NTFGQlx1NjdEMFx1OTg3NVx1RkYxQVx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQVx1NUU3Nlx1ODQzRFx1NTcyOFx1OEJFNVx1OTg3NSAqL1xuICBjb25zdCBlbnRlckRlbW8gPSBSZWFjdC51c2VDYWxsYmFjaygoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc2NyZWVuSWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtzY3JlZW5JZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGU6ICdkZW1vJyxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogc2NyZWVuSWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNldFZpZXdwb3J0S2V5ID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpZXdwb3J0S2V5KSA9PiB7XG4gICAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCB2aWV3cG9ydEtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB2aWV3cG9ydCBcIiR7dmlld3BvcnRLZXl9XCJgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgdmlld3BvcnRLZXkgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCB2YWx1ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gKHtcbiAgICBtb2RlOiBzdGF0ZS5tb2RlLFxuICAgIHZpZXdwb3J0S2V5OiBzdGF0ZS52aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydDogcHJvamVjdC52aWV3cG9ydHNbc3RhdGUudmlld3BvcnRLZXldLFxuICAgIGVudHJ5SWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5jdXJyZW50U2NyZWVuSWQsXG4gICAgbmF2aWdhdGUsXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIHNldE1vZGUsXG4gICAgZW50ZXJEZW1vLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIGNhbkdvQmFjazogc3RhdGUuaGlzdG9yeS5sZW5ndGggPiAwLFxuICB9KSwgW2VudGVyRGVtbywgZ29CYWNrLCBuYXZpZ2F0ZSwgcHJvamVjdCwgcmVzZXQsIHNlbGVjdEVudHJ5LCBzZXRNb2RlLCBzZXRWaWV3cG9ydEtleSwgc3RhdGVdKVxuXG4gIHJldHVybiA8UHJvdG90eXBlQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PntjaGlsZHJlbn08L1Byb3RvdHlwZUNvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm90b3R5cGUoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KFByb3RvdHlwZUNvbnRleHQpXG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCd1c2VQcm90b3R5cGUgbXVzdCBiZSB1c2VkIGluc2lkZSBQcm90b3R5cGVQcm92aWRlcicpXG4gIHJldHVybiBjb250ZXh0XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNsYW1wU2NhbGUoc2NhbGUpIHtcbiAgcmV0dXJuIE1hdGgubWluKDIsIE1hdGgubWF4KDAuMiwgc2NhbGUpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYxQVx1NjMwOVx1NUJCOVx1NTY2OFx1NTE4NVx1NUJCOVx1NTMzQVx1NjI4QVx1NjU3NFx1OTg3NVx1N0YyOVx1NjUzRVx1NTIzMFx1NUI4Q1x1NjU3NFx1NTNFRlx1ODlDMVx1MzAwMlxuICogY29udGFpbmVyKiBcdTRFM0FcdTUzQkJcdTYzODkgcGFkZGluZyBcdTU0MEVcdTc2ODRcdTUzRUZcdTc1MjhcdTVDM0FcdTVCRjhcdUZGMUJjb250ZW50KiBcdTRFM0FcdTY3MkFcdTdGMjlcdTY1M0VcdTc2ODQgc3RhZ2UgXHU1QkJEXHU5QUQ4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXREZW1vU2NhbGUoY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgY29udGVudFdpZHRoLCBjb250ZW50SGVpZ2h0KSB7XG4gIGlmIChjb250YWluZXJXaWR0aCA8PSAwIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwIHx8IGNvbnRlbnRXaWR0aCA8PSAwIHx8IGNvbnRlbnRIZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIGNsYW1wU2NhbGUoTWF0aC5taW4oY29udGFpbmVyV2lkdGggLyBjb250ZW50V2lkdGgsIGNvbnRhaW5lckhlaWdodCAvIGNvbnRlbnRIZWlnaHQpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1ODlDNlx1NTNFM1x1NTNDQ1x1NTFGQlx1NzZFRVx1NjgwN1x1NjYyRlx1NTQyNlx1NEUzQVx1NUM0Rlx1NTkxNlx1N0E3QVx1NzY3RFx1MzAwMlxuICogXHU3MEI5XHU1NzI4IC53Zi1zY3JlZW4tY2hyb21lXHVGRjA4XHU2ODA3XHU5ODk4XHU2ODBGIC8gXHU1MTg1XHU1QkI5XHVGRjA5XHU1MTg1XHU0RTBEXHU3Qjk3XHU3QTdBXHU3NjdEXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU5MDAwXHU1MUZBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlbW9CbGFua0V4aXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRydWVcbiAgcmV0dXJuICF0YXJnZXQuY2xvc2VzdCgnLndmLXNjcmVlbi1jaHJvbWUnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRDYW52YXNWaWV3cG9ydCgpIHtcbiAgcmV0dXJuIHsgc2NhbGU6IDEsIHBhblg6IDAsIHBhblk6IDAgfVxufVxuXG5jb25zdCBGT0NVU19QQURESU5HID0gNDBcblxuLyoqXG4gKiBcdTc1M0JcdTY3N0YgZm9jdXNcdUZGMUFcdTYyOEFcdTY1NzRcdTU3NTcgc2NyZWVuXHVGRjA4XHU1NDJCIG1ldGFcdUZGMDlcdTc5RkJcdTUyMzBcdTVCQjlcdTU2NjhcdTRFMkRcdTVGQzNcdTMwMDJcbiAqIFx1NEVDNVx1NUY1M1x1NUY1M1x1NTI0RCBzY2FsZSBcdTY1M0VcdTRFMERcdTRFMEJcdTY1RjZcdTdGMjlcdTVDMEZcdUZGMUJcdTRFMERcdTY1M0VcdTU5MjdcdTMwMDJcdTVDM0FcdTVCRjhcdTk3NUVcdTZDRDVcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9jdXNDYW52YXNTY3JlZW4oe1xuICBjb250YWluZXJXaWR0aCxcbiAgY29udGFpbmVySGVpZ2h0LFxuICBzY3JlZW5MZWZ0LFxuICBzY3JlZW5Ub3AsXG4gIHNjcmVlbldpZHRoLFxuICBzY3JlZW5IZWlnaHQsXG4gIGN1cnJlbnRTY2FsZSxcbiAgcGFkZGluZyA9IEZPQ1VTX1BBRERJTkcsXG59KSB7XG4gIGlmIChcbiAgICBjb250YWluZXJXaWR0aCA8PSAwXG4gICAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDBcbiAgICB8fCBzY3JlZW5XaWR0aCA8PSAwXG4gICAgfHwgc2NyZWVuSGVpZ2h0IDw9IDBcbiAgICB8fCAhTnVtYmVyLmlzRmluaXRlKGN1cnJlbnRTY2FsZSlcbiAgKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGF2YWlsV2lkdGggPSBjb250YWluZXJXaWR0aCAtIHBhZGRpbmcgKiAyXG4gIGNvbnN0IGF2YWlsSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgaWYgKGF2YWlsV2lkdGggPD0gMCB8fCBhdmFpbEhlaWdodCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZpdFNjYWxlID0gTWF0aC5taW4oYXZhaWxXaWR0aCAvIHNjcmVlbldpZHRoLCBhdmFpbEhlaWdodCAvIHNjcmVlbkhlaWdodClcbiAgY29uc3Qgc2NhbGUgPSBjbGFtcFNjYWxlKE1hdGgubWluKGN1cnJlbnRTY2FsZSwgZml0U2NhbGUpKVxuICByZXR1cm4ge1xuICAgIHNjYWxlLFxuICAgIHBhblg6IGNvbnRhaW5lcldpZHRoIC8gMiAtIChzY3JlZW5MZWZ0ICsgc2NyZWVuV2lkdGggLyAyKSAqIHNjYWxlLFxuICAgIHBhblk6IGNvbnRhaW5lckhlaWdodCAvIDIgLSAoc2NyZWVuVG9wICsgc2NyZWVuSGVpZ2h0IC8gMikgKiBzY2FsZSxcbiAgfVxufVxuXG4vKipcbiAqIFx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1RkYxQVx1NTNFQVx1NzUyOFx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NTI0RFx1NjIyQVx1ODNCN1x1NzY4NCBzbmFwc2hvdFx1RkYwQ1x1Nzk4MVx1NkI2Mlx1NTcyOCBzZXRTdGF0ZSB1cGRhdGVyIFx1OTFDQ1x1OEJGQiBkcmFnIHJlZlx1MzAwMlxuICogUmVhY3QgMTggXHU0RjFBXHU1NzI4IGVuZFBhbiBcdTZFMDVcdTdBN0EgcmVmIFx1NTQwRVx1OTFDRFx1NjUzRSB1cGRhdGVyXHVGRjFCXHU4QkZCIG51bGwucGFuWCBcdTUzNzMgQm9hcmQgXHU2MkE1XHU5NTE5XHU2ODM5XHU1NkUwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYW5Gcm9tRHJhZ1NuYXBzaG90KHZpZXcsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiB2aWV3XG4gIHJldHVybiB7XG4gICAgLi4udmlldyxcbiAgICBwYW5YOiBzbmFwc2hvdC5wYW5YICsgY2xpZW50WCAtIHNuYXBzaG90LngsXG4gICAgcGFuWTogc25hcHNob3QucGFuWSArIGNsaWVudFkgLSBzbmFwc2hvdC55LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njcm9sbGFibGVPdmVyZmxvdyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09ICdhdXRvJyB8fCB2YWx1ZSA9PT0gJ3Njcm9sbCcgfHwgdmFsdWUgPT09ICdvdmVybGF5J1xufVxuXG4vKiogXHU1NzI4IHJvb3QgXHU1MTg1XHU1NDExXHU0RTBBXHU2MjdFXHU1M0VGXHU2RURBXHU1MkE4XHU3OTU2XHU1MTQ4XHVGRjA4XHU1NDJCIHJvb3QgXHU4MUVBXHU4RUFCXHVGRjBDXHU1OTgyXHU1QzRGXHU1MTg1XHU1MTg1XHU1QkI5XHU1MzNBXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVBbmNlc3RvcihzdGFydEVsLCByb290RWwpIHtcbiAgbGV0IG5vZGUgPSBzdGFydEVsICYmIHN0YXJ0RWwubm9kZVR5cGUgPT09IDMgPyBzdGFydEVsLnBhcmVudEVsZW1lbnQgOiBzdGFydEVsXG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSlcbiAgICAgIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIG5vZGUuc2Nyb2xsSGVpZ2h0ID4gbm9kZS5jbGllbnRIZWlnaHQgKyAxXG4gICAgICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBub2RlLnNjcm9sbFdpZHRoID4gbm9kZS5jbGllbnRXaWR0aCArIDFcbiAgICAgIGlmIChjYW5ZIHx8IGNhblgpIHJldHVybiBub2RlXG4gICAgfVxuICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IENPTlRFTlRfRFJBR19USFJFU0hPTEQgPSAzXG5cbmZ1bmN0aW9uIGlzRWRpdGFibGVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAhIXRhcmdldC5jbG9zZXN0KCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKVxufVxuXG4vKipcbiAqIFx1NTcyOFx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTE4NVx1NjMwOVx1NEY0Rlx1NjJENlx1NjJGRCBcdTIxOTIgXHU2RURBXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdUZGMDhcdTUzRUZcdTRFQTRcdTRFOTJcdTUxNzNcdTk1RUQgLyBcdTdBN0FcdTY4M0NcdUZGMDlcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1RkYwQ1x1NEVBNFx1N0VEOVx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlx1MzAwMlxuICogXHU4RkQ0XHU1NkRFIG51bGwgXHU4ODY4XHU3OTNBXHU0RTBEXHU1RTk0XHU2M0E1XHU3QkExXHU4QkU1XHU2QjIxIHBvaW50ZXJkb3duXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCByb290RWwsIHsgbG9ja2VkID0gZmFsc2UsIHNjYWxlID0gMSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIG51bGxcbiAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuIG51bGxcbiAgaWYgKCFyb290RWwgfHwgIXJvb3RFbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBpZiAoaXNFZGl0YWJsZVRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBzY3JvbGxhYmxlID0gZmluZFNjcm9sbGFibGVBbmNlc3RvcihldmVudC50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gbnVsbFxuICByZXR1cm4ge1xuICAgIGVsOiBzY3JvbGxhYmxlLFxuICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgc2Nyb2xsTGVmdDogc2Nyb2xsYWJsZS5zY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogc2Nyb2xsYWJsZS5zY3JvbGxUb3AsXG4gICAgc2NhbGU6IHNjYWxlID4gMCA/IHNjYWxlIDogMSxcbiAgICBtb3ZlZDogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpIHtcbiAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGR4ID0gKGV2ZW50LmNsaWVudFggLSBzdGF0ZS5zdGFydFgpIC8gc3RhdGUuc2NhbGVcbiAgY29uc3QgZHkgPSAoZXZlbnQuY2xpZW50WSAtIHN0YXRlLnN0YXJ0WSkgLyBzdGF0ZS5zY2FsZVxuICBpZiAoIXN0YXRlLm1vdmVkICYmIChNYXRoLmFicyhkeCkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEIHx8IE1hdGguYWJzKGR5KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQpKSB7XG4gICAgc3RhdGUubW92ZWQgPSB0cnVlXG4gIH1cbiAgc3RhdGUuZWwuc2Nyb2xsTGVmdCA9IHN0YXRlLnNjcm9sbExlZnQgLSBkeFxuICBzdGF0ZS5lbC5zY3JvbGxUb3AgPSBzdGF0ZS5zY3JvbGxUb3AgLSBkeVxuICByZXR1cm4gc3RhdGVcbn1cblxuLyoqIFx1NjJENlx1NjJGRFx1OEQ4NVx1OEZDN1x1OTYwOFx1NTAzQ1x1NTQwRVx1NTQxRVx1NjM4OVx1OTY4Rlx1NTQwRVx1NzY4NCBjbGlja1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1ODlFNlx1OERGM1x1OEY2QyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZENvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCByb290RWwpIHtcbiAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUubW92ZWQgfHwgIXJvb3RFbCkgcmV0dXJuXG4gIGNvbnN0IHByZXZlbnRDbGljayA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJvb3RFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbiAgfVxuICByb290RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG59XG5cbi8qKiBcdThCRTVcdTY1QjlcdTU0MTFcdTY2MkZcdTU0MjZcdThGRDhcdTgwRkRcdTdFRTdcdTdFRURcdTZFREEgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5TY3JvbGxJbkRpcmVjdGlvbihlbCwgZGVsdGFYLCBkZWx0YVkpIHtcbiAgY29uc3QgZXBzID0gMVxuICBpZiAoZGVsdGFZKSB7XG4gICAgY29uc3QgbWF4WSA9IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodFxuICAgIGlmIChtYXhZID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFZIDwgMCAmJiBlbC5zY3JvbGxUb3AgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFZID4gMCAmJiBlbC5zY3JvbGxUb3AgPCBtYXhZIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICBpZiAoZGVsdGFYKSB7XG4gICAgY29uc3QgbWF4WCA9IGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGhcbiAgICBpZiAobWF4WCA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWCA8IDAgJiYgZWwuc2Nyb2xsTGVmdCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVggPiAwICYmIGVsLnNjcm9sbExlZnQgPCBtYXhYIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFRkJcdTYxMEZcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTRFQzUgQ3RybC9NZXRhICsgXHU2RURBXHU4RjZFXG4gKlx1RkYwOFx1ODlFNlx1NjNBN1x1Njc3RiBwaW5jaCBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTkxQ0NcdTkwMUFcdTVFMzhcdTVFMjYgY3RybEtleVx1RkYwOVx1MzAwMlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NjY2RVx1OTAxQVx1NkVEQVx1OEY2RVx1NzU1OVx1N0VEOVx1NUM0Rlx1NTE4NVx1NkVEQVx1NTJBOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckVudHJ5SWQoc2NyZWVucykge1xuICByZXR1cm4gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbW9TdGF0ZShzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5SWQgPSBpbmZlckVudHJ5SWQoc2NyZWVucylcbiAgaWYgKCFlbnRyeUlkKSB0aHJvdyBuZXcgRXJyb3IoJ0RlbW8gbW9kZSByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZW50cnkgc2NyZWVuJylcbiAgcmV0dXJuIHtcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXZpZ2F0ZURlbW8oc3RhdGUsIHRhcmdldElkLCBzY3JlZW5zKSB7XG4gIGlmICghc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gdGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7dGFyZ2V0SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICB9XG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpXG4gIGlmICghY3VycmVudFNjcmVlbi5saW5rcy5pbmNsdWRlcyh0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7c3RhdGUuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHt0YXJnZXRJZH1cImApXG4gIH1cbiAgaWYgKHRhcmdldElkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpIHJldHVybiBzdGF0ZVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogdGFyZ2V0SWQsXG4gICAgaGlzdG9yeTogWy4uLnN0YXRlLmhpc3RvcnksIHN0YXRlLmN1cnJlbnRTY3JlZW5JZF0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdERlbW9FbnRyeShzdGF0ZSwgZW50cnlJZCwgc2NyZWVucykge1xuICBjb25zdCBlbnRyeSA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdvQmFja0RlbW8oc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgaGlzdG9yeSA9IHN0YXRlLmhpc3Rvcnkuc2xpY2UoMCwgLTEpXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5oaXN0b3J5W3N0YXRlLmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgaGlzdG9yeSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZW1vKHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwgfVxuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgIHJldHVybiB7IGVycm9yIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCBpbmZvKSB7XG4gICAgY29uc29sZS5lcnJvcihgW3dpcmVmcmFtZToke3RoaXMucHJvcHMuc2NvcGUgfHwgJ3Vua25vd24nfV1gLCBlcnJvciwgaW5mbylcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgJiYgcHJldmlvdXNQcm9wcy5yZXNldEtleSAhPT0gdGhpcy5wcm9wcy5yZXNldEtleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5lcnJvcikgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICBjb25zdCB7IHNjcmVlbklkLCBzb3VyY2UsIHNjb3BlIH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZXJyb3ItY2FyZFwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICA8c3Ryb25nPntzY29wZSA9PT0gJ3NjcmVlbicgPyBgU2NyZWVuOiAke3NjcmVlbklkfWAgOiAnQm9hcmQgZXJyb3InfTwvc3Ryb25nPlxuICAgICAgICB7c291cmNlID8gPHNwYW4+U291cmNlOiB7c291cmNlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8c3Bhbj5NZXNzYWdlOiB7dGhpcy5zdGF0ZS5lcnJvci5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPHByZT57dGhpcy5zdGF0ZS5lcnJvci5zdGFja308L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuIiwgImNvbnN0IFNjcmVlbklkZW50aXR5Q29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbklkZW50aXR5UHJvdmlkZXIoeyBzY3JlZW5JZCwgY2hpbGRyZW4gfSkge1xuICBpZiAoIXNjcmVlbklkKSB0aHJvdyBuZXcgRXJyb3IoJ1NjcmVlbklkZW50aXR5UHJvdmlkZXIgcmVxdWlyZXMgc2NyZWVuSWQnKVxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NjcmVlbklkfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1NjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2NyZWVuSWQoKSB7XG4gIGNvbnN0IHNjcmVlbklkID0gUmVhY3QudXNlQ29udGV4dChTY3JlZW5JZGVudGl0eUNvbnRleHQpXG4gIGlmICghc2NyZWVuSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZVNjcmVlbklkIG11c3QgYmUgdXNlZCBpbnNpZGUgYSByZW5kZXJlZCBzY3JlZW4nKVxuICB9XG4gIHJldHVybiBzY3JlZW5JZFxufVxuIiwgIi8qKlxuICogXHU3MEVEXHU1MzNBXHU0RTBFXHU4REYzXHU4RjZDXHU3Njg0XHU1NTJGXHU0RTAwXHU1OTUxXHU3RUE2XHVGRjFBXHU1MTQzXHU3RDIwXHU1RTI2IGRhdGEtZmxvdy10byBcdTUzNzNcdTUzRUZcdTVCRkNcdTgyMkFcdTMwMDJcbiAqIFNjcmVlbkZyYW1lIFx1NTlENFx1NjI1OFx1NzBCOVx1NTFGQlx1NTE1Q1x1NUU5NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUxQVx1NTJBMVx1NTE5OVx1NjIxMFx1ODhGOCBzcGFuL2RpdiBcdTUzRUFcdTY3MDlcdTVDNUVcdTYwMjdcdTMwMDFcdTZDQTFcdTY3MDkgb25DbGlja1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290RWwpIHtcbiAgaWYgKCFzdGFydEVsIHx8IHR5cGVvZiBzdGFydEVsLmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsXG4gIGNvbnN0IGVsID0gc3RhcnRFbC5jbG9zZXN0KCdbZGF0YS1mbG93LXRvXScpXG4gIGlmICghZWwpIHJldHVybiBudWxsXG4gIGlmIChyb290RWwgJiYgdHlwZW9mIHJvb3RFbC5jb250YWlucyA9PT0gJ2Z1bmN0aW9uJyAmJiAhcm9vdEVsLmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcbiAgY29uc3QgdG8gPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxvdy10bycpXG4gIHJldHVybiB0byB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIHJvb3RFbCwgbmF2aWdhdGUpIHtcbiAgY29uc3QgdG8gPSBmaW5kRmxvd1RhcmdldElkKGV2ZW50Py50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCF0bykgcmV0dXJuIGZhbHNlXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gIG5hdmlnYXRlKHRvKVxuICByZXR1cm4gdHJ1ZVxufVxuIiwgImNvbnN0IFRZUEVfTEFCRUxTID0ge1xuICBjb21tZW50OiAnXHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJyxcbiAgdGV4dDogJ1x1NEZFRVx1NjUzOVx1NjU4N1x1NUI1NycsXG4gIG9yZGVyOiAnXHU4QzAzXHU2NTc0XHU5ODdBXHU1RThGJyxcbiAgcmVtb3ZlOiAnXHU1MjIwXHU5NjY0XHU4MjgyXHU3MEI5Jyxcbn1cblxuZnVuY3Rpb24gZXNjYXBlU2VsZWN0b3JUb2tlbih2YWx1ZSkge1xuICBpZiAoZ2xvYmFsVGhpcy5DU1M/LmVzY2FwZSkgcmV0dXJuIGdsb2JhbFRoaXMuQ1NTLmVzY2FwZShTdHJpbmcodmFsdWUpKVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAoY2hhcikgPT4gYFxcXFwke2NoYXJ9YClcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cmlidXRlVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbn1cblxuZnVuY3Rpb24gY2xhc3Nlc09mKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50Py5jbGFzc0xpc3QpIHJldHVybiBbXVxuICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNsYXNzTGlzdCkuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQ2xhc3NOYW1lKG5hbWUpIHtcbiAgcmV0dXJuICEhbmFtZSAmJiAhbmFtZS5zdGFydHNXaXRoKCd3Zi0nKSAmJiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKVxufVxuXG5mdW5jdGlvbiBzZWxlY3RvclNjb3BlKHNjcmVlbklkKSB7XG4gIHJldHVybiBgW2RhdGEtc2NyZWVuLWlkPVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShzY3JlZW5JZCl9XCJdYFxufVxuXG5mdW5jdGlvbiBzZWxlY3RvcklzVW5pcXVlKHNjcmVlblJvb3QsIHNlbGVjdG9yKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjcmVlblJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoID09PSAxXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpIHtcbiAgY29uc3QgdGFnID0gKGVsZW1lbnQudGFnTmFtZSB8fCAnZGl2JykudG9Mb3dlckNhc2UoKVxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlcy5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcbiAgY29uc3QgdXNhYmxlID0gYnVzaW5lc3MubGVuZ3RoID4gMCA/IGJ1c2luZXNzIDogY2xhc3Nlcy5maWx0ZXIoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICBjb25zdCBjbGFzc1BhcnQgPSB1c2FibGUuc2xpY2UoMCwgMikubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICByZXR1cm4gYCR7dGFnfSR7Y2xhc3NQYXJ0fSR7a2V5UGFydH1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW5JZCkge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW5JZCkgcmV0dXJuICcnXG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oZWxlbWVudC5pZCl9YFxuXG4gIGNvbnN0IHNjb3BlID0gc2VsZWN0b3JTY29wZShzY3JlZW5JZClcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzT2YoZWxlbWVudCkuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG5cbiAgZm9yIChjb25zdCBuYW1lIG9mIGJ1c2luZXNzKSB7XG4gICAgY29uc3QgbG9jYWwgPSBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX0ke2tleVBhcnR9YFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBpZiAoYnVzaW5lc3MubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGxvY2FsID0gYnVzaW5lc3MubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKSArIGtleVBhcnRcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdChgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihjdXJyZW50LmlkKX1gKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgbGV0IHNlZ21lbnQgPSBlbGVtZW50U2VnbWVudChjdXJyZW50KVxuICAgIGNvbnN0IHBhcmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgICAgY29uc3QgcGVlcnMgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKFxuICAgICAgICAoaXRlbSkgPT4gaXRlbS50YWdOYW1lID09PSBjdXJyZW50LnRhZ05hbWUgJiYgZWxlbWVudFNlZ21lbnQoaXRlbSkgPT09IHNlZ21lbnQsXG4gICAgICApXG4gICAgICBpZiAocGVlcnMubGVuZ3RoID4gMSkgc2VnbWVudCArPSBgOm50aC1vZi10eXBlKCR7cGVlcnMuaW5kZXhPZihjdXJyZW50KSArIDF9KWBcbiAgICB9XG4gICAgc2VnbWVudHMudW5zaGlmdChzZWdtZW50KVxuICAgIGNvbnN0IGxvY2FsID0gc2VnbWVudHMuam9pbignID4gJylcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICAgIGN1cnJlbnQgPSBwYXJlbnRcbiAgfVxuXG4gIHJldHVybiBgJHtzY29wZX0gJHtzZWdtZW50cy5qb2luKCcgPiAnKSB8fCBlbGVtZW50U2VnbWVudChlbGVtZW50KX1gXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlMYWJlbChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VsZW1lbnQuaWR9YFxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IHNlbWFudGljID0gY2xhc3Nlcy5maW5kKGlzQnVzaW5lc3NDbGFzc05hbWUpIHx8IGNsYXNzZXMuZmluZCgobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIHJldHVybiBzZW1hbnRpYyA/IGAuJHtzZW1hbnRpY31gIDogKGVsZW1lbnQudGFnTmFtZSB8fCAnbm9kZScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gcmVhZFRleHQoZWxlbWVudCkge1xuICBjb25zdCB2YWx1ZSA9ICd2YWx1ZScgaW4gZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICA/IGVsZW1lbnQudmFsdWVcbiAgICA6IGVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbiAgcmV0dXJuIG5vcm1hbGl6ZWQubGVuZ3RoID4gMjQwID8gYCR7bm9ybWFsaXplZC5zbGljZSgwLCAyMzcpfS4uLmAgOiBub3JtYWxpemVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUmV2aWV3VGFyZ2V0KHRhcmdldCwgY29udGVudFJvb3QpIHtcbiAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ/Lm5vZGVUeXBlID09PSAxID8gdGFyZ2V0IDogdGFyZ2V0Py5wYXJlbnRFbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQgfHwgY2xhc3Nlc09mKGN1cnJlbnQpLmxlbmd0aCA+IDApIHJldHVybiBjdXJyZW50XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbikge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW4pIHJldHVybiBudWxsXG4gIGNvbnN0IGFuY2VzdG9ycyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGFuY2VzdG9ycy51bnNoaWZ0KHtcbiAgICAgIGVsZW1lbnQ6IGN1cnJlbnQsXG4gICAgICBsYWJlbDogZGlzcGxheUxhYmVsKGN1cnJlbnQpLFxuICAgICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoY3VycmVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgfSlcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQsXG4gICAgY29udGVudFJvb3QsXG4gICAgc2NyZWVuSWQ6IHNjcmVlbi5pZCxcbiAgICBzY3JlZW5UaXRsZTogc2NyZWVuLnRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YCxcbiAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB0YWdOYW1lOiAoZWxlbWVudC50YWdOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLFxuICAgIGNsYXNzTmFtZXM6IGNsYXNzZXNPZihlbGVtZW50KSxcbiAgICBjdXJyZW50VGV4dDogcmVhZFRleHQoZWxlbWVudCksXG4gICAgYW5jZXN0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZW1SZXF1ZXN0KGl0ZW0pIHtcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gYFx1NEZFRVx1NjUzOVx1NEUzQVx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdvcmRlcicpIHJldHVybiBgXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3JlbW92ZScpIHJldHVybiBgXHU1MjIwXHU5NjY0XHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfWBcbiAgcmV0dXJuIGl0ZW0uaW5zdHJ1Y3Rpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldmlld1RhcmdldHMoaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVtPy50YXJnZXRzKSAmJiBpdGVtLnRhcmdldHMubGVuZ3RoID4gMCkgcmV0dXJuIGl0ZW0udGFyZ2V0c1xuICBpZiAoIWl0ZW0/LnNlbGVjdG9yKSByZXR1cm4gW11cbiAgcmV0dXJuIFt7XG4gICAgc2NyZWVuSWQ6IGl0ZW0uc2NyZWVuSWQsXG4gICAgc2NyZWVuVGl0bGU6IGl0ZW0uc2NyZWVuVGl0bGUsXG4gICAgc291cmNlSGludDogaXRlbS5zb3VyY2VIaW50LFxuICAgIHNlbGVjdG9yOiBpdGVtLnNlbGVjdG9yLFxuICAgIGN1cnJlbnRUZXh0OiBpdGVtLmN1cnJlbnRUZXh0LFxuICB9XVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpIHtcbiAgY29uc3QgcHJvamVjdE5hbWUgPSBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInXG5cbiAgY29uc3QgbGluZXMgPSBbXG4gICAgYFx1OEJGN1x1NEZFRVx1NjUzOVx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4Qlx1MzAwQyR7cHJvamVjdE5hbWV9XHUzMDBEXHUzMDAyYCxcbiAgICAnJyxcbiAgICAnXHU0RkVFXHU2NTM5XHU3RUE2XHU2NzVGXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdTRGRUVcdTY1MzlcdTRFMUFcdTUyQTEgc3JjL1x1RkYxQlx1NEUwRFx1ODk4MVx1NEZFRVx1NjUzOSBmcmFtZXdvcmsvIFx1NjIxNiBkaXN0L2FwcC5qc1x1MzAwMicsXG4gICAgJy0gXHU5MDFBXHU4RkM3IERPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdTU3MjggSlNYIFx1NEUyRFx1NjQxQ1x1N0QyMlx1NUJGOVx1NUU5NFx1NzY4NCBpZFx1MzAwMWNsYXNzTmFtZSBcdTYyMTYgZGF0YS13Zi1rZXlcdTMwMDInLFxuICAgICctIFx1NEZERFx1NzU1OVx1NjI0MFx1NjcwOVx1OEJFRFx1NEU0OSBjbGFzc1x1MzAwMVx1NTE3M1x1OTUyRVx1ODI4Mlx1NzBCOSBpZCBcdTU0OENcdTkxQ0RcdTU5MERcdTY1NzBcdTYzNkVcdTgyODJcdTcwQjlcdTc2ODQgZGF0YS13Zi1rZXlcdUZGMUJcdTY1QjBcdTU4OUVcdTgyODJcdTcwQjlcdTRFNUZcdTkwNzVcdTVCODhcdTU0MENcdTRFMDBcdTU0N0RcdTU0MERcdTg5QzRcdTUyMTlcdTMwMDInLFxuICAgICctIFx1NEZFRVx1NjUzOSBzY3JlZW5zL2xheW91dHMgXHU2NUY2XHU0RkREXHU3NTU5XHUzMDBDXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFXHUzMDBEXHVGRjBDXHU1RTc2XHU2MjhBXHUzMDBDXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFXHUzMDBEXHU1M0NBIEB3aXJlZnJhbWUtc2tpbGwgXHU2NkY0XHU2NUIwXHU0RTNBXHU1RjUzXHU1MjREIHNraWxsIFx1NzI0OFx1NjcyQ1x1MzAwMicsXG4gICAgJy0gXHU0RkREXHU2MzAxIHByb2plY3QubGlua3MgXHU0RTNBXHU5ODc1XHU5NzYyXHU2RDQxXHU3Njg0XHU1NTJGXHU0RTAwXHU4RkI5XHU2NTcwXHU2MzZFXHVGRjFCXHU1QjhDXHU2MjEwXHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU1RTc2XHU5QThDXHU4QkMxXHU3NTNCXHU2NzdGXHUzMDAxXHU2RjE0XHU3OTNBXHU1NDhDXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGXHUzMDAyJyxcbiAgXVxuXG4gIGlmICghaXRlbXM/Lmxlbmd0aCkge1xuICAgIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDInKVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJldmlld1RhcmdldHMoaXRlbSlcbiAgICBsaW5lcy5wdXNoKCcnLCBgIyMgXHU0RkVFXHU2NTM5ICR7aXRlbUluZGV4ICsgMX1cdUZGMUEke1RZUEVfTEFCRUxTW2l0ZW0udHlwZV0gfHwgVFlQRV9MQUJFTFMuY29tbWVudH1gKVxuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2NyZWVuSWQgPSB0YXJnZXQuc2NyZWVuSWQgfHwgaXRlbS5zY3JlZW5JZFxuICAgICAgbGluZXMucHVzaChcbiAgICAgICAgJycsXG4gICAgICAgIGBcdTc2RUVcdTY4MDcgJHt0YXJnZXRJbmRleCArIDF9XHVGRjFBJHt0YXJnZXQuc2NyZWVuVGl0bGUgfHwgaXRlbS5zY3JlZW5UaXRsZSB8fCBzY3JlZW5JZCB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU5ODc1XHU5NzYyJ31gLFxuICAgICAgICBgXHU5ODc1XHU5NzYyIElEXHVGRjFBJHtzY3JlZW5JZCB8fCAnXHU2NzJBXHU3N0U1J31gLFxuICAgICAgICBgXHU2RTkwXHU3ODAxXHU2M0QwXHU3OTNBXHVGRjFBJHt0YXJnZXQuc291cmNlSGludCB8fCBpdGVtLnNvdXJjZUhpbnQgfHwgKHNjcmVlbklkID8gYHNyYy9zY3JlZW5zLyR7c2NyZWVuSWR9LmpzeGAgOiAnXHU4QkY3XHU2NDFDXHU3RDIyXHU5MDA5XHU2MkU5XHU1NjY4Jyl9YCxcbiAgICAgICAgJ0RPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdUZGMUEnLFxuICAgICAgICBgXFxgJHt0YXJnZXQuc2VsZWN0b3J9XFxgYCxcbiAgICAgIClcbiAgICAgIGlmICh0YXJnZXQuY3VycmVudFRleHQpIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjlcdUZGMUEnLCB0YXJnZXQuY3VycmVudFRleHQpXG4gICAgfSlcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU0RkVFXHU2NTM5XHU4OTgxXHU2QzQyXHVGRjFBJywgaXRlbVJlcXVlc3QoaXRlbSkpXG4gIH0pXG5cbiAgbGluZXMucHVzaChcbiAgICAnJyxcbiAgICAnIyMgXHU1QjhDXHU2MjEwXHU2ODA3XHU1MUM2JyxcbiAgICAnLSBcdTkwMTBcdTk4NzlcdTVCOENcdTYyMTBcdTRFRTVcdTRFMEFcdTRGRUVcdTY1MzlcdUZGMUJcdTgyRTVcdTkwMDlcdTYyRTlcdTU2NjhcdTVCRjlcdTVFOTRcdTUxNzFcdTRFQUIgbGF5b3V0XHVGRjBDXHU4QkY3XHU0RkVFXHU2NTM5XHU3NzFGXHU1QjlFXHU1QjlBXHU0RTQ5XHU0RjREXHU3RjZFXHVGRjBDXHU0RTBEXHU4OTgxXHU1NzI4IHNjcmVlbiBcdTRFMkRcdTU5MERcdTUyMzZcdTVCOUVcdTczQjBcdTMwMDInLFxuICAgICctIFx1NEUwRFx1NzUyOCBET00gXHU1QzQyXHU3RUE3XHU2MjE2IG50aC1jaGlsZCBcdTY2RkZcdTRFRTNcdTVERjJcdTY3MDlcdTc2ODRcdTdBMzNcdTVCOUFcdTRFMUFcdTUyQTFcdTkwMDlcdTYyRTlcdTU2NjhcdTMwMDInLFxuICAgICctIFx1Njc4NFx1NUVGQVx1NjIxMFx1NTI5Rlx1NTQwRVx1NjhDMFx1NjdFNVx1NTNEN1x1NUY3MVx1NTRDRFx1OTg3NVx1OTc2Mlx1NTNDQVx1NTE3Nlx1NEUwQVx1NEUwQlx1NkUzOFx1OERGM1x1OEY2Q1x1MzAwMicsXG4gIClcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCBjb25zdCBSRVZJRVdfVFlQRV9MQUJFTFMgPSBUWVBFX0xBQkVMU1xuIiwgImltcG9ydCB7IGlzU2Nyb2xsYWJsZU92ZXJmbG93IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5jb25zdCBTVFlMRV9LRVlTID0gW1xuICAnd2lkdGgnLFxuICAnaGVpZ2h0JyxcbiAgJ21pbldpZHRoJyxcbiAgJ21pbkhlaWdodCcsXG4gICdvdmVyZmxvdycsXG4gICdvdmVyZmxvd1gnLFxuICAnb3ZlcmZsb3dZJyxcbiAgJ21heFdpZHRoJyxcbiAgJ21heEhlaWdodCcsXG5dXG5cbi8qKiBcdTgyODJcdTcwQjlcdTVGNTNcdTUyNERcdTY2MkZcdTU0MjZcdTU2RTAgb3ZlcmZsb3cgXHU0RUE3XHU3NTFGXHU1M0VGXHU2RURBXHU1MkE4XHU2RUEyXHU1MUZBICovXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKGVsKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZVxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQgKyAxXG4gIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIGVsLnNjcm9sbFdpZHRoID4gZWwuY2xpZW50V2lkdGggKyAxXG4gIHJldHVybiBjYW5ZIHx8IGNhblhcbn1cblxuZnVuY3Rpb24gZGVwdGhGcm9tKHJvb3RFbCwgZWwpIHtcbiAgbGV0IGRlcHRoID0gMFxuICBsZXQgbm9kZSA9IGVsXG4gIHdoaWxlIChub2RlICYmIG5vZGUgIT09IHJvb3RFbCkge1xuICAgIGRlcHRoICs9IDFcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIGRlcHRoXG59XG5cbi8qKlxuICogXHU2NTM2XHU5NkM2XHU5NzAwXHU2NDkxXHU1RjAwXHU3Njg0XHU4MjgyXHU3MEI5XHVGRjFBXHU1M0VGXHU2RURBXHU1MkE4XHU4MjgyXHU3MEI5ICsgXHU0RTBBXHU2RUFGXHU1MjMwIHJvb3QgXHU3Njg0XHU3OTU2XHU1MTQ4XHUzMDAyXG4gKiBcdTZERjFcdTgyODJcdTcwQjlcdTU3MjhcdTUyNERcdUZGMENcdTUxNDhcdTY0OTFcdTUxODVcdTVDNDJcdTUxOERcdTY0OTFcdTU5MTZcdTU4RjNcdUZGMDhcdTkwN0ZcdTUxNEQgZ3JpZCAvIHdpZHRoOjEwMCUgXHU2MjhBXHU1OTE2XHU2ODQ2XHU1MzYxXHU2QjdCXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbCkge1xuICBpZiAoIXJvb3RFbCkgcmV0dXJuIFtdXG4gIGNvbnN0IHNjcm9sbGFibGVzID0gW11cbiAgY29uc3QgdmlzaXQgPSAobm9kZSkgPT4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiA/IEFycmF5LmZyb20obm9kZS5jaGlsZHJlbikgOiBbXVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHZpc2l0KGNoaWxkKVxuICAgIGlmIChub2RlID09PSByb290RWwgfHwgaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKG5vZGUpKSBzY3JvbGxhYmxlcy5wdXNoKG5vZGUpXG4gIH1cbiAgdmlzaXQocm9vdEVsKVxuXG4gIGNvbnN0IHNldCA9IG5ldyBTZXQoc2Nyb2xsYWJsZXMpXG4gIGZvciAoY29uc3QgZWwgb2Ygc2Nyb2xsYWJsZXMpIHtcbiAgICAvLyByb290IFx1NjcyQ1x1OEVBQlx1NURGMlx1NTcyOFx1OTZDNlx1NTQwOFx1NEUyRFx1RkYxQlx1NEVDRVx1NUI4M1x1NzY4NFx1NzIzNlx1ODI4Mlx1NzBCOVx1N0VFN1x1N0VFRFx1NEUwQVx1NkVBRlx1NEYxQVx1OEQ4QVx1OEZDNyBzY3JlZW4gXHU4RkI5XHU3NTRDXHVGRjBDXG4gICAgLy8gXHU2MjhBIFNjcmVlbkZyYW1lXHUzMDAxY2FudmFzXHUzMDAxYm9hcmQgXHU3NTFBXHU4MUYzIGJvZHkvaHRtbCBcdTRFMDBcdTVFNzZcdTY1MzlcdTUxOTlcdTMwMDJcbiAgICBpZiAoZWwgPT09IHJvb3RFbCkgY29udGludWVcbiAgICBsZXQgbm9kZSA9IGVsLnBhcmVudEVsZW1lbnRcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgc2V0LmFkZChub2RlKVxuICAgICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnNldF0uc29ydCgoYSwgYikgPT4gZGVwdGhGcm9tKHJvb3RFbCwgYikgLSBkZXB0aEZyb20ocm9vdEVsLCBhKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNuYXBzaG90SW5saW5lQm94KGVsKSB7XG4gIGNvbnN0IG91dCA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIG91dFtrZXldID0gZWwuc3R5bGVba2V5XSB8fCAnJ1xuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlSW5saW5lQm94KGVsLCBzbmFwc2hvdCkge1xuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSB7XG4gICAgZWwuc3R5bGVba2V5XSA9IHNuYXBzaG90W2tleV0gfHwgJydcbiAgfVxufVxuXG4vKipcbiAqIG9mZnNldFRvcCAvIG9mZnNldExlZnQgXHU3NkY4XHU1QkY5IG9mZnNldFBhcmVudFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NEUwMFx1NUI5QVx1NzZGOFx1NUJGOVx1NzZGNFx1NjNBNVx1NzIzNlx1ODI4Mlx1NzBCOVx1MzAwMlxuICogXHU1NDBFXHU1M0YwXHU5ODc1XHU5MUNDXHU4RkRFXHU3RUVEXHU3Njg0IHN0YXRpYyBcdTVCQjlcdTU2NjhcdTkwMUFcdTVFMzhcdTUxNzFcdTRFQUIgc2NyZWVuIHJvb3QgXHU0RjVDXHU0RTNBIG9mZnNldFBhcmVudFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU5NzAwXHU4OTgxXHU1MTQ4XHU2MzYyXHU3Qjk3XHU1MjMwXHU1RjUzXHU1MjREXHU3MjM2XHU4MjgyXHU3MEI5XHU1NzUwXHU2ODA3XHVGRjBDXHU5MDdGXHU1MTREXHU5MDEwXHU1QzQyXHU5MUNEXHU1OTBEXHU3RDJGXHU1MkEwXHU1NDBDXHU0RTAwXHU2QkI1XHU1MDRGXHU3OUZCXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCBheGlzKSB7XG4gIGNvbnN0IG9mZnNldEtleSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnXG4gIGNvbnN0IHJlY3RTdGFydCA9IGF4aXMgPT09ICd4JyA/ICdsZWZ0JyA6ICd0b3AnXG4gIGNvbnN0IHJlY3RTaXplID0gYXhpcyA9PT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIGNvbnN0IGxheW91dFNpemUgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcbiAgY29uc3Qgc2Nyb2xsS2V5ID0gYXhpcyA9PT0gJ3gnID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCdcbiAgY29uc3QgY2hpbGRPZmZzZXQgPSBjaGlsZFtvZmZzZXRLZXldIHx8IDBcblxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbCkgcmV0dXJuIGNoaWxkT2Zmc2V0XG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgJiYgY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbC5vZmZzZXRQYXJlbnQpIHtcbiAgICByZXR1cm4gY2hpbGRPZmZzZXQgLSAoZWxbb2Zmc2V0S2V5XSB8fCAwKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgcGFyZW50UmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY2hpbGRSZWN0ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCByZW5kZXJlZFNpemUgPSBwYXJlbnRSZWN0W3JlY3RTaXplXVxuICAgIGNvbnN0IHNjYWxlID0gZWxbbGF5b3V0U2l6ZV0gPiAwICYmIHJlbmRlcmVkU2l6ZSA+IDBcbiAgICAgID8gcmVuZGVyZWRTaXplIC8gZWxbbGF5b3V0U2l6ZV1cbiAgICAgIDogMVxuICAgIGNvbnN0IHN0YXJ0ID0gKGNoaWxkUmVjdFtyZWN0U3RhcnRdIC0gcGFyZW50UmVjdFtyZWN0U3RhcnRdKSAvIHNjYWxlXG4gICAgICArIChlbFtzY3JvbGxLZXldIHx8IDApXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShzdGFydCkpIHJldHVybiBzdGFydFxuICB9XG5cbiAgcmV0dXJuIGNoaWxkT2Zmc2V0XG59XG5cbi8qKlxuICogb3ZlcmZsb3c6dmlzaWJsZSBcdTY1RjZcdTkwRThcdTUyMDZcdTZENEZcdTg5QzhcdTU2Njggc2Nyb2xsV2lkdGggXHUyMjQ4IGNsaWVudFdpZHRoXHVGRjBDXG4gKiBcdTYyNDBcdTRFRTVcdTUxOERcdTYyNkJcdTVCNTBcdTgyODJcdTcwQjkgb2Zmc2V0IFx1OEZCOVx1NzU0Q1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRFx1ODg2OFx1NjQ5MVx1NEUwRFx1NUYwMFx1NTkxNlx1Njg0Nlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUludHJpbnNpY0JveChlbCkge1xuICBsZXQgd2lkdGggPSBNYXRoLm1heChlbC5zY3JvbGxXaWR0aCB8fCAwLCBlbC5vZmZzZXRXaWR0aCB8fCAwKVxuICBsZXQgaGVpZ2h0ID0gTWF0aC5tYXgoZWwuc2Nyb2xsSGVpZ2h0IHx8IDAsIGVsLm9mZnNldEhlaWdodCB8fCAwKVxuICBjb25zdCBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuID8gQXJyYXkuZnJvbShlbC5jaGlsZHJlbikgOiBbXVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd4JykgKyAoY2hpbGQub2Zmc2V0V2lkdGggfHwgMCkpXG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3knKSArIChjaGlsZC5vZmZzZXRIZWlnaHQgfHwgMCkpXG4gIH1cbiAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUV4cGFuZGVkQm94KGVsKSB7XG4gIGVsLnN0eWxlLm1heFdpZHRoID0gJ25vbmUnXG4gIGVsLnN0eWxlLm1heEhlaWdodCA9ICdub25lJ1xuICBlbC5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1ggPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dZID0gJ3Zpc2libGUnXG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWVhc3VyZUludHJpbnNpY0JveChlbClcbiAgZWwuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICBlbC5zdHlsZS5taW5XaWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5taW5IZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG59XG5cbi8qKiBcdTY0OTFcdTVGMDAgcm9vdCBcdTUxODVcdTYyNDBcdTY3MDlcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUzQ0FcdTUxNzZcdTc5NTZcdTUxNDhcdUZGMUJcdThGRDRcdTU2REVcdTc1MjhcdTRFOEVcdTY1MzZcdThENzdcdTc2ODRcdTVGRUJcdTcxNjdcdTUyMTdcdTg4NjggKi9cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmRTY3JlZW5Db250ZW50KHJvb3RFbCkge1xuICBjb25zdCBub2RlcyA9IGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKVxuICBjb25zdCBzbmFwc2hvdHMgPSBub2Rlcy5tYXAoKGVsKSA9PiAoeyBlbCwgc3R5bGU6IHNuYXBzaG90SW5saW5lQm94KGVsKSB9KSlcbiAgZm9yIChjb25zdCB7IGVsIH0gb2Ygc25hcHNob3RzKSBhcHBseUV4cGFuZGVkQm94KGVsKVxuICAvLyBcdTVCNTBcdTdFQTdcdTY0OTFcdTVGMDBcdTU0MEVcdUZGMENcdTY4MzlcdTUxOERcdTkxQ0ZcdTRFMDBcdTZCMjFcdUZGMENcdTU0MDNcdTYzODlcdTZCOEJcdTRGNTlcdTZFQTJcdTUxRkFcbiAgYXBwbHlFeHBhbmRlZEJveChyb290RWwpXG4gIHJldHVybiBzbmFwc2hvdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlU2NyZWVuQ29udGVudChzbmFwc2hvdHMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNuYXBzaG90cykpIHJldHVyblxuICBmb3IgKGNvbnN0IHsgZWwsIHN0eWxlIH0gb2Ygc25hcHNob3RzKSByZXN0b3JlSW5saW5lQm94KGVsLCBzdHlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVDb250ZW50Qm94KHJvb3RFbCkge1xuICByZXR1cm4gbWVhc3VyZUludHJpbnNpY0JveChyb290RWwpXG59XG5cbi8qKlxuICogXHU1REU1XHU1MTc3XHU2ODBGXHU1QzU1XHU1RjAwL1x1NjUzNlx1OEQ3N1x1NzZFRVx1NjgwN1x1RkYxQVxuICogXHU2NzA5XHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUyRkVcdTkwMDlcdTk2QzZcdTU0MDhcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTE2OFx1OTBFOFx1NUM0Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbElkcykge1xuICBpZiAoc2VsZWN0ZWRJZHMgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICBpZiAoc2VsZWN0ZWRJZHMuc2l6ZSA+IDApIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RlZElkcykgJiYgc2VsZWN0ZWRJZHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH1cbiAgcmV0dXJuIFsuLi5hbGxJZHNdXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgU2NyZWVuSWRlbnRpdHlQcm92aWRlciB9IGZyb20gJy4uL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuaW1wb3J0IHsgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIC8vIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1ODQzRFx1NTIzMFx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlxuICAgIGlmIChjYW52YXNMb2NrZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBcdTVERjJcdTVDNTVcdTVGMDBcdTY1RTBcdTUzRUZcdTZFREFcdTUzM0FcdTU3REZcdUZGMENcdTRFMERcdTYyQTJcdTYzMDdcdTk0ODhcbiAgICBpZiAoZXhwYW5kZWQpIHJldHVyblxuICAgIGNvbnN0IHN0YXRlID0gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgY29udGVudFJlZi5jdXJyZW50LCB7IGxvY2tlZDogY2FudmFzTG9ja2VkLCBzY2FsZSB9KVxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IHN0YXRlXG4gICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgY29udGVudFJlZi5jdXJyZW50LCBuYXZpZ2F0ZSlcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuLyoqIFx1N0VEMVx1NUI5QVx1OTc1RSBwYXNzaXZlIHdoZWVsXHVGRjBDXHU2MjREXHU4MEZEXHU1NDA4XHU2Q0Q1IHByZXZlbnREZWZhdWx0XHVGRjA4UmVhY3Qgb25XaGVlbCBcdTlFRDhcdThCQTQgcGFzc2l2ZVx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRXaGVlbFpvb20oZWwsIGdldFNjYWxlLCBzZXRTY2FsZSwgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UpIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgbG9ja2VkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuXG4gIFJlYWN0LnVzZUVmZmVjdChcbiAgICAoKSA9PiBiaW5kV2hlZWxab29tKFxuICAgICAgZWxlbWVudFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gc2NhbGVSZWYuY3VycmVudCxcbiAgICAgIHNldFNjYWxlLFxuICAgICAgKCkgPT4gbG9ja2VkUmVmLmN1cnJlbnQsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImV4cG9ydCBjb25zdCBDQU5WQVNfSU5ERVhfTUFSR0lOID0gMTZcblxuZnVuY3Rpb24gZmluaXRlKHZhbHVlLCBmYWxsYmFjayA9IDApIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24ocG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICBjb25zdCBjb250YWluZXJXaWR0aCA9IE1hdGgubWF4KDAsIGZpbml0ZShjb250YWluZXI/LndpZHRoKSlcbiAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSlcbiAgY29uc3QgaXRlbVdpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LndpZHRoKSlcbiAgY29uc3QgaXRlbUhlaWdodCA9IE1hdGgubWF4KDAsIGZpbml0ZShpdGVtPy5oZWlnaHQpKVxuICBjb25zdCBtYXhYID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJXaWR0aCAtIGl0ZW1XaWR0aCAtIG1hcmdpbilcbiAgY29uc3QgbWF4WSA9IE1hdGgubWF4KG1hcmdpbiwgY29udGFpbmVySGVpZ2h0IC0gaXRlbUhlaWdodCAtIG1hcmdpbilcbiAgcmV0dXJuIHtcbiAgICB4OiBNYXRoLm1pbihNYXRoLm1heChmaW5pdGUocG9zaXRpb24/LngsIG1hcmdpbiksIG1hcmdpbiksIG1heFgpLFxuICAgIHk6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueSwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICByZXR1cm4gY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKHtcbiAgICB4OiAoZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpIC0gZmluaXRlKGl0ZW0/LndpZHRoKSkgLyAyLFxuICAgIHk6IGZpbml0ZShjb250YWluZXI/LmhlaWdodCkgLSBmaW5pdGUoaXRlbT8uaGVpZ2h0KSAtIG1hcmdpbixcbiAgfSwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhnZXRFbGVtZW50cywgb25SZWFkeSwgc2NoZWR1bGVyKSB7XG4gIGxldCBhY3RpdmUgPSB0cnVlXG4gIGxldCBmcmFtZSA9IG51bGxcblxuICBjb25zdCBhdHRlbXB0ID0gKCkgPT4ge1xuICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICBjb25zdCBlbGVtZW50cyA9IGdldEVsZW1lbnRzKClcbiAgICBpZiAoIWVsZW1lbnRzPy5jb250YWluZXIgfHwgIWVsZW1lbnRzPy5pdGVtKSB7XG4gICAgICBmcmFtZSA9IHNjaGVkdWxlci5yZXF1ZXN0KGF0dGVtcHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZnJhbWUgPSBudWxsXG4gICAgb25SZWFkeShlbGVtZW50cylcbiAgfVxuXG4gIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGlmIChmcmFtZSAhPSBudWxsKSBzY2hlZHVsZXIuY2FuY2VsKGZyYW1lKVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7XG4gIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbixcbiAgZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24sXG4gIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzLFxufSBmcm9tICcuL2NhbnZhcy1pbmRleC5qcydcblxuY29uc3QgSU5ERVhfRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHsgd2lkdGg6IGVsZW1lbnQ/Lm9mZnNldFdpZHRoIHx8IDAsIGhlaWdodDogZWxlbWVudD8ub2Zmc2V0SGVpZ2h0IHx8IDAgfVxufVxuXG5mdW5jdGlvbiBDYW52YXNJbmRleCh7XG4gIGNhbnZhc1JlZixcbiAgcHJvamVjdCxcbiAgY3VycmVudFNjcmVlbklkLFxuICBkZW1vQXZhaWxhYmxlLFxuICBwb3NpdGlvbixcbiAgb25Qb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZSxcbiAgbmF2aWdhdGUsXG4gIGVudGVyRGVtbyxcbn0pIHtcbiAgY29uc3QgaW5kZXhSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IGNvbnN0cmFpbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0UG9zaXRpb24sIHVzZURlZmF1bHQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgY29uc3QgaW5kZXggPSBpbmRleFJlZi5jdXJyZW50XG4gICAgaWYgKCFjYW52YXMgfHwgIWluZGV4KSByZXR1cm4gbmV4dFBvc2l0aW9uXG4gICAgY29uc3QgY29udGFpbmVyID0geyB3aWR0aDogY2FudmFzLmNsaWVudFdpZHRoLCBoZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQgfVxuICAgIGNvbnN0IGl0ZW0gPSBlbGVtZW50U2l6ZShpbmRleClcbiAgICByZXR1cm4gdXNlRGVmYXVsdFxuICAgICAgPyBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbihjb250YWluZXIsIGl0ZW0pXG4gICAgICA6IGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihuZXh0UG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSlcbiAgfSwgW2NhbnZhc1JlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBsZXQgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHt9XG4gICAgY29uc3Qgc3RvcFdhaXRpbmcgPSB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhcbiAgICAgICgpID0+ICh7IGNvbnRhaW5lcjogY2FudmFzUmVmLmN1cnJlbnQsIGl0ZW06IGluZGV4UmVmLmN1cnJlbnQgfSksXG4gICAgICAoeyBjb250YWluZXI6IGNhbnZhcywgaXRlbTogaW5kZXggfSkgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiBvblBvc2l0aW9uQ2hhbmdlKChjdXJyZW50KSA9PiBjb25zdHJhaW4oY3VycmVudCwgIWN1cnJlbnQpKVxuICAgICAgICB1cGRhdGUoKVxuXG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih1cGRhdGUpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShpbmRleClcbiAgICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgICAgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXF1ZXN0OiAoY2FsbGJhY2spID0+IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spLFxuICAgICAgICBjYW5jZWw6IChmcmFtZSkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKSxcbiAgICAgIH0sXG4gICAgKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0b3BXYWl0aW5nKClcbiAgICAgIGRpc2Nvbm5lY3RSZXNpemUoKVxuICAgIH1cbiAgfSwgW2NhbnZhc1JlZiwgY29uc3RyYWluLCBvblBvc2l0aW9uQ2hhbmdlXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17aW5kZXhSZWZ9XG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLWNhbnZhcy1pbmRleCBpcy1kcmFnZ2luZycgOiAnd2YtY2FudmFzLWluZGV4J31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHZpc2liaWxpdHk6ICdoaWRkZW4nIH19XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWhhbmRsZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uIHx8IGNvbnN0cmFpbihudWxsLCB0cnVlKVxuICAgICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBJTkRFWF9EUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2UoY29uc3RyYWluKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KSlcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWdyaXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48aSAvPjxpIC8+PGkgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWNsb3NlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIm00IDQgOCA4TTEyIDRsLTggOFwiIC8+PC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG4gIGNhbnZhc0luZGV4VmlzaWJsZSA9IHRydWUsXG4gIGNhbnZhc0luZGV4UG9zaXRpb24sXG4gIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZUNhbnZhc0luZGV4LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgZW50ZXJEZW1vID0gKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFkZW1vQXZhaWxhYmxlIHx8IGNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uQ2xpY2s9e29uQ2FudmFzQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2FudmFzSW5kZXhWaXNpYmxlID8gKFxuICAgICAgICAgIDxDYW52YXNJbmRleFxuICAgICAgICAgICAgY2FudmFzUmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgICAgcG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlPXtvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvbkNsb3NlPXtvbkNsb3NlQ2FudmFzSW5kZXh9XG4gICAgICAgICAgICBuYXZpZ2F0ZT17bmF2aWdhdGV9XG4gICAgICAgICAgICBlbnRlckRlbW89e2VudGVyRGVtb31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxuICBvbkNhbnZhc0NsaWNrLFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgc2VsZWN0aW9ucyxcbiAgbXVsdGlTZWxlY3QsXG4gIGl0ZW1zLFxuICBvblRvZ2dsZU11bHRpU2VsZWN0LFxuICBvblNlbGVjdEVsZW1lbnQsXG4gIG9uSG92ZXJFbGVtZW50LFxuICBvblJlbW92ZVNlbGVjdGlvbixcbiAgb25DbGVhclNlbGVjdGlvbixcbiAgb25BZGRJdGVtLFxuICBvblJlbW92ZUl0ZW0sXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0aW9uc1tzZWxlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IG51bGxcbiAgY29uc3QgZ2VuZXJhdGVkUHJvbXB0ID0gUmVhY3QudXNlTWVtbygoKSA9PiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcyksIFtwcm9qZWN0LCBpdGVtc10pXG4gIGNvbnN0IFt0eXBlLCBzZXRUeXBlXSA9IFJlYWN0LnVzZVN0YXRlKCdjb21tZW50JylcbiAgY29uc3QgW2luc3RydWN0aW9uLCBzZXRJbnN0cnVjdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Byb21wdCwgc2V0UHJvbXB0XSA9IFJlYWN0LnVzZVN0YXRlKGdlbmVyYXRlZFByb21wdClcbiAgY29uc3QgW3Byb21wdERpcnR5LCBzZXRQcm9tcHREaXJ0eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjb3B5VGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcHJvbXB0RGlydHkpIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gIH0sIFtnZW5lcmF0ZWRQcm9tcHQsIHByb21wdERpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgY29uc3QgYWRkSXRlbSA9ICgpID0+IHtcbiAgICBpZiAoc2VsZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVyblxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBpbnN0cnVjdGlvbi50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQgJiYgdHlwZSAhPT0gJ3JlbW92ZScpIHJldHVyblxuICAgIG9uQWRkSXRlbSh7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0czogc2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbikgPT4gKHtcbiAgICAgICAgc2NyZWVuSWQ6IHNlbGVjdGlvbi5zY3JlZW5JZCxcbiAgICAgICAgc2NyZWVuVGl0bGU6IHNlbGVjdGlvbi5zY3JlZW5UaXRsZSxcbiAgICAgICAgc291cmNlSGludDogc2VsZWN0aW9uLnNvdXJjZUhpbnQsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3Rpb24uc2VsZWN0b3IsXG4gICAgICAgIGN1cnJlbnRUZXh0OiBzZWxlY3Rpb24uY3VycmVudFRleHQsXG4gICAgICB9KSksXG4gICAgICBpbnN0cnVjdGlvbjogbm9ybWFsaXplZCxcbiAgICB9KVxuICAgIHNldEluc3RydWN0aW9uKCcnKVxuICB9XG5cbiAgY29uc3QgcmVnZW5lcmF0ZSA9ICgpID0+IHtcbiAgICBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICAgIHNldFByb21wdERpcnR5KGZhbHNlKVxuICB9XG5cbiAgY29uc3QgY29weVByb21wdCA9ICgpID0+IHtcbiAgICBjb3B5VGV4dChwcm9tcHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3B5VGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDE0MDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGluc3RydWN0aW9uTGFiZWwgPSB0eXBlID09PSAndGV4dCdcbiAgICA/ICdcdTY1QjBcdTY1ODdcdTVCNTcnXG4gICAgOiB0eXBlID09PSAnb3JkZXInXG4gICAgICA/ICdcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDInXG4gICAgICA6IHR5cGUgPT09ICdyZW1vdmUnXG4gICAgICAgID8gJ1x1NTIyMFx1OTY2NFx1OEJGNFx1NjYwRVx1RkYwOFx1NTNFRlx1OTAwOVx1RkYwOSdcbiAgICAgICAgOiAnXHU3RUQ5IEFJIFx1NzY4NFx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRSdcblxuICByZXR1cm4gKFxuICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWxcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCXCI+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLXRpdGxlXCI+XHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCPC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWNvdW50XCI+e2l0ZW1zLmxlbmd0aH0gXHU2NzYxXHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtYm9keVwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NURGMlx1OTAwOVx1ODI4Mlx1NzBCOSAoe3NlbGVjdGlvbnMubGVuZ3RofSk8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bXVsdGlTZWxlY3QgPyAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QnfVxuICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17bXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVNdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTkxQVx1OTAwOSB7bXVsdGlTZWxlY3QgPyAnT04nIDogJ09GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsZWFyLXNlbGVjdGlvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtvbkNsZWFyU2VsZWN0aW9ufT5cdTZFMDVcdTdBN0E8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhpbnRcIj5cdTU5MUFcdTkwMDlcdTVGMDBcdTU0MkZcdTU0MEVcdTcwQjlcdTUxRkJcdTgyODJcdTcwQjlcdTUzRUZcdTUyQTBcdTUxNjVcdTYyMTZcdTc5RkJcdTk2NjRcdUZGMUJcdTRFNUZcdTUzRUZcdTYzMDlcdTRGNEYgU2hpZnQgLyBDb21tYW5kIC8gQ3RybCBcdTcwQjlcdTUxRkJcdTMwMDI8L3A+XG4gICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uc1wiPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzZWxlY3Rpb24gPT09IHNlbGVjdGVkID8gJ3dmLXJldmlldy1zZWxlY3Rpb24gaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctc2VsZWN0aW9uJ30ga2V5PXtgJHtzZWxlY3Rpb24uc2NyZWVuSWR9OiR7c2VsZWN0aW9uLnNlbGVjdG9yfWB9PlxuICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1zZWxlY3RvclwiPntpbmRleCArIDF9LiB7c2VsZWN0aW9uLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1yZW1vdmVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVTZWxlY3Rpb24oc2VsZWN0aW9uLmVsZW1lbnQpfT5cdTc5RkJcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2NyZWVuLW5hbWVcIj57c2VsZWN0ZWQuc2NyZWVuVGl0bGV9IFx1MDBCNyB7c2VsZWN0ZWQuc2NyZWVuSWR9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJzXCIgYXJpYS1sYWJlbD1cIlx1ODI4Mlx1NzBCOVx1NUM0Mlx1N0VBN1wiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZC5hbmNlc3RvcnMubWFwKChhbmNlc3RvciwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2FuY2VzdG9yLnNlbGVjdG9yfT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYi1zZXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwibTkgMTggNi02LTYtNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthbmNlc3Rvci5zZWxlY3Rvcn1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IG9uSG92ZXJFbGVtZW50Py4oYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2VsZWN0RWxlbWVudChhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHthbmNlc3Rvci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdG9yXCI+e3NlbGVjdGVkLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAge3NlbGVjdGVkLmN1cnJlbnRUZXh0ID8gKFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1jdXJyZW50LXRleHRcIj5cdTVGNTNcdTUyNERcdUZGMUF7c2VsZWN0ZWQuY3VycmVudFRleHR9PC9wPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NEZFRVx1NjUzOVx1N0M3Qlx1NTc4Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLXNlbGVjdFwiIHZhbHVlPXt0eXBlfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRUeXBlKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKFJFVklFV19UWVBFX0xBQkVMUykubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLW9wdGlvblwiIHZhbHVlPXt2YWx1ZX0ga2V5PXt2YWx1ZX0+e2xhYmVsfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj57aW5zdHJ1Y3Rpb25MYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaW5zdHJ1Y3Rpb25cIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2luc3RydWN0aW9ufVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3R5cGUgPT09ICdvcmRlcicgPyAnXHU0RjhCXHU1OTgyXHVGRjFBXHU3OUZCXHU1MkE4XHU1MjMwXHU4QkEyXHU1MzU1XHU2NDU4XHU4OTgxXHU0RTRCXHU1NDBFJyA6ICdcdTYzQ0ZcdThGRjBcdTVFMENcdTY3MUIgQUkgXHU1OTgyXHU0RjU1XHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEluc3RydWN0aW9uKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaW5zdHJ1Y3Rpb24udHJpbSgpICYmIHR5cGUgIT09ICdyZW1vdmUnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FkZEl0ZW19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTUyQTBcdTUxNjVcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMDh7c2VsZWN0aW9ucy5sZW5ndGh9IFx1NEUyQVx1ODI4Mlx1NzBCOVx1RkYwOVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTRFMkRcdTc2ODRcdTgyODJcdTcwQjlcdTVGMDBcdTU5Q0JcdThCQzRcdThCQkFcdTMwMDJcdTcwQjlcdTUxRkJcdTk3NjJcdTUzMDVcdTVDNTFcdTUzRUZcdTUyMDdcdTYzNjJcdTUyMzBcdTcyMzZcdTdFQTdcdTdFQzRcdTRFRjZcdTMwMDI8L3A+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTU8L2gyPlxuICAgICAgICAgIHtpdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtc1wiPlxuICAgICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbVwiIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS10aXRsZVwiPntpbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2l0ZW0udHlwZV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Jldmlld1RhcmdldHMoaXRlbSkubWFwKCh0YXJnZXQpID0+IHRhcmdldC5zZWxlY3Rvcikuam9pbignXHUzMDAxJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0taW5zdHJ1Y3Rpb25cIj57aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ308L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tZGVsZXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlSXRlbShpdGVtLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDhcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24gd2YtcmV2aWV3LXByb21wdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTY3MDBcdTdFQzggUHJvbXB0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cmVnZW5lcmF0ZX0+XHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb21wdERpcnR5ID8gPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hbnVhbFwiPlByb21wdCBcdTVERjJcdTYyNEJcdTUyQThcdTRGRUVcdTY1MzlcdUZGMUJcdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTBcdTRGMUFcdTg5ODZcdTc2RDZcdTYyNEJcdTUyQThcdTUxODVcdTVCQjlcdTMwMDI8L3A+IDogbnVsbH1cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1wcm9tcHRcIlxuICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0UHJvbXB0KGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9e2NvcHlQcm9tcHR9PlxuICAgICAgICAgICAge2NvcGllZCA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NTkwRFx1NTIzNiBQcm9tcHQnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiaW1wb3J0IHsgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLml0ZW0gPT09IG90aGVyLml0ZW1cbiAgICAgICYmIGl0ZW0uaXRlbUluZGV4ID09PSBvdGhlci5pdGVtSW5kZXhcbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICB9KVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBpdGVtcykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgcG9zaXRpb25zID0gW11cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICByZXZpZXdUYXJnZXRzKGl0ZW0pLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0LnNlbGVjdG9yKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50Py5pc0Nvbm5lY3RlZCkgcmV0dXJuXG4gICAgICBjb25zdCBzY3JlZW5Db250ZW50ID0gZWxlbWVudC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKVxuICAgICAgaWYgKCFzY3JlZW5Db250ZW50KSByZXR1cm5cbiAgICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHNjcmVlbkNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgICBpZiAoIXZpc2libGUpIHJldHVyblxuICAgICAgY29uc3QgYmFzZUxlZnQgPSBNYXRoLnJvdW5kKHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdClcbiAgICAgIGNvbnN0IGJhc2VUb3AgPSBNYXRoLnJvdW5kKHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcClcbiAgICAgIGNvbnN0IG92ZXJsYXBDb3VudCA9IHBvc2l0aW9ucy5maWx0ZXIoXG4gICAgICAgIChwb3NpdGlvbikgPT4gTWF0aC5hYnMocG9zaXRpb24uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAyICYmIE1hdGguYWJzKHBvc2l0aW9uLmJhc2VUb3AgLSBiYXNlVG9wKSA8IDIsXG4gICAgICApLmxlbmd0aFxuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBrZXk6IGAke2l0ZW0uaWR9OiR7dGFyZ2V0SW5kZXh9YCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXRlbUluZGV4LFxuICAgICAgICB0YXJnZXRJbmRleCxcbiAgICAgICAgYmFzZUxlZnQsXG4gICAgICAgIGJhc2VUb3AsXG4gICAgICAgIGxlZnQ6IGJhc2VMZWZ0ICsgb3ZlcmxhcENvdW50ICogMTUsXG4gICAgICAgIHRvcDogYmFzZVRvcCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdNYXJrZXJzKHsgYm9hcmRSZWYsIGl0ZW1zLCBvbk9wZW5QYW5lbCB9KSB7XG4gIGNvbnN0IFtwb3NpdGlvbnMsIHNldFBvc2l0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2FjdGl2ZUtleSwgc2V0QWN0aXZlS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZyYW1lUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZFJlZi5jdXJyZW50LCBpdGVtcylcbiAgICBzZXRQb3NpdGlvbnMoKGN1cnJlbnQpID0+IHNhbWVQb3NpdGlvbnMoY3VycmVudCwgbmV4dCkgPyBjdXJyZW50IDogbmV4dClcbiAgfSwgW2JvYXJkUmVmLCBpdGVtc10pXG5cbiAgY29uc3Qgc2NoZWR1bGVSZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICBmcmFtZVJlZi5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmcmFtZVJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgcmVmcmVzaCgpXG4gICAgfSlcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdChzY2hlZHVsZVJlZnJlc2gpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW3NjaGVkdWxlUmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aXZlS2V5ICYmICFwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KSkgc2V0QWN0aXZlS2V5KG51bGwpXG4gIH0sIFthY3RpdmVLZXksIHBvc2l0aW9uc10pXG5cbiAgY29uc3QgYWN0aXZlID0gcG9zaXRpb25zLmZpbmQoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSlcbiAgY29uc3QgYm9hcmRXaWR0aCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudFdpZHRoIHx8IDBcbiAgY29uc3QgYm9hcmRIZWlnaHQgPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgfHwgMFxuICBjb25zdCBidWJibGVMZWZ0ID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS5sZWZ0ICsgMTYsIGJvYXJkV2lkdGggLSAzMzYpKSA6IDBcbiAgY29uc3QgYnViYmxlVG9wID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS50b3AgKyAyNCwgYm9hcmRIZWlnaHQgLSAxODApKSA6IDBcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlcnNcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU2ODA3XHU4QkIwXCI+XG4gICAgICB7cG9zaXRpb25zLm1hcCgocG9zaXRpb24pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YWN0aXZlS2V5ID09PSBwb3NpdGlvbi5rZXkgPyAnd2YtcmV2aWV3LW1hcmtlciBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tYXJrZXInfVxuICAgICAgICAgIGtleT17cG9zaXRpb24ua2V5fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVx1RkYxQSR7UkVWSUVXX1RZUEVfTEFCRUxTW3Bvc2l0aW9uLml0ZW0udHlwZV19YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBwb3NpdGlvbi5sZWZ0LCB0b3A6IHBvc2l0aW9uLnRvcCB9fVxuICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldEFjdGl2ZUtleSgoY3VycmVudCkgPT4gY3VycmVudCA9PT0gcG9zaXRpb24ua2V5ID8gbnVsbCA6IHBvc2l0aW9uLmtleSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICB7YWN0aXZlID8gKFxuICAgICAgICA8YXNpZGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IGJ1YmJsZUxlZnQsIHRvcDogYnViYmxlVG9wIH19XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke2FjdGl2ZS5pdGVtSW5kZXggKyAxfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgIHthY3RpdmUuaXRlbUluZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbYWN0aXZlLml0ZW0udHlwZV19XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWNsb3NlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUtleShudWxsKX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWluc3RydWN0aW9uXCI+XG4gICAgICAgICAgICB7YWN0aXZlLml0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9XG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRhcmdldHNcIj5cbiAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGFjdGl2ZS5pdGVtKS5tYXAoKHRhcmdldCkgPT4gKFxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItc2VsZWN0b3JcIiBrZXk9e3RhcmdldC5zZWxlY3Rvcn0+e3RhcmdldC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItbW9yZVwiXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlS2V5KG51bGwpXG4gICAgICAgICAgICAgIG9uT3BlblBhbmVsPy4oKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTY3RTVcdTc3MEJcdTY2RjRcdTU5MUFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiY29uc3QgTEFVTkNIRVJfU0laRSA9IDQ4XG5jb25zdCBMQVVOQ0hFUl9NQVJHSU4gPSAyMFxuY29uc3QgRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIE1hdGgubWF4KG1pbiwgbWF4KSlcbn1cblxuZnVuY3Rpb24gY2xhbXBQb3NpdGlvbihib2FyZCwgcG9zaXRpb24pIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIHBvc2l0aW9uXG4gIHJldHVybiB7XG4gICAgeDogY2xhbXAocG9zaXRpb24ueCwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICAgIHk6IGNsYW1wKHBvc2l0aW9uLnksIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSB7XG4gIHJldHVybiBjbGFtcFBvc2l0aW9uKGJvYXJkLCB7XG4gICAgeDogYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICAgIHk6IGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlS2V5KSlcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlPy54KSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWU/LnkpKSByZXR1cm4gdmFsdWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gbG9jYWxTdG9yYWdlIG1heSBiZSB1bmF2YWlsYWJsZSBmb3IgYSBkaXJlY3RseSBvcGVuZWQgbG9jYWwgZmlsZS5cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb24pIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocG9zaXRpb24pKVxuICB9IGNhdGNoIHtcbiAgICAvLyBLZWVwaW5nIHRoZSBsYXVuY2hlciBkcmFnZ2FibGUgaXMgbW9yZSBpbXBvcnRhbnQgdGhhbiBwZXJzaXN0ZW5jZS5cbiAgfVxufVxuXG5mdW5jdGlvbiBDb21tZW50SWNvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk01IDQuNWgxNGEyIDIgMCAwIDEgMiAydjhhMiAyIDAgMCAxLTIgMmgtNmwtNC41IDN2LTNINWEyIDIgMCAwIDEtMi0ydi04YTIgMiAwIDAgMSAyLTJaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNy41IDEwLjVoOVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld0xhdW5jaGVyKHsgYm9hcmRSZWYsIGNvdW50LCBwcm9qZWN0TmFtZSwgb25PcGVuIH0pIHtcbiAgY29uc3Qgc3RvcmFnZUtleSA9IGB3Zi1yZXZpZXctbGF1bmNoZXItcG9zaXRpb246JHtwcm9qZWN0TmFtZX1gXG4gIGNvbnN0IFtwb3NpdGlvbiwgc2V0UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBwb3NpdGlvblJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdXBwcmVzc0NsaWNrUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuXG4gIGNvbnN0IHVwZGF0ZVBvc2l0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHQpID0+IHtcbiAgICBjb25zdCBjbGFtcGVkID0gY2xhbXBQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50LCBuZXh0KVxuICAgIHBvc2l0aW9uUmVmLmN1cnJlbnQgPSBjbGFtcGVkXG4gICAgc2V0UG9zaXRpb24oY2xhbXBlZClcbiAgICByZXR1cm4gY2xhbXBlZFxuICB9LCBbYm9hcmRSZWZdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYm9hcmQgPSBib2FyZFJlZi5jdXJyZW50XG4gICAgaWYgKCFib2FyZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHVwZGF0ZVBvc2l0aW9uKHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuXG4gICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IHVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcbiAgICAgIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBuZXh0KVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICB9LCBbYm9hcmRSZWYsIHN0b3JhZ2VLZXksIHVwZGF0ZVBvc2l0aW9uXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBkcmFnLm1vdmVkXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgIGlmIChwb3NpdGlvblJlZi5jdXJyZW50KSBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb25SZWYuY3VycmVudClcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPD0gMCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtkcmFnZ2luZyA/ICd3Zi1yZXZpZXctbGF1bmNoZXIgaXMtZHJhZ2dpbmcnIDogJ3dmLXJldmlldy1sYXVuY2hlcid9XG4gICAgICBzdHlsZT17cG9zaXRpb24gPyB7IGxlZnQ6IHBvc2l0aW9uLngsIHRvcDogcG9zaXRpb24ueSB9IDogeyByaWdodDogTEFVTkNIRVJfTUFSR0lOLCBib3R0b206IExBVU5DSEVSX01BUkdJTiB9fVxuICAgICAgYXJpYS1sYWJlbD17YFx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVx1RkYwQ1x1NTE3MSAke2NvdW50fSBcdTY3NjFcdTRGRUVcdTY1MzlgfVxuICAgICAgZGF0YS10b29sdGlwPVwiXHU1QzU1XHU1RjAwXHU4QkM0XHU4QkJBXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmRSZWYuY3VycmVudClcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgfVxuICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgaWYgKCFkcmFnLm1vdmVkICYmIE1hdGguaHlwb3QoZGVsdGFYLCBkZWx0YVkpIDwgRFJBR19USFJFU0hPTEQpIHJldHVyblxuICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICB1cGRhdGVQb3NpdGlvbih7IHg6IGRyYWcub3JpZ2luLnggKyBkZWx0YVgsIHk6IGRyYWcub3JpZ2luLnkgKyBkZWx0YVkgfSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgaWYgKHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCkge1xuICAgICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgb25PcGVuKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPENvbW1lbnRJY29uIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y291bnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG4iLCAiZXhwb3J0IGNvbnN0IFVOU0FWRURfUkVWSUVXX01FU1NBR0UgPSAnXHU0RkVFXHU2NTM5XHU1MTg1XHU1QkI5XHU1QzFBXHU2NzJBXHU0RkREXHU1QjU4XHVGRjBDXHU3OUJCXHU1RjAwXHU5ODc1XHU5NzYyXHU1NDBFXHU0RjFBXHU0RTIyXHU1OTMxXHUzMDAyXHU2NjJGXHU1NDI2XHU3RUU3XHU3RUVEXHVGRjFGJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgZXZlbnQucmV0dXJuVmFsdWUgPSBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG4gIHJldHVybiBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG59XG4iLCAiZXhwb3J0IGNvbnN0IEJPQVJEX1NIT1JUQ1VUUyA9IFtcbiAgeyBpZDogJ2NhbnZhcycsIGtleXM6ICdDdHJsKzEnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2RlbW8nLCBrZXlzOiAnQ3RybCsyJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdpbnRlcmFjdGlvbicsIGtleXM6ICdDdHJsK0knLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTNFRlx1NEVBNFx1NEU5MiAvIFx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5MicgfSxcbiAgeyBpZDogJ3JldmlldycsIGtleXM6ICdDdHJsK00nLCBsYWJlbDogJ1x1NUYwMFx1NTQyRlx1NjIxNlx1NTE3M1x1OTVFRFx1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ltbWVyc2l2ZScsIGtleXM6ICdDdHJsK0YnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2Jyb3dzZXItZnVsbHNjcmVlbicsIGtleXM6ICdDdHJsK1NoaWZ0K0YnLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RicgfSxcbiAgeyBpZDogJ2hvdHNwb3RzJywga2V5czogJ0N0cmwrSCcsIGxhYmVsOiAnXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBJyB9LFxuICB7IGlkOiAnc3BhY2UnLCBrZXlzOiAnU3BhY2UnLCBsYWJlbDogJ1x1NjMwOVx1NEY0Rlx1NEUzNFx1NjVGNlx1NjJENlx1NTJBOFx1NzUzQlx1NUUwMycgfSxcbiAgeyBpZDogJ2VzY2FwZScsIGtleXM6ICdFc2MnLCBsYWJlbDogJ1x1NTE3M1x1OTVFRFx1NUY1M1x1NTI0RFx1OTc2Mlx1Njc3Rlx1NjIxNlx1OTAwMFx1NTFGQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2hlbHAnLCBrZXlzOiAnPycsIGxhYmVsOiAnXHU2MjUzXHU1RjAwXHU2MjE2XHU1MTczXHU5NUVEXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IGVsZW1lbnQgPSB0YXJnZXQubm9kZVR5cGUgPT09IDMgPyB0YXJnZXQucGFyZW50RWxlbWVudCA6IHRhcmdldFxuICBpZiAoIWVsZW1lbnQpIHJldHVybiBmYWxzZVxuICBjb25zdCB0YWcgPSBlbGVtZW50LnRhZ05hbWVcbiAgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICdURVhUQVJFQScgfHwgdGFnID09PSAnU0VMRUNUJykgcmV0dXJuIHRydWVcbiAgaWYgKGVsZW1lbnQuaXNDb250ZW50RWRpdGFibGUpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIWVsZW1lbnQuY2xvc2VzdD8uKCdbY29udGVudGVkaXRhYmxlXTpub3QoW2NvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJdKScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpIHtcbiAgaWYgKCFldmVudCB8fCBldmVudC5yZXBlYXQgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkpIHJldHVybiBudWxsXG4gIGNvbnN0IGtleSA9IFN0cmluZyhldmVudC5rZXkgfHwgJycpLnRvTG93ZXJDYXNlKClcblxuICBpZiAoIWV2ZW50LmN0cmxLZXkpIHtcbiAgICBpZiAoIWV2ZW50LnNoaWZ0S2V5ICYmIGtleSA9PT0gJ2VzY2FwZScpIHJldHVybiAnZXNjYXBlJ1xuICAgIGlmIChldmVudC5rZXkgPT09ICc/JykgcmV0dXJuICdoZWxwJ1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAoZXZlbnQuc2hpZnRLZXkpIHJldHVybiBrZXkgPT09ICdmJyA/ICdicm93c2VyLWZ1bGxzY3JlZW4nIDogbnVsbFxuICBpZiAoa2V5ID09PSAnMScpIHJldHVybiAnY2FudmFzJ1xuICBpZiAoa2V5ID09PSAnMicpIHJldHVybiAnZGVtbydcbiAgaWYgKGtleSA9PT0gJ2knKSByZXR1cm4gJ2ludGVyYWN0aW9uJ1xuICBpZiAoa2V5ID09PSAnbScpIHJldHVybiAncmV2aWV3J1xuICBpZiAoa2V5ID09PSAnZicpIHJldHVybiAnaW1tZXJzaXZlJ1xuICBpZiAoa2V5ID09PSAnaCcpIHJldHVybiAnaG90c3BvdHMnXG4gIHJldHVybiBudWxsXG59XG4iLCAiaW1wb3J0IHsgQk9BUkRfU0hPUlRDVVRTIH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmZ1bmN0aW9uIFBhbmVsU2hlbGwoeyBpZCwgdGl0bGUsIGFyaWFMYWJlbCwgb25DbG9zZSwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBjbG9zZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCByZXR1cm5Gb2N1c1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgcmV0dXJuRm9jdXNSZWYuY3VycmVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnRcbiAgICBjbG9zZVJlZi5jdXJyZW50Py5mb2N1cygpXG4gICAgcmV0dXJuICgpID0+IHJldHVybkZvY3VzUmVmLmN1cnJlbnQ/LmZvY3VzPy4oKVxuICB9LCBbXSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLWxheWVyXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0KSBvbkNsb3NlKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPHNlY3Rpb24gaWQ9e2lkfSBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e2FyaWFMYWJlbH0+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgICAgPHN0cm9uZz57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgICAgPGJ1dHRvbiByZWY9e2Nsb3NlUmVmfSB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfSBhcmlhLWxhYmVsPXtgXHU1MTczXHU5NUVEJHt0aXRsZX1gfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2hvcnRjdXRIZWxwKHsgZGVtb0F2YWlsYWJsZSwgc2hvd0NhbnZhc0luZGV4LCBvblNob3dDYW52YXNJbmRleENoYW5nZSwgb25DbG9zZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPFBhbmVsU2hlbGwgaWQ9XCJ3Zi1ib2FyZC11dGlsaXR5XCIgdGl0bGU9XCJcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkVcIiBhcmlhTGFiZWw9XCJcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIiBvbkNsb3NlPXtvbkNsb3NlfT5cbiAgICAgIDxkbCBjbGFzc05hbWU9XCJ3Zi1zaG9ydGN1dC1saXN0XCI+XG4gICAgICAgIHtCT0FSRF9TSE9SVENVVFMubWFwKChzaG9ydGN1dCkgPT4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtzaG9ydGN1dC5pZCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlID8gJ2lzLWRpc2FibGVkJyA6ICcnfSBrZXk9e3Nob3J0Y3V0LmlkfT5cbiAgICAgICAgICAgIDxkdD48a2JkPntzaG9ydGN1dC5rZXlzfTwva2JkPjwvZHQ+XG4gICAgICAgICAgICA8ZGQ+e3Nob3J0Y3V0LmxhYmVsfXtzaG9ydGN1dC5pZCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlID8gJ1x1RkYwOFx1NUY1M1x1NTI0RFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwOScgOiAnJ308L2RkPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApKX1cbiAgICAgIDwvZGw+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ub3RlXCI+XHU1NzI4XHU4RjkzXHU1MTY1XHU2ODQ2XHUzMDAxXHU2NTg3XHU2NzJDXHU1N0RGXHUzMDAxXHU0RTBCXHU2MkM5XHU2ODQ2XHU1NDhDXHU1M0VGXHU3RjE2XHU4RjkxXHU1MTg1XHU1QkI5XHU0RTJEXHU0RTBEXHU0RjFBXHU4OUU2XHU1M0QxXHU2NjZFXHU5MDFBXHU1RkVCXHU2Mzc3XHU5NTJFXHUzMDAyPC9wPlxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtc2VjdGlvblwiIGFyaWEtbGFiZWxsZWRieT1cIndmLWJvYXJkLWluZGV4LXNldHRpbmctdGl0bGVcIj5cbiAgICAgICAgPGgyIGlkPVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlx1NzUzQlx1Njc3Rlx1OEJCRVx1N0Y2RTwvaDI+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1zZXR0aW5nLXJvd1wiPlxuICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgPHN0cm9uZz5cdTY2M0VcdTc5M0FcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTU8L3N0cm9uZz5cbiAgICAgICAgICAgIDxzbWFsbD5cdTU3MjhcdTc1M0JcdTY3N0ZcdTRFMEFcdTY2M0VcdTc5M0FcdTUzRUZcdTYyRDZcdTYyRkRcdTc2ODRcdTk4NzVcdTk3NjJcdTdEMjJcdTVGMTU8L3NtYWxsPlxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICBjaGVja2VkPXtzaG93Q2FudmFzSW5kZXh9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBvblNob3dDYW52YXNJbmRleENoYW5nZShldmVudC50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9sYWJlbD5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICA8L1BhbmVsU2hlbGw+XG4gIClcbn1cbiIsICJjb25zdCBERUZBVUxUX1NFVFRJTkdTID0gT2JqZWN0LmZyZWV6ZSh7IHNob3dDYW52YXNJbmRleDogdHJ1ZSB9KVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9hcmRTdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiB3aW5kb3cubG9jYWxTdG9yYWdlXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSB7XG4gIHJldHVybiBgd2YtYm9hcmQtc2V0dGluZ3M6JHtwcm9qZWN0TmFtZX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkQm9hcmRTZXR0aW5ncyhzdG9yYWdlLCBwcm9qZWN0TmFtZSkge1xuICB0cnkge1xuICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2Uoc3RvcmFnZT8uZ2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSkpKVxuICAgIGlmICh0eXBlb2YgcGFyc2VkPy5zaG93Q2FudmFzSW5kZXggPT09ICdib29sZWFuJykge1xuICAgICAgcmV0dXJuIHsgc2hvd0NhbnZhc0luZGV4OiBwYXJzZWQuc2hvd0NhbnZhc0luZGV4IH1cbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGZpbGU6Ly8gc3RvcmFnZSBjYW4gYmUgdW5hdmFpbGFibGUgb3IgY29udGFpbiBzdGFsZSBkYXRhLlxuICB9XG4gIHJldHVybiB7IC4uLkRFRkFVTFRfU0VUVElOR1MgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2F2ZUJvYXJkU2V0dGluZ3Moc3RvcmFnZSwgcHJvamVjdE5hbWUsIHNldHRpbmdzKSB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB7IHNob3dDYW52YXNJbmRleDogc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4ICE9PSBmYWxzZSB9XG4gIHRyeSB7XG4gICAgc3RvcmFnZT8uc2V0SXRlbShib2FyZFNldHRpbmdzU3RvcmFnZUtleShwcm9qZWN0TmFtZSksIEpTT04uc3RyaW5naWZ5KG5vcm1hbGl6ZWQpKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIFNldHRpbmdzIHJlbWFpbiB1c2FibGUgZm9yIHRoZSBjdXJyZW50IHNlc3Npb24gd2l0aG91dCBwZXJzaXN0ZW5jZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5pbXBvcnQgeyBTaG9ydGN1dEhlbHAgfSBmcm9tICcuL0JvYXJkUGFuZWxzLmpzeCdcbmltcG9ydCB7IGdldEJvYXJkU3RvcmFnZSwgcmVhZEJvYXJkU2V0dGluZ3MsIHNhdmVCb2FyZFNldHRpbmdzIH0gZnJvbSAnLi9ib2FyZC1zZXR0aW5ncy5qcydcbmltcG9ydCB7IGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldCwgc2hvcnRjdXRJZEZvckV2ZW50IH0gZnJvbSAnLi9zaG9ydGN1dHMuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIHRvb2xiYXJFeHBhbmQ6IDw+PHBhdGggZD1cIk01IDV2MTRcIiAvPjxwYXRoIGQ9XCJtMTUgMTgtNi02IDYtNlwiIC8+PC8+LFxuICAgIHRvb2xiYXJDb2xsYXBzZTogPD48cGF0aCBkPVwiTTE5IDV2MTRcIiAvPjxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz48Lz4sXG4gICAgZG93bmxvYWQ6IDw+PHBhdGggZD1cIk0xMiAzdjEyXCIgLz48cGF0aCBkPVwibTcgMTAgNSA1IDUtNVwiIC8+PHBhdGggZD1cIk01IDIxaDE0XCIgLz48Lz4sXG4gICAgc2V0dGluZ3M6IDw+PGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIzXCIgLz48cGF0aCBkPVwiTTE5LjQgMTVhMS43IDEuNyAwIDAgMCAuMzQgMS44OGwuMDYuMDYtMi44MyAyLjgzLS4wNi0uMDZBMS43IDEuNyAwIDAgMCAxNSAxOS40YTEuNyAxLjcgMCAwIDAtMSAuNiAxLjcgMS43IDAgMCAwLS40IDEuMVYyMWgtNHYtLjA5QTEuNyAxLjcgMCAwIDAgOC42IDE5LjRhMS43IDEuNyAwIDAgMC0xLjg4LjM0bC0uMDYuMDYtMi44My0yLjgzLjA2LS4wNkExLjcgMS43IDAgMCAwIDQuNiAxNWExLjcgMS43IDAgMCAwLS42LTEgMS43IDEuNyAwIDAgMC0xLjEtLjRIM3YtNGguMDlBMS43IDEuNyAwIDAgMCA0LjYgOC42YTEuNyAxLjcgMCAwIDAtLjM0LTEuODhsLS4wNi0uMDYgMi44My0yLjgzLjA2LjA2QTEuNyAxLjcgMCAwIDAgOSA0LjZhMS43IDEuNyAwIDAgMCAxLS42IDEuNyAxLjcgMCAwIDAgLjQtMS4xVjNoNHYuMDlBMS43IDEuNyAwIDAgMCAxNS40IDQuNmExLjcgMS43IDAgMCAwIDEuODgtLjM0bC4wNi0uMDYgMi44MyAyLjgzLS4wNi4wNkExLjcgMS43IDAgMCAwIDE5LjQgOWMuMi4zNy41Mi43IDEgLjkuMzIuMTMuNjguMiAxLjEuMmguMDl2NGgtLjA5YTEuNyAxLjcgMCAwIDAtMi4xLjlaXCIgLz48Lz4sXG4gICAgaGVscDogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjlcIiAvPjxwYXRoIGQ9XCJNOS43IDlhMi40IDIuNCAwIDEgMSAzLjcgMmMtLjkuNi0xLjQgMS4xLTEuNCAyXCIgLz48cGF0aCBkPVwiTTEyIDE3aC4wMVwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gJ1x1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSBDdHJsK0knXG4gICAgICAgIDogJ1x1NUY1M1x1NTI0RFx1NURGMlx1OTUwMVx1NEY0Rlx1MzAwMlx1NzBCOVx1NTFGQlx1NjA2Mlx1NTkwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQlx1NUZFQlx1NjM3N1x1OTUyRSBDdHJsK0knfVxuICAgID5cbiAgICAgIDxMb2NrSWNvbiBvcGVuPXtpbnRlcmFjdGl2ZX0gLz5cbiAgICAgIDxzcGFuPntpbnRlcmFjdGl2ZSA/ICdcdTUzRUZcdTRFQTRcdTRFOTInIDogJ1x1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mid9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkge1xuICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGVsKSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBlbCAmJiAoZWwucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZWwud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pXG4gIGlmICghcmVxdWVzdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVxdWVzdC5jYWxsKGVsKSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmZ1bmN0aW9uIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKSB7XG4gIGlmICghZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIGNvbnN0IGV4aXQgPSBkb2N1bWVudC5leGl0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlblxuICBpZiAoIWV4aXQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGV4aXQuY2FsbChkb2N1bWVudCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm9hcmQoeyBwcm9qZWN0IH0pIHtcbiAgY29uc3Qge1xuICAgIG1vZGUsXG4gICAgc2V0TW9kZSxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydCxcbiAgICBlbnRyeUlkLFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIGN1cnJlbnRTY3JlZW5JZCxcbiAgICBjYW5Hb0JhY2ssXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBjb25zdCB2aWV3cG9ydE9wdGlvbnMgPSBPYmplY3Qua2V5cyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuXG4gIGNvbnN0IFtzZWxlY3RlZElkcywgc2V0U2VsZWN0ZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpLFxuICApXG4gIGNvbnN0IFtjYW52YXNTY2FsZSwgc2V0Q2FudmFzU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9TY2FsZSwgc2V0RGVtb1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vVmlld1Jlc2V0S2V5LCBzZXREZW1vVmlld1Jlc2V0S2V5XSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpbnRlcmFjdGl2ZSwgc2V0SW50ZXJhY3RpdmVdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3NwYWNlSGVsZCwgc2V0U3BhY2VIZWxkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaG90c3BvdHNWaXNpYmxlLCBzZXRIb3RzcG90c1Zpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBvcnRFcnJvciwgc2V0RXhwb3J0RXJyb3JdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2V4cG9ydGluZywgc2V0RXhwb3J0aW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRJZHMsIHNldEV4cGFuZGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgW2ltbWVyc2l2ZSwgc2V0SW1tZXJzaXZlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkLCBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWRdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdQYW5lbFZpc2libGUsIHNldFJldmlld1BhbmVsVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1NlbGVjdGlvbnMsIHNldFJldmlld1NlbGVjdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtyZXZpZXdNdWx0aVNlbGVjdCwgc2V0UmV2aWV3TXVsdGlTZWxlY3RdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdJdGVtcywgc2V0UmV2aWV3SXRlbXNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtoZWxwVmlzaWJsZSwgc2V0SGVscFZpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjYW52YXNJbmRleFZpc2libGUsIHNldENhbnZhc0luZGV4VmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKS5zaG93Q2FudmFzSW5kZXgsXG4gIClcbiAgY29uc3QgW2NhbnZhc0luZGV4UG9zaXRpb24sIHNldENhbnZhc0luZGV4UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgYm9hcmRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZiA9IFJlYWN0LnVzZVJlZihuZXcgU2V0KCkpXG4gIGNvbnN0IGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSAhaW50ZXJhY3RpdmUgfHwgc3BhY2VIZWxkXG4gIGNvbnN0IGFsbFNjcmVlbklkcyA9IHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKVxuICBjb25zdCBpc0RlbW8gPSBtb2RlID09PSAnZGVtbycgJiYgZGVtb0F2YWlsYWJsZVxuICBjb25zdCBhY3RpdmVTY2FsZSA9IGlzRGVtbyA/IGRlbW9TY2FsZSA6IGNhbnZhc1NjYWxlXG4gIGNvbnN0IHNldEFjdGl2ZVNjYWxlID0gaXNEZW1vID8gc2V0RGVtb1NjYWxlIDogc2V0Q2FudmFzU2NhbGVcblxuICBjb25zdCBjbGVhclJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgfVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucyhbXSlcbiAgfSwgW10pXG5cbiAgY29uc3Qgc2VsZWN0UmV2aWV3RWxlbWVudCA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50LCBzY3JlZW4sIGNvbnRlbnRSb290LCBvcHRpb25zID0ge30pID0+IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdXG4gICAgY29uc3QgYWN0aXZlU2NyZWVuID0gc2NyZWVuIHx8IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBwcmltYXJ5Py5zY3JlZW5JZClcbiAgICBjb25zdCBhY3RpdmVSb290ID0gY29udGVudFJvb3QgfHwgcHJpbWFyeT8uY29udGVudFJvb3RcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWFjdGl2ZVNjcmVlbiB8fCAhYWN0aXZlUm9vdCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dFNlbGVjdGlvbiA9IGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBhY3RpdmVSb290LCBhY3RpdmVTY3JlZW4pXG4gICAgY29uc3QgYWRkaXRpdmUgPSByZXZpZXdNdWx0aVNlbGVjdCB8fCBvcHRpb25zLmFkZGl0aXZlXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG5cbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5yZXBsYWNlRWxlbWVudCkge1xuICAgICAgICBvcHRpb25zLnJlcGxhY2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUob3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgaWYgKGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50ICYmIGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQubWFwKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQgPyBuZXh0U2VsZWN0aW9uIDogaXRlbSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50KVxuICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGVkRWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICByZXR1cm4gYWRkaXRpdmUgPyBbLi4uY3VycmVudCwgbmV4dFNlbGVjdGlvbl0gOiBbbmV4dFNlbGVjdGlvbl1cbiAgICB9KVxuICB9LCBbcHJvamVjdC5zY3JlZW5zLCByZXZpZXdNdWx0aVNlbGVjdCwgcmV2aWV3U2VsZWN0aW9uc10pXG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KSlcbiAgfSwgW10pXG5cbiAgY29uc3QgY2xvc2VSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0UmV2aWV3RW5hYmxlZChmYWxzZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uXSlcblxuICBjb25zdCBob3ZlclJldmlld0JyZWFkY3J1bWIgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IGVsZW1lbnQgfHwgbnVsbFxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHtcbiAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBzZXRJbnRlcmFjdGl2ZSh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gIH0sIFtjbG9zZVJldmlldywgcmV2aWV3RW5hYmxlZF0pXG5cbiAgY29uc3Qgb3BlblJldmlld1BhbmVsID0gKCkgPT4ge1xuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgY29uc3QgY2xvc2VSZXZpZXdQYW5lbCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gIH0sIFtob3ZlclJldmlld0JyZWFkY3J1bWJdKVxuXG4gIGNvbnN0IGFkZFJldmlld0l0ZW0gPSAoaXRlbSkgPT4ge1xuICAgIHNldFJldmlld0l0ZW1zKChjdXJyZW50KSA9PiBbXG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgeyAuLi5pdGVtLCBpZDogYHJldmlldy0ke0RhdGUubm93KCl9LSR7Y3VycmVudC5sZW5ndGggKyAxfWAgfSxcbiAgICBdKVxuICB9XG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3SXRlbSA9IChpZCkgPT4ge1xuICAgIHNldFJldmlld0l0ZW1zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5pZCAhPT0gaWQpKVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgfVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICAgIGhvdmVyUmV2aWV3QnJlYWRjcnVtYihudWxsKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uLCBob3ZlclJldmlld0JyZWFkY3J1bWIsIG1vZGUsIHZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChyZXZpZXdJdGVtcy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWRcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KVxuICB9LCBbcmV2aWV3SXRlbXMubGVuZ3RoXSlcblxuICBjb25zdCBleGl0SW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldEltbWVyc2l2ZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgfSwgW10pXG5cbiAgY29uc3QgZW50ZXJJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY2xvc2VSZXZpZXcoKVxuICAgIHNldEhlbHBWaXNpYmxlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIHNldEltbWVyc2l2ZSh0cnVlKVxuICB9LCBbY2xvc2VSZXZpZXddKVxuXG4gIGNvbnN0IHRvZ2dsZUltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoaW1tZXJzaXZlKSBleGl0SW1tZXJzaXZlKClcbiAgICBlbHNlIGVudGVySW1tZXJzaXZlKClcbiAgfSwgW2VudGVySW1tZXJzaXZlLCBleGl0SW1tZXJzaXZlLCBpbW1lcnNpdmVdKVxuXG4gIGNvbnN0IHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gICAgcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihib2FyZFJlZi5jdXJyZW50KVxuICB9LCBbY2xvc2VSZXZpZXddKVxuXG4gIGNvbnN0IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aXNpYmxlKSA9PiB7XG4gICAgc2V0Q2FudmFzSW5kZXhWaXNpYmxlKHZpc2libGUpXG4gICAgc2F2ZUJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSwgeyBzaG93Q2FudmFzSW5kZXg6IHZpc2libGUgfSlcbiAgfSwgW3Byb2plY3QubmFtZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpXG4gICAgc2V0Q2FudmFzSW5kZXhWaXNpYmxlKHNldHRpbmdzLnNob3dDYW52YXNJbmRleClcbiAgICBzZXRDYW52YXNJbmRleFBvc2l0aW9uKG51bGwpXG4gIH0sIFtwcm9qZWN0Lm5hbWVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMobmV3IFNldCgpKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIGNvbnN0IHRvZ2dsZUV4cGFuZCA9IChpZCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgZXhwYW5kVGFyZ2V0cyA9IChzaG91bGRFeHBhbmQpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbFNjcmVlbklkcylcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgdGFyZ2V0cykge1xuICAgICAgICBpZiAoc2hvdWxkRXhwYW5kKSBuZXh0LmFkZChpZClcbiAgICAgICAgZWxzZSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZG93biA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScgJiYgIWV2ZW50LnJlcGVhdCAmJiAhaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBzZXRTcGFjZUhlbGQodHJ1ZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNob3J0Y3V0ID0gc2hvcnRjdXRJZEZvckV2ZW50KGV2ZW50KVxuICAgICAgaWYgKCFzaG9ydGN1dCkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgIT09ICdlc2NhcGUnICYmIGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUpIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnICYmICFpc0RlbW8pIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZXNjYXBlJyAmJiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnY2FudmFzJykgc2V0TW9kZSgnY2FudmFzJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2RlbW8nKSBzZXRNb2RlKCdkZW1vJylcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2ludGVyYWN0aW9uJykgc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdyZXZpZXcnKSB0b2dnbGVSZXZpZXcoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW1tZXJzaXZlJykgdG9nZ2xlSW1tZXJzaXZlKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2Jyb3dzZXItZnVsbHNjcmVlbicpIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuKClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hvdHNwb3RzJykgc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaGVscCcpIHtcbiAgICAgICAgc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICB9XG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnKSB7XG4gICAgICAgIGlmIChoZWxwVmlzaWJsZSkgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgICAgIGVsc2UgaWYgKHJldmlld0VuYWJsZWQpIGNsb3NlUmV2aWV3KClcbiAgICAgICAgZWxzZSBpZiAoaW1tZXJzaXZlKSBleGl0SW1tZXJzaXZlKClcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXAgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnKSBzZXRTcGFjZUhlbGQoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgfVxuICB9LCBbXG4gICAgY2xvc2VSZXZpZXcsXG4gICAgZGVtb0F2YWlsYWJsZSxcbiAgICBleGl0SW1tZXJzaXZlLFxuICAgIGhlbHBWaXNpYmxlLFxuICAgIGltbWVyc2l2ZSxcbiAgICBpc0RlbW8sXG4gICAgcmV2aWV3RW5hYmxlZCxcbiAgICBzZXRNb2RlLFxuICAgIHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuLFxuICAgIHRvZ2dsZUltbWVyc2l2ZSxcbiAgICB0b2dnbGVSZXZpZXcsXG4gIF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2RlbW8nKSBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH0sIFttb2RlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN5bmMgPSAoKSA9PiBzZXRCcm93c2VyRnVsbHNjcmVlbighIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgfVxuICB9LCBbXSlcblxuICBjb25zdCBleHBvcnRJZHMgPSAoaWRzKSA9PiBydW5FeHBvcnRXaXRoRmVlZGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHNldEV4cG9ydGluZyh0cnVlKVxuICAgIHRyeSB7XG4gICAgICBjb25zdCBzY3JlZW5zID0gaWRzLm1hcCgoaWQpID0+IHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGlkKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkLFxuICAgICAgICAgIHRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgW2RhdGEtc2NyZWVuLWlkPVwiJHtpZH1cIl0gLndmLXNjcmVlbi1jb250ZW50YCksXG4gICAgICAgICAgdmlld3BvcnQsXG4gICAgICAgICAgZXhwYW5kZWQ6IGV4cGFuZGVkSWRzLmhhcyhpZCksXG4gICAgICAgICAgcHJvamVjdE5hbWU6IHByb2plY3QubmFtZSxcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGF3YWl0IGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEV4cG9ydGluZyhmYWxzZSlcbiAgICB9XG4gIH0sIHNldEV4cG9ydEVycm9yKVxuXG4gIGNvbnN0IHJlc2V0RGVtbyA9ICgpID0+IHtcbiAgICByZXNldCgpXG4gICAgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgcmVzZXREZW1vVmlldyA9ICgpID0+IHtcbiAgICBzZXREZW1vVmlld1Jlc2V0S2V5KCh2YWx1ZSkgPT4gdmFsdWUgKyAxKVxuICB9XG5cbiAgY29uc3QgcmVzZXRBY3RpdmVWaWV3ID0gaXNEZW1vID8gcmVzZXREZW1vVmlldyA6ICgpID0+IHNldENhbnZhc1NjYWxlKDEpXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICByZWY9e2JvYXJkUmVmfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtYm9hcmQke2ltbWVyc2l2ZSA/ICcgaXMtaW1tZXJzaXZlJyA6ICcnfSR7cmV2aWV3RW5hYmxlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b29sYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1sZWZ0XCI+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbmFtZVwiPntwcm9qZWN0Lm5hbWV9PC9oMT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW1ldGFcIj57cHJvamVjdC5zY3JlZW5zLmxlbmd0aH0gXHU5ODc1PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItY2VudGVyXCI+XG4gICAgICAgICAge2RlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLW1vZGUtc3dpdGNoZXJcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU2QTIxXHU1RjBGXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdjYW52YXMnID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdjYW52YXMnKX1cbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NzUzQlx1Njc3Rlx1NkEyMVx1NUYwRlx1RkYwOEN0cmwrMVx1RkYwOVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjA4Q3RybCsyXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NkYxNFx1NzkzQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi12aWV3cG9ydC1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTg5QzZcdTUzRTNcIj5cbiAgICAgICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5tYXAoKGtleSkgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3ZpZXdwb3J0S2V5ID09PSBrZXkgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld3BvcnRLZXkoa2V5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7VklFV1BPUlRfTEFCRUxTW2tleV0gfHwga2V5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnIHx8ICFkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17KCkgPT4gc2V0Q2FudmFzU2NhbGUoMSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0RGVtb1ZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOEN0cmwrSFx1RkYwOVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7aG90c3BvdHNWaXNpYmxlID8gJ1x1NzBFRFx1NTMzQSBPTicgOiAnXHU3MEVEXHU1MzNBIE9GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWRlbW8tZW50cnlcIj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cIndmLWRlbW8tZW50cnlcIj5cdTUxNjVcdTUzRTM8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgIGlkPVwid2YtZGVtby1lbnRyeVwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17ZW50cnlJZH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNlbGVjdEVudHJ5KGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwOVx1NjJFOVx1NkYxNFx1NzkzQVx1NTE2NVx1NTNFM1x1OTg3NVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e3NjcmVlbi5pZH0gdmFsdWU9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAge2luZGV4ICsgMX0uIHtzY3JlZW4udGl0bGV9XG4gICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtyZXNldERlbW99Plx1OTFDRFx1N0Y2RTwvYnV0dG9uPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1kZW1vLXBhZ2UtbGFiZWxcIj5cbiAgICAgICAgICAgICAgICBcdTVGNTNcdTUyNERcdUZGMUFcbiAgICAgICAgICAgICAgICB7Y3VycmVudFNjcmVlblxuICAgICAgICAgICAgICAgICAgPyBgJHtwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbi5pZCkgKyAxfS4gJHtjdXJyZW50U2NyZWVuLnRpdGxlfSBcdTAwQjcgJHtjdXJyZW50U2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICAgICAgICA6IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLXJpZ2h0XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2hlbHBWaXNpYmxlID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyNTNcdTVGMDBcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICBhcmlhLWNvbnRyb2xzPVwid2YtYm9hcmQtdXRpbGl0eVwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVx1RkYwOD9cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiaGVscFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkU8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e3Jldmlld0VuYWJsZWQgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17cmV2aWV3RW5hYmxlZCA/ICdcdTRGRUVcdTY1MzlcdTRFMkQnIDogJ1x1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NEZFRVx1NjUzOVx1RkYxQVx1NzBCOVx1OTAwOVx1OTg3NVx1OTc2Mlx1ODI4Mlx1NzBCOVx1NUU3Nlx1NjU3NFx1NzQwNlx1NjIxMFx1NTNFRlx1N0YxNlx1OEY5MVx1NzY4NCBBSSBcdTRGRUVcdTY1MzkgUHJvbXB0XHVGRjA4Q3RybCtNXHVGRjA5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVJldmlld31cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImVkaXRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtpbW1lcnNpdmUgPyAnXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyA6ICdcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnfVxuICAgICAgICAgICAgdGl0bGU9XCJcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcdUZGMDhDdHJsK0ZcdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlSW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgd2YtaW1tZXJzaXZlLWNocm9tZSR7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJycgOiAnIGlzLWNvbGxhcHNlZCd9YH1cbiAgICAgICAgICByb2xlPVwidG9vbGJhclwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NkM4OVx1NkQ3OFx1NjNBN1x1NEVGNlwiXG4gICAgICAgID5cbiAgICAgICAgICB7aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY29udHJvbHNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V4aXRJbW1lcnNpdmV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1OTAwMFx1NTFGQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rlx1RkYwOEN0cmwrU2hpZnQrRlx1RkYwOScgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4Q3RybCtTaGlmdCtGXHVGRjA5J31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVCcm93c2VyRnVsbHNjcmVlbn1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHticm93c2VyRnVsbHNjcmVlbiA/ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYgT04nIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2FjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRBY3RpdmVTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXtyZXNldEFjdGl2ZVZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b24nfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyNTNcdTVGMDBcdTVFMkVcdTUyQTlcdTMwMDFcdTVGRUJcdTYzNzdcdTk1MkVcdTRFMEVcdThCQkVcdTdGNkVcIlxuICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2hlbHBWaXNpYmxlfVxuICAgICAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVx1RkYwOD9cdUZGMDlcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiaGVscFwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge2lzRGVtbyA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0FcdUZGMDhDdHJsK0hcdUZGMDlcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7aG90c3BvdHNWaXNpYmxlID8gJ1x1NzBFRFx1NTMzQSBPTicgOiAnXHU3MEVEXHU1MzNBIE9GRid9XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLXRvb2xiYXItdG9nZ2xlXCJcbiAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICdcdTY1MzZcdThENzdcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnIDogJ1x1NUM1NVx1NUYwMFx1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRid9XG4gICAgICAgICAgICB0aXRsZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICd0b29sYmFyQ29sbGFwc2UnIDogJ3Rvb2xiYXJFeHBhbmQnfSAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgPyAoXG4gICAgICAgIDxDYW52YXNNb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNlbGVjdGVkSWRzPXtzZWxlY3RlZElkc31cbiAgICAgICAgICBzZXRTZWxlY3RlZElkcz17c2V0U2VsZWN0ZWRJZHN9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgb25FeHBvcnRJZHM9e2V4cG9ydElkc31cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAgIG9uQ2FudmFzQ2xpY2s9e3Jldmlld1BhbmVsVmlzaWJsZSA/IGNsb3NlUmV2aWV3UGFuZWwgOiB1bmRlZmluZWR9XG4gICAgICAgICAgY2FudmFzSW5kZXhWaXNpYmxlPXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgY2FudmFzSW5kZXhQb3NpdGlvbj17Y2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2U9e3NldENhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgb25DbG9zZUNhbnZhc0luZGV4PXsoKSA9PiB1cGRhdGVDYW52YXNJbmRleFZpc2libGUoZmFsc2UpfVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPERlbW9Nb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBob3RzcG90c1Zpc2libGU9e2hvdHNwb3RzVmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7cmV2aWV3RW5hYmxlZCA/IChcbiAgICAgICAgPFJldmlld01hcmtlcnMgYm9hcmRSZWY9e2JvYXJkUmVmfSBpdGVtcz17cmV2aWV3SXRlbXN9IG9uT3BlblBhbmVsPXtvcGVuUmV2aWV3UGFuZWx9IC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxSZXZpZXdMYXVuY2hlclxuICAgICAgICBib2FyZFJlZj17Ym9hcmRSZWZ9XG4gICAgICAgIGNvdW50PXtyZXZpZXdJdGVtcy5sZW5ndGh9XG4gICAgICAgIHByb2plY3ROYW1lPXtwcm9qZWN0Lm5hbWV9XG4gICAgICAgIG9uT3Blbj17b3BlblJldmlld1BhbmVsfVxuICAgICAgLz5cbiAgICAgIHtoZWxwVmlzaWJsZSA/IChcbiAgICAgICAgPFNob3J0Y3V0SGVscFxuICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgc2hvd0NhbnZhc0luZGV4PXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2U9e3VwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRIZWxwVmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIHtyZXZpZXdFbmFibGVkICYmIHJldmlld1BhbmVsVmlzaWJsZSA/IChcbiAgICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICAgIG11bHRpU2VsZWN0PXtyZXZpZXdNdWx0aVNlbGVjdH1cbiAgICAgICAgICBpdGVtcz17cmV2aWV3SXRlbXN9XG4gICAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgIG9uU2VsZWN0RWxlbWVudD17KGVsZW1lbnQpID0+IHNlbGVjdFJldmlld0VsZW1lbnQoZWxlbWVudCwgbnVsbCwgbnVsbCwge1xuICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXT8uZWxlbWVudCxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBvbkhvdmVyRWxlbWVudD17aG92ZXJSZXZpZXdCcmVhZGNydW1ifVxuICAgICAgICAgIG9uUmVtb3ZlU2VsZWN0aW9uPXtyZW1vdmVSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgICAgb25BZGRJdGVtPXthZGRSZXZpZXdJdGVtfVxuICAgICAgICAgIG9uUmVtb3ZlSXRlbT17cmVtb3ZlUmV2aWV3SXRlbX1cbiAgICAgICAgICBvbkNsb3NlPXtjbG9zZVJldmlld31cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiZnVuY3Rpb24gZmFpbChwYXRoLCBtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihgJHtwYXRofSAke21lc3NhZ2V9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUHJvamVjdChwcm9qZWN0KSB7XG4gIGlmICghcHJvamVjdCB8fCB0eXBlb2YgcHJvamVjdCAhPT0gJ29iamVjdCcpIGZhaWwoJ3Byb2plY3QnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICBpZiAoIXByb2plY3Qudmlld3BvcnRzIHx8IHR5cGVvZiBwcm9qZWN0LnZpZXdwb3J0cyAhPT0gJ29iamVjdCcpIHtcbiAgICBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBjb25zdCB2aWV3cG9ydEVudHJpZXMgPSBPYmplY3QuZW50cmllcyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgaWYgKHZpZXdwb3J0RW50cmllcy5sZW5ndGggPT09IDApIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgdmlld3BvcnQnKVxuICBmb3IgKGNvbnN0IFtrZXksIHZpZXdwb3J0XSBvZiB2aWV3cG9ydEVudHJpZXMpIHtcbiAgICBpZiAoIXZpZXdwb3J0IHx8IHR5cGVvZiB2aWV3cG9ydCAhPT0gJ29iamVjdCcpIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fWAsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgZm9yIChjb25zdCBkaW1lbnNpb24gb2YgWyd3aWR0aCcsICdoZWlnaHQnXSkge1xuICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmlld3BvcnRbZGltZW5zaW9uXSkgfHwgdmlld3BvcnRbZGltZW5zaW9uXSA8PSAwKSB7XG4gICAgICAgIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fS4ke2RpbWVuc2lvbn1gLCAnbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCkpIHtcbiAgICBmYWlsKCdwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCcsIGByZWZlcmVuY2VzIG1pc3Npbmcgdmlld3BvcnQgXCIke3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0fVwiYClcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkocHJvamVjdC5zY3JlZW5zKSB8fCBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgZmFpbCgncHJvamVjdC5zY3JlZW5zJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc2NyZWVuJylcbiAgfVxuXG4gIGNvbnN0IGlkcyA9IG5ldyBTZXQoKVxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBgcHJvamVjdC5zY3JlZW5zWyR7aW5kZXh9XWBcbiAgICBpZiAoIXNjcmVlbiB8fCB0eXBlb2Ygc2NyZWVuICE9PSAnb2JqZWN0JykgZmFpbChwYXRoLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmlkICE9PSAnc3RyaW5nJyB8fCAhL15bYS16MC05LV0rJC8udGVzdChzY3JlZW4uaWQpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmlkYCwgJ211c3QgbWF0Y2ggL15bYS16MC05LV0rJC8nKVxuICAgIH1cbiAgICBpZiAoaWRzLmhhcyhzY3JlZW4uaWQpKSBmYWlsKGAke3BhdGh9LmlkYCwgYGlzIGR1cGxpY2F0ZSBcIiR7c2NyZWVuLmlkfVwiYClcbiAgICBpZHMuYWRkKHNjcmVlbi5pZClcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5jb21wb25lbnQgIT09ICdmdW5jdGlvbicpIGZhaWwoYCR7cGF0aH0uY29tcG9uZW50YCwgJ211c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbi5saW5rcykpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0ubGlua3NgLCAnbXVzdCBiZSBhbiBhcnJheScpXG4gICAgfVxuICB9KVxuXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIHNjcmVlbkluZGV4KSA9PiB7XG4gICAgc2NyZWVuLmxpbmtzLmZvckVhY2goKHRhcmdldCwgbGlua0luZGV4KSA9PiB7XG4gICAgICBpZiAoIWlkcy5oYXModGFyZ2V0KSkge1xuICAgICAgICBmYWlsKFxuICAgICAgICAgIGBwcm9qZWN0LnNjcmVlbnNbJHtzY3JlZW5JbmRleH1dLmxpbmtzWyR7bGlua0luZGV4fV1gLFxuICAgICAgICAgIGByZWZlcmVuY2VzIG1pc3Npbmcgc2NyZWVuIFwiJHt0YXJnZXR9XCJgLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuXG5leHBvcnQgeyBmaW5kRmxvd1RhcmdldElkLCBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuL2Zsb3ctdGFyZ2V0LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSkge1xuICByZXR1cm4ge1xuICAgICdkYXRhLWZsb3ctdG8nOiB0byB8fCB1bmRlZmluZWQsXG4gICAgb25DbGljazogKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodG8pIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICAgIGlmIChvbkNsaWNrKSBvbkNsaWNrKGV2ZW50KVxuICAgICAgaWYgKCFldmVudC5kZWZhdWx0UHJldmVudGVkICYmIHRvKSBuYXZpZ2F0ZSh0bylcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5mdW5jdGlvbiBqb2luQ2xhc3MoYmFzZSwgZXh0cmEpIHtcbiAgcmV0dXJuIGV4dHJhID8gYCR7YmFzZX0gJHtleHRyYX1gIDogYmFzZVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSkge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgY29sdW1ucyAmJiB0eXBlb2YgY29sdW1ucyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY29sdW1ucylcbiAgICAgID8gY29sdW1uc1t2aWV3cG9ydEtleV1cbiAgICAgIDogY29sdW1uc1xuICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPiAwKSByZXR1cm4gYHJlcGVhdCgke3ZhbHVlfSwgbWlubWF4KDAsIDFmcikpYFxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkpIHJldHVybiB2YWx1ZVxuICB0aHJvdyBuZXcgRXJyb3IoJ0dyaWQgY29sdW1ucyBtdXN0IHJlc29sdmUgdG8gYSBwb3NpdGl2ZSBpbnRlZ2VyIG9yIG5vbi1lbXB0eSBDU1Mgc3RyaW5nJylcbn1cblxuZnVuY3Rpb24gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdCkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIHtcbiAgICBjbGFzc05hbWVTdWZmaXg6IHRvID8gJyB3Zi1pbnRlcmFjdGl2ZScgOiAnJyxcbiAgICByb2xlOiB0byA/ICdsaW5rJyA6IHJlc3Qucm9sZSxcbiAgICB0YWJJbmRleDogdG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXgsXG4gICAgZmxvdyxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm94KHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ib3gke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXt7IC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUm93KHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1yb3cke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2x1bW4oe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWNvbHVtbiR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdyaWQoeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgY29sdW1ucyA9IDEsIGdhcCA9IDAsIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyB2aWV3cG9ydEtleSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpLFxuICAgIGdhcCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ncmlkJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBIZWFkaW5nKHsgbGV2ZWwgPSAyLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCB0YWcgPSBgaCR7TWF0aC5taW4oNiwgTWF0aC5tYXgoMSwgbGV2ZWwpKX1gXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRhZywgeyBjbGFzc05hbWU6IGB3Zi1oZWFkaW5nICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dCh7IGFzID0gJ3AnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChhcywgeyBjbGFzc05hbWU6IGB3Zi10ZXh0ICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FyZCh7IHRvLCBvbkNsaWNrLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jYXJkICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQmFkZ2UoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtgd2YtYmFkZ2UgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zcGFuPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXZhdGFyKHsgc2l6ZSA9IDQwLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIHN0eWxlLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1hdmF0YXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZVBsYWNlaG9sZGVyKHtcbiAgd2lkdGggPSAnMTAwJScsXG4gIGhlaWdodCA9IDE2MCxcbiAgYm9yZGVyUmFkaXVzID0gMCxcbiAgY2xhc3NOYW1lID0gJycsXG4gIHN0eWxlLFxuICAuLi5yZXN0XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtaW1hZ2UtcGxhY2Vob2xkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCwgYm9yZGVyUmFkaXVzLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcGxhY2Vob2xkZXItYmxvY2tcIiAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEJ1dHRvbih7IHRvLCBvbkNsaWNrLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHdmLWJ1dHRvbiB3Zi1idXR0b24tJHt2YXJpYW50fSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0SW5wdXQoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8aW5wdXQgY2xhc3NOYW1lPXtgd2YtaW5wdXQgJHtjbGFzc05hbWV9YC50cmltKCl9IHR5cGU9XCJ0ZXh0XCIgey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0QXJlYSh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDx0ZXh0YXJlYSBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi10ZXh0YXJlYSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3QoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNlbGVjdCBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi1zZWxlY3QgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zZWxlY3Q+XG59XG5cbmZ1bmN0aW9uIENob2ljZSh7IHR5cGUsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGxhYmVsIGNsYXNzTmFtZT17YHdmLWNob2ljZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0+XG4gICAgICA8aW5wdXQgY2xhc3NOYW1lPVwid2YtY2hvaWNlLWlucHV0XCIgdHlwZT17dHlwZX0gey4uLnJlc3R9IC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENoZWNrYm94KHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJjaGVja2JveFwiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhZGlvKHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJyYWRpb1wiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRvZ2dsZSh7IGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwic3dpdGNoXCJcbiAgICAgIGFyaWEtY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXRvZ2dsZSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gb25DaGFuZ2U/LighY2hlY2tlZCwgZXZlbnQpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRyYWNrXCI+PHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRodW1iXCIgLz48L3NwYW4+XG4gICAgICB7bGFiZWwgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtbGFiZWxcIj57bGFiZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZvcm1GaWVsZCh7IGxhYmVsLCBodG1sRm9yLCBoaW50LCBlcnJvciwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWZvcm0tZmllbGQgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1maWVsZC1sYWJlbFwiIGh0bWxGb3I9e2h0bWxGb3J9PntsYWJlbH08L2xhYmVsPlxuICAgICAge2NoaWxkcmVufVxuICAgICAge2hpbnQgJiYgIWVycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtaGludFwiPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge2Vycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXJyb3J9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgY3JlYXRlRmxvd1Byb3BzIH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gUGFnZUhlYWRlcih7IHRpdGxlLCB0aXRsZUlkLCBzdWJ0aXRsZSwgc3VidGl0bGVJZCwgYWN0aW9ucywgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxoZWFkZXIgY2xhc3NOYW1lPXtgd2YtcGFnZS1oZWFkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1oZWFkZXItY29weVwiPlxuICAgICAgICA8aDEgaWQ9e3RpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2UtdGl0bGVcIj57dGl0bGV9PC9oMT5cbiAgICAgICAge3N1YnRpdGxlID8gPHAgaWQ9e3N1YnRpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2Utc3VidGl0bGVcIj57c3VidGl0bGV9PC9wPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHthY3Rpb25zID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWFjdGlvbnNcIj57YWN0aW9uc308L2Rpdj4gOiBudWxsfVxuICAgIDwvaGVhZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIE5hdmlnYXRpb25MaXN0KHsgYXMsIGl0ZW1zLCBhY3RpdmVJZCwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgYXMsXG4gICAgeyBjbGFzc05hbWUsIC4uLnJlc3QgfSxcbiAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi1uYXYtaXRlbSBpcy1hY3RpdmUnIDogJ3dmLW5hdi1pdGVtJ31cbiAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICApKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2lkZU5hdih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPE5hdmlnYXRpb25MaXN0XG4gICAgICBhcz1cIm5hdlwiXG4gICAgICBpdGVtcz17aXRlbXN9XG4gICAgICBhY3RpdmVJZD17YWN0aXZlSWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1zaWRlLW5hdiAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYkJhcih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi10YWItYmFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi10YWItaXRlbSBpcy1hY3RpdmUnIDogJ3dmLXRhYi1pdGVtJ31cbiAgICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQnJlYWRjcnVtYnMoeyBpdGVtcyA9IFtdLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi1icmVhZGNydW1icyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gYXJpYS1sYWJlbD1cIkJyZWFkY3J1bWJzXCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YCR7aXRlbS5sYWJlbH0tJHtpbmRleH1gfT5cbiAgICAgICAgICB7aW5kZXggPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1kaXZpZGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtpdGVtLnRvID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWxpbmtcIiB0eXBlPVwiYnV0dG9uXCIgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX0+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItY3VycmVudFwiPntpdGVtLmxhYmVsfTwvc3Bhbj59XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG4vKiogXHU3OUZCXHU1MkE4XHU3QUVGXHU2NTc0XHU1QzRGXHU1OEYzXHVGRjFBXHU1MTg1XHU1QkI5XHU1MzNBXHU1M0VGXHU2RURBXHVGRjBDVGFiQmFyIFx1OEQzNFx1NUU5NVx1MzAwMnRhYnMgLyBhY3RpdmVJZCBcdTRFMEUgVGFiQmFyIFx1NzZGOFx1NTQwQ1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZVNoZWxsKHsgY2hpbGRyZW4sIHRhYnMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1vYmlsZS1zaGVsbCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwid2YtbW9iaWxlLXNoZWxsLWJvZHlcIj57Y2hpbGRyZW59PC9tYWluPlxuICAgICAge3RhYnMubGVuZ3RoID4gMCA/IDxUYWJCYXIgaXRlbXM9e3RhYnN9IGFjdGl2ZUlkPXthY3RpdmVJZH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIENlbGwoeyB0bywgb25DbGljaywgdGl0bGUsIHN1YnRpdGxlLCB2YWx1ZSwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2VsbCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNlbGwtbWFpblwiPlxuICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWNlbGwtdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtc3VidGl0bGVcIj57c3VidGl0bGV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICAge3ZhbHVlICE9PSB1bmRlZmluZWQgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXZhbHVlXCI+e3ZhbHVlfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEYXRhVGFibGUoeyBjb2x1bW5zID0gW10sIHJvd3MgPSBbXSwgZ2V0Um93S2V5LCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJsZS13cmFwICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8dGFibGUgY2xhc3NOYW1lPVwid2YtdGFibGVcIj5cbiAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRcIj5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGVyLXJvd1wiPlxuICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRpbmdcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT57Y29sdW1uLmxhYmVsfTwvdGg+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwid2YtdGFibGUtYm9keVwiPlxuICAgICAgICAgIHtyb3dzLm1hcCgocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93S2V5ID0gZ2V0Um93S2V5ID8gZ2V0Um93S2V5KHJvdykgOiByb3cuaWQgfHwgaW5kZXhcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1yb3dcIiBkYXRhLXdmLWtleT17cm93S2V5fSBrZXk9e3Jvd0tleX0+XG4gICAgICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1jZWxsXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+XG4gICAgICAgICAgICAgICAgICAgIHtjb2x1bW4ucmVuZGVyID8gY29sdW1uLnJlbmRlcihyb3dbY29sdW1uLmtleV0sIHJvdykgOiByb3dbY29sdW1uLmtleV19XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFicyh7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBvbkNoYW5nZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFicyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInRhYmxpc3RcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10YWItY29udHJvbFwiXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgYXJpYS1zZWxlY3RlZD17aXRlbS5pZCA9PT0gYWN0aXZlSWR9XG4gICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlPy4oaXRlbS5pZCl9XG4gICAgICAgID5cbiAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU3RlcHMoe1xuICBpdGVtcyA9IFtdLFxuICBjdXJyZW50ID0gMCxcbiAgZGlyZWN0aW9uID0gJ2hvcml6b250YWwnLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB2ZXJ0aWNhbCA9IGRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJ1xuICByZXR1cm4gKFxuICAgIDxvbFxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc3RlcHMgJHt2ZXJ0aWNhbCA/ICd3Zi1zdGVwcy12ZXJ0aWNhbCcgOiAnd2Ytc3RlcHMtaG9yaXpvbnRhbCd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gaW5kZXggPCBjdXJyZW50ID8gJ2RvbmUnIDogaW5kZXggPT09IGN1cnJlbnQgPyAnY3VycmVudCcgOiAndG9kbydcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtgd2Ytc3RlcHMtaXRlbSB3Zi1zdGVwcy1pdGVtLSR7c3RhdHVzfWB9IGtleT17aXRlbS5pZCB8fCBpdGVtLmxhYmVsIHx8IGluZGV4fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtaW5kaWNhdG9yXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXAtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgIHtzdGF0dXMgPT09ICdkb25lJyA/IG51bGwgOiBpbmRleCArIDF9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge2luZGV4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxpbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtY29udGVudFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAge2l0ZW0uZGVzY3JpcHRpb24gPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1kZXNjXCI+e2l0ZW0uZGVzY3JpcHRpb259PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApXG4gICAgICB9KX1cbiAgICA8L29sPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbXB0eVN0YXRlKHsgdGl0bGUsIGRlc2NyaXB0aW9uLCBhY3Rpb24sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWVtcHR5LXN0YXRlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIHt0aXRsZSA/IDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtZW1wdHktdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgIHtkZXNjcmlwdGlvbiA/IDxwIGNsYXNzTmFtZT1cIndmLWVtcHR5LWRlc2NcIj57ZGVzY3JpcHRpb259PC9wPiA6IG51bGx9XG4gICAgICB7YWN0aW9uID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1hY3Rpb25cIj57YWN0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQgeyBDb2x1bW4sIFJvdywgU2lkZU5hdiwgVGV4dCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IHVzZVNjcmVlbklkIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuXG5jb25zdCBOQVZfSVRFTVMgPSBbXG4gIHsgbGFiZWw6ICdcdTVERTVcdTRGNUNcdTUzM0EnLCB0bzogJ3dvcmtzcGFjZScgfSxcbiAgeyBsYWJlbDogJ0NvbGxlY3Rpb25zJywgdG86ICdjb2xsZWN0aW9uJyB9LFxuICB7IGxhYmVsOiAnXHU3M0FGXHU1ODgzJywgdG86ICdlbnZpcm9ubWVudHMnIH0sXG4gIHsgbGFiZWw6ICdcdTUzODZcdTUzRjInLCB0bzogJ2hpc3RvcnknIH0sXG4gIHsgbGFiZWw6ICdcdThCQkVcdTdGNkUnLCB0bzogJ3NldHRpbmdzJyB9LFxuXVxuXG5jb25zdCBBQ1RJVkVfQUxJQVMgPSB7XG4gICdyZXF1ZXN0LWVkaXRvcic6ICdjb2xsZWN0aW9uJyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEFwcFNoZWxsKHsgY2hpbGRyZW4sIGFzaWRlIH0pIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSB1c2VTY3JlZW5JZCgpXG4gIGNvbnN0IGFjdGl2ZUlkID0gQUNUSVZFX0FMSUFTW3NjcmVlbklkXSB8fCBzY3JlZW5JZFxuXG4gIHJldHVybiAoXG4gICAgPFJvdyBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsXCIgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJScsIGdhcDogMCB9fT5cbiAgICAgIDxDb2x1bW5cbiAgICAgICAgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fcmFpbFwiXG4gICAgICAgIGdhcD17MTZ9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDEycHgnLFxuICAgICAgICAgIGJvcmRlclJpZ2h0OiAnMXB4IHNvbGlkIHZhcigtLXdmLTMwMCknLFxuICAgICAgICAgIGJhY2tncm91bmQ6ICd2YXIoLS13Zi01MCknLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX2JyYW5kXCIgZ2FwPXs0fT5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX2JyYW5kLW5hbWVcIiBzdHlsZT17eyBmb250U2l6ZTogMTUgfX0+QVBJIENsaWVudDwvc3Ryb25nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX2JyYW5kLW1ldGFcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiAndmFyKC0td2YtNjAwKScgfX0+XG4gICAgICAgICAgICBXb3Jrc3BhY2UgXHUwMEI3IERlbW9cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8U2lkZU5hdiBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19uYXZcIiBhY3RpdmVJZD17YWN0aXZlSWR9IGl0ZW1zPXtOQVZfSVRFTVN9IC8+XG4gICAgICA8L0NvbHVtbj5cbiAgICAgIHthc2lkZSA/IChcbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX2FzaWRlXCJcbiAgICAgICAgICBnYXA9ezEyfVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogMjYwLFxuICAgICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxNnB4IDEycHgnLFxuICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgdmFyKC0td2YtMzAwKScsXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ3ZhcigtLXdmLTEwMCknLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7YXNpZGV9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8Q29sdW1uXG4gICAgICAgIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX21haW5cIlxuICAgICAgICBnYXA9ezB9XG4gICAgICAgIHN0eWxlPXt7IGZsZXg6IDEsIG1pbldpZHRoOiAwLCBvdmVyZmxvdzogJ2F1dG8nIH19XG4gICAgICA+XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvUm93PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IEZPTERFUlMgPSBbXG4gIHtcbiAgICBpZDogJ2ZvbGRlci11c2VycycsXG4gICAgbmFtZTogJ1VzZXJzJyxcbiAgICByZXF1ZXN0czogW1xuICAgICAgeyBpZDogJ3JlcS1saXN0LXVzZXJzJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0xpc3QgVXNlcnMnLCBwYXRoOiAnL3YxL3VzZXJzJyB9LFxuICAgICAgeyBpZDogJ3JlcS1nZXQtdXNlcicsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdHZXQgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkJyB9LFxuICAgICAgeyBpZDogJ3JlcS11cGRhdGUtdXNlcicsIG1ldGhvZDogJ1BBVENIJywgbmFtZTogJ1VwZGF0ZSBVc2VyJywgcGF0aDogJy92MS91c2Vycy86aWQnIH0sXG4gICAgICB7IGlkOiAncmVxLWRpc2FibGUtdXNlcicsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnRGlzYWJsZSBVc2VyJywgcGF0aDogJy92MS91c2Vycy86aWQvZGlzYWJsZScgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdmb2xkZXItcm9sZXMnLFxuICAgIG5hbWU6ICdSb2xlcycsXG4gICAgcmVxdWVzdHM6IFtcbiAgICAgIHsgaWQ6ICdyZXEtbGlzdC1yb2xlcycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdMaXN0IFJvbGVzJywgcGF0aDogJy92MS9yb2xlcycgfSxcbiAgICAgIHsgaWQ6ICdyZXEtYXNzaWduLXJvbGUnLCBtZXRob2Q6ICdQVVQnLCBuYW1lOiAnQXNzaWduIFJvbGUnLCBwYXRoOiAnL3YxL3VzZXJzLzppZC9yb2xlcycgfSxcbiAgICBdLFxuICB9LFxuICB7XG4gICAgaWQ6ICdmb2xkZXItYXVkaXQnLFxuICAgIG5hbWU6ICdBdWRpdCcsXG4gICAgcmVxdWVzdHM6IFtcbiAgICAgIHsgaWQ6ICdyZXEtYXVkaXQtbG9nJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0F1ZGl0IExvZycsIHBhdGg6ICcvdjEvYXVkaXQvbG9ncycgfSxcbiAgICAgIHsgaWQ6ICdyZXEtZXhwb3J0LWF1ZGl0JywgbWV0aG9kOiAnUE9TVCcsIG5hbWU6ICdFeHBvcnQgQXVkaXQnLCBwYXRoOiAnL3YxL2F1ZGl0L2V4cG9ydCcgfSxcbiAgICBdLFxuICB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sbGVjdGlvblNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGxcbiAgICAgIGFzaWRlPXtcbiAgICAgICAgPENvbHVtbiBpZD1cImNvbGxlY3Rpb24tdHJlZVwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3RyZWVcIiBnYXA9ezE0fT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3RyZWUtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3RyZWUtdGl0bGVcIiBsZXZlbD17M30+VXNlciBBUEk8L0hlYWRpbmc+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3RyZWUtbmV3XCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiPis8L0J1dHRvbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB7Rk9MREVSUy5tYXAoKGZvbGRlcikgPT4gKFxuICAgICAgICAgICAgPENvbHVtblxuICAgICAgICAgICAgICBrZXk9e2ZvbGRlci5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fZm9sZGVyXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2ZvbGRlci5pZH1cbiAgICAgICAgICAgICAgZ2FwPXs2fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19mb2xkZXItbmFtZVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgZm9udFdlaWdodDogNjAwIH19PlxuICAgICAgICAgICAgICAgIHtmb2xkZXIubmFtZX1cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICB7Zm9sZGVyLnJlcXVlc3RzLm1hcCgocmVxKSA9PiAoXG4gICAgICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAgICAgIGtleT17cmVxLmlkfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdFwiXG4gICAgICAgICAgICAgICAgICBkYXRhLXdmLWtleT17cmVxLmlkfVxuICAgICAgICAgICAgICAgICAgdG89XCJyZXF1ZXN0LWVkaXRvclwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDEwcHgnIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19yZXF1ZXN0LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1tZXRob2RcIj57cmVxLm1ldGhvZH08L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19yZXF1ZXN0LW5hbWVcIiBzdHlsZT17eyBmb250U2l6ZTogMTMgfX0+e3JlcS5uYW1lfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICB9XG4gICAgPlxuICAgICAgPENvbHVtbiBpZD1cImNvbGxlY3Rpb24tcGFnZVwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImNvbGxlY3Rpb24taGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiY29sbGVjdGlvbi10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlVzZXIgQVBJXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIkNvbGxlY3Rpb24gXHUwMEI3IDMgXHU0RTJBXHU2NTg3XHU0RUY2XHU1OTM5IFx1MDBCNyA4IFx1NEUyQVx1OEJGN1x1NkM0MlwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19hY3Rpb24tcnVuXCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiPlJ1biBjb2xsZWN0aW9uPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fYWN0aW9uLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIiB2YXJpYW50PVwicHJpbWFyeVwiPlx1NjVCMFx1NUVGQVx1OEJGN1x1NkM0MjwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwiY29sbGVjdGlvbi1tZXRhXCIgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YVwiIHN0eWxlPXt7IHBhZGRpbmc6IDE0IH19PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1yb3dcIiBnYXA9ezI0fT5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1pdGVtXCIgZ2FwPXs0fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1sYWJlbFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5CYXNlIFVSTDwvVGV4dD5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXZhbHVlXCI+eyd7e2Jhc2VVcmx9fSd9PC9zdHJvbmc+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1pdGVtXCIgZ2FwPXs0fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1sYWJlbFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5cdTYzODhcdTY3NDM8L1RleHQ+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS12YWx1ZVwiPkJlYXJlciBUb2tlbjwvc3Ryb25nPlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+XHU2NkY0XHU2NUIwPC9UZXh0PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtdmFsdWVcIj5cdTRFQ0FcdTU5MjkgMTA6MjQ8L3N0cm9uZz5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImNvbGxlY3Rpb24tbGlzdFwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3RcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTE2OFx1OTBFOFx1OEJGN1x1NkM0MjwvSGVhZGluZz5cbiAgICAgICAgICB7Rk9MREVSUy5mbGF0TWFwKChmb2xkZXIpID0+XG4gICAgICAgICAgICBmb2xkZXIucmVxdWVzdHMubWFwKChyZXEpID0+IChcbiAgICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAgICBrZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LWl0ZW1cIlxuICAgICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtgbGlzdC0ke3JlcS5pZH1gfVxuICAgICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3Qtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtbWV0aG9kXCI+e3JlcS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1jb3B5XCIgZ2FwPXsyfSBzdHlsZT17eyBmbGV4OiAxIH19PlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtbmFtZVwiPntyZXEubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1wYXRoXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PlxuICAgICAgICAgICAgICAgICAgICAgIHtmb2xkZXIubmFtZX0gXHUwMEI3IHtyZXEucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3Qtb3BlblwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5cdTYyNTNcdTVGMDA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgKSksXG4gICAgICAgICAgKX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBEYXRhVGFibGUsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgU2VsZWN0LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBFTlZfTElTVCA9IFtcbiAgeyBpZDogJ2Vudi1zdGFnaW5nJywgbmFtZTogJ1N0YWdpbmcnLCBhY3RpdmU6IHRydWUsIHZhcnM6IDYgfSxcbiAgeyBpZDogJ2Vudi1wcm9kJywgbmFtZTogJ1Byb2R1Y3Rpb24nLCBhY3RpdmU6IGZhbHNlLCB2YXJzOiA2IH0sXG4gIHsgaWQ6ICdlbnYtbG9jYWwnLCBuYW1lOiAnTG9jYWwnLCBhY3RpdmU6IGZhbHNlLCB2YXJzOiA0IH0sXG5dXG5cbmNvbnN0IFZBUl9ST1dTID0gW1xuICB7IGlkOiAndi1iYXNlJywga2V5OiAnYmFzZVVybCcsIGluaXRpYWw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tJywgY3VycmVudDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20nIH0sXG4gIHsgaWQ6ICd2LXRva2VuJywga2V5OiAndG9rZW4nLCBpbml0aWFsOiAnc3RfZGVtb18qKioqJywgY3VycmVudDogJ3N0X2RlbW9fKioqKicgfSxcbiAgeyBpZDogJ3YtdGVuYW50Jywga2V5OiAndGVuYW50SWQnLCBpbml0aWFsOiAndG5fMTAwODYnLCBjdXJyZW50OiAndG5fMTAwODYnIH0sXG4gIHsgaWQ6ICd2LXRpbWVvdXQnLCBrZXk6ICd0aW1lb3V0TXMnLCBpbml0aWFsOiAnMTUwMDAnLCBjdXJyZW50OiAnMTUwMDAnIH0sXG4gIHsgaWQ6ICd2LWxvY2FsZScsIGtleTogJ2xvY2FsZScsIGluaXRpYWw6ICd6aC1DTicsIGN1cnJlbnQ6ICd6aC1DTicgfSxcbl1cblxuY29uc3QgVkFSX0NPTFVNTlMgPSBbXG4gIHsga2V5OiAna2V5JywgbGFiZWw6ICdWYXJpYWJsZScgfSxcbiAgeyBrZXk6ICdpbml0aWFsJywgbGFiZWw6ICdJbml0aWFsIFZhbHVlJyB9LFxuICB7IGtleTogJ2N1cnJlbnQnLCBsYWJlbDogJ0N1cnJlbnQgVmFsdWUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBFbnZpcm9ubWVudHNTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cImVudmlyb25tZW50cy1wYWdlXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJlbnZpcm9ubWVudHMtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiZW52aXJvbm1lbnRzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU1NzI4XHU4QkY3XHU2QzQyIFVSTCAvIEhlYWRlciAvIEJvZHkgXHU0RTJEXHU5MDFBXHU4RkM3IHt7dmFyfX0gXHU1RjE1XHU3NTI4XCJcbiAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19hY3Rpb24td29ya3NwYWNlXCIgdG89XCJ3b3Jrc3BhY2VcIj5cdThGRDRcdTU2REVcdTVERTVcdTRGNUNcdTUzM0E8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2FjdGlvbi1hZGRcIiB2YXJpYW50PVwicHJpbWFyeVwiPlx1NkRGQlx1NTJBMFx1NTNEOFx1OTFDRjwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxSb3cgaWQ9XCJlbnZpcm9ubWVudHMtcGlja2VyXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19waWNrZXJcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19waWNrZXItbGFiZWxcIj5cdTVGNTNcdTUyNERcdTczQUZcdTU4ODM8L1RleHQ+XG4gICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3NlbGVjdFwiIGRlZmF1bHRWYWx1ZT1cIlN0YWdpbmdcIiBzdHlsZT17eyB3aWR0aDogMjAwIH19PlxuICAgICAgICAgICAgPG9wdGlvbj5TdGFnaW5nPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uPlByb2R1Y3Rpb248L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24+TG9jYWw8L29wdGlvbj5cbiAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19hY3RpdmUtYmFkZ2VcIj5BY3RpdmU8L0JhZGdlPlxuICAgICAgICA8L1Jvdz5cblxuICAgICAgICA8Um93IGlkPVwiZW52aXJvbm1lbnRzLWNhcmRzXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkc1wiIGdhcD17MTJ9PlxuICAgICAgICAgIHtFTlZfTElTVC5tYXAoKGVudikgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtlbnYuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZFwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtlbnYuaWR9XG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6IDE0IH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1uYW1lXCI+e2Vudi5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIHtlbnYuYWN0aXZlID8gPEJhZGdlIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1iYWRnZVwiPlx1NEY3Rlx1NzUyOFx1NEUyRDwvQmFkZ2U+IDogbnVsbH1cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1tZXRhXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBtYXJnaW5Ub3A6IDYgfX0+XG4gICAgICAgICAgICAgICAge2Vudi52YXJzfSBcdTRFMkFcdTUzRDhcdTkxQ0ZcbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L1Jvdz5cblxuICAgICAgICA8Q29sdW1uIGlkPVwiZW52aXJvbm1lbnRzLXRhYmxlLXdyYXBcIiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3RhYmxlLXdyYXBcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3RhYmxlLXRpdGxlXCIgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19PlN0YWdpbmcgXHU1M0Q4XHU5MUNGPC9UZXh0PlxuICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgIGlkPVwiZW52aXJvbm1lbnRzLXRhYmxlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fdGFibGVcIlxuICAgICAgICAgICAgY29sdW1ucz17VkFSX0NPTFVNTlN9XG4gICAgICAgICAgICByb3dzPXtWQVJfUk9XU31cbiAgICAgICAgICAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgSElTVE9SWSA9IFtcbiAge1xuICAgIGlkOiAnaGlzdC0xJyxcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIG5hbWU6ICdMaXN0IFVzZXJzJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL3VzZXJzP3BhZ2U9MScsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnMTQyIG1zJyxcbiAgICBhdDogJ1x1NEVDQVx1NTkyOSAxNDoyMTowOCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtMicsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgbmFtZTogJ0NyZWF0ZSBPcmRlcicsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9vcmRlcnMnLFxuICAgIHN0YXR1czogJzIwMScsXG4gICAgdGltZTogJzMxMCBtcycsXG4gICAgYXQ6ICdcdTRFQ0FcdTU5MjkgMTM6NTU6NDEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTMnLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIG5hbWU6ICdMb2dpbicsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9hdXRoL2xvZ2luJyxcbiAgICBzdGF0dXM6ICcyMDAnLFxuICAgIHRpbWU6ICc5OCBtcycsXG4gICAgYXQ6ICdcdTRFQ0FcdTU5MjkgMTE6MDI6MTcnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTQnLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgbmFtZTogJ0dldCBJbnZvaWNlJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL2JpbGxpbmcvaW52b2ljZXMvaW52Xzg4JyxcbiAgICBzdGF0dXM6ICc0MDQnLFxuICAgIHRpbWU6ICc2NyBtcycsXG4gICAgYXQ6ICdcdTY2MjhcdTU5MjkgMTk6NDQ6MDMnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTUnLFxuICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICBuYW1lOiAnVXBkYXRlIFVzZXInLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvdXNlcnMvdV8xMDAxJyxcbiAgICBzdGF0dXM6ICcyMDAnLFxuICAgIHRpbWU6ICcxODggbXMnLFxuICAgIGF0OiAnXHU2NjI4XHU1OTI5IDE2OjEyOjUwJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC02JyxcbiAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgIG5hbWU6ICdSZXZva2UgVG9rZW4nLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvYXV0aC90b2tlbicsXG4gICAgc3RhdHVzOiAnMjA0JyxcbiAgICB0aW1lOiAnNTQgbXMnLFxuICAgIGF0OiAnMDgtMDggMjE6MDY6MjInLFxuICB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gSGlzdG9yeVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGw+XG4gICAgICA8Q29sdW1uIGlkPVwiaGlzdG9yeS1wYWdlXCIgY2xhc3NOYW1lPVwiaGlzdG9yeV9fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiaGlzdG9yeS1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJoaXN0b3J5LXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJoaXN0b3J5X19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU1Mzg2XHU1M0YyXHU4QkIwXHU1RjU1XCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NjcyQ1x1NjczQVx1NjcwMFx1OEZEMVx1NTNEMVx1OTAwMVx1NzY4NFx1OEJGN1x1NkM0Mlx1RkYwQ1x1NTNFRlx1OTFDRFx1NjVCMFx1NjI1M1x1NUYwMFx1NTIzMFx1N0YxNlx1OEY5MVx1NTY2OFwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImhpc3RvcnlfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJoaXN0b3J5X19hY3Rpb24tY2xlYXJcIj5cdTZFMDVcdTdBN0FcdTUzODZcdTUzRjI8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJoaXN0b3J5X19hY3Rpb24td29ya3NwYWNlXCIgdG89XCJ3b3Jrc3BhY2VcIj5cdThGRDRcdTU2REVcdTVERTVcdTRGNUNcdTUzM0E8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q29sdW1uIGlkPVwiaGlzdG9yeS1saXN0XCIgY2xhc3NOYW1lPVwiaGlzdG9yeV9fbGlzdFwiIGdhcD17MTB9PlxuICAgICAgICAgIHtISVNUT1JZLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLW1ldGhvZFwiPntpdGVtLm1ldGhvZH08L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1jb3B5XCIgZ2FwPXsyfSBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1uYW1lXCI+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tdXJsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PntpdGVtLnVybH08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLWF0XCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogJ3ZhcigtLXdmLTYwMCknIH19PlxuICAgICAgICAgICAgICAgICAgICB7aXRlbS5hdH1cbiAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1zdGF0dXNcIj57aXRlbS5zdGF0dXN9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS10aW1lXCI+e2l0ZW0udGltZX08L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1vcGVuXCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiPlx1NjI1M1x1NUYwMDwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBEYXRhVGFibGUsXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgU2VsZWN0LFxuICBUYWJzLFxuICBUZXh0LFxuICBUZXh0QXJlYSxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBQQVJBTV9ST1dTID0gW1xuICB7IGlkOiAncC1wYWdlJywga2V5OiAncGFnZScsIHZhbHVlOiAnMScsIGRlc2M6ICdcdTk4NzVcdTc4MDEnIH0sXG4gIHsgaWQ6ICdwLXNpemUnLCBrZXk6ICdzaXplJywgdmFsdWU6ICcyMCcsIGRlc2M6ICdcdTZCQ0ZcdTk4NzVcdTY3NjFcdTY1NzAnIH0sXG4gIHsgaWQ6ICdwLXEnLCBrZXk6ICdxJywgdmFsdWU6ICdhbGljZScsIGRlc2M6ICdcdTUxNzNcdTk1MkVcdTVCNTdcdTY0MUNcdTdEMjInIH0sXG4gIHsgaWQ6ICdwLXN0YXR1cycsIGtleTogJ3N0YXR1cycsIHZhbHVlOiAnYWN0aXZlJywgZGVzYzogJ1x1NzUyOFx1NjIzN1x1NzJCNlx1NjAwMScgfSxcbl1cblxuY29uc3QgSEVBREVSX1JPV1MgPSBbXG4gIHsgaWQ6ICdoLWF1dGgnLCBrZXk6ICdBdXRob3JpemF0aW9uJywgdmFsdWU6ICdCZWFyZXIge3t0b2tlbn19JywgZGVzYzogJ1x1OEJCRlx1OTVFRVx1NEVFNFx1NzI0QycgfSxcbiAgeyBpZDogJ2gtYWNjZXB0Jywga2V5OiAnQWNjZXB0JywgdmFsdWU6ICdhcHBsaWNhdGlvbi9qc29uJywgZGVzYzogJycgfSxcbiAgeyBpZDogJ2gtdHJhY2UnLCBrZXk6ICdYLVJlcXVlc3QtSWQnLCB2YWx1ZTogJ3t7JGd1aWR9fScsIGRlc2M6ICdcdTk0RkVcdThERUZcdThGRkRcdThFMkEnIH0sXG4gIHsgaWQ6ICdoLWNsaWVudCcsIGtleTogJ1gtQ2xpZW50JywgdmFsdWU6ICdhcGktY2xpZW50LWRlbW8nLCBkZXNjOiAnJyB9LFxuXVxuXG5jb25zdCBQQVJBTV9DT0xVTU5TID0gW1xuICB7IGtleTogJ2tleScsIGxhYmVsOiAnS2V5JyB9LFxuICB7IGtleTogJ3ZhbHVlJywgbGFiZWw6ICdWYWx1ZScgfSxcbiAgeyBrZXk6ICdkZXNjJywgbGFiZWw6ICdEZXNjcmlwdGlvbicgfSxcbl1cblxuY29uc3QgUkVTUE9OU0VfSlNPTiA9IGB7XG4gIFwiZGF0YVwiOiBbXG4gICAgeyBcImlkXCI6IFwidV8xMDAxXCIsIFwibmFtZVwiOiBcIkFsaWNlXCIsIFwicm9sZVwiOiBcImFkbWluXCIgfSxcbiAgICB7IFwiaWRcIjogXCJ1XzEwMDJcIiwgXCJuYW1lXCI6IFwiQm9iXCIsIFwicm9sZVwiOiBcImVkaXRvclwiIH0sXG4gICAgeyBcImlkXCI6IFwidV8xMDAzXCIsIFwibmFtZVwiOiBcIkNhcm9sXCIsIFwicm9sZVwiOiBcInZpZXdlclwiIH1cbiAgXSxcbiAgXCJwYWdlXCI6IDEsXG4gIFwidG90YWxcIjogMTI4XG59YFxuXG5leHBvcnQgZnVuY3Rpb24gUmVxdWVzdEVkaXRvclNjcmVlbigpIHtcbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IFJlYWN0LnVzZVN0YXRlKCdwYXJhbXMnKVxuICBjb25zdCBbcmVzcFRhYiwgc2V0UmVzcFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgnYm9keScpXG5cbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGw+XG4gICAgICA8Q29sdW1uIGlkPVwicmVxdWVzdC1lZGl0b3ItcGFnZVwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19wYWdlXCIgZ2FwPXswfSBzdHlsZT17eyBoZWlnaHQ6ICcxMDAlJyB9fT5cbiAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdG9wXCIgZ2FwPXsxMn0gc3R5bGU9e3sgcGFkZGluZzogJzE2cHggMjRweCAxMnB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkIHZhcigtLXdmLTMwMCknIH19PlxuICAgICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLWhlYWRlclwiXG4gICAgICAgICAgICB0aXRsZUlkPVwicmVxdWVzdC1lZGl0b3ItdGl0bGVcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2hlYWRlclwiXG4gICAgICAgICAgICB0aXRsZT1cIkxpc3QgVXNlcnNcIlxuICAgICAgICAgICAgc3VidGl0bGU9XCJVc2VyIEFQSSAvIFVzZXJzXCJcbiAgICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYWN0aW9uLWNvbGxlY3Rpb25cIiB0bz1cImNvbGxlY3Rpb25cIj5cdThGRDRcdTU2REUgQ29sbGVjdGlvbjwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2FjdGlvbi1zYXZlXCIgdG89XCJjb2xsZWN0aW9uXCI+U2F2ZTwvQnV0dG9uPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvPlxuXG4gICAgICAgICAgPFJvdyBpZD1cInJlcXVlc3QtZWRpdG9yLXVybGJhclwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX191cmxiYXJcIiBnYXA9ezh9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX21ldGhvZFwiIGRlZmF1bHRWYWx1ZT1cIkdFVFwiIHN0eWxlPXt7IHdpZHRoOiAxMTAgfX0+XG4gICAgICAgICAgICAgIDxvcHRpb24+R0VUPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+UE9TVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlBVVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlBBVENIPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+REVMRVRFPC9vcHRpb24+XG4gICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgIDxUZXh0SW5wdXRcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci11cmxcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdXJsXCJcbiAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPVwie3tiYXNlVXJsfX0vdjEvdXNlcnNcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fZW52XCIgZGVmYXVsdFZhbHVlPVwiU3RhZ2luZ1wiIHN0eWxlPXt7IHdpZHRoOiAxNDAgfX0+XG4gICAgICAgICAgICAgIDxvcHRpb24+U3RhZ2luZzwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlByb2R1Y3Rpb248L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5Mb2NhbDwvb3B0aW9uPlxuICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICA8QnV0dG9uIGlkPVwicmVxdWVzdC1lZGl0b3Itc2VuZFwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19zZW5kXCIgdmFyaWFudD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgU2VuZFxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgICA8VGFic1xuICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci10YWJzXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX190YWJzXCJcbiAgICAgICAgICAgIGFjdGl2ZUlkPXt0YWJ9XG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0VGFifVxuICAgICAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICAgICAgeyBpZDogJ3BhcmFtcycsIGxhYmVsOiAnUGFyYW1zJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnaGVhZGVycycsIGxhYmVsOiAnSGVhZGVycycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2JvZHknLCBsYWJlbDogJ0JvZHknIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdhdXRoJywgbGFiZWw6ICdBdXRob3JpemF0aW9uJyB9LFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuXG4gICAgICAgICAge3RhYiA9PT0gJ3BhcmFtcycgPyAoXG4gICAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItcGFyYW1zXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3BhcmFtc1wiXG4gICAgICAgICAgICAgIGNvbHVtbnM9e1BBUkFNX0NPTFVNTlN9XG4gICAgICAgICAgICAgIHJvd3M9e1BBUkFNX1JPV1N9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3RhYiA9PT0gJ2hlYWRlcnMnID8gKFxuICAgICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLWhlYWRlcnNcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9faGVhZGVyc1wiXG4gICAgICAgICAgICAgIGNvbHVtbnM9e1BBUkFNX0NPTFVNTlN9XG4gICAgICAgICAgICAgIHJvd3M9e0hFQURFUl9ST1dTfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdib2R5JyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItYm9keVwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5XCIgc3R5bGU9e3sgcGFkZGluZzogMTIgfX0+XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktdG9vbGJhclwiIGdhcD17OH0gc3R5bGU9e3sgbWFyZ2luQm90dG9tOiA4IH19PlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keS10eXBlXCI+cmF3PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktZm9ybWF0XCI+SlNPTjwvQmFkZ2U+XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8VGV4dEFyZWFcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keS1pbnB1dFwiXG4gICAgICAgICAgICAgICAgcm93cz17Nn1cbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9eyd7XFxuICBcIm5vdGVcIjogXCJHRVQgXHU4QkY3XHU2QzQyXHU5MDFBXHU1RTM4XHU2NUUwIEJvZHlcdUZGMENcdTZCNjRcdTU5MDRcdTRFQzVcdTc5M0FcdTYxMEZcdTdGMTZcdThGOTFcdTUzM0FcIlxcbn0nfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3RhYiA9PT0gJ2F1dGgnID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1hdXRoXCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGhcIiBzdHlsZT17eyBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1maWVsZHNcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXJvd1wiIGdhcD17MTJ9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLWxhYmVsXCIgc3R5bGU9e3sgd2lkdGg6IDgwIH19PlR5cGU8L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXR5cGVcIiBkZWZhdWx0VmFsdWU9XCJCZWFyZXIgVG9rZW5cIiBzdHlsZT17eyB3aWR0aDogMjAwIH19PlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPkJlYXJlciBUb2tlbjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPkFQSSBLZXk8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5CYXNpYyBBdXRoPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+Tm8gQXV0aDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1yb3dcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1sYWJlbFwiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fT5Ub2tlbjwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDxUZXh0SW5wdXRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtdG9rZW5cIlxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9XCJ7e3Rva2VufX1cIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxIH19XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9Db2x1bW4+XG5cbiAgICAgICAgPENvbHVtblxuICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItcmVzcG9uc2VcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZVwiXG4gICAgICAgICAgZ2FwPXsxMH1cbiAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAyNCwgYmFja2dyb3VuZDogJ3ZhcigtLXdmLTUwKScsIG1pbkhlaWdodDogMjgwIH19XG4gICAgICAgID5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1oZWFkXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLXRpdGxlXCIgbGV2ZWw9ezN9PlJlc3BvbnNlPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtbWV0YVwiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc3RhdHVzXCI+MjAwIE9LPC9CYWRnZT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX190aW1lXCI+MTQyIG1zPC9CYWRnZT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19zaXplXCI+My4yIEtCPC9CYWRnZT5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDwvUm93PlxuXG4gICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItcmVzcG9uc2UtdGFic1wiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtdGFic1wiXG4gICAgICAgICAgICBhY3RpdmVJZD17cmVzcFRhYn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRSZXNwVGFifVxuICAgICAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICAgICAgeyBpZDogJ2JvZHknLCBsYWJlbDogJ0JvZHknIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdoZWFkZXJzJywgbGFiZWw6ICdIZWFkZXJzJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnY29va2llcycsIGxhYmVsOiAnQ29va2llcycgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIHtyZXNwVGFiID09PSAnYm9keScgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlLWJvZHlcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtYm9keVwiIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19PlxuICAgICAgICAgICAgICA8cHJlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWpzb25cIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpbjogMCwgZm9udFNpemU6IDEyLCB3aGl0ZVNwYWNlOiAncHJlLXdyYXAnLCBmb250RmFtaWx5OiAndWktbW9ub3NwYWNlLCBtb25vc3BhY2UnIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7UkVTUE9OU0VfSlNPTn1cbiAgICAgICAgICAgICAgPC9wcmU+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7cmVzcFRhYiA9PT0gJ2hlYWRlcnMnID8gKFxuICAgICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlLWhlYWRlcnNcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtaGVhZGVyc1wiXG4gICAgICAgICAgICAgIGNvbHVtbnM9e1tcbiAgICAgICAgICAgICAgICB7IGtleTogJ2tleScsIGxhYmVsOiAnSGVhZGVyJyB9LFxuICAgICAgICAgICAgICAgIHsga2V5OiAndmFsdWUnLCBsYWJlbDogJ1ZhbHVlJyB9LFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICByb3dzPXtbXG4gICAgICAgICAgICAgICAgeyBpZDogJ3JoLWN0Jywga2V5OiAnY29udGVudC10eXBlJywgdmFsdWU6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04JyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdyaC1jYWNoZScsIGtleTogJ2NhY2hlLWNvbnRyb2wnLCB2YWx1ZTogJ25vLXN0b3JlJyB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6ICdyaC1yZXEnLCBrZXk6ICd4LXJlcXVlc3QtaWQnLCB2YWx1ZTogJ3JlcV84ZjNhMmMnIH0sXG4gICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3Jlc3BUYWIgPT09ICdjb29raWVzJyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItY29va2llc1wiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19jb29raWVzXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19jb29raWVzLWVtcHR5XCI+XHU2NzJDXHU2QjIxXHU1NENEXHU1RTk0XHU2NzJBXHU4QkJFXHU3RjZFIENvb2tpZTwvVGV4dD5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEZvcm1GaWVsZCxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG4gIFRvZ2dsZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFNldHRpbmdzU2NyZWVuKCkge1xuICBjb25zdCBbc3NsLCBzZXRTc2xdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW2ZvbGxvd1JlZGlyZWN0LCBzZXRGb2xsb3dSZWRpcmVjdF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbcHJveHksIHNldFByb3h5XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cInNldHRpbmdzLXBhZ2VcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwic2V0dGluZ3MtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwic2V0dGluZ3MtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU4QkJFXHU3RjZFXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OTAxQVx1NzUyOFx1NTA0Rlx1NTk3RFx1MzAwMVx1NEVFM1x1NzQwNlx1NEUwRVx1OEJDMVx1NEU2Nlx1RkYwOFx1N0VCRlx1Njg0Nlx1NzkzQVx1NjEwRlx1RkYwOVwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInNldHRpbmdzX19hY3Rpb24td29ya3NwYWNlXCIgdG89XCJ3b3Jrc3BhY2VcIj5cdThGRDRcdTU2REVcdTVERTVcdTRGNUNcdTUzM0E8L0J1dHRvbj5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJzZXR0aW5ncy1nZW5lcmFsXCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb25cIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLWJvZHlcIiBnYXA9ezE0fT5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLXRpdGxlXCIgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19Plx1OTAxQVx1NzUyODwvVGV4dD5cbiAgICAgICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX2ZpZWxkXCIgbGFiZWw9XCJcdTlFRDhcdThCQTRcdThEODVcdTY1RjZcdUZGMDhtc1x1RkYwOVwiIGh0bWxGb3I9XCJzZXR0aW5ncy10aW1lb3V0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy10aW1lb3V0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RpbWVvdXRcIiBkZWZhdWx0VmFsdWU9XCIxNTAwMFwiIC8+XG4gICAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtbGFiZWxcIj5cdTgxRUFcdTUyQThcdThEREZcdTk2OEZcdTkxQ0RcdTVCOUFcdTU0MTE8L1RleHQ+XG4gICAgICAgICAgICAgIDxUb2dnbGVcbiAgICAgICAgICAgICAgICBpZD1cInNldHRpbmdzLXJlZGlyZWN0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19fcmVkaXJlY3RcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2ZvbGxvd1JlZGlyZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRGb2xsb3dSZWRpcmVjdH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1sYWJlbFwiPlx1NjgyMVx1OUE4Q1x1OEJDMVx1NEU2Nlx1RkYwOFNTTFx1RkYwOTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgICAgICAgIGlkPVwic2V0dGluZ3Mtc3NsXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19fc3NsXCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzc2x9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFNzbH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJzZXR0aW5ncy1wcm94eVwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS1oZWFkXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdTRFRTNcdTc0MDY8L1RleHQ+XG4gICAgICAgICAgICAgIDxUb2dnbGVcbiAgICAgICAgICAgICAgICBpZD1cInNldHRpbmdzLXByb3h5LXRvZ2dsZVwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LXRvZ2dsZVwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17cHJveHl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldFByb3h5fVxuICAgICAgICAgICAgICAgIGxhYmVsPXtwcm94eSA/ICdcdTVGMDBcdTU0MkYnIDogJ1x1NTE3M1x1OTVFRCd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX2ZpZWxkXCIgbGFiZWw9XCJIb3N0XCIgaHRtbEZvcj1cInNldHRpbmdzLXByb3h5LWhvc3RcIj5cbiAgICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cInNldHRpbmdzLXByb3h5LWhvc3RcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktaG9zdFwiIGRlZmF1bHRWYWx1ZT1cIjEyNy4wLjAuMVwiIC8+XG4gICAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX2ZpZWxkXCIgbGFiZWw9XCJQb3J0XCIgaHRtbEZvcj1cInNldHRpbmdzLXByb3h5LXBvcnRcIj5cbiAgICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cInNldHRpbmdzLXByb3h5LXBvcnRcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktcG9ydFwiIGRlZmF1bHRWYWx1ZT1cIjc4OTBcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cblxuICAgICAgICA8Q2FyZCBpZD1cInNldHRpbmdzLWNlcnRzXCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb25cIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLXRpdGxlXCIgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19Plx1OEJDMVx1NEU2NjwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX19jZXJ0cy1lbXB0eVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMyB9fT5cbiAgICAgICAgICAgICAgXHU1QzFBXHU2NzJBXHU2REZCXHU1MkEwXHU1QkEyXHU2MjM3XHU3QUVGXHU4QkMxXHU0RTY2XHUzMDAyXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU1M0VGXHU1NzI4XHU2QjY0XHU2MzAyXHU4RjdEIC5wZW0gLyAucDEyXHUzMDAyXG4gICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInNldHRpbmdzX19jZXJ0cy1hZGRcIj5cdTZERkJcdTUyQTBcdThCQzFcdTRFNjY8L0J1dHRvbj5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBDT0xMRUNUSU9OUyA9IFtcbiAge1xuICAgIGlkOiAnY29sLXVzZXJzJyxcbiAgICBuYW1lOiAnVXNlciBBUEknLFxuICAgIGRlc2M6ICdcdTc1MjhcdTYyMzdcdTUyMTdcdTg4NjhcdTMwMDFcdThCRTZcdTYwQzVcdTMwMDFcdTY2RjRcdTY1QjBcdTRFMEVcdTc5ODFcdTc1MjgnLFxuICAgIGNvdW50OiA2LFxuICAgIHVwZGF0ZWRBdDogJ1x1NEVDQVx1NTkyOSAxMDoyNCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NvbC1vcmRlcnMnLFxuICAgIG5hbWU6ICdPcmRlciBBUEknLFxuICAgIGRlc2M6ICdcdThCQTJcdTUzNTVcdTY3RTVcdThCRTJcdTMwMDFcdTUyMUJcdTVFRkFcdTMwMDFcdTUzRDZcdTZEODhcdTMwMDFcdTVDNjVcdTdFQTZcdTcyQjZcdTYwMDEnLFxuICAgIGNvdW50OiA5LFxuICAgIHVwZGF0ZWRBdDogJ1x1NjYyOFx1NTkyOSAxODowMicsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NvbC1hdXRoJyxcbiAgICBuYW1lOiAnQXV0aCcsXG4gICAgZGVzYzogJ1x1NzY3Qlx1NUY1NVx1MzAwMVx1NTIzN1x1NjVCMCBUb2tlblx1MzAwMVx1NzY3Qlx1NTFGQScsXG4gICAgY291bnQ6IDQsXG4gICAgdXBkYXRlZEF0OiAnMDgtMDggMTQ6MTEnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtYmlsbGluZycsXG4gICAgbmFtZTogJ0JpbGxpbmcnLFxuICAgIGRlc2M6ICdcdThEMjZcdTUzNTVcdTMwMDFcdTUzRDFcdTc5NjhcdTMwMDFcdTY1MkZcdTRFRDhcdTU2REVcdThDMDMnLFxuICAgIGNvdW50OiA1LFxuICAgIHVwZGF0ZWRBdDogJzA4LTA3IDA5OjQwJyxcbiAgfSxcbl1cblxuY29uc3QgUkVDRU5UID0gW1xuICB7IGlkOiAncmVxLWxpc3QtdXNlcnMnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnTGlzdCBVc2VycycsIHBhdGg6ICcvdjEvdXNlcnMnLCBzdGF0dXM6ICcyMDAnIH0sXG4gIHsgaWQ6ICdyZXEtY3JlYXRlLW9yZGVyJywgbWV0aG9kOiAnUE9TVCcsIG5hbWU6ICdDcmVhdGUgT3JkZXInLCBwYXRoOiAnL3YxL29yZGVycycsIHN0YXR1czogJzIwMScgfSxcbiAgeyBpZDogJ3JlcS1sb2dpbicsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnTG9naW4nLCBwYXRoOiAnL3YxL2F1dGgvbG9naW4nLCBzdGF0dXM6ICcyMDAnIH0sXG4gIHsgaWQ6ICdyZXEtZ2V0LWludm9pY2UnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnR2V0IEludm9pY2UnLCBwYXRoOiAnL3YxL2JpbGxpbmcvaW52b2ljZXMvOmlkJywgc3RhdHVzOiAnNDA0JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gV29ya3NwYWNlU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbFxuICAgICAgYXNpZGU9e1xuICAgICAgICA8Q29sdW1uIGlkPVwid29ya3NwYWNlLWFzaWRlXCIgY2xhc3NOYW1lPVwid29ya3NwYWNlX19hc2lkZVwiIGdhcD17MTJ9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19hc2lkZS1oZWFkXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19hc2lkZS10aXRsZVwiIGxldmVsPXszfT5Db2xsZWN0aW9uczwvSGVhZGluZz5cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwid29ya3NwYWNlX19hc2lkZS1uZXdcIiB0bz1cImNvbGxlY3Rpb25cIj5cdTY1QjBcdTVFRkE8L0J1dHRvbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB7Q09MTEVDVElPTlMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1jYXJkXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRvPVwiY29sbGVjdGlvblwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6IDEwIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLW5hbWVcIj57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tY291bnRcIj57aXRlbS5jb3VudH08L0JhZGdlPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLWRlc2NcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIG1hcmdpblRvcDogNCB9fT5cbiAgICAgICAgICAgICAgICB7aXRlbS5kZXNjfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxDb2x1bW4gaWQ9XCJ3b3Jrc3BhY2UtcGFnZVwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwid29ya3NwYWNlLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cIndvcmtzcGFjZS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwid29ya3NwYWNlX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU1REU1XHU0RjVDXHU1MzNBXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OTAwOVx1NjJFOSBDb2xsZWN0aW9uIFx1NjI1M1x1NUYwMFx1OEJGN1x1NkM0Mlx1RkYwQ1x1NjIxNlx1NEVDRVx1NjcwMFx1OEZEMVx1OEJCMFx1NUY1NVx1N0VFN1x1N0VFRFx1N0YxNlx1OEY5MVwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYWN0aW9uLWVudlwiIHRvPVwiZW52aXJvbm1lbnRzXCI+XHU1MjA3XHU2MzYyXHU3M0FGXHU1ODgzPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwid29ya3NwYWNlX19hY3Rpb24tbmV3XCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XHU2NUIwXHU1RUZBXHU4QkY3XHU2QzQyPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJ3b3Jrc3BhY2Utd2VsY29tZVwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fd2VsY29tZVwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fd2VsY29tZS10aXRsZVwiIGxldmVsPXszfT5EZW1vIFdvcmtzcGFjZTwvSGVhZGluZz5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWUtY29weVwiPlxuICAgICAgICAgICAgXHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzXHVGRjFBU3RhZ2luZyBcdTAwQjcgQmFzZSBVUkwgXHU0RjdGXHU3NTI4IHsne3tiYXNlVXJsfX0nfSBcdTAwQjcgXHU1MTcxIDQgXHU0RTJBIENvbGxlY3Rpb25cbiAgICAgICAgICA8L1RleHQ+XG4gICAgICAgIDwvQ2FyZD5cblxuICAgICAgICA8Q29sdW1uIGlkPVwid29ya3NwYWNlLXJlY2VudFwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtdGl0bGVcIiBsZXZlbD17M30+XHU2NzAwXHU4RkQxXHU4QkY3XHU2QzQyPC9IZWFkaW5nPlxuICAgICAgICAgIHtSRUNFTlQubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LWl0ZW1cIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgdG89XCJyZXF1ZXN0LWVkaXRvclwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1tZXRob2RcIj57aXRlbS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LWNvcHlcIiBnYXA9ezJ9IHN0eWxlPXt7IGZsZXg6IDEsIG1pbldpZHRoOiAwIH19PlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1uYW1lXCI+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXBhdGhcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+e2l0ZW0ucGF0aH08L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXN0YXR1c1wiPntpdGVtLnN0YXR1c308L0JhZGdlPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Db2x1bW4+XG5cbiAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0c1wiIGdhcD17MTJ9PlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXRcIiB0bz1cImhpc3RvcnlcIiBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtdGl0bGVcIiBsZXZlbD17M30+XHU1Mzg2XHU1M0YyXHU4QkIwXHU1RjU1PC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC1kZXNjXCI+XHU2N0U1XHU3NzBCXHU2NzJDXHU2NzNBXHU1M0QxXHU5MDAxXHU4RkM3XHU3Njg0XHU4QkY3XHU2QzQyPC9UZXh0PlxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0XCIgdG89XCJzZXR0aW5nc1wiIHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6IDE0IH19PlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC10aXRsZVwiIGxldmVsPXszfT5cdThCQkVcdTdGNkU8L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LWRlc2NcIj5cdTRFRTNcdTc0MDZcdTMwMDFcdThCQzFcdTRFNjZcdTRFMEVcdTkwMUFcdTc1MjhcdTUwNEZcdTU5N0Q8L1RleHQ+XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICA8L1Jvdz5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBDb2xsZWN0aW9uU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2NvbGxlY3Rpb24uanN4J1xuaW1wb3J0IHsgRW52aXJvbm1lbnRzU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2Vudmlyb25tZW50cy5qc3gnXG5pbXBvcnQgeyBIaXN0b3J5U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2hpc3RvcnkuanN4J1xuaW1wb3J0IHsgUmVxdWVzdEVkaXRvclNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9yZXF1ZXN0LWVkaXRvci5qc3gnXG5pbXBvcnQgeyBTZXR0aW5nc1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9zZXR0aW5ncy5qc3gnXG5pbXBvcnQgeyBXb3Jrc3BhY2VTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvd29ya3NwYWNlLmpzeCdcblxuY29uc3QgU0hFTExfTElOS1MgPSBbJ3dvcmtzcGFjZScsICdjb2xsZWN0aW9uJywgJ2Vudmlyb25tZW50cycsICdoaXN0b3J5JywgJ3NldHRpbmdzJ11cblxuZXhwb3J0IGNvbnN0IHByb2plY3QgPSB7XG4gIG5hbWU6ICdBUEkgQ2xpZW50XHVGRjA4UG9zdG1hbiBcdTk4Q0VcdTY4M0NcdUZGMDknLFxuICB2aWV3cG9ydHM6IHtcbiAgICBkZXNrdG9wOiB7IHdpZHRoOiAxNDQwLCBoZWlnaHQ6IDkwMCB9LFxuICB9LFxuICBkZWZhdWx0Vmlld3BvcnQ6ICdkZXNrdG9wJyxcbiAgc2NyZWVuczogW1xuICAgIHtcbiAgICAgIGlkOiAnd29ya3NwYWNlJyxcbiAgICAgIHRpdGxlOiAnXHU1REU1XHU0RjVDXHU1MzNBJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29sbGVjdGlvbnMgXHU0RkE3XHU2ODBGXHU0RTBFXHU2NzAwXHU4RkQxXHU4QkY3XHU2QzQyXHU1MTY1XHU1M0UzJyxcbiAgICAgIGNvbXBvbmVudDogV29ya3NwYWNlU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWy4uLlNIRUxMX0xJTktTLCAncmVxdWVzdC1lZGl0b3InXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2NvbGxlY3Rpb24nLFxuICAgICAgdGl0bGU6ICdDb2xsZWN0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU2NTg3XHU0RUY2XHU1OTM5XHU0RTBFXHU4QkY3XHU2QzQyXHU2ODExXHVGRjBDXHU2MjUzXHU1RjAwXHU4QkY3XHU2QzQyXHU3RjE2XHU4RjkxXHU1NjY4JyxcbiAgICAgIGNvbXBvbmVudDogQ29sbGVjdGlvblNjcmVlbixcbiAgICAgIGxpbmtzOiBbLi4uU0hFTExfTElOS1MsICdyZXF1ZXN0LWVkaXRvciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncmVxdWVzdC1lZGl0b3InLFxuICAgICAgdGl0bGU6ICdcdThCRjdcdTZDNDJcdTdGMTZcdThGOTEnLFxuICAgICAgZGVzY3JpcHRpb246ICdNZXRob2QgLyBVUkwgLyBQYXJhbXMgLyBIZWFkZXJzIC8gQm9keSBcdTRFMEUgUmVzcG9uc2UnLFxuICAgICAgY29tcG9uZW50OiBSZXF1ZXN0RWRpdG9yU2NyZWVuLFxuICAgICAgbGlua3M6IFNIRUxMX0xJTktTLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnZW52aXJvbm1lbnRzJyxcbiAgICAgIHRpdGxlOiAnXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU1OTFBXHU3M0FGXHU1ODgzXHU1MjA3XHU2MzYyXHU0RTBFXHU1M0Q4XHU5MUNGXHU4ODY4JyxcbiAgICAgIGNvbXBvbmVudDogRW52aXJvbm1lbnRzU2NyZWVuLFxuICAgICAgbGlua3M6IFNIRUxMX0xJTktTLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnaGlzdG9yeScsXG4gICAgICB0aXRsZTogJ1x1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1NjcwMFx1OEZEMVx1NTNEMVx1OTAwMVx1OEJCMFx1NUY1NVx1RkYwQ1x1NTNFRlx1OTFDRFx1NjVCMFx1NjI1M1x1NUYwMFx1N0YxNlx1OEY5MVx1NTY2OCcsXG4gICAgICBjb21wb25lbnQ6IEhpc3RvcnlTY3JlZW4sXG4gICAgICBsaW5rczogWy4uLlNIRUxMX0xJTktTLCAncmVxdWVzdC1lZGl0b3InXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3NldHRpbmdzJyxcbiAgICAgIHRpdGxlOiAnXHU4QkJFXHU3RjZFJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU5MDFBXHU3NTI4XHUzMDAxXHU0RUUzXHU3NDA2XHU0RTBFXHU4QkMxXHU0RTY2JyxcbiAgICAgIGNvbXBvbmVudDogU2V0dGluZ3NTY3JlZW4sXG4gICAgICBsaW5rczogU0hFTExfTElOS1MsXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gIF0sXG59XG4iLCAiaW1wb3J0IHsgQm9hcmQgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgUHJvdG90eXBlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHZhbGlkYXRlUHJvamVjdCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3ZDLE1BQU07QUFBQSxNQUNOLGFBQWFBLFNBQVE7QUFBQSxNQUNyQixTQUFTO0FBQUEsTUFDVCxpQkFBaUI7QUFBQSxNQUNqQixTQUFTLENBQUM7QUFBQSxJQUNaLENBQUM7QUFFRCxVQUFNLFdBQVcsTUFBTSxZQUFZLENBQUMsT0FBTztBQUN6QyxVQUFJLENBQUNBLFNBQVEsUUFB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UCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsR0FBRyxhQUFhLGdCQUFnQjtBQUFBLFFBQ3hDLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxHQUFHLGFBQWEsZ0JBQWdCO0FBQUEsUUFDeEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDNURBLGtCQUFnQixPQUFPO0FBRXZCLFdBQVMsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUU7QUFBQSxJQUNuRCxvQ0FBQyxpQkFBYyxPQUFNLFdBQ25CLG9DQUFDLHFCQUFrQixXQUNqQixvQ0FBQyxTQUFNLFNBQWtCLENBQzNCLENBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJwcm9qZWN0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0Il0KfQo=
