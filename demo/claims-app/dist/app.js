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

  // demo/claims-app/src/layouts/MobileLayout.jsx
  var tabs = [
    { label: "\u9996\u9875", to: "home" },
    { label: "\u7406\u8D54", to: "claims" },
    { label: "\u6211\u7684", to: "profile" }
  ];
  function MobileLayout({ children }) {
    const screenId = useScreenId();
    return /* @__PURE__ */ React.createElement(MobileShell, { className: "claims-shell claims-layout", tabs, activeId: screenId, "aria-label": "\u7406\u8D54\u5E94\u7528" }, children);
  }

  // demo/claims-app/src/screens/claim-apply.jsx
  function ClaimApplyScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "claim-apply-page", gap: 16, className: "claims-page claim-apply__page" }, /* @__PURE__ */ React.createElement(Heading, { id: "claim-apply-title", className: "claim-apply__title", level: 1 }, "\u7406\u8D54\u7533\u8BF7"), /* @__PURE__ */ React.createElement(
      Steps,
      {
        id: "claim-apply-steps",
        className: "claim-apply__steps",
        current: 0,
        items: [
          { id: "form", label: "\u57FA\u672C\u4FE1\u606F" },
          { id: "materials", label: "\u8D44\u6599\u4E0A\u4F20" },
          { id: "done", label: "\u63D0\u4EA4" }
        ]
      }
    ), /* @__PURE__ */ React.createElement(FormField, { className: "claim-apply__type-field", label: "\u7406\u8D54\u7C7B\u578B", htmlFor: "claim-apply-type" }, /* @__PURE__ */ React.createElement(Select, { id: "claim-apply-type", className: "claim-apply__type-select", defaultValue: "medical" }, /* @__PURE__ */ React.createElement("option", { className: "claim-apply__type-option", value: "medical" }, "\u533B\u7597\u8D39\u7528"), /* @__PURE__ */ React.createElement("option", { className: "claim-apply__type-option", value: "accident" }, "\u610F\u5916\u4F24\u5BB3"))), /* @__PURE__ */ React.createElement(FormField, { className: "claim-apply__date-field", label: "\u53D1\u751F\u65E5\u671F", htmlFor: "claim-apply-date" }, /* @__PURE__ */ React.createElement(TextInput, { id: "claim-apply-date", className: "claim-apply__date-input", placeholder: "YYYY-MM-DD" })), /* @__PURE__ */ React.createElement(FormField, { className: "claim-apply__description-field", label: "\u60C5\u51B5\u8BF4\u660E", htmlFor: "claim-apply-description" }, /* @__PURE__ */ React.createElement(TextArea, { id: "claim-apply-description", className: "claim-apply__description-input", placeholder: "\u7B80\u8981\u8BF4\u660E\u7ECF\u8FC7" })), /* @__PURE__ */ React.createElement(Checkbox, { className: "claim-apply__confirmation", label: "\u6211\u5DF2\u786E\u8BA4\u4FE1\u606F\u771F\u5B9E" }), /* @__PURE__ */ React.createElement(Button, { id: "claim-apply-submit", className: "claim-apply__submit", variant: "primary", to: "claims" }, "\u63D0\u4EA4\u7533\u8BF7")));
  }

  // demo/claims-app/src/screens/claims.jsx
  var claims = [];
  function ClaimsScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "claims-list-page", gap: 20, className: "claims-page claims-list__page" }, /* @__PURE__ */ React.createElement(Heading, { id: "claims-list-title", className: "claims-list__title", level: 1 }, "\u6211\u7684\u7406\u8D54"), claims.length === 0 ? /* @__PURE__ */ React.createElement(
      EmptyState,
      {
        id: "claims-list-empty-state",
        className: "claims-list__empty-state",
        title: "\u6682\u65E0\u7406\u8D54\u8BB0\u5F55",
        description: "\u65B0\u7684\u7533\u8BF7\u4F1A\u663E\u793A\u5728\u8FD9\u91CC\u3002",
        action: /* @__PURE__ */ React.createElement(Button, { id: "claims-list-apply-action", className: "claims-list__apply-action", to: "claim-apply" }, "\u53D1\u8D77\u7406\u8D54")
      }
    ) : /* @__PURE__ */ React.createElement(Column, { className: "claims-list__records", gap: 0 }, claims.map((claim) => /* @__PURE__ */ React.createElement(
      Cell,
      {
        className: "claims-list__record",
        "data-wf-key": claim.id,
        key: claim.id,
        title: claim.title,
        subtitle: claim.status,
        value: claim.date
      }
    )))));
  }

  // demo/claims-app/src/screens/home.jsx
  function HomeScreen() {
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "claims-home-page", gap: 16, className: "claims-page claims-home__page" }, /* @__PURE__ */ React.createElement(Row, { id: "claims-home-header", className: "claims-home__header", alignItems: "center", justifyContent: "space-between" }, /* @__PURE__ */ React.createElement("div", { className: "claims-home__greeting" }, /* @__PURE__ */ React.createElement(Text, { className: "claims-home__eyebrow" }, "\u4E0A\u5348\u597D"), /* @__PURE__ */ React.createElement(Heading, { id: "claims-home-title", className: "claims-home__title", level: 1 }, "\u7406\u8D54\u670D\u52A1")), /* @__PURE__ */ React.createElement("span", { className: "claims-avatar-placeholder claims-home__avatar", "aria-hidden": "true" })), /* @__PURE__ */ React.createElement(Card, { id: "claims-home-apply-card", className: "claims-home__apply-card", to: "claim-apply" }, /* @__PURE__ */ React.createElement(Heading, { className: "claims-home__apply-title", level: 3 }, "\u53D1\u8D77\u7406\u8D54"), /* @__PURE__ */ React.createElement(Text, { className: "claims-home__apply-description" }, "\u51C6\u5907\u6750\u6599\u5E76\u586B\u5199\u7533\u8BF7\u3002")), /* @__PURE__ */ React.createElement(Column, { id: "claims-home-shortcuts", className: "claims-home__shortcuts", gap: 0 }, /* @__PURE__ */ React.createElement(Cell, { className: "claims-home__shortcut claims-home__claims-shortcut", to: "claims", title: "\u6211\u7684\u7406\u8D54", subtitle: "\u67E5\u770B\u5168\u90E8\u7533\u8BF7", value: "0" }), /* @__PURE__ */ React.createElement(Cell, { className: "claims-home__shortcut claims-home__profile-shortcut", to: "profile", title: "\u4E2A\u4EBA\u4FE1\u606F", subtitle: "\u7BA1\u7406\u8054\u7CFB\u65B9\u5F0F" }))));
  }

  // demo/claims-app/src/screens/login.jsx
  function LoginScreen() {
    return /* @__PURE__ */ React.createElement(Column, { id: "claims-login-page", gap: 20, className: "claims-login claims-login__page" }, /* @__PURE__ */ React.createElement("span", { id: "claims-login-logo", className: "claims-logo-placeholder claims-login__logo", "aria-hidden": "true" }), /* @__PURE__ */ React.createElement(Heading, { id: "claims-login-title", className: "claims-login__title", level: 1 }, "\u7406\u8D54\u670D\u52A1"), /* @__PURE__ */ React.createElement(Text, { className: "claims-login__description" }, "\u767B\u5F55\u540E\u67E5\u770B\u548C\u63D0\u4EA4\u7406\u8D54\u7533\u8BF7\u3002"), /* @__PURE__ */ React.createElement(FormField, { className: "claims-login__phone-field", label: "\u624B\u673A\u53F7", htmlFor: "claims-login-phone" }, /* @__PURE__ */ React.createElement(TextInput, { id: "claims-login-phone", className: "claims-login__phone-input", inputMode: "tel", placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7" })), /* @__PURE__ */ React.createElement(FormField, { className: "claims-login__code-field", label: "\u9A8C\u8BC1\u7801", htmlFor: "claims-login-code" }, /* @__PURE__ */ React.createElement(TextInput, { id: "claims-login-code", className: "claims-login__code-input", inputMode: "numeric", placeholder: "\u8BF7\u8F93\u5165\u9A8C\u8BC1\u7801" })), /* @__PURE__ */ React.createElement(Button, { id: "claims-login-submit", className: "claims-login__submit", variant: "primary", to: "home" }, "\u767B\u5F55"));
  }

  // demo/claims-app/src/screens/profile.jsx
  function ProfileScreen() {
    const [notifications, setNotifications] = React.useState(true);
    return /* @__PURE__ */ React.createElement(MobileLayout, null, /* @__PURE__ */ React.createElement(Column, { id: "claims-profile-page", gap: 20, className: "claims-page claims-profile__page" }, /* @__PURE__ */ React.createElement(Heading, { id: "claims-profile-title", className: "claims-profile__title", level: 1 }, "\u6211\u7684"), /* @__PURE__ */ React.createElement(Row, { id: "claims-profile-summary", className: "claims-profile__summary", gap: 12, alignItems: "center" }, /* @__PURE__ */ React.createElement(Avatar, { className: "claims-profile__avatar", size: 56, label: "\u7528\u6237\u5934\u50CF\u5360\u4F4D" }), /* @__PURE__ */ React.createElement("div", { className: "claims-profile__identity" }, /* @__PURE__ */ React.createElement("strong", { className: "claims-profile__name" }, "\u793A\u4F8B\u7528\u6237"), /* @__PURE__ */ React.createElement(Text, { className: "claims-profile__verification" }, "\u5DF2\u5B8C\u6210\u5B9E\u540D\u8BA4\u8BC1"))), /* @__PURE__ */ React.createElement(Cell, { id: "claims-profile-contact", className: "claims-profile__contact", title: "\u8054\u7CFB\u65B9\u5F0F", subtitle: "138 0000 0000" }), /* @__PURE__ */ React.createElement(
      Toggle,
      {
        id: "claims-profile-notifications",
        className: "claims-profile__notifications",
        checked: notifications,
        label: "\u63A5\u6536\u8FDB\u5EA6\u901A\u77E5",
        onChange: setNotifications
      }
    )));
  }

  // demo/claims-app/src/project.js
  var project = {
    name: "\u7406\u8D54\u670D\u52A1\u5E94\u7528",
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
        links: ["home"],
        edgeCases: []
      },
      {
        id: "home",
        title: "\u9996\u9875",
        component: HomeScreen,
        links: ["home", "claims", "claim-apply", "profile"],
        edgeCases: []
      },
      {
        id: "claims",
        title: "\u6211\u7684\u7406\u8D54",
        component: ClaimsScreen,
        links: ["home", "claims", "claim-apply", "profile"],
        edgeCases: []
      },
      {
        id: "claim-apply",
        title: "\u7406\u8D54\u7533\u8BF7",
        component: ClaimApplyScreen,
        links: ["home", "claims", "profile"],
        edgeCases: []
      },
      {
        id: "profile",
        title: "\u4E2A\u4EBA\u4E2D\u5FC3",
        component: ProfileScreen,
        links: ["home", "claims", "profile"],
        edgeCases: []
      }
    ]
  };

  // demo/claims-app/src/app.jsx
  validateProject(project);
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(ErrorBoundary, { scope: "board" }, /* @__PURE__ */ React.createElement(PrototypeProvider, { project }, /* @__PURE__ */ React.createElement(Board, { project })))
  );
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9DYW52YXNNb2RlLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvRGVtb01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBvcnQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld1BhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TWFya2Vycy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld0xhdW5jaGVyLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYmVmb3JlLXVubG9hZC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmxvdy5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbGF5b3V0LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvY29udGVudC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zvcm1zLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbmF2aWdhdGlvbi5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2RhdGEuanN4IiwgIi4uL3NyYy9sYXlvdXRzL01vYmlsZUxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvY2xhaW0tYXBwbHkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2NsYWltcy5qc3giLCAiLi4vc3JjL3NjcmVlbnMvaG9tZS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvbG9naW4uanN4IiwgIi4uL3NyYy9zY3JlZW5zL3Byb2ZpbGUuanN4IiwgIi4uL3NyYy9wcm9qZWN0LmpzIiwgIi4uL3NyYy9hcHAuanN4Il0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBQcm90b3R5cGVDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5mdW5jdGlvbiBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdCkge1xuICByZXR1cm4gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgcHJvamVjdC5zY3JlZW5zWzBdLmlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQcm90b3R5cGVQcm92aWRlcih7IHByb2plY3QsIGNoaWxkcmVuIH0pIHtcbiAgY29uc3QgaW5pdGlhbFNjcmVlbklkID0gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpXG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIG1vZGU6ICdjYW52YXMnLFxuICAgIHZpZXdwb3J0S2V5OiBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCxcbiAgICBlbnRyeUlkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBpbml0aWFsU2NyZWVuSWQsXG4gICAgaGlzdG9yeTogW10sXG4gIH0pXG5cbiAgY29uc3QgbmF2aWdhdGUgPSBSZWFjdC51c2VDYWxsYmFjaygoaWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtpZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZClcbiAgICAgICAgaWYgKCFzY3JlZW4ubGlua3MuaW5jbHVkZXMoaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke2N1cnJlbnQuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHtpZH1cImApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogaWQsXG4gICAgICAgIGhpc3Rvcnk6XG4gICAgICAgICAgY3VycmVudC5tb2RlID09PSAnZGVtbycgJiYgaWQgIT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkXG4gICAgICAgICAgICA/IFsuLi5jdXJyZW50Lmhpc3RvcnksIGN1cnJlbnQuY3VycmVudFNjcmVlbklkXVxuICAgICAgICAgICAgOiBjdXJyZW50Lmhpc3RvcnksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNlbGVjdEVudHJ5ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVudHJ5SWQpID0+IHtcbiAgICBjb25zdCBlbnRyeSA9IHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBlbnRyeUlkLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBnb0JhY2sgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gY3VycmVudFxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50Lmhpc3RvcnlbY3VycmVudC5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgICAgICBoaXN0b3J5OiBjdXJyZW50Lmhpc3Rvcnkuc2xpY2UoMCwgLTEpLFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHJlc2V0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5lbnRyeUlkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtpbml0aWFsU2NyZWVuSWRdKVxuXG4gIGNvbnN0IHNldE1vZGUgPSBSZWFjdC51c2VDYWxsYmFjaygobW9kZSkgPT4ge1xuICAgIGlmIChtb2RlICE9PSAnY2FudmFzJyAmJiBtb2RlICE9PSAnZGVtbycpIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtb2RlIFwiJHttb2RlfVwiYClcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtdKVxuXG4gIC8qKiBcdTc1M0JcdTY3N0ZcdTUzQ0NcdTUxRkJcdTY3RDBcdTk4NzVcdUZGMUFcdThGREJcdTUxNjVcdTZGMTRcdTc5M0FcdTVFNzZcdTg0M0RcdTU3MjhcdThCRTVcdTk4NzUgKi9cbiAgY29uc3QgZW50ZXJEZW1vID0gUmVhY3QudXNlQ2FsbGJhY2soKHNjcmVlbklkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHNjcmVlbklkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7c2NyZWVuSWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBtb2RlOiAnZGVtbycsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IHNjcmVlbklkLFxuICAgICAgaGlzdG9yeTogW10sXG4gICAgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZXRWaWV3cG9ydEtleSA9IFJlYWN0LnVzZUNhbGxiYWNrKCh2aWV3cG9ydEtleSkgPT4ge1xuICAgIGlmICghT2JqZWN0Lmhhc093bihwcm9qZWN0LnZpZXdwb3J0cywgdmlld3BvcnRLZXkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdmlld3BvcnQgXCIke3ZpZXdwb3J0S2V5fVwiYClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7IC4uLmN1cnJlbnQsIHZpZXdwb3J0S2V5IH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgdmFsdWUgPSBSZWFjdC51c2VNZW1vKCgpID0+ICh7XG4gICAgbW9kZTogc3RhdGUubW9kZSxcbiAgICB2aWV3cG9ydEtleTogc3RhdGUudmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQ6IHByb2plY3Qudmlld3BvcnRzW3N0YXRlLnZpZXdwb3J0S2V5XSxcbiAgICBlbnRyeUlkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuY3VycmVudFNjcmVlbklkLFxuICAgIG5hdmlnYXRlLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBzZXRNb2RlLFxuICAgIGVudGVyRGVtbyxcbiAgICBzZXRWaWV3cG9ydEtleSxcbiAgICBjYW5Hb0JhY2s6IHN0YXRlLmhpc3RvcnkubGVuZ3RoID4gMCxcbiAgfSksIFtlbnRlckRlbW8sIGdvQmFjaywgbmF2aWdhdGUsIHByb2plY3QsIHJlc2V0LCBzZWxlY3RFbnRyeSwgc2V0TW9kZSwgc2V0Vmlld3BvcnRLZXksIHN0YXRlXSlcblxuICByZXR1cm4gPFByb3RvdHlwZUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3ZhbHVlfT57Y2hpbGRyZW59PC9Qcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlUHJvdG90eXBlKCkge1xuICBjb25zdCBjb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChQcm90b3R5cGVDb250ZXh0KVxuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcigndXNlUHJvdG90eXBlIG11c3QgYmUgdXNlZCBpbnNpZGUgUHJvdG90eXBlUHJvdmlkZXInKVxuICByZXR1cm4gY29udGV4dFxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjbGFtcFNjYWxlKHNjYWxlKSB7XG4gIHJldHVybiBNYXRoLm1pbigyLCBNYXRoLm1heCgwLjIsIHNjYWxlKSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTZBMjFcdTVGMEZcdUZGMUFcdTYzMDlcdTVCQjlcdTU2NjhcdTUxODVcdTVCQjlcdTUzM0FcdTYyOEFcdTY1NzRcdTk4NzVcdTdGMjlcdTY1M0VcdTUyMzBcdTVCOENcdTY1NzRcdTUzRUZcdTg5QzFcdTMwMDJcbiAqIGNvbnRhaW5lciogXHU0RTNBXHU1M0JCXHU2Mzg5IHBhZGRpbmcgXHU1NDBFXHU3Njg0XHU1M0VGXHU3NTI4XHU1QzNBXHU1QkY4XHVGRjFCY29udGVudCogXHU0RTNBXHU2NzJBXHU3RjI5XHU2NTNFXHU3Njg0IHN0YWdlIFx1NUJCRFx1OUFEOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZml0RGVtb1NjYWxlKGNvbnRhaW5lcldpZHRoLCBjb250YWluZXJIZWlnaHQsIGNvbnRlbnRXaWR0aCwgY29udGVudEhlaWdodCkge1xuICBpZiAoY29udGFpbmVyV2lkdGggPD0gMCB8fCBjb250YWluZXJIZWlnaHQgPD0gMCB8fCBjb250ZW50V2lkdGggPD0gMCB8fCBjb250ZW50SGVpZ2h0IDw9IDApIHtcbiAgICByZXR1cm4gMVxuICB9XG4gIHJldHVybiBjbGFtcFNjYWxlKE1hdGgubWluKGNvbnRhaW5lcldpZHRoIC8gY29udGVudFdpZHRoLCBjb250YWluZXJIZWlnaHQgLyBjb250ZW50SGVpZ2h0KSlcbn1cblxuLyoqXG4gKiBcdTZGMTRcdTc5M0FcdTg5QzZcdTUzRTNcdTUzQ0NcdTUxRkJcdTc2RUVcdTY4MDdcdTY2MkZcdTU0MjZcdTRFM0FcdTVDNEZcdTU5MTZcdTdBN0FcdTc2N0RcdTMwMDJcbiAqIFx1NzBCOVx1NTcyOCAud2Ytc2NyZWVuLWNocm9tZVx1RkYwOFx1NjgwN1x1OTg5OFx1NjgwRiAvIFx1NTE4NVx1NUJCOVx1RkYwOVx1NTE4NVx1NEUwRFx1N0I5N1x1N0E3QVx1NzY3RFx1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1OTAwMFx1NTFGQVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiB0cnVlXG4gIHJldHVybiAhdGFyZ2V0LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY2hyb21lJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0Q2FudmFzVmlld3BvcnQoKSB7XG4gIHJldHVybiB7IHNjYWxlOiAxLCBwYW5YOiAwLCBwYW5ZOiAwIH1cbn1cblxuY29uc3QgRk9DVVNfUEFERElORyA9IDQwXG5cbi8qKlxuICogXHU3NTNCXHU2NzdGIGZvY3VzXHVGRjFBXHU2MjhBXHU2NTc0XHU1NzU3IHNjcmVlblx1RkYwOFx1NTQyQiBtZXRhXHVGRjA5XHU3OUZCXHU1MjMwXHU1QkI5XHU1NjY4XHU0RTJEXHU1RkMzXHUzMDAyXG4gKiBcdTRFQzVcdTVGNTNcdTVGNTNcdTUyNEQgc2NhbGUgXHU2NTNFXHU0RTBEXHU0RTBCXHU2NUY2XHU3RjI5XHU1QzBGXHVGRjFCXHU0RTBEXHU2NTNFXHU1OTI3XHUzMDAyXHU1QzNBXHU1QkY4XHU5NzVFXHU2Q0Q1XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvY3VzQ2FudmFzU2NyZWVuKHtcbiAgY29udGFpbmVyV2lkdGgsXG4gIGNvbnRhaW5lckhlaWdodCxcbiAgc2NyZWVuTGVmdCxcbiAgc2NyZWVuVG9wLFxuICBzY3JlZW5XaWR0aCxcbiAgc2NyZWVuSGVpZ2h0LFxuICBjdXJyZW50U2NhbGUsXG4gIHBhZGRpbmcgPSBGT0NVU19QQURESU5HLFxufSkge1xuICBpZiAoXG4gICAgY29udGFpbmVyV2lkdGggPD0gMFxuICAgIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwXG4gICAgfHwgc2NyZWVuV2lkdGggPD0gMFxuICAgIHx8IHNjcmVlbkhlaWdodCA8PSAwXG4gICAgfHwgIU51bWJlci5pc0Zpbml0ZShjdXJyZW50U2NhbGUpXG4gICkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBhdmFpbFdpZHRoID0gY29udGFpbmVyV2lkdGggLSBwYWRkaW5nICogMlxuICBjb25zdCBhdmFpbEhlaWdodCA9IGNvbnRhaW5lckhlaWdodCAtIHBhZGRpbmcgKiAyXG4gIGlmIChhdmFpbFdpZHRoIDw9IDAgfHwgYXZhaWxIZWlnaHQgPD0gMCkgcmV0dXJuIG51bGxcblxuICBjb25zdCBmaXRTY2FsZSA9IE1hdGgubWluKGF2YWlsV2lkdGggLyBzY3JlZW5XaWR0aCwgYXZhaWxIZWlnaHQgLyBzY3JlZW5IZWlnaHQpXG4gIGNvbnN0IHNjYWxlID0gY2xhbXBTY2FsZShNYXRoLm1pbihjdXJyZW50U2NhbGUsIGZpdFNjYWxlKSlcbiAgcmV0dXJuIHtcbiAgICBzY2FsZSxcbiAgICBwYW5YOiBjb250YWluZXJXaWR0aCAvIDIgLSAoc2NyZWVuTGVmdCArIHNjcmVlbldpZHRoIC8gMikgKiBzY2FsZSxcbiAgICBwYW5ZOiBjb250YWluZXJIZWlnaHQgLyAyIC0gKHNjcmVlblRvcCArIHNjcmVlbkhlaWdodCAvIDIpICogc2NhbGUsXG4gIH1cbn1cblxuLyoqXG4gKiBcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdUZGMUFcdTUzRUFcdTc1MjhcdThDMDNcdTc1MjhcdTY1QjlcdTYzRDBcdTUyNERcdTYyMkFcdTgzQjdcdTc2ODQgc25hcHNob3RcdUZGMENcdTc5ODFcdTZCNjJcdTU3Mjggc2V0U3RhdGUgdXBkYXRlciBcdTkxQ0NcdThCRkIgZHJhZyByZWZcdTMwMDJcbiAqIFJlYWN0IDE4IFx1NEYxQVx1NTcyOCBlbmRQYW4gXHU2RTA1XHU3QTdBIHJlZiBcdTU0MEVcdTkxQ0RcdTY1M0UgdXBkYXRlclx1RkYxQlx1OEJGQiBudWxsLnBhblggXHU1MzczIEJvYXJkIFx1NjJBNVx1OTUxOVx1NjgzOVx1NTZFMFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFuRnJvbURyYWdTbmFwc2hvdCh2aWV3LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkge1xuICBpZiAoIXNuYXBzaG90KSByZXR1cm4gdmlld1xuICByZXR1cm4ge1xuICAgIC4uLnZpZXcsXG4gICAgcGFuWDogc25hcHNob3QucGFuWCArIGNsaWVudFggLSBzbmFwc2hvdC54LFxuICAgIHBhblk6IHNuYXBzaG90LnBhblkgKyBjbGllbnRZIC0gc25hcHNob3QueSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTY3JvbGxhYmxlT3ZlcmZsb3codmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSAnYXV0bycgfHwgdmFsdWUgPT09ICdzY3JvbGwnIHx8IHZhbHVlID09PSAnb3ZlcmxheSdcbn1cblxuLyoqIFx1NTcyOCByb290IFx1NTE4NVx1NTQxMVx1NEUwQVx1NjI3RVx1NTNFRlx1NkVEQVx1NTJBOFx1Nzk1Nlx1NTE0OFx1RkYwOFx1NTQyQiByb290IFx1ODFFQVx1OEVBQlx1RkYwQ1x1NTk4Mlx1NUM0Rlx1NTE4NVx1NTE4NVx1NUJCOVx1NTMzQVx1RkYwOSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlQW5jZXN0b3Ioc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGxldCBub2RlID0gc3RhcnRFbCAmJiBzdGFydEVsLm5vZGVUeXBlID09PSAzID8gc3RhcnRFbC5wYXJlbnRFbGVtZW50IDogc3RhcnRFbFxuICB3aGlsZSAobm9kZSkge1xuICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG5vZGUpXG4gICAgICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBub2RlLnNjcm9sbEhlaWdodCA+IG5vZGUuY2xpZW50SGVpZ2h0ICsgMVxuICAgICAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgbm9kZS5zY3JvbGxXaWR0aCA+IG5vZGUuY2xpZW50V2lkdGggKyAxXG4gICAgICBpZiAoY2FuWSB8fCBjYW5YKSByZXR1cm4gbm9kZVxuICAgIH1cbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5jb25zdCBDT05URU5UX0RSQUdfVEhSRVNIT0xEID0gM1xuXG5mdW5jdGlvbiBpc0VkaXRhYmxlVGFyZ2V0KHRhcmdldCkge1xuICBpZiAoIXRhcmdldCB8fCB0eXBlb2YgdGFyZ2V0LmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBmYWxzZVxuICByZXR1cm4gISF0YXJnZXQuY2xvc2VzdCgnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIFtjb250ZW50ZWRpdGFibGU9XCJ0cnVlXCJdJylcbn1cblxuLyoqXG4gKiBcdTU3MjhcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUxODVcdTYzMDlcdTRGNEZcdTYyRDZcdTYyRkQgXHUyMTkyIFx1NkVEQVx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHVGRjA4XHU1M0VGXHU0RUE0XHU0RTkyXHU1MTczXHU5NUVEIC8gXHU3QTdBXHU2ODNDXHVGRjA5XHU2NUY2XHU4RkQ0XHU1NkRFIG51bGxcdUZGMENcdTRFQTRcdTdFRDlcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcdTMwMDJcbiAqIFx1OEZENFx1NTZERSBudWxsIFx1ODg2OFx1NzkzQVx1NEUwRFx1NUU5NFx1NjNBNVx1N0JBMVx1OEJFNVx1NkIyMSBwb2ludGVyZG93blx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgcm9vdEVsLCB7IGxvY2tlZCA9IGZhbHNlLCBzY2FsZSA9IDEgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiBudWxsXG4gIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVybiBudWxsXG4gIGlmICghcm9vdEVsIHx8ICFyb290RWwuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgaWYgKGlzRWRpdGFibGVUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuIG51bGxcbiAgY29uc3Qgc2Nyb2xsYWJsZSA9IGZpbmRTY3JvbGxhYmxlQW5jZXN0b3IoZXZlbnQudGFyZ2V0LCByb290RWwpXG4gIGlmICghc2Nyb2xsYWJsZSkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHtcbiAgICBlbDogc2Nyb2xsYWJsZSxcbiAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgIHNjcm9sbExlZnQ6IHNjcm9sbGFibGUuc2Nyb2xsTGVmdCxcbiAgICBzY3JvbGxUb3A6IHNjcm9sbGFibGUuc2Nyb2xsVG9wLFxuICAgIHNjYWxlOiBzY2FsZSA+IDAgPyBzY2FsZSA6IDEsXG4gICAgbW92ZWQ6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KSB7XG4gIGlmICghc3RhdGUgfHwgc3RhdGUucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVybiBzdGF0ZVxuICBjb25zdCBkeCA9IChldmVudC5jbGllbnRYIC0gc3RhdGUuc3RhcnRYKSAvIHN0YXRlLnNjYWxlXG4gIGNvbnN0IGR5ID0gKGV2ZW50LmNsaWVudFkgLSBzdGF0ZS5zdGFydFkpIC8gc3RhdGUuc2NhbGVcbiAgaWYgKCFzdGF0ZS5tb3ZlZCAmJiAoTWF0aC5hYnMoZHgpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCB8fCBNYXRoLmFicyhkeSkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEKSkge1xuICAgIHN0YXRlLm1vdmVkID0gdHJ1ZVxuICB9XG4gIHN0YXRlLmVsLnNjcm9sbExlZnQgPSBzdGF0ZS5zY3JvbGxMZWZ0IC0gZHhcbiAgc3RhdGUuZWwuc2Nyb2xsVG9wID0gc3RhdGUuc2Nyb2xsVG9wIC0gZHlcbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8qKiBcdTYyRDZcdTYyRkRcdThEODVcdThGQzdcdTk2MDhcdTUwM0NcdTU0MEVcdTU0MUVcdTYzODlcdTk2OEZcdTU0MEVcdTc2ODQgY2xpY2tcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTg5RTZcdThERjNcdThGNkMgKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgcm9vdEVsKSB7XG4gIGlmICghc3RhdGUgfHwgIXN0YXRlLm1vdmVkIHx8ICFyb290RWwpIHJldHVyblxuICBjb25zdCBwcmV2ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByb290RWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG4gIH1cbiAgcm9vdEVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxufVxuXG4vKiogXHU4QkU1XHU2NUI5XHU1NDExXHU2NjJGXHU1NDI2XHU4RkQ4XHU4MEZEXHU3RUU3XHU3RUVEXHU2RURBICovXG5leHBvcnQgZnVuY3Rpb24gY2FuU2Nyb2xsSW5EaXJlY3Rpb24oZWwsIGRlbHRhWCwgZGVsdGFZKSB7XG4gIGNvbnN0IGVwcyA9IDFcbiAgaWYgKGRlbHRhWSkge1xuICAgIGNvbnN0IG1heFkgPSBlbC5zY3JvbGxIZWlnaHQgLSBlbC5jbGllbnRIZWlnaHRcbiAgICBpZiAobWF4WSA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWSA8IDAgJiYgZWwuc2Nyb2xsVG9wID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWSA+IDAgJiYgZWwuc2Nyb2xsVG9wIDwgbWF4WSAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgaWYgKGRlbHRhWCkge1xuICAgIGNvbnN0IG1heFggPSBlbC5zY3JvbGxXaWR0aCAtIGVsLmNsaWVudFdpZHRoXG4gICAgaWYgKG1heFggPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVggPCAwICYmIGVsLnNjcm9sbExlZnQgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFYID4gMCAmJiBlbC5zY3JvbGxMZWZ0IDwgbWF4WCAtIGVwcykgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUZCXHU2MTBGXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU0RUM1IEN0cmwvTWV0YSArIFx1NkVEQVx1OEY2RVxuICpcdUZGMDhcdTg5RTZcdTYzQTdcdTY3N0YgcGluY2ggXHU1NzI4XHU2RDRGXHU4OUM4XHU1NjY4XHU5MUNDXHU5MDFBXHU1RTM4XHU1RTI2IGN0cmxLZXlcdUZGMDlcdTMwMDJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTY2NkVcdTkwMUFcdTZFREFcdThGNkVcdTc1NTlcdTdFRDlcdTVDNEZcdTUxODVcdTZFREFcdTUyQThcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gISEoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5mZXJFbnRyeUlkKHNjcmVlbnMpIHtcbiAgcmV0dXJuIHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVEZW1vU3RhdGUoc2NyZWVucykge1xuICBjb25zdCBlbnRyeUlkID0gaW5mZXJFbnRyeUlkKHNjcmVlbnMpXG4gIGlmICghZW50cnlJZCkgdGhyb3cgbmV3IEVycm9yKCdEZW1vIG1vZGUgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGVudHJ5IHNjcmVlbicpXG4gIHJldHVybiB7XG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbmF2aWdhdGVEZW1vKHN0YXRlLCB0YXJnZXRJZCwgc2NyZWVucykge1xuICBpZiAoIXNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3RhcmdldElkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgfVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKVxuICBpZiAoIWN1cnJlbnRTY3JlZW4ubGlua3MuaW5jbHVkZXModGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBTY3JlZW4gXCIke3N0YXRlLmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7dGFyZ2V0SWR9XCJgKVxuICB9XG4gIGlmICh0YXJnZXRJZCA9PT0gc3RhdGUuY3VycmVudFNjcmVlbklkKSByZXR1cm4gc3RhdGVcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHRhcmdldElkLFxuICAgIGhpc3Rvcnk6IFsuLi5zdGF0ZS5oaXN0b3J5LCBzdGF0ZS5jdXJyZW50U2NyZWVuSWRdLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3REZW1vRW50cnkoc3RhdGUsIGVudHJ5SWQsIHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnkgPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICBpZiAoIWVudHJ5KSB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtlbnRyeUlkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnb0JhY2tEZW1vKHN0YXRlKSB7XG4gIGlmIChzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGhpc3RvcnkgPSBzdGF0ZS5oaXN0b3J5LnNsaWNlKDAsIC0xKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuaGlzdG9yeVtzdGF0ZS5oaXN0b3J5Lmxlbmd0aCAtIDFdLFxuICAgIGhpc3RvcnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RGVtbyhzdGF0ZSkge1xuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogc3RhdGUuZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG4iLCAiZXhwb3J0IGNsYXNzIEVycm9yQm91bmRhcnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIHRoaXMuc3RhdGUgPSB7IGVycm9yOiBudWxsIH1cbiAgfVxuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoZXJyb3IpIHtcbiAgICByZXR1cm4geyBlcnJvciB9XG4gIH1cblxuICBjb21wb25lbnREaWRDYXRjaChlcnJvciwgaW5mbykge1xuICAgIGNvbnNvbGUuZXJyb3IoYFt3aXJlZnJhbWU6JHt0aGlzLnByb3BzLnNjb3BlIHx8ICd1bmtub3duJ31dYCwgZXJyb3IsIGluZm8pXG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUocHJldmlvdXNQcm9wcykge1xuICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICYmIHByZXZpb3VzUHJvcHMucmVzZXRLZXkgIT09IHRoaXMucHJvcHMucmVzZXRLZXkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogbnVsbCB9KVxuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuZXJyb3IpIHJldHVybiB0aGlzLnByb3BzLmNoaWxkcmVuXG4gICAgY29uc3QgeyBzY3JlZW5JZCwgc291cmNlLCBzY29wZSB9ID0gdGhpcy5wcm9wc1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWVycm9yLWNhcmRcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgPHN0cm9uZz57c2NvcGUgPT09ICdzY3JlZW4nID8gYFNjcmVlbjogJHtzY3JlZW5JZH1gIDogJ0JvYXJkIGVycm9yJ308L3N0cm9uZz5cbiAgICAgICAge3NvdXJjZSA/IDxzcGFuPlNvdXJjZToge3NvdXJjZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgPHNwYW4+TWVzc2FnZToge3RoaXMuc3RhdGUuZXJyb3IubWVzc2FnZX08L3NwYW4+XG4gICAgICAgIDxwcmU+e3RoaXMuc3RhdGUuZXJyb3Iuc3RhY2t9PC9wcmU+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn1cbiIsICJjb25zdCBTY3JlZW5JZGVudGl0eUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5JZGVudGl0eVByb3ZpZGVyKHsgc2NyZWVuSWQsIGNoaWxkcmVuIH0pIHtcbiAgaWYgKCFzY3JlZW5JZCkgdGhyb3cgbmV3IEVycm9yKCdTY3JlZW5JZGVudGl0eVByb3ZpZGVyIHJlcXVpcmVzIHNjcmVlbklkJylcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtzY3JlZW5JZH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9TY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXI+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVNjcmVlbklkKCkge1xuICBjb25zdCBzY3JlZW5JZCA9IFJlYWN0LnVzZUNvbnRleHQoU2NyZWVuSWRlbnRpdHlDb250ZXh0KVxuICBpZiAoIXNjcmVlbklkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd1c2VTY3JlZW5JZCBtdXN0IGJlIHVzZWQgaW5zaWRlIGEgcmVuZGVyZWQgc2NyZWVuJylcbiAgfVxuICByZXR1cm4gc2NyZWVuSWRcbn1cbiIsICIvKipcbiAqIFx1NzBFRFx1NTMzQVx1NEUwRVx1OERGM1x1OEY2Q1x1NzY4NFx1NTUyRlx1NEUwMFx1NTk1MVx1N0VBNlx1RkYxQVx1NTE0M1x1N0QyMFx1NUUyNiBkYXRhLWZsb3ctdG8gXHU1MzczXHU1M0VGXHU1QkZDXHU4MjJBXHUzMDAyXG4gKiBTY3JlZW5GcmFtZSBcdTU5RDRcdTYyNThcdTcwQjlcdTUxRkJcdTUxNUNcdTVFOTVcdUZGMENcdTkwN0ZcdTUxNERcdTRFMUFcdTUyQTFcdTUxOTlcdTYyMTBcdTg4Rjggc3Bhbi9kaXYgXHU1M0VBXHU2NzA5XHU1QzVFXHU2MDI3XHUzMDAxXHU2Q0ExXHU2NzA5IG9uQ2xpY2tcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbmRGbG93VGFyZ2V0SWQoc3RhcnRFbCwgcm9vdEVsKSB7XG4gIGlmICghc3RhcnRFbCB8fCB0eXBlb2Ygc3RhcnRFbC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbFxuICBjb25zdCBlbCA9IHN0YXJ0RWwuY2xvc2VzdCgnW2RhdGEtZmxvdy10b10nKVxuICBpZiAoIWVsKSByZXR1cm4gbnVsbFxuICBpZiAocm9vdEVsICYmIHR5cGVvZiByb290RWwuY29udGFpbnMgPT09ICdmdW5jdGlvbicgJiYgIXJvb3RFbC5jb250YWlucyhlbCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHRvID0gZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWZsb3ctdG8nKVxuICByZXR1cm4gdG8gfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCByb290RWwsIG5hdmlnYXRlKSB7XG4gIGNvbnN0IHRvID0gZmluZEZsb3dUYXJnZXRJZChldmVudD8udGFyZ2V0LCByb290RWwpXG4gIGlmICghdG8pIHJldHVybiBmYWxzZVxuICBldmVudC5wcmV2ZW50RGVmYXVsdD8uKClcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICBuYXZpZ2F0ZSh0bylcbiAgcmV0dXJuIHRydWVcbn1cbiIsICJjb25zdCBUWVBFX0xBQkVMUyA9IHtcbiAgY29tbWVudDogJ1x1NEZFRVx1NjUzOVx1NUVGQVx1OEJBRScsXG4gIHRleHQ6ICdcdTRGRUVcdTY1MzlcdTY1ODdcdTVCNTcnLFxuICBvcmRlcjogJ1x1OEMwM1x1NjU3NFx1OTg3QVx1NUU4RicsXG4gIHJlbW92ZTogJ1x1NTIyMFx1OTY2NFx1ODI4Mlx1NzBCOScsXG59XG5cbmZ1bmN0aW9uIGVzY2FwZVNlbGVjdG9yVG9rZW4odmFsdWUpIHtcbiAgaWYgKGdsb2JhbFRoaXMuQ1NTPy5lc2NhcGUpIHJldHVybiBnbG9iYWxUaGlzLkNTUy5lc2NhcGUoU3RyaW5nKHZhbHVlKSlcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvW15hLXpBLVowLTlfLV0vZywgKGNoYXIpID0+IGBcXFxcJHtjaGFyfWApXG59XG5cbmZ1bmN0aW9uIGVzY2FwZUF0dHJpYnV0ZVZhbHVlKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpXG59XG5cbmZ1bmN0aW9uIGNsYXNzZXNPZihlbGVtZW50KSB7XG4gIGlmICghZWxlbWVudD8uY2xhc3NMaXN0KSByZXR1cm4gW11cbiAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jbGFzc0xpc3QpLmZpbHRlcihCb29sZWFuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNCdXNpbmVzc0NsYXNzTmFtZShuYW1lKSB7XG4gIHJldHVybiAhIW5hbWUgJiYgIW5hbWUuc3RhcnRzV2l0aCgnd2YtJykgJiYgIW5hbWUuc3RhcnRzV2l0aCgnaXMtJylcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JTY29wZShzY3JlZW5JZCkge1xuICByZXR1cm4gYFtkYXRhLXNjcmVlbi1pZD1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoc2NyZWVuSWQpfVwiXWBcbn1cblxuZnVuY3Rpb24gc2VsZWN0b3JJc1VuaXF1ZShzY3JlZW5Sb290LCBzZWxlY3Rvcikge1xuICB0cnkge1xuICAgIHJldHVybiBzY3JlZW5Sb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLmxlbmd0aCA9PT0gMVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBlbGVtZW50U2VnbWVudChlbGVtZW50KSB7XG4gIGNvbnN0IHRhZyA9IChlbGVtZW50LnRhZ05hbWUgfHwgJ2RpdicpLnRvTG93ZXJDYXNlKClcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXMuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG4gIGNvbnN0IHVzYWJsZSA9IGJ1c2luZXNzLmxlbmd0aCA+IDAgPyBidXNpbmVzcyA6IGNsYXNzZXMuZmlsdGVyKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgY29uc3QgY2xhc3NQYXJ0ID0gdXNhYmxlLnNsaWNlKDAsIDIpLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJylcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgcmV0dXJuIGAke3RhZ30ke2NsYXNzUGFydH0ke2tleVBhcnR9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuSWQpIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuSWQpIHJldHVybiAnJ1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGVsZW1lbnQuaWQpfWBcblxuICBjb25zdCBzY29wZSA9IHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlc09mKGVsZW1lbnQpLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuXG4gIGZvciAoY29uc3QgbmFtZSBvZiBidXNpbmVzcykge1xuICAgIGNvbnN0IGxvY2FsID0gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9JHtrZXlQYXJ0fWBcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgaWYgKGJ1c2luZXNzLmxlbmd0aCA+IDEpIHtcbiAgICBjb25zdCBsb2NhbCA9IGJ1c2luZXNzLm1hcCgobmFtZSkgPT4gYC4ke2VzY2FwZVNlbGVjdG9yVG9rZW4obmFtZSl9YCkuam9pbignJykgKyBrZXlQYXJ0XG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGNvbnN0IHNlZ21lbnRzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQpIHtcbiAgICAgIHNlZ21lbnRzLnVuc2hpZnQoYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oY3VycmVudC5pZCl9YClcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIGxldCBzZWdtZW50ID0gZWxlbWVudFNlZ21lbnQoY3VycmVudClcbiAgICBjb25zdCBwYXJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgICBpZiAocGFyZW50ICYmIHBhcmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICAgIGNvbnN0IHBlZXJzID0gQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4gfHwgW10pLmZpbHRlcihcbiAgICAgICAgKGl0ZW0pID0+IGl0ZW0udGFnTmFtZSA9PT0gY3VycmVudC50YWdOYW1lICYmIGVsZW1lbnRTZWdtZW50KGl0ZW0pID09PSBzZWdtZW50LFxuICAgICAgKVxuICAgICAgaWYgKHBlZXJzLmxlbmd0aCA+IDEpIHNlZ21lbnQgKz0gYDpudGgtb2YtdHlwZSgke3BlZXJzLmluZGV4T2YoY3VycmVudCkgKyAxfSlgXG4gICAgfVxuICAgIHNlZ21lbnRzLnVuc2hpZnQoc2VnbWVudClcbiAgICBjb25zdCBsb2NhbCA9IHNlZ21lbnRzLmpvaW4oJyA+ICcpXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgICBjdXJyZW50ID0gcGFyZW50XG4gIH1cblxuICByZXR1cm4gYCR7c2NvcGV9ICR7c2VnbWVudHMuam9pbignID4gJykgfHwgZWxlbWVudFNlZ21lbnQoZWxlbWVudCl9YFxufVxuXG5mdW5jdGlvbiBkaXNwbGF5TGFiZWwoZWxlbWVudCkge1xuICBpZiAoZWxlbWVudC5pZCkgcmV0dXJuIGAjJHtlbGVtZW50LmlkfWBcbiAgY29uc3QgY2xhc3NlcyA9IGNsYXNzZXNPZihlbGVtZW50KVxuICBjb25zdCBzZW1hbnRpYyA9IGNsYXNzZXMuZmluZChpc0J1c2luZXNzQ2xhc3NOYW1lKSB8fCBjbGFzc2VzLmZpbmQoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICByZXR1cm4gc2VtYW50aWMgPyBgLiR7c2VtYW50aWN9YCA6IChlbGVtZW50LnRhZ05hbWUgfHwgJ25vZGUnKS50b0xvd2VyQ2FzZSgpXG59XG5cbmZ1bmN0aW9uIHJlYWRUZXh0KGVsZW1lbnQpIHtcbiAgY29uc3QgdmFsdWUgPSAndmFsdWUnIGluIGVsZW1lbnQgJiYgdHlwZW9mIGVsZW1lbnQudmFsdWUgPT09ICdzdHJpbmcnXG4gICAgPyBlbGVtZW50LnZhbHVlXG4gICAgOiBlbGVtZW50LnRleHRDb250ZW50IHx8ICcnXG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZS5yZXBsYWNlKC9cXHMrL2csICcgJykudHJpbSgpXG4gIHJldHVybiBub3JtYWxpemVkLmxlbmd0aCA+IDI0MCA/IGAke25vcm1hbGl6ZWQuc2xpY2UoMCwgMjM3KX0uLi5gIDogbm9ybWFsaXplZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmluZFJldmlld1RhcmdldCh0YXJnZXQsIGNvbnRlbnRSb290KSB7XG4gIGxldCBjdXJyZW50ID0gdGFyZ2V0Py5ub2RlVHlwZSA9PT0gMSA/IHRhcmdldCA6IHRhcmdldD8ucGFyZW50RWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkIHx8IGNsYXNzZXNPZihjdXJyZW50KS5sZW5ndGggPiAwKSByZXR1cm4gY3VycmVudFxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4pIHtcbiAgaWYgKCFlbGVtZW50IHx8ICFjb250ZW50Um9vdCB8fCAhc2NyZWVuKSByZXR1cm4gbnVsbFxuICBjb25zdCBhbmNlc3RvcnMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBhbmNlc3RvcnMudW5zaGlmdCh7XG4gICAgICBlbGVtZW50OiBjdXJyZW50LFxuICAgICAgbGFiZWw6IGRpc3BsYXlMYWJlbChjdXJyZW50KSxcbiAgICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGN1cnJlbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIH0pXG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBlbGVtZW50LFxuICAgIGNvbnRlbnRSb290LFxuICAgIHNjcmVlbklkOiBzY3JlZW4uaWQsXG4gICAgc2NyZWVuVGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICBzb3VyY2VIaW50OiBgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGAsXG4gICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgdGFnTmFtZTogKGVsZW1lbnQudGFnTmFtZSB8fCAnJykudG9Mb3dlckNhc2UoKSxcbiAgICBjbGFzc05hbWVzOiBjbGFzc2VzT2YoZWxlbWVudCksXG4gICAgY3VycmVudFRleHQ6IHJlYWRUZXh0KGVsZW1lbnQpLFxuICAgIGFuY2VzdG9ycyxcbiAgfVxufVxuXG5mdW5jdGlvbiBpdGVtUmVxdWVzdChpdGVtKSB7XG4gIGlmIChpdGVtLnR5cGUgPT09ICd0ZXh0JykgcmV0dXJuIGBcdTRGRUVcdTY1MzlcdTRFM0FcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAnb3JkZXInKSByZXR1cm4gYFx1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdyZW1vdmUnKSByZXR1cm4gYFx1NTIyMFx1OTY2NFx1ODk4MVx1NkM0Mlx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31gXG4gIHJldHVybiBpdGVtLmluc3RydWN0aW9uXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXZpZXdUYXJnZXRzKGl0ZW0pIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbT8udGFyZ2V0cykgJiYgaXRlbS50YXJnZXRzLmxlbmd0aCA+IDApIHJldHVybiBpdGVtLnRhcmdldHNcbiAgaWYgKCFpdGVtPy5zZWxlY3RvcikgcmV0dXJuIFtdXG4gIHJldHVybiBbe1xuICAgIHNjcmVlbklkOiBpdGVtLnNjcmVlbklkLFxuICAgIHNjcmVlblRpdGxlOiBpdGVtLnNjcmVlblRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGl0ZW0uc291cmNlSGludCxcbiAgICBzZWxlY3RvcjogaXRlbS5zZWxlY3RvcixcbiAgICBjdXJyZW50VGV4dDogaXRlbS5jdXJyZW50VGV4dCxcbiAgfV1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSB7XG4gIGNvbnN0IHByb2plY3ROYW1lID0gcHJvamVjdD8ubmFtZSB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCJ1xuXG4gIGNvbnN0IGxpbmVzID0gW1xuICAgIGBcdThCRjdcdTRGRUVcdTY1MzlcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEJcdTMwMEMke3Byb2plY3ROYW1lfVx1MzAwRFx1MzAwMmAsXG4gICAgJycsXG4gICAgJ1x1NEZFRVx1NjUzOVx1N0VBNlx1Njc1Rlx1RkYxQScsXG4gICAgJy0gXHU1M0VBXHU0RkVFXHU2NTM5XHU0RTFBXHU1MkExIHNyYy9cdUZGMUJcdTRFMERcdTg5ODFcdTRGRUVcdTY1MzkgZnJhbWV3b3JrLyBcdTYyMTYgZGlzdC9hcHAuanNcdTMwMDInLFxuICAgICctIFx1OTAxQVx1OEZDNyBET00gXHU5MDA5XHU2MkU5XHU1NjY4XHU1NzI4IEpTWCBcdTRFMkRcdTY0MUNcdTdEMjJcdTVCRjlcdTVFOTRcdTc2ODQgaWRcdTMwMDFjbGFzc05hbWUgXHU2MjE2IGRhdGEtd2Yta2V5XHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTc1NTlcdTYyNDBcdTY3MDlcdThCRURcdTRFNDkgY2xhc3NcdTMwMDFcdTUxNzNcdTk1MkVcdTgyODJcdTcwQjkgaWQgXHU1NDhDXHU5MUNEXHU1OTBEXHU2NTcwXHU2MzZFXHU4MjgyXHU3MEI5XHU3Njg0IGRhdGEtd2Yta2V5XHVGRjFCXHU2NUIwXHU1ODlFXHU4MjgyXHU3MEI5XHU0RTVGXHU5MDc1XHU1Qjg4XHU1NDBDXHU0RTAwXHU1NDdEXHU1NDBEXHU4OUM0XHU1MjE5XHUzMDAyJyxcbiAgICAnLSBcdTRGRUVcdTY1Mzkgc2NyZWVucy9sYXlvdXRzIFx1NjVGNlx1NEZERFx1NzU1OVx1MzAwQ1x1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RVx1MzAwRFx1RkYwQ1x1NUU3Nlx1NjI4QVx1MzAwQ1x1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RVx1MzAwRFx1NTNDQSBAd2lyZWZyYW1lLXNraWxsIFx1NjZGNFx1NjVCMFx1NEUzQVx1NUY1M1x1NTI0RCBza2lsbCBcdTcyNDhcdTY3MkNcdTMwMDInLFxuICAgICctIFx1NEZERFx1NjMwMSBwcm9qZWN0LmxpbmtzIFx1NEUzQVx1OTg3NVx1OTc2Mlx1NkQ0MVx1NzY4NFx1NTUyRlx1NEUwMFx1OEZCOVx1NjU3MFx1NjM2RVx1RkYxQlx1NUI4Q1x1NjIxMFx1NTQwRVx1OTFDRFx1NjVCMFx1Njc4NFx1NUVGQVx1NUU3Nlx1OUE4Q1x1OEJDMVx1NzUzQlx1Njc3Rlx1MzAwMVx1NkYxNFx1NzkzQVx1NTQ4Q1x1NEZFRVx1NjUzOVx1NkEyMVx1NUYwRlx1MzAwMicsXG4gIF1cblxuICBpZiAoIWl0ZW1zPy5sZW5ndGgpIHtcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyJylcbiAgICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbiAgfVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXZpZXdUYXJnZXRzKGl0ZW0pXG4gICAgbGluZXMucHVzaCgnJywgYCMjIFx1NEZFRVx1NjUzOSAke2l0ZW1JbmRleCArIDF9XHVGRjFBJHtUWVBFX0xBQkVMU1tpdGVtLnR5cGVdIHx8IFRZUEVfTEFCRUxTLmNvbW1lbnR9YClcbiAgICB0YXJnZXRzLmZvckVhY2goKHRhcmdldCwgdGFyZ2V0SW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHNjcmVlbklkID0gdGFyZ2V0LnNjcmVlbklkIHx8IGl0ZW0uc2NyZWVuSWRcbiAgICAgIGxpbmVzLnB1c2goXG4gICAgICAgICcnLFxuICAgICAgICBgXHU3NkVFXHU2ODA3ICR7dGFyZ2V0SW5kZXggKyAxfVx1RkYxQSR7dGFyZ2V0LnNjcmVlblRpdGxlIHx8IGl0ZW0uc2NyZWVuVGl0bGUgfHwgc2NyZWVuSWQgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1OTg3NVx1OTc2Mid9YCxcbiAgICAgICAgYFx1OTg3NVx1OTc2MiBJRFx1RkYxQSR7c2NyZWVuSWQgfHwgJ1x1NjcyQVx1NzdFNSd9YCxcbiAgICAgICAgYFx1NkU5MFx1NzgwMVx1NjNEMFx1NzkzQVx1RkYxQSR7dGFyZ2V0LnNvdXJjZUhpbnQgfHwgaXRlbS5zb3VyY2VIaW50IHx8IChzY3JlZW5JZCA/IGBzcmMvc2NyZWVucy8ke3NjcmVlbklkfS5qc3hgIDogJ1x1OEJGN1x1NjQxQ1x1N0QyMlx1OTAwOVx1NjJFOVx1NTY2OCcpfWAsXG4gICAgICAgICdET00gXHU5MDA5XHU2MkU5XHU1NjY4XHVGRjFBJyxcbiAgICAgICAgYFxcYCR7dGFyZ2V0LnNlbGVjdG9yfVxcYGAsXG4gICAgICApXG4gICAgICBpZiAodGFyZ2V0LmN1cnJlbnRUZXh0KSBsaW5lcy5wdXNoKCcnLCAnXHU1RjUzXHU1MjREXHU1MTg1XHU1QkI5XHVGRjFBJywgdGFyZ2V0LmN1cnJlbnRUZXh0KVxuICAgIH0pXG4gICAgbGluZXMucHVzaCgnJywgJ1x1NEZFRVx1NjUzOVx1ODk4MVx1NkM0Mlx1RkYxQScsIGl0ZW1SZXF1ZXN0KGl0ZW0pKVxuICB9KVxuXG4gIGxpbmVzLnB1c2goXG4gICAgJycsXG4gICAgJyMjIFx1NUI4Q1x1NjIxMFx1NjgwN1x1NTFDNicsXG4gICAgJy0gXHU5MDEwXHU5ODc5XHU1QjhDXHU2MjEwXHU0RUU1XHU0RTBBXHU0RkVFXHU2NTM5XHVGRjFCXHU4MkU1XHU5MDA5XHU2MkU5XHU1NjY4XHU1QkY5XHU1RTk0XHU1MTcxXHU0RUFCIGxheW91dFx1RkYwQ1x1OEJGN1x1NEZFRVx1NjUzOVx1NzcxRlx1NUI5RVx1NUI5QVx1NEU0OVx1NEY0RFx1N0Y2RVx1RkYwQ1x1NEUwRFx1ODk4MVx1NTcyOCBzY3JlZW4gXHU0RTJEXHU1OTBEXHU1MjM2XHU1QjlFXHU3M0IwXHUzMDAyJyxcbiAgICAnLSBcdTRFMERcdTc1MjggRE9NIFx1NUM0Mlx1N0VBN1x1NjIxNiBudGgtY2hpbGQgXHU2NkZGXHU0RUUzXHU1REYyXHU2NzA5XHU3Njg0XHU3QTMzXHU1QjlBXHU0RTFBXHU1MkExXHU5MDA5XHU2MkU5XHU1NjY4XHUzMDAyJyxcbiAgICAnLSBcdTY3ODRcdTVFRkFcdTYyMTBcdTUyOUZcdTU0MEVcdTY4QzBcdTY3RTVcdTUzRDdcdTVGNzFcdTU0Q0RcdTk4NzVcdTk3NjJcdTUzQ0FcdTUxNzZcdTRFMEFcdTRFMEJcdTZFMzhcdThERjNcdThGNkNcdTMwMDInLFxuICApXG4gIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxufVxuXG5leHBvcnQgY29uc3QgUkVWSUVXX1RZUEVfTEFCRUxTID0gVFlQRV9MQUJFTFNcbiIsICJpbXBvcnQgeyBpc1Njcm9sbGFibGVPdmVyZmxvdyB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuY29uc3QgU1RZTEVfS0VZUyA9IFtcbiAgJ3dpZHRoJyxcbiAgJ2hlaWdodCcsXG4gICdtaW5XaWR0aCcsXG4gICdtaW5IZWlnaHQnLFxuICAnb3ZlcmZsb3cnLFxuICAnb3ZlcmZsb3dYJyxcbiAgJ292ZXJmbG93WScsXG4gICdtYXhXaWR0aCcsXG4gICdtYXhIZWlnaHQnLFxuXVxuXG4vKiogXHU4MjgyXHU3MEI5XHU1RjUzXHU1MjREXHU2NjJGXHU1NDI2XHU1NkUwIG92ZXJmbG93IFx1NEVBN1x1NzUxRlx1NTNFRlx1NkVEQVx1NTJBOFx1NkVBMlx1NTFGQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShlbCkge1xuICBpZiAoIWVsIHx8IGVsLm5vZGVUeXBlICE9PSAxKSByZXR1cm4gZmFsc2VcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgZWwuc2Nyb2xsSGVpZ2h0ID4gZWwuY2xpZW50SGVpZ2h0ICsgMVxuICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBlbC5zY3JvbGxXaWR0aCA+IGVsLmNsaWVudFdpZHRoICsgMVxuICByZXR1cm4gY2FuWSB8fCBjYW5YXG59XG5cbmZ1bmN0aW9uIGRlcHRoRnJvbShyb290RWwsIGVsKSB7XG4gIGxldCBkZXB0aCA9IDBcbiAgbGV0IG5vZGUgPSBlbFxuICB3aGlsZSAobm9kZSAmJiBub2RlICE9PSByb290RWwpIHtcbiAgICBkZXB0aCArPSAxXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBkZXB0aFxufVxuXG4vKipcbiAqIFx1NjUzNlx1OTZDNlx1OTcwMFx1NjQ5MVx1NUYwMFx1NzY4NFx1ODI4Mlx1NzBCOVx1RkYxQVx1NTNFRlx1NkVEQVx1NTJBOFx1ODI4Mlx1NzBCOSArIFx1NEUwQVx1NkVBRlx1NTIzMCByb290IFx1NzY4NFx1Nzk1Nlx1NTE0OFx1MzAwMlxuICogXHU2REYxXHU4MjgyXHU3MEI5XHU1NzI4XHU1MjREXHVGRjBDXHU1MTQ4XHU2NDkxXHU1MTg1XHU1QzQyXHU1MThEXHU2NDkxXHU1OTE2XHU1OEYzXHVGRjA4XHU5MDdGXHU1MTREIGdyaWQgLyB3aWR0aDoxMDAlIFx1NjI4QVx1NTkxNlx1Njg0Nlx1NTM2MVx1NkI3Qlx1RkYwOVx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpIHtcbiAgaWYgKCFyb290RWwpIHJldHVybiBbXVxuICBjb25zdCBzY3JvbGxhYmxlcyA9IFtdXG4gIGNvbnN0IHZpc2l0ID0gKG5vZGUpID0+IHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gPyBBcnJheS5mcm9tKG5vZGUuY2hpbGRyZW4pIDogW11cbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB2aXNpdChjaGlsZClcbiAgICBpZiAobm9kZSA9PT0gcm9vdEVsIHx8IGlzRXhwYW5kYWJsZU92ZXJmbG93Tm9kZShub2RlKSkgc2Nyb2xsYWJsZXMucHVzaChub2RlKVxuICB9XG4gIHZpc2l0KHJvb3RFbClcblxuICBjb25zdCBzZXQgPSBuZXcgU2V0KHNjcm9sbGFibGVzKVxuICBmb3IgKGNvbnN0IGVsIG9mIHNjcm9sbGFibGVzKSB7XG4gICAgLy8gcm9vdCBcdTY3MkNcdThFQUJcdTVERjJcdTU3MjhcdTk2QzZcdTU0MDhcdTRFMkRcdUZGMUJcdTRFQ0VcdTVCODNcdTc2ODRcdTcyMzZcdTgyODJcdTcwQjlcdTdFRTdcdTdFRURcdTRFMEFcdTZFQUZcdTRGMUFcdThEOEFcdThGQzcgc2NyZWVuIFx1OEZCOVx1NzU0Q1x1RkYwQ1xuICAgIC8vIFx1NjI4QSBTY3JlZW5GcmFtZVx1MzAwMWNhbnZhc1x1MzAwMWJvYXJkIFx1NzUxQVx1ODFGMyBib2R5L2h0bWwgXHU0RTAwXHU1RTc2XHU2NTM5XHU1MTk5XHUzMDAyXG4gICAgaWYgKGVsID09PSByb290RWwpIGNvbnRpbnVlXG4gICAgbGV0IG5vZGUgPSBlbC5wYXJlbnRFbGVtZW50XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIHNldC5hZGQobm9kZSlcbiAgICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIFsuLi5zZXRdLnNvcnQoKGEsIGIpID0+IGRlcHRoRnJvbShyb290RWwsIGIpIC0gZGVwdGhGcm9tKHJvb3RFbCwgYSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzbmFwc2hvdElubGluZUJveChlbCkge1xuICBjb25zdCBvdXQgPSB7fVxuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSBvdXRba2V5XSA9IGVsLnN0eWxlW2tleV0gfHwgJydcbiAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUlubGluZUJveChlbCwgc25hcHNob3QpIHtcbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykge1xuICAgIGVsLnN0eWxlW2tleV0gPSBzbmFwc2hvdFtrZXldIHx8ICcnXG4gIH1cbn1cblxuLyoqXG4gKiBvZmZzZXRUb3AgLyBvZmZzZXRMZWZ0IFx1NzZGOFx1NUJGOSBvZmZzZXRQYXJlbnRcdUZGMENcdTgwMENcdTRFMERcdTRFMDBcdTVCOUFcdTc2RjhcdTVCRjlcdTc2RjRcdTYzQTVcdTcyMzZcdTgyODJcdTcwQjlcdTMwMDJcbiAqIFx1NTQwRVx1NTNGMFx1OTg3NVx1OTFDQ1x1OEZERVx1N0VFRFx1NzY4NCBzdGF0aWMgXHU1QkI5XHU1NjY4XHU5MDFBXHU1RTM4XHU1MTcxXHU0RUFCIHNjcmVlbiByb290IFx1NEY1Q1x1NEUzQSBvZmZzZXRQYXJlbnRcdUZGMENcbiAqIFx1NTZFMFx1NkI2NFx1OTcwMFx1ODk4MVx1NTE0OFx1NjM2Mlx1N0I5N1x1NTIzMFx1NUY1M1x1NTI0RFx1NzIzNlx1ODI4Mlx1NzBCOVx1NTc1MFx1NjgwN1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OTAxMFx1NUM0Mlx1OTFDRFx1NTkwRFx1N0QyRlx1NTJBMFx1NTQwQ1x1NEUwMFx1NkJCNVx1NTA0Rlx1NzlGQlx1MzAwMlxuICovXG5mdW5jdGlvbiBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgYXhpcykge1xuICBjb25zdCBvZmZzZXRLZXkgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0TGVmdCcgOiAnb2Zmc2V0VG9wJ1xuICBjb25zdCByZWN0U3RhcnQgPSBheGlzID09PSAneCcgPyAnbGVmdCcgOiAndG9wJ1xuICBjb25zdCByZWN0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICd3aWR0aCcgOiAnaGVpZ2h0J1xuICBjb25zdCBsYXlvdXRTaXplID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG4gIGNvbnN0IHNjcm9sbEtleSA9IGF4aXMgPT09ICd4JyA/ICdzY3JvbGxMZWZ0JyA6ICdzY3JvbGxUb3AnXG4gIGNvbnN0IGNoaWxkT2Zmc2V0ID0gY2hpbGRbb2Zmc2V0S2V5XSB8fCAwXG5cbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwpIHJldHVybiBjaGlsZE9mZnNldFxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ICYmIGNoaWxkLm9mZnNldFBhcmVudCA9PT0gZWwub2Zmc2V0UGFyZW50KSB7XG4gICAgcmV0dXJuIGNoaWxkT2Zmc2V0IC0gKGVsW29mZnNldEtleV0gfHwgMClcbiAgfVxuXG4gIGlmICh0eXBlb2YgZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IHBhcmVudFJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IGNoaWxkUmVjdCA9IGNoaWxkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgcmVuZGVyZWRTaXplID0gcGFyZW50UmVjdFtyZWN0U2l6ZV1cbiAgICBjb25zdCBzY2FsZSA9IGVsW2xheW91dFNpemVdID4gMCAmJiByZW5kZXJlZFNpemUgPiAwXG4gICAgICA/IHJlbmRlcmVkU2l6ZSAvIGVsW2xheW91dFNpemVdXG4gICAgICA6IDFcbiAgICBjb25zdCBzdGFydCA9IChjaGlsZFJlY3RbcmVjdFN0YXJ0XSAtIHBhcmVudFJlY3RbcmVjdFN0YXJ0XSkgLyBzY2FsZVxuICAgICAgKyAoZWxbc2Nyb2xsS2V5XSB8fCAwKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoc3RhcnQpKSByZXR1cm4gc3RhcnRcbiAgfVxuXG4gIHJldHVybiBjaGlsZE9mZnNldFxufVxuXG4vKipcbiAqIG92ZXJmbG93OnZpc2libGUgXHU2NUY2XHU5MEU4XHU1MjA2XHU2RDRGXHU4OUM4XHU1NjY4IHNjcm9sbFdpZHRoIFx1MjI0OCBjbGllbnRXaWR0aFx1RkYwQ1xuICogXHU2MjQwXHU0RUU1XHU1MThEXHU2MjZCXHU1QjUwXHU4MjgyXHU3MEI5IG9mZnNldCBcdThGQjlcdTc1NENcdUZGMENcdTkwN0ZcdTUxNERcdTVCQkRcdTg4NjhcdTY0OTFcdTRFMERcdTVGMDBcdTU5MTZcdTY4NDZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpIHtcbiAgbGV0IHdpZHRoID0gTWF0aC5tYXgoZWwuc2Nyb2xsV2lkdGggfHwgMCwgZWwub2Zmc2V0V2lkdGggfHwgMClcbiAgbGV0IGhlaWdodCA9IE1hdGgubWF4KGVsLnNjcm9sbEhlaWdodCB8fCAwLCBlbC5vZmZzZXRIZWlnaHQgfHwgMClcbiAgY29uc3QgY2hpbGRyZW4gPSBlbC5jaGlsZHJlbiA/IEFycmF5LmZyb20oZWwuY2hpbGRyZW4pIDogW11cbiAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xuICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneCcpICsgKGNoaWxkLm9mZnNldFdpZHRoIHx8IDApKVxuICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd5JykgKyAoY2hpbGQub2Zmc2V0SGVpZ2h0IHx8IDApKVxuICB9XG4gIHJldHVybiB7IHdpZHRoLCBoZWlnaHQgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlFeHBhbmRlZEJveChlbCkge1xuICBlbC5zdHlsZS5tYXhXaWR0aCA9ICdub25lJ1xuICBlbC5zdHlsZS5tYXhIZWlnaHQgPSAnbm9uZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3cgPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dYID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WSA9ICd2aXNpYmxlJ1xuICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IG1lYXN1cmVJbnRyaW5zaWNCb3goZWwpXG4gIGVsLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgZWwuc3R5bGUubWluV2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUubWluSGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxufVxuXG4vKiogXHU2NDkxXHU1RjAwIHJvb3QgXHU1MTg1XHU2MjQwXHU2NzA5XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1M0NBXHU1MTc2XHU3OTU2XHU1MTQ4XHVGRjFCXHU4RkQ0XHU1NkRFXHU3NTI4XHU0RThFXHU2NTM2XHU4RDc3XHU3Njg0XHU1RkVCXHU3MTY3XHU1MjE3XHU4ODY4ICovXG5leHBvcnQgZnVuY3Rpb24gZXhwYW5kU2NyZWVuQ29udGVudChyb290RWwpIHtcbiAgY29uc3Qgbm9kZXMgPSBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbClcbiAgY29uc3Qgc25hcHNob3RzID0gbm9kZXMubWFwKChlbCkgPT4gKHsgZWwsIHN0eWxlOiBzbmFwc2hvdElubGluZUJveChlbCkgfSkpXG4gIGZvciAoY29uc3QgeyBlbCB9IG9mIHNuYXBzaG90cykgYXBwbHlFeHBhbmRlZEJveChlbClcbiAgLy8gXHU1QjUwXHU3RUE3XHU2NDkxXHU1RjAwXHU1NDBFXHVGRjBDXHU2ODM5XHU1MThEXHU5MUNGXHU0RTAwXHU2QjIxXHVGRjBDXHU1NDAzXHU2Mzg5XHU2QjhCXHU0RjU5XHU2RUEyXHU1MUZBXG4gIGFwcGx5RXhwYW5kZWRCb3gocm9vdEVsKVxuICByZXR1cm4gc25hcHNob3RzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoc25hcHNob3RzKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzbmFwc2hvdHMpKSByZXR1cm5cbiAgZm9yIChjb25zdCB7IGVsLCBzdHlsZSB9IG9mIHNuYXBzaG90cykgcmVzdG9yZUlubGluZUJveChlbCwgc3R5bGUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlQ29udGVudEJveChyb290RWwpIHtcbiAgcmV0dXJuIG1lYXN1cmVJbnRyaW5zaWNCb3gocm9vdEVsKVxufVxuXG4vKipcbiAqIFx1NURFNVx1NTE3N1x1NjgwRlx1NUM1NVx1NUYwMC9cdTY1MzZcdThENzdcdTc2RUVcdTY4MDdcdUZGMUFcbiAqIFx1NjcwOVx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MkZFXHU5MDA5XHU5NkM2XHU1NDA4XHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUxNjhcdTkwRThcdTVDNEZcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxJZHMpIHtcbiAgaWYgKHNlbGVjdGVkSWRzIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgaWYgKHNlbGVjdGVkSWRzLnNpemUgPiAwKSByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoc2VsZWN0ZWRJZHMpICYmIHNlbGVjdGVkSWRzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gWy4uLnNlbGVjdGVkSWRzXVxuICB9XG4gIHJldHVybiBbLi4uYWxsSWRzXVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBFcnJvckJvdW5kYXJ5IH0gZnJvbSAnLi4vY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFNjcmVlbklkZW50aXR5UHJvdmlkZXIgfSBmcm9tICcuLi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcbmltcG9ydCB7IGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4uL3VpL2Zsb3ctdGFyZ2V0LmpzJ1xuaW1wb3J0IHsgZmluZFJldmlld1RhcmdldCB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuaW1wb3J0IHtcbiAgY29sbGFwc2VTY3JlZW5Db250ZW50LFxuICBleHBhbmRTY3JlZW5Db250ZW50LFxuICBtZWFzdXJlQ29udGVudEJveCxcbn0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQge1xuICBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsLFxuICBlbmRDb250ZW50RHJhZ1Njcm9sbCxcbiAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsLFxufSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBTY3JlZW5GcmFtZSh7XG4gIHNjcmVlbixcbiAgdmlld3BvcnQsXG4gIG1vZGUsXG4gIGluZGV4ID0gMCxcbiAgZm9jdXNlZCA9IGZhbHNlLFxuICBvbkV4cG9ydCxcbiAgZXhwYW5kZWQgPSBmYWxzZSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIGNhbnZhc0xvY2tlZCA9IGZhbHNlLFxuICBzY2FsZSA9IDEsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG59KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGNvbnRlbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZHJhZ1JlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBleHBhbmRTbmFwc2hvdFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBob3ZlclJldmlld0VsZW1lbnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2RyYWdTY3JvbGxpbmcsIHNldERyYWdTY3JvbGxpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZEJveCwgc2V0RXhwYW5kZWRCb3hdID0gUmVhY3QudXNlU3RhdGUobnVsbClcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBjb250ZW50UmVmLmN1cnJlbnRcbiAgICBpZiAoIXJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgaWYgKGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAoIWV4cGFuZGVkKSB7XG4gICAgICBzZXRFeHBhbmRlZEJveChudWxsKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBleHBhbmRTY3JlZW5Db250ZW50KHJvb3QpXG4gICAgc2V0RXhwYW5kZWRCb3gobWVhc3VyZUNvbnRlbnRCb3gocm9vdCkpXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaWYgKGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICB9XG4gICAgfVxuICB9LCBbZXhwYW5kZWQsIHNjcmVlbj8uaWQsIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHRdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkIHx8IGNhbnZhc0xvY2tlZCkge1xuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cbiAgfSwgW2NhbnZhc0xvY2tlZCwgcmV2aWV3RW5hYmxlZCwgc2NyZWVuPy5pZF0pXG5cbiAgaWYgKCFzY3JlZW4pIHJldHVybiBudWxsXG5cbiAgY29uc3QgQ29tcG9uZW50ID0gc2NyZWVuLmNvbXBvbmVudFxuICBjb25zdCBmcmFtZUNsYXNzID0gW1xuICAgICd3Zi1zY3JlZW4tY2hyb21lJyxcbiAgICBtb2RlID09PSAnY2FudmFzJyAmJiBmb2N1c2VkID8gJ2lzLWZvY3VzZWQnIDogJycsXG4gICAgZXhwYW5kZWQgPyAnaXMtZXhwYW5kZWQnIDogJycsXG4gICAgYHdmLXNjcmVlbi0ke21vZGV9YCxcbiAgXS5maWx0ZXIoQm9vbGVhbikuam9pbignICcpXG5cbiAgY29uc3Qgb25Qb2ludGVyRG93biA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICAvLyBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFMERcdTYzQTVcdTdCQTFcdTVDNEZcdTUxODVcdTYyRDZcdTYyRkRcdTZFREFcdTUyQThcdUZGMENcdThCQTlcdTRFOEJcdTRFRjZcdTg0M0RcdTUyMzBcdTc1M0JcdTVFMDNcdTVFNzNcdTc5RkJcbiAgICBpZiAoY2FudmFzTG9ja2VkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1REYyXHU1QzU1XHU1RjAwXHU2NUUwXHU1M0VGXHU2RURBXHU1MzNBXHU1N0RGXHVGRjBDXHU0RTBEXHU2MkEyXHU2MzA3XHU5NDg4XG4gICAgaWYgKGV4cGFuZGVkKSByZXR1cm5cbiAgICBjb25zdCBzdGF0ZSA9IGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgeyBsb2NrZWQ6IGNhbnZhc0xvY2tlZCwgc2NhbGUgfSlcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBzdGF0ZVxuICAgIHNldERyYWdTY3JvbGxpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlck1vdmUgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCAmJiAhY2FudmFzTG9ja2VkKSB7XG4gICAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgICAgaWYgKHRhcmdldCA9PT0gaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQpIHJldHVyblxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIHRhcmdldD8uY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSB0YXJnZXRcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzdGF0ZSA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJFbmQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzdGF0ZSA9IGRyYWdSZWYuY3VycmVudFxuICAgIGlmICghc3RhdGUgfHwgc3RhdGUucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIGVuZENvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdTY3JvbGxpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBvbkNvbnRlbnRDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIGNvbnRlbnRSZWYuY3VycmVudCwgbmF2aWdhdGUpXG4gIH1cblxuICBjb25zdCBvblJldmlld0NsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkIHx8IGNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgb25SZXZpZXdTZWxlY3Q/Lih0YXJnZXQsIHNjcmVlbiwgY29udGVudFJlZi5jdXJyZW50LCB7XG4gICAgICBhZGRpdGl2ZTogZXZlbnQuc2hpZnRLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5LFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBjbGVhclJldmlld0hvdmVyID0gKCkgPT4ge1xuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gIH1cblxuICBjb25zdCBjb250ZW50U3R5bGUgPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveFxuICAgID8geyB3aWR0aDogZXhwYW5kZWRCb3gud2lkdGgsIGhlaWdodDogZXhwYW5kZWRCb3guaGVpZ2h0LCBvdmVyZmxvdzogJ3Zpc2libGUnIH1cbiAgICA6IHsgd2lkdGg6IHZpZXdwb3J0LndpZHRoLCBoZWlnaHQ6IHZpZXdwb3J0LmhlaWdodCB9XG5cbiAgY29uc3QgZnJhbWVXaWR0aCA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94ID8gZXhwYW5kZWRCb3gud2lkdGggOiB2aWV3cG9ydC53aWR0aFxuXG4gIHJldHVybiAoXG4gICAgPHNlY3Rpb25cbiAgICAgIGNsYXNzTmFtZT17ZnJhbWVDbGFzc31cbiAgICAgIGRhdGEtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICBkYXRhLWV4cGFuZGVkPXtleHBhbmRlZCA/ICd0cnVlJyA6ICdmYWxzZSd9XG4gICAgICBzdHlsZT17eyB3aWR0aDogZnJhbWVXaWR0aCB9fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1sYWJlbFwiPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXRpdGxlXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWZpbGVcIj57c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1hY3Rpb25zXCI+XG4gICAgICAgICAge29uVG9nZ2xlRXhwYW5kID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtZXhwYW5kLW9uZVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3JyA6ICdcdTVDNTVcdTVGMDAnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnICYmIG9uRXhwb3J0ID8gKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtZXhwb3J0LW9uZVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgb25FeHBvcnQoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBcdTVCRkNcdTUxRkEgUE5HXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIHJlZj17Y29udGVudFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2Ytc2NyZWVuLWNvbnRlbnQke2RyYWdTY3JvbGxpbmcgPyAnIGlzLWRyYWctc2Nyb2xsaW5nJyA6ICcnfSR7ZXhwYW5kZWQgPyAnIGlzLWV4cGFuZGVkJyA6ICcnfSR7cmV2aWV3RW5hYmxlZCAmJiAhY2FudmFzTG9ja2VkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICAgICAgc3R5bGU9e2NvbnRlbnRTdHlsZX1cbiAgICAgICAgb25Qb2ludGVyRG93bj17b25Qb2ludGVyRG93bn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17b25Qb2ludGVyTW92ZX1cbiAgICAgICAgb25Qb2ludGVyVXA9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckxlYXZlPXtjbGVhclJldmlld0hvdmVyfVxuICAgICAgICBvbkNsaWNrQ2FwdHVyZT17b25SZXZpZXdDbGlja31cbiAgICAgICAgb25DbGljaz17b25Db250ZW50Q2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxFcnJvckJvdW5kYXJ5XG4gICAgICAgICAgc2NvcGU9XCJzY3JlZW5cIlxuICAgICAgICAgIHJlc2V0S2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgc2NyZWVuSWQ9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzb3VyY2U9e2BzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5JZGVudGl0eVByb3ZpZGVyIHNjcmVlbklkPXtzY3JlZW4uaWR9PlxuICAgICAgICAgICAgPENvbXBvbmVudCAvPlxuICAgICAgICAgIDwvU2NyZWVuSWRlbnRpdHlQcm92aWRlcj5cbiAgICAgICAgPC9FcnJvckJvdW5kYXJ5PlxuICAgICAgPC9kaXY+XG4gICAgPC9zZWN0aW9uPlxuICApXG59XG4iLCAiaW1wb3J0IHsgY2xhbXBTY2FsZSwgc2hvdWxkWm9vbU9uV2hlZWwgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbi8qKiBcdTdFRDFcdTVCOUFcdTk3NUUgcGFzc2l2ZSB3aGVlbFx1RkYwQ1x1NjI0RFx1ODBGRFx1NTQwOFx1NkNENSBwcmV2ZW50RGVmYXVsdFx1RkYwOFJlYWN0IG9uV2hlZWwgXHU5RUQ4XHU4QkE0IHBhc3NpdmVcdUZGMDlcdTMwMDIgKi9cbmV4cG9ydCBmdW5jdGlvbiBiaW5kV2hlZWxab29tKGVsLCBnZXRTY2FsZSwgc2V0U2NhbGUsIGdldExvY2tlZCA9ICgpID0+IGZhbHNlKSB7XG4gIGlmICghZWwpIHJldHVybiAoKSA9PiB7fVxuICBjb25zdCBvbldoZWVsID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQ6IGdldExvY2tlZCgpIH0pKSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgc2V0U2NhbGUoY2xhbXBTY2FsZShnZXRTY2FsZSgpICogKGV2ZW50LmRlbHRhWSA+IDAgPyAwLjkgOiAxLjEpKSlcbiAgfVxuICBlbC5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSlcbiAgcmV0dXJuICgpID0+IGVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVdoZWVsWm9vbShlbGVtZW50UmVmLCBzY2FsZSwgc2V0U2NhbGUsIGxvY2tlZCA9IGZhbHNlKSB7XG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBsb2NrZWRSZWYgPSBSZWFjdC51c2VSZWYobG9ja2VkKVxuICBzY2FsZVJlZi5jdXJyZW50ID0gc2NhbGVcbiAgbG9ja2VkUmVmLmN1cnJlbnQgPSBsb2NrZWRcblxuICBSZWFjdC51c2VFZmZlY3QoXG4gICAgKCkgPT4gYmluZFdoZWVsWm9vbShcbiAgICAgIGVsZW1lbnRSZWYuY3VycmVudCxcbiAgICAgICgpID0+IHNjYWxlUmVmLmN1cnJlbnQsXG4gICAgICBzZXRTY2FsZSxcbiAgICAgICgpID0+IGxvY2tlZFJlZi5jdXJyZW50LFxuICAgICksXG4gICAgW2VsZW1lbnRSZWYsIHNldFNjYWxlXSxcbiAgKVxufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBjYW5Vc2VEZW1vKHNjcmVlbnMpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2NyZWVucykgJiYgc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSA9PT0gdHJ1ZSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZm9jdXNDYW52YXNTY3JlZW4sIHJlc2V0Q2FudmFzVmlld3BvcnQsIHBhbkZyb21EcmFnU25hcHNob3QgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKHRhc2ssIHNldEVycm9yKSB7XG4gIHNldEVycm9yKG51bGwpXG4gIHRyeSB7XG4gICAgYXdhaXQgdGFzaygpXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKVxuICAgIHNldEVycm9yKGBcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjVcdUZGMUEke21lc3NhZ2V9YClcbiAgfVxufVxuXG4vKiogZmlsZTovLyBcdTRFMERcdTY2MkYgc2VjdXJlIGNvbnRleHRcdUZGMENjbGlwYm9hcmQgQVBJIFx1NUUzOFx1NEUwRFx1NTNFRlx1NzUyOFx1RkYwQ2V4ZWNDb21tYW5kIFx1NTE1Q1x1NUU5NSAqL1xuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpXG4gIH1cbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnZml4ZWQnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FudmFzTW9kZSh7XG4gIHByb2plY3QsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgY2FudmFzTG9ja2VkLFxuICBzZWxlY3RlZElkcyxcbiAgc2V0U2VsZWN0ZWRJZHMsXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgb25FeHBvcnRJZHMsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCBuYXZpZ2F0ZSwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBlbnRlckRlbW86IGVudGVyRGVtb01vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWRLZXksIHNldENvcGllZEtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbY29weVRvYXN0LCBzZXRDb3B5VG9hc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjYW52YXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY29waWVkVGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGRyYWdnaW5nUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBkcmFnZ2luZ1JlZi5jdXJyZW50ID0gZHJhZ2dpbmdcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IGN1cnJlbnQuc2NhbGUgfSkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcmFnZ2luZ1JlZi5jdXJyZW50KSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcHBseSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICAgIGlmICghY2FudmFzIHx8ICFzdGFnZSkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzY3JlZW5FbCA9IHN0YWdlLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhbnZhcy1zY3JlZW4taWQ9XCIke2N1cnJlbnRTY3JlZW5JZH1cIl1gKVxuICAgICAgaWYgKCFzY3JlZW5FbCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBjdXJyZW50U2NhbGUgPSBzY2FsZVJlZi5jdXJyZW50XG4gICAgICBpZiAoY3VycmVudFNjYWxlIDw9IDApIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc3RhZ2VCb3ggPSBzdGFnZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc2NyZWVuQm94ID0gc2NyZWVuRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IG5leHQgPSBmb2N1c0NhbnZhc1NjcmVlbih7XG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsXG4gICAgICAgIGNvbnRhaW5lckhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCxcbiAgICAgICAgc2NyZWVuTGVmdDogKHNjcmVlbkJveC5sZWZ0IC0gc3RhZ2VCb3gubGVmdCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlblRvcDogKHNjcmVlbkJveC50b3AgLSBzdGFnZUJveC50b3ApIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5XaWR0aDogc2NyZWVuQm94LndpZHRoIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5IZWlnaHQ6IHNjcmVlbkJveC5oZWlnaHQgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIGN1cnJlbnRTY2FsZSxcbiAgICAgIH0pXG4gICAgICBpZiAoIW5leHQpIHJldHVybiBmYWxzZVxuICAgICAgc2V0U2NhbGUobmV4dC5zY2FsZSlcbiAgICAgIHNldFZpZXcobmV4dClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KCkpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgYXBwbHkoKVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSlcbiAgfSwgW2N1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnRLZXksIHNldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIHVzZVdoZWVsWm9vbShjYW52YXNSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGVudGVyRGVtbyA9IChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghZGVtb0F2YWlsYWJsZSB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGVudGVyRGVtb01vZGUoc2NyZWVuSWQpXG4gIH1cblxuICBjb25zdCBjb3B5TWV0YSA9IChrZXksIHRleHQsIGV2ZW50KSA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgY29weVRleHQodGV4dCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWRLZXkoa2V5KVxuICAgICAgc2V0Q29weVRvYXN0KCdcdTVERjJcdTU5MERcdTUyMzYnKVxuICAgICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgICAgIGNvcGllZFRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldENvcGllZEtleShudWxsKVxuICAgICAgICBzZXRDb3B5VG9hc3QobnVsbClcbiAgICAgIH0sIDEyMDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZVNlbGVjdGVkID0gKGlkKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVBbGwgPSAoKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50LnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGgpIHJldHVybiBuZXcgU2V0KClcbiAgICAgIHJldHVybiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zaGVsbFwiPlxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1zaWRlYmFyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1oZWFkZXJcIj5cbiAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuc2l6ZSA9PT0gcHJvamVjdC5zY3JlZW5zLmxlbmd0aCAmJiBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID4gMH1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e3RvZ2dsZUFsbH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICBcdTUxNjhcdTkwMDlcbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1saXN0XCI+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICB0b2dnbGVTZWxlY3RlZChzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTkwMDlcdTYyRTkgJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWluZGV4LW51bVwiPntpbmRleCArIDF9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvdWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBzXCIgYXJpYS1sYWJlbD1cIlx1NjRDRFx1NEY1Q1x1NjNEMFx1NzkzQVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQiAvIFx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTdBN0FcdTY4M0NcdTYyRDZcdTYyRkQgLyBDdHJsK1x1NkVEQVx1OEY2RTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuICAgICAgPG1haW5cbiAgICAgICAgcmVmPXtjYW52YXNSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWNhbnZhcyR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVGV4dCA9IGAke2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICBjb25zdCB0aXRsZUtleSA9IGAke3NjcmVlbi5pZH06dGl0bGVgXG4gICAgICAgICAgICBjb25zdCBmaWxlS2V5ID0gYCR7c2NyZWVuLmlkfTpmaWxlYFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLXNjcmVlbiBpcy1mb2N1c2VkJyA6ICd3Zi1jYW52YXMtc2NyZWVuJ31cbiAgICAgICAgICAgICAgICBkYXRhLWNhbnZhcy1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgbmF2aWdhdGUoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICBlbnRlckRlbW8oc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1tZXRhLXRpdGxlIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEodGl0bGVLZXksIHRpdGxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGl0bGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7c2NyZWVuLmRlc2NyaXB0aW9uID8gPGRpdj57c2NyZWVuLmRlc2NyaXB0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLW1ldGEtbGluZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YShmaWxlS2V5LCBmaWxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlx1NjU4N1x1NEVGNlx1RkYxQTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICB7ZmlsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgICAgICAgbW9kZT1cImNhbnZhc1wiXG4gICAgICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICBmb2N1c2VkPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgICAgIGV4cGFuZGVkPXtleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXsoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25FeHBvcnQ9eygpID0+IG9uRXhwb3J0SWRzKFtzY3JlZW4uaWRdKX1cbiAgICAgICAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXhcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGFiZWxcIj5cdTdEMjJcdTVGMTU8L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLWluZGV4LWRvdCBpcy1hY3RpdmUnIDogJ3dmLWNhbnZhcy1pbmRleC1kb3QnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KCkgPT4gZW50ZXJEZW1vKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L21haW4+XG4gICAgICB7Y29weVRvYXN0ID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvYXN0XCIgcm9sZT1cInN0YXR1c1wiPntjb3B5VG9hc3R9PC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQge1xuICBmaXREZW1vU2NhbGUsXG4gIGlzRGVtb0JsYW5rRXhpdFRhcmdldCxcbiAgcGFuRnJvbURyYWdTbmFwc2hvdCxcbiAgcmVzZXRDYW52YXNWaWV3cG9ydCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuXG5jb25zdCBCTEFOS19FWElUX0hJTlQgPSAnXHU1M0NDXHU1MUZCXHU3QTdBXHU3NjdEXHU1OTA0XHU5MDAwXHU1MUZBXHU2RjE0XHU3OTNBJ1xuXG5mdW5jdGlvbiByZWFkQ29udGVudEJveChlbCkge1xuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBwYWRYID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodClcbiAgY29uc3QgcGFkWSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IE1hdGgubWF4KDAsIGVsLmNsaWVudFdpZHRoIC0gcGFkWCksXG4gICAgaGVpZ2h0OiBNYXRoLm1heCgwLCBlbC5jbGllbnRIZWlnaHQgLSBwYWRZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVtb01vZGUoe1xuICBwcm9qZWN0LFxuICBob3RzcG90c1Zpc2libGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICB2aWV3UmVzZXRLZXksXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgc2V0TW9kZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3Qgc2NyZWVuSW5kZXggPSBwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG4gIGNvbnN0IHNjcmVlbiA9IHNjcmVlbkluZGV4ID49IDAgPyBwcm9qZWN0LnNjcmVlbnNbc2NyZWVuSW5kZXhdIDogbnVsbFxuICBjb25zdCBjdXJyZW50RXhwYW5kZWQgPSAhIShzY3JlZW4gJiYgZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCkpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgdmlld3BvcnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBleGl0T25CbGFua0RvdWJsZUNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gICAgc2V0TW9kZSgnY2FudmFzJylcbiAgfVxuXG4gIC8vIHRpdGxlIFx1NjMwMlx1NTcyOFx1ODlDNlx1NTNFM1x1NEUwQVx1NEYxQVx1ODQzRFx1NTIzMFx1NUM0Rlx1NTE4NVx1NUI1MFx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Mlx1NjI3MFx1NjRDRFx1NEY1Q1x1RkYxQlx1NTNFQVx1NTcyOFx1N0E3QVx1NzY3RFx1NTkwNFx1NjBBQ1x1NTA1Q1x1NjVGNlx1NjMwMlx1NEUwQVx1MzAwMlxuICBjb25zdCBzeW5jQmxhbmtFeGl0SGludCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGVsID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGlmICghZWwpIHJldHVyblxuICAgIGNvbnN0IG5leHQgPSBpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSA/IEJMQU5LX0VYSVRfSElOVCA6ICcnXG4gICAgaWYgKChlbC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykgfHwgJycpID09PSBuZXh0KSByZXR1cm5cbiAgICBpZiAobmV4dCkgZWwuc2V0QXR0cmlidXRlKCd0aXRsZScsIG5leHQpXG4gICAgZWxzZSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGNsZWFyQmxhbmtFeGl0SGludCA9ICgpID0+IHtcbiAgICB2aWV3cG9ydFJlZi5jdXJyZW50Py5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGFwcGx5Rml0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCAhc3RhZ2UpIHJldHVyblxuICAgIGNvbnN0IGJveCA9IHJlYWRDb250ZW50Qm94KGNvbnRhaW5lcilcbiAgICBjb25zdCBuZXh0ID0gZml0RGVtb1NjYWxlKGJveC53aWR0aCwgYm94LmhlaWdodCwgc3RhZ2Uub2Zmc2V0V2lkdGgsIHN0YWdlLm9mZnNldEhlaWdodClcbiAgICBzZXRTY2FsZShuZXh0KVxuICAgIHNldFZpZXcoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBuZXh0IH0pXG4gIH0sIFtzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCB0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFwcGx5Rml0KClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gYXBwbHlGaXQoKSlcbiAgICBvYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lcilcbiAgICBpZiAoc3RhZ2UpIG9ic2VydmVyLm9ic2VydmUoc3RhZ2UpXG4gICAgYXBwbHlGaXQoKVxuICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgfSwgW2FwcGx5Rml0LCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIGN1cnJlbnRTY3JlZW5JZCwgdmlld1Jlc2V0S2V5LCBjdXJyZW50RXhwYW5kZWRdKVxuXG4gIHVzZVdoZWVsWm9vbSh2aWV3cG9ydFJlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWRlbW8gaXMtc2hvd2luZy1ob3RzcG90cycgOiAnd2YtZGVtbyd9PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e3ZpZXdwb3J0UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1kZW1vLXZpZXdwb3J0JHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uTW91c2VNb3ZlPXtzeW5jQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25Nb3VzZUxlYXZlPXtjbGVhckJsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e2V4aXRPbkJsYW5rRG91YmxlQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWRlbW8tc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgIG1vZGU9XCJkZW1vXCJcbiAgICAgICAgICAgIGluZGV4PXtzY3JlZW5JbmRleH1cbiAgICAgICAgICAgIGV4cGFuZGVkPXtjdXJyZW50RXhwYW5kZWR9XG4gICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17c2NyZWVuICYmIG9uVG9nZ2xlRXhwYW5kID8gKCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1kZW1vLWhpbnRcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTUxODVcdTYzMDlcdTk0QUUgLyBcdTk0RkVcdTYzQTVcdThERjNcdThGNkNcdUZGMUJcdTUzRUZcdTU3MjhcdTVERTVcdTUxNzdcdTY4MEZcdTVGMDBcdTUxNzNcdTcwRURcdTUzM0FcdTlBRDhcdTRFQUVcdUZGMUJcdTY4MDdcdTk4OThcdTY4MEZcdTUzRUZcdTRFMzRcdTY1RjZcdTVDNTVcdTVGMDBcdTc3MEJcdTUxNjhcdThDOEM8L3A+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBleHBhbmRTY3JlZW5Db250ZW50LCBtZWFzdXJlQ29udGVudEJveCB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuXG5sZXQgZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxuXG5jb25zdCBsaWJyYXJpZXMgPSBbXG4gIHsgZmlsZTogJ2h0bWwyY2FudmFzLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93Lmh0bWwyY2FudmFzID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ2pzemlwLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LkpTWmlwID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ0ZpbGVTYXZlci5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5zYXZlQXMgPT09ICdmdW5jdGlvbicgfSxcbl1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdChmaWxlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtd2lyZWZyYW1lLWV4cG9ydD1cIiR7ZmlsZX1cIl1gKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPT09ICdsb2FkZWQnKSB7XG4gICAgICAgIGV4aXN0aW5nLnJlbW92ZSgpXG4gICAgICAgIGV4aXN0aW5nID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXNvbHZlLCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0LCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB2ZW5kb3JCYXNlID0gd2luZG93LldJUkVGUkFNRV9WRU5ET1JfQkFTRVxuICAgIGlmICghdmVuZG9yQmFzZSkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignXHU2NzJBXHU5MTREXHU3RjZFXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzXHU4REVGXHU1Rjg0IFdJUkVGUkFNRV9WRU5ET1JfQkFTRScpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgc2NyaXB0LnNyYyA9IG5ldyBVUkwoZmlsZSwgdmVuZG9yQmFzZSkuaHJlZlxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydCA9IGZpbGVcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkaW5nJ1xuICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkZWQnXG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQucmVtb3ZlKClcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1NTJBMFx1OEY3RFx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5MyAke2ZpbGV9YCkpXG4gICAgfVxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEV4cG9ydExpYnJhcmllcygpIHtcbiAgaWYgKCFleHBvcnRMaWJyYXJpZXNQcm9taXNlKSB7XG4gICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IGxpYnJhcmllcy5yZWR1Y2UoXG4gICAgICAoY2hhaW4sIGxpYnJhcnkpID0+IGNoYWluLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgYXdhaXQgbG9hZFNjcmlwdChsaWJyYXJ5LmZpbGUpXG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSB0aHJvdyBuZXcgRXJyb3IoYFx1NUJGQ1x1NTFGQVx1NUU5M1x1NTIxRFx1NTlDQlx1NTMxNlx1NTkzMVx1OEQyNTogJHtsaWJyYXJ5LmZpbGV9YClcbiAgICAgIH0pLFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKCksXG4gICAgKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSB1bmRlZmluZWRcbiAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbiAgfVxuICByZXR1cm4gZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVNjcmVlbihzY3JlZW5FbGVtZW50LCB2aWV3cG9ydCwgeyBleHBhbmRlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAoIXNjcmVlbkVsZW1lbnQpIHRocm93IG5ldyBFcnJvcignXHU2MjdFXHU0RTBEXHU1MjMwXHU4OTgxXHU1QkZDXHU1MUZBXHU3Njg0IHNjcmVlbiBcdTUxNDNcdTdEMjAnKVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcblxuICBjb25zdCBzYW5kYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc2FuZGJveC5jbGFzc05hbWUgPSAnd2YtZXhwb3J0LXNhbmRib3gnXG4gIGNvbnN0IGNsb25lID0gc2NyZWVuRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSlcbiAgc2FuZGJveC5hcHBlbmRDaGlsZChjbG9uZSlcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzYW5kYm94KVxuXG4gIGxldCB3aWR0aCA9IHZpZXdwb3J0LndpZHRoXG4gIGxldCBoZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHRcbiAgdHJ5IHtcbiAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgIGV4cGFuZFNjcmVlbkNvbnRlbnQoY2xvbmUpXG4gICAgICBjb25zdCBib3ggPSBtZWFzdXJlQ29udGVudEJveChjbG9uZSlcbiAgICAgIHdpZHRoID0gYm94LndpZHRoXG4gICAgICBoZWlnaHQgPSBib3guaGVpZ2h0XG4gICAgfVxuICAgIGNsb25lLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgY2xvbmUuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICAgIHNhbmRib3guc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBzYW5kYm94LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcblxuICAgIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHdpbmRvdy5odG1sMmNhbnZhcyhjbG9uZSwge1xuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHNjYWxlOiAyLFxuICAgICAgdXNlQ09SUzogZmFsc2UsXG4gICAgICBsb2dnaW5nOiBmYWxzZSxcbiAgICB9KVxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjYW52YXMudG9CbG9iKFxuICAgICAgICAoYmxvYikgPT4gYmxvYiA/IHJlc29sdmUoYmxvYikgOiByZWplY3QobmV3IEVycm9yKCdQTkcgXHU3RjE2XHU3ODAxXHU1OTMxXHU4RDI1JykpLFxuICAgICAgICAnaW1hZ2UvcG5nJyxcbiAgICAgIClcbiAgICB9KVxuICB9IGZpbmFsbHkge1xuICAgIHNhbmRib3gucmVtb3ZlKClcbiAgfVxufVxuXG5mdW5jdGlvbiBzbHVnKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUgfHwgJ3dpcmVmcmFtZScpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tfC0kL2csICcnKSB8fCAnd2lyZWZyYW1lJ1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U2VsZWN0ZWQoc2NyZWVucykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVucykgfHwgc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1ODFGM1x1NUMxMVx1OTAwOVx1NjJFOVx1NEUwMFx1NEUyQSBzY3JlZW4nKVxuICB9XG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuICBjb25zdCBjYXB0dXJlZCA9IFtdXG4gIGZvciAoY29uc3Qgc2NyZWVuIG9mIHNjcmVlbnMpIHtcbiAgICBjYXB0dXJlZC5wdXNoKHtcbiAgICAgIG5hbWU6IGAke3NsdWcoc2NyZWVuLmlkKX0ucG5nYCxcbiAgICAgIGJsb2I6IGF3YWl0IGNhcHR1cmVTY3JlZW4oc2NyZWVuLmVsZW1lbnQsIHNjcmVlbi52aWV3cG9ydCwge1xuICAgICAgICBleHBhbmRlZDogISFzY3JlZW4uZXhwYW5kZWQsXG4gICAgICB9KSxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGNhcHR1cmVkLmxlbmd0aCA9PT0gMSkge1xuICAgIHdpbmRvdy5zYXZlQXMoY2FwdHVyZWRbMF0uYmxvYiwgY2FwdHVyZWRbMF0ubmFtZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHppcCA9IG5ldyB3aW5kb3cuSlNaaXAoKVxuICBjYXB0dXJlZC5mb3JFYWNoKChpdGVtKSA9PiB6aXAuZmlsZShpdGVtLm5hbWUsIGl0ZW0uYmxvYikpXG4gIGNvbnN0IGJsb2IgPSBhd2FpdCB6aXAuZ2VuZXJhdGVBc3luYyh7IHR5cGU6ICdibG9iJyB9KVxuICB3aW5kb3cuc2F2ZUFzKGJsb2IsIGAke3NsdWcoc2NyZWVuc1swXS5wcm9qZWN0TmFtZSl9LnppcGApXG59XG4iLCAiaW1wb3J0IHsgYnVpbGRSZXZpZXdQcm9tcHQsIHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdQYW5lbCh7XG4gIHByb2plY3QsXG4gIHNlbGVjdGlvbnMsXG4gIG11bHRpU2VsZWN0LFxuICBpdGVtcyxcbiAgb25Ub2dnbGVNdWx0aVNlbGVjdCxcbiAgb25TZWxlY3RFbGVtZW50LFxuICBvbkhvdmVyRWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4QlwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWItc2VwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iXCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YW5jZXN0b3Iuc2VsZWN0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5jZXN0b3IubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3RvclwiPntzZWxlY3RlZC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZC5jdXJyZW50VGV4dCA/IChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY3VycmVudC10ZXh0XCI+XHU1RjUzXHU1MjREXHVGRjFBe3NlbGVjdGVkLmN1cnJlbnRUZXh0fTwvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTRGRUVcdTY1MzlcdTdDN0JcdTU3OEI8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1zZWxlY3RcIiB2YWx1ZT17dHlwZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0VHlwZShldmVudC50YXJnZXQudmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhSRVZJRVdfVFlQRV9MQUJFTFMpLm1hcCgoW3ZhbHVlLCBsYWJlbF0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1vcHRpb25cIiB2YWx1ZT17dmFsdWV9IGtleT17dmFsdWV9PntsYWJlbH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+e2luc3RydWN0aW9uTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWluc3RydWN0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbnN0cnVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0eXBlID09PSAnb3JkZXInID8gJ1x1NEY4Qlx1NTk4Mlx1RkYxQVx1NzlGQlx1NTJBOFx1NTIzMFx1OEJBMlx1NTM1NVx1NjQ1OFx1ODk4MVx1NEU0Qlx1NTQwRScgOiAnXHU2M0NGXHU4RkYwXHU1RTBDXHU2NzFCIEFJIFx1NTk4Mlx1NEY1NVx1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbnN0cnVjdGlvbihldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYWRkXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWluc3RydWN0aW9uLnRyaW0oKSAmJiB0eXBlICE9PSAncmVtb3ZlJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthZGRJdGVtfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1MkEwXHU1MTY1XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjA4e3NlbGVjdGlvbnMubGVuZ3RofSBcdTRFMkFcdTgyODJcdTcwQjlcdUZGMDlcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU0RTJEXHU3Njg0XHU4MjgyXHU3MEI5XHU1RjAwXHU1OUNCXHU4QkM0XHU4QkJBXHUzMDAyXHU3MEI5XHU1MUZCXHU5NzYyXHU1MzA1XHU1QzUxXHU1M0VGXHU1MjA3XHU2MzYyXHU1MjMwXHU3MjM2XHU3RUE3XHU3RUM0XHU0RUY2XHUzMDAyPC9wPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1PC9oMj5cbiAgICAgICAgICB7aXRlbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbXNcIj5cbiAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1cIiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tdGl0bGVcIj57aW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1tpdGVtLnR5cGVdfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGl0ZW0pLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuc2VsZWN0b3IpLmpvaW4oJ1x1MzAwMScpfVxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWluc3RydWN0aW9uXCI+e2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWRlbGV0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZUl0ZW0oaXRlbS5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ4XHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uIHdmLXJldmlldy1wcm9tcHQtc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2NzAwXHU3RUM4IFByb21wdDwvaDI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3JlZ2VuZXJhdGV9Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9tcHREaXJ0eSA/IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYW51YWxcIj5Qcm9tcHQgXHU1REYyXHU2MjRCXHU1MkE4XHU0RkVFXHU2NTM5XHVGRjFCXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU0RjFBXHU4OTg2XHU3NkQ2XHU2MjRCXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwcm9tcHR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIHNldFByb21wdERpcnR5KHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNvcHlcIiBvbkNsaWNrPXtjb3B5UHJvbXB0fT5cbiAgICAgICAgICAgIHtjb3BpZWQgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTU5MERcdTUyMzYgUHJvbXB0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImltcG9ydCB7IHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBzYW1lUG9zaXRpb25zKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGxlZnQuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgb3RoZXIgPSByaWdodFtpbmRleF1cbiAgICByZXR1cm4gaXRlbS5rZXkgPT09IG90aGVyLmtleVxuICAgICAgJiYgaXRlbS5pdGVtID09PSBvdGhlci5pdGVtXG4gICAgICAmJiBpdGVtLml0ZW1JbmRleCA9PT0gb3RoZXIuaXRlbUluZGV4XG4gICAgICAmJiBpdGVtLmxlZnQgPT09IG90aGVyLmxlZnRcbiAgICAgICYmIGl0ZW0udG9wID09PSBvdGhlci50b3BcbiAgfSlcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBjbGlwKSB7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChyZWN0LmxlZnQsIGNsaXAubGVmdClcbiAgY29uc3QgcmlnaHQgPSBNYXRoLm1pbihyZWN0LnJpZ2h0LCBjbGlwLnJpZ2h0KVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChyZWN0LnRvcCwgY2xpcC50b3ApXG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWluKHJlY3QuYm90dG9tLCBjbGlwLmJvdHRvbSlcbiAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgaXRlbXMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgcmV2aWV3VGFyZ2V0cyhpdGVtKS5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBsZXQgZWxlbWVudCA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGVsZW1lbnQgPSBib2FyZC5xdWVyeVNlbGVjdG9yKHRhcmdldC5zZWxlY3RvcilcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudD8uaXNDb25uZWN0ZWQpIHJldHVyblxuICAgICAgY29uc3Qgc2NyZWVuQ29udGVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JylcbiAgICAgIGlmICghc2NyZWVuQ29udGVudCkgcmV0dXJuXG4gICAgICBjb25zdCB2aXNpYmxlID0gaW50ZXJzZWN0UmVjdChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBzY3JlZW5Db250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgICAgaWYgKCF2aXNpYmxlKSByZXR1cm5cbiAgICAgIGNvbnN0IGJhc2VMZWZ0ID0gTWF0aC5yb3VuZCh2aXNpYmxlLnJpZ2h0IC0gYm9hcmRSZWN0LmxlZnQpXG4gICAgICBjb25zdCBiYXNlVG9wID0gTWF0aC5yb3VuZCh2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3ApXG4gICAgICBjb25zdCBvdmVybGFwQ291bnQgPSBwb3NpdGlvbnMuZmlsdGVyKFxuICAgICAgICAocG9zaXRpb24pID0+IE1hdGguYWJzKHBvc2l0aW9uLmJhc2VMZWZ0IC0gYmFzZUxlZnQpIDwgMiAmJiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlVG9wIC0gYmFzZVRvcCkgPCAyLFxuICAgICAgKS5sZW5ndGhcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAga2V5OiBgJHtpdGVtLmlkfToke3RhcmdldEluZGV4fWAsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1JbmRleCxcbiAgICAgICAgdGFyZ2V0SW5kZXgsXG4gICAgICAgIGJhc2VMZWZ0LFxuICAgICAgICBiYXNlVG9wLFxuICAgICAgICBsZWZ0OiBiYXNlTGVmdCArIG92ZXJsYXBDb3VudCAqIDE1LFxuICAgICAgICB0b3A6IGJhc2VUb3AsXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TWFya2Vycyh7IGJvYXJkUmVmLCBpdGVtcywgb25PcGVuUGFuZWwgfSkge1xuICBjb25zdCBbcG9zaXRpb25zLCBzZXRQb3NpdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFthY3RpdmVLZXksIHNldEFjdGl2ZUtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBmcmFtZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IHJlc29sdmVQb3NpdGlvbnMoYm9hcmRSZWYuY3VycmVudCwgaXRlbXMpXG4gICAgc2V0UG9zaXRpb25zKChjdXJyZW50KSA9PiBzYW1lUG9zaXRpb25zKGN1cnJlbnQsIG5leHQpID8gY3VycmVudCA6IG5leHQpXG4gIH0sIFtib2FyZFJlZiwgaXRlbXNdKVxuXG4gIGNvbnN0IHNjaGVkdWxlUmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgZnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZnJhbWVSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIHJlZnJlc2goKVxuICAgIH0pXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3Qoc2NoZWR1bGVSZWZyZXNoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtzY2hlZHVsZVJlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZUtleSAmJiAhcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSkpIHNldEFjdGl2ZUtleShudWxsKVxuICB9LCBbYWN0aXZlS2V5LCBwb3NpdGlvbnNdKVxuXG4gIGNvbnN0IGFjdGl2ZSA9IHBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpXG4gIGNvbnN0IGJvYXJkV2lkdGggPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRXaWR0aCB8fCAwXG4gIGNvbnN0IGJvYXJkSGVpZ2h0ID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0IHx8IDBcbiAgY29uc3QgYnViYmxlTGVmdCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUubGVmdCArIDE2LCBib2FyZFdpZHRoIC0gMzM2KSkgOiAwXG4gIGNvbnN0IGJ1YmJsZVRvcCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUudG9wICsgMjQsIGJvYXJkSGVpZ2h0IC0gMTgwKSkgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXJzXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NjgwN1x1OEJCMFwiPlxuICAgICAge3Bvc2l0aW9ucy5tYXAoKHBvc2l0aW9uKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2FjdGl2ZUtleSA9PT0gcG9zaXRpb24ua2V5ID8gJ3dmLXJldmlldy1tYXJrZXIgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbWFya2VyJ31cbiAgICAgICAgICBrZXk9e3Bvc2l0aW9uLmtleX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cdUZGMUEke1JFVklFV19UWVBFX0xBQkVMU1twb3NpdGlvbi5pdGVtLnR5cGVdfWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogcG9zaXRpb24ubGVmdCwgdG9wOiBwb3NpdGlvbi50b3AgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRBY3RpdmVLZXkoKGN1cnJlbnQpID0+IGN1cnJlbnQgPT09IHBvc2l0aW9uLmtleSA/IG51bGwgOiBwb3NpdGlvbi5rZXkpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAge2FjdGl2ZSA/IChcbiAgICAgICAgPGFzaWRlXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyXCJcbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBidWJibGVMZWZ0LCB0b3A6IGJ1YmJsZVRvcCB9fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHthY3RpdmUuaXRlbUluZGV4ICsgMX1gfVxuICAgICAgICA+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10aXRsZVwiPlxuICAgICAgICAgICAgICB7YWN0aXZlLml0ZW1JbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2FjdGl2ZS5pdGVtLnR5cGVdfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1jbG9zZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVLZXkobnVsbCl9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1pbnN0cnVjdGlvblwiPlxuICAgICAgICAgICAge2FjdGl2ZS5pdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10YXJnZXRzXCI+XG4gICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhhY3RpdmUuaXRlbSkubWFwKCh0YXJnZXQpID0+IChcbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXNlbGVjdG9yXCIga2V5PXt0YXJnZXQuc2VsZWN0b3J9Pnt0YXJnZXQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLW1vcmVcIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEFjdGl2ZUtleShudWxsKVxuICAgICAgICAgICAgICBvbk9wZW5QYW5lbD8uKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgXHU2N0U1XHU3NzBCXHU2NkY0XHU1OTFBXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImNvbnN0IExBVU5DSEVSX1NJWkUgPSA0OFxuY29uc3QgTEFVTkNIRVJfTUFSR0lOID0gMjBcbmNvbnN0IERSQUdfVEhSRVNIT0xEID0gNFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW4pLCBNYXRoLm1heChtaW4sIG1heCkpXG59XG5cbmZ1bmN0aW9uIGNsYW1wUG9zaXRpb24oYm9hcmQsIHBvc2l0aW9uKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBwb3NpdGlvblxuICByZXR1cm4ge1xuICAgIHg6IGNsYW1wKHBvc2l0aW9uLngsIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgICB5OiBjbGFtcChwb3NpdGlvbi55LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRQb3NpdGlvbihib2FyZCkge1xuICByZXR1cm4gY2xhbXBQb3NpdGlvbihib2FyZCwge1xuICAgIHg6IGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgICB5OiBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkUG9zaXRpb24oc3RvcmFnZUtleSkge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSkpXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueCkgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlPy55KSkgcmV0dXJuIHZhbHVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIGxvY2FsU3RvcmFnZSBtYXkgYmUgdW5hdmFpbGFibGUgZm9yIGEgZGlyZWN0bHkgb3BlbmVkIGxvY2FsIGZpbGUuXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHBvc2l0aW9uKSlcbiAgfSBjYXRjaCB7XG4gICAgLy8gS2VlcGluZyB0aGUgbGF1bmNoZXIgZHJhZ2dhYmxlIGlzIG1vcmUgaW1wb3J0YW50IHRoYW4gcGVyc2lzdGVuY2UuXG4gIH1cbn1cblxuZnVuY3Rpb24gQ29tbWVudEljb24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNNSA0LjVoMTRhMiAyIDAgMCAxIDIgMnY4YTIgMiAwIDAgMS0yIDJoLTZsLTQuNSAzdi0zSDVhMiAyIDAgMCAxLTItMnYtOGEyIDIgMCAwIDEgMi0yWlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTcuNSAxMC41aDlcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdMYXVuY2hlcih7IGJvYXJkUmVmLCBjb3VudCwgcHJvamVjdE5hbWUsIG9uT3BlbiB9KSB7XG4gIGNvbnN0IHN0b3JhZ2VLZXkgPSBgd2YtcmV2aWV3LWxhdW5jaGVyLXBvc2l0aW9uOiR7cHJvamVjdE5hbWV9YFxuICBjb25zdCBbcG9zaXRpb24sIHNldFBvc2l0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcG9zaXRpb25SZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3VwcHJlc3NDbGlja1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcblxuICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0KSA9PiB7XG4gICAgY29uc3QgY2xhbXBlZCA9IGNsYW1wUG9zaXRpb24oYm9hcmRSZWYuY3VycmVudCwgbmV4dClcbiAgICBwb3NpdGlvblJlZi5jdXJyZW50ID0gY2xhbXBlZFxuICAgIHNldFBvc2l0aW9uKGNsYW1wZWQpXG4gICAgcmV0dXJuIGNsYW1wZWRcbiAgfSwgW2JvYXJkUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGJvYXJkID0gYm9hcmRSZWYuY3VycmVudFxuICAgIGlmICghYm9hcmQpIHJldHVybiB1bmRlZmluZWRcbiAgICB1cGRhdGVQb3NpdGlvbihyZWFkUG9zaXRpb24oc3RvcmFnZUtleSkgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcblxuICAgIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSB1cGRhdGVQb3NpdGlvbihwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG4gICAgICBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgbmV4dClcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgfSwgW2JvYXJkUmVmLCBzdG9yYWdlS2V5LCB1cGRhdGVQb3NpdGlvbl0pXG5cbiAgY29uc3QgZmluaXNoRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZHJhZy5tb3ZlZFxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAocG9zaXRpb25SZWYuY3VycmVudCkgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uUmVmLmN1cnJlbnQpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICB9XG5cbiAgaWYgKGNvdW50IDw9IDApIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtcmV2aWV3LWxhdW5jaGVyIGlzLWRyYWdnaW5nJyA6ICd3Zi1yZXZpZXctbGF1bmNoZXInfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgcmlnaHQ6IExBVU5DSEVSX01BUkdJTiwgYm90dG9tOiBMQVVOQ0hFUl9NQVJHSU4gfX1cbiAgICAgIGFyaWEtbGFiZWw9e2BcdTVDNTVcdTVGMDBcdThCQzRcdThCQkFcdUZGMENcdTUxNzEgJHtjb3VudH0gXHU2NzYxXHU0RkVFXHU2NTM5YH1cbiAgICAgIGRhdGEtdG9vbHRpcD1cIlx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQpXG4gICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZXG4gICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IERSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICBvblBvaW50ZXJDYW5jZWw9e2ZpbmlzaERyYWd9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGlmIChzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIG9uT3BlbigpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxDb21tZW50SWNvbiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvdW50fTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuIiwgImV4cG9ydCBjb25zdCBVTlNBVkVEX1JFVklFV19NRVNTQUdFID0gJ1x1NEZFRVx1NjUzOVx1NTE4NVx1NUJCOVx1NUMxQVx1NjcyQVx1NEZERFx1NUI1OFx1RkYwQ1x1NzlCQlx1NUYwMFx1OTg3NVx1OTc2Mlx1NTQwRVx1NEYxQVx1NEUyMlx1NTkzMVx1MzAwMlx1NjYyRlx1NTQyNlx1N0VFN1x1N0VFRFx1RkYxRidcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIGV2ZW50LnJldHVyblZhbHVlID0gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxuICByZXR1cm4gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIGRvd25sb2FkOiA8PjxwYXRoIGQ9XCJNMTIgM3YxMlwiIC8+PHBhdGggZD1cIm03IDEwIDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJNNSAyMWgxNFwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gJ1x1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0Rlx1N0E3QVx1NjgzQ1x1NEUzNFx1NjVGNlx1OTUwMVx1NEY0RidcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU5ODc1XHU5NzYyXHU1MTg1XHU3MEI5XHU1MUZCXHU0RTBFXHU2RURBXHU1MkE4XHU1REYyXHU3OTgxXHU3NTI4XHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyJ31cbiAgICA+XG4gICAgICA8TG9ja0ljb24gb3Blbj17aW50ZXJhY3RpdmV9IC8+XG4gICAgICA8c3Bhbj57aW50ZXJhY3RpdmUgPyAnXHU1M0VGXHU0RUE0XHU0RTkyJyA6ICdcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInfTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihlbCkge1xuICBjb25zdCByZXF1ZXN0ID0gZWwgJiYgKGVsLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGVsLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKVxuICBpZiAoIXJlcXVlc3QpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcXVlc3QuY2FsbChlbCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5mdW5jdGlvbiBleGl0Qm9hcmRGdWxsc2NyZWVuKCkge1xuICBpZiAoIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICBjb25zdCBleGl0ID0gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW5cbiAgaWYgKCFleGl0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShleGl0LmNhbGwoZG9jdW1lbnQpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcblxuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKSxcbiAgKVxuICBjb25zdCBbY2FudmFzU2NhbGUsIHNldENhbnZhc1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vU2NhbGUsIHNldERlbW9TY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1ZpZXdSZXNldEtleSwgc2V0RGVtb1ZpZXdSZXNldEtleV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBbaW50ZXJhY3RpdmUsIHNldEludGVyYWN0aXZlXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtzcGFjZUhlbGQsIHNldFNwYWNlSGVsZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hvdHNwb3RzVmlzaWJsZSwgc2V0SG90c3BvdHNWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwb3J0RXJyb3IsIHNldEV4cG9ydEVycm9yXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkSWRzLCBzZXRFeHBhbmRlZElkc10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IFtpbW1lcnNpdmUsIHNldEltbWVyc2l2ZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdQYW5lbFZpc2libGUsIHNldFJldmlld1BhbmVsVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1NlbGVjdGlvbnMsIHNldFJldmlld1NlbGVjdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtyZXZpZXdNdWx0aVNlbGVjdCwgc2V0UmV2aWV3TXVsdGlTZWxlY3RdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdJdGVtcywgc2V0UmV2aWV3SXRlbXNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IGJvYXJkUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYgPSBSZWFjdC51c2VSZWYobmV3IFNldCgpKVxuICBjb25zdCBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgY2FudmFzTG9ja2VkID0gIWludGVyYWN0aXZlIHx8IHNwYWNlSGVsZFxuICBjb25zdCBhbGxTY3JlZW5JZHMgPSBwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZClcbiAgY29uc3QgaXNEZW1vID0gbW9kZSA9PT0gJ2RlbW8nICYmIGRlbW9BdmFpbGFibGVcbiAgY29uc3QgYWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBkZW1vU2NhbGUgOiBjYW52YXNTY2FsZVxuICBjb25zdCBzZXRBY3RpdmVTY2FsZSA9IGlzRGVtbyA/IHNldERlbW9TY2FsZSA6IHNldENhbnZhc1NjYWxlXG5cbiAgY29uc3QgY2xlYXJSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoW10pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHNlbGVjdFJldmlld0VsZW1lbnQgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCwgc2NyZWVuLCBjb250ZW50Um9vdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgcHJpbWFyeSA9IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IGFjdGl2ZVNjcmVlbiA9IHNjcmVlbiB8fCBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gcHJpbWFyeT8uc2NyZWVuSWQpXG4gICAgY29uc3QgYWN0aXZlUm9vdCA9IGNvbnRlbnRSb290IHx8IHByaW1hcnk/LmNvbnRlbnRSb290XG4gICAgaWYgKCFlbGVtZW50IHx8ICFhY3RpdmVTY3JlZW4gfHwgIWFjdGl2ZVJvb3QpIHJldHVyblxuICAgIGNvbnN0IG5leHRTZWxlY3Rpb24gPSBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgYWN0aXZlUm9vdCwgYWN0aXZlU2NyZWVuKVxuICAgIGNvbnN0IGFkZGl0aXZlID0gcmV2aWV3TXVsdGlTZWxlY3QgfHwgb3B0aW9ucy5hZGRpdGl2ZVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpIHtcbiAgICAgICAgb3B0aW9ucy5yZXBsYWNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIGlmIChjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudCAmJiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50Lm1hcCgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50ID8gbmV4dFNlbGVjdGlvbiA6IGl0ZW0pXG4gICAgICB9XG4gICAgICBjb25zdCBhbHJlYWR5U2VsZWN0ZWQgPSBjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudClcbiAgICAgIGlmICghYWRkaXRpdmUpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RlZEVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudClcbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgcmV0dXJuIGFkZGl0aXZlID8gWy4uLmN1cnJlbnQsIG5leHRTZWxlY3Rpb25dIDogW25leHRTZWxlY3Rpb25dXG4gICAgfSlcbiAgfSwgW3Byb2plY3Quc2NyZWVucywgcmV2aWV3TXVsdGlTZWxlY3QsIHJldmlld1NlbGVjdGlvbnNdKVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudCkpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNsb3NlUmV2aWV3ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld0VuYWJsZWQoZmFsc2UpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbl0pXG5cbiAgY29uc3QgaG92ZXJSZXZpZXdCcmVhZGNydW1iID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBlbGVtZW50IHx8IG51bGxcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgY29uc3QgdG9nZ2xlUmV2aWV3ID0gKCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkKSB7XG4gICAgICBjbG9zZVJldmlldygpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICB9XG5cbiAgY29uc3Qgb3BlblJldmlld1BhbmVsID0gKCkgPT4ge1xuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbiA9ICgpID0+IHtcbiAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkge1xuICAgICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihib2FyZFJlZi5jdXJyZW50KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSAhPT0gJ1NwYWNlJyB8fCBldmVudC5yZXBlYXQpIHJldHVyblxuICAgICAgY29uc3QgdGFnID0gZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC50YWdOYW1lXG4gICAgICBpZiAodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1RFWFRBUkVBJyB8fCB0YWcgPT09ICdTRUxFQ1QnIHx8IGV2ZW50LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdkZW1vJykgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9LCBbbW9kZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzeW5jID0gKCkgPT4gc2V0QnJvd3NlckZ1bGxzY3JlZW4oISFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWltbWVyc2l2ZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRXNjYXBlJykgcmV0dXJuXG4gICAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBzZXRJbW1lcnNpdmUoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtpbW1lcnNpdmVdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU3NTNCXHU2NzdGXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnZGVtbycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2RlbW8nKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NkYxNFx1NzkzQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi12aWV3cG9ydC1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTg5QzZcdTUzRTNcIj5cbiAgICAgICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5tYXAoKGtleSkgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3ZpZXdwb3J0S2V5ID09PSBrZXkgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld3BvcnRLZXkoa2V5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7VklFV1BPUlRfTEFCRUxTW2tleV0gfHwga2V5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnIHx8ICFkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17KCkgPT4gc2V0Q2FudmFzU2NhbGUoMSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0RGVtb1ZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlUmV2aWV3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdUZGMUFcdTk2OTBcdTg1Q0ZcdTk4NzZcdTY4MEZcdTRFMEVcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBjbG9zZVJldmlldygpXG4gICAgICAgICAgICAgIHNldEltbWVyc2l2ZSh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImZ1bGxzY3JlZW5cIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU1QzRGPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4JyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImV4cGFuZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTVDNTVcdTVGMDA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTY1MzZcdThENzdcdTUxNjhcdTkwRTgnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbGxhcHNlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NjUzNlx1OEQ3Nzwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtdG9vbGJhci1pY29uLWJ1dHRvbi0tcHJpbWFyeVwiXG4gICAgICAgICAgICBkaXNhYmxlZD17ZXhwb3J0aW5nIHx8IHNlbGVjdGVkSWRzLnNpemUgPT09IDAgfHwgbW9kZSA9PT0gJ2RlbW8nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17ZXhwb3J0aW5nID8gJ1x1NkI2M1x1NTcyOFx1NUJGQ1x1NTFGQScgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEXHVGRjA4JHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVcdUZGMDlgfVxuICAgICAgICAgICAgdGl0bGU9e2V4cG9ydGluZyA/ICdcdTVCRkNcdTUxRkFcdTRFMkRcdTIwMjYnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RCAke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBvcnRJZHMoWy4uLnNlbGVjdGVkSWRzXSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJkb3dubG9hZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj57ZXhwb3J0aW5nID8gJ1x1MjAyNicgOiBzZWxlY3RlZElkcy5zaXplfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAge2V4cG9ydEVycm9yID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXhwb3J0RXJyb3J9PC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge2ltbWVyc2l2ZSA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY2hyb21lXCIgcm9sZT1cInRvb2xiYXJcIiBhcmlhLWxhYmVsPVwiXHU2Qzg5XHU2RDc4XHU2M0E3XHU0RUY2XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17ZXhpdEltbWVyc2l2ZX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgIHRpdGxlPXticm93c2VyRnVsbHNjcmVlbiA/ICdcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVCcm93c2VyRnVsbHNjcmVlbn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGIE9OJyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgIHNjYWxlPXthY3RpdmVTY2FsZX1cbiAgICAgICAgICAgIHNldFNjYWxlPXtzZXRBY3RpdmVTY2FsZX1cbiAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge21vZGUgPT09ICdjYW52YXMnID8gKFxuICAgICAgICA8Q2FudmFzTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzZWxlY3RlZElkcz17c2VsZWN0ZWRJZHN9XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJZHM9e3NldFNlbGVjdGVkSWRzfVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIG9uRXhwb3J0SWRzPXtleHBvcnRJZHN9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxEZW1vTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgaG90c3BvdHNWaXNpYmxlPXtob3RzcG90c1Zpc2libGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgIHZpZXdSZXNldEtleT17ZGVtb1ZpZXdSZXNldEtleX1cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtyZXZpZXdFbmFibGVkID8gKFxuICAgICAgICA8UmV2aWV3TWFya2VycyBib2FyZFJlZj17Ym9hcmRSZWZ9IGl0ZW1zPXtyZXZpZXdJdGVtc30gb25PcGVuUGFuZWw9e29wZW5SZXZpZXdQYW5lbH0gLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3UGFuZWxWaXNpYmxlID8gKFxuICAgICAgICA8UmV2aWV3UGFuZWxcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNlbGVjdGlvbnM9e3Jldmlld1NlbGVjdGlvbnN9XG4gICAgICAgICAgbXVsdGlTZWxlY3Q9e3Jldmlld011bHRpU2VsZWN0fVxuICAgICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgICBvblRvZ2dsZU11bHRpU2VsZWN0PXsoKSA9PiBzZXRSZXZpZXdNdWx0aVNlbGVjdCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgb25TZWxlY3RFbGVtZW50PXsoZWxlbWVudCkgPT4gc2VsZWN0UmV2aWV3RWxlbWVudChlbGVtZW50LCBudWxsLCBudWxsLCB7XG4gICAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIG9uSG92ZXJFbGVtZW50PXtob3ZlclJldmlld0JyZWFkY3J1bWJ9XG4gICAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkNsZWFyU2VsZWN0aW9uPXtjbGVhclJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkFkZEl0ZW09e2FkZFJldmlld0l0ZW19XG4gICAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICAgIG9uQ2xvc2U9e2Nsb3NlUmV2aWV3fVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJmdW5jdGlvbiBmYWlsKHBhdGgsIG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke3BhdGh9ICR7bWVzc2FnZX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KHByb2plY3QpIHtcbiAgaWYgKCFwcm9qZWN0IHx8IHR5cGVvZiBwcm9qZWN0ICE9PSAnb2JqZWN0JykgZmFpbCgncHJvamVjdCcsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGlmICghcHJvamVjdC52aWV3cG9ydHMgfHwgdHlwZW9mIHByb2plY3Qudmlld3BvcnRzICE9PSAnb2JqZWN0Jykge1xuICAgIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHByb2plY3Qudmlld3BvcnRzKVxuICBpZiAodmlld3BvcnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSB2aWV3cG9ydCcpXG4gIGZvciAoY29uc3QgW2tleSwgdmlld3BvcnRdIG9mIHZpZXdwb3J0RW50cmllcykge1xuICAgIGlmICghdmlld3BvcnQgfHwgdHlwZW9mIHZpZXdwb3J0ICE9PSAnb2JqZWN0JykgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9YCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbiBvZiBbJ3dpZHRoJywgJ2hlaWdodCddKSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWV3cG9ydFtkaW1lbnNpb25dKSB8fCB2aWV3cG9ydFtkaW1lbnNpb25dIDw9IDApIHtcbiAgICAgICAgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9LiR7ZGltZW5zaW9ufWAsICdtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHByb2plY3QuZGVmYXVsdFZpZXdwb3J0KSkge1xuICAgIGZhaWwoJ3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0JywgYHJlZmVyZW5jZXMgbWlzc2luZyB2aWV3cG9ydCBcIiR7cHJvamVjdC5kZWZhdWx0Vmlld3BvcnR9XCJgKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LnNjcmVlbnMpIHx8IHByb2plY3Quc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICBmYWlsKCdwcm9qZWN0LnNjcmVlbnMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzY3JlZW4nKVxuICB9XG5cbiAgY29uc3QgaWRzID0gbmV3IFNldCgpXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LnNjcmVlbnNbJHtpbmRleH1dYFxuICAgIGlmICghc2NyZWVuIHx8IHR5cGVvZiBzY3JlZW4gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uaWQgIT09ICdzdHJpbmcnIHx8ICEvXlthLXowLTktXSskLy50ZXN0KHNjcmVlbi5pZCkpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBtYXRjaCAvXlthLXowLTktXSskLycpXG4gICAgfVxuICAgIGlmIChpZHMuaGFzKHNjcmVlbi5pZCkpIGZhaWwoYCR7cGF0aH0uaWRgLCBgaXMgZHVwbGljYXRlIFwiJHtzY3JlZW4uaWR9XCJgKVxuICAgIGlkcy5hZGQoc2NyZWVuLmlkKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmNvbXBvbmVudCAhPT0gJ2Z1bmN0aW9uJykgZmFpbChgJHtwYXRofS5jb21wb25lbnRgLCAnbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVuLmxpbmtzKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5saW5rc2AsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gIH0pXG5cbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgc2NyZWVuSW5kZXgpID0+IHtcbiAgICBzY3JlZW4ubGlua3MuZm9yRWFjaCgodGFyZ2V0LCBsaW5rSW5kZXgpID0+IHtcbiAgICAgIGlmICghaWRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgYHByb2plY3Quc2NyZWVuc1ske3NjcmVlbkluZGV4fV0ubGlua3NbJHtsaW5rSW5kZXh9XWAsXG4gICAgICAgICAgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke3RhcmdldH1cImAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5cbmV4cG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQsIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4vZmxvdy10YXJnZXQuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKSB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtZmxvdy10byc6IHRvIHx8IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0bykgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgICAgaWYgKG9uQ2xpY2spIG9uQ2xpY2soZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgdG8pIG5hdmlnYXRlKHRvKVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmZ1bmN0aW9uIGpvaW5DbGFzcyhiYXNlLCBleHRyYSkge1xuICByZXR1cm4gZXh0cmEgPyBgJHtiYXNlfSAke2V4dHJhfWAgOiBiYXNlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICBjb2x1bW5zICYmIHR5cGVvZiBjb2x1bW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjb2x1bW5zKVxuICAgICAgPyBjb2x1bW5zW3ZpZXdwb3J0S2V5XVxuICAgICAgOiBjb2x1bW5zXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDApIHJldHVybiBgcmVwZWF0KCR7dmFsdWV9LCBtaW5tYXgoMCwgMWZyKSlgXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSkgcmV0dXJuIHZhbHVlXG4gIHRocm93IG5ldyBFcnJvcignR3JpZCBjb2x1bW5zIG11c3QgcmVzb2x2ZSB0byBhIHBvc2l0aXZlIGludGVnZXIgb3Igbm9uLWVtcHR5IENTUyBzdHJpbmcnKVxufVxuXG5mdW5jdGlvbiB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZVN1ZmZpeDogdG8gPyAnIHdmLWludGVyYWN0aXZlJyA6ICcnLFxuICAgIHJvbGU6IHRvID8gJ2xpbmsnIDogcmVzdC5yb2xlLFxuICAgIHRhYkluZGV4OiB0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleCxcbiAgICBmbG93LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3goeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWJveCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e3sgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSb3coe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLXJvdyR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbHVtbih7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtY29sdW1uJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCBjb2x1bW5zID0gMSwgZ2FwID0gMCwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IHZpZXdwb3J0S2V5IH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSksXG4gICAgZ2FwLFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWdyaWQke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRpbmcoeyBsZXZlbCA9IDIsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHRhZyA9IGBoJHtNYXRoLm1pbig2LCBNYXRoLm1heCgxLCBsZXZlbCkpfWBcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnLCB7IGNsYXNzTmFtZTogYHdmLWhlYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KHsgYXMgPSAncCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7IGNsYXNzTmFtZTogYHdmLXRleHQgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkKHsgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNhcmQgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYWRnZSh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B3Zi1iYWRnZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdmF0YXIoeyBzaXplID0gNDAsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWF2YXRhciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGxhY2Vob2xkZXIoe1xuICB3aWR0aCA9ICcxMDAlJyxcbiAgaGVpZ2h0ID0gMTYwLFxuICBib3JkZXJSYWRpdXMgPSAwLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgc3R5bGUsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1pbWFnZS1wbGFjZWhvbGRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0LCBib3JkZXJSYWRpdXMsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wbGFjZWhvbGRlci1ibG9ja1wiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHsgdG8sIG9uQ2xpY2ssIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYnV0dG9uIHdmLWJ1dHRvbi0ke3ZhcmlhbnR9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRJbnB1dCh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxpbnB1dCBjbGFzc05hbWU9e2B3Zi1pbnB1dCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gdHlwZT1cInRleHRcIiB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRBcmVhKHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHRleHRhcmVhIGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXRleHRhcmVhICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c2VsZWN0IGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXNlbGVjdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NlbGVjdD5cbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHsgdHlwZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtY2hvaWNlICR7Y2xhc3NOYW1lfWAudHJpbSgpfT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtaW5wdXRcIiB0eXBlPXt0eXBlfSB7Li4ucmVzdH0gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNob2ljZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3gocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cImNoZWNrYm94XCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFkaW8ocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cInJhZGlvXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlKHsgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJzd2l0Y2hcIlxuICAgICAgYXJpYS1jaGVja2VkPXtjaGVja2VkfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtdG9nZ2xlICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBvbkNoYW5nZT8uKCFjaGVja2VkLCBldmVudCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdHJhY2tcIj48c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdGh1bWJcIiAvPjwvc3Bhbj5cbiAgICAgIHtsYWJlbCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybUZpZWxkKHsgbGFiZWwsIGh0bWxGb3IsIGhpbnQsIGVycm9yLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZm9ybS1maWVsZCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWZpZWxkLWxhYmVsXCIgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBjcmVhdGVGbG93UHJvcHMgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBQYWdlSGVhZGVyKHsgdGl0bGUsIHRpdGxlSWQsIHN1YnRpdGxlLCBzdWJ0aXRsZUlkLCBhY3Rpb25zLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGhlYWRlciBjbGFzc05hbWU9e2B3Zi1wYWdlLWhlYWRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWhlYWRlci1jb3B5XCI+XG4gICAgICAgIDxoMSBpZD17dGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS10aXRsZVwiPnt0aXRsZX08L2gxPlxuICAgICAgICB7c3VidGl0bGUgPyA8cCBpZD17c3VidGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3A+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge2FjdGlvbnMgPyA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtYWN0aW9uc1wiPnthY3Rpb25zfTwvZGl2PiA6IG51bGx9XG4gICAgPC9oZWFkZXI+XG4gIClcbn1cblxuZnVuY3Rpb24gTmF2aWdhdGlvbkxpc3QoeyBhcywgaXRlbXMsIGFjdGl2ZUlkLCBjbGFzc05hbWUsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBhcyxcbiAgICB7IGNsYXNzTmFtZSwgLi4ucmVzdCB9LFxuICAgIGl0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLW5hdi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtbmF2LWl0ZW0nfVxuICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICkpLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaWRlTmF2KHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8TmF2aWdhdGlvbkxpc3RcbiAgICAgIGFzPVwibmF2XCJcbiAgICAgIGl0ZW1zPXtpdGVtc31cbiAgICAgIGFjdGl2ZUlkPXthY3RpdmVJZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXNpZGUtbmF2ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFiQmFyKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLXRhYi1iYXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLXRhYi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtdGFiLWl0ZW0nfVxuICAgICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCcmVhZGNydW1icyh7IGl0ZW1zID0gW10sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLWJyZWFkY3J1bWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSBhcmlhLWxhYmVsPVwiQnJlYWRjcnVtYnNcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtgJHtpdGVtLmxhYmVsfS0ke2luZGV4fWB9PlxuICAgICAgICAgIHtpbmRleCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWRpdmlkZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2l0ZW0udG8gPyAoXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItbGlua1wiIHR5cGU9XCJidXR0b25cIiB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfT5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1jdXJyZW50XCI+e2l0ZW0ubGFiZWx9PC9zcGFuPn1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbi8qKiBcdTc5RkJcdTUyQThcdTdBRUZcdTY1NzRcdTVDNEZcdTU4RjNcdUZGMUFcdTUxODVcdTVCQjlcdTUzM0FcdTUzRUZcdTZFREFcdUZGMENUYWJCYXIgXHU4RDM0XHU1RTk1XHUzMDAydGFicyAvIGFjdGl2ZUlkIFx1NEUwRSBUYWJCYXIgXHU3NkY4XHU1NDBDXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlU2hlbGwoeyBjaGlsZHJlbiwgdGFicyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbW9iaWxlLXNoZWxsICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJ3Zi1tb2JpbGUtc2hlbGwtYm9keVwiPntjaGlsZHJlbn08L21haW4+XG4gICAgICB7dGFicy5sZW5ndGggPiAwID8gPFRhYkJhciBpdGVtcz17dGFic30gYWN0aXZlSWQ9e2FjdGl2ZUlkfSAvPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQ2VsbCh7IHRvLCBvbkNsaWNrLCB0aXRsZSwgc3VidGl0bGUsIHZhbHVlLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jZWxsICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2VsbC1tYWluXCI+XG4gICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtY2VsbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAge3N1YnRpdGxlID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgICB7dmFsdWUgIT09IHVuZGVmaW5lZCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtdmFsdWVcIj57dmFsdWV9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERhdGFUYWJsZSh7IGNvbHVtbnMgPSBbXSwgcm93cyA9IFtdLCBnZXRSb3dLZXksIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYmxlLXdyYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3Zi10YWJsZVwiPlxuICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZFwiPlxuICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkZXItcm93XCI+XG4gICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGluZ1wiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9Pntjb2x1bW4ubGFiZWx9PC90aD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keSBjbGFzc05hbWU9XCJ3Zi10YWJsZS1ib2R5XCI+XG4gICAgICAgICAge3Jvd3MubWFwKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dLZXkgPSBnZXRSb3dLZXkgPyBnZXRSb3dLZXkocm93KSA6IHJvdy5pZCB8fCBpbmRleFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLXJvd1wiIGRhdGEtd2Yta2V5PXtyb3dLZXl9IGtleT17cm93S2V5fT5cbiAgICAgICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWNlbGxcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT5cbiAgICAgICAgICAgICAgICAgICAge2NvbHVtbi5yZW5kZXIgPyBjb2x1bW4ucmVuZGVyKHJvd1tjb2x1bW4ua2V5XSwgcm93KSA6IHJvd1tjb2x1bW4ua2V5XX1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJzKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIG9uQ2hhbmdlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwidGFibGlzdFwiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRhYi1jb250cm9sXCJcbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpdGVtLmlkID09PSBhY3RpdmVJZH1cbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2U/LihpdGVtLmlkKX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGVwcyh7XG4gIGl0ZW1zID0gW10sXG4gIGN1cnJlbnQgPSAwLFxuICBkaXJlY3Rpb24gPSAnaG9yaXpvbnRhbCcsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHZlcnRpY2FsID0gZGlyZWN0aW9uID09PSAndmVydGljYWwnXG4gIHJldHVybiAoXG4gICAgPG9sXG4gICAgICBjbGFzc05hbWU9e2B3Zi1zdGVwcyAke3ZlcnRpY2FsID8gJ3dmLXN0ZXBzLXZlcnRpY2FsJyA6ICd3Zi1zdGVwcy1ob3Jpem9udGFsJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBpbmRleCA8IGN1cnJlbnQgPyAnZG9uZScgOiBpbmRleCA9PT0gY3VycmVudCA/ICdjdXJyZW50JyA6ICd0b2RvJ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2B3Zi1zdGVwcy1pdGVtIHdmLXN0ZXBzLWl0ZW0tJHtzdGF0dXN9YH0ga2V5PXtpdGVtLmlkIHx8IGl0ZW0ubGFiZWwgfHwgaW5kZXh9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcC1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAge3N0YXR1cyA9PT0gJ2RvbmUnID8gbnVsbCA6IGluZGV4ICsgMX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7aW5kZXggPCBpdGVtcy5sZW5ndGggLSAxID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGluZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICB7aXRlbS5kZXNjcmlwdGlvbiA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWRlc2NcIj57aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvb2w+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVtcHR5U3RhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGFjdGlvbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZW1wdHktc3RhdGUgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWVtcHR5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge3RpdGxlID8gPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1lbXB0eS10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz4gOiBudWxsfVxuICAgICAge2Rlc2NyaXB0aW9uID8gPHAgY2xhc3NOYW1lPVwid2YtZW1wdHktZGVzY1wiPntkZXNjcmlwdGlvbn08L3A+IDogbnVsbH1cbiAgICAgIHthY3Rpb24gPyA8ZGl2IGNsYXNzTmFtZT1cIndmLWVtcHR5LWFjdGlvblwiPnthY3Rpb259PC9kaXY+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7IE1vYmlsZVNoZWxsIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgdXNlU2NyZWVuSWQgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5cbmNvbnN0IHRhYnMgPSBbXG4gIHsgbGFiZWw6ICdcdTk5OTZcdTk4NzUnLCB0bzogJ2hvbWUnIH0sXG4gIHsgbGFiZWw6ICdcdTc0MDZcdThENTQnLCB0bzogJ2NsYWltcycgfSxcbiAgeyBsYWJlbDogJ1x1NjIxMVx1NzY4NCcsIHRvOiAncHJvZmlsZScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZUxheW91dCh7IGNoaWxkcmVuIH0pIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSB1c2VTY3JlZW5JZCgpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZVNoZWxsIGNsYXNzTmFtZT1cImNsYWltcy1zaGVsbCBjbGFpbXMtbGF5b3V0XCIgdGFicz17dGFic30gYWN0aXZlSWQ9e3NjcmVlbklkfSBhcmlhLWxhYmVsPVwiXHU3NDA2XHU4RDU0XHU1RTk0XHU3NTI4XCI+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Nb2JpbGVTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2hlY2tib3gsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBIZWFkaW5nLFxuICBTZWxlY3QsXG4gIFN0ZXBzLFxuICBUZXh0QXJlYSxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBDbGFpbUFwcGx5U2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiY2xhaW0tYXBwbHktcGFnZVwiIGdhcD17MTZ9IGNsYXNzTmFtZT1cImNsYWltcy1wYWdlIGNsYWltLWFwcGx5X19wYWdlXCI+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwiY2xhaW0tYXBwbHktdGl0bGVcIiBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fdGl0bGVcIiBsZXZlbD17MX0+XHU3NDA2XHU4RDU0XHU3NTMzXHU4QkY3PC9IZWFkaW5nPlxuICAgICAgICA8U3RlcHNcbiAgICAgICAgICBpZD1cImNsYWltLWFwcGx5LXN0ZXBzXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fc3RlcHNcIlxuICAgICAgICAgIGN1cnJlbnQ9ezB9XG4gICAgICAgICAgaXRlbXM9e1tcbiAgICAgICAgICAgIHsgaWQ6ICdmb3JtJywgbGFiZWw6ICdcdTU3RkFcdTY3MkNcdTRGRTFcdTYwNkYnIH0sXG4gICAgICAgICAgICB7IGlkOiAnbWF0ZXJpYWxzJywgbGFiZWw6ICdcdThENDRcdTY1OTlcdTRFMEFcdTRGMjAnIH0sXG4gICAgICAgICAgICB7IGlkOiAnZG9uZScsIGxhYmVsOiAnXHU2M0QwXHU0RUE0JyB9LFxuICAgICAgICAgIF19XG4gICAgICAgIC8+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwiY2xhaW0tYXBwbHlfX3R5cGUtZmllbGRcIiBsYWJlbD1cIlx1NzQwNlx1OEQ1NFx1N0M3Qlx1NTc4QlwiIGh0bWxGb3I9XCJjbGFpbS1hcHBseS10eXBlXCI+XG4gICAgICAgICAgPFNlbGVjdCBpZD1cImNsYWltLWFwcGx5LXR5cGVcIiBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fdHlwZS1zZWxlY3RcIiBkZWZhdWx0VmFsdWU9XCJtZWRpY2FsXCI+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cImNsYWltLWFwcGx5X190eXBlLW9wdGlvblwiIHZhbHVlPVwibWVkaWNhbFwiPlx1NTMzQlx1NzU5N1x1OEQzOVx1NzUyODwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fdHlwZS1vcHRpb25cIiB2YWx1ZT1cImFjY2lkZW50XCI+XHU2MTBGXHU1OTE2XHU0RjI0XHU1QkIzPC9vcHRpb24+XG4gICAgICAgICAgPC9TZWxlY3Q+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImNsYWltLWFwcGx5X19kYXRlLWZpZWxkXCIgbGFiZWw9XCJcdTUzRDFcdTc1MUZcdTY1RTVcdTY3MUZcIiBodG1sRm9yPVwiY2xhaW0tYXBwbHktZGF0ZVwiPlxuICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJjbGFpbS1hcHBseS1kYXRlXCIgY2xhc3NOYW1lPVwiY2xhaW0tYXBwbHlfX2RhdGUtaW5wdXRcIiBwbGFjZWhvbGRlcj1cIllZWVktTU0tRERcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fZGVzY3JpcHRpb24tZmllbGRcIiBsYWJlbD1cIlx1NjBDNVx1NTFCNVx1OEJGNFx1NjYwRVwiIGh0bWxGb3I9XCJjbGFpbS1hcHBseS1kZXNjcmlwdGlvblwiPlxuICAgICAgICAgIDxUZXh0QXJlYSBpZD1cImNsYWltLWFwcGx5LWRlc2NyaXB0aW9uXCIgY2xhc3NOYW1lPVwiY2xhaW0tYXBwbHlfX2Rlc2NyaXB0aW9uLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJcdTdCODBcdTg5ODFcdThCRjRcdTY2MEVcdTdFQ0ZcdThGQzdcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPENoZWNrYm94IGNsYXNzTmFtZT1cImNsYWltLWFwcGx5X19jb25maXJtYXRpb25cIiBsYWJlbD1cIlx1NjIxMVx1NURGMlx1Nzg2RVx1OEJBNFx1NEZFMVx1NjA2Rlx1NzcxRlx1NUI5RVwiIC8+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJjbGFpbS1hcHBseS1zdWJtaXRcIiBjbGFzc05hbWU9XCJjbGFpbS1hcHBseV9fc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cImNsYWltc1wiPlx1NjNEMFx1NEVBNFx1NzUzM1x1OEJGNzwvQnV0dG9uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjMuMFxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCdXR0b24sXG4gIENlbGwsXG4gIENvbHVtbixcbiAgRW1wdHlTdGF0ZSxcbiAgSGVhZGluZyxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBjbGFpbXMgPSBbXVxuXG5leHBvcnQgZnVuY3Rpb24gQ2xhaW1zU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiY2xhaW1zLWxpc3QtcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cImNsYWltcy1wYWdlIGNsYWltcy1saXN0X19wYWdlXCI+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwiY2xhaW1zLWxpc3QtdGl0bGVcIiBjbGFzc05hbWU9XCJjbGFpbXMtbGlzdF9fdGl0bGVcIiBsZXZlbD17MX0+XHU2MjExXHU3Njg0XHU3NDA2XHU4RDU0PC9IZWFkaW5nPlxuICAgICAgICB7Y2xhaW1zLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICA8RW1wdHlTdGF0ZVxuICAgICAgICAgICAgaWQ9XCJjbGFpbXMtbGlzdC1lbXB0eS1zdGF0ZVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJjbGFpbXMtbGlzdF9fZW1wdHktc3RhdGVcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTY2ODJcdTY1RTBcdTc0MDZcdThENTRcdThCQjBcdTVGNTVcIlxuICAgICAgICAgICAgZGVzY3JpcHRpb249XCJcdTY1QjBcdTc2ODRcdTc1MzNcdThCRjdcdTRGMUFcdTY2M0VcdTc5M0FcdTU3MjhcdThGRDlcdTkxQ0NcdTMwMDJcIlxuICAgICAgICAgICAgYWN0aW9uPXs8QnV0dG9uIGlkPVwiY2xhaW1zLWxpc3QtYXBwbHktYWN0aW9uXCIgY2xhc3NOYW1lPVwiY2xhaW1zLWxpc3RfX2FwcGx5LWFjdGlvblwiIHRvPVwiY2xhaW0tYXBwbHlcIj5cdTUzRDFcdThENzdcdTc0MDZcdThENTQ8L0J1dHRvbj59XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImNsYWltcy1saXN0X19yZWNvcmRzXCIgZ2FwPXswfT5cbiAgICAgICAgICAgIHtjbGFpbXMubWFwKChjbGFpbSkgPT4gKFxuICAgICAgICAgICAgICA8Q2VsbFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImNsYWltcy1saXN0X19yZWNvcmRcIlxuICAgICAgICAgICAgICAgIGRhdGEtd2Yta2V5PXtjbGFpbS5pZH1cbiAgICAgICAgICAgICAgICBrZXk9e2NsYWltLmlkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtjbGFpbS50aXRsZX1cbiAgICAgICAgICAgICAgICBzdWJ0aXRsZT17Y2xhaW0uc3RhdHVzfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtjbGFpbS5kYXRlfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICl9XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuMy4wXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIENhcmQsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgSGVhZGluZyxcbiAgUm93LFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBIb21lU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiY2xhaW1zLWhvbWUtcGFnZVwiIGdhcD17MTZ9IGNsYXNzTmFtZT1cImNsYWltcy1wYWdlIGNsYWltcy1ob21lX19wYWdlXCI+XG4gICAgICAgIDxSb3cgaWQ9XCJjbGFpbXMtaG9tZS1oZWFkZXJcIiBjbGFzc05hbWU9XCJjbGFpbXMtaG9tZV9faGVhZGVyXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2xhaW1zLWhvbWVfX2dyZWV0aW5nXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJjbGFpbXMtaG9tZV9fZXllYnJvd1wiPlx1NEUwQVx1NTM0OFx1NTk3RDwvVGV4dD5cbiAgICAgICAgICAgIDxIZWFkaW5nIGlkPVwiY2xhaW1zLWhvbWUtdGl0bGVcIiBjbGFzc05hbWU9XCJjbGFpbXMtaG9tZV9fdGl0bGVcIiBsZXZlbD17MX0+XHU3NDA2XHU4RDU0XHU2NzBEXHU1MkExPC9IZWFkaW5nPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNsYWltcy1hdmF0YXItcGxhY2Vob2xkZXIgY2xhaW1zLWhvbWVfX2F2YXRhclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDwvUm93PlxuICAgICAgICA8Q2FyZCBpZD1cImNsYWltcy1ob21lLWFwcGx5LWNhcmRcIiBjbGFzc05hbWU9XCJjbGFpbXMtaG9tZV9fYXBwbHktY2FyZFwiIHRvPVwiY2xhaW0tYXBwbHlcIj5cbiAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJjbGFpbXMtaG9tZV9fYXBwbHktdGl0bGVcIiBsZXZlbD17M30+XHU1M0QxXHU4RDc3XHU3NDA2XHU4RDU0PC9IZWFkaW5nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNsYWltcy1ob21lX19hcHBseS1kZXNjcmlwdGlvblwiPlx1NTFDNlx1NTkwN1x1Njc1MFx1NjU5OVx1NUU3Nlx1NTg2Qlx1NTE5OVx1NzUzM1x1OEJGN1x1MzAwMjwvVGV4dD5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwiY2xhaW1zLWhvbWUtc2hvcnRjdXRzXCIgY2xhc3NOYW1lPVwiY2xhaW1zLWhvbWVfX3Nob3J0Y3V0c1wiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwiY2xhaW1zLWhvbWVfX3Nob3J0Y3V0IGNsYWltcy1ob21lX19jbGFpbXMtc2hvcnRjdXRcIiB0bz1cImNsYWltc1wiIHRpdGxlPVwiXHU2MjExXHU3Njg0XHU3NDA2XHU4RDU0XCIgc3VidGl0bGU9XCJcdTY3RTVcdTc3MEJcdTUxNjhcdTkwRThcdTc1MzNcdThCRjdcIiB2YWx1ZT1cIjBcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cImNsYWltcy1ob21lX19zaG9ydGN1dCBjbGFpbXMtaG9tZV9fcHJvZmlsZS1zaG9ydGN1dFwiIHRvPVwicHJvZmlsZVwiIHRpdGxlPVwiXHU0RTJBXHU0RUJBXHU0RkUxXHU2MDZGXCIgc3VidGl0bGU9XCJcdTdCQTFcdTc0MDZcdTgwNTRcdTdDRkJcdTY1QjlcdTVGMEZcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS4zLjBcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDb2x1bW4sXG4gIEZvcm1GaWVsZCxcbiAgSGVhZGluZyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dpblNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8Q29sdW1uIGlkPVwiY2xhaW1zLWxvZ2luLXBhZ2VcIiBnYXA9ezIwfSBjbGFzc05hbWU9XCJjbGFpbXMtbG9naW4gY2xhaW1zLWxvZ2luX19wYWdlXCI+XG4gICAgICA8c3BhbiBpZD1cImNsYWltcy1sb2dpbi1sb2dvXCIgY2xhc3NOYW1lPVwiY2xhaW1zLWxvZ28tcGxhY2Vob2xkZXIgY2xhaW1zLWxvZ2luX19sb2dvXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIDxIZWFkaW5nIGlkPVwiY2xhaW1zLWxvZ2luLXRpdGxlXCIgY2xhc3NOYW1lPVwiY2xhaW1zLWxvZ2luX190aXRsZVwiIGxldmVsPXsxfT5cdTc0MDZcdThENTRcdTY3MERcdTUyQTE8L0hlYWRpbmc+XG4gICAgICA8VGV4dCBjbGFzc05hbWU9XCJjbGFpbXMtbG9naW5fX2Rlc2NyaXB0aW9uXCI+XHU3NjdCXHU1RjU1XHU1NDBFXHU2N0U1XHU3NzBCXHU1NDhDXHU2M0QwXHU0RUE0XHU3NDA2XHU4RDU0XHU3NTMzXHU4QkY3XHUzMDAyPC9UZXh0PlxuICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJjbGFpbXMtbG9naW5fX3Bob25lLWZpZWxkXCIgbGFiZWw9XCJcdTYyNEJcdTY3M0FcdTUzRjdcIiBodG1sRm9yPVwiY2xhaW1zLWxvZ2luLXBob25lXCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJjbGFpbXMtbG9naW4tcGhvbmVcIiBjbGFzc05hbWU9XCJjbGFpbXMtbG9naW5fX3Bob25lLWlucHV0XCIgaW5wdXRNb2RlPVwidGVsXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTYyNEJcdTY3M0FcdTUzRjdcIiAvPlxuICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImNsYWltcy1sb2dpbl9fY29kZS1maWVsZFwiIGxhYmVsPVwiXHU5QThDXHU4QkMxXHU3ODAxXCIgaHRtbEZvcj1cImNsYWltcy1sb2dpbi1jb2RlXCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJjbGFpbXMtbG9naW4tY29kZVwiIGNsYXNzTmFtZT1cImNsYWltcy1sb2dpbl9fY29kZS1pbnB1dFwiIGlucHV0TW9kZT1cIm51bWVyaWNcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1OUE4Q1x1OEJDMVx1NzgwMVwiIC8+XG4gICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgIDxCdXR0b24gaWQ9XCJjbGFpbXMtbG9naW4tc3VibWl0XCIgY2xhc3NOYW1lPVwiY2xhaW1zLWxvZ2luX19zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwiaG9tZVwiPlx1NzY3Qlx1NUY1NTwvQnV0dG9uPlxuICAgIDwvQ29sdW1uPlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS4zLjBcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQXZhdGFyLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVG9nZ2xlLFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBQcm9maWxlU2NyZWVuKCkge1xuICBjb25zdCBbbm90aWZpY2F0aW9ucywgc2V0Tm90aWZpY2F0aW9uc10gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiY2xhaW1zLXByb2ZpbGUtcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cImNsYWltcy1wYWdlIGNsYWltcy1wcm9maWxlX19wYWdlXCI+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwiY2xhaW1zLXByb2ZpbGUtdGl0bGVcIiBjbGFzc05hbWU9XCJjbGFpbXMtcHJvZmlsZV9fdGl0bGVcIiBsZXZlbD17MX0+XHU2MjExXHU3Njg0PC9IZWFkaW5nPlxuICAgICAgICA8Um93IGlkPVwiY2xhaW1zLXByb2ZpbGUtc3VtbWFyeVwiIGNsYXNzTmFtZT1cImNsYWltcy1wcm9maWxlX19zdW1tYXJ5XCIgZ2FwPXsxMn0gYWxpZ25JdGVtcz1cImNlbnRlclwiPlxuICAgICAgICAgIDxBdmF0YXIgY2xhc3NOYW1lPVwiY2xhaW1zLXByb2ZpbGVfX2F2YXRhclwiIHNpemU9ezU2fSBsYWJlbD1cIlx1NzUyOFx1NjIzN1x1NTkzNFx1NTBDRlx1NTM2MFx1NEY0RFwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGFpbXMtcHJvZmlsZV9faWRlbnRpdHlcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiY2xhaW1zLXByb2ZpbGVfX25hbWVcIj5cdTc5M0FcdTRGOEJcdTc1MjhcdTYyMzc8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImNsYWltcy1wcm9maWxlX192ZXJpZmljYXRpb25cIj5cdTVERjJcdTVCOENcdTYyMTBcdTVCOUVcdTU0MERcdThCQTRcdThCQzE8L1RleHQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvUm93PlxuICAgICAgICA8Q2VsbCBpZD1cImNsYWltcy1wcm9maWxlLWNvbnRhY3RcIiBjbGFzc05hbWU9XCJjbGFpbXMtcHJvZmlsZV9fY29udGFjdFwiIHRpdGxlPVwiXHU4MDU0XHU3Q0ZCXHU2NUI5XHU1RjBGXCIgc3VidGl0bGU9XCIxMzggMDAwMCAwMDAwXCIgLz5cbiAgICAgICAgPFRvZ2dsZVxuICAgICAgICAgIGlkPVwiY2xhaW1zLXByb2ZpbGUtbm90aWZpY2F0aW9uc1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiY2xhaW1zLXByb2ZpbGVfX25vdGlmaWNhdGlvbnNcIlxuICAgICAgICAgIGNoZWNrZWQ9e25vdGlmaWNhdGlvbnN9XG4gICAgICAgICAgbGFiZWw9XCJcdTYzQTVcdTY1MzZcdThGREJcdTVFQTZcdTkwMUFcdTc3RTVcIlxuICAgICAgICAgIG9uQ2hhbmdlPXtzZXROb3RpZmljYXRpb25zfVxuICAgICAgICAvPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBDbGFpbUFwcGx5U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2NsYWltLWFwcGx5LmpzeCdcbmltcG9ydCB7IENsYWltc1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9jbGFpbXMuanN4J1xuaW1wb3J0IHsgSG9tZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9ob21lLmpzeCdcbmltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2xvZ2luLmpzeCdcbmltcG9ydCB7IFByb2ZpbGVTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcHJvZmlsZS5qc3gnXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnXHU3NDA2XHU4RDU0XHU2NzBEXHU1MkExXHU1RTk0XHU3NTI4JyxcbiAgdmlld3BvcnRzOiB7XG4gICAgbW9iaWxlOiB7IHdpZHRoOiAzNzUsIGhlaWdodDogODEyIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ21vYmlsZScsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ2xvZ2luJyxcbiAgICAgIHRpdGxlOiAnXHU3NjdCXHU1RjU1JyxcbiAgICAgIGNvbXBvbmVudDogTG9naW5TY3JlZW4sXG4gICAgICBlbnRyeTogdHJ1ZSxcbiAgICAgIGxpbmtzOiBbJ2hvbWUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2hvbWUnLFxuICAgICAgdGl0bGU6ICdcdTk5OTZcdTk4NzUnLFxuICAgICAgY29tcG9uZW50OiBIb21lU2NyZWVuLFxuICAgICAgbGlua3M6IFsnaG9tZScsICdjbGFpbXMnLCAnY2xhaW0tYXBwbHknLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY2xhaW1zJyxcbiAgICAgIHRpdGxlOiAnXHU2MjExXHU3Njg0XHU3NDA2XHU4RDU0JyxcbiAgICAgIGNvbXBvbmVudDogQ2xhaW1zU2NyZWVuLFxuICAgICAgbGlua3M6IFsnaG9tZScsICdjbGFpbXMnLCAnY2xhaW0tYXBwbHknLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnY2xhaW0tYXBwbHknLFxuICAgICAgdGl0bGU6ICdcdTc0MDZcdThENTRcdTc1MzNcdThCRjcnLFxuICAgICAgY29tcG9uZW50OiBDbGFpbUFwcGx5U2NyZWVuLFxuICAgICAgbGlua3M6IFsnaG9tZScsICdjbGFpbXMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncHJvZmlsZScsXG4gICAgICB0aXRsZTogJ1x1NEUyQVx1NEVCQVx1NEUyRFx1NUZDMycsXG4gICAgICBjb21wb25lbnQ6IFByb2ZpbGVTY3JlZW4sXG4gICAgICBsaW5rczogWydob21lJywgJ2NsYWltcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gIF0sXG59XG4iLCAiaW1wb3J0IHsgQm9hcmQgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgUHJvdG90eXBlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHZhbGlkYXRlUHJvamVjdCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8s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LFFBQ1gsT0FBTyxDQUFDLFFBQVEsVUFBVSxTQUFTO0FBQUEsUUFDbkMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxRQUFRLFVBQVUsU0FBUztBQUFBLFFBQ25DLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDNUNBLGtCQUFnQixPQUFPO0FBRXZCLFdBQVMsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUU7QUFBQSxJQUNuRCxvQ0FBQyxpQkFBYyxPQUFNLFdBQ25CLG9DQUFDLHFCQUFrQixXQUNqQixvQ0FBQyxTQUFNLFNBQWtCLENBQzNCLENBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJwcm9qZWN0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgInRhYnMiXQp9Cg==
