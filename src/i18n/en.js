export const en = {
  meta: {
    title: "Mindful Canvas",
  },

  accessibility: {
    skipToContent: "Skip to content",
    canvasAria: "Drawing canvas",
  },

  lang: {
    toggleLabel: "Switch language",
  },

  welcome: {
    title: "Mindful Canvas",
    lead: "Draw one stroke, let your heart settle",
    sub: "Explore three creative experiences",
    footer: "Create to care for your inner self",
    recentTitle: "Recent work",
    recentAll: "See all →",
    recentEmpty: "After you finish a piece, it will appear here",
    recentAria: "Recent work thumbnails",
    feedbackTitle: "Feedback",
    feedbackSub: "Your thoughts help us improve",
  },

  showcase: {
    zen: {
      title: "🪷 Zen Thangka",
      desc: "Follow gentle prompts, stroke by stroke, to finish a mindful symbol",
      cta: "Start creating →",
      ariaLabel: "Zen Thangka: follow prompts to complete a mindful symbol",
    },
    sumi: {
      title: "🌊 Ink Marbling",
      desc: "Colors flow and spread naturally — every piece is one of a kind",
      cta: "Start creating →",
      ariaLabel: "Ink Marbling: colors flow and spread naturally",
    },
    free: {
      title: "🎨 Free Canvas",
      desc: "No rules — let inspiration flow freely",
      cta: "Start creating →",
      ariaLabel: "Free Canvas: no rules, inspiration flows freely",
    },
  },

  gallery: {
    back: "← Back",
    title: "Soul Gallery",
    sub: "Your last 10 pieces · Stored on this device only, never uploaded",
    empty: "No pieces yet. Finish a creation and it will be saved here automatically.",
    emptyCorrupt:
      "Some records were corrupted or cleared. Finish a creation and it will be saved here automatically.",
    thumbMissing: "No thumbnail",
    detailAlt: "Soul Gallery artwork",
    delete: "Delete this piece",
    deleting: "Deleting…",
    close: "Close",
    modes: {
      free: "Free Canvas",
      zen: "Zen Thangka",
      sumi: "Ink Marbling",
    },
    corruptRemoved: "Removed {n} corrupted entries",
    corruptEntry: "Corrupted entry removed",
    openFail: "Couldn't open Soul Gallery",
    deleteFail: "Couldn't delete this piece",
    deleted: "Deleted",
    deleteFailRetry: "Delete failed — please try again",
    storageFail: "Couldn't open Soul Gallery (this device may not support local storage)",
    exportDone: "Session data exported",
    incompleteEntry: "This piece wasn't saved completely",
  },

  zenPicker: {
    title: "Pick a pattern to follow",
    sub: "Each has a preview — tap a pattern and trace the pale guide lines",
    back: "← Back",
    tikseGrid: "Proportion grid",
    hint: "Follow the pale lines and leave your colorful traces",
    hintDone: "All done! Creating your soul card…",
    stepsFallback: "{n} steps to follow",
    choose: "Choose {name}",
  },

  canvas: {
    ariaLabel: "Drawing canvas — release emotions with color",
    back: "← Back",
    complete: "Done →",
    titles: {
      free: "Free Canvas",
      zen: "Zen Thangka",
      sumi: "Ink Marbling",
    },
  },

  sumi: {
    dropInk: "Drop ink",
    stirWater: "Stir water",
    stepsAria: "Ink marbling: drop ink, stir water",
    flow: "Flow",
    flowFine: "Fine",
    flowMid: "Medium",
    flowLarge: "Strong",
    flowAria: "Flow strength",
    undo: "Undo",
    wash: "Clear the water",
    colors: {
      0: "Black ink",
      1: "Vermillion",
      2: "Indigo",
      3: "Gamboge",
      4: "Pine green",
      5: "Purple wisteria",
      6: "Amber",
      7: "Cerulean",
      8: "Chestnut brown",
      9: "Sky blue",
      10: "Sand gold",
      11: "Fresh green",
    },
  },

  tools: {
    collapse: "Collapse ▼",
    expand: "Tools ▲",
    undoTitle: "Undo last step",
    undoAria: "Undo last step",
    eraserTitle: "Eraser",
    eraserAria: "Eraser",
    particles: "Particles",
    toggleAria: "Collapse or expand tools",
  },

  card: {
    drawingAlt: "Your artwork",
    terms: "Terms of Use",
    save: "Save card",
    feedback: "Share feedback",
    home: "Back to home",
    safetyHome: "Back to home",
    shared: "Shared",
    saved: "Card saved",
  },

  feedback: {
    title: "Share Your Experience",
    subtitle: "Your feedback helps us improve",
    ratingGroup: "Select rating",
    placeholder: "Optional: Share your thoughts (max 200 chars)",
    skip: "Skip",
    submit: "Submit Feedback",
    thankYou: "Thank you for your feedback!",
    saved: "Feedback saved",
    exportDone: "Feedback exported",
  },

  loading: {
    generating: "Creating your soul reflection...",
    aiGenerating: "AI is writing your personal reflection...",
  },

  toast: {
    noUndo: "Nothing to undo",
    undone: "Undone last step",
    washDone: "Water cleared — fresh start",
    drawFirst: "Draw something first",
    sumiTap: "Tap the water to drop a dot of ink",
    shareDone: "Shared",
    saveDone: "Card saved",
  },

  terms: {
    back: "← Back",
    heading: "Terms of Use",
    s1: {
      title: "1. Licence to use",
      body: "This tool is for school teaching and personal mindfulness practice only. You may not use it for commercial purposes, redistribution, or adaptation without written permission.",
    },
    s2: {
      title: "2. Intellectual property",
      body: "The app's code, UI design, mindful affirmations, reflection algorithms, scene guidance scripts, and brand assets are the intellectual property of ZenArt Lab. All rights reserved.",
    },
    s3: {
      title: "3. Your content",
      body: "You own the copyright to artwork you create on the canvas. This app does not collect, store, or upload your personal creations to any server. Soul Gallery thumbnails are saved only in IndexedDB on your device, and you can delete them at any time.",
    },
    s4: {
      title: "4. Disclaimer",
      body: "This tool is not a medical or psychotherapy service. If you are experiencing serious emotional distress, please contact a professional.\nHong Kong 24-hour lifelines: 2382 0000",
    },
    s5: {
      title: "5. Privacy",
      body: "Your creations and Soul Gallery thumbnails stay on your device (localStorage / IndexedDB) and are not uploaded. This app uses Google Analytics to collect anonymous usage statistics (such as opening the canvas or saving a card), without artwork or personal text content.",
    },
    s6: {
      title: "6. Brand",
      body: "Mindful Canvas™ and 覺知畫布™ are trademarks of ZenArt Lab. By using this tool, you agree to the terms above.",
    },
    footer: "Mindful Canvas v2.6.0 · ZenArt Lab",
  },

  reflection: {
    zenStrokes: "{count} traces of color",
    zenQuiet: "Followed quietly to completion",
    sumiInteract: "{count} times with the water",
    sumiWatch: "Watched the ink flow",
    strokesFew: "{count} strokes, lots of open space",
    strokesMid: "{count} strokes sketching your mood",
    strokesMany: "{count} strokes layered on",
    strokesRelease: "{count} strokes of release",
    zenRhythm: "In rhythm together",
    sumiRhythm: "Water finds its own rhythm",
    silenceDeep: "There was deep stillness",
    silenceMid: "Paused for about {sec} seconds",
    silenceShort: "Still for {sec} seconds",
    silenceFlow: "A flowing rhythm",
  },

  content: {
    safety: {
      affirmation: "I hear you. You are not alone.",
      reflection:
        "If you're going through a difficult time, remember that people care about you. Hong Kong 24-hour lifelines: 2382 0000 (Tung Wah Group of Hospitals) or 2389 2222 (The Samaritans). Would you be willing to make a call?",
    },

    affirmations: {
      anxious: [
        "You picked up the brush — that's enough.",
        "Anxiety softens in the colors.",
        "You're here, and you're safe.",
        "Facing a blank page takes courage.",
        "Breathe — this moment is with you.",
      ],
      chaotic: [
        "Chaos is creativity too.",
        "Putting it on paper is a kind of sorting.",
        "Let the lines find their own way.",
        "You don't need to figure it all out first.",
        "Your feelings are honestly on the page.",
      ],
      stuck: [
        "Empty space is part of creating.",
        "Pausing is gentle too.",
        "No rush — the next step will come.",
        "You gave yourself room.",
        "Blank space is a gift to yourself.",
      ],
      free: [
        "No right or wrong — just this moment.",
        "Your hand knows where to go.",
        "Being here is enough.",
        "Every stroke is a fresh start.",
        "Your focused presence stays with you.",
      ],
      metta: [
        "You sent a blessing through color.",
        "Kindness warmed you first.",
        "Your blessing crossed the distance.",
        "A soft heart is opening.",
        "Your loving-kindness is complete.",
      ],
      karuna: [
        "You're willing to share the weight.",
        "Your brush said the gentlest thing.",
        "You made space for the pain.",
        "You're here — you're not alone.",
        "Being present is compassion itself.",
      ],
      mudita: [
        "Rejoicing for others fills the heart.",
        "Shared joy is a kind of strength.",
        "You saved a stroke for someone's smile.",
        "This heart of yours is precious.",
        "Your joy is complete.",
      ],
      upekkha: [
        "Letting go is freedom.",
        "You practiced equanimity.",
        "See, accept, and move on.",
        "Lines come and go.",
        "Simply watching is practice.",
      ],
      zen: [
        "You followed the rhythm — you were present.",
        "In a light touch, awareness stays.",
        "One minute is enough to settle.",
        "It doesn't have to look perfect.",
        "You're one with this moment.",
      ],
      sumi: [
        "The ink finds its own shape.",
        "Every ripple is one of a kind.",
        "Let go of control — the result is beautiful.",
        "The water can hold your thoughts.",
        "The water isn't rushing; the ink isn't either.",
      ],
    },

    sceneGuidance: {
      anxious:
        'You chose "Anxious." Take a deep breath… This blank page is a quiet field of snow. Your brush only needs to glide lightly across the surface — no need to define it right away. Now, draw a line or place a dot anywhere. Let your first stroke be imperfect.',
      chaotic:
        "You chose \"Chaotic.\" Your mind is full — like tangled lines. That's okay; you don't have to force it to stop. Bring your attention back to your breath, and guide the tangle onto the page through your brush. You don't need to draw anything specific.",
      stuck:
        'You chose "Stuck." Pausing is a natural part of creating, like a rest in music. No need to push through. When you\'re ready, don\'t think "what should I draw" — feel "how does my hand want to move."',
      free: 'You chose "Free Canvas." No rules, no right or wrong. Let your hand lead you; let color flow on the canvas. For now, you only need to be with the colors.',
      zen: 'You chose "Zen Thangka." It doesn\'t have to look good — just follow the rhythm. Touch the screen lightly, feel the glow, and let the pattern and music bring you into the present.',
      sumi: 'You chose "Ink Marbling." Imagine still water in front of you. Tap gently to drop a dot of ink and watch it bloom; stir with your finger and the ink will follow the flow. You don\'t need to control the result — the water will help you finish.',
      metta:
        'You chose "Loving-kindness." Think of someone you want to bless — family, a friend, even yourself. Let your brush move with goodwill. It doesn\'t have to be perfect — just sincere. Every stroke is a silent wish: may you be happy.',
      karuna:
        'You chose "Compassion." Think of someone who is suffering. You don\'t have to fix their problems — just draw your presence on the canvas. Sometimes quietly being there is the greatest compassion.',
      mudita:
        'You chose "Joy." Think of someone whose happiness makes you glad — their success, their smile, their joy. Let your colors grow bright and paint delight for someone else\'s happiness. Rejoicing for them is practice too.',
      upekkha:
        'You chose "Equanimity." Let go of good and bad, gain and loss, right and wrong. Let the brush move freely — no chasing, no clinging. Accept that every stroke will fade, like everything in life. Peacefully living with imperfection is the greatest freedom.',
    },

    sceneEndings: {
      anxious: "Return to daily life with awareness.",
      chaotic: "The weight feels a little lighter.",
      stuck: "When you're ready, the next step will come.",
      free: "Stay with this moment of creating.",
      metta: "Take this warmth with you.",
      karuna: "Your presence is complete.",
      mudita: "Shared joy makes the heart richer.",
      upekkha: "Accept fading with calm.",
      zen: "Take this steadiness with you.",
      sumi: "Let the water keep flowing.",
    },

    colorDescriptions: {
      "#e2b55a": { name: "Golden light", meaning: "Gold — warm wisdom." },
      "#2c5f7c": { name: "Deep sea", meaning: "Deep blue — seeking calm." },
      "#8b5e83": { name: "Twilight", meaning: "Purple — inner transformation." },
      "#a0826d": { name: "Dry leaf", meaning: "Earth tones — steady ground." },
      "#d4d0c8": { name: "Mist white", meaning: "Open space — room for possibility." },
      "#5a7a5a": { name: "Bamboo green", meaning: "Green — longing to heal." },
      "#c46b4a": { name: "Sunset glow", meaning: "Orange — life force rising." },
      "#3a3a4a": { name: "Ink black", meaning: "Ink — turning inward." },
    },
  },

  zen: {
    templates: {
      circle: { name: "Concentric Circles" },
      lotus: { name: "Lotus of Stillness" },
      spiral: { name: "Breath Spiral" },
      mandala: { name: "Vairocana Great Mandala" },
      flower_of_life: { name: "Flower of Life" },
      endless_knot: { name: "Eternal Auspicious Knot" },
      bodhi_fish: { name: "Golden Auspicious Fish" },
      lotus_mantha: { name: "Sacred Lotus of Compassion" },
      vajra: { name: "Five-Pronged Vajra" },
      conch: { name: "Sacred White Conch" },
      dharma_wheel: { name: "Golden Dharma Wheel" },
      treasure_vase: { name: "Treasure Vase of Nectar" },
    },

    picker: {
      circle: "Easiest · 4 steps · Great for first-timers",
      lotus: "Classic zen · 5 steps · Most visual",
      lotus_mantha: "Compassion lotus · 4 steps · Double-layer petals",
      spiral: "Follow your breath · 5 steps · Flowing feel",
      mandala: "Sacred mandala · 5 steps · Pro template",
      flower_of_life: "Sacred geometry · Full screen · Symmetry",
      endless_knot: "Interwoven fate · 6 steps · 3D weave",
      bodhi_fish: "Eight auspicious · 6 steps · Flowing harmony",
      vajra: "Tantric symbol · 4 steps · Centered symmetry",
      conch: "Eight auspicious · 3 steps · Golden spiral",
      dharma_wheel: "Eight auspicious · 3 steps · Eight-spoke wheel",
      treasure_vase: "Eight auspicious · 3 steps · Nectar vase",
    },

    meta: {
      mandala: {
        difficulty: "⭐⭐⭐⭐⭐",
        timeCost: "about 45 min",
        symbolism: "Wholeness, focus, quieting the mind",
      },
      lotus_mantha: {
        difficulty: "⭐⭐⭐⭐",
        timeCost: "about 30 min",
        symbolism: "Purity, compassion, rising above hardship",
      },
      bodhi_fish: {
        difficulty: "⭐⭐⭐⭐",
        timeCost: "about 35 min",
        symbolism: "Freedom without obstacles, joy and abundance",
      },
      endless_knot: {
        difficulty: "⭐⭐⭐⭐⭐",
        timeCost: "about 50 min",
        symbolism: "Long life, endless wisdom, harmonious connections",
      },
      vajra: {
        difficulty: "⭐⭐⭐⭐⭐",
        timeCost: "about 55 min",
        symbolism: "Cutting through attachment, breaking inner obstacles",
      },
      conch: {
        difficulty: "⭐⭐⭐⭐",
        timeCost: "about 40 min",
        symbolism: "Far-reaching good sound, clearing confusion",
      },
      dharma_wheel: {
        difficulty: "⭐⭐⭐",
        timeCost: "about 25 min",
        symbolism: "Dharma always turning, wisdom never stops",
      },
      treasure_vase: {
        difficulty: "⭐⭐⭐⭐",
        timeCost: "about 35 min",
        symbolism: "Blessings and wisdom full to the brim",
      },
    },
  },
};
