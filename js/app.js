/**
 * Main Application Controller for ahaboard AI Whiteboard Tutor.
 */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    mode: 'topic',
    lang: 'zh-TW',
    landingAttachments: [],
    chatAttachments: [],
    suggestionOffset: 0,
    lesson: null,
    stepIndex: 0,
    isPlaying: false,
    playToken: 0,
    history: loadHistory(),
  };

  const speech = new SpeechManager();
  const tutor = new TutorEngine();
  let board = null;

  // ==================== INITIALIZATION ====================
  function init() {
    renderSuggestions();
    renderHistoryBadge();
    syncSettingsModalUI();
    bindLandingEvents();
    bindClassroomEvents();
    bindModalEvents();

    speech.onSpeakStateChange = (speaking) => {
      $('#tutor-avatar')?.classList.toggle('speaking', speaking);
      $('#status-wave')?.classList.toggle('active', speaking || board?.isAnimating);
      $('#interrupt-fab')?.classList.toggle('hidden', !speaking && !state.isPlaying);
    };
  }

  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem('ahaboard_history') || '[]');
    } catch (_) {
      return [];
    }
  }

  function saveToHistory(lesson) {
    const entry = {
      id: lesson.id,
      title: lesson.title,
      subject: lesson.subject,
      mode: lesson.mode,
      savedAt: new Date().toLocaleString('zh-TW', { hour12: false }),
      lesson,
    };
    state.history = [entry, ...state.history.filter((h) => h.title !== lesson.title)].slice(0, 10);
    try {
      localStorage.setItem('ahaboard_history', JSON.stringify(state.history));
    } catch (_) {}
    renderHistoryBadge();
  }

  function renderHistoryBadge() {
    const badge = $('#history-count');
    if (!badge) return;
    badge.textContent = String(state.history.length);
    badge.classList.toggle('hidden', state.history.length === 0);
  }

  function showToast(msg) {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ==================== LANDING VIEW ====================
  function bindLandingEvents() {
    $$('.mode-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.mode-pill').forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        state.mode = btn.dataset.mode;
      });
    });

    $('#landing-lang-select').addEventListener('change', (e) => {
      state.lang = e.target.value;
      $('#studio-lang-select').value = state.lang;
      speech.setLang(state.lang);
    });

    $('#shuffle-prompts-btn').addEventListener('click', () => {
      state.suggestionOffset = (state.suggestionOffset + 4) % window.LessonLibrary.SUGGESTION_POOL.length;
      renderSuggestions();
    });

    $('#start-lesson-btn').addEventListener('click', () => {
      const prompt = $('#landing-prompt').value.trim();
      if (!prompt && !state.landingAttachments.length) {
        showToast('請輸入問題、方程式，或點下方精選課堂開始！');
        $('#landing-prompt').focus();
        return;
      }
      launchLesson({
        prompt: prompt || '請講解我上傳的教材內容',
        mode: state.mode,
        attachments: [...state.landingAttachments],
      });
    });

    $('#landing-prompt').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        $('#start-lesson-btn').click();
      }
    });

    // File uploads & drag-drop
    $('#landing-file-input').addEventListener('change', async (e) => {
      await handleFiles(e.target.files, state.landingAttachments, '#landing-attachments');
      e.target.value = '';
    });

    const card = $('#composer-card');
    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      card.classList.add('drag-over');
    });
    card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
    card.addEventListener('drop', async (e) => {
      e.preventDefault();
      card.classList.remove('drag-over');
      await handleFiles(e.dataTransfer.files, state.landingAttachments, '#landing-attachments');
    });

    // URL / Notes modal
    $('#add-url-btn').addEventListener('click', () => {
      $('#url-modal').classList.remove('hidden');
      $('#url-modal-input').focus();
    });

    $('#confirm-url-btn').addEventListener('click', () => {
      const url = $('#url-modal-input').value.trim();
      const notes = $('#url-notes-input').value.trim();
      if (!url && !notes) {
        showToast('請輸入網址或貼上筆記內容');
        return;
      }
      state.landingAttachments.push({
        name: url ? url.replace(/^https?:\/\//, '').slice(0, 28) : '貼上筆記片段',
        type: 'text/plain',
        textContent: [url ? `參考網址：${url}` : '', notes].filter(Boolean).join('\n'),
      });
      renderAttachments(state.landingAttachments, '#landing-attachments');
      $('#url-modal-input').value = '';
      $('#url-notes-input').value = '';
      $('#url-modal').classList.add('hidden');
    });

    // Landing voice input
    $('#landing-mic-btn').addEventListener('click', () => {
      speech.toggleListening({
        onStateChange: (active) => $('#landing-mic-btn').classList.toggle('listening', active),
        onResult: (text) => {
          $('#landing-prompt').value = text;
        },
        onError: (err) => showToast(err),
      });
    });

    $('#open-saved-btn').addEventListener('click', openHistoryModal);
    $('#landing-settings-btn').addEventListener('click', () => $('#settings-modal').classList.remove('hidden'));
  }

  function renderSuggestions() {
    const pool = window.LessonLibrary.SUGGESTION_POOL;
    const items = [];
    for (let i = 0; i < 4; i++) {
      items.push(pool[(state.suggestionOffset + i) % pool.length]);
    }
    const modeNames = { topic: '主題', exam: '備考', homework: '作業' };
    const grid = $('#suggestions-grid');
    grid.innerHTML = items.map((item) => `
      <button type="button" class="suggestion-card" data-id="${item.id}" data-mode="${item.mode}" data-prompt="${escapeHtml(item.prompt)}">
        <div class="suggestion-meta">
          <span class="suggestion-subject">${item.subject}</span>
          <span class="suggestion-mode">${modeNames[item.mode]}</span>
        </div>
        <div class="suggestion-title">${escapeHtml(item.prompt)}</div>
      </button>
    `).join('');

    grid.querySelectorAll('.suggestion-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const mode = card.dataset.mode;
        const prompt = card.dataset.prompt;
        const curated = window.LessonLibrary.CURATED_LESSONS[id];
        if (curated && !tutor.hasLiveLLM()) {
          openClassroom(structuredClone(curated), []);
        } else {
          launchLesson({ prompt, mode, attachments: [] });
        }
      });
    });
  }

  async function handleFiles(fileList, targetArr, stripSelector) {
    for (const file of Array.from(fileList)) {
      if (file.type.startsWith('image/')) {
        const dataUrl = await readAsDataUrl(file);
        targetArr.push({ name: file.name, type: file.type, dataUrl });
      } else {
        const text = await readAsText(file);
        targetArr.push({ name: file.name, type: file.type || 'text/plain', textContent: text.slice(0, 6000) });
      }
    }
    renderAttachments(targetArr, stripSelector);
  }

  function renderAttachments(arr, selector) {
    const strip = $(selector);
    strip.classList.toggle('hidden', arr.length === 0);
    strip.innerHTML = arr.map((item, idx) => `
      <span class="attachment-pill">
        ${item.dataUrl ? `<img src="${item.dataUrl}" alt="" />` : '<span>📄</span>'}
        <span>${escapeHtml(item.name)}</span>
        <button type="button" class="attachment-remove" data-idx="${idx}" aria-label="移除">✕</button>
      </span>
    `).join('');
    strip.querySelectorAll('.attachment-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        arr.splice(Number(btn.dataset.idx), 1);
        renderAttachments(arr, selector);
      });
    });
  }

  // ==================== LAUNCHING CLASSROOM ====================
  async function launchLesson({ prompt, mode, attachments }) {
    const startBtn = $('#start-lesson-btn');
    startBtn.disabled = true;
    startBtn.innerHTML = '<span>備課繪圖中...</span>';

    try {
      const lesson = await tutor.createLesson({ prompt, mode, lang: state.lang, attachments });
      openClassroom(lesson, attachments);
    } catch (err) {
      showToast('AI 引擎連線失敗，已自動切換為內建智慧白板引擎：' + err.message);
      const fallback = window.LessonLibrary.buildCustomFallbackLesson(prompt, mode, attachments);
      openClassroom(fallback, attachments);
    } finally {
      startBtn.disabled = false;
      startBtn.innerHTML = '<span>開始上課</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    }
  }

  function openClassroom(lesson, attachments = []) {
    state.lesson = lesson;
    state.stepIndex = 0;
    state.isPlaying = true;
    state.playToken++;

    $('#landing-view').classList.remove('active');
    $('#classroom-view').classList.add('active');

    if (!board) {
      board = new WhiteboardEngine(
        $('#whiteboard-stage'),
        $('#ai-board-canvas'),
        $('#student-draw-canvas'),
        $('#ai-pen-cursor')
      );
      board.onZoomChange = (pct) => {
        $('#zoom-readout').textContent = `${pct}%`;
      };
    } else {
      board.resize();
      board.clearBoard();
      board.clearStudentStrokes();
      board.resetView();
    }

    const firstImg = attachments.find((a) => a.dataUrl);
    board.setUploadedImage(firstImg ? firstImg.dataUrl : null);

    const modeLabels = { topic: '主題模式', exam: '備考模式', homework: '作業模式' };
    $('#studio-lesson-title').textContent = lesson.title;
    $('#studio-mode-badge').textContent = modeLabels[lesson.mode] || '主題模式';
    $('#studio-subject-badge').textContent = lesson.subject || '綜合';
    $('#engine-indicator-text').textContent = tutor.getEngineLabel();
    $('#studio-lang-select').value = state.lang;

    $('#chat-stream').innerHTML = '';
    appendChatMessage('tutor', `哈囉！歡迎來到這堂白板課：《${lesson.title}》。我會一邊講、一邊在白板上把每一步畫出來；沒聽懂隨時打斷我問「為什麼」喔！`);
    if (attachments.length) {
      appendChatMessage('student', `📎 已匯入教材：${attachments.map((a) => a.name).join('、')}`, firstImg?.dataUrl);
    }

    renderTimelineAndOutline();
    saveToHistory(lesson);
    runStep(0, { autoAdvance: true });
  }

  function renderTimelineAndOutline() {
    const steps = state.lesson?.steps || [];
    const timeline = $('#steps-timeline');
    timeline.innerHTML = steps.map((s, i) => `
      <button type="button" class="timeline-pill ${i === state.stepIndex ? 'active' : i < state.stepIndex ? 'done' : ''}" data-step="${i}">
        ${escapeHtml(s.title || `步驟 ${i + 1}`)}
      </button>
    `).join('');

    timeline.querySelectorAll('.timeline-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        jumpToStep(Number(pill.dataset.step));
      });
    });

    const outline = $('#lesson-outline-drawer');
    outline.innerHTML = steps.map((s, i) => `
      <div class="outline-item ${i === state.stepIndex ? 'active' : ''}" data-step="${i}">
        <span>${i <= state.stepIndex ? '●' : '○'}</span>
        <span>${escapeHtml(s.title)}</span>
      </div>
    `).join('');
    outline.querySelectorAll('.outline-item').forEach((item) => {
      item.addEventListener('click', () => jumpToStep(Number(item.dataset.step)));
    });

    $('#step-counter').textContent = `${state.stepIndex + 1} / ${steps.length}`;
    $('#prev-step-btn').disabled = state.stepIndex <= 0;
    $('#next-step-btn').disabled = state.stepIndex >= steps.length - 1;
    updatePlayPauseUI();
  }

  function updatePlayPauseUI() {
    $('#play-icon').classList.toggle('hidden', state.isPlaying);
    $('#pause-icon').classList.toggle('hidden', !state.isPlaying);
    $('#interrupt-fab').classList.toggle('hidden', !state.isPlaying);
  }

  async function runStep(index, { autoAdvance = true, instant = false } = {}) {
    if (!state.lesson || !state.lesson.steps[index]) return;
    const token = ++state.playToken;
    state.stepIndex = index;
    renderTimelineAndOutline();

    const step = state.lesson.steps[index];
    $('#board-status-text').textContent = `正在講解：${step.title}`;
    $('#tutor-sub-status').textContent = '邊講邊畫中...';

    appendChatMessage('tutor', step.speech, null, false, `step-${index}`);

    const drawPromise = board.playStep(state.lesson.steps, index, {
      instant,
      speed: Number($('#speech-rate-select').value) || 1,
    });

    const speakPromise = new Promise((resolve) => {
      speech.speak(step.speech, { onEnd: resolve });
    });

    await Promise.all([drawPromise, speakPromise]);
    if (token !== state.playToken) return; // Interrupted or jumped

    // In homework mode, pause after speaking so the student can try answering!
    if (state.lesson.mode === 'homework') {
      state.isPlaying = false;
      updatePlayPauseUI();
      $('#board-status-text').textContent = '輪到你囉：在右側輸入你的想法';
      $('#tutor-sub-status').textContent = '等待你的回答...';
      return;
    }

    if (autoAdvance && state.isPlaying && index + 1 < state.lesson.steps.length) {
      await new Promise((r) => setTimeout(r, 650));
      if (token !== state.playToken || !state.isPlaying) return;
      runStep(index + 1, { autoAdvance: true });
    } else {
      state.isPlaying = false;
      updatePlayPauseUI();
      if (index === state.lesson.steps.length - 1) {
        $('#board-status-text').textContent = '講解完成！隨時可發問或做小測驗';
        $('#tutor-sub-status').textContent = '可隨時打斷追問';
      }
    }
  }

  function jumpToStep(index) {
    speech.stopSpeaking();
    board.stopAnimation();
    state.isPlaying = true;
    runStep(index, { autoAdvance: true });
  }

  function pauseTutor({ finishCurrentBoard = false } = {}) {
    state.isPlaying = false;
    state.playToken++;
    speech.stopSpeaking();
    board?.stopAnimation();
    if (finishCurrentBoard && board && state.lesson) {
      board.playStep(state.lesson.steps, state.stepIndex, { instant: true });
    }
    updatePlayPauseUI();
    $('#board-status-text').textContent = '已暫停 — 隨時打字或開口提問';
    $('#tutor-sub-status').textContent = '正在聽你發問...';
  }

  // ==================== CLASSROOM CONTROLS & CHAT ====================
  function bindClassroomEvents() {
    $('#back-home-btn').addEventListener('click', () => {
      pauseTutor();
      $('#classroom-view').classList.remove('active');
      $('#landing-view').classList.add('active');
    });

    $('#play-pause-btn').addEventListener('click', () => {
      if (state.isPlaying) {
        pauseTutor();
      } else {
        state.isPlaying = true;
        updatePlayPauseUI();
        runStep(state.stepIndex, { autoAdvance: true });
      }
    });

    $('#prev-step-btn').addEventListener('click', () => {
      if (state.stepIndex > 0) jumpToStep(state.stepIndex - 1);
    });

    $('#next-step-btn').addEventListener('click', () => {
      if (state.lesson && state.stepIndex + 1 < state.lesson.steps.length) {
        jumpToStep(state.stepIndex + 1);
      }
    });

    $('#replay-step-btn').addEventListener('click', () => {
      jumpToStep(state.stepIndex);
    });

    $('#tts-toggle-btn').addEventListener('click', () => {
      const next = !speech.enabled;
      speech.setEnabled(next);
      $('#tts-toggle-btn').classList.toggle('active', next);
      $('#tts-toggle-label').textContent = next ? '語音開' : '靜音';
    });

    $('#speech-rate-select').addEventListener('change', (e) => {
      speech.setRate(e.target.value);
    });

    $('#studio-lang-select').addEventListener('change', (e) => {
      state.lang = e.target.value;
      $('#landing-lang-select').value = state.lang;
      speech.setLang(state.lang);
      showToast('已切換課堂語音語言');
    });

    // Student drawing toolbar
    $$('.draw-toolbar .tool-btn[data-tool]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.draw-toolbar .tool-btn[data-tool]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        board?.setTool(btn.dataset.tool);
      });
    });

    $$('.draw-toolbar .color-swatch').forEach((sw) => {
      sw.addEventListener('click', () => {
        $$('.draw-toolbar .color-swatch').forEach((s) => s.classList.remove('active'));
        sw.classList.add('active');
        board?.setStudentColor(sw.dataset.color);
      });
    });

    $('#clear-student-btn').addEventListener('click', () => {
      board?.clearStudentStrokes();
      showToast('已清除你的白板筆跡');
    });

    $('#reset-zoom-btn').addEventListener('click', () => {
      board?.resetView();
    });

    $('#export-board-btn').addEventListener('click', () => {
      const slug = (state.lesson?.title || 'ahaboard').slice(0, 18);
      board?.exportPNG(`${slug}-白板筆記.png`);
      showToast('已匯出白板圖檔 PNG');
    });

    $('#toggle-outline-btn').addEventListener('click', () => {
      $('#lesson-outline-drawer').classList.toggle('hidden');
    });

    $('#interrupt-fab').addEventListener('click', () => {
      pauseTutor();
      $('#chat-input').focus();
      showToast('老師已暫停，請問哪一步沒聽懂？');
    });

    // Chat input & quick chips
    $('#chat-send-btn').addEventListener('click', submitStudentChat);
    $('#chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitStudentChat();
      }
    });
    $('#chat-input').addEventListener('focus', () => {
      if (state.isPlaying) {
        // Gently pause playback only when user starts typing
      }
    });

    $$('.quick-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $('#chat-input').value = chip.dataset.ask;
        submitStudentChat();
      });
    });

    $('#chat-file-input').addEventListener('change', async (e) => {
      await handleFiles(e.target.files, state.chatAttachments, '#chat-attachments');
      e.target.value = '';
    });

    $('#chat-mic-btn').addEventListener('click', () => {
      pauseTutor();
      speech.toggleListening({
        onStateChange: (active) => $('#chat-mic-btn').classList.toggle('listening', active),
        onResult: (text, isFinal) => {
          $('#chat-input').value = text;
          if (isFinal && text) submitStudentChat();
        },
        onError: (err) => showToast(err),
      });
    });

    $('#open-notes-btn').addEventListener('click', openSummaryModal);
    $('#studio-settings-btn').addEventListener('click', () => $('#settings-modal').classList.remove('hidden'));
  }

  async function submitStudentChat() {
    const input = $('#chat-input');
    const text = input.value.trim();
    const atts = [...state.chatAttachments];
    if (!text && !atts.length) return;

    pauseTutor({ finishCurrentBoard: true });
    input.value = '';
    state.chatAttachments = [];
    renderAttachments([], '#chat-attachments');

    const imgAtt = atts.find((a) => a.dataUrl);
    if (imgAtt) board.setUploadedImage(imgAtt.dataUrl);

    appendChatMessage('student', text || '📎 上傳圖片請老師看這題', imgAtt?.dataUrl);
    $('#tutor-sub-status').textContent = '思考你的問題中...';

    const res = await tutor.answerStudent({
      lesson: state.lesson,
      currentStepIndex: state.stepIndex,
      studentText: text || '請看我上傳的圖片',
      lang: state.lang,
      attachments: atts,
    });

    appendChatMessage('tutor', res.reply, null, true);

    if (res.action === 'replay_step') {
      runStep(state.stepIndex, { autoAdvance: false });
      return;
    }
    if (res.action === 'next_step' && state.stepIndex + 1 < state.lesson.steps.length) {
      await new Promise((r) => speech.speak(res.reply, { onEnd: r }));
      state.isPlaying = state.lesson.mode !== 'homework';
      runStep(state.stepIndex + 1, { autoAdvance: state.isPlaying });
      return;
    }

    const drawWork = res.extraDraw?.length
      ? board.addCalloutItems(res.extraDraw)
      : Promise.resolve();
    const speakWork = new Promise((r) => speech.speak(res.reply, { onEnd: r }));
    await Promise.all([drawWork, speakWork]);
    $('#tutor-sub-status').textContent = '可隨時發問或點「下一步」';
  }

  function appendChatMessage(role, text, imgUrl = null, isCallout = false, msgKey = null) {
    const stream = $('#chat-stream');
    // Avoid duplicating identical step bubble if replayed
    if (msgKey) {
      const existing = stream.querySelector(`[data-msg-key="${msgKey}"]`);
      if (existing) {
        existing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
    }

    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${role}`;
    if (msgKey) wrap.dataset.msgKey = msgKey;

    const sender = document.createElement('div');
    sender.className = 'chat-sender';
    sender.textContent = role === 'tutor' ? 'Aha 家教老師' : '你';

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble' + (isCallout ? ' callout-hint' : '');
    bubble.textContent = text;
    if (imgUrl) {
      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = '上傳圖片';
      bubble.appendChild(img);
    }

    wrap.appendChild(sender);
    wrap.appendChild(bubble);
    stream.appendChild(wrap);
    stream.scrollTop = stream.scrollHeight;
  }

  // ==================== MODALS: SUMMARY/QUIZ, SETTINGS, HISTORY ====================
  function bindModalEvents() {
    $$('.close-modal-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        $('#' + btn.dataset.close)?.classList.add('hidden');
      });
    });

    $$('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.add('hidden');
      });
    });

    // Settings provider radio toggle
    $$('input[name="ai-provider"]').forEach((radio) => {
      radio.addEventListener('change', updateProviderFieldVisibility);
    });

    $('#save-settings-btn').addEventListener('click', () => {
      const provider = $('input[name="ai-provider"]:checked')?.value || 'builtin';
      tutor.saveSettings({
        provider,
        apiKey: $('#api-key-input').value.trim(),
        openaiBase: $('#api-base-input').value.trim() || 'https://api.openai.com/v1',
        openaiModel: $('#api-model-input').value.trim() || 'gpt-4o-mini',
        geminiModel: $('#gemini-model-input').value.trim() || 'gemini-2.5-flash',
      });
      $('#engine-indicator-text').textContent = tutor.getEngineLabel();
      $('#settings-modal').classList.add('hidden');
      showToast('已儲存引擎設定：' + tutor.getEngineLabel());
    });
  }

  function syncSettingsModalUI() {
    const s = tutor.settings;
    const radio = $(`input[name="ai-provider"][value="${s.provider}"]`);
    if (radio) radio.checked = true;
    $('#api-key-input').value = s.apiKey || '';
    $('#api-base-input').value = s.openaiBase || 'https://api.openai.com/v1';
    $('#api-model-input').value = s.openaiModel || 'gpt-4o-mini';
    $('#gemini-model-input').value = s.geminiModel || 'gemini-2.5-flash';
    updateProviderFieldVisibility();
  }

  function updateProviderFieldVisibility() {
    const val = $('input[name="ai-provider"]:checked')?.value || 'builtin';
    $('#api-key-fields').classList.toggle('hidden', val === 'builtin');
    $('#openai-extra-fields').classList.toggle('hidden', val !== 'openai');
    $('#gemini-extra-fields').classList.toggle('hidden', val !== 'gemini');
  }

  function openSummaryModal() {
    if (!state.lesson) return;
    const lesson = state.lesson;
    const body = $('#summary-modal-body');

    const notesHtml = (lesson.notes || []).map((n) => `<li>${escapeHtml(n)}</li>`).join('');
    const quizHtml = (lesson.quiz || []).map((item, qi) => `
      <div class="quiz-card" data-qi="${qi}">
        <div class="quiz-question">${qi + 1}. ${escapeHtml(item.q)}</div>
        <div class="quiz-options">
          ${item.options.map((opt, oi) => `
            <button type="button" class="quiz-opt-btn" data-oi="${oi}">${escapeHtml(opt)}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden"></div>
      </div>
    `).join('');

    body.innerHTML = `
      <div class="notes-section">
        <h4>📌 本堂重點整理</h4>
        <ul class="notes-list">${notesHtml}</ul>
      </div>
      ${lesson.pitfall ? `<div class="pitfall-box"><strong>⚠️ 常見易錯點：</strong>${escapeHtml(lesson.pitfall)}</div>` : ''}
      <h4 style="margin: 4px 0 10px;">🧪 隨堂小測驗（錯的可以叫老師重畫講解！）</h4>
      ${quizHtml}
    `;

    body.querySelectorAll('.quiz-card').forEach((card) => {
      const qi = Number(card.dataset.qi);
      const item = lesson.quiz[qi];
      const feedback = card.querySelector('.quiz-feedback');
      card.querySelectorAll('.quiz-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const oi = Number(btn.dataset.oi);
          card.querySelectorAll('.quiz-opt-btn').forEach((b) => {
            b.classList.remove('correct', 'wrong');
          });
          if (oi === item.answer) {
            btn.classList.add('correct');
            feedback.innerHTML = `✅ 答對了！${escapeHtml(item.explain || '')}`;
          } else {
            btn.classList.add('wrong');
            card.querySelectorAll('.quiz-opt-btn')[item.answer]?.classList.add('correct');
            feedback.innerHTML = `
              ❌ 再想一下喔：${escapeHtml(item.explain || '')}
              <div><button type="button" class="redraw-wrong-btn">✏️ 請 AI 老師針對這題在白板再講一次</button></div>
            `;
            feedback.querySelector('.redraw-wrong-btn')?.addEventListener('click', async () => {
              $('#summary-modal').classList.add('hidden');
              pauseTutor();
              const explanation = `我們來看剛才測驗第 ${qi + 1} 題：${item.explain}`;
              appendChatMessage('tutor', explanation, null, true);
              await Promise.all([
                board.addCalloutItems([{ type: 'callout', bx: 550, by: 485, text: item.explain.slice(0, 22) }]),
                new Promise((r) => speech.speak(explanation, { onEnd: r })),
              ]);
            });
          }
          feedback.classList.remove('hidden');
        });
      });
    });

    $('#summary-modal').classList.remove('hidden');
  }

  function openHistoryModal() {
    const body = $('#history-modal-body');
    if (!state.history.length) {
      body.innerHTML = '<p style="color:#848490;text-align:center;padding:20px 0;">還沒有上課紀錄，快選一個主題開始第一堂課吧！</p>';
    } else {
      body.innerHTML = state.history.map((h, i) => `
        <div class="history-item" data-idx="${i}">
          <div>
            <strong>${escapeHtml(h.title)}</strong>
            <div style="font-size:12px;color:#848490;margin-top:3px;">${escapeHtml(h.subject)} · ${escapeHtml(h.savedAt)}</div>
          </div>
          <span style="font-size:13px;font-weight:600;color:#2E5BFF;">繼續上課 →</span>
        </div>
      `).join('');
      body.querySelectorAll('.history-item').forEach((el) => {
        el.addEventListener('click', () => {
          const entry = state.history[Number(el.dataset.idx)];
          $('#history-modal').classList.add('hidden');
          if (entry?.lesson) openClassroom(structuredClone(entry.lesson), []);
        });
      });
    }
    $('#history-modal').classList.remove('hidden');
  }

  // ==================== HELPERS ====================
  function readAsDataUrl(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function readAsText(file) {
    return new Promise((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result || ''));
      r.onerror = () => res('');
      r.readAsText(file);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
