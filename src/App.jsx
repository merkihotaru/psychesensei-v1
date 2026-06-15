import { useState, useEffect, useRef } from "react";

// ===================== STORAGE (localStorage-backed) =====================
// Mimics the artifact's window.storage API (get/set/delete), but uses the
// browser's localStorage so data persists for this user on this device.
const storage = {
  async get(key) {
    try {
      const raw = localStorage.getItem(`psychesensei:${key}`);
      if (raw === null) return null;
      return { key, value: raw };
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      localStorage.setItem(`psychesensei:${key}`, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  async delete(key) {
    try {
      localStorage.removeItem(`psychesensei:${key}`);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
};

// ===================== THEME =====================
const THEMES = {
  light: {
    bg: "#FAF6F0",
    bgGradient: "linear-gradient(135deg, #FAF6F0 0%, #F3EDE3 100%)",
    surface: "#FFFFFF",
    text: "#3A3530",
    textSoft: "#8A8076",
    accent1: "#2EC4D6", // mascot cyan (matches logo)
    accent2: "#F2545B", // mascot red (matches logo)
    soft1: "#7FB3A8", // calmer site accent (teal)
    soft2: "#E8927C", // calmer site accent (coral)
    border: "#EBE4D8",
    onAccent: "#FFFFFF",
  },
  dark: {
    bg: "#1E1B18",
    bgGradient: "linear-gradient(135deg, #1E1B18 0%, #24201C 100%)",
    surface: "#2A2622",
    text: "#F2EDE6",
    textSoft: "#A39A8E",
    accent1: "#3DD6E8",
    accent2: "#FF6A72",
    soft1: "#6FA89C",
    soft2: "#D98370",
    border: "#3A352F",
    onAccent: "#1E1B18",
  },
};

const QUOTES = [
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "We suffer more in imagination than in reality.", author: "Seneca" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre" },
  { text: "Between stimulus and response there is a space. In that space is our power to choose.", author: "Viktor Frankl" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "Not everything that is faced can be changed, but nothing can be changed until it is faced.", author: "James Baldwin" },
];

const DAILY_THOUGHTS = [
  "Is the way you talk to yourself something you'd say to a friend?",
  "What's a belief you hold that you inherited rather than chose?",
  "When was the last time you changed your mind about something small?",
  "What's something you do out of habit that you've never questioned?",
  "If today were a quiet success, what would have happened in it?",
  "What's a story you tell about yourself that might not be fully true anymore?",
  "What's something you're avoiding because it might go well?",
];

function dayIndex(len) {
  const start = new Date(2025, 0, 1);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return ((diff % len) + len) % len;
}

// ===================== RANDOM MOOD MASCOT (home hero) =====================
// The mascot with a randomly changing mood every few seconds, plus blinking.
// No rotation, no spinning lines — just an alive little character.
const ALL_MOODS = ["calm", "curious", "thinking", "celebrating", "sleepy", "examining", "playful", "happy", "sad", "angry"];

function RandomMoodMascot({ size = 96, t }) {
  const [mood, setMood] = useState("calm");

  useEffect(() => {
    const tick = () => {
      setMood((current) => {
        let next;
        do { next = ALL_MOODS[Math.floor(Math.random() * ALL_MOODS.length)]; } while (next === current);
        return next;
      });
    };
    const interval = setInterval(tick, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Mascot mood={mood} size={size} t={t} />
      <div style={{ marginTop: 14, fontSize: 14, fontWeight: 700, letterSpacing: "0.02em" }}>
        psyche<span style={{ color: t.accent2 }}>sensei</span>
      </div>
    </div>
  );
}

// ===================== MEDITATION ICON (Reflect) =====================
function MeditationIcon({ size = 56, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <style>{`
        @keyframes breathScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes breathGlow {
          0%, 100% { opacity: 0.15; r: 44; }
          50% { opacity: 0.35; r: 48; }
        }
      `}</style>
      {/* breathing aura */}
      <circle cx="50" cy="50" r="44" fill={t.soft1} style={{ animation: "breathGlow 4s ease-in-out infinite", transformOrigin: "50px 50px" }} />
      {/* figure */}
      <g style={{ animation: "breathScale 4s ease-in-out infinite", transformOrigin: "50px 55px" }}>
        {/* head */}
        <circle cx="50" cy="32" r="10" fill={t.accent2} />
        {/* body / robe triangle */}
        <path d="M50 42 C30 42, 24 70, 24 74 L76 74 C76 70, 70 42, 50 42 Z" fill={t.accent1} />
        {/* crossed legs hint */}
        <path d="M28 74 Q50 82 72 74" stroke={t.border} strokeWidth="2" fill="none" />
        {/* arms resting */}
        <circle cx="36" cy="62" r="4" fill={t.accent2} opacity="0.8" />
        <circle cx="64" cy="62" r="4" fill={t.accent1} opacity="0.8" />
        {/* calm face */}
        <path d="M45 32 q5 3 10 0" stroke={t.text} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ===================== SCROLL + WRITE ICON (Journal) =====================
function ScrollWriteIcon({ size = 56, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <style>{`
        @keyframes writeLine {
          0%, 15% { stroke-dashoffset: 40; opacity: 0.9; }
          55% { stroke-dashoffset: 0; opacity: 0.9; }
          70%, 100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes pencilMove {
          0%, 15% { transform: translate(0px, 0px) rotate(-35deg); }
          55% { transform: translate(40px, 0px) rotate(-35deg); }
          70%, 100% { transform: translate(40px, 0px) rotate(-35deg); opacity: 0; }
        }
        @keyframes pencilFadeIn {
          0%, 70% { opacity: 0; }
          85%, 100% { opacity: 1; }
        }
      `}</style>
      {/* scroll body */}
      <rect x="18" y="22" width="64" height="56" rx="6" fill={t.surface} stroke={t.border} strokeWidth="2" />
      {/* scroll rolled ends */}
      <rect x="14" y="20" width="8" height="60" rx="4" fill={t.accent1} />
      <rect x="78" y="20" width="8" height="60" rx="4" fill={t.accent2} />

      {/* static lines (already written) */}
      <line x1="30" y1="40" x2="60" y2="40" stroke={t.border} strokeWidth="3" strokeLinecap="round" />
      <line x1="30" y1="50" x2="68" y2="50" stroke={t.border} strokeWidth="3" strokeLinecap="round" />

      {/* animated writing line */}
      <line
        x1="30" y1="62" x2="70" y2="62"
        stroke={t.soft1} strokeWidth="3" strokeLinecap="round"
        strokeDasharray="40"
        style={{ animation: "writeLine 3.2s ease-in-out infinite" }}
      />

      {/* pencil */}
      <g style={{ animation: "pencilMove 3.2s ease-in-out infinite", transformOrigin: "30px 62px" }}>
        <rect x="28" y="56" width="4" height="16" rx="1" fill={t.text} />
        <path d="M28 56 L32 56 L30 50 Z" fill={t.accent2} />
      </g>
    </svg>
  );
}

// ===================== MORPHING SHAPE ICON (Perspectives) =====================
function MorphShapeIcon({ size = 56, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <style>{`
        @keyframes morphShape {
          0%, 8%   { d: path("M20 50 L80 50 L80 51 L20 51 Z"); }                 /* line */
          20%, 28% { d: path("M50 12 A38 38 0 1 1 49.9 12 Z"); }                 /* circle */
          40%, 48% { d: path("M16 16 L84 16 L84 84 L16 84 Z"); }                 /* square */
          60%, 68% { d: path("M10 30 L90 30 L90 70 L10 70 Z"); }                 /* rectangle */
          80%, 88% { d: path("M50 12 L88 82 L12 82 Z"); }                        /* triangle */
          100%     { d: path("M20 50 L80 50 L80 51 L20 51 Z"); }                 /* back to line */
        }
      `}</style>
      <path
        d="M20 50 L80 50 L80 51 L20 51 Z"
        fill="none"
        stroke={t.text}
        strokeWidth="4"
        strokeLinejoin="round"
        style={{ animation: "morphShape 8s ease-in-out infinite" }}
      />
    </svg>
  );
}

// ===================== THINKING ICON (Sharpen) =====================
function ThinkingIcon({ size = 56, t }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <style>{`
        @keyframes bulbGlow {
          0%, 100% { opacity: 0.25; r: 22; }
          50% { opacity: 0.55; r: 27; }
        }
        @keyframes bulbFlicker {
          0%, 40% { fill: ${t.border}; }
          50%, 90% { fill: ${t.accent2}; }
          100% { fill: ${t.border}; }
        }
        @keyframes gearSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes gearSpinRev {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>

      {/* glow */}
      <circle cx="50" cy="40" r="22" fill={t.accent2} style={{ animation: "bulbGlow 2.4s ease-in-out infinite", transformOrigin: "50px 40px" }} />

      {/* bulb */}
      <circle cx="50" cy="40" r="18" style={{ animation: "bulbFlicker 2.4s ease-in-out infinite" }} />
      <rect x="42" y="56" width="16" height="8" rx="2" fill={t.textSoft} />
      <rect x="44" y="66" width="12" height="4" rx="2" fill={t.textSoft} />

      {/* gears */}
      <g style={{ animation: "gearSpin 6s linear infinite", transformOrigin: "78px 70px" }} opacity="0.8">
        <circle cx="78" cy="70" r="8" fill="none" stroke={t.soft1} strokeWidth="3" />
        <path d="M78 60 v4 M78 76 v4 M68 70 h4 M84 70 h4 M70.9 62.9 l2.8 2.8 M84.3 76.3 l2.8 2.8 M70.9 77.1 l2.8 -2.8 M84.3 63.7 l2.8 -2.8" stroke={t.soft1} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g style={{ animation: "gearSpinRev 4.5s linear infinite", transformOrigin: "20px 68px" }} opacity="0.7">
        <circle cx="20" cy="68" r="6" fill="none" stroke={t.soft2} strokeWidth="2.5" />
        <path d="M20 60 v3 M20 73 v3 M13 68 h3 M24 68 h3" stroke={t.soft2} strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ===================== MASCOT =====================
// Animated rounded split-blob mascot with blinking + mood-based expressions + greetings
function Mascot({ mood = "calm", size = 64, t, animated = true }) {
  const blinkId = useRef(`blink-${Math.random().toString(36).slice(2)}`);

  const openEyes = {
    calm: <><circle cx="40" cy="58" r="3.5" fill={t.text} /><circle cx="60" cy="58" r="3.5" fill={t.text} /></>,
    curious: <><ellipse cx="40" cy="56" rx="3.5" ry="5" fill={t.text} /><ellipse cx="61" cy="58" rx="3" ry="4" fill={t.text} /></>,
    thinking: <><path d="M36 58 q4 -4 8 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="60" cy="58" r="3.5" fill={t.text} /></>,
    celebrating: <><path d="M35 56 q5 -6 10 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M55 56 q5 -6 10 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    sleepy: <><path d="M35 58 h10" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M55 58 h10" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    examining: <><circle cx="40" cy="58" r="3.5" fill={t.text} /><circle cx="61" cy="58" r="3.5" fill={t.text} /><path d="M53 50 q8 -5 16 1" stroke={t.text} strokeWidth="2" fill="none" strokeLinecap="round" /></>,
    playful: <><path d="M35 56 q5 -5 10 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="61" cy="58" r="3.5" fill={t.text} /></>,
    happy: <><path d="M35 58 q5 -5 10 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M55 58 q5 -5 10 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    sad: <><circle cx="40" cy="60" r="3.5" fill={t.text} /><circle cx="60" cy="60" r="3.5" fill={t.text} /><path d="M34 53 q6 3 10 1" stroke={t.text} strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M66 53 q-6 3 -10 1" stroke={t.text} strokeWidth="2" fill="none" strokeLinecap="round" /></>,
    angry: <><path d="M34 54 l12 4" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M66 54 l-12 4" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="42" cy="60" r="3" fill={t.text} /><circle cx="58" cy="60" r="3" fill={t.text} /></>,
  };
  const mouth = {
    calm: <path d="M42 70 q8 6 16 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" />,
    curious: <ellipse cx="50" cy="71" rx="5" ry="6" fill={t.text} />,
    thinking: <path d="M44 72 q6 -2 12 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" />,
    celebrating: <path d="M40 68 q10 12 20 0" stroke={t.text} strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    sleepy: <ellipse cx="50" cy="71" rx="4" ry="3" fill={t.text} />,
    examining: <path d="M44 71 q6 1 12 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" />,
    playful: <path d="M41 69 q9 7 18 -1" stroke={t.text} strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    happy: <path d="M40 68 q10 10 20 0" stroke={t.text} strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    sad: <path d="M42 74 q8 -6 16 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" />,
    angry: <path d="M42 73 q8 -3 16 0" stroke={t.text} strokeWidth="3" fill="none" strokeLinecap="round" />,
  };

  // Random animation delay so each mascot instance blinks independently
  const delaySec = (Math.random() * 4).toFixed(2);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        display: "block",
        animation: animated ? "mascotFloat 4.5s ease-in-out infinite" : "none",
      }}
    >
      <defs>
        <clipPath id={`blobclip-${mood}-${size}-${blinkId.current}`}>
          <circle cx="50" cy="50" r="42" />
        </clipPath>
        <style>{`
          @keyframes mascotFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-3px); }
          }
          @keyframes mascotBlink-${blinkId.current} {
            0%, 88%, 100% { transform: scaleY(1); }
            94% { transform: scaleY(0.05); }
          }
          @keyframes zzzFloat-${blinkId.current} {
            0% { opacity: 0; transform: translate(0px, 4px) scale(0.8); }
            20% { opacity: 1; transform: translate(0px, 0px) scale(1); }
            70% { opacity: 1; transform: translate(4px, -8px) scale(1.05); }
            100% { opacity: 0; transform: translate(8px, -16px) scale(1.1); }
          }
          @keyframes thinkBob-${blinkId.current} {
            0%, 100% { transform: translateY(0px); opacity: 0.7; }
            50% { transform: translateY(-3px); opacity: 1; }
          }
          @keyframes sparkleTwinkle-${blinkId.current} {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.15); }
          }
          @keyframes monocleGlint-${blinkId.current} {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
          @keyframes curiousPulse-${blinkId.current} {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.25); }
          }
        `}</style>
      </defs>
      <g clipPath={`url(#blobclip-${mood}-${size}-${blinkId.current})`}>
        <rect x="0" y="0" width="50" height="100" fill={t.accent1} />
        <rect x="50" y="0" width="50" height="100" fill={t.accent2} />
      </g>
      <circle cx="50" cy="50" r="42" fill="none" stroke={t.border} strokeWidth="2" />
      <g
        style={{
          transformOrigin: "50px 58px",
          animation: animated
            ? mood === "curious"
              ? `curiousPulse-${blinkId.current} 2.6s ease-in-out infinite`
              : `mascotBlink-${blinkId.current} 4s ease-in-out ${delaySec}s infinite`
            : "none",
        }}
      >
        {openEyes[mood] || openEyes.calm}
      </g>
      {mouth[mood] || mouth.calm}

      {mood === "thinking" && (
        <g>
          <circle
            cx="78" cy="22" r="2.5" fill={t.textSoft} opacity="0.7"
            style={{ animation: animated ? `thinkBob-${blinkId.current} 1.8s ease-in-out infinite` : "none", transformOrigin: "78px 22px" }}
          />
          <circle
            cx="85" cy="14" r="3.5" fill={t.textSoft} opacity="0.7"
            style={{ animation: animated ? `thinkBob-${blinkId.current} 1.8s ease-in-out 0.3s infinite` : "none", transformOrigin: "85px 14px" }}
          />
        </g>
      )}

      {mood === "celebrating" && (
        <g opacity="0.85">
          <path
            d="M18 20 l4 4 M18 24 l-4 4 M14 16 v6" stroke={t.accent2} strokeWidth="2" strokeLinecap="round"
            style={{ animation: animated ? `sparkleTwinkle-${blinkId.current} 1.4s ease-in-out infinite` : "none", transformOrigin: "16px 20px" }}
          />
          <path
            d="M82 18 l4 4 M82 22 l-4 4 M86 14 v6" stroke={t.accent1} strokeWidth="2" strokeLinecap="round"
            style={{ animation: animated ? `sparkleTwinkle-${blinkId.current} 1.4s ease-in-out 0.5s infinite` : "none", transformOrigin: "84px 18px" }}
          />
        </g>
      )}

      {mood === "examining" && (
        <path
          d="M53 50 q8 -5 16 1" stroke={t.accent1} strokeWidth="2" fill="none" strokeLinecap="round"
          style={{ animation: animated ? `monocleGlint-${blinkId.current} 2s ease-in-out infinite` : "none" }}
        />
      )}

      {mood === "sleepy" && (
        <g
          style={{
            animation: animated ? `zzzFloat-${blinkId.current} 2.6s ease-in-out infinite` : "none",
            transformOrigin: "82px 26px",
          }}
        >
          <text x="78" y="28" fontSize="14" fontWeight="700" fill={t.textSoft} fontFamily="Inter, sans-serif">Z</text>
          <text x="86" y="20" fontSize="10" fontWeight="700" fill={t.textSoft} fontFamily="Inter, sans-serif">z</text>
        </g>
      )}
    </svg>
  );
}

function getGreeting(name) {
  const h = new Date().getHours();
  const n = name ? ` ${name}` : "";
  if (h < 5) return { text: `Still up${n}? Hope your mind gets some rest soon.`, mood: "sleepy" };
  if (h < 12) return { text: `Good morning${n}. How are you feeling as the day starts?`, mood: "calm" };
  if (h < 17) return { text: `Good afternoon${n}. How's today treating you so far?`, mood: "curious" };
  return { text: `Good evening${n}. Anything on your mind from today?`, mood: "thinking" };
}

// ===================== ANIMATION HELPERS =====================
function useFadeIn(delay = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const tm = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(tm);
  }, [delay]);
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0px)" : "translateY(10px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  };
}

function BreathingDot({ t }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 0" }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: t.textSoft,
            animation: `breathe 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ===================== SYSTEM PROMPTS =====================
function getReflectPrompt(userName) {
  const nameLine = userName
    ? `\n\nThe person's name is "${userName}". You may use their name occasionally (not every message) when it feels natural — e.g. to open a question or acknowledge something they said. Don't overuse it; once every few exchanges is plenty.`
    : "";
  return `You are a calm, reflective conversation partner on a site called psychesensei. Your job is to help someone think more clearly about something in their life by asking good questions — but the questions must be CONCRETE and easy to answer, never abstract or confusing.

Your only tool is the question. You never give advice, conclusions, opinions, or answers — even when asked directly. When someone asks what they should do, ask a question that helps them work it out themselves.

STRICT RULES FOR QUESTIONS:
- Ask about specific things: situations, people, moments, choices, examples — not feelings-about-feelings or abstract concepts like "what does trying feel like from inside"
- Never ask the person to introspect on an abstract noun in isolation. Ground every question in their actual situation, words, or a concrete example.
- Good: "What happened the last time you tried this?" Bad: "What does trying feel like from the inside?"

Each response: 1-2 sentences, ending in one simple, specific question. Brief acknowledgment is fine, no over-explaining.

Tone: calm, warm, like a thoughtful friend — never clinical, never poetic, never a riddle.

HANDLING SHORT/LOW-EFFORT REPLIES: If someone replies "idk", "yes", "no", stay small and easy — don't escalate to a big question. If input is nonsense or a joke, respond lightly without overreacting.

AVOID REPETITION: Vary question structure across the conversation — moments, people, "what if", simple framings, brief reflections.

If the person seems distressed, in crisis, or describes self-harm, do not continue. Gently acknowledge what they shared and suggest they reach out to someone who can support them directly, such as a counselor, doctor, or a crisis line if needed.

Never break character to explain you are an AI model.${nameLine}`;
}

function nameClause(userName) {
  return userName
    ? ` The person's name is "${userName}" — you may use it occasionally (not every message) when it feels natural, not in every single response.`
    : "";
}

function getSummaryPrompt(userName) {
  return `Based on the conversation so far, write a short warm closing reflection — 2-3 sentences. Don't summarize point by point. Name one thread or theme gently, like a small gift. End on an open, encouraging note (not a question). Never give advice. Speak directly to them ("you").${nameClause(userName)}`;
}

function getPerspectivePrompt(userName) {
  return `You are a calm guide on psychesensei helping someone explore a dilemma from a perspective they did NOT pick — specifically, from the point of view of a persona the person described (age, role, general vibe — not a real named individual). Your job is to ask questions that help them genuinely understand and articulate the strongest version of this persona's viewpoint — not to argue or persuade, and not to mock the view they did pick.

Ask 1-2 sentences, ending in one concrete question, exploring the dilemma as that persona might see it. Stay curious and even-handed. Never tell them which side is "right". If they seem to genuinely struggle, offer a concrete example or scenario to consider, framed as a question.

Never break character to explain you are an AI model.${nameClause(userName)}`;
}

const PERSONA_DILEMMA_PROMPT = `You are generating content for a "Perspectives" exercise on psychesensei. The person described a persona (e.g. age, role, general vibe — not a real named individual).

Respond with ONLY a JSON object, no markdown formatting, no backticks, no extra text, in this exact shape:
{
  "title": "A short, everyday dilemma or question (one sentence) that this persona would plausibly have a strong opinion about",
  "personaView": "1-2 sentences expressing this persona's likely view on the dilemma, written in first person as if the persona is speaking, in a reasonable and relatable way (not extreme or a caricature)",
  "otherView": "1-2 sentences expressing a contrasting, equally reasonable view someone else might hold on the same dilemma"
}

Keep the dilemma everyday and relatable (not political hot-button topics). Keep both views fair and human, never strawmanned.`;

function getJournalPrompt(userName) {
  return `You are a gentle reflective presence on psychesensei. The person has just written a private journal entry for themselves (you are not their main audience — they were writing for themselves).

Respond with ONE short, warm sentence that reflects back a single thread from what they wrote — not a summary, not advice, not a question they must answer. Just a small, gentle acknowledgment, like someone nodding after really listening. Maximum 25 words. Never give advice. Never ask more than one optional, soft question, and only if it feels natural.

If the entry suggests distress or self-harm, skip the above and instead gently acknowledge their feelings in plain language and suggest reaching out to a counselor, doctor, or crisis line if needed.${nameClause(userName)}`;
}

async function callClaude(msgs, system, maxTokens = 300) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      max_tokens: maxTokens,
      system,
      messages: msgs.map((m) => ({ role: m.role, content: m.content })),
    }),
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  const data = await response.json();
  const textBlock = data.content?.find((b) => b.type === "text");
  return textBlock?.text || "";
}

