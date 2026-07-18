(function () {
  const cards = Array.from(document.querySelectorAll(".launch-card"));
  const deck = document.querySelector("[data-launch-deck]");
  const dots = document.querySelector("[data-launch-dots]");
  const counter = document.querySelector("[data-launch-counter]");
  const currentPng = document.querySelector("[data-download-png]");
  const videoLink = document.querySelector("[data-download-video]");
  const params = new URLSearchParams(location.search);
  let current = Math.max(0, Math.min(cards.length - 1, Number(params.get("card") || 1) - 1));
  let config = null;
  let serverAvailable = false;

  document.documentElement.dataset.export = params.get("export") === "1" ? "1" : "0";
  document.documentElement.dataset.video = params.get("video") === "1" ? "1" : "0";

  function toast(message) {
    const element = document.createElement("div");
    element.className = "launch-toast";
    element.textContent = message;
    document.body.appendChild(element);
    setTimeout(() => element.remove(), 1800);
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.originalLabel;
  }

  function show(index) {
    current = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => card.classList.toggle("is-active", cardIndex === current));
    if (dots) Array.from(dots.children).forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === current));
    if (counter) counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  }

  function updateScale() {
    if (deck) deck.style.setProperty("--launch-scale", deck.clientWidth / 1080);
  }

  if (dots) {
    cards.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.className = "launch-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `第 ${index + 1} 张`);
      dot.addEventListener("click", () => show(index));
      dots.appendChild(dot);
    });
  }

  document.querySelector("[data-launch-prev]")?.addEventListener("click", () => show(current - 1));
  document.querySelector("[data-launch-next]")?.addEventListener("click", () => show(current + 1));
  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
  window.addEventListener("resize", updateScale);

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      if (!target) return;
      try { await navigator.clipboard.writeText(target.textContent); toast("已复制"); }
      catch (_) {
        const range = document.createRange();
        range.selectNodeContents(target);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        toast("已选中文本");
      }
    });
  });

  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const imageInput = document.createElement("input");
  imageInput.type = "file";
  imageInput.accept = "image/png,image/jpeg,image/webp,image/gif";
  imageInput.hidden = true;
  document.body.appendChild(imageInput);
  let imageTarget = null;
  let imageOriginalSrc = "";

  document.querySelectorAll("[data-replaceable-image]").forEach((image) => {
    image.title = "点击替换图片";
    image.addEventListener("click", () => {
      if (document.documentElement.dataset.export === "1") return;
      imageTarget = image;
      imageOriginalSrc = image.getAttribute("src") || "";
      imageInput.value = "";
      imageInput.click();
    });
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file || !imageTarget) return;
    const dataUrl = await readFile(file);
    imageTarget.src = dataUrl;
    if (!serverAvailable) return toast("图片仅在当前会话替换");
    const response = await fetch("/api/upload/image", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fileName: file.name, originalSrc: imageOriginalSrc, dataUrl})});
    const result = await response.json();
    if (!response.ok) return toast(result.error || "图片保存失败");
    imageTarget.src = result.src;
    toast(`已保存 ${result.src}`);
  });

  function setupAudioManager() {
    const host = document.querySelector("[data-audio-manager]");
    if (!host) return;
    const input = host.querySelector("input[type=file]");
    const player = host.querySelector("audio");
    const name = host.querySelector("[data-audio-name]");
    host.querySelector("[data-audio-upload]")?.addEventListener("click", () => input.click());
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      player.src = URL.createObjectURL(file);
      player.hidden = false;
      name.textContent = file.name;
      if (!serverAvailable) return toast("音频可试听，但未持久化");
      const dataUrl = await readFile(file);
      const response = await fetch("/api/upload/audio", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({fileName: file.name, dataUrl})});
      const result = await response.json();
      if (!response.ok) return toast(result.error || "音频保存失败");
      player.src = result.src;
      name.textContent = result.src;
      config.video.audio = result.src;
      toast("背景音乐已保存并写入配置");
    });
    if (config?.video?.audio) {
      player.src = config.video.audio;
      player.hidden = false;
      name.textContent = config.video.audio;
    }
  }

  async function runExport(button, endpoint, busyLabel) {
    if (!serverAvailable) return toast("请使用 npm run serve 启动工作台");
    setBusy(button, true, busyLabel);
    try {
      const response = await fetch(endpoint, {method: "POST"});
      const result = await response.json();
      if (!response.ok) throw new Error(result.details || result.error);
      if (endpoint.endsWith("video") && videoLink) {
        const relative = result.output.replace(config.projectRoot || "", "").replace(/^\/+/, "");
        videoLink.href = relative || config.video.output;
        videoLink.hidden = false;
      }
      if (endpoint.endsWith("png") && currentPng && result.archive) {
        currentPng.href = result.archive;
        currentPng.download = result.archiveName || "launch-cards.zip";
        currentPng.hidden = false;
        currentPng.click();
      }
      toast(endpoint.endsWith("video") ? "视频导出完成" : "PNG 导出完成");
    } catch (error) { toast(error.message || "导出失败"); }
    finally { setBusy(button, false); }
  }

  const pngButton = document.querySelector("[data-export-png]");
  const videoButton = document.querySelector("[data-export-video]");
  pngButton?.addEventListener("click", () => runExport(pngButton, "/api/export/png", "生成中…"));
  videoButton?.addEventListener("click", () => runExport(videoButton, "/api/export/video", "渲染中…"));

  fetch("/api/health", {cache: "no-store"})
    .then((response) => response.json().then((body) => ({ok: response.ok, body})))
    .then(({ok, body}) => {
      serverAvailable = ok;
      config = body.config;
      config.projectRoot = body.projectRoot;
      if (videoLink && config.video?.output) {
        videoLink.href = config.video.output;
        videoLink.hidden = !serverAvailable;
      }
      if (currentPng) currentPng.hidden = true;
      setupAudioManager();
      show(current);
    })
    .catch(() => {
      config = window.LAUNCH_CONFIG || {cards: {outputDirectory: "previews", prefix: "card"}, video: {}};
      setupAudioManager();
      show(current);
    });

  updateScale();
  show(current);
})();
