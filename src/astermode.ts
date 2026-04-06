const RUNTIME_SCRIPT = `
(() => {
  const PANEL_OPEN_STORAGE_KEY = "astermode:panel-open";
  const THEME_STORAGE_KEY = "astermode:theme";
  const state = {
    trigger: null,
    panel: null,
    tooltip: null,
    classContextBox: null,
    hoverEnabled: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialBottom: 0,
    moved: false,
    cacheDisabled: __CACHE_BYPASS_DEFAULT__,
    selectedElement: null,
    actionButtons: [],
    themeButton: null,
    themeMode: "auto",
    isDarkTheme: false,
    cmView: null,
    cmModules: null,
    usingThirdPartyEditor: false,
    originalFetch: null,
    originalOpen: null,
    handlers: {}
  };

  function styleActionButton(button) {
    button.style.height = "32px";
    button.style.border = "0";
    button.style.borderRight = "1px solid #e5e7eb";
    button.style.borderRadius = "0";
    button.style.background = "#ffffff";
    button.style.fontSize = "12px";
    button.style.fontWeight = "500";
    button.style.cursor = "pointer";
    button.style.color = "#1f2328";
    button.style.padding = "0 12px";
    button.style.whiteSpace = "nowrap";
    button.style.flex = "0 0 auto";
  }

  function getAsterIconSvg(color) {
    return (
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<circle cx="12" cy="12" r="2.2" fill="' + color + '"/>' +
      '<ellipse cx="12" cy="4.5" rx="2.2" ry="3.2" fill="' + color + '"/>' +
      '<ellipse cx="12" cy="19.5" rx="2.2" ry="3.2" fill="' + color + '"/>' +
      '<ellipse cx="4.5" cy="12" rx="3.2" ry="2.2" fill="' + color + '"/>' +
      '<ellipse cx="19.5" cy="12" rx="3.2" ry="2.2" fill="' + color + '"/>' +
      '<ellipse cx="6.8" cy="6.8" rx="2.1" ry="3.1" transform="rotate(-45 6.8 6.8)" fill="' + color + '"/>' +
      '<ellipse cx="17.2" cy="17.2" rx="2.1" ry="3.1" transform="rotate(-45 17.2 17.2)" fill="' + color + '"/>' +
      '<ellipse cx="17.2" cy="6.8" rx="2.1" ry="3.1" transform="rotate(45 17.2 6.8)" fill="' + color + '"/>' +
      '<ellipse cx="6.8" cy="17.2" rx="2.1" ry="3.1" transform="rotate(45 6.8 17.2)" fill="' + color + '"/>' +
      "</svg>"
    );
  }

  function detectDarkTheme() {
    const root = document.documentElement;
    const explicitDark = root.dataset.theme === "dark" || root.classList.contains("dark");
    const explicitLight = root.dataset.theme === "light" || root.classList.contains("light");
    if (explicitDark) return true;
    if (explicitLight) return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function isDarkThemeEnabled() {
    if (state.themeMode === "dark") return true;
    if (state.themeMode === "light") return false;
    return detectDarkTheme();
  }

  function updateThemeButtonLabel() {
    if (!(state.themeButton instanceof HTMLButtonElement)) return;
    state.themeButton.textContent = "Theme: " + (state.isDarkTheme ? "Dark" : "Light");
  }

  async function ensureCodeMirrorModules() {
    if (state.cmModules) return state.cmModules;
    const [cm, statePkg, viewPkg, htmlPkg, darkPkg] = await Promise.all([
      import("https://esm.sh/codemirror@6.0.1"),
      import("https://esm.sh/@codemirror/state@6.4.1"),
      import("https://esm.sh/@codemirror/view@6.30.1"),
      import("https://esm.sh/@codemirror/lang-html@6.4.9"),
      import("https://esm.sh/@codemirror/theme-one-dark@6.1.2")
    ]);
    state.cmModules = { ...cm, ...statePkg, ...viewPkg, ...htmlPkg, ...darkPkg };
    return state.cmModules;
  }

  function getCodeEditorThemeExtension(cmModules, isDark) {
    if (isDark && cmModules.oneDark) return cmModules.oneDark;
    if (!isDark && cmModules.EditorView && cmModules.EditorView.theme) {
      return cmModules.EditorView.theme({
        "&": { backgroundColor: "#f8fafc", color: "#0f172a" },
        ".cm-content": { caretColor: "#0f172a" },
        "&.cm-focused .cm-cursor": { borderLeftColor: "#0f172a" },
        "&.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "#dbeafe" },
        ".cm-gutters": { backgroundColor: "#f1f5f9", color: "#64748b", border: "none" }
      });
    }
    return [];
  }

  function destroyCodeMirrorInstance() {
    if (state.cmView && state.cmView.destroy) {
      state.cmView.destroy();
    }
    state.cmView = null;
  }

  async function mountThirdPartyEditor(source) {
    if (!state.classContextBox) return false;
    const host = state.classContextBox.querySelector('[data-role="code-editor-host"]');
    const fallback = state.classContextBox.querySelector('[data-role="code-editor-fallback"]');
    if (!(host instanceof HTMLElement) || !(fallback instanceof HTMLTextAreaElement)) return false;
    try {
      const cmModules = await ensureCodeMirrorModules();
      destroyCodeMirrorInstance();
      host.innerHTML = "";
      const startDoc = typeof source === "string" ? source : "";
      const extensions = [
        cmModules.basicSetup,
        cmModules.html(),
        cmModules.EditorView.lineWrapping,
        getCodeEditorThemeExtension(cmModules, state.isDarkTheme)
      ];
      state.cmView = new cmModules.EditorView({
        state: cmModules.EditorState.create({ doc: startDoc, extensions }),
        parent: host
      });
      fallback.style.display = "none";
      host.style.display = "block";
      state.usingThirdPartyEditor = true;
      return true;
    } catch (error) {
      host.style.display = "none";
      fallback.style.display = "block";
      state.usingThirdPartyEditor = false;
      return false;
    }
  }

  function togglePanel(forceOpen) {
    if (!state.panel || !state.trigger) return;
    const nextOpen = typeof forceOpen === "boolean" ? forceOpen : state.panel.style.display === "none";
    state.panel.style.display = nextOpen ? "block" : "none";
    state.trigger.style.display = nextOpen ? "none" : "inline-flex";
    try {
      localStorage.setItem(PANEL_OPEN_STORAGE_KEY, nextOpen ? "1" : "0");
    } catch (error) {
      // Ignore storage errors in restricted contexts.
    }
  }

  function hidePanel() {
    togglePanel(false);
  }

  function hideClassContextBox() {
    if (state.classContextBox) {
      state.classContextBox.style.display = "none";
    }
    state.selectedElement = null;
  }

  function openHtmlEditorForElement(target, x, y) {
    if (!state.classContextBox) return;
    const editor = state.classContextBox.querySelector('[data-role="code-editor-host"]');
    const applyButton = state.classContextBox.querySelector('button[data-action="apply"]');
    if (!(editor instanceof HTMLElement) || !(applyButton instanceof HTMLButtonElement)) return;

    state.selectedElement = target;
    const formattedHtml = formatHtml(target.outerHTML);
    setEditorCodeText(formattedHtml);
    applyButton.textContent = "Apply";
    state.classContextBox.style.display = "block";
    const boxWidth = Math.min(560, window.innerWidth - 24);
    const estimatedHeight = 250;
    const nextLeft = Math.max(12, Math.min(x + 8, window.innerWidth - boxWidth - 12));
    const nextTop = Math.max(12, Math.min(y + 8, window.innerHeight - estimatedHeight - 12));
    state.classContextBox.style.left = nextLeft + "px";
    state.classContextBox.style.top = nextTop + "px";
    mountThirdPartyEditor(formattedHtml);
  }

  function applyHtmlEdit() {
    if (!state.classContextBox || !(state.selectedElement instanceof HTMLElement)) return;
    const editor = state.classContextBox.querySelector('[data-role="code-editor-host"]');
    const applyButton = state.classContextBox.querySelector('button[data-action="apply"]');
    if (!(editor instanceof HTMLElement) || !(applyButton instanceof HTMLButtonElement)) return;

    const updatedMarkup = getEditorCodeText().trim();
    if (!updatedMarkup) return;
    const template = document.createElement("template");
    template.innerHTML = updatedMarkup;
    if (!template.content.firstChild) return;

    const marker = document.createComment("astermode-edit-replace");
    state.selectedElement.replaceWith(marker);
    marker.replaceWith(template.content.cloneNode(true));
    state.selectedElement = null;
    applyButton.textContent = "Applied";
    window.setTimeout(() => {
      applyButton.textContent = "Apply";
    }, 700);
  }

  function formatHtml(source) {
    const template = document.createElement("template");
    template.innerHTML = source.trim();
    const lines = [];

    function serializeNode(node, depth) {
      const indent = "  ".repeat(depth);

      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || "").trim();
        if (text) lines.push(indent + text);
        return;
      }

      if (node.nodeType === Node.COMMENT_NODE) {
        lines.push(indent + "<!--" + (node.textContent || "") + "-->");
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node;
      const tag = element.tagName.toLowerCase();
      const attrs = Array.from(element.attributes)
        .map((attr) => attr.name + '="' + attr.value.replace(/"/g, "&quot;") + '"')
        .join(" ");
      const openTag = attrs ? "<" + tag + " " + attrs + ">" : "<" + tag + ">";

      const children = Array.from(element.childNodes).filter((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          return (child.textContent || "").trim().length > 0;
        }
        return true;
      });

      if (children.length === 0) {
        lines.push(indent + openTag + "</" + tag + ">");
        return;
      }

      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        lines.push(indent + openTag + (children[0].textContent || "").trim() + "</" + tag + ">");
        return;
      }

      lines.push(indent + openTag);
      for (const child of children) {
        serializeNode(child, depth + 1);
      }
      lines.push(indent + "</" + tag + ">");
    }

    for (const child of Array.from(template.content.childNodes)) {
      serializeNode(child, 0);
    }

    return lines.join("\\n");
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightHtmlCode(source) {
    const escaped = escapeHtml(source);
    return escaped
      .replace(/(&lt;\\/?)([a-zA-Z0-9-:]+)/g, '$1<span style="color:#0f766e;">$2</span>')
      .replace(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)(=)("[^"]*"|'[^']*')/g, '<span style="color:#7c3aed;">$1</span>$2<span style="color:#b45309;">$3</span>')
      .replace(/(&lt;!--[\\s\\S]*?--&gt;)/g, '<span style="color:#6b7280;">$1</span>');
  }

  function setEditorCodeText(source) {
    if (!state.classContextBox) return;
    if (state.cmView && state.cmModules && state.cmModules.EditorSelection) {
      const length = state.cmView.state.doc.length;
      state.cmView.dispatch({
        changes: { from: 0, to: length, insert: source },
        selection: state.cmModules.EditorSelection.cursor(source.length)
      });
      return;
    }
    const fallback = state.classContextBox.querySelector('[data-role="code-editor-fallback"]');
    if (fallback instanceof HTMLTextAreaElement) {
      fallback.value = source;
      return;
    }
    const editor = state.classContextBox.querySelector('[data-role="code-editor-host"]');
    if (editor instanceof HTMLElement) {
      editor.dataset.raw = source;
      editor.innerHTML = highlightHtmlCode(source);
    }
  }

  function getEditorCodeText() {
    if (!state.classContextBox) return "";
    if (state.cmView) {
      return state.cmView.state.doc.toString();
    }
    const fallback = state.classContextBox.querySelector('[data-role="code-editor-fallback"]');
    if (fallback instanceof HTMLTextAreaElement) {
      return fallback.value;
    }
    const editor = state.classContextBox.querySelector('[data-role="code-editor-host"]');
    if (!(editor instanceof HTMLElement)) return "";
    return editor.dataset.raw || editor.textContent || "";
  }

  function placeCaretAtEnd(element) {
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function refreshHighlightedEditorFromInput() {
    if (!state.classContextBox) return;
    const editor = state.classContextBox.querySelector('[data-role="code-editor"]');
    if (!(editor instanceof HTMLElement)) return;
    const raw = editor.textContent || "";
    editor.dataset.raw = raw;
    editor.innerHTML = highlightHtmlCode(raw);
    placeCaretAtEnd(editor);
  }

  function updateHoverButtonLabel(button) {
    if (!button) return;
    button.textContent = "Hover: " + (state.hoverEnabled ? "ON" : "OFF");
    button.style.color = state.hoverEnabled ? "#15803d" : "#b91c1c";
  }

  function updateCacheButtonLabel(button) {
    if (!button) return;
    const cacheEnabled = !state.cacheDisabled;
    button.textContent = "Cache: " + (cacheEnabled ? "ON" : "OFF");
    button.style.color = cacheEnabled ? "#15803d" : "#b91c1c";
  }

  function applyThemeStyles() {
    state.isDarkTheme = isDarkThemeEnabled();
    const isDark = state.isDarkTheme;
    const panelBg = isDark ? "#0b1220" : "#ffffff";
    const panelBorder = isDark ? "#1f2937" : "#e5e7eb";
    const textColor = isDark ? "#e5e7eb" : "#111827";
    const buttonBg = isDark ? "#111827" : "#ffffff";
    const buttonBorder = isDark ? "#243041" : "#e5e7eb";
    const buttonText = isDark ? "#e5e7eb" : "#1f2328";

    if (state.panel) {
      state.panel.style.background = panelBg;
      state.panel.style.color = textColor;
      state.panel.style.borderTop = "1px solid " + panelBorder;
    }

    if (state.trigger) {
      state.trigger.style.boxShadow = isDark ? "0 10px 28px rgba(22, 163, 74, 0.45)" : "0 10px 28px rgba(22, 163, 74, 0.35)";
    }

    for (const button of state.actionButtons) {
      if (!(button instanceof HTMLButtonElement)) continue;
      button.style.background = buttonBg;
      button.style.color = buttonText;
      button.style.borderRight = "1px solid " + buttonBorder;
    }

    const brand = state.panel ? state.panel.querySelector('[data-role="brand"]') : null;
    if (brand instanceof HTMLElement) {
      brand.style.color = textColor;
      brand.style.borderRight = "1px solid " + buttonBorder;
    }

    if (state.classContextBox) {
      state.classContextBox.style.background = isDark ? "#0f172a" : "#fbfdff";
      state.classContextBox.style.color = textColor;
      state.classContextBox.style.border = "1px solid " + (isDark ? "#334155" : "#dbe3ee");

      const editor = state.classContextBox.querySelector('[data-role="code-editor-host"]');
      const fallback = state.classContextBox.querySelector('[data-role="code-editor-fallback"]');
      const closeTop = state.classContextBox.querySelector('button[data-action="close"]');
      const cancel = state.classContextBox.querySelector('button[data-action="cancel"]');
      const apply = state.classContextBox.querySelector('button[data-action="apply"]');

      if (editor instanceof HTMLElement) {
        editor.style.background = isDark ? "#111827" : "#f8fafc";
        editor.style.color = isDark ? "#e5e7eb" : "#0f172a";
        editor.style.border = "1px solid " + (isDark ? "#334155" : "#dbe3ee");
      }
      if (fallback instanceof HTMLTextAreaElement) {
        fallback.style.background = isDark ? "#111827" : "#f8fafc";
        fallback.style.color = isDark ? "#e5e7eb" : "#0f172a";
        fallback.style.border = "1px solid " + (isDark ? "#334155" : "#dbe3ee");
      }
      for (const actionButton of [closeTop, cancel]) {
        if (actionButton instanceof HTMLButtonElement) {
          actionButton.style.background = buttonBg;
          actionButton.style.color = buttonText;
          actionButton.style.border = "1px solid " + buttonBorder;
        }
      }
      if (apply instanceof HTMLButtonElement) {
        apply.style.background = "#16a34a";
        apply.style.color = "#ffffff";
        apply.style.border = "1px solid #16a34a";
      }
      if (state.cmView) {
        const current = state.cmView.state.doc.toString();
        mountThirdPartyEditor(current);
      }
    }

    const hoverButton = state.actionButtons.find((button) => button && button.dataset && button.dataset.role === "hover");
    const cacheButton = state.actionButtons.find((button) => button && button.dataset && button.dataset.role === "cache");
    updateHoverButtonLabel(hoverButton);
    updateCacheButtonLabel(cacheButton);
    updateThemeButtonLabel();
  }

  function setCacheDisabled(disabled) {
    state.cacheDisabled = disabled;
    const noStoreHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0"
    };

    if (disabled) {
      if (!state.originalFetch && typeof window.fetch === "function") {
        state.originalFetch = window.fetch.bind(window);
      }
      if (state.originalFetch) {
        window.fetch = (input, init = {}) => {
          const mergedHeaders = new Headers(init.headers || {});
          Object.entries(noStoreHeaders).forEach(([key, value]) => mergedHeaders.set(key, value));
          return state.originalFetch(input, {
            ...init,
            cache: "no-store",
            headers: mergedHeaders
          });
        };
      }

      if (!state.originalOpen && window.XMLHttpRequest && window.XMLHttpRequest.prototype.open) {
        state.originalOpen = window.XMLHttpRequest.prototype.open;
      }
      if (state.originalOpen) {
        window.XMLHttpRequest.prototype.open = function (...args) {
          this.addEventListener("readystatechange", function () {
            try {
              this.setRequestHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              this.setRequestHeader("Pragma", "no-cache");
              this.setRequestHeader("Expires", "0");
            } catch (error) {
              // Ignore browsers that block setting headers for some requests.
            }
          });
          return state.originalOpen.apply(this, args);
        };
      }
    } else {
      if (state.originalFetch) {
        window.fetch = state.originalFetch;
      }
      if (state.originalOpen) {
        window.XMLHttpRequest.prototype.open = state.originalOpen;
      }
    }
  }

  function addHoverEffect(event) {
    if (!state.tooltip) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("#astermode-trigger, #astermode-panel, #astermode-tooltip, #astermode-class-context")) return;

    target.style.outline = "1px solid #22c55e";
    const rect = target.getBoundingClientRect();
    state.tooltip.textContent = "W: " + rect.width.toFixed(1) + "px | H: " + rect.height.toFixed(1) + "px";
    state.tooltip.style.display = "block";
    state.tooltip.style.left = rect.left + window.scrollX + "px";
    state.tooltip.style.top = rect.top + window.scrollY - state.tooltip.offsetHeight - 6 + "px";
  }

  function removeHoverEffect(event) {
    const target = event.target;
    if (target instanceof HTMLElement) {
      if (target.closest("#astermode-trigger, #astermode-panel, #astermode-tooltip, #astermode-class-context")) return;
      target.style.outline = "";
    }
    if (state.tooltip) {
      state.tooltip.style.display = "none";
    }
  }

  function enableHoverEffect() {
    document.body.addEventListener("mouseover", state.handlers.addHoverEffect);
    document.body.addEventListener("mouseout", state.handlers.removeHoverEffect);
    document.addEventListener("contextmenu", state.handlers.onElementContextMenu);
  }

  function disableHoverEffect() {
    document.body.removeEventListener("mouseover", state.handlers.addHoverEffect);
    document.body.removeEventListener("mouseout", state.handlers.removeHoverEffect);
    document.removeEventListener("contextmenu", state.handlers.onElementContextMenu);
  }

  function onElementContextMenu(event) {
    if (!state.hoverEnabled || !state.classContextBox) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("#astermode-trigger, #astermode-panel, #astermode-tooltip, #astermode-class-context")) return;

    event.preventDefault();
    event.stopPropagation();
    openHtmlEditorForElement(target, event.clientX, event.clientY);
  }

  function onMouseMove(event) {
    if (!state.isDragging || !state.trigger) return;
    const deltaX = event.clientX - state.startX;
    const deltaY = event.clientY - state.startY;
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) state.moved = true;
    const nextLeft = state.initialLeft + deltaX;
    const nextBottom = state.initialBottom - deltaY;
    const triggerWidth = state.trigger.offsetWidth || 52;
    const triggerHeight = state.trigger.offsetHeight || 52;
    const clampedLeft = Math.max(0, Math.min(nextLeft, window.innerWidth - triggerWidth));
    const clampedBottom = Math.max(0, Math.min(nextBottom, window.innerHeight - triggerHeight));
    state.trigger.style.left = clampedLeft + "px";
    state.trigger.style.bottom = clampedBottom + "px";
  }

  function onMouseUp() {
    state.isDragging = false;
    document.removeEventListener("mousemove", state.handlers.onMouseMove);
    document.removeEventListener("mouseup", state.handlers.onMouseUp);
    window.setTimeout(() => {
      state.moved = false;
    }, 0);
  }

  function onMouseDown(event) {
    if (!state.trigger) return;
    state.isDragging = true;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.initialLeft = parseInt(state.trigger.style.left || "0", 10);
    state.initialBottom = parseInt(state.trigger.style.bottom || "0", 10);
    state.moved = false;
    document.addEventListener("mousemove", state.handlers.onMouseMove);
    document.addEventListener("mouseup", state.handlers.onMouseUp);
  }

  function enable() {
    if (state.trigger) return;
    const host = document.body;
    if (!host) return;

    state.trigger = document.createElement("button");
    state.trigger.id = "astermode-trigger";
    state.trigger.type = "button";
    state.trigger.innerHTML = getAsterIconSvg("#ffffff");
    state.trigger.title = "AsterMode";
    state.trigger.setAttribute("aria-label", "AsterMode");
    state.trigger.style.position = "fixed";
    state.trigger.style.left = "16px";
    state.trigger.style.bottom = "16px";
    state.trigger.style.width = "44px";
    state.trigger.style.height = "44px";
    state.trigger.style.borderRadius = "999px";
    state.trigger.style.border = "2px solid #16a34a";
    state.trigger.style.background = "linear-gradient(145deg, #22c55e 0%, #16a34a 100%)";
    state.trigger.style.color = "#fff";
    state.trigger.style.fontWeight = "700";
    state.trigger.style.fontSize = "0";
    state.trigger.style.lineHeight = "1";
    state.trigger.style.boxShadow = "0 10px 28px rgba(22, 163, 74, 0.35)";
    state.trigger.style.cursor = "grab";
    state.trigger.style.zIndex = "10000";
    state.trigger.style.userSelect = "none";
    state.trigger.style.touchAction = "none";
    state.trigger.style.display = "inline-flex";
    state.trigger.style.alignItems = "center";
    state.trigger.style.justifyContent = "center";

    state.panel = document.createElement("div");
    state.panel.id = "astermode-panel";
    state.panel.style.position = "fixed";
    state.panel.style.display = "none";
    state.panel.style.left = "0";
    state.panel.style.right = "0";
    state.panel.style.bottom = "0";
    state.panel.style.width = "auto";
    state.panel.style.background = "#ffffff";
    state.panel.style.color = "#111827";
    state.panel.style.border = "0";
    state.panel.style.borderTop = "1px solid #e5e7eb";
    state.panel.style.borderRadius = "0";
    state.panel.style.boxShadow = "none";
    state.panel.style.zIndex = "10001";
    state.panel.style.overflow = "hidden";
    state.panel.style.fontFamily = "Inter, Segoe UI, Roboto, Arial, sans-serif";

    const panelBody = document.createElement("div");
    panelBody.style.padding = "0";
    panelBody.style.display = "flex";
    panelBody.style.flexWrap = "nowrap";
    panelBody.style.alignItems = "stretch";
    panelBody.style.gap = "0";
    panelBody.style.overflowX = "auto";
    panelBody.style.overflowY = "hidden";

    const brandLabel = document.createElement("div");
    brandLabel.dataset.role = "brand";
    brandLabel.style.height = "32px";
    brandLabel.style.display = "inline-flex";
    brandLabel.style.alignItems = "center";
    brandLabel.style.gap = "6px";
    brandLabel.style.padding = "0 12px";
    brandLabel.style.fontSize = "12px";
    brandLabel.style.fontWeight = "600";
    brandLabel.style.color = "#111827";
    brandLabel.style.borderRight = "1px solid #e5e7eb";
    brandLabel.innerHTML = getAsterIconSvg("#16a34a") + "<span>AsterMode</span>";

    const hoverToggleButton = document.createElement("button");
    styleActionButton(hoverToggleButton);
    hoverToggleButton.dataset.role = "hover";
    updateHoverButtonLabel(hoverToggleButton);
    hoverToggleButton.addEventListener("click", () => {
      state.hoverEnabled = !state.hoverEnabled;
      if (state.hoverEnabled) {
        enableHoverEffect();
      } else {
        disableHoverEffect();
      }
      updateHoverButtonLabel(hoverToggleButton);
    });

    const clearStorageButton = document.createElement("button");
    styleActionButton(clearStorageButton);
    clearStorageButton.textContent = "LocalStorage";
    clearStorageButton.addEventListener("click", () => {
      localStorage.clear();
      clearStorageButton.textContent = "Done: LocalStorage";
      window.setTimeout(() => {
        clearStorageButton.textContent = "LocalStorage";
      }, 1000);
    });

    panelBody.appendChild(brandLabel);
    panelBody.appendChild(hoverToggleButton);
    panelBody.appendChild(clearStorageButton);

    const clearSessionStorageButton = document.createElement("button");
    styleActionButton(clearSessionStorageButton);
    clearSessionStorageButton.textContent = "SessionStorage";
    clearSessionStorageButton.addEventListener("click", () => {
      sessionStorage.clear();
      clearSessionStorageButton.textContent = "Done: SessionStorage";
      window.setTimeout(() => {
        clearSessionStorageButton.textContent = "SessionStorage";
      }, 1000);
    });

    const clearCookiesButton = document.createElement("button");
    styleActionButton(clearCookiesButton);
    clearCookiesButton.textContent = "Clear Cookies";
    clearCookiesButton.addEventListener("click", () => {
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
        if (!name) continue;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
      clearCookiesButton.textContent = "Done: Clear Cookies";
      window.setTimeout(() => {
        clearCookiesButton.textContent = "Clear Cookies";
      }, 1000);
    });

    const cacheToggleButton = document.createElement("button");
    styleActionButton(cacheToggleButton);
    cacheToggleButton.dataset.role = "cache";
    updateCacheButtonLabel(cacheToggleButton);
    cacheToggleButton.addEventListener("click", () => {
      setCacheDisabled(!state.cacheDisabled);
      updateCacheButtonLabel(cacheToggleButton);
    });

    panelBody.appendChild(clearSessionStorageButton);
    panelBody.appendChild(clearCookiesButton);
    panelBody.appendChild(cacheToggleButton);

    const reloadButton = document.createElement("button");
    styleActionButton(reloadButton);
    reloadButton.textContent = "Reload";
    reloadButton.addEventListener("click", () => {
      window.location.reload();
    });

    const closeButton = document.createElement("button");
    styleActionButton(closeButton);
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => {
      hidePanel();
    });

    const themeButton = document.createElement("button");
    styleActionButton(themeButton);
    themeButton.dataset.role = "theme";
    state.themeButton = themeButton;
    themeButton.addEventListener("click", () => {
      state.themeMode = state.isDarkTheme ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, state.themeMode);
      } catch (error) {
        // Ignore storage errors in restricted contexts.
      }
      applyThemeStyles();
    });

    panelBody.appendChild(reloadButton);
    panelBody.appendChild(themeButton);
    panelBody.appendChild(closeButton);
    closeButton.style.borderRight = "0";
    state.panel.appendChild(panelBody);
    state.actionButtons = [
      hoverToggleButton,
      clearStorageButton,
      clearSessionStorageButton,
      clearCookiesButton,
      cacheToggleButton,
      reloadButton,
      themeButton,
      closeButton
    ];

    state.tooltip = document.createElement("div");
    state.tooltip.id = "astermode-tooltip";
    state.tooltip.style.position = "absolute";
    state.tooltip.style.background = "#16a34a";
    state.tooltip.style.color = "#fff";
    state.tooltip.style.padding = "4px 8px";
    state.tooltip.style.borderRadius = "999px";
    state.tooltip.style.fontSize = "12px";
    state.tooltip.style.fontWeight = "600";
    state.tooltip.style.zIndex = "10002";
    state.tooltip.style.display = "none";

    state.classContextBox = document.createElement("div");
    state.classContextBox.id = "astermode-class-context";
    state.classContextBox.style.position = "fixed";
    state.classContextBox.style.maxWidth = "min(480px, calc(100vw - 24px))";
    state.classContextBox.style.background = "#fbfdff";
    state.classContextBox.style.color = "#111827";
    state.classContextBox.style.border = "1px solid #dbe3ee";
    state.classContextBox.style.borderRadius = "12px";
    state.classContextBox.style.padding = "10px";
    state.classContextBox.style.fontSize = "12px";
    state.classContextBox.style.fontFamily = "Inter, Segoe UI, Roboto, Arial, sans-serif";
    state.classContextBox.style.zIndex = "10003";
    state.classContextBox.style.display = "none";
    state.classContextBox.style.wordBreak = "break-word";
    state.classContextBox.style.width = "min(560px, calc(100vw - 24px))";
    state.classContextBox.style.boxShadow = "0 14px 40px rgba(15, 23, 42, 0.2)";
    state.classContextBox.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<div style="display:flex;align-items:center;gap:6px;">' +
      getAsterIconSvg("#16a34a") +
      '<strong style="font-size:12px;letter-spacing:0.2px;">Live HTML Editor</strong>' +
      "</div>" +
      '<button data-action="close" type="button" style="border:1px solid #dbe3ee;border-radius:8px;background:#fff;color:#6b7280;cursor:pointer;font-size:12px;line-height:1;height:24px;padding:0 8px;">Close</button>' +
      "</div>" +
      '<div data-role="code-editor-host" style="width:100%;min-height:180px;max-height:320px;overflow:auto;border:1px solid #dbe3ee;border-radius:10px;background:#f8fafc;"></div>' +
      '<textarea data-role="code-editor-fallback" spellcheck="false" style="display:none;width:100%;min-height:180px;max-height:320px;resize:vertical;overflow:auto;border:1px solid #dbe3ee;border-radius:10px;padding:10px;background:#f8fafc;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.5;color:#0f172a;"></textarea>' +
      '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">' +
      '<button data-action="apply" type="button" style="height:30px;border:1px solid #16a34a;border-radius:8px;background:#16a34a;color:#fff;padding:0 12px;cursor:pointer;font-weight:600;">Apply</button>' +
      '<button data-action="cancel" type="button" style="height:30px;border:1px solid #dbe3ee;border-radius:8px;background:#fff;color:#374151;padding:0 12px;cursor:pointer;">Cancel</button>' +
      "</div>";
    const fallbackEditor = state.classContextBox.querySelector('[data-role="code-editor-fallback"]');
    if (fallbackEditor instanceof HTMLTextAreaElement) {
      fallbackEditor.addEventListener("input", () => setEditorCodeText(fallbackEditor.value));
      fallbackEditor.addEventListener("paste", (event) => {
        event.preventDefault();
        const text = (event.clipboardData && event.clipboardData.getData("text/plain")) || "";
        const start = fallbackEditor.selectionStart != null ? fallbackEditor.selectionStart : 0;
        const end = fallbackEditor.selectionEnd != null ? fallbackEditor.selectionEnd : 0;
        const nextValue = fallbackEditor.value.slice(0, start) + text + fallbackEditor.value.slice(end);
        fallbackEditor.value = nextValue;
        fallbackEditor.selectionStart = fallbackEditor.selectionEnd = start + text.length;
      });
    }
    state.classContextBox.addEventListener("click", (event) => {
      event.stopPropagation();
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.dataset.action;
      if (action === "apply") applyHtmlEdit();
      if (action === "cancel" || action === "close") hideClassContextBox();
    });

    host.appendChild(state.trigger);
    host.appendChild(state.panel);
    host.appendChild(state.tooltip);
    host.appendChild(state.classContextBox);

    state.trigger.addEventListener("mousedown", state.handlers.onMouseDown);
    state.trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!state.moved) togglePanel(true);
    });
    setCacheDisabled(state.cacheDisabled);
    try {
      togglePanel(localStorage.getItem(PANEL_OPEN_STORAGE_KEY) === "1");
    } catch (error) {
      togglePanel(false);
    }
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "auto") {
        state.themeMode = savedTheme;
      }
    } catch (error) {
      state.themeMode = "auto";
    }
    if (window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", () => {
          if (state.themeMode === "auto") applyThemeStyles();
        });
      }
    }
    applyThemeStyles();
  }

  state.handlers.onMouseMove = onMouseMove;
  state.handlers.onMouseUp = onMouseUp;
  state.handlers.onMouseDown = onMouseDown;
  state.handlers.addHoverEffect = addHoverEffect;
  state.handlers.removeHoverEffect = removeHoverEffect;
  state.handlers.onElementContextMenu = onElementContextMenu;
  state.handlers.hidePanel = hidePanel;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enable, { once: true });
  } else {
    enable();
  }
})();
`;