// ===================== PAGE GREETINGS =====================
const PAGE_GREETINGS = {
  reflect: ["Let's slow down for a moment.", "Ready when you are.", "No rush — take your time here."],
  "reflect-chat": ["I'm listening.", "Take your time.", "Whenever you're ready."],
  sharpen: ["Let's see what your eye catches.", "Time to spot some flaws.", "Sharper minds notice more."],
  perspectives: ["Two sides, one story.", "Let's borrow someone else's eyes for a bit.", "Curious what the other side sees?"],
  journal: ["This page is just for you.", "Write it down, even messy.", "No one's grading this one."],
  about: ["Here's a bit about this place.", "Glad you're curious.", "A little context, if you'd like it."],
};

function pickGreeting(page) {
  const list = PAGE_GREETINGS[page];
  if (!list) return null;
  return list[Math.floor(Math.random() * list.length)];
}

// ===================== SHARED UI =====================
function PageShell({ t, dark, title, mood, subtitle, children, pageId, customIcon }) {
  const [greeting] = useState(() => pickGreeting(pageId));
  const fade = useFadeIn(0);
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "20px 20px 100px", ...fade }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {customIcon ? customIcon : <Mascot mood={mood} size={56} t={t} />}
          {greeting && (
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: t.text,
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 999,
                padding: "6px 16px",
                animation: "msgIn 0.5s ease",
              }}
            >
              {greeting}
            </div>
          )}
        </div>
        <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 26, margin: "0 0 6px" }}>{title}</h2>
        {subtitle && <p style={{ color: t.textSoft, fontSize: 14, maxWidth: 460, margin: "4px auto 0" }}>{subtitle}</p>}
      </div>
      {children}
    </main>
  );
}

