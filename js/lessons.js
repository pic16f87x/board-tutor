/**
 * Curated Multi-Subject Interactive Whiteboard Lessons + Dynamic Math/Notes Lesson Builder.
 */
const SUGGESTION_POOL = [
  { id: 'projectile', subject: '物理', mode: 'topic', prompt: '踢出去的球為什麼會劃出一道弧線？' },
  { id: 'derivative', subject: '數學', mode: 'topic', prompt: '導數到底是什麼意思？' },
  { id: 'genetics', subject: '生物', mode: 'exam', prompt: '期中考複習：基因遺傳與血型（A＋B 也能生出 O 型嗎？）' },
  { id: 'equation', subject: '數學', mode: 'homework', prompt: '解方程式：2x + 5 = 17' },
  { id: 'moon', subject: '天文', mode: 'topic', prompt: '月亮為什麼會有陰晴圓缺？' },
  { id: 'intersection', subject: '數學', mode: 'topic', prompt: '兩條直線 y = 2x + 1 和 y = -x + 4 在哪裡碰頭？' },
  { id: 'catalyst', subject: '化學', mode: 'topic', prompt: '加一點催化劑，反應速率怎麼變？' },
  { id: 'linear-hw', subject: '數學', mode: 'homework', prompt: '解方程式：3x - 4 = 14' },
];

