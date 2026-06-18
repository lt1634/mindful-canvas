import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  Palette,
  FileText,
  Sparkles,
  Music,
  Volume2,
  VolumeX,
  RotateCcw,
  Undo,
  Download,
  Layers,
  Eye,
  EyeOff,
  Info,
  Check,
  ChevronRight,
  BookOpen,
  Moon,
  Sun,
  Activity,
  Award,
  Maximize,
  HelpCircle,
} from "lucide-react";

// ==========================================
// 專業禪繞唐卡底稿資料庫 (SVG Paths / Path Generator)
// ==========================================
const THANGKA_TEMPLATES = [
  {
    id: "mandala",
    title: "大日如來壇城",
    englishTitle: "Vairocana Great Mandala",
    difficulty: "⭐⭐⭐⭐⭐",
    timeCost: "約 45 分鐘",
    desc: "唐卡中最核心的神聖幾何。圓形代表宇宙的圓滿，方形代表壇城的四個城門，內含八葉蓮花瓣。適合練習旋轉對稱禪繞與密緻線條。",
    symbolism: "圓滿、專注、降伏雜念、重整內心秩序。",
    colorPreset: "#FFD700", // 金色
    // 用於背景引導的預設圖形渲染函數
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      // 1. 最外圍火焰圈
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.46}" stroke="currentColor" stroke-dasharray="8,6" fill="none" opacity="0.35" />`
      );
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.44}" stroke="currentColor" fill="none" opacity="0.4" />`
      );
      // 2. 金剛橛/蓮花瓣外圈
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.38}" stroke="currentColor" stroke-dasharray="1,4" stroke-width="4" fill="none" opacity="0.6" />`
      );
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.35}" stroke="currentColor" fill="none" opacity="0.5" />`
      );
      // 3. 四正城門 (方殿)
      const rInner = size * 0.25;
      const rGate = size * 0.08;
      paths.push(`
        <path d="
          M ${center - rInner} ${center - rInner} 
          L ${center - rGate} ${center - rInner}
          L ${center - rGate} ${center - rInner - rGate}
          L ${center + rGate} ${center - rInner - rGate}
          L ${center + rGate} ${center - rInner}
          L ${center + rInner} ${center - rInner}
          L ${center + rInner} ${center - rGate}
          L ${center + rInner + rGate} ${center - rGate}
          L ${center + rInner + rGate} ${center + rGate}
          L ${center + rInner} ${center + rGate}
          L ${center + rInner} ${center + rInner}
          L ${center + rGate} ${center + rInner}
          L ${center + rGate} ${center + rInner + rGate}
          L ${center - rGate} ${center + rInner + rGate}
          L ${center - rGate} ${center + rInner}
          L ${center - rInner} ${center + rInner}
          L ${center - rInner} ${center + rGate}
          L ${center - rInner - rGate} ${center + rGate}
          L ${center - rInner - rGate} ${center - rGate}
          L ${center - rInner} ${center - rGate}
          Z
        " stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.7" />
      `);
      // 4. 八瓣核心蓮花
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = center + Math.cos(angle) * (size * 0.04);
        const y1 = center + Math.sin(angle) * (size * 0.04);
        const x2 = center + Math.cos(angle) * (size * 0.18);
        const y2 = center + Math.sin(angle) * (size * 0.18);
        const cp1x = center + Math.cos(angle - 0.2) * (size * 0.13);
        const cp1y = center + Math.sin(angle - 0.2) * (size * 0.13);
        const cp2x = center + Math.cos(angle + 0.2) * (size * 0.13);
        const cp2y = center + Math.sin(angle + 0.2) * (size * 0.13);
        paths.push(
          `<path d="M ${x1} ${y1} Q ${cp1x} ${cp1y} ${x2} ${y2} Q ${cp2x} ${cp2y} ${x1} ${y1}" stroke="currentColor" fill="none" opacity="0.6" />`
        );
      }
      // 5. 中心智慧點
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.03}" stroke="currentColor" fill="none" opacity="0.8" />`
      );
      // 6. 放射對稱引導線 (輕微虛線，禪繞初學者最愛)
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const targetX = center + Math.cos(angle) * (size * 0.48);
        const targetY = center + Math.sin(angle) * (size * 0.48);
        paths.push(
          `<line x1="${center}" y1="${center}" x2="${targetX}" y2="${targetY}" stroke="currentColor" stroke-dasharray="3,9" opacity="0.25" />`
        );
      }
      return paths.join("");
    },
  },
  {
    id: "lotus_mantha",
    title: "六字真言八瓣蓮",
    englishTitle: "Sacred Lotus of Compassion",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 30 分鐘",
    desc: "象徵觀世音菩薩的慈悲。中心為清淨蓮蓬，周圍八片蓮花瓣徐徐綻放。適合用來填寫精細的禪繞格紋（如碎石紋、編織網格與淚滴線）。",
    symbolism: "純潔、慈悲心靈的覺醒、出淤泥而不染。",
    colorPreset: "#FF6B6B", // 硃砂紅
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];
      // 外圍清淨光環
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.45}" stroke="currentColor" stroke-dasharray="2,2" fill="none" opacity="0.3" />`
      );
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.4}" stroke="currentColor" fill="none" opacity="0.4" />`
      );

      // 八大主花瓣 - 層疊渲染
      for (let j = 0; j < 2; j++) {
        const offsetAngle = j * (Math.PI / 8);
        const scale = j === 0 ? 0.38 : 0.3;
        const opacity = j === 0 ? 0.7 : 0.4;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4 + offsetAngle;
          const xStart = center + Math.cos(angle) * (size * 0.06);
          const yStart = center + Math.sin(angle) * (size * 0.06);
          const xEnd = center + Math.cos(angle) * (size * scale);
          const yEnd = center + Math.sin(angle) * (size * scale);

          // 控制點拉出蓮花瓣的豐滿曲線
          const cpAngle1 = angle - 0.28;
          const cpAngle2 = angle + 0.28;
          const cp1x = center + Math.cos(cpAngle1) * (size * scale * 0.7);
          const cp1y = center + Math.sin(cpAngle1) * (size * scale * 0.7);
          const cp2x = center + Math.cos(cpAngle2) * (size * scale * 0.7);
          const cp2y = center + Math.sin(cpAngle2) * (size * scale * 0.7);

          paths.push(
            `<path d="M ${xStart} ${yStart} C ${cp1x} ${cp1y} ${cp1x} ${cp1y} ${xEnd} ${yEnd} C ${cp2x} ${cp2y} ${cp2x} ${cp2y} ${xStart} ${yStart}" stroke="currentColor" fill="none" opacity="${opacity}" stroke-width="1.5" />`
          );

          // 花瓣葉脈引導線 (供精細禪繞描繪)
          const midX = center + Math.cos(angle) * (size * scale * 0.6);
          const midY = center + Math.sin(angle) * (size * scale * 0.6);
          paths.push(
            `<path d="M ${xStart} ${yStart} L ${midX} ${midY}" stroke="currentColor" stroke-dasharray="2,3" opacity="0.35" />`
          );
        }
      }

      // 中心蓮蓬
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.08}" stroke="currentColor" fill="none" opacity="0.8" />`
      );
      // 蓮子點點
      for (let i = 0; i < 7; i++) {
        const seedAngle = (i * Math.PI) / 3;
        const seedX = center + (i === 0 ? 0 : Math.cos(seedAngle) * (size * 0.04));
        const seedY = center + (i === 0 ? 0 : Math.sin(seedAngle) * (size * 0.04));
        paths.push(
          `<circle cx="${seedX}" cy="${seedY}" r="${size * 0.008}" fill="currentColor" opacity="0.8" />`
        );
      }

      return paths.join("");
    },
  },
  {
    id: "bodhi_fish",
    title: "菩提雙魚戲水圖",
    englishTitle: "The Golden Auspicious Fish",
    difficulty: "⭐⭐⭐⭐",
    timeCost: "約 35 分鐘",
    desc: "藏傳佛教八吉祥之一。雙魚代表解脫、自由與和諧。配上優美流暢的菩提葉脈與水波禪繞背景，讓人作畫時心境如流水般豁然開朗。",
    symbolism: "自由無礙、豐饒喜樂、陰陽調和。",
    colorPreset: "#4ECDC4", // 翡翠松石綠
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];

      // 1. 背景大菩提葉輪廓
      paths.push(`
        <path d="
          M ${center} ${center - size * 0.45} 
          Q ${center + size * 0.35} ${center - size * 0.1} ${center} ${center + size * 0.42}
          Q ${center - size * 0.35} ${center - size * 0.1} ${center} ${center - size * 0.45}
        " stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.3" stroke-dasharray="6,4" />
      `);

      // 菩提主葉脈
      paths.push(
        `<path d="M ${center} ${center - size * 0.45} L ${center} ${center + size * 0.42}" stroke="currentColor" opacity="0.25" />`
      );
      for (let i = 1; i <= 5; i++) {
        const y = center - size * 0.45 + size * 0.8 * (i / 6);
        paths.push(
          `<path d="M ${center} ${y} Q ${center + size * 0.2} ${y - size * 0.05} ${center + size * 0.25} ${y - size * 0.12}" stroke="currentColor" opacity="0.15" fill="none" />`
        );
        paths.push(
          `<path d="M ${center} ${y} Q ${center - size * 0.2} ${y - size * 0.05} ${center - size * 0.25} ${y - size * 0.12}" stroke="currentColor" opacity="0.15" fill="none" />`
        );
      }

      // 2. 雙魚太極環狀排布
      const drawFish = (cx, cy, scale, angle, isReversed) => {
        const dir = isReversed ? -1 : 1;
        return `
          <g transform="translate(${cx}, ${cy}) rotate(${angle}) scale(${scale})">
            <!-- 魚身 -->
            <path d="M -80 0 Q 0 ${-40 * dir} 80 0 Q 0 ${40 * dir} -80 0 Z" stroke="currentColor" fill="none" stroke-width="2" opacity="0.75" />
            <!-- 魚鰓與眼睛 -->
            <circle cx="50" cy="${5 * dir}" r="4" fill="currentColor" opacity="0.8" />
            <path d="M 40 ${-18 * dir} Q 30 0 40 ${18 * dir}" stroke="currentColor" fill="none" opacity="0.7" />
            <!-- 魚尾巴 (流動感禪繞引導) -->
            <path d="M -80 0 Q -110 ${-30 * dir} -130 ${-15 * dir} Q -110 0 -80 0" stroke="currentColor" fill="none" opacity="0.6" />
            <path d="M -80 0 Q -110 ${30 * dir} -130 ${15 * dir} Q -110 0 -80 0" stroke="currentColor" fill="none" opacity="0.6" />
            <path d="M -80 0 L -140 0" stroke="currentColor" stroke-dasharray="2,2" opacity="0.5" />
            <!-- 魚鰭 -->
            <path d="M 10 ${25 * dir} Q -20 ${50 * dir} -15 ${10 * dir}" stroke="currentColor" fill="none" opacity="0.6" />
          </g>
        `;
      };

      paths.push(drawFish(center - size * 0.11, center, 1.1, -25, false));
      paths.push(drawFish(center + size * 0.11, center, 1.1, 155, true));

      // 3. 水波漣漪裝飾圈
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.3}" stroke="currentColor" opacity="0.2" stroke-dasharray="4,12" />`
      );
      paths.push(
        `<circle cx="${center}" cy="${center}" r="${size * 0.42}" stroke="currentColor" opacity="0.15" stroke-dasharray="10,20" />`
      );

      return paths.join("");
    },
  },
  {
    id: "endless_knot",
    title: "無盡意吉祥結",
    englishTitle: "The Eternal Shrivatsa Knot",
    difficulty: "⭐⭐⭐⭐⭐",
    timeCost: "約 50 分鐘",
    desc: "無盡結代表萬物相互依存的因緣、佛陀無窮盡的智慧與慈悲。線條盤根錯節，一筆貫穿。在這裡你可以順著無限循環的絲帶填滿繁複的禪繞波浪與點點。",
    symbolism: "長壽、無窮智慧、和諧與無盡的慈悲因緣。",
    colorPreset: "#9B5DE5", // 智慧深紫
    renderGuides: (size) => {
      const center = size / 2;
      const paths = [];

      // 吉祥結的核心在於幾何交織，這裡生成帶有立體交錯感的雙線格狀吉祥結底稿
      const s = size * 0.07; // 單個網格單元大小

      // 繪製交織管道 (一組精心計算的閉合折線組)
      // 外部圓潤的光環引導線
      paths.push(
        `<rect x="${center - s * 4}" y="${center - s * 4}" width="${s * 8}" height="${s * 8}" rx="${s * 1.5}" stroke="currentColor" fill="none" stroke-dasharray="10,10" opacity="0.15" />`
      );

      // 吉祥結的主線條 (由12個迴圈孔組成的神聖編織)
      const drawRibbon = (pathString, width = 16) => {
        return `
          <path d="${pathString}" stroke="currentColor" fill="none" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" opacity="0.65" />
          <path d="${pathString}" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
        `;
      };

      // 簡化版的吉祥結對稱編織骨架
      const knotPath = `
        M ${center} ${center - 3.2 * s} 
        L ${center + 1.6 * s} ${center - 1.6 * s} 
        L ${center + 3.2 * s} ${center - 3.2 * s}
        L ${center + 4.2 * s} ${center - 2.2 * s}
        L ${center + 2.6 * s} ${center - 0.6 * s}
        L ${center + 4.2 * s} ${center + 1.0 * s}
        L ${center + 3.2 * s} ${center + 2.0 * s}
        L ${center + 1.6 * s} ${center + 0.4 * s}
        L ${center} ${center + 2.0 * s}
        L ${center - 1.6 * s} ${center + 0.4 * s}
        L ${center - 3.2 * s} ${center + 2.0 * s}
        L ${center - 4.2 * s} ${center + 1.0 * s}
        L ${center - 2.6 * s} ${center - 0.6 * s}
        L ${center - 4.2 * s} ${center - 2.2 * s}
        L ${center - 3.2 * s} ${center - 3.2 * s}
        L ${center - 1.6 * s} ${center - 1.6 * s}
        Z
      `;

      const knotPath2 = `
        M ${center} ${center - 1.2 * s}
        L ${center + 1.6 * s} ${center + 0.4 * s}
        L ${center} ${center + 2.0 * s}
        L ${center - 1.6 * s} ${center + 0.4 * s}
        Z
      `;

      paths.push(drawRibbon(knotPath, s * 0.6));
      paths.push(drawRibbon(knotPath2, s * 0.4));

      // 在交點繪製指示圈，提醒使用者在此處進行「壓線/過線」的禪繞陰影立體處理
      const nodes = [
        [0, -1.6],
        [1.6, 0.4],
        [-1.6, 0.4],
        [0, 2.0],
        [1.6, -1.6],
        [-1.6, -1.6],
        [3.2, -0.6],
        [-3.2, -0.6],
      ];
      nodes.forEach(([nx, ny]) => {
        paths.push(
          `<circle cx="${center + nx * s}" cy="${center + ny * s}" r="${s * 0.25}" stroke="currentColor" stroke-dasharray="1,1" fill="none" opacity="0.4" />`
        );
      });

      return paths.join("");
    },
  },
];