// ===================== REFLECT PAGE =====================
function ReflectPage({ t, dark, userName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("loading"); // loading | intro | chat | closing
  const [closing, setClosing] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);
  const scrollRef = useRef(null);

  const OPENERS = [
    "What's something you believe that you've never actually questioned?",
    "What's a decision you made recently — what were you really choosing between?",
    "Think of someone who annoys you. What does that say about you, not them?",
    "What's something you want, but haven't asked yourself why you want it?",
    "When did you last change your mind about something important? What changed it?",
    "What's a rule you follow that you don't actually agree with?",
  ];
  const [opener, setOpener] = useState(OPENERS[Math.floor(Math.random() * OPENERS.length)]);

  // Load any saved conversation on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get("reflect-conversation");
        if (result?.value) {
          const saved = JSON.parse(result.value);
          if (Array.isArray(saved) && saved.length > 0) {
            setHasSaved(true);
          }
        }
      } catch {
        // no saved conversation
      } finally {
        setStage("intro");
      }
    })();
  }, []);

  // Persist messages whenever they change (only while actively chatting)
  useEffect(() => {
    if (stage !== "chat") return;
    (async () => {
      try {
        await storage.set("reflect-conversation", JSON.stringify(messages));
      } catch {
        // best-effort
      }
    })();
  }, [messages, stage]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const shuffle = () => {
    let next;
    do { next = OPENERS[Math.floor(Math.random() * OPENERS.length)]; } while (next === opener);
    setOpener(next);
  };

  const begin = (prompt) => {
    setStage("chat");
    setMessages(prompt ? [{ role: "assistant", content: prompt }] : []);
  };

  const continueSaved = async () => {
    try {
      const result = await storage.get("reflect-conversation");
      const saved = result?.value ? JSON.parse(result.value) : [];
      setMessages(saved);
      setStage("chat");
    } catch {
      begin(opener);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(newMessages, getReflectPrompt(userName));
      setMessages((p) => [...p, { role: "assistant", content: reply || "Could you say a little more?" }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Something interrupted the thought. Try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const endConvo = async () => {
    setStage("closing");
    setLoading(true);
    try {
      const r = await callClaude([...messages, { role: "user", content: "[ending here]" }], getSummaryPrompt(userName), 150);
      setClosing(r);
    } catch { setClosing(null); } finally { setLoading(false); }

    // Clear saved conversation once it's wrapped up
    try {
      await storage.delete("reflect-conversation");
      setHasSaved(false);
    } catch {
      // best-effort
    }
  };

  const reset = async () => {
    setMessages([]);
    setStage("intro");
    setInput("");
    setClosing(null);
    try {
      await storage.delete("reflect-conversation");
      setHasSaved(false);
    } catch {
      // best-effort
    }
  };

  if (stage === "loading") {
    return (
      <PageShell t={t} dark={dark} title="Reflect" mood="thinking" pageId="reflect" customIcon={<MeditationIcon size={56} t={t} />}>
        <div style={{ display: "flex", justifyContent: "center" }}><BreathingDot t={t} /></div>
      </PageShell>
    );
  }

  if (stage === "intro") {
    return (
      <PageShell t={t} dark={dark} title="Reflect" mood="thinking" subtitle="A conversation that asks, not tells." pageId="reflect" customIcon={<MeditationIcon size={56} t={t} />}>
        {hasSaved && (
          <div style={{ background: t.surface, border: `1px solid ${t.soft1}`, borderRadius: 16, padding: "16px 20px", marginBottom: 16, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: t.text, marginBottom: 10 }}>You have a conversation in progress.</p>
            <button onClick={continueSaved} style={btnPrimary(t)}>Continue where you left off</button>
          </div>
        )}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, marginBottom: 4 }}>"{opener}"</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <button onClick={() => begin(opener)} style={btnPrimary(t)}>Start with this question</button>
          <button onClick={shuffle} style={btnLink(t)}>Show me a different question</button>
          <button onClick={() => begin(null)} style={btnLink(t)}>Or tell me what's on your mind</button>
        </div>
      </PageShell>
    );
  }

  if (stage === "closing") {
    return (
      <PageShell t={t} dark={dark} title="Reflect" mood="calm">
        <div style={{ textAlign: "center" }}>
          {loading ? <div style={{ display: "flex", justifyContent: "center" }}><BreathingDot t={t} /></div> : (
            <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>
              {closing || "Thank you for taking this time to reflect. Take it gently with you."}
            </p>
          )}
          <button onClick={reset} style={btnLink(t)}>Begin again</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell t={t} dark={dark} title="Reflect" mood="curious" pageId="reflect-chat" customIcon={<MeditationIcon size={48} t={t} />}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        {messages.length > 1 && <button onClick={endConvo} style={btnLink(t)}>I'm done for now</button>}
        <button onClick={reset} style={btnLink(t)}>Start over</button>
      </div>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 16, maxHeight: "50vh", overflowY: "auto", marginBottom: 16, padding: "0 4px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", animation: "msgIn 0.4s ease" }}>
            <div style={{
              fontFamily: m.role === "assistant" ? "'Source Serif 4', Georgia, serif" : "'Inter', system-ui, sans-serif",
              fontSize: m.role === "assistant" ? 17 : 14,
              lineHeight: 1.6,
              color: m.role === "assistant" ? t.text : t.onAccent,
              background: m.role === "assistant" ? "transparent" : t.soft2,
              padding: m.role === "assistant" ? 0 : "10px 16px",
              borderRadius: m.role === "assistant" ? 0 : 16,
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && <BreathingDot t={t} />}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your thought..."
          rows={1}
          style={inputStyle(t)}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={btnSend(t, loading || !input.trim())}>Send</button>
      </div>
    </PageShell>
  );
}

// ===================== SHARPEN PAGE =====================
const FALLACIES = [
  {
    name: "Strawman",
    example: "\"You think we should recycle more?\" \"So you want to ban all plastic and destroy jobs?\"",
    explain: "The second person replaced the original (reasonable) claim with an extreme version that's easier to attack.",
  },
  {
    name: "Slippery Slope",
    example: "\"If we let students retake one test, soon they'll expect to retake every test, and grades will mean nothing.\"",
    explain: "It assumes one small step inevitably leads to an extreme outcome, without showing why each step would actually follow.",
  },
  {
    name: "Appeal to Authority",
    example: "\"This diet must work — a famous actor swears by it.\"",
    explain: "Fame or status in one area doesn't make someone's claim true in an unrelated area (like nutrition science).",
  },
  {
    name: "False Cause",
    example: "\"Ever since the new manager started, sales went up — she's clearly a sales genius.\"",
    explain: "Two things happening around the same time doesn't mean one caused the other — there could be other reasons sales rose.",
  },
  {
    name: "Either/Or (False Dilemma)",
    example: "\"You're either with us completely, or you're against us.\"",
    explain: "This presents only two options when there are likely many positions in between.",
  },
];

function SharpenPage({ t, dark }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const f = FALLACIES[idx];

  const next = () => {
    setRevealed(false);
    setIdx((i) => (i + 1) % FALLACIES.length);
  };

  return (
    <PageShell t={t} dark={dark} title="Sharpen" mood="examining" subtitle="Spot the flaw before you see the name." pageId="sharpen" customIcon={<ThinkingIcon size={56} t={t} />}>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "22px 22px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 10 }}>
          Example {idx + 1} of {FALLACIES.length}
        </div>
        <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, lineHeight: 1.6, marginBottom: 16 }}>
          {f.example}
        </p>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} style={btnPrimary(t)}>What's the flaw?</button>
        ) : (
          <div style={{ animation: "msgIn 0.4s ease", textAlign: "left" }}>
            <div style={{ fontWeight: 700, color: t.soft1, marginBottom: 6 }}>{f.name}</div>
            <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.6, marginBottom: 16 }}>{f.explain}</p>
            <button onClick={next} style={btnPrimary(t)}>Next example</button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 13, color: t.textSoft, textAlign: "center" }}>
        Noticing these in arguments — including your own — is a quiet kind of strength.
      </p>
    </PageShell>
  );
}

