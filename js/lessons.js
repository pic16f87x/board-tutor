/**
 * K-9 (國小 / 國中) Interactive Whiteboard Lessons + Dynamic Equation/Graph Builder.
 */
const SUGGESTION_POOL = [
  { id: 'fraction-add', grade: 'elem', gradeLabel: '國小五年級', subject: '數學', mode: 'topic', prompt: '1/2 + 1/3 為什麼不能直接把分子和分母相加？' },
  { id: 'triangle-area', grade: 'elem', gradeLabel: '國小五年級', subject: '數學', mode: 'topic', prompt: '三角形面積為什麼要「底 × 高 ÷ 2」？' },
  { id: 'moon', grade: 'elem', gradeLabel: '國小四年級', subject: '自然', mode: 'topic', prompt: '月亮為什麼有時像香蕉、有時像大圓盤？' },
  { id: 'elem-eq', grade: 'elem', gradeLabel: '國小六年級', subject: '數學', mode: 'homework', prompt: '解未知數：3x + 5 = 20' },
  { id: 'pythagoras', grade: 'junior', gradeLabel: '國二數學', subject: '數學', mode: 'topic', prompt: '畢氏定理：直角三角形兩股 3 和 4，斜邊為什麼是 5？' },
  { id: 'linear-hw', grade: 'junior', gradeLabel: '國一數學', subject: '數學', mode: 'homework', prompt: '解一元一次方程式：2x + 5 = 17' },
  { id: 'genetics', grade: 'junior', gradeLabel: '國一生物', subject: '生物', mode: 'exam', prompt: '段考複習：A 型和 B 型爸媽也會生出 O 型小孩嗎？' },
  { id: 'intersection', grade: 'junior', gradeLabel: '國一數學', subject: '數學', mode: 'topic', prompt: '兩條直線 y = 2x + 1 和 y = -x + 4 在哪裡交會？' },
  { id: 'projectile', grade: 'junior', gradeLabel: '國三理化', subject: '理化', mode: 'topic', prompt: '水平丟出的球跟直接放手掉下的球，誰先落地？' },
  { id: 'catalyst', grade: 'junior', gradeLabel: '國二理化', subject: '理化', mode: 'topic', prompt: '雙氧水加了二氧化錳（催化劑），反應為什麼變快？' },
];