// ==========================================
// 禪繞畫預設「禪繞格紋 (Tangles)」參考資料庫
// ==========================================
const ZENTANGLE_PATTERNS = [
  { name: "新月 (Crescent Moon)", symbol: "🌙", desc: "半月形層層外拓線條", difficulty: "⭐" },
  { name: "立體編織 (Cadent)", symbol: "🧇", desc: "網格與Ｓ型優雅連接線", difficulty: "⭐⭐" },
  { name: "烈焰 (Fescu)", symbol: "🌱", desc: "如細草芽般自然舒張的曲線", difficulty: "⭐" },
  { name: "碎石靜心 (Mooka)", symbol: "🐚", desc: "流暢如葉芽或貝殼的圓弧", difficulty: "⭐⭐⭐" },
  {
    name: "烈日火焰 (Paradox)",
    symbol: "🌀",
    desc: "純直線拉出的扭轉幾何幻覺",
    difficulty: "⭐⭐⭐⭐",
  },
  { name: "神聖迴圈 (Hollibaugh)", symbol: "🌉", desc: "交錯穿插的立體緞帶線", difficulty: "⭐⭐" },
];

export default function App() {
  // 頁面狀態：'gallery' (選擇大廳) 或 'canvas' (創作畫布)
  const [viewMode, setViewMode] = useState("gallery");
  const [selectedTemplate, setSelectedTemplate] = useState(THANGKA_TEMPLATES[0]);

  // 繪圖基本設定
  const [brushColor, setBrushColor] = useState("#FFD700"); // 預設金色
  const [brushWidth, setBrushWidth] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [symmetryFactor, setSymmetryFactor] = useState(8); // 8分對稱
  const [isSymmetryEnabled, setIsSymmetryEnabled] = useState(true);

  // 底稿圖層控制
  const [draftOpacity, setDraftOpacity] = useState(0.4);
  const [showDraft, setShowDraft] = useState(true);

  // 音樂冥想狀態
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioTrack, setAudioTrack] = useState("tibetan_bowl"); // tibetan_bowl (梵音頌缽), forest_water (山林流水)

  // 呼吸引導狀態
  const [breathState, setBreathState] = useState("吸氣"); // 吸氣 -> 屏息 -> 呼氣 -> 屏息
  const [breathProgress, setBreathProgress] = useState(0); // 0 to 100

  // 系統主題 (暗色更適合金絲與唐卡發光線條)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 畫布、歷史紀錄 Ref
  const canvasRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState(600);

  // 自訂調色盤
  const palettePresets = [
    { name: "大日金泥", hex: "#FFD700", desc: "經典唐卡金絲描邊" },
    { name: "硃砂紅", hex: "#E63946", desc: "大威德金剛護法熱烈" },
    { name: "松石綠", hex: "#2A9D8F", desc: "度母與自然般平靜" },
    { name: "青金石藍", hex: "#1D3557", desc: "藥師佛澄淨智慧" },
    { name: "白螺潔白", hex: "#F1FAEE", desc: "清淨無染之白" },
    { name: "玄鐵炭黑", hex: "#111111", desc: "極細針筆禪繞陰影" },
  ];

  // 音效/音樂節點 (使用 Web Audio API 生成舒緩的合成梵音頌缽與環境音，避免外載mp3失效)
  const audioCtxRef = useRef(null);
  const audioNodesRef = useRef({ osc1: null, osc2: null, gain: null, lfo: null });

  // ------------------------------------------
  // 初始化 Web Audio API (梵音頌缽)
  // ------------------------------------------
  const startZenSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 建立雙聲道立體低頻（梵音效果）
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gainNode = ctx.createGain();

      // 頌缽基音 (110Hz A2) 與 泛音 (165Hz E3)
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(110, ctx.currentTime);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(165.4, ctx.currentTime); // 微調頻差製造「雙耳搏動 (Binaural Beats)」幫助入定

      // 輕微低頻振盪 (LFO) 模擬流水或呼吸感
      lfo.frequency.setValueAtTime(0.2, ctx.currentTime); // 每5秒一次循環
      lfoGain.gain.setValueAtTime(15, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime); // 柔和背景音量

      // 連接節點
      lfo.connect(lfoGain);
      lfoGain.connect(osc2.frequency); // 調製頻率

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      lfo.start();

      audioNodesRef.current = { osc1, osc2, gain: gainNode, lfo };
      setIsPlayingAudio(true);
    } catch (e) {
      console.warn("音訊啟動失敗:", e);
    }
  };

  const stopZenSound = () => {
    const { osc1, osc2, lfo } = audioNodesRef.current;
    if (osc1)
      try {
        osc1.stop();
      } catch (e) {}
    if (osc2)
      try {
        osc2.stop();
      } catch (e) {}
    if (lfo)
      try {
        lfo.stop();
      } catch (e) {}
    audioNodesRef.current = { osc1: null, osc2: null, gain: null, lfo: null };
    setIsPlayingAudio(false);
  };

  const toggleZenMusic = () => {
    if (isPlayingAudio) {
      stopZenSound();
    } else {
      startZenSound();
    }
  };

  // ------------------------------------------
  // 正念呼吸定時器
  // ------------------------------------------
  useEffect(() => {
    let breathTimer = setInterval(() => {
      setBreathProgress((prev) => {
        if (prev >= 100) {
          // 切換呼吸階段 (吸氣 4秒 -> 屏息 4秒 -> 呼氣 4秒 -> 屏息 4秒)
          setBreathState((currentState) => {
            switch (currentState) {
              case "吸氣":
                return "持氣(靜止)";
              case "持氣(靜止)":
                return "吐氣";
              case "吐氣":
                return "空息(放空)";
              default:
                return "吸氣";
            }
          });
          return 0;
        }
        return prev + 2.5; // 每 100ms 跑 2.5%，等於 4 秒一個週期
      });
    }, 100);

    return () => {
      clearInterval(breathTimer);
    };
  }, []);

  // ------------------------------------------
  // 畫布基礎初始化
  // ------------------------------------------
  useEffect(() => {
    if (viewMode === "canvas") {
      const handleResize = () => {
        const container = document.getElementById("canvas-container");
        if (container) {
          const side = Math.min(container.clientWidth - 32, 600);
          setCanvasSize(side);
        }
      };

      // 延遲一下確保 DOM 已經渲染並取得正確尺寸
      setTimeout(handleResize, 100);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [viewMode]);

  // 重新調整大小後重繪畫布內容
  useEffect(() => {
    if (viewMode === "canvas" && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      // 平滑度設定
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 清空背景
      ctx.fillStyle = isDarkMode ? "#12131C" : "#FFFFFF";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      // 如果有歷史紀錄，重繪當前歷史
      if (history.length > 0 && historyPointer >= 0) {
        redrawHistory(historyPointer);
      } else {
        saveState(); // 儲存空白背景作為第一幀
      }
    }
  }, [canvasSize, viewMode, isDarkMode]);

  // ------------------------------------------
  // 畫布繪圖核心邏輯 (支持對稱畫圖)
  // ------------------------------------------
  const getCoordinates = (e) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // 兼容觸控與滑鼠事件
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    setLastPos(coords);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const x0 = lastPos.x;
    const y0 = lastPos.y;
    const x1 = coords.x;
    const y1 = coords.y;

    // 設定畫筆樣式
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.globalAlpha = brushOpacity;

    const cx = canvasSize / 2;
    const cy = canvasSize / 2;

    if (isSymmetryEnabled) {
      // 萬花筒極座標對稱繪圖
      for (let i = 0; i < symmetryFactor; i++) {
        const angle = (i * 2 * Math.PI) / symmetryFactor;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        // 繪製原始線條
        ctx.beginPath();
        ctx.moveTo(x0 - cx, y0 - cy);
        ctx.lineTo(x1 - cx, y1 - cy);
        ctx.stroke();

        // 鏡像線條（讓手繪左右更對稱，呈現神聖平衡感）
        ctx.scale(1, -1);
        ctx.beginPath();
        ctx.moveTo(x0 - cx, y0 - cy);
        ctx.lineTo(x1 - cx, y1 - cy);
        ctx.stroke();

        ctx.restore();
      }
    } else {
      // 自由描繪模式
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    setLastPos(coords);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  // ------------------------------------------
  // 復原、歷史紀錄機制
  // ------------------------------------------
  const saveState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();

    const newHistory = history.slice(0, historyPointer + 1);
    newHistory.push(dataUrl);
    setHistory(newHistory);
    setHistoryPointer(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyPointer > 0) {
      const prevPointer = historyPointer - 1;
      setHistoryPointer(prevPointer);
      redrawHistory(prevPointer);
    }
  };

  const redrawHistory = (pointer) => {
    if (!canvasRef.current || pointer < 0 || !history[pointer]) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = history[pointer];
    img.onload = () => {
      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
    };
  };

  const handleClear = () => {
    if (window.confirm("確定要清除目前的畫作，重新開始嗎？你的靜心軌跡將會重置。")) {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = isDarkMode ? "#12131C" : "#FFFFFF";
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      const cleanState = canvas.toDataURL();
      setHistory([cleanState]);
      setHistoryPointer(0);
    }
  };

  // ------------------------------------------
  // 導出/存檔作品
  // ------------------------------------------
  const handleExport = () => {
    if (!canvasRef.current) return;

    // 建立臨時畫布，將「底稿」與「手繪層」完美融合成一張最終唐卡精裝圖
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1200; // 高解析度
    exportCanvas.height = 1200;
    const eCtx = exportCanvas.getContext("2d");

    // 1. 底色
    eCtx.fillStyle = isDarkMode ? "#12131C" : "#FFFFFF";
    eCtx.fillRect(0, 0, 1200, 1200);

    // 2. 如果使用者開啟了底稿，以精緻的低飽和金色/墨色印上背景浮水印，增添作品神聖感
    if (showDraft) {
      eCtx.strokeStyle = isDarkMode ? "rgba(255, 215, 0, 0.15)" : "rgba(0, 0, 0, 0.12)";
      eCtx.fillStyle = isDarkMode ? "rgba(255, 215, 0, 0.15)" : "rgba(0, 0, 0, 0.12)";

      // 利用 SVG 結構轉換至 Canvas (解析路徑渲染)
      // 這裡直接繪製選定圖案的高清引導輪廓
      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 600 600">
          <g color="${isDarkMode ? "rgba(255, 215, 0, 0.2)" : "rgba(0,0,0,0.1)"}">
            ${selectedTemplate.renderGuides(600)}
          </g>
        </svg>
      `;
      const img = new Image();
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));

      img.onload = () => {
        eCtx.drawImage(img, 0, 0, 1200, 1200);
        // 3. 畫上玩家手繪部分
        const userImg = new Image();
        userImg.src = canvasRef.current.toDataURL();
        userImg.onload = () => {
          eCtx.drawImage(userImg, 0, 0, 1200, 1200);

          // 4. 下載圖片
          const link = document.createElement("a");
          link.download = `覺知畫布_禪繞唐卡_${selectedTemplate.title}.png`;
          link.href = exportCanvas.toDataURL("image/png");
          link.click();
        };
      };
    } else {
      // 若無底稿，直接輸出玩家手繪
      const userImg = new Image();
      userImg.src = canvasRef.current.toDataURL();
      userImg.onload = () => {
        eCtx.drawImage(userImg, 0, 0, 1200, 1200);
        const link = document.createElement("a");
        link.download = `覺知畫布_手繪禪繞唐卡.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
      };
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#0A0B10] text-gray-100" : "bg-gray-50 text-gray-800"}`}
    >
      {/* 頂部裝飾大條 & 標題 */}
      <header
        className={`border-b ${isDarkMode ? "border-gray-800 bg-[#0E1017]" : "border-gray-200 bg-white"} px-6 py-4 sticky top-0 z-50 transition-all`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-amber-500/15 text-amber-500 animate-pulse">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-wider font-serif flex items-center gap-2">
                <span>覺知畫布：禪繞唐卡</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-sans">
                  PRO 專業禪修版
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                融合神聖唐卡圖騰與禪繞畫(Zentangle)的交互冥想空間
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 靜心音樂控制 */}
            <button
              onClick={toggleZenMusic}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isPlayingAudio
                  ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40"
                  : "bg-gray-500/10 text-gray-400 border border-transparent hover:bg-gray-500/15"
              }`}
              title="開啟頌缽梵音背景音"
            >
              {isPlayingAudio ? (
                <Volume2 className="w-4 h-4 animate-bounce" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span>{isPlayingAudio ? "背景梵音: 啟動中" : "靜心頌缽音樂"}</span>
            </button>

            {/* 主題切換 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all ${isDarkMode ? "bg-amber-500/10 text-amber-400" : "bg-indigo-500/10 text-indigo-600"}`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {viewMode === "canvas" && (
              <button
                onClick={() => {
                  stopZenSound();
                  setViewMode("gallery");
                }}
                className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
              >
                <BookOpen className="w-3.5 h-3.5" />
                返回選圖大廳
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ==========================================
          視圖 A：禪繞唐卡選擇畫廊 (Gallery)
          ========================================== */}
      {viewMode === "gallery" && (
        <main className="max-w-7xl mx-auto px-6 py-10 animate-fadeIn">
          {/* 引言 Banner */}
          <div
            className={`p-8 rounded-3xl mb-12 relative overflow-hidden border ${
              isDarkMode
                ? "bg-gradient-to-br from-[#121420] to-[#171B30] border-gray-800"
                : "bg-gradient-to-br from-amber-50/60 to-orange-50/60 border-amber-100"
            }`}
          >
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
              <Compass className="w-96 h-96" />
            </div>

            <div className="max-w-3xl relative z-10">
              <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">
                Tibetan Zentangle Art
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-extrabold mt-2 mb-4 leading-tight">
                「一筆一畫，皆是當下的覺照」
              </h2>
              <p className="text-sm md:text-base leading-relaxed opacity-85 mb-6">
                禪繞唐卡不追求完美的繪畫技巧，而是透過高度重複、有秩序感的筆劃，將混亂的心靈沉澱。
                我們精心為您準備了四款大師級唐卡骨架。請選擇一個最能引起您當下心靈共鳴的圖騰，開始您的靜心之旅。
              </p>

              <div className="flex flex-wrap gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>多維極對稱描繪</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20">
                  <Music className="w-3.5 h-3.5 text-emerald-400" />
                  <span>頌缽雙耳搏動入定音</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  <span>正念吸氣引導環</span>
                </div>
              </div>
            </div>
          </div>

          {/* 圖騰選擇網格 */}
          <div className="mb-8 flex items-center justify-between border-b border-gray-800/60 pb-3">
            <h3 className="text-lg font-serif font-semibold tracking-wider flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-500" />
              挑選您想靜心描畫的唐卡神聖圖騰：
            </h3>
            <span className="text-xs opacity-60">共 4 款經典底稿</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {THANGKA_TEMPLATES.map((tpl) => {
              const isActive = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`group rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? "border-amber-500/80 bg-amber-500/5 shadow-lg shadow-amber-500/5"
                      : isDarkMode
                        ? "border-gray-800 bg-[#11131E]/60 hover:border-gray-700 hover:bg-[#11131E]"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* SVG 預覽圖 */}
                    <div
                      className={`aspect-square rounded-xl p-4 flex items-center justify-center mb-4 transition-all ${
                        isDarkMode ? "bg-[#090A10]" : "bg-gray-50"
                      } group-hover:scale-[1.02]`}
                    >
                      <svg
                        viewBox="0 0 400 400"
                        className={`w-full h-full ${isActive ? "text-amber-500" : "text-gray-400/80 group-hover:text-gray-300"}`}
                        dangerouslySetInnerHTML={{ __html: tpl.renderGuides(400) }}
                      />
                    </div>

                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-base md:text-lg font-serif">{tpl.title}</h4>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400">
                        {tpl.id.split("_")[0]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-serif mb-3 italic">
                      {tpl.englishTitle}
                    </p>
                    <p className="text-xs opacity-75 line-clamp-3 mb-4 leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800/40">
                    <div className="flex justify-between text-[11px] opacity-60 mb-3">
                      <span>難易度: {tpl.difficulty}</span>
                      <span>{tpl.timeCost}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTemplate(tpl);
                        setViewMode("canvas");
                        startZenSound(); // 進入時自動開啟頌缽梵音
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        isActive
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                          : "bg-gray-500/15 text-gray-300 hover:bg-gray-500/25"
                      }`}
                    >
                      <span>進入靜心繪製</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 禪繞畫教學補充說明 */}
          <section
            className={`mt-16 p-8 rounded-2xl border ${
              isDarkMode ? "bg-[#10121C] border-gray-800" : "bg-stone-50 border-stone-200"
            }`}
          >
            <h4 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              禪繞唐卡新手靜心五步法
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-xs md:text-sm">
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">1. 感恩與平靜</div>
                <p className="opacity-75 text-xs leading-relaxed">
                  坐在舒適椅子上，深呼吸三次。開啟「背景頌缽音」，讓外界嘈雜漸漸退去。
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">2. 觀察與對齊</div>
                <p className="opacity-75 text-xs leading-relaxed">
                  看著底稿的神聖幾何，這不是束縛，而是協助您在虛空中建立宇宙秩序的階梯。
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">3. 專注畫線</div>
                <p className="opacity-75 text-xs leading-relaxed">
                  開啟對稱模式。順著底稿格線，重複地畫出一條條波浪、圓圈或網格。不急躁，一筆一畫。
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">4. 填補陰影</div>
                <p className="opacity-75 text-xs leading-relaxed">
                  在線條交錯的地方，使用「玄鐵炭黑」或降低透明度畫筆，描出陰影，營造立體交織感。
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-amber-500">5. 迴向與欣賞</div>
                <p className="opacity-75 text-xs leading-relaxed">
                  完成後，關閉引導線，看看只屬於你內心秩序的輝煌成果，感恩這段與自己獨處的時光。
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ==========================================
          視圖 B：互動覺知創作畫布 (Canvas)
          ========================================== */}
      {viewMode === "canvas" && (
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 左側：靜心導引與禪繞參考板面 (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              {/* 圖案小卡 */}
              <div
                className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#11131E]/90 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold uppercase tracking-wider">
                  目前靜心底稿
                </span>
                <h3 className="text-xl font-bold font-serif mt-2 mb-1">{selectedTemplate.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{selectedTemplate.englishTitle}</p>
                <div className="p-3 rounded-lg bg-gray-500/5 text-xs space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="opacity-60">象徵意義：</span>
                    <span className="font-medium text-amber-400">{selectedTemplate.symbolism}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-60">建議禪繞：</span>
                    <span className="font-medium">Paradox 扭轉線、點狀填充</span>
                  </div>
                </div>

                {/* 快捷切換（不需返回大廳） */}
                <div className="pt-3 border-t border-gray-800/40">
                  <label className="text-[11px] opacity-60 block mb-2">
                    快速切換其他唐卡底圖：
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {THANGKA_TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border truncate transition-all ${
                          selectedTemplate.id === t.id
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
                            : "border-transparent bg-gray-500/10 text-gray-400 hover:bg-gray-500/15"
                        }`}
                      >
                        {t.title.split("")[0] + t.title.split("")[1] + "..."}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 對稱工具與禪繞筆刷設定 */}
              <div
                className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#11131E]/90 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <h4 className="text-sm font-bold font-serif mb-4 flex items-center gap-1.5 border-b border-gray-800/40 pb-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  禪繞畫筆 & 對稱神聖幾何
                </h4>

                <div className="space-y-4">
                  {/* 極座標對稱開關 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold">神聖鏡像旋轉對稱</span>
                      <button
                        onClick={() => setIsSymmetryEnabled(!isSymmetryEnabled)}
                        className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                          isSymmetryEnabled
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-gray-500/15 text-gray-400"
                        }`}
                      >
                        {isSymmetryEnabled ? "啟用中" : "已關閉"}
                      </button>
                    </div>
                    {isSymmetryEnabled && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px] opacity-60">
                          <span>對稱瓣數 (Symmetry): {symmetryFactor} 分割</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="12"
                          step="2"
                          value={symmetryFactor}
                          onChange={(e) => setSymmetryFactor(Number(e.target.value))}
                          className="w-full accent-amber-500"
                        />
                        <p className="text-[10px] text-amber-400/80 leading-relaxed italic">
                          💡
                          提示：開啟對稱後，只需在一瓣中描繪細部線條，系統會幫您同步鏡像渲染全幅，輕鬆畫出完美的密宗圓滿壇城！
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 筆刷設定 */}
                  <div className="space-y-3 pt-3 border-t border-gray-800/40">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>禪繞筆尖粗細: {brushWidth}px</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={brushWidth}
                        onChange={(e) => setBrushWidth(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>墨水濃度(透明度): {Math.round(brushOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={brushOpacity * 100}
                        onChange={(e) => setBrushOpacity(Number(e.target.value) / 100)}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* 專業唐卡配色盤 */}
                  <div className="space-y-2 pt-3 border-t border-gray-800/40">
                    <span className="text-xs font-semibold block">修持法色調：</span>
                    <div className="grid grid-cols-3 gap-2">
                      {palettePresets.map((color) => {
                        const isSelected = brushColor === color.hex;
                        return (
                          <button
                            key={color.name}
                            onClick={() => setBrushColor(color.hex)}
                            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all ${
                              isSelected
                                ? "border-amber-500 bg-amber-500/5 shadow"
                                : "border-transparent hover:bg-gray-500/5"
                            }`}
                          >
                            <div
                              className="w-full h-4 rounded-md border border-white/10"
                              style={{ backgroundColor: color.hex }}
                            />
                            <span className="text-[9px] font-medium truncate w-full text-center">
                              {color.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 經典禪繞圖案(Tangles)步驟參考 */}
              <div
                className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#11131E]/90 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <h4 className="text-sm font-bold font-serif mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  經典格紋建議 (Tangles)
                </h4>
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {ZENTANGLE_PATTERNS.map((pattern) => (
                    <div
                      key={pattern.name}
                      className="p-2 rounded bg-gray-500/5 text-xs flex items-start gap-2.5"
                    >
                      <span className="text-base">{pattern.symbol}</span>
                      <div>
                        <div className="font-bold flex items-center gap-1">
                          <span>{pattern.name}</span>
                          <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-400">
                            {pattern.difficulty}
                          </span>
                        </div>
                        <p className="opacity-70 text-[10px] mt-0.5">{pattern.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 中間：畫布核心區域 (5 columns) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* 畫布控制頂欄 */}
              <div className="w-full flex justify-between items-center mb-3 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={handleUndo}
                    disabled={historyPointer <= 0}
                    className={`p-2 rounded-lg flex items-center gap-1 ${
                      historyPointer > 0
                        ? "bg-gray-500/15 hover:bg-gray-500/25 text-gray-200"
                        : "opacity-40 cursor-not-allowed text-gray-500"
                    }`}
                    title="復原一筆"
                  >
                    <Undo className="w-3.5 h-3.5" />
                    <span>復原</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>重畫</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  {/* 底稿開關與透明度 */}
                  <div className="flex items-center gap-1 bg-gray-500/10 px-2.5 py-1 rounded-lg">
                    <button
                      onClick={() => setShowDraft(!showDraft)}
                      className="text-gray-300 hover:text-white"
                      title={showDraft ? "隱藏底稿" : "顯示底稿"}
                    >
                      {showDraft ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className="text-[10px] ml-1 opacity-75">底稿透明度:</span>
                    <input
                      type="range"
                      min="5"
                      max="85"
                      step="5"
                      value={draftOpacity * 100}
                      onChange={(e) => setDraftOpacity(Number(e.target.value) / 100)}
                      className="w-16 accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 畫布主容器 (底稿與手繪同軸重疊) */}
              <div
                id="canvas-container"
                className={`relative rounded-3xl border overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? "bg-[#12131C] border-gray-800 shadow-2xl shadow-black/60"
                    : "bg-white border-gray-300 shadow-xl shadow-gray-200"
                }`}
                style={{ width: canvasSize, height: canvasSize }}
              >
                {/* A. 底稿引導圖層 (SVG 渲染) */}
                {showDraft && (
                  <div
                    className="absolute inset-0 pointer-events-none z-0 transition-opacity"
                    style={{ opacity: draftOpacity }}
                  >
                    <svg
                      viewBox={`0 0 ${canvasSize} ${canvasSize}`}
                      className={`w-full h-full ${isDarkMode ? "text-amber-500" : "text-slate-900"}`}
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.renderGuides(canvasSize),
                      }}
                    />
                  </div>
                )}

                {/* B. 手繪畫布圖層 */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 z-10 cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              {/* 下載與歸檔按鈕 */}
              <div className="w-full mt-4 flex gap-3">
                <button
                  onClick={handleExport}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm tracking-widest hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15"
                >
                  <Download className="w-4 h-4" />
                  保存當下覺照 (合併底稿高解析導出)
                </button>
              </div>
            </div>

            {/* 右側：正念呼吸引導與神聖法器 (3 columns) */}
            <div className="lg:col-span-3 space-y-6">
              {/* 正念呼吸大師 (Breathing Mentor) */}
              <div
                className={`p-5 rounded-2xl border text-center ${
                  isDarkMode
                    ? "bg-gradient-to-b from-[#11131E] to-[#151929] border-gray-800"
                    : "bg-gradient-to-b from-amber-50/40 to-stone-50 border-gray-200"
                }`}
              >
                <h4 className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-3 flex items-center justify-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  正念呼吸儀式
                </h4>

                {/* 動態呼吸環 */}
                <div className="relative w-32 h-32 mx-auto my-4 flex items-center justify-center">
                  {/* 背景脈動環 */}
                  <div
                    className="absolute inset-0 rounded-full bg-amber-500/10 border border-amber-500/20 transition-all duration-[1000ms] ease-in-out"
                    style={{
                      transform: `scale(${
                        breathState === "吸氣" ? 1.2 : breathState === "吐氣" ? 0.85 : 1.0
                      })`,
                    }}
                  />

                  {/* 主要氣旋環 */}
                  <div
                    className="w-24 h-24 rounded-full border-2 border-dashed border-amber-400 flex flex-col items-center justify-center p-2 transition-all duration-[4000ms]"
                    style={{
                      transform: `rotate(${breathProgress * 3.6}deg)`,
                    }}
                  >
                    <span className="text-xs font-serif font-bold tracking-wider">
                      {breathState}
                    </span>
                  </div>

                  {/* 呼吸引導外圈進度條 */}
                  <svg className="absolute inset-0 transform -rotate-90 w-full h-full pointer-events-none">
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      className="text-amber-500/20"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      stroke="currentColor"
                      className="text-amber-500 transition-all duration-100"
                      strokeWidth="3.5"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={2 * Math.PI * 54 * (1 - breathProgress / 100)}
                      fill="none"
                    />
                  </svg>
                </div>

                <p className="text-xs text-gray-400 mt-2 italic leading-relaxed">
                  「吸氣時，感知筆尖與心意合一；
                  <br />
                  吐氣時，雜念化為畫布上的金絲。」
                </p>
              </div>

              {/* 靜心梵音控制板 */}
              <div
                className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#11131E]/90 border-gray-800" : "bg-white border-gray-200"}`}
              >
                <h4 className="text-sm font-bold font-serif mb-3 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-emerald-400" />
                  梵音聲景設定
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">西藏頌缽 (Tibetan Bowl)</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    使用純淨聲波諧振原理，專為禪修畫作編排的 110Hz A2
                    梵音，能在作畫時自然引導大腦進入平穩的 𝜶 腦波狀態。
                  </p>

                  <button
                    onClick={toggleZenMusic}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      isPlayingAudio
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {isPlayingAudio ? "關閉頌缽環境聲" : "開啟梵音環境聲"}
                  </button>
                </div>
              </div>

              {/* 作畫小貼士與科普 */}
              <div
                className={`p-5 rounded-2xl border ${isDarkMode ? "bg-[#11131E]/90 border-gray-800" : "bg-white border-gray-200"} text-xs leading-relaxed space-y-2`}
              >
                <div className="flex items-center gap-1 text-amber-500 font-bold font-serif mb-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>禪繞唐卡作畫心法</span>
                </div>
                <p className="opacity-85">
                  <strong>一筆一畫原則：</strong>{" "}
                  禪繞畫沒有「錯誤」。如果不小心畫歪了，不要去擦掉，而是顺著歪掉的線條延伸出一個新的對稱裝飾。
                </p>
                <p className="opacity-85">
                  <strong>呼吸配合：</strong>{" "}
                  如果覺得線條發抖，可以嘗試在「持氣（靜止）」或者平緩「吐氣」時拉出長線條，會感到無比順暢。
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* 底部導航 & 禪意語錄 */}
      <footer
        className={`border-t mt-20 py-8 text-center text-xs opacity-60 ${isDarkMode ? "border-gray-800 text-gray-500" : "border-gray-200 text-gray-600"}`}
      >
        <p className="font-serif italic mb-2">
          "Anything is possible, one stroke at a time. 一筆一畫，皆是宇宙的圓滿。"
        </p>
        <p>© 2026 Mindful Canvas 覺知畫布. 專注、靜心、當下的力量.</p>
      </footer>
    </div>
  );
}
