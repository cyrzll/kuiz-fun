import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { g as getBackendUrl } from './api_CsRpSBPJ.mjs';

const COLORS = [
  "bg-neo-yellow",
  "bg-neo-pink text-white",
  "bg-neo-blue text-white",
  "bg-neo-green text-white",
  "bg-amber-400",
  "bg-emerald-400",
  "bg-purple-400 text-white",
  "bg-orange-400"
];
function QuizLobby({
  role,
  roomCode,
  quizTitle,
  onStartGame,
  onCancel,
  studentName,
  setStudentName,
  students: propStudents
}) {
  const [nameInput, setNameInput] = useState(studentName || "");
  const [isNameSubmitted, setIsNameSubmitted] = useState(!!studentName);
  const [localStudents, setLocalStudents] = useState([]);
  const [joinUrl, setJoinUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/games?code=${roomCode}`);
    }
  }, [roomCode]);
  const handleCopyLink = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2e3);
  };
  const students = role === "teacher" ? propStudents || [] : localStudents;
  useEffect(() => {
    if (role === "student" && isNameSubmitted && roomCode) {
      const fetchStudents = async () => {
        try {
          const res = await fetch(getBackendUrl(`/api/rooms/${roomCode}/students`));
          const data = await res.json();
          if (Array.isArray(data)) {
            setLocalStudents(data.map((s) => s.name));
          }
        } catch (err) {
          console.error("Error fetching students:", err);
        }
      };
      fetchStudents();
      const interval = setInterval(fetchStudents, 2e3);
      return () => clearInterval(interval);
    }
  }, [role, isNameSubmitted, roomCode]);
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setStudentName(nameInput);
    setIsNameSubmitted(true);
    setLocalStudents((prev) => {
      if (prev.includes(nameInput)) return prev;
      return [...prev, nameInput];
    });
  };
  if (role === "student" && !isNameSubmitted) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-md mx-auto neo-box bg-[#FAF6EE] p-5 sm:p-8 rounded-none", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
        /* @__PURE__ */ jsxs("span", { className: "bg-neo-blue text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: [
          "Room Code: ",
          roomCode
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2", children: "Siapa Namamu? ✏️" }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm mt-1 font-semibold", children: "Tuliskan nama lengkap atau nama panggilanmu agar Guru bisa melihat skormu di papan peringkat." })
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
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pt-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: onCancel,
              className: "flex-1 py-2.5 sm:py-3.5 neo-btn bg-neo-pink text-white text-xs",
              children: "KEMBALI ↩️"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "flex-[2] py-2.5 sm:py-3.5 neo-btn bg-neo-yellow text-black text-xs",
              children: "GABUNG LOBBY 🔥"
            }
          )
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "neo-box bg-[#EBF4F6] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "bg-black text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm mb-2 inline-block", children: "Sesi Kuis Aktif" }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black", children: quizTitle }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-700 text-sm font-semibold mt-1", children: role === "teacher" ? "Menunggu siswa bergabung sebelum memulai..." : `Halo ${nameInput}, mohon tunggu hingga Guru memulai kuis.` })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "neo-box bg-neo-yellow px-6 py-4 flex flex-col items-center justify-center min-w-[150px] h-[92px]", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase font-black text-black tracking-widest", children: "KODE ROOM SISWA" }),
          /* @__PURE__ */ jsx("p", { className: "text-4xl font-black tracking-widest text-black mt-1", children: roomCode })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowQrModal(true),
            className: "neo-box bg-white p-3 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 border-2 border-black cursor-pointer h-[92px] w-[92px] transition-all hover:-translate-y-0.5 active:translate-y-0",
            title: "Tampilkan QR Code",
            children: [
              joinUrl ? /* @__PURE__ */ jsx(QRCodeSVG, { value: joinUrl, size: 50, includeMargin: false }) : /* @__PURE__ */ jsx("div", { className: "w-[50px] h-[50px] bg-gray-200 animate-pulse" }),
              /* @__PURE__ */ jsx("span", { className: "text-[8px] font-black uppercase text-black tracking-wider", children: "QR CODE 📱" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center border-b-2 border-black pb-2", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-xl font-black uppercase tracking-tight text-black flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { children: "👥" }),
            " Siswa di Lobby (",
            students.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx("span", { className: "animate-pulse bg-neo-green text-black border border-black text-[10px] font-black px-2 py-0.5 uppercase tracking-wide", children: "Mencari Koneksi..." })
        ] }),
        students.length === 0 ? /* @__PURE__ */ jsx("div", { className: "neo-box bg-white p-12 text-center text-gray-500 font-bold uppercase text-sm border-dashed", children: "Belum ada siswa yang masuk..." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: students.map((student, idx) => {
          const colorClass = COLORS[idx % COLORS.length];
          const isMe = student === nameInput;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: `neo-box ${colorClass} p-3.5 flex items-center justify-between font-black uppercase tracking-tight text-sm text-center relative hover:scale-102 transition-transform animate-fadeIn`,
              children: [
                /* @__PURE__ */ jsx("span", { className: "truncate", children: student }),
                isMe && /* @__PURE__ */ jsx("span", { className: "absolute -top-2.5 -left-2 bg-black text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-wider neo-border shadow-sm", children: "SAYA" }),
                /* @__PURE__ */ jsx("span", { children: "⚡" })
              ]
            },
            student
          );
        }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "neo-box bg-white p-6 space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-black uppercase border-b-2 border-black pb-2", children: "Status Sesi" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-xs font-bold text-gray-700", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Peran Anda:" }),
            /* @__PURE__ */ jsx("span", { className: "bg-black text-white px-2 py-0.5 text-[10px] uppercase font-black", children: role === "teacher" ? "GURU / MENTOR" : "SISWA" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { children: "Metode Join:" }),
            /* @__PURE__ */ jsx("span", { className: "underline", children: "Kode Kuis 6 Digit" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-2 space-y-3", children: role === "teacher" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: onStartGame,
              disabled: students.length === 0,
              className: "w-full py-4 neo-btn bg-neo-green text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
              children: [
                /* @__PURE__ */ jsx("span", { children: "MULAI PERTANDINGAN" }),
                /* @__PURE__ */ jsx("span", { children: "🔥" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: onCancel,
              className: "w-full py-2.5 neo-btn bg-neo-pink text-white text-xs",
              children: "BATALKAN SESI 🛑"
            }
          )
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center p-3 bg-neo-yellow/15 neo-border border-neo-yellow text-xs font-bold text-amber-900 leading-relaxed", children: [
          "⏳ Menunggu guru menekan tombol ",
          /* @__PURE__ */ jsx("strong", { children: "Mulai Pertandingan" }),
          " untuk memicu kuis di layar Anda."
        ] }) })
      ] }) })
    ] }),
    showQrModal && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn", children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-lg bg-[#FDFBF7] neo-box p-6 sm:p-8 space-y-6 text-center animate-fadeIn", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowQrModal(false),
          className: "absolute -top-3 -right-3 w-10 h-10 bg-neo-pink text-white font-black neo-border text-lg flex items-center justify-center hover:bg-neo-pink/90 transition-transform active:translate-y-0.5 cursor-pointer",
          children: "✕"
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "bg-neo-blue text-white text-xs font-black px-3 py-1 uppercase tracking-wider neo-border shadow-sm inline-block", children: "Pindai Untuk Bergabung 📱" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-2", children: "QR CODE MASUK ROOM" }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs font-bold text-gray-500 uppercase tracking-widest mt-1", children: [
          "Kuis: ",
          quizTitle
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-neo-yellow neo-box p-4 flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-black", children: "KODE ROOM SISWA" }),
        /* @__PURE__ */ jsx("span", { className: "text-4xl font-black tracking-widest text-black mt-1", children: roomCode })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-center py-2", children: /* @__PURE__ */ jsx("div", { className: "bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]", children: joinUrl ? /* @__PURE__ */ jsx(QRCodeSVG, { value: joinUrl, size: 220, includeMargin: false }) : /* @__PURE__ */ jsx("div", { className: "w-[220px] h-[220px] bg-gray-200 animate-pulse" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-black uppercase text-gray-500 text-left", children: "Link Pendaftaran Siswa:" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              readOnly: true,
              value: joinUrl,
              className: "flex-1 p-2.5 text-xs font-mono font-bold bg-white neo-input select-all text-black"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleCopyLink,
              className: `px-4 py-2 text-xs font-black neo-btn cursor-pointer ${copied ? "bg-neo-green text-black" : "bg-neo-blue text-white"}`,
              children: copied ? "DISALIN! 📋" : "SALIN LINK 🔗"
            }
          )
        ] })
      ] }),
      joinUrl.includes("localhost") && /* @__PURE__ */ jsx("div", { className: "bg-neo-pink/15 text-red-700 text-[10px] font-extrabold p-3 border-2 border-red-700 uppercase text-left leading-relaxed", children: "⚠️ PERINGATAN KONEKSI LAN: Anda saat ini menggunakan 'localhost'. Siswa di HP tidak akan bisa memindai jika URL QR Code memakai 'localhost'. Buka web ini menggunakan IP LAN Anda (contoh: http://192.168.x.x:4321/auth) agar QR Code bisa dipindai siswa!" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setShowQrModal(false),
          className: "w-full py-3 neo-btn bg-white text-black text-xs font-black cursor-pointer",
          children: "TUTUP MODAL QR ✕"
        }
      )
    ] }) })
  ] });
}

export { QuizLobby as Q };