// ===================== PERSPECTIVES PAGE =====================
function PerspectivesPage({ t, dark, userName }) {
  const [stage, setStage] = useState("persona"); // persona | loading | choose | chat
  const [persona, setPersona] = useState("");
  const [dilemma, setDilemma] = useState(null); // { title, personaView, otherView }
  const [chosen, setChosen] = useState(null); // "persona" | "other"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const generateDilemma = async () => {
    const text = persona.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setStage("loading");
    try {
      const raw = await callClaude(
        [{ role: "user", content: `Persona: ${text}` }],
        PERSONA_DILEMMA_PROMPT,
        300
      );
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setDilemma(parsed);
      setStage("choose");
    } catch {
      setError("Couldn't quite get that one — want to try describing the persona differently?");
      setStage("persona");
    } finally {
      setLoading(false);
    }
  };

  const pickSide = (side) => {
    setChosen(side);
    const otherView = side === "persona" ? dilemma.otherView : dilemma.personaView;
    setMessages([{
      role: "assistant",
      content: `Okay — let's sit with the other view for a bit: "${otherView}" What's one situation where that might actually be true?`,
    }]);
    setStage("chat");
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callClaude(
        [{ role: "user", content: `Persona described: ${persona}` }, ...newMessages],
        getPerspectivePrompt(userName)
      );
      setMessages((p) => [...p, { role: "assistant", content: reply || "What else comes to mind?" }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Something interrupted — try again?" }]);
    } finally { setLoading(false); }
  };

  const startOver = () => {
    setStage("persona");
    setPersona("");
    setDilemma(null);
    setChosen(null);
    setMessages([]);
    setError(null);
  };

  // --- Persona input stage ---
  if (stage === "persona" || stage === "loading") {
    return (
      <PageShell t={t} dark={dark} title="Perspectives" mood="playful" subtitle="See both sides before you pick one." pageId="perspectives" customIcon={<MorphShapeIcon size={56} t={t} />}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.7, marginBottom: 14, textAlign: "center" }}>
            Whose perspective do you want to explore today? Describe them a little —
            age, role, general vibe (e.g. "a tired night-shift nurse in her 30s" or
            "a college student who games a lot").
          </p>
          <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6, marginBottom: 14, textAlign: "center" }}>
            Please don't use a real person's name — just describe the kind of person.
          </p>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="e.g. a middle-aged dad who works long hours..."
            rows={3}
            style={{ ...inputStyle(t), width: "100%", boxSizing: "border-box", marginBottom: 14 }}
          />
          {error && <p style={{ fontSize: 13, color: t.accent2, textAlign: "center", marginBottom: 12 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={generateDilemma} disabled={loading || !persona.trim()} style={btnPrimary(t)}>
              {loading ? "Thinking..." : "Find a perspective"}
            </button>
          </div>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <BreathingDot t={t} />
            </div>
          )}
        </div>
      </PageShell>
    );
  }

  // --- Choose side stage ---
  if (stage === "choose" && dilemma) {
    return (
      <PageShell t={t} dark={dark} title="Perspectives" mood="playful" pageId="perspectives" customIcon={<MorphShapeIcon size={56} t={t} />}>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 18, marginBottom: 16, textAlign: "center" }}>
            {dilemma.title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ fontSize: 13, color: t.textSoft, textAlign: "center", marginBottom: 4 }}>Which view feels closer to yours?</p>
            <button onClick={() => pickSide("persona")} style={{ ...btnOutline(t), textAlign: "left", lineHeight: 1.5 }}>
              {dilemma.personaView}
            </button>
            <button onClick={() => pickSide("other")} style={{ ...btnOutline(t), textAlign: "left", lineHeight: 1.5 }}>
              {dilemma.otherView}
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={startOver} style={btnLink(t)}>Describe a different persona</button>
        </div>
      </PageShell>
    );
  }

  // --- Chat stage ---
  return (
    <PageShell t={t} dark={dark} title="Perspectives" mood="playful" pageId="perspectives" customIcon={<MorphShapeIcon size={56} t={t} />}>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, marginBottom: 14, textAlign: "center", color: t.textSoft }}>
          {dilemma?.title}
        </div>
        <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "40vh", overflowY: "auto", marginBottom: 14 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", animation: "msgIn 0.4s ease" }}>
              <div style={{
                fontFamily: m.role === "assistant" ? "'Source Serif 4', Georgia, serif" : "'Inter', system-ui, sans-serif",
                fontSize: m.role === "assistant" ? 16 : 14,
                lineHeight: 1.6,
                color: m.role === "assistant" ? t.text : t.onAccent,
                background: m.role === "assistant" ? "transparent" : t.soft1,
                padding: m.role === "assistant" ? 0 : "10px 16px",
                borderRadius: m.role === "assistant" ? 0 : 16,
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {loading && <BreathingDot t={t} />}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Share your thought..."
            rows={1}
            style={inputStyle(t)}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={btnSend(t, loading || !input.trim())}>Send</button>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={startOver} style={btnLink(t)}>Describe a different persona</button>
      </div>
    </PageShell>
  );
}