const CURATED_LESSONS = {
  'fraction-add': {
    id: 'fraction-add',
    title: '異分母分數加法：為什麼 1/2 + 1/3 不是 2/5？',
    gradeLabel: '國小五年級',
    subject: '數學',
    mode: 'topic',
    steps: [
      {
        title: '1. 先畫出兩條一樣長的蛋糕',
        speech: '很多同學看到二分之一加三分之一，會不小心把分子加分子、分母加分母變成五分之二！我們把兩條一樣長的蛋糕畫在白板上：左邊切 2 塊取 1 塊，右邊切 3 塊取 1 塊，每一塊大小根本不一樣，不能直接加！',
        draw: [
          { type: 'title', x: 50, y: 58, text: '異分母分數加法：1/2 + 1/3', size: 28, underline: true, underlineColor: '#0F766E' },
          { type: 'fractionBars', x: 55, y: 150, w: 420, splitToSix: false },
          { type: 'box', x: 535, y: 130, w: 405, h: 170, fill: '#FEF2F2', color: '#DC2626', label: '✗ 常見陷阱：不能直接相加！' },
          { type: 'text', x: 558, y: 192, text: '1/2 的每一塊比較大，1/3 的每一塊比較小', size: 16 },
          { type: 'text', x: 558, y: 226, text: '大小不同，直接寫 2/5 一定錯！', size: 16, color: '#DC2626' },
          { type: 'text', x: 558, y: 262, text: '解法：想辦法切成「一樣大小的小塊」', size: 16, color: '#0F766E' },
        ],
      },
      {
        title: '2. 通分：全部切成 6 等分',
        speech: '2 和 3 的最小公倍數是 6！我們用細刀把原本 2 份的再各切 3 刀、原本 3 份的再各切 2 刀，兩條就都變成「6 等分」了！現在 1/2 變成 3/6，1/3 變成 2/6，每一小塊一樣大，合起來就是六分之五！',
        draw: [
          { type: 'fractionBars', x: 55, y: 150, w: 420, splitToSix: true },
          { type: 'box', x: 535, y: 325, w: 405, h: 195, fill: '#ECFDF5', color: '#0F766E', label: '✓ 通分步驟（找最小公倍數 6）' },
          { type: 'text', x: 558, y: 386, text: '1/2 = (1×3) / (2×3) = 3/6', size: 18, mono: true, color: '#0F766E' },
          { type: 'text', x: 558, y: 424, text: '1/3 = (1×2) / (3×2) = 2/6', size: 18, mono: true, color: '#2563EB' },
          { type: 'text', x: 558, y: 468, text: '3/6 ＋ 2/6 ＝ 5/6', size: 22, mono: true, color: '#D97706' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為分母代表「一條蛋糕總共切幾等分」，只有分母相同時，每一小塊的大小才一樣，這時候分子（有幾塊）才能直接相加喔！',
        callout: { type: 'callout', bx: 535, by: 530, targetX: 250, targetY: 390, text: '分母一樣＝每一小塊一樣大！' },
      },
      analogy: {
        reply: '就像 1 張五百元鈔票加 1 枚十元硬幣，不能說等於 2 元！要先通通換成「十元」當單位，變成 50 個十元 + 1 個十元 = 51 個十元。',
      },
    },
    notes: [
      '異分母分數相加或相減前，必須先「通分」，讓分母變得一樣。',
      '通分時找出兩個分母的最小公倍數當作新分母，分子與分母要同乘以相同的數（擴分）。',
      '分母相同後，只把「分子相加」，分母維持不變。',
    ],
    pitfall: '大魔王錯法：寫成 1/2 + 1/3 = 2/5。記住！1/2 本身就已經是 0.5 了，2/5 只有 0.4，越加反而越小就不合理囉！',
    quiz: [
      { q: '計算 1/3 + 1/4 時，最適合先通分成幾分之幾？', options: ['分母 7', '分母 12', '分母 34'], answer: 1, explain: '3 和 4 的最小公倍數是 12，通分後為 4/12 + 3/12 = 7/12。' },
      { q: '將 1/2 擴分成分母為 6 的分數，分子應該變成多少？', options: ['1', '3', '6'], answer: 1, explain: '分母 2 乘以 3 變成 6，分子 1 也要乘以 3 變成 3。' },
      { q: '3/8 + 2/8 的答案是多少？', options: ['5/16', '5/8', '6/8'], answer: 1, explain: '同分母相加時，分母不變，分子 3 + 2 = 5。' },
    ],
  },

  'triangle-area': {
    id: 'triangle-area',
    title: '國小幾何：三角形面積為什麼要「底 × 高 ÷ 2」？',
    gradeLabel: '國小五年級',
    subject: '數學',
    mode: 'topic',
    steps: [
      {
        title: '1. 先畫一個三角形並標出底與高',
        speech: '我們常常背口訣「底乘以高除以二」，但為什麼最後一定要除以 2 呢？先在方格紙上畫出一個三角形，底是 b、垂直高度是 h。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '三角形面積公式的秘密：底 × 高 ÷ 2', size: 27, underline: true, underlineColor: '#0F766E' },
          { type: 'triangleAreaDemo', x: 75, y: 165, showCopy: false },
          { type: 'box', x: 530, y: 150, w: 410, h: 155, fill: '#ECFDF5', color: '#0F766E', label: '① 先認識底和高' },
          { type: 'text', x: 552, y: 212, text: '• 底 (b)：三角形最下面的邊長', size: 16.5 },
          { type: 'text', x: 552, y: 248, text: '• 高 (h)：從頂點垂直畫到底的距離', size: 16.5, color: '#DC2626' },
          { type: 'text', x: 552, y: 282, text: '問問看：只用「底 × 高」會算出誰？', size: 16, color: '#485A52' },
        ],
      },
      {
        title: '2. 複製一個倒過來拼在一起！',
        speech: '魔法來了！把一模一樣的三角形複製一個、倒過來拼在右邊，兩個三角形剛好合體成一個完整的「平行四邊形」！平行四邊形面積就是底乘以高，那原本的一個三角形，當然就是它的一半，所以要除以 2！',
        draw: [
          { type: 'triangleAreaDemo', x: 75, y: 165, showCopy: true },
          { type: 'box', x: 530, y: 330, w: 410, h: 205, fill: '#EFF6FF', color: '#2563EB', label: '② 兩塊拼成平行四邊形' },
          { type: 'text', x: 552, y: 392, text: '2 個相同三角形 ＝ 1 個平行四邊形', size: 16.5 },
          { type: 'text', x: 552, y: 428, text: '平行四邊形面積 ＝ 底 × 高', size: 17, mono: true, color: '#2563EB' },
          { type: 'text', x: 552, y: 472, text: '1 個三角形面積 ＝ 底 × 高 ÷ 2', size: 19, mono: true, color: '#0F766E' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為任何一個三角形，只要拿另一塊完全一樣的倒過來接上去，一定能拼出底和高都相同的平行四邊形（或長方形）！所以一個三角形永遠剛好占「底×高」的一半。',
        callout: { type: 'callout', bx: 530, by: 545, targetX: 290, targetY: 250, text: '綠＋藍剛好＝整個平行四邊形！' },
      },
      analogy: {
        reply: '就像拿一張長方形吐司斜斜對切一刀，會變成兩片一樣大的直角三角形！整片吐司是底×高，其中一片三角形當然要除以 2。',
      },
    },
    notes: [
      '兩個完全相同的三角形，可以拼成一個「底相同、高相同」的平行四邊形。',
      '平行四邊形面積 = 底 × 高，因此三角形面積 = 底 × 高 ÷ 2。',
      '算面積時「高」一定要跟「底」互相垂直（形成直角）。',
    ],
    pitfall: '最常錯：忘記除以 2，或是找錯「高」（拿斜邊的長度當作高來乘）。',
    quiz: [
      { q: '一個三角形的底是 10 公分、高是 6 公分，它的面積是多少平方公分？', options: ['60', '30', '16'], answer: 1, explain: '10 × 6 ÷ 2 = 30 平方公分。' },
      { q: '為什麼算三角形面積最後要「除以 2」？', options: ['因為三角形只有兩條邊', '因為兩個相同的三角形才能拼成一個底×高的平行四邊形', '因為數字太大要變小'], answer: 1, explain: '一個三角形剛好是同底同高平行四邊形面積的一半。' },
      { q: '如果三角形面積是 24 平方公分，底是 8 公分，高是多少公分？', options: ['3 公分', '6 公分', '12 公分'], answer: 1, explain: '先把面積乘以 2 還原成平行四邊形 (48)，再除以底 8，得到高為 6 公分。' },
    ],
  },

  pythagoras: {
    id: 'pythagoras',
    title: '國二數學：畢氏定理（3² + 4² 為什麼等於 5²？）',
    gradeLabel: '國二數學',
    subject: '數學',
    mode: 'topic',
    steps: [
      {
        title: '1. 先看直角三角形的三條邊',
        speech: '在直角三角形裡，夾住直角的那兩條比較短的邊叫做「股」，對面最長的那條叫做「斜邊」。如果兩股分別是 3 和 4，為什麼斜邊剛好是 5，而不是 3 加 4 等於 7 呢？',
        draw: [
          { type: 'title', x: 50, y: 58, text: '畢氏定理（商高定理）：a² + b² = c²', size: 27, underline: true, underlineColor: '#0F766E' },
          { type: 'pythagorasDemo', x: 185, y: 340, showSquares: false },
          { type: 'box', x: 515, y: 135, w: 425, h: 165, fill: '#F2F6F4', color: '#182420', label: '直角三角形的邊長名稱' },
          { type: 'text', x: 538, y: 198, text: '• 兩股 (a, b)：夾出 90° 直角的兩條短邊', size: 16 },
          { type: 'text', x: 538, y: 234, text: '• 斜邊 (c)：直角對面最長的邊', size: 16, color: '#D97706' },
          { type: 'text', x: 538, y: 270, text: '注意：邊長不能直接相加 (3 + 4 ≠ c)', size: 15.5, color: '#DC2626' },
        ],
      },
      {
        title: '2. 把三條邊往外長出正方形！',
        speech: '秘密藏在「面積」裡！我們在三條邊的外面各自畫出正方形：邊長 3 的正方形面積是 9，邊長 4 的正方形面積是 16。神奇的事情發生了：9 加 16 剛好等於 25，也就是斜邊正方形 5 的平方！',
        draw: [
          { type: 'pythagorasDemo', x: 185, y: 340, showSquares: true },
          { type: 'box', x: 515, y: 325, w: 425, h: 210, fill: '#ECFDF5', color: '#0F766E', label: '★ 核心公式：兩股平方和 ＝ 斜邊平方' },
          { type: 'text', x: 538, y: 386, text: '綠色面積 (3²) ＋ 藍色面積 (4²) ＝ 橘色面積 (c²)', size: 15.5 },
          { type: 'text', x: 538, y: 426, text: '9 ＋ 16 ＝ 25 ＝ 5²', size: 20, mono: true, color: '#0F766E' },
          { type: 'text', x: 538, y: 468, text: '所以斜邊 c ＝ √25 ＝ 5 ！', size: 19, mono: true, color: '#D97706' },
          { type: 'text', x: 538, y: 504, text: '必背常見直角三角形組：(3,4,5)、(5,12,13)、(8,15,17)', size: 13.5, color: '#485A52' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '只有「直角三角形」才成立喔！當角度剛好是 90 度時，兩股各自平方的面積總和才會精準等於斜邊的平方面積。',
        callout: { type: 'callout', bx: 515, by: 545, targetX: 195, targetY: 330, text: '一定要有 90° 直角才能套用！' },
      },
      analogy: {
        reply: '想像兩塊正方形草皮（面積 9 坪和 16 坪），把它們的所有草皮全部鋪到斜邊那塊大正方形地基上，不多不少剛好鋪滿 25 坪！',
      },
    },
    notes: [
      '在直角三角形中，兩股平方和等於斜邊平方：a² + b² = c²（c 為斜邊）。',
      '已知斜邊 c 與一股 a 時，求另一股要用減法：b = √(c² - a²)。',
      '國二段考超常見比例：(3, 4, 5)、(6, 8, 10)、(5, 12, 13)、(7, 24, 25)、(8, 15, 17)。',
    ],
    pitfall: '超級常錯：題目給「斜邊 13、一股 5」，學生沒看清楚直接套 13² + 5²！記得最長的斜邊永遠放在等號單獨那一邊！',
    quiz: [
      { q: '直角三角形的兩股長分別為 5 和 12，斜邊長是多少？', options: ['17', '13', '7'], answer: 1, explain: '5² + 12² = 25 + 144 = 169 = 13²，故斜邊為 13。' },
      { q: '若直角三角形的斜邊是 10、其中一股是 6，另一股是多少？', options: ['8', '16', '4'], answer: 0, explain: '另一股為 √(10² - 6²) = √(100 - 36) = √64 = 8。' },
      { q: '下列哪一組邊長「不能」圍成直角三角形？', options: ['3, 4, 5', '5, 12, 13', '2, 3, 4'], answer: 2, explain: '2² + 3² = 13，不等於 4² (16)，故不是直角三角形。' },
    ],
  },

  projectile: {
    id: 'projectile',
    title: '國三理化：水平丟出 vs 直接放手，誰先落地？',
    gradeLabel: '國三理化',
    subject: '理化',
    mode: 'topic',
    steps: [
      {
        title: '1. 先看生活中的現象',
        speech: '你問水平丟出去的球跟直接放手掉下去的球，誰先落地？在白板上我們同時看兩個運動：往前等速移動，跟往下受到重力加速掉落。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '平拋運動與自由落體比較', size: 27, underline: true, underlineColor: '#0F766E' },
          { type: 'box', x: 560, y: 120, w: 380, h: 125, fill: '#ECFDF5', color: '#0F766E', label: '先掌握兩個方向互相獨立' },
          { type: 'text', x: 582, y: 182, text: '① 水平方向：只靠慣性往前跑', size: 17 },
          { type: 'text', x: 582, y: 216, text: '② 垂直方向：地球重力一直往下拉', size: 17, color: '#DC2626' },
        ],
      },
      {
        title: '2. 桌邊兩顆球實驗',
        speech: '想像桌邊有 A、B 兩顆一模一樣的球：A 直接放手，B 往水平用力推出去。仔細看白板動畫，你猜誰先碰到地板？',
        draw: [
          { type: 'projectileDemo', x: 50, y: 120, w: 470, h: 370, showForces: false },
          { type: 'box', x: 560, y: 270, w: 380, h: 105, fill: '#FFFBEB', color: '#D97706', label: '猜猜看：誰先落地？' },
          { type: 'text', x: 582, y: 332, text: 'A 直接放手 vs B 水平丟出（同高度）', size: 16, color: '#485A52' },
        ],
      },
      {
        title: '3. 畫出受力揭曉答案',
        speech: '答案是「同時落地」！因為離開手之後，並沒有往前的推力推它了，兩顆球在垂直方向受到的重力一模一樣，所以每一秒鐘下降的高度完全相同！',
        draw: [
          { type: 'projectileDemo', x: 50, y: 120, w: 470, h: 370, showForces: true },
          { type: 'box', x: 560, y: 395, w: 380, h: 145, fill: '#EFF6FF', color: '#2563EB', label: '✓ 同時落地！原因在受力' },
          { type: 'text', x: 582, y: 454, text: '離開手後：沒有往前的推力！', size: 17, color: '#DC2626' },
          { type: 'text', x: 582, y: 486, text: '只有重力往下拉 → 落地時間相同', size: 16 },
          { type: 'text', x: 582, y: 518, text: '推得越快 ＝ 飛得越遠，但時間不變', size: 15, color: '#0F766E' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '水平方向的速度不會幫球抵抗地心引力！垂直向下掉多快，只跟高度和重力加速度 g 有關，所以兩顆球在每一瞬間的高度都一樣高。',
        callout: { type: 'callout', bx: 565, by: 265, targetX: 280, targetY: 270, text: '水平與垂直方向互不干擾！' },
      },
      analogy: {
        reply: '就像在平穩行駛的高鐵車廂裡讓橡皮擦掉到地上：對車外月台的人看來橡皮擦走弧線，對你來說直直掉落，但落地花的時間一模一樣！',
      },
    },
    notes: [
      '忽略空氣阻力時，平拋運動可拆成「水平等速」與「垂直自由落體」。',
      '同高度同時放手與水平拋出的物體，一定會同時落地。',
      '水平初速度越大，飛行的水平距離越遠，但滯空時間不變。',
    ],
    pitfall: '理化常考陷阱：問「球飛在空中時受到幾個力？」記得離手後原本推它的力就沒了，只剩重力（若不計空氣阻力）。',
    quiz: [
      { q: '同一高度，A 球自由落下、B 球水平射出（不計空氣阻力），誰先著地？', options: ['A 球', 'B 球', '同時著地'], answer: 2, explain: '垂直方向初速皆為 0 且加速度皆為 g，故同時著地。' },
      { q: '把水平射出的速度提高成 2 倍，落地時間會怎麼變？', options: ['不變', '變成 2 倍', '變成一半'], answer: 0, explain: '落地時間只取決於高度，與水平速度無關。' },
      { q: '球離開手飛在空中時，還受到手給它的水平推力嗎？', options: ['有，一直推到落地', '沒有，離手後只受重力', '在最高點才沒有'], answer: 1, explain: '球靠慣性繼續前進，接觸結束後推力就消失了。' },
    ],
  },

  genetics: {
    id: 'genetics',
    title: '國一生物：血型遺傳與棋盤方格法',
    gradeLabel: '國一生物',
    subject: '生物',
    mode: 'exam',
    steps: [
      {
        title: '1. 認識顯性與隱性基因',
        speech: '國一下生物段考必考 ABO 血型遺傳！人類血型由一對等位基因決定，其中 Iᴬ 和 Iᴮ 是顯性，小寫 i 是隱性，只有兩個都是 i 才會表現出 O 型。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '段考必考：ABO 血型棋盤方格法', size: 26, underline: true, underlineColor: '#0F766E' },
          { type: 'box', x: 55, y: 110, w: 420, h: 195, fill: '#EFF6FF', color: '#2563EB', label: '① 基因型與血型對照表' },
          { type: 'text', x: 80, y: 170, text: 'A 型：IᴬIᴬ 或 Iᴬi', size: 18, mono: true },
          { type: 'text', x: 80, y: 205, text: 'B 型：IᴮIᴮ 或 Iᴮi', size: 18, mono: true },
          { type: 'text', x: 80, y: 240, text: 'AB型：IᴬIᴮ （兩者都表現）', size: 18, mono: true, color: '#2563EB' },
          { type: 'text', x: 80, y: 275, text: 'O 型：ii （必須兩個隱性）', size: 18, mono: true, color: '#DC2626' },
        ],
      },
      {
        title: '2. 畫棋盤方格算機率',
        speech: '如果爸爸是 A 型（Iᴬi）、媽媽是 B 型（Iᴮi），我們畫出棋盤方格一格一格配對！你看右下角那一格剛好兩個 i 碰在一起，所以有四分之一（25%）的機率生出 O 型小孩！',
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
          { type: 'box', x: 55, y: 335, w: 420, h: 170, fill: '#FFFBEB', color: '#D97706', label: '② 段考高頻陷阱題！' },
          { type: 'text', x: 78, y: 398, text: 'A 型 (Iᴬi) × B 型 (Iᴮi)', size: 18 },
          { type: 'text', x: 78, y: 434, text: '四種血型 A、B、AB、O 都有可能！', size: 17, color: '#DC2626' },
          { type: 'text', x: 78, y: 468, text: '生出 O 型 (ii) 機率 ＝ 1/4 ＝ 25%', size: 17, color: '#0F766E' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為小孩的兩個基因是一個從爸爸來、一個從媽媽來！就算爸媽自己表現為 A 型和 B 型，只要體內都藏著一個隱性 i，就有可能各自把 i 傳給小孩變成 ii（O 型）。',
        callout: { type: 'callout', bx: 550, by: 460, targetX: 780, targetY: 370, text: '爸媽各給一個 i → ii (O型)!' },
      },
      analogy: {
        reply: '想成抽顏色球：爸爸口袋有紅球(Iᴬ)和白球(i)，媽媽有藍球(Iᴮ)和白球(i)；兩人各盲抽一顆給小孩，剛好兩邊都抽到白球時，小孩就是 O 型！',
      },
    },
    notes: [
      'A 型基因型可能是 IᴬIᴬ 或 Iᴬi；B 型可能是 IᴮIᴮ 或 Iᴮi。',
      '雙親都帶有一個隱性 i 時，才有機會生出 O 型 (ii) 小孩。',
      '只要父母其中一方是 AB 型 (IᴬIᴮ)，小孩就絕不可能是 O 型。',
    ],
    pitfall: '題目只寫「A 型爸爸和 B 型媽媽」時，不要忘記他們可能是 Iᴬi 和 Iᴮi，四種血型都有機會生出來！',
    quiz: [
      { q: '爸爸是 AB 型、媽媽是 O 型，小孩「不可能」出現哪種血型？', options: ['A 型', 'B 型', 'O 型'], answer: 2, explain: 'AB 型爸爸一定給出 Iᴬ 或 Iᴮ，不可能給出 i，故不會生出 ii (O型)。' },
      { q: '若父母皆為 Iᴬi（都是 A 型），生出 O 型小孩的機率是多少？', options: ['0%', '25%', '50%'], answer: 1, explain: '棋盤方格四格中有 1 格為 ii，佔 25%。' },
      { q: 'O 型血型的基因型必定是？', options: ['Iᴬi', 'ii', 'IᴬIᴮ'], answer: 1, explain: 'i 為隱性基因，需成對出現才會表現 O 型。' },
    ],
  },

  moon: {
    id: 'moon',
    title: '國小自然：月亮為什麼會有陰晴圓缺？',
    gradeLabel: '國小四年級',
    subject: '自然',
    mode: 'topic',
    steps: [
      {
        title: '1. 月球不會自己發光',
        speech: '月亮本身其實像大石頭一樣不會發光，它是靠反射太陽光才亮起來的！所以月球永遠有一半被太陽照亮、一半是暗的。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '月相變化：為什麼有圓有缺？', size: 27, underline: true, underlineColor: '#0F766E' },
          { type: 'orbitDiagram', cx: 310, cy: 335, r: 140 },
          { type: 'box', x: 575, y: 130, w: 370, h: 130, fill: '#FFFBEB', color: '#D97706', label: '記住這件事' },
          { type: 'text', x: 598, y: 192, text: '月球永遠「一半亮、一半暗」', size: 17 },
          { type: 'text', x: 598, y: 224, text: '亮的那半邊永遠朝向太陽！', size: 17, color: '#D97706' },
        ],
      },
      {
        title: '2. 繞地球轉時，我們看到的角度不同',
        speech: '看白板左邊的動畫：月球繞著地球轉一圈大約 29.5 天。轉到太陽和地球中間時，亮面背對我們（初一新月）；轉到地球另一邊時，我們剛好看到整個亮面（十五滿月）！',
        draw: [
          { type: 'box', x: 575, y: 285, w: 370, h: 255, fill: '#EFF6FF', color: '#2563EB', label: '一個月的月相變化（農曆）' },
          { type: 'text', x: 598, y: 348, text: '🌑 農曆初一（朔）：看不到月亮亮面', size: 15.5 },
          { type: 'text', x: 598, y: 390, text: '🌓 農曆初七、八（上弦月）：亮右半邊', size: 15.5 },
          { type: 'text', x: 598, y: 432, text: '🌕 農曆十五（望）：圓圓的滿月！', size: 15.5, color: '#D97706' },
          { type: 'text', x: 598, y: 474, text: '🌗 農曆廿二、廿三（下弦月）：亮左半邊', size: 15.5 },
          { type: 'text', x: 598, y: 516, text: '✗ 注意：不是被雲或地球影子擋住喔！', size: 15, color: '#DC2626' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '平常的圓缺不是地球影子遮住喔！那是因為月球繞地球公轉時，我們從地球看過去，看到「亮的那半邊」的比例不一樣。',
        callout: { type: 'callout', bx: 580, by: 545, targetX: 310, targetY: 335, text: '是因為繞著地球轉的角度改變！' },
      },
      analogy: {
        reply: '在關燈的房間開一盞檯燈當太陽，你拿一顆白球繞著自己的頭轉一圈，就會看到球有時亮半顆、有時亮整顆！',
      },
    },
    notes: [
      '月球靠反射太陽光發亮，永遠是一半亮、一半暗。',
      '月相變化週期大約是農曆一個月（約 29.5 天）。',
      '農曆十五看到滿月，農曆初一幾乎看不到月亮。',
    ],
    pitfall: '常見誤解：以為月亮變彎是因為被地球影子遮到（其實那是少見的月食，不是每個月的月相變化）。',
    quiz: [
      { q: '月亮的光是從哪裡來的？', options: ['自己發光', '反射太陽光', '地球發光'], answer: 1, explain: '月球本身不發光，是反射太陽光。' },
      { q: '農曆哪一天最容易看到圓圓的滿月？', options: ['初一', '初八', '十五'], answer: 2, explain: '農曆十五（望）時月球亮面正對地球。' },
      { q: '從這一次滿月到下一次滿月，大約經過幾天？', options: ['7 天', '29.5 天', '365 天'], answer: 1, explain: '月球繞地球公轉造成的月相週期約 29.5 天。' },
    ],
  },

  catalyst: {
    id: 'catalyst',
    title: '國二理化：為什麼加了二氧化錳就狂冒泡泡？',
    gradeLabel: '國二理化',
    subject: '理化',
    mode: 'topic',
    steps: [
      {
        title: '1. 沒加催化劑前：要翻過很高的山',
        speech: '雙氧水自己放著也會慢慢分解成水跟氧氣，但速度超級慢！因為分子要反應前，必須先爬過一個很高的能量山丘（活化能）。',
        draw: [
          { type: 'title', x: 50, y: 58, text: '催化劑如何加快反應速率？', size: 27, underline: true, underlineColor: '#0F766E' },
          {
            type: 'functionPlot',
            x: 55, y: 110, w: 470, h: 410,
            xMin: 0, xMax: 6, yMin: 0, yMax: 8,
            curves: [{ expr: '3 + 3.6*Math.exp(-Math.pow(x-2.6, 2)/1.1) - 0.32*x', color: '#182420', width: 3.2, label: '無催化劑 (高山)', labelX: 2.3 }],
            points: [{ x: 2.6, y: 5.77, color: '#DC2626', label: '能量門檻很高' }],
          },
          { type: 'box', x: 560, y: 130, w: 380, h: 130, fill: '#FEF2F2', color: '#DC2626', label: '只有雙氧水時' },
          { type: 'text', x: 582, y: 192, text: '反應門檻太高，大多數分子過不去', size: 16.5 },
          { type: 'text', x: 582, y: 224, text: '所以幾乎看不到氣泡！', size: 16, color: '#485A52' },
        ],
      },
      {
        title: '2. 加入催化劑：開一條較矮的新路',
        speech: '加上一點黑色二氧化錳當催化劑，就像幫山開了一條較矮的捷徑！更多雙氧水分子過得去，氧氣泡泡就瞬間冒出來；而且反應完二氧化錳沒有減少，還可以重複使用！',
        draw: [
          {
            type: 'functionPlot',
            x: 55, y: 110, w: 470, h: 410,
            xMin: 0, xMax: 6, yMin: 0, yMax: 8,
            curves: [
              { expr: '3 + 3.6*Math.exp(-Math.pow(x-2.6, 2)/1.1) - 0.32*x', color: '#768880', width: 2.4, dashed: true, label: '原路徑', labelX: 2.5 },
              { expr: '3 + 1.6*Math.exp(-Math.pow(x-2.6, 2)/1.2) - 0.32*x', color: '#0F766E', width: 3.4, label: '加催化劑 (低門檻)', labelX: 2.2 },
            ],
            points: [{ x: 2.6, y: 3.77, color: '#0F766E', label: '門檻降低了!' }],
          },
          { type: 'box', x: 560, y: 290, w: 380, h: 225, fill: '#ECFDF5', color: '#0F766E', label: '國二理化必背 3 重點' },
          { type: 'text', x: 582, y: 350, text: '1. 催化劑降低反應門檻（加快反應）', size: 16 },
          { type: 'text', x: 582, y: 386, text: '2. 反應前後「本身質量與性質不變」', size: 16, color: '#2563EB' },
          { type: 'text', x: 582, y: 422, text: '3. 不會增加氧氣的「總產量」！', size: 16, color: '#DC2626' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '因為氧氣的總量是由「你倒了多少雙氧水」決定的！催化劑二氧化錳只是幫忙加快分解速度，並不會自己變成氧氣。',
        callout: { type: 'callout', bx: 565, by: 525, targetX: 280, targetY: 310, text: '門檻變低，所以冒泡泡變快！' },
      },
      analogy: {
        reply: '就像雪山隧道！台北到宜蘭距離沒變，但挖了隧道不用翻高山，車子通車就快很多，而且隧道本身不會因為車子開過去就消失。',
      },
    },
    notes: [
      '雙氧水 (H₂O₂) 加二氧化錳 (MnO₂) 會快速分解出氧氣 (O₂)。',
      '催化劑只加快反應速率，不增加最後生成的產物總量。',
      '反應結束後，催化劑的質量和化學性質都不會改變。',
    ],
    pitfall: '段考大陷阱：「多加兩匙二氧化錳可以蒐集到更多氧氣嗎？」答案是 NO！只能更快蒐集滿，總體積一樣多。',
    quiz: [
      { q: '雙氧水製氧實驗中，二氧化錳的角色是？', options: ['反應物', '催化劑', '生成物'], answer: 1, explain: '二氧化錳是催化劑，用來加快雙氧水分解速率。' },
      { q: '把二氧化錳的用量加倍，最後收集到的氧氣總體積會？', options: ['變兩倍', '變少', '不變（但更快完成）'], answer: 2, explain: '氧氣總產量取決於雙氧水的量，催化劑只影響快慢。' },
      { q: '實驗結束把二氧化錳過濾烘乾再秤重，質量會？', options: ['變輕', '不變', '歸零'], answer: 1, explain: '催化劑反應前後質量與性質不變。' },
    ],
  },
};

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

function buildLinearHomeworkLesson(eq) {
  const { a, b, c, rhsAfterMove, xVal } = eq;
  const lhsText = `${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}`;
  const moveWord = b >= 0 ? `把 +${b} 移到右邊（兩邊同時減 ${b}）` : `把 ${b} 移到右邊（兩邊同時加 ${Math.abs(b)}）`;
  const xFormatted = Number.isInteger(xVal) ? String(xVal) : xVal.toFixed(2);

  return {
    id: 'hw-' + Date.now(),
    title: `一次方程式引導：${lhsText} = ${c}`,
    gradeLabel: '國一 / 高年級',
    subject: '數學',
    mode: 'homework',
    homeworkMeta: { stage: 0, a, b, c, rhsAfterMove, xVal, xFormatted, lhsText },
    steps: [
      {
        title: '1. 擺上天平看兩邊',
        speech: `我們先不直接看答案！把 ${lhsText} 等於 ${c} 想像成一個左右平衡的天平。想讓 x 單獨留在左邊，第一步你會先把哪一個數字請走？`,
        draw: [
          { type: 'title', x: 50, y: 58, text: `解方程式引導：${lhsText} = ${c}`, size: 27, underline: true, underlineColor: '#0F766E' },
          { type: 'balanceScale', cx: 290, cy: 310, left: lhsText, right: String(c), tilt: 0 },
          { type: 'box', x: 565, y: 140, w: 375, h: 175, fill: '#FFFBEB', color: '#D97706', label: '第一步：先想想看' },
          { type: 'text', x: 588, y: 205, text: '目標：讓左邊只剩下孤單的 x', size: 17 },
          { type: 'text', x: 588, y: 242, text: '先處理旁邊單獨的常數數字，', size: 16, color: '#485A52' },
          { type: 'text', x: 588, y: 274, text: '在右側輸入：要先移走哪個數字？', size: 16, color: '#D97706' },
        ],
      },
      {
        title: '2. 等量公理／移項',
        speech: `答對了！${moveWord}。右邊原本是 ${c}，現在要變成 ${c} ${b >= 0 ? '減 ' + b : '加 ' + Math.abs(b)}。算算看右邊現在剩多少？`,
        draw: [
          { type: 'balanceScale', cx: 290, cy: 310, left: `${a === 1 ? '' : a}x`, right: String(rhsAfterMove), tilt: 0 },
          { type: 'box', x: 565, y: 335, w: 375, h: 130, fill: '#EFF6FF', color: '#2563EB', label: '第二步推導' },
          { type: 'text', x: 588, y: 396, text: `${lhsText} = ${c}`, size: 17, mono: true },
          { type: 'text', x: 588, y: 432, text: `→ ${a === 1 ? '' : a}x = ${c} ${b >= 0 ? '- ' + b : '+ ' + Math.abs(b)} = ${rhsAfterMove}`, size: 18, mono: true, color: '#2563EB' },
        ],
      },
      {
        title: '3. 算出 x 並驗算',
        speech: `好棒！現在只剩 ${a} 個 x 等於 ${rhsAfterMove}。最後一步，兩邊一起除以 ${a}，x 等於多少呢？`,
        draw: [
          { type: 'box', x: 565, y: 485, w: 375, h: 105, fill: '#ECFDF5', color: '#0F766E', label: '第三步：得出 x！' },
          { type: 'text', x: 588, y: 545, text: `x = ${rhsAfterMove} ÷ ${a} = ${xFormatted}  ✓`, size: 22, mono: true, color: '#0F766E' },
          { type: 'text', x: 588, y: 575, text: `代回驗算：${a}×(${xFormatted}) ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${c}`, size: 14, mono: true, color: '#485A52' },
        ],
      },
    ],
    faq: {
      why: {
        reply: `等號就像天平！左邊減掉或加上一個數，右邊也必須做一樣的動作，兩邊才會繼續相等。先移走加減的數字，最後再除掉 x 前面的倍數！`,
        callout: { type: 'callout', bx: 70, by: 450, targetX: 290, targetY: 310, text: '兩邊做一樣的事，天平才會平！' },
      },
      analogy: {
        reply: '就像拆洋蔥或拆禮物：先拆掉外面的加減包裝，最後再把乘在 x 旁邊的數字除掉。',
      },
    },
    notes: [
      `解 ${lhsText} = ${c} 的原則：維持天平兩邊平衡（等量公理／移項要變號）。`,
      `步驟一：移走常數 ${b}，得到 ${a}x = ${rhsAfterMove}。`,
      `步驟二：兩邊同除以 ${a}，得到 x = ${xFormatted}，記得代回驗算。`,
    ],
    pitfall: '最常錯：移項忘記變號！（把 +5 移到等號另一邊要變成 -5，不是 +5）。',
    quiz: [
      { q: `在 ${lhsText} = ${c} 中，把 ${b >= 0 ? '+' + b : b} 移到等號右邊會變成什麼？`, options: [b >= 0 ? `+${b}` : `${b}`, b >= 0 ? `-${b}` : `+${Math.abs(b)}`, `×${b}`], answer: 1, explain: '移項等於相反運算，加變減、減變加。' },
      { q: `算出 x = ${xFormatted} 後，如何確認自己沒有算錯？`, options: [`代回原式驗算是否等於 ${c}`, '靠感覺猜', '再重抄題目'], answer: 0, explain: '把算出的 x 代回原本左式檢查是否等於右式最準確。' },
      { q: '若遇到 4x = 20，下一步該怎麼做？', options: ['兩邊同減 4', '兩邊同除以 4', '兩邊同乘以 4'], answer: 1, explain: '4x 是 4 乘 x，需要用除法消去 4。' },
    ],
  };
}

function buildDynamicMathPlotLesson(prompt) {
  const fnMatches = [...prompt.matchAll(/y\s*=\s*([0-9xX+\-*/.^()\s]+)/g)];
  if (fnMatches.length >= 2) {
    const expr1 = fnMatches[0][1].trim().replace(/(\d)(x)/gi, '$1*$2');
    const expr2 = fnMatches[1][1].trim().replace(/(\d)(x)/gi, '$1*$2');
    let bestX = null, bestY = null, bestDiff = Infinity;
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
      ? [{ x: bestX, y: bestY, color: '#DC2626', label: `交點 (${bestX}, ${bestY})` }]
      : [];

    return {
      id: 'plot-' + Date.now(),
      title: `國一直角坐標圖解：y = ${fnMatches[0][1].trim()} 與 y = ${fnMatches[1][1].trim()}`,
      gradeLabel: '國一數學',
      subject: '數學',
      mode: 'topic',
      steps: [
        {
          title: '1. 在方格紙畫出兩條直線',
          speech: '國一下學期學二元一次方程式圖形時，把兩條式子畫在直角坐標平面上，它們碰頭的那一點就是聯立方程式的解！',
          draw: [
            { type: 'title', x: 50, y: 58, text: '二元一次方程式圖形與交點', size: 26, underline: true, underlineColor: '#0F766E' },
            {
              type: 'functionPlot',
              x: 55, y: 110, w: 470, h: 420,
              xMin: -4, xMax: 5, yMin: -4, yMax: 8,
              curves: [
                { expr: expr1, color: '#2563EB', width: 3.2, label: `y = ${fnMatches[0][1].trim()}`, labelX: 1.8 },
                { expr: expr2, color: '#0F766E', width: 3.2, label: `y = ${fnMatches[1][1].trim()}`, labelX: 2.2 },
              ],
              points: pts,
            },
            { type: 'box', x: 560, y: 130, w: 380, h: 215, fill: '#EFF6FF', color: '#2563EB', label: '從圖形找答案' },
            { type: 'text', x: 582, y: 192, text: `① 藍線：y = ${fnMatches[0][1].trim()}`, size: 17, mono: true, color: '#2563EB' },
            { type: 'text', x: 582, y: 228, text: `② 綠線：y = ${fnMatches[1][1].trim()}`, size: 17, mono: true, color: '#0F766E' },
            { type: 'text', x: 582, y: 274, text: pts.length ? `★ 紅點交會：(${bestX}, ${bestY})` : '觀察兩線趨勢', size: 18, color: '#DC2626' },
            { type: 'text', x: 582, y: 314, text: '交點座標 ＝ 聯立方程式的解！', size: 16 },
          ],
        },
      ],
      faq: {
        why: { reply: '因為直線上的每一點都符合該條方程式，所以同時落在兩條線上的交點，就是同時滿足兩條式子的唯一一組 (x, y)！' },
        analogy: { reply: '就像兩位同學各沿著一條馬路走，十字路口交叉的那個點，就是他們會碰面的唯一位置。' },
      },
      notes: ['兩條不平行的直線在坐標平面上只會有一個交點，代表聯立方程式有唯一解。'],
      pitfall: '如果兩條直線互相平行、沒有交點，代表聯立方程式「無解」。',
      quiz: [
        { q: '兩條直線交於 (1, 3)，代表哪一組是聯立方程式的解？', options: ['x=1, y=3', 'x=3, y=1', '無解'], answer: 0, explain: '交點座標 (1, 3) 即代表 x=1、y=3。' },
      ],
    };
  }
  return null;
}

function buildCustomFallbackLesson(prompt, mode, attachments = []) {
  const lower = prompt.toLowerCase();
  if (lower.includes('1/2') || lower.includes('分數') || lower.includes('通分')) return structuredClone(CURATED_LESSONS['fraction-add']);
  if (lower.includes('三角形') || lower.includes('除以 2') || lower.includes('除以2') || lower.includes('面積')) return structuredClone(CURATED_LESSONS['triangle-area']);
  if (lower.includes('畢氏') || lower.includes('勾股') || lower.includes('斜邊') || lower.includes('直角三角形')) return structuredClone(CURATED_LESSONS.pythagoras);
  if (lower.includes('拋') || lower.includes('球') || lower.includes('落地') || lower.includes('重力')) return structuredClone(CURATED_LESSONS.projectile);
  if (lower.includes('血型') || lower.includes('基因') || lower.includes('遺傳') || lower.includes('棋盤')) return structuredClone(CURATED_LESSONS.genetics);
  if (lower.includes('月亮') || lower.includes('圓缺') || lower.includes('月相')) return structuredClone(CURATED_LESSONS.moon);
  if (lower.includes('催化劑') || lower.includes('二氧化錳') || lower.includes('雙氧水') || lower.includes('反應速率')) return structuredClone(CURATED_LESSONS.catalyst);

  const eq = parseLinearEquation(prompt.replace(/^解(一元一次)?(方程式|未知數)[:：]?\s*/i, ''));
  if (eq) return buildLinearHomeworkLesson(eq);

  const mathPlot = buildDynamicMathPlotLesson(prompt);
  if (mathPlot) return mathPlot;

  const textAtts = attachments.filter((a) => a.textContent).map((a) => a.textContent).join('\n');
  const combined = (textAtts ? textAtts + '\n' : '') + prompt;
  const sentences = combined.split(/[。！？\n；]+/).map((s) => s.trim()).filter((s) => s.length > 3).slice(0, 4);
  const pt1 = (sentences[0] || prompt).slice(0, 26);
  const pt2 = (sentences[1] || '找出關鍵條件與因果關係').slice(0, 26);
  const pt3 = (sentences[2] || '整理重點結論與常考提醒').slice(0, 26);
  const shortTitle = prompt.length > 24 ? prompt.slice(0, 24) + '…' : prompt;

  return {
    id: 'custom-' + Date.now(),
    title: shortTitle,
    gradeLabel: '國中小自訂',
    subject: '綜合',
    mode,
    steps: [
      {
        title: '1. 拆解題目條件',
        speech: mode === 'homework'
          ? `收到你的題目「${shortTitle}」！我們先把已知條件寫在方格紙上，你先試著告訴我第一步你會怎麼想？`
          : `我們一起來看「${shortTitle}」！我先在筆記板上把重點拆成三個小步驟。`,
        draw: [
          { type: 'title', x: 50, y: 58, text: shortTitle, size: 26, underline: true, underlineColor: '#0F766E' },
          { type: 'box', x: 55, y: 120, w: 280, h: 140, fill: '#EFF6FF', color: '#2563EB', label: '① 題目給了什麼' },
          { type: 'text', x: 75, y: 190, text: pt1, size: 15.5 },
          { type: 'arrow', x1: 345, y1: 190, x2: 405, y2: 190, color: '#182420', label: '推演' },
          { type: 'box', x: 415, y: 120, w: 280, h: 140, fill: '#FFFBEB', color: '#D97706', label: '② 關鍵轉換' },
          { type: 'text', x: 435, y: 190, text: pt2, size: 15.5 },
        ],
      },
      {
        title: '2. 筆記結論與練習提醒',
        speech: `接下來看最後的重點整理。如果想針對課本拍照題目自動畫圖解析，也可以在右上角「模型設定」填入個人 API Key 喔！`,
        draw: [
          { type: 'arrow', x1: 705, y1: 190, x2: 755, y2: 190, color: '#182420' },
          { type: 'box', x: 765, y: 120, w: 195, h: 140, fill: '#ECFDF5', color: '#0F766E', label: '③ 核心重點' },
          { type: 'text', x: 782, y: 190, text: pt3, size: 14.5 },
          { type: 'box', x: 55, y: 310, w: 660, h: 185, fill: '#FFFFFF', color: '#182420', label: '小黑板複習提醒' },
          { type: 'text', x: 78, y: 375, text: '• 先看懂步驟之間的因果，再背公式會更牢', size: 16.5 },
          { type: 'text', x: 78, y: 415, text: '• 左邊的畫筆可以直接在題目旁邊列算式或畫重點', size: 16.5, color: '#0F766E' },
          { type: 'text', x: 78, y: 455, text: '• 提示：於模型設定填入個人 Gemini / OpenAI Key 可解析拍照考卷', size: 14.5, color: '#768880' },
        ],
      },
    ],
    faq: {
      why: {
        reply: '我們先把題目看成「已知 → 中間方法 → 最後答案」三格，告訴我你卡在哪一格，我再舉更簡單的生活例子！',
        callout: { type: 'callout', bx: 55, by: 515, targetX: 555, targetY: 260, text: '關鍵轉換看這裡！' },
      },
      analogy: { reply: '就像組裝積木一樣，先把說明書的零件分好，一步一步拼起來就不容易出錯。' },
    },
    notes: [`主題：${shortTitle}`, `推導脈絡：${pt1} → ${pt2} → ${pt3}`],
    pitfall: '寫應用題或自然題時，記得先把單位與題目問的對象圈出來。',
    quiz: [
      { q: `複習「${shortTitle}」時，哪個習慣最不容易粗心？`, options: ['直接心算跳步驟', '把條件寫在紙上、算完代回檢查', '只背最後答案'], answer: 1, explain: '條列條件與驗算是國中小最有效的防粗心方法。' },
    ],
  };
}

window.LessonLibrary = {
  SUGGESTION_POOL,
  CURATED_LESSONS,
  parseLinearEquation,
  buildCustomFallbackLesson,
};
