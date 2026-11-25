/**
 * Interactive Animated Whiteboard Engine
 * Logical board dimensions: 1000 x 620.
 * Supports animated stroke-by-stroke AI primitives, mathematical function plotting,
 * physics motion simulations, student freehand drawing, pan/zoom, and PNG export.
 */
class WhiteboardEngine {
  constructor(stageEl, aiCanvas, studentCanvas, penCursorEl) {
    this.stage = stageEl;
    this.aiCanvas = aiCanvas;
    this.studentCanvas = studentCanvas;
    this.aiCtx = aiCanvas.getContext('2d');
    this.studentCtx = studentCanvas.getContext('2d');
    this.penCursor = penCursorEl;

    this.LOGICAL_W = 1000;
    this.LOGICAL_H = 620;

    // Viewport transform
    this.view = { scale: 1, offsetX: 0, offsetY: 0, userZoom: 1, panX: 0, panY: 0 };

    // AI lesson state
    this.committedItems = []; // Items fully drawn in previous or completed steps
    this.activeItem = null;
    this.activeProgress = 1;
    this.overlayCallouts = []; // Temporary or added interruption callouts
    this.uploadedImage = null;
    this.animFrameId = null;
    this.isAnimating = false;
    this.liveLoopItems = []; // Items with continuous motion (e.g., projectile simulation)

    // Student drawing state
    this.tool = 'pointer'; // pointer | pen | highlighter | laser | eraser
    this.studentColor = '#E85D3F';
    this.studentStrokes = [];
    this.activeStudentStroke = null;
    this.laserTrail = [];
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.onZoomChange = null;

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this._bindStudentEvents();
    this._startRenderLoop();
  }

  resize() {
    const rect = this.stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;

    [this.aiCanvas, this.studentCanvas].forEach((canvas) => {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    });

    this.stageW = rect.width;
    this.stageH = rect.height;
    this.dpr = dpr;
    this._computeFitTransform();
    this.renderAI();
    this.renderStudent();
  }

  _computeFitTransform() {
    const padX = 20;
    const padTop = 34;
    const padBottom = 64; // Reserve space for floating student drawing toolbar
    const availW = Math.max(200, this.stageW - padX * 2);
    const availH = Math.max(200, this.stageH - padTop - padBottom);
    const baseScale = Math.min(availW / this.LOGICAL_W, availH / this.LOGICAL_H);
    const scale = baseScale * this.view.userZoom;
    const offsetX = (this.stageW - this.LOGICAL_W * scale) / 2 + this.view.panX;
    const offsetY = padTop + (availH - this.LOGICAL_H * scale) / 2 + this.view.panY;
    this.view.scale = scale;
    this.view.offsetX = offsetX;
    this.view.offsetY = offsetY;
  }

