import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_DqHlnE6_.mjs';
import { $ as $$Layout } from './Layout_stwwPH4h.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { Q as QuizLobby } from './QuizLobby_Biae0oZD.mjs';
import { N as NeoModal } from './NeoModal_B1LlZDnY.mjs';
import { g as getBackendUrl } from './api_CsRpSBPJ.mjs';

function MentorRoomApp({ slug }) {
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [currentView, setCurrentView] = useState("lobby");
  const [monitorStudents, setMonitorStudents] = useState([]);
  const wsRef = useRef(null);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info", icon: "⚠️", onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("quiz_mentor_profile");
      if (!savedUser) {
        window.location.href = "/auth";
        return;
      }
      setUser(JSON.parse(savedUser));
      const savedRoomCode = localStorage.getItem("quiz_mentor_room_code") || "";
      if (savedRoomCode === slug) {
        const savedView = localStorage.getItem("quiz_mentor_view") || "lobby";
        setCurrentView(savedView);
        const savedActiveQuiz = localStorage.getItem("quiz_mentor_active_quiz");
        if (savedActiveQuiz) {
          try {
            setActiveQuiz(JSON.parse(savedActiveQuiz));
          } catch (e) {
            console.error(e);
          }
        }
      }
      const verifyRoom = async () => {
        try {
          const roomRes = await fetch(getBackendUrl(`/api/rooms/${slug}`));
          if (roomRes.status === 404) {
            showModal({
              title: "Room Tidak Ditemukan",
              message: `Room kuis dengan kode ${slug} tidak ditemukan dalam database.`,
              type: "error",
              icon: "❌",
              onConfirm: () => {
                window.location.href = "/mentor";
              },
              confirmText: "KEMBALI KE DASHBOARD"
            });
            setRoomLoading(false);
            return;
          }
          const roomData = await roomRes.json();
          setRoom(roomData);
          if (roomData.status === "active") {
            setCurrentView("monitor");
            localStorage.setItem("quiz_mentor_view", "monitor");
          }
          if (!activeQuiz) {
            setActiveQuiz({
              title: roomData.quizTitle,
              id: roomData.modulId === "modul_pancasila_dasar" ? "1" : roomData.modulId === "modul_gotong_royong" ? "2" : roomData.modulId === "modul_sejarah_pancasila" ? "3" : "4"
            });
          }
        } catch (err) {
          console.error(err);
          showModal({
            title: "Koneksi Gagal",
            message: "Gagal memverifikasi status room dari server backend.",
            type: "error",
            icon: "📡"
          });
        } finally {
          setRoomLoading(false);
        }
      };
      verifyRoom();
    }
  }, [slug]);
  useEffect(() => {
    if (user && slug && !roomLoading && room) {
      const wsUrl = getBackendUrl(`/ws?role=teacher&roomCode=${slug}`, true);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log("Teacher WS connected for room:", slug);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "MONITOR_UPDATE") {
            setMonitorStudents(msg.data);
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };
      ws.onerror = (err) => {
        console.error("WS Error:", err);
      };
      ws.onclose = () => {
        console.log("Teacher WS closed");
      };
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      };
    }
  }, [user, slug, roomLoading, room]);
  const handleStartGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "START_GAME" }));
    }
    setCurrentView("monitor");
    if (typeof window !== "undefined") {
      localStorage.setItem("quiz_mentor_view", "monitor");
    }
  };
  const handleCancelLobby = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "CANCEL_GAME" }));
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("quiz_mentor_room_code");
      localStorage.removeItem("quiz_mentor_active_quiz");
      localStorage.removeItem("quiz_mentor_view");
      window.location.href = "/mentor";
    }
  };
  if (roomLoading || !user) {
    return /* @__PURE__ */ jsxs("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 flex items-center justify-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full neo-box bg-white p-8 text-center space-y-4", children: [
        /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-8 w-8 text-neo-blue mx-auto", fill: "none", viewBox: "0 0 24 24", children: [
          /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
          /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-700", children: "Menghubungkan ke room kuis..." })
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
    ] });
  }
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-8 animate-fadeIn", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col sm:flex-row justify-between items-center bg-white neo-box p-4 sm:px-6 sm:py-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-3xl sm:text-4xl bg-neo-pink p-1.5 neo-border shadow-sm text-white", children: "🔑" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-xl sm:text-2xl font-black uppercase tracking-tight text-black flex items-center gap-1", children: [
            "PORTAL ",
            /* @__PURE__ */ jsx("span", { className: "bg-neo-pink text-white px-1.5 neo-border shadow-sm border-black", children: "MENTOR / GURU" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5", children: "Dashboard Manajemen Kelas & Pembuat Kuis" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            window.location.href = "/mentor";
          },
          className: "neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100",
          children: [
            /* @__PURE__ */ jsx("span", { children: "KEMBALI KE DASHBOARD" }),
            /* @__PURE__ */ jsx("span", { children: "📂" })
          ]
        }
      )
    ] }),
    currentView === "lobby" && /* @__PURE__ */ jsx(
      QuizLobby,
      {
        role: "teacher",
        roomCode: slug,
        quizTitle: activeQuiz?.title || room?.quizTitle || "Kuis Kustom",
        onStartGame: handleStartGame,
        onCancel: handleCancelLobby,
        students: monitorStudents.map((s) => s.name)
      }
    ),
    currentView === "monitor" && /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-fadeIn", children: [
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-yellow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "bg-neo-pink text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Live Monitoring 🔴" }),
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-black uppercase tracking-tight text-black", children: "Kuis Sedang Berlangsung" }),
          /* @__PURE__ */ jsxs("p", { className: "text-black font-semibold text-sm mt-1", children: [
            "Melihat kemajuan siswa secara real-time pada kuis: ",
            /* @__PURE__ */ jsx("span", { className: "underline decoration-2", children: activeQuiz?.title || room?.quizTitle }),
            " (Room: ",
            slug,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleCancelLobby,
            className: "neo-btn bg-neo-pink text-white px-6 py-3 text-sm shrink-0 w-full md:w-auto",
            children: "SELESAIKAN SESI KELAS 🛑"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 space-y-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-black uppercase border-b-2 border-black pb-2 text-black", children: "Progress Pengerjaan Siswa" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-6", children: monitorStudents.map((s) => {
          const percent = s.step === "quiz" ? Math.round(s.currentQuestionIdx / 7 * 100) : s.progressPercent || 0;
          const isDone = s.isFinished;
          let statusText = "Memilih Modul";
          if (isDone) {
            statusText = "SELESAI 🎉";
          } else if (s.step === "quiz") {
            statusText = `Kuis: Soal ${s.currentQuestionIdx + 1}/7`;
          } else if (s.step === "materials") {
            statusText = `Membaca Slide (${s.progressPercent}%)`;
          }
          return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm font-extrabold uppercase", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { children: "👤" }),
                " ",
                s.name
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs", children: [
                isDone ? /* @__PURE__ */ jsx("span", { className: "bg-neo-green text-black px-2 py-0.5 text-[10px] neo-border font-black", children: statusText }) : /* @__PURE__ */ jsx("span", { className: "bg-gray-100 text-black px-2 py-0.5 text-[10px] neo-border font-black", children: statusText }),
                /* @__PURE__ */ jsxs("span", { className: "ml-3 text-neo-blue", children: [
                  s.score,
                  " pts"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "h-6 w-full neo-border bg-gray-100 rounded-none overflow-hidden relative", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "h-full bg-neo-yellow border-r-[3px] border-black transition-all duration-500",
                  style: { width: `${percent}%` }
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-black text-black select-none", children: [
                Math.round(percent),
                "%"
              ] })
            ] })
          ] }, s.name);
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-center p-4 bg-neo-blue/10 neo-border text-xs font-bold text-blue-900", children: [
        "💡 Ini adalah sesi live di layar kelas Anda. Minta siswa membuka situs ini di HP/Laptop mereka, lalu masukkan kode room kuis: ",
        /* @__PURE__ */ jsx("strong", { className: "underline text-black", children: slug }),
        "."
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

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const { slug } = Astro2.params;
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MentorRoomApp", MentorRoomApp, { "client:load": true, "slug": slug, "client:component-hydration": "load", "client:component-path": "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/components/MentorRoomApp.jsx", "client:component-export": "default" })} ` })}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/mentor/quiz/[slug]/index.astro", void 0);

const $$file = "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/mentor/quiz/[slug]/index.astro";
const $$url = "/mentor/quiz/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
