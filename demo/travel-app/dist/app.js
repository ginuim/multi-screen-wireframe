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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9jYW52YXMtaW5kZXguanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0NhbnZhc01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9EZW1vTW9kZS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL2V4cG9ydC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3UGFuZWwuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9SZXZpZXdNYXJrZXJzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TGF1bmNoZXIuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9iZWZvcmUtdW5sb2FkLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9zaG9ydGN1dHMuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkUGFuZWxzLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYm9hcmQtc2V0dGluZ3MuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zsb3cuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2xheW91dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2NvbnRlbnQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mb3Jtcy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL25hdmlnYXRpb24uanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9kYXRhLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmVlZGJhY2suanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9tYXAuanN4IiwgIi4uL3NyYy9sYXlvdXRzL01vYmlsZUxheW91dC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvYnVkZ2V0LmpzeCIsICIuLi9zcmMvc2NyZWVucy9kaXNjb3Zlci5qc3giLCAiLi4vc3JjL2NvbXBvbmVudHMvU2hhbmdoYWlNYXAuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCIsICIuLi9zcmMvc2NyZWVucy9pdGluZXJhcnkuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2xvZ2luLmpzeCIsICIuLi9zcmMvc2NyZWVucy9wcm9maWxlLmpzeCIsICIuLi9zcmMvc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXAtY29uZmlybS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXBzLmpzeCIsICIuLi9zcmMvcHJvamVjdC5qcyIsICIuLi9zcmMvYXBwLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgUHJvdG90eXBlQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZnVuY3Rpb24gZ2V0SW5pdGlhbFNjcmVlbklkKHByb2plY3QpIHtcbiAgcmV0dXJuIHByb2plY3Quc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IHByb2plY3Quc2NyZWVuc1swXS5pZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gUHJvdG90eXBlUHJvdmlkZXIoeyBwcm9qZWN0LCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGluaXRpYWxTY3JlZW5JZCA9IGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KVxuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKHtcbiAgICBtb2RlOiAnY2FudmFzJyxcbiAgICB2aWV3cG9ydEtleTogcHJvamVjdC5kZWZhdWx0Vmlld3BvcnQsXG4gICAgZW50cnlJZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogaW5pdGlhbFNjcmVlbklkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICB9KVxuXG4gIGNvbnN0IG5hdmlnYXRlID0gUmVhY3QudXNlQ2FsbGJhY2soKGlkKSA9PiB7XG4gICAgaWYgKCFwcm9qZWN0LnNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGlkKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7aWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZCkge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpXG4gICAgICAgIGlmICghc2NyZWVuLmxpbmtzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtjdXJyZW50LmN1cnJlbnRTY3JlZW5JZH1cIiBsaW5rcyBkbyBub3QgaW5jbHVkZSBcIiR7aWR9XCJgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGlkLFxuICAgICAgICBoaXN0b3J5OlxuICAgICAgICAgIGN1cnJlbnQubW9kZSA9PT0gJ2RlbW8nICYmIGlkICE9PSBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZFxuICAgICAgICAgICAgPyBbLi4uY3VycmVudC5oaXN0b3J5LCBjdXJyZW50LmN1cnJlbnRTY3JlZW5JZF1cbiAgICAgICAgICAgIDogY3VycmVudC5oaXN0b3J5LFxuICAgICAgfVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCBzZWxlY3RFbnRyeSA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbnRyeUlkKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gICAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgZW50cnlJZCxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3QgZ29CYWNrID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5oaXN0b3J5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmN1cnJlbnQsXG4gICAgICAgIGN1cnJlbnRTY3JlZW5JZDogY3VycmVudC5oaXN0b3J5W2N1cnJlbnQuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICAgICAgaGlzdG9yeTogY3VycmVudC5oaXN0b3J5LnNsaWNlKDAsIC0xKSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbXSlcblxuICBjb25zdCByZXNldCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuZW50cnlJZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbaW5pdGlhbFNjcmVlbklkXSlcblxuICBjb25zdCBzZXRNb2RlID0gUmVhY3QudXNlQ2FsbGJhY2soKG1vZGUpID0+IHtcbiAgICBpZiAobW9kZSAhPT0gJ2NhbnZhcycgJiYgbW9kZSAhPT0gJ2RlbW8nKSB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gbW9kZSBcIiR7bW9kZX1cImApXG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZSxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbXSlcblxuICAvKiogXHU3NTNCXHU2NzdGXHU1M0NDXHU1MUZCXHU2N0QwXHU5ODc1XHVGRjFBXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBXHU1RTc2XHU4NDNEXHU1NzI4XHU4QkU1XHU5ODc1ICovXG4gIGNvbnN0IGVudGVyRGVtbyA9IFJlYWN0LnVzZUNhbGxiYWNrKChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzY3JlZW5JZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke3NjcmVlbklkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgbW9kZTogJ2RlbW8nLFxuICAgICAgY3VycmVudFNjcmVlbklkOiBzY3JlZW5JZCxcbiAgICAgIGhpc3Rvcnk6IFtdLFxuICAgIH0pKVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2V0Vmlld3BvcnRLZXkgPSBSZWFjdC51c2VDYWxsYmFjaygodmlld3BvcnRLZXkpID0+IHtcbiAgICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHZpZXdwb3J0S2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIHZpZXdwb3J0IFwiJHt2aWV3cG9ydEtleX1cImApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCB2aWV3cG9ydEtleSB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiAoe1xuICAgIG1vZGU6IHN0YXRlLm1vZGUsXG4gICAgdmlld3BvcnRLZXk6IHN0YXRlLnZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0OiBwcm9qZWN0LnZpZXdwb3J0c1tzdGF0ZS52aWV3cG9ydEtleV0sXG4gICAgZW50cnlJZDogc3RhdGUuZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCxcbiAgICBuYXZpZ2F0ZSxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgc2V0TW9kZSxcbiAgICBlbnRlckRlbW8sXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgY2FuR29CYWNrOiBzdGF0ZS5oaXN0b3J5Lmxlbmd0aCA+IDAsXG4gIH0pLCBbZW50ZXJEZW1vLCBnb0JhY2ssIG5hdmlnYXRlLCBwcm9qZWN0LCByZXNldCwgc2VsZWN0RW50cnksIHNldE1vZGUsIHNldFZpZXdwb3J0S2V5LCBzdGF0ZV0pXG5cbiAgcmV0dXJuIDxQcm90b3R5cGVDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt2YWx1ZX0+e2NoaWxkcmVufTwvUHJvdG90eXBlQ29udGV4dC5Qcm92aWRlcj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb3RvdHlwZSgpIHtcbiAgY29uc3QgY29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoUHJvdG90eXBlQ29udGV4dClcbiAgaWYgKCFjb250ZXh0KSB0aHJvdyBuZXcgRXJyb3IoJ3VzZVByb3RvdHlwZSBtdXN0IGJlIHVzZWQgaW5zaWRlIFByb3RvdHlwZVByb3ZpZGVyJylcbiAgcmV0dXJuIGNvbnRleHRcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2xhbXBTY2FsZShzY2FsZSkge1xuICByZXR1cm4gTWF0aC5taW4oMiwgTWF0aC5tYXgoMC4yLCBzY2FsZSkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU2QTIxXHU1RjBGXHVGRjFBXHU2MzA5XHU1QkI5XHU1NjY4XHU1MTg1XHU1QkI5XHU1MzNBXHU2MjhBXHU2NTc0XHU5ODc1XHU3RjI5XHU2NTNFXHU1MjMwXHU1QjhDXHU2NTc0XHU1M0VGXHU4OUMxXHUzMDAyXG4gKiBjb250YWluZXIqIFx1NEUzQVx1NTNCQlx1NjM4OSBwYWRkaW5nIFx1NTQwRVx1NzY4NFx1NTNFRlx1NzUyOFx1NUMzQVx1NUJGOFx1RkYxQmNvbnRlbnQqIFx1NEUzQVx1NjcyQVx1N0YyOVx1NjUzRVx1NzY4NCBzdGFnZSBcdTVCQkRcdTlBRDhcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpdERlbW9TY2FsZShjb250YWluZXJXaWR0aCwgY29udGFpbmVySGVpZ2h0LCBjb250ZW50V2lkdGgsIGNvbnRlbnRIZWlnaHQpIHtcbiAgaWYgKGNvbnRhaW5lcldpZHRoIDw9IDAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDAgfHwgY29udGVudFdpZHRoIDw9IDAgfHwgY29udGVudEhlaWdodCA8PSAwKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuICByZXR1cm4gY2xhbXBTY2FsZShNYXRoLm1pbihjb250YWluZXJXaWR0aCAvIGNvbnRlbnRXaWR0aCwgY29udGFpbmVySGVpZ2h0IC8gY29udGVudEhlaWdodCkpXG59XG5cbi8qKlxuICogXHU2RjE0XHU3OTNBXHU4OUM2XHU1M0UzXHU1M0NDXHU1MUZCXHU3NkVFXHU2ODA3XHU2NjJGXHU1NDI2XHU0RTNBXHU1QzRGXHU1OTE2XHU3QTdBXHU3NjdEXHUzMDAyXG4gKiBcdTcwQjlcdTU3MjggLndmLXNjcmVlbi1jaHJvbWVcdUZGMDhcdTY4MDdcdTk4OThcdTY4MEYgLyBcdTUxODVcdTVCQjlcdUZGMDlcdTUxODVcdTRFMERcdTdCOTdcdTdBN0FcdTc2N0RcdUZGMENcdTkwN0ZcdTUxNERcdThCRUZcdTkwMDBcdTUxRkFcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzRGVtb0JsYW5rRXhpdFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gIXRhcmdldC5jbG9zZXN0KCcud2Ytc2NyZWVuLWNocm9tZScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldENhbnZhc1ZpZXdwb3J0KCkge1xuICByZXR1cm4geyBzY2FsZTogMSwgcGFuWDogMCwgcGFuWTogMCB9XG59XG5cbmNvbnN0IEZPQ1VTX1BBRERJTkcgPSA0MFxuXG4vKipcbiAqIFx1NzUzQlx1Njc3RiBmb2N1c1x1RkYxQVx1NjI4QVx1NjU3NFx1NTc1NyBzY3JlZW5cdUZGMDhcdTU0MkIgbWV0YVx1RkYwOVx1NzlGQlx1NTIzMFx1NUJCOVx1NTY2OFx1NEUyRFx1NUZDM1x1MzAwMlxuICogXHU0RUM1XHU1RjUzXHU1RjUzXHU1MjREIHNjYWxlIFx1NjUzRVx1NEUwRFx1NEUwQlx1NjVGNlx1N0YyOVx1NUMwRlx1RkYxQlx1NEUwRFx1NjUzRVx1NTkyN1x1MzAwMlx1NUMzQVx1NUJGOFx1OTc1RVx1NkNENVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb2N1c0NhbnZhc1NjcmVlbih7XG4gIGNvbnRhaW5lcldpZHRoLFxuICBjb250YWluZXJIZWlnaHQsXG4gIHNjcmVlbkxlZnQsXG4gIHNjcmVlblRvcCxcbiAgc2NyZWVuV2lkdGgsXG4gIHNjcmVlbkhlaWdodCxcbiAgY3VycmVudFNjYWxlLFxuICBwYWRkaW5nID0gRk9DVVNfUEFERElORyxcbn0pIHtcbiAgaWYgKFxuICAgIGNvbnRhaW5lcldpZHRoIDw9IDBcbiAgICB8fCBjb250YWluZXJIZWlnaHQgPD0gMFxuICAgIHx8IHNjcmVlbldpZHRoIDw9IDBcbiAgICB8fCBzY3JlZW5IZWlnaHQgPD0gMFxuICAgIHx8ICFOdW1iZXIuaXNGaW5pdGUoY3VycmVudFNjYWxlKVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgYXZhaWxXaWR0aCA9IGNvbnRhaW5lcldpZHRoIC0gcGFkZGluZyAqIDJcbiAgY29uc3QgYXZhaWxIZWlnaHQgPSBjb250YWluZXJIZWlnaHQgLSBwYWRkaW5nICogMlxuICBpZiAoYXZhaWxXaWR0aCA8PSAwIHx8IGF2YWlsSGVpZ2h0IDw9IDApIHJldHVybiBudWxsXG5cbiAgY29uc3QgZml0U2NhbGUgPSBNYXRoLm1pbihhdmFpbFdpZHRoIC8gc2NyZWVuV2lkdGgsIGF2YWlsSGVpZ2h0IC8gc2NyZWVuSGVpZ2h0KVxuICBjb25zdCBzY2FsZSA9IGNsYW1wU2NhbGUoTWF0aC5taW4oY3VycmVudFNjYWxlLCBmaXRTY2FsZSkpXG4gIHJldHVybiB7XG4gICAgc2NhbGUsXG4gICAgcGFuWDogY29udGFpbmVyV2lkdGggLyAyIC0gKHNjcmVlbkxlZnQgKyBzY3JlZW5XaWR0aCAvIDIpICogc2NhbGUsXG4gICAgcGFuWTogY29udGFpbmVySGVpZ2h0IC8gMiAtIChzY3JlZW5Ub3AgKyBzY3JlZW5IZWlnaHQgLyAyKSAqIHNjYWxlLFxuICB9XG59XG5cbi8qKlxuICogXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHVGRjFBXHU1M0VBXHU3NTI4XHU4QzAzXHU3NTI4XHU2NUI5XHU2M0QwXHU1MjREXHU2MjJBXHU4M0I3XHU3Njg0IHNuYXBzaG90XHVGRjBDXHU3OTgxXHU2QjYyXHU1NzI4IHNldFN0YXRlIHVwZGF0ZXIgXHU5MUNDXHU4QkZCIGRyYWcgcmVmXHUzMDAyXG4gKiBSZWFjdCAxOCBcdTRGMUFcdTU3MjggZW5kUGFuIFx1NkUwNVx1N0E3QSByZWYgXHU1NDBFXHU5MUNEXHU2NTNFIHVwZGF0ZXJcdUZGMUJcdThCRkIgbnVsbC5wYW5YIFx1NTM3MyBCb2FyZCBcdTYyQTVcdTk1MTlcdTY4MzlcdTU2RTBcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhbkZyb21EcmFnU25hcHNob3Qodmlldywgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpIHtcbiAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuIHZpZXdcbiAgcmV0dXJuIHtcbiAgICAuLi52aWV3LFxuICAgIHBhblg6IHNuYXBzaG90LnBhblggKyBjbGllbnRYIC0gc25hcHNob3QueCxcbiAgICBwYW5ZOiBzbmFwc2hvdC5wYW5ZICsgY2xpZW50WSAtIHNuYXBzaG90LnksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU2Nyb2xsYWJsZU92ZXJmbG93KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gJ2F1dG8nIHx8IHZhbHVlID09PSAnc2Nyb2xsJyB8fCB2YWx1ZSA9PT0gJ292ZXJsYXknXG59XG5cbi8qKiBcdTU3Mjggcm9vdCBcdTUxODVcdTU0MTFcdTRFMEFcdTYyN0VcdTUzRUZcdTZFREFcdTUyQThcdTc5NTZcdTUxNDhcdUZGMDhcdTU0MkIgcm9vdCBcdTgxRUFcdThFQUJcdUZGMENcdTU5ODJcdTVDNEZcdTUxODVcdTUxODVcdTVCQjlcdTUzM0FcdUZGMDkgKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBsZXQgbm9kZSA9IHN0YXJ0RWwgJiYgc3RhcnRFbC5ub2RlVHlwZSA9PT0gMyA/IHN0YXJ0RWwucGFyZW50RWxlbWVudCA6IHN0YXJ0RWxcbiAgd2hpbGUgKG5vZGUpIHtcbiAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlKVxuICAgICAgY29uc3QgY2FuWSA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WSkgJiYgbm9kZS5zY3JvbGxIZWlnaHQgPiBub2RlLmNsaWVudEhlaWdodCArIDFcbiAgICAgIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIG5vZGUuc2Nyb2xsV2lkdGggPiBub2RlLmNsaWVudFdpZHRoICsgMVxuICAgICAgaWYgKGNhblkgfHwgY2FuWCkgcmV0dXJuIG5vZGVcbiAgICB9XG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuY29uc3QgQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCA9IDNcblxuZnVuY3Rpb24gaXNFZGl0YWJsZVRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKCF0YXJnZXQgfHwgdHlwZW9mIHRhcmdldC5jbG9zZXN0ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuICEhdGFyZ2V0LmNsb3Nlc3QoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbY29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXScpXG59XG5cbi8qKlxuICogXHU1NzI4XHU1M0VGXHU2RURBXHU1MkE4XHU1MzNBXHU1N0RGXHU1MTg1XHU2MzA5XHU0RjRGXHU2MkQ2XHU2MkZEIFx1MjE5MiBcdTZFREFcdTUyQThcdTUxODVcdTVCQjlcdTMwMDJcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1RkYwOFx1NTNFRlx1NEVBNFx1NEU5Mlx1NTE3M1x1OTVFRCAvIFx1N0E3QVx1NjgzQ1x1RkYwOVx1NjVGNlx1OEZENFx1NTZERSBudWxsXHVGRjBDXHU0RUE0XHU3RUQ5XHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXHUzMDAyXG4gKiBcdThGRDRcdTU2REUgbnVsbCBcdTg4NjhcdTc5M0FcdTRFMERcdTVFOTRcdTYzQTVcdTdCQTFcdThCRTVcdTZCMjEgcG9pbnRlcmRvd25cdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlZ2luQ29udGVudERyYWdTY3JvbGwoZXZlbnQsIHJvb3RFbCwgeyBsb2NrZWQgPSBmYWxzZSwgc2NhbGUgPSAxIH0gPSB7fSkge1xuICBpZiAobG9ja2VkKSByZXR1cm4gbnVsbFxuICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm4gbnVsbFxuICBpZiAoIXJvb3RFbCB8fCAhcm9vdEVsLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGlmIChpc0VkaXRhYmxlVGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVybiBudWxsXG4gIGNvbnN0IHNjcm9sbGFibGUgPSBmaW5kU2Nyb2xsYWJsZUFuY2VzdG9yKGV2ZW50LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXNjcm9sbGFibGUpIHJldHVybiBudWxsXG4gIHJldHVybiB7XG4gICAgZWw6IHNjcm9sbGFibGUsXG4gICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICBzY3JvbGxMZWZ0OiBzY3JvbGxhYmxlLnNjcm9sbExlZnQsXG4gICAgc2Nyb2xsVG9wOiBzY3JvbGxhYmxlLnNjcm9sbFRvcCxcbiAgICBzY2FsZTogc2NhbGUgPiAwID8gc2NhbGUgOiAxLFxuICAgIG1vdmVkOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudCkge1xuICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgZHggPSAoZXZlbnQuY2xpZW50WCAtIHN0YXRlLnN0YXJ0WCkgLyBzdGF0ZS5zY2FsZVxuICBjb25zdCBkeSA9IChldmVudC5jbGllbnRZIC0gc3RhdGUuc3RhcnRZKSAvIHN0YXRlLnNjYWxlXG4gIGlmICghc3RhdGUubW92ZWQgJiYgKE1hdGguYWJzKGR4KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQgfHwgTWF0aC5hYnMoZHkpID4gQ09OVEVOVF9EUkFHX1RIUkVTSE9MRCkpIHtcbiAgICBzdGF0ZS5tb3ZlZCA9IHRydWVcbiAgfVxuICBzdGF0ZS5lbC5zY3JvbGxMZWZ0ID0gc3RhdGUuc2Nyb2xsTGVmdCAtIGR4XG4gIHN0YXRlLmVsLnNjcm9sbFRvcCA9IHN0YXRlLnNjcm9sbFRvcCAtIGR5XG4gIHJldHVybiBzdGF0ZVxufVxuXG4vKiogXHU2MkQ2XHU2MkZEXHU4RDg1XHU4RkM3XHU5NjA4XHU1MDNDXHU1NDBFXHU1NDFFXHU2Mzg5XHU5NjhGXHU1NDBFXHU3Njg0IGNsaWNrXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU4OUU2XHU4REYzXHU4RjZDICovXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIHJvb3RFbCkge1xuICBpZiAoIXN0YXRlIHx8ICFzdGF0ZS5tb3ZlZCB8fCAhcm9vdEVsKSByZXR1cm5cbiAgY29uc3QgcHJldmVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcm9vdEVsLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcHJldmVudENsaWNrLCB0cnVlKVxuICB9XG4gIHJvb3RFbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbn1cblxuLyoqIFx1OEJFNVx1NjVCOVx1NTQxMVx1NjYyRlx1NTQyNlx1OEZEOFx1ODBGRFx1N0VFN1x1N0VFRFx1NkVEQSAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNhblNjcm9sbEluRGlyZWN0aW9uKGVsLCBkZWx0YVgsIGRlbHRhWSkge1xuICBjb25zdCBlcHMgPSAxXG4gIGlmIChkZWx0YVkpIHtcbiAgICBjb25zdCBtYXhZID0gZWwuc2Nyb2xsSGVpZ2h0IC0gZWwuY2xpZW50SGVpZ2h0XG4gICAgaWYgKG1heFkgPiBlcHMpIHtcbiAgICAgIGlmIChkZWx0YVkgPCAwICYmIGVsLnNjcm9sbFRvcCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVkgPiAwICYmIGVsLnNjcm9sbFRvcCA8IG1heFkgLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIGlmIChkZWx0YVgpIHtcbiAgICBjb25zdCBtYXhYID0gZWwuc2Nyb2xsV2lkdGggLSBlbC5jbGllbnRXaWR0aFxuICAgIGlmIChtYXhYID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFYIDwgMCAmJiBlbC5zY3JvbGxMZWZ0ID4gZXBzKSByZXR1cm4gdHJ1ZVxuICAgICAgaWYgKGRlbHRhWCA+IDAgJiYgZWwuc2Nyb2xsTGVmdCA8IG1heFggLSBlcHMpIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG4vKipcbiAqIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEVGQlx1NjEwRlx1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NEVDNSBDdHJsL01ldGEgKyBcdTZFREFcdThGNkVcbiAqXHVGRjA4XHU4OUU2XHU2M0E3XHU2NzdGIHBpbmNoIFx1NTcyOFx1NkQ0Rlx1ODlDOFx1NTY2OFx1OTFDQ1x1OTAxQVx1NUUzOFx1NUUyNiBjdHJsS2V5XHVGRjA5XHUzMDAyXHU2NzJBXHU5NTAxXHU1QjlBXHU2NUY2XHU2NjZFXHU5MDFBXHU2RURBXHU4RjZFXHU3NTU5XHU3RUQ5XHU1QzRGXHU1MTg1XHU2RURBXHU1MkE4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRab29tT25XaGVlbChldmVudCwgeyBsb2NrZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluZmVyRW50cnlJZChzY3JlZW5zKSB7XG4gIHJldHVybiBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5KT8uaWQgfHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVtb1N0YXRlKHNjcmVlbnMpIHtcbiAgY29uc3QgZW50cnlJZCA9IGluZmVyRW50cnlJZChzY3JlZW5zKVxuICBpZiAoIWVudHJ5SWQpIHRocm93IG5ldyBFcnJvcignRGVtbyBtb2RlIHJlcXVpcmVzIGF0IGxlYXN0IG9uZSBlbnRyeSBzY3JlZW4nKVxuICByZXR1cm4ge1xuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5hdmlnYXRlRGVtbyhzdGF0ZSwgdGFyZ2V0SWQsIHNjcmVlbnMpIHtcbiAgaWYgKCFzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSB0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHt0YXJnZXRJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIH1cbiAgY29uc3QgY3VycmVudFNjcmVlbiA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZClcbiAgaWYgKCFjdXJyZW50U2NyZWVuLmxpbmtzLmluY2x1ZGVzKHRhcmdldElkKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgU2NyZWVuIFwiJHtzdGF0ZS5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke3RhcmdldElkfVwiYClcbiAgfVxuICBpZiAodGFyZ2V0SWQgPT09IHN0YXRlLmN1cnJlbnRTY3JlZW5JZCkgcmV0dXJuIHN0YXRlXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiB0YXJnZXRJZCxcbiAgICBoaXN0b3J5OiBbLi4uc3RhdGUuaGlzdG9yeSwgc3RhdGUuY3VycmVudFNjcmVlbklkXSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0RGVtb0VudHJ5KHN0YXRlLCBlbnRyeUlkLCBzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5ID0gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gZW50cnlJZClcbiAgaWYgKCFlbnRyeSkgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7ZW50cnlJZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgZW50cnlJZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ29CYWNrRGVtbyhzdGF0ZSkge1xuICBpZiAoc3RhdGUuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBzdGF0ZVxuICBjb25zdCBoaXN0b3J5ID0gc3RhdGUuaGlzdG9yeS5zbGljZSgwLCAtMSlcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmhpc3Rvcnlbc3RhdGUuaGlzdG9yeS5sZW5ndGggLSAxXSxcbiAgICBoaXN0b3J5LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNldERlbW8oc3RhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5zdGF0ZSxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgaGlzdG9yeTogW10sXG4gICAgaG90c3BvdHNWaXNpYmxlOiBmYWxzZSxcbiAgfVxufVxuIiwgImV4cG9ydCBjbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICB0aGlzLnN0YXRlID0geyBlcnJvcjogbnVsbCB9XG4gIH1cblxuICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbUVycm9yKGVycm9yKSB7XG4gICAgcmV0dXJuIHsgZXJyb3IgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3IsIGluZm8pIHtcbiAgICBjb25zb2xlLmVycm9yKGBbd2lyZWZyYW1lOiR7dGhpcy5wcm9wcy5zY29wZSB8fCAndW5rbm93bid9XWAsIGVycm9yLCBpbmZvKVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZpb3VzUHJvcHMpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5lcnJvciAmJiBwcmV2aW91c1Byb3BzLnJlc2V0S2V5ICE9PSB0aGlzLnByb3BzLnJlc2V0S2V5KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSlcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmVycm9yKSByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgIGNvbnN0IHsgc2NyZWVuSWQsIHNvdXJjZSwgc2NvcGUgfSA9IHRoaXMucHJvcHNcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1lcnJvci1jYXJkXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgIDxzdHJvbmc+e3Njb3BlID09PSAnc2NyZWVuJyA/IGBTY3JlZW46ICR7c2NyZWVuSWR9YCA6ICdCb2FyZCBlcnJvcid9PC9zdHJvbmc+XG4gICAgICAgIHtzb3VyY2UgPyA8c3Bhbj5Tb3VyY2U6IHtzb3VyY2V9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIDxzcGFuPk1lc3NhZ2U6IHt0aGlzLnN0YXRlLmVycm9yLm1lc3NhZ2V9PC9zcGFuPlxuICAgICAgICA8cHJlPnt0aGlzLnN0YXRlLmVycm9yLnN0YWNrfTwvcHJlPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59XG4iLCAiY29uc3QgU2NyZWVuSWRlbnRpdHlDb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dChudWxsKVxuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuSWRlbnRpdHlQcm92aWRlcih7IHNjcmVlbklkLCBjaGlsZHJlbiB9KSB7XG4gIGlmICghc2NyZWVuSWQpIHRocm93IG5ldyBFcnJvcignU2NyZWVuSWRlbnRpdHlQcm92aWRlciByZXF1aXJlcyBzY3JlZW5JZCcpXG4gIHJldHVybiAoXG4gICAgPFNjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlciB2YWx1ZT17c2NyZWVuSWR9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvU2NyZWVuSWRlbnRpdHlDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VTY3JlZW5JZCgpIHtcbiAgY29uc3Qgc2NyZWVuSWQgPSBSZWFjdC51c2VDb250ZXh0KFNjcmVlbklkZW50aXR5Q29udGV4dClcbiAgaWYgKCFzY3JlZW5JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcigndXNlU2NyZWVuSWQgbXVzdCBiZSB1c2VkIGluc2lkZSBhIHJlbmRlcmVkIHNjcmVlbicpXG4gIH1cbiAgcmV0dXJuIHNjcmVlbklkXG59XG4iLCAiLyoqXG4gKiBcdTcwRURcdTUzM0FcdTRFMEVcdThERjNcdThGNkNcdTc2ODRcdTU1MkZcdTRFMDBcdTU5NTFcdTdFQTZcdUZGMUFcdTUxNDNcdTdEMjBcdTVFMjYgZGF0YS1mbG93LXRvIFx1NTM3M1x1NTNFRlx1NUJGQ1x1ODIyQVx1MzAwMlxuICogU2NyZWVuRnJhbWUgXHU1OUQ0XHU2MjU4XHU3MEI5XHU1MUZCXHU1MTVDXHU1RTk1XHVGRjBDXHU5MDdGXHU1MTREXHU0RTFBXHU1MkExXHU1MTk5XHU2MjEwXHU4OEY4IHNwYW4vZGl2IFx1NTNFQVx1NjcwOVx1NUM1RVx1NjAyN1x1MzAwMVx1NkNBMVx1NjcwOSBvbkNsaWNrXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kRmxvd1RhcmdldElkKHN0YXJ0RWwsIHJvb3RFbCkge1xuICBpZiAoIXN0YXJ0RWwgfHwgdHlwZW9mIHN0YXJ0RWwuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIG51bGxcbiAgY29uc3QgZWwgPSBzdGFydEVsLmNsb3Nlc3QoJ1tkYXRhLWZsb3ctdG9dJylcbiAgaWYgKCFlbCkgcmV0dXJuIG51bGxcbiAgaWYgKHJvb3RFbCAmJiB0eXBlb2Ygcm9vdEVsLmNvbnRhaW5zID09PSAnZnVuY3Rpb24nICYmICFyb290RWwuY29udGFpbnMoZWwpKSByZXR1cm4gbnVsbFxuICBjb25zdCB0byA9IGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1mbG93LXRvJylcbiAgcmV0dXJuIHRvIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgcm9vdEVsLCBuYXZpZ2F0ZSkge1xuICBjb25zdCB0byA9IGZpbmRGbG93VGFyZ2V0SWQoZXZlbnQ/LnRhcmdldCwgcm9vdEVsKVxuICBpZiAoIXRvKSByZXR1cm4gZmFsc2VcbiAgZXZlbnQucHJldmVudERlZmF1bHQ/LigpXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgbmF2aWdhdGUodG8pXG4gIHJldHVybiB0cnVlXG59XG4iLCAiY29uc3QgVFlQRV9MQUJFTFMgPSB7XG4gIGNvbW1lbnQ6ICdcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnLFxuICB0ZXh0OiAnXHU0RkVFXHU2NTM5XHU2NTg3XHU1QjU3JyxcbiAgb3JkZXI6ICdcdThDMDNcdTY1NzRcdTk4N0FcdTVFOEYnLFxuICByZW1vdmU6ICdcdTUyMjBcdTk2NjRcdTgyODJcdTcwQjknLFxufVxuXG5mdW5jdGlvbiBlc2NhcGVTZWxlY3RvclRva2VuKHZhbHVlKSB7XG4gIGlmIChnbG9iYWxUaGlzLkNTUz8uZXNjYXBlKSByZXR1cm4gZ2xvYmFsVGhpcy5DU1MuZXNjYXBlKFN0cmluZyh2YWx1ZSkpXG4gIHJldHVybiBTdHJpbmcodmFsdWUpLnJlcGxhY2UoL1teYS16QS1aMC05Xy1dL2csIChjaGFyKSA9PiBgXFxcXCR7Y2hhcn1gKVxufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxufVxuXG5mdW5jdGlvbiBjbGFzc2VzT2YoZWxlbWVudCkge1xuICBpZiAoIWVsZW1lbnQ/LmNsYXNzTGlzdCkgcmV0dXJuIFtdXG4gIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2xhc3NMaXN0KS5maWx0ZXIoQm9vbGVhbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQnVzaW5lc3NDbGFzc05hbWUobmFtZSkge1xuICByZXR1cm4gISFuYW1lICYmICFuYW1lLnN0YXJ0c1dpdGgoJ3dmLScpICYmICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9yU2NvcGUoc2NyZWVuSWQpIHtcbiAgcmV0dXJuIGBbZGF0YS1zY3JlZW4taWQ9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKHNjcmVlbklkKX1cIl1gXG59XG5cbmZ1bmN0aW9uIHNlbGVjdG9ySXNVbmlxdWUoc2NyZWVuUm9vdCwgc2VsZWN0b3IpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc2NyZWVuUm9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKS5sZW5ndGggPT09IDFcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gZWxlbWVudFNlZ21lbnQoZWxlbWVudCkge1xuICBjb25zdCB0YWcgPSAoZWxlbWVudC50YWdOYW1lIHx8ICdkaXYnKS50b0xvd2VyQ2FzZSgpXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzLmZpbHRlcihpc0J1c2luZXNzQ2xhc3NOYW1lKVxuICBjb25zdCB1c2FibGUgPSBidXNpbmVzcy5sZW5ndGggPiAwID8gYnVzaW5lc3MgOiBjbGFzc2VzLmZpbHRlcigobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIGNvbnN0IGNsYXNzUGFydCA9IHVzYWJsZS5zbGljZSgwLCAyKS5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpXG4gIGNvbnN0IGtleSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlPy4oJ2RhdGEtd2Yta2V5JylcbiAgY29uc3Qga2V5UGFydCA9IGtleSA/IGBbZGF0YS13Zi1rZXk9XCIke2VzY2FwZUF0dHJpYnV0ZVZhbHVlKGtleSl9XCJdYCA6ICcnXG4gIHJldHVybiBgJHt0YWd9JHtjbGFzc1BhcnR9JHtrZXlQYXJ0fWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmV2aWV3U2VsZWN0b3IoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbklkKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbklkKSByZXR1cm4gJydcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihlbGVtZW50LmlkKX1gXG5cbiAgY29uc3Qgc2NvcGUgPSBzZWxlY3RvclNjb3BlKHNjcmVlbklkKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICBjb25zdCBidXNpbmVzcyA9IGNsYXNzZXNPZihlbGVtZW50KS5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcblxuICBmb3IgKGNvbnN0IG5hbWUgb2YgYnVzaW5lc3MpIHtcbiAgICBjb25zdCBsb2NhbCA9IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfSR7a2V5UGFydH1gXG4gICAgaWYgKHNlbGVjdG9ySXNVbmlxdWUoY29udGVudFJvb3QsIGxvY2FsKSkgcmV0dXJuIGAke3Njb3BlfSAke2xvY2FsfWBcbiAgfVxuXG4gIGlmIChidXNpbmVzcy5sZW5ndGggPiAxKSB7XG4gICAgY29uc3QgbG9jYWwgPSBidXNpbmVzcy5tYXAoKG5hbWUpID0+IGAuJHtlc2NhcGVTZWxlY3RvclRva2VuKG5hbWUpfWApLmpvaW4oJycpICsga2V5UGFydFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBjb25zdCBzZWdtZW50cyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGlmIChjdXJyZW50LmlkKSB7XG4gICAgICBzZWdtZW50cy51bnNoaWZ0KGAjJHtlc2NhcGVTZWxlY3RvclRva2VuKGN1cnJlbnQuaWQpfWApXG4gICAgICBicmVha1xuICAgIH1cbiAgICBsZXQgc2VnbWVudCA9IGVsZW1lbnRTZWdtZW50KGN1cnJlbnQpXG4gICAgY29uc3QgcGFyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gICAgaWYgKHBhcmVudCAmJiBwYXJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgICBjb25zdCBwZWVycyA9IEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5maWx0ZXIoXG4gICAgICAgIChpdGVtKSA9PiBpdGVtLnRhZ05hbWUgPT09IGN1cnJlbnQudGFnTmFtZSAmJiBlbGVtZW50U2VnbWVudChpdGVtKSA9PT0gc2VnbWVudCxcbiAgICAgIClcbiAgICAgIGlmIChwZWVycy5sZW5ndGggPiAxKSBzZWdtZW50ICs9IGA6bnRoLW9mLXR5cGUoJHtwZWVycy5pbmRleE9mKGN1cnJlbnQpICsgMX0pYFxuICAgIH1cbiAgICBzZWdtZW50cy51bnNoaWZ0KHNlZ21lbnQpXG4gICAgY29uc3QgbG9jYWwgPSBzZWdtZW50cy5qb2luKCcgPiAnKVxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gICAgY3VycmVudCA9IHBhcmVudFxuICB9XG5cbiAgcmV0dXJuIGAke3Njb3BlfSAke3NlZ21lbnRzLmpvaW4oJyA+ICcpIHx8IGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpfWBcbn1cblxuZnVuY3Rpb24gZGlzcGxheUxhYmVsKGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQuaWQpIHJldHVybiBgIyR7ZWxlbWVudC5pZH1gXG4gIGNvbnN0IGNsYXNzZXMgPSBjbGFzc2VzT2YoZWxlbWVudClcbiAgY29uc3Qgc2VtYW50aWMgPSBjbGFzc2VzLmZpbmQoaXNCdXNpbmVzc0NsYXNzTmFtZSkgfHwgY2xhc3Nlcy5maW5kKChuYW1lKSA9PiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKSlcbiAgcmV0dXJuIHNlbWFudGljID8gYC4ke3NlbWFudGljfWAgOiAoZWxlbWVudC50YWdOYW1lIHx8ICdub2RlJykudG9Mb3dlckNhc2UoKVxufVxuXG5mdW5jdGlvbiByZWFkVGV4dChlbGVtZW50KSB7XG4gIGNvbnN0IHZhbHVlID0gJ3ZhbHVlJyBpbiBlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJ1xuICAgID8gZWxlbWVudC52YWx1ZVxuICAgIDogZWxlbWVudC50ZXh0Q29udGVudCB8fCAnJ1xuICBjb25zdCBub3JtYWxpemVkID0gdmFsdWUucmVwbGFjZSgvXFxzKy9nLCAnICcpLnRyaW0oKVxuICByZXR1cm4gbm9ybWFsaXplZC5sZW5ndGggPiAyNDAgPyBgJHtub3JtYWxpemVkLnNsaWNlKDAsIDIzNyl9Li4uYCA6IG5vcm1hbGl6ZWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRSZXZpZXdUYXJnZXQodGFyZ2V0LCBjb250ZW50Um9vdCkge1xuICBsZXQgY3VycmVudCA9IHRhcmdldD8ubm9kZVR5cGUgPT09IDEgPyB0YXJnZXQgOiB0YXJnZXQ/LnBhcmVudEVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCB8fCBjbGFzc2VzT2YoY3VycmVudCkubGVuZ3RoID4gMCkgcmV0dXJuIGN1cnJlbnRcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlc2NyaWJlUmV2aWV3RWxlbWVudChlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuKSB7XG4gIGlmICghZWxlbWVudCB8fCAhY29udGVudFJvb3QgfHwgIXNjcmVlbikgcmV0dXJuIG51bGxcbiAgY29uc3QgYW5jZXN0b3JzID0gW11cbiAgbGV0IGN1cnJlbnQgPSBlbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgYW5jZXN0b3JzLnVuc2hpZnQoe1xuICAgICAgZWxlbWVudDogY3VycmVudCxcbiAgICAgIGxhYmVsOiBkaXNwbGF5TGFiZWwoY3VycmVudCksXG4gICAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihjdXJyZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB9KVxuICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZWxlbWVudCxcbiAgICBjb250ZW50Um9vdCxcbiAgICBzY3JlZW5JZDogc2NyZWVuLmlkLFxuICAgIHNjcmVlblRpdGxlOiBzY3JlZW4udGl0bGUsXG4gICAgc291cmNlSGludDogYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgLFxuICAgIHNlbGVjdG9yOiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW4uaWQpLFxuICAgIHRhZ05hbWU6IChlbGVtZW50LnRhZ05hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCksXG4gICAgY2xhc3NOYW1lczogY2xhc3Nlc09mKGVsZW1lbnQpLFxuICAgIGN1cnJlbnRUZXh0OiByZWFkVGV4dChlbGVtZW50KSxcbiAgICBhbmNlc3RvcnMsXG4gIH1cbn1cblxuZnVuY3Rpb24gaXRlbVJlcXVlc3QoaXRlbSkge1xuICBpZiAoaXRlbS50eXBlID09PSAndGV4dCcpIHJldHVybiBgXHU0RkVFXHU2NTM5XHU0RTNBXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ29yZGVyJykgcmV0dXJuIGBcdTk4N0FcdTVFOEZcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb259YFxuICBpZiAoaXRlbS50eXBlID09PSAncmVtb3ZlJykgcmV0dXJuIGBcdTUyMjBcdTk2NjRcdTg5ODFcdTZDNDJcdUZGMUEke2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9YFxuICByZXR1cm4gaXRlbS5pbnN0cnVjdGlvblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmV2aWV3VGFyZ2V0cyhpdGVtKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGl0ZW0/LnRhcmdldHMpICYmIGl0ZW0udGFyZ2V0cy5sZW5ndGggPiAwKSByZXR1cm4gaXRlbS50YXJnZXRzXG4gIGlmICghaXRlbT8uc2VsZWN0b3IpIHJldHVybiBbXVxuICByZXR1cm4gW3tcbiAgICBzY3JlZW5JZDogaXRlbS5zY3JlZW5JZCxcbiAgICBzY3JlZW5UaXRsZTogaXRlbS5zY3JlZW5UaXRsZSxcbiAgICBzb3VyY2VIaW50OiBpdGVtLnNvdXJjZUhpbnQsXG4gICAgc2VsZWN0b3I6IGl0ZW0uc2VsZWN0b3IsXG4gICAgY3VycmVudFRleHQ6IGl0ZW0uY3VycmVudFRleHQsXG4gIH1dXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1Byb21wdChwcm9qZWN0LCBpdGVtcykge1xuICBjb25zdCBwcm9qZWN0TmFtZSA9IHByb2plY3Q/Lm5hbWUgfHwgJ1x1NjcyQVx1NTQ3RFx1NTQwRFx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4QidcblxuICBjb25zdCBsaW5lcyA9IFtcbiAgICBgXHU4QkY3XHU0RkVFXHU2NTM5XHU3RUJGXHU2ODQ2XHU1MzlGXHU1NzhCXHUzMDBDJHtwcm9qZWN0TmFtZX1cdTMwMERcdTMwMDJgLFxuICAgICcnLFxuICAgICdcdTRGRUVcdTY1MzlcdTdFQTZcdTY3NUZcdUZGMUEnLFxuICAgICctIFx1NTNFQVx1NEZFRVx1NjUzOVx1NEUxQVx1NTJBMSBzcmMvXHVGRjFCXHU0RTBEXHU4OTgxXHU0RkVFXHU2NTM5IGZyYW1ld29yay8gXHU2MjE2IGRpc3QvYXBwLmpzXHUzMDAyJyxcbiAgICAnLSBcdTkwMUFcdThGQzcgRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1NTcyOCBKU1ggXHU0RTJEXHU2NDFDXHU3RDIyXHU1QkY5XHU1RTk0XHU3Njg0IGlkXHUzMDAxY2xhc3NOYW1lIFx1NjIxNiBkYXRhLXdmLWtleVx1MzAwMicsXG4gICAgJy0gXHU0RkREXHU3NTU5XHU2MjQwXHU2NzA5XHU4QkVEXHU0RTQ5IGNsYXNzXHUzMDAxXHU1MTczXHU5NTJFXHU4MjgyXHU3MEI5IGlkIFx1NTQ4Q1x1OTFDRFx1NTkwRFx1NjU3MFx1NjM2RVx1ODI4Mlx1NzBCOVx1NzY4NCBkYXRhLXdmLWtleVx1RkYxQlx1NjVCMFx1NTg5RVx1ODI4Mlx1NzBCOVx1NEU1Rlx1OTA3NVx1NUI4OFx1NTQwQ1x1NEUwMFx1NTQ3RFx1NTQwRFx1ODlDNFx1NTIxOVx1MzAwMicsXG4gICAgJy0gXHU0RkVFXHU2NTM5IHNjcmVlbnMvbGF5b3V0cyBcdTY1RjZcdTRGRERcdTc1NTlcdTMwMENcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEVcdTMwMERcdUZGMENcdTVFNzZcdTYyOEFcdTMwMENcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEVcdTMwMERcdTUzQ0EgQHdpcmVmcmFtZS1za2lsbCBcdTY2RjRcdTY1QjBcdTRFM0FcdTVGNTNcdTUyNEQgc2tpbGwgXHU3MjQ4XHU2NzJDXHUzMDAyJyxcbiAgICAnLSBcdTRGRERcdTYzMDEgcHJvamVjdC5saW5rcyBcdTRFM0FcdTk4NzVcdTk3NjJcdTZENDFcdTc2ODRcdTU1MkZcdTRFMDBcdThGQjlcdTY1NzBcdTYzNkVcdUZGMUJcdTVCOENcdTYyMTBcdTU0MEVcdTkxQ0RcdTY1QjBcdTY3ODRcdTVFRkFcdTVFNzZcdTlBOENcdThCQzFcdTc1M0JcdTY3N0ZcdTMwMDFcdTZGMTRcdTc5M0FcdTU0OENcdTRGRUVcdTY1MzlcdTZBMjFcdTVGMEZcdTMwMDInLFxuICBdXG5cbiAgaWYgKCFpdGVtcz8ubGVuZ3RoKSB7XG4gICAgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMicpXG4gICAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG4gIH1cblxuICBpdGVtcy5mb3JFYWNoKChpdGVtLCBpdGVtSW5kZXgpID0+IHtcbiAgICBjb25zdCB0YXJnZXRzID0gcmV2aWV3VGFyZ2V0cyhpdGVtKVxuICAgIGxpbmVzLnB1c2goJycsIGAjIyBcdTRGRUVcdTY1MzkgJHtpdGVtSW5kZXggKyAxfVx1RkYxQSR7VFlQRV9MQUJFTFNbaXRlbS50eXBlXSB8fCBUWVBFX0xBQkVMUy5jb21tZW50fWApXG4gICAgdGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBjb25zdCBzY3JlZW5JZCA9IHRhcmdldC5zY3JlZW5JZCB8fCBpdGVtLnNjcmVlbklkXG4gICAgICBsaW5lcy5wdXNoKFxuICAgICAgICAnJyxcbiAgICAgICAgYFx1NzZFRVx1NjgwNyAke3RhcmdldEluZGV4ICsgMX1cdUZGMUEke3RhcmdldC5zY3JlZW5UaXRsZSB8fCBpdGVtLnNjcmVlblRpdGxlIHx8IHNjcmVlbklkIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTk4NzVcdTk3NjInfWAsXG4gICAgICAgIGBcdTk4NzVcdTk3NjIgSURcdUZGMUEke3NjcmVlbklkIHx8ICdcdTY3MkFcdTc3RTUnfWAsXG4gICAgICAgIGBcdTZFOTBcdTc4MDFcdTYzRDBcdTc5M0FcdUZGMUEke3RhcmdldC5zb3VyY2VIaW50IHx8IGl0ZW0uc291cmNlSGludCB8fCAoc2NyZWVuSWQgPyBgc3JjL3NjcmVlbnMvJHtzY3JlZW5JZH0uanN4YCA6ICdcdThCRjdcdTY0MUNcdTdEMjJcdTkwMDlcdTYyRTlcdTU2NjgnKX1gLFxuICAgICAgICAnRE9NIFx1OTAwOVx1NjJFOVx1NTY2OFx1RkYxQScsXG4gICAgICAgIGBcXGAke3RhcmdldC5zZWxlY3Rvcn1cXGBgLFxuICAgICAgKVxuICAgICAgaWYgKHRhcmdldC5jdXJyZW50VGV4dCkgbGluZXMucHVzaCgnJywgJ1x1NUY1M1x1NTI0RFx1NTE4NVx1NUJCOVx1RkYxQScsIHRhcmdldC5jdXJyZW50VGV4dClcbiAgICB9KVxuICAgIGxpbmVzLnB1c2goJycsICdcdTRGRUVcdTY1MzlcdTg5ODFcdTZDNDJcdUZGMUEnLCBpdGVtUmVxdWVzdChpdGVtKSlcbiAgfSlcblxuICBsaW5lcy5wdXNoKFxuICAgICcnLFxuICAgICcjIyBcdTVCOENcdTYyMTBcdTY4MDdcdTUxQzYnLFxuICAgICctIFx1OTAxMFx1OTg3OVx1NUI4Q1x1NjIxMFx1NEVFNVx1NEUwQVx1NEZFRVx1NjUzOVx1RkYxQlx1ODJFNVx1OTAwOVx1NjJFOVx1NTY2OFx1NUJGOVx1NUU5NFx1NTE3MVx1NEVBQiBsYXlvdXRcdUZGMENcdThCRjdcdTRGRUVcdTY1MzlcdTc3MUZcdTVCOUVcdTVCOUFcdTRFNDlcdTRGNERcdTdGNkVcdUZGMENcdTRFMERcdTg5ODFcdTU3Mjggc2NyZWVuIFx1NEUyRFx1NTkwRFx1NTIzNlx1NUI5RVx1NzNCMFx1MzAwMicsXG4gICAgJy0gXHU0RTBEXHU3NTI4IERPTSBcdTVDNDJcdTdFQTdcdTYyMTYgbnRoLWNoaWxkIFx1NjZGRlx1NEVFM1x1NURGMlx1NjcwOVx1NzY4NFx1N0EzM1x1NUI5QVx1NEUxQVx1NTJBMVx1OTAwOVx1NjJFOVx1NTY2OFx1MzAwMicsXG4gICAgJy0gXHU2Nzg0XHU1RUZBXHU2MjEwXHU1MjlGXHU1NDBFXHU2OEMwXHU2N0U1XHU1M0Q3XHU1RjcxXHU1NENEXHU5ODc1XHU5NzYyXHU1M0NBXHU1MTc2XHU0RTBBXHU0RTBCXHU2RTM4XHU4REYzXHU4RjZDXHUzMDAyJyxcbiAgKVxuICByZXR1cm4gbGluZXMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGNvbnN0IFJFVklFV19UWVBFX0xBQkVMUyA9IFRZUEVfTEFCRUxTXG4iLCAiaW1wb3J0IHsgaXNTY3JvbGxhYmxlT3ZlcmZsb3cgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5cbmNvbnN0IFNUWUxFX0tFWVMgPSBbXG4gICd3aWR0aCcsXG4gICdoZWlnaHQnLFxuICAnbWluV2lkdGgnLFxuICAnbWluSGVpZ2h0JyxcbiAgJ292ZXJmbG93JyxcbiAgJ292ZXJmbG93WCcsXG4gICdvdmVyZmxvd1knLFxuICAnbWF4V2lkdGgnLFxuICAnbWF4SGVpZ2h0Jyxcbl1cblxuLyoqIFx1ODI4Mlx1NzBCOVx1NUY1M1x1NTI0RFx1NjYyRlx1NTQyNlx1NTZFMCBvdmVyZmxvdyBcdTRFQTdcdTc1MUZcdTUzRUZcdTZFREFcdTUyQThcdTZFQTJcdTUxRkEgKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUoZWwpIHtcbiAgaWYgKCFlbCB8fCBlbC5ub2RlVHlwZSAhPT0gMSkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZWwpXG4gIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIGVsLnNjcm9sbEhlaWdodCA+IGVsLmNsaWVudEhlaWdodCArIDFcbiAgY29uc3QgY2FuWCA9IGlzU2Nyb2xsYWJsZU92ZXJmbG93KHN0eWxlLm92ZXJmbG93WCkgJiYgZWwuc2Nyb2xsV2lkdGggPiBlbC5jbGllbnRXaWR0aCArIDFcbiAgcmV0dXJuIGNhblkgfHwgY2FuWFxufVxuXG5mdW5jdGlvbiBkZXB0aEZyb20ocm9vdEVsLCBlbCkge1xuICBsZXQgZGVwdGggPSAwXG4gIGxldCBub2RlID0gZWxcbiAgd2hpbGUgKG5vZGUgJiYgbm9kZSAhPT0gcm9vdEVsKSB7XG4gICAgZGVwdGggKz0gMVxuICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgfVxuICByZXR1cm4gZGVwdGhcbn1cblxuLyoqXG4gKiBcdTY1MzZcdTk2QzZcdTk3MDBcdTY0OTFcdTVGMDBcdTc2ODRcdTgyODJcdTcwQjlcdUZGMUFcdTUzRUZcdTZFREFcdTUyQThcdTgyODJcdTcwQjkgKyBcdTRFMEFcdTZFQUZcdTUyMzAgcm9vdCBcdTc2ODRcdTc5NTZcdTUxNDhcdTMwMDJcbiAqIFx1NkRGMVx1ODI4Mlx1NzBCOVx1NTcyOFx1NTI0RFx1RkYwQ1x1NTE0OFx1NjQ5MVx1NTE4NVx1NUM0Mlx1NTE4RFx1NjQ5MVx1NTkxNlx1NThGM1x1RkYwOFx1OTA3Rlx1NTE0RCBncmlkIC8gd2lkdGg6MTAwJSBcdTYyOEFcdTU5MTZcdTY4NDZcdTUzNjFcdTZCN0JcdUZGMDlcdTMwMDJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKSB7XG4gIGlmICghcm9vdEVsKSByZXR1cm4gW11cbiAgY29uc3Qgc2Nyb2xsYWJsZXMgPSBbXVxuICBjb25zdCB2aXNpdCA9IChub2RlKSA9PiB7XG4gICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuID8gQXJyYXkuZnJvbShub2RlLmNoaWxkcmVuKSA6IFtdXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikgdmlzaXQoY2hpbGQpXG4gICAgaWYgKG5vZGUgPT09IHJvb3RFbCB8fCBpc0V4cGFuZGFibGVPdmVyZmxvd05vZGUobm9kZSkpIHNjcm9sbGFibGVzLnB1c2gobm9kZSlcbiAgfVxuICB2aXNpdChyb290RWwpXG5cbiAgY29uc3Qgc2V0ID0gbmV3IFNldChzY3JvbGxhYmxlcylcbiAgZm9yIChjb25zdCBlbCBvZiBzY3JvbGxhYmxlcykge1xuICAgIC8vIHJvb3QgXHU2NzJDXHU4RUFCXHU1REYyXHU1NzI4XHU5NkM2XHU1NDA4XHU0RTJEXHVGRjFCXHU0RUNFXHU1QjgzXHU3Njg0XHU3MjM2XHU4MjgyXHU3MEI5XHU3RUU3XHU3RUVEXHU0RTBBXHU2RUFGXHU0RjFBXHU4RDhBXHU4RkM3IHNjcmVlbiBcdThGQjlcdTc1NENcdUZGMENcbiAgICAvLyBcdTYyOEEgU2NyZWVuRnJhbWVcdTMwMDFjYW52YXNcdTMwMDFib2FyZCBcdTc1MUFcdTgxRjMgYm9keS9odG1sIFx1NEUwMFx1NUU3Nlx1NjUzOVx1NTE5OVx1MzAwMlxuICAgIGlmIChlbCA9PT0gcm9vdEVsKSBjb250aW51ZVxuICAgIGxldCBub2RlID0gZWwucGFyZW50RWxlbWVudFxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBzZXQuYWRkKG5vZGUpXG4gICAgICBpZiAobm9kZSA9PT0gcm9vdEVsKSBicmVha1xuICAgICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4uc2V0XS5zb3J0KChhLCBiKSA9PiBkZXB0aEZyb20ocm9vdEVsLCBiKSAtIGRlcHRoRnJvbShyb290RWwsIGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc25hcHNob3RJbmxpbmVCb3goZWwpIHtcbiAgY29uc3Qgb3V0ID0ge31cbiAgZm9yIChjb25zdCBrZXkgb2YgU1RZTEVfS0VZUykgb3V0W2tleV0gPSBlbC5zdHlsZVtrZXldIHx8ICcnXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVJbmxpbmVCb3goZWwsIHNuYXBzaG90KSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIHtcbiAgICBlbC5zdHlsZVtrZXldID0gc25hcHNob3Rba2V5XSB8fCAnJ1xuICB9XG59XG5cbi8qKlxuICogb2Zmc2V0VG9wIC8gb2Zmc2V0TGVmdCBcdTc2RjhcdTVCRjkgb2Zmc2V0UGFyZW50XHVGRjBDXHU4MDBDXHU0RTBEXHU0RTAwXHU1QjlBXHU3NkY4XHU1QkY5XHU3NkY0XHU2M0E1XHU3MjM2XHU4MjgyXHU3MEI5XHUzMDAyXG4gKiBcdTU0MEVcdTUzRjBcdTk4NzVcdTkxQ0NcdThGREVcdTdFRURcdTc2ODQgc3RhdGljIFx1NUJCOVx1NTY2OFx1OTAxQVx1NUUzOFx1NTE3MVx1NEVBQiBzY3JlZW4gcm9vdCBcdTRGNUNcdTRFM0Egb2Zmc2V0UGFyZW50XHVGRjBDXG4gKiBcdTU2RTBcdTZCNjRcdTk3MDBcdTg5ODFcdTUxNDhcdTYzNjJcdTdCOTdcdTUyMzBcdTVGNTNcdTUyNERcdTcyMzZcdTgyODJcdTcwQjlcdTU3NTBcdTY4MDdcdUZGMENcdTkwN0ZcdTUxNERcdTkwMTBcdTVDNDJcdTkxQ0RcdTU5MERcdTdEMkZcdTUyQTBcdTU0MENcdTRFMDBcdTZCQjVcdTUwNEZcdTc5RkJcdTMwMDJcbiAqL1xuZnVuY3Rpb24gY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsIGF4aXMpIHtcbiAgY29uc3Qgb2Zmc2V0S2V5ID0gYXhpcyA9PT0gJ3gnID8gJ29mZnNldExlZnQnIDogJ29mZnNldFRvcCdcbiAgY29uc3QgcmVjdFN0YXJ0ID0gYXhpcyA9PT0gJ3gnID8gJ2xlZnQnIDogJ3RvcCdcbiAgY29uc3QgcmVjdFNpemUgPSBheGlzID09PSAneCcgPyAnd2lkdGgnIDogJ2hlaWdodCdcbiAgY29uc3QgbGF5b3V0U2l6ZSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuICBjb25zdCBzY3JvbGxLZXkgPSBheGlzID09PSAneCcgPyAnc2Nyb2xsTGVmdCcgOiAnc2Nyb2xsVG9wJ1xuICBjb25zdCBjaGlsZE9mZnNldCA9IGNoaWxkW29mZnNldEtleV0gfHwgMFxuXG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsKSByZXR1cm4gY2hpbGRPZmZzZXRcbiAgaWYgKGNoaWxkLm9mZnNldFBhcmVudCAmJiBjaGlsZC5vZmZzZXRQYXJlbnQgPT09IGVsLm9mZnNldFBhcmVudCkge1xuICAgIHJldHVybiBjaGlsZE9mZnNldCAtIChlbFtvZmZzZXRLZXldIHx8IDApXG4gIH1cblxuICBpZiAodHlwZW9mIGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICYmIHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBwYXJlbnRSZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCBjaGlsZFJlY3QgPSBjaGlsZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgIGNvbnN0IHJlbmRlcmVkU2l6ZSA9IHBhcmVudFJlY3RbcmVjdFNpemVdXG4gICAgY29uc3Qgc2NhbGUgPSBlbFtsYXlvdXRTaXplXSA+IDAgJiYgcmVuZGVyZWRTaXplID4gMFxuICAgICAgPyByZW5kZXJlZFNpemUgLyBlbFtsYXlvdXRTaXplXVxuICAgICAgOiAxXG4gICAgY29uc3Qgc3RhcnQgPSAoY2hpbGRSZWN0W3JlY3RTdGFydF0gLSBwYXJlbnRSZWN0W3JlY3RTdGFydF0pIC8gc2NhbGVcbiAgICAgICsgKGVsW3Njcm9sbEtleV0gfHwgMClcbiAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHN0YXJ0KSkgcmV0dXJuIHN0YXJ0XG4gIH1cblxuICByZXR1cm4gY2hpbGRPZmZzZXRcbn1cblxuLyoqXG4gKiBvdmVyZmxvdzp2aXNpYmxlIFx1NjVGNlx1OTBFOFx1NTIwNlx1NkQ0Rlx1ODlDOFx1NTY2OCBzY3JvbGxXaWR0aCBcdTIyNDggY2xpZW50V2lkdGhcdUZGMENcbiAqIFx1NjI0MFx1NEVFNVx1NTE4RFx1NjI2Qlx1NUI1MFx1ODI4Mlx1NzBCOSBvZmZzZXQgXHU4RkI5XHU3NTRDXHVGRjBDXHU5MDdGXHU1MTREXHU1QkJEXHU4ODY4XHU2NDkxXHU0RTBEXHU1RjAwXHU1OTE2XHU2ODQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtZWFzdXJlSW50cmluc2ljQm94KGVsKSB7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KGVsLnNjcm9sbFdpZHRoIHx8IDAsIGVsLm9mZnNldFdpZHRoIHx8IDApXG4gIGxldCBoZWlnaHQgPSBNYXRoLm1heChlbC5zY3JvbGxIZWlnaHQgfHwgMCwgZWwub2Zmc2V0SGVpZ2h0IHx8IDApXG4gIGNvbnN0IGNoaWxkcmVuID0gZWwuY2hpbGRyZW4gPyBBcnJheS5mcm9tKGVsLmNoaWxkcmVuKSA6IFtdXG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICB3aWR0aCA9IE1hdGgubWF4KHdpZHRoLCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3gnKSArIChjaGlsZC5vZmZzZXRXaWR0aCB8fCAwKSlcbiAgICBoZWlnaHQgPSBNYXRoLm1heChoZWlnaHQsIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCAneScpICsgKGNoaWxkLm9mZnNldEhlaWdodCB8fCAwKSlcbiAgfVxuICByZXR1cm4geyB3aWR0aCwgaGVpZ2h0IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5RXhwYW5kZWRCb3goZWwpIHtcbiAgZWwuc3R5bGUubWF4V2lkdGggPSAnbm9uZSdcbiAgZWwuc3R5bGUubWF4SGVpZ2h0ID0gJ25vbmUnXG4gIGVsLnN0eWxlLm92ZXJmbG93ID0gJ3Zpc2libGUnXG4gIGVsLnN0eWxlLm92ZXJmbG93WCA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1kgPSAndmlzaWJsZSdcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBtZWFzdXJlSW50cmluc2ljQm94KGVsKVxuICBlbC5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG4gIGVsLnN0eWxlLm1pbldpZHRoID0gYCR7d2lkdGh9cHhgXG4gIGVsLnN0eWxlLm1pbkhlaWdodCA9IGAke2hlaWdodH1weGBcbn1cblxuLyoqIFx1NjQ5MVx1NUYwMCByb290IFx1NTE4NVx1NjI0MFx1NjcwOVx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTNDQVx1NTE3Nlx1Nzk1Nlx1NTE0OFx1RkYxQlx1OEZENFx1NTZERVx1NzUyOFx1NEU4RVx1NjUzNlx1OEQ3N1x1NzY4NFx1NUZFQlx1NzE2N1x1NTIxN1x1ODg2OCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdEVsKSB7XG4gIGNvbnN0IG5vZGVzID0gbGlzdEV4cGFuZGFibGVOb2Rlcyhyb290RWwpXG4gIGNvbnN0IHNuYXBzaG90cyA9IG5vZGVzLm1hcCgoZWwpID0+ICh7IGVsLCBzdHlsZTogc25hcHNob3RJbmxpbmVCb3goZWwpIH0pKVxuICBmb3IgKGNvbnN0IHsgZWwgfSBvZiBzbmFwc2hvdHMpIGFwcGx5RXhwYW5kZWRCb3goZWwpXG4gIC8vIFx1NUI1MFx1N0VBN1x1NjQ5MVx1NUYwMFx1NTQwRVx1RkYwQ1x1NjgzOVx1NTE4RFx1OTFDRlx1NEUwMFx1NkIyMVx1RkYwQ1x1NTQwM1x1NjM4OVx1NkI4Qlx1NEY1OVx1NkVBMlx1NTFGQVxuICBhcHBseUV4cGFuZGVkQm94KHJvb3RFbClcbiAgcmV0dXJuIHNuYXBzaG90c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGFwc2VTY3JlZW5Db250ZW50KHNuYXBzaG90cykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc25hcHNob3RzKSkgcmV0dXJuXG4gIGZvciAoY29uc3QgeyBlbCwgc3R5bGUgfSBvZiBzbmFwc2hvdHMpIHJlc3RvcmVJbmxpbmVCb3goZWwsIHN0eWxlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUNvbnRlbnRCb3gocm9vdEVsKSB7XG4gIHJldHVybiBtZWFzdXJlSW50cmluc2ljQm94KHJvb3RFbClcbn1cblxuLyoqXG4gKiBcdTVERTVcdTUxNzdcdTY4MEZcdTVDNTVcdTVGMDAvXHU2NTM2XHU4RDc3XHU3NkVFXHU2ODA3XHVGRjFBXG4gKiBcdTY3MDlcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTJGRVx1OTAwOVx1OTZDNlx1NTQwOFx1RkYxQlx1NjVFMFx1NTJGRVx1OTAwOSBcdTIxOTIgXHU1MTY4XHU5MEU4XHU1QzRGXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsSWRzKSB7XG4gIGlmIChzZWxlY3RlZElkcyBpbnN0YW5jZW9mIFNldCkge1xuICAgIGlmIChzZWxlY3RlZElkcy5zaXplID4gMCkgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdGVkSWRzKSAmJiBzZWxlY3RlZElkcy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIFsuLi5zZWxlY3RlZElkc11cbiAgfVxuICByZXR1cm4gWy4uLmFsbElkc11cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3gnXG5pbXBvcnQgeyBTY3JlZW5JZGVudGl0eVByb3ZpZGVyIH0gZnJvbSAnLi4vY29yZS9TY3JlZW5JZGVudGl0eS5qc3gnXG5pbXBvcnQgeyBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuLi91aS9mbG93LXRhcmdldC5qcydcbmltcG9ydCB7IGZpbmRSZXZpZXdUYXJnZXQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7XG4gIGNvbGxhcHNlU2NyZWVuQ29udGVudCxcbiAgZXhwYW5kU2NyZWVuQ29udGVudCxcbiAgbWVhc3VyZUNvbnRlbnRCb3gsXG59IGZyb20gJy4vZXhwYW5kLmpzJ1xuaW1wb3J0IHtcbiAgYmVnaW5Db250ZW50RHJhZ1Njcm9sbCxcbiAgZW5kQ29udGVudERyYWdTY3JvbGwsXG4gIG1vdmVDb250ZW50RHJhZ1Njcm9sbCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2NyZWVuRnJhbWUoe1xuICBzY3JlZW4sXG4gIHZpZXdwb3J0LFxuICBtb2RlLFxuICBpbmRleCA9IDAsXG4gIGZvY3VzZWQgPSBmYWxzZSxcbiAgb25FeHBvcnQsXG4gIGV4cGFuZGVkID0gZmFsc2UsXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBjYW52YXNMb2NrZWQgPSBmYWxzZSxcbiAgc2NhbGUgPSAxLFxuICByZXZpZXdFbmFibGVkID0gZmFsc2UsXG4gIG9uUmV2aWV3U2VsZWN0LFxufSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBjb250ZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgZXhwYW5kU25hcHNob3RSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgaG92ZXJSZXZpZXdFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnU2Nyb2xsaW5nLCBzZXREcmFnU2Nyb2xsaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWRCb3gsIHNldEV4cGFuZGVkQm94XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCByb290ID0gY29udGVudFJlZi5jdXJyZW50XG4gICAgaWYgKCFyb290IHx8ICFzY3JlZW4pIHJldHVybiB1bmRlZmluZWRcblxuICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgIGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKCFleHBhbmRlZCkge1xuICAgICAgc2V0RXhwYW5kZWRCb3gobnVsbClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gZXhwYW5kU2NyZWVuQ29udGVudChyb290KVxuICAgIHNldEV4cGFuZGVkQm94KG1lYXN1cmVDb250ZW50Qm94KHJvb3QpKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KSB7XG4gICAgICAgIGNvbGxhcHNlU2NyZWVuQ29udGVudChleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50KVxuICAgICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgfSwgW2V4cGFuZGVkLCBzY3JlZW4/LmlkLCB2aWV3cG9ydC53aWR0aCwgdmlld3BvcnQuaGVpZ2h0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICB9XG4gIH0sIFtjYW52YXNMb2NrZWQsIHJldmlld0VuYWJsZWQsIHNjcmVlbj8uaWRdKVxuXG4gIGlmICghc2NyZWVuKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IENvbXBvbmVudCA9IHNjcmVlbi5jb21wb25lbnRcbiAgY29uc3QgZnJhbWVDbGFzcyA9IFtcbiAgICAnd2Ytc2NyZWVuLWNocm9tZScsXG4gICAgbW9kZSA9PT0gJ2NhbnZhcycgJiYgZm9jdXNlZCA/ICdpcy1mb2N1c2VkJyA6ICcnLFxuICAgIGV4cGFuZGVkID8gJ2lzLWV4cGFuZGVkJyA6ICcnLFxuICAgIGB3Zi1zY3JlZW4tJHttb2RlfWAsXG4gIF0uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJyAnKVxuXG4gIGNvbnN0IG9uUG9pbnRlckRvd24gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgLy8gXHU3NTNCXHU1RTAzXHU5NTAxXHU1QjlBXHU2NUY2XHU0RTBEXHU2M0E1XHU3QkExXHU1QzRGXHU1MTg1XHU2MkQ2XHU2MkZEXHU2RURBXHU1MkE4XHVGRjBDXHU4QkE5XHU0RThCXHU0RUY2XHU4NDNEXHU1MjMwXHU3NTNCXHU1RTAzXHU1RTczXHU3OUZCXG4gICAgaWYgKGNhbnZhc0xvY2tlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIFx1NURGMlx1NUM1NVx1NUYwMFx1NjVFMFx1NTNFRlx1NkVEQVx1NTMzQVx1NTdERlx1RkYwQ1x1NEUwRFx1NjJBMlx1NjMwN1x1OTQ4OFxuICAgIGlmIChleHBhbmRlZCkgcmV0dXJuXG4gICAgY29uc3Qgc3RhdGUgPSBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIHsgbG9ja2VkOiBjYW52YXNMb2NrZWQsIHNjYWxlIH0pXG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgZHJhZ1JlZi5jdXJyZW50ID0gc3RhdGVcbiAgICBzZXREcmFnU2Nyb2xsaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gIH1cblxuICBjb25zdCBvblBvaW50ZXJNb3ZlID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gZmluZFJldmlld1RhcmdldChldmVudC50YXJnZXQsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICAgIGlmICh0YXJnZXQgPT09IGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50KSByZXR1cm5cbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICB0YXJnZXQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gdGFyZ2V0XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlKSByZXR1cm5cbiAgICBtb3ZlQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGV2ZW50KVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyRW5kID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc3RhdGUgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIXN0YXRlIHx8IHN0YXRlLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICBlbmRDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnU2Nyb2xsaW5nKGZhbHNlKVxuICB9XG5cbiAgY29uc3Qgb25Db250ZW50Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkgcmV0dXJuXG4gICAgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrKGV2ZW50LCBjb250ZW50UmVmLmN1cnJlbnQsIG5hdmlnYXRlKVxuICB9XG5cbiAgY29uc3Qgb25SZXZpZXdDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghcmV2aWV3RW5hYmxlZCB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgaWYgKCF0YXJnZXQpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIG9uUmV2aWV3U2VsZWN0Py4odGFyZ2V0LCBzY3JlZW4sIGNvbnRlbnRSZWYuY3VycmVudCwge1xuICAgICAgYWRkaXRpdmU6IGV2ZW50LnNoaWZ0S2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuY3RybEtleSxcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgY2xlYXJSZXZpZXdIb3ZlciA9ICgpID0+IHtcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGhvdmVyUmV2aWV3RWxlbWVudFJlZi5jdXJyZW50ID0gbnVsbFxuICB9XG5cbiAgY29uc3QgY29udGVudFN0eWxlID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3hcbiAgICA/IHsgd2lkdGg6IGV4cGFuZGVkQm94LndpZHRoLCBoZWlnaHQ6IGV4cGFuZGVkQm94LmhlaWdodCwgb3ZlcmZsb3c6ICd2aXNpYmxlJyB9XG4gICAgOiB7IHdpZHRoOiB2aWV3cG9ydC53aWR0aCwgaGVpZ2h0OiB2aWV3cG9ydC5oZWlnaHQgfVxuXG4gIGNvbnN0IGZyYW1lV2lkdGggPSBleHBhbmRlZCAmJiBleHBhbmRlZEJveCA/IGV4cGFuZGVkQm94LndpZHRoIDogdmlld3BvcnQud2lkdGhcblxuICByZXR1cm4gKFxuICAgIDxzZWN0aW9uXG4gICAgICBjbGFzc05hbWU9e2ZyYW1lQ2xhc3N9XG4gICAgICBkYXRhLXNjcmVlbi1pZD17c2NyZWVuLmlkfVxuICAgICAgZGF0YS1leHBhbmRlZD17ZXhwYW5kZWQgPyAndHJ1ZScgOiAnZmFsc2UnfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IGZyYW1lV2lkdGggfX1cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtbGFiZWxcIj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS10aXRsZVwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1maWxlXCI+e3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICA8L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtYWN0aW9uc1wiPlxuICAgICAgICAgIHtvblRvZ2dsZUV4cGFuZCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cGFuZC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kKClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2V4cGFuZGVkID8gJ1x1NjUzNlx1OEQ3NycgOiAnXHU1QzU1XHU1RjAwJ31cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyAmJiBvbkV4cG9ydCA/IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWV4cG9ydC1vbmVcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgICAgIG9uRXhwb3J0KClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgXHU1QkZDXHU1MUZBIFBOR1xuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e2NvbnRlbnRSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1jb250ZW50JHtkcmFnU2Nyb2xsaW5nID8gJyBpcy1kcmFnLXNjcm9sbGluZycgOiAnJ30ke2V4cGFuZGVkID8gJyBpcy1leHBhbmRlZCcgOiAnJ30ke3Jldmlld0VuYWJsZWQgJiYgIWNhbnZhc0xvY2tlZCA/ICcgaXMtcmV2aWV3aW5nJyA6ICcnfWB9XG4gICAgICAgIHN0eWxlPXtjb250ZW50U3R5bGV9XG4gICAgICAgIG9uUG9pbnRlckRvd249e29uUG9pbnRlckRvd259XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e29uUG9pbnRlck1vdmV9XG4gICAgICAgIG9uUG9pbnRlclVwPXtvblBvaW50ZXJFbmR9XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJMZWF2ZT17Y2xlYXJSZXZpZXdIb3Zlcn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e29uUmV2aWV3Q2xpY2t9XG4gICAgICAgIG9uQ2xpY2s9e29uQ29udGVudENsaWNrfVxuICAgICAgPlxuICAgICAgICA8RXJyb3JCb3VuZGFyeVxuICAgICAgICAgIHNjb3BlPVwic2NyZWVuXCJcbiAgICAgICAgICByZXNldEtleT17c2NyZWVuLmlkfVxuICAgICAgICAgIHNjcmVlbklkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgc291cmNlPXtgc3JjL3NjcmVlbnMvJHtzY3JlZW4uaWR9LmpzeGB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2NyZWVuSWRlbnRpdHlQcm92aWRlciBzY3JlZW5JZD17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgIDxDb21wb25lbnQgLz5cbiAgICAgICAgICA8L1NjcmVlbklkZW50aXR5UHJvdmlkZXI+XG4gICAgICAgIDwvRXJyb3JCb3VuZGFyeT5cbiAgICAgIDwvZGl2PlxuICAgIDwvc2VjdGlvbj5cbiAgKVxufVxuIiwgImltcG9ydCB7IGNsYW1wU2NhbGUsIHNob3VsZFpvb21PbldoZWVsIH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG4vKiogXHU3RUQxXHU1QjlBXHU5NzVFIHBhc3NpdmUgd2hlZWxcdUZGMENcdTYyNERcdTgwRkRcdTU0MDhcdTZDRDUgcHJldmVudERlZmF1bHRcdUZGMDhSZWFjdCBvbldoZWVsIFx1OUVEOFx1OEJBNCBwYXNzaXZlXHVGRjA5XHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gYmluZFdoZWVsWm9vbShlbCwgZ2V0U2NhbGUsIHNldFNjYWxlLCBnZXRMb2NrZWQgPSAoKSA9PiBmYWxzZSkge1xuICBpZiAoIWVsKSByZXR1cm4gKCkgPT4ge31cbiAgY29uc3Qgb25XaGVlbCA9IChldmVudCkgPT4ge1xuICAgIGlmICghc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkOiBnZXRMb2NrZWQoKSB9KSkgcmV0dXJuXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIHNldFNjYWxlKGNsYW1wU2NhbGUoZ2V0U2NhbGUoKSAqIChldmVudC5kZWx0YVkgPiAwID8gMC45IDogMS4xKSkpXG4gIH1cbiAgZWwuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0pXG4gIHJldHVybiAoKSA9PiBlbC5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIG9uV2hlZWwpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VXaGVlbFpvb20oZWxlbWVudFJlZiwgc2NhbGUsIHNldFNjYWxlLCBsb2NrZWQgPSBmYWxzZSkge1xuICBjb25zdCBzY2FsZVJlZiA9IFJlYWN0LnVzZVJlZihzY2FsZSlcbiAgY29uc3QgbG9ja2VkUmVmID0gUmVhY3QudXNlUmVmKGxvY2tlZClcbiAgc2NhbGVSZWYuY3VycmVudCA9IHNjYWxlXG4gIGxvY2tlZFJlZi5jdXJyZW50ID0gbG9ja2VkXG5cbiAgUmVhY3QudXNlRWZmZWN0KFxuICAgICgpID0+IGJpbmRXaGVlbFpvb20oXG4gICAgICBlbGVtZW50UmVmLmN1cnJlbnQsXG4gICAgICAoKSA9PiBzY2FsZVJlZi5jdXJyZW50LFxuICAgICAgc2V0U2NhbGUsXG4gICAgICAoKSA9PiBsb2NrZWRSZWYuY3VycmVudCxcbiAgICApLFxuICAgIFtlbGVtZW50UmVmLCBzZXRTY2FsZV0sXG4gIClcbn1cbiIsICJleHBvcnQgZnVuY3Rpb24gY2FuVXNlRGVtbyhzY3JlZW5zKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNjcmVlbnMpICYmIHNjcmVlbnMuc29tZSgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkgPT09IHRydWUpXG59XG4iLCAiZXhwb3J0IGNvbnN0IENBTlZBU19JTkRFWF9NQVJHSU4gPSAxNlxuXG5mdW5jdGlvbiBmaW5pdGUodmFsdWUsIGZhbGxiYWNrID0gMCkge1xuICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHZhbHVlKSA/IHZhbHVlIDogZmFsbGJhY2tcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsYW1wQ2FudmFzSW5kZXhQb3NpdGlvbihwb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIGNvbnN0IGNvbnRhaW5lcldpZHRoID0gTWF0aC5tYXgoMCwgZmluaXRlKGNvbnRhaW5lcj8ud2lkdGgpKVxuICBjb25zdCBjb250YWluZXJIZWlnaHQgPSBNYXRoLm1heCgwLCBmaW5pdGUoY29udGFpbmVyPy5oZWlnaHQpKVxuICBjb25zdCBpdGVtV2lkdGggPSBNYXRoLm1heCgwLCBmaW5pdGUoaXRlbT8ud2lkdGgpKVxuICBjb25zdCBpdGVtSGVpZ2h0ID0gTWF0aC5tYXgoMCwgZmluaXRlKGl0ZW0/LmhlaWdodCkpXG4gIGNvbnN0IG1heFggPSBNYXRoLm1heChtYXJnaW4sIGNvbnRhaW5lcldpZHRoIC0gaXRlbVdpZHRoIC0gbWFyZ2luKVxuICBjb25zdCBtYXhZID0gTWF0aC5tYXgobWFyZ2luLCBjb250YWluZXJIZWlnaHQgLSBpdGVtSGVpZ2h0IC0gbWFyZ2luKVxuICByZXR1cm4ge1xuICAgIHg6IE1hdGgubWluKE1hdGgubWF4KGZpbml0ZShwb3NpdGlvbj8ueCwgbWFyZ2luKSwgbWFyZ2luKSwgbWF4WCksXG4gICAgeTogTWF0aC5taW4oTWF0aC5tYXgoZmluaXRlKHBvc2l0aW9uPy55LCBtYXJnaW4pLCBtYXJnaW4pLCBtYXhZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVmYXVsdENhbnZhc0luZGV4UG9zaXRpb24oY29udGFpbmVyLCBpdGVtLCBtYXJnaW4gPSBDQU5WQVNfSU5ERVhfTUFSR0lOKSB7XG4gIHJldHVybiBjbGFtcENhbnZhc0luZGV4UG9zaXRpb24oe1xuICAgIHg6IChmaW5pdGUoY29udGFpbmVyPy53aWR0aCkgLSBmaW5pdGUoaXRlbT8ud2lkdGgpKSAvIDIsXG4gICAgeTogZmluaXRlKGNvbnRhaW5lcj8uaGVpZ2h0KSAtIGZpbml0ZShpdGVtPy5oZWlnaHQpIC0gbWFyZ2luLFxuICB9LCBjb250YWluZXIsIGl0ZW0sIG1hcmdpbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKGdldEVsZW1lbnRzLCBvblJlYWR5LCBzY2hlZHVsZXIpIHtcbiAgbGV0IGFjdGl2ZSA9IHRydWVcbiAgbGV0IGZyYW1lID0gbnVsbFxuXG4gIGNvbnN0IGF0dGVtcHQgPSAoKSA9PiB7XG4gICAgaWYgKCFhY3RpdmUpIHJldHVyblxuICAgIGNvbnN0IGVsZW1lbnRzID0gZ2V0RWxlbWVudHMoKVxuICAgIGlmICghZWxlbWVudHM/LmNvbnRhaW5lciB8fCAhZWxlbWVudHM/Lml0ZW0pIHtcbiAgICAgIGZyYW1lID0gc2NoZWR1bGVyLnJlcXVlc3QoYXR0ZW1wdClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmcmFtZSA9IG51bGxcbiAgICBvblJlYWR5KGVsZW1lbnRzKVxuICB9XG5cbiAgZnJhbWUgPSBzY2hlZHVsZXIucmVxdWVzdChhdHRlbXB0KVxuICByZXR1cm4gKCkgPT4ge1xuICAgIGFjdGl2ZSA9IGZhbHNlXG4gICAgaWYgKGZyYW1lICE9IG51bGwpIHNjaGVkdWxlci5jYW5jZWwoZnJhbWUpXG4gIH1cbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgZm9jdXNDYW52YXNTY3JlZW4sIHJlc2V0Q2FudmFzVmlld3BvcnQsIHBhbkZyb21EcmFnU25hcHNob3QgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBTY3JlZW5GcmFtZSB9IGZyb20gJy4vU2NyZWVuRnJhbWUuanN4J1xuaW1wb3J0IHsgdXNlV2hlZWxab29tIH0gZnJvbSAnLi91c2VXaGVlbFpvb20uanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHtcbiAgY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uLFxuICBkZWZhdWx0Q2FudmFzSW5kZXhQb3NpdGlvbixcbiAgd2FpdEZvckNhbnZhc0luZGV4RWxlbWVudHMsXG59IGZyb20gJy4vY2FudmFzLWluZGV4LmpzJ1xuXG5jb25zdCBJTkRFWF9EUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gZWxlbWVudFNpemUoZWxlbWVudCkge1xuICByZXR1cm4geyB3aWR0aDogZWxlbWVudD8ub2Zmc2V0V2lkdGggfHwgMCwgaGVpZ2h0OiBlbGVtZW50Py5vZmZzZXRIZWlnaHQgfHwgMCB9XG59XG5cbmZ1bmN0aW9uIENhbnZhc0luZGV4KHtcbiAgY2FudmFzUmVmLFxuICBwcm9qZWN0LFxuICBjdXJyZW50U2NyZWVuSWQsXG4gIGRlbW9BdmFpbGFibGUsXG4gIHBvc2l0aW9uLFxuICBvblBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlLFxuICBuYXZpZ2F0ZSxcbiAgZW50ZXJEZW1vLFxufSkge1xuICBjb25zdCBpbmRleFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgY29uc3RyYWluID0gUmVhY3QudXNlQ2FsbGJhY2soKG5leHRQb3NpdGlvbiwgdXNlRGVmYXVsdCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gY2FudmFzUmVmLmN1cnJlbnRcbiAgICBjb25zdCBpbmRleCA9IGluZGV4UmVmLmN1cnJlbnRcbiAgICBpZiAoIWNhbnZhcyB8fCAhaW5kZXgpIHJldHVybiBuZXh0UG9zaXRpb25cbiAgICBjb25zdCBjb250YWluZXIgPSB7IHdpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsIGhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCB9XG4gICAgY29uc3QgaXRlbSA9IGVsZW1lbnRTaXplKGluZGV4KVxuICAgIHJldHVybiB1c2VEZWZhdWx0XG4gICAgICA/IGRlZmF1bHRDYW52YXNJbmRleFBvc2l0aW9uKGNvbnRhaW5lciwgaXRlbSlcbiAgICAgIDogY2xhbXBDYW52YXNJbmRleFBvc2l0aW9uKG5leHRQb3NpdGlvbiwgY29udGFpbmVyLCBpdGVtKVxuICB9LCBbY2FudmFzUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4ge31cbiAgICBjb25zdCBzdG9wV2FpdGluZyA9IHdhaXRGb3JDYW52YXNJbmRleEVsZW1lbnRzKFxuICAgICAgKCkgPT4gKHsgY29udGFpbmVyOiBjYW52YXNSZWYuY3VycmVudCwgaXRlbTogaW5kZXhSZWYuY3VycmVudCB9KSxcbiAgICAgICh7IGNvbnRhaW5lcjogY2FudmFzLCBpdGVtOiBpbmRleCB9KSA9PiB7XG4gICAgICAgIGNvbnN0IHVwZGF0ZSA9ICgpID0+IG9uUG9zaXRpb25DaGFuZ2UoKGN1cnJlbnQpID0+IGNvbnN0cmFpbihjdXJyZW50LCAhY3VycmVudCkpXG4gICAgICAgIHVwZGF0ZSgpXG5cbiAgICAgICAgaWYgKHR5cGVvZiBSZXNpemVPYnNlcnZlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHVwZGF0ZSlcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGNhbnZhcylcbiAgICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGluZGV4KVxuICAgICAgICAgIGRpc2Nvbm5lY3RSZXNpemUgPSAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdXBkYXRlKVxuICAgICAgICBkaXNjb25uZWN0UmVzaXplID0gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHVwZGF0ZSlcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHJlcXVlc3Q6IChjYWxsYmFjaykgPT4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayksXG4gICAgICAgIGNhbmNlbDogKGZyYW1lKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpLFxuICAgICAgfSxcbiAgICApXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcFdhaXRpbmcoKVxuICAgICAgZGlzY29ubmVjdFJlc2l6ZSgpXG4gICAgfVxuICB9LCBbY2FudmFzUmVmLCBjb25zdHJhaW4sIG9uUG9zaXRpb25DaGFuZ2VdKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAoZXZlbnQuY3VycmVudFRhcmdldC5oYXNQb2ludGVyQ2FwdHVyZT8uKGV2ZW50LnBvaW50ZXJJZCkpIHtcbiAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQucmVsZWFzZVBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICB9XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtpbmRleFJlZn1cbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtY2FudmFzLWluZGV4IGlzLWRyYWdnaW5nJyA6ICd3Zi1jYW52YXMtaW5kZXgnfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgdmlzaWJpbGl0eTogJ2hpZGRlbicgfX1cbiAgICA+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtaGFuZGxlXCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIlx1NjJENlx1NTJBOFx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNVwiXG4gICAgICAgIHRpdGxlPVwiXHU2MkQ2XHU1MkE4XHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgICAgY29uc3Qgb3JpZ2luID0gcG9zaXRpb24gfHwgY29uc3RyYWluKG51bGwsIHRydWUpXG4gICAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0ge1xuICAgICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICAgIGNvbnN0IGRlbHRhWCA9IGV2ZW50LmNsaWVudFggLSBkcmFnLnN0YXJ0WFxuICAgICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IElOREVYX0RSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgICBkcmFnLm1vdmVkID0gdHJ1ZVxuICAgICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgICAgb25Qb3NpdGlvbkNoYW5nZShjb25zdHJhaW4oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pKVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvblBvaW50ZXJVcD17ZmluaXNoRHJhZ31cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtZ3JpcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjxpIC8+PGkgLz48aSAvPjwvc3Bhbj5cbiAgICAgICAgPHNwYW4+XHU3RDIyXHU1RjE1PC9zcGFuPlxuICAgICAgPC9idXR0b24+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC1saXN0XCI+XG4gICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLWluZGV4LWRvdCBpcy1hY3RpdmUnIDogJ3dmLWNhbnZhcy1pbmRleC1kb3QnfVxuICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8c3Bhbj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLWZpbGVcIj5zcmMvc2NyZWVucy97c2NyZWVuLmlkfS5qc3g8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICkpfVxuICAgICAgPC9kaXY+XG4gICAgICA8YnV0dG9uXG4gICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtY2xvc2VcIlxuICAgICAgICBhcmlhLWxhYmVsPVwiXHU1MTczXHU5NUVEXHU3NTNCXHU2NzdGXHU3RDIyXHU1RjE1XCJcbiAgICAgICAgdGl0bGU9XCJcdTUxNzNcdTk1RURcdTc1M0JcdTY3N0ZcdTdEMjJcdTVGMTVcIlxuICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgIG9uQ2xvc2UoKVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMTYgMTZcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48cGF0aCBkPVwibTQgNCA4IDhNMTIgNGwtOCA4XCIgLz48L3N2Zz5cbiAgICAgIDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeHBvcnRXaXRoRmVlZGJhY2sodGFzaywgc2V0RXJyb3IpIHtcbiAgc2V0RXJyb3IobnVsbClcbiAgdHJ5IHtcbiAgICBhd2FpdCB0YXNrKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgc2V0RXJyb3IoYFx1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYxQSR7bWVzc2FnZX1gKVxuICB9XG59XG5cbi8qKiBmaWxlOi8vIFx1NEUwRFx1NjYyRiBzZWN1cmUgY29udGV4dFx1RkYwQ2NsaXBib2FyZCBBUEkgXHU1RTM4XHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDZXhlY0NvbW1hbmQgXHU1MTVDXHU1RTk1ICovXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgfVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNNb2RlKHtcbiAgcHJvamVjdCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNlbGVjdGVkSWRzLFxuICBzZXRTZWxlY3RlZElkcyxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBvbkV4cG9ydElkcyxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbiAgY2FudmFzSW5kZXhWaXNpYmxlID0gdHJ1ZSxcbiAgY2FudmFzSW5kZXhQb3NpdGlvbixcbiAgb25DYW52YXNJbmRleFBvc2l0aW9uQ2hhbmdlLFxuICBvbkNsb3NlQ2FudmFzSW5kZXgsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCBuYXZpZ2F0ZSwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBlbnRlckRlbW86IGVudGVyRGVtb01vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzaWRlYmFyQ29sbGFwc2VkLCBzZXRTaWRlYmFyQ29sbGFwc2VkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkS2V5LCBzZXRDb3BpZWRLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgW2NvcHlUb2FzdCwgc2V0Q29weVRvYXN0XSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY2FudmFzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGNvcGllZFRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNjYWxlUmVmID0gUmVhY3QudXNlUmVmKHNjYWxlKVxuICBjb25zdCBkcmFnZ2luZ1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgZGVtb0F2YWlsYWJsZSA9IGNhblVzZURlbW8ocHJvamVjdC5zY3JlZW5zKVxuICBzY2FsZVJlZi5jdXJyZW50ID0gc2NhbGVcbiAgZHJhZ2dpbmdSZWYuY3VycmVudCA9IGRyYWdnaW5nXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBjdXJyZW50LnNjYWxlIH0pKVxuICB9LCBbdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmdSZWYuY3VycmVudCkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY29uc3QgYXBwbHkgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudFxuICAgICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgICBpZiAoIWNhbnZhcyB8fCAhc3RhZ2UpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc2NyZWVuRWwgPSBzdGFnZS5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYW52YXMtc2NyZWVuLWlkPVwiJHtjdXJyZW50U2NyZWVuSWR9XCJdYClcbiAgICAgIGlmICghc2NyZWVuRWwpIHJldHVybiBmYWxzZVxuICAgICAgY29uc3QgY3VycmVudFNjYWxlID0gc2NhbGVSZWYuY3VycmVudFxuICAgICAgaWYgKGN1cnJlbnRTY2FsZSA8PSAwKSByZXR1cm4gZmFsc2VcbiAgICAgIGNvbnN0IHN0YWdlQm94ID0gc3RhZ2UuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IHNjcmVlbkJveCA9IHNjcmVlbkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBjb25zdCBuZXh0ID0gZm9jdXNDYW52YXNTY3JlZW4oe1xuICAgICAgICBjb250YWluZXJXaWR0aDogY2FudmFzLmNsaWVudFdpZHRoLFxuICAgICAgICBjb250YWluZXJIZWlnaHQ6IGNhbnZhcy5jbGllbnRIZWlnaHQsXG4gICAgICAgIHNjcmVlbkxlZnQ6IChzY3JlZW5Cb3gubGVmdCAtIHN0YWdlQm94LmxlZnQpIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5Ub3A6IChzY3JlZW5Cb3gudG9wIC0gc3RhZ2VCb3gudG9wKSAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuV2lkdGg6IHNjcmVlbkJveC53aWR0aCAvIGN1cnJlbnRTY2FsZSxcbiAgICAgICAgc2NyZWVuSGVpZ2h0OiBzY3JlZW5Cb3guaGVpZ2h0IC8gY3VycmVudFNjYWxlLFxuICAgICAgICBjdXJyZW50U2NhbGUsXG4gICAgICB9KVxuICAgICAgaWYgKCFuZXh0KSByZXR1cm4gZmFsc2VcbiAgICAgIHNldFNjYWxlKG5leHQuc2NhbGUpXG4gICAgICBzZXRWaWV3KG5leHQpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChhcHBseSgpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgY29uc3QgZnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGFwcGx5KClcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpXG4gIH0sIFtjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0S2V5LCBzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29waWVkVGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3BpZWRUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICB1c2VXaGVlbFpvb20oY2FudmFzUmVmLCBzY2FsZSwgc2V0U2NhbGUsIGNhbnZhc0xvY2tlZClcblxuICBjb25zdCBzdGFydFBhbiA9IChldmVudCkgPT4ge1xuICAgIGlmICghY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBpZiAoZXZlbnQuYnV0dG9uICE9IG51bGwgJiYgZXZlbnQuYnV0dG9uICE9PSAwKSByZXR1cm5cbiAgICBkcmFnLmN1cnJlbnQgPSB7IHg6IGV2ZW50LmNsaWVudFgsIHk6IGV2ZW50LmNsaWVudFksIHBhblg6IHZpZXcucGFuWCwgcGFuWTogdmlldy5wYW5ZIH1cbiAgICBzZXREcmFnZ2luZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgfVxuXG4gIGNvbnN0IG1vdmVQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBzbmFwc2hvdCA9IGRyYWcuY3VycmVudFxuICAgIGlmICghc25hcHNob3QpIHJldHVyblxuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZXZlbnRcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiBwYW5Gcm9tRHJhZ1NuYXBzaG90KGN1cnJlbnQsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSlcbiAgfVxuXG4gIGNvbnN0IGVuZFBhbiA9ICgpID0+IHtcbiAgICBkcmFnLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gIH1cblxuICBjb25zdCBlbnRlckRlbW8gPSAoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIWRlbW9BdmFpbGFibGUgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBlbnRlckRlbW9Nb2RlKHNjcmVlbklkKVxuICB9XG5cbiAgY29uc3QgY29weU1ldGEgPSAoa2V5LCB0ZXh0LCBldmVudCkgPT4ge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgIGNvcHlUZXh0KHRleHQpLnRoZW4oKCkgPT4ge1xuICAgICAgc2V0Q29waWVkS2V5KGtleSlcbiAgICAgIHNldENvcHlUb2FzdCgnXHU1REYyXHU1OTBEXHU1MjM2JylcbiAgICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gICAgICBjb3BpZWRUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRDb3BpZWRLZXkobnVsbClcbiAgICAgICAgc2V0Q29weVRvYXN0KG51bGwpXG4gICAgICB9LCAxMjAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVTZWxlY3RlZCA9IChpZCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgaWYgKG5leHQuaGFzKGlkKSkgbmV4dC5kZWxldGUoaWQpXG4gICAgICBlbHNlIG5leHQuYWRkKGlkKVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgdG9nZ2xlQWxsID0gKCkgPT4ge1xuICAgIHNldFNlbGVjdGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBpZiAoY3VycmVudC5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpXG4gICAgICByZXR1cm4gbmV3IFNldChwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZCkpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc2hlbGxcIj5cbiAgICAgIDxhc2lkZSBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tc2lkZWJhciR7c2lkZWJhckNvbGxhcHNlZCA/ICcgaXMtY29sbGFwc2VkJyA6ICcnfWB9IGFyaWEtaGlkZGVuPXtzaWRlYmFyQ29sbGFwc2VkfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLWhlYWRlclwiPlxuICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtzZWxlY3RlZElkcy5zaXplID09PSBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoICYmIHByb2plY3Quc2NyZWVucy5sZW5ndGggPiAwfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17dG9nZ2xlQWxsfVxuICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIFx1NTE2OFx1OTAwOVxuICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZVwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRpdGxlPVwiXHU2NTM2XHU4RDc3XHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaWRlYmFyQ29sbGFwc2VkKHRydWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGUtaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCIgeD1cIjNcIiB5PVwiM1wiIHJ4PVwiMlwiIC8+XG4gICAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIm0xNiAxNS0zLTMgMy0zXCIgLz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1saXN0XCI+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eygpID0+IGVudGVyRGVtbyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLmhhcyhzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICAgICAgICB0b2dnbGVTZWxlY3RlZChzY3JlZW4uaWQpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTkwMDlcdTYyRTkgJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgICB0YWJJbmRleD17c2lkZWJhckNvbGxhcHNlZCA/IC0xIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi10aXRsZVwiPntzY3JlZW4udGl0bGV9PC9zcGFuPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC91bD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcHNcIiBhcmlhLWxhYmVsPVwiXHU2NENEXHU0RjVDXHU2M0QwXHU3OTNBXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCIC8gXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10aXBcIj5cbiAgICAgICAgICAgIDxzcGFuPlx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYxQVx1N0E3QVx1NjgzQ1x1NjJENlx1NjJGRCAvIEN0cmwrXHU2RURBXHU4RjZFPC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXNpZGU+XG4gICAgICB7c2lkZWJhckNvbGxhcHNlZCA/IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXNpZGViYXItZXhwYW5kXCJcbiAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU1QzU1XHU1RjAwXHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NUM1NVx1NUYwMFx1NEZBN1x1NjgwRlwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2lkZWJhckNvbGxhcHNlZChmYWxzZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNOSAzdjE4XCIgLz5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJtMTQgOSAzIDMtMyAzXCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxtYWluXG4gICAgICAgIHJlZj17Y2FudmFzUmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1jYW52YXMke2RyYWdnaW5nID8gJyBpcy1kcmFnZ2luZycgOiAnJ30ke2NhbnZhc0xvY2tlZCA/ICcgaXMtbG9ja2VkJyA6ICcnfWB9XG4gICAgICAgIG9uUG9pbnRlckRvd249e3N0YXJ0UGFufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXttb3ZlUGFufVxuICAgICAgICBvblBvaW50ZXJVcD17ZW5kUGFufVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e2VuZFBhbn1cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIHJlZj17c3RhZ2VSZWZ9XG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtY2FudmFzLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB0aXRsZVRleHQgPSBgJHtpbmRleCArIDF9LiAke3NjcmVlbi50aXRsZX1gXG4gICAgICAgICAgICBjb25zdCBmaWxlVGV4dCA9IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgY29uc3QgdGl0bGVLZXkgPSBgJHtzY3JlZW4uaWR9OnRpdGxlYFxuICAgICAgICAgICAgY29uc3QgZmlsZUtleSA9IGAke3NjcmVlbi5pZH06ZmlsZWBcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NjcmVlbi5pZCA9PT0gY3VycmVudFNjcmVlbklkID8gJ3dmLWNhbnZhcy1zY3JlZW4gaXMtZm9jdXNlZCcgOiAnd2YtY2FudmFzLXNjcmVlbid9XG4gICAgICAgICAgICAgICAgZGF0YS1jYW52YXMtc2NyZWVuLWlkPXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAga2V5PXtzY3JlZW4uaWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e2RlbW9BdmFpbGFibGUgPyAnXHU1M0NDXHU1MUZCXHU4RkRCXHU1MTY1XHU2RjE0XHU3OTNBJyA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQuY2xvc2VzdCgnLndmLWV4cG9ydC1vbmUsIC53Zi1leHBhbmQtb25lLCAud2Ytc2NyZWVuLW1ldGEtY29weScpKSByZXR1cm5cbiAgICAgICAgICAgICAgICAgIG5hdmlnYXRlKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uRG91YmxlQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgZW50ZXJEZW1vKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tbWV0YVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tbWV0YS10aXRsZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IHRpdGxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTcwQjlcdTUxRkJcdTU5MERcdTUyMzYnfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IGNvcHlNZXRhKHRpdGxlS2V5LCB0aXRsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RpdGxlVGV4dH1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3NjcmVlbi5kZXNjcmlwdGlvbiA/IDxkaXY+e3NjcmVlbi5kZXNjcmlwdGlvbn08L2Rpdj4gOiBudWxsfVxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3Zi1tZXRhLWxpbmUgd2Ytc2NyZWVuLW1ldGEtY29weSR7Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJyBpcy1jb3BpZWQnIDogJyd9YH1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvcGllZEtleSA9PT0gZmlsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEoZmlsZUtleSwgZmlsZVRleHQsIGV2ZW50KX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHN0cm9uZz5cdTY1ODdcdTRFRjZcdUZGMUE8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAge2ZpbGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgICAgICAgIG1vZGU9XCJjYW52YXNcIlxuICAgICAgICAgICAgICAgICAgaW5kZXg9e2luZGV4fVxuICAgICAgICAgICAgICAgICAgZm9jdXNlZD17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgICAgICBleHBhbmRlZD17ZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17KCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uRXhwb3J0PXsoKSA9PiBvbkV4cG9ydElkcyhbc2NyZWVuLmlkXSl9XG4gICAgICAgICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIHtjYW52YXNJbmRleFZpc2libGUgPyAoXG4gICAgICAgICAgPENhbnZhc0luZGV4XG4gICAgICAgICAgICBjYW52YXNSZWY9e2NhbnZhc1JlZn1cbiAgICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgICBjdXJyZW50U2NyZWVuSWQ9e2N1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgICBwb3NpdGlvbj17Y2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICAgIG9uUG9zaXRpb25DaGFuZ2U9e29uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZX1cbiAgICAgICAgICAgIG9uQ2xvc2U9e29uQ2xvc2VDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG5hdmlnYXRlPXtuYXZpZ2F0ZX1cbiAgICAgICAgICAgIGVudGVyRGVtbz17ZW50ZXJEZW1vfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9tYWluPlxuICAgICAge2NvcHlUb2FzdCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC10b2FzdFwiIHJvbGU9XCJzdGF0dXNcIj57Y29weVRvYXN0fTwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHtcbiAgZml0RGVtb1NjYWxlLFxuICBpc0RlbW9CbGFua0V4aXRUYXJnZXQsXG4gIHBhbkZyb21EcmFnU25hcHNob3QsXG4gIHJlc2V0Q2FudmFzVmlld3BvcnQsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcblxuY29uc3QgQkxBTktfRVhJVF9ISU5UID0gJ1x1NTNDQ1x1NTFGQlx1N0E3QVx1NzY3RFx1NTkwNFx1OTAwMFx1NTFGQVx1NkYxNFx1NzkzQSdcblxuZnVuY3Rpb24gcmVhZENvbnRlbnRCb3goZWwpIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgY29uc3QgcGFkWCA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nUmlnaHQpXG4gIGNvbnN0IHBhZFkgPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKVxuICByZXR1cm4ge1xuICAgIHdpZHRoOiBNYXRoLm1heCgwLCBlbC5jbGllbnRXaWR0aCAtIHBhZFgpLFxuICAgIGhlaWdodDogTWF0aC5tYXgoMCwgZWwuY2xpZW50SGVpZ2h0IC0gcGFkWSksXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERlbW9Nb2RlKHtcbiAgcHJvamVjdCxcbiAgaG90c3BvdHNWaXNpYmxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNjYWxlLFxuICBzZXRTY2FsZSxcbiAgdmlld1Jlc2V0S2V5LFxuICBleHBhbmRlZElkcyA9IG5ldyBTZXQoKSxcbiAgb25Ub2dnbGVFeHBhbmQsXG4gIHJldmlld0VuYWJsZWQgPSBmYWxzZSxcbiAgb25SZXZpZXdTZWxlY3QsXG59KSB7XG4gIGNvbnN0IHsgY3VycmVudFNjcmVlbklkLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIHNldE1vZGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IHNjcmVlbkluZGV4ID0gcHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gY3VycmVudFNjcmVlbklkKVxuICBjb25zdCBzY3JlZW4gPSBzY3JlZW5JbmRleCA+PSAwID8gcHJvamVjdC5zY3JlZW5zW3NjcmVlbkluZGV4XSA6IG51bGxcbiAgY29uc3QgY3VycmVudEV4cGFuZGVkID0gISEoc2NyZWVuICYmIGV4cGFuZGVkSWRzLmhhcyhzY3JlZW4uaWQpKVxuICBjb25zdCBbdmlldywgc2V0Vmlld10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiAoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlIH0pKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHZpZXdwb3J0UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN0YWdlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgZXhpdE9uQmxhbmtEb3VibGVDbGljayA9IChldmVudCkgPT4ge1xuICAgIGlmICghaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkpIHJldHVyblxuICAgIHNldE1vZGUoJ2NhbnZhcycpXG4gIH1cblxuICAvLyB0aXRsZSBcdTYzMDJcdTU3MjhcdTg5QzZcdTUzRTNcdTRFMEFcdTRGMUFcdTg0M0RcdTUyMzBcdTVDNEZcdTUxODVcdTVCNTBcdTgyODJcdTcwQjlcdUZGMENcdTVFNzJcdTYyNzBcdTY0Q0RcdTRGNUNcdUZGMUJcdTUzRUFcdTU3MjhcdTdBN0FcdTc2N0RcdTU5MDRcdTYwQUNcdTUwNUNcdTY1RjZcdTYzMDJcdTRFMEFcdTMwMDJcbiAgY29uc3Qgc3luY0JsYW5rRXhpdEhpbnQgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBlbCA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBpZiAoIWVsKSByZXR1cm5cbiAgICBjb25zdCBuZXh0ID0gaXNEZW1vQmxhbmtFeGl0VGFyZ2V0KGV2ZW50LnRhcmdldCkgPyBCTEFOS19FWElUX0hJTlQgOiAnJ1xuICAgIGlmICgoZWwuZ2V0QXR0cmlidXRlKCd0aXRsZScpIHx8ICcnKSA9PT0gbmV4dCkgcmV0dXJuXG4gICAgaWYgKG5leHQpIGVsLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBuZXh0KVxuICAgIGVsc2UgZWwucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBjbGVhckJsYW5rRXhpdEhpbnQgPSAoKSA9PiB7XG4gICAgdmlld3BvcnRSZWYuY3VycmVudD8ucmVtb3ZlQXR0cmlidXRlKCd0aXRsZScpXG4gIH1cblxuICBjb25zdCBhcHBseUZpdCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgIXN0YWdlKSByZXR1cm5cbiAgICBjb25zdCBib3ggPSByZWFkQ29udGVudEJveChjb250YWluZXIpXG4gICAgY29uc3QgbmV4dCA9IGZpdERlbW9TY2FsZShib3gud2lkdGgsIGJveC5oZWlnaHQsIHN0YWdlLm9mZnNldFdpZHRoLCBzdGFnZS5vZmZzZXRIZWlnaHQpXG4gICAgc2V0U2NhbGUobmV4dClcbiAgICBzZXRWaWV3KHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZTogbmV4dCB9KVxuICB9LCBbc2V0U2NhbGVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgc2NhbGUgfSkpXG4gIH0sIFtzY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjb250YWluZXIgPSB2aWV3cG9ydFJlZi5jdXJyZW50XG4gICAgY29uc3Qgc3RhZ2UgPSBzdGFnZVJlZi5jdXJyZW50XG4gICAgaWYgKCFjb250YWluZXIgfHwgdHlwZW9mIFJlc2l6ZU9ic2VydmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBhcHBseUZpdCgpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICAgIGNvbnN0IG9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IGFwcGx5Rml0KCkpXG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXIpXG4gICAgaWYgKHN0YWdlKSBvYnNlcnZlci5vYnNlcnZlKHN0YWdlKVxuICAgIGFwcGx5Rml0KClcbiAgICByZXR1cm4gKCkgPT4gb2JzZXJ2ZXIuZGlzY29ubmVjdCgpXG4gIH0sIFthcHBseUZpdCwgdmlld3BvcnQsIHZpZXdwb3J0S2V5LCBjdXJyZW50U2NyZWVuSWQsIHZpZXdSZXNldEtleSwgY3VycmVudEV4cGFuZGVkXSlcblxuICB1c2VXaGVlbFpvb20odmlld3BvcnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1kZW1vIGlzLXNob3dpbmctaG90c3BvdHMnIDogJ3dmLWRlbW8nfT5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXt2aWV3cG9ydFJlZn1cbiAgICAgICAgY2xhc3NOYW1lPXtgd2YtZGVtby12aWV3cG9ydCR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgICBvbk1vdXNlTW92ZT17c3luY0JsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17Y2xlYXJCbGFua0V4aXRIaW50fVxuICAgICAgICBvbkRvdWJsZUNsaWNrPXtleGl0T25CbGFua0RvdWJsZUNsaWNrfVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1kZW1vLXN0YWdlXCJcbiAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHt2aWV3LnBhblh9cHgsICR7dmlldy5wYW5ZfXB4KSBzY2FsZSgke3ZpZXcuc2NhbGV9KWAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxTY3JlZW5GcmFtZVxuICAgICAgICAgICAgc2NyZWVuPXtzY3JlZW59XG4gICAgICAgICAgICB2aWV3cG9ydD17dmlld3BvcnR9XG4gICAgICAgICAgICBtb2RlPVwiZGVtb1wiXG4gICAgICAgICAgICBpbmRleD17c2NyZWVuSW5kZXh9XG4gICAgICAgICAgICBleHBhbmRlZD17Y3VycmVudEV4cGFuZGVkfVxuICAgICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3NjcmVlbiAmJiBvblRvZ2dsZUV4cGFuZCA/ICgpID0+IG9uVG9nZ2xlRXhwYW5kKHNjcmVlbi5pZCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICAgIHNjYWxlPXt2aWV3LnNjYWxlfVxuICAgICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtvblJldmlld1NlbGVjdH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAgPHAgY2xhc3NOYW1lPVwid2YtZGVtby1oaW50XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU1MTg1XHU2MzA5XHU5NEFFIC8gXHU5NEZFXHU2M0E1XHU4REYzXHU4RjZDXHVGRjFCXHU1M0VGXHU1NzI4XHU1REU1XHU1MTc3XHU2ODBGXHU1RjAwXHU1MTczXHU3MEVEXHU1MzNBXHU5QUQ4XHU0RUFFXHVGRjFCXHU2ODA3XHU5ODk4XHU2ODBGXHU1M0VGXHU0RTM0XHU2NUY2XHU1QzU1XHU1RjAwXHU3NzBCXHU1MTY4XHU4QzhDPC9wPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgZXhwYW5kU2NyZWVuQ29udGVudCwgbWVhc3VyZUNvbnRlbnRCb3ggfSBmcm9tICcuL2V4cGFuZC5qcydcblxubGV0IGV4cG9ydExpYnJhcmllc1Byb21pc2VcblxuY29uc3QgbGlicmFyaWVzID0gW1xuICB7IGZpbGU6ICdodG1sMmNhbnZhcy5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5odG1sMmNhbnZhcyA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdqc3ppcC5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5KU1ppcCA9PT0gJ2Z1bmN0aW9uJyB9LFxuICB7IGZpbGU6ICdGaWxlU2F2ZXIubWluLmpzJywgcmVhZHk6ICgpID0+IHR5cGVvZiB3aW5kb3cuc2F2ZUFzID09PSAnZnVuY3Rpb24nIH0sXG5dXG5cbmZ1bmN0aW9uIGxvYWRTY3JpcHQoZmlsZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxldCBleGlzdGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYHNjcmlwdFtkYXRhLXdpcmVmcmFtZS1leHBvcnQ9XCIke2ZpbGV9XCJdYClcbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGlmIChleGlzdGluZy5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydFN0YXRlID09PSAnbG9hZGVkJykge1xuICAgICAgICBleGlzdGluZy5yZW1vdmUoKVxuICAgICAgICBleGlzdGluZyA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgcmVzb2x2ZSwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICBleGlzdGluZy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIHJlamVjdCwgeyBvbmNlOiB0cnVlIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgdmVuZG9yQmFzZSA9IHdpbmRvdy5XSVJFRlJBTUVfVkVORE9SX0JBU0VcbiAgICBpZiAoIXZlbmRvckJhc2UpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1x1NjcyQVx1OTE0RFx1N0Y2RVx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5M1x1OERFRlx1NUY4NCBXSVJFRlJBTUVfVkVORE9SX0JBU0UnKSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxuICAgIHNjcmlwdC5zcmMgPSBuZXcgVVJMKGZpbGUsIHZlbmRvckJhc2UpLmhyZWZcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnQgPSBmaWxlXG4gICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGluZydcbiAgICBzY3JpcHQub25sb2FkID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPSAnbG9hZGVkJ1xuICAgICAgcmVzb2x2ZSgpXG4gICAgfVxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgc2NyaXB0LnJlbW92ZSgpXG4gICAgICByZWplY3QobmV3IEVycm9yKGBcdTY1RTBcdTZDRDVcdTUyQTBcdThGN0RcdTY3MkNcdTU3MzBcdTVCRkNcdTUxRkFcdTVFOTMgJHtmaWxlfWApKVxuICAgIH1cbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRFeHBvcnRMaWJyYXJpZXMoKSB7XG4gIGlmICghZXhwb3J0TGlicmFyaWVzUHJvbWlzZSkge1xuICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSBsaWJyYXJpZXMucmVkdWNlKFxuICAgICAgKGNoYWluLCBsaWJyYXJ5KSA9PiBjaGFpbi50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFsaWJyYXJ5LnJlYWR5KCkpIGF3YWl0IGxvYWRTY3JpcHQobGlicmFyeS5maWxlKVxuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgdGhyb3cgbmV3IEVycm9yKGBcdTVCRkNcdTUxRkFcdTVFOTNcdTUyMURcdTU5Q0JcdTUzMTZcdTU5MzFcdThEMjU6ICR7bGlicmFyeS5maWxlfWApXG4gICAgICB9KSxcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpLFxuICAgICkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICBleHBvcnRMaWJyYXJpZXNQcm9taXNlID0gdW5kZWZpbmVkXG4gICAgICB0aHJvdyBlcnJvclxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGV4cG9ydExpYnJhcmllc1Byb21pc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVTY3JlZW4oc2NyZWVuRWxlbWVudCwgdmlld3BvcnQsIHsgZXhwYW5kZWQgPSBmYWxzZSB9ID0ge30pIHtcbiAgaWYgKCFzY3JlZW5FbGVtZW50KSB0aHJvdyBuZXcgRXJyb3IoJ1x1NjI3RVx1NEUwRFx1NTIzMFx1ODk4MVx1NUJGQ1x1NTFGQVx1NzY4NCBzY3JlZW4gXHU1MTQzXHU3RDIwJylcbiAgYXdhaXQgbG9hZEV4cG9ydExpYnJhcmllcygpXG5cbiAgY29uc3Qgc2FuZGJveCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNhbmRib3guY2xhc3NOYW1lID0gJ3dmLWV4cG9ydC1zYW5kYm94J1xuICBjb25zdCBjbG9uZSA9IHNjcmVlbkVsZW1lbnQuY2xvbmVOb2RlKHRydWUpXG4gIHNhbmRib3guYXBwZW5kQ2hpbGQoY2xvbmUpXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2FuZGJveClcblxuICBsZXQgd2lkdGggPSB2aWV3cG9ydC53aWR0aFxuICBsZXQgaGVpZ2h0ID0gdmlld3BvcnQuaGVpZ2h0XG4gIHRyeSB7XG4gICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICBleHBhbmRTY3JlZW5Db250ZW50KGNsb25lKVxuICAgICAgY29uc3QgYm94ID0gbWVhc3VyZUNvbnRlbnRCb3goY2xvbmUpXG4gICAgICB3aWR0aCA9IGJveC53aWR0aFxuICAgICAgaGVpZ2h0ID0gYm94LmhlaWdodFxuICAgIH1cbiAgICBjbG9uZS5zdHlsZS53aWR0aCA9IGAke3dpZHRofXB4YFxuICAgIGNsb25lLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcbiAgICBzYW5kYm94LnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgc2FuZGJveC5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG5cbiAgICBjb25zdCBjYW52YXMgPSBhd2FpdCB3aW5kb3cuaHRtbDJjYW52YXMoY2xvbmUsIHtcbiAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmZmZmZmYnLFxuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBzY2FsZTogMixcbiAgICAgIHVzZUNPUlM6IGZhbHNlLFxuICAgICAgbG9nZ2luZzogZmFsc2UsXG4gICAgfSlcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgKGJsb2IpID0+IGJsb2IgPyByZXNvbHZlKGJsb2IpIDogcmVqZWN0KG5ldyBFcnJvcignUE5HIFx1N0YxNlx1NzgwMVx1NTkzMVx1OEQyNScpKSxcbiAgICAgICAgJ2ltYWdlL3BuZycsXG4gICAgICApXG4gICAgfSlcbiAgfSBmaW5hbGx5IHtcbiAgICBzYW5kYm94LnJlbW92ZSgpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2x1Zyh2YWx1ZSkge1xuICByZXR1cm4gU3RyaW5nKHZhbHVlIHx8ICd3aXJlZnJhbWUnKVxuICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKVxuICAgIC5yZXBsYWNlKC9eLXwtJC9nLCAnJykgfHwgJ3dpcmVmcmFtZSdcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydFNlbGVjdGVkKHNjcmVlbnMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbnMpIHx8IHNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcdTgxRjNcdTVDMTFcdTkwMDlcdTYyRTlcdTRFMDBcdTRFMkEgc2NyZWVuJylcbiAgfVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcbiAgY29uc3QgY2FwdHVyZWQgPSBbXVxuICBmb3IgKGNvbnN0IHNjcmVlbiBvZiBzY3JlZW5zKSB7XG4gICAgY2FwdHVyZWQucHVzaCh7XG4gICAgICBuYW1lOiBgJHtzbHVnKHNjcmVlbi5pZCl9LnBuZ2AsXG4gICAgICBibG9iOiBhd2FpdCBjYXB0dXJlU2NyZWVuKHNjcmVlbi5lbGVtZW50LCBzY3JlZW4udmlld3BvcnQsIHtcbiAgICAgICAgZXhwYW5kZWQ6ICEhc2NyZWVuLmV4cGFuZGVkLFxuICAgICAgfSksXG4gICAgfSlcbiAgfVxuXG4gIGlmIChjYXB0dXJlZC5sZW5ndGggPT09IDEpIHtcbiAgICB3aW5kb3cuc2F2ZUFzKGNhcHR1cmVkWzBdLmJsb2IsIGNhcHR1cmVkWzBdLm5hbWUpXG4gICAgcmV0dXJuXG4gIH1cblxuICBjb25zdCB6aXAgPSBuZXcgd2luZG93LkpTWmlwKClcbiAgY2FwdHVyZWQuZm9yRWFjaCgoaXRlbSkgPT4gemlwLmZpbGUoaXRlbS5uYW1lLCBpdGVtLmJsb2IpKVxuICBjb25zdCBibG9iID0gYXdhaXQgemlwLmdlbmVyYXRlQXN5bmMoeyB0eXBlOiAnYmxvYicgfSlcbiAgd2luZG93LnNhdmVBcyhibG9iLCBgJHtzbHVnKHNjcmVlbnNbMF0ucHJvamVjdE5hbWUpfS56aXBgKVxufVxuIiwgImltcG9ydCB7IGJ1aWxkUmV2aWV3UHJvbXB0LCByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gY29weVRleHQodGV4dCkge1xuICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZCAmJiB3aW5kb3cuaXNTZWN1cmVDb250ZXh0KSByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgY29uc3QgYXJlYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgYXJlYS52YWx1ZSA9IHRleHRcbiAgYXJlYS5zZXRBdHRyaWJ1dGUoJ3JlYWRvbmx5JywgJycpXG4gIGFyZWEuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gIGFyZWEuc3R5bGUubGVmdCA9ICctOTk5OXB4J1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFyZWEpXG4gIGFyZWEuc2VsZWN0KClcbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gIH0gZmluYWxseSB7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhcmVhKVxuICB9XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3UGFuZWwoe1xuICBwcm9qZWN0LFxuICBzZWxlY3Rpb25zLFxuICBtdWx0aVNlbGVjdCxcbiAgaXRlbXMsXG4gIG9uVG9nZ2xlTXVsdGlTZWxlY3QsXG4gIG9uU2VsZWN0RWxlbWVudCxcbiAgb25Ib3ZlckVsZW1lbnQsXG4gIG9uUmVtb3ZlU2VsZWN0aW9uLFxuICBvbkNsZWFyU2VsZWN0aW9uLFxuICBvbkFkZEl0ZW0sXG4gIG9uUmVtb3ZlSXRlbSxcbiAgb25DbG9zZSxcbn0pIHtcbiAgY29uc3Qgc2VsZWN0ZWQgPSBzZWxlY3Rpb25zW3NlbGVjdGlvbnMubGVuZ3RoIC0gMV0gfHwgbnVsbFxuICBjb25zdCBnZW5lcmF0ZWRQcm9tcHQgPSBSZWFjdC51c2VNZW1vKCgpID0+IGJ1aWxkUmV2aWV3UHJvbXB0KHByb2plY3QsIGl0ZW1zKSwgW3Byb2plY3QsIGl0ZW1zXSlcbiAgY29uc3QgW3R5cGUsIHNldFR5cGVdID0gUmVhY3QudXNlU3RhdGUoJ2NvbW1lbnQnKVxuICBjb25zdCBbaW5zdHJ1Y3Rpb24sIHNldEluc3RydWN0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuICBjb25zdCBbcHJvbXB0LCBzZXRQcm9tcHRdID0gUmVhY3QudXNlU3RhdGUoZ2VuZXJhdGVkUHJvbXB0KVxuICBjb25zdCBbcHJvbXB0RGlydHksIHNldFByb21wdERpcnR5XSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbY29waWVkLCBzZXRDb3BpZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGNvcHlUaW1lciA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFwcm9tcHREaXJ0eSkgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgfSwgW2dlbmVyYXRlZFByb21wdCwgcHJvbXB0RGlydHldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICB9LCBbXSlcblxuICBjb25zdCBhZGRJdGVtID0gKCkgPT4ge1xuICAgIGlmIChzZWxlY3Rpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG4gICAgY29uc3Qgbm9ybWFsaXplZCA9IGluc3RydWN0aW9uLnRyaW0oKVxuICAgIGlmICghbm9ybWFsaXplZCAmJiB0eXBlICE9PSAncmVtb3ZlJykgcmV0dXJuXG4gICAgb25BZGRJdGVtKHtcbiAgICAgIHR5cGUsXG4gICAgICB0YXJnZXRzOiBzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uKSA9PiAoe1xuICAgICAgICBzY3JlZW5JZDogc2VsZWN0aW9uLnNjcmVlbklkLFxuICAgICAgICBzY3JlZW5UaXRsZTogc2VsZWN0aW9uLnNjcmVlblRpdGxlLFxuICAgICAgICBzb3VyY2VIaW50OiBzZWxlY3Rpb24uc291cmNlSGludCxcbiAgICAgICAgc2VsZWN0b3I6IHNlbGVjdGlvbi5zZWxlY3RvcixcbiAgICAgICAgY3VycmVudFRleHQ6IHNlbGVjdGlvbi5jdXJyZW50VGV4dCxcbiAgICAgIH0pKSxcbiAgICAgIGluc3RydWN0aW9uOiBub3JtYWxpemVkLFxuICAgIH0pXG4gICAgc2V0SW5zdHJ1Y3Rpb24oJycpXG4gIH1cblxuICBjb25zdCByZWdlbmVyYXRlID0gKCkgPT4ge1xuICAgIHNldFByb21wdChnZW5lcmF0ZWRQcm9tcHQpXG4gICAgc2V0UHJvbXB0RGlydHkoZmFsc2UpXG4gIH1cblxuICBjb25zdCBjb3B5UHJvbXB0ID0gKCkgPT4ge1xuICAgIGNvcHlUZXh0KHByb21wdCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWQodHJ1ZSlcbiAgICAgIGlmIChjb3B5VGltZXIuY3VycmVudCkgd2luZG93LmNsZWFyVGltZW91dChjb3B5VGltZXIuY3VycmVudClcbiAgICAgIGNvcHlUaW1lci5jdXJyZW50ID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gc2V0Q29waWVkKGZhbHNlKSwgMTQwMClcbiAgICB9KVxuICB9XG5cbiAgY29uc3QgaW5zdHJ1Y3Rpb25MYWJlbCA9IHR5cGUgPT09ICd0ZXh0J1xuICAgID8gJ1x1NjVCMFx1NjU4N1x1NUI1NydcbiAgICA6IHR5cGUgPT09ICdvcmRlcidcbiAgICAgID8gJ1x1OTg3QVx1NUU4Rlx1ODk4MVx1NkM0MidcbiAgICAgIDogdHlwZSA9PT0gJ3JlbW92ZSdcbiAgICAgICAgPyAnXHU1MjIwXHU5NjY0XHU4QkY0XHU2NjBFXHVGRjA4XHU1M0VGXHU5MDA5XHVGRjA5J1xuICAgICAgICA6ICdcdTdFRDkgQUkgXHU3Njg0XHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJ1xuXG4gIHJldHVybiAoXG4gICAgPGFzaWRlIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbFwiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEJcIj5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1oZWFkaW5nXCI+XG4gICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtdGl0bGVcIj5cdTRGRUVcdTY1MzlcdTUzOUZcdTU3OEI8L3N0cm9uZz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtY291bnRcIj57aXRlbXMubGVuZ3RofSBcdTY3NjFcdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xvc2VcIiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1ib2R5XCI+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLWhlYWRpbmdcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU1REYyXHU5MDA5XHU4MjgyXHU3MEI5ICh7c2VsZWN0aW9ucy5sZW5ndGh9KTwvaDI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tYWN0aW9uc1wiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttdWx0aVNlbGVjdCA/ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0IGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW11bHRpLXNlbGVjdCd9XG4gICAgICAgICAgICAgICAgYXJpYS1wcmVzc2VkPXttdWx0aVNlbGVjdH1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblRvZ2dsZU11bHRpU2VsZWN0fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1OTFBXHU5MDA5IHttdWx0aVNlbGVjdCA/ICdPTicgOiAnT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY2xlYXItc2VsZWN0aW9uXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e29uQ2xlYXJTZWxlY3Rpb259Plx1NkUwNVx1N0E3QTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGludFwiPlx1NTkxQVx1OTAwOVx1NUYwMFx1NTQyRlx1NTQwRVx1NzBCOVx1NTFGQlx1ODI4Mlx1NzBCOVx1NTNFRlx1NTJBMFx1NTE2NVx1NjIxNlx1NzlGQlx1OTY2NFx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0RiBTaGlmdCAvIENvbW1hbmQgLyBDdHJsIFx1NzBCOVx1NTFGQlx1MzAwMjwvcD5cbiAgICAgICAgICB7c2VsZWN0aW9ucy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb25zXCI+XG4gICAgICAgICAgICAgIHtzZWxlY3Rpb25zLm1hcCgoc2VsZWN0aW9uLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgIDxsaSBjbGFzc05hbWU9e3NlbGVjdGlvbiA9PT0gc2VsZWN0ZWQgPyAnd2YtcmV2aWV3LXNlbGVjdGlvbiBpcy1hY3RpdmUnIDogJ3dmLXJldmlldy1zZWxlY3Rpb24nfSBrZXk9e2Ake3NlbGVjdGlvbi5zY3JlZW5JZH06JHtzZWxlY3Rpb24uc2VsZWN0b3J9YH0+XG4gICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXNlbGVjdG9yXCI+e2luZGV4ICsgMX0uIHtzZWxlY3Rpb24uc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0aW9uLXJlbW92ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZVNlbGVjdGlvbihzZWxlY3Rpb24uZWxlbWVudCl9Plx1NzlGQlx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7c2VsZWN0ZWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zY3JlZW4tbmFtZVwiPntzZWxlY3RlZC5zY3JlZW5UaXRsZX0gXHUwMEI3IHtzZWxlY3RlZC5zY3JlZW5JZH08L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYnNcIiBhcmlhLWxhYmVsPVwiXHU4MjgyXHU3MEI5XHU1QzQyXHU3RUE3XCI+XG4gICAgICAgICAgICAgICAge3NlbGVjdGVkLmFuY2VzdG9ycy5tYXAoKGFuY2VzdG9yLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YW5jZXN0b3Iuc2VsZWN0b3J9PlxuICAgICAgICAgICAgICAgICAgICB7aW5kZXggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iLXNlcFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJtOSAxOCA2LTYtNi02XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYnJlYWRjcnVtYlwiXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2FuY2VzdG9yLnNlbGVjdG9yfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihhbmNlc3Rvci5lbGVtZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICBvbk1vdXNlTGVhdmU9eygpID0+IG9uSG92ZXJFbGVtZW50Py4obnVsbCl9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gb25TZWxlY3RFbGVtZW50KGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2FuY2VzdG9yLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VsZWN0b3JcIj57c2VsZWN0ZWQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgICB7c2VsZWN0ZWQuY3VycmVudFRleHQgPyAoXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWN1cnJlbnQtdGV4dFwiPlx1NUY1M1x1NTI0RFx1RkYxQXtzZWxlY3RlZC5jdXJyZW50VGV4dH08L3A+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+XHU0RkVFXHU2NTM5XHU3QzdCXHU1NzhCPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtc2VsZWN0XCIgdmFsdWU9e3R5cGV9IG9uQ2hhbmdlPXsoZXZlbnQpID0+IHNldFR5cGUoZXZlbnQudGFyZ2V0LnZhbHVlKX0+XG4gICAgICAgICAgICAgICAgICB7T2JqZWN0LmVudHJpZXMoUkVWSUVXX1RZUEVfTEFCRUxTKS5tYXAoKFt2YWx1ZSwgbGFiZWxdKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXR5cGUtb3B0aW9uXCIgdmFsdWU9e3ZhbHVlfSBrZXk9e3ZhbHVlfT57bGFiZWx9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZFwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1maWVsZC1sYWJlbFwiPntpbnN0cnVjdGlvbkxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1pbnN0cnVjdGlvblwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17aW5zdHJ1Y3Rpb259XG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dHlwZSA9PT0gJ29yZGVyJyA/ICdcdTRGOEJcdTU5ODJcdUZGMUFcdTc5RkJcdTUyQThcdTUyMzBcdThCQTJcdTUzNTVcdTY0NThcdTg5ODFcdTRFNEJcdTU0MEUnIDogJ1x1NjNDRlx1OEZGMFx1NUUwQ1x1NjcxQiBBSSBcdTU5ODJcdTRGNTVcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0SW5zdHJ1Y3Rpb24oZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWFkZFwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFpbnN0cnVjdGlvbi50cmltKCkgJiYgdHlwZSAhPT0gJ3JlbW92ZSd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17YWRkSXRlbX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NTJBMFx1NTE2NVx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NVx1RkYwOHtzZWxlY3Rpb25zLmxlbmd0aH0gXHU0RTJBXHU4MjgyXHU3MEI5XHVGRjA5XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1NzBCOVx1NTFGQlx1OTg3NVx1OTc2Mlx1NEUyRFx1NzY4NFx1ODI4Mlx1NzBCOVx1NUYwMFx1NTlDQlx1OEJDNFx1OEJCQVx1MzAwMlx1NzBCOVx1NTFGQlx1OTc2Mlx1NTMwNVx1NUM1MVx1NTNFRlx1NTIwN1x1NjM2Mlx1NTIzMFx1NzIzNlx1N0VBN1x1N0VDNFx1NEVGNlx1MzAwMjwvcD5cbiAgICAgICAgICApfVxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NEZFRVx1NjUzOVx1NkUwNVx1NTM1NTwvaDI+XG4gICAgICAgICAge2l0ZW1zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1zXCI+XG4gICAgICAgICAgICAgIHtpdGVtcy5tYXAoKGl0ZW0sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtXCIga2V5PXtpdGVtLmlkfT5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLXRpdGxlXCI+e2luZGV4ICsgMX0uIHtSRVZJRVdfVFlQRV9MQUJFTFNbaXRlbS50eXBlXX08L3N0cm9uZz5cbiAgICAgICAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tc2VsZWN0b3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhpdGVtKS5tYXAoKHRhcmdldCkgPT4gdGFyZ2V0LnNlbGVjdG9yKS5qb2luKCdcdTMwMDEnKX1cbiAgICAgICAgICAgICAgICAgICAgPC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1pbnN0cnVjdGlvblwiPntpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1kZWxldGVcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gb25SZW1vdmVJdGVtKGl0ZW0uaWQpfT5cdTUyMjBcdTk2NjQ8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgKSA6IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1lbXB0eVwiPlx1OEZEOFx1NkNBMVx1NjcwOVx1NEZFRVx1NjUzOVx1NjEwRlx1ODlDMVx1MzAwMjwvcD59XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbiB3Zi1yZXZpZXctcHJvbXB0LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLXRpdGxlXCI+XG4gICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24taGVhZGluZ1wiPlx1NjcwMFx1N0VDOCBQcm9tcHQ8L2gyPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcmVnZW5lcmF0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtyZWdlbmVyYXRlfT5cdTkxQ0RcdTY1QjBcdTc1MUZcdTYyMTA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICB7cHJvbXB0RGlydHkgPyA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFudWFsXCI+UHJvbXB0IFx1NURGMlx1NjI0Qlx1NTJBOFx1NEZFRVx1NjUzOVx1RkYxQlx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMFx1NEYxQVx1ODk4Nlx1NzZENlx1NjI0Qlx1NTJBOFx1NTE4NVx1NUJCOVx1MzAwMjwvcD4gOiBudWxsfVxuICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXByb21wdFwiXG4gICAgICAgICAgICB2YWx1ZT17cHJvbXB0fVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBzZXRQcm9tcHQoZXZlbnQudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgICBzZXRQcm9tcHREaXJ0eSh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jb3B5XCIgb25DbGljaz17Y29weVByb21wdH0+XG4gICAgICAgICAgICB7Y29waWVkID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU1OTBEXHU1MjM2IFByb21wdCd9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvYXNpZGU+XG4gIClcbn1cbiIsICJpbXBvcnQgeyByZXZpZXdUYXJnZXRzLCBSRVZJRVdfVFlQRV9MQUJFTFMgfSBmcm9tICcuL3Jldmlldy5qcydcblxuZnVuY3Rpb24gc2FtZVBvc2l0aW9ucyhsZWZ0LCByaWdodCkge1xuICBpZiAobGVmdC5sZW5ndGggIT09IHJpZ2h0Lmxlbmd0aCkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBsZWZ0LmV2ZXJ5KChpdGVtLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG90aGVyID0gcmlnaHRbaW5kZXhdXG4gICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBvdGhlci5rZXlcbiAgICAgICYmIGl0ZW0uaXRlbSA9PT0gb3RoZXIuaXRlbVxuICAgICAgJiYgaXRlbS5pdGVtSW5kZXggPT09IG90aGVyLml0ZW1JbmRleFxuICAgICAgJiYgaXRlbS5sZWZ0ID09PSBvdGhlci5sZWZ0XG4gICAgICAmJiBpdGVtLnRvcCA9PT0gb3RoZXIudG9wXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGludGVyc2VjdFJlY3QocmVjdCwgY2xpcCkge1xuICBjb25zdCBsZWZ0ID0gTWF0aC5tYXgocmVjdC5sZWZ0LCBjbGlwLmxlZnQpXG4gIGNvbnN0IHJpZ2h0ID0gTWF0aC5taW4ocmVjdC5yaWdodCwgY2xpcC5yaWdodClcbiAgY29uc3QgdG9wID0gTWF0aC5tYXgocmVjdC50b3AsIGNsaXAudG9wKVxuICBjb25zdCBib3R0b20gPSBNYXRoLm1pbihyZWN0LmJvdHRvbSwgY2xpcC5ib3R0b20pXG4gIGlmIChyaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHJldHVybiBudWxsXG4gIHJldHVybiB7IGxlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbSB9XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVQb3NpdGlvbnMoYm9hcmQsIGl0ZW1zKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBbXVxuICBjb25zdCBib2FyZFJlY3QgPSBib2FyZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICBjb25zdCBwb3NpdGlvbnMgPSBbXVxuXG4gIGl0ZW1zLmZvckVhY2goKGl0ZW0sIGl0ZW1JbmRleCkgPT4ge1xuICAgIHJldmlld1RhcmdldHMoaXRlbSkuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgbGV0IGVsZW1lbnQgPSBudWxsXG4gICAgICB0cnkge1xuICAgICAgICBlbGVtZW50ID0gYm9hcmQucXVlcnlTZWxlY3Rvcih0YXJnZXQuc2VsZWN0b3IpXG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWVsZW1lbnQ/LmlzQ29ubmVjdGVkKSByZXR1cm5cbiAgICAgIGNvbnN0IHNjcmVlbkNvbnRlbnQgPSBlbGVtZW50LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY29udGVudCcpXG4gICAgICBpZiAoIXNjcmVlbkNvbnRlbnQpIHJldHVyblxuICAgICAgY29uc3QgdmlzaWJsZSA9IGludGVyc2VjdFJlY3QoZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgc2NyZWVuQ29udGVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSlcbiAgICAgIGlmICghdmlzaWJsZSkgcmV0dXJuXG4gICAgICBjb25zdCBiYXNlTGVmdCA9IE1hdGgucm91bmQodmlzaWJsZS5yaWdodCAtIGJvYXJkUmVjdC5sZWZ0KVxuICAgICAgY29uc3QgYmFzZVRvcCA9IE1hdGgucm91bmQodmlzaWJsZS50b3AgLSBib2FyZFJlY3QudG9wKVxuICAgICAgY29uc3Qgb3ZlcmxhcENvdW50ID0gcG9zaXRpb25zLmZpbHRlcihcbiAgICAgICAgKHBvc2l0aW9uKSA9PiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlTGVmdCAtIGJhc2VMZWZ0KSA8IDIgJiYgTWF0aC5hYnMocG9zaXRpb24uYmFzZVRvcCAtIGJhc2VUb3ApIDwgMixcbiAgICAgICkubGVuZ3RoXG4gICAgICBwb3NpdGlvbnMucHVzaCh7XG4gICAgICAgIGtleTogYCR7aXRlbS5pZH06JHt0YXJnZXRJbmRleH1gLFxuICAgICAgICBpdGVtLFxuICAgICAgICBpdGVtSW5kZXgsXG4gICAgICAgIHRhcmdldEluZGV4LFxuICAgICAgICBiYXNlTGVmdCxcbiAgICAgICAgYmFzZVRvcCxcbiAgICAgICAgbGVmdDogYmFzZUxlZnQgKyBvdmVybGFwQ291bnQgKiAxNSxcbiAgICAgICAgdG9wOiBiYXNlVG9wLFxuICAgICAgfSlcbiAgICB9KVxuICB9KVxuXG4gIHJldHVybiBwb3NpdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJldmlld01hcmtlcnMoeyBib2FyZFJlZiwgaXRlbXMsIG9uT3BlblBhbmVsIH0pIHtcbiAgY29uc3QgW3Bvc2l0aW9ucywgc2V0UG9zaXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFtdKVxuICBjb25zdCBbYWN0aXZlS2V5LCBzZXRBY3RpdmVLZXldID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZnJhbWVSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCByZWZyZXNoID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSByZXNvbHZlUG9zaXRpb25zKGJvYXJkUmVmLmN1cnJlbnQsIGl0ZW1zKVxuICAgIHNldFBvc2l0aW9ucygoY3VycmVudCkgPT4gc2FtZVBvc2l0aW9ucyhjdXJyZW50LCBuZXh0KSA/IGN1cnJlbnQgOiBuZXh0KVxuICB9LCBbYm9hcmRSZWYsIGl0ZW1zXSlcblxuICBjb25zdCBzY2hlZHVsZVJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGZyYW1lUmVmLmN1cnJlbnQpIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZVJlZi5jdXJyZW50KVxuICAgIGZyYW1lUmVmLmN1cnJlbnQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGZyYW1lUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgICByZWZyZXNoKClcbiAgICB9KVxuICB9LCBbcmVmcmVzaF0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KHNjaGVkdWxlUmVmcmVzaClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGNhcHR1cmU6IHRydWUsIHBhc3NpdmU6IHRydWUgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzY2hlZHVsZVJlZnJlc2gpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzY2hlZHVsZVJlZnJlc2gsIHRydWUpXG4gICAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgfVxuICB9LCBbc2NoZWR1bGVSZWZyZXNoXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChhY3RpdmVLZXkgJiYgIXBvc2l0aW9ucy5zb21lKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpKSBzZXRBY3RpdmVLZXkobnVsbClcbiAgfSwgW2FjdGl2ZUtleSwgcG9zaXRpb25zXSlcblxuICBjb25zdCBhY3RpdmUgPSBwb3NpdGlvbnMuZmluZCgocG9zaXRpb24pID0+IHBvc2l0aW9uLmtleSA9PT0gYWN0aXZlS2V5KVxuICBjb25zdCBib2FyZFdpZHRoID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50V2lkdGggfHwgMFxuICBjb25zdCBib2FyZEhlaWdodCA9IGJvYXJkUmVmLmN1cnJlbnQ/LmNsaWVudEhlaWdodCB8fCAwXG4gIGNvbnN0IGJ1YmJsZUxlZnQgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLmxlZnQgKyAxNiwgYm9hcmRXaWR0aCAtIDMzNikpIDogMFxuICBjb25zdCBidWJibGVUb3AgPSBhY3RpdmUgPyBNYXRoLm1heCgxMiwgTWF0aC5taW4oYWN0aXZlLnRvcCArIDI0LCBib2FyZEhlaWdodCAtIDE4MCkpIDogMFxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2Vyc1wiIGFyaWEtbGFiZWw9XCJcdTRGRUVcdTY1MzlcdTY4MDdcdThCQjBcIj5cbiAgICAgIHtwb3NpdGlvbnMubWFwKChwb3NpdGlvbikgPT4gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXthY3RpdmVLZXkgPT09IHBvc2l0aW9uLmtleSA/ICd3Zi1yZXZpZXctbWFya2VyIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LW1hcmtlcid9XG4gICAgICAgICAga2V5PXtwb3NpdGlvbi5rZXl9XG4gICAgICAgICAgYXJpYS1sYWJlbD17YFx1NEZFRVx1NjUzOSAke3Bvc2l0aW9uLml0ZW1JbmRleCArIDF9XHVGRjFBJHtSRVZJRVdfVFlQRV9MQUJFTFNbcG9zaXRpb24uaXRlbS50eXBlXX1gfVxuICAgICAgICAgIHN0eWxlPXt7IGxlZnQ6IHBvc2l0aW9uLmxlZnQsIHRvcDogcG9zaXRpb24udG9wIH19XG4gICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICAgICAgc2V0QWN0aXZlS2V5KChjdXJyZW50KSA9PiBjdXJyZW50ID09PSBwb3NpdGlvbi5rZXkgPyBudWxsIDogcG9zaXRpb24ua2V5KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICAgIHthY3RpdmUgPyAoXG4gICAgICAgIDxhc2lkZVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3ZlclwiXG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogYnViYmxlTGVmdCwgdG9wOiBidWJibGVUb3AgfX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7YWN0aXZlLml0ZW1JbmRleCArIDF9YH1cbiAgICAgICAgPlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGl0bGVcIj5cbiAgICAgICAgICAgICAge2FjdGl2ZS5pdGVtSW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1thY3RpdmUuaXRlbS50eXBlXX1cbiAgICAgICAgICAgIDwvc3Ryb25nPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItY2xvc2VcIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0QWN0aXZlS2V5KG51bGwpfT5cdTUxNzNcdTk1RUQ8L2J1dHRvbj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaW5zdHJ1Y3Rpb25cIj5cbiAgICAgICAgICAgIHthY3RpdmUuaXRlbS5pbnN0cnVjdGlvbiB8fCAnXHU1MjIwXHU5NjY0XHU4QkU1XHU4MjgyXHU3MEI5XHVGRjBDXHU1RTc2XHU1NDBDXHU2QjY1XHU2RTA1XHU3NDA2XHU2NUUwXHU3NTI4XHU0RUUzXHU3ODAxXHUzMDAyJ31cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItdGFyZ2V0c1wiPlxuICAgICAgICAgICAge3Jldmlld1RhcmdldHMoYWN0aXZlLml0ZW0pLm1hcCgodGFyZ2V0KSA9PiAoXG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1zZWxlY3RvclwiIGtleT17dGFyZ2V0LnNlbGVjdG9yfT57dGFyZ2V0LnNlbGVjdG9yfTwvY29kZT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1tb3JlXCJcbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRBY3RpdmVLZXkobnVsbClcbiAgICAgICAgICAgICAgb25PcGVuUGFuZWw/LigpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFx1NjdFNVx1NzcwQlx1NjZGNFx1NTkxQVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2FzaWRlPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJjb25zdCBMQVVOQ0hFUl9TSVpFID0gNDhcbmNvbnN0IExBVU5DSEVSX01BUkdJTiA9IDIwXG5jb25zdCBEUkFHX1RIUkVTSE9MRCA9IDRcblxuZnVuY3Rpb24gY2xhbXAodmFsdWUsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWx1ZSwgbWluKSwgTWF0aC5tYXgobWluLCBtYXgpKVxufVxuXG5mdW5jdGlvbiBjbGFtcFBvc2l0aW9uKGJvYXJkLCBwb3NpdGlvbikge1xuICBpZiAoIWJvYXJkKSByZXR1cm4gcG9zaXRpb25cbiAgcmV0dXJuIHtcbiAgICB4OiBjbGFtcChwb3NpdGlvbi54LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTiksXG4gICAgeTogY2xhbXAocG9zaXRpb24ueSwgTEFVTkNIRVJfTUFSR0lOLCBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0UG9zaXRpb24oYm9hcmQpIHtcbiAgcmV0dXJuIGNsYW1wUG9zaXRpb24oYm9hcmQsIHtcbiAgICB4OiBib2FyZC5jbGllbnRXaWR0aCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4sXG4gICAgeTogYm9hcmQuY2xpZW50SGVpZ2h0IC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VLZXkpKVxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWU/LngpICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueSkpIHJldHVybiB2YWx1ZVxuICB9IGNhdGNoIHtcbiAgICAvLyBsb2NhbFN0b3JhZ2UgbWF5IGJlIHVuYXZhaWxhYmxlIGZvciBhIGRpcmVjdGx5IG9wZW5lZCBsb2NhbCBmaWxlLlxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmZ1bmN0aW9uIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvbikge1xuICB0cnkge1xuICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlS2V5LCBKU09OLnN0cmluZ2lmeShwb3NpdGlvbikpXG4gIH0gY2F0Y2gge1xuICAgIC8vIEtlZXBpbmcgdGhlIGxhdW5jaGVyIGRyYWdnYWJsZSBpcyBtb3JlIGltcG9ydGFudCB0aGFuIHBlcnNpc3RlbmNlLlxuICB9XG59XG5cbmZ1bmN0aW9uIENvbW1lbnRJY29uKCkge1xuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWljb25cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICA8cGF0aCBkPVwiTTUgNC41aDE0YTIgMiAwIDAgMSAyIDJ2OGEyIDIgMCAwIDEtMiAyaC02bC00LjUgM3YtM0g1YTIgMiAwIDAgMS0yLTJ2LThhMiAyIDAgMCAxIDItMlpcIiAvPlxuICAgICAgPHBhdGggZD1cIk03LjUgMTAuNWg5XCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TGF1bmNoZXIoeyBib2FyZFJlZiwgY291bnQsIHByb2plY3ROYW1lLCBvbk9wZW4gfSkge1xuICBjb25zdCBzdG9yYWdlS2V5ID0gYHdmLXJldmlldy1sYXVuY2hlci1wb3NpdGlvbjoke3Byb2plY3ROYW1lfWBcbiAgY29uc3QgW3Bvc2l0aW9uLCBzZXRQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZHJhZ2dpbmcsIHNldERyYWdnaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHBvc2l0aW9uUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHN1cHByZXNzQ2xpY2tSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG5cbiAgY29uc3QgdXBkYXRlUG9zaXRpb24gPSBSZWFjdC51c2VDYWxsYmFjaygobmV4dCkgPT4ge1xuICAgIGNvbnN0IGNsYW1wZWQgPSBjbGFtcFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQsIG5leHQpXG4gICAgcG9zaXRpb25SZWYuY3VycmVudCA9IGNsYW1wZWRcbiAgICBzZXRQb3NpdGlvbihjbGFtcGVkKVxuICAgIHJldHVybiBjbGFtcGVkXG4gIH0sIFtib2FyZFJlZl0pXG5cbiAgUmVhY3QudXNlTGF5b3V0RWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBib2FyZCA9IGJvYXJkUmVmLmN1cnJlbnRcbiAgICBpZiAoIWJvYXJkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgdXBkYXRlUG9zaXRpb24ocmVhZFBvc2l0aW9uKHN0b3JhZ2VLZXkpIHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG5cbiAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gdXBkYXRlUG9zaXRpb24ocG9zaXRpb25SZWYuY3VycmVudCB8fCBkZWZhdWx0UG9zaXRpb24oYm9hcmQpKVxuICAgICAgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIG5leHQpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpXG4gIH0sIFtib2FyZFJlZiwgc3RvcmFnZUtleSwgdXBkYXRlUG9zaXRpb25dKVxuXG4gIGNvbnN0IGZpbmlzaERyYWcgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGRyYWcubW92ZWRcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ2dpbmcoZmFsc2UpXG4gICAgaWYgKHBvc2l0aW9uUmVmLmN1cnJlbnQpIHNhdmVQb3NpdGlvbihzdG9yYWdlS2V5LCBwb3NpdGlvblJlZi5jdXJyZW50KVxuICAgIGlmIChldmVudC5jdXJyZW50VGFyZ2V0Lmhhc1BvaW50ZXJDYXB0dXJlPy4oZXZlbnQucG9pbnRlcklkKSkge1xuICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5yZWxlYXNlUG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgIH1cbiAgfVxuXG4gIGlmIChjb3VudCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2RyYWdnaW5nID8gJ3dmLXJldmlldy1sYXVuY2hlciBpcy1kcmFnZ2luZycgOiAnd2YtcmV2aWV3LWxhdW5jaGVyJ31cbiAgICAgIHN0eWxlPXtwb3NpdGlvbiA/IHsgbGVmdDogcG9zaXRpb24ueCwgdG9wOiBwb3NpdGlvbi55IH0gOiB7IHJpZ2h0OiBMQVVOQ0hFUl9NQVJHSU4sIGJvdHRvbTogTEFVTkNIRVJfTUFSR0lOIH19XG4gICAgICBhcmlhLWxhYmVsPXtgXHU1QzU1XHU1RjAwXHU4QkM0XHU4QkJBXHVGRjBDXHU1MTcxICR7Y291bnR9IFx1Njc2MVx1NEZFRVx1NjUzOWB9XG4gICAgICBkYXRhLXRvb2x0aXA9XCJcdTVDNTVcdTVGMDBcdThCQzRcdThCQkFcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgICAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZFJlZi5jdXJyZW50KVxuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSB7XG4gICAgICAgICAgcG9pbnRlcklkOiBldmVudC5wb2ludGVySWQsXG4gICAgICAgICAgc3RhcnRYOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgIHN0YXJ0WTogZXZlbnQuY2xpZW50WSxcbiAgICAgICAgICBvcmlnaW4sXG4gICAgICAgICAgbW92ZWQ6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICAgIHN1cHByZXNzQ2xpY2tSZWYuY3VycmVudCA9IGZhbHNlXG4gICAgICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlck1vdmU9eyhldmVudCkgPT4ge1xuICAgICAgICBjb25zdCBkcmFnID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgICAgIGlmICghZHJhZyB8fCBkcmFnLnBvaW50ZXJJZCAhPT0gZXZlbnQucG9pbnRlcklkKSByZXR1cm5cbiAgICAgICAgY29uc3QgZGVsdGFYID0gZXZlbnQuY2xpZW50WCAtIGRyYWcuc3RhcnRYXG4gICAgICAgIGNvbnN0IGRlbHRhWSA9IGV2ZW50LmNsaWVudFkgLSBkcmFnLnN0YXJ0WVxuICAgICAgICBpZiAoIWRyYWcubW92ZWQgJiYgTWF0aC5oeXBvdChkZWx0YVgsIGRlbHRhWSkgPCBEUkFHX1RIUkVTSE9MRCkgcmV0dXJuXG4gICAgICAgIGRyYWcubW92ZWQgPSB0cnVlXG4gICAgICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKHsgeDogZHJhZy5vcmlnaW4ueCArIGRlbHRhWCwgeTogZHJhZy5vcmlnaW4ueSArIGRlbHRhWSB9KVxuICAgICAgfX1cbiAgICAgIG9uUG9pbnRlclVwPXtmaW5pc2hEcmFnfVxuICAgICAgb25Qb2ludGVyQ2FuY2VsPXtmaW5pc2hEcmFnfVxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBpZiAoc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBvbk9wZW4oKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8Q29tbWVudEljb24gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1sYXVuY2hlci1jb3VudFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPntjb3VudH08L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cbiIsICJleHBvcnQgY29uc3QgVU5TQVZFRF9SRVZJRVdfTUVTU0FHRSA9ICdcdTRGRUVcdTY1MzlcdTUxODVcdTVCQjlcdTVDMUFcdTY3MkFcdTRGRERcdTVCNThcdUZGMENcdTc5QkJcdTVGMDBcdTk4NzVcdTk3NjJcdTU0MEVcdTRGMUFcdTRFMjJcdTU5MzFcdTMwMDJcdTY2MkZcdTU0MjZcdTdFRTdcdTdFRURcdUZGMUYnXG5cbmV4cG9ydCBmdW5jdGlvbiBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQoZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICBldmVudC5yZXR1cm5WYWx1ZSA9IFVOU0FWRURfUkVWSUVXX01FU1NBR0VcbiAgcmV0dXJuIFVOU0FWRURfUkVWSUVXX01FU1NBR0Vcbn1cbiIsICJleHBvcnQgY29uc3QgQk9BUkRfU0hPUlRDVVRTID0gW1xuICB7IGlkOiAnY2FudmFzJywga2V5czogJ0N0cmwrMScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1MjMwXHU3NTNCXHU2NzdGXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnZGVtbycsIGtleXM6ICdDdHJsKzInLCBsYWJlbDogJ1x1NTIwN1x1NjM2Mlx1NTIzMFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRicgfSxcbiAgeyBpZDogJ2ludGVyYWN0aW9uJywga2V5czogJ0N0cmwrSScsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU1M0VGXHU0RUE0XHU0RTkyIC8gXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJyB9LFxuICB7IGlkOiAncmV2aWV3Jywga2V5czogJ0N0cmwrTScsIGxhYmVsOiAnXHU1RjAwXHU1NDJGXHU2MjE2XHU1MTczXHU5NUVEXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaW1tZXJzaXZlJywga2V5czogJ0N0cmwrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnYnJvd3Nlci1mdWxsc2NyZWVuJywga2V5czogJ0N0cmwrU2hpZnQrRicsIGxhYmVsOiAnXHU1MjA3XHU2MzYyXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGJyB9LFxuICB7IGlkOiAnaG90c3BvdHMnLCBrZXlzOiAnQ3RybCtIJywgbGFiZWw6ICdcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0EnIH0sXG4gIHsgaWQ6ICdzcGFjZScsIGtleXM6ICdTcGFjZScsIGxhYmVsOiAnXHU2MzA5XHU0RjRGXHU0RTM0XHU2NUY2XHU2MkQ2XHU1MkE4XHU3NTNCXHU1RTAzJyB9LFxuICB7IGlkOiAnZXNjYXBlJywga2V5czogJ0VzYycsIGxhYmVsOiAnXHU1MTczXHU5NUVEXHU1RjUzXHU1MjREXHU5NzYyXHU2NzdGXHU2MjE2XHU5MDAwXHU1MUZBXHU2QTIxXHU1RjBGJyB9LFxuICB7IGlkOiAnaGVscCcsIGtleXM6ICc/JywgbGFiZWw6ICdcdTYyNTNcdTVGMDBcdTYyMTZcdTUxNzNcdTk1RURcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgY29uc3QgZWxlbWVudCA9IHRhcmdldC5ub2RlVHlwZSA9PT0gMyA/IHRhcmdldC5wYXJlbnRFbGVtZW50IDogdGFyZ2V0XG4gIGlmICghZWxlbWVudCkgcmV0dXJuIGZhbHNlXG4gIGNvbnN0IHRhZyA9IGVsZW1lbnQudGFnTmFtZVxuICBpZiAodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1RFWFRBUkVBJyB8fCB0YWcgPT09ICdTRUxFQ1QnKSByZXR1cm4gdHJ1ZVxuICBpZiAoZWxlbWVudC5pc0NvbnRlbnRFZGl0YWJsZSkgcmV0dXJuIHRydWVcbiAgcmV0dXJuICEhZWxlbWVudC5jbG9zZXN0Py4oJ1tjb250ZW50ZWRpdGFibGVdOm5vdChbY29udGVudGVkaXRhYmxlPVwiZmFsc2VcIl0pJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3J0Y3V0SWRGb3JFdmVudChldmVudCkge1xuICBpZiAoIWV2ZW50IHx8IGV2ZW50LnJlcGVhdCB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuIG51bGxcbiAgY29uc3Qga2V5ID0gU3RyaW5nKGV2ZW50LmtleSB8fCAnJykudG9Mb3dlckNhc2UoKVxuXG4gIGlmICghZXZlbnQuY3RybEtleSkge1xuICAgIGlmICghZXZlbnQuc2hpZnRLZXkgJiYga2V5ID09PSAnZXNjYXBlJykgcmV0dXJuICdlc2NhcGUnXG4gICAgaWYgKGV2ZW50LmtleSA9PT0gJz8nKSByZXR1cm4gJ2hlbHAnXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmIChldmVudC5zaGlmdEtleSkgcmV0dXJuIGtleSA9PT0gJ2YnID8gJ2Jyb3dzZXItZnVsbHNjcmVlbicgOiBudWxsXG4gIGlmIChrZXkgPT09ICcxJykgcmV0dXJuICdjYW52YXMnXG4gIGlmIChrZXkgPT09ICcyJykgcmV0dXJuICdkZW1vJ1xuICBpZiAoa2V5ID09PSAnaScpIHJldHVybiAnaW50ZXJhY3Rpb24nXG4gIGlmIChrZXkgPT09ICdtJykgcmV0dXJuICdyZXZpZXcnXG4gIGlmIChrZXkgPT09ICdmJykgcmV0dXJuICdpbW1lcnNpdmUnXG4gIGlmIChrZXkgPT09ICdoJykgcmV0dXJuICdob3RzcG90cydcbiAgcmV0dXJuIG51bGxcbn1cbiIsICJpbXBvcnQgeyBCT0FSRF9TSE9SVENVVFMgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuZnVuY3Rpb24gUGFuZWxTaGVsbCh7IGlkLCB0aXRsZSwgYXJpYUxhYmVsLCBvbkNsb3NlLCBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGNsb3NlUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHJldHVybkZvY3VzUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm5Gb2N1c1JlZi5jdXJyZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudFxuICAgIGNsb3NlUmVmLmN1cnJlbnQ/LmZvY3VzKClcbiAgICByZXR1cm4gKCkgPT4gcmV0dXJuRm9jdXNSZWYuY3VycmVudD8uZm9jdXM/LigpXG4gIH0sIFtdKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwid2YtYm9hcmQtcGFuZWwtbGF5ZXJcIlxuICAgICAgb25Qb2ludGVyRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQpIG9uQ2xvc2UoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8c2VjdGlvbiBpZD17aWR9IGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17YXJpYUxhYmVsfT5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgICA8c3Ryb25nPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICA8YnV0dG9uIHJlZj17Y2xvc2VSZWZ9IHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9IGFyaWEtbGFiZWw9e2BcdTUxNzNcdTk1RUQke3RpdGxlfWB9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaG9ydGN1dEhlbHAoeyBkZW1vQXZhaWxhYmxlLCBzaG93Q2FudmFzSW5kZXgsIG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlLCBvbkNsb3NlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8UGFuZWxTaGVsbCBpZD1cIndmLWJvYXJkLXV0aWxpdHlcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOSAvIFx1NUZFQlx1NjM3N1x1OTUyRSAvIFx1OEJCRVx1N0Y2RVwiIGFyaWFMYWJlbD1cIlx1NUUyRVx1NTJBOVx1MzAwMVx1NUZFQlx1NjM3N1x1OTUyRVx1NEUwRVx1OEJCRVx1N0Y2RVwiIG9uQ2xvc2U9e29uQ2xvc2V9PlxuICAgICAgPGRsIGNsYXNzTmFtZT1cIndmLXNob3J0Y3V0LWxpc3RcIj5cbiAgICAgICAge0JPQVJEX1NIT1JUQ1VUUy5tYXAoKHNob3J0Y3V0KSA9PiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnaXMtZGlzYWJsZWQnIDogJyd9IGtleT17c2hvcnRjdXQuaWR9PlxuICAgICAgICAgICAgPGR0PjxrYmQ+e3Nob3J0Y3V0LmtleXN9PC9rYmQ+PC9kdD5cbiAgICAgICAgICAgIDxkZD57c2hvcnRjdXQubGFiZWx9e3Nob3J0Y3V0LmlkID09PSAnZGVtbycgJiYgIWRlbW9BdmFpbGFibGUgPyAnXHVGRjA4XHU1RjUzXHU1MjREXHU0RTBEXHU1M0VGXHU3NTI4XHVGRjA5JyA6ICcnfTwvZGQ+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkpfVxuICAgICAgPC9kbD5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWJvYXJkLXBhbmVsLW5vdGVcIj5cdTU3MjhcdThGOTNcdTUxNjVcdTY4NDZcdTMwMDFcdTY1ODdcdTY3MkNcdTU3REZcdTMwMDFcdTRFMEJcdTYyQzlcdTY4NDZcdTU0OENcdTUzRUZcdTdGMTZcdThGOTFcdTUxODVcdTVCQjlcdTRFMkRcdTRFMERcdTRGMUFcdTg5RTZcdTUzRDFcdTY2NkVcdTkwMUFcdTVGRUJcdTYzNzdcdTk1MkVcdTMwMDI8L3A+XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1wYW5lbC1zZWN0aW9uXCIgYXJpYS1sYWJlbGxlZGJ5PVwid2YtYm9hcmQtaW5kZXgtc2V0dGluZy10aXRsZVwiPlxuICAgICAgICA8aDIgaWQ9XCJ3Zi1ib2FyZC1pbmRleC1zZXR0aW5nLXRpdGxlXCI+XHU3NTNCXHU2NzdGXHU4QkJFXHU3RjZFPC9oMj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWJvYXJkLXNldHRpbmctcm93XCI+XG4gICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICA8c3Ryb25nPlx1NjYzRVx1NzkzQVx1NzUzQlx1Njc3Rlx1N0QyMlx1NUYxNTwvc3Ryb25nPlxuICAgICAgICAgICAgPHNtYWxsPlx1NTcyOFx1NzUzQlx1Njc3Rlx1NEUwQVx1NjYzRVx1NzkzQVx1NTNFRlx1NjJENlx1NjJGRFx1NzY4NFx1OTg3NVx1OTc2Mlx1N0QyMlx1NUYxNTwvc21hbGw+XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgIGNoZWNrZWQ9e3Nob3dDYW52YXNJbmRleH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZXZlbnQpID0+IG9uU2hvd0NhbnZhc0luZGV4Q2hhbmdlKGV2ZW50LnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2xhYmVsPlxuICAgICAgPC9zZWN0aW9uPlxuICAgIDwvUGFuZWxTaGVsbD5cbiAgKVxufVxuIiwgImNvbnN0IERFRkFVTFRfU0VUVElOR1MgPSBPYmplY3QuZnJlZXplKHsgc2hvd0NhbnZhc0luZGV4OiB0cnVlIH0pXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCb2FyZFN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHdpbmRvdy5sb2NhbFN0b3JhZ2VcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYm9hcmRTZXR0aW5nc1N0b3JhZ2VLZXkocHJvamVjdE5hbWUpIHtcbiAgcmV0dXJuIGB3Zi1ib2FyZC1zZXR0aW5nczoke3Byb2plY3ROYW1lfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRCb2FyZFNldHRpbmdzKHN0b3JhZ2UsIHByb2plY3ROYW1lKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShzdG9yYWdlPy5nZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSkpXG4gICAgaWYgKHR5cGVvZiBwYXJzZWQ/LnNob3dDYW52YXNJbmRleCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICByZXR1cm4geyBzaG93Q2FudmFzSW5kZXg6IHBhcnNlZC5zaG93Q2FudmFzSW5kZXggfVxuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgLy8gZmlsZTovLyBzdG9yYWdlIGNhbiBiZSB1bmF2YWlsYWJsZSBvciBjb250YWluIHN0YWxlIGRhdGEuXG4gIH1cbiAgcmV0dXJuIHsgLi4uREVGQVVMVF9TRVRUSU5HUyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQm9hcmRTZXR0aW5ncyhzdG9yYWdlLCBwcm9qZWN0TmFtZSwgc2V0dGluZ3MpIHtcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHsgc2hvd0NhbnZhc0luZGV4OiBzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXggIT09IGZhbHNlIH1cbiAgdHJ5IHtcbiAgICBzdG9yYWdlPy5zZXRJdGVtKGJvYXJkU2V0dGluZ3NTdG9yYWdlS2V5KHByb2plY3ROYW1lKSwgSlNPTi5zdHJpbmdpZnkobm9ybWFsaXplZCkpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCB7XG4gICAgLy8gU2V0dGluZ3MgcmVtYWluIHVzYWJsZSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbiB3aXRob3V0IHBlcnNpc3RlbmNlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IENhbnZhc01vZGUsIHJ1bkV4cG9ydFdpdGhGZWVkYmFjayB9IGZyb20gJy4vQ2FudmFzTW9kZS5qc3gnXG5pbXBvcnQgeyBEZW1vTW9kZSB9IGZyb20gJy4vRGVtb01vZGUuanN4J1xuaW1wb3J0IHsgcmVzb2x2ZUV4cGFuZFRhcmdldHMgfSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7IGV4cG9ydFNlbGVjdGVkIH0gZnJvbSAnLi9leHBvcnQuanMnXG5pbXBvcnQgeyBjYW5Vc2VEZW1vIH0gZnJvbSAnLi92YWxpZGF0aW9uLmpzJ1xuaW1wb3J0IHsgY2xhbXBTY2FsZSB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFJldmlld1BhbmVsIH0gZnJvbSAnLi9SZXZpZXdQYW5lbC5qc3gnXG5pbXBvcnQgeyBSZXZpZXdNYXJrZXJzIH0gZnJvbSAnLi9SZXZpZXdNYXJrZXJzLmpzeCdcbmltcG9ydCB7IFJldmlld0xhdW5jaGVyIH0gZnJvbSAnLi9SZXZpZXdMYXVuY2hlci5qc3gnXG5pbXBvcnQgeyBkZXNjcmliZVJldmlld0VsZW1lbnQgfSBmcm9tICcuL3Jldmlldy5qcydcbmltcG9ydCB7IHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdCB9IGZyb20gJy4vYmVmb3JlLXVubG9hZC5qcydcbmltcG9ydCB7IFNob3J0Y3V0SGVscCB9IGZyb20gJy4vQm9hcmRQYW5lbHMuanN4J1xuaW1wb3J0IHsgZ2V0Qm9hcmRTdG9yYWdlLCByZWFkQm9hcmRTZXR0aW5ncywgc2F2ZUJvYXJkU2V0dGluZ3MgfSBmcm9tICcuL2JvYXJkLXNldHRpbmdzLmpzJ1xuaW1wb3J0IHsgaXNFZGl0YWJsZVNob3J0Y3V0VGFyZ2V0LCBzaG9ydGN1dElkRm9yRXZlbnQgfSBmcm9tICcuL3Nob3J0Y3V0cy5qcydcblxuY29uc3QgVklFV1BPUlRfTEFCRUxTID0ge1xuICBtb2JpbGU6ICdcdTYyNEJcdTY3M0EnLFxuICBkZXNrdG9wOiAnXHU2ODRDXHU5NzYyJyxcbn1cblxuZnVuY3Rpb24gWm9vbUNvbnRyb2xzKHsgc2NhbGUsIHNldFNjYWxlLCBvblJlc2V0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXpvb20tY29udHJvbHNcIj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU3RjI5XHU1QzBGXCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlIC0gMC4xKSl9Pi08L2J1dHRvbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXpvb20tdmFsdWVcIj57TWF0aC5yb3VuZChzY2FsZSAqIDEwMCl9JTwvc3Bhbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU2NTNFXHU1OTI3XCIgb25DbGljaz17KCkgPT4gc2V0U2NhbGUoKHZhbHVlKSA9PiBjbGFtcFNjYWxlKHZhbHVlICsgMC4xKSl9Pis8L2J1dHRvbj5cbiAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwiXHU5MUNEXHU3RjZFXHU3RjI5XHU2NTNFXCIgb25DbGljaz17b25SZXNldH0+XHU1OTBEXHU0RjREPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuLyoqIEx1Y2lkZSBcdTk4Q0VcdTY4M0NcdTVERTVcdTUxNzdcdTY4MEZcdTU2RkVcdTY4MDdcdTMwMDJcdTRFQzVcdTc1MjhcdTRFOEVcdTY4NDZcdTY3QjYgY2hyb21lXHUzMDAyICovXG5mdW5jdGlvbiBUb29sYmFySWNvbih7IG5hbWUgfSkge1xuICBjb25zdCBwYXRocyA9IHtcbiAgICBlZGl0OiA8PjxwYXRoIGQ9XCJNMTIgMjBoOVwiIC8+PHBhdGggZD1cIk0xNi41IDMuNWEyLjEyIDIuMTIgMCAwIDEgMyAzTDcgMTlsLTQgMSAxLTRaXCIgLz48Lz4sXG4gICAgZnVsbHNjcmVlbjogPD48cGF0aCBkPVwiTTggM0g1YTIgMiAwIDAgMC0yIDJ2M1wiIC8+PHBhdGggZD1cIk0yMSA4VjVhMiAyIDAgMCAwLTItMmgtM1wiIC8+PHBhdGggZD1cIk0zIDE2djNhMiAyIDAgMCAwIDIgMmgzXCIgLz48cGF0aCBkPVwiTTE2IDIxaDNhMiAyIDAgMCAwIDItMnYtM1wiIC8+PC8+LFxuICAgIGV4cGFuZDogPD48cGF0aCBkPVwibTcgMTUgNSA1IDUtNVwiIC8+PHBhdGggZD1cIm03IDkgNS01IDUgNVwiIC8+PC8+LFxuICAgIGNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJtNyAyMCA1LTUgNSA1XCIgLz48cGF0aCBkPVwibTcgNCA1IDUgNS01XCIgLz48Lz4sXG4gICAgdG9vbGJhckV4cGFuZDogPD48cGF0aCBkPVwiTTUgNXYxNFwiIC8+PHBhdGggZD1cIm0xNSAxOC02LTYgNi02XCIgLz48Lz4sXG4gICAgdG9vbGJhckNvbGxhcHNlOiA8PjxwYXRoIGQ9XCJNMTkgNXYxNFwiIC8+PHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPjwvPixcbiAgICBkb3dubG9hZDogPD48cGF0aCBkPVwiTTEyIDN2MTJcIiAvPjxwYXRoIGQ9XCJtNyAxMCA1IDUgNS01XCIgLz48cGF0aCBkPVwiTTUgMjFoMTRcIiAvPjwvPixcbiAgICBzZXR0aW5nczogPD48Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjNcIiAvPjxwYXRoIGQ9XCJNMTkuNCAxNWExLjcgMS43IDAgMCAwIC4zNCAxLjg4bC4wNi4wNi0yLjgzIDIuODMtLjA2LS4wNkExLjcgMS43IDAgMCAwIDE1IDE5LjRhMS43IDEuNyAwIDAgMC0xIC42IDEuNyAxLjcgMCAwIDAtLjQgMS4xVjIxaC00di0uMDlBMS43IDEuNyAwIDAgMCA4LjYgMTkuNGExLjcgMS43IDAgMCAwLTEuODguMzRsLS4wNi4wNi0yLjgzLTIuODMuMDYtLjA2QTEuNyAxLjcgMCAwIDAgNC42IDE1YTEuNyAxLjcgMCAwIDAtLjYtMSAxLjcgMS43IDAgMCAwLTEuMS0uNEgzdi00aC4wOUExLjcgMS43IDAgMCAwIDQuNiA4LjZhMS43IDEuNyAwIDAgMC0uMzQtMS44OGwtLjA2LS4wNiAyLjgzLTIuODMuMDYuMDZBMS43IDEuNyAwIDAgMCA5IDQuNmExLjcgMS43IDAgMCAwIDEtLjYgMS43IDEuNyAwIDAgMCAuNC0xLjFWM2g0di4wOUExLjcgMS43IDAgMCAwIDE1LjQgNC42YTEuNyAxLjcgMCAwIDAgMS44OC0uMzRsLjA2LS4wNiAyLjgzIDIuODMtLjA2LjA2QTEuNyAxLjcgMCAwIDAgMTkuNCA5Yy4yLjM3LjUyLjcgMSAuOS4zMi4xMy42OC4yIDEuMS4yaC4wOXY0aC0uMDlhMS43IDEuNyAwIDAgMC0yLjEuOVpcIiAvPjwvPixcbiAgICBoZWxwOiA8PjxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiOVwiIC8+PHBhdGggZD1cIk05LjcgOWEyLjQgMi40IDAgMSAxIDMuNyAyYy0uOS42LTEuNCAxLjEtMS40IDJcIiAvPjxwYXRoIGQ9XCJNMTIgMTdoLjAxXCIgLz48Lz4sXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxzdmcgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAge3BhdGhzW25hbWVdfVxuICAgIDwvc3ZnPlxuICApXG59XG5cbi8qKiBcdTdFQkZcdTY4NDZcdTk1MDFcdUZGMUFcdTVGMDBcdTk1MDE9XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjBDXHU5NUVEXHU5NTAxPVx1NEUwRFx1NTNFRlx1NEVBNFx1NEU5Mlx1MzAwMlx1Njg0Nlx1NjdCNiBjaHJvbWUgXHU1M0VGXHU3NTI4IFNWR1x1MzAwMiAqL1xuZnVuY3Rpb24gTG9ja0ljb24oeyBvcGVuIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLWxvY2staWNvblwiIHZpZXdCb3g9XCIwIDAgMTQgMTRcIiB3aWR0aD1cIjE0XCIgaGVpZ2h0PVwiMTRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtvcGVuID8gKFxuICAgICAgICAvLyBcdTVGMDBcdTk1MDFcdUZGMUFcdTY4ODFcdTRFQ0VcdTVERTZcdTRGQTdcdTdBQ0JcdThENzdcdTU0MEVcdTU0MTFcdTUzRjNcdTRFMEFcdTYwQUNcdTdBN0FcdUZGMENcdTUzRjNcdTgxMUFcdTRFMERcdTYyNjNcdTU2REVcdTk1MDFcdTRGNTNcbiAgICAgICAgPHBhdGhcbiAgICAgICAgICBkPVwiTTQuMjUgNi43NVY0LjM1YTIuNzUgMi43NSAwIDAgMSA1LjM1LS4yXCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC41YTIuNzUgMi43NSAwIDAgMSA1LjUgMHYyLjI1XCJcbiAgICAgICAgICBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICBzdHJva2VXaWR0aD1cIjEuNVwiXG4gICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICA8cmVjdCB4PVwiMi43NVwiIHk9XCI2Ljc1XCIgd2lkdGg9XCI4LjVcIiBoZWlnaHQ9XCI1LjVcIiByeD1cIjEuMjVcIiBmaWxsPVwiY3VycmVudENvbG9yXCIgLz5cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogaW50ZXJhY3RpdmU9dHJ1ZSBcdTY2M0VcdTc5M0FcdTVGMDBcdTk1MDFcdTMwMENcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMERcdUZGMUJmYWxzZSBcdTRFM0FcdTRFMEFcdTk1MDFcdUZGMENcdTUzRUZcdTc2RjRcdTYzQTVcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkJcdTMwMDFcdTZFREFcdThGNkVcdTdGMjlcdTY1M0UgKi9cbmZ1bmN0aW9uIEludGVyYWN0aW9uTG9jayh7IGludGVyYWN0aXZlLCBvblRvZ2dsZSB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2ludGVyYWN0aXZlID8gJ3dmLWludGVyYWN0aW9uLWxvY2snIDogJ3dmLWludGVyYWN0aW9uLWxvY2sgaXMtbG9ja2VkJ31cbiAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlfVxuICAgICAgYXJpYS1wcmVzc2VkPXshaW50ZXJhY3RpdmV9XG4gICAgICB0aXRsZT17aW50ZXJhY3RpdmVcbiAgICAgICAgPyAnXHU1RjUzXHU1MjREXHU1M0VGXHU0RUE0XHU0RTkyXHU5ODc1XHU5NzYyXHUzMDAyXHU3MEI5XHU1MUZCXHU5NTAxXHU0RjRGXHU1NDBFXHVGRjFBXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHU3NTNCXHU1RTAzXHVGRjBDXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIEN0cmwrSSdcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFCXHU1RkVCXHU2Mzc3XHU5NTJFIEN0cmwrSSd9XG4gICAgPlxuICAgICAgPExvY2tJY29uIG9wZW49e2ludGVyYWN0aXZlfSAvPlxuICAgICAgPHNwYW4+e2ludGVyYWN0aXZlID8gJ1x1NTNFRlx1NEVBNFx1NEU5MicgOiAnXHU0RTBEXHU1M0VGXHU0RUE0XHU0RTkyJ308L3NwYW4+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSB7XG4gIHJldHVybiBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fCBkb2N1bWVudC53ZWJraXRGdWxsc2NyZWVuRWxlbWVudCB8fCBudWxsXG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RCb2FyZEZ1bGxzY3JlZW4oZWwpIHtcbiAgY29uc3QgcmVxdWVzdCA9IGVsICYmIChlbC5yZXF1ZXN0RnVsbHNjcmVlbiB8fCBlbC53ZWJraXRSZXF1ZXN0RnVsbHNjcmVlbilcbiAgaWYgKCFyZXF1ZXN0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXF1ZXN0LmNhbGwoZWwpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZnVuY3Rpb24gZXhpdEJvYXJkRnVsbHNjcmVlbigpIHtcbiAgaWYgKCFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgY29uc3QgZXhpdCA9IGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8IGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuXG4gIGlmICghZXhpdCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoZXhpdC5jYWxsKGRvY3VtZW50KSkuY2F0Y2goKCkgPT4ge30pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb2FyZCh7IHByb2plY3QgfSkge1xuICBjb25zdCB7XG4gICAgbW9kZSxcbiAgICBzZXRNb2RlLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0S2V5LFxuICAgIHZpZXdwb3J0LFxuICAgIGVudHJ5SWQsXG4gICAgc2VsZWN0RW50cnksXG4gICAgY3VycmVudFNjcmVlbklkLFxuICAgIGNhbkdvQmFjayxcbiAgICBnb0JhY2ssXG4gICAgcmVzZXQsXG4gIH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIGNvbnN0IHZpZXdwb3J0T3B0aW9ucyA9IE9iamVjdC5rZXlzKHByb2plY3Qudmlld3BvcnRzKVxuICBjb25zdCBjdXJyZW50U2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG5cbiAgY29uc3QgW3NlbGVjdGVkSWRzLCBzZXRTZWxlY3RlZElkc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAoKSA9PiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSksXG4gIClcbiAgY29uc3QgW2NhbnZhc1NjYWxlLCBzZXRDYW52YXNTY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1NjYWxlLCBzZXREZW1vU2NhbGVdID0gUmVhY3QudXNlU3RhdGUoMSlcbiAgY29uc3QgW2RlbW9WaWV3UmVzZXRLZXksIHNldERlbW9WaWV3UmVzZXRLZXldID0gUmVhY3QudXNlU3RhdGUoMClcbiAgY29uc3QgW2ludGVyYWN0aXZlLCBzZXRJbnRlcmFjdGl2ZV0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbc3BhY2VIZWxkLCBzZXRTcGFjZUhlbGRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtob3RzcG90c1Zpc2libGUsIHNldEhvdHNwb3RzVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cG9ydEVycm9yLCBzZXRFeHBvcnRFcnJvcl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbZXhwb3J0aW5nLCBzZXRFeHBvcnRpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZElkcywgc2V0RXhwYW5kZWRJZHNdID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gbmV3IFNldCgpKVxuICBjb25zdCBbaW1tZXJzaXZlLCBzZXRJbW1lcnNpdmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQsIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBbYnJvd3NlckZ1bGxzY3JlZW4sIHNldEJyb3dzZXJGdWxsc2NyZWVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3RW5hYmxlZCwgc2V0UmV2aWV3RW5hYmxlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1BhbmVsVmlzaWJsZSwgc2V0UmV2aWV3UGFuZWxWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcmV2aWV3U2VsZWN0aW9ucywgc2V0UmV2aWV3U2VsZWN0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW3Jldmlld011bHRpU2VsZWN0LCBzZXRSZXZpZXdNdWx0aVNlbGVjdF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0l0ZW1zLCBzZXRSZXZpZXdJdGVtc10gPSBSZWFjdC51c2VTdGF0ZShbXSlcbiAgY29uc3QgW2hlbHBWaXNpYmxlLCBzZXRIZWxwVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2NhbnZhc0luZGV4VmlzaWJsZSwgc2V0Q2FudmFzSW5kZXhWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IHJlYWRCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUpLnNob3dDYW52YXNJbmRleCxcbiAgKVxuICBjb25zdCBbY2FudmFzSW5kZXhQb3NpdGlvbiwgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbl0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBib2FyZFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmID0gUmVhY3QudXNlUmVmKG5ldyBTZXQoKSlcbiAgY29uc3QgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IGNhbnZhc0xvY2tlZCA9ICFpbnRlcmFjdGl2ZSB8fCBzcGFjZUhlbGRcbiAgY29uc3QgYWxsU2NyZWVuSWRzID0gcHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpXG4gIGNvbnN0IGlzRGVtbyA9IG1vZGUgPT09ICdkZW1vJyAmJiBkZW1vQXZhaWxhYmxlXG4gIGNvbnN0IGFjdGl2ZVNjYWxlID0gaXNEZW1vID8gZGVtb1NjYWxlIDogY2FudmFzU2NhbGVcbiAgY29uc3Qgc2V0QWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBzZXREZW1vU2NhbGUgOiBzZXRDYW52YXNTY2FsZVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3U2VsZWN0aW9uID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICBzZXRSZXZpZXdTZWxlY3Rpb25zKFtdKVxuICB9LCBbXSlcblxuICBjb25zdCBzZWxlY3RSZXZpZXdFbGVtZW50ID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQsIHNjcmVlbiwgY29udGVudFJvb3QsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICAgIGNvbnN0IHByaW1hcnkgPSByZXZpZXdTZWxlY3Rpb25zW3Jldmlld1NlbGVjdGlvbnMubGVuZ3RoIC0gMV1cbiAgICBjb25zdCBhY3RpdmVTY3JlZW4gPSBzY3JlZW4gfHwgcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHByaW1hcnk/LnNjcmVlbklkKVxuICAgIGNvbnN0IGFjdGl2ZVJvb3QgPSBjb250ZW50Um9vdCB8fCBwcmltYXJ5Py5jb250ZW50Um9vdFxuICAgIGlmICghZWxlbWVudCB8fCAhYWN0aXZlU2NyZWVuIHx8ICFhY3RpdmVSb290KSByZXR1cm5cbiAgICBjb25zdCBuZXh0U2VsZWN0aW9uID0gZGVzY3JpYmVSZXZpZXdFbGVtZW50KGVsZW1lbnQsIGFjdGl2ZVJvb3QsIGFjdGl2ZVNjcmVlbilcbiAgICBjb25zdCBhZGRpdGl2ZSA9IHJldmlld011bHRpU2VsZWN0IHx8IG9wdGlvbnMuYWRkaXRpdmVcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUodHJ1ZSlcblxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChvcHRpb25zLnJlcGxhY2VFbGVtZW50KSB7XG4gICAgICAgIG9wdGlvbnMucmVwbGFjZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICBpZiAoY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQgJiYgaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KSkge1xuICAgICAgICAgIHJldHVybiBjdXJyZW50LmZpbHRlcigoaXRlbSkgPT4gaXRlbS5lbGVtZW50ICE9PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50KVxuICAgICAgICB9XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5tYXAoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gb3B0aW9ucy5yZXBsYWNlRWxlbWVudCA/IG5leHRTZWxlY3Rpb24gOiBpdGVtKVxuICAgICAgfVxuICAgICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gY3VycmVudC5zb21lKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgPT09IGVsZW1lbnQpXG4gICAgICBpZiAoIWFkZGl0aXZlKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc2VsZWN0ZWRFbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgICAgIHNlbGVjdGVkRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICB9XG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5jbGVhcigpXG4gICAgICB9IGVsc2UgaWYgKGFscmVhZHlTZWxlY3RlZCkge1xuICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5kZWxldGUoZWxlbWVudClcbiAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudC5hZGQoZWxlbWVudClcbiAgICAgIHJldHVybiBhZGRpdGl2ZSA/IFsuLi5jdXJyZW50LCBuZXh0U2VsZWN0aW9uXSA6IFtuZXh0U2VsZWN0aW9uXVxuICAgIH0pXG4gIH0sIFtwcm9qZWN0LnNjcmVlbnMsIHJldmlld011bHRpU2VsZWN0LCByZXZpZXdTZWxlY3Rpb25zXSlcblxuICBjb25zdCByZW1vdmVSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCkgPT4ge1xuICAgIGVsZW1lbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IGVsZW1lbnQpKVxuICB9LCBbXSlcblxuICBjb25zdCBjbG9zZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRSZXZpZXdFbmFibGVkKGZhbHNlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZShmYWxzZSlcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgY2xlYXJSZXZpZXdTZWxlY3Rpb24oKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb25dKVxuXG4gIGNvbnN0IGhvdmVyUmV2aWV3QnJlYWRjcnVtYiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50ID0gZWxlbWVudCB8fCBudWxsXG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHRvZ2dsZVJldmlldyA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAocmV2aWV3RW5hYmxlZCkge1xuICAgICAgY2xvc2VSZXZpZXcoKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIHNldFJldmlld0VuYWJsZWQodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3LCByZXZpZXdFbmFibGVkXSlcblxuICBjb25zdCBvcGVuUmV2aWV3UGFuZWwgPSAoKSA9PiB7XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdFbmFibGVkKHRydWUpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKHRydWUpXG4gIH1cblxuICBjb25zdCBhZGRSZXZpZXdJdGVtID0gKGl0ZW0pID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gW1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIHsgLi4uaXRlbSwgaWQ6IGByZXZpZXctJHtEYXRlLm5vdygpfS0ke2N1cnJlbnQubGVuZ3RoICsgMX1gIH0sXG4gICAgXSlcbiAgfVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld0l0ZW0gPSAoaWQpID0+IHtcbiAgICBzZXRSZXZpZXdJdGVtcygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uaWQgIT09IGlkKSlcbiAgfVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiAoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGNsZWFyUmV2aWV3U2VsZWN0aW9uKClcbiAgICBob3ZlclJldmlld0JyZWFkY3J1bWIobnVsbClcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbiwgaG92ZXJSZXZpZXdCcmVhZGNydW1iLCBtb2RlLCB2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocmV2aWV3SXRlbXMubGVuZ3RoID09PSAwKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdClcbiAgfSwgW3Jldmlld0l0ZW1zLmxlbmd0aF0pXG5cbiAgY29uc3QgZXhpdEltbWVyc2l2ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRJbW1lcnNpdmUoZmFsc2UpXG4gICAgc2V0SW1tZXJzaXZlVG9vbGJhckV4cGFuZGVkKHRydWUpXG4gICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGVudGVySW1tZXJzaXZlID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNsb3NlUmV2aWV3KClcbiAgICBzZXRIZWxwVmlzaWJsZShmYWxzZSlcbiAgICBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQodHJ1ZSlcbiAgICBzZXRJbW1lcnNpdmUodHJ1ZSlcbiAgfSwgW2Nsb3NlUmV2aWV3XSlcblxuICBjb25zdCB0b2dnbGVJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgaWYgKGltbWVyc2l2ZSkgZXhpdEltbWVyc2l2ZSgpXG4gICAgZWxzZSBlbnRlckltbWVyc2l2ZSgpXG4gIH0sIFtlbnRlckltbWVyc2l2ZSwgZXhpdEltbWVyc2l2ZSwgaW1tZXJzaXZlXSlcblxuICBjb25zdCB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbiA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkge1xuICAgICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY2xvc2VSZXZpZXcoKVxuICAgIHNldEhlbHBWaXNpYmxlKGZhbHNlKVxuICAgIHNldEltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCh0cnVlKVxuICAgIHNldEltbWVyc2l2ZSh0cnVlKVxuICAgIHJlcXVlc3RCb2FyZEZ1bGxzY3JlZW4oYm9hcmRSZWYuY3VycmVudClcbiAgfSwgW2Nsb3NlUmV2aWV3XSlcblxuICBjb25zdCB1cGRhdGVDYW52YXNJbmRleFZpc2libGUgPSBSZWFjdC51c2VDYWxsYmFjaygodmlzaWJsZSkgPT4ge1xuICAgIHNldENhbnZhc0luZGV4VmlzaWJsZSh2aXNpYmxlKVxuICAgIHNhdmVCb2FyZFNldHRpbmdzKGdldEJvYXJkU3RvcmFnZSgpLCBwcm9qZWN0Lm5hbWUsIHsgc2hvd0NhbnZhc0luZGV4OiB2aXNpYmxlIH0pXG4gIH0sIFtwcm9qZWN0Lm5hbWVdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSByZWFkQm9hcmRTZXR0aW5ncyhnZXRCb2FyZFN0b3JhZ2UoKSwgcHJvamVjdC5uYW1lKVxuICAgIHNldENhbnZhc0luZGV4VmlzaWJsZShzZXR0aW5ncy5zaG93Q2FudmFzSW5kZXgpXG4gICAgc2V0Q2FudmFzSW5kZXhQb3NpdGlvbihudWxsKVxuICB9LCBbcHJvamVjdC5uYW1lXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEV4cGFuZGVkSWRzKG5ldyBTZXQoKSlcbiAgfSwgW3ZpZXdwb3J0S2V5XSlcblxuICBjb25zdCB0b2dnbGVFeHBhbmQgPSAoaWQpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcygoY3VycmVudCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQoY3VycmVudClcbiAgICAgIGlmIChuZXh0LmhhcyhpZCkpIG5leHQuZGVsZXRlKGlkKVxuICAgICAgZWxzZSBuZXh0LmFkZChpZClcbiAgICAgIHJldHVybiBuZXh0XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGV4cGFuZFRhcmdldHMgPSAoc2hvdWxkRXhwYW5kKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJlc29sdmVFeHBhbmRUYXJnZXRzKHNlbGVjdGVkSWRzLCBhbGxTY3JlZW5JZHMpXG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBmb3IgKGNvbnN0IGlkIG9mIHRhcmdldHMpIHtcbiAgICAgICAgaWYgKHNob3VsZEV4cGFuZCkgbmV4dC5hZGQoaWQpXG4gICAgICAgIGVsc2UgbmV4dC5kZWxldGUoaWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGRvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgIGlmIChldmVudC5jb2RlID09PSAnU3BhY2UnICYmICFldmVudC5yZXBlYXQgJiYgIWlzRWRpdGFibGVTaG9ydGN1dFRhcmdldChldmVudC50YXJnZXQpKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgc2V0U3BhY2VIZWxkKHRydWUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBzaG9ydGN1dCA9IHNob3J0Y3V0SWRGb3JFdmVudChldmVudClcbiAgICAgIGlmICghc2hvcnRjdXQpIHJldHVyblxuICAgICAgaWYgKHNob3J0Y3V0ICE9PSAnZXNjYXBlJyAmJiBpc0VkaXRhYmxlU2hvcnRjdXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2RlbW8nICYmICFkZW1vQXZhaWxhYmxlKSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hvdHNwb3RzJyAmJiAhaXNEZW1vKSByZXR1cm5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2VzY2FwZScgJiYgZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2NhbnZhcycpIHNldE1vZGUoJ2NhbnZhcycpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdkZW1vJykgc2V0TW9kZSgnZGVtbycpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdpbnRlcmFjdGlvbicpIHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAncmV2aWV3JykgdG9nZ2xlUmV2aWV3KClcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2ltbWVyc2l2ZScpIHRvZ2dsZUltbWVyc2l2ZSgpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdicm93c2VyLWZ1bGxzY3JlZW4nKSB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbigpXG4gICAgICBpZiAoc2hvcnRjdXQgPT09ICdob3RzcG90cycpIHNldEhvdHNwb3RzVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSlcbiAgICAgIGlmIChzaG9ydGN1dCA9PT0gJ2hlbHAnKSB7XG4gICAgICAgIHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKVxuICAgICAgfVxuICAgICAgaWYgKHNob3J0Y3V0ID09PSAnZXNjYXBlJykge1xuICAgICAgICBpZiAoaGVscFZpc2libGUpIHNldEhlbHBWaXNpYmxlKGZhbHNlKVxuICAgICAgICBlbHNlIGlmIChyZXZpZXdFbmFibGVkKSBjbG9zZVJldmlldygpXG4gICAgICAgIGVsc2UgaWYgKGltbWVyc2l2ZSkgZXhpdEltbWVyc2l2ZSgpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHVwID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSA9PT0gJ1NwYWNlJykgc2V0U3BhY2VIZWxkKGZhbHNlKVxuICAgIH1cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdXApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZG93bilcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIH1cbiAgfSwgW1xuICAgIGNsb3NlUmV2aWV3LFxuICAgIGRlbW9BdmFpbGFibGUsXG4gICAgZXhpdEltbWVyc2l2ZSxcbiAgICBoZWxwVmlzaWJsZSxcbiAgICBpbW1lcnNpdmUsXG4gICAgaXNEZW1vLFxuICAgIHJldmlld0VuYWJsZWQsXG4gICAgc2V0TW9kZSxcbiAgICB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbixcbiAgICB0b2dnbGVJbW1lcnNpdmUsXG4gICAgdG9nZ2xlUmV2aWV3LFxuICBdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdkZW1vJykgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9LCBbbW9kZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzeW5jID0gKCkgPT4gc2V0QnJvd3NlckZ1bGxzY3JlZW4oISFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgY29uc3QgZXhwb3J0SWRzID0gKGlkcykgPT4gcnVuRXhwb3J0V2l0aEZlZWRiYWNrKGFzeW5jICgpID0+IHtcbiAgICBzZXRFeHBvcnRpbmcodHJ1ZSlcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2NyZWVucyA9IGlkcy5tYXAoKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IHNjcmVlbiA9IHByb2plY3Quc2NyZWVucy5maW5kKChpdGVtKSA9PiBpdGVtLmlkID09PSBpZClcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZCxcbiAgICAgICAgICB0aXRsZTogc2NyZWVuLnRpdGxlLFxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLXNjcmVlbi1pZD1cIiR7aWR9XCJdIC53Zi1zY3JlZW4tY29udGVudGApLFxuICAgICAgICAgIHZpZXdwb3J0LFxuICAgICAgICAgIGV4cGFuZGVkOiBleHBhbmRlZElkcy5oYXMoaWQpLFxuICAgICAgICAgIHByb2plY3ROYW1lOiBwcm9qZWN0Lm5hbWUsXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBhd2FpdCBleHBvcnRTZWxlY3RlZChzY3JlZW5zKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRFeHBvcnRpbmcoZmFsc2UpXG4gICAgfVxuICB9LCBzZXRFeHBvcnRFcnJvcilcblxuICBjb25zdCByZXNldERlbW8gPSAoKSA9PiB7XG4gICAgcmVzZXQoKVxuICAgIHNldEhvdHNwb3RzVmlzaWJsZShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0RGVtb1ZpZXcgPSAoKSA9PiB7XG4gICAgc2V0RGVtb1ZpZXdSZXNldEtleSgodmFsdWUpID0+IHZhbHVlICsgMSlcbiAgfVxuXG4gIGNvbnN0IHJlc2V0QWN0aXZlVmlldyA9IGlzRGVtbyA/IHJlc2V0RGVtb1ZpZXcgOiAoKSA9PiBzZXRDYW52YXNTY2FsZSgxKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgcmVmPXtib2FyZFJlZn1cbiAgICAgIGNsYXNzTmFtZT17YHdmLWJvYXJkJHtpbW1lcnNpdmUgPyAnIGlzLWltbWVyc2l2ZScgOiAnJ30ke3Jldmlld0VuYWJsZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgID5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtYm9hcmQtdG9vbGJhclwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItbGVmdFwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ3Zi1wcm9qZWN0LW5hbWVcIj57cHJvamVjdC5uYW1lfTwvaDE+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcHJvamVjdC1tZXRhXCI+e3Byb2plY3Quc2NyZWVucy5sZW5ndGh9IFx1OTg3NTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWNlbnRlclwiPlxuICAgICAgICAgIHtkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RlLXN3aXRjaGVyXCIgcm9sZT1cImdyb3VwXCIgYXJpYS1sYWJlbD1cIlx1NkEyMVx1NUYwRlwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnY2FudmFzJyA/ICdpcy1hY3RpdmUnIDogJyd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnY2FudmFzJyl9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTc1M0JcdTY3N0ZcdTZBMjFcdTVGMEZcdUZGMDhDdHJsKzFcdUZGMDlcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU3NTNCXHU2NzdGXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnZGVtbycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2RlbW8nKX1cbiAgICAgICAgICAgICAgICB0aXRsZT1cIlx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYwOEN0cmwrMlx1RkYwOVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTZGMTRcdTc5M0FcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHt2aWV3cG9ydE9wdGlvbnMubGVuZ3RoID4gMSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytdmlld3BvcnQtc3dpdGNoZXJcIiByb2xlPVwiZ3JvdXBcIiBhcmlhLWxhYmVsPVwiXHU4OUM2XHU1M0UzXCI+XG4gICAgICAgICAgICAgIHt2aWV3cG9ydE9wdGlvbnMubWFwKChrZXkpID0+IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIGtleT17a2V5fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt2aWV3cG9ydEtleSA9PT0ga2V5ID8gJ2lzLWFjdGl2ZScgOiAnJ31cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpZXdwb3J0S2V5KGtleSl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge1ZJRVdQT1JUX0xBQkVMU1trZXldIHx8IGtleX1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgIHttb2RlID09PSAnY2FudmFzJyB8fCAhZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgICAgICBzY2FsZT17Y2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldENhbnZhc1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9eygpID0+IHNldENhbnZhc1NjYWxlKDEpfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8SW50ZXJhY3Rpb25Mb2NrXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBvblJlc2V0PXtyZXNldERlbW9WaWV3fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8SW50ZXJhY3Rpb25Mb2NrXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hvdHNwb3RzVmlzaWJsZSA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhvdHNwb3RzVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTY2M0VcdTc5M0FcdTYyMTZcdTk2OTBcdTg1Q0ZcdTZGMTRcdTc5M0FcdTcwRURcdTUzM0FcdUZGMDhDdHJsK0hcdUZGMDlcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1kZW1vLWVudHJ5XCI+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJ3Zi1kZW1vLWVudHJ5XCI+XHU1MTY1XHU1M0UzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICBpZD1cIndmLWRlbW8tZW50cnlcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2VudHJ5SWR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZWxlY3RFbnRyeShldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDlcdTYyRTlcdTZGMTRcdTc5M0FcdTUxNjVcdTUzRTNcdTk4NzVcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtzY3JlZW4uaWR9IHZhbHVlPXtzY3JlZW4uaWR9PlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCArIDF9LiB7c2NyZWVuLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17cmVzZXREZW1vfT5cdTkxQ0RcdTdGNkU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtZGVtby1wYWdlLWxhYmVsXCI+XG4gICAgICAgICAgICAgICAgXHU1RjUzXHU1MjREXHVGRjFBXG4gICAgICAgICAgICAgICAge2N1cnJlbnRTY3JlZW5cbiAgICAgICAgICAgICAgICAgID8gYCR7cHJvamVjdC5zY3JlZW5zLmZpbmRJbmRleCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW4uaWQpICsgMX0uICR7Y3VycmVudFNjcmVlbi50aXRsZX0gXHUwMEI3ICR7Y3VycmVudFNjcmVlbi5pZH0uanN4YFxuICAgICAgICAgICAgICAgICAgOiBjdXJyZW50U2NyZWVuSWR9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1yaWdodFwiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtoZWxwVmlzaWJsZSA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2MjUzXHU1RjAwXHU1RTJFXHU1MkE5XHUzMDAxXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RTBFXHU4QkJFXHU3RjZFXCJcbiAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2hlbHBWaXNpYmxlfVxuICAgICAgICAgICAgYXJpYS1jb250cm9scz1cIndmLWJvYXJkLXV0aWxpdHlcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkVcdUZGMDg/XHVGRjA5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhlbHBWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImhlbHBcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1RTJFXHU1MkE5IC8gXHU1RkVCXHU2Mzc3XHU5NTJFIC8gXHU4QkJFXHU3RjZFPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPXtyZXZpZXdFbmFibGVkID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uJ31cbiAgICAgICAgICAgIGFyaWEtcHJlc3NlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3Jldmlld0VuYWJsZWQgPyAnXHU0RkVFXHU2NTM5XHU0RTJEJyA6ICdcdTRGRUVcdTY1MzknfVxuICAgICAgICAgICAgdGl0bGU9XCJcdTRGRUVcdTY1MzlcdUZGMUFcdTcwQjlcdTkwMDlcdTk4NzVcdTk3NjJcdTgyODJcdTcwQjlcdTVFNzZcdTY1NzRcdTc0MDZcdTYyMTBcdTUzRUZcdTdGMTZcdThGOTFcdTc2ODQgQUkgXHU0RkVFXHU2NTM5IFByb21wdFx1RkYwOEN0cmwrTVx1RkYwOVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVSZXZpZXd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJlZGl0XCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b25cIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aW1tZXJzaXZlID8gJ1x1OTAwMFx1NTFGQVx1NkM4OVx1NkQ3OFx1NkEyMVx1NUYwRicgOiAnXHU4RkRCXHU1MTY1XHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGJ31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU1MjA3XHU2MzYyXHU2Qzg5XHU2RDc4XHU2QTIxXHU1RjBGXHVGRjA4Q3RybCtGXHVGRjA5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUltbWVyc2l2ZX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImZ1bGxzY3JlZW5cIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU1QzRGPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4JyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImV4cGFuZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTVDNTVcdTVGMDA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTY1MzZcdThENzdcdTUxNjhcdTkwRTgnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbGxhcHNlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NjUzNlx1OEQ3Nzwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtdG9vbGJhci1pY29uLWJ1dHRvbi0tcHJpbWFyeVwiXG4gICAgICAgICAgICBkaXNhYmxlZD17ZXhwb3J0aW5nIHx8IHNlbGVjdGVkSWRzLnNpemUgPT09IDAgfHwgbW9kZSA9PT0gJ2RlbW8nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17ZXhwb3J0aW5nID8gJ1x1NkI2M1x1NTcyOFx1NUJGQ1x1NTFGQScgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEXHVGRjA4JHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVcdUZGMDlgfVxuICAgICAgICAgICAgdGl0bGU9e2V4cG9ydGluZyA/ICdcdTVCRkNcdTUxRkFcdTRFMkRcdTIwMjYnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RCAke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBvcnRJZHMoWy4uLnNlbGVjdGVkSWRzXSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJkb3dubG9hZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj57ZXhwb3J0aW5nID8gJ1x1MjAyNicgOiBzZWxlY3RlZElkcy5zaXplfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAge2V4cG9ydEVycm9yID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXhwb3J0RXJyb3J9PC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge2ltbWVyc2l2ZSA/IChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17YHdmLWltbWVyc2l2ZS1jaHJvbWUke2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICcnIDogJyBpcy1jb2xsYXBzZWQnfWB9XG4gICAgICAgICAgcm9sZT1cInRvb2xiYXJcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTZDODlcdTZENzhcdTYzQTdcdTRFRjZcIlxuICAgICAgICA+XG4gICAgICAgICAge2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtaW1tZXJzaXZlLWNvbnRyb2xzXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIlxuICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDAwXHU1MUZBXHU2Qzg5XHU2RDc4XHVGRjA4RXNjXHVGRjA5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtleGl0SW1tZXJzaXZlfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU5MDAwXHU1MUZBXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXticm93c2VyRnVsbHNjcmVlbiA/ICd3Zi1ib2FyZC1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi1ib2FyZC1idXR0b24nfVxuICAgICAgICAgICAgICAgIHRpdGxlPXticm93c2VyRnVsbHNjcmVlbiA/ICdcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEZcdUZGMDhDdHJsK1NoaWZ0K0ZcdUZGMDknIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rlx1RkYwOEN0cmwrU2hpZnQrRlx1RkYwOSd9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlQnJvd3NlckZ1bGxzY3JlZW59XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGIE9OJyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXthY3RpdmVTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0QWN0aXZlU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17cmVzZXRBY3RpdmVWaWV3fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8SW50ZXJhY3Rpb25Mb2NrXG4gICAgICAgICAgICAgICAgaW50ZXJhY3RpdmU9e2ludGVyYWN0aXZlfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2hlbHBWaXNpYmxlID8gJ3dmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b24gaXMtYWN0aXZlJyA6ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS1hY3Rpb24tYnV0dG9uJ31cbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiXHU2MjUzXHU1RjAwXHU1RTJFXHU1MkE5XHUzMDAxXHU1RkVCXHU2Mzc3XHU5NTJFXHU0RTBFXHU4QkJFXHU3RjZFXCJcbiAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoZWxwVmlzaWJsZX1cbiAgICAgICAgICAgICAgICBhcmlhLWNvbnRyb2xzPVwid2YtYm9hcmQtdXRpbGl0eVwiXG4gICAgICAgICAgICAgICAgdGl0bGU9XCJcdTVFMkVcdTUyQTkgLyBcdTVGRUJcdTYzNzdcdTk1MkUgLyBcdThCQkVcdTdGNkVcdUZGMDg/XHVGRjA5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRIZWxwVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImhlbHBcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtaW1tZXJzaXZlLWFjdGlvbi1idXR0b25cIlxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NUM1NVx1NUYwMFx1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4JyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGV4cGFuZFRhcmdldHModHJ1ZSl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImV4cGFuZFwiIC8+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvbiB3Zi1pbW1lcnNpdmUtYWN0aW9uLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU2NTM2XHU4RDc3XHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGJyA6ICdcdTY1MzZcdThENzdcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTY1MzZcdThENzdcdTUxNjhcdTkwRTgnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyhmYWxzZSl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbGxhcHNlXCIgLz5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIHtpc0RlbW8gPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e2dvQmFja30+XHU4RkQ0XHU1NkRFPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEhvdHNwb3RzVmlzaWJsZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU2NjNFXHU3OTNBXHU2MjE2XHU5NjkwXHU4NUNGXHU2RjE0XHU3OTNBXHU3MEVEXHU1MzNBXHVGRjA4Q3RybCtIXHVGRjA5XCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2hvdHNwb3RzVmlzaWJsZSA/ICdcdTcwRURcdTUzM0EgT04nIDogJ1x1NzBFRFx1NTMzQSBPRkYnfVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uIHdmLWltbWVyc2l2ZS10b29sYmFyLXRvZ2dsZVwiXG4gICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAnXHU2NTM2XHU4RDc3XHU3Q0JFXHU3QjgwXHU1REU1XHU1MTc3XHU2ODBGJyA6ICdcdTVDNTVcdTVGMDBcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnfVxuICAgICAgICAgICAgdGl0bGU9e2ltbWVyc2l2ZVRvb2xiYXJFeHBhbmRlZCA/ICdcdTY1MzZcdThENzdcdTdDQkVcdTdCODBcdTVERTVcdTUxNzdcdTY4MEYnIDogJ1x1NUM1NVx1NUYwMFx1N0NCRVx1N0I4MFx1NURFNVx1NTE3N1x1NjgwRid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRJbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPXtpbW1lcnNpdmVUb29sYmFyRXhwYW5kZWQgPyAndG9vbGJhckNvbGxhcHNlJyA6ICd0b29sYmFyRXhwYW5kJ30gLz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge21vZGUgPT09ICdjYW52YXMnID8gKFxuICAgICAgICA8Q2FudmFzTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzZWxlY3RlZElkcz17c2VsZWN0ZWRJZHN9XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJZHM9e3NldFNlbGVjdGVkSWRzfVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIG9uRXhwb3J0SWRzPXtleHBvcnRJZHN9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgICBjYW52YXNJbmRleFZpc2libGU9e2NhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBjYW52YXNJbmRleFBvc2l0aW9uPXtjYW52YXNJbmRleFBvc2l0aW9ufVxuICAgICAgICAgIG9uQ2FudmFzSW5kZXhQb3NpdGlvbkNoYW5nZT17c2V0Q2FudmFzSW5kZXhQb3NpdGlvbn1cbiAgICAgICAgICBvbkNsb3NlQ2FudmFzSW5kZXg9eygpID0+IHVwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8RGVtb01vZGVcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIGhvdHNwb3RzVmlzaWJsZT17aG90c3BvdHNWaXNpYmxlfVxuICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgIHNjYWxlPXtkZW1vU2NhbGV9XG4gICAgICAgICAgc2V0U2NhbGU9e3NldERlbW9TY2FsZX1cbiAgICAgICAgICB2aWV3UmVzZXRLZXk9e2RlbW9WaWV3UmVzZXRLZXl9XG4gICAgICAgICAgZXhwYW5kZWRJZHM9e2V4cGFuZGVkSWRzfVxuICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXt0b2dnbGVFeHBhbmR9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgLz5cbiAgICAgICl9XG4gICAgICB7cmV2aWV3RW5hYmxlZCA/IChcbiAgICAgICAgPFJldmlld01hcmtlcnMgYm9hcmRSZWY9e2JvYXJkUmVmfSBpdGVtcz17cmV2aWV3SXRlbXN9IG9uT3BlblBhbmVsPXtvcGVuUmV2aWV3UGFuZWx9IC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxSZXZpZXdMYXVuY2hlclxuICAgICAgICBib2FyZFJlZj17Ym9hcmRSZWZ9XG4gICAgICAgIGNvdW50PXtyZXZpZXdJdGVtcy5sZW5ndGh9XG4gICAgICAgIHByb2plY3ROYW1lPXtwcm9qZWN0Lm5hbWV9XG4gICAgICAgIG9uT3Blbj17b3BlblJldmlld1BhbmVsfVxuICAgICAgLz5cbiAgICAgIHtoZWxwVmlzaWJsZSA/IChcbiAgICAgICAgPFNob3J0Y3V0SGVscFxuICAgICAgICAgIGRlbW9BdmFpbGFibGU9e2RlbW9BdmFpbGFibGV9XG4gICAgICAgICAgc2hvd0NhbnZhc0luZGV4PXtjYW52YXNJbmRleFZpc2libGV9XG4gICAgICAgICAgb25TaG93Q2FudmFzSW5kZXhDaGFuZ2U9e3VwZGF0ZUNhbnZhc0luZGV4VmlzaWJsZX1cbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRIZWxwVmlzaWJsZShmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICAgIHtyZXZpZXdFbmFibGVkICYmIHJldmlld1BhbmVsVmlzaWJsZSA/IChcbiAgICAgICAgPFJldmlld1BhbmVsXG4gICAgICAgICAgcHJvamVjdD17cHJvamVjdH1cbiAgICAgICAgICBzZWxlY3Rpb25zPXtyZXZpZXdTZWxlY3Rpb25zfVxuICAgICAgICAgIG11bHRpU2VsZWN0PXtyZXZpZXdNdWx0aVNlbGVjdH1cbiAgICAgICAgICBpdGVtcz17cmV2aWV3SXRlbXN9XG4gICAgICAgICAgb25Ub2dnbGVNdWx0aVNlbGVjdD17KCkgPT4gc2V0UmV2aWV3TXVsdGlTZWxlY3QoKHZhbHVlKSA9PiAhdmFsdWUpfVxuICAgICAgICAgIG9uU2VsZWN0RWxlbWVudD17KGVsZW1lbnQpID0+IHNlbGVjdFJldmlld0VsZW1lbnQoZWxlbWVudCwgbnVsbCwgbnVsbCwge1xuICAgICAgICAgICAgcmVwbGFjZUVsZW1lbnQ6IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXT8uZWxlbWVudCxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBvbkhvdmVyRWxlbWVudD17aG92ZXJSZXZpZXdCcmVhZGNydW1ifVxuICAgICAgICAgIG9uUmVtb3ZlU2VsZWN0aW9uPXtyZW1vdmVSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgICAgb25DbGVhclNlbGVjdGlvbj17Y2xlYXJSZXZpZXdTZWxlY3Rpb259XG4gICAgICAgICAgb25BZGRJdGVtPXthZGRSZXZpZXdJdGVtfVxuICAgICAgICAgIG9uUmVtb3ZlSXRlbT17cmVtb3ZlUmV2aWV3SXRlbX1cbiAgICAgICAgICBvbkNsb3NlPXtjbG9zZVJldmlld31cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiZnVuY3Rpb24gZmFpbChwYXRoLCBtZXNzYWdlKSB7XG4gIHRocm93IG5ldyBFcnJvcihgJHtwYXRofSAke21lc3NhZ2V9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlUHJvamVjdChwcm9qZWN0KSB7XG4gIGlmICghcHJvamVjdCB8fCB0eXBlb2YgcHJvamVjdCAhPT0gJ29iamVjdCcpIGZhaWwoJ3Byb2plY3QnLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICBpZiAoIXByb2plY3Qudmlld3BvcnRzIHx8IHR5cGVvZiBwcm9qZWN0LnZpZXdwb3J0cyAhPT0gJ29iamVjdCcpIHtcbiAgICBmYWlsKCdwcm9qZWN0LnZpZXdwb3J0cycsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBjb25zdCB2aWV3cG9ydEVudHJpZXMgPSBPYmplY3QuZW50cmllcyhwcm9qZWN0LnZpZXdwb3J0cylcbiAgaWYgKHZpZXdwb3J0RW50cmllcy5sZW5ndGggPT09IDApIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgdmlld3BvcnQnKVxuICBmb3IgKGNvbnN0IFtrZXksIHZpZXdwb3J0XSBvZiB2aWV3cG9ydEVudHJpZXMpIHtcbiAgICBpZiAoIXZpZXdwb3J0IHx8IHR5cGVvZiB2aWV3cG9ydCAhPT0gJ29iamVjdCcpIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fWAsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgZm9yIChjb25zdCBkaW1lbnNpb24gb2YgWyd3aWR0aCcsICdoZWlnaHQnXSkge1xuICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUodmlld3BvcnRbZGltZW5zaW9uXSkgfHwgdmlld3BvcnRbZGltZW5zaW9uXSA8PSAwKSB7XG4gICAgICAgIGZhaWwoYHByb2plY3Qudmlld3BvcnRzLiR7a2V5fS4ke2RpbWVuc2lvbn1gLCAnbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCBwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCkpIHtcbiAgICBmYWlsKCdwcm9qZWN0LmRlZmF1bHRWaWV3cG9ydCcsIGByZWZlcmVuY2VzIG1pc3Npbmcgdmlld3BvcnQgXCIke3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0fVwiYClcbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkocHJvamVjdC5zY3JlZW5zKSB8fCBwcm9qZWN0LnNjcmVlbnMubGVuZ3RoID09PSAwKSB7XG4gICAgZmFpbCgncHJvamVjdC5zY3JlZW5zJywgJ211c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgc2NyZWVuJylcbiAgfVxuXG4gIGNvbnN0IGlkcyA9IG5ldyBTZXQoKVxuICBwcm9qZWN0LnNjcmVlbnMuZm9yRWFjaCgoc2NyZWVuLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHBhdGggPSBgcHJvamVjdC5zY3JlZW5zWyR7aW5kZXh9XWBcbiAgICBpZiAoIXNjcmVlbiB8fCB0eXBlb2Ygc2NyZWVuICE9PSAnb2JqZWN0JykgZmFpbChwYXRoLCAnbXVzdCBiZSBhbiBvYmplY3QnKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmlkICE9PSAnc3RyaW5nJyB8fCAhL15bYS16MC05LV0rJC8udGVzdChzY3JlZW4uaWQpKSB7XG4gICAgICBmYWlsKGAke3BhdGh9LmlkYCwgJ211c3QgbWF0Y2ggL15bYS16MC05LV0rJC8nKVxuICAgIH1cbiAgICBpZiAoaWRzLmhhcyhzY3JlZW4uaWQpKSBmYWlsKGAke3BhdGh9LmlkYCwgYGlzIGR1cGxpY2F0ZSBcIiR7c2NyZWVuLmlkfVwiYClcbiAgICBpZHMuYWRkKHNjcmVlbi5pZClcbiAgICBpZiAodHlwZW9mIHNjcmVlbi5jb21wb25lbnQgIT09ICdmdW5jdGlvbicpIGZhaWwoYCR7cGF0aH0uY29tcG9uZW50YCwgJ211c3QgYmUgYSBmdW5jdGlvbicpXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHNjcmVlbi5saW5rcykpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0ubGlua3NgLCAnbXVzdCBiZSBhbiBhcnJheScpXG4gICAgfVxuICB9KVxuXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIHNjcmVlbkluZGV4KSA9PiB7XG4gICAgc2NyZWVuLmxpbmtzLmZvckVhY2goKHRhcmdldCwgbGlua0luZGV4KSA9PiB7XG4gICAgICBpZiAoIWlkcy5oYXModGFyZ2V0KSkge1xuICAgICAgICBmYWlsKFxuICAgICAgICAgIGBwcm9qZWN0LnNjcmVlbnNbJHtzY3JlZW5JbmRleH1dLmxpbmtzWyR7bGlua0luZGV4fV1gLFxuICAgICAgICAgIGByZWZlcmVuY2VzIG1pc3Npbmcgc2NyZWVuIFwiJHt0YXJnZXR9XCJgLFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuXG5leHBvcnQgeyBmaW5kRmxvd1RhcmdldElkLCBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2sgfSBmcm9tICcuL2Zsb3ctdGFyZ2V0LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRmxvd1Byb3BzKHRvLCBvbkNsaWNrLCBuYXZpZ2F0ZSkge1xuICByZXR1cm4ge1xuICAgICdkYXRhLWZsb3ctdG8nOiB0byB8fCB1bmRlZmluZWQsXG4gICAgb25DbGljazogKGV2ZW50KSA9PiB7XG4gICAgICBpZiAodG8pIGV2ZW50LnN0b3BQcm9wYWdhdGlvbj8uKClcbiAgICAgIGlmIChvbkNsaWNrKSBvbkNsaWNrKGV2ZW50KVxuICAgICAgaWYgKCFldmVudC5kZWZhdWx0UHJldmVudGVkICYmIHRvKSBuYXZpZ2F0ZSh0bylcbiAgICB9LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5mdW5jdGlvbiBqb2luQ2xhc3MoYmFzZSwgZXh0cmEpIHtcbiAgcmV0dXJuIGV4dHJhID8gYCR7YmFzZX0gJHtleHRyYX1gIDogYmFzZVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSkge1xuICBjb25zdCB2YWx1ZSA9XG4gICAgY29sdW1ucyAmJiB0eXBlb2YgY29sdW1ucyA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoY29sdW1ucylcbiAgICAgID8gY29sdW1uc1t2aWV3cG9ydEtleV1cbiAgICAgIDogY29sdW1uc1xuICBpZiAoTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgJiYgdmFsdWUgPiAwKSByZXR1cm4gYHJlcGVhdCgke3ZhbHVlfSwgbWlubWF4KDAsIDFmcikpYFxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiB2YWx1ZS50cmltKCkpIHJldHVybiB2YWx1ZVxuICB0aHJvdyBuZXcgRXJyb3IoJ0dyaWQgY29sdW1ucyBtdXN0IHJlc29sdmUgdG8gYSBwb3NpdGl2ZSBpbnRlZ2VyIG9yIG5vbi1lbXB0eSBDU1Mgc3RyaW5nJylcbn1cblxuZnVuY3Rpb24gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdCkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIHtcbiAgICBjbGFzc05hbWVTdWZmaXg6IHRvID8gJyB3Zi1pbnRlcmFjdGl2ZScgOiAnJyxcbiAgICByb2xlOiB0byA/ICdsaW5rJyA6IHJlc3Qucm9sZSxcbiAgICB0YWJJbmRleDogdG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXgsXG4gICAgZmxvdyxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQm94KHsgY2xhc3NOYW1lLCBzdHlsZSwgY2hpbGRyZW4sIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ib3gke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXt7IC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gUm93KHtcbiAgY2xhc3NOYW1lLFxuICBzdHlsZSxcbiAgY2hpbGRyZW4sXG4gIGdhcCA9IDAsXG4gIGFsaWduSXRlbXMgPSAnc3RyZXRjaCcsXG4gIGp1c3RpZnlDb250ZW50ID0gJ2ZsZXgtc3RhcnQnLFxuICB0byxcbiAgb25DbGljayxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBmbGV4RGlyZWN0aW9uOiAncm93JyxcbiAgICBnYXAsXG4gICAgYWxpZ25JdGVtcyxcbiAgICBqdXN0aWZ5Q29udGVudCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1yb3cke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2x1bW4oe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWNvbHVtbiR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdyaWQoeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgY29sdW1ucyA9IDEsIGdhcCA9IDAsIHRvLCBvbkNsaWNrLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyB2aWV3cG9ydEtleSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogcmVzb2x2ZUNvbHVtbnMoY29sdW1ucywgdmlld3BvcnRLZXkpLFxuICAgIGdhcCxcbiAgICAuLi5zdHlsZSxcbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17am9pbkNsYXNzKGB3Zi1ncmlkJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBIZWFkaW5nKHsgbGV2ZWwgPSAyLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCB0YWcgPSBgaCR7TWF0aC5taW4oNiwgTWF0aC5tYXgoMSwgbGV2ZWwpKX1gXG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KHRhZywgeyBjbGFzc05hbWU6IGB3Zi1oZWFkaW5nICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGV4dCh7IGFzID0gJ3AnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChhcywgeyBjbGFzc05hbWU6IGB3Zi10ZXh0ICR7Y2xhc3NOYW1lfWAudHJpbSgpLCAuLi5yZXN0IH0sIGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2FyZCh7IHRvLCBvbkNsaWNrLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jYXJkICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQmFkZ2UoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNwYW4gY2xhc3NOYW1lPXtgd2YtYmFkZ2UgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zcGFuPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gQXZhdGFyKHsgc2l6ZSA9IDQwLCBsYWJlbCwgY2xhc3NOYW1lID0gJycsIHN0eWxlLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1hdmF0YXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWxhYmVsPXtsYWJlbH1cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBJbWFnZVBsYWNlaG9sZGVyKHtcbiAgd2lkdGggPSAnMTAwJScsXG4gIGhlaWdodCA9IDE2MCxcbiAgYm9yZGVyUmFkaXVzID0gMCxcbiAgY2xhc3NOYW1lID0gJycsXG4gIHN0eWxlLFxuICAuLi5yZXN0XG59KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtaW1hZ2UtcGxhY2Vob2xkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgc3R5bGU9e3sgd2lkdGgsIGhlaWdodCwgYm9yZGVyUmFkaXVzLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcGxhY2Vob2xkZXItYmxvY2tcIiAvPlxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEJ1dHRvbih7IHRvLCBvbkNsaWNrLCB2YXJpYW50ID0gJ2RlZmF1bHQnLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17YHdmLWJ1dHRvbiB3Zi1idXR0b24tJHt2YXJpYW50fSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0SW5wdXQoeyBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8aW5wdXQgY2xhc3NOYW1lPXtgd2YtaW5wdXQgJHtjbGFzc05hbWV9YC50cmltKCl9IHR5cGU9XCJ0ZXh0XCIgey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0QXJlYSh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDx0ZXh0YXJlYSBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi10ZXh0YXJlYSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9IC8+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3QoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHNlbGVjdCBjbGFzc05hbWU9e2B3Zi1pbnB1dCB3Zi1zZWxlY3QgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT57Y2hpbGRyZW59PC9zZWxlY3Q+XG59XG5cbmZ1bmN0aW9uIENob2ljZSh7IHR5cGUsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGxhYmVsIGNsYXNzTmFtZT17YHdmLWNob2ljZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0+XG4gICAgICA8aW5wdXQgY2xhc3NOYW1lPVwid2YtY2hvaWNlLWlucHV0XCIgdHlwZT17dHlwZX0gey4uLnJlc3R9IC8+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtbGFiZWxcIj57bGFiZWx9PC9zcGFuPlxuICAgIDwvbGFiZWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENoZWNrYm94KHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJjaGVja2JveFwiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFJhZGlvKHByb3BzKSB7XG4gIHJldHVybiA8Q2hvaWNlIHR5cGU9XCJyYWRpb1wiIHsuLi5wcm9wc30gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRvZ2dsZSh7IGNoZWNrZWQgPSBmYWxzZSwgb25DaGFuZ2UsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICByb2xlPVwic3dpdGNoXCJcbiAgICAgIGFyaWEtY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXRvZ2dsZSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gb25DaGFuZ2U/LighY2hlY2tlZCwgZXZlbnQpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRyYWNrXCI+PHNwYW4gY2xhc3NOYW1lPVwid2YtdG9nZ2xlLXRodW1iXCIgLz48L3NwYW4+XG4gICAgICB7bGFiZWwgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtbGFiZWxcIj57bGFiZWx9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZvcm1GaWVsZCh7IGxhYmVsLCBodG1sRm9yLCBoaW50LCBlcnJvciwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWZvcm0tZmllbGQgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1maWVsZC1sYWJlbFwiIGh0bWxGb3I9e2h0bWxGb3J9PntsYWJlbH08L2xhYmVsPlxuICAgICAge2NoaWxkcmVufVxuICAgICAge2hpbnQgJiYgIWVycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtaGludFwiPntoaW50fTwvc3Bhbj4gOiBudWxsfVxuICAgICAge2Vycm9yID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtZmllbGQtZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXJyb3J9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VQcm90b3R5cGUgfSBmcm9tICcuLi9jb3JlL1Byb3RvdHlwZUNvbnRleHQuanN4J1xuaW1wb3J0IHsgY3JlYXRlRmxvd1Byb3BzIH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gUGFnZUhlYWRlcih7IHRpdGxlLCB0aXRsZUlkLCBzdWJ0aXRsZSwgc3VidGl0bGVJZCwgYWN0aW9ucywgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxoZWFkZXIgY2xhc3NOYW1lPXtgd2YtcGFnZS1oZWFkZXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcGFnZS1oZWFkZXItY29weVwiPlxuICAgICAgICA8aDEgaWQ9e3RpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2UtdGl0bGVcIj57dGl0bGV9PC9oMT5cbiAgICAgICAge3N1YnRpdGxlID8gPHAgaWQ9e3N1YnRpdGxlSWR9IGNsYXNzTmFtZT1cIndmLXBhZ2Utc3VidGl0bGVcIj57c3VidGl0bGV9PC9wPiA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICAgIHthY3Rpb25zID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWFjdGlvbnNcIj57YWN0aW9uc308L2Rpdj4gOiBudWxsfVxuICAgIDwvaGVhZGVyPlxuICApXG59XG5cbmZ1bmN0aW9uIE5hdmlnYXRpb25MaXN0KHsgYXMsIGl0ZW1zLCBhY3RpdmVJZCwgY2xhc3NOYW1lLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG4gICAgYXMsXG4gICAgeyBjbGFzc05hbWUsIC4uLnJlc3QgfSxcbiAgICBpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi1uYXYtaXRlbSBpcy1hY3RpdmUnIDogJ3dmLW5hdi1pdGVtJ31cbiAgICAgICAgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX1cbiAgICAgID5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbmF2LW1hcmtcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbGFiZWxcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICA8L2J1dHRvbj5cbiAgICApKSxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU2lkZU5hdih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPE5hdmlnYXRpb25MaXN0XG4gICAgICBhcz1cIm5hdlwiXG4gICAgICBpdGVtcz17aXRlbXN9XG4gICAgICBhY3RpdmVJZD17YWN0aXZlSWR9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1zaWRlLW5hdiAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRhYkJhcih7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi10YWItYmFyICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBrZXk9e2l0ZW0udG99XG4gICAgICAgICAgY2xhc3NOYW1lPXtpdGVtLnRvID09PSBhY3RpdmVJZCA/ICd3Zi10YWItaXRlbSBpcy1hY3RpdmUnIDogJ3dmLXRhYi1pdGVtJ31cbiAgICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgICA+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXRhYi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQnJlYWRjcnVtYnMoeyBpdGVtcyA9IFtdLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHsgbmF2aWdhdGUgfSA9IHVzZVByb3RvdHlwZSgpXG4gIHJldHVybiAoXG4gICAgPG5hdiBjbGFzc05hbWU9e2B3Zi1icmVhZGNydW1icyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gYXJpYS1sYWJlbD1cIkJyZWFkY3J1bWJzXCIgey4uLnJlc3R9PlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17YCR7aXRlbS5sYWJlbH0tJHtpbmRleH1gfT5cbiAgICAgICAgICB7aW5kZXggPiAwID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1kaXZpZGVyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz4gOiBudWxsfVxuICAgICAgICAgIHtpdGVtLnRvID8gKFxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWxpbmtcIiB0eXBlPVwiYnV0dG9uXCIgey4uLmNyZWF0ZUZsb3dQcm9wcyhpdGVtLnRvLCBpdGVtLm9uQ2xpY2ssIG5hdmlnYXRlKX0+XG4gICAgICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKSA6IDxzcGFuIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItY3VycmVudFwiPntpdGVtLmxhYmVsfTwvc3Bhbj59XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICApKX1cbiAgICA8L25hdj5cbiAgKVxufVxuXG4vKiogXHU3OUZCXHU1MkE4XHU3QUVGXHU2NTc0XHU1QzRGXHU1OEYzXHVGRjFBXHU1MTg1XHU1QkI5XHU1MzNBXHU1M0VGXHU2RURBXHVGRjBDVGFiQmFyIFx1OEQzNFx1NUU5NVx1MzAwMnRhYnMgLyBhY3RpdmVJZCBcdTRFMEUgVGFiQmFyIFx1NzZGOFx1NTQwQ1x1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1vYmlsZVNoZWxsKHsgY2hpbGRyZW4sIHRhYnMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1vYmlsZS1zaGVsbCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPG1haW4gY2xhc3NOYW1lPVwid2YtbW9iaWxlLXNoZWxsLWJvZHlcIj57Y2hpbGRyZW59PC9tYWluPlxuICAgICAge3RhYnMubGVuZ3RoID4gMCA/IDxUYWJCYXIgaXRlbXM9e3RhYnN9IGFjdGl2ZUlkPXthY3RpdmVJZH0gLz4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIENlbGwoeyB0bywgb25DbGljaywgdGl0bGUsIHN1YnRpdGxlLCB2YWx1ZSwgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgd2YtY2VsbCAke3RvID8gJ3dmLWludGVyYWN0aXZlJyA6ICcnfSAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIHJvbGU9e3RvID8gJ2xpbmsnIDogcmVzdC5yb2xlfVxuICAgICAgdGFiSW5kZXg9e3RvICYmIHJlc3QudGFiSW5kZXggPT09IHVuZGVmaW5lZCA/IDAgOiByZXN0LnRhYkluZGV4fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNlbGwtbWFpblwiPlxuICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLWNlbGwtdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+XG4gICAgICAgIHtzdWJ0aXRsZSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtc3VidGl0bGVcIj57c3VidGl0bGV9PC9zcGFuPiA6IG51bGx9XG4gICAgICAgIHtjaGlsZHJlbn1cbiAgICAgIDwvZGl2PlxuICAgICAge3ZhbHVlICE9PSB1bmRlZmluZWQgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jZWxsLXZhbHVlXCI+e3ZhbHVlfTwvc3Bhbj4gOiBudWxsfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBEYXRhVGFibGUoeyBjb2x1bW5zID0gW10sIHJvd3MgPSBbXSwgZ2V0Um93S2V5LCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJsZS13cmFwICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8dGFibGUgY2xhc3NOYW1lPVwid2YtdGFibGVcIj5cbiAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRcIj5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGVyLXJvd1wiPlxuICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cIndmLXRhYmxlLWhlYWRpbmdcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT57Y29sdW1uLmxhYmVsfTwvdGg+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3RyPlxuICAgICAgICA8L3RoZWFkPlxuICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwid2YtdGFibGUtYm9keVwiPlxuICAgICAgICAgIHtyb3dzLm1hcCgocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93S2V5ID0gZ2V0Um93S2V5ID8gZ2V0Um93S2V5KHJvdykgOiByb3cuaWQgfHwgaW5kZXhcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1yb3dcIiBkYXRhLXdmLWtleT17cm93S2V5fSBrZXk9e3Jvd0tleX0+XG4gICAgICAgICAgICAgICAge2NvbHVtbnMubWFwKChjb2x1bW4pID0+IChcbiAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJ3Zi10YWJsZS1jZWxsXCIgZGF0YS13Zi1rZXk9e2NvbHVtbi5rZXl9IGtleT17Y29sdW1uLmtleX0+XG4gICAgICAgICAgICAgICAgICAgIHtjb2x1bW4ucmVuZGVyID8gY29sdW1uLnJlbmRlcihyb3dbY29sdW1uLmtleV0sIHJvdykgOiByb3dbY29sdW1uLmtleV19XG4gICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L3Rib2R5PlxuICAgICAgPC90YWJsZT5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFicyh7IGl0ZW1zID0gW10sIGFjdGl2ZUlkLCBvbkNoYW5nZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtdGFicyAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInRhYmxpc3RcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10YWItY29udHJvbFwiXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgcm9sZT1cInRhYlwiXG4gICAgICAgICAgYXJpYS1zZWxlY3RlZD17aXRlbS5pZCA9PT0gYWN0aXZlSWR9XG4gICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uQ2hhbmdlPy4oaXRlbS5pZCl9XG4gICAgICAgID5cbiAgICAgICAgICB7aXRlbS5sYWJlbH1cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gU3RlcHMoe1xuICBpdGVtcyA9IFtdLFxuICBjdXJyZW50ID0gMCxcbiAgZGlyZWN0aW9uID0gJ2hvcml6b250YWwnLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgLi4ucmVzdFxufSkge1xuICBjb25zdCB2ZXJ0aWNhbCA9IGRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJ1xuICByZXR1cm4gKFxuICAgIDxvbFxuICAgICAgY2xhc3NOYW1lPXtgd2Ytc3RlcHMgJHt2ZXJ0aWNhbCA/ICd3Zi1zdGVwcy12ZXJ0aWNhbCcgOiAnd2Ytc3RlcHMtaG9yaXpvbnRhbCd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgPlxuICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdHVzID0gaW5kZXggPCBjdXJyZW50ID8gJ2RvbmUnIDogaW5kZXggPT09IGN1cnJlbnQgPyAnY3VycmVudCcgOiAndG9kbydcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgY2xhc3NOYW1lPXtgd2Ytc3RlcHMtaXRlbSB3Zi1zdGVwcy1pdGVtLSR7c3RhdHVzfWB9IGtleT17aXRlbS5pZCB8fCBpdGVtLmxhYmVsIHx8IGluZGV4fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtaW5kaWNhdG9yXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXAtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICAgIHtzdGF0dXMgPT09ICdkb25lJyA/IG51bGwgOiBpbmRleCArIDF9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAge2luZGV4IDwgaXRlbXMubGVuZ3RoIC0gMSA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxpbmVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2Ytc3RlcHMtY29udGVudFwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAge2l0ZW0uZGVzY3JpcHRpb24gPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1kZXNjXCI+e2l0ZW0uZGVzY3JpcHRpb259PC9zcGFuPiA6IG51bGx9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICApXG4gICAgICB9KX1cbiAgICA8L29sPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbXB0eVN0YXRlKHsgdGl0bGUsIGRlc2NyaXB0aW9uLCBhY3Rpb24sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLWVtcHR5LXN0YXRlICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1pY29uXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIHt0aXRsZSA/IDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtZW1wdHktdGl0bGVcIj57dGl0bGV9PC9zdHJvbmc+IDogbnVsbH1cbiAgICAgIHtkZXNjcmlwdGlvbiA/IDxwIGNsYXNzTmFtZT1cIndmLWVtcHR5LWRlc2NcIj57ZGVzY3JpcHRpb259PC9wPiA6IG51bGx9XG4gICAgICB7YWN0aW9uID8gPGRpdiBjbGFzc05hbWU9XCJ3Zi1lbXB0eS1hY3Rpb25cIj57YWN0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuL2Zvcm1zLmpzeCdcblxuZnVuY3Rpb24gU2NyZWVuUG9ydGFsKHsgY2hpbGRyZW4gfSkge1xuICBjb25zdCBhbmNob3IgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgW2hvc3QsIHNldEhvc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIHNldEhvc3QoYW5jaG9yLmN1cnJlbnQ/LmNsb3Nlc3QoJy53Zi1zY3JlZW4tY29udGVudCcpIHx8IG51bGwpXG4gIH0sIFtdKVxuXG4gIGlmICghaG9zdCkgcmV0dXJuIDxzcGFuIHJlZj17YW5jaG9yfSBjbGFzc05hbWU9XCJ3Zi1vdmVybGF5LWFuY2hvclwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gIHJldHVybiBSZWFjdERPTS5jcmVhdGVQb3J0YWwoY2hpbGRyZW4sIGhvc3QpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb2RhbCh7IG9wZW4sIHRpdGxlLCBjaGlsZHJlbiwgYWN0aW9ucywgb25DbG9zZSwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi1tb2RhbC1vdmVybGF5ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwicHJlc2VudGF0aW9uXCIgey4uLnJlc3R9PlxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1tb2RhbFwiIHJvbGU9XCJkaWFsb2dcIiBhcmlhLW1vZGFsPVwidHJ1ZVwiIGFyaWEtbGFiZWw9e3RpdGxlfT5cbiAgICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLW1vZGFsLWhlYWRlclwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1tb2RhbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAgICAgIHtvbkNsb3NlID8gPEJ1dHRvbiBvbkNsaWNrPXtvbkNsb3NlfT5cdTUxNzNcdTk1RUQ8L0J1dHRvbj4gOiBudWxsfVxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kYWwtYm9keVwiPntjaGlsZHJlbn08L2Rpdj5cbiAgICAgICAgICB7YWN0aW9ucyA/IDxmb290ZXIgY2xhc3NOYW1lPVwid2YtbW9kYWwtZm9vdGVyXCI+e2FjdGlvbnN9PC9mb290ZXI+IDogbnVsbH1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbmZpcm1EaWFsb2coe1xuICBvcGVuLFxuICB0aXRsZSA9ICdcdTc4NkVcdThCQTRcdTY0Q0RcdTRGNUMnLFxuICBtZXNzYWdlLFxuICBjb25maXJtTGFiZWwgPSAnXHU3ODZFXHU4QkE0JyxcbiAgY2FuY2VsTGFiZWwgPSAnXHU1M0Q2XHU2RDg4JyxcbiAgb25Db25maXJtLFxuICBvbkNhbmNlbCxcbiAgY2xhc3NOYW1lID0gJycsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8TW9kYWxcbiAgICAgIG9wZW49e29wZW59XG4gICAgICB0aXRsZT17dGl0bGV9XG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgIG9uQ2xvc2U9e29uQ2FuY2VsfVxuICAgICAgey4uLnJlc3R9XG4gICAgICBhY3Rpb25zPXsoXG4gICAgICAgIDw+XG4gICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtvbkNhbmNlbH0+e2NhbmNlbExhYmVsfTwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXtvbkNvbmZpcm19Pntjb25maXJtTGFiZWx9PC9CdXR0b24+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1jb25maXJtLW1lc3NhZ2VcIj57bWVzc2FnZX08L3A+XG4gICAgPC9Nb2RhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9hc3QoeyBvcGVuLCBjaGlsZHJlbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi10b2FzdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gcm9sZT1cInN0YXR1c1wiIHsuLi5yZXN0fT57Y2hpbGRyZW59PC9kaXY+XG4gICAgPC9TY3JlZW5Qb3J0YWw+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIExvYWRpbmdPdmVybGF5KHsgb3BlbiwgbGFiZWwgPSAnXHU1MkEwXHU4RjdEXHU0RTJEJywgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICBpZiAoIW9wZW4pIHJldHVybiBudWxsXG4gIHJldHVybiAoXG4gICAgPFNjcmVlblBvcnRhbD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtgd2Ytb3ZlcmxheSB3Zi1sb2FkaW5nICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwic3RhdHVzXCIgey4uLnJlc3R9PlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1sb2FkaW5nLXNoYXBlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbG9hZGluZy1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBXaXJlTWFwKHsgY2xhc3NOYW1lID0gJycsIHN0eWxlLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHN0eWxlPXt7IHBvc2l0aW9uOiAncmVsYXRpdmUnLCAuLi5zdHlsZSB9fSB7Li4ucmVzdH0+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1tYXAtbGluZSB3Zi1tYXAtbGluZS1hXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1saW5lIHdmLW1hcC1saW5lLWJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNYXBNYXJrZXIoeyB4LCB5LCBsYWJlbCwgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBzdHlsZSwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtbWFwLW1hcmtlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgbGVmdDogYCR7eH0lYCwgdG9wOiBgJHt5fSVgLCAuLi5zdHlsZSB9fVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1tYXAtbWFya2VyLXNoYXBlXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTWFwT3ZlcmxheSh7IHBvc2l0aW9uID0gJ2JvdHRvbScsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1tYXAtb3ZlcmxheSB3Zi1tYXAtb3ZlcmxheS0ke3Bvc2l0aW9ufSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHsgTW9iaWxlU2hlbGwgfSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyB1c2VTY3JlZW5JZCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL1NjcmVlbklkZW50aXR5LmpzeCdcblxuY29uc3QgdGFicyA9IFtcbiAgeyBsYWJlbDogJ1x1NTNEMVx1NzNCMCcsIHRvOiAnZGlzY292ZXInIH0sXG4gIHsgbGFiZWw6ICdcdTg4NENcdTdBMEInLCB0bzogJ3RyaXBzJyB9LFxuICB7IGxhYmVsOiAnXHU2MjExXHU3Njg0JywgdG86ICdwcm9maWxlJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlTGF5b3V0KHsgY2hpbGRyZW4gfSkge1xuICBjb25zdCBzY3JlZW5JZCA9IHVzZVNjcmVlbklkKClcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlU2hlbGwgY2xhc3NOYW1lPVwid2Vla2VuZC1zaGVsbCB3ZWVrZW5kLWxheW91dFwiIHRhYnM9e3RhYnN9IGFjdGl2ZUlkPXtzY3JlZW5JZH0gYXJpYS1sYWJlbD1cIlx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVx1NjVDNVx1ODg0Q1x1NTJBOVx1NjI0QlwiPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvTW9iaWxlU2hlbGw+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBBdmF0YXIsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBEYXRhVGFibGUsXG4gIEZvcm1GaWVsZCxcbiAgTW9kYWwsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IENPU1RTID0gW1xuICB7IGlkOiAnY29zdC10cmFuc2l0JywgaXRlbTogJ1x1NUUwMlx1NTE4NVx1NEVBNFx1OTAxQScsIG93bmVyOiAnXHU1MTcxXHU1NDBDJywgYW1vdW50OiAnNDgnIH0sXG4gIHsgaWQ6ICdjb3N0LXRpY2tldCcsIGl0ZW06ICdcdTVDNTVcdTUzODVcdTk1RThcdTc5NjgnLCBvd25lcjogJ1x1Njc5N1x1NjY1M1x1OTFDRScsIGFtb3VudDogJzgwJyB9LFxuICB7IGlkOiAnY29zdC1sdW5jaCcsIGl0ZW06ICdcdTUzNDhcdTk5MTAnLCBvd25lcjogJ1x1NTE3MVx1NTQwQycsIGFtb3VudDogJzE4MCcgfSxcbiAgeyBpZDogJ2Nvc3QtbWFya2V0JywgaXRlbTogJ1x1NUUwMlx1OTZDNlx1OTg4NFx1NzU1OScsIG93bmVyOiAnXHU0RTJBXHU0RUJBJywgYW1vdW50OiAnMTIwJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gQnVkZ2V0U2NyZWVuKCkge1xuICBjb25zdCBbaW52aXRlT3Blbiwgc2V0SW52aXRlT3Blbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cImJ1ZGdldC1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGJ1ZGdldF9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cImJ1ZGdldC1oZWFkZXJcIiB0aXRsZUlkPVwiYnVkZ2V0LXRpdGxlXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19oZWFkZXJcIiB0aXRsZT1cIlx1OTg4NFx1N0I5N1x1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQVwiIHN1YnRpdGxlPVwiXHU0RTNBXHU4ODRDXHU3QTBCXHU5ODg0XHU3NTU5XHU4RDM5XHU3NTI4XHU1RTc2XHU5MDgwXHU4QkY3XHU0RjE5XHU0RjM0XCIgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJidWRnZXRfX2JhY2tcIiB0bz1cInRyaXAtY29uZmlybVwiPlx1OEZENFx1NTZERTwvQnV0dG9uPn0gLz5cbiAgICAgICAgPENhcmQgaWQ9XCJidWRnZXQtc3VtbWFyeVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5LWxhYmVsXCI+XHU5ODg0XHU4QkExXHU2MDNCXHU4RDM5XHU3NTI4PC9UZXh0PlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktdmFsdWVcIj40MjggXHU1MTQzPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktbm90ZVwiPlx1NjMwOSAzIFx1NEY0RFx1NTQwQ1x1ODg0Q1x1NEVCQVx1OEJBMVx1N0I5N1x1RkYwQ1x1NEVCQVx1NTc0N1x1N0VBNiAxNDMgXHU1MTQzPC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxEYXRhVGFibGUgaWQ9XCJidWRnZXQtdGFibGVcIiBjbGFzc05hbWU9XCJidWRnZXRfX3RhYmxlXCIgY29sdW1ucz17W3sga2V5OiAnaXRlbScsIGxhYmVsOiAnXHU5ODc5XHU3NkVFJyB9LCB7IGtleTogJ293bmVyJywgbGFiZWw6ICdcdTYyN0ZcdTYyQzUnIH0sIHsga2V5OiAnYW1vdW50JywgbGFiZWw6ICdcdTkxRDFcdTk4OUQnIH1dfSByb3dzPXtDT1NUU30gZ2V0Um93S2V5PXsocm93KSA9PiByb3cuaWR9IC8+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJidWRnZXQtbWVtYmVyc1wiIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyc1wiIGdhcD17MTJ9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJzLWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlcnMtbGFiZWxcIj5cdTU0MENcdTg4NENcdTRFQkE8L1RleHQ+XG4gICAgICAgICAgICA8QnV0dG9uIGlkPVwiYnVkZ2V0LWludml0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1hY3Rpb25cIiBvbkNsaWNrPXsoKSA9PiBzZXRJbnZpdGVPcGVuKHRydWUpfT5cdTkwODBcdThCRjc8L0J1dHRvbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLXN0YWNrXCIgZ2FwPXsxNH0+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyXCIgZGF0YS13Zi1rZXk9XCJtZW1iZXItbGluXCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1Njc5N1x1NjY1M1x1OTFDRVwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1Njc5N1x1NjY1M1x1OTFDRTwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci1jaGVuXCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1OTY0OFx1Njk4NlwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1OTY0OFx1Njk4NjwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci16aG91XCIgZ2FwPXs1fSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+PEF2YXRhciBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1hdmF0YXJcIiBsYWJlbD1cIlx1NTQ2OFx1NUNCOFwiIC8+PFRleHQgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItbmFtZVwiPlx1NTQ2OFx1NUNCODwvVGV4dD48L0NvbHVtbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJidWRnZXQtZG9uZVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fZG9uZVwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJ0cmlwLWNvbmZpcm1cIj5cdTRGRERcdTVCNThcdTk4ODRcdTdCOTc8L0J1dHRvbj5cbiAgICAgICAgPE1vZGFsXG4gICAgICAgICAgaWQ9XCJidWRnZXQtaW52aXRlLW1vZGFsXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1tb2RhbFwiXG4gICAgICAgICAgb3Blbj17aW52aXRlT3Blbn1cbiAgICAgICAgICB0aXRsZT1cIlx1OTA4MFx1OEJGN1x1NTQwQ1x1ODg0Q1x1NEVCQVwiXG4gICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0SW52aXRlT3BlbihmYWxzZSl9XG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9eygpID0+IHNldEludml0ZU9wZW4oZmFsc2UpfT5cdTUzRDFcdTkwMDFcdTkwODBcdThCRjc8L0J1dHRvbj59XG4gICAgICAgID5cbiAgICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWZpZWxkXCIgbGFiZWw9XCJcdTYyNEJcdTY3M0FcdTUzRjdcdTYyMTZcdTc1MjhcdTYyMzdcdTU0MERcIiBodG1sRm9yPVwiYnVkZ2V0LWludml0ZS1pbnB1dFwiPlxuICAgICAgICAgICAgPFRleHRJbnB1dCBpZD1cImJ1ZGdldC1pbnZpdGUtaW5wdXRcIiBjbGFzc05hbWU9XCJidWRnZXRfX2ludml0ZS1pbnB1dFwiIHBsYWNlaG9sZGVyPVwiXHU4RjkzXHU1MTY1XHU1NDBDXHU4ODRDXHU0RUJBXHU0RkUxXHU2MDZGXCIgLz5cbiAgICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPC9Nb2RhbD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBHcmlkLFxuICBIZWFkaW5nLFxuICBJbWFnZVBsYWNlaG9sZGVyLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgUk9VVEVTID0gW1xuICB7IGlkOiAncm91dGUtY2FuYWwnLCB0aXRsZTogJ1x1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOScsIG1ldGE6ICdcdTZCNjVcdTg4NEMgOC42IGttIFx1MDBCNyA2IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTY1RTdcdTRFRDNcdTVFOTNcdTMwMDFcdTY4NjVcdTRFMEJcdTVFMDJcdTk2QzZcdTRFMEVcdTUwOERcdTY2NUFcdTZDQjNcdTVDQjgnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1oaWxscycsIHRpdGxlOiAnXHU1N0NFXHU1MzE3XHU4RjdCXHU1RjkyXHU2QjY1JywgbWV0YTogJ1x1NUY5Mlx1NkI2NSAxMSBrbSBcdTAwQjcgNyBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU2Nzk3XHU5NUY0XHU3RjEzXHU1NzYxXHUzMDAxXHU4OUMyXHU2NjZGXHU1M0YwXHU0RTBFXHU1QzcxXHU4MTFBXHU1QzBGXHU5OTg2JyB9LFxuICB7IGlkOiAncm91dGUtbGFuZXMnLCB0aXRsZTogJ1x1ODAwMVx1ODg1N1x1NjE2Mlx1NkUzOCcsIG1ldGE6ICdcdTZCNjVcdTg4NEMgNS4yIGttIFx1MDBCNyA0IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTVERjdcdTUzRTNcdTY1RTlcdTk5MTBcdTMwMDFcdTY1RTdcdTRFNjZcdTVFOTdcdTRFMEVcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RUQnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1sYWtlJywgdGl0bGU6ICdcdTczQUZcdTZFNTZcdTlBOTFcdTg4NENcdTUzNEFcdTY1RTUnLCBtZXRhOiAnXHU5QTkxXHU4ODRDIDE4IGttIFx1MDBCNyA1IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTZFN0ZcdTU3MzBcdTY4MDhcdTkwNTNcdTMwMDFcdTU4MjRcdTVDQjhcdTRFMEVcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1tdXNldW0nLCB0aXRsZTogJ1x1OTZFOFx1NTkyOVx1NTM1QVx1NzI2OVx1OTk4Nlx1N0VCRicsIG1ldGE6ICdcdTUxNkNcdTRFQTQgNCBcdTdBRDkgXHUwMEI3IDYgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NEUwOVx1NEUyQVx1NUM1NVx1OTk4Nlx1NEUwRVx1NEUwMFx1OTVGNFx1NUI4OVx1OTc1OVx1NTQ5Nlx1NTU2MVx1OTk4NicgfSxcbiAgeyBpZDogJ3JvdXRlLW5pZ2h0JywgdGl0bGU6ICdcdTU5MUNcdTgyNzJcdTVFRkFcdTdCNTFcdTY1NjNcdTZCNjUnLCBtZXRhOiAnXHU2QjY1XHU4ODRDIDYuNCBrbSBcdTAwQjcgMyBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU1RTdGXHU1NzNBXHUzMDAxXHU1MjY3XHU5NjYyXHU0RTBFXHU2QzVGXHU4RkI5XHU3MDZGXHU1MTQ5XHU1RTI2JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gRGlzY292ZXJTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJkaXNjb3Zlci1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGRpc2NvdmVyX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJkaXNjb3Zlci1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJkaXNjb3Zlci10aXRsZVwiXG4gICAgICAgICAgc3VidGl0bGVJZD1cImRpc2NvdmVyLXN1YnRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJkaXNjb3Zlcl9faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1OEZEOVx1NEUyQVx1NTQ2OFx1NjcyQlx1RkYwQ1x1NTNCQlx1NTRFQVx1OEQ3MFx1OEQ3MFwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdTRFM0FcdTRGNjBcdTYzMTFcdTRFODZcdTUxRTBcdTY3NjFcdTRFMERcdTc1MjhcdThENzZcdTY1RjZcdTk1RjRcdTc2ODRcdTU3Q0VcdTVFMDJcdThERUZcdTdFQkZcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gaWQ9XCJkaXNjb3Zlci1tYXAtYWN0aW9uXCIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX21hcC1hY3Rpb25cIiB0bz1cImV4cGxvcmUtbWFwXCI+XHU1NzMwXHU1NkZFPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8Q2FyZCBpZD1cImRpc2NvdmVyLWZlYXR1cmVkXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkIGRpc2NvdmVyX19mZWF0dXJlZFwiIHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgPEltYWdlUGxhY2Vob2xkZXIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWltYWdlXCIgaGVpZ2h0PXsxNzZ9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZF9fYm9keSBkaXNjb3Zlcl9fZmVhdHVyZWQtYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IGRpc2NvdmVyX19mZWF0dXJlZC1iYWRnZXNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlXCI+XHU2NzJDXHU1NDY4XHU2M0E4XHU4MzUwPC9CYWRnZT5cbiAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1iYWRnZVwiPlx1OTAwMlx1NTQwOFx1NTIxRFx1NkIyMVx1NTIzMFx1OEJCRjwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC10aXRsZVwiIGxldmVsPXsyfT5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5Mjk8L0hlYWRpbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtY29weVwiPlx1NEVDRVx1NjVFN1x1NEVEM1x1NUU5M1x1NTFGQVx1NTNEMVx1RkYwQ1x1NkNCRlx1NkMzNFx1NUNCOFx1OEQ3MFx1NTIzMFx1Njg2NVx1NEUwQlx1NUUwMlx1OTZDNlx1RkYwQ1x1NTcyOFx1NjVFNVx1ODQzRFx1NTI0RFx1NjJCNVx1OEZCRVx1NkNCM1x1NkU3RVx1NUU3M1x1NTNGMFx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwid2Vla2VuZC1jYXJkLW1ldGEgZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGFcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPjguNiBrbTwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPlx1N0VBNiA2IFx1NUMwRlx1NjVGNjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLW1ldGEtaXRlbVwiPlx1OEY3Qlx1Njc3RTwvVGV4dD5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwiZGlzY292ZXItcm91dGVzLXRpdGxlXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1zZWN0aW9uLWhlYWRpbmcgZGlzY292ZXJfX3JvdXRlcy10aXRsZVwiIGxldmVsPXsyfT5cdTY2RjRcdTU5MUFcdThERUZcdTdFQkY8L0hlYWRpbmc+XG4gICAgICAgIDxHcmlkIGlkPVwiZGlzY292ZXItcm91dGVzXCIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlc1wiIGNvbHVtbnM9ezF9IGdhcD17MTR9PlxuICAgICAgICAgIHtST1VURVMubWFwKChyb3V0ZSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZCBkaXNjb3Zlcl9fcm91dGUtY2FyZFwiIGRhdGEtd2Yta2V5PXtyb3V0ZS5pZH0ga2V5PXtyb3V0ZS5pZH0gdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgPEltYWdlUGxhY2Vob2xkZXIgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLWltYWdlXCIgaGVpZ2h0PXtpbmRleCAlIDIgPT09IDAgPyAxMTYgOiAxMzZ9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmRfX2JvZHkgZGlzY292ZXJfX3JvdXRlLWJvZHlcIiBnYXA9ezd9PlxuICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS10aXRsZVwiIGxldmVsPXszfT57cm91dGUudGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS1tZXRhXCI+e3JvdXRlLm1ldGF9PC9UZXh0PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19yb3V0ZS1ub3RlXCI+e3JvdXRlLm5vdGV9PC9UZXh0PlxuICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBXaXJlTWFwIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gU2hhbmdoYWlNYXAoeyBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxXaXJlTWFwIGNsYXNzTmFtZT17YHNoYW5naGFpLW1hcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvV2lyZU1hcD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgTWFwTWFya2VyLFxuICBNYXBPdmVybGF5LFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IFNoYW5naGFpTWFwIH0gZnJvbSAnLi4vY29tcG9uZW50cy9TaGFuZ2hhaU1hcC5qc3gnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmV4cG9ydCBmdW5jdGlvbiBFeHBsb3JlTWFwU2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiZXhwbG9yZS1tYXAtcGFnZVwiIGdhcD17MTZ9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBleHBsb3JlLW1hcF9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiZXhwbG9yZS1tYXAtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiZXhwbG9yZS1tYXAtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU3NkVFXHU3Njg0XHU1NzMwXHU1NzMwXHU1NkZFXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OEY3Qlx1ODlFNlx1NjgwN1x1OEJCMFx1NjdFNVx1NzcwQlx1NjNBOFx1ODM1MFx1OERFRlx1N0VCRlwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fYmFja1wiIHRvPVwiZGlzY292ZXJcIj5cdTUyMTdcdTg4Njg8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxSb3cgaWQ9XCJleHBsb3JlLW1hcC1maWx0ZXJzXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1jaGlwLXJvdyBleHBsb3JlLW1hcF9fZmlsdGVyc1wiIGdhcD17OH0+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTUxNjhcdTkwRTg8L0JhZGdlPlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU2QjY1XHU4ODRDPC9CYWRnZT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1OUE5MVx1ODg0QzwvQmFkZ2U+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTVCQTRcdTUxODU8L0JhZGdlPlxuICAgICAgICA8L1Jvdz5cbiAgICAgICAgPFNoYW5naGFpTWFwIGlkPVwiZXhwbG9yZS1tYXAtY2FudmFzXCIgY2xhc3NOYW1lPVwid2Vla2VuZC1tYXAgZXhwbG9yZS1tYXBfX2NhbnZhc1wiPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLXN1emhvdS1jcmVla1wiIHg9ezUxfSB5PXs0MH0gbGFiZWw9XCJcdTgyQ0ZcdTVEREVcdTZDQjNcdTZFRThcdTZDMzRcdTZGMkJcdTZCNjVcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXItYnVuZFwiIHg9ezYyfSB5PXs0N30gbGFiZWw9XCJcdTU5MTZcdTZFRTlcdTVFRkFcdTdCNTFcdTZGMkJcdTZFMzhcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXIteHVodWlcIiB4PXs0OX0geT17NTV9IGxhYmVsPVwiXHU4ODYxXHU1OTBEXHU5OENFXHU4QzhDXHU5QTkxXHU4ODRDXCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLXB1ZG9uZ1wiIHg9ezc1fSB5PXs0M30gbGFiZWw9XCJcdTk2NDZcdTVCQjZcdTU2MzRcdTU3Q0VcdTVFMDJcdTZGMkJcdTZCNjVcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE92ZXJsYXkgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX292ZXJsYXlcIiBwb3NpdGlvbj1cImJvdHRvbVwiPlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3JvdXRlLXByZXZpZXdcIiB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LWV5ZWJyb3dcIj5cdThERERcdTc5QkJcdTRGNjAgMi40IGttPC9UZXh0PlxuICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctdGl0bGVcIj5cdTgyQ0ZcdTVEREVcdTZDQjNcdTZFRThcdTZDMzRcdTZGMkJcdTZCNjU8L3N0cm9uZz5cbiAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy1tZXRhXCI+OC42IGttIFx1MDBCNyBcdTdFQTYgNiBcdTVDMEZcdTY1RjYgXHUwMEI3IFx1OEY3Qlx1Njc3RTwvVGV4dD5cbiAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICAgPC9NYXBPdmVybGF5PlxuICAgICAgICA8L1NoYW5naGFpTWFwPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgU3RlcHMsXG4gIFRleHQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgRVZFTlRTID0gW1xuICB7IGlkOiAnZXZlbnQtbWVldCcsIHRpbWU6ICcwOToxMCcsIHRpdGxlOiAnXHU1NzMwXHU5NEMxXHU1M0UzXHU5NkM2XHU1NDA4Jywgbm90ZTogJ1x1NEVDRSAzIFx1NTNGN1x1NTNFM1x1NkI2NVx1ODg0Q1x1N0VBNiA4IFx1NTIwNlx1OTQ5Rlx1NTIzMFx1OERFRlx1N0VCRlx1OEQ3N1x1NzBCOVx1MzAwMicsIHRhZzogJ1x1OTZDNlx1NTQwOCcgfSxcbiAgeyBpZDogJ2V2ZW50LXdhcmVob3VzZScsIHRpbWU6ICcwOTozMCcsIHRpdGxlOiAnXHU2NUU3XHU0RUQzXHU1RTkzXHU1QzU1XHU1Mzg1Jywgbm90ZTogJ1x1NzcwQlx1NUUzOFx1OEJCRVx1NUM1NVx1NEUwRVx1NUM0Qlx1OTg3Nlx1N0VEM1x1Njc4NFx1RkYwQ1x1NTE2NVx1NTNFM1x1NTkwNFx1NTNFRlx1NUJDNFx1NUI1OFx1ODBDQ1x1NTMwNVx1MzAwMicsIHRhZzogJ1x1NTNDMlx1ODlDMicgfSxcbiAgeyBpZDogJ2V2ZW50LW1hcmtldCcsIHRpbWU6ICcxMTowMCcsIHRpdGxlOiAnXHU2ODY1XHU0RTBCXHU1NDY4XHU2NzJCXHU1RTAyXHU5NkM2Jywgbm90ZTogJ1x1NTE0OFx1OTAxQlx1NjI0Qlx1NEY1Q1x1NjQ0QVx1NEY0RFx1RkYwQ1x1NTE4RFx1NTcyOFx1NEUxQ1x1NEZBN1x1OTkxMFx1OEY2Nlx1NTMzQVx1N0I4MFx1NTM1NVx1NTM0OFx1OTkxMFx1MzAwMicsIHRhZzogJ1x1NUUwMlx1OTZDNicgfSxcbiAgeyBpZDogJ2V2ZW50LWx1bmNoJywgdGltZTogJzEzOjAwJywgdGl0bGU6ICdcdTZDMzRcdTVDQjhcdTVDMEZcdTk5ODZcdTUzNDhcdTk5MTAnLCBub3RlOiAnXHU5ODg0XHU4QkExXHU3NTI4XHU5OTEwIDcwIFx1NTIwNlx1OTQ5Rlx1RkYwQ1x1OTc2MFx1N0E5N1x1NTMzQVx1NTdERlx1NjVFMFx1OTcwMFx1OTg4NFx1N0VBNlx1MzAwMicsIHRhZzogJ1x1NzUyOFx1OTkxMCcgfSxcbiAgeyBpZDogJ2V2ZW50LWxhbmVzJywgdGltZTogJzE0OjIwJywgdGl0bGU6ICdcdTZDMzRcdTVDQjhcdTVDMEZcdTVERjdcdTY1NjNcdTZCNjUnLCBub3RlOiAnXHU2Q0JGXHU3N0YzXHU5NjM2XHU4RkRCXHU1MTY1XHU2NUU3XHU4ODU3XHU1MzNBXHVGRjBDXHU3RUNGXHU4RkM3XHU0RTY2XHU1RTk3XHU1NDhDXHU1MTZDXHU1MTcxXHU2RDE3XHU4ODYzXHU2MjNGXHUzMDAyJywgdGFnOiAnXHU2QjY1XHU4ODRDJyB9LFxuICB7IGlkOiAnZXZlbnQtZ2FyZGVuJywgdGltZTogJzE1OjIwJywgdGl0bGU6ICdcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RURcdTRGMTFcdTYwNkYnLCBub3RlOiAnXHU4ODY1XHU2QzM0XHU1RTc2XHU2NTc0XHU3NDA2XHU5NjhGXHU4RUFCXHU3MjY5XHU1NEMxXHVGRjBDXHU4MkIxXHU1NkVEXHU1MzE3XHU5NUU4XHU2NzA5XHU1MTZDXHU1MTcxXHU4QkJFXHU2NUJEXHUzMDAyJywgdGFnOiAnXHU0RjExXHU2MDZGJyB9LFxuICB7IGlkOiAnZXZlbnQtc3Vuc2V0JywgdGltZTogJzE3OjEwJywgdGl0bGU6ICdcdTZDQjNcdTZFN0VcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnLCBub3RlOiAnXHU4REVGXHU3RUJGXHU3RUM4XHU3MEI5XHVGRjBDXHU1M0VGXHU3RUU3XHU3RUVEXHU2Q0JGXHU1ODI0XHU1Q0I4XHU2QjY1XHU4ODRDXHU4MUYzXHU2NjVBXHU5OTEwXHU1MzNBXHU1N0RGXHUzMDAyJywgdGFnOiAnXHU4OUMyXHU2NjZGJyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gSXRpbmVyYXJ5U2NyZWVuKCkge1xuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiaXRpbmVyYXJ5LXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgaXRpbmVyYXJ5X19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJpdGluZXJhcnktaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwiaXRpbmVyYXJ5LXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTZCQ0ZcdTY1RTVcdTg4NENcdTdBMEJcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU1NDY4XHU1MTZEIFx1MDBCNyBcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjlcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19iYWNrXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cdThERUZcdTdFQkY8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxTdGVwc1xuICAgICAgICAgIGlkPVwiaXRpbmVyYXJ5LXByb2dyZXNzXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3Byb2dyZXNzXCJcbiAgICAgICAgICBjdXJyZW50PXsxfVxuICAgICAgICAgIGl0ZW1zPXtbeyBpZDogJ21vcm5pbmcnLCBsYWJlbDogJ1x1NEUwQVx1NTM0OCcgfSwgeyBpZDogJ2FmdGVybm9vbicsIGxhYmVsOiAnXHU0RTBCXHU1MzQ4JyB9LCB7IGlkOiAnZXZlbmluZycsIGxhYmVsOiAnXHU1MDhEXHU2NjVBJyB9XX1cbiAgICAgICAgLz5cbiAgICAgICAgPENvbHVtbiBpZD1cIml0aW5lcmFyeS1ldmVudHNcIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50c1wiIGdhcD17MTR9PlxuICAgICAgICAgIHtFVkVOVFMubWFwKChldmVudCkgPT4gKFxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50XCIgZGF0YS13Zi1rZXk9e2V2ZW50LmlkfSBrZXk9e2V2ZW50LmlkfSBnYXA9ezEwfSBhbGlnbkl0ZW1zPVwiZmxleC1zdGFydFwiPlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3RpbWVcIj57ZXZlbnQudGltZX08L1RleHQ+XG4gICAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtY2FyZFwiPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1ib2R5XCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudC1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtdGl0bGVcIiBsZXZlbD17M30+e2V2ZW50LnRpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtYmFkZ2VcIj57ZXZlbnQudGFnfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtbm90ZVwiPntldmVudC5ub3RlfTwvVGV4dD5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q2FyZCBpZD1cIml0aW5lcmFyeS1yZW1pbmRlclwiIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXJcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItdGl0bGVcIj5cdTUxRkFcdTUzRDFcdTYzRDBcdTkxOTI8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fcmVtaW5kZXItY29weVwiPlx1NUVGQVx1OEJBRVx1NjQzQVx1NUUyNlx1OTk2RVx1NzUyOFx1NkMzNFx1MzAwMVx1OEY3Qlx1NEZCRlx1OTZFOFx1NTE3N1x1NTQ4Q1x1NTNFRlx1OTFDRFx1NTkwRFx1NEY3Rlx1NzUyOFx1NzY4NFx1OEQyRFx1NzI2OVx1ODg4Qlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8QnV0dG9uIGlkPVwiaXRpbmVyYXJ5LWNyZWF0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2NyZWF0ZS1hY3Rpb25cIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwidHJpcC1jcmVhdGVcIj5cdTUyMUJcdTVFRkFcdTYyMTFcdTc2ODRcdTcyNDhcdTY3MkM8L0J1dHRvbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDb2x1bW4sXG4gIEZvcm1GaWVsZCxcbiAgSGVhZGluZyxcbiAgVGV4dCxcbiAgVGV4dElucHV0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBMb2dpblNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8Q29sdW1uIGlkPVwibG9naW4tcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cIndlZWtlbmQtbG9naW4gbG9naW5fX3BhZ2VcIj5cbiAgICAgIDxzcGFuIGlkPVwibG9naW4tbG9nb1wiIGNsYXNzTmFtZT1cIndlZWtlbmQtbG9nby1wbGFjZWhvbGRlciBsb2dpbl9fbG9nb1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cImxvZ2luX19pbnRyb1wiIGdhcD17OH0+XG4gICAgICAgIDxIZWFkaW5nIGlkPVwibG9naW4tdGl0bGVcIiBjbGFzc05hbWU9XCJsb2dpbl9fdGl0bGVcIiBsZXZlbD17MX0+XHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxPC9IZWFkaW5nPlxuICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJsb2dpbl9fZGVzY3JpcHRpb25cIj5cdTYyOEFcdTYwRjNcdTUzQkJcdTc2ODRcdTU3MzBcdTY1QjlcdUZGMENcdTUzRDhcdTYyMTBcdTRFMDBcdTRFRkRcdTk2OEZcdTY1RjZcdTgwRkRcdThENzBcdTc2ODRcdTg4NENcdTdBMEJcdTMwMDI8L1RleHQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwibG9naW5fX3Bob25lLWZpZWxkXCIgbGFiZWw9XCJcdTYyNEJcdTY3M0FcdTUzRjdcIiBodG1sRm9yPVwibG9naW4tcGhvbmVcIj5cbiAgICAgICAgPFRleHRJbnB1dCBpZD1cImxvZ2luLXBob25lXCIgY2xhc3NOYW1lPVwibG9naW5fX3Bob25lLWlucHV0XCIgaW5wdXRNb2RlPVwidGVsXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTYyNEJcdTY3M0FcdTUzRjdcIiAvPlxuICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImxvZ2luX19jb2RlLWZpZWxkXCIgbGFiZWw9XCJcdTlBOENcdThCQzFcdTc4MDFcIiBodG1sRm9yPVwibG9naW4tY29kZVwiIGhpbnQ9XCJcdTZGMTRcdTc5M0FcdTczQUZcdTU4ODNcdTUzRUZcdThGOTNcdTUxNjVcdTRFRkJcdTYxMEYgNiBcdTRGNERcdTY1NzBcdTVCNTdcIj5cbiAgICAgICAgPFRleHRJbnB1dCBpZD1cImxvZ2luLWNvZGVcIiBjbGFzc05hbWU9XCJsb2dpbl9fY29kZS1pbnB1dFwiIGlucHV0TW9kZT1cIm51bWVyaWNcIiBwbGFjZWhvbGRlcj1cIlx1OEJGN1x1OEY5M1x1NTE2NVx1OUE4Q1x1OEJDMVx1NzgwMVwiIC8+XG4gICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgIDxCdXR0b24gaWQ9XCJsb2dpbi1zdWJtaXRcIiBjbGFzc05hbWU9XCJsb2dpbl9fc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cImRpc2NvdmVyXCI+XHU1RjAwXHU1OUNCXHU2M0EyXHU3RDIyPC9CdXR0b24+XG4gICAgICA8VGV4dCBjbGFzc05hbWU9XCJsb2dpbl9fYWdyZWVtZW50XCIgYXM9XCJzbWFsbFwiPlx1N0VFN1x1N0VFRFx1NTM3M1x1ODg2OFx1NzkzQVx1NTQwQ1x1NjEwRlx1NjcwRFx1NTJBMVx1Njc2MVx1NkIzRVx1NEUwRVx1OTY5MFx1NzlDMVx1OEJGNFx1NjYwRVx1MzAwMjwvVGV4dD5cbiAgICA8L0NvbHVtbj5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEF2YXRhcixcbiAgQ2VsbCxcbiAgQ29sdW1uLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG4gIFRvZ2dsZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvZmlsZVNjcmVlbigpIHtcbiAgY29uc3QgW25vdGlmaWNhdGlvbnMsIHNldE5vdGlmaWNhdGlvbnNdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgY29uc3QgW29mZmxpbmVNYXBzLCBzZXRPZmZsaW5lTWFwc10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtcGFnZVwiIGdhcD17MjB9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSBwcm9maWxlX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwicHJvZmlsZS1oZWFkZXJcIiB0aXRsZUlkPVwicHJvZmlsZS10aXRsZVwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX2hlYWRlclwiIHRpdGxlPVwiXHU2MjExXHU3Njg0XCIgc3VidGl0bGU9XCJcdTRFMkFcdTRFQkFcdTUwNEZcdTU5N0RcdTRFMEVcdTY1QzVcdTg4NENcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICA8Um93IGlkPVwicHJvZmlsZS1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VtbWFyeVwiIGdhcD17MTJ9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICA8QXZhdGFyIGNsYXNzTmFtZT1cInByb2ZpbGVfX2F2YXRhclwiIHNpemU9ezU4fSBsYWJlbD1cIlx1NzUyOFx1NjIzN1x1NTkzNFx1NTBDRlx1NTM2MFx1NEY0RFwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9maWxlX19pZGVudGl0eVwiPlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJwcm9maWxlX19uYW1lXCI+XHU2Nzk3XHU2NjUzXHU5MUNFPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19iaW9cIj5cdTVERjJcdThENzBcdThGQzcgMTIgXHU1RUE3XHU1N0NFXHU1RTAyPC9UZXh0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L1Jvdz5cbiAgICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtYWNjb3VudFwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnRcIiBnYXA9ezB9PlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU2NUM1XHU4ODRDXHU2ODYzXHU2ODQ4XCIgc3VidGl0bGU9XCJcdTUwNEZcdTU5N0RcdTMwMDFcdThEQjNcdThGRjlcdTRFMEVcdTY1MzZcdTg1Q0ZcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU1NDBDXHU4ODRDXHU0RUJBXCIgc3VidGl0bGU9XCIzIFx1NEY0RFx1NUUzOFx1NzUyOFx1NTQwQ1x1ODg0Q1x1NEVCQVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fYWNjb3VudC1jZWxsXCIgdGl0bGU9XCJcdTdEMjdcdTYwMjVcdTgwNTRcdTdDRkJcdTRFQkFcIiBzdWJ0aXRsZT1cIlx1NURGMlx1OEJCRVx1N0Y2RVwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1zZXR0aW5nc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmdzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLXJvd1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctbGFiZWxcIj5cdTg4NENcdTdBMEJcdTYzRDBcdTkxOTI8L1RleHQ+XG4gICAgICAgICAgICA8VG9nZ2xlIGlkPVwicHJvZmlsZS1ub3RpZmljYXRpb25zXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fbm90aWZpY2F0aW9uc1wiIGNoZWNrZWQ9e25vdGlmaWNhdGlvbnN9IG9uQ2hhbmdlPXtzZXROb3RpZmljYXRpb25zfSAvPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLWxhYmVsXCI+XHU4MUVBXHU1MkE4XHU0RTBCXHU4RjdEXHU3OUJCXHU3RUJGXHU1NzMwXHU1NkZFPC9UZXh0PlxuICAgICAgICAgICAgPFRvZ2dsZSBpZD1cInByb2ZpbGUtb2ZmbGluZS1tYXBzXCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fb2ZmbGluZS1tYXBzXCIgY2hlY2tlZD17b2ZmbGluZU1hcHN9IG9uQ2hhbmdlPXtzZXRPZmZsaW5lTWFwc30gLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLXN1cHBvcnRcIiBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0XCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0LWNlbGxcIiB0aXRsZT1cIlx1NUUyRVx1NTJBOVx1NEUwRVx1NTNDRFx1OTk4OFwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydC1jZWxsXCIgdGl0bGU9XCJcdTk2OTBcdTc5QzFcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnQtY2VsbFwiIHRpdGxlPVwiXHU1MTczXHU0RThFXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXCIgdmFsdWU9XCIxLjBcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJyZWFkY3J1bWJzLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgR3JpZCxcbiAgSGVhZGluZyxcbiAgSW1hZ2VQbGFjZWhvbGRlcixcbiAgUm93LFxuICBUYWJzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IFNUT1BTID0gW1xuICB7IGlkOiAnc3RvcC13YXJlaG91c2UnLCB0aXRsZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1NUM1NVx1NTM4NScsIHN1YnRpdGxlOiAnMDk6MzAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA2MCBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWJyaWRnZScsIHRpdGxlOiAnXHU2ODY1XHU0RTBCXHU1NDY4XHU2NzJCXHU1RTAyXHU5NkM2Jywgc3VidGl0bGU6ICcxMTowMCBcdTAwQjcgXHU1RUZBXHU4QkFFXHU1MDVDXHU3NTU5IDkwIFx1NTIwNlx1OTQ5RicgfSxcbiAgeyBpZDogJ3N0b3AtbGFuZScsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU1REY3Jywgc3VidGl0bGU6ICcxMzozMCBcdTAwQjcgXHU1MzQ4XHU5OTEwXHU0RTBFXHU4ODU3XHU1MzNBXHU2NTYzXHU2QjY1JyB9LFxuICB7IGlkOiAnc3RvcC1nYXJkZW4nLCB0aXRsZTogJ1x1NzkzRVx1NTMzQVx1ODJCMVx1NTZFRCcsIHN1YnRpdGxlOiAnMTU6MjAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA0NSBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWJlbmQnLCB0aXRsZTogJ1x1NkNCM1x1NkU3RVx1NjVFNVx1ODQzRFx1NUU3M1x1NTNGMCcsIHN1YnRpdGxlOiAnMTc6MTAgXHUwMEI3IFx1OERFRlx1N0VCRlx1N0VDOFx1NzBCOScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFJvdXRlRGV0YWlsU2NyZWVuKCkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gUmVhY3QudXNlU3RhdGUoJ292ZXJ2aWV3JylcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIHJvdXRlLWRldGFpbF9fcGFnZVwiPlxuICAgICAgICA8QnJlYWRjcnVtYnMgaWQ9XCJyb3V0ZS1kZXRhaWwtYnJlYWRjcnVtYnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JyZWFkY3J1bWJzXCIgaXRlbXM9e1t7IGxhYmVsOiAnXHU1M0QxXHU3M0IwJywgdG86ICdkaXNjb3ZlcicgfSwgeyBsYWJlbDogJ1x1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOScgfV19IC8+XG4gICAgICAgIDxJbWFnZVBsYWNlaG9sZGVyIGlkPVwicm91dGUtZGV0YWlsLWhlcm9cIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2hlcm9cIiBoZWlnaHQ9ezIyNH0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLXN1bW1hcnlcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3N1bW1hcnlcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndlZWtlbmQtY2hpcC1yb3cgcm91dGUtZGV0YWlsX19iYWRnZXNcIiBnYXA9ezh9PlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdTU3Q0VcdTVFMDJcdTZGMkJcdTZCNjU8L0JhZGdlPlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdThGN0JcdTY3N0U8L0JhZGdlPlxuICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYmFkZ2VcIj5cdTUzRUZcdTVFMjZcdTVCQTBcdTcyNjk8L0JhZGdlPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxIZWFkaW5nIGlkPVwicm91dGUtZGV0YWlsLXRpdGxlXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX190aXRsZVwiIGxldmVsPXsxfT5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5Mjk8L0hlYWRpbmc+XG4gICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19pbnRyb1wiPlx1NEUwMFx1Njc2MVx1NEVDRVx1NURFNVx1NEUxQVx1OTA1N1x1NUI1OFx1OEQ3MFx1NTQxMVx1NzUxRlx1NkQzQlx1ODg1N1x1NTMzQVx1NzY4NFx1NkMzNFx1NUNCOFx1OERFRlx1N0VCRlx1MzAwMlx1NEUwQVx1NTM0OFx1NzcwQlx1NUM1NVx1RkYwQ1x1NEUyRFx1NTM0OFx1OTAxQlx1NUUwMlx1OTZDNlx1RkYwQ1x1NTA4RFx1NjY1QVx1NTcyOFx1NkNCM1x1NkU3RVx1N0I0OVx1NjVFNVx1ODQzRFx1MzAwMjwvVGV4dD5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxHcmlkIGlkPVwicm91dGUtZGV0YWlsLWZhY3RzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0c1wiIGNvbHVtbnM9ezN9IGdhcD17OH0+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+OC42IGttPC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC1sYWJlbFwiPlx1NjAzQlx1OERFRlx1N0EwQjwvc3Bhbj48L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+NiBcdTVDMEZcdTY1RjY8L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LWxhYmVsXCI+XHU1RUZBXHU4QkFFXHU2NUY2XHU5NTdGPC9zcGFuPjwvQ2FyZD5cbiAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3RcIj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtdmFsdWVcIj41IFx1N0FEOTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtbGFiZWxcIj5cdThERUZcdTdFQkZcdTgyODJcdTcwQjk8L3NwYW4+PC9DYXJkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDxUYWJzIGlkPVwicm91dGUtZGV0YWlsLXRhYnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3RhYnNcIiBhY3RpdmVJZD17dGFifSBvbkNoYW5nZT17c2V0VGFifSBpdGVtcz17W3sgaWQ6ICdvdmVydmlldycsIGxhYmVsOiAnXHU4REVGXHU3RUJGXHU2OTgyXHU4OUM4JyB9LCB7IGlkOiAnbm90ZXMnLCBsYWJlbDogJ1x1NTFGQVx1NTNEMVx1OTg3Qlx1NzdFNScgfV19IC8+XG4gICAgICAgIHt0YWIgPT09ICdvdmVydmlldycgPyAoXG4gICAgICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1zdG9wc1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fc3RvcHNcIiBnYXA9ezB9PlxuICAgICAgICAgICAge1NUT1BTLm1hcCgoc3RvcCwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19zdG9wXCIgZGF0YS13Zi1rZXk9e3N0b3AuaWR9IGtleT17c3RvcC5pZH0gdGl0bGU9e2Ake2luZGV4ICsgMX0uICR7c3RvcC50aXRsZX1gfSBzdWJ0aXRsZT17c3RvcC5zdWJ0aXRsZX0gdmFsdWU9e2Ake2luZGV4ICsgMX1gfSAvPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPENhcmQgaWQ9XCJyb3V0ZS1kZXRhaWwtbm90ZXNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVzXCI+XG4gICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZXMtYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVcIj5cdTZDQkZcdTkwMTRcdTU5MjdcdTkwRThcdTUyMDZcdThERUZcdTZCQjVcdTY3MDlcdTY4MTFcdTgzNkJcdUZGMENcdTZDQjNcdTZFN0VcdTUzM0FcdTU3REZcdTRFMEJcdTUzNDhcdTY1RTVcdTcxNjdcdThGODNcdTVGM0FcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZVwiPlx1NjVFN1x1NEVEM1x1NUU5M1x1NTQ2OFx1NEUwMFx1OTVFRFx1OTk4Nlx1RkYwQ1x1NTQ2OFx1NjcyQlx1NUVGQVx1OEJBRVx1NjNEMFx1NTI0RFx1OTg4NFx1N0VBNlx1NTE2NVx1NTczQVx1NjVGNlx1NkJCNVx1MzAwMjwvVGV4dD5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3RlXCI+XHU4REVGXHU3RUJGXHU3RUM4XHU3MEI5XHU4REREXHU3OUJCXHU1NzMwXHU5NEMxXHU3QUQ5XHU3RUE2IDkwMCBcdTdDNzNcdUZGMENcdTRFNUZcdTUzRUZcdTRFNThcdTU3NTBcdTc5M0VcdTUzM0FcdTYzQTVcdTlBNzNcdThGNjZcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICA8L0NhcmQ+XG4gICAgICAgICl9XG4gICAgICAgIDxDYXJkIGlkPVwicm91dGUtZGV0YWlsLWd1aWRlXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZS1ib2R5XCIgZ2FwPXs4fT5cbiAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtdGl0bGVcIiBsZXZlbD17M30+XHU4REVGXHU3RUJGXHU3QjU2XHU1MjEyXHU0RUJBPC9IZWFkaW5nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ndWlkZS1jb3B5XCI+XHU2Nzk3XHU1QzdGIFx1MDBCNyBcdTU3Q0VcdTVFMDJcdTZCNjVcdTg4NENcdThCQjBcdTVGNTVcdTgwMDVcdUZGMENcdTVERjJcdTUzRDFcdTVFMDMgMTggXHU2NzYxXHU2QzM0XHU1Q0I4XHU4REVGXHU3RUJGXHUzMDAyPC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtYWN0aW9uc1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fYWN0aW9uc1wiIGdhcD17MTB9PlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJyb3V0ZS1kZXRhaWwtaXRpbmVyYXJ5LWFjdGlvblwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9faXRpbmVyYXJ5LWFjdGlvblwiIHRvPVwiaXRpbmVyYXJ5XCI+XHU2N0U1XHU3NzBCXHU1QjhDXHU2NTc0XHU2NUU1XHU3QTBCPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBpZD1cInJvdXRlLWRldGFpbC1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19jcmVhdGUtYWN0aW9uXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU3NTI4XHU4RkQ5XHU2NzYxXHU4REVGXHU3RUJGXHU1MjFCXHU1RUZBXHU4ODRDXHU3QTBCPC9CdXR0b24+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjYuMFxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjYuMFxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIENvbmZpcm1EaWFsb2csXG4gIExvYWRpbmdPdmVybGF5LFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFN0ZXBzLFxuICBUZXh0LFxuICBUb2FzdCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gVHJpcENvbmZpcm1TY3JlZW4oKSB7XG4gIGNvbnN0IFtjb25maXJtT3Blbiwgc2V0Q29uZmlybU9wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbc2F2ZWQsIHNldFNhdmVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IHN1Ym1pdFRyaXAgPSAoKSA9PiB7XG4gICAgc2V0Q29uZmlybU9wZW4oZmFsc2UpXG4gICAgc2V0TG9hZGluZyh0cnVlKVxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgICBzZXRTYXZlZCh0cnVlKVxuICAgIH0sIDcwMClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwLWNvbmZpcm1fX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJ0cmlwLWNvbmZpcm0taGVhZGVyXCIgdGl0bGVJZD1cInRyaXAtY29uZmlybS10aXRsZVwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9faGVhZGVyXCIgdGl0bGU9XCJcdTc4NkVcdThCQTRcdTg4NENcdTdBMEJcIiBzdWJ0aXRsZT1cIlx1NjhDMFx1NjdFNVx1NEZFMVx1NjA2Rlx1NTQwRVx1NEZERFx1NUI1OFx1NTIzMFx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlwiIC8+XG4gICAgICAgIDxTdGVwcyBpZD1cInRyaXAtY29uZmlybS1zdGVwc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3RlcHNcIiBjdXJyZW50PXsyfSBpdGVtcz17W3sgaWQ6ICdiYXNpYycsIGxhYmVsOiAnXHU1N0ZBXHU2NzJDXHU0RkUxXHU2MDZGJyB9LCB7IGlkOiAnYnVkZ2V0JywgbGFiZWw6ICdcdTk4ODRcdTdCOTcnIH0sIHsgaWQ6ICdjb25maXJtJywgbGFiZWw6ICdcdTc4NkVcdThCQTQnIH1dfSAvPlxuICAgICAgICA8Q2FyZCBpZD1cInRyaXAtY29uZmlybS1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5XCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1bW1hcnktYm9keVwiIGdhcD17MTB9PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N1bW1hcnktaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdHJpcC1uYW1lXCI+XHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1PC9zdHJvbmc+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N0YXR1c1wiPlx1NUY4NVx1NEZERFx1NUI1ODwvQmFkZ2U+XG4gICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGF0ZVwiPjIwMjYgXHU1RTc0IDggXHU2NzA4IDE1IFx1NjVFNSBcdTAwQjcgXHU1NDY4XHU1MTZEPC9UZXh0PlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19yb3V0ZVwiPlx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOSBcdTAwQjcgOC42IGttIFx1MDBCNyBcdTdFQTYgNiBcdTVDMEZcdTY1RjY8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY29uZmlybS1kZXRhaWxzXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxzXCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU5NkM2XHU1NDA4XHU1NzMwXHU3MEI5XCIgc3VidGl0bGU9XCJcdThGRDBcdTZDQjNcdThERUZcdTU3MzBcdTk0QzFcdTdBRDkgMyBcdTUzRjdcdTUzRTNcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTg4NENcdTdBMEJcdTgyODJcdTU5NEZcIiB2YWx1ZT1cIlx1OEY3Qlx1Njc3RVwiIC8+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1NTQwQ1x1ODg0Q1x1NEVCQVx1NjU3MFwiIHZhbHVlPVwiMyBcdTRFQkFcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTUxRkFcdTUzRDFcdTYzRDBcdTkxOTJcIiB2YWx1ZT1cIlx1NURGMlx1NUYwMFx1NTQyRlwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q2FyZCBpZD1cInRyaXAtY29uZmlybS1idWRnZXRcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldFwiIHRvPVwiYnVkZ2V0XCI+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1ib2R5XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1jb3B5XCIgZ2FwPXs1fT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtbGFiZWxcIj5cdTk4ODRcdThCQTFcdTYwM0JcdThEMzlcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LW5vdGVcIj5cdTY3RTVcdTc3MEJcdTY2MEVcdTdFQzZcdTRFMEVcdTU0MENcdTg4NENcdTRFQkE8L1RleHQ+XG4gICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdG90YWxcIj40MjggXHU1MTQzPC9zcGFuPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tYWN0aW9uc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYWN0aW9uc1wiIGdhcD17MTB9PlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJ0cmlwLWNvbmZpcm0tc3VibWl0XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdWJtaXRcIiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9eygpID0+IHNldENvbmZpcm1PcGVuKHRydWUpfT5cdTc4NkVcdThCQTRcdTVFNzZcdTRGRERcdTVCNTg8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdHJpcHMtYWN0aW9uXCIgdG89XCJ0cmlwc1wiPlx1NjdFNVx1NzcwQlx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQjwvQnV0dG9uPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENvbmZpcm1EaWFsb2dcbiAgICAgICAgICBpZD1cInRyaXAtY29uZmlybS1kaWFsb2dcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGlhbG9nXCJcbiAgICAgICAgICBvcGVuPXtjb25maXJtT3Blbn1cbiAgICAgICAgICB0aXRsZT1cIlx1NEZERFx1NUI1OFx1OEZEOVx1NEVGRFx1ODg0Q1x1N0EwQlx1RkYxRlwiXG4gICAgICAgICAgbWVzc2FnZT1cIlx1NEZERFx1NUI1OFx1NTQwRVx1NEYxQVx1NTQwQ1x1NkI2NVx1N0VEOVx1NURGMlx1NTJBMFx1NTE2NVx1NzY4NFx1NTQwQ1x1ODg0Q1x1NEVCQVx1RkYwQ1x1NUU3Nlx1NTcyOFx1NTFGQVx1NTNEMVx1NTI0RFx1NTNEMVx1OTAwMVx1NjNEMFx1OTE5Mlx1MzAwMlwiXG4gICAgICAgICAgY29uZmlybUxhYmVsPVwiXHU3ODZFXHU4QkE0XHU0RkREXHU1QjU4XCJcbiAgICAgICAgICBvbkNvbmZpcm09e3N1Ym1pdFRyaXB9XG4gICAgICAgICAgb25DYW5jZWw9eygpID0+IHNldENvbmZpcm1PcGVuKGZhbHNlKX1cbiAgICAgICAgLz5cbiAgICAgICAgPExvYWRpbmdPdmVybGF5IGlkPVwidHJpcC1jb25maXJtLWxvYWRpbmdcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2xvYWRpbmdcIiBvcGVuPXtsb2FkaW5nfSBsYWJlbD1cIlx1NkI2M1x1NTcyOFx1NzUxRlx1NjIxMFx1ODg0Q1x1N0EwQlwiIC8+XG4gICAgICAgIDxUb2FzdCBpZD1cInRyaXAtY29uZmlybS10b2FzdFwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fdG9hc3RcIiBvcGVuPXtzYXZlZH0+XHU4ODRDXHU3QTBCXHU1REYyXHU0RkREXHU1QjU4XHVGRjBDXHU1M0VGXHU1NzI4XHUyMDFDXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCXHUyMDFEXHU2N0U1XHU3NzBCXHUzMDAyPC9Ub2FzdD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS42LjBcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS42LjBcbiAqL1xuaW1wb3J0IHtcbiAgQnV0dG9uLFxuICBDaGVja2JveCxcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIFBhZ2VIZWFkZXIsXG4gIFJhZGlvLFxuICBSb3csXG4gIFNlbGVjdCxcbiAgU3RlcHMsXG4gIFRleHRBcmVhLFxuICBUZXh0SW5wdXQsXG4gIFRvZ2dsZSxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5leHBvcnQgZnVuY3Rpb24gVHJpcENyZWF0ZVNjcmVlbigpIHtcbiAgY29uc3QgW3JlbWluZGVyLCBzZXRSZW1pbmRlcl0gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcC1jcmVhdGUtcGFnZVwiIGdhcD17MTd9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwLWNyZWF0ZV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cInRyaXAtY3JlYXRlLWhlYWRlclwiIHRpdGxlSWQ9XCJ0cmlwLWNyZWF0ZS10aXRsZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19oZWFkZXJcIiB0aXRsZT1cIlx1NTIxQlx1NUVGQVx1ODg0Q1x1N0EwQlwiIHN1YnRpdGxlPVwiXHU1MTQ4XHU3ODZFXHU1QjlBXHU2NUY2XHU5NUY0XHU0RTBFXHU1NDBDXHU4ODRDXHU2NUI5XHU1RjBGXCIgYWN0aW9ucz17PEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fY2FuY2VsXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cdTUzRDZcdTZEODg8L0J1dHRvbj59IC8+XG4gICAgICAgIDxTdGVwcyBpZD1cInRyaXAtY3JlYXRlLXN0ZXBzXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0ZXBzXCIgY3VycmVudD17MH0gaXRlbXM9e1t7IGlkOiAnYmFzaWMnLCBsYWJlbDogJ1x1NTdGQVx1NjcyQ1x1NEZFMVx1NjA2RicgfSwgeyBpZDogJ2J1ZGdldCcsIGxhYmVsOiAnXHU5ODg0XHU3Qjk3JyB9LCB7IGlkOiAnY29uZmlybScsIGxhYmVsOiAnXHU3ODZFXHU4QkE0JyB9XX0gLz5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbmFtZS1maWVsZFwiIGxhYmVsPVwiXHU4ODRDXHU3QTBCXHU1NDBEXHU3OUYwXCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLW5hbWVcIj5cbiAgICAgICAgICA8VGV4dElucHV0IGlkPVwidHJpcC1jcmVhdGUtbmFtZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19uYW1lLWlucHV0XCIgZGVmYXVsdFZhbHVlPVwiXHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1XCIgLz5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2RhdGUtZmllbGRcIiBsYWJlbD1cIlx1NTFGQVx1NTNEMVx1NjVFNVx1NjcxRlwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1kYXRlXCIgaGludD1cIlx1NUVGQVx1OEJBRVx1OTAwOVx1NjJFOVx1NTkyOVx1NkMxNFx1N0EzM1x1NUI5QVx1NzY4NFx1NjVFNVx1NjcxRlwiPlxuICAgICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJ0cmlwLWNyZWF0ZS1kYXRlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2RhdGUtaW5wdXRcIiBkZWZhdWx0VmFsdWU9XCIyMDI2LTA4LTE1XCIgLz5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LWZpZWxkXCIgbGFiZWw9XCJcdTk2QzZcdTU0MDhcdTU3MzBcdTcwQjlcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtc3RhcnRcIj5cbiAgICAgICAgICA8U2VsZWN0IGlkPVwidHJpcC1jcmVhdGUtc3RhcnRcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtc2VsZWN0XCIgZGVmYXVsdFZhbHVlPVwibWV0cm9cIj5cbiAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LW9wdGlvblwiIHZhbHVlPVwibWV0cm9cIj5cdThGRDBcdTZDQjNcdThERUZcdTU3MzBcdTk0QzFcdTdBRDkgMyBcdTUzRjdcdTUzRTM8L29wdGlvbj5cbiAgICAgICAgICAgIDxvcHRpb24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LW9wdGlvblwiIHZhbHVlPVwid2FyZWhvdXNlXCI+XHU2NUU3XHU0RUQzXHU1RTkzXHU2QjYzXHU5NUU4PC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cImN1c3RvbVwiPlx1ODFFQVx1NUI5QVx1NEU0OVx1NTczMFx1NzBCOTwvb3B0aW9uPlxuICAgICAgICAgIDwvU2VsZWN0PlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXBhY2VcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZVwiIGdhcD17OX0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2dyb3VwLWxhYmVsXCI+XHU4ODRDXHU3QTBCXHU4MjgyXHU1OTRGPC9zcGFuPlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2Utb3B0aW9uc1wiIGdhcD17MTJ9PlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdThGN0JcdTY3N0VcIiBkZWZhdWx0Q2hlY2tlZCAvPlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdTY4MDdcdTUxQzZcIiAvPlxuICAgICAgICAgICAgPFJhZGlvIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvblwiIG5hbWU9XCJwYWNlXCIgbGFiZWw9XCJcdTdEMjdcdTUxRDFcIiAvPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbm90ZS1maWVsZFwiIGxhYmVsPVwiXHU1NDBDXHU4ODRDXHU1OTA3XHU2Q0U4XCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLW5vdGVcIj5cbiAgICAgICAgICA8VGV4dEFyZWEgaWQ9XCJ0cmlwLWNyZWF0ZS1ub3RlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25vdGUtaW5wdXRcIiBwbGFjZWhvbGRlcj1cIlx1NEY4Qlx1NTk4Mlx1RkYxQVx1NjcwOVx1NTEzRlx1N0FFNVx1NTQwQ1x1ODg0Q1x1RkYwQ1x1NUUwQ1x1NjcxQlx1NTFDRlx1NUMxMVx1Njk3Q1x1NjhBRlx1OERFRlx1NkJCNVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jcmVhdGUtcHJlZmVyZW5jZXNcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcHJlZmVyZW5jZXNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8Q2hlY2tib3ggY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3ByZWZlcmVuY2VcIiBsYWJlbD1cIlx1NEYxOFx1NTE0OFx1NUI4OVx1NjM5Mlx1NjVFMFx1OTY5Q1x1Nzg4RFx1OERFRlx1N0VCRlwiIC8+XG4gICAgICAgICAgPENoZWNrYm94IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wcmVmZXJlbmNlXCIgbGFiZWw9XCJcdTkwN0ZcdTVGMDBcdTk3MDBcdTg5ODFcdTk4ODRcdTdFQTZcdTc2ODRcdTU3MzBcdTcwQjlcIiBkZWZhdWx0Q2hlY2tlZCAvPlxuICAgICAgICAgIDxUb2dnbGUgaWQ9XCJ0cmlwLWNyZWF0ZS1yZW1pbmRlclwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19yZW1pbmRlclwiIGNoZWNrZWQ9e3JlbWluZGVyfSBvbkNoYW5nZT17c2V0UmVtaW5kZXJ9IGxhYmVsPVwiXHU1MUZBXHU1M0QxXHU1MjREXHU0RTAwXHU1OTI5XHU2M0QwXHU5MTkyXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxCdXR0b24gaWQ9XCJ0cmlwLWNyZWF0ZS1uZXh0XCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25leHRcIiB2YXJpYW50PVwicHJpbWFyeVwiIHRvPVwiYnVkZ2V0XCI+XHU0RTBCXHU0RTAwXHU2QjY1XHVGRjFBXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBPC9CdXR0b24+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNi4wXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNi4wXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgRW1wdHlTdGF0ZSxcbiAgSGVhZGluZyxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUYWJzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IFRSSVBTID0gW1xuICB7IGlkOiAndHJpcC1jYW5hbCcsIHRpdGxlOiAnXHU1NDY4XHU1MTZEXHU4RkQwXHU2Q0IzXHU2NTYzXHU2QjY1JywgZGF0ZTogJzggXHU2NzA4IDE1IFx1NjVFNScsIHN0YXR1czogJ1x1NUY4NVx1NTFGQVx1NTNEMScsIGRldGFpbDogJzMgXHU0RUJBIFx1MDBCNyA1IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbiAgeyBpZDogJ3RyaXAtbGFrZScsIHRpdGxlOiAnXHU3M0FGXHU2RTU2XHU5QTkxXHU4ODRDXHU1MzRBXHU2NUU1JywgZGF0ZTogJzggXHU2NzA4IDIyIFx1NjVFNScsIHN0YXR1czogJ1x1ODlDNFx1NTIxMlx1NEUyRCcsIGRldGFpbDogJzIgXHU0RUJBIFx1MDBCNyA0IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbiAgeyBpZDogJ3RyaXAtbXVzZXVtJywgdGl0bGU6ICdcdTk2RThcdTU5MjlcdTUzNUFcdTcyNjlcdTk5ODZcdTdFQkYnLCBkYXRlOiAnOSBcdTY3MDggNSBcdTY1RTUnLCBzdGF0dXM6ICdcdTVGODVcdTc4NkVcdThCQTQnLCBkZXRhaWw6ICc0IFx1NEVCQSBcdTAwQjcgMyBcdTRFMkFcdTU3M0FcdTk5ODYnIH0sXG4gIHsgaWQ6ICd0cmlwLWhpbGxzJywgdGl0bGU6ICdcdTU3Q0VcdTUzMTdcdThGN0JcdTVGOTJcdTZCNjUnLCBkYXRlOiAnOSBcdTY3MDggMTIgXHU2NUU1Jywgc3RhdHVzOiAnXHU4OUM0XHU1MjEyXHU0RTJEJywgZGV0YWlsOiAnMyBcdTRFQkEgXHUwMEI3IDYgXHU0RTJBXHU1NzMwXHU3MEI5JyB9LFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gVHJpcHNTY3JlZW4oKSB7XG4gIGNvbnN0IFt0YWIsIHNldFRhYl0gPSBSZWFjdC51c2VTdGF0ZSgndXBjb21pbmcnKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcHMtcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSB0cmlwc19fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwidHJpcHMtaGVhZGVyXCJcbiAgICAgICAgICB0aXRsZUlkPVwidHJpcHMtdGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInRyaXBzX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1OEJBMVx1NTIxMlx1MzAwMVx1NTQwQ1x1ODg0Q1x1NEZFMVx1NjA2Rlx1NEUwRVx1NjVDNVx1ODg0Q1x1OEJCMFx1NUY1NVwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBpZD1cInRyaXBzLWNyZWF0ZS1hY3Rpb25cIiBjbGFzc05hbWU9XCJ0cmlwc19fY3JlYXRlLWFjdGlvblwiIHRvPVwidHJpcC1jcmVhdGVcIj5cdTY1QjBcdTVFRkE8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxUYWJzIGlkPVwidHJpcHMtdGFic1wiIGNsYXNzTmFtZT1cInRyaXBzX190YWJzXCIgYWN0aXZlSWQ9e3RhYn0gb25DaGFuZ2U9e3NldFRhYn0gaXRlbXM9e1t7IGlkOiAndXBjb21pbmcnLCBsYWJlbDogJ1x1NUY4NVx1NTFGQVx1NTNEMScgfSwgeyBpZDogJ2NvbXBsZXRlZCcsIGxhYmVsOiAnXHU1REYyXHU1QjhDXHU2MjEwJyB9LCB7IGlkOiAnc2F2ZWQnLCBsYWJlbDogJ1x1NjUzNlx1ODVDRicgfV19IC8+XG4gICAgICAgIHt0YWIgPT09ICd1cGNvbWluZycgPyAoXG4gICAgICAgICAgPENvbHVtbiBpZD1cInRyaXBzLXVwY29taW5nXCIgY2xhc3NOYW1lPVwidHJpcHNfX2xpc3RcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgIHtUUklQUy5tYXAoKHRyaXApID0+IChcbiAgICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT17dHJpcC5pZH0ga2V5PXt0cmlwLmlkfSB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OX0+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+e3RyaXAudGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtc3RhdHVzXCI+e3RyaXAuc3RhdHVzfTwvQmFkZ2U+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj57dHJpcC5kYXRlfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcHNfX3N0YXR1cy1yb3dcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGV0YWlsXCI+e3RyaXAuZGV0YWlsfTwvVGV4dD5cbiAgICAgICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtcmVtaW5kZXJcIj5cdTYzRDBcdTkxOTJcdTVERjJcdTVGMDBcdTU0MkY8L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiB0YWIgPT09ICdjb21wbGV0ZWQnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwcy1jb21wbGV0ZWRcIiBjbGFzc05hbWU9XCJ0cmlwc19fY29tcGxldGVkXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PVwidHJpcC1vbGQtc3RyZWV0XCIgdG89XCJyb3V0ZS1kZXRhaWxcIj48Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezh9PjxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Plx1ODAwMVx1ODg1N1x1NjE2Mlx1NkUzODwvSGVhZGluZz48VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+NyBcdTY3MDggMTggXHU2NUU1IFx1MDBCNyBcdTVERjJcdTVCOENcdTYyMTA8L1RleHQ+PC9Db2x1bW4+PC9DYXJkPlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT1cInRyaXAtbmlnaHQtd2Fsa1wiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTU5MUNcdTgyNzJcdTVFRkFcdTdCNTFcdTY1NjNcdTZCNjU8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjYgXHU2NzA4IDI3IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9XCJ0cmlwLXJpdmVyc2lkZVwiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTUzNTdcdTVDQjhcdTY1RTdcdTc4MDFcdTU5MzQ8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjUgXHU2NzA4IDE2IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgKSA6IChcbiAgICAgICAgICA8RW1wdHlTdGF0ZSBpZD1cInRyaXBzLXNhdmVkLWVtcHR5XCIgY2xhc3NOYW1lPVwidHJpcHNfX2VtcHR5XCIgdGl0bGU9XCJcdThGRDhcdTZDQTFcdTY3MDlcdTY1MzZcdTg1Q0ZcdThERUZcdTdFQkZcIiBkZXNjcmlwdGlvbj1cIlx1NTcyOFx1OERFRlx1N0VCRlx1OEJFNlx1NjBDNVx1NEUyRFx1NjUzNlx1ODVDRlx1RkYwQ1x1N0EwRFx1NTQwRVx1NTE4RFx1NTFCM1x1NUI5QVx1NEVDMFx1NEU0OFx1NjVGNlx1NTAxOVx1NTFGQVx1NTNEMVx1MzAwMlwiIGFjdGlvbj17PEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwc19fZW1wdHktYWN0aW9uXCIgdG89XCJkaXNjb3ZlclwiPlx1NTNCQlx1NTNEMVx1NzNCMFx1OERFRlx1N0VCRjwvQnV0dG9uPn0gLz5cbiAgICAgICAgKX1cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiaW1wb3J0IHsgQnVkZ2V0U2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2J1ZGdldC5qc3gnXG5pbXBvcnQgeyBEaXNjb3ZlclNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9kaXNjb3Zlci5qc3gnXG5pbXBvcnQgeyBFeHBsb3JlTWFwU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2V4cGxvcmUtbWFwLmpzeCdcbmltcG9ydCB7IEl0aW5lcmFyeVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9pdGluZXJhcnkuanN4J1xuaW1wb3J0IHsgTG9naW5TY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvbG9naW4uanN4J1xuaW1wb3J0IHsgUHJvZmlsZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9wcm9maWxlLmpzeCdcbmltcG9ydCB7IFJvdXRlRGV0YWlsU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL3JvdXRlLWRldGFpbC5qc3gnXG5pbXBvcnQgeyBUcmlwQ29uZmlybVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwLWNvbmZpcm0uanN4J1xuaW1wb3J0IHsgVHJpcENyZWF0ZVNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwLWNyZWF0ZS5qc3gnXG5pbXBvcnQgeyBUcmlwc1NjcmVlbiB9IGZyb20gJy4vc2NyZWVucy90cmlwcy5qc3gnXG5cbmV4cG9ydCBjb25zdCBwcm9qZWN0ID0ge1xuICBuYW1lOiAnXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXHU2NUM1XHU4ODRDXHU1MkE5XHU2MjRCJyxcbiAgdmlld3BvcnRzOiB7XG4gICAgbW9iaWxlOiB7IHdpZHRoOiAzNzUsIGhlaWdodDogODEyIH0sXG4gIH0sXG4gIGRlZmF1bHRWaWV3cG9ydDogJ21vYmlsZScsXG4gIHNjcmVlbnM6IFtcbiAgICB7XG4gICAgICBpZDogJ2xvZ2luJyxcbiAgICAgIHRpdGxlOiAnXHU3NjdCXHU1RjU1JyxcbiAgICAgIGNvbXBvbmVudDogTG9naW5TY3JlZW4sXG4gICAgICBlbnRyeTogdHJ1ZSxcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdkaXNjb3ZlcicsXG4gICAgICB0aXRsZTogJ1x1NTNEMVx1NzNCMCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1x1OEQ4NVx1OEZDN1x1NEUwMFx1NUM0Rlx1NzY4NFx1OERFRlx1N0VCRlx1NjNBOFx1ODM1MFx1OTk5Nlx1OTg3NScsXG4gICAgICBjb21wb25lbnQ6IERpc2NvdmVyU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAnZXhwbG9yZS1tYXAnLCAncm91dGUtZGV0YWlsJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ2V4cGxvcmUtbWFwJyxcbiAgICAgIHRpdGxlOiAnXHU3NkVFXHU3Njg0XHU1NzMwXHU1NzMwXHU1NkZFJyxcbiAgICAgIGNvbXBvbmVudDogRXhwbG9yZU1hcFNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdyb3V0ZS1kZXRhaWwnLFxuICAgICAgdGl0bGU6ICdcdThERUZcdTdFQkZcdThCRTZcdTYwQzUnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdTk1N0ZcdTUxODVcdTVCQjlcdThERUZcdTdFQkZcdTRFQ0JcdTdFQ0RcdTRFMEVcdTU3MzBcdTcwQjlcdTUyMTdcdTg4NjgnLFxuICAgICAgY29tcG9uZW50OiBSb3V0ZURldGFpbFNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ2V4cGxvcmUtbWFwJywgJ2l0aW5lcmFyeScsICd0cmlwLWNyZWF0ZScsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdpdGluZXJhcnknLFxuICAgICAgdGl0bGU6ICdcdTZCQ0ZcdTY1RTVcdTg4NENcdTdBMEInLFxuICAgICAgZGVzY3JpcHRpb246ICdcdThEODVcdThGQzdcdTRFMDBcdTVDNEZcdTc2ODRcdTdFQjVcdTU0MTFcdTZCNjVcdTlBQTRcdTRFMEVcdTY1RTVcdTdBMEJcdTUzNjFcdTcyNDcnLFxuICAgICAgY29tcG9uZW50OiBJdGluZXJhcnlTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHJpcC1jcmVhdGUnLFxuICAgICAgdGl0bGU6ICdcdTUyMUJcdTVFRkFcdTg4NENcdTdBMEInLFxuICAgICAgY29tcG9uZW50OiBUcmlwQ3JlYXRlU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ2J1ZGdldCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdidWRnZXQnLFxuICAgICAgdGl0bGU6ICdcdTk4ODRcdTdCOTdcdTRFMEVcdTU0MENcdTg4NENcdTRFQkEnLFxuICAgICAgY29tcG9uZW50OiBCdWRnZXRTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICd0cmlwLWNvbmZpcm0nLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAndHJpcC1jb25maXJtJyxcbiAgICAgIHRpdGxlOiAnXHU2M0QwXHU0RUE0XHU3ODZFXHU4QkE0JyxcbiAgICAgIGNvbXBvbmVudDogVHJpcENvbmZpcm1TY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdidWRnZXQnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbJ1x1Nzg2RVx1OEJBNFx1NUYzOVx1NUM0MicsICdcdTUyQTBcdThGN0RcdTcyQjZcdTYwMDEnLCAnXHU2MjEwXHU1MjlGXHU2M0QwXHU3OTNBJ10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXBzJyxcbiAgICAgIHRpdGxlOiAnXHU2MjExXHU3Njg0XHU4ODRDXHU3QTBCJyxcbiAgICAgIGNvbXBvbmVudDogVHJpcHNTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncHJvZmlsZScsXG4gICAgICB0aXRsZTogJ1x1NEUyQVx1NEVCQVx1OEJCRVx1N0Y2RScsXG4gICAgICBjb21wb25lbnQ6IFByb2ZpbGVTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gIF0sXG59XG4iLCAiaW1wb3J0IHsgQm9hcmQgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4J1xuaW1wb3J0IHsgRXJyb3JCb3VuZGFyeSB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgUHJvdG90eXBlUHJvdmlkZXIgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHZhbGlkYXRlUHJvamVjdCB9IGZyb20gJy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcydcbmltcG9ydCB7IHByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnXG5cbnZhbGlkYXRlUHJvamVjdChwcm9qZWN0KVxuXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykpLnJlbmRlcihcbiAgPEVycm9yQm91bmRhcnkgc2NvcGU9XCJib2FyZFwiPlxuICAgIDxQcm90b3R5cGVQcm92aWRlciBwcm9qZWN0PXtwcm9qZWN0fT5cbiAgICAgIDxCb2FyZCBwcm9qZWN0PXtwcm9qZWN0fSAvPlxuICAgIDwvUHJvdG90eXBlUHJvdmlkZXI+XG4gIDwvRXJyb3JCb3VuZGFyeT4sXG4pXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFBQSxNQUFNLG1CQUFtQixNQUFNLGNBQWMsSUFBSTtBQUVqRCxXQUFTLG1CQUFtQkEsVUFBUztBQUZyQztBQUdFLGFBQU8sS0FBQUEsU0FBUSxRQUFRLEtBQUssQ0FBQyxXQUFXLE9BQU8sS0FBSyxNQUE3QyxtQkFBZ0QsT0FBTUEsU0FBUSxRQUFRLENBQUMsRUFBRTtBQUFBLEVBQ2xGO0FBRU8sV0FBUyxrQkFBa0IsRUFBRSxTQUFBQSxVQUFTLFNBQVMsR0FBRztBQUN2RCxVQUFNLGtCQUFrQixtQkFBbUJBLFFBQU87QUFDbEQsVUFBTSxDQUFDLE9BQU8sUUFBUSxJQUFJLE1BQU0s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QUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxnQkFBZ0IsU0FBUyxTQUFTO0FBQUEsUUFDdEQsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLFVBQVUsU0FBUyxTQUFTO0FBQUEsUUFDaEQsV0FBVyxDQUFDLDRCQUFRLDRCQUFRLDBCQUFNO0FBQUEsTUFDcEM7QUFBQSxNQUNBO0FBQUEsUUFDRSxJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxPQUFPLENBQUMsWUFBWSxnQkFBZ0IsZUFBZSxTQUFTLFNBQVM7QUFBQSxRQUNyRSxXQUFXLENBQUM7QUFBQSxNQUNkO0FBQUEsTUFDQTtBQUFBLFFBQ0UsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksU0FBUyxTQUFTO0FBQUEsUUFDdEMsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLElBQ0Y7QUFBQSxFQUNGOzs7QUN2RkEsa0JBQWdCLE9BQU87QUFFdkIsV0FBUyxXQUFXLFNBQVMsZUFBZSxNQUFNLENBQUMsRUFBRTtBQUFBLElBQ25ELG9DQUFDLGlCQUFjLE9BQU0sV0FDbkIsb0NBQUMscUJBQWtCLFdBQ2pCLG9DQUFDLFNBQU0sU0FBa0IsQ0FDM0IsQ0FDRjtBQUFBLEVBQ0Y7IiwKICAibmFtZXMiOiBbInByb2plY3QiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAiY29weVRleHQiLCAicHJvamVjdCIsICJfYSIsICJwcm9qZWN0IiwgInByb2plY3QiLCAidGFicyJdCn0K