// ===================== JOURNAL PAGE =====================
function JournalPage({ t, dark, userName }) {
  const [entry, setEntry] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pastEntries, setPastEntries] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await storage.get("journal-entries");
        if (result?.value) {
          const parsed = JSON.parse(result.value);
          setPastEntries(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        // no entries yet
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, []);

  const submit = async () => {
    const text = entry.trim();
    if (!text || loading) return;
    setLoading(true);
    setResponse(null);
    let reply = "";
    try {
      reply = await callClaude([{ role: "user", content: text }], getJournalPrompt(userName), 80);
      setResponse(reply);
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    // Save to persistent storage (private to this user)
    try {
      const newEntry = { text, reflection: reply || null, date: new Date().toISOString() };
      const updated = [newEntry, ...pastEntries].slice(0, 50); // keep last 50
      setPastEntries(updated);
      await storage.set("journal-entries", JSON.stringify(updated));
    } catch {
      // saving is best-effort; don't block the experience if it fails
    }

    setEntry("");
  };

  return (
    <PageShell t={t} dark={dark} title="Journal" mood="calm" subtitle="A private page, just for your thoughts." pageId="journal" customIcon={<ScrollWriteIcon size={56} t={t} />}>
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="Write whatever's on your mind. No one else reads this."
        rows={8}
        style={{ ...inputStyle(t), width: "100%", boxSizing: "border-box", borderRadius: 16, fontSize: 15, lineHeight: 1.7, padding: 18, marginBottom: 14, fontFamily: "'Source Serif 4', Georgia, serif" }}
      />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <button onClick={submit} disabled={loading || !entry.trim()} style={btnPrimary(t)}>
          {loading ? "..." : "Reflect on this"}
        </button>
      </div>
      {response && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 20px", textAlign: "center", animation: "msgIn 0.5s ease", marginBottom: 18 }}>
          <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, fontStyle: "italic", margin: 0 }}>{response}</p>
        </div>
      )}
      {saved && !response && (
        <p style={{ textAlign: "center", color: t.textSoft, fontSize: 13, marginBottom: 18 }}>Saved in your thoughts. ✓</p>
      )}

      {!loadingHistory && pastEntries.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <button onClick={() => setShowHistory((s) => !s)} style={btnLink(t)}>
            {showHistory ? "Hide" : "Show"} past entries ({pastEntries.length})
          </button>
          {showHistory && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12, maxHeight: "40vh", overflowY: "auto" }}>
              {pastEntries.map((e, i) => (
                <div key={i} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 16px", textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: t.textSoft, marginBottom: 4 }}>
                    {new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6, color: t.text, whiteSpace: "pre-wrap" }}>{e.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14, textAlign: "center" }}>
        <p style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.6, margin: 0 }}>
          🔒 Your entries are stored privately and are only visible to you on this account.
          They're never shared, shown to other users, or used to identify you.
        </p>
      </div>
    </PageShell>
  );
}

