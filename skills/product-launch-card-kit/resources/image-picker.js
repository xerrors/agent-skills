/*
 * Persistent click-to-replace image picker for the product launch card workbench.
 *
 * Behavior:
 *   - Click any matching image to open a local file picker (PNG/JPEG/WebP/GIF).
 *   - If served from http(s) and /api/health responds OK, the picker also POSTs
 *     the new image to /api/upload. The server writes the file into ./assets/
 *     and rewrites the matching src="..." attribute in every HTML file under
 *     the project root. This makes the replacement persistent across reloads
 *     and visible in subsequent PNG export runs.
 *   - On file:// or when the server is unreachable, the picker falls back to
 *     session-only in-memory replacement via FileReader (no persistence).
 *   - A short "saved" badge fades in for ~1.2s on persistent save; persistent
 *     replacements also add the .is-replaced-persistent class for styling.
 *   - Disables itself when document.documentElement.dataset.export === "1".
 *
 * Usage:
 *   <script src="resources/image-picker.js"></script>
 *   or
 *   <script>attachLaunchCardImagePicker({ selector: ".card img" });</script>
 *
 * Options:
 *   selector   CSS selector for clickable images. Default: ".card img".
 *   endpoint   Upload endpoint. Default: "/api/upload".
 *   healthPath Health probe path. Default: "/api/health".
 *   toastHost  Element to host the saved-toast. Default: document.body.
 */
(function () {
  function attachLaunchCardImagePicker(options) {
    const settings = options || {};
    const selector = settings.selector || ".card img";
    const endpoint = settings.endpoint || "/api/upload";
    const healthPath = settings.healthPath || "/api/health";
    const toastHost = settings.toastHost || document.body;

    function exportFlag() {
      return document.documentElement.dataset.export === "1";
    }

    function showToast(message, kind) {
      const toast = document.createElement("div");
      toast.className = "launch-card-save-toast" + (kind ? " is-" + kind : "");
      toast.textContent = message;
      toastHost.appendChild(toast);
      // Force reflow then fade.
      void toast.offsetWidth;
      toast.classList.add("is-visible");
      setTimeout(function () {
        toast.classList.remove("is-visible");
        setTimeout(function () { toast.remove(); }, 320);
      }, 1200);
    }

    // Probe persistence support.
    let canPersist = false;
    if (location.protocol !== "file:") {
      fetch(healthPath, { method: "GET", cache: "no-store" })
        .then(function (r) { canPersist = !!r.ok; })
        .catch(function () { canPersist = false; });
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp,image/gif";
    input.hidden = true;
    document.body.appendChild(input);

    let target = null;

    document.querySelectorAll(selector).forEach(function (image) {
      image.classList.add("showcase-replaceable-image");
      image.title = "点击选择图片";
      image.addEventListener("click", function (event) {
        if (exportFlag()) return;
        event.preventDefault();
        target = image;
        input.value = "";
        input.click();
      });
    });

    input.addEventListener("change", function () {
      const file = input.files && input.files[0];
      if (!file || !target) return;
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result;
        // Instant visual feedback via data URL.
        target.src = dataUrl;
        target.alt = file.name;
        target.classList.add("is-replaced");

        if (canPersist) {
          const originalSrc = target.getAttribute("src") || "";
          fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ originalSrc: originalSrc, imageData: dataUrl })
          })
            .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
            .then(function (res) {
              if (!res.ok || !res.body || !res.body.src) {
                showToast("保存失败：仅当前会话可见", "error");
                console.warn("persist failed:", res.body);
                return;
              }
              // Switch to the server-served file path so disk matches browser.
              target.src = res.body.src;
              target.dataset.persistedSrc = res.body.src;
              target.classList.add("is-replaced-persistent");
              showToast("已保存到 " + res.body.src, "ok");
            })
            .catch(function (err) {
              showToast("保存失败：网络错误", "error");
              console.warn("persist error:", err);
            });
        } else {
          target.dataset.persistedSrc = "";
          showToast("已替换（仅当前会话，刷新即失效）", "warn");
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // Auto-attach when included via <script src="...">.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { attachLaunchCardImagePicker(); });
  } else {
    attachLaunchCardImagePicker();
  }

  // Expose for explicit calls.
  window.attachLaunchCardImagePicker = attachLaunchCardImagePicker;
})();
