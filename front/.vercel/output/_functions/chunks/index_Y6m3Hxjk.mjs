import { c as createComponent } from './astro-component_SqnoASqX.mjs';
import 'piccolore';
import { o as renderComponent, k as renderTemplate } from './entrypoint_DqHlnE6_.mjs';
import { $ as $$Layout } from './Layout_stwwPH4h.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { N as NeoModal } from './NeoModal_B1LlZDnY.mjs';
import { g as getBackendUrl } from './api_CsRpSBPJ.mjs';

const INITIAL_QUIZZES = [
  { id: "1", title: "Pancasila Fun Learning: Sila 1-5", questions: 5, category: "Civics", difficulty: "Mudah" },
  { id: "2", title: "Gotong Royong & Kebhinekaan", questions: 8, category: "Civics", difficulty: "Sedang" },
  { id: "3", title: "Sejarah Lahirnya Pancasila", questions: 10, category: "Sejarah", difficulty: "Sulit" },
  { id: "4", title: "Norma, Hak, & Kewajiban Kelas 6", questions: 5, category: "Civics", difficulty: "Sedang" }
];
function TeacherDashboard({ user, onLogout, onLaunchLobby }) {
  const [quizzes, setQuizzes] = useState(INITIAL_QUIZZES);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestionsCount, setNewQuestionsCount] = useState(5);
  const [showAddForm, setShowAddForm] = useState(false);
  const handleCreateQuiz = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const newQuiz = {
      id: String(quizzes.length + 1),
      title: newTitle,
      questions: parseInt(newQuestionsCount),
      category: "Pancasila Custom",
      difficulty: "Sedang"
    };
    setQuizzes([newQuiz, ...quizzes]);
    setNewTitle("");
    setShowAddForm(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-yellow p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "bg-black text-white text-xs font-extrabold px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Ruang Mentor" }),
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl font-black uppercase tracking-tight", children: [
          "Halo, ",
          user.name,
          "! 📚"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-black font-semibold text-sm mt-1", children: [
          "Instansi: ",
          /* @__PURE__ */ jsx("span", { className: "underline decoration-2", children: user.schoolName })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onLogout,
          className: "neo-btn bg-neo-pink text-white px-5 py-2.5 text-sm",
          children: "KELUAR AKUN 🚪"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#E6FFFA] p-6 max-w-xs", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase font-extrabold tracking-wider text-gray-700", children: "Total Kuis Aktif" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-2 mt-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-4xl font-black", children: quizzes.length }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-teal-800", children: "Kuis Siap Pakai" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black uppercase tracking-tight", children: "📂 Daftar Kuis Pancasila" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setShowAddForm(!showAddForm),
              className: "neo-btn bg-neo-green text-white px-4 py-2 text-xs",
              children: showAddForm ? "BATALKAN" : "BUAT KUIS BARU +"
            }
          )
        ] }),
        showAddForm && /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateQuiz, className: "neo-box bg-[#FAF6EE] p-5 space-y-4 animate-fadeIn", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-extrabold uppercase text-sm border-b-[2px] border-black pb-2", children: "⚙️ Parameter Kuis Baru" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold text-black", children: "Judul Kuis" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  required: true,
                  value: newTitle,
                  onChange: (e) => setNewTitle(e.target.value),
                  placeholder: "Contoh: Kuis Gotong Royong Kelas 5",
                  className: "w-full p-2.5 rounded-none neo-input bg-white text-base sm:text-sm"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("label", { className: "block text-xs uppercase font-extrabold text-black", children: "Jumlah Pertanyaan" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  value: newQuestionsCount,
                  onChange: (e) => setNewQuestionsCount(e.target.value),
                  className: "w-full p-2.5 rounded-none neo-input bg-white text-base sm:text-sm",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: 5, children: "5 Pertanyaan" }),
                    /* @__PURE__ */ jsx("option", { value: 10, children: "10 Pertanyaan" }),
                    /* @__PURE__ */ jsx("option", { value: 15, children: "15 Pertanyaan" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "w-full py-2.5 neo-btn bg-neo-yellow text-black text-xs", children: "SIMPAN KAMPANYE KUIS BARU" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: quizzes.map((quiz) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "neo-box bg-white p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:translate-x-1 transition-all",
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-1.5 flex-wrap", children: [
                  /* @__PURE__ */ jsx("span", { className: "bg-neo-yellow/20 text-yellow-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-yellow-800 shadow-sm rounded-none", children: quiz.category }),
                  /* @__PURE__ */ jsx("span", { className: "bg-neo-pink/20 text-red-800 text-[10px] font-black px-2 py-0.5 uppercase tracking-wide neo-border border-red-800 shadow-sm rounded-none", children: quiz.difficulty })
                ] }),
                /* @__PURE__ */ jsx("h3", { className: "text-lg font-black uppercase text-black", children: quiz.title }),
                /* @__PURE__ */ jsxs("p", { className: "text-gray-600 text-xs mt-0.5 font-medium", children: [
                  "Total: ",
                  /* @__PURE__ */ jsxs("strong", { className: "text-black", children: [
                    quiz.questions,
                    " Soal"
                  ] }),
                  " | Berbasis Standar Kurikulum Merdeka"
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-2 w-full sm:w-auto", children: /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => onLaunchLobby(quiz),
                  className: "flex-1 sm:flex-none neo-btn bg-neo-green text-white px-5 py-3 text-sm flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx("span", { children: "MULAI ROOM" }),
                    /* @__PURE__ */ jsx("span", { children: "🚀" })
                  ]
                }
              ) })
            ]
          },
          quiz.id
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-black uppercase tracking-tight", children: "📢 Informasi Sesi" }),
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-pink/10 p-6 space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-md font-black uppercase border-b-2 border-black pb-2 text-neo-pink", children: "Panduan Guru Kuis" }),
          /* @__PURE__ */ jsxs("ul", { className: "text-xs font-bold text-gray-800 space-y-3", children: [
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neo-pink", children: "1." }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Pilih salah satu kuis Pancasila di samping lalu tekan tombol ",
                /* @__PURE__ */ jsx("strong", { children: "MULAI ROOM" }),
                "."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neo-pink", children: "2." }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Bagikan ",
                /* @__PURE__ */ jsx("strong", { children: "6 digit kode kuis" }),
                " yang muncul kepada siswa Anda."
              ] })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neo-pink", children: "3." }),
              /* @__PURE__ */ jsx("span", { children: "Siswa akan mengetik kode tersebut di HP/Laptop mereka dan menuliskan nama lengkap mereka." })
            ] }),
            /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-neo-pink", children: "4." }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Ketika semua siswa sudah masuk ke lobby, klik ",
                /* @__PURE__ */ jsx("strong", { children: "MULAI PERTANDINGAN" }),
                " untuk memulai kuis secara serempak!"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-blue/10 p-6 space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-md font-black uppercase text-neo-blue", children: "Butuh Materi Pembelajaran?" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-700 font-semibold leading-relaxed", children: "Anda memiliki file materi Pancasila di direktori kuis! Silakan gunakan materi kuis Pancasila Fun Learning untuk memperkaya soal buatan Anda." })
        ] })
      ] })
    ] })
  ] });
}

function MentorDashboardApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, title: "", message: "", type: "info", icon: "⚠️", onConfirm: null });
  const showModal = (opts) => setModal({ isOpen: true, ...opts });
  const closeModal = () => setModal((prev) => ({ ...prev, isOpen: false, onConfirm: null }));
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("quiz_mentor_profile");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error(e);
          localStorage.removeItem("quiz_mentor_profile");
          window.location.href = "/auth";
        }
      } else {
        window.location.href = "/auth";
      }
      setLoading(false);
    }
  }, []);
  const handleTeacherLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quiz_mentor_profile");
      localStorage.removeItem("quiz_mentor_view");
      localStorage.removeItem("quiz_mentor_room_code");
      localStorage.removeItem("quiz_mentor_active_quiz");
      window.location.href = "/auth";
    }
  };
  const handleLaunchLobby = async (quiz) => {
    let dbModulId = "modul_pancasila_dasar";
    if (quiz.id === "2") dbModulId = "modul_gotong_royong";
    else if (quiz.id === "3") dbModulId = "modul_sejarah_pancasila";
    else if (quiz.id === "4") dbModulId = "modul_norma_hak_kewajiban";
    try {
      const res = await fetch(getBackendUrl("/api/rooms"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          quizTitle: quiz.title,
          modulId: dbModulId,
          mentorName: user.name,
          schoolName: user.schoolName
        })
      });
      const data = await res.json();
      if (data.error) {
        showModal({
          title: "Gagal Membuat Room",
          message: "Error saat membuat room: " + data.error,
          type: "error",
          icon: "❌"
        });
        return;
      }
      localStorage.setItem("quiz_mentor_room_code", data.roomCode);
      localStorage.setItem("quiz_mentor_active_quiz", JSON.stringify(quiz));
      localStorage.setItem("quiz_mentor_view", "lobby");
      window.location.href = `/mentor/quiz/${data.roomCode}`;
    } catch (err) {
      console.error(err);
      showModal({
        title: "Koneksi Gagal",
        message: "Gagal terhubung ke server backend untuk membuat room. Pastikan server berjalan dan coba lagi.",
        type: "error",
        icon: "📡"
      });
    }
  };
  if (loading || !user) {
    return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-[#FDFBF7] bg-grid-pattern py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md w-full neo-box bg-white p-8 text-center space-y-4", children: [
      /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-8 w-8 text-neo-blue mx-auto", fill: "none", viewBox: "0 0 24 24", children: [
        /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
        /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-700", children: "Memeriksa autentikasi..." })
    ] }) });
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
        "a",
        {
          href: "/",
          className: "neo-btn bg-white text-black text-xs px-4 py-2.5 font-black uppercase tracking-wider flex items-center gap-2 hover:bg-gray-100",
          children: [
            /* @__PURE__ */ jsx("span", { children: "BERANDA SISWA" }),
            /* @__PURE__ */ jsx("span", { children: "🏠" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx(
      TeacherDashboard,
      {
        user,
        onLogout: handleTeacherLogout,
        onLaunchLobby: handleLaunchLobby
      }
    ),
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
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "MentorDashboardApp", MentorDashboardApp, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/components/MentorDashboardApp.jsx", "client:component-export": "default" })} ` })}`;
}, "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/mentor/index.astro", void 0);

const $$file = "/Users/rizal/Documents/tugas/pend pancasila/quiz/front/src/pages/mentor/index.astro";
const $$url = "/mentor";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