  screenToLogical(clientX, clientY) {
    const rect = this.stage.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: (sx - this.view.offsetX) / this.view.scale,
      y: (sy - this.view.offsetY) / this.view.scale,
    };
  }

  logicalToScreen(lx, ly) {
    return {
      x: lx * this.view.scale + this.view.offsetX,
      y: ly * this.view.scale + this.view.offsetY,
    };
  }

  setTool(tool) {
    this.tool = tool;
    this.studentCanvas.classList.toggle('drawing-mode', tool !== 'pointer');
  }

  setStudentColor(color) {
    this.studentColor = color;
  }

  clearStudentStrokes() {
    this.studentStrokes = [];
    this.renderStudent();
  }

  resetView() {
    this.view.userZoom = 1;
    this.view.panX = 0;
    this.view.panY = 0;
    this._computeFitTransform();
    this.renderAI();
    this.renderStudent();
    if (this.onZoomChange) this.onZoomChange(100);
  }

  setUploadedImage(dataUrl) {
    if (!dataUrl) {
      this.uploadedImage = null;
      this.renderAI();
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.uploadedImage = img;
      this.renderAI();
    };
    img.src = dataUrl;
  }

  clearBoard() {
    this.stopAnimation();
    this.committedItems = [];
    this.activeItem = null;
    this.overlayCallouts = [];
    this.liveLoopItems = [];
    this.hidePenCursor();
    this.renderAI();
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this._cancelAnim) {
      this._cancelAnim();
      this._cancelAnim = null;
    }
    this.hidePenCursor();
  }

  /**
   * Immediately render steps 0..stepIndex-1, then animate stepIndex.
   */
  async playStep(steps, stepIndex, { instant = false, speed = 1 } = {}) {
    this.stopAnimation();
    this.committedItems = [];
    this.liveLoopItems = [];
    this.activeItem = null;

    for (let i = 0; i < stepIndex; i++) {
      const items = steps[i]?.draw || [];
      for (const item of items) {
        if (item.clearBefore) {
          this.committedItems = [];
          this.liveLoopItems = [];
        }
        this.committedItems.push(item);
        if (item.type === 'projectileDemo' || item.type === 'orbitDiagram') {
          this.liveLoopItems.push(item);
        }
      }
    }

    const currentItems = steps[stepIndex]?.draw || [];
    if (instant) {
      for (const item of currentItems) {
        if (item.clearBefore) {
          this.committedItems = [];
          this.liveLoopItems = [];
        }
        this.committedItems.push(item);
        if (item.type === 'projectileDemo' || item.type === 'orbitDiagram') {
          this.liveLoopItems.push(item);
        }
      }
      this.renderAI();
      return;
    }

    this.isAnimating = true;
    for (const item of currentItems) {
      if (!this.isAnimating) break;
      if (item.clearBefore) {
        this.committedItems = [];
        this.liveLoopItems = [];
      }
      await this._animateSingleItem(item, speed);
      if (!this.isAnimating) break;
      this.committedItems.push(item);
      if (item.type === 'projectileDemo' || item.type === 'orbitDiagram') {
        this.liveLoopItems.push(item);
      }
      this.activeItem = null;
    }
    this.hidePenCursor();
    this.isAnimating = false;
    this.renderAI();
  }

  async addCalloutItems(items, speed = 1.1) {
    this.isAnimating = true;
    for (const item of items) {
      if (!this.isAnimating) break;
      await this._animateSingleItem(item, speed);
      this.overlayCallouts.push(item);
      this.activeItem = null;
    }
    this.hidePenCursor();
    this.isAnimating = false;
    this.renderAI();
  }

  _animateSingleItem(item, speed) {
    return new Promise((resolve) => {
      const baseDuration = item.duration || this._defaultDuration(item);
      const duration = Math.max(180, baseDuration / Math.max(0.5, speed));
      const startTime = performance.now();
      let cancelled = false;
      this._cancelAnim = () => {
        cancelled = true;
        resolve();
      };

      const tick = (now) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - startTime) / duration);
        // Smooth easeOutCubic for natural marker strokes
        const p = 1 - Math.pow(1 - raw, 2.2);
        this.activeItem = item;
        this.activeProgress = p;
        this.renderAI();
        this._updatePenCursorForItem(item, p);

        if (raw < 1) {
          requestAnimationFrame(tick);
        } else {
          this._cancelAnim = null;
          resolve();
        }
      };
      requestAnimationFrame(tick);
    });
  }

  _defaultDuration(item) {
    switch (item.type) {
      case 'text':
      case 'title':
        return Math.min(900, Math.max(320, (item.text?.length || 8) * 32));
      case 'functionPlot':
        return 1150;
      case 'projectileDemo':
      case 'orbitDiagram':
      case 'punnettSquare':
      case 'balanceScale':
        return 950;
      case 'box':
      case 'rect':
      case 'circle':
        return 520;
      default:
        return 460;
    }
  }

  _updatePenCursorForItem(item, p) {
    if (!this.penCursor) return;
    let pt = null;
    if (item.type === 'line' || item.type === 'arrow' || item.type === 'dashed') {
      pt = {
        x: item.x1 + (item.x2 - item.x1) * p,
        y: item.y1 + (item.y2 - item.y1) * p,
      };
    } else if (item.type === 'curve' && item.points?.length) {
      const idx = Math.min(item.points.length - 1, Math.floor(p * (item.points.length - 1)));
      pt = { x: item.points[idx][0], y: item.points[idx][1] };
    } else if (item.type === 'circle') {
      const ang = -Math.PI / 2 + Math.PI * 2 * p;
      pt = { x: item.cx + Math.cos(ang) * item.r, y: item.cy + Math.sin(ang) * item.r };
    } else if (item.type === 'box' || item.type === 'rect') {
      pt = { x: item.x + item.w * p, y: item.y + item.h * 0.2 };
    } else if (item.x !== undefined && item.y !== undefined) {
      pt = { x: item.x + Math.min(220, (item.text?.length || 4) * 12) * p, y: item.y + 8 };
    }

    if (!pt) {
      this.hidePenCursor();
      return;
    }
    const screen = this.logicalToScreen(pt.x, pt.y);
    this.penCursor.classList.remove('hidden');
    this.penCursor.style.left = `${screen.x}px`;
    this.penCursor.style.top = `${screen.y}px`;
  }

  hidePenCursor() {
    if (this.penCursor) this.penCursor.classList.add('hidden');
  }

  _startRenderLoop() {
    const loop = () => {
      if (this.liveLoopItems.length && !this.isAnimating) {
        this.renderAI();
      }
      if (this.laserTrail.length) {
        const now = performance.now();
        this.laserTrail = this.laserTrail.filter((pt) => now - pt.t < 700);
        this.renderStudent();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  renderAI() {
    const ctx = this.aiCtx;
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.aiCanvas.width, this.aiCanvas.height);

    ctx.setTransform(
      this.dpr * this.view.scale,
      0,
      0,
      this.dpr * this.view.scale,
      this.dpr * this.view.offsetX,
      this.dpr * this.view.offsetY
    );

    // If student uploaded an image, show a pinned reference card on top-right
    if (this.uploadedImage) {
      this._drawPinnedImage(ctx, this.uploadedImage);
    }

    for (const item of this.committedItems) {
      this._drawPrimitive(ctx, item, 1);
    }
    for (const item of this.overlayCallouts) {
      this._drawPrimitive(ctx, item, 1);
    }
    if (this.activeItem) {
      this._drawPrimitive(ctx, this.activeItem, this.activeProgress);
    }
    ctx.restore();
  }

  _drawPinnedImage(ctx, img) {
    const maxW = 210;
    const maxH = 150;
    const ratio = Math.min(maxW / img.width, maxH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = this.LOGICAL_W - w - 24;
    const y = 20;

    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(27,27,31,0.12)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.roundRect(x - 6, y - 6, w + 12, h + 28, 10);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(27,27,31,0.15)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.drawImage(img, x, y, w, h);
    ctx.fillStyle = '#53535D';
    ctx.font = '600 11px Inter, Noto Sans TC, sans-serif';
    ctx.fillText('📎 學生上傳教材', x + 2, y + h + 15);
    ctx.restore();
  }

  _drawPrimitive(ctx, item, p) {
    ctx.save();
    const color = item.color || '#1B1B1F';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (item.type) {
      case 'title':
      case 'text': {
        const isTitle = item.type === 'title';
        const size = item.size || (isTitle ? 26 : 18);
        const weight = item.weight || (isTitle ? 800 : 600);
        const family = item.hand
          ? "'Caveat', 'Noto Sans TC', cursive"
          : item.mono
            ? "'JetBrains Mono', monospace"
            : "'Inter', 'Noto Sans TC', sans-serif";
        ctx.font = `${weight} ${size}px ${family}`;

        const full = item.text || '';
        const visibleCount = Math.max(1, Math.floor(full.length * p));
        const shown = p >= 0.99 ? full : full.slice(0, visibleCount);

        if (item.bg) {
          const metrics = ctx.measureText(full);
          const padX = 10;
          const padY = 6;
          ctx.save();
          ctx.globalAlpha = Math.min(1, p * 1.4);
          ctx.fillStyle = item.bg;
          ctx.beginPath();
          ctx.roundRect(item.x - padX, item.y - size + 2 - padY / 2, metrics.width + padX * 2, size + padY * 2, 8);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = color;
        ctx.textAlign = item.align || 'left';
        ctx.fillText(shown, item.x, item.y);

        if (item.underline && p > 0.3) {
          const w = ctx.measureText(shown).width;
          const ux = item.align === 'center' ? item.x - w / 2 : item.x;
          ctx.beginPath();
          ctx.strokeStyle = item.underlineColor || '#E85D3F';
          ctx.lineWidth = 3;
          ctx.moveTo(ux, item.y + 6);
          ctx.lineTo(ux + w * Math.min(1, (p - 0.3) / 0.7), item.y + 6);
          ctx.stroke();
        }
        break;
      }

      case 'line':
      case 'dashed':
      case 'arrow': {
        ctx.lineWidth = item.width || 2.8;
        if (item.type === 'dashed') ctx.setLineDash([8, 6]);
        const cx = item.x1 + (item.x2 - item.x1) * p;
        const cy = item.y1 + (item.y2 - item.y1) * p;
        ctx.beginPath();
        ctx.moveTo(item.x1, item.y1);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        if (item.type === 'arrow' && p > 0.75) {
          const angle = Math.atan2(item.y2 - item.y1, item.x2 - item.x1);
          const headLen = item.headLen || 12;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - headLen * Math.cos(angle - Math.PI / 6), cy - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx - headLen * Math.cos(angle + Math.PI / 6), cy - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
        if (item.label && p > 0.65) {
          ctx.font = `700 ${item.labelSize || 15}px 'Inter', 'Noto Sans TC', sans-serif`;
          ctx.fillText(item.label, (item.x1 + item.x2) / 2 + (item.lx || 8), (item.y1 + item.y2) / 2 + (item.ly || -8));
        }
        break;
      }

      case 'box':
      case 'rect': {
        ctx.lineWidth = item.width || 2.4;
        if (item.fill) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, p * 1.2) * (item.fillAlpha ?? 1);
          ctx.fillStyle = item.fill;
          ctx.beginPath();
          ctx.roundRect(item.x, item.y, item.w, item.h, item.radius || 14);
          ctx.fill();
          ctx.restore();
        }
        if (!item.noStroke) {
          const perim = 2 * (item.w + item.h);
          ctx.setLineDash([perim]);
          ctx.lineDashOffset = perim * (1 - p);
          ctx.beginPath();
          ctx.roundRect(item.x, item.y, item.w, item.h, item.radius || 14);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if (item.label && p > 0.5) {
          ctx.font = `700 ${item.labelSize || 16}px 'Inter', 'Noto Sans TC', sans-serif`;
          ctx.fillStyle = item.labelColor || color;
          ctx.fillText(item.label, item.x + 14, item.y + 28);
        }
        break;
      }

      case 'circle': {
        ctx.lineWidth = item.width || 2.8;
        if (item.fill && p > 0.4) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, (p - 0.4) / 0.6) * (item.fillAlpha ?? 0.25);
          ctx.fillStyle = item.fill;
          ctx.beginPath();
          ctx.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(item.cx, item.cy, item.r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
        ctx.stroke();
        if (item.label && p > 0.7) {
          ctx.font = `700 ${item.labelSize || 15}px 'Inter', 'Noto Sans TC', sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(item.label, item.cx, item.cy + 5);
        }
        break;
      }

      case 'curve': {
        const pts = item.points || [];
        if (pts.length < 2) break;
        ctx.lineWidth = item.width || 3.2;
        if (item.dashed) ctx.setLineDash([7, 6]);
        const maxIdx = Math.max(1, Math.floor((pts.length - 1) * p));
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i <= maxIdx; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'functionPlot': {
        this._drawFunctionPlot(ctx, item, p);
        break;
      }

      case 'projectileDemo': {
        this._drawProjectileDemo(ctx, item, p);
        break;
      }

      case 'punnettSquare': {
        this._drawPunnettSquare(ctx, item, p);
        break;
      }

      case 'balanceScale': {
        this._drawBalanceScale(ctx, item, p);
        break;
      }

      case 'orbitDiagram': {
        this._drawOrbitDiagram(ctx, item, p);
        break;
      }

      case 'callout': {
        // Callout arrow + highlighted annotation box
        const boxW = Math.min(300, Math.max(180, (item.text?.length || 10) * 14));
        const boxH = 54;
        const bx = item.bx ?? 660;
        const by = item.by ?? 470;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p * 1.4);
        ctx.fillStyle = '#FFF3F0';
        ctx.strokeStyle = '#E85D3F';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#B42318';
        ctx.font = "700 14px 'Inter', 'Noto Sans TC', sans-serif";
        ctx.fillText(item.text || '', bx + 12, by + 32);

        if (item.targetX !== undefined && item.targetY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(bx, by + boxH / 2);
          ctx.quadraticCurveTo((bx + item.targetX) / 2, by + 40, item.targetX, item.targetY);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
    }
    ctx.restore();
  }

  _drawFunctionPlot(ctx, item, p) {
    const x = item.x ?? 60;
    const y = item.y ?? 120;
    const w = item.w ?? 430;
    const h = item.h ?? 380;
    const xMin = item.xMin ?? -4;
    const xMax = item.xMax ?? 4;
    const yMin = item.yMin ?? -2;
    const yMax = item.yMax ?? 10;

    const toPx = (mx, my) => ({
      px: x + ((mx - xMin) / (xMax - xMin)) * w,
      py: y + h - ((my - yMin) / (yMax - yMin)) * h,
    });

    // Plot card frame
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = 'rgba(27,27,31,0.12)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.stroke();

    // Clip to plot box
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, w - 4, h - 4, 12);
    ctx.clip();

    // Grid lines
    ctx.strokeStyle = 'rgba(27,27,31,0.06)';
    ctx.lineWidth = 1;
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
      const { px } = toPx(gx, 0);
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + h);
      ctx.stroke();
    }
    for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy += (yMax - yMin > 12 ? 2 : 1)) {
      const { py } = toPx(0, gy);
      ctx.beginPath();
      ctx.moveTo(x, py);
      ctx.lineTo(x + w, py);
      ctx.stroke();
    }

    // Axes
    const origin = toPx(0, 0);
    ctx.strokeStyle = '#53535D';
    ctx.lineWidth = 2;
    if (origin.py >= y && origin.py <= y + h) {
      ctx.beginPath();
      ctx.moveTo(x + 8, origin.py);
      ctx.lineTo(x + w - 8, origin.py);
      ctx.stroke();
    }
    if (origin.px >= x && origin.px <= x + w) {
      ctx.beginPath();
      ctx.moveTo(origin.px, y + h - 8);
      ctx.lineTo(origin.px, y + 8);
      ctx.stroke();
    }

    // Tick numbers
    ctx.fillStyle = '#848490';
    ctx.font = "500 11px 'JetBrains Mono', monospace";
    for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
      if (gx === 0) continue;
      const { px } = toPx(gx, 0);
      ctx.fillText(String(gx), px - 4, Math.min(y + h - 8, Math.max(y + 16, origin.py + 14)));
    }

    // Evaluate mathematical curves
    const curves = item.curves || [];
    const curveProg = Math.min(1, p * 1.25);
    curves.forEach((curve) => {
      const fn = this._compileMathExpr(curve.expr);
      if (!fn) return;
      ctx.strokeStyle = curve.color || '#2E5BFF';
      ctx.lineWidth = curve.width || 3;
      if (curve.dashed) ctx.setLineDash([6, 5]);
      ctx.beginPath();
      const samples = 140;
      const maxSample = Math.floor(samples * curveProg);
      let started = false;
      for (let i = 0; i <= maxSample; i++) {
        const mx = xMin + ((xMax - xMin) * i) / samples;
        const my = fn(mx);
        if (!Number.isFinite(my) || Math.abs(my) > 1e4) {
          started = false;
          continue;
        }
        const { px, py } = toPx(mx, my);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (curve.label && curveProg > 0.7) {
        const lx = curve.labelX ?? xMax - 1.4;
        const ly = fn(lx);
        if (Number.isFinite(ly)) {
          const pos = toPx(lx, ly);
          ctx.fillStyle = curve.color || '#2E5BFF';
          ctx.font = "700 13px 'JetBrains Mono', monospace";
          ctx.fillText(curve.label, Math.min(x + w - 90, Math.max(x + 12, pos.px)), Math.max(y + 22, Math.min(y + h - 12, pos.py - 10)));
        }
      }
    });

    // Highlight points (e.g., intersections, tangent point)
    if (item.points && p > 0.65) {
      item.points.forEach((pt) => {
        const pos = toPx(pt.x, pt.y);
        ctx.fillStyle = pt.color || '#E85D3F';
        ctx.beginPath();
        ctx.arc(pos.px, pos.py, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (pt.label) {
          ctx.fillStyle = '#1B1B1F';
          ctx.font = "700 13px 'Inter', 'Noto Sans TC', sans-serif";
          ctx.fillText(pt.label, pos.px + 10, pos.py - 8);
        }
      });
    }

    ctx.restore();
  }

  _compileMathExpr(expr) {
    if (typeof expr === 'function') return expr;
    try {
      const sanitized = String(expr)
        .replace(/\^/g, '**')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs');
      return new Function('x', `return (${sanitized});`);
    } catch (_) {
      return null;
    }
  }

  _drawProjectileDemo(ctx, item, p) {
    const x = item.x ?? 60;
    const y = item.y ?? 140;
    const w = item.w ?? 460;
    const h = item.h ?? 360;

    ctx.save();
    // Table ledge + ground
    const tableY = y + 70;
    const groundY = y + h - 30;
    const dropX = x + 95;

    ctx.fillStyle = '#EFE9DA';
    ctx.fillRect(x + 10, tableY, 100, groundY - tableY);
    ctx.strokeStyle = '#1B1B1F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 10, tableY);
    ctx.lineTo(x + 110, tableY);
    ctx.lineTo(x + 110, groundY);
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + w, groundY);
    ctx.stroke();

    // Animated cycle time 0..1
    const cycle = p < 1 ? p : ((performance.now() % 2800) / 2800);
    const t = Math.min(1, cycle * 1.18);
    const dropDist = (groundY - 12 - (tableY - 12)) * (t * t);
    const ballAY = tableY - 12 + dropDist;
    const ballBX = dropX + 24 + t * 260;
    const ballBY = ballAY;

    // Horizontal equal-height dashed guide lines
    ctx.strokeStyle = 'rgba(22, 163, 74, 0.45)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(dropX - 18, ballAY);
    ctx.lineTo(ballBX, ballBY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball B parabolic trail
    ctx.strokeStyle = '#2E5BFF';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let s = 0; s <= 40; s++) {
      const ts = (s / 40) * t;
      const px = dropX + 24 + ts * 260;
      const py = tableY - 12 + (groundY - 12 - (tableY - 12)) * (ts * ts);
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Ball A (straight drop)
    ctx.fillStyle = '#E85D3F';
    ctx.beginPath();
    ctx.arc(dropX - 18, ballAY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('A', dropX - 18, ballAY + 4);

    // Ball B (horizontal throw)
    ctx.fillStyle = '#2E5BFF';
    ctx.beginPath();
    ctx.arc(ballBX, ballBY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('B', ballBX, ballBY + 4);

    // Gravity vector arrow on Ball B
    if (item.showForces !== false) {
      ctx.strokeStyle = '#E85D3F';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ballBX, ballBY + 14);
      ctx.lineTo(ballBX, ballBY + 46);
      ctx.lineTo(ballBX - 5, ballBY + 39);
      ctx.moveTo(ballBX, ballBY + 46);
      ctx.lineTo(ballBX + 5, ballBY + 39);
      ctx.stroke();
      ctx.fillStyle = '#E85D3F';
      ctx.textAlign = 'left';
      ctx.font = '700 13px Inter, Noto Sans TC, sans-serif';
      ctx.fillText('重力 g', ballBX + 8, ballBY + 38);
    }

    // Labels
    ctx.fillStyle = '#1B1B1F';
    ctx.textAlign = 'left';
    ctx.font = '700 13px Inter, Noto Sans TC, sans-serif';
    ctx.fillText('A 直接放手', x + 16, tableY - 34);
    ctx.fillText('B 水平丟出 →', dropX + 20, tableY - 34);
    if (t > 0.95) {
      ctx.fillStyle = '#16A34A';
      ctx.fillText('✓ 高度相同 → 同時落地！', x + 135, groundY + 22);
    }
    ctx.restore();
  }

  _drawPunnettSquare(ctx, item, p) {
    const x = item.x ?? 80;
    const y = item.y ?? 150;
    const cell = item.cellSize ?? 110;
    const topAlleles = item.top || ['Iᴬ', 'i'];
    const leftAlleles = item.left || ['Iᴮ', 'i'];
    const cells = item.cells || [
      ['IᴬIᴮ (AB型)', 'Iᴮi (B型)'],
      ['Iᴬi (A型)', 'ii (O型) !'],
    ];

    ctx.save();
    ctx.font = "700 18px 'Inter', 'Noto Sans TC', sans-serif";
    ctx.textAlign = 'center';

    // Header alleles
    topAlleles.forEach((a, col) => {
      ctx.fillStyle = '#2E5BFF';
      ctx.fillText(a, x + cell * (col + 0.5), y - 14);
    });
    leftAlleles.forEach((a, row) => {
      ctx.fillStyle = '#E85D3F';
      ctx.fillText(a, x - 28, y + cell * (row + 0.5) + 6);
    });

    // Grid cells
    const total = 4;
    const revealed = Math.ceil(p * total);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const idx = r * 2 + c;
        if (idx >= revealed) continue;
        const cx = x + c * cell;
        const cy = y + r * cell;
        const text = cells[r]?.[c] || '';
        const isHighlight = text.includes('!') || (item.highlightRow === r && item.highlightCol === c);

        ctx.fillStyle = isHighlight ? '#FFF1EE' : '#FFFFFF';
        ctx.strokeStyle = isHighlight ? '#E85D3F' : '#1B1B1F';
        ctx.lineWidth = isHighlight ? 2.6 : 1.8;
        ctx.beginPath();
        ctx.roundRect(cx + 3, cy + 3, cell - 6, cell - 6, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHighlight ? '#B42318' : '#1B1B1F';
        ctx.font = "700 15px 'Inter', 'Noto Sans TC', sans-serif";
        ctx.fillText(text.replace('!', '').trim(), cx + cell / 2, cy + cell / 2 + 5);
      }
    }
    ctx.restore();
  }

  _drawBalanceScale(ctx, item, p) {
    const cx = item.cx ?? 280;
    const cy = item.cy ?? 330;
    const tilt = (item.tilt ?? 0) * (Math.PI / 180) * p;

    ctx.save();
    // Fulcrum triangle
    ctx.fillStyle = '#1B1B1F';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 24, cy + 68);
    ctx.lineTo(cx + 24, cy + 68);
    ctx.closePath();
    ctx.fill();

    // Tilted beam
    ctx.translate(cx, cy);
    ctx.rotate(tilt);
    ctx.strokeStyle = '#1B1B1F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.lineTo(150, 0);
    ctx.stroke();

    // Left pan
    ctx.fillStyle = '#EEF3FF';
    ctx.strokeStyle = '#2E5BFF';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(-210, -56, 125, 48, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1B1B1F';
    ctx.font = "700 18px 'JetBrains Mono', 'Noto Sans TC', monospace";
    ctx.textAlign = 'center';
    ctx.fillText(item.left || '2x + 5', -147, -26);

    // Right pan
    ctx.fillStyle = '#FFF4EE';
    ctx.strokeStyle = '#E85D3F';
    ctx.beginPath();
    ctx.roundRect(85, -56, 125, 48, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1B1B1F';
    ctx.fillText(item.right || '17', 147, -26);

    ctx.restore();
  }

  _drawOrbitDiagram(ctx, item, p) {
    const cx = item.cx ?? 310;
    const cy = item.cy ?? 330;
    const r = item.r ?? 135;
    const t = p < 1 ? p * 0.7 : ((performance.now() % 7000) / 7000);
    const angle = -t * Math.PI * 2;

    ctx.save();
    // Sunlight rays from right
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    for (let ry = cy - 110; ry <= cy + 110; ry += 55) {
      ctx.beginPath();
      ctx.moveTo(cx + r + 95, ry);
      ctx.lineTo(cx + r + 35, ry);
      ctx.lineTo(cx + r + 43, ry - 5);
      ctx.moveTo(cx + r + 35, ry);
      ctx.lineTo(cx + r + 43, ry + 5);
      ctx.stroke();
    }
    ctx.fillStyle = '#D97706';
    ctx.font = "700 14px 'Inter', 'Noto Sans TC', sans-serif";
    ctx.fillText('☀️ 太陽光', cx + r + 42, cy - 125);

    // Moon orbit dashed circle
    ctx.strokeStyle = 'rgba(27,27,31,0.22)';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Earth in center
    ctx.fillStyle = '#2E5BFF';
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = "700 13px 'Inter', 'Noto Sans TC', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('地球', cx, cy + 5);

    // Moon orbiting
    const mx = cx + Math.cos(angle) * r;
    const my = cy + Math.sin(angle) * r;
    // Dark half
    ctx.fillStyle = '#27272F';
    ctx.beginPath();
    ctx.arc(mx, my, 16, 0, Math.PI * 2);
    ctx.fill();
    // Lit half facing sun (right side)
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(mx, my, 16, -Math.PI / 2, Math.PI / 2);
    ctx.fill();
    ctx.strokeStyle = '#1B1B1F';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(mx, my, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#1B1B1F';
    ctx.fillText('月球', mx, my + 30);
    ctx.restore();
  }

  // ==================== STUDENT DRAWING & PAN/ZOOM ====================
  _bindStudentEvents() {
    const canvas = this.studentCanvas;
    let pointerDown = false;

    canvas.addEventListener('pointerdown', (e) => {
      pointerDown = true;
      canvas.setPointerCapture(e.pointerId);

      if (this.tool === 'pointer') {
        this.isPanning = true;
        this.panStart = { x: e.clientX - this.view.panX, y: e.clientY - this.view.panY };
        canvas.style.cursor = 'grabbing';
        return;
      }

      const pt = this.screenToLogical(e.clientX, e.clientY);
      if (this.tool === 'laser') {
        this.laserTrail.push({ x: pt.x, y: pt.y, t: performance.now() });
        this.renderStudent();
        return;
      }

      if (this.tool === 'eraser') {
        this._eraseNear(pt);
        return;
      }

      this.activeStudentStroke = {
        tool: this.tool,
        color: this.studentColor,
        points: [pt],
      };
      this.renderStudent();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!pointerDown) return;
      if (this.isPanning) {
        this.view.panX = e.clientX - this.panStart.x;
        this.view.panY = e.clientY - this.panStart.y;
        this._computeFitTransform();
        this.renderAI();
        this.renderStudent();
        return;
      }

      const pt = this.screenToLogical(e.clientX, e.clientY);
      if (this.tool === 'laser') {
        this.laserTrail.push({ x: pt.x, y: pt.y, t: performance.now() });
        this.renderStudent();
        return;
      }
      if (this.tool === 'eraser') {
        this._eraseNear(pt);
        return;
      }
      if (this.activeStudentStroke) {
        this.activeStudentStroke.points.push(pt);
        this.renderStudent();
      }
    });

    const endPointer = () => {
      pointerDown = false;
      if (this.isPanning) {
        this.isPanning = false;
        canvas.style.cursor = this.tool === 'pointer' ? 'grab' : 'crosshair';
      }
      if (this.activeStudentStroke) {
        this.studentStrokes.push(this.activeStudentStroke);
        this.activeStudentStroke = null;
        this.renderStudent();
      }
    };

    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);

    // Wheel zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.92;
      this.view.userZoom = Math.min(2.2, Math.max(0.6, this.view.userZoom * factor));
      this._computeFitTransform();
      this.renderAI();
      this.renderStudent();
      if (this.onZoomChange) this.onZoomChange(Math.round(this.view.userZoom * 100));
    }, { passive: false });
  }

  _eraseNear(pt) {
    const threshold = 20;
    const before = this.studentStrokes.length;
    this.studentStrokes = this.studentStrokes.filter((stroke) =>
      !stroke.points.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < threshold)
    );
    if (this.studentStrokes.length !== before) {
      this.renderStudent();
    }
  }

  renderStudent() {
    const ctx = this.studentCtx;
    if (!ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.studentCanvas.width, this.studentCanvas.height);

    ctx.setTransform(
      this.dpr * this.view.scale,
      0,
      0,
      this.dpr * this.view.scale,
      this.dpr * this.view.offsetX,
      this.dpr * this.view.offsetY
    );

    const drawStroke = (s) => {
      if (!s.points.length) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (s.tool === 'highlighter') {
        ctx.globalAlpha = 0.32;
        ctx.lineWidth = 16;
      } else {
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 3.2;
      }
      ctx.strokeStyle = s.color;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    };

    this.studentStrokes.forEach(drawStroke);
    if (this.activeStudentStroke) drawStroke(this.activeStudentStroke);

    // Ephemeral laser pointer trail
    if (this.laserTrail.length > 1) {
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 1; i < this.laserTrail.length; i++) {
        const prev = this.laserTrail[i - 1];
        const curr = this.laserTrail[i];
        const age = (performance.now() - curr.t) / 700;
        ctx.strokeStyle = `rgba(232, 93, 63, ${Math.max(0, 1 - age)})`;
        ctx.lineWidth = 5 * (1 - age * 0.5);
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.stroke();
      }
      const head = this.laserTrail[this.laserTrail.length - 1];
      ctx.fillStyle = '#E85D3F';
      ctx.beginPath();
      ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  exportPNG(filename = 'ahaboard-notes.png') {
    const out = document.createElement('canvas');
    out.width = this.aiCanvas.width;
    out.height = this.aiCanvas.height;
    const octx = out.getContext('2d');
    octx.fillStyle = '#FFFCF4';
    octx.fillRect(0, 0, out.width, out.height);

    // Draw subtle dot grid
    const step = 24 * this.dpr;
    octx.fillStyle = 'rgba(27,27,31,0.12)';
    for (let gx = step; gx < out.width; gx += step) {
      for (let gy = step; gy < out.height; gy += step) {
        octx.beginPath();
        octx.arc(gx, gy, 1.1 * this.dpr, 0, Math.PI * 2);
        octx.fill();
      }
    }

    octx.drawImage(this.aiCanvas, 0, 0);
    octx.drawImage(this.studentCanvas, 0, 0);

    const url = out.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
}

window.WhiteboardEngine = WhiteboardEngine;