export interface AsterModeOptions {
  enabled?: boolean;
  cacheBypassDefault?: boolean;
}

interface ViteConfigResolved {
  command: "build" | "serve";
}

interface HtmlTagDescriptor {
  tag: string;
  attrs?: Record<string, string>;
  children?: string;
  injectTo?: "head" | "body" | "head-prepend" | "body-prepend";
}

interface TransformIndexHtmlResult {
  html: string;
  tags: HtmlTagDescriptor[];
}

export interface VitePluginLike {
  name: string;
  apply?: "serve" | "build";
  enforce?: "pre" | "post";
  configResolved?: (config: ViteConfigResolved) => void;
  transformIndexHtml?: (html: string) => string | TransformIndexHtmlResult;
}

export default function astermode(options: AsterModeOptions = {}): VitePluginLike {
  const { enabled = true, cacheBypassDefault = false } = options;
  let isServe = false;

  return {
    name: "astermode",
    apply: "serve",
    enforce: "post",
    configResolved(config: ViteConfigResolved) {
      isServe = config.command === "serve";
    },
    transformIndexHtml(html: string): string | TransformIndexHtmlResult {
      if (!enabled || !isServe) {
        return html;
      }

      const runtimeScript = RUNTIME_SCRIPT.replace(/__CACHE_BYPASS_DEFAULT__/g, String(cacheBypassDefault));

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: { type: "module" },
            children: runtimeScript,
            injectTo: "body"
          }
        ]
      };
    }
  };
}