// ===================== ABOUT PAGE =====================
function AboutPage({ t, dark }) {
  return (
    <PageShell t={t} dark={dark} title="About" mood="sleepy" pageId="about">
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "24px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, lineHeight: 1.8, marginBottom: 16 }}>
          psychesensei started as a YouTube channel making people pause and think
          about things they usually scroll past — about themselves, the people
          around them, and the world.
        </p>
        <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 20 }}>
          This site is an extension of that — a quiet space to think things
          through at your own pace. No accounts required to use it, no answers
          handed to you. Just questions, worth sitting with.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, marginBottom: 16 }}>
          <Mascot mood="calm" size={40} t={t} />
          <Mascot mood="curious" size={40} t={t} />
          <Mascot mood="thinking" size={40} t={t} />
          <Mascot mood="celebrating" size={40} t={t} />
          <Mascot mood="examining" size={40} t={t} />
          <Mascot mood="playful" size={40} t={t} />
          <Mascot mood="sleepy" size={40} t={t} />
          <Mascot mood="happy" size={40} t={t} />
          <Mascot mood="sad" size={40} t={t} />
          <Mascot mood="angry" size={40} t={t} />
        </div>

        <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 10 }}>
          Around the site
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 18, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <MeditationIcon size={40} t={t} />
            <span style={{ fontSize: 11, color: t.textSoft }}>Reflect</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <ThinkingIcon size={40} t={t} />
            <span style={{ fontSize: 11, color: t.textSoft }}>Sharpen</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <MorphShapeIcon size={40} t={t} />
            <span style={{ fontSize: 11, color: t.textSoft }}>Perspectives</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <ScrollWriteIcon size={40} t={t} />
            <span style={{ fontSize: 11, color: t.textSoft }}>Journal</span>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 10, textAlign: "center" }}>
            Find psychesensei
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            <a
              href="https://www.youtube.com/@ThePsycheSenseiOfficial"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...btnOutline(t), textDecoration: "none", display: "inline-block" }}
            >
              ▶️ YouTube
            </a>
            <a
              href="mailto:psychesensei@example.com"
              style={{ ...btnOutline(t), textDecoration: "none", display: "inline-block" }}
            >
              ✉️ Feedback
            </a>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 18, textAlign: "left", marginBottom: 20 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 8, textAlign: "center" }}>
            Please read
          </div>
          <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7, margin: 0 }}>
            ⚠️ This site uses AI to generate responses. It's a tool for reflection
            and perspective — not therapy, medical advice, or a substitute for
            professional support.<br /><br />
            If you're going through something difficult, please reach out to a
            counselor, doctor, or a local crisis line. They can help in ways this
            site can't.
          </p>
        </div>

        <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 18, textAlign: "left" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 8, textAlign: "center" }}>
            Your data
          </div>
          <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7, margin: 0 }}>
            🔒 Journal entries and visit history are stored privately and tied only to your account — never shared publicly or with other users.<br /><br />
            💬 Reflect conversations are saved privately so you can continue later, and are cleared automatically once you finish a session.<br /><br />
            🧠 Nothing here is used for advertising, and conversations aren't reviewed by anyone unless you report a problem.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

