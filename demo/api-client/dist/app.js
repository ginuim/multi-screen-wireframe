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
    const [reviewPanelVisible, setReviewPanelVisible] = React.useState(false);
    const [reviewSelections, setReviewSelections] = React.useState([]);
    const [reviewMultiSelect, setReviewMultiSelect] = React.useState(false);
    const [reviewItems, setReviewItems] = React.useState([]);
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
    const toggleReview = () => {
      if (reviewEnabled) {
        closeReview();
        return;
      }
      setInteractive(true);
      setReviewPanelVisible(false);
      setReviewEnabled(true);
    };
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
          "aria-label": reviewEnabled ? "\u4FEE\u6539\u4E2D" : "\u4FEE\u6539",
          title: "\u4FEE\u6539\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt",
          onClick: toggleReview
        },
        /* @__PURE__ */ React.createElement(ToolbarIcon, { name: "edit" }),
        /* @__PURE__ */ React.createElement("span", { className: "wf-visually-hidden" }, "\u4FEE\u6539")
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9DYW52YXNNb2RlLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvRGVtb01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBvcnQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld1BhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TWFya2Vycy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld0xhdW5jaGVyLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYmVmb3JlLXVubG9hZC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmxvdy5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbGF5b3V0LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvY29udGVudC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zvcm1zLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbmF2aWdhdGlvbi5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2RhdGEuanN4IiwgIi4uL3NyYy9sYXlvdXRzL0FwcFNoZWxsLmpzeCIsICIuLi9zcmMvc2NyZWVucy9jb2xsZWN0aW9uLmpzeCIsICIuLi9zcmMvc2NyZWVucy9lbnZpcm9ubWVudHMuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2hpc3RvcnkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3JlcXVlc3QtZWRpdG9yLmpzeCIsICIuLi9zcmMvc2NyZWVucy9zZXR0aW5ncy5qc3giLCAiLi4vc3JjL3NjcmVlbnMvd29ya3NwYWNlLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuLi91aS9mbG93LXRhcmdldC5qcydcbmltcG9ydCB7IGZpbmRSZXZpZXdUYXJnZXQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7XG4gIGNvbGxhcHNlU2NyZWVuQ29udGVudCxcbiAgZXhwYW5kU2NyZWVuQ29udGVudCxcbiAgbWVhc3VyZUNvbnRlbnRCb3gsXG59IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHtcbiAgYmVnaW5Db250ZW50RHJhZ1Njcm9sbCxcbiAgZW5kQ29udGVudERyYWdTY3JvbGwsXG4gIG1vdmVDb250ZW50RHJhZ1Njcm9sbCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuRnJhbWUoe1xuICBzY3JlZW4sXG4gIHZpZXdwb3J0LFxuICBtb2RlLFxuICBpbmRleCA9IDAsXG4gIGZvY3VzZWQgPSBmYWxzZSxcbiAgb25FeHBvcnQsXG4gIGV4cGFuZGVkID0gZmFsc2UsXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBjYW52YXNMb2NrZWQgPSBmYWxzZSxcbiAgc2NhbGUgPSAxLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBjb250ZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZXhwYW5kU25hcHNob3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgaG92ZXJSZXZpZXdFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnU2Nyb2xsaW5nLCBzZXREcmFnU2Nyb2xsaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRCb3gsIHNldEV4cGFuZGVkQm94XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290ID0gY29udGVudFJlZi5jdXJyZW50XG4gICAgaWYgKCFyb290IHx8ICFzY3JlZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKCFleHBhbmRlZCkge1xuICAgICAgc2V0RXhwYW5kZWRCb3gobnVsbClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gZXhwYW5kU2NyZWVuQ29udGVudChyb290KVxuICAgIHNldEV4cGFuZGVkQm94KG1lYXN1cmVDb250ZW50Qm94KHJvb3QpKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSwgW2V4cGFuZGVkLCBzY3JlZW4/LmlkLCB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjYW52YXNMb2NrZWQsIHJldmlld0VuYWJsZWQsIHNjcmVlbj8uaWRdKVxuXG4gIGlmICghc2NyZWVuKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IENvbXBvbmVudCA9IHNjcmVlbi5jb21wb25lbnRcbiAgY29uc3QgZnJhbWVDbGFzcyA9IFtcbiAgICAnd2Ytc2NyZWVuLWNocm9tZScsXG4gICAgbW9kZSA9PT0gJ2NhbnZhcycgJiYgZm9jdXNlZCA/ICdpcy1mb2N1c2VkJyA6ICcnLFxuICAgIGV4cGFuZGVkID8gJ2lzLWV4cGFuZGVkJyA6ICcnLFxuICAgIGB3Zi1zY3JlZW4tJHttb2RlfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKVxuXG4gIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgLy8gXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RTBEXHU2M0E1XHU3QkExXHU1QzRGXHU1MTg1XHU2MkQ2XHU2MkZEXHU2RURBXHU1MkE4XHVGRjBDXHU4QkE5XHU0RThCXHU0RUY2XHU4NDNEXHU1MjMwXHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXG4gICAgaWYgKGNhbnZhc0xvY2tlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIFx1NURGMlx1NUM1NVx1NUYwMFx1NjVFMFx1NTNFRlx1NkVEQVx1NTMzQVx1NTdERlx1RkYwQ1x1NEUwRFx1NjJBMlx1NjMwN1x1OTQ4OFxuICAgIGlmIChleHBhbmRlZCkgcmV0dXJuXG4gICAgY29uc3Qgc3RhdGUgPSBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIHsgbG9ja2VkOiBjYW52YXNMb2NrZWQsIHNjYWxlIH0pXG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gc3RhdGVcbiAgICBzZXREcmFnU2Nyb2xsaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICAgIGlmICh0YXJnZXQgPT09IGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50KSByZXR1cm5cbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICB0YXJnZXQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gdGFyZ2V0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIG5hdmlnYXRlKVxuICB9XG5cbiAgY29uc3Qgb25SZXZpZXdDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgaWYgKCF0YXJnZXQpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIG9uUmV2aWV3U2VsZWN0Py4odGFyZ2V0LCBzY3JlZW4sIGNvbnRlbnRSZWYuY3VycmVudCwge1xuICAgICAgYWRkaXRpdmU6IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY2xlYXJSZXZpZXdIb3ZlciA9ICgpID0+IHtcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICB9XG5cbiAgY29uc3QgY29udGVudFN0eWxlID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3hcbiAgICA/IHsgd2lkdGg6IGV4cGFuZGVkQm94LndpZHRoLCBoZWlnaHQ6IGV4cGFuZGVkQm94LmhlaWdodCwgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9XG4gICAgOiB7IHdpZHRoOiB2aWV3cG9ydC53aWR0aCwgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQgfVxuXG4gIGNvbnN0IGZyYW1lV2lkdGggPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveCA/IGV4cGFuZGVkQm94LndpZHRoIDogdmlld3BvcnQud2lkdGhcblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uXG4gICAgICBjbGFzc05hbWU9e2ZyYW1lQ2xhc3N9XG4gICAgICBkYXRhLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgZGF0YS1leHBhbmRlZD17ZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IGZyYW1lV2lkdGggfX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtbGFiZWxcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS10aXRsZVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1maWxlXCI+e3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtYWN0aW9uc1wiPlxuICAgICAgICAgIHtvblRvZ2dsZUV4cGFuZCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cGFuZC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kKClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2V4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3NycgOiAnXHU1QzU1XHU1RjAwJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyAmJiBvbkV4cG9ydCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cG9ydC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uRXhwb3J0KClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgXHU1QkZDXHU1MUZBIFBOR1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e2NvbnRlbnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1jb250ZW50JHtkcmFnU2Nyb2xsaW5nID8gJyBpcy1kcmFnLXNjcm9sbGluZycgOiAnJ30ke2V4cGFuZGVkID8gJyBpcy1leHBhbmRlZCcgOiAnJ30ke3Jldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXtjb250ZW50U3R5bGV9XG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e29uUG9pbnRlck1vdmV9XG4gICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJMZWF2ZT17Y2xlYXJSZXZpZXdIb3Zlcn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e29uUmV2aWV3Q2xpY2t9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShlbCwgZ2V0U2NhbGUsIHNldFNjYWxlLCBnZXRMb2NrZWQgPSAoKSA9PiBmYWxzZSkge1xuICBpZiAoIWVsKSByZXR1cm4gKCkgPT4ge31cbiAgY29uc3Qgb25XaGVlbCA9IChldmVudCkgPT4ge1xuICAgIGlmICghc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkOiBnZXRMb2NrZWQoKSB9KSkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldFNjYWxlKGNsYW1wU2NhbGUoZ2V0U2NhbGUoKSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSkge1xuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgbG9ja2VkUmVmID0gUmVhY3QudXNlUmVmKGxvY2tlZClcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGxvY2tlZFJlZi5jdXJyZW50ID0gbG9ja2VkXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayh0YXNrLCBzZXRFcnJvcikge1xuICBzZXRFcnJvcihudWxsKVxuICB0cnkge1xuICAgIGF3YWl0IHRhc2soKVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcilcbiAgICBzZXRFcnJvcihgXHU1QkZDXHU1MUZBXHU1OTMxXHU4RDI1XHVGRjFBJHttZXNzYWdlfWApXG4gIH1cbn1cblxuLyoqIGZpbGU6Ly8gXHU0RTBEXHU2NjJGIHNlY3VyZSBjb250ZXh0XHVGRjBDY2xpcGJvYXJkIEFQSSBcdTVFMzhcdTRFMERcdTUzRUZcdTc1MjhcdUZGMENleGVjQ29tbWFuZCBcdTUxNUNcdTVFOTUgKi9cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkge1xuICAgIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICB9XG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2ZpeGVkJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhbnZhc01vZGUoe1xuICBwcm9qZWN0LFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2VsZWN0ZWRJZHMsXG4gIHNldFNlbGVjdGVkSWRzLFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIG9uRXhwb3J0SWRzLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgZW50ZXJEZW1vID0gKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFkZW1vQXZhaWxhYmxlIHx8IGNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1sYWJlbFwiPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1saXN0XCI+XG4gICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtaW5kZXgtZG90IGlzLWFjdGl2ZScgOiAnd2YtY2FudmFzLWluZGV4LWRvdCd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXAtdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLWZpbGVcIj5zcmMvc2NyZWVucy97c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgc2VsZWN0aW9ucyxcbiAgbXVsdGlTZWxlY3QsXG4gIGl0ZW1zLFxuICBvblRvZ2dsZU11bHRpU2VsZWN0LFxuICBvblNlbGVjdEVsZW1lbnQsXG4gIG9uSG92ZXJFbGVtZW50LFxuICBvblJlbW92ZVNlbGVjdGlvbixcbiAgb25DbGVhclNlbGVjdGlvbixcbiAgb25BZGRJdGVtLFxuICBvblJlbW92ZUl0ZW0sXG4gIG9uQ2xvc2UsXG59KSB7XG4gIGNvbnN0IHNlbGVjdGVkID0gc2VsZWN0aW9uc1tzZWxlY3Rpb25zLmxlbmd0aCAtIDFdIHx8IG51bGxcbiAgY29uc3QgZ2VuZXJhdGVkUHJvbXB0ID0gUmVhY3QudXNlTWVtbygoKSA9PiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcyksIFtwcm9qZWN0LCBpdGVtc10pXG4gIGNvbnN0IFt0eXBlLCBzZXRUeXBlXSA9IFJlYWN0LnVzZVN0YXRlKCdjb21tZW50JylcbiAgY29uc3QgW2luc3RydWN0aW9uLCBzZXRJbnN0cnVjdGlvbl0gPSBSZWFjdC51c2VTdGF0ZSgnJylcbiAgY29uc3QgW3Byb21wdCwgc2V0UHJvbXB0XSA9IFJlYWN0LnVzZVN0YXRlKGdlbmVyYXRlZFByb21wdClcbiAgY29uc3QgW3Byb21wdERpcnR5LCBzZXRQcm9tcHREaXJ0eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZCwgc2V0Q29waWVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBjb3B5VGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcHJvbXB0RGlydHkpIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gIH0sIFtnZW5lcmF0ZWRQcm9tcHQsIHByb21wdERpcnR5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgY29uc3QgYWRkSXRlbSA9ICgpID0+IHtcbiAgICBpZiAoc2VsZWN0aW9ucy5sZW5ndGggPT09IDApIHJldHVyblxuICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBpbnN0cnVjdGlvbi50cmltKClcbiAgICBpZiAoIW5vcm1hbGl6ZWQgJiYgdHlwZSAhPT0gJ3JlbW92ZScpIHJldHVyblxuICAgIG9uQWRkSXRlbSh7XG4gICAgICB0eXBlLFxuICAgICAgdGFyZ2V0czogc2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbikgPT4gKHtcbiAgICAgICAgc2NyZWVuSWQ6IHNlbGVjdGlvbi5zY3JlZW5JZCxcbiAgICAgICAgc2NyZWVuVGl0bGU6IHNlbGVjdGlvbi5zY3JlZW5UaXRsZSxcbiAgICAgICAgc291cmNlSGludDogc2VsZWN0aW9uLnNvdXJjZUhpbnQsXG4gICAgICAgIHNlbGVjdG9yOiBzZWxlY3Rpb24uc2VsZWN0b3IsXG4gICAgICAgIGN1cnJlbnRUZXh0OiBzZWxlY3Rpb24uY3VycmVudFRleHQsXG4gICAgICB9KSksXG4gICAgICBpbnN0cnVjdGlvbjogbm9ybWFsaXplZCxcbiAgICB9KVxuICAgIHNldEluc3RydWN0aW9uKCcnKVxuICB9XG5cbiAgY29uc3QgcmVnZW5lcmF0ZSA9ICgpID0+IHtcbiAgICBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICAgIHNldFByb21wdERpcnR5KGZhbHNlKVxuICB9XG5cbiAgY29uc3QgY29weVByb21wdCA9ICgpID0+IHtcbiAgICBjb3B5VGV4dChwcm9tcHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkKHRydWUpXG4gICAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3B5VGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDE0MDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGluc3RydWN0aW9uTGFiZWwgPSB0eXBlID09PSAndGV4dCdcbiAgICA/ICdcdTY1QjBcdTY1ODdcdTVCNTcnXG4gICAgOiB0eXBlID09PSAnb3JkZXInXG4gICAgICA/ICdcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDInXG4gICAgICA6IHR5cGUgPT09ICdyZW1vdmUnXG4gICAgICAgID8gJ1x1NTIyMFx1OTY2NFx1OEJGNFx1NjYwRVx1RkYwOFx1NTNFRlx1OTAwOVx1RkYwOSdcbiAgICAgICAgOiAnXHU3RUQ5IEFJIFx1NzY4NFx1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRSdcblxuICByZXR1cm4gKFxuICAgIDxhc2lkZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWxcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCXCI+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGluZ1wiPlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLXRpdGxlXCI+XHU0RkVFXHU2NTM5XHU1MzlGXHU1NzhCPC9zdHJvbmc+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWNvdW50XCI+e2l0ZW1zLmxlbmd0aH0gXHU2NzYxXHU0RkVFXHU2NTM5PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsb3NlXCIgb25DbGljaz17b25DbG9zZX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtYm9keVwiPlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oZWFkaW5nXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NURGMlx1OTAwOVx1ODI4Mlx1NzBCOSAoe3NlbGVjdGlvbnMubGVuZ3RofSk8L2gyPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWFjdGlvbnNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bXVsdGlTZWxlY3QgPyAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QnfVxuICAgICAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17bXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25Ub2dnbGVNdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTkxQVx1OTAwOSB7bXVsdGlTZWxlY3QgPyAnT04nIDogJ09GRid9XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNsZWFyLXNlbGVjdGlvblwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtvbkNsZWFyU2VsZWN0aW9ufT5cdTZFMDVcdTdBN0E8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhpbnRcIj5cdTU5MUFcdTkwMDlcdTVGMDBcdTU0MkZcdTU0MEVcdTcwQjlcdTUxRkJcdTgyODJcdTcwQjlcdTUzRUZcdTUyQTBcdTUxNjVcdTYyMTZcdTc5RkJcdTk2NjRcdUZGMUJcdTRFNUZcdTUzRUZcdTYzMDlcdTRGNEYgU2hpZnQgLyBDb21tYW5kIC8gQ3RybCBcdTcwQjlcdTUxRkJcdTMwMDI8L3A+XG4gICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uc1wiPlxuICAgICAgICAgICAgICB7c2VsZWN0aW9ucy5tYXAoKHNlbGVjdGlvbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtzZWxlY3Rpb24gPT09IHNlbGVjdGVkID8gJ3dmLXJldmlldy1zZWxlY3Rpb24gaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctc2VsZWN0aW9uJ30ga2V5PXtgJHtzZWxlY3Rpb24uc2NyZWVuSWR9OiR7c2VsZWN0aW9uLnNlbGVjdG9yfWB9PlxuICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1zZWxlY3RvclwiPntpbmRleCArIDF9LiB7c2VsZWN0aW9uLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1yZW1vdmVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVTZWxlY3Rpb24oc2VsZWN0aW9uLmVsZW1lbnQpfT5cdTc5RkJcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge3NlbGVjdGVkID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2NyZWVuLW5hbWVcIj57c2VsZWN0ZWQuc2NyZWVuVGl0bGV9IFx1MDBCNyB7c2VsZWN0ZWQuc2NyZWVuSWR9PC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJzXCIgYXJpYS1sYWJlbD1cIlx1ODI4Mlx1NzBCOVx1NUM0Mlx1N0VBN1wiPlxuICAgICAgICAgICAgICAgIHtzZWxlY3RlZC5hbmNlc3RvcnMubWFwKChhbmNlc3RvciwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2FuY2VzdG9yLnNlbGVjdG9yfT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYi1zZXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwibTkgMTggNi02LTYtNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWJcIlxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXthbmNlc3Rvci5zZWxlY3Rvcn1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IG9uSG92ZXJFbGVtZW50Py4oYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uU2VsZWN0RWxlbWVudChhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHthbmNlc3Rvci5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdG9yXCI+e3NlbGVjdGVkLnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICAge3NlbGVjdGVkLmN1cnJlbnRUZXh0ID8gKFxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1jdXJyZW50LXRleHRcIj5cdTVGNTNcdTUyNERcdUZGMUF7c2VsZWN0ZWQuY3VycmVudFRleHR9PC9wPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPlx1NEZFRVx1NjUzOVx1N0M3Qlx1NTc4Qjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLXNlbGVjdFwiIHZhbHVlPXt0eXBlfSBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRUeXBlKGV2ZW50LnRhcmdldC52YWx1ZSl9PlxuICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKFJFVklFV19UWVBFX0xBQkVMUykubWFwKChbdmFsdWUsIGxhYmVsXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy10eXBlLW9wdGlvblwiIHZhbHVlPXt2YWx1ZX0ga2V5PXt2YWx1ZX0+e2xhYmVsfTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj57aW5zdHJ1Y3Rpb25MYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaW5zdHJ1Y3Rpb25cIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2luc3RydWN0aW9ufVxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3R5cGUgPT09ICdvcmRlcicgPyAnXHU0RjhCXHU1OTgyXHVGRjFBXHU3OUZCXHU1MkE4XHU1MjMwXHU4QkEyXHU1MzU1XHU2NDU4XHU4OTgxXHU0RTRCXHU1NDBFJyA6ICdcdTYzQ0ZcdThGRjBcdTVFMENcdTY3MUIgQUkgXHU1OTgyXHU0RjU1XHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldEluc3RydWN0aW9uKGV2ZW50LnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1hZGRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshaW5zdHJ1Y3Rpb24udHJpbSgpICYmIHR5cGUgIT09ICdyZW1vdmUnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FkZEl0ZW19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTUyQTBcdTUxNjVcdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTVcdUZGMDh7c2VsZWN0aW9ucy5sZW5ndGh9IFx1NEUyQVx1ODI4Mlx1NzBCOVx1RkYwOVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTRFMkRcdTc2ODRcdTgyODJcdTcwQjlcdTVGMDBcdTU5Q0JcdThCQzRcdThCQkFcdTMwMDJcdTcwQjlcdTUxRkJcdTk3NjJcdTUzMDVcdTVDNTFcdTUzRUZcdTUyMDdcdTYzNjJcdTUyMzBcdTcyMzZcdTdFQTdcdTdFQzRcdTRFRjZcdTMwMDI8L3A+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTRGRUVcdTY1MzlcdTZFMDVcdTUzNTU8L2gyPlxuICAgICAgICAgIHtpdGVtcy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtc1wiPlxuICAgICAgICAgICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbVwiIGtleT17aXRlbS5pZH0+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS10aXRsZVwiPntpbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2l0ZW0udHlwZV19PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXNlbGVjdG9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Jldmlld1RhcmdldHMoaXRlbSkubWFwKCh0YXJnZXQpID0+IHRhcmdldC5zZWxlY3Rvcikuam9pbignXHUzMDAxJyl9XG4gICAgICAgICAgICAgICAgICAgIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0taW5zdHJ1Y3Rpb25cIj57aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ308L3A+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tZGVsZXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlSXRlbShpdGVtLmlkKX0+XHU1MjIwXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZW1wdHlcIj5cdThGRDhcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDI8L3A+fVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24gd2YtcmV2aWV3LXByb21wdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi10aXRsZVwiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTY3MDBcdTdFQzggUHJvbXB0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXJlZ2VuZXJhdGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cmVnZW5lcmF0ZX0+XHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwPC9idXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge3Byb21wdERpcnR5ID8gPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hbnVhbFwiPlByb21wdCBcdTVERjJcdTYyNEJcdTUyQThcdTRGRUVcdTY1MzlcdUZGMUJcdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTBcdTRGMUFcdTg5ODZcdTc2RDZcdTYyNEJcdTUyQThcdTUxODVcdTVCQjlcdTMwMDI8L3A+IDogbnVsbH1cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1wcm9tcHRcIlxuICAgICAgICAgICAgdmFsdWU9e3Byb21wdH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgc2V0UHJvbXB0KGV2ZW50LnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgc2V0UHJvbXB0RGlydHkodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY29weVwiIG9uQ2xpY2s9e2NvcHlQcm9tcHR9PlxuICAgICAgICAgICAge2NvcGllZCA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NTkwRFx1NTIzNiBQcm9tcHQnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2FzaWRlPlxuICApXG59XG4iLCAiaW1wb3J0IHsgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIHNhbWVQb3NpdGlvbnMobGVmdCwgcmlnaHQpIHtcbiAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZVxuICByZXR1cm4gbGVmdC5ldmVyeSgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvdGhlciA9IHJpZ2h0W2luZGV4XVxuICAgIHJldHVybiBpdGVtLmtleSA9PT0gb3RoZXIua2V5XG4gICAgICAmJiBpdGVtLml0ZW0gPT09IG90aGVyLml0ZW1cbiAgICAgICYmIGl0ZW0uaXRlbUluZGV4ID09PSBvdGhlci5pdGVtSW5kZXhcbiAgICAgICYmIGl0ZW0ubGVmdCA9PT0gb3RoZXIubGVmdFxuICAgICAgJiYgaXRlbS50b3AgPT09IG90aGVyLnRvcFxuICB9KVxufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KHJlY3QsIGNsaXApIHtcbiAgY29uc3QgbGVmdCA9IE1hdGgubWF4KHJlY3QubGVmdCwgY2xpcC5sZWZ0KVxuICBjb25zdCByaWdodCA9IE1hdGgubWluKHJlY3QucmlnaHQsIGNsaXAucmlnaHQpXG4gIGNvbnN0IHRvcCA9IE1hdGgubWF4KHJlY3QudG9wLCBjbGlwLnRvcClcbiAgY29uc3QgYm90dG9tID0gTWF0aC5taW4ocmVjdC5ib3R0b20sIGNsaXAuYm90dG9tKVxuICBpZiAocmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm4gbnVsbFxuICByZXR1cm4geyBsZWZ0LCByaWdodCwgdG9wLCBib3R0b20gfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlUG9zaXRpb25zKGJvYXJkLCBpdGVtcykge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gW11cbiAgY29uc3QgYm9hcmRSZWN0ID0gYm9hcmQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgY29uc3QgcG9zaXRpb25zID0gW11cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICByZXZpZXdUYXJnZXRzKGl0ZW0pLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGxldCBlbGVtZW50ID0gbnVsbFxuICAgICAgdHJ5IHtcbiAgICAgICAgZWxlbWVudCA9IGJvYXJkLnF1ZXJ5U2VsZWN0b3IodGFyZ2V0LnNlbGVjdG9yKVxuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFlbGVtZW50Py5pc0Nvbm5lY3RlZCkgcmV0dXJuXG4gICAgICBjb25zdCBzY3JlZW5Db250ZW50ID0gZWxlbWVudC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNvbnRlbnQnKVxuICAgICAgaWYgKCFzY3JlZW5Db250ZW50KSByZXR1cm5cbiAgICAgIGNvbnN0IHZpc2libGUgPSBpbnRlcnNlY3RSZWN0KGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIHNjcmVlbkNvbnRlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkpXG4gICAgICBpZiAoIXZpc2libGUpIHJldHVyblxuICAgICAgY29uc3QgYmFzZUxlZnQgPSBNYXRoLnJvdW5kKHZpc2libGUucmlnaHQgLSBib2FyZFJlY3QubGVmdClcbiAgICAgIGNvbnN0IGJhc2VUb3AgPSBNYXRoLnJvdW5kKHZpc2libGUudG9wIC0gYm9hcmRSZWN0LnRvcClcbiAgICAgIGNvbnN0IG92ZXJsYXBDb3VudCA9IHBvc2l0aW9ucy5maWx0ZXIoXG4gICAgICAgIChwb3NpdGlvbikgPT4gTWF0aC5hYnMocG9zaXRpb24uYmFzZUxlZnQgLSBiYXNlTGVmdCkgPCAyICYmIE1hdGguYWJzKHBvc2l0aW9uLmJhc2VUb3AgLSBiYXNlVG9wKSA8IDIsXG4gICAgICApLmxlbmd0aFxuICAgICAgcG9zaXRpb25zLnB1c2goe1xuICAgICAgICBrZXk6IGAke2l0ZW0uaWR9OiR7dGFyZ2V0SW5kZXh9YCxcbiAgICAgICAgaXRlbSxcbiAgICAgICAgaXRlbUluZGV4LFxuICAgICAgICB0YXJnZXRJbmRleCxcbiAgICAgICAgYmFzZUxlZnQsXG4gICAgICAgIGJhc2VUb3AsXG4gICAgICAgIGxlZnQ6IGJhc2VMZWZ0ICsgb3ZlcmxhcENvdW50ICogMTUsXG4gICAgICAgIHRvcDogYmFzZVRvcCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcblxuICByZXR1cm4gcG9zaXRpb25zXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdNYXJrZXJzKHsgYm9hcmRSZWYsIGl0ZW1zLCBvbk9wZW5QYW5lbCB9KSB7XG4gIGNvbnN0IFtwb3NpdGlvbnMsIHNldFBvc2l0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2FjdGl2ZUtleSwgc2V0QWN0aXZlS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGZyYW1lUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgcmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZFJlZi5jdXJyZW50LCBpdGVtcylcbiAgICBzZXRQb3NpdGlvbnMoKGN1cnJlbnQpID0+IHNhbWVQb3NpdGlvbnMoY3VycmVudCwgbmV4dCkgPyBjdXJyZW50IDogbmV4dClcbiAgfSwgW2JvYXJkUmVmLCBpdGVtc10pXG5cbiAgY29uc3Qgc2NoZWR1bGVSZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICBmcmFtZVJlZi5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBmcmFtZVJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgcmVmcmVzaCgpXG4gICAgfSlcbiAgfSwgW3JlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdChzY2hlZHVsZVJlZnJlc2gpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBvcHRpb25zID0geyBjYXB0dXJlOiB0cnVlLCBwYXNzaXZlOiB0cnVlIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIH1cbiAgfSwgW3NjaGVkdWxlUmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWN0aXZlS2V5ICYmICFwb3NpdGlvbnMuc29tZSgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KSkgc2V0QWN0aXZlS2V5KG51bGwpXG4gIH0sIFthY3RpdmVLZXksIHBvc2l0aW9uc10pXG5cbiAgY29uc3QgYWN0aXZlID0gcG9zaXRpb25zLmZpbmQoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSlcbiAgY29uc3QgYm9hcmRXaWR0aCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudFdpZHRoIHx8IDBcbiAgY29uc3QgYm9hcmRIZWlnaHQgPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgfHwgMFxuICBjb25zdCBidWJibGVMZWZ0ID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS5sZWZ0ICsgMTYsIGJvYXJkV2lkdGggLSAzMzYpKSA6IDBcbiAgY29uc3QgYnViYmxlVG9wID0gYWN0aXZlID8gTWF0aC5tYXgoMTIsIE1hdGgubWluKGFjdGl2ZS50b3AgKyAyNCwgYm9hcmRIZWlnaHQgLSAxODApKSA6IDBcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlcnNcIiBhcmlhLWxhYmVsPVwiXHU0RkVFXHU2NTM5XHU2ODA3XHU4QkIwXCI+XG4gICAgICB7cG9zaXRpb25zLm1hcCgocG9zaXRpb24pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YWN0aXZlS2V5ID09PSBwb3NpdGlvbi5rZXkgPyAnd2YtcmV2aWV3LW1hcmtlciBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1tYXJrZXInfVxuICAgICAgICAgIGtleT17cG9zaXRpb24ua2V5fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVx1RkYxQSR7UkVWSUVXX1RZUEVfTEFCRUxTW3Bvc2l0aW9uLml0ZW0udHlwZV19YH1cbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBwb3NpdGlvbi5sZWZ0LCB0b3A6IHBvc2l0aW9uLnRvcCB9fVxuICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIHNldEFjdGl2ZUtleSgoY3VycmVudCkgPT4gY3VycmVudCA9PT0gcG9zaXRpb24ua2V5ID8gbnVsbCA6IHBvc2l0aW9uLmtleSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgICB7YWN0aXZlID8gKFxuICAgICAgICA8YXNpZGVcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IGJ1YmJsZUxlZnQsIHRvcDogYnViYmxlVG9wIH19XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke2FjdGl2ZS5pdGVtSW5kZXggKyAxfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1oZWFkZXJcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRpdGxlXCI+XG4gICAgICAgICAgICAgIHthY3RpdmUuaXRlbUluZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbYWN0aXZlLml0ZW0udHlwZV19XG4gICAgICAgICAgICA8L3N0cm9uZz5cbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWNsb3NlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZUtleShudWxsKX0+XHU1MTczXHU5NUVEPC9idXR0b24+XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWluc3RydWN0aW9uXCI+XG4gICAgICAgICAgICB7YWN0aXZlLml0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9XG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXRhcmdldHNcIj5cbiAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGFjdGl2ZS5pdGVtKS5tYXAoKHRhcmdldCkgPT4gKFxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItc2VsZWN0b3JcIiBrZXk9e3RhcmdldC5zZWxlY3Rvcn0+e3RhcmdldC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItbW9yZVwiXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0QWN0aXZlS2V5KG51bGwpXG4gICAgICAgICAgICAgIG9uT3BlblBhbmVsPy4oKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTY3RTVcdTc3MEJcdTY2RjRcdTU5MUFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9hc2lkZT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiY29uc3QgTEFVTkNIRVJfU0laRSA9IDQ4XG5jb25zdCBMQVVOQ0hFUl9NQVJHSU4gPSAyMFxuY29uc3QgRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGNsYW1wKHZhbHVlLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgodmFsdWUsIG1pbiksIE1hdGgubWF4KG1pbiwgbWF4KSlcbn1cblxuZnVuY3Rpb24gY2xhbXBQb3NpdGlvbihib2FyZCwgcG9zaXRpb24pIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIHBvc2l0aW9uXG4gIHJldHVybiB7XG4gICAgeDogY2xhbXAocG9zaXRpb24ueCwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICAgIHk6IGNsYW1wKHBvc2l0aW9uLnksIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gIH1cbn1cblxuZnVuY3Rpb24gZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSB7XG4gIHJldHVybiBjbGFtcFBvc2l0aW9uKGJvYXJkLCB7XG4gICAgeDogYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICAgIHk6IGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdmFsdWUgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlS2V5KSlcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlPy54KSAmJiBOdW1iZXIuaXNGaW5pdGUodmFsdWU/LnkpKSByZXR1cm4gdmFsdWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gbG9jYWxTdG9yYWdlIG1heSBiZSB1bmF2YWlsYWJsZSBmb3IgYSBkaXJlY3RseSBvcGVuZWQgbG9jYWwgZmlsZS5cbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5mdW5jdGlvbiBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb24pIHtcbiAgdHJ5IHtcbiAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZUtleSwgSlNPTi5zdHJpbmdpZnkocG9zaXRpb24pKVxuICB9IGNhdGNoIHtcbiAgICAvLyBLZWVwaW5nIHRoZSBsYXVuY2hlciBkcmFnZ2FibGUgaXMgbW9yZSBpbXBvcnRhbnQgdGhhbiBwZXJzaXN0ZW5jZS5cbiAgfVxufVxuXG5mdW5jdGlvbiBDb21tZW50SWNvbigpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgPHBhdGggZD1cIk01IDQuNWgxNGEyIDIgMCAwIDEgMiAydjhhMiAyIDAgMCAxLTIgMmgtNmwtNC41IDN2LTNINWEyIDIgMCAwIDEtMi0ydi04YTIgMiAwIDAgMSAyLTJaXCIgLz5cbiAgICAgIDxwYXRoIGQ9XCJNNy41IDEwLjVoOVwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld0xhdW5jaGVyKHsgYm9hcmRSZWYsIGNvdW50LCBwcm9qZWN0TmFtZSwgb25PcGVuIH0pIHtcbiAgY29uc3Qgc3RvcmFnZUtleSA9IGB3Zi1yZXZpZXctbGF1bmNoZXItcG9zaXRpb246JHtwcm9qZWN0TmFtZX1gXG4gIGNvbnN0IFtwb3NpdGlvbiwgc2V0UG9zaXRpb25dID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBwb3NpdGlvblJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdXBwcmVzc0NsaWNrUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuXG4gIGNvbnN0IHVwZGF0ZVBvc2l0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHQpID0+IHtcbiAgICBjb25zdCBjbGFtcGVkID0gY2xhbXBQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50LCBuZXh0KVxuICAgIHBvc2l0aW9uUmVmLmN1cnJlbnQgPSBjbGFtcGVkXG4gICAgc2V0UG9zaXRpb24oY2xhbXBlZClcbiAgICByZXR1cm4gY2xhbXBlZFxuICB9LCBbYm9hcmRSZWZdKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYm9hcmQgPSBib2FyZFJlZi5jdXJyZW50XG4gICAgaWYgKCFib2FyZCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHVwZGF0ZVBvc2l0aW9uKHJlYWRQb3NpdGlvbihzdG9yYWdlS2V5KSB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuXG4gICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IHVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcbiAgICAgIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBuZXh0KVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICB9LCBbYm9hcmRSZWYsIHN0b3JhZ2VLZXksIHVwZGF0ZVBvc2l0aW9uXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBkcmFnLm1vdmVkXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICAgIGlmIChwb3NpdGlvblJlZi5jdXJyZW50KSBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgcG9zaXRpb25SZWYuY3VycmVudClcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gIH1cblxuICBpZiAoY291bnQgPD0gMCkgcmV0dXJuIG51bGxcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtkcmFnZ2luZyA/ICd3Zi1yZXZpZXctbGF1bmNoZXIgaXMtZHJhZ2dpbmcnIDogJ3dmLXJldmlldy1sYXVuY2hlcid9XG4gICAgICBzdHlsZT17cG9zaXRpb24gPyB7IGxlZnQ6IHBvc2l0aW9uLngsIHRvcDogcG9zaXRpb24ueSB9IDogeyByaWdodDogTEFVTkNIRVJfTUFSR0lOLCBib3R0b206IExBVU5DSEVSX01BUkdJTiB9fVxuICAgICAgYXJpYS1sYWJlbD17YFx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVx1RkYwQ1x1NTE3MSAke2NvdW50fSBcdTY3NjFcdTRGRUVcdTY1MzlgfVxuICAgICAgZGF0YS10b29sdGlwPVwiXHU1QzU1XHU1RjAwXHU4QkM0XHU4QkJBXCJcbiAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmRSZWYuY3VycmVudClcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgIG1vdmVkOiBmYWxzZSxcbiAgICAgICAgfVxuICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgaWYgKCFkcmFnLm1vdmVkICYmIE1hdGguaHlwb3QoZGVsdGFYLCBkZWx0YVkpIDwgRFJBR19USFJFU0hPTEQpIHJldHVyblxuICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICB1cGRhdGVQb3NpdGlvbih7IHg6IGRyYWcub3JpZ2luLnggKyBkZWx0YVgsIHk6IGRyYWcub3JpZ2luLnkgKyBkZWx0YVkgfSlcbiAgICAgIH19XG4gICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgaWYgKHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCkge1xuICAgICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgb25PcGVuKClcbiAgICAgIH19XG4gICAgPlxuICAgICAgPENvbW1lbnRJY29uIC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItY291bnRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj57Y291bnR9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG4iLCAiZXhwb3J0IGNvbnN0IFVOU0FWRURfUkVWSUVXX01FU1NBR0UgPSAnXHU0RkVFXHU2NTM5XHU1MTg1XHU1QkI5XHU1QzFBXHU2NzJBXHU0RkREXHU1QjU4XHVGRjBDXHU3OUJCXHU1RjAwXHU5ODc1XHU5NzYyXHU1NDBFXHU0RjFBXHU0RTIyXHU1OTMxXHUzMDAyXHU2NjJGXHU1NDI2XHU3RUU3XHU3RUVEXHVGRjFGJ1xuXG5leHBvcnQgZnVuY3Rpb24gcHJldmVudFVuc2F2ZWRSZXZpZXdFeGl0KGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgZXZlbnQucmV0dXJuVmFsdWUgPSBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG4gIHJldHVybiBVTlNBVkVEX1JFVklFV19NRVNTQUdFXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IENhbnZhc01vZGUsIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayB9IGZyb20gJy4vQ2FudmFzTW9kZS5qc3gnXG5pbXBvcnQgeyBEZW1vTW9kZSB9IGZyb20gJy4vRGVtb01vZGUuanN4J1xuaW1wb3J0IHsgcmVzb2x2ZUV4cGFuZFRhcmdldHMgfSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7IGV4cG9ydFNlbGVjdGVkIH0gZnJvbSAnLi9leHBvcnQuanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHsgY2xhbXBTY2FsZSB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFJldmlld1BhbmVsIH0gZnJvbSAnLi9SZXZpZXdQYW5lbC5qc3gnXG5pbXBvcnQgeyBSZXZpZXdNYXJrZXJzIH0gZnJvbSAnLi9SZXZpZXdNYXJrZXJzLmpzeCdcbmltcG9ydCB7IFJldmlld0xhdW5jaGVyIH0gZnJvbSAnLi9SZXZpZXdMYXVuY2hlci5qc3gnXG5pbXBvcnQgeyBkZXNjcmliZVJldmlld0VsZW1lbnQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7IHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdCB9IGZyb20gJy4vYmVmb3JlLXVubG9hZC5qcydcblxuY29uc3QgVklFV1BPUlRfTEFCRUxTID0ge1xuICBtb2JpbGU6ICdcdTYyNEJcdTY3M0EnLFxuICBkZXNrdG9wOiAnXHU2ODRDXHU5NzYyJyxcbn1cblxuZnVuY3Rpb24gWm9vbUNvbnRyb2xzKHsgc2NhbGUsIHNldFNjYWxlLCBvblJlc2V0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXpvb20tY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU3RjI5XHU1QzBGXCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlIC0gMC4xKSl9Pi08L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXpvb20tdmFsdWVcIj57TWF0aC5yb3VuZChzY2FsZSAqIDEwMCl9JTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU2NTNFXHU1OTI3XCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlICsgMC4xKSl9Pis8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU5MUNEXHU3RjZFXHU3RjI5XHU2NTNFXCIgb25DbGljaz17b25SZXNldH0+XHU1OTBEXHU0RjREPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEx1Y2lkZSBcdTk4Q0VcdTY4M0NcdTVERTVcdTUxNzdcdTY4MEZcdTU2RkVcdTY4MDdcdTMwMDJcdTRFQzVcdTc1MjhcdTRFOEVcdTY4NDZcdTY3QjYgY2hyb21lXHUzMDAyICovXG5mdW5jdGlvbiBUb29sYmFySWNvbih7IG5hbWUgfSkge1xuICBjb25zdCBwYXRocyA9IHtcbiAgICBlZGl0OiA8PjxwYXRoIGQ9XCJNMTIgMjBoOVwiIC8+PHBhdGggZD1cIk0xNi41IDMuNWEyLjEyIDIuMTIgMCAwIDEgMyAzTDcgMTlsLTQgMSAxLTRaXCIgLz48Lz4sXG4gICAgZnVsbHNjcmVlbjogPD48cGF0aCBkPVwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M1wiIC8+PHBhdGggZD1cIk0yMSA4VjVhMiAyIDAgMCAwLTItMmgtM1wiIC8+PHBhdGggZD1cIk0zIDE2djNhMiAyIDAgMCAwIDIgMmgzXCIgLz48cGF0aCBkPVwiTTE2IDIxaDNhMiAyIDAgMCAwIDItMnYtM1wiIC8+PC8+LFxuICAgIGV4cGFuZDogPD48cGF0aCBkPVwibTcgMTUgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDkgNS01IDUgNVwiIC8+PC8+LFxuICAgIGNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJtNyAyMCA1LTUgNSA1XCIgLz48cGF0aCBkPVwibTcgNCA1IDUgNS01XCIgLz48Lz4sXG4gICAgZG93bmxvYWQ6IDw+PHBhdGggZD1cIk0xMiAzdjEyXCIgLz48cGF0aCBkPVwibTcgMTAgNSA1IDUtNVwiIC8+PHBhdGggZD1cIk01IDIxaDE0XCIgLz48Lz4sXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3BhdGhzW25hbWVdfVxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBcdTdFQkZcdTY4NDZcdTk1MDFcdUZGMUFcdTVGMDBcdTk1MDE9XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjBDXHU5NUVEXHU5NTAxPVx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwMlx1Njg0Nlx1NjdCNiBjaHJvbWUgXHU1M0VGXHU3NTI4IFNWR1x1MzAwMiAqL1xuZnVuY3Rpb24gTG9ja0ljb24oeyBvcGVuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLWxvY2staWNvblwiIHZpZXdCb3g9XCIwIDAgMTQgMTRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICAvLyBcdTVGMDBcdTk1MDFcdUZGMUFcdTY4ODFcdTRFQ0VcdTVERTZcdTRGQTdcdTdBQ0JcdThENzdcdTU0MEVcdTU0MTFcdTUzRjNcdTRFMEFcdTYwQUNcdTdBN0FcdUZGMENcdTUzRjNcdTgxMUFcdTRFMERcdTYyNjNcdTU2REVcdTk1MDFcdTRGNTNcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjM1YTIuNzUgMi43NSAwIDAgMSA1LjM1LS4yXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC41YTIuNzUgMi43NSAwIDAgMSA1LjUgMHYyLjI1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8cmVjdCB4PVwiMi43NVwiIHk9XCI2Ljc1XCIgd2lkdGg9XCI4LjVcIiBoZWlnaHQ9XCI1LjVcIiByeD1cIjEuMjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogaW50ZXJhY3RpdmU9dHJ1ZSBcdTY2M0VcdTc5M0FcdTVGMDBcdTk1MDFcdTMwMENcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMERcdUZGMUJmYWxzZSBcdTRFM0FcdTRFMEFcdTk1MDFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0UgKi9cbmZ1bmN0aW9uIEludGVyYWN0aW9uTG9jayh7IGludGVyYWN0aXZlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2ludGVyYWN0aXZlID8gJ3dmLWludGVyYWN0aW9uLWxvY2snIDogJ3dmLWludGVyYWN0aW9uLWxvY2sgaXMtbG9ja2VkJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgYXJpYS1wcmVzc2VkPXshaW50ZXJhY3RpdmV9XG4gICAgICB0aXRsZT17aW50ZXJhY3RpdmVcbiAgICAgICAgPyAnXHU1RjUzXHU1MjREXHU1M0VGXHU0RUE0XHU0RTkyXHU5ODc1XHU5NzYyXHUzMDAyXHU3MEI5XHU1MUZCXHU5NTAxXHU0RjRGXHU1NDBFXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHU3NTNCXHU1RTAzXHVGRjBDXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGXHU3QTdBXHU2ODNDXHU0RTM0XHU2NUY2XHU5NTAxXHU0RjRGJ1xuICAgICAgICA6ICdcdTVGNTNcdTUyNERcdTVERjJcdTk1MDFcdTRGNEZcdTMwMDJcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTk4NzVcdTk3NjJcdTUxODVcdTcwQjlcdTUxRkJcdTRFMEVcdTZFREFcdTUyQThcdTVERjJcdTc5ODFcdTc1MjhcdTMwMDJcdTcwQjlcdTUxRkJcdTYwNjJcdTU5MERcdTUzRUZcdTRFQTRcdTRFOTInfVxuICAgID5cbiAgICAgIDxMb2NrSWNvbiBvcGVuPXtpbnRlcmFjdGl2ZX0gLz5cbiAgICAgIDxzcGFuPntpbnRlcmFjdGl2ZSA/ICdcdTUzRUZcdTRFQTRcdTRFOTInIDogJ1x1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mid9PC9zcGFuPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkge1xuICByZXR1cm4gZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHwgbnVsbFxufVxuXG5mdW5jdGlvbiByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGVsKSB7XG4gIGNvbnN0IHJlcXVlc3QgPSBlbCAmJiAoZWwucmVxdWVzdEZ1bGxzY3JlZW4gfHwgZWwud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4pXG4gIGlmICghcmVxdWVzdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVxdWVzdC5jYWxsKGVsKSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmZ1bmN0aW9uIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKSB7XG4gIGlmICghZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIGNvbnN0IGV4aXQgPSBkb2N1bWVudC5leGl0RnVsbHNjcmVlbiB8fCBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlblxuICBpZiAoIWV4aXQpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGV4aXQuY2FsbChkb2N1bWVudCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm9hcmQoeyBwcm9qZWN0IH0pIHtcbiAgY29uc3Qge1xuICAgIG1vZGUsXG4gICAgc2V0TW9kZSxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydCxcbiAgICBlbnRyeUlkLFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIGN1cnJlbnRTY3JlZW5JZCxcbiAgICBjYW5Hb0JhY2ssXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBjb25zdCB2aWV3cG9ydE9wdGlvbnMgPSBPYmplY3Qua2V5cyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuXG4gIGNvbnN0IFtzZWxlY3RlZElkcywgc2V0U2VsZWN0ZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgKCkgPT4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpLFxuICApXG4gIGNvbnN0IFtjYW52YXNTY2FsZSwgc2V0Q2FudmFzU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9TY2FsZSwgc2V0RGVtb1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vVmlld1Jlc2V0S2V5LCBzZXREZW1vVmlld1Jlc2V0S2V5XSA9IFJlYWN0LnVzZVN0YXRlKDApXG4gIGNvbnN0IFtpbnRlcmFjdGl2ZSwgc2V0SW50ZXJhY3RpdmVdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3NwYWNlSGVsZCwgc2V0U3BhY2VIZWxkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbaG90c3BvdHNWaXNpYmxlLCBzZXRIb3RzcG90c1Zpc2libGVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBvcnRFcnJvciwgc2V0RXhwb3J0RXJyb3JdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2V4cG9ydGluZywgc2V0RXhwb3J0aW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRJZHMsIHNldEV4cGFuZGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+IG5ldyBTZXQoKSlcbiAgY29uc3QgW2ltbWVyc2l2ZSwgc2V0SW1tZXJzaXZlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgYm9hcmRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZiA9IFJlYWN0LnVzZVJlZihuZXcgU2V0KCkpXG4gIGNvbnN0IGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBjYW52YXNMb2NrZWQgPSAhaW50ZXJhY3RpdmUgfHwgc3BhY2VIZWxkXG4gIGNvbnN0IGFsbFNjcmVlbklkcyA9IHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKVxuICBjb25zdCBpc0RlbW8gPSBtb2RlID09PSAnZGVtbycgJiYgZGVtb0F2YWlsYWJsZVxuICBjb25zdCBhY3RpdmVTY2FsZSA9IGlzRGVtbyA/IGRlbW9TY2FsZSA6IGNhbnZhc1NjYWxlXG4gIGNvbnN0IHNldEFjdGl2ZVNjYWxlID0gaXNEZW1vID8gc2V0RGVtb1NjYWxlIDogc2V0Q2FudmFzU2NhbGVcblxuICBjb25zdCBjbGVhclJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgfVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucyhbXSlcbiAgfSwgW10pXG5cbiAgY29uc3Qgc2VsZWN0UmV2aWV3RWxlbWVudCA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50LCBzY3JlZW4sIGNvbnRlbnRSb290LCBvcHRpb25zID0ge30pID0+IHtcbiAgICBjb25zdCBwcmltYXJ5ID0gcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdXG4gICAgY29uc3QgYWN0aXZlU2NyZWVuID0gc2NyZWVuIHx8IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBwcmltYXJ5Py5zY3JlZW5JZClcbiAgICBjb25zdCBhY3RpdmVSb290ID0gY29udGVudFJvb3QgfHwgcHJpbWFyeT8uY29udGVudFJvb3RcbiAgICBpZiAoIWVsZW1lbnQgfHwgIWFjdGl2ZVNjcmVlbiB8fCAhYWN0aXZlUm9vdCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dFNlbGVjdGlvbiA9IGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBhY3RpdmVSb290LCBhY3RpdmVTY3JlZW4pXG4gICAgY29uc3QgYWRkaXRpdmUgPSByZXZpZXdNdWx0aVNlbGVjdCB8fCBvcHRpb25zLmFkZGl0aXZlXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG5cbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAob3B0aW9ucy5yZXBsYWNlRWxlbWVudCkge1xuICAgICAgICBvcHRpb25zLnJlcGxhY2VFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUob3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgaWYgKGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50ICYmIGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQubWFwKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQgPyBuZXh0U2VsZWN0aW9uIDogaXRlbSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFscmVhZHlTZWxlY3RlZCA9IGN1cnJlbnQuc29tZSgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBlbGVtZW50KVxuICAgICAgaWYgKCFhZGRpdGl2ZSkge1xuICAgICAgICBmb3IgKGNvbnN0IHNlbGVjdGVkRWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzZWxlY3RlZEVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgICAgfSBlbHNlIGlmIChhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KVxuICAgICAgfVxuXG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICByZXR1cm4gYWRkaXRpdmUgPyBbLi4uY3VycmVudCwgbmV4dFNlbGVjdGlvbl0gOiBbbmV4dFNlbGVjdGlvbl1cbiAgICB9KVxuICB9LCBbcHJvamVjdC5zY3JlZW5zLCByZXZpZXdNdWx0aVNlbGVjdCwgcmV2aWV3U2VsZWN0aW9uc10pXG5cbiAgY29uc3QgcmVtb3ZlUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBlbGVtZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKChjdXJyZW50KSA9PiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBlbGVtZW50KSlcbiAgfSwgW10pXG5cbiAgY29uc3QgY2xvc2VSZXZpZXcgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0UmV2aWV3RW5hYmxlZChmYWxzZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgfSwgW2NsZWFyUmV2aWV3U2VsZWN0aW9uXSlcblxuICBjb25zdCBob3ZlclJldmlld0JyZWFkY3J1bWIgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IGVsZW1lbnQgfHwgbnVsbFxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVSZXZpZXcgPSAoKSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHtcbiAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBzZXRJbnRlcmFjdGl2ZSh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gIH1cblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBhZGRSZXZpZXdJdGVtID0gKGl0ZW0pID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gW1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIHsgLi4uaXRlbSwgaWQ6IGByZXZpZXctJHtEYXRlLm5vdygpfS0ke2N1cnJlbnQubGVuZ3RoICsgMX1gIH0sXG4gICAgXSlcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld0l0ZW0gPSAoaWQpID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaWQgIT09IGlkKSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbiwgaG92ZXJSZXZpZXdCcmVhZGNydW1iLCBtb2RlLCB2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocmV2aWV3SXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgfSwgW3Jldmlld0l0ZW1zLmxlbmd0aF0pXG5cbiAgY29uc3QgZXhpdEltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRJbW1lcnNpdmUoZmFsc2UpXG4gICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZUJyb3dzZXJGdWxsc2NyZWVuID0gKCkgPT4ge1xuICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICBleGl0Qm9hcmRGdWxsc2NyZWVuKClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKG5ldyBTZXQoKSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBjb25zdCB0b2dnbGVFeHBhbmQgPSAoaWQpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGV4cGFuZFRhcmdldHMgPSAoc2hvdWxkRXhwYW5kKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxTY3JlZW5JZHMpXG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIHRhcmdldHMpIHtcbiAgICAgICAgaWYgKHNob3VsZEV4cGFuZCkgbmV4dC5hZGQoaWQpXG4gICAgICAgIGVsc2UgbmV4dC5kZWxldGUoaWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlICE9PSAnU3BhY2UnIHx8IGV2ZW50LnJlcGVhdCkgcmV0dXJuXG4gICAgICBjb25zdCB0YWcgPSBldmVudC50YXJnZXQgJiYgZXZlbnQudGFyZ2V0LnRhZ05hbWVcbiAgICAgIGlmICh0YWcgPT09ICdJTlBVVCcgfHwgdGFnID09PSAnVEVYVEFSRUEnIHx8IHRhZyA9PT0gJ1NFTEVDVCcgfHwgZXZlbnQudGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgc2V0U3BhY2VIZWxkKHRydWUpXG4gICAgfVxuICAgIGNvbnN0IHVwID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJykgc2V0U3BhY2VIZWxkKGZhbHNlKVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2RlbW8nKSBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH0sIFttb2RlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHN5bmMgPSAoKSA9PiBzZXRCcm93c2VyRnVsbHNjcmVlbighIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2Via2l0ZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgfVxuICB9LCBbXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaW1tZXJzaXZlKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3Qgb25LZXkgPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5rZXkgIT09ICdFc2NhcGUnKSByZXR1cm5cbiAgICAgIGlmIChnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm5cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHNldEltbWVyc2l2ZShmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleSlcbiAgfSwgW2ltbWVyc2l2ZV0pXG5cbiAgY29uc3QgZXhwb3J0SWRzID0gKGlkcykgPT4gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKGFzeW5jICgpID0+IHtcbiAgICBzZXRFeHBvcnRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NyZWVucyA9IGlkcy5tYXAoKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpZClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICB0aXRsZTogc2NyZWVuLnRpdGxlLFxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNjcmVlbi1pZD1cIiR7aWR9XCJdIC53Zi1zY3JlZW4tY29udGVudGApLFxuICAgICAgICAgIHZpZXdwb3J0LFxuICAgICAgICAgIGV4cGFuZGVkOiBleHBhbmRlZElkcy5oYXMoaWQpLFxuICAgICAgICAgIHByb2plY3ROYW1lOiBwcm9qZWN0Lm5hbWUsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBhd2FpdCBleHBvcnRTZWxlY3RlZChzY3JlZW5zKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRFeHBvcnRpbmcoZmFsc2UpXG4gICAgfVxuICB9LCBzZXRFeHBvcnRFcnJvcilcblxuICBjb25zdCByZXNldERlbW8gPSAoKSA9PiB7XG4gICAgcmVzZXQoKVxuICAgIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0RGVtb1ZpZXcgPSAoKSA9PiB7XG4gICAgc2V0RGVtb1ZpZXdSZXNldEtleSgodmFsdWUpID0+IHZhbHVlICsgMSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0QWN0aXZlVmlldyA9IGlzRGVtbyA/IHJlc2V0RGVtb1ZpZXcgOiAoKSA9PiBzZXRDYW52YXNTY2FsZSgxKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtib2FyZFJlZn1cbiAgICAgIGNsYXNzTmFtZT17YHdmLWJvYXJkJHtpbW1lcnNpdmUgPyAnIGlzLWltbWVyc2l2ZScgOiAnJ30ke3Jldmlld0VuYWJsZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgID5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW5hbWVcIj57cHJvamVjdC5uYW1lfTwvaDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcHJvamVjdC1tZXRhXCI+e3Byb2plY3Quc2NyZWVucy5sZW5ndGh9IFx1OTg3NTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHtkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RlLXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1NkEyMVx1NUYwRlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnY2FudmFzJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnY2FudmFzJyl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTc1M0JcdTY3N0ZcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e21vZGUgPT09ICdkZW1vJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnZGVtbycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1kZW1vLWVudHJ5XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ3Zi1kZW1vLWVudHJ5XCI+XHU1MTY1XHU1M0UzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIndmLWRlbW8tZW50cnlcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2VudHJ5SWR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZWxlY3RFbnRyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDlcdTYyRTlcdTZGMTRcdTc5M0FcdTUxNjVcdTUzRTNcdTk4NzVcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtzY3JlZW4uaWR9IHZhbHVlPXtzY3JlZW4uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCArIDF9LiB7c2NyZWVuLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17cmVzZXREZW1vfT5cdTkxQ0RcdTdGNkU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZGVtby1wYWdlLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgXHU1RjUzXHU1MjREXHVGRjFBXG4gICAgICAgICAgICAgICAge2N1cnJlbnRTY3JlZW5cbiAgICAgICAgICAgICAgICAgID8gYCR7cHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW4uaWQpICsgMX0uICR7Y3VycmVudFNjcmVlbi50aXRsZX0gXHUwMEI3ICR7Y3VycmVudFNjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgICAgICAgOiBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtyZXZpZXdFbmFibGVkID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3Jldmlld0VuYWJsZWQgPyAnXHU0RkVFXHU2NTM5XHU0RTJEJyA6ICdcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgdGl0bGU9XCJcdTRGRUVcdTY1MzlcdUZGMUFcdTcwQjlcdTkwMDlcdTk4NzVcdTk3NjJcdTgyODJcdTcwQjlcdTVFNzZcdTY1NzRcdTc0MDZcdTYyMTBcdTUzRUZcdTdGMTZcdThGOTFcdTc2ODQgQUkgXHU0RkVFXHU2NTM5IFByb21wdFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVSZXZpZXd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJlZGl0XCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1RkYxQVx1OTY5MFx1ODVDRlx1OTg3Nlx1NjgwRlx1NEUwRVx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIGNsb3NlUmV2aWV3KClcbiAgICAgICAgICAgICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZnVsbHNjcmVlblwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTVDNEY8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRTgnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZXhwYW5kXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NUM1NVx1NUYwMDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOCcgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiY29sbGFwc2VcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU2NTM2XHU4RDc3PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi10b29sYmFyLWljb24tYnV0dG9uLS1wcmltYXJ5XCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtleHBvcnRpbmcgfHwgc2VsZWN0ZWRJZHMuc2l6ZSA9PT0gMCB8fCBtb2RlID09PSAnZGVtbyd9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtleHBvcnRpbmcgPyAnXHU2QjYzXHU1NzI4XHU1QkZDXHU1MUZBJyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0RcdUZGMDgke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NVx1RkYwOWB9XG4gICAgICAgICAgICB0aXRsZT17ZXhwb3J0aW5nID8gJ1x1NUJGQ1x1NTFGQVx1NEUyRFx1MjAyNicgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEICR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1YH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cG9ydElkcyhbLi4uc2VsZWN0ZWRJZHNdKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImRvd25sb2FkXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1jb3VudFwiPntleHBvcnRpbmcgPyAnXHUyMDI2JyA6IHNlbGVjdGVkSWRzLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7ZXhwb3J0RXJyb3IgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntleHBvcnRFcnJvcn08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7aW1tZXJzaXZlID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWltbWVyc2l2ZS1jaHJvbWVcIiByb2xlPVwidG9vbGJhclwiIGFyaWEtbGFiZWw9XCJcdTZDODlcdTZENzhcdTYzQTdcdTRFRjZcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1RkYwOEVzY1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXtleGl0SW1tZXJzaXZlfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1OTAwMFx1NTFGQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXticm93c2VyRnVsbHNjcmVlbiA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgdGl0bGU9e2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1OTAwMFx1NTFGQVx1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHticm93c2VyRnVsbHNjcmVlbiA/ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYgT04nIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgc2NhbGU9e2FjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgb25SZXNldD17cmVzZXRBY3RpdmVWaWV3fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHtpc0RlbW8gPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuXG4gICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgPyAoXG4gICAgICAgIDxDYW52YXNNb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNlbGVjdGVkSWRzPXtzZWxlY3RlZElkc31cbiAgICAgICAgICBzZXRTZWxlY3RlZElkcz17c2V0U2VsZWN0ZWRJZHN9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgb25FeHBvcnRJZHM9e2V4cG9ydElkc31cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAvPlxuICAgICAgKSA6IChcbiAgICAgICAgPERlbW9Nb2RlXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBob3RzcG90c1Zpc2libGU9e2hvdHNwb3RzVmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgdmlld1Jlc2V0S2V5PXtkZW1vVmlld1Jlc2V0S2V5fVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAge3Jldmlld0VuYWJsZWQgPyAoXG4gICAgICAgIDxSZXZpZXdNYXJrZXJzIGJvYXJkUmVmPXtib2FyZFJlZn0gaXRlbXM9e3Jldmlld0l0ZW1zfSBvbk9wZW5QYW5lbD17b3BlblJldmlld1BhbmVsfSAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8UmV2aWV3TGF1bmNoZXJcbiAgICAgICAgYm9hcmRSZWY9e2JvYXJkUmVmfVxuICAgICAgICBjb3VudD17cmV2aWV3SXRlbXMubGVuZ3RofVxuICAgICAgICBwcm9qZWN0TmFtZT17cHJvamVjdC5uYW1lfVxuICAgICAgICBvbk9wZW49e29wZW5SZXZpZXdQYW5lbH1cbiAgICAgIC8+XG4gICAgICB7cmV2aWV3RW5hYmxlZCAmJiByZXZpZXdQYW5lbFZpc2libGUgPyAoXG4gICAgICAgIDxSZXZpZXdQYW5lbFxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgc2VsZWN0aW9ucz17cmV2aWV3U2VsZWN0aW9uc31cbiAgICAgICAgICBtdWx0aVNlbGVjdD17cmV2aWV3TXVsdGlTZWxlY3R9XG4gICAgICAgICAgaXRlbXM9e3Jldmlld0l0ZW1zfVxuICAgICAgICAgIG9uVG9nZ2xlTXVsdGlTZWxlY3Q9eygpID0+IHNldFJldmlld011bHRpU2VsZWN0KCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICBvblNlbGVjdEVsZW1lbnQ9eyhlbGVtZW50KSA9PiBzZWxlY3RSZXZpZXdFbGVtZW50KGVsZW1lbnQsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICAgIHJlcGxhY2VFbGVtZW50OiByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV0/LmVsZW1lbnQsXG4gICAgICAgICAgfSl9XG4gICAgICAgICAgb25Ib3ZlckVsZW1lbnQ9e2hvdmVyUmV2aWV3QnJlYWRjcnVtYn1cbiAgICAgICAgICBvblJlbW92ZVNlbGVjdGlvbj17cmVtb3ZlUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQ2xlYXJTZWxlY3Rpb249e2NsZWFyUmV2aWV3U2VsZWN0aW9ufVxuICAgICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgICBvblJlbW92ZUl0ZW09e3JlbW92ZVJldmlld0l0ZW19XG4gICAgICAgICAgb25DbG9zZT17Y2xvc2VSZXZpZXd9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImZ1bmN0aW9uIGZhaWwocGF0aCwgbWVzc2FnZSkge1xuICB0aHJvdyBuZXcgRXJyb3IoYCR7cGF0aH0gJHttZXNzYWdlfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVByb2plY3QocHJvamVjdCkge1xuICBpZiAoIXByb2plY3QgfHwgdHlwZW9mIHByb2plY3QgIT09ICdvYmplY3QnKSBmYWlsKCdwcm9qZWN0JywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgaWYgKCFwcm9qZWN0LnZpZXdwb3J0cyB8fCB0eXBlb2YgcHJvamVjdC52aWV3cG9ydHMgIT09ICdvYmplY3QnKSB7XG4gICAgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgY29uc3Qgdmlld3BvcnRFbnRyaWVzID0gT2JqZWN0LmVudHJpZXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGlmICh2aWV3cG9ydEVudHJpZXMubGVuZ3RoID09PSAwKSBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHZpZXdwb3J0JylcbiAgZm9yIChjb25zdCBba2V5LCB2aWV3cG9ydF0gb2Ygdmlld3BvcnRFbnRyaWVzKSB7XG4gICAgaWYgKCF2aWV3cG9ydCB8fCB0eXBlb2Ygdmlld3BvcnQgIT09ICdvYmplY3QnKSBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX1gLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uIG9mIFsnd2lkdGgnLCAnaGVpZ2h0J10pIHtcbiAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHZpZXdwb3J0W2RpbWVuc2lvbl0pIHx8IHZpZXdwb3J0W2RpbWVuc2lvbl0gPD0gMCkge1xuICAgICAgICBmYWlsKGBwcm9qZWN0LnZpZXdwb3J0cy4ke2tleX0uJHtkaW1lbnNpb259YCwgJ211c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQpKSB7XG4gICAgZmFpbCgncHJvamVjdC5kZWZhdWx0Vmlld3BvcnQnLCBgcmVmZXJlbmNlcyBtaXNzaW5nIHZpZXdwb3J0IFwiJHtwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydH1cImApXG4gIH1cbiAgaWYgKCFBcnJheS5pc0FycmF5KHByb2plY3Quc2NyZWVucykgfHwgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIGZhaWwoJ3Byb2plY3Quc2NyZWVucycsICdtdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIHNjcmVlbicpXG4gIH1cblxuICBjb25zdCBpZHMgPSBuZXcgU2V0KClcbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBwYXRoID0gYHByb2plY3Quc2NyZWVuc1ske2luZGV4fV1gXG4gICAgaWYgKCFzY3JlZW4gfHwgdHlwZW9mIHNjcmVlbiAhPT0gJ29iamVjdCcpIGZhaWwocGF0aCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5pZCAhPT0gJ3N0cmluZycgfHwgIS9eW2EtejAtOS1dKyQvLnRlc3Qoc2NyZWVuLmlkKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5pZGAsICdtdXN0IG1hdGNoIC9eW2EtejAtOS1dKyQvJylcbiAgICB9XG4gICAgaWYgKGlkcy5oYXMoc2NyZWVuLmlkKSkgZmFpbChgJHtwYXRofS5pZGAsIGBpcyBkdXBsaWNhdGUgXCIke3NjcmVlbi5pZH1cImApXG4gICAgaWRzLmFkZChzY3JlZW4uaWQpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uY29tcG9uZW50ICE9PSAnZnVuY3Rpb24nKSBmYWlsKGAke3BhdGh9LmNvbXBvbmVudGAsICdtdXN0IGJlIGEgZnVuY3Rpb24nKVxuICAgIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW4ubGlua3MpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmxpbmtzYCwgJ211c3QgYmUgYW4gYXJyYXknKVxuICAgIH1cbiAgfSlcblxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBzY3JlZW5JbmRleCkgPT4ge1xuICAgIHNjcmVlbi5saW5rcy5mb3JFYWNoKCh0YXJnZXQsIGxpbmtJbmRleCkgPT4ge1xuICAgICAgaWYgKCFpZHMuaGFzKHRhcmdldCkpIHtcbiAgICAgICAgZmFpbChcbiAgICAgICAgICBgcHJvamVjdC5zY3JlZW5zWyR7c2NyZWVuSW5kZXh9XS5saW5rc1ske2xpbmtJbmRleH1dYCxcbiAgICAgICAgICBgcmVmZXJlbmNlcyBtaXNzaW5nIHNjcmVlbiBcIiR7dGFyZ2V0fVwiYCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcblxuZXhwb3J0IHsgZmluZEZsb3dUYXJnZXRJZCwgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi9mbG93LXRhcmdldC5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAnZGF0YS1mbG93LXRvJzogdG8gfHwgdW5kZWZpbmVkLFxuICAgIG9uQ2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgaWYgKHRvKSBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gICAgICBpZiAob25DbGljaykgb25DbGljayhldmVudClcbiAgICAgIGlmICghZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAmJiB0bykgbmF2aWdhdGUodG8pXG4gICAgfSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaykge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZnVuY3Rpb24gam9pbkNsYXNzKGJhc2UsIGV4dHJhKSB7XG4gIHJldHVybiBleHRyYSA/IGAke2Jhc2V9ICR7ZXh0cmF9YCA6IGJhc2Vcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpIHtcbiAgY29uc3QgdmFsdWUgPVxuICAgIGNvbHVtbnMgJiYgdHlwZW9mIGNvbHVtbnMgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGNvbHVtbnMpXG4gICAgICA/IGNvbHVtbnNbdmlld3BvcnRLZXldXG4gICAgICA6IGNvbHVtbnNcbiAgaWYgKE51bWJlci5pc0ludGVnZXIodmFsdWUpICYmIHZhbHVlID4gMCkgcmV0dXJuIGByZXBlYXQoJHt2YWx1ZX0sIG1pbm1heCgwLCAxZnIpKWBcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUudHJpbSgpKSByZXR1cm4gdmFsdWVcbiAgdGhyb3cgbmV3IEVycm9yKCdHcmlkIGNvbHVtbnMgbXVzdCByZXNvbHZlIHRvIGEgcG9zaXRpdmUgaW50ZWdlciBvciBub24tZW1wdHkgQ1NTIHN0cmluZycpXG59XG5cbmZ1bmN0aW9uIHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiB7XG4gICAgY2xhc3NOYW1lU3VmZml4OiB0byA/ICcgd2YtaW50ZXJhY3RpdmUnIDogJycsXG4gICAgcm9sZTogdG8gPyAnbGluaycgOiByZXN0LnJvbGUsXG4gICAgdGFiSW5kZXg6IHRvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4LFxuICAgIGZsb3csXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJveCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtYm94JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17eyAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdyh7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ3JvdycsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2Ytcm93JHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29sdW1uKHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1jb2x1bW4ke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBHcmlkKHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIGNvbHVtbnMgPSAxLCBnYXAgPSAwLCB0bywgb25DbGljaywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgdmlld3BvcnRLZXkgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2dyaWQnLFxuICAgIGdyaWRUZW1wbGF0ZUNvbHVtbnM6IHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSxcbiAgICBnYXAsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtZ3JpZCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gSGVhZGluZyh7IGxldmVsID0gMiwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgdGFnID0gYGgke01hdGgubWluKDYsIE1hdGgubWF4KDEsIGxldmVsKSl9YFxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudCh0YWcsIHsgY2xhc3NOYW1lOiBgd2YtaGVhZGluZyAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHQoeyBhcyA9ICdwJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoYXMsIHsgY2xhc3NOYW1lOiBgd2YtdGV4dCAke2NsYXNzTmFtZX1gLnRyaW0oKSwgLi4ucmVzdCB9LCBjaGlsZHJlbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhcmQoeyB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2FyZCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhZGdlKHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzcGFuIGNsYXNzTmFtZT17YHdmLWJhZGdlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc3Bhbj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF2YXRhcih7IHNpemUgPSA0MCwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYXZhdGFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyB3aWR0aDogc2l6ZSwgaGVpZ2h0OiBzaXplLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gSW1hZ2VQbGFjZWhvbGRlcih7XG4gIHdpZHRoID0gJzEwMCUnLFxuICBoZWlnaHQgPSAxNjAsXG4gIGJvcmRlclJhZGl1cyA9IDAsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICBzdHlsZSxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWltYWdlLXBsYWNlaG9sZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgIHN0eWxlPXt7IHdpZHRoLCBoZWlnaHQsIGJvcmRlclJhZGl1cywgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXBsYWNlaG9sZGVyLWJsb2NrXCIgLz5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBCdXR0b24oeyB0bywgb25DbGljaywgdmFyaWFudCA9ICdkZWZhdWx0JywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1idXR0b24gd2YtYnV0dG9uLSR7dmFyaWFudH0gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dElucHV0KHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPGlucHV0IGNsYXNzTmFtZT17YHdmLWlucHV0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB0eXBlPVwidGV4dFwiIHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dEFyZWEoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8dGV4dGFyZWEgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2YtdGV4dGFyZWEgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KHsgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxzZWxlY3QgY2xhc3NOYW1lPXtgd2YtaW5wdXQgd2Ytc2VsZWN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+e2NoaWxkcmVufTwvc2VsZWN0PlxufVxuXG5mdW5jdGlvbiBDaG9pY2UoeyB0eXBlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxsYWJlbCBjbGFzc05hbWU9e2B3Zi1jaG9pY2UgJHtjbGFzc05hbWV9YC50cmltKCl9PlxuICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIndmLWNob2ljZS1pbnB1dFwiIHR5cGU9e3R5cGV9IHsuLi5yZXN0fSAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2hvaWNlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICA8L2xhYmVsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDaGVja2JveChwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwiY2hlY2tib3hcIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSYWRpbyhwcm9wcykge1xuICByZXR1cm4gPENob2ljZSB0eXBlPVwicmFkaW9cIiB7Li4ucHJvcHN9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2dnbGUoeyBjaGVja2VkID0gZmFsc2UsIG9uQ2hhbmdlLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgcm9sZT1cInN3aXRjaFwiXG4gICAgICBhcmlhLWNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi10b2dnbGUgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IG9uQ2hhbmdlPy4oIWNoZWNrZWQsIGV2ZW50KX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10cmFja1wiPjxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS10aHVtYlwiIC8+PC9zcGFuPlxuICAgICAge2xhYmVsID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBGb3JtRmllbGQoeyBsYWJlbCwgaHRtbEZvciwgaGludCwgZXJyb3IsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1mb3JtLWZpZWxkICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtZmllbGQtbGFiZWxcIiBodG1sRm9yPXtodG1sRm9yfT57bGFiZWx9PC9sYWJlbD5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICAgIHtoaW50ICYmICFlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWhpbnRcIj57aGludH08L3NwYW4+IDogbnVsbH1cbiAgICAgIHtlcnJvciA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWZpZWxkLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2Vycm9yfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGNyZWF0ZUZsb3dQcm9wcyB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFBhZ2VIZWFkZXIoeyB0aXRsZSwgdGl0bGVJZCwgc3VidGl0bGUsIHN1YnRpdGxlSWQsIGFjdGlvbnMsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8aGVhZGVyIGNsYXNzTmFtZT17YHdmLXBhZ2UtaGVhZGVyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtaGVhZGVyLWNvcHlcIj5cbiAgICAgICAgPGgxIGlkPXt0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXRpdGxlXCI+e3RpdGxlfTwvaDE+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxwIGlkPXtzdWJ0aXRsZUlkfSBjbGFzc05hbWU9XCJ3Zi1wYWdlLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvcD4gOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7YWN0aW9ucyA/IDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1hY3Rpb25zXCI+e2FjdGlvbnN9PC9kaXY+IDogbnVsbH1cbiAgICA8L2hlYWRlcj5cbiAgKVxufVxuXG5mdW5jdGlvbiBOYXZpZ2F0aW9uTGlzdCh7IGFzLCBpdGVtcywgYWN0aXZlSWQsIGNsYXNzTmFtZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuICAgIGFzLFxuICAgIHsgY2xhc3NOYW1lLCAuLi5yZXN0IH0sXG4gICAgaXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtbmF2LWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi1uYXYtaXRlbSd9XG4gICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICA+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgKSksXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNpZGVOYXYoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxOYXZpZ2F0aW9uTGlzdFxuICAgICAgYXM9XCJuYXZcIlxuICAgICAgaXRlbXM9e2l0ZW1zfVxuICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUlkfVxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc2lkZS1uYXYgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJCYXIoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtdGFiLWJhciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICAgIGNsYXNzTmFtZT17aXRlbS50byA9PT0gYWN0aXZlSWQgPyAnd2YtdGFiLWl0ZW0gaXMtYWN0aXZlJyA6ICd3Zi10YWItaXRlbSd9XG4gICAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyZWFkY3J1bWJzKHsgaXRlbXMgPSBbXSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gKFxuICAgIDxuYXYgY2xhc3NOYW1lPXtgd2YtYnJlYWRjcnVtYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IGFyaWEtbGFiZWw9XCJCcmVhZGNydW1ic1wiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2Ake2l0ZW0ubGFiZWx9LSR7aW5kZXh9YH0+XG4gICAgICAgICAge2luZGV4ID4gMCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItZGl2aWRlclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICB7aXRlbS50byA/IChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1saW5rXCIgdHlwZT1cImJ1dHRvblwiIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9PlxuICAgICAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWN1cnJlbnRcIj57aXRlbS5sYWJlbH08L3NwYW4+fVxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgKSl9XG4gICAgPC9uYXY+XG4gIClcbn1cblxuLyoqIFx1NzlGQlx1NTJBOFx1N0FFRlx1NjU3NFx1NUM0Rlx1NThGM1x1RkYxQVx1NTE4NVx1NUJCOVx1NTMzQVx1NTNFRlx1NkVEQVx1RkYwQ1RhYkJhciBcdThEMzRcdTVFOTVcdTMwMDJ0YWJzIC8gYWN0aXZlSWQgXHU0RTBFIFRhYkJhciBcdTc2RjhcdTU0MENcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVTaGVsbCh7IGNoaWxkcmVuLCB0YWJzID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tb2JpbGUtc2hlbGwgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cIndmLW1vYmlsZS1zaGVsbC1ib2R5XCI+e2NoaWxkcmVufTwvbWFpbj5cbiAgICAgIHt0YWJzLmxlbmd0aCA+IDAgPyA8VGFiQmFyIGl0ZW1zPXt0YWJzfSBhY3RpdmVJZD17YWN0aXZlSWR9IC8+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBDZWxsKHsgdG8sIG9uQ2xpY2ssIHRpdGxlLCBzdWJ0aXRsZSwgdmFsdWUsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNlbGwgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jZWxsLW1haW5cIj5cbiAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1jZWxsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICB7c3VidGl0bGUgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXN1YnRpdGxlXCI+e3N1YnRpdGxlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L2Rpdj5cbiAgICAgIHt2YWx1ZSAhPT0gdW5kZWZpbmVkID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC12YWx1ZVwiPnt2YWx1ZX08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGF0YVRhYmxlKHsgY29sdW1ucyA9IFtdLCByb3dzID0gW10sIGdldFJvd0tleSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFibGUtd3JhcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cIndmLXRhYmxlXCI+XG4gICAgICAgIDx0aGVhZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkXCI+XG4gICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRlci1yb3dcIj5cbiAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkaW5nXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+e2NvbHVtbi5sYWJlbH08L3RoPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90aGVhZD5cbiAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cIndmLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICB7cm93cy5tYXAoKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0tleSA9IGdldFJvd0tleSA/IGdldFJvd0tleShyb3cpIDogcm93LmlkIHx8IGluZGV4XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtcm93XCIgZGF0YS13Zi1rZXk9e3Jvd0tleX0ga2V5PXtyb3dLZXl9PlxuICAgICAgICAgICAgICAgIHtjb2x1bW5zLm1hcCgoY29sdW1uKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwid2YtdGFibGUtY2VsbFwiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9PlxuICAgICAgICAgICAgICAgICAgICB7Y29sdW1uLnJlbmRlciA/IGNvbHVtbi5yZW5kZXIocm93W2NvbHVtbi5rZXldLCByb3cpIDogcm93W2NvbHVtbi5rZXldfVxuICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYnMoeyBpdGVtcyA9IFtdLCBhY3RpdmVJZCwgb25DaGFuZ2UsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYnMgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJ0YWJsaXN0XCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtdGFiLWNvbnRyb2xcIlxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIHJvbGU9XCJ0YWJcIlxuICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e2l0ZW0uaWQgPT09IGFjdGl2ZUlkfVxuICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkNoYW5nZT8uKGl0ZW0uaWQpfVxuICAgICAgICA+XG4gICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSl9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0ZXBzKHtcbiAgaXRlbXMgPSBbXSxcbiAgY3VycmVudCA9IDAsXG4gIGRpcmVjdGlvbiA9ICdob3Jpem9udGFsJyxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgdmVydGljYWwgPSBkaXJlY3Rpb24gPT09ICd2ZXJ0aWNhbCdcbiAgcmV0dXJuIChcbiAgICA8b2xcbiAgICAgIGNsYXNzTmFtZT17YHdmLXN0ZXBzICR7dmVydGljYWwgPyAnd2Ytc3RlcHMtdmVydGljYWwnIDogJ3dmLXN0ZXBzLWhvcml6b250YWwnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgID5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGluZGV4IDwgY3VycmVudCA/ICdkb25lJyA6IGluZGV4ID09PSBjdXJyZW50ID8gJ2N1cnJlbnQnIDogJ3RvZG8nXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGxpIGNsYXNzTmFtZT17YHdmLXN0ZXBzLWl0ZW0gd2Ytc3RlcHMtaXRlbS0ke3N0YXR1c31gfSBrZXk9e2l0ZW0uaWQgfHwgaXRlbS5sYWJlbCB8fCBpbmRleH0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWluZGljYXRvclwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwLW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICB7c3RhdHVzID09PSAnZG9uZScgPyBudWxsIDogaW5kZXggKyAxfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIHtpbmRleCA8IGl0ZW1zLmxlbmd0aCAtIDEgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1saW5lXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXN0ZXBzLWNvbnRlbnRcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIHtpdGVtLmRlc2NyaXB0aW9uID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtZGVzY1wiPntpdGVtLmRlc2NyaXB0aW9ufTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfSl9XG4gICAgPC9vbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRW1wdHlTdGF0ZSh7IHRpdGxlLCBkZXNjcmlwdGlvbiwgYWN0aW9uLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1lbXB0eS1zdGF0ZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZW1wdHktaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7dGl0bGUgPyA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWVtcHR5LXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPiA6IG51bGx9XG4gICAgICB7ZGVzY3JpcHRpb24gPyA8cCBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1kZXNjXCI+e2Rlc2NyaXB0aW9ufTwvcD4gOiBudWxsfVxuICAgICAge2FjdGlvbiA/IDxkaXYgY2xhc3NOYW1lPVwid2YtZW1wdHktYWN0aW9uXCI+e2FjdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHsgQ29sdW1uLCBSb3csIFNpZGVOYXYsIFRleHQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTY3JlZW5JZCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcblxuY29uc3QgTkFWX0lURU1TID0gW1xuICB7IGxhYmVsOiAnXHU1REU1XHU0RjVDXHU1MzNBJywgdG86ICd3b3Jrc3BhY2UnIH0sXG4gIHsgbGFiZWw6ICdDb2xsZWN0aW9ucycsIHRvOiAnY29sbGVjdGlvbicgfSxcbiAgeyBsYWJlbDogJ1x1NzNBRlx1NTg4MycsIHRvOiAnZW52aXJvbm1lbnRzJyB9LFxuICB7IGxhYmVsOiAnXHU1Mzg2XHU1M0YyJywgdG86ICdoaXN0b3J5JyB9LFxuICB7IGxhYmVsOiAnXHU4QkJFXHU3RjZFJywgdG86ICdzZXR0aW5ncycgfSxcbl1cblxuY29uc3QgQUNUSVZFX0FMSUFTID0ge1xuICAncmVxdWVzdC1lZGl0b3InOiAnY29sbGVjdGlvbicsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcHBTaGVsbCh7IGNoaWxkcmVuLCBhc2lkZSB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICBjb25zdCBhY3RpdmVJZCA9IEFDVElWRV9BTElBU1tzY3JlZW5JZF0gfHwgc2NyZWVuSWRcblxuICByZXR1cm4gKFxuICAgIDxSb3cgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnLCBnYXA6IDAgfX0+XG4gICAgICA8Q29sdW1uXG4gICAgICAgIGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX3JhaWxcIlxuICAgICAgICBnYXA9ezE2fVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgICAgZmxleFNocmluazogMCxcbiAgICAgICAgICBwYWRkaW5nOiAnMjBweCAxMnB4JyxcbiAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyxcbiAgICAgICAgICBiYWNrZ3JvdW5kOiAndmFyKC0td2YtNTApJyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZFwiIGdhcD17NH0+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDE1IH19PkFQSSBDbGllbnQ8L3N0cm9uZz5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19icmFuZC1tZXRhXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBjb2xvcjogJ3ZhcigtLXdmLTYwMCknIH19PlxuICAgICAgICAgICAgV29ya3NwYWNlIFx1MDBCNyBEZW1vXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPFNpZGVOYXYgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fbmF2XCIgYWN0aXZlSWQ9e2FjdGl2ZUlkfSBpdGVtcz17TkFWX0lURU1TfSAvPlxuICAgICAgPC9Db2x1bW4+XG4gICAgICB7YXNpZGUgPyAoXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19hc2lkZVwiXG4gICAgICAgICAgZ2FwPXsxMn1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6IDI2MCxcbiAgICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTZweCAxMnB4JyxcbiAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnMXB4IHNvbGlkIHZhcigtLXdmLTMwMCknLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICd2YXIoLS13Zi0xMDApJyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2FzaWRlfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPENvbHVtblxuICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19tYWluXCJcbiAgICAgICAgZ2FwPXswfVxuICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCwgb3ZlcmZsb3c6ICdhdXRvJyB9fVxuICAgICAgPlxuICAgICAgICB7Y2hpbGRyZW59XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L1Jvdz5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBGT0xERVJTID0gW1xuICB7XG4gICAgaWQ6ICdmb2xkZXItdXNlcnMnLFxuICAgIG5hbWU6ICdVc2VycycsXG4gICAgcmVxdWVzdHM6IFtcbiAgICAgIHsgaWQ6ICdyZXEtbGlzdC11c2VycycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdMaXN0IFVzZXJzJywgcGF0aDogJy92MS91c2VycycgfSxcbiAgICAgIHsgaWQ6ICdyZXEtZ2V0LXVzZXInLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnR2V0IFVzZXInLCBwYXRoOiAnL3YxL3VzZXJzLzppZCcgfSxcbiAgICAgIHsgaWQ6ICdyZXEtdXBkYXRlLXVzZXInLCBtZXRob2Q6ICdQQVRDSCcsIG5hbWU6ICdVcGRhdGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkJyB9LFxuICAgICAgeyBpZDogJ3JlcS1kaXNhYmxlLXVzZXInLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0Rpc2FibGUgVXNlcicsIHBhdGg6ICcvdjEvdXNlcnMvOmlkL2Rpc2FibGUnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLXJvbGVzJyxcbiAgICBuYW1lOiAnUm9sZXMnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWxpc3Qtcm9sZXMnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnTGlzdCBSb2xlcycsIHBhdGg6ICcvdjEvcm9sZXMnIH0sXG4gICAgICB7IGlkOiAncmVxLWFzc2lnbi1yb2xlJywgbWV0aG9kOiAnUFVUJywgbmFtZTogJ0Fzc2lnbiBSb2xlJywgcGF0aDogJy92MS91c2Vycy86aWQvcm9sZXMnIH0sXG4gICAgXSxcbiAgfSxcbiAge1xuICAgIGlkOiAnZm9sZGVyLWF1ZGl0JyxcbiAgICBuYW1lOiAnQXVkaXQnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWF1ZGl0LWxvZycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdBdWRpdCBMb2cnLCBwYXRoOiAnL3YxL2F1ZGl0L2xvZ3MnIH0sXG4gICAgICB7IGlkOiAncmVxLWV4cG9ydC1hdWRpdCcsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnRXhwb3J0IEF1ZGl0JywgcGF0aDogJy92MS9hdWRpdC9leHBvcnQnIH0sXG4gICAgXSxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbGxlY3Rpb25TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsXG4gICAgICBhc2lkZT17XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXRyZWVcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlXCIgZ2FwPXsxNH0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLXRpdGxlXCIgbGV2ZWw9ezN9PlVzZXIgQVBJPC9IZWFkaW5nPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX190cmVlLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj4rPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0ZPTERFUlMubWFwKChmb2xkZXIpID0+IChcbiAgICAgICAgICAgIDxDb2x1bW5cbiAgICAgICAgICAgICAga2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2ZvbGRlclwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtmb2xkZXIuaWR9XG4gICAgICAgICAgICAgIGdhcD17Nn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fZm9sZGVyLW5hbWVcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cbiAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAge2ZvbGRlci5yZXF1ZXN0cy5tYXAoKHJlcSkgPT4gKFxuICAgICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAgICBrZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3RcIlxuICAgICAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e3JlcS5pZH1cbiAgICAgICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMHB4JyB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3QtbWV0aG9kXCI+e3JlcS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcmVxdWVzdC1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDEzIH19PntyZXEubmFtZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgfVxuICAgID5cbiAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLXBhZ2VcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJjb2xsZWN0aW9uLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImNvbGxlY3Rpb24tdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJVc2VyIEFQSVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJDb2xsZWN0aW9uIFx1MDBCNyAzIFx1NEUyQVx1NjU4N1x1NEVGNlx1NTkzOSBcdTAwQjcgOCBcdTRFMkFcdThCRjdcdTZDNDJcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fYWN0aW9uLXJ1blwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5SdW4gY29sbGVjdGlvbjwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2FjdGlvbi1uZXdcIiB0bz1cInJlcXVlc3QtZWRpdG9yXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTY1QjBcdTVFRkFcdThCRjdcdTZDNDI8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q2FyZCBpZD1cImNvbGxlY3Rpb24tbWV0YVwiIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGFcIiBzdHlsZT17eyBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtcm93XCIgZ2FwPXsyNH0+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+QmFzZSBVUkw8L1RleHQ+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS12YWx1ZVwiPnsne3tiYXNlVXJsfX0nfTwvc3Ryb25nPlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtaXRlbVwiIGdhcD17NH0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtbGFiZWxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+XHU2Mzg4XHU2NzQzPC9UZXh0PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtdmFsdWVcIj5CZWFyZXIgVG9rZW48L3N0cm9uZz5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWl0ZW1cIiBnYXA9ezR9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWxhYmVsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19Plx1NjZGNFx1NjVCMDwvVGV4dD5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXZhbHVlXCI+XHU0RUNBXHU1OTI5IDEwOjI0PC9zdHJvbmc+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJjb2xsZWN0aW9uLWxpc3RcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC10aXRsZVwiIGxldmVsPXszfT5cdTUxNjhcdTkwRThcdThCRjdcdTZDNDI8L0hlYWRpbmc+XG4gICAgICAgICAge0ZPTERFUlMuZmxhdE1hcCgoZm9sZGVyKSA9PlxuICAgICAgICAgICAgZm9sZGVyLnJlcXVlc3RzLm1hcCgocmVxKSA9PiAoXG4gICAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgICAga2V5PXtyZXEuaWR9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1pdGVtXCJcbiAgICAgICAgICAgICAgICBkYXRhLXdmLWtleT17YGxpc3QtJHtyZXEuaWR9YH1cbiAgICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW1ldGhvZFwiPntyZXEubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSB9fT5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW5hbWVcIj57cmVxLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtcGF0aFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICB7Zm9sZGVyLm5hbWV9IFx1MDBCNyB7cmVxLnBhdGh9XG4gICAgICAgICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LW9wZW5cIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+XHU2MjUzXHU1RjAwPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICkpLFxuICAgICAgICAgICl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgRU5WX0xJU1QgPSBbXG4gIHsgaWQ6ICdlbnYtc3RhZ2luZycsIG5hbWU6ICdTdGFnaW5nJywgYWN0aXZlOiB0cnVlLCB2YXJzOiA2IH0sXG4gIHsgaWQ6ICdlbnYtcHJvZCcsIG5hbWU6ICdQcm9kdWN0aW9uJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNiB9LFxuICB7IGlkOiAnZW52LWxvY2FsJywgbmFtZTogJ0xvY2FsJywgYWN0aXZlOiBmYWxzZSwgdmFyczogNCB9LFxuXVxuXG5jb25zdCBWQVJfUk9XUyA9IFtcbiAgeyBpZDogJ3YtYmFzZScsIGtleTogJ2Jhc2VVcmwnLCBpbml0aWFsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbScsIGN1cnJlbnQ6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tJyB9LFxuICB7IGlkOiAndi10b2tlbicsIGtleTogJ3Rva2VuJywgaW5pdGlhbDogJ3N0X2RlbW9fKioqKicsIGN1cnJlbnQ6ICdzdF9kZW1vXyoqKionIH0sXG4gIHsgaWQ6ICd2LXRlbmFudCcsIGtleTogJ3RlbmFudElkJywgaW5pdGlhbDogJ3RuXzEwMDg2JywgY3VycmVudDogJ3RuXzEwMDg2JyB9LFxuICB7IGlkOiAndi10aW1lb3V0Jywga2V5OiAndGltZW91dE1zJywgaW5pdGlhbDogJzE1MDAwJywgY3VycmVudDogJzE1MDAwJyB9LFxuICB7IGlkOiAndi1sb2NhbGUnLCBrZXk6ICdsb2NhbGUnLCBpbml0aWFsOiAnemgtQ04nLCBjdXJyZW50OiAnemgtQ04nIH0sXG5dXG5cbmNvbnN0IFZBUl9DT0xVTU5TID0gW1xuICB7IGtleTogJ2tleScsIGxhYmVsOiAnVmFyaWFibGUnIH0sXG4gIHsga2V5OiAnaW5pdGlhbCcsIGxhYmVsOiAnSW5pdGlhbCBWYWx1ZScgfSxcbiAgeyBrZXk6ICdjdXJyZW50JywgbGFiZWw6ICdDdXJyZW50IFZhbHVlJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gRW52aXJvbm1lbnRzU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJlbnZpcm9ubWVudHMtcGFnZVwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZW52aXJvbm1lbnRzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImVudmlyb25tZW50cy10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTcyOFx1OEJGN1x1NkM0MiBVUkwgLyBIZWFkZXIgLyBCb2R5IFx1NEUyRFx1OTAxQVx1OEZDNyB7e3Zhcn19IFx1NUYxNVx1NzUyOFwiXG4gICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19hY3Rpb24tYWRkXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTZERkJcdTUyQTBcdTUzRDhcdTkxQ0Y8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Um93IGlkPVwiZW52aXJvbm1lbnRzLXBpY2tlclwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyXCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fcGlja2VyLWxhYmVsXCI+XHU1RjUzXHU1MjREXHU3M0FGXHU1ODgzPC9UZXh0PlxuICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19zZWxlY3RcIiBkZWZhdWx0VmFsdWU9XCJTdGFnaW5nXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgIDxvcHRpb24+U3RhZ2luZzwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uPkxvY2FsPC9vcHRpb24+XG4gICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aXZlLWJhZGdlXCI+QWN0aXZlPC9CYWRnZT5cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPFJvdyBpZD1cImVudmlyb25tZW50cy1jYXJkc1wiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICB7RU5WX0xJU1QubWFwKChlbnYpID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmRcIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17ZW52LmlkfVxuICAgICAgICAgICAgICBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fY2FyZC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbmFtZVwiPntlbnYubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICB7ZW52LmFjdGl2ZSA/IDxCYWRnZSBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtYmFkZ2VcIj5cdTRGN0ZcdTc1MjhcdTRFMkQ8L0JhZGdlPiA6IG51bGx9XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtbWV0YVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgbWFyZ2luVG9wOiA2IH19PlxuICAgICAgICAgICAgICAgIHtlbnYudmFyc30gXHU0RTJBXHU1M0Q4XHU5MUNGXG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImVudmlyb25tZW50cy10YWJsZS13cmFwXCIgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS13cmFwXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZS10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5TdGFnaW5nIFx1NTNEOFx1OTFDRjwvVGV4dD5cbiAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICBpZD1cImVudmlyb25tZW50cy10YWJsZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3RhYmxlXCJcbiAgICAgICAgICAgIGNvbHVtbnM9e1ZBUl9DT0xVTU5TfVxuICAgICAgICAgICAgcm93cz17VkFSX1JPV1N9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IEhJU1RPUlkgPSBbXG4gIHtcbiAgICBpZDogJ2hpc3QtMScsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBuYW1lOiAnTGlzdCBVc2VycycsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS91c2Vycz9wYWdlPTEnLFxuICAgIHN0YXR1czogJzIwMCcsXG4gICAgdGltZTogJzE0MiBtcycsXG4gICAgYXQ6ICdcdTRFQ0FcdTU5MjkgMTQ6MjE6MDgnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTInLFxuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIG5hbWU6ICdDcmVhdGUgT3JkZXInLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvb3JkZXJzJyxcbiAgICBzdGF0dXM6ICcyMDEnLFxuICAgIHRpbWU6ICczMTAgbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDEzOjU1OjQxJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC0zJyxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBuYW1lOiAnTG9naW4nLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvYXV0aC9sb2dpbicsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnOTggbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDExOjAyOjE3JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC00JyxcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIG5hbWU6ICdHZXQgSW52b2ljZScsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9iaWxsaW5nL2ludm9pY2VzL2ludl84OCcsXG4gICAgc3RhdHVzOiAnNDA0JyxcbiAgICB0aW1lOiAnNjcgbXMnLFxuICAgIGF0OiAnXHU2NjI4XHU1OTI5IDE5OjQ0OjAzJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC01JyxcbiAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgbmFtZTogJ1VwZGF0ZSBVc2VyJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL3VzZXJzL3VfMTAwMScsXG4gICAgc3RhdHVzOiAnMjAwJyxcbiAgICB0aW1lOiAnMTg4IG1zJyxcbiAgICBhdDogJ1x1NjYyOFx1NTkyOSAxNjoxMjo1MCcsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtNicsXG4gICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICBuYW1lOiAnUmV2b2tlIFRva2VuJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL2F1dGgvdG9rZW4nLFxuICAgIHN0YXR1czogJzIwNCcsXG4gICAgdGltZTogJzU0IG1zJyxcbiAgICBhdDogJzA4LTA4IDIxOjA2OjIyJyxcbiAgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEhpc3RvcnlTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktcGFnZVwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImhpc3RvcnktaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiaGlzdG9yeS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTY3MkNcdTY3M0FcdTY3MDBcdThGRDFcdTUzRDFcdTkwMDFcdTc2ODRcdThCRjdcdTZDNDJcdUZGMENcdTUzRUZcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTUyMzBcdTdGMTZcdThGOTFcdTU2NjhcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLWNsZWFyXCI+XHU2RTA1XHU3QTdBXHU1Mzg2XHU1M0YyPC9CdXR0b24+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiaGlzdG9yeV9fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cImhpc3RvcnktbGlzdFwiIGNsYXNzTmFtZT1cImhpc3RvcnlfX2xpc3RcIiBnYXA9ezEwfT5cbiAgICAgICAgICB7SElTVE9SWS5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbVwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTIgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1tZXRob2RcIj57aXRlbS5tZXRob2R9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXVybFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT57aXRlbS51cmx9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1hdFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6ICd2YXIoLS13Zi02MDApJyB9fT5cbiAgICAgICAgICAgICAgICAgICAge2l0ZW0uYXR9XG4gICAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tc3RhdHVzXCI+e2l0ZW0uc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tdGltZVwiPntpdGVtLnRpbWV9PC9CYWRnZT5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tb3BlblwiIHRvPVwicmVxdWVzdC1lZGl0b3JcIj5cdTYyNTNcdTVGMDA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRGF0YVRhYmxlLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgVGFicyxcbiAgVGV4dCxcbiAgVGV4dEFyZWEsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgUEFSQU1fUk9XUyA9IFtcbiAgeyBpZDogJ3AtcGFnZScsIGtleTogJ3BhZ2UnLCB2YWx1ZTogJzEnLCBkZXNjOiAnXHU5ODc1XHU3ODAxJyB9LFxuICB7IGlkOiAncC1zaXplJywga2V5OiAnc2l6ZScsIHZhbHVlOiAnMjAnLCBkZXNjOiAnXHU2QkNGXHU5ODc1XHU2NzYxXHU2NTcwJyB9LFxuICB7IGlkOiAncC1xJywga2V5OiAncScsIHZhbHVlOiAnYWxpY2UnLCBkZXNjOiAnXHU1MTczXHU5NTJFXHU1QjU3XHU2NDFDXHU3RDIyJyB9LFxuICB7IGlkOiAncC1zdGF0dXMnLCBrZXk6ICdzdGF0dXMnLCB2YWx1ZTogJ2FjdGl2ZScsIGRlc2M6ICdcdTc1MjhcdTYyMzdcdTcyQjZcdTYwMDEnIH0sXG5dXG5cbmNvbnN0IEhFQURFUl9ST1dTID0gW1xuICB7IGlkOiAnaC1hdXRoJywga2V5OiAnQXV0aG9yaXphdGlvbicsIHZhbHVlOiAnQmVhcmVyIHt7dG9rZW59fScsIGRlc2M6ICdcdThCQkZcdTk1RUVcdTRFRTRcdTcyNEMnIH0sXG4gIHsgaWQ6ICdoLWFjY2VwdCcsIGtleTogJ0FjY2VwdCcsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbicsIGRlc2M6ICcnIH0sXG4gIHsgaWQ6ICdoLXRyYWNlJywga2V5OiAnWC1SZXF1ZXN0LUlkJywgdmFsdWU6ICd7eyRndWlkfX0nLCBkZXNjOiAnXHU5NEZFXHU4REVGXHU4RkZEXHU4RTJBJyB9LFxuICB7IGlkOiAnaC1jbGllbnQnLCBrZXk6ICdYLUNsaWVudCcsIHZhbHVlOiAnYXBpLWNsaWVudC1kZW1vJywgZGVzYzogJycgfSxcbl1cblxuY29uc3QgUEFSQU1fQ09MVU1OUyA9IFtcbiAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0tleScgfSxcbiAgeyBrZXk6ICd2YWx1ZScsIGxhYmVsOiAnVmFsdWUnIH0sXG4gIHsga2V5OiAnZGVzYycsIGxhYmVsOiAnRGVzY3JpcHRpb24nIH0sXG5dXG5cbmNvbnN0IFJFU1BPTlNFX0pTT04gPSBge1xuICBcImRhdGFcIjogW1xuICAgIHsgXCJpZFwiOiBcInVfMTAwMVwiLCBcIm5hbWVcIjogXCJBbGljZVwiLCBcInJvbGVcIjogXCJhZG1pblwiIH0sXG4gICAgeyBcImlkXCI6IFwidV8xMDAyXCIsIFwibmFtZVwiOiBcIkJvYlwiLCBcInJvbGVcIjogXCJlZGl0b3JcIiB9LFxuICAgIHsgXCJpZFwiOiBcInVfMTAwM1wiLCBcIm5hbWVcIjogXCJDYXJvbFwiLCBcInJvbGVcIjogXCJ2aWV3ZXJcIiB9XG4gIF0sXG4gIFwicGFnZVwiOiAxLFxuICBcInRvdGFsXCI6IDEyOFxufWBcblxuZXhwb3J0IGZ1bmN0aW9uIFJlcXVlc3RFZGl0b3JTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgncGFyYW1zJylcbiAgY29uc3QgW3Jlc3BUYWIsIHNldFJlc3BUYWJdID0gUmVhY3QudXNlU3RhdGUoJ2JvZHknKVxuXG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsPlxuICAgICAgPENvbHVtbiBpZD1cInJlcXVlc3QtZWRpdG9yLXBhZ2VcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcGFnZVwiIGdhcD17MH0gc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScgfX0+XG4gICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3RvcFwiIGdhcD17MTJ9IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4IDI0cHggMTJweCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyB9fT5cbiAgICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGVJZD1cInJlcXVlc3QtZWRpdG9yLXRpdGxlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19oZWFkZXJcIlxuICAgICAgICAgICAgdGl0bGU9XCJMaXN0IFVzZXJzXCJcbiAgICAgICAgICAgIHN1YnRpdGxlPVwiVXNlciBBUEkgLyBVc2Vyc1wiXG4gICAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2FjdGlvbi1jb2xsZWN0aW9uXCIgdG89XCJjb2xsZWN0aW9uXCI+XHU4RkQ0XHU1NkRFIENvbGxlY3Rpb248L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hY3Rpb24tc2F2ZVwiIHRvPVwiY29sbGVjdGlvblwiPlNhdmU8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIDxSb3cgaWQ9XCJyZXF1ZXN0LWVkaXRvci11cmxiYXJcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdXJsYmFyXCIgZ2FwPXs4fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19tZXRob2RcIiBkZWZhdWx0VmFsdWU9XCJHRVRcIiBzdHlsZT17eyB3aWR0aDogMTEwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPkdFVDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPlBPU1Q8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QVVQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QQVRDSDwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPkRFTEVURTwvb3B0aW9uPlxuICAgICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdXJsXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3VybFwiXG4gICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT1cInt7YmFzZVVybH19L3YxL3VzZXJzXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2VudlwiIGRlZmF1bHRWYWx1ZT1cIlN0YWdpbmdcIiBzdHlsZT17eyB3aWR0aDogMTQwIH19PlxuICAgICAgICAgICAgICA8b3B0aW9uPlN0YWdpbmc8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5Qcm9kdWN0aW9uPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+TG9jYWw8L29wdGlvbj5cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgPEJ1dHRvbiBpZD1cInJlcXVlc3QtZWRpdG9yLXNlbmRcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2VuZFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgIFNlbmRcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuXG4gICAgICAgICAgPFRhYnNcbiAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItdGFic1wiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGFic1wiXG4gICAgICAgICAgICBhY3RpdmVJZD17dGFifVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdwYXJhbXMnLCBsYWJlbDogJ1BhcmFtcycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2hlYWRlcnMnLCBsYWJlbDogJ0hlYWRlcnMnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnYXV0aCcsIGxhYmVsOiAnQXV0aG9yaXphdGlvbicgfSxcbiAgICAgICAgICAgIF19XG4gICAgICAgICAgLz5cblxuICAgICAgICAgIHt0YWIgPT09ICdwYXJhbXMnID8gKFxuICAgICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXBhcmFtc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19wYXJhbXNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtQQVJBTV9ST1dTfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2hlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtQQVJBTV9DT0xVTU5TfVxuICAgICAgICAgICAgICByb3dzPXtIRUFERVJfUk9XU31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dGFiID09PSAnYm9keScgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWJvZHlcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keVwiIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19PlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LXRvb2xiYXJcIiBnYXA9ezh9IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogOCB9fT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktdHlwZVwiPnJhdzwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LWZvcm1hdFwiPkpTT048L0JhZGdlPlxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPFRleHRBcmVhXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHktaW5wdXRcIlxuICAgICAgICAgICAgICAgIHJvd3M9ezZ9XG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXsne1xcbiAgXCJub3RlXCI6IFwiR0VUIFx1OEJGN1x1NkM0Mlx1OTAxQVx1NUUzOFx1NjVFMCBCb2R5XHVGRjBDXHU2QjY0XHU1OTA0XHU0RUM1XHU3OTNBXHU2MTBGXHU3RjE2XHU4RjkxXHU1MzNBXCJcXG59J31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt0YWIgPT09ICdhdXRoJyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItYXV0aFwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoXCIgc3R5bGU9e3sgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtZmllbGRzXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1yb3dcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC1sYWJlbFwiIHN0eWxlPXt7IHdpZHRoOiA4MCB9fT5UeXBlPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC10eXBlXCIgZGVmYXVsdFZhbHVlPVwiQmVhcmVyIFRva2VuXCIgc3R5bGU9e3sgd2lkdGg6IDIwMCB9fT5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5CZWFyZXIgVG9rZW48L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5BUEkgS2V5PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+QmFzaWMgQXV0aDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPk5vIEF1dGg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtcm93XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtbGFiZWxcIiBzdHlsZT17eyB3aWR0aDogODAgfX0+VG9rZW48L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8VGV4dElucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXRva2VuXCJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPVwie3t0b2tlbn19XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxDb2x1bW5cbiAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2VcIlxuICAgICAgICAgIGdhcD17MTB9XG4gICAgICAgICAgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMjQsIGJhY2tncm91bmQ6ICd2YXIoLS13Zi01MCknLCBtaW5IZWlnaHQ6IDI4MCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS10aXRsZVwiIGxldmVsPXszfT5SZXNwb25zZTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLW1ldGFcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3N0YXR1c1wiPjIwMCBPSzwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fdGltZVwiPjE0MiBtczwvQmFkZ2U+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fc2l6ZVwiPjMuMiBLQjwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L1Jvdz5cblxuICAgICAgICAgIDxUYWJzXG4gICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXJlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLXRhYnNcIlxuICAgICAgICAgICAgYWN0aXZlSWQ9e3Jlc3BUYWJ9XG4gICAgICAgICAgICBvbkNoYW5nZT17c2V0UmVzcFRhYn1cbiAgICAgICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgICAgIHsgaWQ6ICdib2R5JywgbGFiZWw6ICdCb2R5JyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnaGVhZGVycycsIGxhYmVsOiAnSGVhZGVycycgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2Nvb2tpZXMnLCBsYWJlbDogJ0Nvb2tpZXMnIH0sXG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICB7cmVzcFRhYiA9PT0gJ2JvZHknID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1ib2R5XCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWJvZHlcIiBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fT5cbiAgICAgICAgICAgICAgPHByZVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1qc29uXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW46IDAsIGZvbnRTaXplOiAxMiwgd2hpdGVTcGFjZTogJ3ByZS13cmFwJywgZm9udEZhbWlseTogJ3VpLW1vbm9zcGFjZSwgbW9ub3NwYWNlJyB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge1JFU1BPTlNFX0pTT059XG4gICAgICAgICAgICAgIDwvcHJlPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3Jlc3BUYWIgPT09ICdoZWFkZXJzJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWhlYWRlcnNcIlxuICAgICAgICAgICAgICBjb2x1bW5zPXtbXG4gICAgICAgICAgICAgICAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ0hlYWRlcicgfSxcbiAgICAgICAgICAgICAgICB7IGtleTogJ3ZhbHVlJywgbGFiZWw6ICdWYWx1ZScgfSxcbiAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgcm93cz17W1xuICAgICAgICAgICAgICAgIHsgaWQ6ICdyaC1jdCcsIGtleTogJ2NvbnRlbnQtdHlwZScsIHZhbHVlOiAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtY2FjaGUnLCBrZXk6ICdjYWNoZS1jb250cm9sJywgdmFsdWU6ICduby1zdG9yZScgfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtcmVxJywga2V5OiAneC1yZXF1ZXN0LWlkJywgdmFsdWU6ICdyZXFfOGYzYTJjJyB9LFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHtyZXNwVGFiID09PSAnY29va2llcycgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWNvb2tpZXNcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llc1wiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fY29va2llcy1lbXB0eVwiPlx1NjcyQ1x1NkIyMVx1NTRDRFx1NUU5NFx1NjcyQVx1OEJCRVx1N0Y2RSBDb29raWU8L1RleHQ+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBTZXR0aW5nc1NjcmVlbigpIHtcbiAgY29uc3QgW3NzbCwgc2V0U3NsXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtmb2xsb3dSZWRpcmVjdCwgc2V0Rm9sbG93UmVkaXJlY3RdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW3Byb3h5LCBzZXRQcm94eV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJzZXR0aW5ncy1wYWdlXCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cInNldHRpbmdzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cInNldHRpbmdzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMUFcdTc1MjhcdTUwNEZcdTU5N0RcdTMwMDFcdTRFRTNcdTc0MDZcdTRFMEVcdThCQzFcdTRFNjZcdUZGMDhcdTdFQkZcdTY4NDZcdTc5M0FcdTYxMEZcdUZGMDlcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fYWN0aW9uLXdvcmtzcGFjZVwiIHRvPVwid29ya3NwYWNlXCI+XHU4RkQ0XHU1NkRFXHU1REU1XHU0RjVDXHU1MzNBPC9CdXR0b24+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtZ2VuZXJhbFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdTkwMUFcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiXHU5RUQ4XHU4QkE0XHU4RDg1XHU2NUY2XHVGRjA4bXNcdUZGMDlcIiBodG1sRm9yPVwic2V0dGluZ3MtdGltZW91dFwiPlxuICAgICAgICAgICAgICA8VGV4dElucHV0IGlkPVwic2V0dGluZ3MtdGltZW91dFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX190aW1lb3V0XCIgZGVmYXVsdFZhbHVlPVwiMTUwMDBcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLWxhYmVsXCI+XHU4MUVBXHU1MkE4XHU4RERGXHU5NjhGXHU5MUNEXHU1QjlBXHU1NDExPC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1yZWRpcmVjdFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3JlZGlyZWN0XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtmb2xsb3dSZWRpcmVjdH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0Rm9sbG93UmVkaXJlY3R9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtbGFiZWxcIj5cdTY4MjFcdTlBOENcdThCQzFcdTRFNjZcdUZGMDhTU0xcdUZGMDk8L1RleHQ+XG4gICAgICAgICAgICAgIDxUb2dnbGVcbiAgICAgICAgICAgICAgICBpZD1cInNldHRpbmdzLXNzbFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NzbFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c3NsfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRTc2x9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtcHJveHlcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvblwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tYm9keVwiIGdhcD17MTR9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XHU0RUUzXHU3NDA2PC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS10b2dnbGVcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3Byb3h5fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRQcm94eX1cbiAgICAgICAgICAgICAgICBsYWJlbD17cHJveHkgPyAnXHU1RjAwXHU1NDJGJyA6ICdcdTUxNzNcdTk1RUQnfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiSG9zdFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1ob3N0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LWhvc3RcIiBkZWZhdWx0VmFsdWU9XCIxMjcuMC4wLjFcIiAvPlxuICAgICAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInNldHRpbmdzX19maWVsZFwiIGxhYmVsPVwiUG9ydFwiIGh0bWxGb3I9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCI+XG4gICAgICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJzZXR0aW5ncy1wcm94eS1wb3J0XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LXBvcnRcIiBkZWZhdWx0VmFsdWU9XCI3ODkwXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJzZXR0aW5ncy1jZXJ0c1wiIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvbi10aXRsZVwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCB9fT5cdThCQzFcdTRFNjY8L1RleHQ+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtZW1wdHlcIiBzdHlsZT17eyBmb250U2l6ZTogMTMgfX0+XG4gICAgICAgICAgICAgIFx1NUMxQVx1NjcyQVx1NkRGQlx1NTJBMFx1NUJBMlx1NjIzN1x1N0FFRlx1OEJDMVx1NEU2Nlx1MzAwMlx1NzUxRlx1NEVBN1x1NzNBRlx1NTg4M1x1NTNFRlx1NTcyOFx1NkI2NFx1NjMwMlx1OEY3RCAucGVtIC8gLnAxMlx1MzAwMlxuICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJzZXR0aW5nc19fY2VydHMtYWRkXCI+XHU2REZCXHU1MkEwXHU4QkMxXHU0RTY2PC9CdXR0b24+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgQ09MTEVDVElPTlMgPSBbXG4gIHtcbiAgICBpZDogJ2NvbC11c2VycycsXG4gICAgbmFtZTogJ1VzZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU3NTI4XHU2MjM3XHU1MjE3XHU4ODY4XHUzMDAxXHU4QkU2XHU2MEM1XHUzMDAxXHU2NkY0XHU2NUIwXHU0RTBFXHU3OTgxXHU3NTI4JyxcbiAgICBjb3VudDogNixcbiAgICB1cGRhdGVkQXQ6ICdcdTRFQ0FcdTU5MjkgMTA6MjQnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtb3JkZXJzJyxcbiAgICBuYW1lOiAnT3JkZXIgQVBJJyxcbiAgICBkZXNjOiAnXHU4QkEyXHU1MzU1XHU2N0U1XHU4QkUyXHUzMDAxXHU1MjFCXHU1RUZBXHUzMDAxXHU1M0Q2XHU2RDg4XHUzMDAxXHU1QzY1XHU3RUE2XHU3MkI2XHU2MDAxJyxcbiAgICBjb3VudDogOSxcbiAgICB1cGRhdGVkQXQ6ICdcdTY2MjhcdTU5MjkgMTg6MDInLFxuICB9LFxuICB7XG4gICAgaWQ6ICdjb2wtYXV0aCcsXG4gICAgbmFtZTogJ0F1dGgnLFxuICAgIGRlc2M6ICdcdTc2N0JcdTVGNTVcdTMwMDFcdTUyMzdcdTY1QjAgVG9rZW5cdTMwMDFcdTc2N0JcdTUxRkEnLFxuICAgIGNvdW50OiA0LFxuICAgIHVwZGF0ZWRBdDogJzA4LTA4IDE0OjExJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnY29sLWJpbGxpbmcnLFxuICAgIG5hbWU6ICdCaWxsaW5nJyxcbiAgICBkZXNjOiAnXHU4RDI2XHU1MzU1XHUzMDAxXHU1M0QxXHU3OTY4XHUzMDAxXHU2NTJGXHU0RUQ4XHU1NkRFXHU4QzAzJyxcbiAgICBjb3VudDogNSxcbiAgICB1cGRhdGVkQXQ6ICcwOC0wNyAwOTo0MCcsXG4gIH0sXG5dXG5cbmNvbnN0IFJFQ0VOVCA9IFtcbiAgeyBpZDogJ3JlcS1saXN0LXVzZXJzJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0xpc3QgVXNlcnMnLCBwYXRoOiAnL3YxL3VzZXJzJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWNyZWF0ZS1vcmRlcicsIG1ldGhvZDogJ1BPU1QnLCBuYW1lOiAnQ3JlYXRlIE9yZGVyJywgcGF0aDogJy92MS9vcmRlcnMnLCBzdGF0dXM6ICcyMDEnIH0sXG4gIHsgaWQ6ICdyZXEtbG9naW4nLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0xvZ2luJywgcGF0aDogJy92MS9hdXRoL2xvZ2luJywgc3RhdHVzOiAnMjAwJyB9LFxuICB7IGlkOiAncmVxLWdldC1pbnZvaWNlJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0dldCBJbnZvaWNlJywgcGF0aDogJy92MS9iaWxsaW5nL2ludm9pY2VzLzppZCcsIHN0YXR1czogJzQwNCcgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFdvcmtzcGFjZVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGxcbiAgICAgIGFzaWRlPXtcbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1hc2lkZVwiIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGVcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtaGVhZFwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtdGl0bGVcIiBsZXZlbD17M30+Q29sbGVjdGlvbnM8L0hlYWRpbmc+XG4gICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYXNpZGUtbmV3XCIgdG89XCJjb2xsZWN0aW9uXCI+XHU2NUIwXHU1RUZBPC9CdXR0b24+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAge0NPTExFQ1RJT05TLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tY2FyZFwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cImNvbGxlY3Rpb25cIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1uYW1lXCI+e2l0ZW0ubmFtZX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLWNvdW50XCI+e2l0ZW0uY291bnR9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1kZXNjXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBtYXJnaW5Ub3A6IDQgfX0+XG4gICAgICAgICAgICAgICAge2l0ZW0uZGVzY31cbiAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIH1cbiAgICA+XG4gICAgICA8Q29sdW1uIGlkPVwid29ya3NwYWNlLXBhZ2VcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cIndvcmtzcGFjZS1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJ3b3Jrc3BhY2UtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NURFNVx1NEY1Q1x1NTMzQVwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTkwMDlcdTYyRTkgQ29sbGVjdGlvbiBcdTYyNTNcdTVGMDBcdThCRjdcdTZDNDJcdUZGMENcdTYyMTZcdTRFQ0VcdTY3MDBcdThGRDFcdThCQjBcdTVGNTVcdTdFRTdcdTdFRURcdTdGMTZcdThGOTFcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FjdGlvbi1lbnZcIiB0bz1cImVudmlyb25tZW50c1wiPlx1NTIwN1x1NjM2Mlx1NzNBRlx1NTg4MzwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fYWN0aW9uLW5ld1wiIHRvPVwicmVxdWVzdC1lZGl0b3JcIiB2YXJpYW50PVwicHJpbWFyeVwiPlx1NjVCMFx1NUVGQVx1OEJGN1x1NkM0MjwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDYXJkIGlkPVwid29ya3NwYWNlLXdlbGNvbWVcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWVcIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3dlbGNvbWUtdGl0bGVcIiBsZXZlbD17M30+RGVtbyBXb3Jrc3BhY2U8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX193ZWxjb21lLWNvcHlcIj5cbiAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1NzNBRlx1NTg4M1x1RkYxQVN0YWdpbmcgXHUwMEI3IEJhc2UgVVJMIFx1NEY3Rlx1NzUyOCB7J3t7YmFzZVVybH19J30gXHUwMEI3IFx1NTE3MSA0IFx1NEUyQSBDb2xsZWN0aW9uXG4gICAgICAgICAgPC9UZXh0PlxuICAgICAgICA8L0NhcmQ+XG5cbiAgICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1yZWNlbnRcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudFwiIGdhcD17MTB9PlxuICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NjcwMFx1OEZEMVx1OEJGN1x1NkM0MjwvSGVhZGluZz5cbiAgICAgICAgICB7UkVDRU5ULm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgPENhcmRcbiAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1pdGVtXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIHRvPVwicmVxdWVzdC1lZGl0b3JcIlxuICAgICAgICAgICAgICBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbWV0aG9kXCI+e2l0ZW0ubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1jb3B5XCIgZ2FwPXsyfSBzdHlsZT17eyBmbGV4OiAxLCBtaW5XaWR0aDogMCB9fT5cbiAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1wYXRoXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PntpdGVtLnBhdGh9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1zdGF0dXNcIj57aXRlbS5zdGF0dXN9PC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuXG4gICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dHNcIiBnYXA9ezEyfT5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0XCIgdG89XCJoaXN0b3J5XCIgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LXRpdGxlXCIgbGV2ZWw9ezN9Plx1NTM4Nlx1NTNGMlx1OEJCMFx1NUY1NTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtZGVzY1wiPlx1NjdFNVx1NzcwQlx1NjcyQ1x1NjczQVx1NTNEMVx1OTAwMVx1OEZDN1x1NzY4NFx1OEJGN1x1NkM0MjwvVGV4dD5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dFwiIHRvPVwic2V0dGluZ3NcIiBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAxNCB9fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtdGl0bGVcIiBsZXZlbD17M30+XHU4QkJFXHU3RjZFPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC1kZXNjXCI+XHU0RUUzXHU3NDA2XHUzMDAxXHU4QkMxXHU0RTY2XHU0RTBFXHU5MDFBXHU3NTI4XHU1MDRGXHU1OTdEPC9UZXh0PlxuICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPC9Sb3c+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiaW1wb3J0IHsgQ29sbGVjdGlvblNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9jb2xsZWN0aW9uLmpzeCdcbmltcG9ydCB7IEVudmlyb25tZW50c1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9lbnZpcm9ubWVudHMuanN4J1xuaW1wb3J0IHsgSGlzdG9yeVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9oaXN0b3J5LmpzeCdcbmltcG9ydCB7IFJlcXVlc3RFZGl0b3JTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcmVxdWVzdC1lZGl0b3IuanN4J1xuaW1wb3J0IHsgU2V0dGluZ3NTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvc2V0dGluZ3MuanN4J1xuaW1wb3J0IHsgV29ya3NwYWNlU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3dvcmtzcGFjZS5qc3gnXG5cbmNvbnN0IFNIRUxMX0xJTktTID0gWyd3b3Jrc3BhY2UnLCAnY29sbGVjdGlvbicsICdlbnZpcm9ubWVudHMnLCAnaGlzdG9yeScsICdzZXR0aW5ncyddXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnQVBJIENsaWVudFx1RkYwOFBvc3RtYW4gXHU5OENFXHU2ODNDXHVGRjA5JyxcbiAgdmlld3BvcnRzOiB7XG4gICAgZGVza3RvcDogeyB3aWR0aDogMTQ0MCwgaGVpZ2h0OiA5MDAgfSxcbiAgfSxcbiAgZGVmYXVsdFZpZXdwb3J0OiAnZGVza3RvcCcsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ3dvcmtzcGFjZScsXG4gICAgICB0aXRsZTogJ1x1NURFNVx1NEY1Q1x1NTMzQScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvbGxlY3Rpb25zIFx1NEZBN1x1NjgwRlx1NEUwRVx1NjcwMFx1OEZEMVx1OEJGN1x1NkM0Mlx1NTE2NVx1NTNFMycsXG4gICAgICBjb21wb25lbnQ6IFdvcmtzcGFjZVNjcmVlbixcbiAgICAgIGVudHJ5OiB0cnVlLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdjb2xsZWN0aW9uJyxcbiAgICAgIHRpdGxlOiAnQ29sbGVjdGlvbicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1NjU4N1x1NEVGNlx1NTkzOVx1NEUwRVx1OEJGN1x1NkM0Mlx1NjgxMVx1RkYwQ1x1NjI1M1x1NUYwMFx1OEJGN1x1NkM0Mlx1N0YxNlx1OEY5MVx1NTY2OCcsXG4gICAgICBjb21wb25lbnQ6IENvbGxlY3Rpb25TY3JlZW4sXG4gICAgICBsaW5rczogWy4uLlNIRUxMX0xJTktTLCAncmVxdWVzdC1lZGl0b3InXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3JlcXVlc3QtZWRpdG9yJyxcbiAgICAgIHRpdGxlOiAnXHU4QkY3XHU2QzQyXHU3RjE2XHU4RjkxJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWV0aG9kIC8gVVJMIC8gUGFyYW1zIC8gSGVhZGVycyAvIEJvZHkgXHU0RTBFIFJlc3BvbnNlJyxcbiAgICAgIGNvbXBvbmVudDogUmVxdWVzdEVkaXRvclNjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2Vudmlyb25tZW50cycsXG4gICAgICB0aXRsZTogJ1x1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRicsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1NTkxQVx1NzNBRlx1NTg4M1x1NTIwN1x1NjM2Mlx1NEUwRVx1NTNEOFx1OTFDRlx1ODg2OCcsXG4gICAgICBjb21wb25lbnQ6IEVudmlyb25tZW50c1NjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2hpc3RvcnknLFxuICAgICAgdGl0bGU6ICdcdTUzODZcdTUzRjJcdThCQjBcdTVGNTUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTY3MDBcdThGRDFcdTUzRDFcdTkwMDFcdThCQjBcdTVGNTVcdUZGMENcdTUzRUZcdTkxQ0RcdTY1QjBcdTYyNTNcdTVGMDBcdTdGMTZcdThGOTFcdTU2NjgnLFxuICAgICAgY29tcG9uZW50OiBIaXN0b3J5U2NyZWVuLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdzZXR0aW5ncycsXG4gICAgICB0aXRsZTogJ1x1OEJCRVx1N0Y2RScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OTAxQVx1NzUyOFx1MzAwMVx1NEVFM1x1NzQwNlx1NEUwRVx1OEJDMVx1NEU2NicsXG4gICAgICBjb21wb25lbnQ6IFNldHRpbmdzU2NyZWVuLFxuICAgICAgbGlua3M6IFNIRUxMX0xJTktTLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMnXG5pbXBvcnQgeyBwcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJ1xuXG52YWxpZGF0ZVByb2plY3QocHJvamVjdClcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxFcnJvckJvdW5kYXJ5IHNjb3BlPVwiYm9hcmRcIj5cbiAgICA8UHJvdG90eXBlUHJvdmlkZXIgcHJvamVjdD17cHJvamVjdH0+XG4gICAgICA8Qm9hcmQgcHJvamVjdD17cHJvamVjdH0gLz5cbiAgICA8L1Byb3RvdHlwZVByb3ZpZGVyPlxuICA8L0Vycm9yQm91bmRhcnk+LFxuKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQUEsTUFBTSxtQkFBbUIsTUFBTSxjQUFjLElBQUk7QUFFakQsV0FBUyxtQkFBbUJBLFVBQVM7QUFGckM7QUFHRSxhQUFPLEtBQUFBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLEtBQUssTUFBN0MsbUJBQWdELE9BQU1BLFNBQVEsUUFBUSxDQUFDLEVBQUU7QUFBQSxFQUNsRjtBQUVPLFdBQVMsa0JBQWtCLEVBQUUsU0FBQUEsVUFBUyxTQUFTLEdBQUc7QUFDdkQsVUFBTSxrQkFBa0IsbUJBQW1CQSxRQUFPO0FBQ2xELFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUN2QyxNQUFNO0FBQUEsTUFDTixhQUFhQSxTQUFRO0FBQUEsTUFDckIsU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDO0FBQUEsSUFDWixDQUFDO0FBRUQsVUFBTSxXQUFXLE1BQU0sWUFBWSxDQUFDLE9BQU87QUFDekMsVUFBSSxDQUFDQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxPQUFPLEVBQUUsR0FBRztBQUN2RCxjQUFNLElBQUksTUFBTSxzQkFBc0IsRUFBRSxrQkFBa0I7QUFBQSxNQUM1RDtBQUNBLGVBQVMsQ0FBQyxZQUFZO0FBQ3BCLFlBQUksUUFBUSxTQUFTLFVBQVUsT0FBTyxRQUFRLGlCQUFpQjtBQUM3RCxnQkFBTSxTQUFTQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxPQUFPLFFBQVEsZUFBZTtBQUNqRixjQUFJLENBQUMsT0FBTyxNQUFNLFNBQVMsRUFBRSxHQUFHO0FBQzlCLGtCQUFNLElB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YixXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsR0FBRyxhQUFhLGdCQUFnQjtBQUFBLFFBQ3hDLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7OztBQzVEQSxrQkFBZ0IsT0FBTztBQUV2QixXQUFTLFdBQVcsU0FBUyxlQUFlLE1BQU0sQ0FBQyxFQUFFO0FBQUEsSUFDbkQsb0NBQUMsaUJBQWMsT0FBTSxXQUNuQixvQ0FBQyxxQkFBa0IsV0FDakIsb0NBQUMsU0FBTSxTQUFrQixDQUMzQixDQUNGO0FBQUEsRUFDRjsiLAogICJuYW1lcyI6IFsicHJvamVjdCIsICJwcm9qZWN0IiwgIl9hIiwgInByb2plY3QiLCAicHJvamVjdCIsICJjb3B5VGV4dCIsICJwcm9qZWN0IiwgInByb2plY3QiLCAicHJvamVjdCJdCn0K
