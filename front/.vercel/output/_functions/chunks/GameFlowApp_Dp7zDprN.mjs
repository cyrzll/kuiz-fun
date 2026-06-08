import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { Q as QuizLobby } from './QuizLobby_Biae0oZD.mjs';
import { N as NeoModal } from './NeoModal_B1LlZDnY.mjs';
import { g as getBackendUrl } from './api_CsRpSBPJ.mjs';

function GameFlowApp({ slug }) {
  const getRoomCode = () => {
    if (slug) return slug;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("code") || "";
    }
    return "";
  };
  const roomCode = getRoomCode();
  const [room, setRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [modulesData, setModulesData] = useState({});
  const [studentName, setStudentName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isNameSubmitted, setIsNameSubmitted] = useState(false);
  const [step, setStep] = useState("intro");
  const [selectedModulId, setSelectedModulId] = useState("");
  const [materialIdx, setMaterialIdx] = useState(0);
  const [readSlidesGlobal, setReadSlidesGlobal] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [scoreboardStudents, setScoreboardStudents] = useState([]);
  const timerRef = useRef(null);
  const wsRef = useRef(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info", icon: "⚠️", onConfirm: null, onClose: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => {
    if (modal.onClose) {
      modal.onClose();
    }
    setModal((prev) => ({ ...prev, isOpen: false, onConfirm: null, onClose: null }));
  };
  const allModules = Object.values(modulesData);
  const totalMaterialsCount = allModules.reduce((acc, m) => acc + (m.materials?.length || 0), 0);
  const globalProgressPercent = totalMaterialsCount > 0 ? readSlidesGlobal.length / totalMaterialsCount * 100 : 0;
  const modul = modulesData[selectedModulId];
  const materials = modul?.materials || [];
  const activeQuestions = allModules.reduce((acc, m) => [...acc, ...m.questions || []], []);
  const questions = activeQuestions;
  useEffect(() => {
    if (!roomCode) {
      setRoomLoading(false);
      return;
    }
    const loadInitialData = async () => {
      try {
        const roomRes = await fetch(getBackendUrl(`/api/rooms/${roomCode}`));
        if (roomRes.status === 404) {
          setRoom(null);
          setRoomLoading(false);
          return;
        }
        const roomData = await roomRes.json();
        setRoom(roomData);
        setSelectedModulId(roomData.modulId);
        const modulesRes = await fetch(getBackendUrl("/api/modules"));
        const modulesJson = await modulesRes.json();
        setModulesData(modulesJson);
        const savedToken = localStorage.getItem(`quiz_student_token_${roomCode}`);
        if (savedToken) {
          const meRes = await fetch(getBackendUrl("/api/me"), {
            headers: {
              "Authorization": `Bearer ${savedToken}`
            }
          });
          if (meRes.status === 200) {
            const meData = await meRes.json();
            setStudentName(meData.name);
            setIsNameSubmitted(true);
            if (roomData.status === "lobby" && meData.step !== "finished") {
              setStep("lobby");
            } else {
              setStep(meData.step || "select-module");
            }
            if (meData.selectedModulId) setSelectedModulId(meData.selectedModulId);
            setMaterialIdx(meData.materialIdx || 0);
            setCurrentQuestionIdx(meData.currentQuestionIdx || 0);
            setScore(meData.score || 0);
            setReadSlidesGlobal(meData.progress || []);
            connectWebSocket(savedToken);
          } else {
            localStorage.removeItem(`quiz_student_token_${roomCode}`);
            setStep("intro");
          }
        } else {
          setStep("intro");
        }
      } catch (err) {
        console.error("Error loading initial data:", err);
      } finally {
        setRoomLoading(false);
      }
    };
    loadInitialData();
  }, [roomCode]);
  const connectWebSocket = (token) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const ws = new WebSocket(getBackendUrl(`/ws?token=${token}`, true));
    wsRef.current = ws;
    ws.onopen = () => {
      console.log("Student WS Connected successfully");
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("Received WebSocket event:", msg);
        switch (msg.type) {
          case "RESUME_STATE": {
            const d = msg.data;
            if (d.step) setStep(d.step);
            if (d.selectedModulId) setSelectedModulId(d.selectedModulId);
            if (d.materialIdx !== void 0) setMaterialIdx(d.materialIdx);
            if (d.currentQuestionIdx !== void 0) setCurrentQuestionIdx(d.currentQuestionIdx);
            if (d.score !== void 0) setScore(d.score);
            if (d.progress) setReadSlidesGlobal(d.progress);
            if (d.timeLeft !== void 0 && d.step === "quiz") setTimeLeft(d.timeLeft);
            break;
          }
          case "GAME_STARTED": {
            setRoom((prev) => prev ? { ...prev, status: "active" } : prev);
            setStep("select-module");
            break;
          }
          case "ROOM_CANCELLED": {
            showModal({
              title: "Sesi Dibatalkan",
              message: "Sesi kuis telah dibatalkan oleh guru. Anda akan dikembalikan ke halaman beranda.",
              type: "warning",
              icon: "🛑",
              onClose: () => {
                localStorage.removeItem(`quiz_student_token_${roomCode}`);
                window.location.href = "/";
              },
              confirmText: "KEMBALI KE BERANDA"
            });
            break;
          }
          case "QUIZ_QUESTION": {
            setCurrentQuestionIdx(msg.data.questionIdx);
            setTimeLeft(msg.data.timeLeft);
            setIsAnswered(false);
            setSelectedKey(null);
            break;
          }
          case "ANSWER_RESULT": {
            const d = msg.data;
            setIsAnswered(true);
            setSelectedKey((prev) => prev || "TIMEOUT");
            if (d.isCorrect) {
              setCorrectCount((prev) => prev + 1);
            }
            setScore(d.score);
            setTimeout(() => {
              const totalQuestions = Object.values(modulesData).reduce((acc, m) => acc + (m.questions?.length || 0), 0);
              if (d.nextQuestionIdx < totalQuestions) {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: "GET_NEXT_QUESTION" }));
                }
              } else {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({ type: "FINISH_QUIZ" }));
                }
                setStep("finished");
              }
            }, 2500);
            break;
          }
          case "ERROR": {
            showModal({
              title: "Terjadi Kesalahan",
              message: msg.message || "Terjadi kesalahan pada koneksi WebSocket.",
              type: "error",
              icon: "❌"
            });
            break;
          }
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };
    ws.onclose = () => {
      console.log("Student WS Closed.");
    };
  };
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  useEffect(() => {
    if (step !== "quiz") return;
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
  }, [currentQuestionIdx, step]);
  useEffect(() => {
    if (step === "materials" && selectedModulId && materialIdx !== void 0) {
      const slideKey = `${selectedModulId}_${materialIdx}`;
      setReadSlidesGlobal((prev) => {
        if (prev.includes(slideKey)) return prev;
        return [...prev, slideKey];
      });
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "UPDATE_PROGRESS",
          slideKey,
          selectedModulId,
          materialIdx,
          step: "materials"
        }));
      }
    }
  }, [materialIdx, selectedModulId, step]);
  useEffect(() => {
    if (step === "finished" && roomCode) {
      const fetchScoreboard = async () => {
        try {
          const res = await fetch(getBackendUrl(`/api/rooms/${roomCode}/students`));
          const data = await res.json();
          if (Array.isArray(data)) {
            const mapped = data.map((s) => ({
              name: s.name,
              score: s.score,
              isPlayer: s.name === studentName
            }));
            mapped.sort((a, b) => b.score - a.score);
            setScoreboardStudents(mapped);
          }
        } catch (err) {
          console.error("Error fetching scoreboard:", err);
        }
      };
      fetchScoreboard();
      const interval = setInterval(fetchScoreboard, 2500);
      return () => clearInterval(interval);
    }
  }, [step, roomCode, studentName]);
  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedKey("TIMEOUT");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "SUBMIT_ANSWER",
        optionKey: "TIMEOUT"
      }));
    }
  };
  const handleSelectOption = (option) => {
    if (isAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedKey(option.key);
    setIsAnswered(true);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "SUBMIT_ANSWER",
        optionKey: option.key
      }));
    }
  };
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      const res = await fetch(getBackendUrl("/api/rooms/join"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomCode, name: nameInput })
      });
      const data = await res.json();
      if (data.error) {
        showModal({
          title: "Gagal Bergabung",
          message: data.error,
          type: "error",
          icon: "❌"
        });
        return;
      }
      localStorage.setItem(`quiz_student_token_${roomCode}`, data.token);
      setStudentName(data.student.name);
      setIsNameSubmitted(true);
      connectWebSocket(data.token);
      if (room.status === "lobby") {
        setStep("lobby");
      } else {
        setStep("select-module");
      }
    } catch (err) {
      console.error(err);
      showModal({
        title: "Koneksi Gagal",
        message: "Gagal mendaftarkan nama ke server. Pastikan koneksi internet Anda stabil dan coba lagi.",
        type: "error",
        icon: "📡"
      });
    }
  };
  const navigateToSelectModule = () => {
    setStep("select-module");
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "SELECT_MODULE",
        selectedModulId,
        step: "select-module",
        materialIdx: 0
      }));
    }
  };
  const getRankBadge = () => {
    const total = questions.length || 7;
    const ratio = correctCount / total;
    if (ratio === 1) return { name: "Garuda Emas 🥇", desc: "Sempurna! Kamu memahami seluruh materi dengan sangat baik.", color: "bg-neo-yellow text-black" };
    if (ratio >= 0.7) return { name: "Banteng Merdeka 🐂", desc: "Luar Bisa! Pemahaman materi kamu sangat kuat.", color: "bg-neo-pink text-white" };
    if (ratio >= 0.5) return { name: "Pohon Beringin 🌳", desc: "Bagus Sekali! Kamu mengerti dasar-dasar materi.", color: "bg-neo-green text-black" };
    return { name: "Bintang Harapan ⭐", desc: "Ayo belajar lagi materinya dan coba lagi nanti.", color: "bg-neo-blue text-white" };
  };
  if (roomLoading) {
    return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-12 px-4 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full neo-box bg-white p-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-8 w-8 text-neo-blue mx-auto", fill: "none", viewBox: "0 0 24 24", children: [
        /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-700", children: "Menghubungkan ke server kelas..." })
    ] }) });
  }
  if (!room) {
    return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-12 px-4 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full neo-box bg-[#FFE6CC] p-8 text-center space-y-6", children: [
      /* @__PURE__ */ jsx("span", { className: "text-5xl", children: "🛑" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-black uppercase tracking-tight text-black", children: "Room Tidak Ditemukan" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-gray-700 leading-relaxed", children: [
        "Kode room kuis ",
        /* @__PURE__ */ jsx("strong", { className: "underline text-black", children: roomCode }),
        " tidak terdaftar dalam database kami. Silakan cek kembali kodenya!"
      ] }),
      /* @__PURE__ */ jsx("a", { href: "/", className: "w-full py-3 neo-btn bg-neo-pink text-white text-xs block text-center", children: "KEMBALI KE BERANDA 🏠" })
    ] }) });
  }
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl sm:text-4xl bg-neo-yellow p-1.5 neo-border shadow-sm", children: "🇮🇩" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1", children: [
            "PANCASILA ",
            /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow px-1 neo-border shadow-sm border-black", children: "FUN LEARNING" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5", children: [
            "Kamar Kelas: ",
            roomCode,
            " | ",
            room.quizTitle
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            localStorage.removeItem(`quiz_student_token_${roomCode}`);
            window.location.href = "/";
          },
          className: "neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100",
          children: [
            /* @__PURE__ */ jsx("span", { children: "KELUAR KELAS" }),
            /* @__PURE__ */ jsx("span", { children: "🏠" })
          ]
        }
      )
    ] }),
    step === "intro" && !isNameSubmitted && /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto neo-box bg-[#FAF6EE] p-5 sm:p-8 rounded-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "bg-neo-pink text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: [
          "Guru: ",
          room.mentorName
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2", children: "Siapa Namamu? ✏️" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-sm mt-1 font-semibold", children: [
          "Tulis nama lengkapmu untuk memulai sesi belajar & kuis interaktif di sekolah ",
          /* @__PURE__ */ jsx("strong", { className: "underline", children: room.schoolName }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleNameSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold tracking-wider text-black", children: "Nama Lengkap Siswa" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              required: true,
              value: nameInput,
              onChange: (e) => setNameInput(e.target.value),
              placeholder: "Contoh: Rizal Ramadhan",
              className: "w-full p-3 sm:p-4 rounded-none neo-input bg-white text-base sm:text-lg font-bold",
              maxLength: 20
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "submit",
            className: "w-full py-3 sm:py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2 font-black",
            children: [
              /* @__PURE__ */ jsx("span", { children: "MULAI MATERI PEMBELAJARAN" }),
              /* @__PURE__ */ jsx("span", { children: "🔥" })
            ]
          }
        )
      ] })
    ] }),
    step === "lobby" && /* @__PURE__ */ jsx(
      QuizLobby,
      {
        role: "student",
        roomCode,
        quizTitle: room.quizTitle,
        studentName,
        onCancel: () => {
          localStorage.removeItem(`quiz_student_token_${roomCode}`);
          window.location.href = "/";
        }
      }
    ),
    step === "select-module" && room && room.status === "lobby" && /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto space-y-6 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#FFF8E1] p-8 text-center space-y-6", children: [
        /* @__PURE__ */ jsx("div", { className: "relative inline-block", children: /* @__PURE__ */ jsx("span", { className: "text-6xl inline-block", style: { animation: "neoWaitingBounce 1.5s ease-in-out infinite" }, children: "⏳" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm inline-block", children: "Menunggu Guru" }),
          /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black", children: "Tunggu Guru Memulai!" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-semibold text-gray-700 leading-relaxed", children: [
            "Halo ",
            /* @__PURE__ */ jsx("strong", { className: "text-black underline", children: studentName }),
            ", guru belum menekan tombol ",
            /* @__PURE__ */ jsx("strong", { className: "bg-neo-green/20 px-1", children: '"Mulai Pertandingan"' }),
            ". Modul dan kuis akan terbuka otomatis setelah guru memulai sesi."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center gap-2 pt-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-neo-yellow neo-border inline-block", style: { animation: "neoDotPulse 1.2s ease-in-out infinite" } }),
          /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-neo-pink neo-border inline-block", style: { animation: "neoDotPulse 1.2s ease-in-out 0.2s infinite" } }),
          /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-neo-blue neo-border inline-block", style: { animation: "neoDotPulse 1.2s ease-in-out 0.4s infinite" } }),
          /* @__PURE__ */ jsx("span", { className: "w-3 h-3 bg-neo-green neo-border inline-block", style: { animation: "neoDotPulse 1.2s ease-in-out 0.6s infinite" } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-4 text-left space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Room Code" }),
            /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow px-2 py-0.5 neo-border shadow-sm text-black", children: roomCode })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Kuis" }),
            /* @__PURE__ */ jsx("span", { className: "text-black", children: room.quizTitle })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Guru" }),
            /* @__PURE__ */ jsx("span", { className: "text-black", children: room.mentorName })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase", children: [
            /* @__PURE__ */ jsx("span", { className: "text-gray-500", children: "Status" }),
            /* @__PURE__ */ jsx("span", { className: "bg-neo-pink/20 text-neo-pink px-2 py-0.5 neo-border shadow-sm animate-pulse", children: "BELUM DIMULAI" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              localStorage.removeItem(`quiz_student_token_${roomCode}`);
              window.location.href = "/";
            },
            className: "w-full py-3 neo-btn bg-white text-black text-xs font-black",
            children: "KELUAR KELAS 🏠"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("style", { children: `
              @keyframes neoWaitingBounce {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-10px) rotate(-5deg); }
                50% { transform: translateY(0) rotate(0deg); }
                75% { transform: translateY(-5px) rotate(5deg); }
              }
              @keyframes neoDotPulse {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.4); opacity: 1; }
              }
            ` })
    ] }),
    step === "select-module" && room && room.status !== "lobby" && /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#EBF4F6] p-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Progres Belajar Global" }),
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1", children: [
            "Halo ",
            studentName,
            ", Pelajari Semua Modul! 📚"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-xs font-semibold mt-1", children: [
            "Kamu harus membaca seluruh materi di semua modul di bawah (",
            totalMaterialsCount,
            " slide) untuk membuka Kuis Utama Gabungan!"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase", children: [
            /* @__PURE__ */ jsx("span", { children: "📖 Total Materi Dibaca:" }),
            /* @__PURE__ */ jsxs("span", { className: "text-neo-blue", children: [
              Math.round(globalProgressPercent),
              "% Selesai"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "h-6 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-neo-green border-r-[3px] border-black transition-all duration-300",
                style: { width: `${globalProgressPercent}%` }
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-center text-xs font-black text-black select-none", children: [
              readSlidesGlobal.length,
              " dari ",
              totalMaterialsCount,
              " Slide Selesai Dibaca"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2", children: globalProgressPercent < 100 ? /* @__PURE__ */ jsx(
          "button",
          {
            disabled: true,
            type: "button",
            className: "w-full py-4 neo-btn bg-gray-200 text-gray-400 text-sm font-black border-dashed cursor-not-allowed flex items-center justify-center gap-2",
            children: /* @__PURE__ */ jsx("span", { children: "🔒 KUIS UTAMA TERKUNCI (BACA SEMUA MATERI)" })
          }
        ) : /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "START_QUIZ" }));
              }
              setStep("quiz");
            },
            className: "w-full py-4 neo-btn bg-neo-yellow text-black text-sm font-black animate-pulse flex items-center justify-center gap-2 hover:bg-neo-yellow/90",
            children: /* @__PURE__ */ jsxs("span", { children: [
              "🔥 MULAI KUIS UTAMA PANCASILA (",
              questions.length,
              " SOAL) ⚡"
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: allModules.map((m) => {
        const materialsList = m.materials || [];
        const moduleReadCount = materialsList.filter((_, sIdx) => readSlidesGlobal.includes(`${m.id}_${sIdx}`)).length;
        const isModuleFinished = materialsList.length > 0 && moduleReadCount === materialsList.length;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `relative neo-box p-6 flex flex-col justify-between space-y-6 hover:scale-102 transition-transform ${isModuleFinished ? "bg-[#F1FCF6]" : "bg-white"}`,
            children: [
              isModuleFinished && /* @__PURE__ */ jsx("div", { className: "absolute -top-3 -right-3 bg-neo-green text-black font-black text-[10px] px-2.5 py-1 uppercase tracking-wider neo-border shadow-sm rotate-6 z-10 animate-bounce", children: "SELESAI ✅" }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsx("div", { className: "flex justify-between items-start gap-2 flex-wrap", children: /* @__PURE__ */ jsxs("span", { className: `text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border shadow-sm rounded-none ${isModuleFinished ? "bg-neo-green/30 border-neo-green text-green-800" : "bg-neo-yellow/30 border-neo-yellow text-yellow-800"}`, children: [
                  "📂 ",
                  moduleReadCount,
                  "/",
                  materialsList.length,
                  " Materi Dibaca"
                ] }) }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-black uppercase text-black", children: m.title }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-600 leading-relaxed", children: m.description })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    setSelectedModulId(m.id);
                    setMaterialIdx(0);
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify({
                        type: "SELECT_MODULE",
                        selectedModulId: m.id,
                        step: "materials",
                        materialIdx: 0
                      }));
                    }
                    setStep("materials");
                  },
                  className: `w-full py-3 neo-btn text-xs font-black transition-all ${isModuleFinished ? "bg-white text-black hover:bg-gray-100" : "bg-neo-blue text-white hover:bg-neo-blue/90"}`,
                  children: isModuleFinished ? "📖 BACA ULANG MATERI" : "📚 BACA MATERI MODUL"
                }
              )
            ]
          },
          m.id
        );
      }) })
    ] }),
    step === "materials" && modul && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider", children: [
        /* @__PURE__ */ jsxs("span", { className: "bg-neo-blue text-white px-2.5 py-0.5 neo-border text-[10px] font-black", children: [
          "MODUL: ",
          modul.title
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-black", children: [
          "MATERI ",
          materialIdx + 1,
          " / ",
          materials.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-4 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-black uppercase tracking-wide", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-gray-700", children: [
            "📖 Slide Ke ",
            materialIdx + 1,
            " dari ",
            materials.length
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-neo-blue", children: [
            "Progres Global: ",
            Math.round(globalProgressPercent),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "h-5 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-full bg-neo-green border-r-[2px] border-black transition-all duration-300",
              style: { width: `${globalProgressPercent}%` }
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-black text-black", children: [
            "Total Terbaca: ",
            readSlidesGlobal.length,
            " dari ",
            totalMaterialsCount,
            " Slide Modul"
          ] })
        ] })
      ] }),
      materials[materialIdx] && /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 sm:p-10 space-y-6 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 border-b-2 border-black pb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-4xl p-2 bg-[#EBF4F6] neo-border shadow-sm shrink-0", children: materials[materialIdx].icon || "📚" }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl sm:text-2xl font-black uppercase text-black leading-tight", children: materials[materialIdx].title })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm sm:text-base text-gray-800 font-medium leading-relaxed whitespace-pre-line p-2 bg-gray-50 neo-border border-dashed", children: materials[materialIdx].content })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            disabled: materialIdx === 0,
            onClick: () => setMaterialIdx((prev) => prev - 1),
            className: "flex-1 py-4 neo-btn bg-white text-black text-xs disabled:opacity-40 disabled:cursor-not-allowed font-black",
            children: "⬅️ SEBELUMNYA"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: navigateToSelectModule,
            className: "flex-1 py-4 neo-btn bg-neo-pink text-white text-xs font-black",
            children: "📋 PILIH MODUL LAIN"
          }
        ),
        materialIdx < materials.length - 1 ? /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setMaterialIdx((prev) => prev + 1),
            className: "flex-1 py-4 neo-btn bg-neo-blue text-white text-xs font-black",
            children: "LANJUTKAN ➡️"
          }
        ) : /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: navigateToSelectModule,
            className: "flex-1 py-4 neo-btn bg-neo-green text-black text-xs font-black animate-bounce",
            children: "📋 SELESAI BACA & KEMBALI"
          }
        )
      ] })
    ] }),
    step === "quiz" && questions[currentQuestionIdx] && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-6 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center bg-white neo-border px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wider", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs("span", { className: "bg-neo-yellow text-black px-2 py-0.5 neo-border text-[10px] font-black", children: [
          "SOAL ",
          currentQuestionIdx + 1,
          "/",
          questions.length
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "WAKTU:" }),
            /* @__PURE__ */ jsx("span", { className: `w-8 h-8 flex items-center justify-center neo-border text-xs font-black ${timeLeft <= 5 ? "bg-neo-pink text-white animate-bounce" : "bg-white text-black"}`, children: timeLeft })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "SKOR:" }),
            /* @__PURE__ */ jsx("span", { className: "text-neo-blue", children: score })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "neo-box bg-[#FAF6EE] p-6 sm:p-8 rounded-none", children: /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-black uppercase text-black leading-relaxed", children: questions[currentQuestionIdx].question }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-4", children: questions[currentQuestionIdx].options.map((option) => {
        let style = "bg-white hover:bg-[#FAF6EE] cursor-pointer";
        if (isAnswered) {
          if (option.isCorrect) {
            style = "bg-neo-green text-black border-black shadow-sm";
          } else if (selectedKey === option.key) {
            style = "bg-neo-pink text-white border-black shadow-sm";
          } else {
            style = "bg-gray-100 text-gray-400 opacity-60 pointer-events-none";
          }
        }
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleSelectOption(option),
            disabled: isAnswered,
            className: `w-full p-4 text-left font-bold neo-border text-sm sm:text-base flex items-center gap-4 transition-all duration-100 ${style}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "w-7 h-7 shrink-0 rounded-none border-[2px] border-black bg-black text-white flex items-center justify-center text-xs font-extrabold", children: option.key }),
              /* @__PURE__ */ jsx("span", { className: "uppercase tracking-tight leading-tight", children: option.text })
            ]
          },
          option.key
        );
      }) }),
      isAnswered && /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#EBF4F6] p-4 animate-fadeIn", children: [
        /* @__PURE__ */ jsx("h4", { className: "text-xs uppercase font-extrabold text-neo-blue mb-1", children: "💡 Penjelasan Soal" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-700 font-semibold leading-relaxed", children: [
          selectedKey === "TIMEOUT" ? /* @__PURE__ */ jsx("span", { className: "text-red-600 font-bold block mb-1", children: "⏳ Waktu habis!" }) : null,
          questions[currentQuestionIdx].explanation
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-center pt-4", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: navigateToSelectModule,
          className: "px-6 py-3 neo-btn bg-neo-pink text-white text-xs font-black tracking-wider w-full sm:w-auto",
          children: "🛑 BATALKAN KUIS & GANTI MODUL"
        }
      ) })
    ] }),
    step === "finished" && /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto space-y-8 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#E6FFFA] p-6 text-center", children: [
        /* @__PURE__ */ jsx("span", { className: "bg-neo-green text-black text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Evaluasi Kuis" }),
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-black uppercase tracking-tight text-black mt-2", children: "Kuis Selesai! 🎉" }),
        /* @__PURE__ */ jsxs("p", { className: "text-gray-700 text-sm font-semibold mt-1", children: [
          "Hebat ",
          studentName,
          ", kamu telah menyelesaikan seluruh pembelajaran dan kuis untuk Room ",
          roomCode,
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 text-center space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs uppercase font-extrabold tracking-wider text-gray-500", children: "Skor Akhir" }),
            /* @__PURE__ */ jsxs("div", { className: "text-5xl font-black text-neo-blue", children: [
              score,
              " Poin"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm font-extrabold text-black", children: [
              "Benar: ",
              /* @__PURE__ */ jsx("span", { className: "text-neo-green", children: correctCount }),
              " dari ",
              questions.length,
              " Pertanyaan"
            ] }),
            (() => {
              const badge = getRankBadge();
              return /* @__PURE__ */ jsxs("div", { className: `neo-box ${badge.color} p-4 text-center mt-4`, children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-black tracking-widest opacity-80", children: "Gelar Kelulusan" }),
                /* @__PURE__ */ jsx("h4", { className: "text-lg font-black uppercase mt-1", children: badge.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs font-medium mt-2 leading-relaxed", children: badge.desc })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => {
                localStorage.removeItem(`quiz_student_token_${roomCode}`);
                window.location.href = "/";
              },
              className: "w-full py-4 neo-btn bg-neo-yellow text-black text-sm flex items-center justify-center gap-2 font-black",
              children: [
                /* @__PURE__ */ jsx("span", { children: "KEMBALI KE BERANDA" }),
                /* @__PURE__ */ jsx("span", { children: "⚡" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-black uppercase border-b-2 border-black pb-2 text-black flex items-center justify-between", children: /* @__PURE__ */ jsx("span", { children: "🏆 Papan Peringkat Kelas" }) }),
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: scoreboardStudents.map((player, idx) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `neo-box p-3 flex items-center justify-between text-sm ${player.isPlayer ? "bg-neo-yellow/30 border-neo-yellow font-black" : "bg-gray-50"}`,
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
    ] }),
    /* @__PURE__ */ jsx(
      NeoModal,
      {
        isOpen: modal.isOpen,
        onClose: closeModal,
        title: modal.title,
        message: modal.message,
        type: modal.type,
        icon: modal.icon,
        onConfirm: modal.onConfirm,
        confirmText: modal.confirmText || "MENGERTI"
      }
    )
  ] }) });
}

export { GameFlowApp as G };