// ===================== SHARED STYLES =====================
const btnPrimary = (t) => ({
  fontSize: 15, fontWeight: 600, padding: "12px 28px", borderRadius: 999,
  border: "none", background: t.soft2, color: "#FFFFFF", cursor: "pointer",
  transition: "transform 0.2s ease",
});
const btnOutline = (t) => ({
  fontSize: 14, padding: "12px 18px", borderRadius: 14,
  border: `1px solid ${t.border}`, background: "transparent", color: t.text, cursor: "pointer",
  transition: "border-color 0.2s ease",
});
const btnLink = (t) => ({
  fontSize: 13, color: t.textSoft, background: "none", border: "none",
  cursor: "pointer", textDecoration: "underline", padding: 4,
});
const btnSend = (t, disabled) => ({
  fontSize: 14, fontWeight: 500, padding: "12px 20px", borderRadius: 16,
  border: "none", background: disabled ? t.border : t.soft2,
  color: disabled ? t.textSoft : "#FFFFFF", cursor: disabled ? "default" : "pointer",
  height: 44, transition: "background 0.2s ease",
});
const inputStyle = (t) => ({
  flex: 1, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15,
  padding: "12px 16px", borderRadius: 16, border: `1px solid ${t.border}`,
  background: t.surface, color: t.text, resize: "none", outline: "none",
  minHeight: 44, maxHeight: 140,
});

// ===================== APP =====================
const NAV_ITEMS = [
  { id: "home", label: "Home", mascot: "calm" },
  { id: "reflect", label: "Reflect", mascot: "thinking" },
  { id: "sharpen", label: "Sharpen", mascot: "curious" },
  { id: "perspectives", label: "Perspectives", mascot: "calm" },
  { id: "journal", label: "Journal", mascot: "celebrating" },
  { id: "about", label: "About", mascot: "calm" },
];

