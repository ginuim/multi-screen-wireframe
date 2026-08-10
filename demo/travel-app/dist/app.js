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
    ), /* @__PURE__ */ React.createElement(Row, { id: "explore-map-filters", className: "weekend-chip-row explore-map__filters", gap: 8 }, /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u5168\u90E8"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u6B65\u884C"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u9A91\u884C"), /* @__PURE__ */ React.createElement(Badge, { className: "explore-map__filter" }, "\u5BA4\u5185")), /* @__PURE__ */ React.createElement(WireMap, { id: "explore-map-canvas", className: "weekend-map explore-map__canvas" }, /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-canal", x: 27, y: 36, label: "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-hills", x: 68, y: 20, label: "\u57CE\u5317\u8F7B\u5F92\u6B65", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-lanes", x: 58, y: 58, label: "\u8001\u8857\u6162\u6E38", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapMarker, { className: "explore-map__marker", "data-wf-key": "marker-lake", x: 22, y: 72, label: "\u73AF\u6E56\u9A91\u884C\u534A\u65E5", to: "route-detail" }), /* @__PURE__ */ React.createElement(MapOverlay, { className: "explore-map__overlay", position: "bottom" }, /* @__PURE__ */ React.createElement(Card, { className: "explore-map__route-preview", to: "route-detail" }, /* @__PURE__ */ React.createElement(Column, { className: "explore-map__preview-body", gap: 6 }, /* @__PURE__ */ React.createElement(Text, { className: "explore-map__preview-eyebrow" }, "\u8DDD\u79BB\u4F60 2.4 km"), /* @__PURE__ */ React.createElement("strong", { className: "explore-map__preview-title" }, "\u8FD0\u6CB3\u8FB9\u7684\u4E00\u5929"), /* @__PURE__ */ React.createElement(Text, { className: "explore-map__preview-meta" }, "8.6 km \xB7 \u7EA6 6 \u5C0F\u65F6 \xB7 \u8F7B\u677E")))))));
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL25hdmlnYXRpb24uanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvRXJyb3JCb3VuZGFyeS5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mbG93LXRhcmdldC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvcmV2aWV3LmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBhbmQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1NjcmVlbkZyYW1lLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvdXNlV2hlZWxab29tLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC92YWxpZGF0aW9uLmpzIiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9DYW52YXNNb2RlLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvRGVtb01vZGUuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9ib2FyZC9leHBvcnQuanMiLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld1BhbmVsLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvUmV2aWV3TWFya2Vycy5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL1Jldmlld0xhdW5jaGVyLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvYmVmb3JlLXVubG9hZC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvYm9hcmQvQm9hcmQuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi9jb3JlL3ZhbGlkYXRlUHJvamVjdC5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvZmxvdy5qcyIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbGF5b3V0LmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvY29udGVudC5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2Zvcm1zLmpzeCIsICIuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvbmF2aWdhdGlvbi5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2RhdGEuanN4IiwgIi4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9mZWVkYmFjay5qc3giLCAiLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL21hcC5qc3giLCAiLi4vc3JjL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCIsICIuLi9zcmMvc2NyZWVucy9idWRnZXQuanN4IiwgIi4uL3NyYy9zY3JlZW5zL2Rpc2NvdmVyLmpzeCIsICIuLi9zcmMvc2NyZWVucy9leHBsb3JlLW1hcC5qc3giLCAiLi4vc3JjL3NjcmVlbnMvaXRpbmVyYXJ5LmpzeCIsICIuLi9zcmMvc2NyZWVucy9sb2dpbi5qc3giLCAiLi4vc3JjL3NjcmVlbnMvcHJvZmlsZS5qc3giLCAiLi4vc3JjL3NjcmVlbnMvcm91dGUtZGV0YWlsLmpzeCIsICIuLi9zcmMvc2NyZWVucy90cmlwLWNvbmZpcm0uanN4IiwgIi4uL3NyYy9zY3JlZW5zL3RyaXAtY3JlYXRlLmpzeCIsICIuLi9zcmMvc2NyZWVucy90cmlwcy5qc3giLCAiLi4vc3JjL3Byb2plY3QuanMiLCAiLi4vc3JjL2FwcC5qc3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IFByb3RvdHlwZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KG51bGwpXG5cbmZ1bmN0aW9uIGdldEluaXRpYWxTY3JlZW5JZChwcm9qZWN0KSB7XG4gIHJldHVybiBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uZW50cnkpPy5pZCB8fCBwcm9qZWN0LnNjcmVlbnNbMF0uaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFByb3RvdHlwZVByb3ZpZGVyKHsgcHJvamVjdCwgY2hpbGRyZW4gfSkge1xuICBjb25zdCBpbml0aWFsU2NyZWVuSWQgPSBnZXRJbml0aWFsU2NyZWVuSWQocHJvamVjdClcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZSh7XG4gICAgbW9kZTogJ2NhbnZhcycsXG4gICAgdmlld3BvcnRLZXk6IHByb2plY3QuZGVmYXVsdFZpZXdwb3J0LFxuICAgIGVudHJ5SWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBjdXJyZW50U2NyZWVuSWQ6IGluaXRpYWxTY3JlZW5JZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgfSlcblxuICBjb25zdCBuYXZpZ2F0ZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChpZCkgPT4ge1xuICAgIGlmICghcHJvamVjdC5zY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBpZCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2lkfVwiIGRvZXMgbm90IGV4aXN0YClcbiAgICB9XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWQpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IGN1cnJlbnQuY3VycmVudFNjcmVlbklkKVxuICAgICAgICBpZiAoIXNjcmVlbi5saW5rcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7Y3VycmVudC5jdXJyZW50U2NyZWVuSWR9XCIgbGlua3MgZG8gbm90IGluY2x1ZGUgXCIke2lkfVwiYClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY3VycmVudCxcbiAgICAgICAgY3VycmVudFNjcmVlbklkOiBpZCxcbiAgICAgICAgaGlzdG9yeTpcbiAgICAgICAgICBjdXJyZW50Lm1vZGUgPT09ICdkZW1vJyAmJiBpZCAhPT0gY3VycmVudC5jdXJyZW50U2NyZWVuSWRcbiAgICAgICAgICAgID8gWy4uLmN1cnJlbnQuaGlzdG9yeSwgY3VycmVudC5jdXJyZW50U2NyZWVuSWRdXG4gICAgICAgICAgICA6IGN1cnJlbnQuaGlzdG9yeSxcbiAgICAgIH1cbiAgICB9KVxuICB9LCBbcHJvamVjdF0pXG5cbiAgY29uc3Qgc2VsZWN0RW50cnkgPSBSZWFjdC51c2VDYWxsYmFjaygoZW50cnlJZCkgPT4ge1xuICAgIGNvbnN0IGVudHJ5ID0gcHJvamVjdC5zY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBlbnRyeUlkKVxuICAgIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIGVudHJ5SWQsXG4gICAgICBjdXJyZW50U2NyZWVuSWQ6IGVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IGdvQmFjayA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKGN1cnJlbnQuaGlzdG9yeS5sZW5ndGggPT09IDApIHJldHVybiBjdXJyZW50XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5jdXJyZW50LFxuICAgICAgICBjdXJyZW50U2NyZWVuSWQ6IGN1cnJlbnQuaGlzdG9yeVtjdXJyZW50Lmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgICAgIGhpc3Rvcnk6IGN1cnJlbnQuaGlzdG9yeS5zbGljZSgwLCAtMSksXG4gICAgICB9XG4gICAgfSlcbiAgfSwgW10pXG5cbiAgY29uc3QgcmVzZXQgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0U3RhdGUoKGN1cnJlbnQpID0+ICh7XG4gICAgICAuLi5jdXJyZW50LFxuICAgICAgY3VycmVudFNjcmVlbklkOiBjdXJyZW50LmVudHJ5SWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW2luaXRpYWxTY3JlZW5JZF0pXG5cbiAgY29uc3Qgc2V0TW9kZSA9IFJlYWN0LnVzZUNhbGxiYWNrKChtb2RlKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdjYW52YXMnICYmIG1vZGUgIT09ICdkZW1vJykgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIG1vZGUgXCIke21vZGV9XCJgKVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGUsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW10pXG5cbiAgLyoqIFx1NzUzQlx1Njc3Rlx1NTNDQ1x1NTFGQlx1NjdEMFx1OTg3NVx1RkYxQVx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQVx1NUU3Nlx1ODQzRFx1NTcyOFx1OEJFNVx1OTg3NSAqL1xuICBjb25zdCBlbnRlckRlbW8gPSBSZWFjdC51c2VDYWxsYmFjaygoc2NyZWVuSWQpID0+IHtcbiAgICBpZiAoIXByb2plY3Quc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gc2NyZWVuSWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5hdmlnYXRpb24gdGFyZ2V0IFwiJHtzY3JlZW5JZH1cIiBkb2VzIG5vdCBleGlzdGApXG4gICAgfVxuICAgIHNldFN0YXRlKChjdXJyZW50KSA9PiAoe1xuICAgICAgLi4uY3VycmVudCxcbiAgICAgIG1vZGU6ICdkZW1vJyxcbiAgICAgIGN1cnJlbnRTY3JlZW5JZDogc2NyZWVuSWQsXG4gICAgICBoaXN0b3J5OiBbXSxcbiAgICB9KSlcbiAgfSwgW3Byb2plY3RdKVxuXG4gIGNvbnN0IHNldFZpZXdwb3J0S2V5ID0gUmVhY3QudXNlQ2FsbGJhY2soKHZpZXdwb3J0S2V5KSA9PiB7XG4gICAgaWYgKCFPYmplY3QuaGFzT3duKHByb2plY3Qudmlld3BvcnRzLCB2aWV3cG9ydEtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB2aWV3cG9ydCBcIiR7dmlld3BvcnRLZXl9XCJgKVxuICAgIH1cbiAgICBzZXRTdGF0ZSgoY3VycmVudCkgPT4gKHsgLi4uY3VycmVudCwgdmlld3BvcnRLZXkgfSkpXG4gIH0sIFtwcm9qZWN0XSlcblxuICBjb25zdCB2YWx1ZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gKHtcbiAgICBtb2RlOiBzdGF0ZS5tb2RlLFxuICAgIHZpZXdwb3J0S2V5OiBzdGF0ZS52aWV3cG9ydEtleSxcbiAgICB2aWV3cG9ydDogcHJvamVjdC52aWV3cG9ydHNbc3RhdGUudmlld3BvcnRLZXldLFxuICAgIGVudHJ5SWQ6IHN0YXRlLmVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5jdXJyZW50U2NyZWVuSWQsXG4gICAgbmF2aWdhdGUsXG4gICAgZ29CYWNrLFxuICAgIHJlc2V0LFxuICAgIHNlbGVjdEVudHJ5LFxuICAgIHNldE1vZGUsXG4gICAgZW50ZXJEZW1vLFxuICAgIHNldFZpZXdwb3J0S2V5LFxuICAgIGNhbkdvQmFjazogc3RhdGUuaGlzdG9yeS5sZW5ndGggPiAwLFxuICB9KSwgW2VudGVyRGVtbywgZ29CYWNrLCBuYXZpZ2F0ZSwgcHJvamVjdCwgcmVzZXQsIHNlbGVjdEVudHJ5LCBzZXRNb2RlLCBzZXRWaWV3cG9ydEtleSwgc3RhdGVdKVxuXG4gIHJldHVybiA8UHJvdG90eXBlQ29udGV4dC5Qcm92aWRlciB2YWx1ZT17dmFsdWV9PntjaGlsZHJlbn08L1Byb3RvdHlwZUNvbnRleHQuUHJvdmlkZXI+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VQcm90b3R5cGUoKSB7XG4gIGNvbnN0IGNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KFByb3RvdHlwZUNvbnRleHQpXG4gIGlmICghY29udGV4dCkgdGhyb3cgbmV3IEVycm9yKCd1c2VQcm90b3R5cGUgbXVzdCBiZSB1c2VkIGluc2lkZSBQcm90b3R5cGVQcm92aWRlcicpXG4gIHJldHVybiBjb250ZXh0XG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNsYW1wU2NhbGUoc2NhbGUpIHtcbiAgcmV0dXJuIE1hdGgubWluKDIsIE1hdGgubWF4KDAuMiwgc2NhbGUpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1NkEyMVx1NUYwRlx1RkYxQVx1NjMwOVx1NUJCOVx1NTY2OFx1NTE4NVx1NUJCOVx1NTMzQVx1NjI4QVx1NjU3NFx1OTg3NVx1N0YyOVx1NjUzRVx1NTIzMFx1NUI4Q1x1NjU3NFx1NTNFRlx1ODlDMVx1MzAwMlxuICogY29udGFpbmVyKiBcdTRFM0FcdTUzQkJcdTYzODkgcGFkZGluZyBcdTU0MEVcdTc2ODRcdTUzRUZcdTc1MjhcdTVDM0FcdTVCRjhcdUZGMUJjb250ZW50KiBcdTRFM0FcdTY3MkFcdTdGMjlcdTY1M0VcdTc2ODQgc3RhZ2UgXHU1QkJEXHU5QUQ4XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXREZW1vU2NhbGUoY29udGFpbmVyV2lkdGgsIGNvbnRhaW5lckhlaWdodCwgY29udGVudFdpZHRoLCBjb250ZW50SGVpZ2h0KSB7XG4gIGlmIChjb250YWluZXJXaWR0aCA8PSAwIHx8IGNvbnRhaW5lckhlaWdodCA8PSAwIHx8IGNvbnRlbnRXaWR0aCA8PSAwIHx8IGNvbnRlbnRIZWlnaHQgPD0gMCkge1xuICAgIHJldHVybiAxXG4gIH1cbiAgcmV0dXJuIGNsYW1wU2NhbGUoTWF0aC5taW4oY29udGFpbmVyV2lkdGggLyBjb250ZW50V2lkdGgsIGNvbnRhaW5lckhlaWdodCAvIGNvbnRlbnRIZWlnaHQpKVxufVxuXG4vKipcbiAqIFx1NkYxNFx1NzkzQVx1ODlDNlx1NTNFM1x1NTNDQ1x1NTFGQlx1NzZFRVx1NjgwN1x1NjYyRlx1NTQyNlx1NEUzQVx1NUM0Rlx1NTkxNlx1N0E3QVx1NzY3RFx1MzAwMlxuICogXHU3MEI5XHU1NzI4IC53Zi1zY3JlZW4tY2hyb21lXHVGRjA4XHU2ODA3XHU5ODk4XHU2ODBGIC8gXHU1MTg1XHU1QkI5XHVGRjA5XHU1MTg1XHU0RTBEXHU3Qjk3XHU3QTdBXHU3NjdEXHVGRjBDXHU5MDdGXHU1MTREXHU4QkVGXHU5MDAwXHU1MUZBXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RlbW9CbGFua0V4aXRUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRydWVcbiAgcmV0dXJuICF0YXJnZXQuY2xvc2VzdCgnLndmLXNjcmVlbi1jaHJvbWUnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRDYW52YXNWaWV3cG9ydCgpIHtcbiAgcmV0dXJuIHsgc2NhbGU6IDEsIHBhblg6IDAsIHBhblk6IDAgfVxufVxuXG5jb25zdCBGT0NVU19QQURESU5HID0gNDBcblxuLyoqXG4gKiBcdTc1M0JcdTY3N0YgZm9jdXNcdUZGMUFcdTYyOEFcdTY1NzRcdTU3NTcgc2NyZWVuXHVGRjA4XHU1NDJCIG1ldGFcdUZGMDlcdTc5RkJcdTUyMzBcdTVCQjlcdTU2NjhcdTRFMkRcdTVGQzNcdTMwMDJcbiAqIFx1NEVDNVx1NUY1M1x1NUY1M1x1NTI0RCBzY2FsZSBcdTY1M0VcdTRFMERcdTRFMEJcdTY1RjZcdTdGMjlcdTVDMEZcdUZGMUJcdTRFMERcdTY1M0VcdTU5MjdcdTMwMDJcdTVDM0FcdTVCRjhcdTk3NUVcdTZDRDVcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZm9jdXNDYW52YXNTY3JlZW4oe1xuICBjb250YWluZXJXaWR0aCxcbiAgY29udGFpbmVySGVpZ2h0LFxuICBzY3JlZW5MZWZ0LFxuICBzY3JlZW5Ub3AsXG4gIHNjcmVlbldpZHRoLFxuICBzY3JlZW5IZWlnaHQsXG4gIGN1cnJlbnRTY2FsZSxcbiAgcGFkZGluZyA9IEZPQ1VTX1BBRERJTkcsXG59KSB7XG4gIGlmIChcbiAgICBjb250YWluZXJXaWR0aCA8PSAwXG4gICAgfHwgY29udGFpbmVySGVpZ2h0IDw9IDBcbiAgICB8fCBzY3JlZW5XaWR0aCA8PSAwXG4gICAgfHwgc2NyZWVuSGVpZ2h0IDw9IDBcbiAgICB8fCAhTnVtYmVyLmlzRmluaXRlKGN1cnJlbnRTY2FsZSlcbiAgKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGF2YWlsV2lkdGggPSBjb250YWluZXJXaWR0aCAtIHBhZGRpbmcgKiAyXG4gIGNvbnN0IGF2YWlsSGVpZ2h0ID0gY29udGFpbmVySGVpZ2h0IC0gcGFkZGluZyAqIDJcbiAgaWYgKGF2YWlsV2lkdGggPD0gMCB8fCBhdmFpbEhlaWdodCA8PSAwKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IGZpdFNjYWxlID0gTWF0aC5taW4oYXZhaWxXaWR0aCAvIHNjcmVlbldpZHRoLCBhdmFpbEhlaWdodCAvIHNjcmVlbkhlaWdodClcbiAgY29uc3Qgc2NhbGUgPSBjbGFtcFNjYWxlKE1hdGgubWluKGN1cnJlbnRTY2FsZSwgZml0U2NhbGUpKVxuICByZXR1cm4ge1xuICAgIHNjYWxlLFxuICAgIHBhblg6IGNvbnRhaW5lcldpZHRoIC8gMiAtIChzY3JlZW5MZWZ0ICsgc2NyZWVuV2lkdGggLyAyKSAqIHNjYWxlLFxuICAgIHBhblk6IGNvbnRhaW5lckhlaWdodCAvIDIgLSAoc2NyZWVuVG9wICsgc2NyZWVuSGVpZ2h0IC8gMikgKiBzY2FsZSxcbiAgfVxufVxuXG4vKipcbiAqIFx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1RkYxQVx1NTNFQVx1NzUyOFx1OEMwM1x1NzUyOFx1NjVCOVx1NjNEMFx1NTI0RFx1NjIyQVx1ODNCN1x1NzY4NCBzbmFwc2hvdFx1RkYwQ1x1Nzk4MVx1NkI2Mlx1NTcyOCBzZXRTdGF0ZSB1cGRhdGVyIFx1OTFDQ1x1OEJGQiBkcmFnIHJlZlx1MzAwMlxuICogUmVhY3QgMTggXHU0RjFBXHU1NzI4IGVuZFBhbiBcdTZFMDVcdTdBN0EgcmVmIFx1NTQwRVx1OTFDRFx1NjUzRSB1cGRhdGVyXHVGRjFCXHU4QkZCIG51bGwucGFuWCBcdTUzNzMgQm9hcmQgXHU2MkE1XHU5NTE5XHU2ODM5XHU1NkUwXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYW5Gcm9tRHJhZ1NuYXBzaG90KHZpZXcsIHNuYXBzaG90LCBjbGllbnRYLCBjbGllbnRZKSB7XG4gIGlmICghc25hcHNob3QpIHJldHVybiB2aWV3XG4gIHJldHVybiB7XG4gICAgLi4udmlldyxcbiAgICBwYW5YOiBzbmFwc2hvdC5wYW5YICsgY2xpZW50WCAtIHNuYXBzaG90LngsXG4gICAgcGFuWTogc25hcHNob3QucGFuWSArIGNsaWVudFkgLSBzbmFwc2hvdC55LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Njcm9sbGFibGVPdmVyZmxvdyh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09ICdhdXRvJyB8fCB2YWx1ZSA9PT0gJ3Njcm9sbCcgfHwgdmFsdWUgPT09ICdvdmVybGF5J1xufVxuXG4vKiogXHU1NzI4IHJvb3QgXHU1MTg1XHU1NDExXHU0RTBBXHU2MjdFXHU1M0VGXHU2RURBXHU1MkE4XHU3OTU2XHU1MTQ4XHVGRjA4XHU1NDJCIHJvb3QgXHU4MUVBXHU4RUFCXHVGRjBDXHU1OTgyXHU1QzRGXHU1MTg1XHU1MTg1XHU1QkI5XHU1MzNBXHVGRjA5ICovXG5leHBvcnQgZnVuY3Rpb24gZmluZFNjcm9sbGFibGVBbmNlc3RvcihzdGFydEVsLCByb290RWwpIHtcbiAgbGV0IG5vZGUgPSBzdGFydEVsICYmIHN0YXJ0RWwubm9kZVR5cGUgPT09IDMgPyBzdGFydEVsLnBhcmVudEVsZW1lbnQgOiBzdGFydEVsXG4gIHdoaWxlIChub2RlKSB7XG4gICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobm9kZSlcbiAgICAgIGNvbnN0IGNhblkgPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1kpICYmIG5vZGUuc2Nyb2xsSGVpZ2h0ID4gbm9kZS5jbGllbnRIZWlnaHQgKyAxXG4gICAgICBjb25zdCBjYW5YID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dYKSAmJiBub2RlLnNjcm9sbFdpZHRoID4gbm9kZS5jbGllbnRXaWR0aCArIDFcbiAgICAgIGlmIChjYW5ZIHx8IGNhblgpIHJldHVybiBub2RlXG4gICAgfVxuICAgIGlmIChub2RlID09PSByb290RWwpIGJyZWFrXG4gICAgbm9kZSA9IG5vZGUucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IENPTlRFTlRfRFJBR19USFJFU0hPTEQgPSAzXG5cbmZ1bmN0aW9uIGlzRWRpdGFibGVUYXJnZXQodGFyZ2V0KSB7XG4gIGlmICghdGFyZ2V0IHx8IHR5cGVvZiB0YXJnZXQuY2xvc2VzdCAhPT0gJ2Z1bmN0aW9uJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAhIXRhcmdldC5jbG9zZXN0KCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT1cInRydWVcIl0nKVxufVxuXG4vKipcbiAqIFx1NTcyOFx1NTNFRlx1NkVEQVx1NTJBOFx1NTMzQVx1NTdERlx1NTE4NVx1NjMwOVx1NEY0Rlx1NjJENlx1NjJGRCBcdTIxOTIgXHU2RURBXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdUZGMDhcdTUzRUZcdTRFQTRcdTRFOTJcdTUxNzNcdTk1RUQgLyBcdTdBN0FcdTY4M0NcdUZGMDlcdTY1RjZcdThGRDRcdTU2REUgbnVsbFx1RkYwQ1x1NEVBNFx1N0VEOVx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlx1MzAwMlxuICogXHU4RkQ0XHU1NkRFIG51bGwgXHU4ODY4XHU3OTNBXHU0RTBEXHU1RTk0XHU2M0E1XHU3QkExXHU4QkU1XHU2QjIxIHBvaW50ZXJkb3duXHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZWdpbkNvbnRlbnREcmFnU2Nyb2xsKGV2ZW50LCByb290RWwsIHsgbG9ja2VkID0gZmFsc2UsIHNjYWxlID0gMSB9ID0ge30pIHtcbiAgaWYgKGxvY2tlZCkgcmV0dXJuIG51bGxcbiAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuIG51bGxcbiAgaWYgKCFyb290RWwgfHwgIXJvb3RFbC5jb250YWlucyhldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBpZiAoaXNFZGl0YWJsZVRhcmdldChldmVudC50YXJnZXQpKSByZXR1cm4gbnVsbFxuICBjb25zdCBzY3JvbGxhYmxlID0gZmluZFNjcm9sbGFibGVBbmNlc3RvcihldmVudC50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCFzY3JvbGxhYmxlKSByZXR1cm4gbnVsbFxuICByZXR1cm4ge1xuICAgIGVsOiBzY3JvbGxhYmxlLFxuICAgIHBvaW50ZXJJZDogZXZlbnQucG9pbnRlcklkLFxuICAgIHN0YXJ0WDogZXZlbnQuY2xpZW50WCxcbiAgICBzdGFydFk6IGV2ZW50LmNsaWVudFksXG4gICAgc2Nyb2xsTGVmdDogc2Nyb2xsYWJsZS5zY3JvbGxMZWZ0LFxuICAgIHNjcm9sbFRvcDogc2Nyb2xsYWJsZS5zY3JvbGxUb3AsXG4gICAgc2NhbGU6IHNjYWxlID4gMCA/IHNjYWxlIDogMSxcbiAgICBtb3ZlZDogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVDb250ZW50RHJhZ1Njcm9sbChzdGF0ZSwgZXZlbnQpIHtcbiAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuIHN0YXRlXG4gIGNvbnN0IGR4ID0gKGV2ZW50LmNsaWVudFggLSBzdGF0ZS5zdGFydFgpIC8gc3RhdGUuc2NhbGVcbiAgY29uc3QgZHkgPSAoZXZlbnQuY2xpZW50WSAtIHN0YXRlLnN0YXJ0WSkgLyBzdGF0ZS5zY2FsZVxuICBpZiAoIXN0YXRlLm1vdmVkICYmIChNYXRoLmFicyhkeCkgPiBDT05URU5UX0RSQUdfVEhSRVNIT0xEIHx8IE1hdGguYWJzKGR5KSA+IENPTlRFTlRfRFJBR19USFJFU0hPTEQpKSB7XG4gICAgc3RhdGUubW92ZWQgPSB0cnVlXG4gIH1cbiAgc3RhdGUuZWwuc2Nyb2xsTGVmdCA9IHN0YXRlLnNjcm9sbExlZnQgLSBkeFxuICBzdGF0ZS5lbC5zY3JvbGxUb3AgPSBzdGF0ZS5zY3JvbGxUb3AgLSBkeVxuICByZXR1cm4gc3RhdGVcbn1cblxuLyoqIFx1NjJENlx1NjJGRFx1OEQ4NVx1OEZDN1x1OTYwOFx1NTAzQ1x1NTQwRVx1NTQxRVx1NjM4OVx1OTY4Rlx1NTQwRVx1NzY4NCBjbGlja1x1RkYwQ1x1OTA3Rlx1NTE0RFx1OEJFRlx1ODlFNlx1OERGM1x1OEY2QyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZENvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCByb290RWwpIHtcbiAgaWYgKCFzdGF0ZSB8fCAhc3RhdGUubW92ZWQgfHwgIXJvb3RFbCkgcmV0dXJuXG4gIGNvbnN0IHByZXZlbnRDbGljayA9IChldmVudCkgPT4ge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJvb3RFbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHByZXZlbnRDbGljaywgdHJ1ZSlcbiAgfVxuICByb290RWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwcmV2ZW50Q2xpY2ssIHRydWUpXG59XG5cbi8qKiBcdThCRTVcdTY1QjlcdTU0MTFcdTY2MkZcdTU0MjZcdThGRDhcdTgwRkRcdTdFRTdcdTdFRURcdTZFREEgKi9cbmV4cG9ydCBmdW5jdGlvbiBjYW5TY3JvbGxJbkRpcmVjdGlvbihlbCwgZGVsdGFYLCBkZWx0YVkpIHtcbiAgY29uc3QgZXBzID0gMVxuICBpZiAoZGVsdGFZKSB7XG4gICAgY29uc3QgbWF4WSA9IGVsLnNjcm9sbEhlaWdodCAtIGVsLmNsaWVudEhlaWdodFxuICAgIGlmIChtYXhZID4gZXBzKSB7XG4gICAgICBpZiAoZGVsdGFZIDwgMCAmJiBlbC5zY3JvbGxUb3AgPiBlcHMpIHJldHVybiB0cnVlXG4gICAgICBpZiAoZGVsdGFZID4gMCAmJiBlbC5zY3JvbGxUb3AgPCBtYXhZIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICBpZiAoZGVsdGFYKSB7XG4gICAgY29uc3QgbWF4WCA9IGVsLnNjcm9sbFdpZHRoIC0gZWwuY2xpZW50V2lkdGhcbiAgICBpZiAobWF4WCA+IGVwcykge1xuICAgICAgaWYgKGRlbHRhWCA8IDAgJiYgZWwuc2Nyb2xsTGVmdCA+IGVwcykgcmV0dXJuIHRydWVcbiAgICAgIGlmIChkZWx0YVggPiAwICYmIGVsLnNjcm9sbExlZnQgPCBtYXhYIC0gZXBzKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBcdTc1M0JcdTVFMDNcdTk1MDFcdTVCOUFcdTY1RjZcdTRFRkJcdTYxMEZcdTZFREFcdThGNkVcdTdGMjlcdTY1M0VcdUZGMUJcdTY3MkFcdTk1MDFcdTVCOUFcdTY1RjZcdTRFQzUgQ3RybC9NZXRhICsgXHU2RURBXHU4RjZFXG4gKlx1RkYwOFx1ODlFNlx1NjNBN1x1Njc3RiBwaW5jaCBcdTU3MjhcdTZENEZcdTg5QzhcdTU2NjhcdTkxQ0NcdTkwMUFcdTVFMzhcdTVFMjYgY3RybEtleVx1RkYwOVx1MzAwMlx1NjcyQVx1OTUwMVx1NUI5QVx1NjVGNlx1NjY2RVx1OTAxQVx1NkVEQVx1OEY2RVx1NzU1OVx1N0VEOVx1NUM0Rlx1NTE4NVx1NkVEQVx1NTJBOFx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkWm9vbU9uV2hlZWwoZXZlbnQsIHsgbG9ja2VkID0gZmFsc2UgfSA9IHt9KSB7XG4gIGlmIChsb2NrZWQpIHJldHVybiB0cnVlXG4gIHJldHVybiAhIShldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZlckVudHJ5SWQoc2NyZWVucykge1xuICByZXR1cm4gc2NyZWVucy5maW5kKChzY3JlZW4pID0+IHNjcmVlbi5lbnRyeSk/LmlkIHx8IG51bGxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlbW9TdGF0ZShzY3JlZW5zKSB7XG4gIGNvbnN0IGVudHJ5SWQgPSBpbmZlckVudHJ5SWQoc2NyZWVucylcbiAgaWYgKCFlbnRyeUlkKSB0aHJvdyBuZXcgRXJyb3IoJ0RlbW8gbW9kZSByZXF1aXJlcyBhdCBsZWFzdCBvbmUgZW50cnkgc2NyZWVuJylcbiAgcmV0dXJuIHtcbiAgICBlbnRyeUlkLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogZW50cnlJZCxcbiAgICBoaXN0b3J5OiBbXSxcbiAgICBob3RzcG90c1Zpc2libGU6IGZhbHNlLFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBuYXZpZ2F0ZURlbW8oc3RhdGUsIHRhcmdldElkLCBzY3JlZW5zKSB7XG4gIGlmICghc2NyZWVucy5zb21lKChzY3JlZW4pID0+IHNjcmVlbi5pZCA9PT0gdGFyZ2V0SWQpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBOYXZpZ2F0aW9uIHRhcmdldCBcIiR7dGFyZ2V0SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICB9XG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBzY3JlZW5zLmZpbmQoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpXG4gIGlmICghY3VycmVudFNjcmVlbi5saW5rcy5pbmNsdWRlcyh0YXJnZXRJZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNjcmVlbiBcIiR7c3RhdGUuY3VycmVudFNjcmVlbklkfVwiIGxpbmtzIGRvIG5vdCBpbmNsdWRlIFwiJHt0YXJnZXRJZH1cImApXG4gIH1cbiAgaWYgKHRhcmdldElkID09PSBzdGF0ZS5jdXJyZW50U2NyZWVuSWQpIHJldHVybiBzdGF0ZVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGN1cnJlbnRTY3JlZW5JZDogdGFyZ2V0SWQsXG4gICAgaGlzdG9yeTogWy4uLnN0YXRlLmhpc3RvcnksIHN0YXRlLmN1cnJlbnRTY3JlZW5JZF0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdERlbW9FbnRyeShzdGF0ZSwgZW50cnlJZCwgc2NyZWVucykge1xuICBjb25zdCBlbnRyeSA9IHNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGVudHJ5SWQpXG4gIGlmICghZW50cnkpIHRocm93IG5ldyBFcnJvcihgTmF2aWdhdGlvbiB0YXJnZXQgXCIke2VudHJ5SWR9XCIgZG9lcyBub3QgZXhpc3RgKVxuICByZXR1cm4ge1xuICAgIC4uLnN0YXRlLFxuICAgIGVudHJ5SWQsXG4gICAgY3VycmVudFNjcmVlbklkOiBlbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdvQmFja0RlbW8oc3RhdGUpIHtcbiAgaWYgKHN0YXRlLmhpc3RvcnkubGVuZ3RoID09PSAwKSByZXR1cm4gc3RhdGVcbiAgY29uc3QgaGlzdG9yeSA9IHN0YXRlLmhpc3Rvcnkuc2xpY2UoMCwgLTEpXG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5oaXN0b3J5W3N0YXRlLmhpc3RvcnkubGVuZ3RoIC0gMV0sXG4gICAgaGlzdG9yeSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzZXREZW1vKHN0YXRlKSB7XG4gIHJldHVybiB7XG4gICAgLi4uc3RhdGUsXG4gICAgY3VycmVudFNjcmVlbklkOiBzdGF0ZS5lbnRyeUlkLFxuICAgIGhpc3Rvcnk6IFtdLFxuICAgIGhvdHNwb3RzVmlzaWJsZTogZmFsc2UsXG4gIH1cbn1cbiIsICJleHBvcnQgY2xhc3MgRXJyb3JCb3VuZGFyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpXG4gICAgdGhpcy5zdGF0ZSA9IHsgZXJyb3I6IG51bGwgfVxuICB9XG5cbiAgc3RhdGljIGdldERlcml2ZWRTdGF0ZUZyb21FcnJvcihlcnJvcikge1xuICAgIHJldHVybiB7IGVycm9yIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZENhdGNoKGVycm9yLCBpbmZvKSB7XG4gICAgY29uc29sZS5lcnJvcihgW3dpcmVmcmFtZToke3RoaXMucHJvcHMuc2NvcGUgfHwgJ3Vua25vd24nfV1gLCBlcnJvciwgaW5mbylcbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2aW91c1Byb3BzKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IgJiYgcHJldmlvdXNQcm9wcy5yZXNldEtleSAhPT0gdGhpcy5wcm9wcy5yZXNldEtleSkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5lcnJvcikgcmV0dXJuIHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICBjb25zdCB7IHNjcmVlbklkLCBzb3VyY2UsIHNjb3BlIH0gPSB0aGlzLnByb3BzXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZXJyb3ItY2FyZFwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICA8c3Ryb25nPntzY29wZSA9PT0gJ3NjcmVlbicgPyBgU2NyZWVuOiAke3NjcmVlbklkfWAgOiAnQm9hcmQgZXJyb3InfTwvc3Ryb25nPlxuICAgICAgICB7c291cmNlID8gPHNwYW4+U291cmNlOiB7c291cmNlfTwvc3Bhbj4gOiBudWxsfVxuICAgICAgICA8c3Bhbj5NZXNzYWdlOiB7dGhpcy5zdGF0ZS5lcnJvci5tZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPHByZT57dGhpcy5zdGF0ZS5lcnJvci5zdGFja308L3ByZT5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufVxuIiwgImNvbnN0IFNjcmVlbklkZW50aXR5Q29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQobnVsbClcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbklkZW50aXR5UHJvdmlkZXIoeyBzY3JlZW5JZCwgY2hpbGRyZW4gfSkge1xuICBpZiAoIXNjcmVlbklkKSB0aHJvdyBuZXcgRXJyb3IoJ1NjcmVlbklkZW50aXR5UHJvdmlkZXIgcmVxdWlyZXMgc2NyZWVuSWQnKVxuICByZXR1cm4gKFxuICAgIDxTY3JlZW5JZGVudGl0eUNvbnRleHQuUHJvdmlkZXIgdmFsdWU9e3NjcmVlbklkfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1NjcmVlbklkZW50aXR5Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlU2NyZWVuSWQoKSB7XG4gIGNvbnN0IHNjcmVlbklkID0gUmVhY3QudXNlQ29udGV4dChTY3JlZW5JZGVudGl0eUNvbnRleHQpXG4gIGlmICghc2NyZWVuSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VzZVNjcmVlbklkIG11c3QgYmUgdXNlZCBpbnNpZGUgYSByZW5kZXJlZCBzY3JlZW4nKVxuICB9XG4gIHJldHVybiBzY3JlZW5JZFxufVxuIiwgIi8qKlxuICogXHU3MEVEXHU1MzNBXHU0RTBFXHU4REYzXHU4RjZDXHU3Njg0XHU1NTJGXHU0RTAwXHU1OTUxXHU3RUE2XHVGRjFBXHU1MTQzXHU3RDIwXHU1RTI2IGRhdGEtZmxvdy10byBcdTUzNzNcdTUzRUZcdTVCRkNcdTgyMkFcdTMwMDJcbiAqIFNjcmVlbkZyYW1lIFx1NTlENFx1NjI1OFx1NzBCOVx1NTFGQlx1NTE1Q1x1NUU5NVx1RkYwQ1x1OTA3Rlx1NTE0RFx1NEUxQVx1NTJBMVx1NTE5OVx1NjIxMFx1ODhGOCBzcGFuL2RpdiBcdTUzRUFcdTY3MDlcdTVDNUVcdTYwMjdcdTMwMDFcdTZDQTFcdTY3MDkgb25DbGlja1x1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gZmluZEZsb3dUYXJnZXRJZChzdGFydEVsLCByb290RWwpIHtcbiAgaWYgKCFzdGFydEVsIHx8IHR5cGVvZiBzdGFydEVsLmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHJldHVybiBudWxsXG4gIGNvbnN0IGVsID0gc3RhcnRFbC5jbG9zZXN0KCdbZGF0YS1mbG93LXRvXScpXG4gIGlmICghZWwpIHJldHVybiBudWxsXG4gIGlmIChyb290RWwgJiYgdHlwZW9mIHJvb3RFbC5jb250YWlucyA9PT0gJ2Z1bmN0aW9uJyAmJiAhcm9vdEVsLmNvbnRhaW5zKGVsKSkgcmV0dXJuIG51bGxcbiAgY29uc3QgdG8gPSBlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxvdy10bycpXG4gIHJldHVybiB0byB8fCBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVEZWxlZ2F0ZWRGbG93Q2xpY2soZXZlbnQsIHJvb3RFbCwgbmF2aWdhdGUpIHtcbiAgY29uc3QgdG8gPSBmaW5kRmxvd1RhcmdldElkKGV2ZW50Py50YXJnZXQsIHJvb3RFbClcbiAgaWYgKCF0bykgcmV0dXJuIGZhbHNlXG4gIGV2ZW50LnByZXZlbnREZWZhdWx0Py4oKVxuICBldmVudC5zdG9wUHJvcGFnYXRpb24/LigpXG4gIG5hdmlnYXRlKHRvKVxuICByZXR1cm4gdHJ1ZVxufVxuIiwgImNvbnN0IFRZUEVfTEFCRUxTID0ge1xuICBjb21tZW50OiAnXHU0RkVFXHU2NTM5XHU1RUZBXHU4QkFFJyxcbiAgdGV4dDogJ1x1NEZFRVx1NjUzOVx1NjU4N1x1NUI1NycsXG4gIG9yZGVyOiAnXHU4QzAzXHU2NTc0XHU5ODdBXHU1RThGJyxcbiAgcmVtb3ZlOiAnXHU1MjIwXHU5NjY0XHU4MjgyXHU3MEI5Jyxcbn1cblxuZnVuY3Rpb24gZXNjYXBlU2VsZWN0b3JUb2tlbih2YWx1ZSkge1xuICBpZiAoZ2xvYmFsVGhpcy5DU1M/LmVzY2FwZSkgcmV0dXJuIGdsb2JhbFRoaXMuQ1NTLmVzY2FwZShTdHJpbmcodmFsdWUpKVxuICByZXR1cm4gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9bXmEtekEtWjAtOV8tXS9nLCAoY2hhcikgPT4gYFxcXFwke2NoYXJ9YClcbn1cblxuZnVuY3Rpb24gZXNjYXBlQXR0cmlidXRlVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvXFxcXC9nLCAnXFxcXFxcXFwnKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJylcbn1cblxuZnVuY3Rpb24gY2xhc3Nlc09mKGVsZW1lbnQpIHtcbiAgaWYgKCFlbGVtZW50Py5jbGFzc0xpc3QpIHJldHVybiBbXVxuICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNsYXNzTGlzdCkuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0J1c2luZXNzQ2xhc3NOYW1lKG5hbWUpIHtcbiAgcmV0dXJuICEhbmFtZSAmJiAhbmFtZS5zdGFydHNXaXRoKCd3Zi0nKSAmJiAhbmFtZS5zdGFydHNXaXRoKCdpcy0nKVxufVxuXG5mdW5jdGlvbiBzZWxlY3RvclNjb3BlKHNjcmVlbklkKSB7XG4gIHJldHVybiBgW2RhdGEtc2NyZWVuLWlkPVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShzY3JlZW5JZCl9XCJdYFxufVxuXG5mdW5jdGlvbiBzZWxlY3RvcklzVW5pcXVlKHNjcmVlblJvb3QsIHNlbGVjdG9yKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHNjcmVlblJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikubGVuZ3RoID09PSAxXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGVsZW1lbnRTZWdtZW50KGVsZW1lbnQpIHtcbiAgY29uc3QgdGFnID0gKGVsZW1lbnQudGFnTmFtZSB8fCAnZGl2JykudG9Mb3dlckNhc2UoKVxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IGJ1c2luZXNzID0gY2xhc3Nlcy5maWx0ZXIoaXNCdXNpbmVzc0NsYXNzTmFtZSlcbiAgY29uc3QgdXNhYmxlID0gYnVzaW5lc3MubGVuZ3RoID4gMCA/IGJ1c2luZXNzIDogY2xhc3Nlcy5maWx0ZXIoKG5hbWUpID0+ICFuYW1lLnN0YXJ0c1dpdGgoJ2lzLScpKVxuICBjb25zdCBjbGFzc1BhcnQgPSB1c2FibGUuc2xpY2UoMCwgMikubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKVxuICBjb25zdCBrZXkgPSBlbGVtZW50LmdldEF0dHJpYnV0ZT8uKCdkYXRhLXdmLWtleScpXG4gIGNvbnN0IGtleVBhcnQgPSBrZXkgPyBgW2RhdGEtd2Yta2V5PVwiJHtlc2NhcGVBdHRyaWJ1dGVWYWx1ZShrZXkpfVwiXWAgOiAnJ1xuICByZXR1cm4gYCR7dGFnfSR7Y2xhc3NQYXJ0fSR7a2V5UGFydH1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBidWlsZFJldmlld1NlbGVjdG9yKGVsZW1lbnQsIGNvbnRlbnRSb290LCBzY3JlZW5JZCkge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW5JZCkgcmV0dXJuICcnXG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VzY2FwZVNlbGVjdG9yVG9rZW4oZWxlbWVudC5pZCl9YFxuXG4gIGNvbnN0IHNjb3BlID0gc2VsZWN0b3JTY29wZShzY3JlZW5JZClcbiAgY29uc3Qga2V5ID0gZWxlbWVudC5nZXRBdHRyaWJ1dGU/LignZGF0YS13Zi1rZXknKVxuICBjb25zdCBrZXlQYXJ0ID0ga2V5ID8gYFtkYXRhLXdmLWtleT1cIiR7ZXNjYXBlQXR0cmlidXRlVmFsdWUoa2V5KX1cIl1gIDogJydcbiAgY29uc3QgYnVzaW5lc3MgPSBjbGFzc2VzT2YoZWxlbWVudCkuZmlsdGVyKGlzQnVzaW5lc3NDbGFzc05hbWUpXG5cbiAgZm9yIChjb25zdCBuYW1lIG9mIGJ1c2luZXNzKSB7XG4gICAgY29uc3QgbG9jYWwgPSBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX0ke2tleVBhcnR9YFxuICAgIGlmIChzZWxlY3RvcklzVW5pcXVlKGNvbnRlbnRSb290LCBsb2NhbCkpIHJldHVybiBgJHtzY29wZX0gJHtsb2NhbH1gXG4gIH1cblxuICBpZiAoYnVzaW5lc3MubGVuZ3RoID4gMSkge1xuICAgIGNvbnN0IGxvY2FsID0gYnVzaW5lc3MubWFwKChuYW1lKSA9PiBgLiR7ZXNjYXBlU2VsZWN0b3JUb2tlbihuYW1lKX1gKS5qb2luKCcnKSArIGtleVBhcnRcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICB9XG5cbiAgY29uc3Qgc2VnbWVudHMgPSBbXVxuICBsZXQgY3VycmVudCA9IGVsZW1lbnRcbiAgd2hpbGUgKGN1cnJlbnQgJiYgY3VycmVudCAhPT0gY29udGVudFJvb3QpIHtcbiAgICBpZiAoY3VycmVudC5pZCkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdChgIyR7ZXNjYXBlU2VsZWN0b3JUb2tlbihjdXJyZW50LmlkKX1gKVxuICAgICAgYnJlYWtcbiAgICB9XG4gICAgbGV0IHNlZ21lbnQgPSBlbGVtZW50U2VnbWVudChjdXJyZW50KVxuICAgIGNvbnN0IHBhcmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgICAgY29uc3QgcGVlcnMgPSBBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKFxuICAgICAgICAoaXRlbSkgPT4gaXRlbS50YWdOYW1lID09PSBjdXJyZW50LnRhZ05hbWUgJiYgZWxlbWVudFNlZ21lbnQoaXRlbSkgPT09IHNlZ21lbnQsXG4gICAgICApXG4gICAgICBpZiAocGVlcnMubGVuZ3RoID4gMSkgc2VnbWVudCArPSBgOm50aC1vZi10eXBlKCR7cGVlcnMuaW5kZXhPZihjdXJyZW50KSArIDF9KWBcbiAgICB9XG4gICAgc2VnbWVudHMudW5zaGlmdChzZWdtZW50KVxuICAgIGNvbnN0IGxvY2FsID0gc2VnbWVudHMuam9pbignID4gJylcbiAgICBpZiAoc2VsZWN0b3JJc1VuaXF1ZShjb250ZW50Um9vdCwgbG9jYWwpKSByZXR1cm4gYCR7c2NvcGV9ICR7bG9jYWx9YFxuICAgIGN1cnJlbnQgPSBwYXJlbnRcbiAgfVxuXG4gIHJldHVybiBgJHtzY29wZX0gJHtzZWdtZW50cy5qb2luKCcgPiAnKSB8fCBlbGVtZW50U2VnbWVudChlbGVtZW50KX1gXG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlMYWJlbChlbGVtZW50KSB7XG4gIGlmIChlbGVtZW50LmlkKSByZXR1cm4gYCMke2VsZW1lbnQuaWR9YFxuICBjb25zdCBjbGFzc2VzID0gY2xhc3Nlc09mKGVsZW1lbnQpXG4gIGNvbnN0IHNlbWFudGljID0gY2xhc3Nlcy5maW5kKGlzQnVzaW5lc3NDbGFzc05hbWUpIHx8IGNsYXNzZXMuZmluZCgobmFtZSkgPT4gIW5hbWUuc3RhcnRzV2l0aCgnaXMtJykpXG4gIHJldHVybiBzZW1hbnRpYyA/IGAuJHtzZW1hbnRpY31gIDogKGVsZW1lbnQudGFnTmFtZSB8fCAnbm9kZScpLnRvTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gcmVhZFRleHQoZWxlbWVudCkge1xuICBjb25zdCB2YWx1ZSA9ICd2YWx1ZScgaW4gZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudC52YWx1ZSA9PT0gJ3N0cmluZydcbiAgICA/IGVsZW1lbnQudmFsdWVcbiAgICA6IGVsZW1lbnQudGV4dENvbnRlbnQgfHwgJydcbiAgY29uc3Qgbm9ybWFsaXplZCA9IHZhbHVlLnJlcGxhY2UoL1xccysvZywgJyAnKS50cmltKClcbiAgcmV0dXJuIG5vcm1hbGl6ZWQubGVuZ3RoID4gMjQwID8gYCR7bm9ybWFsaXplZC5zbGljZSgwLCAyMzcpfS4uLmAgOiBub3JtYWxpemVkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5kUmV2aWV3VGFyZ2V0KHRhcmdldCwgY29udGVudFJvb3QpIHtcbiAgbGV0IGN1cnJlbnQgPSB0YXJnZXQ/Lm5vZGVUeXBlID09PSAxID8gdGFyZ2V0IDogdGFyZ2V0Py5wYXJlbnRFbGVtZW50XG4gIHdoaWxlIChjdXJyZW50ICYmIGN1cnJlbnQgIT09IGNvbnRlbnRSb290KSB7XG4gICAgaWYgKGN1cnJlbnQuaWQgfHwgY2xhc3Nlc09mKGN1cnJlbnQpLmxlbmd0aCA+IDApIHJldHVybiBjdXJyZW50XG4gICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudFxuICB9XG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgY29udGVudFJvb3QsIHNjcmVlbikge1xuICBpZiAoIWVsZW1lbnQgfHwgIWNvbnRlbnRSb290IHx8ICFzY3JlZW4pIHJldHVybiBudWxsXG4gIGNvbnN0IGFuY2VzdG9ycyA9IFtdXG4gIGxldCBjdXJyZW50ID0gZWxlbWVudFxuICB3aGlsZSAoY3VycmVudCAmJiBjdXJyZW50ICE9PSBjb250ZW50Um9vdCkge1xuICAgIGFuY2VzdG9ycy51bnNoaWZ0KHtcbiAgICAgIGVsZW1lbnQ6IGN1cnJlbnQsXG4gICAgICBsYWJlbDogZGlzcGxheUxhYmVsKGN1cnJlbnQpLFxuICAgICAgc2VsZWN0b3I6IGJ1aWxkUmV2aWV3U2VsZWN0b3IoY3VycmVudCwgY29udGVudFJvb3QsIHNjcmVlbi5pZCksXG4gICAgfSlcbiAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGVsZW1lbnQsXG4gICAgY29udGVudFJvb3QsXG4gICAgc2NyZWVuSWQ6IHNjcmVlbi5pZCxcbiAgICBzY3JlZW5UaXRsZTogc2NyZWVuLnRpdGxlLFxuICAgIHNvdXJjZUhpbnQ6IGBzcmMvc2NyZWVucy8ke3NjcmVlbi5pZH0uanN4YCxcbiAgICBzZWxlY3RvcjogYnVpbGRSZXZpZXdTZWxlY3RvcihlbGVtZW50LCBjb250ZW50Um9vdCwgc2NyZWVuLmlkKSxcbiAgICB0YWdOYW1lOiAoZWxlbWVudC50YWdOYW1lIHx8ICcnKS50b0xvd2VyQ2FzZSgpLFxuICAgIGNsYXNzTmFtZXM6IGNsYXNzZXNPZihlbGVtZW50KSxcbiAgICBjdXJyZW50VGV4dDogcmVhZFRleHQoZWxlbWVudCksXG4gICAgYW5jZXN0b3JzLFxuICB9XG59XG5cbmZ1bmN0aW9uIGl0ZW1SZXF1ZXN0KGl0ZW0pIHtcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gYFx1NEZFRVx1NjUzOVx1NEUzQVx1RkYxQSR7aXRlbS5pbnN0cnVjdGlvbn1gXG4gIGlmIChpdGVtLnR5cGUgPT09ICdvcmRlcicpIHJldHVybiBgXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9ufWBcbiAgaWYgKGl0ZW0udHlwZSA9PT0gJ3JlbW92ZScpIHJldHVybiBgXHU1MjIwXHU5NjY0XHU4OTgxXHU2QzQyXHVGRjFBJHtpdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfWBcbiAgcmV0dXJuIGl0ZW0uaW5zdHJ1Y3Rpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJldmlld1RhcmdldHMoaXRlbSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShpdGVtPy50YXJnZXRzKSAmJiBpdGVtLnRhcmdldHMubGVuZ3RoID4gMCkgcmV0dXJuIGl0ZW0udGFyZ2V0c1xuICBpZiAoIWl0ZW0/LnNlbGVjdG9yKSByZXR1cm4gW11cbiAgcmV0dXJuIFt7XG4gICAgc2NyZWVuSWQ6IGl0ZW0uc2NyZWVuSWQsXG4gICAgc2NyZWVuVGl0bGU6IGl0ZW0uc2NyZWVuVGl0bGUsXG4gICAgc291cmNlSGludDogaXRlbS5zb3VyY2VIaW50LFxuICAgIHNlbGVjdG9yOiBpdGVtLnNlbGVjdG9yLFxuICAgIGN1cnJlbnRUZXh0OiBpdGVtLmN1cnJlbnRUZXh0LFxuICB9XVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpIHtcbiAgY29uc3QgcHJvamVjdE5hbWUgPSBwcm9qZWN0Py5uYW1lIHx8ICdcdTY3MkFcdTU0N0RcdTU0MERcdTdFQkZcdTY4NDZcdTUzOUZcdTU3OEInXG5cbiAgY29uc3QgbGluZXMgPSBbXG4gICAgYFx1OEJGN1x1NEZFRVx1NjUzOVx1N0VCRlx1Njg0Nlx1NTM5Rlx1NTc4Qlx1MzAwQyR7cHJvamVjdE5hbWV9XHUzMDBEXHUzMDAyYCxcbiAgICAnJyxcbiAgICAnXHU0RkVFXHU2NTM5XHU3RUE2XHU2NzVGXHVGRjFBJyxcbiAgICAnLSBcdTUzRUFcdTRGRUVcdTY1MzlcdTRFMUFcdTUyQTEgc3JjL1x1RkYxQlx1NEUwRFx1ODk4MVx1NEZFRVx1NjUzOSBmcmFtZXdvcmsvIFx1NjIxNiBkaXN0L2FwcC5qc1x1MzAwMicsXG4gICAgJy0gXHU5MDFBXHU4RkM3IERPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdTU3MjggSlNYIFx1NEUyRFx1NjQxQ1x1N0QyMlx1NUJGOVx1NUU5NFx1NzY4NCBpZFx1MzAwMWNsYXNzTmFtZSBcdTYyMTYgZGF0YS13Zi1rZXlcdTMwMDInLFxuICAgICctIFx1NEZERFx1NzU1OVx1NjI0MFx1NjcwOVx1OEJFRFx1NEU0OSBjbGFzc1x1MzAwMVx1NTE3M1x1OTUyRVx1ODI4Mlx1NzBCOSBpZCBcdTU0OENcdTkxQ0RcdTU5MERcdTY1NzBcdTYzNkVcdTgyODJcdTcwQjlcdTc2ODQgZGF0YS13Zi1rZXlcdUZGMUJcdTY1QjBcdTU4OUVcdTgyODJcdTcwQjlcdTRFNUZcdTkwNzVcdTVCODhcdTU0MENcdTRFMDBcdTU0N0RcdTU0MERcdTg5QzRcdTUyMTlcdTMwMDInLFxuICAgICctIFx1NEZFRVx1NjUzOSBzY3JlZW5zL2xheW91dHMgXHU2NUY2XHU0RkREXHU3NTU5XHUzMDBDXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFXHUzMDBEXHVGRjBDXHU1RTc2XHU2MjhBXHUzMDBDXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFXHUzMDBEXHU1M0NBIEB3aXJlZnJhbWUtc2tpbGwgXHU2NkY0XHU2NUIwXHU0RTNBXHU1RjUzXHU1MjREIHNraWxsIFx1NzI0OFx1NjcyQ1x1MzAwMicsXG4gICAgJy0gXHU0RkREXHU2MzAxIHByb2plY3QubGlua3MgXHU0RTNBXHU5ODc1XHU5NzYyXHU2RDQxXHU3Njg0XHU1NTJGXHU0RTAwXHU4RkI5XHU2NTcwXHU2MzZFXHVGRjFCXHU1QjhDXHU2MjEwXHU1NDBFXHU5MUNEXHU2NUIwXHU2Nzg0XHU1RUZBXHU1RTc2XHU5QThDXHU4QkMxXHU3NTNCXHU2NzdGXHUzMDAxXHU2RjE0XHU3OTNBXHU1NDhDXHU0RkVFXHU2NTM5XHU2QTIxXHU1RjBGXHUzMDAyJyxcbiAgXVxuXG4gIGlmICghaXRlbXM/Lmxlbmd0aCkge1xuICAgIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTZDQTFcdTY3MDlcdTRGRUVcdTY1MzlcdTYxMEZcdTg5QzFcdTMwMDInKVxuICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKVxuICB9XG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0cyA9IHJldmlld1RhcmdldHMoaXRlbSlcbiAgICBsaW5lcy5wdXNoKCcnLCBgIyMgXHU0RkVFXHU2NTM5ICR7aXRlbUluZGV4ICsgMX1cdUZGMUEke1RZUEVfTEFCRUxTW2l0ZW0udHlwZV0gfHwgVFlQRV9MQUJFTFMuY29tbWVudH1gKVxuICAgIHRhcmdldHMuZm9yRWFjaCgodGFyZ2V0LCB0YXJnZXRJbmRleCkgPT4ge1xuICAgICAgY29uc3Qgc2NyZWVuSWQgPSB0YXJnZXQuc2NyZWVuSWQgfHwgaXRlbS5zY3JlZW5JZFxuICAgICAgbGluZXMucHVzaChcbiAgICAgICAgJycsXG4gICAgICAgIGBcdTc2RUVcdTY4MDcgJHt0YXJnZXRJbmRleCArIDF9XHVGRjFBJHt0YXJnZXQuc2NyZWVuVGl0bGUgfHwgaXRlbS5zY3JlZW5UaXRsZSB8fCBzY3JlZW5JZCB8fCAnXHU2NzJBXHU1NDdEXHU1NDBEXHU5ODc1XHU5NzYyJ31gLFxuICAgICAgICBgXHU5ODc1XHU5NzYyIElEXHVGRjFBJHtzY3JlZW5JZCB8fCAnXHU2NzJBXHU3N0U1J31gLFxuICAgICAgICBgXHU2RTkwXHU3ODAxXHU2M0QwXHU3OTNBXHVGRjFBJHt0YXJnZXQuc291cmNlSGludCB8fCBpdGVtLnNvdXJjZUhpbnQgfHwgKHNjcmVlbklkID8gYHNyYy9zY3JlZW5zLyR7c2NyZWVuSWR9LmpzeGAgOiAnXHU4QkY3XHU2NDFDXHU3RDIyXHU5MDA5XHU2MkU5XHU1NjY4Jyl9YCxcbiAgICAgICAgJ0RPTSBcdTkwMDlcdTYyRTlcdTU2NjhcdUZGMUEnLFxuICAgICAgICBgXFxgJHt0YXJnZXQuc2VsZWN0b3J9XFxgYCxcbiAgICAgIClcbiAgICAgIGlmICh0YXJnZXQuY3VycmVudFRleHQpIGxpbmVzLnB1c2goJycsICdcdTVGNTNcdTUyNERcdTUxODVcdTVCQjlcdUZGMUEnLCB0YXJnZXQuY3VycmVudFRleHQpXG4gICAgfSlcbiAgICBsaW5lcy5wdXNoKCcnLCAnXHU0RkVFXHU2NTM5XHU4OTgxXHU2QzQyXHVGRjFBJywgaXRlbVJlcXVlc3QoaXRlbSkpXG4gIH0pXG5cbiAgbGluZXMucHVzaChcbiAgICAnJyxcbiAgICAnIyMgXHU1QjhDXHU2MjEwXHU2ODA3XHU1MUM2JyxcbiAgICAnLSBcdTkwMTBcdTk4NzlcdTVCOENcdTYyMTBcdTRFRTVcdTRFMEFcdTRGRUVcdTY1MzlcdUZGMUJcdTgyRTVcdTkwMDlcdTYyRTlcdTU2NjhcdTVCRjlcdTVFOTRcdTUxNzFcdTRFQUIgbGF5b3V0XHVGRjBDXHU4QkY3XHU0RkVFXHU2NTM5XHU3NzFGXHU1QjlFXHU1QjlBXHU0RTQ5XHU0RjREXHU3RjZFXHVGRjBDXHU0RTBEXHU4OTgxXHU1NzI4IHNjcmVlbiBcdTRFMkRcdTU5MERcdTUyMzZcdTVCOUVcdTczQjBcdTMwMDInLFxuICAgICctIFx1NEUwRFx1NzUyOCBET00gXHU1QzQyXHU3RUE3XHU2MjE2IG50aC1jaGlsZCBcdTY2RkZcdTRFRTNcdTVERjJcdTY3MDlcdTc2ODRcdTdBMzNcdTVCOUFcdTRFMUFcdTUyQTFcdTkwMDlcdTYyRTlcdTU2NjhcdTMwMDInLFxuICAgICctIFx1Njc4NFx1NUVGQVx1NjIxMFx1NTI5Rlx1NTQwRVx1NjhDMFx1NjdFNVx1NTNEN1x1NUY3MVx1NTRDRFx1OTg3NVx1OTc2Mlx1NTNDQVx1NTE3Nlx1NEUwQVx1NEUwQlx1NkUzOFx1OERGM1x1OEY2Q1x1MzAwMicsXG4gIClcbiAgcmV0dXJuIGxpbmVzLmpvaW4oJ1xcbicpXG59XG5cbmV4cG9ydCBjb25zdCBSRVZJRVdfVFlQRV9MQUJFTFMgPSBUWVBFX0xBQkVMU1xuIiwgImltcG9ydCB7IGlzU2Nyb2xsYWJsZU92ZXJmbG93IH0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuXG5jb25zdCBTVFlMRV9LRVlTID0gW1xuICAnd2lkdGgnLFxuICAnaGVpZ2h0JyxcbiAgJ21pbldpZHRoJyxcbiAgJ21pbkhlaWdodCcsXG4gICdvdmVyZmxvdycsXG4gICdvdmVyZmxvd1gnLFxuICAnb3ZlcmZsb3dZJyxcbiAgJ21heFdpZHRoJyxcbiAgJ21heEhlaWdodCcsXG5dXG5cbi8qKiBcdTgyODJcdTcwQjlcdTVGNTNcdTUyNERcdTY2MkZcdTU0MjZcdTU2RTAgb3ZlcmZsb3cgXHU0RUE3XHU3NTFGXHU1M0VGXHU2RURBXHU1MkE4XHU2RUEyXHU1MUZBICovXG5leHBvcnQgZnVuY3Rpb24gaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKGVsKSB7XG4gIGlmICghZWwgfHwgZWwubm9kZVR5cGUgIT09IDEpIHJldHVybiBmYWxzZVxuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBjYW5ZID0gaXNTY3JvbGxhYmxlT3ZlcmZsb3coc3R5bGUub3ZlcmZsb3dZKSAmJiBlbC5zY3JvbGxIZWlnaHQgPiBlbC5jbGllbnRIZWlnaHQgKyAxXG4gIGNvbnN0IGNhblggPSBpc1Njcm9sbGFibGVPdmVyZmxvdyhzdHlsZS5vdmVyZmxvd1gpICYmIGVsLnNjcm9sbFdpZHRoID4gZWwuY2xpZW50V2lkdGggKyAxXG4gIHJldHVybiBjYW5ZIHx8IGNhblhcbn1cblxuZnVuY3Rpb24gZGVwdGhGcm9tKHJvb3RFbCwgZWwpIHtcbiAgbGV0IGRlcHRoID0gMFxuICBsZXQgbm9kZSA9IGVsXG4gIHdoaWxlIChub2RlICYmIG5vZGUgIT09IHJvb3RFbCkge1xuICAgIGRlcHRoICs9IDFcbiAgICBub2RlID0gbm9kZS5wYXJlbnRFbGVtZW50XG4gIH1cbiAgcmV0dXJuIGRlcHRoXG59XG5cbi8qKlxuICogXHU2NTM2XHU5NkM2XHU5NzAwXHU2NDkxXHU1RjAwXHU3Njg0XHU4MjgyXHU3MEI5XHVGRjFBXHU1M0VGXHU2RURBXHU1MkE4XHU4MjgyXHU3MEI5ICsgXHU0RTBBXHU2RUFGXHU1MjMwIHJvb3QgXHU3Njg0XHU3OTU2XHU1MTQ4XHUzMDAyXG4gKiBcdTZERjFcdTgyODJcdTcwQjlcdTU3MjhcdTUyNERcdUZGMENcdTUxNDhcdTY0OTFcdTUxODVcdTVDNDJcdTUxOERcdTY0OTFcdTU5MTZcdTU4RjNcdUZGMDhcdTkwN0ZcdTUxNEQgZ3JpZCAvIHdpZHRoOjEwMCUgXHU2MjhBXHU1OTE2XHU2ODQ2XHU1MzYxXHU2QjdCXHVGRjA5XHUzMDAyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaXN0RXhwYW5kYWJsZU5vZGVzKHJvb3RFbCkge1xuICBpZiAoIXJvb3RFbCkgcmV0dXJuIFtdXG4gIGNvbnN0IHNjcm9sbGFibGVzID0gW11cbiAgY29uc3QgdmlzaXQgPSAobm9kZSkgPT4ge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbiA/IEFycmF5LmZyb20obm9kZS5jaGlsZHJlbikgOiBbXVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHZpc2l0KGNoaWxkKVxuICAgIGlmIChub2RlID09PSByb290RWwgfHwgaXNFeHBhbmRhYmxlT3ZlcmZsb3dOb2RlKG5vZGUpKSBzY3JvbGxhYmxlcy5wdXNoKG5vZGUpXG4gIH1cbiAgdmlzaXQocm9vdEVsKVxuXG4gIGNvbnN0IHNldCA9IG5ldyBTZXQoc2Nyb2xsYWJsZXMpXG4gIGZvciAoY29uc3QgZWwgb2Ygc2Nyb2xsYWJsZXMpIHtcbiAgICAvLyByb290IFx1NjcyQ1x1OEVBQlx1NURGMlx1NTcyOFx1OTZDNlx1NTQwOFx1NEUyRFx1RkYxQlx1NEVDRVx1NUI4M1x1NzY4NFx1NzIzNlx1ODI4Mlx1NzBCOVx1N0VFN1x1N0VFRFx1NEUwQVx1NkVBRlx1NEYxQVx1OEQ4QVx1OEZDNyBzY3JlZW4gXHU4RkI5XHU3NTRDXHVGRjBDXG4gICAgLy8gXHU2MjhBIFNjcmVlbkZyYW1lXHUzMDAxY2FudmFzXHUzMDAxYm9hcmQgXHU3NTFBXHU4MUYzIGJvZHkvaHRtbCBcdTRFMDBcdTVFNzZcdTY1MzlcdTUxOTlcdTMwMDJcbiAgICBpZiAoZWwgPT09IHJvb3RFbCkgY29udGludWVcbiAgICBsZXQgbm9kZSA9IGVsLnBhcmVudEVsZW1lbnRcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgc2V0LmFkZChub2RlKVxuICAgICAgaWYgKG5vZGUgPT09IHJvb3RFbCkgYnJlYWtcbiAgICAgIG5vZGUgPSBub2RlLnBhcmVudEVsZW1lbnRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gWy4uLnNldF0uc29ydCgoYSwgYikgPT4gZGVwdGhGcm9tKHJvb3RFbCwgYikgLSBkZXB0aEZyb20ocm9vdEVsLCBhKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNuYXBzaG90SW5saW5lQm94KGVsKSB7XG4gIGNvbnN0IG91dCA9IHt9XG4gIGZvciAoY29uc3Qga2V5IG9mIFNUWUxFX0tFWVMpIG91dFtrZXldID0gZWwuc3R5bGVba2V5XSB8fCAnJ1xuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlSW5saW5lQm94KGVsLCBzbmFwc2hvdCkge1xuICBmb3IgKGNvbnN0IGtleSBvZiBTVFlMRV9LRVlTKSB7XG4gICAgZWwuc3R5bGVba2V5XSA9IHNuYXBzaG90W2tleV0gfHwgJydcbiAgfVxufVxuXG4vKipcbiAqIG9mZnNldFRvcCAvIG9mZnNldExlZnQgXHU3NkY4XHU1QkY5IG9mZnNldFBhcmVudFx1RkYwQ1x1ODAwQ1x1NEUwRFx1NEUwMFx1NUI5QVx1NzZGOFx1NUJGOVx1NzZGNFx1NjNBNVx1NzIzNlx1ODI4Mlx1NzBCOVx1MzAwMlxuICogXHU1NDBFXHU1M0YwXHU5ODc1XHU5MUNDXHU4RkRFXHU3RUVEXHU3Njg0IHN0YXRpYyBcdTVCQjlcdTU2NjhcdTkwMUFcdTVFMzhcdTUxNzFcdTRFQUIgc2NyZWVuIHJvb3QgXHU0RjVDXHU0RTNBIG9mZnNldFBhcmVudFx1RkYwQ1xuICogXHU1NkUwXHU2QjY0XHU5NzAwXHU4OTgxXHU1MTQ4XHU2MzYyXHU3Qjk3XHU1MjMwXHU1RjUzXHU1MjREXHU3MjM2XHU4MjgyXHU3MEI5XHU1NzUwXHU2ODA3XHVGRjBDXHU5MDdGXHU1MTREXHU5MDEwXHU1QzQyXHU5MUNEXHU1OTBEXHU3RDJGXHU1MkEwXHU1NDBDXHU0RTAwXHU2QkI1XHU1MDRGXHU3OUZCXHUzMDAyXG4gKi9cbmZ1bmN0aW9uIGNoaWxkU3RhcnRXaXRoaW4oZWwsIGNoaWxkLCBheGlzKSB7XG4gIGNvbnN0IG9mZnNldEtleSA9IGF4aXMgPT09ICd4JyA/ICdvZmZzZXRMZWZ0JyA6ICdvZmZzZXRUb3AnXG4gIGNvbnN0IHJlY3RTdGFydCA9IGF4aXMgPT09ICd4JyA/ICdsZWZ0JyA6ICd0b3AnXG4gIGNvbnN0IHJlY3RTaXplID0gYXhpcyA9PT0gJ3gnID8gJ3dpZHRoJyA6ICdoZWlnaHQnXG4gIGNvbnN0IGxheW91dFNpemUgPSBheGlzID09PSAneCcgPyAnb2Zmc2V0V2lkdGgnIDogJ29mZnNldEhlaWdodCdcbiAgY29uc3Qgc2Nyb2xsS2V5ID0gYXhpcyA9PT0gJ3gnID8gJ3Njcm9sbExlZnQnIDogJ3Njcm9sbFRvcCdcbiAgY29uc3QgY2hpbGRPZmZzZXQgPSBjaGlsZFtvZmZzZXRLZXldIHx8IDBcblxuICBpZiAoY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbCkgcmV0dXJuIGNoaWxkT2Zmc2V0XG4gIGlmIChjaGlsZC5vZmZzZXRQYXJlbnQgJiYgY2hpbGQub2Zmc2V0UGFyZW50ID09PSBlbC5vZmZzZXRQYXJlbnQpIHtcbiAgICByZXR1cm4gY2hpbGRPZmZzZXQgLSAoZWxbb2Zmc2V0S2V5XSB8fCAwKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgcGFyZW50UmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgY29uc3QgY2hpbGRSZWN0ID0gY2hpbGQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBjb25zdCByZW5kZXJlZFNpemUgPSBwYXJlbnRSZWN0W3JlY3RTaXplXVxuICAgIGNvbnN0IHNjYWxlID0gZWxbbGF5b3V0U2l6ZV0gPiAwICYmIHJlbmRlcmVkU2l6ZSA+IDBcbiAgICAgID8gcmVuZGVyZWRTaXplIC8gZWxbbGF5b3V0U2l6ZV1cbiAgICAgIDogMVxuICAgIGNvbnN0IHN0YXJ0ID0gKGNoaWxkUmVjdFtyZWN0U3RhcnRdIC0gcGFyZW50UmVjdFtyZWN0U3RhcnRdKSAvIHNjYWxlXG4gICAgICArIChlbFtzY3JvbGxLZXldIHx8IDApXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShzdGFydCkpIHJldHVybiBzdGFydFxuICB9XG5cbiAgcmV0dXJuIGNoaWxkT2Zmc2V0XG59XG5cbi8qKlxuICogb3ZlcmZsb3c6dmlzaWJsZSBcdTY1RjZcdTkwRThcdTUyMDZcdTZENEZcdTg5QzhcdTU2Njggc2Nyb2xsV2lkdGggXHUyMjQ4IGNsaWVudFdpZHRoXHVGRjBDXG4gKiBcdTYyNDBcdTRFRTVcdTUxOERcdTYyNkJcdTVCNTBcdTgyODJcdTcwQjkgb2Zmc2V0IFx1OEZCOVx1NzU0Q1x1RkYwQ1x1OTA3Rlx1NTE0RFx1NUJCRFx1ODg2OFx1NjQ5MVx1NEUwRFx1NUYwMFx1NTkxNlx1Njg0Nlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gbWVhc3VyZUludHJpbnNpY0JveChlbCkge1xuICBsZXQgd2lkdGggPSBNYXRoLm1heChlbC5zY3JvbGxXaWR0aCB8fCAwLCBlbC5vZmZzZXRXaWR0aCB8fCAwKVxuICBsZXQgaGVpZ2h0ID0gTWF0aC5tYXgoZWwuc2Nyb2xsSGVpZ2h0IHx8IDAsIGVsLm9mZnNldEhlaWdodCB8fCAwKVxuICBjb25zdCBjaGlsZHJlbiA9IGVsLmNoaWxkcmVuID8gQXJyYXkuZnJvbShlbC5jaGlsZHJlbikgOiBbXVxuICBmb3IgKGNvbnN0IGNoaWxkIG9mIGNoaWxkcmVuKSB7XG4gICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgY2hpbGRTdGFydFdpdGhpbihlbCwgY2hpbGQsICd4JykgKyAoY2hpbGQub2Zmc2V0V2lkdGggfHwgMCkpXG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBjaGlsZFN0YXJ0V2l0aGluKGVsLCBjaGlsZCwgJ3knKSArIChjaGlsZC5vZmZzZXRIZWlnaHQgfHwgMCkpXG4gIH1cbiAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUV4cGFuZGVkQm94KGVsKSB7XG4gIGVsLnN0eWxlLm1heFdpZHRoID0gJ25vbmUnXG4gIGVsLnN0eWxlLm1heEhlaWdodCA9ICdub25lJ1xuICBlbC5zdHlsZS5vdmVyZmxvdyA9ICd2aXNpYmxlJ1xuICBlbC5zdHlsZS5vdmVyZmxvd1ggPSAndmlzaWJsZSdcbiAgZWwuc3R5bGUub3ZlcmZsb3dZID0gJ3Zpc2libGUnXG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gbWVhc3VyZUludHJpbnNpY0JveChlbClcbiAgZWwuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgZWwuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICBlbC5zdHlsZS5taW5XaWR0aCA9IGAke3dpZHRofXB4YFxuICBlbC5zdHlsZS5taW5IZWlnaHQgPSBgJHtoZWlnaHR9cHhgXG59XG5cbi8qKiBcdTY0OTFcdTVGMDAgcm9vdCBcdTUxODVcdTYyNDBcdTY3MDlcdTUzRUZcdTZFREFcdTUyQThcdTUzM0FcdTU3REZcdTUzQ0FcdTUxNzZcdTc5NTZcdTUxNDhcdUZGMUJcdThGRDRcdTU2REVcdTc1MjhcdTRFOEVcdTY1MzZcdThENzdcdTc2ODRcdTVGRUJcdTcxNjdcdTUyMTdcdTg4NjggKi9cbmV4cG9ydCBmdW5jdGlvbiBleHBhbmRTY3JlZW5Db250ZW50KHJvb3RFbCkge1xuICBjb25zdCBub2RlcyA9IGxpc3RFeHBhbmRhYmxlTm9kZXMocm9vdEVsKVxuICBjb25zdCBzbmFwc2hvdHMgPSBub2Rlcy5tYXAoKGVsKSA9PiAoeyBlbCwgc3R5bGU6IHNuYXBzaG90SW5saW5lQm94KGVsKSB9KSlcbiAgZm9yIChjb25zdCB7IGVsIH0gb2Ygc25hcHNob3RzKSBhcHBseUV4cGFuZGVkQm94KGVsKVxuICAvLyBcdTVCNTBcdTdFQTdcdTY0OTFcdTVGMDBcdTU0MEVcdUZGMENcdTY4MzlcdTUxOERcdTkxQ0ZcdTRFMDBcdTZCMjFcdUZGMENcdTU0MDNcdTYzODlcdTZCOEJcdTRGNTlcdTZFQTJcdTUxRkFcbiAgYXBwbHlFeHBhbmRlZEJveChyb290RWwpXG4gIHJldHVybiBzbmFwc2hvdHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxhcHNlU2NyZWVuQ29udGVudChzbmFwc2hvdHMpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KHNuYXBzaG90cykpIHJldHVyblxuICBmb3IgKGNvbnN0IHsgZWwsIHN0eWxlIH0gb2Ygc25hcHNob3RzKSByZXN0b3JlSW5saW5lQm94KGVsLCBzdHlsZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lYXN1cmVDb250ZW50Qm94KHJvb3RFbCkge1xuICByZXR1cm4gbWVhc3VyZUludHJpbnNpY0JveChyb290RWwpXG59XG5cbi8qKlxuICogXHU1REU1XHU1MTc3XHU2ODBGXHU1QzU1XHU1RjAwL1x1NjUzNlx1OEQ3N1x1NzZFRVx1NjgwN1x1RkYxQVxuICogXHU2NzA5XHU1MkZFXHU5MDA5IFx1MjE5MiBcdTUyRkVcdTkwMDlcdTk2QzZcdTU0MDhcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDkgXHUyMTkyIFx1NTE2OFx1OTBFOFx1NUM0Rlx1MzAwMlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUV4cGFuZFRhcmdldHMoc2VsZWN0ZWRJZHMsIGFsbElkcykge1xuICBpZiAoc2VsZWN0ZWRJZHMgaW5zdGFuY2VvZiBTZXQpIHtcbiAgICBpZiAoc2VsZWN0ZWRJZHMuc2l6ZSA+IDApIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWxlY3RlZElkcykgJiYgc2VsZWN0ZWRJZHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBbLi4uc2VsZWN0ZWRJZHNdXG4gIH1cbiAgcmV0dXJuIFsuLi5hbGxJZHNdXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi9jb3JlL0Vycm9yQm91bmRhcnkuanN4J1xuaW1wb3J0IHsgU2NyZWVuSWRlbnRpdHlQcm92aWRlciB9IGZyb20gJy4uL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuaW1wb3J0IHsgaGFuZGxlRGVsZWdhdGVkRmxvd0NsaWNrIH0gZnJvbSAnLi4vdWkvZmxvdy10YXJnZXQuanMnXG5pbXBvcnQgeyBmaW5kUmV2aWV3VGFyZ2V0IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQge1xuICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQsXG4gIGV4cGFuZFNjcmVlbkNvbnRlbnQsXG4gIG1lYXN1cmVDb250ZW50Qm94LFxufSBmcm9tICcuL2V4cGFuZC5qcydcbmltcG9ydCB7XG4gIGJlZ2luQ29udGVudERyYWdTY3JvbGwsXG4gIGVuZENvbnRlbnREcmFnU2Nyb2xsLFxuICBtb3ZlQ29udGVudERyYWdTY3JvbGwsXG59IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFNjcmVlbkZyYW1lKHtcbiAgc2NyZWVuLFxuICB2aWV3cG9ydCxcbiAgbW9kZSxcbiAgaW5kZXggPSAwLFxuICBmb2N1c2VkID0gZmFsc2UsXG4gIG9uRXhwb3J0LFxuICBleHBhbmRlZCA9IGZhbHNlLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgY2FudmFzTG9ja2VkID0gZmFsc2UsXG4gIHNjYWxlID0gMSxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgY29udGVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGV4cGFuZFNuYXBzaG90UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyUmV2aWV3RWxlbWVudFJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbZHJhZ1Njcm9sbGluZywgc2V0RHJhZ1Njcm9sbGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkQm94LCBzZXRFeHBhbmRlZEJveF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgcm9vdCA9IGNvbnRlbnRSZWYuY3VycmVudFxuICAgIGlmICghcm9vdCB8fCAhc2NyZWVuKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgY29sbGFwc2VTY3JlZW5Db250ZW50KGV4cGFuZFNuYXBzaG90UmVmLmN1cnJlbnQpXG4gICAgICBleHBhbmRTbmFwc2hvdFJlZi5jdXJyZW50ID0gbnVsbFxuICAgIH1cblxuICAgIGlmICghZXhwYW5kZWQpIHtcbiAgICAgIHNldEV4cGFuZGVkQm94KG51bGwpXG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IGV4cGFuZFNjcmVlbkNvbnRlbnQocm9vdClcbiAgICBzZXRFeHBhbmRlZEJveChtZWFzdXJlQ29udGVudEJveChyb290KSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpZiAoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCkge1xuICAgICAgICBjb2xsYXBzZVNjcmVlbkNvbnRlbnQoZXhwYW5kU25hcHNob3RSZWYuY3VycmVudClcbiAgICAgICAgZXhwYW5kU25hcHNob3RSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtleHBhbmRlZCwgc2NyZWVuPy5pZCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQgPSBudWxsXG4gICAgfVxuICB9LCBbY2FudmFzTG9ja2VkLCByZXZpZXdFbmFibGVkLCBzY3JlZW4/LmlkXSlcblxuICBpZiAoIXNjcmVlbikgcmV0dXJuIG51bGxcblxuICBjb25zdCBDb21wb25lbnQgPSBzY3JlZW4uY29tcG9uZW50XG4gIGNvbnN0IGZyYW1lQ2xhc3MgPSBbXG4gICAgJ3dmLXNjcmVlbi1jaHJvbWUnLFxuICAgIG1vZGUgPT09ICdjYW52YXMnICYmIGZvY3VzZWQgPyAnaXMtZm9jdXNlZCcgOiAnJyxcbiAgICBleHBhbmRlZCA/ICdpcy1leHBhbmRlZCcgOiAnJyxcbiAgICBgd2Ytc2NyZWVuLSR7bW9kZX1gLFxuICBdLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJylcblxuICBjb25zdCBvblBvaW50ZXJEb3duID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIC8vIFx1NzUzQlx1NUUwM1x1OTUwMVx1NUI5QVx1NjVGNlx1NEUwRFx1NjNBNVx1N0JBMVx1NUM0Rlx1NTE4NVx1NjJENlx1NjJGRFx1NkVEQVx1NTJBOFx1RkYwQ1x1OEJBOVx1NEU4Qlx1NEVGNlx1ODQzRFx1NTIzMFx1NzUzQlx1NUUwM1x1NUU3M1x1NzlGQlxuICAgIGlmIChjYW52YXNMb2NrZWQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBcdTVERjJcdTVDNTVcdTVGMDBcdTY1RTBcdTUzRUZcdTZFREFcdTUzM0FcdTU3REZcdUZGMENcdTRFMERcdTYyQTJcdTYzMDdcdTk0ODhcbiAgICBpZiAoZXhwYW5kZWQpIHJldHVyblxuICAgIGNvbnN0IHN0YXRlID0gYmVnaW5Db250ZW50RHJhZ1Njcm9sbChldmVudCwgY29udGVudFJlZi5jdXJyZW50LCB7IGxvY2tlZDogY2FudmFzTG9ja2VkLCBzY2FsZSB9KVxuICAgIGlmICghc3RhdGUpIHJldHVyblxuICAgIGRyYWdSZWYuY3VycmVudCA9IHN0YXRlXG4gICAgc2V0RHJhZ1Njcm9sbGluZyh0cnVlKVxuICAgIGV2ZW50LmN1cnJlbnRUYXJnZXQuc2V0UG9pbnRlckNhcHR1cmUoZXZlbnQucG9pbnRlcklkKVxuICB9XG5cbiAgY29uc3Qgb25Qb2ludGVyTW92ZSA9IChldmVudCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQpIHtcbiAgICAgIGNvbnN0IHRhcmdldCA9IGZpbmRSZXZpZXdUYXJnZXQoZXZlbnQudGFyZ2V0LCBjb250ZW50UmVmLmN1cnJlbnQpXG4gICAgICBpZiAodGFyZ2V0ID09PSBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCkgcmV0dXJuXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgICAgdGFyZ2V0Py5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gICAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IHRhcmdldFxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSkgcmV0dXJuXG4gICAgbW92ZUNvbnRlbnREcmFnU2Nyb2xsKHN0YXRlLCBldmVudClcbiAgfVxuXG4gIGNvbnN0IG9uUG9pbnRlckVuZCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHN0YXRlID0gZHJhZ1JlZi5jdXJyZW50XG4gICAgaWYgKCFzdGF0ZSB8fCBzdGF0ZS5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgZW5kQ29udGVudERyYWdTY3JvbGwoc3RhdGUsIGNvbnRlbnRSZWYuY3VycmVudClcbiAgICBkcmFnUmVmLmN1cnJlbnQgPSBudWxsXG4gICAgc2V0RHJhZ1Njcm9sbGluZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IG9uQ29udGVudENsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKHJldmlld0VuYWJsZWQpIHJldHVyblxuICAgIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayhldmVudCwgY29udGVudFJlZi5jdXJyZW50LCBuYXZpZ2F0ZSlcbiAgfVxuXG4gIGNvbnN0IG9uUmV2aWV3Q2xpY2sgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXJldmlld0VuYWJsZWQgfHwgY2FudmFzTG9ja2VkKSByZXR1cm5cbiAgICBjb25zdCB0YXJnZXQgPSBmaW5kUmV2aWV3VGFyZ2V0KGV2ZW50LnRhcmdldCwgY29udGVudFJlZi5jdXJyZW50KVxuICAgIGlmICghdGFyZ2V0KSByZXR1cm5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBvblJldmlld1NlbGVjdD8uKHRhcmdldCwgc2NyZWVuLCBjb250ZW50UmVmLmN1cnJlbnQsIHtcbiAgICAgIGFkZGl0aXZlOiBldmVudC5zaGlmdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmN0cmxLZXksXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IGNsZWFyUmV2aWV3SG92ZXIgPSAoKSA9PiB7XG4gICAgaG92ZXJSZXZpZXdFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBob3ZlclJldmlld0VsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgfVxuXG4gIGNvbnN0IGNvbnRlbnRTdHlsZSA9IGV4cGFuZGVkICYmIGV4cGFuZGVkQm94XG4gICAgPyB7IHdpZHRoOiBleHBhbmRlZEJveC53aWR0aCwgaGVpZ2h0OiBleHBhbmRlZEJveC5oZWlnaHQsIG92ZXJmbG93OiAndmlzaWJsZScgfVxuICAgIDogeyB3aWR0aDogdmlld3BvcnQud2lkdGgsIGhlaWdodDogdmlld3BvcnQuaGVpZ2h0IH1cblxuICBjb25zdCBmcmFtZVdpZHRoID0gZXhwYW5kZWQgJiYgZXhwYW5kZWRCb3ggPyBleHBhbmRlZEJveC53aWR0aCA6IHZpZXdwb3J0LndpZHRoXG5cbiAgcmV0dXJuIChcbiAgICA8c2VjdGlvblxuICAgICAgY2xhc3NOYW1lPXtmcmFtZUNsYXNzfVxuICAgICAgZGF0YS1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgIGRhdGEtZXhwYW5kZWQ9e2V4cGFuZGVkID8gJ3RydWUnIDogJ2ZhbHNlJ31cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBmcmFtZVdpZHRoIH19XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWxhYmVsXCI+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1jaHJvbWUtdGl0bGVcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4taW5kZXgtbnVtXCI+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWNocm9tZS1zY3JlZW4tdGl0bGVcIj57c2NyZWVuLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tZmlsZVwiPntzY3JlZW4uaWR9LmpzeDwvc3Bhbj5cbiAgICAgICAgPC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1zY3JlZW4tY2hyb21lLWFjdGlvbnNcIj5cbiAgICAgICAgICB7b25Ub2dnbGVFeHBhbmQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBhbmQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvblRvZ2dsZUV4cGFuZCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdcdTY1MzZcdThENzcnIDogJ1x1NUM1NVx1NUYwMCd9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICB7bW9kZSA9PT0gJ2NhbnZhcycgJiYgb25FeHBvcnQgPyAoXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1leHBvcnQtb25lXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICBvbkV4cG9ydCgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFx1NUJGQ1x1NTFGQSBQTkdcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtjb250ZW50UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1zY3JlZW4tY29udGVudCR7ZHJhZ1Njcm9sbGluZyA/ICcgaXMtZHJhZy1zY3JvbGxpbmcnIDogJyd9JHtleHBhbmRlZCA/ICcgaXMtZXhwYW5kZWQnIDogJyd9JHtyZXZpZXdFbmFibGVkICYmICFjYW52YXNMb2NrZWQgPyAnIGlzLXJldmlld2luZycgOiAnJ31gfVxuICAgICAgICBzdHlsZT17Y29udGVudFN0eWxlfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtvblBvaW50ZXJEb3dufVxuICAgICAgICBvblBvaW50ZXJNb3ZlPXtvblBvaW50ZXJNb3ZlfVxuICAgICAgICBvblBvaW50ZXJVcD17b25Qb2ludGVyRW5kfVxuICAgICAgICBvblBvaW50ZXJDYW5jZWw9e29uUG9pbnRlckVuZH1cbiAgICAgICAgb25Qb2ludGVyTGVhdmU9e2NsZWFyUmV2aWV3SG92ZXJ9XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXtvblJldmlld0NsaWNrfVxuICAgICAgICBvbkNsaWNrPXtvbkNvbnRlbnRDbGlja31cbiAgICAgID5cbiAgICAgICAgPEVycm9yQm91bmRhcnlcbiAgICAgICAgICBzY29wZT1cInNjcmVlblwiXG4gICAgICAgICAgcmVzZXRLZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICBzY3JlZW5JZD17c2NyZWVuLmlkfVxuICAgICAgICAgIHNvdXJjZT17YHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgfVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbklkZW50aXR5UHJvdmlkZXIgc2NyZWVuSWQ9e3NjcmVlbi5pZH0+XG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+XG4gICAgICAgICAgPC9TY3JlZW5JZGVudGl0eVByb3ZpZGVyPlxuICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICA8L2Rpdj5cbiAgICA8L3NlY3Rpb24+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBjbGFtcFNjYWxlLCBzaG91bGRab29tT25XaGVlbCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcblxuLyoqIFx1N0VEMVx1NUI5QVx1OTc1RSBwYXNzaXZlIHdoZWVsXHVGRjBDXHU2MjREXHU4MEZEXHU1NDA4XHU2Q0Q1IHByZXZlbnREZWZhdWx0XHVGRjA4UmVhY3Qgb25XaGVlbCBcdTlFRDhcdThCQTQgcGFzc2l2ZVx1RkYwOVx1MzAwMiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJpbmRXaGVlbFpvb20oZWwsIGdldFNjYWxlLCBzZXRTY2FsZSwgZ2V0TG9ja2VkID0gKCkgPT4gZmFsc2UpIHtcbiAgaWYgKCFlbCkgcmV0dXJuICgpID0+IHt9XG4gIGNvbnN0IG9uV2hlZWwgPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIXNob3VsZFpvb21PbldoZWVsKGV2ZW50LCB7IGxvY2tlZDogZ2V0TG9ja2VkKCkgfSkpIHJldHVyblxuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICBzZXRTY2FsZShjbGFtcFNjYWxlKGdldFNjYWxlKCkgKiAoZXZlbnQuZGVsdGFZID4gMCA/IDAuOSA6IDEuMSkpKVxuICB9XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICByZXR1cm4gKCkgPT4gZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBvbldoZWVsKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlV2hlZWxab29tKGVsZW1lbnRSZWYsIHNjYWxlLCBzZXRTY2FsZSwgbG9ja2VkID0gZmFsc2UpIHtcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGxvY2tlZFJlZiA9IFJlYWN0LnVzZVJlZihsb2NrZWQpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBsb2NrZWRSZWYuY3VycmVudCA9IGxvY2tlZFxuXG4gIFJlYWN0LnVzZUVmZmVjdChcbiAgICAoKSA9PiBiaW5kV2hlZWxab29tKFxuICAgICAgZWxlbWVudFJlZi5jdXJyZW50LFxuICAgICAgKCkgPT4gc2NhbGVSZWYuY3VycmVudCxcbiAgICAgIHNldFNjYWxlLFxuICAgICAgKCkgPT4gbG9ja2VkUmVmLmN1cnJlbnQsXG4gICAgKSxcbiAgICBbZWxlbWVudFJlZiwgc2V0U2NhbGVdLFxuICApXG59XG4iLCAiZXhwb3J0IGZ1bmN0aW9uIGNhblVzZURlbW8oc2NyZWVucykge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzY3JlZW5zKSAmJiBzY3JlZW5zLnNvbWUoKHNjcmVlbikgPT4gc2NyZWVuLmVudHJ5ID09PSB0cnVlKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBmb2N1c0NhbnZhc1NjcmVlbiwgcmVzZXRDYW52YXNWaWV3cG9ydCwgcGFuRnJvbURyYWdTbmFwc2hvdCB9IGZyb20gJy4vbmF2aWdhdGlvbi5qcydcbmltcG9ydCB7IFNjcmVlbkZyYW1lIH0gZnJvbSAnLi9TY3JlZW5GcmFtZS5qc3gnXG5pbXBvcnQgeyB1c2VXaGVlbFpvb20gfSBmcm9tICcuL3VzZVdoZWVsWm9vbS5qcydcbmltcG9ydCB7IGNhblVzZURlbW8gfSBmcm9tICcuL3ZhbGlkYXRpb24uanMnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5FeHBvcnRXaXRoRmVlZGJhY2sodGFzaywgc2V0RXJyb3IpIHtcbiAgc2V0RXJyb3IobnVsbClcbiAgdHJ5IHtcbiAgICBhd2FpdCB0YXNrKClcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpXG4gICAgc2V0RXJyb3IoYFx1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNVx1RkYxQSR7bWVzc2FnZX1gKVxuICB9XG59XG5cbi8qKiBmaWxlOi8vIFx1NEUwRFx1NjYyRiBzZWN1cmUgY29udGV4dFx1RkYwQ2NsaXBib2FyZCBBUEkgXHU1RTM4XHU0RTBEXHU1M0VGXHU3NTI4XHVGRjBDZXhlY0NvbW1hbmQgXHU1MTVDXHU1RTk1ICovXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dClcbiAgfVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdmaXhlZCdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYW52YXNNb2RlKHtcbiAgcHJvamVjdCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICBjYW52YXNMb2NrZWQsXG4gIHNlbGVjdGVkSWRzLFxuICBzZXRTZWxlY3RlZElkcyxcbiAgZXhwYW5kZWRJZHMgPSBuZXcgU2V0KCksXG4gIG9uVG9nZ2xlRXhwYW5kLFxuICBvbkV4cG9ydElkcyxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBjdXJyZW50U2NyZWVuSWQsIG5hdmlnYXRlLCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIGVudGVyRGVtbzogZW50ZXJEZW1vTW9kZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3QgW3ZpZXcsIHNldFZpZXddID0gUmVhY3QudXNlU3RhdGUoKCkgPT4gKHsgLi4ucmVzZXRDYW52YXNWaWV3cG9ydCgpLCBzY2FsZSB9KSlcbiAgY29uc3QgW2RyYWdnaW5nLCBzZXREcmFnZ2luZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NpZGViYXJDb2xsYXBzZWQsIHNldFNpZGViYXJDb2xsYXBzZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWRLZXksIHNldENvcGllZEtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBbY29weVRvYXN0LCBzZXRDb3B5VG9hc3RdID0gUmVhY3QudXNlU3RhdGUobnVsbClcbiAgY29uc3QgZHJhZyA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBjYW52YXNSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgY29waWVkVGltZXIgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc2NhbGVSZWYgPSBSZWFjdC51c2VSZWYoc2NhbGUpXG4gIGNvbnN0IGRyYWdnaW5nUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBkZW1vQXZhaWxhYmxlID0gY2FuVXNlRGVtbyhwcm9qZWN0LnNjcmVlbnMpXG4gIHNjYWxlUmVmLmN1cnJlbnQgPSBzY2FsZVxuICBkcmFnZ2luZ1JlZi5jdXJyZW50ID0gZHJhZ2dpbmdcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGU6IGN1cnJlbnQuc2NhbGUgfSkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcmFnZ2luZ1JlZi5jdXJyZW50KSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjb25zdCBhcHBseSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGNhbnZhcyA9IGNhbnZhc1JlZi5jdXJyZW50XG4gICAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICAgIGlmICghY2FudmFzIHx8ICFzdGFnZSkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBzY3JlZW5FbCA9IHN0YWdlLnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhbnZhcy1zY3JlZW4taWQ9XCIke2N1cnJlbnRTY3JlZW5JZH1cIl1gKVxuICAgICAgaWYgKCFzY3JlZW5FbCkgcmV0dXJuIGZhbHNlXG4gICAgICBjb25zdCBjdXJyZW50U2NhbGUgPSBzY2FsZVJlZi5jdXJyZW50XG4gICAgICBpZiAoY3VycmVudFNjYWxlIDw9IDApIHJldHVybiBmYWxzZVxuICAgICAgY29uc3Qgc3RhZ2VCb3ggPSBzdGFnZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29uc3Qgc2NyZWVuQm94ID0gc2NyZWVuRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgIGNvbnN0IG5leHQgPSBmb2N1c0NhbnZhc1NjcmVlbih7XG4gICAgICAgIGNvbnRhaW5lcldpZHRoOiBjYW52YXMuY2xpZW50V2lkdGgsXG4gICAgICAgIGNvbnRhaW5lckhlaWdodDogY2FudmFzLmNsaWVudEhlaWdodCxcbiAgICAgICAgc2NyZWVuTGVmdDogKHNjcmVlbkJveC5sZWZ0IC0gc3RhZ2VCb3gubGVmdCkgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIHNjcmVlblRvcDogKHNjcmVlbkJveC50b3AgLSBzdGFnZUJveC50b3ApIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5XaWR0aDogc2NyZWVuQm94LndpZHRoIC8gY3VycmVudFNjYWxlLFxuICAgICAgICBzY3JlZW5IZWlnaHQ6IHNjcmVlbkJveC5oZWlnaHQgLyBjdXJyZW50U2NhbGUsXG4gICAgICAgIGN1cnJlbnRTY2FsZSxcbiAgICAgIH0pXG4gICAgICBpZiAoIW5leHQpIHJldHVybiBmYWxzZVxuICAgICAgc2V0U2NhbGUobmV4dC5zY2FsZSlcbiAgICAgIHNldFZpZXcobmV4dClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKGFwcGx5KCkpIHJldHVybiB1bmRlZmluZWRcbiAgICBjb25zdCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgYXBwbHkoKVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZSlcbiAgfSwgW2N1cnJlbnRTY3JlZW5JZCwgdmlld3BvcnRLZXksIHNldFNjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGlmIChjb3BpZWRUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcGllZFRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIHVzZVdoZWVsWm9vbShjYW52YXNSZWYsIHNjYWxlLCBzZXRTY2FsZSwgY2FudmFzTG9ja2VkKVxuXG4gIGNvbnN0IHN0YXJ0UGFuID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGlmIChldmVudC5idXR0b24gIT0gbnVsbCAmJiBldmVudC5idXR0b24gIT09IDApIHJldHVyblxuICAgIGRyYWcuY3VycmVudCA9IHsgeDogZXZlbnQuY2xpZW50WCwgeTogZXZlbnQuY2xpZW50WSwgcGFuWDogdmlldy5wYW5YLCBwYW5ZOiB2aWV3LnBhblkgfVxuICAgIHNldERyYWdnaW5nKHRydWUpXG4gICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICB9XG5cbiAgY29uc3QgbW92ZVBhbiA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IHNuYXBzaG90ID0gZHJhZy5jdXJyZW50XG4gICAgaWYgKCFzbmFwc2hvdCkgcmV0dXJuXG4gICAgY29uc3QgeyBjbGllbnRYLCBjbGllbnRZIH0gPSBldmVudFxuICAgIHNldFZpZXcoKGN1cnJlbnQpID0+IHBhbkZyb21EcmFnU25hcHNob3QoY3VycmVudCwgc25hcHNob3QsIGNsaWVudFgsIGNsaWVudFkpKVxuICB9XG5cbiAgY29uc3QgZW5kUGFuID0gKCkgPT4ge1xuICAgIGRyYWcuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGVudGVyRGVtbyA9IChzY3JlZW5JZCkgPT4ge1xuICAgIGlmICghZGVtb0F2YWlsYWJsZSB8fCBjYW52YXNMb2NrZWQpIHJldHVyblxuICAgIGVudGVyRGVtb01vZGUoc2NyZWVuSWQpXG4gIH1cblxuICBjb25zdCBjb3B5TWV0YSA9IChrZXksIHRleHQsIGV2ZW50KSA9PiB7XG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgY29weVRleHQodGV4dCkudGhlbigoKSA9PiB7XG4gICAgICBzZXRDb3BpZWRLZXkoa2V5KVxuICAgICAgc2V0Q29weVRvYXN0KCdcdTVERjJcdTU5MERcdTUyMzYnKVxuICAgICAgaWYgKGNvcGllZFRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29waWVkVGltZXIuY3VycmVudClcbiAgICAgIGNvcGllZFRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHNldENvcGllZEtleShudWxsKVxuICAgICAgICBzZXRDb3B5VG9hc3QobnVsbClcbiAgICAgIH0sIDEyMDApXG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHRvZ2dsZVNlbGVjdGVkID0gKGlkKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCB0b2dnbGVBbGwgPSAoKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGlmIChjdXJyZW50LnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGgpIHJldHVybiBuZXcgU2V0KClcbiAgICAgIHJldHVybiBuZXcgU2V0KHByb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbikgPT4gc2NyZWVuLmlkKSlcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWNhbnZhcy1zaGVsbFwiPlxuICAgICAgPGFzaWRlIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1zaWRlYmFyJHtzaWRlYmFyQ29sbGFwc2VkID8gJyBpcy1jb2xsYXBzZWQnIDogJyd9YH0gYXJpYS1oaWRkZW49e3NpZGViYXJDb2xsYXBzZWR9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItaGVhZGVyXCI+XG4gICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgIGNoZWNrZWQ9e3NlbGVjdGVkSWRzLnNpemUgPT09IHByb2plY3Quc2NyZWVucy5sZW5ndGggJiYgcHJvamVjdC5zY3JlZW5zLmxlbmd0aCA+IDB9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXt0b2dnbGVBbGx9XG4gICAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgXHU1MTY4XHU5MDA5XG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXNpZGViYXItdG9nZ2xlXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTY1MzZcdThENzdcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTY1MzZcdThENzdcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgdGFiSW5kZXg9e3NpZGViYXJDb2xsYXBzZWQgPyAtMSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNpZGViYXJDb2xsYXBzZWQodHJ1ZSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRvZ2dsZS1pY29uXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8cmVjdCB3aWR0aD1cIjE4XCIgaGVpZ2h0PVwiMThcIiB4PVwiM1wiIHk9XCIzXCIgcng9XCIyXCIgLz5cbiAgICAgICAgICAgICAgPHBhdGggZD1cIk05IDN2MThcIiAvPlxuICAgICAgICAgICAgICA8cGF0aCBkPVwibTE2IDE1LTMtMyAzLTNcIiAvPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwid2Ytc2NyZWVuLWxpc3RcIj5cbiAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KCkgPT4gZW50ZXJEZW1vKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgIHRpdGxlPXtkZW1vQXZhaWxhYmxlID8gJ1x1NTNDQ1x1NTFGQlx1OEZEQlx1NTE2NVx1NkYxNFx1NzkzQScgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17c2VsZWN0ZWRJZHMuaGFzKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgICAgICAgIHRvZ2dsZVNlbGVjdGVkKHNjcmVlbi5pZClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YFx1OTAwOVx1NjJFOSAke3NjcmVlbi50aXRsZX1gfVxuICAgICAgICAgICAgICAgIHRhYkluZGV4PXtzaWRlYmFyQ29sbGFwc2VkID8gLTEgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXNjcmVlbi1pbmRleC1udW1cIj57aW5kZXggKyAxfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc2NyZWVuLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L3VsPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwc1wiIGFyaWEtbGFiZWw9XCJcdTY0Q0RcdTRGNUNcdTYzRDBcdTc5M0FcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNpZGViYXItdGlwXCI+XG4gICAgICAgICAgICA8c3Bhbj5cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdUZGMUFcdTYyRDZcdTYyRkRcdTVFNzNcdTc5RkIgLyBcdTZFREFcdThGNkVcdTdGMjlcdTY1M0U8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zaWRlYmFyLXRpcFwiPlxuICAgICAgICAgICAgPHNwYW4+XHU1M0VGXHU0RUE0XHU0RTkyXHVGRjFBXHU3QTdBXHU2ODNDXHU2MkQ2XHU2MkZEIC8gQ3RybCtcdTZFREFcdThGNkU8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hc2lkZT5cbiAgICAgIHtzaWRlYmFyQ29sbGFwc2VkID8gKFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci1leHBhbmRcIlxuICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdTVDNTVcdTVGMDBcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgIHRpdGxlPVwiXHU1QzU1XHU1RjAwXHU0RkE3XHU2ODBGXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaWRlYmFyQ29sbGFwc2VkKGZhbHNlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwid2Ytc2lkZWJhci10b2dnbGUtaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgIDxyZWN0IHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHg9XCIzXCIgeT1cIjNcIiByeD1cIjJcIiAvPlxuICAgICAgICAgICAgPHBhdGggZD1cIk05IDN2MThcIiAvPlxuICAgICAgICAgICAgPHBhdGggZD1cIm0xNCA5IDMgMy0zIDNcIiAvPlxuICAgICAgICAgIDwvc3ZnPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPG1haW5cbiAgICAgICAgcmVmPXtjYW52YXNSZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17YHdmLWNhbnZhcyR7ZHJhZ2dpbmcgPyAnIGlzLWRyYWdnaW5nJyA6ICcnfSR7Y2FudmFzTG9ja2VkID8gJyBpcy1sb2NrZWQnIDogJyd9YH1cbiAgICAgICAgb25Qb2ludGVyRG93bj17c3RhcnRQYW59XG4gICAgICAgIG9uUG9pbnRlck1vdmU9e21vdmVQYW59XG4gICAgICAgIG9uUG9pbnRlclVwPXtlbmRQYW59XG4gICAgICAgIG9uUG9pbnRlckNhbmNlbD17ZW5kUGFufVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgcmVmPXtzdGFnZVJlZn1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlVGV4dCA9IGAke2luZGV4ICsgMX0uICR7c2NyZWVuLnRpdGxlfWBcbiAgICAgICAgICAgIGNvbnN0IGZpbGVUZXh0ID0gYHNyYy9zY3JlZW5zLyR7c2NyZWVuLmlkfS5qc3hgXG4gICAgICAgICAgICBjb25zdCB0aXRsZUtleSA9IGAke3NjcmVlbi5pZH06dGl0bGVgXG4gICAgICAgICAgICBjb25zdCBmaWxlS2V5ID0gYCR7c2NyZWVuLmlkfTpmaWxlYFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLXNjcmVlbiBpcy1mb2N1c2VkJyA6ICd3Zi1jYW52YXMtc2NyZWVuJ31cbiAgICAgICAgICAgICAgICBkYXRhLWNhbnZhcy1zY3JlZW4taWQ9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICBrZXk9e3NjcmVlbi5pZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC5jbG9zZXN0KCcud2YtZXhwb3J0LW9uZSwgLndmLWV4cGFuZC1vbmUsIC53Zi1zY3JlZW4tbWV0YS1jb3B5JykpIHJldHVyblxuICAgICAgICAgICAgICAgICAgbmF2aWdhdGUoc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy53Zi1leHBvcnQtb25lLCAud2YtZXhwYW5kLW9uZSwgLndmLXNjcmVlbi1tZXRhLWNvcHknKSkgcmV0dXJuXG4gICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICAgICAgICBlbnRlckRlbW8oc2NyZWVuLmlkKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXNjcmVlbi1tZXRhXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLXNjcmVlbi1tZXRhLXRpdGxlIHdmLXNjcmVlbi1tZXRhLWNvcHkke2NvcGllZEtleSA9PT0gdGl0bGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSB0aXRsZUtleSA/ICdcdTVERjJcdTU5MERcdTUyMzYnIDogJ1x1NzBCOVx1NTFGQlx1NTkwRFx1NTIzNid9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4gY29weU1ldGEodGl0bGVLZXksIHRpdGxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7dGl0bGVUZXh0fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7c2NyZWVuLmRlc2NyaXB0aW9uID8gPGRpdj57c2NyZWVuLmRlc2NyaXB0aW9ufTwvZGl2PiA6IG51bGx9XG4gICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHdmLW1ldGEtbGluZSB3Zi1zY3JlZW4tbWV0YS1jb3B5JHtjb3BpZWRLZXkgPT09IGZpbGVLZXkgPyAnIGlzLWNvcGllZCcgOiAnJ31gfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17Y29waWVkS2V5ID09PSBmaWxlS2V5ID8gJ1x1NURGMlx1NTkwRFx1NTIzNicgOiAnXHU3MEI5XHU1MUZCXHU1OTBEXHU1MjM2J31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBjb3B5TWV0YShmaWxlS2V5LCBmaWxlVGV4dCwgZXZlbnQpfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Ryb25nPlx1NjU4N1x1NEVGNlx1RkYxQTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICB7ZmlsZVRleHR9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8U2NyZWVuRnJhbWVcbiAgICAgICAgICAgICAgICAgIHNjcmVlbj17c2NyZWVufVxuICAgICAgICAgICAgICAgICAgdmlld3BvcnQ9e3ZpZXdwb3J0fVxuICAgICAgICAgICAgICAgICAgbW9kZT1cImNhbnZhc1wiXG4gICAgICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICBmb2N1c2VkPXtzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZH1cbiAgICAgICAgICAgICAgICAgIGV4cGFuZGVkPXtleHBhbmRlZElkcy5oYXMoc2NyZWVuLmlkKX1cbiAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlRXhwYW5kPXsoKSA9PiBvblRvZ2dsZUV4cGFuZChzY3JlZW4uaWQpfVxuICAgICAgICAgICAgICAgICAgb25FeHBvcnQ9eygpID0+IG9uRXhwb3J0SWRzKFtzY3JlZW4uaWRdKX1cbiAgICAgICAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXhcIj5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGFiZWxcIj5cdTdEMjJcdTVGMTU8L3NwYW4+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtbGlzdFwiPlxuICAgICAgICAgICAge3Byb2plY3Quc2NyZWVucy5tYXAoKHNjcmVlbiwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGtleT17c2NyZWVuLmlkfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuSWQgPyAnd2YtY2FudmFzLWluZGV4LWRvdCBpcy1hY3RpdmUnIDogJ3dmLWNhbnZhcy1pbmRleC1kb3QnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgb25Eb3VibGVDbGljaz17KCkgPT4gZW50ZXJEZW1vKHNjcmVlbi5pZCl9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YCR7aW5kZXggKyAxfS4gJHtzY3JlZW4udGl0bGV9YH1cbiAgICAgICAgICAgICAgICB0aXRsZT17ZGVtb0F2YWlsYWJsZSA/ICdcdTUzQ0NcdTUxRkJcdThGREJcdTUxNjVcdTZGMTRcdTc5M0EnIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+e2luZGV4ICsgMX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtY2FudmFzLWluZGV4LXRvb2x0aXBcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNhbnZhcy1pbmRleC10b29sdGlwLXRpdGxlXCI+e3NjcmVlbi50aXRsZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1jYW52YXMtaW5kZXgtdG9vbHRpcC1maWxlXCI+c3JjL3NjcmVlbnMve3NjcmVlbi5pZH0uanN4PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L21haW4+XG4gICAgICB7Y29weVRvYXN0ID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvYXN0XCIgcm9sZT1cInN0YXR1c1wiPntjb3B5VG9hc3R9PC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQge1xuICBmaXREZW1vU2NhbGUsXG4gIGlzRGVtb0JsYW5rRXhpdFRhcmdldCxcbiAgcGFuRnJvbURyYWdTbmFwc2hvdCxcbiAgcmVzZXRDYW52YXNWaWV3cG9ydCxcbn0gZnJvbSAnLi9uYXZpZ2F0aW9uLmpzJ1xuaW1wb3J0IHsgU2NyZWVuRnJhbWUgfSBmcm9tICcuL1NjcmVlbkZyYW1lLmpzeCdcbmltcG9ydCB7IHVzZVdoZWVsWm9vbSB9IGZyb20gJy4vdXNlV2hlZWxab29tLmpzJ1xuXG5jb25zdCBCTEFOS19FWElUX0hJTlQgPSAnXHU1M0NDXHU1MUZCXHU3QTdBXHU3NjdEXHU1OTA0XHU5MDAwXHU1MUZBXHU2RjE0XHU3OTNBJ1xuXG5mdW5jdGlvbiByZWFkQ29udGVudEJveChlbCkge1xuICBjb25zdCBzdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGVsKVxuICBjb25zdCBwYWRYID0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodClcbiAgY29uc3QgcGFkWSA9IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ1RvcCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdCb3R0b20pXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IE1hdGgubWF4KDAsIGVsLmNsaWVudFdpZHRoIC0gcGFkWCksXG4gICAgaGVpZ2h0OiBNYXRoLm1heCgwLCBlbC5jbGllbnRIZWlnaHQgLSBwYWRZKSxcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRGVtb01vZGUoe1xuICBwcm9qZWN0LFxuICBob3RzcG90c1Zpc2libGUsXG4gIGNhbnZhc0xvY2tlZCxcbiAgc2NhbGUsXG4gIHNldFNjYWxlLFxuICB2aWV3UmVzZXRLZXksXG4gIGV4cGFuZGVkSWRzID0gbmV3IFNldCgpLFxuICBvblRvZ2dsZUV4cGFuZCxcbiAgcmV2aWV3RW5hYmxlZCA9IGZhbHNlLFxuICBvblJldmlld1NlbGVjdCxcbn0pIHtcbiAgY29uc3QgeyBjdXJyZW50U2NyZWVuSWQsIHZpZXdwb3J0LCB2aWV3cG9ydEtleSwgc2V0TW9kZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgY29uc3Qgc2NyZWVuSW5kZXggPSBwcm9qZWN0LnNjcmVlbnMuZmluZEluZGV4KChpdGVtKSA9PiBpdGVtLmlkID09PSBjdXJyZW50U2NyZWVuSWQpXG4gIGNvbnN0IHNjcmVlbiA9IHNjcmVlbkluZGV4ID49IDAgPyBwcm9qZWN0LnNjcmVlbnNbc2NyZWVuSW5kZXhdIDogbnVsbFxuICBjb25zdCBjdXJyZW50RXhwYW5kZWQgPSAhIShzY3JlZW4gJiYgZXhwYW5kZWRJZHMuaGFzKHNjcmVlbi5pZCkpXG4gIGNvbnN0IFt2aWV3LCBzZXRWaWV3XSA9IFJlYWN0LnVzZVN0YXRlKCgpID0+ICh7IC4uLnJlc2V0Q2FudmFzVmlld3BvcnQoKSwgc2NhbGUgfSkpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWcgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgdmlld3BvcnRSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3RhZ2VSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcblxuICBjb25zdCBleGl0T25CbGFua0RvdWJsZUNsaWNrID0gKGV2ZW50KSA9PiB7XG4gICAgaWYgKCFpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSkgcmV0dXJuXG4gICAgc2V0TW9kZSgnY2FudmFzJylcbiAgfVxuXG4gIC8vIHRpdGxlIFx1NjMwMlx1NTcyOFx1ODlDNlx1NTNFM1x1NEUwQVx1NEYxQVx1ODQzRFx1NTIzMFx1NUM0Rlx1NTE4NVx1NUI1MFx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Mlx1NjI3MFx1NjRDRFx1NEY1Q1x1RkYxQlx1NTNFQVx1NTcyOFx1N0E3QVx1NzY3RFx1NTkwNFx1NjBBQ1x1NTA1Q1x1NjVGNlx1NjMwMlx1NEUwQVx1MzAwMlxuICBjb25zdCBzeW5jQmxhbmtFeGl0SGludCA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGVsID0gdmlld3BvcnRSZWYuY3VycmVudFxuICAgIGlmICghZWwpIHJldHVyblxuICAgIGNvbnN0IG5leHQgPSBpc0RlbW9CbGFua0V4aXRUYXJnZXQoZXZlbnQudGFyZ2V0KSA/IEJMQU5LX0VYSVRfSElOVCA6ICcnXG4gICAgaWYgKChlbC5nZXRBdHRyaWJ1dGUoJ3RpdGxlJykgfHwgJycpID09PSBuZXh0KSByZXR1cm5cbiAgICBpZiAobmV4dCkgZWwuc2V0QXR0cmlidXRlKCd0aXRsZScsIG5leHQpXG4gICAgZWxzZSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGNsZWFyQmxhbmtFeGl0SGludCA9ICgpID0+IHtcbiAgICB2aWV3cG9ydFJlZi5jdXJyZW50Py5yZW1vdmVBdHRyaWJ1dGUoJ3RpdGxlJylcbiAgfVxuXG4gIGNvbnN0IGFwcGx5Rml0ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCAhc3RhZ2UpIHJldHVyblxuICAgIGNvbnN0IGJveCA9IHJlYWRDb250ZW50Qm94KGNvbnRhaW5lcilcbiAgICBjb25zdCBuZXh0ID0gZml0RGVtb1NjYWxlKGJveC53aWR0aCwgYm94LmhlaWdodCwgc3RhZ2Uub2Zmc2V0V2lkdGgsIHN0YWdlLm9mZnNldEhlaWdodClcbiAgICBzZXRTY2FsZShuZXh0KVxuICAgIHNldFZpZXcoeyAuLi5yZXNldENhbnZhc1ZpZXdwb3J0KCksIHNjYWxlOiBuZXh0IH0pXG4gIH0sIFtzZXRTY2FsZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRWaWV3KChjdXJyZW50KSA9PiAoeyAuLi5jdXJyZW50LCBzY2FsZSB9KSlcbiAgfSwgW3NjYWxlXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IHZpZXdwb3J0UmVmLmN1cnJlbnRcbiAgICBjb25zdCBzdGFnZSA9IHN0YWdlUmVmLmN1cnJlbnRcbiAgICBpZiAoIWNvbnRhaW5lciB8fCB0eXBlb2YgUmVzaXplT2JzZXJ2ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFwcGx5Rml0KClcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gICAgY29uc3Qgb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4gYXBwbHlGaXQoKSlcbiAgICBvYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lcilcbiAgICBpZiAoc3RhZ2UpIG9ic2VydmVyLm9ic2VydmUoc3RhZ2UpXG4gICAgYXBwbHlGaXQoKVxuICAgIHJldHVybiAoKSA9PiBvYnNlcnZlci5kaXNjb25uZWN0KClcbiAgfSwgW2FwcGx5Rml0LCB2aWV3cG9ydCwgdmlld3BvcnRLZXksIGN1cnJlbnRTY3JlZW5JZCwgdmlld1Jlc2V0S2V5LCBjdXJyZW50RXhwYW5kZWRdKVxuXG4gIHVzZVdoZWVsWm9vbSh2aWV3cG9ydFJlZiwgc2NhbGUsIHNldFNjYWxlLCBjYW52YXNMb2NrZWQpXG5cbiAgY29uc3Qgc3RhcnRQYW4gPSAoZXZlbnQpID0+IHtcbiAgICBpZiAoIWNhbnZhc0xvY2tlZCkgcmV0dXJuXG4gICAgaWYgKGV2ZW50LmJ1dHRvbiAhPSBudWxsICYmIGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgZHJhZy5jdXJyZW50ID0geyB4OiBldmVudC5jbGllbnRYLCB5OiBldmVudC5jbGllbnRZLCBwYW5YOiB2aWV3LnBhblgsIHBhblk6IHZpZXcucGFuWSB9XG4gICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LnNldFBvaW50ZXJDYXB0dXJlKGV2ZW50LnBvaW50ZXJJZClcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIH1cblxuICBjb25zdCBtb3ZlUGFuID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc25hcHNob3QgPSBkcmFnLmN1cnJlbnRcbiAgICBpZiAoIXNuYXBzaG90KSByZXR1cm5cbiAgICBjb25zdCB7IGNsaWVudFgsIGNsaWVudFkgfSA9IGV2ZW50XG4gICAgc2V0VmlldygoY3VycmVudCkgPT4gcGFuRnJvbURyYWdTbmFwc2hvdChjdXJyZW50LCBzbmFwc2hvdCwgY2xpZW50WCwgY2xpZW50WSkpXG4gIH1cblxuICBjb25zdCBlbmRQYW4gPSAoKSA9PiB7XG4gICAgZHJhZy5jdXJyZW50ID0gbnVsbFxuICAgIHNldERyYWdnaW5nKGZhbHNlKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWRlbW8gaXMtc2hvd2luZy1ob3RzcG90cycgOiAnd2YtZGVtbyd9PlxuICAgICAgPGRpdlxuICAgICAgICByZWY9e3ZpZXdwb3J0UmVmfVxuICAgICAgICBjbGFzc05hbWU9e2B3Zi1kZW1vLXZpZXdwb3J0JHtkcmFnZ2luZyA/ICcgaXMtZHJhZ2dpbmcnIDogJyd9JHtjYW52YXNMb2NrZWQgPyAnIGlzLWxvY2tlZCcgOiAnJ31gfVxuICAgICAgICBvblBvaW50ZXJEb3duPXtzdGFydFBhbn1cbiAgICAgICAgb25Qb2ludGVyTW92ZT17bW92ZVBhbn1cbiAgICAgICAgb25Qb2ludGVyVXA9e2VuZFBhbn1cbiAgICAgICAgb25Qb2ludGVyQ2FuY2VsPXtlbmRQYW59XG4gICAgICAgIG9uTW91c2VNb3ZlPXtzeW5jQmxhbmtFeGl0SGludH1cbiAgICAgICAgb25Nb3VzZUxlYXZlPXtjbGVhckJsYW5rRXhpdEhpbnR9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e2V4aXRPbkJsYW5rRG91YmxlQ2xpY2t9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICByZWY9e3N0YWdlUmVmfVxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLWRlbW8tc3RhZ2VcIlxuICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZSgke3ZpZXcucGFuWH1weCwgJHt2aWV3LnBhbll9cHgpIHNjYWxlKCR7dmlldy5zY2FsZX0pYCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFNjcmVlbkZyYW1lXG4gICAgICAgICAgICBzY3JlZW49e3NjcmVlbn1cbiAgICAgICAgICAgIHZpZXdwb3J0PXt2aWV3cG9ydH1cbiAgICAgICAgICAgIG1vZGU9XCJkZW1vXCJcbiAgICAgICAgICAgIGluZGV4PXtzY3JlZW5JbmRleH1cbiAgICAgICAgICAgIGV4cGFuZGVkPXtjdXJyZW50RXhwYW5kZWR9XG4gICAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17c2NyZWVuICYmIG9uVG9nZ2xlRXhwYW5kID8gKCkgPT4gb25Ub2dnbGVFeHBhbmQoc2NyZWVuLmlkKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgIGNhbnZhc0xvY2tlZD17Y2FudmFzTG9ja2VkfVxuICAgICAgICAgICAgc2NhbGU9e3ZpZXcuc2NhbGV9XG4gICAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgICAgb25SZXZpZXdTZWxlY3Q9e29uUmV2aWV3U2VsZWN0fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1kZW1vLWhpbnRcIj5cdTcwQjlcdTUxRkJcdTk4NzVcdTk3NjJcdTUxODVcdTYzMDlcdTk0QUUgLyBcdTk0RkVcdTYzQTVcdThERjNcdThGNkNcdUZGMUJcdTUzRUZcdTU3MjhcdTVERTVcdTUxNzdcdTY4MEZcdTVGMDBcdTUxNzNcdTcwRURcdTUzM0FcdTlBRDhcdTRFQUVcdUZGMUJcdTY4MDdcdTk4OThcdTY4MEZcdTUzRUZcdTRFMzRcdTY1RjZcdTVDNTVcdTVGMDBcdTc3MEJcdTUxNjhcdThDOEM8L3A+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyBleHBhbmRTY3JlZW5Db250ZW50LCBtZWFzdXJlQ29udGVudEJveCB9IGZyb20gJy4vZXhwYW5kLmpzJ1xuXG5sZXQgZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxuXG5jb25zdCBsaWJyYXJpZXMgPSBbXG4gIHsgZmlsZTogJ2h0bWwyY2FudmFzLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93Lmh0bWwyY2FudmFzID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ2pzemlwLm1pbi5qcycsIHJlYWR5OiAoKSA9PiB0eXBlb2Ygd2luZG93LkpTWmlwID09PSAnZnVuY3Rpb24nIH0sXG4gIHsgZmlsZTogJ0ZpbGVTYXZlci5taW4uanMnLCByZWFkeTogKCkgPT4gdHlwZW9mIHdpbmRvdy5zYXZlQXMgPT09ICdmdW5jdGlvbicgfSxcbl1cblxuZnVuY3Rpb24gbG9hZFNjcmlwdChmaWxlKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgbGV0IGV4aXN0aW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihgc2NyaXB0W2RhdGEtd2lyZWZyYW1lLWV4cG9ydD1cIiR7ZmlsZX1cIl1gKVxuICAgIGlmIChleGlzdGluZykge1xuICAgICAgaWYgKGV4aXN0aW5nLmRhdGFzZXQud2lyZWZyYW1lRXhwb3J0U3RhdGUgPT09ICdsb2FkZWQnKSB7XG4gICAgICAgIGV4aXN0aW5nLnJlbW92ZSgpXG4gICAgICAgIGV4aXN0aW5nID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCByZXNvbHZlLCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIGV4aXN0aW5nLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgcmVqZWN0LCB7IG9uY2U6IHRydWUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBjb25zdCB2ZW5kb3JCYXNlID0gd2luZG93LldJUkVGUkFNRV9WRU5ET1JfQkFTRVxuICAgIGlmICghdmVuZG9yQmFzZSkge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignXHU2NzJBXHU5MTREXHU3RjZFXHU2NzJDXHU1NzMwXHU1QkZDXHU1MUZBXHU1RTkzXHU4REVGXHU1Rjg0IFdJUkVGUkFNRV9WRU5ET1JfQkFTRScpKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXG4gICAgc2NyaXB0LnNyYyA9IG5ldyBVUkwoZmlsZSwgdmVuZG9yQmFzZSkuaHJlZlxuICAgIHNjcmlwdC5kYXRhc2V0LndpcmVmcmFtZUV4cG9ydCA9IGZpbGVcbiAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkaW5nJ1xuICAgIHNjcmlwdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQuZGF0YXNldC53aXJlZnJhbWVFeHBvcnRTdGF0ZSA9ICdsb2FkZWQnXG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICBzY3JpcHQucmVtb3ZlKClcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoYFx1NjVFMFx1NkNENVx1NTJBMFx1OEY3RFx1NjcyQ1x1NTczMFx1NUJGQ1x1NTFGQVx1NUU5MyAke2ZpbGV9YCkpXG4gICAgfVxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZEV4cG9ydExpYnJhcmllcygpIHtcbiAgaWYgKCFleHBvcnRMaWJyYXJpZXNQcm9taXNlKSB7XG4gICAgZXhwb3J0TGlicmFyaWVzUHJvbWlzZSA9IGxpYnJhcmllcy5yZWR1Y2UoXG4gICAgICAoY2hhaW4sIGxpYnJhcnkpID0+IGNoYWluLnRoZW4oYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWxpYnJhcnkucmVhZHkoKSkgYXdhaXQgbG9hZFNjcmlwdChsaWJyYXJ5LmZpbGUpXG4gICAgICAgIGlmICghbGlicmFyeS5yZWFkeSgpKSB0aHJvdyBuZXcgRXJyb3IoYFx1NUJGQ1x1NTFGQVx1NUU5M1x1NTIxRFx1NTlDQlx1NTMxNlx1NTkzMVx1OEQyNTogJHtsaWJyYXJ5LmZpbGV9YClcbiAgICAgIH0pLFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKCksXG4gICAgKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIGV4cG9ydExpYnJhcmllc1Byb21pc2UgPSB1bmRlZmluZWRcbiAgICAgIHRocm93IGVycm9yXG4gICAgfSlcbiAgfVxuICByZXR1cm4gZXhwb3J0TGlicmFyaWVzUHJvbWlzZVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FwdHVyZVNjcmVlbihzY3JlZW5FbGVtZW50LCB2aWV3cG9ydCwgeyBleHBhbmRlZCA9IGZhbHNlIH0gPSB7fSkge1xuICBpZiAoIXNjcmVlbkVsZW1lbnQpIHRocm93IG5ldyBFcnJvcignXHU2MjdFXHU0RTBEXHU1MjMwXHU4OTgxXHU1QkZDXHU1MUZBXHU3Njg0IHNjcmVlbiBcdTUxNDNcdTdEMjAnKVxuICBhd2FpdCBsb2FkRXhwb3J0TGlicmFyaWVzKClcblxuICBjb25zdCBzYW5kYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgc2FuZGJveC5jbGFzc05hbWUgPSAnd2YtZXhwb3J0LXNhbmRib3gnXG4gIGNvbnN0IGNsb25lID0gc2NyZWVuRWxlbWVudC5jbG9uZU5vZGUodHJ1ZSlcbiAgc2FuZGJveC5hcHBlbmRDaGlsZChjbG9uZSlcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzYW5kYm94KVxuXG4gIGxldCB3aWR0aCA9IHZpZXdwb3J0LndpZHRoXG4gIGxldCBoZWlnaHQgPSB2aWV3cG9ydC5oZWlnaHRcbiAgdHJ5IHtcbiAgICBpZiAoZXhwYW5kZWQpIHtcbiAgICAgIGV4cGFuZFNjcmVlbkNvbnRlbnQoY2xvbmUpXG4gICAgICBjb25zdCBib3ggPSBtZWFzdXJlQ29udGVudEJveChjbG9uZSlcbiAgICAgIHdpZHRoID0gYm94LndpZHRoXG4gICAgICBoZWlnaHQgPSBib3guaGVpZ2h0XG4gICAgfVxuICAgIGNsb25lLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgXG4gICAgY2xvbmUuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0fXB4YFxuICAgIHNhbmRib3guc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGBcbiAgICBzYW5kYm94LnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGBcblxuICAgIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHdpbmRvdy5odG1sMmNhbnZhcyhjbG9uZSwge1xuICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHNjYWxlOiAyLFxuICAgICAgdXNlQ09SUzogZmFsc2UsXG4gICAgICBsb2dnaW5nOiBmYWxzZSxcbiAgICB9KVxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjYW52YXMudG9CbG9iKFxuICAgICAgICAoYmxvYikgPT4gYmxvYiA/IHJlc29sdmUoYmxvYikgOiByZWplY3QobmV3IEVycm9yKCdQTkcgXHU3RjE2XHU3ODAxXHU1OTMxXHU4RDI1JykpLFxuICAgICAgICAnaW1hZ2UvcG5nJyxcbiAgICAgIClcbiAgICB9KVxuICB9IGZpbmFsbHkge1xuICAgIHNhbmRib3gucmVtb3ZlKClcbiAgfVxufVxuXG5mdW5jdGlvbiBzbHVnKHZhbHVlKSB7XG4gIHJldHVybiBTdHJpbmcodmFsdWUgfHwgJ3dpcmVmcmFtZScpXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCAnLScpXG4gICAgLnJlcGxhY2UoL14tfC0kL2csICcnKSB8fCAnd2lyZWZyYW1lJ1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U2VsZWN0ZWQoc2NyZWVucykge1xuICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVucykgfHwgc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1x1ODFGM1x1NUMxMVx1OTAwOVx1NjJFOVx1NEUwMFx1NEUyQSBzY3JlZW4nKVxuICB9XG4gIGF3YWl0IGxvYWRFeHBvcnRMaWJyYXJpZXMoKVxuICBjb25zdCBjYXB0dXJlZCA9IFtdXG4gIGZvciAoY29uc3Qgc2NyZWVuIG9mIHNjcmVlbnMpIHtcbiAgICBjYXB0dXJlZC5wdXNoKHtcbiAgICAgIG5hbWU6IGAke3NsdWcoc2NyZWVuLmlkKX0ucG5nYCxcbiAgICAgIGJsb2I6IGF3YWl0IGNhcHR1cmVTY3JlZW4oc2NyZWVuLmVsZW1lbnQsIHNjcmVlbi52aWV3cG9ydCwge1xuICAgICAgICBleHBhbmRlZDogISFzY3JlZW4uZXhwYW5kZWQsXG4gICAgICB9KSxcbiAgICB9KVxuICB9XG5cbiAgaWYgKGNhcHR1cmVkLmxlbmd0aCA9PT0gMSkge1xuICAgIHdpbmRvdy5zYXZlQXMoY2FwdHVyZWRbMF0uYmxvYiwgY2FwdHVyZWRbMF0ubmFtZSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHppcCA9IG5ldyB3aW5kb3cuSlNaaXAoKVxuICBjYXB0dXJlZC5mb3JFYWNoKChpdGVtKSA9PiB6aXAuZmlsZShpdGVtLm5hbWUsIGl0ZW0uYmxvYikpXG4gIGNvbnN0IGJsb2IgPSBhd2FpdCB6aXAuZ2VuZXJhdGVBc3luYyh7IHR5cGU6ICdibG9iJyB9KVxuICB3aW5kb3cuc2F2ZUFzKGJsb2IsIGAke3NsdWcoc2NyZWVuc1swXS5wcm9qZWN0TmFtZSl9LnppcGApXG59XG4iLCAiaW1wb3J0IHsgYnVpbGRSZXZpZXdQcm9tcHQsIHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBjb3B5VGV4dCh0ZXh0KSB7XG4gIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkICYmIHdpbmRvdy5pc1NlY3VyZUNvbnRleHQpIHJldHVybiBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KVxuICBjb25zdCBhcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICBhcmVhLnZhbHVlID0gdGV4dFxuICBhcmVhLnNldEF0dHJpYnV0ZSgncmVhZG9ubHknLCAnJylcbiAgYXJlYS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgYXJlYS5zdHlsZS5sZWZ0ID0gJy05OTk5cHgnXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoYXJlYSlcbiAgYXJlYS5zZWxlY3QoKVxuICB0cnkge1xuICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdjb3B5JylcbiAgfSBmaW5hbGx5IHtcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGFyZWEpXG4gIH1cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdQYW5lbCh7XG4gIHByb2plY3QsXG4gIHNlbGVjdGlvbnMsXG4gIG11bHRpU2VsZWN0LFxuICBpdGVtcyxcbiAgb25Ub2dnbGVNdWx0aVNlbGVjdCxcbiAgb25TZWxlY3RFbGVtZW50LFxuICBvbkhvdmVyRWxlbWVudCxcbiAgb25SZW1vdmVTZWxlY3Rpb24sXG4gIG9uQ2xlYXJTZWxlY3Rpb24sXG4gIG9uQWRkSXRlbSxcbiAgb25SZW1vdmVJdGVtLFxuICBvbkNsb3NlLFxufSkge1xuICBjb25zdCBzZWxlY3RlZCA9IHNlbGVjdGlvbnNbc2VsZWN0aW9ucy5sZW5ndGggLSAxXSB8fCBudWxsXG4gIGNvbnN0IGdlbmVyYXRlZFByb21wdCA9IFJlYWN0LnVzZU1lbW8oKCkgPT4gYnVpbGRSZXZpZXdQcm9tcHQocHJvamVjdCwgaXRlbXMpLCBbcHJvamVjdCwgaXRlbXNdKVxuICBjb25zdCBbdHlwZSwgc2V0VHlwZV0gPSBSZWFjdC51c2VTdGF0ZSgnY29tbWVudCcpXG4gIGNvbnN0IFtpbnN0cnVjdGlvbiwgc2V0SW5zdHJ1Y3Rpb25dID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtwcm9tcHQsIHNldFByb21wdF0gPSBSZWFjdC51c2VTdGF0ZShnZW5lcmF0ZWRQcm9tcHQpXG4gIGNvbnN0IFtwcm9tcHREaXJ0eSwgc2V0UHJvbXB0RGlydHldID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgY29weVRpbWVyID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXByb21wdERpcnR5KSBzZXRQcm9tcHQoZ2VuZXJhdGVkUHJvbXB0KVxuICB9LCBbZ2VuZXJhdGVkUHJvbXB0LCBwcm9tcHREaXJ0eV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+ICgpID0+IHtcbiAgICBpZiAoY29weVRpbWVyLmN1cnJlbnQpIHdpbmRvdy5jbGVhclRpbWVvdXQoY29weVRpbWVyLmN1cnJlbnQpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGFkZEl0ZW0gPSAoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICBjb25zdCBub3JtYWxpemVkID0gaW5zdHJ1Y3Rpb24udHJpbSgpXG4gICAgaWYgKCFub3JtYWxpemVkICYmIHR5cGUgIT09ICdyZW1vdmUnKSByZXR1cm5cbiAgICBvbkFkZEl0ZW0oe1xuICAgICAgdHlwZSxcbiAgICAgIHRhcmdldHM6IHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+ICh7XG4gICAgICAgIHNjcmVlbklkOiBzZWxlY3Rpb24uc2NyZWVuSWQsXG4gICAgICAgIHNjcmVlblRpdGxlOiBzZWxlY3Rpb24uc2NyZWVuVGl0bGUsXG4gICAgICAgIHNvdXJjZUhpbnQ6IHNlbGVjdGlvbi5zb3VyY2VIaW50LFxuICAgICAgICBzZWxlY3Rvcjogc2VsZWN0aW9uLnNlbGVjdG9yLFxuICAgICAgICBjdXJyZW50VGV4dDogc2VsZWN0aW9uLmN1cnJlbnRUZXh0LFxuICAgICAgfSkpLFxuICAgICAgaW5zdHJ1Y3Rpb246IG5vcm1hbGl6ZWQsXG4gICAgfSlcbiAgICBzZXRJbnN0cnVjdGlvbignJylcbiAgfVxuXG4gIGNvbnN0IHJlZ2VuZXJhdGUgPSAoKSA9PiB7XG4gICAgc2V0UHJvbXB0KGdlbmVyYXRlZFByb21wdClcbiAgICBzZXRQcm9tcHREaXJ0eShmYWxzZSlcbiAgfVxuXG4gIGNvbnN0IGNvcHlQcm9tcHQgPSAoKSA9PiB7XG4gICAgY29weVRleHQocHJvbXB0KS50aGVuKCgpID0+IHtcbiAgICAgIHNldENvcGllZCh0cnVlKVxuICAgICAgaWYgKGNvcHlUaW1lci5jdXJyZW50KSB3aW5kb3cuY2xlYXJUaW1lb3V0KGNvcHlUaW1lci5jdXJyZW50KVxuICAgICAgY29weVRpbWVyLmN1cnJlbnQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBzZXRDb3BpZWQoZmFsc2UpLCAxNDAwKVxuICAgIH0pXG4gIH1cblxuICBjb25zdCBpbnN0cnVjdGlvbkxhYmVsID0gdHlwZSA9PT0gJ3RleHQnXG4gICAgPyAnXHU2NUIwXHU2NTg3XHU1QjU3J1xuICAgIDogdHlwZSA9PT0gJ29yZGVyJ1xuICAgICAgPyAnXHU5ODdBXHU1RThGXHU4OTgxXHU2QzQyJ1xuICAgICAgOiB0eXBlID09PSAncmVtb3ZlJ1xuICAgICAgICA/ICdcdTUyMjBcdTk2NjRcdThCRjRcdTY2MEVcdUZGMDhcdTUzRUZcdTkwMDlcdUZGMDknXG4gICAgICAgIDogJ1x1N0VEOSBBSSBcdTc2ODRcdTRGRUVcdTY1MzlcdTVFRkFcdThCQUUnXG5cbiAgcmV0dXJuIChcbiAgICA8YXNpZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4QlwiPlxuICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcGFuZWwtaGVhZGVyXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWhlYWRpbmdcIj5cbiAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC10aXRsZVwiPlx1NEZFRVx1NjUzOVx1NTM5Rlx1NTc4Qjwvc3Ryb25nPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXJldmlldy1wYW5lbC1jb3VudFwiPntpdGVtcy5sZW5ndGh9IFx1Njc2MVx1NEZFRVx1NjUzOTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbG9zZVwiIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgPC9oZWFkZXI+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXBhbmVsLWJvZHlcIj5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb25cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24taGVhZGluZ1wiPlxuICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uLWhlYWRpbmdcIj5cdTVERjJcdTkwMDlcdTgyODJcdTcwQjkgKHtzZWxlY3Rpb25zLmxlbmd0aH0pPC9oMj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1hY3Rpb25zXCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e211bHRpU2VsZWN0ID8gJ3dmLXJldmlldy1tdWx0aS1zZWxlY3QgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbXVsdGktc2VsZWN0J31cbiAgICAgICAgICAgICAgICBhcmlhLXByZXNzZWQ9e211bHRpU2VsZWN0fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uVG9nZ2xlTXVsdGlTZWxlY3R9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBcdTU5MUFcdTkwMDkge211bHRpU2VsZWN0ID8gJ09OJyA6ICdPRkYnfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1jbGVhci1zZWxlY3Rpb25cIiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17b25DbGVhclNlbGVjdGlvbn0+XHU2RTA1XHU3QTdBPC9idXR0b24+XG4gICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbi1oaW50XCI+XHU1OTFBXHU5MDA5XHU1RjAwXHU1NDJGXHU1NDBFXHU3MEI5XHU1MUZCXHU4MjgyXHU3MEI5XHU1M0VGXHU1MkEwXHU1MTY1XHU2MjE2XHU3OUZCXHU5NjY0XHVGRjFCXHU0RTVGXHU1M0VGXHU2MzA5XHU0RjRGIFNoaWZ0IC8gQ29tbWFuZCAvIEN0cmwgXHU3MEI5XHU1MUZCXHUzMDAyPC9wPlxuICAgICAgICAgIHtzZWxlY3Rpb25zLmxlbmd0aCA+IDAgPyAoXG4gICAgICAgICAgICA8b2wgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlbGVjdGlvbnNcIj5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgPGxpIGNsYXNzTmFtZT17c2VsZWN0aW9uID09PSBzZWxlY3RlZCA/ICd3Zi1yZXZpZXctc2VsZWN0aW9uIGlzLWFjdGl2ZScgOiAnd2YtcmV2aWV3LXNlbGVjdGlvbid9IGtleT17YCR7c2VsZWN0aW9uLnNjcmVlbklkfToke3NlbGVjdGlvbi5zZWxlY3Rvcn1gfT5cbiAgICAgICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tc2VsZWN0b3JcIj57aW5kZXggKyAxfS4ge3NlbGVjdGlvbi5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3Rpb24tcmVtb3ZlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IG9uUmVtb3ZlU2VsZWN0aW9uKHNlbGVjdGlvbi5lbGVtZW50KX0+XHU3OUZCXHU5NjY0PC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgIHtzZWxlY3RlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNjcmVlbi1uYW1lXCI+e3NlbGVjdGVkLnNjcmVlblRpdGxlfSBcdTAwQjcge3NlbGVjdGVkLnNjcmVlbklkfTwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1ic1wiIGFyaWEtbGFiZWw9XCJcdTgyODJcdTcwQjlcdTVDNDJcdTdFQTdcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWQuYW5jZXN0b3JzLm1hcCgoYW5jZXN0b3IsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXthbmNlc3Rvci5zZWxlY3Rvcn0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCA+IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWJyZWFkY3J1bWItc2VwXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIHZpZXdCb3g9XCIwIDAgMjQgMjRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm05IDE4IDYtNi02LTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXJldmlldy1icmVhZGNydW1iXCJcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YW5jZXN0b3Iuc2VsZWN0b3J9XG4gICAgICAgICAgICAgICAgICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiBvbkhvdmVyRWxlbWVudD8uKGFuY2VzdG9yLmVsZW1lbnQpfVxuICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4gb25Ib3ZlckVsZW1lbnQ/LihudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvblNlbGVjdEVsZW1lbnQoYW5jZXN0b3IuZWxlbWVudCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7YW5jZXN0b3IubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxjb2RlIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWxlY3RvclwiPntzZWxlY3RlZC5zZWxlY3Rvcn08L2NvZGU+XG4gICAgICAgICAgICAgIHtzZWxlY3RlZC5jdXJyZW50VGV4dCA/IChcbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctY3VycmVudC10ZXh0XCI+XHU1RjUzXHU1MjREXHVGRjFBe3NlbGVjdGVkLmN1cnJlbnRUZXh0fTwvcD5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGRcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctZmllbGQtbGFiZWxcIj5cdTRGRUVcdTY1MzlcdTdDN0JcdTU3OEI8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNlbGVjdCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1zZWxlY3RcIiB2YWx1ZT17dHlwZX0gb25DaGFuZ2U9eyhldmVudCkgPT4gc2V0VHlwZShldmVudC50YXJnZXQudmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgIHtPYmplY3QuZW50cmllcyhSRVZJRVdfVFlQRV9MQUJFTFMpLm1hcCgoW3ZhbHVlLCBsYWJlbF0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctdHlwZS1vcHRpb25cIiB2YWx1ZT17dmFsdWV9IGtleT17dmFsdWV9PntsYWJlbH08L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWZpZWxkLWxhYmVsXCI+e2luc3RydWN0aW9uTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDx0ZXh0YXJlYVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWluc3RydWN0aW9uXCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtpbnN0cnVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0eXBlID09PSAnb3JkZXInID8gJ1x1NEY4Qlx1NTk4Mlx1RkYxQVx1NzlGQlx1NTJBOFx1NTIzMFx1OEJBMlx1NTM1NVx1NjQ1OFx1ODk4MVx1NEU0Qlx1NTQwRScgOiAnXHU2M0NGXHU4RkYwXHU1RTBDXHU2NzFCIEFJIFx1NTk4Mlx1NEY1NVx1NEZFRVx1NjUzOSd9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiBzZXRJbnN0cnVjdGlvbihldmVudC50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctYWRkXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWluc3RydWN0aW9uLnRyaW0oKSAmJiB0eXBlICE9PSAncmVtb3ZlJ31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXthZGRJdGVtfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU1MkEwXHU1MTY1XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1XHVGRjA4e3NlbGVjdGlvbnMubGVuZ3RofSBcdTRFMkFcdTgyODJcdTcwQjlcdUZGMDlcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU3MEI5XHU1MUZCXHU5ODc1XHU5NzYyXHU0RTJEXHU3Njg0XHU4MjgyXHU3MEI5XHU1RjAwXHU1OUNCXHU4QkM0XHU4QkJBXHUzMDAyXHU3MEI5XHU1MUZCXHU5NzYyXHU1MzA1XHU1QzUxXHU1M0VGXHU1MjA3XHU2MzYyXHU1MjMwXHU3MjM2XHU3RUE3XHU3RUM0XHU0RUY2XHUzMDAyPC9wPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvblwiPlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU0RkVFXHU2NTM5XHU2RTA1XHU1MzU1PC9oMj5cbiAgICAgICAgICB7aXRlbXMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxvbCBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbXNcIj5cbiAgICAgICAgICAgICAge2l0ZW1zLm1hcCgoaXRlbSwgaW5kZXgpID0+IChcbiAgICAgICAgICAgICAgICA8bGkgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW1cIiBrZXk9e2l0ZW0uaWR9PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWl0ZW0tdGl0bGVcIj57aW5kZXggKyAxfS4ge1JFVklFV19UWVBFX0xBQkVMU1tpdGVtLnR5cGVdfTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgICAgICA8Y29kZSBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctaXRlbS1zZWxlY3RvclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZXZpZXdUYXJnZXRzKGl0ZW0pLm1hcCgodGFyZ2V0KSA9PiB0YXJnZXQuc2VsZWN0b3IpLmpvaW4oJ1x1MzAwMScpfVxuICAgICAgICAgICAgICAgICAgICA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWluc3RydWN0aW9uXCI+e2l0ZW0uaW5zdHJ1Y3Rpb24gfHwgJ1x1NTIyMFx1OTY2NFx1OEJFNVx1ODI4Mlx1NzBCOVx1RkYwQ1x1NUU3Nlx1NTQwQ1x1NkI2NVx1NkUwNVx1NzQwNlx1NjVFMFx1NzUyOFx1NEVFM1x1NzgwMVx1MzAwMid9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1pdGVtLWRlbGV0ZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBvblJlbW92ZUl0ZW0oaXRlbS5pZCl9Plx1NTIyMFx1OTY2NDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWVtcHR5XCI+XHU4RkQ4XHU2Q0ExXHU2NzA5XHU0RkVFXHU2NTM5XHU2MTBGXHU4OUMxXHUzMDAyPC9wPn1cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1zZWN0aW9uIHdmLXJldmlldy1wcm9tcHQtc2VjdGlvblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtcmV2aWV3LXNlY3Rpb24tdGl0bGVcIj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctc2VjdGlvbi1oZWFkaW5nXCI+XHU2NzAwXHU3RUM4IFByb21wdDwvaDI+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1yZWdlbmVyYXRlXCIgdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3JlZ2VuZXJhdGV9Plx1OTFDRFx1NjVCMFx1NzUxRlx1NjIxMDwvYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHtwcm9tcHREaXJ0eSA/IDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYW51YWxcIj5Qcm9tcHQgXHU1REYyXHU2MjRCXHU1MkE4XHU0RkVFXHU2NTM5XHVGRjFCXHU5MUNEXHU2NUIwXHU3NTFGXHU2MjEwXHU0RjFBXHU4OTg2XHU3NkQ2XHU2MjRCXHU1MkE4XHU1MTg1XHU1QkI5XHUzMDAyPC9wPiA6IG51bGx9XG4gICAgICAgICAgPHRleHRhcmVhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctcHJvbXB0XCJcbiAgICAgICAgICAgIHZhbHVlPXtwcm9tcHR9XG4gICAgICAgICAgICBvbkNoYW5nZT17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIHNldFByb21wdChldmVudC50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIHNldFByb21wdERpcnR5KHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtcmV2aWV3LWNvcHlcIiBvbkNsaWNrPXtjb3B5UHJvbXB0fT5cbiAgICAgICAgICAgIHtjb3BpZWQgPyAnXHU1REYyXHU1OTBEXHU1MjM2JyA6ICdcdTU5MERcdTUyMzYgUHJvbXB0J31cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgPC9hc2lkZT5cbiAgKVxufVxuIiwgImltcG9ydCB7IHJldmlld1RhcmdldHMsIFJFVklFV19UWVBFX0xBQkVMUyB9IGZyb20gJy4vcmV2aWV3LmpzJ1xuXG5mdW5jdGlvbiBzYW1lUG9zaXRpb25zKGxlZnQsIHJpZ2h0KSB7XG4gIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGxlZnQuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgY29uc3Qgb3RoZXIgPSByaWdodFtpbmRleF1cbiAgICByZXR1cm4gaXRlbS5rZXkgPT09IG90aGVyLmtleVxuICAgICAgJiYgaXRlbS5pdGVtID09PSBvdGhlci5pdGVtXG4gICAgICAmJiBpdGVtLml0ZW1JbmRleCA9PT0gb3RoZXIuaXRlbUluZGV4XG4gICAgICAmJiBpdGVtLmxlZnQgPT09IG90aGVyLmxlZnRcbiAgICAgICYmIGl0ZW0udG9wID09PSBvdGhlci50b3BcbiAgfSlcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBjbGlwKSB7XG4gIGNvbnN0IGxlZnQgPSBNYXRoLm1heChyZWN0LmxlZnQsIGNsaXAubGVmdClcbiAgY29uc3QgcmlnaHQgPSBNYXRoLm1pbihyZWN0LnJpZ2h0LCBjbGlwLnJpZ2h0KVxuICBjb25zdCB0b3AgPSBNYXRoLm1heChyZWN0LnRvcCwgY2xpcC50b3ApXG4gIGNvbnN0IGJvdHRvbSA9IE1hdGgubWluKHJlY3QuYm90dG9tLCBjbGlwLmJvdHRvbSlcbiAgaWYgKHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuIG51bGxcbiAgcmV0dXJuIHsgbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tIH1cbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVBvc2l0aW9ucyhib2FyZCwgaXRlbXMpIHtcbiAgaWYgKCFib2FyZCkgcmV0dXJuIFtdXG4gIGNvbnN0IGJvYXJkUmVjdCA9IGJvYXJkLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gIGNvbnN0IHBvc2l0aW9ucyA9IFtdXG5cbiAgaXRlbXMuZm9yRWFjaCgoaXRlbSwgaXRlbUluZGV4KSA9PiB7XG4gICAgcmV2aWV3VGFyZ2V0cyhpdGVtKS5mb3JFYWNoKCh0YXJnZXQsIHRhcmdldEluZGV4KSA9PiB7XG4gICAgICBsZXQgZWxlbWVudCA9IG51bGxcbiAgICAgIHRyeSB7XG4gICAgICAgIGVsZW1lbnQgPSBib2FyZC5xdWVyeVNlbGVjdG9yKHRhcmdldC5zZWxlY3RvcilcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghZWxlbWVudD8uaXNDb25uZWN0ZWQpIHJldHVyblxuICAgICAgY29uc3Qgc2NyZWVuQ29udGVudCA9IGVsZW1lbnQuY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JylcbiAgICAgIGlmICghc2NyZWVuQ29udGVudCkgcmV0dXJuXG4gICAgICBjb25zdCB2aXNpYmxlID0gaW50ZXJzZWN0UmVjdChlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLCBzY3JlZW5Db250ZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpKVxuICAgICAgaWYgKCF2aXNpYmxlKSByZXR1cm5cbiAgICAgIGNvbnN0IGJhc2VMZWZ0ID0gTWF0aC5yb3VuZCh2aXNpYmxlLnJpZ2h0IC0gYm9hcmRSZWN0LmxlZnQpXG4gICAgICBjb25zdCBiYXNlVG9wID0gTWF0aC5yb3VuZCh2aXNpYmxlLnRvcCAtIGJvYXJkUmVjdC50b3ApXG4gICAgICBjb25zdCBvdmVybGFwQ291bnQgPSBwb3NpdGlvbnMuZmlsdGVyKFxuICAgICAgICAocG9zaXRpb24pID0+IE1hdGguYWJzKHBvc2l0aW9uLmJhc2VMZWZ0IC0gYmFzZUxlZnQpIDwgMiAmJiBNYXRoLmFicyhwb3NpdGlvbi5iYXNlVG9wIC0gYmFzZVRvcCkgPCAyLFxuICAgICAgKS5sZW5ndGhcbiAgICAgIHBvc2l0aW9ucy5wdXNoKHtcbiAgICAgICAga2V5OiBgJHtpdGVtLmlkfToke3RhcmdldEluZGV4fWAsXG4gICAgICAgIGl0ZW0sXG4gICAgICAgIGl0ZW1JbmRleCxcbiAgICAgICAgdGFyZ2V0SW5kZXgsXG4gICAgICAgIGJhc2VMZWZ0LFxuICAgICAgICBiYXNlVG9wLFxuICAgICAgICBsZWZ0OiBiYXNlTGVmdCArIG92ZXJsYXBDb3VudCAqIDE1LFxuICAgICAgICB0b3A6IGJhc2VUb3AsXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG5cbiAgcmV0dXJuIHBvc2l0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmV2aWV3TWFya2Vycyh7IGJvYXJkUmVmLCBpdGVtcywgb25PcGVuUGFuZWwgfSkge1xuICBjb25zdCBbcG9zaXRpb25zLCBzZXRQb3NpdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFthY3RpdmVLZXksIHNldEFjdGl2ZUtleV0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuICBjb25zdCBmcmFtZVJlZiA9IFJlYWN0LnVzZVJlZihudWxsKVxuXG4gIGNvbnN0IHJlZnJlc2ggPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IHJlc29sdmVQb3NpdGlvbnMoYm9hcmRSZWYuY3VycmVudCwgaXRlbXMpXG4gICAgc2V0UG9zaXRpb25zKChjdXJyZW50KSA9PiBzYW1lUG9zaXRpb25zKGN1cnJlbnQsIG5leHQpID8gY3VycmVudCA6IG5leHQpXG4gIH0sIFtib2FyZFJlZiwgaXRlbXNdKVxuXG4gIGNvbnN0IHNjaGVkdWxlUmVmcmVzaCA9IFJlYWN0LnVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBpZiAoZnJhbWVSZWYuY3VycmVudCkgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVmLmN1cnJlbnQpXG4gICAgZnJhbWVSZWYuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgZnJhbWVSZWYuY3VycmVudCA9IG51bGxcbiAgICAgIHJlZnJlc2goKVxuICAgIH0pXG4gIH0sIFtyZWZyZXNoXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3Qoc2NoZWR1bGVSZWZyZXNoKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgY2FwdHVyZTogdHJ1ZSwgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNjaGVkdWxlUmVmcmVzaClcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2NoZWR1bGVSZWZyZXNoLCBvcHRpb25zKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignd2hlZWwnLCBzY2hlZHVsZVJlZnJlc2gsIG9wdGlvbnMpXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2NoZWR1bGVSZWZyZXNoLCB0cnVlKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2NoZWR1bGVSZWZyZXNoKVxuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdwb2ludGVybW92ZScsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd3aGVlbCcsIHNjaGVkdWxlUmVmcmVzaCwgb3B0aW9ucylcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHNjaGVkdWxlUmVmcmVzaCwgdHJ1ZSlcbiAgICAgIGlmIChmcmFtZVJlZi5jdXJyZW50KSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVSZWYuY3VycmVudClcbiAgICB9XG4gIH0sIFtzY2hlZHVsZVJlZnJlc2hdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGFjdGl2ZUtleSAmJiAhcG9zaXRpb25zLnNvbWUoKHBvc2l0aW9uKSA9PiBwb3NpdGlvbi5rZXkgPT09IGFjdGl2ZUtleSkpIHNldEFjdGl2ZUtleShudWxsKVxuICB9LCBbYWN0aXZlS2V5LCBwb3NpdGlvbnNdKVxuXG4gIGNvbnN0IGFjdGl2ZSA9IHBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24ua2V5ID09PSBhY3RpdmVLZXkpXG4gIGNvbnN0IGJvYXJkV2lkdGggPSBib2FyZFJlZi5jdXJyZW50Py5jbGllbnRXaWR0aCB8fCAwXG4gIGNvbnN0IGJvYXJkSGVpZ2h0ID0gYm9hcmRSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0IHx8IDBcbiAgY29uc3QgYnViYmxlTGVmdCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUubGVmdCArIDE2LCBib2FyZFdpZHRoIC0gMzM2KSkgOiAwXG4gIGNvbnN0IGJ1YmJsZVRvcCA9IGFjdGl2ZSA/IE1hdGgubWF4KDEyLCBNYXRoLm1pbihhY3RpdmUudG9wICsgMjQsIGJvYXJkSGVpZ2h0IC0gMTgwKSkgOiAwXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXJzXCIgYXJpYS1sYWJlbD1cIlx1NEZFRVx1NjUzOVx1NjgwN1x1OEJCMFwiPlxuICAgICAge3Bvc2l0aW9ucy5tYXAoKHBvc2l0aW9uKSA9PiAoXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICBjbGFzc05hbWU9e2FjdGl2ZUtleSA9PT0gcG9zaXRpb24ua2V5ID8gJ3dmLXJldmlldy1tYXJrZXIgaXMtYWN0aXZlJyA6ICd3Zi1yZXZpZXctbWFya2VyJ31cbiAgICAgICAgICBrZXk9e3Bvc2l0aW9uLmtleX1cbiAgICAgICAgICBhcmlhLWxhYmVsPXtgXHU0RkVFXHU2NTM5ICR7cG9zaXRpb24uaXRlbUluZGV4ICsgMX1cdUZGMUEke1JFVklFV19UWVBFX0xBQkVMU1twb3NpdGlvbi5pdGVtLnR5cGVdfWB9XG4gICAgICAgICAgc3R5bGU9e3sgbGVmdDogcG9zaXRpb24ubGVmdCwgdG9wOiBwb3NpdGlvbi50b3AgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgICBzZXRBY3RpdmVLZXkoKGN1cnJlbnQpID0+IGN1cnJlbnQgPT09IHBvc2l0aW9uLmtleSA/IG51bGwgOiBwb3NpdGlvbi5rZXkpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwb3NpdGlvbi5pdGVtSW5kZXggKyAxfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgICAge2FjdGl2ZSA/IChcbiAgICAgICAgPGFzaWRlXG4gICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyXCJcbiAgICAgICAgICBzdHlsZT17eyBsZWZ0OiBidWJibGVMZWZ0LCB0b3A6IGJ1YmJsZVRvcCB9fVxuICAgICAgICAgIGFyaWEtbGFiZWw9e2BcdTRGRUVcdTY1MzkgJHthY3RpdmUuaXRlbUluZGV4ICsgMX1gfVxuICAgICAgICA+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbWFya2VyLXBvcG92ZXItaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10aXRsZVwiPlxuICAgICAgICAgICAgICB7YWN0aXZlLml0ZW1JbmRleCArIDF9LiB7UkVWSUVXX1RZUEVfTEFCRUxTW2FjdGl2ZS5pdGVtLnR5cGVdfVxuICAgICAgICAgICAgPC9zdHJvbmc+XG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1jbG9zZVwiIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVLZXkobnVsbCl9Plx1NTE3M1x1OTVFRDwvYnV0dG9uPlxuICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci1pbnN0cnVjdGlvblwiPlxuICAgICAgICAgICAge2FjdGl2ZS5pdGVtLmluc3RydWN0aW9uIHx8ICdcdTUyMjBcdTk2NjRcdThCRTVcdTgyODJcdTcwQjlcdUZGMENcdTVFNzZcdTU0MENcdTZCNjVcdTZFMDVcdTc0MDZcdTY1RTBcdTc1MjhcdTRFRTNcdTc4MDFcdTMwMDInfVxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXJldmlldy1tYXJrZXItcG9wb3Zlci10YXJnZXRzXCI+XG4gICAgICAgICAgICB7cmV2aWV3VGFyZ2V0cyhhY3RpdmUuaXRlbSkubWFwKCh0YXJnZXQpID0+IChcbiAgICAgICAgICAgICAgPGNvZGUgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLXNlbGVjdG9yXCIga2V5PXt0YXJnZXQuc2VsZWN0b3J9Pnt0YXJnZXQuc2VsZWN0b3J9PC9jb2RlPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtcmV2aWV3LW1hcmtlci1wb3BvdmVyLW1vcmVcIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEFjdGl2ZUtleShudWxsKVxuICAgICAgICAgICAgICBvbk9wZW5QYW5lbD8uKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgXHU2N0U1XHU3NzBCXHU2NkY0XHU1OTFBXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvYXNpZGU+XG4gICAgICApIDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImNvbnN0IExBVU5DSEVSX1NJWkUgPSA0OFxuY29uc3QgTEFVTkNIRVJfTUFSR0lOID0gMjBcbmNvbnN0IERSQUdfVEhSRVNIT0xEID0gNFxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZSwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW4pLCBNYXRoLm1heChtaW4sIG1heCkpXG59XG5cbmZ1bmN0aW9uIGNsYW1wUG9zaXRpb24oYm9hcmQsIHBvc2l0aW9uKSB7XG4gIGlmICghYm9hcmQpIHJldHVybiBwb3NpdGlvblxuICByZXR1cm4ge1xuICAgIHg6IGNsYW1wKHBvc2l0aW9uLngsIExBVU5DSEVSX01BUkdJTiwgYm9hcmQuY2xpZW50V2lkdGggLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOKSxcbiAgICB5OiBjbGFtcChwb3NpdGlvbi55LCBMQVVOQ0hFUl9NQVJHSU4sIGJvYXJkLmNsaWVudEhlaWdodCAtIExBVU5DSEVSX1NJWkUgLSBMQVVOQ0hFUl9NQVJHSU4pLFxuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRQb3NpdGlvbihib2FyZCkge1xuICByZXR1cm4gY2xhbXBQb3NpdGlvbihib2FyZCwge1xuICAgIHg6IGJvYXJkLmNsaWVudFdpZHRoIC0gTEFVTkNIRVJfU0laRSAtIExBVU5DSEVSX01BUkdJTixcbiAgICB5OiBib2FyZC5jbGllbnRIZWlnaHQgLSBMQVVOQ0hFUl9TSVpFIC0gTEFVTkNIRVJfTUFSR0lOLFxuICB9KVxufVxuXG5mdW5jdGlvbiByZWFkUG9zaXRpb24oc3RvcmFnZUtleSkge1xuICB0cnkge1xuICAgIGNvbnN0IHZhbHVlID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZUtleSkpXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZT8ueCkgJiYgTnVtYmVyLmlzRmluaXRlKHZhbHVlPy55KSkgcmV0dXJuIHZhbHVlXG4gIH0gY2F0Y2gge1xuICAgIC8vIGxvY2FsU3RvcmFnZSBtYXkgYmUgdW5hdmFpbGFibGUgZm9yIGEgZGlyZWN0bHkgb3BlbmVkIGxvY2FsIGZpbGUuXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZnVuY3Rpb24gc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uKSB7XG4gIHRyeSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VLZXksIEpTT04uc3RyaW5naWZ5KHBvc2l0aW9uKSlcbiAgfSBjYXRjaCB7XG4gICAgLy8gS2VlcGluZyB0aGUgbGF1bmNoZXIgZHJhZ2dhYmxlIGlzIG1vcmUgaW1wb3J0YW50IHRoYW4gcGVyc2lzdGVuY2UuXG4gIH1cbn1cblxuZnVuY3Rpb24gQ29tbWVudEljb24oKSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1yZXZpZXctbGF1bmNoZXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIDxwYXRoIGQ9XCJNNSA0LjVoMTRhMiAyIDAgMCAxIDIgMnY4YTIgMiAwIDAgMS0yIDJoLTZsLTQuNSAzdi0zSDVhMiAyIDAgMCAxLTItMnYtOGEyIDIgMCAwIDEgMi0yWlwiIC8+XG4gICAgICA8cGF0aCBkPVwiTTcuNSAxMC41aDlcIiAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZXZpZXdMYXVuY2hlcih7IGJvYXJkUmVmLCBjb3VudCwgcHJvamVjdE5hbWUsIG9uT3BlbiB9KSB7XG4gIGNvbnN0IHN0b3JhZ2VLZXkgPSBgd2YtcmV2aWV3LWxhdW5jaGVyLXBvc2l0aW9uOiR7cHJvamVjdE5hbWV9YFxuICBjb25zdCBbcG9zaXRpb24sIHNldFBvc2l0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtkcmFnZ2luZywgc2V0RHJhZ2dpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3QgcG9zaXRpb25SZWYgPSBSZWFjdC51c2VSZWYobnVsbClcbiAgY29uc3Qgc3VwcHJlc3NDbGlja1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcblxuICBjb25zdCB1cGRhdGVQb3NpdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChuZXh0KSA9PiB7XG4gICAgY29uc3QgY2xhbXBlZCA9IGNsYW1wUG9zaXRpb24oYm9hcmRSZWYuY3VycmVudCwgbmV4dClcbiAgICBwb3NpdGlvblJlZi5jdXJyZW50ID0gY2xhbXBlZFxuICAgIHNldFBvc2l0aW9uKGNsYW1wZWQpXG4gICAgcmV0dXJuIGNsYW1wZWRcbiAgfSwgW2JvYXJkUmVmXSlcblxuICBSZWFjdC51c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGJvYXJkID0gYm9hcmRSZWYuY3VycmVudFxuICAgIGlmICghYm9hcmQpIHJldHVybiB1bmRlZmluZWRcbiAgICB1cGRhdGVQb3NpdGlvbihyZWFkUG9zaXRpb24oc3RvcmFnZUtleSkgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkKSlcblxuICAgIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSB1cGRhdGVQb3NpdGlvbihwb3NpdGlvblJlZi5jdXJyZW50IHx8IGRlZmF1bHRQb3NpdGlvbihib2FyZCkpXG4gICAgICBzYXZlUG9zaXRpb24oc3RvcmFnZUtleSwgbmV4dClcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgfSwgW2JvYXJkUmVmLCBzdG9yYWdlS2V5LCB1cGRhdGVQb3NpdGlvbl0pXG5cbiAgY29uc3QgZmluaXNoRHJhZyA9IChldmVudCkgPT4ge1xuICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICBpZiAoIWRyYWcgfHwgZHJhZy5wb2ludGVySWQgIT09IGV2ZW50LnBvaW50ZXJJZCkgcmV0dXJuXG4gICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZHJhZy5tb3ZlZFxuICAgIGRyYWdSZWYuY3VycmVudCA9IG51bGxcbiAgICBzZXREcmFnZ2luZyhmYWxzZSlcbiAgICBpZiAocG9zaXRpb25SZWYuY3VycmVudCkgc2F2ZVBvc2l0aW9uKHN0b3JhZ2VLZXksIHBvc2l0aW9uUmVmLmN1cnJlbnQpXG4gICAgaWYgKGV2ZW50LmN1cnJlbnRUYXJnZXQuaGFzUG9pbnRlckNhcHR1cmU/LihldmVudC5wb2ludGVySWQpKSB7XG4gICAgICBldmVudC5jdXJyZW50VGFyZ2V0LnJlbGVhc2VQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgfVxuICB9XG5cbiAgaWYgKGNvdW50IDw9IDApIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17ZHJhZ2dpbmcgPyAnd2YtcmV2aWV3LWxhdW5jaGVyIGlzLWRyYWdnaW5nJyA6ICd3Zi1yZXZpZXctbGF1bmNoZXInfVxuICAgICAgc3R5bGU9e3Bvc2l0aW9uID8geyBsZWZ0OiBwb3NpdGlvbi54LCB0b3A6IHBvc2l0aW9uLnkgfSA6IHsgcmlnaHQ6IExBVU5DSEVSX01BUkdJTiwgYm90dG9tOiBMQVVOQ0hFUl9NQVJHSU4gfX1cbiAgICAgIGFyaWEtbGFiZWw9e2BcdTVDNTVcdTVGMDBcdThCQzRcdThCQkFcdUZGMENcdTUxNzEgJHtjb3VudH0gXHU2NzYxXHU0RkVFXHU2NTM5YH1cbiAgICAgIGRhdGEtdG9vbHRpcD1cIlx1NUM1NVx1NUYwMFx1OEJDNFx1OEJCQVwiXG4gICAgICBvblBvaW50ZXJEb3duPXsoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiAhPT0gMCkgcmV0dXJuXG4gICAgICAgIGNvbnN0IG9yaWdpbiA9IHBvc2l0aW9uUmVmLmN1cnJlbnQgfHwgZGVmYXVsdFBvc2l0aW9uKGJvYXJkUmVmLmN1cnJlbnQpXG4gICAgICAgIGRyYWdSZWYuY3VycmVudCA9IHtcbiAgICAgICAgICBwb2ludGVySWQ6IGV2ZW50LnBvaW50ZXJJZCxcbiAgICAgICAgICBzdGFydFg6IGV2ZW50LmNsaWVudFgsXG4gICAgICAgICAgc3RhcnRZOiBldmVudC5jbGllbnRZLFxuICAgICAgICAgIG9yaWdpbixcbiAgICAgICAgICBtb3ZlZDogZmFsc2UsXG4gICAgICAgIH1cbiAgICAgICAgc3VwcHJlc3NDbGlja1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICAgICAgZXZlbnQuY3VycmVudFRhcmdldC5zZXRQb2ludGVyQ2FwdHVyZShldmVudC5wb2ludGVySWQpXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyTW92ZT17KGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGRyYWcgPSBkcmFnUmVmLmN1cnJlbnRcbiAgICAgICAgaWYgKCFkcmFnIHx8IGRyYWcucG9pbnRlcklkICE9PSBldmVudC5wb2ludGVySWQpIHJldHVyblxuICAgICAgICBjb25zdCBkZWx0YVggPSBldmVudC5jbGllbnRYIC0gZHJhZy5zdGFydFhcbiAgICAgICAgY29uc3QgZGVsdGFZID0gZXZlbnQuY2xpZW50WSAtIGRyYWcuc3RhcnRZXG4gICAgICAgIGlmICghZHJhZy5tb3ZlZCAmJiBNYXRoLmh5cG90KGRlbHRhWCwgZGVsdGFZKSA8IERSQUdfVEhSRVNIT0xEKSByZXR1cm5cbiAgICAgICAgZHJhZy5tb3ZlZCA9IHRydWVcbiAgICAgICAgc2V0RHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oeyB4OiBkcmFnLm9yaWdpbi54ICsgZGVsdGFYLCB5OiBkcmFnLm9yaWdpbi55ICsgZGVsdGFZIH0pXG4gICAgICB9fVxuICAgICAgb25Qb2ludGVyVXA9e2ZpbmlzaERyYWd9XG4gICAgICBvblBvaW50ZXJDYW5jZWw9e2ZpbmlzaERyYWd9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGlmIChzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzdXBwcmVzc0NsaWNrUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIG9uT3BlbigpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxDb21tZW50SWNvbiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtcmV2aWV3LWxhdW5jaGVyLWNvdW50XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+e2NvdW50fTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuIiwgImV4cG9ydCBjb25zdCBVTlNBVkVEX1JFVklFV19NRVNTQUdFID0gJ1x1NEZFRVx1NjUzOVx1NTE4NVx1NUJCOVx1NUMxQVx1NjcyQVx1NEZERFx1NUI1OFx1RkYwQ1x1NzlCQlx1NUYwMFx1OTg3NVx1OTc2Mlx1NTQwRVx1NEYxQVx1NEUyMlx1NTkzMVx1MzAwMlx1NjYyRlx1NTQyNlx1N0VFN1x1N0VFRFx1RkYxRidcblxuZXhwb3J0IGZ1bmN0aW9uIHByZXZlbnRVbnNhdmVkUmV2aWV3RXhpdChldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gIGV2ZW50LnJldHVyblZhbHVlID0gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxuICByZXR1cm4gVU5TQVZFRF9SRVZJRVdfTUVTU0FHRVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBDYW52YXNNb2RlLCBydW5FeHBvcnRXaXRoRmVlZGJhY2sgfSBmcm9tICcuL0NhbnZhc01vZGUuanN4J1xuaW1wb3J0IHsgRGVtb01vZGUgfSBmcm9tICcuL0RlbW9Nb2RlLmpzeCdcbmltcG9ydCB7IHJlc29sdmVFeHBhbmRUYXJnZXRzIH0gZnJvbSAnLi9leHBhbmQuanMnXG5pbXBvcnQgeyBleHBvcnRTZWxlY3RlZCB9IGZyb20gJy4vZXhwb3J0LmpzJ1xuaW1wb3J0IHsgY2FuVXNlRGVtbyB9IGZyb20gJy4vdmFsaWRhdGlvbi5qcydcbmltcG9ydCB7IGNsYW1wU2NhbGUgfSBmcm9tICcuL25hdmlnYXRpb24uanMnXG5pbXBvcnQgeyBSZXZpZXdQYW5lbCB9IGZyb20gJy4vUmV2aWV3UGFuZWwuanN4J1xuaW1wb3J0IHsgUmV2aWV3TWFya2VycyB9IGZyb20gJy4vUmV2aWV3TWFya2Vycy5qc3gnXG5pbXBvcnQgeyBSZXZpZXdMYXVuY2hlciB9IGZyb20gJy4vUmV2aWV3TGF1bmNoZXIuanN4J1xuaW1wb3J0IHsgZGVzY3JpYmVSZXZpZXdFbGVtZW50IH0gZnJvbSAnLi9yZXZpZXcuanMnXG5pbXBvcnQgeyBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQgfSBmcm9tICcuL2JlZm9yZS11bmxvYWQuanMnXG5cbmNvbnN0IFZJRVdQT1JUX0xBQkVMUyA9IHtcbiAgbW9iaWxlOiAnXHU2MjRCXHU2NzNBJyxcbiAgZGVza3RvcDogJ1x1Njg0Q1x1OTc2MicsXG59XG5cbmZ1bmN0aW9uIFpvb21Db250cm9scyh7IHNjYWxlLCBzZXRTY2FsZSwgb25SZXNldCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi16b29tLWNvbnRyb2xzXCI+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1N0YyOVx1NUMwRlwiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSAtIDAuMSkpfT4tPC9idXR0b24+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi16b29tLXZhbHVlXCI+e01hdGgucm91bmQoc2NhbGUgKiAxMDApfSU8L3NwYW4+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1NjUzRVx1NTkyN1wiIG9uQ2xpY2s9eygpID0+IHNldFNjYWxlKCh2YWx1ZSkgPT4gY2xhbXBTY2FsZSh2YWx1ZSArIDAuMSkpfT4rPC9idXR0b24+XG4gICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cIlx1OTFDRFx1N0Y2RVx1N0YyOVx1NjUzRVwiIG9uQ2xpY2s9e29uUmVzZXR9Plx1NTkwRFx1NEY0RDwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8qKiBMdWNpZGUgXHU5OENFXHU2ODNDXHU1REU1XHU1MTc3XHU2ODBGXHU1NkZFXHU2ODA3XHUzMDAyXHU0RUM1XHU3NTI4XHU0RThFXHU2ODQ2XHU2N0I2IGNocm9tZVx1MzAwMiAqL1xuZnVuY3Rpb24gVG9vbGJhckljb24oeyBuYW1lIH0pIHtcbiAgY29uc3QgcGF0aHMgPSB7XG4gICAgZWRpdDogPD48cGF0aCBkPVwiTTEyIDIwaDlcIiAvPjxwYXRoIGQ9XCJNMTYuNSAzLjVhMi4xMiAyLjEyIDAgMCAxIDMgM0w3IDE5bC00IDEgMS00WlwiIC8+PC8+LFxuICAgIGZ1bGxzY3JlZW46IDw+PHBhdGggZD1cIk04IDNINWEyIDIgMCAwIDAtMiAydjNcIiAvPjxwYXRoIGQ9XCJNMjEgOFY1YTIgMiAwIDAgMC0yLTJoLTNcIiAvPjxwYXRoIGQ9XCJNMyAxNnYzYTIgMiAwIDAgMCAyIDJoM1wiIC8+PHBhdGggZD1cIk0xNiAyMWgzYTIgMiAwIDAgMCAyLTJ2LTNcIiAvPjwvPixcbiAgICBleHBhbmQ6IDw+PHBhdGggZD1cIm03IDE1IDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJtNyA5IDUtNSA1IDVcIiAvPjwvPixcbiAgICBjb2xsYXBzZTogPD48cGF0aCBkPVwibTcgMjAgNS01IDUgNVwiIC8+PHBhdGggZD1cIm03IDQgNSA1IDUtNVwiIC8+PC8+LFxuICAgIGRvd25sb2FkOiA8PjxwYXRoIGQ9XCJNMTIgM3YxMlwiIC8+PHBhdGggZD1cIm03IDEwIDUgNSA1LTVcIiAvPjxwYXRoIGQ9XCJNNSAyMWgxNFwiIC8+PC8+LFxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8c3ZnIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvblwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgIHtwYXRoc1tuYW1lXX1cbiAgICA8L3N2Zz5cbiAgKVxufVxuXG4vKiogXHU3RUJGXHU2ODQ2XHU5NTAxXHVGRjFBXHU1RjAwXHU5NTAxPVx1NTNFRlx1NEVBNFx1NEU5Mlx1RkYwQ1x1OTVFRFx1OTUwMT1cdTRFMERcdTUzRUZcdTRFQTRcdTRFOTJcdTMwMDJcdTY4NDZcdTY3QjYgY2hyb21lIFx1NTNFRlx1NzUyOCBTVkdcdTMwMDIgKi9cbmZ1bmN0aW9uIExvY2tJY29uKHsgb3BlbiB9KSB7XG4gIHJldHVybiAoXG4gICAgPHN2ZyBjbGFzc05hbWU9XCJ3Zi1sb2NrLWljb25cIiB2aWV3Qm94PVwiMCAwIDE0IDE0XCIgd2lkdGg9XCIxNFwiIGhlaWdodD1cIjE0XCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICB7b3BlbiA/IChcbiAgICAgICAgLy8gXHU1RjAwXHU5NTAxXHVGRjFBXHU2ODgxXHU0RUNFXHU1REU2XHU0RkE3XHU3QUNCXHU4RDc3XHU1NDBFXHU1NDExXHU1M0YzXHU0RTBBXHU2MEFDXHU3QTdBXHVGRjBDXHU1M0YzXHU4MTFBXHU0RTBEXHU2MjYzXHU1NkRFXHU5NTAxXHU0RjUzXG4gICAgICAgIDxwYXRoXG4gICAgICAgICAgZD1cIk00LjI1IDYuNzVWNC4zNWEyLjc1IDIuNzUgMCAwIDEgNS4zNS0uMlwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8cGF0aFxuICAgICAgICAgIGQ9XCJNNC4yNSA2Ljc1VjQuNWEyLjc1IDIuNzUgMCAwIDEgNS41IDB2Mi4yNVwiXG4gICAgICAgICAgZmlsbD1cIm5vbmVcIlxuICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiXG4gICAgICAgICAgc3Ryb2tlV2lkdGg9XCIxLjVcIlxuICAgICAgICAgIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiXG4gICAgICAgIC8+XG4gICAgICApfVxuICAgICAgPHJlY3QgeD1cIjIuNzVcIiB5PVwiNi43NVwiIHdpZHRoPVwiOC41XCIgaGVpZ2h0PVwiNS41XCIgcng9XCIxLjI1XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIC8+XG4gICAgPC9zdmc+XG4gIClcbn1cblxuLyoqIGludGVyYWN0aXZlPXRydWUgXHU2NjNFXHU3OTNBXHU1RjAwXHU5NTAxXHUzMDBDXHU1M0VGXHU0RUE0XHU0RTkyXHUzMDBEXHVGRjFCZmFsc2UgXHU0RTNBXHU0RTBBXHU5NTAxXHVGRjBDXHU1M0VGXHU3NkY0XHU2M0E1XHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFICovXG5mdW5jdGlvbiBJbnRlcmFjdGlvbkxvY2soeyBpbnRlcmFjdGl2ZSwgb25Ub2dnbGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtpbnRlcmFjdGl2ZSA/ICd3Zi1pbnRlcmFjdGlvbi1sb2NrJyA6ICd3Zi1pbnRlcmFjdGlvbi1sb2NrIGlzLWxvY2tlZCd9XG4gICAgICBvbkNsaWNrPXtvblRvZ2dsZX1cbiAgICAgIGFyaWEtcHJlc3NlZD17IWludGVyYWN0aXZlfVxuICAgICAgdGl0bGU9e2ludGVyYWN0aXZlXG4gICAgICAgID8gJ1x1NUY1M1x1NTI0RFx1NTNFRlx1NEVBNFx1NEU5Mlx1OTg3NVx1OTc2Mlx1MzAwMlx1NzBCOVx1NTFGQlx1OTUwMVx1NEY0Rlx1NTQwRVx1RkYxQVx1NjJENlx1NjJGRFx1NUU3M1x1NzlGQlx1NzUzQlx1NUUwM1x1RkYwQ1x1NkVEQVx1OEY2RVx1N0YyOVx1NjUzRVx1RkYxQlx1NEU1Rlx1NTNFRlx1NjMwOVx1NEY0Rlx1N0E3QVx1NjgzQ1x1NEUzNFx1NjVGNlx1OTUwMVx1NEY0RidcbiAgICAgICAgOiAnXHU1RjUzXHU1MjREXHU1REYyXHU5NTAxXHU0RjRGXHUzMDAyXHU2MkQ2XHU2MkZEXHU1RTczXHU3OUZCXHUzMDAxXHU2RURBXHU4RjZFXHU3RjI5XHU2NTNFXHVGRjFCXHU5ODc1XHU5NzYyXHU1MTg1XHU3MEI5XHU1MUZCXHU0RTBFXHU2RURBXHU1MkE4XHU1REYyXHU3OTgxXHU3NTI4XHUzMDAyXHU3MEI5XHU1MUZCXHU2MDYyXHU1OTBEXHU1M0VGXHU0RUE0XHU0RTkyJ31cbiAgICA+XG4gICAgICA8TG9ja0ljb24gb3Blbj17aW50ZXJhY3RpdmV9IC8+XG4gICAgICA8c3Bhbj57aW50ZXJhY3RpdmUgPyAnXHU1M0VGXHU0RUE0XHU0RTkyJyA6ICdcdTRFMERcdTUzRUZcdTRFQTRcdTRFOTInfTwvc3Bhbj5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRGdWxsc2NyZWVuRWxlbWVudCgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmZ1bGxzY3JlZW5FbGVtZW50IHx8IGRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8IG51bGxcbn1cblxuZnVuY3Rpb24gcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihlbCkge1xuICBjb25zdCByZXF1ZXN0ID0gZWwgJiYgKGVsLnJlcXVlc3RGdWxsc2NyZWVuIHx8IGVsLndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKVxuICBpZiAoIXJlcXVlc3QpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlcXVlc3QuY2FsbChlbCkpLmNhdGNoKCgpID0+IHt9KVxufVxuXG5mdW5jdGlvbiBleGl0Qm9hcmRGdWxsc2NyZWVuKCkge1xuICBpZiAoIWdldEZ1bGxzY3JlZW5FbGVtZW50KCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuICBjb25zdCBleGl0ID0gZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4gfHwgZG9jdW1lbnQud2Via2l0RXhpdEZ1bGxzY3JlZW5cbiAgaWYgKCFleGl0KSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShleGl0LmNhbGwoZG9jdW1lbnQpKS5jYXRjaCgoKSA9PiB7fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJvYXJkKHsgcHJvamVjdCB9KSB7XG4gIGNvbnN0IHtcbiAgICBtb2RlLFxuICAgIHNldE1vZGUsXG4gICAgc2V0Vmlld3BvcnRLZXksXG4gICAgdmlld3BvcnRLZXksXG4gICAgdmlld3BvcnQsXG4gICAgZW50cnlJZCxcbiAgICBzZWxlY3RFbnRyeSxcbiAgICBjdXJyZW50U2NyZWVuSWQsXG4gICAgY2FuR29CYWNrLFxuICAgIGdvQmFjayxcbiAgICByZXNldCxcbiAgfSA9IHVzZVByb3RvdHlwZSgpXG4gIGNvbnN0IGRlbW9BdmFpbGFibGUgPSBjYW5Vc2VEZW1vKHByb2plY3Quc2NyZWVucylcbiAgY29uc3Qgdmlld3BvcnRPcHRpb25zID0gT2JqZWN0LmtleXMocHJvamVjdC52aWV3cG9ydHMpXG4gIGNvbnN0IGN1cnJlbnRTY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQgPT09IGN1cnJlbnRTY3JlZW5JZClcblxuICBjb25zdCBbc2VsZWN0ZWRJZHMsIHNldFNlbGVjdGVkSWRzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICgpID0+IG5ldyBTZXQocHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuKSA9PiBzY3JlZW4uaWQpKSxcbiAgKVxuICBjb25zdCBbY2FudmFzU2NhbGUsIHNldENhbnZhc1NjYWxlXSA9IFJlYWN0LnVzZVN0YXRlKDEpXG4gIGNvbnN0IFtkZW1vU2NhbGUsIHNldERlbW9TY2FsZV0gPSBSZWFjdC51c2VTdGF0ZSgxKVxuICBjb25zdCBbZGVtb1ZpZXdSZXNldEtleSwgc2V0RGVtb1ZpZXdSZXNldEtleV0gPSBSZWFjdC51c2VTdGF0ZSgwKVxuICBjb25zdCBbaW50ZXJhY3RpdmUsIHNldEludGVyYWN0aXZlXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtzcGFjZUhlbGQsIHNldFNwYWNlSGVsZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2hvdHNwb3RzVmlzaWJsZSwgc2V0SG90c3BvdHNWaXNpYmxlXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwb3J0RXJyb3IsIHNldEV4cG9ydEVycm9yXSA9IFJlYWN0LnVzZVN0YXRlKG51bGwpXG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkSWRzLCBzZXRFeHBhbmRlZElkc10gPSBSZWFjdC51c2VTdGF0ZSgoKSA9PiBuZXcgU2V0KCkpXG4gIGNvbnN0IFtpbW1lcnNpdmUsIHNldEltbWVyc2l2ZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2Jyb3dzZXJGdWxsc2NyZWVuLCBzZXRCcm93c2VyRnVsbHNjcmVlbl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld0VuYWJsZWQsIHNldFJldmlld0VuYWJsZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdQYW5lbFZpc2libGUsIHNldFJldmlld1BhbmVsVmlzaWJsZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3Jldmlld1NlbGVjdGlvbnMsIHNldFJldmlld1NlbGVjdGlvbnNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IFtyZXZpZXdNdWx0aVNlbGVjdCwgc2V0UmV2aWV3TXVsdGlTZWxlY3RdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtyZXZpZXdJdGVtcywgc2V0UmV2aWV3SXRlbXNdID0gUmVhY3QudXNlU3RhdGUoW10pXG4gIGNvbnN0IGJvYXJkUmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG4gIGNvbnN0IHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYgPSBSZWFjdC51c2VSZWYobmV3IFNldCgpKVxuICBjb25zdCBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmID0gUmVhY3QudXNlUmVmKG51bGwpXG5cbiAgY29uc3QgY2FudmFzTG9ja2VkID0gIWludGVyYWN0aXZlIHx8IHNwYWNlSGVsZFxuICBjb25zdCBhbGxTY3JlZW5JZHMgPSBwcm9qZWN0LnNjcmVlbnMubWFwKChzY3JlZW4pID0+IHNjcmVlbi5pZClcbiAgY29uc3QgaXNEZW1vID0gbW9kZSA9PT0gJ2RlbW8nICYmIGRlbW9BdmFpbGFibGVcbiAgY29uc3QgYWN0aXZlU2NhbGUgPSBpc0RlbW8gPyBkZW1vU2NhbGUgOiBjYW52YXNTY2FsZVxuICBjb25zdCBzZXRBY3RpdmVTY2FsZSA9IGlzRGVtbyA/IHNldERlbW9TY2FsZSA6IHNldENhbnZhc1NjYWxlXG5cbiAgY29uc3QgY2xlYXJSZXZpZXdTZWxlY3Rpb24gPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgZm9yIChjb25zdCBlbGVtZW50IG9mIHNlbGVjdGVkUmV2aWV3RWxlbWVudHNSZWYuY3VycmVudCkge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgIH1cbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuY2xlYXIoKVxuICAgIHNldFJldmlld1NlbGVjdGlvbnMoW10pXG4gIH0sIFtdKVxuXG4gIGNvbnN0IHNlbGVjdFJldmlld0VsZW1lbnQgPSBSZWFjdC51c2VDYWxsYmFjaygoZWxlbWVudCwgc2NyZWVuLCBjb250ZW50Um9vdCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gICAgY29uc3QgcHJpbWFyeSA9IHJldmlld1NlbGVjdGlvbnNbcmV2aWV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IGFjdGl2ZVNjcmVlbiA9IHNjcmVlbiB8fCBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gcHJpbWFyeT8uc2NyZWVuSWQpXG4gICAgY29uc3QgYWN0aXZlUm9vdCA9IGNvbnRlbnRSb290IHx8IHByaW1hcnk/LmNvbnRlbnRSb290XG4gICAgaWYgKCFlbGVtZW50IHx8ICFhY3RpdmVTY3JlZW4gfHwgIWFjdGl2ZVJvb3QpIHJldHVyblxuICAgIGNvbnN0IG5leHRTZWxlY3Rpb24gPSBkZXNjcmliZVJldmlld0VsZW1lbnQoZWxlbWVudCwgYWN0aXZlUm9vdCwgYWN0aXZlU2NyZWVuKVxuICAgIGNvbnN0IGFkZGl0aXZlID0gcmV2aWV3TXVsdGlTZWxlY3QgfHwgb3B0aW9ucy5hZGRpdGl2ZVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4ge1xuICAgICAgaWYgKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpIHtcbiAgICAgICAgb3B0aW9ucy5yZXBsYWNlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIGlmIChjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudCAmJiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpKSB7XG4gICAgICAgICAgcmV0dXJuIGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmVsZW1lbnQgIT09IG9wdGlvbnMucmVwbGFjZUVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuYWRkKGVsZW1lbnQpXG4gICAgICAgIHJldHVybiBjdXJyZW50Lm1hcCgoaXRlbSkgPT4gaXRlbS5lbGVtZW50ID09PSBvcHRpb25zLnJlcGxhY2VFbGVtZW50ID8gbmV4dFNlbGVjdGlvbiA6IGl0ZW0pXG4gICAgICB9XG4gICAgICBjb25zdCBhbHJlYWR5U2VsZWN0ZWQgPSBjdXJyZW50LnNvbWUoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCA9PT0gZWxlbWVudClcbiAgICAgIGlmICghYWRkaXRpdmUpIHtcbiAgICAgICAgZm9yIChjb25zdCBzZWxlY3RlZEVsZW1lbnQgb2Ygc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc2VsZWN0ZWRFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1zZWxlY3RlZCcpXG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmNsZWFyKClcbiAgICAgIH0gZWxzZSBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmRlbGV0ZShlbGVtZW50KVxuICAgICAgICByZXR1cm4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudClcbiAgICAgIH1cblxuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1yZXZpZXctc2VsZWN0ZWQnKVxuICAgICAgc2VsZWN0ZWRSZXZpZXdFbGVtZW50c1JlZi5jdXJyZW50LmFkZChlbGVtZW50KVxuICAgICAgcmV0dXJuIGFkZGl0aXZlID8gWy4uLmN1cnJlbnQsIG5leHRTZWxlY3Rpb25dIDogW25leHRTZWxlY3Rpb25dXG4gICAgfSlcbiAgfSwgW3Byb2plY3Quc2NyZWVucywgcmV2aWV3TXVsdGlTZWxlY3QsIHJldmlld1NlbGVjdGlvbnNdKVxuXG4gIGNvbnN0IHJlbW92ZVJldmlld1NlbGVjdGlvbiA9IFJlYWN0LnVzZUNhbGxiYWNrKChlbGVtZW50KSA9PiB7XG4gICAgZWxlbWVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQuZGVsZXRlKGVsZW1lbnQpXG4gICAgc2V0UmV2aWV3U2VsZWN0aW9ucygoY3VycmVudCkgPT4gY3VycmVudC5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZWxlbWVudCAhPT0gZWxlbWVudCkpXG4gIH0sIFtdKVxuXG4gIGNvbnN0IGNsb3NlUmV2aWV3ID0gUmVhY3QudXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHNldFJldmlld0VuYWJsZWQoZmFsc2UpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudD8uY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LWhvdmVyZWQnKVxuICAgIGJyZWFkY3J1bWJIb3ZlckVsZW1lbnRSZWYuY3VycmVudCA9IG51bGxcbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gIH0sIFtjbGVhclJldmlld1NlbGVjdGlvbl0pXG5cbiAgY29uc3QgaG92ZXJSZXZpZXdCcmVhZGNydW1iID0gUmVhY3QudXNlQ2FsbGJhY2soKGVsZW1lbnQpID0+IHtcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQgPSBlbGVtZW50IHx8IG51bGxcbiAgICBicmVhZGNydW1iSG92ZXJFbGVtZW50UmVmLmN1cnJlbnQ/LmNsYXNzTGlzdC5hZGQoJ2lzLXJldmlldy1ob3ZlcmVkJylcbiAgfSwgW10pXG5cbiAgY29uc3QgdG9nZ2xlUmV2aWV3ID0gKCkgPT4ge1xuICAgIGlmIChyZXZpZXdFbmFibGVkKSB7XG4gICAgICBjbG9zZVJldmlldygpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgc2V0SW50ZXJhY3RpdmUodHJ1ZSlcbiAgICBzZXRSZXZpZXdQYW5lbFZpc2libGUoZmFsc2UpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICB9XG5cbiAgY29uc3Qgb3BlblJldmlld1BhbmVsID0gKCkgPT4ge1xuICAgIHNldEludGVyYWN0aXZlKHRydWUpXG4gICAgc2V0UmV2aWV3RW5hYmxlZCh0cnVlKVxuICAgIHNldFJldmlld1BhbmVsVmlzaWJsZSh0cnVlKVxuICB9XG5cbiAgY29uc3QgYWRkUmV2aWV3SXRlbSA9IChpdGVtKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IFtcbiAgICAgIC4uLmN1cnJlbnQsXG4gICAgICB7IC4uLml0ZW0sIGlkOiBgcmV2aWV3LSR7RGF0ZS5ub3coKX0tJHtjdXJyZW50Lmxlbmd0aCArIDF9YCB9LFxuICAgIF0pXG4gIH1cblxuICBjb25zdCByZW1vdmVSZXZpZXdJdGVtID0gKGlkKSA9PiB7XG4gICAgc2V0UmV2aWV3SXRlbXMoKGN1cnJlbnQpID0+IGN1cnJlbnQuZmlsdGVyKChpdGVtKSA9PiBpdGVtLmlkICE9PSBpZCkpXG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4gKCkgPT4ge1xuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBzZWxlY3RlZFJldmlld0VsZW1lbnRzUmVmLmN1cnJlbnQpIHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcmV2aWV3LXNlbGVjdGVkJylcbiAgICB9XG4gICAgYnJlYWRjcnVtYkhvdmVyRWxlbWVudFJlZi5jdXJyZW50Py5jbGFzc0xpc3QucmVtb3ZlKCdpcy1yZXZpZXctaG92ZXJlZCcpXG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFyZXZpZXdFbmFibGVkKSByZXR1cm5cbiAgICBjbGVhclJldmlld1NlbGVjdGlvbigpXG4gICAgaG92ZXJSZXZpZXdCcmVhZGNydW1iKG51bGwpXG4gICAgc2V0UmV2aWV3UGFuZWxWaXNpYmxlKGZhbHNlKVxuICB9LCBbY2xlYXJSZXZpZXdTZWxlY3Rpb24sIGhvdmVyUmV2aWV3QnJlYWRjcnVtYiwgbW9kZSwgdmlld3BvcnRLZXldKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJldmlld0l0ZW1zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCBwcmV2ZW50VW5zYXZlZFJldmlld0V4aXQpXG4gIH0sIFtyZXZpZXdJdGVtcy5sZW5ndGhdKVxuXG4gIGNvbnN0IGV4aXRJbW1lcnNpdmUgPSBSZWFjdC51c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgc2V0SW1tZXJzaXZlKGZhbHNlKVxuICAgIGV4aXRCb2FyZEZ1bGxzY3JlZW4oKVxuICB9LCBbXSlcblxuICBjb25zdCB0b2dnbGVCcm93c2VyRnVsbHNjcmVlbiA9ICgpID0+IHtcbiAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkge1xuICAgICAgZXhpdEJvYXJkRnVsbHNjcmVlbigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgcmVxdWVzdEJvYXJkRnVsbHNjcmVlbihib2FyZFJlZi5jdXJyZW50KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRFeHBhbmRlZElkcyhuZXcgU2V0KCkpXG4gIH0sIFt2aWV3cG9ydEtleV0pXG5cbiAgY29uc3QgdG9nZ2xlRXhwYW5kID0gKGlkKSA9PiB7XG4gICAgc2V0RXhwYW5kZWRJZHMoKGN1cnJlbnQpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KGN1cnJlbnQpXG4gICAgICBpZiAobmV4dC5oYXMoaWQpKSBuZXh0LmRlbGV0ZShpZClcbiAgICAgIGVsc2UgbmV4dC5hZGQoaWQpXG4gICAgICByZXR1cm4gbmV4dFxuICAgIH0pXG4gIH1cblxuICBjb25zdCBleHBhbmRUYXJnZXRzID0gKHNob3VsZEV4cGFuZCkgPT4ge1xuICAgIGNvbnN0IHRhcmdldHMgPSByZXNvbHZlRXhwYW5kVGFyZ2V0cyhzZWxlY3RlZElkcywgYWxsU2NyZWVuSWRzKVxuICAgIHNldEV4cGFuZGVkSWRzKChjdXJyZW50KSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFNldChjdXJyZW50KVxuICAgICAgZm9yIChjb25zdCBpZCBvZiB0YXJnZXRzKSB7XG4gICAgICAgIGlmIChzaG91bGRFeHBhbmQpIG5leHQuYWRkKGlkKVxuICAgICAgICBlbHNlIG5leHQuZGVsZXRlKGlkKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5leHRcbiAgICB9KVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkb3duID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQuY29kZSAhPT0gJ1NwYWNlJyB8fCBldmVudC5yZXBlYXQpIHJldHVyblxuICAgICAgY29uc3QgdGFnID0gZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnRhcmdldC50YWdOYW1lXG4gICAgICBpZiAodGFnID09PSAnSU5QVVQnIHx8IHRhZyA9PT0gJ1RFWFRBUkVBJyB8fCB0YWcgPT09ICdTRUxFQ1QnIHx8IGV2ZW50LnRhcmdldC5pc0NvbnRlbnRFZGl0YWJsZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIHNldFNwYWNlSGVsZCh0cnVlKVxuICAgIH1cbiAgICBjb25zdCB1cCA9IChldmVudCkgPT4ge1xuICAgICAgaWYgKGV2ZW50LmNvZGUgPT09ICdTcGFjZScpIHNldFNwYWNlSGVsZChmYWxzZSlcbiAgICB9XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBkb3duKVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGRvd24pXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vZGUgIT09ICdkZW1vJykgc2V0SG90c3BvdHNWaXNpYmxlKGZhbHNlKVxuICB9LCBbbW9kZV0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBzeW5jID0gKCkgPT4gc2V0QnJvd3NlckZ1bGxzY3JlZW4oISFnZXRGdWxsc2NyZWVuRWxlbWVudCgpKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdmdWxsc2NyZWVuY2hhbmdlJywgc3luYylcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3dlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UnLCBzeW5jKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWltbWVyc2l2ZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGNvbnN0IG9uS2V5ID0gKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQua2V5ICE9PSAnRXNjYXBlJykgcmV0dXJuXG4gICAgICBpZiAoZ2V0RnVsbHNjcmVlbkVsZW1lbnQoKSkgcmV0dXJuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBzZXRJbW1lcnNpdmUoZmFsc2UpXG4gICAgfVxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXkpXG4gIH0sIFtpbW1lcnNpdmVdKVxuXG4gIGNvbnN0IGV4cG9ydElkcyA9IChpZHMpID0+IHJ1bkV4cG9ydFdpdGhGZWVkYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0RXhwb3J0aW5nKHRydWUpXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHNjcmVlbnMgPSBpZHMubWFwKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBzY3JlZW4gPSBwcm9qZWN0LnNjcmVlbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5pZCA9PT0gaWQpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdGl0bGU6IHNjcmVlbi50aXRsZSxcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbZGF0YS1zY3JlZW4taWQ9XCIke2lkfVwiXSAud2Ytc2NyZWVuLWNvbnRlbnRgKSxcbiAgICAgICAgICB2aWV3cG9ydCxcbiAgICAgICAgICBleHBhbmRlZDogZXhwYW5kZWRJZHMuaGFzKGlkKSxcbiAgICAgICAgICBwcm9qZWN0TmFtZTogcHJvamVjdC5uYW1lLFxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgYXdhaXQgZXhwb3J0U2VsZWN0ZWQoc2NyZWVucylcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0RXhwb3J0aW5nKGZhbHNlKVxuICAgIH1cbiAgfSwgc2V0RXhwb3J0RXJyb3IpXG5cbiAgY29uc3QgcmVzZXREZW1vID0gKCkgPT4ge1xuICAgIHJlc2V0KClcbiAgICBzZXRIb3RzcG90c1Zpc2libGUoZmFsc2UpXG4gIH1cblxuICBjb25zdCByZXNldERlbW9WaWV3ID0gKCkgPT4ge1xuICAgIHNldERlbW9WaWV3UmVzZXRLZXkoKHZhbHVlKSA9PiB2YWx1ZSArIDEpXG4gIH1cblxuICBjb25zdCByZXNldEFjdGl2ZVZpZXcgPSBpc0RlbW8gPyByZXNldERlbW9WaWV3IDogKCkgPT4gc2V0Q2FudmFzU2NhbGUoMSlcblxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHJlZj17Ym9hcmRSZWZ9XG4gICAgICBjbGFzc05hbWU9e2B3Zi1ib2FyZCR7aW1tZXJzaXZlID8gJyBpcy1pbW1lcnNpdmUnIDogJyd9JHtyZXZpZXdFbmFibGVkID8gJyBpcy1yZXZpZXdpbmcnIDogJyd9YH1cbiAgICA+XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIndmLWJvYXJkLXRvb2xiYXJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWxlZnRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwid2YtcHJvamVjdC1uYW1lXCI+e3Byb2plY3QubmFtZX08L2gxPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXByb2plY3QtbWV0YVwiPntwcm9qZWN0LnNjcmVlbnMubGVuZ3RofSBcdTk4NzU8L3NwYW4+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1jZW50ZXJcIj5cbiAgICAgICAgICB7ZGVtb0F2YWlsYWJsZSA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtbW9kZS1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTZBMjFcdTVGMEZcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17bW9kZSA9PT0gJ2NhbnZhcycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2NhbnZhcycpfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgXHU3NTNCXHU2NzdGXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXttb2RlID09PSAnZGVtbycgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2RlbW8nKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIFx1NkYxNFx1NzkzQVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5sZW5ndGggPiAxID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi12aWV3cG9ydC1zd2l0Y2hlclwiIHJvbGU9XCJncm91cFwiIGFyaWEtbGFiZWw9XCJcdTg5QzZcdTUzRTNcIj5cbiAgICAgICAgICAgICAge3ZpZXdwb3J0T3B0aW9ucy5tYXAoKGtleSkgPT4gKFxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3ZpZXdwb3J0S2V5ID09PSBrZXkgPyAnaXMtYWN0aXZlJyA6ICcnfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Vmlld3BvcnRLZXkoa2V5KX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7VklFV1BPUlRfTEFCRUxTW2tleV0gfHwga2V5fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAge21vZGUgPT09ICdjYW52YXMnIHx8ICFkZW1vQXZhaWxhYmxlID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPFpvb21Db250cm9sc1xuICAgICAgICAgICAgICAgIHNjYWxlPXtjYW52YXNTY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0Q2FudmFzU2NhbGV9XG4gICAgICAgICAgICAgICAgb25SZXNldD17KCkgPT4gc2V0Q2FudmFzU2NhbGUoMSl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Wm9vbUNvbnRyb2xzXG4gICAgICAgICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0RGVtb1ZpZXd9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgICAgICBpbnRlcmFjdGl2ZT17aW50ZXJhY3RpdmV9XG4gICAgICAgICAgICAgICAgb25Ub2dnbGU9eygpID0+IHNldEludGVyYWN0aXZlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtZGVtby1lbnRyeVwiPlxuICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwid2YtZGVtby1lbnRyeVwiPlx1NTE2NVx1NTNFMzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgaWQ9XCJ3Zi1kZW1vLWVudHJ5XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbnRyeUlkfVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldmVudCkgPT4gc2VsZWN0RW50cnkoZXZlbnQudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgIHRpdGxlPVwiXHU5MDA5XHU2MkU5XHU2RjE0XHU3OTNBXHU1MTY1XHU1M0UzXHU5ODc1XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cHJvamVjdC5zY3JlZW5zLm1hcCgoc2NyZWVuLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17c2NyZWVuLmlkfSB2YWx1ZT17c2NyZWVuLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggKyAxfS4ge3NjcmVlbi50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHtjYW5Hb0JhY2sgPyAoXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3NOYW1lPVwid2YtYm9hcmQtYnV0dG9uXCIgb25DbGljaz17Z29CYWNrfT5cdThGRDRcdTU2REU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cIndmLWJvYXJkLWJ1dHRvblwiIG9uQ2xpY2s9e3Jlc2V0RGVtb30+XHU5MUNEXHU3RjZFPC9idXR0b24+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWRlbW8tcGFnZS1sYWJlbFwiPlxuICAgICAgICAgICAgICAgIFx1NUY1M1x1NTI0RFx1RkYxQVxuICAgICAgICAgICAgICAgIHtjdXJyZW50U2NyZWVuXG4gICAgICAgICAgICAgICAgICA/IGAke3Byb2plY3Quc2NyZWVucy5maW5kSW5kZXgoKHNjcmVlbikgPT4gc2NyZWVuLmlkID09PSBjdXJyZW50U2NyZWVuLmlkKSArIDF9LiAke2N1cnJlbnRTY3JlZW4udGl0bGV9IFx1MDBCNyAke2N1cnJlbnRTY3JlZW4uaWR9LmpzeGBcbiAgICAgICAgICAgICAgICAgIDogY3VycmVudFNjcmVlbklkfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItcmlnaHRcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17cmV2aWV3RW5hYmxlZCA/ICd3Zi10b29sYmFyLWljb24tYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtdG9vbGJhci1pY29uLWJ1dHRvbid9XG4gICAgICAgICAgICBhcmlhLXByZXNzZWQ9e3Jldmlld0VuYWJsZWR9XG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtyZXZpZXdFbmFibGVkID8gJ1x1NEZFRVx1NjUzOVx1NEUyRCcgOiAnXHU0RkVFXHU2NTM5J31cbiAgICAgICAgICAgIHRpdGxlPVwiXHU0RkVFXHU2NTM5XHVGRjFBXHU3MEI5XHU5MDA5XHU5ODc1XHU5NzYyXHU4MjgyXHU3MEI5XHU1RTc2XHU2NTc0XHU3NDA2XHU2MjEwXHU1M0VGXHU3RjE2XHU4RjkxXHU3Njg0IEFJIFx1NEZFRVx1NjUzOSBQcm9tcHRcIlxuICAgICAgICAgICAgb25DbGljaz17dG9nZ2xlUmV2aWV3fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxUb29sYmFySWNvbiBuYW1lPVwiZWRpdFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTRGRUVcdTY1Mzk8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdTZBMjFcdTVGMEZcIlxuICAgICAgICAgICAgdGl0bGU9XCJcdThGREJcdTUxNjVcdTZDODlcdTZENzhcdUZGMUFcdTk2OTBcdTg1Q0ZcdTk4NzZcdTY4MEZcdTRFMEVcdTRGQTdcdTY4MEZcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBjbG9zZVJldmlldygpXG4gICAgICAgICAgICAgIHNldEltbWVyc2l2ZSh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImZ1bGxzY3JlZW5cIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdmlzdWFsbHktaGlkZGVuXCI+XHU1MTY4XHU1QzRGPC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwid2YtdG9vbGJhci1pY29uLWJ1dHRvblwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTVDNTVcdTVGMDBcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEYnIDogJ1x1NUM1NVx1NUYwMFx1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICB0aXRsZT17c2VsZWN0ZWRJZHMuc2l6ZSA+IDAgPyAnXHU1QzU1XHU1RjAwXHU1REYyXHU1MkZFXHU5MDA5XHU3Njg0XHU1QzRGXHVGRjFCXHU2NUUwXHU1MkZFXHU5MDA5XHU2NUY2XHU1QzU1XHU1RjAwXHU1MTY4XHU5MEU4JyA6ICdcdTVDNTVcdTVGMDBcdTUxNjhcdTkwRThcdTVDNEYnfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4gZXhwYW5kVGFyZ2V0cyh0cnVlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImV4cGFuZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi12aXN1YWxseS1oaWRkZW5cIj5cdTUxNjhcdTkwRThcdTVDNTVcdTVGMDA8L3NwYW4+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tYnV0dG9uXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e3NlbGVjdGVkSWRzLnNpemUgPiAwID8gJ1x1NjUzNlx1OEQ3N1x1NURGMlx1NTJGRVx1OTAwOVx1NzY4NFx1NUM0RicgOiAnXHU2NTM2XHU4RDc3XHU1MTY4XHU5MEU4XHU1QzRGJ31cbiAgICAgICAgICAgIHRpdGxlPXtzZWxlY3RlZElkcy5zaXplID4gMCA/ICdcdTY1MzZcdThENzdcdTVERjJcdTUyRkVcdTkwMDlcdTc2ODRcdTVDNEZcdUZGMUJcdTY1RTBcdTUyRkVcdTkwMDlcdTY1RjZcdTY1MzZcdThENzdcdTUxNjhcdTkwRTgnIDogJ1x1NjUzNlx1OEQ3N1x1NTE2OFx1OTBFOFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBhbmRUYXJnZXRzKGZhbHNlKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8VG9vbGJhckljb24gbmFtZT1cImNvbGxhcHNlXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NTE2OFx1OTBFOFx1NjUzNlx1OEQ3Nzwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRvb2xiYXItaWNvbi1idXR0b24gd2YtdG9vbGJhci1pY29uLWJ1dHRvbi0tcHJpbWFyeVwiXG4gICAgICAgICAgICBkaXNhYmxlZD17ZXhwb3J0aW5nIHx8IHNlbGVjdGVkSWRzLnNpemUgPT09IDAgfHwgbW9kZSA9PT0gJ2RlbW8nfVxuICAgICAgICAgICAgYXJpYS1sYWJlbD17ZXhwb3J0aW5nID8gJ1x1NkI2M1x1NTcyOFx1NUJGQ1x1NTFGQScgOiBgXHU2MjUzXHU1MzA1XHU0RTBCXHU4RjdEXHVGRjA4JHtzZWxlY3RlZElkcy5zaXplfSBcdTRFMkFcdTVDNEZcdTVFNTVcdUZGMDlgfVxuICAgICAgICAgICAgdGl0bGU9e2V4cG9ydGluZyA/ICdcdTVCRkNcdTUxRkFcdTRFMkRcdTIwMjYnIDogYFx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RCAke3NlbGVjdGVkSWRzLnNpemV9IFx1NEUyQVx1NUM0Rlx1NUU1NWB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBleHBvcnRJZHMoWy4uLnNlbGVjdGVkSWRzXSl9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFRvb2xiYXJJY29uIG5hbWU9XCJkb3dubG9hZFwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b29sYmFyLWljb24tY291bnRcIj57ZXhwb3J0aW5nID8gJ1x1MjAyNicgOiBzZWxlY3RlZElkcy5zaXplfTwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXZpc3VhbGx5LWhpZGRlblwiPlx1NjI1M1x1NTMwNVx1NEUwQlx1OEY3RDwvc3Bhbj5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAge2V4cG9ydEVycm9yID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndmLXRvb2xiYXItZXJyb3JcIiByb2xlPVwiYWxlcnRcIj57ZXhwb3J0RXJyb3J9PC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge2ltbWVyc2l2ZSA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1pbW1lcnNpdmUtY2hyb21lXCIgcm9sZT1cInRvb2xiYXJcIiBhcmlhLWxhYmVsPVwiXHU2Qzg5XHU2RDc4XHU2M0E3XHU0RUY2XCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIlxuICAgICAgICAgICAgdGl0bGU9XCJcdTkwMDBcdTUxRkFcdTZDODlcdTZENzhcdUZGMDhFc2NcdUZGMDlcIlxuICAgICAgICAgICAgb25DbGljaz17ZXhpdEltbWVyc2l2ZX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBcdTkwMDBcdTUxRkFcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YnJvd3NlckZ1bGxzY3JlZW4gPyAnd2YtYm9hcmQtYnV0dG9uIGlzLWFjdGl2ZScgOiAnd2YtYm9hcmQtYnV0dG9uJ31cbiAgICAgICAgICAgIHRpdGxlPXticm93c2VyRnVsbHNjcmVlbiA/ICdcdTkwMDBcdTUxRkFcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnIDogJ1x1NkQ0Rlx1ODlDOFx1NTY2OFx1NTE2OFx1NUM0Rid9XG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVCcm93c2VyRnVsbHNjcmVlbn1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnJvd3NlckZ1bGxzY3JlZW4gPyAnXHU2RDRGXHU4OUM4XHU1NjY4XHU1MTY4XHU1QzRGIE9OJyA6ICdcdTZENEZcdTg5QzhcdTU2NjhcdTUxNjhcdTVDNEYnfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIDxab29tQ29udHJvbHNcbiAgICAgICAgICAgIHNjYWxlPXthY3RpdmVTY2FsZX1cbiAgICAgICAgICAgIHNldFNjYWxlPXtzZXRBY3RpdmVTY2FsZX1cbiAgICAgICAgICAgIG9uUmVzZXQ9e3Jlc2V0QWN0aXZlVmlld31cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxJbnRlcmFjdGlvbkxvY2tcbiAgICAgICAgICAgIGludGVyYWN0aXZlPXtpbnRlcmFjdGl2ZX1cbiAgICAgICAgICAgIG9uVG9nZ2xlPXsoKSA9PiBzZXRJbnRlcmFjdGl2ZSgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICB7aXNEZW1vID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAge2NhbkdvQmFjayA/IChcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJ3Zi1ib2FyZC1idXR0b25cIiBvbkNsaWNrPXtnb0JhY2t9Plx1OEZENFx1NTZERTwvYnV0dG9uPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aG90c3BvdHNWaXNpYmxlID8gJ3dmLWJvYXJkLWJ1dHRvbiBpcy1hY3RpdmUnIDogJ3dmLWJvYXJkLWJ1dHRvbid9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0SG90c3BvdHNWaXNpYmxlKCh2YWx1ZSkgPT4gIXZhbHVlKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtob3RzcG90c1Zpc2libGUgPyAnXHU3MEVEXHU1MzNBIE9OJyA6ICdcdTcwRURcdTUzM0EgT0ZGJ31cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cblxuICAgICAge21vZGUgPT09ICdjYW52YXMnID8gKFxuICAgICAgICA8Q2FudmFzTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgc2NhbGU9e2NhbnZhc1NjYWxlfVxuICAgICAgICAgIHNldFNjYWxlPXtzZXRDYW52YXNTY2FsZX1cbiAgICAgICAgICBjYW52YXNMb2NrZWQ9e2NhbnZhc0xvY2tlZH1cbiAgICAgICAgICBzZWxlY3RlZElkcz17c2VsZWN0ZWRJZHN9XG4gICAgICAgICAgc2V0U2VsZWN0ZWRJZHM9e3NldFNlbGVjdGVkSWRzfVxuICAgICAgICAgIGV4cGFuZGVkSWRzPXtleHBhbmRlZElkc31cbiAgICAgICAgICBvblRvZ2dsZUV4cGFuZD17dG9nZ2xlRXhwYW5kfVxuICAgICAgICAgIG9uRXhwb3J0SWRzPXtleHBvcnRJZHN9XG4gICAgICAgICAgcmV2aWV3RW5hYmxlZD17cmV2aWV3RW5hYmxlZH1cbiAgICAgICAgICBvblJldmlld1NlbGVjdD17c2VsZWN0UmV2aWV3RWxlbWVudH1cbiAgICAgICAgLz5cbiAgICAgICkgOiAoXG4gICAgICAgIDxEZW1vTW9kZVxuICAgICAgICAgIHByb2plY3Q9e3Byb2plY3R9XG4gICAgICAgICAgaG90c3BvdHNWaXNpYmxlPXtob3RzcG90c1Zpc2libGV9XG4gICAgICAgICAgY2FudmFzTG9ja2VkPXtjYW52YXNMb2NrZWR9XG4gICAgICAgICAgc2NhbGU9e2RlbW9TY2FsZX1cbiAgICAgICAgICBzZXRTY2FsZT17c2V0RGVtb1NjYWxlfVxuICAgICAgICAgIHZpZXdSZXNldEtleT17ZGVtb1ZpZXdSZXNldEtleX1cbiAgICAgICAgICBleHBhbmRlZElkcz17ZXhwYW5kZWRJZHN9XG4gICAgICAgICAgb25Ub2dnbGVFeHBhbmQ9e3RvZ2dsZUV4cGFuZH1cbiAgICAgICAgICByZXZpZXdFbmFibGVkPXtyZXZpZXdFbmFibGVkfVxuICAgICAgICAgIG9uUmV2aWV3U2VsZWN0PXtzZWxlY3RSZXZpZXdFbGVtZW50fVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICAgIHtyZXZpZXdFbmFibGVkID8gKFxuICAgICAgICA8UmV2aWV3TWFya2VycyBib2FyZFJlZj17Ym9hcmRSZWZ9IGl0ZW1zPXtyZXZpZXdJdGVtc30gb25PcGVuUGFuZWw9e29wZW5SZXZpZXdQYW5lbH0gLz5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPFJldmlld0xhdW5jaGVyXG4gICAgICAgIGJvYXJkUmVmPXtib2FyZFJlZn1cbiAgICAgICAgY291bnQ9e3Jldmlld0l0ZW1zLmxlbmd0aH1cbiAgICAgICAgcHJvamVjdE5hbWU9e3Byb2plY3QubmFtZX1cbiAgICAgICAgb25PcGVuPXtvcGVuUmV2aWV3UGFuZWx9XG4gICAgICAvPlxuICAgICAge3Jldmlld0VuYWJsZWQgJiYgcmV2aWV3UGFuZWxWaXNpYmxlID8gKFxuICAgICAgICA8UmV2aWV3UGFuZWxcbiAgICAgICAgICBwcm9qZWN0PXtwcm9qZWN0fVxuICAgICAgICAgIHNlbGVjdGlvbnM9e3Jldmlld1NlbGVjdGlvbnN9XG4gICAgICAgICAgbXVsdGlTZWxlY3Q9e3Jldmlld011bHRpU2VsZWN0fVxuICAgICAgICAgIGl0ZW1zPXtyZXZpZXdJdGVtc31cbiAgICAgICAgICBvblRvZ2dsZU11bHRpU2VsZWN0PXsoKSA9PiBzZXRSZXZpZXdNdWx0aVNlbGVjdCgodmFsdWUpID0+ICF2YWx1ZSl9XG4gICAgICAgICAgb25TZWxlY3RFbGVtZW50PXsoZWxlbWVudCkgPT4gc2VsZWN0UmV2aWV3RWxlbWVudChlbGVtZW50LCBudWxsLCBudWxsLCB7XG4gICAgICAgICAgICByZXBsYWNlRWxlbWVudDogcmV2aWV3U2VsZWN0aW9uc1tyZXZpZXdTZWxlY3Rpb25zLmxlbmd0aCAtIDFdPy5lbGVtZW50LFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIG9uSG92ZXJFbGVtZW50PXtob3ZlclJldmlld0JyZWFkY3J1bWJ9XG4gICAgICAgICAgb25SZW1vdmVTZWxlY3Rpb249e3JlbW92ZVJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkNsZWFyU2VsZWN0aW9uPXtjbGVhclJldmlld1NlbGVjdGlvbn1cbiAgICAgICAgICBvbkFkZEl0ZW09e2FkZFJldmlld0l0ZW19XG4gICAgICAgICAgb25SZW1vdmVJdGVtPXtyZW1vdmVSZXZpZXdJdGVtfVxuICAgICAgICAgIG9uQ2xvc2U9e2Nsb3NlUmV2aWV3fVxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJmdW5jdGlvbiBmYWlsKHBhdGgsIG1lc3NhZ2UpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGAke3BhdGh9ICR7bWVzc2FnZX1gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVQcm9qZWN0KHByb2plY3QpIHtcbiAgaWYgKCFwcm9qZWN0IHx8IHR5cGVvZiBwcm9qZWN0ICE9PSAnb2JqZWN0JykgZmFpbCgncHJvamVjdCcsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGlmICghcHJvamVjdC52aWV3cG9ydHMgfHwgdHlwZW9mIHByb2plY3Qudmlld3BvcnRzICE9PSAnb2JqZWN0Jykge1xuICAgIGZhaWwoJ3Byb2plY3Qudmlld3BvcnRzJywgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGNvbnN0IHZpZXdwb3J0RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHByb2plY3Qudmlld3BvcnRzKVxuICBpZiAodmlld3BvcnRFbnRyaWVzLmxlbmd0aCA9PT0gMCkgZmFpbCgncHJvamVjdC52aWV3cG9ydHMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSB2aWV3cG9ydCcpXG4gIGZvciAoY29uc3QgW2tleSwgdmlld3BvcnRdIG9mIHZpZXdwb3J0RW50cmllcykge1xuICAgIGlmICghdmlld3BvcnQgfHwgdHlwZW9mIHZpZXdwb3J0ICE9PSAnb2JqZWN0JykgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9YCwgJ211c3QgYmUgYW4gb2JqZWN0JylcbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbiBvZiBbJ3dpZHRoJywgJ2hlaWdodCddKSB7XG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh2aWV3cG9ydFtkaW1lbnNpb25dKSB8fCB2aWV3cG9ydFtkaW1lbnNpb25dIDw9IDApIHtcbiAgICAgICAgZmFpbChgcHJvamVjdC52aWV3cG9ydHMuJHtrZXl9LiR7ZGltZW5zaW9ufWAsICdtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAoIU9iamVjdC5oYXNPd24ocHJvamVjdC52aWV3cG9ydHMsIHByb2plY3QuZGVmYXVsdFZpZXdwb3J0KSkge1xuICAgIGZhaWwoJ3Byb2plY3QuZGVmYXVsdFZpZXdwb3J0JywgYHJlZmVyZW5jZXMgbWlzc2luZyB2aWV3cG9ydCBcIiR7cHJvamVjdC5kZWZhdWx0Vmlld3BvcnR9XCJgKVxuICB9XG4gIGlmICghQXJyYXkuaXNBcnJheShwcm9qZWN0LnNjcmVlbnMpIHx8IHByb2plY3Quc2NyZWVucy5sZW5ndGggPT09IDApIHtcbiAgICBmYWlsKCdwcm9qZWN0LnNjcmVlbnMnLCAnbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBzY3JlZW4nKVxuICB9XG5cbiAgY29uc3QgaWRzID0gbmV3IFNldCgpXG4gIHByb2plY3Quc2NyZWVucy5mb3JFYWNoKChzY3JlZW4sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgcGF0aCA9IGBwcm9qZWN0LnNjcmVlbnNbJHtpbmRleH1dYFxuICAgIGlmICghc2NyZWVuIHx8IHR5cGVvZiBzY3JlZW4gIT09ICdvYmplY3QnKSBmYWlsKHBhdGgsICdtdXN0IGJlIGFuIG9iamVjdCcpXG4gICAgaWYgKHR5cGVvZiBzY3JlZW4uaWQgIT09ICdzdHJpbmcnIHx8ICEvXlthLXowLTktXSskLy50ZXN0KHNjcmVlbi5pZCkpIHtcbiAgICAgIGZhaWwoYCR7cGF0aH0uaWRgLCAnbXVzdCBtYXRjaCAvXlthLXowLTktXSskLycpXG4gICAgfVxuICAgIGlmIChpZHMuaGFzKHNjcmVlbi5pZCkpIGZhaWwoYCR7cGF0aH0uaWRgLCBgaXMgZHVwbGljYXRlIFwiJHtzY3JlZW4uaWR9XCJgKVxuICAgIGlkcy5hZGQoc2NyZWVuLmlkKVxuICAgIGlmICh0eXBlb2Ygc2NyZWVuLmNvbXBvbmVudCAhPT0gJ2Z1bmN0aW9uJykgZmFpbChgJHtwYXRofS5jb21wb25lbnRgLCAnbXVzdCBiZSBhIGZ1bmN0aW9uJylcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoc2NyZWVuLmxpbmtzKSkge1xuICAgICAgZmFpbChgJHtwYXRofS5saW5rc2AsICdtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG4gIH0pXG5cbiAgcHJvamVjdC5zY3JlZW5zLmZvckVhY2goKHNjcmVlbiwgc2NyZWVuSW5kZXgpID0+IHtcbiAgICBzY3JlZW4ubGlua3MuZm9yRWFjaCgodGFyZ2V0LCBsaW5rSW5kZXgpID0+IHtcbiAgICAgIGlmICghaWRzLmhhcyh0YXJnZXQpKSB7XG4gICAgICAgIGZhaWwoXG4gICAgICAgICAgYHByb2plY3Quc2NyZWVuc1ske3NjcmVlbkluZGV4fV0ubGlua3NbJHtsaW5rSW5kZXh9XWAsXG4gICAgICAgICAgYHJlZmVyZW5jZXMgbWlzc2luZyBzY3JlZW4gXCIke3RhcmdldH1cImAsXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5cbmV4cG9ydCB7IGZpbmRGbG93VGFyZ2V0SWQsIGhhbmRsZURlbGVnYXRlZEZsb3dDbGljayB9IGZyb20gJy4vZmxvdy10YXJnZXQuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVGbG93UHJvcHModG8sIG9uQ2xpY2ssIG5hdmlnYXRlKSB7XG4gIHJldHVybiB7XG4gICAgJ2RhdGEtZmxvdy10byc6IHRvIHx8IHVuZGVmaW5lZCxcbiAgICBvbkNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgIGlmICh0bykgZXZlbnQuc3RvcFByb3BhZ2F0aW9uPy4oKVxuICAgICAgaWYgKG9uQ2xpY2spIG9uQ2xpY2soZXZlbnQpXG4gICAgICBpZiAoIWV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgJiYgdG8pIG5hdmlnYXRlKHRvKVxuICAgIH0sXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIGNyZWF0ZUZsb3dQcm9wcyh0bywgb25DbGljaywgbmF2aWdhdGUpXG59XG4iLCAiaW1wb3J0IHsgdXNlUHJvdG90eXBlIH0gZnJvbSAnLi4vY29yZS9Qcm90b3R5cGVDb250ZXh0LmpzeCdcbmltcG9ydCB7IHVzZUZsb3dUYXJnZXQgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmZ1bmN0aW9uIGpvaW5DbGFzcyhiYXNlLCBleHRyYSkge1xuICByZXR1cm4gZXh0cmEgPyBgJHtiYXNlfSAke2V4dHJhfWAgOiBiYXNlXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVDb2x1bW5zKGNvbHVtbnMsIHZpZXdwb3J0S2V5KSB7XG4gIGNvbnN0IHZhbHVlID1cbiAgICBjb2x1bW5zICYmIHR5cGVvZiBjb2x1bW5zID09PSAnb2JqZWN0JyAmJiAhQXJyYXkuaXNBcnJheShjb2x1bW5zKVxuICAgICAgPyBjb2x1bW5zW3ZpZXdwb3J0S2V5XVxuICAgICAgOiBjb2x1bW5zXG4gIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSAmJiB2YWx1ZSA+IDApIHJldHVybiBgcmVwZWF0KCR7dmFsdWV9LCBtaW5tYXgoMCwgMWZyKSlgXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnRyaW0oKSkgcmV0dXJuIHZhbHVlXG4gIHRocm93IG5ldyBFcnJvcignR3JpZCBjb2x1bW5zIG11c3QgcmVzb2x2ZSB0byBhIHBvc2l0aXZlIGludGVnZXIgb3Igbm9uLWVtcHR5IENTUyBzdHJpbmcnKVxufVxuXG5mdW5jdGlvbiB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4ge1xuICAgIGNsYXNzTmFtZVN1ZmZpeDogdG8gPyAnIHdmLWludGVyYWN0aXZlJyA6ICcnLFxuICAgIHJvbGU6IHRvID8gJ2xpbmsnIDogcmVzdC5yb2xlLFxuICAgIHRhYkluZGV4OiB0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleCxcbiAgICBmbG93LFxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCb3goeyBjbGFzc05hbWUsIHN0eWxlLCBjaGlsZHJlbiwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWJveCR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e3sgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSb3coe1xuICBjbGFzc05hbWUsXG4gIHN0eWxlLFxuICBjaGlsZHJlbixcbiAgZ2FwID0gMCxcbiAgYWxpZ25JdGVtcyA9ICdzdHJldGNoJyxcbiAganVzdGlmeUNvbnRlbnQgPSAnZmxleC1zdGFydCcsXG4gIHRvLFxuICBvbkNsaWNrLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHsgY2xhc3NOYW1lU3VmZml4LCByb2xlLCB0YWJJbmRleCwgZmxvdyB9ID0gdXNlTGF5b3V0Rmxvdyh0bywgb25DbGljaywgcmVzdClcbiAgY29uc3QgbWVyZ2VkU3R5bGUgPSB7XG4gICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgIGZsZXhEaXJlY3Rpb246ICdyb3cnLFxuICAgIGdhcCxcbiAgICBhbGlnbkl0ZW1zLFxuICAgIGp1c3RpZnlDb250ZW50LFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLXJvdyR7Y2xhc3NOYW1lU3VmZml4fWAsIGNsYXNzTmFtZSl9XG4gICAgICByb2xlPXtyb2xlfVxuICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgc3R5bGU9e21lcmdlZFN0eWxlfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENvbHVtbih7XG4gIGNsYXNzTmFtZSxcbiAgc3R5bGUsXG4gIGNoaWxkcmVuLFxuICBnYXAgPSAwLFxuICBhbGlnbkl0ZW1zID0gJ3N0cmV0Y2gnLFxuICBqdXN0aWZ5Q29udGVudCA9ICdmbGV4LXN0YXJ0JyxcbiAgdG8sXG4gIG9uQ2xpY2ssXG4gIC4uLnJlc3Rcbn0pIHtcbiAgY29uc3QgeyBjbGFzc05hbWVTdWZmaXgsIHJvbGUsIHRhYkluZGV4LCBmbG93IH0gPSB1c2VMYXlvdXRGbG93KHRvLCBvbkNsaWNrLCByZXN0KVxuICBjb25zdCBtZXJnZWRTdHlsZSA9IHtcbiAgICBkaXNwbGF5OiAnZmxleCcsXG4gICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgZ2FwLFxuICAgIGFsaWduSXRlbXMsXG4gICAganVzdGlmeUNvbnRlbnQsXG4gICAgLi4uc3R5bGUsXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2pvaW5DbGFzcyhgd2YtY29sdW1uJHtjbGFzc05hbWVTdWZmaXh9YCwgY2xhc3NOYW1lKX1cbiAgICAgIHJvbGU9e3JvbGV9XG4gICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICBzdHlsZT17bWVyZ2VkU3R5bGV9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gR3JpZCh7IGNsYXNzTmFtZSwgc3R5bGUsIGNoaWxkcmVuLCBjb2x1bW5zID0gMSwgZ2FwID0gMCwgdG8sIG9uQ2xpY2ssIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IHZpZXdwb3J0S2V5IH0gPSB1c2VQcm90b3R5cGUoKVxuICBjb25zdCB7IGNsYXNzTmFtZVN1ZmZpeCwgcm9sZSwgdGFiSW5kZXgsIGZsb3cgfSA9IHVzZUxheW91dEZsb3codG8sIG9uQ2xpY2ssIHJlc3QpXG4gIGNvbnN0IG1lcmdlZFN0eWxlID0ge1xuICAgIGRpc3BsYXk6ICdncmlkJyxcbiAgICBncmlkVGVtcGxhdGVDb2x1bW5zOiByZXNvbHZlQ29sdW1ucyhjb2x1bW5zLCB2aWV3cG9ydEtleSksXG4gICAgZ2FwLFxuICAgIC4uLnN0eWxlLFxuICB9XG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtqb2luQ2xhc3MoYHdmLWdyaWQke2NsYXNzTmFtZVN1ZmZpeH1gLCBjbGFzc05hbWUpfVxuICAgICAgcm9sZT17cm9sZX1cbiAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgIHN0eWxlPXttZXJnZWRTdHlsZX1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIEhlYWRpbmcoeyBsZXZlbCA9IDIsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IHRhZyA9IGBoJHtNYXRoLm1pbig2LCBNYXRoLm1heCgxLCBsZXZlbCkpfWBcbiAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQodGFnLCB7IGNsYXNzTmFtZTogYHdmLWhlYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUZXh0KHsgYXMgPSAncCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7IGNsYXNzTmFtZTogYHdmLXRleHQgJHtjbGFzc05hbWV9YC50cmltKCksIC4uLnJlc3QgfSwgY2hpbGRyZW4pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBDYXJkKHsgdG8sIG9uQ2xpY2ssIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWNhcmQgJHt0byA/ICd3Zi1pbnRlcmFjdGl2ZScgOiAnJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICByb2xlPXt0byA/ICdsaW5rJyA6IHJlc3Qucm9sZX1cbiAgICAgIHRhYkluZGV4PXt0byAmJiByZXN0LnRhYkluZGV4ID09PSB1bmRlZmluZWQgPyAwIDogcmVzdC50YWJJbmRleH1cbiAgICAgIHsuLi5yZXN0fVxuICAgICAgey4uLmZsb3d9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCYWRnZSh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c3BhbiBjbGFzc05hbWU9e2B3Zi1iYWRnZSAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NwYW4+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBdmF0YXIoeyBzaXplID0gNDAsIGxhYmVsLCBjbGFzc05hbWUgPSAnJywgc3R5bGUsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHdmLWF2YXRhciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgc3R5bGU9e3sgd2lkdGg6IHNpemUsIGhlaWdodDogc2l6ZSwgLi4uc3R5bGUgfX1cbiAgICAgIHsuLi5yZXN0fVxuICAgIC8+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEltYWdlUGxhY2Vob2xkZXIoe1xuICB3aWR0aCA9ICcxMDAlJyxcbiAgaGVpZ2h0ID0gMTYwLFxuICBib3JkZXJSYWRpdXMgPSAwLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgc3R5bGUsXG4gIC4uLnJlc3Rcbn0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1pbWFnZS1wbGFjZWhvbGRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX1cbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBzdHlsZT17eyB3aWR0aCwgaGVpZ2h0LCBib3JkZXJSYWRpdXMsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1wbGFjZWhvbGRlci1ibG9ja1wiIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKHsgdG8sIG9uQ2xpY2ssIHZhcmlhbnQgPSAnZGVmYXVsdCcsIGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIGNvbnN0IGZsb3cgPSB1c2VGbG93VGFyZ2V0KHRvLCBvbkNsaWNrKVxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPXtgd2YtYnV0dG9uIHdmLWJ1dHRvbi0ke3ZhcmlhbnR9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgICB7Li4uZmxvd31cbiAgICA+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRJbnB1dCh7IGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIDxpbnB1dCBjbGFzc05hbWU9e2B3Zi1pbnB1dCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gdHlwZT1cInRleHRcIiB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRleHRBcmVhKHsgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gPHRleHRhcmVhIGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXRleHRhcmVhICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0gLz5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdCh7IGNsYXNzTmFtZSA9ICcnLCBjaGlsZHJlbiwgLi4ucmVzdCB9KSB7XG4gIHJldHVybiA8c2VsZWN0IGNsYXNzTmFtZT17YHdmLWlucHV0IHdmLXNlbGVjdCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PntjaGlsZHJlbn08L3NlbGVjdD5cbn1cblxuZnVuY3Rpb24gQ2hvaWNlKHsgdHlwZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8bGFiZWwgY2xhc3NOYW1lPXtgd2YtY2hvaWNlICR7Y2xhc3NOYW1lfWAudHJpbSgpfT5cbiAgICAgIDxpbnB1dCBjbGFzc05hbWU9XCJ3Zi1jaG9pY2UtaW5wdXRcIiB0eXBlPXt0eXBlfSB7Li4ucmVzdH0gLz5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWNob2ljZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+XG4gICAgPC9sYWJlbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ2hlY2tib3gocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cImNoZWNrYm94XCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gUmFkaW8ocHJvcHMpIHtcbiAgcmV0dXJuIDxDaG9pY2UgdHlwZT1cInJhZGlvXCIgey4uLnByb3BzfSAvPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gVG9nZ2xlKHsgY2hlY2tlZCA9IGZhbHNlLCBvbkNoYW5nZSwgbGFiZWwsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIHJvbGU9XCJzd2l0Y2hcIlxuICAgICAgYXJpYS1jaGVja2VkPXtjaGVja2VkfVxuICAgICAgY2xhc3NOYW1lPXtgd2YtdG9nZ2xlICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgb25DbGljaz17KGV2ZW50KSA9PiBvbkNoYW5nZT8uKCFjaGVja2VkLCBldmVudCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdHJhY2tcIj48c3BhbiBjbGFzc05hbWU9XCJ3Zi10b2dnbGUtdGh1bWJcIiAvPjwvc3Bhbj5cbiAgICAgIHtsYWJlbCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXRvZ2dsZS1sYWJlbFwiPntsYWJlbH08L3NwYW4+IDogbnVsbH1cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gRm9ybUZpZWxkKHsgbGFiZWwsIGh0bWxGb3IsIGhpbnQsIGVycm9yLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZm9ybS1maWVsZCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cIndmLWZpZWxkLWxhYmVsXCIgaHRtbEZvcj17aHRtbEZvcn0+e2xhYmVsfTwvbGFiZWw+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgICB7aGludCAmJiAhZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1oaW50XCI+e2hpbnR9PC9zcGFuPiA6IG51bGx9XG4gICAgICB7ZXJyb3IgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1maWVsZC1lcnJvclwiIHJvbGU9XCJhbGVydFwiPntlcnJvcn08L3NwYW4+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IHVzZVByb3RvdHlwZSB9IGZyb20gJy4uL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyBjcmVhdGVGbG93UHJvcHMgfSBmcm9tICcuL2Zsb3cuanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBQYWdlSGVhZGVyKHsgdGl0bGUsIHRpdGxlSWQsIHN1YnRpdGxlLCBzdWJ0aXRsZUlkLCBhY3Rpb25zLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGhlYWRlciBjbGFzc05hbWU9e2B3Zi1wYWdlLWhlYWRlciAke2NsYXNzTmFtZX1gLnRyaW0oKX0gey4uLnJlc3R9PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1wYWdlLWhlYWRlci1jb3B5XCI+XG4gICAgICAgIDxoMSBpZD17dGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS10aXRsZVwiPnt0aXRsZX08L2gxPlxuICAgICAgICB7c3VidGl0bGUgPyA8cCBpZD17c3VidGl0bGVJZH0gY2xhc3NOYW1lPVwid2YtcGFnZS1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3A+IDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge2FjdGlvbnMgPyA8ZGl2IGNsYXNzTmFtZT1cIndmLXBhZ2UtYWN0aW9uc1wiPnthY3Rpb25zfTwvZGl2PiA6IG51bGx9XG4gICAgPC9oZWFkZXI+XG4gIClcbn1cblxuZnVuY3Rpb24gTmF2aWdhdGlvbkxpc3QoeyBhcywgaXRlbXMsIGFjdGl2ZUlkLCBjbGFzc05hbWUsIC4uLnJlc3QgfSkge1xuICBjb25zdCB7IG5hdmlnYXRlIH0gPSB1c2VQcm90b3R5cGUoKVxuICByZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcbiAgICBhcyxcbiAgICB7IGNsYXNzTmFtZSwgLi4ucmVzdCB9LFxuICAgIGl0ZW1zLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgPGJ1dHRvblxuICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAga2V5PXtpdGVtLnRvfVxuICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLW5hdi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtbmF2LWl0ZW0nfVxuICAgICAgICB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfVxuICAgICAgPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1uYXYtbWFya1wiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW5hdi1sYWJlbFwiPntpdGVtLmxhYmVsfTwvc3Bhbj5cbiAgICAgIDwvYnV0dG9uPlxuICAgICkpLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTaWRlTmF2KHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8TmF2aWdhdGlvbkxpc3RcbiAgICAgIGFzPVwibmF2XCJcbiAgICAgIGl0ZW1zPXtpdGVtc31cbiAgICAgIGFjdGl2ZUlkPXthY3RpdmVJZH1cbiAgICAgIGNsYXNzTmFtZT17YHdmLXNpZGUtbmF2ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgey4uLnJlc3R9XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVGFiQmFyKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLXRhYi1iYXIgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgIGtleT17aXRlbS50b31cbiAgICAgICAgICBjbGFzc05hbWU9e2l0ZW0udG8gPT09IGFjdGl2ZUlkID8gJ3dmLXRhYi1pdGVtIGlzLWFjdGl2ZScgOiAnd2YtdGFiLWl0ZW0nfVxuICAgICAgICAgIHsuLi5jcmVhdGVGbG93UHJvcHMoaXRlbS50bywgaXRlbS5vbkNsaWNrLCBuYXZpZ2F0ZSl9XG4gICAgICAgID5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi10YWItaWNvblwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtdGFiLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBCcmVhZGNydW1icyh7IGl0ZW1zID0gW10sIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgeyBuYXZpZ2F0ZSB9ID0gdXNlUHJvdG90eXBlKClcbiAgcmV0dXJuIChcbiAgICA8bmF2IGNsYXNzTmFtZT17YHdmLWJyZWFkY3J1bWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSBhcmlhLWxhYmVsPVwiQnJlYWRjcnVtYnNcIiB7Li4ucmVzdH0+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4gKFxuICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtgJHtpdGVtLmxhYmVsfS0ke2luZGV4fWB9PlxuICAgICAgICAgIHtpbmRleCA+IDAgPyA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1icmVhZGNydW1iLWRpdmlkZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPiA6IG51bGx9XG4gICAgICAgICAge2l0ZW0udG8gPyAoXG4gICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cIndmLWJyZWFkY3J1bWItbGlua1wiIHR5cGU9XCJidXR0b25cIiB7Li4uY3JlYXRlRmxvd1Byb3BzKGl0ZW0udG8sIGl0ZW0ub25DbGljaywgbmF2aWdhdGUpfT5cbiAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApIDogPHNwYW4gY2xhc3NOYW1lPVwid2YtYnJlYWRjcnVtYi1jdXJyZW50XCI+e2l0ZW0ubGFiZWx9PC9zcGFuPn1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICkpfVxuICAgIDwvbmF2PlxuICApXG59XG5cbi8qKiBcdTc5RkJcdTUyQThcdTdBRUZcdTY1NzRcdTVDNEZcdTU4RjNcdUZGMUFcdTUxODVcdTVCQjlcdTUzM0FcdTUzRUZcdTZFREFcdUZGMENUYWJCYXIgXHU4RDM0XHU1RTk1XHUzMDAydGFicyAvIGFjdGl2ZUlkIFx1NEUwRSBUYWJCYXIgXHU3NkY4XHU1NDBDXHUzMDAyICovXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlU2hlbGwoeyBjaGlsZHJlbiwgdGFicyA9IFtdLCBhY3RpdmVJZCwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtbW9iaWxlLXNoZWxsICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICA8bWFpbiBjbGFzc05hbWU9XCJ3Zi1tb2JpbGUtc2hlbGwtYm9keVwiPntjaGlsZHJlbn08L21haW4+XG4gICAgICB7dGFicy5sZW5ndGggPiAwID8gPFRhYkJhciBpdGVtcz17dGFic30gYWN0aXZlSWQ9e2FjdGl2ZUlkfSAvPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICJpbXBvcnQgeyB1c2VGbG93VGFyZ2V0IH0gZnJvbSAnLi9mbG93LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gQ2VsbCh7IHRvLCBvbkNsaWNrLCB0aXRsZSwgc3VidGl0bGUsIHZhbHVlLCBjbGFzc05hbWUgPSAnJywgY2hpbGRyZW4sIC4uLnJlc3QgfSkge1xuICBjb25zdCBmbG93ID0gdXNlRmxvd1RhcmdldCh0bywgb25DbGljaylcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3Zi1jZWxsICR7dG8gPyAnd2YtaW50ZXJhY3RpdmUnIDogJyd9ICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgcm9sZT17dG8gPyAnbGluaycgOiByZXN0LnJvbGV9XG4gICAgICB0YWJJbmRleD17dG8gJiYgcmVzdC50YWJJbmRleCA9PT0gdW5kZWZpbmVkID8gMCA6IHJlc3QudGFiSW5kZXh9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2YtY2VsbC1tYWluXCI+XG4gICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwid2YtY2VsbC10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz5cbiAgICAgICAge3N1YnRpdGxlID8gPHNwYW4gY2xhc3NOYW1lPVwid2YtY2VsbC1zdWJ0aXRsZVwiPntzdWJ0aXRsZX08L3NwYW4+IDogbnVsbH1cbiAgICAgICAge2NoaWxkcmVufVxuICAgICAgPC9kaXY+XG4gICAgICB7dmFsdWUgIT09IHVuZGVmaW5lZCA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLWNlbGwtdmFsdWVcIj57dmFsdWV9PC9zcGFuPiA6IG51bGx9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIERhdGFUYWJsZSh7IGNvbHVtbnMgPSBbXSwgcm93cyA9IFtdLCBnZXRSb3dLZXksIGNsYXNzTmFtZSA9ICcnLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLXRhYmxlLXdyYXAgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3Zi10YWJsZVwiPlxuICAgICAgICA8dGhlYWQgY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZFwiPlxuICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ3Zi10YWJsZS1oZWFkZXItcm93XCI+XG4gICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwid2YtdGFibGUtaGVhZGluZ1wiIGRhdGEtd2Yta2V5PXtjb2x1bW4ua2V5fSBrZXk9e2NvbHVtbi5rZXl9Pntjb2x1bW4ubGFiZWx9PC90aD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvdHI+XG4gICAgICAgIDwvdGhlYWQ+XG4gICAgICAgIDx0Ym9keSBjbGFzc05hbWU9XCJ3Zi10YWJsZS1ib2R5XCI+XG4gICAgICAgICAge3Jvd3MubWFwKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dLZXkgPSBnZXRSb3dLZXkgPyBnZXRSb3dLZXkocm93KSA6IHJvdy5pZCB8fCBpbmRleFxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cIndmLXRhYmxlLXJvd1wiIGRhdGEtd2Yta2V5PXtyb3dLZXl9IGtleT17cm93S2V5fT5cbiAgICAgICAgICAgICAgICB7Y29sdW1ucy5tYXAoKGNvbHVtbikgPT4gKFxuICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cIndmLXRhYmxlLWNlbGxcIiBkYXRhLXdmLWtleT17Y29sdW1uLmtleX0ga2V5PXtjb2x1bW4ua2V5fT5cbiAgICAgICAgICAgICAgICAgICAge2NvbHVtbi5yZW5kZXIgPyBjb2x1bW4ucmVuZGVyKHJvd1tjb2x1bW4ua2V5XSwgcm93KSA6IHJvd1tjb2x1bW4ua2V5XX1cbiAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvdGJvZHk+XG4gICAgICA8L3RhYmxlPlxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUYWJzKHsgaXRlbXMgPSBbXSwgYWN0aXZlSWQsIG9uQ2hhbmdlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9e2B3Zi10YWJzICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwidGFibGlzdFwiIHsuLi5yZXN0fT5cbiAgICAgIHtpdGVtcy5tYXAoKGl0ZW0pID0+IChcbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cIndmLXRhYi1jb250cm9sXCJcbiAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICByb2xlPVwidGFiXCJcbiAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtpdGVtLmlkID09PSBhY3RpdmVJZH1cbiAgICAgICAgICBrZXk9e2l0ZW0uaWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4gb25DaGFuZ2U/LihpdGVtLmlkKX1cbiAgICAgICAgPlxuICAgICAgICAgIHtpdGVtLmxhYmVsfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICkpfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBTdGVwcyh7XG4gIGl0ZW1zID0gW10sXG4gIGN1cnJlbnQgPSAwLFxuICBkaXJlY3Rpb24gPSAnaG9yaXpvbnRhbCcsXG4gIGNsYXNzTmFtZSA9ICcnLFxuICAuLi5yZXN0XG59KSB7XG4gIGNvbnN0IHZlcnRpY2FsID0gZGlyZWN0aW9uID09PSAndmVydGljYWwnXG4gIHJldHVybiAoXG4gICAgPG9sXG4gICAgICBjbGFzc05hbWU9e2B3Zi1zdGVwcyAke3ZlcnRpY2FsID8gJ3dmLXN0ZXBzLXZlcnRpY2FsJyA6ICd3Zi1zdGVwcy1ob3Jpem9udGFsJ30gJHtjbGFzc05hbWV9YC50cmltKCl9XG4gICAgICB7Li4ucmVzdH1cbiAgICA+XG4gICAgICB7aXRlbXMubWFwKChpdGVtLCBpbmRleCkgPT4ge1xuICAgICAgICBjb25zdCBzdGF0dXMgPSBpbmRleCA8IGN1cnJlbnQgPyAnZG9uZScgOiBpbmRleCA9PT0gY3VycmVudCA/ICdjdXJyZW50JyA6ICd0b2RvJ1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9e2B3Zi1zdGVwcy1pdGVtIHdmLXN0ZXBzLWl0ZW0tJHtzdGF0dXN9YH0ga2V5PXtpdGVtLmlkIHx8IGl0ZW0ubGFiZWwgfHwgaW5kZXh9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcC1tYXJrXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+XG4gICAgICAgICAgICAgICAge3N0YXR1cyA9PT0gJ2RvbmUnID8gbnVsbCA6IGluZGV4ICsgMX1cbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICB7aW5kZXggPCBpdGVtcy5sZW5ndGggLSAxID8gPHNwYW4gY2xhc3NOYW1lPVwid2Ytc3RlcHMtbGluZVwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1zdGVwcy1jb250ZW50XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWxhYmVsXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICB7aXRlbS5kZXNjcmlwdGlvbiA/IDxzcGFuIGNsYXNzTmFtZT1cIndmLXN0ZXBzLWRlc2NcIj57aXRlbS5kZXNjcmlwdGlvbn08L3NwYW4+IDogbnVsbH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIClcbiAgICAgIH0pfVxuICAgIDwvb2w+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEVtcHR5U3RhdGUoeyB0aXRsZSwgZGVzY3JpcHRpb24sIGFjdGlvbiwgY2xhc3NOYW1lID0gJycsIC4uLnJlc3QgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtgd2YtZW1wdHktc3RhdGUgJHtjbGFzc05hbWV9YC50cmltKCl9IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWVtcHR5LWljb25cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAge3RpdGxlID8gPHN0cm9uZyBjbGFzc05hbWU9XCJ3Zi1lbXB0eS10aXRsZVwiPnt0aXRsZX08L3N0cm9uZz4gOiBudWxsfVxuICAgICAge2Rlc2NyaXB0aW9uID8gPHAgY2xhc3NOYW1lPVwid2YtZW1wdHktZGVzY1wiPntkZXNjcmlwdGlvbn08L3A+IDogbnVsbH1cbiAgICAgIHthY3Rpb24gPyA8ZGl2IGNsYXNzTmFtZT1cIndmLWVtcHR5LWFjdGlvblwiPnthY3Rpb259PC9kaXY+IDogbnVsbH1cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwgImltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vZm9ybXMuanN4J1xuXG5mdW5jdGlvbiBTY3JlZW5Qb3J0YWwoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IGFuY2hvciA9IFJlYWN0LnVzZVJlZihudWxsKVxuICBjb25zdCBbaG9zdCwgc2V0SG9zdF0gPSBSZWFjdC51c2VTdGF0ZShudWxsKVxuXG4gIFJlYWN0LnVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SG9zdChhbmNob3IuY3VycmVudD8uY2xvc2VzdCgnLndmLXNjcmVlbi1jb250ZW50JykgfHwgbnVsbClcbiAgfSwgW10pXG5cbiAgaWYgKCFob3N0KSByZXR1cm4gPHNwYW4gcmVmPXthbmNob3J9IGNsYXNzTmFtZT1cIndmLW92ZXJsYXktYW5jaG9yXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgcmV0dXJuIFJlYWN0RE9NLmNyZWF0ZVBvcnRhbChjaGlsZHJlbiwgaG9zdClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1vZGFsKHsgb3BlbiwgdGl0bGUsIGNoaWxkcmVuLCBhY3Rpb25zLCBvbkNsb3NlLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLW1vZGFsLW92ZXJsYXkgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJwcmVzZW50YXRpb25cIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIndmLW1vZGFsXCIgcm9sZT1cImRpYWxvZ1wiIGFyaWEtbW9kYWw9XCJ0cnVlXCIgYXJpYS1sYWJlbD17dGl0bGV9PlxuICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwid2YtbW9kYWwtaGVhZGVyXCI+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cIndmLW1vZGFsLXRpdGxlXCI+e3RpdGxlfTwvc3Ryb25nPlxuICAgICAgICAgICAge29uQ2xvc2UgPyA8QnV0dG9uIG9uQ2xpY2s9e29uQ2xvc2V9Plx1NTE3M1x1OTVFRDwvQnV0dG9uPiA6IG51bGx9XG4gICAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1ib2R5XCI+e2NoaWxkcmVufTwvZGl2PlxuICAgICAgICAgIHthY3Rpb25zID8gPGZvb3RlciBjbGFzc05hbWU9XCJ3Zi1tb2RhbC1mb290ZXJcIj57YWN0aW9uc308L2Zvb3Rlcj4gOiBudWxsfVxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29uZmlybURpYWxvZyh7XG4gIG9wZW4sXG4gIHRpdGxlID0gJ1x1Nzg2RVx1OEJBNFx1NjRDRFx1NEY1QycsXG4gIG1lc3NhZ2UsXG4gIGNvbmZpcm1MYWJlbCA9ICdcdTc4NkVcdThCQTQnLFxuICBjYW5jZWxMYWJlbCA9ICdcdTUzRDZcdTZEODgnLFxuICBvbkNvbmZpcm0sXG4gIG9uQ2FuY2VsLFxuICBjbGFzc05hbWUgPSAnJyxcbiAgLi4ucmVzdFxufSkge1xuICByZXR1cm4gKFxuICAgIDxNb2RhbFxuICAgICAgb3Blbj17b3Blbn1cbiAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgb25DbG9zZT17b25DYW5jZWx9XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIGFjdGlvbnM9eyhcbiAgICAgICAgPD5cbiAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e29uQ2FuY2VsfT57Y2FuY2VsTGFiZWx9PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiB2YXJpYW50PVwicHJpbWFyeVwiIG9uQ2xpY2s9e29uQ29uZmlybX0+e2NvbmZpcm1MYWJlbH08L0J1dHRvbj5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgID5cbiAgICAgIDxwIGNsYXNzTmFtZT1cIndmLWNvbmZpcm0tbWVzc2FnZVwiPnttZXNzYWdlfTwvcD5cbiAgICA8L01vZGFsPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUb2FzdCh7IG9wZW4sIGNoaWxkcmVuLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLXRvYXN0ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSByb2xlPVwic3RhdHVzXCIgey4uLnJlc3R9PntjaGlsZHJlbn08L2Rpdj5cbiAgICA8L1NjcmVlblBvcnRhbD5cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gTG9hZGluZ092ZXJsYXkoeyBvcGVuLCBsYWJlbCA9ICdcdTUyQTBcdThGN0RcdTRFMkQnLCBjbGFzc05hbWUgPSAnJywgLi4ucmVzdCB9KSB7XG4gIGlmICghb3BlbikgcmV0dXJuIG51bGxcbiAgcmV0dXJuIChcbiAgICA8U2NyZWVuUG9ydGFsPlxuICAgICAgPGRpdiBjbGFzc05hbWU9e2B3Zi1vdmVybGF5IHdmLWxvYWRpbmcgJHtjbGFzc05hbWV9YC50cmltKCl9IHJvbGU9XCJzdGF0dXNcIiB7Li4ucmVzdH0+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLWxvYWRpbmctc2hhcGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3Zi1sb2FkaW5nLWxhYmVsXCI+e2xhYmVsfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIDwvU2NyZWVuUG9ydGFsPlxuICApXG59XG4iLCAiaW1wb3J0IHsgdXNlRmxvd1RhcmdldCB9IGZyb20gJy4vZmxvdy5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIFdpcmVNYXAoeyBjbGFzc05hbWUgPSAnJywgc3R5bGUsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1hcCAke2NsYXNzTmFtZX1gLnRyaW0oKX0gc3R5bGU9e3sgcG9zaXRpb246ICdyZWxhdGl2ZScsIC4uLnN0eWxlIH19IHsuLi5yZXN0fT5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1saW5lIHdmLW1hcC1saW5lLWFcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgPHNwYW4gY2xhc3NOYW1lPVwid2YtbWFwLWxpbmUgd2YtbWFwLWxpbmUtYlwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE1hcE1hcmtlcih7IHgsIHksIGxhYmVsLCB0bywgb25DbGljaywgY2xhc3NOYW1lID0gJycsIHN0eWxlLCAuLi5yZXN0IH0pIHtcbiAgY29uc3QgZmxvdyA9IHVzZUZsb3dUYXJnZXQodG8sIG9uQ2xpY2spXG4gIHJldHVybiAoXG4gICAgPGJ1dHRvblxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBjbGFzc05hbWU9e2B3Zi1tYXAtbWFya2VyICR7Y2xhc3NOYW1lfWAudHJpbSgpfVxuICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICBzdHlsZT17eyBsZWZ0OiBgJHt4fSVgLCB0b3A6IGAke3l9JWAsIC4uLnN0eWxlIH19XG4gICAgICB7Li4ucmVzdH1cbiAgICAgIHsuLi5mbG93fVxuICAgID5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIndmLW1hcC1tYXJrZXItc2hhcGVcIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNYXBPdmVybGF5KHsgcG9zaXRpb24gPSAnYm90dG9tJywgY2xhc3NOYW1lID0gJycsIGNoaWxkcmVuLCAuLi5yZXN0IH0pIHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YHdmLW1hcC1vdmVybGF5IHdmLW1hcC1vdmVybGF5LSR7cG9zaXRpb259ICR7Y2xhc3NOYW1lfWAudHJpbSgpfSB7Li4ucmVzdH0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9kaXY+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQgeyBNb2JpbGVTaGVsbCB9IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IHVzZVNjcmVlbklkIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvU2NyZWVuSWRlbnRpdHkuanN4J1xuXG5jb25zdCB0YWJzID0gW1xuICB7IGxhYmVsOiAnXHU1M0QxXHU3M0IwJywgdG86ICdkaXNjb3ZlcicgfSxcbiAgeyBsYWJlbDogJ1x1ODg0Q1x1N0EwQicsIHRvOiAndHJpcHMnIH0sXG4gIHsgbGFiZWw6ICdcdTYyMTFcdTc2ODQnLCB0bzogJ3Byb2ZpbGUnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBNb2JpbGVMYXlvdXQoeyBjaGlsZHJlbiB9KSB7XG4gIGNvbnN0IHNjcmVlbklkID0gdXNlU2NyZWVuSWQoKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVTaGVsbCBjbGFzc05hbWU9XCJ3ZWVrZW5kLXNoZWxsIHdlZWtlbmQtbGF5b3V0XCIgdGFicz17dGFic30gYWN0aXZlSWQ9e3NjcmVlbklkfSBhcmlhLWxhYmVsPVwiXHU1NDY4XHU2NzJCXHU1MUZBXHU1M0QxXHU2NUM1XHU4ODRDXHU1MkE5XHU2MjRCXCI+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Nb2JpbGVTaGVsbD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEF2YXRhcixcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIERhdGFUYWJsZSxcbiAgRm9ybUZpZWxkLFxuICBNb2RhbCxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxuICBUZXh0SW5wdXQsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuY29uc3QgQ09TVFMgPSBbXG4gIHsgaWQ6ICdjb3N0LXRyYW5zaXQnLCBpdGVtOiAnXHU1RTAyXHU1MTg1XHU0RUE0XHU5MDFBJywgb3duZXI6ICdcdTUxNzFcdTU0MEMnLCBhbW91bnQ6ICc0OCcgfSxcbiAgeyBpZDogJ2Nvc3QtdGlja2V0JywgaXRlbTogJ1x1NUM1NVx1NTM4NVx1OTVFOFx1Nzk2OCcsIG93bmVyOiAnXHU2Nzk3XHU2NjUzXHU5MUNFJywgYW1vdW50OiAnODAnIH0sXG4gIHsgaWQ6ICdjb3N0LWx1bmNoJywgaXRlbTogJ1x1NTM0OFx1OTkxMCcsIG93bmVyOiAnXHU1MTcxXHU1NDBDJywgYW1vdW50OiAnMTgwJyB9LFxuICB7IGlkOiAnY29zdC1tYXJrZXQnLCBpdGVtOiAnXHU1RTAyXHU5NkM2XHU5ODg0XHU3NTU5Jywgb3duZXI6ICdcdTRFMkFcdTRFQkEnLCBhbW91bnQ6ICcxMjAnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBCdWRnZXRTY3JlZW4oKSB7XG4gIGNvbnN0IFtpbnZpdGVPcGVuLCBzZXRJbnZpdGVPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwiYnVkZ2V0LXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgYnVkZ2V0X19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwiYnVkZ2V0LWhlYWRlclwiIHRpdGxlSWQ9XCJidWRnZXQtdGl0bGVcIiBjbGFzc05hbWU9XCJidWRnZXRfX2hlYWRlclwiIHRpdGxlPVwiXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBXCIgc3VidGl0bGU9XCJcdTRFM0FcdTg4NENcdTdBMEJcdTk4ODRcdTc1NTlcdThEMzlcdTc1MjhcdTVFNzZcdTkwODBcdThCRjdcdTRGMTlcdTRGMzRcIiBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImJ1ZGdldF9fYmFja1wiIHRvPVwidHJpcC1jb25maXJtXCI+XHU4RkQ0XHU1NkRFPC9CdXR0b24+fSAvPlxuICAgICAgICA8Q2FyZCBpZD1cImJ1ZGdldC1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19zdW1tYXJ5XCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX3N1bW1hcnktbGFiZWxcIj5cdTk4ODRcdThCQTFcdTYwM0JcdThEMzlcdTc1Mjg8L1RleHQ+XG4gICAgICAgICAgICA8c3Ryb25nIGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS12YWx1ZVwiPjQyOCBcdTUxNDM8L3N0cm9uZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fc3VtbWFyeS1ub3RlXCI+XHU2MzA5IDMgXHU0RjREXHU1NDBDXHU4ODRDXHU0RUJBXHU4QkExXHU3Qjk3XHVGRjBDXHU0RUJBXHU1NzQ3XHU3RUE2IDE0MyBcdTUxNDM8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPERhdGFUYWJsZSBpZD1cImJ1ZGdldC10YWJsZVwiIGNsYXNzTmFtZT1cImJ1ZGdldF9fdGFibGVcIiBjb2x1bW5zPXtbeyBrZXk6ICdpdGVtJywgbGFiZWw6ICdcdTk4NzlcdTc2RUUnIH0sIHsga2V5OiAnb3duZXInLCBsYWJlbDogJ1x1NjI3Rlx1NjJDNScgfSwgeyBrZXk6ICdhbW91bnQnLCBsYWJlbDogJ1x1OTFEMVx1OTg5RCcgfV19IHJvd3M9e0NPU1RTfSBnZXRSb3dLZXk9eyhyb3cpID0+IHJvdy5pZH0gLz5cbiAgICAgICAgPENvbHVtbiBpZD1cImJ1ZGdldC1tZW1iZXJzXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJzXCIgZ2FwPXsxMn0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlcnMtaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVycy1sYWJlbFwiPlx1NTQwQ1x1ODg0Q1x1NEVCQTwvVGV4dD5cbiAgICAgICAgICAgIDxCdXR0b24gaWQ9XCJidWRnZXQtaW52aXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWFjdGlvblwiIG9uQ2xpY2s9eygpID0+IHNldEludml0ZU9wZW4odHJ1ZSl9Plx1OTA4MFx1OEJGNzwvQnV0dG9uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXItc3RhY2tcIiBnYXA9ezE0fT5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiYnVkZ2V0X19tZW1iZXJcIiBkYXRhLXdmLWtleT1cIm1lbWJlci1saW5cIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU2Nzk3XHU2NjUzXHU5MUNFXCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU2Nzk3XHU2NjUzXHU5MUNFPC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlclwiIGRhdGEtd2Yta2V5PVwibWVtYmVyLWNoZW5cIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU5NjQ4XHU2OTg2XCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU5NjQ4XHU2OTg2PC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlclwiIGRhdGEtd2Yta2V5PVwibWVtYmVyLXpob3VcIiBnYXA9ezV9IGFsaWduSXRlbXM9XCJjZW50ZXJcIj48QXZhdGFyIGNsYXNzTmFtZT1cImJ1ZGdldF9fbWVtYmVyLWF2YXRhclwiIGxhYmVsPVwiXHU1NDY4XHU1Q0I4XCIgLz48VGV4dCBjbGFzc05hbWU9XCJidWRnZXRfX21lbWJlci1uYW1lXCI+XHU1NDY4XHU1Q0I4PC9UZXh0PjwvQ29sdW1uPlxuICAgICAgICAgIDwvUm93PlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPEJ1dHRvbiBpZD1cImJ1ZGdldC1kb25lXCIgY2xhc3NOYW1lPVwiYnVkZ2V0X19kb25lXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY29uZmlybVwiPlx1NEZERFx1NUI1OFx1OTg4NFx1N0I5NzwvQnV0dG9uPlxuICAgICAgICA8TW9kYWxcbiAgICAgICAgICBpZD1cImJ1ZGdldC1pbnZpdGUtbW9kYWxcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLW1vZGFsXCJcbiAgICAgICAgICBvcGVuPXtpbnZpdGVPcGVufVxuICAgICAgICAgIHRpdGxlPVwiXHU5MDgwXHU4QkY3XHU1NDBDXHU4ODRDXHU0RUJBXCJcbiAgICAgICAgICBvbkNsb3NlPXsoKSA9PiBzZXRJbnZpdGVPcGVuKGZhbHNlKX1cbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLXN1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgb25DbGljaz17KCkgPT4gc2V0SW52aXRlT3BlbihmYWxzZSl9Plx1NTNEMVx1OTAwMVx1OTA4MFx1OEJGNzwvQnV0dG9uPn1cbiAgICAgICAgPlxuICAgICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwiYnVkZ2V0X19pbnZpdGUtZmllbGRcIiBsYWJlbD1cIlx1NjI0Qlx1NjczQVx1NTNGN1x1NjIxNlx1NzUyOFx1NjIzN1x1NTQwRFwiIGh0bWxGb3I9XCJidWRnZXQtaW52aXRlLWlucHV0XCI+XG4gICAgICAgICAgICA8VGV4dElucHV0IGlkPVwiYnVkZ2V0LWludml0ZS1pbnB1dFwiIGNsYXNzTmFtZT1cImJ1ZGdldF9faW52aXRlLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJcdThGOTNcdTUxNjVcdTU0MENcdTg4NENcdTRFQkFcdTRGRTFcdTYwNkZcIiAvPlxuICAgICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8L01vZGFsPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEdyaWQsXG4gIEhlYWRpbmcsXG4gIEltYWdlUGxhY2Vob2xkZXIsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBST1VURVMgPSBbXG4gIHsgaWQ6ICdyb3V0ZS1jYW5hbCcsIHRpdGxlOiAnXHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5JywgbWV0YTogJ1x1NkI2NVx1ODg0QyA4LjYga20gXHUwMEI3IDYgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1MzAwMVx1Njg2NVx1NEUwQlx1NUUwMlx1OTZDNlx1NEUwRVx1NTA4RFx1NjY1QVx1NkNCM1x1NUNCOCcgfSxcbiAgeyBpZDogJ3JvdXRlLWhpbGxzJywgdGl0bGU6ICdcdTU3Q0VcdTUzMTdcdThGN0JcdTVGOTJcdTZCNjUnLCBtZXRhOiAnXHU1RjkyXHU2QjY1IDExIGttIFx1MDBCNyA3IFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTY3OTdcdTk1RjRcdTdGMTNcdTU3NjFcdTMwMDFcdTg5QzJcdTY2NkZcdTUzRjBcdTRFMEVcdTVDNzFcdTgxMUFcdTVDMEZcdTk5ODYnIH0sXG4gIHsgaWQ6ICdyb3V0ZS1sYW5lcycsIHRpdGxlOiAnXHU4MDAxXHU4ODU3XHU2MTYyXHU2RTM4JywgbWV0YTogJ1x1NkI2NVx1ODg0QyA1LjIga20gXHUwMEI3IDQgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NURGN1x1NTNFM1x1NjVFOVx1OTkxMFx1MzAwMVx1NjVFN1x1NEU2Nlx1NUU5N1x1NEUwRVx1NzkzRVx1NTMzQVx1ODJCMVx1NTZFRCcgfSxcbiAgeyBpZDogJ3JvdXRlLWxha2UnLCB0aXRsZTogJ1x1NzNBRlx1NkU1Nlx1OUE5MVx1ODg0Q1x1NTM0QVx1NjVFNScsIG1ldGE6ICdcdTlBOTFcdTg4NEMgMTgga20gXHUwMEI3IDUgXHU1QzBGXHU2NUY2Jywgbm90ZTogJ1x1NkU3Rlx1NTczMFx1NjgwOFx1OTA1M1x1MzAwMVx1NTgyNFx1NUNCOFx1NEUwRVx1NjVFNVx1ODQzRFx1NUU3M1x1NTNGMCcgfSxcbiAgeyBpZDogJ3JvdXRlLW11c2V1bScsIHRpdGxlOiAnXHU5NkU4XHU1OTI5XHU1MzVBXHU3MjY5XHU5OTg2XHU3RUJGJywgbWV0YTogJ1x1NTE2Q1x1NEVBNCA0IFx1N0FEOSBcdTAwQjcgNiBcdTVDMEZcdTY1RjYnLCBub3RlOiAnXHU0RTA5XHU0RTJBXHU1QzU1XHU5OTg2XHU0RTBFXHU0RTAwXHU5NUY0XHU1Qjg5XHU5NzU5XHU1NDk2XHU1NTYxXHU5OTg2JyB9LFxuICB7IGlkOiAncm91dGUtbmlnaHQnLCB0aXRsZTogJ1x1NTkxQ1x1ODI3Mlx1NUVGQVx1N0I1MVx1NjU2M1x1NkI2NScsIG1ldGE6ICdcdTZCNjVcdTg4NEMgNi40IGttIFx1MDBCNyAzIFx1NUMwRlx1NjVGNicsIG5vdGU6ICdcdTVFN0ZcdTU3M0FcdTMwMDFcdTUyNjdcdTk2NjJcdTRFMEVcdTZDNUZcdThGQjlcdTcwNkZcdTUxNDlcdTVFMjYnIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBEaXNjb3ZlclNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cImRpc2NvdmVyLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgZGlzY292ZXJfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cImRpc2NvdmVyLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cImRpc2NvdmVyLXRpdGxlXCJcbiAgICAgICAgICBzdWJ0aXRsZUlkPVwiZGlzY292ZXItc3VidGl0bGVcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRpc2NvdmVyX19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU4RkQ5XHU0RTJBXHU1NDY4XHU2NzJCXHVGRjBDXHU1M0JCXHU1NEVBXHU4RDcwXHU4RDcwXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NEUzQVx1NEY2MFx1NjMxMVx1NEU4Nlx1NTFFMFx1Njc2MVx1NEUwRFx1NzUyOFx1OEQ3Nlx1NjVGNlx1OTVGNFx1NzY4NFx1NTdDRVx1NUUwMlx1OERFRlx1N0VCRlwiXG4gICAgICAgICAgYWN0aW9ucz17PEJ1dHRvbiBpZD1cImRpc2NvdmVyLW1hcC1hY3Rpb25cIiBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fbWFwLWFjdGlvblwiIHRvPVwiZXhwbG9yZS1tYXBcIj5cdTU3MzBcdTU2RkU8L0J1dHRvbj59XG4gICAgICAgIC8+XG4gICAgICAgIDxDYXJkIGlkPVwiZGlzY292ZXItZmVhdHVyZWRcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXJvdXRlLWNhcmQgZGlzY292ZXJfX2ZlYXR1cmVkXCIgdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtaW1hZ2VcIiBoZWlnaHQ9ezE3Nn0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkX19ib2R5IGRpc2NvdmVyX19mZWF0dXJlZC1ib2R5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIndlZWtlbmQtY2hpcC1yb3cgZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlc1wiIGdhcD17OH0+XG4gICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtYmFkZ2VcIj5cdTY3MkNcdTU0NjhcdTYzQThcdTgzNTA8L0JhZGdlPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLWJhZGdlXCI+XHU5MDAyXHU1NDA4XHU1MjFEXHU2QjIxXHU1MjMwXHU4QkJGPC9CYWRnZT5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiZGlzY292ZXJfX2ZlYXR1cmVkLXRpdGxlXCIgbGV2ZWw9ezJ9Plx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImRpc2NvdmVyX19mZWF0dXJlZC1jb3B5XCI+XHU0RUNFXHU2NUU3XHU0RUQzXHU1RTkzXHU1MUZBXHU1M0QxXHVGRjBDXHU2Q0JGXHU2QzM0XHU1Q0I4XHU4RDcwXHU1MjMwXHU2ODY1XHU0RTBCXHU1RTAyXHU5NkM2XHVGRjBDXHU1NzI4XHU2NUU1XHU4NDNEXHU1MjREXHU2MkI1XHU4RkJFXHU2Q0IzXHU2RTdFXHU1RTczXHU1M0YwXHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNhcmQtbWV0YSBkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YVwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+OC42IGttPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+XHU3RUE2IDYgXHU1QzBGXHU2NUY2PC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fZmVhdHVyZWQtbWV0YS1pdGVtXCI+XHU4RjdCXHU2NzdFPC9UZXh0PlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPEhlYWRpbmcgaWQ9XCJkaXNjb3Zlci1yb3V0ZXMtdGl0bGVcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLXNlY3Rpb24taGVhZGluZyBkaXNjb3Zlcl9fcm91dGVzLXRpdGxlXCIgbGV2ZWw9ezJ9Plx1NjZGNFx1NTkxQVx1OERFRlx1N0VCRjwvSGVhZGluZz5cbiAgICAgICAgPEdyaWQgaWQ9XCJkaXNjb3Zlci1yb3V0ZXNcIiBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGVzXCIgY29sdW1ucz17MX0gZ2FwPXsxNH0+XG4gICAgICAgICAge1JPVVRFUy5tYXAoKHJvdXRlLCBpbmRleCkgPT4gKFxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwid2Vla2VuZC1yb3V0ZS1jYXJkIGRpc2NvdmVyX19yb3V0ZS1jYXJkXCIgZGF0YS13Zi1rZXk9e3JvdXRlLmlkfSBrZXk9e3JvdXRlLmlkfSB0bz1cInJvdXRlLWRldGFpbFwiPlxuICAgICAgICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBjbGFzc05hbWU9XCJkaXNjb3Zlcl9fcm91dGUtaW1hZ2VcIiBoZWlnaHQ9e2luZGV4ICUgMiA9PT0gMCA/IDExNiA6IDEzNn0gYm9yZGVyUmFkaXVzPXswfSAvPlxuICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIndlZWtlbmQtcm91dGUtY2FyZF9fYm9keSBkaXNjb3Zlcl9fcm91dGUtYm9keVwiIGdhcD17N30+XG4gICAgICAgICAgICAgICAgPEhlYWRpbmcgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLXRpdGxlXCIgbGV2ZWw9ezN9Pntyb3V0ZS50aXRsZX08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLW1ldGFcIj57cm91dGUubWV0YX08L1RleHQ+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZGlzY292ZXJfX3JvdXRlLW5vdGVcIj57cm91dGUubm90ZX08L1RleHQ+XG4gICAgICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICAgICAgPC9DYXJkPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIENhcmQsXG4gIENvbHVtbixcbiAgTWFwTWFya2VyLFxuICBNYXBPdmVybGF5LFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFRleHQsXG4gIFdpcmVNYXAsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIEV4cGxvcmVNYXBTY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJleHBsb3JlLW1hcC1wYWdlXCIgZ2FwPXsxNn0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGV4cGxvcmUtbWFwX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyXG4gICAgICAgICAgaWQ9XCJleHBsb3JlLW1hcC1oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlSWQ9XCJleHBsb3JlLW1hcC10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2hlYWRlclwiXG4gICAgICAgICAgdGl0bGU9XCJcdTc2RUVcdTc2ODRcdTU3MzBcdTU3MzBcdTU2RkVcIlxuICAgICAgICAgIHN1YnRpdGxlPVwiXHU4RjdCXHU4OUU2XHU2ODA3XHU4QkIwXHU2N0U1XHU3NzBCXHU2M0E4XHU4MzUwXHU4REVGXHU3RUJGXCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19iYWNrXCIgdG89XCJkaXNjb3ZlclwiPlx1NTIxN1x1ODg2ODwvQnV0dG9uPn1cbiAgICAgICAgLz5cbiAgICAgICAgPFJvdyBpZD1cImV4cGxvcmUtbWFwLWZpbHRlcnNcIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IGV4cGxvcmUtbWFwX19maWx0ZXJzXCIgZ2FwPXs4fT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1NTE2OFx1OTBFODwvQmFkZ2U+XG4gICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19maWx0ZXJcIj5cdTZCNjVcdTg4NEM8L0JhZGdlPlxuICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fZmlsdGVyXCI+XHU5QTkxXHU4ODRDPC9CYWRnZT5cbiAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX2ZpbHRlclwiPlx1NUJBNFx1NTE4NTwvQmFkZ2U+XG4gICAgICAgIDwvUm93PlxuICAgICAgICA8V2lyZU1hcCBpZD1cImV4cGxvcmUtbWFwLWNhbnZhc1wiIGNsYXNzTmFtZT1cIndlZWtlbmQtbWFwIGV4cGxvcmUtbWFwX19jYW52YXNcIj5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci1jYW5hbFwiIHg9ezI3fSB5PXszNn0gbGFiZWw9XCJcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjlcIiB0bz1cInJvdXRlLWRldGFpbFwiIC8+XG4gICAgICAgICAgPE1hcE1hcmtlciBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fbWFya2VyXCIgZGF0YS13Zi1rZXk9XCJtYXJrZXItaGlsbHNcIiB4PXs2OH0geT17MjB9IGxhYmVsPVwiXHU1N0NFXHU1MzE3XHU4RjdCXHU1RjkyXHU2QjY1XCIgdG89XCJyb3V0ZS1kZXRhaWxcIiAvPlxuICAgICAgICAgIDxNYXBNYXJrZXIgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX21hcmtlclwiIGRhdGEtd2Yta2V5PVwibWFya2VyLWxhbmVzXCIgeD17NTh9IHk9ezU4fSBsYWJlbD1cIlx1ODAwMVx1ODg1N1x1NjE2Mlx1NkUzOFwiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwTWFya2VyIGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19tYXJrZXJcIiBkYXRhLXdmLWtleT1cIm1hcmtlci1sYWtlXCIgeD17MjJ9IHk9ezcyfSBsYWJlbD1cIlx1NzNBRlx1NkU1Nlx1OUE5MVx1ODg0Q1x1NTM0QVx1NjVFNVwiIHRvPVwicm91dGUtZGV0YWlsXCIgLz5cbiAgICAgICAgICA8TWFwT3ZlcmxheSBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fb3ZlcmxheVwiIHBvc2l0aW9uPVwiYm90dG9tXCI+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcm91dGUtcHJldmlld1wiIHRvPVwicm91dGUtZGV0YWlsXCI+XG4gICAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctYm9keVwiIGdhcD17Nn0+XG4gICAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiZXhwbG9yZS1tYXBfX3ByZXZpZXctZXllYnJvd1wiPlx1OERERFx1NzlCQlx1NEY2MCAyLjQga208L1RleHQ+XG4gICAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJleHBsb3JlLW1hcF9fcHJldmlldy10aXRsZVwiPlx1OEZEMFx1NkNCM1x1OEZCOVx1NzY4NFx1NEUwMFx1NTkyOTwvc3Ryb25nPlxuICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cImV4cGxvcmUtbWFwX19wcmV2aWV3LW1ldGFcIj44LjYga20gXHUwMEI3IFx1N0VBNiA2IFx1NUMwRlx1NjVGNiBcdTAwQjcgXHU4RjdCXHU2NzdFPC9UZXh0PlxuICAgICAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICA8L01hcE92ZXJsYXk+XG4gICAgICAgIDwvV2lyZU1hcD5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ29sdW1uLFxuICBIZWFkaW5nLFxuICBQYWdlSGVhZGVyLFxuICBSb3csXG4gIFN0ZXBzLFxuICBUZXh0LFxufSBmcm9tICcuLi8uLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvdWkvaW5kZXguanMnXG5pbXBvcnQgeyBNb2JpbGVMYXlvdXQgfSBmcm9tICcuLi9sYXlvdXRzL01vYmlsZUxheW91dC5qc3gnXG5cbmNvbnN0IEVWRU5UUyA9IFtcbiAgeyBpZDogJ2V2ZW50LW1lZXQnLCB0aW1lOiAnMDk6MTAnLCB0aXRsZTogJ1x1NTczMFx1OTRDMVx1NTNFM1x1OTZDNlx1NTQwOCcsIG5vdGU6ICdcdTRFQ0UgMyBcdTUzRjdcdTUzRTNcdTZCNjVcdTg4NENcdTdFQTYgOCBcdTUyMDZcdTk0OUZcdTUyMzBcdThERUZcdTdFQkZcdThENzdcdTcwQjlcdTMwMDInLCB0YWc6ICdcdTk2QzZcdTU0MDgnIH0sXG4gIHsgaWQ6ICdldmVudC13YXJlaG91c2UnLCB0aW1lOiAnMDk6MzAnLCB0aXRsZTogJ1x1NjVFN1x1NEVEM1x1NUU5M1x1NUM1NVx1NTM4NScsIG5vdGU6ICdcdTc3MEJcdTVFMzhcdThCQkVcdTVDNTVcdTRFMEVcdTVDNEJcdTk4NzZcdTdFRDNcdTY3ODRcdUZGMENcdTUxNjVcdTUzRTNcdTU5MDRcdTUzRUZcdTVCQzRcdTVCNThcdTgwQ0NcdTUzMDVcdTMwMDInLCB0YWc6ICdcdTUzQzJcdTg5QzInIH0sXG4gIHsgaWQ6ICdldmVudC1tYXJrZXQnLCB0aW1lOiAnMTE6MDAnLCB0aXRsZTogJ1x1Njg2NVx1NEUwQlx1NTQ2OFx1NjcyQlx1NUUwMlx1OTZDNicsIG5vdGU6ICdcdTUxNDhcdTkwMUJcdTYyNEJcdTRGNUNcdTY0NEFcdTRGNERcdUZGMENcdTUxOERcdTU3MjhcdTRFMUNcdTRGQTdcdTk5MTBcdThGNjZcdTUzM0FcdTdCODBcdTUzNTVcdTUzNDhcdTk5MTBcdTMwMDInLCB0YWc6ICdcdTVFMDJcdTk2QzYnIH0sXG4gIHsgaWQ6ICdldmVudC1sdW5jaCcsIHRpbWU6ICcxMzowMCcsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU5OTg2XHU1MzQ4XHU5OTEwJywgbm90ZTogJ1x1OTg4NFx1OEJBMVx1NzUyOFx1OTkxMCA3MCBcdTUyMDZcdTk0OUZcdUZGMENcdTk3NjBcdTdBOTdcdTUzM0FcdTU3REZcdTY1RTBcdTk3MDBcdTk4ODRcdTdFQTZcdTMwMDInLCB0YWc6ICdcdTc1MjhcdTk5MTAnIH0sXG4gIHsgaWQ6ICdldmVudC1sYW5lcycsIHRpbWU6ICcxNDoyMCcsIHRpdGxlOiAnXHU2QzM0XHU1Q0I4XHU1QzBGXHU1REY3XHU2NTYzXHU2QjY1Jywgbm90ZTogJ1x1NkNCRlx1NzdGM1x1OTYzNlx1OEZEQlx1NTE2NVx1NjVFN1x1ODg1N1x1NTMzQVx1RkYwQ1x1N0VDRlx1OEZDN1x1NEU2Nlx1NUU5N1x1NTQ4Q1x1NTE2Q1x1NTE3MVx1NkQxN1x1ODg2M1x1NjIzRlx1MzAwMicsIHRhZzogJ1x1NkI2NVx1ODg0QycgfSxcbiAgeyBpZDogJ2V2ZW50LWdhcmRlbicsIHRpbWU6ICcxNToyMCcsIHRpdGxlOiAnXHU3OTNFXHU1MzNBXHU4MkIxXHU1NkVEXHU0RjExXHU2MDZGJywgbm90ZTogJ1x1ODg2NVx1NkMzNFx1NUU3Nlx1NjU3NFx1NzQwNlx1OTY4Rlx1OEVBQlx1NzI2OVx1NTRDMVx1RkYwQ1x1ODJCMVx1NTZFRFx1NTMxN1x1OTVFOFx1NjcwOVx1NTE2Q1x1NTE3MVx1OEJCRVx1NjVCRFx1MzAwMicsIHRhZzogJ1x1NEYxMVx1NjA2RicgfSxcbiAgeyBpZDogJ2V2ZW50LXN1bnNldCcsIHRpbWU6ICcxNzoxMCcsIHRpdGxlOiAnXHU2Q0IzXHU2RTdFXHU2NUU1XHU4NDNEXHU1RTczXHU1M0YwJywgbm90ZTogJ1x1OERFRlx1N0VCRlx1N0VDOFx1NzBCOVx1RkYwQ1x1NTNFRlx1N0VFN1x1N0VFRFx1NkNCRlx1NTgyNFx1NUNCOFx1NkI2NVx1ODg0Q1x1ODFGM1x1NjY1QVx1OTkxMFx1NTMzQVx1NTdERlx1MzAwMicsIHRhZzogJ1x1ODlDMlx1NjY2RicgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIEl0aW5lcmFyeVNjcmVlbigpIHtcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cIml0aW5lcmFyeS1wYWdlXCIgZ2FwPXsxOH0gY2xhc3NOYW1lPVwid2Vla2VuZC1wYWdlIGl0aW5lcmFyeV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlclxuICAgICAgICAgIGlkPVwiaXRpbmVyYXJ5LWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cIml0aW5lcmFyeS10aXRsZVwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19oZWFkZXJcIlxuICAgICAgICAgIHRpdGxlPVwiXHU2QkNGXHU2NUU1XHU4ODRDXHU3QTBCXCJcbiAgICAgICAgICBzdWJ0aXRsZT1cIlx1NTQ2OFx1NTE2RCBcdTAwQjcgXHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5XCJcbiAgICAgICAgICBhY3Rpb25zPXs8QnV0dG9uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fYmFja1wiIHRvPVwicm91dGUtZGV0YWlsXCI+XHU4REVGXHU3RUJGPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8U3RlcHNcbiAgICAgICAgICBpZD1cIml0aW5lcmFyeS1wcm9ncmVzc1wiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19wcm9ncmVzc1wiXG4gICAgICAgICAgY3VycmVudD17MX1cbiAgICAgICAgICBpdGVtcz17W3sgaWQ6ICdtb3JuaW5nJywgbGFiZWw6ICdcdTRFMEFcdTUzNDgnIH0sIHsgaWQ6ICdhZnRlcm5vb24nLCBsYWJlbDogJ1x1NEUwQlx1NTM0OCcgfSwgeyBpZDogJ2V2ZW5pbmcnLCBsYWJlbDogJ1x1NTA4RFx1NjY1QScgfV19XG4gICAgICAgIC8+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJpdGluZXJhcnktZXZlbnRzXCIgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudHNcIiBnYXA9ezE0fT5cbiAgICAgICAgICB7RVZFTlRTLm1hcCgoZXZlbnQpID0+IChcbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19ldmVudFwiIGRhdGEtd2Yta2V5PXtldmVudC5pZH0ga2V5PXtldmVudC5pZH0gZ2FwPXsxMH0gYWxpZ25JdGVtcz1cImZsZXgtc3RhcnRcIj5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X190aW1lXCI+e2V2ZW50LnRpbWV9PC9UZXh0PlxuICAgICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWNhcmRcIj5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtYm9keVwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cIml0aW5lcmFyeV9fZXZlbnQtaGVhZGluZ1wiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIiBnYXA9ezh9PlxuICAgICAgICAgICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LXRpdGxlXCIgbGV2ZWw9ezN9PntldmVudC50aXRsZX08L0hlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LWJhZGdlXCI+e2V2ZW50LnRhZ308L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX2V2ZW50LW5vdGVcIj57ZXZlbnQubm90ZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgIDwvUm93PlxuICAgICAgICAgICkpfVxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENhcmQgaWQ9XCJpdGluZXJhcnktcmVtaW5kZXJcIiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyXCI+XG4gICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLWJvZHlcIiBnYXA9ezZ9PlxuICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLXRpdGxlXCI+XHU1MUZBXHU1M0QxXHU2M0QwXHU5MTkyPC9zdHJvbmc+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJpdGluZXJhcnlfX3JlbWluZGVyLWNvcHlcIj5cdTVFRkFcdThCQUVcdTY0M0FcdTVFMjZcdTk5NkVcdTc1MjhcdTZDMzRcdTMwMDFcdThGN0JcdTRGQkZcdTk2RThcdTUxNzdcdTU0OENcdTUzRUZcdTkxQ0RcdTU5MERcdTRGN0ZcdTc1MjhcdTc2ODRcdThEMkRcdTcyNjlcdTg4OEJcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDwvQ2FyZD5cbiAgICAgICAgPEJ1dHRvbiBpZD1cIml0aW5lcmFyeS1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwiaXRpbmVyYXJ5X19jcmVhdGUtYWN0aW9uXCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU1MjFCXHU1RUZBXHU2MjExXHU3Njg0XHU3MjQ4XHU2NzJDPC9CdXR0b24+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ29sdW1uLFxuICBGb3JtRmllbGQsXG4gIEhlYWRpbmcsXG4gIFRleHQsXG4gIFRleHRJbnB1dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gTG9naW5TY3JlZW4oKSB7XG4gIHJldHVybiAoXG4gICAgPENvbHVtbiBpZD1cImxvZ2luLXBhZ2VcIiBnYXA9ezIwfSBjbGFzc05hbWU9XCJ3ZWVrZW5kLWxvZ2luIGxvZ2luX19wYWdlXCI+XG4gICAgICA8c3BhbiBpZD1cImxvZ2luLWxvZ29cIiBjbGFzc05hbWU9XCJ3ZWVrZW5kLWxvZ28tcGxhY2Vob2xkZXIgbG9naW5fX2xvZ29cIiBhcmlhLWhpZGRlbj1cInRydWVcIiAvPlxuICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJsb2dpbl9faW50cm9cIiBnYXA9ezh9PlxuICAgICAgICA8SGVhZGluZyBpZD1cImxvZ2luLXRpdGxlXCIgY2xhc3NOYW1lPVwibG9naW5fX3RpdGxlXCIgbGV2ZWw9ezF9Plx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMTwvSGVhZGluZz5cbiAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwibG9naW5fX2Rlc2NyaXB0aW9uXCI+XHU2MjhBXHU2MEYzXHU1M0JCXHU3Njg0XHU1NzMwXHU2NUI5XHVGRjBDXHU1M0Q4XHU2MjEwXHU0RTAwXHU0RUZEXHU5NjhGXHU2NUY2XHU4MEZEXHU4RDcwXHU3Njg0XHU4ODRDXHU3QTBCXHUzMDAyPC9UZXh0PlxuICAgICAgPC9Db2x1bW4+XG4gICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cImxvZ2luX19waG9uZS1maWVsZFwiIGxhYmVsPVwiXHU2MjRCXHU2NzNBXHU1M0Y3XCIgaHRtbEZvcj1cImxvZ2luLXBob25lXCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJsb2dpbi1waG9uZVwiIGNsYXNzTmFtZT1cImxvZ2luX19waG9uZS1pbnB1dFwiIGlucHV0TW9kZT1cInRlbFwiIHBsYWNlaG9sZGVyPVwiXHU4QkY3XHU4RjkzXHU1MTY1XHU2MjRCXHU2NzNBXHU1M0Y3XCIgLz5cbiAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgPEZvcm1GaWVsZCBjbGFzc05hbWU9XCJsb2dpbl9fY29kZS1maWVsZFwiIGxhYmVsPVwiXHU5QThDXHU4QkMxXHU3ODAxXCIgaHRtbEZvcj1cImxvZ2luLWNvZGVcIiBoaW50PVwiXHU2RjE0XHU3OTNBXHU3M0FGXHU1ODgzXHU1M0VGXHU4RjkzXHU1MTY1XHU0RUZCXHU2MTBGIDYgXHU0RjREXHU2NTcwXHU1QjU3XCI+XG4gICAgICAgIDxUZXh0SW5wdXQgaWQ9XCJsb2dpbi1jb2RlXCIgY2xhc3NOYW1lPVwibG9naW5fX2NvZGUtaW5wdXRcIiBpbnB1dE1vZGU9XCJudW1lcmljXCIgcGxhY2Vob2xkZXI9XCJcdThCRjdcdThGOTNcdTUxNjVcdTlBOENcdThCQzFcdTc4MDFcIiAvPlxuICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICA8QnV0dG9uIGlkPVwibG9naW4tc3VibWl0XCIgY2xhc3NOYW1lPVwibG9naW5fX3N1Ym1pdFwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJkaXNjb3ZlclwiPlx1NUYwMFx1NTlDQlx1NjNBMlx1N0QyMjwvQnV0dG9uPlxuICAgICAgPFRleHQgY2xhc3NOYW1lPVwibG9naW5fX2FncmVlbWVudFwiIGFzPVwic21hbGxcIj5cdTdFRTdcdTdFRURcdTUzNzNcdTg4NjhcdTc5M0FcdTU0MENcdTYxMEZcdTY3MERcdTUyQTFcdTY3NjFcdTZCM0VcdTRFMEVcdTk2OTBcdTc5QzFcdThCRjRcdTY2MEVcdTMwMDI8L1RleHQ+XG4gICAgPC9Db2x1bW4+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBBdmF0YXIsXG4gIENlbGwsXG4gIENvbHVtbixcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBUZXh0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFByb2ZpbGVTY3JlZW4oKSB7XG4gIGNvbnN0IFtub3RpZmljYXRpb25zLCBzZXROb3RpZmljYXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IFtvZmZsaW5lTWFwcywgc2V0T2ZmbGluZU1hcHNdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLXBhZ2VcIiBnYXA9ezIwfSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgcHJvZmlsZV9fcGFnZVwiPlxuICAgICAgICA8UGFnZUhlYWRlciBpZD1cInByb2ZpbGUtaGVhZGVyXCIgdGl0bGVJZD1cInByb2ZpbGUtdGl0bGVcIiBjbGFzc05hbWU9XCJwcm9maWxlX19oZWFkZXJcIiB0aXRsZT1cIlx1NjIxMVx1NzY4NFwiIHN1YnRpdGxlPVwiXHU0RTJBXHU0RUJBXHU1MDRGXHU1OTdEXHU0RTBFXHU2NUM1XHU4ODRDXHU4QkJFXHU3RjZFXCIgLz5cbiAgICAgICAgPFJvdyBpZD1cInByb2ZpbGUtc3VtbWFyeVwiIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1bW1hcnlcIiBnYXA9ezEyfSBhbGlnbkl0ZW1zPVwiY2VudGVyXCI+XG4gICAgICAgICAgPEF2YXRhciBjbGFzc05hbWU9XCJwcm9maWxlX19hdmF0YXJcIiBzaXplPXs1OH0gbGFiZWw9XCJcdTc1MjhcdTYyMzdcdTU5MzRcdTUwQ0ZcdTUzNjBcdTRGNERcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvZmlsZV9faWRlbnRpdHlcIj5cbiAgICAgICAgICAgIDxzdHJvbmcgY2xhc3NOYW1lPVwicHJvZmlsZV9fbmFtZVwiPlx1Njc5N1x1NjY1M1x1OTFDRTwvc3Ryb25nPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicHJvZmlsZV9fYmlvXCI+XHU1REYyXHU4RDcwXHU4RkM3IDEyIFx1NUVBN1x1NTdDRVx1NUUwMjwvVGV4dD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9Sb3c+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJwcm9maWxlLWFjY291bnRcIiBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50XCIgZ2FwPXswfT5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50LWNlbGxcIiB0aXRsZT1cIlx1NjVDNVx1ODg0Q1x1Njg2M1x1Njg0OFwiIHN1YnRpdGxlPVwiXHU1MDRGXHU1OTdEXHUzMDAxXHU4REIzXHU4RkY5XHU0RTBFXHU2NTM2XHU4NUNGXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19hY2NvdW50LWNlbGxcIiB0aXRsZT1cIlx1NTQwQ1x1ODg0Q1x1NEVCQVwiIHN1YnRpdGxlPVwiMyBcdTRGNERcdTVFMzhcdTc1MjhcdTU0MENcdTg4NENcdTRFQkFcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX2FjY291bnQtY2VsbFwiIHRpdGxlPVwiXHU3RDI3XHU2MDI1XHU4MDU0XHU3Q0ZCXHU0RUJBXCIgc3VidGl0bGU9XCJcdTVERjJcdThCQkVcdTdGNkVcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENvbHVtbiBpZD1cInByb2ZpbGUtc2V0dGluZ3NcIiBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nc1wiIGdhcD17MTJ9PlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1yb3dcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJwcm9maWxlX19zZXR0aW5nLWxhYmVsXCI+XHU4ODRDXHU3QTBCXHU2M0QwXHU5MTkyPC9UZXh0PlxuICAgICAgICAgICAgPFRvZ2dsZSBpZD1cInByb2ZpbGUtbm90aWZpY2F0aW9uc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX25vdGlmaWNhdGlvbnNcIiBjaGVja2VkPXtub3RpZmljYXRpb25zfSBvbkNoYW5nZT17c2V0Tm90aWZpY2F0aW9uc30gLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInByb2ZpbGVfX3NldHRpbmctcm93XCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiPlxuICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicHJvZmlsZV9fc2V0dGluZy1sYWJlbFwiPlx1ODFFQVx1NTJBOFx1NEUwQlx1OEY3RFx1NzlCQlx1N0VCRlx1NTczMFx1NTZGRTwvVGV4dD5cbiAgICAgICAgICAgIDxUb2dnbGUgaWQ9XCJwcm9maWxlLW9mZmxpbmUtbWFwc1wiIGNsYXNzTmFtZT1cInByb2ZpbGVfX29mZmxpbmUtbWFwc1wiIGNoZWNrZWQ9e29mZmxpbmVNYXBzfSBvbkNoYW5nZT17c2V0T2ZmbGluZU1hcHN9IC8+XG4gICAgICAgICAgPC9Sb3c+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8Q29sdW1uIGlkPVwicHJvZmlsZS1zdXBwb3J0XCIgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydFwiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwicHJvZmlsZV9fc3VwcG9ydC1jZWxsXCIgdGl0bGU9XCJcdTVFMkVcdTUyQTlcdTRFMEVcdTUzQ0RcdTk5ODhcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInByb2ZpbGVfX3N1cHBvcnQtY2VsbFwiIHRpdGxlPVwiXHU5NjkwXHU3OUMxXHU4QkJFXHU3RjZFXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJwcm9maWxlX19zdXBwb3J0LWNlbGxcIiB0aXRsZT1cIlx1NTE3M1x1NEU4RVx1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVwiIHZhbHVlPVwiMS4wXCIgLz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJhZGdlLFxuICBCcmVhZGNydW1icyxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDZWxsLFxuICBDb2x1bW4sXG4gIEdyaWQsXG4gIEhlYWRpbmcsXG4gIEltYWdlUGxhY2Vob2xkZXIsXG4gIFJvdyxcbiAgVGFicyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBTVE9QUyA9IFtcbiAgeyBpZDogJ3N0b3Atd2FyZWhvdXNlJywgdGl0bGU6ICdcdTY1RTdcdTRFRDNcdTVFOTNcdTVDNTVcdTUzODUnLCBzdWJ0aXRsZTogJzA5OjMwIFx1MDBCNyBcdTVFRkFcdThCQUVcdTUwNUNcdTc1NTkgNjAgXHU1MjA2XHU5NDlGJyB9LFxuICB7IGlkOiAnc3RvcC1icmlkZ2UnLCB0aXRsZTogJ1x1Njg2NVx1NEUwQlx1NTQ2OFx1NjcyQlx1NUUwMlx1OTZDNicsIHN1YnRpdGxlOiAnMTE6MDAgXHUwMEI3IFx1NUVGQVx1OEJBRVx1NTA1Q1x1NzU1OSA5MCBcdTUyMDZcdTk0OUYnIH0sXG4gIHsgaWQ6ICdzdG9wLWxhbmUnLCB0aXRsZTogJ1x1NkMzNFx1NUNCOFx1NUMwRlx1NURGNycsIHN1YnRpdGxlOiAnMTM6MzAgXHUwMEI3IFx1NTM0OFx1OTkxMFx1NEUwRVx1ODg1N1x1NTMzQVx1NjU2M1x1NkI2NScgfSxcbiAgeyBpZDogJ3N0b3AtZ2FyZGVuJywgdGl0bGU6ICdcdTc5M0VcdTUzM0FcdTgyQjFcdTU2RUQnLCBzdWJ0aXRsZTogJzE1OjIwIFx1MDBCNyBcdTVFRkFcdThCQUVcdTUwNUNcdTc1NTkgNDUgXHU1MjA2XHU5NDlGJyB9LFxuICB7IGlkOiAnc3RvcC1iZW5kJywgdGl0bGU6ICdcdTZDQjNcdTZFN0VcdTY1RTVcdTg0M0RcdTVFNzNcdTUzRjAnLCBzdWJ0aXRsZTogJzE3OjEwIFx1MDBCNyBcdThERUZcdTdFQkZcdTdFQzhcdTcwQjknIH0sXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBSb3V0ZURldGFpbFNjcmVlbigpIHtcbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IFJlYWN0LnVzZVN0YXRlKCdvdmVydmlldycpXG4gIHJldHVybiAoXG4gICAgPE1vYmlsZUxheW91dD5cbiAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtcGFnZVwiIGdhcD17MTh9IGNsYXNzTmFtZT1cIndlZWtlbmQtcGFnZSByb3V0ZS1kZXRhaWxfX3BhZ2VcIj5cbiAgICAgICAgPEJyZWFkY3J1bWJzIGlkPVwicm91dGUtZGV0YWlsLWJyZWFkY3J1bWJzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19icmVhZGNydW1ic1wiIGl0ZW1zPXtbeyBsYWJlbDogJ1x1NTNEMVx1NzNCMCcsIHRvOiAnZGlzY292ZXInIH0sIHsgbGFiZWw6ICdcdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjknIH1dfSAvPlxuICAgICAgICA8SW1hZ2VQbGFjZWhvbGRlciBpZD1cInJvdXRlLWRldGFpbC1oZXJvXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19oZXJvXCIgaGVpZ2h0PXsyMjR9IGJvcmRlclJhZGl1cz17MH0gLz5cbiAgICAgICAgPENvbHVtbiBpZD1cInJvdXRlLWRldGFpbC1zdW1tYXJ5XCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19zdW1tYXJ5XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ3ZWVrZW5kLWNoaXAtcm93IHJvdXRlLWRldGFpbF9fYmFkZ2VzXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU1N0NFXHU1RTAyXHU2RjJCXHU2QjY1PC9CYWRnZT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU4RjdCXHU2NzdFPC9CYWRnZT5cbiAgICAgICAgICAgIDxCYWRnZSBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2JhZGdlXCI+XHU1M0VGXHU1RTI2XHU1QkEwXHU3MjY5PC9CYWRnZT5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICA8SGVhZGluZyBpZD1cInJvdXRlLWRldGFpbC10aXRsZVwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fdGl0bGVcIiBsZXZlbD17MX0+XHU4RkQwXHU2Q0IzXHU4RkI5XHU3Njg0XHU0RTAwXHU1OTI5PC9IZWFkaW5nPlxuICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9faW50cm9cIj5cdTRFMDBcdTY3NjFcdTRFQ0VcdTVERTVcdTRFMUFcdTkwNTdcdTVCNThcdThENzBcdTU0MTFcdTc1MUZcdTZEM0JcdTg4NTdcdTUzM0FcdTc2ODRcdTZDMzRcdTVDQjhcdThERUZcdTdFQkZcdTMwMDJcdTRFMEFcdTUzNDhcdTc3MEJcdTVDNTVcdUZGMENcdTRFMkRcdTUzNDhcdTkwMUJcdTVFMDJcdTk2QzZcdUZGMENcdTUwOERcdTY2NUFcdTU3MjhcdTZDQjNcdTZFN0VcdTdCNDlcdTY1RTVcdTg0M0RcdTMwMDI8L1RleHQ+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8R3JpZCBpZD1cInJvdXRlLWRldGFpbC1mYWN0c1wiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdHNcIiBjb2x1bW5zPXszfSBnYXA9ezh9PlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdFwiPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC12YWx1ZVwiPjguNiBrbTwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2ZhY3QtbGFiZWxcIj5cdTYwM0JcdThERUZcdTdBMEI8L3NwYW4+PC9DYXJkPlxuICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdFwiPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC12YWx1ZVwiPjYgXHU1QzBGXHU2NUY2PC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZmFjdC1sYWJlbFwiPlx1NUVGQVx1OEJBRVx1NjVGNlx1OTU3Rjwvc3Bhbj48L0NhcmQ+XG4gICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0XCI+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LXZhbHVlXCI+NSBcdTdBRDk8L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19mYWN0LWxhYmVsXCI+XHU4REVGXHU3RUJGXHU4MjgyXHU3MEI5PC9zcGFuPjwvQ2FyZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgICA8VGFicyBpZD1cInJvdXRlLWRldGFpbC10YWJzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX190YWJzXCIgYWN0aXZlSWQ9e3RhYn0gb25DaGFuZ2U9e3NldFRhYn0gaXRlbXM9e1t7IGlkOiAnb3ZlcnZpZXcnLCBsYWJlbDogJ1x1OERFRlx1N0VCRlx1Njk4Mlx1ODlDOCcgfSwgeyBpZDogJ25vdGVzJywgbGFiZWw6ICdcdTUxRkFcdTUzRDFcdTk4N0JcdTc3RTUnIH1dfSAvPlxuICAgICAgICB7dGFiID09PSAnb3ZlcnZpZXcnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJyb3V0ZS1kZXRhaWwtc3RvcHNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX3N0b3BzXCIgZ2FwPXswfT5cbiAgICAgICAgICAgIHtTVE9QUy5tYXAoKHN0b3AsIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fc3RvcFwiIGRhdGEtd2Yta2V5PXtzdG9wLmlkfSBrZXk9e3N0b3AuaWR9IHRpdGxlPXtgJHtpbmRleCArIDF9LiAke3N0b3AudGl0bGV9YH0gc3VidGl0bGU9e3N0b3Auc3VidGl0bGV9IHZhbHVlPXtgJHtpbmRleCArIDF9YH0gLz5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxDYXJkIGlkPVwicm91dGUtZGV0YWlsLW5vdGVzXCIgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3Rlc1wiPlxuICAgICAgICAgICAgPENvbHVtbiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVzLWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgICAgPFRleHQgY2xhc3NOYW1lPVwicm91dGUtZGV0YWlsX19ub3RlXCI+XHU2Q0JGXHU5MDE0XHU1OTI3XHU5MEU4XHU1MjA2XHU4REVGXHU2QkI1XHU2NzA5XHU2ODExXHU4MzZCXHVGRjBDXHU2Q0IzXHU2RTdFXHU1MzNBXHU1N0RGXHU0RTBCXHU1MzQ4XHU2NUU1XHU3MTY3XHU4RjgzXHU1RjNBXHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX25vdGVcIj5cdTY1RTdcdTRFRDNcdTVFOTNcdTU0NjhcdTRFMDBcdTk1RURcdTk5ODZcdUZGMENcdTU0NjhcdTY3MkJcdTVFRkFcdThCQUVcdTYzRDBcdTUyNERcdTk4ODRcdTdFQTZcdTUxNjVcdTU3M0FcdTY1RjZcdTZCQjVcdTMwMDI8L1RleHQ+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fbm90ZVwiPlx1OERFRlx1N0VCRlx1N0VDOFx1NzBCOVx1OERERFx1NzlCQlx1NTczMFx1OTRDMVx1N0FEOVx1N0VBNiA5MDAgXHU3QzczXHVGRjBDXHU0RTVGXHU1M0VGXHU0RTU4XHU1NzUwXHU3OTNFXHU1MzNBXHU2M0E1XHU5QTczXHU4RjY2XHUzMDAyPC9UZXh0PlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgPC9DYXJkPlxuICAgICAgICApfVxuICAgICAgICA8Q2FyZCBpZD1cInJvdXRlLWRldGFpbC1ndWlkZVwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGVcIj5cbiAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtYm9keVwiIGdhcD17OH0+XG4gICAgICAgICAgICA8SGVhZGluZyBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2d1aWRlLXRpdGxlXCIgbGV2ZWw9ezN9Plx1OERFRlx1N0VCRlx1N0I1Nlx1NTIxMlx1NEVCQTwvSGVhZGluZz5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fZ3VpZGUtY29weVwiPlx1Njc5N1x1NUM3RiBcdTAwQjcgXHU1N0NFXHU1RTAyXHU2QjY1XHU4ODRDXHU4QkIwXHU1RjU1XHU4MDA1XHVGRjBDXHU1REYyXHU1M0QxXHU1RTAzIDE4IFx1Njc2MVx1NkMzNFx1NUNCOFx1OERFRlx1N0VCRlx1MzAwMjwvVGV4dD5cbiAgICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwicm91dGUtZGV0YWlsLWFjdGlvbnNcIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2FjdGlvbnNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8QnV0dG9uIGlkPVwicm91dGUtZGV0YWlsLWl0aW5lcmFyeS1hY3Rpb25cIiBjbGFzc05hbWU9XCJyb3V0ZS1kZXRhaWxfX2l0aW5lcmFyeS1hY3Rpb25cIiB0bz1cIml0aW5lcmFyeVwiPlx1NjdFNVx1NzcwQlx1NUI4Q1x1NjU3NFx1NjVFNVx1N0EwQjwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b24gaWQ9XCJyb3V0ZS1kZXRhaWwtY3JlYXRlLWFjdGlvblwiIGNsYXNzTmFtZT1cInJvdXRlLWRldGFpbF9fY3JlYXRlLWFjdGlvblwiIHZhcmlhbnQ9XCJwcmltYXJ5XCIgdG89XCJ0cmlwLWNyZWF0ZVwiPlx1NzUyOFx1OEZEOVx1Njc2MVx1OERFRlx1N0VCRlx1NTIxQlx1NUVGQVx1ODg0Q1x1N0EwQjwvQnV0dG9uPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgIDwvQ29sdW1uPlxuICAgIDwvTW9iaWxlTGF5b3V0PlxuICApXG59XG4iLCAiLyoqXG4gKiBAd2lyZWZyYW1lLXNraWxsIG11bHRpLXNjcmVlbi13aXJlZnJhbWVAMS41LjFcbiAqIFx1NTIxQlx1NUVGQVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqIFx1NEZFRVx1NjUzOVx1NTdGQVx1NEU4RSB2MS41LjFcbiAqL1xuaW1wb3J0IHtcbiAgQmFkZ2UsXG4gIEJ1dHRvbixcbiAgQ2FyZCxcbiAgQ2VsbCxcbiAgQ29sdW1uLFxuICBDb25maXJtRGlhbG9nLFxuICBMb2FkaW5nT3ZlcmxheSxcbiAgUGFnZUhlYWRlcixcbiAgUm93LFxuICBTdGVwcyxcbiAgVGV4dCxcbiAgVG9hc3QsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBDb25maXJtU2NyZWVuKCkge1xuICBjb25zdCBbY29uZmlybU9wZW4sIHNldENvbmZpcm1PcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NhdmVkLCBzZXRTYXZlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBzdWJtaXRUcmlwID0gKCkgPT4ge1xuICAgIHNldENvbmZpcm1PcGVuKGZhbHNlKVxuICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgICAgc2V0U2F2ZWQodHJ1ZSlcbiAgICB9LCA3MDApXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxNb2JpbGVMYXlvdXQ+XG4gICAgICA8Q29sdW1uIGlkPVwidHJpcC1jb25maXJtLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcC1jb25maXJtX19wYWdlXCI+XG4gICAgICAgIDxQYWdlSGVhZGVyIGlkPVwidHJpcC1jb25maXJtLWhlYWRlclwiIHRpdGxlSWQ9XCJ0cmlwLWNvbmZpcm0tdGl0bGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2hlYWRlclwiIHRpdGxlPVwiXHU3ODZFXHU4QkE0XHU4ODRDXHU3QTBCXCIgc3VidGl0bGU9XCJcdTY4QzBcdTY3RTVcdTRGRTFcdTYwNkZcdTU0MEVcdTRGRERcdTVCNThcdTUyMzBcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEJcIiAvPlxuICAgICAgICA8U3RlcHMgaWQ9XCJ0cmlwLWNvbmZpcm0tc3RlcHNcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3N0ZXBzXCIgY3VycmVudD17Mn0gaXRlbXM9e1t7IGlkOiAnYmFzaWMnLCBsYWJlbDogJ1x1NTdGQVx1NjcyQ1x1NEZFMVx1NjA2RicgfSwgeyBpZDogJ2J1ZGdldCcsIGxhYmVsOiAnXHU5ODg0XHU3Qjk3JyB9LCB7IGlkOiAnY29uZmlybScsIGxhYmVsOiAnXHU3ODZFXHU4QkE0JyB9XX0gLz5cbiAgICAgICAgPENhcmQgaWQ9XCJ0cmlwLWNvbmZpcm0tc3VtbWFyeVwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VtbWFyeVwiPlxuICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5LWJvZHlcIiBnYXA9ezEwfT5cbiAgICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdW1tYXJ5LWhlYWRpbmdcIiBhbGlnbkl0ZW1zPVwiY2VudGVyXCIganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCIgZ2FwPXs4fT5cbiAgICAgICAgICAgICAgPHN0cm9uZyBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RyaXAtbmFtZVwiPlx1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NTwvc3Ryb25nPlxuICAgICAgICAgICAgICA8QmFkZ2UgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19zdGF0dXNcIj5cdTVGODVcdTRGRERcdTVCNTg8L0JhZGdlPlxuICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RhdGVcIj4yMDI2IFx1NUU3NCA4IFx1NjcwOCAxNSBcdTY1RTUgXHUwMEI3IFx1NTQ2OFx1NTE2RDwvVGV4dD5cbiAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fcm91dGVcIj5cdThGRDBcdTZDQjNcdThGQjlcdTc2ODRcdTRFMDBcdTU5MjkgXHUwMEI3IDguNiBrbSBcdTAwQjcgXHU3RUE2IDYgXHU1QzBGXHU2NUY2PC9UZXh0PlxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8L0NhcmQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNvbmZpcm0tZGV0YWlsc1wiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsc1wiIGdhcD17MH0+XG4gICAgICAgICAgPENlbGwgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19kZXRhaWxcIiB0aXRsZT1cIlx1OTZDNlx1NTQwOFx1NTczMFx1NzBCOVwiIHN1YnRpdGxlPVwiXHU4RkQwXHU2Q0IzXHU4REVGXHU1NzMwXHU5NEMxXHU3QUQ5IDMgXHU1M0Y3XHU1M0UzXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU4ODRDXHU3QTBCXHU4MjgyXHU1OTRGXCIgdmFsdWU9XCJcdThGN0JcdTY3N0VcIiAvPlxuICAgICAgICAgIDxDZWxsIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fZGV0YWlsXCIgdGl0bGU9XCJcdTU0MENcdTg4NENcdTRFQkFcdTY1NzBcIiB2YWx1ZT1cIjMgXHU0RUJBXCIgLz5cbiAgICAgICAgICA8Q2VsbCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RldGFpbFwiIHRpdGxlPVwiXHU1MUZBXHU1M0QxXHU2M0QwXHU5MTkyXCIgdmFsdWU9XCJcdTVERjJcdTVGMDBcdTU0MkZcIiAvPlxuICAgICAgICA8L0NvbHVtbj5cbiAgICAgICAgPENhcmQgaWQ9XCJ0cmlwLWNvbmZpcm0tYnVkZ2V0XCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXRcIiB0bz1cImJ1ZGdldFwiPlxuICAgICAgICAgIDxSb3cgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtYm9keVwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIiBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19idWRnZXQtY29weVwiIGdhcD17NX0+XG4gICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fYnVkZ2V0LWxhYmVsXCI+XHU5ODg0XHU4QkExXHU2MDNCXHU4RDM5XHU3NTI4PC9UZXh0PlxuICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2J1ZGdldC1ub3RlXCI+XHU2N0U1XHU3NzBCXHU2NjBFXHU3RUM2XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBPC9UZXh0PlxuICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RvdGFsXCI+NDI4IFx1NTE0Mzwvc3Bhbj5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9DYXJkPlxuICAgICAgICA8Q29sdW1uIGlkPVwidHJpcC1jb25maXJtLWFjdGlvbnNcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2FjdGlvbnNcIiBnYXA9ezEwfT5cbiAgICAgICAgICA8QnV0dG9uIGlkPVwidHJpcC1jb25maXJtLXN1Ym1pdFwiIGNsYXNzTmFtZT1cInRyaXAtY29uZmlybV9fc3VibWl0XCIgdmFyaWFudD1cInByaW1hcnlcIiBvbkNsaWNrPXsoKSA9PiBzZXRDb25maXJtT3Blbih0cnVlKX0+XHU3ODZFXHU4QkE0XHU1RTc2XHU0RkREXHU1QjU4PC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RyaXBzLWFjdGlvblwiIHRvPVwidHJpcHNcIj5cdTY3RTVcdTc3MEJcdTYyMTFcdTc2ODRcdTg4NENcdTdBMEI8L0J1dHRvbj5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxDb25maXJtRGlhbG9nXG4gICAgICAgICAgaWQ9XCJ0cmlwLWNvbmZpcm0tZGlhbG9nXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX2RpYWxvZ1wiXG4gICAgICAgICAgb3Blbj17Y29uZmlybU9wZW59XG4gICAgICAgICAgdGl0bGU9XCJcdTRGRERcdTVCNThcdThGRDlcdTRFRkRcdTg4NENcdTdBMEJcdUZGMUZcIlxuICAgICAgICAgIG1lc3NhZ2U9XCJcdTRGRERcdTVCNThcdTU0MEVcdTRGMUFcdTU0MENcdTZCNjVcdTdFRDlcdTVERjJcdTUyQTBcdTUxNjVcdTc2ODRcdTU0MENcdTg4NENcdTRFQkFcdUZGMENcdTVFNzZcdTU3MjhcdTUxRkFcdTUzRDFcdTUyNERcdTUzRDFcdTkwMDFcdTYzRDBcdTkxOTJcdTMwMDJcIlxuICAgICAgICAgIGNvbmZpcm1MYWJlbD1cIlx1Nzg2RVx1OEJBNFx1NEZERFx1NUI1OFwiXG4gICAgICAgICAgb25Db25maXJtPXtzdWJtaXRUcmlwfVxuICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBzZXRDb25maXJtT3BlbihmYWxzZSl9XG4gICAgICAgIC8+XG4gICAgICAgIDxMb2FkaW5nT3ZlcmxheSBpZD1cInRyaXAtY29uZmlybS1sb2FkaW5nXCIgY2xhc3NOYW1lPVwidHJpcC1jb25maXJtX19sb2FkaW5nXCIgb3Blbj17bG9hZGluZ30gbGFiZWw9XCJcdTZCNjNcdTU3MjhcdTc1MUZcdTYyMTBcdTg4NENcdTdBMEJcIiAvPlxuICAgICAgICA8VG9hc3QgaWQ9XCJ0cmlwLWNvbmZpcm0tdG9hc3RcIiBjbGFzc05hbWU9XCJ0cmlwLWNvbmZpcm1fX3RvYXN0XCIgb3Blbj17c2F2ZWR9Plx1ODg0Q1x1N0EwQlx1NURGMlx1NEZERFx1NUI1OFx1RkYwQ1x1NTNFRlx1NTcyOFx1MjAxQ1x1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlx1MjAxRFx1NjdFNVx1NzcwQlx1MzAwMjwvVG9hc3Q+XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgIi8qKlxuICogQHdpcmVmcmFtZS1za2lsbCBtdWx0aS1zY3JlZW4td2lyZWZyYW1lQDEuNS4xXG4gKiBcdTUyMUJcdTVFRkFcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKiBcdTRGRUVcdTY1MzlcdTU3RkFcdTRFOEUgdjEuNS4xXG4gKi9cbmltcG9ydCB7XG4gIEJ1dHRvbixcbiAgQ2hlY2tib3gsXG4gIENvbHVtbixcbiAgRm9ybUZpZWxkLFxuICBQYWdlSGVhZGVyLFxuICBSYWRpbyxcbiAgUm93LFxuICBTZWxlY3QsXG4gIFN0ZXBzLFxuICBUZXh0QXJlYSxcbiAgVGV4dElucHV0LFxuICBUb2dnbGUsXG59IGZyb20gJy4uLy4uLy4uLy4uL3N0YXJ0ZXIvZnJhbWV3b3JrL2xpYi91aS9pbmRleC5qcydcbmltcG9ydCB7IE1vYmlsZUxheW91dCB9IGZyb20gJy4uL2xheW91dHMvTW9iaWxlTGF5b3V0LmpzeCdcblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBDcmVhdGVTY3JlZW4oKSB7XG4gIGNvbnN0IFtyZW1pbmRlciwgc2V0UmVtaW5kZXJdID0gUmVhY3QudXNlU3RhdGUodHJ1ZSlcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXBhZ2VcIiBnYXA9ezE3fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcC1jcmVhdGVfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXIgaWQ9XCJ0cmlwLWNyZWF0ZS1oZWFkZXJcIiB0aXRsZUlkPVwidHJpcC1jcmVhdGUtdGl0bGVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9faGVhZGVyXCIgdGl0bGU9XCJcdTUyMUJcdTVFRkFcdTg4NENcdTdBMEJcIiBzdWJ0aXRsZT1cIlx1NTE0OFx1Nzg2RVx1NUI5QVx1NjVGNlx1OTVGNFx1NEUwRVx1NTQwQ1x1ODg0Q1x1NjVCOVx1NUYwRlwiIGFjdGlvbnM9ezxCdXR0b24gY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX2NhbmNlbFwiIHRvPVwicm91dGUtZGV0YWlsXCI+XHU1M0Q2XHU2RDg4PC9CdXR0b24+fSAvPlxuICAgICAgICA8U3RlcHMgaWQ9XCJ0cmlwLWNyZWF0ZS1zdGVwc1wiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGVwc1wiIGN1cnJlbnQ9ezB9IGl0ZW1zPXtbeyBpZDogJ2Jhc2ljJywgbGFiZWw6ICdcdTU3RkFcdTY3MkNcdTRGRTFcdTYwNkYnIH0sIHsgaWQ6ICdidWRnZXQnLCBsYWJlbDogJ1x1OTg4NFx1N0I5NycgfSwgeyBpZDogJ2NvbmZpcm0nLCBsYWJlbDogJ1x1Nzg2RVx1OEJBNCcgfV19IC8+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25hbWUtZmllbGRcIiBsYWJlbD1cIlx1ODg0Q1x1N0EwQlx1NTQwRFx1NzlGMFwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1uYW1lXCI+XG4gICAgICAgICAgPFRleHRJbnB1dCBpZD1cInRyaXAtY3JlYXRlLW5hbWVcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fbmFtZS1pbnB1dFwiIGRlZmF1bHRWYWx1ZT1cIlx1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19kYXRlLWZpZWxkXCIgbGFiZWw9XCJcdTUxRkFcdTUzRDFcdTY1RTVcdTY3MUZcIiBodG1sRm9yPVwidHJpcC1jcmVhdGUtZGF0ZVwiIGhpbnQ9XCJcdTVFRkFcdThCQUVcdTkwMDlcdTYyRTlcdTU5MjlcdTZDMTRcdTdBMzNcdTVCOUFcdTc2ODRcdTY1RTVcdTY3MUZcIj5cbiAgICAgICAgICA8VGV4dElucHV0IGlkPVwidHJpcC1jcmVhdGUtZGF0ZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19kYXRlLWlucHV0XCIgZGVmYXVsdFZhbHVlPVwiMjAyNi0wOC0xNVwiIC8+XG4gICAgICAgIDwvRm9ybUZpZWxkPlxuICAgICAgICA8Rm9ybUZpZWxkIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1maWVsZFwiIGxhYmVsPVwiXHU5NkM2XHU1NDA4XHU1NzMwXHU3MEI5XCIgaHRtbEZvcj1cInRyaXAtY3JlYXRlLXN0YXJ0XCI+XG4gICAgICAgICAgPFNlbGVjdCBpZD1cInRyaXAtY3JlYXRlLXN0YXJ0XCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3N0YXJ0LXNlbGVjdFwiIGRlZmF1bHRWYWx1ZT1cIm1ldHJvXCI+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cIm1ldHJvXCI+XHU4RkQwXHU2Q0IzXHU4REVGXHU1NzMwXHU5NEMxXHU3QUQ5IDMgXHU1M0Y3XHU1M0UzPC9vcHRpb24+XG4gICAgICAgICAgICA8b3B0aW9uIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19zdGFydC1vcHRpb25cIiB2YWx1ZT1cIndhcmVob3VzZVwiPlx1NjVFN1x1NEVEM1x1NUU5M1x1NkI2M1x1OTVFODwvb3B0aW9uPlxuICAgICAgICAgICAgPG9wdGlvbiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fc3RhcnQtb3B0aW9uXCIgdmFsdWU9XCJjdXN0b21cIj5cdTgxRUFcdTVCOUFcdTRFNDlcdTU3MzBcdTcwQjk8L29wdGlvbj5cbiAgICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgPC9Gb3JtRmllbGQ+XG4gICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwLWNyZWF0ZS1wYWNlXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3BhY2VcIiBnYXA9ezl9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19ncm91cC1sYWJlbFwiPlx1ODg0Q1x1N0EwQlx1ODI4Mlx1NTk0Rjwvc3Bhbj5cbiAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wYWNlLW9wdGlvbnNcIiBnYXA9ezEyfT5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU4RjdCXHU2NzdFXCIgZGVmYXVsdENoZWNrZWQgLz5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU2ODA3XHU1MUM2XCIgLz5cbiAgICAgICAgICAgIDxSYWRpbyBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcGFjZS1vcHRpb25cIiBuYW1lPVwicGFjZVwiIGxhYmVsPVwiXHU3RDI3XHU1MUQxXCIgLz5cbiAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgIDxGb3JtRmllbGQgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX25vdGUtZmllbGRcIiBsYWJlbD1cIlx1NTQwQ1x1ODg0Q1x1NTkwN1x1NkNFOFwiIGh0bWxGb3I9XCJ0cmlwLWNyZWF0ZS1ub3RlXCI+XG4gICAgICAgICAgPFRleHRBcmVhIGlkPVwidHJpcC1jcmVhdGUtbm90ZVwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19ub3RlLWlucHV0XCIgcGxhY2Vob2xkZXI9XCJcdTRGOEJcdTU5ODJcdUZGMUFcdTY3MDlcdTUxM0ZcdTdBRTVcdTU0MENcdTg4NENcdUZGMENcdTVFMENcdTY3MUJcdTUxQ0ZcdTVDMTFcdTY5N0NcdTY4QUZcdThERUZcdTZCQjVcIiAvPlxuICAgICAgICA8L0Zvcm1GaWVsZD5cbiAgICAgICAgPENvbHVtbiBpZD1cInRyaXAtY3JlYXRlLXByZWZlcmVuY2VzXCIgY2xhc3NOYW1lPVwidHJpcC1jcmVhdGVfX3ByZWZlcmVuY2VzXCIgZ2FwPXsxMH0+XG4gICAgICAgICAgPENoZWNrYm94IGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19wcmVmZXJlbmNlXCIgbGFiZWw9XCJcdTRGMThcdTUxNDhcdTVCODlcdTYzOTJcdTY1RTBcdTk2OUNcdTc4OERcdThERUZcdTdFQkZcIiAvPlxuICAgICAgICAgIDxDaGVja2JveCBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcHJlZmVyZW5jZVwiIGxhYmVsPVwiXHU5MDdGXHU1RjAwXHU5NzAwXHU4OTgxXHU5ODg0XHU3RUE2XHU3Njg0XHU1NzMwXHU3MEI5XCIgZGVmYXVsdENoZWNrZWQgLz5cbiAgICAgICAgICA8VG9nZ2xlIGlkPVwidHJpcC1jcmVhdGUtcmVtaW5kZXJcIiBjbGFzc05hbWU9XCJ0cmlwLWNyZWF0ZV9fcmVtaW5kZXJcIiBjaGVja2VkPXtyZW1pbmRlcn0gb25DaGFuZ2U9e3NldFJlbWluZGVyfSBsYWJlbD1cIlx1NTFGQVx1NTNEMVx1NTI0RFx1NEUwMFx1NTkyOVx1NjNEMFx1OTE5MlwiIC8+XG4gICAgICAgIDwvQ29sdW1uPlxuICAgICAgICA8QnV0dG9uIGlkPVwidHJpcC1jcmVhdGUtbmV4dFwiIGNsYXNzTmFtZT1cInRyaXAtY3JlYXRlX19uZXh0XCIgdmFyaWFudD1cInByaW1hcnlcIiB0bz1cImJ1ZGdldFwiPlx1NEUwQlx1NEUwMFx1NkI2NVx1RkYxQVx1OTg4NFx1N0I5N1x1NEUwRVx1NTQwQ1x1ODg0Q1x1NEVCQTwvQnV0dG9uPlxuICAgICAgPC9Db2x1bW4+XG4gICAgPC9Nb2JpbGVMYXlvdXQ+XG4gIClcbn1cbiIsICIvKipcbiAqIEB3aXJlZnJhbWUtc2tpbGwgbXVsdGktc2NyZWVuLXdpcmVmcmFtZUAxLjUuMVxuICogXHU1MjFCXHU1RUZBXHU1N0ZBXHU0RThFIHYxLjUuMVxuICogXHU0RkVFXHU2NTM5XHU1N0ZBXHU0RThFIHYxLjUuMVxuICovXG5pbXBvcnQge1xuICBCYWRnZSxcbiAgQnV0dG9uLFxuICBDYXJkLFxuICBDb2x1bW4sXG4gIEVtcHR5U3RhdGUsXG4gIEhlYWRpbmcsXG4gIFBhZ2VIZWFkZXIsXG4gIFJvdyxcbiAgVGFicyxcbiAgVGV4dCxcbn0gZnJvbSAnLi4vLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL3VpL2luZGV4LmpzJ1xuaW1wb3J0IHsgTW9iaWxlTGF5b3V0IH0gZnJvbSAnLi4vbGF5b3V0cy9Nb2JpbGVMYXlvdXQuanN4J1xuXG5jb25zdCBUUklQUyA9IFtcbiAgeyBpZDogJ3RyaXAtY2FuYWwnLCB0aXRsZTogJ1x1NTQ2OFx1NTE2RFx1OEZEMFx1NkNCM1x1NjU2M1x1NkI2NScsIGRhdGU6ICc4IFx1NjcwOCAxNSBcdTY1RTUnLCBzdGF0dXM6ICdcdTVGODVcdTUxRkFcdTUzRDEnLCBkZXRhaWw6ICczIFx1NEVCQSBcdTAwQjcgNSBcdTRFMkFcdTU3MzBcdTcwQjknIH0sXG4gIHsgaWQ6ICd0cmlwLWxha2UnLCB0aXRsZTogJ1x1NzNBRlx1NkU1Nlx1OUE5MVx1ODg0Q1x1NTM0QVx1NjVFNScsIGRhdGU6ICc4IFx1NjcwOCAyMiBcdTY1RTUnLCBzdGF0dXM6ICdcdTg5QzRcdTUyMTJcdTRFMkQnLCBkZXRhaWw6ICcyIFx1NEVCQSBcdTAwQjcgNCBcdTRFMkFcdTU3MzBcdTcwQjknIH0sXG4gIHsgaWQ6ICd0cmlwLW11c2V1bScsIHRpdGxlOiAnXHU5NkU4XHU1OTI5XHU1MzVBXHU3MjY5XHU5OTg2XHU3RUJGJywgZGF0ZTogJzkgXHU2NzA4IDUgXHU2NUU1Jywgc3RhdHVzOiAnXHU1Rjg1XHU3ODZFXHU4QkE0JywgZGV0YWlsOiAnNCBcdTRFQkEgXHUwMEI3IDMgXHU0RTJBXHU1NzNBXHU5OTg2JyB9LFxuICB7IGlkOiAndHJpcC1oaWxscycsIHRpdGxlOiAnXHU1N0NFXHU1MzE3XHU4RjdCXHU1RjkyXHU2QjY1JywgZGF0ZTogJzkgXHU2NzA4IDEyIFx1NjVFNScsIHN0YXR1czogJ1x1ODlDNFx1NTIxMlx1NEUyRCcsIGRldGFpbDogJzMgXHU0RUJBIFx1MDBCNyA2IFx1NEUyQVx1NTczMFx1NzBCOScgfSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIFRyaXBzU2NyZWVuKCkge1xuICBjb25zdCBbdGFiLCBzZXRUYWJdID0gUmVhY3QudXNlU3RhdGUoJ3VwY29taW5nJylcbiAgcmV0dXJuIChcbiAgICA8TW9iaWxlTGF5b3V0PlxuICAgICAgPENvbHVtbiBpZD1cInRyaXBzLXBhZ2VcIiBnYXA9ezE4fSBjbGFzc05hbWU9XCJ3ZWVrZW5kLXBhZ2UgdHJpcHNfX3BhZ2VcIj5cbiAgICAgICAgPFBhZ2VIZWFkZXJcbiAgICAgICAgICBpZD1cInRyaXBzLWhlYWRlclwiXG4gICAgICAgICAgdGl0bGVJZD1cInRyaXBzLXRpdGxlXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ0cmlwc19faGVhZGVyXCJcbiAgICAgICAgICB0aXRsZT1cIlx1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQlwiXG4gICAgICAgICAgc3VidGl0bGU9XCJcdThCQTFcdTUyMTJcdTMwMDFcdTU0MENcdTg4NENcdTRGRTFcdTYwNkZcdTRFMEVcdTY1QzVcdTg4NENcdThCQjBcdTVGNTVcIlxuICAgICAgICAgIGFjdGlvbnM9ezxCdXR0b24gaWQ9XCJ0cmlwcy1jcmVhdGUtYWN0aW9uXCIgY2xhc3NOYW1lPVwidHJpcHNfX2NyZWF0ZS1hY3Rpb25cIiB0bz1cInRyaXAtY3JlYXRlXCI+XHU2NUIwXHU1RUZBPC9CdXR0b24+fVxuICAgICAgICAvPlxuICAgICAgICA8VGFicyBpZD1cInRyaXBzLXRhYnNcIiBjbGFzc05hbWU9XCJ0cmlwc19fdGFic1wiIGFjdGl2ZUlkPXt0YWJ9IG9uQ2hhbmdlPXtzZXRUYWJ9IGl0ZW1zPXtbeyBpZDogJ3VwY29taW5nJywgbGFiZWw6ICdcdTVGODVcdTUxRkFcdTUzRDEnIH0sIHsgaWQ6ICdjb21wbGV0ZWQnLCBsYWJlbDogJ1x1NURGMlx1NUI4Q1x1NjIxMCcgfSwgeyBpZDogJ3NhdmVkJywgbGFiZWw6ICdcdTY1MzZcdTg1Q0YnIH1dfSAvPlxuICAgICAgICB7dGFiID09PSAndXBjb21pbmcnID8gKFxuICAgICAgICAgIDxDb2x1bW4gaWQ9XCJ0cmlwcy11cGNvbWluZ1wiIGNsYXNzTmFtZT1cInRyaXBzX19saXN0XCIgZ2FwPXsxMn0+XG4gICAgICAgICAgICB7VFJJUFMubWFwKCh0cmlwKSA9PiAoXG4gICAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9e3RyaXAuaWR9IGtleT17dHJpcC5pZH0gdG89XCJyb3V0ZS1kZXRhaWxcIj5cbiAgICAgICAgICAgICAgICA8Q29sdW1uIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWJvZHlcIiBnYXA9ezl9PlxuICAgICAgICAgICAgICAgICAgPFJvdyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1oZWFkaW5nXCIgYWxpZ25JdGVtcz1cImNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiIGdhcD17OH0+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkaW5nIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXRpdGxlXCIgbGV2ZWw9ezN9Pnt0cmlwLnRpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPEJhZGdlIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXN0YXR1c1wiPnt0cmlwLnN0YXR1c308L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgICA8VGV4dCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1kYXRlXCI+e3RyaXAuZGF0ZX08L1RleHQ+XG4gICAgICAgICAgICAgICAgICA8Um93IGNsYXNzTmFtZT1cInRyaXBzX19zdGF0dXMtcm93XCIgZ2FwPXsxMH0+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRldGFpbFwiPnt0cmlwLmRldGFpbH08L1RleHQ+XG4gICAgICAgICAgICAgICAgICAgIDxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLXJlbWluZGVyXCI+XHU2M0QwXHU5MTkyXHU1REYyXHU1RjAwXHU1NDJGPC9UZXh0PlxuICAgICAgICAgICAgICAgICAgPC9Sb3c+XG4gICAgICAgICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICAgICAgIDwvQ2FyZD5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvQ29sdW1uPlxuICAgICAgICApIDogdGFiID09PSAnY29tcGxldGVkJyA/IChcbiAgICAgICAgICA8Q29sdW1uIGlkPVwidHJpcHMtY29tcGxldGVkXCIgY2xhc3NOYW1lPVwidHJpcHNfX2NvbXBsZXRlZFwiIGdhcD17MTJ9PlxuICAgICAgICAgICAgPENhcmQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmRcIiBkYXRhLXdmLWtleT1cInRyaXAtb2xkLXN0cmVldFwiIHRvPVwicm91dGUtZGV0YWlsXCI+PENvbHVtbiBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC1ib2R5XCIgZ2FwPXs4fT48SGVhZGluZyBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZC10aXRsZVwiIGxldmVsPXszfT5cdTgwMDFcdTg4NTdcdTYxNjJcdTZFMzg8L0hlYWRpbmc+PFRleHQgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtZGF0ZVwiPjcgXHU2NzA4IDE4IFx1NjVFNSBcdTAwQjcgXHU1REYyXHU1QjhDXHU2MjEwPC9UZXh0PjwvQ29sdW1uPjwvQ2FyZD5cbiAgICAgICAgICAgIDxDYXJkIGNsYXNzTmFtZT1cInRyaXBzX19jYXJkXCIgZGF0YS13Zi1rZXk9XCJ0cmlwLW5pZ2h0LXdhbGtcIiB0bz1cInJvdXRlLWRldGFpbFwiPjxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OH0+PEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+XHU1OTFDXHU4MjcyXHU1RUZBXHU3QjUxXHU2NTYzXHU2QjY1PC9IZWFkaW5nPjxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj42IFx1NjcwOCAyNyBcdTY1RTUgXHUwMEI3IFx1NURGMlx1NUI4Q1x1NjIxMDwvVGV4dD48L0NvbHVtbj48L0NhcmQ+XG4gICAgICAgICAgICA8Q2FyZCBjbGFzc05hbWU9XCJ0cmlwc19fY2FyZFwiIGRhdGEtd2Yta2V5PVwidHJpcC1yaXZlcnNpZGVcIiB0bz1cInJvdXRlLWRldGFpbFwiPjxDb2x1bW4gY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtYm9keVwiIGdhcD17OH0+PEhlYWRpbmcgY2xhc3NOYW1lPVwidHJpcHNfX2NhcmQtdGl0bGVcIiBsZXZlbD17M30+XHU1MzU3XHU1Q0I4XHU2NUU3XHU3ODAxXHU1OTM0PC9IZWFkaW5nPjxUZXh0IGNsYXNzTmFtZT1cInRyaXBzX19jYXJkLWRhdGVcIj41IFx1NjcwOCAxNiBcdTY1RTUgXHUwMEI3IFx1NURGMlx1NUI4Q1x1NjIxMDwvVGV4dD48L0NvbHVtbj48L0NhcmQ+XG4gICAgICAgICAgPC9Db2x1bW4+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPEVtcHR5U3RhdGUgaWQ9XCJ0cmlwcy1zYXZlZC1lbXB0eVwiIGNsYXNzTmFtZT1cInRyaXBzX19lbXB0eVwiIHRpdGxlPVwiXHU4RkQ4XHU2Q0ExXHU2NzA5XHU2NTM2XHU4NUNGXHU4REVGXHU3RUJGXCIgZGVzY3JpcHRpb249XCJcdTU3MjhcdThERUZcdTdFQkZcdThCRTZcdTYwQzVcdTRFMkRcdTY1MzZcdTg1Q0ZcdUZGMENcdTdBMERcdTU0MEVcdTUxOERcdTUxQjNcdTVCOUFcdTRFQzBcdTRFNDhcdTY1RjZcdTUwMTlcdTUxRkFcdTUzRDFcdTMwMDJcIiBhY3Rpb249ezxCdXR0b24gY2xhc3NOYW1lPVwidHJpcHNfX2VtcHR5LWFjdGlvblwiIHRvPVwiZGlzY292ZXJcIj5cdTUzQkJcdTUzRDFcdTczQjBcdThERUZcdTdFQkY8L0J1dHRvbj59IC8+XG4gICAgICAgICl9XG4gICAgICA8L0NvbHVtbj5cbiAgICA8L01vYmlsZUxheW91dD5cbiAgKVxufVxuIiwgImltcG9ydCB7IEJ1ZGdldFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9idWRnZXQuanN4J1xuaW1wb3J0IHsgRGlzY292ZXJTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvZGlzY292ZXIuanN4J1xuaW1wb3J0IHsgRXhwbG9yZU1hcFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9leHBsb3JlLW1hcC5qc3gnXG5pbXBvcnQgeyBJdGluZXJhcnlTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvaXRpbmVyYXJ5LmpzeCdcbmltcG9ydCB7IExvZ2luU2NyZWVuIH0gZnJvbSAnLi9zY3JlZW5zL2xvZ2luLmpzeCdcbmltcG9ydCB7IFByb2ZpbGVTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvcHJvZmlsZS5qc3gnXG5pbXBvcnQgeyBSb3V0ZURldGFpbFNjcmVlbiB9IGZyb20gJy4vc2NyZWVucy9yb3V0ZS1kZXRhaWwuanN4J1xuaW1wb3J0IHsgVHJpcENvbmZpcm1TY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcC1jb25maXJtLmpzeCdcbmltcG9ydCB7IFRyaXBDcmVhdGVTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcC1jcmVhdGUuanN4J1xuaW1wb3J0IHsgVHJpcHNTY3JlZW4gfSBmcm9tICcuL3NjcmVlbnMvdHJpcHMuanN4J1xuXG5leHBvcnQgY29uc3QgcHJvamVjdCA9IHtcbiAgbmFtZTogJ1x1NTQ2OFx1NjcyQlx1NTFGQVx1NTNEMVx1NjVDNVx1ODg0Q1x1NTJBOVx1NjI0QicsXG4gIHZpZXdwb3J0czoge1xuICAgIG1vYmlsZTogeyB3aWR0aDogMzc1LCBoZWlnaHQ6IDgxMiB9LFxuICB9LFxuICBkZWZhdWx0Vmlld3BvcnQ6ICdtb2JpbGUnLFxuICBzY3JlZW5zOiBbXG4gICAge1xuICAgICAgaWQ6ICdsb2dpbicsXG4gICAgICB0aXRsZTogJ1x1NzY3Qlx1NUY1NScsXG4gICAgICBjb21wb25lbnQ6IExvZ2luU2NyZWVuLFxuICAgICAgZW50cnk6IHRydWUsXG4gICAgICBsaW5rczogWydkaXNjb3ZlciddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnZGlzY292ZXInLFxuICAgICAgdGl0bGU6ICdcdTUzRDFcdTczQjAnLFxuICAgICAgZGVzY3JpcHRpb246ICdcdThEODVcdThGQzdcdTRFMDBcdTVDNEZcdTc2ODRcdThERUZcdTdFQkZcdTYzQThcdTgzNTBcdTk5OTZcdTk4NzUnLFxuICAgICAgY29tcG9uZW50OiBEaXNjb3ZlclNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ2V4cGxvcmUtbWFwJywgJ3JvdXRlLWRldGFpbCcsICd0cmlwcycsICdwcm9maWxlJ10sXG4gICAgICBlZGdlQ2FzZXM6IFtdLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICdleHBsb3JlLW1hcCcsXG4gICAgICB0aXRsZTogJ1x1NzZFRVx1NzY4NFx1NTczMFx1NTczMFx1NTZGRScsXG4gICAgICBjb21wb25lbnQ6IEV4cGxvcmVNYXBTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdyb3V0ZS1kZXRhaWwnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAncm91dGUtZGV0YWlsJyxcbiAgICAgIHRpdGxlOiAnXHU4REVGXHU3RUJGXHU4QkU2XHU2MEM1JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU5NTdGXHU1MTg1XHU1QkI5XHU4REVGXHU3RUJGXHU0RUNCXHU3RUNEXHU0RTBFXHU1NzMwXHU3MEI5XHU1MjE3XHU4ODY4JyxcbiAgICAgIGNvbXBvbmVudDogUm91dGVEZXRhaWxTY3JlZW4sXG4gICAgICBsaW5rczogWydkaXNjb3ZlcicsICdleHBsb3JlLW1hcCcsICdpdGluZXJhcnknLCAndHJpcC1jcmVhdGUnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnaXRpbmVyYXJ5JyxcbiAgICAgIHRpdGxlOiAnXHU2QkNGXHU2NUU1XHU4ODRDXHU3QTBCJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnXHU4RDg1XHU4RkM3XHU0RTAwXHU1QzRGXHU3Njg0XHU3RUI1XHU1NDExXHU2QjY1XHU5QUE0XHU0RTBFXHU2NUU1XHU3QTBCXHU1MzYxXHU3MjQ3JyxcbiAgICAgIGNvbXBvbmVudDogSXRpbmVyYXJ5U2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ3RyaXAtY3JlYXRlJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXAtY3JlYXRlJyxcbiAgICAgIHRpdGxlOiAnXHU1MjFCXHU1RUZBXHU4ODRDXHU3QTBCJyxcbiAgICAgIGNvbXBvbmVudDogVHJpcENyZWF0ZVNjcmVlbixcbiAgICAgIGxpbmtzOiBbJ2Rpc2NvdmVyJywgJ3JvdXRlLWRldGFpbCcsICdidWRnZXQnLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICAgIHtcbiAgICAgIGlkOiAnYnVkZ2V0JyxcbiAgICAgIHRpdGxlOiAnXHU5ODg0XHU3Qjk3XHU0RTBFXHU1NDBDXHU4ODRDXHU0RUJBJyxcbiAgICAgIGNvbXBvbmVudDogQnVkZ2V0U2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAndHJpcC1jb25maXJtJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3RyaXAtY29uZmlybScsXG4gICAgICB0aXRsZTogJ1x1NjNEMFx1NEVBNFx1Nzg2RVx1OEJBNCcsXG4gICAgICBjb21wb25lbnQ6IFRyaXBDb25maXJtU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAnYnVkZ2V0JywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogWydcdTc4NkVcdThCQTRcdTVGMzlcdTVDNDInLCAnXHU1MkEwXHU4RjdEXHU3MkI2XHU2MDAxJywgJ1x1NjIxMFx1NTI5Rlx1NjNEMFx1NzkzQSddLFxuICAgIH0sXG4gICAge1xuICAgICAgaWQ6ICd0cmlwcycsXG4gICAgICB0aXRsZTogJ1x1NjIxMVx1NzY4NFx1ODg0Q1x1N0EwQicsXG4gICAgICBjb21wb25lbnQ6IFRyaXBzU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAncm91dGUtZGV0YWlsJywgJ3RyaXAtY3JlYXRlJywgJ3RyaXBzJywgJ3Byb2ZpbGUnXSxcbiAgICAgIGVkZ2VDYXNlczogW10sXG4gICAgfSxcbiAgICB7XG4gICAgICBpZDogJ3Byb2ZpbGUnLFxuICAgICAgdGl0bGU6ICdcdTRFMkFcdTRFQkFcdThCQkVcdTdGNkUnLFxuICAgICAgY29tcG9uZW50OiBQcm9maWxlU2NyZWVuLFxuICAgICAgbGlua3M6IFsnZGlzY292ZXInLCAndHJpcHMnLCAncHJvZmlsZSddLFxuICAgICAgZWRnZUNhc2VzOiBbXSxcbiAgICB9LFxuICBdLFxufVxuIiwgImltcG9ydCB7IEJvYXJkIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2JvYXJkL0JvYXJkLmpzeCdcbmltcG9ydCB7IEVycm9yQm91bmRhcnkgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS9FcnJvckJvdW5kYXJ5LmpzeCdcbmltcG9ydCB7IFByb3RvdHlwZVByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vLi4vc3RhcnRlci9mcmFtZXdvcmsvbGliL2NvcmUvUHJvdG90eXBlQ29udGV4dC5qc3gnXG5pbXBvcnQgeyB2YWxpZGF0ZVByb2plY3QgfSBmcm9tICcuLi8uLi8uLi9zdGFydGVyL2ZyYW1ld29yay9saWIvY29yZS92YWxpZGF0ZVByb2plY3QuanMnXG5pbXBvcnQgeyBwcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJ1xuXG52YWxpZGF0ZVByb2plY3QocHJvamVjdClcblxuUmVhY3RET00uY3JlYXRlUm9vdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9vdCcpKS5yZW5kZXIoXG4gIDxFcnJvckJvdW5kYXJ5IHNjb3BlPVwiYm9hcmRcIj5cbiAgICA8UHJvdG90eXBlUHJvdmlkZXIgcHJvamVjdD17cHJvamVjdH0+XG4gICAgICA8Qm9hcmQgcHJvamVjdD17cHJvamVjdH0gLz5cbiAgICA8L1Byb3RvdHlwZVByb3ZpZGVyPlxuICA8L0Vycm9yQm91bmRhcnk+LFxuKVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBQUEsTUFBTSxtQkFBbUIsTUFBTSxjQUFjLElBQUk7QUFFakQsV0FBUyxtQkFBbUJBLFVBQVM7QUFGckM7QUFHRSxhQUFPLEtBQUFBLFNBQVEsUUFBUSxLQUFLLENBQUMsV0FBVyxPQUFPLEtBQUssTUFBN0MsbUJBQWdELE9BQU1BLFNBQVEsUUFBUSxDQUFDLEVBQUU7QUFBQSxFQUNsRjtBQUVPLFdBQVMsa0JBQWtCLEVBQUUsU0FBQUEsVUFBUyxTQUFTLEdBQUc7QUFDdkQsVUFBTSxrQkFBa0IsbUJBQW1CQSxRQUFPO0FBQ2xELFVBQU0sQ0FBQyxPQUFPLFFBQVEsSUFBSSxNQUFNLFNBQVM7QUFBQSxNQUN2QyxNQUFNO0FBQUEsTUFDTixhQUFhQSxTQUFRO0FBQUEsTUFDckIsU0FBUztBQUFBLE1BQ1QsaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDO0FBQUEsSUFDWixDQUFDO0FBRUQsVUFBTSxXQUFXLE1BQU0sWUFBWSxDQUFDLE9BQU87QUFDekMsVUFBSSxDQUFDQSxTQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxPQUFPLEVBQUUsR0FBRztBQUN2RCxjQUFNLElBQUksTUFBTSxzQkFBc0IsRUFBRSxrQkFBa0I7QUFBQSxNQUM1RDtBQUNBLGVBQVMsQ0FB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Q1AsV0FBVztBQUFBLFFBQ1gsT0FBTyxDQUFDLFlBQVksZ0JBQWdCLGVBQWUsU0FBUyxTQUFTO0FBQUEsUUFDckUsV0FBVyxDQUFDO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxRQUNFLElBQUk7QUFBQSxRQUNKLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU8sQ0FBQyxZQUFZLFNBQVMsU0FBUztBQUFBLFFBQ3RDLFdBQVcsQ0FBQztBQUFBLE1BQ2Q7QUFBQSxJQUNGO0FBQUEsRUFDRjs7O0FDdkZBLGtCQUFnQixPQUFPO0FBRXZCLFdBQVMsV0FBVyxTQUFTLGVBQWUsTUFBTSxDQUFDLEVBQUU7QUFBQSxJQUNuRCxvQ0FBQyxpQkFBYyxPQUFNLFdBQ25CLG9DQUFDLHFCQUFrQixXQUNqQixvQ0FBQyxTQUFNLFNBQWtCLENBQzNCLENBQ0Y7QUFBQSxFQUNGOyIsCiAgIm5hbWVzIjogWyJwcm9qZWN0IiwgInByb2plY3QiLCAiX2EiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgImNvcHlUZXh0IiwgInByb2plY3QiLCAicHJvamVjdCIsICJwcm9qZWN0IiwgInRhYnMiXQp9Cg==
