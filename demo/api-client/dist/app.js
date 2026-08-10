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
    { id: "canvas", keys: "Command+1", label: "\u5207\u6362\u5230\u753B\u677F\u6A21\u5F0F" },
    { id: "demo", keys: "Command+2", label: "\u5207\u6362\u5230\u6F14\u793A\u6A21\u5F0F" },
    { id: "interaction", keys: "Command+I", label: "\u5207\u6362\u53EF\u4EA4\u4E92 / \u4E0D\u53EF\u4EA4\u4E92" },
    { id: "review", keys: "Command+M", label: "\u5F00\u542F\u6216\u5173\u95ED\u4FEE\u6539\u6A21\u5F0F" },
    { id: "immersive", keys: "Command+F", label: "\u5207\u6362\u6C89\u6D78\u6A21\u5F0F" },
    { id: "browser-fullscreen", keys: "Command+Shift+F", label: "\u5207\u6362\u6D4F\u89C8\u5668\u5168\u5C4F" },
    { id: "hotspots", keys: "Command+H", label: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A" },
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
    if (!event || event.repeat || event.altKey) return null;
    const key = String(event.key || "").toLowerCase();
    if (!event.metaKey) {
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
        title: interactive ? "\u5F53\u524D\u53EF\u4EA4\u4E92\u9875\u9762\u3002\u70B9\u51FB\u9501\u4F4F\u540E\uFF1A\u62D6\u62FD\u5E73\u79FB\u753B\u5E03\uFF0C\u6EDA\u8F6E\u7F29\u653E\uFF1B\u5FEB\u6377\u952E Command+I" : "\u5F53\u524D\u5DF2\u9501\u4F4F\u3002\u70B9\u51FB\u6062\u590D\u53EF\u4EA4\u4E92\uFF1B\u5FEB\u6377\u952E Command+I"
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
          title: "\u753B\u677F\u6A21\u5F0F\uFF08Command+1\uFF09"
        },
        "\u753B\u677F"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          className: mode === "demo" ? "is-active" : "",
          onClick: () => setMode("demo"),
          title: "\u6F14\u793A\u6A21\u5F0F\uFF08Command+2\uFF09"
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
          title: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08Command+H\uFF09"
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
          title: "\u4FEE\u6539\uFF1A\u70B9\u9009\u9875\u9762\u8282\u70B9\u5E76\u6574\u7406\u6210\u53EF\u7F16\u8F91\u7684 AI \u4FEE\u6539 Prompt\uFF08Command+M\uFF09",
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
          title: "\u5207\u6362\u6C89\u6D78\u6A21\u5F0F\uFF08Command+F\uFF09",
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
            title: browserFullscreen ? "\u9000\u51FA\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08Command+Shift+F\uFF09" : "\u6D4F\u89C8\u5668\u5168\u5C4F\uFF08Command+Shift+F\uFF09",
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
            title: "\u663E\u793A\u6216\u9690\u85CF\u6F14\u793A\u70ED\u533A\uFF08Command+H\uFF09"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi9zcmMvbGF5b3V0cy9BcHBTaGVsbC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvY29sbGVjdGlvbi5qc3giLCAiLi4vc3JjL3NjcmVlbnMvZW52aXJvbm1lbnRzLmpzeCIsICIuLi9zcmMvc2NyZWVucy9oaXN0b3J5LmpzeCIsICIuLi9zcmMvc2NyZWVucy9yZXF1ZXN0LWVkaXRvci5qc3giLCAiLi4vc3JjL3NjcmVlbnMvc2V0dGluZ3MuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3dvcmtzcGFjZS5qc3giLCAiLi4vc3JjL3Byb2plY3QuanMiLCAiLi4vc3JjL2FwcC5qc3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IFByb3RvdHlwZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBwcm9qZWN0LnNjcmVlbnNbMF0uaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByb3RvdHlwZVByb3ZpZGVyKHsgcHJvamVjdCwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBpbml0aWFsU2NyZWVuSWQgPSBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdClcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZSh7XG4gICAgbW9kZTogJ2NhbnZhcycsXG4gICAgdmlld3BvcnRLZXk6IHByb2plY3QuZGVmYXVsdFZpZXdwb3J0LFxuICAgIGVudHJ5SWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgfSlcblxuICBjb25zdCBuYXZpZ2F0ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChpZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2lkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKVxuICAgICAgICBpZiAoIXNjcmVlbi5saW5rcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7Y3VycmVudC5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke2lkfVwiYClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBpZCxcbiAgICAgICAgaGlzdG9yeTpcbiAgICAgICAgICBjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWRcbiAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuaGlzdG9yeSwgY3VycmVudC5jdXJyZW50U2NyZWVuSWRdXG4gICAgICAgICAgICA6IGN1cnJlbnQuaGlzdG9yeSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2VsZWN0RW50cnkgPSBSZWFjdC51c2VDYWxsYmFjaygoZW50cnlJZCkgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICAgIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGVudHJ5SWQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IGdvQmFjayA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuaGlzdG9yeVtjdXJyZW50Lmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgICAgIGhpc3Rvcnk6IGN1cnJlbnQuaGlzdG9yeS5zbGljZSgwLCAtMSksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW10pXG5cbiAgY29uc3QgcmVzZXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50LmVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW2luaXRpYWxTY3JlZW5JZF0pXG5cbiAgY29uc3Qgc2V0TW9kZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChtb2RlKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdjYW52YXMnICYmIG1vZGUgIT09ICdkZW1vJykgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1vZGUgXCIke21vZGV9XCJgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGUsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW10pXG5cbiAgLyoqIFx1NzUzQlx1Njc3Rlx1NTNDQ1x1NTFGQlx1NjdEMFx1OTg3NVx1RkYxQVx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQVx1NUU3Nlx1ODQzRFx1NTcyOFx1OEJFNVx1OTg3NSAqL1xuICBjb25zdCBlbnRlckRlbW8gPSBSZWFjdC51c2VDYWxsYmFjaygoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc2NyZWVuSWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtzY3JlZW5JZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGU6ICdkZW1vJyxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogc2NyZWVuSWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNldFZpZXdwb3J0S2V5ID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpZXdwb3J0S2V5KSA9PiB7XG4gICAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCB2aWV3cG9ydEtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB2aWV3cG9ydCBcIiR7dmlld3BvcnRLZXl9XCJgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgdmlld3BvcnRLZXkgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCB2YWx1ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gKHtcbiAgICBtb2RlOiBzdGF0ZS5tb2RlLFxuICAgIHZpZXdwb3J0S2V5OiBzdGF0ZS52aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydDogcHJvamVjdC52aWV3cG9ydHNbc3RhdGUudmlld3BvcnRLZXldLFxuICAgIGVudHJ5SWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5jdXJyZW50U2NyZWVuSWQsXG4gICAgbmF2aWdhdGUsXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIHNldE1vZGUsXG4gICAgZW50ZXJEZW1vLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIGNhbkdvQmFjazogc3RhdGUuaGlzdG9yeS5sZW5ndGggPiAwLFxuICB9KSwgW2VudGVyRGVtbywgZ29CYWNrLCBuYXZpZ2F0ZSwgcHJvamVjdCwgcmVzZXQsIHNlbGVjdEVudHJ5LCBzZXRNb2RlLCBzZXRWaWV3cG9ydEtleSwgc3RhdGVdKVxuXG4gIHJldHVybiA8UHJvdG90eXBlQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PntjaGlsZHJlbn08L1Byb3RvdHlwZUNvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm90b3R5cGUoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KFByb3RvdHlwZUNvbnRleHQpXG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCd1c2VQcm90b3R5cGUgbXVzdCBiZSB1c2VkIGluc2lkZSBQcm90b3R5cGVQcm92aWRlcicpXG4gIHJldHVybiBjb250ZXh0XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNsYW1wU2NhbGUoc2NhbGUpIHtcbiAgcmV0dXJuIE1hdGgubWluKDIsIE1hdGgubWF4KDAuMiwgc2NhbGUpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYxQVx1NjMwOVx1NUJCOVx1NTY2OFx1NTE4NVx1NUJCOVx1NTMzQVx1NjI4QVx1NjU3NFx1OTg3NVx1N0YyOVx1NjUzRVx1NTIzMFx1NUI4Q1x1NjU3NFx1NTNFRlx1ODlDMVx1MzAwMlxuICogY29udGFpbmVyKiBcdTRFM0FcdTUzQkJcdTYzODkgcGFkZGluZyBcdTU0MEVcdTc2ODRcdTUzRUZcdTc1MjhcdTVDM0FcdTVCRjhcdUZGMUJjb250ZW50KiBcdTRFM0FcdTY3MkFcdTdGMjlcdTY1M0VcdTc2ODQgc3RhZ2UgXHU1QkJEXHU5QUQ4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXREZW1vU2NhbGUoY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgY29udGVudFdpZHRoLCBjb250ZW50SGVpZ2h0KSB7XG4gIGlmIChjb250YWluZXJXaWR0aCA8PSAwIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwIHx8IGNvbnRlbnRXaWR0aCA8PSAwIHx8IGNvbnRlbnRIZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIGNsYW1wU2NhbGUoTWF0aC5taW4oY29udGFpbmVyV2lkdGggLyBjb250ZW50V2lkdGgsIGNvbnRhaW5lckhlaWdodCAvIGNvbnRlbnRIZWlnaHQpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1ODlDNlx1NTNFM1x1NTNDQ1x1NTFGQlx1NzZFRVx1NjgwN1x1NjYyRlx1NTQyNlx1NEUzQVx1NUM0Rlx1NTkxNlx1N0E3QVx1NzY3RFx1MzAwMlxuICogXHU3MEI5XHU1NzI4IC53Zi1zY3JlZW4tY2hyb21lXHVGRjA4XHU2ODA3XHU5ODk4XHU2ODBGIC8gXHU1MTg1XHU1QkI5XHVGRjA5XHU1MTg1XHU0RTBEXHU3Qjk3XHU3QTdBXHU3NjdEXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU5MDAwXHU1MUZBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlbW9CbGFua0V4aXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRydWVcbiAgcmV0dXJuICF0YXJnZXQuY2xvc2VzdCgnLndmLXNjcmVlbi1jaHJvbWUnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRDYW52YXNWaWV3cG9ydCgpIHtcbiAgcmV0dXJuIHsgc2NhbGU6IDEsIHBhblg6IDAsIHBhblk6IDAgfVxufVxuXG5jb25zdCBGT0NVU19QQURESU5HID0gNDBcblxuLyoqXG4gKiBcdTc1M0JcdTY3N0YgZm9jdXNcdUZGMUFcdTYyOEFcdTY1NzRcdTU3NTcgc2NyZWVuXHVGRjA4XHU1NDJCIG1ldGFcdUZGMDlcdTc5RkJcdTUyMzBcdTVCQjlcdTU2NjhcdTRFMkRcdTVGQzNcdTMwMDJcbiAqIFx1NEVDNVx1NUY1M1x1NUY1M1x1NTI0RCBzY2FsZSBcdTY1M0VcdTRFMERcdTRFMEJcdTY1RjZcdTdGMjlcdTVDMEZcdUZGMUJcdTRFMERcdTY1M0VcdTU5MjdcdTMwMDJcdTVDM0FcdTVCRjhcdTk3NUVcdTZDRDVcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9jdXNDYW52YXNTY3JlZW4oe1xuICBjb250YWluZXJXaWR0aCxcbiAgY29udGFpbmVySGVpZ2h0LFxuICBzY3JlZW5MZWZ0LFxuICBzY3JlZW5Ub3AsXG4gIHNjcmVlbldpZHRoLFxuICBzY3JlZW5IZWlnaHQsXG4gIGN1cnJlbnRTY2FsZSxcbiAgcGFkZGluZyA9IEZPQ1VTX1BBRERJTkcsXG59KSB7XG4gIGlmIChcbiAgICBjb250YWluZXJXaWR0aCA8PSAwXG4gICAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDBcbiAgICB8fCBzY3JlZW5XaWR0aCA8PSAwXG4gICAgfHwgc2NyZWVuSGVpZ2h0IDw9IDBcbiAgICB8fCAhTnVtYmVyLmlzRmluaXRlKGN1cnJlbnRTY2FsZSlcbiAgKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGF2YWlsV2lkdGggPSBjb250YWluZXJXaWR0aCAtIHBhZGRpbmcgKiAyXG4gIGNvbnN0IGF2YWlsSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgaWYgKGF2YWlsV2lkdGggPD0gMCB8fCBhdmFpbEhlaWdodCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZpdFNjYWxlID0gTWF0aC5taW4oYXZhaWxXaWR0aCAvIHNjcmVlbldpZHRoLCBhdmFpbEhlaWdodCAvIHNjcmVlbkhlaWdodClcbiAgY29uc3Qgc2NhbGUgPSBjbGFtcFNjYWxlKE1hdGgubWluKGN1cnJlbnRTY2FsZSwgZml0U2NhbGUpKVxuICByZXR1cm4ge1xuICAgIHNjYWxlLFxuICAgIHBhblg6IGNvbnRhaW5lcldpZHRoIC8gMiAtIChzY3JlZW5MZWZ0ICsgc2NyZWVuV2lkdGggLyAyKSAqIHNjYWxlLFxuICAgIHBhblk6IGNvbnRhaW5lckhlaWdodCAvIDIgLSAoc2NyZWVuVG9wICsgc2NyZWVuSGVpZ2h0IC8gMikgKiBzY2FsZSxcbiAgfVxufVxuXG4vKipcbiAqIFx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1RkYxQVx1NTNFQVx1NzUyOFx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NTI0RFx1NjIyQVx1ODNCN1x1NzY4NCBzbmFwc2hvdFx1RkYwQ1x1Nzk4MVx1NkI2Mlx1NTcyOCBzZXRTdGF0ZSB1cGRhdGVyIFx1OTFDQ1x1OEJGQiBkcmFnIHJlZlx1MzAwMlxuICogUmVhY3QgMTggXHU0RjFBXHU1NzI4IGVuZFBhbiBcdTZFMDVcdTdBN0EgcmVmIFx1NTQwRVx1OTFDRFx1NjUzRSB1cGRhdGVyXHVGRjFCXHU4QkZCIG51bGwucGFuWCBcdTUzNzMgQm9hcmQgXHU2MkE1XHU5NTE5XHU2ODM5XHU1NkUwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYW5Gcm9tRHJhZ1NuYXBzaG90KHZpZXcsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiB2aWV3XG4gIHJldHVybiB7XG4gICAgLi4udmlldyxcbiAgICBwYW5YOiBzbmFwc2hvdC5wYW5YICsgY2xpZW50WCAtIHNuYXBzaG90LngsXG4gICAgcGFuWTogc25hcHNob3QucGFuWSArIGNsaWVudFkgLSBzbmFwc2hvdC55LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njcm9sbGFibGVPdmVyZmxvdyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09ICdhdXRvJyB8fCB2YWx1ZSA9PT0gJ3Njcm9sbCcgfHwgdmFsdWUgPT09ICdvdmVybGF5J1xufVxuXG4vKiogXHU1NzI4IHJvb3QgXHU1MTg1XHU1NDExXHU0RTBBXHU2MjdFXHU1M0VGXHU2RURBXHU1MkE4XHU3OTU2XHU1MTQ4XHVGRjA4XHU1NDJCIHJvb3QgXHU4MUVBXHU4RUFCXHVGRjBDXHU1OTgyXHU1QzRGXHU1MTg1XHU1MTg1XHU1QkI5XHU1MzNBXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVBbmNlc3RvcihzdGFydEVsLCByb290RWwpIHtcbiAgbGV0IG5vZGUgPSBzdGFydEVsICYmIHN0YXJ0RWwubm9kZVR5cGUgPT09IDMgPyBzdGFydEVsLnBhcmVudEVsZW1lbnQgOiBzdGFydEVsXG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSlcbiAgICAgIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIG5vZGUuc2Nyb2xsSGVpZ2h0ID4gbm9kZS5jbGllbnRIZWlnaHQgKyAxXG4gICAgICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBub2RlLnNjcm9sbFdpZHRoID4gbm9kZS5jbGllbnRXaWR0aCArIDFcbiAgICAgIGlmIChjYW5ZIHx8IGNhblgpIHJldHVybiBub2RlXG4gICAgfVxuICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IENPTlRFTlRfRFJBR19USFJFU0hPTEQgPSAzXG5cbmZ1bmN0aW9uIGlzRWRpdGFibGVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAhIXRhcmdldC5jbG9zZXN0KCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKVxufVxuXG4vKipcbiAqIFx1NTcyOFx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTE4NVx1NjMwOVx1NEY0Rlx1NjJENlx1NjJGRCBcdTIxOTIgXHU2RURBXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdUZGMDhcdTUzRUZcdTRFQTRcdTRFOTJcdTUxNzNcdTk1RUQgLyBcdTdBN0FcdTY4M0NcdUZGMDlcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1RkYwQ1x1NEVBNFx1N0VEOVx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlx1MzAwMlxuICogXHU4RkQ0XHU1NkRFIG51bGwgXHU4ODY4XHU3OTNBXHU0RTBEXHU1RTk0XHU2M0E1XHU3QkExXHU4QkU1XHU2QjIxIHBvaW50ZXJkb3duXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCByb290RWwsIHsgbG9ja2VkID0gZmFsc2UsIHNjYWxlID0gMSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIG51bGxcbiAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuIG51bGxcbiAgaWYgKCFyb290RWwgfHwgIXJvb3RFbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBpZiAoaXNFZGl0YWJsZVRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBzY3JvbGxhYmxlID0gZmluZFNjcm9sbGFibGVBbmNlc3RvcihldmVudC50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gbnVsbFxuICByZXR1cm4ge1xuICAgIGVsOiBzY3JvbGxhYmxlLFxuICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgc2Nyb2xsTGVmdDogc2Nyb2xsYWJsZS5zY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogc2Nyb2xsYWJsZS5zY3JvbGxUb3AsXG4gICAgc2NhbGU6IHNjYWxlID4gMCA/IHNjYWxlIDogMSxcbiAgICBtb3ZlZDogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpIHtcbiAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGR4ID0gKGV2ZW50LmNsaWVudFggLSBzdGF0ZS5zdGFydFgpIC8gc3RhdGUuc2NhbGVcbiAgY29uc3QgZHkgPSAoZXZlbnQuY2xpZW50WSAtIHN0YXRlLnN0YXJ0WSkgLyBzdGF0ZS5zY2FsZVxuICBpZiAoIXN0YXRlLm1vdmVkICYmIChNYXRoLmFicyhkeCkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEIHx8IE1hdGguYWJzKGR5KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQpKSB7XG4gICAgc3RhdGUubW92ZWQgPSB0cnVlXG4gIH1cbiAgc3RhdGUuZWwuc2Nyb2xsTGVmdCA9IHN0YXRlLnNjcm9sbExlZnQgLSBkeFxuICBzdGF0ZS5lbC5zY3JvbGxUb3AgPSBzdGF0ZS5zY3JvbGxUb3AgLSBkeVxuICByZXR1cm4gc3RhdGVcbn1cblxuLyoqIFx1NjJENlx1NjJGRFx1OEQ4NVx1OEZDN1x1OTYwOFx1NTAzQ1x1NTQwRVx1NTQxRVx1NjM4OVx1OTY4Rlx1NTQwRVx1NzY4NCBjbGlja1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1ODlFNlx1OERGM1x1OEY2QyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZENvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCByb290RWwpIHtcbiAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUubW92ZWQgfHwgIXJvb3RFbCkgcmV0dXJuXG4gIGNvbnN0IHByZXZlbnRDbGljayA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJvb3RFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbiAgfVxuICByb290RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG59XG5cbi8qKiBcdThCRTVcdTY1QjlcdTU0MTFcdTY2MkZcdTU0MjZcdThGRDhcdTgwRkRcdTdFRTdcdTdFRURcdTZFREEgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5TY3JvbGxJbkRpcmVjdGlvbihlbCwgZGVsdGFYLCBkZWx0YVkpIHtcbiAgY29uc3QgZXBzID0gMVxuICBpZiAoZGVsdGFZKSB7XG4gICAgY29uc3QgbWF4WSA9IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodFxuICAgIGlmIChtYXhZID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFZIDwgMCAmJiBlbC5zY3JvbGxUb3AgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFZID4gMCAmJiBlbC5zY3JvbGxUb3AgPCBtYXhZIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICBpZiAoZGVsdGFYKSB7XG4gICAgY29uc3QgbWF4WCA9IGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGhcbiAgICBpZiAobWF4WCA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWCA8IDAgJiYgZWwuc2Nyb2xsTGVmdCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVggPiAwICYmIGVsLnNjcm9sbExlZnQgPCBtYXhYIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFRkJcdTYxMEZcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTRFQzUgQ3RybC9NZXRhICsgXHU2RURBXHU4RjZFXG4gKlx1RkYwOFx1ODlFNlx1NjNBN1x1Njc3RiBwaW5jaCBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTkxQ0NcdTkwMUFcdTVFMzhcdTVFMjYgY3RybEtleVx1RkYwOVx1MzAwMlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NjY2RVx1OTAxQVx1NkVEQVx1OEY2RVx1NzU1OVx1N0VEOVx1NUM0Rlx1NTE4NVx1NkVEQVx1NTJBOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckVudHJ5SWQoc2NyZWVucykge1xuICByZXR1cm4gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbW9TdGF0ZShzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5SWQgPSBpbmZlckVudHJ5SWQoc2NyZWVucylcbiAgaWYgKCFlbnRyeUlkKSB0aHJvdyBuZXcgRXJyb3IoJ0RlbW8gbW9kZSByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZW50cnkgc2NyZWVuJylcbiAgcmV0dXJuIHtcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXZpZ2F0ZURlbW8oc3RhdGUsIHRhcmdldElkLCBzY3JlZW5zKSB7XG4gIGlmICghc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gdGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7dGFyZ2V0SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICB9XG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpXG4gIGlmICghY3VycmVudFNjcmVlbi5saW5rcy5pbmNsdWRlcyh0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7c3RhdGUuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHt0YXJnZXRJZH1cImApXG4gIH1cbiAgaWYgKHRhcmdldElkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpIHJldHVybiBzdGF0ZVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogdGFyZ2V0SWQsXG4gICAgaGlzdG9yeTogWy4uLnN0YXRlLmhpc3RvcnksIHN0YXRlLmN1cnJlbnRTY3JlZW5JZF0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdERlbW9FbnRyeShzdGF0ZSwgZW50cnlJZCwgc2NyZWVucykge1xuICBjb25zdCBlbnRyeSA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdvQmFja0RlbW8oc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgaGlzdG9yeSA9IHN0YXRlLmhpc3Rvcnkuc2xpY2UoMCwgLTEpXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5oaXN0b3J5W3N0YXRlLmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgaGlzdG9yeSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZW1vKHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwgfVxuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgIHJldHVybiB7IGVycm9yIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCBpbmZvKSB7XG4gICAgY29uc29sZS5lcnJvcihgW3dpcmVmcmFtZToke3RoaXMucHJvcHMuc2NvcGUgfHwgJ3Vua25vd24nfV1gLCBlcnJvciwgaW5mbylcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgJiYgcHJldmlvdXNQcm9wcy5yZXNldEtleSAhPT0gdGhpcy5wcm9wcy5yZXNldEtleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5lcnJvcikgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICBjb25zdCB7IHNjcmVlbklkLCBzb3VyY2UsIHNjb3BlIH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZXJyb3ItY2FyZFwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICA8c3Ryb25nPntzY29wZSA9PT0gJ3NjcmVlbicgPyBgU2NyZWVuOiAke3NjcmVlbklkfWAgOiAnQm9hcmQgZXJyb3InfTwvc3Ryb25nPlxuICAgICAgICB7c291cmNlID8gPHNwYW4+U291cmNlOiB7c291cmNlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8c3Bhbj5NZXNzYWdlOiB7dGhpcy5zdGF0ZS5lcnJvci5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPHByZT57dGhpcy5zdGF0ZS5lcnJvci5zdGFja308L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuIiwgImNvbnN0IFNjcmVlbklkZW50aXR5Q29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbklkZW50aXR5UHJvdmlkZXIoeyBzY3JlZW5JZCwgY2hpbGRyZW4gfSkge1xuICBpZiAoIXNjcmVlbklkKSB0aHJvdyBuZXcgRXJyb3IoJ1NjcmVlbklkZW50aXR5UHJvdmlkZXIgcmVxdWlyZXMgc2NyZWVuSWQnKVxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NjcmVlbklkfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1NjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2NyZWVuSWQoKSB7XG4gIGNvbnN0IHNjcmVlbklkID0gUmVhY3QudXNlQ29udGV4dChTY3JlZW5JZGVudGl0eUNvbnRleHQpXG4gIGlmICghc2NyZWVuSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZVNjcmVlbklkIG11c3QgYmUgdXNlZCBpbnNpZGUgYSByZW5kZXJlZCBzY3JlZW4nKVxuICB9XG4gIHJldHVybiBzY3JlZW5JZFxufVxuIiwgIi8qKlxuICogXHU3MEVEXHU1MzNBXHU0RTBFXHU4REYzXHU4RjZDXHU3Njg0XHU1NTJGXHU0RTAwXHU1OTUxXHU3RUE2XHVGRjFBXHU1MTQzXHU3RDIwXHU1RTI2IGRhdGEtZmxvdy10byBcdTUzNzNcdTUzRUZcdTVCRkNcdTgyMkFcdTMwMDJcbiAqIFNjcmVlbkZyYW1lIFx1NTlENFx1NjI1OFx1NzBCOVx1NTFGQlx1NTE1Q1x1NUU5NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUxQVx1NTJBMVx1NTE5OVx1NjIxMFx1ODhGOCBzcGFuL2RpdiBcdTUzRUFcdTY3MDlcdTVDNUVcdTYwMjdcdTMwMDFcdTZDQTFcdTY3MDkgb25DbGlja1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290RWwpIHtcbiAgaWYgKCFzdGFydEVsIHx8IHR5cGVvZiBzdGFydEVsLmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsXG4gIGNvbnN0IGVsID0gc3RhcnRFbC5jbG9zZXN0KCdbZGF0YS1mbG93LXRvXScpXG4gIGlmICghZWwpIHJldHVybiBudWxsXG4gIGlmIChyb290RWwgJiYgdHlwZW9mIHJvb3RFbC5jb250YWlucyA9PT0gJ2Z1bmN0aW9uJyAmJiAhcm9vdEVsLmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcbiAgY29uc3QgdG8gPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxvdy10bycpXG4gIHJldHVybiB0byB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIHJvb3RFbCwgbmF2aWdhdGUpIHtcbiAgY29uc3QgdG8gPSBmaW5kRmxvd1RhcmdldElkKGV2ZW50Py50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCF0bykgcmV0dXJuIGZhbHNlXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gIG5hdmlnYXRlKHRvKVxuICByZXR1cm4gdHJ1ZVxufVxuIiwgImNvbnN0IFRZUEVfTEFCRUxTID0ge1xuICBjb21tZW50OiAnXHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJyxcbiAgdGV4dDogJ1x1NEZFRVx1NjUzOVx1NjU4N1x1NUI1NycsXG4gIG9yZGVyOiAnXHU4QzAzXHU2NTc0XHU5ODdBXHU1RThGJyxcbiAgcmVtb3ZlOiAnXHU1MjIwXHU5NjY0XHU4MjgyXHU3MEI5Jyxcbn1cblxuZnVuY3Rpb24gZXNjYXBlU2VsZWN0b3JUb2tlbih2YWx1ZSkge1xuICBpZiAoZ2xvYmFsVGhpcy5DU1M/LmVzY2FwZSkgcmV0dXJuIGdsb2JhbFRoaXMuQ1NTLmVzY2FwZShTdHJpbmcodmFsdWUpKVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAoY2hhcikgPT4gYFxcXFwke2NoYXJ9YClcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cmlidXRlVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbn1cblxuZnVuY3Rpb24gY2xhc3Nlc09mKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50Py5jbGFzc0xpc3QpIHJldHVybiBbXVxuICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNsYXNzTGlzdCkuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQ2xhc3NOYW1lKG5hbWUpIHtcbiAgcmV0dXJuICEhbmFtZSAmJiAhbmFtZS5zdGFydHNXaXRoKCd3Zi0nKSAmJiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKVxufVxuXG5mdW5jdGlvbiBzZWxlY3RvclNjb3BlKHNjcmVlbklkKSB7XG4gIHJldHVybiBgW2RhdGEtc2NyZWVuLWlkPVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShzY3JlZW5JZCl9XCJdYFxufVxuXG5mdW5jdGlvbiBzZWxlY3RvcklzVW5pcXVlKHNjcmVlblJvb3QsIHNlbGVjdG9yKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjcmVlblJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoID09PSAxXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpIHtcbiAgY29uc3QgdGFnID0gKGVsZW1lbnQudGFnTmFtZSB8fCAnZGl2JykudG9Mb3dlckNhc2UoKVxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlcy5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcbiAgY29uc3QgdXNhYmxlID0gYnVzaW5lc3MubGVuZ3RoID4gMCA/IGJ1c2luZXNzIDogY2xhc3Nlcy5maWx0ZXIoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICBjb25zdCBjbGFzc1BhcnQgPSB1c2FibGUuc2xpY2UoMCwgMikubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICByZXR1cm4gYCR7dGFnfSR7Y2xhc3NQYXJ0fSR7a2V5UGFydH1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW5JZCkge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW5JZCkgcmV0dXJuICcnXG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oZWxlbWVudC5pZCl9YFxuXG4gIGNvbnN0IHNjb3BlID0gc2VsZWN0b3JTY29wZShzY3JlZW5JZClcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzT2YoZWxlbWVudCkuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG5cbiAgZm9yIChjb25zdCBuYW1lIG9mIGJ1c2luZXNzKSB7XG4gICAgY29uc3QgbG9jYWwgPSBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX0ke2tleVBhcnR9YFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBpZiAoYnVzaW5lc3MubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGxvY2FsID0gYnVzaW5lc3MubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKSArIGtleVBhcnRcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdChgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihjdXJyZW50LmlkKX1gKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgbGV0IHNlZ21lbnQgPSBlbGVtZW50U2VnbWVudChjdXJyZW50KVxuICAgIGNvbnN0IHBhcmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgICAgY29uc3QgcGVlcnMgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKFxuICAgICAgICAoaXRlbSkgPT4gaXRlbS50YWdOYW1lID09PSBjdXJyZW50LnRhZ05hbWUgJiYgZWxlbWVudFNlZ21lbnQoaXRlbSkgPT09IHNlZ21lbnQsXG4gICAgICApXG4gICAgICBpZiAocGVlcnMubGVuZ3RoID4gMSkgc2VnbWVudCArPSBgOm50aC1vZi10eXBlKCR7cGVlcnMuaW5kZXhPZihjdXJyZW50KSArIDF9KWBcbiAgICB9XG4gICAgc2VnbWVudHMudW5zaGlmdChzZWdtZW50KVxuICAgIGNvbnN0IGxvY2FsID0gc2VnbWVudHMuam9pbignID4gJylcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICAgIGN1cnJlbnQgPSBwYXJlbnRcbiAgfVxuXG4gIHJldHVybiBgJHtzY29wZX0gJHtzZWdtZW50cy5qb2luKCcgPiAnKSB8fCBlbGVtZW50U2VnbWVudChlbGVtZW50KX1gXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlMYWJlbChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VsZW1lbnQuaWR9YFxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IHNlbWFudGljID0gY2xhc3Nlcy5maW5kKGlzQnVzaW5lc3NDbGFzc05hbWUpIHx8IGNsYXNzZXMuZmluZCgobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIHJldHVybiBzZW1hbnRpYyA/IGAuJHtzZW1hbnRpY31gIDogKGVsZW1lbnQudGFnTmFtZSB8fCAnbm9kZScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gcmVhZFRleHQoZWxlbWVudCkge1xuICBjb25zdCB2YWx1ZSA9ICd2YWx1ZScgaW4gZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICA/IGVsZW1lbnQudmFsdWVcbiAgICA6IGVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbiAgcmV0dXJuIG5vcm1hbGl6ZWQubGVuZ3RoID4gMjQwID8gYCR7bm9ybWFsaXplZC5zbGljZSgwLCAyMzcpfS4uLmAgOiBub3JtYWxpemVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUmV2aWV3VGFyZ2V0KHRhcmdldCwgY29udGVudFJvb3QpIHtcbiAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ/Lm5vZGVUeXBlID09PSAxID8gdGFyZ2V0IDogdGFyZ2V0Py5wYXJlbnRFbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQgfHwgY2xhc3Nlc09mKGN1cnJlbnQpLmxlbmd0aCA+IDApIHJldHVybiBjdXJyZW50XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbikge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW4pIHJldHVybiBudWxsXG4gIGNvbnN0IGFuY2VzdG9ycyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGFuY2VzdG9ycy51bnNoaWZ0KHtcbiAgICAgIGVsZW1lbnQ6IGN1cnJlbnQsXG4gICAgICBsYWJlbDogZGlzcGxheUxhYmVsKGN1cnJlbnQpLFxuICAgICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoY3VycmVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgfSlcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQsXG4gICAgY29udGVudFJvb3QsXG4gICAgc2NyZWVuSWQ6IHNjcmVlbi5pZCxcbiAgICBzY3JlZW5UaXRsZTogc2NyZWVuLnRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YCxcbiAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB0YWdOYW1lOiAoZWxlbWVudC50YWdOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLFxuICAgIGNsYXNzTmFtZXM6IGNsYXNzZXNPZihlbGVtZW50KSxcbiAgICBjdXJyZW50VGV4dDogcmVhZFRleHQoZWxlbWVudCksXG4gICAgYW5jZXN0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZW1SZXF1ZXN0KGl0ZW0pIHtcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gYFx1NEZFRVx1NjUzOVx1NEUzQVx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdvcmRlcicpIHJldHVybiBgXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3JlbW92ZScpIHJldHVybiBgXHU1MjIwXHU5NjY0XHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfWBcbiAgcmV0dXJuIGl0ZW0uaW5zdHJ1Y3Rpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldmlld1RhcmdldHMoaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVtPy50YXJnZXRzKSAmJiBpdGVtLnRhcmdldHMubGVuZ3RoID4gMCkgcmV0dXJuIGl0ZW0udGFyZ2V0c1xuICBpZiAoIWl0ZW0/LnNlbGVjdG9yKSByZXR1cm4gW11cbiAgcmV0dXJuIFt7XG4gICAgc2NyZWVuSWQ6IGl0ZW0uc2NyZWVuSWQsXG4gICAgc2NyZWVuVGl0bGU6IGl0ZW0uc2NyZWVuVGl0bGUsXG4gICAgc291cmNlSGludDogaXRlbS5zb3VyY2VIaW50LFxuICAgIHNlbGVjdG9yOiBpdGVtLnNlbGVjdG9yLFxuICAgIGN1cnJlbnRUZXh0OiBpdGVtLmN1cnJlbnRUZXh0LFxuICB9XVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpIHtcbiAgY29uc3QgcHJvamVjdE5hbWUgPSBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInXG5cbiAgY29uc3QgbGluZXMgPSBbXG4gICAgYFx1OEJGN1x1NEZFRVx1NjUzOVx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4Qlx1MzAwQyR7cHJvamVjdE5hbWV9XHUzMDBEXHUzMDAyYCxcbiAgICAnJyxcbiAgICAnXHU0RkVFXHU2NTM5XHU3RUE2XHU2NzVGXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdTRGRUVcdTY1MzlcdTRFMUFcdTUyQTEgc3JjL1x1RkYxQlx1NEUwRFx1ODk4MVx1NEZFRVx1NjUzOSBmcmFtZXdvcmsvIFx1NjIxNiBkaXN0L2FwcC5qc1x1MzAwMicsXG4gICAgJy0gXHU5MDFBXHU4RkM3IERPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdTU3MjggSlNYIFx1NEUyRFx1NjQxQ1x1N0QyMlx1NUJGOVx1NUU5NFx1NzY4NCBpZFx1MzAwMWNsYXNzTmFtZSBcdTYyMTYgZGF0YS13Zi1rZXlcdTMwMDInLFxuICAgICctIFx1NEZERFx1NzU1OVx1NjI0MFx1NjcwOVx1OEJFRFx1NEU0OSBjbGFzc1x1MzAwMVx1NTE3M1x1OTUyRVx1ODI4Mlx1NzBCOSBpZCBcdTU0OENcdTkxQ0RcdTU5MERcdTY1NzBcdTYzNkVcdTgyODJcdTcwQjlcdTc2ODQgZGF0YS13Zi1rZXlcdUZGMUJcdTY1QjBcdTU4OUVcdTgyODJcdTcwQjlcdTRFNUZcdTkwNzVcdTVCODhcdTU0MENcdTRFMDBcdTU0N0RcdTU0MERcdTg5QzRcdTUyMTlcdTMwMDInLFxuICAgICctIFx1NEZFRVx1NjUzOSBzY3JlZW5zL2xheW91dHMgXHU2NUY2XHU0RkREXHU3NTU5XHUzMDBDXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFXHUzMDBEXHVGRjBDXHU1RTc2XHU2MjhBXHUzMDBDXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFXHUzMDBEXHU1M0NBIEB3aXJlZnJhbWUtc2tpbGwgXHU2NkY0XHU2NUIwXHU0RTNBXHU1RjUzXHU1MjREIHNraWxsIFx1NzI0OFx1NjcyQ1x1MzAwMicsXG4gICAgJy0gXHU0RkREXHU2MzAxIHByb2plY3QubGlua3MgXHU0RTNBXHU5ODc1XHU5NzYyXHU2RDQxXHU3Njg0XHU1NTJGXHU0RTAwXHU4RkI5XHU2NTcwXHU2MzZFXHVGRjFCXHU1QjhDXHU2MjEwXHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU1RTc2XHU5QThDXHU4QkMxXHU3NTNCXHU2NzdGXHUzMDAxXHU2RjE0XHU3OTNBXHU1NDhDXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGXHUzMDAyJyxcbiAgXVxuXG4gIGlmICghaXRlbXM/Lmxlbmd0aCkge1xuICAgIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDInKVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJldmlld1RhcmdldHMoaXRlbSlcbiAgICBsaW5lcy5wdXNoKCcnLCBgIyMgXHU0RkVFXHU2NTM5ICR7aXRlbUluZGV4ICsgMX1cdUZGMUEke1RZUEVfTEFCRUxTW2l0ZW0udHlwZV0gfHwgVFlQRV9MQUJFTFMuY29tbWVudH1gKVxuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2NyZWVuSWQgPSB0YXJnZXQuc2NyZWVuSWQgfHwgaXRlbS5zY3JlZW5JZFxuICAgICAgbGluZXMucHVzaChcbiAgICAgICAgJycsXG4gICAgICAgIGBcdTc2RUVcdTY4MDcgJHt0YXJnZXRJbmRleCArIDF9XHVGRjFBJHt0YXJnZXQuc2NyZWVuVGl0bGUgfHwgaXRlbS5zY3JlZW5UaXRsZSB8fCBzY3JlZW5JZCB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU5ODc1XHU5NzYyJ31gLFxuICAgICAgICBgXHU5ODc1XHU5NzYyIElEXHVGRjFBJHtzY3JlZW5JZCB8fCAnXHU2NzJBXHU3N0U1J31gLFxuICAgICAgICBgXHU2RTkwXHU3ODAxXHU2M0QwXHU3OTNBXHVGRjFBJHt0YXJnZXQuc291cmNlSGludCB8fCBpdGVtLnNvdXJjZUhpbnQgfHwgKHNjcmVlbklkID8gYHNyYy9zY3JlZW5zLyR7c2NyZWVuSWR9LmpzeGAgOiAnXHU4QkY3XHU2NDFDXHU3RDIyXHU5MDA5XHU2MkU5XHU1NjY4Jyl9YCxcbiAgICAgICAgJ0RPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdUZGMUEnLFxuICAgICAgICBgXFxgJHt0YXJnZXQuc2VsZWN0b3J9XFxgYCxcbiAgICAgIClcbiAgICAgIGlmICh0YXJnZXQuY3VycmVudFRleHQpIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjlcdUZGMUEnLCB0YXJnZXQuY3VycmVudFRleHQpXG4gICAgfSlcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU0RkVFXHU2NTM5XHU4OTgxXHU2QzQyXHVGRjFBJywgaXRlbVJlcXVlc3QoaXRlbSkpXG4gIH0pXG5cbiAgbGluZXMucHVzaChcbiAgICAnJyxcbiAgICAnIyMgXHU1QjhDXHU2MjEwXHU2ODA3XHU1MUM2JyxcbiAgICAnLSBcdTkwMTBcdTk4NzlcdTVCOENcdTYyMTBcdTRFRTVcdTRFMEFcdTRGRUVcdTY1MzlcdUZGMUJcdTgyRTVcdTkwMDlcdTYyRTlcdTU2NjhcdTVCRjlcdTVFOTRcdTUxNzFcdTRFQUIgbGF5b3V0XHVGRjBDXHU4QkY3XHU0RkVFXHU2NTM5XHU3NzFGXHU1QjlFXHU1QjlBXHU0RTQ5XHU0RjREXHU3RjZFXHVGRjBDXHU0RTBEXHU4OTgxXHU1NzI4IHNjcmVlbiBcdTRFMkRcdTU5MERcdTUyMzZcdTVCOUVcdTczQjBcdTMwMDInLFxuICAgICctIFx1NEUwRFx1NzUyOCBET00gXHU1QzQyXHU3RUE3XHU2MjE2IG50aC1jaGlsZCBcdTY2RkZcdTRFRTNcdTVERjJcdTY3MDlcdTc2ODRcdTdBMzNcdTVCOUFcdTRFMUFcdTUyQTFcdTkwMDlcdTYyRTlcdTU2NjhcdTMwMDInLFxuICAgICctIFx1Njc4NFx1NUVGQVx1NjIxMFx1NTI5Rlx1NTQwRVx1NjhDMFx1NjdFNVx1NTNEN1x1NUY3MVx1NTRDRFx1OTg3NVx1OTc2Mlx1NTNDQVx1NTE3Nlx1NEUwQVx1NEUwQlx1NkUzOFx1OERGM1x1OEY2Q1x1MzAwMicsXG4gIClcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCBjb25zdCBSRVZJRVdfVFlQRV9MQUJFTFMgPSBUWVBFX0xBQkVMU1xuIiwgImltcG9ydCB7IGlzU2Nyb2xsYWJsZU92ZXJmbG93IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5jb25zdCBTVFlMRV9LRVlTID0gW1xuICAnd2lkdGgnLFxuICAnaGVpZ2h0JyxcbiAgJ21pbldpZHRoJyxcbiAgJ21pbkhlaWdodCcsXG4gICdvdmVyZmxvdycsXG4gICdvdmVyZmxvd1gnLFxuICAnb3ZlcmZsb3dZJyxcbiAgJ21heFdpZHRoJyxcbiAgJ21heEhlaWdodCcsXG5dXG5cbi8qKiBcdTgyODJcdTcwQjlcdTVGNTNcdTUyNERcdTY2MkZcdTU0MjZcdTU2RTAgb3ZlcmZsb3cgXHU0RUE3XHU3NTFGXHU1M0VGXHU2RURBXHU1MkE4XHU2RUEyXHU1MUZBICovXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKGVsKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZVxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQgKyAxXG4gIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIGVsLnNjcm9sbFdpZHRoID4gZWwuY2xpZW50V2lkdGggKyAxXG4gIHJldHVybiBjYW5ZIHx8IGNhblhcbn1cblxuZnVuY3Rpb24gZGVwdGhGcm9tKHJvb3RFbCwgZWwpIHtcbiAgbGV0IGRlcHRoID0gMFxuICBsZXQgbm9kZSA9IGVsXG4gIHdoaWxlIChub2RlICYmIG5vZGUgIT09IHJvb3RFbCkge1xuICAgIGRlcHRoICs9IDFcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIGRlcHRoXG59XG5cbi8qKlxuICogXHU2NTM2XHU5NkM2XHU5NzAwXHU2NDkxXHU1RjAwXHU3Njg0XHU4MjgyXHU3MEI5XHVGRjFBXHU1M0VGXHU2RURBXHU1MkE4XHU4MjgyXHU3MEI5ICsgXHU0RTBBXHU2RUFGXHU1MjMwIHJvb3QgXHU3Njg0XHU3OTU2XHU1MTQ4XHUzMDAyXG4gKiBcdTZERjFcdTgyODJcdTcwQjlcdTU3MjhcdTUyNERcdUZGMENcdTUxNDhcdTY0OTFcdTUxODVcdTVDNDJcdTUxOERcdTY0OTFcdTU5MTZcdTU4RjNcdUZGMDhcdTkwN0ZcdTUxNEQgZ3JpZCAvIHdpZHRoOjEwMCUgXHU2MjhBXHU1OTE2XHU2ODQ2XHU1MzYxXHU2QjdCXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbCkge1xuICBpZiAoIXJvb3RFbCkgcmV0dXJuIFtdXG4gIGNvbnN0IHNjcm9sbGFibGVzID0gW11cbiAgY29uc3QgdmlzaXQgPSAobm9kZSkgPT4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiA/IEFycmF5LmZyb20obm9kZS5jaGlsZHJlbikgOiBbXVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHZpc2l0KGNoaWxkKVxuICAgIGlmIChub2RlID09PSByb290RWwgfHwgaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKG5vZGUpKSBzY3JvbGxhYmxlcy5wdXNoKG5vZGUpXG4gIH1cbiAgdmlzaXQocm9vdEVsKVxuXG4gIGNvbnN0IHNldCA9IG5ldyBTZXQoc2Nyb2xsYWJsZXMpXG4gIGZvciAoY29uc3QgZWwgb2Ygc2Nyb2xsYWJsZXMpIHtcbiAgICAvLyByb290IFx1NjcyQ1x1OEVBQlx1NURGMlx1NTcyOFx1OTZDNlx1NTQwOFx1NEUyRFx1RkYxQlx1NEVDRVx1NUI4M1x1NzY4NFx1NzIzNlx1ODI4Mlx1NzBCOVx1N0VFN1x1N0VFRFx1NEUwQVx1NkVBRlx1NEYxQVx1OEQ4QVx1OEZDNyBzY3JlZW4gXHU4RkI5XHU3NTRDXHVGRjBDXG4gICAgLy8gXHU2MjhBIFNjcmVlbkZyYW1lXHUzMDAxY2FudmFzXHUzMDAxYm9hcmQgXHU3NTFBXHU4MUYzIGJvZHkvaHRtbCBcdTRFMDBcdTVFNzZcdTY1MzlcdTUxOTlcdTMwMDJcbiAgICBpZiAoZWwgPT09IHJvb3RFbCkgY29udGludWVcbiAgICBsZXQgbm9kZSA9IGVsLnBhcmVudEVsZW1lbnRcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgc2V0LmFkZChub2RlKVxuICAgICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnNldF0uc29ydCgoYSwgYikgPT4gZGVwdGhGcm9tKHJvb3RFbCwgYikgLSBkZXB0aEZyb20ocm9vdEVsLCBhKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNuYXBzaG90SW5saW5lQm94KGVsKSB7XG4gIGNvbnN0IG91dCA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIG91dFtrZXldID0gZWwuc3R5bGVba2V5XSB8fCAnJ1xuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlSW5saW5lQm94KGVsLCBzbmFwc2hvdCkge1xuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSB7XG4gICAgZWwuc3R5bGVba2V5XSA9IHNuYXBzaG90W2tleV0gfHwgJydcbiAgfVxufVxuXG4vKipcbiAqIG9mZnNldFRvcCAvIG9mZnNldExlZnQgXHU3NkY4XHU1QkY5IG9mZnNldFBhcmVudFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NEUwMFx1NUI5QVx1NzZGOFx1NUJGOVx1NzZGNFx1NjNBNVx1NzIzNlx1ODI4Mlx1NzBCOVx1MzAwMlxuICogXHU1NDBFXHU1M0YwXHU5ODc1XHU5MUNDXHU4RkRFXHU3RUVEXHU3Njg0IHN0YXRpYyBcdTVCQjlcdTU2NjhcdTkwMUFcdTVFMzhcdTUxNzFcdTRFQUIgc2NyZWVuIHJvb3QgXHU0RjVDXHU0RTNBIG9mZnNldFBhcmVudFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU5NzAwXHU4OTgxXHU1MTQ4XHU2MzYyXHU3Qjk3XHU1MjMwXHU1RjUzXHU1MjREXHU3MjM2XHU4MjgyXHU3MEI5XHU1NzUwXHU2ODA3XHVGRjBDXHU5MDdGXHU1MTREXHU5MDEwXHU1QzQyXHU5MUNEXHU1OTBEXHU3RDJGXHU1MkEwXHU1NDBDXHU0RTAwXHU2QkI1XHU1MDRGXHU3OUZCXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCBheGlzKSB7XG4gIGNvbnN0IG9mZnNldEtleSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnXG4gIGNvbnN0IHJlY3RTdGFydCA9IGF4aXMgPT09ICd4JyA/ICdsZWZ0JyA6ICd0b3AnXG4gIGNvbnN0IHJlY3RTaXplID0gYXhpcyA9PT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIGNvbnN0IGxheW91dFNpemUgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcbiAgY29uc3Qgc2Nyb2xsS2V5ID0gYXhpcyA9PT0gJ3gnID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCdcbiAgY29uc3QgY2hpbGRPZmZzZXQgPSBjaGlsZFtvZmZzZXRLZXldIHx8IDBcblxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbCkgcmV0dXJuIGNoaWxkT2Zmc2V0XG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgJiYgY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbC5vZmZzZXRQYXJlbnQpIHtcbiAgICByZXR1cm4gY2hpbGRPZmZzZXQgLSAoZWxbb2Zmc2V0S2V5XSB8fCAwKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgcGFyZW50UmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY2hpbGRSZWN0ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCByZW5kZXJlZFNpemUgPSBwYXJlbnRSZWN0W3JlY3RTaXplXVxuICAgIGNvbnN0IHNjYWxlID0gZWxbbGF5b3V0U2l6ZV0gPiAwICYmIHJlbmRlcmVkU2l6ZSA+IDBcbiAgICAgID8gcmVuZGVyZWRTaXplIC8gZWxbbGF5b3V0U2l6ZV1cbiAgICAgIDogMVxuICAgIGNvbnN0IHN0YXJ0ID0gKGNoaWxkUmVjdFtyZWN0U3RhcnRdIC0gcGFyZW50UmVjdFtyZWN0U3RhcnRdKSAvIHNjYWxlXG4gICAgICArIChlbFtzY3JvbGxLZXldIHx8IDApXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShzdGFydCkpIHJldHVybiBzdGFydFxuICB9XG5cbiAgcmV0dXJuIGNoaWxkT2Zmc2V0XG59XG5cbi8qKlxuICogb3ZlcmZsb3c6dmlzaWJsZSBcdTY1RjZcdTkwRThcdTUyMDZcdTZENEZcdTg5QzhcdTU2Njggc2Nyb2xsV2lkdGggXHUyMjQ4IGNsaWVudFdpZHRoXHVGRjBDXG4gKiBcdTYyNDBcdTRFRTVcdTUxOERcdTYyNkJcdTVCNTBcdTgyODJcdTcwQjkgb2Zmc2V0IFx1OEZCOVx1NzU0Q1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRFx1ODg2OFx1NjQ5MVx1NEUwRFx1NUYwMFx1NTkxNlx1Njg0Nlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUludHJpbnNpY0JveChlbCkge1xuICBsZXQgd2lkdGggPSBNYXRoLm1heChlbC5zY3JvbGxXaWR0aCB8fCAwLCBlbC5vZmZzZXRXaWR0aCB8fCAwKVxuICBsZXQgaGVpZ2h0ID0gTWF0aC5tYXgoZWwuc2Nyb2xsSGVpZ2h0IHx8IDAsIGVsLm9mZnNldEhlaWdodCB8fCAwKVxuICBjb25zdCBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuID8gQXJyYXkuZnJvbShlbC5jaGlsZHJlbikgOiBbXVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd4JykgKyAoY2hpbGQub2Zmc2V0V2lkdGggfHwgMCkpXG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3knKSArIChjaGlsZC5vZmZzZXRIZWlnaHQgfHwgMCkpXG4gIH1cbiAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUV4cGFuZGVkQm94KGVsKSB7XG4gIGVsLnN0eWxlLm1heFdpZHRoID0gJ25vbmUnXG4gIGVsLnN0eWxlLm1heEhlaWdodCA9ICdub25lJ1xuICBlbC5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1ggPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dZID0gJ3Zpc2libGUnXG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWVhc3VyZUludHJpbnNpY0JveChlbClcbiAgZWwuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICBlbC5zdHlsZS5taW5XaWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5taW5IZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG59XG5cbi8qKiBcdTY0OTFcdTVGMDAgcm9vdCBcdTUxODVcdTYyNDBcdTY3MDlcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUzQ0FcdTUxNzZcdTc5NTZcdTUxNDhcdUZGMUJcdThGRDRcdTU2REVcdTc1MjhcdTRFOEVcdTY1MzZcdThENzdcdTc2ODRcdTVGRUJcdTcxNjdcdTUyMTdcdTg4NjggKi9cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmRTY3JlZW5Db250ZW50KHJvb3RFbCkge1xuICBjb25zdCBub2RlcyA9IGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKVxuICBjb25zdCBzbmFwc2hvdHMgPSBub2Rlcy5tYXAoKGVsKSA9PiAoeyBlbCwgc3R5bGU6IHNuYXBzaG90SW5saW5lQm94KGVsKSB9KSlcbiAgZm9yIChjb25zdCB7IGVsIH0gb2Ygc25hcHNob3RzKSBhcHBseUV4cGFuZGVkQm94KGVsKVxuICAvLyBcdTVCNTBcdTdFQTdcdTY0OTFcdTVGMDBcdTU0MEVcdUZGMENcdTY4MzlcdTUxOERcdTkxQ0ZcdTRFMDBcdTZCMjFcdUZGMENcdTU0MDNcdTYzODlcdTZCOEJcdTRGNTlcdTZFQTJcdTUxRkFcbiAgYXBwbHlFeHBhbmRlZEJveChyb290RWwpXG4gIHJldHVybiBzbmFwc2hvdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlU2NyZWVuQ29udGVudChzbmFwc2hvdHMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNuYXBzaG90cykpIHJldHVyblxuICBmb3IgKGNvbnN0IHsgZWwsIHN0eWxlIH0gb2Ygc25hcHNob3RzKSByZXN0b3JlSW5saW5lQm94KGVsLCBzdHlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVDb250ZW50Qm94KHJvb3RFbCkge1xuICByZXR1cm4gbWVhc3VyZUludHJpbnNpY0JveChyb290RWwpXG59XG5cbi8qKlxuICogXHU1REU1XHU1MTc3XHU2ODBGXHU1QzU1XHU1RjAwL1x1NjUzNlx1OEQ3N1x1NzZFRVx1NjgwN1x1RkYxQVxuICogXHU2NzA5XHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUyRkVcdTkwMDlcdTk2QzZcdTU0MDhcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTE2OFx1OTBFOFx1NUM0Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbElkcykge1xuICBpZiAoc2VsZWN0ZWRJZHMgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICBpZiAoc2VsZWN0ZWRJZHMuc2l6ZSA+IDApIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RlZElkcykgJiYgc2VsZWN0ZWRJZHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH1cbiAgcmV0dXJuIFsuLi5hbGxJZHNdXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgU2NyZWVuSWRlbnRpdHlQcm92aWRlciB9IGZyb20gJy4uL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuaW1wb3J0IHsgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIC8vIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1ODQzRFx1NTIzMFx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlxuICAgIGlmIChjYW52YXNMb2NrZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBcdTVERjJcdTVDNTVcdTVGMDBcdTY1RTBcdTUzRUZcdTZFREFcdTUzM0FcdTU3REZcdUZGMENcdTRFMERcdTYyQTJcdTYzMDdcdTk0ODhcbiAgICBpZiAoZXhwYW5kZWQpIHJldHVyblxuICAgIGNvbnN0IHN0YXRlID0gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgY29udGVudFJlZi5jdXJyZW50LCB7IGxvY2tlZDogY2FudmFzTG9ja2VkLCBzY2FsZSB9KVxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IHN0YXRlXG4gICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgY29udGVudFJlZi5jdXJyZW50LCBuYXZpZ2F0ZSlcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuLyoqIFx1N0VEMVx1NUI5QVx1OTc1RSBwYXNzaXZlIHdoZWVsXHVGRjBDXHU2MjREXHU4MEZEXHU1NDA4XHU2Q0Q1IHByZXZlbnREZWZhdWx0XHVGRjA4UmVhY3Qgb25XaGVlbCBcdTlFRDhcdThCQTQgcGFzc2l2ZVx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRXaGVlbFpvb20oZWwsIGdldFNjYWxlLCBzZXRTY2FsZSwgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UpIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgbG9ja2VkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuXG4gIFJlYWN0LnVzZUVmZmVjdChcbiAgICAoKSA9PiBiaW5kV2hlZWxab29tKFxuICAgICAgZWxlbWVudFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gc2NhbGVSZWYuY3VycmVudCxcbiAgICAgIHNldFNjYWxlLFxuICAgICAgKCkgPT4gbG9ja2VkUmVmLmN1cnJlbnQsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImV4cG9ydCBjb25zdCBDQU5WQVNfSU5ERVhfTUFSR0lOID0gMTZcblxuZnVuY3Rpb24gZmluaXRlKHZhbHVlLCBmYWxsYmFjayA9IDApIHtcbiAgcmV0dXJuIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24ocG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICBjb25zdCBjb250YWluZXJXaWR0aCA9IE1hdGgubWF4KDAsIGZpbml0ZShjb250YWluZXI/LndpZHRoKSlcbiAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSlcbiAgY29uc3QgaXRlbVdpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LndpZHRoKSlcbiAgY29uc3QgaXRlbUhlaWdodCA9IE1hdGgubWF4KDAsIGZpbml0ZShpdGVtPy5oZWlnaHQpKVxuICBjb25zdCBtYXhYID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJXaWR0aCAtIGl0ZW1XaWR0aCAtIG1hcmdpbilcbiAgY29uc3QgbWF4WSA9IE1hdGgubWF4KG1hcmdpbiwgY29udGFpbmVySGVpZ2h0IC0gaXRlbUhlaWdodCAtIG1hcmdpbilcbiAgcmV0dXJuIHtcbiAgICB4OiBNYXRoLm1pbihNYXRoLm1heChmaW5pdGUocG9zaXRpb24/LngsIG1hcmdpbiksIG1hcmdpbiksIG1heFgpLFxuICAgIHk6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueSwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSwgbWFyZ2luID0gQ0FOVkFTX0lOREVYX01BUkdJTikge1xuICByZXR1cm4gY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKHtcbiAgICB4OiAoZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpIC0gZmluaXRlKGl0ZW0/LndpZHRoKSkgLyAyLFxuICAgIHk6IGZpbml0ZShjb250YWluZXI/LmhlaWdodCkgLSBmaW5pdGUoaXRlbT8uaGVpZ2h0KSAtIG1hcmdpbixcbiAgfSwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhnZXRFbGVtZW50cywgb25SZWFkeSwgc2NoZWR1bGVyKSB7XG4gIGxldCBhY3RpdmUgPSB0cnVlXG4gIGxldCBmcmFtZSA9IG51bGxcblxuICBjb25zdCBhdHRlbXB0ID0gKCkgPT4ge1xuICAgIGlmICghYWN0aXZlKSByZXR1cm5cbiAgICBjb25zdCBlbGVtZW50cyA9IGdldEVsZW1lbnRzKClcbiAgICBpZiAoIWVsZW1lbnRzPy5jb250YWluZXIgfHwgIWVsZW1lbnRzPy5pdGVtKSB7XG4gICAgICBmcmFtZSA9IHNjaGVkdWxlci5yZXF1ZXN0KGF0dGVtcHQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZnJhbWUgPSBudWxsXG4gICAgb25SZWFkeShlbGVtZW50cylcbiAgfVxuXG4gIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBhY3RpdmUgPSBmYWxzZVxuICAgIGlmIChmcmFtZSAhPSBudWxsKSBzY2hlZHVsZXIuY2FuY2VsKGZyYW1lKVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IGZvY3VzQ2FudmFzU2NyZWVuLCByZXNldENhbnZhc1ZpZXdwb3J0LCBwYW5Gcm9tRHJhZ1NuYXBzaG90IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7XG4gIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbixcbiAgZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24sXG4gIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzLFxufSBmcm9tICcuL2NhbnZhcy1pbmRleC5qcydcblxuY29uc3QgSU5ERVhfRFJBR19USFJFU0hPTEQgPSA0XG5cbmZ1bmN0aW9uIGVsZW1lbnRTaXplKGVsZW1lbnQpIHtcbiAgcmV0dXJuIHsgd2lkdGg6IGVsZW1lbnQ/Lm9mZnNldFdpZHRoIHx8IDAsIGhlaWdodDogZWxlbWVudD8ub2Zmc2V0SGVpZ2h0IHx8IDAgfVxufVxuXG5mdW5jdGlvbiBDYW52YXNJbmRleCh7XG4gIGNhbnZhc1JlZixcbiAgcHJvamVjdCxcbiAgY3VycmVudFNjcmVlbklkLFxuICBkZW1vQXZhaWxhYmxlLFxuICBwb3NpdGlvbixcbiAgb25Qb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZSxcbiAgbmF2aWdhdGUsXG4gIGVudGVyRGVtbyxcbn0pIHtcbiAgY29uc3QgaW5kZXhSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IGNvbnN0cmFpbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0UG9zaXRpb24sIHVzZURlZmF1bHQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgY29uc3QgaW5kZXggPSBpbmRleFJlZi5jdXJyZW50XG4gICAgaWYgKCFjYW52YXMgfHwgIWluZGV4KSByZXR1cm4gbmV4dFBvc2l0aW9uXG4gICAgY29uc3QgY29udGFpbmVyID0geyB3aWR0aDogY2FudmFzLmNsaWVudFdpZHRoLCBoZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQgfVxuICAgIGNvbnN0IGl0ZW0gPSBlbGVtZW50U2l6ZShpbmRleClcbiAgICByZXR1cm4gdXNlRGVmYXVsdFxuICAgICAgPyBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbihjb250YWluZXIsIGl0ZW0pXG4gICAgICA6IGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihuZXh0UG9zaXRpb24sIGNvbnRhaW5lciwgaXRlbSlcbiAgfSwgW2NhbnZhc1JlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBsZXQgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHt9XG4gICAgY29uc3Qgc3RvcFdhaXRpbmcgPSB3YWl0Rm9yQ2FudmFzSW5kZXhFbGVtZW50cyhcbiAgICAgICgpID0+ICh7IGNvbnRhaW5lcjogY2FudmFzUmVmLmN1cnJlbnQsIGl0ZW06IGluZGV4UmVmLmN1cnJlbnQgfSksXG4gICAgICAoeyBjb250YWluZXI6IGNhbnZhcywgaXRlbTogaW5kZXggfSkgPT4ge1xuICAgICAgICBjb25zdCB1cGRhdGUgPSAoKSA9PiBvblBvc2l0aW9uQ2hhbmdlKChjdXJyZW50KSA9PiBjb25zdHJhaW4oY3VycmVudCwgIWN1cnJlbnQpKVxuICAgICAgICB1cGRhdGUoKVxuXG4gICAgICAgIGlmICh0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih1cGRhdGUpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShjYW52YXMpXG4gICAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShpbmRleClcbiAgICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgICAgZGlzY29ubmVjdFJlc2l6ZSA9ICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB1cGRhdGUpXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICByZXF1ZXN0OiAoY2FsbGJhY2spID0+IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2FsbGJhY2spLFxuICAgICAgICBjYW5jZWw6IChmcmFtZSkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKSxcbiAgICAgIH0sXG4gICAgKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHN0b3BXYWl0aW5nKClcbiAgICAgIGRpc2Nvbm5lY3RSZXNpemUoKVxuICAgIH1cbiAgfSwgW2NhbnZhc1JlZiwgY29uc3RyYWluLCBvblBvc2l0aW9uQ2hhbmdlXSlcblxuICBjb25zdCBmaW5pc2hEcmFnID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17aW5kZXhSZWZ9XG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLWNhbnZhcy1pbmRleCBpcy1kcmFnZ2luZycgOiAnd2YtY2FudmFzLWluZGV4J31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHZpc2liaWxpdHk6ICdoaWRkZW4nIH19XG4gICAgPlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWhhbmRsZVwiXG4gICAgICAgIGFyaWEtbGFiZWw9XCJcdTYyRDZcdTUyQThcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICB0aXRsZT1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIG9uUG9pbnRlckRvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uIHx8IGNvbnN0cmFpbihudWxsLCB0cnVlKVxuICAgICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgICAgb3JpZ2luLFxuICAgICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgZHJhZyA9IGRyYWdSZWYuY3VycmVudFxuICAgICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgICBjb25zdCBkZWx0YVkgPSBldmVudC5jbGllbnRZIC0gZHJhZy5zdGFydFlcbiAgICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBJTkRFWF9EUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2UoY29uc3RyYWluKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KSlcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZmluaXNoRHJhZ31cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWdyaXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48aSAvPjxpIC8+PGkgLz48L3NwYW4+XG4gICAgICAgIDxzcGFuPlx1N0QyMlx1NUYxNTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1pbmRleC1kb3QgaXMtYWN0aXZlJyA6ICd3Zi1jYW52YXMtaW5kZXgtZG90J31cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApKX1cbiAgICAgIDwvZGl2PlxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LWNsb3NlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NTE3M1x1OTVFRFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDE2IDE2XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PHBhdGggZD1cIm00IDQgOCA4TTEyIDRsLTggOFwiIC8+PC9zdmc+XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG4gIG9uQ2FudmFzQ2xpY2ssXG4gIGNhbnZhc0luZGV4VmlzaWJsZSA9IHRydWUsXG4gIGNhbnZhc0luZGV4UG9zaXRpb24sXG4gIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZSxcbiAgb25DbG9zZUNhbnZhc0luZGV4LFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgbmF2aWdhdGUsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgZW50ZXJEZW1vOiBlbnRlckRlbW9Nb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2lkZWJhckNvbGxhcHNlZCwgc2V0U2lkZWJhckNvbGxhcHNlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NvcGllZEtleSwgc2V0Q29waWVkS2V5XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtjb3B5VG9hc3QsIHNldENvcHlUb2FzdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNhbnZhc1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjb3BpZWRUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgZHJhZ2dpbmdSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGRyYWdnaW5nUmVmLmN1cnJlbnQgPSBkcmFnZ2luZ1xuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogY3VycmVudC5zY2FsZSB9KSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nUmVmLmN1cnJlbnQpIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNvbnN0IGFwcGx5ID0gKCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgICAgaWYgKCFjYW52YXMgfHwgIXN0YWdlKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHNjcmVlbkVsID0gc3RhZ2UucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FudmFzLXNjcmVlbi1pZD1cIiR7Y3VycmVudFNjcmVlbklkfVwiXWApXG4gICAgICBpZiAoIXNjcmVlbkVsKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IGN1cnJlbnRTY2FsZSA9IHNjYWxlUmVmLmN1cnJlbnRcbiAgICAgIGlmIChjdXJyZW50U2NhbGUgPD0gMCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzdGFnZUJveCA9IHN0YWdlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBzY3JlZW5Cb3ggPSBzY3JlZW5FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3QgbmV4dCA9IGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgICAgICAgY29udGFpbmVyV2lkdGg6IGNhbnZhcy5jbGllbnRXaWR0aCxcbiAgICAgICAgY29udGFpbmVySGVpZ2h0OiBjYW52YXMuY2xpZW50SGVpZ2h0LFxuICAgICAgICBzY3JlZW5MZWZ0OiAoc2NyZWVuQm94LmxlZnQgLSBzdGFnZUJveC5sZWZ0KSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuVG9wOiAoc2NyZWVuQm94LnRvcCAtIHN0YWdlQm94LnRvcCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbldpZHRoOiBzY3JlZW5Cb3gud2lkdGggLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlbkhlaWdodDogc2NyZWVuQm94LmhlaWdodCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgY3VycmVudFNjYWxlLFxuICAgICAgfSlcbiAgICAgIGlmICghbmV4dCkgcmV0dXJuIGZhbHNlXG4gICAgICBzZXRTY2FsZShuZXh0LnNjYWxlKVxuICAgICAgc2V0VmlldyhuZXh0KVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoYXBwbHkoKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IGZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICBhcHBseSgpXG4gICAgfSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lKVxuICB9LCBbY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydEtleSwgc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgfSwgW10pXG5cbiAgdXNlV2hlZWxab29tKGNhbnZhc1JlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3QgZW50ZXJEZW1vID0gKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFkZW1vQXZhaWxhYmxlIHx8IGNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgZW50ZXJEZW1vTW9kZShzY3JlZW5JZClcbiAgfVxuXG4gIGNvbnN0IGNvcHlNZXRhID0gKGtleSwgdGV4dCwgZXZlbnQpID0+IHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBjb3B5VGV4dCh0ZXh0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZEtleShrZXkpXG4gICAgICBzZXRDb3B5VG9hc3QoJ1x1NURGMlx1NTkwRFx1NTIzNicpXG4gICAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICAgICAgY29waWVkVGltZXIuY3VycmVudCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0Q29waWVkS2V5KG51bGwpXG4gICAgICAgIHNldENvcHlUb2FzdChudWxsKVxuICAgICAgfSwgMTIwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlU2VsZWN0ZWQgPSAoaWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZUFsbCA9ICgpID0+IHtcbiAgICBzZXRTZWxlY3RlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCkgcmV0dXJuIG5ldyBTZXQoKVxuICAgICAgcmV0dXJuIG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2FudmFzLXNoZWxsXCI+XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLXNpZGViYXIke3NpZGViYXJDb2xsYXBzZWQgPyAnIGlzLWNvbGxhcHNlZCcgOiAnJ31gfSBhcmlhLWhpZGRlbj17c2lkZWJhckNvbGxhcHNlZH0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0aXRsZT1cIlx1NjUzNlx1OEQ3N1x1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZCh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTYgMTUtMy0zIDMtM1wiIC8+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDx1bCBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbGlzdFwiPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICA8bGlcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoKSA9PiBlbnRlckRlbW8oc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgICAgdG9nZ2xlU2VsZWN0ZWQoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBldmVudC5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU5MDA5XHU2MkU5ICR7c2NyZWVuLnRpdGxlfWB9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAge3NpZGViYXJDb2xsYXBzZWQgPyAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWV4cGFuZFwiXG4gICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICA+XG4gICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwiTTkgM3YxOFwiIC8+XG4gICAgICAgICAgICA8cGF0aCBkPVwibTE0IDkgMyAzLTMgM1wiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKSA6IG51bGx9XG4gICAgICA8bWFpblxuICAgICAgICByZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtY2FudmFzJHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uQ2xpY2s9e29uQ2FudmFzQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGl0bGVUZXh0ID0gYCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YFxuICAgICAgICAgICAgY29uc3QgZmlsZVRleHQgPSBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlS2V5ID0gYCR7c2NyZWVuLmlkfTp0aXRsZWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVLZXkgPSBgJHtzY3JlZW4uaWR9OmZpbGVgXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZCA/ICd3Zi1jYW52YXMtc2NyZWVuIGlzLWZvY3VzZWQnIDogJ3dmLWNhbnZhcy1zY3JlZW4nfVxuICAgICAgICAgICAgICAgIGRhdGEtY2FudmFzLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBuYXZpZ2F0ZShzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgICAgICAgIGVudGVyRGVtbyhzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLW1ldGFcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLW1ldGEtdGl0bGUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YSh0aXRsZUtleSwgdGl0bGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt0aXRsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzY3JlZW4uZGVzY3JpcHRpb24gPyA8ZGl2PntzY3JlZW4uZGVzY3JpcHRpb259PC9kaXY+IDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgd2YtbWV0YS1saW5lIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICcgaXMtY29waWVkJyA6ICcnfWB9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKGZpbGVLZXksIGZpbGVUZXh0LCBldmVudCl9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmc+XHU2NTg3XHU0RUY2XHVGRjFBPC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgICAgIHtmaWxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICAgICAgICBtb2RlPVwiY2FudmFzXCJcbiAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgIGZvY3VzZWQ9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWQ9e2V4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9eygpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvbkV4cG9ydD17KCkgPT4gb25FeHBvcnRJZHMoW3NjcmVlbi5pZF0pfVxuICAgICAgICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7Y2FudmFzSW5kZXhWaXNpYmxlID8gKFxuICAgICAgICAgIDxDYW52YXNJbmRleFxuICAgICAgICAgICAgY2FudmFzUmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgICAgY3VycmVudFNjcmVlbklkPXtjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICBkZW1vQXZhaWxhYmxlPXtkZW1vQXZhaWxhYmxlfVxuICAgICAgICAgICAgcG9zaXRpb249e2NhbnZhc0luZGV4UG9zaXRpb259XG4gICAgICAgICAgICBvblBvc2l0aW9uQ2hhbmdlPXtvbkNhbnZhc0luZGV4UG9zaXRpb25DaGFuZ2V9XG4gICAgICAgICAgICBvbkNsb3NlPXtvbkNsb3NlQ2FudmFzSW5kZXh9XG4gICAgICAgICAgICBuYXZpZ2F0ZT17bmF2aWdhdGV9XG4gICAgICAgICAgICBlbnRlckRlbW89e2VudGVyRGVtb31cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvbWFpbj5cbiAgICAgIHtjb3B5VG9hc3QgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9hc3RcIiByb2xlPVwic3RhdHVzXCI+e2NvcHlUb2FzdH08L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7XG4gIGZpdERlbW9TY2FsZSxcbiAgaXNEZW1vQmxhbmtFeGl0VGFyZ2V0LFxuICBwYW5Gcm9tRHJhZ1NuYXBzaG90LFxuICByZXNldENhbnZhc1ZpZXdwb3J0LFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5cbmNvbnN0IEJMQU5LX0VYSVRfSElOVCA9ICdcdTUzQ0NcdTUxRkJcdTdBN0FcdTc2N0RcdTU5MDRcdTkwMDBcdTUxRkFcdTZGMTRcdTc5M0EnXG5cbmZ1bmN0aW9uIHJlYWRDb250ZW50Qm94KGVsKSB7XG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IHBhZFggPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdMZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1JpZ2h0KVxuICBjb25zdCBwYWRZID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSlcbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogTWF0aC5tYXgoMCwgZWwuY2xpZW50V2lkdGggLSBwYWRYKSxcbiAgICBoZWlnaHQ6IE1hdGgubWF4KDAsIGVsLmNsaWVudEhlaWdodCAtIHBhZFkpLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEZW1vTW9kZSh7XG4gIHByb2plY3QsXG4gIGhvdHNwb3RzVmlzaWJsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzY2FsZSxcbiAgc2V0U2NhbGUsXG4gIHZpZXdSZXNldEtleSxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxuICBvbkNhbnZhc0NsaWNrLFxufSkge1xuICBjb25zdCB7IGN1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBzZXRNb2RlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBzY3JlZW5JbmRleCA9IHByb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcbiAgY29uc3Qgc2NyZWVuID0gc2NyZWVuSW5kZXggPj0gMCA/IHByb2plY3Quc2NyZWVuc1tzY3JlZW5JbmRleF0gOiBudWxsXG4gIGNvbnN0IGN1cnJlbnRFeHBhbmRlZCA9ICEhKHNjcmVlbiAmJiBleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKSlcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCB2aWV3cG9ydFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzdGFnZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGV4aXRPbkJsYW5rRG91YmxlQ2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm5cbiAgICBzZXRNb2RlKCdjYW52YXMnKVxuICB9XG5cbiAgLy8gdGl0bGUgXHU2MzAyXHU1NzI4XHU4OUM2XHU1M0UzXHU0RTBBXHU0RjFBXHU4NDNEXHU1MjMwXHU1QzRGXHU1MTg1XHU1QjUwXHU4MjgyXHU3MEI5XHVGRjBDXHU1RTcyXHU2MjcwXHU2NENEXHU0RjVDXHVGRjFCXHU1M0VBXHU1NzI4XHU3QTdBXHU3NjdEXHU1OTA0XHU2MEFDXHU1MDVDXHU2NUY2XHU2MzAyXHU0RTBBXHUzMDAyXG4gIGNvbnN0IHN5bmNCbGFua0V4aXRIaW50ID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZWwgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgaWYgKCFlbCkgcmV0dXJuXG4gICAgY29uc3QgbmV4dCA9IGlzRGVtb0JsYW5rRXhpdFRhcmdldChldmVudC50YXJnZXQpID8gQkxBTktfRVhJVF9ISU5UIDogJydcbiAgICBpZiAoKGVsLmdldEF0dHJpYnV0ZSgndGl0bGUnKSB8fCAnJykgPT09IG5leHQpIHJldHVyblxuICAgIGlmIChuZXh0KSBlbC5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgbmV4dClcbiAgICBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgY2xlYXJCbGFua0V4aXRIaW50ID0gKCkgPT4ge1xuICAgIHZpZXdwb3J0UmVmLmN1cnJlbnQ/LnJlbW92ZUF0dHJpYnV0ZSgndGl0bGUnKVxuICB9XG5cbiAgY29uc3QgYXBwbHlGaXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8ICFzdGFnZSkgcmV0dXJuXG4gICAgY29uc3QgYm94ID0gcmVhZENvbnRlbnRCb3goY29udGFpbmVyKVxuICAgIGNvbnN0IG5leHQgPSBmaXREZW1vU2NhbGUoYm94LndpZHRoLCBib3guaGVpZ2h0LCBzdGFnZS5vZmZzZXRXaWR0aCwgc3RhZ2Uub2Zmc2V0SGVpZ2h0KVxuICAgIHNldFNjYWxlKG5leHQpXG4gICAgc2V0Vmlldyh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IG5leHQgfSlcbiAgfSwgW3NldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHNjYWxlIH0pKVxuICB9LCBbc2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVyID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGNvbnN0IHN0YWdlID0gc3RhZ2VSZWYuY3VycmVudFxuICAgIGlmICghY29udGFpbmVyIHx8IHR5cGVvZiBSZXNpemVPYnNlcnZlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYXBwbHlGaXQoKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBjb25zdCBvYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiBhcHBseUZpdCgpKVxuICAgIG9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyKVxuICAgIGlmIChzdGFnZSkgb2JzZXJ2ZXIub2JzZXJ2ZShzdGFnZSlcbiAgICBhcHBseUZpdCgpXG4gICAgcmV0dXJuICgpID0+IG9ic2VydmVyLmRpc2Nvbm5lY3QoKVxuICB9LCBbYXBwbHlGaXQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgY3VycmVudFNjcmVlbklkLCB2aWV3UmVzZXRLZXksIGN1cnJlbnRFeHBhbmRlZF0pXG5cbiAgdXNlV2hlZWxab29tKHZpZXdwb3J0UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtZGVtbyBpcy1zaG93aW5nLWhvdHNwb3RzJyA6ICd3Zi1kZW1vJ30+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17dmlld3BvcnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWRlbW8tdmlld3BvcnQke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgICAgb25Nb3VzZU1vdmU9e3N5bmNCbGFua0V4aXRIaW50fVxuICAgICAgICBvbk1vdXNlTGVhdmU9e2NsZWFyQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25DbGljaz17b25DYW52YXNDbGlja31cbiAgICAgICAgb25Eb3VibGVDbGljaz17ZXhpdE9uQmxhbmtEb3VibGVDbGlja31cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtZGVtby1zdGFnZVwiXG4gICAgICAgICAgc3R5bGU9e3sgdHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7dmlldy5wYW5YfXB4LCAke3ZpZXcucGFuWX1weCkgc2NhbGUoJHt2aWV3LnNjYWxlfSlgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgbW9kZT1cImRlbW9cIlxuICAgICAgICAgICAgaW5kZXg9e3NjcmVlbkluZGV4fVxuICAgICAgICAgICAgZXhwYW5kZWQ9e2N1cnJlbnRFeHBhbmRlZH1cbiAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXtzY3JlZW4gJiYgb25Ub2dnbGVFeHBhbmQgPyAoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgICBzY2FsZT17dmlldy5zY2FsZX1cbiAgICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBvblJldmlld1NlbGVjdD17b25SZXZpZXdTZWxlY3R9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWRlbW8taGludFwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NTE4NVx1NjMwOVx1OTRBRSAvIFx1OTRGRVx1NjNBNVx1OERGM1x1OEY2Q1x1RkYxQlx1NTNFRlx1NTcyOFx1NURFNVx1NTE3N1x1NjgwRlx1NUYwMFx1NTE3M1x1NzBFRFx1NTMzQVx1OUFEOFx1NEVBRVx1RkYxQlx1NjgwN1x1OTg5OFx1NjgwRlx1NTNFRlx1NEUzNFx1NjVGNlx1NUM1NVx1NUYwMFx1NzcwQlx1NTE2OFx1OEM4QzwvcD5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGV4cGFuZFNjcmVlbkNvbnRlbnQsIG1lYXN1cmVDb250ZW50Qm94IH0gZnJvbSAnLi9leHBhbmQuanMnXG5cbmxldCBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG5cbmNvbnN0IGxpYnJhcmllcyA9IFtcbiAgeyBmaWxlOiAnaHRtbDJjYW52YXMubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuaHRtbDJjYW52YXMgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnanN6aXAubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuSlNaaXAgPT09ICdmdW5jdGlvbicgfSxcbiAgeyBmaWxlOiAnRmlsZVNhdmVyLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LnNhdmVBcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuXVxuXG5mdW5jdGlvbiBsb2FkU2NyaXB0KGZpbGUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgZXhpc3RpbmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBzY3JpcHRbZGF0YS13aXJlZnJhbWUtZXhwb3J0PVwiJHtmaWxlfVwiXWApXG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZiAoZXhpc3RpbmcuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9PT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgZXhpc3RpbmcucmVtb3ZlKClcbiAgICAgICAgZXhpc3RpbmcgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIHJlc29sdmUsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgZXhpc3RpbmcuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCByZWplY3QsIHsgb25jZTogdHJ1ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHZlbmRvckJhc2UgPSB3aW5kb3cuV0lSRUZSQU1FX1ZFTkRPUl9CQVNFXG4gICAgaWYgKCF2ZW5kb3JCYXNlKSB7XG4gICAgICByZWplY3QobmV3IEVycm9yKCdcdTY3MkFcdTkxNERcdTdGNkVcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTNcdThERUZcdTVGODQgV0lSRUZSQU1FX1ZFTkRPUl9CQVNFJykpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcbiAgICBzY3JpcHQuc3JjID0gbmV3IFVSTChmaWxlLCB2ZW5kb3JCYXNlKS5ocmVmXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0ID0gZmlsZVxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRpbmcnXG4gICAgc2NyaXB0Lm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID0gJ2xvYWRlZCdcbiAgICAgIHJlc29sdmUoKVxuICAgIH1cbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHNjcmlwdC5yZW1vdmUoKVxuICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXHU2NUUwXHU2Q0Q1XHU1MkEwXHU4RjdEXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzICR7ZmlsZX1gKSlcbiAgICB9XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkRXhwb3J0TGlicmFyaWVzKCkge1xuICBpZiAoIWV4cG9ydExpYnJhcmllc1Byb21pc2UpIHtcbiAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gbGlicmFyaWVzLnJlZHVjZShcbiAgICAgIChjaGFpbiwgbGlicmFyeSkgPT4gY2hhaW4udGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSBhd2FpdCBsb2FkU2NyaXB0KGxpYnJhcnkuZmlsZSlcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIHRocm93IG5ldyBFcnJvcihgXHU1QkZDXHU1MUZBXHU1RTkzXHU1MjFEXHU1OUNCXHU1MzE2XHU1OTMxXHU4RDI1OiAke2xpYnJhcnkuZmlsZX1gKVxuICAgICAgfSksXG4gICAgICBQcm9taXNlLnJlc29sdmUoKSxcbiAgICApLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IHVuZGVmaW5lZFxuICAgICAgdGhyb3cgZXJyb3JcbiAgICB9KVxuICB9XG4gIHJldHVybiBleHBvcnRMaWJyYXJpZXNQcm9taXNlXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYXB0dXJlU2NyZWVuKHNjcmVlbkVsZW1lbnQsIHZpZXdwb3J0LCB7IGV4cGFuZGVkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmICghc2NyZWVuRWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKCdcdTYyN0VcdTRFMERcdTUyMzBcdTg5ODFcdTVCRkNcdTUxRkFcdTc2ODQgc2NyZWVuIFx1NTE0M1x1N0QyMCcpXG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuXG4gIGNvbnN0IHNhbmRib3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzYW5kYm94LmNsYXNzTmFtZSA9ICd3Zi1leHBvcnQtc2FuZGJveCdcbiAgY29uc3QgY2xvbmUgPSBzY3JlZW5FbGVtZW50LmNsb25lTm9kZSh0cnVlKVxuICBzYW5kYm94LmFwcGVuZENoaWxkKGNsb25lKVxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNhbmRib3gpXG5cbiAgbGV0IHdpZHRoID0gdmlld3BvcnQud2lkdGhcbiAgbGV0IGhlaWdodCA9IHZpZXdwb3J0LmhlaWdodFxuICB0cnkge1xuICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgZXhwYW5kU2NyZWVuQ29udGVudChjbG9uZSlcbiAgICAgIGNvbnN0IGJveCA9IG1lYXN1cmVDb250ZW50Qm94KGNsb25lKVxuICAgICAgd2lkdGggPSBib3gud2lkdGhcbiAgICAgIGhlaWdodCA9IGJveC5oZWlnaHRcbiAgICB9XG4gICAgY2xvbmUuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBjbG9uZS5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gICAgc2FuZGJveC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIHNhbmRib3guc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuXG4gICAgY29uc3QgY2FudmFzID0gYXdhaXQgd2luZG93Lmh0bWwyY2FudmFzKGNsb25lLCB7XG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgc2NhbGU6IDIsXG4gICAgICB1c2VDT1JTOiBmYWxzZSxcbiAgICAgIGxvZ2dpbmc6IGZhbHNlLFxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIChibG9iKSA9PiBibG9iID8gcmVzb2x2ZShibG9iKSA6IHJlamVjdChuZXcgRXJyb3IoJ1BORyBcdTdGMTZcdTc4MDFcdTU5MzFcdThEMjUnKSksXG4gICAgICAgICdpbWFnZS9wbmcnLFxuICAgICAgKVxuICAgIH0pXG4gIH0gZmluYWxseSB7XG4gICAgc2FuZGJveC5yZW1vdmUoKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNsdWcodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSB8fCAnd2lyZWZyYW1lJylcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJylcbiAgICAucmVwbGFjZSgvXi18LSQvZywgJycpIHx8ICd3aXJlZnJhbWUnXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleHBvcnRTZWxlY3RlZChzY3JlZW5zKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzY3JlZW5zKSB8fCBzY3JlZW5zLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignXHU4MUYzXHU1QzExXHU5MDA5XHU2MkU5XHU0RTAwXHU0RTJBIHNjcmVlbicpXG4gIH1cbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG4gIGNvbnN0IGNhcHR1cmVkID0gW11cbiAgZm9yIChjb25zdCBzY3JlZW4gb2Ygc2NyZWVucykge1xuICAgIGNhcHR1cmVkLnB1c2goe1xuICAgICAgbmFtZTogYCR7c2x1ZyhzY3JlZW4uaWQpfS5wbmdgLFxuICAgICAgYmxvYjogYXdhaXQgY2FwdHVyZVNjcmVlbihzY3JlZW4uZWxlbWVudCwgc2NyZWVuLnZpZXdwb3J0LCB7XG4gICAgICAgIGV4cGFuZGVkOiAhIXNjcmVlbi5leHBhbmRlZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH1cblxuICBpZiAoY2FwdHVyZWQubGVuZ3RoID09PSAxKSB7XG4gICAgd2luZG93LnNhdmVBcyhjYXB0dXJlZFswXS5ibG9iLCBjYXB0dXJlZFswXS5uYW1lKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgemlwID0gbmV3IHdpbmRvdy5KU1ppcCgpXG4gIGNhcHR1cmVkLmZvckVhY2goKGl0ZW0pID0+IHppcC5maWxlKGl0ZW0ubmFtZSwgaXRlbS5ibG9iKSlcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogJ2Jsb2InIH0pXG4gIHdpbmRvdy5zYXZlQXMoYmxvYiwgYCR7c2x1ZyhzY3JlZW5zWzBdLnByb2plY3ROYW1lKX0uemlwYClcbn1cbiIsICJpbXBvcnQgeyBidWlsZFJldmlld1Byb21wdCwgcmV2aWV3VGFyZ2V0cywgUkVWSUVXX1RZUEVfTEFCRUxTIH0gZnJvbSAnLi9yZXZpZXcuanMnXG5cbmZ1bmN0aW9uIGNvcHlUZXh0KHRleHQpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQgJiYgd2luZG93LmlzU2VjdXJlQ29udGV4dCkgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIGNvbnN0IGFyZWEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpXG4gIGFyZWEudmFsdWUgPSB0ZXh0XG4gIGFyZWEuc2V0QXR0cmlidXRlKCdyZWFkb25seScsICcnKVxuICBhcmVhLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJ1xuICBhcmVhLnN0eWxlLmxlZnQgPSAnLTk5OTlweCdcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhcmVhKVxuICBhcmVhLnNlbGVjdCgpXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoJ2NvcHknKVxuICB9IGZpbmFsbHkge1xuICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoYXJlYSlcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld1BhbmVsKHtcbiAgcHJvamVjdCxcbiAgdmlzaWJsZSA9IHRydWUsXG4gIHNlbGVjdGlvbnMsXG4gIG11bHRpU2VsZWN0LFxuICBpdGVtcyxcbiAgb25Ub2dnbGVNdWx0aVNlbGVjdCxcbiAgb25TZWxlY3RFbGVtZW50LFxuICBvbkhvdmVyRWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4QlwiIGhpZGRlbj17IXZpc2libGV9PlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWItc2VwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iXCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YW5jZXN0b3Iuc2VsZWN0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5jZXN0b3IubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3RvclwiPntzZWxlY3RlZC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZC5jdXJyZW50VGV4dCA/IChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY3VycmVudC10ZXh0XCI+XHU1RjUzXHU1MjREXHVGRjFBe3NlbGVjdGVkLmN1cnJlbnRUZXh0fTwvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTRGRUVcdTY1MzlcdTdDN0JcdTU3OEI8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1zZWxlY3RcIiB2YWx1ZT17dHlwZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0VHlwZShldmVudC50YXJnZXQudmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhSRVZJRVdfVFlQRV9MQUJFTFMpLm1hcCgoW3ZhbHVlLCBsYWJlbF0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1vcHRpb25cIiB2YWx1ZT17dmFsdWV9IGtleT17dmFsdWV9PntsYWJlbH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+e2luc3RydWN0aW9uTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWluc3RydWN0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbnN0cnVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0eXBlID09PSAnb3JkZXInID8gJ1x1NEY4Qlx1NTk4Mlx1RkYxQVx1NzlGQlx1NTJBOFx1NTIzMFx1OEJBMlx1NTM1NVx1NjQ1OFx1ODk4MVx1NEU0Qlx1NTQwRScgOiAnXHU2M0NGXHU4RkYwXHU1RTBDXHU2NzFCIEFJIFx1NTk4Mlx1NEY1NVx1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbnN0cnVjdGlvbihldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYWRkXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWluc3RydWN0aW9uLnRyaW0oKSAmJiB0eXBlICE9PSAncmVtb3ZlJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthZGRJdGVtfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1MkEwXHU1MTY1XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjA4e3NlbGVjdGlvbnMubGVuZ3RofSBcdTRFMkFcdTgyODJcdTcwQjlcdUZGMDlcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU0RTJEXHU3Njg0XHU4MjgyXHU3MEI5XHU1RjAwXHU1OUNCXHU4QkM0XHU4QkJBXHUzMDAyXHU3MEI5XHU1MUZCXHU5NzYyXHU1MzA1XHU1QzUxXHU1M0VGXHU1MjA3XHU2MzYyXHU1MjMwXHU3MjM2XHU3RUE3XHU3RUM0XHU0RUY2XHUzMDAyPC9wPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1PC9oMj5cbiAgICAgICAgICB7aXRlbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbXNcIj5cbiAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1cIiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tdGl0bGVcIj57aW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1tpdGVtLnR5cGVdfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGl0ZW0pLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuc2VsZWN0b3IpLmpvaW4oJ1x1MzAwMScpfVxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWluc3RydWN0aW9uXCI+e2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWRlbGV0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZUl0ZW0oaXRlbS5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ4XHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uIHdmLXJldmlldy1wcm9tcHQtc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2NzAwXHU3RUM4IFByb21wdDwvaDI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3JlZ2VuZXJhdGV9Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9tcHREaXJ0eSA/IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYW51YWxcIj5Qcm9tcHQgXHU1REYyXHU2MjRCXHU1MkE4XHU0RkVFXHU2NTM5XHVGRjFCXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU0RjFBXHU4OTg2XHU3NkQ2XHU2MjRCXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwcm9tcHR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIHNldFByb21wdERpcnR5KHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNvcHlcIiBvbkNsaWNrPXtjb3B5UHJvbXB0fT5cbiAgICAgICAgICAgIHtjb3BpZWQgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTU5MERcdTUyMzYgUHJvbXB0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImltcG9ydCB7IHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBzYW1lUG9zaXRpb25zKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGxlZnQuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgb3RoZXIgPSByaWdodFtpbmRleF1cbiAgICByZXR1cm4gaXRlbS5rZXkgPT09IG90aGVyLmtleVxuICAgICAgJiYgaXRlbS5pdGVtID09PSBvdGhlci5pdGVtXG4gICAgICAmJiBpdGVtLml0ZW1JbmRleCA9PT0gb3RoZXIuaXRlbUluZGV4XG4gICAgICAmJiBpdGVtLmxlZnQgPT09IG90aGVyLmxlZnRcbiAgICAgICYmIGl0ZW0udG9wID09PSBvdGhlci50b3BcbiAgfSlcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBjbGlwKSB7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChyZWN0LmxlZnQsIGNsaXAubGVmdClcbiAgY29uc3QgcmlnaHQgPSBNYXRoLm1pbihyZWN0LnJpZ2h0LCBjbGlwLnJpZ2h0KVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChyZWN0LnRvcCwgY2xpcC50b3ApXG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWluKHJlY3QuYm90dG9tLCBjbGlwLmJvdHRvbSlcbiAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgaXRlbXMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgcmV2aWV3VGFyZ2V0cyhpdGVtKS5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBsZXQgZWxlbWVudCA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGVsZW1lbnQgPSBib2FyZC5xdWVyeVNlbGVjdG9yKHRhcmdldC5zZWxlY3RvcilcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudD8uaXNDb25uZWN0ZWQpIHJldHVyblxuICAgICAgY29uc3Qgc2NyZWVuQ29udGVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JylcbiAgICAgIGlmICghc2NyZWVuQ29udGVudCkgcmV0dXJuXG4gICAgICBjb25zdCB2aXNpYmxlID0gaW50ZXJzZWN0UmVjdChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBzY3JlZW5Db250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgICAgaWYgKCF2aXNpYmxlKSByZXR1cm5cbiAgICAgIGNvbnN0IGJhc2VMZWZ0ID0gTWF0aC5yb3VuZCh2aXNpYmxlLnJpZ2h0IC0gYm9hcmRSZWN0LmxlZnQpXG4gICAgICBjb25zdCBiYXNlVG9wID0gTWF0aC5yb3VuZCh2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3ApXG4gICAgICBjb25zdCBvdmVybGFwQ291bnQgPSBwb3NpdGlvbnMuZmlsdGVyKFxuICAgICAgICAocG9zaXRpb24pID0+IE1hdGguYWJzKHBvc2l0aW9uLmJhc2VMZWZ0IC0gYmFzZUxlZnQpIDwgMiAmJiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlVG9wIC0gYmFzZVRvcCkgPCAyLFxuICAgICAgKS5sZW5ndGhcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAga2V5OiBgJHtpdGVtLmlkfToke3RhcmdldEluZGV4fWAsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1JbmRleCxcbiAgICAgICAgdGFyZ2V0SW5kZXgsXG4gICAgICAgIGJhc2VMZWZ0LFxuICAgICAgICBiYXNlVG9wLFxuICAgICAgICBsZWZ0OiBiYXNlTGVmdCArIG92ZXJsYXBDb3VudCAqIDE1LFxuICAgICAgICB0b3A6IGJhc2VUb3AsXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TWFya2Vycyh7IGJvYXJkUmVmLCBpdGVtcywgb25PcGVuUGFuZWwgfSkge1xuICBjb25zdCBbcG9zaXRpb25zLCBzZXRQb3NpdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFthY3RpdmVLZXksIHNldEFjdGl2ZUtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBmcmFtZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IHJlc29sdmVQb3NpdGlvbnMoYm9hcmRSZWYuY3VycmVudCwgaXRlbXMpXG4gICAgc2V0UG9zaXRpb25zKChjdXJyZW50KSA9PiBzYW1lUG9zaXRpb25zKGN1cnJlbnQsIG5leHQpID8gY3VycmVudCA6IG5leHQpXG4gIH0sIFtib2FyZFJlZiwgaXRlbXNdKVxuXG4gIGNvbnN0IHNjaGVkdWxlUmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgZnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZnJhbWVSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIHJlZnJlc2goKVxuICAgIH0pXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3Qoc2NoZWR1bGVSZWZyZXNoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtzY2hlZHVsZVJlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZUtleSAmJiAhcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSkpIHNldEFjdGl2ZUtleShudWxsKVxuICB9LCBbYWN0aXZlS2V5LCBwb3NpdGlvbnNdKVxuXG4gIGNvbnN0IGFjdGl2ZSA9IHBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpXG4gIGNvbnN0IGJvYXJkV2lkdGggPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRXaWR0aCB8fCAwXG4gIGNvbnN0IGJvYXJkSGVpZ2h0ID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0IHx8IDBcbiAgY29uc3QgYnViYmxlTGVmdCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUubGVmdCArIDE2LCBib2FyZFdpZHRoIC0gMzM2KSkgOiAwXG4gIGNvbnN0IGJ1YmJsZVRvcCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUudG9wICsgMjQsIGJvYXJkSGVpZ2h0IC0gMTgwKSkgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXJzXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NjgwN1x1OEJCMFwiPlxuICAgICAge3Bvc2l0aW9ucy5tYXAoKHBvc2l0aW9uKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2FjdGl2ZUtleSA9PT0gcG9zaXRpb24ua2V5ID8gJ3dmLXJldmlldy1tYXJrZXIgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbWFya2VyJ31cbiAgICAgICAgICBrZXk9e3Bvc2l0aW9uLmtleX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cdUZGMUEke1JFVklFV19UWVBFX0xBQkVMU1twb3NpdGlvbi5pdGVtLnR5cGVdfWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogcG9zaXRpb24ubGVmdCwgdG9wOiBwb3NpdGlvbi50b3AgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRBY3RpdmVLZXkoKGN1cnJlbnQpID0+IGN1cnJlbnQgPT09IHBvc2l0aW9uLmtleSA/IG51bGwgOiBwb3NpdGlvbi5rZXkpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAge2FjdGl2ZSA/IChcbiAgICAgICAgPGFzaWRlXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyXCJcbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBidWJibGVMZWZ0LCB0b3A6IGJ1YmJsZVRvcCB9fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHthY3RpdmUuaXRlbUluZGV4ICsgMX1gfVxuICAgICAgICA+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10aXRsZVwiPlxuICAgICAgICAgICAgICB7YWN0aXZlLml0ZW1JbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2FjdGl2ZS5pdGVtLnR5cGVdfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1jbG9zZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVLZXkobnVsbCl9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1pbnN0cnVjdGlvblwiPlxuICAgICAgICAgICAge2FjdGl2ZS5pdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10YXJnZXRzXCI+XG4gICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhhY3RpdmUuaXRlbSkubWFwKCh0YXJnZXQpID0+IChcbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXNlbGVjdG9yXCIga2V5PXt0YXJnZXQuc2VsZWN0b3J9Pnt0YXJnZXQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLW1vcmVcIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEFjdGl2ZUtleShudWxsKVxuICAgICAgICAgICAgICBvbk9wZW5QYW5lbD8uKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgXHU2N0U1XHU3NzBCXHU2NkY0XHU1OTFBXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImNvbnN0IExBVU5DSEVSX1NJWkUgPSA0OFxuY29uc3QgTEFVTkNIRVJfTUFSR0lOID0gMjBcbmNvbnN0IERSQUdfVEhSRVNIT0xEID0gNFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW4pLCBNYXRoLm1heChtaW4sIG1heCkpXG59XG5cbmZ1bmN0aW9uIGNsYW1wUG9zaXRpb24oYm9hcmQsIHBvc2l0aW9uKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBwb3NpdGlvblxuICByZXR1cm4ge1xuICAgIHg6IGNsYW1wKHBvc2l0aW9uLngsIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgICB5OiBjbGFtcChwb3NpdGlvbi55LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRQb3NpdGlvbihib2FyZCkge1xuICByZXR1cm4gY2xhbXBQb3NpdGlvbihib2FyZCwge1xuICAgIHg6IGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgICB5OiBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkUG9zaXRpb24oc3RvcmFnZUtleSkge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSkpXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueCkgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlPy55KSkgcmV0dXJuIHZhbHVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIGxvY2FsU3RvcmFnZSBtYXkgYmUgdW5hdmFpbGFibGUgZm9yIGEgZGlyZWN0bHkgb3BlbmVkIGxvY2FsIGZpbGUuXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHBvc2l0aW9uKSlcbiAgfSBjYXRjaCB7XG4gICAgLy8gS2VlcGluZyB0aGUgbGF1bmNoZXIgZHJhZ2dhYmxlIGlzIG1vcmUgaW1wb3J0YW50IHRoYW4gcGVyc2lzdGVuY2UuXG4gIH1cbn1cblxuZnVuY3Rpb24gQ29tbWVudEljb24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNNSA0LjVoMTRhMiAyIDAgMCAxIDIgMnY4YTIgMiAwIDAgMS0yIDJoLTZsLTQuNSAzdi0zSDVhMiAyIDAgMCAxLTItMnYtOGEyIDIgMCAwIDEgMi0yWlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTcuNSAxMC41aDlcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdMYXVuY2hlcih7IGJvYXJkUmVmLCBjb3VudCwgcHJvamVjdE5hbWUsIG9uT3BlbiB9KSB7XG4gIGNvbnN0IHN0b3JhZ2VLZXkgPSBgd2YtcmV2aWV3LWxhdW5jaGVyLXBvc2l0aW9uOiR7cHJvamVjdE5hbWV9YFxuICBjb25zdCBbcG9zaXRpb24sIHNldFBvc2l0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcG9zaXRpb25SZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3VwcHJlc3NDbGlja1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcblxuICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0KSA9PiB7XG4gICAgY29uc3QgY2xhbXBlZCA9IGNsYW1wUG9zaXRpb24oYm9hcmRSZWYuY3VycmVudCwgbmV4dClcbiAgICBwb3NpdGlvblJlZi5jdXJyZW50ID0gY2xhbXBlZFxuICAgIHNldFBvc2l0aW9uKGNsYW1wZWQpXG4gICAgcmV0dXJuIGNsYW1wZWRcbiAgfSwgW2JvYXJkUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGJvYXJkID0gYm9hcmRSZWYuY3VycmVudFxuICAgIGlmICghYm9hcmQpIHJldHVybiB1bmRlZmluZWRcbiAgICB1cGRhdGVQb3NpdGlvbihyZWFkUG9zaXRpb24oc3RvcmFnZUtleSkgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcblxuICAgIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSB1cGRhdGVQb3NpdGlvbihwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG4gICAgICBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgbmV4dClcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgfSwgW2JvYXJkUmVmLCBzdG9yYWdlS2V5LCB1cGRhdGVQb3NpdGlvbl0pXG5cbiAgY29uc3QgZmluaXNoRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZHJhZy5tb3ZlZFxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAocG9zaXRpb25SZWYuY3VycmVudCkgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uUmVmLmN1cnJlbnQpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICB9XG5cbiAgaWYgKGNvdW50IDw9IDApIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtcmV2aWV3LWxhdW5jaGVyIGlzLWRyYWdnaW5nJyA6ICd3Zi1yZXZpZXctbGF1bmNoZXInfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgcmlnaHQ6IExBVU5DSEVSX01BUkdJTiwgYm90dG9tOiBMQVVOQ0hFUl9NQVJHSU4gfX1cbiAgICAgIGFyaWEtbGFiZWw9e2BcdTVDNTVcdTVGMDBcdThCQzRcdThCQkFcdUZGMENcdTUxNzEgJHtjb3VudH0gXHU2NzYxXHU0RkVFXHU2NTM5YH1cbiAgICAgIGRhdGEtdG9vbHRpcD1cIlx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQpXG4gICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZXG4gICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IERSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICBvblBvaW50ZXJDYW5jZWw9e2ZpbmlzaERyYWd9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGlmIChzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIG9uT3BlbigpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxDb21tZW50SWNvbiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvdW50fTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuIiwgImV4cG9ydCBjb25zdCBVTlNBVkVEX1JFVklFV19NRVNTQUdFID0gJ1x1NEZFRVx1NjUzOVx1NTE4NVx1NUJCOVx1NUMxQVx1NjcyQVx1NEZERFx1NUI1OFx1RkYwQ1x1NzlCQlx1NUYwMFx1OTg3NVx1OTc2Mlx1NTQwRVx1NEYxQVx1NEUyMlx1NTkzMVx1MzAwMlx1NjYyRlx1NTQyNlx1N0VFN1x1N0VFRFx1RkYxRidcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIGV2ZW50LnJldHVyblZhbHVlID0gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxuICByZXR1cm4gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxufVxuIiwgImV4cG9ydCBjb25zdCBCT0FSRF9TSE9SVENVVFMgPSBbXG4gIHsgaWQ6ICdjYW52YXMnLCBrZXlzOiAnQ29tbWFuZCsxJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUyMzBcdTc1M0JcdTY3N0ZcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdkZW1vJywga2V5czogJ0NvbW1hbmQrMicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW50ZXJhY3Rpb24nLCBrZXlzOiAnQ29tbWFuZCtJJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTUzRUZcdTRFQTRcdTRFOTIgLyBcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInIH0sXG4gIHsgaWQ6ICdyZXZpZXcnLCBrZXlzOiAnQ29tbWFuZCtNJywgbGFiZWw6ICdcdTVGMDBcdTU0MkZcdTYyMTZcdTUxNzNcdTk1RURcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdpbW1lcnNpdmUnLCBrZXlzOiAnQ29tbWFuZCtGJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdicm93c2VyLWZ1bGxzY3JlZW4nLCBrZXlzOiAnQ29tbWFuZCtTaGlmdCtGJywgbGFiZWw6ICdcdTUyMDdcdTYzNjJcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnIH0sXG4gIHsgaWQ6ICdob3RzcG90cycsIGtleXM6ICdDb21tYW5kK0gnLCBsYWJlbDogJ1x1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQScgfSxcbiAgeyBpZDogJ3NwYWNlJywga2V5czogJ1NwYWNlJywgbGFiZWw6ICdcdTYzMDlcdTRGNEZcdTRFMzRcdTY1RjZcdTYyRDZcdTUyQThcdTc1M0JcdTVFMDMnIH0sXG4gIHsgaWQ6ICdlc2NhcGUnLCBrZXlzOiAnRXNjJywgbGFiZWw6ICdcdTUxNzNcdTk1RURcdTVGNTNcdTUyNERcdTk3NjJcdTY3N0ZcdTYyMTZcdTkwMDBcdTUxRkFcdTZBMjFcdTVGMEYnIH0sXG4gIHsgaWQ6ICdoZWxwJywga2V5czogJz8nLCBsYWJlbDogJ1x1NjI1M1x1NUYwMFx1NjIxNlx1NTE3M1x1OTVFRFx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRWRpdGFibGVTaG9ydGN1dFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQpIHJldHVybiBmYWxzZVxuICBjb25zdCBlbGVtZW50ID0gdGFyZ2V0Lm5vZGVUeXBlID09PSAzID8gdGFyZ2V0LnBhcmVudEVsZW1lbnQgOiB0YXJnZXRcbiAgaWYgKCFlbGVtZW50KSByZXR1cm4gZmFsc2VcbiAgY29uc3QgdGFnID0gZWxlbWVudC50YWdOYW1lXG4gIGlmICh0YWcgPT09ICdJTlBVVCcgfHwgdGFnID09PSAnVEVYVEFSRUEnIHx8IHRhZyA9PT0gJ1NFTEVDVCcpIHJldHVybiB0cnVlXG4gIGlmIChlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gISFlbGVtZW50LmNsb3Nlc3Q/LignW2NvbnRlbnRlZGl0YWJsZV06bm90KFtjb250ZW50ZWRpdGFibGU9XCJmYWxzZVwiXSknKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvcnRjdXRJZEZvckV2ZW50KGV2ZW50KSB7XG4gIGlmICghZXZlbnQgfHwgZXZlbnQucmVwZWF0IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuIG51bGxcbiAgY29uc3Qga2V5ID0gU3RyaW5nKGV2ZW50LmtleSB8fCAnJykudG9Mb3dlckNhc2UoKVxuXG4gIGlmICghZXZlbnQubWV0YUtleSkge1xuICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYga2V5ID09PSAnZXNjYXBlJykgcmV0dXJuICdlc2NhcGUnXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJz8nKSByZXR1cm4gJ2hlbHAnXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChldmVudC5zaGlmdEtleSkgcmV0dXJuIGtleSA9PT0gJ2YnID8gJ2Jyb3dzZXItZnVsbHNjcmVlbicgOiBudWxsXG4gIGlmIChrZXkgPT09ICcxJykgcmV0dXJuICdjYW52YXMnXG4gIGlmIChrZXkgPT09ICcyJykgcmV0dXJuICdkZW1vJ1xuICBpZiAoa2V5ID09PSAnaScpIHJldHVybiAnaW50ZXJhY3Rpb24nXG4gIGlmIChrZXkgPT09ICdtJykgcmV0dXJuICdyZXZpZXcnXG4gIGlmIChrZXkgPT09ICdmJykgcmV0dXJuICdpbW1lcnNpdmUnXG4gIGlmIChrZXkgPT09ICdoJykgcmV0dXJuICdob3RzcG90cydcbiAgcmV0dXJuIG51bGxcbn1cbiIsICJpbXBvcnQgeyBCT0FSRF9TSE9SVENVVFMgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuZnVuY3Rpb24gUGFuZWxTaGVsbCh7IGlkLCB0aXRsZSwgYXJpYUxhYmVsLCBvbkNsb3NlLCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGNsb3NlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHJldHVybkZvY3VzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm5Gb2N1c1JlZi5jdXJyZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgIGNsb3NlUmVmLmN1cnJlbnQ/LmZvY3VzKClcbiAgICByZXR1cm4gKCkgPT4gcmV0dXJuRm9jdXNSZWYuY3VycmVudD8uZm9jdXM/LigpXG4gIH0sIFtdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbGF5ZXJcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIG9uQ2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c2VjdGlvbiBpZD17aWR9IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICA8YnV0dG9uIHJlZj17Y2xvc2VSZWZ9IHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9IGFyaWEtbGFiZWw9e2BcdTUxNzNcdTk1RUQke3RpdGxlfWB9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9ydGN1dEhlbHAoeyBkZW1vQXZhaWxhYmxlLCBzaG93Q2FudmFzSW5kZXgsIG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlLCBvbkNsb3NlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8UGFuZWxTaGVsbCBpZD1cIndmLWJvYXJkLXV0aWxpdHlcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVwiIGFyaWFMYWJlbD1cIlx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiIG9uQ2xvc2U9e29uQ2xvc2V9PlxuICAgICAgPGRsIGNsYXNzTmFtZT1cIndmLXNob3J0Y3V0LWxpc3RcIj5cbiAgICAgICAge0JPQVJEX1NIT1JUQ1VUUy5tYXAoKHNob3J0Y3V0KSA9PiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnaXMtZGlzYWJsZWQnIDogJyd9IGtleT17c2hvcnRjdXQuaWR9PlxuICAgICAgICAgICAgPGR0PjxrYmQ+e3Nob3J0Y3V0LmtleXN9PC9rYmQ+PC9kdD5cbiAgICAgICAgICAgIDxkZD57c2hvcnRjdXQubGFiZWx9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnXHVGRjA4XHU1RjUzXHU1MjREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjA5JyA6ICcnfTwvZGQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kbD5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLW5vdGVcIj5cdTU3MjhcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDFcdTY1ODdcdTY3MkNcdTU3REZcdTMwMDFcdTRFMEJcdTYyQzlcdTY4NDZcdTU0OENcdTUzRUZcdTdGMTZcdThGOTFcdTUxODVcdTVCQjlcdTRFMkRcdTRFMERcdTRGMUFcdTg5RTZcdTUzRDFcdTY2NkVcdTkwMUFcdTVGRUJcdTYzNzdcdTk1MkVcdTMwMDI8L3A+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1zZWN0aW9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlxuICAgICAgICA8aDIgaWQ9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XHU3NTNCXHU2NzdGXHU4QkJFXHU3RjZFPC9oMj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NjYzRVx1NzkzQVx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPlx1NTcyOFx1NzUzQlx1Njc3Rlx1NEUwQVx1NjYzRVx1NzkzQVx1NTNFRlx1NjJENlx1NjJGRFx1NzY4NFx1OTg3NVx1OTc2Mlx1N0QyMlx1NUYxNTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3Nob3dDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvUGFuZWxTaGVsbD5cbiAgKVxufVxuIiwgImNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSBPYmplY3QuZnJlZXplKHsgc2hvd0NhbnZhc0luZGV4OiB0cnVlIH0pXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpIHtcbiAgcmV0dXJuIGB3Zi1ib2FyZC1zZXR0aW5nczoke3Byb2plY3ROYW1lfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzdG9yYWdlPy5nZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSkpXG4gICAgaWYgKHR5cGVvZiBwYXJzZWQ/LnNob3dDYW52YXNJbmRleCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4geyBzaG93Q2FudmFzSW5kZXg6IHBhcnNlZC5zaG93Q2FudmFzSW5kZXggfVxuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gZmlsZTovLyBzdG9yYWdlIGNhbiBiZSB1bmF2YWlsYWJsZSBvciBjb250YWluIHN0YWxlIGRhdGEuXG4gIH1cbiAgcmV0dXJuIHsgLi4uREVGQVVMVF9TRVRUSU5HUyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQm9hcmRTZXR0aW5ncyhzdG9yYWdlLCBwcm9qZWN0TmFtZSwgc2V0dGluZ3MpIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHsgc2hvd0NhbnZhc0luZGV4OiBzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlIH1cbiAgdHJ5IHtcbiAgICBzdG9yYWdlPy5zZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSwgSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplZCkpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gU2V0dGluZ3MgcmVtYWluIHVzYWJsZSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbiB3aXRob3V0IHBlcnNpc3RlbmNlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IENhbnZhc01vZGUsIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayB9IGZyb20gJy4vQ2FudmFzTW9kZS5qc3gnXG5pbXBvcnQgeyBEZW1vTW9kZSB9IGZyb20gJy4vRGVtb01vZGUuanN4J1xuaW1wb3J0IHsgcmVzb2x2ZUV4cGFuZFRhcmdldHMgfSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7IGV4cG9ydFNlbGVjdGVkIH0gZnJvbSAnLi9leHBvcnQuanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHsgY2xhbXBTY2FsZSB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFJldmlld1BhbmVsIH0gZnJvbSAnLi9SZXZpZXdQYW5lbC5qc3gnXG5pbXBvcnQgeyBSZXZpZXdNYXJrZXJzIH0gZnJvbSAnLi9SZXZpZXdNYXJrZXJzLmpzeCdcbmltcG9ydCB7IFJldmlld0xhdW5jaGVyIH0gZnJvbSAnLi9SZXZpZXdMYXVuY2hlci5qc3gnXG5pbXBvcnQgeyBkZXNjcmliZVJldmlld0VsZW1lbnQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7IHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdCB9IGZyb20gJy4vYmVmb3JlLXVubG9hZC5qcydcbmltcG9ydCB7IFNob3J0Y3V0SGVscCB9IGZyb20gJy4vQm9hcmRQYW5lbHMuanN4J1xuaW1wb3J0IHsgZ2V0Qm9hcmRTdG9yYWdlLCByZWFkQm9hcmRTZXR0aW5ncywgc2F2ZUJvYXJkU2V0dGluZ3MgfSBmcm9tICcuL2JvYXJkLXNldHRpbmdzLmpzJ1xuaW1wb3J0IHsgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0LCBzaG9ydGN1dElkRm9yRXZlbnQgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuY29uc3QgVklFV1BPUlRfTEFCRUxTID0ge1xuICBtb2JpbGU6ICdcdTYyNEJcdTY3M0EnLFxuICBkZXNrdG9wOiAnXHU2ODRDXHU5NzYyJyxcbn1cblxuZnVuY3Rpb24gWm9vbUNvbnRyb2xzKHsgc2NhbGUsIHNldFNjYWxlLCBvblJlc2V0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXpvb20tY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU3RjI5XHU1QzBGXCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlIC0gMC4xKSl9Pi08L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXpvb20tdmFsdWVcIj57TWF0aC5yb3VuZChzY2FsZSAqIDEwMCl9JTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU2NTNFXHU1OTI3XCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlICsgMC4xKSl9Pis8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU5MUNEXHU3RjZFXHU3RjI5XHU2NTNFXCIgb25DbGljaz17b25SZXNldH0+XHU1OTBEXHU0RjREPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEx1Y2lkZSBcdTk4Q0VcdTY4M0NcdTVERTVcdTUxNzdcdTY4MEZcdTU2RkVcdTY4MDdcdTMwMDJcdTRFQzVcdTc1MjhcdTRFOEVcdTY4NDZcdTY3QjYgY2hyb21lXHUzMDAyICovXG5mdW5jdGlvbiBUb29sYmFySWNvbih7IG5hbWUgfSkge1xuICBjb25zdCBwYXRocyA9IHtcbiAgICBlZGl0OiA8PjxwYXRoIGQ9XCJNMTIgMjBoOVwiIC8+PHBhdGggZD1cIk0xNi41IDMuNWEyLjEyIDIuMTIgMCAwIDEgMyAzTDcgMTlsLTQgMSAxLTRaXCIgLz48Lz4sXG4gICAgZnVsbHNjcmVlbjogPD48cGF0aCBkPVwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M1wiIC8+PHBhdGggZD1cIk0yMSA4VjVhMiAyIDAgMCAwLTItMmgtM1wiIC8+PHBhdGggZD1cIk0zIDE2djNhMiAyIDAgMCAwIDIgMmgzXCIgLz48cGF0aCBkPVwiTTE2IDIxaDNhMiAyIDAgMCAwIDItMnYtM1wiIC8+PC8+LFxuICAgIGV4cGFuZDogPD48cGF0aCBkPVwibTcgMTUgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDkgNS01IDUgNVwiIC8+PC8+LFxuICAgIGNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJtNyAyMCA1LTUgNSA1XCIgLz48cGF0aCBkPVwibTcgNCA1IDUgNS01XCIgLz48Lz4sXG4gICAgdG9vbGJhckV4cGFuZDogPD48cGF0aCBkPVwiTTUgNXYxNFwiIC8+PHBhdGggZD1cIm0xNSAxOC02LTYgNi02XCIgLz48Lz4sXG4gICAgdG9vbGJhckNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJNMTkgNXYxNFwiIC8+PHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPjwvPixcbiAgICBkb3dubG9hZDogPD48cGF0aCBkPVwiTTEyIDN2MTJcIiAvPjxwYXRoIGQ9XCJtNyAxMCA1IDUgNS01XCIgLz48cGF0aCBkPVwiTTUgMjFoMTRcIiAvPjwvPixcbiAgICBzZXR0aW5nczogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjcgMS43IDAgMCAwIC4zNCAxLjg4bC4wNi4wNi0yLjgzIDIuODMtLjA2LS4wNkExLjcgMS43IDAgMCAwIDE1IDE5LjRhMS43IDEuNyAwIDAgMC0xIC42IDEuNyAxLjcgMCAwIDAtLjQgMS4xVjIxaC00di0uMDlBMS43IDEuNyAwIDAgMCA4LjYgMTkuNGExLjcgMS43IDAgMCAwLTEuODguMzRsLS4wNi4wNi0yLjgzLTIuODMuMDYtLjA2QTEuNyAxLjcgMCAwIDAgNC42IDE1YTEuNyAxLjcgMCAwIDAtLjYtMSAxLjcgMS43IDAgMCAwLTEuMS0uNEgzdi00aC4wOUExLjcgMS43IDAgMCAwIDQuNiA4LjZhMS43IDEuNyAwIDAgMC0uMzQtMS44OGwtLjA2LS4wNiAyLjgzLTIuODMuMDYuMDZBMS43IDEuNyAwIDAgMCA5IDQuNmExLjcgMS43IDAgMCAwIDEtLjYgMS43IDEuNyAwIDAgMCAuNC0xLjFWM2g0di4wOUExLjcgMS43IDAgMCAwIDE1LjQgNC42YTEuNyAxLjcgMCAwIDAgMS44OC0uMzRsLjA2LS4wNiAyLjgzIDIuODMtLjA2LjA2QTEuNyAxLjcgMCAwIDAgMTkuNCA5Yy4yLjM3LjUyLjcgMSAuOS4zMi4xMy42OC4yIDEuMS4yaC4wOXY0aC0uMDlhMS43IDEuNyAwIDAgMC0yLjEuOVpcIiAvPjwvPixcbiAgICBoZWxwOiA8PjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiOVwiIC8+PHBhdGggZD1cIk05LjcgOWEyLjQgMi40IDAgMSAxIDMuNyAyYy0uOS42LTEuNCAxLjEtMS40IDJcIiAvPjxwYXRoIGQ9XCJNMTIgMTdoLjAxXCIgLz48Lz4sXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3BhdGhzW25hbWVdfVxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBcdTdFQkZcdTY4NDZcdTk1MDFcdUZGMUFcdTVGMDBcdTk1MDE9XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjBDXHU5NUVEXHU5NTAxPVx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwMlx1Njg0Nlx1NjdCNiBjaHJvbWUgXHU1M0VGXHU3NTI4IFNWR1x1MzAwMiAqL1xuZnVuY3Rpb24gTG9ja0ljb24oeyBvcGVuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLWxvY2staWNvblwiIHZpZXdCb3g9XCIwIDAgMTQgMTRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICAvLyBcdTVGMDBcdTk1MDFcdUZGMUFcdTY4ODFcdTRFQ0VcdTVERTZcdTRGQTdcdTdBQ0JcdThENzdcdTU0MEVcdTU0MTFcdTUzRjNcdTRFMEFcdTYwQUNcdTdBN0FcdUZGMENcdTUzRjNcdTgxMUFcdTRFMERcdTYyNjNcdTU2REVcdTk1MDFcdTRGNTNcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjM1YTIuNzUgMi43NSAwIDAgMSA1LjM1LS4yXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC41YTIuNzUgMi43NSAwIDAgMSA1LjUgMHYyLjI1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8cmVjdCB4PVwiMi43NVwiIHk9XCI2Ljc1XCIgd2lkdGg9XCI4LjVcIiBoZWlnaHQ9XCI1LjVcIiByeD1cIjEuMjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogaW50ZXJhY3RpdmU9dHJ1ZSBcdTY2M0VcdTc5M0FcdTVGMDBcdTk1MDFcdTMwMENcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMERcdUZGMUJmYWxzZSBcdTRFM0FcdTRFMEFcdTk1MDFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0UgKi9cbmZ1bmN0aW9uIEludGVyYWN0aW9uTG9jayh7IGludGVyYWN0aXZlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2ludGVyYWN0aXZlID8gJ3dmLWludGVyYWN0aW9uLWxvY2snIDogJ3dmLWludGVyYWN0aW9uLWxvY2sgaXMtbG9ja2VkJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgYXJpYS1wcmVzc2VkPXshaW50ZXJhY3RpdmV9XG4gICAgICB0aXRsZT17aW50ZXJhY3RpdmVcbiAgICAgICAgPyAnXHU1RjUzXHU1MjREXHU1M0VGXHU0RUE0XHU0RTkyXHU5ODc1XHU5NzYyXHUzMDAyXHU3MEI5XHU1MUZCXHU5NTAxXHU0RjRGXHU1NDBFXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHU3NTNCXHU1RTAzXHVGRjBDXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIENvbW1hbmQrSSdcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIENvbW1hbmQrSSd9XG4gICAgPlxuICAgICAgPExvY2tJY29uIG9wZW49e2ludGVyYWN0aXZlfSAvPlxuICAgICAgPHNwYW4+e2ludGVyYWN0aXZlID8gJ1x1NTNFRlx1NEVBNFx1NEU5MicgOiAnXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJ308L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fCBudWxsXG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RCb2FyZEZ1bGxzY3JlZW4oZWwpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGVsICYmIChlbC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBlbC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbilcbiAgaWYgKCFyZXF1ZXN0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXF1ZXN0LmNhbGwoZWwpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZnVuY3Rpb24gZXhpdEJvYXJkRnVsbHNjcmVlbigpIHtcbiAgaWYgKCFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgY29uc3QgZXhpdCA9IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8IGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuXG4gIGlmICghZXhpdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXhpdC5jYWxsKGRvY3VtZW50KSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb2FyZCh7IHByb2plY3QgfSkge1xuICBjb25zdCB7XG4gICAgbW9kZSxcbiAgICBzZXRNb2RlLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0LFxuICAgIGVudHJ5SWQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgY3VycmVudFNjcmVlbklkLFxuICAgIGNhbkdvQmFjayxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIGNvbnN0IHZpZXdwb3J0T3B0aW9ucyA9IE9iamVjdC5rZXlzKHByb2plY3Qudmlld3BvcnRzKVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG5cbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSksXG4gIClcbiAgY29uc3QgW2NhbnZhc1NjYWxlLCBzZXRDYW52YXNTY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1NjYWxlLCBzZXREZW1vU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9WaWV3UmVzZXRLZXksIHNldERlbW9WaWV3UmVzZXRLZXldID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2ludGVyYWN0aXZlLCBzZXRJbnRlcmFjdGl2ZV0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZElkcywgc2V0RXhwYW5kZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCBbaW1tZXJzaXZlLCBzZXRJbW1lcnNpdmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQsIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2hlbHBWaXNpYmxlLCBzZXRIZWxwVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NhbnZhc0luZGV4VmlzaWJsZSwgc2V0Q2FudmFzSW5kZXhWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dDYW52YXNJbmRleCxcbiAgKVxuICBjb25zdCBbY2FudmFzSW5kZXhQb3NpdGlvbiwgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBib2FyZFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmID0gUmVhY3QudXNlUmVmKG5ldyBTZXQoKSlcbiAgY29uc3QgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGNhbnZhc0xvY2tlZCA9ICFpbnRlcmFjdGl2ZSB8fCBzcGFjZUhlbGRcbiAgY29uc3QgYWxsU2NyZWVuSWRzID0gcHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpXG4gIGNvbnN0IGlzRGVtbyA9IG1vZGUgPT09ICdkZW1vJyAmJiBkZW1vQXZhaWxhYmxlXG4gIGNvbnN0IGFjdGl2ZVNjYWxlID0gaXNEZW1vID8gZGVtb1NjYWxlIDogY2FudmFzU2NhbGVcbiAgY29uc3Qgc2V0QWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBzZXREZW1vU2NhbGUgOiBzZXRDYW52YXNTY2FsZVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmVcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcblxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2VFbGVtZW50KSB7XG4gICAgICAgIG9wdGlvbnMucmVwbGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICBpZiAoY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQgJiYgaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5tYXAoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCA/IG5leHRTZWxlY3Rpb24gOiBpdGVtKVxuICAgICAgfVxuICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQpXG4gICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0ZWRFbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgIHJldHVybiBhZGRpdGl2ZSA/IFsuLi5jdXJyZW50LCBuZXh0U2VsZWN0aW9uXSA6IFtuZXh0U2VsZWN0aW9uXVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0LnNjcmVlbnMsIHJldmlld011bHRpU2VsZWN0LCByZXZpZXdTZWxlY3Rpb25zXSlcblxuICBjb25zdCByZW1vdmVSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpKVxuICB9LCBbXSlcblxuICBjb25zdCBjbG9zZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdFbmFibGVkKGZhbHNlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IGhvdmVyUmV2aWV3QnJlYWRjcnVtYiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gZWxlbWVudCB8fCBudWxsXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBjbG9zZVJldmlld1BhbmVsID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgfSwgW2hvdmVyUmV2aWV3QnJlYWRjcnVtYl0pXG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCBlbnRlckltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjbG9zZVJldmlldygpXG4gICAgc2V0SGVscFZpc2libGUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgc2V0SW1tZXJzaXZlKHRydWUpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdG9nZ2xlSW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgIGVsc2UgZW50ZXJJbW1lcnNpdmUoKVxuICB9LCBbZW50ZXJJbW1lcnNpdmUsIGV4aXRJbW1lcnNpdmUsIGltbWVyc2l2ZV0pXG5cbiAgY29uc3QgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHtcbiAgICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgICByZXF1ZXN0Qm9hcmRGdWxsc2NyZWVuKGJvYXJkUmVmLmN1cnJlbnQpXG4gIH0sIFtjbG9zZVJldmlld10pXG5cbiAgY29uc3QgdXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpc2libGUpID0+IHtcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUodmlzaWJsZSlcbiAgICBzYXZlQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lLCB7IHNob3dDYW52YXNJbmRleDogdmlzaWJsZSB9KVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHNldHRpbmdzID0gcmVhZEJvYXJkU2V0dGluZ3MoZ2V0Qm9hcmRTdG9yYWdlKCksIHByb2plY3QubmFtZSlcbiAgICBzZXRDYW52YXNJbmRleFZpc2libGUoc2V0dGluZ3Muc2hvd0NhbnZhc0luZGV4KVxuICAgIHNldENhbnZhc0luZGV4UG9zaXRpb24obnVsbClcbiAgfSwgW3Byb2plY3QubmFtZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJyAmJiAhZXZlbnQucmVwZWF0ICYmICFpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2hvcnRjdXQgPSBzaG9ydGN1dElkRm9yRXZlbnQoZXZlbnQpXG4gICAgICBpZiAoIXNob3J0Y3V0KSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCAhPT0gJ2VzY2FwZScgJiYgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJyAmJiAhZGVtb0F2YWlsYWJsZSkgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycgJiYgIWlzRGVtbykgcmV0dXJuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdlc2NhcGUnICYmIGdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVyblxuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdjYW52YXMnKSBzZXRNb2RlKCdjYW52YXMnKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZGVtbycpIHNldE1vZGUoJ2RlbW8nKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaW50ZXJhY3Rpb24nKSBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ3JldmlldycpIHRvZ2dsZVJldmlldygpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbW1lcnNpdmUnKSB0b2dnbGVJbW1lcnNpdmUoKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnYnJvd3Nlci1mdWxsc2NyZWVuJykgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4oKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnaG90c3BvdHMnKSBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdoZWxwJykge1xuICAgICAgICBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIH1cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScpIHtcbiAgICAgICAgaWYgKGhlbHBWaXNpYmxlKSBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICAgICAgZWxzZSBpZiAocmV2aWV3RW5hYmxlZCkgY2xvc2VSZXZpZXcoKVxuICAgICAgICBlbHNlIGlmIChpbW1lcnNpdmUpIGV4aXRJbW1lcnNpdmUoKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtcbiAgICBjbG9zZVJldmlldyxcbiAgICBkZW1vQXZhaWxhYmxlLFxuICAgIGV4aXRJbW1lcnNpdmUsXG4gICAgaGVscFZpc2libGUsXG4gICAgaW1tZXJzaXZlLFxuICAgIGlzRGVtbyxcbiAgICByZXZpZXdFbmFibGVkLFxuICAgIHNldE1vZGUsXG4gICAgdG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW4sXG4gICAgdG9nZ2xlSW1tZXJzaXZlLFxuICAgIHRvZ2dsZVJldmlldyxcbiAgXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnZGVtbycpIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfSwgW21vZGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc3luYyA9ICgpID0+IHNldEJyb3dzZXJGdWxsc2NyZWVuKCEhZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSlcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignZnVsbHNjcmVlbmNoYW5nZScsIHN5bmMpXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGXHVGRjA4Q29tbWFuZCsxXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NzUzQlx1Njc3RlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2RlbW8nID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdkZW1vJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMDhDb21tYW5kKzJcdUZGMDlcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU2RjE0XHU3OTNBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLmxlbmd0aCA+IDEgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXZpZXdwb3J0LXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1ODlDNlx1NTNFM1wiPlxuICAgICAgICAgICAgICB7dmlld3BvcnRPcHRpb25zLm1hcCgoa2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBrZXk9e2tleX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17dmlld3BvcnRLZXkgPT09IGtleSA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3cG9ydEtleShrZXkpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtWSUVXUE9SVF9MQUJFTFNba2V5XSB8fCBrZXl9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgfHwgIWRlbW9BdmFpbGFibGUgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXsoKSA9PiBzZXRDYW52YXNTY2FsZSgxKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17ZGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIHNldFNjYWxlPXtzZXREZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXREZW1vVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtob3RzcG90c1Zpc2libGUgPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBXHVGRjA4Q29tbWFuZCtIXHVGRjA5XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17aGVscFZpc2libGUgPyAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLXRvb2xiYXItaWNvbi1idXR0b24nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoZWxwVmlzaWJsZX1cbiAgICAgICAgICAgIGFyaWEtY29udHJvbHM9XCJ3Zi1ib2FyZC11dGlsaXR5XCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcdUZGMDhDb21tYW5kK01cdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlUmV2aWV3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2ltbWVyc2l2ZSA/ICdcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdTZBMjFcdTVGMEYnIDogJ1x1OEZEQlx1NTE2NVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRid9XG4gICAgICAgICAgICB0aXRsZT1cIlx1NTIwN1x1NjM2Mlx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRlx1RkYwOENvbW1hbmQrRlx1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVJbW1lcnNpdmV9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJmdWxsc2NyZWVuXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1NUM0Rjwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHModHJ1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU5MEU4XHU1QzU1XHU1RjAwPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyhmYWxzZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTY1MzZcdThENzc8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLXRvb2xiYXItaWNvbi1idXR0b24tLXByaW1hcnlcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2V4cG9ydGluZyB8fCBzZWxlY3RlZElkcy5zaXplID09PSAwIHx8IG1vZGUgPT09ICdkZW1vJ31cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e2V4cG9ydGluZyA/ICdcdTZCNjNcdTU3MjhcdTVCRkNcdTUxRkEnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RFx1RkYwOCR7c2VsZWN0ZWRJZHMuc2l6ZX0gXHU0RTJBXHU1QzRGXHU1RTU1XHVGRjA5YH1cbiAgICAgICAgICAgIHRpdGxlPXtleHBvcnRpbmcgPyAnXHU1QkZDXHU1MUZBXHU0RTJEXHUyMDI2JyA6IGBcdTYyNTNcdTUzMDVcdTRFMEJcdThGN0QgJHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwb3J0SWRzKFsuLi5zZWxlY3RlZElkc10pfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZG93bmxvYWRcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWNvdW50XCI+e2V4cG9ydGluZyA/ICdcdTIwMjYnIDogc2VsZWN0ZWRJZHMuc2l6ZX08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTYyNTNcdTUzMDVcdTRFMEJcdThGN0Q8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIHtleHBvcnRFcnJvciA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWVycm9yXCIgcm9sZT1cImFsZXJ0XCI+e2V4cG9ydEVycm9yfTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHtpbW1lcnNpdmUgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1pbW1lcnNpdmUtY2hyb21lJHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnJyA6ICcgaXMtY29sbGFwc2VkJ31gfVxuICAgICAgICAgIHJvbGU9XCJ0b29sYmFyXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2Qzg5XHU2RDc4XHU2M0E3XHU0RUY2XCJcbiAgICAgICAgPlxuICAgICAgICAgIHtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWltbWVyc2l2ZS1jb250cm9sc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1RkYwOEVzY1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXhpdEltbWVyc2l2ZX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1OTAwMFx1NTFGQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU5MDAwXHU1MUZBXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGXHVGRjA4Q29tbWFuZCtTaGlmdCtGXHVGRjA5JyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDhDb21tYW5kK1NoaWZ0K0ZcdUZGMDknfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUJyb3dzZXJGdWxsc2NyZWVufVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2Jyb3dzZXJGdWxsc2NyZWVuID8gJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0RiBPTicgOiAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17YWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldEFjdGl2ZVNjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPEludGVyYWN0aW9uTG9ja1xuICAgICAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17KCkgPT4gc2V0SW50ZXJhY3RpdmUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjI1M1x1NUYwMFx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aGVscFZpc2libGV9XG4gICAgICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFXHVGRjA4P1x1RkYwOVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SGVscFZpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJoZWxwXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0Rlx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOVx1NjVGNlx1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOCcgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKHRydWUpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJleHBhbmRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4JyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHMoZmFsc2UpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJjb2xsYXBzZVwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICB7Y2FuR29CYWNrID8gKFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIb3RzcG90c1Zpc2libGUoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NjYzRVx1NzkzQVx1NjIxNlx1OTY5MFx1ODVDRlx1NkYxNFx1NzkzQVx1NzBFRFx1NTMzQVx1RkYwOENvbW1hbmQrSFx1RkYwOVwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtdG9vbGJhci10b2dnbGVcIlxuICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3N1x1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRicgOiAnXHU1QzU1XHU1RjAwXHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJ31cbiAgICAgICAgICAgIHRpdGxlPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT17aW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkID8gJ3Rvb2xiYXJDb2xsYXBzZScgOiAndG9vbGJhckV4cGFuZCd9IC8+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG5cbiAgICAgIHttb2RlID09PSAnY2FudmFzJyA/IChcbiAgICAgICAgPENhbnZhc01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2VsZWN0ZWRJZHM9e3NlbGVjdGVkSWRzfVxuICAgICAgICAgIHNldFNlbGVjdGVkSWRzPXtzZXRTZWxlY3RlZElkc31cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICBvbkV4cG9ydElkcz17ZXhwb3J0SWRzfVxuICAgICAgICAgIHJldmlld0VuYWJsZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e3NlbGVjdFJldmlld0VsZW1lbnR9XG4gICAgICAgICAgb25DYW52YXNDbGljaz17cmV2aWV3UGFuZWxWaXNpYmxlID8gY2xvc2VSZXZpZXdQYW5lbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICBjYW52YXNJbmRleFZpc2libGU9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNJbmRleFBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZT17c2V0Q2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNsb3NlQ2FudmFzSW5kZXg9eygpID0+IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8RGVtb01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIGhvdHNwb3RzVmlzaWJsZT17aG90c3BvdHNWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICB2aWV3UmVzZXRLZXk9e2RlbW9WaWV3UmVzZXRLZXl9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBvbkNhbnZhc0NsaWNrPXtyZXZpZXdQYW5lbFZpc2libGUgPyBjbG9zZVJldmlld1BhbmVsIDogdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtyZXZpZXdFbmFibGVkID8gKFxuICAgICAgICA8UmV2aWV3TWFya2VycyBib2FyZFJlZj17Ym9hcmRSZWZ9IGl0ZW1zPXtyZXZpZXdJdGVtc30gb25PcGVuUGFuZWw9e29wZW5SZXZpZXdQYW5lbH0gLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge2hlbHBWaXNpYmxlID8gKFxuICAgICAgICA8U2hvcnRjdXRIZWxwXG4gICAgICAgICAgZGVtb0F2YWlsYWJsZT17ZGVtb0F2YWlsYWJsZX1cbiAgICAgICAgICBzaG93Q2FudmFzSW5kZXg9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvblNob3dDYW52YXNJbmRleENoYW5nZT17dXBkYXRlQ2FudmFzSW5kZXhWaXNpYmxlfVxuICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldEhlbHBWaXNpYmxlKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgIHZpc2libGU9e3Jldmlld1BhbmVsVmlzaWJsZSAmJiByZXZpZXdFbmFibGVkfVxuICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICBtdWx0aVNlbGVjdD17cmV2aWV3TXVsdGlTZWxlY3R9XG4gICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICBvblNlbGVjdEVsZW1lbnQ9eyhlbGVtZW50KSA9PiBzZWxlY3RSZXZpZXdFbGVtZW50KGVsZW1lbnQsIG51bGwsIG51bGwsIHtcbiAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICB9KX1cbiAgICAgICAgb25Ib3ZlckVsZW1lbnQ9e2hvdmVyUmV2aWV3QnJlYWRjcnVtYn1cbiAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgIG9uQWRkSXRlbT17YWRkUmV2aWV3SXRlbX1cbiAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICBvbkNsb3NlPXtjbG9zZVJldmlld31cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJmdW5jdGlvbiBmYWlsKHBhdGgsIG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke3BhdGh9ICR7bWVzc2FnZX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KHByb2plY3QpIHtcbiAgaWYgKCFwcm9qZWN0IHx8IHR5cGVvZiBwcm9qZWN0ICE9PSAnb2JqZWN0JykgZmFpbCgncHJvamVjdCcsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGlmICghcHJvamVjdC52aWV3cG9ydHMgfHwgdHlwZW9mIHByb2plY3Qudmlld3BvcnRzICE9PSAnb2JqZWN0Jykge1xuICAgIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHByb2plY3Qudmlld3BvcnRzKVxuICBpZiAodmlld3BvcnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSB2aWV3cG9ydCcpXG4gIGZvciAoY29uc3QgW2tleSwgdmlld3BvcnRdIG9mIHZpZXdwb3J0RW50cmllcykge1xuICAgIGlmICghdmlld3BvcnQgfHwgdHlwZW9mIHZpZXdwb3J0ICE9PSAnb2JqZWN0JykgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9YCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbiBvZiBbJ3dpZHRoJywgJ2hlaWdodCddKSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWV3cG9ydFtkaW1lbnNpb25dKSB8fCB2aWV3cG9ydFtkaW1lbnNpb25dIDw9IDApIHtcbiAgICAgICAgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9LiR7ZGltZW5zaW9ufWAsICdtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHByb2plY3QuZGVmYXVsdFZpZXdwb3J0KSkge1xuICAgIGZhaWwoJ3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0JywgYHJlZmVyZW5jZXMgbWlzc2luZyB2aWV3cG9ydCBcIiR7cHJvamVjdC5kZWZhdWx0Vmlld3BvcnR9XCJgKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LnNjcmVlbnMpIHx8IHByb2plY3Quc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICBmYWlsKCdwcm9qZWN0LnNjcmVlbnMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzY3JlZW4nKVxuICB9XG5cbiAgY29uc3QgaWRzID0gbmV3IFNldCgpXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LnNjcmVlbnNbJHtpbmRleH1dYFxuICAgIGlmICghc2NyZWVuIHx8IHR5cGVvZiBzY3JlZW4gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uaWQgIT09ICdzdHJpbmcnIHx8ICEvXlthLXowLTktXSskLy50ZXN0KHNjcmVlbi5pZCkpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBtYXRjaCAvXlthLXowLTktXSskLycpXG4gICAgfVxuICAgIGlmIChpZHMuaGFzKHNjcmVlbi5pZCkpIGZhaWwoYCR7cGF0aH0uaWRgLCBgaXMgZHVwbGljYXRlIFwiJHtzY3JlZW4uaWR9XCJgKVxuICAgIGlkcy5hZGQoc2NyZWVuLmlkKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmNvbXBvbmVudCAhPT0gJ2Z1bmN0aW9uJykgZmFpbChgJHtwYXRofS5jb21wb25lbnRgLCAnbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVuLmxpbmtzKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5saW5rc2AsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gIH0pXG5cbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgc2NyZWVuSW5kZXgpID0+IHtcbiAgICBzY3JlZW4ubGlua3MuZm9yRWFjaCgodGFyZ2V0LCBsaW5rSW5kZXgpID0+IHtcbiAgICAgIGlmICghaWRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgYHByb2plY3Quc2NyZWVuc1ske3NjcmVlbkluZGV4fV0ubGlua3NbJHtsaW5rSW5kZXh9XWAsXG4gICAgICAgICAgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke3RhcmdldH1cImAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5cbmV4cG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQsIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4vZmxvdy10YXJnZXQuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKSB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtZmxvdy10byc6IHRvIHx8IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0bykgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgICAgaWYgKG9uQ2xpY2spIG9uQ2xpY2soZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgdG8pIG5hdmlnYXRlKHRvKVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmZ1bmN0aW9uIGpvaW5DbGFzcyhiYXNlLCBleHRyYSkge1xuICByZXR1cm4gZXh0cmEgPyBgJHtiYXNlfSAke2V4dHJhfWAgOiBiYXNlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICBjb2x1bW5zICYmIHR5cGVvZiBjb2x1bW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjb2x1bW5zKVxuICAgICAgPyBjb2x1bW5zW3ZpZXdwb3J0S2V5XVxuICAgICAgOiBjb2x1bW5zXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDApIHJldHVybiBgcmVwZWF0KCR7dmFsdWV9LCBtaW5tYXgoMCwgMWZyKSlgXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSkgcmV0dXJuIHZhbHVlXG4gIHRocm93IG5ldyBFcnJvcignR3JpZCBjb2x1bW5zIG11c3QgcmVzb2x2ZSB0byBhIHBvc2l0aXZlIGludGVnZXIgb3Igbm9uLWVtcHR5IENTUyBzdHJpbmcnKVxufVxuXG5mdW5jdGlvbiB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZVN1ZmZpeDogdG8gPyAnIHdmLWludGVyYWN0aXZlJyA6ICcnLFxuICAgIHJvbGU6IHRvID8gJ2xpbmsnIDogcmVzdC5yb2xlLFxuICAgIHRhYkluZGV4OiB0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleCxcbiAgICBmbG93LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3goeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWJveCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e3sgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSb3coe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLXJvdyR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbHVtbih7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtY29sdW1uJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCBjb2x1bW5zID0gMSwgZ2FwID0gMCwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IHZpZXdwb3J0S2V5IH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSksXG4gICAgZ2FwLFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWdyaWQke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRpbmcoeyBsZXZlbCA9IDIsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHRhZyA9IGBoJHtNYXRoLm1pbig2LCBNYXRoLm1heCgxLCBsZXZlbCkpfWBcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnLCB7IGNsYXNzTmFtZTogYHdmLWhlYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KHsgYXMgPSAncCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7IGNsYXNzTmFtZTogYHdmLXRleHQgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkKHsgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNhcmQgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYWRnZSh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B3Zi1iYWRnZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdmF0YXIoeyBzaXplID0gNDAsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWF2YXRhciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGxhY2Vob2xkZXIoe1xuICB3aWR0aCA9ICcxMDAlJyxcbiAgaGVpZ2h0ID0gMTYwLFxuICBib3JkZXJSYWRpdXMgPSAwLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgc3R5bGUsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1pbWFnZS1wbGFjZWhvbGRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0LCBib3JkZXJSYWRpdXMsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wbGFjZWhvbGRlci1ibG9ja1wiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHsgdG8sIG9uQ2xpY2ssIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYnV0dG9uIHdmLWJ1dHRvbi0ke3ZhcmlhbnR9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRJbnB1dCh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxpbnB1dCBjbGFzc05hbWU9e2B3Zi1pbnB1dCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gdHlwZT1cInRleHRcIiB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRBcmVhKHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHRleHRhcmVhIGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXRleHRhcmVhICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c2VsZWN0IGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXNlbGVjdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NlbGVjdD5cbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHsgdHlwZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtY2hvaWNlICR7Y2xhc3NOYW1lfWAudHJpbSgpfT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtaW5wdXRcIiB0eXBlPXt0eXBlfSB7Li4ucmVzdH0gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNob2ljZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3gocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cImNoZWNrYm94XCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFkaW8ocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cInJhZGlvXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlKHsgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJzd2l0Y2hcIlxuICAgICAgYXJpYS1jaGVja2VkPXtjaGVja2VkfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtdG9nZ2xlICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBvbkNoYW5nZT8uKCFjaGVja2VkLCBldmVudCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdHJhY2tcIj48c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdGh1bWJcIiAvPjwvc3Bhbj5cbiAgICAgIHtsYWJlbCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybUZpZWxkKHsgbGFiZWwsIGh0bWxGb3IsIGhpbnQsIGVycm9yLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZm9ybS1maWVsZCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWZpZWxkLWxhYmVsXCIgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBjcmVhdGVGbG93UHJvcHMgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBQYWdlSGVhZGVyKHsgdGl0bGUsIHRpdGxlSWQsIHN1YnRpdGxlLCBzdWJ0aXRsZUlkLCBhY3Rpb25zLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGhlYWRlciBjbGFzc05hbWU9e2B3Zi1wYWdlLWhlYWRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWhlYWRlci1jb3B5XCI+XG4gICAgICAgIDxoMSBpZD17dGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS10aXRsZVwiPnt0aXRsZX08L2gxPlxuICAgICAgICB7c3VidGl0bGUgPyA8cCBpZD17c3VidGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3A+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge2FjdGlvbnMgPyA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtYWN0aW9uc1wiPnthY3Rpb25zfTwvZGl2PiA6IG51bGx9XG4gICAgPC9oZWFkZXI+XG4gIClcbn1cblxuZnVuY3Rpb24gTmF2aWdhdGlvbkxpc3QoeyBhcywgaXRlbXMsIGFjdGl2ZUlkLCBjbGFzc05hbWUsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBhcyxcbiAgICB7IGNsYXNzTmFtZSwgLi4ucmVzdCB9LFxuICAgIGl0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLW5hdi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtbmF2LWl0ZW0nfVxuICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICkpLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaWRlTmF2KHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8TmF2aWdhdGlvbkxpc3RcbiAgICAgIGFzPVwibmF2XCJcbiAgICAgIGl0ZW1zPXtpdGVtc31cbiAgICAgIGFjdGl2ZUlkPXthY3RpdmVJZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXNpZGUtbmF2ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFiQmFyKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLXRhYi1iYXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLXRhYi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtdGFiLWl0ZW0nfVxuICAgICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCcmVhZGNydW1icyh7IGl0ZW1zID0gW10sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLWJyZWFkY3J1bWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSBhcmlhLWxhYmVsPVwiQnJlYWRjcnVtYnNcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtgJHtpdGVtLmxhYmVsfS0ke2luZGV4fWB9PlxuICAgICAgICAgIHtpbmRleCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWRpdmlkZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2l0ZW0udG8gPyAoXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItbGlua1wiIHR5cGU9XCJidXR0b25cIiB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfT5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1jdXJyZW50XCI+e2l0ZW0ubGFiZWx9PC9zcGFuPn1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbi8qKiBcdTc5RkJcdTUyQThcdTdBRUZcdTY1NzRcdTVDNEZcdTU4RjNcdUZGMUFcdTUxODVcdTVCQjlcdTUzM0FcdTUzRUZcdTZFREFcdUZGMENUYWJCYXIgXHU4RDM0XHU1RTk1XHUzMDAydGFicyAvIGFjdGl2ZUlkIFx1NEUwRSBUYWJCYXIgXHU3NkY4XHU1NDBDXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlU2hlbGwoeyBjaGlsZHJlbiwgdGFicyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbW9iaWxlLXNoZWxsICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJ3Zi1tb2JpbGUtc2hlbGwtYm9keVwiPntjaGlsZHJlbn08L21haW4+XG4gICAgICB7dGFicy5sZW5ndGggPiAwID8gPFRhYkJhciBpdGVtcz17dGFic30gYWN0aXZlSWQ9e2FjdGl2ZUlkfSAvPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQ2VsbCh7IHRvLCBvbkNsaWNrLCB0aXRsZSwgc3VidGl0bGUsIHZhbHVlLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jZWxsICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2VsbC1tYWluXCI+XG4gICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtY2VsbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAge3N1YnRpdGxlID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgICB7dmFsdWUgIT09IHVuZGVmaW5lZCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtdmFsdWVcIj57dmFsdWV9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERhdGFUYWJsZSh7IGNvbHVtbnMgPSBbXSwgcm93cyA9IFtdLCBnZXRSb3dLZXksIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYmxlLXdyYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3Zi10YWJsZVwiPlxuICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZFwiPlxuICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkZXItcm93XCI+XG4gICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGluZ1wiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9Pntjb2x1bW4ubGFiZWx9PC90aD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keSBjbGFzc05hbWU9XCJ3Zi10YWJsZS1ib2R5XCI+XG4gICAgICAgICAge3Jvd3MubWFwKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dLZXkgPSBnZXRSb3dLZXkgPyBnZXRSb3dLZXkocm93KSA6IHJvdy5pZCB8fCBpbmRleFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLXJvd1wiIGRhdGEtd2Yta2V5PXtyb3dLZXl9IGtleT17cm93S2V5fT5cbiAgICAgICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWNlbGxcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT5cbiAgICAgICAgICAgICAgICAgICAge2NvbHVtbi5yZW5kZXIgPyBjb2x1bW4ucmVuZGVyKHJvd1tjb2x1bW4ua2V5XSwgcm93KSA6IHJvd1tjb2x1bW4ua2V5XX1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJzKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIG9uQ2hhbmdlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwidGFibGlzdFwiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRhYi1jb250cm9sXCJcbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpdGVtLmlkID09PSBhY3RpdmVJZH1cbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2U/LihpdGVtLmlkKX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGVwcyh7XG4gIGl0ZW1zID0gW10sXG4gIGN1cnJlbnQgPSAwLFxuICBkaXJlY3Rpb24gPSAnaG9yaXpvbnRhbCcsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHZlcnRpY2FsID0gZGlyZWN0aW9uID09PSAndmVydGljYWwnXG4gIHJldHVybiAoXG4gICAgPG9sXG4gICAgICBjbGFzc05hbWU9e2B3Zi1zdGVwcyAke3ZlcnRpY2FsID8gJ3dmLXN0ZXBzLXZlcnRpY2FsJyA6ICd3Zi1zdGVwcy1ob3Jpem9udGFsJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBpbmRleCA8IGN1cnJlbnQgPyAnZG9uZScgOiBpbmRleCA9PT0gY3VycmVudCA/ICdjdXJyZW50JyA6ICd0b2RvJ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2B3Zi1zdGVwcy1pdGVtIHdmLXN0ZXBzLWl0ZW0tJHtzdGF0dXN9YH0ga2V5PXtpdGVtLmlkIHx8IGl0ZW0ubGFiZWwgfHwgaW5kZXh9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcC1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAge3N0YXR1cyA9PT0gJ2RvbmUnID8gbnVsbCA6IGluZGV4ICsgMX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7aW5kZXggPCBpdGVtcy5sZW5ndGggLSAxID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGluZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICB7aXRlbS5kZXNjcmlwdGlvbiA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWRlc2NcIj57aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvb2w+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVtcHR5U3RhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGFjdGlvbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZW1wdHktc3RhdGUgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWVtcHR5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge3RpdGxlID8gPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1lbXB0eS10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz4gOiBudWxsfVxuICAgICAge2Rlc2NyaXB0aW9uID8gPHAgY2xhc3NOYW1lPVwid2YtZW1wdHktZGVzY1wiPntkZXNjcmlwdGlvbn08L3A+IDogbnVsbH1cbiAgICAgIHthY3Rpb24gPyA8ZGl2IGNsYXNzTmFtZT1cIndmLWVtcHR5LWFjdGlvblwiPnthY3Rpb259PC9kaXY+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7IENvbHVtbiwgUm93LCBTaWRlTmF2LCBUZXh0IH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgdXNlU2NyZWVuSWQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5cbmNvbnN0IE5BVl9JVEVNUyA9IFtcbiAgeyBsYWJlbDogJ1x1NURFNVx1NEY1Q1x1NTMzQScsIHRvOiAnd29ya3NwYWNlJyB9LFxuICB7IGxhYmVsOiAnQ29sbGVjdGlvbnMnLCB0bzogJ2NvbGxlY3Rpb24nIH0sXG4gIHsgbGFiZWw6ICdcdTczQUZcdTU4ODMnLCB0bzogJ2Vudmlyb25tZW50cycgfSxcbiAgeyBsYWJlbDogJ1x1NTM4Nlx1NTNGMicsIHRvOiAnaGlzdG9yeScgfSxcbiAgeyBsYWJlbDogJ1x1OEJCRVx1N0Y2RScsIHRvOiAnc2V0dGluZ3MnIH0sXG5dXG5cbmNvbnN0IEFDVElWRV9BTElBUyA9IHtcbiAgJ3JlcXVlc3QtZWRpdG9yJzogJ2NvbGxlY3Rpb24nLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXBwU2hlbGwoeyBjaGlsZHJlbiwgYXNpZGUgfSkge1xuICBjb25zdCBzY3JlZW5JZCA9IHVzZVNjcmVlbklkKClcbiAgY29uc3QgYWN0aXZlSWQgPSBBQ1RJVkVfQUxJQVNbc2NyZWVuSWRdIHx8IHNjcmVlbklkXG5cbiAgcmV0dXJuIChcbiAgICA8Um93IGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJywgZ2FwOiAwIH19PlxuICAgICAgPENvbHVtblxuICAgICAgICBjbGFzc05hbWU9XCJwb3N0bWFuLXNoZWxsX19yYWlsXCJcbiAgICAgICAgZ2FwPXsxNn1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgIGZsZXhTaHJpbms6IDAsXG4gICAgICAgICAgcGFkZGluZzogJzIwcHggMTJweCcsXG4gICAgICAgICAgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgdmFyKC0td2YtMzAwKScsXG4gICAgICAgICAgYmFja2dyb3VuZDogJ3ZhcigtLXdmLTUwKScsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fYnJhbmRcIiBnYXA9ezR9PlxuICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fYnJhbmQtbmFtZVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxNSB9fT5BUEkgQ2xpZW50PC9zdHJvbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fYnJhbmQtbWV0YVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgY29sb3I6ICd2YXIoLS13Zi02MDApJyB9fT5cbiAgICAgICAgICAgIFdvcmtzcGFjZSBcdTAwQjcgRGVtb1xuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxTaWRlTmF2IGNsYXNzTmFtZT1cInBvc3RtYW4tc2hlbGxfX25hdlwiIGFjdGl2ZUlkPXthY3RpdmVJZH0gaXRlbXM9e05BVl9JVEVNU30gLz5cbiAgICAgIDwvQ29sdW1uPlxuICAgICAge2FzaWRlID8gKFxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fYXNpZGVcIlxuICAgICAgICAgIGdhcD17MTJ9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAyNjAsXG4gICAgICAgICAgICBmbGV4U2hyaW5rOiAwLFxuICAgICAgICAgICAgcGFkZGluZzogJzE2cHggMTJweCcsXG4gICAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCB2YXIoLS13Zi0zMDApJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bycsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAndmFyKC0td2YtMTAwKScsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHthc2lkZX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxDb2x1bW5cbiAgICAgICAgY2xhc3NOYW1lPVwicG9zdG1hbi1zaGVsbF9fbWFpblwiXG4gICAgICAgIGdhcD17MH1cbiAgICAgICAgc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAsIG92ZXJmbG93OiAnYXV0bycgfX1cbiAgICAgID5cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Sb3c+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgQXBwU2hlbGwgfSBmcm9tICcuLi9sYXlvdXRzL0FwcFNoZWxsLmpzeCdcblxuY29uc3QgRk9MREVSUyA9IFtcbiAge1xuICAgIGlkOiAnZm9sZGVyLXVzZXJzJyxcbiAgICBuYW1lOiAnVXNlcnMnLFxuICAgIHJlcXVlc3RzOiBbXG4gICAgICB7IGlkOiAncmVxLWxpc3QtdXNlcnMnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnTGlzdCBVc2VycycsIHBhdGg6ICcvdjEvdXNlcnMnIH0sXG4gICAgICB7IGlkOiAncmVxLWdldC11c2VyJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0dldCBVc2VyJywgcGF0aDogJy92MS91c2Vycy86aWQnIH0sXG4gICAgICB7IGlkOiAncmVxLXVwZGF0ZS11c2VyJywgbWV0aG9kOiAnUEFUQ0gnLCBuYW1lOiAnVXBkYXRlIFVzZXInLCBwYXRoOiAnL3YxL3VzZXJzLzppZCcgfSxcbiAgICAgIHsgaWQ6ICdyZXEtZGlzYWJsZS11c2VyJywgbWV0aG9kOiAnUE9TVCcsIG5hbWU6ICdEaXNhYmxlIFVzZXInLCBwYXRoOiAnL3YxL3VzZXJzLzppZC9kaXNhYmxlJyB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2ZvbGRlci1yb2xlcycsXG4gICAgbmFtZTogJ1JvbGVzJyxcbiAgICByZXF1ZXN0czogW1xuICAgICAgeyBpZDogJ3JlcS1saXN0LXJvbGVzJywgbWV0aG9kOiAnR0VUJywgbmFtZTogJ0xpc3QgUm9sZXMnLCBwYXRoOiAnL3YxL3JvbGVzJyB9LFxuICAgICAgeyBpZDogJ3JlcS1hc3NpZ24tcm9sZScsIG1ldGhvZDogJ1BVVCcsIG5hbWU6ICdBc3NpZ24gUm9sZScsIHBhdGg6ICcvdjEvdXNlcnMvOmlkL3JvbGVzJyB9LFxuICAgIF0sXG4gIH0sXG4gIHtcbiAgICBpZDogJ2ZvbGRlci1hdWRpdCcsXG4gICAgbmFtZTogJ0F1ZGl0JyxcbiAgICByZXF1ZXN0czogW1xuICAgICAgeyBpZDogJ3JlcS1hdWRpdC1sb2cnLCBtZXRob2Q6ICdHRVQnLCBuYW1lOiAnQXVkaXQgTG9nJywgcGF0aDogJy92MS9hdWRpdC9sb2dzJyB9LFxuICAgICAgeyBpZDogJ3JlcS1leHBvcnQtYXVkaXQnLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0V4cG9ydCBBdWRpdCcsIHBhdGg6ICcvdjEvYXVkaXQvZXhwb3J0JyB9LFxuICAgIF0sXG4gIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xsZWN0aW9uU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbFxuICAgICAgYXNpZGU9e1xuICAgICAgICA8Q29sdW1uIGlkPVwiY29sbGVjdGlvbi10cmVlXCIgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fdHJlZVwiIGdhcD17MTR9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fdHJlZS1oZWFkXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fdHJlZS10aXRsZVwiIGxldmVsPXszfT5Vc2VyIEFQSTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fdHJlZS1uZXdcIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+KzwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIHtGT0xERVJTLm1hcCgoZm9sZGVyKSA9PiAoXG4gICAgICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgICAgIGtleT17Zm9sZGVyLmlkfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19mb2xkZXJcIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17Zm9sZGVyLmlkfVxuICAgICAgICAgICAgICBnYXA9ezZ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2ZvbGRlci1uYW1lXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyLCBmb250V2VpZ2h0OiA2MDAgfX0+XG4gICAgICAgICAgICAgICAge2ZvbGRlci5uYW1lfVxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgIHtmb2xkZXIucmVxdWVzdHMubWFwKChyZXEpID0+IChcbiAgICAgICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICAgICAga2V5PXtyZXEuaWR9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19yZXF1ZXN0XCJcbiAgICAgICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtyZXEuaWR9XG4gICAgICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTBweCcgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3Qtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19yZXF1ZXN0LW1ldGhvZFwiPntyZXEubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX3JlcXVlc3QtbmFtZVwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMyB9fT57cmVxLm5hbWV9PC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIH1cbiAgICA+XG4gICAgICA8Q29sdW1uIGlkPVwiY29sbGVjdGlvbi1wYWdlXCIgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fcGFnZVwiIGdhcD17MTZ9IHN0eWxlPXt7IHBhZGRpbmc6IDI0IH19PlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiY29sbGVjdGlvbi1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJjb2xsZWN0aW9uLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiVXNlciBBUElcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiQ29sbGVjdGlvbiBcdTAwQjcgMyBcdTRFMkFcdTY1ODdcdTRFRjZcdTU5MzkgXHUwMEI3IDggXHU0RTJBXHU4QkY3XHU2QzQyXCJcbiAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2FjdGlvbi1ydW5cIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+UnVuIGNvbGxlY3Rpb248L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19hY3Rpb24tbmV3XCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XHU2NUIwXHU1RUZBXHU4QkY3XHU2QzQyPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPENhcmQgaWQ9XCJjb2xsZWN0aW9uLW1ldGFcIiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhXCIgc3R5bGU9e3sgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXJvd1wiIGdhcD17MjR9PlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWl0ZW1cIiBnYXA9ezR9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWxhYmVsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19PkJhc2UgVVJMPC9UZXh0PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX21ldGEtdmFsdWVcIj57J3t7YmFzZVVybH19J308L3N0cm9uZz5cbiAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWl0ZW1cIiBnYXA9ezR9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLWxhYmVsXCIgc3R5bGU9e3sgZm9udFNpemU6IDEyIH19Plx1NjM4OFx1Njc0MzwvVGV4dD5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19tZXRhLXZhbHVlXCI+QmVhcmVyIFRva2VuPC9zdHJvbmc+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1pdGVtXCIgZ2FwPXs0fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS1sYWJlbFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT5cdTY2RjRcdTY1QjA8L1RleHQ+XG4gICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbWV0YS12YWx1ZVwiPlx1NEVDQVx1NTkyOSAxMDoyNDwvc3Ryb25nPlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ2FyZD5cblxuICAgICAgICA8Q29sdW1uIGlkPVwiY29sbGVjdGlvbi1saXN0XCIgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdFwiIGdhcD17MTB9PlxuICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtdGl0bGVcIiBsZXZlbD17M30+XHU1MTY4XHU5MEU4XHU4QkY3XHU2QzQyPC9IZWFkaW5nPlxuICAgICAgICAgIHtGT0xERVJTLmZsYXRNYXAoKGZvbGRlcikgPT5cbiAgICAgICAgICAgIGZvbGRlci5yZXF1ZXN0cy5tYXAoKHJlcSkgPT4gKFxuICAgICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICAgIGtleT17cmVxLmlkfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNvbGxlY3Rpb25fX2xpc3QtaXRlbVwiXG4gICAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2BsaXN0LSR7cmVxLmlkfWB9XG4gICAgICAgICAgICAgICAgdG89XCJyZXF1ZXN0LWVkaXRvclwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTIgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1tZXRob2RcIj57cmVxLm1ldGhvZH08L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LWNvcHlcIiBnYXA9ezJ9IHN0eWxlPXt7IGZsZXg6IDEgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1uYW1lXCI+e3JlcS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjb2xsZWN0aW9uX19saXN0LXBhdGhcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAge2ZvbGRlci5uYW1lfSBcdTAwQjcge3JlcS5wYXRofVxuICAgICAgICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwiY29sbGVjdGlvbl9fbGlzdC1vcGVuXCIgdG89XCJyZXF1ZXN0LWVkaXRvclwiPlx1NjI1M1x1NUYwMDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgICApKSxcbiAgICAgICAgICApfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIERhdGFUYWJsZSxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBTZWxlY3QsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IEVOVl9MSVNUID0gW1xuICB7IGlkOiAnZW52LXN0YWdpbmcnLCBuYW1lOiAnU3RhZ2luZycsIGFjdGl2ZTogdHJ1ZSwgdmFyczogNiB9LFxuICB7IGlkOiAnZW52LXByb2QnLCBuYW1lOiAnUHJvZHVjdGlvbicsIGFjdGl2ZTogZmFsc2UsIHZhcnM6IDYgfSxcbiAgeyBpZDogJ2Vudi1sb2NhbCcsIG5hbWU6ICdMb2NhbCcsIGFjdGl2ZTogZmFsc2UsIHZhcnM6IDQgfSxcbl1cblxuY29uc3QgVkFSX1JPV1MgPSBbXG4gIHsgaWQ6ICd2LWJhc2UnLCBrZXk6ICdiYXNlVXJsJywgaW5pdGlhbDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20nLCBjdXJyZW50OiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbScgfSxcbiAgeyBpZDogJ3YtdG9rZW4nLCBrZXk6ICd0b2tlbicsIGluaXRpYWw6ICdzdF9kZW1vXyoqKionLCBjdXJyZW50OiAnc3RfZGVtb18qKioqJyB9LFxuICB7IGlkOiAndi10ZW5hbnQnLCBrZXk6ICd0ZW5hbnRJZCcsIGluaXRpYWw6ICd0bl8xMDA4NicsIGN1cnJlbnQ6ICd0bl8xMDA4NicgfSxcbiAgeyBpZDogJ3YtdGltZW91dCcsIGtleTogJ3RpbWVvdXRNcycsIGluaXRpYWw6ICcxNTAwMCcsIGN1cnJlbnQ6ICcxNTAwMCcgfSxcbiAgeyBpZDogJ3YtbG9jYWxlJywga2V5OiAnbG9jYWxlJywgaW5pdGlhbDogJ3poLUNOJywgY3VycmVudDogJ3poLUNOJyB9LFxuXVxuXG5jb25zdCBWQVJfQ09MVU1OUyA9IFtcbiAgeyBrZXk6ICdrZXknLCBsYWJlbDogJ1ZhcmlhYmxlJyB9LFxuICB7IGtleTogJ2luaXRpYWwnLCBsYWJlbDogJ0luaXRpYWwgVmFsdWUnIH0sXG4gIHsga2V5OiAnY3VycmVudCcsIGxhYmVsOiAnQ3VycmVudCBWYWx1ZScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEVudmlyb25tZW50c1NjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGw+XG4gICAgICA8Q29sdW1uIGlkPVwiZW52aXJvbm1lbnRzLXBhZ2VcIiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3BhZ2VcIiBnYXA9ezE2fSBzdHlsZT17eyBwYWRkaW5nOiAyNCB9fT5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImVudmlyb25tZW50cy1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJlbnZpcm9ubWVudHMtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTU3MjhcdThCRjdcdTZDNDIgVVJMIC8gSGVhZGVyIC8gQm9keSBcdTRFMkRcdTkwMUFcdThGQzcge3t2YXJ9fSBcdTVGMTVcdTc1MjhcIlxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2FjdGlvbi13b3Jrc3BhY2VcIiB0bz1cIndvcmtzcGFjZVwiPlx1OEZENFx1NTZERVx1NURFNVx1NEY1Q1x1NTMzQTwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fYWN0aW9uLWFkZFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCI+XHU2REZCXHU1MkEwXHU1M0Q4XHU5MUNGPC9CdXR0b24+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICB9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPFJvdyBpZD1cImVudmlyb25tZW50cy1waWNrZXJcIiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3BpY2tlclwiIGdhcD17MTJ9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX3BpY2tlci1sYWJlbFwiPlx1NUY1M1x1NTI0RFx1NzNBRlx1NTg4MzwvVGV4dD5cbiAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fc2VsZWN0XCIgZGVmYXVsdFZhbHVlPVwiU3RhZ2luZ1wiIHN0eWxlPXt7IHdpZHRoOiAyMDAgfX0+XG4gICAgICAgICAgICA8b3B0aW9uPlN0YWdpbmc8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24+UHJvZHVjdGlvbjwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbj5Mb2NhbDwvb3B0aW9uPlxuICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2FjdGl2ZS1iYWRnZVwiPkFjdGl2ZTwvQmFkZ2U+XG4gICAgICAgIDwvUm93PlxuXG4gICAgICAgIDxSb3cgaWQ9XCJlbnZpcm9ubWVudHMtY2FyZHNcIiBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmRzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAge0VOVl9MSVNULm1hcCgoZW52KSA9PiAoXG4gICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICBrZXk9e2Vudi5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkXCJcbiAgICAgICAgICAgICAgZGF0YS13Zi1rZXk9e2Vudi5pZH1cbiAgICAgICAgICAgICAgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMTQgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJlbnZpcm9ubWVudHNfX2NhcmQtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkLW5hbWVcIj57ZW52Lm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAge2Vudi5hY3RpdmUgPyA8QmFkZ2UgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkLWJhZGdlXCI+XHU0RjdGXHU3NTI4XHU0RTJEPC9CYWRnZT4gOiBudWxsfVxuICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX19jYXJkLW1ldGFcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIG1hcmdpblRvcDogNiB9fT5cbiAgICAgICAgICAgICAgICB7ZW52LnZhcnN9IFx1NEUyQVx1NTNEOFx1OTFDRlxuICAgICAgICAgICAgICA8L1RleHQ+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvUm93PlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJlbnZpcm9ubWVudHMtdGFibGUtd3JhcFwiIGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fdGFibGUtd3JhcFwiIGdhcD17MTB9PlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImVudmlyb25tZW50c19fdGFibGUtdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+U3RhZ2luZyBcdTUzRDhcdTkxQ0Y8L1RleHQ+XG4gICAgICAgICAgPERhdGFUYWJsZVxuICAgICAgICAgICAgaWQ9XCJlbnZpcm9ubWVudHMtdGFibGVcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZW52aXJvbm1lbnRzX190YWJsZVwiXG4gICAgICAgICAgICBjb2x1bW5zPXtWQVJfQ09MVU1OU31cbiAgICAgICAgICAgIHJvd3M9e1ZBUl9ST1dTfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5jb25zdCBISVNUT1JZID0gW1xuICB7XG4gICAgaWQ6ICdoaXN0LTEnLFxuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgbmFtZTogJ0xpc3QgVXNlcnMnLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvdXNlcnM/cGFnZT0xJyxcbiAgICBzdGF0dXM6ICcyMDAnLFxuICAgIHRpbWU6ICcxNDIgbXMnLFxuICAgIGF0OiAnXHU0RUNBXHU1OTI5IDE0OjIxOjA4JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnaGlzdC0yJyxcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBuYW1lOiAnQ3JlYXRlIE9yZGVyJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL29yZGVycycsXG4gICAgc3RhdHVzOiAnMjAxJyxcbiAgICB0aW1lOiAnMzEwIG1zJyxcbiAgICBhdDogJ1x1NEVDQVx1NTkyOSAxMzo1NTo0MScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtMycsXG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgbmFtZTogJ0xvZ2luJyxcbiAgICB1cmw6ICdodHRwczovL2FwaS5zdGFnaW5nLmV4YW1wbGUuY29tL3YxL2F1dGgvbG9naW4nLFxuICAgIHN0YXR1czogJzIwMCcsXG4gICAgdGltZTogJzk4IG1zJyxcbiAgICBhdDogJ1x1NEVDQVx1NTkyOSAxMTowMjoxNycsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtNCcsXG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICBuYW1lOiAnR2V0IEludm9pY2UnLFxuICAgIHVybDogJ2h0dHBzOi8vYXBpLnN0YWdpbmcuZXhhbXBsZS5jb20vdjEvYmlsbGluZy9pbnZvaWNlcy9pbnZfODgnLFxuICAgIHN0YXR1czogJzQwNCcsXG4gICAgdGltZTogJzY3IG1zJyxcbiAgICBhdDogJ1x1NjYyOFx1NTkyOSAxOTo0NDowMycsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2hpc3QtNScsXG4gICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgIG5hbWU6ICdVcGRhdGUgVXNlcicsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS91c2Vycy91XzEwMDEnLFxuICAgIHN0YXR1czogJzIwMCcsXG4gICAgdGltZTogJzE4OCBtcycsXG4gICAgYXQ6ICdcdTY2MjhcdTU5MjkgMTY6MTI6NTAnLFxuICB9LFxuICB7XG4gICAgaWQ6ICdoaXN0LTYnLFxuICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgbmFtZTogJ1Jldm9rZSBUb2tlbicsXG4gICAgdXJsOiAnaHR0cHM6Ly9hcGkuc3RhZ2luZy5leGFtcGxlLmNvbS92MS9hdXRoL3Rva2VuJyxcbiAgICBzdGF0dXM6ICcyMDQnLFxuICAgIHRpbWU6ICc1NCBtcycsXG4gICAgYXQ6ICcwOC0wOCAyMTowNjoyMicsXG4gIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBIaXN0b3J5U2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJoaXN0b3J5LXBhZ2VcIiBjbGFzc05hbWU9XCJoaXN0b3J5X19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJoaXN0b3J5LWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImhpc3RvcnktdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImhpc3RvcnlfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTUzODZcdTUzRjJcdThCQjBcdTVGNTVcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU2NzJDXHU2NzNBXHU2NzAwXHU4RkQxXHU1M0QxXHU5MDAxXHU3Njg0XHU4QkY3XHU2QzQyXHVGRjBDXHU1M0VGXHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU1MjMwXHU3RjE2XHU4RjkxXHU1NjY4XCJcbiAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaGlzdG9yeV9faGVhZGVyLWFjdGlvbnNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2FjdGlvbi1jbGVhclwiPlx1NkUwNVx1N0E3QVx1NTM4Nlx1NTNGMjwvQnV0dG9uPlxuICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cImhpc3RvcnlfX2FjdGlvbi13b3Jrc3BhY2VcIiB0bz1cIndvcmtzcGFjZVwiPlx1OEZENFx1NTZERVx1NURFNVx1NEY1Q1x1NTMzQTwvQnV0dG9uPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgfVxuICAgICAgICAvPlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJoaXN0b3J5LWxpc3RcIiBjbGFzc05hbWU9XCJoaXN0b3J5X19saXN0XCIgZ2FwPXsxMH0+XG4gICAgICAgICAge0hJU1RPUlkubWFwKChpdGVtKSA9PiAoXG4gICAgICAgICAgICA8Q2FyZFxuICAgICAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW1cIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgdG89XCJyZXF1ZXN0LWVkaXRvclwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7IHBhZGRpbmc6IDEyIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tbWV0aG9kXCI+e2l0ZW0ubWV0aG9kfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLWNvcHlcIiBnYXA9ezJ9IHN0eWxlPXt7IGZsZXg6IDEsIG1pbldpZHRoOiAwIH19PlxuICAgICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLW5hbWVcIj57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaGlzdG9yeV9faXRlbS11cmxcIiBzdHlsZT17eyBmb250U2l6ZTogMTIgfX0+e2l0ZW0udXJsfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImhpc3RvcnlfX2l0ZW0tYXRcIiBzdHlsZT17eyBmb250U2l6ZTogMTIsIGNvbG9yOiAndmFyKC0td2YtNjAwKScgfX0+XG4gICAgICAgICAgICAgICAgICAgIHtpdGVtLmF0fVxuICAgICAgICAgICAgICAgICAgPC9UZXh0PlxuICAgICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXN0YXR1c1wiPntpdGVtLnN0YXR1c308L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLXRpbWVcIj57aXRlbS50aW1lfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJoaXN0b3J5X19pdGVtLW9wZW5cIiB0bz1cInJlcXVlc3QtZWRpdG9yXCI+XHU2MjUzXHU1RjAwPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIERhdGFUYWJsZSxcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBTZWxlY3QsXG4gIFRhYnMsXG4gIFRleHQsXG4gIFRleHRBcmVhLFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IFBBUkFNX1JPV1MgPSBbXG4gIHsgaWQ6ICdwLXBhZ2UnLCBrZXk6ICdwYWdlJywgdmFsdWU6ICcxJywgZGVzYzogJ1x1OTg3NVx1NzgwMScgfSxcbiAgeyBpZDogJ3Atc2l6ZScsIGtleTogJ3NpemUnLCB2YWx1ZTogJzIwJywgZGVzYzogJ1x1NkJDRlx1OTg3NVx1Njc2MVx1NjU3MCcgfSxcbiAgeyBpZDogJ3AtcScsIGtleTogJ3EnLCB2YWx1ZTogJ2FsaWNlJywgZGVzYzogJ1x1NTE3M1x1OTUyRVx1NUI1N1x1NjQxQ1x1N0QyMicgfSxcbiAgeyBpZDogJ3Atc3RhdHVzJywga2V5OiAnc3RhdHVzJywgdmFsdWU6ICdhY3RpdmUnLCBkZXNjOiAnXHU3NTI4XHU2MjM3XHU3MkI2XHU2MDAxJyB9LFxuXVxuXG5jb25zdCBIRUFERVJfUk9XUyA9IFtcbiAgeyBpZDogJ2gtYXV0aCcsIGtleTogJ0F1dGhvcml6YXRpb24nLCB2YWx1ZTogJ0JlYXJlciB7e3Rva2VufX0nLCBkZXNjOiAnXHU4QkJGXHU5NUVFXHU0RUU0XHU3MjRDJyB9LFxuICB7IGlkOiAnaC1hY2NlcHQnLCBrZXk6ICdBY2NlcHQnLCB2YWx1ZTogJ2FwcGxpY2F0aW9uL2pzb24nLCBkZXNjOiAnJyB9LFxuICB7IGlkOiAnaC10cmFjZScsIGtleTogJ1gtUmVxdWVzdC1JZCcsIHZhbHVlOiAne3skZ3VpZH19JywgZGVzYzogJ1x1OTRGRVx1OERFRlx1OEZGRFx1OEUyQScgfSxcbiAgeyBpZDogJ2gtY2xpZW50Jywga2V5OiAnWC1DbGllbnQnLCB2YWx1ZTogJ2FwaS1jbGllbnQtZGVtbycsIGRlc2M6ICcnIH0sXG5dXG5cbmNvbnN0IFBBUkFNX0NPTFVNTlMgPSBbXG4gIHsga2V5OiAna2V5JywgbGFiZWw6ICdLZXknIH0sXG4gIHsga2V5OiAndmFsdWUnLCBsYWJlbDogJ1ZhbHVlJyB9LFxuICB7IGtleTogJ2Rlc2MnLCBsYWJlbDogJ0Rlc2NyaXB0aW9uJyB9LFxuXVxuXG5jb25zdCBSRVNQT05TRV9KU09OID0gYHtcbiAgXCJkYXRhXCI6IFtcbiAgICB7IFwiaWRcIjogXCJ1XzEwMDFcIiwgXCJuYW1lXCI6IFwiQWxpY2VcIiwgXCJyb2xlXCI6IFwiYWRtaW5cIiB9LFxuICAgIHsgXCJpZFwiOiBcInVfMTAwMlwiLCBcIm5hbWVcIjogXCJCb2JcIiwgXCJyb2xlXCI6IFwiZWRpdG9yXCIgfSxcbiAgICB7IFwiaWRcIjogXCJ1XzEwMDNcIiwgXCJuYW1lXCI6IFwiQ2Fyb2xcIiwgXCJyb2xlXCI6IFwidmlld2VyXCIgfVxuICBdLFxuICBcInBhZ2VcIjogMSxcbiAgXCJ0b3RhbFwiOiAxMjhcbn1gXG5cbmV4cG9ydCBmdW5jdGlvbiBSZXF1ZXN0RWRpdG9yU2NyZWVuKCkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gUmVhY3QudXNlU3RhdGUoJ3BhcmFtcycpXG4gIGNvbnN0IFtyZXNwVGFiLCBzZXRSZXNwVGFiXSA9IFJlYWN0LnVzZVN0YXRlKCdib2R5JylcblxuICByZXR1cm4gKFxuICAgIDxBcHBTaGVsbD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJyZXF1ZXN0LWVkaXRvci1wYWdlXCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3BhZ2VcIiBnYXA9ezB9IHN0eWxlPXt7IGhlaWdodDogJzEwMCUnIH19PlxuICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX190b3BcIiBnYXA9ezEyfSBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCAyNHB4IDEycHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgdmFyKC0td2YtMzAwKScgfX0+XG4gICAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItaGVhZGVyXCJcbiAgICAgICAgICAgIHRpdGxlSWQ9XCJyZXF1ZXN0LWVkaXRvci10aXRsZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9faGVhZGVyXCJcbiAgICAgICAgICAgIHRpdGxlPVwiTGlzdCBVc2Vyc1wiXG4gICAgICAgICAgICBzdWJ0aXRsZT1cIlVzZXIgQVBJIC8gVXNlcnNcIlxuICAgICAgICAgICAgYWN0aW9ucz17XG4gICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2hlYWRlci1hY3Rpb25zXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hY3Rpb24tY29sbGVjdGlvblwiIHRvPVwiY29sbGVjdGlvblwiPlx1OEZENFx1NTZERSBDb2xsZWN0aW9uPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYWN0aW9uLXNhdmVcIiB0bz1cImNvbGxlY3Rpb25cIj5TYXZlPC9CdXR0b24+XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICA8Um93IGlkPVwicmVxdWVzdC1lZGl0b3ItdXJsYmFyXCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3VybGJhclwiIGdhcD17OH0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgICAgPFNlbGVjdCBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fbWV0aG9kXCIgZGVmYXVsdFZhbHVlPVwiR0VUXCIgc3R5bGU9e3sgd2lkdGg6IDExMCB9fT5cbiAgICAgICAgICAgICAgPG9wdGlvbj5HRVQ8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5QT1NUPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+UFVUPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+UEFUQ0g8L29wdGlvbj5cbiAgICAgICAgICAgICAgPG9wdGlvbj5ERUxFVEU8L29wdGlvbj5cbiAgICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICAgICAgPFRleHRJbnB1dFxuICAgICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXVybFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX191cmxcIlxuICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9XCJ7e2Jhc2VVcmx9fS92MS91c2Vyc1wiXG4gICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8U2VsZWN0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19lbnZcIiBkZWZhdWx0VmFsdWU9XCJTdGFnaW5nXCIgc3R5bGU9e3sgd2lkdGg6IDE0MCB9fT5cbiAgICAgICAgICAgICAgPG9wdGlvbj5TdGFnaW5nPC9vcHRpb24+XG4gICAgICAgICAgICAgIDxvcHRpb24+UHJvZHVjdGlvbjwvb3B0aW9uPlxuICAgICAgICAgICAgICA8b3B0aW9uPkxvY2FsPC9vcHRpb24+XG4gICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgIDxCdXR0b24gaWQ9XCJyZXF1ZXN0LWVkaXRvci1zZW5kXCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3NlbmRcIiB2YXJpYW50PVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICBTZW5kXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L1Jvdz5cblxuICAgICAgICAgIDxUYWJzXG4gICAgICAgICAgICBpZD1cInJlcXVlc3QtZWRpdG9yLXRhYnNcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3RhYnNcIlxuICAgICAgICAgICAgYWN0aXZlSWQ9e3RhYn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXtzZXRUYWJ9XG4gICAgICAgICAgICBpdGVtcz17W1xuICAgICAgICAgICAgICB7IGlkOiAncGFyYW1zJywgbGFiZWw6ICdQYXJhbXMnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdoZWFkZXJzJywgbGFiZWw6ICdIZWFkZXJzJyB9LFxuICAgICAgICAgICAgICB7IGlkOiAnYm9keScsIGxhYmVsOiAnQm9keScgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2F1dGgnLCBsYWJlbDogJ0F1dGhvcml6YXRpb24nIH0sXG4gICAgICAgICAgICBdfVxuICAgICAgICAgIC8+XG5cbiAgICAgICAgICB7dGFiID09PSAncGFyYW1zJyA/IChcbiAgICAgICAgICAgIDxEYXRhVGFibGVcbiAgICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1wYXJhbXNcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcGFyYW1zXCJcbiAgICAgICAgICAgICAgY29sdW1ucz17UEFSQU1fQ09MVU1OU31cbiAgICAgICAgICAgICAgcm93cz17UEFSQU1fUk9XU31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dGFiID09PSAnaGVhZGVycycgPyAoXG4gICAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItaGVhZGVyc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY29sdW1ucz17UEFSQU1fQ09MVU1OU31cbiAgICAgICAgICAgICAgcm93cz17SEVBREVSX1JPV1N9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3RhYiA9PT0gJ2JvZHknID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1ib2R5XCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2JvZHlcIiBzdHlsZT17eyBwYWRkaW5nOiAxMiB9fT5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keS10b29sYmFyXCIgZ2FwPXs4fSBzdHlsZT17eyBtYXJnaW5Cb3R0b206IDggfX0+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LXR5cGVcIj5yYXc8L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYm9keS1mb3JtYXRcIj5KU09OPC9CYWRnZT5cbiAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDxUZXh0QXJlYVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19ib2R5LWlucHV0XCJcbiAgICAgICAgICAgICAgICByb3dzPXs2fVxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17J3tcXG4gIFwibm90ZVwiOiBcIkdFVCBcdThCRjdcdTZDNDJcdTkwMUFcdTVFMzhcdTY1RTAgQm9keVx1RkYwQ1x1NkI2NFx1NTkwNFx1NEVDNVx1NzkzQVx1NjEwRlx1N0YxNlx1OEY5MVx1NTMzQVwiXFxufSd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7dGFiID09PSAnYXV0aCcgPyAoXG4gICAgICAgICAgICA8Q2FyZCBpZD1cInJlcXVlc3QtZWRpdG9yLWF1dGhcIiBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aFwiIHN0eWxlPXt7IHBhZGRpbmc6IDE0IH19PlxuICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLWZpZWxkc1wiIGdhcD17MTB9PlxuICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtcm93XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtbGFiZWxcIiBzdHlsZT17eyB3aWR0aDogODAgfX0+VHlwZTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDxTZWxlY3QgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2F1dGgtdHlwZVwiIGRlZmF1bHRWYWx1ZT1cIkJlYXJlciBUb2tlblwiIHN0eWxlPXt7IHdpZHRoOiAyMDAgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+QmVhcmVyIFRva2VuPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24+QVBJIEtleTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uPkJhc2ljIEF1dGg8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbj5ObyBBdXRoPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLXJvd1wiIGdhcD17MTJ9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19hdXRoLWxhYmVsXCIgc3R5bGU9e3sgd2lkdGg6IDgwIH19PlRva2VuPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPFRleHRJbnB1dFxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fYXV0aC10b2tlblwiXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT1cInt7dG9rZW59fVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEgfX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L0NvbHVtbj5cblxuICAgICAgICA8Q29sdW1uXG4gICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlXCJcbiAgICAgICAgICBnYXA9ezEwfVxuICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6IDI0LCBiYWNrZ3JvdW5kOiAndmFyKC0td2YtNTApJywgbWluSGVpZ2h0OiAyODAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3Jlc3BvbnNlLWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtdGl0bGVcIiBsZXZlbD17M30+UmVzcG9uc2U8L0hlYWRpbmc+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1tZXRhXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19zdGF0dXNcIj4yMDAgT0s8L0JhZGdlPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3RpbWVcIj4xNDIgbXM8L0JhZGdlPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX3NpemVcIj4zLjIgS0I8L0JhZGdlPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPC9Sb3c+XG5cbiAgICAgICAgICA8VGFic1xuICAgICAgICAgICAgaWQ9XCJyZXF1ZXN0LWVkaXRvci1yZXNwb25zZS10YWJzXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS10YWJzXCJcbiAgICAgICAgICAgIGFjdGl2ZUlkPXtyZXNwVGFifVxuICAgICAgICAgICAgb25DaGFuZ2U9e3NldFJlc3BUYWJ9XG4gICAgICAgICAgICBpdGVtcz17W1xuICAgICAgICAgICAgICB7IGlkOiAnYm9keScsIGxhYmVsOiAnQm9keScgfSxcbiAgICAgICAgICAgICAgeyBpZDogJ2hlYWRlcnMnLCBsYWJlbDogJ0hlYWRlcnMnIH0sXG4gICAgICAgICAgICAgIHsgaWQ6ICdjb29raWVzJywgbGFiZWw6ICdDb29raWVzJyB9LFxuICAgICAgICAgICAgXX1cbiAgICAgICAgICAvPlxuXG4gICAgICAgICAge3Jlc3BUYWIgPT09ICdib2R5JyA/IChcbiAgICAgICAgICAgIDxDYXJkIGlkPVwicmVxdWVzdC1lZGl0b3ItcmVzcG9uc2UtYm9keVwiIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1ib2R5XCIgc3R5bGU9e3sgcGFkZGluZzogMTIgfX0+XG4gICAgICAgICAgICAgIDxwcmVcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZXF1ZXN0LWVkaXRvcl9fcmVzcG9uc2UtanNvblwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luOiAwLCBmb250U2l6ZTogMTIsIHdoaXRlU3BhY2U6ICdwcmUtd3JhcCcsIGZvbnRGYW1pbHk6ICd1aS1tb25vc3BhY2UsIG1vbm9zcGFjZScgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtSRVNQT05TRV9KU09OfVxuICAgICAgICAgICAgICA8L3ByZT5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHtyZXNwVGFiID09PSAnaGVhZGVycycgPyAoXG4gICAgICAgICAgICA8RGF0YVRhYmxlXG4gICAgICAgICAgICAgIGlkPVwicmVxdWVzdC1lZGl0b3ItcmVzcG9uc2UtaGVhZGVyc1wiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlcXVlc3QtZWRpdG9yX19yZXNwb25zZS1oZWFkZXJzXCJcbiAgICAgICAgICAgICAgY29sdW1ucz17W1xuICAgICAgICAgICAgICAgIHsga2V5OiAna2V5JywgbGFiZWw6ICdIZWFkZXInIH0sXG4gICAgICAgICAgICAgICAgeyBrZXk6ICd2YWx1ZScsIGxhYmVsOiAnVmFsdWUnIH0sXG4gICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgIHJvd3M9e1tcbiAgICAgICAgICAgICAgICB7IGlkOiAncmgtY3QnLCBrZXk6ICdjb250ZW50LXR5cGUnLCB2YWx1ZTogJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3JoLWNhY2hlJywga2V5OiAnY2FjaGUtY29udHJvbCcsIHZhbHVlOiAnbm8tc3RvcmUnIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogJ3JoLXJlcScsIGtleTogJ3gtcmVxdWVzdC1pZCcsIHZhbHVlOiAncmVxXzhmM2EyYycgfSxcbiAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAgICB7cmVzcFRhYiA9PT0gJ2Nvb2tpZXMnID8gKFxuICAgICAgICAgICAgPENhcmQgaWQ9XCJyZXF1ZXN0LWVkaXRvci1jb29raWVzXCIgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2Nvb2tpZXNcIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicmVxdWVzdC1lZGl0b3JfX2Nvb2tpZXMtZW1wdHlcIj5cdTY3MkNcdTZCMjFcdTU0Q0RcdTVFOTRcdTY3MkFcdThCQkVcdTdGNkUgQ29va2llPC9UZXh0PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvQXBwU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG4gIFRleHRJbnB1dCxcbiAgVG9nZ2xlLFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBBcHBTaGVsbCB9IGZyb20gJy4uL2xheW91dHMvQXBwU2hlbGwuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gU2V0dGluZ3NTY3JlZW4oKSB7XG4gIGNvbnN0IFtzc2wsIHNldFNzbF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbZm9sbG93UmVkaXJlY3QsIHNldEZvbGxvd1JlZGlyZWN0XSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtwcm94eSwgc2V0UHJveHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgcmV0dXJuIChcbiAgICA8QXBwU2hlbGw+XG4gICAgICA8Q29sdW1uIGlkPVwic2V0dGluZ3MtcGFnZVwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJzZXR0aW5ncy1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJzZXR0aW5ncy10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwic2V0dGluZ3NfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdThCQkVcdTdGNkVcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU5MDFBXHU3NTI4XHU1MDRGXHU1OTdEXHUzMDAxXHU0RUUzXHU3NDA2XHU0RTBFXHU4QkMxXHU0RTY2XHVGRjA4XHU3RUJGXHU2ODQ2XHU3OTNBXHU2MTBGXHVGRjA5XCJcbiAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwic2V0dGluZ3NfX2FjdGlvbi13b3Jrc3BhY2VcIiB0bz1cIndvcmtzcGFjZVwiPlx1OEZENFx1NTZERVx1NURFNVx1NEY1Q1x1NTMzQTwvQnV0dG9uPlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q2FyZCBpZD1cInNldHRpbmdzLWdlbmVyYWxcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvblwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tYm9keVwiIGdhcD17MTR9PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XHU5MDFBXHU3NTI4PC9UZXh0PlxuICAgICAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJzZXR0aW5nc19fZmllbGRcIiBsYWJlbD1cIlx1OUVEOFx1OEJBNFx1OEQ4NVx1NjVGNlx1RkYwOG1zXHVGRjA5XCIgaHRtbEZvcj1cInNldHRpbmdzLXRpbWVvdXRcIj5cbiAgICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cInNldHRpbmdzLXRpbWVvdXRcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fdGltZW91dFwiIGRlZmF1bHRWYWx1ZT1cIjE1MDAwXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3RvZ2dsZS1sYWJlbFwiPlx1ODFFQVx1NTJBOFx1OERERlx1OTY4Rlx1OTFDRFx1NUI5QVx1NTQxMTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgICAgICAgIGlkPVwic2V0dGluZ3MtcmVkaXJlY3RcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19yZWRpcmVjdFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17Zm9sbG93UmVkaXJlY3R9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3NldEZvbGxvd1JlZGlyZWN0fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInNldHRpbmdzX190b2dnbGUtcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJzZXR0aW5nc19fdG9nZ2xlLWxhYmVsXCI+XHU2ODIxXHU5QThDXHU4QkMxXHU0RTY2XHVGRjA4U1NMXHVGRjA5PC9UZXh0PlxuICAgICAgICAgICAgICA8VG9nZ2xlXG4gICAgICAgICAgICAgICAgaWQ9XCJzZXR0aW5ncy1zc2xcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNldHRpbmdzX19zc2xcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NzbH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0U3NsfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cblxuICAgICAgICA8Q2FyZCBpZD1cInNldHRpbmdzLXByb3h5XCIgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb25cIiBzdHlsZT17eyBwYWRkaW5nOiAxNiB9fT5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLWJvZHlcIiBnYXA9ezE0fT5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3Byb3h5LWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInNldHRpbmdzX19zZWN0aW9uLXRpdGxlXCIgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwIH19Plx1NEVFM1x1NzQwNjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgICAgICAgIGlkPVwic2V0dGluZ3MtcHJveHktdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzZXR0aW5nc19fcHJveHktdG9nZ2xlXCJcbiAgICAgICAgICAgICAgICBjaGVja2VkPXtwcm94eX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17c2V0UHJveHl9XG4gICAgICAgICAgICAgICAgbGFiZWw9e3Byb3h5ID8gJ1x1NUYwMFx1NTQyRicgOiAnXHU1MTczXHU5NUVEJ31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJzZXR0aW5nc19fZmllbGRcIiBsYWJlbD1cIkhvc3RcIiBodG1sRm9yPVwic2V0dGluZ3MtcHJveHktaG9zdFwiPlxuICAgICAgICAgICAgICA8VGV4dElucHV0IGlkPVwic2V0dGluZ3MtcHJveHktaG9zdFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS1ob3N0XCIgZGVmYXVsdFZhbHVlPVwiMTI3LjAuMC4xXCIgLz5cbiAgICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJzZXR0aW5nc19fZmllbGRcIiBsYWJlbD1cIlBvcnRcIiBodG1sRm9yPVwic2V0dGluZ3MtcHJveHktcG9ydFwiPlxuICAgICAgICAgICAgICA8VGV4dElucHV0IGlkPVwic2V0dGluZ3MtcHJveHktcG9ydFwiIGNsYXNzTmFtZT1cInNldHRpbmdzX19wcm94eS1wb3J0XCIgZGVmYXVsdFZhbHVlPVwiNzg5MFwiIC8+XG4gICAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDYXJkIGlkPVwic2V0dGluZ3MtY2VydHNcIiBjbGFzc05hbWU9XCJzZXR0aW5nc19fc2VjdGlvblwiIHN0eWxlPXt7IHBhZGRpbmc6IDE2IH19PlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX3NlY3Rpb24tdGl0bGVcIiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAgfX0+XHU4QkMxXHU0RTY2PC9UZXh0PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwic2V0dGluZ3NfX2NlcnRzLWVtcHR5XCIgc3R5bGU9e3sgZm9udFNpemU6IDEzIH19PlxuICAgICAgICAgICAgICBcdTVDMUFcdTY3MkFcdTZERkJcdTUyQTBcdTVCQTJcdTYyMzdcdTdBRUZcdThCQzFcdTRFNjZcdTMwMDJcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTUzRUZcdTU3MjhcdTZCNjRcdTYzMDJcdThGN0QgLnBlbSAvIC5wMTJcdTMwMDJcbiAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwic2V0dGluZ3NfX2NlcnRzLWFkZFwiPlx1NkRGQlx1NTJBMFx1OEJDMVx1NEU2NjwvQnV0dG9uPlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L0FwcFNoZWxsPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IEFwcFNoZWxsIH0gZnJvbSAnLi4vbGF5b3V0cy9BcHBTaGVsbC5qc3gnXG5cbmNvbnN0IENPTExFQ1RJT05TID0gW1xuICB7XG4gICAgaWQ6ICdjb2wtdXNlcnMnLFxuICAgIG5hbWU6ICdVc2VyIEFQSScsXG4gICAgZGVzYzogJ1x1NzUyOFx1NjIzN1x1NTIxN1x1ODg2OFx1MzAwMVx1OEJFNlx1NjBDNVx1MzAwMVx1NjZGNFx1NjVCMFx1NEUwRVx1Nzk4MVx1NzUyOCcsXG4gICAgY291bnQ6IDYsXG4gICAgdXBkYXRlZEF0OiAnXHU0RUNBXHU1OTI5IDEwOjI0JyxcbiAgfSxcbiAge1xuICAgIGlkOiAnY29sLW9yZGVycycsXG4gICAgbmFtZTogJ09yZGVyIEFQSScsXG4gICAgZGVzYzogJ1x1OEJBMlx1NTM1NVx1NjdFNVx1OEJFMlx1MzAwMVx1NTIxQlx1NUVGQVx1MzAwMVx1NTNENlx1NkQ4OFx1MzAwMVx1NUM2NVx1N0VBNlx1NzJCNlx1NjAwMScsXG4gICAgY291bnQ6IDksXG4gICAgdXBkYXRlZEF0OiAnXHU2NjI4XHU1OTI5IDE4OjAyJyxcbiAgfSxcbiAge1xuICAgIGlkOiAnY29sLWF1dGgnLFxuICAgIG5hbWU6ICdBdXRoJyxcbiAgICBkZXNjOiAnXHU3NjdCXHU1RjU1XHUzMDAxXHU1MjM3XHU2NUIwIFRva2VuXHUzMDAxXHU3NjdCXHU1MUZBJyxcbiAgICBjb3VudDogNCxcbiAgICB1cGRhdGVkQXQ6ICcwOC0wOCAxNDoxMScsXG4gIH0sXG4gIHtcbiAgICBpZDogJ2NvbC1iaWxsaW5nJyxcbiAgICBuYW1lOiAnQmlsbGluZycsXG4gICAgZGVzYzogJ1x1OEQyNlx1NTM1NVx1MzAwMVx1NTNEMVx1Nzk2OFx1MzAwMVx1NjUyRlx1NEVEOFx1NTZERVx1OEMwMycsXG4gICAgY291bnQ6IDUsXG4gICAgdXBkYXRlZEF0OiAnMDgtMDcgMDk6NDAnLFxuICB9LFxuXVxuXG5jb25zdCBSRUNFTlQgPSBbXG4gIHsgaWQ6ICdyZXEtbGlzdC11c2VycycsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdMaXN0IFVzZXJzJywgcGF0aDogJy92MS91c2VycycsIHN0YXR1czogJzIwMCcgfSxcbiAgeyBpZDogJ3JlcS1jcmVhdGUtb3JkZXInLCBtZXRob2Q6ICdQT1NUJywgbmFtZTogJ0NyZWF0ZSBPcmRlcicsIHBhdGg6ICcvdjEvb3JkZXJzJywgc3RhdHVzOiAnMjAxJyB9LFxuICB7IGlkOiAncmVxLWxvZ2luJywgbWV0aG9kOiAnUE9TVCcsIG5hbWU6ICdMb2dpbicsIHBhdGg6ICcvdjEvYXV0aC9sb2dpbicsIHN0YXR1czogJzIwMCcgfSxcbiAgeyBpZDogJ3JlcS1nZXQtaW52b2ljZScsIG1ldGhvZDogJ0dFVCcsIG5hbWU6ICdHZXQgSW52b2ljZScsIHBhdGg6ICcvdjEvYmlsbGluZy9pbnZvaWNlcy86aWQnLCBzdGF0dXM6ICc0MDQnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBXb3Jrc3BhY2VTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPEFwcFNoZWxsXG4gICAgICBhc2lkZT17XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ3b3Jrc3BhY2UtYXNpZGVcIiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FzaWRlXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FzaWRlLWhlYWRcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FzaWRlLXRpdGxlXCIgbGV2ZWw9ezN9PkNvbGxlY3Rpb25zPC9IZWFkaW5nPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FzaWRlLW5ld1wiIHRvPVwiY29sbGVjdGlvblwiPlx1NjVCMFx1NUVGQTwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIHtDT0xMRUNUSU9OUy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid29ya3NwYWNlX19jb2xsZWN0aW9uLWNhcmRcIlxuICAgICAgICAgICAgICBkYXRhLXdmLWtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgdG89XCJjb2xsZWN0aW9uXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tbmFtZVwiPntpdGVtLm5hbWV9PC9zdHJvbmc+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fY29sbGVjdGlvbi1jb3VudFwiPntpdGVtLmNvdW50fTwvQmFkZ2U+XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2NvbGxlY3Rpb24tZGVzY1wiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiwgbWFyZ2luVG9wOiA0IH19PlxuICAgICAgICAgICAgICAgIHtpdGVtLmRlc2N9XG4gICAgICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICB9XG4gICAgPlxuICAgICAgPENvbHVtbiBpZD1cIndvcmtzcGFjZS1wYWdlXCIgY2xhc3NOYW1lPVwid29ya3NwYWNlX19wYWdlXCIgZ2FwPXsxNn0gc3R5bGU9e3sgcGFkZGluZzogMjQgfX0+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJ3b3Jrc3BhY2UtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwid29ya3NwYWNlLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTVERTVcdTRGNUNcdTUzM0FcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU5MDA5XHU2MkU5IENvbGxlY3Rpb24gXHU2MjUzXHU1RjAwXHU4QkY3XHU2QzQyXHVGRjBDXHU2MjE2XHU0RUNFXHU2NzAwXHU4RkQxXHU4QkIwXHU1RjU1XHU3RUU3XHU3RUVEXHU3RjE2XHU4RjkxXCJcbiAgICAgICAgICBhY3Rpb25zPXtcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid29ya3NwYWNlX19oZWFkZXItYWN0aW9uc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwid29ya3NwYWNlX19hY3Rpb24tZW52XCIgdG89XCJlbnZpcm9ubWVudHNcIj5cdTUyMDdcdTYzNjJcdTczQUZcdTU4ODM8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX2FjdGlvbi1uZXdcIiB0bz1cInJlcXVlc3QtZWRpdG9yXCIgdmFyaWFudD1cInByaW1hcnlcIj5cdTY1QjBcdTVFRkFcdThCRjdcdTZDNDI8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cblxuICAgICAgICA8Q2FyZCBpZD1cIndvcmtzcGFjZS13ZWxjb21lXCIgY2xhc3NOYW1lPVwid29ya3NwYWNlX193ZWxjb21lXCIgc3R5bGU9e3sgcGFkZGluZzogMTYgfX0+XG4gICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX193ZWxjb21lLXRpdGxlXCIgbGV2ZWw9ezN9PkRlbW8gV29ya3NwYWNlPC9IZWFkaW5nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fd2VsY29tZS1jb3B5XCI+XG4gICAgICAgICAgICBcdTVGNTNcdTUyNERcdTczQUZcdTU4ODNcdUZGMUFTdGFnaW5nIFx1MDBCNyBCYXNlIFVSTCBcdTRGN0ZcdTc1Mjggeyd7e2Jhc2VVcmx9fSd9IFx1MDBCNyBcdTUxNzEgNCBcdTRFMkEgQ29sbGVjdGlvblxuICAgICAgICAgIDwvVGV4dD5cbiAgICAgICAgPC9DYXJkPlxuXG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ3b3Jrc3BhY2UtcmVjZW50XCIgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnRcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC10aXRsZVwiIGxldmVsPXszfT5cdTY3MDBcdThGRDFcdThCRjdcdTZDNDI8L0hlYWRpbmc+XG4gICAgICAgICAge1JFQ0VOVC5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgICAgIDxDYXJkXG4gICAgICAgICAgICAgIGtleT17aXRlbS5pZH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtaXRlbVwiXG4gICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICB0bz1cInJlcXVlc3QtZWRpdG9yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZzogMTIgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3JlY2VudC1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LW1ldGhvZFwiPntpdGVtLm1ldGhvZH08L0JhZGdlPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtY29weVwiIGdhcD17Mn0gc3R5bGU9e3sgZmxleDogMSwgbWluV2lkdGg6IDAgfX0+XG4gICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fcmVjZW50LW5hbWVcIj57aXRlbS5uYW1lfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtcGF0aFwiIHN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fT57aXRlbS5wYXRofTwvVGV4dD5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwid29ya3NwYWNlX19yZWNlbnQtc3RhdHVzXCI+e2l0ZW0uc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cblxuICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXRzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dFwiIHRvPVwiaGlzdG9yeVwiIHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6IDE0IH19PlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwid29ya3NwYWNlX19zaG9ydGN1dC10aXRsZVwiIGxldmVsPXszfT5cdTUzODZcdTUzRjJcdThCQjBcdTVGNTU8L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LWRlc2NcIj5cdTY3RTVcdTc3MEJcdTY3MkNcdTY3M0FcdTUzRDFcdTkwMDFcdThGQzdcdTc2ODRcdThCRjdcdTZDNDI8L1RleHQ+XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXRcIiB0bz1cInNldHRpbmdzXCIgc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogMTQgfX0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJ3b3Jrc3BhY2VfX3Nob3J0Y3V0LXRpdGxlXCIgbGV2ZWw9ezN9Plx1OEJCRVx1N0Y2RTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIndvcmtzcGFjZV9fc2hvcnRjdXQtZGVzY1wiPlx1NEVFM1x1NzQwNlx1MzAwMVx1OEJDMVx1NEU2Nlx1NEUwRVx1OTAxQVx1NzUyOFx1NTA0Rlx1NTk3RDwvVGV4dD5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDwvUm93PlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9BcHBTaGVsbD5cbiAgKVxufVxuIiwgImltcG9ydCB7IENvbGxlY3Rpb25TY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvY29sbGVjdGlvbi5qc3gnXG5pbXBvcnQgeyBFbnZpcm9ubWVudHNTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvZW52aXJvbm1lbnRzLmpzeCdcbmltcG9ydCB7IEhpc3RvcnlTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvaGlzdG9yeS5qc3gnXG5pbXBvcnQgeyBSZXF1ZXN0RWRpdG9yU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3JlcXVlc3QtZWRpdG9yLmpzeCdcbmltcG9ydCB7IFNldHRpbmdzU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3NldHRpbmdzLmpzeCdcbmltcG9ydCB7IFdvcmtzcGFjZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy93b3Jrc3BhY2UuanN4J1xuXG5jb25zdCBTSEVMTF9MSU5LUyA9IFsnd29ya3NwYWNlJywgJ2NvbGxlY3Rpb24nLCAnZW52aXJvbm1lbnRzJywgJ2hpc3RvcnknLCAnc2V0dGluZ3MnXVxuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ0FQSSBDbGllbnRcdUZGMDhQb3N0bWFuIFx1OThDRVx1NjgzQ1x1RkYwOScsXG4gIHZpZXdwb3J0czoge1xuICAgIGRlc2t0b3A6IHsgd2lkdGg6IDE0NDAsIGhlaWdodDogOTAwIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ2Rlc2t0b3AnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICd3b3Jrc3BhY2UnLFxuICAgICAgdGl0bGU6ICdcdTVERTVcdTRGNUNcdTUzM0EnLFxuICAgICAgZGVzY3JpcHRpb246ICdDb2xsZWN0aW9ucyBcdTRGQTdcdTY4MEZcdTRFMEVcdTY3MDBcdThGRDFcdThCRjdcdTZDNDJcdTUxNjVcdTUzRTMnLFxuICAgICAgY29tcG9uZW50OiBXb3Jrc3BhY2VTY3JlZW4sXG4gICAgICBlbnRyeTogdHJ1ZSxcbiAgICAgIGxpbmtzOiBbLi4uU0hFTExfTElOS1MsICdyZXF1ZXN0LWVkaXRvciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY29sbGVjdGlvbicsXG4gICAgICB0aXRsZTogJ0NvbGxlY3Rpb24nLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTY1ODdcdTRFRjZcdTU5MzlcdTRFMEVcdThCRjdcdTZDNDJcdTY4MTFcdUZGMENcdTYyNTNcdTVGMDBcdThCRjdcdTZDNDJcdTdGMTZcdThGOTFcdTU2NjgnLFxuICAgICAgY29tcG9uZW50OiBDb2xsZWN0aW9uU2NyZWVuLFxuICAgICAgbGlua3M6IFsuLi5TSEVMTF9MSU5LUywgJ3JlcXVlc3QtZWRpdG9yJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdyZXF1ZXN0LWVkaXRvcicsXG4gICAgICB0aXRsZTogJ1x1OEJGN1x1NkM0Mlx1N0YxNlx1OEY5MScsXG4gICAgICBkZXNjcmlwdGlvbjogJ01ldGhvZCAvIFVSTCAvIFBhcmFtcyAvIEhlYWRlcnMgLyBCb2R5IFx1NEUwRSBSZXNwb25zZScsXG4gICAgICBjb21wb25lbnQ6IFJlcXVlc3RFZGl0b3JTY3JlZW4sXG4gICAgICBsaW5rczogU0hFTExfTElOS1MsXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdlbnZpcm9ubWVudHMnLFxuICAgICAgdGl0bGU6ICdcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0YnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTU5MUFcdTczQUZcdTU4ODNcdTUyMDdcdTYzNjJcdTRFMEVcdTUzRDhcdTkxQ0ZcdTg4NjgnLFxuICAgICAgY29tcG9uZW50OiBFbnZpcm9ubWVudHNTY3JlZW4sXG4gICAgICBsaW5rczogU0hFTExfTElOS1MsXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdoaXN0b3J5JyxcbiAgICAgIHRpdGxlOiAnXHU1Mzg2XHU1M0YyXHU4QkIwXHU1RjU1JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU2NzAwXHU4RkQxXHU1M0QxXHU5MDAxXHU4QkIwXHU1RjU1XHVGRjBDXHU1M0VGXHU5MUNEXHU2NUIwXHU2MjUzXHU1RjAwXHU3RjE2XHU4RjkxXHU1NjY4JyxcbiAgICAgIGNvbXBvbmVudDogSGlzdG9yeVNjcmVlbixcbiAgICAgIGxpbmtzOiBbLi4uU0hFTExfTElOS1MsICdyZXF1ZXN0LWVkaXRvciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnc2V0dGluZ3MnLFxuICAgICAgdGl0bGU6ICdcdThCQkVcdTdGNkUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTkwMUFcdTc1MjhcdTMwMDFcdTRFRTNcdTc0MDZcdTRFMEVcdThCQzFcdTRFNjYnLFxuICAgICAgY29tcG9uZW50OiBTZXR0aW5nc1NjcmVlbixcbiAgICAgIGxpbmtzOiBTSEVMTF9MSU5LUyxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgXSxcbn1cbiIsICJpbXBvcnQgeyBCb2FyZCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9Cb2FyZC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBQcm90b3R5cGVQcm92aWRlciB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgdmFsaWRhdGVQcm9qZWN0IH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvdmFsaWRhdGVQcm9qZWN0LmpzJ1xuaW1wb3J0IHsgcHJvamVjdCB9IGZyb20gJy4vcHJvamVjdC5qcydcblxudmFsaWRhdGVQcm9qZWN0KHByb2plY3QpXG5cblJlYWN0RE9NLmNyZWF0ZVJvb3QoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSkucmVuZGVyKFxuICA8RXJyb3JCb3VuZGFyeSBzY29wZT1cImJvYXJkXCI+XG4gICAgPFByb3RvdHlwZVByb3ZpZGVyIHByb2plY3Q9e3Byb2plY3R9PlxuICAgICAgPEJvYXJkIHByb2plY3Q9e3Byb2plY3R9IC8+XG4gICAgPC9Qcm90b3R5cGVQcm92aWRlcj5cbiAgPC9FcnJvckJvdW5kYXJ5PixcbilcbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUFBLE1BQU0sbUJBQW1CLE1BQU0sY0FBYyxJQUFJO0FBRWpELFdBQVMsbUJBQW1CQSxVQUFTO0FBRnJDO0FBR0UsYUFBTyxLQUFBQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxLQUFLLE1BQTdDLG1CQUFnRCxPQUFNQSxTQUFRLFFBQVEsQ0FBQyxFQUFFO0FBQUEsRUFDbEY7QUFFTyxXQUFTLGtCQUFrQixFQUFFLFNBQUFBLFVBQVMsU0FBUyxHQUFHO0FBQ3ZELFVBQU0sa0JBQWtCLG1CQUFtQkEsUUFBTztBQUNsRCxVQUFNLENBQUMsT0FBTyxRQUFRLElBQUksTUFBTSxTQUFTO0FBQUEsTUFDdkMsTUFBTTtBQUFBLE1BQ04sYUFBYUEsU0FBUTtBQUFBLE1BQ3JCLFNBQVM7QUFBQSxNQUNULGlCQUFpQjtBQUFBLE1BQ2pCLFNBQVMsQ0FBQztBQUFBLElBQ1osQ0FBQztBQUVELFVBQU0sV0FBVyxNQUFNLFlBQVksQ0FBQyxP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TUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxHQUFHLGFBQWEsZ0JBQWdCO0FBQUEsUUFDeEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxhQUFhO0FBQUEsUUFDYixXQUFXO0FBQUEsUUFDWCxPQUFPO0FBQUEsUUFDUCxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLEdBQUcsYUFBYSxnQkFBZ0I7QUFBQSxRQUN4QyxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsYUFBYTtBQUFBLFFBQ2IsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLFFBQ1AsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUM1REEsa0JBQWdCLE9BQU87QUFFdkIsV0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ25ELG9DQUFDLGlCQUFjLE9BQU0sV0FDbkIsb0NBQUMscUJBQWtCLFdBQ2pCLG9DQUFDLFNBQU0sU0FBa0IsQ0FDM0IsQ0FDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInByb2plY3QiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiXQp9Cg==