export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("home");
  const t = dark ? THEMES.dark : THEMES.light;
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const dailyThought = DAILY_THOUGHTS[dayIndex(DAILY_THOUGHTS.length)];
  const [visitInfo, setVisitInfo] = useState(null);
  const [userName, setUserName] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [nameLoading, setNameLoading] = useState(true);
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const greeting = getGreeting(userName);

  useEffect(() => {
    (async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const result = await storage.get("visit-info");
        let info = result?.value ? JSON.parse(result.value) : { count: 0, lastDate: null };

        if (info.lastDate !== today) {
          info = { count: (info.count || 0) + 1, lastDate: today };
          await storage.set("visit-info", JSON.stringify(info));
        }
        setVisitInfo(info);
      } catch {
        setVisitInfo(null);
      }
    })();

    (async () => {
      try {
        const result = await storage.get("user-name");
        if (result?.value) {
          setUserName(result.value);
        } else {
          setShowNamePrompt(true);
        }
      } catch {
        setShowNamePrompt(true);
      } finally {
        setNameLoading(false);
      }
    })();
  }, []);

  const saveName = async () => {
    const name = nameInput.trim();
    if (!name) {
      setShowNamePrompt(false);
      return;
    }
    try {
      await storage.set("user-name", name);
      setUserName(name);
    } catch {
      setUserName(name);
    }
    setShowNamePrompt(false);
  };

  const skipName = () => {
    setShowNamePrompt(false);
  };

  const heroFade = useFadeIn(0);
  const subFade = useFadeIn(120);
  const greetFade = useFadeIn(220);
  const quoteFade = useFadeIn(340);
  const cardsFade = useFadeIn(460);
  const ctaFade = useFadeIn(580);

  return (
    <div style={{ minHeight: "100vh", background: t.bgGradient, color: t.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "background 0.4s ease, color 0.4s ease" }}>
      <style>{`
        @keyframes msgIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1.15); } }
        * { -webkit-tap-highlight-color: transparent; }
        textarea:focus, button:focus-visible { outline: 2px solid ${t.soft1}; outline-offset: 2px; }
      `}</style>

      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", maxWidth: 920, margin: "0 auto" }}>
        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <Mascot mood="calm" size={36} t={t} />
          <span style={{ fontSize: 16, fontWeight: 700, color: t.text }}>
            psyche<span style={{ color: t.accent2 }}>sensei</span>
          </span>
        </button>
        <button
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle dark mode"
          style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${t.border}`, background: t.surface, color: t.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, transition: "transform 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </header>

      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "0 20px 28px", maxWidth: 920, margin: "0 auto" }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              fontSize: 13, fontWeight: 500, padding: "8px 16px", borderRadius: 999,
              border: `1px solid ${page === item.id ? t.soft1 : t.border}`,
              background: page === item.id ? t.soft1 : "transparent",
              color: page === item.id ? "#FFFFFF" : t.textSoft,
              cursor: "pointer", transition: "all 0.25s ease",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {page === "home" && (
        <main style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px", textAlign: "center" }}>
          <div style={{ ...heroFade, marginBottom: 18, display: "flex", justifyContent: "center" }}>
            <RandomMoodMascot size={96} t={t} />
          </div>

          {!nameLoading && showNamePrompt && (
            <div
              style={{
                ...heroFade,
                background: t.surface,
                border: `1px solid ${t.soft1}`,
                borderRadius: 16,
                padding: "18px 20px",
                marginBottom: 20,
                maxWidth: 380,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <p style={{ fontSize: 14, color: t.text, marginBottom: 12 }}>
                What should I call you? (totally optional)
              </p>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
                  placeholder="First name or nickname"
                  style={{ ...inputStyle(t), flex: 1, minHeight: 40, padding: "8px 14px" }}
                />
                <button onClick={saveName} style={{ ...btnPrimary(t), padding: "8px 20px" }}>Save</button>
              </div>
              <button onClick={skipName} style={btnLink(t)}>Skip for now</button>
            </div>
          )}

          <h1 style={{ ...heroFade, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "clamp(28px, 6vw, 44px)", lineHeight: 1.3, fontWeight: 600, margin: "0 0 14px" }}>
            Hey, I'm <span style={{ color: t.accent2 }}>psyche</span><span style={{ color: t.accent1 }}>sensei</span>.
          </h1>

          <div style={{ ...greetFade, fontSize: 14, color: t.soft1, fontWeight: 600, marginBottom: 4 }}>
            {greeting.text}
          </div>

          {visitInfo && visitInfo.count > 1 && (
            <div style={{ ...greetFade, fontSize: 12, color: t.textSoft, marginBottom: 4 }}>
              {visitInfo.count === 2
                ? "Welcome back — second visit already."
                : `Welcome back — this is day ${visitInfo.count} here.`}
            </div>
          )}

          <p style={{ ...subFade, fontSize: 16, color: t.textSoft, lineHeight: 1.7, maxWidth: 480, margin: "10px auto 24px" }}>
            I don't give answers — I ask questions. This is a space to think
            things through, sharpen how your mind works, and notice what you
            actually believe.
          </p>

          <div style={{ ...quoteFade, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 22px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: t.textSoft, marginBottom: 6 }}>Today's thought</div>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 17, lineHeight: 1.6 }}>{dailyThought}</div>
          </div>

          <div style={{ ...quoteFade, background: "transparent", border: `1px solid ${t.border}`, borderRadius: 16, padding: "16px 22px", marginBottom: 28 }}>
            <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 15, fontStyle: "italic", color: t.text, marginBottom: 6 }}>"{quote.text}"</div>
            <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: t.textSoft }}>— {quote.author}</div>
          </div>

          <div style={{ ...cardsFade, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 36 }}>
            {[
              { id: "reflect", title: "Reflect", desc: "A calm conversation that asks, not tells.", icon: <MeditationIcon size={32} t={t} /> },
              { id: "sharpen", title: "Sharpen", desc: "Spot the flaw. Train your thinking.", icon: <ThinkingIcon size={32} t={t} /> },
              { id: "perspectives", title: "Perspectives", desc: "See both sides before you pick one.", icon: <MorphShapeIcon size={32} t={t} /> },
              { id: "journal", title: "Journal", desc: "A private page, just for your thoughts.", icon: <ScrollWriteIcon size={32} t={t} /> },
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => setPage(card.id)}
                style={{ textAlign: "left", background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: "18px 18px", cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = t.soft1; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = t.border; }}
              >
                <div style={{ marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.5 }}>{card.desc}</div>
              </button>
            ))}
          </div>

          <button onClick={() => setPage("reflect")} style={{ ...ctaFade, ...btnPrimary(t), padding: "14px 36px" }}>
            Start reflecting
          </button>
        </main>
      )}

      {page === "reflect" && <ReflectPage t={t} dark={dark} userName={userName} />}
      {page === "sharpen" && <SharpenPage t={t} dark={dark} />}
      {page === "perspectives" && <PerspectivesPage t={t} dark={dark} userName={userName} />}
      {page === "journal" && <JournalPage t={t} dark={dark} userName={userName} />}
      {page === "about" && <AboutPage t={t} dark={dark} />}
    </div>
  );
}
