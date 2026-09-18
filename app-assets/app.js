(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const els = {
    fileInput: $('fileInput'),
    dropZone: $('dropZone'),
    fileList: $('fileList'),
    clearBtn: $('clearBtn'),
    previewCanvas: $('previewCanvas'),
    canvasStage: $('canvasStage'),
    emptyState: $('emptyState'),
    imageMeta: $('imageMeta'),
    presetSelect: $('presetSelect'),
    widthInput: $('widthInput'),
    heightInput: $('heightInput'),
    swapBtn: $('swapBtn'),
    backgroundInput: $('backgroundInput'),
    backgroundText: $('backgroundText'),
    formatSelect: $('formatSelect'),
    qualityGroup: $('qualityGroup'),
    qualityRange: $('qualityRange'),
    qualityValue: $('qualityValue'),
    zoomRange: $('zoomRange'),
    zoomValue: $('zoomValue'),
    centerBtn: $('centerBtn'),
    resetBtn: $('resetBtn'),
    downloadBtn: $('downloadBtn'),
    downloadAllBtn: $('downloadAllBtn'),
    validationSize: $('validationSize'),
  };

  const state = {
    items: [],
    activeId: null,
    fit: 'cover',
    width: 1320,
    height: 2868,
    background: '#FFFFFF',
    format: 'png',
    quality: 0.92,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragOriginX: 0,
    dragOriginY: 0,
  };

  const activeItem = () => state.items.find((item) => item.id === state.activeId) || null;
  const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const clampInt = (value, fallback) => {
    const n = Math.round(Number(value));
    return Number.isFinite(n) && n > 0 ? Math.min(n, 10000) : fallback;
  };

  function baseName(filename) {
    return filename.replace(/\.[^.]+$/, '');
  }

  async function addFiles(fileList) {
    const files = [...fileList].filter((file) => /^image\/(png|jpeg|webp)$/.test(file.type));
    for (const file of files) {
      try {
        const url = URL.createObjectURL(file);
        const img = await loadImage(url);
        state.items.push({ id: uid(), file, url, img, width: img.naturalWidth, height: img.naturalHeight });
      } catch (error) {
        console.error('이미지를 불러오지 못했습니다:', file.name, error);
      }
    }
    if (!state.activeId && state.items.length) state.activeId = state.items[0].id;
    resetTransform();
    renderAll();
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function removeItem(id) {
    const index = state.items.findIndex((item) => item.id === id);
    if (index < 0) return;
    const [removed] = state.items.splice(index, 1);
    URL.revokeObjectURL(removed.url);
    if (state.activeId === id) {
      state.activeId = state.items[index]?.id || state.items[index - 1]?.id || null;
      resetTransform();
    }
    renderAll();
  }

  function clearItems() {
    state.items.forEach((item) => URL.revokeObjectURL(item.url));
    state.items = [];
    state.activeId = null;
    resetTransform();
    renderAll();
  }

  function selectItem(id) {
    if (state.activeId === id) return;
    state.activeId = id;
    resetTransform();
    renderAll();
  }

  function resetTransform() {
    state.zoom = 1;
    state.offsetX = 0;
    state.offsetY = 0;
    els.zoomRange.value = '1';
    els.zoomValue.value = '100%';
  }

  function renderFileList() {
    els.fileList.innerHTML = '';
    for (const item of state.items) {
      const row = document.createElement('div');
      row.className = `file-item${item.id === state.activeId ? ' active' : ''}`;
      row.innerHTML = `
        <img class="file-thumb" src="${item.url}" alt="" />
        <div class="file-copy">
          <span class="file-name"></span>
          <span class="file-dim">${item.width} × ${item.height}</span>
        </div>
        <button class="file-remove" type="button" aria-label="삭제">×</button>
      `;
      row.querySelector('.file-name').textContent = item.file.name;
      row.addEventListener('click', () => selectItem(item.id));
      row.querySelector('.file-remove').addEventListener('click', (event) => {
        event.stopPropagation();
        removeItem(item.id);
      });
      els.fileList.appendChild(row);
    }
  }

  function getFitScale(item, fit = state.fit) {
    const sx = state.width / item.width;
    const sy = state.height / item.height;
    if (fit === 'contain') return Math.min(sx, sy);
    if (fit === 'cover') return Math.max(sx, sy);
    return 1;
  }

  function computeDrawRect(item) {
    if (state.fit === 'stretch') {
      return { x: 0, y: 0, width: state.width, height: state.height };
    }
    const scale = getFitScale(item) * state.zoom;
    const width = item.width * scale;
    const height = item.height * scale;
    return {
      x: (state.width - width) / 2 + state.offsetX,
      y: (state.height - height) / 2 + state.offsetY,
      width,
      height,
    };
  }

  function renderCanvas() {
    const item = activeItem();
    const canvas = els.previewCanvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = state.width;
    canvas.height = state.height;

    ctx.save();
    ctx.fillStyle = state.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (item) {
      const rect = computeDrawRect(item);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(item.img, rect.x, rect.y, rect.width, rect.height);
    }
    ctx.restore();

    els.canvasStage.classList.toggle('empty', !item);
    els.emptyState.classList.toggle('hidden', Boolean(item));
    els.previewCanvas.classList.toggle('hidden', !item);
    els.imageMeta.textContent = item ? `${item.width} × ${item.height} · ${item.file.name}` : '이미지를 선택하세요';
    [els.zoomRange, els.centerBtn, els.resetBtn, els.downloadBtn].forEach((el) => { el.disabled = !item; });
    els.downloadAllBtn.disabled = state.items.length === 0;
  }

  function renderSettings() {
    els.widthInput.value = state.width;
    els.heightInput.value = state.height;
    els.backgroundInput.value = state.background.toLowerCase();
    els.backgroundText.value = state.background.toUpperCase();
    els.formatSelect.value = state.format;
    els.qualityRange.value = String(state.quality);
    els.qualityValue.value = `${Math.round(state.quality * 100)}%`;
    els.qualityGroup.classList.toggle('hidden', state.format !== 'jpeg');
    els.validationSize.textContent = `${state.width} × ${state.height}`;
    const checked = document.querySelector(`input[name="fit"][value="${state.fit}"]`);
    if (checked) checked.checked = true;
  }

  function renderAll() {
    renderFileList();
    renderSettings();
    renderCanvas();
  }

  function matchPreset() {
    const options = [...els.presetSelect.options];
    const match = options.find((opt) => Number(opt.dataset.width) === state.width && Number(opt.dataset.height) === state.height);
    els.presetSelect.value = match ? match.value : 'custom';
  }

  function setSize(width, height, preservePreset = false) {
    state.width = clampInt(width, state.width);
    state.height = clampInt(height, state.height);
    resetTransform();
    if (!preservePreset) matchPreset();
    renderAll();
  }

  function isHexColor(value) {
    return /^#[0-9a-fA-F]{6}$/.test(value);
  }

  function setBackground(value) {
    if (!isHexColor(value)) return;
    state.background = value.toUpperCase();
    renderAll();
  }

  function exportCanvasFor(item) {
    const canvas = document.createElement('canvas');
    canvas.width = state.width;
    canvas.height = state.height;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = state.background;
    ctx.fillRect(0, 0, state.width, state.height);

    if (state.fit === 'stretch') {
      ctx.drawImage(item.img, 0, 0, state.width, state.height);
    } else {
      const scale = getFitScale(item) * (item.id === state.activeId ? state.zoom : 1);
      const width = item.width * scale;
      const height = item.height * scale;
      const offsetX = item.id === state.activeId ? state.offsetX : 0;
      const offsetY = item.id === state.activeId ? state.offsetY : 0;
      const x = (state.width - width) / 2 + offsetX;
      const y = (state.height - height) / 2 + offsetY;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(item.img, x, y, width, height);
    }
    return canvas;
  }

  function canvasToBlob(canvas) {
    const mime = state.format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return new Promise((resolve) => canvas.toBlob(resolve, mime, state.quality));
  }

  async function downloadItem(item, delay = 0) {
    const canvas = exportCanvasFor(item);
    const blob = await canvasToBlob(canvas);
    if (!blob) throw new Error('이미지를 생성하지 못했습니다.');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = state.format === 'jpeg' ? 'jpg' : 'png';
    a.href = url;
    a.download = `${baseName(item.file.name)}_${state.width}x${state.height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    URL.revokeObjectURL(url);
  }

  function pointerToOutput(event) {
    const rect = els.previewCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (state.width / rect.width),
      y: (event.clientY - rect.top) * (state.height / rect.height),
    };
  }

  // Files
  els.fileInput.addEventListener('change', (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  });
  ['dragenter', 'dragover'].forEach((name) => els.dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    els.dropZone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach((name) => els.dropZone.addEventListener(name, (event) => {
    event.preventDefault();
    els.dropZone.classList.remove('dragover');
  }));
  els.dropZone.addEventListener('drop', (event) => addFiles(event.dataTransfer.files));
  els.clearBtn.addEventListener('click', clearItems);

  // Presets and size
  els.presetSelect.addEventListener('change', () => {
    const option = els.presetSelect.selectedOptions[0];
    if (option.value === 'custom') return;
    setSize(option.dataset.width, option.dataset.height, true);
  });
  els.widthInput.addEventListener('change', () => setSize(els.widthInput.value, state.height));
  els.heightInput.addEventListener('change', () => setSize(state.width, els.heightInput.value));
  els.swapBtn.addEventListener('click', () => setSize(state.height, state.width));

  // Fit and transforms
  document.querySelectorAll('input[name="fit"]').forEach((input) => input.addEventListener('change', () => {
    state.fit = input.value;
    resetTransform();
    renderAll();
  }));
  els.zoomRange.addEventListener('input', () => {
    state.zoom = Number(els.zoomRange.value);
    els.zoomValue.value = `${Math.round(state.zoom * 100)}%`;
    renderCanvas();
  });
  els.centerBtn.addEventListener('click', () => {
    state.offsetX = 0;
    state.offsetY = 0;
    renderCanvas();
  });
  els.resetBtn.addEventListener('click', () => {
    resetTransform();
    renderAll();
  });

  // Canvas drag
  els.previewCanvas.addEventListener('pointerdown', (event) => {
    if (!activeItem() || state.fit === 'stretch') return;
    const p = pointerToOutput(event);
    state.dragging = true;
    state.dragStartX = p.x;
    state.dragStartY = p.y;
    state.dragOriginX = state.offsetX;
    state.dragOriginY = state.offsetY;
    els.previewCanvas.classList.add('dragging');
    els.previewCanvas.setPointerCapture(event.pointerId);
  });
  els.previewCanvas.addEventListener('pointermove', (event) => {
    if (!state.dragging) return;
    const p = pointerToOutput(event);
    state.offsetX = state.dragOriginX + (p.x - state.dragStartX);
    state.offsetY = state.dragOriginY + (p.y - state.dragStartY);
    renderCanvas();
  });
  const endDrag = (event) => {
    if (!state.dragging) return;
    state.dragging = false;
    els.previewCanvas.classList.remove('dragging');
    if (event.pointerId !== undefined && els.previewCanvas.hasPointerCapture(event.pointerId)) {
      els.previewCanvas.releasePointerCapture(event.pointerId);
    }
  };
  els.previewCanvas.addEventListener('pointerup', endDrag);
  els.previewCanvas.addEventListener('pointercancel', endDrag);

  // Background, format, quality
  els.backgroundInput.addEventListener('input', () => setBackground(els.backgroundInput.value));
  els.backgroundText.addEventListener('change', () => {
    if (isHexColor(els.backgroundText.value)) setBackground(els.backgroundText.value);
    else els.backgroundText.value = state.background;
  });
  els.formatSelect.addEventListener('change', () => {
    state.format = els.formatSelect.value;
    renderSettings();
  });
  els.qualityRange.addEventListener('input', () => {
    state.quality = Number(els.qualityRange.value);
    els.qualityValue.value = `${Math.round(state.quality * 100)}%`;
  });

  // Download
  els.downloadBtn.addEventListener('click', async () => {
    const item = activeItem();
    if (!item) return;
    els.downloadBtn.disabled = true;
    try { await downloadItem(item); }
    finally { els.downloadBtn.disabled = false; }
  });
  els.downloadAllBtn.addEventListener('click', async () => {
    if (!state.items.length) return;
    els.downloadAllBtn.disabled = true;
    try {
      for (const item of state.items) await downloadItem(item, 180);
    } finally {
      els.downloadAllBtn.disabled = false;
    }
  });

  window.addEventListener('beforeunload', () => state.items.forEach((item) => URL.revokeObjectURL(item.url)));
  renderAll();
})();