const CURATED_LESSONS = {
  projectile: {
    id: 'projectile',
    title: '拋體運動：踢出去的球為什麼會劃出弧線？',
    subject: '物理',
    mode: 'topic',
    steps: [
      {
        title: '1. 先看現象',
        speech: '你問踢出去的球為什麼會劃出一道弧線？我們先把白板分成兩邊看：把球水平丟出去之後，其實「兩個運動」正在同時發生！',
        draw: [
          { type: 'title', x: 50, y: 58, text: '拋體運動 Projectile Motion', size: 28, underline: true },
          { type: 'box', x: 560, y: 120, w: 380, h: 125, fill: '#EEF3FF', color: '#2E5BFF', label: '核心直覺：兩個運動同時發生' },
          { type: 'text', x: 582, y: 182, text: '① 水平方向：往前等速移動', size: 17, color: '#1B1B1F' },
          { type: 'text', x: 582, y: 216, text: '② 垂直方向：重力一直往下拉', size: 17, color: '#E85D3F' },
        ],
      },
      {
        title: '2. 思想實驗 A vs B',
        speech: '來猜一個經典問題！桌邊有兩顆一樣的球：A 直接放手讓它垂直落下，B 同時用力往水平方向丟出去。你猜誰會先落地？',
        draw: [
          { type: 'projectileDemo', x: 50, y: 120, w: 470, h: 370, showForces: false },
          { type: 'box', x: 560, y: 270, w: 380, h: 105, fill: '#FFF7F4', color: '#E85D3F', label: '猜猜看：誰先落地？' },
          { type: 'text', x: 582, y: 332, text: 'A 直接放手 vs B 水平丟出（同高度）', size: 16, color: '#53535D' },
        ],
      },
      {
        title: '3. 畫出力圖揭曉答案',
        speech: '答案是：它們會同時落地！看看白板上的力圖：球離開手之後，並沒有往前的推力在推它了，只剩下向下的重力 g 作用在兩顆球上，所以它們下墜的高度在每一秒都一模一樣。',
        draw: [
          { type: 'projectileDemo', x: 50, y: 120, w: 470, h: 370, showForces: true },
          { type: 'box', x: 560, y: 395, w: 380, h: 145, fill: '#ECFDF3', color: '#16A34A', label: '✓ 同時落地！原因在受力' },
          { type: 'text', x: 582, y: 454, text: '丟出後：沒有往前的推力！', size: 17, color: '#B42318' },
          { type: 'text', x: 582, y: 486, text: '只有重力往下拉 → 垂直加速度都是 g', size: 16, color: '#1B1B1F' },
          { type: 'text', x: 582, y: 518, text: '丟得越快 = 落得越遠，但落地時間不變', size: 15, color: '#16A34A' },
        ],
      },
      {
        title: '4. 數學推導總結',
        speech: '寫成公式超簡單：水平距離 x 等於初速度乘時間，垂直掉落高度 y 等於二分之一 gt 平方。把 t 消掉後，y 就正比於 x 平方，這正是一條標準的拋物線！',
        draw: [
          { type: 'box', x: 50, y: 515, w: 890, h: 78, fill: '#FFFFFF', color: '#1B1B1F' },
          { type: 'text', x: 75, y: 550, text: '水平：x = v₀ · t       垂直：y = ½ g t²', size: 18, mono: true, color: '#2E5BFF' },
          { type: 'text', x: 75, y: 578, text: '消去 t 得軌跡：y = (g / 2v₀²) · x²  →  標準拋物線！', size: 17, mono: true, color: '#E85D3F' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '好問題！為什麼往水平丟不會拖慢它掉下來的時間？因為力與運動在「垂直」和「水平」兩個互相垂直的方向上是獨立的（運動獨立性）。水平初速度不會產生任何向上或向下的分力，拉它往下掉的永遠只有重力！',
        callout: { type: 'callout', bx: 565, by: 265, targetX: 280, targetY: 270, text: '水平與垂直運動互相獨立！' },
      },
      analogy: {
        reply: '想像你在等速前進的火車上放手讓蘋果掉落：對車內的你來說蘋果是直直掉下去，但對站在月台的人看來，蘋果一邊跟著火車往前跑、一邊往下掉，所以軌跡就是一條弧線！兩者落地時間完全一樣。',
      },
    },
    notes: [
      '拋體運動可以拆解為「水平等速運動」與「垂直自由落體」同時進行。',
      '物體離開手或腳之後，不再受到往前的推力（忽略空氣阻力時，只受重力作用）。',
      '在同一高度水平丟出的物體，不管初速度多快，落地時間都與自由落體相同。',
    ],
    pitfall: '常見誤區：誤以為「丟得越快，球會飛比較久才落地」。其實丟得越快只是水平飛得越遠，落地時間只取決於高度！',
    quiz: [
      {
        q: '從同一張桌面，A 球自由落下，B 球以更快的速度水平射出（忽略空氣阻力），誰先落地？',
        options: ['A 球先落地', 'B 球先落地', '兩球同時落地'],
        answer: 2,
        explain: '兩球垂直方向的初速度都是 0，且只受相同重力加速度 g，高度相同故落地時間相同。',
      },
      {
        q: '籃球出手飛在半空中最高點時，還受到哪個方向的推力？',
        options: ['向前的推力與向下的重力', '只有向下的重力（不計空氣阻力）', '完全不受任何力'],
        answer: 1,
        explain: '球一旦離開手，原本的推力就消失了；它在空中靠慣性繼續前進，受力只有重力。',
      },
      {
        q: '如果把水平拋出的初速度變成原來的 2 倍，落地時間與水平射程各會怎麼變？',
        options: ['時間不變，射程變 2 倍', '時間變 2 倍，射程變 4 倍', '時間變一半，射程不變'],
        answer: 0,
        explain: '落地時間只跟高度有關（不變）；水平射程 x = v₀t，所以初速度加倍、射程變 2 倍。',
      },
    ],
  },

  derivative: {
    id: 'derivative',
    title: '導數到底是什麼意思？從割線到瞬時斜率',
    subject: '數學',
    mode: 'topic',
    steps: [
      {
        title: '1. 先畫出曲線',
        speech: '很多人背了一堆微分公式，卻不知道導數到底是什麼。其實一句話：導數就是曲線在「某一點」的瞬間斜率！我們先在白板算出並畫出 y 等於 x 平方的曲線。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '導數的幾何意義：瞬間變化率', size: 27, underline: true },
          {
            type: 'functionPlot',
            x: 55, y: 105, w: 460, h: 430,
            xMin: -1.5, xMax: 3.5, yMin: -1, yMax: 9,
            curves: [{ expr: 'x*x', color: '#2E5BFF', width: 3.2, label: 'f(x) = x²', labelX: 2.1 }],
            points: [{ x: 1, y: 1, color: '#E85D3F', label: 'P(1, 1)' }],
          },
          { type: 'box', x: 550, y: 120, w: 390, h: 120, fill: '#EEF3FF', color: '#2E5BFF', label: '我們想知道的問題' },
          { type: 'text', x: 572, y: 185, text: '在點 P(1, 1) 的那一瞬間，', size: 17 },
          { type: 'text', x: 572, y: 215, text: '這條曲線到底有多「陡」？', size: 17, color: '#E85D3F' },
        ],
      },
      {
        title: '2. 拿兩點連線（割線）',
        speech: '要算斜率需要兩個點，對吧？我們先在旁邊找一點 Q，橫坐標是 1 加上 Δx。把 P 和 Q 連起來的這條虛線叫做割線，它的斜率就是平均變化率。',
        draw: [
          {
            type: 'functionPlot',
            x: 55, y: 105, w: 460, h: 430,
            xMin: -1.5, xMax: 3.5, yMin: -1, yMax: 9,
            curves: [
              { expr: 'x*x', color: '#2E5BFF', width: 3.2, label: 'f(x) = x²', labelX: 2.1 },
              { expr: '3*x - 2', color: '#D97706', width: 2.4, dashed: true, label: '割線 Δx=1', labelX: 1.9 },
            ],
            points: [
              { x: 1, y: 1, color: '#E85D3F', label: 'P(1,1)' },
              { x: 2, y: 4, color: '#D97706', label: 'Q(2,4)' },
            ],
          },
          { type: 'box', x: 550, y: 265, w: 390, h: 140, fill: '#FFFBEB', color: '#D97706', label: '割線斜率（平均變化）' },
          { type: 'text', x: 572, y: 325, text: '斜率 = Δy / Δx = (f(1+Δx) - f(1)) / Δx', size: 15, mono: true },
          { type: 'text', x: 572, y: 360, text: '當 Δx = 1 時：(4 - 1) / (2 - 1) = 3', size: 16, mono: true, color: '#D97706' },
          { type: 'text', x: 572, y: 390, text: '還不夠準，因為 Q 離 P 太遠了！', size: 15, color: '#53535D' },
        ],
      },
      {
        title: '3. 讓 Δx 逼近 0（切線）',
        speech: '現在把 Q 沿著曲線一直往 P 推近，讓 Δx 越來越小、逼近 0！這條割線就會貼上曲線，變成只在 P 點擦過去的「切線」。算出來的極限斜率剛好是 2！',
        draw: [
          {
            type: 'functionPlot',
            x: 55, y: 105, w: 460, h: 430,
            xMin: -1.5, xMax: 3.5, yMin: -1, yMax: 9,
            curves: [
              { expr: 'x*x', color: '#2E5BFF', width: 3.2, label: 'f(x) = x²', labelX: 2.1 },
              { expr: '2*x - 1', color: '#E85D3F', width: 3, label: '切線斜率 = 2', labelX: 1.7 },
            ],
            points: [{ x: 1, y: 1, color: '#E85D3F', label: "P(1,1), f'(1)=2" }],
          },
          { type: 'box', x: 550, y: 425, w: 390, h: 150, fill: '#FFF4F1', color: '#E85D3F', label: '導數 f\'(x) 的定義' },
          { type: 'text', x: 572, y: 482, text: '((1+Δx)² - 1) / Δx = 2 + Δx', size: 16, mono: true },
          { type: 'text', x: 572, y: 516, text: '當 Δx → 0 ：斜率極限 = 2 ！', size: 17, mono: true, color: '#E85D3F' },
          { type: 'text', x: 572, y: 548, text: '一般來說：(x²)′ = 2x', size: 17, mono: true, color: '#16A34A' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '為什麼不能一開始就直接代入 Δx = 0？因為分母是 Δx，直接代 0 會變成 0/0 沒有意義！所以我們必須先做代數化簡（把分子的 Δx 約掉，剩下 2 + Δx），最後才讓 Δx 趨近於 0。',
        callout: { type: 'callout', bx: 555, by: 410, targetX: 295, targetY: 420, text: '先約分掉 Δx，再令 Δx→0！' },
      },
      analogy: {
        reply: '這就像開車時的「平均時速」跟「時速表數字」的差別！台北到台中花 2 小時是平均速度（割線），但你看一眼儀表板顯示「時速 108 公里」，那就是這一瞬間的導數（切線斜率）。',
      },
    },
    notes: [
      '導數 f′(a) 的幾何意義，就是函數圖形在 x = a 那一點的切線斜率。',
      '割線代表兩點間的「平均變化率」；當 Δx → 0 取極限，割線就變成切線，得到「瞬時變化率」。',
      '對 f(x) = x² 而言，任意點 x 的導函數為 f′(x) = 2x。',
    ],
    pitfall: '常見易錯：把「函數值 f(1)=1」和「導數值 f′(1)=2」搞混。前者是點的高度，後者是該點的坡度（斜率）。',
    quiz: [
      {
        q: '對 f(x) = x² 來說，在 x = 3 這一點的切線斜率 f′(3) 是多少？',
        options: ['9', '6', '3'],
        answer: 1,
        explain: '因為 f′(x) = 2x，代入 x = 3 得到斜率為 2 × 3 = 6。',
      },
      {
        q: '計算導數時，為什麼是「割線」逼近「切線」？',
        options: ['因為單靠一個點無法直接相減算斜率', '因為曲線沒有斜率', '為了讓分母等於零'],
        answer: 0,
        explain: '斜率定義需要兩點座標相減，因此先取鄰近點形成割線，再讓距離 Δx → 0。',
      },
      {
        q: '如果車子的位置函數是 s(t)，那麼它的導數 s′(t) 代表什麼物理量？',
        options: ['總路程', '瞬時速度', '質量'],
        answer: 1,
        explain: '位置對時間的瞬時變化率，就是瞬時速度。',
      },
    ],
  },

  genetics: {
    id: 'genetics',
    title: '考前串講：血型遺傳與棋盤方格法（A+B 也能生出 O 嗎？）',
    subject: '生物',
    mode: 'exam',
    steps: [
      {
        title: '1. 基因與對偶基因',
        speech: '明天要考遺傳章節，我們把最愛考的「血型遺傳」從頭串一遍！人類 ABO 血型是由一對對偶基因決定的，其中 Iᴬ 和 Iᴮ 是顯性，小寫 i 是隱性。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '備考重點：ABO 血型遺傳與棋盤方格', size: 26, underline: true },
          { type: 'box', x: 55, y: 110, w: 420, h: 195, fill: '#EEF3FF', color: '#2E5BFF', label: '① 基因型 vs 表現型對照' },
          { type: 'text', x: 80, y: 170, text: 'A 型：IᴬIᴬ 或 Iᴬi', size: 18, mono: true },
          { type: 'text', x: 80, y: 205, text: 'B 型：IᴮIᴮ 或 Iᴮi', size: 18, mono: true },
          { type: 'text', x: 80, y: 240, text: 'AB型：IᴬIᴮ （共顯性）', size: 18, mono: true, color: '#2E5BFF' },
          { type: 'text', x: 80, y: 275, text: 'O 型：ii （必須兩個隱性）', size: 18, mono: true, color: '#E85D3F' },
        ],
      },
      {
        title: '2. 畫棋盤方格法',
        speech: '關鍵陷阱來了：爸爸是 A 型、媽媽是 B 型，有沒有可能生出 O 型小孩？如果爸媽剛好都帶有隱性基因 i（也就是 Iᴬi 和 Iᴮi），我們畫出棋盤方格一格一格配對看看！',
        draw: [
          {
            type: 'punnettSquare',
            x: 590, y: 165, cellSize: 130,
            top: ['爸爸 Iᴬ', '爸爸 i'],
            left: ['Iᴮ', 'i'],
            cells: [
              ['IᴬIᴮ (AB型)', 'Iᴮi (B型)'],
              ['Iᴬi (A型)', 'ii (O型) !'],
            ],
            highlightRow: 1, highlightCol: 1,
          },
          { type: 'box', x: 55, y: 335, w: 420, h: 170, fill: '#FFF4F1', color: '#E85D3F', label: '② 考題高頻易錯點！' },
          { type: 'text', x: 78, y: 398, text: 'A 型 (Iᴬi) × B 型 (Iᴮi)', size: 18, color: '#1B1B1F' },
          { type: 'text', x: 78, y: 434, text: '四種血型 A、B、AB、O 都有可能！', size: 17, color: '#E85D3F' },
          { type: 'text', x: 78, y: 468, text: '生出 O 型 (ii) 的機率 = 1/4 = 25%', size: 17, color: '#16A34A' },
        ],
      },
      {
        title: '3. 考前快速記憶口訣',
        speech: '考前把這句口訣記起來：只有父母雙方各能拿出一個小寫 i，小孩才有機會出現隱性 O 型。如果其中一方是 AB 型（基因型 IᴬIᴮ，沒有 i），就絕不可能生出 O 型小孩！',
        draw: [
          { type: 'box', x: 55, y: 525, w: 885, h: 72, fill: '#ECFDF3', color: '#16A34A' },
          { type: 'text', x: 80, y: 568, text: '✓ 必考口訣：雙親都有 i 才生得出 O 型；父母有一方是 AB 型，不可能生出 O 型！', size: 17, color: '#0F5132' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為血型基因是從爸爸那裡拿 1 個、媽媽那裡拿 1 個！即使爸媽看起來都是顯性的 A 型和 B 型，只要各自藏著一個隱性 i，就有 1/2 × 1/2 = 1/4 的機會讓兩個 i 碰在一起變成 O 型。',
        callout: { type: 'callout', bx: 550, by: 460, targetX: 780, targetY: 370, text: '爸媽各出一個 i → ii (O型)!' },
      },
      analogy: {
        reply: '可以把顯性基因想成「不透明顏料」，隱性 i 想成「透明水」。爸爸帶一瓶紅顏料+一瓶水，媽媽帶一瓶藍顏料+一瓶水；各自隨機抽一瓶給小孩，如果剛好都抽到透明水，小孩就是透明的 O 型！',
      },
    },
    notes: [
      'ABO 血型由 Iᴬ、Iᴮ（對 i 為顯性，彼此共顯性）三種對偶基因控制，每人有 2 個。',
      'A 型可能是 IᴬIᴬ 或 Iᴬi；B 型可能是 IᴮIᴮ 或 Iᴮi。',
      '只要雙親各帶一個 i（例如 A 型 Iᴬi 與 B 型 Iᴮi），就有 25% 機率生出 O 型 (ii) 小孩。',
    ],
    pitfall: '常錯題型：題目只說「父母分別是 A 型與 B 型」，學生誤判「生不出 O 型」。要記得 A 型與 B 型都可能是雜合子（帶有 i）！',
    quiz: [
      {
        q: '爸爸是 AB 型、媽媽是 O 型，他們的小孩「不可能」是什麼血型？',
        options: ['A 型', 'B 型', 'O 型'],
        answer: 2,
        explain: '爸爸基因型為 IᴬIᴮ，一定會給出 Iᴬ 或 Iᴮ，不可能給出 i，因此小孩不可能是 ii (O型)。',
      },
      {
        q: '若父母基因型皆為 Iᴬi（都是 A 型），生出 O 型小孩的機率是多少？',
        options: ['0%', '25%', '50%'],
        answer: 1,
        explain: '棋盤方格結果為 IᴬIᴬ、Iᴬi、Iᴬi、ii，其中 ii 佔 1/4 = 25%。',
      },
      {
        q: '為什麼 AB 型的人表現出 A 與 B 兩種抗原特性？',
        options: ['Iᴬ 與 Iᴮ 為共顯性（等顯性）', '因為基因突變', 'i 基因變成顯性'],
        answer: 0,
        explain: 'Iᴬ 與 Iᴮ 同時存在時都能表現出來，稱為共顯性。',
      },
    ],
  },

  moon: {
    id: 'moon',
    title: '月亮為什麼會有陰晴圓缺？地球視角大公開',
    subject: '天文',
    mode: 'topic',
    steps: [
      {
        title: '1. 月球不會自己發光',
        speech: '很多人以為月亮圓缺是因為「地球擋住太陽光」，其實那是月食！平常每個月的陰晴圓缺，是因為月球繞著地球轉，我們從地球看到月球受光面的角度不同。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '月相變化：為什麼有陰晴圓缺？', size: 27, underline: true },
          { type: 'orbitDiagram', cx: 310, cy: 335, r: 140 },
          { type: 'box', x: 575, y: 130, w: 370, h: 130, fill: '#FFFBEB', color: '#D97706', label: '最重要的事實' },
          { type: 'text', x: 598, y: 192, text: '月球永遠「一半亮、一半暗」', size: 17, color: '#1B1B1F' },
          { type: 'text', x: 598, y: 224, text: '亮面永遠朝向太陽！', size: 17, color: '#D97706' },
        ],
      },
      {
        title: '2. 繞地公轉與視角變化',
        speech: '看白板左邊的軌道動畫：當月球轉到太陽和地球中間時，亮面背對我們，這就是朔（新月）；轉到地球另一側時，亮面整個正對地球，就是望（滿月）！',
        draw: [
          { type: 'box', x: 575, y: 285, w: 370, h: 255, fill: '#EEF3FF', color: '#2E5BFF', label: '四大月相位置（29.5 天一週期）' },
          { type: 'text', x: 598, y: 348, text: '🌑 朔（初一）：在日地之間，看不到亮面', size: 15 },
          { type: 'text', x: 598, y: 390, text: '🌓 上弦月（初七八）：看到右半邊亮', size: 15 },
          { type: 'text', x: 598, y: 432, text: '🌕 望（十五）：在地球外側，滿月全亮', size: 15, color: '#D97706' },
          { type: 'text', x: 598, y: 474, text: '🌗 下弦月（廿二三）：看到左半邊亮', size: 15 },
          { type: 'text', x: 598, y: 516, text: '✗ 提醒：不是地球影子遮住的喔！', size: 15, color: '#E85D3F' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為月球公轉軌道跟地球公轉軌道有約 5 度的夾角，平常滿月時地球的影子不會打到月球上！只有偶爾剛好三者排成一直線時，才會發生「月食」。',
        callout: { type: 'callout', bx: 580, by: 540, targetX: 310, targetY: 335, text: '軌道有 5° 傾角，平時不會遮住！' },
      },
      analogy: {
        reply: '在暗室開一盞檯燈當太陽，你拿一顆橘子當月球繞著自己的頭（地球）轉一圈：當橘子在燈跟你之間，你只看到黑黑的背面；轉到另一邊時，你就會看到被照得全亮的橘子！',
      },
    },
    notes: [
      '月球自身不發光，靠反射太陽光；面向太陽的那一半永遠是亮的。',
      '陰晴圓缺（月相變化）是因為月球繞地球公轉（週期約 29.5 天），地球上看到的亮面比例不同。',
      '地球影子擋住月球是「月食」，與日常月相變化不同。',
    ],
    pitfall: '高頻迷思：「新月是地球把太陽擋住了」——錯！新月時月球在太陽和地球中間，地球根本擋不到它，純粹是因為亮面背對著我們。',
    quiz: [
      {
        q: '造成每個月月亮陰晴圓缺（月相變化）的主要原因是什麼？',
        options: ['地球影子擋住月球', '月球繞地球公轉，亮面朝向地球的角度改變', '月球自己忽明忽暗'],
        answer: 1,
        explain: '月球公轉使日、地、月相對位置改變，地球看到的受光面比例隨之變化。',
      },
      {
        q: '農曆初一（朔）時，月球大概位於什麼位置？',
        options: ['太陽和地球之間', '地球的背陽面外側', '與太陽成 90 度'],
        answer: 0,
        explain: '初一新月時月球在日地之間，受光面背向地球。',
      },
      {
        q: '農曆十五滿月時，月亮大約何時升起？',
        options: ['清晨太陽升起時', '傍晚日落時分', '正中午'],
        answer: 1,
        explain: '滿月在太陽的對側（180度），所以太陽西下時滿月剛好從東方升起。',
      },
    ],
  },

  catalyst: {
    id: 'catalyst',
    title: '催化劑怎麼加快反應速率？看懂活化能門檻',
    subject: '化學',
    mode: 'topic',
    steps: [
      {
        title: '1. 反應像翻山越嶺',
        speech: '化學反應就像爬一座山丘：反應物要跨過最高點的門檻，才能變成生成物。這個門檻的高度，就叫做「活化能」。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '催化劑如何加速化學反應？', size: 27, underline: true },
          {
            type: 'functionPlot',
            x: 55, y: 110, w: 470, h: 410,
            xMin: 0, xMax: 6, yMin: 0, yMax: 8,
            curves: [
              { expr: '3 + 3.6*Math.exp(-Math.pow(x-2.6, 2)/1.1) - 0.32*x', color: '#1B1B1F', width: 3.2, label: '無催化劑 (高山)', labelX: 2.3 },
            ],
            points: [{ x: 2.6, y: 5.77, color: '#E85D3F', label: '高活化能門檻' }],
          },
          { type: 'box', x: 560, y: 130, w: 380, h: 130, fill: '#FFF7F4', color: '#E85D3F', label: '沒有催化劑時' },
          { type: 'text', x: 582, y: 192, text: '必須翻過很高的山（活化能大）', size: 17 },
          { type: 'text', x: 582, y: 224, text: '只有少數高能量分子過得去 → 慢！', size: 16, color: '#53535D' },
        ],
      },
      {
        title: '2. 催化劑開了一條隧道',
        speech: '加上一點催化劑，它並不會改變起點跟終點的高度，而是幫反應開了一條「較矮的新路徑」！山變矮了，正反應跟逆反應都會同時加速，而且反應完催化劑本身不會被消耗掉。',
        draw: [
          {
            type: 'functionPlot',
            x: 55, y: 110, w: 470, h: 410,
            xMin: 0, xMax: 6, yMin: 0, yMax: 8,
            curves: [
              { expr: '3 + 3.6*Math.exp(-Math.pow(x-2.6, 2)/1.1) - 0.32*x', color: '#848490', width: 2.4, dashed: true, label: '原路徑', labelX: 2.5 },
              { expr: '3 + 1.6*Math.exp(-Math.pow(x-2.6, 2)/1.2) - 0.32*x', color: '#16A34A', width: 3.4, label: '加催化劑 (低門檻)', labelX: 2.2 },
            ],
            points: [{ x: 2.6, y: 3.77, color: '#16A34A', label: '活化能降低!' }],
          },
          { type: 'box', x: 560, y: 290, w: 380, h: 225, fill: '#ECFDF3', color: '#16A34A', label: '加入催化劑後的三個重點' },
          { type: 'text', x: 582, y: 350, text: '1. 降低活化能（另闢低門檻路徑）', size: 16.5 },
          { type: 'text', x: 582, y: 386, text: '2. 正、逆反應速率「同時」加快', size: 16.5, color: '#2E5BFF' },
          { type: 'text', x: 582, y: 422, text: '3. 反應前後質量與性質不變', size: 16.5 },
          { type: 'text', x: 582, y: 462, text: '✗ 注意：不會改變反應熱 ΔH 或產量！', size: 15.5, color: '#E85D3F' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '為什麼正逆反應會一起加速？因為「山丘」在反應物和生成物中間！山頭變矮了，不管你是從左邊翻到右邊（正反應），還是從右邊翻回左邊（逆反應），要爬的高度都一樣變少了！',
        callout: { type: 'callout', bx: 565, by: 525, targetX: 280, targetY: 310, text: '左右兩邊翻山都變輕鬆了！' },
      },
      analogy: {
        reply: '原本從台北到宜蘭要翻過九彎十八拐的北宜公路，現在挖了雪山隧道（催化劑）！起點跟終點海拔都沒變，但來回兩邊通車都變快了，而且隧道本身不會因為車子經過就消失。',
      },
    },
    notes: [
      '催化劑提供活化能較低的新反應途徑，使更多分子能跨過門檻。',
      '催化劑會同時加快正反應與逆反應速率，因此能更早達成平衡，但不改變平衡點或總產量。',
      '催化劑不改變反應熱（ΔH），且反應前後本身的質量與化學性質不變。',
    ],
    pitfall: '常錯考點：誤以為「多加催化劑可以做出更多產物」。錯！催化劑只能讓你「更快拿到」產物，總產量不會增加。',
    quiz: [
      {
        q: '加入催化劑後，下列哪一個物理量「不會」改變？',
        options: ['活化能', '反應速率', '反應熱 ΔH（起點與終點能量差）'],
        answer: 2,
        explain: '催化劑只降低中間過渡態的山丘高度，不改變反應物與生成物原本的能量差 ΔH。',
      },
      {
        q: '在可逆反應中加入催化劑，對正反應和逆反應的影響是？',
        options: ['只加速正反應', '正、逆反應速率同時加快', '正反應加快、逆反應變慢'],
        answer: 1,
        explain: '活化能降低對正逆兩方向同樣有效，兩者皆加速。',
      },
      {
        q: '雙氧水分解實驗中加入二氧化錳 (MnO₂) 作為催化劑，反應結束後過濾烘乾二氧化錳，其質量會？',
        options: ['變少', '變多', '不變'],
        answer: 2,
        explain: '催化劑參與中間過程後會再生，反應前後總質量不變。',
      },
    ],
  },
};

/**
 * Parse simple linear equation `ax + b = c` (with optional negative signs / spaces).
 */
function parseLinearEquation(text) {
  const cleaned = text.replace(/\s+/g, '').replace(/−/g, '-');
  const match = cleaned.match(/^([+-]?\d*)x([+-]\d+)?=([+-]?\d+)$/i);
  if (!match) return null;
  const aStr = match[1];
  const a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseInt(aStr, 10);
  const b = match[2] ? parseInt(match[2], 10) : 0;
  const c = parseInt(match[3], 10);
  if (!Number.isFinite(a) || a === 0 || !Number.isFinite(b) || !Number.isFinite(c)) return null;
  return { a, b, c, rhsAfterMove: c - b, xVal: (c - b) / a };
}

function buildLinearHomeworkLesson(eq, rawPrompt) {
  const { a, b, c, rhsAfterMove, xVal } = eq;
  const lhsText = `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
  const moveWord = b >= 0 ? `把 +${b} 移到右邊（兩邊同減 ${b}）` : `把 ${b} 移到右邊（兩邊同加 ${Math.abs(b)}）`;
  const xFormatted = Number.isInteger(xVal) ? String(xVal) : xVal.toFixed(2);

  return {
    id: 'hw-' + Date.now(),
    title: `作業引導：解方程式 ${lhsText} = ${c}`,
    subject: '數學',
    mode: 'homework',
    homeworkMeta: {
      stage: 0, // 0: asking what to move, 1: asking rhsAfterMove, 2: asking final x, 3: done
      a, b, c, rhsAfterMove, xVal, xFormatted, lhsText,
    },
    steps: [
      {
        title: '1. 先把題目擺上天平',
        speech: `我們先不急著偷看答案！把 ${lhsText} 等於 ${c} 想像成一個左右平衡的天平。想要讓 x 單獨留下來，第一步你覺得該先把誰從左邊請走？`,
        draw: [
          { type: 'title', x: 50, y: 58, text: `作業引導：${lhsText} = ${c}`, size: 28, underline: true },
          { type: 'balanceScale', cx: 290, cy: 310, left: lhsText, right: String(c), tilt: 0 },
          { type: 'box', x: 565, y: 140, w: 375, h: 175, fill: '#FFF7F4', color: '#E85D3F', label: '思考第一步（先自己試試看！）' },
          { type: 'text', x: 588, y: 205, text: '目標：讓左邊只剩下孤單的 x', size: 17 },
          { type: 'text', x: 588, y: 242, text: '先處理離 x 比較遠的常數項，', size: 16, color: '#53535D' },
          { type: 'text', x: 588, y: 274, text: '在右側聊天框告訴我：該先移走誰？', size: 16, color: '#E85D3F' },
        ],
      },
      {
        title: '2. 常數項移項',
        speech: `沒錯！${moveWord}。為了維持天平平衡，等號右邊原本是 ${c}，現在要變成 ${c} ${b >= 0 ? '減 ' + b : '加 ' + Math.abs(b)}。算算看右邊現在剩多少？`,
        draw: [
          { type: 'balanceScale', cx: 290, cy: 310, left: `${a === 1 ? '' : a}x`, right: String(rhsAfterMove), tilt: 0 },
          { type: 'box', x: 565, y: 335, w: 375, h: 130, fill: '#EEF3FF', color: '#2E5BFF', label: '第二步推導' },
          { type: 'text', x: 588, y: 396, text: `${lhsText} = ${c}`, size: 17, mono: true },
          { type: 'text', x: 588, y: 432, text: `→ ${a === 1 ? '' : a}x = ${c} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)} = ${rhsAfterMove}`, size: 18, mono: true, color: '#2E5BFF' },
        ],
      },
      {
        title: '3. 算出 x 的值',
        speech: `漂亮！現在左邊只剩 ${a} 個 x，右邊是 ${rhsAfterMove}。最後一步，兩邊一起除以 ${a}，你算出的 x 是多少呢？`,
        draw: [
          { type: 'box', x: 565, y: 485, w: 375, h: 105, fill: '#ECFDF3', color: '#16A34A', label: '第三步：解出 x ！' },
          { type: 'text', x: 588, y: 545, text: `x = ${rhsAfterMove} ÷ ${a} = ${xFormatted}  ✓`, size: 22, mono: true, color: '#16A34A' },
          { type: 'text', x: 588, y: 575, text: `代回驗算：${a}×(${xFormatted}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`, size: 14, mono: true, color: '#53535D' },
        ],
      },
    ],
    faq: {
      why: {
        reply: `因為等號就像天平！左邊做 ${b >= 0 ? '減 ' + b : '加 ' + Math.abs(b)}，右邊也必須做一樣的動作，這樣兩邊才會繼續相等。先處理加減、再處理乘除，是最不容易算錯的順序！`,
        callout: { type: 'callout', bx: 70, by: 450, targetX: 290, targetY: 310, text: '兩邊同時加減乘除，天平才不會歪！' },
      },
      analogy: {
        reply: '解方程式就像拆禮物！外層包裝（加減的常數）要先拆掉，才能打開裡面的盒子（乘在 x 前面的係數）。',
      },
    },
    notes: [
      `解一次方程式 ${lhsText} = ${c} 的原則：等號兩邊同加減、同乘除（維持天平平衡）。`,
      `步驟一：先將常數項 ${b} 移項，得到 ${a}x = ${rhsAfterMove}。`,
      `步驟二：兩邊同除以 ${a}，解得 x = ${xFormatted}，最後代回原式驗算。`,
    ],
    pitfall: '最常錯的地方：移項時忘記變號！（例如把 +5 移到右邊卻還是寫成 +5，應該要變 -5 才對）。',
    quiz: [
      {
        q: `在方程式 ${lhsText} = ${c} 中，把 ${b >= 0 ? '+' + b : b} 移到等號右邊後會變成什麼？`,
        options: [b >= 0 ? `+${b}` : `${b}`, b >= 0 ? `-${b}` : `+${Math.abs(b)}`, `×${b}`],
        answer: 1,
        explain: '移項等於兩邊同時進行相反運算，加變減、減變加。',
      },
      {
        q: `解出 x = ${xFormatted} 之後，如何最快檢查自己有沒有算錯？`,
        options: ['再背一次公式', `把 x = ${xFormatted} 代回原本左式看是否等於 ${c}`, '直接猜下一個整數'],
        answer: 1,
        explain: '代回原方程式驗算是最準確的自我檢查方法。',
      },
      {
        q: '如果方程式是 4x = 20，下一步該怎麼做？',
        options: ['兩邊同減 4', '兩邊同除以 4', '兩邊同乘以 4'],
        answer: 1,
        explain: '4x 表示 4 乘以 x，消除係數 4 需要用除法。',
      },
    ],
  };
}

/**
 * Parse two linear equations or a function expression y = ...
 */
function buildDynamicMathPlotLesson(prompt) {
  // Check for intersection of two lines like y = 2x + 1 and y = -x + 4
  const fnMatches = [...prompt.matchAll(/y\s*=\s*([0-9xX+\-*/.^()\s]+)/g)];
  if (fnMatches.length >= 2) {
    const expr1 = fnMatches[0][1].trim().replace(/(\d)(x)/gi, '$1*$2');
    const expr2 = fnMatches[1][1].trim().replace(/(\d)(x)/gi, '$1*$2');
    // Numeric scan for intersection
    let bestX = null;
    let bestY = null;
    let bestDiff = Infinity;
    try {
      const f1 = new Function('x', `return (${expr1.replace(/\^/g, '**')});`);
      const f2 = new Function('x', `return (${expr2.replace(/\^/g, '**')});`);
      for (let x = -6; x <= 6; x += 0.05) {
        const d = Math.abs(f1(x) - f2(x));
        if (d < bestDiff) {
          bestDiff = d;
          bestX = Math.round(x * 100) / 100;
          bestY = Math.round(f1(x) * 100) / 100;
        }
      }
    } catch (_) {}

    const pts = bestDiff < 0.25 && bestX !== null
      ? [{ x: bestX, y: bestY, color: '#E85D3F', label: `交點 (${bestX}, ${bestY})` }]
      : [];

    return {
      id: 'plot-' + Date.now(),
      title: `函數交點圖解：y = ${fnMatches[0][1].trim()} 與 y = ${fnMatches[1][1].trim()}`,
      subject: '數學',
      mode: 'topic',
      steps: [
        {
          title: '1. 畫出兩條函數圖形',
          speech: '與其硬算聯立方程式，我們先讓白板把兩條線都算出來畫上去！兩條線同時滿足的點，就是它們碰頭的地方。',
          draw: [
            { type: 'title', x: 50, y: 58, text: '函數圖形與聯立交點', size: 27, underline: true },
            {
              type: 'functionPlot',
              x: 55, y: 110, w: 470, h: 420,
              xMin: -4, xMax: 5, yMin: -4, yMax: 8,
              curves: [
                { expr: expr1, color: '#2E5BFF', width: 3.2, label: `y = ${fnMatches[0][1].trim()}`, labelX: 1.8 },
                { expr: expr2, color: '#16A34A', width: 3.2, label: `y = ${fnMatches[1][1].trim()}`, labelX: 2.2 },
              ],
              points: pts,
            },
            { type: 'box', x: 560, y: 130, w: 380, h: 200, fill: '#EEF3FF', color: '#2E5BFF', label: '幾何與代數的連結' },
            { type: 'text', x: 582, y: 192, text: `① 藍線：y = ${fnMatches[0][1].trim()}`, size: 17, mono: true, color: '#2E5BFF' },
            { type: 'text', x: 582, y: 228, text: `② 綠線：y = ${fnMatches[1][1].trim()}`, size: 17, mono: true, color: '#16A34A' },
            { type: 'text', x: 582, y: 272, text: pts.length ? `★ 紅點交會處：(${bestX}, ${bestY})` : '觀察兩條曲線的趨勢', size: 18, color: '#E85D3F' },
          ],
        },
        {
          title: '2. 聯立驗證交點',
          speech: pts.length
            ? `看圖一眼就看到兩條線交在 (${bestX}, ${bestY})！這代表把 x 等於 ${bestX} 代進兩條式子，算出來的 y 都會剛好是 ${bestY}。`
            : '在座標軸上畫出來之後，你就能一眼看出兩條曲線的變化速度與交會位置！',
          draw: [
            { type: 'box', x: 560, y: 360, w: 380, h: 150, fill: '#ECFDF3', color: '#16A34A', label: '重點結論' },
            { type: 'text', x: 582, y: 422, text: '「聯立方程式的解」', size: 18, color: '#1B1B1F' },
            { type: 'text', x: 582, y: 458, text: '＝「兩條線圖形的交點座標」', size: 18, color: '#16A34A' },
          ],
        },
      ],
      faq: {
        why: { reply: '因為曲線上的每一個點，都是「滿足那條方程式的 (x, y)」。所以同時在兩條線上的交點，就是同時滿足兩個方程式的解！' },
        analogy: { reply: '就像兩位朋友約好在不同路線上騎車，只有兩條路線在十字路口交叉的那一點，他們才會在同一時間碰面！' },
      },
      notes: [
        '方程式的圖形是所有滿足該式子 (x, y) 的集合。',
        '兩條函數圖形的交點座標，正好就是聯立方程式的共同解。',
      ],
      pitfall: '若兩條直線斜率相同但截距不同，它們會互相平行、永不相交，代表聯立方程式「無解」。',
      quiz: [
        { q: '兩條直線的圖形交於 (1, 3)，這代表什麼意義？', options: ['x=1, y=3 同時滿足兩條直線方程式', '兩條線互相平行', '斜率都是 3'], answer: 0, explain: '交點同時落在兩條直線上，故座標同時符合兩條式子。' },
        { q: '如果兩條直線平行且不重合，聯立方程式會有幾個解？', options: ['1 個解', '無解', '無限多解'], answer: 1, explain: '平行線沒有交點，因此無解。' },
      ],
    };
  }

  // Single function plot e.g. y = x^2 - 2x or x^2
  if (fnMatches.length === 1 || /\bx\^?2\b|\bsin\b|\bcos\b/i.test(prompt)) {
    const rawExpr = fnMatches[0] ? fnMatches[0][1].trim() : 'x^2';
    const jsExpr = rawExpr.replace(/(\d)(x)/gi, '$1*$2').replace(/\^/g, '**');
    return {
      id: 'fn-' + Date.now(),
      title: `函數圖形解析：y = ${rawExpr}`,
      subject: '數學',
      mode: 'topic',
      steps: [
        {
          title: '1. 描繪函數圖形',
          speech: `我們把函數 y 等於 ${rawExpr} 在座標平面上即時算出來並畫給你看！注意看曲線在通過原點與頂點時的變化速度。`,
          draw: [
            { type: 'title', x: 50, y: 58, text: `函數圖解：y = ${rawExpr}`, size: 27, underline: true },
            {
              type: 'functionPlot',
              x: 55, y: 110, w: 480, h: 420,
              xMin: -4, xMax: 4, yMin: -4, yMax: 8,
              curves: [{ expr: jsExpr, color: '#2E5BFF', width: 3.4, label: `y = ${rawExpr}`, labelX: 1.6 }],
            },
            { type: 'box', x: 565, y: 130, w: 375, h: 190, fill: '#EEF3FF', color: '#2E5BFF', label: '看懂函數圖形的 3 個關鍵' },
            { type: 'text', x: 588, y: 195, text: '1. x 軸截距：圖形碰到橫軸的地方', size: 16 },
            { type: 'text', x: 588, y: 232, text: '2. y 軸截距：x = 0 時的高度', size: 16 },
            { type: 'text', x: 588, y: 269, text: '3. 升降趨勢：斜率正負與極值頂點', size: 16, color: '#E85D3F' },
          ],
        },
      ],
      faq: {
        why: { reply: '這個圖形不是手繪亂畫的，而是白板引擎針對幾百個 x 座標逐一算出真實 y 值連出來的！' },
        analogy: { reply: '你可以把函數想成一台飲料販賣機：你投進一個 x，機器就吐出唯一的高度 y，把所有高度點連起來就是曲線。' },
      },
      notes: [`函數 y = ${rawExpr} 在平面上的變化可以直接透過截距與極值觀察。`],
      pitfall: '畫函數圖形時記得先檢查 x=0 的位置與曲線對稱軸，避免只描兩個點就誤畫成直線。',
      quiz: [
        { q: '想找函數圖形跟 y 軸的交點，應該代入哪個值？', options: ['y = 0', 'x = 0', 'x = 1'], answer: 1, explain: 'y 軸上的每一點 x 座標都是 0。' },
      ],
    };
  }
  return null;
}

/**
 * Fallback structured lesson builder when user enters custom notes/topic in Built-in mode.
 */
function buildCustomFallbackLesson(prompt, mode, attachments = []) {
  const lower = prompt.toLowerCase();
  if (lower.includes('拋') || lower.includes('弧線') || lower.includes('球') || lower.includes('重力')) {
    return structuredClone(CURATED_LESSONS.projectile);
  }
  if (lower.includes('導數') || lower.includes('微分') || lower.includes('切線') || lower.includes('斜率')) {
    return structuredClone(CURATED_LESSONS.derivative);
  }
  if (lower.includes('血型') || lower.includes('基因') || lower.includes('遺傳') || lower.includes('棋盤')) {
    return structuredClone(CURATED_LESSONS.genetics);
  }
  if (lower.includes('月亮') || lower.includes('圓缺') || lower.includes('月相')) {
    return structuredClone(CURATED_LESSONS.moon);
  }
  if (lower.includes('催化劑') || lower.includes('反應速率') || lower.includes('活化能')) {
    return structuredClone(CURATED_LESSONS.catalyst);
  }

  const eq = parseLinearEquation(prompt.replace(/^解方程式[:：]?\s*/i, ''));
  if (eq) {
    return buildLinearHomeworkLesson(eq, prompt);
  }

  const mathPlot = buildDynamicMathPlotLesson(prompt);
  if (mathPlot) return mathPlot;

  // Extract notes from text attachments or prompt
  const textAtts = attachments.filter((a) => a.textContent).map((a) => a.textContent).join('\n');
  const combinedText = (textAtts ? textAtts + '\n' : '') + prompt;
  const sentences = combinedText
    .split(/[。！？\n；]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .slice(0, 4);

  const pt1 = (sentences[0] || prompt).slice(0, 26);
  const pt2 = (sentences[1] || '拆解核心因果與關鍵定義').slice(0, 26);
  const pt3 = (sentences[2] || '畫出比較圖與常見易錯陷阱').slice(0, 26);

  const modeLabel = mode === 'homework' ? '作業引導' : mode === 'exam' ? '考前重點串講' : '主題概念拆解';
  const shortTitle = prompt.length > 24 ? prompt.slice(0, 24) + '…' : prompt;

  return {
    id: 'custom-' + Date.now(),
    title: `${modeLabel}：${shortTitle}`,
    subject: '綜合',
    mode,
    steps: [
      {
        title: '1. 拆解問題核心',
        speech: mode === 'homework'
          ? `收到你的問題「${shortTitle}」！我們先別急著看結論，先把題目條件放上白板整理清楚。你先看看第一步你會從哪裡下手？`
          : `好，我們今天一起來搞懂「${shortTitle}」！我先把這題的核心拆成三個好理解的模塊畫在白板上。`,
        draw: [
          { type: 'title', x: 50, y: 58, text: shortTitle, size: 26, underline: true },
          { type: 'box', x: 55, y: 120, w: 280, h: 140, fill: '#EEF3FF', color: '#2E5BFF', label: '① 起點與已知條件' },
          { type: 'text', x: 75, y: 190, text: pt1, size: 15.5 },
          { type: 'arrow', x1: 345, y1: 190, x2: 405, y2: 190, color: '#1B1B1F', label: '推導' },
          { type: 'box', x: 415, y: 120, w: 280, h: 140, fill: '#FFF7F4', color: '#E85D3F', label: '② 關鍵機制 / 轉折' },
          { type: 'text', x: 435, y: 190, text: pt2, size: 15.5 },
        ],
      },
      {
        title: '2. 建立因果與易錯提醒',
        speech: `接著看第三步：把前面兩個觀念串起來，並特別標出最容易搞混的陷阱。如果在右上角「AI 引擎設定」填入你的 Gemini 或 OpenAI Key，任何冷門題目與照片也都能即時生成專屬手繪圖解喔！`,
        draw: [
          { type: 'arrow', x1: 705, y1: 190, x2: 755, y2: 190, color: '#1B1B1F' },
          { type: 'box', x: 765, y: 120, w: 195, h: 140, fill: '#ECFDF3', color: '#16A34A', label: '③ 核心結論' },
          { type: 'text', x: 782, y: 190, text: pt3, size: 14.5 },
          { type: 'box', x: 55, y: 310, w: 660, h: 190, fill: '#FFFFFF', color: '#1B1B1F', label: '老師的白板筆記區' },
          { type: 'text', x: 78, y: 375, text: '• 先搞清楚「為什麼會發生」，再記結論與公式', size: 16.5 },
          { type: 'text', x: 78, y: 415, text: '• 隨時點右側「這一步為什麼？」或用畫筆圈出你不理解的地方', size: 16.5, color: '#2E5BFF' },
          { type: 'text', x: 78, y: 455, text: '• 提示：於設定中貼上 Gemini / OpenAI Key 可解鎖全學科任意照片解析', size: 14.5, color: '#848490' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '這部分最關鍵的是把已知條件跟目標拆開！告訴我你目前卡在哪一個詞彙或步驟，我用更白話的例子畫給你看。',
        callout: { type: 'callout', bx: 55, by: 520, targetX: 555, targetY: 260, text: '就是這個關鍵轉折點！' },
      },
      analogy: {
        reply: '把這個概念想成蓋房子：步驟 ① 是打地基（已知條件），步驟 ② 是立起樑柱（規則推導），最後才會得出屋頂的結論！',
      },
    },
    notes: [
      `核心主題：${shortTitle}`,
      `關鍵拆解：${pt1} → ${pt2} → ${pt3}`,
    ],
    pitfall: '學習時避免只背最後一句結論，試著遮住白板第 2 格自己重講一次因果關係。',
    quiz: [
      {
        q: `關於「${shortTitle}」，下列哪種學習順序最能真正掌握？`,
        options: ['直接背答案', '先釐清已知條件，再推導中間機制，最後自我驗算', '跳過圖片只看文字'],
        answer: 1,
        explain: '理解因果推導鏈比死記結論更穩固，也能應付變化題。',
      },
    ],
  };
}

window.LessonLibrary = {
  SUGGESTION_POOL,
  CURATED_LESSONS,
  parseLinearEquation,
  buildCustomFallbackLesson,
};
