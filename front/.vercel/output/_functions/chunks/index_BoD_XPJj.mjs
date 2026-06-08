import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_DqHlnE6_.mjs';
import { $ as $$Layout } from './Layout_stwwPH4h.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { Q as QuizLobby } from './QuizLobby_Biae0oZD.mjs';

function RoomJoin({ onJoinRoom }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);
  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);
  const handleChange = (index, val) => {
    if (val !== "" && !/^[0-9]$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    setError("");
    if (val !== "" && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        inputsRef.current[index - 1].focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) {
      setError("Kode harus berupa 6 digit angka!");
      return;
    }
    const digits = pastedData.split("");
    setCode(digits);
    setError("");
    inputsRef.current[5].focus();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const finalCode = code.join("");
    if (finalCode.length < 6) {
      setError("Masukkan 6 digit kode room secara lengkap!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onJoinRoom(finalCode);
    }, 800);
  };
  return /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#EBF4F6] p-5 sm:p-8 rounded-none relative overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute -top-3 -right-12 bg-neo-pink text-white font-bold py-1 px-12 rotate-12 neo-border text-xs uppercase tracking-wider shadow-sm", children: "Siswa" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "🎮" }),
        /* @__PURE__ */ jsx("span", { children: "Masuk Kuis (Siswa)" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm mt-2 font-medium", children: "Punya kode room dari Guru/Mentor? Masukkan 6 digit kodenya di bawah untuk bergabung ke arena belajar seru!" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-widest text-black", children: "Kode Room 6-Digit" }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-between gap-1.5 sm:gap-3", onPaste: handlePaste, children: code.map((digit, idx) => /* @__PURE__ */ jsx(
          "input",
          {
            ref: (el) => inputsRef.current[idx] = el,
            type: "text",
            maxLength: 1,
            inputMode: "numeric",
            pattern: "[0-9]*",
            value: digit,
            onChange: (e) => handleChange(idx, e.target.value),
            onKeyDown: (e) => handleKeyDown(idx, e),
            className: "w-9 h-12 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-none neo-input bg-white focus:bg-neo-yellow transition-all",
            placeholder: "-",
            disabled: loading
          },
          idx
        )) })
      ] }),
      error && /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-pink/20 text-red-700 p-3 text-xs font-bold neo-border border-red-700 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "⚠️" }),
        /* @__PURE__ */ jsx("span", { children: error })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full py-3 sm:py-4 neo-btn bg-neo-blue text-white hover:bg-neo-blue/95 transition-all text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2",
          children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
              /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: "Memvalidasi..." })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { children: "MASUK ROOM SEKARANG" }),
            /* @__PURE__ */ jsx("span", { children: "⚡" })
          ] })
        }
      )
    ] })
  ] });
}

