/**
 * AI Tutor Engine: handles built-in Socratic homework checking, interruption Q&A,
 * and optional BYOK Gemini / OpenAI multimodal lesson generation.
 */
class TutorEngine {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('ahaboard_settings') || '{}');
      return {
        provider: saved.provider || 'builtin',
        apiKey: saved.apiKey || '',
        openaiBase: saved.openaiBase || 'https://api.openai.com/v1',
        openaiModel: saved.openaiModel || 'gpt-4o-mini',
        geminiModel: saved.geminiModel || 'gemini-2.5-flash',
      };
    } catch (_) {
      return {
        provider: 'builtin',
        apiKey: '',
        openaiBase: 'https://api.openai.com/v1',
        openaiModel: 'gpt-4o-mini',
        geminiModel: 'gemini-2.5-flash',
      };
    }
  }

  saveSettings(next) {
    this.settings = { ...this.settings, ...next };
    localStorage.setItem('ahaboard_settings', JSON.stringify(this.settings));
  }

  hasLiveLLM() {
    return this.settings.provider !== 'builtin' && Boolean(this.settings.apiKey?.trim());
  }

  getEngineLabel() {
    if (!this.hasLiveLLM()) return '內建數學與教案白板引擎';
    return this.settings.provider === 'gemini'
      ? `Gemini 即時 AI (${this.settings.geminiModel})`
      : `OpenAI 相容 (${this.settings.openaiModel})`;
  }

  async createLesson({ prompt, mode, lang, attachments = [] }) {
    if (this.hasLiveLLM()) {
      try {
        const llmLesson = await this._generateWithLLM({ prompt, mode, lang, attachments });
        if (llmLesson && Array.isArray(llmLesson.steps) && llmLesson.steps.length) {
          return llmLesson;
        }
      } catch (err) {
        console.warn('Live LLM generation failed, falling back to built-in engine:', err);
        throw err;
      }
    }
    return window.LessonLibrary.buildCustomFallbackLesson(prompt, mode, attachments);
  }

  /**
   * Handle student interruption, homework step check, or question.
   */
  async answerStudent({ lesson, currentStepIndex, studentText, lang, attachments = [] }) {
    // 1. Interactive Homework Socratic Evaluator (works offline!)
    if (lesson.mode === 'homework' && lesson.homeworkMeta) {
      const hwResult = this._evaluateHomeworkAnswer(lesson, currentStepIndex, studentText);
      if (hwResult) return hwResult;
    }

    // 2. If Live LLM configured, call it for genuine contextual whiteboard response
    if (this.hasLiveLLM()) {
      try {
        return await this._answerWithLLM({ lesson, currentStepIndex, studentText, lang, attachments });
      } catch (err) {
        console.warn('LLM Q&A failed:', err);
      }
    }

    // 3. Built-in smart FAQ / contextual responder
    const lower = studentText.toLowerCase();
    if (lower.includes('再畫') || lower.includes('重畫') || lower.includes('重播')) {
      return {
        reply: '沒問題！我把這一步的推導在白板上重新畫一次給你看，注意看筆跡順序喔。',
        action: 'replay_step',
      };
    }
    if (lower.includes('懂了') || lower.includes('繼續') || lower.includes('下一步')) {
      return {
        reply: '太棒了！那我們繼續往下一步推進。',
        action: 'next_step',
      };
    }
    if (lower.includes('比喻') || lower.includes('白話') || lower.includes('簡單')) {
      const analogy = lesson.faq?.analogy;
      return {
        reply: analogy?.reply || '我們換個生活例子來看：把抽象的符號想成日常物品交換，先看誰影響了誰，再看最後結果！',
        extraDraw: analogy?.callout ? [analogy.callout] : [],
      };
    }
    if (lower.includes('為什麼') || lower.includes('卡住') || lower.includes('看不懂') || lower.includes('why')) {
      const why = lesson.faq?.why;
      return {
        reply: why?.reply || `好問題！在「${lesson.steps[currentStepIndex]?.title || '這一步'}」中，關鍵在於前面條件怎麼推到這裡。我已經用紅框標在白板上了，看看有比較清楚嗎？`,
        extraDraw: why?.callout ? [why.callout] : [
          { type: 'callout', bx: 580, by: 480, targetX: 300, targetY: 300, text: '重點注意這個因果轉折！' },
        ],
      };
    }

    // Check if student asked a brand new math equation mid-chat
    const eq = window.LessonLibrary.parseLinearEquation(studentText);
    if (eq) {
      return {
        reply: `這條方程式的解法思路一樣：先把 ${eq.b} 移項，得到 ${eq.a}x = ${eq.rhsAfterMove}，最後除以 ${eq.a} 就會得到 x = ${eq.xVal}。要不要試著自己在白板上算算看？`,
        extraDraw: [
          { type: 'callout', bx: 560, by: 490, text: `提示：${eq.a}x = ${eq.rhsAfterMove}` },
        ],
      };
    }

    return {
      reply: `收到你的問題「${studentText}」！在目前這一步（${lesson.steps[currentStepIndex]?.title || ''}），核心要抓住因果順序：先確認起點條件，再觀察變化方向。你可以點「這一步為什麼？」讓我用紅筆標記，或說「繼續」往下走！`,
      extraDraw: [
        { type: 'callout', bx: 585, by: 495, text: '針對你的提問重點標註 ↗' },
      ],
    };
  }

  _evaluateHomeworkAnswer(lesson, currentStepIndex, studentText) {
    const meta = lesson.homeworkMeta;
    const text = studentText.trim();
    const lower = text.toLowerCase();

    if (lower.includes('為什麼') || lower.includes('不會') || lower.includes('提示') || lower.includes('比喻')) {
      return null; // Let FAQ handler explain gently
    }

    const numMatch = text.match(/-?\d+(\.\d+)?/g);
    const lastNum = numMatch ? Number(numMatch[numMatch.length - 1]) : null;

    if (currentStepIndex === 0) {
      // Looking for moving `b` (e.g., 5 or -4)
      const absB = Math.abs(meta.b);
      if (text.includes(String(absB)) || text.includes('移') || text.includes('常數')) {
        meta.stage = 1;
        return {
          reply: `答對了！先把 ${meta.b >= 0 ? '+' + meta.b : meta.b} 移到右邊（兩邊同時${meta.b >= 0 ? '減 ' + absB : '加 ' + absB}）。我們來寫出下一步，你算算看等號右邊現在剩多少？`,
          action: 'next_step',
        };
      }
      if (text.includes(String(meta.a)) && text.includes('除')) {
        return {
          reply: `好想法，不過如果現在就先除以 ${meta.a}，${meta.b} 也會變成分數喔！試試看先處理旁邊單獨的常數項（${meta.b >= 0 ? '+' + meta.b : meta.b}），你覺得把它移過去比較好算嗎？`,
        };
      }
      return {
        reply: `再看一下左邊的「${meta.lhsText}」：除了 ${meta.a}x 之外，還有哪一個數字比較好先移到右邊？`,
      };
    }

    if (currentStepIndex === 1) {
      if (lastNum === meta.rhsAfterMove) {
        meta.stage = 2;
        return {
          reply: `完全正確！右邊就是 ${meta.rhsAfterMove}。那現在只剩最後一步囉：${meta.a}x = ${meta.rhsAfterMove}，x 等於多少呢？`,
          action: 'next_step',
        };
      }
      if (lastNum === meta.c + Math.abs(meta.b) && meta.b > 0) {
        return {
          reply: `小心喔！原本左邊是 +${meta.b}，移項到右邊要變號成「減 ${meta.b}」，不是加 ${meta.b} 喔！再算一次 ${meta.c} - ${meta.b} 是多少？`,
          extraDraw: [{ type: 'callout', bx: 565, by: 485, text: `易錯提醒：移項要變號！${meta.c} - ${meta.b} = ?` }],
        };
      }
      return {
        reply: `再算算看喔：原本右邊是 ${meta.c}，${meta.b >= 0 ? '減掉 ' + meta.b : '加上 ' + Math.abs(meta.b)} 會等於多少？`,
      };
    }

    if (currentStepIndex === 2) {
      if (lastNum !== null && Math.abs(lastNum - meta.xVal) < 0.02) {
        return {
          reply: `🎉 太棒了！x = ${meta.xFormatted} 完全正確！代回原式驗算也成立，你已經自己把這題解出來囉！可以點右上角「筆記與測驗」挑戰一下類似題。`,
        };
      }
      return {
        reply: `快解出來了！提示：${meta.a} 乘以多少會等於 ${meta.rhsAfterMove}？也就是把 ${meta.rhsAfterMove} 除以 ${meta.a}。`,
      };
    }
    return null;
  }

  _buildSystemSchemaPrompt(mode, lang) {
    const langName = lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : lang === 'zh-CN' ? 'Simplified Chinese' : 'Traditional Chinese (Taiwan)';
    const modeRule = mode === 'homework'
      ? 'Homework Mode: Do NOT reveal the final answer in step 1! Ask a guiding question and lead step by step.'
      : mode === 'exam'
        ? 'Exam Prep Mode: Organize key concepts, highlight common pitfalls, and wrap up with a 3-question quiz.'
        : 'Topic Mode: Teach visually from intuition to formula/diagram step by step like a warm 1-on-1 tutor.';

    return `You are ahaboard, an AI whiteboard tutor who speaks naturally while drawing step-by-step on a 1000x620 whiteboard.
Language: ${langName}.
${modeRule}
Respond ONLY with valid JSON matching this schema (no markdown fences):
{
  "title": "short lesson title",
  "subject": "數學|物理|化學|生物|歷史|地理|資訊|綜合",
  "mode": "${mode}",
  "steps": [
    {
      "title": "1. step label",
      "speech": "conversational spoken explanation for this step (2-3 sentences)",
      "draw": [
        {"type":"title","x":50,"y":58,"text":"...","size":26,"underline":true},
        {"type":"box","x":55,"y":115,"w":380,"h":130,"fill":"#EEF3FF","color":"#2E5BFF","label":"Header"},
        {"type":"text","x":75,"y":180,"text":"...","size":16,"color":"#1B1B1F"},
        {"type":"arrow","x1":445,"y1":180,"x2":515,"y2":180,"color":"#1B1B1F","label":"導致"},
        {"type":"functionPlot","x":55,"y":110,"w":460,"h":410,"xMin":-4,"xMax":4,"yMin":-2,"yMax":8,"curves":[{"expr":"x*x","color":"#2E5BFF","label":"y=x^2"}],"points":[{"x":1,"y":1,"color":"#E85D3F","label":"(1,1)"}]}
      ]
    }
  ],
  "notes": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "pitfall": "common mistake students make",
  "quiz": [
    {"q": "question?", "options": ["A", "B", "C"], "answer": 0, "explain": "why"}
  ]
}
Keep coordinates strictly inside x: 40..950, y: 40..585, avoid overlapping boxes across steps, use clear readable sizes (15-26).`;
  }

  async _generateWithLLM({ prompt, mode, lang, attachments }) {
    const sys = this._buildSystemSchemaPrompt(mode, lang);
    const textNotes = attachments.filter((a) => a.textContent).map((a) => `[Attached ${a.name}]:\n${a.textContent.slice(0, 3500)}`).join('\n\n');
    const userMsg = `Student request: ${prompt}\n${textNotes}`;

    let rawText = '';
    if (this.settings.provider === 'gemini') {
      const parts = [{ text: sys + '\n\n' + userMsg }];
      attachments.filter((a) => a.dataUrl && a.type?.startsWith('image/')).forEach((img) => {
        const [meta, b64] = img.dataUrl.split(',');
        const mime = meta.match(/data:(.*?);/)?.[1] || 'image/png';
        parts.push({ inline_data: { mime_type: mime, data: b64 } });
      });

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.settings.geminiModel)}:generateContent?key=${encodeURIComponent(this.settings.apiKey.trim())}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.5 },
        }),
      });
      if (!res.ok) throw new Error(`Gemini API ${res.status}`);
      const data = await res.json();
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const content = [{ type: 'text', text: userMsg }];
      attachments.filter((a) => a.dataUrl && a.type?.startsWith('image/')).forEach((img) => {
        content.push({ type: 'image_url', image_url: { url: img.dataUrl } });
      });

      const base = this.settings.openaiBase.replace(/\/$/, '');
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.settings.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: this.settings.openaiModel,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content },
          ],
          temperature: 0.5,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI API ${res.status}`);
      const data = await res.json();
      rawText = data.choices?.[0]?.message?.content || '';
    }

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    parsed.id = 'llm-' + Date.now();
    parsed.mode = mode;
    return parsed;
  }

  async _answerWithLLM({ lesson, currentStepIndex, studentText, lang, attachments }) {
    const step = lesson.steps[currentStepIndex] || {};
    const prompt = `You are the AI whiteboard tutor currently teaching "${lesson.title}" (${lesson.mode} mode), at step ${currentStepIndex + 1}: "${step.title}".