const QUESTIONS = [
  {
    id: 1,
    question: 'Sila ketiga Pancasila, "Persatuan Indonesia", dilambangkan oleh simbol apa?',
    options: [
      { key: "A", text: "Bintang Emas" },
      { key: "B", text: "Pohon Beringin", isCorrect: true },
      { key: "C", text: "Kepala Banteng" },
      { key: "D", text: "Padi dan Kapas" }
    ],
    explanation: 'Sila ke-3 "Persatuan Indonesia" dilambangkan dengan Pohon Beringin yang mencerminkan tempat berteduh dan persatuan seluruh rakyat Indonesia.'
  },
  {
    id: 2,
    question: "Sikap menghormati kebebasan beribadah bagi pemeluk agama lain merupakan perwujudan pengamalan Pancasila, khususnya sila ke-...",
    options: [
      { key: "A", text: "Sila ke-1 (Ketuhanan Yang Maha Esa)", isCorrect: true },
      { key: "B", text: "Sila ke-2 (Kemanusiaan yang adil dan beradab)" },
      { key: "C", text: "Sila ke-3 (Persatuan Indonesia)" },
      { key: "D", text: "Sila ke-5 (Keadilan sosial bagi seluruh rakyat)" }
    ],
    explanation: "Sila ke-1 menekankan nilai toleransi, kebebasan beragama, dan saling menghormati antarumat beragama."
  },
  {
    id: 3,
    question: "Menolong teman yang terjatuh atau membantu korban bencana alam tanpa membeda-bedakan latar belakang merupakan pengamalan sila ke-...",
    options: [
      { key: "A", text: "Sila ke-1 (Ketuhanan Yang Maha Esa)" },
      { key: "B", text: "Sila ke-2 (Kemanusiaan yang adil dan beradab)", isCorrect: true },
      { key: "C", text: "Sila ke-4 (Kerakyatan yang dipimpin oleh hikmat...)" },
      { key: "D", text: "Sila ke-5 (Keadilan sosial bagi seluruh rakyat)" }
    ],
    explanation: "Membantu sesama manusia secara adil dan beradab tanpa membedakan suku/ras merupakan wujud nyata nilai kemanusiaan (Sila ke-2)."
  },
  {
    id: 4,
    question: "Bunyi sila keempat Pancasila berkaitan erat dengan nilai musyawarah dan demokrasi. Apa lambang dari sila keempat?",
    options: [
      { key: "A", text: "Rantai Emas" },
      { key: "B", text: "Padi dan Kapas" },
      { key: "C", text: "Kepala Banteng", isCorrect: true },
      { key: "D", text: "Pohon Beringin" }
    ],
    explanation: "Sila ke-4 dilambangkan dengan Kepala Banteng yang melambangkan hewan sosial yang suka berkumpul, sama seperti manusia saat bermusyawarah."
  },
  {
    id: 5,
    question: "Menjaga keseimbangan antara hak dan kewajiban serta menghormati hak-hak orang lain merupakan wujud pengamalan sila ke-...",
    options: [
      { key: "A", text: "Sila ke-2 (Kemanusiaan yang adil dan beradab)" },
      { key: "B", text: "Sila ke-3 (Persatuan Indonesia)" },
      { key: "C", text: "Sila ke-4 (Kerakyatan yang dipimpin oleh hikmat...)" },
      { key: "D", text: "Sila ke-5 (Keadilan sosial bagi seluruh rakyat)", isCorrect: true }
    ],
    explanation: "Sila ke-5 berfokus pada keadilan sosial, keseimbangan hak-kewajiban, dan sikap adil terhadap sesama."
  }
];
function QuizGame({ studentName, roomCode, onFinish }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState("playing");
  const timerRef = useRef(null);
  const currentQuestion = QUESTIONS[currentIdx];
  useEffect(() => {
    if (gameState !== "playing") return;
    setTimeLeft(15);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, gameState]);
  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedKey("TIMEOUT");
    setTimeout(() => {
      moveToNext();
    }, 2500);
  };
  const handleSelectOption = (option) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedKey(option.key);
    setIsAnswered(true);
    let isCorrect = option.isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 100 + timeLeft * 5);
      setCorrectCount((prev) => prev + 1);
    }
    setTimeout(() => {
      moveToNext();
    }, 2500);
  };
  const moveToNext = () => {
    setSelectedKey(null);
    setIsAnswered(false);
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setGameState("finished");
    }
  };
  const getRankBadge = () => {
    if (correctCount === 5) return { name: "Garuda Emas 🥇", desc: "Sempurna! Kamu memahami seluruh pengamalan Pancasila dengan sangat baik.", color: "bg-neo-yellow text-black" };
    if (correctCount === 4) return { name: "Banteng Merdeka 🐂", desc: "Luar Biasa! Pemahaman Pancasila kamu sangat kuat dan kokoh.", color: "bg-neo-pink text-white" };
    if (correctCount === 3) return { name: "Pohon Beringin 🌳", desc: "Bagus Sekali! Kamu mengerti dasar-dasar pemahaman Pancasila.", color: "bg-neo-green text-black" };
    if (correctCount >= 1) return { name: "Rantai Persatuan ⛓️", desc: "Cukup Baik. Yuk baca-baca lagi materi Pancasila agar semakin paham.", color: "bg-neo-blue text-white" };
    return { name: "Bintang Harapan ⭐", desc: "Jangan menyerah! Ayo belajar lagi materi Pancasila dan coba lagi.", color: "bg-gray-400 text-black" };
  };
  const getScoreboard = () => {
    const leaderboard = [
      { name: studentName || "Siswa", score, isPlayer: true },
      { name: "Ahmad Syarif", score: 480 },
      { name: "Siti Rahma", score: 520 },
      { name: "Gita Larasati", score: 380 },
      { name: "Adit Pramono", score: 290 }
    ];
    return leaderboard.sort((a, b) => b.score - a.score);
  };
  if (gameState === "finished") {
    const badge = getRankBadge();
    const scoreboard = getScoreboard();
    const rankIndex = scoreboard.findIndex((s) => s.isPlayer) + 1;
    return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-8 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#E6FFFA] p-6 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-neo-green text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Kuis Selesai" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tight text-black mt-2", children: "Hasil Akhir Kuis 🎉" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-sm font-semibold mt-1", children: [
          "Kerja bagus! Kuis Room ",
          /* @__PURE__ */ jsx("strong", { className: "text-black", children: roomCode }),
          " telah selesai dimainkan."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 text-center space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase font-extrabold tracking-wider text-gray-500", children: "Skor Kamu" }),
            /* @__PURE__ */ jsxs("div", { className: "text-5xl font-black text-neo-blue", children: [
              score,
              " Poin"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-extrabold text-black", children: [
              "Menjawab Benar: ",
              /* @__PURE__ */ jsx("span", { className: "text-neo-green", children: correctCount }),
              " dari 5 Soal"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `neo-box ${badge.color} p-4 text-center mt-4`, children: [
              /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-black tracking-widest opacity-80", children: "GELAR / PANGKAT" }),
              /* @__PURE__ */ jsx("h4", { className: "text-xl font-black uppercase mt-1", children: badge.name }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium mt-2 leading-relaxed", children: badge.desc })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onFinish,
              className: "w-full py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsx("span", { children: "KEMBALI KE BERANDA" }),
                /* @__PURE__ */ jsx("span", { children: "⚡" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 space-y-4", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-lg font-black uppercase border-b-2 border-black pb-2 text-black flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "🏆 Papan Peringkat" }),
            /* @__PURE__ */ jsxs("span", { className: "bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-wide", children: [
              "Peringkat #",
              rankIndex
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: scoreboard.map((player, idx) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `neo-box p-3 flex items-center justify-between text-sm ${player.isPlayer ? "bg-neo-yellow/30 border-neo-yellow" : "bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("span", { className: "w-6 h-6 rounded-none bg-black text-white flex items-center justify-center text-xs font-black", children: idx + 1 }),
                  /* @__PURE__ */ jsxs("span", { className: "font-extrabold uppercase truncate max-w-[140px] sm:max-w-none", children: [
                    player.name,
                    " ",
                    player.isPlayer && " (Kamu)"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "font-black text-black", children: [
                  player.score,
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium text-gray-500", children: "pts" })
                ] })
              ]
            },
            player.name
          )) })
        ] })
      ] })
    ] });
  }
  const getOptionStyle = (option) => {
    if (!isAnswered) {
      return "bg-white hover:bg-[#FAF6EE] cursor-pointer";
    }
    if (option.isCorrect) {
      return "bg-neo-green text-black border-black shadow-sm";
    }
    if (selectedKey === option.key) {
      return "bg-neo-pink text-white border-black shadow-sm";
    }
    return "bg-gray-100 text-gray-400 opacity-60 pointer-events-none";
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6 animate-fadeIn", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "bg-neo-yellow px-2 py-0.5 neo-border text-[10px] font-black", children: [
        "SOAL ",
        currentIdx + 1,
        "/5"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "WAKTU:" }),
        /* @__PURE__ */ jsx("span", { className: `w-8 h-8 flex items-center justify-center neo-border text-xs font-black ${timeLeft <= 5 ? "bg-neo-pink text-white animate-bounce" : "bg-white text-black"}`, children: timeLeft })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { children: "SKOR:" }),
        /* @__PURE__ */ jsx("span", { className: "text-neo-blue", children: score })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "neo-box bg-[#FAF6EE] p-6 sm:p-8 rounded-none relative", children: /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-black uppercase text-black leading-relaxed", children: currentQuestion.question }) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: currentQuestion.options.map((option) => {
      const optionStyle = getOptionStyle(option);
      return /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => handleSelectOption(option),
          disabled: isAnswered,
          className: `w-full p-4 text-left font-bold neo-border text-sm sm:text-base flex items-center gap-4 transition-all duration-100 ${optionStyle}`,
          children: [
            /* @__PURE__ */ jsx("span", { className: "w-7 h-7 shrink-0 rounded-none border-[2px] border-black bg-black text-white flex items-center justify-center text-xs font-extrabold", children: option.key }),
            /* @__PURE__ */ jsx("span", { className: "uppercase tracking-tight leading-tight", children: option.text })
          ]
        },
        option.key
      );
    }) }),
    isAnswered && /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#EBF4F6] p-4 animate-fadeIn", children: [
      /* @__PURE__ */ jsx("h4", { className: "text-xs uppercase font-extrabold text-neo-blue mb-1", children: "💡 Penjelasan Jawaban" }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-700 font-semibold leading-relaxed", children: [
        selectedKey === "TIMEOUT" ? /* @__PURE__ */ jsx("span", { className: "text-red-600 font-bold block mb-1", children: "⏳ Waktu habis!" }) : null,
        currentQuestion.explanation
      ] })
    ] })
  ] });
}

function StudentApp() {
  const [currentView, setCurrentView] = useState("landing");
  const [studentName, setStudentName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [activeQuiz, setActiveQuiz] = useState(null);
  useEffect(() => {
    if (currentView === "lobby" && studentName) {
      const timer = setTimeout(() => {
        setCurrentView("game");
      }, 7e3);
      return () => clearTimeout(timer);
    }
  }, [currentView, studentName]);
  const handleJoinRoom = (code) => {
    import('./client_BUDSSnj2.mjs').then(({ navigate }) => {
      navigate(`/games?code=${code}`);
    }).catch(() => {
      window.location.href = `/games?code=${code}`;
    });
  };
  const handleCancelLobby = () => {
    setStudentName("");
    setRoomCode("");
    setCurrentView("landing");
  };
  const handleFinishQuiz = () => {
    setStudentName("");
    setRoomCode("");
    setCurrentView("landing");
  };
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl sm:text-4xl bg-neo-yellow p-1.5 neo-border shadow-sm", children: "🇮🇩" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1", children: [
            "PANCASILA ",
            /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow px-1 neo-border shadow-sm border-black", children: "FUN QUIZ" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5", children: "Portal Siswa - Arena Belajar Interaktif" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "/auth",
          className: "neo-btn bg-neo-yellow text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-neo-yellow/90",
          children: [
            /* @__PURE__ */ jsx("span", { children: "MASUK SEBAGAI GURU" }),
            /* @__PURE__ */ jsx("span", { children: "🔑" })
          ]
        }
      )
    ] }),
    currentView === "landing" && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-[#FAF6EE] neo-box p-5 border-dashed border-gray-400", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest bg-neo-blue text-white px-2 py-0.5 neo-border shadow-sm", children: "Bermain Kuis" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-700 mt-2", children: "Tidak butuh pembuatan akun bagi siswa! Cukup masukkan 6 digit kode room kuis yang dibagikan oleh guru di papan tulis untuk mulai bermain." })
      ] }),
      /* @__PURE__ */ jsx(RoomJoin, { onJoinRoom: handleJoinRoom }),
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-green/10 p-6 space-y-3 relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-24 h-24 bg-neo-green/20 rounded-full translate-x-8 -translate-y-8 pointer-events-none" }),
        /* @__PURE__ */ jsx("h3", { className: "text-md font-black uppercase text-green-800", children: "🇮🇩 Cintai Tanah Air & Pancasila" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-green-950 font-bold leading-relaxed", children: "Asah pemahamanmu tentang simbol, nilai-nilai, dan sejarah Pancasila dengan antarmuka Neobrutalism yang asyik dan menantang!" })
      ] })
    ] }),
    currentView === "lobby" && /* @__PURE__ */ jsx(
      QuizLobby,
      {
        role: "student",
        roomCode,
        quizTitle: activeQuiz?.title || "Kuis Kustom",
        onStartGame: () => setCurrentView("game"),
        onCancel: handleCancelLobby,
        studentName,
        setStudentName
      }
    ),
    currentView === "game" && /* @__PURE__ */ jsx(
      QuizGame,
      {
        studentName,
        roomCode,
        onFinish: handleFinishQuiz
      }
    )
  ] }) });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "StudentApp", StudentApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/components/StudentApp.jsx", "client:component-export": "default" })} ` })}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/index.astro", void 0);

const $$file = "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