Step speech was: "${step.speech}".
Student interrupted and said: "${studentText}".
Reply warmly and concisely in ${lang === 'en' ? 'English' : lang === 'ja' ? 'Japanese' : 'Traditional Chinese'}.
Return JSON only: {"reply": "...", "extraDraw": [{"type":"callout","bx":560,"by":490,"text":"short board note"}]}`;

    let rawText = '';
    if (this.settings.provider === 'gemini') {
      const parts = [{ text: prompt }];
      attachments.filter((a) => a.dataUrl && a.type?.startsWith('image/')).forEach((img) => {
        const [meta, b64] = img.dataUrl.split(',');
        const mime = meta.match(/data:(.*?);/)?.[1] || 'image/png';
        parts.push({ inline_data: { mime_type: mime, data: b64 } });
      });
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.settings.geminiModel)}:generateContent?key=${encodeURIComponent(this.settings.apiKey.trim())}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.5 },
        }),
      });
      if (!res.ok) throw new Error(`Gemini API ${res.status}`);
      const data = await res.json();
      rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      const base = this.settings.openaiBase.replace(/\/$/, '');
      const res = await fetch(`${base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.settings.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: this.settings.openaiModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        }),
      });
      if (!res.ok) throw new Error(`OpenAI API ${res.status}`);
      const data = await res.json();
      rawText = data.choices?.[0]?.message?.content || '';
    }

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    return JSON.parse(cleaned);
  }
}

window.TutorEngine = TutorEngine;
